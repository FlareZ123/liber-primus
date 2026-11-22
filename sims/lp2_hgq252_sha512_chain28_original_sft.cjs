#!/usr/bin/env node
'use strict';

/**
 * One source-motivated but NOT author-authenticated compositional trial:
 *
 * 1. Divide the original 256 base60-derived bytes as an F29 polynomial by
 *    the EXACT 2013 signed BASE29 H polynomial and the original LP2 p39 red
 *    G triad; the 252 source coefficients constitute a finite candidate key.
 * 2. Serialize that 252-digit quotient as a fixed 153-byte BASE29 integer,
 *    an authenticated-era numeration convention.
 * 3. SHA-512(seed || uint32BE(counter)) is a fully pinned key stream because
 *    p56 really prints a SHA-512 target. No KDF, salt, byte-order or key
 *    rotation is fitted to ciphertext.
 * 4. Encode plaintext GP indices 0..27 as 28 possible nonzero changes of
 *    the previous ciphertext rune, mod29. Plain GP=28 (EA) emits a repeat,
 *    consuming no hash stream. This attempts to explain the 86 original
 *    consecutive equals as a rare source GP letter, not arbitrary padding.
 *
 * A word-register positive and exact reverse control test implementation,
 * not authenticity. One fixed original-cipher inverse and a held-out chapter
 * are read without altering the script or choosing language-fit parameters.
 *
 * Windows Node 22: node sims/lp2_hgq252_sha512_chain28_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const resource=name=>JSON.parse(fs.readFileSync(path.resolve(
  __dirname,'../resources/liber-primus',name),'utf8'));
const gp=resource('lp2-corpus.json');
const grid=resource('lp2-grid-256.json');
const M=29;
const mod=x=>(x%M+M)%M;
assert.equal(grid.bytes.length,256);
assert.equal(gp.runes.length,29);

/** 2013 signed BASE29 x^2 quadratic (low-first coefficient order). */
const H=[3,26,24];
/** Original p39 red triad, source GP rune indices at offsets 119...121. */
const G=[27,5,15];
assert.deepEqual(gp.pages[39].indices.slice(119,122),G);
function multiply(a,b) {
  const result=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    result[i+j]=mod(result[i+j]+a[i]*b[j]);
  return result;
}
const factor=multiply(H,G).reverse();
assert.equal(factor.length,5);
assert.deepEqual(factor,[12,17,11,21,23]);
const full=grid.bytes.map(mod);
const rest=full.slice();
const inverse=Array.from({length:28},(_,i)=>i+1).find(
  x=>mod(x*factor[0])===1);
const quot=[];
for(let i=0;i<252;i++) {
  const coeff=mod(rest[i]*inverse);
  quot.push(coeff);
  for(let j=0;j<factor.length;j++)
    rest[i+j]=mod(rest[i+j]-coeff*factor[j]);
}
assert.deepEqual(rest.slice(252),[0,0,0,0]);
assert.deepEqual(quot.slice(0,20),[
  0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7
]);
assert.equal(quot.length,252);
/** Exact natural source BASE29 integer packing into fixed 153 octets. */
let number=0n;
for(const digit of quot)number=number*29n+BigInt(digit);
const seed=Buffer.alloc(153);
for(let i=seed.length-1;i>=0;i--) {
  seed[i]=Number(number&255n);
  number>>=8n;
}
assert.equal(number,0n);
assert.ok(seed.toString('hex').startsWith(
  '04598e588f3e70d4100f40d7489f9855a468a0d950156d2a'));
/** Immutable SHA512 counter stream from fixed original seed. */
function stream(length) {
  const result=new Uint8Array(length);
  let pos=0;
  for(let n=0;pos<length;n++) {
    const counter=Buffer.alloc(4);
    counter.writeUInt32BE(n,0);
    const digest=crypto.createHash('sha512').update(seed)
      .update(counter).digest();
    for(const byte of digest) {
      if(pos===length)break;
      result[pos++]=byte%28;
    }
  }
  return result;
}
/**
 * GP=28 is a transparent exceptional rune, emitting zero difference and
 * consuming no key. All other plaintext values 0..27 emit one of the 28
 * nonzero GP29 differences, with a SHA512-derived 28-ary key addition.
 */
