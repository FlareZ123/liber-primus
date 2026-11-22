'use strict';

/**
 * Exact source-native plaintext-F bypass period bound for all four authentic
 * LP2 apostrophe sites. Searches every invertible shared affine slope, every
 * unknown repeated key of period 1..16, every source-attested contraction
 * option and every possible F consume/bypass history in the actual prefixes.
 *
 * A compatible period17 counterexample shows that the bound is sharp for
 * this exact source+candidate+model contract. It is not a plaintext recovery.
 *
 * SFT: node sims/lp2_apostrophe_shortperiod_nativef_allkeys_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const ann=JSON.parse(fs.readFileSync(path.join(root,
  'lp2-quote-punctuation-spans.json'),'utf8'));
const alpha=new Map(corpus.translit.map((v,i)=>[v,i]));
/** @param {number} n @param {number} d */
const mod=(n,d)=>(n%d+d)%d;
const dict3=['DONT','CANT','WONT','AINT','ISNT','LETS','GODS',
  'ONES','MANS','MENS','SHED','YOUD','ALLS'];
const dict2=['ITS','HES','WED','HED','ITD','DOS'];
const spec=[
 {page:4,start:161,globalSuffix:1110,word:"MXI'W",lex:dict3},
 {page:21,start:34,globalSuffix:5138,word:"AEO'Y",lex:dict2},
 {page:35,start:78,globalSuffix:8515,word:"PE'T",lex:dict2},
 {page:41,start:215,globalSuffix:10089,word:"XLJ'C",lex:dict3}
];
assert.equal(ann.source_visible_apostrophes.length,4);
assert.equal(corpus.pages.slice(0,56).reduce((n,p)=>n+p.indices.length,0),12956);
const sites=spec.map((s,i)=>{
 const a=ann.source_visible_apostrophes[i],full=corpus.pages[s.page].indices;
 assert.deepEqual([a.page,a.global_before_rune,a.cipher_word],
   [s.page,s.globalSuffix,s.word]);
 assert.equal(a.local_before_rune-a.stem_runes,s.start);
 const cipher=full.slice(s.start,a.local_before_rune+1);
 assert.equal(cipher.map(x=>corpus.translit[x]).join(''),
   s.word.replace("'",""));
 const letters=s.lex.map(w=>({word:w,plain:[...w].map(ch=>{
   const ix=alpha.get(ch);
   assert.ok(Number.isInteger(ix),'bad GP source candidate');
   return ix;
 })}));
 return {...s,prefix:full.slice(0,s.start),cipher,letters,
  fCount:full.slice(0,s.start).filter(x=>x===0).length};
});
assert.deepEqual(sites.map(s=>s.fCount),[5,0,1,9]);
const fullMask=(1<<29)-1;
/**
 * Every valid source ciphertext-F route, indexed by number of F bypasses.
 * 'forbidden[q]' has one bit for every consumed ciphertext symbol c at that
 * secret-key phase: K[q] may not equal c, or its inverse plaintext would
 * have been F and would have bypassed. A nonconsuming ciphertext F is
 * plaintext F and leaves the secret-key cursor fixed.
 *
 * @param {number[]} prefix @param {number} period
 * @returns {Array<Array<{forbidden:number[],skipped:number[]}>>}
 */
function histories(prefix,period) {
 const visited=[],forbidden=Array(period).fill(0);
 /** @param {number} i @param {number} bypasses @param {number[]} skipIndices */
 function visit(i,bypasses,skipIndices){
  if(i===prefix.length){
   visited.push({bypasses,forbidden:forbidden.slice(),skipped:skipIndices});
   return;
  }
  const c=prefix[i];
  if(c===0)visit(i+1,bypasses+1,skipIndices.concat(i));
  const slot=mod(i-bypasses,period),prev=forbidden[slot];
  forbidden[slot] |= 1<<c;
  visit(i+1,bypasses,skipIndices);
  forbidden[slot]=prev;
 }
 visit(0,0,[]);
 const out=Array.from({length:prefix.filter(x=>x===0).length+1},()=>[]);
 for(const result of visited)out[result.bypasses].push(result);
 return out;
}
/** @param {number[]} forb @param {Map<number,number>} key */
function allowed(forb,key){
 for(let i=0;i<forb.length;i++){
  const value=key.get(i);
  if(value!==undefined){
   if(forb[i]&(1<<value))return false;
  }else if(forb[i]===fullMask)return false;
 }
 return true;
}
/**
 * Enumerate *all* 28 slopes, literal candidate words, all valid preceding
 * plaintext-F skip counts, and consistency of common secret key slots.
 * For every fully compatible word tuple, exhaust *every* source-F history;
 * rejecting a tuple when even one prefix has no key-compatible path is
 * a sound necessary condition, and is sufficient to prove zero solutions.
 *
 * @param {number} period
 */
