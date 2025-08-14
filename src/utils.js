(function () {
  window.NJPP = window.NJPP || {};

  function isURL(str) { return /^https?:\/\//.test(str); }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cssEscapeAttr(val) {
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(val);
    return String(val).replace(/"/g, '\\"');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement('textarea');
      ta.value = text; (document.body || document.documentElement).appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
    }
  }

  // Storage utilities for persisting user preferences
  function saveToStorage(key, value) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Chrome extension storage
        chrome.storage.local.set({ [key]: value });
      } else if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        // Firefox extension storage
        browser.storage.local.set({ [key]: value });
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn('Failed to save to storage:', e);
    }
  }

  function loadFromStorage(key, defaultValue) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Chrome extension storage - async, so we'll use a callback approach
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve(result[key] !== undefined ? result[key] : defaultValue);
          });
        });
      } else if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        // Firefox extension storage - async
        return new Promise((resolve) => {
          browser.storage.local.get([key]).then((result) => {
            resolve(result[key] !== undefined ? result[key] : defaultValue);
          });
        });
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      }
    } catch (e) {
      console.warn('Failed to load from storage:', e);
      return defaultValue;
    }
  }

  // Synchronous version for immediate use (localStorage fallback)
  function loadFromStorageSync(key, defaultValue) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Chrome extension storage doesn't support sync access, return default
        return defaultValue;
      } else if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        // Firefox extension storage doesn't support sync access, return default
        return defaultValue;
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      }
    } catch (e) {
      console.warn('Failed to load from storage sync:', e);
      return defaultValue;
    }
  }

  window.NJPP.utils = { 
    isURL, 
    escapeHTML, 
    cssEscapeAttr, 
    copyToClipboard,
    saveToStorage,
    loadFromStorage,
    loadFromStorageSync
  };
})();


