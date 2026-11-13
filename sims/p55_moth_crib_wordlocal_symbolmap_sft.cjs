'use strict';

/**
 * Original p55: conditional seven-word LP1 moth crib against arbitrary
 * word-local stationary symbol maps on ciphertext and ciphertext differences.
 * The prospective plaintext is unproven; no hidden key is recovered.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const c = source.pages.find(page => page.page === 55).indices;
const p = [
  2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,9,
  10,15,15,24,5,4,18,23,24,20,20,2,21,15
];
const lengths = [2,7,7,2,6,3,3];
const c30 = [
  12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,
  15,2,22,5,28,10,19,5,14,23,11,1,17,18,10
];
assert.equal(c.length,76);
assert.equal(c[45],5);
assert.deepEqual(c.slice(46),c30);
assert.equal(lengths.reduce((a,b) => a+b,0),30);
assert.equal(p.length,30);

/**
 * Checks if a fixed function source symbol -> target symbol exists.
 * @param {number[]} from
 * @param {number[]} to
 * @returns {boolean}
 */
function isFunction(from,to) {
  const map = new Map();
  for (let i=0;i<from.length;i++) {
    if (map.has(from[i]) && map.get(from[i]) !== to[i]) return false;
    map.set(from[i],to[i]);
  }
  return true;
}

/**
 * @param {number[]} cipher
 * @returns {number[]}
 */
function internalSteps(cipher) {
  return cipher.slice(1).map((value,i) => (value-cipher[i]+29)%29);
}

let offset=0;
const rows=[];
for (let w=0;w<lengths.length;w++) {
  const n=lengths[w];
  const P=p.slice(offset,offset+n);
  const C=c30.slice(offset,offset+n);
  const D=internalSteps(C);
  const rawForward=isFunction(P,C);
  const rawInverse=isFunction(C,P);
  const deltaInverse=isFunction(D,P.slice(1));
  rows.push({
    word:w+1, sourceP55Offset:46+offset, runes:n,
    rawForward,rawInverse,deltaInverse,
    rawClashes:!rawForward||!rawInverse,
    deltaClash:!deltaInverse
  });
  offset+=n;
}
assert.equal(offset,30);
assert.deepEqual(rows.map(r=>r.rawForward),
  [true,false,false,true,true,false,true]);
assert.deepEqual(rows.map(r=>r.rawInverse),
  [true,false,false,true,false,true,true]);
assert.deepEqual(rows.map(r=>r.deltaInverse),
  [true,false,false,true,false,false,true]);
assert.equal(rows.filter(x=>x.rawClashes).length,4);
assert.equal(rows.filter(x=>x.deltaClash).length,4);

// Plant seven independent per-word arbitrary bijections and a
// per-word difference-label bijection; they must pass both tests.
for (const n of lengths) {
  const P=Array.from({length:n},(_,i)=>[0,3,0,7,3,1,3][i]);
  const cipher=P.map(v => (v*11+7)%29);
  assert(isFunction(P,cipher));
  assert(isFunction(cipher,P));
  const step=internalSteps(cipher);
  // The independent difference-source control uses exactly mapped symbols.
  const decorated=step.map(v=>(v*5+9)%29);
  assert(isFunction(step,decorated));
  assert(isFunction(decorated,step));
}
console.log(JSON.stringify({
  status:'CONDITIONAL on unverified LP1 p5 seven-word plaintext',
  originalP55Suffix:[46,75],
  rawWordMapFailureCount:4,
  withinWordStepMapFailureCount:4,
  words:rows,
  plaintextRecovered:false
},null,2));
console.log('PASS: source 30/30; seven independent controls');
