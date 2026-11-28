'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const BASE29 = '0123456789ABCDEFGHIJKLMNOPQRS';

const corpus = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'),
);
const ink = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'),
);
const originalIndex = fs.readFileSync(
  path.join(ROOT, 'resources/historical/cicada2014-onion7-original-index.html'),
  'utf8',
);
const tcpSource = fs.readFileSync(
  path.join(ROOT, 'resources/historical/2013-tcp-server-worked-examples-source.md'),
  'utf8',
);

function base29(n) {
  if (n === 0) return '0';
  let x = n;
  let out = '';
  while (x > 0) {
    out = BASE29[x % MOD] + out;
    x = Math.floor(x / MOD);
  }
  return out;
}

function translit(indices) {
  return indices.map((x) => corpus.translit[x]).join('');
}

const imageRefs = [...originalIndex.matchAll(/<img src="(\d+)\.jpg"/g)]
  .map((m) => Number(m[1]));
assert.deepEqual(imageRefs, Array.from({ length: 58 }, (_, i) => i));

assert.match(tcpSource, /C: BASE29 3301\s+S: 01 OK 3QO/);
assert.match(tcpSource, /C: DH 23\s+S: 01 OK 5 8\s+C: 19\s+S: 03 DATA 2/);

const pages = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55)
  .sort((a, b) => a.page - b.page);

const selfIndexed = pages.filter(
  (p) => Math.floor(p.runic_count / MOD) === p.page,
);
assert.deepEqual(
  selfIndexed.map((p) => [p.page, p.runic_count, base29(p.runic_count)]),
  [
    [6, 196, '6M'],
    [7, 208, '75'],
    [8, 255, '8N'],
    [9, 268, '97'],
  ],
);

const token = selfIndexed
  .map((p) => base29(p.runic_count).slice(1))
  .join('');
assert.equal(token, 'M5N7');

const digits = [...token].map((ch) => BASE29.indexOf(ch));
assert.deepEqual(digits, [22, 5, 23, 7]);
assert.equal(digits.reduce((a, b) => a + b, 0), 57);

const windows = [];
for (let start = 0; start <= 52; start++) {
  const block = pages.slice(start, start + 4);
  const remainders = block.map((p) => p.runic_count % MOD);
  windows.push({
    start,
    remainders,
    sum: remainders.reduce((a, b) => a + b, 0),
    inner: remainders.slice(1, 3),
    selfIndex: block.every(
      (p, i) => Math.floor(p.runic_count / MOD) === start + i,
    ),
  });
}

assert.deepEqual(
  windows
    .filter((x) => x.sum === 57)
    .map((x) => [x.start, x.remainders]),
  [[6, [22, 5, 23, 7]]],
);
assert.deepEqual(
  windows
    .filter((x) => x.inner[0] === 5 && x.inner[1] === 23)
    .map((x) => [x.start, x.remainders]),
  [[6, [22, 5, 23, 7]]],
);
assert.deepEqual(
  windows
    .filter((x) => x.selfIndex)
    .map((x) => [x.start, x.remainders]),
  [[6, [22, 5, 23, 7]]],
);

const p57 = corpus.pages.find((p) => p.page === 57);
assert(p57);
const p57Text = translit(p57.indices);
assert.equal(
  p57Text,
  'PARABLELICETHEINSTARTUNNELNGTOTHESURFACEWEMUSTSHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE',
);
assert.match(
  p57Text,
  /WEMUSTSHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE/,
);

const shed = token.slice(1, -1);
assert.equal(shed, '5N');
const shedDigits = [...shed].map((ch) => BASE29.indexOf(ch));
assert.deepEqual(shedDigits, [5, 23]);

const state = { p: 23, g: 5, A: 8, B: 19, K: 2 };
assert.deepEqual(shedDigits, [state.g, state.p]);

const remainderH = [
  digits[0] - digits[3],
  digits[1] - digits[2],
  digits[1] + digits[2],
  digits[0] + digits[3],
].map((x) => ((x % MOD) + MOD) % MOD);
assert.deepEqual(remainderH, [15, 11, 28, 0]);

const pageNumberH = [
  6 - 9,
  7 - 8,
  7 + 8,
  6 + 9,
].map((x) => ((x % MOD) + MOD) % MOD);
assert.deepEqual(pageNumberH, [26, 28, 15, 15]);

