"use strict";

/** All-secret GP29 plaintext-autokey test. SFT: node sims/lp2_plaintext_autokey_allseed_gate_sft.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const lengths = pages.map(p => p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);
const runeIds = new Map(corpus.runes.map((s, i) => [s, i]));
const raw = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const words = [];
let word = [];
for (const c of raw) {
  if (runeIds.has(c)) word.push(runeIds.get(c));
  else if (c !== "/" && c !== "%" && !/\s/u.test(c)) {
    if (word.length) words.push(word);
    word = [];
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

const gp = new Map(corpus.translit.map((token, i) => [token, i]));
gp.set("ING", 21);
/** @param {string} word Uppercase native English word. @returns {number[]} */
function encode(word) {
  const plain = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < plain.length;) {
    let matched = false;
    for (const n of [3, 2, 1]) {
      const id = gp.get(plain.slice(i, i + n));
      if (id !== undefined) {
        out.push(id); i += n; matched = true; break;
      }
    }
    assert.ok(matched, "Unknown GP token in " + plain);
  }
  return out;
}
const refs = [
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
];
const referenceWords = refs.map(file =>
  (read(file).toUpperCase().match(/[A-Z]+/g) || []).map(encode));
const reference = referenceWords.map(a => a.flat());
assert.deepEqual(reference.map(a => a.length), [323083, 62696, 217644]);
const windows = reference.flatMap(text => {
  const out = [];
  for (let i = 0; i + original.length <= text.length; i += original.length)
    out.push(text.slice(i, i + original.length));
  return out;
});
assert.equal(windows.length, 44);
/** @param {number} x */
function mod(x) { return ((x % 29) + 29) % 29; }
/**
 * Zero-seed inverse of C[i]=P[i]+sign*P[i-lag] mod29 for i>=lag.
 * The first lag ciphertext values and all first lag plaintext values are free.
 * @param {number[]} cipher @param {number} lag @param {1|-1} sign
 */
function zeroSeed(cipher, lag, sign) {
  const result = Array(cipher.length).fill(0);
  for (let i = lag; i < cipher.length; i++)
    result[i] = mod(cipher[i] - sign * result[i-lag]);
  return result;
}
/**
 * Seed-invariant pooled within-class IoC: classes mod2m for +, mod m for -.
 * Discard the first m unconstrained positions within each reset segment.
 * @param {number[]} values @param {number} lag @param {1|-1} sign
 * @param {boolean} pageReset @param {boolean} decode
 */
function coincidence(values, lag, sign, pageReset, decode) {
  const segments = pageReset ? lengths : [values.length];
  let cursor = 0, equal = 0, pairs = 0;
  for (const len of segments) {
    const section = values.slice(cursor, cursor + len);
    cursor += len;
    const data = decode ? zeroSeed(section, lag, sign) : section;
    const period = sign === 1 ? lag * 2 : lag;
    const freq = Array.from({length: period}, () => Array(29).fill(0));
    const counts = Array(period).fill(0);
    for (let i = lag; i < len; i++) {
      freq[i%period][data[i]]++;
      counts[i%period]++;
    }
    for (let j = 0; j < period; j++) {
      pairs += counts[j] * (counts[j]-1);
      for (const n of freq[j]) equal += n*(n-1);
    }
  }
  assert.equal(cursor, values.length);
  return {ioc: equal/pairs, pairs};
}
const lags = [1,2,3,5,8,13,21,34,55,89];
const structural = [];
for (const reset of [false,true]) for (const lag of lags) for (const sign of [1,-1]) {
  const actual = coincidence(original, lag, sign, reset, true);
  const controls = windows.map(w => coincidence(w, lag, sign, reset, false).ioc);
  const lower = controls.filter(x => x <= actual.ioc).length;
  if (!reset || lag <= 55 || sign === -1) assert.equal(lower, 0);
  structural.push({
    clock: reset ? "page" : "whole book", lag, sign,
    originalIoc: actual.ioc, withinClassPairs: actual.pairs,
    controlMinimum: Math.min(...controls), controlsAtOrBelowOriginal: lower
  });
}

// Exact positive controls: independently encrypted native plaintext with
// arbitrary initial ciphertext and unknown plaintext seeds preserves all IoC
// within the declared classes, even if the actual seeds are concealed.
for (const lag of lags) for (const sign of [1,-1]) {
  const plain = reference[1].slice(0, original.length);
  const cipher = plain.map((v, i) =>
    i < lag ? mod(11+17*i) : mod(v + sign*plain[i-lag]));
  const zero = zeroSeed(cipher, lag, sign);
  const period = sign === 1 ? 2*lag : lag;
  const shifts = Array(period).fill(null);
  for (let i = lag; i < plain.length; i++) {
    const key = i%period, shift = mod(zero[i]-plain[i]);
    if (shifts[key] === null) shifts[key] = shift;
    assert.equal(shifts[key], shift);
  }
  assert.equal(coincidence(cipher,lag,sign,false,true).ioc,
    coincidence(plain,lag,sign,false,false).ioc);
}

/** @param {number[]} p @param {number} lag @param {1|-1} sign */
function signature(p, lag, sign) {
  const out = [];
  for (let i = lag; i < p.length; i++) out.push(mod(p[i]+sign*p[i-lag]));
  return out.join(",");
}
/**
 * Plaintext dictionary signatures allow ANY secret initial m plaintext and
 * ciphertext runes per word: only positions i>=m are matched.
 * @param {number[][]} lexicon @param {number} lag @param {1|-1} sign
 * @param {number} minimum
 */
