'use strict';

/**
 * Physical giant-capital reset test on original Liber Primus LP2.
 * Run: node sims/lp2_giant_cap_phi_ftransparent_reset_sft.cjs
 * The 13 site coordinates are fixed by the original-JPEG giant-cap classifier.
 * A zero-based prime key starts at each cap; the exact p56 transparent-F rule
 * is tested in its historical (+) direction and a finite reversed (-) control.
 * No guessed key, model scoring, or searched starting phase enters the test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(dir, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(dir, 'lp2-transcription.txt'), 'utf8');
const runes = new Set(corpus.runes);
const gp = corpus.translit;

/** @type {[number,number][]} Physical (page, zero-based printed rune line). */
const capSites = [
  [0, 0], [3, 0], [3, 6], [6, 4], [8, 0], [15, 1], [23, 0],
  [27, 0], [33, 0], [33, 5], [39, 6], [40, 0], [54, 0]
];
const expectedGlobal = [
  0, 729, 848, 1541, 1874, 3612, 5506, 6527, 7960, 8051,
  9519, 9640, 12648
];
const expectedInitials = [
  'S', 'L', 'P', 'A', 'X', 'L', 'U', 'M', 'D', 'NG', 'IA', 'F', 'A'
];
const expectedPlusFailures = [235, 22, 5, 36, 30, 41, 0, 95, 58, 1, 11, 38, 105];
const expectedMinusFailures = [23, 13, 24, 4, 26, 117, 23, 110, 18, 78, 8, 75, 3];

const physicalText = transcription.split('%');
assert.equal(physicalText.length, 57, 'transcription omits runeless p50');
physicalText.splice(50, 0, '');
assert.equal(physicalText.length, 58);
const glyphs = text => [...text].filter(ch => runes.has(ch));
for (let p = 0; p < 58; p += 1) {
  assert.equal(glyphs(physicalText[p]).length, corpus.pages[p].indices.length,
    'page-rune count p' + p);
}
const allUnknown = corpus.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(allUnknown.length, 12956);
const sites = capSites.map(([page, line], i) => {
  const lines = physicalText[page].split('\n').map(x => glyphs(x)).filter(x => x.length);
  assert.ok(line < lines.length, 'physical rune-line coordinate');
  const pageOffset = lines.slice(0, line).reduce((s, x) => s + x.length, 0);
  const globalOffset = corpus.pages.slice(0, page)
    .reduce((s, p) => s + p.indices.length, 0) + pageOffset;
  assert.equal(globalOffset, expectedGlobal[i], 'original cap location');
  assert.equal(gp[allUnknown[globalOffset]], expectedInitials[i], 'giant rune');
  return { page, line, pageOffset, globalOffset, initial: expectedInitials[i] };
});

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const values = [];
  for (let x = 2; values.length < count; x += 1) {
    let isPrime = true;
    for (let j = 2; j * j <= x; j += 1) {
      if (x % j === 0) { isPrime = false; break; }
    }
    if (isPrime) values.push(x);
  }
  return values;
}
const primeKey = firstPrimes(3200).map(p => (p - 1) % 29);
const mod29 = n => (n % 29 + 29) % 29;

/**
 * Exact reachable consumed-key states, all literal-F masks. For an observed
 * ciphertext F, allow a nonconsuming literal-F path. A consuming transition
 * must never reconstruct plaintext F, because the original forward rule
 * mandates that plaintext F be emitted transparently.
 * @param {number[]} cipher
 * @param {1|-1} sign Forward sign for non-F ciphertext
 * @returns {{length:number,firstImpossible:number|null,failRune:string|null,
 *  precedingStates:number[],terminalStates:number[],peakStates:number}}
 */
