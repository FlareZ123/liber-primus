"use strict";

/**
 * Original 2012 Cicada book-code texts as directly transferred running keys.
 * No page-specific private key or fitted phase. Both texts are separately
 * pinned historical sources; neither is copied into this research repository.
 *
 * Node.js 22:
 * node sims/lp2_2012_books_runningkey_sft.cjs path\to\agrippa.txt path\to\31447.txt
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function pinnedBlob(file, expected) {
  const buf = fs.readFileSync(file);
  const actual = crypto.createHash("sha1").update(Buffer.concat([
    Buffer.from("blob " + buf.length + "\0"), buf,
  ])).digest("hex");
  assert.equal(actual, expected, "Historical source text or version changed");
  return buf.toString("utf8");
}

assert(process.argv[2] && process.argv[3],
  "Pass original archived 2012 Agrippa agrippa.txt and Britannica 31447.txt");
const agrippaLines = pinnedBlob(process.argv[2],
  "673ba225d1277945f2d2e5056bf025db8e89bb92").split(/\r?\n/u);
assert.equal(agrippaLines[0], "AGRIPPA");
assert.equal(agrippaLines[5], "I hesitated");
const agrippaText = agrippaLines.slice(5).join("\n");
const britannicaLines = pinnedBlob(process.argv[3],
  "8cba4356812ff852e3fe9c88e80ab1e9b5b8670c").split(/\r?\n/u);
const cicadaIndex = britannicaLines.findIndex(
  x => /^\s*CICADA \(_Cicadidae_\)/u.test(x));
assert.equal(cicadaIndex, 15388);
const britannicaText = britannicaLines.slice(cicadaIndex).join("\n");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);

const chapters = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapters.reduce((a, n) => a + n, 0), ciphertext.length);
const mapping = new Map(corpus.translit.map((value, index) => [value, index]));
mapping.set("ING", 21); mapping.set("IO", 27);
const oldDigraphs = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const sourceDigraphs = ["ING", "TH", "NG", "EO", "OE", "AE", "IO", "EA"];

/**
 * Reversibly interpret historical Latin text as a GP29 plaintext/key stream.
 * K→C, Q→CW, V→U, Z→S follow existing source-native GP normalization.
 * @param {string} text
 * @param {boolean} sourceWriterSpelling
 * @returns {number[]}
 */
