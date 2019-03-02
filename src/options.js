
chrome.storage.sync.get('urls', function(data) {
    var i;
    var txt = "";
    var txtField = document.getElementById('urls');    
    for(i = 0; i < data.urls.length; i++) {
	var u = data.urls[i];
	txt = txt + u + "\n";
    }
    console.log(txt);
    txtField.value = txt;
});