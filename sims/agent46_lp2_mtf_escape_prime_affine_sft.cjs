"use strict";
/*
 * Director #3208: plaintext move-to-front rank -> explicit repeat escape
 * -> nonrepeat affine rank -> prime-minus-one differential sender.
 * Historical MTF (bzip2) and prime clock are independent operations, not
 * evidence this composition or escape rank is authored.
 *
 * node sims/agent46_lp2_mtf_escape_prime_affine_sft.cjs [source|control0|control1|control2|negative|all]
 */
const Q=29,M=28,E=23,N=12956,T=9640,H=N-T,ORIGINS=3302;
const check=(v,s)=>{if(!v)throw Error(s)};
const mod=(x,m)=>((x%m)+m)%m;
const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const units=[1,3,5,9,11,13,15,17,19,23,25,27];
const canonical=()=>Array.from({length:Q},(_,i)=>i);
function encode(corpus,text){
 const terms=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),out=[];
 for(const raw of text.toUpperCase().match(/[A-Z]+/g)||[]){
  const w=raw.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let i=0;i<w.length;){
   if(w.startsWith("ING",i)){out.push(21);i+=3;continue}
   if(w.startsWith("IO",i)){out.push(27);i+=2;continue}
   const z=terms.find(x=>w.startsWith(x.s,i));check(z,"native token "+w);
   out.push(z.i);i+=z.s.length;
  }
 }return out;
}
function mtf(p,init=canonical()){
 const a=init.slice(),rank=[],prev=[],last=Array(Q).fill(-1);
 for(let i=0;i<p.length;i++){
  const x=p[i],j=a.indexOf(x);check(j>=0,"MTF symbol");
  rank.push(j);prev.push(last[x]);last[x]=i;
  a.splice(j,1);a.unshift(x);
 }return {rank,prev};
}
function unmtf(rank,init=canonical()){
 const a=init.slice(),p=[];
 for(const j of rank){check(j>=0&&j<Q,"MTF rank");const x=a[j];p.push(x);a.splice(j,1);a.unshift(x)}
 return p;
}
function primes(n){
 let a=[];for(let x=2;a.length<n;x++){
  let ok=true;for(const p of a){if(p*p>x)break;if(x%p===0){ok=false;break}}
  if(ok)a.push(x);
 }return a;
}
const PRIME=primes(ORIGINS+N).map(x=>(x-1)%M);
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
function sender(p,key,pad=null,init=canonical(),escape=E){
 const {rank}=mtf(p,init),c=[];let t=key.origin,previous=0;
 for(const r of rank){
  if(r===escape){c.push(previous);continue}
  const u=r-Number(r>escape);
  const d=1+mod(key.a*u+key.b+(pad?pad():PRIME[t]),M);t++;
  previous=(previous+d)%Q;c.push(previous);
 }return c;
}
function steps(c){
 let prev=0;const delta=[],nonzero=[],events=[];
 for(let i=0;i<c.length;i++){const d=mod(c[i]-prev,Q);delta.push(d);prev=c[i];if(d===0)events.push(i);else nonzero.push(d-1)}
 return {delta,nonzero,events};
}
function decoder(c,key,init=canonical(),escape=E){
 const {delta}=steps(c),rank=[];let t=key.origin;
 const inv=units.find(a=>(a*key.a)%M===1);check(inv!==undefined,"affine unit");
 for(const d of delta){
  if(d===0){rank.push(escape);continue}
  const u=mod(inv*(d-1-key.b-PRIME[t++]),M);rank.push(u+Number(u>=escape));
 }return {rank,p:unmtf(rank,init)};
}
function repeatProfile(c,split=T){
 const e=steps(c).events;return [e.filter(i=>i<split).length,e.filter(i=>i>=split).length];
}
function histogram(a,n=Q){const h=Array(n).fill(0);for(const x of a)h[x]++;return h}
function top(h,k){return [...h].sort((a,b)=>b-a).slice(0,k).reduce((a,b)=>a+b,0)}
function ioc(p){return histogram(p).reduce((a,b)=>a+b*(b-1),0)/(p.length*(p.length-1))}
function profile(p){const {rank}=mtf(p);return [rank.slice(0,T).filter(x=>x===E).length,rank.slice(T).filter(x=>x===E).length]}
/** Exact matched count scan: global ranks unchanged except first occurrences. */
function findMatched(p,start){
 const {rank}=mtf(p),pos=Array.from({length:Q},()=>[]),ptr=Array(Q).fill(0),prefix=[0];
 for(let i=0;i<p.length;i++){pos[p[i]].push(i);prefix.push(prefix.at(-1)+Number(rank[i]===E))}
 for(let s=0;s+N<=p.length;s++){
  if(s>=start){
   let a=prefix[s+T]-prefix[s],b=prefix[s+N]-prefix[s+T];
   if(Math.abs(a-65)+Math.abs(b-21)<=Q){
    const first=pos.map((v,x)=>[v[ptr[x]]??Infinity,x]).sort((u,v)=>u[0]-v[0]);
    let seen=0,mask=0;
    for(const [i,x] of first){if(i>=s+N)break;let j=seen;for(let y=0;y<x;y++)if(!(mask&(1<<y)))j++;
     const d=Number(j===E)-Number(rank[i]===E);if(i<s+T)a+=d;else b+=d;
     seen++;mask|=1<<x;
    }
    if(a===65&&b===21){const plain=p.slice(s,s+N);check(equal(profile(plain),[65,21]),"exact repeat count");return {offset:s,plain}}
   }
  }
  ptr[p[s]]++;
 }throw Error("no native matched window");
}
/** A known plaintext repeat mask gives a rank label iff all forced events agree.
 * For arbitrary initial permutation, the first occurrence of each label is
 * free in this necessary relaxation. Every later rank is fixed.
 */
