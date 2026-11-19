"use strict";

/**
 * SFT: p0 red-title candidate EPIPHANY SEEKS against original ciphertext,
 * the authenticated 2016 source message, and source-visible p0-p2 geometry.
 *
 * This test does not claim a reusable cipher. It freezes the candidate selected
 * upstream by the p57 -> p28 -> SHED -> EMERGE route and tests exact residual
 * properties on the untouched first two p0 ciphertext words.
 *
 * Run: node sims/lp2_p0_epiphany_seeks_residual_shell_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file =>
  fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value @returns {number} */
const mod29 = value => (value % 29 + 29) % 29;

/** @param {number[]} values @returns {number} */
const gp0 = values => values.reduce((sum, value) => sum + value, 0);

/** @param {number[]} values @returns {number} */
const gpPrime = values =>
  values.reduce((sum, value) => sum + corpus.prime[value], 0);

/** @param {number} x @param {number} y @returns {[number, number]} */
const H = (x, y) => [mod29(x - y), mod29(x + y)];

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find(item => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const out = [];
  let current = [];
  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if ("-./&$".includes(char) && current.length > 0) {
      out.push(current);
      current = [];
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((text, index) => ({
  index,
  text: text.toUpperCase(),
  values: gpText(text),
}));
assert.equal(signedWords.length, 43);
assert.equal(
  signedWords.slice(18, 22).map(row => row.text).join(" "),
  "MAP THEIR MEANING IS"
);

const parts = transcription.split(/\r?\n%\r?\n/);
const p0Words = runeWords(parts[0]);
assert.deepEqual(p0Words.slice(0, 2).map(values => values.length), [8, 5]);

const cipher = [...p0Words[0], ...p0Words[1]];
const epiphany = signedWords[5];
const seeks = signedWords[6];
assert.equal(epiphany.text, "EPIPHANY");
assert.equal(seeks.text, "SEEKS");
assert.deepEqual([epiphany.values.length, seeks.values.length], [8, 5]);

const plain = [...epiphany.values, ...seeks.values];
const residual = cipher.map((value, index) => mod29(value - plain[index]));
assert.deepEqual(
  residual,
  [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]
);

const plainWordSums = [gp0(epiphany.values), gp0(seeks.values)];
const residualWordSums = [gp0(residual.slice(0, 8)), gp0(residual.slice(8))];
assert.deepEqual(plainWordSums, [121, 71]);
assert.deepEqual(residualWordSums, [149, 43]);

// Whole-title closures.
assert.equal(gp0(plain), 192);
assert.equal(gp0(residual), 192);
assert.equal(gpPrime(residual), 729);
const p0p2RuneCount = corpus.pages
  .filter(page => page.page >= 0 && page.page <= 2)
  .reduce((sum, page) => sum + page.runic_count, 0);
assert.equal(p0p2RuneCount, 729);
assert.equal(27 * 27, 729);

// The physical 8+5 split balances by the independently selected p28.
assert.equal(residualWordSums[0] - plainWordSums[0], 28);
assert.equal(plainWordSums[1] - residualWordSums[1], 28);

// Word-sum H shells land on the authenticated MAP / THEIR ... IS block.
const plainShell = H(plainWordSums[0], plainWordSums[1]);
const residualShell = H(residualWordSums[0], residualWordSums[1]);
assert.deepEqual(plainShell, [21, 18]);
assert.deepEqual(residualShell, [19, 18]);
assert.equal(signedWords[18].text, "MAP");
assert.equal(signedWords[19].text, "THEIR");
assert.equal(signedWords[20].text, "MEANING");
assert.equal(signedWords[21].text, "IS");
assert.equal(plainShell[1], 18);
assert.equal(residualShell[1], 18);
assert.equal(residualShell[0], 19);
assert.equal(plainShell[0], 21);
assert.equal(plainShell[0] - residualShell[0], 2);
assert.equal((plainShell[0] + residualShell[0]) / 2, 20);

// Charge every ordered signed-source pair with total GP length 13 under both
// additive signs. The joint 192/729 geometry leaves one candidate and sign.
const dualGeometryHits = [];
const selfSumHits = [];
const prime729Hits = [];
let length13SignCases = 0;
for (const sign of [1, -1]) {
  for (const left of signedWords) {
    for (const right of signedWords) {
      const candidate = [...left.values, ...right.values];
      if (candidate.length !== cipher.length) continue;
      length13SignCases += 1;
      const candidateResidual = cipher.map((value, index) =>
        mod29(sign === 1 ? value - candidate[index] : candidate[index] - value)
      );
      const integerSum = gp0(candidateResidual);
      const primeSum = gpPrime(candidateResidual);
      const plainSum = gp0(candidate);
      const row = {
        sign: sign === 1 ? "C-P" : "P-C",
        left: left.index,
        right: right.index,
        phrase: left.text + " " + right.text,
        integerSum,
        primeSum,
      };
      if (primeSum === p0p2RuneCount) prime729Hits.push(row);
      if (integerSum === plainSum) selfSumHits.push(row);
      if (integerSum === 192 && primeSum === p0p2RuneCount) {
        dualGeometryHits.push(row);
      }
    }
  }
}
assert.equal(length13SignCases, 104);
assert.deepEqual(prime729Hits, [
  {
    sign: "C-P",
    left: 5,
    right: 0,
    phrase: "EPIPHANY HELLO",
    integerSum: 194,
    primeSum: 729,
  },
  {
    sign: "C-P",
    left: 5,
    right: 6,
    phrase: "EPIPHANY SEEKS",
    integerSum: 192,
    primeSum: 729,
  },
]);
assert.deepEqual(selfSumHits, [
  {
    sign: "C-P",
    left: 5,
    right: 6,
    phrase: "EPIPHANY SEEKS",
    integerSum: 192,
    primeSum: 729,
  },
]);
assert.deepEqual(dualGeometryHits, selfSumHits);

// Charge the H-shell statement across all source candidates that exactly fit
// the physical 8+5 word boundary, under both additive signs.
const typedShellHits = [];
let typedShellCases = 0;
for (const sign of [1, -1]) {
  for (const left of signedWords.filter(row => row.values.length === 8)) {
    for (const right of signedWords.filter(row => row.values.length === 5)) {
      typedShellCases += 1;
      const keyLeft = p0Words[0].map((value, index) =>
        mod29(sign === 1 ? value - left.values[index] : left.values[index] - value)
      );
      const keyRight = p0Words[1].map((value, index) =>
        mod29(sign === 1 ? value - right.values[index] : right.values[index] - value)
      );
      const keyShell = H(gp0(keyLeft), gp0(keyRight));
      const candidateShell = H(gp0(left.values), gp0(right.values));
      if (
        keyShell[0] === 19 &&
        keyShell[1] === 18 &&
        candidateShell[0] === 21 &&
        candidateShell[1] === 18
      ) {
        typedShellHits.push({
          sign: sign === 1 ? "C-P" : "P-C",
          phrase: left.text + " " + right.text,
          keyShell,
          candidateShell,
        });
      }
    }
  }
}
assert.equal(typedShellCases, 16);
assert.deepEqual(typedShellHits, [
  {
    sign: "C-P",
    phrase: "EPIPHANY SEEKS",
    keyShell: [19, 18],
    candidateShell: [21, 18],
  },
]);

// Direct-Latin comparison to the older conditional red-title candidate.
const oldLiteral = ["S","E","C","U","E","N","D","I","R","A","T","I","O"]
  .map(token => corpus.translit.indexOf(token));
const oldResidual = cipher.map((value, index) => mod29(value - oldLiteral[index]));
assert.equal(gp0(oldResidual), 112);
assert.equal(gpPrime(oldResidual), 384);

console.log(JSON.stringify({
  candidate: "EPIPHANY SEEKS",
  residual,
  plainWordSums,
  residualWordSums,
  wholeTitle: {
    plainGp0: gp0(plain),
    residualGp0: gp0(residual),
    residualPrime: gpPrime(residual),
    p0p2RuneCount,
  },
  p28Balance: 28,
  shells: {
    residualShell,
    plainShell,
    source18to21: signedWords.slice(18, 22).map(row => row.text),
  },
  controls: {
    length13SignCases,
    prime729Hits,
    selfSumHits,
    dualGeometryHits,
    typedShellCases,
    typedShellHits,
  },
  oldDirectLatin: {
    candidate: "SECUENDI RATIO",
    residualGp0: gp0(oldResidual),
    residualPrime: gpPrime(oldResidual),
  },
}, null, 2));
