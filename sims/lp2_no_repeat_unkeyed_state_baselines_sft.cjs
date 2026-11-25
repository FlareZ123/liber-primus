#!/usr/bin/env node
'use strict';

// Frozen zero-key baselines for the 29-state / 28-successor hypothesis.
// These are deliberately the simplest possible finite-state receivers:
// (1) cumulative additive feedback, inverted by first difference;
// (2) delete-the-previous-symbol rank in ascending or descending GP29 order.
// The first source rune is the unkeyed state seed.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const cipher = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const alphabet = corpus.translit;
assert.equal(cipher.length, 12956);

function mod29(x) { return (x % 29 + 29) % 29; }
function deltaDecode(c, sign) {
  return [c[0], ...c.slice(1).map((x, i) => sign === 1
    ? mod29(x - c[i])
    : mod29(c[i] - x))];
}
function rankDecode(c, descending) {
  const p = [c[0]];
  for (let i = 1; i < c.length; i++) {
    const prev = c[i - 1], cur = c[i];
    if (cur === prev) { p.push(0); continue; }
    const rank = descending
      ? Array.from({length:29}, (_,k)=>28-k).filter(x=>x!==prev).indexOf(cur)
      : (cur < prev ? cur : cur - 1);
    p.push(rank + 1);
  }
  return p;
}
function histogram(a) {
  const h = Array(29).fill(0);
  for (const x of a) h[x]++;
  return h;
}
function metrics(a) {
  const h = histogram(a), n = a.length, non = h.slice(1), nn = n - h[0];
  return {
    forced_F: h[0],
    ioc: h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),
    nonF_chi2_uniform28: non.reduce((s,x)=>s+(x-nn/28)**2/(nn/28),0),
    nonF_min: Math.min(...non),
    nonF_max: Math.max(...non),
    nonF_counts: non
  };
}
function encodeDelta(p, seed) {
  const c=[seed];
  for(let i=1;i<p.length;i++) c.push(mod29(c[i-1]+p[i]));
  return c;
}
function encodeRank(p, seed, descending) {
  const c=[seed];
  for(let i=1;i<p.length;i++){
    if(p[i]===0){c.push(c[i-1]);continue;}
    const prev=c[i-1],r=p[i]-1;
    const allowed=Array.from({length:29},(_,k)=>descending?28-k:k).filter(x=>x!==prev);
    c.push(allowed[r]);
  }
  return c;
}

// Deterministic positive controls: all three frozen inverses recover exact plants.
let seed=0x3301;
function rand29(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29;}
for(let k=0;k<8;k++){
  const plant=Array.from({length:512},rand29), initial=rand29();
  const cd=encodeDelta(plant,initial);
  assert.deepEqual(deltaDecode(cd,1).slice(1),plant.slice(1));
  const ca=encodeRank(plant,initial,false);
  assert.deepEqual(rankDecode(ca,false).slice(1),plant.slice(1));
  const cr=encodeRank(plant,initial,true);
  assert.deepEqual(rankDecode(cr,true).slice(1),plant.slice(1));
}

const models = {
  cumulative_additive_plus: deltaDecode(cipher,1),
  cumulative_additive_minus: deltaDecode(cipher,-1),
  rank28_ascending: rankDecode(cipher,false),
  rank28_descending: rankDecode(cipher,true)
};
const result={source_runes:cipher.length,adjacent_repeats:cipher.slice(1).filter((x,i)=>x===cipher[i]).length,
  uniform_IoC_28:1/28,uniform_IoC_29:1/29,
  controls:{eight_512_symbol_plants_per_receiver_roundtrip:true},
  models:Object.fromEntries(Object.entries(models).map(([name,p])=>[name,{
    ...metrics(p),prefix:p.slice(0,100).map(x=>alphabet[x]).join('')
  }]))};
console.log(JSON.stringify(result,null,2));