function maskGate(c,donors){
 const events=steps(c).events,eventSet=new Set(events),n=c.length;
 check(events.length>Q,"event lower bound");
 const result=[];
 for(const p of donors){
  const {rank,prev}=mtf(p),positions=Array.from({length:Q},()=>[]);
  rank.forEach((x,i)=>positions[x].push(i));
  const bound=(a,x)=>{let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>>1;if(a[m]<x)lo=m+1;else hi=m}return lo};
  let compatible=0,forcedEventConsistent=0,firstConflicts=0,examples=[];
  for(let s=0;s+n<=p.length;s++){
   let e=-1,good=true;
   for(const off of events){
    const i=s+off;if(prev[i]<s)continue;
    if(e===-1)e=rank[i];else if(e!==rank[i]){good=false;break}
   }
   if(!good){firstConflicts++;continue}
   check(e!==-1,"more repeat events than first occurrences");
   forcedEventConsistent++;
   const a=positions[e];
   for(let j=bound(a,s);j<a.length&&a[j]<s+n;j++){const i=a[j];if(prev[i]>=s&&!eventSet.has(i-s)){good=false;break}}
   if(good){compatible++;if(examples.length<20)examples.push({offset:s,escape:e})}
  }
  result.push({windows:p.length-n+1,forcedEventConsistent,compatible,firstConflicts,examples});
 }return result;
}
/** Finite donor concentration floors, valid for any initial MTF ordering.
 * A different initial list changes only each label's first occurrence.
 */
