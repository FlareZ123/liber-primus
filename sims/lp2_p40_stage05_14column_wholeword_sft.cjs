"use strict";
/**
 * Reversible, frozen Stage05 14-column whole-word hypothesis for LP2 pp40–53.
 * A prospective inverse, not a claim of recovered plaintext.
 * Node 22: node sims/lp2_p40_stage05_14column_wholeword_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(corpus.runes);

/** @returns {Array<{page:number,runes:string,length:number}>} */
function parseWords() {
  const words = [];
  let page = 0, first = 0, buffer = "";
  const flush = () => {
    if (buffer) {
      words.push({page:first, runes:buffer, length:[...buffer].length});
      buffer = "";
    }
  };
  for (const c of read("resources/liber-primus/lp2-transcription.txt")) {
    if (runeSet.has(c)) {
      if (!buffer) first = page;
      buffer += c;
    } else if (c === "%") {
      page++;
    } else if (c !== "/" && !/\s/u.test(c)) {
      flush();
    }
  }
  flush();
  assert.equal(words.filter(x => x.page < 55).length, 2896);
  assert.equal(words.filter(x => x.page < 55)
    .reduce((s, w) => s + w.length, 0), 12956);
  return words;
}
const chapter = parseWords().filter(x => x.page >= 40 && x.page <= 52);
const heading = chapter.slice(0, 2);
const body = chapter.slice(2);
assert.deepEqual(heading.map(x => x.length), [3, 5]);
assert.equal(chapter.length, 669);
assert.equal(body.length, 667);
assert.equal(body.reduce((s, x) => s + x.length, 0), 3000);
const width = 14;
const historicalOrder = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
assert.deepEqual(historicalOrder.slice().sort((a,b) => a-b),
  Array.from({length:width}, (_,i) => i));

/**
 * Row-first writing, column-order reading; each printed rune word is an atom.
 * @template T @param {T[]} plain @param {number[]} order @returns {T[]}
 */
function encode(plain, order) {
  const columns = Array.from({length:width}, () => []);
  plain.forEach((v,i) => columns[i % width].push(v));
  return order.flatMap(c => columns[c]);
}
/** @template T @param {T[]} cipher @param {number[]} order @returns {T[]} */
function decode(cipher, order) {
  const lengths = Array.from({length:width}, (_,c) =>
    Math.floor(cipher.length / width) + Number(c < cipher.length % width));
  const columns = Array(width);
  let at = 0;
  for (const c of order) {
    columns[c] = cipher.slice(at, at + lengths[c]);
    at += lengths[c];
  }
  assert.equal(at, cipher.length);
  const plain = [];
  for (let row = 0; row < Math.ceil(cipher.length / width); row++)
    for (let c = 0; c < width; c++)
      if (row < columns[c].length) plain.push(columns[c][row]);
  return plain;
}
const inverse = decode(body, historicalOrder);
const reverse = decode(body, historicalOrder.slice().reverse());
assert.deepEqual(encode(inverse, historicalOrder), body);
assert.deepEqual(encode(reverse, historicalOrder.slice().reverse()), body);
const labels = ["ING", ...corpus.translit].sort((a,b) => b.length - a.length);
/** @param {string} text @returns {number[]} */
function gpLengths(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(raw => {
    const word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    let n = 0;
    for (let at = 0; at < word.length;) {
      const token = labels.find(x => word.startsWith(x, at));
      assert.ok(token, "Unmapped GP word " + word);
      at += token.length;
      n++;
    }
    return n;
  });
}
const controls = {
  LP1: gpLengths(read("resources/liber-primus/lp1-plaintext-reference.txt")),
  Gibran: gpLengths(read("resources/control/gibran_prophet_58585.txt")),
  Emerson: gpLengths(read("resources/control/emerson_essays_2944.txt"))
};
assert.deepEqual(Object.fromEntries(Object.entries(controls).map(
  ([k,a]) => [k,a.length])),
  {LP1:942,Gibran:15733,Emerson:77932});
/** @param {number} n @returns {number} */
const category = n => n <= 4 ? n - 1 : n <= 6 ? 4 : n <= 8 ? 5 : 6;
/** @param {number[]} source @returns {number[][]} */
function model(source) {
  const counts = Array.from({length:7}, () => Array(7).fill(1));
  const rows = Array(7).fill(7), cols = Array(7).fill(7);
  let total = 49;
  for (let i = 1; i < source.length; i++) {
    const x = category(source[i-1]), y = category(source[i]);
    counts[x][y]++; rows[x]++; cols[y]++; total++;
  }
  return counts.map((row,x) => row.map((n,y) =>
    Math.log2((n / rows[x]) / (cols[y] / total))));
}
/** @param {number[]} values @param {number[][]} m @returns {number} */
function score(values,m) {
  let sum = 0;
  for (let i = 1; i < values.length; i++)
    sum += m[category(values[i-1])][category(values[i])];
  return sum / (values.length - 1);
}
const sourceLengths = body.map(x => x.length);
const inverseLengths = inverse.map(x => x.length);
const reverseLengths = reverse.map(x => x.length);
let seed = 0x33011414;
/** @param {number} n @returns {number} */
function random(n) {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) % n;
}
/** @param {number[][]} m @param {number} observed */
function shuffleNull(m, observed) {
  let sum = 0, sumSq = 0, ge = 0;
  for (let t = 0; t < 1000; t++) {
    const sample = sourceLengths.slice();
    for (let j = sample.length - 1; j > 0; j--) {
      const k = random(j+1);
      [sample[j],sample[k]] = [sample[k],sample[j]];
    }
    const val = score(sample,m);
    sum += val; sumSq += val*val;
    if (val >= observed) ge++;
  }
  const mean = sum / 1000, sd = Math.sqrt(sumSq/1000-mean*mean);
  return {mean,z:(observed-mean)/sd,upperP:(ge+1)/1001};
}
const reports = {};
for (const [name, lengths] of Object.entries(controls)) {
  const m = model(lengths);
  const source = score(sourceLengths,m);
  const decoded = score(inverseLengths,m);
  const reverseScore = score(reverseLengths,m);
  const nullScore = shuffleNull(m, decoded);
  reports[name] = {source,decoded,reverse:reverseScore,null:nullScore};
}
const planted = controls.Gibran.slice(1234, 1901);
assert.equal(planted.length, 667);
assert.deepEqual(decode(encode(planted,historicalOrder),historicalOrder),planted);
assert(score(planted,model(controls.Gibran)) >
  score(encode(planted,historicalOrder),model(controls.Gibran)));
assert(reports.LP1.null.z < 2);
assert(reports.Gibran.null.z < 2);
assert(reports.Emerson.null.z < 2);
console.log(JSON.stringify({
  source:"original LP2 p40–53, two red heading words excluded",
  historicalOrder, chapterWords:chapter.length, bodyWords:body.length,
  bodyRunes:3000,
  sourcePreservation:"667 entire original words, exact forward inversion",
  reports,
  claim:"14-column historical key did not restore native English word-order grammar"
},null,2));
