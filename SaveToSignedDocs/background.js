browser.contextMenus.create({
    id: "OGS Signed Docs",
    title: "Save to Signed Docs", 
    contexts: ["link"]
});



browser.contextMenus.onClicked.addListener(saveToSignedDocs);


function saveToSignedDocs(info, tab)
{
    console.log("info " + JSON.stringify(info));
    console.log("Saving " + info.linkUrl + " to ~/OGS/SignedDocs/  and opening with Adobe Acrobat " + typeof(url));
    let u = new URL(info.linkUrl);
    let rx = new RegExp("\\.pdf$");
    let ext = "";
    if(!rx.test(u.pathname))
	ext += ".pdf";


    getContentDispositionLocal(info.linkUrl, tab);
    

    
    browser.downloads.download({ url: info.linkUrl, filename: "SignedDocs/" + basename(u.pathname) + ext })
	.then( id => {
	    console.log("id " + id + " " + typeof(id));
	    return(browser.downloads.search({id: id})); // new browser.downloads.DownloadQuery
	})
	.then(dl => {
	    // going to get the MIME type, etc. and do something before opening.
	    console.log("download item: " + JSON.stringify(dl));
	    browser.downloads.show(dl[0].id);
//	    let port = browser.runtime.connectNative("/Applications/Adobe Acrobat DC/Adobe Acrobat.app");
//	    port.postMessage("open " + dl.filename);
	}); 
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
    browser.scripting.executeScript({target: {tabId: tab.id}, func: getContentDisposition, args: [ url ]})
	.then(() => console.log("sent getContentDisposition call"));
}


browser.commands.onCommand.addListener(handleKeyCommand);