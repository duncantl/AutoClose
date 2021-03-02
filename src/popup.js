// use strict


// determine whether u is an element of urls or matches one of the rx elements.
function inURLs(u, urls, rx) {

    var i = 0;
    for(i = 0; i < urls.length; i++) {
	if(urls[i] == u) {
	    console.log("found " + u);
	    return true;
	}
    }

    for(i = 0; i < rx.length; i++) {
	if(u.match(rx[i])) {
	    console.log("matched rx: " + u + " with " + rx[i]);
	    return true;
	}
    }    

    return(false);
}


// close each of the tabs in TargetTabs. This is a hash table
// indexed by URL and each element is an array of tab objects.
// so group by URL and potentially multiple tabs.
function closeTargetTabs(tabs = TargetTabs, leaveOne = LeaveOne)
{
    for(var k in tabs) {
	var utabs = tabs[k];
	// if(leaveOne && tabs[k].length > 1) console.log("closing tabs for " + tabs[0].url);
	for(var i = leaveOne ? 1 : 0; i < utabs.length; i++) {
	    chrome.tabs.remove( utabs[i].id);
	}
	tabs[k] = null;
    }
    return(tabs);
}


// Move the tabs in TargetTabs to a new window.
function groupTargetTabs()
{
    chrome.windows.create({}, function(win) {
	console.log('Created new window ' + win + " " + win.type);
	//XXX remove the first tab that was created automatically for this new window.
	var ctr = -1;
	var tids = [];
	
	for(var k in TargetTabs) {
	    var tabs = TargetTabs[k];
	    for(var i = 0; i < tabs.length; i++) {
		//chrome.tabs.move( [ tabs[i].id ], {windowId: win.id, index: 0});
		tids.push(tabs[i].id);
		console.log("moving " + tabs[i].id + " " + tabs[i].url + " to " + win.id);
	    }
	    TargetTabs[k] = null;
	}
	// works sometimes
	chrome.tabs.move( tids, {windowId: win.id, index: 0});// .then(function(tab) { console.log("moved " + tab.id);},
							      //       function(err) { console.log("error moving " + err);}) 
    });
}




// Run directly in the body of the page to build the menu.
// We could defer and let the user select which of the tasks to do and then do these computations.

let utable = document.getElementById('urlTBBody');
let TargetTabs = {};
let LeaveOne = false;

chrome.storage.sync.get(['urls', 'LeaveOne', 'Regexps'], function(data) {
  // alert('in setting urls ' + data);
    var i;
    var urls = data.urls.split('\n');
    console.log(' Got urls ' + urls.join(', '));
    var rx = data.Regexps.split('\n');

    //{populate:true}

    LeaveOne = data.LeaveOne;

    chrome.windows.getAll({populate: true}, function(windows){
	windows.forEach( function(window){
	    window.tabs.forEach(function(tab){
		//		console.log(tab.url);
		if(inURLs(tab.url, urls, rx)) {
		    addURLTabToTable(tab.url, tab);
		}
	    });
	});
    });
//    chrome.windows.query(true, function(tabs) {
//	console.log(" got tabs");
//    });
    
/*
    for(i = 0; i < data.urls.length; i++) {
	var u = data.urls[i];
	console.log("processing " + u);
	let tr = document.createElement("tr");
	let th = document.createElement("th");
	let tmp = document.createElement("input");
	tmp.setAttribute("type", "checkbox");
	th.appendChild(tmp);
	tr.appendChild(th);

	th = document.createElement("th");
	th.innerHTML = u;
	tr.appendChild(th);
	
	utable.appendChild(tr);
    }
*/
});



function processRX(rx, exact)
{
//    console.log('processRX ' + rx + ' ' + exact + ' ' + (typeof exact) );

    
    // consolidate with above into a parameterizable function
    var utable = clearTable();
    TargetTabs = {};

    var match = false;
    
    chrome.windows.getAll({populate: true},function(windows){
	windows.forEach(function(window){
	    window.tabs.forEach(function(tab){
		match = exact ? (tab.url == rx) : tab.url.match(rx); 
		console.log(tab.url + ' ' +  match);
		if(match) {
		    addURLTabToTable(tab.url, tab);
		}

	    });
	});
    });    
}


