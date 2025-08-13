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

  function setTheme(name) {
    currentTheme = name;
    COLORS = { ...THEMES[currentTheme] };
    keyColor = COLORS.key;
  }

  function getThemeHighlightColor() {
    const bg = COLORS.bg.toLowerCase();
    const isLight = ["#ffffff", "#f5f7fa", "#fdf6e3"].includes(bg) || (bg.startsWith('#') && parseInt(bg.slice(1),16) > 0xaaaaaa);
    return isLight ? 'rgba(255, 230, 0, 0.35)' : 'rgba(255, 255, 100, 0.35)';
  }
  function getHighlightColor() { return customHighlightColor || getThemeHighlightColor(); }
  function getThemeUrlColor() { return COLORS.url; }
  function getUrlColor() { return customUrlColor || getThemeUrlColor(); }
  function getHighlightColorHex() {
    if (customHighlightColor) return customHighlightColor;
    const bg = COLORS.bg.toLowerCase();
    const isLight = ["#ffffff", "#f5f7fa", "#fdf6e3"].includes(bg) || (bg.startsWith('#') && parseInt(bg.slice(1),16) > 0xaaaaaa);
    return isLight ? '#fff700' : '#fff964';
  }

  window.NJPP.state = {
    get currentTheme() { return currentTheme; },
    setTheme,
    get COLORS() { return COLORS; },
    set keyColor(val) { keyColor = val; COLORS.key = val; },
    get keyColor() { return keyColor; },
    customHighlightColorRef: { get value() { return customHighlightColor; }, set value(v) { customHighlightColor = v; } },
    customUrlColorRef: { get value() { return customUrlColor; }, set value(v) { customUrlColor = v; } },
    urlStyles,
    expandState,
    get fontSize() { return fontSize; },
    set fontSize(v) { fontSize = v; },
    get rootJson() { return rootJson; },
    set rootJson(v) { rootJson = v; },
    get highlightPath() { return highlightPath; },
    set highlightPath(v) { highlightPath = v; },
    get lastScrollTop() { return lastScrollTop; },
    set lastScrollTop(v) { lastScrollTop = v; },
    getHighlightColor,
    getUrlColor,
    getThemeUrlColor,
    getHighlightColorHex
  };
})();


