"use strict";
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const mod = x => (x % 29 + 29) % 29;
const inv2 = 15;
const T = corpus.translit;
const p2 = corpus.pages.find(page => page.page === 2).indices;

function keyFrom(outerSum, outerDiff, innerSum, innerDiff) {
  return [
    mod((outerSum + outerDiff) * inv2),
    mod((innerSum + innerDiff) * inv2),
    mod((innerSum - innerDiff) * inv2),
    mod((outerSum - outerDiff) * inv2),
  ];
}
function permutations(values) {
  if (values.length === 1) return [values];
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    for (const tail of permutations(values.slice(0,i).concat(values.slice(i+1)))) {
      out.push([values[i], ...tail]);
    }
  }
  return out;
}

const K = 2;
const NG = 21;
const vertical = 4;
const modulus = 23;
const key = keyFrom(-K, NG, vertical, modulus);
assert.deepEqual(key, [24,28,5,3]);
assert.deepEqual(key.map(i => T[i]), ["A","EA","C","O"]);

const cipher = p2.slice(36,40);
assert.deepEqual(cipher, [1,2,8,26]);
const plain = cipher.map((value,i) => mod(value-key[i]));
assert.deepEqual(plain, [6,3,3,23]);
assert.deepEqual(plain.map(i => T[i]), ["G","O","O","D"]);
assert.deepEqual(plain.map((value,i) => mod(value+key[i])), cipher);

assert.deepEqual({
  outerSum: mod(key[0]+key[3]),
  outerDiff: mod(key[0]-key[3]),
  innerSum: mod(key[1]+key[2]),
  innerDiff: mod(key[1]-key[2]),
}, {outerSum:27,outerDiff:21,innerSum:4,innerDiff:23});

const restricted = [K,NG,vertical,modulus];
let restrictedTotal = 0;
const restrictedHits = [];
for (const values of permutations(restricted)) {
  for (let mask=0; mask<16; mask+=1) {
    const signed=values.map((v,i)=>((mask>>i)&1)?-v:v);
    restrictedTotal += 1;
    const candidate=keyFrom(...signed);
    const decoded=cipher.map((value,i)=>mod(value-candidate[i]));
    if (decoded.every((value,i)=>value===plain[i])) {
      restrictedHits.push({values,signed,key:candidate});
    }
  }
}
assert.equal(restrictedTotal,384);
assert.deepEqual(restrictedHits,[{
  values:[2,21,4,23],
  signed:[-2,21,4,23],
  key:[24,28,5,3],
}]);

const expanded=[2,3,4,5,6,8,12,15,19,21,23];
let expandedTotal=0;
const expandedHits=[];
for(let a=0;a<expanded.length;a++)for(let b=0;b<expanded.length;b++)if(b!==a)
for(let c=0;c<expanded.length;c++)if(c!==a&&c!==b)
for(let d=0;d<expanded.length;d++)if(d!==a&&d!==b&&d!==c){
  const values=[expanded[a],expanded[b],expanded[c],expanded[d]];
  for(let mask=0;mask<16;mask+=1){
    const signed=values.map((v,i)=>((mask>>i)&1)?-v:v);
    expandedTotal += 1;
    const candidate=keyFrom(...signed);
    const decoded=cipher.map((value,i)=>mod(value-candidate[i]));
    if(decoded.every((value,i)=>value===plain[i]))expandedHits.push({values,signed});
  }
}
assert.equal(expandedTotal,126720);
assert.equal(expandedHits.length,4);
assert.deepEqual(
  expandedHits.map(hit=>hit.signed),
  [
    [-2,-8,4,-6],
    [-2,-8,4,23],
    [-2,21,4,-6],
    [-2,21,4,23],
  ]
);

console.log(JSON.stringify({
  classification:"exact reversible p2 GOOD candidate with post-hoc slot assignment",
  sourceState:{K,NG,vertical,modulus},
  pairEquations:{outerSum:-K,outerDiff:NG,innerSum:vertical,innerDiff:modulus},
  key:key.map(i=>({index:i,rune:T[i]})),
  ciphertext:cipher.map(i=>T[i]),
  plaintext:plain.map(i=>T[i]),
  restrictedAudit:{assignments:restrictedTotal,hits:restrictedHits.length},
  expandedAudit:{assignments:expandedTotal,hits:expandedHits.length},
  decision:"exact local inverse; hold below authenticated plaintext until slot ordering is source-selected or predicts a fresh holdout",
},null,2));
