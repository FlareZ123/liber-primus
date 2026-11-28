'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));

const KEY = [10, 2, 14, 7, 19, 6, 18, 12, 7, 8, 17, 0, 19, 7, 14, 18, 14, 19, 13, 0, 1, 2, 0];
const A = 29;

/**
 * Apply the exact 2012 Reddit inverse to one Latin line.
 * The historical key restarts at each displayed line and advances on letters only.
 * @param {string} line
 * @returns {string}
 */
function latinDecryptLine(line) {
  let j = 0;
  return Array.from(line).map(ch => {
    const lower = ch.toLowerCase();
    const c = lower.charCodeAt(0) - 97;
    if (c < 0 || c >= 26) return ch;
    const p = (c - KEY[j++ % KEY.length] + 26) % 26;
    const out = String.fromCharCode(97 + p);
    return ch === lower ? out : out.toUpperCase();
  }).join('');
}

/**
 * Keep letters only and lower-case them for source-control equality.
 * @param {string} s
 * @returns {string}
 */
function letters(s) {
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Tokenize native English into canonical GP29 indices using the repository convention.
 * @param {string} text
 * @returns {number[]}
 */
function nativeGp(text) {
  const start = /\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);
  const end = /\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);
  const tokens = gp.translit.map((t, i) => ({t, i})).sort((a, b) => b.t.length - a.t.length);
  const out = [];

  for (const raw of text.slice(start ? start.index + start[0].length : 0, end ? end.index : text.length)
    .toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let j = 0; j < word.length;) {
      const v = word.startsWith('ING', j)
        ? {t: 'ING', i: 21}
        : word.startsWith('IO', j)
          ? {t: 'IO', i: 27}
          : tokens.find(x => word.startsWith(x.t, j));
      assert(v, 'cannot GP-tokenize ' + word.slice(j));
      out.push(v.i);
      j += v.t.length;
    }
  }
  return out;
}

/**
 * Return the mode, top-three mass and IoC of a GP29 tape.
 * @param {number[]} xs
 */
function concentration(xs) {
  const hist = Array(A).fill(0);
  for (const x of xs) hist[x]++;
  const sorted = hist.slice().sort((a, b) => b - a);
  return {
    n: xs.length,
    mode: sorted[0],
    top3: sorted[0] + sorted[1] + sorted[2],
    ic: hist.reduce((s, v) => s + v * (v - 1), 0) / (xs.length * (xs.length - 1)),
    hist
  };
}

/**
 * Exhaust every full-length native window and count those no more concentrated
 * than the frozen original inverse on both invariants.
 * @param {number[]} donor
 * @param {{n:number, mode:number, top3:number}} threshold
 */
function rollingWindows(donor, threshold) {
  const hist = new Int32Array(A);
  let windows = 0;
  let pass = 0;
  let minMode = Infinity;
  let minTop3 = Infinity;

  for (let i = 0; i < donor.length; i++) {
    hist[donor[i]]++;
    if (i >= threshold.n) hist[donor[i - threshold.n]]--;
    if (i + 1 < threshold.n) continue;

    windows++;
    let a = 0, b = 0, c = 0;
    for (const v of hist) {
      if (v >= a) { c = b; b = a; a = v; }
      else if (v >= b) { c = b; b = v; }
      else if (v > c) c = v;
    }
    minMode = Math.min(minMode, a);
    minTop3 = Math.min(minTop3, a + b + c);
    if (a <= threshold.mode && a + b + c <= threshold.top3) pass++;
  }

  return {windows, pass, minMode, minTop3};
}

/**
 * Freeze the literal historical transfer:
 * C = P + key[j mod 23] (mod 29), reset j=0 at every physical LP2 line,
 * advance only on GP runes. Punctuation and printed non-rune material are inert.
 * @param {string} transcription
 */
