"use strict";

/**
 * Test original p8 XIXM (= Roman 19 followed by GP0 M=19) as a
 * one-based prime ordinal under the independently solved p56
 * prime-totient and transparent-F cipher. Read-only Node.js 22 SFT.
 * Input: resources/liber-primus/lp2-corpus.json and ink annotations.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));
const symbols = corpus.translit;
const primes = [];
for (let n = 2; primes.length < 350; n++) {
  let yes = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { yes = false; break; }
  if (yes) primes.push(n);
}

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} p @returns {number[]} */
function page(p) {
  const hit = corpus.pages.find(x => x.page === p);
  assert.ok(hit);
  return hit.indices;
}

/**
 * Exact p56 backward rule: plaintext F=0 passes as cipher F=0 with
 * no prime consumed, or any nonzero plaintext is enciphered with
 * +phi(prime_k) and advances the clock.
 * @param {readonly number[]} input
 * @param {number} firstOrdinal
 * @param {number} sign
 * @returns {{failure:number|null,paths:number,states:number,sample:string|null}}
 */
function inverse(input, firstOrdinal, sign) {
  let states = new Map([[0, {paths: 1, text: ""}]]);
  for (let offset = 0; offset < input.length; offset++) {
    const c = input[offset];
    const next = new Map();
    /** @param {number} k @param {number} p @param {{paths:number,text:string}} old */
    const record = (k, p, old) => {
      const existing = next.get(k);
      if (existing) existing.paths += old.paths;
      else next.set(k, {paths: old.paths, text: old.text + symbols[p]});
    };
    for (const [clock, prior] of states) {
      if (c === 0) record(clock, 0, prior);
      const p = mod(c - sign * (primes[firstOrdinal - 1 + clock] - 1));
      if (p !== 0) record(clock + 1, p, prior);
    }
    if (next.size === 0) {
      return {failure: offset, paths: 0, states: 0, sample: null};
    }
    states = next;
  }
  return {
    failure: null,
    paths: [...states.values()].reduce((a, x) => a + x.paths, 0),
    states: states.size,
    sample: [...states.values()][0].text.slice(0, 80)
  };
}

/** @param {string} source @returns {number[]} */
function native(source) {
  const tokens = symbols.map((word, value) => ({word, value}))
    .sort((a, b) => b.word.length - a.word.length);
  const result = [];
  for (const word of source.split(" ")) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(x => word.startsWith(x.word, i));
      assert.ok(match, "No original GP token in " + word);
      result.push(match.value);
      i += match.word.length;
    }
  }
  return result;
}

// Source-printed title and two explicit first-prime interpretations.
const red = ink.pages.find(x => x.page === 8).red_spans;
assert.equal(red.length, 1);
assert.deepEqual([red[0].start, red[0].length], [0, 12]);
assert.deepEqual(page(8).slice(0, 4), [14, 10, 14, 19]);
assert.equal(page(8).slice(0, 4).map(x => symbols[x]).join(""), "XIXM");
assert.equal(page(8).slice(0, 12).map(x => corpus.runes[x]).join(""), red[0].runes);
assert.equal(page(8).length, 255);
assert.equal(page(8).slice(12).length, 243);
assert.equal(page(9).length, 268);
assert.equal(page(27).slice(19).length, 215);
assert.equal(primes[18], 67);
assert.equal(primes[19], 71);
assert.equal(corpus.prime[19], 71);

// Exact known genuine solved p56 plaintext encryption control.
const clear = native("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(clear.length, 85);
let consumed = 0;
const recoveredCipher = clear.map(p => {
  if (p === 0) return 0;
  return mod(p + primes[consumed++] - 1);
});
assert.deepEqual(recoveredCipher, page(56));
assert.equal(consumed, 84);
const solved = inverse(page(56), 1, 1);
assert.equal(solved.failure, null);
assert.ok(solved.paths > 0);

// Entire next pages, two source-derived starts, both cryptographic signs.
const outcomes = [];
for (const [receiver, original] of [
  ["p8-black243", page(8).slice(12)],
  ["p9-all268", page(9)],
  ["p27-black215", page(27).slice(19)]
]) for (const firstOrdinal of [19, 20]) for (const sign of [-1, 1]) {
  const result = inverse(original, firstOrdinal, sign);
  if (receiver === "p8-black243" || receiver === "p9-all268") {
    assert.equal(result.paths, 0, receiver + ", ordinal " + firstOrdinal + ", sign " + sign);
  }
  outcomes.push({receiver, firstOrdinal, firstPrime: primes[firstOrdinal - 1], sign, ...result});
}
assert.deepEqual(outcomes.filter(x => x.receiver === "p8-black243")
  .map(x => x.failure), [33, 66, 11, 70]);
assert.deepEqual(outcomes.filter(x => x.receiver === "p9-all268")
  .map(x => x.failure), [99, 21, 161, 119]);
console.log(JSON.stringify({
  hypothesis: "Original p8 XIXM Roman19 / GP M19 → literal solved p56 prime-index cipher",
  p56Positive: {cipherRunes: 85, keySteps: consumed, paths: solved.paths},
  outcomes
}, null, 2));
console.log("PASS: exact p56 control and original p8/p9 strict F extinction");
