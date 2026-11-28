"use strict";
/**
 * Period-quotiented silent-output inverse for the Round48 V-SILENT model.
 * Historical LP1 keys are named in solved p57. This is a conditional transfer,
 * not an assertion that unknown LP2 uses the model. All hidden emissions and
 * repeat-rejection draws are represented in the returned witness.
 * Node: node sims/lp2_periodic_silent_unbounded_inverse_sft.cjs
 */
class Heap {
  constructor(){this.a=[];this.seq=0;}
  less(a,b){return a.cost<b.cost||(a.cost===b.cost&&a.seq<b.seq);}
  push(x){x.seq=this.seq++;const a=this.a;let i=a.length;a.push(x);
    while(i){const p=(i-1)>>1;if(!this.less(x,a[p]))break;a[i]=a[p];i=p;}a[i]=x;}
  pop(){const a=this.a,z=a[0],x=a.pop();if(a.length){let i=0;
    while(2*i+1<a.length){let c=2*i+1;if(c+1<a.length&&this.less(a[c+1],a[c]))c++;
      if(!this.less(a[c],x))break;a[i]=a[c];i=c;}a[i]=x;}return z;}
  get length(){return this.a.length;}
}
/** @param {number} m @param {number[]} key */
function machine(m,key) {
  const q=key.length,R=29,base=m+1,id=(j,last)=>j*base+last,N=q*base;
  const rows=Array.from({length:N},()=>({by:Array.from({length:R},()=>[]),silent:[],forward:[]}));
  for(let j=0;j<q;j++)for(let last=0;last<=m;last++)for(let p=0;p<=29;p++){
    let t=j,c=(p+key[t])%m,draws=1;
    while(c===last){t=(t+1)%q;if(t===j)throw Error("constant key rejects entire period");
      c=(p+key[t])%m;draws++;}
    const e={p,c,draws,to:id((t+1)%q,c)},row=rows[id(j,last)];
    row.forward[p]=e;(c<R?row.by[c]:row.silent).push(e);
  }
  function encode(P,phase=0){
    let s=id(phase,m),clock=0;const events=[];
    for(const p of P){const e=rows[s].forward[p];s=e.to;clock+=e.draws;events.push({...e,clock});}
    return {events,C:events.filter(e=>e.c<R).map(e=>e.c),lastState:s,clock};
  }
  // Exact min-plus epsilon closure. No hidden-run bound or absolute clock cap.
  function minHidden(C,phases=[0]){
    let cur=new Map(phases.map(j=>[id(j,m),0])),prefix=0,peak=0;
    for(const c of C){
      const dist=new Float64Array(N).fill(Infinity),h=new Heap();
      for(const [s,cost] of cur){dist[s]=cost;h.push({s,cost});}
      while(h.length){const z=h.pop();if(z.cost!==dist[z.s])continue;
        for(const e of rows[z.s].silent){const cost=z.cost+1;if(cost<dist[e.to]){
          dist[e.to]=cost;h.push({s:e.to,cost});}}}
      const next=new Map();
      for(let s=0;s<N;s++)if(Number.isFinite(dist[s]))for(const e of rows[s].by[c]){
        if(!next.has(e.to)||dist[s]<next.get(e.to))next.set(e.to,dist[s]);}
      if(!next.size)break;cur=next;prefix++;peak=Math.max(peak,cur.size);
    }
    return {prefix,states:cur.size,minHidden:Math.min(...cur.values()),peak};
  }
  return {m,q,N,rows,id,encode,minHidden};
}
const Q=31,SENT=30,CTX=Q*Q*Q,START=(SENT*Q+SENT)*Q+SENT;
function wordTokens(gp,text){
  const Tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const v=[];for(let j=0;j<w.length;){
      const t=w.startsWith("ING",j)?{s:"ING",i:21}:w.startsWith("IO",j)?{s:"IO",i:27}:Tok.find(x=>w.startsWith(x.s,j));
      if(!t)throw Error("unmapped GP token");v.push(t.i);j+=t.s.length;}return v;
  });
}
const tape=W=>W.flatMap(w=>[...w,29]);
/** Same training split and smoothed four-symbol language model as Agent6. */
function language(sources){
  const U=new Float64Array(30),B=new Float64Array(Q*Q),T=new Float64Array(CTX),
    F=new Uint32Array(CTX*Q),Ub=new Float64Array(Q),Bb=new Float64Array(Q*Q),Tb=new Uint32Array(CTX);
  for(const W of sources){let a=SENT,b=SENT,c=SENT;
    for(const p of tape(W.slice(0,Math.floor(W.length*.57)))){
      U[p]++;B[c*Q+p]++;T[(b*Q+c)*Q+p]++;F[((a*Q+b)*Q+c)*Q+p]++;
      Ub[c]++;Bb[b*Q+c]++;Tb[(a*Q+b)*Q+c]++;a=b;b=c;c=p;}}
  const N=U.reduce((s,v)=>s+v,0),P3=new Float32Array(CTX),cost=new Float32Array(CTX*Q);
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let p=0;p<30;p++){
    const u=(U[p]+.3)/(N+9),bi=(B[b*Q+p]+12*u)/(Ub[b]+12);
    P3[(a*Q+b)*Q+p]=Math.log((T[(a*Q+b)*Q+p]+16*bi)/(Bb[a*Q+b]+16));}
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++)for(let p=0;p<30;p++){
    const ctx=(a*Q+b)*Q+c,i=ctx*Q+p;
    cost[i]=-Math.log((F[i]+10*Math.exp(P3[(b*Q+c)*Q+p]))/(Tb[ctx]+10));
    if(!(cost[i]>0))throw Error("language edge cost must be strictly positive");
  }
  return cost;
}
/**
 * Future-equivalence state = (next key phase, last latent emission, GP LM context).
 * For one observed rune, multi-source Dijkstra on silent edges and final visible
 * edges yields the top B distinct terminal states exactly conditional on previous
 * beam. No cap on the number of silent emissions or rejected draws. The beam
 * across observations remains approximate.
 */
