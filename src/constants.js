(function () {
  window.NJPP = window.NJPP || {};

  // ---------------- CONSTANTS ----------------
  const THEMES = {
    "Midnight Neon": { bg: "#181a1b", key: "#ffffff", string: "#00e6e6", number: "#ffd700", boolean: "#ff6f00", null: "#ff3b3b", url: "#2196f3" },
    "Graphite Dark": { bg: "#121212", key: "#b0b0b0", string: "#6ad1e3", number: "#f6d55c", boolean: "#ed553b", null: "#ff3b3b", url: "#4ea1f3" },
    "Solar Dark": { bg: "#002b36", key: "#93a1a1", string: "#2aa198", number: "#b58900", boolean: "#cb4b16", null: "#dc322f", url: "#268bd2" },
    "Paper White": { bg: "#ffffff", key: "#333333", string: "#008b8b", number: "#a67c00", boolean: "#cc5500", null: "#d00000", url: "#0b5ed7" },
    "Slate Light": { bg: "#f5f7fa", key: "#222222", string: "#007f8c", number: "#b38600", boolean: "#cc4e00", null: "#c20000", url: "#005bcc" },
    "Solar Light": { bg: "#fdf6e3", key: "#657b83", string: "#2aa198", number: "#b58900", boolean: "#cb4b16", null: "#dc322f", url: "#268bd2" }
  };

  window.NJPP.THEMES = THEMES;
  window.NJPP.INDENT = 1;
  window.NJPP.rootPath = '__JPP_ROOT__';
})();


