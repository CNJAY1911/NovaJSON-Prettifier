(function () {
  window.NJPP = window.NJPP || {};
  const { state } = window.NJPP;
  const { INDENT, rootPath } = window.NJPP;
  const { utils } = window.NJPP;

  function syntaxHighlight(value, keyPath, level, isLast, parentIsArray, isRoot) {
    const COLORS = state.COLORS;
    const expandState = state.expandState;
    const highlightPath = state.highlightPath;

    if (typeof value === 'object' && value !== null) {
      const isArray = Array.isArray(value);
      const keys = Object.keys(value);
      const isOpen = isRoot ? true : (expandState[keyPath] !== false);
      const toggleBtn = (!isRoot && keys.length > 0)
        ? `<span class="jpp-toggle" data-path="${keyPath}">${isOpen ? '▼' : '▶'}</span>`
        : '';

      if (keys.length === 0) {
        return `${toggleBtn}<span style="color:${COLORS.key};">${isArray ? '[]' : '{}'}</span>${!isLast ? ',' : ''}`;
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
      html += `${toggleBtn}<span style="color:${COLORS.key};">${isArray ? '[' : '{'}</span>`;
      keys.forEach((k, i) => {
        const childPath = keyPath + (isArray ? `[${k}]` : `.${k}`);
        html += `<div
                   class="jpp-line${highlightPath===childPath?' jpp-highlight':''}"
                   data-jpp-path="${childPath}"
                   style="margin-left:${(level + INDENT)}ch;"
                 >`;
        if (!isArray) {
          html += `<span class="jpp-key" style="color:${COLORS.key};">"${k}"</span>:`;
        }
        html += ' ' + syntaxHighlight(
          value[k],
          childPath,
          level,
          i === keys.length - 1,
          isArray,
          false
        );
        html += `</div>`;
      });
      html += `<span style="color:${COLORS.key};margin-left:${level}ch;">${isArray ? ']' : '}'}${!isLast ? ',' : ''}</span>`;
      return html;
    }

    let val;
    if (typeof value === 'string') {
      const safe = utils.escapeHTML(value);
      val = utils.isURL(value)
        ? `<a href="${safe}" target="_blank" style="color:${state.COLORS.url};text-decoration:underline;">"${safe}"</a>`
        : `<span style="color:${state.COLORS.string};">"${safe}"</span>`;
    } else if (typeof value === 'number') {
      val = `<span style="color:${state.COLORS.number};">${value}</span>`;
    } else if (typeof value === 'boolean') {
      val = `<span style="color:${state.COLORS.boolean};">${value}</span>`;
    } else if (value === null) {
      val = `<span style="color:${state.COLORS.null};">null</span>`;
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

  window.NJPP.renderer = { syntaxHighlight, renderTree };
})();