/*
  Before we create the table's entries, ensure it is empty.
*/
function clearTable()
{
    var tb = document.getElementById("urlTBBody");
    tb.innerHTML = '';
	/*
    while (tb.firstChild) {
	tb.removeChild(tb.firstChild);
    }*/
    return tb;
}




/*
  This is a general version that takes a predicate function and determines if the url matches.
*/
function filterTabs(predFun)
{
        chrome.windows.getAll({populate: true},function(windows){
	windows.forEach(function(window){
	    window.tabs.forEach(function(tab){
		//		console.log(tab.url);
		if(predFun(tab)) {  // e.g. pred = function(tab) tab.url.match(rx)
		    console.log(tab.url + "  matches");
		    addURLTabToTable(tab.url, tab);
		}
	    });
	  });
	});    
    

}

// could just pass tab and get its tab.url !
function addURLTabToTable(url, tab)
{
    let tr = document.createElement("tr");
    th = document.createElement("th");
    th.setAttribute('align', 'left');
    var a = document.createElement("a");
    a.innerHTML = url;
    a.setAttribute('class', "TabLink");
//    a.setAttribute('href', url);
    a.addEventListener('click', function() { showTab2(tab); });
    th.appendChild(a);
    tr.appendChild(th);
    utable.appendChild(tr);

    var tmp = TargetTabs[url];
    if(tmp == null) 
	tmp = [];
    tmp.push(tab);
    TargetTabs[url] = tmp;
    return(url);
}

// see showTab2() below.
function showTab(tab)
{
    console.log("Showing tab " + tab.url + " " + tab.id);
    chrome.tabs.update(tab.id, {active: true});
    chrome.windows.update(tab.windowId, {focused: true});
}


/*
  Mute all tabs that are audible.  Does not use the regular expression.
*/
function muteTabs()
{
// adapted from https://github.com/danhp/mute-tab-chrome/blob/master/src/background.js
    chrome.windows.getAll({populate: true},
			  function(windowList) {
			      windowList.forEach(function(window) {
				  window.tabs.forEach(function(tab) {
						if (tab.audible || tab.mutedInfo.muted) {
							chrome.tabs.update(tab.id, {muted: true});
						}
					});
				});
			  });

}


function removeDuplicates()
{
   var tabsByURL = {};
   chrome.windows.getAll({populate: true},
			  function(windowList) {
			      windowList.forEach(function(window) {
				  window.tabs.forEach(function(tab) {
				      var tmp = tabsByURL[ tab.url ];
				      console.log("Adding " + tab.url);
				      if(tmp == null)
					  tmp = [];
				      tmp.push(tab);
				      tabsByURL[tab.url] = tmp;
				      
				  })
			      })
			      showDups(tabsByURL);
			      closeTargetTabs(tabsByURL, true);
			  });
}

function showDups(tabs)
{
    for(var k in tabs) {
	if(tabs[k].length > 1)
	    console.log("duplicate for " + k + " " + tabs[k].length);
    }
}


function getNumWinTabs()
{
    var numWin = 0, numTabs = 0;
    chrome.windows.getAll({populate: true},
  			  function(windowList) {
			      windowList.forEach(function(window) {
				  numWin++;
				  window.tabs.forEach(function(tab) {
				      numTabs++;
				  })
			      });
			      console.log([numWin, numTabs]);
			      return([numWin, numTabs]);
			  });
}


function showTab2(tab, window)
{
    browser.tabs.update(tab.id, {active: true});

    console.log("showTab2: " + tab.windowId);

					  // if the tab is not in the current window, bring that window to the front.
    if(window && !window.active)
	chrome.windows.update(window.id, {focused: true});
    else
	chrome.windows.update(tab.windowId, {focused: true});
}

