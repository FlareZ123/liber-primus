'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const mod = (x, n) => ((x % n) + n) % n;
const alpha = '0123456789abcdefghijklmnopqrs';
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const groups55 = JSON.parse(read('resources/liber-primus/lp2-page-groups-54-55-derived.json')).p55.groups;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit;
const render = xs => xs.map(x => translit[x]).join('');
const toValues = s => Array.from(s, ch => {
  const v = alpha.indexOf(ch);
  assert.notEqual(v, -1, 'unexpected non-GP29 token in p55 groups');
  return v;
});
const p55 = groups55.flatMap(toValues);
const completeGroups = groups55.slice(1);
const interior = completeGroups.flatMap(s => {
  const a = toValues(s);
  return a.slice(1, -1);
});
const localExterior = completeGroups.flatMap(s => {
  const a = toValues(s);
  return [a[0], a[a.length - 1]];
});
assert.equal(groups55.length, 17);
assert.equal(completeGroups.length, 16);
assert.equal(p55.length, 76);
assert.equal(interior.length, 43);
assert.equal(localExterior.length, 32);

const transcription = read('resources/liber-primus/lp2-transcription.txt');
const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
assert.equal(segments.length, 55);
const p55LineLengths = segments[54].split('/').map(line =>
  Array.from(line).filter(ch => runeIndex.has(ch)).length
);
assert.deepEqual(p55LineLengths, [24, 22, 22, 8]);

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}
const cuneiform = [1033, 3301];
assert.deepEqual(cuneiform.map(isPrime), [true, true]);
const phi = cuneiform.map(n => n - 1);
assert.deepEqual(phi, [1032, 3300]);
assert.equal(phi[0], 43 * 24);
assert.equal(phi[1], 43 * 76 + 32);
assert.equal(phi[0] % 43, 0);
assert.equal(phi[1] % 43, 32);

function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}
function inverse(a, n) {
  for (let x = 1; x < n; x++) if (mod(a * x, n) === 1) return x;
  throw new Error('no modular inverse');
}
function affineForward(input, a, b) {
  const n = input.length;
  assert.equal(gcd(a, n), 1);
  return Array.from({ length: n }, (_, i) => input[mod(a * i + b, n)]);
}
function affineInverse(input, a, b) {
  const n = input.length;
  const ai = inverse(a, n);
  return Array.from({ length: n }, (_, i) => input[mod(ai * (i - b), n)]);
}
function keyStream(input, sign, fHold) {
  let phase = 0;
  return input.map(c => {
    if (fHold && c === 0) return 0;
    const k = mod(43 * phase + 32, 76) % 29;
    phase++;
    return mod(c + sign * k, 29);
  });
}
function hill(input, matrix, rowVector) {
  assert.equal(input.length % 2, 0);
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
function matrixInverse(m) {
  const d = mod(m[0][0] * m[1][1] - m[0][1] * m[1][0], 29);
  const di = inverse(d, 29);
  return {
    determinant: d,
    inverse: [
      [mod(m[1][1] * di, 29), mod(-m[0][1] * di, 29)],
      [mod(-m[1][0] * di, 29), mod(m[0][0] * di, 29)]
    ]
  };
}

const outputs = {
  raw: render(p55),
  first24Forward: render(affineForward(p55.slice(0, 24), 43, 0)),
  first24Inverse: render(affineInverse(p55.slice(0, 24), 43, 0)),
  full76Forward: render(affineForward(p55, 43, 32)),
  full76Inverse: render(affineInverse(p55, 43, 32)),
  keyMinusConsume: render(keyStream(p55, -1, false)),
  keyPlusConsume: render(keyStream(p55, 1, false)),
  keyMinusFHold: render(keyStream(p55, -1, true)),
  keyPlusFHold: render(keyStream(p55, 1, true))
};
const matrix = [[24, 0], [mod(76, 29), 32]];
const matrixData = matrixInverse(matrix);
outputs.hillDirectColumn = render(hill(p55, matrix, false));
outputs.hillDirectRow = render(hill(p55, matrix, true));
outputs.hillInverseColumn = render(hill(p55, matrixData.inverse, false));
outputs.hillInverseRow = render(hill(p55, matrixData.inverse, true));

const quad = new Map();
for (const line of read('resources/control/duko_round27_english_quadgrams.txt').trim().split(/\r?\n/)) {
  const m = /^([A-Z]{4})\s+(\d+)$/.exec(line.trim());
  if (m) quad.set(m[1], Number(m[2]));
}
assert.ok(quad.size > 50000, 'quadgram model did not load');
function quadgramScore(s) {
  let sum = 0, n = 0;
  for (let i = 0; i + 4 <= s.length; i++) {
    sum += Math.log10(quad.get(s.slice(i, i + 4)) || 0.1);
    n++;
  }
  return sum / n;
}
const controlPaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt'
];
const controlTexts = controlPaths.map(p => read(p).toUpperCase().replace(/[^A-Z]/g, ''));
const distributions = new Map();
function controlDistribution(length) {
  if (distributions.has(length)) return distributions.get(length);
  const result = controlTexts.map(s => {
    const scores = [];
    for (let i = 0; i + length <= s.length; i += 5) {
      scores.push(quadgramScore(s.slice(i, i + length)));
    }
    scores.sort((a, b) => a - b);
    return scores;
  });
  distributions.set(length, result);
  return result;
}
function quantile(sorted, p) {
  return sorted[Math.floor((sorted.length - 1) * p)];
}
const scoreRows = Object.entries(outputs).map(([name, text]) => {
  const score = quadgramScore(text);
  const controls = controlDistribution(text.length).map((scores, i) => ({
    source: controlPaths[i].split('/').pop(),
    n: scores.length,
    p01: quantile(scores, 0.01),
    p50: quantile(scores, 0.50),
    p99: quantile(scores, 0.99),
    percentile: 100 * scores.filter(x => x <= score).length / scores.length
  }));
  return {
    name,
    length: text.length,
    score,
    belowP01All: controls.every(x => score < x.p01),
    controls,
    prefix: text.slice(0, 96)
  };
});
const p57 = render(corpus.pages.find(p => p.page === 57).indices);
const p57Score = quadgramScore(p57);

