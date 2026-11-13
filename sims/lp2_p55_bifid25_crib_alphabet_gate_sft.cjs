"use strict";
/**
 * Terminal p55 5x5 coordinate-fractionation gate.
 *
 * Conditional question: Can the moth-selected LP1 p5 5x5 square
 * identify an ordinary closed-alphabet Bifid cipher for p55's complete
 * 75-rune body, especially the original LP1 p5 terminal-seven-word crib?
 *
 * SFT: node sims/lp2_p55_bifid25_crib_alphabet_gate_sft.cjs
 * Original source only; reversible source-positive plant; no parameter fit.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const p55 = gp.pages[55].indices;
assert.equal(p55.length, 76);
assert.equal(gp.translit[p55[0]], "NG"); // incoming p54 word carry
const body = p55.slice(1);
assert.equal(body.length, 75);
const wordLengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(wordLengths.reduce((a, b) => a + b, 0), body.length);
const symbols = [...new Set(body)].sort((a, b) => a - b);
assert.equal(symbols.length, 25);
const symbolSet = new Set(symbols);
const missing = gp.translit.filter((_, i) => !symbolSet.has(i));
assert.deepEqual(missing, ["O","N","T","Y"]);

// In ANY 5x5 Bifid cipher with one stationary 25-symbol alphabet,
// plaintext and ciphertext symbols MUST belong to the same codebook.
// All 25 visible p55 body symbols occur, so the codebook is forced
// setwise, independent of every one of the 25! keyed tableaux.
const phrase = "THE TOTIENT FUNCTION IS SACRED ALL THINGS";
const phraseWords = phrase.split(" ");
assert.deepEqual(phraseWords.map(w => encodeSourceNativeGP(w).length),
  wordLengths.slice(9));
const crib = encodeSourceNativeGP(phrase);
assert.equal(crib.length, 30);
const cribMissing = [...new Set(crib.filter(v => !symbolSet.has(v)))]
  .sort((a,b) => a-b).map(i => gp.translit[i]);
assert.deepEqual(cribMissing, ["O","N","T"]);
const suffix = body.slice(45);
assert.deepEqual(suffix, p55.slice(46));
assert.equal(suffix.length, crib.length);

const toSlot = new Map(symbols.map((s, i) => [s, i]));
const sourceSlots = body.map(s => toSlot.get(s));
// A closed-25 Playfair on all 76 page-local glyphs is key-independent
// impossible: classic Playfair never emits a doubled digraph pair,
// whereas the literal original p55 [58,59] is doubled TH|TH.
const doubledPlayfairPairs=[];
for(let i=0;i+1<p55.length;i+=2){
  if(p55[i]===p55[i+1])doubledPlayfairPairs.push(i);
}
assert.deepEqual(doubledPlayfairPairs,[58]);

// Quantify the risk of retrospectively selecting exactly 25 symbols:
// iid-uniform GP29 with 75 draws gives ~9.49% exactly 25 distinct
// and ~12.88% at most 25. This is a source-shape calibration only.
let occupancy=Array(30).fill(0);
occupancy[0]=1;
for(let n=0;n<75;n++){
  const next=Array(30).fill(0);
  for(let k=0;k<=29;k++){
    next[k]+=occupancy[k]*k/29;
    if(k<29)next[k+1]+=occupancy[k]*(29-k)/29;
  }
  occupancy=next;
}
const iidExactly25=occupancy[25];
const iidAtMost25=occupancy.slice(0,26).reduce((a,b)=>a+b,0);
assert.ok(Math.abs(iidExactly25-0.09490305349532854)<1e-13);
assert.ok(Math.abs(iidAtMost25-0.12882653184111686)<1e-13);
/**
 * Textbook Bifid fractionation. Inverse works for every 5x5 tableau,
 * because a secret tableau simply permutes the 25 slot labels.
 * @param {number[]} text - integer slots 0..24
 * @param {number} period - reset every period runes
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function bifid(text, period, decrypt) {
  const result = [];
  for (let off = 0; off < text.length; off += period) {
    const v = text.slice(off, off + period);
    const coords = [];
    if (decrypt) {
      for (const x of v) coords.push(Math.floor(x / 5), x % 5);
      for (let j = 0; j < v.length; j++)
        result.push(5 * coords[j] + coords[v.length + j]);
    } else {
      for (const x of v) coords.push(Math.floor(x / 5));
      for (const x of v) coords.push(x % 5);
      for (let j = 0; j < v.length; j++)
        result.push(5 * coords[2*j] + coords[2*j+1]);
    }
  }
  assert(result.every(i => Number.isInteger(i) && i >= 0 && i < 25));
  return result;
}
/** @param {number[]} data */
function ioc(data) {
  const counts = new Uint32Array(29);
  for (const x of data) counts[x]++;
  return counts.reduce((a, n) => a + n*(n-1), 0) /
    (data.length * (data.length - 1));
}
// These three source-motivated periods are not authenticated as cipher
// clocks: 5 dots, a 25-cell square, and 75 complete p55 body runes.
const trials = [];
for (const period of [5,25,75]) {
  const output = bifid(sourceSlots, period, true);
  assert.deepEqual(bifid(output, period, false), sourceSlots);
  const gpOut = output.map(slot => symbols[slot]);
  trials.push({period, decodedIoC:ioc(gpOut),
    decodedGpPrefix:gpOut.slice(0,50).map(i => gp.translit[i]).join("")});
  // Independent native-source alphabet-positive plant.
  const plant = encodeSourceNativeGP(
    "ALL THINGS SHOULD BE ENCRYPTED KNOW THIS");
  const plantSlots = plant.map(i => i % 25);
  assert.deepEqual(bifid(bifid(plantSlots,period,false),period,true),
    plantSlots);
}
assert.equal(trials.length, 3);
const wordfreq = fs.readFileSync(path.join(
  root, "resources", "control", "english_wordfreq_textblob.txt"), "utf8");
