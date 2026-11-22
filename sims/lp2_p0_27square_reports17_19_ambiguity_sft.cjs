'use strict';

/**
 * Exact unchanged-source ambiguity census for the proposed 27x27 LP2 opening
 * and external Reports 00-19, after fitted block 17 THEN.
 *
 * node sims/lp2_p0_27square_reports17_19_ambiguity_sft.cjs
 *
 * Input: resources/liber-primus/lp2-corpus.json, original physical pp0-2.
 * Scope: the previously exact 1,104 Report00-16 admissible placements.
 * External source: 2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-
 * Totient-Decryption/Start-reading-here/17-...md, 18-...md, 19-...md
 * Current route is retrospectively proposed; this is a necessary-condition
 * ambiguity certificate, not an authenticated Liber Primus decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const tape = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
assert.equal(tape.length, 729);
const at = (r, c) => tape[(r - 1) * 27 + c - 1];
const n0 = (r, c) => 27 * (r - 1) + c;
const n1 = (r, c) => 27 * (c - 1) + 28 - r;
const n2 = (r, c) => 730 - n0(r, c);
const n3 = (r, c) => 730 - n1(r, c);
const mod = (a, b) => ((a % b) + b) % b;

/** @param {number} n @returns {number} */
function mu(n) {
  assert.ok(n >= 1);
  let sign = 1;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d !== 0) continue;
    n /= d;
    sign = -sign;
    if (n % d === 0) return 0;
    while (n % d === 0) n /= d;
  }
  return n > 1 ? -sign : sign;
}

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(n >= 1);
  let value = n;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d !== 0) continue;
    value -= value / d;
    while (n % d === 0) n /= d;
  }
  if (n > 1) value -= value / n;
  return value;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

const minus = (a, b) => Number(mu(gcd(a, b)) < 0);
const zero = (a, b) => Number(mu(gcd(a, b)) === 0);

/*
 * Published previous geometry: block 17 THEN, with original source IA-IA-IA;
 * block 16 SOON starts at (25,16). Coordinates are 1-based, fixed from
 * external report 18/19 and checked against authentic original 729 runes.
 */
const current = {
  U: [25, 22], M: [26, 22], Z: [27, 22],
  B: [25, 25], E: [25, 27], L: [25, 25],
  previousB: [25, 16],
};
const [ur, uc] = current.U, [mr, mc] = current.M;
const [zr, zc] = current.Z, [br, bc] = current.B;
const [er, ec] = current.E, [lr, lc] = current.L;
const [pr, pc] = current.previousB;
assert.deepEqual([at(25, 22), at(26, 22), at(27, 22)], [27, 27, 27]);
assert.deepEqual([at(25, 25), at(25, 26), at(25, 27)], [20, 16, 7]);

const predicted18 = [
  minus(n2(mr, mc), n3(lr, lc))
    ^ Number(mu(n3(zr, zc) + n2(br, bc)) > 0)
    ^ minus(n3(mr, mc), n2(lr, lc)),
  zero(n2(mr, mc), n0(lr, lc))
    ^ zero(n1(mr, mc), n1(br, bc))
    ^ zero(n2(mr, mc), n0(er, ec)),
  zero(n1(ur, uc), n0(er, ec))
    ^ minus(n0(ur, uc), n2(br, bc))
    ^ (Math.floor(n3(er, ec) / 4) % 2),
];
const near19 = ((n2(br, bc) ^ n2(pr, pc)) % 7 === 0)
  === (mu(n0(ur, uc) + n0(er, ec)) < 0);
assert.deepEqual(predicted18, [1, 0, 0]);
assert.equal(near19, true);
assert.equal(n3(mr, mc), 161);

// All original mirror source nodes eligible under Reports 00-16.
const keys = [];
for (let row = 2; row <= 26; row += 2) {
  for (let col = 1; col <= 27; col += 2) {
    for (let radius = 1; radius <= 13; radius += 2) {
      if (row - radius < 1 || row + radius > 27) continue;
      const raw = [at(row - radius, col), at(row, col), at(row + radius, col)];
      if (raw.some(v => v === 0) || raw[0] !== raw[2]) continue;
      const key = [raw[0], phi(raw[1]), raw[2]];
      if (key.some(v => mu(phi(v)) !== 1)) continue;
      keys.push({center: [row, col], radius, raw, key});
    }
  }
}
assert.deepEqual(keys.map(x => x.center), [
  [8, 25], [16, 21], [18, 11], [20, 17],
]);

