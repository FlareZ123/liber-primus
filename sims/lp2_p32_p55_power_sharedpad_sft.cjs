"use strict";
/** Source-linked p32/p55 shared multiplicative pad after arbitrary invertible
 * nonzero power registers. Exhaust all 12*12*28 relative exponent/phase states
 * per full contiguous placement. All lexical overlap constraints exact.
 * Node 22: node sims/lp2_p32_p55_power_sharedpad_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const {files,build,tape,active,makeDomains}=require("./lp2_p32_p55_multiplicative_sharedpad_sft.cjs");
const ok=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%28+28)%28,FULL=(1<<28)-1,units=[1,3,5,9,11,13,15,17,19,23,25,27];
const exp=Array(28),log=Array(29).fill(-1);for(let i=0,v=1;i<28;i++,v=v*2%29){exp[i]=v;log[v]=i;}ok(new Set(exp).size===28,"generator 2");
const bits=x=>{const o=[];while(x){const b=x&-x;o.push(31-Math.clz32(b));x^=b;}return o;};
const rot=(x,s)=>((x<<s)|(x>>>(28-s)))&FULL;
/** Build forest of paired nonzero positions, preserving whole-word F patterns. */
function prepare(A,B,hold,drop,offset,domain){
 const left=active(A,hold).slice(offset),right=active(B,hold,drop);ok(left.length>=right.length,"overlap");
 const nodes=new Map(),edges=new Map(),pairs=[];
 function node(T,site,label){const key=label+site.wi;if(!nodes.has(key)){const d=domain(T.words[site.wi],T.carry&&site.wi===0);nodes.set(key,{key,T,wi:site.wi,d,edges:[]});}return nodes.get(key);}
 for(let k=0;k<right.length;k++){const a=left[k],b=right[k],l=node(A,a,"A"),r=node(B,b,"B");pairs.push({a,b,l,r});if(!a.v||!b.v)continue;
  const key=l.key+":"+r.key;if(!edges.has(key)){const e={l,r,g:[]};edges.set(key,e);l.edges.push(e);r.edges.push(e);}edges.get(key).g.push({ai:a.i,bi:b.i,D:mod(log[a.v]-log[b.v])});
 }
 const visited=new Set();function visit(n,parent){ok(!visited.has(n.key),"forest cycle");visited.add(n.key);for(const e of n.edges){const c=e.l===n?e.r:e.l;if(c!==parent)visit(c,n);}}for(const n of nodes.values())if(!visited.has(n.key))visit(n,null);
 return {A,B,hold,drop,offset,n:right.length,nodes,edges:[...edges.values()],pairs};
}
const pack=v=>v.map(x=>String.fromCharCode(65+x)).join("");
const rightCache=new WeakMap();
function rightIndex(e,b){
 const d=e.r.d;let cache=rightCache.get(d);if(!cache)rightCache.set(d,cache=new Map());
 const pos=e.g.map(x=>x.bi),key=b+":"+pos.join();if(cache.has(key))return cache.get(key);
 const groups=new Map();for(const w of d.words){const first=b*log[w[pos[0]]]%28,sig=pack(pos.slice(1).map(i=>mod(b*log[w[i]]-first)));groups.set(sig,(groups.get(sig)||0)|(1<<first));}
 cache.set(key,groups);return groups;
}
/** For D=a log(PA)-b log(PB)+s, join all differential word signatures,
 * then retain the exact phase mask derived from the first paired symbol.
 */
