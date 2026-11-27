'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(c,trans,wordfreq){
 const R=29,mod=x=>(x%R+R)%R;
 const runeIndex=new Map(c.runes.map((r,i)=>[r,i])),letters=c.translit.map((text,i)=>({text,i})).sort((a,b)=>b.text.length-a.text.length),dict=new Map();
 function gp(w){const text=w.toUpperCase().replace(/[KVZQ]/g,ch=>({K:"C",V:"U",Z:"S",Q:"C"})[ch]);const r=[];for(let i=0;i<text.length;){const t=letters.find(v=>text.startsWith(v.text,i));if(t){r.push(t.i);i+=t.text.length;}else i++;}return r;}
 for(const line of wordfreq.split("\n")){const m=/^([a-z]+) (\d+)$/.exec(line.trim());if(!m)continue;const w=gp(m[1]),id=w.join(",");if(!dict.has(w.length))dict.set(w.length,new Map());const d=dict.get(w.length);if(!d.has(id))d.set(id,{w,f:0});d.get(id).f+=+m[2];}
 const opts=new Map([...dict].map(([l,d])=>[l,[...d.values()]]));
 const original=c.pages.flatMap(p=>p.indices),symbols=[],ids=[];let id=0;
 for(const ch of trans){if(runeIndex.has(ch)){symbols.push(runeIndex.get(ch));ids.push(id);}else if(ch==="-"||ch===".")id++;}
 if(symbols.length!==original.length||!symbols.every((v,i)=>v===original[i]))throw Error("source mismatch");
 const offsets=[0];for(const p of c.pages)offsets.push(offsets.at(-1)+p.indices.length);
 const first=new Map(),last=new Map();for(let i=0;i<ids.length;i++){if(!first.has(ids[i]))first.set(ids[i],i);last.set(ids[i],i);}
 function layout(pages){const nodes=[],tape=[];let start=0;for(const p of pages){const pos=Array.from({length:c.pages[p].indices.length},(_,i)=>offsets[p]+i);tape.push(...c.pages[p].indices);for(let i=0;i<pos.length;){let j=i+1;while(j<pos.length&&ids[pos[j]]===ids[pos[i]])j++;nodes.push({start:start+i,len:j-i,complete:first.get(ids[pos[i]])===pos[i]&&last.get(ids[pos[i]])===pos[j-1],id:ids[pos[i]]});i=j;}start+=pos.length;}return {nodes,tape};}
 function solve(A,B,ca,cb,sign){
  if(ca.length!==cb.length)throw Error("length");
  const nodes=[...A.nodes.map(n=>({...n,side:0})),...B.nodes.map(n=>({...n,side:1}))],adj=nodes.map(()=>[]),dom=nodes.map(n=>n.complete?(opts.get(n.len)||[]):[]);
  const ct=[ca,cb],s=[1,sign],visited=new Set(),dp=[],choices=[],roots=[];
  for(let i=0;i<A.nodes.length;i++)for(let j=A.nodes.length;j<nodes.length;j++){const a=nodes[i],b=nodes[j],lo=Math.max(a.start,b.start),hi=Math.min(a.start+a.len,b.start+b.len);if(lo<hi){adj[i].push({v:j,lo,hi});adj[j].push({v:i,lo,hi});}}
  function signature(i,k,e){const n=nodes[i],w=dom[i][k].w;let str="";for(let p=e.lo;p<e.hi;p++)str+=String.fromCharCode(65+mod(s[n.side]*(ct[n.side][p]-w[p-n.start])));return str;}
  const better=(a,b)=>a.cost<b.cost||(a.cost===b.cost&&a.weight>b.weight);
  function visit(i,parent){
   if(visited.has(i))throw Error("nonforest");visited.add(i);
   const n=nodes[i],d=dom[i],states=d.map(x=>({cost:0,weight:Math.log(x.f)})),wild={cost:n.complete?1:0,weight:0};const children=[];
   for(const e of adj[i])if(e.v!==parent){const j=e.v;visit(j,i);
    const D=dp[j],lookup=new Map();for(let k=0;k<dom[j].length;k++){const str=signature(j,k,e),val=D.states[k],old=lookup.get(str);if(!old||better(val,old))lookup.set(str,{...val,k});}
    const picks=new Int32Array(d.length);
    for(let k=0;k<d.length;k++){const val=lookup.get(signature(i,k,e)),best=val&&better(val,D.wild)?val:{...D.wild,k:-1};states[k].cost+=best.cost;states[k].weight+=best.weight;picks[k]=best.k;}
    const b=D.best;wild.cost+=b.cost;wild.weight+=b.weight;children.push({j,picks,wildPick:b.k});
   }
   let best={...wild,k:-1};for(let k=0;k<states.length;k++)if(better(states[k],best))best={...states[k],k};
   dp[i]={states,wild,best};choices[i]=children;
  }
  let cost=0;for(let i=0;i<nodes.length;i++)if(!visited.has(i)){visit(i,-1);roots.push(i);cost+=dp[i].best.cost;}
  const plain=[Array(ca.length),Array(cb.length)],selected=new Int32Array(nodes.length).fill(-1),key=Array(ca.length),omitted=[];
  function recover(i,k){selected[i]=k;const n=nodes[i];if(k>=0){const w=dom[i][k].w;for(let j=0;j<n.len;j++){const p=n.start+j,z=mod(s[n.side]*(ct[n.side][p]-w[j]));if(key[p]!==undefined&&key[p]!==z)throw Error("conflict");key[p]=z;}}
   else if(n.complete)omitted.push({side:n.side,wordId:n.id,start:n.start,len:n.len});
   for(const ch of choices[i])recover(ch.j,k<0?ch.wildPick:ch.picks[k]);}
  for(const i of roots)recover(i,dp[i].best.k);
  for(let i=0;i<key.length;i++){if(key[i]===undefined)key[i]=0;for(let j=0;j<2;j++)plain[j][i]=mod(ct[j][i]-s[j]*key[i]);}
  let actual=0;for(const n of nodes)if(n.complete&&!dict.get(n.len)?.has(plain[n.side].slice(n.start,n.start+n.len).join(",")))actual++;
  if(actual!==cost||omitted.length!==cost)throw Error("minimum witness mismatch");
  if(!plain.every((p,j)=>p.every((v,i)=>mod(v+s[j]*key[i])===ct[j][i])))throw Error("replay");
  return {minimumOOV:cost,components:roots.length,omitted,plain,key};
 }
 let seed=0x33015523;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
 function plant(l,nOOV){const p=Array(l.tape.length),eligible=l.nodes.filter(n=>n.complete&&n.len>=3),miss=new Set();while(miss.size<nOOV)miss.add(eligible[rand(eligible.length)].start);
  for(const n of l.nodes){let w;if(!n.complete||miss.has(n.start)){do{w=Array.from({length:n.len},()=>rand(29));}while(n.complete&&dict.get(n.len)?.has(w.join(",")));}else{const d=opts.get(n.len);if(!d?.length)throw Error("empty domain");w=d[rand(d.length)].w;}for(let i=0;i<n.len;i++)p[n.start+i]=w[i];}return p;}
 const A=layout([23]),results=[];
 for(const pair of [[14,55],[32,51]]){const B=layout(pair);for(const sign of [1,-1]){
  const original=solve(A,B,A.tape,B.tape,sign),controls=[];
  for(let j=0;j<6;j++){const oa=j%3,ob=j%2,a=plant(A,oa),b=plant(B,ob),k=a.map(()=>rand(29)),k2=a.map(()=>rand(29)),ca=a.map((v,i)=>mod(v+k[i])),cb=b.map((v,i)=>mod(v+sign*k[i])),wrong=b.map((v,i)=>mod(v+sign*k2[i]));const y=solve(A,B,ca,cb,sign),z=solve(A,B,ca,wrong,sign);if(y.minimumOOV>oa+ob)throw Error("positive excluded");controls.push({injected:oa+ob,minMatched:y.minimumOOV,minIndependent:z.minimumOOV,recovered:y.plain[0].filter((v,i)=>v===a[i]).length+y.plain[1].filter((v,i)=>v===b[i]).length});}
  results.push({pair,sign,completeWords:[A.nodes.filter(n=>n.complete).length,B.nodes.filter(n=>n.complete).length],original,controls});
 }}
 return {uniqueWords:[...opts.values()].reduce((s,d)=>s+d.length,0),results};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/control/english_wordfreq_textblob.txt')),null,2));