function rejectPeriod(period){
 const past=sites.map(s=>histories(s.prefix,period));
 let wordOnly=0,sourceCompatible=0;
 const earliestReject=Array(4).fill(0);
 for(let slope=1;slope<29;slope++){
  /** @param {number} depth @param {Map<number,number>} key @param {number[]} skips */
  function visit(depth,key,skips){
   if(depth===4){
    wordOnly++;
    for(let i=0;i<4;i++){
     if(!past[i][skips[i]].some(x=>allowed(x.forbidden,key))){
      earliestReject[i]++;
      return;
     }
    }
    sourceCompatible++;
    return;
   }
   const site=sites[depth];
   for(let skipped=0;skipped<past[depth].length;skipped++){
    for(const w of site.letters){
     const next=new Map(key);
     let valid=true;
     for(let j=0;j<w.plain.length;j++){
      const slot=mod(site.start-skipped+j,period);
      const value=mod(site.cipher[j]-slope*w.plain[j],29);
      if(next.has(slot)&&next.get(slot)!==value){valid=false;break;}
      next.set(slot,value);
     }
     if(valid)visit(depth+1,next,skips.concat(skipped));
    }
   }
  }
  visit(0,new Map(),[]);
 }
 return {period,wordOnly,sourceCompatible,earliestReject};
}
const outcomes=Array.from({length:16},(_,i)=>rejectPeriod(i+1));
assert.ok(outcomes.every(x=>x.sourceCompatible===0));
assert.deepEqual(outcomes.map(x=>x.wordOnly),
 [0,0,0,0,0,0,0,0,0,4,0,493,2118,12369,34227,1301]);
assert.deepEqual(outcomes[12].earliestReject,[2093,17,6,2]);
assert.deepEqual(outcomes[13].earliestReject.reduce((a,b)=>a+b),12369);
assert.deepEqual(outcomes[14].earliestReject.reduce((a,b)=>a+b),34227);
assert.deepEqual(outcomes[15].earliestReject.reduce((a,b)=>a+b),1301);

