"use strict";
/**
 * Source-fixed and all-secret seven-column WHOLE-WORD inverse for original LP2.
 * Node 22 / CommonJS; standalone with repository data, no writes or network.
 * Run: node sims/lp2_2014_sevencol_wordorder_allkey_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const {stats,nativeLengths,rankMatch}=require("./lp2_wordlength_order_grammar_sft.cjs");
const key=[0,4,2,6,5,3,1]; // ascending labels 1736254
const ch=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const N=2896,seed=0x33011707;
/** @param {number[]} a @param {number[]} order @returns {number[]} */
function decode(a,order){
  const h=Array.from({length:7},(_,j)=>Math.floor(a.length/7)+(j<a.length%7?1:0));
  const col=Array.from({length:7},()=>[]);let k=0;
  for(const j of order){col[j]=a.slice(k,k+h[j]);k+=h[j]}
  const out=[];for(let i=0;i<Math.max(...h);i++)for(let j=0;j<7;j++)if(i<h[j])out.push(col[j][i]);return out;
}
/** @param {number[]} a @param {number[]} order @returns {number[]} */
function encode(a,order){
  const col=Array.from({length:7},()=>[]);
  for(let i=0;i<a.length;i++)col[i%7].push(a[i]);
  return order.flatMap(j=>col[j]);
}
const perms=[];
(function rec(a){if(a.length===7){perms.push(a);return}for(let j=0;j<7;j++)if(!a.includes(j))rec([...a,j])})([]);
assert.equal(perms.length,5040);
/** @param {number[]} a Already nine-class binned, values 0..8. */
function best(a){
  const h=Array.from({length:7},(_,j)=>Math.floor(N/7)+(j<N%7?1:0));
  const out=new Uint8Array(N),joint=new Int16Array(81),row=new Int16Array(9),col=new Int16Array(9);
  let max=-1,who="";
  for(const order of perms){
    const offsets=Array(7).fill(0);let pos=0;
    for(const j of order){offsets[j]=pos;pos+=h[j]}
    let n=0;for(let i=0;i<Math.max(...h);i++)for(let j=0;j<7;j++)if(i<h[j])out[n++]=a[offsets[j]+i];
    assert.equal(n,N);
    joint.fill(0);row.fill(0);col.fill(0);
    for(let i=1;i<N;i++){const x=out[i-1],y=out[i];joint[x*9+y]++;row[x]++;col[y]++}
    let chi=0;for(let i=0;i<9;i++)for(let j=0;j<9;j++){
      const ex=row[i]*col[j]/(N-1);if(ex)chi+=(joint[9*i+j]-ex)**2/ex;
    }
    if(chi>max){max=chi;who=order.join("")}
  }
  return {chi:max,key:who};
}
function main(){
  const corpus=parseSharedCorpus(), words=corpus.words;
  assert.equal(corpus.runeCount,12956);assert.equal(words.length,N);assert.equal(corpus.crossPageWords,32);
  const orig=words.map(w=>w.length), pagewords=words.map(w=>({p:physicalLP2Page(w.startPage),l:w.length}));
  const groups={
    book:[orig],
    chapter:ch.map(([lo,hi])=>pagewords.filter(w=>w.p>=lo&&w.p<=hi).map(w=>w.l)),
    page:Array.from({length:56},(_,p)=>pagewords.filter(w=>w.p===p).map(w=>w.l))
  };
  const fixed=Object.fromEntries(Object.entries(groups).map(([name,g])=>
    [name,stats(g.flatMap(x=>decode(x,key))).chi]));
  const raw=stats(orig).chi;
  assert.ok(Math.abs(raw-68.27318638192133)<1e-9);
  assert.ok(Math.abs(fixed.book-60.525293277088544)<1e-8);
  assert.ok(Math.abs(fixed.chapter-60.6033429188223)<1e-8);
  assert.ok(Math.abs(fixed.page-77.57740708720965)<1e-8);
  assert.deepEqual(decode(encode(orig,key),key),orig);
  const english=nativeLengths(fs.readFileSync(path.join(__dirname,"..","resources","control","shakespeare_first300k.txt"),"utf8")).slice(0,N);
  const plant=rankMatch(english,orig.slice().sort((a,b)=>a-b));
  assert.deepEqual(decode(encode(plant,key),key),plant);
  assert.ok(stats(plant).chi>raw);
  const bin=orig.map(x=>Math.min(9,x)-1),winning=best(bin);
  assert.ok(Math.abs(winning.chi-109.58868907188368)<1e-8);assert.equal(winning.key,"1430625");
  let state=seed;
  const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
  const maxima=[];
  for(let t=0;t<16;t++){
    const a=bin.slice();
    for(let i=a.length-1;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}
    maxima.push(best(a).chi);
  }
  const outrank=maxima.filter(x=>x>=winning.chi).length;assert.equal(outrank,9);
  console.log(JSON.stringify({n:N,runes:corpus.runeCount,raw,fixed,historicalKey:key,
    secretKey:{count:perms.length,winning,draws:maxima.length,seed,maxima,outrank,
      upperTail:(outrank+1)/(maxima.length+1)},
    positivePlant:"original-length matched Shakespeare round-trip exact",plaintextRecovered:false},null,2));
}
if(require.main===module)main();
module.exports={decode,encode,best};
