"use strict";
/**
 * Source-frozen reachability gate for transferring the authenticated LP2 p56
 * consecutive-prime totient / transparent-plaintext-F cipher to unknown LP2.
 *
 * Candidate: C=(P+phi(prime_j)) mod 29.  Plaintext F=0 emits ciphertext F=0
 * without consuming a prime. An ordinary output identical to the previous
 * ciphertext may be rejected: consume the prime and retry the SAME plaintext
 * against the next prime. Such rejection is OPTIONAL; actual doublets exist.
 *
 * Exact dynamic programming over all reachable prime-clock states. No English
 * model, key fitting, chosen start or ciphertext-based parameter selection.
 * Run from repository root: node sims/lp2_p56_prime_collision_skip_reachability_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {number} count @returns {number[]} Consecutive prime totients modulo GP29. */
function primeTotients(count) {
  const key = [];
  for (let n = 2; key.length < count; n++) {
    let prime = true;
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) { prime = false; break; }
    }
    if (prime) key.push((n - 1) % MOD);
  }
  return key;
}
const KEY = primeTotients(2000);

/**
 * @typedef {{minE:number,maxE:number}} EBound
 * @param {number[]} cipher Canonical original GP29 indices.
 * @param {{bypass?:boolean, collisionSkip?:boolean}} [options]
 * @returns {{
 *   firstImpossibleRune:null|number, scanned:number, stateCount:number,
 *   clockIndices:number[], minE:null|number, maxE:null|number
 * }}
 */
