(function () {
  // ====================== UTILITIES & GLOBAL STATE ======================
  function isURL(str) { return /^https?:\/\//.test(str); }

  let keyColor = '#fff';
  const keyPalette = ['#fff', '#ffb300', '#00e6e6', '#00bfff', '#ff3b3b', '#00ff99', '#ffd700', '#b0b0b0'];

  const COLORS = {
    string: '#00e6e6',
    number: '#ffd700',
    boolean: '#ff6f00',
    null: '#ff3b3b',
    url: '#2196f3',
    key: keyColor
  };

  let expandState = {};
  let fontSize = 16;
  const INDENT = 1;
  const rootPath = '__JPP_ROOT__';
  let rootJson = null;
  let highlightPath = null;

  // Cache scroll
  let lastScrollTop = 0;

  // ====================== ALWAYS-INJECTED STYLES (gutter + kill Google bg) ======================
  (function injectBaseStyles() {
    let style = document.getElementById('jpp-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'jpp-styles';
      document.head.appendChild(style);
    }
    style.textContent = `
      html, body {
        margin:0 !important;
        padding:0 !important;
        height:100% !important;
        background:#181a1b !important;
      }
      /* Kill Google JSON viewer background (they set it on PRE, DIV, etc.) */
      pre, body > div, body > pre {
        background:none !important;
      }
      #jpp-root {
        position:fixed;
        top:0;
        left:0;
        right:0;
        bottom:0;
        overflow:auto;
        background:#181a1b;
      }
      .jpp-tree {
        position:relative;
        margin-left:20px !important;
      }
      .jpp-tree::before {
        content:"";
        position:absolute;
        top:0;
        left:8px;
        bottom:0;
        width:4px;
        background:
          radial-gradient(circle, rgba(128,128,128,0.5) 25%, transparent 25%)
          repeat-y;
        background-size:4px 4px;
      }
      .jpp-toggle {
        position:absolute !important;
        left:-20px !important;
      }
      .jpp-highlight {
        background:rgba(255,255,0,0.3) !important;
      }
    `;
  })();

  // ====================== HELPERS ======================
  function copyToClipboard(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
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
        ? `<span class="jpp-toggle" data-path="${keyPath}" style="cursor:pointer;user-select:none;">
             ${isOpen ? '▼' : '▶'}
           </span>`
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
                  style="color:#2196f3;cursor:pointer;user-select:text;"
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
          html += `<span style="color:${COLORS.key};">"${k}"</span>: `;
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

    let val;
    if (typeof value === 'string') {
      if (isURL(value)) {
        val = `<a href="${value}" target="_blank" style="color:${COLORS.url};text-decoration:underline;">
                 "${value}"
               </a>`;
      } else {
        val = `<span style="color:${COLORS.string};">"${value}"</span>`;
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
    return `<div style="display:inline-flex;gap:6px;align-items:center;margin-left:12px;">
      <span style="color:#aaa;font-size:13px;">Key color:</span>
      ${keyPalette.map(color => `
        <span
          class="jpp-key-color"
          data-color="${color}"
          style="
            display:inline-block;
            width:18px;
            height:18px;
            border-radius:4px;
            background:${color};
            border:2px solid ${keyColor===color?'#2196f3':'#444'};
            cursor:pointer;
          "
        ></span>
      `).join('')}
    </div>`;
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

  function renderTopBar() {
    return `<div class="jpp-topbar" style="
               position:sticky;
               top:0;
               z-index:10;
               background:#181a1b;
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
              ${renderFontSizeSlider()}
              <div style="flex-basis:100%;height:0;"></div>
              <div class="jpp-url" style="
                     width:100%;
                     margin-top:8px;
                     font-size:20px;
                     color:#ffd700;
                     word-break:break-all;
                     line-height:1.2;
                   ">
                ${window.location.href}
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
          style="flex:1;overflow-y:auto;padding:8px 16px 8px 24px;"
        ></div>
      </div>`;
    document.body.appendChild(popup);

    document.getElementById('jpp-find-close').onclick = () => {
      popup.remove();
      highlightPath = null;
      // no render => scroll preserved
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
            if (!Array.isArray(obj) && k.toLowerCase().includes(term)) {
              results.push({ path: childPath, key: k, value: v });
            }
            if (typeof v === 'string' && v.toLowerCase().includes(term)) {
              results.push({ path: childPath, key: k, value: v });
            }
            if (typeof v === 'object' && v !== null) {
              search(v, childPath);
            }
          });
        }
      })(rootJson, '');

      // dedupe
      const seen = new Set();
      results = results.filter(r => !seen.has(r.path) && seen.add(r.path));

      const resDiv = document.getElementById('jpp-find-results');
      if (!term) {
        resDiv.innerHTML = '';
        return;
      }
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
          <span style="color:#ffd700;">${r.key}</span>:
          <span style="color:#00e6e6;">
            ${typeof r.value === 'object'
              ? (Array.isArray(r.value) ? '[...]' : '{...}')
              : JSON.stringify(r.value)}
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
          segments.forEach(seg => {
            acc += seg;
            expandState[acc] = true;
          });

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

    if (highlightPath && !document.getElementById('jpp-find-popup')) {
      highlightPath = null;
    }

    if (highlightPath && !highlightPath.startsWith(rootPath)) {
      const full = rootPath + highlightPath;
      const segs = full.match(/(?:\[[^\]]+\]|\.[^\.\[]+)+/g) || [];
      let acc = rootPath;
      segs.forEach(seg => {
        acc += seg;
        expandState[acc] = true;
      });
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
    }

    const container = document.createElement('div');
    container.id = 'jpp-root';
    container.innerHTML = renderTopBar() + `
      <div class="jpp-tree" style="
        font-family:monospace;
        font-size:${fontSize}px;
        line-height:1.7;
        letter-spacing:0.04em;
        padding:18px;
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
    container.querySelectorAll('.jpp-key-color').forEach(el => {
      el.onclick = () => {
        keyColor = el.getAttribute('data-color');
        COLORS.key = keyColor;
        safeRender(json);
      };
    });

    // Font size
    const slider = container.querySelector('.jpp-font-slider');
    const label = container.querySelector('.jpp-font-size-label');
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
