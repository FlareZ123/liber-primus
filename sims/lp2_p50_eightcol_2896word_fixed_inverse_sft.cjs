"use strict";
/**
 * Source-fixed eight-column LP2 word-order test, original p50 numeric grid.
 * Node 22 CommonJS SFT, read-only and compatible with Windows 11.
 * Both unkeyed row/column directions use exactly 2,896 original complete words.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text=read("resources/liber-primus/lp2-transcription.txt");
const english=[
 read("resources/control/gibran_prophet_58585.txt"),
 read("resources/control/shakespeare_first300k.txt")
];
const latinText=read("resources/control/latin-vulgate-gp-wholewords.txt");
const original=[];const runeSet=new Set(gp.runes);let count=0,word=0;
for(const ch of text){
 if(runeSet.has(ch)){count++;word++;if(count===12956){original.push(word);break;}}
 else if("-.&".includes(ch)&&word){original.push(word);word=0;}
}
assert.equal(count,12956);assert.equal(original.length,2896);
assert.equal(original.reduce((s,v)=>s+v,0),12956);
const SIZES=[158,255,383,437,224,326,378,669,66];
assert.equal(SIZES.reduce((s,v)=>s+v,0),2896);
const W=8,H=362,K=12;
const byCols=a=>{assert.equal(a.length,W*H);const b=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)b.push(a[r*W+c]);return b;};
const byRows=a=>{assert.equal(a.length,W*H);const b=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)b.push(a[c*H+r]);return b;};
const asChapters=a=>{let k=0;return SIZES.map(n=>a.slice(k,k+=n));};
const bin=n=>Math.min(K-1,n-1);
function mi(chapters){
 const x=new Float64Array(K),y=new Float64Array(K),xy=new Float64Array(K*K);let n=0;
 for(const g of chapters)for(let i=1;i<g.length;i++){
  const a=bin(g[i-1]),b=bin(g[i]);x[a]++;y[b]++;xy[a*K+b]++;n++;
 }
 let result=0;
 for(let a=0;a<K;a++)for(let b=0;b<K;b++){
  const v=xy[a*K+b];if(v)result+=v/n*Math.log(v*n/(x[a]*y[b]));
 }
 return result;
}
const gpTokens=gp.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} sourceWord @returns {number} */
function gpLen(sourceWord){
 const s=sourceWord.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 let n=0;
 for(let i=0;i<s.length;){
  const z=s.startsWith("ING",i)?3:s.startsWith("IO",i)?2:
   (gpTokens.find(t=>s.startsWith(t,i))||"").length;
  assert.ok(z>0,sourceWord);i+=z;n++;
 }
 return n;
}
const lang=english.map(s=>(s.match(/[A-Za-z]+/g)||[]).map(gpLen));
assert.deepEqual(lang.map(v=>v.length),[15733,55407]);
const pairs=Array.from({length:K},()=>new Float64Array(K));
const row=new Float64Array(K),col=new Float64Array(K);
let total=0;
for(let g=0;g<2;g++)for(let i=1;i<[8500,40000][g];i++){
 const a=bin(lang[g][i-1]),b=bin(lang[g][i]);
 pairs[a][b]++;row[a]++;col[b]++;total++;
}
const lr=pairs.map((line,i)=>Array.from(line,(v,j)=>
 Math.log((v+2)/(row[i]+2*K))-Math.log((col[j]+2)/(total+2*K))));
/** @param {number[]} a @returns {number} */
function score(a){
 let s=0;for(let i=1;i<a.length;i++)s+=lr[bin(a[i-1])][bin(a[i])];
 return s/(a.length-1);
}
const originalLR={printed:score(original),columnRead:score(byCols(original)),
 columnUndo:score(byRows(original))};
const originalMI={printed:mi(asChapters(original)),
 columnRead:mi(asChapters(byCols(original))),
 columnUndo:mi(asChapters(byRows(original)))};
const controls=lang.map((all,i)=>{
 const a=all.slice([10000,45000][i],[10000,45000][i]+2896);
 assert.equal(a.length,2896);
 assert.deepEqual(byRows(byCols(a)),a);assert.deepEqual(byCols(byRows(a)),a);
 return {source:i?"Shakespeare":"Gibran",natural:score(a),
  columnRead:score(byCols(a)),columnUndo:score(byRows(a)),
  exactRestored:2896};
});
const latin=latinText.split(/\r?\n/).filter(s=>/^[0-9A-S]+$/.test(s))
 .map(s=>s.length).slice(1500,4396);
assert.equal(latin.length,2896);
const latinMI={natural:mi(asChapters(latin)),columnRead:mi(asChapters(byCols(latin))),
 columnUndo:mi(asChapters(byRows(latin)))};
let seed=0x33011717;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return (seed>>>0)/4294967296;}
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){
 const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];
}return b;}
const nulls=Array.from({length:1000},()=>mi(asChapters(original).map(shuffle)));
const mean=nulls.reduce((a,b)=>a+b,0)/nulls.length;
const sd=Math.sqrt(nulls.reduce((a,b)=>a+(b-mean)**2,0)/nulls.length);
const tailP={};for(const [key,v] of Object.entries(originalMI))
 tailP[key]=(1+nulls.filter(x=>x>=v).length)/(nulls.length+1);
assert.ok(Object.values(originalLR).every(v=>v<0));
assert.ok(controls.every(c=>c.natural>0&&c.columnRead<0&&c.columnUndo<0));
console.log(JSON.stringify({source:"physical LP2 p50 8-column table",
 wordCount:2896,runes:12956,grid:[362,8],chapterWords:SIZES,
 originalLR,originalMI,nullShuffles:1000,mean,sd,tailP,controls,latinMI,
 decision:"No native GP-English word-order recovery for either fixed eight-column receiver"},null,2));
