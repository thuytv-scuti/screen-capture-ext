console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.action.onClicked.addListener(async (_) => {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

  if (tab) {
    chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
    }, (base64Image) => onImageCaptured(base64Image, tab));
  }
});

/**
  @param {string} image
  @param {typeof chrome.tabs[0]} capturedTab
*/
async function onImageCaptured(image, capturedTab) {
  const boards = await chrome.tabs.query({ url: 'http://localhost:3000/*' });

  const dispatchImageCaptured = (_image, _url) => {
    const insertCaptureEvent = new CustomEvent('insert:captured', {
      detail: {
        image: _image,
        url: _url
      }
    });
  
    window.dispatchEvent(insertCaptureEvent);
  }

  for (let i = 0, len = boards.length; i < len; i++) {
    const board = boards[i];

    chrome.scripting.executeScript({
      target: { tabId: board.id },
      func: dispatchImageCaptured,
      args: [image, capturedTab.url]
    })
  }

}
