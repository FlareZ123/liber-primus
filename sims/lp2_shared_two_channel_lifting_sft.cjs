'use strict';
/** Shared two-channel cross-pair lifting, Director #2470. Node22 read-only. */
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw){
  const corpus=JSON.parse(raw[0]), solved=JSON.parse(raw[2]), rune=corpus.runes, mod=x=>((x%29)+29)%29;
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
  function nativeWords(t){return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));check(t,"unmapped "+w);a.push(t.i);i+=t.s.length}}return a})}
  function parse(t){return t.split(new RegExp("[^"+rune.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(c=>rune.indexOf(c)))}
  const orig=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const words=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\n\r]/g,""));
  check(orig.length===12956,"original length");
  check(words.flat().join(",")===orig.join(","),"transcription vs corpus alignment");
  const native=solved.sections.map(s=>({name:s.name,words:parse(s.source_text)}));
  const controls=[nativeWords(raw[3]),nativeWords(raw[4])];
  const sig=w=>String.fromCharCode(...w);
  const lex=(sets)=>new Set(sets.flat().map(sig));
  function spans(ws){let at=0;return ws.map(w=>{const s=[at,at+w.length];at=s[1];return s})}
  function enc(p,a,b){let out=[],y=0;for(let i=0;i<p.length;i+=2){let u=p[i],x=mod(u+a*y);out.push(x);if(i+1<p.length){y=mod(p[i+1]+b*u);out.push(y)}}return out}
  function dec(c,a,b){let out=[],y=0;for(let i=0;i<c.length;i+=2){let u=mod(c[i]-a*y);out.push(u);if(i+1<c.length){y=c[i+1];out.push(mod(y-b*u))}}return out}
  function score(p,ss,d,lo,hi){let hit=0,total=0,matched=0,n=0;for(const [s,e] of ss){if(s<lo||e>hi||e-s<3)continue;n++;total+=e-s;if(d.has(sig(p.slice(s,e)))){hit+=e-s;matched++}}return {hit,total,matched,n,coverage:hit/total}}
  function recover(c,ss,d,cut){let best=null,ties=0;for(let a=0;a<29;a++)for(let b=0;b<29;b++){const p=dec(c.slice(0,cut),a,b);const sc=score(p,ss,d,0,cut);if(!best||sc.hit>best.hit){best={a,b,...sc};ties=1}else if(sc.hit===best.hit)ties++}return {...best,ties}}
  const plants=[];for(let i=0;i<native.length;i++){const s=native[i],p=s.words.flat(),cut=Math.floor(p.length/2);if(p.length<300)continue;const d=lex([...controls,...native.filter((_,j)=>i!==j).map(v=>v.words)]),ss=spans(s.words);for(const [a,b] of [[7,19],[23,4]]){const c=enc(p,a,b),k=recover(c,ss,d,cut),q=dec(c,k.a,k.b);plants.push({name:s.name,n:p.length,cut,planted:[a,b],recovered:[k.a,k.b],ties:k.ties,train:k.coverage,holdout:score(q,ss,d,cut,p.length).coverage,exact:q.filter((x,j)=>x===p[j]).length});check(enc(q,k.a,k.b).join(",")===c.join(","),"plant replay")}}
  const d=lex([...controls,...native.map(s=>s.words)]), ss=spans(words);
  const key=recover(orig,ss,d,729),p=dec(orig,key.a,key.b);
  check(enc(p,key.a,key.b).join(",")===orig.join(","),"original replay");
  const holdout=score(p,ss,d,7960,9640);
  function pairQ(x){let f=new Uint32Array(841);for(let i=0;i+1<x.length;i+=2)f[29*x[i]+x[i+1]]++;return f.reduce((s,n)=>s+n*(n-1)/2,0)}
  function shear(c,a,prev){const out=[];for(let i=0;i<c.length;i+=2){out.push(mod(c[i]-a*prev),c[i+1]);prev=c[i+1]}return out}
  const chapter=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
  check(chapter.length===1680&&chapter.join(",")===orig.slice(7960,9640).join(","),"chapter alignment");
  const census=Array.from({length:29},(_,a)=>({a,Q:pairQ(shear(chapter,a,orig[7959])),resetQ:pairQ(shear(chapter,a,0))}));
  const windows=controls.map((w,i)=>{const p=w.flat();let min=Infinity,max=0,n=0;for(let j=0;j+1680<=p.length;j+=211){const q=pairQ(p.slice(j,j+1680));min=Math.min(min,q);max=Math.max(max,q);n++}return {source:["Gibran","Shakespeare"][i],n,min,max}});
  const broadPlants=controls.map((w,i)=>{const p=w.flat().slice(0,1680),a=17,b=11,c=enc(p,a,b),q=dec(c,a,b);check(q.join(",")===p.join(","),"broad plant");return {source:windows[i].source,plainQ:pairQ(p),correctShearQ:pairQ(shear(c,a,0)),cipherQ:pairQ(c),exact:q.length}});
  return {orig:orig.length,wordCount:words.length,lexicon:d.size,plants,key,holdout,preview:p.slice(0,100).map(x=>corpus.translit[x]).join(" "),census,windows,broadPlants}
}
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));