function encrypt(plain,k) {
  const out=[],state={prev:0,used:0};
  for(const p of plain) {
    assert.ok(p>=0&&p<29);
    if(p===28) {
      out.push(state.prev);
    } else {
      const step=1+((p+k[state.used++])%28);
      state.prev=mod(state.prev+step);
      out.push(state.prev);
    }
  }
  return out;
}
function decrypt(cipher,k) {
  const out=[],state={prev:0,used:0};
  for(const c of cipher) {
    if(c===state.prev)out.push(28);
    else {
      const step=mod(c-state.prev)-1;
      out.push((step-k[state.used++]+28)%28);
    }
    state.prev=c;
  }
  return out;
}
function ioc(indices) {
  const n=indices.length,count=new Int32Array(29);
  for(const x of indices)count[x]++;
  return [...count].reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
}
const unknown=gp.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(unknown.length,12956);
const primeKey=stream(12956);
// The actual solved p57 passage contains no EA, so separately exercise the
// special zero-step branch with GREAT, a source-calibrated clear LP1 word.
const sourceGreat=[6,4,28,16]; // GP runes G R EA T
assert.deepEqual(sourceGreat.map(i=>gp.runes[i]).join(''),'ᚷᚱᛠᛏ');
const greatEncrypted=encrypt(sourceGreat,stream(sourceGreat.length));
assert.deepEqual(decrypt(greatEncrypted,stream(sourceGreat.length)),
  sourceGreat);
assert.equal(greatEncrypted[2],greatEncrypted[1]);
const nativePositive=gp.pages[57].indices;
assert.equal(nativePositive.length,95);
const plant=Array.from({length:12956},(_,i)=>nativePositive[i%95]);
const encoded=encrypt(plant,primeKey);
assert.deepEqual(decrypt(encoded,primeKey),plant);
assert.deepEqual(encrypt(decrypt(unknown,primeKey),primeKey),unknown);
const plain=decrypt(unknown,primeKey);
const counted=unknown.reduce((n,v,i)=>n+((i===0?0:unknown[i-1])===v),0);
const predicted=plain.filter(v=>v===28).length;
assert.equal(counted,predicted);
assert.equal(counted,86);
// This chain's zero-step encoding fixes ALL 86 repeated-rune plaintext
// symbols to EA, independently of the SHA512 key or modulus and phases.
// If the original printed word boundaries represent native plaintext word
// boundaries, a strong key-independent word-onset constraint follows.
const source=fs.readFileSync(path.resolve(__dirname,
  '../resources/liber-primus/lp2-transcription.txt'),'utf8');
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const wordStarts=new Set();
let inWord=false,off=0;
for(const ch of source) {
  if(runeIndex.has(ch)) {
    if(!inWord)wordStarts.add(off);
    off++;inWord=true;
  } else if('-.,&$'.includes(ch)) {
    inWord=false;
  }
}
assert.equal(off,13136);
let onsetCount=0;
for(let i=1;i<unknown.length;i++)
  if(unknown[i]===unknown[i-1]&&wordStarts.has(i))onsetCount++;
assert.equal(onsetCount,23);
const {encodeSourceNativeGP}=
  require('./lp2_native_gp_source_orthography_sft.cjs');
