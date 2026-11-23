#!/usr/bin/env node
'use strict';

// Reproduce the single fixed transfer tested in Director issue #2399.
// Source key: exact post-square Onion6 pages 107, 167, 229 (408 GP29 runes).
// Target: original LP2 p0-p55, one continuous P = C - K mod 29 stream.
// No offsets, resets, alternative keys, or target F skips are searched.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const archive = JSON.parse(read('resources/external/2014-onion6-seven-rune-pages.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const gp = corpus.runes;
const translit = corpus.translit;
const runeIndex = new Map(gp.map((r, i) => [r, i]));
const mod = n => ((n % 29) + 29) % 29;
const runeOnly = s => [...s].filter(ch => runeIndex.has(ch)).join('');
const sha256 = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

const shortKey = [...'FIRFUMFERENFE'].map(ch => translit.indexOf(ch));
assert.deepEqual(shortKey, [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18]);
let sourceClock = 0;
const skipEvents = [];
function decryptSourcePage(entry) {
  let out = '', pendingColon = false, runeOffset = 0;
  for (const ch of [...entry.runic_text]) {
    if (ch === ':') { out += ch; pendingColon = true; continue; }
    if (!runeIndex.has(ch)) { out += ch; continue; }
    const c = runeIndex.get(ch);
    if (pendingColon) {
      assert.equal(c, 0, 'archived colon hold must precede GP F');
      skipEvents.push({ page: entry.page, runeOffset, keyPhase: sourceClock % 13 });
      out += ch;
      pendingColon = false;
      runeOffset++;
      continue;
    }
    out += gp[mod(c - shortKey[sourceClock % 13])];
    sourceClock++;
    runeOffset++;
    pendingColon = false;
  }
  assert.equal(pendingColon, false);
  return out;
}
const page107 = archive.originals.find(p => p.page === '107');
const page167 = archive.originals.find(p => p.page === '167');
const page229 = archive.originals.find(p => p.page === '229');
assert(page107 && page167 && page229);
const plain107 = decryptSourcePage(page107);
const plain167 = decryptSourcePage(page167);
const plain229 = page229.runic_text;
assert.deepEqual([runeOnly(plain107).length, runeOnly(plain167).length, runeOnly(plain229).length], [226, 93, 89]);
assert.deepEqual(skipEvents.map(x => [x.page, x.runeOffset]), [['107', 49], ['107', 58]]);
assert.equal(sourceClock, 317, 'page 167 must carry page 107 clock');

const sourceKey = runeOnly(plain107) + runeOnly(plain167) + runeOnly(plain229);
const key = [...sourceKey].map(g => runeIndex.get(g));
assert.equal(key.length, 408);

const corpusTape = corpus.pages.flatMap(p => p.indices);
const tapeRunes = [...transcription].filter(ch => runeIndex.has(ch));
const tapeIndices = tapeRunes.map(g => runeIndex.get(g));
assert.deepEqual(tapeIndices, corpusTape, 'original transcription must match page-mapped corpus exactly');
assert.equal(tapeIndices.length, 13136);
assert.equal((transcription.match(/:/g) || []).length, 0, 'no target colon markers: no LP2 F holds are authorized');
const unknown = tapeIndices.slice(0, 12956);
assert.equal(unknown.length, 12956);
const targetFCount = unknown.filter(x => x === 0).length;

// One start: key[0] aligns with the first rune of LP2 p0. All target runes,
// including F, advance the key because no colon marker occurs in the target.
const plain = unknown.map((c, i) => mod(c - key[i % key.length]));
const replay = plain.map((p, i) => mod(p + key[i % key.length]));
assert.deepEqual(replay, unknown, 'forward replay must reproduce all 12,956 ciphertext runes');

const pageStart = [];
let offset = 0;
for (const p of corpus.pages) { pageStart[p.page] = offset; offset += p.indices.length; }
const windows = {
  p16_21: plain.slice(pageStart[16], pageStart[22]),
  p40_53: plain.slice(pageStart[40], pageStart[54]),
  all: plain
};
const ioc = values => {
  const f = new Array(29).fill(0);
  for (const x of values) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
};
const p56 = corpus.pages.find(p => p.page === 56).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
function plantedRoundTrip(values) {
  const encrypted = values.map((v, i) => mod(v + key[i % key.length]));
  const decrypted = encrypted.map((v, i) => mod(v - key[i % key.length]));
  assert.deepEqual(decrypted, values);
  return true;
}
assert(plantedRoundTrip(p56));
assert(plantedRoundTrip(p57));
assert(plantedRoundTrip([...p56, ...p57]));

