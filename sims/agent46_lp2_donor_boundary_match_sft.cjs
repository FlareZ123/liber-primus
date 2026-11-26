'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const GP = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const LAW = JSON.parse(read('resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json'));
const RAW_LP2 = read('resources/liber-primus/lp2-transcription.txt');
const SELF_RAW = read('resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt');
const SH_RAW = read('resources/control/shakespeare_first300k.txt');
const GI_RAW = read('resources/control/gibran_prophet_58585.txt');
const CHAPTER_WORD_COUNTS = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const SEED = 3;
const MATCH_THRESHOLD = 20;

function nativeWordLengths(raw) {
  const tokens = GP.translit.slice().sort((a, b) => b.length - a.length);
  const out = [];
  for (let word of (raw.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    let count = 0;
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t, i));
      if (!token) throw new Error('Unmapped GP29 token in ' + word.slice(i));
      i += token.length;
      count++;
    }
    out.push(count);
  }
  return out;
}

function longestMatch(target, source, seed = SEED) {
  const index = new Map();
  const found = new Map();
  if (target.length < seed || source.length < seed) return { n: 0, targetWord: 0, sourceWord: 0 };
  for (let i = 0; i + seed <= target.length; i++) {
    const key = target.slice(i, i + seed).join(',');
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
  for (let j = 0; j + seed <= source.length; j++) {
    const key = source.slice(j, j + seed).join(',');
    for (const start of index.get(key) || []) {
      let i = start, b = j, n = seed;
      while (i > 0 && b > 0 && target[i - 1] === source[b - 1]) { i--; b--; n++; }
      while (i + n < target.length && b + n < source.length &&
             target[i + n] === source[b + n]) n++;
      const k = i + ':' + b;
      const old = found.get(k);
      if (!old || n > old.n) found.set(k, { n, targetWord: i, sourceWord: b });
    }
  }
  return [...found.values()].sort((a, b) =>
    b.n - a.n || a.targetWord - b.targetWord || a.sourceWord - b.sourceWord)[0]
    || { n: 0, targetWord: 0, sourceWord: 0 };
}

function sum(xs, start = 0, end = xs.length) {
  let n = 0;
  for (let i = start; i < end; i++) n += xs[i];
  return n;
}
function percentile(sorted, p) {
  return sorted[Math.max(0, Math.min(sorted.length - 1,
    Math.floor((sorted.length - 1) * p)))];
}
function sampleMatchedWindows(source, wordCount, runeCount, maxSamples = 128) {
  const prefix = new Float64Array(source.length + 1);
  for (let i = 0; i < source.length; i++) prefix[i + 1] = prefix[i] + source[i];
  let tolerance = 0, positions = [];
  for (const tol of [0, 1, 2, 5, 10, 20]) {
    positions = [];
    for (let i = 0; i + wordCount <= source.length; i++) {
      if (Math.abs((prefix[i + wordCount] - prefix[i]) - runeCount) <= tol) positions.push(i);
    }
    if (positions.length) { tolerance = tol; break; }
  }
  if (!positions.length) return { tolerance: null, candidates: 0, sampled: [] };
  const take = Math.min(maxSamples, positions.length);
  const sampled = [];
  for (let i = 0; i < take; i++) {
    const at = positions[Math.floor(i * (positions.length - 1) / Math.max(1, take - 1))];
    sampled.push({ at, words: source.slice(at, at + wordCount) });
  }
  return { tolerance, candidates: positions.length, sampled };
}
function controlSummary(target, windows) {
  const scores = windows.map(w => longestMatch(target, w.words).n).sort((a, b) => a - b);
  return {
    candidates: windows.length,
    max: scores.length ? scores[scores.length - 1] : 0,
    p95: scores.length ? percentile(scores, 0.95) : 0,
    median: scores.length ? percentile(scores, 0.5) : 0,
    min: scores.length ? scores[0] : 0
  };
}
function runeOffset(wordLengths, wordIndex) { return sum(wordLengths, 0, wordIndex); }

function run() {
  const parsed = parseLP2Words(RAW_LP2);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.crossPageWords, 32);
  assert.equal(GP.pages.filter(p => p.page >= 40 && p.page <= 53)
    .flatMap(p => p.indices).length, 3008);
  assert.equal(CHAPTER_WORD_COUNTS.reduce((a, b) => a + b, 0), parsed.words.length);
  const original = parsed.words.map(w => w.length);
  const chapters = [];
  let chapterStart = 0;
  for (const count of CHAPTER_WORD_COUNTS) {
    chapters.push({ wordStart: chapterStart, words: original.slice(chapterStart, chapterStart + count) });
    chapterStart += count;
  }
  assert.equal(chapters[7].words.length, 669);
  assert.equal(sum(chapters[7].words), 3008, 'chapter 8 is the p40-p53 3008-rune chapter');

  assert.equal(LAW.schema, 1);
  const lawSegments = LAW.chapters.map(c => ({
    name: '2013 Book of the Law, chapter ' + c.chapter,
    words: c.word_lengths,
    sourceBlob: c.source_blob_sha,
    sourceUrl: c.source_url
  }));
  assert.deepEqual(lawSegments.map(x => x.words.length), [1897, 1968, 2002]);
  const lawContinuous = { name: '2013 Book of the Law, continuous sensitivity', words: lawSegments.flatMap(x => x.words) };
  const selfLengths = nativeWordLengths(SELF_RAW);
  assert.equal(selfLengths.length, 10170);
  const donors = [
    ...lawSegments,
    { name: '2014 Self-Reliance witness', words: selfLengths }
  ];
  const controls = [
    { name: 'Shakespeare', words: nativeWordLengths(SH_RAW) },
    { name: 'Gibran', words: nativeWordLengths(GI_RAW) }
  ];

  const chapterResults = [];
  let overallBest = 0;
  for (let ci = 0; ci < chapters.length; ci++) {
    const target = chapters[ci].words;
    const donorRows = donors.map(d => {
      const m = longestMatch(target, d.words);
      const targetGlobalWord = chapters[ci].wordStart + m.targetWord;
      const targetGlobalRune = runeOffset(original, targetGlobalWord);
      const donorRune = runeOffset(d.words, m.sourceWord);
      const runeSpan = sum(target, m.targetWord, m.targetWord + m.n);
      return {
        donor: d.name, n: m.n, targetWord: m.targetWord,
        sourceWord: m.sourceWord, targetGlobalWord, targetGlobalRune,
        donorRune, runeSpan,
        cumulativeOffsetsAgree: target.slice(m.targetWord, m.targetWord + m.n)
          .every((x, j) => x === d.words[m.sourceWord + j])
      };
    });
    const continuous = longestMatch(target, lawContinuous.words);
    const controlRows = [];
    for (const d of donors) {
      const dRuneCount = sum(d.words);
      for (const c of controls) {
        const matched = sampleMatchedWindows(c.words, d.words.length, dRuneCount);
        const summary = controlSummary(target, matched.sampled);
        controlRows.push({
          donorSearchVolume: d.name, control: c.name,
          targetWordCount: target.length, donorWordCount: d.words.length,
          donorRuneCount: dRuneCount, tolerance: matched.tolerance,
          availableWindows: matched.candidates, ...summary
        });
      }
    }
    donorRows.sort((a, b) => b.n - a.n || a.donor.localeCompare(b.donor));
    const best = donorRows[0];
    overallBest = Math.max(overallBest, best.n);
    const allControlMax = Math.max(0, ...controlRows.map(x => x.max));
    chapterResults.push({
      chapter: ci + 1,
      lp2WordStart: chapters[ci].wordStart,
      wordCount: target.length,
      runeCount: sum(target),
      donorMatches: donorRows,
      continuousBookOfLawSensitivity: continuous.n,
      matchedNativeControls: controlRows,
      bestDonorWords: best.n,
      bestControlMax: allControlMax,
      donorExceedsAllSampledControls: best.n > allControlMax,
      fullChapterExactDonorMatch: donorRows.some(x => x.n === target.length)
    });
  }

  const plantWords = lawSegments[1].words.slice(333, 357);
  assert.equal(plantWords.length, 24);
  const planted = longestMatch(plantWords, lawSegments[1].words);
  assert(planted.n === 24 && planted.targetWord === 0 && planted.sourceWord === 333,
    '24-word boundary positive plant must be recovered');

  const p40 = chapterResults[7];
  return {
    decision: overallBest < MATCH_THRESHOLD
      ? 'No source-specific 20-word exact boundary donor; no plaintext crib or inverse was selected.'
      : 'A candidate >=20-word boundary match requires independent source and cipher validation.',
    thresholdWords: MATCH_THRESHOLD,
    matching: 'Exact GP29 rune-count per word; longest contiguous match uses 3-word seeds extended maximally both directions.',
    original: {
      words: parsed.words.length, runes: parsed.runeCount, crossPageWords: parsed.crossPageWords,
      chapterWordCounts: CHAPTER_WORD_COUNTS,
      p40p53: { chapter: 8, words: 669, runes: 3008 }
    },
    donors: donors.map(d => ({ name: d.name, words: d.words.length, runes: sum(d.words), sourceBlob: d.sourceBlob || null, sourceUrl: d.sourceUrl || null })),
    priorScreensNotRepeated: [
      '2012 Britannica, Agrippa and Mabinogion word-length cribs were already screened in lp2_2012_bookcode_wordlength_sft.cjs and lp2_2012_agrippa_wordlength_crib_sft.cjs; longest results were 7-14 words, no 20-word crib.',
      'Authenticated 2013 NEXT signed message was already screened in lp2_2013_signed_next_wordlength_sft.cjs; longest exact match was 8 words and no 11-word two-error extension.'
    ],
    chapters: chapterResults,
    p40p53Summary: {
      bestDonorWords: p40.bestDonorWords,
      bestDonor: p40.donorMatches[0].donor,
      targetWordStart: p40.donorMatches[0].targetGlobalWord,
      targetRuneStart: p40.donorMatches[0].targetGlobalRune,
      donorWordStart: p40.donorMatches[0].sourceWord,
      donorRuneStart: p40.donorMatches[0].donorRune,
      exactRuneSpan: p40.donorMatches[0].runeSpan,
      bestMatchedNativeControl: p40.bestControlMax,
      donorExceedsAllSampledControls: p40.donorExceedsAllSampledControls
    },
    positivePlant: { words: 24, recovered: planted.n, targetWord: planted.targetWord, donorWord: planted.sourceWord },
    noOriginalCipherInverseRun: overallBest < MATCH_THRESHOLD,
    caveat: 'The result is conditional on the repository LP2 transcription and pinned donor normalizations; no fresh image re-transcription was done.'
  };
}

const result = run();
const rendered = JSON.stringify(result, null, 2);
console.log(rendered);
if (process.env.RUNNER_TEMP) fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), rendered + '\n');
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    '### Agent46 LP2 donor boundary SFT\n\n' + rendered + '\n');
}
