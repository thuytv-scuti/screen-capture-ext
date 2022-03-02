const _dispatchImageCaptured = (_image, _url) => {
  const insertCaptureEvent = new CustomEvent('insert:captured', {
    detail: {
      image: _image,
      url: _url,
    },
  });

  window.dispatchEvent(insertCaptureEvent);
};

const _sendScreenshotToBoard = (board, image, url) => {
  chrome.scripting.executeScript({
    target: { tabId: board.id },
    func: _dispatchImageCaptured,
    args: [image, url],
  });
};

export const sendScreenshotToBoard = (board, image, url) => {
  try {
    return _sendScreenshotToBoard(board, image, url)
  } catch(err) {
    console.log('[x] ERROR:', err);
  }
  
  return null;
}
