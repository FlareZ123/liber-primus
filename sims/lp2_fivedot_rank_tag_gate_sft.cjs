'use strict';
const fs = require('node:fs');
const path = require('node:path');
function rankGate(corpus,native){
 const perm=a=>a.length===0?[[]]:a.flatMap((v,i)=>perm(a.filter((_,j)=>i!==j)).map(t=>[v,...t]));
 const layouts=Array.from({length:5},(_,t)=>perm([0,1,2,3,4].filter(i=>i!==t)).map(order=>({t,order}))).flat();
 const blocks=(a,n)=>Array.from({length:Math.floor(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n));
 const same=(a,b)=>a.every((x,i)=>x===b[i]);
 const adjacent=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
 const allOrders=(a,rank)=>{const x=perm(a).filter((v,i,arr)=>arr.findIndex(w=>same(v,w))===i);return x.sort((u,v)=>{for(let i=0;i<u.length;i++){const d=rank[u[i]]-rank[v[i]];if(d)return d;}return 0;});};
 const canonical=(a,rank)=>{const p=allOrders(a,rank),best=Math.min(...p.map(adjacent));return p.find(x=>adjacent(x)===best);};
 function encode(p,l,rank){return blocks(p,4).map(x=>{const orders=allOrders(x,rank),tag=orders.findIndex(v=>same(v,x)),canonicalPayload=canonical(x,rank),b=Array(5);b[l.t]=tag;l.order.forEach((k,i)=>b[k]=canonicalPayload[i]);return b;});}
 function decode(bs,l,rank){return bs.flatMap(b=>{let p=l.order.map(i=>b[i]);const orders=allOrders(p,rank);if(b[l.t]>=orders.length||!same(canonical(p,rank),p))throw Error("invalid");return orders[b[l.t]];});}
 function check(bs,l){const edges=Array.from({length:29},()=>Array(29).fill(-1));let distinct=0,tag=new Set(),dt=new Set(),contradiction=null,minRepeatBad=0;
   for(let bi=0;bi<bs.length;bi++){const b=bs[bi],p=l.order.map(i=>b[i]);tag.add(b[l.t]);const possible=Math.min(...perm(p).map(adjacent));if(adjacent(p)>possible)minRepeatBad++;
     if(new Set(p).size!==4)continue;distinct++;dt.add(b[l.t]);
     for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const u=p[i],v=p[j];if(edges[v][u]>=0&&!contradiction)contradiction={runes:[u,v],forwardBlock:bi,reverseBlock:edges[v][u]};if(edges[u][v]<0)edges[u][v]=bi;}}
   let remaining=new Set(Array.from({length:29},(_,i)=>i)),topo=[],unique=true;
   while(remaining.size){let zeros=[...remaining].filter(v=>![...remaining].some(u=>edges[u][v]>=0));if(zeros.length===0)break;if(zeros.length!==1)unique=false;const v=zeros[0];remaining.delete(v);topo.push(v);}
   return {t:l.t,order:l.order,distinct,tagCount:tag.size,distinctPayloadTagCount:dt.size,minRepeatBad,contradiction,acyclic:remaining.size===0,uniqueOrder:remaining.size===0&&unique,topo};
 }
 const chapter=corpus.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices).slice(16);if(chapter.length!==1005)throw Error("source width");const bs=blocks(chapter,5);
 const original=layouts.map(l=>({all:check(bs,l),first:check(bs.slice(0,100),l),held:check(bs.slice(100),l)}));
 const tape=native.sections.flatMap(s=>[...s.source_text].map(r=>native.runes.indexOf(r)).filter(x=>x>=0));
 const plants=[{l:{t:2,order:[4,1,0,3]},off:0,m:11,a:7},{l:{t:4,order:[2,0,3,1]},off:1047,m:17,a:3}].map(({l,off,m,a})=>{const rank=Array.from({length:29},(_,i)=>(m*i+a)%29),p=tape.slice(off,off+804),encoded=encode(p,l,rank),recovered=decode(encoded,l,rank);if(!same(p,recovered)||!same(encoded.flat(),encode(recovered,l,rank).flat()))throw Error("plant replay");const gates=layouts.map(x=>check(encoded,x));const trueGate=gates.find(x=>x.t===l.t&&same(x.order,l.order));if(!trueGate.acyclic||trueGate.minRepeatBad||trueGate.tagCount>24)throw Error("true rejected");const observed=new Set(p);let relation=0,comparable=0;const infer=Array(29);trueGate.topo.forEach((x,i)=>infer[x]=i);for(let i of observed)for(let j of observed)if(i<j){relation++;if((rank[i]<rank[j])===(infer[i]<infer[j]))comparable++;}
 return {l,off,n:p.length,observed:observed.size,recovered:recovered.length,adjacent:adjacent(encoded.flat()),trueGate,acyclicLayouts:gates.filter(x=>x.acyclic).length,admissibleLayouts:gates.filter(x=>x.acyclic&&x.minRepeatBad===0&&x.tagCount<=24).length,topologicalPairAgreement:[comparable,relation]};});
 const capacity={unrestrictedFour:29**4,unrestrictedFive:29**5,multisets:32*31*30*29/24,maxCanonicalTagCodewords:29*(32*31*30*29/24),maxDistinctPermutations:24};
 return {chapterLength:chapter.length,blocks:bs.length,capacity,original,plants};
}
const root=path.resolve(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(rankGate(...paths.map(p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')))),null,2));
