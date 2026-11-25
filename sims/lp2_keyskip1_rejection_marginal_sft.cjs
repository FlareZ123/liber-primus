"use strict";
// For uniform independent plaintext runes, marginalize every valid key path.
// maxSkip=3 matches S2 exact decoder path support; generator is the unlimited
// soft-rejection loop. The full iid-key baseline is not truncated.
function marginal(C,K,cap=800,s=0.81288,maxSkip=3){
 const D=new Float64Array(cap+1);D[0]=1;
 const lists=Array.from({length:29},()=>[]);
 const run=new Uint8Array(K.length);
 for(let j=1;j<K.length;j++){lists[(K[j]-K[j-1]+29)%29].push(j);run[j]=1;if(j>1&&K[j-2]===K[j-1])run[j]=Math.min(maxSkip,run[j-1]+1)}
 const weights=Array.from({length:maxSkip+1},(_,i)=>s**i);
 const cursors=new Int32Array(29);let scale=0;
 for(let i=1;i<C.length;i++){
   const delta=(C[i]-C[i-1]+29)%29,list=lists[delta];
   let hi=cursors[delta];while(hi<list.length&&list[hi]<=i+cap)hi++;cursors[delta]=hi;
   for(let t=hi-1;t>=0&&list[t]>i;t--){
     const j=list[t],d=j-i,lim=Math.min(d,run[j],maxSkip);
     let v=0;for(let k=1;k<=lim;k++)v+=weights[k]*D[d-k];
     D[d]+=v;
   }
   if((i&255)===0){let z=0;for(let d=0;d<=cap;d++)z+=D[d];for(let d=0;d<=cap;d++)D[d]/=z;scale+=Math.log(z)}
 }
 let z=0,mean=0,edge=0;for(let d=0;d<=cap;d++){z+=D[d];mean+=d*D[d];if(d>=cap-50)edge+=D[d]}
 return {llr:scale+Math.log(z)+(C.length-1)*Math.log1p(-s/29),meanSkips:mean/z,edgeMass:edge/z}
}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function plant(P,K,seed,s=0.81288){const rnd=rng(seed),C=[];let j=0,prev=-1,skips=0,maxSkips=0;for(const p of P){let c=(p+K[j++])%29,k=0;while(c===prev&&rnd()<s){c=(p+K[j++])%29;k++}skips+=k;maxSkips=Math.max(maxSkips,k);C.push(c);prev=c}return{C,skips,maxSkips}}
function run(corpus,prior,shakespeare,convert,mt){const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),P=convert(shakespeare,corpus.translit),controls=[];let firstPlant;for(let i=0;i<16;i++){const seed=0x31415926+i,K=mt(seed,C.length+801),rr=rng(seed^0xabcdef01);const U=Array.from({length:C.length},()=>Math.floor(rr()*29));for(const [kind,plain] of [["native",P.slice(i*1000,i*1000+C.length)],["uniform",U]]){const E=plant(plain,K,seed^0x12345678);if(i===0&&kind==="native")firstPlant=E.C;controls.push({seed,kind,trueSkips:E.skips,maxSkips:E.maxSkips,repeats:E.C.slice(1).filter((x,i)=>x===E.C[i]).length,...marginal(E.C,K)})}}
 const nulls=prior.nulls.map(x=>{const K=mt(x.seed,C.length+801);return {seed:x.seed,original:marginal(C,K),plant:marginal(firstPlant,K)}});
 const candidates=prior.rows.flatMap(x=>{const vals=[{rank:x.rank,seed:x.seed,variant:"literal",...marginal(C,mt(x.seed,C.length+801))}];if(x.seed>4294967295)vals.push({rank:x.rank,seed:x.seed>>>0,variant:"low32",...marginal(C,mt(x.seed>>>0,C.length+801))});return vals});
 return {threshold:Math.log(candidates.length/.05),controls,nulls,candidates};
}
module.exports={marginal,plant,run};
if(require.main===module){const fs=require("node:fs"),read=p=>fs.readFileSync(p,"utf8"),corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),prior=JSON.parse(read("im-results/lp2-r18-skipcount-feasibility-output.json")),shakespeare=read("resources/control/shakespeare_first300k.txt");const {convert}=require("./lp2_perl_pgp_keyskip1_sft.cjs"),{mt}=require("./lp2_r18_skipcount_feasibility_sft.cjs");console.log(JSON.stringify(run(corpus,prior,shakespeare,convert,mt),null,2))}
