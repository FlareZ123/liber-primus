'use strict';
/**
 * Joint forward-model test of a collision-triggered lag-six repair in LP2.
 * A tentative rune is uniform on 0..28 (equivalent to plaintext masked by
 * an independent uniform mod-29 pad). Whenever it matches the preceding
 * output rune, a repair occurs with probability q. Inside a word after
 * six symbols, the repair writes T(c[i-6]) = 24 - 2*c[i-6] mod 29.
 * Elsewhere, repair chooses uniformly among 28 nonmatching alternatives.
 *
 * The single free q is fixed by the ACTUAL total within-word plus
 * between-word immediate-doublet count BEFORE simulations.
 * The lag-six transform was itself selected after inspecting LP2 and must
 * not be interpreted as an independent blind prediction.
 *
 * Run with Node 22: node sims/lag6_collision_repair_joint.cjs
 * Optional numeric argument sets the number of replications.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const LOOKUP = new Map(RUNES.map((r, i) => [r, i]));
const SECTION_LENGTHS = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
const N = 29;

/** @param {number} v @returns {number} */
function affine(v) {
  return ((24 - 2 * v) % N + N) % N;
}

/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Physical page breaks do not create words or reset the local six-back
 * context. Sections have the nine verified continuous rune lengths.
 * @returns {{words:number[][], sections:number[], pageLengths:number[]}}
 */
function load() {
  const parsed = parseSharedCorpus();
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.crossPageWords, 32);
  const words = parsed.words.map(w => [...w.runes].map(r => {
    const value = LOOKUP.get(r);
    assert.notEqual(value, undefined);
    return value;
  }));
  const sections = [];
  let total = 0, section = 0, sectionEnd = SECTION_LENGTHS[0];
  for (const word of words) {
    while (total >= sectionEnd) {
      section++;
      sectionEnd += SECTION_LENGTHS[section];
    }
    assert.ok(total + word.length <= sectionEnd, 'Word crosses a section boundary');
    sections.push(section);
    total += word.length;
  }
  assert.equal(total, 12956);
  assert.equal(section, 8);
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
  assert.equal(pages.length, 55);
  const pageLengths = pages.map(p => p.indices.length);
  assert.deepEqual(words.flat(), pages.flatMap(p => p.indices));
  return {words, sections, pageLengths};
}

/**
 * @param {number[][]} words
 * @param {number[]} sections
 * @param {number[]} pageLengths
 */
function measure(words, sections, pageLengths) {
  const result = {inside: 0, cross: 0, lag6: 0, lag5S: 0,
    nonadj: 0, sUnigram: 0, insidePairs: 0, crossPairs: 0,
    lag6Pairs: 0, lag5Pairs: 0, nonadjPairs: 0};
  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi];
    for (let j = 0; j < word.length; j++) {
      const value = word[j];
      result.sUnigram += Number(value === 15);
      if (j > 0) {
        result.insidePairs++;
        result.inside += Number(value === word[j-1]);
      } else if (wi > 0 && sections[wi] === sections[wi-1]) {
        result.crossPairs++;
        result.cross += Number(value === words[wi-1].at(-1));
      }
      if (j >= 6) {
        result.lag6Pairs++;
        result.lag6 += Number(value === affine(word[j-6]));
      }
      if (j >= 5) {
        result.lag5Pairs++;
        result.lag5S += Number(value === 15 && word[j-5] === 15);
      }
    }
    if (word.length >= 4 && word.length <= 9) {
      for (let i = 0; i < word.length; i++) {
        for (let j = i + 2; j < word.length; j++) {
          result.nonadjPairs++;
          result.nonadj += Number(word[i] === word[j]);
        }
      }
    }
  }
  const flat = words.flat();
  const pageCounts = new Uint16Array(29 * Math.max(...pageLengths));
  const pagePrior = new Uint16Array(Math.max(...pageLengths));
  let offset = 0, pageHits = 0, pagePairs = 0;
  for (const length of pageLengths) {
    for (let i = 0; i < length; i++) {
      pageHits += pageCounts[29*i+flat[offset+i]]++;
      pagePairs += pagePrior[i]++;
    }
    offset += length;
  }
  assert.equal(offset, 12956);
  return {...result, pageHits, pagePairs};
}

