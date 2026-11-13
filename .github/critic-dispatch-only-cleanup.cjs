'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workflows = path.join(root, '.github', 'workflows');
const selfWorkflow = path.join(workflows, 'critic-dispatch-only-cleanup-once.yml');

/**
 * Preserve workflow_dispatch including its inputs, removing other root-level
 * GitHub Actions triggers. Job definitions and permissions are untouched.
 * @param {string} original Original YAML.
 * @param {string} filename Source path for diagnostics.
 * @returns {string|null} Modified YAML, or null if already manual-only.
 */
function manualOnly(original, filename) {
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  const lines = original.split(/\r?\n/);
  const start = lines.findIndex(line => /^(?:on|'on'|"on"):\s*/.test(line));
  if (start < 0) throw Error('Missing root on declaration: ' + filename);
  let end = start + 1;
  while (end < lines.length && (/^\s/.test(lines[end]) || /^\s*#/.test(lines[end]) || lines[end] === '')) end++;
  const value = lines[start].replace(/^(?:on|'on'|"on"):\s*/, '').trim();
  let replacement = ['on:', '  workflow_dispatch:'];
  if (value) {
    if (value === 'workflow_dispatch' || value === '[workflow_dispatch]') return null;
    if (!/^\[[\w,\s-]+\]$/.test(value) && !/^[\w-]+$/.test(value)) {
      throw Error('Unrecognized inline on syntax: ' + filename + ': ' + value);
    }
  } else {
    let current = '';
    let hasManual = false;
    const keep = [];
    const eventNames = [];
    for (let i = start + 1; i < end; i++) {
      const m = lines[i].match(/^ {2}([\w-]+):(?:\s|$)/);
      if (m) {
        current = m[1];
        eventNames.push(current);
        if (current === 'workflow_dispatch') hasManual = true;
      }
      if (current === 'workflow_dispatch') keep.push(lines[i]);
    }
    if (eventNames.length === 0) throw Error('No recognized on events: ' + filename);
    if (eventNames.every(event => event === 'workflow_dispatch')) return null;
    if (hasManual) replacement = ['on:', ...keep];
  }
  const result = [...lines.slice(0, start), ...replacement, ...lines.slice(end)].join(newline);
  return result === original ? null : result;
}

/**
 * Acquire an exclusive sibling lock, write and fsync a temporary file, and
 * rename it over the destination so an interrupted update stays atomic.
 * @param {string} filename Target YAML.
 * @param {string} content Replacement text.
 */
function atomicLockedWrite(filename, content) {
  const lockname = filename + '.critic.lock';
  const tmp = filename + '.critic.' + process.pid + '.tmp';
  const lock = fs.openSync(lockname, 'wx');
  try {
    const fd = fs.openSync(tmp, 'wx');
    try {
      fs.writeFileSync(fd, content, 'utf8');
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmp, filename);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(lock);
    fs.unlinkSync(lockname);
  }
}

const changed = [];
for (const name of fs.readdirSync(workflows).sort()) {
  if (!/\.ya?ml$/i.test(name)) continue;
  const filename = path.join(workflows, name);
  const original = fs.readFileSync(filename, 'utf8');
  const replacement = manualOnly(original, name);
  if (replacement !== null) changed.push({filename, replacement, name});
}
for (const item of changed) atomicLockedWrite(item.filename, item.replacement);

// The temporary, dispatch-only repair infrastructure removes itself in the
// same repository commit, leaving only the policy correction.
fs.unlinkSync(selfWorkflow);
fs.unlinkSync(__filename);
console.log(JSON.stringify({
  scanned: fs.readdirSync(workflows).filter(name => /\.ya?ml$/i.test(name)).length + 1,
  corrected: changed.map(item => item.name),
  correctionCount: changed.length,
  selfRemoved: true
}, null, 2));
