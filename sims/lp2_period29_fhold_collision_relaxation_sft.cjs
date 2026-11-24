"use strict";
/** #2537: L=29 exact all-subset F-hold collision relaxation and chapter selector. */
const fs=require("node:fs"),path=require("node:path");
function run(gp,raw,controlsRaw){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const ix=new Map(gp.runes.map((v,i)=>[v,i]));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){
  const out=[];
  for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
   w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
   while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("unmapped native token: "+w);out.push(t.i);w=w.slice(t.s.length)}
  }
  return out;
 }
 function stats(active,L){
  let one=0,two=0;
  for(let i=0;i<active.length;i++)for(let k=1;k<=3;k++){
   const lag=k*L;
   if(i>=lag&&active[i]===active[i-lag]){
    one++;
    if(i>lag&&active[i-1]===active[i-lag-1])two++;
   }
  }
  return [one,two];
 }
 function bounds(C,L){
  const D=3*L+1;
  let S=new Map([["",[0,0,0,0]]]),peak=1;
  for(const c of C){
   const T=new Map(),z=String.fromCharCode(c);
   function merge(h,a,b){
    const old=T.get(h);
    if(old){
     old[0]=Math.min(old[0],a[0]+b[0]);
     old[1]=Math.max(old[1],a[1]+b[0]);
     old[2]=Math.min(old[2],a[2]+b[1]);
     old[3]=Math.max(old[3],a[3]+b[1]);
    }else T.set(h,[a[0]+b[0],a[1]+b[0],a[2]+b[1],a[3]+b[1]]);
   }
   for(const [h,a] of S){
    if(c===0)merge(h,a,[0,0]);
    let n=0,m=0;
    for(let k=1;k<=3;k++){
     const lag=k*L;
     if(h.length>=lag&&h.charCodeAt(h.length-lag)===c){
      n++;
      if(h.length>lag&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-lag-1))m++;
     }
    }
    merge((h+z).slice(-D),a,[n,m]);
   }
   S=T;
   peak=Math.max(peak,S.size);
  }
  let a=[Infinity,-Infinity,Infinity,-Infinity];
  for(const b of S.values()){
   a[0]=Math.min(a[0],b[0]);a[1]=Math.max(a[1],b[1]);
   a[2]=Math.min(a[2],b[2]);a[3]=Math.max(a[3],b[3]);
  }
  return {rune:[a[0],a[1]],bigram:[a[2],a[3]],peak};
 }
 // Verify the all-subset DP against brute force on a short toy stream.
 const toy=[0,1,0,1,1,0,2,2,0,1,2,0,1],zero=toy.flatMap((x,i)=>x===0?[i]:[]);
 const brute=[];
 for(let m=0;m<(1<<zero.length);m++){
  const skip=new Set(zero.filter((_,i)=>(m>>i)&1));
  brute.push(stats(toy.filter((_,i)=>!skip.has(i)),2));
 }
 const toyBounds=bounds(toy,2);
 assert(toyBounds.rune.join()===[Math.min(...brute.map(x=>x[0])),Math.max(...brute.map(x=>x[0]))].join(),"toy rune bound");
 assert(toyBounds.bigram.join()===[Math.min(...brute.map(x=>x[1])),Math.max(...brute.map(x=>x[1]))].join(),"toy bigram bound");

 const controls=controlsRaw.map((x,i)=>({name:["Shakespeare","Emerson","Gibran"][i],P:native(x)}));
 const pages=gp.pages.filter(p=>p.page<56);
 const ranges=[[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[54,55]];
 const L=29;
 const result=[];
 for(const [a,b] of ranges){
  assert(!(a<=0&&b>=0)&&!(a<=53&&b>=40),"forbidden target range");
  const C=pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
  const bo=bounds(C,L);
  const comparison=controls.map(({name,P})=>{
   const n=C.length,W=32,counts=[];
   for(let i=0;i<W;i++){
    const start=Math.round(i*(P.length-n)/(W-1));
    counts.push(stats(P.slice(start,start+n).filter(v=>v!==0),L));
   }
   const r=counts.map(x=>x[0]),g=counts.map(x=>x[1]);
   return {
    name,windows:W,
    runeRange:[Math.min(...r),Math.max(...r)],
    bigramRange:[Math.min(...g),Math.max(...g)],
    runePass:r.filter(x=>x>=bo.rune[0]&&x<=bo.rune[1]).length,
    bigramPass:g.filter(x=>x>=bo.bigram[0]&&x<=bo.bigram[1]).length,
    jointPass:counts.filter(x=>x[0]>=bo.rune[0]&&x[0]<=bo.rune[1]&&x[1]>=bo.bigram[0]&&x[1]<=bo.bigram[1]).length
   };
  });
  result.push({
   pages:[a,b],length:C.length,cipherFs:C.filter(x=>x===0).length,
   bounds:bo,controls:comparison,
   totalNativeJointPass:comparison.reduce((n,x)=>n+x.jointPass,0)
  });
 }
 const eligible=result.filter(x=>x.totalNativeJointPass>0);
 eligible.sort((a,b)=>b.totalNativeJointPass-a.totalNativeJointPass||b.length-a.length||a.pages[0]-b.pages[0]);
 return {
  period:L,
  invariant:"all legal subsets of ciphertext F holds; same-phase rune and bigram collisions at lags L,2L,3L",
  selectionRule:"among eligible chapters choose max summed native-control jointPass, then longest rune length, then earliest page start; no plaintext scoring",
  toyBruteForceCheck:{rune:toyBounds.rune,bigram:toyBounds.bigram,states:toyBounds.peak},
  chapters:result,
  selectedChapter:eligible[0]||null
 };
}
const files=[
 "resources/liber-primus/lp2-corpus.json",
 "resources/control/shakespeare_first300k.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/gibran_prophet_58585.txt"
];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const out=run(JSON.parse(d[0]),d.slice(1)[0],d.slice(1));
console.log(JSON.stringify(out,null,2));