/** Binomial survival probability Pr[X>=hits], under an empirical p. */
function exactOnsetTail(n,hits,p) {
  let term=(1-p)**n,tail=0;
  for(let i=0;i<=n;i++) {
    if(i>=hits)tail+=term;
    term*=i===n?0:(n-i)/(i+1)*p/(1-p);
  }
  return tail;
}
const originalOnset=onsetCount/counted;
const onsetControls=[];
const nativeCounts=new Int32Array(29);
const nativeInitialCounts=new Int32Array(29);
let nativeRuneTotal=0;
for(const [name,filename,expectedAll,expectedStart] of [
  ['Gibran','gibran_prophet_58585.txt',606,60],
  ['Shakespeare','shakespeare_first300k.txt',1633,98],
  ['Emerson','emerson_essays_2944.txt',2224,237]
]) {
  const body=fs.readFileSync(path.resolve(__dirname,
    '../resources/control',filename),'utf8');
  let allEA=0,onsetEA=0;
  for(const word of body.match(/[A-Za-z]+/g)||[]) {
    const vals=encodeSourceNativeGP(word);
    for(const item of vals) {
      nativeCounts[item]++;
      nativeRuneTotal++;
    }
    nativeInitialCounts[vals[0]]++;
    allEA+=vals.filter(v=>v===28).length;
    if(vals[0]===28)onsetEA++;
  }
  assert.deepEqual([allEA,onsetEA],[expectedAll,expectedStart]);
  const p=onsetEA/allEA;
  onsetControls.push({source:name,totalEA:allEA,wordInitialEA:onsetEA,
    conditionalWordStartGivenEA:p,
    expectedWordInitialAmong86:counted*p,
    observedOriginalWordInitialAmong86:onsetCount,
    exactOneSidedBinomialTail:exactOnsetTail(counted,onsetCount,p)});
}
assert.ok(onsetControls.every(c=>c.exactOneSidedBinomialTail<0.00003));
const nativeSpecialCandidates=gp.translit.map((name,i)=>({
  rune:name,sourceFrequency:nativeCounts[i]/nativeRuneTotal,
  wordInitialConditional:nativeInitialCounts[i]/nativeCounts[i],
  occurrences:nativeCounts[i],wordInitialOccurrences:nativeInitialCounts[i]
})).filter(x=>x.sourceFrequency>=0.00531275291738481&&
  x.sourceFrequency<=0.008191291709575693);
assert.deepEqual(nativeSpecialCandidates.map(x=>x.rune),['NG','EA']);
assert.ok(nativeSpecialCandidates.every(x=>x.wordInitialConditional<0.09));


const chapterRanges=[[0,2],[3,7],[8,14],[15,22],[23,26],
                     [27,32],[33,39],[40,53],[54,55]];
let pageOffset=0;
const starts=gp.pages.map(p=>{const n=pageOffset;pageOffset+=p.runic_count;return n;});
const chapter=chapterRanges.map(([a,b])=>{
  const lo=starts[a],hi=starts[b+1],values=plain.slice(lo,hi);
  const count=values.reduce((s,v)=>s+(v===28),0);
  return {
    pages:'p'+a+'–'+b,runes:values.length,
    gpIoC:ioc(values),
    EAtransparent:count,
    first60:values.slice(0,60).map(i=>gp.translit[i]).join(' ')
  };
});
console.log(JSON.stringify({
  type:'fixed original-source SHA512 chain-cipher *hypothesis*, unverified',
  seed:'canonical GF29 H2013×Gp39 quotient Q252 as BASE29 integer',
  seedSize:seed.length,
  seedSha256:crypto.createHash('sha256').update(seed).digest('hex'),
  keyGeneration:'SHA512(seed||uint32BE(block)), %28',
  transport:'GP29 predecessor-relative nonzero step, transparent EA index28',
  sourceRunes:unknown.length,
  sourceDoubletEvents:counted,
  doubletAtSourcePrintedWordOnset:onsetCount,
  conditionalEAOnsetControls:onsetControls,
  allNativeGP29SingleEscapeCandidates:nativeSpecialCandidates,
  observedEscapeOnsetRate:originalOnset,
  observedEscapePrevalence:counted/unknown.length,
  exact95ClopperPearsonPrevalenceInterval:[0.00531275291738481,0.008191291709575693],
  originalGP29IoC:ioc(unknown),
  inverseGP29IoC:ioc(plain),
  nativeSolvedP57PlantIOC:ioc(plant),
  controls:'12956/12956 native-positive exact plaintext inversion and original ciphertext re-encryption',
  chapter,
  decision:'No GP-native plaintext. Under native-English word boundaries, all 29 possible single-GP-rune repeat markers are disfavored: only NG and EA frequencies fall in the exact 95% original repeat-prevalence interval, while both have <9% word-initial occurrences versus 23/86=26.74% source repeats. This fixed SHA512 key route is rejected; different state clocks and encoded word breaks remain open.'
},null,2));
