const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2] ?? path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const s = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(s.length, 729);
assert.equal(s[13], 2);
const maxPrime = Math.max(...corpus.prime);
const B = maxPrime * Math.max(...corpus.pages.slice(0, 56).map(p => p.indices.length));
assert.equal(B, 30193);
const M = 29n ** 13n;

/** Maximum product of k positive integer parts with sum at most cap. */
function upper(cap, k) {
  const q = Math.floor(cap / k), rem = cap % k;
  return BigInt(q) ** BigInt(k - rem) * BigInt(q + 1) ** BigInt(rem);
}
const maxByK = Array.from({ length: 6 }, (_, i) => upper(B, i + 1));
assert(maxByK.slice(0, 5).every(n => n < M));
const max = maxByK[5];
const sieve = new Uint8Array(B + 1), primes = [];
for (let p = 2; p <= B; p++) {
  if (sieve[p]) continue;
  primes.push(p);
  for (let j = p * p; j <= B; j += p) sieve[j] = 1;
}
const mod = (a, b) => ((a % b) + b) % b;
function inv(a, p) {
  let x = 1, y = 0, b = p;
  while (b) {
    const q = Math.floor(a / b);
    [a, b] = [b, a - q * b];
    [x, y] = [y, x - q * y];
  }
  assert.equal(a, 1);
  return mod(x, p);
}
const ps = primes.map(p => ({ p, b: BigInt(p), i: p === 29 ? null : inv(Number(M % BigInt(p)), p) }));

/** Exact minimum sum of six integer factors >=2, restricted to sum <= B.
 *  Sort the bins to quotient permutations; assign the prime factors in descending order.
 *  Products and the sum never decrease as factors are assigned. */
function minSix(f) {
  if (f.length < 6) return null;
  f = f.slice().sort((a, b) => b - a);
  let best = B + 1, witness = null;
  const seen = new Set();
  function dfs(i, a) {
    const sum = a.reduce((x, y) => x + y, 0);
    if (sum >= best || a.filter(x => x === 1).length > f.length - i) return;
    if (i === f.length) {
      best = sum;
      witness = a.slice();
      return;
    }
    const key = i + ':' + a.join(',');
    if (seen.has(key)) return;
    seen.add(key);
    for (let j = 0; j < 6; j++) {
      if (j && a[j] === a[j - 1]) continue;
      const b = a.slice();
      b[j] *= f[i];
      if (b[j] > B) continue;
      b.sort((x, y) => x - y);
      dfs(i + 1, b);
    }
  }
  dfs(0, [1, 1, 1, 1, 1, 1]);
  if (!witness) return null;
  assert(witness.every(x => x >= 2));
  assert.equal(witness.reduce((n, x) => n * BigInt(x), 1n), f.reduce((n, x) => n * BigInt(x), 1n));
  return { sum: best, parts: witness };
}

/** Exhaust all q for N=n+q*M <= max. Factor simultaneously by modular sieve. */
function assess(n) {
  assert(n >= 0n && n < M);
  const L = Number((max - n) / M) + 1;
  const nums = Array.from({ length: L }, (_, q) => n + BigInt(q) * M);
  const fac = nums.map(() => []);
  for (const { p, b, i } of ps) {
    let q0, step;
    if (p === 29) {
      if (n % b !== 0n) continue;
      q0 = 0; step = 1;
    } else {
      q0 = mod(-Number(n % b) * i, p); step = p;
    }
    for (let q = q0; q < L; q += step) {
      while (nums[q] > 1n && nums[q] % b === 0n) {
        nums[q] /= b;
        fac[q].push(p);
      }
    }
  }
  const smooth = [];
  let zeroLiftSmooth = false;
  for (let q = 0; q < L; q++) {
    if (nums[q] !== 1n) continue;
    if (q === 0) zeroLiftSmooth = true;
    const f = fac[q], sum = f.reduce((a, b) => a + b, 0);
    assert.equal(f.reduce((v, p) => v * BigInt(p), 1n), n + BigInt(q) * M);
    if (sum <= B) smooth.push({ q, f, sum, group: minSix(f) });
  }
  return { L, zeroLiftSmooth, smooth };
}

