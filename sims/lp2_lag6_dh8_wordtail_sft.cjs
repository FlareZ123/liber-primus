"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

/** @param {number} x @returns {number} Historically source-associated affine map. */
function t6(x) { return (24 - 2 * x + 58) % 29; }

/** @param {number} seed */
function generator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} w @returns {number} */
function doubles(w) {
  let n = 0;
  for (let i = 1; i < w.length; i++) if (w[i] === w[i - 1]) n++;
  return n;
}

/** @param {number[]} w @param {() => number} next @returns {number[]} */
function shuffledConditionalWord(w, next) {
  const want = doubles(w);
  for (let tries = 0; tries < 500; tries++) {
    const x = w.slice();
    for (let i = x.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [x[i], x[j]] = [x[j], x[i]];
    }
    if (doubles(x) === want) return x;
  }
  throw new Error("Unreachable doublet-preserving word shuffle");
}

/** @typedef {{len7:[number,number],end2:[number,number],body:[number,number]}} Bins */
/** @returns {Bins} */
function blank() { return {len7: [0,0], end2: [0,0], body: [0,0]}; }

/** @param {number[]} w @param {Bins} bins */
function countWord(w, bins) {
  for (let j = 6; j < w.length; j++) {
    const key = w.length === 7 ? "len7" : j >= w.length - 2 ? "end2" : "body";
    const pair = bins[key];
    pair[1]++;
    if (w[j] === t6(w[j - 6])) pair[0]++;
  }
}

/** @param {number[][]} words @returns {Bins} */
function countWords(words) {
  const bins = blank();
  for (const word of words) countWord(word, bins);
  return bins;
}

/** @param {number[]} lengths @param {() => number} next @param {number} p @returns {Bins} */
function simulateCollisionRepair(lengths, next, p) {
  const bins = blank();
  let previous = -1;
  for (const length of lengths) {
    const word = [];
    for (let j = 0; j < length; j++) {
      const tentative = next() % 29;
      let published = tentative;
      if (tentative === previous && next() / 4294967296 < p) {
        if (j >= 6) {
          published = t6(word[j - 6]);
          if (published === previous) published = (previous + 1 + next() % 28) % 29;
        } else {
          published = (previous + 1 + next() % 28) % 29;
        }
      }
      word.push(published);
      previous = published;
    }
    countWord(word, bins);
  }
  return bins;
}

