'use strict';

const assert = require('node:assert/strict');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/base60-grid.json');

const tokens = grid.rows.flat();
const A60 = grid.alphabet;
const A59 = A60.replace('f', '');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const dh = { p: 23, g: 5, serverPublic: 8, clientPublic: 19, shared: 2 };
const steps = [2, 5, 8, 19, 23];

/** @param {number} n @returns {boolean} */
function prime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} n @returns {number} */
function primeOrdinal(n) {
  let count = 0;
  for (let x = 2; x <= n; x++) if (prime(x)) count++;
  return count;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

/** @param {number} b @param {number} e @param {number} m @returns {number} */
function modPow(b, e, m) {
  let out = 1;
  let x = b % m;
  while (e > 0) {
    if (e & 1) out = out * x % m;
    x = x * x % m;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[]} map @param {number} start @param {number} target @returns {number|null} */
function firstReach(map, start, target) {
  let at = start;
  for (let step = 1; step <= 23; step++) {
    at = map[at];
    if (at === target) return step;
  }
  return null;
}

/** @param {number} depth @returns {number[]} */
function ring(depth) {
  const r0 = depth, r1 = 31 - depth, c0 = depth, c1 = 7 - depth;
  const out = [];
  for (let c = c0; c <= c1; c++) out.push(r0 * 8 + c);
  for (let r = r0 + 1; r <= r1; r++) out.push(r * 8 + c1);
  for (let c = c1 - 1; c >= c0; c--) out.push(r1 * 8 + c);
  for (let r = r1 - 1; r > r0; r--) out.push(r * 8 + c0);
  return out;
}

const spans = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const end = span.start + span.length;
    const followsRed13 = (page.large_punctuation || []).some(
      ([offset, dots, color]) =>
        offset === end && dots === 13 && color === 'red'
    );
    if (span.length < 13 || !followsRed13) continue;
    const values = Array.from(span.runes).map((rune) => {
      const i = runeIndex.get(rune);
      return { rune: corpus.translit[i], i, gpPrime: corpus.prime[i] };
    });
    const sum = values.reduce((a, v) => a + v.gpPrime, 0);
    spans.push({
      page: page.page,
      length: span.length,
      values,
      sum,
      rank: prime(sum) ? primeOrdinal(sum) : null
    });
  }
}

assert.deepEqual(
  spans.map((s) => [s.page, s.length, s.sum, s.rank]),
  [
    [0, 13, 662, null],
    [3, 16, 742, null],
    [7, 14, 766, null],
    [23, 16, 786, null],
    [27, 19, 1109, 186],
    [53, 51, 2262, null]
  ]
);

const variants = [];
for (const s of spans) {
  const q = s.length - 13;
  const selectors = [
    ['1f', s.values[12]],
    ['0f', s.values[13]],
    ['1r', s.values[s.length - 13]],
    ['0r', s.values[s.length - 14]]
  ].filter(([, v]) => v);
  for (const [orientation, v] of selectors) {
    const product = v.gpPrime * q;
    const token = product < 256 ? tokens[product] : null;
    variants.push({
      page: s.page,
      length: s.length,
      orientation,
      rune: v.rune,
      gpPrime: v.gpPrime,
      residual: q,
      rank: s.rank,
      product,
      rankClosure: s.rank !== null && product === s.rank,
      tableReturn:
        token !== null &&
        (decode(token, A59) === s.length || decode(token, A60) === s.length)
    });
  }
}

assert.equal(variants.length, 22);
const closures = variants.filter((v) => v.rankClosure && v.tableReturn);
assert.deepEqual(closures, [{
  page: 27,
  length: 19,
  orientation: '1f',
  rune: 'I',
  gpPrime: 31,
  residual: 6,
  rank: 186,
  product: 186,
  rankClosure: true,
  tableReturn: true
}]);
assert.equal(tokens[186], '0J');

const p27 = spans.find((s) => s.page === 27);
assert.ok(p27);
const zeroAddress = 31 * 8 + 6;
const oneAddress = 30 * 8 + 5;
assert.deepEqual(
  [zeroAddress, tokens[zeroAddress], decode(tokens[zeroAddress], A59), decode(tokens[zeroAddress], A60)],
  [254, '39', 186, 189]
);
assert.deepEqual(
  [oneAddress, tokens[oneAddress], decode(tokens[oneAddress], A59), decode(tokens[oneAddress], A60)],
  [245, '0u', 55, 56]
);

const digit9 = A60.indexOf(tokens[254][1]);
const modulusSelectors = [
  p27.values[digit9 - 1],
  p27.values[digit9],
  p27.values[p27.length - digit9],
  p27.values[p27.length - 1 - digit9]
].map((v) => [v.rune, v.gpPrime]);
assert.deepEqual(modulusSelectors, [['H',23],['L',73],['E',67],['L',73]]);

const base5Selectors = [
  p27.values[4],
  p27.values[5],
  p27.values[p27.length - 5],
  p27.values[p27.length - 1 - 5]
].map((v) => [v.rune, v.i]);
assert.deepEqual(base5Selectors, [['S',15],['O',3],['L',20],['M',19]]);

