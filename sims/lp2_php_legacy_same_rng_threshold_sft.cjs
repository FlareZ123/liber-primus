"use strict";
// LP2 puzzle-only source-ranked legacy PHP generator experiment.
// Adapted from Agent 4's lp2_shared_rng_fhold_inverse_sft.cjs (exact interval inverse).
const fs=require("node:fs"),path=require("node:path");
const {LegacyPhpMt}=require("./php_legacy_mt.cjs");
function mtFloats(seed,n){const g=new LegacyPhpMt(Number(BigInt(seed)&0xffffffffn));return Float64Array.from({length:n},()=>g.next31()/2147483648)}
const S=.81288;
/** Consuming P in 1..28; literal F emits 0 without drawing.
 * Two fixed previous-cipher policies, physical or consuming.
 * Schedule: conditional coin, or paired key-first/coin-first.
 * The state includes previous ciphertext even on latent-F ambiguity.
 */
function machine(seed,n,schedule,ordinary=false){
 let U=mtFloats(seed,2*(n+64)),extensions=0;
 function draw(j){if(j>=U.length){U=mtFloats(seed,Math.max(j+1,2*U.length));extensions++}return U[j]}
 const paired=schedule!=="conditional",coinFirst=schedule==="paired coin first";
 function trial(j){return paired?[Math.floor(29*draw(2*j+Number(coinFirst))),draw(2*j+Number(!coinFirst))]:[Math.floor(29*draw(j)),null]}
 function branches(j,prev,c,s){
   const [k,u]=trial(j),out=[];
   if(c!==prev){const p=(c+29-k)%29;if(ordinary||p)out.push({j:j+1,p})}
   if(prev>=0){const p=(prev+29-k)%29;if(ordinary||p){
     let t=j,emit=prev;
     if(paired){while(true){const [v,coin]=trial(t++);emit=(p+v)%29;if(emit!==prev||coin>=s)break}}
     else {t=j+1;while(draw(t++)<s){emit=(p+Math.floor(29*draw(t++)))%29;if(emit!==prev)break}}
     if(emit===c)out.push({j:t,p});
   }}
   return out;
 }
 function intervalBranches(j,prev,c,lo,hi){
   const [k]=trial(j),out=[];
   if(c!==prev){const p=(c+29-k)%29;if(ordinary||p)out.push({j:j+1,p,lo,hi})}
   if(prev>=0){const p=(prev+29-k)%29;if(ordinary||p){
     let t=j,floor=lo;
     if(paired){
       while(floor<hi){const [v,coin]=trial(t++),emit=(p+v)%29;
         if(emit!==prev){if(emit===c)out.push({j:t,p,lo:floor,hi});break}
         if(c===prev&&coin>floor)out.push({j:t,p,lo:floor,hi:Math.min(hi,coin)});
         floor=Math.max(floor,coin);
       }
     }else{
       t=j+1;
       while(floor<hi){const coin=draw(t++);
         if(c===prev&&coin>floor)out.push({j:t,p,lo:floor,hi:Math.min(hi,coin)});
         floor=Math.max(floor,coin);if(floor>=hi)break;
         const emit=(p+Math.floor(29*draw(t++)))%29;
         if(emit!==prev){if(emit===c)out.push({j:t,p,lo:floor,hi});break}
       }
     }
   }}
   return out;
 }
 function plant(P,s,policy){
   let j=0,prev=-1,rejects=0,holds=0,C=[];
   for(const p of P){
     if(!ordinary&&!p){C.push(0);holds++;if(policy==="physical")prev=0;continue}
     let emit;while(true){const [k,u]=trial(j++);emit=(p+k)%29;if(emit!==prev)break;const coin=paired?u:draw(j++);if(coin>=s)break;rejects++}
     C.push(emit);prev=emit;
   }return {C,j,rejects,holds};
 }
 return {branches,intervalBranches,plant,extensions:()=>extensions};
}
function reach(C,seed,schedule,policy,s=S){
 const M=machine(seed,C.length,schedule,policy==="ordinary");let states=new Set([0]),maxStates=1;
 for(let i=0;i<C.length;i++){
   const c=C[i],next=new Set();
   for(const a of states){const j=Math.floor(a/30),prev=a%30-1;
     if(policy!=="ordinary"&&c===0)next.add(j*30+(policy==="physical"?1:prev+1));
     for(const b of M.branches(j,prev,c,s))next.add(b.j*30+c+1);
   }
   if(!next.size)return {complete:false,firstDead:i,maxStates,extensions:M.extensions()};
   states=next;maxStates=Math.max(maxStates,next.size);
 }
 return {complete:true,firstDead:null,finalStates:states.size,maxStates,extensions:M.extensions()};
}
function union(R){
 if(!R.length)return R;R.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let out=[R[0].slice()];
 for(let i=1;i<R.length;i++){const last=out[out.length-1],x=R[i];if(x[0]<=last[1])last[1]=Math.max(last[1],x[1]);else out.push(x.slice())}
 return out;
}
function interval(C,seed,schedule,policy,lo=.72,hi=.882){
 const M=machine(seed,C.length,schedule,policy==="ordinary");let states=new Map([[0,[[lo,hi]]]]),maxStates=1,maxIntervals=1;
 for(let i=0;i<C.length;i++){
   const c=C[i],next=new Map();
   function add(k,R,a,b){let T=next.get(k);for(const x of R){const l=Math.max(a,x[0]),h=Math.min(b,x[1]);if(l<h){if(!T){T=[];next.set(k,T)}T.push([l,h])}}}
   for(const [a,R] of states){const j=Math.floor(a/30),prev=a%30-1;
     if(policy!=="ordinary"&&c===0)add(j*30+(policy==="physical"?1:prev+1),R,lo,hi);
     for(const b of M.intervalBranches(j,prev,c,lo,hi))add(b.j*30+c+1,R,b.lo,b.hi);
   }
   if(!next.size)return {complete:false,firstDead:i,maxStates,maxIntervals,extensions:M.extensions()};
   let n=0;for(const [k,R] of next){const q=union(R);next.set(k,q);n+=q.length}states=next;maxStates=Math.max(maxStates,states.size);maxIntervals=Math.max(maxIntervals,n);
 }
 return {complete:true,firstDead:null,intervals:union([...states.values()].flat()),finalStates:states.size,maxStates,maxIntervals,extensions:M.extensions()};
}

