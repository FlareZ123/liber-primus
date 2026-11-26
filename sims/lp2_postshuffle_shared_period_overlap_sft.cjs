"use strict";
/** Exact high-support overlap upper bound for arbitrary cyclic key; reuses the frozen q76 source and lexicon. */
const fs=require("node:fs"),path=require("node:path");
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw,anchor=true,bidir=false){
 const gp=JSON.parse(raw[0]), gold=JSON.parse(raw[2]), ix=new Map(gp.runes.map((x,i)=>[x,i])), tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,id=w=>w.join(","),Q=256,M=6,BASE=29**(M-1),MIN=3;
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

 const LIMIT=420;
 /** Count lexical support by distinct source group for each possible 6-tuple. */
 function graph(groups,K=null){
  const counts=new Map();let eligible=0;
  for(const c of groups){const starts=[];for(let i=0;i<=c.length-6;i++)if(c.slice(i,i+6).every(v=>v!==0))starts.push(i);if(!starts.length)continue;eligible++;
   const seen=new Set();for(const p of lens.get(c.length)||[]){if(p.some((v,j)=>!v&&c[j]))continue;for(const i of (anchor?starts.slice(0,1):starts)){let e=0;for(let j=i;j<i+6;j++)e=29*e+mod(c[j]-p[j]);seen.add(e);if(bidir){let rev=0,x=e;for(let k=0;k<6;k++){rev=rev*29+x%29;x=Math.floor(x/29)}seen.add(rev)}}}for(const e of seen)counts.set(e,(counts.get(e)||0)+1)}
  const edges=[...counts].filter(([,w])=>w>=2),hist={};for(const w of counts.values())hist[w]=(hist[w]||0)+1;
  const maps=Array.from({length:6},()=>new Map()),prefix=[],suffix=[],sizes=[];
  // A jump of d=1..6 between selected high-support windows requires 6-d overlapping symbols.
  for(let k=0;k<6;k++){let m=maps[k],p=[],s=[],base=29**k,div=29**(6-k);const id=x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)};for(const [e] of edges){p.push(id(Math.floor(e/div)));s.push(id(e%base))}prefix.push(Int32Array.from(p));suffix.push(Int32Array.from(s));sizes.push(m.size)}
  const n=edges.length,ring=Array.from({length:6},()=>sizes.map(x=>new Int32Array(x))),extra=[],dp=new Int32Array(n);
  let best=0;
  for(let t=0;t<LIMIT;t++){
   for(let e=0;e<n;e++){let v=0;for(let d=1;d<=Math.min(6,t);d++){const k=6-d,z=ring[(t-d)%6][k][prefix[k][e]];if(z>v)v=z}dp[e]=v+edges[e][1]-1}
   let agg=ring[t%6];for(let k=0;k<6;k++){agg[k].fill(0);const z=agg[k],ss=suffix[k];for(let e=0;e<n;e++){let i=ss[e];if(dp[e]>z[i])z[i]=dp[e]}}
   for(const v of dp)if(v>best)best=v;extra.push(best);
  }
  const required=eligible-Math.floor(groups.length*.05);
  const upper=extra.map((v,t)=>Math.min(eligible,t+1+v));
  let qmin=upper.findIndex(x=>x>=required)+1;if(!qmin)qmin=">"+LIMIT;
  let truth=null;if(K){let S=new Set(),w=0;for(let i=0;i<K.length;i++){let v=0;for(let j=0;j<6;j++)v=v*29+K[(i+j)%K.length];S.add(v)}for(const v of S)w+=counts.get(v)||0;
    if(w>K.length+extra[K.length-1])throw Error("true support exceeds bound");
    truth={distinct:S.size,rawSupport:w,extraUpper:extra[K.length-1],upper:upper[K.length-1]};
  }
  return {eligible,hist,highEdges:n,sizes,extra,upper,required,qmin,truth};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const held=donors.map(d=>d.slice(Math.floor(d.length*.8))),controls=[];
 function buckets(a){let b=new Map;for(const w of a){if(!b.has(w.length))b.set(w.length,[]);b.get(w.length).push(w)}return b}
 const shared=buckets(held.flat());
 for(let i=0;i<3;i++){const R=rng(0x49a25601+i),pool=buckets(held[i]),K=Array.from({length:Q},()=>R()%29);let phase=0,fallback=0;
  const P=train.map(w=>{let a=pool.get(w.length);if(!a){a=shared.get(w.length);fallback++}if(!a)throw Error("length");return a[R()%a.length]});
  const C=P.map(w=>{let step=bidir&&R()%2?-1:1;return w.map(v=>{if(!v)return 0;let c=mod(v+K[phase]);phase=(phase+step+Q)%Q;return c})});
  const z=graph(C,K);const eligible=C.map((w,j)=>({w,p:P[j]})).filter(x=>x.w.some((_,k)=>k+6<=x.w.length&&x.w.slice(k,k+6).every(v=>v!==0)));
  const covered=eligible.filter(x=>vocab.has(id(x.p))).length;
  if(covered>z.upper[Q-1]||covered>z.truth.rawSupport)throw Error("coverage violation");
  controls.push({donor:i,fallback,key:K,covered,eligible:eligible.length,oov:P.filter(w=>!vocab.has(id(w))).length,...z});
 }
 const original=graph(train);
 return {Q,LIMIT,anchor,bidir,vocab:vocab.size,train:train.length,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),!process.argv.includes("--all-spans"),process.argv.includes("--bidir")),null,2));
module.exports={experiment};
