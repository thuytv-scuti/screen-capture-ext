import React, { useEffect } from 'react';
import './Popup.css';

const Popup = () => {
  const [boards, setBoards] = React.useState([]);
  const [image, setImage] = React.useState('');
  const [isLoading, setLoading] = React.useState(true);

  useEffect(async () => {
    const url = new URL(window.location);
    const windowId = Number(url.searchParams.get('windowId'));
    chrome.tabs.captureVisibleTab(windowId, {
      format: 'png',
    }, setImage);

    // chrome.tabs.query({ url: '*://*/*/board-digital/*' }).then(setBoards);
    chrome.tabs.query({ url: '*://*/*' }).then(setBoards);
  }, []);

  useEffect(() => {
    if (image && boards.length > 0) {
      setLoading(false);
    }
  }, [image, boards]);

  if (isLoading) {
    return <div className="content"><div className="loader">Loading...</div></div>;
  }

  return (
    <div className="content">
      <img className="preview-image" src={image} alt="image" />
      <div className="board-list">
        {
          boards.map((board, index) => (
            <label key={index} className="container">{board.url}
              <input type="checkbox" defaultChecked="checked" />
              <span className="checkmark"></span>
            </label>
          ))
        }
      </div>
      <div className="submit-container"> <button className="btn" > Insert selected </button> </div>
    </div>
  );
};

export default Popup;
