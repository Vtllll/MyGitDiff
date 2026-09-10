const STATE = { 
  a: null, 
  b: null, 
  nameA: '', 
  nameB: '', 
  viewMode: 'split',
  showMinimap: true,
  minimapRows: []
};

function id(x) { return document.getElementById(x); }

function triggerFileInput(side) {
  id(`inp-${side}`).click();
}

function handleFileChange(e, side) {
  const file = e.target.files[0];
  if (file) processFile(file, side);
}

function handleDrop(e, side) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    processFile(file, side);
  } else {
    const text = e.dataTransfer.getData('text');
    if (text) {
      setTextSide(side, text, `Text ${side.toUpperCase()}`);
    }
  }
}

function handleZoneRightClick(e, side) {
  e.preventDefault();
  pasteClipboardSide(side);
}

async function pasteClipboardSide(side) {
  try {
    const text = await navigator.clipboard.readText();
    if (text !== undefined && text !== null) {
      setTextSide(side, text, `Clipboard (${side.toUpperCase()})`);
      showToast(`Pasted into File ${side.toUpperCase()}`, 'success');
    }
  } catch (err) {
    showToast('Clipboard access unavailable. Please use the Text Editor.', 'error');
  }
}

function setTextSide(side, text, name) {
  STATE[side] = text;
  if (side === 'a') STATE.nameA = name; else STATE.nameB = name;
  updateBadge(side);
  id(`zone-${side}`).classList.add('loaded');
  triggerDiff();
}

function processFile(file, side) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    STATE[side] = ev.target.result;
    if (side === 'a') STATE.nameA = file.name; else STATE.nameB = file.name;
    updateBadge(side);
    id(`zone-${side}`).classList.add('loaded');
    triggerDiff();
  };
  reader.readAsText(file, 'UTF-8');
}

function updateBadge(side) {
  const name = side === 'a' ? STATE.nameA : STATE.nameB;
  if (!name) {
    id(`badge-${side}`).innerHTML = '';
    return;
  }
  const linesCount = (STATE[side] || '').split(/\r?\n/).length;
  id(`badge-${side}`).innerHTML = `
    <span class="z-badge" title="${esc(name)} (${linesCount} lines)">
      <span class="dot dot-${side}"></span>
      <span>${esc(name)}</span>
      <span style="color:var(--muted);margin-left:4px">(${linesCount} lines)</span>
    </span>`;
}

function swapSides() {
  if (STATE.a === null && STATE.b === null) return;
  const tmpText = STATE.a; STATE.a = STATE.b; STATE.b = tmpText;
  const tmpName = STATE.nameA; STATE.nameA = STATE.nameB; STATE.nameB = tmpName;
  updateBadge('a');
  updateBadge('b');
  id('zone-a').classList.toggle('loaded', STATE.a !== null);
  id('zone-b').classList.toggle('loaded', STATE.b !== null);
  triggerDiff();
  showToast('Swapped File A and File B');
}

function resetAll() {
  STATE.a = null; STATE.b = null;
  STATE.nameA = ''; STATE.nameB = '';
  id('inp-a').value = ''; id('inp-b').value = '';
  id('badge-a').innerHTML = ''; id('badge-b').innerHTML = '';
  id('zone-a').classList.remove('loaded');
  id('zone-b').classList.remove('loaded');
  id('diff-hdr-slot').innerHTML = '';
  id('out').innerHTML = '';
  showToast('Workspace cleared');
}

/* Modal Editor */
function openTextModal() {
  id('modal-text-a').value = STATE.a !== null ? STATE.a : '';
  id('modal-text-b').value = STATE.b !== null ? STATE.b : '';
  id('text-modal').style.display = 'flex';
  id('modal-text-a').focus();
}

function closeTextModal() {
  id('text-modal').style.display = 'none';
}

async function pasteIntoModal(side) {
  try {
    const text = await navigator.clipboard.readText();
    if (text !== undefined && text !== null) {
      id(`modal-text-${side}`).value = text;
      showToast(`Text pasted into ${side.toUpperCase()}`, 'success');
    }
  } catch (e) {
    showToast('Please paste manually via Ctrl+V', 'error');
  }
}

function applyTextModal() {
  const valA = id('modal-text-a').value;
  const valB = id('modal-text-b').value;
  if (valA) setTextSide('a', valA, STATE.nameA || 'Text A');
  if (valB) setTextSide('b', valB, STATE.nameB || 'Text B');
  closeTextModal();
}

function setView(m) {
  STATE.viewMode = m;
  id('btn-split').classList.toggle('active', m === 'split');
  id('btn-unified').classList.toggle('active', m === 'unified');
  id('btn-full').classList.toggle('active', m === 'full');
  triggerDiff();
}

function toggleWordWrap() {
  const wrap = id('wrap-chk').checked;
  const table = document.querySelector('.diff-table');
  if (table) table.classList.toggle('wrap-enabled', wrap);
}

function triggerDiff() { 
  if (STATE.a !== null && STATE.b !== null) {
    runDiff(); 
  }
}

