// Based on https://stackoverflow.com/a/50548409/8584605
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo?.status === 'complete')
    chrome.tabs
      .sendMessage(tabId, { message: 'tabUpdate' })
      .catch(console.trace);
});

export {};
