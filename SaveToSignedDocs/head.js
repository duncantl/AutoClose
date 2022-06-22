function getContentDisposition(url)
{
    const r = new XMLHttpRequest();
    r.open("HEAD", url, false);
    r.send();
    console.log("headers " + r.getAllResponseHeaders());
    const d = r.getResponseHeader("Content-Disposition");
    console.log("disposition " + d);
    // send the results back to the background via sendMessage()
}


console.log("head.js script running in Web page");