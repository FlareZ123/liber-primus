'use strict';
/**
 * Key-free EA marker exclusion and exhaustive 29^4 direct-additive F29
 * initial states for a fixed two-GP-rune / one-byte radix-29 transport.
 * Exactly eight framing conventions: global vs page-reset pairs,
 * byte start phase 0/1, big- vs little-endian digit order.
 * Unknown uncompressed, compressed or encrypted binary bytes all qualify.
 *
 * CommonJS SFT, Node 22, no packages:
 * node sims/source_4d_radix29_bytes.cjs
 * Optional LP_MATRIX=red16|visible|printed for separate CI jobs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const red = require('./red16_spiral_4d_native_crib.cjs');
const C = Array.from(red.C), pages = red.pages;
const P = 29, N = C.length, STATES = 29 ** 4;
assert.equal(N, 12956);
const models = [
  {id:'red16',A:red.A,key:[11,7,22,3]},
  {id:'visible',A:[[9,11,16,19],[12,13,16,10],
    [14,11,3,8],[9,22,8,3]],key:[5,12,19,27]},
  {id:'printed',A:[[3258,3222,3152,3038],
    [3278,3299,3298,2838],[3288,3294,3296,2472],
    [4516,1206,708,1820]].map(row=>row.map(x=>x%29)),
    key:[1,9,18,27]}
];
let offset=0,trainEnd=0;
const pageRanges=[];
for(const page of pages) {
  pageRanges.push({p:page.page,start:offset,end:offset+page.indices.length});
  offset+=page.indices.length;
  if(page.page===27)trainEnd=offset;
}
assert.equal(offset,N);
assert.equal(trainEnd,6761);
const mod=x=>(x%P+P)%P;
function vectors(A) {
  const out=new Uint8Array(N*4);
  let a=1,b=0,c=0,d=0;
  for(let t=0;t<N;t++){
    const j=t*4;out[j]=a;out[j+1]=b;out[j+2]=c;out[j+3]=d;
    const x=(a*A[0][0]+b*A[1][0]+c*A[2][0]+d*A[3][0])%29;
    const y=(a*A[0][1]+b*A[1][1]+c*A[2][1]+d*A[3][1])%29;
    const z=(a*A[0][2]+b*A[1][2]+c*A[2][2]+d*A[3][2])%29;
    const w=(a*A[0][3]+b*A[1][3]+c*A[2][3]+d*A[3][3])%29;
    a=x;b=y;c=z;d=w;
  }
  return out;
}
function keyAt(V,t,s) {
  const j=t*4;
  return (V[j]*s[0]+V[j+1]*s[1]+V[j+2]*s[2]+V[j+3]*s[3])%29;
}
function stateOf(i) {
  const a=i%29,b=Math.floor(i/29)%29,
    c=Math.floor(i/841)%29,d=Math.floor(i/24389)%29;
  return [a,b,c,d];
}
function indexOf(s) {return s[0]+29*(s[1]+29*(s[2]+29*s[3]));}

/** Construct fixed 2-GP-rune byte framing without fitting glyph alignment. */
function pairPositions(clock,phase,endianness){
  const result=[];
  const ranges=clock==='global'?[{p:-1,start:0,end:N}]:pageRanges;
  for(const {p,start,end} of ranges){
    for(let t=start+phase;t+1<end;t+=2) {
      const high=endianness==='high-first'?t:t+1;
      const low=endianness==='high-first'?t+1:t;
      result.push({high,low,page:p});
    }
  }
  return result;
}
const frames=[];
for(const clock of ['global','page'])for(const phase of [0,1])
for(const order of ['high-first','low-first'])
  frames.push({clock,phase,order,pairs:pairPositions(clock,phase,order)});

/**
 * Original-invariant necessary condition for a byte:
 * decoded high GP29 digit 0..8, since 29*h+l <= 255, l in 0..28.
 * A single missed high rune rejects the secret key for this whole frame.
 */
