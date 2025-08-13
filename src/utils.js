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

  window.NJPP.utils = { isURL, escapeHTML, cssEscapeAttr, copyToClipboard };
})();