const longWords = wordfreq.split(/\r?\n/).map(line =>
  line.split(/\s+/)[0]).filter(s => /^[a-z]+$/.test(s));
const word13 = longWords.filter(s => encodeSourceNativeGP(s).length === 13);
const possible13 = word13.filter(s =>
  encodeSourceNativeGP(s).every(i => symbolSet.has(i)));
assert(word13.length > 100 && possible13.length < word13.length);
assert.deepEqual(possible13, [
  "circumscribed","circumscribes","irrepressible",
  "schimmelbusch","shepherdesses","subscapularis"
]);
/**
 * Necessary secret-tableau conditions for a period-N Bifid crib.
 * Every cipher symbol has one fixed row and one fixed column. Bifid
 * imposes coordinate equalities across the complete 75-rune body.
 * A 5x5 tableau fails if any distinct original glyphs are forced
 * into the same (row,column) cell or >5 glyphs share one axis.
 * No cell coordinates or secret key are guessed.
 *
 * @param {(number|null)[]} partialPlain
 * @param {number[]} sourceCipher
 * @param {number} period
 */
function cribTableauGate(partialPlain, sourceCipher, period) {
  assert.equal(partialPlain.length,75);
  assert.equal(sourceCipher.length,75);
  const parent=Array.from({length:50},(_,i)=>i);
  const root=i=>{
    while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}
    return i;
  };
  const union=(a,b)=>{
    a=root(a);b=root(b);
    if(a!==b) parent[b]=a;
  };
  const variable=(symbol,axis)=>{
    const slot=toSlot.get(symbol);
    assert.notEqual(slot,undefined,"crib uses a glyph outside the fixed 25");
    return 2*slot+axis;
  };
  for(let off=0;off<75;off+=period){
    const count=Math.min(period,75-off);
    for(let j=0;j<count;j++) for(let axis=0;axis<2;axis++){
      const index=2*j+axis;
      const p=off+(index%count);
      if(partialPlain[p]===null)continue;
      union(variable(sourceCipher[off+j],axis),
        variable(partialPlain[p],index<count?0:1));
    }
  }
  const cells=new Set(),rowSizes=new Map(),colSizes=new Map();
  let duplicateCells=0;
  for(let i=0;i<25;i++){
    const row=root(2*i),col=root(2*i+1);
    const key=row+","+col;
    if(cells.has(key))duplicateCells++;
    cells.add(key);
    rowSizes.set(row,(rowSizes.get(row)||0)+1);
    colSizes.set(col,(colSizes.get(col)||0)+1);
  }
  const largestRow=Math.max(...rowSizes.values());
  const largestCol=Math.max(...colSizes.values());
  return {
    period,duplicateCells,largestRow,largestCol,
    possible:duplicateCells===0&&largestRow<=5&&largestCol<=5
  };
}
const sourceCipherWord13=body.slice(22,35);
assert.equal(sourceCipherWord13.length,13);
const originalThirteenWordGates=possible13.map(word=>{
  const plain=Array(75).fill(null);
  encodeSourceNativeGP(word).forEach((v,j)=>{plain[22+j]=v;});
  const gates=[5,25,75].map(period=>
    cribTableauGate(plain,body,period));
  assert(gates.every(g=>!g.possible && g.duplicateCells>0));
  return {word,gates};
});
// A real Bifid25 forward encryption MUST pass precisely the same
// key-independent original-word graph gate, for all three periods.
const plantPlain=sourceSlots.slice();
const plantWord=encodeSourceNativeGP(possible13[0]);
plantWord.forEach((v,j)=>{
  const slot=toSlot.get(v);
  assert.notEqual(slot,undefined);
  plantPlain[22+j]=slot;
});
const positivePlain=Array(75).fill(null);
plantWord.forEach((v,j)=>{positivePlain[22+j]=v;});
for(const period of [5,25,75]){
  const plantCipher=bifid(plantPlain,period,false).map(x=>symbols[x]);
  const gate=cribTableauGate(positivePlain,plantCipher,period);
  assert.deepEqual(gate,{
    period,duplicateCells:0,largestRow:gate.largestRow,
    largestCol:gate.largestCol,possible:true
  });
  assert.ok(gate.largestRow<=5&&gate.largestCol<=5);
}
// Stronger moth-crib conditional gate: allow ANY four of 29 glyphs
// to remain literal transparent bypass symbols. Each bypass glyph
// must occur at identical P/C positions in the fixed suffix. This
// immediately reduces 23,751 arbitrary bypass choices to FIVE.
// Apply the same key-free coordinate constraints to the 25 remaining
// core symbols with transparent positions skipped from the core clock.
const bypassEligible=gp.translit.map((_,i)=>i).filter(glyph=>
  crib.every((plain,j)=>
    (plain===glyph)===(suffix[j]===glyph)));
