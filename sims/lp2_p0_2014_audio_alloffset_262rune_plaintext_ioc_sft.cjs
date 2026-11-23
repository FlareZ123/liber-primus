'use strict';

/**
 * Full 2014 Stage07 authenticated original MP3, entire 262-rune LP2 p0,
 * every contiguous byte offset, two source-natural byte->GP29 projections,
 * both additive signs. Unsupervised exact full-paragraph English IoC receiver.
 * Windows Node22, one file, read-only, no explicit crib, no key fitting.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const original = Uint8Array.from(corpus.pages[0].indices);
const solved = corpus.pages.find((p) => p.page === 57).indices;
const num = original.length;
const denominator = num * (num - 1);
assert.equal(num, 262);
assert.equal(solved.length, 95);

const url = 'https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3';
const sha256 = '1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6';
const gitSha = '09fe068192b76a3697c47ec1d604b527703db798';
const modulus = (x) => (x % 29 + 29) % 29;

function paircount(data) {
  const freq = new Uint16Array(29);
  for (const k of data) freq[k] += 1;
  let pairs = 0;
  for (const k of freq) pairs += k * (k - 1);
  return pairs;
}

/**
 * @param {Uint8Array} audio
 * @param {Uint8Array} ciphertext
 * @param {Uint8Array} table
 * @param {number} offset
 * @param {boolean} plus
 * @returns {number}
 */
function scoreAt(audio,ciphertext,table,offset,plus) {
  const freq = new Uint16Array(29);
  let pairs=0;
  for (let i=0;i<ciphertext.length;i+=1) {
    const key=table[audio[offset+i]];
    let v=plus ? ciphertext[i]+key : ciphertext[i]-key;
    if(v>=29)v-=29;
    if(v<0)v+=29;
    pairs += 2*freq[v];
    freq[v]+=1;
  }
  return pairs;
}

/** Retain five largest original-source score candidates, with stable offsets. */
function insertTop(top,offset,pairs) {
  if(top.length===5 && pairs<=top[4].pairs) return;
  top.push({offset,pairs});
  top.sort((a,b)=>(b.pairs-a.pairs)||(a.offset-b.offset));
  if(top.length>5) top.pop();
}

/**
 * Each offset is an independent complete candidate key phase, scored without
 * dictionary or crib and without selecting an offset after inspecting output.
 * @param {Uint8Array} audio
 * @param {Uint8Array} table
 * @returns {{minus:object,plus:object}}
 */
function allOffsets(audio,table) {
  const minFreq = new Uint16Array(29);
  const plusFreq = new Uint16Array(29);
  const topMinus=[],topPlus=[];
  const histogramMinus = Array(10).fill(0);
  const histogramPlus=Array(10).fill(0);
  const limit=audio.length-num+1;
  let maxMinus=-1,maxPlus=-1;
  const bands=[0.038,0.040,0.042,0.044,0.046,0.048,0.050,0.055,0.060,0.065].map(x=>Math.ceil(x*denominator));
  for(let offset=0;offset<limit;offset+=1) {
    minFreq.fill(0);
    plusFreq.fill(0);
    let pm=0,pp=0;
    for(let i=0;i<num;i+=1){
      const k=table[audio[offset+i]];
      const c=original[i];
      let minus=c-k;
      if(minus<0) minus+=29;
      let plus=c+k;
      if(plus>=29) plus-=29;
      pm+=2*minFreq[minus];
      pp+=2*plusFreq[plus];
      minFreq[minus]+=1;
      plusFreq[plus]+=1;
    }
    if(pm>maxMinus){maxMinus=pm;insertTop(topMinus,offset,pm)}
    else if(topMinus.length<5||pm>topMinus[4].pairs)insertTop(topMinus,offset,pm);
    if(pp>maxPlus){maxPlus=pp;insertTop(topPlus,offset,pp)}
    else if(topPlus.length<5||pp>topPlus[4].pairs)insertTop(topPlus,offset,pp);
    // Track above-threshold counts for transparent original-source calibration.
    for(let i=0;i<bands.length;i+=1){
      if(pm>=bands[i]) histogramMinus[i]+=1;
      if(pp>=bands[i]) histogramPlus[i]+=1;
    }
  }
  return {testedOffsets:limit,topMinus,topPlus,bands,bandCountsMinus:histogramMinus,bandCountsPlus:histogramPlus};
}

function preview(audio,table,offset,plus,n=80) {
  const arr=[];
  for(let i=0;i<n;i++){
    let v=original[i] + (plus?1:-1)*table[audio[offset+i]];
    v=modulus(v);
    arr.push(corpus.translit[v]);
  }
  return arr.join(' ');
}

async function main(){
  const res=await fetch(url,{signal:AbortSignal.timeout(120000)});
  assert.equal(res.status,200);
  const audio=Buffer.from(await res.arrayBuffer());
  assert.equal(audio.length,6651873);
  assert.equal(crypto.createHash('sha256').update(audio).digest('hex'),sha256);
  assert.equal(crypto.createHash('sha1').update(Buffer.from('blob '+audio.length+'\0')).update(audio).digest('hex'),gitSha);
  const plantPlain=Uint8Array.from({length:num},(_,i)=>solved[i%solved.length]);
  const plantPairs=paircount(plantPlain);
  assert.ok(plantPairs/denominator>0.06);
  const pos=1234567;
  const tables=[
    {name:'byte%29',table:Uint8Array.from({length:256},(_,b)=>b%29)},
    {name:'floor(29*byte/256)',table:Uint8Array.from({length:256},(_,b)=>Math.floor(29*b/256))},
  ];
  const results=[];
  for(const {name,table} of tables){
    for(const sign of [-1,1]){
      const plantedCipher=Uint8Array.from(plantPlain, (p,i)=>modulus(p-sign*table[audio[pos+i]]));
      assert.equal(scoreAt(audio,plantedCipher,table,pos,sign===1),plantPairs);
    }
    const search=allOffsets(audio,table);
    const rows=[];
    for(const [sign,top,above] of [
      [-1,search.topMinus,search.bandCountsMinus],
      [1,search.topPlus,search.bandCountsPlus]
    ]){
      rows.push({sign,top:top.map(({offset,pairs})=>({offset,ioc:pairs/denominator,pairs,
        first80GP:preview(audio,table,offset,sign===1)})),
        iocThresholds:search.bands.map((b,i)=>({threshold:b/denominator,offsetsAtOrAbove:above[i]}))});
    }
    results.push({projection:name,searchOffsets:search.testedOffsets,signs:rows});
  }
  console.log(JSON.stringify({
    sourceURL:url,originalSHA256:sha256,originalLength:audio.length,
    p0CipherRunes:num,perProjectionOffsets:audio.length-num+1,
    independentSolvedNativeP57PlantIoC:plantPairs/denominator,
    results
  },null,2));
  console.log('PASS original p0 entire-262 all-audio-offset full-plaintext unsupervised IoC search');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
