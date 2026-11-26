"use strict";
// Exact finite inverse of a conventional rubric-keyed input OR output alphabet.
// C = B^-1(A(P)+k_j mod29) for P != F; literal F emits F, holds phase.
// Phase starts are independent per word. Any four lexical anchors with >=8
// nonzero ciphertext runes cover every action supporting >=44 of 47 groups.
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt"];
const S="0123456789abcdefghijklmnopqrs",Q=29,N=8,BUDGET=3;
const r29=Array.from({length:29},(_,i)=>i);
const mod=x=>(x+29)%29;
const parse=s=>Array.from(s,c=>S.indexOf(c));
const str=a=>a.map(i=>S[i]).join("");
const inv=a=>{const b=[];a.forEach((v,i)=>b[v]=i);return b;};
function canonical(k){return Array.from({length:8},(_,i)=>str(k.slice(i).concat(k.slice(0,i)))).sort()[0];}
const primitive=k=>[1,2,4].every(d=>k.some((v,i)=>v!==k[i%d]));
function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n;};}
function lexicon(raw){
 const labels="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
 const D=new Set();
 for(const l of raw.split(/\r?\n/)){
  const m=l.match(/^([a-z]+)\s+([0-9]+)$/);if(!m)continue;
  const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,w){if(i===s.length){D.add(w);return;}for(let j=0;j<29;j++)if(s.startsWith(labels[j],i))go(i+labels[j].length,w+S[j]);if(s.startsWith("ING",i))go(i+3,w+S[21]);}
  go(0,"");
 }
 if(D.size!==38910)throw Error("Unexpected lexicon: "+D.size);
 const by=Array.from({length:30},()=>[]);for(const w of D)by[w.length].push(w);by.forEach(a=>a.sort());
 return {D,by,pa:by.map(a=>a.map(parse))};
}
function models(profile){
 const red=parse(profile.p54.heading_groups[1]),initial=parse(profile.p54.heading_groups[0]);
 return [red,initial.concat(red)].flatMap((p,i)=>{
  const order=[...new Set(p.concat(r29))],mixed=inv(order);
  return [{name:i?"red9-input":"red8-input",A:mixed,B:r29.slice()},{name:i?"red9-output":"red8-output",A:r29.slice(),B:mixed}];
 }).map(m=>({...m,AI:inv(m.A),BI:inv(m.B)}));
}
function encode(p,m,k,j){
 const c=[];for(const x of p){if(!x)c.push(0);else {c.push(m.BI[mod(m.A[x]+k[j])]);j=(j+1)%8;}}
 return c;
}
function decTables(m,k){return k.map(v=>r29.map(c=>m.AI[mod(m.B[c]-v)]));}
function candidates(c,dec,D,all=false){
 const found=new Map();let legal=null;
 function go(i,j,w,start){
  if(i===c.length){
   if(!legal)legal={w,start};
   if(D.has(w)&&!found.has(w))found.set(w,start);
   return !all&&found.size>0;
  }
  const x=c[i];
  if(x===0&&go(i+1,j,w+"0",start))return true;
  const p=dec[j][x];
  return p!==0&&go(i+1,(j+1)%8,w+S[p],start);
 }
 for(let j=0;j<8;j++)if(go(0,j,"",j)&&!all)break;
 return {legal,found};
}
function anchorSeeds(c,m,lex){
 const K=new Set();
 for(const p of lex.pa[c.length]){
  const k=Array(8).fill(-1);let j=0,ok=true;
  for(let i=0;i<p.length;i++){
   if(!p[i]){if(c[i]){ok=false;break;}continue;}
   const d=mod(m.B[c[i]]-m.A[p[i]]);
   if(k[j]>=0&&k[j]!==d){ok=false;break;}
   k[j]=d;j=(j+1)%8;
  }
  if(ok){
   if(k.includes(-1))throw Error("Anchor underdetermined");
   if(primitive(k))K.add(canonical(k));
  }
 }
 return K;
}
function solve(C,m,lex){
 // Anchor choice depends only on training ciphertext and the frozen q/budget.
 const elig=C.map((c,i)=>({i,n:c.filter(v=>v!==0).length,l:c.length})).filter(x=>x.n>=8).sort((a,b)=>b.n-a.n||b.l-a.l||a.i-b.i);
 if(elig.length<BUDGET+1)return {status:"insufficient full-vector anchors",eligible:elig};
 const anchors=elig.slice(0,BUDGET+1).map(x=>x.i);
 const K=new Set(),seedCounts=[];
 for(const i of anchors){const ks=anchorSeeds(C[i],m,lex);seedCounts.push(ks.size);for(const k of ks)K.add(k);}
 // The union covers all >=44/47-support primitive keys because <=3 groups
 // may be omitted. Any qualifying key has a legal lexical path in one
 // selected anchor, and that path consumes >=8 runes.
 const evalOrder=C.map((c,i)=>i).sort((a,b)=>C[b].length-C[a].length||a-b);
 const qualifies=[];let tested=0,legalAll=0,best=-1,bestK=null,bestCount=0;
 const hist=Array(C.length+1).fill(0);
 for(const key of K){
  const k=parse(key),dec=decTables(m,k);let support=0,legal=true;
  for(const i of evalOrder){const z=candidates(C[i],dec,lex.D,false);if(!z.legal){legal=false;break;}if(z.found.size) support++;}
  tested++;
  if(!legal)continue;
  legalAll++;hist[support]++;
  if(support>best){best=support;bestK=key;bestCount=1;}else if(support===best)bestCount++;
  if(support>=C.length-BUDGET){
   const rows=C.map(c=>{
    const z=candidates(c,dec,lex.D,true);const w=z.found.size?Array.from(z.found,([w,start])=>({w,start})): [z.legal];
    for(const v of w)if(str(encode(parse(v.w),m,k,v.start))!==str(c))throw Error("Replay");
    return {inLex:z.found.size>0,paths:w};
   });
   qualifies.push({key,support,train:rows});
  }
 }
 return {status:"complete",anchors,eligible:elig,seedCounts,uniqueSeeds:K.size,tested,legalAll,bestSeedSupport:best,bestSeedKey:bestK,bestSeedCount:bestCount,globalSupportUpperBound:Math.max(C.length-anchors.length,best),hist,qualifies};
}
function hold(C,m,key,D){
 const k=parse(key),dec=decTables(m,k);
 return C.map(c=>{
  const z=candidates(c,dec,D,true),paths=Array.from(z.found,([w,start])=>({w,start}));
  for(const v of paths)if(str(encode(parse(v.w),m,k,v.start))!==str(c))throw Error("Held replay");
  return {legal:z.legal!==null,paths};
 });
}
function matchedPlant(profile,m,lex,seed){
 const trainLengths=profile.p54.body_groups.slice(0,47).map(w=>w.length);
 const holdLengths=[11,...profile.p55.groups.slice(1).map(w=>w.length)];
 const rnd=rng(seed),targetZero=profile.p54.body_groups.slice(0,47).join("").split("0").length-1;
 const targetRepeat=[...profile.p54.body_groups.slice(0,47).join("")].slice(1).filter((x,i)=>x===profile.p54.body_groups.slice(0,47).join("")[i]).length;
 const sample=n=>lex.by[n][rnd(lex.by[n].length)];
 function randomOOV(n){let w;do{w=Array.from({length:n},()=>S[rnd(29)]).join("");}while(lex.D.has(w));return w;}
 // Train on exactly the original complete-group size profile, two OOV groups,
 // including a length-ten anchor. The full carry is withheld.
 for(let tries=1;tries<=250000;tries++){
  const k=Array.from({length:8},()=>rnd(29));if(!primitive(k))continue;
  const P=trainLengths.map(sample);P[45]=randomOOV(10);P[43]=randomOOV(trainLengths[43]);
  const phases=P.map(()=>rnd(8)),C=P.map((w,i)=>encode(parse(w),m,k,phases[i]));
  const z=C.flat();
  if(z.filter(x=>x===0).length!==targetZero)continue;
  if(z.slice(1).filter((x,i)=>x===z[i]).length!==targetRepeat)continue;
  const eligible=C.filter(c=>c.filter(x=>x!==0).length>=8).length;if(eligible<4)continue;
  const H=holdLengths.map(sample),hp=H.map(()=>rnd(8)),HC=H.map((w,i)=>encode(parse(w),m,k,hp[i]));
  return {tries,P,C,H,HC,key:canonical(k),k,phases,hp,targetZero,targetRepeat,eligible};
 }
 throw Error("Matched plant generation exhausted");
}
function experiment(raw,stage){
 const corpus=JSON.parse(raw[0]),profile=JSON.parse(raw[1]),lex=lexicon(raw[2]),ms=models(profile);
 const train=profile.p54.body_groups.slice(0,47).map(parse);
 const held=[profile.p54.body_groups[47]+profile.p55.groups[0],...profile.p55.groups.slice(1)].map(parse);
 if(train.length!==47||train.flat().length!==213||held.length!==17||held.flat().length!==86||str(train.flat().concat(held.flat()))!==str(corpus.pages[54].indices.slice(9).concat(corpus.pages[55].indices)))throw Error("Source geometry");
 if(stage==="control"){
  return {stage,lexicon:lex.D.size,rows:ms.map((m,i)=>{
   const z=matchedPlant(profile,m,lex,0x54ab2100+i);
   // Only training C and known alphabet family go to exact inverse.
   const out=solve(z.C,m,lex);
   const truth=out.qualifies.find(v=>v.key===z.key);
   const held=truth?hold(z.HC,m,truth.key,lex.D):[];
   const pass=!!truth&&out.qualifies.length===1&&held.every((r,j)=>r.paths.some(v=>v.w===z.H[j]));
   return {model:m,seed:0x54ab2100+i,plant:{...z,C:z.C.map(str),HC:z.HC.map(str)},out,held,pass};
  })};
 }
 if(stage==="original"){
  // Freeze all candidates from all models before evaluating the held carry/p55.
  const rows=ms.map(m=>({model:m,out:solve(train,m,lex)}));
  return {stage,lexicon:lex.D.size,rows:rows.map(r=>({...r,held:r.out.qualifies.map(q=>({key:q.key,words:hold(held,r.model,q.key,lex.D)}))}))};
 }
 throw Error("stage control or original");
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv[2]),null,2));
module.exports={experiment,paths};
