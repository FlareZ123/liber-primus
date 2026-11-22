'use strict';
/**
 * Source-shaped 13-word x 13-grid-row, eight-cell GP29 key extraction.
 * Requires no downloaded packages.
 * Node.js 22: node sims/lp1_p05_wordrows_p50_middle13_p55_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} source @returns {string} */
function read(source) { return fs.readFileSync(path.join(root, source), 'utf8'); }
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const names = [
  'SHADOWS', 'AETHEREAL', 'BUFFERS', 'UOID', 'CARNAL',
  'OBSCURA', 'FORM', 'MOBIUS', 'ANALOG', 'UOID',
  'MOURNFUL', 'AETHEREAL', 'CABAL'
];
const expectedLengths = [7,6,7,4,6,7,4,6,6,4,8,6,5];
const expectedPrimeSums = [341,366,199,130,320,245,91,226,320,130,199,366,341];
const gp = book.translit.map((token, index) => ({token, index}))
  .sort((a,b) => b.token.length - a.token.length);
/** @param {string} word @returns {number[]} */
function encode(word) {
  const out = [];
  for(let i = 0; i < word.length;) {
    const symbol = gp.find(row => word.startsWith(row.token, i));
    assert(symbol, 'Unknown source GP token in ' + word);
    out.push(symbol.index);
    i += symbol.token.length;
  }
  return out;
}
/** @param {number} x @returns {number} */
function mod29(x) { return (x % 29 + 29) % 29; }
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const h = Array(29).fill(0);
  for(const value of runes) h[value]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (runes.length * (runes.length - 1));
}
assert.equal(names.length, 13);
const runeWords = names.map(encode);
assert.deepEqual(runeWords.map(a=>a.length), expectedLengths);
const primeSums = runeWords.map(word => word.reduce((s,n) => s + book.prime[n], 0));
assert.deepEqual(primeSums, expectedPrimeSums);
const W = runeWords.flat();
assert.equal(W.length, 76);
const middle = grid.pages.find(p => p.page === 50);
assert.equal(middle.rows, 13);
assert.equal(middle.cols, 8);
assert.equal(middle.bytes.length, 104);
const ciphertext = book.pages.find(p => p.page === 55).indices;
const genuine = book.pages.find(p => p.page === 57).indices.slice(0,76);
assert.equal(ciphertext.length, 76);
assert.equal(genuine.length, 76);
assert.equal(ciphertext.reduce((s,n)=>s+(n===0), 0), 3);
const constructions = [
  {name:'left-k', first: row => 0},
  {name:'word-primes-mod8', first: row => primeSums[row] % 8}
];
const outputs = [];
for(const construction of constructions) {
  const sourceKey = [];
  const leftovers = [];
  for(let row=0; row<13; row++) {
    const length = expectedLengths[row];
    const start = construction.first(row);
    const keyColumns = new Set();
    for(let i=0;i<length;i++) {
      const col = (start+i)%8;
      sourceKey.push(middle.bytes[8*row+col]);
      keyColumns.add(col);
    }
    for(let col=0;col<8;col++) if(!keyColumns.has(col)) leftovers.push(middle.bytes[8*row+col]);
  }
  assert.equal(sourceKey.length, 76);
  assert.equal(leftovers.length, 28);
  for(const sign of [-1,1]) {
    for(const wordSign of [0,1,-1]) {
      const key = sourceKey.map((byte,i) => mod29(byte+wordSign*W[i]));
      const result = ciphertext.map((cipher,i) => mod29(cipher+sign*key[i]));
      assert.deepEqual(result.map((clear,i)=>mod29(clear-sign*key[i])), ciphertext);
      const plantedCipher = genuine.map((clear,i)=>mod29(clear-sign*key[i]));
      const recovered = plantedCipher.map((cipher,i)=>mod29(cipher+sign*key[i]));
      assert.deepEqual(recovered, genuine);
      const stat = ioc(result);
      assert(stat > 0.02 && stat < 0.05);
      outputs.push({selection:construction.name, sign,
        keyKind:wordSign===0?'grid-only':wordSign>0?'grid-plus-word-runes':'grid-minus-word-runes',
        nativeIOC:stat,
        originalGP:result.map(r=>book.translit[r]).join(' ')});
    }
  }
}
assert.equal(outputs.length, 12);
assert.equal(ioc(ciphertext), 0.037894736842105266);
console.log(JSON.stringify({
  premise:'13 Wisdom GP words aligned with p50 exactly 13 rows of 8 grid cells, key length 76 = original p55',
  source:{wordLengths:expectedLengths, wordPrimeSums:primeSums,
    originalP50Rows:middle.rows, cellsPerRow:middle.cols,
    selectedGridBytes:76, unselectedGridBytes:28, p55Runes:ciphertext.length},
  originalCipherIOC:ioc(ciphertext), genuineP57IOC:ioc(genuine),
  fixedTests:outputs.map(x=>({...x, originalGP:x.originalGP.slice(0,240)})),
  positive:'All 76 genuine p57 GP symbols recovered and all 76 planted cipher symbols reenacted in each test.',
  conclusion:'No source-selected inverse or readable original p55 plaintext. The 13x8/76 extraction remains a conditional clue-shaped operand.'
}, null, 2));