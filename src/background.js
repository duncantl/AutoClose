// Taken from get_started_complete extension example

'use strict';


let DefaultURLs = [                 'chrome://newtab/',
	                            'https://mail.google.com/mail',				    
	                            'https://www.nytimes.com/',
	                            'https://www.washingtonpost.com/',
				    'https://github.com/',
				    'https://github.com/logout',
				    'https://www.irishtimes.com/',
				    'https://www.bbc.co.uk/sport',
				    'https://www.youtube.com/',
				    'https://www.kqed.org/radio/live'
];

let DefaultRX = ["https?://dsi.ucdavis.edu/.*",
		 "https://netflix.com/",
		 "https://amazon.com/Prime-Video"		 ,
		 "https://oasis.ucdavis.edu",
		 "https://gradhub.ucdavis.edu",		 
     	        ];

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({urls: DefaultURLs.join('\n'), 'LeaveOne': false, Regexps: DefaultRX.join('\n')}, function() {
         console.log('set the URLs for AutoClose.');
    });
});



/*			    
Not relevant. This restricts the extension/popup to pages with a particular
characteristic. But we want this to be global.  Could actually be on a menu.

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
*/
