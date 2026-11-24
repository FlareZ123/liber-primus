"use strict";
/** #2521: exact all-subset plaintext-F deletion bounds for same-phase rune and bigram collisions. Node22/CommonJS. */
const fs=require("node:fs"),path=require("node:path");
function run(gp,lp1,donor,raw){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const ix=new Map(gp.runes.map((v,i)=>[v,i])),readRunes=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function stats(active,L){let one=0,two=0;for(let i=0;i<active.length;i++)for(let k=1;k<=3;k++){const lag=k*L;if(i>=lag&&active[i]===active[i-lag]){one++;if(i>lag&&active[i-1]===active[i-lag-1])two++}}return [one,two]}
 function bounds(C,L){
  const D=3*L+1;let S=new Map([["",[0,0,0,0]]]),peak=1;
  for(const c of C){
   const T=new Map(),z=String.fromCharCode(c);
   function merge(h,a,b){const old=T.get(h);if(old){old[0]=Math.min(old[0],a[0]+b[0]);old[1]=Math.max(old[1],a[1]+b[0]);old[2]=Math.min(old[2],a[2]+b[1]);old[3]=Math.max(old[3],a[3]+b[1])}else T.set(h,[a[0]+b[0],a[1]+b[0],a[2]+b[1],a[3]+b[1]])}
   for(const [h,a] of S){
    if(c===0)merge(h,a,[0,0]);
    let n=0,m=0;
    for(let k=1;k<=3;k++){const lag=k*L;if(h.length>=lag&&h.charCodeAt(h.length-lag)===c){n++;if(h.length>lag&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-lag-1))m++}}
    merge((h+z).slice(-D),a,[n,m])
   }
   S=T;peak=Math.max(peak,S.size);
  }
  let a=[Infinity,-Infinity,Infinity,-Infinity];for(const b of S.values()){a[0]=Math.min(a[0],b[0]);a[1]=Math.max(a[1],b[1]);a[2]=Math.min(a[2],b[2]);a[3]=Math.max(a[3],b[3])}
  return {rune:[a[0],a[1]],bigram:[a[2],a[3]],peak};
 }
 const toy=[0,1,0,1,1,0,2,2,0,1,2,0,1];const zz=toy.flatMap((x,i)=>x===0?[i]:[]),g=[];
 for(let m=0;m<1<<zz.length;m++){const skip=new Set(zz.filter((_,i)=>m>>i&1));g.push(stats(toy.filter((_,i)=>!skip.has(i)),2))}
 const t=bounds(toy,2);assert(t.rune.join()===[Math.min(...g.map(x=>x[0])),Math.max(...g.map(x=>x[0]))].join()&&t.bigram.join()===[Math.min(...g.map(x=>x[1])),Math.max(...g.map(x=>x[1]))].join(),"toy brute");
 const hist=[{name:"WELCOME",C:readRunes(lp1.split("%").slice(1,3).join("%")),P:readRunes(donor.sections.find(s=>s.name==="0_welcome").source_text),K:[23,10,1,10,9,10,16,26]},{name:"KOAN",C:readRunes(lp1.split("$")[5]),P:readRunes(donor.sections.find(s=>s.name==="jpg107-167").source_text),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const positive=hist.map(({name,C,P,K})=>{
  assert(C.length===P.length,name+" length "+C.length+" "+P.length);let k=0;const re=P.map(v=>v===0?0:(v+K[k++%K.length])%29);assert(re.join()===C.join(),name+" replay");
  const active=P.filter(v=>v!==0),ac=C.filter((_,i)=>P[i]!==0),a=stats(active,K.length),b=stats(ac,K.length),bo=bounds(C,K.length);
  assert(a.join()===b.join()&&a[0]>=bo.rune[0]&&a[0]<=bo.rune[1]&&a[1]>=bo.bigram[0]&&a[1]<=bo.bigram[1],name+" exact invariant");
  return {name,n:C.length,period:K.length,pauses:C.length-active.length,cipherFs:C.filter(v=>!v).length,actual:a,bounds:bo}
 });
 const controls=raw.map((x,i)=>({name:["Shakespeare","Emerson","Gibran"][i],P:native(x)}));
 const pages=gp.pages.filter(p=>p.page<56),ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
 function compare(C,L,bo){
  return controls.map(({name,P})=>{
   const n=C.length,W=32,counts=[];
   for(let i=0;i<W;i++){const start=Math.round(i*(P.length-n)/(W-1));counts.push(stats(P.slice(start,start+n).filter(v=>v!==0),L))}
   const vals=j=>counts.map(x=>x[j]),r=vals(0),b=vals(1);
   return {name,windows:W,rune:[Math.min(...r),Math.max(...r)],bigram:[Math.min(...b),Math.max(...b)],runePass:r.filter(x=>x>=bo.rune[0]&&x<=bo.rune[1]).length,bigramPass:b.filter(x=>x>=bo.bigram[0]&&x<=bo.bigram[1]).length,jointPass:counts.filter(x=>x[0]>=bo.rune[0]&&x[0]<=bo.rune[1]&&x[1]>=bo.bigram[0]&&x[1]<=bo.bigram[1]).length}
  })
 }
 const result=[];
 for(const [a,b] of ranges){const C=pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);for(const L of [8,13]){const bo=bounds(C,L);result.push({pages:[a,b],n:C.length,period:L,cipherFs:C.filter(v=>v===0).length,...bo,controls:compare(C,L,bo)})}}
 return {positive,bruteToy:t,result}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3)),null,2));
