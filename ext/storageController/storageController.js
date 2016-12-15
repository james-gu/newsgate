/* storageController.js - useful functions to help manage blacklist in local storage
 * @Author: David Wayman - github.com/r3dcrosse
 * @CreatedOn: 12/14/16
 *
*/

var server = 'https://newsgate.herokuapp.com/dateFilter'; // Deployed server db

// Makes post request to server for new blacklisted URLs
var makePostReq = function(dateObj) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", server, true);

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function(data) { //Call a function when the state changes.
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        // Request finished. Update the blacklist here.
        var data = JSON.parse(xhr.responseText);
        updateBlacklist(data, 'blackListedURLs');
    }
  };

  xhr.send(dateObj);
};

// Initialize local storage variables for black list
var initLocalStorage = function() {
  // Initialize storage containers
  chrome.storage.local.set({ 'blackListedURLs' : [] });
  chrome.storage.sync.set({ 'userGeneratedBlacklist' : [] });
  chrome.storage.sync.set({ 'whiteListedURLs' : [] });
  chrome.storage.sync.set({ // Set's default theme
    'theme':
      { 'background-color': 'red' }
    });

  // Fill blackListedURLs with data from server
  getLastUpdated();
};

// EVENT LISTENER FOR WHEN EXTENSION IS INSTALLED OR CHROME IS UPDATED
chrome.runtime.onInstalled.addListener(initLocalStorage); // Initializes local storage variables

////////////////////////////////////////////////////////////////////////////////
// UPDATE BLACK LIST:
// @input1: An array of new URL objects to append to current black list
// @input2: Name of blackList to be updated 'blackListedURLs' or 'userGeneratedBlacklist'
////////////////////////////////////////////////////////////////////////////////
var updateBlacklist = function(newURLs, blackListToUpdate) {
  if (blackListToUpdate === 'blackListedURLs') {
    getBlacklist(function(oldURLs) {
      combineBlackList(newURLs, oldURLs, blackListToUpdate);
    });
  } else if (blackListToUpdate === 'userGeneratedBlacklist') {
    getUserlist(function(oldURLs) {
      combineBlackList(newURLs, oldURLs, blackListToUpdate);
    });
  } else {
    console.error('COULD NOT FIND BLACK LIST TO UPDATE');
  }
};

// Helper function for updateBlackList:
// Combines old and new blacklist and saves it to local storage on chrome
var combineBlackList = function(newURLs, oldURLs, blackListToUpdate) {
  var newBlackList = oldURLs.concat(newURLs);

  if (blackListToUpdate === 'blackListedURLs') {
    chrome.storage.local.set({ 'blackListedURLs': newBlackList }, function() {
      console.log('Successfully updated blackListedURLs');
    });
  } else if (blackListToUpdate === 'userGeneratedBlacklist') {
    chrome.storage.sync.set({ 'userGeneratedBlacklist': newBlackList }, function() {
      console.log('Successfully updated userGeneratedBlacklist');
    });
  } else {
    console.error('COULD NOT FIND BLACK LIST TO UPDATE');
  }
};

// Function to remove array of urls from userGeneratedBlacklist
// Enter an array of urls, entering in 'soundcloud' or 'soundcloud.com'
// will remove a url listed as 'soundcloud.com'
var removeUrl = function(urls) {
  var newList;
  
  getUserlist(function(results) {
    newList = results;
    
    // Remove any urls given from newList
    urls.forEach(function(url) {
      var pattern = new RegExp(url);
      newList.forEach(function(userlistUrl, index) {
        if (pattern.test(userlistUrl)) {
          newList.splice(index, 1);
        }
      })
    });

    // Set chrome storage to newList
    chrome.storage.sync.set({ 'userGeneratedBlacklist': newList }, function() {
      console.log('Successfully removed: ', urls);
      getUserlist((results) => {console.log('new list: ', results)});
    });
  });
};

////////////////////////////////////////////////////////////////////////////////
//   _______  _______ .___________.___________. _______ .______          _______.
//  /  _____||   ____||           |           ||   ____||   _  \        /       |
// |  |  __  |  |__   `---|  |----`---|  |----`|  |__   |  |_)  |      |   (----`
// |  | |_ | |   __|      |  |        |  |     |   __|  |      /        \   \
// |  |__| | |  |____     |  |        |  |     |  |____ |  |\  \----.----)   |
//  \______| |_______|    |__|        |__|     |_______|| _| `._____|_______/
//
////////////////////////////////////////////////////////////////////////////////
// Getter for server blacklist
var getBlacklist = function(callback) {
  chrome.storage.local.get('blackListedURLs', function(localStorage) {
    var blacklist = localStorage['blackListedURLs'];
    console.log(blacklist, 'RESULTS INSIDE GETBLACKLIST');
    callback(blacklist);
  });
};

// Getter for user generated blacklist
var getUserlist = function(callback) {
  chrome.storage.sync.get('userGeneratedBlacklist', function(syncStore) {
    var userBlacklist = syncStore['userGeneratedBlacklist'];
    callback(userBlacklist);
  });
};

// Getter for whitelist
var getWhitelist = function(callback) {
  chrome.storage.sync.get('whiteListedURLs', function(syncStore) {
    var whitelist = syncStore['whiteListedURLs'];
    callback(whitelist);
  });
}

// Gets last URL that was pulled from server
// and updates the list in local storage
var getLastUpdated = function() {
  chrome.storage.local.get('blackListedURLs', function(blackListedURLs) {
    if (blackListedURLs['blackListedURLs'].length === 0) {
      // send a post request for an arbitrary date before the extension was made
      var arbitraryDate = JSON.stringify({ date: "2012-12-21T00:57:22.959Z" });
      makePostReq(arbitraryDate);
    } else {
      // get last url in currentURLs
      var lastURLobj = currentURLs[currentURLs.length - 1];
      var lastURLdate = lastURLobj.createdAt;
      makePostReq({ date: lastURLdate });
    }
  });
};
