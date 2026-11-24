"use strict";
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,native){
 const assert=(b,m)=>{if(!b)throw Error(m)};
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const mod=x=>(x+29)%29, ALL=(1<<29)-1;
 const C=corpus.pages.slice(15,23).flatMap(p=>p.indices);
 const cribs={"TWIN PRIME":[16,7,10,9,13,4,10,19,18],"NEXT PRIME":[9,18,14,16,13,4,10,19,18],"LIES EMPTY":[20,10,18,15,18,19,13,16,26],"THEIR MEANING":[2,18,10,4,19,28,9,10,21]};
 const lower=[7,10,20,20,17,18,0,3,1,9,23];
 assert(same(C.slice(0,20),[0,1,20,19,24,28,26,22,24,20,1,21,9,5,1,17,9,16,0,21]),"original header");
 assert(C.length===1903,"source count");
 assert(same(corpus.pages.slice(15,23).map(p=>p.indices.length),[159,267,273,260,271,269,273,131]),"page lengths");
 assert(lower[6]===0&&C[15]===17,"literal-F contradiction");
 function symbolic(C,P,q,cap=250000){
  let D=Array(q).fill(ALL);
  for(let i=0;i<P.length;i++){
   assert(P[i]!==0,"non-F crib");
   D[i%q]&=1<<mod(C[i]-P[i]);
   if(!D[i%q])return {death:i,reason:"crib conflict",peak:0};
  }
  let states=new Map();
  function put(M,p,d){M.set(p+":"+d.join(","),{p,d})}
  put(states,P.length%q,D);
  let peak=1;
  for(let i=P.length;i<C.length;i++){
   let c=C[i],next=new Map;
   for(let {p,d} of states.values()){
    if(c===0)put(next,p,d);
    let nd=d[p]&~(1<<c);
    if(nd){let e=d.slice();e[p]=nd;put(next,(p+1)%q,e)}
   }
   states=next;peak=Math.max(peak,states.size);
   if(!states.size)return {death:i,reason:"no compatible key/F history",peak};
   if(states.size>cap)throw Error("symbolic cap at "+i);
  }
  return {death:null,peak,states:[...states.values()]};
 }
 function encode(P,Q,mode){
  let q=Q.slice();
  return P.map(p=>{
   if(!p)return 0;
   const k=q[0],c=mod(p+k);
   q=q.slice(1).concat(mode==="periodic"?k:mode==="plain"?p:c);
   return c;
  });
 }
 function known(C,Q,mode,start){
  let st=new Map([[Q.join(","),Q.slice()]]),peak=1;
  for(let i=start;i<C.length;i++){
   let c=C[i],next=new Map();
   for(let q of st.values()){
    const k=q[0],p=mod(c-k);
    if(c===0)next.set(q.join(","),q);
    if(p!==0){
     let n=q.slice(1).concat(mode==="periodic"?k:mode==="plain"?p:c);
     next.set(n.join(","),n);
    }
   }
   st=next;peak=Math.max(peak,st.size);
   if(!st.size)return {death:i,peak};
   if(st.size>250000)throw Error("queue cap");
  }
  return {death:null,peak,states:st.size};
 }
 const rows=[];
 for(const [name,P] of Object.entries(cribs)){
  const K=C.slice(0,9).map((c,i)=>mod(c-P[i]));
  assert(same(encode(P,K,"periodic"),C.slice(0,9)),"crib replay");
  let periods=[];
  for(let q=1;q<=16;q++){const v=symbolic(C,P,q);assert(v.death!==null,"unexpected original survivor");periods.push({q,death:v.death,peak:v.peak})}
  const auto={};
  for(const mode of ["plain","cipher"]){
   const Q=mode==="plain"?P:C.slice(0,9);
   auto[mode]=known(C,Q,mode,9);
   assert(auto[mode].death!==null,"unexpected autokey survivor");
  }
  rows.push({name,key:K,periods,auto});
 }
 const sec=native.sections.find(s=>s.name==="0_koan_1");
 assert(sec,"native section");
 const donor=Array.from(sec.source_text).map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 assert(donor.length===780,"native KOAN length");
 const controls=[];
 for(const q of [8,9,13,16]){
  const P=cribs["TWIN PRIME"].concat(donor.slice(0,120));
  const K=Array.from({length:q},(_,i)=>(i*11+7)%29);
  const c=encode(P,K,"periodic");
  const v=symbolic(c,P.slice(0,9),q);
  const phase=P.filter(x=>x!==0).length%q;
  assert(v.death===null&&v.states.some(s=>s.p===phase&&K.every((k,i)=>(s.d[i]&(1<<k))!==0)),"true key/state missing");
  controls.push({q,fit:9,heldout:P.length-9,Fholds:P.filter(x=>x===0).length,consumingCipherF:c.filter((x,i)=>x===0&&P[i]!==0).length,endStates:v.states.length,peak:v.peak,trueKeyState:true});
 }
 for(const mode of ["plain","cipher"]){
  const P=cribs["TWIN PRIME"].concat(corpus.pages[57].indices);
  const K=Array.from({length:9},(_,i)=>(i*11+7)%29),c=encode(P,K,mode);
  const Q=mode==="plain"?P.slice(0,9):c.slice(0,9);
  const v=known(c,Q,mode,9);
  assert(v.death===null,"autokey plant rejected");
  controls.push({mode,fit:9,heldout:P.length-9,terminalStates:v.states,peak:v.peak});
 }
 return {sourceRunes:C.length,lowerF:{offset:15,cipher:C[15],proposedPlain:0},rows,controls};
}
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(run(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
