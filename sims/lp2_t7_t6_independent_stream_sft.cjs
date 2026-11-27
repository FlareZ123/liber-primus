'use strict';

const fs = require('fs');
const path = require('path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');

const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

let words = [], current = [], start = 0, total = 0;
function finish() {
  if (!current.length) return;
  words.push({ indices: current, start });
  total += current.length;
  current = [];
}
for (const ch of transcription.split('%').slice(0, 55).join('%')) {
  if (runeSet.has(ch)) {
    if (!current.length) start = total;
    current.push(runeIndex.get(ch));
  } else if (ch === '/' || ch === '%' || /\s/u.test(ch)) {
    // Printed line/page wraps do not terminate a semantic word.
  } else {
    finish();
  }
}
finish();
if (words.length !== 2896 || total !== 12956) throw new Error('canonical parse mismatch');

const stream = words.flatMap(w => w.indices);
const doublets = [];
for (let i = 0; i < stream.length - 1; i++) {
  if (stream[i] === stream[i + 1]) doublets.push(i);
}

const t6Opp = [], t6Hits = [];
for (const word of words) {
  for (let j = 6; j < word.indices.length; j++) {
    const g = word.start + j;
    t6Opp.push(g);
    const predicted = ((24 - 2 * word.indices[j - 6]) % 29 + 29) % 29;
    if (word.indices[j] === predicted) t6Hits.push(g);
  }
}
if (doublets.length !== 86 || t6Opp.length !== 1290 || t6Hits.length !== 80) {
  throw new Error('event census mismatch');
}

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const x = xs[i] - mx, y = ys[i] - my;
    num += x * y; dx += x * x; dy += y * y;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}
function ranks(a) {
  const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]);
  const r = Array(a.length);
  let i = 0;
  while (i < o.length) {
    let j = i + 1;
    while (j < o.length && o[j][0] === o[i][0]) j++;
    const q = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) r[o[k][1]] = q;
    i = j;
  }
  return r;
}
function gapStats(sites) {
  const s = sites.slice().sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < s.length; i++) gaps.push(s[i] - s[i - 1]);
  return {
    pearson: pearson(gaps.slice(0, -1), gaps.slice(1)),
    spearman: pearson(ranks(gaps.slice(0, -1)), ranks(gaps.slice(1))),
  };
}
function blockCorr(hitPositions, size) {
  const nBlocks = Math.ceil(stream.length / size);
  const dh = Array(nBlocks).fill(0), dop = Array(nBlocks).fill(0);
  const th = Array(nBlocks).fill(0), top = Array(nBlocks).fill(0);
  for (let i = 0; i < stream.length - 1; i++) dop[Math.floor(i / size)]++;
  for (const i of doublets) dh[Math.floor(i / size)]++;
  for (const i of t6Opp) top[Math.floor(i / size)]++;
  for (const i of hitPositions) th[Math.floor(i / size)]++;
  const rd = doublets.length / (stream.length - 1);
  const rt = hitPositions.length / t6Opp.length;
  const xd = [], xt = [];
  for (let b = 0; b < nBlocks; b++) {
    if (!top[b]) continue;
    xd.push(dh[b] - dop[b] * rd);
    xt.push(th[b] - top[b] * rt);
  }
  return pearson(xd, xt);
}

const observedGap = gapStats(t6Hits);
const blockSizes = [128, 256, 512, 1024];
const observedBlock = Object.fromEntries(blockSizes.map(s => [s, blockCorr(t6Hits, s)]));
const observedMaxBlock = Math.max(...blockSizes.map(s => Math.abs(observedBlock[s])));

let state = 0x6a3301f1 >>> 0;
function random() {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state >>>= 0;
  return state / 0x100000000;
}
function sample() {
  const ids = Array.from({ length: t6Opp.length }, (_, i) => i);
  for (let i = 0; i < t6Hits.length; i++) {
    const j = i + Math.floor(random() * (ids.length - i));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, t6Hits.length).map(i => t6Opp[i]).sort((a, b) => a - b);
}

const draws = 20000;
let pearsonGe = 0, spearmanGe = 0, maxBlockGe = 0;
const blockGe = Object.fromEntries(blockSizes.map(s => [s, 0]));
for (let z = 0; z < draws; z++) {
  const sampled = sample();
  const g = gapStats(sampled);
  if (Math.abs(g.pearson) >= Math.abs(observedGap.pearson)) pearsonGe++;
  if (Math.abs(g.spearman) >= Math.abs(observedGap.spearman)) spearmanGe++;
  let maxAbs = 0;
  for (const size of blockSizes) {
    const v = blockCorr(sampled, size);
    if (Math.abs(v) >= Math.abs(observedBlock[size])) blockGe[size]++;
    maxAbs = Math.max(maxAbs, Math.abs(v));
  }
  if (maxAbs >= observedMaxBlock) maxBlockGe++;
}

console.log(JSON.stringify({
  counts: { doublets: doublets.length, t6Opportunities: t6Opp.length, t6Hits: t6Hits.length },
  observed: { gap: observedGap, blockResidualCorrelation: observedBlock, maxAbsBlock: observedMaxBlock },
  null: {
    draws,
    gapPearsonTwoSidedP: (pearsonGe + 1) / (draws + 1),
    gapSpearmanTwoSidedP: (spearmanGe + 1) / (draws + 1),
    perBlockTwoSidedP: Object.fromEntries(blockSizes.map(s => [s, (blockGe[s] + 1) / (draws + 1)])),
    maxOverScalesTwoSidedP: (maxBlockGe + 1) / (draws + 1),
  },
}, null, 2));