function encodeBase29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
function decodeBase29(n) {
  const out = [];
  do {
    out.unshift(Number(n % 29n));
    n /= 29n;
  } while (n);
  return out;
}
function powMod(base, exponent, modulus) {
  let x = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) x = (x * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return x;
}
const completeLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
let cursor = 1, dhInterior = [], dhShell = [];
for (const length of completeLengths) {
  const word = p55.slice(cursor, cursor + length);
  assert.equal(word.length, length);
  dhInterior.push(...word.slice(1, -1));
  dhShell.push(word[0], word[word.length - 1]);
  cursor += length;
}
assert.equal(cursor, 76);
assert.equal(dhInterior.length, 43);
assert.equal(dhShell.length, 32);
const P = encodeBase29(dhInterior) / 8n;
const g = encodeBase29(dhShell) / 43n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(g, 1268532719737981052966698570711268391040527137n);
const a = 1032n, b = 3300n;
const shared = powMod(g, a * b, P);
const dhKey = decodeBase29(shared);
assert.equal(dhKey.length, 42);

const pageFragments = corpus.pages
  .filter(p => p.page >= 33 && p.page <= 39)
  .map(p => ({
    page: p.page,
    offsetStart: p.page === 33 ? 99 : 0,
    tape: p.page === 33 ? p.indices.slice(99) : p.page === 39 ? p.indices.slice(0, 119) : p.indices
  }));
