"use strict";

/**
 * Historical 2014 14-column rowwise permutation applied to the untouched
 * LP2 physical printed-word lengths. The permutation is fixed by the signed
 * original Stage03 70-character message, not fitted to LP2.
 *
 * Windows Node.js 22 CommonJS single-file runnable test (SFT).
 * No network, no third-party dependencies and no repository writes.
 * Run in the repository's sims/ directory context.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const runes = new Set(gp.runes);
const chapterSizes = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const historicalOrder = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const totalRunes = 12956;
const totalWords = 2896;
const bins = 12;

/**
 * Printed punctuation "-" "." "&" ends words; '/' visual line and '%'
 * physical page do not. This joins the authentic 32 physical-page carries.
 * @param {string} text
 * @returns {number[]}
 */
function extractOriginalWordLengths(text) {
  const result = [];
  let count = 0;
  let length = 0;
  for (const ch of text) {
    if (runes.has(ch)) {
      length++;
      count++;
      if (count === totalRunes) {
        result.push(length);
        break;
      }
    } else if ("-.&".includes(ch) && length) {
      result.push(length);
      length = 0;
    }
  }
  assert.equal(count, totalRunes);
  assert.equal(result.length, totalWords);
  return result;
}

/** @param {number[]} words @returns {number[][]} */
function splitChapters(words) {
  let pos = 0;
  const result = chapterSizes.map((n) => {
    const out = words.slice(pos, pos + n);
    pos += n;
    return out;
  });
  assert.equal(pos, words.length);
  return result;
}

/**
 * Inverting a partial final row uses the inverse of the restricted
 * permutation, rather than restricting the full 14-wide inverse.
 * @template T
 * @param {T[]} data
 * @param {boolean} decode
 * @returns {T[]}
 */
function historicalRows(data, decode) {
  const output = [];
  for (let at = 0; at < data.length; at += 14) {
    const row = data.slice(at, at + 14);
    const order = historicalOrder.filter((x) => x < row.length);
    const transformed = Array(row.length);
    if (decode) {
      for (let j = 0; j < order.length; j++) transformed[j] = row[order[j]];
    } else {
      for (let j = 0; j < order.length; j++) transformed[order[j]] = row[j];
    }
    output.push(...transformed);
  }
  return output;
}

const originalWords = extractOriginalWordLengths(original);
const historicalCipher = "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ";
const historicalClear = "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";
assert.equal(historicalCipher.length, 70);
assert.equal(historicalClear.length, 70);
assert.equal(historicalRows(Array.from(historicalCipher), true).join(""), historicalClear);
assert.equal(historicalRows(Array.from(historicalClear), false).join(""), historicalCipher);
assert.deepEqual(historicalRows(historicalRows(originalWords, true), false), originalWords);

const tokens = gp.translit.slice().sort((a, b) => b.length - a.length);
/** @param {string} raw @returns {number} */
function gpEnglishLength(raw) {
  const word = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let at = 0; at < word.length;) {
    const width = word.startsWith("ING", at) ? 3
      : word.startsWith("IO", at) ? 2
      : (tokens.find((t) => word.startsWith(t, at)) || "").length;
    assert.ok(width > 0, "GP normalization for " + raw);
    length++;
    at += width;
  }
  return length;
}

const controls = [
  {name:"Shakespeare", lengths:(shakespeare.match(/[A-Za-z]+/g) || []).map(gpEnglishLength), train:40000, holdout:41000},
  {name:"Gibran", lengths:(gibran.match(/[A-Za-z]+/g) || []).map(gpEnglishLength), train:9500, holdout:10000}
];
assert.deepEqual(controls.map((x) => x.lengths.length), [55407, 15733]);

const counts = Array.from({length:bins}, () => new Float64Array(bins));
const marginal = new Float64Array(bins);
const totals = new Float64Array(bins);
const b = (n) => Math.min(bins - 1, n - 1);
for (const {lengths, train} of controls) {
  for (let i = 1; i < train; i++) {
    const a = b(lengths[i - 1]);
    const c = b(lengths[i]);
    counts[a][c]++;
    totals[a]++;
    marginal[c]++;
  }
}
const sum = totals.reduce((a, c) => a + c, 0);
const logBase = Array.from(marginal, (v) => Math.log((v + .3)/(sum + bins*.3)));
const logCond = counts.map((row, i) => Array.from(row,
  (v) => Math.log((v + .3)/(totals[i] + bins*.3))));

