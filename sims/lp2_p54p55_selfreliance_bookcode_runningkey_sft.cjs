'use strict';

/**
 * Original 86-rune p54/p55 terminal: two finite historical Emerson readers.
 * Windows 11 / Node.js 22, CommonJS, repository fixtures only.
 *
 * The 2014 first-onion book code selected Emerson's Self-Reliance.
 * This script checks (1) a literal historical source running key and
 * (2) a complete-word 17-endpoint-pair book-coordinate interpretation.
 * Neither source supplies a creator-authenticated instruction to
 * apply these readers to LP2. Negative outcomes are scoped accordingly.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const essays = read('resources/control/emerson_essays_2944.txt');
const witness = read('resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/** Source-validated LP1/LP2 orthography: ING and IO are single GP tokens.
 * @param {string} text
 * @returns {number[]}
 */
function toGP(text) {
  const result = [];
  const source = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of source.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {result.push(21); i += 3; continue;}
      if (word.startsWith('IO', i)) {result.push(27); i += 2; continue;}
      const token = tokens.find((x) => word.startsWith(x.s, i));
      assert(token, 'source-native GP: ' + word);
      result.push(token.i); i += token.s.length;
    }
  }
  return result;
}
/** @param {number[]} xs */
const roman = (xs) => xs.map((x) => gp.translit[x]).join('');
const page = (n) => gp.pages.find((p) => p.page === n).indices;
const original = [...page(54).slice(-10), ...page(55)];
const lengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(original.length, 86);
assert.equal(lengths.reduce((s, n) => s + n, 0), 86);
const pairs = [], core = [], coreIndices = [];
let offset = 0;
for (const length of lengths) {
  pairs.push([original[offset], original[offset + length - 1]]);
  for (let i = 1; i < length - 1; i++) {
    core.push(original[offset + i]);
    coreIndices.push(offset + i);
  }
  offset += length;
}
assert.equal(core.length, 52);
assert.deepEqual(pairs, [
  [6,21],[25,7],[15,17],[14,19],[15,25],[0,1],[7,4],[17,12],
  [19,0],[17,5],[12,18],[28,15],[18,15],[2,22],[5,14],[23,1],[17,10]
]);

// An independently pinned witness has 51 nonempty paragraphs; normalize
// ordinary PDF line-wrap hyphens, not punctuation separating words.
const normalizedWitness = witness.replace(/([A-Za-z])-\r?\n([a-z])/g, '$1$2');
const paragraphs = normalizedWitness.split(/\r?\n\s*\r?\n/)
  .map((p) => p.match(/[A-Za-z]+/g) || []).filter((p) => p.length);
assert.equal(paragraphs.length, 51);
const selected = pairs.map(([paragraph, word]) => paragraphs[paragraph]?.[word]);
assert(selected.every(Boolean));
assert.deepEqual(selected, ['name','Power','in','law','actions','read',
  'popular','feet','The','his','lest','is','lordship','your',
  'inaudible','should','under']);
const endpointKey = toGP(selected.join(' '));
assert.equal(endpointKey.length, 77);
const mod = (x) => (x % 29 + 29) % 29;
const coreDirect = core.map((c, i) => mod(c - endpointKey[i]));
assert.equal(roman(coreDirect),
  'DNGEOAECAEYBOENUNGJTWOEHMAEPAESTGIANGEOBYTSCNYGDIFLDBFAENGTIAAEGAEMOH');
assert.deepEqual(coreDirect.map((p, i) => mod(p + endpointKey[i])), core);
// A 34-symbol shell/key register plus the 52-symbol recovered core is an
// exact 86-symbol reversible representation, not verified plaintext.
const reconstruct = [...original];
coreIndices.forEach((position, i) => {reconstruct[position] = mod(coreDirect[i] + endpointKey[i]);});
assert.deepEqual(reconstruct, original);
// Transparent plaintext-F requires branching only at ciphertext F.
// Any candidate decoded F at a non-F ciphertext position is impossible:
// the historical encoder passed plaintext F literally and consumed no key.
const coreZeros = core.map((x, i) => x === 0 ? i : -1).filter((x) => x >= 0);
assert.deepEqual(coreZeros, [20]);
const transparent = [];
for (let mask = 0; mask < 2; mask++) {
  let clock = 0, legal = true;
  const plain = [];
  for (let i = 0; i < core.length; i++) {
    const passF = i === coreZeros[0] && mask === 1;
    const p = passF ? 0 : mod(core[i] - endpointKey[clock]);
    if (!passF && p === 0) {legal = false; break;}
    plain.push(p);
    if (!passF) clock++;
  }
  if (legal) {
    let j = 0;
    assert.deepEqual(plain.map((p) => p === 0 ? 0 : mod(p + endpointKey[j++])), core);
    transparent.push({mask, readout: roman(plain)});
  }
}
assert.equal(transparent.length, 0, 'strict plaintext-F grammar rejects both endpoint-key masks');

// One whole-book source-key family: two fixed additive directions,
// *every* contiguous source origin, no key/phrase fitting.
const essayKey = toGP(essays);
const native = toGP(gibran);
assert.equal(essayKey.length, 321327);
assert.equal(native.length, 62492);
const freq = new Uint32Array(29 ** 3);
for (let i = 2; i < native.length; i++) {
  freq[native[i-2]*841 + native[i-1]*29 + native[i]]++;
}
const logs = Float64Array.from(freq,
  (n) => Math.log((n + 0.1) / (native.length - 2 + 0.1 * freq.length)));
