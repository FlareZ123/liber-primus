'use strict';

const fs = require('fs');
const path = require('path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');

const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

function parseWords() {
  const words = [];
  let current = [];
  let global = 0;
  let start = 0;

  function finish() {
    if (!current.length) return;
    words.push({ indices: current, start });
    global += current.length;
    current = [];
  }

  const source = transcription.split('%').slice(0, 55).join('%');
  for (const ch of source) {
    if (runeSet.has(ch)) {
      if (!current.length) start = global;
      current.push(runeIndex.get(ch));
    } else if (ch === '/' || ch === '%' || /\s/u.test(ch)) {
      // Original line/page wraps do not terminate a printed word.
    } else {
      finish();
    }
  }
  finish();

  if (words.length !== 2896 || global !== 12956) {
    throw new Error(`canonical word parse mismatch: ${words.length}/${global}`);
  }
  return words;
}

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const x = xs[i] - mx;
    const y = ys[i] - my;
    num += x * y;
    dx += x * x;
    dy += y * y;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

function ranks(values) {
  const ordered = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const out = Array(values.length);
  let i = 0;
  while (i < ordered.length) {
    let j = i + 1;
    while (j < ordered.length && ordered[j][0] === ordered[i][0]) j++;
    const rank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) out[ordered[k][1]] = rank;
    i = j;
  }
  return out;
}

function gapStats(sites) {
  const ordered = sites.slice().sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < ordered.length; i++) gaps.push(ordered[i] - ordered[i - 1]);
  return {
    pearson: pearson(gaps.slice(0, -1), gaps.slice(1)),
    spearman: pearson(ranks(gaps.slice(0, -1)), ranks(gaps.slice(1))),
  };
}

let state = 0x3301a5f7 >>> 0;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  state >>>= 0;
  return state / 0x100000000;
}

