"use strict";
/**
 * Word-trie + smoothed trigram exact inverse for the candidate LP2 collision-T
 * overwrite, CONDITIONAL on an already-known additive modulo-29 keystream.
 * 
 * Trains on Shakespeare characters [0,200000), selects a source-model mixing
 * weight on [200000,240000), and evaluates once on [240000,300000).
 * No original LP2 key is assumed or recovered.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const { words, category, flatten, training } = require("./outer_permutation_word_context.cjs");
const { encipher, decipher } = require("./lag6_repair_keyed_inverse.cjs");

const M = 29;
const BOS = 29;
const Q = 0.81;
const mod = x => (x % M + M) % M;

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}

/** @returns {{next:Map<number, any>, count:number}} */
function node() { return { next: new Map(), count: 0 }; }

/** @param {number[][]} source */
function train(source) {
  const local = training(flatten(source));
  const lengths = new Map();
  const bigram = new Map();
  const trigram = new Map();
  /** @param {Map<number, number[]>} table @param {number} key @param {number} c */
  function add(table, key, c) {
    let counts = table.get(key);
    if (!counts) { counts = Array(M + 1).fill(0); table.set(key, counts); }
    counts[c]++;
    counts[M]++;
  }
  for (const word of source) {
    let bucket = lengths.get(word.length);
    if (!bucket) { bucket = { root: node(), total: 0 }; lengths.set(word.length, bucket); }
    bucket.total++;
    let here = bucket.root;
    let a = BOS, b = BOS;
    for (const c of word) {
      if (!here.next.has(c)) here.next.set(c, node());
      here = here.next.get(c);
      add(bigram, b, c);
      add(trigram, a * (M + 1) + b, c);
      a = b;
      b = c;
    }
    here.count++;
  }
  return { local, lengths, bigram, trigram };
}

/**
 * Exact conditional emission set under the specified collision rewrite.
 * @param {number[][]} ciphertext
 * @param {number[]} pad
 * @returns {{candidate:number, logEmission:number}[][][]}
 */
function inverseCandidates(ciphertext, pad) {
  const out = [];
  let last = -1, offset = 0;
  for (const word of ciphertext) {
    const options = [];
    for (let j = 0; j < word.length; j++) {
      const c = word[j];
      const t = j >= 6 ? mod(24 - 2 * word[j - 6]) : -1;
      const p0 = mod(c - pad[offset++]);
      const unchanged = c === last ? (j >= 6 && t === last ? 1 : 1 - Q) : 1;
      const row = [{ candidate: p0, logEmission: Math.log(unchanged) }];
      if (last >= 0 && c !== last && (j < 6 || c === t)) {
        row.push({ candidate: mod(last - pad[offset - 1]),
          logEmission: Math.log(j >= 6 ? Q : Q / 28) });
      }
      options.push(row);
      last = c;
    }
    out.push(options);
  }
  assert.equal(offset, pad.length);
  return out;
}

/** @param {ReturnType<typeof train>} model */
function ngramProbability(model, a, b, c, cls) {
  const logPos = model.local.logProb[cls];
  const prior = logPos ? Math.exp(logPos[c]) : model.local.prior[c];
  const row1 = model.bigram.get(b);
  const p1 = ((row1 ? row1[c] : 0) + 12 * prior) /
    ((row1 ? row1[M] : 0) + 12);
  const row2 = model.trigram.get(a * (M + 1) + b);
  return ((row2 ? row2[c] : 0) + 8 * p1) /
    ((row2 ? row2[M] : 0) + 8);
}

/**
 * Exact Viterbi over two candidate symbols at each word position.
 * @param {{candidate:number, logEmission:number}[][]} options
 * @param {ReturnType<typeof train>} model
 * @param {number} mix
 * @returns {{sequence:number[], score:number, origin:string}}
 */
function decodeWord(options, model, mix) {
  const len = options.length;
  let states = new Map([[BOS * (M + 1) + BOS, {score: Math.log(1 - mix), sequence: []}]]);
  for (let j = 0; j < len; j++) {
    const next = new Map();
    for (const [state, entry] of states) {
      const a = Math.floor(state / (M + 1)), b = state % (M + 1);
      for (const option of options[j]) {
        const c = option.candidate;
        const score = entry.score + option.logEmission +
          Math.log(ngramProbability(model, a, b, c, category(len, j)));
        const key = b * (M + 1) + c;
        const incumbent = next.get(key);
        if (!incumbent || score > incumbent.score) {
          next.set(key, {score, sequence: [...entry.sequence, c]});
        }
      }
    }
    states = next;
  }
  let best = {sequence: [], score: -Infinity, origin: "ngram"};
  for (const entry of states.values()) {
    if (entry.score > best.score) best = {...entry, origin: "ngram"};
  }
  const bucket = model.lengths.get(len);
  if (bucket) {
    /**
     * Traverse only dictionary prefixes permitted by exact inverse emissions.
     * @param {{next:Map<number, any>, count:number}} current
     * @param {number} j
     * @param {number} score
     * @param {number[]} sequence
     */
    function visit(current, j, score, sequence) {
      if (j === len) {
        if (current.count > 0) {
          const posterior = Math.log(mix) + Math.log(current.count / bucket.total) + score;
          if (posterior > best.score) {
            best = {sequence: sequence.slice(), score: posterior, origin: "lexicon"};
          }
        }
        return;
      }
      for (const option of options[j]) {
        const next = current.next.get(option.candidate);
        if (next) {
          sequence.push(option.candidate);
          visit(next, j + 1, score + option.logEmission, sequence);
          sequence.pop();
        }
      }
    }
    visit(bucket.root, 0, 0, []);
  }
  assert.equal(best.sequence.length, len);
  return best;
}

