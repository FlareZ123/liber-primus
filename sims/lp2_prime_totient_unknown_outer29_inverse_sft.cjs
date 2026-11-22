'use strict';

/**
 * Search an arbitrary 29-symbol outer alphabet, unknown in its entirety, over
 * the historically demonstrated GP29 prime-totient keystream:
 *
 *   C_i = sigma((P_i + phi(prime(i+1))) mod 29)
 *
 * Unlike keyword/affine relabelings or 28-rank anti-repeat channels, sigma is
 * any 29! permutation, including the 29th F/EA rune.
 *
 * Sources and original-target commitment:
 * - LP2 physical p0+p1 train; p2 is an untouched validation chapter tail.
 * - Key clock starts at the first rune of p0 and continues across p1/p2.
 * - No key skip or plaintext F bypass; that is a separate historical variant.
 * - Original printed word boundaries are immutable.
 * - Three independent English corpora train the GP29 lexical likelihood.
 * - The planted positive uses heldout source-English words matched to the
 *   *exact* original printed word-length profile.
 *
 * No candidate inverse is a real decryption without sustained independent
 * heldout plaintext and exact forward replay using a frozen sigma.
 *
 * Node.js 22, CommonJS, no external dependencies, no output files:
 * node sims/lp2_prime_totient_unknown_outer29_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod = (v) => ((v % 29) + 29) % 29;
const letters = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const sources = [
  read('resources/control/gibran_prophet_58585.txt'),
  read('resources/control/shakespeare_first300k.txt'),
  read('resources/control/emerson_essays_2944.txt')
];
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const entire = read('resources/liber-primus/lp2-transcription.txt');
const wordAll = [];
let word = [];
for (const symbol of entire) {
  const index = runeIndex.get(symbol);
  if (index !== undefined) word.push(index);
  else if ("-.'".includes(symbol) && word.length) {
    wordAll.push(word);
    word = [];
  }
}
const originalWords = wordAll.slice(0, 2896);
assert.equal(originalWords.length, 2896);
assert.deepStrictEqual(originalWords.flat(),
  corpus.pages.slice(0, 56).flatMap((page) => page.indices));
const beginningCount = corpus.pages[0].indices.length + corpus.pages[1].indices.length +
  corpus.pages[2].indices.length;
assert.equal(beginningCount, 729);
const chapterWords = [];
let used = 0;
for (const word of originalWords) {
  if (used >= beginningCount) break;
  assert.ok(used + word.length <= beginningCount);
  chapterWords.push(word);
  used += word.length;
}
assert.equal(used, beginningCount);
const starts = new Uint8Array(729), ends = new Uint8Array(729);
let offset = 0;
for (const w of chapterWords) {
  starts[offset] = 1;
  ends[offset + w.length - 1] = 1;
  offset += w.length;
}

/**
 * Longest-matching GP29 text transform.
 * @param {string} source
 * @returns {number[]}
 */
function normalize(source) {
  const text = source.toUpperCase().replaceAll('QU', 'CW')
    .replaceAll('V', 'U').replaceAll('K', 'C').replaceAll('Z', 'S')
    .replaceAll('ING', 'NG').replaceAll('IO', 'IA');
  const out = [];
  for (let i = 0; i < text.length;) {
    const p = letters.find((r) => text.startsWith(r.s, i));
    assert.ok(p, 'Unknown GP token '+source);
    out.push(p.i);
    i += p.s.length;
  }
  return out;
}
function wordsFrom(source) {
  return (source.match(/[A-Za-z]+/g) || []).map(normalize);
}
const donorWords = sources.map(wordsFrom);
const trainingWords = donorWords.flatMap((x) => x.slice(0, Math.floor(x.length * .7)));
const heldoutWords = donorWords.flatMap((x) => x.slice(Math.floor(x.length * .7)));
const lengths = new Map();
for (const p of heldoutWords) {
  if (!lengths.has(p.length)) lengths.set(p.length, []);
  lengths.get(p.length).push(p);
}
for (const w of chapterWords) assert.ok(lengths.get(w.length)?.length);

/**
 * Smoothed conditionals from independent source-native words.
 * Positive broad penalties for word-initial/end symmetries are trained
 * WITHOUT observing original LP2 ciphertext.
 */