// Generalized arbitrary nonlinear context shifts and arbitrary static pair permutation.
function generalized(corpus,raw){
  const check=(ok,msg)=>{if(!ok)throw Error(msg)}, mod=x=>((x%29)+29)%29;
  const orig=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices), chapter=orig.slice(7960,9640);
  check(chapter.length===1680,"chapter length");
  function pairQ(x){const f=new Uint32Array(841);for(let i=0;i+1<x.length;i+=2)f[29*x[i]+x[i+1]]++;return f.reduce((s,n)=>s+n*(n-1)/2,0)}
  // Histograms keyed by the preceding ciphertext y. Independent shifts of
  // each context can only change cross-context collisions by a relative shift.
  function bound(ch,prev){const H=Array.from({length:29},()=>new Uint32Array(841));for(let i=0;i<ch.length;i+=2){H[prev][ch[i]*29+ch[i+1]]++;prev=ch[i+1]}let within=0,cross=0;for(let a=0;a<29;a++){for(const n of H[a])within+=n*(n-1)/2;for(let b=a+1;b<29;b++){const m=Array(29).fill(0);for(let d=0;d<29;d++)for(let x=0;x<29;x++)for(let y=0;y<29;y++)m[d]+=H[a][29*x+y]*H[b][29*((x+d)%29)+y];cross+=Math.max(...m)}}return {within,cross,upper:within+cross}}
  const allIV=Array.from({length:29},(_,iv)=>({iv,...bound(chapter,iv)}));
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
  function nativeGP(t){const out=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const z=tokens.find(z=>w.startsWith(z.s,i));check(z,"unmapped "+w);out.push(z.i);i+=z.s.length}}}return out}
  // Deterministic nonlinear table and independently shuffled pair codebook.
  let seed=0x33012470;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
  const f=Array.from({length:29},()=>next()%29);
  const pi=Array.from({length:841},(_,i)=>i);
  for(let i=840;i>0;i--){const j=next()%(i+1);[pi[i],pi[j]]=[pi[j],pi[i]]}
  const inv=Array(841);pi.forEach((v,i)=>inv[v]=i);
  const plants=raw.map((t,j)=>{const p=nativeGP(t).slice(0,1680),iv=17,c=[],mid=[],rec=[];let prev=iv;
    for(let i=0;i<p.length;i+=2){const z=pi[p[i]*29+p[i+1]],u=Math.floor(z/29),y=z%29;c.push(mod(u+f[prev]),y);prev=y}
    prev=iv;for(let i=0;i<c.length;i+=2){const u=mod(c[i]-f[prev]),y=c[i+1],z=inv[u*29+y];mid.push(u,y);rec.push(Math.floor(z/29),z%29);prev=y}
    check(rec.join(",")===p.join(","),"generalized plant inverse");check(pairQ(mid)===pairQ(p),"stationary pair bijection invariant");
    const b=bound(c,iv);check(b.upper>=pairQ(p),"upper bound must admit planted control");
    return {source:["Gibran","Shakespeare"][j],plaintextQ:pairQ(p),ciphertextQ:pairQ(c),shearQ:pairQ(mid),...b,recovered:rec.length};
  });
  return {allIV,originalIV:orig[7959],maximum:Math.max(...allIV.map(x=>x.upper)),plants}
}
console.log(JSON.stringify(generalized(JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',files[0]),'utf8')),files.slice(3).map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
