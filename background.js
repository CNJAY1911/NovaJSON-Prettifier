chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
  
    // Quick JSON check before injecting the heavy script
    try {
      const [{ result: isJSON }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const pre = document.querySelector('pre');
          if (!pre) return false;
          const text = pre.textContent.trim();
          if (!text) return false;
          const first = text[0];
          if (first !== '{' && first !== '[') return false;
          try { JSON.parse(text); return true; } catch { return false; }
        }
      });
  
      if (!isJSON) {
        // Optional: notify user that page isn't raw JSON
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => alert('NovaJSON: No raw JSON detected on this page.')
        });
        return;
      }
  
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"]
      });
    } catch (e) {
      console.error("NovaJSON inject error:", e);
    }
  });
  