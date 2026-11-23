'use strict';

/**
 * SFT: original cuneiform 1,033-rune mixed-section key bank, 553 numbered
 * runes, and the author-demonstrated solved-LP2 plaintext-F bypass.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_cuneiform_1033bank_ftransparent_original_sft.cjs
 *
 * No fitted text, guessed keys, or external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages;
const items = [
  pages[36].indices.slice(99),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186)
];
const target = items.flat();
const bank = [
  ...pages[33].indices.slice(91),
  ...pages[34].indices,
  ...pages[35].indices,
  ...pages[36].indices.slice(0, 99),
  ...pages[38].indices.slice(186),
  ...pages[39].indices.slice(0, 119),
  ...pages[39].indices.slice(122)
];
assert.deepEqual(items.map((item) => item.length), [139, 91, 98, 96, 129]);
assert.equal(target.length, 553);
assert.equal(bank.length, 1033);
assert.deepEqual(pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.equal(target.filter((symbol) => symbol === 0).length, 12);
const strides = [1, 202, 1032];

/** Canonical unsigned residue modulo a positive integer. */
function mod(value, radix) {
  return ((value % radix) + radix) % radix;
}

/**
 * Return the longest legally decodable prefix under known-key addition
 * C=P+sign*K (mod29), where literal plaintext F=0 is transmitted unchanged
 * and does not advance the key clock.
 * At an observed ciphertext F=0, both legal plaintext interpretations are
 * explored; all impossible plaintext-F-as-key-consumer paths are rejected.
 * @param {number[]} ciphertext
 * @param {number} phase
 * @param {number} step
 * @param {number} sign
 * @returns {number}
 */
function longestLegalPrefix(ciphertext, phase, step, sign) {
  let reachable = new Set([0]); // skipped literal Fs so far
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const skipped of reachable) {
      const consumed = i - skipped;
      const key = bank[mod(phase + step * consumed, bank.length)];
      const ordinary = mod(ciphertext[i] - sign * key, 29);
      if (ordinary !== 0) next.add(skipped); // ordinary key advance
      if (ciphertext[i] === 0) next.add(skipped + 1); // literal F, key hold
    }
    if (next.size === 0) return i;
    reachable = next;
  }
  return ciphertext.length;
}

/** Forward encoder with genuine plaintext-F (zero) bypass. */
function encrypt(plaintext, phase, step, sign) {
  const output = [];
  let consumed = 0;
  for (const symbol of plaintext) {
    if (symbol === 0) {
      output.push(0);
    } else {
      const key = bank[mod(phase + step * consumed, bank.length)];
      output.push(mod(symbol + sign * key, 29));
      consumed++;
    }
  }
  return output;
}

const expected = [
  [1, -1, 376, 5],
  [1, 1, 294, 3],
  [202, -1, 360, 2],
  [202, 1, 421, 1],
  [1032, -1, 354, 5],
  [1032, 1, 365, 4]
];
const native = Array.from({ length: 553 }, (_, i) =>
  pages[57].indices[i % pages[57].indices.length]);
assert.equal(pages[57].indices.length, 95);
let cases = 0;

for (const [step, sign, expectedPrefix, expectedBoth] of expected) {
  let full = 0;
  let maxPrefix = 0;
  let sharedReset = 0;
  let allFiveReset = 0;
  for (let phase = 0; phase < bank.length; phase++) {
    const prefix = longestLegalPrefix(target, phase, step, sign);
    if (prefix === target.length) full++;
    if (prefix > maxPrefix) maxPrefix = prefix;
    const ok = items.map((item) =>
      longestLegalPrefix(item, phase, step, sign) === item.length);
    if (ok[0] && ok[1]) sharedReset++;
    if (ok.every(Boolean)) allFiveReset++;
    cases++;
  }
  assert.equal(full, 0, `continuous original ${step}/${sign}`);
  assert.equal(maxPrefix, expectedPrefix, `longest original ${step}/${sign}`);
  assert.equal(sharedReset, expectedBoth, `item1+item2 reset ${step}/${sign}`);
  assert.equal(allFiveReset, 0, `all five item resets ${step}/${sign}`);

  const synthetic = encrypt(native, 0, step, sign);
  assert.equal(synthetic.length, 553);
  assert.equal(longestLegalPrefix(synthetic, 0, step, sign), 553,
    'positive native-GP F-bypass plant');
  console.log(`PASS step=${step} sign=${sign} original max=${maxPrefix}/553` +
    ` full=${full} shared-item1+2-phases=${sharedReset} all-five=${allFiveReset}`);
}

assert.equal(cases, 6198);
console.log('PASS 6,198 original full-key-phase models, zero legal full decryptions');
console.log('PASS all 6 native-plaintext-F synthetic positive encryptions are legal');
console.log('CONCLUSION: this exact 1033-bank additive F-transparent architecture fails.');
