"use strict";
/**
 * Cross-round original-source lead: the thirteen printed word cells of
 * LP1 p05 SOME WISDOM concatenate to exactly 76 GP29 runes, precisely the
 * full original length of moth-linked LP2 p55. Frozen row-major printed
 * order and six direct additive inverses. In addition, the authentic
 * prime-totient plaintext-F bypass is tested for both visually justified
 * key orientations and all eight possible original ciphertext-F masks.
 * No phase, altered words, fitted alphabet or guessed plaintext.
 * Windows 11 / Node.js 22:
 * node sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT=path.join(__dirname,"..");
const read = file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const anchor="272-138-";
assert.equal(lp1.indexOf(anchor),lp1.lastIndexOf(anchor));
const rows=lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0,5)
  .map(line=>line.replace(/\/$/,"").split("-"));
assert.deepEqual(rows.map(row=>row.length),[5,5,5,5,5]);
const wordCells=rows.flatMap(row=>row.filter(cell=>!/^[0-9]+$/.test(cell)));
assert.equal(wordCells.length,13);
const wordNames=wordCells.map(cell=>cell.split("")
  .map(rune=>book.translit[book.runes.indexOf(rune)]).join(""));
assert.deepEqual(wordNames,[
  "SHADOWS","AETHEREAL","BUFFERS","UOID","CARNAL","OBSCURA",
  "FORM","MOBIUS","ANALOG","UOID","MOURNFUL","AETHEREAL","CABAL"
]);
const lengths=wordCells.map(word=>word.length);
assert.deepEqual(lengths,[7,6,7,4,6,7,4,6,6,4,8,6,5]);
const key=wordCells.join("").split("").map(rune=>book.runes.indexOf(rune));
assert.ok(key.every(x=>x>=0&&x<29));
assert.equal(key.length,76);
const p55=book.pages.find(page=>page.page===55).indices;
const p57=book.pages.find(page=>page.page===57).indices;
assert.equal(p55.length,76);
assert.equal(p57.length,95);
/** @param {number} x @returns {number} */
const mod29=x=>(x%29+29)%29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const frequencies=Array(29).fill(0);
  for(const x of a){assert.ok(x>=0&&x<29);frequencies[x]++;}
  return frequencies.reduce((n,v)=>n+v*(v-1),0)/(a.length*(a.length-1));
}
function run() {
  const expected={
    GPIndex:[0.03859649122807018,0.030175438596491227],
    GPPrime:[0.04,0.04105263157894737],
    GPTotient:[0.04,0.04105263157894737]
  };
  const representations=[
    ["GPIndex",i=>key[i]],
    ["GPPrime",i=>book.prime[key[i]]%29],
    ["GPTotient",i=>(book.prime[key[i]]-1)%29]
  ];
  const candidates=[];
  for(const [name,k] of representations)for(const sign of [-1,1]){
    const decoded=p55.map((c,i)=>mod29(c+sign*k(i)));
    assert.deepEqual(decoded.map((p,i)=>mod29(p-sign*k(i))),p55,
      "All 76 unchanged p55 runes must reencrypt exactly.");
    const nativePlant=p57.slice(0,76);
    const encrypted=nativePlant.map((p,i)=>mod29(p-sign*k(i)));
    assert.deepEqual(encrypted.map((c,i)=>mod29(c+sign*k(i))),nativePlant,
      "Source-native solved p57 76-rune plant must invert.");
    const observed=ioc(decoded);
    assert.ok(Math.abs(observed-expected[name][sign===-1?0:1])<1e-14);
    assert.ok(observed<0.05,"No output can be promoted as ordinary GP prose.");
    candidates.push({representation:name,decodeSign:sign,originalRunes:76,
      plaintextIoC:observed,translit:decoded.map(x=>book.translit[x]).join("")});
  }
  // Solved p56 gives the strict forward rule: if plaintext P=F, then the
  // ciphertext MUST be F with no key consumption. Ciphertext C=F may also
  // result from encrypting a non-F plaintext. Exhaust both meanings for all
  // three actual source C=F positions, without any language-model fitting.
  const cipherFs=p55.flatMap((v,i)=>v===0?[i]:[]);
  assert.deepEqual(cipherFs,[15,25,41]);
  /**
   * @param {number[]} fixedKey An actual p05 source-printed 76-rune order
   * @param {number[]} ciphertext Exactly original unmodified source runes
   * @param {number} mask One bit per source ciphertext-F location
   * @returns {{skipPositions:number[], forbiddenPlainF:number[], consumed:number, ioc:number}}
   */
  function sourceStrictFDecode(fixedKey,ciphertext,mask) {
    const skipPositions=cipherFs.filter((_,j)=>(mask&(1<<j))!==0);
    const skipped=new Set(skipPositions),decoded=[],forbiddenPlainF=[];
    let clock=0;
    for(let i=0;i<ciphertext.length;i++){
      if(skipped.has(i)){decoded.push(0);continue;}
      const k=(book.prime[fixedKey[clock++]]-1)%29;
      const p=mod29(ciphertext[i]-k);
      decoded.push(p);
      if(p===0)forbiddenPlainF.push(i);
    }
    return {skipPositions,forbiddenPlainF,consumed:clock,ioc:ioc(decoded)};
  }
  // The source p05 original JPEG contains A||center||reverse(A), so a
  // complete literal reverse of the printed rune tape is a meaningful
  // second orientation. Do not invent rotations or phases.
  const strictVariants=[
    ["printed",key],
    ["reversed",key.slice().reverse()]
  ].map(([order,fixedKey])=>{
    const candidates=Array.from({length:8},(_,mask)=>{
      const result=sourceStrictFDecode(fixedKey,p55,mask);
      assert.ok(result.forbiddenPlainF.length>0,
        "Every original F interpretation must fail this exact cipher key.");
      return {mask,...result};
    });
    return {order,viableMasks:candidates.filter(x=>!x.forbiddenPlainF.length).length,
      candidates};
  });
  assert.deepEqual(strictVariants.map(x=>x.viableMasks),[0,0]);
  // Stronger, local, key-independent-of-future-mask contradictions:
  // printed key at i13 gives encrypted P=F while source C=TH, before
  // any ciphertext F can shift the clock; reversed key at i20 gives
  // encrypted P=F under both possible earlier F15 decisions.
  assert.equal(p55[13],2); // TH
  assert.equal(p55[20],1); // U
  assert.equal((book.prime[key[13]]-1)%29,2);
  const reversedKey=key.slice().reverse();
  assert.equal((book.prime[reversedKey[20]]-1)%29,1);
  assert.equal((book.prime[reversedKey[19]]-1)%29,1);
  for(const candidate of strictVariants[0].candidates)
    assert.ok(candidate.forbiddenPlainF.includes(13));
  for(const candidate of strictVariants[1].candidates)
    assert.ok(candidate.forbiddenPlainF.includes(20));
  // The first p55 rune NG is visibly carried over from p54. Test the
  // independent, original-source 75-rune complete-word body clock too,
  // with its unique four lossless 75-of-76 source-key end alignments
  // (printed/reversed, drop final/initial key rune), all eight historical
  // F interpretations, and no other phase or inserted rune.
  const p55CompleteBody=p55.slice(1);
  const bodyF=p55CompleteBody.flatMap((v,i)=>v===0?[i]:[]);
  assert.deepEqual(bodyF,[14,24,40]);
  const bodyKeys=[
    ["printedFirst75",key.slice(0,75)],
    ["printedLast75",key.slice(1)],
    ["reversedFirst75",reversedKey.slice(0,75)],
    ["reversedLast75",reversedKey.slice(1)]
  ];
  const strictBodyVariants=bodyKeys.map(([order,fixedKey])=>{
    const masks=Array.from({length:8},(_,mask)=>{
      const skipped=new Set(bodyF.filter((_,j)=>(mask&(1<<j))!==0));
      let consumed=0;
      const forbiddenPlainF=[];
      for(let i=0;i<p55CompleteBody.length;i++){
        if(skipped.has(i))continue;
        const p=mod29(p55CompleteBody[i]-(book.prime[fixedKey[consumed++]]-1));
        if(p===0)forbiddenPlainF.push(i);
      }
      assert.ok(forbiddenPlainF.length>=1,
        `The source body key ${order}, F mask ${mask} must violate the historical F rule.`);
      return {mask,consumed,forbiddenPlainF};
    });
    return {order,viableMasks:masks.filter(x=>!x.forbiddenPlainF.length).length,
      minForbiddenPositions:Math.min(...masks.map(x=>x.forbiddenPlainF.length))};
  });
  assert.deepEqual(strictBodyVariants.map(v=>v.viableMasks),[0,0,0,0]);
  // Genuine solved-p57 GP plaintext plant under exactly the historical
  // strict plaintext-F forward emitter, using the immutable p05 key.
  const nativeOriginal=p57.slice(0,76);
  const nativeCipher=[];let originalClock=0;
  for(const p of nativeOriginal){
    if(p===0)nativeCipher.push(0);
    else nativeCipher.push(mod29(p+(book.prime[key[originalClock++]]-1)));
  }
  const knownLiteralF=new Set(nativeOriginal.flatMap((v,i)=>v===0?[i]:[]));
  const nativeRecovered=[];let recoveredClock=0;
  for(let i=0;i<nativeCipher.length;i++){
    if(knownLiteralF.has(i)){assert.equal(nativeCipher[i],0);nativeRecovered.push(0);}
    else nativeRecovered.push(mod29(nativeCipher[i]-(book.prime[key[recoveredClock++]]-1)));
  }
  assert.deepEqual(nativeRecovered,nativeOriginal);
  assert.equal(recoveredClock,originalClock);
  const xored=p55.map((v,i)=>v^key[i]);
  assert.equal(xored.filter(x=>x>=29).length,8,
    "Ordinary five-bit XOR leaks symbols outside the native 29-rune inventory");
  const result={firstPartySource:"LP1 p05 mixed 5x5 GP words and original LP2 p55",
    originalCopiedMothPages:["LP1 p05","LP2 p53","LP2 p55"],
    p05WordCellCount:wordCells.length,
    p05WordCellLengths:lengths,
    p05WordTapeGP29:key.length,p55CiphertextGP29:p55.length,
    exactFullLengthMatch:key.length===p55.length,
    sourceKeyWordNames:wordNames,p55OriginalIoC:ioc(p55),
    positivePlantSource:"Solved p57 first 76 original clear GP runes",
    directAdditiveCandidates:candidates,
    strictFPrimeTotient:{originalCipherFPositions:cipherFs,
      keyOrders:strictVariants,firstIllegalPairPrinted:{position:13,cipherGP:2,keyPhi:2},
      firstIllegalPairReversed:{position:20,cipherGP:1,
        keyPhiWithZeroOrOneEarlierSkip:[1,1]},
      genuineP57PlantRecovered:76,
      strict75RunicCompleteBodyVariants:strictBodyVariants},
    fiveBitOrdinalXOROutOfAlphabet:xored.filter(x=>x>=29).length,
    verdict:"A source-tape 76/76 fit, but all direct inverses are nonprose and every F-skip interpretation of the historical prime-totient cipher is structurally impossible in both printed and reversed key order, including all four natural p55 complete-word 75-rune body alignments."};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,ioc};
