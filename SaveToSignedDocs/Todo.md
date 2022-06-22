# Save a link to OGS/SignedDocs and open with adobe acrobat.

+ only in mail.google.com tabs.

+  get the name of the file in the email message.
   + who is putting the name of the file from GMail - GMail or Firefox.
   + the file name is in the tooltip on the link.
      + we are not getting that in the `info` object in JS.
   + could rewrite via a contents_script
   
+ intercept this download?

+ get the a element in the menu event and get its 

+ do a HEAD request on the to get the Content-Disposition headers.
   + idea from the Save In extension https://github.com/gyng/save-in
   + will I have the correct cookies?
   - This is not allowed from the background.js as a  CORS issues
     + can we sent the tab a script to execute

+ key shortcut to move the most recent download to SignedDocs.
   + have the key shortcut Ctrl+D
   + need to move file
   + open with adobe acrobat
   
+ How to open with adobe acrobat and not the default open.
    + change the download item to specify the mime type.
    + Change the content type of a URL response. 
       +  https://github.com/jscher2000/Content-Type-Fixer-extension/blob/master/background.js

+ get the content type and put the extension that.


+ Put symbolic link from ~/OGS/SignedDocs to ~/Downloads/SignedDocs



# Done

+ √ want Signed Docs menu item on the regular content menu, not a submenu
  + when add more than one menu, it appears to be automatically nested
     under the extension name.
	  + A FF design (following chrome) https://bugzilla.mozilla.org/show_bug.cgi?id=1294429
	    so that menu items are clearly associated with an extension.
		  + the documentation shows an example where this doesn't happen. Misleading.
  + do we have to move this code to a separate extension!! YES!