function floorForWindow(p,n){
 const {rank}=mtf(p),h=histogram(rank.slice(0,n));let min5=Infinity,min10=Infinity,at5=-1,at10=-1;
 for(let s=0;s+n<=rank.length;s++){
  const sorted=[...h].sort((a,b)=>b-a),x=sorted.slice(0,5).reduce((a,b)=>a+b,0),y=sorted.slice(0,10).reduce((a,b)=>a+b,0);
  if(x<min5){min5=x;at5=s}if(y<min10){min10=y;at10=s}
  if(s+n<rank.length){h[rank[s]]--;h[rank[s+n]]++}
 }
 return {windows:p.length-n+1,min5,min10,at5,at10,anyInit5:min5-Q,anyInit10:min10-Q};
}
function build(corpus,texts){
 const source=corpus.pages.slice(0,56).flatMap(p=>p.indices);
 check(source.length===N&&equal(repeatProfile(source),[65,21]),"original geometry");
 const donors=texts.map(x=>encode(corpus,x)),train=donors[0].slice(0,10000);
 const rankHist=histogram(mtf(train).rank),rankLog=rankHist.map(x=>Math.log((x+0.5)/(train.length+0.5*Q)));
 const counts=new Float64Array(Q*Q);for(let i=1;i<train.length;i++)counts[train[i-1]*Q+train[i]]++;
 const lm=new Float64Array(Q*Q);
 for(let a=0;a<Q;a++){let sum=0;for(let b=0;b<Q;b++)sum+=counts[a*Q+b];for(let b=0;b<Q;b++)lm[a*Q+b]=Math.log((counts[a*Q+b]+0.5)/(sum+0.5*Q))}
 const p57=corpus.pages[57].indices,k={a:9,b:2,origin:63},c57=sender(p57,k);
 check(p57.length===95&&equal(decoder(c57,k).p,p57),"native p57 roundtrip");
 return {source,donors,rankLog,lm,alphabet:corpus.translit};
}
function score(p,lm,start=1,end=p.length){let s=0;for(let i=Math.max(1,start);i<end;i++)s+=lm[p[i-1]*Q+p[i]];return s/(end-Math.max(1,start))}
function rankScore(p,rankLog,start,end){let s=0;for(let i=start;i<end;i++)s+=rankLog[p[i]];return s/(end-start)}
function keyFamily(rankLog){
 const fam=[];
 for(const a of units)for(let b=0;b<M;b++){
  const w=new Float64Array(M),map=new Uint8Array(M);
  for(let u=0;u<M;u++){const z=(a*u+b)%M,r=u+Number(u>=E);w[z]=rankLog[r];map[z]=r}
  fam.push({a,b,w,map});
 }return fam;
}
/** Exhaust all 3302*336 keys. All held scores use one frozen best fit key.
 * Also return exact sorted-rank top5/top10 envelope over arbitrary fixed
 * rank permutations, any exception rank, any initial plaintext list.
 */
function search(c,rankLog,expected=null){
 const s=steps(c),fitEvents=s.events.filter(i=>i<T).length,fitNZ=T-fitEvents;
 const fam=keyFamily(rankLog),h=new Uint32Array(M),other=new Uint32Array(M),full=new Uint32Array(Q);
 let best=-Infinity,second=-Infinity,bestKey=null,expectedScore=null,keysAtBest=0,max5=-1,max10=-1,full5=-1,full10=-1;
 for(let origin=0;origin<ORIGINS;origin++){
  h.fill(0);other.fill(0);
  for(let i=0;i<fitNZ;i++)h[(s.nonzero[i]+M-PRIME[origin+i])%M]++;
  for(let i=fitNZ;i<s.nonzero.length;i++)other[(s.nonzero[i]+M-PRIME[origin+i])%M]++;
  const fitAll=Array.from(h).concat(fitEvents),sortFit=fitAll.sort((a,b)=>b-a);
  let x=0,y=0;for(let j=0;j<10;j++){y+=sortFit[j];if(j<5)x+=sortFit[j]}max5=Math.max(max5,x);max10=Math.max(max10,y);
  for(let j=0;j<M;j++)full[j]=h[j]+other[j];full[M]=s.events.length;
  const sorted=Array.from(full).sort((a,b)=>b-a);x=0;y=0;for(let j=0;j<10;j++){y+=sorted[j];if(j<5)x+=sorted[j]}full5=Math.max(full5,x);full10=Math.max(full10,y);
  for(const f of fam){
   let value=fitEvents*rankLog[E];for(let j=0;j<M;j++)value+=h[j]*f.w[j];
   if(expected&&origin===expected.origin&&f.a===expected.a&&f.b===expected.b)expectedScore=value;
   if(value>best+1e-9){second=best;best=value;bestKey={origin,a:f.a,b:f.b};keysAtBest=1}
   else if(Math.abs(value-best)<=1e-9){keysAtBest++;second=best}
   else if(value>second)second=value;
  }
 }
 return {bestKey,best,second,gap:best-second,keysAtBest,expectedScore,totalKeys:ORIGINS*fam.length,arbitraryMapCapacity:{fitTop5:max5,fitTop10:max10,wholeTop5:full5,wholeTop10:full10}};
}
/** Given a fixed aligned plaintext, the repeat mask identifies its escape
 * rank and for every origin a single nonrepeat fixes b for each unit a.
 * Enumerate exactly the residual 3302*12 possibilities.
 */
