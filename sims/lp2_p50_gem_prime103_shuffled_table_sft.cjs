"use strict";

/**
 * Original LP2 32x8 byte table, prime-ordinal 103 -> GEM graph route.
 * Exploratory source-conditioned shuffle calibration; NOT a decipherment.
 * Run with Node 22; no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const table = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "base60-grid.json"),
  "utf8"
));
const source = table.byte_rows.flat();
assert.equal(source.length, 256);
assert.equal(table.byte_rows.length, 32);
for (const row of table.byte_rows) assert.equal(row.length, 8);

// Replace English-letter spelling by the historically attested GP29 rune
// inventory; direct ING/IO contractions follow original solved LP1/p57.
const translit = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J", "EO",
  "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D", "A",
  "AE", "Y", "IA", "EA"
];
const tokens = translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);

/**
 * Encode a dictionary word with the verified source-native GP spelling.
 * @param {string} raw
 * @returns {number[]}
 */
function encodeNative(raw) {
  const word = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (word.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = tokens.find(t => word.startsWith(t.text, i));
    if (!token) return [];
    out.push(token.index);
    i += token.text.length;
  }
  return out;
}
const wordList = fs.readFileSync(path.join(__dirname, "..", "resources",
  "control", "english_wordfreq_textblob.txt"), "utf8");
const englishThree = new Set(wordList.split(/\r?\n/).flatMap(line => {
  const match = /^([a-z]+) \d+$/.exec(line);
  if (!match) return [];
  const token = encodeNative(match[1]);
  return token.length === 3 ? [token.join(",")] : [];
}));
assert.equal(englishThree.size, 753);
assert(englishThree.has("6,18,19")); // GEM is in the native dictionary.


// Standard telephone keypad direction: 1 SW, 2 S, 3 SE, 4 W, 5 stay,
// 6 E, 7 NW, 8 N, 9 NE. This convention is a hypothesis, not source-signed.
const moves = [
  [1, -1], [1, 0], [1, 1],
  [0, -1], [0, 0], [0, 1],
  [-1, -1], [-1, 0], [-1, 1]
];

/**
 * Decode one printed table into a directed finite-grid graph.
 * Each byte b is q*29+r, with q+1 the direction and r a GP29 rune index.
 * @param {number[]} bytes 256 original source bytes (possibly shuffled).
 * @returns {{next: Int16Array, symbol: Uint8Array}}
 */
function graph(bytes) {
  const next = new Int16Array(256);
  const symbol = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const byte = bytes[i];
    const quotient = Math.floor(byte / 29);
    const remainder = byte % 29;
    assert(quotient >= 0 && quotient < 9);
    const row = i >> 3;
    const column = i & 7;
    const newRow = row + moves[quotient][0];
    const newColumn = column + moves[quotient][1];
    next[i] = newRow < 0 || newRow >= 32 || newColumn < 0 ||
      newColumn >= 8 ? -1 : 8 * newRow + newColumn;
    symbol[i] = remainder;
  }
  return {next, symbol};
}

/**
 * Whether a directed three-cycle spells GEM in its forward direction,
 * allowing only the three rotationally equivalent starting vertices.
 * @param {number} i
 * @param {Int16Array} next
 * @param {Uint8Array} symbol
 * @returns {boolean}
 */
function isGem(i, next, symbol) {
  const j = next[i];
  const k = next[j];
  return [i, j, k].some(t =>
    symbol[t] === 6 && symbol[next[t]] === 18 &&
    symbol[next[next[t]]] === 19
  );
}

/**
 * Measure exact simple three-cycles and the prime-ordinal start 103.
 * @param {number[]} bytes
 * @returns {{n3:number, ngem:number, reach:boolean, reachGem:boolean, startEnglish:boolean}}
 */
