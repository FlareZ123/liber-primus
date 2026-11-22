'use strict';
/**
 * Corrected 2014 LP1 FIRFUMFERENFE historical key: exact F-skip-aware
 * all-13-phase original LP2 p0/p1 attack, with both arithmetic directions.
 *
 * Cipher branch: P = C + sign*K[(phase+consumedKey) mod 13] mod29.
 * For each ciphertext F=0 also allow unshifted plaintext F=0 without
 * consuming a key element, as authenticated by the solved 2014 p56 page.
 * Shifted branches yielding plaintext F=0 are disallowed.
 *
 * Each set element is a distinct key-consumption count. At a fixed consumed
 * count all historical paths have the same future legal transitions, so
 * set merging is exact and exhaustive, with no beam or language scoring.
 *
 * Windows 11 / Node.js 22 CommonJS / read-only source-native SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) { return fs.readFileSync(path.join(base, file), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
/** @param {number} value @returns {number} */
function mod29(value) { return (value % 29 + 29) % 29; }
const historicalKey = 'FIRFUMFERENFE';
assert.equal('CIRCUMFERENCE'.replaceAll('C', 'F'), historicalKey);
const key = [...historicalKey].map(c => corpus.translit.indexOf(c));
assert.deepEqual(key, [0,10,4,0,1,19,0,18,4,18,9,0,18]);
const sourceP0 = corpus.pages.find(p => p.page === 0).indices;
const sourceP1 = corpus.pages.find(p => p.page === 1).indices;
const sourceP56 = corpus.pages.find(p => p.page === 56).indices;
const nativeP57 = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual([sourceP0.length, sourceP1.length, sourceP56.length, nativeP57.length],
  [262,266,85,95]);
assert.deepEqual([sourceP0, sourceP1].map(p => p.filter(x=>x===0).length),[14,13]);

// The first 36 runes of the authentic 2014 LP1 p14/15 koan determine
// the exact corrected key, including its 12th-position F.
const runeToIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const sections = read('resources/transcriptions/liber_primus_master.txt').split('%');
const lp1Koan = [...sections[13] + sections[14]].filter(r=>runeToIndex.has(r))
  .map(r=>runeToIndex.get(r));
assert.equal(lp1Koan.length,319);
const originalKnown36 = 'A C O A N D U R NG A L E S S O N TH E M A S T E R E X P L A I N E D TH E I'
  .split(' ').map(token=>corpus.translit.indexOf(token));
assert.equal(originalKnown36.length,36);
assert.deepEqual(lp1Koan.slice(0,36).map((c,i)=>mod29(c-key[i%13])),originalKnown36);
// The obsolete source spelling with unconverted C fails two known positions.
const obsolete = [...'FIRFUMFERENCE'].map(c=>corpus.translit.indexOf(c));
assert.deepEqual(lp1Koan.slice(0,36).flatMap((c,i)=>
  mod29(c-obsolete[i%13])===originalKnown36[i]?[]:[i]),[11,24]);

/**
 * Exhaustively test all possible F-bypass paths.
 * @param {number[]} ciphertext
 * @param {number[]} shifts
 * @param {-1|1} sign
 * @param {number} phase
 * @returns {{valid:boolean,firstImpossible:number|null,terminalKeyCounts:number[],maxLiveStates:number}}
 */
function exactFPaths(ciphertext,shifts,sign,phase){
  let states = new Set([0]), peak = 1;
  for(let i=0;i<ciphertext.length;i++){
    const next=new Set();
    for(const consumed of states){
      const decoded=mod29(ciphertext[i]+sign*shifts[(phase+consumed)%shifts.length]);
      if(decoded!==0)next.add(consumed+1);
      if(ciphertext[i]===0)next.add(consumed);
    }
    if(next.size===0)return {
      valid:false, firstImpossible:i, terminalKeyCounts:[], maxLiveStates:peak
    };
    states=next;
    peak=Math.max(peak,states.size);
  }
  return {
    valid:true, firstImpossible:null,
    terminalKeyCounts:[...states].sort((a,b)=>a-b),
    maxLiveStates:peak
  };
}
/** @param {number[]} x @returns {number[]} */
const failures = x => Array.from({length:13},(_,phase)=>exactFPaths(x,key,-1,phase));
const p0Minus=failures(sourceP0);
const p1Minus=failures(sourceP1);
const p0Plus=Array.from({length:13},(_,phase)=>exactFPaths(sourceP0,key,+1,phase));
const p1Plus=Array.from({length:13},(_,phase)=>exactFPaths(sourceP1,key,+1,phase));
const combined=[...sourceP0,...sourceP1];
const combinedMinus=Array.from({length:13},(_,phase)=>exactFPaths(combined,key,-1,phase));
const combinedPlus=Array.from({length:13},(_,phase)=>exactFPaths(combined,key,+1,phase));
const survivors = all => all.flatMap((r,i)=>r.valid?[i]:[]);
assert.deepEqual(survivors(p0Minus),[]);
assert.deepEqual(survivors(p0Plus),[3,4,5]);
assert.deepEqual(survivors(p1Minus),[7,10,11]);
assert.deepEqual(survivors(p1Plus),[]);
assert.deepEqual(survivors(combinedMinus),[]);
assert.deepEqual(survivors(combinedPlus),[]);
assert.deepEqual(p0Minus.map(r=>r.firstImpossible),
  [5,144,24,37,37,2,56,2,255,255,2,33,33]);
