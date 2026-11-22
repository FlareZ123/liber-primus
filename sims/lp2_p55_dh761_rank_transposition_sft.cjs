#!/usr/bin/env node
"use strict";

/**
 * One source-selected, invertible consumer for the 2013 DH 76-cycle:
 * rank-order transposition of LP2 p55's 76 original rune positions.
 *
 * Source facts: the historical DH parameters are p=761, g=23; g has exact
 * order 76 modulo 761; LP2 p55 has exactly 76 original runes. The 76 orbit
 * values are distinct, so sorting them induces a unique 76-position
 * permutation. Test its two inverse orientations only; no phase, rotation,
 * fitted offset, or alternate modulus is searched.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { trainNativeGP, languageScore } = require("./historical_solve_path_transfer.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const emerson = read("resources/control/emerson_essays_2944.txt");
const model = trainNativeGP(emerson);
const mod = (n,m)=>((n%m)+m)%m;
const translit = xs => xs.map(i=>corpus.translit[i]).join("");
const ioc = xs => {
  const f=Array(29).fill(0);
  for(const x of xs)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
};

const P=761, G=23, N=76;
const orbit=[];
let x=1;
for(let i=0;i<N;i++){orbit.push(x);x=(x*G)%P;}
assert.equal(x,1,"DH orbit must return to 1 after 76 steps");
assert.equal(new Set(orbit).size,N,"DH orbit must have exact order 76");
const sorted=orbit.slice().sort((a,b)=>a-b);
const rank=new Map(sorted.map((v,i)=>[v,i]));
const permutation=orbit.map(v=>rank.get(v));
assert.equal(new Set(permutation).size,N,"Rank order must be a permutation");
assert.deepEqual([...permutation].sort((a,b)=>a-b),Array.from({length:N},(_,i)=>i));

const p55=corpus.pages.find(p=>p.page===55).indices;
const p57=corpus.pages.find(p=>p.page===57).indices.slice(0,N);
assert.equal(p55.length,N,"LP2 p55 must contain exactly 76 runes");
assert.equal(p57.length,N,"p57 positive-control segment must contain 76 runes");

const scatter=Array(N);
for(let i=0;i<N;i++)scatter[permutation[i]]=p55[i];
const gather=permutation.map(i=>p55[i]);
const controlScatter=Array(N);
for(let i=0;i<N;i++)controlScatter[permutation[i]]=p57[i];
const controlRecovered=permutation.map(i=>controlScatter[i]);
assert.deepEqual(controlRecovered,p57,"Inverse-orientation p57 positive control failed");


const p55Body=p55.slice(1); // omit the inherited first rune completing p54
const bodyOrbit=orbit.slice(1); // start DH exponent at 1 after the page-turn carry
assert.equal(p55Body.length,75);
assert.equal(bodyOrbit.length,75);
assert.equal(new Set(bodyOrbit).size,75);
const bodySorted=bodyOrbit.slice().sort((a,b)=>a-b);
const bodyRank=new Map(bodySorted.map((v,i)=>[v,i]));
const bodyPermutation=bodyOrbit.map(v=>bodyRank.get(v));
assert.equal(new Set(bodyPermutation).size,75);
const bodyScatter=Array(75);
for(let i=0;i<75;i++)bodyScatter[bodyPermutation[i]]=p55Body[i];
const bodyGather=bodyPermutation.map(i=>p55Body[i]);
const p57Body=p57.slice(0,75);
const bodyControlScatter=Array(75);
for(let i=0;i<75;i++)bodyControlScatter[bodyPermutation[i]]=p57Body[i];
assert.deepEqual(bodyPermutation.map(i=>bodyControlScatter[i]),p57Body,
  "75-rune p57 body positive control failed");

const result={
  source:{p:P,g:G,orbitOrder:N,page:"LP2 p55",p55RuneCount:p55.length,
    orbit,rankPermutation:permutation,sortedOrbit:sorted,
    mod76UniqueResidues:new Set(orbit.map(v=>v%76)).size},
  rawP55:{tokens:translit(p55),ioc:ioc(p55),emersonGpLanguageScore:languageScore(p55,model)},
  rankScatter:{tokens:translit(scatter),ioc:ioc(scatter),emersonGpLanguageScore:languageScore(scatter,model)},
  rankGather:{tokens:translit(gather),ioc:ioc(gather),emersonGpLanguageScore:languageScore(gather,model)},
  body75:{sourceRule:"drop inherited leading NG carry; use DH orbit exponents 1..75",
    orbitOrder:bodyOrbit.length,bodyRuneCount:p55Body.length,bodyPermutation,
    raw:{tokens:translit(p55Body),ioc:ioc(p55Body),emersonGpLanguageScore:languageScore(p55Body,model)},
    rankScatter:{tokens:translit(bodyScatter),ioc:ioc(bodyScatter),emersonGpLanguageScore:languageScore(bodyScatter,model)},
    rankGather:{tokens:translit(bodyGather),ioc:ioc(bodyGather),emersonGpLanguageScore:languageScore(bodyGather,model)},
    control:{p57BodyRoundTrip:true,runes:p57Body.length,p57LanguageScore:languageScore(p57Body,model)}},
  control:{p57SegmentRoundTrip:true,runes:p57.length,
    p57LanguageScore:languageScore(p57,model)}
};
console.log(JSON.stringify(result,null,2));

// Trigger the source-fixed DH 76-cycle transposition gate.
