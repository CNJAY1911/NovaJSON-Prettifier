// Heuristic: run only if page looks like raw JSON
async function shouldInject(tabId) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const pre = document.querySelector('pre');
          if (!pre) return false;
          const text = pre.textContent.trim();
          if (!text) return false;
          const first = text[0];
          return (first === '{' || first === '['); // quick check
        }
      });
      return !!result;
    } catch (e) {
      console.warn('Inject check failed:', e);
      return false;
    }
  }
  
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
  
    if (await shouldInject(tab.id)) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['contentScript.js']
        });
      } catch (e) {
        console.error('Injection failed:', e);
      }
    } else {
      // Optional: notify user
      chrome.tabs.sendMessage(tab.id, { type: 'NOVAJSON_NO_JSON_FOUND' }).catch(()=>{});
    }
  });
  