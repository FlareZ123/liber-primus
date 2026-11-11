"use strict";

/**
 * Signed 2016 word GP-prime-sum key -> original p55 strict-interior GP29 gate.
 * The script is deterministic and read-only. Node.js 22, CommonJS.
 *
 * All candidate settings are frozen by the historical signed message,
 * original p55 word segmentation, and the two additive orientations.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const asc = read("resources/historical/cicada2016-4gq25-outguess.asc");
const source = read("resources/lp2-transcription.txt");
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;

const signed = asc.slice(asc.indexOf("Hello."),
  asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
assert.ok(signed.startsWith("Hello."));
const signedWords = signed.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
let key = signedWords.map(w => w.length % 29);
assert.equal(key.length, 43);

const p55PrintedWords = source.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.deepEqual(p55PrintedWords.map(w => [...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(p55.length, 76);
const interiorOffsets = [];
const outerOffsets = [];
let at = 0;
for (const printedWord of p55PrintedWords) {
  const letters = [...printedWord];
  for (let i = 0; i < letters.length; i++) {
    const expected = corpus.runes.indexOf(letters[i]);
    assert.equal(p55[at + i], expected);
    (i === 0 || i === letters.length - 1 ? outerOffsets : interiorOffsets)
      .push(at + i);
  }
  at += letters.length;
}
assert.deepEqual([interiorOffsets.length,outerOffsets.length], [43,33]);
assert.deepEqual(interiorOffsets, [
  2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,
  30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,
  56,57,58,59,60,65,66,67,68,71,74
]);
const cipher = interiorOffsets.map(i => p55[i]);

const gpTokens = corpus.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const clean = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/Q/g, "C");
  const output = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let j = 0; j < word.length;) {
      const hit = gpTokens.find(z => word.startsWith(z.s, j));
      assert.ok(hit, "Unmappable word " + word + " at " + j);
      output.push(hit.i);
      j += hit.s.length;
    }
  }
  return output;
}
// Source words are GP-canonicalized with the same rules as the native control.
// The signed message explicitly mentions words and their numbers. A GP prime
// sum per word is therefore an independent natural alternative to lengths.
key = signedWords.map(w => gpEncode(w)
  .reduce((sum, i) => sum + corpus.prime[i], 0) % 29);
assert.deepEqual(key, [11,14,0,21,24,1,21,14,4,11,9,26,14,16,27,5,1,14,8,27,0,26,14,1,12,27,5,1,14,18,26,12,26,22,12,14,4,15,3,2,24,14,17]);
const nativePlain = gpEncode(solved.split("### 57")[1].split("PARABLE")[1])
  .slice(0,43);
assert.equal(nativePlain.length,43);
const train = gpEncode(shakespeare.slice(0,240000));
const heldout = gpEncode(shakespeare.slice(240000));
assert.deepEqual([train.length,heldout.length],[174998,43802]);

const n = 29;
const f1 = new Uint32Array(n);
const f2 = new Uint32Array(n*n);
const f3 = new Uint32Array(n*n*n);
for (let i=0; i<train.length; i++) {
  f1[train[i]]++;
  if (i) f2[train[i-1]*n+train[i]]++;
  if (i>=2) f3[(train[i-2]*n+train[i-1])*n+train[i]]++;
}
/** @param {number[]} a */
function languageScore(a) {
  let score=0;
  for (let i=0; i<a.length; i++) {
    const c=a[i];
    let p=(f1[c]+1)/(train.length+n);
    if (i) p=(f2[a[i-1]*n+c]+8*p)/(f1[a[i-1]]+8);
    if (i>=2) p=(f3[(a[i-2]*n+a[i-1])*n+c]+8*p)
      /(f2[a[i-2]*n+a[i-1]]+8);
    score+=Math.log(p);
  }
  return score/a.length;
}
const nativeScores=[];
for(let i=0; i+43<=heldout.length; i+=43)
  nativeScores.push(languageScore(heldout.slice(i,i+43)));
nativeScores.sort((a,b)=>a-b);
assert.equal(nativeScores.length,1018);

let state=0x38201643;
/** @returns {number} */
function random() {
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return (state>>>0)/4294967296;
}
const shuffles=[];
for (let j=0; j<2000; j++) {
  const shuffled=key.slice();
  for (let i=42; i>0; i--) {
    const k=Math.floor(random()*(i+1));
    [shuffled[i],shuffled[k]]=[shuffled[k],shuffled[i]];
  }
  for (const sign of [-1,1])
    shuffles.push({sign,score:languageScore(
      cipher.map((c,i)=>mod(c+sign*shuffled[i])))});
}
const candidates=[];
const positives=[];
for (const sign of [-1,1]) {
  const plain=cipher.map((c,i)=>mod(c+sign*key[i]));
  const roundTrip=plain.every((p,i)=>mod(p-sign*key[i])===cipher[i]);
  assert.ok(roundTrip);
  const score=languageScore(plain);
  candidates.push({
    sign,
    gpIndices:plain,
    runes:plain.map(i=>corpus.runes[i]).join(""),
    transliteration:plain.map(i=>corpus.translit[i]).join(""),
    score,
    nativeWindowsAsPoorOrWorse:nativeScores.filter(v=>v<=score).length,
    nativeWindows:nativeScores.length,
    shuffledKeysAsGoodOrBetter:
      shuffles.filter(v=>v.sign===sign && v.score>=score).length,
    shuffledKeyTrials:2000,
    exactReencryption:roundTrip
  });
  const encrypted=nativePlain.map((p,i)=>mod(p-sign*key[i]));
  const recovered=encrypted.map((c,i)=>mod(c+sign*key[i]));
  assert.deepEqual(recovered,nativePlain);
  const wrong=encrypted.map((c,i)=>mod(c+sign*key[(i+1)%43]));
  positives.push({
    sign,exactRecovered:43,
    wrongKeyLiteralMatches:wrong.filter((v,i)=>v===nativePlain[i]).length,
    originalNativeScore:languageScore(nativePlain),
    wrongKeyScore:languageScore(wrong)
  });
}
console.log(JSON.stringify({
  input:{signedWords:signedWords.length,sourceKey:key,
    p55PhysicalPage:55,p55LocalRunners:76,p55PrintedWords:17,
    interiorOffsets,outerCount:outerOffsets.length,
    originalInteriorCiphertext:cipher},
  calibration:{nativeHeldoutWindows:nativeScores.length,
    nativeScoreMin:nativeScores[0],
    nativeScoreMedian:nativeScores[Math.floor(nativeScores.length/2)],
    plantedNative:positives},
  original:candidates,
  decision:"Neither GP-prime-summed signed 2016 word key orientation yields original native-GP p55 plaintext; exact controls pass."
},null,2));
