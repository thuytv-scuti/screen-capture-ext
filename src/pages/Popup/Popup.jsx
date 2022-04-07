import React from 'react';
import './Popup.css';
import { sendScreenshotToBoard } from '../../utils';

function prettyUrl(url) {
  if (typeof url !== 'string') {
    return '';
  }
  return url.replace(/(http[s]?:[\/]+(.*?)home\/)|(\/)?(\[?#]?(.*)$)/gm, '');
}

function retrieveBoardName() {
  let boardName = '';
  try {
    boardName = document.querySelector('.longAndTruncated').textContent;
  } catch(err) {
    console.log('[x] ERROR', err);
  }
  if (typeof boardName === 'string') {
    boardName = boardName
      .replace(/日\s+/, '日 > ')
      .replace(' : ', ' > ')
      .replace('朝顔の観察 : ', ' > ');
  }

  return boardName || '';
}

const Popup = () => {
  const [boards, setBoards] = React.useState([]);
  const [screenshot, setScreenshot] = React.useState('');
  const [pageURL, setPageURL] = React.useState('');
  const [isLoading, setLoading] = React.useState(true);
  const [isEmpty, setEmpty] = React.useState(false);
  const [selectedBoards, setSelectedBoards] = React.useState([]);

  React.useEffect(async () => {
    const params = (new URL(window.location.href)).searchParams;
    const isEmpty = Boolean(params.get('isEmpty'));
    const tabId = Number(params.get('tabId'));
    try {
      if (isEmpty) {
        setEmpty(true);
        setLoading(false);

        return () => {};
      }

      const _boards = await chrome.tabs.query({ url: '*://*/*/board-*/*', status: 'complete' });
      const scshotTab = await chrome.tabs.get(tabId);
      const _screenshot = await new Promise(
        (resolve) => chrome.tabs.captureVisibleTab(scshotTab.windowId, {
          format: 'png',
        }, resolve)
      );

      if (_screenshot && _boards.length > 1) {
        const boardsWithLabel = await Promise.all(
          _boards.map(b => chrome.scripting.executeScript({
            target: { tabId: b.id },
            func: retrieveBoardName
          }).then(([{ result }]) => ({...b, boardName: result })))
        );
        setScreenshot(_screenshot);
        setBoards(boardsWithLabel);
        setPageURL(scshotTab.url);
        setLoading(false);
      } else {
        sendScreenshotToBoard(_boards[0], _screenshot, scshotTab.url);
        window.close();
      }
    } catch(e) {
      console.log('[x] ERROR: ', e);
    }
  }, []);

  const _clickSelection = React.useCallback((selected, board) => {
    setSelectedBoards((current) => {
      if (selected === true) {
        return [...current, board];
      }

      return current.filter(_board => _board.id !== board.id);
    });
  }, []);

  const _clickInsertImage = React.useCallback(() => {
    for (let i = 0, len = selectedBoards.length; i < len; i++) {
      const board = selectedBoards[i];
      sendScreenshotToBoard(board, screenshot, pageURL);
    }

    window.close();
  }, [selectedBoards, screenshot, pageURL]);

  if (isLoading) {
    return <div style={{ width: 0, height: 0 }} className="content"><div className="loader">Loading...</div></div>;
  }

  if (isEmpty) {
    return (
      <div className="content">
        <div className="alert">
        板書が見つかりません。
        </div>
      </div>
    )
  }

  return (
    <div className="content">
      <img className="preview-image" src={screenshot} alt="image" />
      <div className="board-list">
        {
          boards.map((board, index) => (
          <label key={index} className="container">
            {board.boardName || prettyUrl(boards.url)}
            <input
              onChange={({ target }) => _clickSelection(target.checked, board)}
              type="checkbox"
            />
            <span className="checkmark"></span>
          </label>
          ))
        }
      </div>
      <div className="submit-container">
        <button disabled={selectedBoards.length === 0} className="btn" onClick={_clickInsertImage}>挿入</button>
      </div>
    </div>
  );
};

export default Popup;
