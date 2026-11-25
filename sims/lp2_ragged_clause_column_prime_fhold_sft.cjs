'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const native = read('resources/external/relikd-solved-gp29-native-v1.json');
const transcription = fs.readFileSync('resources/transcriptions/lp2-image-corrected.txt', 'utf8');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const toIndices = s => [...s].filter(x => runeIndex.has(x)).map(x => runeIndex.get(x));
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// The canonical corrected transcription omits runeless physical p50.
const segments = transcription.split(/^\s*%\s*$/m);
assert.equal(segments.length, 57);
const pageText = p => p === 50 ? '' : segments[p < 50 ? p : p - 1];
const p54Text = pageText(54), p55Text = pageText(55);
const red = ink.pages.find(p => p.page === 54).red_spans[0];
const headingEnd = p54Text.indexOf('.');
assert.ok(headingEnd >= 0);
const heading = p54Text.slice(0, headingEnd).replace(/[-\/\r\n\s]/g, '');
assert.equal(heading, red.runes);
assert.equal([...red.runes].length, 9);
const body54 = p54Text.slice(headingEnd + 1);
const clean = s => s.replace(/[\/\r\n\s&$§.]/g, '');
const body54Clean = clean(body54), body55Clean = clean(p55Text);
const page54Groups = body54Clean.split('-');
const page55Groups = body55Clean.split('-');
const carry = {
  left: page54Groups[page54Groups.length - 1],
  right: page55Groups[0],
  merged: page54Groups[page54Groups.length - 1] + page55Groups[0]
};
const groups = page54Groups.slice(0, -1)
  .concat([carry.merged], page55Groups.slice(1))
  .map(w => [...w].map(x => runeIndex.get(x)));
const heights = groups.map(g => g.length);
const maxHeight = Math.max(...heights);
const readRows = columns => {
  const out = [];
  for (let r = 0; r < maxHeight; r++)
    for (let j = 0; j < columns.length; j++)
      if (r < columns[j].length) out.push(columns[j][r]);
  return out;
};
const writeColumns = tape => {
  const out = Array.from({ length: heights.length }, () => []);
  let k = 0;
  for (let r = 0; r < maxHeight; r++)
    for (let j = 0; j < heights.length; j++)
      if (r < heights[j]) out[j][r] = tape[k++];
  return out;
};
const cipher = readRows(groups);
assert.equal(cipher.length, 299);
assert.equal(groups.length, 64);
assert.equal(groups.reduce((s, g) => s + g.length, 0), 299);
assert.deepEqual(writeColumns(cipher), groups);
assert.equal(toIndices(body54).length, 223);
assert.equal(toIndices(p55Text).length, 76);
assert.equal(carry.left, 'ᛏᚪ');
assert.equal(carry.right, 'ᛝ');
assert.equal(carry.merged, 'ᛏᚪᛝ');

// p56's authentic positive prime-minus-one clock, with transparent plaintext F.
const composite = new Uint8Array(50001), K = [];
for (let p = 2; p < composite.length; p++) {
  if (composite[p]) continue;
  K.push((p - 1) % 29);
  for (let q = p * p; q < composite.length; q += p) composite[q] = 1;
}
const encrypt = (plain, origin) => {
  let cursor = origin;
  return plain.map(x => x === 0 ? 0 : (x + K[cursor++]) % 29);
};
const p56plain = toIndices(native.sections.find(s => s.name === 'p56_an_end').source_text);
assert.equal(p56plain.length, 85);
assert.deepEqual(encrypt(p56plain, 0), corpus.pages.find(p => p.page === 56).indices);