/** @param {number[]} seq */
function languageScore(seq) {
  let sum = 0;
  for (let i = 2; i < seq.length; i++)
    sum += logs[seq[i-2]*841 + seq[i-1]*29 + seq[i]];
  return sum / (seq.length - 2);
}
/** @param {number[]} cipher @param {number[]} key */
function runningKey(cipher, key) {
  const L = cipher.length, best = [{score: -Infinity}, {score: -Infinity}];
  const plain = new Uint8Array(L);
  for (let sign = 0; sign < 2; sign++) {
    for (let begin = 0; begin + L <= key.length; begin++) {
      let sum = 0, a = 0, b = 0;
      for (let i = 0; i < L; i++) {
        const value = mod(cipher[i] + (sign ? key[begin+i] : -key[begin+i]));
        plain[i] = value;
        if (i >= 2) sum += logs[a*841 + b*29 + value];
        a = b; b = value;
      }
      const score = sum / (L-2);
      if (score > best[sign].score)
        best[sign] = {score, begin, sign, readout: roman([...plain])};
    }
  }
  return best;
}
const direct = runningKey(original, essayKey);
assert.equal(direct[0].begin, 15100);
assert.equal(direct[1].begin, 92363);
// A real solved native page implanted under a source key is retrieved.
const solved = page(57).slice(0, original.length);
const plantStart = 2000;
const planted = solved.map((p, i) => mod(p + essayKey[plantStart + i]));
const plantedScan = runningKey(planted, essayKey);
assert.equal(plantedScan[0].begin, plantStart);
assert.equal(plantedScan[0].readout, roman(solved));

// The historically printed plaintext-F-transparent variant is a
// *different* key clock. Limit the scan to the selected essay's full
// chapter, whose two source headings are unambiguous.
const essayFrom = essays.indexOf('\n     SELF-RELIANCE.', 43000);
const essayTo = essays.indexOf('\n     COMPENSATION.', 100000);
assert(essayFrom >= 0 && essayTo > essayFrom);
const chapter = toGP(essays.slice(essayFrom, essayTo));
assert.equal(chapter.length, 41538);
/** Every legal F-branch, origin and additive direction; no vocabulary
 * optimizations. Ciphertext F may represent literal plaintext F or
 * an encrypted non-F. A non-F ciphertext cannot mean transparent F;
 * if any encrypted branch yields plaintext F, reject that branch.
 * @param {number[]} cipher
 * @param {number[]} key
 */
function transparentRunningKey(cipher, key) {
  const L = cipher.length;
  const zeros = cipher.map((c,i) => c === 0 ? i : -1).filter((x) => x >= 0);
  assert(zeros.length <= 10);
  const best = [{score: -Infinity}, {score: -Infinity}];
  let valid = 0;
  for (let mask = 0; mask < (1 << zeros.length); mask++) {
    const isF = new Uint8Array(L);
    zeros.forEach((position,i) => {if (mask & (1 << i)) isF[position] = 1;});
    const phase = new Uint8Array(L);
    let used = 0;
    for (let i = 0; i < L; i++) {
      phase[i] = used;
      if (!isF[i]) used++;
    }
    for (let sign = 0; sign < 2; sign++) {
      const output = new Uint8Array(L);
      for (let begin = 0; begin + used <= key.length; begin++) {
        let sum = 0, a = 0, b = 0, legal = true;
        for (let i = 0; i < L; i++) {
          const value = isF[i] ? 0 :
            mod(cipher[i] + (sign ? key[begin+phase[i]] : -key[begin+phase[i]]));
          if (!isF[i] && value === 0) {
            legal = false; break;
          }
          output[i] = value;
          if (i >= 2) sum += logs[a*841 + b*29 + value];
          a = b; b = value;
        }
        if (!legal) continue;
        valid++;
        const score = sum / (L - 2);
        if (score > best[sign].score)
          best[sign] = {score, begin, sign, mask, fPositions:
            zeros.filter((_,k) => mask & (1<<k)), readout: roman([...output])};
      }
    }
  }
  return {zeros, valid, best};
}
const historical = transparentRunningKey(original, chapter);
assert.deepEqual(historical.zeros, [25, 35, 51]);
assert.equal(historical.valid, 38901);
assert.deepEqual(historical.best.map((v) => [v.begin,v.mask]),
  [[21456,3],[16957,1]]);
// Positive control with real, solved native GP text and plaintext-F skip.
let keyPos = 500;
const plantedF = solved.map((p) => p === 0 ? 0 : mod(p + chapter[keyPos++]));
keyPos = 500;
const invertedF = plantedF.map((c, i) =>
  solved[i] === 0 ? 0 : mod(c - chapter[keyPos++]));
assert.deepEqual(invertedF, solved);

const result = {
  originalReceiver:'p54 last10 + full p55 76; 17 physical words',
  selectedHistoricalBook:'2014 onion Self-Reliance',
  shellWords:selected, keyRunes:endpointKey.length, coreRunes:core.length,
  bookCoordinatePlain:roman(coreDirect), transparentBookCoordinates:transparent,
  bookCoordinateOriginalRoundTrip:'86/86', completeEmersonKeyRunes:essayKey.length,
  directRunningKey:direct, chapterKeyRunes:chapter.length,
  historicalTransparentF:historical,
  nativeSolvedControlScore:languageScore(solved),
  nativeSolvedSourceKeyRecovery:plantedScan[0].begin === plantStart,
  nativeSolvedFPositive:roman(invertedF) === roman(solved),
  interpretation:'No original terminal plaintext/key/opcode recovered. Two finite, source-motivated readers fail; 2014 book source is authenticated, its LP2 transfer is not.'
};
console.log(JSON.stringify(result, null, 2));
