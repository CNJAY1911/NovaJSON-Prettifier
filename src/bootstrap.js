(function () {
  if (window.NovaJSONPrettifierActive) return;
  window.NovaJSONPrettifierActive = true;

  window.NJPP = window.NJPP || {};

  const { utils } = window.NJPP;
  const { dom } = window.NJPP;
  const { controls } = window.NJPP;

  function getRawJSONText() {
    const pre = document.querySelector('pre');
    if (pre) return pre.textContent.trim();
    return document.body && document.body.childElementCount === 0
      ? document.body.textContent.trim()
      : null;
  }

  function isRawJSON() {
    const text = getRawJSONText();
    if (!text) return false;
    try { JSON.parse(text); return true; } catch { return false; }
  }

  if (!isRawJSON()) return;

  // Ensure theme is loaded before applying styles
  async function initializeExtension() {
    // If we have async storage, wait for theme to load
    if (utils && utils.loadFromStorage) {
      try {
        const savedTheme = await utils.loadFromStorage('jpp-theme', "Midnight Neon");
        const { state } = window.NJPP;
        const { THEMES } = window.NJPP;
        if (THEMES[savedTheme] && state.currentTheme !== savedTheme) {
          state.setTheme(savedTheme);
        }

        // Load other preferences asynchronously
        const savedFontSize = await utils.loadFromStorage('jpp-font-size', 16);
        if (savedFontSize >= 12 && savedFontSize <= 28) {
          state.fontSize = savedFontSize;
        }

        const savedHighlightColor = await utils.loadFromStorage('jpp-highlight-color', null);
        if (savedHighlightColor) {
          state.customHighlightColorRef.value = savedHighlightColor;
        }

        const savedUrlColor = await utils.loadFromStorage('jpp-url-color', null);
        if (savedUrlColor) {
          state.customUrlColorRef.value = savedUrlColor;
        }

        const savedUrlStyles = await utils.loadFromStorage('jpp-url-styles', null);
        if (savedUrlStyles) {
          Object.assign(state.urlStyles, savedUrlStyles);
        }
      } catch (e) {
        console.warn('Failed to load saved preferences:', e);
      }
    }

    // Apply theme styles
    dom.applyThemeStyles();

    const text = getRawJSONText();
    if (!text) return;
    let json;
    try { json = JSON.parse(text); }
    catch { document.body.innerHTML = '<div style="color:#ff3b3b;padding:24px;font-size:18px;">Invalid JSON</div>'; return; }

    document.body.innerHTML = '';
    controls.safeRender(json);
  }

  // Start initialization
  initializeExtension();
})();