function reach(cipher, sign) {
  let states = new Set([0]);
  let peakStates = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    const next = new Set();
    for (const used of states) {
      if (cipher[i] === 0) next.add(used);
      if (mod29(cipher[i] - sign * primeKey[used]) !== 0) {
        next.add(used + 1);
      }
    }
    if (!next.size) {
      return {
        length: cipher.length, firstImpossible: i, failRune: gp[cipher[i]],
        precedingStates: [...states].sort((a, b) => a - b),
        terminalStates: [], peakStates
      };
    }
    states = next;
    peakStates = Math.max(peakStates, states.size);
  }
  return {
    length: cipher.length, firstImpossible: null, failRune: null,
    precedingStates: [], terminalStates: [...states].sort((a, b) => a - b),
    peakStates
  };
}

/**
 * @param {number[]} plain GP-native plaintext
 * @param {1|-1} sign
 * @returns {{cipher:number[],consumed:number}}
 */
function forward(plain, sign) {
  let used = 0;
  const cipher = plain.map(p => p === 0 ? 0 : mod29(p + sign * primeKey[used++]));
  return { cipher, consumed: used };
}

/** @param {string} word @returns {number[]} */
function encodeWord(word) {
  const tokens = gp.map((t, i) => ({ t, i })).sort((a, b) => b.t.length - a.t.length);
  let text = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const result = [];
  while (text.length) {
    const token = tokens.find(x => text.startsWith(x.t));
    assert.ok(token, 'unknown source-native GP token ' + text);
    result.push(token.i);
    text = text.slice(token.t.length);
  }
  return result;
}

/* Independent full original-p56 plaintext and exact 85/85 reencryption. */
const p56Text = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const knownP56 = p56Text.split(' ').flatMap(encodeWord);
assert.equal(knownP56.length, 85);
const knownFOffsets = knownP56.flatMap((p, i) => p === 0 ? [i] : []);
assert.deepEqual(knownFOffsets, [56]);
const p56Enc = forward(knownP56, 1);
assert.equal(p56Enc.consumed, 84);
assert.deepEqual(p56Enc.cipher, corpus.pages[56].indices);
const p56Reach = reach(corpus.pages[56].indices, 1);
assert.equal(p56Reach.firstImpossible, null);
assert.ok(p56Reach.terminalStates.includes(84));

/* Both arithmetic directions additionally receive a native 95-rune plant. */
const plantedControls = [1, -1].map(sign => {
  const plant = forward(corpus.pages[57].indices, sign);
  const result = reach(plant.cipher, sign);
  assert.equal(result.firstImpossible, null);
  assert.ok(result.terminalStates.includes(plant.consumed));
  return { sign, length: plant.cipher.length, consumed: plant.consumed };
});

/* All 13 original cap intervals, retaining every physical page carry. */
const intervals = sites.map((site, i) => {
  const end = i + 1 < sites.length ? sites[i + 1].globalOffset : allUnknown.length;
  const ciphertext = allUnknown.slice(site.globalOffset, end);
  const plus = reach(ciphertext, 1);
  const minus = reach(ciphertext, -1);
  assert.equal(plus.firstImpossible, expectedPlusFailures[i], 'positive cap interval ' + i);
  assert.equal(minus.firstImpossible, expectedMinusFailures[i], 'negative cap interval ' + i);
  return { site, end, length: ciphertext.length, plus, minus };
});
assert.equal(intervals.reduce((s, x) => s + x.length, 0), 12956);

/* A non-cap interior page control, deliberately not used to fit any rule. */
const noncapP9 = reach(corpus.pages[9].indices, 1);
assert.equal(noncapP9.firstImpossible, 3);

const report = {
  hypothesis: 'Prime[0] totient key restarts at each of 13 authentic illuminated initials',
  source: 'original JPEG giant-cap coordinates + unchanged lp2-corpus.json and lp2-transcription.txt',
  originalRunes: 12956,
  nativeP56Positive: {
    exactPlaintext: '85/85', exactReencryption: '85/85',
    literalFOffset: 56, consumed: p56Enc.consumed
  },
  plantedControls, intervals, heldOutNoCapPage9: noncapP9,
  decision: 'All 13 complete physical cap intervals fail at fixed prime start zero, in both signs. Does not exclude unrelated keys or modes.'
};
console.log(JSON.stringify(report, null, 2));
