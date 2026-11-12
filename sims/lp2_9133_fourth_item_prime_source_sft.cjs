"use strict";

/**
 * A frozen source-led transfer: historically real stage06 9133 as the
 * initial prime for the demonstrated solved-p56 phi(prime) cipher,
 * on the original LP2 fourth numbered item at global rune index 9133.
 * No key/offset/phase fitting; two arithmetic signs and literal F-clock.
 *
 * Node.js 22, CommonJS, no external packages. Run from repository root:
 * node sims/lp2_9133_fourth_item_prime_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const C = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const target = C.slice(9133, 9229);
const GP = corpus.translit;
const mod = n => (n % 29 + 29) % 29;
const translit = a => a.map(v => GP[v]).join("");
const ioc = a => {
  const h = Array(29).fill(0);
  for (const c of a) h[c]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const isPrime = n => {
  if (n < 2) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
};
/** @param {number} initial @param {number} count */
function primes(initial, count) {
  const out = [];
  for (let p = initial; out.length < count; p++) if (isPrime(p)) out.push(p);
  return out;
}
/** @param {number[]} input @param {number[]} p @param {-1|1} sign @param {boolean} skipF */
function op(input, p, sign, skipF = false) {
  let counter = 0;
  return input.map(c => {
    if (skipF && c === 0) return c;
    return mod(c + sign * (p[counter++] - 1));
  });
}
assert.equal(target.length, 96);
assert.equal(C.length, 12956);
assert.deepEqual(target.map((v, i) => v === 0 ? i : -1).filter(x => x >= 0), [50]);
const fourth = corpus.pages.find(p => p.page === 37);
assert.deepEqual(target.slice(0, 39), fourth.indices.slice(189, 228));
assert.equal(target.length, fourth.indices.length - 189 + 57);
assert.equal(primes(9133, 1)[0], 9133);
const p = primes(9133, 97);

// The known p56 authentic cipher uses phi(prime) and F as interruption.
const page56 = corpus.pages.find(page => page.page === 56).indices;
const p56 = primes(2, 100);
let p56Counter = 0;
const solved = page56.map((c, i) => i === 56
  ? 0 : mod(c - (p56[p56Counter++] - 1)));
assert.equal(translit(solved),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
assert.equal(p56Counter, 84);
assert(Math.abs(ioc(solved) - 0.0700280112044818) < 1e-12);

// Plant the exact tested operator into source-native p57 plaintext, then invert.
const sourceNative = corpus.pages.find(page => page.page === 57).indices;
assert.equal(sourceNative.length, 95);
const positivePlain = Array.from({length: 96}, (_, i) =>
  sourceNative[i % sourceNative.length]);
const wrongPrimes = primes(9137, 97);
const results = [];
for (const skipF of [false, true]) {
  for (const sign of [-1, 1]) {
    const candidate = op(target, p, sign, skipF);
    // F positions in the original are kept as output F by the skip model.
    const recovered = !skipF
      ? op(candidate, p, -sign, skipF)
      : (() => {
        let j = 0;
        return candidate.map((c, i) => target[i] === 0
          ? c : mod(c - sign * (p[j++] - 1)));
      })();
    assert.deepEqual(recovered, target);
    const planted = op(positivePlain, p, -sign, skipF);
    // p56 demonstrates that an F skip mask is selective, not determined by
    // every F-valued ciphertext symbol. Preserve the exact planted mask.
    function decodePlant(primesToUse) {
      let keyPos = 0;
      return planted.map((c, i) =>
        skipF && positivePlain[i] === 0 ? 0
          : mod(c + sign * (primesToUse[keyPos++] - 1)));
    }
    const positiveRecovered = decodePlant(p);
    assert.deepEqual(positiveRecovered, positivePlain);
    const wrong = decodePlant(wrongPrimes);
    assert(wrong.some((v, i) => v !== positivePlain[i]));
    results.push({
      sign, skipF, consumedPrimes: skipF ? 95 : 96,
      ioc: Number(ioc(candidate).toFixed(9)),
      exactOriginalRoundTrip: true, exactNativePlant: true,
      wrongPrimeFailsPlant: true, translit: translit(candidate)
    });
  }
}
assert(results.every(result => result.ioc < 0.04));

// The Stage06 fourth JPEG was byte-reversed in the historical carrier.
// Test a single exact analogue on the fourth LP2 numbered rune item:
// full-item reversal before the same fixed prime transform. This is a
// separate reversible control, not a source-authenticated manuscript cipher.
const reversedTarget = target.slice().reverse();
const reversedVariants = [];
for (const skipF of [false, true]) {
  for (const sign of [-1, 1]) {
    const decoded = op(reversedTarget, p, sign, skipF);
    let counter = 0;
    const restored = decoded.map((v, i) =>
      skipF && reversedTarget[i] === 0 ? 0
        : mod(v - sign * (p[counter++] - 1)));
    assert.deepEqual(restored, reversedTarget);
    assert.deepEqual(restored.slice().reverse(), target);
    reversedVariants.push({sign, skipF,
      ioc: Number(ioc(decoded).toFixed(9)),
      translit: translit(decoded), exactRoundTrip: true});
  }
}
assert(reversedVariants.every(result => result.ioc < 0.04));

console.log(JSON.stringify({
  decision: "9133 is an unsupported cross-stage pointer hypothesis; direct solved-p56 phi(prime) transfer to original item4 gives no GP prose",
  source: "stage06 9133 tail, original 4th red item begins global zero-based GP rune 9133",
  originalTargetRunes: 96, globalZeroBasedStart: 9133,
  sourceSolvedP56Positive: translit(solved).slice(0, 21),
  results, reversedVariants,
  unknownPlaintextRecovered: false
}, null, 2));
