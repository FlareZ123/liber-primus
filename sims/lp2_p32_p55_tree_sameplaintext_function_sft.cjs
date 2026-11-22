/**
 * LP2 p32/p55 shared-tree text-identity gate.
 *
 * Tests all contiguous and all cyclic 76-rune overlaps of the 121-rune p32
 * sequence, in both orientations, against p55 in both orientations. Any
 * same-underlying-plaintext model encrypted through distinct fixed symbolic
 * substitutions on the two pages induces a fixed function of p32 rune to
 * p55 rune. This test gives that function COMPLETE freedom, so its required
 * mismatch count is a rigorous lower bound for every global monoalphabetic
 * bijection, unknown symbol relabeling and fixed affine substitution.
 *
 * SFT: node sims/lp2_p32_p55_tree_sameplaintext_function_sft.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const p32 = corpus.pages.find(p => p.page === 32).indices;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const Q = 29;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(corpus.translit.length, Q);

/**
 * @param {number[]} a p32-oriented source rune sequence
 * @param {number[]} b p55-oriented comparison rune sequence
 * @param {number} offset First rune of source overlap
 * @param {boolean} cyclic Whether a source overlap can wrap
 * @returns {number} Maximum exact positions under ANY fixed A->B function
 */
function maxFunctionMatches(a, b, offset, cyclic) {
  const counts = Array.from({length:Q}, () => Array(Q).fill(0));
  for (let i=0; i<b.length; i++) {
    const j = cyclic ? (offset+i) % a.length : offset+i;
    assert(j < a.length);
    counts[a[j]][b[i]]++;
  }
  // An arbitrary function chooses the most frequent target per source label.
  return counts.reduce((n, row) => n + Math.max(...row), 0);
}

let fixedScans = 0;
let cyclicScans = 0;
let bestFixed = {matches:-1};
let bestCyclic = {matches:-1};
for (const reverse32 of [false, true]) {
  const a = reverse32 ? p32.slice().reverse() : p32;
  for (const reverse55 of [false, true]) {
    const b = reverse55 ? p55.slice().reverse() : p55;
    for (const cyclic of [false, true]) {
      const maxOffsets = cyclic ? a.length : a.length-b.length+1;
      for (let offset=0; offset<maxOffsets; offset++) {
        const matches = maxFunctionMatches(a,b,offset,cyclic);
        const result = {matches,offset,reverse32,reverse55};
        if (cyclic) {
          cyclicScans++;
          if (matches>bestCyclic.matches) bestCyclic=result;
        } else {
          fixedScans++;
          if (matches>bestFixed.matches) bestFixed=result;
        }
      }
    }
  }
}

assert.equal(fixedScans, 184);
assert.equal(cyclicScans, 484);
assert.equal(bestFixed.matches, 35);
assert.equal(bestCyclic.matches, 39);
assert(bestFixed.matches<p55.length);
assert(bestCyclic.matches<p55.length);

// Authentic-key-independent positive: a planted 29-symbol bijection on a
// genuine 76-rune p32 window is accepted EXACTLY (not merely language-scored).
const synthetic = p32.slice(0,p55.length).map(x => (7*x+13)%Q);
assert.equal(maxFunctionMatches(p32,synthetic,0,false),p55.length);
for (let i=0; i<synthetic.length; i++) {
  assert.equal((25*(synthetic[i]-13)+Q*50)%Q,p32[i]);
}
console.log(JSON.stringify({
  source:'unchanged GP29 original physical p32 and p55 indices',
  p32Runes:p32.length,p55Runes:p55.length,
  comparedModel:'same plaintext at fixed ordered 76-rune overlap under any stationary cross-page GP29 symbol-to-symbol function',
  contiguous:{alignments:fixedScans,...bestFixed,minUnavoidableMismatches:p55.length-bestFixed.matches},
  includingCyclic:{alignments:cyclicScans,...bestCyclic,minUnavoidableMismatches:p55.length-bestCyclic.matches},
  positive:'native-p32 plant with invertible map 7*a+13 mod29, all 76 positions accepted and decoded'
},null,2));