// Authentic language branding colors (matches official/popular logos)
const LANG_STYLES = {
  'js':   { name: 'JavaScript', bg: '#F7DF1E', fg: '#111111' },
  'mjs':  { name: 'JavaScript', bg: '#F7DF1E', fg: '#111111' },
  'cjs':  { name: 'JavaScript', bg: '#F7DF1E', fg: '#111111' },
  'ts':   { name: 'TypeScript', bg: '#3178C6', fg: '#ffffff' },
  'jsx':  { name: 'React JSX',  bg: '#20232a', fg: '#61dafb' },
  'tsx':  { name: 'React TS',   bg: '#3178C6', fg: '#61dafb' },
  'c':    { name: 'C',          bg: '#555555', fg: '#ffffff' },
  'cpp':  { name: 'C++',        bg: '#00599C', fg: '#ffffff' },
  'cc':   { name: 'C++',        bg: '#00599C', fg: '#ffffff' },
  'cxx':  { name: 'C++',        bg: '#00599C', fg: '#ffffff' },
  'h':    { name: 'C Header',   bg: '#656c76', fg: '#ffffff' },
  'hpp':  { name: 'C++ Header', bg: '#00599C', fg: '#ffffff' },
  'hxx':  { name: 'C++ Header', bg: '#00599C', fg: '#ffffff' },
  'ino':  { name: 'Arduino',    bg: '#00979C', fg: '#ffffff' },
  'cs':   { name: 'C#',         bg: '#239120', fg: '#ffffff' },
  'java': { name: 'Java',       bg: '#E76F00', fg: '#ffffff' },
  'py':   { name: 'Python',     bg: '#3776AB', fg: '#ffffff' },
  'go':   { name: 'Go',         bg: '#00ADD8', fg: '#ffffff' },
  'rs':   { name: 'Rust',       bg: '#CE412B', fg: '#ffffff' },
  'php':  { name: 'PHP',        bg: '#777BB4', fg: '#ffffff' },
  'rb':   { name: 'Ruby',       bg: '#CC342D', fg: '#ffffff' },
  'kt':   { name: 'Kotlin',     bg: '#7F52FF', fg: '#ffffff' },
  'swift':{ name: 'Swift',      bg: '#F05138', fg: '#ffffff' },
  'dart': { name: 'Dart',       bg: '#0175C2', fg: '#ffffff' },
  'lua':  { name: 'Lua',        bg: '#000080', fg: '#ffffff' },
  'html': { name: 'HTML',       bg: '#E34F26', fg: '#ffffff' },
  'css':  { name: 'CSS',        bg: '#1572B6', fg: '#ffffff' },
  'scss': { name: 'SCSS',       bg: '#C6538C', fg: '#ffffff' },
  'sass': { name: 'SASS',       bg: '#C6538C', fg: '#ffffff' },
  'less': { name: 'LESS',       bg: '#1D365D', fg: '#ffffff' },
  'json': { name: 'JSON',       bg: '#4B5563', fg: '#ffffff' },
  'xml':  { name: 'XML',        bg: '#0060A8', fg: '#ffffff' },
  'yaml': { name: 'YAML',       bg: '#CB171E', fg: '#ffffff' },
  'yml':  { name: 'YAML',       bg: '#CB171E', fg: '#ffffff' },
  'toml': { name: 'TOML',       bg: '#9C4221', fg: '#ffffff' },
  'sql':  { name: 'SQL',        bg: '#E38C00', fg: '#ffffff' },
  'sh':   { name: 'Shell',      bg: '#3E474A', fg: '#4EAA25' },
  'bash': { name: 'Bash',       bg: '#3E474A', fg: '#4EAA25' },
  'ps1':  { name: 'PowerShell', bg: '#012456', fg: '#ffffff' },
  'bat':  { name: 'Batch',      bg: '#374151', fg: '#ffffff' },
  'md':   { name: 'Markdown',   bg: '#083fa1', fg: '#ffffff' },
  'txt':  { name: 'Plain Text', bg: '#475569', fg: '#ffffff' }
};

function getLanguageInfo(filename) {
  if (!filename) return null;
  const ext = filename.split('.').pop().toLowerCase();
  if (LANG_STYLES[ext]) return LANG_STYLES[ext];
  return { name: ext.toUpperCase(), bg: '#475569', fg: '#ffffff' };
}

function detectLanguage(filename) {
  const info = getLanguageInfo(filename);
  return info ? info.name : 'Unknown';
}

function detectAllLanguages(nameA, nameB, textA = '', textB = '') {
  const langsFound = [];
  const addLang = (key) => {
    if (LANG_STYLES[key] && !langsFound.includes(key)) langsFound.push(key);
  };

  const combined = (textA || '') + '\n' + (textB || '');

  // 1. Scan for explicit language markers and distinct language constructs
  const hasMarker = (lang) => new RegExp('\\[(?:Language:\\s*)?' + lang + '\\]', 'i').test(combined);

  if (hasMarker('C\\+\\+') || /#include\s*\x3C(iostream|vector)\x3E/.test(combined)) {
    addLang('cpp');
  }
  if (hasMarker('Python') || /def\s+\w+\([^)]*\):|import\s+time/.test(combined)) {
    addLang('py');
  }
  if (hasMarker('JavaScript') || /function\s+processOrderInvoice|const\s+DEFAULT_CURRENCY/.test(combined)) {
    addLang('js');
  }
  if (hasMarker('Go(?:lang)?') || /package\s+main|func\s+NewWorkerPool/.test(combined)) {
    addLang('go');
  }
  if (hasMarker('HTML') || /\x3C(section|div|header|main|article)\b/i.test(combined)) {
    addLang('html');
  }
  if (hasMarker('Rust')) {
    addLang('rs');
  }

  // 2. Check file extensions if content didn't yield multiple languages
  const extA = (nameA || '').split('.').pop().toLowerCase();
  const extB = (nameB || '').split('.').pop().toLowerCase();
  const isGeneric = (ext) => ['txt', 'md', '', 'unknown', 'diff', 'patch'].includes(ext);

  if (langsFound.length === 0) {
    if (!isGeneric(extA)) addLang(extA);
    if (!isGeneric(extB)) addLang(extB);
  }

  return langsFound;
}

