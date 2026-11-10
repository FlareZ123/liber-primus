'use strict';
/**
 * LP2 page-15 4x4 square values as a complete periodic affine encryption.
 * The earlier page-15 study tested additive pads and byte-stream ciphers.
 * This separate bounded family asks whether 16 source-derived integers provide
 * 16 multiplicative keys in F_29, with an optional aligned affine offset.
 *
 * C[i] = A[(clock+phase)%16] * P[i] + sign * B[(clock+phase)%16] (mod 29)
 *
 * 6 source multiplier choices surviving nonzero-invertibility checks, 13
 * source/zero offset choices, both signs, 16 phases, two clock reset policies:
 * 6,656 complete invertible original-data tests, selected on pages 16..18,
 * frozen and challenged on pages 19..22. An exact positive is included.
 *
 * CommonJS Node22: node sims/fibonacci_affine_field29_heldout.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {readSquare,primeList,uniqueFibonacciPrimeRanks,clockwiseSpiral}=
  require('./fibonacci_prime_spiral.cjs');
const {encode}=require('./affine_echo_literary_control.cjs');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length);
const train=pages.filter(p=>p.page>=16&&p.page<=18);
const hold=pages.filter(p=>p.page>=19&&p.page<=22);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
assert.equal(train.reduce((n,p)=>n+p.indices.length,0),800);
assert.equal(hold.reduce((n,p)=>n+p.indices.length,0),944);
const mod=n=>(n%29+29)%29;
function inverse(x) {
  const a=mod(x);
  if(!a)return null;
  for(let i=1;i<29;i++)if(a*i%29===1)return i;
  throw Error('Unexpected nonzero field element');
}
function sourceArrays() {
  const ranks=uniqueFibonacciPrimeRanks();
  const primes=primeList(Math.max(...ranks));
  const prime=ranks.map(i=>primes[i-1]);
  const spiral=clockwiseSpiral();
  const square=spiral.map(([r,c])=>readSquare()[r][c]);
  assert.deepEqual(square,prime.map(p=>Math.abs(3301-p)));
  const rowToSpiral=Array.from({length:16},(_,i)=>
    spiral.findIndex(([r,c])=>4*r+c===i));
  const arrays={square,prime,ranks};
  for(const [name,v] of Object.entries({...arrays}))
    arrays[name+'-row']=rowToSpiral.map(i=>v[i]);
  for(const [name,v] of Object.entries({...arrays}))
    arrays[name+'-rev']=v.slice().reverse();
  return arrays;
}
/** @param {number[][]} groups Array of physical-page rune-index vectors. */
function decipher(groups,A,B,phase,reset,sign) {
  const plaintext=[];
  let pointer=0;
  for(const group of groups) {
    if(reset)pointer=0;
    const out=[];
    for(let i=0;i<group.length;i++) {
      const j=(pointer+i+phase)%16;
      out.push(mod((group[i]-sign*B[j])*inverse(A[j])));
    }
    plaintext.push(out);
    pointer+=group.length;
  }
  return plaintext;
}
function coincidence(groups) {
  const h=new Uint32Array(29);
  let n=0;
  for(const group of groups)for(const x of group){h[x]++;n++;}
  let equal=0;
  for(const x of h)equal+=x*(x-1);
  return equal/(n*(n-1));
}
function encodeByPage(plaintext,A,B,phase,reset,sign) {
  let pointer=0;
  return plaintext.map(source=>{
    if(reset)pointer=0;
    const out=source.map((p,i)=>{
      const j=(pointer+i+phase)%16;
      return mod(A[j]*p+sign*B[j]);
    });
    pointer+=source.length;
    return out;
  });
}
function seeded(seed) {
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
function run() {
  const arr=sourceArrays(),zero=Array(16).fill(0);
  const multiplicands=Object.entries(arr).filter(([,v])=>
    v.every(x=>mod(x)!==0));
  assert.equal(multiplicands.length,6);
  const sourceOffsets=[['zero',zero],...Object.entries(arr)];
  assert.equal(sourceOffsets.length,13);
  const ranked=[];
  const cTrain=train.map(p=>p.indices),cHold=hold.map(p=>p.indices);
  for(const [mul,A]of multiplicands)
    for(const [offset,B]of sourceOffsets)
      for(const sign of[-1,1])
        for(let phase=0;phase<16;phase++)
          for(const reset of[false,true]) {
            const trainIoC=coincidence(decipher(cTrain,A,B,phase,reset,sign));
            ranked.push({mul,offset,sign,phase,reset,trainIoC});
          }
  assert.equal(ranked.length,6656);
  ranked.sort((x,y)=>y.trainIoC-x.trainIoC);
  const winner=ranked[0];
  assert.deepEqual(
    [winner.mul,winner.offset,winner.sign,winner.phase,winner.reset],
    ['square-row','ranks-row',-1,13,true]);
  assert.ok(Math.abs(winner.trainIoC-0.03590112640801001)<1e-12);
  const holdIoC=coincidence(decipher(cHold,arr[winner.mul],
    winner.offset==='zero'?zero:arr[winner.offset],winner.phase,
    winner.reset,winner.sign));
  assert.ok(Math.abs(holdIoC-0.03459703075291622)<1e-12);

  // An independently sourced actual English text, encrypted by one of
  // the tested field-affine transforms with the original page lengths.
  const shakes=fs.readFileSync(
    path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
  const english=(shakes.match(/[A-Za-z]+/g)||[]).flatMap(w=>encode(w));
  const n=1744;
  assert.ok(english.length>=n);
  let cursor=0;
  const positivePages=[...train,...hold].map(p=>{
    const out=english.slice(cursor,cursor+p.indices.length);
    cursor+=p.indices.length;
    return out;
  });
  assert.equal(cursor,n);
  const A=arr.square,B=arr.prime,phase=3,sign=1,reset=true;
  const cipher=encodeByPage(positivePages,A,B,phase,reset,sign);
  assert.deepEqual(decipher(cipher,A,B,phase,reset,sign),positivePages);
  const random=seeded(0x7aff1234);
  let rewrites=0,previous=-1;
  for(const group of cipher) {
    for(let i=0;i<group.length;i++){
      if(group[i]===previous && (random()%100)<81){
        group[i]=(group[i]+1+random()%28)%29;
        if(group[i]===previous)group[i]=(group[i]+1)%29;
        rewrites++;
      }
      previous=group[i];
    }
  }
  const plantIoC=coincidence(decipher(cipher,A,B,phase,reset,sign));
  assert.ok(plantIoC>0.05);
  assert.ok(winner.trainIoC<0.04 && holdIoC<0.04);
  const result={
    hypothesis:'Fibonacci-prime 16-phase affine key over F29',
    n:pages.reduce((v,p)=>v+p.indices.length,0),
    trainingPages:train.map(p=>p.page),trainingRunes:800,
    holdoutPages:hold.map(p=>p.page),holdoutRunes:944,
    candidateCount:ranked.length,
    arrays:Object.keys(arr),validMultipliers:multiplicands.map(([name])=>name),
    selectedTraining:winner,selectedHeldoutIoC:holdIoC,
    topFive:ranked.slice(0,5).map(x=>({...x,
      holdIoC:coincidence(decipher(cHold,arr[x.mul],
        x.offset==='zero'?zero:arr[x.offset],x.phase,x.reset,x.sign))})),
    uniform29Baseline:1/29,
    controlledPositive:{knownKey:['square','prime',phase,sign,reset],
      originalSourceIoC:coincidence(positivePages),
      exactNoRewriteRoundTrip:true,modifiedAdjacentCollisions:rewrites,
      recoveredWithSameKeyIoC:plantIoC},
    outcome:'No English-like GP plaintext or independently transferable key under any direct 16-step affine transform in this bounded clue-derived family.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={sourceArrays,inverse,decipher,coincidence,encodeByPage,run};