function scan(cipher, options = {}) {
  const { bypass = true, collisionSkip = true } = options;
  /** @type {Map<number, EBound>} */
  let states = new Map([[0, { minE: 0, maxE: 0 }]]);
  for (let i = 0; i < cipher.length; i++) {
    /** @type {Map<number, EBound>} */
    const next = new Map();
    /** @param {number} clock @param {number} plain @param {EBound} prior */
    const insert = (clock, plain, prior) => {
      const extraE = Number(plain === 18);
      const low = prior.minE + extraE, high = prior.maxE + extraE;
      const old = next.get(clock);
      if (old === undefined) next.set(clock, { minE: low, maxE: high });
      else {
        old.minE = Math.min(old.minE, low);
        old.maxE = Math.max(old.maxE, high);
      }
    };
    for (const [clock, bound] of states) {
      assert.ok(clock + 1 < KEY.length, "Precomputed prime sequence exhausted");
      if (bypass && cipher[i] === 0) insert(clock, 0, bound);
      // A non-F plaintext rune must consume its assigned prime. The authentic
      // p56 rule forbids applying the additive encryption to plaintext F.
      const direct = mod(cipher[i] - KEY[clock]);
      if (direct !== 0) insert(clock + 1, direct, bound);
      if (collisionSkip && i > 0) {
        const retryPlain = mod(cipher[i] - KEY[clock + 1]);
        const rejectedOutput = mod(retryPlain + KEY[clock]);
        if (retryPlain !== 0 && rejectedOutput === cipher[i - 1]) {
          insert(clock + 2, retryPlain, bound);
        }
      }
    }
    if (next.size === 0) return {
      firstImpossibleRune: i, scanned: i + 1, stateCount: 0,
      clockIndices: [], minE: null, maxE: null
    };
    states = next;
  }
  const bounds = [...states.values()];
  return {
    firstImpossibleRune: null, scanned: cipher.length,
    stateCount: states.size, clockIndices: [...states.keys()],
    minE: Math.min(...bounds.map(x => x.minE)),
    maxE: Math.max(...bounds.map(x => x.maxE))
  };
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Plant a genuine source-native GP stream with F bypass and deliberately
 * skipped prime keys. Keep an exact rejection trace for independent replay.
 * @param {number[]} plain
 * @param {number} seed
 */
function plant(plain, seed) {
  const random = xorshift32(seed);
  const ciphertext = [], trace = [];
  let clock = 0, previousCipher = -1, rejectedKeys = 0, bypasses = 0;
  for (const p of plain) {
    if (p === 0) {
      ciphertext.push(0);
      trace.push({ bypass: true, rejects: 0 });
      previousCipher = 0;
      bypasses++;
      continue;
    }
    let c = mod(p + KEY[clock]), rejects = 0;
    while (c === previousCipher && random() < 0.8) {
      clock++;
      rejectedKeys++;
      rejects++;
      c = mod(p + KEY[clock]);
    }
    ciphertext.push(c);
    trace.push({ bypass: false, rejects });
    previousCipher = c;
    clock++;
  }
  return { ciphertext, trace, clock, rejectedKeys, bypasses };
}

/** Replay the recorded plant trace independently against the original GP29 P. */
function replay(plain, trace) {
  let clock = 0, previousCipher = -1;
  const ciphertext = [];
  plain.forEach((p, i) => {
    const record = trace[i];
    if (record.bypass) {
      assert.equal(p, 0);
      assert.equal(record.rejects, 0);
      ciphertext.push(0);
      previousCipher = 0;
      return;
    }
    assert.notEqual(p, 0);
    for (let k = 0; k < record.rejects; k++) {
      assert.equal(mod(p + KEY[clock]), previousCipher);
      clock++;
    }
    const c = mod(p + KEY[clock]);
    ciphertext.push(c);
    previousCipher = c;
    clock++;
  });
  return { ciphertext, clock };
}

/**
 * Inspect every live clock immediately before the first impossible rune.
 * @param {number[]} cipher
 * @param {number} failAt
 */
function deadEndCertificate(cipher, failAt) {
  let states = new Set([0]);
  for (let i = 0; i < failAt; i++) {
    const next = new Set();
    for (const j of states) {
      if (cipher[i] === 0) next.add(j);
      const p = mod(cipher[i] - KEY[j]);
      if (p !== 0) next.add(j + 1);
      if (i > 0) {
        const q = mod(cipher[i] - KEY[j + 1]);
        if (q !== 0 && mod(q + KEY[j]) === cipher[i - 1]) next.add(j + 2);
      }
    }
    states = next;
    assert.ok(states.size > 0);
  }
  const at = cipher[failAt], previous = cipher[failAt - 1];
  return [...states].map(j => {
    const direct = mod(at - KEY[j]), retry = mod(at - KEY[j + 1]);
    return {
      previousClock: j, ciphertext: at, previousCiphertext: previous,
      currentKey: KEY[j], nextKey: KEY[j + 1],
      directPlain: direct, directIsForbiddenF: direct === 0,
      retryPlain: retry, retryRejectedOutput: mod(retry + KEY[j]),
      retryCollisionCondition: retry !== 0 &&
        mod(retry + KEY[j]) === previous
    };
  });
}

function main() {
  assert.equal(corpus.translit.length, MOD);
  assert.equal(corpus.pages.filter(p => p.page <= 55)
    .reduce((a, p) => a + p.indices.length, 0), 12956);
  assert.equal(corpus.pages[0].indices.length, 262);
  assert.equal(corpus.pages[55].indices.length, 76);
  assert.equal(corpus.pages[56].indices.length, 85);
  assert.equal(corpus.pages[57].indices.length, 95);
  assert.equal(KEY[0], 1);
  // Any two successive key residues are distinct over every tested clock:
  // two consecutive rejections would require both to equal the same Cprev.
  // This makes the one-retry DP an EXHAUSTIVE reachability search.
  for (let i = 1; i < KEY.length; i++) {
    assert.notEqual(KEY[i], KEY[i - 1]);
  }

  const authentic56 = scan(corpus.pages[56].indices);
  assert.equal(authentic56.firstImpossibleRune, null,
    "The genuine p56 ciphertext must be reachable");
  assert.deepEqual(authentic56.clockIndices, [81, 82, 83, 84, 85]);

  const positivePlain = Array.from({ length: 6 }, () =>
    corpus.pages[57].indices).flat();
  const positive = plant(positivePlain, 0x3301ad42);
  assert.ok(positive.rejectedKeys >= 2 && positive.bypasses >= 2,
    "Positive must exercise actual rejections AND bypasses");
  const forward = replay(positivePlain, positive.trace);
  assert.deepEqual(forward.ciphertext, positive.ciphertext);
  assert.equal(forward.clock, positive.clock);
  const recovered = scan(positive.ciphertext);
  assert.equal(recovered.firstImpossibleRune, null);
  assert.ok(recovered.clockIndices.includes(positive.clock));
  const actualE = positivePlain.filter(x => x === 18).length;
  assert.ok(recovered.minE <= actualE && actualE <= recovered.maxE);

  const opening = scan(corpus.pages[0].indices);
  const terminal = scan(corpus.pages[55].indices);
  const terminalChapter = scan(corpus.pages.slice(54, 56)
    .flatMap(p => p.indices));
  const noCollisionOpening = scan(corpus.pages[0].indices,
    { collisionSkip: false });
  const noCollisionTerminal = scan(corpus.pages[55].indices,
    { collisionSkip: false });
  assert.equal(opening.firstImpossibleRune, 235);
  assert.equal(terminal.firstImpossibleRune, 63);
  assert.equal(noCollisionOpening.firstImpossibleRune, 235);
  assert.equal(noCollisionTerminal.firstImpossibleRune, 39);
  const p0Certificate = deadEndCertificate(corpus.pages[0].indices, 235);
  const p55Certificate = deadEndCertificate(corpus.pages[55].indices, 63);
  assert.deepEqual(p0Certificate, [{
    previousClock: 231, ciphertext: 8, previousCiphertext: 16,
    currentKey: 8, nextKey: 20, directPlain: 0, directIsForbiddenF: true,
    retryPlain: 17, retryRejectedOutput: 25,
    retryCollisionCondition: false
  }]);
  assert.deepEqual(p55Certificate, [{
    previousClock: 64, ciphertext: 22, previousCiphertext: 2,
    currentKey: 22, nextKey: 26, directPlain: 0,
    directIsForbiddenF: true, retryPlain: 25,
    retryRejectedOutput: 18, retryCollisionCondition: false
  }]);
  assert.equal(terminalChapter.firstImpossibleRune, null);
  assert.equal(terminalChapter.stateCount, 2);
  assert.equal(terminalChapter.maxE, 10);

  const answer = {
    model: "GP29 prime-totient + transparent plaintext F + optional duplicate collision retry",
    authentic56,
    plantedSourceNative: {
      runes: positivePlain.length, rejectedKeys: positive.rejectedKeys,
      bypasses: positive.bypasses, trueClock: positive.clock,
      authenticGPPlaintextE: actualE,
      trueClockReachable: recovered.clockIndices.includes(positive.clock)
    },
    p0ImpossibleRuneCertificate: p0Certificate,
    p55ImpossibleRuneCertificate: p55Certificate,
    originalP0: opening,
    originalP55: terminal,
    originalP54And55Continuous: terminalChapter,
    firstImpossibleWithoutRetries: {
      p0: noCollisionOpening.firstImpossibleRune,
      p55: noCollisionTerminal.firstImpossibleRune
    },
    conclusion: "Direct p56 prime-clock transfer with optional collision rejection is impossible on original p0 and p55 with a fresh prime-2 page clock"
  };
  console.log(JSON.stringify(answer, null, 2));
}
if (require.main === module) main();
module.exports = { primeTotients, scan, plant, replay, deadEndCertificate };
