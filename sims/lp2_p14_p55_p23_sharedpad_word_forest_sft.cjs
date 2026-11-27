'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(c, trans, wordfreq){
 const mod=x=>(x%29+29)%29,eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const runeIndex=new Map(c.runes.map((r,i)=>[r,i])),letters=c.translit.map((text,i)=>({text,i})).sort((x,y)=>y.text.length-x.text.length);
 function gp(w){const text=w.toUpperCase().replace(/[KVZQ]/g,ch=>({K:"C",V:"U",Z:"S",Q:"C"})[ch]);const r=[];for(let i=0;i<text.length;){const t=letters.find(v=>text.startsWith(v.text,i));if(t){r.push(t.i);i+=t.text.length;}else i++;}return r;}
 const dict=new Map();let rows=0;
 for(const line of wordfreq.split("\n")){const m=/^([a-z]+) (\d+)$/.exec(line.trim());if(!m)continue;rows++;const w=gp(m[1]),id=w.join(",");if(!dict.has(w.length))dict.set(w.length,new Map());const d=dict.get(w.length);if(!d.has(id))d.set(id,{w,f:0});d.get(id).f+=+m[2];}
 const opts=new Map([...dict].map(([l,d])=>[l,[...d.values()]]));
 const singleton=Array.from({length:29},(_,i)=>({w:[i],f:1}));
 const original=c.pages.flatMap(p=>p.indices),symbols=[],ids=[];let id=0;
 for(const char of trans){if(runeIndex.has(char)){symbols.push(runeIndex.get(char));ids.push(id);}else if(char==="-"||char===".")id++;}
 if(!eq(symbols,original))throw Error("corpus mismatch");
 const offsets=[0];for(const p of c.pages)offsets.push(offsets.at(-1)+p.indices.length);
 const first=new Map(),last=new Map();for(let i=0;i<ids.length;i++){if(!first.has(ids[i]))first.set(ids[i],i);last.set(ids[i],i);}
 function layout(pages){
  const nodes=[],tape=[];let start=0;
  for(const p of pages){const pos=Array.from({length:c.pages[p].indices.length},(_,i)=>offsets[p]+i);tape.push(...c.pages[p].indices);
   for(let i=0;i<pos.length;){let j=i+1;while(j<pos.length&&ids[pos[j]]===ids[pos[i]])j++;
    if(first.get(ids[pos[i]])===pos[i]&&last.get(ids[pos[i]])===pos[j-1]){nodes.push({start:start+i,len:j-i,complete:true,id:ids[pos[i]]});}
    else for(let k=i;k<j;k++)nodes.push({start:start+k,len:1,complete:false,id:ids[pos[k]]});
    i=j;
   }start+=pos.length;
  }return {nodes,tape};
 }
 function solve(A,B,ca,cb,sign){
  const nodes=[...A.nodes.map(x=>({...x,side:0})),...B.nodes.map(x=>({...x,side:1}))];const adj=nodes.map(()=>[]);const domains=nodes.map(n=>n.complete?(opts.get(n.len)||[]):singleton);
  for(let i=0;i<A.nodes.length;i++)for(let j=A.nodes.length;j<nodes.length;j++){const a=nodes[i],b=nodes[j],lo=Math.max(a.start,b.start),hi=Math.min(a.start+a.len,b.start+b.len);if(lo<hi){adj[i].push({v:j,lo,hi});adj[j].push({v:i,lo,hi});}}
  function sig(i,k,e){const n=nodes[i],w=domains[i][k].w,ct=n.side?cb:ca;let s="";for(let p=e.lo;p<e.hi;p++)s+=String.fromCharCode(65+mod((ct[p]-w[p-n.start])*(n.side?sign:1)));return s;}
  let impossible=0,maxOverlap=0,example=null;for(let i=0;i<A.nodes.length;i++)for(const e of adj[i]){if(!nodes[i].complete||!nodes[e.v].complete)continue;const d=new Set(domains[e.v].map((_,k)=>sig(e.v,k,e)));if(!domains[i].some((_,k)=>d.has(sig(i,k,e)))){impossible++;maxOverlap=Math.max(maxOverlap,e.hi-e.lo);if(!example)example={start:e.lo,end:e.hi,wordIds:[nodes[i].id,nodes[e.v].id]};}}
  const visited=new Set(),dp=[],links=[],roots=[];let components=0,failedComponents=0,total=1n;
  function visit(i,parent){if(visited.has(i))throw Error("nonforest");visited.add(i);const d=domains[i],count=d.map(()=>1n),score=d.map(x=>Math.log(x.f)),children=[];
   for(const e of adj[i])if(e.v!==parent){const j=e.v;visit(j,i);const buckets=new Map();
    for(let k=0;k<domains[j].length;k++){if(!dp[j].count[k])continue;const s=sig(j,k,e),old=buckets.get(s),val=dp[j].score[k];if(old){old.count+=dp[j].count[k];if(val>old.score){old.score=val;old.best=k;}}else buckets.set(s,{count:dp[j].count[k],score:val,best:k});}
    const choices=new Int32Array(d.length).fill(-1);
    for(let k=0;k<d.length;k++){if(!count[k])continue;const b=buckets.get(sig(i,k,e));if(!b){count[k]=0n;score[k]=-Infinity;}else{count[k]*=b.count;score[k]+=b.score;choices[k]=b.best;}}
    children.push({j,choices});
   }dp[i]={count,score};links[i]=children;
  }
  for(let i=0;i<nodes.length;i++)if(!visited.has(i)){visit(i,-1);components++;const ct=dp[i].count.reduce((s,v)=>s+v,0n);if(!ct)failedComponents++;total*=ct;let best=-1;for(let k=0;k<domains[i].length;k++)if(dp[i].count[k]&&(best<0||dp[i].score[k]>dp[i].score[best]))best=k;roots.push({i,best});}
  const p=[Array(ca.length),Array(cb.length)];function recover(i,k){const n=nodes[i];for(let a=0;a<n.len;a++)p[n.side][n.start+a]=domains[i][k].w[a];for(const {j,choices} of links[i])recover(j,choices[k]);}
  for(const {i,best} of roots)if(best>=0)recover(i,best);
  if(total&&(!p[0].every((v,i)=>mod(ca[i]-v)===mod(sign*(cb[i]-p[1][i])))))throw Error("replay");
  return {impossible,maxOverlap,example,components,failedComponents,assignments:total.toString(),plain:total?p:null};
 }
 let seed=33011423;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
 function plant(l){const p=Array(l.tape.length);for(const n of l.nodes){const d=n.complete?opts.get(n.len):singleton;if(!d?.length)throw Error("empty plant domain "+n.len);const w=d[rand(d.length)].w;for(let i=0;i<n.len;i++)p[n.start+i]=w[i];}return p;}
 const A=layout([23]),out=[];
 for(const pair of [[14,55],[32,51]]){const B=layout(pair);
  for(const sign of [1,-1]){const x=solve(A,B,A.tape,B.tape,sign),controls=[];
   for(let j=0;j<4;j++){const a=plant(A),b=plant(B),k=a.map(()=>rand(29)),k2=a.map(()=>rand(29)),ca=a.map((v,i)=>mod(v+k[i])),cb=b.map((v,i)=>mod(v+sign*k[i])),wrong=b.map((v,i)=>mod(v+sign*k2[i]));const y=solve(A,B,ca,cb,sign),z=solve(A,B,ca,wrong,sign);if(y.assignments==="0")throw Error("plant failed");controls.push({matchedAssignments:y.assignments,correct:y.plain[0].filter((v,i)=>v===a[i]).length+y.plain[1].filter((v,i)=>v===b[i]).length,wrongAssignments:z.assignments,wrongFailedComponents:z.failedComponents});}
   out.push({pair,sign,completeWords:[A.nodes.filter(x=>x.complete).length,B.nodes.filter(x=>x.complete).length],original:x,controls});
  }
 }
 return {rows,uniqueWords:[...opts.values()].reduce((s,v)=>s+v.length,0),results:out};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/control/english_wordfreq_textblob.txt')),null,2));