assert.deepEqual(bypassEligible.map(i=>gp.translit[i]),
  ["W","H","P","AE","Y"]);
/**
 * Test any secret ordered 5x5 core tableau, with literal skips.
 * @param {number[]} originalCipher
 * @param {(number|null)[]} partialPlain
 * @param {number[]} bypass
 * @param {number} period
 */
function bypassTableauGate(originalCipher,partialPlain,bypass,period){
  assert.equal(originalCipher.length,75);
  assert.equal(partialPlain.length,75);
  assert.equal(bypass.length,4);
  const bypassSet=new Set(bypass);
  const coreAlphabet=gp.translit.map((_,i)=>i)
    .filter(i=>!bypassSet.has(i));
  const coreIndex=new Map(coreAlphabet.map((v,i)=>[v,i]));
  const coreCipher=[],coreKnown=[];
  for(let i=0;i<75;i++){
    const c=originalCipher[i],p=partialPlain[i];
    if(bypassSet.has(c)){
      if(p!==null)assert.equal(p,c,"literal transparent symbol");
    }else{
      if(p!==null)assert.ok(!bypassSet.has(p));
      coreCipher.push(c);
      coreKnown.push(p);
    }
  }
  const parent=Array.from({length:50},(_,i)=>i);
  const root=i=>{
    while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}
    return i;
  };
  const union=(a,b)=>{
    a=root(a);b=root(b);
    if(a!==b)parent[a]=b;
  };
  const v=(glyph,axis)=>{
    const index=coreIndex.get(glyph);
    assert.notEqual(index,undefined);
    return 2*index+axis;
  };
  for(let off=0;off<coreCipher.length;off+=period){
    const count=Math.min(period,coreCipher.length-off);
    for(let j=0;j<count;j++)for(let axis=0;axis<2;axis++){
      const index=2*j+axis,k=off+(index%count);
      if(coreKnown[k]===null)continue;
      union(v(coreCipher[off+j],axis),
        v(coreKnown[k],index<count?0:1));
    }
  }
  const cells=new Set(),rows=new Map(),cols=new Map();
  let duplicateCells=0;
  for(let i=0;i<25;i++){
    const row=root(2*i),col=root(2*i+1);
    const cell=row+","+col;
    if(cells.has(cell))duplicateCells++;
    cells.add(cell);
    rows.set(row,(rows.get(row)||0)+1);
    cols.set(col,(cols.get(col)||0)+1);
  }
  const largestRow=Math.max(...rows.values()),
    largestCol=Math.max(...cols.values());
  return {period,coreRunes:coreCipher.length,
    duplicateCells,largestRow,largestCol,
    possible:duplicateCells===0&&largestRow<=5&&largestCol<=5};
}
/**
 * Original alphabet 29, four transparent symbols, 25-symbol Bifid.
 * @param {number[]} originalPlain
 * @param {number[]} bypass
 * @param {number} period
 */
