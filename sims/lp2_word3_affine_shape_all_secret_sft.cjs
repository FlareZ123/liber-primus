"use strict";
/**
 * An exact-key-free necessary-condition test for every independent affine
 * substitution on each three-rune word of unknown LP2. Uses original
 * printed word boundaries and independent native-GP/Latin-English controls.
 * SFT: node sims/lp2_word3_affine_shape_all_secret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeNumber = new Map(corpus.runes.map((v, i) => [v, i]));
const originalText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const allWords = [];
let word = [], nRunes = 0;
for (const ch of originalText) {
  if (runeNumber.has(ch)) {
    word.push(runeNumber.get(ch));
    nRunes += 1;
  } else if ("-.$&§".includes(ch) && word.length) {
    allWords.push(word);
    word = [];
  }
}
if (word.length) allWords.push(word);
assert.equal(nRunes, 12956);
assert.equal(allWords.length, 2896);
const originalThree = allWords.filter((v) => v.length === 3);
assert.equal(originalThree.length, 720);
/** @param {number} a */
function inverse(a) {
  for (let k = 1; k < 29; k += 1) if ((a * k) % 29 === 1) return k;
  throw new Error("GP field inverse absent");
}
/** @param {number[]} triple */
function invariant(triple) {
  assert.equal(triple.length, 3);
  const d = (triple[1] - triple[0] + 29) % 29;
  return d === 0 ? 29 :
    ((triple[2] - triple[0] + 29) * inverse(d)) % 29;
}
/** @param {number[][]} triples */
function score(triples) {
  const bins = Array(30).fill(0);
  for (const triple of triples) bins[invariant(triple)] += 1;
  const pairs = bins.reduce((sum, n) => sum + n * (n - 1), 0);
  return {count: triples.length, samePairs: pairs,
    allPairs: triples.length * (triples.length - 1),
    rate: pairs / (triples.length * (triples.length - 1))};
}
const original = score(originalThree);
assert.deepEqual([original.samePairs,original.allPairs],[18204,517680]);
const sourceFiles = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt",12988,11415],
  ["Gibran","resources/control/gibran_prophet_58585.txt",4000,4253],
  ["Emerson","resources/control/emerson_essays_2944.txt",16897,18585]
];
const tokens = ["ING",...corpus.translit].sort((a, b) => b.length - a.length);
const plainReplacement = {K:"C",Q:"C",V:"U",Z:"S"};
/** @param {string} rawWord @param {boolean} rawLatin */
function encode(rawWord,rawLatin) {
  const w = rawLatin ? rawWord :
    rawWord.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
  const values = [];
  for (let i = 0; i < w.length;) {
    const t = rawLatin ? w[i] : tokens.find((s) => w.startsWith(s,i));
    assert.ok(t);
    const code = t === "ING" ? "NG" : (plainReplacement[t] || t);
    const gp = corpus.translit.indexOf(code);
    assert.ok(gp >= 0);
    values.push(gp);
    i += t.length;
  }
  return values;
}
let rng = 0x43524343 >>> 0;
/** @returns {number} */
function random() {
  rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
  return (rng >>> 0) / 4294967296;
}
const controls = [];
let gpPlant = null;
for (const [name,file,expectGP,expectLatin] of sourceFiles) {
  const words = read(file).toUpperCase().match(/[A-Z]+/g) || [];
  for (const rawLatin of [false,true]) {
    const candidates = words.map((v) => encode(v,rawLatin))
      .filter((v) => v.length === 3);
    assert.equal(candidates.length,rawLatin?expectLatin:expectGP);
    const population = score(candidates);
    if (name === "Gibran" && !rawLatin) gpPlant = candidates.slice(0,720);
    let minimum = Infinity, maximum = -Infinity, exceed = 0;
    for (let sample = 0; sample < 1000; sample += 1) {
      const picked = Array.from({length: 720},() =>
        candidates[Math.floor(random() * candidates.length)]);
      const rate = score(picked).rate;
      minimum = Math.min(minimum,rate);
      maximum = Math.max(maximum,rate);
      if (rate <= original.rate) exceed += 1;
    }
    assert.equal(exceed,0);
    controls.push({source:name,register:rawLatin?"raw-Latin-folded":"native-GP",
      sourceThreeRuneWords:candidates.length,
      populationRate:population.rate,minimumSampleRate:minimum,
      maximumSampleRate:maximum,samples:1000,
      samplesAtOrBelowOriginal:exceed});
  }
}
assert.equal(gpPlant.length,720);
const encrypted = [];
const roundtrip = [];
for (const p of gpPlant) {
  const scale = 1 + Math.floor(random() * 28);
  const shift = Math.floor(random() * 29);
  const c = p.map((v) => (v * scale + shift) % 29);
  const dec = c.map((v) =>
    ((v - shift + 29) * inverse(scale)) % 29);
  assert.deepEqual(dec,p);
  assert.equal(invariant(c),invariant(p));
  encrypted.push(c); roundtrip.push(dec);
}
assert.deepEqual(roundtrip,gpPlant);
assert.equal(score(encrypted).rate,score(gpPlant).rate);
console.log(JSON.stringify({
  architecture:"One independent affine 29-rune substitution per whole printed word",
  originalThreeRuneWords:original,
  finiteSourceControls:controls,
  plantedWordSpecificAffine:{words:720,runes:2160,
    exactRecovery:2160,unchangedInvariant:true},
  decision:"LP2 has a nearly uniform affine-triple shape distribution. Source GP/Latin controls are strongly concentrated. Negative only for source-native plaintext with preserved word boundaries under wordwise affine substitutions. No original key or plaintext recovered."
},null,2));
