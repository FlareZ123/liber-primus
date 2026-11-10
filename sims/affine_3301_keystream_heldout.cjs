'use strict';

/**
 * Test a six-state mod-29 keystream motivated by the observed LP2 echo
 * C[i] = 24 - 2*C[i-6] (mod 29), where 24 = 3301 mod 29.
 *
 * Candidate key rule K[i+6] = 24 - 2*K[i] (mod 29).
 * Six unknown starting states are selected by GP-English unigram likelihood
 * on one partition and assessed on disjoint ciphertext positions.
 *
 * Three declared reset policies are covered: one stream for all LP2 pages,
 * one six-state schedule shared by all words and restarted at each word,
 * and separate six-state schedules restarted on each manuscript page.
 *
 * The positive control plants a known GP plaintext and repairs 81% of
 * adjacent repeats, so it challenges both the seed estimator and tolerance
 * of the characteristic LP2 anti-doublet behavior.
 *
 * Run: node sims/affine_3301_keystream_heldout.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const DI = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const LET = {A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8,
  I:10, J:11, K:5, L:20, M:19, N:9, O:3, P:13, Q:5,
  R:4, S:15, T:16, U:1, V:1, W:7, X:14, Y:26, Z:15};

/** @param {string} name Repository-relative file path. */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

/** @param {string} value Raw manuscript plaintext transliteration. */
function encodeGP(value) {
  const output = [];
  const clean = value.replace(/^\s*#.*$/gm, ' ')
    .replace(/\[[^\]]*\]/g, ' ').toUpperCase();
  for (const match of clean.matchAll(/[A-Z]+/g)) {
    const word = match[0];
    for (let i = 0; i < word.length; i++) {
      const two = DI[word.slice(i, i + 2)];
      if (two !== undefined) {
        output.push(two);
        i++;
      } else {
        output.push(LET[word[i]]);
      }
    }
  }
  return output;
}

/** @param {string} text Canonical rune-bearing LP2 transcription. */
function parseWords(text) {
  const runes = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
  const indices = new Map(runes.map((value, index) => [value, index]));
  const joined = text.split('%').slice(0, 55).join('')
    .replace(/\/\s*\n/g, '');
  const words = joined.split(/[-.\s&$]+/).map(token =>
    [...token].filter(r => indices.has(r)).map(r => indices.get(r)))
    .filter(word => word.length);
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
  return words;
}

/** @param {number} value Integer, possibly negative. */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

const POWERS = [1];
for (let i = 1; i < 28; i++) POWERS.push(mod(-2 * POWERS[i - 1]));

/** @param {number} seed Starting key rune at the phase position.
 *  @param {number} position Position in current key-reset interval. */
function keyAt(seed, position) {
  return mod(8 + POWERS[Math.floor(position / 6) % 28] * (seed - 8));
}

