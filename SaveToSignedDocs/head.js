function getContentDisposition(url)
{
    const r = new XMLHttpRequest();
    r.open("HEAD", url, false);
    r.send();
    // console.log("headers " + r.getAllResponseHeaders());
    const d = r.getResponseHeader("Content-Disposition");
    // console.log("disposition " + d);
    
    // send the results back to the background via sendMessage()
    browser.runtime.sendMessage({ action: "content-disposition", contentDisposition: d, url: url,
				  contentType: r.getResponseHeader("Content-Type"),
				  length: r.getResponseHeader("Content-length")
				});
}


console.log("head.js script running in Web page");