const crossLockStarts = [];
for (let start = 0; start <= 52; start++) {
  const high = [start, start + 1, start + 2, start + 3];
  const low = pages.slice(start, start + 4).map((p) => p.runic_count % MOD);
  const hh = [
    high[0] - high[3],
    high[1] - high[2],
    high[1] + high[2],
    high[0] + high[3],
  ].map((x) => ((x % MOD) + MOD) % MOD);
  const hl = [
    low[0] - low[3],
    low[1] - low[2],
    low[1] + low[2],
    low[0] + low[3],
  ].map((x) => ((x % MOD) + MOD) % MOD);
  if (hl[0] === hh[2] && hl[2] === hh[1] && hl[3] === 0) {
    crossLockStarts.push({ start, high, low, highH: hh, lowH: hl });
  }
}
assert.deepEqual(crossLockStarts, [{
  start: 6,
  high: [6, 7, 8, 9],
  low: [22, 5, 23, 7],
  highH: [26, 28, 15, 15],
  lowH: [15, 11, 28, 0],
}]);

let compatible = 0;
const quotientBins = new Map();
for (const p of pages) {
  const q = Math.floor(p.runic_count / MOD);
  if (!quotientBins.has(q)) quotientBins.set(q, []);
  quotientBins.get(q).push(p.runic_count % MOD);
}
for (const a of quotientBins.get(6)) {
  for (const b of quotientBins.get(7)) {
    for (const c of quotientBins.get(8)) {
      for (const d of quotientBins.get(9)) {
        const h = [
          a - d,
          b - c,
          b + c,
          a + d,
        ].map((x) => ((x % MOD) + MOD) % MOD);
        if (h.join(',') === '15,11,28,0') compatible++;
      }
    }
  }
}
assert.equal(compatible, 1);