/** @param {number[]} sequence Rune indices. */
function indexOfCoincidence(sequence) {
  const counts = Array(MOD).fill(0);
  for (const value of sequence) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

/** @param {number[][]} pages 55 rune-bearing pages.
 *  @param {number[][]} words 2896 displayed words.
 *  @param {'global'|'word'|'page'} policy Key reset policy. */
function makeGroups(pages, words, policy) {
  if (policy === 'global') {
    let position = 0;
    return [pages.flatMap((page, pageNo) => page.map(c =>
      ({c, position:position++, fold:pageNo % 2})))];
  }
  if (policy === 'word') {
    return [words.flatMap((word, wordNo) => word.map((c, position) =>
      ({c, position, fold:wordNo % 2})))];
  }
  return pages.map(page => page.map((c, position) =>
    ({c, position, fold:Math.floor(position / 6) % 2})));
}

/** @param {number[]} reference GP-English rune sample. */
function languageLog(reference) {
  const freq = Array(MOD).fill(0.5);
  reference.forEach(x => freq[x]++);
  const total = freq.reduce((sum, n) => sum + n, 0);
  return freq.map(n => Math.log(n / total));
}

/**
 * @param {Array<Array<{c:number,position:number,fold:number}>>} groups
 * @param {number[]} logp GP-English log-probabilities.
 * @param {number} sign +1 for C=P+K or -1 for C=P-K.
 * @param {number} trainFold Either 0 or 1.
 */
function fit(groups, logp, sign, trainFold) {
  const seeds = [];
  const train = [], test = [], all = [];
  for (const group of groups) {
    const localSeeds = [];
    for (let phase = 0; phase < 6; phase++) {
      let bestSeed = 0;
      let bestScore = -Infinity;
      for (let seed = 0; seed < MOD; seed++) {
        let score = 0;
        for (const item of group) {
          if (item.position % 6 !== phase || item.fold !== trainFold) continue;
          score += logp[mod(item.c - sign * keyAt(seed, item.position))];
        }
        if (score > bestScore) {
          bestScore = score;
          bestSeed = seed;
        }
      }
      localSeeds.push(bestSeed);
    }
    seeds.push(localSeeds);
    for (const item of group) {
      const p = mod(item.c - sign * keyAt(
        localSeeds[item.position % 6], item.position));
      all.push(p);
      (item.fold === trainFold ? train : test).push(p);
    }
  }
  return {
    sign,
    trainFold,
    allIoC: indexOfCoincidence(all),
    trainIoC: indexOfCoincidence(train),
    testIoC: indexOfCoincidence(test),
    seedHead: seeds.slice(0, 4),
    seeds
  };
}

/** Deterministic xorshift32 output in [0,1). */
function randomUnit() {
  let state = 0x3103301d;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Plant a known reference stream under the exact candidate, then reroute
 * about 81% of adjacent ciphertext doublets while preserving total length.
 * @param {Array<Array<{c:number,position:number,fold:number}>>} groups
 * @param {number[]} reference
 */
function plant(groups, reference) {
  const random = randomUnit();
  const seedSchedule = groups.map((group, gi) =>
    Array.from({length:6}, (_, phase) => (13 * gi + 7 * phase + 3) % MOD));
  let referenceIndex = 0;
  let previous = -1;
  let repaired = 0;
  const planted = groups.map((group, gi) => group.map(item => {
    const p = reference[referenceIndex++ % reference.length];
    const k = keyAt(seedSchedule[gi][item.position % 6], item.position);
    let c = mod(p + k);
    if (c === previous && random() < 0.81) {
      c = mod(c + 1);
      repaired++;
    }
    previous = c;
    return {...item, c};
  }));
  return {groups: planted, seedSchedule, repaired};
}

/** @param {number[][]} left
 *  @param {number[][]} right */
function correctSeeds(left, right) {
  let count = 0;
  for (let i = 0; i < right.length; i++)
    for (let j = 0; j < 6; j++) count += +(left[i][j] === right[i][j]);
  return count;
}

function main() {
  const jsonText = read('resources/liber-primus/lp2-corpus.json');
  const transcription = read('resources/lp2-transcription.txt');
  const lp1Text = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const corpus = JSON.parse(jsonText);
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
    .map(p => p.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.flat().length, 12956);
  const words = parseWords(transcription);
  const reference = encodeGP(lp1Text);
  assert.ok(reference.length > 3000);
  const logp = languageLog(reference);

  const report = {
    input: {
      jsonSha256:createHash('sha256').update(jsonText).digest('hex'),
      transcriptionSha256:createHash('sha256').update(transcription).digest('hex'),
      referenceSha256:createHash('sha256').update(lp1Text).digest('hex'),
      pages:pages.length, words:words.length, runes:pages.flat().length,
      referenceRunes:reference.length, observedIoC:indexOfCoincidence(pages.flat())
    },
    model:{
      modulus:29, recurrence:'K[i+6] = 24 - 2*K[i] mod 29',
      cycleLength:168, signs:[1,-1], folds:[0,1],
      positiveDoubletReroute:0.81, positiveSeed:0x3103301d
    },
    policies:{}
  };
  for (const policy of ['global', 'word', 'page']) {
    const groups = makeGroups(pages, words, policy);
    const observed = [];
    for (const sign of [1,-1])
      for (const fold of [0,1]) {
        const result = fit(groups, logp, sign, fold);
        delete result.seeds;
        observed.push(result);
      }
    const planted = plant(groups, reference);
    const control = fit(planted.groups, logp, 1, 0);
    const recovered = correctSeeds(control.seeds, planted.seedSchedule);
    const seedTotal = 6 * planted.seedSchedule.length;
    report.policies[policy] = {
      observed,
      planted:{
        repairedDoublets:planted.repaired,
        recoveredSeeds:recovered,
        possibleSeeds:seedTotal,
        heldoutIoC:control.testIoC,
        allIoC:control.allIoC
      }
    };
    assert.ok(control.testIoC > 0.045,
      'Positive control must reconstruct nonuniform GP language');
    if (policy !== 'page') assert.equal(recovered, seedTotal);
  }
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = {mod, keyAt, parseWords, encodeGP, indexOfCoincidence,
  makeGroups, fit, plant};
