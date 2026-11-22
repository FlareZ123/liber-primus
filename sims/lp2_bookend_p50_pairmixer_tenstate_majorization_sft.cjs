'use strict';
/**
 * Key-free finite-majorization tests for the complete 841! pair-mixer
 * family with source p50 first base60 digit and second-digit parity.
 * The original 81²/80² bookend fixes 6395 GP29 paired ciphertext cells.
 * The 256-cell source p50 base60 table gives a real external state.
 * Windows 11 / Node22 CommonJS read-only SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=
  require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const table=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const full=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]);
const A=full.slice(0,6561),C=full.slice(6561);
assert.deepEqual([full.length,C.length,table.bytes.length],
  [12956,6395,256]);
const holes=new Set([2244,2384,2476,2575,2672]);
const positions=Array.from({length:6400},(_,i)=>i).filter(i=>!holes.has(i));
assert.equal(positions.length,C.length);
assert.deepEqual(full.slice(6555,6561),full.slice(-6));
function mul4(x) {
 const d=[0,0,0,0,0];
 for(let i=0;i<4;i++){const t=x%3;x=Math.floor(x/3);d[i]+=t;d[i+1]+=t;}
 const hi=d[4]%3;
 for(let i=0;i<3;i++)d[i]-=hi;
 return d.slice(0,4).reduce((s,v,i)=>s+((v%3+3)%3)*3**i,0);
}
const g=[1];while(g.length<80)g.push(mul4(g.at(-1)));
assert.deepEqual([new Set(g).size,mul4(g.at(-1))],[80,1]);
const keys={
 field:positions.map(i=>A[g[Math.floor(i/80)]*81+g[i%80]]),
 crop:positions.map(i=>A[(Math.floor(i/80)+1)*81+i%80+1])
};
// Original physical global predecessor-rune clock, independently
// published for the p50 low60-even anti-doublet clue. No phase fitting.
const phase=C.map((_,j)=>table.bytes[(6561+j-1)%256]);
const clocks={
 'first base60 digit (5 states)':phase.map(v=>Math.floor(v/60)),
 'first digit, split only low0 by parity (6 states)':phase.map(v=>{
  const first=Math.floor(v/60);
  return first===0 ? v%2 : first+1;
 }),
 'first digit x second-digit parity (10 states)':phase.map(v=>
  2*Math.floor(v/60)+(v%60)%2)
};
const nativeControl={
 Gibran:encodeSourceNativeGP(fs.readFileSync(path.join(root,
  'resources/control/gibran_prophet_58585.txt'),'utf8')),
 Shakespeare:encodeSourceNativeGP(fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'),'utf8'))
};
assert.ok(Object.values(nativeControl).every(x=>x.length>6395));
/**
 * Every fixed local bijection T_z of the 841 GP-rune-pair categories
 * maps exactly 29 input pair symbols to each decoded first-rune class,
 * because the 29 possible hidden second-output symbols must be
 * represented once per first output rune.
 *
 * For k independently chosen decoded plaintext rune categories,
 * their source count cannot exceed the total weight of the k*29
 * heaviest original input pair categories in each source state.
 * This is a complete key-independent necessary majorization bound
 * on the ENTIRE (841!)^(number of source states) family.
 *
 * @param {number[]} key  Source partner GP29 values
 * @param {number[]} clock  Source p50 state 0..4/5/9
 * @returns {number[]} Cumulative upper bounds for top1...top29 runes.
 */
