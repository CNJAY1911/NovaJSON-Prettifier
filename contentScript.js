(function () {
  // ====================== UTILITIES & GLOBAL STATE ======================
  function isURL(str) { return /^https?:\/\//.test(str); }
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // THEMES (3 light / 3 dark)
  const THEMES = {
    "Midnight Neon" : { bg: "#181a1b", key: "#ffffff", string: "#00e6e6", number: "#ffd700", boolean: "#ff6f00", null: "#ff3b3b", url: "#2196f3" },
    "Graphite Dark" : { bg: "#121212", key: "#b0b0b0", string: "#6ad1e3", number: "#f6d55c", boolean: "#ed553b", null: "#ff3b3b", url: "#4ea1f3" },
    "Solar Dark"    : { bg: "#002b36", key: "#93a1a1", string: "#2aa198", number: "#b58900", boolean: "#cb4b16", null: "#dc322f", url: "#268bd2" },
    "Paper White"   : { bg: "#ffffff", key: "#333333", string: "#008b8b", number: "#a67c00", boolean: "#cc5500", null: "#d00000", url: "#0b5ed7" },
    "Slate Light"   : { bg: "#f5f7fa", key: "#222222", string: "#007f8c", number: "#b38600", boolean: "#cc4e00", null: "#c20000", url: "#005bcc" },
    "Solar Light"   : { bg: "#fdf6e3", key: "#657b83", string: "#2aa198", number: "#b58900", boolean: "#cb4b16", null: "#dc322f", url: "#268bd2" }
  };
  let currentTheme = "Midnight Neon";

  let keyColor = THEMES[currentTheme].key;
  const keyPalette = [
    '#ffffff', '#ffb300', '#00e6e6', '#00bfff', '#ff3b3b', '#00ff99', '#ffd700', '#b0b0b0', '#000000'
  ];

  const COLORS = { ...THEMES[currentTheme], key: keyColor };

  // Add to global state
  let customHighlightColor = null;
  let customUrlColor = null;

  // Default URL styles
  let urlStyles = {
    color: getUrlColor(),
    fontSize: '20px',
    fontWeight: '400',
    lineHeight: '1.2',
    letterSpacing: '0',
    fontFamily: 'Fira Mono, monospace'
  };

  let expandState = {};
  let fontSize = 16;
  const INDENT = 1;
  const rootPath = '__JPP_ROOT__';
  let rootJson = null;
  let highlightPath = null;

  let lastScrollTop = 0;

  // Theme-adaptive highlight color logic
  function getThemeHighlightColor() {
    // Light/dark detection based on bg color
    const bg = COLORS.bg.toLowerCase();
    // Simple heuristic: if bg is very light, use a darker highlight; else, use a light/yellowish one
    const isLight = ["#ffffff", "#f5f7fa", "#fdf6e3"].includes(bg) || (bg.startsWith('#') && parseInt(bg.replace('#',''),16) > 0xaaaaaa);
    return isLight ? 'rgba(255, 230, 0, 0.35)' : 'rgba(255, 255, 100, 0.35)';
  }

  function getHighlightColor() {
    return customHighlightColor || getThemeHighlightColor();
  }
  function getThemeUrlColor() {
    // Use the theme's number color for URL text, but ensure contrast
    return COLORS.number;
  }
  function getUrlColor() {
    return customUrlColor || getThemeUrlColor();
  }

  // Add a function to get a hex color for the color picker
  function getHighlightColorHex() {
    // If user picked a custom color, use it
    if (customHighlightColor) return customHighlightColor;
    // Otherwise, return a theme-appropriate yellow hex
    const bg = COLORS.bg.toLowerCase();
    const isLight = ["#ffffff", "#f5f7fa", "#fdf6e3"].includes(bg) || (bg.startsWith('#') && parseInt(bg.replace('#',''),16) > 0xaaaaaa);
    // Use a yellow that is visible on both backgrounds
    return isLight ? '#fff700' : '#fff964';
  }

  // ====================== STYLE INJECTION ======================
  function applyThemeStyles() {
    let style = document.getElementById('jpp-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'jpp-styles';
    }
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Source+Code+Pro:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&family=Roboto+Mono:wght@400;500;700&family=Inconsolata:wght@400;700&display=swap');
      html, body {
        margin:0 !important;
        padding:0 !important;
        height:100% !important;
        background:${COLORS.bg} !important;
      }
      pre, body > div, body > pre { background:none !important; }
      #jpp-root {
        position:fixed;
        top:0; left:0; right:0; bottom:0;
        overflow:auto;
        background:${COLORS.bg};
      }
      .jpp-tree { position:relative; margin-left:20px !important; color:${COLORS.key}; }
      .jpp-tree::before {
        content:"";
        position:absolute;
        top:0; left:8px; bottom:0;
        width:4px;
        background: radial-gradient(circle, rgba(128,128,128,0.5) 25%, transparent 25%) repeat-y;
        background-size:4px 4px;
      }
      /* ORIGINAL SMALL TOGGLE AREA */
      .jpp-toggle {
        position:absolute !important;
        left:-20px !important;
        cursor:pointer; user-select:none;
      }
      .jpp-highlight { background:${getHighlightColor()} !important; }
      .jpp-theme-select {
        background:#222; color:#fff; border:none; padding:6px 8px; border-radius:4px; cursor:pointer; font-size:13px;
      }
      .jpp-theme-select.light { background:#e0e0e0; color:#333; }
      .jpp-url-manager { margin-top:0 !important; margin-bottom:0 !important; padding:0 !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
    document.body && (document.body.style.background = COLORS.bg);
  }
  applyThemeStyles();

  // ====================== HELPERS ======================
  function copyToClipboard(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement('textarea');
      ta.value = text;
      (document.body || document.documentElement).appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  function getValueAtPath(json, path) {
    if (!path) return json;
    let cur = json;
    const parts = path.match(/(?:\[[^\]]+\]|\.[^\.\[]+)+/g) || [];
    for (let p of parts) {
      if (p.startsWith('.')) p = p.slice(1);
      if (p.startsWith('[') && p.endsWith(']')) p = p.slice(1, -1);
      if (cur && typeof cur === 'object') cur = cur[p];
      else return undefined;
    }
    return cur;
  }

  function syntaxHighlight(value, keyPath, level, isLast, parentIsArray, isRoot) {
    if (typeof value === 'object' && value !== null) {
      const isArray = Array.isArray(value);
      const keys = Object.keys(value);
      const isOpen = isRoot ? true : (expandState[keyPath] !== false);
      const toggleBtn = (!isRoot && keys.length > 0)
        ? `<span class="jpp-toggle" data-path="${keyPath}">${isOpen ? '▼' : '▶'}</span>`
        : '';

      if (keys.length === 0) {
        return `${toggleBtn}
                <span style="color:${COLORS.key};margin-left:2ch;">
                  ${isArray ? '[]' : '{}'}
                </span>${!isLast ? ',' : ''}`;
      }

      if (!isOpen) {
        const count = keys.length;
        const ellipsis = isArray ? `[-${count}-]` : `{-${count}-}`;
        return `<span
                  class="jpp-collapsed jpp-count${highlightPath===keyPath?' jpp-highlight':''}"
                  data-path="${keyPath}"
                  data-jpp-path="${keyPath}"
                  style="color:${COLORS.url};cursor:pointer;user-select:text;"
                >
                  ${toggleBtn}${ellipsis}
                </span>${!isLast ? ',' : ''}`;
      }

      let html = '';
      html += `${toggleBtn}
               <span style="color:${COLORS.key};margin-left:2ch;">
                 ${isArray ? '[' : '{'}
               </span>\n`;
      keys.forEach((k, i) => {
        const childPath = keyPath + (isArray ? `[${k}]` : `.${k}`);
        html += `<div
                   class="jpp-line${highlightPath===childPath?' jpp-highlight':''}"
                   data-jpp-path="${childPath}"
                   style="margin-left:${(level + INDENT)}ch;"
                 >`;
        if (!isArray) {
          html += `<span class="jpp-key" style="color:${COLORS.key};">"${k}"</span>: `;
        }
        html += syntaxHighlight(
          value[k],
          childPath,
          level,
          i === keys.length - 1,
          isArray,
          false
        );
        html += `</div>`;
      });
      html += `<span style="color:${COLORS.key};margin-left:${level}ch;">
                 ${isArray ? ']' : '}'}${!isLast ? ',' : ''}
               </span>`;
      return html;
    }

    // Primitive values (escape HTML so it never renders)
    let val;
    if (typeof value === 'string') {
      const safe = escapeHTML(value);
      if (isURL(value)) {
        val = `<a href="${safe}" target="_blank" style="color:${COLORS.url};text-decoration:underline;">"${safe}"</a>`;
      } else {
        val = `<span style="color:${COLORS.string};">"${safe}"</span>`;
      }
    } else if (typeof value === 'number') {
      val = `<span style="color:${COLORS.number};">${value}</span>`;
    } else if (typeof value === 'boolean') {
      val = `<span style="color:${COLORS.boolean};">${value}</span>`;
    } else if (value === null) {
      val = `<span style="color:${COLORS.null};">null</span>`;
    } else {
      val = '';
    }
    return `${val}${!isLast ? ',' : ''}`;
  }

  function renderTree(json) {
    return `<div class="jpp-line">
              ${syntaxHighlight(json, rootPath, 0, true, false, true)}
            </div>`;
  }

  function renderKeyPalette() {
    return `<div style="display:inline-flex;gap:6px;align-items:center;margin-left:12px;position:relative;">
    <span style="color:#aaa;font-size:13px;">Key color:</span>
    <input
      type="color"
      class="jpp-key-color-picker"
      value="${keyColor}"
      title="Key Color"
      style="width:24px;height:24px;border:none;cursor:pointer;vertical-align:middle;"
    >
  </div>`;
  }

  function renderThemeSelect() {
    const isLight = ["#ffffff", "#f5f7fa", "#fdf6e3"].includes(COLORS.bg);
    return `<select class="jpp-theme-select ${isLight ? 'light' : ''}">
      ${Object.keys(THEMES).map(t => `<option value="${t}" ${t===currentTheme?'selected':''}>${t}</option>`).join('')}
    </select>`;
  }

  function renderFontSizeSlider() {
    return `<div style="display:inline-flex;align-items:center;margin-left:18px;gap:6px;">
      <span style="color:#aaa;font-size:13px;">Font size:</span>
      <input
        type="range"
        min="12"
        max="28"
        value="${fontSize}"
        class="jpp-font-slider"
        style="vertical-align:middle;"
      >
      <span
        class="jpp-font-size-label"
        style="color:#aaa;font-size:13px;min-width:24px;display:inline-block;"
      >${fontSize}px</span>
    </div>`;
  }

  function renderUrlManager(urlStyles) {
    const fonts = [
      { name: 'Fira Mono', css: 'Fira Mono, monospace' },
      { name: 'JetBrains Mono', css: 'JetBrains Mono, monospace' },
      { name: 'Source Code Pro', css: 'Source Code Pro, monospace' },
      { name: 'IBM Plex Mono', css: 'IBM Plex Mono, monospace' },
      { name: 'Roboto Mono', css: 'Roboto Mono, monospace' },
      { name: 'Inconsolata', css: 'Inconsolata, monospace' },
      { name: 'Menlo', css: 'Menlo, monospace' },
      { name: 'Consolas', css: 'Consolas, monospace' },
      { name: 'Courier New', css: 'Courier New, monospace' },
      { name: 'monospace', css: 'monospace' }
    ];
    return `<div class="jpp-url-manager" style="display:flex;align-items:center;gap:8px;margin:0;padding:0;flex-wrap:wrap;">
      <span style="color:#aaa;font-size:13px;">URL text:</span>
      <input type="color" class="jpp-url-color" value="${getUrlColor()}" title="Color" style="width:24px;height:24px;border:none;cursor:pointer;">
      <button class="jpp-url-reset" style="margin-left:2px;padding:2px 6px;font-size:12px;">Reset</button>
      <input type="number" class="jpp-url-fontsize" min="10" max="40" value="${parseInt(urlStyles.fontSize)}" title="Font Size" style="width:48px;">
      <select class="jpp-url-fontweight" title="Font Weight">
        <option value="400" ${urlStyles.fontWeight==='400'?'selected':''}>Normal</option>
        <option value="500" ${urlStyles.fontWeight==='500'?'selected':''}>Medium</option>
        <option value="600" ${urlStyles.fontWeight==='600'?'selected':''}>Semi-Bold</option>
        <option value="700" ${urlStyles.fontWeight==='700'?'selected':''}>Bold</option>
      </select>
      <input type="number" class="jpp-url-lineheight" min="1" max="3" step="0.05" value="${parseFloat(urlStyles.lineHeight)}" title="Line Height" style="width:48px;">
      <input type="number" class="jpp-url-letterspacing" min="0" max="10" step="0.1" value="${parseFloat(urlStyles.letterSpacing)}" title="Letter Spacing" style="width:48px;">
      <select class="jpp-url-fontfamily" title="Font Family">
        ${fonts.map(f => `<option value="${f.css}" ${urlStyles.fontFamily===f.css?'selected':''}>${f.name}</option>`).join('')}
      </select>
    </div>`;
  }

  function renderHighlightColorPicker() {
    return `<div style="display:inline-flex;align-items:center;gap:6px;">
    <span style="color:#aaa;font-size:13px;">Highlight:</span>
    <input type="color" class="jpp-highlight-color-picker" value="${getHighlightColorHex()}" title="Highlight Color" style="width:24px;height:24px;border:none;cursor:pointer;vertical-align:middle;">
    <button class="jpp-highlight-reset" style="margin-left:2px;padding:2px 6px;font-size:12px;">Reset</button>
  </div>`;
  }

  function renderTopBar(urlStyles) {
    return `<div class="jpp-topbar" style="
               position:sticky;
               top:0;
               z-index:10;
               background:${COLORS.bg};
               padding:10px 18px 10px 12px;
               display:flex;
               align-items:center;
               gap:18px;
               border-bottom:1px solid #222;
               flex-wrap:wrap;
             ">
              <button class="jpp-expand" style="background:#222;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:600;">
                Expand All
              </button>
              <button class="jpp-collapse" style="background:#222;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:600;">
                Collapse All
              </button>
              ${renderKeyPalette()}
              ${renderThemeSelect()}
              ${renderFontSizeSlider()}
              ${renderHighlightColorPicker()}
              <div style="flex-basis:100%;height:0;"></div>
              ${renderUrlManager(urlStyles)}
              <div class="jpp-url" style="
                     width:100%;
                     margin-top:4px;
                     font-size:${urlStyles.fontSize};
                     color:${getUrlColor()};
                     word-break:break-all;
                     line-height:${urlStyles.lineHeight};
                     font-weight:${urlStyles.fontWeight};
                     letter-spacing:${urlStyles.letterSpacing}ch;
                     font-family:${urlStyles.fontFamily};
                   ">
                ${escapeHTML(window.location.href)}
              </div>
            </div>`;
  }

  // ====================== SAFE RENDER WRAPPER ======================
  function safeRender(json, afterRenderCb) {
    const root = document.getElementById('jpp-root');
    lastScrollTop = root ? root.scrollTop : window.scrollY;

    render(json);

    requestAnimationFrame(() => {
      const newRoot = document.getElementById('jpp-root');
      if (newRoot) newRoot.scrollTop = lastScrollTop;
      else window.scrollTo(0, lastScrollTop);
      if (afterRenderCb) afterRenderCb();
    });
  }

  // ====================== FIND POPUP ======================
  function createFindPopup() {
    if (document.getElementById('jpp-find-popup')) return;
    const popup = document.createElement('div');
    popup.id = 'jpp-find-popup';
    popup.innerHTML = `
      <div style="
            background:#23272e;
            border-radius:8px 0 0 8px;
            box-shadow:-2px 2px 12px #0006;
            position:fixed;
            top:40px;
            right:0;
            width:340px;
            max-width:90vw;
            height:340px;
            z-index:99999;
            display:flex;
            flex-direction:column;
          ">
        <div style="padding:10px 14px 6px 14px;display:flex;align-items:center;gap:8px;">
          <input
            id="jpp-find-input"
            type="text"
            placeholder="Find..."
            style="flex:1;background:#181a1b;color:#fff;border:none;padding:7px 10px;border-radius:4px;font-size:15px;outline:none;"
          />
          <button
            id="jpp-find-close"
            style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;"
          >×</button>
        </div>
        <div
          id="jpp-find-results"
          style="flex:1;overflow-y:auto;padding:8px 16px 8px 24px;color:#fff;"
        ></div>
      </div>`;
    document.body.appendChild(popup);

    document.getElementById('jpp-find-close').onclick = () => {
      popup.remove();
      highlightPath = null;
    };

    const input = document.getElementById('jpp-find-input');
    input.focus();
    input.oninput = function () {
      const term = this.value.trim().toLowerCase();
      let results = [];
      (function search(obj, path) {
        if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj).forEach(([k, v]) => {
            const childPath = path + (Array.isArray(obj) ? `[${k}]` : `.${k}`);
            if (!Array.isArray(obj) && k.toLowerCase().includes(term)) results.push({ path: childPath, key: k, value: v });
            if (typeof v === 'string' && v.toLowerCase().includes(term)) results.push({ path: childPath, key: k, value: v });
            if (typeof v === 'object' && v !== null) search(v, childPath);
          });
        }
      })(rootJson, '');

      const seen = new Set();
      results = results.filter(r => !seen.has(r.path) && seen.add(r.path));

      const resDiv = document.getElementById('jpp-find-results');
      if (!term) { resDiv.innerHTML = ''; return; }
      if (results.length === 0) {
        resDiv.innerHTML = '<div style="color:#aaa;padding:12px;">No results</div>';
        return;
      }
      resDiv.innerHTML = results.map(r => `
        <div
          class="jpp-find-result"
          data-path="${r.path}"
          style="padding:6px 0;cursor:pointer;color:#fff;"
        >
          <span style="color:${COLORS.number};">${escapeHTML(r.key)}</span>:
          <span style="color:${COLORS.string};">
            ${typeof r.value === 'object'
              ? (Array.isArray(r.value) ? '[...]' : '{...}')
              : escapeHTML(JSON.stringify(r.value))}
          </span>
        </div>
      `).join('');

      resDiv.querySelectorAll('.jpp-find-result').forEach(el => {
        el.onclick = function () {
          const relPath = this.getAttribute('data-path');
          const fullPath = rootPath + relPath;
          highlightPath = fullPath;

          const segments = fullPath.match(/(?:\[[^\]]+\]|\.[^.\[]+)/g) || [];
          let acc = rootPath;
          segments.forEach(seg => { acc += seg; expandState[acc] = true; });

          safeRender(rootJson, () => {
            const tgt = document.querySelector(`[data-jpp-path="${highlightPath}"]`);
            if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        };
      });
    };
  }

  // ====================== MAIN RENDER ======================
  function render(json) {
    rootJson = json;

    if (highlightPath && !document.getElementById('jpp-find-popup')) highlightPath = null;

    if (highlightPath && !highlightPath.startsWith(rootPath)) {
      const full = rootPath + highlightPath;
      const segs = full.match(/(?:\[[^\]]+\]|\.[^\.\[]+)+/g) || [];
      let acc = rootPath;
      segs.forEach(seg => { acc += seg; expandState[acc] = true; });
      highlightPath = full;
    }

    const pre = document.querySelector('pre');
    if (pre) pre.remove();
    const old = document.getElementById('jpp-root');
    if (old) old.remove();
    else {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflowX = 'auto';
      document.body.style.background = COLORS.bg;
    }

    const container = document.createElement('div');
    container.id = 'jpp-root';
    container.innerHTML = renderTopBar(urlStyles) + `
      <div class="jpp-tree" style="
        font-family:monospace;
        font-size:${fontSize}px;
        line-height:1.7;
        letter-spacing:0.04em;
        padding:18px;
        color:${COLORS.key};
      ">
        ${renderTree(json)}
      </div>
    `;
    document.body.appendChild(container);

    // Expand/Collapse
    container.querySelector('.jpp-expand').onclick = () => {
      highlightPath = null;
      expandState = { [rootPath]: true };
      safeRender(json);
    };
    container.querySelector('.jpp-collapse').onclick = () => {
      highlightPath = null;
      (function collapse(o, p) {
        if (typeof o === 'object' && o !== null) {
          if (p !== rootPath) expandState[p] = false;
          Object.keys(o).forEach(k => collapse(o[k], p + (Array.isArray(o) ? `[${k}]` : `.${k}`)));
        }
      })(json, rootPath);
      expandState[rootPath] = true;
      safeRender(json);
    };

    // Theme select
    const themeSel = container.querySelector('.jpp-theme-select');
    themeSel.addEventListener('change', e => {
      currentTheme = e.target.value;
      Object.assign(COLORS, THEMES[currentTheme]);
      keyColor = COLORS.key;
      // Reset highlight and url color to theme default if not custom
      if (!customHighlightColor) {
        applyThemeStyles();
        container.querySelectorAll('.jpp-highlight').forEach(el => {
          el.style.background = getHighlightColor();
        });
      } else {
        applyThemeStyles();
        container.querySelectorAll('.jpp-highlight').forEach(el => {
          el.style.background = getHighlightColor();
        });
      }
      if (!customUrlColor) {
        urlStyles.color = getUrlColor();
        const urlDiv = container.querySelector('.jpp-url');
        if (urlDiv) urlDiv.style.color = urlStyles.color;
        const urlColorInput = container.querySelector('.jpp-url-color');
        if (urlColorInput) urlColorInput.value = getUrlColor();
      }
      safeRender(json);
    });

    // Node toggle
    container.querySelectorAll('.jpp-toggle').forEach(el => {
      el.onclick = e => {
        const path = el.getAttribute('data-path');
        if (path !== rootPath) {
          expandState[path] = !expandState[path];
          safeRender(json);
        }
        e.stopPropagation();
      };
    });

    // Collapsed click -> copy & expand
    container.querySelectorAll('.jpp-collapsed').forEach(el => {
      el.onclick = e => {
        const path = el.getAttribute('data-path');
        const v = getValueAtPath(rootJson, path);
        let txt = typeof v === 'object' ? JSON.stringify(v, null, 2) : JSON.stringify(v);
        if (path && !/\[\d+\]$/.test(path)) {
          const key = path.split('.').pop().replace(/\[|\]/g, '');
          txt = `"${key}": ${txt}`;
        }
        copyToClipboard(txt);
        expandState[path] = true;
        safeRender(json);
        e.stopPropagation();
      };
    });

    // Key color picker
    const keyColorInput = container.querySelector('.jpp-key-color-picker');
    if (keyColorInput) {
      keyColorInput.addEventListener('input', (e) => {
        keyColor = e.target.value;
        COLORS.key = keyColor;
        // Update all key spans live
        container.querySelectorAll('.jpp-key').forEach(span => {
          span.style.color = keyColor;
        });
        // Update tree color live
        const tree = container.querySelector('.jpp-tree');
        if (tree) tree.style.color = keyColor;
      });
    }

    // Font size
    const slider = container.querySelector('.jpp-font-slider');
    const label  = container.querySelector('.jpp-font-size-label');
    slider.addEventListener('input', e => {
      fontSize = +e.target.value;
      const tree = document.querySelector('.jpp-tree');
      if (tree) tree.style.fontSize = fontSize + 'px';
      label.textContent = `${fontSize}px`;
    });

    // Ctrl/Cmd+F
    window.onkeydown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        createFindPopup();
      }
    };

    // Copy event for collapsed nodes
    document.addEventListener('copy', e => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const anc = sel.anchorNode && sel.anchorNode.parentElement;
      if (anc && anc.classList.contains('jpp-collapsed')) {
        const path = anc.getAttribute('data-path');
        const v = getValueAtPath(rootJson, path);
        const txt = typeof v === 'object' ? JSON.stringify(v, null, 2) : JSON.stringify(v);
        e.clipboardData.setData('text/plain', txt);
        e.preventDefault();
      }
    });

    // Click outside highlighted node clears highlight
    document.addEventListener('mousedown', function clear(e) {
      const h = document.querySelector('.jpp-highlight');
      const popup = document.getElementById('jpp-find-popup');
      if (highlightPath && h && !h.contains(e.target) && (!popup || !popup.contains(e.target))) {
        highlightPath = null;
        h.classList.remove('jpp-highlight');
        document.removeEventListener('mousedown', clear);
      }
    });

    // URL manager events
    const urlColor = container.querySelector('.jpp-url-color');
    const urlResetBtn = container.querySelector('.jpp-url-reset');
    const urlFontSize = container.querySelector('.jpp-url-fontsize');
    const urlFontWeight = container.querySelector('.jpp-url-fontweight');
    const urlLineHeight = container.querySelector('.jpp-url-lineheight');
    const urlLetterSpacing = container.querySelector('.jpp-url-letterspacing');
    const urlFontFamily = container.querySelector('.jpp-url-fontfamily');
    const urlDiv = container.querySelector('.jpp-url');
    if (urlColor && urlDiv) {
      urlColor.addEventListener('input', e => {
        customUrlColor = e.target.value || null;
        urlStyles.color = getUrlColor();
        urlDiv.style.color = urlStyles.color;
      });
    }
    if (urlResetBtn && urlDiv) {
      urlResetBtn.addEventListener('click', () => {
        customUrlColor = null;
        urlStyles.color = getUrlColor();
        urlDiv.style.color = urlStyles.color;
        if (urlColor) urlColor.value = getThemeUrlColor();
      });
    }
    if (urlFontSize && urlDiv) {
      urlFontSize.addEventListener('input', e => {
        urlStyles.fontSize = e.target.value + 'px';
        urlDiv.style.fontSize = urlStyles.fontSize;
      });
    }
    if (urlFontWeight && urlDiv) {
      urlFontWeight.addEventListener('change', e => {
        urlStyles.fontWeight = e.target.value;
        urlDiv.style.fontWeight = urlStyles.fontWeight;
      });
    }
    if (urlLineHeight && urlDiv) {
      urlLineHeight.addEventListener('input', e => {
        urlStyles.lineHeight = e.target.value;
        urlDiv.style.lineHeight = urlStyles.lineHeight;
      });
    }
    if (urlLetterSpacing && urlDiv) {
      urlLetterSpacing.addEventListener('input', e => {
        urlStyles.letterSpacing = e.target.value;
        urlDiv.style.letterSpacing = urlStyles.letterSpacing + 'ch';
      });
    }
    if (urlFontFamily && urlDiv) {
      urlFontFamily.addEventListener('change', e => {
        urlStyles.fontFamily = e.target.value;
        urlDiv.style.fontFamily = urlStyles.fontFamily;
      });
    }

    // Highlight color picker events
    const highlightColorInput = container.querySelector('.jpp-highlight-color-picker');
    const highlightResetBtn = container.querySelector('.jpp-highlight-reset');
    if (highlightColorInput) {
      highlightColorInput.addEventListener('input', e => {
        customHighlightColor = e.target.value || null;
        applyThemeStyles();
        // Update all highlights live
        container.querySelectorAll('.jpp-highlight').forEach(el => {
          el.style.background = getHighlightColor();
        });
      });
    }
    if (highlightResetBtn) {
      highlightResetBtn.addEventListener('click', () => {
        customHighlightColor = null;
        applyThemeStyles();
        // Update all highlights live
        container.querySelectorAll('.jpp-highlight').forEach(el => {
          el.style.background = getHighlightColor();
        });
        // Also reset the color picker input to theme default
        if (highlightColorInput) highlightColorInput.value = getHighlightColorHex();
      });
    }
  }

  // ====================== BOOTSTRAP ======================
  function isRawJSON() {
    const pre = document.querySelector('pre');
    if (!pre) return false;
    try { JSON.parse(pre.textContent); return true; }
    catch { return false; }
  }

  if (isRawJSON()) {
    let json;
    try {
      json = JSON.parse(document.querySelector('pre').textContent);
    } catch {
      document.body.innerHTML = '<div style="color:#ff3b3b;padding:24px;font-size:18px;">Invalid JSON</div>';
      return;
    }
    render(json);
  }
})();
