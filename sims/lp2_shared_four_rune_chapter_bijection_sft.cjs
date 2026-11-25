#!/usr/bin/env node
'use strict';

/*
 * Exact shared 4-rune bijection gate across nine visually framed LP2 sections.
 *
 * Logical section starts: p0,p3,p8,p15,p23,p27,p33,p40,p54.
 * Original archive image number = logical LP2 page + 17.
 * Page carries remain continuous inside each section; only section starts
 * reset the packet phase.
 *
 * Model: one arbitrary bijection on the 29^4 four-rune packet alphabet,
 * shared across chapters; each chapter independently chooses phase 0..3.
 * The first phase runes and final incomplete packet are copied unchanged.
 *
 * A shared bijection exists iff the observed packet-pair relation is both
 * functional and injective across the tested chapters.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter((p) => p.page < 56);
const cipher = pages.flatMap((p) => p.indices);
const N = cipher.length;
assert.equal(N, 12956);

const CHAPTER_PAGE_BOUNDS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const pageOffset = new Map();
let offset = 0;
for (const p of pages) {
  pageOffset.set(p.page, offset);
  offset += p.indices.length;
}
const chapters = CHAPTER_PAGE_BOUNDS.slice(0, -1).map((startPage, i) => {
  const endPage = CHAPTER_PAGE_BOUNDS[i + 1];
  const start = pageOffset.get(startPage);
  const end = endPage === 56 ? N : pageOffset.get(endPage);
  return { index: i, pages: [startPage, endPage - 1], start, end, length: end - start };
});
assert.deepEqual(chapters.map((c) => c.length), [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

const MODULUS = 29 ** 4;
const pack4 = (a, p) => ((a[p] * 29 + a[p + 1]) * 29 + a[p + 2]) * 29 + a[p + 3];
function unpack4(value) {
  const out = Array(4);
  for (let i = 3; i >= 0; i -= 1) {
    out[i] = value % 29;
    value = Math.floor(value / 29);
  }
  return out;
}
function runePacket(value) {
  return unpack4(value).map((i) => gp.translit[i]).join(' ');
}
function packetize(a, chapter, phase) {
  const values = [];
  const positions = [];
  let p = chapter.start + phase;
  while (p + 4 <= chapter.end) {
    values.push(pack4(a, p));
    positions.push(p);
    p += 4;
  }
  return { values, positions, headFringe: phase, tailFringe: chapter.end - p };
}
function addPackets(forward, reverse, cPackets, pPackets, meta) {
  assert.equal(cPackets.values.length, pPackets.values.length);
  for (let i = 0; i < cPackets.values.length; i += 1) {
    const c = cPackets.values[i];
    const p = pPackets.values[i];
    const at = { chapter: meta.chapter + 1, phase: meta.phase, packet: i, global: cPackets.positions[i] };
    if (forward.has(c) && forward.get(c).value !== p) {
      const old = forward.get(c);
      return { ok: false, kind: 'forward', ...at, cipher: c, oldPlain: old.value, newPlain: p, oldAt: old.at };
    }
    if (reverse.has(p) && reverse.get(p).value !== c) {
      const old = reverse.get(p);
      return { ok: false, kind: 'reverse', ...at, plain: p, oldCipher: old.value, newCipher: c, oldAt: old.at };
    }
    if (!forward.has(c)) forward.set(c, { value: p, at });
    if (!reverse.has(p)) reverse.set(p, { value: c, at });
  }
  return null;
}
function checkSequences(sequences) {
  const forward = new Map();
  const reverse = new Map();
  let blocks = 0;
  for (const s of sequences) {
    const conflict = addPackets(forward, reverse, s.c, s.p, s.meta);
    if (conflict) return { ok: false, ...conflict };
    blocks += s.c.values.length;
  }
  return { ok: true, distinct: forward.size, blocks };
}
function singleCompatible(cPackets, pPackets, chapter, phase) {
  return checkSequences([{ c: cPackets, p: pPackets, meta: { chapter, phase } }]).ok;
}
function pairCompatible(cPackets, pPackets, a, b, phaseA, phaseB) {
  return checkSequences([
    { c: cPackets[a][phaseA], p: pPackets[a][phaseA], meta: { chapter: a, phase: phaseA } },
    { c: cPackets[b][phaseB], p: pPackets[b][phaseB], meta: { chapter: b, phase: phaseB } }
  ]);
}
function duplicateStats(packets) {
  const counts = new Map();
  let duplicatePairs = 0;
  for (const value of packets.values) {
    const n = counts.get(value) || 0;
    duplicatePairs += n;
    counts.set(value, n + 1);
  }
  return { blocks: packets.values.length, distinct: counts.size, duplicatePairs };
}
const originalCollisionStats = chapters.map((chapter) => ({
  chapter: chapter.index + 1,
  pages: chapter.pages,
  length: chapter.length,
  phases: [0, 1, 2, 3].map((phase) => duplicateStats(packetize(cipher, chapter, phase)))
}));

function summarizeMode(native, sourceName, step, modeName) {
  const starts = [];
  for (let p = 0; p + N <= native.length; p += step) starts.push(p);
  const expected = modeName === 'half-overlap'
    ? { Gibran: 8, Shakespeare: 32, Emerson: 48 }[sourceName]
    : { Gibran: 4, Shakespeare: 16, Emerson: 24 }[sourceName];
  assert.equal(starts.length, expected);

  let pairTests = 0;
  let pairSurvivors = 0;
  let eligiblePairTests = 0;
  let eligiblePairSurvivors = 0;
  let forwardConflicts = 0;
  let reverseConflicts = 0;
  let singleChapterPhaseSurvivors = 0;
  const perChapterSingle = Array(9).fill(0);
  const eligibleExamples = [];

  for (let wi = 0; wi < starts.length; wi += 1) {
    const windowStart = starts[wi];
    const plain = native.slice(windowStart, windowStart + N);
    const cPackets = chapters.map((chapter) =>
      [0, 1, 2, 3].map((phase) => packetize(cipher, chapter, phase)));
    const pPackets = chapters.map((chapter) =>
      [0, 1, 2, 3].map((phase) => packetize(plain, chapter, phase)));
    const single = chapters.map((chapter, ci) =>
      [0, 1, 2, 3].map((phase) =>
        singleCompatible(cPackets[ci][phase], pPackets[ci][phase], ci, phase)));

    for (let ci = 0; ci < 9; ci += 1) {
      for (let phase = 0; phase < 4; phase += 1) {
        if (single[ci][phase]) {
          singleChapterPhaseSurvivors += 1;
          perChapterSingle[ci] += 1;
        }
      }
    }

    for (let a = 0; a < 9; a += 1) {
      for (let b = a + 1; b < 9; b += 1) {
        for (let phaseA = 0; phaseA < 4; phaseA += 1) {
          for (let phaseB = 0; phaseB < 4; phaseB += 1) {
            pairTests += 1;
            const result = pairCompatible(cPackets, pPackets, a, b, phaseA, phaseB);
            if (result.ok) pairSurvivors += 1;
            else if (result.kind === 'forward') forwardConflicts += 1;
            else reverseConflicts += 1;

            if (single[a][phaseA] && single[b][phaseB]) {
              eligiblePairTests += 1;
              if (result.ok) eligiblePairSurvivors += 1;
              if (eligibleExamples.length < 12) {
                eligibleExamples.push({ window: wi, windowStart, chapters: [a + 1, b + 1], phases: [phaseA, phaseB], result });
              }
            }
          }
        }
      }
    }
  }

  return {
    source: sourceName, mode: modeName, windows: starts.length, pairTests, pairSurvivors,
    eligiblePairTests, eligiblePairSurvivors, singleChapterPhaseSurvivors,
    perChapterSinglePhaseSurvivors: perChapterSingle,
    forwardConflicts, reverseConflicts, eligibleExamples
  };
}

const donors = [
  { name: 'Gibran', path: 'resources/control/gibran_prophet_58585.txt' },
  { name: 'Shakespeare', path: 'resources/control/shakespeare_first300k.txt' },
  { name: 'Emerson', path: 'resources/control/emerson_essays_2944.txt' }
];
const controlResults = [];
const nativeByName = {};
for (const donor of donors) {
  const native = encodeSourceNativeGP(read(donor.path));
  nativeByName[donor.name] = native;
  controlResults.push(summarizeMode(native, donor.name, Math.floor(N / 2), 'half-overlap'));
  controlResults.push(summarizeMode(native, donor.name, N, 'disjoint'));
}

const half = controlResults.filter((x) => x.mode === 'half-overlap');
const disjoint = controlResults.filter((x) => x.mode === 'disjoint');
assert.equal(half.reduce((s, x) => s + x.pairTests, 0), 50688);
assert.equal(half.reduce((s, x) => s + x.pairSurvivors, 0), 0);
assert.equal(half.reduce((s, x) => s + x.eligiblePairTests, 0), 2);
assert.deepEqual(half.map((x) => x.perChapterSinglePhaseSurvivors), [
  [0, 0, 0, 0, 0, 0, 0, 0, 4],
  [3, 0, 0, 0, 0, 0, 0, 0, 46],
  [3, 0, 0, 0, 0, 0, 0, 0, 73]
]);
assert.deepEqual(half.map((x) => x.eligiblePairTests), [0, 0, 2]);
assert.equal(disjoint.reduce((s, x) => s + x.pairTests, 0), 25344);
assert.equal(disjoint.reduce((s, x) => s + x.pairSurvivors, 0), 0);
assert.equal(disjoint.reduce((s, x) => s + x.eligiblePairTests, 0), 0);
assert.equal(disjoint.reduce((s, x) => s + x.eligiblePairSurvivors, 0), 0);
assert.deepEqual(disjoint.map((x) => x.perChapterSinglePhaseSurvivors), [
  [0, 0, 0, 0, 0, 0, 0, 0, 3],
  [2, 0, 0, 0, 0, 0, 0, 0, 22],
  [1, 0, 0, 0, 0, 0, 0, 0, 41]
]);

// Both sections admit a private map in these two cases, but not one shared map.
const emerson = nativeByName.Emerson;
const emersonWindowIndex = 9;
const emersonWindowStart = emersonWindowIndex * Math.floor(N / 2);
const emersonWindow = emerson.slice(emersonWindowStart, emersonWindowStart + N);
const cPackets = chapters.map((c) => [0, 1, 2, 3].map((ph) => packetize(cipher, c, ph)));
const pPackets = chapters.map((c) => [0, 1, 2, 3].map((ph) => packetize(emersonWindow, c, ph)));
assert.equal(singleCompatible(cPackets[0][2], pPackets[0][2], 0, 2), true);
assert.equal(singleCompatible(cPackets[8][0], pPackets[8][0], 8, 0), true);
assert.equal(singleCompatible(cPackets[8][3], pPackets[8][3], 8, 3), true);
const crossChapterCertificates = [
  pairCompatible(cPackets, pPackets, 0, 8, 2, 0),
  pairCompatible(cPackets, pPackets, 0, 8, 2, 3)
];
assert(crossChapterCertificates.every((x) => !x.ok && x.kind === 'reverse'));
assert.deepEqual(crossChapterCertificates.map((x) => [x.plain, x.oldCipher, x.newCipher]), [
  [256886, 529022, 698184],
  [413207, 257621, 463082]
]);

// Positive plant: one compact affine bijection is shared across all chapters,
// while each chapter independently chooses its own packet phase.
const plantPlain = nativeByName.Gibran.slice(0, N);
const phaseVector = [1, 3, 0, 2, 1, 2, 3, 0, 1];
const a = 37;
const b = 12345;
const M = MODULUS;
const mod = (x, m) => ((x % m) + m) % m;
function gcd(a0, b0) {
  let x = BigInt(a0);
  let y = BigInt(b0);
  while (y !== 0n) [x, y] = [y, x % y];
  return x < 0n ? -x : x;
}
function modInverse(a0, m0) {
  const m = BigInt(m0);
  let t = 0n, nextT = 1n;
  let r = m, nextR = ((BigInt(a0) % m) + m) % m;
  while (nextR !== 0n) {
    const q = r / nextR;
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  if (r !== 1n) throw new Error('modular inverse does not exist');
  return Number((t % m + m) % m);
}
const plantedCipher = plantPlain.slice();
const trainingPairs = [];
for (let ci = 0; ci < 9; ci += 1) {
  const chapter = chapters[ci];
  for (let p = chapter.start + phaseVector[ci]; p + 4 <= chapter.end; p += 4) {
    const x = pack4(plantPlain, p);
    const y = (a * x + b) % M;
    if (ci === 0 && trainingPairs.length < 2) trainingPairs.push({ x, y, position: p });
    unpack4(y).forEach((digit, k) => { plantedCipher[p + k] = digit; });
  }
}
assert.equal(trainingPairs.length, 2);
const [t1, t2] = trainingPairs;
const diff = mod(t2.x - t1.x, M);
assert.equal(gcd(diff, M), 1n);
const aFit = mod((t2.y - t1.y) * modInverse(diff, M), M);
const bFit = mod(t1.y - aFit * t1.x, M);
assert.equal(aFit, a);
assert.equal(bFit, b);

const aInverse = modInverse(a, M);
const decodedPlant = plantPlain.slice();
let totalPlantBlocks = 0;
let heldoutChapter3Predictions = 0;
for (let ci = 0; ci < 9; ci += 1) {
  const chapter = chapters[ci];
  for (let p = chapter.start + phaseVector[ci]; p + 4 <= chapter.end; p += 4) {
    const y = pack4(plantedCipher, p);
    const x = mod(aInverse * mod(y - b, M), M);
    unpack4(x).forEach((digit, k) => { decodedPlant[p + k] = digit; });
    totalPlantBlocks += 1;
    if (ci === 2 && (aFit * pack4(plantPlain, p) + bFit) % M === y) heldoutChapter3Predictions += 1;
  }
}
assert.deepEqual(decodedPlant, plantPlain);
assert.equal(totalPlantBlocks, 3233);
assert.equal(heldoutChapter3Predictions, 432);
const plantAll = checkSequences(chapters.map((chapter, ci) => ({
  c: packetize(plantedCipher, chapter, phaseVector[ci]),
  p: packetize(plantPlain, chapter, phaseVector[ci]),
  meta: { chapter: ci, phase: phaseVector[ci] }
})));
assert.equal(plantAll.ok, true);

const output = {
  model: 'one arbitrary bijection on 29^4 four-rune packets, shared across chapters',
  modulus: MODULUS,
  chapterDefinition: {
    logicalPageRanges: chapters.map((c) => c.pages),
    startLogicalPages: CHAPTER_PAGE_BOUNDS.slice(0, -1),
    correspondingOriginalImageNumbers: [17, 20, 25, 32, 40, 44, 50, 57, 71],
    runeLengths: chapters.map((c) => c.length),
    phaseChoices: [0, 1, 2, 3],
    fringePolicy: 'leading phase runes and final incomplete packet copied unchanged'
  },
  originalCollisionStats,
  nativeControls: controlResults,
  crossChapterCertificates: crossChapterCertificates.map((x) => ({
    kind: x.kind,
    chapter: x.chapter,
    phase: x.phase,
    packet: x.packet,
    global: x.global,
    plainValue: x.plain,
    plainRunes: runePacket(x.plain),
    oldCipherValue: x.oldCipher,
    oldCipherRunes: runePacket(x.oldCipher),
    oldAt: x.oldAt,
    newCipherValue: x.newCipher,
    newCipherRunes: runePacket(x.newCipher)
  })),
  positivePlant: {
    map: 'cipherBlock = (37 * plainBlock + 12345) mod 707281',
    inverseA: aInverse,
    phases: phaseVector,
    trainingPairs,
    recoveredMap: { a: aFit, b: bFit },
    totalBlocks: totalPlantBlocks,
    heldoutChapter3Predictions,
    exactFullRecovery: true,
    allNineChapterSharedMapCompatible: true
  },
  decision: 'No shared four-rune bijection maps any pair of source-framed chapters to the tested native GP29 windows under independent chapter phases.'
};
console.log(JSON.stringify(output, null, 2));
