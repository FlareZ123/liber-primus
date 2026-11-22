"use strict";
/**
 * Original LP2 across-word feedback vs reset-word/postfilter identification.
 * Any continuous invertible GP29 transducer can be factored into a word-local
 * bijection and a page-global invertible postfilter. This SFT supplies exact
 * reversible concrete rivals, full original-word/carry accounting, heldout
 * boundary counts, and native-GP plants.
 *
 * Run with Node.js >=20: node sims/lp2_wordjoin_state_postfilter_equivalence_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeEnglish,seededRandom} = require("./outer_permutation_assignment.cjs");
const root = path.join(__dirname,"..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length,12956);
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(parsed.runeCount,original.length);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.crossPageWords,32);
const pageStarts = new Set(), pageOf = [];
let offset = 0;
for (const page of pages) {
  pageStarts.add(offset);
  for (let i=0;i<page.indices.length;i++) pageOf.push(page.page);
  offset += page.indices.length;
}
assert.equal(pageOf.length,original.length);
const wordStarts = new Set(),lengthByPosition = [];
let wOffset = 0;
for (const word of parsed.words) {
  wordStarts.add(wOffset);
  for (let i=0;i<word.length;i++) lengthByPosition.push(word.length);
  wOffset += word.length;
}
assert.equal(wOffset,original.length);
const mod = n => ((n % 29) + 29) % 29;

/**
 * Architecture A: a bijection whose 29-symbol state is the last ciphertext
 * symbol, carried through every printed word join; physical pages reset.
 * For non-leaders C = (P + previous_C + 1) modulo29.
 * @param {number[]} plaintext
 * @returns {number[]}
 */
function continuous(plaintext) {
  const out = [];
  for (let i=0;i<plaintext.length;i++) {
    out.push(pageStarts.has(i) ? plaintext[i] :
      mod(plaintext[i] + out[i-1] + 1));
  }
  return out;
}

/**
 * Architecture B: word-local bijection U = (P + word_length) modulo29,
 * reset for every printed word, followed by a page-global, invertible
 * no-repeat-biased feedback postfilter. Each stage is independently invertible
 * with printed word lengths and the observed previous ciphertext symbol.
 * @param {number[]} plaintext
 * @returns {number[]}
 */
function resetPlusPostfilter(plaintext) {
  const out = [];
  for (let i=0;i<plaintext.length;i++) {
    const local = mod(plaintext[i] + lengthByPosition[i]);
    out.push(pageStarts.has(i) ?
      mod(local - lengthByPosition[i]) :
      mod(local - lengthByPosition[i] + out[i-1] + 1));
  }
  return out;
}

/** @param {number[]} cipher */
function inverseA(cipher) {
  return cipher.map((c,i) =>
    pageStarts.has(i) ? c : mod(c - cipher[i-1] - 1));
}

/** @param {number[]} cipher */
function inverseB(cipher) {
  return cipher.map((c,i) => {
    const length = lengthByPosition[i];
    const wordLocal = pageStarts.has(i) ? mod(c + length) :
      mod(c - cipher[i-1] - 1 + length);
    return mod(wordLocal - length);
  });
}

/** @param {number[]} cipher */
function eventCounts(cipher) {
  const result = {
    train:{join:[0,0],within:[0,0],pageCut:[0,0]},
    heldout:{join:[0,0],within:[0,0],pageCut:[0,0]}
  };
  for (let i=1;i<cipher.length;i++) {
    const side = pageOf[i] < 40 ? "train" : "heldout";
    const type = pageStarts.has(i) ? "pageCut" :
      wordStarts.has(i) ? "join" : "within";
    result[side][type][0]++;
    if (cipher[i] === cipher[i-1]) result[side][type][1]++;
  }
  return result;
}
const observed = eventCounts(original);
assert.deepEqual(observed,{
  train:{join:[2141,17],within:[7459,48],pageCut:[39,0]},
  heldout:{join:[732,6],within:[2569,15],pageCut:[15,0]}
});
const originalInverse = inverseA(original);
assert.deepEqual(originalInverse,inverseB(original));
assert.deepEqual(continuous(originalInverse),original);
assert.deepEqual(resetPlusPostfilter(originalInverse),original);
const expectedRepeatPositions = [];
for (let i=1;i<original.length;i++) if (!pageStarts.has(i) &&
  original[i]===original[i-1]) expectedRepeatPositions.push(i);
