console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

chrome.runtime.onMessage.addListener((req, _sender, res) => {
  const { action, data } = req;
  if (action === 'insert:captured') {
    const insertCaptureEvent = new CustomEvent('insert:captured', {
      image: data.image,
      url: data.url,
    });

    document.dispatchEvent(insertCaptureEvent);
    res('ok');
  }
});
