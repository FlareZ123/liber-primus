'use strict';
/**
 * Source-exact printed-line acrostic inversion challenge.
 * Tests whether the 594 first runes of LP2 printed lines form a second,
 * GP-English message encrypted by a fixed short periodic additive key.
 *
 * The key is fitted on physical pages 0..27, frozen on 28..55;
 * page 50 is runeless. A full-search within-page line-initial permutation
 * null retains every original line-head glyph, every printed page, each
 * page's first line, and the real sequence length. Positive controls
 * encrypt original-register Shakespeare GP text with a known periodic key.
 *
 * Run: node sims/line_initial_acrostic_inverse.cjs [number_of_null_draws]
 * No claimed LP2 plaintext; this is one falsifiable secondary channel.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {load} = require('./physical_layout_keytests.cjs');
const {encode} = require('./word_partition_invariant.cjs');
const MOD = 29;
const MAXPERIOD = 20;
const ROOT = path.resolve(__dirname, '..');
const mod = x => (x % MOD + MOD) % MOD;

/** @typedef {{page:number,head:number[],length:number}} AcrosticPage */
/** @returns {AcrosticPage[]} */
function sourceHeads() {
  let offset = 0;
  const pages = load().map(p => {
    const row={page:p.page, head:p.lines.map(line => line[0]),
      length:p.lines.length, offset};
    offset += row.length;
    return row;
  });
  assert.equal(offset,594);
  return pages;
}

/** @param {number[]} runes */
function counts(runes) {
  const a = Array(MOD).fill(.5);
  for(const p of runes) a[p]++;
  const sum = a.reduce((x,y)=>x+y,0);
  return a.map(v=>Math.log(v/sum));
}

/** @param {number[]} runes */
function transitions(runes) {
  const a = Array.from({length:MOD},()=>Array(MOD).fill(.25));
  for(let i=1;i<runes.length;i++)a[runes[i-1]][runes[i]]++;
  return a.map(row=>{
    const sum = row.reduce((x,y)=>x+y,0);
    return row.map(v=>Math.log(v/sum));
  });
}

/** @returns {{mono:number[],bi:number[][],plant:number[]}} */
function reference() {
  const text=fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8').toUpperCase();
  const words=text.match(/[A-Z]+/g);
  const source=words.flatMap(encode);
  assert.ok(source.length>60000);
  const training=source.slice(0,50000);
  return {mono:counts(training),bi:transitions(training),
    plant:source.slice(55000,56000)};
}

/** @param {AcrosticPage[]} pages @param {number} L @param {boolean} reset @param {number[]} key @returns {AcrosticPage[]} */
function crypt(pages,L,reset,key) {
  return pages.map(p=>{
    const head=p.head.map((v,i)=>mod(v+key[(reset?i:p.offset+i)%L]));
    return {...p,head};
  });
}

/** @param {AcrosticPage[]} pages @param {number} L @param {boolean} reset @param {number[]} key */
function decrypt(pages,L,reset,key) {
  return crypt(pages,L,reset,key.map(v=>mod(-v)));
}

/** @param {AcrosticPage[]} pages @param {number} L @param {boolean} reset @param {number[]} mono */
function fit(pages,L,reset,mono) {
  const scores=Array.from({length:L},()=>new Float64Array(MOD));
  let clock=0;
  for(const p of pages) {
    for(let i=0;i<p.head.length;i++){
      const row=scores[(reset?i:clock+i)%L];
      for(let k=0;k<MOD;k++) row[k]+=mono[mod(p.head[i]-k)];
    }
    clock+=p.head.length;
  }
  return scores.map(row=>{
    let index=0;
    for(let k=1;k<MOD;k++)if(row[k]>row[index])index=k;
    return index;
  });
}

/** @param {AcrosticPage[]} pages @param {number[][]} bi */
function bigram(pages,bi) {
  let value=0,pairs=0;
  for(const page of pages) {
    for(let i=1;i<page.head.length;i++){
      value+=bi[page.head[i-1]][page.head[i]];
      pairs++;
    }
  }
  return {score:value/pairs,pairs};
}

/** @param {AcrosticPage[]} pages @param {number[]} mono */
function unigram(pages,mono) {
  let value=0,n=0;
  for(const p of pages)for(const x of p.head){value+=mono[x];n++;}
  return value/n;
}

