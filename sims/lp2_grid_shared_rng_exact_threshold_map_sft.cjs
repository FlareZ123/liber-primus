"use strict";
// Exact threshold-interval Viterbi. Source-causal reachability is separated
// from language ranking: no state or threshold grid is truncated.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {machine,domain,plant,mtRaw}=require("./lp2_grid_column_shared_rng_exact_sft.cjs");
const {train,encode}=require("./lp2_shared_rng_exact_plaintext_sft.cjs");
const Q=2**53, START=29;
function branches(M,j,prev,c,policy,limits){
 const out=[],hold=policy!=="nohold",t0=M.trial(j);
 if(hold&&c===0)out.push({j,p:0,prev:policy==="physical"?0:prev,lo:limits[0],hi:limits[1]});
 const p=(c+29-t0.k)%29;
 if(c!==prev&&(!hold||p!==0))out.push({j:t0.t,p,prev:c,lo:limits[0],hi:limits[1]});
 const p0=(prev+29-t0.k)%29;if(prev<0||(hold&&p0===0))return out;
 let t=t0,lo=limits[0],hi=limits[1],pos=t.t;
 while(lo<=hi){
  let u=t.u;if(u===null){[u,pos]=M.coin(pos)}
  if(c===prev&&lo<=Math.min(hi,u))out.push({j:pos,p:p0,prev:c,lo,hi:Math.min(hi,u)});
  lo=Math.max(lo,u+1);if(lo>hi)break;
  t=M.trial(pos);pos=t.t;const emit=(p0+t.k)%29;
  if(emit!==prev){if(emit===c)out.push({j:pos,p:p0,prev:c,lo,hi});break}
 }
 return out
}
function envelope(A){
 if(A.length<=1)return A;
 A.sort((a,b)=>a.lo-b.lo||b.score-a.score||b.hi-a.hi);
 const heap=[],out=[];let i=0,x=A[0].lo;
 const higher=(a,b)=>a.score>b.score||a.score===b.score&&a.hi>b.hi;
 function push(a){let k=heap.length;heap.push(a);while(k){const p=(k-1)>>1;if(!higher(a,heap[p]))break;heap[k]=heap[p];k=p;heap[k]=a}}
 function pop(){const a=heap.pop();if(!heap.length)return;let k=0;heap[0]=a;while(true){let l=2*k+1;if(l>=heap.length)break;const r=l+1;if(r<heap.length&&higher(heap[r],heap[l]))l=r;if(!higher(heap[l],a))break;heap[k]=heap[l];k=l;heap[k]=a}}
 while(true){
  while(i<A.length&&A[i].lo<=x)push(A[i++]);
  while(heap.length&&heap[0].hi<x)pop();
  if(!heap.length){if(i===A.length)break;x=A[i].lo;continue}
  const top=heap[0],hi=i<A.length?Math.min(top.hi,A[i].lo-1):top.hi,last=out.at(-1);
  if(last&&last.node===top.node&&last.score===top.score&&x-last.hi===1)last.hi=hi;
  else out.push({lo:x,hi,score:top.score,node:top.node});
  if(hi===Q)break;x=hi+1
 }
 return out
}
function id(j,prev,a,b){return (((j*30+prev+1)*30+a)*30+b)}
function decode(C,M,policy,L,limits,initial={j:0,prev:-1,a:START,b:START}){
 let states=new Map([[id(initial.j,initial.prev,initial.a,initial.b),{...initial,pieces:[{lo:limits[0],hi:limits[1],score:0,node:null}]}]]),maxStates=1,maxPieces=1;
 for(let i=0;i<C.length;i++){
  const c=C[i],next=new Map(),cache=new Map();
  for(const s of states.values()){
   const k0=s.j*30+s.prev+1;
   let E=cache.get(k0);if(!E){E=branches(M,s.j,s.prev,c,policy,limits);cache.set(k0,E)}
   for(const e of E){
    const k=id(e.j,e.prev,s.b,e.p),w=L[(s.a*30+s.b)*29+e.p];let z=next.get(k);
    for(const a of s.pieces){
     const lo=Math.max(e.lo,a.lo),hi=Math.min(e.hi,a.hi);if(lo>hi)continue;
     if(!z){z={j:e.j,prev:e.prev,a:s.b,b:e.p,pieces:[]};next.set(k,z)}
     z.pieces.push({lo,hi,score:a.score+w,node:{p:e.p,back:a.node}})
    }
   }
  }
  if(!next.size)return {complete:false,dead:i,maxStates,maxPieces};
  let n=0;for(const z of next.values()){z.pieces=envelope(z.pieces);n+=z.pieces.length}
  states=next;maxStates=Math.max(maxStates,states.size);maxPieces=Math.max(maxPieces,n)
 }
 let best=null,terminal=null;for(const s of states.values())for(const a of s.pieces)if(best===null||a.score>best.score){best=a;terminal=s}
 let node=best.node;const P=new Array(C.length);for(let i=C.length-1;i>=0;i--){P[i]=node.p;node=node.back}
 const t=best.lo+Math.floor((best.hi-best.lo)/2);
 return {complete:true,P,score:best.score,lo:best.lo,hi:best.hi,t,j:terminal.j,prev:terminal.prev,a:terminal.a,b:terminal.b,maxStates,maxPieces}
}
function replay(P,M,policy,t,state={j:0,prev:-1}){
 let j=state.j,prev=state.prev;const C=[];
 for(const p of P){
  if(p===0&&policy!=="nohold"){C.push(0);if(policy==="physical")prev=0;continue}
  while(true){const z=M.trial(j);j=z.t;const c=(p+z.k)%29;
   if(c!==prev){C.push(c);prev=c;break}
   let u=z.u;if(u===null){[u,j]=M.coin(j)}if(u>=t){C.push(c);prev=c;break}
  }
 }return {C,j,prev}
}
function caseRun(C,seed,cfg,L,limits=domain(cfg.policy),hold=true){
 const M=machine(seed,cfg.mode,cfg.schedule,cfg.sign);
 const d=decode(C,M,cfg.policy,L,limits);
 if(d.complete){const e=replay(d.P,M,cfg.policy,d.t);assert.deepEqual(e.C,C);assert.equal(e.j,d.j)}
 if(!hold)return {d};
 const split=Math.floor(C.length*.75),p=decode(C.slice(0,split),M,cfg.policy,L,limits);
 if(!p.complete)return {d,p};
 const s=decode(C.slice(split),M,cfg.policy,L,[p.t,p.t],p);
 if(s.complete){const e=replay(s.P,M,cfg.policy,p.t,p);assert.deepEqual(e.C,C.slice(split));assert.equal(e.j,s.j)}
 return {d,p,s}
}
function checks(L,donor){
 const rows=[];for(const mode of ["randrange","float","uint32"])for(const schedule of ["conditional","keyfirst","coinfirst"])for(const policy of ["consuming","physical","nohold"]){
  const cfg={mode,schedule,policy,sign:rows.length%2?1:-1},seed=0x33771n+BigInt(rows.length),t=Math.ceil(.81288*Q),P=donor.slice(0,256);
  const C=plant(P,seed,mode,schedule,cfg.sign,policy,t),q=caseRun(C,seed,cfg,L);
  assert.ok(q.d.complete);
  const fixed=caseRun(C,seed,cfg,L,[t,t],false).d;assert.ok(fixed.complete);assert.ok(q.d.score+1e-8>=fixed.score);
  const known=caseRun(C,seed,cfg,L,[q.d.t,q.d.t],false).d;assert.ok(known.complete);assert.ok(Math.abs(known.score-q.d.score)<1e-8);
  rows.push({...cfg,exact:q.d.P.filter((p,i)=>p===P[i]).length,n:P.length,score:q.d.score/P.length,hold:q.s?.complete?q.s.score/q.s.P.length:null,maxPieces:q.d.maxPieces})
 }
 return rows
}
function run(C,rows,T,training,donor,prior,start=0,end=Infinity){
 const L=train(training.map(s=>encode(s,T))),P=encode(donor,T);
 const groups=[];let off=0;for(const n of prior.length){groups.push(C.slice(off,off+n));off+=n}
 const cases=[];
 for(const cfg of prior.results)for(let i=0;i<8;i++)for(let j=0;j<8;j++)if(cfg.edgeIntervals[i][j].length)cases.push({i,j,cfg:{mode:cfg.mode,schedule:cfg.schedule,policy:cfg.policy,sign:cfg.sign,endian:cfg.endian},intervals:cfg.edgeIntervals[i][j]});
 const control=start===0?checks(L,P):[];
 const results=cases.slice(start,end).map((x,index)=>{
  const col=rows.map(r=>r[x.j]);if(x.cfg.endian==="little")col.reverse();const seed=col.reduce((n,b)=>(n<<8n)|BigInt(b),0n);
  // Nomination is based on exact whole-section feasibility only; full MAP
  // ranks every threshold in that feasible set, then independently freeze
  // prefix-only parameter and state for the conditional continuation test.
  let d=null;for(const I of x.intervals){const q=caseRun(groups[x.i],seed,x.cfg,L,I,false).d;if(q.complete&&(!d||q.score>d.score))d=q}
  assert.ok(d);
  const n=groups[x.i].length,split=Math.floor(.75*n),M=machine(seed,x.cfg.mode,x.cfg.schedule,x.cfg.sign),p=decode(groups[x.i].slice(0,split),M,x.cfg.policy,L,domain(x.cfg.policy)),s=p.complete?decode(groups[x.i].slice(split),M,x.cfg.policy,L,[p.t,p.t],p):null;
  if(s?.complete){const z=replay(s.P,M,x.cfg.policy,p.t,p);assert.deepEqual(z.C,groups[x.i].slice(split));assert.equal(z.j,s.j)}
  return {case:start+index,i:x.i,j:x.j,cfg:x.cfg,n,score:d.score/n,t:d.t,range:[d.lo,d.hi],plain:d.P.map(p=>T[p]).join(""),prefixScore:p.complete?p.score/split:null,holdScore:s?.complete?s.score/(n-split):null,holdPlain:s?.complete?s.P.map(p=>T[p]).join(""):null,maxPieces:d.maxPieces}
 });
 return {totalCases:cases.length,control,results}
}
module.exports={decode,caseRun,checks,run,envelope,branches};
if(require.main===module){
 const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8"),gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),rows=JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows,prior=JSON.parse(read("im-results/lp2-grid-column-shared-rng-exact-output.json"));
 const [start="0",end="284"]=process.argv.slice(2),C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 console.log(JSON.stringify(run(C,rows,gp.translit,[read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt")],read("resources/control/shakespeare_first300k.txt"),prior,+start,+end)))
}
