(function () {
  if (window.NovaJSONPrettifierActive) return;
  window.NovaJSONPrettifierActive = true;

  window.NJPP = window.NJPP || {};

  const { utils } = window.NJPP;
  const { dom } = window.NJPP;
  const { controls } = window.NJPP;

  // Heuristic: only run when the page really looks like a JSON response
  function getRawJSONText() {
    if (!document.body) return null;

    // Strict: only accept a single <pre> element that is the sole body child
    if (document.body.childElementCount === 1 && document.body.firstElementChild?.tagName === 'PRE') {
      return document.body.firstElementChild.textContent.trim();
    }

    // Fallback: completely empty body with text only (no elements)
    if (document.body.childElementCount === 0) {
      const txt = document.body.textContent.trim();
      return txt || null;
    }

    return null;
  }

  function tryParseJSON(text) {
    if (!text) return null;
    const t = text.trim();
    if (!t || (t[0] !== '{' && t[0] !== '[')) return null;
    try { return JSON.parse(t); } catch { return null; }
  }

  function isRawJSON() {
    const text = getRawJSONText();
    return !!tryParseJSON(text);
  }

  function isLikelyJSONContentType() {
    const ct = (document.contentType || '').toLowerCase();
    return ct.includes('json') || ct.includes('javascript');
  }

  function getFallbackJSONText() {
    // Prefer the first <pre> if present anywhere
    const pre = document.querySelector('pre');
    if (pre) return pre.textContent.trim();
    // Otherwise, attempt full body text when there are very few elements
    if (document.body && document.body.childElementCount <= 4) {
      const txt = document.body.textContent.trim();
      if (txt) return txt;
    }
    return null;
  }

  function addManualApplyButton(parseAndRun) {
    if (window.NJPP && window.NJPP._manualBtnAdded) return;
    window.NJPP = window.NJPP || {};
    window.NJPP._manualBtnAdded = true;

    const btn = document.createElement('button');
    btn.textContent = 'Apply JSON formatter';
    btn.style.position = 'fixed';
    btn.style.top = '12px';
    btn.style.right = '12px';
    btn.style.zIndex = '2147483647';
    btn.style.padding = '10px 14px';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.background = '#2563eb';
    btn.style.color = '#fff';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '600';
    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '0.92';
    btn.style.backdropFilter = 'blur(6px)';
    btn.onmouseenter = () => btn.style.opacity = '1';
    btn.onmouseleave = () => btn.style.opacity = '0.92';

    btn.onclick = () => {
      const text = getFallbackJSONText();
      const parsed = tryParseJSON(text);
      if (!parsed) {
        alert('Could not find valid JSON on this page to format.');
        return;
      }
      btn.remove();
      parseAndRun(parsed);
    };

    document.body.appendChild(btn);
  }

  // Ensure theme is loaded before applying styles
  async function initializeExtension(preParsedJson) {
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

    let json = preParsedJson;
    if (!json) {
      const text = getRawJSONText();
      json = tryParseJSON(text);
    }
    if (!json) {
      document.body.innerHTML = '<div style="color:#ff3b3b;padding:24px;font-size:18px;">Invalid JSON</div>';
      return;
    }

    document.body.innerHTML = '';
    controls.safeRender(json);
  }

  // Decide whether to auto-run or provide manual button
  const rawParsed = tryParseJSON(getRawJSONText());
  const likelyJSON = isLikelyJSONContentType();

  if (rawParsed) {
    initializeExtension(rawParsed);
    return;
  }

  if (likelyJSON) {
    const fallbackParsed = tryParseJSON(getFallbackJSONText());
    if (fallbackParsed) {
      initializeExtension(fallbackParsed);
    } else {
      addManualApplyButton(initializeExtension);
    }
  }
})();


