'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(ROOT,'resources','transcriptions','lp2_krisyotam_2017.txt'),'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const RUNES='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const ri=new Map([...RUNES].map((r,i)=>[r,i]));
const breaks=new Set('-.&$§');
const sentenceBreaks=new Set('.&$§');
const stream=[], words=[], lineStarts=[];
let line=0,page=0,sentence=0,current=null,lastLine=0,lastPage=0,pendingLine=false,pendingPage=false;
function closeWord(){
 if(!current)return;
 current.length=current.values.length;
 current.wrapLine=lastLine!==current.line;
 current.wrapPage=lastPage!==current.page;
 words.push(current);current=null;
}
for(const ch of raw){
 if(ri.has(ch)){
  if(pendingLine&&stream.length)lineStarts.push(stream.length);
  pendingLine=false;pendingPage=false;
  if(!current)current={values:[],start:stream.length,page,line,sentence};
  const v=ri.get(ch);current.values.push(v);stream.push(v);lastLine=line;lastPage=page;
 }else if(breaks.has(ch)||/[0-9]/.test(ch)){
  closeWord();if(sentenceBreaks.has(ch))sentence++;
 }else if(ch==='/'){
  line++;pendingLine=true;
 }else if(ch==='%'){
  page++;pendingPage=true;if(!pendingLine){line++;pendingLine=true;}
 }
}
closeWord();
const N=12956;
const tape=stream.slice(0,N);
const canonical=corpus.pages.filter(p=>p.page>=0&&p.page<=55).flatMap(p=>p.indices);
assert.deepEqual(tape,canonical);
const ws=words.filter(w=>w.start+w.length<=N);
const lengths=ws.map(w=>w.length);
assert.equal(ws.length,2896);
assert.equal(lengths.reduce((a,b)=>a+b,0),N);
assert.equal(ws.filter(w=>w.wrapLine).length,420);
assert.equal(ws.filter(w=>w.wrapPage).length,32);
const sentMap=new Map();
for(let i=0;i<ws.length;i++){
 const s=ws[i].sentence;if(!sentMap.has(s))sentMap.set(s,[]);sentMap.get(s).push(i);
}
const sentenceGroups=[...sentMap.values()];
const lineBounds=[...new Set(lineStarts.filter(x=>x>0&&x<N))].sort((a,b)=>a-b);
const lineCuts=[0,...lineBounds,N];
const lineLengths=lineCuts.slice(1).map((x,i)=>x-lineCuts[i]);
assert.equal(sentenceGroups.length,175);
assert.equal(lineLengths.length,594);
const PRIME=corpus.prime;
const CICADA=new Set([3301,761,1033,2113,3203,1595277641,317,853,1039,1237,157,1259,1031,1229,2647,4577,1791,468]);
const SIEVE_MAX=1000000;
const sieve=new Uint8Array(SIEVE_MAX+1);sieve.fill(1);sieve[0]=sieve[1]=0;
for(let p=2;p*p<=SIEVE_MAX;p++)if(sieve[p])for(let j=p*p;j<=SIEVE_MAX;j+=p)sieve[j]=0;
function prime(n){return n>=0&&n<=SIEVE_MAX&&sieve[n]===1;}
function emirp(n){if(!prime(n))return false;const r=Number(String(n).split('').reverse().join(''));return r!==n&&prime(r);}
const fib=new Set();let fa=1,fb=2;while(fa<=SIEVE_MAX){fib.add(fa);[fa,fb]=[fb,fa+fb];}
const primeSet=new Set(PRIME);
function wordSums(a){
 const out=[];let pos=0;
 for(const len of lengths){let s=0;for(let j=0;j<len;j++)s+=PRIME[a[pos++]];out.push(s);}
 return out;
}
function t1a(sums){
 const out=new Array(13).fill(0),uniq=new Set();
 for(const v of sums){
  if(prime(v))out[0]++;if(emirp(v))out[1]++;if(prime(v+1))out[2]++;if(prime(v-1))out[3]++;
  if(v%29===0)out[4]++;if(v%7===0)out[5]++;if(v%13===0)out[6]++;
  const r=Math.round(Math.sqrt(v));if(r*r===v)out[7]++;if(fib.has(v))out[8]++;
  if(primeSet.has(v))out[9]++;if(CICADA.has(v))out[10]++;
  const s=String(v);if(s===s.split('').reverse().join(''))out[11]++;uniq.add(v);
 }
 out[12]=uniq.size/sums.length;for(let i=0;i<12;i++)out[i]/=sums.length;return out;
}
function groupSums(a,groups){return groups.map(g=>g.reduce((s,i)=>s+a[i],0));}
function rawSums(a,lens){const out=[];let pos=0;for(const len of lens){let s=0;for(let j=0;j<len;j++)s+=PRIME[a[pos++]];out.push(s);}return out;}
function groupStats(sums){let p=0,e=0,c=0;for(const v of sums){if(prime(v))p++;if(emirp(v))e++;if(CICADA.has(v))c++;}return[p/sums.length,e/sums.length,c];}
function summarize(real,arr){
 let m=0;for(const x of arr)m+=x;m/=arr.length;let v=0,k=0;
 for(const x of arr){v+=(x-m)*(x-m);if(Math.abs(x-m)>=Math.abs(real-m))k++;}
 const sd=Math.sqrt(v/arr.length);return{real,mean:m,sd,z:(real-m)/(sd+1e-12),p:(k+1)/(arr.length+1)};
}
const realWords=wordSums(tape),realA=t1a(realWords);
const realB={
 sentence:groupStats(groupSums(realWords,sentenceGroups)),
 line:groupStats(rawSums(tape,lineLengths))
};
const hits=[];
for(let gi=0;gi<sentenceGroups.length;gi++){
 const g=sentenceGroups[gi],v=g.reduce((s,i)=>s+realWords[i],0);
 if(CICADA.has(v)){
  const w=g.map(i=>ws[i]);hits.push({group:gi,value:v,words:w.length,page:w[0].page,start:w[0].start,text:w.map(x=>x.values.map(i=>corpus.translit[i]).join('')).join(' ')});
 }
}
assert.deepEqual(hits.map(x=>x.value),[1039,1033,3203]);
const B=2000, n=tape.length;
const nullA=Array.from({length:13},()=>new Float64Array(B));
const nullB={sentence:Array.from({length:3},()=>new Float64Array(B)),line:Array.from({length:3},()=>new Float64Array(B))};
let state=3301>>>0;
function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;}
const perm=Uint16Array.from(tape);
for(let b=0;b<B;b++){
 perm.set(tape);
 for(let i=n-1;i>0;i--){const j=Math.floor(rand()*(i+1));const x=perm[i];perm[i]=perm[j];perm[j]=x;}
 const sw=wordSums(perm),a=t1a(sw),s=groupStats(groupSums(sw,sentenceGroups)),l=groupStats(rawSums(perm,lineLengths));
 for(let j=0;j<13;j++)nullA[j][b]=a[j];
 for(let j=0;j<3;j++){nullB.sentence[j][b]=s[j];nullB.line[j][b]=l[j];}
}
const names=['prime','emirp','s+1_prime','s-1_prime','s%29==0','s%7==0','s%13==0','square','fibonacci','gematria_prime','cicada_number','palindrome','distinct_frac'];
const A=names.map((name,i)=>({name,...summarize(realA[i],nullA[i])}));
const Bstats={sentence:realB.sentence.map((v,i)=>summarize(v,nullB.sentence[i])),line:realB.line.map((v,i)=>summarize(v,nullB.line[i]))};
const maxZ=Math.max(...A.map(x=>Math.abs(x.z)),...Bstats.sentence.map(x=>Math.abs(x.z)),...Bstats.line.map(x=>Math.abs(x.z)));
assert.ok(maxZ<4);
assert.ok(Math.abs(A[4].z+1.987072195037846)<1e-9);
assert.ok(Math.abs(Bstats.sentence[2].z-3.073266397668875)<1e-9);
console.log(JSON.stringify({parse:{runes:N,words:ws.length,wrapLine:420,wrapPage:32,sentences:sentenceGroups.length,lines:lineLengths.length},null:{seed:3301,algorithm:'xorshift32',permutations:B},T1a:A,T1b:{sentence:Bstats.sentence,line:Bstats.line},sentenceCicadaHits:hits,maxAbsZ:maxZ}));
console.log('PASS: corrected 2896-word loader and T1a/T1b null gate');
