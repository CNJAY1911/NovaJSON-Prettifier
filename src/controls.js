(function () {
  window.NJPP = window.NJPP || {};
  const { state } = window.NJPP;
  const { THEMES, rootPath } = window.NJPP;
  const { dom } = window.NJPP;
  const { utils } = window.NJPP;
  const { renderer } = window.NJPP;
  const { pathing } = window.NJPP;

  function renderKeyPalette() {
    return `<div style="display:inline-flex;gap:8px;align-items:center;margin-left:12px;position:relative;">
      <span style="color:var(--jpp-key-color);font-size:14px;font-weight:500;">Key color:</span>
      <input type="color" class="jpp-key-color-picker" value="${state.keyColor}" title="Key Color" style="width:28px;height:28px;border:2px solid var(--jpp-url-color);border-radius:4px;cursor:pointer;vertical-align:middle;">
    </div>`;
  }

  function renderThemeSelect() {
    const COLORS = state.COLORS;
    const isLight = ["#ffffff", "#f8fafc", "#fff8e0"].includes(COLORS.bg);
    return `<select class="jpp-theme-select ${isLight ? 'light' : ''}">
      ${Object.keys(THEMES).map(t => `<option value="${t}" ${t===state.currentTheme?'selected':''}>${t}</option>`).join('')}
    </select>`;
  }

  function renderFontSizeSlider() {
    return `<div style="display:inline-flex;align-items:center;margin-left:18px;gap:8px;">
      <span style="color:var(--jpp-key-color);font-size:14px;font-weight:500;">Font size:</span>
      <input type="range" min="12" max="28" value="${state.fontSize}" class="jpp-font-slider" style="vertical-align:middle;accent-color:var(--jpp-url-color);">
      <span class="jpp-font-size-label" style="color:var(--jpp-key-color);font-size:14px;min-width:32px;display:inline-block;font-weight:500;">${state.fontSize}px</span>
    </div>`;
  }

  function renderUrlManager(urlStyles) {
    const fonts = [
      { name: 'Fira Mono', css: 'Fira Mono, monospace' }, { name: 'JetBrains Mono', css: 'JetBrains Mono, monospace' },
      { name: 'Source Code Pro', css: 'Source Code Pro, monospace' }, { name: 'IBM Plex Mono', css: 'IBM Plex Mono, monospace' },
      { name: 'Roboto Mono', css: 'Roboto Mono, monospace' }, { name: 'Inconsolata', css: 'Inconsolata, monospace' },
      { name: 'Menlo', css: 'Menlo, monospace' }, { name: 'Consolas', css: 'Consolas, monospace' },
      { name: 'Courier New', css: 'Courier New, monospace' }, { name: 'monospace', css: 'monospace' }
    ];
    return `<div class="jpp-url-manager" style="display:flex;align-items:center;gap:10px;margin:0;padding:0;flex-wrap:wrap;">
      <span style="color:var(--jpp-key-color);font-size:14px;font-weight:500;">URL text:</span>
      <input type="color" class="jpp-url-color" value="${state.urlStyles.color}" title="Color" style="width:28px;height:28px;border:2px solid var(--jpp-url-color);border-radius:4px;cursor:pointer;">
      <button class="jpp-url-reset" style="margin-left:4px;padding:4px 8px;font-size:12px;background:var(--jpp-url-color);color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:500;">Reset</button>
      <input type="number" class="jpp-url-fontsize" min="10" max="40" value="${parseInt(urlStyles.fontSize)}" title="Font Size" style="width:52px;padding:4px;border:1px solid var(--jpp-url-color);border-radius:4px;background:var(--jpp-bg);color:var(--jpp-key-color);">
      <select class="jpp-url-fontweight" title="Font Weight" style="padding:4px;border:1px solid var(--jpp-url-color);border-radius:4px;background:var(--jpp-bg);color:var(--jpp-key-color);">
        <option value="400" ${urlStyles.fontWeight==='400'?'selected':''}>Normal</option>
        <option value="500" ${urlStyles.fontWeight==='500'?'selected':''}>Medium</option>
        <option value="600" ${urlStyles.fontWeight==='600'?'selected':''}>Semi-Bold</option>
        <option value="700" ${urlStyles.fontWeight==='700'?'selected':''}>Bold</option>
      </select>
      <input type="number" class="jpp-url-lineheight" min="1" max="3" step="0.05" value="${parseFloat(urlStyles.lineHeight)}" title="Line Height" style="width:52px;padding:4px;border:1px solid var(--jpp-url-color);border-radius:4px;background:var(--jpp-bg);color:var(--jpp-key-color);">
      <input type="number" class="jpp-url-letterspacing" min="0" max="10" step="0.1" value="${parseFloat(urlStyles.letterSpacing)}" title="Letter Spacing" style="width:52px;padding:4px;border:1px solid var(--jpp-url-color);border-radius:4px;background:var(--jpp-bg);color:var(--jpp-key-color);">
      <select class="jpp-url-fontfamily" title="Font Family" style="padding:4px;border:1px solid var(--jpp-url-color);border-radius:4px;background:var(--jpp-bg);color:var(--jpp-key-color);">
        ${fonts.map(f => `<option value="${f.css}" ${urlStyles.fontFamily===f.css?'selected':''}>${f.name}</option>`).join('')}
      </select>
    </div>`;
  }

  function renderHighlightColorPicker() {
    return `<div style="display:inline-flex;align-items:center;gap:8px;">
      <span style="color:var(--jpp-key-color);font-size:14px;font-weight:500;">Highlight:</span>
      <input type="color" class="jpp-highlight-color-picker" value="${state.getHighlightColorHex()}" title="Highlight Color" style="width:28px;height:28px;border:2px solid var(--jpp-url-color);border-radius:4px;cursor:pointer;vertical-align:middle;">
      <button class="jpp-highlight-reset" style="margin-left:4px;padding:4px 8px;font-size:12px;background:var(--jpp-url-color);color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:500;">Reset</button>
    </div>`;
  }

  function renderTopBar(urlStyles) {
    return `<div class="jpp-topbar">
      <div class="jpp-topbar-row">
        <div class="jpp-topbar-left">
          ${renderKeyPalette()} ${renderThemeSelect()} ${renderFontSizeSlider()} ${renderHighlightColorPicker()} ${renderUrlManager(state.urlStyles)}
        </div>
        <div class="jpp-topbar-right">
          <button class="jpp-expand jpp-pill">Expand All</button>
          <button class="jpp-collapse jpp-pill">Collapse All</button>
        </div>
      </div>
      <div class="jpp-url-bar">
        ${utils.escapeHTML(window.location.href)}
      </div>
    </div>`;
  }

  function render(json) {
    state.rootJson = json;

    if (state.highlightPath && !document.getElementById('jpp-find-popup')) state.highlightPath = null;

    // Initialize expandState for all expandable nodes on first load
    if (Object.keys(state.expandState).length === 0) {
      (function initExpandState(obj, path) {
        if (typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0) {
          if (path !== rootPath) state.expandState[path] = true; // Start expanded
          Object.keys(obj).forEach(k => {
            const childPath = path + (Array.isArray(obj) ? `[${k}]` : `.${k}`);
            initExpandState(obj[k], childPath);
          });
        }
      })(json, rootPath);
    }

    if (state.highlightPath && !state.highlightPath.startsWith(rootPath)) {
      const full = rootPath + state.highlightPath;
      const segs = full.match(/(?:\[[^\]]+\]|\.[^\.\[]+)+/g) || [];
      let acc = rootPath;
      (segs.length ? segs[0].match(/(?:\[[^\]]+\]|\.[^\.\[]+)/g) : []).forEach(seg => { acc += seg; state.expandState[acc] = true; });
      state.highlightPath = full;
    }

    const pre = document.querySelector('pre'); if (pre) pre.remove();
    const old = document.getElementById('jpp-root');
    if (old) old.remove();
    else {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflowX = 'auto';
      document.body.style.background = state.COLORS.bg;
    }

    const container = document.createElement('div');
    container.id = 'jpp-root';
    container.innerHTML = renderTopBar(state.urlStyles) + `
      <div class="jpp-tree">
        ${renderer.renderTree(json)}
      </div>`;
    document.body.appendChild(container);

    // Expand/Collapse All
    container.querySelector('.jpp-expand').onclick = () => { 
      state.highlightPath = null; 
      // Initialize expandState for all expandable nodes
      (function initExpandState(obj, path) {
        if (typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0) {
          if (path !== rootPath) state.expandState[path] = true; // Start expanded
          Object.keys(obj).forEach(k => {
            const childPath = path + (Array.isArray(obj) ? `[${k}]` : `.${k}`);
            initExpandState(obj[k], childPath);
          });
        }
      })(json, rootPath);
      state.expandState[rootPath] = true; // Ensure root is expanded
      safeRender(json); 
    };
    container.querySelector('.jpp-collapse').onclick = () => {
      state.highlightPath = null;
      (function collapse(o, p) {
        if (typeof o === 'object' && o !== null) {
          if (p !== rootPath) state.expandState[p] = false;
          Object.keys(o).forEach(k => collapse(o[k], p + (Array.isArray(o) ? `[${k}]` : `.${k}`)));
        }
      })(json, rootPath);
      state.expandState[rootPath] = true;
      safeRender(json);
    };

    // Theme change
    const themeSel = container.querySelector('.jpp-theme-select');
    themeSel.addEventListener('change', e => {
      state.setTheme(e.target.value);
      dom.applyThemeStyles();
      container.querySelectorAll('.jpp-highlight').forEach(el => { el.style.background = state.getHighlightColor(); });
      if (!state.customUrlColorRef.value) {
        state.urlStyles.color = state.COLORS.number; // Reset to yellow (number color)
        const urlColorInput = container.querySelector('.jpp-url-color');
        if (urlColorInput) urlColorInput.value = state.COLORS.number;
      }
      safeRender(json);
    });

    // Initial handlers
    initToggleHandlers(container);
    initCollapsedHandlers(container);

    // Key color picker
    const keyColorInput = container.querySelector('.jpp-key-color-picker');
    if (keyColorInput) {
      keyColorInput.addEventListener('input', (e) => {
        state.keyColor = e.target.value;
        container.querySelectorAll('.jpp-key').forEach(span => { span.style.color = state.keyColor; });
        const tree = container.querySelector('.jpp-tree'); if (tree) tree.style.color = state.keyColor;
      });
    }

    // Font size
    const slider = container.querySelector('.jpp-font-slider');
    const label  = container.querySelector('.jpp-font-size-label');
    slider.addEventListener('input', e => {
      state.fontSize = +e.target.value;
      const tree = document.querySelector('.jpp-tree');
      if (tree) tree.style.fontSize = state.fontSize + 'px';
      label.textContent = `${state.fontSize}px`;
      requestAnimationFrame(dom.repositionAllToggles);
    });

    // Ctrl/Cmd+F
    window.onkeydown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); createFindPopup(); }
    };

    // Copy special
    document.addEventListener('copy', e => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const anc = sel.anchorNode && sel.anchorNode.parentElement;
      if (anc && anc.classList.contains('jpp-collapsed')) {
        const path = anc.getAttribute('data-path');
        const v = pathing.getValueAtPath(state.rootJson, path);
        const txt = typeof v === 'object' ? JSON.stringify(v, null, 2) : JSON.stringify(v);
        e.clipboardData.setData('text/plain', txt);
        e.preventDefault();
      }
    });

    // Clear highlight on outside click
    document.addEventListener('mousedown', function clear(e) {
      const h = document.querySelector('.jpp-highlight');
      const popup = document.getElementById('jpp-find-popup');
      if (state.highlightPath && h && !h.contains(e.target) && (!popup || !popup.contains(e.target))) {
        state.highlightPath = null; h.classList.remove('jpp-highlight'); document.removeEventListener('mousedown', clear);
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
    const urlDiv = container.querySelector('.jpp-url-bar');
    
    const updateUrlVars = () => dom.applyThemeStyles();
    
    if (urlColor) {
      urlColor.addEventListener('input', e => { 
        state.customUrlColorRef.value = e.target.value || null; 
        state.urlStyles.color = e.target.value || state.getThemeUrlColor(); 
        updateUrlVars();
      });
    }
    if (urlResetBtn) {
      urlResetBtn.addEventListener('click', () => {
        state.customUrlColorRef.value = null; 
        state.urlStyles.color = state.COLORS.number; // Reset to yellow (number color)
        updateUrlVars();
        if (urlColor) urlColor.value = state.COLORS.number;
        state.saveUrlStyles();
      });
    }
    if (urlFontSize) {
      urlFontSize.addEventListener('input', e => { 
        state.urlStyles.fontSize = e.target.value + 'px'; 
        updateUrlVars();
        state.saveUrlStyles();
      });
    }
    if (urlFontWeight) {
      urlFontWeight.addEventListener('change', e => { 
        state.urlStyles.fontWeight = e.target.value; 
        updateUrlVars();
        state.saveUrlStyles();
      });
    }
    if (urlLineHeight) {
      urlLineHeight.addEventListener('input', e => { 
        state.urlStyles.lineHeight = e.target.value; 
        updateUrlVars();
        state.saveUrlStyles();
      });
    }
    if (urlLetterSpacing) {
      urlLetterSpacing.addEventListener('input', e => { 
        state.urlStyles.letterSpacing = e.target.value; 
        updateUrlVars();
        state.saveUrlStyles();
      });
    }
    if (urlFontFamily) {
      urlFontFamily.addEventListener('change', e => { 
        state.urlStyles.fontFamily = e.target.value; 
        updateUrlVars();
        state.saveUrlStyles();
      });
    }

    const highlightColorInput = container.querySelector('.jpp-highlight-color-picker');
    const highlightResetBtn = container.querySelector('.jpp-highlight-reset');
    if (highlightColorInput) {
      highlightColorInput.addEventListener('input', e => {
        state.customHighlightColorRef.value = e.target.value || null;
        dom.applyThemeStyles();
        container.querySelectorAll('.jpp-highlight').forEach(el => { el.style.background = state.getHighlightColor(); });
      });
    }
    if (highlightResetBtn) {
      highlightResetBtn.addEventListener('click', () => {
        state.customHighlightColorRef.value = null; dom.applyThemeStyles();
        container.querySelectorAll('.jpp-highlight').forEach(el => { el.style.background = state.getHighlightColor(); });
        if (highlightColorInput) highlightColorInput.value = state.getHighlightColorHex();
      });
    }

    requestAnimationFrame(dom.repositionAllToggles);
  }

  function safeRender(json, afterRenderCb) {
    const root = document.getElementById('jpp-root');
    state.lastScrollTop = root ? root.scrollTop : window.scrollY;
    render(json);
    requestAnimationFrame(() => {
      const newRoot = document.getElementById('jpp-root');
      if (newRoot) newRoot.scrollTop = state.lastScrollTop; else window.scrollTo(0, state.lastScrollTop);
      if (afterRenderCb) afterRenderCb();
    });
  }

  function initToggleHandlers(scope) {
    const { pathing } = window.NJPP;
    (scope || document).querySelectorAll('.jpp-toggle').forEach(toggle => {
      const line = toggle.closest('.jpp-line') || toggle.parentElement;
      toggle.style.position = 'absolute';
      toggle.style.left = '-48px';
      toggle.style.top = `${line.offsetTop}px`;
      toggle.style.touchAction = 'manipulation';

      toggle.onclick = e => {
        e.stopPropagation();
        const path = toggle.getAttribute('data-path');
        if (!path || path === rootPath) return;
        state.expandState[path] = !state.expandState[path];
        rerenderLine(path);
      };
    });
  }

  function initCollapsedHandlers(scope) {
    (scope || document).querySelectorAll('.jpp-collapsed').forEach(el => {
      el.onclick = e => {
        const path = el.getAttribute('data-path');
        const v = pathing.getValueAtPath(state.rootJson, path);
        let txt = typeof v === 'object' ? JSON.stringify(v, null, 2) : JSON.stringify(v);
        if (path && !/\[\d+\]$/.test(path)) {
          const key = path.split('.').pop().replace(/\[|\]/g, '');
          txt = `"${key}": ${txt}`;
        }
        utils.copyToClipboard(txt);
        state.expandState[path] = true;
        rerenderLine(path);
        e.stopPropagation();
      };
    });
  }

  function rerenderLine(path) {
    const selector = `.jpp-line[data-jpp-path="${window.NJPP.utils.cssEscapeAttr(path)}"]`;
    const line = document.querySelector(selector);
    if (!line) { safeRender(state.rootJson); return; }

    const ml = parseFloat(line.style.marginLeft) || 0;
    const level = Math.max(0, ml - window.NJPP.INDENT);
    const parentIsArray = isParentArray(path);
    const lastKey = window.NJPP.pathing.getLastKeyFromPath(path);
    const isLast = isLastInParent(path);
    const value = window.NJPP.pathing.getValueAtPath(state.rootJson, path);

    let html = '';
    if (!parentIsArray && lastKey !== null) {
      html += `<span class="jpp-key" style="color:${state.COLORS.key};">"${String(lastKey)}"</span>:`;
    }
    html += ' ' + renderer.syntaxHighlight(value, path, level, isLast, parentIsArray, false);

    line.innerHTML = html;

    initToggleHandlers(line);
    initCollapsedHandlers(line);
    requestAnimationFrame(dom.repositionAllToggles);
  }

  function getParentPath(path) {
    return window.NJPP.pathing.getParentPath(path);
  }

  function isParentArray(path) {
    const pp = getParentPath(path);
    const parent = pp ? window.NJPP.pathing.getValueAtPath(state.rootJson, pp) : null;
    return Array.isArray(parent);
  }

  function isLastInParent(path) {
    const pp = getParentPath(path);
    if (!pp) return true;
    const parent = window.NJPP.pathing.getValueAtPath(state.rootJson, pp);
    if (parent && typeof parent === 'object') {
      const keys = Object.keys(parent);
      const lk = String(window.NJPP.pathing.getLastKeyFromPath(path));
      return keys.indexOf(lk) === keys.length - 1;
    }
    return true;
  }

  function createFindPopup() {
    if (document.getElementById('jpp-find-popup')) return;
    const popup = document.createElement('div');
    popup.id = 'jpp-find-popup';
    
    // Use theme colors for light themes to match JSON tree colors
    const isLight = ["#ffffff", "#f8fafc", "#fff8e0"].includes(state.COLORS.bg);
    const popupBg = isLight ? state.COLORS.bg : 'var(--jpp-bg)';
    const popupBorder = isLight ? state.COLORS.url : 'var(--jpp-url-color)';
    const popupText = isLight ? state.COLORS.key : 'var(--jpp-key-color)';
    const inputBg = isLight ? state.COLORS.bg : 'var(--jpp-bg)';
    const inputBorder = isLight ? state.COLORS.url : 'var(--jpp-url-color)';
    const inputText = isLight ? state.COLORS.key : 'var(--jpp-key-color)';
    const closeBtnBg = isLight ? state.COLORS.url : 'var(--jpp-url-color)';
    const resultsText = isLight ? state.COLORS.key : 'var(--jpp-key-color)';
    
    // Position popup at the bottom of the top toolbar divider line
    const topbar = document.querySelector('.jpp-topbar');
    const topbarBottom = topbar ? topbar.getBoundingClientRect().bottom : 80; // fallback to 80px if topbar not found
    
    popup.innerHTML = `
      <div style="background:${popupBg};border:2px solid ${popupBorder};border-radius:8px 0 0 8px;box-shadow:-2px 2px 12px #0006;position:fixed;top:${topbarBottom}px;right:0;width:340px;max-width:90vw;height:340px;z-index:99999;display:flex;flex-direction:column;">
        <div style="padding:10px 14px 6px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid ${popupBorder};">
          <input id="jpp-find-input" type="text" placeholder="Find..." style="flex:1;background:${inputBg};color:${inputText};border:2px solid ${inputBorder};padding:7px 10px;border-radius:4px;font-size:15px;outline:none;font-weight:500;"/>
          <button id="jpp-find-close" style="background:${closeBtnBg};border:none;color:#fff;font-size:20px;cursor:pointer;width:28px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:600;">×</button>
        </div>
        <div id="jpp-find-results" style="flex:1;overflow-y:auto;padding:8px 16px 8px 24px;color:${resultsText};"></div>
      </div>`;
    document.body.appendChild(popup);

    // Prevent popup from losing focus when clicking inside it
    popup.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const input = document.getElementById('jpp-find-input');
      if (input) {
        input.focus();
        // Restore cursor position if there's text
        if (input.value) {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    });

    document.getElementById('jpp-find-close').onclick = () => { popup.remove(); state.highlightPath = null; };

    const input = document.getElementById('jpp-find-input');
    input.focus();
    
    // Keyboard navigation variables
    let selectedIndex = -1;
    let searchResults = [];
    
    // Handle keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (searchResults.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (selectedIndex < searchResults.length - 1) {
            selectedIndex++;
            updateSelection();
            scrollToSelected();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (selectedIndex > 0) {
            selectedIndex--;
            updateSelection();
            scrollToSelected();
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            selectResult(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          popup.remove();
          state.highlightPath = null;
          break;
      }
    });
    
    // Update visual selection
    function updateSelection() {
      const results = document.querySelectorAll('.jpp-find-result');
      results.forEach((el, index) => {
        if (index === selectedIndex) {
          el.style.background = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
          el.style.borderColor = popupBorder;
          el.style.borderWidth = '2px';
        } else {
          el.style.background = 'transparent';
          el.style.borderColor = 'transparent';
          el.style.borderWidth = '1px';
        }
      });
    }
    
    // Scroll to keep selected element visible
    function scrollToSelected() {
      if (selectedIndex < 0) return;
      
      const resultsContainer = document.getElementById('jpp-find-results');
      const selectedElement = resultsContainer.children[selectedIndex];
      
      if (selectedElement) {
        const containerRect = resultsContainer.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        
        // Check if element is above visible area
        if (elementRect.top < containerRect.top) {
          selectedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
        // Check if element is below visible area
        else if (elementRect.bottom > containerRect.bottom) {
          selectedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
    }
    
    // Select and navigate to result
    function selectResult(result) {
      const relPath = result.path;
      const fullPath = rootPath + relPath;
      state.highlightPath = fullPath;

      const segments = fullPath.match(/(?:\[[^\]]+\]|\.[^\.\[]+)/g) || [];
      let acc = rootPath;
      segments.forEach(seg => { acc += seg; state.expandState[acc] = true; });

      safeRender(state.rootJson, () => {
        const tgt = document.querySelector(`[data-jpp-path="${utils.cssEscapeAttr(state.highlightPath)}"]`);
        if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    
    input.oninput = function () {
      const term = this.value.trim().toLowerCase();
      searchResults = [];
      selectedIndex = -1;
      
      (function search(obj, path) {
        if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj).forEach(([k, v]) => {
            const childPath = path + (Array.isArray(obj) ? `[${k}]` : `.${k}`);
            
            // Search object keys (for non-array objects)
            if (!Array.isArray(obj) && k.toLowerCase().includes(term)) {
              searchResults.push({ path: childPath, key: k, value: v });
            }
            
            // Search array indices (for arrays)
            if (Array.isArray(obj) && k.toLowerCase().includes(term)) {
              searchResults.push({ path: childPath, key: k, value: v });
            }
            
            // Search string values
            if (typeof v === 'string' && v.toLowerCase().includes(term)) {
              searchResults.push({ path: childPath, key: k, value: v });
            }
            
            // Search number values
            if (typeof v === 'number' && v.toString().includes(term)) {
              searchResults.push({ path: childPath, key: k, value: v });
            }
            
            // Search boolean values
            if (typeof v === 'boolean' && v.toString().includes(term)) {
              searchResults.push({ path: childPath, key: k, value: v });
            }
            
            // Search null values
            if (v === null && term === 'null') {
              searchResults.push({ path: childPath, key: k, value: v });
            }
            
            // Recursively search nested objects
            if (typeof v === 'object' && v !== null) {
              search(v, childPath);
            }
          });
        }
      })(state.rootJson, '');

      const seen = new Set();
      searchResults = searchResults.filter(r => !seen.has(r.path) && seen.add(r.path));

      const resDiv = document.getElementById('jpp-find-results');
      if (!term) { 
        resDiv.innerHTML = ''; 
        searchResults = [];
        selectedIndex = -1;
        return; 
      }
      if (searchResults.length === 0) { 
        resDiv.innerHTML = '<div style="color:' + resultsText + ';padding:12px;text-align:center;font-weight:500;">No results found</div>'; 
        selectedIndex = -1;
        return; 
      }

      resDiv.innerHTML = searchResults.map(r => `
        <div class="jpp-find-result" data-path="${r.path}" style="padding:6px 0;cursor:pointer;color:${resultsText};border-radius:4px;margin-bottom:2px;transition:all 0.2s ease;border:1px solid transparent;">
          <span style="color:${state.COLORS.number};font-weight:600;">${utils.escapeHTML(r.key)}</span>:
          <span style="color:${state.COLORS.string};font-weight:500;">${typeof r.value === 'object' ? (Array.isArray(r.value) ? '[...]' : '{...}') : utils.escapeHTML(JSON.stringify(r.value))}</span>
        </div>
      `).join('');

      // Add hover effects and click handlers to results
      resDiv.querySelectorAll('.jpp-find-result').forEach((el, index) => {
        el.onmouseenter = function() {
          selectedIndex = index;
          updateSelection();
        };
        el.onmouseleave = function() {
          // Don't clear selection on mouse leave for keyboard navigation
        };
        
        el.onclick = function () {
          selectResult(searchResults[index]);
        };
      });
      
      // Auto-select first result when typing
      if (searchResults.length > 0) {
        selectedIndex = 0;
        updateSelection();
      }
    };
  }

  window.NJPP.controls = { render, safeRender, initToggleHandlers, initCollapsedHandlers, rerenderLine, createFindPopup };
})();