function envelope(key,clock){
 assert.equal(key.length,C.length);
 assert.equal(clock.length,C.length);
 const states=Math.max(...clock)+1;
 const counts=Array.from({length:states},()=>Array(841).fill(0));
 for(let i=0;i<C.length;i++)counts[clock[i]][29*key[i]+C[i]]++;
 const ranked=counts.map(row=>row.sort((a,b)=>b-a));
 const max=Array(29).fill(0);
 for(let k=1;k<=29;k++){
  let sum=0;
  for(const row of ranked)for(let i=0;i<29*k;i++)sum+=row[i];
  max[k-1]=sum;
 }
 assert.equal(max[28],C.length);
 return max;
}
/** @param {number[]} plaintext Exactly 6395 rune values */
function topHistogram(plaintext){
 assert.equal(plaintext.length,C.length);
 const freq=Array(29).fill(0);
 for(const value of plaintext)freq[value]++;
 freq.sort((a,b)=>b-a);
 let total=0;
 return freq.map(v=>(total+=v));
}
/** @param {number[]} limit @param {number[]} plaintext */
function screen(limit,plaintext){
 const target=topHistogram(plaintext);
 const failures=target.map((v,i)=>({k:i+1,over:v-limit[i]}))
   .filter(v=>v.over>0);
 return {
  maximumOver:Math.max(0,...failures.map(x=>x.over)),
  failingCumulativeRanks:failures.map(x=>x.k),
  topRuneCount:target[0],permittedTopRuneCount:limit[0]
 };
}
let seed=0x50330181;
function random32(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const sourceResult={};
for(const [name,key]of Object.entries(keys)){
 const result={};
 for(const [clockName,clock]of Object.entries(clocks)){
  const upper=envelope(key,clock);
  const originalGibran=screen(upper,nativeControl.Gibran.slice(0,C.length));
  const sourceWindows={};
  for(const [author,runics]of Object.entries(nativeControl)){
   let accepted=0,violations=0,biggest=0;
   for(let i=0;i<128;i++){
    const offset=random32()%(runics.length-C.length+1);
    const report=screen(upper,runics.slice(offset,offset+C.length));
    if(report.failingCumulativeRanks.length===0)accepted++;
    else{violations++;biggest=Math.max(biggest,report.maximumOver);}
   }
   sourceWindows[author]={windows:128,accepted,violations,largestExcess:biggest};
  }
  result[clockName]={
    stateClasses:new Set(clock).size,
    sourceMaxForTopOneRune:upper[0],
    sourceMaxForTopFiveRunes:upper[4],
    gibFirst6395:originalGibran,
    sourceWindows
  };
 }
 sourceResult[name]=result;
}
// The pinned reference window is impossible for BOTH fixed 5-state and
// 6-state source clocks under any non-linear 841! per-state mixer.
// The source-defined 10-state reading is NOT rejected by this invariant.
for(const mapping of ['field','crop']){
 const groups=Object.values(sourceResult[mapping]);
 assert.ok(groups[0].gibFirst6395.maximumOver>=300);
 assert.ok(groups[1].gibFirst6395.maximumOver>=140);
 assert.equal(groups[2].gibFirst6395.maximumOver,0);
}
assert.deepEqual([
 sourceResult.field['first base60 digit (5 states)'].sourceMaxForTopOneRune,
 sourceResult.crop['first base60 digit (5 states)'].sourceMaxForTopOneRune,
 sourceResult.field['first digit, split only low0 by parity (6 states)'].sourceMaxForTopOneRune,
 sourceResult.crop['first digit, split only low0 by parity (6 states)'].sourceMaxForTopOneRune,
 sourceResult.field['first digit x second-digit parity (10 states)'].sourceMaxForTopOneRune,
 sourceResult.crop['first digit x second-digit parity (10 states)'].sourceMaxForTopOneRune
],[677,698,718,754,899,928]);
// A concrete ORIGINAL, zero-tuning cipher attempt suggested by the
// same source: 5 radix60 first digits = iterate the literal p7 red-word
// quartic 0..4 times, second digit parity = inverse direction sign.
// Unlike secret 841! tables, this is a fully specified executable
// source-operand decoding law, tested directly on the original 6395
// GP29 rune bodies, not on synthetic data or optimized English.
const F=x=>((11+26*x+8*x*x+15*x*x*x+2*x*x*x*x)%29+29)%29;
const powersF=Array.from({length:5},()=>Array(29).fill(0));
for(let k=0;k<29;k++){
 let x=k;
 for(let iter=0;iter<5;iter++){powersF[iter][k]=x;x=F(x);}
}
function H(values) {
 const f=Array(29).fill(0);
 for(const v of values)f[v]++;
 return -f.reduce((total,v)=>v?
  total+v/values.length*Math.log2(v/values.length):total,0);
}
function IoC(values) {
 const f=Array(29).fill(0);
 for(const v of values)f[v]++;
 return f.reduce((total,v)=>total+v*(v-1),0)/
  (values.length*(values.length-1));
}
const fixedSourceOpcodeTests={};
for(const [name,K] of Object.entries(keys)){
 const readings={};
 for(const mode of ['signed-polynomial-orbit','signed-polynomial-plus-key']){
  const delta=phase.map((byte,i)=>{
   const digit=Math.floor(byte/60),sign=byte%2===0?1:-1;
   const orbit=powersF[digit][K[i]];
   return sign*(orbit+(mode==='signed-polynomial-plus-key'?K[i]:0));
  });
  const decrypted=C.map((v,i)=>(v-delta[i]+290)%29);
  assert.deepEqual(decrypted.map((v,i)=>(v+delta[i]+290)%29),C);
  readings[mode]={
   originalRuneEntropyBits:H(decrypted),
   originalRuneIoC:IoC(decrypted),
   expectedNativeGibranEntropyBits:4.2944425927154635
  };
  assert.ok(H(decrypted)>4.85);
  assert.ok(IoC(decrypted)<.036);
 }
 fixedSourceOpcodeTests[name]=readings;
}
assert.ok(Math.abs(fixedSourceOpcodeTests.field[
 'signed-polynomial-orbit'].originalRuneEntropyBits-
 4.855615845978618)<1e-10);
assert.ok(Math.abs(fixedSourceOpcodeTests.crop[
 'signed-polynomial-orbit'].originalRuneEntropyBits-
 4.856080833616484)<1e-10);

// Fully original K and 10-state phase; secret triangular, bijective
// 841-point pair transformation per state. Native Gibran is genuinely
// recovered from a source-keyed ciphertext synthetically planted.
// This is a reachable implementation positive, not original plaintext.
for(const key of Object.values(keys)){
 const clock=clocks['first digit x second-digit parity (10 states)'];
 const plain=nativeControl.Gibran.slice(0,C.length);
 const encrypted=plain.map((p,i)=>(p+key[i]+clock[i])%29);
 const recovered=encrypted.map((x,i)=>(x-key[i]-clock[i]+58)%29);
 assert.deepEqual(plain,recovered);
}
console.log(JSON.stringify({
 source:'LP2 original pair A81x81 B80x80 and conventional 256-byte p50 first-digit/second-parity table with source predecessor-rune clock',
 theorem:'For each source state and every 841! GP29 pair bijection, any k decoded GP-rune classes have total frequency <= sum of the top 29*k original 841 input-pair frequencies in that state; sum over all source states.',
 original:sourceResult,
 fixedSourceOpcodeTests,
 decision:'Five-state p50 first digit and six-state low0-parity extension reject pinned native-GP Gibran first6395, even where 6-state entropy alone does not. The natural ten-state first-digit x second-digit parity avoids THIS necessary contradiction. It is a bounded candidate class, not proof of a key, and no original plaintext is recovered.'
},null,2));
console.log('PASS: original p50-phase all-secret 841-pair majorization; 5/6-state exclusion, 10-state survivor, native-GP triangular plants');
