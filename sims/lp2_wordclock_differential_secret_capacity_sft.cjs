"use strict";
/**
 * All-secret word-clock predecessor-difference GP29 capacity (original LP2).
 * Windows Node22 / CommonJS, read-only, exact key-independent upper bounds.
 *
 * P[i] = pi[state(i)]((C[i]-C[i-1]) mod29), i > 0, P[0] unconstrained.
 * pi is any independent 29-symbol permutation for each public state.
 * Rearrangement maximizes global collision count by aligning sorted rows.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const byRune = new Map(GP.runes.map((v, i) => [v, i]));
const Q = 29;
const mod = x => (x % Q + Q) % Q;
/** @param {number[]} symbols @returns {number} */
function scaledIoC(symbols) {
  const counts = Array(Q).fill(0);
  for (const x of symbols) counts[x]++;
  return Q * counts.reduce((s, n) => s + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
/** @param {number[][]} words */
function metadata(words) {
  return words.flatMap((w, i) => w.map((_, j) => ({
    len: w.length, pos: j, prev: i ? words[i - 1].length : 0
  })));
}
/** @param {{len:number,pos:number,prev:number}} m @param {string} name */
function state(m, name) {
  if (name === "len") return String(m.len);
  if (name === "pos") return String(m.pos);
  if (name === "len-pos") return m.len + ":" + m.pos;
  if (name === "prev-mod2") return m.len + ":" + m.pos + ":" + m.prev % 2;
  if (name === "prev-mod3") return m.len + ":" + m.pos + ":" + m.prev % 3;
  if (name === "prev-mod5") return m.len + ":" + m.pos + ":" + m.prev % 5;
  if (name === "prev-exact") return m.len + ":" + m.pos + ":" + m.prev;
  throw new Error("Invalid public state: " + name);
}
/**
 * Exact maximum normalized IoC over all independently secret state bijections.
 * @param {number[]} cipher
 * @param {ReturnType<typeof metadata>} info
 * @param {string} family
 */
function capacity(cipher, info, family) {
  assert.equal(cipher.length, info.length);
  const hist = new Map();
  for (let i = 1; i < cipher.length; i++) {
    const key = state(info[i], family);
    if (!hist.has(key)) hist.set(key, Array(Q).fill(0));
    hist.get(key)[mod(cipher[i] - cipher[i - 1])]++;
  }
  const pooled = Array(Q).fill(0);
  for (const counts of hist.values()) {
    counts.sort((a, b) => b - a);
    for (let j = 0; j < Q; j++) pooled[j] += counts[j];
  }
  pooled[0]++; // Arbitrary plaintext P[0], optimally added to largest bin.
  assert.equal(pooled.reduce((s, n) => s + n, 0), cipher.length);
  const pairCount = pooled.reduce((s, n) => s + n * (n - 1), 0);
  return {states: hist.size,
    maxScaledIoC: Q * pairCount / (cipher.length * (cipher.length - 1))};
}
/** @param {string} key @returns {number[]} */
function permutation(key) {
  let seed = 2166136261;
  for (const ch of key) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
  if (seed === 0) seed = 1;
  const values = Array.from({length: Q}, (_, i) => i);
  for (let i = Q - 1; i > 0; i--) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const j = (seed >>> 0) % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  assert.equal(new Set(values).size, Q);
  return values;
}
/** Positive: encrypt and decode all 12,956 runes under arbitrary state S-boxes. */
function plant(plain, info, family) {
  const cache = new Map();
  function row(i) {
    const key = state(info[i], family);
    if (!cache.has(key)) cache.set(key, permutation(key));
    return cache.get(key);
  }
  const cipher = [7];
  for (let i = 1; i < plain.length; i++) {
    const delta = row(i).indexOf(plain[i]);
    assert.ok(delta >= 0);
    cipher.push(mod(cipher[i - 1] + delta));
  }
  const decoded = [plain[0]];
  for (let i = 1; i < cipher.length; i++) {
    decoded.push(row(i)[mod(cipher[i] - cipher[i - 1])]);
  }
  assert.deepEqual(decoded, plain);
  return cipher;
}
/** Match every original word length and absolute slot, with source words. */
function matchedEnglish(sourceWords, slots) {
  const byLength = new Map(), seen = new Map();
  for (const w of sourceWords) {
    if (!byLength.has(w.length)) byLength.set(w.length, []);
    byLength.get(w.length).push(w);
  }
  return slots.flatMap(w => {
    const pool = byLength.get(w.length);
    assert.ok(pool && pool.length, "Missing GP-native length " + w.length);
    const at = seen.get(w.length) || 0;
    seen.set(w.length, at + 1);
    return pool[at % pool.length];
  });
}
/** Single-rune words: number of different D values for each exact prev length. */
function singletonSpectrum(cipher,words) {
  const groups=new Map(); let at=0;
  for(let w=0;w<words.length;w++){
    if(words[w].length===1&&at>0){
      const prev=words[w-1].length;
      if(!groups.has(prev))groups.set(prev,new Set());
      groups.get(prev).add(mod(cipher[at]-cipher[at-1]));
    }
    at+=words[w].length;
  }
  return Object.fromEntries([...groups].map(([k,v])=>[k,v.size]));
}
function singletonPlainValues(plain,words) {
  const values=new Set();let at=0;
  for(const w of words){if(w.length===1)values.add(plain[at]);at+=w.length;}
  return [...values];
}
/** Over all a in F29, min diversity at singleton after exact previous length. */
function affineSingletonOriginal(cipher,words){
  const one=[];let at=0;
  for(let i=0;i<words.length;i++){
    if(words[i].length===1&&at>0)
      one.push({prevLen:words[i-1].length,current:cipher[at],previous:cipher[at-1]});
    at+=words[i].length;
  }
  const rows=[];
  for(let a=0;a<29;a++){
    const groups=new Map();
    for(const event of one){
      if(!groups.has(event.prevLen))groups.set(event.prevLen,new Set());
      groups.get(event.prevLen).add(mod(event.current-a*event.previous));
    }
    rows.push({a,after2:groups.get(2).size,after3:groups.get(3).size});
  }
  return {rows,minAfter2:Math.min(...rows.map(r=>r.after2)),
    minAfter3:Math.min(...rows.map(r=>r.after3))};
}
function main() {
  const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"), 55);
  const words = parsed.words.map(w => [...w.runes].map(r => {
    assert.ok(byRune.has(r));
    return byRune.get(r);
  }));
  const cipher = words.flat(), info = metadata(words);
  assert.deepEqual(cipher, GP.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
  assert.deepEqual([words.length, cipher.length, parsed.crossPageWords], [2896,12956,32]);
  const repeat = cipher.slice(1).filter((n, j) => n === cipher[j]).length;
  assert.equal(repeat, 86);
  const allAffine=affineSingletonOriginal(cipher,words);
  assert.equal(allAffine.rows.length,29);
  assert.deepEqual([allAffine.minAfter2,allAffine.minAfter3],[11,10]);
  const singleton=singletonSpectrum(cipher,words);
  assert.equal(words.filter(w=>w.length===1).length,83);
  assert.equal(singleton["2"],12);
  assert.equal(singleton["3"],14);
  assert.equal(Math.max(...Object.values(singleton)),14);
  const expected = {
    len:[14,1.0454393691130948],
    pos:[14,1.041502784295366],
    "len-pos":[105,1.1472155676029154],
    "prev-mod2":[210,1.2642774779442316],
    "prev-mod3":[274,1.3602655974578448],
    "prev-mod5":[457,1.5616496245523697],
    "prev-exact":[924,1.948446727450532]
  };
  const bounds = {};
  for (const [family, [states, max]] of Object.entries(expected)) {
    const actual = capacity(cipher, info, family);
    assert.equal(actual.states, states);
    assert.ok(Math.abs(actual.maxScaledIoC - max) < 1e-9);
    bounds[family] = actual;
  }
  const references = [
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/emerson_essays_2944.txt",
    "resources/control/shakespeare_first300k.txt"
  ];
  const controls = references.map(file => {
    const plain = matchedEnglish(encodeWords(read(file)), words);
    assert.equal(plain.length, cipher.length);
    const actualIoC = scaledIoC(plain);
    const plantedCipher = plant(plain, info, "prev-mod5");
    const single=singletonPlainValues(plain,words);
    assert.ok(Math.max(...Object.values(singletonSpectrum(plantedCipher,words)))<=single.length);
    assert.ok(capacity(plantedCipher, info, "prev-mod5").maxScaledIoC + 1e-9
      >= actualIoC);
    return {reference:file, scaledIoC:actualIoC, exactPositive:true,
      singletonGlyphs:single.map(i=>GP.translit[i])};
  });
  const min = Math.min(...controls.map(c => c.scaledIoC));
  assert.ok(Math.abs(min - 1.7605515160477245) < 1e-9);
  assert.ok(bounds["prev-mod5"].maxScaledIoC < min);
  assert.ok(bounds["prev-exact"].maxScaledIoC > min);
  assert.equal(Math.max(...controls.map(c=>c.singletonGlyphs.length)),6);
  const output = {original:{runes:cipher.length, words:words.length,
    crossingWords:parsed.crossPageWords, adjacentRepeats:repeat},
    allSecretMaximum29TimesIoC:bounds, observedSingletonDifferences:singleton,
    minimumOneRuneInputsAcross29AffinePredecessorCoefficients:
      {precedingLength2:allAffine.minAfter2,precedingLength3:allAffine.minAfter3},
    matchedEnglishControls:controls,
    decision:"all seven word-clock families fail GP-native English: " +
      "exact-predecessor variant fails singleton-word injectivity",
    authenticatedUnknownPlaintext:false};
  console.log(JSON.stringify(output,null,2));
  return output;
}
if (require.main === module) main();
module.exports = {main,state,capacity,metadata,permutation,plant,matchedEnglish,
  singletonSpectrum,singletonPlainValues,affineSingletonOriginal};
