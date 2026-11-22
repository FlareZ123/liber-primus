'use strict';
/**
 * Source-led reversible GP29 anti-repeat candidate with mutable plaintext
 * trit history and the original 243 p8 black runes as a key table.
 * Windows Node22 SFT: node sims/lp2_p8_243_plaintrit_nonrepeat_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
/** @param {number} x @param {number} m @returns {number} */
const mod = (x, m) => ((x % m) + m) % m;
const table = gp.pages.find(p => p.page === 8).indices.slice(12);
const pages = gp.pages.filter(p => p.page >= 9 && p.page <= 55);
const cipher = pages.flatMap(p => p.indices);
const preceding = gp.pages.find(p => p.page === 8).indices.at(-1);
const solved = gp.pages.find(p => p.page === 57).indices;
const sourceSeed = [11,26,8,15,2].map(v => v % 3)
  .reduce((s, v) => s * 3 + v, 0);
assert.equal(table.length, 243);
assert.equal(cipher.length, 10827);
assert.equal(solved.length, 95);
assert.equal(sourceSeed, 236);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const histogram = Array(29).fill(0);
  for (const x of a) histogram[x]++;
  return histogram.reduce((s, v) => s + v * (v - 1), 0) /
    (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number} seed @param {number} sign @returns {number[]} */
function decode(a, seed, sign) {
  let state = seed, prev = preceding;
  return a.map(c => {
    const d = mod(c - prev, 29);
    prev = c;
    const p = d === 0 ? 28 : mod(d - 1 + sign * table[state], 28);
    state = (state % 81) * 3 + p % 3;
    return p;
  });
}
/** @param {number[]} a @param {number} seed @param {number} sign @returns {number[]} */
function encode(a, seed, sign) {
  let state = seed, prev = preceding;
  return a.map(p => {
    const d = p === 28 ? 0 : mod(p - sign * table[state], 28) + 1;
    prev = mod(prev + d, 29);
    state = (state % 81) * 3 + p % 3;
    return prev;
  });
}
const offset16 = pages.filter(p => p.page < 16).reduce((s,p) => s + p.indices.length, 0);
const offset40 = pages.filter(p => p.page < 40).reduce((s,p) => s + p.indices.length, 0);
const results = [];
for (const sign of [-1,1]) {
  for (let seed = 0; seed < 243; seed++) {
    const p = decode(cipher, seed, sign);
    if ([0, sourceSeed, 242].includes(seed))
      assert.deepEqual(encode(p, seed, sign), cipher);
    const rec = {sign, seed, wholeIoC: ioc(p),
      p9IoC: ioc(p.slice(0,268)),
      p16IoC: ioc(p.slice(offset16,offset16+267)),
      p40IoC: ioc(p.slice(offset40,offset40+231)),
      escapes: p.filter(x => x===28).length};
    results.push(rec);
  }
  const plant = encode(solved, sourceSeed, sign);
  assert.deepEqual(decode(plant, sourceSeed, sign), solved);
  const special = solved.slice();
  special[12] = 28;
  const escaped = encode(special, sourceSeed, sign);
  assert.deepEqual(decode(escaped, sourceSeed, sign), special);
  assert.equal(escaped[12], escaped[11]);
}
results.sort((a,b)=>b.wholeIoC-a.wholeIoC);
assert.equal(results[0].wholeIoC < 0.036, true);
assert.equal(results.at(-1).wholeIoC > 0.035, true);
assert.equal(results.every(x=>x.escapes===73), true);
console.log(JSON.stringify({sourceSeed,sourceSeedResults:results.filter(x=>x.seed===sourceSeed),
  maxIoC:results[0],minIoC:results.at(-1),nativeSolvedP57IoC:ioc(solved),
  originalRunes:cipher.length,candidateCount:results.length},null,2));
console.log('PASS: original candidate inverses remain nonprose; solved-p57 and escape plants recover.');