assert.equal(modPow(5, 6, 23), 8);
assert.equal(modPow(5, 15, 23), 19);
assert.equal(modPow(19, 6, 23), 2);
assert.equal(modPow(8, 15, 23), 2);

const start = 23 * 8 + 2;
const end = 23 * 8 + 5;
const maps = {
  base59: tokens.map((t) => decode(t, A59)),
  base60: tokens.map((t) => decode(t, A60))
};
const pointerFamily = [];
for (const [radix, map] of Object.entries(maps)) {
  for (const [from, to] of [[start,end],[end,start]]) {
    const first = firstReach(map, from, to);
    pointerFamily.push({
      radix,
      from,
      to,
      first,
      signedStepHit: first !== null && steps.includes(first)
    });
  }
}
assert.deepEqual(pointerFamily, [
  {radix:'base59',from:186,to:189,first:8,signedStepHit:true},
  {radix:'base59',from:189,to:186,first:null,signedStepHit:false},
  {radix:'base60',from:186,to:189,first:null,signedStepHit:false},
  {radix:'base60',from:189,to:186,first:null,signedStepHit:false}
]);

const rings = [0,1,2,3].map((depth) => ({ depth, cells: ring(depth) }));
assert.deepEqual(rings.map((r) => r.cells.length), [76,68,60,52]);
const selected = rings.filter((r) => r.cells.includes(start) && r.cells.includes(end));
assert.deepEqual(selected.map((r) => r.depth), [2]);
const perimeter = selected[0].cells;
const a = perimeter.indexOf(start);
const b = perimeter.indexOf(end);
const arc1 = (b - a + perimeter.length) % perimeter.length;
const arc2 = (a - b + perimeter.length) % perimeter.length;
assert.deepEqual([arc1, arc2], [45,15]);
assert.equal(modPow(5, Math.min(arc1, arc2), 23), 19);

/**
 * @param {number} coordinateAddress
 * @param {number} seed
 * @returns {{trials:number,any:number,forward:number,reverse:number,exact8:number,rate:number}}
 */
function nullRun(coordinateAddress, seed) {
  const remaining = tokens.slice();
  for (const wanted of ['0J','39']) {
    remaining.splice(remaining.indexOf(wanted), 1);
  }
  let state = seed >>> 0;
  /** @returns {number} */
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }

  let any = 0, forward = 0, reverse = 0, exact8 = 0;
  const trials = 300000;
  const stepSet = new Set(steps);

  for (let trial = 0; trial < trials; trial++) {
    const assigned = new Map([[186,'0J'],[coordinateAddress,'39']]);
    const used = new Set();

    /** @param {number} at @returns {string} */
    function tokenAt(at) {
      if (assigned.has(at)) return assigned.get(at);
      let i;
      do i = random() % remaining.length; while (used.has(i));
      used.add(i);
      const token = remaining[i];
      assigned.set(at, token);
      return token;
    }

    /** @param {number} from @param {number} to @param {string} alphabet @returns {number|null} */
    function randomFirst(from, to, alphabet) {
      let at = from;
      for (let step = 1; step <= 23; step++) {
        at = decode(tokenAt(at), alphabet);
        if (at === to) return step;
        if (at < 0 || at >= 256) return null;
      }
      return null;
    }

    const f59 = randomFirst(186,189,A59);
    const f60 = randomFirst(186,189,A60);
    const r59 = randomFirst(189,186,A59);
    const r60 = randomFirst(189,186,A60);
    const f = stepSet.has(f59) || stepSet.has(f60);
    const r = stepSet.has(r59) || stepSet.has(r60);
    if (f) forward++;
    if (r) reverse++;
    if (f || r) any++;
    if (f59 === 8) exact8++;
  }
  return {trials, any, forward, reverse, exact8, rate:any/trials};
}

const zeroNull = nullRun(254, 0x16365050);
const oneNull = nullRun(245, 0x16365051);
assert.deepEqual(
  [zeroNull.any,zeroNull.forward,zeroNull.reverse,zeroNull.exact8],
  [34557,27043,8220,4083]
);
assert.deepEqual(
  [oneNull.any,oneNull.forward,oneNull.reverse,oneNull.exact8],
  [41009,23055,19353,3811]
);

const familywiseUpper =
  (1/256) * (2/255) * (zeroNull.rate + oneNull.rate);
assert.ok(Math.abs(familywiseUpper - 0.000007717116013071895) < 1e-18);

console.log(JSON.stringify({
  sourceFamily:{spans:spans.map((s)=>[s.page,s.length,s.sum,s.rank]),variants:variants.length,closures},
  coordinateOrigins:{zero:[254,'39',186,189],one:[245,'0u',55,56]},
  pointerFamily,
  ringFamily:{depths:rings.map((r)=>[r.depth,r.cells.length]),selectedDepth:2,arcs:[45,15]},
  matchedNull:{zeroNull,oneNull,familywiseUpper,inverse:1/familywiseUpper},
  historicalScope:{signedWorkedExamples:1,signedTuple:dh},
  decision:'retain strong local DH/base59 structure; global handoff and plaintext receiver remain provisional'
}, null, 2));
