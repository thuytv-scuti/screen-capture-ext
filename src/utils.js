export const sendScreenshotToBoard = (board, image, url) => {
  const dispatchImageCaptured = (_image, _url) => {
    const insertCaptureEvent = new CustomEvent('insert:captured', {
      detail: {
        image: _image,
        url: _url,
      },
    });

    window.dispatchEvent(insertCaptureEvent);
  };

  chrome.scripting.executeScript({
    target: { tabId: board.id },
    func: dispatchImageCaptured,
    args: [image, url],
  });
};
