'use strict';
/**
 * Exact page-local placement null for GP prime-value checksums of image-annotated
 * red LP2 spans. Retain every page's red-span lengths and mutual offsets while
 * translating the spans together across every fitting page-local position.
 *
 * Node.js 22 CommonJS. Run from repository root:
 * node sims/red_span_prime_checksum_holdout.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));

function countsDistribution(groups) {
  let pmf = [1];
  for (const group of groups) {
    const histogram = [];
    for (const placement of group.placements) {
      const n = placement.filter(r => r === 0).length;
      histogram[n] = (histogram[n] || 0) + 1;
    }
    const next = Array(pmf.length + histogram.length - 1).fill(0);
    for (let i = 0; i < pmf.length; i++)
      for (let j = 0; j < histogram.length; j++)
        next[i + j] += pmf[i] * (histogram[j] || 0) / group.placements.length;
    pmf = next;
  }
  const actual = groups.flatMap(g => g.actual).filter(r => r === 0).length;
  return {
    zeroResidues: actual,
    expectation: pmf.reduce((s, p, i) => s + i * p, 0),
    upperTail: pmf.slice(actual).reduce((s, p) => s + p, 0),
    pmf
  };
}

/** @returns {() => number} Reproducible PRNG for the familywise modal control. */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function run() {
  const groups = [];
  const rows = [];
  const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
  for (const annot of ink.pages) {
    const spans = annot.red_spans || [];
    if (!spans.length) continue;
    const page = corpus.pages.find(p => p.page === annot.page);
    assert.ok(page);
    const prefix = [0];
    for (const index of page.indices)
      prefix.push(prefix[prefix.length - 1] + corpus.prime[index]);
    const minStart = Math.min(...spans.map(s => s.start));
    const maxEnd = Math.max(...spans.map(s => s.start + s.length));
    const spanResidues = shift => spans.map(s =>
      (prefix[s.start + shift + s.length] - prefix[s.start + shift]) % 29);
    const actual = spanResidues(0);
    spans.forEach((s, i) => {
      assert.equal(s.length, [...s.runes].length);
      assert.deepEqual(page.indices.slice(s.start, s.start + s.length),
        [...s.runes].map(r => runeMap.get(r)));
      const sum = prefix[s.start + s.length] - prefix[s.start];
      rows.push({page: page.page, start: s.start, length: s.length,
        primeSum: sum, residue: actual[i]});
    });
    const placements = [];
    for (let shift = -minStart; shift <= page.indices.length - maxEnd; shift++)
      placements.push(spanResidues(shift));
    groups.push({page: page.page, actual, placements});
  }

  assert.equal(rows.length, 18);
  assert.deepEqual(rows.filter(x => x.residue === 0)
    .map(x => [x.page, x.primeSum]), [[15, 638], [40, 435], [53, 2262]]);

  const all = countsDistribution(groups);
  const heldout = countsDistribution(groups.filter(g => g.page !== 15));
  const residueCounts = Array(29).fill(0);
  rows.forEach(r => residueCounts[r.residue]++);
  const observedModal = Math.max(...residueCounts);
  assert.equal(observedModal, 3);
  assert.equal(residueCounts[24], 3);

  const rand = randomGenerator(0x700715);
  const samples = 200000;
  let modalExceed = 0;
  let zeroExceed = 0;
  const maxHistogram = {};
  for (let n = 0; n < samples; n++) {
    const freq = new Uint8Array(29);
    for (const g of groups) {
      const p = g.placements[Math.floor(rand() * g.placements.length)];
      for (const r of p) freq[r]++;
    }
    const maximum = Math.max(...freq);
    maxHistogram[maximum] = (maxHistogram[maximum] || 0) + 1;
    modalExceed += Number(maximum >= observedModal);
    zeroExceed += Number(freq[0] >= all.zeroResidues);
  }
  const result = {
    test: 'GP prime-sum modulo 29 of all independently image-marked LP2 red spans',
    redSpanCount: rows.length,
    redSpans: rows,
    zeroResidueRows: rows.filter(r => r.residue === 0),
    residueCounts,
    exactPagePlacementNull: {
      full: all,
      excludingDiscoveryPage15: heldout
    },
    selectedResidueControl: {
      samples, seed: '0x700715', observedModal,
      familywiseModalUpperTail: (modalExceed + 1) / (samples + 1),
      selectedZeroUpperTail: (zeroExceed + 1) / (samples + 1),
      maxHistogram
    },
    interpretation: 'Modulo 29 zero was selected after inspecting page15. The independently marked remaining pages do not reach an ordinary 5% threshold under this null; an arbitrary modal residue count of 3 is commonplace. No key or plaintext is recovered.'
  };
  assert.ok(Math.abs(all.upperTail - 0.018671914086164275) < 1e-11);
  assert.ok(Math.abs(heldout.upperTail - 0.08795611208644231) < 1e-11);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {run, countsDistribution, randomGenerator};
