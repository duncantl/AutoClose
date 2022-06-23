browser.contextMenus.create({
    id: "OGS Signed Docs",
    title: "Save to Signed Docs", 
    contexts: ["link"]
});


browser.contextMenus.onClicked.addListener(saveToSignedDocs);//XXX change back to saveToSignedDocs

// checking what ?
function saveToSignedDocs2(info, tab)
{
    console.log("info " + JSON.stringify(info));
    console.log("Saving " + info.linkUrl + " to ~/OGS/SignedDocs/ and opening");

    browser.downloads.download({ url: info.linkUrl, filename: "SignedDocs/" + "bob.pdf"})
	.then( id => {
	    console.log("opening download item: " + id);
	    browser.permissions.request({origins: ["https://mail.google.com/*"]})
		.then(	    browser.downloads.open(id) );
	});    

}




chrome.runtime.onMessage.addListener(function(obj) {

    if(obj.action && obj.action == "content-disposition") {
	console.log("content disposition info: " + JSON.stringify(obj));
	doDownload(obj.url, obj.contentDisposition);
    }
})


function saveToSignedDocs(info, tab)
{
    console.log("info " + JSON.stringify(info));
    console.log("Saving " + info.linkUrl + " to ~/OGS/SignedDocs/  and opening with Adobe Acrobat " + typeof(url));
    let u = new URL(info.linkUrl);

    getContentDispositionLocal(info.linkUrl, tab);
}


function doDownload(url, disposition)
{
    console.log("doDownload " + url + " disposition: " + disposition);
    
    browser.downloads.download({ url: url, filename: "SignedDocs/" + extractFilename(disposition)})
	.then( id => {
	    console.log("id " + id + " " + typeof(id));
	    return(browser.downloads.search({id: id})); 
	})
	.then(dl => {
	    // going to get the MIME type, etc. and do something before opening.
	    console.log("download item: " + JSON.stringify(dl));


	    browser.downloads.show(dl[0].id);

/*	    
	    dl[0].mime="application/duncan";
	    browser.downloads.open(dl[0].id);	    
*/
/*	    
	    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
		.then(tabs => browser.tabs.get(tabs[0].id))
		.then(t => {
		    console.log("calling openDownload() " + dl[0].id + " " + dl[0].filename );
		    browser.scripting.executeScript({target: {tabId: t.id} , func: openDownload, args: [dl[0].id]})
		});

//	    let port = browser.runtime.connectNative("/Applications/Adobe Acrobat DC/Adobe Acrobat.app");
//	    port.postMessage("open " + dl.filename);
*/
	});
}

// https://stackoverflow.com/questions/40939380/how-to-get-file-name-from-content-disposition
function extractFilename(disposition)
{
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    let filename = "no_disposition";
    if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
    }
    return(filename);
}



// https://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript

function basename(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}



function handleKeyCommand(info, tab)
{
    switch(info) {
    case "mostRecent":
	browser.downloads.search( { limit: 1, orderBy: ["-startTime"] })
	    .then(d => {
		console.log("last download " +  JSON.stringify(d) + " tab: " + JSON.stringify(tab));
		showPDF(d[0].filename);
	    });
	break;
			// getContentDispositionLocal(d[0].url, tab)

        
    case "fetchPDF":
    case "fetchPDF2":
	let which = info == "fetchPDF" ? 0 : 1;
	console.log("handling fetch key " + command);
	// is tab already available here?
	let p = browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
      	      .then(tabs => browser.tabs.get(tabs[0].id))
	    .then( tab => {
		console.log("about to call findPDF() in content-script  which =" + which);
		browser.scripting.executeScript({target: {tabId: tab.id} , func: findPDF, args: [which]});
	    })
	break;
    }

    console.log("finished handleKeyCommand " + info);
}


function getContentDispositionLocal(url, tab)
{
    console.log("getContentDispositionLocal() " + JSON.stringify(tab));
    let p = browser.scripting.executeScript({target: {tabId: tab.id}, func: getContentDisposition, args: [ url ]})
	.then(() => console.log("sent getContentDisposition call"));

    return(p);
}


browser.commands.onCommand.addListener(handleKeyCommand);


var port;

function showPDF(filename)
{
    if(!port || port === undefined)
	port = browser.runtime.connectNative("acrobat");

    port.postMessage(filename); // not asynchronous
    console.log("sent message to acrobat launcher: " + filename);
}