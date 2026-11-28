"use strict";
/**
 * Exact finite-state MAP for periodic strict-repeat channels.
 * No beam, no absolute clock cutoff, no maximum hidden-run length.
 * At each printed rune, multi-source Dijkstra eliminates all hidden paths.
 * Model: native first-order Markov plaintext law, a supplied periodic key,
 * and either deterministic mod36 silent output or independent GP29 deletion.
 * A candidate is conditional, not evidence that LP2 uses this channel.
 */
const D=.187;
function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)%n;};}
function model(raw,mode){
  const gp=JSON.parse(raw.gp),mod=mode==="silent"?36:29,P=mode==="silent"?30:29;
  const labels=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const words=text=>(text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const out=[];for(let j=0;j<w.length;){const z=w.startsWith("ING",j)?{s:"ING",i:21}:w.startsWith("IO",j)?{s:"IO",i:27}:labels.find(z=>w.startsWith(z.s,j));if(!z)throw Error("unmapped "+w);out.push(z.i);j+=z.s.length;}
    if(mode==="silent")out.push(29);return out;
  });
  const U=new Float64Array(P),B=Array.from({length:P},()=>new Float64Array(P)),tests={};
  for(const name of ["gibran","emerson","shakespeare"]){
    const W=words(raw[name]),cut=Math.floor(.57*W.length);let prev=-1;
    for(const group of W.slice(0,cut))for(const p of group){U[p]++;if(prev>=0)B[prev][p]++;prev=p;}
    tests[name]=W.slice(cut).flat();
  }
  const n=U.reduce((a,b)=>a+b,0),pi=Float64Array.from(U,x=>(x+.3)/(n+P*.3));
  for(const row of B){const z=row.reduce((a,b)=>a+b,0);for(let p=0;p<P;p++)row[p]=(row[p]+12*pi[p])/(z+12);}
  return {gp,mod,P,pi,B,tests,mode};
}
function graph(K,m){
  const q=K.length,N=m.mod*q,S=N,mod=x=>((x%m.mod)+m.mod)%m.mod;
  if(new Set(K).size<2)throw Error("nonconstant periodic key required");
  const make=(prev,a)=>{
    let prior=m.pi;
    if(prev>=0){const p=mod(prev-K[(a+q-1)%q]);if(p>=m.P)return [];prior=m.B[p];}
    const out=[];
    for(let p=0;p<m.P;p++){
      let j=a,c=mod(p+K[j]),skip=0;
      while(c===prev){j=(j+1)%q;c=mod(p+K[j]);if(++skip>=q)throw Error("nonterminating retry");}
      const id=c*q+(j+1)%q,base=-Math.log(prior[p]);
      out.push({id,p,c,skip,base,
        hidden:m.mode==="silent"?(c>=29?base:Infinity):base-Math.log(D),
        visible:m.mode==="silent"?(c<29?base:Infinity):base-Math.log1p(-D)});
    }
    return out;
  };
  const G=Array.from({length:N+1},(_,i)=>i===S?make(-1,0):make(Math.floor(i/q),i%q));
  return {G,q,N,S};
}
class Heap{
  constructor(){this.a=[];}
  push(id,d){const a=this.a;let i=a.length;a.push({id,d});while(i){const p=(i-1)>>1;if(a[p].d<=d)break;a[i]=a[p];i=p;}a[i]={id,d};}
  pop(){const a=this.a,top=a[0],v=a.pop();if(a.length){let i=0;while(2*i+1<a.length){let j=2*i+1;if(j+1<a.length&&a[j+1].d<a[j].d)j++;if(a[j].d>=v.d)break;a[i]=a[j];i=j;}a[i]=v;}return top;}
}
function decode(C,K,m){
  const {G,q,N,S}=graph(K,m),tape=[];
  let costs=new Float64Array(q).fill(Infinity),offset=0,visited=0;
  costs[0]=0;
  for(let t=0;t<C.length;t++){
    const dist=new Float64Array(N+1).fill(Infinity),par=new Int32Array(N+1).fill(-2),edge=new Array(N+1),heap=new Heap();
    if(t===0){dist[S]=0;par[S]=-1;heap.push(S,0);}
    else for(let a=0;a<q;a++)if(Number.isFinite(costs[a])){const i=C[t-1]*q+a;dist[i]=costs[a];par[i]=-1;heap.push(i,costs[a]);}
    const next=new Float64Array(q).fill(Infinity),last=new Array(q),lastFrom=new Int32Array(q).fill(-1);
    while(heap.a.length){
      const {id,d}=heap.pop();if(d!==dist[id])continue;visited++;
      for(const e of G[id]){
        if(e.c===C[t]&&d+e.visible<next[e.id%q]){next[e.id%q]=d+e.visible;last[e.id%q]=e;lastFrom[e.id%q]=id;}
        const v=d+e.hidden;if(v<dist[e.id]){dist[e.id]=v;par[e.id]=id;edge[e.id]=e;heap.push(e.id,v);}
      }
    }
    const row=new Array(q);
    let min=Infinity;for(let a=0;a<q;a++)if(next[a]<min)min=next[a];
    if(!Number.isFinite(min))return {failedAt:t,score:-Infinity};
    for(let a=0;a<q;a++){
      if(!Number.isFinite(next[a]))continue;
      const events=[{...last[a],keep:true}];let i=lastFrom[a];
      while(par[i]>=0){events.push({...edge[i],keep:false});i=par[i];}
      if(par[i]!==-1)throw Error("bad traceback");
      events.reverse();row[a]={root:i===S?0:i%q,events};
      next[a]-=min;
    }
    tape.push(row);costs=next;offset+=min;
  }
  let a=0;for(let i=1;i<q;i++)if(costs[i]<costs[a])a=i;
  const min=costs[a]+offset,blocks=[];
  for(let t=tape.length-1;t>=0;t--){const z=tape[t][a];blocks.push(z.events);a=z.root;}
  const full=blocks.reverse().flat(),events=[];let j=0,prev=-1;
  for(const e of full){const start=j;while((e.p+K[j%q])%m.mod===prev)j++;const c=(e.p+K[j%q])%m.mod;if(j-start!==e.skip||c!==e.c||(j+1)%q!==e.id%q)throw Error("strict sender replay failed");if(m.mode==="silent"&&e.keep!==(c<29))throw Error("silent mask replay failed");events.push({p:e.p,c,j,keep:e.keep});j++;prev=c;}
  const printed=events.filter(e=>e.keep).map(e=>e.c);
  if(JSON.stringify(printed)!==JSON.stringify(C))throw Error("printed replay failed");
  return {score:-min/C.length,clock:j-1,visited,events,full:events.map(e=>e.p),retained:events.filter(e=>e.keep&&e.p<29).map(e=>e.p),replay:true,maxHiddenGap:Math.max(...blocks.map(b=>b.length-1))};
}
function sender(P,K,m,limit,seed){
  const r=rng(seed),events=[],C=[];let j=0,prev=-1;
  for(const p of P){while((p+K[j%K.length])%m.mod===prev)j++;const c=(p+K[j%K.length])%m.mod,keep=m.mode==="silent"?c<29:r(10000)>=1870;events.push({p,c,j,keep});j++;prev=c;if(keep){C.push(c);if(C.length===limit)break;}}
  if(C.length!==limit)throw Error("plant too short");
  return {C,events,full:events.map(e=>e.p),retained:events.filter(e=>e.keep&&e.p<29).map(e=>e.p)};
}
function lcs(a,b){let x=new Uint16Array(b.length+1),y=new Uint16Array(b.length+1);for(const p of a){y.fill(0);for(let i=0;i<b.length;i++)y[i+1]=p===b[i]?x[i]+1:Math.max(y[i],x[i+1]);[x,y]=[y,x];}return x[b.length]/Math.max(a.length,b.length);}
function experiment(raw,options={}){
  const m=model(raw,options.mode||"delete"),K=options.K||[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516].map(v=>v%m.mod);
  const q=K.length,r=rng(771921),wrong=Array.from({length:q},()=>r(m.mod)),length=options.length||939;
  if(options.original){const C=m.gp.pages[15].indices.slice(20).concat(m.gp.pages.slice(16,23).flatMap(p=>p.indices)).slice(0,length);return {mode:m.mode,K,C,...decode(C,K,m)};}
  const name=options.source||"gibran",z=sender(m.tests[name].slice(options.offset||5000),K,m,length,options.seed||19033);
  const summarize=k=>{const a=decode(z.C,k,m);return {score:a.score,clock:a.clock,fullLCS:lcs(a.full,z.full),retainedLCS:lcs(a.retained,z.retained),replay:a.replay,maxHiddenGap:a.maxHiddenGap};};
  return {mode:m.mode,source:name,length,K,wrong,truthLength:z.full.length,truthClock:z.events.at(-1).j,right:summarize(K),wrongResult:summarize(wrong)};
}
if(typeof module!=="undefined")module.exports={rng,model,graph,decode,sender,lcs,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),opt=process.argv.find(x=>x.startsWith("--options="));
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
 console.log(JSON.stringify(experiment(raw,opt?JSON.parse(fs.readFileSync(opt.slice(10),"utf8")):{}),null,2));
}
