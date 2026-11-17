"use strict";

/**
 * Original-source p0–2 prime-sum 23-cycle → 74 inner rune key,
 * one-time 74-step successor decoder on original p55.
 * SFT: node sims/lp2_23cycle_74interiors_74successors_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parsed = parseLP2Words(text, 3);
assert.equal(parsed.runeCount, 729);
assert.equal(parsed.words.length, 158);
/** @param {{runes:string}} word */
const gpSum = word => [...word.runes].reduce((sum, r) => sum + corpus.prime[runeIndex.get(r)], 0);
const headingSums = parsed.words.slice(0, 2).map(gpSum);
const body = parsed.words.slice(2);
const sums = body.map(gpSum);
assert.deepEqual(headingSums, [347, 315]);
assert.equal(sums.length, 156);
const pointers = sums.map(sum => sum % 156);

/** @param {number} start */
function orbit(start) {
  const seen = new Map();
  const visits = [];
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, visits.length);
    visits.push(at);
    at = pointers[at];
  }
  return { lead: visits.slice(0, seen.get(at)), cycle: visits.slice(seen.get(at)) };
}
const first = orbit(headingSums[0] % 156);
const second = orbit(headingSums[1] % 156);
assert.deepEqual(first.lead.map(i => i + 1), [36, 56, 113]);
assert.equal(first.cycle.length, 23);
assert.equal(second.lead.length, 0);
const secondShift = first.cycle.indexOf(second.cycle[0]);
assert.equal(secondShift, 6);
const primeSums = first.cycle.map(i => sums[i]);
assert.deepEqual(primeSums,
  [220,111,34,336,119,3,563,170,67,209,463,108,244,569,128,237,323,618,277,419,139,143,473]);

// The solved p57 Parable explicitly says to shed "circumferences" and seek
// what is within. This motivates a fixed first/last-rune deletion for each
// of the 23 cycle words, including deletion of the sole length-one word.
const interiorWords = first.cycle.map(i => [...body[i].runes].slice(1, -1)
  .map(r => runeIndex.get(r)));
const canonicalKey = interiorWords.flat();
assert.equal(canonicalKey.length, 74);
assert.deepEqual(interiorWords.map(w => w.length),
  [2,0,0,6,3,0,9,1,1,1,7,0,3,8,0,5,4,9,1,5,1,1,7]);

const cipher = corpus.pages.find(p => p.page === 55).indices;
assert.equal(cipher.length, 76);
const doubles = cipher.slice(1).filter((c, i) => c === cipher[i]).length;
assert.equal(doubles, 1);
assert.equal(cipher.length - 1 - doubles, canonicalKey.length);

/**
 * @param {number} previous
 * @param {number} successor
 * @param {"cyclic"|"numeric"} convention
 */
function rank28(previous, successor, convention) {
  assert.notEqual(successor, previous);
  return convention === "cyclic"
    ? ((successor - previous + 29) % 29) - 1
    : successor > previous ? successor - 1 : successor;
}
/**
 * @param {number} previous
 * @param {number} rank
 * @param {"cyclic"|"numeric"} convention
 */
function unrank28(previous, rank, convention) {
  return convention === "cyclic" ? (previous + rank + 1) % 29
    : rank >= previous ? rank + 1 : rank;
}
/**
 * @param {number[]} input Complete ciphertext including public IV.
 * @param {number[]} key
 * @param {"cyclic"|"numeric"} convention
 * @param {-1|1} sign
 */
function decrypt(input, key, convention, sign) {
  const p = [];
  let consumed = 0;
  for (let i = 1; i < input.length; i++) {
    if (input[i] === input[i - 1]) {
      p.push(28);  // Reserved EA repeat, no key consumption.
    } else {
      assert.ok(consumed < key.length);
      p.push((rank28(input[i - 1], input[i], convention)
        + sign * key[consumed++] + 28) % 28);
    }
  }
  return { plain: p, consumed };
}
/**
 * @param {number[]} plaintext GP29 with EA reserved for a repeat.
 * @param {number} iv Initial ciphertext rune.
 * @param {number[]} key
 * @param {"cyclic"|"numeric"} convention
 * @param {-1|1} sign
 */
function encrypt(plaintext, iv, key, convention, sign) {
  const out = [iv];
  let used = 0;
  for (const p of plaintext) {
    const previous = out[out.length - 1];
    if (p === 28) out.push(previous);
    else {
      assert.ok(used < key.length);
      const step = ((p - sign * key[used++]) % 28 + 28) % 28;
      out.push(unrank28(previous, step, convention));
    }
  }
  return { cipher: out, consumed: used };
}
/** @param {number[]} items */
function ioc(items) {
  const frequencies = new Array(29).fill(0);
  for (const v of items) frequencies[v]++;
  return frequencies.reduce((n, v) => n + v * (v - 1), 0)
    / (items.length * (items.length - 1));
}
const native = corpus.pages.find(p => p.page === 57).indices.slice(0, 75);
assert.equal(native.length, 75);
const planted = native.slice();
planted[30] = 28; // One explicit authentic GP EA control at a frozen position.
assert.equal(planted.filter(x => x === 28).length, 1);
const outcomes = [];
for (const [heading, shift] of [["first", 0], ["second", secondShift]]) {
  const wordKey = interiorWords.slice(shift).concat(interiorWords.slice(0, shift)).flat();
  assert.equal(wordKey.length, 74);
  for (const projection of ["ordinal", "prime", "totient"]) {
    const key = wordKey.map(index => {
      if (projection === "ordinal") return index % 28;
      if (projection === "prime") return corpus.prime[index] % 28;
      return (corpus.prime[index] - 1) % 28;
    });
    for (const convention of ["cyclic", "numeric"]) {
      for (const sign of /** @type {const} */ ([-1, 1])) {
        const decoded = decrypt(cipher, key, convention, sign);
        assert.equal(decoded.consumed, 74);
        assert.deepEqual(encrypt(decoded.plain, cipher[0], key, convention, sign).cipher, cipher);
        const nativeCipher = encrypt(planted, cipher[0], key, convention, sign);
        assert.equal(nativeCipher.consumed, 74);
        assert.deepEqual(decrypt(nativeCipher.cipher, key, convention, sign).plain, planted);
        outcomes.push({
          heading, projection, convention, sign, keySymbolsConsumed: decoded.consumed,
          firstRuneIsPublicIV: true, plaintextSymbols: decoded.plain.length,
          ioc: ioc(decoded.plain),
          tokens: decoded.plain.map(index => corpus.translit[index]).join(" "),
          sourceMatchedPlant: true,
        });
      }
    }
  }
}
assert.equal(outcomes.length, 24);
const best = outcomes.slice().sort((a, b) => b.ioc - a.ioc)[0];
assert.equal(best.heading, "second");
assert.equal(best.projection, "ordinal");
assert.equal(best.convention, "numeric");
assert.equal(best.sign, 1);
assert.equal(best.ioc, 0.03963963963963964);
console.log(JSON.stringify({
  original: { p0to2Runes: 729, sourceWords: 158, headingPrimeSums,
    cycleLength: 23, cycleWordPrimeSums: primeSums,
    interiorSourceKeyRunes: canonicalKey.length,
    p55TotalRunes: cipher.length, p55RepeatSteps: doubles,
    p55KeyedNonrepeatSteps: cipher.length - 1 - doubles },
  tested: 24,
  best,
  controls: { p57Native75IoC: ioc(native), injectedEAatSymbolIndex: 30 },
  claims: "The exact 74-to-74 length match is a source-shape alignment, not a cipher solution. None of 24 source-fixed inverse outputs is readable GP prose.",
}, null, 2));