function measure(bytes) {
  const {next, symbol} = graph(bytes);
  let n3 = 0;
  let ngem = 0;
  for (let i = 0; i < 256; i++) {
    const j = next[i];
    if (j < 0 || j === i) continue;
    const k = next[j];
    if (k < 0 || k === i || k === j || next[k] !== i ||
        i > j || i > k) continue;
    n3++;
    if (isGem(i, next, symbol)) ngem++;
  }

  let current = 102; // one-based 103rd prime is 563, width of signed image.
  const seen = new Uint8Array(256);
  let reach = false;
  let reachGem = false;
  let startEnglish = false;
  while (current >= 0 && !seen[current]) {
    seen[current] = 1;
    const j = next[current];
    const k = j >= 0 ? next[j] : -1;
    if (j >= 0 && k >= 0 && j !== current && k !== current &&
        next[k] === current) {
      reach = true;
      reachGem = isGem(current, next, symbol);
      startEnglish = [current, j, k].some(t =>
        englishThree.has([symbol[t], symbol[next[t]],
          symbol[next[next[t]]]].join(","))
      );
      break;
    }
    current = next[current];
  }
  return {n3, ngem, reach, reachGem, startEnglish};
}

const sourceGraph = graph(source);
assert.deepEqual([102, 110, 118, 126, 127].map(i => sourceGraph.symbol[i]),
  [3, 3, 6, 18, 19]); // O O G E M
assert.deepEqual([102, 110, 118, 126, 127].map(i => sourceGraph.next[i]),
  [110, 118, 126, 127, 118]);
const original = measure(source);
assert.deepEqual(original, {n3:1, ngem:1, reach:true, reachGem:true, startEnglish:true});

// Reproducible xorshift32; every group retains the authentic multiset.
// The same PRNG state is continued across all three calibration families.
let state = 0x33010331;
/** @returns {number} Unsigned 32-bit draw. */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

/**
 * Fisher-Yates permutations under three distinct source constraints.
 * @param {"global"|"row"|"column"} mode
 * @param {number} samples
 * @returns {{mode:string,samples:number,geThree:number,anyGem:number,startThree:number,startGem:number,startEnglish:number}}
 */
function calibrate(mode, samples) {
  const bytes = source.slice();
  const counts = {mode, samples, geThree:0, anyGem:0,
    startThree:0, startGem:0, startEnglish:0};
  for (let iteration = 0; iteration < samples; iteration++) {
    if (mode === "global") {
      for (let i = 255; i > 0; i--) {
        const j = random32() % (i + 1);
        [bytes[i], bytes[j]] = [bytes[j], bytes[i]];
      }
    } else if (mode === "row") {
      for (let row = 0; row < 32; row++) {
        for (let t = 7; t > 0; t--) {
          const i = 8 * row + t;
          const j = 8 * row + random32() % (t + 1);
          [bytes[i], bytes[j]] = [bytes[j], bytes[i]];
        }
      }
    } else {
      assert.equal(mode, "column");
      for (let column = 0; column < 8; column++) {
        for (let t = 31; t > 0; t--) {
          const i = 8 * t + column;
          const j = 8 * (random32() % (t + 1)) + column;
          [bytes[i], bytes[j]] = [bytes[j], bytes[i]];
        }
      }
    }
    const result = measure(bytes);
    counts.geThree += Number(result.n3 >= original.n3);
    counts.anyGem += Number(result.ngem > 0);
    counts.startThree += Number(result.reach);
    counts.startGem += Number(result.reachGem);
    counts.startEnglish += Number(result.startEnglish);
  }
  return counts;
}

const global = calibrate("global", 100000);
const row = calibrate("row", 100000);
const column = calibrate("column", 100000);
assert.deepEqual(
  [global, row, column].map(x =>
    [x.geThree, x.anyGem, x.startThree, x.startGem, x.startEnglish]),
  [[90707, 68, 6892, 2, 592],
   [88372, 1520, 5107, 61, 185],
   [92178, 198, 7216, 19, 717]]
);
console.log(JSON.stringify({
  source: "resources/liber-primus/base60-grid.json",
  interpretation: "byte=29q+r; keypad(q+1); rune(r); 1-based start 103",
  authenticPath: "103:O -> 111:O -> 119:G -> 127:E -> 128:M -> 119:G",
  original, nativeEnglishThreeRuneTypes: englishThree.size,
  global, row, column,
  caution: "Exploratory post-selected route; significance does not authenticate selector or plaintext."
}, null, 2));
