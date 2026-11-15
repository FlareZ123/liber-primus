'use strict';
/**
 * Source-locked 2015 participant public runescript.py program operator test.
 *
 * 2015-07-07 original Part9 wiki oldid26139 cites Pastebin zXMgSFLM.
 * Original published 960-line source has sequence=[0 for x in range(1000)]
 * active, loops side -1/+1, param 0..28, consumes keystream only on runes
 * and lacks the known p56 literal-F at rune offset56 skip.
 * Byte SHA256 of 2015-linked raw is checked separately by source-acquisition
 * SFT (012f113274f10b453a6423e5fe263c1ad186fda95c64af6433b6f17da348ef3b).
 *
 * This tests what that frozen, actual program's default 58 outputs can do
 * to the canonical original GP29 p0 and p54, with an authentic known p56
 * prime-minus-one positive/negative. No third-party code is executed.
 *
 * Node.js 22, CommonJS: node sims/lp2_2015_runescript_original_default_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
/** @param {number} n */
function mod29(n) { return ((n % 29) + 29) % 29; }
/** @param {number[]} a */
function ioc(a) {
  const h = Array(29).fill(0);
  for (const x of a) h[x]++;
  const n = a.length;
  return h.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}
/** @param {number} page */
function cipherPage(page) {
  const record = corpus.pages.find((p) => p.page === page);
  assert(record && record.indices.length);
  return record.indices;
}
/** @param {number[]} c @param {number} direction @param {number} phase */
function historicalDefault(c, direction, phase) {
  // source: forge_offsets(sequence, direction, -param).
  // active sequence = 1000 zeroes. This reduces to one Caesar rotation.
  return c.map((symbol) => mod29(symbol - direction * phase));
}
function primes(n) {
  const result = [];
  for (let x = 2; result.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) result.push(x);
  }
  return result;
}
const page0 = cipherPage(0), page54 = cipherPage(54);
assert.equal(page0.length, 262);
assert.equal(page54.length, 232);
assert.equal(cipherPage(56).length, 85);
assert.equal(cipherPage(57).length, 95);
const checks=[];
for (const [page, ciphertext] of [[0, page0], [54, page54]]) {
  const base = ioc(ciphertext);
  const seen = new Set();
  for (const direction of [-1, 1]) {
    for (let phase = 0; phase < 29; phase++) {
      const result = historicalDefault(ciphertext, direction, phase);
      const roundtrip = result.map((x) => mod29(x + direction * phase));
      assert.deepEqual(roundtrip, ciphertext);
      assert(Math.abs(ioc(result) - base) < 1e-12);
      seen.add(result.join(','));
    }
  }
  assert.equal(seen.size,29,'58 outputs are only 29 Caesar permutations');
  checks.push({page,originalRuneCount:ciphertext.length,
    originalIoC:base,emittedAttempts:58,distinctOutputStreams:seen.size,
    originalToOutputIoCChange:0});
}
// Authentic p56 uses prime-minus-one, and must explicitly bypass ONE
// source ciphertext F at rune offset 56 without consuming the prime key.
const p56 = cipherPage(56);
assert.equal(p56[56], 0);
const tape = primes(p56.length);
const noSkip = p56.map((c, i) => mod29(c - (tape[i] - 1)));
let consumed=0;
const authentic = p56.map((c, i) => i === 56
  ? c : mod29(c - (tape[consumed++] - 1)));
assert.equal(consumed, 84);
assert.deepEqual(noSkip.slice(0,56), authentic.slice(0,56));
assert.notDeepEqual(noSkip.slice(56), authentic.slice(56));
const reencryption = authentic.map((plain, i) => {
  if (i === 56) return plain;
  const index = i - Number(i > 56);
  return mod29(plain + (tape[index] - 1));
});
assert.deepEqual(reencryption,p56);
assert(ioc(authentic)>0.06);
console.log(JSON.stringify({decision:'No unknown plaintext under default script',
  source:'2015-07-07 Part9 revision26139 + 64630-byte historical runescript.py',
  defaults:checks,
  knownSolvedP56:{runes:85,sourceScriptMissingLiteralFSkipAt56:true,
    noSkipIoC:ioc(noSkip),authenticSkipIoC:ioc(authentic),
    authenticFullReencryption:true}}));
