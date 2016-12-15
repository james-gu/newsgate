$(document).ready(function(){

  // Navigate to settings page in next tab
  $('body').on('click', '#settings', function(){
    chrome.tabs.query({
      active: true
    }, tabs => {
      let index = tabs[0].index;
      chrome.tabs.create({
        url: $(this).attr('href'),
        index: index + 1
      });
    });
    return false;
  });

  // Add current url in active tab to userlist
  $('body').on('click', '#addToBlacklist', function() {
    getCurrentTabUrl(function(url) {
      
      // Background functions are available with chrome.extension.getBackgroundPage()
      var domain = chrome.extension.getBackgroundPage().filterLinks(url);
      
      // Make sure url we are inserting is not already in storage
      chrome.extension.getBackgroundPage().getUserlist(function(results) {
        var pattern = new RegExp(domain);
        // update userGeneratedBlacklist only on unique urls
        // use getUserlist(function(results) { console.log(results); }); to test in local storage
        var unique = true;
        results.forEach(function(url) {
          if (pattern.test(url)) {
            unique = false;
          }
        });
        if (unique) {
          chrome.extension.getBackgroundPage().updateBlacklist([domain], 'userGeneratedBlacklist');
        } 
      })
    });
  });

  $('body').on('click', '#removeFromBlacklist', function(){
   
  });

  $('body').on('click', '#pause', function(){
    
  });  
});

function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // One tab available in active window array
    var tab = tabs[0];
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // tabs is required to see info for other tabs
    callback(url);
  });
};