function decode(M,C,LM,beam=256,phase=0){
  let states=[{s:M.id(phase,M.m),ctx:START,cost:0,path:null}],popped=0,maxQueue=0;
  const terminalOffset=M.N*CTX;
  for(let i=0;i<C.length;i++){
    const dist=new Map(),h=new Heap(),next=[];
    function push(z,term){
      const sid=z.s*CTX+z.ctx+(term?terminalOffset:0);
      if(dist.has(sid)&&dist.get(sid)<=z.cost)return;
      dist.set(sid,z.cost);h.push({...z,sid,term});maxQueue=Math.max(maxQueue,h.length);
    }
    for(const z of states)push(z,false);
    while(h.length&&next.length<beam){
      const z=h.pop();if(dist.get(z.sid)!==z.cost)continue;popped++;
      if(z.term){next.push(z);continue;}
      const row=M.rows[z.s];
      function edge(e,term){
        const ctx=(z.ctx%(Q*Q))*Q+e.p,cost=z.cost+LM[z.ctx*Q+e.p];
        push({s:e.to,ctx,cost,path:{p:e.p,prev:z.path}},term);
      }
      for(const e of row.silent)edge(e,false);
      for(const e of row.by[C[i]])edge(e,true);
    }
    if(!next.length)return {failed:i,popped,maxQueue};
    states=next;
  }
  const z=states[0],P=[];for(let p=z.path;p;p=p.prev)P.push(p.p);P.reverse();
  const witness=M.encode(P,phase);
  if(witness.C.length!==C.length||witness.C.some((x,i)=>x!==C[i])||witness.lastState!==z.s)throw Error("forward replay failed");
  let hidden=0,run=0,maxHidden=0;
  for(const e of witness.events){if(e.c>=29){hidden++;run++;maxHidden=Math.max(maxHidden,run);}else run=0;}
  return {P,visibleP:witness.events.filter(e=>e.c<29&&e.p<29).map(e=>e.p),
    score:-z.cost/C.length,hidden,maxHidden,clock:witness.clock,states:states.length,popped,maxQueue};
}
function lcs(A,B){let p=new Uint16Array(B.length+1),q=new Uint16Array(B.length+1);
  for(const a of A){q.fill(0);for(let i=0;i<B.length;i++)q[i+1]=a===B[i]?p[i]+1:Math.max(q[i],p[i+1]);[p,q]=[q,p];}
  return p[B.length]/Math.max(A.length,B.length);}