const target = pageFragments.flatMap(p => p.tape);
assert.equal(target.length, 1460);
function locateTargetPosition(position) {
  let remaining = position;
  for (const p of pageFragments) {
    if (remaining < p.tape.length) return { page: p.page, offset: p.offsetStart + remaining };
    remaining -= p.tape.length;
  }
  return null;
}
function forwardFTransparent(plain, key) {
  let phase = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p + key[phase], 29);
    phase = (phase + 1) % key.length;
    return c;
  });
}
function inverseFTransparent(cipher, key) {
  let states = new Map([[0, { count: 1n, word: [] }]]);
  for (let position = 0; position < cipher.length; position++) {
    const c = cipher[position];
    const next = new Map();
    for (const [phase, state] of states) {
      const add = (nextPhase, plain) => {
        const old = next.get(nextPhase);
        if (old) old.count += state.count;
        else next.set(nextPhase, { count: state.count, word: state.word.concat(plain) });
      };
      if (c === 0) add(phase, 0);
      const plain = mod(c - key[phase], 29);
      if (plain !== 0) add((phase + 1) % key.length, plain);
    }
    if (!next.size) {
      return {
        failure: position,
        location: locateTargetPosition(position),
        cipherRune: c,
        liveBefore: Array.from(states, ([phase, state]) => ({
          phase,
          keyRune: key[phase],
          count: state.count.toString()
        }))
      };
    }
    states = next;
  }
  const candidates = Array.from(states.values());
  const example = candidates[0].word;
  const replay = forwardFTransparent(example, key);
  assert.deepEqual(replay, cipher);
  return {
    failure: null,
    pathCount: candidates.reduce((n, x) => n + x.count, 0n).toString(),
    finalPhases: Array.from(states.keys()),
    example: render(example)
  };
}
const continuousDH = inverseFTransparent(target, dhKey);
const pageResetDH = pageFragments.map(p => {
  const result = inverseFTransparent(p.tape, dhKey);
  return {
    page: p.page,
    length: p.tape.length,
    failure: result.failure,
    pageLocalFailureOffset: result.failure,
    cipherRune: result.cipherRune === undefined ? null : result.cipherRune,
    liveBefore: result.liveBefore || null,
    pathCount: result.pathCount || null,
    preview: result.example ? result.example.slice(0, 84) : null
  };
});
const ordinary = target.map((c, i) => mod(c - dhKey[i % dhKey.length], 29));
const ordinaryIoC = (() => {
  const f = Array(29).fill(0);
  for (const x of ordinary) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (ordinary.length * (ordinary.length - 1));
})();

const controlPlain = corpus.pages.find(p => p.page === 57).indices;
const controlCipher = forwardFTransparent(controlPlain, dhKey);
const controlInverse = inverseFTransparent(controlCipher, dhKey);
let knownPhase = 0;
for (let i = 0; i < controlPlain.length; i++) {
  if (controlPlain[i] === 0) {
    assert.equal(controlCipher[i], 0);
  } else {
    assert.equal(controlCipher[i], mod(controlPlain[i] + dhKey[knownPhase], 29));
    knownPhase = (knownPhase + 1) % dhKey.length;
  }
}
assert.notEqual(continuousDH.failure, null);
assert.equal(controlInverse.failure, null);
assert.ok(BigInt(controlInverse.pathCount) >= 1n);

const report = {
  cuneiformPrimeInputs: cuneiform,
  totients: phi,
  p55Geometry: {
    totalRunes: p55.length,
    lineLengths: p55LineLengths,
    interior: interior.length,
    completePageLocalExterior: localExterior.length,
    strictExteriorIncludingCarry: localExterior.length + 1
  },
  exactTotientAlignment: {
    phi1033: '1032 = 43*24',
    phi3301: '3300 = 43*76+32'
  },
  p55DirectTests: {
    affine: {
      firstLine: { a: 43, b: 0, forward: outputs.first24Forward, inverse: outputs.first24Inverse },
      fullPage: { a: 43, b: 32, forward: outputs.full76Forward, inverse: outputs.full76Inverse }
    },
    keyStream: 'K_i=((43*i+32) mod 76) mod 29',
    hillMatrix: matrix,
    hillDeterminant: matrixData.determinant,
    hillInverse: matrixData.inverse,
    quadgramScores: scoreRows,
    p57PositiveControl: { length: p57.length, score: p57Score }
  },
  dhReceiver: {
    P: P.toString(),
    g: g.toString(),
    privateExponents: [a.toString(), b.toString()],
    sharedSecret: shared.toString(),
    keyLength: dhKey.length,
    key: dhKey,
    targetLength: target.length,
    continuous: continuousDH,
    pageReset: pageResetDH,
    ordinaryConsuming: { ioc: ordinaryIoC, prefix: render(ordinary.slice(0, 120)) },
    p57FTransparentControl: {
      length: controlPlain.length,
      inverseFailure: controlInverse.failure,
      pathCount: controlInverse.pathCount,
      knownPathRetained: true
    }
  }
};
console.log(JSON.stringify(report, null, 2));