function replaceRunes(source, replacements, limit) {
  let n = 0, out = '';
  for (const ch of [...source]) {
    if (runeIndex.has(ch) && n < limit) out += gp[replacements[n++]];
    else out += ch;
  }
  assert.equal(n, limit);
  return out;
}
function splitPages(source) {
  let pos = 0;
  const segments = [];
  for (const p of corpus.pages) {
    const start = pos;
    let count = 0;
    while (pos < source.length && count < p.indices.length) {
      const ch = String.fromCodePoint(source.codePointAt(pos));
      if (runeIndex.has(ch)) count++;
      pos += ch.length;
    }
    while (pos < source.length) {
      const ch = String.fromCodePoint(source.codePointAt(pos));
      if (runeIndex.has(ch)) break;
      pos += ch.length;
    }
    segments[p.page] = source.slice(start, pos);
  }
  return segments;
}
const outputTape = replaceRunes(transcription, plain, 12956);
const segments = splitPages(outputTape);
const gridByPage = new Map(grid.pages.map(p => [p.page, p]));
const formatGrid = p => {
  const rows = [];
  for (let i = 0; i < p.tokens.length; i += p.cols) rows.push(p.tokens.slice(i, i + p.cols).join(' '));
  return rows.join('\n');
};
function renderOutput() {
  const lines = [
    '# 2014 Onion6 post-square 408-rune running-key test',
    '',
    'Method: pages 107 and 167 are decrypted with standard GP29 indices and `P=(C-K) mod 29`, using `FIRFUMFERENFE` and only the two literal colon-marked F clock holds; page 167 carries the page 107 key clock. Page 229 is clear. The three pages are concatenated in delivery order as one 408-rune key. LP2 p0–55 uses one continuous key starting at its first rune; no page resets or phase search. The LP2 transcription has no literal colon markers, so no F skips are applied to the target; every target rune advances the key.',
    '',
    '## Reconstructed source key pages (punctuation preserved)'
  ];
  for (const [page, txt] of [['107', plain107], ['167', plain167], ['229', plain229]]) {
    lines.push('', `### Page ${page}`, '```', txt, '```');
  }
  lines.push('', '### Concatenated 408-rune key (runes only)', '```', sourceKey, '```');
  lines.push('', '## LP2 p16–21 output');
  for (let p = 16; p <= 21; p++) lines.push('', `### p${p}`, '```', segments[p], '```');
  lines.push('', '## LP2 p40–53 output');
  for (let p = 40; p <= 53; p++) {
    lines.push('', `### p${p}`);
    if (p === 49) lines.push('Runic text above the table:', '```', segments[p], '```', 'Original numeric table rows (unchanged):', '```', formatGrid(gridByPage.get(49)), '```');
    else if (p === 50) lines.push('Original numeric-only page (unchanged):', '```', formatGrid(gridByPage.get(50)), '```');
    else if (p === 51) lines.push('Original numeric table rows (unchanged):', '```', formatGrid(gridByPage.get(51)), '```', 'Runic text below the table:', '```', segments[p], '```');
    else lines.push('```', segments[p], '```');
  }
  return lines.join('\n') + '\n';
}
const output = renderOutput();
const storedOutput = read('im-results/lp2-onion6-post-square-running-key-output.txt');
assert.equal(storedOutput, output, 'committed complete output must reproduce exactly');

const transliterate = values => values.map(n => translit[n]).join('');
const summary = {
  source_pages: ['107', '167', '229'],
  source_page_runes: [226, 93, 89],
  source_key_runes: key.length,
  source_key_clock_advances: sourceClock,
  source_colon_F_holds: skipEvents,
  lp2_total_runes: tapeIndices.length,
  lp2_unknown_runes: unknown.length,
  lp2_target_colon_markers: 0,
  lp2_target_F_runes_all_consumed: targetFCount,
  key_start: 'first rune of LP2 p0',
  key_period: key.length,
  operation: 'P=(C-K) mod 29; continuous; no page resets or phase search',
  forward_replay_exact: true,
  windows: Object.fromEntries(Object.entries(windows).map(([name, values]) => [name, {
    runes: values.length,
    ioc: ioc(values),
    preview_gp: transliterate(values.slice(0, 220))
  }])),
  random_uniform_ioc: 1 / 29,
  native_solved_plants: {
    p56: plantedRoundTrip(p56),
    p57: plantedRoundTrip(p57),
    p56_p57: plantedRoundTrip([...p56, ...p57]),
    p57_ioc: ioc(p57)
  },
  source_key_sha256: sha256(sourceKey),
  output_sha256: sha256(output),
  complete_output_file: 'im-results/lp2-onion6-post-square-running-key-output.txt'
};
console.log(JSON.stringify(summary, null, 2));
