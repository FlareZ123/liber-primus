#!/usr/bin/env node
"use strict";

/**
 * Complete original source N9 characteristic-polynomial all-secret inversion.
 * Node.js 22 / Windows CommonJS, read-only, no tunable parameters.
 *
 * N9(X) = X^9+12X^8+20X^7+10X^6+5X^5+9X^3+15X+11,
 * independently factored from the original 256-cell p50 polynomial.
 *
 * Test authentic source N9 and its normalized monic GF29 reciprocal. A continuous nine-register
 * GP29 additive key has ANY 29^9 initial state; allow an additional
 * entirely unknown stationary permutation of the 29-rune alphabet.
 * The original 83 one-rune printed words must map to <=3 intermediate
 * identities (A, I, and the generously allowed English exclamation O).
 * The exact rank-deficient GF29 elimination branches over all canonical
 * three-label partitions, never samples key states or guesses plaintext.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const parsed = parseSharedCorpus();
const source = gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const singleton = [];
let cursor = 0;
for (const word of parsed.words) {
  if (word.length === 1) singleton.push({position:cursor,
    value:byRune.get(word.runes)});
  cursor += word.length;
}
assert.deepEqual([cursor, parsed.words.length, singleton.length], [12956,2896,83]);
for (const s of singleton) assert.equal(source[s.position], s.value);
const MOD = 29;
const N9 = [11,15,0,9,1,5,10,20,12];
// Prove the corrected N9 coefficient vector divides the unchanged table
// in original descending orientation, independent of plaintext controls.
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-grid-256.json"),"utf8")).bytes;
const originalFactor=[...N9,1];
const modSource = n => (n%29+29)%29;
const remainder=grid.map(modSource).reverse();
for(let i=remainder.length-1;i>=9;i--){
  const q=remainder[i];
  for(let j=0;j<10;j++)remainder[i-9+j]=modSource(remainder[i-9+j]-q*originalFactor[j]);
}
assert.deepEqual(remainder.slice(0,9),Array(9).fill(0));
const ORDER = 9;
const VARIABLES = 12;

const inv = Array(MOD).fill(0);
for (let x = 1; x < MOD; x++) {
  for (let y = 1; y < MOD; y++) if (x*y%MOD === 1) inv[x]=y;
  assert.ok(inv[x]);
}
/** @param {number} x @returns {number} */
function mod(x) { return (x % MOD + MOD) % MOD; }

/**
 * Compute all nine coefficient-row coordinates of the clocked key.
 * @param {number[]} coefs Ascending characteristic coefficients.
 * @param {{position:number,value:number}[]} sites
 * @returns {number[][]}
 */
function rowsFor(coefs, sites) {
  assert.ok(sites.every((s)=>s.position >= ORDER));
  const hist=Array.from({length:ORDER},(_,i)=>
    Array.from({length:ORDER},(_,j)=>i===j?1:0));
  const rows = [];
  let nextSite=0;
  for(let i=ORDER;i<=sites[sites.length-1].position;i++) {
    const next=Array(ORDER).fill(0);
    for(let j=0;j<ORDER;j++)
      for(let k=0;k<ORDER;k++)
        next[j]=mod(next[j]-coefs[k]*hist[k][j]);
    for(let k=0;k<ORDER-1;k++) hist[k]=hist[k+1];
    hist[ORDER-1]=next;
    if(i===sites[nextSite].position) {
      rows.push(next);
      nextSite++;
      if(nextSite===sites.length) break;
    }
  }
  assert.equal(rows.length,sites.length);
  return rows;
}

/**
 * Add a source-singleton equation row dot seed + unknownLabel = observed.
 * A consistent singular system is preserved, with all 29-valued free
 * variables still unconstrained and thus implicitly enumerated.
 * @param {(number[]|null)[]} basis
 * @param {number[]} row
 * @param {number} label
 * @param {number} observed
 * @returns {(number[]|null)[]|null}
 */
function extend(basis,row,label,observed) {
  const eq=[...row,0,0,0,observed];
  eq[ORDER+label]=1;
  for(let col=0;col<VARIABLES;col++) {
    if(!eq[col])continue;
    const known=basis[col];
    if(known) {
      const k=eq[col];
      for(let j=col;j<=VARIABLES;j++)eq[j]=mod(eq[j]-k*known[j]);
    } else {
      const k=inv[eq[col]];
      for(let j=col;j<=VARIABLES;j++)eq[j]=(eq[j]*k)%MOD;
      const next=basis.slice();
      next[col]=eq;
      return next;
    }
  }
  return eq[VARIABLES]===0?basis:null;
}

