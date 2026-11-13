'use strict';

/**
 * SFT: source-motivated GP29 differential/plaintext-feedback inverses.
 * Run on Windows 11 with: node sims/lp2_delta_plainfeedback_source_gate_sft.cjs
 * Reads the unchanged original-cipher resource. Performs no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const prime = corpus.prime;
const mod = n => (n % 29 + 29) % 29;

assert.equal(prime.length, 29);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(pages.reduce((sum, p) => sum + p.indices.slice(1)
  .filter((v, i) => v === p.indices[i]).length, 0), 86);

function counts(values) {
  const hist = Array(29).fill(0);
  for (const v of values) hist[v]++;
  return hist;
}
function ioc(hist) {
  const n = hist.reduce((sum, v) => sum + v, 0);
  return hist.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1));
}
function add(into, from) {
  for (let j = 0; j < 29; j++) into[j] += from[j];
}
function sourceFunction(type) {
  return prime.map(v => type === 'prime' ? v : type === 'totient' ? v - 1 : v + 1);
}

/** Reversible page-local causal inverse for C[i]-C[i-1]=P[i]+sgn*f(P[i-1]). */
function decode(cipher, f, sgn, initialPlaintext) {
  const plain = [initialPlaintext];
  for (let i = 1; i < cipher.length; i++) {
    plain.push(mod(cipher[i] - cipher[i - 1] - sgn * f[plain[i - 1]]));
  }
  return plain;
}
function encode(plain, f, sgn, initialCiphertext) {
  const cipher = [initialCiphertext];
  for (let i = 1; i < plain.length; i++) {
    cipher.push(mod(cipher[i - 1] + plain[i] + sgn * f[plain[i - 1]]));
  }
  return cipher;
}
function scanPrimeFeedback(f, sgn) {
  const pooled = Array(29).fill(0);
  const candidate = [];
  let weighted = 0;
  for (const page of pages) {
    const all = Array.from({ length: 29 }, (_, seed) => {
      const plain = decode(page.indices, f, sgn, seed);
      const hist = counts(plain);
      return { seed, hist, ioc: ioc(hist), plain };
    });
    all.sort((a, b) => b.ioc - a.ioc);
    const best = all[0];
    weighted += best.ioc * page.indices.length;
    add(pooled, best.hist);
    candidate.push({ page: page.page, seed: best.seed, ioc: best.ioc,
      prefix: best.plain.slice(0, 18).map(i => corpus.translit[i]).join('.') });
  }
  const n = pages.reduce((s, p) => s + p.indices.length, 0);
  return { pooledIoc: ioc(pooled), averagePageIoc: weighted / n, p55: candidate.find(p => p.page === 55) };
}

const results = [];
for (const type of ['prime', 'totient', 'primePlus1']) {
  const f = sourceFunction(type);
  for (const sign of [1, -1]) {
    const result = scanPrimeFeedback(f, sign);
    const sourcePlain = corpus.pages[57].indices;
    assert.equal(sourcePlain.length, 95);
    const originalShapePlant = [];
    for (const page of pages) {
      const plant = Array.from({ length: page.indices.length },
        (_, i) => sourcePlain[(i + page.page * 17) % sourcePlain.length]);
      const cipher = encode(plant, f, sign, (page.page * 11 + 1) % 29);
      const recovered = decode(cipher, f, sign, plant[0]);
      assert.deepEqual(recovered, plant);
      assert.deepEqual(encode(recovered, f, sign, cipher[0]), cipher);
      originalShapePlant.push(...recovered);
    }
    assert.ok(ioc(counts(originalShapePlant)) > 0.055);
    results.push({ type, sign, ...result });
  }
}

const expectedPooled = [
  0.03452788400344175, 0.03456296399213131,
  0.03452216444006845, 0.034528003161012025,
  0.03452354666788366, 0.03456305931818753
];
for (let i = 0; i < results.length; i++) {
  assert.ok(Math.abs(results[i].pooledIoc - expectedPooled[i]) < 1e-12);
}

