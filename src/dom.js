(function () {
  window.NJPP = window.NJPP || {};
  const { state } = window.NJPP;

  function applyThemeStyles() {
    const COLORS = state.COLORS;
    const getHighlightColor = state.getHighlightColor;

    let style = document.getElementById('jpp-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'jpp-styles';
    }
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Source+Code+Pro:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&family=Roboto+Mono:wght@400;500;700&family=Inconsolata:wght@400;700&display=swap');
      html, body { margin:0 !important; padding:0 !important; height:100% !important; background:${COLORS.bg} !important; }
      pre, body > div, body > pre { background:none !important; }
      #jpp-root { position:fixed; top:0; left:0; right:0; bottom:0; overflow:auto; background:${COLORS.bg}; }
      .jpp-tree { position:relative; margin-left:56px !important; color:${COLORS.key}; z-index:1; }
      .jpp-tree::before {
        content:""; position:fixed; top:0; left:40px; bottom:0; width:4px; z-index:10001; pointer-events:none;
        background: radial-gradient(circle, rgba(128,128,128,0.5) 25%, transparent 25%) repeat-y; background-size:4px 4px; display:block;
      }
      .jpp-toggle {
        position: absolute !important;
        left: -48px !important;
        cursor: pointer; user-select: none; width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center; font-size: 16px;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent; z-index: 10002;
      }
      .jpp-highlight { background:${getHighlightColor()} !important; }
      .jpp-theme-select { background:#222; color:#fff; border:none; padding:6px 8px; border-radius:4px; cursor:pointer; font-size:13px; }
      .jpp-theme-select.light { background:#e0e0e0; color:#333; }
      .jpp-url-manager { margin-top:0 !important; margin-bottom:0 !important; padding:0 !important; }
      #jpp-sidebar { position: fixed; top: 0; left: 0; width: 36px; height: 100vh; background: #222; z-index: 10000;
        display: flex; flex-direction: column; align-items: center; padding-top: 60px; box-shadow: 2px 0 8px rgba(0,0,0,0.08); }
      .jpp-sidebar-toggle { width: 12px; height: 36px; margin: 6px 0; display: flex; align-items: center; justify-content: center;
        background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; border-radius: 6px; transition: background 0.2s; }
      .jpp-sidebar-toggle.active { background: #444; }
      .jpp-sidebar-toggle:hover { background: #333; }
    `;
    (document.head || document.documentElement).appendChild(style);
    if (document.body) document.body.style.background = COLORS.bg;
  }

  function repositionAllToggles() {
    const tree = document.querySelector('.jpp-tree');
    if (!tree) return;
    tree.querySelectorAll('.jpp-toggle').forEach(t => {
      const line = t.closest('.jpp-line') || t.parentElement;
      t.style.position = 'absolute';
      t.style.left = '-48px';
      t.style.top = `${line.offsetTop}px`;
    });
  }

  window.NJPP.dom = { applyThemeStyles, repositionAllToggles };
})();


