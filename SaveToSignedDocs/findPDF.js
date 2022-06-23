/*
  Find a pdf attachment in the gmail tab
*/
function findPDF(which)
{
    console.log("in findPDF() in content script");
    let ans = document.evaluate("//a[@role = 'link' and @target = '_blank' and starts-with(@href, 'https://mail.google.com/mail/u') and contains(@href, 'view=att&disp=safe')]" , document, null, XPathResult.ANY_TYPE, null);
   
    let cur = ans.iterateNext();
    if(which > 0) {
	let ctr = 0;
	while(ctr < which) {
	    cur = ans.iterateNext();
	    ctr++;
	}
    }
    
    console.log("about to click on " + cur.href);
    cur.click();
    return(cur.href);
}


// won't work as not part of a user input action.
function openDownload(id)
{
    console.log("openDownload in content-script: " + id);
    browser.downloads.open(id).catch(err => console.log("openDownload failed: " + err));
}