/**
 * Canonical set partitions of singleton outputs, <=3 labels. Allows every
 * independent original secret key, with no dependence on key entropy size.
 * @param {number[][]} rows
 * @param {{position:number,value:number}[]} sites
 */
function solve(rows,sites) {
  let nodes=0,solutions=0,maxPrefix=0;
  /** @param {number} i @param {number} n @param {(number[]|null)[]} basis */
  function recurse(i,n,basis) {
    nodes++;
    if(i>maxPrefix) maxPrefix=i;
    if(i===sites.length) {solutions++;return;}
    for(let lab=0;lab<=n&&lab<3;lab++) {
      const next=extend(basis,rows[i],lab,sites[i].value);
      if(next) recurse(i+1,Math.max(n,lab+1),next);
    }
  }
  recurse(0,0,Array(VARIABLES).fill(null));
  return {nodes,solutions,maxPrefix};
}

/** Read source-native GP29 words, retaining all original layout lengths. */
function plantNative() {
  const original=encodeWords(fs.readFileSync(
    path.join(ROOT,"resources/control/gibran_prophet_58585.txt"),"utf8"));
  const groups=new Map();
  for(const word of original) {
    if(!groups.has(word.length))groups.set(word.length,[]);
    groups.get(word.length).push(word);
  }
  const seen=new Map();
  const words=parsed.words.map((w)=>{
    const arr=groups.get(w.length);
    assert.ok(arr?.length,"No source-native word length "+w.length);
    const n=seen.get(w.length)||0;
    seen.set(w.length,n+1);
    return arr[n%arr.length];
  });
  const plain=words.flat();
  assert.equal(plain.length,12956);
  return plain;
}

function main(){
  const output={model:"Original p50 N9/normalized reciprocal, arbitrary nine-symbol seed, secret stationary GP29 alphabet",
    originalRunes:12956,printedWords:2896,singletonWords:83,global:[],chapter15to22:[]};
  const chapterStart=3603,chapterEnd=5506;
  const chapter=singleton.filter(x=>x.position>=chapterStart&&x.position<chapterEnd)
    .map(x=>({position:x.position-chapterStart,value:x.value}));
  assert.equal(chapter.length,18);
  for(const reverse of [false,true]){
    const coeff=reverse?[...N9,1].reverse().slice(0,9).map(x=>mod(8*x)):[...N9];
    const global=solve(rowsFor(coeff,singleton),singleton);
    assert.equal(global.solutions,0);
    assert.equal(global.maxPrefix,17);
    const local=solve(rowsFor(coeff,chapter),chapter);
    assert.equal(local.solutions,0);
    assert.equal(local.maxPrefix,17);
    output.global.push({reverse,...global});
    output.chapter15to22.push({reverse,...local});
  }
  const plain=plantNative();
  const perm=Array.from({length:MOD},(_,i)=>i);
  for(const [a,b] of [[24,17],[10,4],[3,12]]) {
    const temp=perm[a];perm[a]=perm[b];perm[b]=temp;
  }
  assert.equal(new Set(perm).size,MOD);
  const seeds=[1,13,8,5,23,3,19,2,11];
  const key=seeds.slice();
  const encoded=[];
  const coeff=N9;
  for(let i=0;i<plain.length;i++){
    if(i>=ORDER){
      let value=0;
      for(let j=0;j<ORDER;j++) value=mod(value-coeff[j]*key[i-ORDER+j]);
      key[i]=value;
    }
    encoded[i]=(perm[plain[i]]+key[i])%MOD;
    assert.equal(mod(encoded[i]-key[i]),perm[plain[i]]);
  }
  const positiveSites=singleton.slice(0,13).map(({position})=>({position,value:encoded[position]}));
  const positive=solve(rowsFor(N9,positiveSites),positiveSites);
  assert.ok(positive.solutions>0);
  assert.equal(positive.maxPrefix,13);
  output.nativePlant={runes:plain.length,exactRoundtrip:true,
    preservedOriginalWholeWords:true,recoveredSingletonConstraints:13,
    compatibleAssignments:positive.solutions};
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)main();
module.exports={main,rowsFor,extend,solve};
