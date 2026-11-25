"use strict";
// Constructive period-76 cycle reconstruction from independent printed-word phases.
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
function experiment(raw){
 const gp=JSON.parse(raw[0]), gold=JSON.parse(raw[2]), ix=new Map(gp.runes.map((x,i)=>[x,i])), tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,id=w=>w.join(","),Q=76,M=6,BASE=29**(M-1),MIN=3;
 function words(t,sep){let out=[],w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("token "+w);p.push(v.i);j+=v.t.length;}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w,true))}
 const donors=raw.slice(3,6).map(native), vocab=new Map();
 for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.set(id(w),w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of words(s.source_text,/[^\u16a0-\u16ff]/u))vocab.set(id(w),w);
 for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.set(id(w),w)}}
 for(let i=0;i<29;i++)vocab.set(id([i]),[i]);
 if(vocab.size!==35944)throw Error("dictionary changed");
 const lens=new Map();for(const w of vocab.values()){if(!lens.has(w.length))lens.set(w.length,[]);lens.get(w.length).push(w)}
 const source=words(raw[1],/[-.&]/u),flat=source.flat();if(id(flat.slice(0,12956))!==id(gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices)))throw Error("source mismatch");
 const cut=gp.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),train=[],test=[];let pos=0;
 for(const w of source){if(pos>=12956)break;if(pos<cut&&pos+w.length>cut)throw Error("cut");(pos<cut?train:test).push(w);pos+=w.length}
 if(train.length!==2161||test.length!==735)throw Error("group counts "+train.length+" "+test.length);
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function encrypt(p,K){let phase=0;return p.map(w=>w.map(v=>{if(!v)return 0;const c=mod(v+K[phase]);phase=(phase+1)%K.length;return c}))}
 function canonical(K){let best=null;for(let i=0;i<K.length;i++){const s=id(K.slice(i).concat(K.slice(0,i)));if(best===null||s<best)best=s;}return best}
 function windows(c){let starts=[];for(let i=0;i<=c.length-M;i++)if(c.slice(i,i+M).every(v=>v!==0))starts.push(i);return starts}
 function reconstruct(groups,Ktrue=null){
  const counts=new Map();let eligible=0;
  for(const c of groups){const starts=windows(c);if(!starts.length)continue;eligible++;
   const seen=new Set();for(const p of lens.get(c.length)||[]){if(p.some((v,j)=>!v&&c[j]))continue;for(const i of starts){let e=0;for(let j=i;j<i+M;j++)e=29*e+mod(c[j]-p[j]);seen.add(e)}}
   for(const e of seen)counts.set(e,(counts.get(e)||0)+1);
  }
  const edges=[...counts].filter(([,n])=>n>=MIN),prefix=new Map();for(const [e] of edges){const a=Math.floor(e/29);if(!prefix.has(a))prefix.set(a,[]);prefix.get(a).push(e)}
  let calls=0,cap=false,maxPath=0;const keys=new Set(),LIMIT=1_000_000;
  function walk(first,last,path){if(++calls>LIMIT){cap=true;return}maxPath=Math.max(maxPath,path.length);
   if(path.length===Q){if(last%BASE===Math.floor(first/29)){const K=path.map(e=>Math.floor(e/BASE));for(let i=0;i<Q;i++){let e=0;for(let j=0;j<M;j++)e=e*29+K[(i+j)%Q];if(e!==path[i])throw Error("bad closure")}keys.add(canonical(K))}return}
   for(const e of prefix.get(last%BASE)||[]){if(e<first)continue;path.push(e);walk(first,e,path);path.pop();if(cap)return}
  }
  for(const [e] of edges){walk(e,e,[e]);if(cap)break}
  const truthSupports=Ktrue?Ktrue.map((_,i)=>{let x=0;for(let j=0;j<M;j++)x=29*x+Ktrue[(i+j)%Q];return counts.get(x)||0}):null;
  const hist={};for(const n of counts.values())hist[n]=(hist[n]||0)+1;
  return {eligible,distinct:counts.size,edges:edges.length,hist,maxPath,calls,cap,keys:[...keys],truthSupports};
 }
 function cover(groups,K,truth=null){let covered=0,unique=0,trueIncluded=0,trueUnique=0,inVocab=0;const examples=[];
  for(let g=0;g<groups.length;g++){const c=groups[g],opts=new Set();for(let start=0;start<K.length;start++){
   const P=[];function visit(i,phase){if(i===c.length){const s=id(P);if(vocab.has(s))opts.add(s);return}
    if(c[i]===0){P.push(0);visit(i+1,phase);P.pop()}
    const v=mod(c[i]-K[phase]);if(v){P.push(v);visit(i+1,(phase+1)%K.length);P.pop()}
   }visit(0,start);
  }if(opts.size)covered++;if(opts.size===1)unique++;
   if(truth&&vocab.has(id(truth[g]))){inVocab++;if(opts.has(id(truth[g]))){trueIncluded++;if(opts.size===1)trueUnique++}}
   if(examples.length<15&&c.length>=6&&opts.size)examples.push({c:id(c),options:[...opts].slice(0,5)})}
  return {covered,unique,total:groups.length,trueIncluded:truth?trueIncluded:null,trueUnique:truth?trueUnique:null,inVocab:truth?inVocab:null,examples};
 }
 function assess(g,h,Ktrue=null,P=null){const z=reconstruct(g,Ktrue);return {...z,exact:Ktrue?z.keys.includes(canonical(Ktrue)):null,candidates:z.keys.slice(0,40).map(s=>{const K=s.split(",").map(Number);return {K,train:cover(g,K,P?.slice(0,g.length)),holdout:cover(h,K,P?.slice(g.length))}})}}
 function buckets(pool){const m=new Map();for(const w of pool){if(!m.has(w.length))m.set(w.length,[]);m.get(w.length).push(w)}return m}
 const held=donors.map(d=>d.slice(Math.floor(d.length*.8))),shared=buckets(held.flat()),controls=[];
 for(let d=0;d<3;d++){const R=rng(0x33017601+d),pool=buckets(held[d]), K=Array.from({length:Q},()=>R()%29);let fallback=0;
 // Match original word lengths, sampling from independent held-out donor.
 // Rare absent lengths use the pooled held-out set, recorded explicitly.
 const P=train.concat(test).map(w=>{let v=pool.get(w.length);if(!v){v=shared.get(w.length);fallback++}if(!v)throw Error("missing length "+w.length);return v[R()%v.length]});
 const C=encrypt(P,K),z=assess(C.slice(0,train.length),C.slice(train.length),K,P);if(z.exact){const c=z.candidates.find(v=>canonical(v.K)===canonical(K));if(!c||c.holdout.trueIncluded!==c.holdout.inVocab)throw Error("control inverse failure")}
 controls.push({d,K,fallback,oov:P.filter(w=>!vocab.has(id(w))).length,...z});
 }
 const original=assess(train,test), required=original.eligible-Math.floor(train.length*.05);
 // Distinct cyclic tuples, counted once each, can cover at most the sum
 // of their per-group supports. Every eligible in-vocabulary group
 // requires at least one such tuple. This bound is independent of MIN.
 const upper=q=>{let left=q,total=0;for(const [s,n] of Object.entries(original.hist).sort((a,b)=>Number(b[0])-Number(a[0]))){const k=Math.min(left,n);total+=Number(s)*k;left-=k;if(!left)break}return Math.min(original.eligible,total)};
 let minimum=0;while(upper(minimum)<required)minimum++;
 const coverageBound={required,upper76:upper(76),upper180:upper(180),minimum};
 if(JSON.stringify(coverageBound)!==JSON.stringify({required:414,upper76:190,upper180:398,minimum:188}))throw Error("original coverage bound changed");
 return {Q,M,MIN,vocab:vocab.size,train:train.length,test:test.length,controls,original,coverageBound};
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
