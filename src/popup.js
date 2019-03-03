
// use strict;

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

function closeTargetTabs()
{
    for(var k in TargetTabs) {
	var tabs = TargetTabs[k];
	for(var i = LeaveOne ? 1 : 0; i < tabs.length; i++) {
	    chrome.tabs.remove( tabs[i].id);
	}
	TargetTabs[k] = null;
    }
}


function groupTargetTabs()
{
    chrome.windows.create({}, function(win) {
	console.log('Created new window ' + win);
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


let utable = document.getElementById('urlTBBody');

var TargetTabs = {};
var LeaveOne = false;


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


document.getElementById('removeTabsButton').addEventListener('click', closeTargetTabs);

document.getElementById('groupTabsButton').addEventListener('click', groupTargetTabs);

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




function filterTabs(pred)
{
        chrome.windows.getAll({populate: true},function(windows){
	windows.forEach(function(window){
	    window.tabs.forEach(function(tab){
		//		console.log(tab.url);
		if(pred(tab.url)) {  // e.g. pred = function(u) u.match(rx)
		    addURLTabToTable(tab.url, tab);
		}
	    });
	  });
	});    
    

}

function addURLTabToTable(url, tab)
{
    let tr = document.createElement("tr");
    th = document.createElement("th");
    th.setAttribute('align', 'left');
    th.innerHTML = url;
    tr.appendChild(th);
    utable.appendChild(tr);

    var tmp = TargetTabs[url];
    if(tmp == null) 
	tmp = [];
    tmp.push(tab);
    TargetTabs[url] = tmp;
    return(url);
}