/** @param {AcrosticPage[]} pages @param {{mono:number[],bi:number[][]}} ref */
function scan(pages,ref) {
  const train=pages.filter(p=>p.page<=27);
  const hold=pages.filter(p=>p.page>=28);
  const list=[];
  for(const reset of [false,true])for(let L=1;L<=MAXPERIOD;L++){
    const key=fit(train,L,reset,ref.mono);
    const decoded=decrypt(hold,L,reset,key);
    const result=bigram(decoded,ref.bi);
    list.push({L,reset,key,heldoutBigram:result.score,
      heldoutUnigram:unigram(decoded,ref.mono)});
  }
  list.sort((a,b)=>b.heldoutBigram-a.heldoutBigram);
  const winner=list[0];
  const decoded=decrypt(pages,winner.L,winner.reset,winner.key);
  return {winner,top:list.slice(0,5),heldoutPairs:bigram(hold,ref.bi).pairs,
    decoded:decoded.flatMap(p=>p.head),nativeBiNoKey:bigram(hold,ref.bi).score,
    nativeMonoNoKey:unigram(hold,ref.mono)};
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/**
 * Shuffle line-initial glyphs within each actual page, retaining its first
 * glyph and exact histogram. No other source glyphs are changed.
 * @param {AcrosticPage[]} pages @param {()=>number} random
 */
function lineHeadNull(pages,random) {
  return pages.map(p=>{
    const head=p.head.slice();
    for(let i=head.length-1;i>1;i--){
      const j=1+random()%i;
      [head[i],head[j]]=[head[j],head[i]];
    }
    return {...p,head};
  });
}

/** @param {number} reps */
function run(reps=250) {
  assert(Number.isInteger(reps)&&reps>=0&&reps<=20000);
  const pages=sourceHeads(), ref=reference();
  const original=scan(pages,ref);
  const random=rng(0x3301a7c5);
  let extreme=0,mean=0,max=-Infinity;
  for(let t=0;t<reps;t++){
    const v=scan(lineHeadNull(pages,random),ref).winner.heldoutBigram;
    extreme+=Number(v>=original.winner.heldoutBigram);
    mean+=v;max=Math.max(max,v);
  }
  // Exactly preserve 55 original page line counts in the planted channel.
  const plaintext=ref.plant.slice(0,594);
  let cursor=0;
  const plantPages=pages.map(p=>{
    const head=plaintext.slice(cursor,cursor+p.length);
    cursor+=p.length;
    return {...p,head};
  });
  assert.equal(cursor,594);
  const secret=[23,10,1,10,9,10,16,26]; // DIVINITY (GP V maps to U)
  const planted=crypt(plantPages,secret.length,false,secret);
  const positive=scan(planted,ref);
  const correct=positive.winner.L===secret.length
    &&!positive.winner.reset
    &&positive.winner.key.every((k,i)=>k===secret[i]);
  const trueKey=decrypt(planted,secret.length,false,secret);
  assert.deepEqual(trueKey.flatMap(p=>p.head),plaintext);
  assert.ok(positive.winner.heldoutBigram>original.nativeBiNoKey);
  const symbols=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
  const render=a=>a.map(i=>symbols[i]).join('');
  const out={
    hypothesis:'LP2 first printed rune per line is an independent GP-English short-key Vigenere acrostic',
    source:{pages:pages.length,lines:594,runicBody:12956},
    split:'physical p0..27 training; p28..55 heldout (p50 runeless)',
    models:40, keyRange:'all 29 shifts at each of 1..20 positions, global/page clocks',
    original:{winner:original.winner,top:original.top,
      scoreNoKey:original.nativeBiNoKey,
      decodedPrefix:render(original.decoded.slice(0,180)),
      heldoutPairs:original.heldoutPairs},
    null:{draws:reps,ge:extreme,mean:reps?mean/reps:null,
      maximum:reps?max:null,upperP:(extreme+1)/(reps+1),
      design:'shuffle already observed line-head runes within each original page, first line fixed; rerun complete 40-model fit'},
    positive:{secret,top:positive.top.slice(0,3),
      best:positive.winner,exactRecovered:correct,
      truePlaintextRecovered:plaintext.length},
    limitation:'A negative score constrains this one auxiliary GP-English periodic-key channel, not the full LP2 cipher.'
  };
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  return out;
}
if(require.main===module)run(Number(process.argv[2]??250));
module.exports={sourceHeads,counts,transitions,reference,crypt,decrypt,fit,
  bigram,unigram,scan,lineHeadNull,run};