assert.equal(expectedRepeatPositions.length,86);
assert(expectedRepeatPositions.every(i => originalInverse[i] === 28));
assert.equal(originalInverse.filter((v,i)=>!pageStarts.has(i)&&v===28).length,86);

/** @param {string} file */
function pools(file) {
  const result = new Map();
  for (const token of read("resources/control/"+file).split(/[^A-Za-z]+/)) {
    if (!token) continue;
    const p = encodeEnglish(token);
    if (!p.length) continue;
    if (!result.has(p.length)) result.set(p.length,[]);
    result.get(p.length).push(p);
  }
  assert(parsed.words.every(w=>result.has(w.length)));
  return result;
}

/**
 * Source-native plants use exact 2,896 manuscript word lengths, physical
 * page leaders and all 32 cross-page word carries.
 * @param {Map<number,number[][]>} options
 * @param {()=>number} random
 */
function sample(options,random) {
  const result=[];
  for (const word of parsed.words) {
    const choices=options.get(word.length);
    result.push(...choices[Math.floor(random()*choices.length)]);
  }
  assert.equal(result.length,original.length);
  return result;
}
const native=[];
for (const [name,file,seed] of [
  ["Shakespeare","shakespeare_first300k.txt",0x590327],
  ["Gibran","gibran_prophet_58585.txt",0x590328],
  ["Emerson","emerson_essays_2944.txt",0x590329]
]) {
  const options=pools(file),rng=seededRandom(seed);
  const reps=100;
  const counts=Array.from({length:6},()=>({min:Infinity,max:-Infinity,sum:0}));
  for (let n=0;n<reps;n++) {
    const p=sample(options,rng);
    const cA=continuous(p),cB=resetPlusPostfilter(p);
    assert.deepEqual(cA,cB, "Architectures emit identical original-shape bytes");
    assert.deepEqual(inverseA(cA),p);
    assert.deepEqual(inverseB(cB),p);
    const observedPlant=eventCounts(cA);
    const values=[
      observedPlant.train.join[1],observedPlant.train.within[1],
      observedPlant.train.pageCut[1],observedPlant.heldout.join[1],
      observedPlant.heldout.within[1],observedPlant.heldout.pageCut[1]
    ];
    for (let j=0;j<values.length;j++) {
      counts[j].min=Math.min(counts[j].min,values[j]);
      counts[j].max=Math.max(counts[j].max,values[j]);
      counts[j].sum+=values[j];
    }
  }
  native.push({name,replicates:reps,seed,
    fields:["train_join","train_interior","train_page_cut",
      "holdout_join","holdout_interior","holdout_page_cut"],
    stats:counts.map(x=>({min:x.min,max:x.max,mean:x.sum/reps}))});
}
const outcome={
  scope:"Exact observational equivalence of a continuously keyed GP29 "+
    "cipher and a reset-word source plus lossless page-global postfilter",
  original:{runes:original.length,words:parsed.words.length,
    crossPageWords:parsed.crossPageWords,repeats:86,
    heldoutPageStart:40,originalEvents:observed},
  invertibility:{sourceNativePositiveSamples:300,
    exactCipherEquality:true,exactInverseOnOriginal:true,
    exactRecipherOriginal:true,sourceNativeBothInverse:true},
  originalInverse:{reservedEARepeatSites:86,
    comment:"A fixed EA escape is ruled out as a direct native-GP "+
      "plaintext explanation in the existing reserved-symbol gate; "+
      "this exact reverse transcript is not recovered plaintext."},
  native,
  mathematicalDecision:"Both specified rival architectures output "+
    "the same C for every possible P and every original word/page boundary. "+
    "Thus any likelihood ratio based only on ciphertext is exactly one; "+
    "no trained or heldout GP bigram, rune identity, cross-word or "+
    "cross-page statistic can distinguish them. A distinction requires "+
    "independent intermediate-stage output, authenticated side metadata "+
    "or a restriction on the postfilter beyond invertibility."
};
console.log(JSON.stringify(outcome,null,2));
