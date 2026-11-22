'use strict';

/**
 * One source-frozen Jung 2009 Liber Primus chapter-V scene as a GP29
 * running-key operand. The scene begins "I see the bloody head..." and
 * includes the floating scarab. Only the first 260 derived GP29 symbols
 * are retained, not the copyrighted passage. Edition: 2009, pp237–239;
 * source location: https://studylib.net/doc/28515314/the-red-book---carl-jung
 *
 * Key tokenization: uppercase, K/Q->C, V->U, Z->S, remove punctuation;
 * ING->NG, IO->IA, then greedy [TH,NG,EO,OE,AE,IA,EA].
 * No search of offsets, alphabet permutations or source passages.
 * Page p0 starts after its real red13 title and thirteen-dot marker;
 * p23 starts at its physical-page first rune; p3 is independent holdout.
 *
 * Run using Node22 from repository root:
 * node sims/lp2_jung_chapter5_scarab_runningkey_sft.cjs
 * No network access or writes. This SFT tests an exploratory source
 * hypothesis, not a historically authenticated cipher instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const alphabet=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
assert.deepEqual(corpus.translit,alphabet);
assert.equal(corpus.pages.length,58);
assert.equal(corpus.pages.slice(0,56).flatMap(p=>p.indices).length,12956);

// Derived rune indices from the complete first 260 GP symbols of the fixed
// scene, before original ciphertext was scored; this is a shortened fixture.
// The complete selected scene has 428 GP rune symbols.
const sourceKey=[10,15,18,18,2,18,17,20,3,3,23,26,8,28,23,3,0,24,19,24,9,3,9,2,18,23,24,4,5,15,16,4,28,19,15,3,19,12,9,18,7,3,1,9,23,18,23,15,3,19,12,9,18,15,20,24,10,9,0,20,3,24,16,15,2,18,4,18,10,16,24,5,18,10,9,2,10,15,10,19,24,6,18,0,3,4,24,20,3,21,16,10,19,18,15,8,1,23,23,18,4,21,10,15,18,28,20,24,4,6,18,17,20,24,5,5,15,5,24,4,24,17,0,20,3,24,16,21,13,24,15,16,3,9,2,18,23,24,4,5,15,16,4,28,19,10,9,2,18,23,18,18,13,18,15,16,4,28,5,8,3,0,2,18,15,16,4,28,19,15,8,10,9,18,15,24,4,18,23,15,1,9,4,24,23,27,16,21,2,4,3,1,6,8,2,18,23,24,4,5,7,24,16,18,4,2,18,4,18,10,15,18,28,9,23,24,16,18,4,4,3,4,15,18,10,15,18,15,19,18,15,19,24,20,20,15,18,4,13,18,9,16,15,3,9,2,18,23,24,4,5,4,3,5,5,7,24,20,20,15];
assert.equal(sourceKey.length,260);
assert.ok(sourceKey.every(x=>Number.isInteger(x)&&x>=0&&x<29));

/** @param {number} x @returns {number} */
function mod(x) { return (x%29+29)%29; }

/**
 * Exhaustive F-transparent historical feasibility:
 * P=F outputs C=F without consuming key; a non-F plaintext consumes
 * one key rune and adds the key (or its negation) modulo29.
 * Each state retains an exact consumed-key count; no plaintext ranking.
 * @param {number[]} ciphertext
 * @param {(used:number)=>number} shift
 * @param {number} available
 * @returns {{possible:boolean,firstFailure:number,terminalStates:number,peak:number}}
 */
function feasible(ciphertext,shift,available) {
  let states=new Set([0]);
  let peak=1;
  for(let i=0;i<ciphertext.length;i++){
    const next=new Set();
    for(const used of states) {
      if(ciphertext[i]===0) next.add(used); // literal transparent F
      if(used<available && mod(ciphertext[i]-shift(used))!==0)
        next.add(used+1); // normal non-F plaintext
    }
    if(next.size===0) return {possible:false,firstFailure:i,terminalStates:0,peak};
    peak=Math.max(peak,next.size);
    states=next;
  }
  return {possible:true,firstFailure:-1,terminalStates:states.size,peak};
}

/**
 * Authentic historical forward rule. A plaintext F never consumes the key.
 * @param {number[]} plaintext
 * @param {(used:number)=>number} shift
 * @returns {number[]}
 */
function encrypt(plaintext,shift) {
  let used=0;
  return plaintext.map(v=>v===0?0:mod(v+shift(used++)));
}