function sampleWithoutReplacement(source, count) {
  const a = source.slice();
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (a.length - i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}

const words = parseWords();
const stream = words.flatMap(w => w.indices);
const allPairs = Array.from({ length: stream.length - 1 }, (_, i) => i);

const wordBoundary = new Set(words.slice(0, -1).map(w => w.start + w.indices.length - 1));
const boundaryOpp = allPairs.filter(i => wordBoundary.has(i));
const withinOpp = allPairs.filter(i => !wordBoundary.has(i));
const doublets = allPairs.filter(i => stream[i] === stream[i + 1]);
const boundaryDoublets = doublets.filter(i => wordBoundary.has(i));
const withinDoublets = doublets.filter(i => !wordBoundary.has(i));

if (doublets.length !== 86 || boundaryDoublets.length !== 23 ||
    withinDoublets.length !== 63 || boundaryOpp.length !== 2895 ||
    withinOpp.length !== 10060) {
  throw new Error('doublet/boundary census mismatch');
}

const observedT7 = gapStats(doublets);
if (Math.abs(observedT7.pearson - 0.38001968924100965) > 1e-12 ||
    Math.abs(observedT7.spearman - 0.2680509985012355) > 1e-12) {
  throw new Error('T7 statistic mismatch');
}

const boundaryDraws = 20000;
let pearsonGe = 0;
let spearmanGe = 0;
for (let draw = 0; draw < boundaryDraws; draw++) {
  const sampled = sampleWithoutReplacement(boundaryOpp, boundaryDoublets.length)
    .concat(sampleWithoutReplacement(withinOpp, withinDoublets.length));
  const s = gapStats(sampled);
  if (s.pearson >= observedT7.pearson) pearsonGe++;
  if (s.spearman >= observedT7.spearman) spearmanGe++;
}

const lag5Opp = [];
const lag5Hits = [];
for (const word of words) {
  for (let j = 5; j < word.indices.length; j++) {
    const globalEnd = word.start + j;
    lag5Opp.push(globalEnd);
    if (word.indices[j] === word.indices[j - 5]) lag5Hits.push(globalEnd);
  }
}
if (lag5Opp.length !== 2105 || lag5Hits.length !== 104) {
  throw new Error('lag5 census mismatch');
}

const observedLag5Gap = gapStats(lag5Hits);

function blockCorr(hitPositions, size) {
  const nBlocks = Math.ceil(stream.length / size);
  const doubletHits = Array(nBlocks).fill(0);
  const doubletOpps = Array(nBlocks).fill(0);
  const lagHits = Array(nBlocks).fill(0);
  const lagOpps = Array(nBlocks).fill(0);

  for (let i = 0; i < stream.length - 1; i++) doubletOpps[Math.floor(i / size)]++;
  for (const i of doublets) doubletHits[Math.floor(i / size)]++;
  for (const i of lag5Opp) lagOpps[Math.floor(i / size)]++;
  for (const i of hitPositions) lagHits[Math.floor(i / size)]++;

  const rd = doublets.length / (stream.length - 1);
  const rl = hitPositions.length / lag5Opp.length;
  const d = [];
  const l = [];
  for (let b = 0; b < nBlocks; b++) {
    if (!lagOpps[b]) continue;
    d.push(doubletHits[b] - doubletOpps[b] * rd);
    l.push(lagHits[b] - lagOpps[b] * rl);
  }
  return pearson(d, l);
}

const blockSizes = [128, 256, 512, 1024];
const observedBlock = Object.fromEntries(blockSizes.map(s => [s, blockCorr(lag5Hits, s)]));
const observedMaxBlock = Math.max(...blockSizes.map(s => Math.abs(observedBlock[s])));

const lag5Draws = 10000;
let lagPearsonAbsGe = 0;
let lagSpearmanAbsGe = 0;
let maxBlockGe = 0;
const perBlockGe = Object.fromEntries(blockSizes.map(s => [s, 0]));

for (let draw = 0; draw < lag5Draws; draw++) {
  const sampled = sampleWithoutReplacement(lag5Opp, lag5Hits.length).sort((a, b) => a - b);
  const gs = gapStats(sampled);
  if (Math.abs(gs.pearson) >= Math.abs(observedLag5Gap.pearson)) lagPearsonAbsGe++;
  if (Math.abs(gs.spearman) >= Math.abs(observedLag5Gap.spearman)) lagSpearmanAbsGe++;

  let maxAbs = 0;
  for (const size of blockSizes) {
    const v = blockCorr(sampled, size);
    if (Math.abs(v) >= Math.abs(observedBlock[size])) perBlockGe[size]++;
    maxAbs = Math.max(maxAbs, Math.abs(v));
  }
  if (maxAbs >= observedMaxBlock) maxBlockGe++;
}

const result = {
  counts: {
    runes: stream.length,
    words: words.length,
    doublets: doublets.length,
    boundaryOpportunities: boundaryOpp.length,
    boundaryDoublets: boundaryDoublets.length,
    withinOpportunities: withinOpp.length,
    withinDoublets: withinDoublets.length,
    lag5Opportunities: lag5Opp.length,
    lag5Hits: lag5Hits.length,
  },
  t7: {
    observed: observedT7,
    conditionedNull: {
      draws: boundaryDraws,
      condition: 'exactly 23 events on 2,895 semantic-word-boundary pair sites and 63 on 10,060 within-word pair sites',
      pearsonUpperP: (pearsonGe + 1) / (boundaryDraws + 1),
      spearmanUpperP: (spearmanGe + 1) / (boundaryDraws + 1),
    },
  },
  lag5IndependentStream: {
    observedGap: observedLag5Gap,
    gapNull: {
      draws: lag5Draws,
      pearsonTwoSidedP: (lagPearsonAbsGe + 1) / (lag5Draws + 1),
      spearmanTwoSidedP: (lagSpearmanAbsGe + 1) / (lag5Draws + 1),
    },
    blockResidualCorrelation: observedBlock,
    perBlockTwoSidedP: Object.fromEntries(
      blockSizes.map(s => [s, (perBlockGe[s] + 1) / (lag5Draws + 1)])),
    maxOverScalesTwoSidedP: (maxBlockGe + 1) / (lag5Draws + 1),
  },
};

console.log(JSON.stringify(result, null, 2));
