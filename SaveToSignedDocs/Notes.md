
To download the file, the user right clicks on the
PDF document in the email and selects "Download to Signed Docs".

The background.js code handles this event.

It is given an object describing the link (but not the HTML object in the DOM since this is in the
background.)

The name of the file is in the DOM as a @tooltip attribute on the &lt;a&gt;.
However, we cannot readily get that.
Perhaps, we should.

Instead, we do a HEAD request for that URL to get the Content-Disposition field,
and perhaps the Content-type.

We cannot do this request in the background.js script as it raises a CORS issue.

Instead, we send a scripting.executeScript() request with a function and the arguments, including
the URL.
The function does the request and gets the disposition and then sends a message to the
background.js script. 
The message contains all that is needed to download the URL.

The background.js does nothing until the content-script sends the message with the URL and
disposition header.
It then proceeds to download the file via downloads.download().


At present, we cannot open the file directly from the background script.
Instead, we show the file in the finder and the user can open it with Adobe.






# Fetch

Here we want a keyboard shortcut to download the single or first pdf attachment in the current
message.


We handle the key event in the the background.js script.
It then sends a function call to the content-script.
We need to know the currently active tab.

The function call is to find the relevant PDF attachment.
We use an XPath query for this to find the &lt;a&gt;
element. 
Then we call the `click()` method on that object.

This opens the file in the regular manner.

We can have the function return the URL to the background.js script and then perform the download 
there.


