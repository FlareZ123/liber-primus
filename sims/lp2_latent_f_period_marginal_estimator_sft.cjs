"use strict";
/** Issue #2603: marginal latent-F pairwise period estimator, no language-key search. */
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,lp1,gold,raw){
 const assert=(x,m)=>{if(!x)throw Error(m)}, mod=(x,q)=>(x%q+q)%q;
 const ix=new Map(gp.runes.map((v,i)=>[v,i]));
 const extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function encrypt(P,K){let j=0;return P.map(v=>v===0?0:mod(v+K[j++%K.length],29))}
 const training=gold.sections.filter(s=>!["0_welcome","jpg107-167","0_koan_1","0_loss_of_divinity"].includes(s.name)).flatMap(s=>extract(s.source_text)).filter(x=>x!==0);
 const H=Array(29).fill(.25);H[0]=0;for(const x of training)H[x]++;
 const Z=H.reduce((a,b)=>a+b,0),p=H.map(x=>x/Z);
 const diff=Array.from({length:29},(_,d)=>p.reduce((a,x,j)=>a+x*p[(j+d)%29],0)*(d===0?28:27)/29);
 const dz=diff.reduce((a,b)=>a+b,0);
 const feat=diff.map((x,d)=>x/dz/(d===0?1/28:27/784)-1);
 const Q=Array.from({length:23},(_,i)=>i+2),D=96,hold=.4;
 const binom=[[1]];for(let m=1;m<D;m++){const a=binom[m-1];binom.push(Array.from({length:m+1},(_,h)=>(a[h]||0)*(1-hold)+(a[h-1]||0)*hold))}
 function weight(q,d,m){let w=0;for(let h=0;h<=m;h++)if((d-h)%q===0)w+=binom[m][h];return w}
 function prepare(C){
  const pref=[0];for(const v of C)pref.push(pref.at(-1)+(v===0));
  const left=[],right=[],bb=[],B=[],ids=new Map();
  for(let i=0;i<C.length;i++)if(C[i]!==0)for(let j=i+1;j<Math.min(C.length,i+D+1);j++)if(C[j]!==0){
   const d=j-i,m=pref[j]-pref[i+1],id=d*D+m;let b=ids.get(id);
   if(b===undefined){b=B.length;ids.set(id,b);B.push({d,m,n:0})}
   B[b].n++;left.push(i);right.push(j);bb.push(b)
  }
  const n=left.length,weights=Q.map(q=>{
   const w=B.map(({d,m})=>weight(q,d,m)),mean=w.reduce((s,x,b)=>s+x*B[b].n,0)/n;
   const den=Math.sqrt(w.reduce((s,x,b)=>s+B[b].n*(x-mean)**2,0));
   return w.map(x=>(x-mean)/den)
  });
  return {left:Int32Array.from(left),right:Int32Array.from(right),bb:Int16Array.from(bb),weights,B,n}
 }
 function rank(C,g){
  const s=new Float64Array(g.B.length);let sum=0,sq=0;
  for(let i=0;i<g.n;i++){const x=feat[(C[g.right[i]]-C[g.left[i]]+29)%29];s[g.bb[i]]+=x;sum+=x;sq+=x*x}
  const sd=Math.sqrt(Math.max(1e-15,sq/g.n-(sum/g.n)**2));
  return Q.map((q,k)=>({q,z:g.weights[k].reduce((a,w,b)=>a+w*s[b],0)/sd})).sort((a,b)=>b.z-a.z||a.q-b.q)
 }
 function test(name,C,truth,seed){
  const g=prepare(C),r=rank(C,g),random=rng(seed),pos=C.flatMap((x,i)=>x===0?[]:[i]),orig=pos.map(i=>C[i]),sh=C.slice(),maxima=[];
  for(let k=0;k<99;k++){const v=orig.slice();for(let j=v.length-1;j>0;j--){const a=Math.floor(random()*(j+1));[v[j],v[a]]=[v[a],v[j]]}for(let j=0;j<v.length;j++)sh[pos[j]]=v[j];maxima.push(rank(sh,g)[0].z)}
  const nullMax=Math.max(...maxima),gap=r[0].z-r[1].z,pValue=(1+maxima.filter(x=>x>=r[0].z).length)/100,selected=r[0].z>nullMax&&gap>=.75?r[0].q:null;
  return {name,n:C.length,visibleF:C.length-pos.length,truth,selected,trueRank:truth===null?null:r.findIndex(x=>x.q===truth)+1,top:r.slice(0,5),gap,nullMax,pValue}
 }
 const hist=[{name:"WELCOME",C:extract(lp1.split("%").slice(1,3).join("%")),P:extract(gold.sections.find(s=>s.name==="0_welcome").source_text),K:[23,10,1,10,9,10,16,26]},{name:"KOAN",C:extract(lp1.split("$")[5]),P:extract(gold.sections.find(s=>s.name==="jpg107-167").source_text),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const authentic=hist.map(({name,C,P,K},i)=>{assert(C.length===P.length&&encrypt(P,K).join()===C.join(),name+" exact replay");return test(name,C,K.length,0xA260300+i)});
 const donors=raw.map(native),names=["Shakespeare","Emerson","Gibran"],periods=[3,5,7,9,11,12,15,17,19,21,23,24],lengths=[319,515,840],plants=[],nulls=[];
 for(let i=0;i<periods.length;i++){
  const random=rng(0xB260300+i),q=periods[i],n=lengths[i%3],donor=Math.floor(i/4),Pall=donors[donor],start=1000+Math.floor(random()*(Pall.length-n-2000));
  const P=Pall.slice(start,start+n);assert(P.length===n,"donor length");
  const K=Array.from({length:q},()=>Math.floor(random()*29));
  assert(!Array.from({length:q-1},(_,i)=>i+1).some(k=>q%k===0&&K.every((v,j)=>v===K[j%k])),"nonprimitive key");
  plants.push({...test(names[donor]+"-"+start,encrypt(P,K),q,0xC260300+i),key:K});
  const pad=Array.from({length:n},()=>Math.floor(random()*29));
  nulls.push(test(names[donor]+"-independent-pad-"+start,encrypt(P,pad),null,0xD260300+i))
 }
 const gate={authentic:authentic.filter(x=>x.selected===x.truth).length,correctPlants:plants.filter(x=>x.selected===x.truth).length,wrongPlants:plants.filter(x=>x.selected!==null&&x.selected!==x.truth).length,falsePad:nulls.filter(x=>x.selected!==null).length};
 gate.pass=gate.authentic===2&&gate.correctPlants>=9&&gate.wrongPlants===0&&gate.falsePad<=1;
 let original=null;
 if(gate.pass){const C=gp.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);assert(C.length===1680,"target length");original=test("physical p33–39 first 840",C.slice(0,840),null,0xE260300)}
 return {method:{periods:Q,maxLag:D,holdPrior:hold,trainingLength:training.length,feature:feat,nullPermutations:99,gapThreshold:.75},authentic,plants,nulls,gate,original}
}
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp1_wulfic_canonical.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3)),null,2));
