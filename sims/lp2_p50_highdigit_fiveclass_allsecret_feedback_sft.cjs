'use strict';

/**
 * Original p50 leading-digit five-class all-secret GP29 feedback gate.
 * Node.js 22, Windows-safe CommonJS, read-only and dependency-free.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const table = grid.pages.flatMap(p => p.tokens);
assert.equal(table.length, 256);
assert.equal(pages.reduce((n,p) => n+p.indices.length, 0), 12956);
assert.deepEqual([...new Set(table.map(token => Number(token[0])))].sort(), [0,1,2,3,4]);

// The p50 clock is global. Page-start cipher runes have independent IVs.
const input = [];
let offset = 0;
for (const page of pages) {
  for (let local = 1; local < page.indices.length; local++) {
    const index = offset + local;
    const high = Number(table[(index-1) % 256][0]);
    input.push({index, high, delta:(page.indices[local]-page.indices[local-1]+29)%29});
  }
  offset += page.indices.length;
}
assert.equal(input.length, 12901);

/** Key-independent per-class repeat-collision score. */
function classScore(readSymbol) {
  const bins = Array.from({length:5},()=>Array(29).fill(0));
  for (const event of input) bins[event.high][readSymbol(event)]++;
  const rows = bins.map(count => {
    const n = count.reduce((a,b)=>a+b,0);
    const ioc = count.reduce((sum,v)=>sum+v*(v-1),0)/(n*(n-1));
    return {n,ioc,zero:count[0]};
  });
  return {rows,weighted: rows.reduce((s,row)=>s+row.n/input.length*row.ioc,0)};
}
const original = classScore(e => e.delta);
assert.deepEqual(original.rows.map(x=>x.n), [3025,2926,3270,2825,855]);
assert.deepEqual(original.rows.map(x=>x.zero), [33,12,17,19,5]);
assert(original.rows.every(x=>x.ioc>0.0349&&x.ioc<0.0356));
assert(original.weighted>0.0353&&original.weighted<0.0354);

// Exact authentic Cicada plaintext glyph spellings, preserving 29-rune order.
const glyphs = solved.runes;
const native = solved.sections.flatMap(section => Array.from(section.source_text)
  .filter(ch => glyphs.includes(ch)).map(ch => glyphs.indexOf(ch)));
assert.equal(native.length, 2979);
let minimum = Infinity, maximum = -Infinity, first = null;
for (let shift=0; shift<29; shift++) {
  const result = classScore(event=>native[(event.index+shift)%native.length]);
  minimum = Math.min(minimum,result.weighted);
  maximum = Math.max(maximum,result.weighted);
  if(shift===0) first=result;
  assert(result.weighted>0.06);
  assert(result.rows.every(row=>row.ioc>0.052));
}

// A real causal forward ciphertext chain with five arbitrary *secret*
// permutations (these affines are just five concrete planted examples).
// It must recover every exact native rune and preserve each class IoC.
const a=[1,3,5,7,11], b=[2,8,13,19,23];
const reverse=a.map(v=>Array.from({length:29},(_,i)=>i).find(t=>(v*t)%29===1));
assert(reverse.every(x=>x!==undefined));
let position=0, restored=0;
const plant = new Map();
for(const page of pages){
  let c=page.indices[0];
  position++;
  for(let local=1;local<page.indices.length;local++){
    const h=Number(table[(position-1)%256][0]);
    const plain=native[position%native.length];
    const step=(a[h]*plain+b[h])%29;
    const next=(c+step)%29;
    const retrieved=((reverse[h]*((next-c-b[h]+58)%29))%29+29)%29;
    assert.equal(retrieved,plain);
    plant.set(position,step);
    c=next;
    position++;
    restored++;
  }
}
assert.equal(position,12956);
assert.equal(restored,12901);
assert.equal(plant.size,12901);
const planted = classScore(event=>plant.get(event.index));
assert(Math.abs(planted.weighted-first.weighted)<1e-14);
assert(planted.rows.every((v,i)=>Math.abs(v.ioc-first.rows[i].ioc)<1e-14));

console.log(JSON.stringify({
  status:'PASS',model:'delta_i = secret_permutation[printed_highdigit_h](P_i)',
  source:'original GP29 p0..55; p50 phase0 high digits; exact 2979 solved Cicada runes',
  sourceCipherRunes:12956,transitions:12901,
  originalClassSizes:original.rows.map(row=>row.n),
  originalClassIoC:original.rows.map(row=>Number(row.ioc.toFixed(9))),
  originalWeightedIoC:original.weighted,
  solvedNative29OffsetMin:minimum,solvedNative29OffsetMax:maximum,
  plantedSecretMaps:5,plantedExactRecovered:restored,
  plantedWeightedIoC:planted.weighted,
  conclusion:'No possible private fixed permutation of GP29 in each of the five high-digit states changes the original class IoC. All tested source-native GP English registers have much higher class IoC; no original plaintext recovered.'
},null,2));
