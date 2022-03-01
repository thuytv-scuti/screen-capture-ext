import { sendScreenshotToBoard } from '../../utils';
chrome.action.onClicked.addListener(async (_) => {
  const boards = await chrome.tabs.query({ url: '*://*/*/board-digital/*' });

  // no board opening
  if (boards.length === 0) {
    return chrome.windows.create({
      type: 'popup',
      focused: true,
      width: 500,
      height: 250,
      top: 150,
      left: 150,
      url: `popup.html?isEmpty=1`
    });
  }

  const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

  // single board is opening
  if (boards.length === 1) {
    const screenshot = await new Promise(
      (resolve) => chrome.tabs.captureVisibleTab(currentTab.windowId, {
        format: 'png',
      }, resolve)
    );
    return sendScreenshotToBoard(boards[0], screenshot, currentTab.url);
  }

  // multiple boards are opening
  chrome.windows.create({
    type: 'popup',
    focused: true,
    width: 600,
    height: 600,
    top: 150,
    left: 150,
    url: `popup.html?windowId=${currentTab.windowId}&tabId=${currentTab.id}`
  });
});

