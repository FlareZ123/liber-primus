"use strict";
// Exact shared arbitrary pad + static half-turn affine row receiver.
const fs=require("node:fs");
function experiment(corpus,transcription,wordlist){
 const mod=x=>((x%29)+29)%29,inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error("singular")};
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const M=65536,M2=M*M,N=131,ids=[24,25,26],splits=[135,137,134];
 const labels=corpus.translit, rmap=new Map(corpus.runes.map((r,i)=>[r,i])),lookup=new Map(labels.map((r,i)=>[r,i]));
 const gp=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<w.length;){let s=w.slice(i,i+2);if(s.length===2&&lookup.has(s)){out.push(lookup.get(s));i+=2}else{if(!lookup.has(w[i]))return null;out.push(lookup.get(w[i++]));}}return out};
 const byLen=Array.from({length:16},()=>new Map());
 for(const l of wordlist.split(/\r?\n/)){let m=/^([a-z]+)\s+(\d+)$/.exec(l);if(!m)continue;let w=gp(m[1]);if(w&&w.length<=15){let k=w.join(",");let prev=byLen[w.length].get(k);if(!prev||prev.freq<+m[2])byLen[w.length].set(k,{w,freq:+m[2]});}}
 for(const w of ["A","I","O","TH","OE"]){const x=gp(w);if(!byLen[1].has(x.join(",")))byLen[1].set(x.join(","),{w:x,freq:1})}
 const vocab=byLen.map(m=>[...m.values()].sort((a,b)=>b.freq-a.freq).map(x=>x.w));
 const build=reverse=>vocab.map(ws=>{let nodes=[{e:new Int32Array(29).fill(-1),active:[]}];for(const w of ws){let p=0;for(const v of reverse?w.slice().reverse():w){let n=nodes[p].e[v];if(n<0){n=nodes.length;nodes[p].e[v]=n;nodes[p].active.push(v);nodes.push({e:new Int32Array(29).fill(-1),active:[]})}p=n}}assert(nodes.length<M,"trie overflow");return nodes});
 const tries=[build(false),build(true)];
 const seg=transcription.split("%");
 const pages=ids.map((page,i)=>{let groups=[...seg[page].replace(/\/\s*/g,"").matchAll(/[\u16a0-\u16ff]+/g)].map(m=>[...m[0]].map(r=>rmap.get(r)));let flat=groups.flat();assert(flat.length===corpus.pages[page].indices.length&&flat.every((v,j)=>v===corpus.pages[page].indices[j]),"source alignment p"+page);let start=0;let spans=groups.map((g,j)=>{let z={lo:start,hi:start+g.length,edge:j===0||j===groups.length-1};start+=g.length;return z});return {flat,spans,split:splits[i]}});
 const track=(p,lower)=>{let slots=Array.from({length:N},()=>({len:0,first:true,last:true}));const n=p.flat.length;for(const s of p.spans){let lo=lower?n-s.hi:s.lo,hi=lower?n-s.lo:s.hi; if(s.edge||lo<0||hi>N||hi<=lo||s.hi-s.lo>15||!vocab[hi-lo]?.length)continue;for(let t=lo;t<hi;t++)slots[t]={len:hi-lo,first:t===lo,last:t===hi-1};}return slots};
 const slots=[pages.map(p=>track(p,false)),pages.map(p=>track(p,true))];
 const source=pages.map(p=>({a:p.flat.slice(0,N),b:p.flat.slice(-N).reverse()}));
 const rows=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(a||b)rows.push({a,b,d:a?mod(b*inv(a)):29});
 assert(rows.length===840,"row count");
 function exact(projected,lane,trace=false){
  let states=new Set([0]),max=1,history=trace?[]:null,statesAt=[];
  const table=tries[lane],sl=slots[lane];
  for(let t=0;t<N;t++){
   const s=sl.map(x=>x[t]),tr=s.map(x=>x.len?table[x.len]:null),c=projected.map(x=>x[t]),next=new Set(),back=trace?new Map():null;
   for(const packed of states){const idx=[packed%M,Math.floor(packed/M)%M,Math.floor(packed/M2)];const n=tr.map((a,j)=>a?a[s[j].first?0:idx[j]]:null);
    let pivot=0,size=30;for(let j=0;j<3;j++){let k=n[j]?n[j].active.length:29;if(k<size){pivot=j;size=k}}
    const vals=n[pivot]?n[pivot].active:ALL;
    for(const v of vals){let p0=mod(v+c[0]-c[pivot]),p1=mod(v+c[1]-c[pivot]),p2=mod(v+c[2]-c[pivot]);
      let x=n[0]?n[0].e[p0]:0;if(x<0)continue;let y=n[1]?n[1].e[p1]:0;if(y<0)continue;let z=n[2]?n[2].e[p2]:0;if(z<0)continue;
      if(s[0].last)x=0;if(s[1].last)y=0;if(s[2].last)z=0;let dst=x+M*y+M2*z;
      if(!next.has(dst)){next.add(dst);if(trace)back.set(dst,[packed,p0,p1,p2]);}
    }
   }
   max=Math.max(max,next.size);statesAt.push(next.size);if(!next.size)return {failure:t,max,statesAt};
   if(trace)history.push(back);states=next;
  }
  let result={failure:null,max,statesAt,finalStates:states.size};
  if(trace){let p=states.values().next().value,words=[[],[],[]];for(let t=N-1;t>=0;t--){let h=history[t].get(p);p=h[0];for(let j=0;j<3;j++)words[j].push(h[j+1]);}result.plain=words.map(w=>w.reverse());result.pad=result.plain[0].map((v,t)=>mod(v-projected[0][t]));assert(result.plain.every((w,j)=>w.every((v,t)=>v===mod(projected[j][t]+result.pad[t]))),"replay");}
  return result;
 }
 const ALL=Array.from({length:29},(_,i)=>i);
 const project=(tracks,row)=>tracks.map(p=>p.a.map((a,t)=>mod(row.a*a+row.b*p.b[t])));
 function scan(tracks,lane){let fail=Array(N).fill(0),survive=[],max=0;for(const row of rows){let p=project(tracks,row),r=exact(p,lane);max=Math.max(max,r.max);if(r.failure===null)survive.push({...row,...exact(p,lane,true)});else fail[r.failure]++;}return {lane,fail,survive,max};}
 const summarize=(tracks)=>{let r=[scan(tracks,0),scan(tracks,1)],matrices=0;for(const a of r[0].survive)for(const b of r[1].survive)if(a.d!==b.d)matrices++;return {r,matrices}};
 let seed=232426;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
 function plantTrack(sl,lane){let out=[];for(let t=0;t<N;){let s=sl[t];if(!s.len){out.push(random(29));t++;continue;}assert(s.first,"word start");let list=vocab[s.len],w=list[random(Math.min(100,list.length))].slice();if(lane)w.reverse();out.push(...w);t+=s.len;}return out;}
 const result={N,vocabulary:vocab.map(x=>x.length),sourceSlots:slots.map(l=>l.map(s=>({constrained:s.filter(x=>x.len).length,words:s.filter(x=>x.len&&x.first).map(x=>x.len)}))),original:null,plants:[]};
 for(let n=0;n<2;n++){
  let k=n?{r:{a:9,b:17},s:{a:12,b:5}}:{r:{a:1,b:1},s:{a:1,b:28}},det=inv(mod(k.r.a*k.s.b-k.r.b*k.s.a));
  let plain=slots.map((l,i)=>l.map(s=>plantTrack(s,i))),pad=[ALL,ALL].map(()=>Array.from({length:N},()=>random(29))),cipher=ids.map((_,j)=>{let a=[],b=[];for(let t=0;t<N;t++){let x=mod(plain[0][j][t]-pad[0][t]),y=mod(plain[1][j][t]-pad[1][t]);a.push(mod(det*(k.s.b*x-k.r.b*y)));b.push(mod(det*(-k.s.a*x+k.r.a*y)));}return {a,b}});
  let scanResult=summarize(cipher);
  let trueRows=[k.r,k.s].map((row,i)=>scanResult.r[i].survive.find(z=>z.a===row.a&&z.b===row.b));assert(trueRows.every(Boolean),"true row missing");const counts=trueRows.map((r,i)=>r.plain.map((p,j)=>p.filter((v,t)=>v===plain[i][j][t]).length));
  result.plants.push({key:k,scan:scanResult,counts});
 }
 result.original=summarize(source);
 return result;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt"];
const xs=paths.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(xs[0]),xs[1],xs[2]),null,2));