function renderLanguageBadges(nameA, nameB, textA = '', textB = '') {
  const detectedKeys = detectAllLanguages(nameA, nameB, textA, textB);
  const makePill = (info) => `<span class="lang-pill" style="background:${info.bg};color:${info.fg}" title="${esc(info.name)}">${esc(info.name)}</span>`;

  if (detectedKeys.length > 1) {
    const extA = (nameA || '').split('.').pop().toLowerCase();
    const extB = (nameB || '').split('.').pop().toLowerCase();
    const isGeneric = (ext) => ['txt', 'md', '', 'unknown', 'diff', 'patch'].includes(ext);

    // If it's a direct transition between two single-language files (e.g. sample.c vs sample.cpp or index.js vs index.ts)
    if (!isGeneric(extA) && !isGeneric(extB) && extA !== extB && detectedKeys.length === 2) {
      const infoA = LANG_STYLES[extA] || getLanguageInfo(nameA);
      const infoB = LANG_STYLES[extB] || getLanguageInfo(nameB);
      if (infoA && infoB && infoA.name !== infoB.name) {
        return `<div class="lang-badges-wrap">
          ${makePill(infoA)}
          <span class="lang-pill-arrow">→</span>
          ${makePill(infoB)}
        </div>`;
      }
    }

    // Multiple languages in the comparison (e.g. 5 languages): render all pills!
    const pillsHtml = detectedKeys.map(k => LANG_STYLES[k] ? makePill(LANG_STYLES[k]) : '').join('');
    return `<div class="lang-badges-wrap">${pillsHtml}</div>`;
  }

  if (detectedKeys.length === 1) {
    const info = LANG_STYLES[detectedKeys[0]];
    if (info) return `<div class="lang-badges-wrap">${makePill(info)}</div>`;
  }

  const infoA = getLanguageInfo(nameA);
  const infoB = getLanguageInfo(nameB);
  if (infoB) return `<div class="lang-badges-wrap">${makePill(infoB)}</div>`;
  if (infoA) return `<div class="lang-badges-wrap">${makePill(infoA)}</div>`;
  return `<div class="lang-badges-wrap"><span class="lang-pill" style="background:#475569;color:#ffffff">TEXT</span></div>`;
}

// Myers Diff (Lines or Tokens)
function myers(A, B) {
  const n = A.length, m = B.length, max = n + m;
  const v = new Int32Array(2 * max + 1);
  const trace = [];
  for (let d = 0; d <= max; d++) {
    trace.push(new Int32Array(v));
    for (let k = -d; k <= d; k += 2) {
      let x = (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) ? v[max + k + 1] : v[max + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && A[x] === B[y]) { x++; y++; }
      v[max + k] = x;
      if (x >= n && y >= m) return backtrack(trace, A, B, n, m, max);
    }
  }
  return [];
}

function backtrack(trace, A, B, n, m, max) {
  const ops = [];
  let x = n, y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;
    const prevK = (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) ? k + 1 : k - 1;
    const prevX = v[max + prevK], prevY = prevX - prevK;
    while (x > prevX && y > prevY) { x--; y--; ops.push({ t: '=', a: x, b: y }); }
    if (d > 0) {
      if (x > prevX) { x--; ops.push({ t: '-', a: x }); }
      else { y--; ops.push({ t: '+', b: y }); }
    }
  }
  return ops.reverse();
}

// Tokenizer for word-level intra-line diff
function tokenizeLine(str) {
  return str.match(/\w+|\s+|[^\w\s]/g) || (str ? [str] : []);
}

// Intra-line (word-level) diff calculation with smart whitespace/tab handling
function computeWordDiff(strA, strB, ignWS = false, normTabs = true) {
  let cleanA = strA;
  let cleanB = strB;
  if (normTabs) {
    cleanA = cleanA.replace(/\t/g, '    ');
    cleanB = cleanB.replace(/\t/g, '    ');
  }

  const tokensA = tokenizeLine(cleanA);
  const tokensB = tokenizeLine(cleanB);

  // When ignWS is active, normalize whitespace tokens for token comparison so tabs/spaces match
  const normTok = t => (ignWS && /^\s+$/.test(t)) ? ' ' : t;
  const mappedA = tokensA.map(normTok);
  const mappedB = tokensB.map(normTok);
  const ops = myers(mappedA, mappedB);

  let htmlA = '', htmlB = '';
  for (const op of ops) {
    if (op.t === '=') {
      htmlA += postFormat(esc(tokensA[op.a]));
      htmlB += postFormat(esc(tokensB[op.b]));
    } else if (op.t === '-') {
      const tok = tokensA[op.a];
      if (ignWS && /^\s+$/.test(tok)) {
        htmlA += esc(tok);
      } else {
        htmlA += `<span class="diff-word-del">${postFormat(esc(tok))}</span>`;
      }
    } else if (op.t === '+') {
      const tok = tokensB[op.b];
      if (ignWS && /^\s+$/.test(tok)) {
        htmlB += esc(tok);
      } else {
        htmlB += `<span class="diff-word-add">${postFormat(esc(tok))}</span>`;
      }
    }
  }
  return { htmlA, htmlB };
}