function experiment(raw,{beam=256,only=null,opening=true,reach=true}={}){
  const gp=JSON.parse(raw.gp),gold=JSON.parse(raw.gold),keys=["DIUINITY","FIRFUMFERENFE"].map(name=>({name,key:[...name].map(x=>gp.translit.indexOf(x))}));
  const pages=(a,b)=>gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
  const C0=pages(0,2),CT=pages(54,55);
  if(C0.length!==729||CT.length!==308||keys.some(k=>k.key.some(v=>v<0)))throw Error("source drift");
  const p57words=gold.sections.find(s=>s.name==="p57_parable").source_text.split(/[•⁜⁘\s]+/).filter(Boolean);
  const p57=p57words.flatMap((w,i)=>[...[...w].map(x=>gp.runes.indexOf(x)),...(i<p57words.length-1?[29]:[])]);
  if(p57.length!==114||p57.filter(x=>x<29).length!==95||p57.some(x=>x<0))throw Error("p57 source drift");
  const reachResults=[];
  if(reach)for(const {name,key} of keys)for(const m of [35,36,37]){
    const M=machine(m,key),P=Array.from({length:3},()=>p57).flat(),plant=M.encode(P),phase=Array.from({length:key.length},(_,i)=>i);
    const control=M.minHidden(plant.C),hidden=P.length-plant.C.length;
    if(control.prefix!==plant.C.length||control.minHidden>hidden)throw Error("reachability control failed");
    reachResults.push({name,m,key,control:{n:plant.C.length,hidden,...control},opening:M.minHidden(C0),
      openingAll:M.minHidden(C0,phase),terminal:M.minHidden(CT),terminalAll:M.minHidden(CT,phase)});
  }
  const W=[raw.shakespeare,raw.gibran,raw.emerson].map(s=>wordTokens(gp,s)),LM=language(W);
  const P=tape(W[1].slice(Math.floor(W[1].length*.57))).slice(5000,5340);
  if(P.length!==340)throw Error("held control length");
  const fmt=x=>x.P?{...x,text:x.P.map(v=>v===29?" ":gp.translit[v]).join("")}:x;
  const results=[];
  for(const {name,key} of keys){
    if(only&&name!==only)continue;
    const M=machine(36,key),plant=M.encode(P),last=plant.events.findLastIndex(e=>e.c<29),
      fullTruth=P.slice(0,last+1),visibleTruth=plant.events.filter(e=>e.c<29&&e.p<29).map(e=>e.p);
    const wrong=machine(36,key.map((v,i)=>(v+11+3*i)%36));
    const a=decode(M,plant.C,LM,beam),b=decode(M,plant.C,LM,beam,1),d=decode(wrong,plant.C,LM,beam);
    if(!a.P||!b.P||!d.P)throw Error("unexpected incomplete plant");
    const describe=x=>({...fmt(x),fullLCS:lcs(x.P,fullTruth),visibleLCS:lcs(x.visibleP,visibleTruth)});
    results.push({name,key,plant:{printed:plant.C.length,fullPrefix:fullTruth.length,retained:visibleTruth.length,
      trueClock:plant.events[last].clock,correct:describe(a),wrongPhase1:describe(b),unrelatedSamePeriod:describe(d)},
      terminal:fmt(decode(M,CT,LM,beam)),opening:opening?fmt(decode(M,C0,LM,beam)):null});
  }
  return {beam,scope:"Historical LP1 keys, hypothesized Round48 silent channel, exact unbounded epsilon closure conditional on per-symbol beam; no original plaintext authentication",reachResults,results};
}
if(typeof module!=="undefined")module.exports={machine,language,decode,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
  const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gold:read("resources/external/relikd-solved-gp29-native-v1.json"),
    shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
  const arg=process.argv.find(x=>x.startsWith("--beam="));console.log(JSON.stringify(experiment(raw,{beam:arg?Number(arg.slice(7)):256}),null,2));
}
