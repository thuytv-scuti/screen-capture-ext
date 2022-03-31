import { sendScreenshotToBoard } from '../../utils';

const calculateCenterScreen = async (width, height) => {
  const _window = await chrome.windows.getCurrent();
  const top = Math.max(150, Math.round((_window.height - height) / 2));
	const left = Math.max(150, Math.round((_window.width - width) / 2));

  return { top, left };
}

chrome.action.onClicked.addListener(async (_) => {
  const boards = await chrome.tabs.query({ url: '*://*/*/board-*/*', status: 'complete' });
  console.log('[x] boards', boards);
  console.log('[x] current window', await chrome.windows.getCurrent());

  // no board opening
  if (boards.length === 0) {
    const pos = await calculateCenterScreen(500, 250);
    return chrome.windows.create({
      type: 'popup',
      focused: true,
      width: 500,
      height: 250,
      top: pos.top,
      left: pos.left,
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

  const pos = await calculateCenterScreen(600, 600);
  // multiple boards are opening
  chrome.windows.create({
    type: 'popup',
    focused: true,
    width: 600,
    height: 600,
    top: pos.top,
    left: pos.left,
    url: `popup.html?windowId=${currentTab.windowId}&tabId=${currentTab.id}`
  });
});

