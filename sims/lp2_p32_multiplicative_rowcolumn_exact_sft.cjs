'use strict';
// GP29 multiplicative row/column mask, exact lexical anchor cover.
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw) {
 const [ct,tx,lex,nat]=raw,c=JSON.parse(ct),native=JSON.parse(nat);
 const mod=x=>(x%28+28)%28, key=a=>String.fromCharCode(...a), insist=(b,m)=>{if(!b)throw Error(m)};
 const exp=Array.from({length:28},(_,i)=>Number(2n**BigInt(i)%29n));insist(new Set(exp).size===28,"primitive generator");
 const lg=Array(29);lg[0]=28;exp.forEach((x,i)=>lg[x]=i);
 const gp=x=>x===28?0:exp[x], shift=(x,k)=>x===28?28:mod(x-k);
 const read=s=>(s.replace(/[/\r\n]/g,"").match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>c.runes.indexOf(x)));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a}
 const dict=Array.from({length:30},()=>new Map()),add=a=>{if(a.length<30){const b=a.map(x=>lg[x]);dict[b.length].set(key(b),b)}};
 for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+[1-9]\d*$/i);if(m)add(encode(m[1]))}
 for(const s of native.sections)for(const w of read(s.source_text))add(w);
 const spans=w=>{let i=0;return w.map(x=>{const a=i;i+=x.length;return[a,i]})};
 const src=read(tx.split("%")[32]), C=src.flat().map(x=>lg[x]);insist(C.length===121&&C.every((x,i)=>gp(x)===c.pages[32].indices[i]),"original transcript");
 const S=spans(src),covers=[[7],[3],[9,13],[11,19]],anchors=[28,31,32,33,34,35,36];
 const zeroSupport=src.map((w,i)=>({i,length:w.length,zeros:w.flatMap((x,j)=>x===0?[j]:[]),count:[...dict[w.length].values()].filter(p=>p.every((x,j)=>(x===28)===(w[j]===0))).length}));
 const log=new Float64Array(841),counts=new Float64Array(841).fill(.3),tot=new Float64Array(29).fill(8.7);
 for(const s of native.sections.filter(s=>!["0_loss_of_divinity","0_koan_1"].includes(s.name))){const a=read(s.source_text).flat();for(let i=1;i<a.length;i++){counts[a[i-1]*29+a[i]]++;tot[a[i-1]]++}}
 for(let i=0;i<841;i++)log[i]=Math.log(counts[i]/tot[Math.floor(i/29)]);
 function graph(edges) {
  const adj=Array.from({length:11},()=>[]);edges.forEach(([a,b],i)=>{adj[a].push([b,i,1]);adj[b].push([a,i,-1])});
  const comp=Array(11).fill(-1),vis=[],roots=[];
  for(let i=0;i<11;i++)if(comp[i]<0){const id=roots.length;roots.push(i);comp[i]=id;const q=[i];for(let j=0;j<q.length;j++){const a=q[j];for(const [b,e,d] of adj[a])if(comp[b]<0){comp[b]=id;vis.push([a,b,e,d]);q.push(b)}}}
  function pot(ds){const v=Array(11).fill(0);for(const [a,b,e,d] of vis)v[b]=mod(v[a]+d*ds[e]);for(let i=0;i<edges.length;i++){const [a,b]=edges[i];if(mod(v[b]-v[a])!==ds[i])return null}return v}
  return {comp,roots,pot};
 }
 function domain(C,[a,b]) {
  const pairs=[],edges=[];
  for(let i=a;i<b;i++){if(C[i]===28)continue;let j=i+1;while(j<b&&Math.floor(j/11)===Math.floor(i/11)&&C[j]===28)j++;if(j<b&&Math.floor(j/11)===Math.floor(i/11)){pairs.push([i,j]);edges.push([i%11,j%11])}}
  const g=graph(edges),d=new Map();
  for(const P of dict[b-a].values()){
   if(P.some((p,i)=>(p===28)!==(C[a+i]===28)))continue;
   const ds=pairs.map(([i,j])=>mod(C[j]-C[i]-P[j-a]+P[i-a]));const k=key(ds);if(!d.has(k))d.set(k,{ds,v:g.pot(ds)});
  }
  return{edges,g,items:[...d.values()]};
 }
 function maskCandidates(C,S,covers){
  const masks=new Map(),detail=[];
  for(const cover of covers){
   const d=cover.map(i=>domain(C,S[i])),edges=d.flatMap(x=>x.edges),g=graph(edges);
   insist(g.roots.length<=2,"unsupported >2 gauge components: "+cover);
   const before=masks.size;let compatible=0;
   function put(ds){const v=g.pot(ds);if(v===null)return;compatible++;for(let k=0;k<(g.roots.length===2?28:1);k++){const z=v.map((x,j)=>mod(x+(g.comp[j]===1?k:0)));masks.set(key(z),z)}}
   if(d.length===1){for(const x of d[0].items)put(x.ds)}
   else {
    insist(d.length===2,"cover size");
    const common=[];for(let i=0;i<11;i++)for(let j=i+1;j<11;j++)if(d.every(x=>x.g.comp[i]===x.g.comp[j]))common.push([i,j]);
    const signature=x=>key(common.map(([i,j])=>mod(x.v[j]-x.v[i]))),idx=new Map();
    for(const y of d[1].items){const k=signature(y);if(!idx.has(k))idx.set(k,[]);idx.get(k).push(y)}
    for(const x of d[0].items)for(const y of idx.get(signature(x))||[])put([...x.ds,...y.ds]);
   }
   detail.push({cover,domainSizes:d.map(x=>x.items.length),components:g.roots.length,compatible,added:masks.size-before});
  }
  return{masks,detail};
 }
 const caches=new Map();
 function norm(a){const f=a.find(x=>x!==28);return a.map(x=>x===28?28:mod(x-f))}
 function first(a){return a.find(x=>x!==28)??28}
 function signature(a,k){return key(k===a.length?norm(a):[...norm(a.slice(0,k)),...norm(a.slice(k))])}
 function index(n,k){const id=n+":"+k;if(caches.has(id))return caches.get(id);const m=new Map();for(const a of dict[n].values()){const sig=signature(a,k);if(!m.has(sig))m.set(sig,[]);m.get(sig).push(k===n?[first(a)]:[first(a.slice(0,k)),first(a.slice(k))])}caches.set(id,m);return m}
 const all=Array.from({length:28},(_,i)=>i);
 function solve(C,S,covers,identity=[]){
  const {masks,detail}=maskCandidates(C,S,covers);
  const specs=S.map(([a,b])=>{insist(b-a<=11,"long word");const split=Math.min(b-a,11-a%11);return{a,b,split,r:Math.floor(a/11),idx:index(b-a,split)}});
  let best=Infinity,bestScore=-Infinity,winner=null,minimumMaskCount=0,eligible=0;const hist=Array(S.length+1).fill(0);
  for(const v of masks.values()){
   const required=Array(11).fill(-1);let ok=true;for(const i of identity){if(C[i]===28)continue;const r=Math.floor(i/11),k=mod(-v[i%11]);if(required[r]>=0&&required[r]!==k){ok=false;break}required[r]=k}if(!ok)continue;eligible++;
   const base=C.map((x,i)=>shift(x,v[i%11])),unary=Array.from({length:11},()=>new Int16Array(28)),cross=Array(10).fill(null);
   const possibilities=(z,p)=>z===28?all:[mod(z-p)];
   for(const {a,b,split,r,idx} of specs){const z=base.slice(a,b),l=z.length,hits=idx.get(signature(z,split))||[];
    if(split===l){const good=new Uint8Array(28);for(const [p] of hits)for(const k of possibilities(first(z),p))good[k]=1;for(let k=0;k<28;k++)unary[r][k]+=1-good[k]}
    else{insist(cross[r]===null,"multiple cross words");const f=first(z.slice(0,split)),g=first(z.slice(split)),pairs=new Set();for(const [p,q] of hits)for(const x of possibilities(f,p))for(const y of possibilities(g,q))pairs.add(x*28+y);cross[r]=[...pairs].map(z=>[Math.floor(z/28),z%28])}
   }
   const allow=(r,k)=>required[r]<0||required[r]===k;
   let d=Array.from(unary[0],(m,k)=>allow(0,k)?m:Infinity);
   for(let r=1;r<11;r++){const min=Math.min(...d),extra=cross[r-1]===null?0:1;const nd=Array(28).fill(min+extra);for(const [a,b] of cross[r-1]||[])if(d[a]<nd[b])nd[b]=d[a];for(let k=0;k<28;k++)nd[k]=allow(r,k)?nd[k]+unary[r][k]:Infinity;d=nd}
   const miss=Math.min(...d);insist(Number.isFinite(miss),"no allowed rows");hist[miss]++;if(miss>best)continue;
   if(miss<best){best=miss;bestScore=-Infinity;minimumMaskCount=0}minimumMaskCount++;
   const rowScore=Array.from({length:11},(_,r)=>all.map(k=>{let s=0;for(let j=1;j<11;j++)s+=log[gp(shift(base[11*r+j-1],k))*29+gp(shift(base[11*r+j],k))];return s}));
   const better=(a,b)=>a.m<b.m||(a.m===b.m&&a.s>b.s);
   let z=all.map(k=>({m:allow(0,k)?unary[0][k]:Infinity,s:rowScore[0][k]}));const paths=[];
   for(let r=1;r<11;r++){let im=0;for(let k=1;k<28;k++)if(better(z[k],z[im]))im=k;const extra=cross[r-1]===null?0:1;
    const nd=all.map(()=>({m:z[im].m+extra,s:z[im].s})),pr=Array(28).fill(im);
    for(const [a,b] of cross[r-1]||[])if(better(z[a],nd[b])){nd[b]={...z[a]};pr[b]=a}
    for(let k=0;k<28;k++){nd[k].m=allow(r,k)?nd[k].m+unary[r][k]:Infinity;nd[k].s+=rowScore[r][k]}paths.push(pr);z=nd}
   let end=0;for(let k=1;k<28;k++)if(better(z[k],z[end]))end=k;
   insist(z[end].m===miss,"DP disagreement");
   if(z[end].s>bestScore){bestScore=z[end].s;const u=Array(11);u[10]=end;for(let r=10;r>0;r--)u[r-1]=paths[r-1][u[r]];
    const P=base.map((x,i)=>gp(shift(x,u[Math.floor(i/11)])));
    insist(P.every((p,i)=>p*exp[u[Math.floor(i/11)]]*exp[v[i%11]]%29===gp(C[i])),"replay");
    insist(identity.every(i=>P[i]===gp(C[i])),"identity crib");
    const missWords=S.flatMap(([a,b],i)=>dict[b-a].has(key(P.slice(a,b).map(x=>lg[x])))?[]:[i]);insist(missWords.length===miss,"OOV");
    winner={u,v,P,words:S.map(([a,b])=>P.slice(a,b).map(x=>c.translit[x]).join(" ")),missWords};
   }
  }
  return{detail,maskCount:masks.size,eligible,best:Number.isFinite(best)?best:null,minimumMaskCount,hist,score:Number.isFinite(bestScore)?bestScore/110:null,winner};
 }
 function enc(P,seed){const u=Array.from({length:11},(_,i)=>mod(seed+3*i*i+7*i)),v=Array.from({length:11},(_,i)=>mod(11*i*i+seed*i));return{u,v,C:P.map((x,i)=>lg[x*exp[u[Math.floor(i/11)]]*exp[v[i%11]]%29])}}
 const controls=[["0_koan_1",177,206,13],["0_loss_of_divinity",37,68,71]].map(([name,a,b,seed])=>{
  const w=read(native.sections.find(s=>s.name===name).source_text).slice(a,b+1),P=w.flat(),S=spans(w),anchor=w.findIndex(x=>x.length===11&&!x.includes(0));insist(P.length===121&&anchor>=0,"native control geometry");
  const e=enc(P,seed),r=solve(e.C,S,[[anchor]]);return{name,a,b,seed,anchor,correct:r.winner?.P.filter((x,i)=>x===P[i]).length,keyCorrect:r.winner?.u.every((x,i)=>x===e.u[i])&&r.winner?.v.every((x,i)=>x===e.v[i]),trueU:e.u,trueV:e.v,trueP:P,...r}
 });
 // Match layout and original F positions whenever lexical support permits.
 // If a position pattern is impossible, choose the zero-free fallback and record it.
 const used=new Set(),fallback=[],plant=src.map((w,i)=>{let opts=[...dict[w.length].values()].filter(p=>p.every((x,j)=>(x===28)===(w[j]===0))&&!used.has(key(p)));if(!opts.length){fallback.push(i);opts=[...dict[w.length].values()].filter(p=>!p.includes(28)&&!used.has(key(p)))}insist(opts.length>0,"stress geometry");const z=opts[(i*1259+77)%opts.length];used.add(key(z));return z});
 const removed=[3,7,9].map(i=>plant[i]);for(const w of removed)dict[w.length].delete(key(w));caches.clear();
 const P=plant.flat().map(gp),e=enc(P,137),r=solve(e.C,S,covers),stress={fallback,correct:r.winner?.P.filter((x,i)=>x===P[i]).length,keyCorrect:r.winner?.u.every((x,i)=>x===e.u[i])&&r.winner?.v.every((x,i)=>x===e.v[i]),trueU:e.u,trueV:e.v,trueP:P,...r};
 for(const w of removed)dict[w.length].set(key(w),w);caches.clear();
 const gate=controls.every(x=>x.correct===121&&x.keyCorrect&&x.best===0)&&stress.correct===121&&stress.keyCorrect&&stress.best===3;
 return{schema:1,model:"C[r,c]=P[r,c]*2^(u[r]+v[c]) mod29",generator:2,zeroPreserved:true,dictSize:dict.reduce((s,d)=>s+d.size,0),covers,S,zeroSupport,controls,stress,gate,original:gate?solve(C,S,covers):null,conditionalIdentity:gate?solve(C,S,covers,anchors):null,anchors};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
