'use strict';

/** Source-original LP2 red119 NUMBER -> 60 -> printed-table lookup gate. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {unknown} */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
/** @type {{pages: Array<{page:number,indices:number[]}>}} */
const corpus = /** @type {any} */ (readJSON('resources/liber-primus/lp2-corpus.json'));
/** @type {{rows:string[][],byte_rows:number[][],alphabet:string}} */
const grid = /** @type {any} */ (readJSON('resources/liber-primus/base60-grid.json'));
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
assert.equal(corpus.pages.length, 58);
const red = [
  {page:3, offset:119,indices:[13,23,2],sum:137,reverse:731,factors:[17,43]},
  {page:39,offset:119,indices:[27,5,15],sum:173,reverse:371,factors:[7,53]}
];
const tokens = grid.rows.flat();
const bytes = grid.byte_rows.flat();
assert.equal(grid.rows.length,32);
assert.equal(tokens.length,256);
assert.equal(bytes.length,256);
assert.equal(grid.alphabet.length,60);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
for(let i=0;i<256;i++){
  assert.equal(tokens[i].length,2);
  assert.equal(grid.alphabet.indexOf(tokens[i][0])*60+grid.alphabet.indexOf(tokens[i][1]),bytes[i]);
}
for(const item of red){
  const seq=corpus.pages[item.page].indices.slice(item.offset,item.offset+3);
  assert.deepEqual(seq,item.indices);
  assert.equal(seq.reduce((n,x)=>n+primes[x],0),item.sum);
  assert.equal(Number(String(item.sum).split('').reverse().join('')),item.reverse);
  assert.equal(item.factors[0]*item.factors[1],item.reverse);
  assert.equal(item.factors[0]+item.factors[1],60);
  assert(item.factors.every(x=>primes.includes(x)));
}
const expected={137:[21],173:[26,84,147,239],17:[],43:[],7:[],53:[]};
for(const [key,positions] of Object.entries(expected)){
  const val=Number(key);
  assert.deepEqual(bytes.flatMap((v,i)=>v===val?[i]:[]),positions);
}
assert(tokens.every(t=>'01234'.includes(t[0])), 'every table cell represents a byte below 256');
for(const item of red) {
  assert(item.reverse>255,'reversed NUMBER outputs cannot be direct table cell values');
  const [a,b]=item.factors;
  assert(a*60+b>255,'factor primes as base60 digits are outside the printed table byte range');
}
for(const pair of ['GP','OS','GO','PS']){
  assert(!tokens.includes(pair),'no literal two-letter readout '+pair+' in source table');
  const n=grid.alphabet.indexOf(pair[0])*60+grid.alphabet.indexOf(pair[1]);
  assert(n>255);
}
const result={
  classification:'natural literal red119 -> base60 table reads fail or remain nonunique',
  originalSources:'physical LP2 red119 spans p3/p39; pp49-51 32x8 printed table',
  red,
  sourceFactorValues:expected,
  candidateBytes:[137,173],
  candidateLiteralValuePositions:[expected[137],expected[173]],
  directFactorPairBase60Integers:[17*60+43,7*60+53],
  candidateFactorWordBase60Integers:{GP:16*60+25,OS:24*60+28},
  originalTableByteSHA256:crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  consumerFound:false,
  unknownPlaintextRecovered:false
};
console.log(JSON.stringify(result,null,2));
