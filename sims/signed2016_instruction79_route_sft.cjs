'use strict';

/**
 * Signed 2016 Cicada instruction length and source-fixed p32 word-driven walk.
 *
 * The phrase starting "Liber Primus is the way" and ending "direction"
 * occupies 21 printed words, and exactly 79 Gematria Primus runes under the
 * canonical 29-symbol alphabet. The original 2016 image has width 563,
 * whose remainder modulo p32's 121 runes is also 79.
 *
 * Two explicit routes implement a literal "numbers are the direction"
 * reading: word GP prime-sum modulo eight is a compass octant (east = zero,
 * then counterclockwise), and movement has either one or the word's GP
 * rune count steps on the p32 11x11 torus. Neither reaches the independent
 * image-height endpoint 569 mod 121 = 85.
 *
 * This is a bounded source arithmetic / route test, not plaintext recovery.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const message = fs.readFileSync(
  path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8'
);
const begin = 'Liber Primus is the way.';
const finish = 'direction.';
assert.equal(message.split(begin).length, 2);
const start = message.indexOf(begin);
const end = message.indexOf(finish, start) + finish.length;
const instruction = message.slice(start, end);
const words = instruction.toUpperCase().match(/[A-Z]+/g);
assert.equal(words.length, 21);
const alphabet = corpus.translit;
const digraphs = new Set(alphabet.filter(x => x.length === 2));

/** @param {string} word
 * @returns {number[]}
 */
function encode(word) {
  const out = [];
  for (let i = 0; i < word.length;) {
    const digraph = word.slice(i, i + 2);
    const rune = digraphs.has(digraph) ? digraph : word[i];
    const index = alphabet.indexOf(rune);
    assert.ok(index >= 0, 'unmappable signed word: ' + word);
    out.push(index);
    i += rune.length;
  }
  return out;
}

const info = words.map(word => {
  const gp = encode(word);
  const primeSum = gp.reduce((sum, i) => sum + corpus.prime[i], 0);
  return { word, length: gp.length, primeSum, octant: primeSum % 8 };
});
const total = info.reduce((sum, w) => sum + w.length, 0);
assert.equal(total, 79);
const original = corpus.pages[32].indices;
assert.equal(original.length, 121);
const firstRow = original.slice(0, 11).map(i => corpus.prime[i]);
const firstCol = Array.from({length:11},(_,r) => corpus.prime[original[11*r]]);
const width = firstRow.reduce((a,b) => a+b,0);
const height = firstCol.reduce((a,b) => a+b,0);
assert.deepEqual([width,height],[563,569]);
const startOffset = width % 121;
const targetOffset = height % 121;
assert.deepEqual([startOffset,targetOffset],[79,85]);

const move = [[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]];
const mod = (n, m) => ((n % m) + m) % m;

/** @param {'unit'|'wordlength'} mode
 * @returns {{mode:string,endOffset:number,visits:number[],runes:string[]}}
 */
function walk(mode) {
  let row = Math.floor(startOffset/11);
  let col = startOffset%11;
  const visits = [startOffset];
  for (const w of info) {
    const [dr, dc] = move[w.octant];
    const step = mode === 'unit' ? 1 : w.length;
    row = mod(row + dr * step, 11);
    col = mod(col + dc * step, 11);
    visits.push(11 * row + col);
  }
  return {
    mode, endOffset:visits.at(-1),visits,
    runes:visits.map(i => alphabet[original[i]])
  };
}

const tests = [walk('unit'),walk('wordlength')];
assert.deepEqual(tests.map(t=>t.endOffset),[71,101]);
assert.ok(tests.every(t=>t.endOffset!==targetOffset));
console.log(JSON.stringify({
  signed_words:words.length, signed_gp_runes:total,
  image_width:width,image_height:height,p32_runes:original.length,
  width_offset:startOffset,height_offset:targetOffset,
  source_word_lengths:info.map(x=>x.length),
  source_word_prime_sums:info.map(x=>x.primeSum),
  routing_convention:'east=0, counterclockwise octants, modulo 11 torus',
  routes:tests
},null,2));
