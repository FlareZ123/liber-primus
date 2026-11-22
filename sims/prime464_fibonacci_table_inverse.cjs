"use strict";

/**
 * The historical 2013 prime_echo script prints the 464 primes through 3301.
 * 464 = 16 * 29: use the sixteen page-15 Fibonacci-square cells as one axis
 * and the 29 GP rune states as the other axis of a reversible prime tableau.
 *
 * Test original physical pages 16..31; freeze each configuration and report
 * its independent continuation on physical pages 40..55 (page 50 has no runes).
 * The table itself and the source-language prior never depend on LP2 ciphertext.
 *
 * Source-only SFT: node sims/prime464_fibonacci_table_inverse.cjs
 *
 * Classification: exploratory source-derived finite-family negative.
 * No unsolved LP2 plaintext, key or historical algorithm has been recovered.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const english = fs.readFileSync(path.join(ROOT,
  "resources/control/shakespeare_first300k.txt"), "utf8");
const GP = ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I",
  "J", "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE",
  "D", "A", "AE", "Y", "IA", "EA"];
const symbol = new Map(GP.map((name, i) => [name, i]));
const mod = (x, n) => ((x % n) + n) % n;
const pages = corpus.pages.filter((p) =>
  p.status === "unsolved" && p.indices.length > 0);
const trainPages = pages.filter((p) => p.page >= 16 && p.page <= 31);
const holdPages = pages.filter((p) => p.page >= 40 && p.page <= 55);

/** @param {string} input English reference spelling. @returns {number[]} */
function encode(input) {
  const out = [];
  for (let word of input.match(/[A-Za-z]+/g) || []) {
    word = word.toUpperCase().replace(/QU/g, "CW")
      .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const digraph = symbol.get(word.slice(i, i + 2));
      if (digraph !== undefined) {
        out.push(digraph);
        i += 2;
      } else {
        const single = symbol.get(word[i]);
        if (single !== undefined) out.push(single);
        i++;
      }
    }
  }
  return out;
}

/** The complete ordered list from the 2013 script through p_464 = 3301. */
function first464Primes() {
  const result = [];
  for (let n = 2; result.length < 464; n++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(n);
  }
  assert.equal(result.at(-1), 3301);
  return result;
}

const primes = first464Primes();
const spiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
const printed = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const rows = [Array.from({length: 16}, (_, i) => i),
  printed.map((value) => spiral.indexOf(value))];
assert.ok(rows[1].every((x) => x >= 0));
assert.equal(new Set(rows[1]).size, 16);

// GP's 29-element field admits the source-red quotient 15 as a primitive
// root; exp and discrete logarithm provide an exact 28-way nonzero-step codec.
const powers = [];
const logs = new Int16Array(29).fill(-1);
for (let i = 0, v = 1; i < 28; i++, v = mod(v * 15, 29)) {
  powers.push(v);
  logs[v] = i;
}
assert.equal(new Set(powers).size, 28);

/**
 * @typedef {{
 * layer:"direct"|"field28"|"sorted28"|"cyclic28",
 * order:number, axis:number, selector:"prime"|"totient",
 * sign:number, prev:"cipher"|"plain", phase:number
 * }} Configuration
 */

/**
 * @param {Configuration} s
 * @param {number} previousCipher
 * @param {number} previousPlain
 * @param {{page:number}} page
 */
function key(s, previousCipher, previousPlain, page) {
  const previous = s.prev === "cipher" ? previousCipher : previousPlain;
  const base = page.page >= 40 ? 40 : 16;
  const row = rows[s.order][mod(page.page - base + s.phase, 16)];
  const index = s.axis === 0 ? row * 29 + previous : previous * 16 + row;
  const selected = primes[index] - (s.selector === "totient" ? 1 : 0);
  return mod(selected, s.layer === "direct" ? 29 : 28);
}

/**
 * @param {number[]} cipher
 * @param {{page:number}} page
 * @param {Configuration} s
 * @returns {number[]}
 */
function decrypt(cipher, page, s) {
  const plain = [];
  let previousCipher = 0, previousPlain = 0;
  for (let i = 0; i < cipher.length; i++) {
    const current = cipher[i];
    const k = key(s, previousCipher, previousPlain, page);
    let p;
    if (s.layer === "direct") {
      p = mod(current + s.sign * k, 29);
    } else if (i === 0) {
      p = current; // visible page-initial state
    } else if (current === previousCipher) {
      p = 28; // GP EA, conditional zero-difference marker
    } else {
      let rank;
      if (s.layer === "field28") {
        rank = logs[mod(current - previousCipher, 29)];
        assert.ok(rank >= 0);
      } else if (s.layer === "cyclic28") {
        rank = mod(current - previousCipher - 1, 29);
      } else {
        rank = current < previousCipher ? current : current - 1;
      }
      p = mod(rank + s.sign * k, 28);
    }
    plain.push(p);
    previousCipher = current;
    previousPlain = p;
  }
  return plain;
}

/**
 * Exact mathematical forward emitter for the candidate family. The plaintext
 * contains a literal initial rune for all three 28-step alternatives.
 * @param {number[]} plain
 * @param {{page:number}} page
 * @param {Configuration} s
 * @returns {number[]}
 */
