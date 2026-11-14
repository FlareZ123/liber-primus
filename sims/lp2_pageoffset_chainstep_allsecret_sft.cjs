"use strict";
/**
 * One SFT: all-key, original-input test of a page-reset chain cipher with
 * one unknown output permutation at each page-local rune offset.
 *
 * Hypothesis:
 *   C[p,0] = pi[0](P[p,0])
 *   C[p,i] = C[p,i-1] + pi[i](P[p,i]) mod 29,  i >= 1.
 *
 * The arbitrary bijections pi[i] are reused across pages, but may be wholly
 * unrelated at different offsets. Therefore D[p,i] = C[p,i]-C[p,i-1]
 * preserves cross-page equality of plaintext P[p,i] for every i >= 1.
 *
 * Contrast this stateful model with the existing direct page-offset-alphabet
 * test (which examines C, not D). Here only first differences are compared.
 *
 * Run: node sims/lp2_pageoffset_chainstep_allsecret_sft.cjs
 * Node.js 22; requires only committed resources and built-ins.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unknown = gp.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(unknown.length, 55);
assert.equal(unknown.reduce((n, p) => n + p.indices.length, 0), 12956);

const p57Text = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1];
assert.deepEqual(encodeSourceNativeGP(p57Text), gp.pages[57].indices,
  "source-native GP29 encoder must reproduce original solved p57 exactly");

/**
 * Count equal-symbol pairs among printed physical pages at matching rune
 * positions, excluding the first rune of each page. In cipherStep mode
 * symbols are first differences C[i]-C[i-1], not original ciphertext C[i].
 * @param {number[][]} pages
 * @param {boolean} cipherStep
 * @returns {{hits:number,pairs:number,rate:number}}
 */
function equalAtSameOffsets(pages, cipherStep) {
  const length = Math.max(...pages.map(p => p.length));
  let hits = 0, pairs = 0;
  for (let i = 1; i < length; i++) {
    const count = new Uint16Array(29);
    let present = 0;
    for (const p of pages) {
      if (i >= p.length) continue;
      const symbol = cipherStep ? (p[i] - p[i - 1] + 29) % 29 : p[i];
      count[symbol]++;
      present++;
    }
    pairs += present * (present - 1) / 2;
    for (const n of count) hits += n * (n - 1) / 2;
  }
  return {hits, pairs, rate:hits / pairs};
}
/**
 * Slice one independently selected consecutive native-GP text span onto the
 * authentic unknown physical-page length schedule.
 * @param {number[]} text
 * @param {number[]} lengths
 * @param {number} start
 * @returns {number[][]}
 */
function overlay(text, lengths, start) {
  let k = start;
  return lengths.map(n => {
    const page = text.slice(k, k + n);
    k += n;
    return page;
  });
}
/** @param {number} i @returns {number} */
function multiplier(i) {
  return 1 + (i * 7) % 28; // any nonzero element is a GP29 unit
}
/** @param {number} i @returns {number} */
function shift(i) {
  return (i * 11 + 3) % 29;
}
/** @param {number} x @returns {number} */
function inverseUnit(x) {
  for (let k = 1; k < 29; k++) if (k * x % 29 === 1) return k;
  throw new Error("noninvertible unit " + x);
}
/**
 * Plant a known invertible secret-position chain model with page-local reset.
 * @param {number[][]} plaintext
 * @returns {number[][]}
 */
function encrypt(plaintext) {
  return plaintext.map(page => {
    const out = [];
    for (let i = 0; i < page.length; i++) {
      const mapped = (multiplier(i) * page[i] + shift(i)) % 29;
      out.push(i === 0 ? mapped : (out[i - 1] + mapped) % 29);
    }
    return out;
  });
}
/**
 * Invert this one positive-control key exactly, including page initials.
 * @param {number[][]} ciphertext
 * @returns {number[][]}
 */
function decrypt(ciphertext) {
  return ciphertext.map(page => page.map((c, i) => {
    const d = i === 0 ? c : (c - page[i - 1] + 29) % 29;
    return (inverseUnit(multiplier(i)) * (d - shift(i) + 29)) % 29;
  }));
}

const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, filename]) => ({
  name, indices:encodeSourceNativeGP(read(filename))
}));
// Independent GP29 source editions: Beowulf Anglo-Saxon and the Vulgate.
// These repository fixtures already encode each original word in its own
// native alphabet register; do not pass them through the English encoder.
/**
 * Decode a fixture with its declared 29-index alphabet. Different historical
 * source fixtures use different printable index encodings. They must never be
 * silently interpreted as one shared text alphabet.
 * @param {string} value
 * @param {string} alphabet
 * @returns {number[]}
 */