function tokenize(text, sourceWriterSpelling) {
  const joined = (text.toUpperCase().match(/[A-Z]+/gu) || []).join("");
  const letters = joined.replaceAll("K", "C").replaceAll("V", "U")
    .replaceAll("Q", "CW").replaceAll("Z", "S");
  const digraphs = sourceWriterSpelling ? sourceDigraphs : oldDigraphs;
  const output = [];
  for (let i = 0; i < letters.length;) {
    const token = digraphs.find(t => letters.startsWith(t, i)) || letters[i];
    const index = mapping.get(token);
    assert.notEqual(index, undefined, "Unmapped GP glyph");
    output.push(index);
    i += token.length;
  }
  return output;
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const freq = new Uint32Array(29);
  for (const n of x) freq[n]++;
  return [...freq].reduce((a, n) => a + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign +1 or -1
 * @param {boolean} reset At original nine visible chapters
 * @param {boolean} forward encode P to C, else decode C to P
 */
function transform(input, key, sign, reset, forward) {
  const output = [];
  const sections = reset ? chapters : [input.length];
  let pos = 0, tick = 0;
  for (const length of sections) {
    if (reset) tick = 0;
    for (let i = 0; i < length; i++) {
      const delta = sign * key[tick++ % key.length] * (forward ? -1 : 1);
      output.push((input[pos++] + delta % 29 + 29) % 29);
    }
  }
  assert.equal(pos, input.length);
  return output;
}


/**
 * Exact nondeterministic inverse of Cicada's authentic plaintext-F bypass.
 * The full key clock is unknown to the decoder because C=F can be either a
 * literal transparent F (no tick) or a normal enciphered non-F (one tick).
 * No language score, guessed skip mask or beam pruning is used.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign +1 or -1 is the encryption key sign.
 * @returns {{firstFailure: number, maxStates: number, survivors: Set<number>}}
 */
function reachableF(cipher, key, sign) {
  let states = new Set([0]), maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i], next = new Set();
    for (const t of states) {
      const shift = ((sign * key[t % key.length]) % 29 + 29) % 29;
      if (c === 0) {
        next.add(t); // literal plaintext F, key clock does not advance
        if (shift !== 0) next.add(t + 1); // enciphered non-F
      } else if (c !== shift) {
        // Normal decryption P=C-shift; forbidden P=F cannot be encrypted.
        next.add(t + 1);
      }
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    if (states.size === 0) return {
      firstFailure: i, maxStates, survivors: states,
    };
  }
  return {firstFailure: -1, maxStates, survivors: states};
}

/**
 * Grounded positive-control encoder for exactly the original F-transparent rule.
 * @param {number[]} clear
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function encodeTransparentF(clear, key, sign) {
  let t = 0;
  return clear.map(p => p === 0 ? 0 :
    ((p + sign * key[t++ % key.length]) % 29 + 29) % 29);
}

function firstPrimes(n) {
  const primes = [];
  for (let p = 2; primes.length < n; p++) {
    if (primes.every(x => x * x > p || p % x !== 0)) primes.push(p);
  }
  return primes;
}
const knownP56 = corpus.pages.find(p => p.page === 56).indices;
assert.equal(knownP56.length, 85);
const authenticKey = firstPrimes(84).map(p => (p - 1) % 29);
const knownClear = [];
let historicalTick = 0;
for (let i = 0; i < knownP56.length; i++) {
  if (i === 56) {
    assert.equal(knownP56[i], 0);
    knownClear.push(0);
  } else {
    knownClear.push((knownP56[i] - authenticKey[historicalTick++] + 29) % 29);
  }
}
assert.equal(historicalTick, 84);
assert.equal(knownClear.map(i => corpus.translit[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
assert.deepEqual(encodeTransparentF(knownClear, authenticKey, 1), knownP56);
const authenticatedInverse = reachableF(knownP56, authenticKey, 1);
assert(authenticatedInverse.survivors.has(84),
  "Authentic original p56 plaintext-F path must remain reachable");

const outcomes = [];
for (const [name, sourceText] of [
  ["2012 Gibson Agrippa", agrippaText],
  ["2012 Britannica CICADA-to-EOF", britannicaText],
]) {
  for (const writing of ["legacy", "LP1-author"]) {
    const key = tokenize(sourceText, writing === "LP1-author");
    for (const reset of [false, true]) {
      for (const sign of [-1, 1]) {
        const P = transform(ciphertext, key, sign, reset, false);
        const C = transform(P, key, sign, reset, true);
        assert.deepEqual(C, ciphertext, "Original ciphertext round-trip failed");
        const plantedC = transform(solved, key, sign, false, true);
        const recovered = transform(plantedC, key, sign, false, false);
        assert.deepEqual(recovered, solved, "Authentic p57 plant failed");
        const exactF = reachableF(ciphertext, key, sign);
        assert(exactF.firstFailure >= 0 && exactF.survivors.size === 0,
          "An original full-book F-transparent source path unexpectedly survives");
        let foffset = 0;
        const independentChapterFFailures = chapters.map(n => {
          const result = reachableF(ciphertext.slice(foffset, foffset + n), key, sign);
          foffset += n;
          assert(result.firstFailure >= 0 && result.survivors.size === 0,
            "A separately reset F-transparent original chapter unexpectedly survived");
          return result.firstFailure;
        });
        const plantedTransparent = encodeTransparentF(solved, key, sign);
        const plantedReachability = reachableF(plantedTransparent, key, sign);
        assert(plantedReachability.survivors.has(solved.filter(x => x !== 0).length),
          "A planted real solved-p57 F-transparent key path was incorrectly rejected");
        const score = ioc(P);
        let offset = 0;
        const chapterScores = chapters.map(n => {
          const value = ioc(P.slice(offset, offset + n));
          offset += n;
          return value;
        });
        const maxChapterIoC = Math.max(...chapterScores);
        assert(score < 0.04 && maxChapterIoC < 0.04,
          "A source-book inverse unexpectedly resembles prose");
        outcomes.push({
          keySource: name,
          spelling: writing,
          keyRunes: key.length,
          clock: reset ? "nine printed chapter resets" : "uninterrupted p0 clock",
          direction: sign === -1 ? "subtract" : "add",
          completeInverseIoC: score,
          maxChapterIoC,
          originalTransparentFFirstContradiction: exactF.firstFailure,
          individualOriginalChapterTransparentFFirstContradictions: independentChapterFFailures,
          historicalTransparentFPositiveP56: true,
          plantedTransparentFPositiveP57: true,
          originalForwardPass: true,
          knownP57Plant95of95: true,
        });
      }
    }
  }
}
const best = outcomes.reduce((a, b) =>
  b.completeInverseIoC > a.completeInverseIoC ? b : a);
assert.equal(outcomes.length, 16);
assert(ioc(solved) > 0.06);
console.log(JSON.stringify({
  sourceScope: "Two authentic Cicada 2012 source books; full 12956 original runes",
  testedDirectInverseVariants: outcomes.length,
  transparentFOriginalP56Positive: true,
  transparentFOriginalEntireBookExclusions: 8,
  independentlyResetChapterFFailures: 8 * chapters.length,
  originalIoC: ioc(ciphertext),
  authenticSolvedP57IoC: ioc(solved),
  bestInverse: best,
  bestAnyChapterIoC: Math.max(...outcomes.map(o => o.maxChapterIoC)),
  all: outcomes,
  decision: "No directly transferred 2012 book-source additive GP29 running key; all authentic plaintext-F bypass paths die on original",
  limits: "Unchosen book offsets, rewritten source, F-transparent branch and further layers remain untested",
}, null, 2));