function prune(e,masks){
 const D=e.g.map(x=>x.D),pos=e.g.map(x=>x.ai),dd=D.slice(1).map(x=>mod(x-D[0]));
 const newMasks=new Uint32Array(144);
 for(let i=0;i<12;i++){
  const a=units[i],js=[];for(let j=0;j<12;j++)if(masks[i*12+j])js.push(j);
  if(!js.length)continue;
  const indexes=js.map(j=>rightIndex(e,units[j]));
  for(const w of e.l.d.words){
   const first=a*log[w[pos[0]]]%28,sig=pack(pos.slice(1).map((p,k)=>mod(a*log[w[p]]-first-dd[k]))),s=mod(D[0]-first);
   for(let k=0;k<js.length;k++){const j=js[k],ix=i*12+j;const mask=indexes[k].get(sig)||0;newMasks[ix]|=rot(mask,s)&masks[ix];}
  }
 }
 return newMasks;
}
/** Exact hard lexical min frequency forest solver for a fixed register. */
function solve(g,a,b,s){
 const sig=(w,e,isA)=>pack(e.g.map(x=>isA?mod(a*log[w[x.ai]]+s-x.D):b*log[w[x.bi]]%28));
 const visited=new Set(),chosen=new Map(),dp=new Map();let cost=0;
 const argmin=v=>{let ix=-1,m=Infinity;for(let i=0;i<v.length;i++)if(v[i]<m){m=v[i];ix=i;}return ix;};
 function reduce(n,parent){
  visited.add(n.key);const d=n.d.cost.slice();dp.set(n.key,d);
  for(const e of n.edges){const c=e.l===n?e.r:e.l;if(c===parent)continue;reduce(c,n);
   const m=new Map(),v=dp.get(c.key);
   for(let j=0;j<c.d.words.length;j++){const z=sig(c.d.words[j],e,c===e.l);if(v[j]<(m.get(z)??Infinity))m.set(z,v[j]);}
   for(let j=0;j<d.length;j++)d[j]+=m.get(sig(n.d.words[j],e,n===e.l))??Infinity;
  }
 }
 function select(n,parent,pw,edge){
  const want=edge?sig(pw,edge,parent===edge.l):null,v=dp.get(n.key);let ix=-1,m=Infinity;
  for(let j=0;j<v.length;j++){const w=n.d.words[j];if(want!==null&&sig(w,edge,n===edge.l)!==want)continue;if(v[j]<m){m=v[j];ix=j;}}
  ok(ix>=0,"hard forest witness");const w=n.d.words[ix];chosen.set(n.key,w);
  for(const e of n.edges){const c=e.l===n?e.r:e.l;if(c!==parent)select(c,n,w,e);}
 }
 for(const n of g.nodes.values())if(!visited.has(n.key)){reduce(n,null);const d=dp.get(n.key),ix=argmin(d);if(ix<0)return null;cost+=d[ix];select(n,null,null,null);}
 const key=[];
 for(const {a:x,b:y,l,r} of g.pairs){const p=chosen.get(l.key)[x.i],q=chosen.get(r.key)[y.i];
  const la=p?mod(a*log[p]+s):-1,lb=q?b*log[q]%28:-1,k=x.v?mod(log[x.v]-la):y.v?mod(log[y.v]-lb):0;
  ok((p?exp[mod(la+k)]:0)===x.v&&(q?exp[mod(lb+k)]:0)===y.v,"forward replay");key.push(exp[k]);
 }
 return {a,b,s,cost,PA:g.A.words.map((_,i)=>chosen.get("A"+i)??null),PB:g.B.words.map((_,i)=>chosen.get("B"+i)??null),key};
}
function attack(g){
 if([...g.nodes.values()].some(n=>!n.d.words.length))return {local:0,survivors:[]};
 let masks=new Uint32Array(144).fill(FULL);
 const informative=g.edges.filter(e=>e.g.length>=2).sort((a,b)=>{
  const score=e=>e.g.length*Math.log(28)-Math.log(e.l.d.words.length*e.r.d.words.length);
  return score(b)-score(a);
 });
 let tested=0;
 for(const e of informative){masks=prune(e,masks);tested++;if(!masks.some(v=>v))return {local:0,survivors:[],tested};}
 let local=0;const survivors=[];
 for(let i=0;i<144;i++)for(const s of bits(masks[i])){local++;const v=solve(g,units[Math.floor(i/12)],units[i%12],s);if(v)survivors.push(v);}
 return {local,survivors,tested};
}
function run(data){
 const {gp,dict,solved,source}=build(data),domain=makeDomains(dict),A=tape(source(32),true),B=tape(source(55),true);
 const render=w=>w.map(v=>v?v.map(x=>gp.translit[x]).join(""):"…").join(" ");
 const controls=[];
 for(const hold of [false,true]){
  const tA=tape(solved[1].slice(0,35),false),tB=tape(solved[8],false),off=9,a=3,b=5,s=7;
  const key=Array.from({length:active(tA,hold).length},(_,j)=>1+(7*j*j+11*j+3)%28);
  function enc(T,k,p,shift){let j=0;return T.words.map(w=>w.map(v=>hold&&!v?0:v?exp[mod(p*log[v]+shift+log[k[j++]]) ]:(j++,0)));}
  const CA=tape(enc(tA,key,a,s),false),CB=tape(enc(tB,key.slice(off),b,0),false),g=prepare(CA,CB,hold,0,off,domain),v=attack(g);
  const truth=v.survivors.find(x=>x.a===a&&x.b===b&&x.s===s);ok(truth,"hidden power register");
  const best=v.survivors.slice().sort((a,b)=>a.cost-b.cost)[0];
  controls.push({hold,n:g.n,local:v.local,survivors:v.survivors.length,trueRegister:[a,b,s],bestRegister:[best.a,best.b,best.s],exactPad:best.key.filter((v,i)=>v===key[off+i]).length,plaintextA:render(best.PA),plaintextB:render(best.PB)});
 }
 const all=[],allSurvivors=[];
 for(const hold of [false,true])for(const drop of [0,1])for(let offset=0;offset<=active(A,hold).length-active(B,hold,drop).length;offset++){
  const g=prepare(A,B,hold,drop,offset,domain),x=attack(g);all.push({hold,drop,offset,n:g.n,local:x.local,survivors:x.survivors.length,tested:x.tested});
  for(const v of x.survivors)allSurvivors.push({...v,hold,drop,offset,n:g.n});
 }
 allSurvivors.sort((a,b)=>a.cost-b.cost);return {controls,placements:all.length,registersPerPlacement:4032,local:all.reduce((s,x)=>s+x.local,0),hardSurvivors:allSurvivors.length,byClock:[false,true].map(hold=>{const x=all.filter(v=>v.hold===hold);return {hold,placements:x.length,local:x.reduce((s,v)=>s+v.local,0),survivors:x.reduce((s,v)=>s+v.survivors,0)};}),best:allSurvivors.slice(0,5).map(v=>({...v,plaintextA:render(v.PA),plaintextB:render(v.PB)})),all};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={files,run};
