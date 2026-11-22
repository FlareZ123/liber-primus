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
/**
 * Source p15 has an original 4x4 numeric grid. Permit SIXTEEN secret,
 * unrelated output alphabets, keyed either by the page-local or by the
 * continuous global rune position modulo 16. Every alphabet is an arbitrary
 * 29-symbol bijection. Sorted bins at each phase remain exact invariants.
 */
const PHASES = 16;
const originalPhase = [0, 1].map(() =>
  Array.from({ length: PHASES }, () => Array(29).fill(0)));
let globalStart = 0;
for (const page of pages) {
  for (let i = 1; i < page.indices.length; i++) {
    const d = mod(page.indices[i] - page.indices[i - 1]);
    originalPhase[0][i % PHASES][d]++;
    originalPhase[1][(globalStart + i) % PHASES][d]++;
  }
  globalStart += page.indices.length;
}
const originalRanked = originalPhase.map(rows =>
  rows.map(v => v.slice().sort((a, b) => a - b)));
function phaseDistance(actual, reference) {
  let numerator = 0;
  for (let p = 0; p < PHASES; p++)
    for (let k = 0; k < 29; k++)
      numerator += Math.abs(actual[p][k] - reference[p][k]);
  return numerator / (2 * 12901);
}
const phase16 = [];
for (const file of controlFiles) {
  const native = nativeGP(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
  const best = [0, 1].map(() => [{ tv: Infinity }, { tv: Infinity }]);
  const sourceSource = [];
  let referenceProfile = null;
  let windows = 0;
  for (let offset = 0; offset + 12956 <= native.length; offset += 1301) {
    windows++;
    for (let direction = 0; direction < 2; direction++) {
      const sign = direction === 0 ? 1 : -1;
      const phaseData = [0, 1].map(mode => {
        const h = Array.from({ length: PHASES }, () => Array(29).fill(0));
        let gpOffset = offset, globalOffset = 0;
        for (const page of pages) {
          for (let i = 1; i < page.indices.length; i++) {
            const phase = (mode === 0 ? i : globalOffset + i) % PHASES;
            const v = mod(native[gpOffset + i] +
              sign * prime[native[gpOffset + i - 1]]);
            h[phase][v]++;
          }
          gpOffset += page.indices.length;
          globalOffset += page.indices.length;
        }
        return h.map(v => v.sort((a, b) => a - b));
      });
      for (let mode = 0; mode < 2; mode++) {
        const tv = phaseDistance(phaseData[mode], originalRanked[mode]);
        if (tv < best[mode][direction].tv)
          best[mode][direction] = { tv, offset };
      }
      if (file === controlFiles[0] && direction === 0) {
        if (offset === 0) referenceProfile = phaseData[0];
        else if (offset >= 12956)
          sourceSource.push(phaseDistance(phaseData[0], referenceProfile));
      }
      if (offset === 0 && direction === 0) {
        // One independent secret alphabet for each of sixteen phases.
        const keyPhase = Array.from({ length: PHASES }, (_, p) => 3 * p + 7);
        for (let mode = 0; mode < 2; mode++) {
          const plaintextHist = phaseData[mode];
          const relabeled = Array.from({ length: PHASES }, () =>
            Array(29).fill(0));
          // Recover counts from the original native input, rather than
          // from an already sorted histogram.
          let base = offset, global = 0;
          for (const page of pages) {
            for (let i = 1; i < page.indices.length; i++) {
              const p = (mode === 0 ? i : global + i) % PHASES;
              const symbol = mod(native[base + i] +
                prime[native[base + i - 1]]);
              relabeled[p][(7 * symbol + keyPhase[p]) % 29]++;
            }
            base += page.indices.length;
            global += page.indices.length;
          }
          assert.deepEqual(relabeled.map(h =>
            h.sort((a, b) => a - b)), plaintextHist);
        }
      }
    }
  }
  assert.ok(best.flat().every(x => x.tv > 0.06));
  if (sourceSource.length) {
    sourceSource.sort((a, b) => a - b);
    assert.equal(sourceSource.length, 149);
    assert.ok(sourceSource.at(-1) < 0.05);
  }
  phase16.push({ control: file, windows, pageLocal: best[0],
    bookGlobal: best[1], sourceSourceBenchmark:
      sourceSource.length ? { comparisons: sourceSource.length,
        min: sourceSource[0], median: sourceSource[Math.floor(sourceSource.length / 2)],
        max: sourceSource.at(-1) } : null });
}
assert.deepEqual(phase16.map(x => x.windows), [159, 240, 39]);
/**
 * Competing historically plausible language registers: the manuscript has a
 * Latin title, while its GP glyphs draw from an Anglo-Saxon runic tradition.
 * These independent corpus resources already include native GP transliteration,
 * so their original words must not be transliterated a second time.
 */
function decodeBase29(text, alphabet) {
  const values = [...text].map(v => alphabet.indexOf(v));
  assert.ok(values.every(v => v >= 0 && v < 29));
  return values;
}
const latinText = fs.readFileSync(path.join(__dirname, '..',
  'resources/control/latin-vulgate-gp-wholewords.txt'), 'utf8');
const latinRunes = decodeBase29(latinText.split(/\r?\n/)
  .filter(v => v && !v.trimStart().startsWith('#')).join(''),
  '0123456789ABCDEFGHIJKLMNOPQRS');
const oldEnglishProfile = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/control/beowulf_oe_gp_profile_corrected.json'), 'utf8'));
const oldEnglishRunes = decodeBase29(oldEnglishProfile.sourceGpBase29,
  oldEnglishProfile.positiveControlAlphabet);
assert.equal(latinRunes.length, 204802);
assert.equal(oldEnglishRunes.length, 48012);

/** Sorted fixed-source output bins with optional independent 16-phase keys. */
function alternativeProfile(source, offset, sign, phaseMode) {
  const phaseCount = phaseMode === 'single' ? 1 : PHASES;
  const hist = Array.from({ length: phaseCount }, () => Array(29).fill(0));
  let at = offset, global = 0;
  for (const page of pages) {
    for (let i = 1; i < page.indices.length; i++) {
      const phase = phaseMode === 'single' ? 0 :
        (phaseMode === 'page' ? i : global + i) % PHASES;
      hist[phase][mod(source[at + i] +
        sign * prime[source[at + i - 1]])]++;
    }
    at += page.indices.length;
    global += page.indices.length;
  }
  return hist.map(h => h.sort((a, b) => a - b));
}
const languageRegisters = [];
const alternatives = [
  ['Latin Vulgate', latinRunes, 148, [
    [0.11247190140299201, 0.11681265018215642],
    [0.08301682040151927, 0.08782264940702271],
    [0.08324936051468879, 0.08697000232540113]
  ]],
  ['Old English Beowulf', oldEnglishRunes, 27, [
    [0.09061313076505698, 0.09634912022323851],
    [0.0630958840399969, 0.06232075032943183],
    [0.06611890551120068, 0.06425858460584451]
  ]]
];
for (const [label, source, expectedWindows, expected] of alternatives) {
  const modes = ['single', 'page', 'book'], minima = modes.map(() =>
    [{ tv: Infinity }, { tv: Infinity }]);
  const disjoint = modes.map(() => [[], []]);
  const reference = modes.map(() => [null, null]);
  let windows = 0;
  for (let offset = 0; offset + 12956 <= source.length; offset += 1301) {
    windows++;
    for (let m = 0; m < modes.length; m++) {
      for (let dir = 0; dir < 2; dir++) {
        const sign = dir === 0 ? 1 : -1;
        const ranked = alternativeProfile(source, offset, sign, modes[m]);
        const observed = modes[m] === 'single' ? [observedSorted] :
          originalRanked[m - 1];
        const tv = ranked.reduce((sum, row, i) =>
          sum + row.reduce((a, v, j) =>
            a + Math.abs(v - observed[i][j]), 0), 0) / (2 * 12901);
        if (tv < minima[m][dir].tv)
          minima[m][dir] = { tv, offset };
        if (offset === 0) reference[m][dir] = ranked;
        if (offset >= 12956 && m > 0)
          disjoint[m][dir].push(phaseDistance(ranked, reference[m][dir]));
      }
    }
  }
  assert.equal(windows, expectedWindows);
  for (let m = 0; m < modes.length; m++) {
    for (let dir = 0; dir < 2; dir++) {
      assert.ok(Math.abs(minima[m][dir].tv - expected[m][dir]) < 1e-12);
      if (m > 0) {
        disjoint[m][dir].sort((a, b) => a - b);
        const sourceCeiling = disjoint[m][dir].at(-1);
        assert.ok(minima[m][dir].tv > sourceCeiling);
      }
    }
  }
  languageRegisters.push({ label, windows, singleAlphabet: minima[0],
    sixteenPage: minima[1], sixteenGlobal: minima[2],
    disjointPageBenchmark: disjoint[1].map(list => ({
      n: list.length, min: list[0], max: list.at(-1)
    })),
    disjointGlobalBenchmark: disjoint[2].map(list => ({
      n: list.length, min: list[0], max: list.at(-1)
    })) });
}
console.log(JSON.stringify({ source: 'unchanged LP2 pp0-55', runes: 12956, pages: 55,
  nonlinearPrimeFeedback: results, affineDelta: affine,
  allSecretPermutationGate: { observedMin: 86, observedMax: 510,
    controlProfiles: allSecret },
  phase16AllSecretGate: phase16, otherPlaintextRegisters: languageRegisters }, null, 2));