function jumpToTabByURL(url, exact)
{
    console.log("looking for " + url + " " + exact);
    var found = false;
    var pr = browser.windows.getAll({populate: true});
    pr.then(
			  function(windowList) {
			      windowList.forEach(function(window) {
				  window.tabs.forEach(function(tab) {
				      console.log(tab + " " +  tab.url);
				      var ok = exact ? tab.url == url : tab.url.match(url) !== null;
				      if(!ok) 
					  ok = exact ? tab.title == url : tab.title.match(url) !== null;

				      if(ok) {
					  // console.log("found tab for " + url + " " + tab);
					  showTab2(tab, window);
					  found = true;
					  console.log("found tab " + tab.url);
					  // Can stop the looping here but how - throw an error, return false/true ?
				      }
				      
				  })
			      })
			      if(!found)
				  browser.tabs.create({ url: url}) ;
			  },
        err => console.log("error: "+ err));


    // p.then( () => { if(!done) browser.tabs.create({ url: url}) },  err => console.log("error: " + error));
//    if(found == false) {
//	console.log("didn't find tab so creating one");
//	browser.tabs.create({ url: url}) ;
//    }
}


function closeAllNewTabs()
{
    closeAllMatchingTabs( (t) => { return t.url == 'about:newtab' });
}

function closeAllMatchingTabs(matchFun)
{
    var ids = [];
    var tmp = browser.windows.getAll({ populate: true });
    tmp.then( (windows) => {

	windows.forEach(function(window) {
	    window.tabs.forEach(function(tab) {
		if(matchFun(tab)) {
		    ids.push(tab.id);
		}
	    })
	});

	console.log("ids = " + ids);
	var h = browser.tabs.remove( ids );
	h.then( () => { console.log("discarded"); }, (err) => {console.log("error discarding " + err);});
    });
}



function processAllMatchingTabs(matchFun, procTabIds)
{
    console.log("in processAllMatchingTabs" + matchFun + " " + procTabIds);
    var ids = [];
    var tmp = browser.windows.getAll({ populate: true });
    console.log("about to do the then() part");
    tmp.then( (windows) => {

	console.log("In the then() function " + windows);
	windows.forEach(function(window) {
	    console.log("processing window " + window.id + " " + window.title);
	    window.tabs.forEach(function(tab) {
//		console.log("matching tab " + tab.url);
		if(matchFun(tab)) {
		    console.log("matched tab " + tab.id);
		    ids.push(tab.id);
		}
	    })
	},  err => console.log("then() error: " + err ));

	console.log("ids = " + ids);
	var h = procTabIds(ids);
	h.then( () => { console.log("done"); }, (err) => {console.log("error processing " + err);});
    },  err => console.log("error in processAllMatchingTabs when getting the windows: " + err));
}

function moveMatchingTabsToNewWindow(rx)
{
    console.log("moveMatchingTabsToNewWindow " + rx);
    var win = browser.windows.create({}, // {titlePreface: "Hi there"},
				     function(win) {
					 console.log("calling processAllMatchingTabs");
					 processAllMatchingTabs((t) => { return t.url.match(rx) },
							        (tabIds) => { console.log("Moving tabs to window "); return browser.tabs.move(tabIds, {windowId: win.id, index: -1} );  })
				     }
				    );
}






document.getElementById('removeTabsButton').addEventListener('click', function() { TargetTabs = closeTargetTabs(TargetTabs, LeaveOne)});

document.getElementById('groupTabsButton').addEventListener('click', groupTargetTabs);

document.getElementById('mute').addEventListener('click', muteTabs);

document.getElementById('duplicates').addEventListener('click', removeDuplicates);

// arrange for a return (\n) to trigger processRX().
document.getElementById('rx').addEventListener('keydown', function(event)  {
                                                            if(event.keyCode == 13)
							        processRX(event.target.value,
									  document.getElementById('exactMatch').checked);
                                                            });


document.getElementById('tabURL').addEventListener('change', function(ev) { jumpToTabByURL(ev.target.value, false); } );

document.getElementById('closeNewTabs').addEventListener('click', closeAllNewTabs);

document.getElementById('moveMoz').addEventListener('click', function(ev) { moveMatchingTabsToNewWindow('https://developer.mozilla.org/') });


document.getElementById('findTabRX').addEventListener('keydown', function(event)  {
                                                            if(event.keyCode == 13)
							        jumpToTabByURL(event.target.value, false);
                                                            });



document.getElementById('groupRX').addEventListener('keydown', function(event)  {
                                                            if(event.keyCode == 13) 
							        moveMatchingTabsToNewWindow(event.target.value);
                                                            });

