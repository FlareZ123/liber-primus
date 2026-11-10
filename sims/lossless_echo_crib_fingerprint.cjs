'use strict';
/**
 * Known-plaintext attack on the exact lossless EA/T/U/E tableau hypothesis.
 * Its reserved output positions expose 267 candidate GP plaintext runes
 * independently of every secret permutation byte. Search source windows for
 * ALL anchor constraints, not just their best matching subsequence.
 *
 * Scope: fixed GP source text, literal manuscript word/page clock,
 * uninterrupted source excerpt, no edits or hidden tokenization layers.
 * Run: node sims/lossless_echo_crib_fingerprint.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {gpText, descriptors, encrypt, decryptPrepared, gridKey} =
  require('./lossless_echo_table_inverse.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const GP = gp.translit;
const byRune = new Map(gp.runes.map((r,i)=>[r,i]));
const words = parseSharedCorpus().words.map(w=>[...w.runes].map(r=>byRune.get(r)));
assert.equal(words.length,2896);
const N = words.flat().length;
assert.equal(N,12956);

/** @param {ReturnType<typeof descriptors>} desc */
function anchors(desc) {
  const offsets=[],labels=[];
  for(let i=0;i<desc.length;i++)if(desc[i].fixed>=0){
    offsets.push(i);labels.push(desc[i].fixed);
  }
  return {offsets,labels};
}
/** @param {string} name @param {number[]} runes */
function corpus(name,runes){
  const by=Array.from({length:29},()=>[]);
  for(let i=0;i<runes.length;i++)by[runes[i]].push(i);
  return {name,runes,by};
}
/**
 * Exact source-wide sparse cross-correlation under all labeled anchor
 * constraints; the winning offset fits a copy of the supplied source.
 * @param {{offsets:number[],labels:number[]}} markers
 * @param {ReturnType<typeof corpus>} source
 */
function scan(markers,source) {
  if(source.runes.length<N)return null;
  const hits=new Uint16Array(source.runes.length-N+1);
  let best=0,bestOffset=0;
  for(let i=0;i<markers.offsets.length;i++){
    const off=markers.offsets[i];
    for(const pos of source.by[markers.labels[i]]){
      const start=pos-off;
      if(start>=0&&start<hits.length){
        const n=++hits[start];
        if(n>best){best=n;bestOffset=start;}
      }
    }
  }
  const bySymbol={};
  for(const p of [1,16,18,28])bySymbol[GP[p]]=markers.offsets
    .reduce((n,off,i)=>n+Number(markers.labels[i]===p&&
      source.runes[bestOffset+off]===p),0);
  return {source:source.name,sourceGP:source.runes.length,
    windows:hits.length,bestMatchingAnchors:best,
    totalAnchors:markers.offsets.length,unmatchedAnchors:markers.offsets.length-best,
    bestSourceOffset:bestOffset,bySymbol};
}
/** A deterministic and count-preserving matched null. */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
function findBest(a,sources) {
  const all=sources.map(s=>scan(a,s)).filter(Boolean);
  all.sort((x,y)=>y.bestMatchingAnchors-x.bestMatchingAnchors);
  return all;
}
function run() {
  const sourcePaths=[
    'resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt'
  ];
  const sources=sourcePaths.map(p=>corpus(path.basename(p),gpText(read(p))));
  const original=anchors(descriptors(words));
  assert.deepEqual([1,16,18,28].map(p=>original.labels.filter(v=>v===p).length),
    [83,81,17,86]);
  assert.equal(original.offsets.length,267);
  const best=findBest(original,sources);
  assert.equal(best[0].bestMatchingAnchors,30);
  assert.equal(best[0].unmatchedAnchors,237);
  const random=rng(0x41ac2026),nullMax=[],trials=32;
  for(let i=0;i<trials;i++){
    const labels=original.labels.slice();
    for(let j=labels.length-1;j>0;j--){
      const k=random()%(j+1);
      [labels[j],labels[k]]=[labels[k],labels[j]];
    }
    nullMax.push(findBest({offsets:original.offsets,labels},sources)
      [0].bestMatchingAnchors);
  }
  const exceeds=nullMax.filter(x=>x>=best[0].bestMatchingAnchors).length;

  // Blind known-source positive: original word lengths and authentic source
  // text in a different interval, encrypted with an independently fixed
  // original grid key. Its plaintext and exact ciphertext are both recovered.
  const offset=13000,source=sources[0],plain=source.runes.slice(offset,offset+N);
  assert.equal(plain.length,N);
  const key=gridKey({kind:'section-column',scope:'section',
    mapping:'mod',phase:7});
  const ciphertext=encrypt(plain,key),prepared=descriptors(ciphertext);
  const recovered=decryptPrepared(prepared,key);
  assert.deepEqual(recovered,plain);
  assert.deepEqual(encrypt(recovered,key),ciphertext);
  const planted=anchors(prepared),positive=scan(planted,source);
  assert.equal(positive.bestMatchingAnchors,planted.offsets.length);
  assert.equal(positive.bestSourceOffset,offset);
  const result={
    status:'Exact conditional known-source exclusion for one postselected lossless tableau; no new LP2 plaintext or authentic key',
    model:'Lossless previous-rune/lag5/lag6 tableau, reserved GP EA/T/U/E',
    original:{
      runes:N,wordCount:words.length,
      forcedSymbolCounts:{U:83,T:81,E:17,EA:86},
      bestSourceAlignment:best,
      exactKnownSourceExcerptPossible:best.some(x=>x.unmatchedAnchors===0)},
    familywiseMatchedNull:{trials,seed:'0x41ac2026',
      positionsKept:true,labelInventoryKept:true,
      nullBestCounts:nullMax,controlsAtLeastOriginal:exceeds,
      addOneUpperTail:(exceeds+1)/(trials+1)},
    plantedPositive:{source:'Shakespeare',sourceOffset:offset,
      authenticSourceKey:'original grid section columns, phase7',
      reservedPlaintextConstraints:planted.offsets.length,
      matchedAllConstraints:positive.bestMatchingAnchors,
      sourceOffsetRecovered:positive.bestSourceOffset,
      fullPlaintextRecovered:recovered.length,
      exactForwardReencryption:true},
    limitations:'The tableau was designed after studying the original echoes. A different key, source text, changed source spelling/segmentation, token insertion, or different tableau escapes this result.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={anchors,corpus,scan,findBest,run};
