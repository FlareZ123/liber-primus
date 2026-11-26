'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const native = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const emerson = fs.readFileSync(path.join(ROOT, 'resources/control/emerson_essays_2944.txt'), 'utf8');
const gibran = fs.readFileSync(path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8');

const MOD = 29;
const N = 12956;
const DIGRAPHS = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
function gpWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/[KV]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    let token, step;
    if (s.slice(i, i + 3) === 'ING') { token = 'NG'; step = 3; }
    else {
      token = null;
      for (const d of DIGRAPHS) if (s.slice(i, i + d.length) === d) { token = d; break; }
      if (!token) token = s[i];
      step = token.length;
    }
    const index = corpus.translit.indexOf(token);
    assert.notEqual(index, -1, 'unmapped GP token: ' + token);
    out.push(index);
    i += step;
  }
  return out;
}
function gpText(text) {
  const out = [];
  for (const word of (text.match(/[A-Za-z]+/g) || [])) out.push(...gpWord(word));
  return out;
}
function counts(values) {
  const f = new Uint32Array(MOD);
  for (const x of values) f[x]++;
  return { F: f[0], U: f[1], EA: f[28], total: values.length };
}
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function unitPrimeResidues(count) {
  const out = [];
  for (let p = 2; out.length < count; p++) {
    if (isPrime(p) && gcd(p, 28) === 1) out.push(p % 28);
  }
  return out;
}
function powMod(base, exponent, modulus) {
  let a = base % modulus, e = exponent, out = 1;
  while (e > 0) {
    if (e & 1) out = out * a % modulus;
    a = a * a % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}
function inverseMod(e, modulus) {
  for (let d = 1; d < modulus; d++) if (e * d % modulus === 1) return d;
  throw new Error('nonunit exponent ' + e);
}
function encrypt(plain, exponents) {
  let clock = 0;
  return plain.map(P => {
    if (P === 0) return 0; // Transparent F holds the public prime clock.
    const e = exponents[clock++];
    return powMod(P, e, MOD);
  });
}
function decrypt(cipher, exponents) {
  let clock = 0;
  return cipher.map(C => {
    if (C === 0) return 0;
    const e = exponents[clock++];
    return powMod(C, inverseMod(e, 28), MOD);
  });
}
function windowStats(name, text) {
  const values = gpText(text);
  const windows = [];
  for (let start = 0; start + N <= values.length; start += 1000) {
    windows.push({ start, ...counts(values.slice(start, start + N)) });
  }
  const field = key => {
    const a = windows.map(w => w[key]).sort((x, y) => x - y);
    return { min: a[0], median: a[Math.floor(a.length / 2)], max: a[a.length - 1] };
  };
  return {
    name, length: values.length, windowCount: windows.length,
    F: field('F'), U: field('U'), EA: field('EA'),
    eaAtLeastOriginal: windows.filter(w => w.EA >= 460).length
  };
}

const tape = corpus.pages.filter(p => p.page >= 0 && p.page <= 55).flatMap(p => p.indices);
assert.equal(tape.length, N);
const original = counts(tape);
assert.deepEqual(original, { F: 458, U: 450, EA: 460, total: N });

const nativeRuneIndex = new Map(native.runes.map((r, i) => [r, i]));
const nativeTape = native.sections.flatMap(section =>
  [...section.source_text].filter(ch => nativeRuneIndex.has(ch)).map(ch => nativeRuneIndex.get(ch))
);
const nativeCounts = counts(nativeTape);
assert.deepEqual(nativeCounts, { F: 48, U: 153, EA: 20, total: 2979 });

const controls = [
  windowStats('Shakespeare', shakespeare),
  windowStats('Emerson', emerson),
  windowStats('Gibran', gibran)
];
assert.equal(controls.reduce((s, x) => s + x.windowCount, 0), 566);
const maxEA = Math.max(...controls.map(x => x.EA.max));
const maxF = Math.max(...controls.map(x => x.F.max));
assert.equal(maxEA, 168);
assert.equal(maxF, 428);
assert.ok(original.EA > maxEA);
assert.ok(original.F > maxF);

// Every invertible exponent modulo 28 is odd and fixes 0, 1 and -1 (GP29 28).
const exponents = unitPrimeResidues(N);
assert.equal(exponents[0], 3);
assert.ok(exponents.every(e => e % 2 === 1 && gcd(e, 28) === 1));
for (const e of exponents.slice(0, 100)) {
  assert.equal(powMod(0, e, 29), 0);
  assert.equal(powMod(1, e, 29), 1);
  assert.equal(powMod(28, e, 29), 28);
}

// Positive control: plant and exactly invert the frozen exponent clock on native GP English.
const control = gpText(gibran).slice(0, N);
assert.equal(control.length, N);
const plantedCipher = encrypt(control, exponents);
const recovered = decrypt(plantedCipher, exponents);
assert.deepEqual(recovered, control);
assert.deepEqual(counts(plantedCipher), counts(control));

const result = {
  fixedSymbols: ['F/index0', 'U/index1', 'EA/index28'],
  invariant: 'For every unit exponent e mod28, e is odd and x^e fixes 0, 1 and 28 mod29.',
  original,
  externalSolvedNative: nativeCounts,
  matchedEnglishWindows: controls,
  aggregateWindows: 566,
  aggregateMaxEA: maxEA,
  aggregateMaxF: maxF,
  primeExponentResiduesFirst30: exponents.slice(0, 30),
  syntheticGibran: {
    length: control.length,
    exactInverse: recovered.every((x, i) => x === control[i]),
    plaintextCounts: counts(control),
    ciphertextCounts: counts(plantedCipher)
  },
  decision: 'Reject the identity-offset odd-prime exponent-only receiver before original language scoring; 460 fixed EA symbols are outside every matched English control window.'
};
console.log(JSON.stringify(result, null, 2));
