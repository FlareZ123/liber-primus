"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function pairResearch(gp,prev){
 const mod=(x,q)=>(x%q+q)%q;
 // Max over all hold masks for the supplied phase/rune objectives.
 function maxFor(C,q,assignments){
  const dp=new Int32Array(q).fill(-1000000);dp[0]=0;
  for(let i=0;i<C.length;i++){
   const x=C[i],p=i%q;
   if(x===0){let prev=dp[q-1];const a=assignments[0],b=assignments[1];const s1=a[1]===0?mod(p-a[0],q):-1,s2=b&&b[1]===0?mod(p-b[0],q):-1;
    for(let s=0;s<q;s++){const old=dp[s];dp[s]=Math.max(old+(s===s1||s===s2?1:0),prev);prev=old}
   }else for(const [r,c] of assignments)if(x===c)dp[mod(p-r,q)]++;
  }
  let v=0;for(const x of dp)v=Math.max(v,x);return v;
 }
 function bound(C,q){
  const singles=Array.from({length:q},(_,r)=>Array.from({length:29},(_,c)=>({c,v:maxFor(C,q,[[r,c]])})).sort((a,b)=>b.v-a.v));
  const edge=Array.from({length:q},()=>Array(q).fill(0));let dps=0;
  for(let r=0;r<q;r++)for(let t=r+1;t<q;t++){
   let best=0;
   for(const a of singles[r]){
    if(a.v+singles[t][0].v<=best)break;
    for(const b of singles[t]){
     if(a.v+b.v<=best)break;
     const score=maxFor(C,q,[[r,a.c],[t,b.c]]);dps++;best=Math.max(best,score);
    }
   }
   edge[r][t]=edge[t][r]=best;
  }
  // Any partition of phases gives an upper bound. Minimize over all
  // disjoint pairs and, when q is odd, one singleton.
  const memo=new Map();
  function match(mask){
   if(mask===0)return {v:0,pairs:[]};if(memo.has(mask))return memo.get(mask);
   const r=31-Math.clz32(mask&-mask),rest=mask^(1<<r);let best={v:Infinity};
   if((q%2===1)&&(pop(mask)%2===1)){const tail=match(rest);best={v:singles[r][0].v+tail.v,pairs:[[r],...tail.pairs]}}
   for(let t=r+1;t<q;t++)if(rest&(1<<t)){const tail=match(rest^(1<<t)),v=edge[r][t]+tail.v;if(v<best.v)best={v,pairs:[[r,t],...tail.pairs]}}
   memo.set(mask,best);return best;
  }
  function pop(x){let n=0;for(;x;x&=x-1)n++;return n}
  const matching=match((1<<q)-1);
  // Every phase appears q-1 times in the complete graph.
  let total=0;for(let r=0;r<q;r++)for(let t=r+1;t<q;t++)total+=edge[r][t];
  const complete=Math.floor(total/(q-1));
  const singleton=singles.reduce((s,x)=>s+x[0].v,0);
  const cap=Math.min(singleton,matching.v,complete);
  return {q,singleton,matching,complete,cap,dps,edges:edge};
 }
 let seed=0x331015;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};let toy=0;
 for(let j=0;j<24;j++){
  const C=Array.from({length:10},()=>rnd()%4);
  for(const q of [2,3,4,5]){
   const b=bound(C,q),z=C.filter(x=>x===0).length;let joint=0;const brute=Array.from({length:q},()=>Array(q).fill(0));
   for(let mask=0;mask<2**z;mask++){
    let k=0,phase=0,h=Array.from({length:q},()=>Array(29).fill(0));
    for(const x of C){if(x===0&&((mask>>k++)&1))continue;h[phase][x]++;phase=(phase+1)%q}
    const v=h.map(row=>Math.max(...row));joint=Math.max(joint,v.reduce((a,b)=>a+b,0));for(let r=0;r<q;r++)for(let t=r+1;t<q;t++)brute[r][t]=brute[t][r]=Math.max(brute[r][t],v[r]+v[t]);
   }
   if(JSON.stringify(brute)!==JSON.stringify(b.edges)||b.cap<joint)throw Error("pair toy mismatch");toy++;
  }
 }
 const plants=[];
 for(const q of [8,13]){
  // Deterministic explicit-space control with one frequent designated symbol.
  const P=Array.from({length:1000},()=>rnd()%5===0?26:rnd()%26),maps=Array.from({length:q},()=>{const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rnd()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p});
  let phase=0;const C=P.map(x=>{if(x===5)return 0;const y=maps[phase][x];phase=(phase+1)%q;return y});
  const b=bound(C,q),spaces=P.filter(x=>x===26).length;if(b.cap<spaces)throw Error("pair plant");plants.push({q,spaces,...b});
 }
 const originals=[];
 for(const p of prev.original.filter(x=>x.b!==55||x.a===54)){
  const C=gp.pages.filter(x=>x.page>=p.a&&x.page<=p.b).flatMap(x=>x.indices);
  for(const q of [8,13]){
   if(p.latentRejected.includes(q))continue;
   const result=bound(C,q);const old=p.caps.find(x=>x.q===q).latent;
   if(result.singleton!==old)throw Error("single bound mismatch");
   originals.push({a:p.a,b:p.b,n:C.length,min:p.min,...result,excluded:result.cap<p.min});
  }
 }
 return {toy,plants,originals};
}
console.log(JSON.stringify(pairResearch(read("resources/liber-primus/lp2-corpus.json"),read("im-results/lp2-explicit-space-allphase-holdcap.json")),null,2));
