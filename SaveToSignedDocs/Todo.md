# Save a link to OGS/SignedDocs and open with adobe acrobat.

+ [check] limit to only in mail.google.com tabs.

+ open with adobe acrobat.
  + downloads.open may only be called from a user input handler
  + How to open with adobe acrobat and not the default open.
    + temporarily change the options to register adobe as the app for PDF documents and then
      immediately reset.
	  
    + change the download item to specify the mime type.
    + Change the content type of a URL response. 
       +  https://github.com/jscher2000/Content-Type-Fixer-extension/blob/master/background.js

+  key to download single attachment or the first pdf one in the document.


+ key shortcut to move the most recent download to SignedDocs.
   + √ have the key shortcut Ctrl+D
   + need to move file
   + open with adobe acrobat


+ intercept downloads from 


+ Put symbolic link from ~/OGS/SignedDocs to ~/Downloads/SignedDocs



+ Handle error
   + "Error: downloads.open may only be called from a user input handler"
   + Is this because we get the content-disposition first?


# Done

+ √ want Signed Docs menu item on the regular content menu, not a submenu
  + when add more than one menu, it appears to be automatically nested
     under the extension name.
	  + A FF design (following chrome) https://bugzilla.mozilla.org/show_bug.cgi?id=1294429
	    so that menu items are clearly associated with an extension.
		  + the documentation shows an example where this doesn't happen. Misleading.
  + do we have to move this code to a separate extension!! YES!


+  √ get the name of the file in the email message.
   + √ do a HEAD request on the to get the Content-Disposition headers.
      + idea from the Save In extension https://github.com/gyng/save-in
      + will I have the correct cookies?
      - This is not allowed from the background.js as a  CORS issues
         + can we sent the tab a script to execute
   + Other possible approaches		 
      + who is putting the name of the file from GMail - GMail or Firefox.
      + the file name is in the tooltip on the link.
         + we are not getting that in the `info` object in JS.
      + could rewrite via a contents_script
      + get the a element in the menu event and get its tooltip
      + get the content type and put the extension on the file name

