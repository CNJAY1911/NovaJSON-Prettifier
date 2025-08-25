(function () {
  window.NJPP = window.NJPP || {};

  // ---------------- CONSTANTS ----------------
  const THEMES = {
    "Midnight Neon": { 
      bg: "#0a0a0a", 
      key: "#ffffff", 
      string: "#00ffff", 
      number: "#ffff00", 
      boolean: "#ff6600", 
      null: "#ff0000", 
      url: "#00aaff" 
    },
    "Graphite Dark": { 
      bg: "#1a1a1a", 
      key: "#e0e0e0", 
      string: "#00e6ff", 
      number: "#ffcc00", 
      boolean: "#ff4400", 
      null: "#ff3333", 
      url: "#4488ff" 
    },
    "Solar Dark": { 
      bg: "#001122", 
      key: "#b0d0d0", 
      string: "#00ffcc", 
      number: "#ffaa00", 
      boolean: "#ff5500", 
      null: "#ff2222", 
      url: "#2299ff" 
    },
    "Paper White": { 
      bg: "#ffffff", 
      key: "#000000", 
      string: "#0066cc", 
      number: "#cc6600", 
      boolean: "#cc3300", 
      null: "#cc0000", 
      url: "#0066ff" 
    },
    "Slate Light": { 
      bg: "#f8fafc", 
      key: "#111111", 
      string: "#006699", 
      number: "#cc6600", 
      boolean: "#cc3300", 
      null: "#cc0000", 
      url: "#0066cc" 
    },
    "Solar Light": { 
      bg: "#fff8e0", 
      key: "#333333", 
      string: "#006666", 
      number: "#cc6600", 
      boolean: "#cc3300", 
      null: "#cc0000", 
      url: "#0066cc" 
    }
  };

  window.NJPP.THEMES = THEMES;
  window.NJPP.INDENT = 1;
  window.NJPP.rootPath = '__JPP_ROOT__';
})();


