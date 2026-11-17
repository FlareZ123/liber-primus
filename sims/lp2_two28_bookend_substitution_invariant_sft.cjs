'use strict';

/**
 * Key-independent exclusions for two source-motivated static GP29 models:
 *   (A) one arbitrary substitution bijection per paired page (p, p+28);
 *   (B) fourteen shared substitution bijections with phase reset per physical
 *       page or per visual chapter.
 *
 * Each bijection preserves same-symbol pair counts in its equivalence class.
 * This script tests those exact invariants on original LP2 and matched,
 * non-overlapping GP-native English control windows. It does not infer keys.
 *
 * Node.js 22+, built-in libraries only. Run from repository root:
 *   node sims/lp2_two28_bookend_substitution_invariant_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PERIOD = 14;
const TOTAL = 12956;
const CHAPTER_LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const CONTROL_FILES = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt']
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const allPages = corpus.pages.filter(p => p.page >= 0 && p.page < 56);
assert.equal(allPages.length, 56);
const pages = allPages.map(p => p.indices);
const pageLengths = pages.map(p => p.length);
const flat = pages.flat();
assert.equal(pages.filter(p => p.length > 0).length, 55);
assert.equal(pages[50].length, 0);
assert.equal(flat.length, TOTAL);
assert.equal(CHAPTER_LENGTHS.reduce((a, b) => a + b, 0), TOTAL);
assert.deepEqual(corpus.translit[21], 'NG');
assert.deepEqual(corpus.translit[27], 'IA');

function splitByLengths(values, lengths) {
  let offset = 0;
  const result = lengths.map(length => {
    const segment = values.slice(offset, offset + length);
    offset += length;
    return segment;
  });
  assert.equal(offset, values.length);
  return result;
}

function pairSegments(sourcePages) {
  return Array.from({ length: 28 }, (_, p) =>
    sourcePages[p].concat(sourcePages[p + 28]));
}

function coincidence(segments) {
  let same = 0;
  let pairs = 0;
  const per = segments.map((segment, index) => {
    const counts = new Uint32Array(29);
    for (const rune of segment) {
      assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
      counts[rune]++;
    }
    const n = segment.length;
    let localSame = 0;
    for (const count of counts) localSame += count * (count - 1);
    const localPairs = n * (n - 1);
    same += localSame;
    pairs += localPairs;
    return {
      index,
      n,
      same: localSame,
      pairs: localPairs,
      ic: localPairs ? localSame / localPairs : null
    };
  });
  assert.ok(pairs > 0);
  return { same, pairs, ic: same / pairs, per };
}

function phaseCoincidence(segments) {
  const counts = Array.from({ length: PERIOD }, () => new Uint32Array(29));
  const sizes = new Uint32Array(PERIOD);
  for (const segment of segments) {
    for (let i = 0; i < segment.length; i++) {
      const phase = i % PERIOD;
      counts[phase][segment[i]]++;
      sizes[phase]++;
    }
  }
  const per = counts.map((row, phase) => {
    let same = 0;
    for (const count of row) same += count * (count - 1);
    const pairs = sizes[phase] * (sizes[phase] - 1);
    return {
      phase,
      n: sizes[phase],
      same,
      pairs,
      ic: same / pairs
    };
  });
  return {
    same: per.reduce((s, x) => s + x.same, 0),
    pairs: per.reduce((s, x) => s + x.pairs, 0),
    pooledIC: per.reduce((s, x) => s + x.same, 0) /
      per.reduce((s, x) => s + x.pairs, 0),
    meanPhaseIC: per.reduce((s, x) => s + x.ic, 0) / PERIOD,
    minPhaseIC: Math.min(...per.map(x => x.ic)),
    maxPhaseIC: Math.max(...per.map(x => x.ic)),
    per
  };
}

const translitMap = new Map(corpus.translit.map((label, index) => [label, index]));

function encodeEnglishWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith('ING', i)) {
      output.push(21);
      i += 3;
      continue;
    }
    if (normalized.startsWith('IO', i)) {
      output.push(27);
      i += 2;
      continue;
    }
    const digraph = normalized.slice(i, i + 2);
    if (translitMap.has(digraph)) {
      output.push(translitMap.get(digraph));
      i += 2;
      continue;
    }
    const single = translitMap.get(normalized[i]);
    assert.notEqual(single, undefined,
      'Unmapped GP-native control character: ' + normalized[i]);
    output.push(single);
    i++;
  }
  return output;
}

function encodeEnglishText(text) {
  return (text.match(/[A-Za-z]+/g) || []).flatMap(encodeEnglishWord);
}

function summary(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    count: sorted.length,
    mean: sorted.reduce((a, b) => a + b, 0) / sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function randomPermutation(random) {
  const map = Array.from({ length: 29 }, (_, i) => i);
  for (let i = map.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [map[i], map[j]] = [map[j], map[i]];
  }
  return map;
}

function applyPhaseMaps(segments, maps) {
  return segments.map(segment =>
    segment.map((rune, i) => maps[i % PERIOD][rune]));
}

function findSixRuneEcho() {
  const target = pages[27].slice(28, 34);
  assert.deepEqual(target, pages[55].slice(70, 76));
  const occurrences = [];
  for (let page = 0; page < pages.length; page++) {
    for (let offset = 0; offset + 6 <= pages[page].length; offset++) {
      if (pages[page].slice(offset, offset + 6).every((x, j) => x === target[j])) {
        occurrences.push({ page, offset });
      }
    }
  }
  assert.deepEqual(occurrences, [
    { page: 27, offset: 28 },
    { page: 55, offset: 70 }
  ]);

  const crossPagePairs = [];
  for (let p = 0; p < pages.length; p++) {
    const left = new Set();
    for (let i = 0; i + 6 <= pages[p].length; i++)
      left.add(pages[p].slice(i, i + 6).join(','));
    for (let q = p + 1; q < pages.length; q++) {
      let matches = 0;
      for (let i = 0; i + 6 <= pages[q].length; i++)
        if (left.has(pages[q].slice(i, i + 6).join(','))) matches++;
      if (matches) crossPagePairs.push({ p, q, matches });
    }
  }
  assert.deepEqual(crossPagePairs, [{ p: 27, q: 55, matches: 1 }]);
  return {
    gpIndices: target,
    transliteration: target.map(x => corpus.translit[x]),
    occurrences,
    crossPagePairs,
    localPhases: [28 % PERIOD, 70 % PERIOD],
    pagePairIndex: [27, 55],
    globalOffsets: [6555, 12950],
    globalPhases: [6555 % PERIOD, 12950 % PERIOD]
  };
}

function run() {
  const chapterSegments = splitByLengths(flat, CHAPTER_LENGTHS);
  const originalPairSegments = pairSegments(pages);
  const originalPair = coincidence(originalPairSegments);
  const originalPagePhase = phaseCoincidence(pages);
  const originalChapterPhase = phaseCoincidence(chapterSegments);

  const controlWindows = [];
  const controlSourceLengths = {};
  for (const [name, file] of CONTROL_FILES) {
    const encoded = encodeEnglishText(read(file));
    controlSourceLengths[name] = encoded.length;
    assert.ok(encoded.length >= TOTAL);
    for (let offset = 0; offset + TOTAL <= encoded.length; offset += TOTAL) {
      const sample = encoded.slice(offset, offset + TOTAL);
      const samplePages = splitByLengths(sample, pageLengths);
      const sampleChapters = splitByLengths(sample, CHAPTER_LENGTHS);
      const samplePairs = pairSegments(samplePages);
      controlWindows.push({
        name,
        offset,
        pairSegments: samplePairs,
        pageSegments: samplePages,
        chapterSegments: sampleChapters,
        pair: coincidence(samplePairs),
        pagePhase: phaseCoincidence(samplePages),
        chapterPhase: phaseCoincidence(sampleChapters)
      });
    }
  }
  assert.equal(controlWindows.filter(x => x.name === 'Shakespeare').length, 16);
  assert.equal(controlWindows.filter(x => x.name === 'Gibran').length, 4);

  const controlPairWindowIC = controlWindows.map(x => x.pair.ic);
  const controlPairSegmentIC = controlWindows.flatMap(x =>
    x.pair.per.map(y => y.ic));
  const controlPagePhaseIC = controlWindows.flatMap(x =>
    x.pagePhase.per.map(y => y.ic));
  const controlChapterPhaseIC = controlWindows.flatMap(x =>
    x.chapterPhase.per.map(y => y.ic));

  assert.ok(Math.max(...originalPair.per.map(x => x.ic)) <
    Math.min(...controlPairSegmentIC));
  assert.ok(originalPagePhase.maxPhaseIC < Math.min(...controlPagePhaseIC));
  assert.ok(originalChapterPhase.maxPhaseIC < Math.min(...controlChapterPhaseIC));

  // Exact positive sanity checks: random secret bijections cannot change
  // the equality counts in their own declared classes.
  const random = xorshift32(0x28141755);
  const positive = controlWindows[0];
  const pairMaps = Array.from({ length: 28 }, () => randomPermutation(random));
  const mappedPairs = positive.pairSegments.map((segment, p) =>
    segment.map(rune => pairMaps[p][rune]));
  const beforePair = coincidence(positive.pairSegments);
  const afterPair = coincidence(mappedPairs);
  assert.deepEqual(
    beforePair.per.map(x => [x.same, x.pairs]),
    afterPair.per.map(x => [x.same, x.pairs])
  );

  const phaseMaps = Array.from({ length: PERIOD }, () => randomPermutation(random));
  const mappedPages = applyPhaseMaps(positive.pageSegments, phaseMaps);
  const mappedChapters = applyPhaseMaps(positive.chapterSegments, phaseMaps);
  const beforePagePhase = phaseCoincidence(positive.pageSegments);
  const afterPagePhase = phaseCoincidence(mappedPages);
  const beforeChapterPhase = phaseCoincidence(positive.chapterSegments);
  const afterChapterPhase = phaseCoincidence(mappedChapters);
  assert.deepEqual(
    beforePagePhase.per.map(x => [x.same, x.pairs]),
    afterPagePhase.per.map(x => [x.same, x.pairs])
  );
  assert.deepEqual(
    beforeChapterPhase.per.map(x => [x.same, x.pairs]),
    afterChapterPhase.per.map(x => [x.same, x.pairs])
  );

  const echo = findSixRuneEcho();
  const pageControlBySource = {};
  for (const name of ['Shakespeare', 'Gibran']) {
    const rows = controlWindows.filter(x => x.name === name);
    pageControlBySource[name] = {
      windows: rows.length,
      pagePhaseMean: summary(rows.flatMap(x => x.pagePhase.per.map(y => y.ic))),
      chapterPhaseMean: summary(rows.flatMap(x => x.chapterPhase.per.map(y => y.ic))),
      pairWindowMean: summary(rows.map(x => x.pair.ic)),
      pairSegmentIC: summary(rows.flatMap(x => x.pair.per.map(y => y.ic)))
    };
  }

  const result = {
    model: {
      pair: 'One arbitrary GP29 bijection per corresponding physical page pair (p,p+28), p=0..27',
      phase: 'Fourteen shared GP29 bijections, phase = local rune offset mod14, reset at each page or visual chapter',
      invariant: 'Every fixed bijection preserves exact same-symbol pair counts within its class'
    },
    original: {
      pages: 56,
      runeBearingPages: 55,
      runes: flat.length,
      runelessPage: 50,
      pair: {
        samePairs: originalPair.same,
        totalPairs: originalPair.pairs,
        pooledIC: originalPair.ic,
        minPairIC: Math.min(...originalPair.per.map(x => x.ic)),
        maxPairIC: Math.max(...originalPair.per.map(x => x.ic)),
        perPair: originalPair.per.map((x, p) => ({
          pages: [p, p + 28],
          runes: x.n,
          ic: x.ic
        }))
      },
      pageReset14: {
        meanPhaseIC: originalPagePhase.meanPhaseIC,
        minPhaseIC: originalPagePhase.minPhaseIC,
        maxPhaseIC: originalPagePhase.maxPhaseIC,
        perPhase: originalPagePhase.per
      },
      chapterReset14: {
        meanPhaseIC: originalChapterPhase.meanPhaseIC,
        minPhaseIC: originalChapterPhase.minPhaseIC,
        maxPhaseIC: originalChapterPhase.maxPhaseIC,
        perPhase: originalChapterPhase.per
      }
    },
    controls: {
      sourceLengths: controlSourceLengths,
      nonOverlappingWindows: controlWindows.length,
      pairWindowIC: summary(controlPairWindowIC),
      pairSegmentIC: summary(controlPairSegmentIC),
      pageReset14PhaseIC: summary(controlPagePhaseIC),
      chapterReset14PhaseIC: summary(controlChapterPhaseIC),
      bySource: pageControlBySource
    },
    positiveSanity: {
      randomPairPermutations: 28,
      pairCountsPreserved: true,
      randomPhasePermutations: PERIOD,
      pagePhaseCountsPreserved: true,
      chapterPhaseCountsPreserved: true
    },
    knownEcho: echo,
    interpretation: 'The page-pair and page/chapter-reset 14-phase static substitution families are excluded for the tested ordinary GP-native English register. The continuous 14-phase case is a consistency check; the existing phase_coincidence_invariant.cjs already scans continuous periods 2..1600.',
    limitations: [
      'Does not exclude 14-column transposition or any other positional transposition.',
      'Does not exclude a separate substitution per physical page, independent page-specific phase offsets, or keys changing inside a page.',
      'Does not exclude non-bijective/homophonic, nonlinear, feedback, skip-clock, or other-register models.',
      'The repeated p27/p55 six-rune block is an observation, not proof of identical plaintext or an authored key selector.'
    ]
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) run();
module.exports = { run, coincidence, phaseCoincidence, findSixRuneEcho };
