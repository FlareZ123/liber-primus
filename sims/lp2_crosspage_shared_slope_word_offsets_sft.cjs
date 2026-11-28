'use strict';
// Node 22; no dependencies. Exact shared-slope, independent word-offset echo gate.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcription){
 const mod=x=>((x%29)+29)%29, inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>mod(x*y)===1)??0);
 const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length),tape=pages.flatMap(p=>p.indices),owner=pages.flatMap(p=>Array(p.indices.length).fill(p.page)),idx=new Map(corpus.runes.map((x,i)=>[x,i]));
 let words=[],buf=[],pos=0,start=0;function finish(){if(buf.length){words.push({v:buf,page:owner[start],offset:start});buf=[]}}
 for(const ch of transcription){if(idx.has(ch)){if(!buf.length)start=pos;buf.push(idx.get(ch));pos++}else if(ch==="-"||ch===".")finish();if(pos===tape.length)break}finish();
 if(words.length!==2896||tape.length!==12956||words.flatMap(w=>w.v).some((v,i)=>v!==tape[i]))throw Error("source parse mismatch");
 const shape=v=>{const d=v.map(x=>mod(x-v[0])),q=d.find(x=>x!==0)||0;return {key:d.map(x=>q?mod(x*inv[q]):0).join(","),q,head:v[0],v}};
 const base=words.map(w=>shape(w.v)),valid=[];for(let i=0;i<words.length-1;i++){const a=words[i].v.length,b=words[i+1].v.length;if(a>=2&&b>=2&&a+b>=5)valid.push(i)}
 function scan(arr){const seen=new Map(),hits=[];for(const i of valid){const a=arr[i],b=arr[i+1],key=a.key+"|"+b.key,prior=seen.get(key)||[];for(const j of prior){if(words[i].page===words[j].page)continue;
  const A=arr[j],B=arr[j+1],s0=A.q?mod(a.q*inv[A.q]):0,s1=B.q?mod(b.q*inv[B.q]):0;if(s0&&s1&&s0!==s1)continue;
  const slopes=s0||s1?[s0||s1]:Array.from({length:28},(_,k)=>k+1);
  for(const s of slopes){const k0=mod(a.head-s*A.head),k1=mod(b.head-s*B.head),elig=[],ok=[];for(const step of [-1,2]){const x=j+step,y=i+step;if(x<0||y>=arr.length||words[x].page!==words[j].page||words[y].page!==words[i].page)continue;const u=arr[x].v,v=arr[y].v;if(u.length<2||u.length!==v.length)continue;elig.push(step);const k=step===-1?k1:k0;if(u.every((z,l)=>mod(s*z+k)===v[l]))ok.push(step)}
   if(!A.v.every((z,l)=>mod(s*z+k0)===a.v[l])||!B.v.every((z,l)=>mod(s*z+k1)===b.v[l]))throw Error("invariant failure");
   hits.push({i:j,j:i,pages:[words[j].page,words[i].page],offsets:[words[j].offset,words[i].offset],lengths:[a.v.length,b.v.length],s,k0,k1,eligibleNeighbors:elig,passedNeighbors:ok,words:[A.v,B.v,a.v,b.v]});
  }}prior.push(i);seen.set(key,prior)}return hits}
 const hits=scan(base),counts={};for(const h of hits){const n=h.lengths[0]+h.lengths[1];counts[n]=(counts[n]||0)+1}
 const pairCount=new Set(hits.map(h=>h.i+":"+h.j)).size;
 const pmap=new Map();let plant=null;for(let i=1;i<words.length-2;i++){const seg=words.slice(i-1,i+3);if(seg.some(w=>w.page!==words[i].page||w.v.length<3)||seg[1].v.length+seg[2].v.length<7||!seg[1].v.some(x=>x!==seg[1].v[0])||!seg[2].v.some(x=>x!==seg[2].v[0]))continue;const k=seg.map(w=>w.v.length).join(",");if(pmap.has(k)&&words[pmap.get(k)].page!==words[i].page){plant=[pmap.get(k),i];break}if(!pmap.has(k))pmap.set(k,i)}
 if(!plant)throw Error("no control slots");
 const plants=[];for(const [s,k0,k1] of [[1,7,13],[19,4,23],[28,0,16]]){const a=base.slice();for(const step of [-1,0,1,2]){const k=step===-1||step===1?k1:k0;a[plant[1]+step]=shape(a[plant[0]+step].v.map(x=>mod(s*x+k)))}
 const h=scan(a).find(h=>h.i===plant[0]&&h.j===plant[1]&&h.s===s&&h.k0===k0&&h.k1===k1);if(!h||h.passedNeighbors.join(",")!=="-1,2")throw Error("plant failed");plants.push(h)}
 return {runes:tape.length,words:words.length,eligible:valid.length,pairCount,actionCount:hits.length,actionLengthHistogram:counts,nonidentityActions:hits.filter(h=>h.s!==1||h.k0!==0||h.k1!==0).length,eligibleNeighborActions:hits.filter(h=>h.eligibleNeighbors.length).length,passedNeighborActions:hits.filter(h=>h.passedNeighbors.length).length,hits,plants}
}
const root=path.join(__dirname,'..','resources','liber-primus');
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'lp2-transcription.txt'),'utf8')),null,2));
