
// use strict;

function inURLs(u, urls) {

    var i = 0;
    for(i = 0; i < urls.length; i++) {
	if(urls[i] == u)
	    return true;
    }

    return(false);
}

function closeTargetTabs()
{
    for(var k in TargetTabs) {
	var tabs = TargetTabs[k];
	for(var i = 0; i < tabs.length; i++) {
	    chrome.tabs.remove( tabs[i].id);
	}
	TargetTabs[k] = null;
    }
}

let utable = document.getElementById('UrlTable');

var TargetTabs = {};

chrome.storage.sync.get('urls', function(data) {
 //   alert('in setting urls ' + data.urls);
    var i;
    var urls = data.urls;
    console.log(' Got urls ' + urls);

    //{populate:true}

    chrome.windows.getAll({populate: true},function(windows){
	windows.forEach(function(window){
	    window.tabs.forEach(function(tab){
		console.log(tab.url);
		if(inURLs(tab.url, urls)) {
		    let tr = document.createElement("tr");
		    th = document.createElement("th");
		    th.setAttribute('align', 'left');
		    th.innerHTML = tab.url;
		    tr.appendChild(th);
		    utable.appendChild(tr);

		    var tmp = TargetTabs[tab.url];
		    if(tmp == null) 
			tmp = [];
		    tmp.push(tab);
		    TargetTabs[tab.url] = tmp;
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