"use strict";
/** Agent10: fixed earlier Cicada book-code sources as exact cribs.
 * node sims/lp2_shared_cycle_historical_crib_sft.cjs
 */
const fs=require("node:fs");
const {indexed,solve}=require("./lp2_shared_cycle_native_crib_sft.cjs");
const A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const C=A.pages.filter(x=>x.page<56).flatMap(x=>x.indices),map=new Map(A.translit.map((x,i)=>[x,i]));
function normalize(t){
 const out=[];
 for(let w of t.normalize("NFKD").replace(/\p{M}/gu,"").toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let i=0;i<w.length;){const d=w.slice(i,i+2);
   if(d.length===2&&map.has(d)){out.push(map.get(d));i+=2}
   else{if(!map.has(w[i]))throw Error(w[i]);out.push(map.get(w[i++]));}
  }
 }
 return out;
}
const groups=[
 ["resources/external/blake-marriage-1906-gutenberg45315.txt"],
 ["resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt"],
 ["resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt"]
];
const expected=[18355,6958,7059,7484,41181];
let lens=[],outputs=[];
for(const group of groups){
 const D=group.map(name=>({name,P:normalize(fs.readFileSync(name,"utf8"))}));
 lens.push(...D.map(x=>x.P.length));
 for(const q of [8,13]){
  const z=indexed(C,D,q,48),hist={},feasible=[],unresolved=[];
  for(const r of z.rows){
   const v=solve(D[r.donor].P,r.j,C,r.i,48,q);
   hist[v.status]=(hist[v.status]||0)+1;
   if(v.status==="feasible")feasible.push({...r,...v});
   if(v.status==="unresolved")unresolved.push({...r,...v});
  }
  delete z.rows;
  outputs.push({source:group,...z,hist,feasible,unresolved,alignments:(C.length-47)*z.windows});
 }
}
if(C.length!==12956||lens.join(",")!==expected.join(","))throw Error("source lengths changed");
console.log(JSON.stringify({lens,outputs},null,2));