function model() {
  const unigram = Array(29).fill(0), beginning = Array(29).fill(0);
  const ending = Array(29).fill(0);
  const pair = Array.from({length:29}, () => Array(29).fill(0));
  for (const word of trainingWords) {
    if (!word.length) continue;
    beginning[word[0]]++;
    ending[word[word.length - 1]]++;
    for (let j = 0; j < word.length; j++) {
      unigram[word[j]]++;
      if (j) pair[word[j - 1]][word[j]]++;
    }
  }
  const soft = (counts, smoothing) => {
    const total = counts.reduce((a,b) => a + b,0) + smoothing * 29;
    return counts.map((v) => Math.log((v + smoothing) / total));
  };
  const a = soft(beginning, .5), b = soft(ending, .5);
  const u = soft(unigram, 1);
  return {
    begin:a, end:b, unigram:u,
    pair:pair.map((row) => soft(row, .4)),
    grammarWords:trainingWords.length
  };
}
const lang = model();
const cipher = corpus.pages.slice(0,3).flatMap((page) => page.indices);
const key = [];
let number = 2;
for (let j = 0; j < cipher.length; number++) {
  let prime = number >= 2;
  for (let p = 2; p * p <= number && prime; p++) {
    if (number % p === 0) prime = false;
  }
  if (prime) key.push(mod(number - 1));
  j = key.length;
}
assert.equal(key.length, 729);
const train = 528, test = 201;
assert.equal(train, corpus.pages[0].indices.length + corpus.pages[1].indices.length);