function encryptBypassPlant(originalPlain,bypass,period){
  const bypassSet=new Set(bypass);
  const coreAlphabet=gp.translit.map((_,i)=>i)
    .filter(i=>!bypassSet.has(i));
  const key=new Map(coreAlphabet.map((v,i)=>[v,i]));
  const out=Array(75).fill(-1),positions=[],core=[];
  for(let i=0;i<75;i++){
    if(bypassSet.has(originalPlain[i]))out[i]=originalPlain[i];
    else{
      positions.push(i);
      core.push(key.get(originalPlain[i]));
    }
  }
  const encrypted=bifid(core,period,false);
  positions.forEach((pos,j)=>{out[pos]=coreAlphabet[encrypted[j]];});
  assert.ok(out.every(v=>v>=0&&v<29));
  return out;
}
const partialMothPlain=Array(75).fill(null);
crib.forEach((v,j)=>{partialMothPlain[45+j]=v;});
// Periods 1..75 EXHAUST every different continuous-body Bifid
// period: larger periods take one full body block (at most75 core).
const allPeriods=Array.from({length:75},(_,i)=>i+1);
const bypassAllSecretResults=[];
for(const omit of bypassEligible){
  const bypass=bypassEligible.filter(v=>v!==omit);
  const allGates=allPeriods.map(period=>
    bypassTableauGate(body,partialMothPlain,bypass,period));
  assert(allGates.every(g=>!g.possible));
  const gates=allGates.filter(g=>[5,25,75].includes(g.period));
  assert(gates.every(g=>g.duplicateCells>0));
  bypassAllSecretResults.push({
    bypass:bypass.map(v=>gp.translit[v]),
    periodsChecked:allGates.length,
    originalPeriodsCompatible:allGates.filter(g=>g.possible).length,
    sourceShapePeriods:gates
  });
  const plant=Array(75).fill(0);
  crib.forEach((v,j)=>{plant[45+j]=v;});
  for(const period of allPeriods){
    const positive=encryptBypassPlant(plant,bypass,period);
    const gate=bypassTableauGate(positive,partialMothPlain,bypass,period);
    assert.equal(gate.duplicateCells,0);
    assert.equal(gate.possible,true);
  }
}
console.log(JSON.stringify({
  status:"NO ORIGINAL LP2 PLAINTEXT RECOVERED",
  originalP55SourceRunes:p55.length, completeBodyRunes:body.length,
  uniformIidExactly25DistinctIn75:iidExactly25,
  uniformIidAtMost25DistinctIn75:iidAtMost25,
  pageLocalPlayfair25DoubledPairs:doubledPlayfairPairs,
  completeBodyWords:wordLengths.length, bodySymbols:symbols.length,
  missingOriginalBodySymbols:missing,
  sourceLinkedCrib:phrase, sourceLinkedCribLength:crib.length,
  cribOutsideEveryPossibleClosed25Alphabet:cribMissing,
  excludes:"any standard closed-25-symbol Bifid tableau and " +
    "period for the exact proposed p5 seven-word plaintext",
  doesNotExclude:"other p55 plaintext, changing alphabets, a 29-rune " +
    "register, extra substitutions, word-order transformations",
  sourceSorted5x5TrialIoCs:trials, rawP55BodyIoC:ioc(body),
  pinnedLexiconGP13Count:word13.length,
  lexicalGP13AllowedByOriginal25Set:possible13.length,
  allowedLexicalGP13Samples:possible13.slice(0,25),
  exactOriginalP55SeventhWordGP:sourceCipherWord13.map(i=>gp.translit[i]).join(""),
  allSecret5x5ThirteenWordGates:originalThirteenWordGates,
  allSecretBifidPositivePlants:[5,25,75],
  mothCribTransparentBypassEligible:bypassEligible.map(v=>gp.translit[v]),
  allBypassPeriodModelsExcluded:375,
  allBypassPeriodModelsPositivePlants:375,
  allSecretFourTransparentBypassGates:bypassAllSecretResults,
  exactInverseAndSourcePositivePlant:true
},null,2));
