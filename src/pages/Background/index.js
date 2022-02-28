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

async function handleRequestBoards(request, sender, sendResponse) {
  const { action } = request;
  if (action === 'request:boards') {
    const boards = JSON.stringify(await getAllBoards());
    console.log('[x] board getted', boards);
    sendResponse(boards);
  }
}

chrome.runtime.onMessage.addListener(handleRequestBoards);

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getAllBoards() {
  return chrome.tabs.query({ url: 'http://localhost:3000/*' });
}

/**
  @param {string} image
  @param {typeof chrome.tabs[0]} capturedTab
*/
async function onImageCaptured(image, capturedTab) {
  const boards = await getAllBoards();
  await chrome.windows.create({
    type: 'popup',
    focused: true,
    width: 700,
    height: 600,
    top: 150,
    left: 150,
    url: `popup.html?windowId=${capturedTab.windowId}&tab=${capturedTab.id}`
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
  }
}

