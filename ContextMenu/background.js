var TopMenuId = "open-tab-in-group-window";
browser.contextMenus.create({
  id: TopMenuId,
  title: "Open tab in group window", 
  contexts: ["link", "tab"]
});


var Menus = {};

function mkWindowMenuItems()
{

    let p = browser.windows.getAll();
    p.then(wins => wins.forEach(mkWindowMenuItem));
}

function mkWindowMenuItem(win)
{
    // store result  in a dictionary so can remove it when window is destroyed.
    let id = win.id.toString();
    Menus[id] = browser.contextMenus.create({
	id: id,
	parentId: TopMenuId,
	title: "Open tab in " + win.title +  " window", 
	contexts: ["link", "tab"]
    });
    
}

// remove a menu item when window destroyed.


browser.contextMenus.onClicked.addListener(function(info, tab) {
    console.log("info: "+  JSON.stringify(Object.keys(info)));
    console.log("info2: "+  JSON.stringify(Object.keys(tab)));
    console.log("url " + info.linkUrl);
    let p;
  switch (info.menuItemId) {
  case "open-tab-in-group-window":
      console.log("hi there " + info);
      p = browser.windows.create( { url: "about:blank", focused: true } );
      p.then( (win) => browser.tabs.move(tab.id, {windowId: win.id, index: 0}).then(
	           browser.tabs.query({windowId: win.id}).then(
   		       (tabs) => browser.tabs.remove( tabs[tabs.length-1].id )))
	    );
      break;
  default:
      let winId = parseInt(info.menuItemId);
      console.log("sending tab to " + winId);
      if(info.linkUrl)
	  p = browser.tabs.create( { windowId: winId, url: info.linkUrl } );
      else
	  p = browser.tabs.move(tab.id,  { windowId: winId, index: -1 } );	  
      p.then( () => console.log("success"),  () => console.log("failure"));
  }
});


mkWindowMenuItems();


var SubjectWindows = {};
// monitor window closure so that we remove a window from this dictionary.

function handleKeyCommand(command)
{
    console.log("command = " + JSON.stringify(command));

    /* get the currently active tab first as, if we open a new window, that tab will be
       the active one.
       After we get the active tab, then look for a window with a title prefix given by command.
       if we have already found it,
          + √ we move the tab to it
	  + make the window active
	  + make the tab active.
       if not, we create it with the tab as the new occupant.
    
     Note: tabs.getCurrent() is for the tab running the extension code. There isn't one for this background script.
    */
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
	.then(tabs => browser.tabs.get(tabs[0].id))
	.then( t => {
	    // getWindowByPrefix(command)
	    // .then(w => {
	    w = SubjectWindows[command];
	    if(w === undefined) 
		browser.windows.create({tabId: t.id, titlePreface: command + ": "}).then(w => SubjectWindows[command] = w)
	    else
		browser.tabs.move(t.id, { windowId: w.id, index: -1})
	    return(t)
	})
        .then(t => showTab2(t))
    	.catch(err => console.log("failed to move and show current tab to window : " + err));
    
/*    
    switch(command.) {
    case "":
	break;
    default:
	break;
    }
*/
}

function moveCurrentTabToWindow(win)
{
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
	.then(tabs => browser.tabs.get(tabs[0].id))
	.then( t => {
	    console.log("got current tab " + JSON.stringify(t));
	    browser.tabs.move(t.id, {windowId: win.id, index: -1});
	})
	.catch(err => console.log("failed to move current tab to window " + win.id + " " + win.title + ": " + err));
}

function getWindowByPrefix(prefix)
{
   return  browser.windows.getAll()
	        .then( wins => { let rx = new RegExp("^"+ prefix);
			 for(let w of wins) {
			     if(rx.test(w.titlePreface)) {
				 console.log("found window for " + prefix + " " + w.title + " " + w.titlePreface);
				 return(w);
			     }
			 }

			 return(undefined);
		       })
}


function showTab2(tab, window)
{
    console.log("showTab2: " + tab);
    
    browser.tabs.update(tab.id, {active: true});
    console.log("showTab2: " + tab.windowId);

					  // if the tab is not in the current window, bring that window to the front.
    if(window && !window.active)
	chrome.windows.update(window.id, {focused: true});
    else
	chrome.windows.update(tab.windowId, {focused: true});
}


// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands

browser.commands.onCommand.addListener(handleKeyCommand);