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

  dom.applyThemeStyles();

  const text = getRawJSONText();
  if (!text) return;
  let json;
  try { json = JSON.parse(text); }
  catch { document.body.innerHTML = '<div style="color:#ff3b3b;padding:24px;font-size:18px;">Invalid JSON</div>'; return; }

  document.body.innerHTML = '';
  controls.safeRender(json);
})();