// Construct an *actual* key/prefix/word witness for period 17. This is a
// counterexample to extrapolating the bound to arbitrary periods, not an LP2
// decipherment. 13/17 key symbols are determined by fitted four words; the
// four other symbols are chosen only to avoid impossible plaintext-F events.
const period17=17,slope17=25;
const witnessWords=['ALLS','WED','WED','GODS'];
const witnessSkipped=[
 [12,41,64,86,112],[],[],[26,55,100,171,181]
];
const witnessKnown=new Map([
 [0,24],[1,17],[2,2],[3,28],[4,7],[5,3],[6,9],
 [7,3],[8,16],[9,7],[10,12],[11,3],[12,21]
]);
const combined=Array(period17).fill(0);
const prefixPlain=[];
let used=0;
for(let i=0;i<4;i++){
 const site=sites[i],skipSet=new Set(witnessSkipped[i]);
 assert.equal(skipSet.size,witnessSkipped[i].length);
 assert.ok([...skipSet].every(j=>site.prefix[j]===0));
 let count=0;
 const localPlain=[];
 for(let j=0;j<site.prefix.length;j++){
  const c=site.prefix[j];
  if(skipSet.has(j)){assert.equal(c,0);localPlain.push(0);count++;continue;}
  const slot=mod(j-count,period17);
  combined[slot] |= 1<<c;
  localPlain.push(null);
 }
 prefixPlain.push(localPlain);
 for(let j=0;j<site.cipher.length;j++){
  const gp=alpha.get(witnessWords[i][j]);
  const slot=mod(site.start-count+j,period17);
  assert.equal(mod(slope17*gp+witnessKnown.get(slot),29),
    site.cipher[j]);
 }
 used+=count;
}
assert.equal(used,10);
const key17=Array.from({length:period17},(_,i)=>{
 if(witnessKnown.has(i))return witnessKnown.get(i);
 for(let k=0;k<29;k++)if(!(combined[i]&(1<<k)))return k;
 throw Error('Cannot extend source-true period17 witness at slot '+i);
});
assert.ok(key17.every(Number.isInteger));
for(let i=0;i<period17;i++)assert.ok(!(combined[i]&(1<<key17[i])));
let nativeInverse=7;
assert.equal(mod(nativeInverse*slope17,29),1);
const prefixRoundtrips=[];
for(let i=0;i<4;i++){
 const site=sites[i],skipSet=new Set(witnessSkipped[i]);
 let cursor=0,decoded=[];
 for(let j=0;j<site.prefix.length;j++){
  const c=site.prefix[j];
  if(skipSet.has(j)){decoded.push(0);continue;}
  const slot=mod(cursor,period17),p=mod((c-key17[slot])*nativeInverse,29);
  assert.notEqual(p,0,'encrypted native F should have bypassed');
  assert.equal(mod(slope17*p+key17[slot],29),c);
  decoded.push(p);cursor++;
 }
 assert.deepEqual(decoded.filter((_,j)=>site.prefix[j]===0&&skipSet.has(j)),
   Array(skipSet.size).fill(0));
 for(let j=0;j<witnessWords[i].length;j++){
  const p=alpha.get(witnessWords[i][j]);
  assert.equal(mod(slope17*p+key17[mod(cursor+j,period17)],29),
    site.cipher[j]);
 }
 prefixRoundtrips.push({page:site.page,cipherPrefixRunes:site.prefix.length,
  sourceFEvents:site.fCount,bypassedF:skipSet.size,
  candidate:witnessWords[i]});
}
assert.equal(prefixRoundtrips.length,4);

// Positive planted real native-F bypass for the historically relevant L=8
// and L=13, plus L=17, using the exact original prefix lengths and original
// ciphertext-F positions. Original ciphertext is never overwritten.
const plants=[];
for(const period of [8,13,17]){
 const secretKey=Array.from({length:period},(_,k)=>(3*k+4)%21+1);
 assert.ok(!secretKey.includes(22)); // U (index1)*7 never encrypts to F
 let passed=0;
 for(let i=0;i<4;i++){
  const site=sites[i],cipher=[];
  let cursor=0;
  for(const c of site.prefix){
   if(c===0)cipher.push(0); // true plaintext-F bypass
   else {cipher.push(mod(7+secretKey[cursor%period],29));cursor++;}
  }
  assert.deepEqual(cipher.map((v,j)=>v===0?j:-1).filter(j=>j>=0),
   site.prefix.map((v,j)=>v===0?j:-1).filter(j=>j>=0));
  let sourcePos=0,decClock=0;
  for(const ci of cipher){
   if(ci===0){assert.equal(site.prefix[sourcePos],0);sourcePos++;continue;}
   const p=mod((ci-secretKey[decClock%period])*25,29);
   assert.equal(p,1);
   decClock++;sourcePos++;
  }
  for(let j=0;j<site.letters[0].plain.length;j++){
   const p=site.letters[0].plain[j];
   const cc=mod(7*p+secretKey[(cursor+j)%period],29);
   assert.equal(mod((cc-secretKey[(cursor+j)%period])*25,29),p);
  }
  passed++;
 }
 plants.push({period,positiveSites:passed});
}
console.log(JSON.stringify({
 source:'four original ink-verified LP2 apostrophe words and exact prefixes',
 model:'C=aP+K[t modL] in GP29, common slope and unknown K, literal-F nonconsuming',
 pageReset:true,candidateWordCounts:[13,6,6,13],
 enumeratedPeriods:outcomes,
 minimumAdmissiblePeriod:17,
 period17Counterexample:{slope:slope17,key:key17,
  words:witnessWords,skippedPositions:witnessSkipped,prefixRoundtrips},
 syntheticPositivePlants:plants,
 conclusion:'No period 1..16 can fit the authentic four prefixes under fixed English contraction dictionary; period17 fits algebraically, with no proven genuine plaintext or author key'
},null,2));
