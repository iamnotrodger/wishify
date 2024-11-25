let pageData = {
  url: document.URL,
  html: document.documentElement.innerHTML,
};

const sendPageData = () => {
  pageData = {
    url: document.URL,
    html: document.documentElement.innerHTML,
  };
  chrome.runtime.sendMessage({ type: 'PAGE_DATA', payload: pageData });
};

if (document.readyState === 'load') {
  document.addEventListener('DOMContentLoaded', sendPageData);
} else {
  sendPageData();
}
