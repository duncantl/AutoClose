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

    // There is a race condition.  The download may still be progressing when we resolve the promise
    // and can get the file name.
    // So we list for (all) download events and process only those for this download id
    // When we get an event that indicates the download is complete, then we call showPDF().
    let dl = browser.downloads.download({ url: url, filename: "SignedDocs/" + extractFilename(disposition)})
	.then( id => {
	    //XXX need to remove the listener when the download is complete.
	    let h = function(delta) {
		if(delta.id != id)
		    return(false);

		if(delta.state.current != "complete")
		    return(false);
		
		// not sure why we are doing this. We already  have the id and the filename
		// but need the full patht the file name without asssuming.
		console.log("id " + id + " " + typeof(id) + " download complete to " + delta.filename);
//		showPDF(delta.filename)

		browser.downloads.search({id: id})
		    .then(dl => {
			// going to get the MIME type, etc. and do something before opening.
			console.log("download item: " + JSON.stringify(dl));

	    //	    browser.downloads.show(dl[0].id);
			showPDF(dl[0].filename)
			browser.downloads.onChanged.removeListener(h)
		    })

	    }
	    
	    browser.downloads.onChanged.addListener(h)
	})


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