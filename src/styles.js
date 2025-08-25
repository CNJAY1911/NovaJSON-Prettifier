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
      .jpp-tree::before { content: ""; position: fixed; top: 0; left: 40px; bottom: 0; width: 4px; z-index: 10001; pointer-events: none; background: radial-gradient(circle, rgba(255,255,255,0.6) 25%, transparent 25%) repeat-y; background-size: 4px 4px; display: block; }
      .jpp-line {}

      /* Tokens */
      .jpp-key { color: var(--jpp-key-color); font-weight: 500; }
      .jpp-brace { color: var(--jpp-key-color); font-weight: 600; }
      .jpp-string { color: var(--jpp-string-color); font-weight: 500; }
      .jpp-number { color: var(--jpp-number-color); font-weight: 600; }
      .jpp-boolean { color: var(--jpp-boolean-color); font-weight: 600; }
      .jpp-null { color: var(--jpp-null-color); font-weight: 600; }
      .jpp-link { color: var(--jpp-url-color); text-decoration: underline; font-weight: 500; }

      /* Toggle */
      .jpp-toggle { position: absolute !important; left: -60px !important; cursor: pointer; user-select: none; width: 48px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 16px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; z-index: 10002; color: var(--jpp-url-color); font-weight: 600; }
      .jpp-toggle::before { content: ""; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: transparent; }
      .jpp-collapsed { color: var(--jpp-url-color); cursor: pointer; user-select: text; font-weight: 500; }

      /* Highlight */
      .jpp-highlight { background: var(--jpp-highlight-color) !important; border-radius: 3px; padding: 2px 4px; }

      /* Top bar */
      .jpp-topbar { position: sticky; top: 0; z-index: 10; background: var(--jpp-bg); padding: 12px 18px 12px 12px; border-bottom: 2px solid var(--jpp-key-color); }
      .jpp-topbar-row { display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; justify-content: space-between; }
      .jpp-topbar-left { display: flex; align-items: center; gap: 12px; flex: 1 1 auto; min-width: 0; }
      .jpp-topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
      .jpp-pill { background: var(--jpp-url-color); color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s ease; }
      .jpp-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      .jpp-theme-select { background: var(--jpp-url-color); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; }
      .jpp-theme-select:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      .jpp-theme-select.light { background: var(--jpp-url-color); color: #fff; }
      .jpp-url-manager { display: flex; align-items: center; gap: 10px; margin: 0; padding: 0; flex-wrap: wrap; }
      .jpp-url-bar { width: 100%; margin-top: 20px; font-size: var(--jpp-url-font-size, 16px); color: var(--jpp-toolbar-url-color); word-break: break-all; line-height: var(--jpp-url-line-height, 1.2); font-weight: var(--jpp-url-font-weight, 500); letter-spacing: var(--jpp-url-letter-spacing, 0)ch; font-family: var(--jpp-url-font-family, Fira Mono, monospace); padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function setCSSVars(vars) {
    const root = document.documentElement;
    Object.keys(vars).forEach(k => root.style.setProperty(`--${k}`, vars[k]));
  }

  window.NJPP.styles = { ensureStyle, setCSSVars };
})();