function decodeEncodedGP(value, alphabet) {
  assert.equal(new Set(alphabet).size, 29);
  return [...value].map(ch => {
    const n = alphabet.indexOf(ch);
    assert(n >= 0, "original GP fixture contains only its declared symbols");
    return n;
  });
}
const beowulf = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const beowulfIndices = decodeEncodedGP(
  beowulf.sourceGpBase29, beowulf.positiveControlAlphabet);
const originalBeowulfCounts = new Array(29).fill(0);
for (const rune of beowulfIndices) originalBeowulfCounts[rune]++;
assert.deepEqual(originalBeowulfCounts, beowulf.allGpCounts,
  "correct Old English alphabet matches the source-original 29-index histogram");
sources.push({name:"Corrected Old English Beowulf", indices:beowulfIndices});
const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split("\n").filter(line => line.trim() && !line.trimStart().startsWith("#"))
  .join("");
sources.push({name:"Latin Vulgate",
  indices:decodeEncodedGP(latin, "0123456789ABCDEFGHIJKLMNOPQRS")});
assert.deepEqual(sources.map(s => s.indices.length),
  [217106, 62492, 321327, 48012, 204802]);

const chapters = [
  [0,2,19,661], [3,7,87,2093], [8,14,136,4717],
  [15,22,208,5833], [23,26,54,1433], [27,32,102,3122],
  [33,39,158,4770], [40,53,526,15291],
  [54,55,2,75], [0,55,11006,309647]
];
const output = [];
for (const [first, last, expectedHits, expectedPairs] of chapters) {
  const physicalPages = unknown.filter(p => p.page >= first && p.page <= last);
  const ciphertext = physicalPages.map(p => p.indices);
  const lengths = ciphertext.map(p => p.length);
  const total = lengths.reduce((sum, len) => sum + len, 0);
  const original = equalAtSameOffsets(ciphertext, true);
  assert.deepEqual([original.hits, original.pairs],
    [expectedHits, expectedPairs], "untouched source invariant " + first);
  const positivePlain = overlay(sources[0].indices, lengths, 0);
  const positiveCipher = encrypt(positivePlain);
  assert.deepEqual(decrypt(positiveCipher), positivePlain,
    "positive source-native GP text must invert exactly");
  assert.deepEqual(equalAtSameOffsets(positiveCipher, true),
    equalAtSameOffsets(positivePlain, false),
    "arbitrary position-wise secret bijections must preserve paired equalities");
  const controls = [];
  for (const source of sources) {
    let windows = 0, atOrBelow = 0, minimum = Infinity;
    for (let start = 0; start + total <= source.indices.length; start += 127) {
      const reference = equalAtSameOffsets(
        overlay(source.indices, lengths, start), false);
      assert.equal(reference.pairs, original.pairs);
      if (reference.rate < minimum) minimum = reference.rate;
      if (reference.rate <= original.rate) atOrBelow++;
      windows++;
    }
    controls.push({source:source.name, windows, minimum, atOrBelow});
  }
  output.push({pages:first + "-" + last, nPages:physicalPages.length,
    runes:total, original, controls});
}

const all = output.at(-1);
assert(all.controls.every(c => c.atOrBelow === 0),
  "full-book original differs from every source-native control window");

// A second original-author control uses only genuinely clear original GP runes,
// not solved LP1 passages that are still ciphered in the source images.
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt").split("%");
const runeIndex = new Map(gp.runes.map((x, i) => [x, i]));
const clearPages = [3, 8, 9, 10, 11, 14].map(n =>
  [...lp1[n]].filter(x => runeIndex.has(x)).map(x => runeIndex.get(x)));
assert.deepEqual(clearPages.map(p => p.length), [157,187,207,192,169,89]);
const sourceAuthor = equalAtSameOffsets(clearPages, false);
assert.deepEqual([sourceAuthor.hits, sourceAuthor.pairs], [128,2131]);

console.log(JSON.stringify({
  status:"bounded original-chainstep shared-page-key exclusion, no plaintext",
  hypothesis:"C[p,i]=C[p,i-1]+pi[i](P[p,i]) mod29, common pi[i] across pages",
  calibration:"solved p57 source-native GP exact 95/95",
  authorOriginalControl:sourceAuthor,
  originalRunes:12956,
  sourceWindowsStride:127,
  syntheticChainPositive:"every original-sized position recovers with exact inverse",
  chapters:output
}, null, 2));