/** @param {number[][]} groups @returns {number} */
function score(groups) {
  let sumLog = 0, n = 0;
  for (const group of groups) {
    for (let i = 1; i < group.length; i++) {
      const x = b(group[i - 1]), y = b(group[i]);
      sumLog += logCond[x][y] - logBase[y];
      n++;
    }
  }
  return sumLog/n;
}

/** @param {number[][]} groups @returns {number} */
function mutualInfo(groups) {
  const joint = Array.from({length:bins}, () => new Float64Array(bins));
  const first = new Float64Array(bins), second = new Float64Array(bins);
  let n = 0;
  for (const group of groups) {
    for (let i = 1; i < group.length; i++) {
      const x = b(group[i - 1]), y = b(group[i]);
      first[x]++; second[y]++; joint[x][y]++; n++;
    }
  }
  let value = 0;
  for (let i = 0; i < bins; i++) for (let j = 0; j < bins; j++) {
    if (joint[i][j]) value += joint[i][j]/n * Math.log(joint[i][j]*n/(first[i]*second[j]));
  }
  return value;
}
const transformed = {
  printed: splitChapters(originalWords),
  chapterDecrypt: splitChapters(originalWords).map((x) => historicalRows(x, true)),
  chapterEncrypt: splitChapters(originalWords).map((x) => historicalRows(x, false)),
  bookDecrypt: [historicalRows(originalWords, true)],
  bookEncrypt: [historicalRows(originalWords, false)]
};
const originalStats = Object.fromEntries(Object.entries(transformed)
  .map(([name, grouped]) => [name, {mutualInformation: mutualInfo(grouped),
    conditionalLengthLogLR: score(grouped)}]));

// A planted source-native test must prove the proposed permutation and its
// partial-row handling recover every original word length, including row tails.
const nativePlants = controls.map(({name, lengths, holdout}) => {
  const clear = lengths.slice(holdout, holdout + totalWords);
  assert.equal(clear.length, totalWords);
  const cipherGroups = splitChapters(clear).map((x) => historicalRows(x, false));
  const decoded = cipherGroups.map((x) => historicalRows(x, true));
  assert.deepEqual(decoded.flat(), clear);
  return {name, exactRecovered: totalWords, originalScore:score(splitChapters(clear)),
    scrambledScore:score(cipherGroups), decodedScore:score(decoded)};
});
assert.ok(nativePlants.every((x) => x.decodedScore > x.scrambledScore));

let seed = 0x33013301;
/** @returns {number} */
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
/** @param {number[]} originalGroup @returns {number[]} */
function shuffle(originalGroup) {
  const result = originalGroup.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand()*(i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const nullScores = Array.from({length:3000},
  () => score(splitChapters(originalWords).map(shuffle)));
const nullMean = nullScores.reduce((a, x) => a + x, 0)/nullScores.length;
const nullUpperP = Object.fromEntries(Object.entries(originalStats)
  .map(([name, data]) => [name,
    (1 + nullScores.filter((x) => x >= data.conditionalLengthLogLR).length)/
      (nullScores.length + 1)]));
assert.ok(nullUpperP.chapterDecrypt > .05,
  "historical transfer unexpectedly passes its exploratory original null");
const heldout = {
  firstEightOriginal:score(transformed.printed.slice(0, 8)),
  firstEightDecoded:score(transformed.chapterDecrypt.slice(0, 8)),
  lastChapterOriginal:score(transformed.printed.slice(8)),
  lastChapterDecoded:score(transformed.chapterDecrypt.slice(8))
};
const output = {
  hypothesis:"2014 source-fixed 14-column rowwise word transposition, GP29 word lengths",
  originalRunes:totalRunes, originalWords:totalWords, chapterWordCounts:chapterSizes,
  historicalOrder, originalStats, null:{iterations:nullScores.length, mean:nullMean,
    min:Math.min(...nullScores), max:Math.max(...nullScores), upperP:nullUpperP},
  nativePlants, heldout,
  conclusion:"No surviving source-fixed 14-column complete-word English-length signal; no unknown plaintext or key"
};
console.log(JSON.stringify(output,null,2));
