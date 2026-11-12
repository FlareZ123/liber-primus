'use strict';
/**
 * Exact all-secret additive-pad equality gate for the frozen original 2014
 * three-magic-square 99-cell prime-hole p55 placement.
 *
 * For C[i]=(P[i]+f(squareValue[i])) mod29, where f is an arbitrary secret
 * integer-to-GP29 function, identical printed numeric values must imply
 * P[i]-P[j] == C[i]-C[j] mod29.
 *
 * All 76 source p55 GP runes map to exactly 39 distinct numeric values
 * with 37 duplicate source-value pairs. No scalar key, phase or cipher
 * solver is assumed. Exhaust independent source-native contiguous GP29
 * windows in three English, Latin and corrected Old English corpora.
 *
 * Run: node sims/lp2_2014_primeholes_p55_allsecret_equalvalue_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} relative @returns {string} */
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ss=read('resources/cicada2014-openpuff-magic-squares.txt').trim()
  .split(/\r?\n\s*\r?\n/).map(part=>part.trim().split(/\r?\n/)
    .map(line=>line.trim().split(/\s+/).map(Number)));
/** @param {number} n @returns {boolean} */
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
assert.deepEqual(ss.map(s=>s.length),[5,7,5]);
assert.deepEqual(ss.map(s=>s[0].reduce((a,b)=>a+b,0)),[3301,1033,1033]);
const values=ss.flatMap((square,k)=>square.flat()
  .filter(value=>k===0||!isPrime(value)));
const cipher=db.pages.find(p=>p.page===55).indices;
assert.equal(values.length,76);
assert.equal(cipher.length,76);
/** @typedef {{i:number,j:number,expected:number,value:number}} Pair */
/** @type {Pair[]} */
const equalValuePairs=[];
for(let i=0;i<values.length;i++){
  for(let j=i+1;j<values.length;j++){
    if(values[i]===values[j])equalValuePairs.push({
      i,j,expected:(cipher[i]-cipher[j]+29)%29,value:values[i]
    });
  }
}
assert.equal(new Set(values).size,39);
assert.equal(equalValuePairs.length,37);
assert.equal(equalValuePairs[0].value,434);
assert.deepEqual(equalValuePairs.slice(0,2)
  .map(({i,j})=>[i,j]),[[0,24],[1,23]]);
assert.deepEqual(equalValuePairs.at(-1)
  ?[equalValuePairs.at(-1).i,equalValuePairs.at(-1).j]:null,[65,67]);
const token=db.translit.map((t,index)=>({t,index}))
  .sort((a,b)=>b.t.length-a.t.length);
/** @param {string} source @returns {number[]} */
function encodeGp(source){
  const norm=source.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(const word of norm.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      const t=token.find(t=>word.startsWith(t.t,i));
      assert(t,'Unmapped source GP '+word.slice(i));
      out.push(t.index);i+=t.t.length;
    }
  }
  return out;
}
const latinText=read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter(x=>x&&!x.trimStart().startsWith('#')).join('');
const latinAlphabet='0123456789ABCDEFGHIJKLMNOPQRS';
const oldEnglish=JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
/** @param {string} source @param {string} alphabet @returns {number[]} */
function fromGpBase29(source,alphabet){
  return Array.from(source,ch=>{
    const pos=alphabet.indexOf(ch);
    assert(pos>=0&&pos<29,'Invalid source GP radix symbol '+ch);
    return pos;
  });
}
const sources=[
  {name:'Gibran',runes:encodeGp(read('resources/control/gibran_prophet_58585.txt'))},
  {name:'Shakespeare',runes:encodeGp(read('resources/control/shakespeare_first300k.txt'))},
  {name:'Emerson',runes:encodeGp(read('resources/control/emerson_essays_2944.txt'))},
  {name:'Latin Vulgate',runes:fromGpBase29(latinText,latinAlphabet)},
  {name:'Old English Beowulf',runes:fromGpBase29(
    oldEnglish.sourceGpBase29,oldEnglish.positiveControlAlphabet)}
];
assert.deepEqual(sources.map(({runes})=>runes.length),
  [63114,218800,324630,204802,48012]);
