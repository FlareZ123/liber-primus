'use strict';
// Agent 2, 25 Nov 2026, run from repository root.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-grid-256.json",
    "sha": "2550eae357442912220e05dc51147523a61dd75a"
  },
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  }
];
function nestedAttack(grid,corpus,transcript,lexicon){
 const q=29,M=x=>(x%q+q)%q,check=(x,m)=>{if(!x)throw Error(m)},indices=new Map(corpus.runes.map((x,i)=>[x,i]));
 const tokens=corpus.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 const dict=new Map();for(const line of lexicon.match(/^[a-z]+\s+\d+$/gm)||[]){
  const [word,num]=line.split(/\s+/),w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  const a=[];let valid=true;for(let i=0;i<w.length;){const t=tokens.find(x=>w.startsWith(x[0],i));if(!t){valid=false;break;}a.push(t[1]);i+=t[0].length;}if(!valid)continue;
  if(!dict.has(a.length))dict.set(a.length,new Map());const z=dict.get(a.length),key=a.join(",");if(z.has(key))z.get(key).freq+=Number(num);else z.set(key,{a,freq:Number(num)});
 }
 const domains=new Map([...dict].map(([k,z])=>[k,[...z.values()].sort((a,b)=>b.freq-a.freq)]));
 const alpha=grid.alphabet.replace("f",""),T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*59+alpha.indexOf(t[1]));
 const sub=root=>Array.from({length:256},(_,i)=>i).filter(i=>{let a=i,seen=new Set();while(!seen.has(a)){if(a===root)return true;seen.add(a);a=T[a];}return false;});
 const Aids=sub(58),Bids=sub(244);check(Aids.length===121&&Bids.length===76&&Bids.every(x=>Aids.includes(x)),"nested tree");
 function page(p,s,ids){const words=transcript.split("%")[s].replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu).map(w=>[...w].map(x=>indices.get(x))),C=words.flat();check(C.join()===corpus.pages[p].indices.join()&&C.length===ids.length,"transcription");
 let start=0;const spans=words.map((w,i)=>{const o={start,len:w.length,frag:i===0&&w.length===1};start+=w.length;return o;});return {p,C,ids,spans,where:words.flatMap((w,i)=>w.map(()=>i))};}
 const A=page(32,32,Aids),B=page(55,54,Bids),pairs=Bids.map((v,j)=>[Aids.indexOf(v),j]);
 function makeNodes(page,C,holds,side,transparent,allowWild){
  return page.spans.map((s,i)=>{
   const raw=s.frag?Array.from({length:29},(_,i)=>({a:[i],freq:1})):(domains.get(s.len)||[]);
   const opts=raw.filter(w=>!transparent||w.a.every((x,j)=>(x===0)===holds.has(s.start+j)));
   return {key:side+i,s,opts,edges:[],cost:null,wild:allowWild&&!s.frag,side};
  });
 }
 function solve(CA,CB,ha,hb,transparent,soft=false){
  const NA=makeNodes(A,CA,ha,"A",transparent,soft),NB=makeNodes(B,CB,hb,"B",transparent,soft),all=[...NA,...NB],edges=new Map();
  for(const [i,j] of pairs){if(ha.has(i)||hb.has(j))continue;const a=NA[A.where[i]],b=NB[B.where[j]],key=a.key+":"+b.key;
   if(!edges.has(key)){const e={a,b,sites:[]};edges.set(key,e);a.edges.push(e);b.edges.push(e);}edges.get(key).sites.push({i:i-a.s.start,j:j-b.s.start,d:M(CA[i]-CB[j])});
  }
  const signature=(w,e,a)=>e.sites.map(x=>a?M(w[x.i]-x.d):w[x.j]).join(",");
  const other=(e,node)=>e.a===node?e.b:e.a;
  const seen=new Set(),PEN=1e6;
  function reduce(node,parent){
   check(!seen.has(node.key),"cycle");seen.add(node.key);
   const max=node.opts[0]?.freq||1;node.cost=node.opts.map(w=>Math.log(max/w.freq));if(node.wild)node.cost.push(PEN);
   for(const e of node.edges){const child=other(e,node);if(child===parent)continue;reduce(child,node);
    const map=new Map();for(let k=0;k<child.opts.length;k++){const key=signature(child.opts[k].a,e,child===e.a),v=child.cost[k];if(v<(map.get(key)??Infinity))map.set(key,v);}
    const wildCost=child.wild?child.cost[child.opts.length]:Infinity;
    for(let k=0;k<node.opts.length;k++){const key=signature(node.opts[k].a,e,node===e.a);node.cost[k]+=Math.min(map.get(key)??Infinity,wildCost);}
    if(node.wild){let min=Infinity;for(const v of child.cost)min=Math.min(min,v);node.cost[node.opts.length]+=min;}
   }
  }
  const chosen=new Map();
  function select(node,parent,parentWord,edge){const req=parentWord&&edge?signature(parentWord,edge,parent===edge.a):null;let cost=Infinity,best=-1;
   for(let i=0;i<node.cost.length;i++){const w=node.opts[i]?.a;if(req!==null&&w&&signature(w,edge,node===edge.a)!==req)continue;if(node.cost[i]<cost){cost=node.cost[i];best=i;}}
   check(best>=0,"no chosen");const w=node.opts[best]?.a||null;chosen.set(node.key,w);for(const e of node.edges){const child=other(e,node);if(child!==parent)select(child,node,w,e);}
  }
  let total=0;for(const node of all){if(seen.has(node.key))continue;reduce(node,null);let min=Infinity;for(const v of node.cost)min=Math.min(min,v);if(!Number.isFinite(min))return {feasible:false,edgeCount:edges.size,edgeLengths:[...edges.values()].map(e=>e.sites.length).sort((a,b)=>b-a)};total+=min;select(node,null,null,null);}
  const pa=NA.flatMap(n=>chosen.get(n.key)?.slice()||Array(n.s.len).fill(-1)),pb=NB.flatMap(n=>chosen.get(n.key)?.slice()||Array(n.s.len).fill(-1));
  for(const [i,j] of pairs){if(ha.has(i)||hb.has(j))continue;const d=M(CA[i]-CB[j]);if(pa[i]===-1&&pb[j]===-1){pa[i]=d;pb[j]=0;}else if(pa[i]===-1)pa[i]=M(pb[j]+d);else if(pb[j]===-1)pb[j]=M(pa[i]-d);check(M(pa[i]-pb[j])===d,"shared replay");}
  const pad=Array(256).fill(null);for(let i=0;i<pa.length;i++){if(pa[i]===-1)pa[i]=18;if(!ha.has(i))pad[Aids[i]]=M(CA[i]-pa[i]);else check(pa[i]===0&&CA[i]===0,"hold A");}
  for(let j=0;j<pb.length;j++){if(pb[j]===-1)pb[j]=18;if(!hb.has(j)){const k=Bids[j],v=M(CB[j]-pb[j]);if(pad[k]===null)pad[k]=v;else check(pad[k]===v,"pad agreement");}else check(pb[j]===0&&CB[j]===0,"hold B");}
  const render=(x,page)=>page.spans.map(s=>x.slice(s.start,s.start+s.len).map(v=>corpus.translit[v]).join("")).join(" ");
  return {feasible:true,oov:Math.floor(total/PEN),cost:total%PEN,wilds:[...chosen].filter(x=>!x[1]).map(x=>x[0]),edgeCount:edges.size,edgeLengths:[...edges.values()].map(e=>e.sites.length).sort((a,b)=>b-a),A:render(pa,A),B:render(pb,B),pa,pb,shared:pairs.filter(([i,j])=>!ha.has(i)&&!hb.has(j)).length,allReplay:CA.every((v,i)=>v===(ha.has(i)?0:M(pa[i]+pad[Aids[i]])))&&CB.every((v,j)=>v===(hb.has(j)?0:M(pb[j]+pad[Bids[j]])))};
 }
 const fsets=C=>{const f=C.flatMap((x,i)=>x===0?[i]:[]);return Array.from({length:1<<f.length},(_,m)=>new Set(f.filter((_,i)=>m&(1<<i))))};
 const ordinary=solve(A.C,B.C,new Set(),new Set(),false),soft=ordinary.feasible?null:solve(A.C,B.C,new Set(),new Set(),false,true);
 const literal=[];let masks=0;for(const ha of fsets(A.C))for(const hb of fsets(B.C)){masks++;const s=solve(A.C,B.C,ha,hb,true);if(s.feasible)literal.push({ha:[...ha],hb:[...hb],...s});}
 const plants=[];for(let t=0;t<4;t++){
  const choose=(page,offset)=>page.spans.flatMap((s,i)=>s.frag?[M(i+t+offset+1)]:domains.get(s.len)[(t*37+i*11+offset)%domains.get(s.len).length].a);
  const pa=choose(A,3),pb=choose(B,17),transparent=t>=2,ha=new Set(pa.flatMap((v,i)=>transparent&&v===0?[i]:[])),hb=new Set(pb.flatMap((v,i)=>transparent&&v===0?[i]:[]));
  const pad=Array.from({length:256},(_,i)=>M(7*i*i+11*i+13+t*3)),ca=pa.map((v,i)=>ha.has(i)?0:M(v+pad[Aids[i]])),cb=pb.map((v,i)=>hb.has(i)?0:M(v+pad[Bids[i]]));
  const s=solve(ca,cb,ha,hb,transparent);check(s.feasible&&s.allReplay,"native plant");
  plants.push({transparent,holdsA:ha.size,holdsB:hb.size,shared:s.shared,Acorrect:s.pa.filter((x,i)=>x===pa[i]).length,Bcorrect:s.pb.filter((x,i)=>x===pb[i]).length,allReplay:s.allReplay});
 }
 return {dictTypes:[...domains.values()].reduce((a,b)=>a+b.length,0),spans:[A.spans.length,B.spans.length],pairedAIndices:pairs.map(x=>x[0]),ordinary,soft,literalMasks:masks,literalSurvivors:literal,plants};
}
const data=inputs.map(({path,sha},i)=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(actual!==sha)throw Error(`input changed: ${path}`);return i<2?JSON.parse(b):b.toString('utf8')});
console.log(JSON.stringify(nestedAttack(...data),null,2));
