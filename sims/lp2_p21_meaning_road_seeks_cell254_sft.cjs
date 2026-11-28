#!/usr/bin/env node
'use strict';

/**
 * SFT: p21/group21 H4 -> authenticated MEANING IS THE ROAD + SEEKS,
 * with SEEKS->p32->cell115->p47 and p20->p22->cell254 cross-locks.
 *
 * Classification: source-selected navigation/semantic cross-lock.
 * No unknown LP2 plaintext or cipher inverse is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r/g, '');
const raw = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source2016 = read('resources/cicada2016-4gq25.md');

assert.match(
  source2016,
  /Its words are the map, their\s*\nmeaning is the road, and their numbers are the direction\./
);

const signedWords = [
  'HELLO','THE','PATH','LIES','EMPTY','EPIPHANY','SEEKS','THE','DEVOTED',
  'LIBER','PRIMUS','IS','THE','WAY','ITS','WORDS','ARE','THE','MAP','THEIR',
  'MEANING','IS','THE','ROAD','AND','THEIR','NUMBERS','ARE','THE','DIRECTION',
  'SEEK','AND','YOU','WILL','BE','FOUND','GOOD','LUCK','3301','BEWARE','FALSE',
  'PATHS','VERIFY','OPENPGP'
];
assert.deepEqual(signedWords.slice(20, 24), ['MEANING','IS','THE','ROAD']);
assert.equal(signedWords[6], 'SEEKS');
assert.equal(signedWords[39], 'FALSE');
assert.equal(signedWords.length, 43);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = raw.split(/^\s*%\s*$/m);
const mod29 = (x) => ((x % 29) + 29) % 29;
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);

const digits60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digits59 = digits60.replace('f', '');
const decodeToken = (token, radix) => {
  const alphabet = radix === 59 ? digits59 : digits60;
  return radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
};
const base59 = tokens.map((token) => decodeToken(token, 59));
const base60 = tokens.map((token) => decodeToken(token, 60));

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1] || '';
}

function pageGroups(page) {
  const block = physicalPart(page);
  let offset = 0;
  let line = 1;
  let current = null;
  const groups = [];
  const finish = () => {
    if (current) groups.push(current);
    current = null;
  };

  for (const ch of block) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current) current = { start: offset, sites: [] };
      current.sites.push({ offset, line, value });
      offset += 1;
    } else if (ch === '/') {
      line += 1;
    } else if (/\s/u.test(ch)) {
      // Printed whitespace/line-wrap preserves one punctuation group.
    } else {
      finish();
    }
  }
  finish();
  return groups;
}

function H(values) {
  const out = [];
  const half = Math.floor(values.length / 2);
  for (let i = 0; i < half; i += 1) {
    out.push(mod29(values[i] - values[values.length - 1 - i]));
  }
  if (values.length % 2) out.push(values[half]);
  for (let i = half - 1; i >= 0; i -= 1) {
    out.push(mod29(values[i] + values[values.length - 1 - i]));
  }
  return out;
}

function selfIndexed(page) {
  const groups = pageGroups(page);
  const group = groups[page - 1];
  assert.ok(group, `missing p${page}/group${page}`);
  const values = group.sites.map((site) => site.value);
  return { page, group, values, h: H(values) };
}

function pairReads(h) {
  const reads = [];
  for (let i = 0; i + 1 < h.length; i += 2) {
    const numeral = h[i] * 29 + h[i + 1];
    const address = numeral % 256;
    reads.push({
      pair: [h[i], h[i + 1]],
      numeral,
      address,
      token: tokens[address],
    });
  }
  return reads;
}

// Upstream corridor fixes p21/group21 before this semantic readout.
const p21 = selfIndexed(21);
assert.deepEqual(p21.values, [13, 8, 15, 22]);
assert.deepEqual(p21.h, [20, 22, 23, 6]);

const reconstructedIndices = [p21.h[0], p21.page, p21.h[1], p21.h[2]];
assert.deepEqual(reconstructedIndices, [20, 21, 22, 23]);
assert.deepEqual(
  reconstructedIndices.map((index) => signedWords[index]),
  ['MEANING', 'IS', 'THE', 'ROAD']
);
assert.equal(signedWords[p21.h[3]], 'SEEKS');

// Familywise control: all self-indexed H4 groups; omit every H coordinate
// in turn, preserve or reverse the remaining H order, and try every page
// insertion position. This charges the "unused SEEKS coordinate" explicitly.
const self = [];
for (let page = 1; page <= 55; page += 1) {
  if (page === 50) continue;
  const groups = pageGroups(page);
  if (!groups[page - 1]) continue;
  const values = groups[page - 1].sites.map((site) => site.value);
  self.push({ page, values, h: H(values) });
}
assert.equal(self.length, 48);
const h4 = self.filter((row) => row.h.length === 4);
assert.equal(h4.length, 10);

const sequenceHits = [];
for (const row of h4) {
  for (let omittedIndex = 0; omittedIndex < 4; omittedIndex += 1) {
    const kept = row.h.filter((_, index) => index !== omittedIndex);
    const orientations = [
      { reversed: false, values: kept },
      { reversed: true, values: kept.slice().reverse() },
    ];
    for (const orientation of orientations) {
      for (let pos = 0; pos <= 3; pos += 1) {
        const seq = orientation.values.slice();
        seq.splice(pos, 0, row.page);
        const consecutive = seq.every((value, i) => value === seq[0] + i);
        if (consecutive) {
          sequenceHits.push({
            page: row.page,
            omittedIndex,
            omitted: row.h[omittedIndex],
            reversed: orientation.reversed,
            insertPosition: pos,
            sequence: seq,
          });
        }
      }
    }
  }
}
assert.deepEqual(sequenceHits, [{
  page: 21,
  omittedIndex: 3,
  omitted: 6,
  reversed: false,
  insertPosition: 1,
  sequence: [20, 21, 22, 23],
}]);

// The remaining source-word index 6 is SEEKS. Reproduce the already-established
// canonical byte-pointer route: GP0(SEEKS)=71, 23 raw p50 byte edges -> p32,
// then cell32 contains byte115 and cell115 prints literal47.
const seeksGp = [15, 18, 18, 5, 15];
const seeksGp0 = seeksGp.reduce((a, b) => a + b, 0);
assert.equal(seeksGp0, 71);
const seeksH = H(seeksGp);
assert.deepEqual(seeksH, [0, 13, 18, 23, 1]);
assert.deepEqual(
  seeksH.map((index) => signedWords[index]),
  ['HELLO', 'WAY', 'MAP', 'ROAD', 'THE']
);
const roadIndex = seeksH[3];
assert.equal(roadIndex, 23);
assert.equal(signedWords[roadIndex], 'ROAD');

// The p21 sentence selects ROAD from the established SEEKS navigation shell;
// the authenticated source says word numbers are the direction.
const semanticRoadDestination = roadIndex;
assert.equal(semanticRoadDestination, 23);
const p23Groups = pageGroups(semanticRoadDestination);
assert.ok(p23Groups.length >= 23);


let pointer = seeksGp0;
const seeksPointerPath = [pointer];
for (let step = 0; step < 23; step += 1) {
  pointer = bytes[pointer];
  seeksPointerPath.push(pointer);
}
assert.equal(pointer, 32);
assert.equal(bytes[32], 115);
assert.equal(tokens[115], '47');

// Neighbor-geometry control.
const orderedNeighborHits = h4.filter((row) =>
  row.h[0] === mod29(row.page - 1)
  && row.h[1] === mod29(row.page + 1)
  && row.h[2] === mod29(row.page + 2)
);
assert.deepEqual(orderedNeighborHits.map((row) => row.page), [21]);

// Conditional neighbor branch: p20 and p22 were named by the p21 packet.
const p20 = selfIndexed(20);
const p22 = selfIndexed(22);
assert.deepEqual(p20.h, [28, 20, 11, 23]);
assert.deepEqual(p22.h, [17, 17, 11, 7]);

const p20Reads = pairReads(p20.h);
assert.deepEqual(p20Reads, [
  { pair: [28, 20], numeral: 832, address: 64, token: '22' },
  { pair: [11, 23], numeral: 342, address: 86, token: '1p' },
]);
const p20LegalPages = p20Reads
  .filter(({ token }) => /^\d{2}$/.test(token) && Number(token) <= 55)
  .map(({ token }) => Number(token));
assert.deepEqual(p20LegalPages, [22]);

const p22Reads = pairReads(p22.h);
assert.deepEqual(p22Reads, [
  { pair: [17, 17], numeral: 510, address: 254, token: '39' },
  { pair: [11, 7], numeral: 326, address: 70, token: '2n' },
]);

const literal39Direction = Number(p22Reads[0].token);
assert.equal(literal39Direction, 39);
assert.equal(signedWords[literal39Direction], 'FALSE');
assert.equal(literal39Direction, 39); // physical p39 under the established zero-based number-as-direction convention


// All-self-indexed control: p22 is the only self-indexed group whose adjacent
// H-pair p50 address hits the independently established p27 source cell254.
const cell254Hits = self.filter((row) =>
  pairReads(row.h).some(({ address }) => address === 254)
);
assert.deepEqual(cell254Hits.map((row) => row.page), [22]);

// Literal39 has a commuting numeric/semantic continuation.
assert.equal(decodeToken('39', 59), 186);
assert.equal(decodeToken('39', 60), 189);

const p39 = selfIndexed(39);
assert.deepEqual(p39.values, [21, 2, 9, 5, 14, 16, 21]);
assert.deepEqual(p39.h, [0, 15, 24, 5, 23, 18, 13]);
const p39Reads = pairReads(p39.h);
assert.deepEqual(p39Reads, [
  { pair: [0, 15], numeral: 15, address: 15, token: '3W' },
  { pair: [24, 5], numeral: 701, address: 189, token: '3C' },
  { pair: [23, 18], numeral: 685, address: 173, token: '1v' },
]);

assert.equal(tokens[189], '3C');
assert.equal(base59[189], 189);
for (let seed = 0; seed < 256; seed += 1) {
  let at = seed;
  for (let step = 0; step <= 256 && at !== 189; step += 1) at = base59[at];
  assert.equal(at, 189, `base59 seed ${seed} failed to reach fixed sink189`);
}
const p39SinkReads = p39Reads.filter(({ address }) => address === 189);
assert.deepEqual(p39SinkReads.map(({ address }) => address), [189]);

const mirror189 = Math.floor(189 / 8) * 8 + (7 - (189 % 8));
assert.equal(mirror189, 186);
assert.equal(mirror189, decodeToken('39', 59));
assert.equal(189, decodeToken('39', 60));


console.log(JSON.stringify({
  classification: 'source-selected navigation/authenticated-source semantic cross-lock; no LP2 plaintext',
  p21: {
    values: p21.values,
    H: p21.h,
    reconstructedIndices,
    reconstructedPhrase: reconstructedIndices.map((index) => signedWords[index]).join(' '),
    remainingIndex: p21.h[3],
    remainingWord: signedWords[p21.h[3]],
  },
  familywise: {
    selfIndexedObjects: self.length,
    H4Objects: h4.length,
    configurationsTestedPerObject: 32,
    totalConfigurations: h4.length * 32,
    sequenceHits,
  },
  seeksClosure: {
    gp0: seeksGp0,
    pointerSteps: 23,
    pointerPath: seeksPointerPath,
    receiverPage: 32,
    nextCell: bytes[32],
    nextToken: tokens[115],
  },
  neighborBranch: {
    orderedNeighborGeometryHits: orderedNeighborHits.map((row) => row.page),
    p20Reads,
    p20LegalPages,
    p22Reads,
    literal39Direction: {
      sourceIndex: literal39Direction,
      sourceWord: signedWords[literal39Direction],
      physicalPage: literal39Direction,
    },
    allSelfIndexedCell254Hits: cell254Hits.map((row) => row.page),
    token39CommutingCircuit: {
      base60Value: decodeToken('39', 60),
      semanticPage: 39,
      p39H: p39.h,
      p39PairAddresses: p39Reads.map(({ address }) => address),
      base59Sink: 189,
      mirrorDestination: mirror189,
      base59Value: decodeToken('39', 59),
    },
  },
}, null, 2));
console.log('PASS lp2_p21_meaning_road_seeks_cell254_sft');
