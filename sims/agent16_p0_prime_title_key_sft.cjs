'use strict';

// Source-locked test of the 13 red p0 title runes as a numeric period-13 key.
// The 13-dot boundary fixes the first black body rune as key phase zero.
// Only prime(index) mod 29 and phi(prime(index)) mod 29 are tested, with both
// additive signs, with and without the historically attested plaintext-F hold.
// No phase search, key permutation, page reset, or language-model fitting.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = corpus.pages;
const p0 = pages.find((p) => p.page === 0).indices;
const p1 = pages.find((p) => p.page === 1).indices;
const p2 = pages.find((p) => p.page === 2).indices;
const p57 = pages.find((p) => p.page === 57).indices;

const mod29 = (n) => ((n % 29) + 29) % 29;
const title = p0.slice(0, 13);
const p0Body = p0.slice(13);
const p1p2 = [...p1, ...p2];
const chapterBody = [...p0Body, ...p1p2];

assert.equal(title.length, 13);
assert.deepEqual(title, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(p0.length, 262);
assert.equal(p0Body.length, 249);
assert.equal(p1p2.length, 467);
assert.equal(chapterBody.length, 716);
assert.equal(p0Body[0], 2);
assert.equal(p57.length, 95);

const primeKey = title.map((i) => corpus.prime[i] % 29);
const phiKey = title.map((i) => (corpus.prime[i] - 1) % 29);
assert.deepEqual(primeKey, [24, 23, 9, 7, 17, 13, 20, 2, 24, 16, 9, 21, 13]);
assert.deepEqual(phiKey, [23, 22, 8, 6, 16, 12, 19, 1, 23, 15, 8, 20, 12]);
assert(primeKey.every((x, i) => mod29(x - phiKey[i]) === 1));

function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

function decodeNoHold(cipher, key, sign) {
  return cipher.map((c, i) => mod29(c + sign * key[i % 13]));
}

function reachWithFHold(cipher, key, sign) {
  let paths = Array(13).fill(0n);
  paths[0] = 1n;
  let peak = 1n;
  let firstDead = null;

  for (let offset = 0; offset < cipher.length; offset += 1) {
    const c = cipher[offset];
    const next = Array(13).fill(0n);

    for (let phase = 0; phase < 13; phase += 1) {
      if (paths[phase] === 0n) continue;
      if (c === 0) next[phase] += paths[phase];
      const plain = mod29(c + sign * key[phase]);
      if (plain !== 0) next[(phase + 1) % 13] += paths[phase];
    }

    paths = next;
    const total = paths.reduce((sum, n) => sum + n, 0n);
    if (total === 0n) {
      firstDead = offset;
      break;
    }
    if (total > peak) peak = total;
  }

  return {
    firstDead,
    peakPaths: String(peak),
    finalPhases: paths.map((n, phase) => n ? { phase, paths: String(n) } : null).filter(Boolean),
  };
}

function encodeWithFHold(plain, key, sign) {
  let phase = 0;
  const cipher = [];
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
    } else {
      cipher.push(mod29(p - sign * key[phase]));
      phase = (phase + 1) % 13;
    }
  }
  return { cipher, finalPhase: phase };
}

function checkTrueFHoldPath(plain, cipher, key, sign) {
  let phase = 0;
  for (let i = 0; i < plain.length; i += 1) {
    const p = plain[i];
    const c = cipher[i];
    if (p === 0) {
      assert.equal(c, 0);
    } else {
      assert.equal(mod29(c + sign * key[phase]), p);
      phase = (phase + 1) % 13;
    }
  }
  return phase;
}

function translit(xs) {
  return xs.map((x) => corpus.translit[x]).join(' ');
}

const variants = [];
for (const [name, key] of [['prime', primeKey], ['phi(prime)', phiKey]]) {
  for (const sign of [-1, 1]) {
    const p0Plain = decodeNoHold(p0Body, key, sign);
    const laterPlain = decodeNoHold(p1p2, key, sign);
    const fullPlain = decodeNoHold(chapterBody, key, sign);
    const p0Hold = reachWithFHold(p0Body, key, sign);
    const fullHold = reachWithFHold(chapterBody, key, sign);

    assert.equal(p0Hold.firstDead, fullHold.firstDead);
    assert(p0Hold.firstDead !== null);

    const planted = encodeWithFHold(p57, key, sign);
    const plantedFinalPhase = checkTrueFHoldPath(p57, planted.cipher, key, sign);
    const plantedReach = reachWithFHold(planted.cipher, key, sign);
    assert.equal(plantedReach.firstDead, null);
    assert(plantedReach.finalPhases.some((x) => x.phase === plantedFinalPhase));

    const noHoldPlant = p57.map((p, i) => mod29(p - sign * key[i % 13]));
    assert.deepEqual(decodeNoHold(noHoldPlant, key, sign), p57);

    variants.push({
      keyName: name,
      sign: sign === -1 ? 'minus' : 'plus',
      key,
      noHold: {
        p0IoC: ioc(p0Plain),
        p1p2IoC: ioc(laterPlain),
        chapterIoC: ioc(fullPlain),
        p0First40: translit(p0Plain.slice(0, 40)),
        p1p2First40: translit(laterPlain.slice(0, 40)),
      },
      plaintextFHold: {
        firstImpossibleP0BodyOffset: p0Hold.firstDead,
        firstImpossibleChapterBodyOffset: fullHold.firstDead,
        peakReachablePaths: p0Hold.peakPaths,
      },
      positiveControl: {
        solvedP57Runes: p57.length,
        truePathRetained: true,
        finalPhase: plantedFinalPhase,
        noHoldRoundTrip: true,
      },
    });
  }
}

const raw = {
  p0IoC: ioc(p0Body),
  p1p2IoC: ioc(p1p2),
  chapterIoC: ioc(chapterBody),
  solvedP57IoC: ioc(p57),
};

assert.deepEqual(
  variants.map((x) => x.plaintextFHold.firstImpossibleP0BodyOffset),
  [14, 115, 152, 30],
);
assert(Math.abs(variants[0].noHold.chapterIoC - variants[2].noHold.chapterIoC) < 1e-15);
assert(Math.abs(variants[1].noHold.chapterIoC - variants[3].noHold.chapterIoC) < 1e-15);

const output = {
  schema: 1,
  source: 'resources/liber-primus/lp2-corpus.json',
  operation: 'period-13 GP29 additive key; phase zero at first black p0 body rune; continuous through p0-p2',
  title: {
    indices: title,
    transliteration: translit(title),
    primeValues: title.map((i) => corpus.prime[i]),
    primeMod29: primeKey,
    phiPrimeMod29: phiKey,
  },
  sourceLengths: {
    p0Body: p0Body.length,
    p1p2: p1p2.length,
    chapterBody: chapterBody.length,
    solvedP57Control: p57.length,
  },
  rawIoC: raw,
  variants,
  decision: 'All four phase-zero prime/phi-prime variants are nonlinguistic without the F hold and have no legal original p0 path with the authentic plaintext-F hold. No unknown plaintext or authentic key recovered.',
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
