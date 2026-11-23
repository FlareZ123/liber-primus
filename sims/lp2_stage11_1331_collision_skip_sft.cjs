/**
 * Exact non-repeating key-skip continuation of Cicada Stage11 133|331→1331.
 * Original LP2 p36 numbered item1, no extra offset, phases or fitted letters.
 * Node.js 22 / CommonJS SFT. Run: node sims/lp2_stage11_1331_collision_skip_sft.cjs
 *
 * Registered hypothesis: C_i=(P_i+K_j) mod29, K=1331 (periodic).
 * On a prospective adjacent equal ciphertext, advance j until output differs.
 * This emitter is invertible only as a list of states: the original C does not
 * reveal how many colliding keys were skipped. Enumerate every legal history.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'resources/historical/stage11-2014-index.html'), 'utf8');
const a = /<title>(\d+)<\/title>/.exec(html)[1];
const b = /<div id="(\d+)">/.exec(html)[1];
assert.equal(a, '133');
assert.equal(b, '331');
function orderedOverlap(x, y) {
  let k = 0;
  for (let n = 1; n <= Math.min(x.length, y.length); n++) {
    if (x.slice(-n) === y.slice(0, n)) k = n;
  }
  return x + y.slice(k);
}
const key = orderedOverlap(a, b).split('').map(Number);
assert.deepEqual(key, [1, 3, 3, 1]);

const data = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pg = data.pages.find(p => p.page === 36);
const c = pg.indices.slice(99, 238);
assert.equal(c.length, 139);
const repeats = c.flatMap((x, i) => i > 0 && x === c[i - 1] ? [i] : []);
assert.deepEqual(repeats, [129]);

/**
 * Enumerate every inverse of a prefix with zero emitted doublets.
 * No language model, word list, unknown-page fit or extra exception alphabet.
 * @param {number[]} cipher
 * @returns {{clock:number,plain:number[],skips:number[]}[]}
 */
function inverseHistories(cipher) {
  let states = [{ clock: 0, plain: [], skips: [] }];
  for (let i = 0; i < cipher.length; i++) {
    if (i > 0 && cipher[i] === cipher[i - 1]) return [];
    const next = [];
    for (const st of states) {
      for (let skip = 0; skip < key.length; skip++) {
        const ki = key[(st.clock + skip) % key.length];
        const p = (cipher[i] - ki + 29) % 29;
        // Every key we discard must have produced the exact previous C.
        // The emitted key must be the first one to avoid that collision.
        if (skip > 0) {
          if (i === 0) continue;
          let admissible = true;
          for (let k = 0; k < skip; k++) {
            if ((p + key[(st.clock + k) % key.length]) % 29 !== cipher[i - 1]) {
              admissible = false;
              break;
            }
          }
          if (!admissible) continue;
        }
        next.push({
          clock: st.clock + skip + 1,
          plain: st.plain.concat(p),
          skips: skip ? st.skips.concat([i]) : st.skips
        });
      }
    }
    states = next;
  }
  return states;
}

/** @param {number[]} plain */
function encodeSkip(plain) {
  const out = [];
  let cursor = 0;
  for (const p of plain) {
    let skipped = 0;
    let c1 = (p + key[cursor % key.length]) % 29;
    while (out.length && c1 === out[out.length - 1]) {
      skipped++;
      assert.ok(skipped < key.length, 'no-repeat loop never resolves');
      cursor++;
      c1 = (p + key[cursor % key.length]) % 29;
    }
    cursor++;
    out.push(c1);
  }
  return out;
}

// Positive control is genuine original clear p57 runes; no synthetic English.
const clear = data.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
const native = Array.from({ length: 128 }, (_, i) => clear[i % clear.length]);
const planted = encodeSkip(native);
const recovered = inverseHistories(planted);
assert.ok(recovered.some(s => s.plain.every((v, i) => v === native[i])), 'planted native p57 message lost');

const first4 = inverseHistories(c.slice(0, 4));
assert.equal(first4.length, 1);
assert.deepEqual(first4[0].plain, [19, 28, 9, 21]); // Native GP: M EA N NG = MEANING.

const first7 = inverseHistories(c.slice(0, 7));
assert.equal(first7.length, 2);
const secondWords = first7.map(s => s.plain.slice(4, 7));
assert.deepEqual(secondWords, [[23, 22, 25], [21, 22, 27]]);
const first15 = inverseHistories(c.slice(0, 15));
assert.equal(first15.length, 2);
assert.deepEqual(first15.map(s => s.plain.slice(7, 15)), [
  [18, 13, 5, 2, 13, 23, 13, 28],
  [18, 11, 5, 4, 13, 21, 13, 1]
]);

const wholeBeforeRepeat = inverseHistories(c.slice(0, 129));
assert.equal(wholeBeforeRepeat.length, 25);
assert.equal(inverseHistories(c).length, 0);
console.log(JSON.stringify({
  originalSite: 'LP2 p36 original item1 [99,238), original 53.jpg',
  sourceTitle: a,
  sourceDivId: b,
  key,
  first4MeaningIndices: first4[0].plain,
  adjacentSecondWordsGP: secondWords.map(w => w.map(i => data.translit[i]).join('-')),
  adjacentThirdWordsGP: first15.map(s => s.plain.slice(7, 15).map(i => data.translit[i]).join('-')),
  first128PossibleHistories: wholeBeforeRepeat.length,
  firstStrictlyForbiddenDoubletAtRune: repeats[0],
  nativePlantedFullLengthRecovered: recovered.some(s => s.plain.every((v, i) => v === native[i]))
}, null, 2));
console.log('PASS: source-derived key 1331 collision-skip inverse and native-glyph plant');
