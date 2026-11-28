'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'),
  'utf8',
));
const annotations = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'),
  'utf8',
));
const signed2016 = fs.readFileSync(
  path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'),
  'utf8',
);

const mod = (n) => ((n % MOD) + MOD) % MOD;
const H = (x, y) => [mod(x - y), mod(x + y)];

const pages = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55)
  .sort((a, b) => a.page - b.page);
assert.equal(pages.length, 56);

const annotationByPage = new Map(annotations.pages.map((p) => [p.page, p]));
const messageBody = signed2016
  .split('Hash: SHA1\n\n')[1]
  .split('\n-----BEGIN PGP SIGNATURE-----')[0];
const sourceWords = messageBody.match(/[A-Za-z]+/g).slice(0, 43)
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[26], 'NUMBERS');
assert.equal(sourceWords[16], 'ARE');

const endpointComparisons = [];
const broadComparisons = [];
const canonicalBigramHits = [];
const chargedTargetHits = [];
const actualBigrams = new Set(
  sourceWords.slice(0, -1).map((word, i) => `${word} ${sourceWords[i + 1]}`),
);

for (let i = 0; i + 2 < pages.length; i += 1) {
  const [a, b, c] = pages.slice(i, i + 3);
  const counts = [a.runic_count, b.runic_count, c.runic_count];
  const endpointImbalance = counts[0] + counts[1] - (2 * counts[2]);
  const marks = annotationByPage.get(c.page)?.large_punctuation ?? [];

  for (const [offset, count, ink] of marks) {
    const record = {
      start: a.page,
      end: c.page,
      counts,
      endpointImbalance,
      offset,
      mark: count,
      ink,
      terminal: offset === counts[2],
    };
    broadComparisons.push(record);
    if (record.terminal) endpointComparisons.push(record);
  }

  const shortIncoming = mod(counts[2] - counts[1]);
  const longIncoming = mod(counts[2] - counts[0]);
  const canonical = H(shortIncoming, longIncoming);
  const phrase = `${sourceWords[canonical[0]]} ${sourceWords[canonical[1]]}`;
  if (actualBigrams.has(phrase)) {
    canonicalBigramHits.push({
      start: a.page,
      counts,
      input: [shortIncoming, longIncoming],
      output: canonical,
      phrase,
    });
  }

  const variants = [
    ['first', mod(counts[1] - counts[0]), mod(counts[2] - counts[0])],
    ['middle', mod(counts[0] - counts[1]), mod(counts[2] - counts[1])],
    ['last', shortIncoming, longIncoming],
  ];
  for (const [vertex, x, y] of variants) {
    for (const swap of [false, true]) {
      const input = swap ? [y, x] : [x, y];
      const output = H(input[0], input[1]);
      if (output[0] === 26 && output[1] === 16) {
        chargedTargetHits.push({ start: a.page, vertex, swap, input, output });
      }
    }
  }
}

const p24 = pages.find((p) => p.page === 24);
const p25 = pages.find((p) => p.page === 25);
const p26 = pages.find((p) => p.page === 26);
assert.deepEqual(
  [p24.runic_count, p25.runic_count, p26.runic_count],
  [270, 273, 265],
);

const mayflyEndpointImbalance = p24.runic_count + p25.runic_count - (2 * p26.runic_count);
assert.equal(mayflyEndpointImbalance, 13);

const p26Terminal = (annotationByPage.get(26)?.large_punctuation ?? [])
  .filter(([offset]) => offset === p26.runic_count);
assert.deepEqual(p26Terminal, [[265, 13, 'red']]);

const signedIncoming = [
  mod(p26.runic_count - p25.runic_count),
  mod(p26.runic_count - p24.runic_count),
];
assert.deepEqual(signedIncoming, [21, 24]);
assert.deepEqual(H(...signedIncoming), [26, 16]);

const endpointMatches = endpointComparisons
  .filter((row) => Math.abs(row.endpointImbalance) === row.mark);
assert.deepEqual(endpointMatches, [{
  start: 24,
  end: 26,
  counts: [270, 273, 265],
  endpointImbalance: 13,
  offset: 265,
  mark: 13,
  ink: 'red',
  terminal: true,
}]);

const broadMatches = broadComparisons
  .filter((row) => Math.abs(row.endpointImbalance) === row.mark);
assert.deepEqual(
  broadMatches.map((row) => [row.start, row.end, row.endpointImbalance, row.mark, row.terminal]),
  [[24, 26, 13, 13, true], [36, 38, 10, 10, false]],
);

assert.deepEqual(chargedTargetHits, [{
  start: 24,
  vertex: 'last',
  swap: false,
  input: [21, 24],
  output: [26, 16],
}]);
assert.deepEqual(
  canonicalBigramHits.map((row) => [row.start, row.phrase]),
  [[24, 'NUMBERS ARE'], [35, 'EMPTY EPIPHANY'], [38, 'THE ROAD']],
);

const result = {
  source: {
    mayflyPages: [24, 25, 26],
    counts: [270, 273, 265],
    p26TerminalMark: 13,
  },
  exactIntegerClosure: '270 + 273 - 2*265 = 13',
  orderedIncomingEdgesMod29: signedIncoming,
  canonicalH: {
    output: H(...signedIncoming),
    signed2016ZeroBasedTokens: [
      sourceWords[26],
      sourceWords[16],
    ],
  },
  controls: {
    contiguousTriples: pages.length - 2,
    triplesEndingAtTerminalLargeMark: endpointComparisons.length,
    exactTerminalEndpointImbalanceMatches: endpointMatches,
    allThirdPageLargeMarkComparisons: broadComparisons.length,
    allAbsoluteEndpointImbalanceMatches: broadMatches,
    chargedVertexOrderPresentations: (pages.length - 2) * 6,
    exactH2616Hits: chargedTargetHits,
    canonicalSignedSourceBigramHits: canonicalBigramHits,
  },
  decision:
    'Natural page order plus the terminal p26 13-dot mark fixes the signed orientation of the mayfly count triangle: its endpoint endpointImbalance is exactly 13, uniquely among terminal-large-mark triples. This supplies a source-level orientation/order lock, not a plaintext decoder. The H->[26,16]/NUMBERS ARE contact is secondary semantic evidence because zero-based signed-word indexing and duplicate word tokens remain conditional.',
};

console.log(JSON.stringify(result, null, 2));
