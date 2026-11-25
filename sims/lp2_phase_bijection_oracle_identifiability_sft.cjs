"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {files,build}=require("./lp2_unknown_q8_group_anagram_exact_sft.cjs");
const nums=s=>Array.from(s,x=>x.charCodeAt(0)-65),id=w=>String.fromCharCode(...w.map(x=>65+x));
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function shuffle(a,R){a=a.slice();for(let j=a.length-1;j>0;j--){const i=R()%(j+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function encode(P,enc,s){const C=[];for(const x of P){C.push(enc[s][x]);if(x!==0)s=(s+1)&7;}return {C,t:s};}
function plant(db,seed,contiguous=false){
 const R=rng(seed),enc=Array.from({length:8},()=>[0,...shuffle(Array.from({length:28},(_,i)=>i+1),R)]);
 const donors=db.donors.map(D=>D.slice(Math.floor(D.length*.8)));
 let W,source;
 if(!contiguous){
  const pool=Array.from({length:25},()=>[]);
  for(const D of donors)for(const w of D)if(w.length<=24&&db.types.has(id(w)))pool[w.length].push(w);
  W=db.terminal.map(x=>{const a=pool[x.C.length];assert(a.length);return a[R()%a.length];});
  source="heldout donor words, exact terminal length profile";
 }else{
  const d=seed%donors.length,D=donors[d];
  for(let i=0;i+66<=D.length;i++){
   const w=D.slice(i,i+66),n=w.reduce((s,w)=>s+w.length,0);
   if(n<300||n>316||!w.every(w=>db.types.has(id(w))))continue;
   W=w;source={donor:d,heldoutOffset:i};break;
  }
  assert(W,"no contiguous donor window");
 }
 let phase=0;
 const original=W.map((P,order)=>{const s=phase,{C,t}=encode(P,enc,s);phase=t;return {P,C,s,t,order};});
 let shuffled;
 if(contiguous)shuffled=shuffle(original,R);
 else{
  const buckets=Array.from({length:25},()=>[]);
  for(const x of original)buckets[x.C.length].push(x);
  for(let n=1;n<buckets.length;n++)buckets[n]=shuffle(buckets[n],R);
  shuffled=db.terminal.map(x=>buckets[x.C.length].pop());
 }
 assert.equal(shuffled.length,66);
 return {seed,source,enc,original,fit:shuffled.slice(0,49),hold:shuffled.slice(49)};
}
function emptyMap(){
 return {M:Array.from({length:8},()=>[0,...Array(28).fill(-1)]),I:Array.from({length:8},()=>[0,...Array(28).fill(-1)])};
}
function insert(state,p,c,x,trail){
 const {M,I}=state;
 if(M[p][c]!==-1)return M[p][c]===x;
 if(I[p][x]!==-1)return false;
 M[p][c]=x;I[p][x]=c;if(trail)trail.push([p,c,x]);return true;
}
function undo(state,trail){for(const [p,c,x] of trail){state.M[p][c]=-1;state.I[p][x]=-1;}}
function observedPairs(row,W){
 if(W.length!==row.C.length)return null;
 const a=[];let phase=row.s;
 for(let i=0;i<W.length;i++){
  const c=row.C[i],x=W[i];
  if((c===0)!==(x===0))return null;
  if(c===0)continue;
  a.push([phase,c,x]);phase=(phase+1)&7;
 }
 assert.equal(phase,row.t);return a;
}
function addPairs(state,pairs,trail){for(const [p,c,x] of pairs)if(!insert(state,p,c,x,trail))return false;return true;}
function knownMap(rows){
 const m=emptyMap();for(const row of rows)assert(addPairs(m,observedPairs(row,row.P),null));return m;
}
function uncertainty(state){
 const unused=state.M.map(a=>a.filter(x=>x===-1).length),log10=unused.reduce((s,n)=>{for(let k=2;k<=n;k++)s+=Math.log10(k);return s;},0);
 return {unused,knownNonzero:224-unused.reduce((a,b)=>a+b,0),log10};
}
function domains(rows,byLength,state){
 return rows.map(row=>{
  const candidates=[];
  for(const w of byLength[row.C.length]){
   const pairs=observedPairs(row,nums(w));if(!pairs)continue;
   const trail=[];if(addPairs(state,pairs,trail))candidates.push({w,pairs:trail.slice()});
   undo(state,trail);
  }
  assert(candidates.length,"true word lost");return candidates;
 });
}
function compatible(state,a){for(const [p,c,x] of a.pairs){const m=state.M[p][c],i=state.I[p][x];if(m!==-1&&m!==x||i!==-1&&i!==c)return false;}return true;}
/** Shared all-different lexical CSP. Each output is a distinct word tuple,
 * not a completion differing only at unobserved alphabet entries. */
function solve(D,state,limit=256,forced=null){
 const selected=Array(D.length).fill(null),results=[];let nodes=0,capped=false;
 function rec(){
  nodes++;if(results.length>=limit){capped=true;return;}
  let j=-1,best=null;
  for(let i=0;i<D.length;i++)if(selected[i]===null){
   const a=(forced&&forced.i===i?D[i].filter(x=>x.w===forced.w):D[i]).filter(x=>compatible(state,x));
   if(!a.length)return;
   if(best===null||a.length<best.length){j=i;best=a;}
  }
  if(j<0){results.push(selected.map(x=>x.w));return;}
  for(const a of best){
   const trail=[];assert(addPairs(state,a.pairs,trail));selected[j]=a;rec();selected[j]=null;undo(state,trail);
   if(results.length>=limit){capped=true;break;}
  }
 }
 rec();return {results,nodes,capped};
}
function fullKey(state){
 const enc=[];
 for(let p=0;p<8;p++){
  const M=state.M[p].slice(),uC=[],uP=[];
  for(let c=1;c<29;c++)if(M[c]===-1)uC.push(c);
  for(let x=1;x<29;x++)if(state.I[p][x]===-1)uP.push(x);
  assert.equal(uC.length,uP.length);for(let i=0;i<uC.length;i++)M[uC[i]]=uP[i];
  assert.equal(new Set(M).size,29);const e=Array(29);for(let c=0;c<29;c++)e[M[c]]=c;enc.push(e);
 }
 return enc;
}
function replay(item,words){
 const state=knownMap(item.fit),all=item.fit.map(x=>({row:x,P:x.P})).concat(item.hold.map((x,i)=>({row:x,P:nums(words[i])})));
 for(const {row,P} of all)assert(addPairs(state,observedPairs(row,P),null));
 const enc=fullKey(state),ordered=all.sort((a,b)=>a.row.order-b.row.order);let phase=0,n=0;
 for(const {row,P} of ordered){assert.equal(phase,row.s);const {C,t}=encode(P,enc,phase);assert.deepEqual(C,row.C);assert.equal(t,row.t);phase=t;n+=C.length;}
 return {n,uncertainty:uncertainty(state)};
}
function experiment(raw){
 const db=build(raw),byLength=Array.from({length:25},()=>[]);
 // A stricter witness register excludes artificial one-rune pseudo-words
 // other than actual English A/I/O, unless they occur in control truth.
 // We retain the full frozen register for the main exact CSP.
 for(const w of db.types)byLength[w.length].push(w);
 const out=[];
 for(const [seed,contiguous] of [[271101,false],[271102,false],[271103,false],[271104,true],[271105,true],[271106,true]]){
  const item=plant(db,seed,contiguous),m=knownMap(item.fit),fitUncertainty=uncertainty(m),truthUncertainty=uncertainty(knownMap(item.original));
  const D=domains(item.hold,byLength,m),truth=item.hold.map(x=>id(x.P));
  assert(D.every((d,i)=>d.some(x=>x.w===truth[i])));
  const r=solve(D,m,256);
  assert(r.results.length>0);
  // Seek independent lexical alternatives per heldout group. An alternate
  // of length >=2 is stronger than ambiguity among artificial singletons.
  const support=[],witnesses=[];let supportNodes=0;
  for(let i=0;i<D.length;i++){
   const a=[];
   for(const z of D[i]){const q=solve(D,m,1,{i,w:z.w});supportNodes+=q.nodes;if(q.results.length){
    a.push(z.w);if(z.w!==truth[i]&&z.w.length>=2&&witnesses.length<3)witnesses.push(q.results[0]);
   }}
   support.push(a);
  }
  const witness=witnesses[0]||r.results.find(w=>w.some((x,i)=>x!==truth[i]))||null;
  const exactTruthReplay=replay(item,truth),alternate=witness?replay(item,witness):null;
  const changed=witness?witness.map((w,i)=>({w,i})).filter(x=>x.w!==truth[x.i]).map(x=>({index:x.i,truth:truth[x.i],alternate:x.w,truthLatin:nums(truth[x.i]).map(v=>db.gp.translit[v]).join(""),alternateLatin:nums(x.w).map(v=>db.gp.translit[v]).join("")})):null;
  out.push({seed,contiguous,source:item.source,fitGroups:item.fit.length,holdGroups:item.hold.length,fitRunes:item.fit.flatMap(x=>x.C).length,holdRunes:item.hold.flatMap(x=>x.C).length,fitUncertainty,truthUncertainty,domainSizes:D.map(d=>d.length),feasibleSizes:support.map(a=>a.length),ambiguousWords:support.filter(a=>a.length>1).length,ambiguousMultiRune:support.filter((a,i)=>a.length>1&&truth[i].length>=2).length,tupleCountLowerBound:r.results.length,tupleCountCapped:r.capped,searchNodes:r.nodes,supportNodes,truthReplay:exactTruthReplay.n,alternateReplay:alternate?.n??null,changed});
 }
 return {register:db.types.size,model:"8 independent bijections fixing F, continuous hold-F source phase, shuffled whole groups; oracle true fit words and all start phases",results:out};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment,plant,knownMap,uncertainty,domains,solve,replay};
