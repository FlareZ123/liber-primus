"use strict";
/**
 * 2013 PARABLE source root -> conventional 2014 p50 numeric graph -> p55 76-rune gate.
 * Direct cipher receiver is a deliberately frozen hypothesis, not a claimed Cicada opcode.
 * Node22 CommonJS original-input read-only SFT (Windows).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const readJSON = filename => JSON.parse(fs.readFileSync(path.join(root, filename),"utf8"));
const gp = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
const alphabet=grid.alphabet;
const tokens = grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const parent=tokens.map(t=>60*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
assert(parent.every(n=>n>=0 && n<256));

/** @param {number} n @returns {boolean} */
function prime(n) {
  if(n<2)return false;
  for(let i=2;i*i<=n;i++)if(n%i===0)return false;
  return true;
}
/** @param {number} n @returns {number} */
function primeOrdinal(n){
  assert(prime(n));
  let k=0;
  for(let i=2;i<=n;i++)if(prime(i))k++;
  return k;
}
const p57=gp.pages.find(p=>p.page===57),p55=gp.pages.find(p=>p.page===55);
assert(p57&&p55);
assert.equal(p57.indices.length,95);
const parts=[p57.indices.slice(7,37),p57.indices.slice(37,67),p57.indices.slice(67,95)];
const sums=parts.map(w=>w.reduce((s,i)=>s+gp.prime[i],0));
assert.deepEqual(sums,[1259,1031,1229]);
assert.equal(sums.reduce((a,b)=>a*b,1),1595277641);
assert.deepEqual(sums.map(primeOrdinal),[205,173,201]);
assert.deepEqual([parent[201],parent[74],parent[205]],[74,205,76]);
assert.equal(p55.indices.length,76);
assert.equal(parent[205],p55.indices.length);

/** @param {number} x @returns {number} */
const m=x=>((x%29)+29)%29;
/** @param {number[]} x @returns {number} */
function ioc(x) {
  let count=Array(29).fill(0);
  for(const n of x)count[n]++;
  return 29*count.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
const state=[];
let s=201;
for(let i=0;i<76;i++){state.push(s);s=parent[s];}
assert.deepEqual(state.slice(0,14),[201,74,205,76,114,197,115,247,192,0,203,68,199,47]);
const key=state.map(n=>n%29);
const original=p55.indices;
const known=p57.indices.slice(0,76);
const results=[];
for(const sign of [-1,1]){
  const plain=original.map((c,i)=>m(c+sign*key[i]));
  assert.deepEqual(plain.map((p,i)=>m(p-sign*key[i])),original);
  const synthetic=known.map((p,i)=>m(p-sign*key[i]));
  assert.deepEqual(synthetic.map((c,i)=>m(c+sign*key[i])),known);
  const record={sign,normalizedIoc:ioc(plain),transliteration:plain.map(i=>gp.translit[i]).join(""),reencryption:"76/76",independentClearP57Plant:"76/76"};
  results.push(record);
}
assert(Math.abs(ioc(original)-1.0989473684210527)<1e-12);
assert(Math.abs(results[0].normalizedIoc-1.0989473684210527)<1e-12);
assert(Math.abs(results[1].normalizedIoc-0.9157894736842105)<1e-12);
console.log(JSON.stringify({
  status:"PASS",
  historicalNumber:1595277641,
  factorPrimeOrdinals:[205,173,201],
  rootFromThirdOrdinal:201,
  firstSourceState:state.slice(0,14),
  sourceNode205Byte:parent[205],
  sourceP55PhysicalRunes:original.length,
  sourceP55OpeningRuneCarriedFromP54:true,
  moduloProjection:"state address modulo29",
  originalNormalizedIoc:ioc(original),
  results,
  authenticUnknownPlaintextRecovered:false
},null,2));
