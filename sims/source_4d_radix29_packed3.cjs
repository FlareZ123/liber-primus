'use strict';
/**
 * Exact source-original F29 key sieve for 5 GP29 digits encoding three raw bytes.
 * Test all 29^4 unknown four-state keys over all 20 unfit original framings.
 * No plaintext text model is required: any encrypted/compressed byte payload
 * must still have packet value <256^3 while 29^5 >256^3.
 *
 * SFT: node sims/source_4d_radix29_packed3.cjs
 * Optional LP_MATRIX=red16|visible|printed.
 */
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const lib=require('./source_4d_radix29_bytes.cjs');
const {C,N,STATES,models,pageRanges,trainEnd,vectors,keyAt,stateOf,mod,
  plantByteStream}=lib;
const DIGITS=5, MAX=(256 ** 3)-1, BASE=29;
const FIRST_MAX=Math.floor(MAX/(BASE**(DIGITS-1)));
assert.equal(FIRST_MAX,23);
assert.ok(BASE**DIGITS>256**3);
/** @returns {{clock:string,phase:number,order:string,positions:number[][]}[]} */
function framing() {
  const out=[];
  for(const clock of ['global','page'])
    for(let phase=0;phase<5;phase++)
      for(const order of ['forward','reverse']){
        const positions=[];
        const ranges=clock==='global'?[{start:0,end:N}]:pageRanges;
        for(const range of ranges)
          for(let i=range.start+phase;i+4<range.end;i+=5) {
            const seq=[i,i+1,i+2,i+3,i+4];
            if(order==='reverse')seq.reverse();
            positions.push(seq);
          }
        out.push({clock,phase,order,positions});
      }
  return out;
}
const frames=framing();
assert.equal(frames.length,20);
function digit(cipher,V,s,t) {
  return mod(cipher[t]-keyAt(V,t,s));
}
/**
 * Exact full-key screen, with the first high GP digit as a logically
 * necessary cheap bound for 3-byte encodability. Only survivors are
 * evaluated under the stricter full five-digit capacity test.
 */
function sieveKeys(cipher,V,packets) {
  const training=packets.filter(p=>p.every(t=>t<trainEnd));
  let survivors=Array.from({length:STATES},(_,i)=>i);
  let firstEliminatedAt=null, firstHighChecks=0;
  const trace=[];
  for(const positions of training){
    const t=positions[0], j=t*4;
    const a=V[j],b=V[j+1],c=V[j+2],d=V[j+3];
    let n=0;
    for(let k=0;k<survivors.length;k++){
      const index=survivors[k];
      const x=index%29,y=Math.floor(index/29)%29,
        z=Math.floor(index/841)%29,w=Math.floor(index/24389)%29;
      const proj=(a*x+b*y+c*z+d*w)%29;
      if(mod(cipher[t]-proj)<=FIRST_MAX)survivors[n++]=index;
    }
    survivors.length=n;
    firstHighChecks++;
    if(firstHighChecks<=12 || n===0)
      trace.push({highDigitsChecked:firstHighChecks,sourceIndex:t,
        remainingInitialKeys:n});
    if(n===0){firstEliminatedAt=firstHighChecks;break}
  }
  const highDigitSurvivors=survivors.length;
  survivors=survivors.filter(index=>{
    const state=stateOf(index);
    return packets.every(positions=>{
      let value=0;
      for(const t of positions)value=29*value+digit(cipher,V,state,t);
      return value<=MAX;
    });
  });
  return {trainingPackets:training.length,sourcePackets:packets.length,
    earliestNoKeyHighDigit:firstEliminatedAt,highDigitsChecked:firstHighChecks,
    highDigitSurvivors,
    completeCapacitySurvivorStates:survivors.map(stateOf),
    trace};
}
function gzipPlant(V,key){
  const {compressed}=plantByteStream();
  const frame=frames.find(x=>x.clock==='global'&&x.phase===0&&x.order==='forward');
  assert.ok(3*frame.positions.length>=compressed.length);
  const plain=new Array(N).fill(0);
  for(let i=0;i<frame.positions.length;i++){
    const b0=compressed[(3*i)%compressed.length];
    const b1=compressed[(3*i+1)%compressed.length];
    const b2=compressed[(3*i+2)%compressed.length];
    let number=b0*65536+b1*256+b2;
    const digits=new Array(5);
    for(let j=4;j>=0;j--){digits[j]=number%29;number=Math.floor(number/29)}
    assert.equal(number,0);
    frame.positions[i].forEach((t,j)=>{plain[t]=digits[j]});
  }
  const cipher=plain.map((x,t)=>(x+keyAt(V,t,key))%29);
  const found=sieveKeys(cipher,V,frame.positions);
  assert.equal(found.completeCapacitySurvivorStates.length,1,
    'packed gzip binary must recover a uniquely correct initial key');
  assert.deepEqual(found.completeCapacitySurvivorStates[0],key);
  const decoded=cipher.map((c,t)=>digit(cipher,V,key,t));
  assert.deepEqual(decoded,plain);
  assert.deepEqual(decoded.map((c,t)=>(c+keyAt(V,t,key))%29),cipher);
  const bytes=[];
  for(const positions of frame.positions){
    let num=0;
    for(const t of positions)num=29*num+decoded[t];
    assert.ok(num<=MAX);
    bytes.push((num>>>16)&255,(num>>>8)&255,num&255);
  }
  assert.deepEqual(Buffer.from(bytes.slice(0,compressed.length)),compressed);
  assert.ok(zlib.gunzipSync(compressed).length>1000);
  return {sourceCompressedBytes:compressed.length,
    exactRecoveredGpRunes:N,exactRecoveredRawOctets:3*frame.positions.length,
    genuineGzipDecompressed:true,
    blindRecoveredState:key,
    uniqueSurvivingKey:true,
    highDigitSurvivors:found.highDigitSurvivors,
    highPrefixTrace:found.trace};
}
function test(model){
  const V=vectors(model.A);
  const original=frames.map(frame=>{
    const result=sieveKeys(C,V,frame.positions);
    return {clock:frame.clock,phase:frame.phase,order:frame.order,
      trainingPackets:result.trainingPackets,
      completePackets:result.sourcePackets,
      firstHighDigitContradiction:result.earliestNoKeyHighDigit,
      survivingKeys:result.completeCapacitySurvivorStates.length,
      highPrefixTrace:result.trace.slice(-4)};
  });
  assert.ok(original.every(x=>x.survivingKeys===0),
    'all 20 fixed packet framings must reject original key source family');
  const control=gzipPlant(V,model.key);
  return {model:model.id,original,positive:control};
}
if(require.main===module){
  const eligible=process.env.LP_MATRIX?
    models.filter(x=>x.id===process.env.LP_MATRIX):models;
  assert.ok(eligible.length);
  console.log(JSON.stringify({
    classification:'exact original binary-byte fixed 5GP29:3octet capacity exclusion',
    code:'5 GP29 digits encode 3 bytes as big-endian 24-bit integer',
    originalSourceRuneCount:N,statesPerMatrix:STATES,
    originalFrameCountPerMatrix:frames.length,
    capacity:{minAllowedValue:0,maxAllowedValue:MAX,
      gp29FiveDigitMaximum:29**5-1,maximumHighDigit:FIRST_MAX},
    results:eligible.map(test),
    limits:'No inserted/deleted rune markers, variable-size bitstream, hidden secret symbol relabeling, per-page unknown phases, changing key matrix, or nonbinary text exclusions'
  },null,2));
}
module.exports={framing,sieveKeys};