function encrypt(plain, page, s) {
  const cipher = [];
  let previousCipher = 0, previousPlain = 0;
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i];
    const k = key(s, previousCipher, previousPlain, page);
    let current;
    if (s.layer === "direct") {
      current = mod(p - s.sign * k, 29);
    } else if (i === 0) {
      current = p;
    } else if (p === 28) {
      current = previousCipher;
    } else {
      const rank = mod(p - s.sign * k, 28);
      if (s.layer === "field28") {
        current = mod(previousCipher + powers[rank], 29);
      } else if (s.layer === "cyclic28") {
        current = mod(previousCipher + rank + 1, 29);
      } else {
        current = rank < previousCipher ? rank : rank + 1;
      }
    }
    cipher.push(current);
    previousCipher = current;
    previousPlain = p;
  }
  return cipher;
}

/** @param {number[]} text @returns {number[]} */
function logPrior(text) {
  const counts = Array(29).fill(1);
  for (const x of text) counts[x]++;
  const total = counts.reduce((sum, x) => sum + x, 0);
  return counts.map((x) => Math.log(x / total));
}

/**
 * @param {Array<{page:number,indices:number[]}>} selected
 * @param {Configuration} s
 * @param {number[]} logQ
 */
function score(selected, s, logQ) {
  let sum = 0, count = 0;
  for (const page of selected) {
    for (const rune of decrypt(page.indices, page, s)) {
      sum += logQ[rune];
      count++;
    }
  }
  return sum / count;
}

/** @returns {Configuration[]} */
function configurations() {
  const out = [];
  for (const layer of ["direct", "field28", "sorted28", "cyclic28"])
    for (let order = 0; order < 2; order++)
      for (let axis = 0; axis < 2; axis++)
        for (const selector of ["prime", "totient"])
          for (const sign of [-1, 1])
            for (const prev of ["cipher", "plain"])
              for (let phase = 0; phase < 16; phase++)
                out.push({layer, order, axis, selector, sign, prev, phase});
  assert.equal(out.length, 2048);
  return out;
}

/** @returns {object} */
function run() {
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
  const sum = (list) => list.reduce((s, p) => s + p.indices.length, 0);
  assert.equal(trainPages.length, 16);
  assert.equal(sum(trainPages), 4077);
  assert.equal(holdPages.length, 15); // p50 is numeric only
  assert.equal(sum(holdPages), 3316);

  const priorText = encode(english.slice(0, 240000));
  assert.equal(priorText.length, 174998);
  const logQ = logPrior(priorText);
  const modes = configurations();
  const results = modes.map((config) => ({
    ...config,
    train: score(trainPages, config, logQ),
    heldout: score(holdPages, config, logQ)
  }));
  const original = ["direct", "field28", "sorted28", "cyclic28"]
    .map((layer) => {
      const subset = results.filter((v) => v.layer === layer);
      const topTrain = subset.reduce((a, b) => b.train > a.train ? b : a);
      const topHold = subset.reduce((a, b) => b.heldout > a.heldout ? b : a);
      return {layer, topTrain, topHold};
    });

  // A blinded heldout-English GP source encrypted using ONE of the exact
  // candidate table configurations; the selector must recover that model.
  const heldEnglish = encode(english.slice(240000));
  const selected = {layer: "field28", order: 1, axis: 0,
    selector: "prime", sign: -1, prev: "cipher", phase: 0};
  let offset = 0;
  const plantPages = [...trainPages, ...holdPages].map((page) => {
    const plain = heldEnglish.slice(offset, offset + page.indices.length);
    assert.equal(plain.length, page.indices.length);
    offset += plain.length;
    const cipher = encrypt(plain, page, selected);
    assert.deepEqual(decrypt(cipher, page, selected), plain);
    return {...page, indices: cipher};
  });
  assert.equal(offset, 7393);

  const plantScores = modes.map((config) => ({
    config,
    value: score(plantPages.slice(0, trainPages.length), config, logQ)
  })).sort((a, b) => b.value - a.value);
  assert.deepEqual(plantScores[0].config, selected);
  const plantedHeldout = score(plantPages.slice(trainPages.length),
    selected, logQ);

  return {
    sourceIdentity: "p_464 = 3301; 464 = 16 * 29",
    zeroBasedSourceSpan: "the exact first 464 ordinary primes",
    sourcePageClue: "physical LP2 page15 printed sixteen-cell Fibonacci prime square",
    sourceWindow: {trainPhysicalPages: "16..31", trainRunes: 4077,
      holdPhysicalPages: "40..55 (p50 empty)", holdRunes: 3316},
    clock: "each physical page uses its offset in the sixteen-page group",
    primitiveRoot: 15,
    variants: modes.length,
    independentEnglishGP: priorText.length,
    independentEnglishMeanLogLikelihood: priorText.reduce((s, i) =>
      s + logQ[i], 0) / priorText.length,
    original,
    positive: {mode: selected, rankInFullFamily: 1,
      runeRecovery: offset, plantedHeldout}
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {encode, first464Primes, encrypt, decrypt, score, configurations, run};
