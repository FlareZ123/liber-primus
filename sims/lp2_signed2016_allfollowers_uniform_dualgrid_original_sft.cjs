'use strict';
/**
 * Test a single uniform signed-2016 THE-follower GP0/GP-prime table
 * navigation grammar on all of its independently printed word pairs.
 *
 * Original source and unsigned page glyphs are read directly.
 * No LP2 ciphertext fitting, phase searches, invented recipient or
 * claimed plaintext. Node.js 22 CommonJS, Windows 11, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc')
  .split('-----BEGIN PGP SIGNATURE-----')[0];
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const cells = grid.pages.flatMap(p => p.tokens);
assert.equal(cells.length, 256);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(corpus.runes.length, 29);
/** Fixed six literal followers of THE in the signed prose, including context. */
const followers = [...signed.matchAll(/\bthe\s+(path|devoted|way|map|road|direction)\b/gi)]
  .map(m => m[1].toUpperCase());
assert.deepEqual(followers, ['PATH','DEVOTED','WAY','MAP','ROAD','DIRECTION']);
const names = new Map(corpus.translit.map((s, i) => [s, i]));
/**
 * Source-normalized Latin spelling: V is U as in GP, K/Q are C, Z is S.
 * One frozen global mode encodes the official GP ligatures when present.
 * @param {string} word
 * @param {'greedy'|'letterwise'} spelling
 * @returns {number[]}
 */
function encode(word, spelling) {
  const normal = word.replace(/V/g, 'U').replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const multi = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA', 'IO'];
  const out = [];
  for (let i = 0; i < normal.length;) {
    const pair = spelling === 'greedy' ?
      multi.find(t => normal.startsWith(t, i)) : undefined;
    const letter = pair === 'IO' ? 'IA' : (pair || normal[i]);
    assert(names.has(letter), 'Unknown GP glyph: ' + letter);
    out.push(names.get(letter));
    i += pair ? pair.length : 1;
  }
  return out;
}
/** @param {number} index */
function coordinate(index) {
  return {row: Math.floor(index/8), column: index%8};
}
/** @param {number} a @param {number} b */
function offset(a,b) {
  const x=coordinate(a), y=coordinate(b);
  return {dr:y.row-x.row, dc:y.column-x.column,
    neighbor:Math.abs(y.row-x.row)+Math.abs(y.column-x.column)===1};
}
/** @param {number} n */
function sourceCell(n) {
  return n >= 0 && n < 256 ? cells[n] : null;
}
const variants = [];
for (const spelling of ['greedy','letterwise']) {
  const words = followers.map(word => {
    const symbols = encode(word, spelling);
    const gp0 = symbols.reduce((s, i) => s+i, 0);
    const gpPrime = symbols.reduce((s, i) => s+corpus.prime[i], 0);
    return {word, symbols:symbols.map(i=>corpus.translit[i]),
      gp0, gpPrime, c0:sourceCell(gp0), cPrime:sourceCell(gpPrime)};
  });
  const transitions = words.slice(0,-1).map((first,i) => {
    const second = words[i+1];
    return {from:first.word, to:second.word,
      gp0:offset(first.gp0,second.gp0),
      prime:offset(first.gpPrime,second.gpPrime),
      validPrimeDirect:sourceCell(first.gpPrime)!==null &&
        sourceCell(second.gpPrime)!==null,
      primeMod256:offset(first.gpPrime%256,second.gpPrime%256)};
  });
  assert.equal(transitions.length,5);
  assert.equal(transitions.filter(t=>t.gp0.neighbor&&t.prime.neighbor).length,1);
  assert.equal(transitions.filter(t=>t.gp0.neighbor&&t.primeMod256.neighbor).length,1);
  assert.equal(transitions.find(t=>t.from==='WAY').to,'MAP');
  assert.equal(words.find(t=>t.word==='WAY').gp0,57);
  assert.equal(words.find(t=>t.word==='MAP').gp0,56);
  assert.equal(words.find(t=>t.word==='WAY').gpPrime,219);
  assert.equal(words.find(t=>t.word==='MAP').gpPrime,211);
  assert.equal(words.find(t=>t.word==='WAY').cPrime,'0x');
  assert.equal(words.find(t=>t.word==='MAP').cPrime,'11');
  assert(words.find(t=>t.word==='DEVOTED').gpPrime>=256);
  assert(words.find(t=>t.word==='DIRECTION').gpPrime>=256);
  const p55=corpus.pages.find(p=>p.page===55);
  assert.equal(p55.indices.length,76);
  variants.push({spelling,words,transitions,
    originalP55Runes:p55.indices.length,
    directAddressFailures:words.filter(w=>w.cPrime===null).map(w=>w.word)});
}
console.log(JSON.stringify({
  source:'Authentic 2016 signed message + original 256 printed cells',
  fixedGrammar:'Each THE-follower indexes both zero-based GP0 and GP-prime slots in 8-column p50 grid; every consecutive pair must apply the same horizontal/vertical neighbor rule.',
  variants,
  rawPrimaryPair:'WAY→MAP gives T[219]=0x, T[211]=11 and 0x11=17',
  acceptedPairedTransitions:'1 of 5 under both fixed GP spellings and both direct/mod256 GP-prime addressing',
  verdict:'Only the originally noticed WAY→MAP is orthogonally adjacent; DEVOTED and DIRECTION are out-of-range as direct GP-prime cell addresses. The next signed MAP→ROAD transition fails both adjacency tests even with modulo wrap. No uniform authored opcode or p55 decipherment.'
},null,2));
console.log('PASS: signed source, full pair register, original p50 geometry and p55 count');
