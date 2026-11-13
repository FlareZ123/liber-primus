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
console.log(JSON.stringify({
  status:"NO ORIGINAL LP2 PLAINTEXT RECOVERED",
  originalP55SourceRunes:p55.length, completeBodyRunes:body.length,
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
  exactInverseAndSourcePositivePlant:true
},null,2));
