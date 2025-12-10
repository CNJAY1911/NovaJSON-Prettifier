 (function () {
  window.NJPP = window.NJPP || {};
  const { state } = window.NJPP;
  const { styles } = window.NJPP;

  function applyThemeStyles() {
    styles.ensureStyle();
    const COLORS = state.COLORS;
    styles.setCSSVars({
      'jpp-bg': COLORS.bg,
      'jpp-key-color': COLORS.key,
      'jpp-string-color': COLORS.string,
      'jpp-number-color': COLORS.number,
      'jpp-boolean-color': COLORS.boolean,
      'jpp-null-color': COLORS.null,
      'jpp-url-color': COLORS.url, // JSON tree URLs (blue)
      'jpp-toolbar-url-color': state.getUrlColor(), // Top toolbar URL text (theme-adaptive)
      'jpp-highlight-color': state.getHighlightColor(),
      'jpp-tree-font-size': state.fontSize + 'px',
      'jpp-url-font-size': state.urlStyles.fontSize,
      'jpp-url-line-height': state.urlStyles.lineHeight,
      'jpp-url-letter-spacing': state.urlStyles.letterSpacing,
      'jpp-url-font-weight': state.urlStyles.fontWeight,
      'jpp-url-font-family': state.urlStyles.fontFamily
    });
    if (document.body) document.body.style.background = COLORS.bg;
    const html = document.documentElement; if (html) { html.style.margin = '0'; html.style.padding = '0'; }
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


