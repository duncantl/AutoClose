# SaveToSignDocs

This extension saves a GMail PDF attachment to the SignDocs.
One can right click on the link  to the attachment
or use keyboard shortcuts

Right click on the attachment in the (google) mail
and select "Save to Signed Docs"


# Keyboard Shortcuts

Ctrl+F - fetch the first PDF
Ctrl+Alt+F - fetch the second PDF

Ctrl+D - work with the most recent download.


This currently cannot open the file due to a Firefox restriction.
It does show you the file in Finder and it is selected.
So one can Open With and select Adobe Acrobat.


## Installation

+ Edit acrobat.json and change the `path` entry to specify the full path to acrobat.py.
  It can be the current directory in which acrobat.json is located and which also 
  contains acrobat.py


+ Copy the acrobat.json file to where Firefox/Mozilla will look for it.
See
[here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location).

On OSX, 
```
cp acrobat.json "~/Library/Application Support/Mozilla/NativeMessagingHosts/"
```

  + Do not use a symbolic link. Firefox will reject that with "too many levels of symbolic link"
  
  
