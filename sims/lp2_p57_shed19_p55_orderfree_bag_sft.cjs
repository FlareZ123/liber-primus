#!/usr/bin/env node
'use strict';
/* Exact source-word-multiset receiver; no LP2 plaintext assumption.
 * Run from any directory:
 *   node sims/lp2_p57_shed19_p55_orderfree_bag_sft.cjs
 */
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const runeToIndex=new Map(corpus.runes.map((s,i)=>[s,i]));
const source=solved.sections.find(x=>x.name==='p57_parable').source_text;
const words=source.split(/[\s•⁜⁘]+/u).map(t=>[...t].filter(c=>runeToIndex.has(c)).map(c=>runeToIndex.get(c))).filter(a=>a.length);
assert.equal(words.length,20);
assert.deepEqual(words.map(a=>a.length),[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]);
const target=corpus.pages.find(pg=>pg.page===55).indices;
assert.equal(target.length,76);
const hist=a=>{const h=Array(29).fill(0);for(const v of a){assert(v>=0&&v<29);h[v]++;}return h;};
const shiftKeys=(P,C)=>{let h=hist(P),c=hist(C),keys=[];for(let k=0;k<29;k++)if(c.every((v,i)=>v===h[(i-k+29)%29]))keys.push(k);return keys;};
const sorted=h=>h.slice().sort((a,b)=>b-a);
const dist=(x,y)=>x.reduce((s,a,i)=>s+Math.abs(a-y[i]),0);
const factorial=n=>{let p=1n;for(let k=2;k<=n;k++)p*=BigInt(k);return p;};
const decoyGroupSizes=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(decoyGroupSizes.reduce((a,b)=>a+b,0),76);
const xorshift=seed=>{let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};};
function shuffleChunks(chunks,seed) {
  const out=chunks.map(x=>x.slice()),random=xorshift(seed);
  for(let i=out.length-1;i>=1;i--){let j=random()%(i+1);[out[i],out[j]]=[out[j],out[i]];}
  return out.flat();
}
function decoySplit(a) {
  let i=0;const pieces=decoyGroupSizes.map(n=>{const p=a.slice(i,i+n);i+=n;return p;});
  assert.equal(i,a.length);return pieces;
}
const rows=[];
for(const edge of ['first','last']) {
  const sourceChunks=[words[0],...words.slice(1).map(x=>edge==='first'?x.slice(1):x.slice(0,-1))];
  const P=sourceChunks.flat();
  assert.equal(P.length,76);
  const h=hist(P),ch=hist(target),Psort=sorted(h),Csort=sorted(ch);
  const plainTypes=h.filter(n=>n>0).length,cipherTypes=ch.filter(n=>n>0).length;
  assert.equal(cipherTypes,25);
  assert.equal(plainTypes,edge==='first'?22:20);
  const sortedL1=dist(Psort,Csort);
  const bestShift=Math.min(...Array.from({length:29},(_,k)=>dist(ch,ch.map((_,i)=>h[(i-k+29)%29]))));
  const hits=shiftKeys(P,target);
  assert.deepEqual(hits,[]);
  assert.equal(sortedL1,edge==='first'?36:20);
  assert.equal(bestShift,edge==='first'?68:56);
  for(const k of [2,13,28]) {
    const shuffled=shuffleChunks(sourceChunks,0x33015755+k);
    const C=shuffled.map(x=>(x+k)%29);
    const decoy=decoySplit(C);
    // Neither the original source word order nor the new arbitrary target boundaries are provided.
    assert.notDeepEqual(shuffled,P);
    assert.deepEqual(shiftKeys(P,decoy.flat()),[k]);
  }
  const multiplicity=new Map();
  for(const n of h) multiplicity.set(n,(multiplicity.get(n)||0)+1);
  const chartAmbiguity=[...multiplicity.values()].reduce((n,v)=>n*factorial(v),1n);
  assert.equal(chartAmbiguity.toString(),edge==='first'?'131681894400':'37623398400');
  rows.push({edge,sourceRunes:P.length,sourceTypes:plainTypes,p55Types:cipherTypes,
    originalValidShiftKeys:hits,sortedHistogramL1:sortedL1,
    bestCaesarHistogramL1:bestShift,sourceBagChartAmbiguity:chartAmbiguity.toString(),
    nativePlantedKeysRecovered:[2,13,28]});
}
console.log(JSON.stringify({statement:'source bag not original plaintext',originalPage:55,rows},null,2));