/** Unknown affine first-order plaintext feedback on the observed difference stream. */
function scanAffineDelta() {
  const ranked = [];
  for (let b = 0; b < 29; b++) {
    const streams = pages.map(page => {
      let x = 0, power = 1;
      const values = [];
      for (let i = 1; i < page.indices.length; i++) {
        x = mod(page.indices[i] - page.indices[i - 1] + b * x);
        power = mod(power * b);
        values.push([x, power, i]);
      }
      return values;
    });
    for (let k = 0; k < (b === 0 ? 1 : 29); k++) {
      const pooled = Array(29).fill(0);
      let same = 0, total = 0;
      for (const steps of streams) {
        const hist = Array(29).fill(0);
        for (const [x, power, pos] of steps) {
          const v = mod(x + (b === 1 ? k * pos : k * power));
          hist[v]++;
        }
        add(pooled, hist);
        const n = steps.length;
        same += hist.reduce((s, c) => s + c * (c - 1), 0);
        total += n * (n - 1);
      }
      ranked.push({ b, k, pooledIoc: ioc(pooled), withinPageIoc: same / total });
    }
  }
  ranked.sort((x, y) => y.withinPageIoc - x.withinPageIoc);
  return { count: ranked.length, best: ranked.slice(0, 4) };
}
const affine = scanAffineDelta();
assert.equal(affine.count, 813);
assert.deepEqual([affine.best[0].b, affine.best[0].k], [0, 0]);
assert.ok(Math.abs(affine.best[0].withinPageIoc - 0.035405878181388385) < 1e-12);
assert.ok(affine.best[1].withinPageIoc < 0.035);

/** A fixed secret permutation cannot change the sorted output symbol histogram. */
function nativeGP(text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const runes = [];
  for (const raw of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const token = tokens.find(v => word.startsWith(v.s, i));
      assert.ok(token);
      runes.push(token.i);
      i += token.s.length;
    }
  }
  return runes;
}
function sortedCounts(values) {
  return counts(values).sort((a, b) => a - b);
}
const delta = pages.flatMap(page => page.indices.slice(1)
  .map((v, i) => mod(v - page.indices[i])));
assert.equal(delta.length, 12901);
const observedSorted = sortedCounts(delta);
assert.equal(observedSorted[0], 86);
assert.equal(observedSorted[28], 510);

// A prime+constant state law only translates every output bin, leaving the
// ordered counts identical for prime, prime-1 and prime+1, for either sign.
const allSecret = [];
const controlFiles = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt'
];
for (const file of controlFiles) {
  const native = nativeGP(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
  const minima = [{ tv: Infinity }, { tv: Infinity }];
  let windows = 0, lowestSourceMaximum = Infinity;
  for (let offset = 0; offset + 12956 <= native.length; offset += 1301) {
    windows++;
    for (let j = 0; j < 2; j++) {
      const sign = j === 0 ? 1 : -1;
      const transformed = [];
      let start = offset;
      for (const page of pages) {
        for (let i = 1; i < page.indices.length; i++) {
          transformed.push(mod(native[start + i] +
            sign * prime[native[start + i - 1]]));
        }
        start += page.indices.length;
      }
      const ranked = sortedCounts(transformed);
      const totalVariation = ranked.reduce(
        (sum, v, i) => sum + Math.abs(v - observedSorted[i]), 0
      ) / (2 * transformed.length);
      if (totalVariation < minima[j].tv) {
        minima[j] = { tv: totalVariation, offset, sourceMaximum: ranked[28] };
      }
      lowestSourceMaximum = Math.min(lowestSourceMaximum, ranked[28]);

      // A planted, completely secret 29-symbol alphabet permutation must
      // preserve the sorted count profile precisely, with no key knowledge.
      if (windows === 1 && j === 0) {
        const permuted = transformed.map(x => (7 * x + 3) % 29);
        assert.deepEqual(sortedCounts(permuted), ranked);
      }
    }
  }
  assert.ok(windows > 0);
  assert.ok(minima.every(x => x.tv > 0.09));
  assert.ok(lowestSourceMaximum >= 700);
  allSecret.push({ control: file, windows, bestPlus: minima[0],
    bestMinus: minima[1], lowestSourceMaximum });
}
assert.deepEqual(allSecret.map(x => x.windows), [159, 240, 39]);
console.log(JSON.stringify({ source: 'unchanged LP2 pp0-55', runes: 12956, pages: 55,
  nonlinearPrimeFeedback: results, affineDelta: affine,
  allSecretPermutationGate: { observedMin: 86, observedMax: 510,
    controlProfiles: allSecret } }, null, 2));

