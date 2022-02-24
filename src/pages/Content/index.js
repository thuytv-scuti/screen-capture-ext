import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

chrome.runtime.onMessage.addListener((req, _sender, res) => {
  const { action, data } = req;
  console.log('[x] data', action, data);
  if (action === 'insert:captured') {
    const insertCaptureEvent = new CustomEvent('insert:captured', {
      image: data.image,
      url: data.url
    });
  
    document.dispatchEvent(insertCaptureEvent);
    res('ok');
  }
});
