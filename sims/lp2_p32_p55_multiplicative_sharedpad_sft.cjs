"use strict";
/** Source-linked p32/p55 multiplicative shared-pad inverse.
 * Full contiguous placements, zero-consuming and zero-holding clocks.
 * Exact minimum-OOV forest DP with full finite word domains, arbitrary
 * nonzero GF29 key per paired position. No unknown-key optimization.
 * node sims/lp2_p32_p55_multiplicative_sharedpad_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt"];
const ok=(v,m)=>{if(!v)throw Error(m)},inv=Array.from({length:29},(_,v)=>Array.from({length:29},(_,k)=>k).find(k=>v*k%29===1)||0);
function build(data){
 const gp=JSON.parse(data[0]),map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const solved=JSON.parse(data[3]).sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 solved[3]=data[6].split("$").map(parse)[3].map(w=>w.map(v=>(2-v+29)%29));
 const dict=Array.from({length:32},()=>new Map()),add=(w,f=1)=>{if(w.length&&w.length<32){const key=String(w),old=dict[w.length].get(key);if(!old||old.f<f)dict[w.length].set(key,{w,f});}};
 function variants(word,f){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");
  function walk(i,w){if(i===s.length){add(w,f);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):a==="IO"?alpha.get("IA"):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);
 }
 for(const l of data[2].split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1],Number(m[2]));}
 for(const s of ["A","I","O"])variants(s,1);
 for(const sec of solved)for(const w of sec)add(w);
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 for(const source of data.slice(4,6))for(let w of source.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]){const p=[];w=w.replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));ok(t,"donor token");p.push(t.i);w=w.slice(t.s.length);}add(p);}
 ok(dict.reduce((s,v)=>s+v.size,0)===42468,"frozen dictionary");
 const source=p=>{const w=parse(data[1].split("%")[p<50?p:p-1]);ok(String(w.flat())===String(gp.pages[p].indices),"physical page");return w;};
 return {gp,dict,solved,source};
}
/** @param {number[][]} words @param {boolean} carry */
function tape(words,carry){const sites=words.flatMap((w,wi)=>w.map((v,i)=>({v,wi,i})));return {words,carry,sites};}
function active(t,hold,drop=0){return t.sites.filter((s,j)=>j>=drop&&(!hold||s.v!==0));}
function makeDomains(dict){const cache=new Map();return function domain(w,carry){
 const pattern=w.map(v=>+(v===0)).join(""),key=pattern+":"+carry;
 if(cache.has(key))return cache.get(key);
 const d=carry?Array.from({length:29},(_,v)=>({w:[v],f:1})).filter(x=>(x.w[0]===0)===(w[0]===0)):[...dict[w.length].values()].filter(x=>x.w.every((v,i)=>(v===0)===(w[i]===0)));
 const max=Math.max(1,...d.map(x=>x.f)),o={words:d.map(x=>x.w),cost:d.map(x=>Math.log(max/x.f)),carry};cache.set(key,o);return o;
};}
/** All paired nonzero symbols have PA/CA = PB/CB mod29.
 * A wildcard word grants every nonzero value at nonzero C positions.
 * Edges form a forest; minimum OOV then relative word-frequency cost.
 */
