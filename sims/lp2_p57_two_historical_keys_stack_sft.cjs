#!/usr/bin/env node
'use strict';

/**
 * Direct p57 PARABLE key-phrase instruction:
 * "shed our own circumferences, find the divinity within".
 * The two nouns are original LP1 solved Vigenere keys:
 * outer FIRFUMFERENFE, inner DIVINITY.
 *
 * Fully invertible forward encryption, with original literal-F-transparent
 * rule in EACH layer. Exact inverse DP handles ambiguous F collisions.
 * Both historically defined key orders, every 13x8 phase pair, fixed
 * nine original unknown LP2 visual chapters. Never language-rank survivors.
 *
 * Run on Windows Node 22:
 * node sims/lp2_p57_two_historical_keys_stack_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.resolve(
  __dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
assert.equal(corpus.runes.length,29);
const KDIV=Object.freeze([23,10,1,10,9,10,16,26]);
const KCIRC=Object.freeze([0,10,4,0,1,19,0,18,4,18,9,0,18]);
const mod29=x=>(x%29+29)%29;

/**
 * Authenticated LP1+p56 literal-plaintext-F transparency: F=0 emits zero
 * and consumes NO key; any other value is shifted and consumes key.
 * @param {number[]} values
 * @param {readonly number[]} key
 * @param {number} phase
 * @returns {number[]}
 */
function encrypt(values,key,phase=0) {
  let used=phase;
  return values.map(v=>v===0?0:mod29(v+key[(used++)%key.length]));
}
/**
 * Exhaustive possible F-skip state histories for the declared two-key stack,
 * retaining only live key-phase pairs. No plaintext dictionary is needed
 * to prove whether a complete legal inverse exists.
 * @param {number[]} values Original ciphertext
 * @param {readonly number[]} innerKey
 * @param {readonly number[]} outerKey
 * @param {number} innerPhase
 * @param {number} outerPhase
 * @returns {number} Length of furthest legal prefix
 */
function furthest(values,innerKey,outerKey,innerPhase,outerPhase) {
  const M=outerKey.length,N=innerKey.length;
  let states=[innerPhase*M+outerPhase];
  for(let i=0;i<values.length;i++) {
    const c=values[i],next=[],seen=new Uint8Array(M*N);
    for(const id of states) {
      const a=Math.floor(id/M),b=id%M;
      // Outer layer: a literal intermediate F may bypass key, but
      // a nonzero intermediate may separately encrypt to ciphertext F.
      const mids=c===0?[[0,b]]:[];
      const v=mod29(c-outerKey[b]);
      if(v!==0)mids.push([v,(b+1)%M]);
      for(const [intermediate,b1] of mids) {
        const plains=intermediate===0?[[0,a]]:[];
        const p=mod29(intermediate-innerKey[a]);
        if(p!==0)plains.push([p,(a+1)%N]);
        for(const [,a1] of plains) {
          const st=a1*M+b1;
          if(!seen[st]) {
            seen[st]=1;
            next.push(st);
          }
        }
      }
    }
    if(!next.length)return i;
    states=next;
  }
  return values.length;
}
// Native solved-page positive: the 95 original readable p57 GP runes are
// fully encoded through BOTH historical keys, then legally recovered.
const positive=corpus.pages[57].indices;
assert.equal(positive.length,95);
for(const [inner,outer] of [[KDIV,KCIRC],[KCIRC,KDIV]]) {
  const cipher=encrypt(encrypt(positive,inner),outer);
  assert.equal(cipher.length,95);
  assert.equal(furthest(cipher,inner,outer,0,0),95);
}
let total=0;
const expected={
  'circumference-outer':[
    [5,155],[23,116],[1,95],[12,79],[10,74],
    [33,122],[0,148],[67,67],[36,114]
  ],
  'divinity-outer':[
    [37,41],[23,73],[1,125],[10,91],[10,29],
    [104,133],[0,93],[60,110],[36,38]
  ]
};
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],
                [27,32],[33,39],[40,53],[54,55]];
const report=[];
for(const [part,[first,last]] of chapters.entries()) {
  const cipher=corpus.pages.slice(first,last+1).flatMap(p=>p.indices);
  const row={chapter:'pp'+first+'-'+last,runes:cipher.length};
  total+=cipher.length;
  for(const [name,inner,outer] of [
    ['circumference-outer',KDIV,KCIRC],
    ['divinity-outer',KCIRC,KDIV]
  ]) {
    const atSourcePhase=furthest(cipher,inner,outer,0,0);
    let longest=0,survivingPhases=[];
    for(let a=0;a<inner.length;a++)
      for(let b=0;b<outer.length;b++) {
        const reached=furthest(cipher,inner,outer,a,b);
        longest=Math.max(longest,reached);
        if(reached===cipher.length)survivingPhases.push([a,b]);
      }
    assert.deepEqual([atSourcePhase,longest],expected[name][part],
      'All-original fixed-phase result '+row.chapter+' '+name);
    assert.deepEqual(survivingPhases,[]);
    row[name]={fixedPhase00Reach:atSourcePhase,
      maximumLegalPrefixAcrossAll104Phases:longest,
      survivingPhasePairs:survivingPhases.length};
  }
  report.push(row);
}
assert.equal(total,12956);
assert.deepEqual(corpus.pages.slice(0,56).map(p=>p.runic_count).reduce(
  (a,b)=>a+b),12956);
console.log(JSON.stringify({
  hypothesis:'p57 circumferences / divinity = original LP1 outer/inner keys',
  sourceKeys:'FIRFUMFERENFE (13) and DIVINITY (8), historical GP rune indices',
  nativeControl:'95 original clear p57 runes survived both actual two-key encryptions and exact F-transparent inverse',
  original: 'All 12956 unsolved original LP2 runes across 9 visual chapters',
  phasePairsPerChapterAndOrder:104,
  fullChapterSurvivors:0,
  chapters:report,
  decision:'Both fixed historical-key cascades are impossible on every full original chapter, even after 104 starting key-phase choices, under authentic F-skip semantics. Other unselected operations remain outside scope.'
},null,2));
