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


  function renderHighlightColorPicker() {
    return `<div style="display:inline-flex;align-items:center;gap:8px;">
      <span style="color:var(--jpp-key-color);font-size:14px;font-weight:500;">Highlight:</span>
      <input type="color" class="jpp-highlight-color-picker" value="${state.getHighlightColorHex()}" title="Highlight Color" style="width:28px;height:28px;border:2px solid var(--jpp-url-color);border-radius:4px;cursor:pointer;vertical-align:middle;">
      <button class="jpp-highlight-reset" style="margin-left:4px;padding:4px 8px;font-size:12px;background:var(--jpp-url-color);color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:500;">Reset</button>
    </div>`;
  }

  function renderTopBar() {
    const baseUrlVal = utils.escapeHTML(window.location.origin || window.location.host || '');
    return `<div class="jpp-topbar">
      <div class="jpp-topbar-row">
        <div class="jpp-topbar-left">
          ${renderKeyPalette()} ${renderThemeSelect()} ${renderFontSizeSlider()} ${renderHighlightColorPicker()}
        </div>
        <div class="jpp-baseurl-row" style="flex:1 1 auto;display:flex;align-items:center;justify-content:center;gap:8px;min-width:0;">
          <span style="color:var(--jpp-key-color);font-size:14px;font-weight:600;">Base URL:</span>
          <input class="jpp-baseurl-input" type="text" value="${baseUrlVal}" placeholder="https://api.example.com" style="width:220px;max-width:260px;flex:0 0 auto;background:var(--jpp-bg);color:var(--jpp-key-color);border:1px solid var(--jpp-url-color);padding:8px 10px;border-radius:6px;font-size:13px;outline:none;">
          <button class="jpp-baseurl-go jpp-pill" style="flex-shrink:0;padding:7px 12px;font-size:13px;">Publish</button>
        </div>
        <div class="jpp-topbar-right" style="flex:0 0 auto;">
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
    container.innerHTML = renderTopBar() + `
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
      safeRender(json);
    });

    // Initial handlers
    initToggleHandlers(container);
    initCollapsedHandlers(container);
    initKeyContextMenuHandlers(container);
    initValueContextMenuHandlers(container);

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

    // Base URL navigation
    const baseUrlInput = container.querySelector('.jpp-baseurl-input');
    const baseUrlGo = container.querySelector('.jpp-baseurl-go');
    const goToBaseUrl = () => {
      if (!baseUrlInput) return;
      const newOrigin = baseUrlInput.value.trim();
      if (!newOrigin) return;
      const current = window.location;
      let target = null;
      try {
        // Allow inputs without protocol by prefixing current protocol
        const candidate = newOrigin.match(/^https?:\/\//i) ? newOrigin : `${current.protocol}//${newOrigin.replace(/^\/+/, '')}`;
        const u = new URL(candidate);
        target = `${u.origin}${current.pathname}${current.search}${current.hash}`;
      } catch (e) {
        return; // invalid URL, do nothing
      }
      if (target) window.location.href = target;
    };
    if (baseUrlGo) baseUrlGo.onclick = goToBaseUrl;
    if (baseUrlInput) {
      baseUrlInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          goToBaseUrl();
        }
      });
    }

    // Ctrl/Cmd+F
    window.onkeydown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); createFindPopup(); }
    };

    // Copy special: when selecting a collapsed object (with or without its key), copy the full JSON value
    document.addEventListener('copy', e => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const range = sel.rangeCount ? sel.getRangeAt(0) : null;

      const findCollapsed = () => {
        const anchorEl = sel.anchorNode && sel.anchorNode.parentElement;
        const focusEl = sel.focusNode && sel.focusNode.parentElement;
        if (anchorEl) {
          const c = anchorEl.closest('.jpp-collapsed');
          if (c) return c;
          const line = anchorEl.closest('.jpp-line');
          if (line) {
            const c2 = line.querySelector('.jpp-collapsed');
            if (c2) return c2;
          }
        }
        if (focusEl) {
          const c = focusEl.closest('.jpp-collapsed');
          if (c) return c;
          const line = focusEl.closest('.jpp-line');
          if (line) {
            const c2 = line.querySelector('.jpp-collapsed');
            if (c2) return c2;
          }
        }
        if (range && range.commonAncestorContainer && range.commonAncestorContainer.nodeType === 1) {
          const c = range.commonAncestorContainer.querySelector && range.commonAncestorContainer.querySelector('.jpp-collapsed');
          if (c) return c;
        }
        return null;
      };

      const collapsedEl = findCollapsed();
      if (!collapsedEl) return;

      const path = collapsedEl.getAttribute('data-path');
      if (!path) return;

      const value = pathing.getValueAtPath(state.rootJson, path);
      let txt = typeof value === 'object' ? JSON.stringify(value, null, 2) : JSON.stringify(value);

      // If parent is an object (not array), include the key label only when the key is part of the selection
      const parentPath = window.NJPP.pathing.getParentPath(path);
      const parent = parentPath ? window.NJPP.pathing.getValueAtPath(state.rootJson, parentPath) : null;
      const parentIsArray = Array.isArray(parent);
      if (!parentIsArray && path) {
        const keyEl = collapsedEl.closest('.jpp-line')?.querySelector('.jpp-key');
        let includeKey = false;
        if (keyEl) {
          includeKey = keyEl.contains(sel.anchorNode) || keyEl.contains(sel.focusNode);
          if (!includeKey && range) {
            try { includeKey = range.intersectsNode(keyEl); } catch (e) { /* ignore */ }
          }
        }
        if (includeKey) {
          const key = window.NJPP.pathing.getLastKeyFromPath(path);
          if (key !== null && key !== undefined) {
            txt = `"${String(key)}": ${txt}`;
          }
        }
      }

      e.clipboardData.setData('text/plain', txt);
      e.preventDefault();
    });

    // Clear highlight on outside click
    document.addEventListener('mousedown', function clear(e) {
      const h = document.querySelector('.jpp-highlight');
      const popup = document.getElementById('jpp-find-popup');
      if (state.highlightPath && h && !h.contains(e.target) && (!popup || !popup.contains(e.target))) {
        state.highlightPath = null; h.classList.remove('jpp-highlight'); document.removeEventListener('mousedown', clear);
      }
    });


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

  // Right-click menu on keys for quick copy actions
  let keyContextMenu = null;
  function closeKeyContextMenu() {
    if (keyContextMenu && keyContextMenu.parentNode) keyContextMenu.parentNode.removeChild(keyContextMenu);
    keyContextMenu = null;
  }
  let valueContextMenu = null;
  function closeValueContextMenu() {
    if (valueContextMenu && valueContextMenu.parentNode) valueContextMenu.parentNode.removeChild(valueContextMenu);
    valueContextMenu = null;
  }

  function initKeyContextMenuHandlers() {
    if (window.NJPP._keyCtxMenuBound) return;
    window.NJPP._keyCtxMenuBound = true;

    const { pathing, utils } = window.NJPP;

    const addItem = (menu, label, action) => {
      const item = document.createElement('div');
      item.textContent = label;
      item.style.padding = '8px 12px';
      item.style.cursor = 'pointer';
      item.style.color = 'var(--jpp-key-color)';
      item.style.fontSize = '14px';
      item.style.fontWeight = '500';
      item.onmouseenter = () => { item.style.background = 'rgba(255,255,255,0.08)'; };
      item.onmouseleave = () => { item.style.background = 'transparent'; };
      item.onclick = () => { action(); closeKeyContextMenu(); };
      menu.appendChild(item);
    };

    document.addEventListener('click', e => { 
      if (keyContextMenu && !keyContextMenu.contains(e.target)) closeKeyContextMenu(); 
      if (valueContextMenu && !valueContextMenu.contains(e.target)) closeValueContextMenu();
    });
    window.addEventListener('scroll', () => { closeKeyContextMenu(); closeValueContextMenu(); }, true);
    window.addEventListener('resize', () => { closeKeyContextMenu(); closeValueContextMenu(); });

    document.addEventListener('contextmenu', e => {
      const keyEl = e.target.closest('.jpp-key');
      if (!keyEl) { closeKeyContextMenu(); return; }

      const line = keyEl.closest('.jpp-line');
      if (!line) return;
      const path = line.getAttribute('data-jpp-path');
      if (!path) return;

      e.preventDefault();
      e.stopPropagation();
      closeKeyContextMenu();

      const value = pathing.getValueAtPath(state.rootJson, path);
      const isObject = value !== null && typeof value === 'object';
      const keyText = keyEl.textContent.replace(/^\"|\"$/g, '');

      const menu = document.createElement('div');
      keyContextMenu = menu;
      menu.style.position = 'fixed';
      menu.style.zIndex = '10010';
      menu.style.minWidth = '160px';
      menu.style.background = 'var(--jpp-bg)';
      menu.style.color = 'var(--jpp-key-color)';
      menu.style.border = '1px solid rgba(255,255,255,0.15)';
      menu.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
      menu.style.borderRadius = '8px';
      menu.style.padding = '6px 0';
      menu.style.backdropFilter = 'blur(6px)';

      addItem(menu, 'Copy key', () => utils.copyToClipboard(keyText));
      if (isObject) {
        addItem(menu, 'Copy object', () => utils.copyToClipboard(JSON.stringify(value, null, 2)));
      } else {
        addItem(menu, 'Copy value', () => utils.copyToClipboard(JSON.stringify(value)));
      }
      // Copy both key and value/object in JSON snippet form
      const valueSnippet = isObject ? JSON.stringify(value, null, 2) : JSON.stringify(value);
      addItem(menu, 'Copy both', () => utils.copyToClipboard(`"${keyText}": ${valueSnippet}`));

      const maxLeft = window.innerWidth - 200;
      const maxTop = window.innerHeight - 140;
      const left = Math.min(e.clientX, maxLeft);
      const top = Math.min(e.clientY, maxTop);
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;

      document.body.appendChild(menu);
    });
  }

  function initValueContextMenuHandlers() {
    if (window.NJPP._valueCtxMenuBound) return;
    window.NJPP._valueCtxMenuBound = true;

    const { pathing, utils } = window.NJPP;

    const addItem = (menu, label, action) => {
      const item = document.createElement('div');
      item.textContent = label;
      item.style.padding = '8px 12px';
      item.style.cursor = 'pointer';
      item.style.color = 'var(--jpp-key-color)';
      item.style.fontSize = '14px';
      item.style.fontWeight = '500';
      item.onmouseenter = () => { item.style.background = 'rgba(255,255,255,0.08)'; };
      item.onmouseleave = () => { item.style.background = 'transparent'; };
      item.onclick = () => { action(); closeValueContextMenu(); };
      menu.appendChild(item);
    };

    document.addEventListener('contextmenu', e => {
      const valueEl = e.target.closest('.jpp-string, .jpp-number, .jpp-boolean, .jpp-null, .jpp-link');
      if (!valueEl) { closeValueContextMenu(); return; }

      const line = valueEl.closest('.jpp-line');
      if (!line) return;
      const path = line.getAttribute('data-jpp-path');
      if (!path) return;

      // Do not handle if value is an object/array (those use copy object via other handlers)
      const value = pathing.getValueAtPath(state.rootJson, path);
      if (value !== null && typeof value === 'object') { closeValueContextMenu(); return; }

      e.preventDefault();
      e.stopPropagation();
      closeKeyContextMenu();
      closeValueContextMenu();

      const key = window.NJPP.pathing.getLastKeyFromPath(path);
      const keyText = key !== null ? String(key) : null;
      const valueText = JSON.stringify(value);

      const menu = document.createElement('div');
      valueContextMenu = menu;
      menu.style.position = 'fixed';
      menu.style.zIndex = '10010';
      menu.style.minWidth = '160px';
      menu.style.background = 'var(--jpp-bg)';
      menu.style.color = 'var(--jpp-key-color)';
      menu.style.border = '1px solid rgba(255,255,255,0.15)';
      menu.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
      menu.style.borderRadius = '8px';
      menu.style.padding = '6px 0';
      menu.style.backdropFilter = 'blur(6px)';

      addItem(menu, 'Copy value', () => utils.copyToClipboard(valueText));
      addItem(menu, 'Copy both', () => {
        if (keyText !== null) {
          utils.copyToClipboard(`"${keyText}": ${valueText}`);
        } else {
          utils.copyToClipboard(valueText);
        }
      });

      const maxLeft = window.innerWidth - 200;
      const maxTop = window.innerHeight - 140;
      const left = Math.min(e.clientX, maxLeft);
      const top = Math.min(e.clientY, maxTop);
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;

      document.body.appendChild(menu);
    });
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


