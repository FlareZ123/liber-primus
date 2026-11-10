'use strict';

/**
 * The corrected LP2 red-ink page-headings are source-defined periodic pads.
 * For each of nine independent title-bearing original pages, derive a pad
 * solely from its printed red runes, and optimize an arbitrary shared outer
 * 29-rune substitution on the first six headings. Keep three later pages
 * completely held out. This is a 29! alphabet search by exact Hungarian fit.
 *
 * Contrasts actual ciphertext with planted GP English, unknown sigma.
 *
 * Run: node sims/red_header_outer_alphabet_holdout.cjs
 * @module red_header_outer_alphabet_holdout
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {inferAlphabet,shuffledPermutation,seededRandom} =
  require('./outer_permutation_assignment.cjs');
const {encode} = require('./orbit_phase_vote_recovery.cjs');

const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const META=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const INK=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const SOURCE=read('resources/control/shakespeare_first300k.txt');
const N=29, NUM_TRAIN=6;
const PAGES=[0,3,8,15,23,27,33,40,54];
const RUNE=new Map(META.runes.map((s,i)=>[s,i]));
const english=(SOURCE.toUpperCase().match(/[A-Z]+/g)||[])
  .map(encode).filter(Boolean).flat();
const TRAIN=english.slice(0,160000);
const positivePlain=english.slice(160000,160000+1905);
assert.equal(positivePlain.length,1905);

const counts=Array(N).fill(.5);
for(const index of TRAIN)counts[index]++;
const sum=counts.reduce((a,b)=>a+b);
const prior=counts.map(x=>x/sum);
const logPrior=prior.map(Math.log);
const mod=x=>((x%N)+N)%N;

/**
 * Source data carries physical page offsets, separate from transcript
 * page-segment indices. Red spans are validated on exact GP rune values.
 * @returns {{page:number,red:number[],cipher:number[]}[]}
 */
function sourceSites() {
  const sites=INK.pages.flatMap(record=>(record.red_spans||[])
    .filter(span=>span.start===0 && record.page<56)
    .map(span=>{
      const page=META.pages.find(x=>x.page===record.page);
      const red=[...span.runes].map(rune=>RUNE.get(rune));
      assert.equal(red.length,span.length);
      assert.deepEqual(page.indices.slice(0,span.length),red);
      return {page:record.page,red,cipher:page.indices.slice(span.length)};
    })).filter(x=>x.cipher.length>=50);
  assert.deepEqual(sites.map(x=>x.page),PAGES);
  assert.equal(sites.reduce((n,x)=>n+x.cipher.length,0),1905);
  return sites;
}

/** @param {{red:number[]}} site @param {number} i
 * @param {{type:string,sign:number,reverse:boolean,phase:number}} c */
function digit(site,i,c) {
  const position=(i+c.phase)%site.red.length;
  const label=site.red[c.reverse?site.red.length-1-position:position];
  const key=c.type==='index'?label:
    c.type==='prime'?META.prime[label]%29:mod(label+i);
  return mod(c.sign*key);
}

/** @param {{cipher:number[]}[]} sites
 * @param {object} config
 */
function flattened(sites,config) {
  const c=[],k=[];
  for(const site of sites) for(let i=0;i<site.cipher.length;i++) {
    c.push(site.cipher[i]);k.push(digit(site,i,config));
  }
  return {c,k};
}

/** @param {{cipher:number[]}[]} sites
 * @param {number[]} inverse @param {object} config */
function score(sites,inverse,config) {
  const {c,k}=flattened(sites,config);
  let likelihood=0;
  for(let i=0;i<c.length;i++)
    likelihood+=logPrior[mod(inverse[c[i]]-k[i])];
  return likelihood/c.length;
}

/**
 * Simultaneously fit a single arbitrary outer alphabet from six genuine
 * source pages and evaluate on three completely different source pages.
 */
function screen(sites) {
  const train=sites.slice(0,NUM_TRAIN), holdout=sites.slice(NUM_TRAIN);
  const tested=[];
  for(const type of ['index','prime','progress'])
    for(const sign of [-1,1])
      for(const reverse of [false,true])
        for(const phase of [0,1]) {
          const cfg={type,sign,reverse,phase};
          const {c,k}=flattened(train,cfg);
          const g=inferAlphabet(c,k,prior).inverse;
          tested.push({...cfg,trainingLL:score(train,g,cfg),
            heldoutLL:score(holdout,g,cfg), inverse:g});
        }
  tested.sort((a,b)=>b.heldoutLL-a.heldoutLL);
  return tested;
}

/**
 * Plant an independently fixed GP text under unknown 29-symbol outer sigma
 * and a heading-derived pad. Same sigma and source-use rule on all nine
 * pages. The source text was not used in the 160k-symbol language prior.
 * @param {{red:number[],cipher:number[]}[]} sites
 * @returns {{sites:object[],inverse:number[],samplePerRune:number}}
 */
function planted(sites) {
  const cfg={type:'index',sign:1,reverse:false,phase:0};
  const random=seededRandom(0x20113301);
  const sigma=shuffledPermutation([...Array(N).keys()],random);
  const inverse=sigma.map((_,i)=>sigma.indexOf(i));
  let cursor=0;
  const encrypted=sites.map(site=>{
    const cipher=site.cipher.map((_,i)=>{
      const p=positivePlain[cursor++];
      return sigma[mod(p+digit(site,i,cfg))];
    });
    return {...site,cipher};
  });
  assert.equal(cursor,1905);
  const samplePerRune=positivePlain.slice(1255)
    .reduce((s,p)=>s+logPrior[p],0)/650;
  return {sites:encrypted,inverse,samplePerRune,model:cfg};
}

function run() {
  const source=sourceSites();
  const actual=screen(source);
  const control=planted(source);
  const plantedModels=screen(control.sites);
  const best=plantedModels[0];
  assert.equal(plantedModels.length,24);
  assert.deepEqual({type:best.type,sign:best.sign,
    reverse:best.reverse,phase:best.phase}, control.model);
  assert.ok(best.heldoutLL> -3.5);
  assert.ok(actual[0].heldoutLL< -3.9);
  return {
    sourceInput:{physicalPages:PAGES,train:PAGES.slice(0,6),
      holdout:PAGES.slice(6),trainingRunes:1255,heldoutRunes:650},
    candidateCount:actual.length,
    actualBest:actual.slice(0,8).map(x=>({
      type:x.type,sign:x.sign,reverse:x.reverse,phase:x.phase,
      trainingLL:x.trainingLL,heldoutLL:x.heldoutLL
    })),
    plantedBest:plantedModels.slice(0,3).map(x=>({
      type:x.type,sign:x.sign,reverse:x.reverse,phase:x.phase,
      trainingLL:x.trainingLL,heldoutLL:x.heldoutLL
    })),
    plantedTrueOuterAlphabetMatches:best.inverse.filter(
      (v,i)=>v===control.inverse[i]).length,
    plantedTruePlaintextHeldoutLL:control.samplePerRune,
    interpretation:'The fixed red-heading pad with one unknown shared 29-rune outer alphabet is rejected by three unfitted original ink-selected pages in this 48-model family. No ciphertext key recovered.'
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={sourceSites,digit,flattened,score,screen,planted,run};
