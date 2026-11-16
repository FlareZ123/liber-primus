'use strict';

// Original-image floral five-dot 13/31 -> exact p50 32x8 numeric receiver.
// This reproducer deliberately does not infer an unknown LP2 decryption key.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const { bytes } = JSON.parse(fs.readFileSync(source, 'utf8'));
assert.equal(bytes.length, 256);
assert.ok(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const left = parseInt('01101', 2), right = parseInt('11111', 2);
assert.deepEqual([left, right], [13, 31]);
/** @param {number} row @returns {number[]} */
function rowBytes(row) { return bytes.slice(row * 8, row * 8 + 8); }
/** @param {number[]} arr @returns {string} */
function rawAscii(arr) { return arr.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : '.').join(''); }
/** @param {number} n @returns {string} */
function base29(n) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  let out = '';
  do { out = alphabet[n % 29] + out; n = Math.floor(n / 29); } while (n);
  return out;
}
assert.equal(base29(3301), '3QO'); // signed 2013 TCP example
/** @param {number[]} arr @returns {string} */
function low5Base32(arr) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  return arr.map(x => alphabet[x & 31]).join('');
}
/** @param {number} seed @returns {{path:number[], cycleStart:number, cycleLength:number}} */
function tableWalk(seed) {
  const seen = new Map(), chain = [];
  let state = seed;
  while (!seen.has(state)) {
    assert.ok(chain.length < 257);
    seen.set(state, chain.length);
    chain.push(state);
    state = bytes[state];
  }
  return {path:chain, cycleStart:seen.get(state), cycleLength:chain.length - seen.get(state)};
}
for (const [name, indices] of [['zero-based', [13, 31]], ['one-based', [12, 30]]]) {
  const pair = indices.flatMap(rowBytes);
  console.log(name, 'selected_hex=', Buffer.from(pair).toString('hex'),
    'raw_ASCII=', rawAscii(pair), 'printable=', pair.filter(x=>x>=32&&x<=126).length);
  console.log('2013_BASE29_each=', pair.map(base29).join(' '));
  console.log('nonvalidating_low5_base32=', low5Base32(pair));
}
for (const seed of [13, 31, 13 * 8 + (31 & 7), 31 * 8 + (13 & 7)]) {
  const w = tableWalk(seed);
  console.log('seed=',seed,'path=',w.path.join(','),'cycle_start=',w.cycleStart,'cycle_len=',w.cycleLength);
  assert.equal(w.cycleLength,11);
}
// The original 2013 word/ISO byte operation was XOR: a direct historical
// two-selected-row XOR is a falsifiable 8-byte typed receiver, not a key guess.
for (const [name,a,b] of [['zero-based',13,31],['one-based',12,30]]) {
  const combined = rowBytes(a).map((x,i) => x ^ rowBytes(b)[i]);
  console.log(name, 'XOR_two_rows=',Buffer.from(combined).toString('hex'),
    'raw_ASCII=',rawAscii(combined));
}

// The known p50 GF29 degree16 factor gives 240 quotient coefficients, matching
// p39's 240 authentic runes. A two-row source candidate supplies 16 possible
// lower-degree monic-factor coefficients. Test it without fitting anything.
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p39 = corpus.pages[39].indices;
assert.equal(p39.length,240);
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} a Descending coefficients. @param {number[]} d Monic divisor. */
function gf29Divide(a,d) {
  const rem=a.map(mod), quotient=[];
  for (let i=0;i<=a.length-d.length;i++) {
    const v=rem[i]; quotient.push(v);
    for(let j=0;j<d.length;j++) rem[i+j]=mod(rem[i+j]-v*d[j]);
  }
  return {quotient,remainder:rem.slice(a.length-d.length+1)};
}
const results=[];
for(const [name,indices] of [['zero-based',[13,31]],['one-based',[12,30]]]) {
  const coefficients=indices.flatMap(rowBytes).map(x=>x%29);
  for(const direction of ['as-printed','reverse']) {
    const d=[1,...(direction==='reverse'?coefficients.slice().reverse():coefficients)];
    const {quotient,remainder}=gf29Divide(bytes,d);
    const remNonzero=remainder.filter(x=>x!==0).length;
    const positionMatchesP39=quotient.filter((x,i)=>x===p39[i]).length;
    results.push(remNonzero);
    console.log(name,direction,'GF29 remainder=',remainder.join(','),
      'nonzero=',remNonzero,'quotient_p39_matches=',positionMatchesP39);
  }
}
assert.deepEqual(results,[16,16,15,16]);

// The 2×8 selected rows can instead be *omitted*, leaving exactly 30×8
// cells, matching the original p39's 240-rune count. This is independent of
// polynomial division, which consumes the rows as GF29 factor coefficients.
const countIoC = arr => {
  const count=Array(29).fill(0);
  for(const x of arr)count[x]++;
  return count.reduce((a,n)=>a+n*(n-1),0)/(arr.length*(arr.length-1));
};
const solvedP57=corpus.pages[57].indices;
assert.equal(solvedP57.length,95);
for (const [name,rows] of [['zero-based',[13,31]], ['one-based',[12,30]]]) {
  const tape=bytes.filter((_,i)=>!rows.includes(Math.floor(i/8))).map(x=>x%29);
  assert.equal(tape.length,240);
  const counts=arr=>Array.from({length:29},(_,sym)=>arr.filter(x=>x===sym).length)
    .sort((a,b)=>b-a);
  console.log('delete_rows=',name,'remaining_runes=',tape.length,
    'GP29_table_IoC=',countIoC(tape).toFixed(9),
    'frequency_multiset_equal_p39=',JSON.stringify(counts(tape))===JSON.stringify(counts(p39)));
  // Both natural additive polarities are exact bijections; GP rune
  // controls demonstrate inversion and no plaintext-F substitution claim.
  for(const sign of [-1,1]) {
    const out=p39.map((sym,i)=>mod(sym+sign*tape[i]));
    const back=out.map((sym,i)=>mod(sym-sign*tape[i]));
    assert.deepEqual(back,p39);
    const plantedCipher=solvedP57.map((sym,i)=>mod(sym-sign*tape[i]));
    const plantedRecovered=plantedCipher.map((sym,i)=>mod(sym+sign*tape[i]));
    assert.deepEqual(plantedRecovered,solvedP57);
    console.log(name,'sign=',sign,'p39_candidate_IoC=',countIoC(out).toFixed(9),
      'first48_GP=',out.slice(0,48).map(i=>corpus.translit[i]).join(''));
  }
}

assert.deepEqual(rowBytes(13), [122,63,31,218,14,184,32,115]);
assert.deepEqual(rowBytes(31), [113,158,172,230,180,36,189,80]);
console.log('PASS: original-table, row, BASE29 and self-map assertions');
