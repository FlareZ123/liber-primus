'use strict';

/**
 * Source-constrained p50 horizontal-reflection receiver gate.
 * Tests:
 *  1. reflected 30x6 interior -> arbitrary stationary token-to-GP29 map;
 *  2. reflected outer76 -> p32 compass walk from HOMEX -> p55 using the
 *     authentic p56 transparent-F inverse.
 * Reflection is c -> 7-c. No start, radix, compass permutation, phase, or
 * target-dependent fitting is searched.
 * Run: node sims/lp2_p50_reflection_receiver_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const readText = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const readJSON = file => JSON.parse(readText(file));
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const table = readJSON('resources/liber-primus/lp2-grid-256.json');
const reference = readText('resources/liber-primus/lp1-plaintext-reference.txt');
const GP = corpus.translit;
const MOD = 29;
const mod = (x, m = MOD) => ((x % m) + m) % m;

assert.equal(GP.length, 29);
assert.deepEqual(table.pages.map(p => p.page), [49, 50, 51]);
assert.deepEqual(table.pages.map(p => p.rows), [10, 13, 9]);
assert.equal(table.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(table.tokens.length, 256);
assert.equal(table.bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(table.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

const page = n => corpus.pages.find(p => p.page === n).indices;
const p32 = page(32);
const p55 = page(55);
const p56Cipher = page(56);
const p57 = page(57);
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(p56Cipher.length, 85);
assert.equal(p57.length, 95);
assert.equal(p32.slice(33, 38).map(i => GP[i]).join(''), 'HOMEX');
assert.equal(p56Cipher[56], 0);

const alphabet = GP.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function gpWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const match = alphabet.find(x => s.startsWith(x.s, i));
    if (!match) return null;
    out.push(match.i);
    i += match.s.length;
  }
  return out;
}
function gpText(text) {
  return text.trim().split(/\s+/).flatMap(word => {
    const encoded = gpWord(word);
    assert.ok(encoded, 'Unencodable GP word: ' + word);
    return encoded;
  });
}
function primeTotientShifts(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes.map(p => (p - 1) % MOD);
}

// Exact solved-p56 control: one plaintext F at local offset56 is transparent.
const shifts = primeTotientShifts(100);
let p56Clock = 0;
const p56Plain = p56Cipher.map((c, i) => {
  if (i === 56) return 0;
  const p = mod(c - shifts[p56Clock]);
  p56Clock += 1;
  return p;
});
const p56Known = gpText(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT ' +
  'IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE'
);
assert.equal(p56Clock, 84);
assert.equal(p56Plain.length, 85);
assert.deepEqual(p56Plain, p56Known);
assert.equal(p57.slice(0, 7).map(i => GP[i]).join(''), 'PARABLE');
const known180 = [...p56Plain, ...p57];
assert.equal(known180.length, 180);

// The twin-tree artwork selects horizontal reflection; p57 selects the peel.
function reflectRows(values) {
  return Array.from({ length: 32 }, (_, r) =>
    values.slice(r * 8, r * 8 + 8).reverse()
  ).flat();
}
const reflectedTokens = reflectRows(table.tokens);
const reflectedBytes = reflectRows(table.bytes);
const innerTokens = [];
const unreflectedInnerTokens = [];
for (let r = 1; r < 31; r += 1) {
  for (let c = 1; c < 7; c += 1) {
    innerTokens.push(reflectedTokens[r * 8 + c]);
    unreflectedInnerTokens.push(table.tokens[r * 8 + c]);
  }
}
assert.equal(innerTokens.length, 180);

function codebookBound(tokens, plaintext) {
  assert.equal(tokens.length, plaintext.length);
  const classes = new Map();
  tokens.forEach((token, i) => {
    if (!classes.has(token)) classes.set(token, Array(MOD).fill(0));
    classes.get(token)[plaintext[i]] += 1;
  });
  let matches = 0;
  let conflicts = 0;
  let conflictingClasses = 0;
  let maxClassConflict = 0;
  for (const counts of classes.values()) {
    const classSize = counts.reduce((a, b) => a + b, 0);
    const best = Math.max(...counts);
    const loss = classSize - best;
    matches += best;
    conflicts += loss;
    if (counts.filter(x => x > 0).length > 1) conflictingClasses += 1;
    maxClassConflict = Math.max(maxClassConflict, loss);
  }
  return {
    uniqueTokens: classes.size,
    maximumMatches: matches,
    unavoidableConflicts: conflicts,
    conflictingClasses,
    maxConflictWithinOneClass: maxClassConflict
  };
}
const reflectedCodebook = codebookBound(innerTokens, known180);
const unreflectedCodebook = codebookBound(unreflectedInnerTokens, known180);
assert.deepEqual(reflectedCodebook, {
  uniqueTokens: 127,
  maximumMatches: 134,
  unavoidableConflicts: 46,
  conflictingClasses: 37,
  maxConflictWithinOneClass: 2
});
assert.equal(unreflectedCodebook.maximumMatches, 133);
assert.equal(unreflectedCodebook.unavoidableConflicts, 47);

// Positive: a genuine stationary token map reaches the full 180/180.
const plantedMap = new Map();
for (const token of innerTokens) {
  const value = [...token].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % MOD;
  plantedMap.set(token, value);
}
const plantedKnown = innerTokens.map(token => plantedMap.get(token));
assert.equal(codebookBound(innerTokens, plantedKnown).maximumMatches, 180);
assert.equal(codebookBound(innerTokens, plantedKnown).unavoidableConflicts, 0);

function perimeterAddresses() {
  const out = [];
  for (let c = 0; c < 8; c += 1) out.push(c);
  for (let r = 1; r < 32; r += 1) out.push(8 * r + 7);
  for (let c = 6; c >= 0; c -= 1) out.push(31 * 8 + c);
  for (let r = 30; r >= 1; r -= 1) out.push(8 * r);
  assert.equal(out.length, 76);
  assert.equal(new Set(out).size, 76);
  return out;
}
const ringAddresses = perimeterAddresses();
const innerSet = new Set(innerTokens);
const ringTokens = ringAddresses.map(i => reflectedTokens[i]);
const unseenRingTokens = [...new Set(ringTokens.filter(t => !innerSet.has(t)))];
assert.equal(ringTokens.length, 76);
assert.equal(new Set(ringTokens).size, 68);
assert.equal(unseenRingTokens.length, 34);

// Conditional receiver: reflected outer76 bytes are compass instructions.
const compass = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];
function compassWalk(bytes) {
  let row = 3;
  let col = 0;
  const visited = [];
  for (const b of bytes) {
    assert.ok(Number.isInteger(b) && b >= 0 && b <= 255);
    const [dr, dc] = compass[b & 7];
    const distance = b >> 3;
    row = mod(row + dr * distance, 11);
    col = mod(col + dc * distance, 11);
    visited.push(row * 11 + col);
  }
  return { visited, row, col };
}
const reflectedRingBytes = ringAddresses.map(i => reflectedBytes[i]);
const reflectedWalk = compassWalk(reflectedRingBytes);
const reflectedKey = reflectedWalk.visited.map(i => p32[i]);
assert.equal(reflectedKey.length, 76);
assert.equal(reflectedWalk.visited.at(-1), 61);
assert.equal(reflectedWalk.row, 5);
assert.equal(reflectedWalk.col, 6);
assert.equal(GP[p32[61]], 'X');
assert.equal(new Set(reflectedWalk.visited).size, 50);

const originalRingBytes = ringAddresses.map(i => table.bytes[i]);
const originalWalk = compassWalk(originalRingBytes);
const originalKey = originalWalk.visited.map(i => p32[i]);

function transparentFPaths(cipher, key) {
  const fPositions = cipher.flatMap((c, i) => c === 0 ? [i] : []);
  assert.ok(fPositions.length <= 12);
  const paths = [];
  for (let mask = 0; mask < (1 << fPositions.length); mask += 1) {
    let clock = 0;
    let valid = true;
    const plaintext = [];
    const skipped = [];
    for (let i = 0; i < cipher.length; i += 1) {
      const c = cipher[i];
      const zeroOrdinal = fPositions.indexOf(i);
      if (c === 0 && zeroOrdinal >= 0 && ((mask >>> zeroOrdinal) & 1)) {
        plaintext.push(0);
        skipped.push(i);
      } else {
        if (clock >= key.length) { valid = false; break; }
        const p = mod(c - key[clock]);
        if (p === 0) { valid = false; break; }
        plaintext.push(p);
        clock += 1;
      }
    }
    if (valid) paths.push({ mask, plaintext, skipped, consumed: clock });
  }
  return paths;
}
const reflectedPaths = transparentFPaths(p55, reflectedKey);
const originalPaths = transparentFPaths(p55, originalKey);
assert.deepEqual(p55.flatMap((c, i) => c === 0 ? [i] : []), [15, 25, 41]);
assert.equal(originalPaths.length, 0);
assert.equal(reflectedPaths.length, 1);
assert.equal(reflectedPaths[0].mask, 7);
assert.deepEqual(reflectedPaths[0].skipped, [15, 25, 41]);
assert.equal(reflectedPaths[0].consumed, 73);
const candidate = reflectedPaths[0].plaintext;
const candidateText = candidate.map(i => GP[i]).join('');
assert.equal(candidate.length, 76);
assert.equal(
  candidateText,
  'PITGXMINGYLXEAWTXFAYNHGRJIANGFHEORCLINGCPOAHMUNGFGLHUSIALSGCLRAGBRIOEOEAEROMOACMODAEEAGJO'
);

// Positive: encrypt and recover a solved-p57 source-native 76-rune plant.
function encryptNative(plaintext, key) {
  let clock = 0;
  const cipher = plaintext.map(p => {
    if (p === 0) return 0;
    assert.ok(clock < key.length);
    const c = mod(p + key[clock]);
    clock += 1;
    return c;
  });
  return { cipher, consumed: clock };
}
const plantPlaintext = p57.slice(0, 76);
const plant = encryptNative(plantPlaintext, reflectedKey);
const recoveredPlant = transparentFPaths(plant.cipher, reflectedKey);
assert.ok(recoveredPlant.some(p =>
  p.plaintext.join(',') === plantPlaintext.join(',') &&
  p.consumed === plant.consumed
));

// Compare the candidate with known plaintext windows using a fixed GP29
// trigram model. Paragraph boundaries are retained; smoothing is 0.1.
const paragraphs = reference.split(/\n\s*\n/)
  .map(p => p.split('\n')
    .filter(line => !line.trim().startsWith('#') &&
                    !line.trim().startsWith('['))
    .join(' '))
  .filter(p => p.trim().length > 0);
const trainingSequences = [];
let skippedWords = 0;
for (const paragraph of paragraphs) {
  const sequence = [];
  for (const word of paragraph.match(/[A-Za-z]+/g) || []) {
    const encoded = gpWord(word);
    if (encoded) sequence.push(...encoded);
    else skippedWords += 1;
  }
  if (sequence.length >= 3) trainingSequences.push(sequence);
}
assert.equal(skippedWords, 0);
const trainingSymbols = trainingSequences.reduce((n, s) => n + s.length, 0);
const trainingTrigrams = trainingSequences.reduce((n, s) => n + s.length - 2, 0);
const trigramCounts = new Map();
for (const sequence of trainingSequences) {
  for (let i = 2; i < sequence.length; i += 1) {
    const k = sequence.slice(i - 2, i + 1).join(',');
    trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  }
}
const smoothing = 0.1;
const trigramDenominator = trainingTrigrams + smoothing * MOD ** 3;
function trigramScore(sequence) {
  let score = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    const k = sequence.slice(i - 2, i + 1).join(',');
    score += Math.log(
      ((trigramCounts.get(k) || 0) + smoothing) / trigramDenominator
    );
  }
  return score / (sequence.length - 2);
}
const nativeWindowScores = [];
for (const sequence of trainingSequences) {
  for (let i = 0; i + 76 <= sequence.length; i += 1) {
    nativeWindowScores.push(trigramScore(sequence.slice(i, i + 76)));
  }
}
nativeWindowScores.sort((a, b) => a - b);
const candidateScore = trigramScore(candidate);
const rawCipherScore = trigramScore(p55);
assert.equal(trainingSymbols, 3246);
assert.equal(trainingTrigrams, 3178);
assert.equal(nativeWindowScores.length, 1752);
assert.ok(candidateScore < nativeWindowScores[0]);
assert.ok(candidateScore < rawCipherScore);

function ioc(indices) {
  const counts = Array(MOD).fill(0);
  for (const value of indices) counts[value] += 1;
  return counts.reduce((n, x) => n + x * (x - 1), 0) /
    (indices.length * (indices.length - 1));
}
const candidateIoC = ioc(candidate);
const originalP55IoC = ioc(p55);
assert.ok(Math.abs(candidateIoC - 0.034035087719298245) < 1e-14);
assert.ok(Math.abs(originalP55IoC - 0.03789473684210526) < 1e-14);

console.log(JSON.stringify({
  source: {
    numericPages: [49, 50, 51],
    tableShape: '32x8',
    tableBytesSha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
    p56KnownPlaintext: 85,
    p57ClearPlaintext: 95,
    knownInterior: 180,
    p55Ciphertext: 76
  },
  reflection: 'horizontal c -> 7-c',
  reflectedInner180: {
    uniqueTokens: reflectedCodebook.uniqueTokens,
    maximumStationaryTokenToGPMatches: reflectedCodebook.maximumMatches,
    unavoidableConflicts: reflectedCodebook.unavoidableConflicts,
    conflictingTokenClasses: reflectedCodebook.conflictingClasses,
    unreflectedMaximumMatches: unreflectedCodebook.maximumMatches,
    unseenDistinctOuterTokens: unseenRingTokens.length,
    positivePlantMatches: 180
  },
  reflectedOuter76Compass: {
    keyLength: reflectedKey.length,
    endpointCell: reflectedWalk.visited.at(-1),
    endpointRune: GP[p32[reflectedWalk.visited.at(-1)]],
    uniqueVisitedP32Cells: new Set(reflectedWalk.visited).size,
    p55CipherFOffsets: [15, 25, 41],
    legalTransparentFPaths: reflectedPaths.length,
    uniqueSkipOffsets: reflectedPaths[0].skipped,
    consumedKeySymbols: reflectedPaths[0].consumed,
    plaintext: candidateText,
    plaintextIoC: candidateIoC,
    originalP55IoC,
    trigramScore: candidateScore,
    rawCipherTrigramScore: rawCipherScore,
    nativePlaintextWindows: nativeWindowScores.length,
    worstNativeWindowScore: nativeWindowScores[0],
    candidateBelowAllNativeWindows: true,
    plantedSolvedP57Recovered: true
  },
  decision: 'Both frozen reflected receivers fail to recover unknown plaintext; no key or destination established.'
}, null, 2));
