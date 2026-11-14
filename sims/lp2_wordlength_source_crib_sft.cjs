"use strict";

/**
 * Exact intact-word-length source crib search for the 56 unsolved LP2 pages.
 * Node.js 22, CommonJS; all inputs are pinned repository source files.
 *
 * The scan finds borrowed contiguous prose despite any length-preserving
 * position-dependent rune cipher. It cannot identify material whose original
 * word boundaries, order, or lengths were changed before encryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(gp.runes);
const text = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

/**
 * Physical-page and printed-line wraps do not split words.
 * @returns {{length:number,page:number,endPage:number}[]}
 */
function originalWords() {
  /** @type {{length:number,page:number,endPage:number}[]} */
  const out = [];
  let word = "", page = 0, startPage = 0, endPage = 0;
  const flush = () => {
    if (word) out.push({length: [...word].length, page: startPage, endPage});
    word = "";
  };
  for (const ch of text) {
    if (runeSet.has(ch)) {
      if (!word) startPage = page;
      word += ch;
      endPage = page;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Line and page wraps preserve continuing word identity.
    } else {
      flush();
    }
  }
  flush();
  return out;
}

const original = originalWords();
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, word) => sum + word.length, 0), 12956);
assert.equal(original.filter((word) => word.page !== word.endPage).length, 32);

const spellings = gp.translit.slice().sort((a, b) => b.length - a.length);
/** @param {string} token */
function nativeLength(token) {
  const word = token.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let count = 0;
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      i += 3;
    } else if (word.startsWith("IO", i)) {
      i += 2;
    } else {
      const rune = spellings.find((spelling) => word.startsWith(spelling, i));
      assert(rune, "Unknown native-GP spelling in source word: " + token);
      i += rune.length;
    }
    count++;
  }
  return count;
}

/** @param {string} filename */
const nativeWords = (filename) =>
  (read(filename).match(/[A-Za-z]+/g) || []).map(nativeLength);

const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).filter((line) =>
    line.trim() && !line.trimStart().startsWith("#"))
  .map((line) => line.trim().length);

const beowulf = JSON.parse(
  read("resources/control/beowulf_oe_gp_profile_corrected.json")
).allSourceGpWordLengths;

/** @type {{name:string,lengths:number[]}[]} */
const sources = [
  {name: "Shakespeare", lengths: nativeWords("resources/control/shakespeare_first300k.txt")},
  {name: "Gibran", lengths: nativeWords("resources/control/gibran_prophet_58585.txt")},
  {name: "Emerson", lengths: nativeWords("resources/control/emerson_essays_2944.txt")},
  {name: "Latin Vulgate", lengths: latin},
  {name: "Beowulf", lengths: beowulf},
];
assert.deepEqual(sources.map((source) => source.lengths.length),
  [55407, 15733, 77932, 39835, 10885]);

/**
 * Exact fixed-length window signatures, base 32.
 * The maximum candidate word length in these five sources is 17;
 * ten base-32 symbols fit losslessly in a JS safe integer (50 bits).
 * @param {number[]} lengths
 * @param {number} n Window length, 1..10.
 * @returns {Map<number,number>}
 */
function windows(lengths, n) {
  assert(Number.isInteger(n) && n >= 1 && n <= 10);
  const map = new Map();
  const divisor = 32 ** (n - 1);
  let value = 0;
  for (let i = 0; i < lengths.length; i++) {
    assert(Number.isInteger(lengths[i]) && lengths[i] >= 1 && lengths[i] < 32);
    value = i < n ? value * 32 + lengths[i]
      : (value % divisor) * 32 + lengths[i];
    if (i >= n - 1 && !map.has(value)) map.set(value, i - n + 1);
  }
  return map;
}

/**
 * @param {number[]} target
 * @param {number[]} source
 * @param {number} n
 * @returns {{target:number,source:number}[]}
 */
function matches(target, source, n) {
  const candidatePositions = windows(source, n);
  const targetWindows = windows(target, n);
  const out = [];
  // Preserve multiple target windows even when their word-length strings repeat.
  const divisor = 32 ** (n - 1);
  let signature = 0;
  for (let i = 0; i < target.length; i++) {
    signature = i < n ? signature * 32 + target[i]
      : (signature % divisor) * 32 + target[i];
    if (i < n - 1 || !candidatePositions.has(signature)) continue;
    const j = candidatePositions.get(signature);
    const p = i - n + 1;
    if (target.slice(p, p + n).every((length, k) => length === source[j + k]))
      out.push({target: p, source: j});
  }
  return out;
}

const sourceWindows = original.map((word) => word.length);
assert.deepEqual(sources.map((source) =>
  matches(sourceWindows, source.lengths, 9).length), [4, 3, 1, 1, 0]);
assert.deepEqual(sources.map((source) =>
  matches(sourceWindows, source.lengths, 10).length), [0, 0, 0, 0, 0]);

// Plant a 10-word authentic native-GP phrase inside the untouched word layout.
const planted = sourceWindows.slice();
planted.splice(0, 10, ...sources[1].lengths.slice(4000, 4010));
assert(matches(planted, sources[1].lengths, 10).some((m) =>
  m.target === 0 && m.source <= 4000));

console.log(JSON.stringify({
  original: {words: original.length, runes: 12956, pageCarriedWords: 32},
  sourceSizes: sources.map(({name, lengths}) => ({name, words: lengths.length})),
  exact9: sources.map(({name, lengths}) =>
    ({name, matches: matches(sourceWindows, lengths, 9)})),
  exact10: sources.map(({name, lengths}) =>
    ({name, matches: matches(sourceWindows, lengths, 10).length})),
  nativePositive: "planted 10-word Gibran phrase recovered at target offset 0",
  decision: "No intact 10-or-more-word GP-native borrowing from these five sources."
}, null, 2));
