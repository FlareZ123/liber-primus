"use strict";
// Agent18: exact outer-relabel-independent rare-rune q8 histogram certificate.
function evaluate(raw){
 const [g,rg,rs,re,prior,gold,lp1]=[JSON.parse(raw[0]),raw[1],raw[2],raw[3],JSON.parse(raw[4]),JSON.parse(raw[5]),raw[6]];
 const assert=(x,m)=>{if(!x)throw Error(m)},C=g.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),n=C.length,q=8,B=3,k=5;
 let hash=2166136261;for(const c of C)hash=Math.imul(hash^c,16777619)>>>0;assert(n===3008&&hash===1862123327,"source tape");
 const pc=x=>{x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24};
 function solver(c,q,h,B){
  const blocks=[];let b=[];for(const x of c){if(x===h){blocks.push(b);b=[]}else b.push(x)}blocks.push(b);
  const data=blocks.map(b=>{const m=Array.from({length:q},()=>new Int32Array(B+1)),ct=Array.from({length:q},()=>new Int16Array(29));for(let i=0;i<b.length;i++){let j=i%q,x=b[i],v=ct[j][x]++;if(v<=B)m[j][v]|=1<<x}return {n:b.length,m}});
  const d=new Uint8Array(q),e=new Uint8Array(q),INF=B+1;
  function cost(set,m,limit){let v=0;for(let i=0;i<=B;i++){const x=set&m[i];if(!x)break;v+=pc(x);if(v>limit)return INF}return v}
  return (S,T=0,limit=B)=>{
   d.fill(0);
   for(let z=0;z<data.length;z++){
    const {n,m}=data[z];e.fill(INF);let ok=false;
    for(let s=0;s<q;s++){
     let v=d[s];if(v>limit)continue;v+=cost(S,m[(q-s)%q],limit-v);if(v>limit)continue;
     if(T)v+=cost(T,m[(q+1-s)%q],limit-v);if(v>limit)continue;
     const p=(s+n)%q;if(v<e[p])e[p]=v;ok=true;
     if(z+1<data.length){v+= +(p===0&&!!(S&1<<h)||p===1&&!!(T&1<<h));if(v<=limit&&v<e[(p+1)%q])e[(p+1)%q]=v}
    }
    if(!ok)return INF;d.set(e)
   }
   return Math.min(...d)
  }
 }
 // Independent per-symbol transition DP, with no run masks or subset pruning.
 function direct(c,q,h,S,T=0){
  let d=Array(q).fill(0);
  for(const x of c){let e=Array(q).fill(Infinity);for(let j=0;j<q;j++){if(x===h)e[j]=Math.min(e[j],d[j]);const v=d[j]+ +(j===0&&!!(S&1<<x)||j===1&&!!(T&1<<x));e[(j+1)%q]=Math.min(e[(j+1)%q],v)}d=e}
  return Math.min(...d)
 }
 function certify(c,q,h,B,k,A=29){
  const solve=solver(c,q,h,B);let old=[[0,0]],total=0,by=[];
  for(let n=1;n<=k;n++){
   let next=[];for(const [s] of old){const lo=s?32-Math.clz32(s):0;for(let a=lo;a<A;a++){const v=s|1<<a,w=solve(v);total++;if(w<=B)next.push([v,w])}}
   old=next;by.push(old.length);if(!old.length)break;
  }
  const counts=Array(B+1).fill(0);for(const [s,v] of old)counts[v]++;
  let best=B+1,checks=0,witness=null;const pool=old.sort((a,b)=>a[1]-b[1]);
  if(pool.length)outer:for(const [s,x] of pool){if(x+pool[0][1]>=best)break;for(const [t,y] of pool){if(x+y>=best)break;checks++;const v=solve(s,t,best-1);if(v<best){best=v;witness=[s,t];if(best===0)break outer}}}
  return {h,by,counts,checks,clippedPairMinimum:best,lower:Math.ceil(q*best/2),witness,total}
 }
 let seed=0x183029;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 let toyPairs=0;
 for(let t=0;t<24;t++){
  const A=7,p=3+t%3,h=rng()%A,c=Array.from({length:18},()=>rng()%A),sets=[];
  for(let s=0;s<1<<A;s++)if(pc(s)===3)sets.push(s);
  let best=B+1;const solve=solver(c,p,h,B);
  for(const S of sets)for(const T of sets){let a=Math.min(B+1,direct(c,p,h,S,T));assert(a===solve(S,T),"toy direct DP mismatch");best=Math.min(best,a);toyPairs++}
  assert(certify(c,p,h,B,3,A).clippedPairMinimum===best,"toy full-pair subset pruning mismatch")
 }
 const rows=[];for(let h=0;h<29;h++)rows.push(certify(C,q,h,B,k));
 assert(rows.every(x=>x.clippedPairMinimum===4&&x.witness===null),"original certificate");
 let originalChecks=0;
 for(let j=0;j<128;j++){let h=rng()%29,S=0,T=0;while(pc(S)<5)S|=1<<(rng()%29);while(pc(T)<5)T|=1<<(rng()%29);assert(solver(C,q,h,B)(S,T)===Math.min(B+1,direct(C,q,h,S,T)),"original sampled direct mismatch");originalChecks++}
 const tok=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"token");out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,start,end){const a=s.indexOf(start),b=s.indexOf(end);assert(a>=0&&b>a,"body");return s.slice(a,b)}
 const refs=[["Gibran",donor(body(rg,"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet"))],["Shakespeare",donor(rs)],["Emerson",donor(body(re,"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))]];
 const hist=p=>{const H=Array(29).fill(0);for(const x of p)H[x]++;return H};
 const rare4=H=>Array.from({length:28},(_,i)=>i+1).sort((a,b)=>H[a]-H[b]||a-b).slice(0,4);
 const comparisons=[],plants=[];
 function enc(p,key,start,pi){let phase=start;return p.map(x=>x===0?pi[0]:pi[(x+key[phase++%key.length])%29])}
 function checkPlant(p,key,start,pi,label){
  const c=enc(p,key,start,pi),H=hist(p),rare=rare4(H),set=rare.concat(0),actual=Array(q).fill(0);let phase=start;
  for(const x of p){if(x===0)continue;const j=phase++%q;if(rare.includes(x))actual[j]++}
  const conditional=[];
  for(let j=0;j<q;j++){
   const S=set.reduce((m,x)=>m|1<<pi[(x+key[j])%29],0),T=set.reduce((m,x)=>m|1<<pi[(x+key[(j+1)%q])%29],0);
   const v=direct(c,q,pi[0],S,T);assert(v<=actual[j]+actual[(j+1)%q],"true path excluded");assert(solver(c,q,pi[0],B)(S,T)===Math.min(B+1,v),"native DP mismatch");conditional.push(v)
  }
  const lower=Math.ceil(conditional.reduce((a,b)=>a+b,0)/2);assert(lower<=rare.reduce((a,x)=>a+H[x],0),"native bound false positive");
  return {label,n:p.length,start,key,pi,held:pi[0],rare,rareCount:rare.reduce((a,x)=>a+H[x],0),conditional,lower}
 }
 for(const [j,[name,v]] of refs.entries()){
  const H=hist(v.slice(0,n));let eligible=0,rareOnly=0,relaxedJoint=0,min=Infinity,max=0,allMin=Infinity,allMax=0,first=-1;
  for(let i=0;i<=v.length-n;i++){
   const rare=rare4(H).reduce((a,x)=>a+H[x],0);allMin=Math.min(allMin,rare);allMax=Math.max(allMax,rare);rareOnly+= +(rare<16);relaxedJoint+= +(rare>=16&&H[18]<=314&&prior.bounds.some(b=>H[0]<=b[0]));
   if(prior.bounds.some(b=>H[0]<=b[0]&&H[18]<=b[1])){eligible++;min=Math.min(min,rare);max=Math.max(max,rare);if(first<0)first=i;assert(rare<16,"outer q8 donor survivor")}
   if(i<v.length-n){H[v[i]]--;H[v[i+n]]++}
  }
  assert(eligible===prior.comparisons[j].pass[0],"prior eligibility counts");
  comparisons.push({name,windows:v.length-n+1,eligible,min,max,allMin,allMax,rareOnly,relaxedJoint});
  assert(first>=0,"missing donor");const p=v.slice(first,first+n),before=hist(p);for(let i=p.length-1;i>0;i--){let a=rng()%(i+1);[p[i],p[a]]=[p[a],p[i]]}assert(hist(p).join()===before.join(),"transport histogram");
  const pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let a=rng()%(i+1);[pi[i],pi[a]]=[pi[a],pi[i]]}
  plants.push(checkPlant(p,Array.from({length:q},()=>rng()%29),rng()%q,pi,name+" arbitrarily transported"));
 }
 const idx=new Map(g.runes.map((x,i)=>[x,i])),extract=s=>Array.from(s).filter(x=>idx.has(x)).map(x=>idx.get(x));
 const p=extract(gold.sections[1].source_text),actual=extract(lp1.split("$")[1]),key=[23,10,1,10,9,10,16,26],pi=Array.from({length:29},(_,i)=>i);
 assert(p.length===515&&enc(p,key,0,pi).join()===actual.join(),"authentic WELCOME replay");
 const authentic=checkPlant(p,key,0,pi,"authentic WELCOME");
 return {n,hash,q,k,B,rows,comparisons,plants,authentic,toyPairs,originalChecks,totalSubsets:rows.reduce((a,x)=>a+x.total,0),totalPairs:rows.reduce((a,x)=>a+x.checks,0),excluded:comparisons.reduce((a,x)=>a+x.eligible,0)}
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","im-results/lp2-outer-fhold-reference-output.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(evaluate(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
