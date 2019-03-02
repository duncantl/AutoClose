
chrome.storage.sync.get(['urls', 'LeaveOne', 'Regexps'], function(data) {
    var i;
    var txt = "";
    var txtField = document.getElementById('urls');
/*    
    for(i = 0; i < data.urls.length; i++) {
	var u = data.urls[i];
	txt = txt + u + "\n";
    }
*/
    console.log(txt);
    txtField.value = data.urls; // txt;

    document.querySelector('#leaveOne').checked = data.LeaveOne;
    document.querySelector('#urlRegexps').value = data.Regexps;    
    
    
});


function SaveOptions()
{
    var val = { urls: document.querySelector('#urls').value,
		LeaveOne: document.querySelector('#leaveOne').checked,
		Regexps: document.querySelector('#urlRegexps').value};
    chrome.storage.sync.set(val);
    console.log("Success saving options");
}

document.querySelector("#save").addEventListener("click", SaveOptions);