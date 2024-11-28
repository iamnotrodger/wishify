let pageData = {
  url: document.URL,
  html: document.documentElement.innerHTML,
};

const sendPageData = () => {
  pageData = {
    url: document.URL,
    html: document.documentElement.innerHTML,
  };
  if (chrome?.runtime?.id) {
    chrome.runtime.sendMessage({ type: 'PAGE_DATA', payload: pageData });
  }
};

if (document.readyState === 'load') {
  document.addEventListener('DOMContentLoaded', sendPageData);
} else {
  sendPageData();
}

// Detect when the tab gains visibility
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    sendPageData();
  }
});

// Detect when the tab gains focus
window.addEventListener('focus', () => {
  sendPageData();
});

window.addEventListener('pageshow', sendPageData, true);
