"use strict";
// Exact spacing-free progressive-cycle GP29 lag bounds with arbitrary visible-F deletion.
function run(gp,lp1,donor,raw){
 const mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)};
 const ix=new Map(gp.runes.map((v,i)=>[v,i])),readRunes=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function stats(active,L,d=0){let one=0,two=0;for(let i=0;i<active.length;i++)for(let k=1;k<=3;k++){const lag=k*L,delta=mod(k*d);if(i>=lag&&mod(active[i]-active[i-lag])===delta){one++;if(i>lag&&mod(active[i-1]-active[i-lag-1])===delta)two++}}return [one,two]}
 function bounds(C,L){
  const D=3*L+1,inv=[0,1,15,10];let S=new Map([["",new Int32Array(58)]]),peak=1;
  for(const c of C){
   const T=new Map(),z=String.fromCharCode(c);
   function merge(h,a,adds){let old=T.get(h);if(!old){old=Int32Array.from(a);if(adds)for(const d of adds)old[d]++;T.set(h,old);return;}
     if(!adds){for(let j=0;j<58;j++)old[j]=Math.max(old[j],a[j]);return;}
     // At most three collisions of each type; multiplicity matters.
     const inc=new Uint8Array(58);for(const d of adds)inc[d]++;
     for(let j=0;j<58;j++)old[j]=Math.max(old[j],a[j]+inc[j]);
   }
   for(const [h,a] of S){
    if(c===0)merge(h,a,null);
    const adds=[];
    for(let k=1;k<=3;k++){const lag=k*L;if(h.length>=lag){const diff=mod(c-h.charCodeAt(h.length-lag)),d=mod(diff*inv[k]);adds.push(d);if(h.length>lag&&mod(h.charCodeAt(h.length-1)-h.charCodeAt(h.length-lag-1))===diff)adds.push(29+d);}}
    merge((h+z).slice(-D),a,adds)
   }
   S=T;peak=Math.max(peak,S.size)
  }
  const best=new Int32Array(58);for(const a of S.values())for(let j=0;j<58;j++)best[j]=Math.max(best[j],a[j]);
  return {slopes:Array.from({length:29},(_,d)=>({d,rune:best[d],bigram:best[d+29]})),peak};
 }
 const toy=[0,1,0,1,1,0,2,2,0,1,2,0,1],zz=toy.flatMap((x,i)=>x===0?[i]:[]),t=bounds(toy,2);
 for(let d=0;d<29;d++){const g=[];for(let m=0;m<1<<zz.length;m++){const skip=new Set(zz.filter((_,i)=>m>>i&1));g.push(stats(toy.filter((_,i)=>!skip.has(i)),2,d))}check(t.slopes[d].rune===Math.max(...g.map(x=>x[0]))&&t.slopes[d].bigram===Math.max(...g.map(x=>x[1])),"toy brute "+d);}
 const hist=[{name:"WELCOME",C:readRunes(lp1.split("%").slice(1,3).join("%")),P:readRunes(donor.sections.find(s=>s.name==="0_welcome").source_text),K:[23,10,1,10,9,10,16,26]},{name:"KOAN",C:readRunes(lp1.split("$")[5]),P:readRunes(donor.sections.find(s=>s.name==="jpg107-167").source_text),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const positive=[];
 for(const {name,C,P,K} of hist){for(const d of [0,7]){let k=0;const re=P.map(v=>{if(v===0)return 0;const c=mod(v+K[k%K.length]+d*Math.floor(k/K.length));k++;return c});if(d===0)check(re.join()===C.join(),name+" replay");const ac=re.filter((_,i)=>P[i]!==0),a=stats(P.filter(v=>v!==0),K.length),b=stats(ac,K.length,d),bo=bounds(re,K.length);check(a.join()===b.join()&&a[0]<=bo.slopes[d].rune&&a[1]<=bo.slopes[d].bigram,name+" exact invariant");positive.push({name,d,period:K.length,actual:a,bounds:bo.slopes[d],peak:bo.peak});}}
 const controls=raw.map((x,i)=>({name:["Shakespeare","Emerson","Gibran"][i],P:native(x)}));
 const pages=gp.pages.filter(p=>p.page<56),ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
 const result=[];
 for(const [a,b] of ranges){const C=pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);for(const L of [8,13]){const bo=bounds(C,L);const counts=controls.map(({name,P})=>{const n=C.length,W=32,g=[];for(let i=0;i<W;i++){const start=Math.round(i*(P.length-n)/(W-1));g.push(stats(P.slice(start,start+n).filter(v=>v!==0),L));}return {name,minRune:Math.min(...g.map(x=>x[0])),minBigram:Math.min(...g.map(x=>x[1])),runePass:g.filter(x=>bo.slopes.some(s=>x[0]<=s.rune)).length,bigramPass:g.filter(x=>bo.slopes.some(s=>x[1]<=s.bigram)).length,jointPass:g.filter(x=>bo.slopes.some(s=>x[0]<=s.rune&&x[1]<=s.bigram)).length};});result.push({pages:[a,b],n:C.length,period:L,maxRune:Math.max(...bo.slopes.map(s=>s.rune)),maxBigram:Math.max(...bo.slopes.map(s=>s.bigram)),...bo,controls:counts});}}
 return {positive,toyBruteAll29:true,result}
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3)),null,2));