/** @param {number[]} plain @returns {number} */
function ioc(plain){
  const counts=Array(29).fill(0);
  plain.forEach(x=>counts[x]++);
  return counts.reduce((s,n)=>s+n*(n-1),0)/(plain.length*(plain.length-1));
}
/** @param {number[]} numbers @returns {number} */
function numberOfF(numbers) { return numbers.filter(x=>x===0).length; }

/** @param {number} count @returns {number[]} */
function primes(count){
  const found=[];
  for(let p=2;found.length<count;p++){
    let valid=true;
    for(let j=2;j*j<=p;j++) if(p%j===0){valid=false;break;}
    if(valid)found.push(p);
  }
  return found;
}

// Historical p56 original cipher is a real 85-rune independent control.
const actualP56=corpus.pages[56].indices;
assert.equal(actualP56.length,85);
const first100=primes(100);
const knownP56=feasible(actualP56,k=>mod(first100[k]-1),100);
assert.ok(knownP56.possible);
assert.equal(knownP56.terminalStates,5);

// Planted native GP control uses the 95 genuinely clear original p57 runes.
// Check both signs and real literal-F nonconsumption on the forward rule.
const native=corpus.pages[57].indices;
assert.equal(native.length,95);
assert.ok(numberOfF(native)>0);
for(const sign of [-1,+1]){
  const shift=used=>mod(sign*sourceKey[used]);
  const planted=encrypt(native,shift);
  const inverse=feasible(planted,shift,sourceKey.length);
  assert.ok(inverse.possible);
  let used=0;
  assert.deepEqual(planted,native.map(v=>v===0?0:mod(v+shift(used++))));
}

// Freeze three original, independent receivers from the manuscript layout.
// Retain first 400 printed runes to observe a contradiction before key 260.
const chapter0=corpus.pages.slice(0,3).flatMap(p=>p.indices);
const chapter3=corpus.pages.slice(3,8).flatMap(p=>p.indices);
const chapter23=corpus.pages.slice(23,27).flatMap(p=>p.indices);
assert.equal(chapter0.length,729);
assert.equal(chapter3.length,1145);
assert.equal(chapter23.length,1021);
const targets=[
  ['post-title p0 body',chapter0.slice(13,413),220,8],
  ['p23-26 chapter start',chapter23.slice(0,400),66,15],
  ['independent p3-7 holdout',chapter3.slice(0,400),12,42]
];
for(const [name,cipher,expectedMinus,expectedPlus] of targets){
  assert.equal(cipher.length,400);
  const minus=feasible(cipher,used=>mod(sourceKey[used]),sourceKey.length);
  const plus=feasible(cipher,used=>mod(-sourceKey[used]),sourceKey.length);
  assert.equal(minus.possible,false);
  assert.equal(plus.possible,false);
  assert.equal(minus.firstFailure,expectedMinus);
  assert.equal(plus.firstFailure,expectedPlus);
  console.log(JSON.stringify({name,originalRunes:400,
    historicalPositiveKeyFailure:minus.firstFailure,
    historicalNegativeKeyFailure:plus.firstFailure,
    manuscriptRecoveredPlaintext:false}));
}

// Ordinary, key-consuming additive GP29 screen on first 200 original
// p0 body runes. This is deliberately weaker than the F-transparent test.
const c0=chapter0.slice(13,213);
for(const sign of [-1,+1]){
  const out=c0.map((value,i)=>mod(value+sign*sourceKey[i]));
  assert.deepEqual(out.map((value,i)=>mod(value-sign*sourceKey[i])),c0);
  const expected=sign===-1?0.03311557788944724:0.03527638190954774;
  assert.ok(Math.abs(ioc(out)-expected)<1e-12);
  console.log(JSON.stringify({target:'p0 ordinary additive',
    decodedRunes:200,decodeSign:sign,indexOfCoincidence:ioc(out),
    first24:out.slice(0,24).map(v=>alphabet[v]).join(' ')}));
}

const fingerprint=createHash('sha256')
  .update(Buffer.from(sourceKey)).digest('hex');
console.log(JSON.stringify({source:'Jung 2009, Liber Primus V, scarab/fallen-man scene',
  keyPrefix:260,fullSceneKeyLength:428,prefixSHA256:fingerprint,
  originalP56Control:{length:85,feasible:knownP56.possible,
    terminalStates:knownP56.terminalStates},
  clearP57Positive:{runes:95,plantedSigns:2},
  result:'NO LEGAL FULL ORIGINAL INVERSE in the fixed scene and clock; no original plaintext'}));