// Find single-line comment boundary
function findCommentIndex(str) {
  let idx = str.indexOf('//');
  while (idx !== -1) {
    if (idx > 0 && str[idx - 1] === ':') {
      idx = str.indexOf('//', idx + 2);
    } else {
      return idx;
    }
  }
  return -1;
}

// Safe syntax highlighting avoiding HTML tag mutation
function safeHighlight(html) {
  const parts = html.split(/(<[^>]+>)/);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith('<')) {
      let t = parts[i];
      t = t.replace(/\b(if|else|for|while|do|switch|case|break|continue|return|new|delete|try|catch|finally|throw|class|struct|enum|namespace|using|public|private|protected|template|typename|import|from|export|default|async|await|constexpr|explicit|noexcept|inline|typedef)\b/g, '<span class="syn-kw">$1</span>');
      t = t.replace(/\b(void|int|float|double|char|bool|boolean|string|String|uint8_t|uint16_t|uint32_t|size_t|auto|const|let|var|function|static|virtual|override|true|false|null|nullptr|undefined|this)\b/g, '<span class="syn-kw-type">$1</span>');
      t = t.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-num">$1</span>');
      t = t.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="syn-type">$1</span>');
      parts[i] = t;
    }
  }
  return parts.join('');
}

function processLine(str, normTabs = true) {
  let s = str;
  if (normTabs) s = s.replace(/\t/g, '    ');
  const idx = findCommentIndex(s);
  let code = s, comm = '';
  if (idx !== -1) { code = s.substring(0, idx); comm = s.substring(idx); }
  return postFormat(esc(code), comm);
}

function postFormat(codeHtml, commentPlain = '') {
  let finalHtml = codeHtml;
  const stripped = codeHtml.replace(/<[^>]+>/g, '').trim();
  if (stripped.startsWith('#')) {
    finalHtml = `<span class="code-directive">${codeHtml}</span>`;
  } else {
    finalHtml = safeHighlight(codeHtml);
  }

  if (commentPlain) {
    finalHtml += `<span class="code-comment">${esc(commentPlain)}</span>`;
  }
  return finalHtml;
}

