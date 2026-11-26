"use strict";
// Exact population obstruction for phase-marginalized GP29 q8 moments.
function run(raw,profile,native){
 const N=29,Q=8,S="0123456789abcdefghijklmnopqrs";
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const keys=[
  {id:"binary_all_pair_lags",a:[1,1,2,1,2,2,2,1],b:[1,1,1,2,2,2,1,2]},
  {id:"ternary_generator_fixed_coordinates",a:[1,0,0,0,2,0,0,1],b:[1,1,0,0,2,0,0,0]}
 ];
 const hist=xs=>xs.map(x=>JSON.stringify(x)).sort().join("|");
 const shiftHist=(k,offsets)=>hist(k.map((_,j)=>offsets.map(d=>k[(j+d)%Q])));
 const identity=Array.from({length:N},(_,i)=>i);
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 const primitive=k=>![1,2,4].some(d=>k.every((x,i)=>x===k[(i+d)%Q]));
 const gaugeEqual=(a,b)=>Array.from({length:Q},(_,r)=>r).some(r=>Array.from({length:N-1},(_,i)=>i+1).some(m=>a.every((x,i)=>x===(b[(i+r)%Q]*m)%N)));
 const enc=(w,pi,k,j)=>{let out=[];const ip=[];pi.forEach((v,i)=>ip[v]=i);for(const p of w){if(p===0)out.push(0);else{out.push(ip[(pi[p]+k[j])%N]);j=(j+1)%Q}}return out};
 const emission=(w,pi,k,positions)=>hist(Array.from({length:Q},(_,j)=>{const c=enc(w,pi,k,j);return positions.map(i=>c[i])}));
 const eq=(w,pi,pair,positions)=>emission(w,pi,pair.a,positions)===emission(w,pi,pair.b,positions);
 for(const pair of keys){
  assert(primitive(pair.a)&&primitive(pair.b)&&!gaugeEqual(pair.a,pair.b),"action/gauge");
  pair.lagEqual=Array.from({length:8},(_,d)=>shiftHist(pair.a,[0,d])===shiftHist(pair.b,[0,d]));
  assert(shiftHist(pair.a,[0,1,2])===shiftHist(pair.b,[0,1,2]),"three phase");
  pair.tripleShiftHist=shiftHist(pair.a,[0,1,2]).split("|").map(JSON.parse);
  pair.nonlocalTripleDifferent=shiftHist(pair.a,[0,1,3])!==shiftHist(pair.b,[0,1,3]);
  pair.fourWitness={plaintext:[1,1,1,1],a:emission([1,1,1,1],identity,pair.a,[0,1,2,3]),b:emission([1,1,1,1],identity,pair.b,[0,1,2,3])};
  assert(pair.fourWitness.a!==pair.fourWitness.b,"four witness");
  let triples=0;const byF=[0,0,0,0];const pi=identity.map(x=>x*7%N);
  for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){
   assert(eq([a,b,c],pi,pair,[0,1,2]),"conditional triple");
   triples++;byF[+(a===0)+ +(b===0)+ +(c===0)]++;
  }
  pair.exhaustivePlainTriples=triples;pair.triplesByNumberOfF=byF;
 }
 assert(keys[0].lagEqual.every(Boolean),"all pairwise lags");
 assert(keys[1].a[0]===1&&keys[1].b[0]===1&&keys[1].a[3]===0&&keys[1].b[3]===0&&keys[1].a[4]===2&&keys[1].b[4]===2,"generator fixed values");
 // Reproduce exact plaintext generation prefix of the existing matched-profile generator.
 const A="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
 const spell=new Map(A.map((x,i)=>[x,S[i]]));spell.set("ING",S[21]);
 const dict=new Set();
 for(const line of raw.split(/\r?\n/)){const m=/^([a-z]+)\s+([0-9]+)$/.exec(line.trim());if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const walk=(i,w)=>{if(i===s.length){dict.add(w);return}for(let n=1;n<=3&&i+n<=s.length;n++){const a=spell.get(s.slice(i,i+n));if(a!==undefined)walk(i+n,w+a)}};walk(0,"")}
 assert(dict.size===38910,"register");
 const by=Array.from({length:60},()=>[]);for(const w of dict)by[w.length].push(w);for(const w of by)w.sort();
 const prefix=new Set(by[11].map(w=>w.slice(0,10)));
 const lengths=profile.p54.body_groups.slice(0,47).map(w=>w.length);
 assert(lengths.length===47&&lengths.reduce((a,b)=>a+b,0)===213,"profile");
 const decode=w=>Array.from(w,x=>S.indexOf(x));
 function plant(seed){
  let state=seed;const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
  const order=lengths.map((_,i)=>i).sort((a,b)=>lengths[b]-lengths[a]||a-b);
  const truth=lengths.map(n=>by[n][rand(by[n].length)]);
  const randomWord=len=>Array.from({length:len},()=>S[rand(N)]).join("");
  const om=[order[0],order[order.length-8]];
  for(const i of om){do{truth[i]=randomWord(lengths[i])}while(dict.has(truth[i]))}
  let carry;do{carry=randomWord(11)}while(prefix.has(carry.slice(0,10))||dict.has(carry));
  const held=profile.p55.groups.slice(1).map(w=>by[w.length][rand(by[w.length].length)]);
  const pi=identity.slice();for(let i=N-1;i>1;i--){const j=1+rand(i);[pi[i],pi[j]]=[pi[j],pi[i]]}
  const generatedKey=Array.from({length:Q},()=>rand(N));generatedKey[0]=1;generatedKey[4]=2;generatedKey[3]=0;
  return {seed,om,carryPrefix:carry.slice(0,10),pi,generatedKey,truth:truth.map(decode),held:[carry,...held].map(decode)};
 }
 function compare(words,pi,pair){
  const counts={words:words.length,runes:words.reduce((a,w)=>a+w.length,0),single:0,pair:0,pairDiff:0,localPair:0,localPairDiff:0,triple:0,tripleDiff:0,four:0,fourDiff:0,fullWordDiff:0,heldF:0};
  for(const w of words){
   counts.heldF+=w.filter(x=>x===0).length;
   const A=Array.from({length:Q},(_,j)=>enc(w,pi,pair.a,j)),B=Array.from({length:Q},(_,j)=>enc(w,pi,pair.b,j));
   const same=pos=>hist(A.map(c=>pos.map(i=>c[i])))===hist(B.map(c=>pos.map(i=>c[i])));
   for(let i=0;i<w.length;i++){
    counts.single++;assert(same([i]),"single");
    for(let j=i+1;j<w.length;j++){counts.pair++;const diff=!same([i,j]);counts.pairDiff+=+diff;if(j-i<=2){counts.localPair++;counts.localPairDiff+=+diff}}
    if(i+2<w.length){counts.triple++;counts.tripleDiff+=+!same([i,i+1,i+2])}
    if(i+3<w.length){counts.four++;counts.fourDiff+=+!same([i,i+1,i+2,i+3])}
   }
   counts.fullWordDiff+=+!same(w.map((_,i)=>i));
  }
  assert(!counts.tripleDiff&&!counts.localPairDiff,"local moment collision");
  if(pair.id==="binary_all_pair_lags")assert(!counts.pairDiff,"all pair collision");
  return counts;
 }
 const plants=[0x59d2a638,0x59d2a639].map(seed=>{const p=plant(seed);return {seed:p.seed,truthOov:p.om,carryPrefix:p.carryPrefix,generatedKey:p.generatedKey,pi:p.pi,results:keys.map(k=>({id:k.id,fit:compare(p.truth,p.pi,k),hold:compare(p.held,p.pi,k)}))}});
 assert(plants[0].carryPrefix==="15ifrg6kil","pinned plant reproduction");
 const nativeWords=native.sections.map(z=>({name:z.name,words:(z.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,x=>native.runes.indexOf(x)))}));
 assert(nativeWords.every(z=>z.words.every(w=>w.every(x=>x>=0))),"native alphabet");
 const nativeReports=nativeWords.map(z=>({name:z.name,results:keys.map(k=>({id:k.id,...compare(z.words,identity.map(x=>x*11%N),k)}))}));
 return {schema:"q8-phase-moment-nonidentifiability-v1",mode:"exact population phase enumeration; no original ciphertext fit",keys,register:dict.size,plants,nativeReports};
}
if(require.main===module){const fs=require("node:fs");const raw=fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8");const profile=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"));const native=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));console.log(JSON.stringify(run(raw,profile,native),null,2));}
module.exports={run};
