'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const coords = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-p55-source-glyph-coordinates.json', 'utf8'));
const grouped = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-page-groups-54-55-derived.json', 'utf8'));
const alphabet = '0123456789abcdefghijklmnopqrs';
const translit = corpus.translit;
const page = corpus.pages.find((p) => p.page === 55).indices;
const groups = grouped.p55.groups;

const toIndices = (s) => Array.from(s, (ch) => alphabet.indexOf(ch));
const flatten = groups.flatMap(toIndices);
assert.deepEqual(flatten, page, 'p55 grouped transcription must match the canonical page tape');
assert.equal(page.length, 76);
assert.equal(groups.length, 17);
assert.equal(groups[0], 'l', 'p55 begins with the one-rune carry');
assert.equal(grouped.p54.body_groups.at(-1), '63g2eis46q');

const lineCountsMap = {};
for (const glyph of coords.glyphs) lineCountsMap[glyph.line] = (lineCountsMap[glyph.line] || 0) + 1;
const lineCounts = Object.keys(lineCountsMap).sort((a, b) => Number(a) - Number(b)).map((k) => lineCountsMap[k]);
assert.deepEqual(lineCounts, [24, 22, 22, 8]);

const interior = groups.slice(1).flatMap((s) => toIndices(s.slice(1, -1)));
const exterior = [
  ...toIndices(groups[0]),
  ...groups.slice(1).flatMap((s) => [alphabet.indexOf(s[0]), alphabet.indexOf(s.at(-1))]),
];
assert.equal(interior.length, 43);
assert.equal(exterior.length, 33);
assert.equal(interior.length + exterior.length, page.length);

const cuneiformDigits = [17, 13, 55, 1];
const cuneiform = [cuneiformDigits[0] * 60 + cuneiformDigits[1], cuneiformDigits[2] * 60 + cuneiformDigits[3]];
assert.deepEqual(cuneiform, [1033, 3301]);
assert.equal(cuneiform[0], 43 * 24 + 1);
assert.equal(cuneiform[1], 43 * 76 + 33);

const mod = (x, n) => ((x % n) + n) % n;
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const inverseMod = (a, n) => {
  for (let x = 1; x < n; x++) if (mod(a * x, n) === 1) return x;
  throw new Error('no modular inverse');
};
const affineForward = (a, b, input) => {
  const n = input.length;
  return Array.from({ length: n }, (_, i) => input[mod(a * i + b, n)]);
};
const affineInverse = (a, b, input) => {
  const n = input.length;
  const ai = inverseMod(a, n);
  return Array.from({ length: n }, (_, i) => input[mod(ai * (i - b), n)]);
};
const ioc = (a) => {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const format = (a) => a.map((x) => translit[x]).join('');
const summary = (a) => ({ ioc: ioc(a), prefix20: format(a.slice(0, 20)), text: format(a) });

const firstLine = page.slice(0, 24);
assert.equal(gcd(43, 24), 1);
assert.equal(gcd(43, 76), 1);
const pageForward = affineForward(43, 33, page);
const pageInverse = affineInverse(43, 33, page);
const lineForward = affineForward(43, 1, firstLine);
const lineInverse = affineInverse(43, 1, firstLine);
assert.deepEqual(affineInverse(43, 33, pageForward), page);
assert.deepEqual(affineForward(43, 33, pageInverse), page);
assert.deepEqual(affineInverse(43, 1, lineForward), firstLine);
assert.deepEqual(affineForward(43, 1, lineInverse), firstLine);

function affineKeyStream(skipF, sign) {
  let j = 0;
  return page.map((x) => {
    if (skipF && x === 0) return 0;
    const k = mod(43 * j + 33, 76) % 29;
    j++;
    return mod(x + sign * k, 29);
  });
}
const streamMinusConsume = affineKeyStream(false, -1);
const streamPlusConsume = affineKeyStream(false, 1);
const streamMinusFhold = affineKeyStream(true, -1);
const streamPlusFhold = affineKeyStream(true, 1);
assert.equal(streamMinusConsume.length, 76);
assert.equal(streamPlusConsume.length, 76);
assert.equal(streamMinusFhold.length, 76);
assert.equal(streamPlusFhold.length, 76);

const K = [[24, 1], [76 % 29, 33 % 29]];
const det = mod(K[0][0] * K[1][1] - K[0][1] * K[1][0], 29);
const detInv = inverseMod(det, 29);
const Kinv = [
  [mod(K[1][1] * detInv, 29), mod(-K[0][1] * detInv, 29)],
  [mod(-K[1][0] * detInv, 29), mod(K[0][0] * detInv, 29)],
];
function hill(input, matrix, rowVector) {
  const out = [];
  for (let i = 0; i < input.length; i += 2) {
    const x = input[i], y = input[i + 1];
    if (rowVector) {
      out.push(mod(x * matrix[0][0] + y * matrix[1][0], 29));
      out.push(mod(x * matrix[0][1] + y * matrix[1][1], 29));
    } else {
      out.push(mod(matrix[0][0] * x + matrix[0][1] * y, 29));
      out.push(mod(matrix[1][0] * x + matrix[1][1] * y, 29));
    }
  }
  return out;
}
const hillDirectColumn = hill(page, K, false);
const hillDirectRow = hill(page, K, true);
const hillInverseColumn = hill(page, Kinv, false);
const hillInverseRow = hill(page, Kinv, true);
assert.deepEqual(hill(page, Kinv, false), hillInverseColumn);
assert.deepEqual(hill(hillDirectColumn, Kinv, false), page);
assert.deepEqual(hill(hillDirectRow, Kinv, true), page);
assert.deepEqual(K, [[24, 1], [18, 4]]);
assert.deepEqual(Kinv, [[6, 13], [2, 7]]);

console.log(JSON.stringify({
  p55: { runeCount: page.length, lineCounts, groupCount: groups.length, carry: groups[0], interiorCount: interior.length, exteriorCount: exterior.length },
  cuneiform: { digits: cuneiformDigits, values: cuneiform, identities: ['1033=43*24+1', '3301=43*76+33'] },
  affineMaps: {
    firstLine: { n: 24, a: 43 % 24, b: 1, aInverse: inverseMod(43, 24), forward: summary(lineForward), inverse: summary(lineInverse) },
    fullPage: { n: 76, a: 43, b: 33, aInverse: inverseMod(43, 76), forward: summary(pageForward), inverse: summary(pageInverse) },
  },
  affineKeyStreams: {
    subtractConsumeF: summary(streamMinusConsume),
    addConsumeF: summary(streamPlusConsume),
    subtractHoldF: summary(streamMinusFhold),
    addHoldF: summary(streamPlusFhold),
  },
  hillMatrix: { key: K, determinant: det, inverse: Kinv, directColumn: summary(hillDirectColumn), directRow: summary(hillDirectRow), inverseColumn: summary(hillInverseColumn), inverseRow: summary(hillInverseRow) },
  rawP55IoC: ioc(page),
}, null, 2));