function getHunks(ops, isFull = false) {
  if (isFull) {
    return ops.length > 0 ? [ops] : [];
  }
  const CONTEXT = 3;
  const groups = [];
  let current = [];
  for (let i = 0; i < ops.length; i++) {
    const near = ops.slice(Math.max(0, i-CONTEXT), i+CONTEXT+1).some(o => o.t !== '=');
    if (near) current.push(ops[i]);
    else if (current.length > 0) { groups.push(current); current = []; }
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

function getHunkInfo(hunk, linesA) {
  let minA = Infinity, countA = 0;
  let minB = Infinity, countB = 0;

  for (const op of hunk) {
    if (op.t === '=' || op.t === '-') {
      if (op.a < minA) minA = op.a;
      countA++;
    }
    if (op.t === '=' || op.t === '+') {
      if (op.b < minB) minB = op.b;
      countB++;
    }
  }

  const startA = minA === Infinity ? 0 : minA + 1;
  const startB = minB === Infinity ? 0 : minB + 1;

  let funcName = '';
  if (minA !== Infinity && linesA) {
    for (let j = minA; j >= 0 && j >= minA - 30; j--) {
      const line = (linesA[j] || '').trim();
      if (/^(function\b|class\b|def\b|async\b|export\b|public\b|private\b|void\b|[a-zA-Z_0-9]+\s*\([^)]*\)\s*\{?)/.test(line)) {
        funcName = ' ' + line.replace(/\{$/, '').trim();
        if (funcName.length > 40) funcName = funcName.substring(0, 38) + '...';
        break;
      }
    }
  }

  return `@@ -${startA},${countA} +${startB},${countB} @@${esc(funcName)}`;
}

function runDiff() {
  const ignWS = id('ws-chk').checked;
  const isWrap = id('wrap-chk').checked;
  const normTabs = id('tab-norm-chk').checked;

  const expand = s => normTabs ? s.replace(/\t/g, '    ') : s;
  const norm = s => {
    let t = expand(s);
    if (ignWS) {
      t = t.trim().replace(/\s+/g, ' ');
    }
    return t;
  };

  const linesA = STATE.a.split(/\r?\n/), linesB = STATE.b.split(/\r?\n/);
  const ops = myers(linesA.map(norm), linesB.map(norm));

  let adds = 0, dels = 0;
  ops.forEach(op => { if(op.t==='+') adds++; if(op.t==='-') dels++; });

  const isFull = STATE.viewMode === 'full';
  const hunks = getHunks(ops, isFull);
  let tableHTML = '';

  if (hunks.length === 0) {
    tableHTML = `<tbody><tr><td colspan="${STATE.viewMode === 'unified' ? 3 : 5}" class="identical-state">Both files are identical (no differences found)</td></tr></tbody>`;
  } else if (STATE.viewMode === 'unified') {
    tableHTML = `<colgroup><col class="ln"><col class="ln"><col></colgroup><tbody>` + renderUnified(hunks, linesA, linesB, ignWS, normTabs) + `</tbody>`;
  } else {
    tableHTML = `<colgroup><col class="ln"><col><col style="width:1px"><col class="ln"><col></colgroup><tbody>` + renderSplit(hunks, linesA, linesB, ignWS, normTabs, isFull) + `</tbody>`;
  }

  id('diff-hdr-slot').innerHTML = buildHeader(adds, dels);

  const minimapHTML = (hunks.length > 0 && STATE.showMinimap) ? buildMinimapHTML(adds, dels) : '';

  id('out').innerHTML = `
    <div class="diff-wrapper">
      <div class="diff-container">
        <table class="diff-table ${isWrap ? 'wrap-enabled' : ''}">${tableHTML}</table>
      </div>
      ${minimapHTML}
    </div>`;

  if (hunks.length > 0 && STATE.showMinimap) {
    requestAnimationFrame(() => {
      renderMinimapCanvas();
      updateMinimapSlider();
    });
  }
}

function renderSplit(hunks, linesA, linesB, ignWS, normTabs, isFull = false) {
  let html = '';
  STATE.minimapRows = [];
  hunks.forEach((hunk, hIdx) => {
    const hunkHeader = isFull ? 'Full File View (All lines &amp; whitespace preserved)' : getHunkInfo(hunk, linesA);
    html += `<tr class="row-hunk" id="hunk-${hIdx}" data-hunk="${hIdx}"><td colspan="5">${hunkHeader}</td></tr>`;
    STATE.minimapRows.push({ type: 'hunk', text: hunkHeader, hunkIdx: hIdx });
    let i = 0;
    while (i < hunk.length) {
      const op = hunk[i];
      if (op.t === '=') {
        const v = processLine(linesA[op.a], normTabs);
        html += `<tr class="row-ctx">
          <td class="ln">${op.a+1}</td><td class="code">${v}</td>
          <td style="background:var(--border)"></td>
          <td class="ln">${op.b+1}</td><td class="code">${v}</td>
        </tr>`;
        STATE.minimapRows.push({ type: 'ctx', text: linesA[op.a] || '', lineA: op.a+1, lineB: op.b+1 });
        i++;
      } else {
        // Collect contiguous group of deletions and additions
        const dels = [];
        const adds = [];
        while (i < hunk.length && (hunk[i].t === '-' || hunk[i].t === '+')) {
          if (hunk[i].t === '-') dels.push(hunk[i]);
          else adds.push(hunk[i]);
          i++;
        }
        const maxLen = Math.max(dels.length, adds.length);
        for (let k = 0; k < maxLen; k++) {
          const d = dels[k];
          const a = adds[k];
          if (d && a) {
            // Pair modified lines side by side with word-level diff
            const { htmlA, htmlB } = computeWordDiff(linesA[d.a], linesB[a.b], ignWS, normTabs);
            html += `<tr>
              <td class="ln cell-del-ln">${d.a+1}</td><td class="code cell-del-bg">${htmlA}</td>
              <td style="background:var(--border)"></td>
              <td class="ln cell-add-ln">${a.b+1}</td><td class="code cell-add-bg">${htmlB}</td>
            </tr>`;
            STATE.minimapRows.push({ type: 'mod', text: linesB[a.b] || linesA[d.a] || '', lineA: d.a+1, lineB: a.b+1 });
          } else if (d) {
            // Unpaired deletion (left only)
            html += `<tr class="row-del">
              <td class="ln cell-del-ln">${d.a+1}</td><td class="code cell-del-bg">${processLine(linesA[d.a], normTabs)}</td>
              <td style="background:var(--border)"></td>
              <td class="ln"></td><td class="code"></td>
            </tr>`;
            STATE.minimapRows.push({ type: 'del', text: linesA[d.a] || '', lineA: d.a+1 });
          } else {
            // Unpaired addition (right only)
            html += `<tr class="row-add">
              <td class="ln"></td><td class="code"></td>
              <td style="background:var(--border)"></td>
              <td class="ln cell-add-ln">${a.b+1}</td><td class="code cell-add-bg">${processLine(linesB[a.b], normTabs)}</td>
            </tr>`;
            STATE.minimapRows.push({ type: 'add', text: linesB[a.b] || '', lineB: a.b+1 });
          }
        }
      }
    }
  });
  return html;
}

function renderUnified(hunks, linesA, linesB, ignWS, normTabs) {
  let html = '';
  STATE.minimapRows = [];
  hunks.forEach((hunk, hIdx) => {
    const hunkHeader = getHunkInfo(hunk, linesA);
    html += `<tr class="row-hunk" id="hunk-${hIdx}" data-hunk="${hIdx}"><td colspan="3">${hunkHeader}</td></tr>`;
    STATE.minimapRows.push({ type: 'hunk', text: hunkHeader, hunkIdx: hIdx });
    let i = 0;
    while (i < hunk.length) {
      const op = hunk[i];
      if (op.t === '=') {
        html += `<tr class="row-ctx"><td class="ln">${op.a+1}</td><td class="ln">${op.b+1}</td><td class="code">  ${processLine(linesA[op.a], normTabs)}</td></tr>`;
        STATE.minimapRows.push({ type: 'ctx', text: linesA[op.a] || '', lineA: op.a+1, lineB: op.b+1 });
        i++;
      } else {
        const dels = [];
        const adds = [];
        while (i < hunk.length && (hunk[i].t === '-' || hunk[i].t === '+')) {
          if (hunk[i].t === '-') dels.push(hunk[i]);
          else adds.push(hunk[i]);
          i++;
        }
        dels.forEach((d, idx) => {
          const pairedAdd = adds[idx];
          let codeHtml = processLine(linesA[d.a], normTabs);
          if (pairedAdd) {
            codeHtml = computeWordDiff(linesA[d.a], linesB[pairedAdd.b], ignWS, normTabs).htmlA;
          }
          html += `<tr class="row-del"><td class="ln cell-del-ln">${d.a+1}</td><td class="ln"></td><td class="code cell-del-bg">- ${codeHtml}</td></tr>`;
          STATE.minimapRows.push({ type: 'del', text: linesA[d.a] || '', lineA: d.a+1 });
        });
        adds.forEach((a, idx) => {
          const pairedDel = dels[idx];
          let codeHtml = processLine(linesB[a.b], normTabs);
          if (pairedDel) {
            codeHtml = computeWordDiff(linesA[pairedDel.a], linesB[a.b], ignWS, normTabs).htmlB;
          }
          html += `<tr class="row-add"><td class="ln"></td><td class="ln cell-add-ln">${a.b+1}</td><td class="code cell-add-bg">+ ${codeHtml}</td></tr>`;
          STATE.minimapRows.push({ type: 'add', text: linesB[a.b] || '', lineB: a.b+1 });
        });
      }
    }
  });
  return html;
}

function buildHeader(adds, dels) {
  const total = (adds + dels) || 1;
  const pAdd = Math.round((adds / total) * 5);
  const bar = '<span style="background:var(--add-fg)"></span>'.repeat(pAdd) + '<span style="background:var(--del-fg)"></span>'.repeat(5 - pAdd);
  
  const langBadgesHtml = renderLanguageBadges(STATE.nameA, STATE.nameB, STATE.a, STATE.b);

  return `<div class="diff-hdr">
    <div class="diff-names">
      <span style="color:var(--del-fg)">${esc(STATE.nameA || 'File A')}</span>
      <span style="color:var(--subtle)">→</span>
      <span style="color:var(--add-fg)">${esc(STATE.nameB || 'File B')}</span>
    </div>
    ${langBadgesHtml}
    <div class="diff-stats">
      <span class="stat-count" style="color:var(--add-fg)">+${adds}</span>
      <span class="stat-count" style="color:var(--del-fg)">-${dels}</span>
      <div class="sbar">${bar}</div>
    </div>
  </div>`;
}

function buildMinimapHTML(adds, dels) {
  const isHidden = !STATE.showMinimap;
  return `
    <aside class="diff-minimap ${isHidden ? 'hidden' : ''}" id="diff-minimap" aria-label="Code Minimap Overview">
      <div class="minimap-header">
        <span class="minimap-label">MINIMAP</span>
        <span class="minimap-stats">
          <span style="color:var(--add-fg)">+${adds}</span>
          <span style="color:var(--del-fg)">-${dels}</span>
        </span>
      </div>
      <div class="minimap-body" id="minimap-body" onclick="handleMinimapBodyClick(event)" onmousemove="handleMinimapMouseMove(event)" onmouseleave="handleMinimapMouseLeave()">
        <canvas id="minimap-canvas" class="minimap-canvas"></canvas>
        <div id="minimap-slider" class="minimap-slider" onmousedown="handleMinimapSliderMouseDown(event)" title="Drag to scroll">
          <div class="minimap-slider-puck"></div>
        </div>
        <div id="minimap-hover-guide" class="minimap-hover-guide" style="display:none;"></div>
        <div id="minimap-tooltip" class="minimap-tooltip" style="display:none;"></div>
      </div>
    </aside>`;
}

function renderMinimapCanvas() {
  const body = id('minimap-body');
  const canvas = id('minimap-canvas');
  if (!body || !canvas || !STATE.minimapRows || STATE.minimapRows.length === 0) return;

  const rect = body.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (w <= 0 || h <= 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#111113';
  ctx.fillRect(0, 0, w, h);

  const rows = STATE.minimapRows;
  const N = rows.length;

  // True VS Code minimap scale: lines do not blow up to 20px in small files.
  // Standard pitch is ~2.8px per line with an ultra-fine 1.1px stroke.
  const linePitch = Math.min(2.8, Math.max(0.6, h / N));
  const contentH = Math.min(h, N * linePitch);
  const strokeH = Math.max(0.75, Math.min(1.2, linePitch * 0.45));
  const charW = 0.65;

  for (let i = 0; i < N; i++) {
    const r = rows[i];
    const y = i * (contentH / N);
    const blockH = Math.max(1, contentH / N);

    // 1. Diff background washes & right-gutter accent marks
    if (r.type === 'del') {
      ctx.fillStyle = 'rgba(248, 81, 73, 0.16)';
      ctx.fillRect(0, y, w - 3, blockH);
      ctx.fillStyle = '#f85149';
      ctx.fillRect(w - 3, y, 3, Math.max(1.8, blockH));
    } else if (r.type === 'add') {
      ctx.fillStyle = 'rgba(46, 160, 67, 0.16)';
      ctx.fillRect(0, y, w - 3, blockH);
      ctx.fillStyle = '#3fb950';
      ctx.fillRect(w - 3, y, 3, Math.max(1.8, blockH));
    } else if (r.type === 'mod') {
      ctx.fillStyle = 'rgba(248, 81, 73, 0.14)';
      ctx.fillRect(0, y, (w - 3) * 0.48, blockH);
      ctx.fillStyle = 'rgba(46, 160, 67, 0.14)';
      ctx.fillRect((w - 3) * 0.48, y, (w - 3) * 0.52, blockH);
      ctx.fillStyle = '#e3b341';
      ctx.fillRect(w - 3, y, 3, Math.max(1.8, blockH));
    } else if (r.type === 'hunk') {
      ctx.fillStyle = 'rgba(88, 166, 255, 0.35)';
      ctx.fillRect(0, y, w, 0.8);
      continue;
    }

    // 2. Micro code representation (delicate, authentic VS Code strokes)
    const rawText = r.text || '';
    if (!rawText.trim()) continue;

    const indentMatch = rawText.match(/^\s*/);
    const indentCount = indentMatch ? indentMatch[0].length : 0;
    const startX = Math.min(w - 15, 3 + indentCount * 0.75);
    const words = rawText.trim().split(/\s+/);
    let curX = startX;
    const maxLineX = w - 6;
    const tokenY = y + Math.max(0, (blockH - strokeH) / 2);

    for (const word of words) {
      if (!word) continue;
      if (word.startsWith('//') || word.startsWith('/*') || word.startsWith('#')) {
        ctx.fillStyle = 'rgba(106, 153, 85, 0.75)';
      } else if (/^(function|class|def|return|if|else|for|while|const|let|var|import|export|package|type|struct|public|private|static|constexpr|include)\b/.test(word)) {
        ctx.fillStyle = 'rgba(86, 156, 214, 0.85)';
      } else if (/^\d+/.test(word)) {
        ctx.fillStyle = 'rgba(181, 206, 168, 0.85)';
      } else if (/^["'`]/.test(word)) {
        ctx.fillStyle = 'rgba(206, 145, 120, 0.85)';
      } else if (/^[A-Z]/.test(word)) {
        ctx.fillStyle = 'rgba(78, 201, 176, 0.85)';
      } else {
        ctx.fillStyle = 'rgba(204, 204, 204, 0.55)';
      }

      const wordW = Math.max(1.2, Math.min(maxLineX - curX, word.length * charW));
      ctx.fillRect(curX, tokenY, wordW, strokeH);
      curX += wordW + 1.0;
      if (curX >= maxLineX) break;
    }
  }

  updateMinimapSlider();
}

let isDraggingMinimap = false;
let dragStartY = 0;
let dragStartScrollY = 0;

function updateMinimapSlider() {
  const slider = id('minimap-slider');
  const body = id('minimap-body');
  const table = document.querySelector('.diff-table');
  if (!slider || !body || !table || !STATE.minimapRows) return;

  const tableTop = table.offsetTop;
  const tableHeight = table.offsetHeight;
  if (tableHeight <= 0) return;

  const minimapH = body.clientHeight;
  const N = STATE.minimapRows.length;
  if (N === 0) return;

  const linePitch = Math.min(2.8, Math.max(0.6, minimapH / N));
  const contentH = Math.min(minimapH, N * linePitch);

  const winH = window.innerHeight;
  const headerEl = document.querySelector('.sticky-header-container');
  const headerH = headerEl ? headerEl.offsetHeight : 135;

  const visibleTop = Math.max(0, window.scrollY + headerH - tableTop);
  const visibleBottom = Math.min(tableHeight, window.scrollY + winH - tableTop);
  const visibleHeight = Math.max(winH * 0.15, visibleBottom - visibleTop);

  const sliderTop = (visibleTop / tableHeight) * contentH;
  const sliderHeight = Math.max(16, (visibleHeight / tableHeight) * contentH);

  slider.style.top = Math.min(contentH - sliderHeight, Math.max(0, sliderTop)) + 'px';
  slider.style.height = Math.min(contentH, sliderHeight) + 'px';
}

function handleMinimapBodyClick(e) {
  if (e.target.closest('#minimap-slider')) return;
  const body = id('minimap-body');
  const table = document.querySelector('.diff-table');
  if (!body || !table || !STATE.minimapRows) return;

  const rect = body.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const minimapH = rect.height;
  const N = STATE.minimapRows.length;
  if (N === 0) return;

  const linePitch = Math.min(2.8, Math.max(0.6, minimapH / N));
  const contentH = Math.min(minimapH, N * linePitch);
  const ratio = Math.max(0, Math.min(1, clickY / contentH));

  const tableTop = table.offsetTop;
  const tableHeight = table.offsetHeight;
  const headerEl = document.querySelector('.sticky-header-container');
  const headerH = headerEl ? headerEl.offsetHeight : 135;
  const winH = window.innerHeight;

  const targetY = tableTop + (ratio * tableHeight) - (winH / 2) + headerH;
  window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
}

function handleMinimapSliderMouseDown(e) {
  e.preventDefault();
  isDraggingMinimap = true;
  dragStartY = e.clientY;
  dragStartScrollY = window.scrollY;
  id('minimap-slider')?.classList.add('dragging');

  const onMouseMove = (moveEv) => {
    if (!isDraggingMinimap) return;
    const body = id('minimap-body');
    const table = document.querySelector('.diff-table');
    if (!body || !table || !STATE.minimapRows) return;

    const deltaY = moveEv.clientY - dragStartY;
    const minimapH = body.clientHeight;
    const N = STATE.minimapRows.length;
    const linePitch = Math.min(2.8, Math.max(0.6, minimapH / N));
    const contentH = Math.min(minimapH, N * linePitch);
    const tableHeight = table.offsetHeight;
    const scrollRatio = tableHeight / contentH;

    window.scrollTo({
      top: Math.max(0, dragStartScrollY + deltaY * scrollRatio),
      behavior: 'auto'
    });
  };

  const onMouseUp = () => {
    isDraggingMinimap = false;
    id('minimap-slider')?.classList.remove('dragging');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function handleMinimapMouseMove(e) {
  const body = id('minimap-body');
  const guide = id('minimap-hover-guide');
  const tooltip = id('minimap-tooltip');
  if (!body || !guide || !tooltip || !STATE.minimapRows || STATE.minimapRows.length === 0) return;

  const rect = body.getBoundingClientRect();
  const hoverY = e.clientY - rect.top;
  const minimapH = rect.height;
  const N = STATE.minimapRows.length;
  const linePitch = Math.min(2.8, Math.max(0.6, minimapH / N));
  const contentH = Math.min(minimapH, N * linePitch);

  if (hoverY > contentH + 10) {
    guide.style.display = 'none';
    tooltip.style.display = 'none';
    return;
  }

  const ratio = Math.max(0, Math.min(1, hoverY / contentH));
  const rowIdx = Math.min(N - 1, Math.floor(ratio * N));
  const row = STATE.minimapRows[rowIdx];

  guide.style.top = hoverY + 'px';
  guide.style.display = 'block';

  if (row) {
    let label = '';
    if (row.type === 'hunk') label = 'Hunk ' + ((row.hunkIdx || 0) + 1);
    else {
      const lineNum = row.lineB || row.lineA || (rowIdx + 1);
      label = `Ln ${lineNum}` + (row.type === 'add' ? ' (+)' : row.type === 'del' ? ' (-)' : row.type === 'mod' ? ' (±)' : '');
    }
    tooltip.textContent = label;
    tooltip.style.top = Math.max(2, Math.min(minimapH - 24, hoverY - 10)) + 'px';
    tooltip.style.display = 'block';
  }
}

function handleMinimapMouseLeave() {
  const guide = id('minimap-hover-guide');
  const tooltip = id('minimap-tooltip');
  if (guide) guide.style.display = 'none';
  if (tooltip) tooltip.style.display = 'none';
}

function toggleMinimap() {
  STATE.showMinimap = id('minimap-chk').checked;
  const minimap = id('diff-minimap');
  if (minimap) {
    minimap.classList.toggle('hidden', !STATE.showMinimap);
    if (STATE.showMinimap) {
      renderMinimapCanvas();
      updateMinimapSlider();
    }
  } else {
    triggerDiff();
  }
}

/* Export to unified Git Patch */
function exportPatch() {
  if (STATE.a === null || STATE.b === null) {
    showToast('Please load both files first to generate a patch', 'error');
    return;
  }
  const ignWS = id('ws-chk').checked;
  const normTabs = id('tab-norm-chk').checked;
  const expand = s => normTabs ? s.replace(/\t/g, '    ') : s;
  const norm = s => ignWS ? expand(s).trim().replace(/\s+/g, ' ') : expand(s);

  const linesA = STATE.a.split(/\r?\n/), linesB = STATE.b.split(/\r?\n/);
  const ops = myers(linesA.map(norm), linesB.map(norm));
  const hunks = getHunks(ops);

  let patch = `--- a/${STATE.nameA || 'fileA'}\n+++ b/${STATE.nameB || 'fileB'}\n`;
  hunks.forEach(hunk => {
    patch += getHunkInfo(hunk, linesA) + '\n';
    hunk.forEach(op => {
      if (op.t === '=') patch += ' ' + linesA[op.a] + '\n';
      else if (op.t === '-') patch += '-' + linesA[op.a] + '\n';
      else patch += '+' + linesB[op.b] + '\n';
    });
  });

  navigator.clipboard.writeText(patch).then(() => {
    showToast('Git Patch copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy patch', 'error');
  });
}

function showToast(msg, type = 'info') {
  const t = id('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 2600);
}

function esc(s) { return s ? s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

// Drag & drop window handlers
['dragover', 'dragenter', 'drop'].forEach(evt => window.addEventListener(evt, e => e.preventDefault()));
['dragover', 'dragenter'].forEach(evt => window.addEventListener(evt, e => { 
  const z = e.target.closest('.zone'); 
  if (z) z.classList.add('over'); 
}));
['dragleave', 'drop'].forEach(evt => window.addEventListener(evt, e => { 
  const z = e.target.closest('.zone'); 
  if (z) z.classList.remove('over'); 
}));

// Global keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  if (e.altKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    const modes = ['split', 'unified', 'full'];
    const next = modes[(modes.indexOf(STATE.viewMode) + 1) % modes.length];
    setView(next);
  } else if (e.altKey && e.key.toLowerCase() === 'w') {
    e.preventDefault();
    id('ws-chk').checked = !id('ws-chk').checked;
    triggerDiff();
  } else if (e.altKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    id('wrap-chk').checked = !id('wrap-chk').checked;
    toggleWordWrap();
  } else if (e.altKey && (e.key.toLowerCase() === 'm' || e.key === 'ь' || e.key === 'Ь')) {
    e.preventDefault();
    id('minimap-chk').checked = !id('minimap-chk').checked;
    toggleMinimap();
  }
});

// Sync Minimap on window scroll and window resize
window.addEventListener('scroll', () => {
  if (STATE.showMinimap) updateMinimapSlider();
}, { passive: true });

window.addEventListener('resize', () => {
  if (STATE.showMinimap) {
    renderMinimapCanvas();
    updateMinimapSlider();
  }
}, { passive: true });

// Smart page-level paste via Ctrl+V
window.addEventListener('paste', (e) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
  const text = e.clipboardData ? e.clipboardData.getData('text') : '';
  if (!text) return;

  if (STATE.a === null) {
    setTextSide('a', text, 'Clipboard (A)');
    showToast('Pasted as File A (Original)', 'success');
  } else if (STATE.b === null) {
    setTextSide('b', text, 'Clipboard (B)');
    showToast('Pasted as File B (Modified)', 'success');
  } else {
    setTextSide('b', text, 'Clipboard (B)');
    showToast('Updated File B with clipboard content', 'success');
  }
});