function decodeLp2(transcription) {
  const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
  const sections = transcription.split(/\r?\n%\r?\n/);
  assert.equal(sections.length, 57, 'unexpected LP2 transcription section count');

  // The text transcription compresses out runeless physical p50:
  // sections 0..49 are p0..49, sections 50..54 are p51..55,
  // section 55 is solved p56 and section 56 solved p57.
  const unsolvedSections = sections.slice(0, 55);
  const plain = [];
  const lineLengths = [];

  for (const section of unsolvedSections) {
    for (const line of section.split(/\r?\n/).filter(Boolean)) {
      let j = 0;
      let count = 0;
      for (const ch of Array.from(line)) {
        const c = runeIndex.get(ch);
        if (c === undefined) continue;
        plain.push((c - KEY[j++ % KEY.length] + A) % A);
        count++;
      }
      if (count) lineLengths.push(count);
    }
  }

  assert.equal(plain.length, 12956, 'unsolved p0-p55 rune count drift');
  return {plain, lineLengths};
}

/**
 * Positive GP29 round-trip under the frozen line schedule.
 * @param {number[]} plain
 * @param {number[]} lineLengths
 */
function gpRoundTrip(plain, lineLengths) {
  const out = [];
  let at = 0;
  for (const len of lineLengths) {
    for (let j = 0; j < len; j++) {
      const p = plain[at++];
      const c = (p + KEY[j % KEY.length]) % A;
      out.push((c - KEY[j % KEY.length] + A) % A);
    }
  }
  assert.equal(at, plain.length);
  assert.deepEqual(out, plain);
}

function main() {
  // Archived 2012 worked control:
  // https://github.com/krisyotam/cicada3301/blob/main/puzzles/2012/WALKTHROUGH.md
  // and .../Subreddit-Text-Posts.txt. The second line independently proves reset.
  const cipherLines = [
    'Ukbn Txltbz nal hh Uoxelmgox wdvg Akw; hvu ogl rsm ar sbv ix jwz',
    'mjotukj; mul nimo vaa prrf Qwkkb aak kau ww Ukpsf, ogq Kzpox vvl luf'
  ];
  const plainLines = [
    'King Arthur was at Caerlleon upon Usk; and one day he sat in his',
    'chamber; and with him were Owain the son of Urien, and Kynon the son'
  ];
  for (let i = 0; i < cipherLines.length; i++) {
    assert.equal(letters(latinDecryptLine(cipherLines[i])), letters(plainLines[i]));
  }

  const {plain, lineLengths} = decodeLp2(read('resources/liber-primus/lp2-transcription.txt'));
  const score = concentration(plain);

  const donors = [
    ['Gibran', nativeGp(read('resources/control/gibran_prophet_58585.txt'))],
    ['Shakespeare', nativeGp(read('resources/control/shakespeare_first300k.txt'))],
    ['Emerson', nativeGp(read('resources/control/emerson_essays_2944.txt'))]
  ];

  // A native GP29 plant spanning exactly the original physical-line lengths must
  // round-trip under this recipient before original scoring is considered.
  gpRoundTrip(donors[0][1].slice(0, plain.length), lineLengths);

  const controls = donors.map(([name, tape]) => ({name, ...rollingWindows(tape, score)}));
  assert.equal(controls.reduce((s, x) => s + x.pass, 0), 0, 'native-window gate unexpectedly changed');

  console.log(JSON.stringify({
    schema: 'lp2-2012-reddit-line-shift-transfer-v1',
    historicalControl: {
      key: KEY,
      operation: 'Latin C=P+k mod26; GP transfer P=C-k mod29',
      reset: 'key index zero at each printed line; punctuation inert',
      checkedLines: cipherLines.length,
      pass: true
    },
    original: {
      scope: 'physical LP2 p0-p55 (runeless p50 omitted)',
      lines: lineLengths.length,
      lineLengthMin: Math.min(...lineLengths),
      lineLengthMax: Math.max(...lineLengths),
      ...score,
      hist: undefined,
      preview: plain.slice(0, 120).map(i => gp.translit[i]).join(' ')
    },
    controls,
    totals: {
      windows: controls.reduce((s, x) => s + x.windows, 0),
      pass: controls.reduce((s, x) => s + x.pass, 0)
    }
  }, null, 2));
}

if (require.main === module) main();
module.exports = {KEY, latinDecryptLine, decodeLp2, concentration, rollingWindows};
