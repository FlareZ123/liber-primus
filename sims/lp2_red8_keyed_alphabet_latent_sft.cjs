"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),g=JSON.parse(raw[1]),gold=JSON.parse(raw[3]),Q=29,alphabet="0123456789abcdefghijklmnopqrs",range=Array.from({length:Q},(_,i)=>i),mod=x=>(x%Q+Q)%Q,ix=new Map(gp.runes.map((x,i)=>[x,i])),id=a=>String.fromCharCode(...a.map(x=>65+x)),from=s=>Array.from(s,c=>c.charCodeAt(0)-65),names=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const z=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:names.find(z=>w.startsWith(z.t,j));if(!z)throw Error("unknown "+w);o.push(z.i);j+=z.t.length;}return id(o);}
 const lex=new Map(range.map(x=>[id([x]),1]));function add(w,f){lex.set(w,(lex.get(w)||0)+f);}
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){const a=word(m[1],true),b=word(m[1],false);add(a,+m[2]);if(b!==a)add(b,+m[2]);}}
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>id(Array.from(w,c=>ix.get(c))))}));for(const s of native)for(const w of s.words)add(w,1);
 const total=[...lex.values()].reduce((a,b)=>a+b,0),maxLex=Math.max(...Array.from(lex.keys(),w=>w.length)),trie=[{next:new Map(),end:null}];
 for(const [w,f] of lex){let n=0;for(const x of from(w)){let z=trie[n].next.get(x);if(z===undefined){z=trie.length;trie[n].next.set(x,z);trie.push({next:new Map(),end:null});}n=z;}trie[n].end={w,score:Math.log(f/total)};}
 const groups=[...g.p54.body_groups.slice(0,-1),g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)],C=Array.from(groups.join(""),x=>alphabet.indexOf(x)),K=Array.from(g.p54.heading_groups[1],x=>alphabet.indexOf(x));
 if(C.join()!==gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join()||groups.length!==64||C.length!==299)throw Error("source tape");
 const unique=a=>[...new Set(a)],models=[];
 for(const prefix of [K,[gp.pages[54].indices[0],...K]])for(const fFirst of [false,true]){
  let inv=unique(fFirst?[0,...prefix,...range]:[...prefix,...range]);const z=inv.indexOf(0);inv=inv.slice(z).concat(inv.slice(0,z));const pi=range.map(x=>inv.indexOf(x));
  for(const sign of [1,-1])models.push({prefix:prefix.length,fFirst,sign,pi,inv,k:K.map(x=>mod(sign*pi[x]))});
 }
 function encrypt(w,m,phase,hold){const p=from(w),c=[];let j=phase;for(const x of p){if(hold&&x===0)c.push(0);else c.push(m.inv[mod(m.pi[x]+m.k[j++%8])]);}return c;}
 function getEdges(c,m){
  const edges=Array.from({length:c.length},()=>new Map());
  for(let p=0;p<c.length;p++)for(let phase=0;phase<8;phase++)for(const hold of [false,true]){
   let states=[{node:0,phase}];for(let l=1;l<=maxLex&&p+l<=c.length&&states.length;l++){
    const x=c[p+l-1],next=[];for(const s of states){const v=m.inv[mod(m.pi[x]-m.k[s.phase%8])],t=trie[s.node].next.get(v);
     if((!hold||v!==0)&&t!==undefined)next.push({node:t,phase:(s.phase+1)%8});
     if(hold&&x===0){const u=trie[s.node].next.get(0);if(u!==undefined)next.push({node:u,phase:s.phase});}
    }
    states=next;
    for(const s of states){const e=trie[s.node].end;if(!e)continue;const old=edges[p].get(l);if(!old||e.score>old.score)edges[p].set(l,{...e,phase,hold});}
   }
  }
  return edges;
 }
 function solve(c,m,W,cap){
  const edges=getEdges(c,m),N=c.length,S=N+1,inf=1e9,cost=new Float64Array((W+1)*S).fill(inf),score=new Float64Array((W+1)*S).fill(-Infinity),pred=new Array((W+1)*S);cost[0]=0;score[0]=0;
  for(let j=0;j<W;j++)for(let p=0;p<N;p++){const h=j*S+p;if(cost[h]===inf)continue;
   const relax=(l,z,miss)=>{const end=p+l;if(end>N||N-end<W-j-1)return;const v=(j+1)*S+end,nc=cost[h]+miss,ns=score[h]+(z?z.score:-20-l);if(nc<cost[v]||(nc===cost[v]&&ns>score[v])){cost[v]=nc;score[v]=ns;pred[v]={p,l,z,miss};}};
   for(const [l,z] of edges[p])relax(l,z,0);
   for(let l=1;l<=Math.min(cap,N-p);l++)if(!edges[p].has(l))relax(l,null,1);
  }
  const at=W*S+N;if(cost[at]===inf)return {possible:false};
  let p=N,words=[],replay=[],oovRunes=0;for(let j=W;j>0;j--){const v=pred[j*S+p];if(!v)throw Error("backtrack");
   const z=v.z||{w:id(c.slice(v.p,p).map((x,k)=>m.inv[mod(m.pi[x]-m.k[k%8])])),phase:0,hold:false};const enc=encrypt(z.w,m,z.phase,z.hold);if(enc.join()!==c.slice(v.p,p).join())throw Error("replay");
   replay.unshift(...enc);words.unshift({word:from(z.w).map(x=>gp.translit[x]).join(""),encoded:z.w,phase:z.phase,hold:z.hold,oov:!!v.miss});oovRunes+=v.miss*v.l;p=v.p;
  }
  if(p||replay.join()!==c.join())throw Error("full replay");
  const support=edges.map((e,p)=>({p,lengths:[...e.keys()].sort((a,b)=>a-b)}));
  return {possible:true,minOOV:cost[at],oovRunes,logscore:score[at],witness:words,lexicalEdgeCount:support.reduce((a,b)=>a+b.lengths.length,0),longestLexicalEdge:Math.max(0,...support.flatMap(x=>x.lengths)),replay:true};
 }
 function coverageBound(c,m,W,B){
  const edges=getEdges(c,m),N=c.length,S=N+1,inf=1e9;
  let a=new Int32Array((B+1)*S).fill(inf),b=new Int32Array((B+1)*S);a[0]=0;
  for(let j=0;j<W;j++){
   b.fill(inf);
   for(let k=0;k<=B;k++)for(let p=0;p<N;p++){
    const h=a[k*S+p];if(h===inf)continue;
    for(const l of edges[p].keys()){const np=p+l;if(N-np<W-j-1)continue;const i=k*S+np;b[i]=Math.min(b[i],h);}
    if(k<B)for(let l=1;l<=N-p-(W-j-1);l++)if(!edges[p].has(l)){const i=(k+1)*S+p+l;b[i]=Math.min(b[i],h+l);}
   }
   [a,b]=[b,a];
  }
  return Array.from({length:B+1},(_,k)=>{const z=a[k*S+N];return z===inf?null:z;});
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};}
 const original=models.map(m=>({model:m,cap13:solve(C,m,64,13),unbounded:solve(C,m,64,C.length),minOovRunesByExactBudget:coverageBound(C,m,64,3)}));
 const controls=[];
 for(let i=0;i<3;i++){
  const R=rng(0x54a8b001+i),m=models[(i*3)%models.length],s=native.find(x=>x.name===["0_welcome","0_loss_of_divinity","0_koan_1"][i]),words=s.words.slice(0,64);
  const assignments=words.map(w=>({w,phase:Math.floor(R()*8),hold:R()<.5})),c=assignments.flatMap(z=>encrypt(z.w,m,z.phase,z.hold));
  const out=solve(c,m,words.length,13);const truth=words.join(""),witness=out.witness.map(z=>z.encoded).join("");controls.push({name:s.name,model:m,truthWords:words.length,truthRunes:truth.length,truthRetained:out.minOOV===0,agreement:[...truth].filter((v,i)=>v===witness[i]).length,result:out,minOovRunesByExactBudget:coverageBound(c,m,words.length,3)});
 }
 return {lexiconSize:lex.size,sourceKey:K,body:{N:C.length,W:groups.length,printedMax:Math.max(...groups.map(x=>x.length))},original,controls};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment,paths};
