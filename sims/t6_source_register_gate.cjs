#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const C=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const A=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript=read('resources/lp2-transcription.txt');
const lp1=read('resources/liber-primus/lp1-plaintext-reference.txt');
const mod=(x,m)=>((x%m)+m)%m;
const pages=C.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
const cipher=pages.flat(),N=cipher.length;
assert.equal(N,12956);assert.equal(pages.length,55);
const runeIndex=new Map(C.runes.map((r,i)=>[r,i]));
const words=transcript.split('%').slice(0,55).join('%').split(/[-.&$§]/u)
 .map(s=>[...s].filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch))).filter(w=>w.length);
assert.equal(words.length,2896);assert.equal(words.flat().length,N);
const wordPos=new Uint16Array(N),pagePos=new Uint16Array(N);let cur=0;
for(const w of words)for(let j=0;j<w.length;j++)wordPos[cur++]=j;
cur=0;for(const p of pages)for(let j=0;j<p.length;j++)pagePos[cur++]=j;
assert.equal(cur,N);
const tokenIndex=new Map(C.translit.map((s,i)=>[s,i]));
function encWord(s){s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');const a=[];for(let i=0;i<s.length;){const v=tokenIndex.get(s.slice(i,i+2));if(v!==undefined){a.push(v);i+=2;}else{const q=tokenIndex.get(s[i]);if(q!==undefined)a.push(q);i++;}}return a;}
const dict=new Set((lp1.match(/[A-Za-z]+/gu)||[]).map(w=>encWord(w).join(',')));
const ref=(lp1.match(/[A-Za-z]+/gu)||[]).flatMap(encWord);
function dist(a){const h=Array(29).fill(0);for(const x of a)h[x]++;const n=a.length;return {n,ioc:h.reduce((s,c)=>s+c*(c-1),0)/(n*(n-1)),entropy:-h.reduce((s,c)=>c?s+c/n*Math.log2(c/n):s,0),counts:h};}
function stats(a){let p=0,wordHits=0,longWordHits=0;for(const w of words){const x=a.slice(p,p+w.length);p+=w.length;if(dict.has(x.join(','))){wordHits++;if(w.length>=5)longWordHits++;}}return {...dist(a),wordHits,longWordHits};}
const log15=Array(29).fill(-1);let z=1;for(let i=0;i<28;i++){log15[z]=i;z=z*15%29;}assert.equal(z,1);assert.equal(Math.pow(15,13)%29,27);
function decodeLog15(clock,prevReset='global',keyFn=null){
 const out=[];let prev=null;
 for(let i=0;i<N;i++){
  const j=clock==='book'?i:clock==='page'?pagePos[i]:wordPos[i];
  const k=keyFn?keyFn(i,j):mod(24+13*j,28);
  if(i===0||(prevReset==='page'&&pagePos[i]===0))out.push(mod(cipher[i]-k,29));
  else{const d=mod(cipher[i]-prev,29);out.push(d===0?28:mod(log15[d]-k,28));}
  prev=cipher[i];
 }
 return out;
}
// 2016 image-derived T6(x)=24-2x; its fixed point is Haegl=8.
// T6(x)-8=(-2)(x-8), and -2=15^13. Ac=24 gives log15(24-8)=24.
const t6={
 fixedPoints:Array.from({length:29},(_,i)=>i).filter(x=>mod(24-2*x,29)===x),
 pow15_13:Math.pow(15,13)%29,
 acPhase:log15[16]
};
const t6Log15={
 wordClock:stats(decodeLog15('word','global')),
 bookClock:stats(decodeLog15('book','global')),
 pageClock:stats(decodeLog15('page','page'))
};
// T6's 28-cycle from Ac excludes fixed-point Haegl. Use it as a candidate
// alphabet order; adjacent zero differences are the reserved Haegl marker.
const T=x=>mod(24-2*x,29),orbit=[],rank=Array(29).fill(-1);let x=24;
while(rank[x]===-1){rank[x]=orbit.length;orbit.push(x);x=T(x);}
assert.equal(orbit.length,28);assert.equal(orbit.includes(8),false);
const markers=[],digits=[];let prev=24;
for(let i=0;i<N;i++){const d=mod(cipher[i]-prev,29);if(!d)markers.push(i);else digits.push(rank[mod(8-2*d,29)]);prev=cipher[i];}
assert.equal(markers.length,86);assert.equal(digits.length,12870);assert.equal(digits.length%3,0);
function pack(d){let invalid=0,bytes=[];for(let i=0;i<d.length;i+=3){const v=d[i]*784+d[i+1]*28+d[i+2];if(v>=16384)invalid++;else bytes.push(v>>7,v&127);}return {invalid,validGroups:d.length/3-invalid,bytes};}
const packed=pack(digits),printable=packed.bytes.filter(x=>x>=32&&x<=126).length;
// Exact source-framed 553-rune interval: 8805..9357 inclusive.
const frameStart=8805,frameEnd=9358,frameDigits=[];let frameRepeats=0;
for(let i=frameStart;i<frameEnd;i++){const d=mod(cipher[i]-cipher[i-1],29);if(!d)frameRepeats++;else frameDigits.push(rank[mod(8-2*d,29)]);}
const framePack=pack(frameDigits);
function frameInvalid(start){const d=[];for(let i=start;i<start+553;i++){const x=mod(cipher[i]-cipher[i-1],29);if(x)d.push(rank[mod(8-2*x,29)]);}return d.length%3?null:pack(d).invalid;}
const matched=[];for(let s=3;s+553<=N;s+=3)if(s%79===36){const q=frameInvalid(s);if(q!==null)matched.push({start:s,invalid:q});}
const frameRank=1+matched.filter(x=>x.invalid<framePack.invalid).length;
// Reconstruct all 13-dot markers and red-rune interval counts from original annotation.
let total=0;const pageOffset=new Map();for(const p of C.pages){pageOffset.set(p.page,total);total+=p.indices.length;}
const dot13=[];for(const p of A.pages)for(const q of p.large_punctuation||[])if(q[1]===13)dot13.push({page:p.page,at:pageOffset.get(p.page)+q[0]});
dot13.sort((a,b)=>a.at-b.at||a.page-b.page);
const redPositions=[];for(const p of A.pages)for(const sp of p.red_spans||[])for(let j=0;j<sp.length;j++)redPositions.push(pageOffset.get(p.page)+sp.start+j);
function intervalCounts(bounds,positions){const out=[];for(let j=0;j+1<bounds.length;j++)out.push(positions.filter(x=>x>=bounds[j]&&x<bounds[j+1]).length);return out;}
const fullBounds=[0,...dot13.map(x=>x.at),total],redIntervals=intervalCounts(fullBounds,redPositions);
const runeIntervals=fullBounds.slice(1).map((x,i)=>x-fullBounds[i]);
const unsolvedDots=dot13.filter(x=>x.page<56).map(x=>x.at);
const unsolvedBounds=[0,...unsolvedDots,N],redU=intervalCounts(unsolvedBounds,redPositions.filter(x=>x<N));
const runeU=unsolvedBounds.slice(1).map((x,i)=>x-unsolvedBounds[i]);
assert.equal(dot13.length,31);assert.equal(unsolvedDots.length,28);
assert.equal(redIntervals.length,32);assert.equal(redIntervals.reduce((a,b)=>a+b,0),225);
assert.equal(redU.reduce((a,b)=>a+b,0),213);assert.deepEqual(redIntervals.slice(28),[5,0,7,0]);
// Source-framed piecewise and repeating key schedules in the EA/log15 model.
const seg=new Uint8Array(N);let mi=0;for(let i=0;i<N;i++){while(mi<unsolvedDots.length&&unsolvedDots[mi]<=i)mi++;seg[i]=mi;}
function decodeSegmentKey(values,cumulative=false){const key=values.map(x=>mod(x,28));if(cumulative){let s=0;for(let i=0;i<key.length;i++)key[i]=s=mod(s+key[i],28);}return decodeLog15('book','global',(i)=>key[seg[i]]);}
function decodeRepeatKey(values,cumulative=false){const k=values.map(x=>mod(x,28)),pre=[];let s=0;for(const x of k)pre.push(s=mod(s+x,28));const adv=values.reduce((a,b)=>a+b,0)%28;return decodeLog15('book','global',(i)=>cumulative?mod(pre[i%k.length]+Math.floor(i/k.length)*adv,28):k[i%k.length]);}
const intervalTests={
 redDirect:stats(decodeSegmentKey(redU,false)),
 redCumulative:stats(decodeSegmentKey(redU,true)),
 runeDirect:stats(decodeSegmentKey(runeU,false)),
 runeCumulative:stats(decodeSegmentKey(runeU,true)),
 red32Repeat:stats(decodeRepeatKey(redIntervals,false)),
 red32Cumulative:stats(decodeRepeatKey(redIntervals,true))
};
// Synthetic positive control: 4,290 7-bit byte pairs -> 12,870 base-28 digits,
// with 86 inserted zero-difference markers. The full inverse must round-trip.
function rng32(seed){let a=seed>>>0;return()=>{a^=a<<13;a^=a>>>17;a^=a<<5;return a>>>0;};}
const rng=rng32(0x3301),plantBytes=Array.from({length:8580},()=>rng()&127),plantDigits=[];
for(let i=0;i<plantBytes.length;i+=2){const v=plantBytes[i]*128+plantBytes[i+1],a=Math.floor(v/784),r=v%784,b=Math.floor(r/28);plantDigits.push(a,b,r%28);}
const plantMarkers=new Set();while(plantMarkers.size<86)plantMarkers.add(1+(rng()%(N-1)));
const plantCipher=[];let di=0,pv=24;
for(let i=0;i<N;i++){if(i>0&&plantMarkers.has(i)){plantCipher.push(pv);continue;}const y=orbit[plantDigits[di++]],d=mod(15*(8-y),29);pv=mod(pv+d,29);plantCipher.push(pv);}
assert.equal(di,plantDigits.length);
const roundDigits=[],roundMarkers=[];pv=24;
for(let i=0;i<N;i++){const d=mod(plantCipher[i]-pv,29);if(!d)roundMarkers.push(i);else roundDigits.push(rank[mod(8-2*d,29)]);pv=plantCipher[i];}
assert.deepEqual(roundDigits,plantDigits);assert.deepEqual(new Set(roundMarkers),plantMarkers);
assert.deepEqual(pack(roundDigits).bytes,plantBytes);assert.equal(pack(roundDigits).invalid,0);
const out={
 t6SourceComposition:t6,t6Log15,
 hMarkerBase28:{
  orbit,repeatMarkers:markers.length,dataDigits:digits.length,groups:digits.length/3,
  invalidGroups:packed.invalid,validGroups:packed.validGroups,validOutputBytes:packed.bytes.length,
  printableFractionAmongValidBytes:printable/packed.bytes.length,
  fiveClauseFrame:{start:frameStart,endExclusive:frameEnd,length:553,startMod3:frameStart%3,startMod79:frameStart%79,repeats:frameRepeats,dataDigits:frameDigits.length,groups:frameDigits.length/3,invalidGroups:framePack.invalid,matchedWindows:matched.length,rankAmongMatchedWindows:frameRank,tiedAtRank:matched.filter(x=>x.invalid===framePack.invalid).length}
 },
 thirteenDotFraming:{
  totalMarkers:dot13.length,unsolvedMarkers:unsolvedDots.length,redIntervals,unsolvedRedIntervals:redU,
  fullCipherIntervalLengths:runeIntervals,unsolvedCipherIntervalLengths:runeU,intervalTests
 },
 original:{runes:N,pages:pages.length,words:words.length,repeats:markers.length,base28Digits:digits.length},
 reference:{lp1Runes:ref.length,lp1Distribution:dist(ref),randomIoc:1/29},
 syntheticRoundTrip:{payloadBytes:plantBytes.length,base28Digits:plantDigits.length,markers:plantMarkers.size,exact:true}
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
