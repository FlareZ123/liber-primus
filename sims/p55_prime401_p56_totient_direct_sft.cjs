"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Direct test of authentic solved-p56 prime-totient cipher with page55's
 * independently source-fixed 401 = 79th prime as a key schedule start.
 * No source-fixed choice licenses additional offsets or phases.
 */
function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
  const page = corpus.pages.find((entry) => entry.page === 55).indices;
  assert.equal(page.length, 76);
  const fPositions = page.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0);
  assert.deepEqual(fPositions, [15, 25, 41]);

  /** @type {number[]} */
  const primes = [];
  for (let p = 2; primes.length < 160; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) if (p % d === 0) { prime = false; break; }
    if (prime) primes.push(p);
  }
  assert.equal(primes[78], 401);
  const mod = (x) => ((x % 29) + 29) % 29;
  /** @param {number[]} values */
  function ioc(values) {
    const counts = Array(29).fill(0);
    values.forEach((v) => counts[v]++);
    return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
  }
  const readings = [];
  for (let fMask = 0; fMask < 8; fMask++) {
    let primeIndex = 78;
    const candidates = page.map((v, at) => {
      const fPos = fPositions.indexOf(at);
      if (fPos >= 0 && (fMask & (1 << fPos))) return 0;
      return mod(v - (primes[primeIndex++] - 1));
    });
    primeIndex = 78;
    const reencoded = candidates.map((v, at) => {
      const fPos = fPositions.indexOf(at);
      if (fPos >= 0 && (fMask & (1 << fPos))) return 0;
      return mod(v + (primes[primeIndex++] - 1));
    });
    assert.deepEqual(reencoded, page);
    const score = ioc(candidates);
    readings.push({literalFMask:fMask,
      skippedOriginalOffsets:fPositions.filter((_, i) => (fMask >> i) & 1),
      indexOfCoincidence:score,
      first16GP: candidates.slice(0,16).map((v) => corpus.translit[v]).join(" "),
      last16GP:candidates.slice(-16).map((v) => corpus.translit[v]).join(" ")});
  }
  assert.equal(readings.length, 8);
  assert.ok(readings.every((x) => x.indexOfCoincidence < 0.04));
  assert.equal(readings[0].indexOfCoincidence, 0.03894736842105263);

  // A planted original-length message is recovered under exactly this schedule.
  const known = Array.from({length:76}, (_, i) => (i * 7 + 3) % 29);
  let k = 78;
  const planted = known.map((v) => mod(v + primes[k++] - 1));
  k = 78;
  assert.deepEqual(planted.map((v) => mod(v - (primes[k++] - 1))), known);

  console.log(JSON.stringify({
    source:"p55 strictly centered five GP prime weights: 79+73+53+89+107=401, prime ordinal 79",
    mechanism:"original p56 prime-minus-one forward schedule with only its demonstrated optional literal-F behavior",
    page55OriginalRunes:page.length, zeroBasedFirstPrimeIndex:78,
    candidatePrime:primes[78], sourceFPositions:fPositions,
    readings, result:"No original p55 plaintext under any of the eight fixed F-mask variants"
  }, null, 2));
}
if (require.main === module) main();
module.exports = {main};