/** @param {number} initial */
function random(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/** @param {()=>number} rng */
function shuffled(rng) {
  const a = Array.from({length:29}, (_,i) => i);
  for (let j = 28; j > 0; j--) {
    const k = Math.floor(rng() * (j + 1));
    [a[j],a[k]] = [a[k],a[j]];
  }
  return a;
}
/** @param {number[]} plaintext @param {number[]} permutation */
function encipher(plaintext, permutation) {
  return plaintext.map((x,i) => permutation[mod(x + key[i])]);
}
/** @param {number[]} encrypted @param {number[]} inverse */
function decipher(encrypted,inverse) {
  return encrypted.map((x,i) => mod(inverse[x] - key[i]));
}
/**
 * @param {number[]} text
 * @param {number} from
 * @param {number} to
 */
function fullScore(text, from, to) {
  let s=0;
  for (let j=from;j<to;j++) {
    const x=text[j];
    s+=.18*lang.unigram[x];
    s+=starts[j] || j===from ? lang.begin[x] : 1.85*lang.pair[text[j-1]][x];
    if (ends[j]) s+=.55*lang.end[x];
  }
  return s;
}
/** @param {number[]} encrypted */
function prepare(encrypted) {
  const positions = Array.from({length:29}, () => []);
  for(let j=0;j<train;j++) positions[encrypted[j]].push(j);
  const affected = Array.from({length:29},()=>Array(29));
  for(let a=0;a<29;a++)for(let b=a+1;b<29;b++) {
    const points=new Set();
    for(const c of [a,b])for(const j of positions[c]) {
      points.add(j);
      if(j+1<train && !starts[j+1]) points.add(j+1);
    }
    affected[a][b]=Array.from(points);
  }
  return {positions,affected};
}
/**
 * Incremental swap objective, score is local to affected sites.
 * @param {number[]} encrypted
 * @param {{positions:number[][],affected:number[][][]}} prep
 * @param {number[]} inverse
 * @param {number[]} decoded
 * @param {number} a
 * @param {number} b
 */
function swapDelta(encrypted,prep,inverse,decoded,a,b) {
  const impacted=prep.affected[a][b], before=impacted.reduce((s,j) => s+siteScore(decoded,j),0);
  [inverse[a],inverse[b]]=[inverse[b],inverse[a]];
  for(const j of prep.positions[a]) decoded[j]=mod(inverse[a]-key[j]);
  for(const j of prep.positions[b]) decoded[j]=mod(inverse[b]-key[j]);
  const after=impacted.reduce((s,j) => s+siteScore(decoded,j),0);
  return after-before;
}
/** @param {number[]} decoded @param {number} j */
function siteScore(decoded,j){
  const x=decoded[j];
  return .18*lang.unigram[x] +
    (starts[j] ? lang.begin[x] : 1.85*lang.pair[decoded[j-1]][x]) +
    (ends[j] ? .55*lang.end[x] : 0);
}
/**
 * Recover arbitrary cipher-alphabet inverse without knowing the 29! key.
 * Fixed simulated annealing schedule, multiple independent restarts.
 * @param {number[]} encrypted
 * @param {number} seed
 * @param {number} restarts
 * @param {number} steps
 */
function infer(encrypted, seed, restarts, steps) {
  const rng=random(seed), prep=prepare(encrypted);
  let best={score:-Infinity,inverse:[],restarts,steps};
  for(let r=0;r<restarts;r++){
    const inv=shuffled(rng),dec=decipher(encrypted,inv);
    let score=fullScore(dec,0,train);
    for(let t=0;t<steps;t++){
      const a=Math.floor(rng()*29),b0=Math.floor(rng()*28);
      const b=b0>=a?b0+1:b0;
      const low=Math.min(a,b),high=Math.max(a,b);
      const delta=swapDelta(encrypted,prep,inv,dec,low,high);
      const temp=7.0 * Math.pow(.13, t/steps);
      if(delta>=0||rng()<Math.exp(delta/temp))score+=delta;
      else swapDelta(encrypted,prep,inv,dec,low,high);
      if(score>best.score)best={score,inverse:inv.slice(),restarts,steps,atRestart:r,atStep:t};
    }
  }
  const result=decipher(encrypted,best.inverse);
  return {...best,
    trainScore:fullScore(result,0,train),
    heldoutScore:fullScore(result,train,729),
    trainPerRune:fullScore(result,0,train)/train,
    heldoutPerRune:fullScore(result,train,729)/test,
    opening:result.slice(0,90).map((x)=>corpus.translit[x]).join(' '),
    holdoutOpening:result.slice(train,train+90).map((x)=>corpus.translit[x]).join(' '),
    plaintext:result};
}
/** Positive keyed by independent heldout GP word source, no original word values. */
const rng=random(0x20143301);
const sourcePlant=chapterWords.flatMap((word) => {
  const options=lengths.get(word.length);
  return options[Math.floor(rng()*options.length)];
});
assert.equal(sourcePlant.length,729);
const secret=shuffled(rng);
const trueInverse=Array(29);
secret.forEach((v,i)=>trueInverse[v]=i);
const planted=encipher(sourcePlant,secret);
assert.deepStrictEqual(decipher(planted,trueInverse),sourcePlant);
const plantScore=fullScore(sourcePlant,0,train);
const randomInverse=shuffled(rng),wrong=decipher(planted,randomInverse);
const wrongScore=fullScore(wrong,0,train);
const positive=infer(planted,0x19ab0033,18,18000);
const original=infer(cipher,0x19ab0033,18,18000);
const plantCorrect=positive.plaintext.filter((x,i)=>x===sourcePlant[i]).length;
const cipherRoundTrip=encipher(original.plaintext,
  Array.from({length:29},(_,j)=>original.inverse.indexOf(j)));
assert.deepStrictEqual(cipherRoundTrip,cipher);
assert.ok(plantScore>wrongScore+400, 'positive must carry genuine GP language');
console.log(JSON.stringify({
  model:'C=sigma(P+phi(prime)) mod29; sigma unrestricted 29! permutation',
  originalChapter:[0,1,2],runes:729,trainingRunes:train,heldoutRunes:test,
  sourceWords:chapterWords.length,sourceEnglishTrainingWords:lang.grammarWords,
  positive:{trueTrainScore:plantScore,wrongTrainScore:wrongScore,
    recoveredRunes:plantCorrect,correctFraction:plantCorrect/729,
    recoveredPermutation:positive.inverse.every((x,i)=>x===trueInverse[i]),
    trainPerRune:positive.trainPerRune,heldoutPerRune:positive.heldoutPerRune},
  original:{trainPerRune:original.trainPerRune,
    heldoutPerRune:original.heldoutPerRune,
    first90:original.opening,heldoutFirst90:original.holdoutOpening},
  exactForwardReplay:'729/729',
  caveat:'English-like word shapes, known clock and fixed sigma only. Optimization may overfit training; a heldout score and exact plaintext are required.'
},null,2));
