
// use strict;


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
	console.log('Created new window ' + win);
	//XXX remove the first tab that was created automatically for this new window.
	for(var k in TargetTabs) {
	    var tabs = TargetTabs[k];
	    for(var i = 0; i < tabs.length; i++) {
		chrome.tabs.move( tabs[i].id, {windowId: win.id, index: -1});
		console.log("moved " + tabs[i].id + " to " + win);
	    }
	    TargetTabs[k] = null;
	}
    });
}




// Run directly in the body of the page to build the menu.
// We could defer and let the user select which of the tasks to do and then do these computations.

let utable = document.getElementById('urlTBBody');
let TargetTabs = {};
let LeaveOne = false;

chrome.storage.sync.get(['urls', 'LeaveOne', 'Regexps'], function(data) {
 //   alert('in setting urls ' + data.urls);
    var i;
    var urls = data.urls.split('\n');
    console.log(' Got urls ' + urls.join(', '));
    var rx = data.Regexps.split('\n');

    //{populate:true}

    LeaveOne = data.LeaveOne;

    chrome.windows.getAll({populate: true},function(windows){
	windows.forEach(function(window){
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


document.getElementById('removeTabsButton').addEventListener('click', function() { TargetTabs = closeTargetTabs(TargetTabs, LeaveOne)});

document.getElementById('groupTabsButton').addEventListener('click', groupTargetTabs);

document.getElementById('mute').addEventListener('click', muteTabs);

document.getElementById('duplicates').addEventListener('click', removeDuplicates);

// arrange for a return (\n) to trigger processRX().
document.getElementById('rx').addEventListener('keydown', function(event)  {
                                                            if(event.keyCode == 13)
							        processRX(event.target.value);
                                                            });

function processRX(rx)
{
    //    alert('processRX ' + rx);
    // consolidate with above into a parameterizable function
    var utable = clearTable();
    TargetTabs = {};
    
    chrome.windows.getAll({populate: true},function(windows){
	windows.forEach(function(window){
	    window.tabs.forEach(function(tab){
		//		console.log(tab.url);
		if(tab.url.match(rx)) {
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
    a.setAttribute('href', url);
    a.addEventListener('click', function() { showTab(tab); });
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

function showTab(tab)
{
    console.log("Showing tab " + tab.url + " " + tab.id);
    chrome.tabs.update(tab.id, {active: true});
    chrome.windows.update(tab.windowId, {focused: true});
}


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