function cribKeys(c,p){
 const {rank}=mtf(p),{delta}=steps(c);let escape=-1;const u=[],z=[];
 for(let i=0;i<c.length;i++)if(delta[i]===0){if(escape===-1)escape=rank[i];if(escape!==rank[i])return {escape:null,keys:[],inconsistent:true}}
 if(escape===-1)return {escape:null,keys:[],inconsistent:true};
 for(let i=0;i<c.length;i++)if(delta[i]!==0){
  if(rank[i]===escape)return {escape,keys:[],inconsistent:true};
  u.push(rank[i]-Number(rank[i]>escape));z.push(delta[i]-1);
 }
 const keys=[];
 for(let origin=0;origin<ORIGINS;origin++)for(const a of units){
  const b=mod(z[0]-PRIME[origin]-a*u[0],M);let good=true;
  for(let j=1;j<u.length;j++)if((a*u[j]+b+PRIME[origin+j])%M!==z[j]){good=false;break}
  if(good)keys.push({origin,a,b});
 }
 return {escape,keys,inconsistent:false};
}
function matches(a,b){let n=0;for(let i=0;i<a.length;i++)n+=Number(a[i]===b[i]);return n}
const KEYS=[{origin:237,a:5,b:11},{origin:1419,a:3,b:16},{origin:3200,a:27,b:6}];
function run(corpus,texts,which="source"){
 const start=Date.now(),{source,donors,rankLog,lm,alphabet}=build(corpus,texts);
 let c=source,p=null,key=null,offset=null,donorId=null;
 if(which.startsWith("control")||which==="negative"){
  donorId=which==="negative"?1:Number(which.at(-1));const match=findMatched(donors[donorId],donorId===0?10000:0);
  p=match.plain;offset=match.offset;key=KEYS[donorId];
  if(which==="negative"){const rand=rng(0x3208a46);c=sender(p,key,()=>rand()%M)}
  else c=sender(p,key);
  check(equal(repeatProfile(c),[65,21]),"exact suppression-matched plant");
 }
 const expected=which.startsWith("control")?key:null;
 const result=search(c,rankLog,expected),best=result.bestKey,dec=decoder(c,best);
 check(equal(sender(dec.p,best),c),"exact original/control replay");
 const output={which,sourceLength:c.length,fit:T,held:H,repeats:repeatProfile(c),escape:E,fitKey:best,
  exactKeySearch:{...result,expectedScore:result.expectedScore===null?null:result.expectedScore/T,fitScore:result.best/T},
  rankScore:{fit:rankScore(dec.rank,rankLog,0,T),held:rankScore(dec.rank,rankLog,T,N)},
  plainScore:{fit:score(dec.p,lm,1,T),held:score(dec.p,lm,T,N),heldIoC:ioc(dec.p.slice(T))},
  heldPrefix:dec.p.slice(T,T+80).map(x=>alphabet[x]).join(" "),exactReplay:c.length,
  donorLengths:donors.map(x=>x.length)};
 if(p){
  output.donor={id:donorId,offset,expected:expected,fitMatches:matches(p.slice(0,T),dec.p.slice(0,T)),heldMatches:matches(p.slice(T),dec.p.slice(T)),nativeRankTop5:top(histogram(mtf(p).rank),5),nativePlainScore:score(p,lm,T,N)};
  output.crib=cribKeys(c,p);
  if(expected)check(output.crib.keys.some(k=>JSON.stringify(k)===JSON.stringify({origin:expected.origin,a:expected.a,b:expected.b})),"known plaintext exact key");
  output.maskGate=maskGate(c,[donors[donorId]]);
 }else{
  output.maskGate=maskGate(c,donors);
  output.donorFloors=donors.map(d=>({fit:floorForWindow(d,T),whole:floorForWindow(d,N)}));
 }
 output.elapsedMs=Date.now()-start;return output;
}
if(typeof require!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
 const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
 const texts=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"].map(f=>fs.readFileSync(path.join(root,"resources/control",f),"utf8").split(/\r?\n/).slice(0,1600).join("\n"));
 const which=process.argv[2]||"all",cases=which==="all"?["source","control0","control1","control2","negative"]:[which];
 console.log(JSON.stringify(cases.map(x=>run(corpus,texts,x)),null,2));
}
module.exports={run,build,mtf,unmtf,sender,decoder,findMatched,maskGate,cribKeys,search};
