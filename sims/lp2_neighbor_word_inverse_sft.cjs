'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
function run(corpus, transcript) {
 const mod=x=>(x%29+29)%29, equal=(x,y)=>JSON.stringify(x)===JSON.stringify(y), check=(cond,msg)=>{if(!cond)throw Error(msg)};
 const lut=new Map(corpus.runes.map((r,i)=>[r,i]));
 const all=transcript.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g).map(w=>[...w].map(x=>lut.get(x)));
 const original=corpus.pages.slice(0,56).flatMap(p=>p.indices), starts=[0];
 let wi=0;while(starts.at(-1)<original.length)starts.push(starts.at(-1)+all[wi++].length);
 const words=all.slice(0,wi), clear=all.slice(wi).filter((_,i)=>true);
 let skip=0,ns=0;while(ns<85)ns+=clear[skip++].length;
 const p57=clear.slice(skip), anchor=[24,9];
 check(words.length===2896&&equal(words.flat(),original),"original parse");
 check(ns===85&&equal(p57.flat(),corpus.pages[57].indices),"p57 parse");
 const inverse=Array.from({length:29},(_,i)=>{for(let j=1;j<29;j++)if(i*j%29===1)return j;return 0});
 /** Solve C=P+previous+next, no F hold, with fixed left 0 and right AN. */
 function solve(c) {
  const s=[0];for(const w of c)s.push(s.at(-1)+w.length);const N=s.at(-1), pivots=Array(N), errors=[];
  let rank=0,maxWidth=0;
  for(let w=0;w<c.length;w++)for(let i=0;i<c[w].length;i++){
   const k=s[w]+i,row=new Map([[k,1]]);let rhs=c[w][i];
   if(w)row.set(s[w-1]+i%c[w-1].length,1);
   if(w+1<c.length)row.set(s[w+1]+i%c[w+1].length,1);else rhs=mod(rhs-anchor[i%2]);
   while(row.size){
    let p=Infinity;for(const x of row.keys())p=Math.min(p,x);
    maxWidth=Math.max(maxWidth,row.size);const a=row.get(p), prev=pivots[p];
    if(!prev){const q=inverse[a];for(const [x,v] of row)row.set(x,mod(v*q));rhs=mod(rhs*q);pivots[p]={row,rhs};rank++;break}
    for(const [x,v] of prev.row){const z=mod((row.get(x)||0)-a*v);if(z)row.set(x,z);else row.delete(x)}
    rhs=mod(rhs-a*prev.rhs);
   }
   if(!row.size&&rhs)errors.push({word:w,rune:i,global:k,rhs});
  }
  const x=Array(N).fill(0);if(!errors.length)for(let p=N-1;p>=0;p--){const v=pivots[p];if(v){let z=v.rhs;for(const [k,a] of v.row)if(k!==p)z=mod(z-a*x[k]);x[p]=z}}
  return {N,rank,nullity:N-rank,maxWidth,contradictionCount:errors.length,firstContradiction:errors[0]??null,decoded:errors.length?null:c.map((_,i)=>x.slice(s[i],s[i+1]))};
 }
 function forwardTwo(p){return p.map((w,i)=>w.map((v,k)=>mod(v+(i?p[i-1][k%p[i-1].length]:0)+(i+1<p.length?p[i+1][k%p[i+1].length]:anchor[k%2]))))}
 function forwardWord(p,k,hold){let phase=0;return p.map(v=>hold&&v===0?0:mod(v+k[phase++%k.length]))}
 /** Exhaustive branch-preserving inverse for F transparency. */
 function invert(c,k){let states=[{p:[],phase:0}];for(const v of c){const ns=[];for(const s of states){if(v===0)ns.push({p:[...s.p,0],phase:s.phase});const p=mod(v-k[s.phase%k.length]);if(p!==0)ns.push({p:[...s.p,p],phase:s.phase+1})}states=ns;if(!states.length)break}const p=states.map(s=>s.p);for(const q of p)check(equal(forwardWord(q,k,true),c),"branch replay");return p}
 function walk(c,start,states,truth=null){const counts=[];let before=null;for(let i=start;i>=0;i--){before=states;const ns=new Map();for(const k of states)for(const p of invert(c[i],k))ns.set(p.join(","),p);states=[...ns.values()];if(truth)check(states.some(p=>equal(p,truth[i])),"known GP plaintext branch lost");counts.push([i,states.length]);if(!states.length)break}return {counts,final:counts.at(-1),max:Math.max(...counts.map(x=>x[1])),lastKeys:before,failedCipher:states.length?null:c[counts.at(-1)[0]]}}
 function forwardBack(p,hold){return p.map((w,i)=>forwardWord(w,p[i+1]??anchor,hold))}
 function ordinary(c){const p=Array(c.length);let k=anchor;for(let i=c.length-1;i>=0;i--){p[i]=c[i].map((v,j)=>mod(v-k[j%k.length]));k=p[i]}return p}
 const real=solve(words), twoPlant=forwardTwo(p57), planted=solve(twoPlant);
 check(planted.decoded&&equal(forwardTwo(planted.decoded),twoPlant),"p57 two-sided replay");
 const backwardPlant=forwardBack(p57,true), bPlant=walk(backwardPlant,p57.length-1,[anchor],p57);
 const ordinaryPlant=ordinary(forwardBack(p57,false));check(equal(ordinaryPlant,p57),"p57 exact ordinary control");
 const anchored=walk(words,words.length-1,[anchor]);
 const singleton=words.findLastIndex(w=>w.length===1), unrestricted=walk(words,singleton-1,Array.from({length:29},(_,i)=>[i]));
 const p=ordinary(words);check(equal(forwardBack(p,false),words),"ordinary original replay");
 const freq=Array(29).fill(0);for(const x of p.flat())freq[x]++;
 const ioc=freq.reduce((s,f)=>s+f*(f-1),0)/(original.length*(original.length-1)), singles=p.filter(w=>w.length===1);
 const tr=w=>w.map(i=>corpus.translit[i]).join("");
 return {input:{words:words.length,runes:original.length,firstThree:words.slice(0,3),p57Words:p57.length,p57Runes:p57.flat().length},twoSided:{...real,decoded:undefined,firstHeadingCertificate:[mod(words[1][0]-words[0][0]),mod(words[1][4]-words[0][4])]},controls:{twoSided:{...planted,decoded:undefined,exactRunes:planted.decoded.flat().filter((v,i)=>v===p57.flat()[i]).length,replay:true},backwardF:{...bPlant,lastKeys:undefined,truePlaintextSurvives:true},ordinary:{exactRunes:95}},backwardF:{anchored:{...anchored,firstOffset:starts[anchored.final[0]]},allSingleton:{singleton,singletonOffset:starts[singleton],...unrestricted,firstOffset:starts[unrestricted.final[0]]}},backwardOrdinary:{ioc,singletons:singles.length,AIO:singles.filter(w=>[24,10,3].includes(w[0])).length,first30:p.slice(0,30).map(tr).join(" "),last30:p.slice(-30).map(tr).join(" "),replay:true}};
}
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
console.log(JSON.stringify(run(corpus, transcript), null, 2));