function solve(A,B,hold,drop,offset,domain){
 const left=active(A,hold).slice(offset),right=active(B,hold,drop);ok(left.length>=right.length,"overlap");
 const nodes=new Map(),edges=new Map(),pairs=[];
 function node(T,site,label){const key=label+site.wi;
  if(!nodes.has(key)){const o=domain(T.words[site.wi],T.carry&&site.wi===0);nodes.set(key,{key,T,wi:site.wi,o,edges:[],dp:null});}return nodes.get(key);}
 for(let k=0;k<right.length;k++){
  const a=left[k],b=right[k],l=node(A,a,"A"),r=node(B,b,"B");pairs.push({a,b,l,r});if(!a.v||!b.v)continue;
  const key=l.key+":"+r.key;if(!edges.has(key)){const e={l,r,g:[]};edges.set(key,e);l.edges.push(e);r.edges.push(e);}edges.get(key).g.push({ai:a.i,bi:b.i,ca:inv[a.v],cb:inv[b.v]});
 }
 const sig=(w,e,isA)=>e.g.map(g=>isA?w[g.ai]*g.ca%29:w[g.bi]*g.cb%29).join(",");
 const visited=new Set(),chosen=new Map(),PEN=1e6;let cost=0;
 const argmin=a=>{let j=0;for(let i=1;i<a.length;i++)if(a[i]<a[j])j=i;return j;};
 function reduce(n,parent){
  ok(!visited.has(n.key),"overlap cycle");visited.add(n.key);
  n.dp=n.o.cost.concat(n.o.carry?[]:[PEN]);ok(n.dp.length,"empty carry");
  for(const e of n.edges){const c=e.l===n?e.r:e.l;if(c===parent)continue;reduce(c,n);
   const best=new Map();
   for(let j=0;j<c.o.words.length;j++){const s=sig(c.o.words[j],e,c===e.l),v=c.dp[j];if(v<(best.get(s)??Infinity))best.set(s,v);}
   const wild=c.o.carry?Infinity:c.dp[c.o.words.length];
   for(let j=0;j<n.o.words.length;j++)n.dp[j]+=Math.min(best.get(sig(n.o.words[j],e,n===e.l))??Infinity,wild);
   if(!n.o.carry)n.dp[n.o.words.length]+=c.dp[argmin(c.dp)];
  }
 }
 function select(n,parent,pw,edge){
  const want=pw&&edge?sig(pw,edge,parent===edge.l):null;let best=Infinity,ix=-1;
  for(let j=0;j<n.dp.length;j++){const w=n.o.words[j];if(w&&want!==null&&sig(w,edge,n===edge.l)!==want)continue;if(n.dp[j]<best){best=n.dp[j];ix=j;}}
  ok(ix>=0,"constructive minimum");const word=n.o.words[ix]||null;chosen.set(n.key,word?word.slice():null);
  for(const e of n.edges){const c=e.l===n?e.r:e.l;if(c!==parent)select(c,n,word,e);}
 }
 for(const n of nodes.values())if(!visited.has(n.key)){reduce(n,null);cost+=n.dp[argmin(n.dp)];select(n,null,null,null);}
 const wilds=[...chosen].filter(([,w])=>w===null).map(([k])=>k);
 ok(Math.floor(cost/PEN)===wilds.length,"OOV objective");
 for(const k of wilds){const n=nodes.get(k);chosen.set(k,n.T.words[n.wi].map(v=>v? -1:0));}
 const pad=[];
 for(const {a,b,l,r} of pairs){
  const p=chosen.get(l.key),q=chosen.get(r.key);
  if(a.v&&b.v){
   if(p[a.i]<0&&q[b.i]<0)p[a.i]=1;
   if(p[a.i]<0)p[a.i]=a.v*inv[b.v]%29*q[b.i]%29;
   if(q[b.i]<0)q[b.i]=b.v*inv[a.v]%29*p[a.i]%29;
  }else{if(p[a.i]<0)p[a.i]=1;if(q[b.i]<0)q[b.i]=1;}
  const k=a.v?a.v*inv[p[a.i]]%29:b.v?b.v*inv[q[b.i]]%29:1;
  ok(k&&p[a.i]*k%29===a.v&&q[b.i]*k%29===b.v,"shared pad replay");pad.push(k);
 }
 const words=(T,label)=>T.words.map((_,i)=>chosen.get(label+i)??null);
 return {hold,drop,offset,n:pairs.length,oov:wilds.length,words:nodes.size,relativeCost:cost-wilds.length*PEN,wilds,PA:words(A,"A"),PB:words(B,"B"),pad};
}
function run(data){
 const {gp,dict,solved,source}=build(data),domain=makeDomains(dict),A=tape(source(32),true),B=tape(source(55),true);
 ok(A.sites.length===121&&B.sites.length===76,"pair lengths");
 const out=[];for(const hold of [false,true])for(const drop of [0,1])for(let off=0;off<=active(A,hold).length-active(B,hold,drop).length;off++)out.push(solve(A,B,hold,drop,off,domain));
 const render=ws=>ws.map(w=>w?w.map(v=>v<0?"?":gp.translit[v]).join(""):"…").join(" ");
 const details=x=>({...x,plaintextA:render(x.PA),plaintextB:render(x.PB)});
 out.sort((a,b)=>a.oov-b.oov||a.relativeCost-b.relativeCost);
 const controls=[];
 for(const hold of [false,true]){
  const PA=solved[1].slice(0,35),PB=solved[8],tA=tape(PA,false),tB=tape(PB,false);
  ok(PA.concat(PB).every(w=>dict[w.length].has(String(w))),"control lexicon");
  ok(tA.sites.filter(x=>!x.v).length>=3&&tB.sites.filter(x=>!x.v).length>=3,"both controls exercise native F holds");
  const off=9,key=Array.from({length:active(tA,hold).length},(_,j)=>1+(7*j*j+11*j+3)%28);
  function enc(T,k){let j=0;return T.words.map(w=>w.map(v=>hold&&v===0?0:v*k[j++]%29));}
  const CA=tape(enc(tA,key),false),CB=tape(enc(tB,key.slice(off)),false);
  const x=solve(CA,CB,hold,0,off,domain);ok(x.oov===0,"native control lexical");
  const exact=x.pad.filter((v,i)=>v===key[off+i]).length;
  controls.push({hold,n:x.n,oov:x.oov,exactPad:exact,fullReplay:true,plaintextA:render(x.PA),plaintextB:render(x.PB)});
 }
 return {controls,cases:out.length,hardSurvivors:out.filter(x=>x.oov===0).length,byClock:[false,true].map(hold=>{const a=out.filter(x=>x.hold===hold);return {hold,cases:a.length,minimumOOV:a[0].oov,hist:a.reduce((h,x)=>(h[x.oov]=(h[x.oov]||0)+1,h),{})};}),best:out.slice(0,5).map(details),all:out.map(({hold,drop,offset,n,oov,words,relativeCost})=>({hold,drop,offset,n,oov,words,relativeCost}))};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={run,files,build,tape,active,makeDomains};