function modPow(base, exponent, modulus) {
  let b = BigInt(base);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

const dh = {
  a: selfIndexed[0].page,
  g: shedDigits[0],
  p: shedDigits[1],
  b: ((digits[0] - digits[3]) % MOD + MOD) % MOD,
};
dh.A = modPow(dh.g, dh.a, dh.p);
dh.B = modPow(dh.g, dh.b, dh.p);
dh.K = modPow(dh.A, dh.b, dh.p);
assert.deepEqual(dh, { a: 6, g: 5, p: 23, b: 15, A: 8, B: 19, K: 2 });
assert.equal(dh.A, selfIndexed[2].page);
assert.equal(dh.K, ((digits[3] - digits[1]) % MOD + MOD) % MOD);

let dhCompatible = 0;
const dhHits = [];
for (const c6 of quotientBins.get(6)) {
  for (const c7 of quotientBins.get(7)) {
    for (const c8 of quotientBins.get(8)) {
      for (const c9 of quotientBins.get(9)) {
        const r0 = c6;
        const candidateG = c7;
        const candidateP = c8;
        const r3 = c9;
        if (candidateP < 2 || candidateG <= 0 || candidateG >= candidateP) continue;
        let isPrime = true;
        for (let d = 2; d * d <= candidateP; d++) {
          if (candidateP % d === 0) { isPrime = false; break; }
        }
        if (!isPrime) continue;
        const candidateA = modPow(candidateG, 6, candidateP);
        if (candidateA !== 8) continue;
        const candidateBExp = ((r0 - r3) % MOD + MOD) % MOD;
        const candidateB = modPow(candidateG, candidateBExp, candidateP);
        const candidateK = modPow(candidateA, candidateBExp, candidateP);
        const observedK = ((r3 - candidateG) % MOD + MOD) % MOD;
        if (candidateK !== observedK) continue;
        dhCompatible++;
        dhHits.push({
          remainders: [r0, candidateG, candidateP, r3],
          a: 6, g: candidateG, p: candidateP, A: candidateA,
          b: candidateBExp, B: candidateB, K: candidateK,
        });
      }
    }
  }
}
assert.equal(dhCompatible, 1);
assert.deepEqual(dhHits, [{
  remainders: [22, 5, 23, 7],
  a: 6, g: 5, p: 23, A: 8, b: 15, B: 19, K: 2,
}]);

const signedBase29Output = base29(3301);
assert.equal(signedBase29Output, '3QO');
const signedBase29Digits = [...signedBase29Output].map((ch) => BASE29.indexOf(ch));
assert.deepEqual(signedBase29Digits, [3, 26, 24]);
const p53Pointer = signedBase29Digits.reduce((sum, d) => sum + d, 0);
assert.equal(p53Pointer, 53);

const p53 = corpus.pages.find((p) => p.page === p53Pointer);
const p53Ink = ink.pages.find((p) => p.page === p53Pointer);
assert(p53 && p53Ink);
assert.equal(p53.runic_count, dh.a * MOD + dh.g);
assert.equal(p53.runic_count, 179);
assert.equal(base29(p53.runic_count), '65');
assert.deepEqual(
  corpus.pages.filter((p) => p.page >= 0 && p.page <= 55 && p.runic_count === 179)
    .map((p) => p.page),
  [53],
);

const predictedRedSuffixLength = MOD + (dh.p - 1);
assert.equal(predictedRedSuffixLength, 51);
assert.deepEqual(
  p53Ink.red_spans.map((s) => [s.start, s.length]),
  [[128, 51]],
);
assert.equal(p53Ink.red_spans[0].start + p53Ink.red_spans[0].length, p53.runic_count);
const predictedBlackPrefixLength = p53.runic_count - predictedRedSuffixLength;
assert.equal(predictedBlackPrefixLength, 128);
assert.equal(base29(predictedBlackPrefixLength), '4C');
assert.equal(base29(predictedRedSuffixLength), '1M');

const predictedTerminalDots = dh.b - dh.K;
assert.equal(predictedTerminalDots, 13);
assert.ok(
  p53Ink.large_punctuation.some(
    ([offset, dots, color]) =>
      offset === p53.runic_count && dots === predictedTerminalDots && color === 'red',
  ),
);

const output = {
  historicalZeroOrigin: {
    original2014ImageRefs: '0.jpg through 57.jpg',
    count: imageRefs.length,
  },
  authenticatedOperations: {
    base29: '3301 -> 3QO',
    dh: { p: 23, g: 5, A: 8, B: 19, K: 2 },
  },
  selfIndex: selfIndexed.map((p) => ({
    page: p.page,
    runes: p.runic_count,
    base29: base29(p.runic_count),
  })),
  token,
  tokenDigits: digits,
  tokenDigitSum: 57,
  solvedPage57Instruction:
    'WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIUINITY WITHIN AND EMERGE',
  shed,
  shedDigits,
  shedMatchesHistoricalDh: ['g', 'p'],
  remainderH,
  pageNumberH,
  sourceOnlyCrossLockStarts: crossLockStarts,
  commonPagePointer: pageNumberH[2],
  quotientBinCompatibleAssignments: 3 * 7 * 6 * 32,
  exactRemainderHAssignments: compatible,
  reconstructedDh: dh,
  dhCompatibleAssignments: dhCompatible,
  dhHits,
  p15Pointer: dh.b,
  p53Continuation: {
    signedBase29Output,
    signedBase29Digits,
    pagePointer: p53Pointer,
    totalRunes: p53.runic_count,
    totalBase29: base29(p53.runic_count),
    predictedFromDh: {
      total: 'a*29+g = 179',
      redSuffix: '29+(p-1) = 51',
      blackPrefix: '179-51 = 128',
      terminalDots: 'b-K = 13',
    },
    observed: {
      redSpan: [p53Ink.red_spans[0].start, p53Ink.red_spans[0].length],
      blackPrefixBase29: base29(predictedBlackPrefixLength),
      redSuffixBase29: base29(predictedRedSuffixLength),
      terminalRedDots: predictedTerminalDots,
    },
  },
  decision:
    'The source-visible zero-based BASE29 self-index block yields M5N7; sum57 selects solved p57, whose circumference instruction exposes 5N=[g,p]. Run start a=6 and outer difference b=15 reconstruct the full authenticated DH state uniquely among 4,032 quotient-compatible count choices and point to physical p15. The signed-source 3QO digit sum then selects p53, whose held-out color geometry matches four DH-derived predictions: total179=a*29+g, red suffix51=29+(p-1), black prefix128, and terminal13=b-K. This is a structural/navigation route, not yet a body decryption.',
};
const json = JSON.stringify(output, null, 2);
console.log(json);
fs.writeFileSync(
  path.join(process.env.RUNNER_TEMP || process.cwd(), 'source-test-output.json'),
  json + '\n',
);
