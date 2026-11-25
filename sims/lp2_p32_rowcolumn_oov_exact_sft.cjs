'use strict';
// Exact p32 two-axis additive inverse with OOV-aware disjoint anchor covers.
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const [ct,tx,lex,nat,oeRaw]=raw, c=JSON.parse(ct),native=JSON.parse(nat), mod=x=>((x%29)+29)%29;
 const key=a=>String.fromCharCode(...a), read=s=>(s.replace(/[/\r\n]/g,"").match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>c.runes.indexOf(x)));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a}
 const dict=Array.from({length:30},()=>new Map());const add=a=>{if(a.length<30)dict[a.length].set(key(a),a)};
 for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+[1-9]\d*$/i);if(m)add(gp(m[1]))}
 for(const s of native.sections)for(const w of read(s.source_text))add(w);
 const oe=oeRaw?JSON.parse(oeRaw):null,oeWords=[];let oeAdded=0;const dictModern=dict.reduce((s,d)=>s+d.size,0);
 if(oe){let i=0;for(const n of oe.allSourceGpWordLengths){const a=[...oe.sourceGpBase29.slice(i,i+n)].map(x=>oe.positiveControlAlphabet.indexOf(x));if(a.length!==n||a.some(x=>x<0||x>=29))throw Error("invalid OE fixture");i+=n;oeWords.push(a);add(a)}if(i!==oe.sourceGpBase29.length)throw Error("OE fixture length mismatch");oeAdded=dict.reduce((s,d)=>s+d.size,0)-dictModern;}
 const spans=words=>{let t=0;return words.map(w=>{let a=t;t+=w.length;return[a,t]})};
 const src=read(tx.split("%")[32]), C=src.flat();if(C.length!==121||C.some((x,i)=>x!==c.pages[32].indices[i]))throw Error("p32 transcription mismatch");
 const S=spans(src), covers=[[7],[3],[9,13],[11,19]];
 if(new Set(covers.flat()).size!==covers.flat().length)throw Error("covers overlap");
 const caches=new Map();
 function norm(a){return a.map(x=>mod(x-a[0]))}
 function index(n,k){const id=n+":"+k;if(caches.has(id))return caches.get(id);const m=new Map();for(const a of dict[n].values()){const sig=key(k===n?norm(a):[...norm(a.slice(0,k)),...norm(a.slice(k))]);if(!m.has(sig))m.set(sig,[]);m.get(sig).push(k===n?[a[0]]:[a[0],a[k]])}caches.set(id,m);return m}
 const log=new Float64Array(841),counts=new Float64Array(841).fill(0.3),rows=new Float64Array(29).fill(8.7);
 for(const s of native.sections.filter(s=>s.name!=="0_loss_of_divinity")){const a=read(s.source_text).flat();for(let i=1;i<a.length;i++){counts[a[i-1]*29+a[i]]++;rows[a[i-1]]++}}
 if(oe){const a=oeWords.flat().slice(0,oe.trainingPrefixGpRunes);for(let i=1;i<a.length;i++){counts[a[i-1]*29+a[i]]++;rows[a[i-1]]++}}
 for(let i=0;i<841;i++)log[i]=Math.log(counts[i]/rows[Math.floor(i/29)]);
 // Each dictionary word constrains the difference v[j+1]-v[j] at all internal same-row adjacencies.
 function domain(C,[a,b]){
  const edges=[];for(let i=a;i<b-1;i++)if(i%11!==10)edges.push(i%11);
  const unique=new Map();
  for(const P of dict[b-a].values()){const z=Array(10).fill(-1);for(let i=a;i<b-1;i++)if(i%11!==10)z[i%11]=mod(C[i+1]-C[i]-(P[i-a+1]-P[i-a]));unique.set(z.join(","),z)}
  return{edges,values:[...unique.values()]};
 }
 function maskCandidates(C,S,covers){
  const masks=new Map(),perCover=[];
  for(const cover of covers){
   const domains=cover.map(i=>domain(C,S[i]));let values=domains[0].values,edges=domains[0].edges;
   for(const d of domains.slice(1)){
    const common=edges.filter(e=>d.edges.includes(e)), group=new Map();for(const z of d.values){const q=key(common.map(e=>z[e]));if(!group.has(q))group.set(q,[]);group.get(q).push(z)}
    const next=new Map();for(const x of values)for(const y of group.get(key(common.map(e=>x[e])))||[]){const z=x.map((v,i)=>v<0?y[i]:v);next.set(z.join(","),z)}
    values=[...next.values()];edges=[...new Set([...edges,...d.edges])];
   }
   const missing=Array.from({length:10},(_,i)=>i).filter(i=>!edges.includes(i));if(missing.length>1)throw Error("cover leaves more than one unconstrained difference");
   const before=masks.size;
   for(const z of values)for(let a=0;a<(missing.length?29:1);a++){const d=z.slice();if(missing.length)d[missing[0]]=a;const v=[0];for(const x of d)v.push(mod(v.at(-1)+x));masks.set(key(v),v)}
   perCover.push({cover,domainSizes:domains.map(d=>d.values.length),jointPatterns:values.length,missing,added:masks.size-before});
  }
  return {masks,perCover};
 }
 function solve(C,S,covers){
  const {masks,perCover}=maskCandidates(C,S,covers);
  if(!masks.size)throw Error("no masks");
  const specs=S.map(([a,b])=>{if(b-a>11)throw Error("long words not supported");const split=Math.min(b-a,11-a%11);return{a,b,split,r:Math.floor(a/11),idx:index(b-a,split)}});
  let best=Infinity,bestScore=-Infinity,winner=null,ties=0,hist=Array(S.length+1).fill(0);
  for(const v of masks.values()){
   const base=C.map((x,i)=>mod(x-v[i%11])),unary=Array.from({length:11},()=>new Int16Array(29)),cross=Array(10).fill(null);
   for(const {a,b,split,r,idx} of specs){const z=base.slice(a,b),l=z.length;const sig=key(split===l?norm(z):[...norm(z.slice(0,split)),...norm(z.slice(split))]);const hits=idx.get(sig)||[];
    if(split===l){for(let k=0;k<29;k++)unary[r][k]++;for(const [p] of hits)unary[r][mod(z[0]-p)]--;}
    else {if(cross[r]!==null)throw Error("multiple cross words");cross[r]=hits.map(([p,q])=>[mod(z[0]-p),mod(z[split]-q)])}
   }
   let d=Array.from(unary[0]);
   for(let r=1;r<11;r++){let imin=d.indexOf(Math.min(...d)),extra=cross[r-1]===null?0:1;let nd=Array(29).fill(d[imin]+extra);
    for(const [a,b] of cross[r-1]||[])if(d[a]<nd[b])nd[b]=d[a];for(let k=0;k<29;k++)nd[k]+=unary[r][k];d=nd}
   const miss=Math.min(...d);hist[miss]++;if(miss>best)continue;
   if(miss<best){best=miss;bestScore=-Infinity;ties=0}ties++;
   // Exact lexicographic DP, second objective: native row-local bigram score.
   let rowScore=Array.from({length:11},(_,r)=>Array.from({length:29},(_,k)=>{let s=0;for(let j=1;j<11;j++)s+=log[mod(base[11*r+j-1]-k)*29+mod(base[11*r+j]-k)];return s}));
   let z=Array.from(unary[0],(m,k)=>({m,s:rowScore[0][k]})),paths=[];
   const better=(a,b)=>a.m<b.m||(a.m===b.m&&a.s>b.s);
   for(let r=1;r<11;r++){let im=0;for(let k=1;k<29;k++)if(better(z[k],z[im]))im=k;const extra=cross[r-1]===null?0:1;
    let nd=Array.from({length:29},()=>({m:z[im].m+extra,s:z[im].s})),pr=Array(29).fill(im);
    for(const [a,b] of cross[r-1]||[])if(better(z[a],nd[b])){nd[b]={...z[a]};pr[b]=a}
    for(let k=0;k<29;k++){nd[k].m+=unary[r][k];nd[k].s+=rowScore[r][k]}paths.push(pr);z=nd;}
   let end=0;for(let k=1;k<29;k++)if(better(z[k],z[end]))end=k;
   if(z[end].m!==miss)throw Error("DP mismatch");
   if(z[end].s>bestScore){bestScore=z[end].s;let u=Array(11);u[10]=end;for(let r=10;r>0;r--)u[r-1]=paths[r-1][u[r]];const P=base.map((x,i)=>mod(x-u[Math.floor(i/11)]));if(P.some((x,i)=>mod(x+u[Math.floor(i/11)]+v[i%11])!==C[i]))throw Error("replay");winner={u,v,P,words:S.map(([a,b])=>P.slice(a,b).map(x=>c.translit[x]).join(" ")),missWords:S.map(([a,b],i)=>dict[b-a].has(key(P.slice(a,b)))?null:i).filter(x=>x!==null)};if(winner.missWords.length!==miss)throw Error("miss count mismatch")}
  }
  return{perCover,maskCount:masks.size,best,minimumMaskCount:ties,hist,score:bestScore/110,winner};
 }
 function enc(P,seed){const u=Array.from({length:11},(_,i)=>(seed+3*i*i+7*i)%29),v=Array.from({length:11},(_,i)=>(11*i*i+seed*i)%29);return{u,v,C:P.map((x,i)=>mod(x+u[Math.floor(i/11)]+v[i%11]))}}
 const nativeWords=read(native.sections.find(s=>s.name==="0_loss_of_divinity").source_text),ns=spans(nativeWords),nTape=nativeWords.flat();
 const controls=[{start:284-33,seed:13},{start:565-9,seed:71}].map(({start,seed})=>{const P=nTape.slice(start,start+121),S=ns.filter(([a,b])=>a>=start&&b<=start+121).map(([a,b])=>[a-start,b-start]),cs=S.map(([a,b],i)=>b-a===11?[i]:null).filter(Boolean),e=enc(P,seed),r=solve(e.C,S,cs);return{start,seed,spans:S.length,actualOOV:S.filter(([a,b])=>!dict[b-a].has(key(P.slice(a,b)))).length,correct:r.winner.P.filter((x,i)=>x===P[i]).length,keyCorrect:r.winner.v.every((x,i)=>x===e.v[i])&&r.winner.u.every((x,i)=>x===e.u[i]),...r,winner:undefined}});
 const oldEnglishControls=oe?[{start:47318,anchor:47388,seed:149},{start:47782,anchor:47892,seed:173}].map(({start,anchor,seed})=>{const P=oeWords.flat().slice(start,start+121),S=spans(oeWords).filter(([a,b])=>a>=start&&b<=start+121).map(([a,b])=>[a-start,b-start]);const i=S.findIndex(([a,b])=>a===anchor-start&&b-a===11);if(i<0||S[0][0]!==0||S.at(-1)[1]!==121||start<oe.trainingPrefixGpRunes)throw Error("OE control window");const e=enc(P,seed),r=solve(e.C,S,[[i]]);return{start,anchor,seed,spans:S.length,correct:r.winner.P.filter((x,i)=>x===P[i]).length,keyCorrect:r.winner.v.every((x,i)=>x===e.v[i])&&r.winner.u.every((x,i)=>x===e.u[i]),...r,winner:undefined}}):[];
 const original=solve(C,S,covers);
 // Stress plant: exact p32 length layout, three distinct lexical words removed,
 // both 11-rune anchors and one member of the third disjoint cover.
 const used=new Set(),pl=src.map((w,i)=>{const a=[...dict[w.length].values()];let j=(i*1259+77)%a.length;while(used.has(key(a[j])))j=(j+1)%a.length;used.add(key(a[j]));return a[j]});
 const removed=[3,7,9].map(i=>pl[i]);for(const w of removed)dict[w.length].delete(key(w));caches.clear();
 const P=pl.flat(),e=enc(P,137),stress=solve(e.C,S,covers);const stressResult={removedIndices:[3,7,9],correct:stress.winner.P.filter((x,i)=>x===P[i]).length,keyCorrect:stress.winner.v.every((x,i)=>x===e.v[i])&&stress.winner.u.every((x,i)=>x===e.u[i]),...stress,winner:undefined};
 for(const w of removed)add(w);
 return{dictSize:dict.reduce((s,d)=>s+d.size,0),dict11:dict[11].size,dictModern,oeAdded,oldEnglishControls,spans:S,covers,controls,stress:stressResult,original};
}
if(require.main===module) console.log(JSON.stringify(experiment((process.argv.includes('--old-english')?[...files,'resources/control/beowulf_oe_gp_profile_corrected.json']:files).map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
