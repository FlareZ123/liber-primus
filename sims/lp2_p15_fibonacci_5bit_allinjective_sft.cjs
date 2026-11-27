"use strict";
const fs=require("node:fs"),path=require("node:path");
const run=function run(c,prior,t){
 const ck=(b,m)=>{if(!b)throw Error(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const ids=s=>[...s].map(ch=>c.runes.indexOf(ch)).filter(x=>x>=0);
 const source=c.pages.filter(p=>p.indices.length),pg=t.split("%").filter(s=>ids(s).length);
 ck(eq(pg.map(ids),source.map(p=>p.indices)),"corrected transcription mismatch");
 function region(lo,hi,skip=0){
  let pages=pg.filter((_,i)=>source[i].page>=lo&&source[i].page<=hi);
  if(skip){let i=0,n=0;while(n<skip)if(c.runes.includes(pages[0][i++]))n++;pages[0]=pages[0].slice(i)}
  const p=pages.map(ids),l=pages.flatMap(s=>s.split("/").map(ids).filter(a=>a.length));
  const w=pages.join("").replace(/[\/\n&$]/g,"").split(/[-.]/).map(ids).filter(a=>a.length);
  const a=p.flat();ck(eq(l.flat(),a)&&eq(w.flat(),a),"frame conservation");
  return {chapter:[a],page:p,line:l,group:w};
 }
 function code(n){ck(Number.isSafeInteger(n)&&n>0,"bad code integer");let f=[1,2];while(f.at(-1)<=n)f.push(f.at(-1)+f.at(-2));f.pop();let b=f.map(()=>0);for(let k=f.length-1;k>=0;k--)if(f[k]<=n){b[k]=1;n-=f[k]}ck(n===0,"greedy");return b.join("")+"1"}
 const bit5=d=>d.toString(2).padStart(5,"0");
 const scopes=[["p15black-p22",region(15,22,20)],["p40-p53",region(40,53)],["p0-p55",region(0,55)]];
 ck(scopes[0][1].chapter[0].length===1883&&scopes[0][1].group.length===432,"p15 target");
 ck(scopes[1][1].chapter[0].length===3008&&scopes[2][1].chapter[0].length===12956,"independent lengths");
 function observed(frames){
  let count=Array(841).fill(0);for(let a of frames)for(let i=1;i<a.length;i++)count[a[i-1]*29+a[i]]++;
  return {frames:frames.length,n:frames.flat().length,transitions:count.reduce((a,b)=>a+b,0),support:count.filter(Boolean).length,count};
 }
 function analyze(map){
  ck(map.length===29&&new Set(map).size===29,"injective codebook");
  const w=map.map(code),tr=[{next:[-1,-1],sym:-1}];
  for(let k=0;k<w.length;k++){let s=0;for(let ch of w[k]){ck(tr[s].sym<0,"prefix");let d=+ch;if(tr[s].next[d]<0){tr[s].next[d]=tr.length;tr.push({next:[-1,-1],sym:-1})}s=tr[s].next[d]}ck(tr[s].sym<0&&tr[s].next.every(x=>x<0),"prefix");tr[s].sym=k}
  const states=tr.map((_,i)=>i).filter(i=>tr[i].sym<0);
  function parse(s,b){let p=[];for(let ch of b){s=tr[s].next[+ch];if(s<0)return null;if(tr[s].sym>=0){p.push(tr[s].sym);s=0}}return {s,p}}
  const T=tr.map((_,i)=>Array.from({length:32},(_,d)=>parse(i,bit5(d))?.s??-1));
  const G=Array.from({length:32},()=>Array(32).fill(0));
  for(let s of states)for(let a=0;a<32;a++)if(T[s][a]>=0)for(let b=0;b<32;b++)if(T[T[s][a]][b]>=0)G[a][b]=1;
  // Independent two-token parser agrees on every edge.
  for(let a=0;a<32;a++)for(let b=0;b<32;b++)ck(G[a][b]===+states.some(s=>parse(s,bit5(a)+bit5(b))!==null),"edge equivalence");
  function edges(omit){let n=0;for(let a=0;a<32;a++)if(!omit.includes(a))for(let b=0;b<32;b++)if(!omit.includes(b))n+=G[a][b];return n}
  const canonical=edges([29,30,31]),all32=edges([]);
  let max=-1,omits=[],cases=0;for(let a=0;a<30;a++)for(let b=a+1;b<31;b++)for(let d=b+1;d<32;d++){cases++;let e=edges([a,b,d]);if(e>max){max=e;omits=[]}if(e===max)omits.push([a,b,d])}
  ck(cases===4960,"subsets");
  // Positive controls: exact GP57 payload and hidden frame cuts, arbitrary stationary relabeling.
  // Canonical five-bit carrier and independently fixed alternative subsets; no fit to original.
  const native=c.pages.find(p=>p.page===57).indices;
  function plant(omit){
   const allowed=Array.from({length:32},(_,i)=>i).filter(d=>!omit.includes(d)),A=new Set(allowed);
   const back=Array(native.length+1).fill(-1);back[0]=0;
   function emit(bits){const d=[];for(let k=0;k+5<=bits.length;k+=5)d.push(parseInt(bits.slice(k,k+5),2));return {d,tail:bits.slice(5*d.length)}}
   for(let i=0;i<native.length;i++)if(back[i]>=0){let b="";for(let j=i;j<native.length;j++){b+=w[native[j]];const e=emit(b);if(e.d.some(x=>!A.has(x)))break;if(e.d.length&&back[j+1]<0)back[j+1]=i}}
   if(back.at(-1)<0)return null;
   let frames=[];for(let j=native.length;j>0;){let i=back[j],p=native.slice(i,j),e=emit(p.map(v=>w[v]).join(""));const d=e.d.map(v=>(7*allowed.indexOf(v)+3)%29);
    const inv=d.map(v=>allowed[((v-3+29)*25)%29]);ck(eq(inv,e.d),"permutation inverse");
    let r=parse(0,inv.map(bit5).join("")+e.tail);ck(r&&r.s===0&&eq(r.p,p),"exact native replay");
    for(let k=1;k<inv.length;k++)ck(G[inv[k-1]][inv[k]]===1,"native false negative");
    frames.unshift({d,p});j=i;
   }
   const o=observed(frames.map(f=>f.d));ck(o.support<=max&&o.support<=edges(omit),"native support");
   return {omitted:omit,runes:frames.flatMap(f=>f.p).length,carrierRunes:o.n,frames:o.frames,support:o.support};
  }
  const positive=plant([29,30,31]);ck(positive&&positive.runes===95,"canonical plant");
  const alternative=plant([28,29,30]); // includes 31, if representable for this fixed native fixture
  const diagnostics=scopes.map(([name,fr])=>({name,frames:Object.entries(fr).map(([label,frames])=>{
   const o=observed(frames);const sorted=o.count.slice().sort((a,b)=>b-a);
   const cutLower=sorted.slice(max).reduce((a,b)=>a+b,0);
   return {label,frames:o.frames,n:o.n,transitions:o.transitions,distinctPairs:o.support,excludedByAllStaticInjections:o.support>max,minimumAdditionalCuts:cutLower};
  })}));
  return {prefixStates:states.length,canonical,all32,maxEdges29:max,maximizers:omits,subsets:cases,positive,alternative,diagnostics};
 }
 return prior.results.map(({name,map})=>({name,...analyze(map)}));
};
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("im-results/lp2-p15-fibonacci-payload-base29.json")),read("resources/transcriptions/lp2-image-corrected.txt")),null,2));}
module.exports=run;
