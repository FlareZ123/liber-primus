"use strict";
// Exact, spacing-free, fixed-seed plaintext inverse for the six latent-F
// same-instance collision schedules. No beam or cursor/reject cap.
// Path count is exact BigInt; language weight is a fixed GP29 Markov model.
// Target pages are never training data in controls.
const {machine,schedules,policies}=require("./lp2_shared_rng_fhold_inverse_sft.cjs");
const A=29,B=30,START=29;
function logadd(a,b){if(a===-Infinity)return b;if(b===-Infinity)return a;const m=Math.max(a,b);return m+Math.log1p(Math.exp(Math.min(a,b)-m))}
function train(seqs,alpha=.5){
 const n1=new Float64Array(A),n2=new Float64Array(B*A),n3=new Float64Array(B*B*A),d2=new Float64Array(B),d3=new Float64Array(B*B);let total=0;
 for(const P of seqs){let a=START,b=START;for(const p of P){n1[p]++;n2[b*A+p]++;n3[(a*B+b)*A+p]++;d2[b]++;d3[a*B+b]++;total++;a=b;b=p}}
 const L=new Float64Array(B*B*A);
 for(let a=0;a<B;a++)for(let b=0;b<B;b++)for(let p=0;p<A;p++){
   const u=(n1[p]+alpha)/(total+alpha*A),v=(n2[b*A+p]+8*u)/(d2[b]+8);
   L[(a*B+b)*A+p]=Math.log((n3[(a*B+b)*A+p]+8*v)/(d3[a*B+b]+8));
 }return L;
}
function encode(text,T){const tokens=T.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),P=[];
 for(const w of text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
  for(let i=0;i<w.length;){if(w.startsWith("ING",i)){P.push(21);i+=3}else if(w.startsWith("IO",i)){P.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error("GP token");P.push(t.i);i+=t.s.length}}
 }return P
}
function id(j,prev,a,b){return (((j*30+prev+1)*B+a)*B+b)}
function decode(C,seed,schedule,policy,s,L,{freeze=-1,posterior=true}={}){
 const M=machine(seed,C.length,schedule),initial={j:0,prev:-1,a:START,b:START,best:0,mass:0,count:1n,back:null},layers=[new Map([[id(0,-1,START,START),initial]])];let maxStates=1,prefix=null;
 for(let i=0;i<C.length;i++){
  const c=C[i],cur=layers[i],next=new Map();
  for(const q of cur.values()){
   const es=M.branches(q.j,q.prev,c,s).map(e=>({...e,prev:c}));
   if(c===0)es.push({j:q.j,p:0,prev:policy==="physical"?0:q.prev});
   if(posterior)q.edges=[];
   for(const e of es){const w=L[(q.a*B+q.b)*A+e.p],k=id(e.j,e.prev,q.b,e.p),score=q.best+w;let z=next.get(k);
    if(!z){z={j:e.j,prev:e.prev,a:q.b,b:e.p,best:score,mass:q.mass+w,count:q.count,back:q};next.set(k,z)}
    else{z.mass=logadd(z.mass,q.mass+w);z.count+=q.count;if(score>z.best){z.best=score;z.back=q}}
    if(posterior)q.edges.push({z,w,p:e.p})
   }
  }
  if(!next.size)return {complete:false,firstDead:i,freeze,maxStates};
  maxStates=Math.max(maxStates,next.size);
  if(i+1===freeze){let z=null;for(const q of next.values())if(!z||q.best>z.best)z=q;prefix={end:z.j,score:z.best};next.clear();next.set(id(z.j,z.prev,z.a,z.b),z);z.mass=z.best;z.count=1n;}
  layers.push(next)
 }
 let winner=null,mass=-Infinity,count=0n;for(const q of layers.at(-1).values()){if(!winner||q.best>winner.best)winner=q;mass=logadd(mass,q.mass);count+=q.count;q.beta=0}
 const P=new Array(C.length);let q=winner;for(let i=C.length-1;i>=0;i--){P[i]=q.b;q=q.back}
 const E=M.plant(P,s,policy);if(E.j!==winner.j||E.C.some((c,i)=>c!==C[i]))throw Error("MAP replay mismatch");
 const result={complete:true,plain:P,end:E.j,best:winner.best,mass,count:count.toString(),logMAPPosterior:winner.best-mass,maxStates,prefix,freeze};
 if(posterior&&freeze<0){const probs=new Array(C.length),possible=new Array(C.length);let entropy=0;
  for(let i=C.length-1;i>=0;i--){const lp=new Float64Array(A);lp.fill(-Infinity);for(const q of layers[i].values()){q.beta=-Infinity;for(const e of q.edges){const x=e.w+e.z.beta;q.beta=logadd(q.beta,x);lp[e.p]=logadd(lp[e.p],q.mass+x)}}const p=Array.from(lp,x=>Math.exp(x-mass));const sum=p.reduce((a,b)=>a+b,0);if(Math.abs(sum-1)>1e-7)throw Error("posterior normalization");probs[i]=p[P[i]];possible[i]=lp.filter(x=>x>-Infinity).length;entropy-=p.reduce((a,x)=>x>0?a+x*Math.log2(x):a,0)}
  result.posteriorMAPRune=probs;result.possible=possible;result.totalMarginalEntropyBits=entropy;
 }
 return result
}
function oracle(C,seed,schedule,policy,s,L){
 const M=machine(seed,C.length,schedule);let paths=[{P:[],j:0,prev:-1,score:0}];
 for(const c of C){const next=[];for(const q of paths){const es=M.branches(q.j,q.prev,c,s).map(e=>({...e,prev:c}));if(c===0)es.push({j:q.j,p:0,prev:policy==="physical"?0:q.prev});for(const e of es){const a=q.P.at(-2)??START,b=q.P.at(-1)??START;next.push({P:[...q.P,e.p],j:e.j,prev:e.prev,score:q.score+L[(a*B+b)*A+e.p]})}}paths=next}
 let mass=-Infinity,best=-Infinity;for(const q of paths){mass=logadd(mass,q.score);best=Math.max(best,q.score)}return {count:BigInt(paths.length),mass,best}
}
module.exports={train,encode,decode,oracle,schedules,policies};

