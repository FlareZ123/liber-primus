"use strict";
/**
 * Source-original, key-independent 512-printable-digit global-phase
 * GP29 DIFFERENCE rank cipher exclusion.
 *
 * In a fixed phase, all 29! secret permutations (including a changing
 * special zero symbol) preserve equality. Original ciphertext phase
 * equality Q on same-page differences is thus an EXACT invariant
 * of every 512-period phase-rank difference inverse, no matter the key.
 *
 * Fully original length-matched authentic solved-Cicada native GP29
 * controls, original-rune all-secret invariant, and original-key positive
 * encryption/decryption. No unknown LP2 plaintext or key is recovered.
 *
 * Node.js 22 CommonJS, Windows 11, read-only single runnable test:
 * node sims/lp2_p50_512_phase_difference_allsecret_equality_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} f @returns {string} */
function read(f) {
  return fs.readFileSync(path.join(root, f), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const digitTable = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const physical = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const cipher = physical.flatMap(p => p.indices);
const sourceText = read("resources/liber-primus/lp2-transcription.txt");
const mapRune = new Map(gp.runes.map((r, i) => [r, i]));
const runesRegex = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const words = sourceText.replace(/[\/\r\n%&$\s]/g,"")
  .split(/[-.]/).filter(w => /[\u16A0-\u16FF]/u.test(w))
  .slice(0,2896).map(w => [...w].map(g => mapRune.get(g)));
const solvedWords = solved.sections.flatMap(s =>
  (s.source_text.match(runesRegex) || [])
    .map(w => [...w].map(g => mapRune.get(g))));
assert.equal(physical.length,55);
assert.equal(words.length,2896);
assert.equal(cipher.length,12956);
assert.deepEqual(words.flat(),cipher);
assert.equal(solvedWords.length,740);
assert.equal(solvedWords.flat().length,2979);
const starts = new Set();
let offset = 0;
for (const p of physical) {
  starts.add(offset);
  offset += p.indices.length;
}
assert.equal(offset,12956);
assert.equal(starts.size,55);
/**
 * Exact within-phase equal-value pair invariant, on original all-rune
 * global positions. Skip 55 same-page predecessor-free first runes.
 * @param {number[]} runes
 * @param {number} period
 * @param {"rune"|"difference"} kind
 * @returns {{q:number,pairs:number,equalPairs:number,positions:number}}
 */
function equality(runes, period, kind) {
  assert.equal(runes.length,12956);
  const rows = Array.from({length:period}, () => Array(29).fill(0));
  let positions=0;
  for(let i=0;i<runes.length;i++){
    if(starts.has(i))continue;
    const value = kind === "difference"
      ? (runes[i] - runes[i-1] + 29) % 29 : runes[i];
    rows[i%period][value]++;
    positions++;
  }
  let count=0,pairs=0;
  for(const row of rows){
    let n=0;
    for(const v of row){count+=v*(v-1);n+=v;}
    pairs+=n*(n-1);
  }
  assert.equal(positions,12901);
  assert.ok(pairs>0);
  return {q:count/pairs,pairs,equalPairs:count,positions};
}
const original512=equality(cipher,512,"difference");
const original256=equality(cipher,256,"difference");
assert.deepEqual([original512.equalPairs,original512.pairs],
  [11148,312334]);
assert.deepEqual([original256.equalPairs,original256.pairs],
  [22710,637366]);
// Native words have exactly source-attested rune spellings, not an
// LLM-generated paraphrase or a guessed plaintext.
const pools=new Map();
for(const w of solvedWords){
  if(!pools.has(w.length))pools.set(w.length,[]);
  pools.get(w.length).push(w);
}
for(const w of words)assert.ok(pools.get(w.length)?.length);
let seed=0x33012014;
/** @returns {number} */
function random(){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
/** @returns {number[]} */
function donor(){
  return words.flatMap(w=>{
    const options=pools.get(w.length);
    return options[random()%options.length];
  });
}
// All 500 independent books preserve each of the 2,896 true whole-word
// lengths, all 55 physical page starts and the 12,901 eligible positions.
const Ns=500,controls=[];
for(let j=0;j<Ns;j++)controls.push(equality(donor(),512,"rune").q);
controls.sort((a,b)=>a-b);
assert.equal(controls.length,Ns);
const smallest=controls[0],largest=controls.at(-1);
assert.ok(smallest>0.055);
assert.ok(original512.q<0.04);
assert.ok(original512.q<smallest);
const sourceDigits=digitTable.pages.flatMap(p=>p.tokens)
  .flatMap(t=>[digitTable.alphabet.indexOf(t[0]),
    digitTable.alphabet.indexOf(t[1])]);
assert.equal(sourceDigits.length,512);
const key=sourceDigits.map(d=>d%29);
const mod=n=>((n%29)+29)%29;
/** Source-key additive DIFFERENCE source-native encryptor:
 * P_i=(C_i-C_prev−key[globalI%512]) mod29, so the symbol mapping
 * of delta=0 *varies* by phase with the actual printed digits.
 * @param {number[]} plain */
function encrypt(plain){
  const out=[];
  for(let i=0;i<plain.length;i++){
    out.push(starts.has(i)?plain[i]:mod(out[i-1]+plain[i]+key[i%512]));
  }
  return out;
}
/** @param {number[]} encoded */
function decrypt(encoded){
  const out=[];
  for(let i=0;i<encoded.length;i++){
    out.push(starts.has(i)?encoded[i]:mod(encoded[i]-encoded[i-1]-key[i%512]));
  }
  return out;
}
// Exact original roundtrip proves correct inverse and clock; it cannot
// prove this specific table key was used by Cicada.
const originalPlain=decrypt(cipher);
assert.deepEqual(encrypt(originalPlain),cipher);
assert.deepEqual(equality(originalPlain,512,"rune"),original512);
const positiveNative=donor();
const plantedCipher=encrypt(positiveNative);
assert.deepEqual(decrypt(plantedCipher),positiveNative);
assert.deepEqual(encrypt(decrypt(plantedCipher)),plantedCipher);
const plainQ=equality(positiveNative,512,"rune");
const encryptedQ=equality(plantedCipher,512,"difference");
assert.deepEqual(plainQ,encryptedQ);
assert.ok(plainQ.q>=smallest && plainQ.q<=largest);
const literalOriginalE=originalPlain.filter((v,i)=>!starts.has(i)&&v===18).length;
const nativePlantE=positiveNative.filter((v,i)=>!starts.has(i)&&v===18).length;
assert.ok(literalOriginalE<650 && nativePlantE>1400);
console.log(JSON.stringify({
  source:{unknownCipherRunes:cipher.length,physicalRunePages:55,
    completePrintedWords:words.length,samePagePairs:12901},
  exactOriginalDifferencePhaseEquality:{
    source512Global:original512,source256Global:original256},
  sourceNativeControls:{donorWords:solvedWords.length,
    originalLengthMatchedIndependentBooks:Ns,
    minimum:smallest,median:controls[Math.floor(Ns/2)],
    maximum:largest,aboveOriginal:controls.filter(q=>q>original512.q).length},
  exactSource512AdditivePositive:{plainRunes:positiveNative.length,
    plaintextQ:plainQ,ciphertextDeltaQ:encryptedQ,
    nativePlantE,originalSourceDigitInverseE:literalOriginalE,
    fullNativeRecovery:true,originalExactReencryption:true},
  conclusion:"Any GP29 single-layer, fixed-global-period512 difference-phase substitution with arbitrary secret 29! independent phase alphabets preserves 512-phase Q=0.03569 on the original. This is below every one of 500 genuine source-word-length native-GP books (min >0.05846). The 512-global option surviving simple unigram capacity therefore fails the stronger all-secret equality invariant, unless word boundaries/plaintext register/clock changes. No recovered unknown plaintext."
},null,2));
console.log("PASS: original all-secret source512 equality invariant and exact native GP positive");
