(function () {
  window.NJPP = window.NJPP || {};
  const { rootPath } = window.NJPP;

  function getValueAtPath(json, path) {
    if (!path) return json;
    let cur = json;
    const parts = path.match(/(?:\[[^\]]+\]|\.[^\.\[]+)+/g) || [];
    for (let seg of (parts.length ? parts[0].match(/(?:\[[^\]]+\]|\.[^\.\[]+)/g) : [])) {
      let p = seg;
      if (p.startsWith('.')) p = p.slice(1);
      if (p.startsWith('[') && p.endsWith(']')) p = p.slice(1, -1);
      if (cur && typeof cur === 'object') cur = cur[p];
      else return undefined;
    }
    return cur;
  }

  function getParentPath(path) {
    if (!path || path === rootPath) return null;
    const m = path.match(/(.*)(?:\[[^\]]+\]|\.[^.\[]+)$/);
    return m ? m[1] : null;
  }

  function getLastKeyFromPath(path) {
    const m = path.match(/(?:\.([^.\[]+))$|(?:\[(\d+)\]$)/);
    return m ? (m[1] ?? m[2]) : null;
  }

  window.NJPP.pathing = { getValueAtPath, getParentPath, getLastKeyFromPath };
})();


