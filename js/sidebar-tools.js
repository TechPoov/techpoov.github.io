// js/sidebar-tools.js

// Strip numeric prefix like 01_ from ToolName
function tpGetDisplayName(toolName) {
  if (!toolName) return '';
  const idx = toolName.indexOf('_');
  return idx > -1 ? toolName.slice(idx + 1) : toolName;
}

// Simple INI-style parser for tools-index.txt
function tpParseToolsConfig(text) {
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  const items = [];
  let current = null;

  for (let raw of lines) {
    const line = raw.replace(/^\uFEFF/, '').trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;

    if (line.startsWith('[') && line.endsWith(']')) {
      if (current) items.push(current);
      const sectionName = line.slice(1, -1).trim();
      current = { Section: sectionName };
    } else if (current) {
      const eqIndex = line.indexOf('=');
      if (eqIndex > -1) {
        const key = line.slice(0, eqIndex).trim();
        const value = line.slice(eqIndex + 1).trim();
        current[key] = value;
      }
    }
  }

  if (current) items.push(current);
  return items;
}

/**
 * Fill the TOOLS list in the sidebar.
 *
 * options = {
 *   configUrl: '../data/tools-index.txt' or 'data/tools-index.txt',
 *   basePath:  'pages/tool-readme.html' or 'tool-readme.html',
 *   currentTool: '01_GDrive-to-GSheet' (optional for highlight)
 * }
 */
function tpInitSidebarTools(options) {
  const cfg = Object.assign({
    configUrl: 'data/tools-index.txt',
    basePath: 'pages/tool-readme.html',
    currentTool: null
  }, options || {});

  const container = document.getElementById('tp-tools-list');
  if (!container) return; // sidebar not present on this page

  fetch(cfg.configUrl)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(text => {
      const items = tpParseToolsConfig(text);
      container.innerHTML = '';

      items.forEach(item => {
        const rawName = item.ToolName || item.Section || '';
        const displayName = tpGetDisplayName(rawName);
        if (!displayName) return;

        const link = document.createElement('a');
        link.className = 'submenu-item';
        link.textContent = displayName;
        link.href = cfg.basePath + '?tool=' + encodeURIComponent(rawName);

        if (cfg.currentTool && rawName === cfg.currentTool) {
          link.classList.add('active');
        }

        container.appendChild(link);
      });
    })
    .catch(err => {
      console.error('tpInitSidebarTools error:', err);
    });
}