/** @param {number[][]} ciphertext @param {number[]} pad @param {ReturnType<typeof train>} model @param {number} mix */
function decode(ciphertext, pad, model, mix) {
  const options = inverseCandidates(ciphertext, pad);
  return options.map(word => decodeWord(word, model, mix));
}

/**
 * Reproducible heldout ciphertext with exact 2,896 LP2 word lengths.
 * @param {number[][]} sourceWords
 * @param {number[]} wordLengths
 * @param {number} seed
 */
function plant(sourceWords, wordLengths, seed) {
  const random = rng(seed);
  const bins = new Map(), stream = sourceWords.flat();
  for (const word of sourceWords) {
    if (!bins.has(word.length)) bins.set(word.length, []);
    bins.get(word.length).push(word);
  }
  let fallbackWords = 0;
  const plaintext = wordLengths.map(n => {
    const bin = bins.get(n);
    if (bin && bin.length) return bin[Math.floor(random() * bin.length)];
    fallbackWords++;
    const start = Math.floor(random() * (stream.length - n));
    return stream.slice(start, start + n);
  });
  const pad = Array.from({length:wordLengths.reduce((a,b)=>a+b,0)},
    () => Math.floor(random() * M));
  const encrypted = encipher(plaintext, pad, random, Q);
  return {plaintext, pad, encrypted, fallbackWords};
}

/** @param {ReturnType<typeof plant>} sample @param {ReturnType<typeof train>} model @param {number[]} mixtures */
function evaluate(sample, model, mixtures) {
  const flat = sample.plaintext.flat();
  const local = decipher(sample.encrypted.ciphertext, sample.pad, model.local, Q);
  const countCorrect = seq => seq.reduce((n, c, i) => n + Number(c === flat[i]), 0);
  const result = {
    total: flat.length,
    actualOverwrites: sample.encrypted.rewritten.filter(Boolean).length,
    fallbackWords: sample.fallbackWords,
    literalCorrect: countCorrect(local.bare.flat()),
    localCorrect: countCorrect(local.decoded.flat()),
    models: {}
  };
  for (const mix of mixtures) {
    const output = decode(sample.encrypted.ciphertext, sample.pad, model, mix);
    const seq = output.flatMap(x=>x.sequence);
    result.models[mix] = {
      correct: countCorrect(seq),
      lexicalWords: output.filter(x=>x.origin==="lexicon").length,
      exactlyCorrectWords: output.filter((x,i)=>
        x.sequence.every((c,j)=>c===sample.plaintext[i][j])).length
    };
  }
  return result;
}

function run() {
  const raw = fs.readFileSync(path.join(__dirname, "..", "resources", "control",
    "shakespeare_first300k.txt"), "utf8");
  assert.equal(raw.length, 300000);
  const trainWords = words(raw.slice(0, 200000));
  const validationWords = words(raw.slice(200000, 240000));
  const testWords = words(raw.slice(240000));
  const model = train(trainWords);
  const parsed = parseSharedCorpus();
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  const wordLengths = parsed.words.map(w=>w.length);
  const choices = [0.3, 0.7, 0.95, 0.99];
  const validation = evaluate(plant(validationWords, wordLengths, 0x391701), model, choices);
  const bestMix = choices.reduce((best, mix) =>
    validation.models[mix].correct > validation.models[best].correct ? mix : best, choices[0]);
  const finalPlant = plant(testWords, wordLengths, 0x391702);
  const test = evaluate(finalPlant, model, [bestMix]);
  const wrongRandom = rng(0x391703);
  const wrongPad = finalPlant.pad.map(() => Math.floor(wrongRandom() * M));
  const wrongOutput = decode(finalPlant.encrypted.ciphertext, wrongPad, model, bestMix);
  const truth = finalPlant.plaintext.flat();
  const wrongPlain = wrongOutput.flatMap(x => x.sequence);
  const wrongKey = {
    keyMismatch: wrongPad.filter((x,i) => x !== finalPlant.pad[i]).length,
    runeCorrect: wrongPlain.filter((x,i) => x === truth[i]).length,
    lexicalWords: wrongOutput.filter(x => x.origin === "lexicon").length
  };
  const independentAuthors = {};
  for (const [name, filename, seed] of [
    ["Gibran", "gibran_prophet_58585.txt", 0x391704],
    ["Emerson", "emerson_essays_2944.txt", 0x391705]
  ]) {
    const source = fs.readFileSync(path.join(__dirname, "..", "resources", "control", filename), "utf8");
    independentAuthors[name] = evaluate(plant(words(source), wordLengths, seed), model, [bestMix]);
  }
  return {
    classification: "synthetic heldout known-key inversion; not an original LP2 decryption",
    algorithm: "exact two-candidate emission plus word-prefix-trie lexical prior and second-order GP ngram Viterbi",
    originalLP2Input: "only exact 2896 canonical ciphertext word lengths",
    plaintextSource: "Shakespeare GP-encoded words",
    sourceSplitCharacters: {train:[0,200000],validation:[200000,240000],test:[240000,300000]},
    seedValidation:"0x391701", seedTest:"0x391702", q:Q,
    trainedUniqueWordLengths: model.lengths.size,
    validation, selectedMix:bestMix, test, wrongKey, independentAuthors
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {train, inverseCandidates, decodeWord, decode, plant, evaluate, run};