const MOD=29;
/** @param {number[]} original @param {number} offset @returns {number} */
function agreement(original,offset){
  let matches=0;
  for(const {i,j,expected} of equalValuePairs){
    if((original[offset+i]-original[offset+j]+MOD)%MOD===expected)matches++;
  }
  return matches;
}
/** @type {Array<{source:string,sourceRunes:number,windows:number,maxMatched:number,atLeast10:number,exactMatches:number,firstBestOffset:number}>} */
const results=[];
for(const {name,runes} of sources){
  const freq=Array(equalValuePairs.length+1).fill(0);
  let maxMatched=0,firstBestOffset=0;
  for(let start=0;start<=runes.length-76;start++){
    const count=agreement(runes,start);
    freq[count]++;
    if(count>maxMatched){maxMatched=count;firstBestOffset=start;}
  }
  results.push({
    source:name,sourceRunes:runes.length,windows:runes.length-75,
    maxMatched,atLeast10:freq.slice(10).reduce((a,b)=>a+b,0),
    exactMatches:freq[37],firstBestOffset
  });
}
assert.deepEqual(results.map(x=>x.maxMatched),[9,10,8,9,8]);
assert.deepEqual(results.map(x=>x.atLeast10),[0,1,0,0,0]);
assert.equal(results.reduce((n,x)=>n+x.exactMatches,0),0);
const totalWindows=results.reduce((n,x)=>n+x.windows,0);
assert.equal(totalWindows,859983);
// Positive control: grant a wholly unrecorded secret GP29 additive pad per
// distinct original source integer. All 37 key-free constraints survive.
const planted=sources[1].runes.slice(1500,1576);
const printedValues=[...new Set(values)];
const secretPads=new Map(printedValues.map((v,i)=>[v,(i*11+7)%29]));
const encrypted=planted.map((p,i)=>(p+secretPads.get(values[i]))%29);
const decrypted=encrypted.map((c,i)=>(c-secretPads.get(values[i])+29)%29);
assert.deepEqual(decrypted,planted);
assert.deepEqual(encrypted.map((c,i)=>
  (c-secretPads.get(values[i])+29)%29),planted);
let plantedEqualities=0;
for(const {i,j} of equalValuePairs){
  if((encrypted[i]-encrypted[j]+29)%29===
    (planted[i]-planted[j]+29)%29)plantedEqualities++;
}
assert.equal(plantedEqualities,37);
const originalSelf=agreement(cipher,0);
assert.equal(originalSelf,37);
// Original fixed-target comparison: the planted constraint uses its own
// cipher deltas (not the original's), so it must never be scored as if
// the synthetic source happened to match the original unrelated output.
if(require.main===module)console.log(JSON.stringify({
  status:'PASS',
  classification:'complete original value-stationary additive-key family, conditional source register',
  exactP55OriginalRunes:cipher.length,
  squareSourcePositionRule:'all 3301-square cells plus composite 1033-square cells; 23 omitted primes in latter squares',
  sourceNumericValues:values.length,distinctSecretKeys:printedValues.length,
  independentEqualValueGP29Constraints:equalValuePairs.length,
  originalCipherSelfConsistency:originalSelf,
  nativeControls:results,totalWindows,
  nativeExactConstraintMatches:0,
  genuineNative76Plant:{
    originalRemainderRecovered:decrypted.length,
    secretIntegerPadCount:secretPads.size,all37SameIntegerConstraints:plantedEqualities
  },
  scopedDecision:'No one of the 859983 pinned source-native GP29 contiguous 76-rune English/Latin/Old English windows can invert under any value-stationary secret additive GP29 key with this exact proposed 2014 numeric placement; no unknown plaintext'
},null,2));
module.exports={encodeGp,agreement};