function dictionary(lexicon,lag,sign,minimum) {
  const d = new Map();
  for(const w of lexicon) {
    if (w.length < minimum) continue;
    if (!d.has(w.length)) d.set(w.length,new Set());
    d.get(w.length).add(signature(w,lag,sign));
  }
  return d;
}
/** @param {Map<number,Set<string>>} dict @param {number[]} c @param {number} lag */
function compatible(dict,c,lag) {
  return !!dict.get(c.length)?.has(c.slice(lag).join(","));
}
const lexicon = [...new Map(referenceWords.flat().map(w=>[w.join(","),w])).values()];
assert.equal(lexicon.length,12230);
const lexical = [];
for(const lag of [1,2,3,5,8]) for(const sign of [1,-1]) {
  const minimum = lag+4; // At least four independently checked GP ciphertext suffix runes.
  const d = dictionary(lexicon,lag,sign,minimum);
  const originalLong = words.filter(w=>w.length>=minimum);
  const originalHits = originalLong.filter(w=>compatible(d,w,lag)).length;
  const heldout = referenceWords.map((sample,i)=>{
    const others=referenceWords.filter((_,j)=>j!==i).flat();
    const learn=dictionary(others,lag,sign,minimum);
    const eligible=sample.filter(w=>w.length>=minimum);
    let hits=0;
    for(const p of eligible) {
      const c=p.map((v,j)=>j<lag?mod(5+j):mod(v+sign*p[j-lag]));
      if(compatible(learn,c,lag))hits++;
    }
    return {source:refs[i],eligible:eligible.length,hits};
  });
  lexical.push({lag,sign,minLength:minimum,eligible:originalLong.length,
    matches:originalHits,heldoutPositive:heldout});
}
assert.deepEqual(lexical.map(r=>[r.eligible,r.matches]),[
  [1132,3],[1132,3],[815,1],[815,2],[559,0],[559,2],
  [187,0],[187,0],[25,0],[25,0]
]);
console.log(JSON.stringify({runes:original.length,words:words.length,
  sources:reference.length,controls:windows.length,structural,lexical,
  positiveControls:"PASS for all 20 seed-independent planted decoders"},null,2));


// New independent source-register test. The initial m ciphertext/plaintext runes
// of every printed word remain wholly unconstrained.
const latinAlphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).map(s=>s.trim())
  .filter(s=>s.length>0&&!s.startsWith("#")).map(s=>[...s].map(ch=>{
    const value=latinAlphabet.indexOf(ch);
    assert.ok(value>=0,"Invalid Vulgate GP rune");
    return value;
  }));
assert.equal(latinWords.length,39835);
assert.equal(latinWords.reduce((n,w)=>n+w.length,0),204802);
const beowulf=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
assert.equal(beowulf.schema,2);
assert.equal(beowulf.positiveControlAlphabet,"ABCDEFGHIJKLMNOPQRSTUVWXYZabc");
let oeOffset=0;
const oeWords=beowulf.allSourceGpWordLengths.map(n=>{
  const s=beowulf.sourceGpBase29.slice(oeOffset,oeOffset+n);
  oeOffset+=n;
  return [...s].map(ch=>{
    const value=beowulf.positiveControlAlphabet.indexOf(ch);
    assert.ok(value>=0,"Invalid Old English GP rune");
    return value;
  });
});
assert.equal(oeOffset,48012);
assert.equal(oeWords.length,10885);
const alternative = [];
for(const [name,source] of [["Vulgate Latin",latinWords],["corrected Beowulf Old English",oeWords]]) {
  const split=Math.floor(source.length/2);
  const train=source.slice(0,split),test=source.slice(split);
  for(const lag of [1,2,3,5]) for(const sign of [1,-1]) {
    const min=lag+4;
    const fullDict=dictionary(source,lag,sign,min);
    const eligible=words.filter(w=>w.length>=min);
    const matches=eligible.filter(w=>compatible(fullDict,w,lag)).length;
    const heldoutDict=dictionary(train,lag,sign,min);
    const eligibleControls=test.filter(w=>w.length>=min);
    const controls=eligibleControls.filter(p=>{
      const c=p.map((v,i)=>i<lag?mod(5+i):mod(v+sign*p[i-lag]));
      return compatible(heldoutDict,c,lag);
    }).length;
    alternative.push({name,lag,sign,min,originalWords:eligible.length,
      originalMatches:matches,controlWords:eligibleControls.length,
      matchedPlantedControlWords:controls});
  }
}
assert.deepEqual(alternative.map(x=>[
  x.originalWords,x.originalMatches,x.controlWords,x.matchedPlantedControlWords
]),[
  [1132,1,11064,6837],[1132,0,11064,6837],
  [815,0,8087,4242],[815,0,8087,4243],
  [559,1,6088,2758],[559,0,6088,2759],
  [187,0,2739,827],[187,0,2739,825],
  [1132,0,2442,1203],[1132,0,2442,1203],
  [815,0,1349,508],[815,0,1349,510],
  [559,0,644,232],[559,0,644,230],
  [187,0,90,28],[187,0,90,28]
]);
console.log(JSON.stringify({title:"Latin and corrected Old English independently keyed GP29 autokey word-register exclusion",alternative},null,2));