/** @param {number[][]} words */
function execute(words) {
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
  const observed = countWords(words);
  assert.deepEqual(observed, {len7:[8,216],end2:[52,686],body:[20,388]});
  const midpoint = words.length / 2;
  const split = [countWords(words.slice(0, midpoint)), countWords(words.slice(midpoint))];
  assert.deepEqual(split, [
    {len7:[5,116],end2:[24,334],body:[11,195]},
    {len7:[3,100],end2:[28,352],body:[9,193]},
  ]);

  // Positive control: a synthetic all-word-tail T6 code must be recovered 686/686.
  const positive = words.map((w) => {
    const x = w.slice();
    if (x.length >= 8) {
      x[x.length - 2] = t6(x[x.length - 8]);
      x[x.length - 1] = t6(x[x.length - 7]);
    }
    return x;
  });
  assert.equal(countWords(positive).end2[0], 686);

  const keys = ["len7", "end2", "body"];
  const rng = generator(0x02013301);
  const iterations = 2000;
  const sum = [0,0,0], squared = [0,0,0], exceed = [0,0,0];
  for (let rep = 0; rep < iterations; rep++) {
    const draw = countWords(words.map(w => w.length >= 7 ? shuffledConditionalWord(w, rng) : w));
    for (let k = 0; k < keys.length; k++) {
      const value = draw[keys[k]][0];
      sum[k] += value;
      squared[k] += value * value;
      if (value >= observed[keys[k]][0]) exceed[k]++;
    }
  }
  const conditionalNull = Object.fromEntries(keys.map((key,k) => {
    const mean = sum[k] / iterations;
    return [key, {mean, sd: Math.sqrt(squared[k]/iterations - mean*mean),
      exceed: exceed[k], empiricalP: (exceed[k]+1)/(iterations+1)}];
  }));
  assert.equal(exceed[1], 0);

  const m1Iterations = 4000;
  const p = 1 - (29 * 86 / 12955);
  const m1Rng = generator(0x01a85c6d);
  const lengths = words.map(w => w.length);
  const m1Sample = [];
  let m1EndFractionExceed = 0;
  const m1Sum = [0,0,0];
  for (let rep = 0; rep < m1Iterations; rep++) {
    const draw = simulateCollisionRepair(lengths, m1Rng, p);
    const counts = keys.map(key => draw[key][0]);
    m1Sample.push(counts);
    for (let k = 0; k < 3; k++) m1Sum[k] += counts[k];
    const total = counts.reduce((a,b) => a+b, 0);
    if (counts[1] / total >= 52 / 80) m1EndFractionExceed++;
  }
  const m1Mean = m1Sum.map(x => x / m1Iterations);
  const score = counts => counts.reduce((a,x,k) => a + ((x-m1Mean[k])**2)/m1Mean[k],0);
  const scoreReal = score([8,52,20]);
  const m1JointExceed = m1Sample.filter(x=>score(x)>=scoreReal).length;
  // Exactly word-length-matched independent native-GP English controls.
  const {encode} = require("./affine_echo_literary_control.cjs");
  const literaryPaths = [
    "shakespeare_first300k.txt",
    "gibran_prophet_58585.txt",
    "emerson_essays_2944.txt",
  ];
  const referenceLengths = words.filter(w => w.length >= 7).map(w => w.length);
  const literaryControls = literaryPaths.map((file, sourceIndex) => {
    const sourceText = fs.readFileSync(path.join(__dirname, "..",
      "resources", "control", file), "utf8");
    const referenceWords = (sourceText.match(/[A-Za-z]+/g) || []).map(encode);
    const byLength = new Map();
    for (const word of referenceWords) {
      if (!byLength.has(word.length)) byLength.set(word.length, []);
      byLength.get(word.length).push(countWords([word]));
    }
    const next = generator(0x19895511 + sourceIndex + 2);
    const repetitions = 2000;
    const sums = [0,0,0], sumSquares = [0,0,0], atLeast = [0,0,0];
    for (let rep = 0; rep < repetitions; rep++) {
      const hits = [0,0,0];
      for (const length of referenceLengths) {
        const pool = byLength.get(length);
        assert.ok(pool && pool.length, "No reference word for length " + length);
        const row = pool[next() % pool.length];
        for (let k = 0; k < 3; k++) hits[k] += row[keys[k]][0];
      }
      for (let k = 0; k < 3; k++) {
        sums[k] += hits[k];
        sumSquares[k] += hits[k] * hits[k];
        if (hits[k] >= observed[keys[k]][0]) atLeast[k]++;
      }
    }
    return {
      file,wordsInReference:referenceWords.length,repetitions,
      groups:Object.fromEntries(keys.map((key,k) => {
        const mean=sums[k]/repetitions;
        return [key,{mean,sd:Math.sqrt(sumSquares[k]/repetitions-mean*mean),
          exceeds:atLeast[k],upperTail:(atLeast[k]+1)/(repetitions+1)}];
      })),
    };
  });

  console.log(JSON.stringify({
    input:{words:words.length,runes:12956,lag6Matches:80},
    observed,halves:split,
    conditionalNull:{seed:"0x02013301",replications:iterations,stats:conditionalNull},
    literaryControls,
    preexistingM1:{seed:"0x01a85c6d",replications:m1Iterations,collisionRepairProbability:p,
      expectedMeans:Object.fromEntries(keys.map((x,i)=>[x,m1Mean[i]])),
      end2FractionExceed:m1EndFractionExceed,
      jointScore:scoreReal,jointExceed:m1JointExceed},
    interpretation:"Preselected T6 excess is concentrated in final two positions of words length >=8; tail-specific inference is exploratory and is not a decryption."
  },null,2));
}

const {words, runeCount, crossPageWords} = parseSharedCorpus();
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
const alphabet = JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8")).runes;
assert.equal(alphabet.length,29);
const index = new Map(alphabet.map((r,i)=>[r,i]));
const normalized = words.map(w => [...w.runes].map(r => {
  assert.ok(index.has(r),"Invalid rune: "+r);
  return index.get(r);
}));
execute(normalized);