assert.deepEqual(p1Plus.map(r=>r.firstImpossible),
  [15,87,87,87,1,68,15,68,100,36,100,51,2]);
assert.deepEqual(combinedPlus.map(r=>r.firstImpossible),
  [35,47,47,349,349,349,16,35,35,5,148,148,14]);

// The first-two-page contradiction requires one consistent arithmetic sign.
// More generously, give every original physical page its OWN phase and OWN
// independent sign, yet retain the exact historical key/F-bypass operation.
// A page with no legal sign/phase proves that even this rekeying cannot work.
const pageTrials = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0)
  .map(page => {
    const validMinus = [], validPlus = [];
    for(let phase=0;phase<13;phase++){
      if(exactFPaths(page.indices,key,-1,phase).valid)validMinus.push(phase);
      if(exactFPaths(page.indices,key,+1,phase).valid)validPlus.push(phase);
    }
    return {page:page.page,runes:page.indices.length,validMinus,validPlus};
  });
assert.equal(pageTrials.length,55);
const impossibleUnderAnyPageSign = pageTrials
  .filter(p=>p.validMinus.length===0 && p.validPlus.length===0)
  .map(p=>p.page);
assert.deepEqual(impossibleUnderAnyPageSign,
  [3,4,8,10,16,19,20,25,26,27,29,30,31,34,35,37,38,40,41,43,44,45,46,48,54]);
assert.equal(impossibleUnderAnyPageSign.length,25);
assert.deepEqual(pageTrials.find(p=>p.page===2).validPlus,[]);
assert.deepEqual(pageTrials.find(p=>p.page===3).validMinus,[]);
assert.deepEqual(pageTrials.find(p=>p.page===3).validPlus,[]);

// Full original p56 authentic prime-totient/F skip positive.
// The native fourth ciphertext F must be taken literally.
const prime=[];
for(let n=2;prime.length<100;n++){
 let yes=true;for(const p of prime){if(p*p>n)break;if(n%p===0){yes=false;break;}}
 if(yes)prime.push(n);
}
let primeClock=0, fOrdinal=0;
const recovered56=[], recoveredC=[];
for(const c of sourceP56){
 const bypass=(c===0 && fOrdinal===3);
 if(c===0)fOrdinal++;
 if(bypass){recovered56.push(0);recoveredC.push(0);}
 else{
   const k=prime[primeClock++]-1;
   const p=mod29(c-k);
   recovered56.push(p);
   recoveredC.push(mod29(p+k));
 }
}
assert.equal(primeClock,84);
assert.deepEqual(recoveredC,sourceP56);
assert.equal(recovered56.map(v=>corpus.translit[v]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

// Independent source-native positive: all 26 native p57 plants using each
// phase and sign, with literal bypass of every plaintext F. A correct
// full-length source-derived cipher must survive this exact path test.
const nativePlants=[];
for(const sign of [-1,1]){
 for(let phase=0;phase<13;phase++){
   let consumed=0;
   const planted=nativeP57.map(p=>{
     if(p===0)return 0;
     const c=mod29(p-sign*key[(phase+consumed)%13]);
     consumed++;
     return c;
   });
   const result=exactFPaths(planted,key,sign,phase);
   assert.ok(result.valid);
   assert.ok(result.terminalKeyCounts.includes(consumed));
   nativePlants.push({sign,phase,plainRunes:nativeP57.length,consumed});
 }
}
assert.equal(nativePlants.length,26);
console.log(JSON.stringify({
 status:'PASS',
 model:'fixed historical FIRFUMFERENFE key, arbitrary initial phase, either arithmetic sign, exhaustive p56-like literal-F bypass on each ciphertext F',
 native2014KeyControl:'original LP1 first 36 runes exactly decoded, obsolete spelling fails at positions11 and24',
 originalCipherP0:{runes:sourceP0.length,cipherF:14,minusSurvivors:survivors(p0Minus),plusSurvivors:survivors(p0Plus),
  minusFirstImpossible:p0Minus.map(r=>r.firstImpossible)},
 originalCipherP1:{runes:sourceP1.length,cipherF:13,minusSurvivors:survivors(p1Minus),plusSurvivors:survivors(p1Plus),
  plusFirstImpossible:p1Plus.map(r=>r.firstImpossible)},
 wholeBookIndependentPageRekeys:{runeBearingUnknownPages:pageTrials.length,impossibleEvenWithAnyPhaseAndSign:impossibleUnderAnyPageSign},
 continuousP0P1:{runes:combined.length,
  minusSurvivors:survivors(combinedMinus),plusSurvivors:survivors(combinedPlus),
  plusEarliestFail:combinedPlus.map(r=>r.firstImpossible)},
 genuineP56PrimeTotient:{runes:sourceP56.length,primeConsumed:primeClock,exactRecovered:true},
 nativeP57Plant:{runs:nativePlants.length,eachExactAccepted:true,runes:nativeP57.length},
 decision:'Any consistent sign is incompatible with original p0 and p1; even independent sign and initial phase on every page cannot decrypt 25 original source pages including p3. No unknown plaintext recovered.'
},null,2));
