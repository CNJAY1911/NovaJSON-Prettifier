(function () {
  window.NJPP = window.NJPP || {};

  function ensureStyle() {
    let style = document.getElementById('jpp-style-global');
    if (style) return;
    style = document.createElement('style');
    style.id = 'jpp-style-global';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Source+Code+Pro:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&family=Roboto+Mono:wght@400;500;700&family=Inconsolata:wght@400;700&display=swap');

      /* Container */
      #jpp-root { position: fixed; inset: 0; overflow: auto; background: var(--jpp-bg); }

      /* Tree */
      .jpp-tree { position: relative; margin-left: 56px !important; color: var(--jpp-key-color); z-index: 1; font-family: monospace; font-size: var(--jpp-tree-font-size, 16px); line-height: 1.7; letter-spacing: 0.04em; padding: 18px; }
      .jpp-tree::before { content: ""; position: fixed; top: 0; left: 40px; bottom: 0; width: 4px; z-index: 10001; pointer-events: none; background: radial-gradient(circle, rgba(128,128,128,0.5) 25%, transparent 25%) repeat-y; background-size: 4px 4px; display: block; }
      .jpp-line {}

      /* Tokens */
      .jpp-key { color: var(--jpp-key-color); }
      .jpp-brace { color: var(--jpp-key-color); }
      .jpp-string { color: var(--jpp-string-color); }
      .jpp-number { color: var(--jpp-number-color); }
      .jpp-boolean { color: var(--jpp-boolean-color); }
      .jpp-null { color: var(--jpp-null-color); }
      .jpp-link { color: var(--jpp-url-color); text-decoration: underline; }

      /* Toggle */
      .jpp-toggle { position: absolute !important; left: -60px !important; cursor: pointer; user-select: none; width: 48px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 16px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; z-index: 10002; }
      .jpp-toggle::before { content: ""; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: transparent; }
      .jpp-collapsed { color: var(--jpp-url-color); cursor: pointer; user-select: text; }

      /* Highlight */
      .jpp-highlight { background: var(--jpp-highlight-color) !important; }

      /* Top bar */
      .jpp-topbar { position: sticky; top: 0; z-index: 10; background: var(--jpp-bg); padding: 10px 18px 10px 12px; border-bottom: 1px solid #222; }
      .jpp-topbar-row { display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; justify-content: space-between; }
      .jpp-topbar-left { display: flex; align-items: center; gap: 10px; flex: 1 1 auto; min-width: 0; }
      .jpp-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      .jpp-pill { background: #222; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; }
      .jpp-theme-select { background: #222; color: #fff; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; }
      .jpp-theme-select.light { background: #e0e0e0; color: #333; }
      .jpp-url-manager { display: flex; align-items: center; gap: 8px; margin: 0; padding: 0; flex-wrap: wrap; }
      .jpp-url-bar { width: 100%; margin-top: 20px; font-size: var(--jpp-url-font-size, 16px); color: var(--jpp-toolbar-url-color); word-break: break-all; line-height: var(--jpp-url-line-height, 1.2); font-weight: var(--jpp-url-font-weight, 400); letter-spacing: var(--jpp-url-letter-spacing, 0)ch; font-family: var(--jpp-url-font-family, Fira Mono, monospace); }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function setCSSVars(vars) {
    const root = document.documentElement;
    Object.keys(vars).forEach(k => root.style.setProperty(`--${k}`, vars[k]));
  }

  window.NJPP.styles = { ensureStyle, setCSSVars };
})();