const counts = {report16: 0, report17: 0, report18: 0, report19: 0};
const survivors = [];
for (let row = 2; row <= 27; row += 1) {
  for (let col = 2; col <= 27; col += 1) {
    for (let length = 2; length <= Math.min(row, col); length += 1) {
      const endRow = row - length + 1;
      const endCol = col - length + 1;
      if (endRow % 2 !== 1 || endCol % 2 !== 0) continue;
      if (mu(n1(endRow, endCol)) > 0) continue;
      const dr = Math.abs(row - lr), dc = Math.abs(col - lc);
      if (Math.min(dr, dc, Math.abs(dr - dc)) !== 1) continue;

      for (const {center, key} of keys) {
        const [kr, kc] = center;
        const checks = [
          gcd(n0(kr, kc), n0(row, col)),
          gcd(n0(kr, kc), n0(endRow, endCol)),
          gcd(n1(kr, kc), n3(endRow, endCol)),
          gcd(n0(kr, kc), n2(endRow, endCol)),
        ];
        if (checks.some(x => mu(x) === 0)) continue;
        counts.report16 += 1;

        // Report17: XOR current n3(center) with next key center column.
        const arg17 = n3(mr, mc) ^ kc;
        if (arg17 !== 0 && mu(arg17) > 0) continue;
        counts.report17 += 1;

        // Report18: endpoint sector, endpoint Mobius sign, start-side.
        const actual18 = [
          Number(Math.abs(endRow - ur) >= Math.abs(endCol - uc)),
          Number(mu(n0(endRow, endCol)) < 0),
          Number(col > bc),
        ];
        if (actual18.some((bit, i) => bit !== predicted18[i])) continue;
        counts.report18 += 1;

        // Report19: same near/far class relative to B and leftmost L.
        const dB = Math.max(Math.abs(row - br), Math.abs(col - bc));
        const dL = Math.max(Math.abs(row - lr), Math.abs(col - lc));
        if ((dB <= 7) !== near19 || (dL <= 7) !== near19) continue;
        counts.report19 += 1;

        const cipher = Array.from({length}, (_, i) => at(row - i, col - i));
        const plain = cipher.map((v, i) => mod(v - key[i % 3], 29));
        assert.deepEqual(plain.map((v, i) => mod(v + key[i % 3], 29)), cipher);
        survivors.push({
          center, start: [row, col], end: [endRow, endCol],
          length, key, plain, word: plain.map(x => corpus.translit[x]).join(''),
        });
      }
    }
  }
}
assert.deepEqual(counts, {
  report16: 1104,
  report17: 1104,
  report18: 604,
  report19: 268,
});
const segmentKey = x => [...x.start, ...x.end].join(',');
const segments = new Map();
for (const s of survivors) {
  const id = segmentKey(s);
  if (!segments.has(id)) segments.set(id, []);
  segments.get(id).push(s);
}
assert.equal(segments.size, 67);
for (const group of segments.values()) {
  assert.equal(group.length, 4);
  assert.equal(new Set(group.map(x => x.center.join(','))).size, 4);
}

const sameCipher = survivors.filter(x =>
  segmentKey(x) === '22,21,21,20');
const the = sameCipher.find(x => x.word === 'THE');
const ye = sameCipher.find(x => x.word === 'YE');
assert.equal(sameCipher.length, 4);
assert.deepEqual({word: the.word, center: the.center, key: the.key, plain: the.plain},
  {word: 'THE', center: [20, 17], key: [9, 18, 9], plain: [2, 18]});
assert.deepEqual({word: ye.word, center: ye.center, key: ye.key, plain: ye.plain},
  {word: 'YE', center: [8, 25], key: [14, 18, 14], plain: [26, 18]});
assert.deepEqual([at(22, 21), at(21, 20)], [11, 7]);

console.log(JSON.stringify({
  source: 'unchanged LP2 pp0-2, 729 GP29 runes',
  prior: 'proposed block17 THEN, Report00-16 baseline 1104',
  newFilterCounts: counts,
  survivingSegments: segments.size,
  secretKeyChoicesPerSegment: 4,
  sameOriginalCipher: ['J', 'W'],
  distinctCompleteEnglishWords: [
    {word: the.word, center: the.center, key: the.key},
    {word: ye.word, center: ye.center, key: ye.key},
  ],
  status: 'No deterministic plaintext or author-authenticated key selected',
}, null, 2));
