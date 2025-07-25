chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;

  try {
    // 1) grab the raw source of the page
    const resp = await fetch(tab.url);
    const text = await resp.text();
    JSON.parse(text);       // if this throws, we go to catch()

    // 2) clear out whatever DOM the browser built and insert a <pre> with raw JSON
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (raw) => {
        document.documentElement.innerHTML = '';
        const pre = document.createElement('pre');
        pre.id = 'novajson-raw';
        pre.style.whiteSpace = 'pre-wrap';
        pre.textContent = raw;
        document.body.appendChild(pre);
      },
      args: [text]
    });

    // 3) now inject YOUR formatter, contentScript.js
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"]
    });

  } catch (e) {
    // fetch failed or JSON.parse threw → alert user
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert('NovaJSON: No raw JSON detected on this page.')
    });
  }
});