const schedules=["conditional","paired key first","paired coin first"],policies=["ordinary","physical","consuming"];
const paths=["resources/liber-primus/lp2-corpus.json","im-results/lp2-r18-skipcount-feasibility-output.json","resources/control/shakespeare_first300k.txt"];
function experiment(raw,group="control",start=0,end=433){
 const gp=JSON.parse(raw[0]),prior=JSON.parse(raw[1]),C=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
 if(C.length!==12956||C.slice(1).filter((x,i)=>x===C[i]).length!==86)throw Error("corpus");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){let q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native");a.push(q.i);j+=q.t.length;}}return a}
 const rows=[];
 if(group==="control"){
  const P=native(raw[2]);if(P.length!==217106)throw Error("donor size");
  for(let k=start;k<Math.min(end,3);k++)for(const schedule of schedules)for(const policy of policies){
   const seed=0x50485000+k,s=[.73,.81,.87][k],p=P.slice(k*C.length,(k+1)*C.length),E=machine(seed,p.length,schedule,policy==="ordinary").plant(p,s,policy);
   const yes=interval(E.C,seed,schedule,policy,policy==="ordinary"?.72:0,policy==="ordinary"?.882:1);
   if(!yes.complete||!yes.intervals.some(([l,h])=>l<s&&s<=h))throw Error("lost planted threshold");
   rows.push({seed,s,schedule,policy,holds:E.holds,rejects:E.rejects,...yes});
  }
 }else if(group==="candidate"){
  for(const x of prior.rows.slice(start,end))for(const schedule of schedules)for(const policy of policies){
   const seed=x.seed>>>0,positive=interval(C,seed,schedule,policy,policy==="ordinary"?.72:0,policy==="ordinary"?.882:1);
   rows.push({rank:x.rank,seed:x.seed,seed32:seed,schedule,policy,positive,...(policy==="ordinary"?{}:{zero:reach(C,seed,schedule,policy,0)})});
  }
 }else throw Error("group");
 return {group,start,end,rows};
}
if(require.main===module){const [group="control",start="0",end=group==="control"?"3":"433"]=process.argv.slice(2);console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),group,+start,+end),null,2));}
module.exports={experiment,machine,reach,interval};
