'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function analyze(gp,raw){
 const lut=new Map(gp.runes.map((g,i)=>[g,i])),words=[];let w=[],r=0;
 for(const ch of raw){const c=lut.get(ch);if(c!==undefined)w.push({r:r++,c});else if((ch==="-"||ch===".")&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 if(JSON.stringify(words.flat().map(x=>x.c))!==JSON.stringify(gp.pages.flatMap(p=>p.indices)))throw Error("transcription mismatch");
 const s=words.flatMap((w,wi)=>w.length===1&&w[0].r<12956?[{...w[0],wi}]:[]);if(s.length!==83)throw Error("singleton count");
 const mod=x=>(x%29+29)%29;
 const bit=x=>1<<x;
 const mask=a=>a.reduce((v,x)=>v|bit(x),0);
 const pop=n=>{let k=0;while(n){n&=n-1;k++}return k};
 const result=[];
 for(const [a,b] of [[13,31],[31,13]]){
 const groups=new Map();for(const o of s){const k=(o.r%a)+","+(o.wi%b);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o)}
 const duplicates=[...groups.entries()].filter(([k,g])=>g.length>1);
 const possibilities=duplicates.map(([k,g])=>Array.from({length:29},(_,shift)=>mask(g.map(o=>mod(o.c-shift)))));
 const fits=m=>possibilities.every(gs=>gs.some(v=>(m&v)===v));
 const bad=duplicates.filter(([k,g],j)=>!possibilities[j].some(v=>(mask([24,10,3])&v)===v));
 const distances=new Set();for(const [k,g] of duplicates)for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){const d=mod(g[i].c-g[j].c);if(d)distances.add(Math.min(d,29-d))}
 function findMinimum(fixed){const rest=Array.from({length:29},(_,i)=>i).filter(i=>!fixed.includes(i));let tested=0;for(let k=0;k<=7-fixed.length;k++){let found=null;function search(start,left,chosen,m){if(found)return;if(left===0){tested++;if(fits(m))found=[...fixed,...chosen];return}for(let j=start;j<=rest.length-left;j++){search(j+1,left-1,[...chosen,rest[j]],m|bit(rest[j]));if(found)return}}search(0,k,[],mask(fixed));if(found)return {size:found.length,alphabet:found,tested}}return null}
 // Any vocabulary may be shifted to include 0. Fixed-AIO case is literal.
 const arbitrary=findMinimum([0]),withAIO=findMinimum([24,10,3]);
 // A real positive synthetic plant at the same singleton slots.
 const planted=s.map((o,j)=>({...o,p:[24,10,3][j%3],c:mod([24,10,3][j%3]+(7*(o.r%a)+2)%29+(11*(o.wi%b)+9)%29)}));
 const plantGroups=new Map();for(const o of planted){const k=(o.r%a)+","+(o.wi%b);if(!plantGroups.has(k))plantGroups.set(k,[]);plantGroups.get(k).push(o)}
 if(![...plantGroups.values()].every(g=>Array.from({length:29},(_,k)=>k).some(k=>g.every(o=>[24,10,3].includes(mod(o.c-k))))))throw Error("positive");
 result.push({runePeriod:a,wordPeriod:b,unique:groups.size,duplicates:duplicates.length,bad:bad.map(([phase,observations])=>({phase,observations})),distances:[...distances].sort((x,y)=>x-y),arbitrary,withAIO,planted:"PASS"});
 }
 return result;
}
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(analyze(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt')),null,2));
