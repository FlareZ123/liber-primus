"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {mtFloats}=require("./lp2_shared_rng_rejection_marginal_sft.cjs");
const S=.81288;
/** Consuming P in 1..28; literal F emits 0 without drawing.
 * Two fixed previous-cipher policies, physical or consuming.
 * Schedule: conditional coin, or paired key-first/coin-first.
 * The state includes previous ciphertext even on latent-F ambiguity.
 */
function machine(seed,n,schedule){
 let U=mtFloats(seed,2*(n+64)),extensions=0;
 function draw(j){if(j>=U.length){U=mtFloats(seed,Math.max(j+1,2*U.length));extensions++}return U[j]}
 const paired=schedule!=="conditional",coinFirst=schedule==="paired coin first";
 function trial(j){return paired?[Math.floor(29*draw(2*j+Number(coinFirst))),draw(2*j+Number(!coinFirst))]:[Math.floor(29*draw(j)),null]}
 function branches(j,prev,c,s){
   const [k,u]=trial(j),out=[];
   if(c!==prev){const p=(c+29-k)%29;if(p)out.push({j:j+1,p})}
   if(prev>=0){const p=(prev+29-k)%29;if(p){
     let t=j,emit=prev;
     if(paired){while(true){const [v,coin]=trial(t++);emit=(p+v)%29;if(emit!==prev||coin>=s)break}}
     else {t=j+1;while(draw(t++)<s){emit=(p+Math.floor(29*draw(t++)))%29;if(emit!==prev)break}}
     if(emit===c)out.push({j:t,p});
   }}
   return out;
 }
 function plant(P,s,policy){
   let j=0,prev=-1,rejects=0,holds=0,C=[];
   for(const p of P){
     if(!p){C.push(0);holds++;if(policy==="physical")prev=0;continue}
     let emit;while(true){const [k,u]=trial(j++);emit=(p+k)%29;if(emit!==prev)break;const coin=paired?u:draw(j++);if(coin>=s)break;rejects++}
     C.push(emit);prev=emit;
   }return {C,j,rejects,holds};
 }
 return {branches,plant,extensions:()=>extensions};
}
function reach(C,seed,schedule,policy,s=S){
 const M=machine(seed,C.length,schedule);let states=new Set([0]),maxStates=1;
 for(let i=0;i<C.length;i++){
   const c=C[i],next=new Set();
   for(const a of states){const j=Math.floor(a/30),prev=a%30-1;
     if(c===0)next.add(j*30+(policy==="physical"?1:prev+1));
     for(const b of M.branches(j,prev,c,s))next.add(b.j*30+c+1);
   }
   if(!next.size)return {complete:false,firstDead:i,maxStates,extensions:M.extensions()};
   states=next;maxStates=Math.max(maxStates,next.size);
 }
 return {complete:true,firstDead:null,finalStates:states.size,maxStates,extensions:M.extensions()};
}
function controls(C,P,seed){
 const rows=[];
 for(const schedule of ["conditional","paired key first","paired coin first"])for(const policy of ["physical","consuming"]){
   const E=machine(seed,P.length,schedule).plant(P,S,policy),yes=reach(E.C,seed,schedule,policy),no=reach(E.C,0x72493481,schedule,policy);
   assert.ok(yes.complete);rows.push({schedule,policy,holds:E.holds,rejects:E.rejects,trueEnd:E.j,yes,no});
 }return rows;
}
module.exports={machine,reach,controls,S};
if(require.main===module){
 const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8")),C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const P=Array.from(mtFloats(0x3301,C.length),x=>Math.floor(x*29)),seed=7144649572585460758n;
 console.log(JSON.stringify({controls:controls(C,P,seed),original:["conditional","paired key first","paired coin first"].flatMap(schedule=>["physical","consuming"].map(policy=>({schedule,policy,...reach(C,seed,schedule,policy)})))},null,2));
}
