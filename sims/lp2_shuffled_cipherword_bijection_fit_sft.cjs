"use strict";
function experiment(inputs){
 const [gp,raw,lex,native,gib,sh]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4],inputs[5]];
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,x=>map.get(x)));
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.s.length)}out.push(p)}return out}
 const g=donor(gib.slice(gib.toLowerCase().indexOf("almustafa"))),s=donor(sh);for(const p of [...g,...s])add(p);
 const vocabulary=dict.reduce((n,d)=>n+d.size,0);assert(vocabulary===40540,"lexicon");

 const words=[];let w=[];
 for(const c of raw.split('%').slice(0,55).join('%')){if(map.has(c))w.push(map.get(c));else if(!'%/'.includes(c)&&! /\s/u.test(c)&&w.length){words.push(w);w=[];}}
 if(w.length)words.push(w);assert(words.length===2896&&String(words.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original words");
 const code=x=>String.fromCharCode(...x.map(v=>65+v)),decode=x=>[...x].map(c=>c.charCodeAt(0)-65);
 const maxLen=Math.max(...words.map(w=>w.length));


 function pattern(v){const m=new Int8Array(29).fill(-1);let j=0,s="";for(const x of v){if(m[x]<0)m[x]=j++;s+=String.fromCharCode(65+m[x])}return s}
 function domains(pool,anchors){
  const max=Math.max(...anchors.map(x=>x.c.length)),pools=Array.from({length:max+1},()=>new Map());
  for(const w0 of pool)for(const w of [w0,w0.slice().reverse()]){
   const p=[];for(let n=1;n<=max;n++){p.push(w[(n-1)%w.length]);const pat=pattern(p),mp=pools[n];if(!mp.has(pat))mp.set(pat,new Set());mp.get(pat).add(code(p))}
  }
  return anchors.map(({c,i})=>{const D=new Map();let pairs=0;
   for(const P of dict[c.length].values())for(const hold of [false,true]){
    if(hold&&!P.includes(0))continue;const T=[];let ok=true;
    for(let j=0;j<c.length;j++){if(hold&&P[j]===0){if(c[j]!==0){ok=false;break}}else T.push(mod(c[j]-P[j]))}if(!ok||!T.length)continue;
    const v=pools[T.length].get(pattern(T));if(!v)continue;
    for(const s of v){const k=decode(s),m=new Int8Array(29).fill(-1);for(let j=0;j<k.length;j++)m[k[j]]=T[j];const sig=String.fromCharCode(...Array.from(m,v=>v+66));if(!D.has(sig))D.set(sig,Array.from(m));pairs++}
   }return {i,len:c.length,pairs,maps:[...D.values()]}
  })
 }
 const pc=x=>{x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
 function clique(ds,cap=1500000){
  const v=ds.flatMap((g,gi)=>g.maps.map(m=>({gi,m}))),N=v.length,W=Math.ceil(N/32),tail=N%32?2**(N%32)-1:0xffffffff;
  if(!N)return {N,best:0,exact:true};
  if(N>26000)return {N,best:0,exact:false,reason:"vertex cap"};
  const G=ds.map(()=>new Uint32Array(W)),D=Array.from({length:29},()=>new Uint32Array(W)),R=Array.from({length:29},()=>new Uint32Array(W)),E=Array.from({length:29*29},()=>new Uint32Array(W));
  for(let i=0;i<N;i++){const {gi,m}=v[i],w=i>>>5,b=1<<(i&31);G[gi][w]|=b;for(let x=0;x<29;x++)if(m[x]>=0){D[x][w]|=b;R[m[x]][w]|=b;E[x*29+m[x]][w]|=b}}
  const adj=v.map(({gi,m})=>{const a=new Uint32Array(W).fill(0xffffffff);a[W-1]=tail;
   for(let j=0;j<W;j++)a[j]&=~G[gi][j];
   for(let x=0;x<29;x++)if(m[x]>=0){const d=D[x],r=R[m[x]],e=E[x*29+m[x]];for(let j=0;j<W;j++)a[j]&=~((d[j]|r[j])&~e[j])}
   return a
  });
  let degree=adj.map(a=>a.reduce((n,x)=>n+pc(x),0)),edges=degree.reduce((n,x)=>n+x,0)/2;
  const order=Array.from({length:N},(_,i)=>i).sort((a,b)=>degree[b]-degree[a]);
  let best=[],nodes=0,capped=false;
  function empty(a){for(const x of a)if(x)return false;return true}
  function count(a){let n=0;for(const x of a)n+=pc(x);return n}
  function intersect(a,b){const x=new Uint32Array(W);for(let j=0;j<W;j++)x[j]=a[j]&b[j];return x}
  function groupBound(P){let n=0;for(const g of G){for(let j=0;j<W;j++)if(g[j]&P[j]){n++;break}}return n}
  function greedy(P){const cl=[];let Q=P.slice();while(!empty(Q)){let x=-1,deg=-1;for(const i of order)if(Q[i>>>5]&(1<<(i&31))){const d=count(intersect(Q,adj[i]));if(d>deg){deg=d;x=i}if(cl.length===0)break}cl.push(x);Q=intersect(Q,adj[x])}return cl}
  const initial=new Uint32Array(W).fill(0xffffffff);initial[W-1]=tail;best=greedy(initial);
  function first(a){for(let j=0;j<W;j++){const x=a[j];if(x)return (j<<5)+(31-Math.clz32(x&-x))}return -1}
  function color(P){const remaining=P.slice(),out=[],colors=[];let c=0;while(!empty(remaining)){c++;const Q=remaining.slice();for(let u=first(Q);u>=0;u=first(Q)){
    out.push(u);colors.push(c);remaining[u>>>5]&=~(1<<(u&31));Q[u>>>5]&=~(1<<(u&31));for(let j=0;j<W;j++)Q[j]&=~adj[u][j]
   }}return {out,colors}}
  function dfs(P,cl){if(++nodes>cap){capped=true;return}if(cl.length+groupBound(P)<=best.length)return;
   const {out,colors}=color(P);for(let j=out.length-1;j>=0;j--){if(cl.length+colors[j]<=best.length||capped)return;const u=out[j];const Q=intersect(P,adj[u]);cl.push(u);if(cl.length>best.length)best=cl.slice();if(!empty(Q)&&cl.length+groupBound(Q)>best.length)dfs(Q,cl);cl.pop();P[u>>>5]&=~(1<<(u&31))}
  }
  dfs(initial.slice(),[]);
  const m=new Int8Array(29).fill(-1),rev=new Int8Array(29).fill(-1);
  for(const i of best)for(let x=0;x<29;x++){const y=v[i].m[x];if(y<0)continue;assert((m[x]<0||m[x]===y)&&(rev[y]<0||rev[y]===x),"bijection clique");m[x]=y;rev[y]=x}
  return {N,edges,best:best.length,exact:!capped,nodes,matched:best.map(i=>ds[v[i].gi].i),mapping:Array.from(m),assigned:Array.from(m).filter(x=>x>=0).length}
 }
 let seed=0x4c44a901;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function emit(P,K,f,rev,hold){const k=rev?K.slice().reverse():K;let t=0;return P.map(x=>hold&&x===0?0:mod(x+f[k[t++%k.length]]))}
 function matches(m,a){const r=new Int8Array(29).fill(-1);m.forEach((y,x)=>{if(y>=0)r[y]=x});return a.every((y,x)=>y<0||(m[x]<0?r[y]<0:m[x]===y))}
 function candidates(C,pool,m){const out=new Set();for(const k0 of pool)for(const k of [k0,k0.slice().reverse()])for(const hold of [false,true]){
  let t=0;const walk=(i,p)=>{if(i===C.length){if(dict[p.length].has(String(p)))out.add(code(p));return}
    if(hold&&C[i]===0)walk(i+1,[...p,0]);const y=m[k[t%k.length]];if(y<0)return;const x=mod(C[i]-y);if(hold&&x===0)return;t++;walk(i+1,[...p,x]);t--};walk(0,[])
 }return [...out]}

 function completeFit(ds,cap=50000,maxSolutions=64){
  // Bitset of candidate partial maps consistent with each input/output assignment.
  const indexes=ds.map(d=>{
   const V=d.maps,N=V.length,W=Math.ceil(N/32),base=new Uint32Array(W).fill(0xffffffff);if(N%32)base[W-1]=2**(N%32)-1;
   const D=Array.from({length:29},()=>new Uint32Array(W)),R=Array.from({length:29},()=>new Uint32Array(W)),E=new Map();
   for(let i=0;i<N;i++){const w=i>>>5,b=1<<(i&31);for(let x=0;x<29;x++){const y=V[i][x];if(y<0)continue;D[x][w]|=b;R[y][w]|=b;const k=x*29+y;if(!E.has(k))E.set(k,new Uint32Array(W));E.get(k)[w]|=b}}
   return {V,W,base,D,R,E};
  });
  let nodes=0,capped=false,solutionCap=false;const sol=new Map();
  function filter(j,Q,x,y){const {D,R,E,W}=indexes[j],d=D[x],r=R[y],e=E.get(x*29+y);for(let k=0;k<W;k++)Q[k]&=~((d[k]|r[k])&~(e?e[k]:0))}
  function dfs(m,remaining,sets){
   if(++nodes>cap){capped=true;return}
   if(!remaining.length){const sig=String(m);sol.set(sig,m);if(sol.size>=maxSolutions)solutionCap=true;return}
   let best=-1,bn=Infinity;
   for(const j of remaining){let n=0;for(const v of sets[j])n+=pc(v);if(n<bn){best=j;bn=n}if(!n)return}
   const next=remaining.filter(j=>j!==best),Q=sets[best];
   for(let w=0;w<Q.length;w++){let bits=Q[w];while(bits){const v=bits&-bits;bits^=v;const i=(w<<5)+31-Math.clz32(v),a=indexes[best].V[i],z=m.slice(),delta=[];
    for(let x=0;x<29;x++)if(a[x]>=0&&z[x]<0){z[x]=a[x];delta.push([x,a[x]])}
    const S=sets.slice();let good=true;for(const j of next){const B=S[j].slice();for(const [x,y] of delta)filter(j,B,x,y);S[j]=B;if(!B.some(v=>v)){good=false;break}}
    if(good)dfs(z,next,S);if(capped||solutionCap)return;
   }}
  }
  dfs(Array(29).fill(-1),ds.map((_,i)=>i),indexes.map(a=>a.base));
  return {nodes,capped,solutionCap,maps:[...sol.values()]};
 }
 const cleanG=donor(gib.slice(gib.indexOf("Almustafa, the{7} chosen"),gib.indexOf("End of the Project Gutenberg EBook of The Prophet")));
 const controls=[];
 for(const [src,start] of [[cleanG,100],[s,Math.floor(s.length*.84)],[cleanG,1800]]){
  const P=src.slice(start,start+1401).filter(w=>w.length<=14),f=shuffle(Array.from({length:29},(_,i)=>i)),pool=[P[0]];
  for(let i=1;i<P.length;i++)pool.push(emit(P[i],pool[i-1],f,i%3===1,i%2===0));
  const anchors=pool.map((c,i)=>({c,i})).filter(a=>a.i&&a.c.length>=10),D=domains(pool,anchors);
  assert(D.every(d=>d.maps.some(m=>m.every((v,x)=>v<0||v===f[x]))),"true partial map absent");
  const fit=D.filter(d=>d.i%4!==0),test=D.filter(d=>d.i%4===0);
  const r=completeFit(fit);const unique=new Map();
  for(const m0 of r.maps){const m=m0.slice(),missing=m.flatMap((v,i)=>v<0?[i]:[]),unused=Array.from({length:29},(_,i)=>i).filter(v=>!m.includes(v));if(missing.length===1)m[missing[0]]=unused[0];unique.set(String(m),m)}
  const maps=[...unique.values()],m=maps[0]||Array(29).fill(-1);
  const held=test.map(d=>({i:d.i,compatible:maps.some(m=>d.maps.some(a=>matches(m,a))),decoded:[...new Set(maps.flatMap(m=>candidates(pool[d.i],pool,m)))]}));
  controls.push({start,words:P.length,anchors:D.length,fit:fit.length,held:test.length,domains:fit.reduce((n,d)=>n+d.maps.length,0),nodes:r.nodes,capped:r.capped,solutionCap:r.solutionCap,maps:maps.length,truthCompatible:maps.some(m=>m.every((v,i)=>v<0||v===f[i])),firstAssigned:m.filter(v=>v>=0).length,firstCorrect:m.filter((v,i)=>v>=0&&v===f[i]).length,exactFullMaps:maps.filter(m=>String(m)===String(f)).length,heldCompatible:held.filter(h=>h.compatible).length,heldTrueDecoded:held.filter(h=>h.decoded.includes(code(P[h.i]))).length,heldUniqueCorrect:held.filter(h=>h.decoded.length===1&&h.decoded[0]===code(P[h.i])).length,truth:f,mapsList:maps});
 }
 return {vocabulary,controls};
}

const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
