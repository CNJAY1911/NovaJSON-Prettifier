(function () {
  window.NJPP = window.NJPP || {};

  const { THEMES } = window.NJPP;

  let currentTheme = "Midnight Neon";
  let COLORS = { ...THEMES[currentTheme] };
  let keyColor = COLORS.key;

  let customHighlightColor = null;
  let customUrlColor = null;

  let urlStyles = {
    color: COLORS.number,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.2',
    letterSpacing: '0',
    fontFamily: 'Fira Mono, monospace'
  };

  let expandState = {};
  let fontSize = 16;
  let rootJson = null;
  let highlightPath = null;
  let lastScrollTop = 0;

  // Load saved theme from storage
  function loadSavedTheme() {
    const { utils } = window.NJPP;
    if (utils && utils.loadFromStorageSync) {
      const savedTheme = utils.loadFromStorageSync('jpp-theme', "Midnight Neon");
      if (THEMES[savedTheme]) {
        currentTheme = savedTheme;
        COLORS = { ...THEMES[currentTheme] };
        keyColor = COLORS.key;
      }
    }
  }

  // Load saved preferences from storage
  function loadSavedPreferences() {
    const { utils } = window.NJPP;
    if (utils && utils.loadFromStorageSync) {
      // Load font size
      const savedFontSize = utils.loadFromStorageSync('jpp-font-size', 16);
      if (savedFontSize >= 12 && savedFontSize <= 28) {
        fontSize = savedFontSize;
      }

      // Load custom highlight color
      const savedHighlightColor = utils.loadFromStorageSync('jpp-highlight-color', null);
      if (savedHighlightColor) {
        customHighlightColor = savedHighlightColor;
      }

      // Load custom URL color
      const savedUrlColor = utils.loadFromStorageSync('jpp-url-color', null);
      if (savedUrlColor) {
        customUrlColor = savedUrlColor;
      }

      // Load URL styles
      const savedUrlStyles = utils.loadFromStorageSync('jpp-url-styles', null);
      if (savedUrlStyles) {
        urlStyles = { ...urlStyles, ...savedUrlStyles };
      }
    }
  }

  // Initialize theme and preferences from storage
  loadSavedTheme();
  loadSavedPreferences();

  function setTheme(name) {
    currentTheme = name;
    COLORS = { ...THEMES[currentTheme] };
    keyColor = COLORS.key;
    
    // Save theme preference to storage
    const { utils } = window.NJPP;
    if (utils && utils.saveToStorage) {
      utils.saveToStorage('jpp-theme', name);
    }
  }

  // Save font size preference
  function setFontSize(size) {
    fontSize = size;
    const { utils } = window.NJPP;
    if (utils && utils.saveToStorage) {
      utils.saveToStorage('jpp-font-size', size);
    }
  }

  // Save custom highlight color
  function setCustomHighlightColor(color) {
    customHighlightColor = color;
    const { utils } = window.NJPP;
    if (utils && utils.saveToStorage) {
      utils.saveToStorage('jpp-highlight-color', color);
    }
  }

  // Save custom URL color
  function setCustomUrlColor(color) {
    customUrlColor = color;
    const { utils } = window.NJPP;
    if (utils && utils.saveToStorage) {
      utils.saveToStorage('jpp-url-color', color);
    }
  }

  // Save URL styles
  function saveUrlStyles() {
    const { utils } = window.NJPP;
    if (utils && utils.saveToStorage) {
      utils.saveToStorage('jpp-url-styles', urlStyles);
    }
  }

  function getThemeHighlightColor() {
    const bg = COLORS.bg.toLowerCase();
    const isLight = ["#ffffff", "#f8fafc", "#fff8e0"].includes(bg) || (bg.startsWith('#') && parseInt(bg.slice(1),16) > 0xaaaaaa);
    return isLight ? 'rgba(255, 100, 0, 0.4)' : 'rgba(255, 255, 0, 0.4)';
  }
  function getHighlightColor() { return customHighlightColor || getThemeHighlightColor(); }
  function getThemeUrlColor() { return COLORS.url; }
  function getUrlColor() { return customUrlColor || getThemeUrlColor(); }
  function getHighlightColorHex() {
    if (customHighlightColor) return customHighlightColor;
    const bg = COLORS.bg.toLowerCase();
    const isLight = ["#ffffff", "#f8fafc", "#fff8e0"].includes(bg) || (bg.startsWith('#') && parseInt(bg.slice(1),16) > 0xaaaaaa);
    return isLight ? '#ff6600' : '#ffff00';
  }

  window.NJPP.state = {
    get currentTheme() { return currentTheme; },
    setTheme,
    get COLORS() { return COLORS; },
    set keyColor(val) { keyColor = val; COLORS.key = val; },
    get keyColor() { return keyColor; },
    customHighlightColorRef: { 
      get value() { return customHighlightColor; }, 
      set value(v) { 
        customHighlightColor = v; 
        setCustomHighlightColor(v);
      } 
    },
    customUrlColorRef: { 
      get value() { return customUrlColor; }, 
      set value(v) { 
        customUrlColor = v; 
        setCustomUrlColor(v);
      } 
    },
    urlStyles,
    expandState,
    get fontSize() { return fontSize; },
    set fontSize(v) { setFontSize(v); },
    get rootJson() { return rootJson; },
    set rootJson(v) { rootJson = v; },
    get highlightPath() { return highlightPath; },
    set highlightPath(v) { highlightPath = v; },
    get lastScrollTop() { return lastScrollTop; },
    set lastScrollTop(v) { lastScrollTop = v; },
    getHighlightColor,
    getUrlColor,
    getThemeUrlColor,
    getHighlightColorHex,
    saveUrlStyles
  };
})();