/**
 * @param {number[]} lengths
 * @param {number[]} sections
 * @param {number} q
 * @param {'random'|'lag6'} mode
 * @param {() => number} rng
 * @returns {number[][]}
 */
function forward(lengths, sections, q, mode, rng) {
  const words = [];
  let previous = -1, activeSection = -1;
  for (let wi = 0; wi < lengths.length; wi++) {
    if (sections[wi] !== activeSection) {
      previous = -1;
      activeSection = sections[wi];
    }
    const word = [];
    for (let j = 0; j < lengths[wi]; j++) {
      let value = Math.floor(29 * rng());
      if (value === previous && rng() < q) {
        if (mode === 'lag6' && j >= 6) {
          value = affine(word[j-6]);
        } else {
          const rank = Math.floor(28 * rng());
          value = rank + Number(rank >= previous);
        }
      }
      word.push(value);
      previous = value;
    }
    words.push(word);
  }
  return words;
}

/** @param {number[]} values @param {number} actual */
function summarize(values, actual) {
  const sorted = values.slice().sort((a,b) => a-b);
  const n = sorted.length;
  const mean = values.reduce((a,b) => a+b, 0) / n;
  return {observed:actual, mean, q025:sorted[Math.floor((n-1)*0.025)],
    q975:sorted[Math.floor((n-1)*0.975)],
    p_upper:(1+values.filter(v => v >= actual).length)/(n+1),
    p_lower:(1+values.filter(v => v <= actual).length)/(n+1)};
}

/** @param {number} trials */
function run(trials = 2500) {
  assert.ok(Number.isSafeInteger(trials) && trials > 0);
  const input = load();
  const original = measure(input.words, input.sections, input.pageLengths);
  assert.deepEqual([
    original.inside, original.insidePairs, original.cross, original.crossPairs,
    original.lag6, original.lag6Pairs, original.lag5S, original.lag5Pairs,
    original.nonadj, original.nonadjPairs, original.sUnigram,
    original.pageHits, original.pagePairs
  ], [63,10060,23,2887,80,1290,11,2105,526,14701,434,10751,311132]);
  const adjacency = original.insidePairs + original.crossPairs;
  const doubles = original.inside + original.cross;
  const q = (adjacency/29-doubles)/(adjacency/29-original.lag6Pairs/(29*29));
  assert.ok(q > 0 && q < 1);
  const keys = ['inside','cross','lag6','lag5S','nonadj','sUnigram','pageHits'];
  const lengths = input.words.map(w => w.length);
  const comparisons = {};
  for (const [mode,seed] of [['random',0x72657061], ['lag6',0x72657062]]) {
    const rng = random(seed);
    const values = Object.fromEntries(keys.map(k => [k,[]]));
    for (let trial = 0; trial < trials; trial++) {
      const synthetic = measure(
        forward(lengths, input.sections, q, mode, rng),
        input.sections, input.pageLengths);
      for (const key of keys) values[key].push(synthetic[key]);
    }
    comparisons[mode] = {seed:'0x'+seed.toString(16),
      diagnostics:Object.fromEntries(
        keys.map(key => [key,summarize(values[key],original[key])]))};
  }
  return {status:'exploratory conditional forward-model test, no plaintext/key',
    trials, calibration:'q from 86 word/internal boundary doublets',
    q, model:'Uniform mod-29 tentative symbols; upon collision, q-selective rewrite',
    lag6_rule:'T(x)=24-2*x mod29 when word offset >=6; otherwise uniform other rune',
    actual:original, comparisons,
    caveat:'Lag-six map is post-selected; lag-five S remains an unexplained independent diagnostic.'};
}

if (require.main === module) {
  const trials = process.argv[2] === undefined ? 2500 : Number(process.argv[2]);
  console.log(JSON.stringify(run(trials), null, 2));
}
module.exports = {affine, load, measure, forward, run};
