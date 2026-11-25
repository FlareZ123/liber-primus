"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
function columnGate(corpus,ink){
 const codes={10:29,13:30,23:31},m=new Map(ink.pages.map(x=>[x.page,x.large_punctuation||[]]));
 const source=(lo,hi,marked)=>{const a=[];for(let p=lo;p<=hi;p++){const x=corpus.pages[p].indices,ms=marked?m.get(p)||[]:[];let k=0;for(let j=0;j<=x.length;j++){while(k<ms.length&&ms[k][0]===j)a.push(codes[ms[k++][1]]);if(j<x.length)a.push(x[j])}if(k!==ms.length)throw Error("marks")}return a};
 function lower(a,width,phase){
   const c=Array.from({length:8},()=>Array.from({length:5},()=>Array(32).fill(0)));let chars=0,checked=0;
   for(let b=phase;b+width<=a.length*5;b+=width){
     chars++;const i=Math.floor(b/5),j=b%5;if(width===7&&j===4)continue;
     checked++;c[i%8][j][a[i]]++;
   }
   const bound=c.flat().reduce((sum,row)=>sum+row.sort((a,b)=>b-a).slice(width===8?16:24).reduce((x,y)=>x+y,0),0);
   return {phase,chars,checked,bound};
 }
 function best(a,width){const out=[];for(const [dir,t] of [["forward",a],["reverse",a.slice().reverse()]])for(let phase=0;phase<width;phase++)out.push({dir,...lower(t,width,phase)});out.sort((a,b)=>a.bound-b.bound||a.chars-b.chars);return {...out[0],zeroAlignments:out.filter(x=>!x.bound).length}}
 const out={};
 for(const marked of [false,true]){
   out[marked?"marked":"runes"]=[[0,55],[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([lo,hi])=>{const a=source(lo,hi,marked);return {pages:[lo,hi],symbols:a.length,ascii8:best(a,8),ascii7:best(a,7)}});
 }
 // Real p57 text, eight distinct codebook permutations.
 const p=corpus.pages[57].indices.map(x=>corpus.translit[x]).join("").slice(0,100),control=[];
 for(const width of [8,7]){
   const stream=[...p].flatMap(x=>Array.from({length:width},(_,i)=>(x.charCodeAt(0)>>(width-1-i))&1)),a=[];
   for(let i=0;i<stream.length;i+=5){let v=0;for(let j=0;j<5;j++)v=2*v+stream[i+j];a.push((13*v+7+Math.floor(i/5)%8)%32)}
   const b=lower(a,width,0);if(b.bound!==0)throw Error("plant excluded");control.push({width,...b});
 }
 return {out,control};
}
console.log(JSON.stringify(columnGate(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-ink-annotations.json")),null,2));
