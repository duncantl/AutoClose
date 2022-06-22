browser.contextMenus.create({
    id: "OGS Signed Docs",
    title: "Save to Signed Docs", 
    contexts: ["link"]
});


browser.contextMenus.onClicked.addListener(saveToSignedDocs);


chrome.runtime.onMessage.addListener(function(obj) {

    console.log("content disposition info: " + JSON.stringify(obj));
    doDownload(obj.url, obj.contentDisposition);
})


function saveToSignedDocs(info, tab)
{
    console.log("info " + JSON.stringify(info));
    console.log("Saving " + info.linkUrl + " to ~/OGS/SignedDocs/  and opening with Adobe Acrobat " + typeof(url));
    let u = new URL(info.linkUrl);
    let rx = new RegExp("\\.pdf$");

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
//	    let port = browser.runtime.connectNative("/Applications/Adobe Acrobat DC/Adobe Acrobat.app");
//	    port.postMessage("open " + dl.filename);
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
    browser.downloads.search( { limit: 1, orderBy: ["-startTime"] })
	.then(d => {
	    console.log("last download " +  JSON.stringify(d) + " tab: " + JSON.stringify(tab));
	    getContentDispositionLocal(d[0].url, tab)
	});

}


function getContentDispositionLocal(url, tab)
{
    console.log("getContentDispositionLocal() " + tab);
    let p = browser.scripting.executeScript({target: {tabId: tab.id}, func: getContentDisposition, args: [ url ]})
	.then(() => console.log("sent getContentDisposition call"));

    return(p);
}


browser.commands.onCommand.addListener(handleKeyCommand);