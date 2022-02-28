console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.action.onClicked.addListener(async (_) => {
  const tab = (
    await chrome.tabs.query({ active: true, currentWindow: true })
  )[0];

  if (tab) {
    chrome.tabs.captureVisibleTab(
      tab.windowId,
      {
        format: 'png',
      },
      (base64Image) => onImageCaptured(base64Image, tab)
    );
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[x] runtime message', request, sender);
});

/**
  @param {string} image
  @param {typeof chrome.tabs[0]} capturedTab
*/
async function onImageCaptured(image, capturedTab) {
  const boards = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
  const popover = await chrome.tabs.create({ url: 'popup.html', active: false });
  await chrome.windows.create({
    tabId: popover.id,
    type: 'popup',
    focused: true,
    width: 400,
    height: 600
  });

  chrome.scripting.executeScript({
    target: { tabId: popover.id },
    func: fillPopoverContent,
    args: [boards],
  });


  const dispatchImageCaptured = (_image, _url) => {
    const insertCaptureEvent = new CustomEvent('insert:captured', {
      detail: {
        image: _image,
        url: _url,
      },
    });

    window.dispatchEvent(insertCaptureEvent);
  };

  for (let i = 0, len = boards.length; i < len; i++) {
    const board = boards[i];

    chrome.scripting.executeScript({
      target: { tabId: board.id },
      func: dispatchImageCaptured,
      args: [image, capturedTab.url],
    });

    console.log('[x] dispatch insert event to board', board);
  }
}