function retainHighStates(cipher,V,pairs){
  const train=pairs.filter(q=>q.high<trainEnd&&q.low<trainEnd);
  const all=pairs;
  let survivors=Array.from({length:STATES},(_,i)=>i);
  const trace=[];
  for(let j=0;j<train.length;j++){
    const t=train[j].high,at=t*4,c=cipher[t];
    const a=V[at],b=V[at+1],cc=V[at+2],d=V[at+3];
    let n=0;
    for(let k=0;k<survivors.length;k++){
      const idx=survivors[k];
      const s0=idx%29,s1=Math.floor(idx/29)%29;
      const s2=Math.floor(idx/841)%29,s3=Math.floor(idx/24389)%29;
      const key=(a*s0+b*s1+cc*s2+d*s3)%29;
      if(mod(c-key)<=8)survivors[n++]=idx;
    }
    survivors.length=n;
    if(j<30||n===0)trace.push({checkedHighSymbols:j+1,
      sourceGlobalHighIndex:t,remainingKeys:n});
    if(!n)break;
  }
  const highSurvivors=survivors.length;
  survivors=survivors.filter(idx=>{
    const s=stateOf(idx);
    return all.every(pair=>{
      const h=mod(cipher[pair.high]-keyAt(V,pair.high,s));
      const l=mod(cipher[pair.low]-keyAt(V,pair.low,s));
      return h*29+l<=255;
    });
  });
  return {trainingHighSymbols:train.length,allBytePairs:all.length,
    fullyValidKeys:survivors.map(stateOf),
    highPrefixSurvivors:highSurvivors,
    firstRejectionTrace:trace.slice(0,26)};
}
/** Cipher-independent EA obstruction: a source marker at byte-high slots. */
function transparentMarkerObstruction() {
  const paradox=[];
  let even=0,odd=0;
  for(const page of pages) {
    const q=[[],[]];
    for(let i=1;i<page.indices.length-1;i++) {
      if(page.indices[i]!==page.indices[i-1])continue;
      q[i%2].push(i);
      if(i%2)odd++;else even++;
    }
    if(q[0].length&&q[1].length)paradox.push({
      page:page.page,evenLocalMarkers:q[0],oddLocalMarkers:q[1]
    });
  }
  assert.equal(paradox.length,14);
  assert.equal(even+odd>=80,true);
  // Both parities have a nonterminal EA output on these pages; neither
  // fixed orientation/phase can put every EA output in the low-byte slot.
  return {pagesWithBothNonterminalMarkerParities:paradox.length,
    pageExamples:paradox,nonterminalLocalEven:even,nonterminalLocalOdd:odd};
}
const markerProof=transparentMarkerObstruction();

/** A valid compressed binary member, expanded as transport data. */
function plantByteStream() {
  const source=fs.readFileSync(path.join(__dirname,'..','resources',
    'transcriptions','liber_primus_master.txt'),'utf8').slice(0,8000);
  const compressed=zlib.gzipSync(Buffer.from(source,'utf8'));
  assert.ok(compressed.length<Math.floor(N/2));
  return {compressed,plain:Array.from(compressed)};
}
function nativeBytePlant(V,key){
  const {compressed}=plantByteStream();
  const plain=new Array(N).fill(0);
  const frame=frames.find(x=>x.clock==='global'&&x.phase===0&&
    x.order==='high-first');
  let n=0;
  for(let i=0;i<frame.pairs.length;i++){
    const value=compressed[i%compressed.length];
    plain[frame.pairs[i].high]=Math.floor(value/29);
    plain[frame.pairs[i].low]=value%29;
    n++;
  }
  const cipher=plain.map((x,i)=>(x+keyAt(V,i,key))%29);
  const score=retainHighStates(cipher,V,frame.pairs);
  assert.equal(score.fullyValidKeys.length,1,
    'blind exhaustive binary codeword test must identify a unique state');
  assert.deepEqual(score.fullyValidKeys[0],key);
  const recovered=cipher.map((x,i)=>mod(x-keyAt(V,i,key)));
  assert.deepEqual(recovered,plain);
  const recoveredBytes=frame.pairs.map(q=>
    29*recovered[q.high]+recovered[q.low]);
  assert.deepEqual(zlib.gunzipSync(Buffer.from(
    recoveredBytes.slice(0,compressed.length))),Buffer.from(
      zlib.gunzipSync(compressed)));
  assert.deepEqual(cipher,recovered.map((x,i)=>
    (x+keyAt(V,i,key))%29));
  return {bytePairs:n,gzipSourceByteCount:compressed.length,
    recoveredOriginalCompressedPayload:true,correctInitialState:key,
    completelyRecoveredGpRunes:N,matchingKeys:score.fullyValidKeys.length,
    firstRejectionTrace:score.firstRejectionTrace.slice(0,12)};
}
function test(model){
  const V=vectors(model.A);
  const results=frames.map(x=>{
    const score=retainHighStates(C,V,x.pairs);
    return {clock:x.clock,phase:x.phase,order:x.order,
      trainingHighDigits:score.trainingHighSymbols,
      pairedPositions:score.allBytePairs,
      survivors:score.fullyValidKeys.length,
      earliestZero:score.firstRejectionTrace.at(-1)};
  });
  assert.equal(results.length,8);
  assert.ok(results.every(x=>x.survivors===0),
    'original binary intermediate under source-fixed additive F29 rejected');
  const control=nativeBytePlant(V,model.key);
  return {matrix:model.id,original:results,
    originalSurvivingFrames:results.filter(x=>x.survivors>0).length,
    syntheticGzip:control};
}
function main(){
  const filtered=process.env.LP_MATRIX?
    models.filter(x=>x.id===process.env.LP_MATRIX):models;
  assert.ok(filtered.length);
  console.log(JSON.stringify({
    classification:'original source-exact binary GP29 intermediate necessary-condition exclusion',
    byteModel:'one arbitrary octet = two GP29 digits, value = 29*high+low <=255',
    allFourStateKeys:STATES,
    markerProof,
    models:filtered.map(test),
    limitation:'Only exact fixed paired-digit alignment and source-fixed four-state direct addition; extra markers, secret symbol permutations and other binary codecs remain open'
  },null,2));
}
if(require.main===module)main();
module.exports={retainHighStates,transparentMarkerObstruction,vectors,keyAt,stateOf,indexOf,models,C,pages,N,STATES,pageRanges,trainEnd,mod,plantByteStream};