const controlSums = [30, 30, 28].map((len, i) => {
  const start = [7, 37, 67][i];
  return corpus.pages[57].indices.slice(start, start + len).reduce((n, x) => n + corpus.prime[x], 0);
});
assert.deepEqual(controlSums, [1259, 1031, 1229]);
const controlProduct = controlSums.reduce((n, v) => n * BigInt(v), 1n);
assert.equal(controlProduct, 1595277641n);
const rawControl = assess(controlProduct);
assert(rawControl.smooth.some(x => x.q === 0 && x.sum === 3519 && x.f.length === 3));

// Wrapped synthetic arithmetic controls, independent of the opening tape.
const primeParts = primes.filter(x => x <= 5000).slice(-6);
const compositeParts = [...primeParts.slice(1), 2 * primes.filter(x => x <= 2500).at(-1)];
const controls = [primeParts, compositeParts].map((parts, i) => {
  const product = parts.reduce((n, x) => n * BigInt(x), 1n);
  const q = Number(product / M);
  assert(q > 0 && product <= max);
  const match = assess(product % M).smooth.find(x => x.q === q);
  assert(match && match.group);
  const sum = parts.reduce((a, b) => a + b, 0);
  assert(match.group.sum <= sum);
  if (i === 0) {
    assert.equal(match.f.length, 6);
    assert.equal(match.group.sum, sum);
  }
  return { parts, product: product.toString(), q, recovered: match.group };
});

const frames = [
  ['full-last', 0, 56, false],
  ['full-first', 1, 56, false],
  ['black-last', 13, 55, true],
  ['black-first', 14, 55, true],
  ['title-TH-sentinel', 14, 55, false]
];
const cache = new Map();
function cached(n) {
  const key = n.toString();
  if (!cache.has(key)) cache.set(key, assess(n));
  return cache.get(key);
}
const rp = corpus.pages.slice(0, 56).filter(p => p.indices.length).map(p => p.page);
const pack = a => a.reduce((n, x) => 29n * n + BigInt(x), 0n);
const output = [];
for (const [name, start, count, skip] of frames) {
  const rows = Array.from({ length: count }, (_, i) => s.slice(start + 13 * i, start + 13 * (i + 1)));
  if (name === 'title-TH-sentinel') rows.unshift(s.slice(0, 13));
  for (const orientation of ['printed', 'reverse']) {
    const ns = rows.map(a => pack(orientation === 'printed' ? a : a.slice().reverse()));
    const assigned = corpus.pages.filter(p => p.page >= 3 && p.page <= 55 && p.indices.length).map(p => {
      const n = ns[skip ? rp.indexOf(p.page) : p.page], cap = maxPrime * p.indices.length;
      const candidates = cached(n).smooth.filter(x => x.group && x.group.sum <= cap);
      return { page: p.page, candidates };
    });
    assert.equal(assigned.length, 52);
    output.push({ name, orientation, rows: ns.length,
      anyPagePass: ns.filter(n => cached(n).smooth.some(x => x.group)).length,
      assignedPass: assigned.filter(x => x.candidates.length).map(x => x.page),
      assigned });
  }
}
const values = [...cache.values()];
const summary = {
  B, M: M.toString(), maxByK: maxByK.map(String),
  distinct: cache.size, lifts: values.reduce((a, x) => a + x.L, 0),
  zeroLiftSmoothRows: values.filter(x => x.zeroLiftSmooth).length,
  smoothRows: values.filter(x => x.smooth.length).length,
  smoothLifts: values.flatMap(x => x.smooth).length,
  primeOnlyLifts: values.flatMap(x => x.smooth).filter(x => x.f.length === 6).length,
  exactRows: values.filter(x => x.smooth.some(y => y.group)).length,
  exactLifts: values.flatMap(x => x.smooth).filter(x => x.group).length
};
assert.deepEqual([summary.distinct, summary.lifts, summary.zeroLiftSmoothRows, summary.primeOnlyLifts, summary.exactRows, summary.exactLifts], [224, 354485, 0, 0, 24, 26]);
assert.deepEqual(output.map(x => x.assignedPass.length), [4,2,4,2,4,2,5,2,4,2]);
console.log(JSON.stringify({ summary, controlSums, controls, output }, null, 2));
