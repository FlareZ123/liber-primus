'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 29;

/**
 * @param {number} a
 * @param {number} e
 * @param {number} m
 * @returns {number}
 */
function modPow(a, e, m) {
  let r = 1n;
  let b = BigInt(a % m);
  let n = BigInt(e);
  const mm = BigInt(m);
  while (n > 0n) {
    if ((n & 1n) === 1n) r = (r * b) % mm;
    b = (b * b) % mm;
    n >>= 1n;
  }
  return Number(r);
}

/**
 * @param {[number, number, number, number]} k
 * @returns {[number, number, number, number]}
 */
function H4(k) {
  const [k0,k1,k2,k3] = k;
  return [
    (k0-k3+MOD)%MOD,
    (k1-k2+MOD)%MOD,
    (k1+k2)%MOD,
    (k0+k3)%MOD
  ];
}

/**
 * @param {[number, number, number, number]} h
 * @returns {[number, number, number, number]}
 */
function H4Inv(h) {
  const [h0,h1,h2,h3] = h;
  const inv2 = 15; // 2^-1 mod29
  return [
    ((h0+h3)*inv2)%MOD,
    ((h1+h2)*inv2)%MOD,
    ((h2-h1+MOD)*inv2)%MOD,
    ((h3-h0+MOD)*inv2)%MOD
  ];
}

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const master = fs.readFileSync(path.join(root,'resources','transcriptions','liber_primus_master.txt'),'utf8');
const runeValue = new Map(corpus.runes.map((r,i)=>[r,i]));

const segments = master.split('%').slice(16, 74);
assert.equal(segments.length, 58);

function pageWords(page) {
  let offset = 0;
  const words = [];
  for (const raw of segments[page].replaceAll('/','').split(/[-.&$§]/)) {
    const inds = [...raw].filter((ch)=>runeValue.has(ch)).map((ch)=>runeValue.get(ch));
    if (!inds.length) continue;
    words.push({
      start: offset,
      len: inds.length,
      sum: inds.reduce((a,b)=>a+b,0),
      inds
    });
    offset += inds.length;
  }
  assert.equal(offset, corpus.pages[page].runic_count);
  return words;
}

for (let p=0; p<58; p++) pageWords(p);

const p25Object = corpus.pages[25].indices.slice(144,150);
assert.deepEqual(p25Object, [18,3,20,10,11,16]);
assert.deepEqual(
  [(p25Object[0]-p25Object[5]+MOD)%MOD,(p25Object[0]+p25Object[5])%MOD],
  [2,5]
);

const e = 3;
const reciprocalExponent = 27;
const transformed = [
  modPow(p25Object[0], e, MOD),
  ...p25Object.slice(1).map((x)=>modPow(x, reciprocalExponent, MOD))
];
assert.deepEqual(transformed, [3,10,16,3,8,20]);

const cuts = [];
for (let cut=1; cut<transformed.length; cut++) {
  cuts.push([
    transformed.slice(0,cut).reduce((a,b)=>a+b,0),
    transformed.slice(cut).reduce((a,b)=>a+b,0)
  ]);
}
assert.deepEqual(cuts, [[3,57],[13,47],[29,31],[32,28],[40,20]]);
assert.deepEqual(cuts[4], [40,20]);

const targetStates = new Map([
  [3,  {word:'LIES',      gp:[20,10,18,15]}],
  [13, {word:'WAY',       gp:[7,24,26]}],
  [20, {word:'MEANING',   gp:[19,18,24,9,10,21]}],
  [28, {word:'THE',       gp:[2,18]}],
  [29, {word:'DIRECTION', gp:[23,10,4,18,5,16,10,3,9]}],
  [31, {word:'AND',       gp:[24,9,23]}],
  [32, {word:'YOU',       gp:[26,3,1]}],
  [40, {word:'PATHS',     gp:[13,24,2,15]}]
]);

const inRange = [...new Set(cuts.flat().filter((x)=>targetStates.has(x)))].sort((a,b)=>a-b);
assert.deepEqual(inRange, [3,13,20,28,29,31,32,40]);

const receiverRows = [];
for (const n of inRange) {
  const target = targetStates.get(n);
  const len = target.gp.length;
  const sum = target.gp.reduce((a,b)=>a+b,0);
  const matches = pageWords(n).filter((w)=>w.len===len && w.sum===sum);
  receiverRows.push({index:n,word:target.word,len,sum,matches});
}

const hits = receiverRows.filter((r)=>r.matches.length>0);
assert.equal(hits.length,1);
assert.equal(hits[0].index,40);
assert.equal(hits[0].word,'PATHS');
assert.equal(hits[0].matches.length,1);
assert.deepEqual(hits[0].matches[0],{
  start:71,
  len:4,
  sum:54,
  inds:[4,15,14,21]
});

const p = 23;
const g = 5;
const A = 8;
const inverseG = modPow(g,p-2,p);
assert.equal(inverseG,14);
assert.equal(inverseG*g - e*p,1);

const shell = [inverseG,A,e,(MOD-e)%MOD];
assert.deepEqual(shell,[14,8,3,26]);

const key = H4Inv(shell);
assert.deepEqual(key,[20,20,12,6]);
assert.deepEqual(H4(key),shell);

const cipher = hits[0].matches[0].inds;
const plain = cipher.map((x,i)=>(x-key[i]+MOD)%MOD);
assert.deepEqual(plain,targetStates.get(40).gp);
assert.deepEqual(plain,[13,24,2,15]);

const replay = plain.map((x,i)=>(x+key[i])%MOD);
assert.deepEqual(replay,cipher);

console.log('P25 -> PATHS40 direct consumer witness');
console.log('p25 source object:', p25Object);
console.log('transformed:', transformed);
console.log('all cut sums:', cuts);
console.log('same-index candidate rows:');
for (const row of receiverRows) {
  console.log(row.index, row.word, 'state', [row.len,row.sum], 'matches', row.matches.length,
    row.matches.map((m)=>({start:m.start,inds:m.inds})));
}
console.log('selected shell:', shell);
console.log('H^-1 shell key:', key);
console.log('p40 cipher:', cipher);
console.log('plaintext GP:', plain, '= PATHS');
console.log('forward replay:', replay);
console.log('PASS');
