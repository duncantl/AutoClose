// Taken from get_started_complete extension example

'use strict';


let DefaultURLs = [                 'chrome://newtab/',
	                            'https://www.nytimes.com/',
	                            'https://www.washingtonpost.com/',
				    'https://github.com/',
				    'https://github.com/logout',
				    'https://www.irishtimes.com/',
				    'https://www.bbc.co.uk/sport',
				    'https://www.youtube.com/'
];

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({urls: DefaultURLs.join('\n'), 'LeaveOne': false, Regexps: []}, function() {
         console.log('set the URLs for AutoClose.');
    });
});



/*			    
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
*/