function enumerateAll(input, onPath, maxOrigin = 3301) {
  const origins = [];
  let totalPaths = 0;
  for (let origin = 0; origin <= maxOrigin; origin++) {
    let states = new Set([0]);
    for (let i = 0; i < input.length; i++) {
      const next = new Set(), v = input[i];
      for (const h of states) {
        const k = K[origin + i - h];
        if (v === 0) {
          next.add(h + 1);
          if (k !== 0) next.add(h);
        } else if ((v - k + 29) % 29 !== 0) next.add(h);
      }
      states = next;
      if (!states.size) break;
    }
    if (!states.size) continue;
    let pathCount = 0;
    const plain = [], holds = [];
    function walk(i, h) {
      if (i === input.length) {
        pathCount++; totalPaths++; onPath(origin, plain, holds); return;
      }
      const v = input[i], k = K[origin + i - h];
      if (v === 0) {
        plain.push(0); holds.push(i); walk(i + 1, h + 1); holds.pop(); plain.pop();
        if (k !== 0) { plain.push((29 - k) % 29); walk(i + 1, h); plain.pop(); }
      } else {
        const x = (v - k + 29) % 29;
        if (x !== 0) { plain.push(x); walk(i + 1, h); plain.pop(); }
      }
    }
    walk(0, 0);
    origins.push({ origin, pathCount });
  }
  return { origins, totalPaths };
}
function buildModel(sections, alpha = 0.25) {
  const bi = Array.from({ length: 29 }, () => Array(29).fill(0));
  const bc = Array(29).fill(0);
  const tri = Array.from({ length: 29 }, () => Array.from({ length: 29 }, () => Array(29).fill(0)));
  const tc = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (const s of sections) {
    for (let i = 1; i < s.length; i++) { bi[s[i - 1]][s[i]]++; bc[s[i - 1]]++; }
    for (let i = 2; i < s.length; i++) { tri[s[i - 2]][s[i - 1]][s[i]]++; tc[s[i - 2]][s[i - 1]]++; }
  }
  return arr => {
    let b = 0, t = 0;
    for (let i = 1; i < arr.length; i++) {
      const pb = (bi[arr[i - 1]][arr[i]] + alpha) / (bc[arr[i - 1]] + 29 * alpha);
      b += Math.log(pb);
      if (i >= 2) {
        const den = tc[arr[i - 2]][arr[i - 1]];
        t += Math.log(den ? (tri[arr[i - 2]][arr[i - 1]][arr[i]] + alpha) / (den + 29 * alpha) : pb);
      } else t += Math.log(pb);
    }
    return { bigram: b / (arr.length - 1), trigram: t / (arr.length - 1) };
  };
}
const sections = native.sections.map(s => ({ name: s.name, t: toIndices(s.source_text) }));
const fullModel = buildModel(sections.map(s => s.t));
const targetCandidates = [];
const targetSearch = enumerateAll(cipher, (origin, plain, holds) => {
  const prefix = fullModel(plain.slice(0, 223));
  const suffix = fullModel(plain.slice(223));
  const full = fullModel(plain);
  targetCandidates.push({
    origin, holds: [...holds],
    prefixBigram: prefix.bigram, prefixTrigram: prefix.trigram,
    suffixBigram: suffix.bigram, suffixTrigram: suffix.trigram,
    fullBigram: full.bigram, fullTrigram: full.trigram,
    plaintextRunes: plain.map(x => corpus.runes[x]).join(''),
    plaintextTranslit: plain.map(x => corpus.translit[x]).join(' ')
  });
});
targetCandidates.sort((a, b) => b.prefixTrigram - a.prefixTrigram);
const prefixSearch = enumerateAll(cipher.slice(0, 223), () => {});
const controlSpecs = [
  { name: '0_welcome', start: 0, origin: 1021 },
  { name: '0_koan_1', start: 200, origin: 1022 },
  { name: '0_loss_of_divinity', start: 456, origin: 1065 }
];
const controls = [];
for (const spec of controlSpecs) {
  const donor = sections.find(s => s.name === spec.name).t.slice(spec.start, spec.start + 299);
  assert.equal(donor.length, 299);
  const encrypted = encrypt(donor, spec.origin);
  const recovered = readRows(writeColumns(encrypted));
  assert.deepEqual(recovered, encrypted);
  const model = buildModel(sections.filter(s => s.name !== spec.name).map(s => s.t));
  const trueScore = model(donor.slice(0, 223)).trigram;
  let greater = 0, equalBefore = 0, seenTruth = false, trueRank = null, trueFound = false;
  const search = enumerateAll(recovered, (origin, plain) => {
    const score = model(plain.slice(0, 223)).trigram;
    const truth = origin === spec.origin && same(plain, donor);
    if (score > trueScore + 1e-12) greater++;
    if (!seenTruth && !truth && Math.abs(score - trueScore) <= 1e-12) equalBefore++;
    if (truth) { seenTruth = true; trueFound = true; trueRank = 1 + greater + equalBefore; }
  });
  controls.push({
    donor: spec.name, start: spec.start, hiddenOrigin: spec.origin,
    trueHoldPositions: donor.map((x, i) => x === 0 ? i : -1).filter(x => x >= 0),
    survivingOrigins: search.origins.length, totalLegalPaths: search.totalPaths,
    truePathFound: trueFound, truePathPrefixTrigram: trueScore, truePathRank: trueRank
  });
}
const controlWindows = [];
for (const section of sections.filter(s => s.t.length >= 299)) {
  const starts = [0, Math.floor((section.t.length - 299) / 2), section.t.length - 299]
    .filter((v, i, a) => a.indexOf(v) === i);
  const model = buildModel(sections.filter(s => s.name !== section.name).map(s => s.t));
  for (const start of starts) {
    const win = section.t.slice(start, start + 299);
    const a = model(win.slice(0, 223)), b = model(win.slice(223)), f = model(win);
    controlWindows.push({
      section: section.name, start,
      prefixBigram: a.bigram, prefixTrigram: a.trigram,
      suffixBigram: b.bigram, suffixTrigram: b.trigram,
      fullBigram: f.bigram, fullTrigram: f.trigram
    });
  }
}
const range = k => ({
  min: Math.min(...controlWindows.map(x => x[k])),
  max: Math.max(...controlWindows.map(x => x[k]))
});
const result = {
  geometry: {
    p54Runes: 232, p54RedHeadingRunes: red.length, p54BodyRunes: 223,
    p55Runes: 76, totalRunes: cipher.length, groupCount: groups.length,
    groupLengths: heights, maxHeight, carry,
    zeroPositions: cipher.map((x, i) => x === 0 ? i : -1).filter(x => x >= 0)
  },
  p56Calibration: { knownPlaintextRunes: p56plain.length, consumingRunes: p56plain.filter(x => x !== 0).length, exactReplay: true },
  receiver: {
    originRange: [0, 3301], sign: 'positive p56 sign',
    prefixLength: 223, suffixLength: 76,
    prefixSearch: { survivingOrigins: prefixSearch.origins.length, totalLegalPaths: prefixSearch.totalPaths, origins: prefixSearch.origins },
    fullSearch: { survivingOrigins: targetSearch.origins.length, totalLegalPaths: targetSearch.totalPaths, origins: targetSearch.origins }
  },
  targetCandidates, controls,
  controlWindowScoreRanges: {
    prefixBigram: range('prefixBigram'), prefixTrigram: range('prefixTrigram'),
    suffixBigram: range('suffixBigram'), suffixTrigram: range('suffixTrigram'),
    fullBigram: range('fullBigram'), fullTrigram: range('fullTrigram')
  },
  controlWindows,
  reconstructedCiphertextIndices: cipher
};
fs.writeFileSync('im-results/lp2-ragged-clause-column-p54-p55-output.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