if(require.main===module){
 const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),{mtFloats}=require("./lp2_shared_rng_rejection_marginal_sft.cjs");
 const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8").replace(/\r\n/g,"\n");
 const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),ref=read("resources/liber-primus/lp1-plaintext-reference.txt");
 const p57=gp.pages.find(x=>x.page===57).indices,p56=encode(ref.split("### 56\n")[1].split("### 57\n")[0].replace(/^[0-9a-f]+$/gm,""),gp.translit);
 assert.equal(p56.length,85);assert.equal(p57.length,95);
 const primes=[];for(let i=2;primes.length<85;i++)if(!primes.some(p=>p*p<=i&&i%p===0))primes.push(i);
 let j=0;assert.deepEqual(p56.map(p=>p===0?0:(p+primes[j++]-1)%29),gp.pages.find(x=>x.page===56).indices);
 const training=["gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(f=>encode(read("resources/control/"+f),gp.translit)),L=train(training);
 const P=encode(read("resources/control/shakespeare_first300k.txt"),gp.translit).slice(10000,22956);
 let checks=0;const rows=[];
 for(const schedule of schedules)for(const policy of policies){
  for(let k=0;k<16;k++){const seed=0x304140+k,plain=Array.from(mtFloats(seed,10),x=>Math.floor(x*29)),s=[0,.81288,1][k%3],E=machine(seed,10,schedule).plant(plain,s,policy),a=decode(E.C,seed,schedule,policy,s,L),b=oracle(E.C,seed,schedule,policy,s,L);assert.equal(a.count,b.count.toString());assert(Math.abs(a.mass-b.mass)<1e-8&&Math.abs(a.best-b.best)<1e-8);checks++}
  for(const [name,plain] of [["p56",p56],["p57",p57],["Shakespeare",P]]){
   const seed=0x49280311,s=.81288,E=machine(seed,plain.length,schedule).plant(plain,s,policy),d=decode(E.C,seed,schedule,policy,s,L),split=Math.floor(plain.length*.75),f=decode(E.C,seed,schedule,policy,s,L,{freeze:split,posterior:false});
   const accuracy=(q,start=0)=>q.complete?q.plain.slice(start).filter((v,i)=>v===plain[start+i]).length:0;
   const k=BigInt(d.count),shift=Math.max(0,k.toString(2).length-50);
   rows.push({schedule,policy,name,n:plain.length,correct:accuracy(d),forced:d.possible.filter(x=>x===1).length,logCount:Math.log2(Number(k>>BigInt(shift)))+shift,exactCount:d.count,mapPost:d.logMAPPosterior,entropy:d.totalMarginalEntropyBits,maxStates:d.maxStates,hold:f.complete?accuracy(f,split):null,holdN:plain.length-split,freezeComplete:f.complete});
  }
 }
 console.log(JSON.stringify({checks,training:training.map(x=>x.length),rows},null,2));
}
