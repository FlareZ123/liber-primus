'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (p) => fs.readFileSync(p, 'utf8');
const tape = JSON.parse(read('im-results/lp2-word-circumference-tapes.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const alphabet = corpus.runes;
const MOD = alphabet.length;

assert.equal(MOD, 29);
assert.equal(tape.originalWords, 2896);
assert.equal(tape.originalRunes, 12956);
assert.equal(tape.shells.length, tape.originalWords);
assert.equal(tape.interiors.length, tape.originalWords);

const mod = (x) => ((x % MOD) + MOD) % MOD;
const indices = (s) => Array.from(s, (ch) => {
  const v = alphabet.indexOf(ch);
  assert.notEqual(v, -1, 'unexpected non-GP29 rune in tape');
  return v;
});
const translit = (xs) => xs.map((x) => corpus.translit[x]).join('');
const rune = (x) => alphabet[x];

function ioc(words) {
  const f = Array(MOD).fill(0);
  let n = 0;
  for (const w of words) for (const x of w) { f[x]++; n++; }
  return {
    n,
    ioc: f.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1)),
    maxFrequency: Math.max(...f),
  };
}

// The first two words are the red p0 rubric, not body ciphertext.
// Every nonempty body interior has the two-rune shell [left,right].
const body = [];
for (let wordIndex = 2; wordIndex < tape.originalWords; wordIndex++) {
  const shell = indices(tape.shells[wordIndex]);
  const cipher = indices(tape.interiors[wordIndex]);
  if (!cipher.length) continue;
  assert.equal(shell.length, 2, 'nonempty interior without two-rune shell at ' + wordIndex);
  body.push({ wordIndex, shell, cipher });
}
const interiorRunes = body.reduce((s, w) => s + w.cipher.length, 0);
assert.equal(body.length, 2363);
assert.equal(interiorRunes, 7238);

// Frozen candidate: use each word's left then right shell rune as a
// two-symbol repeating additive GP29 key, reset at the start of each word.
// Historical LP1 inverse convention: P = C - K (mod 29), ordinary consumption.
const noHold = body.map(({ shell, cipher }) =>
  cipher.map((c, j) => mod(c - shell[j % 2]))
);
const noHoldIoC = ioc(noHold);

// More faithful LP1 variant: plaintext F (index 0) is transparent and does
// not consume the key. A ciphertext zero can be either transparent F or an
// encrypted non-F, so this routine performs exact phase reachability.
function fHoldReachability(cipher, key) {
  let phases = new Set([0]);
  for (let position = 0; position < cipher.length; position++) {
    const c = cipher[position];
    const next = new Set();
    for (const phase of phases) {
      if (c === 0) next.add(phase); // transparent plaintext F
      const p = mod(c - key[phase]);
      if (p !== 0) next.add(1 - phase); // encrypted non-F consumes one key symbol
    }
    if (next.size === 0) {
      return {
        ok: false,
        position,
        cipher: c,
        phasesBefore: [...phases].sort(),
        keyValue: key[[...phases][0]],
      };
    }
    phases = next;
  }
  return { ok: true, finalPhases: [...phases].sort() };
}

const failures = [];
let ambiguousFinalPhaseWords = 0;
for (const w of body) {
  const r = fHoldReachability(w.cipher, w.shell);
  if (!r.ok) failures.push({ wordIndex: w.wordIndex, shell: tape.shells[w.wordIndex],
    interior: tape.interiors[w.wordIndex], ...r });
  else if (r.finalPhases.length > 1) ambiguousFinalPhaseWords++;
}
assert.equal(failures.length, 137);
const firstFailure = failures[0];
assert.equal(firstFailure.wordIndex, 59);
assert.equal(firstFailure.position, 4);
assert.equal(firstFailure.shell, 'ᛋᛡ');
assert.equal(firstFailure.interior, 'ᛟᚱᚢᚹᛋᛚ');
assert.equal(firstFailure.cipher, 15);
assert.equal(firstFailure.keyValue, 15);
assert.deepEqual(firstFailure.phasesBefore, [0]);

// Positive control: build a native-GP plant from original clear LP1 pages
// p3,p8,p9,p10,p11,p14 plus the clear LP2 PARABLE (p57). Preserve the exact
// target interior lengths and use the target's actual shell pairs as keys.
// The true F-hold plaintext path must remain reachable for every planted word.
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%').slice(1);
const clearPageIndices = [2, 7, 8, 9, 10, 13]; // one-based physical LP1 pages 3,8,9,10,11,14
const clearPageCounts = clearPageIndices.map((i) =>
  Array.from(lp1[i]).filter((ch) => alphabet.includes(ch)).length
);
assert.deepEqual(clearPageCounts, [157, 187, 207, 192, 169, 89]);
const master = read('resources/transcriptions/liber_primus_master.txt').split('%').slice(1);
const parable = Array.from(master[72]).filter((ch) => alphabet.includes(ch)).map((ch) => alphabet.indexOf(ch));
assert.equal(parable.length, 95);
const nativeSymbols = clearPageIndices.flatMap((i) =>
  Array.from(lp1[i]).filter((ch) => alphabet.includes(ch)).map((ch) => alphabet.indexOf(ch))
).concat(parable);
assert.equal(nativeSymbols.length, 1096);

function encodeFHold(plain, key) {
  let phase = 0;
  const out = [];
  for (const p of plain) {
    if (p === 0) { out.push(0); continue; }
    out.push(mod(p + key[phase]));
    phase = 1 - phase;
  }
  return out;
}
function assertTruePathReachable(cipher, plain, key) {
  let phases = new Set([0]);
  let truePhase = 0;
  for (let position = 0; position < cipher.length; position++) {
    const c = cipher[position];
    const p = plain[position];
    const next = new Set();
    for (const phase of phases) {
      if (c === 0) next.add(phase);
      const candidate = mod(c - key[phase]);
      if (candidate !== 0) next.add(1 - phase);
    }
    if (p === 0) {
      assert.equal(c, 0);
    } else {
      assert.equal(c, mod(p + key[truePhase]));
      truePhase = 1 - truePhase;
    }
    assert.ok(next.has(truePhase), 'planted true path lost at position ' + position);
    phases = next;
  }
}
let cursor = 0;
let plantedRunes = 0;
for (const w of body) {
  const plain = Array.from({ length: w.cipher.length }, () => {
    const x = nativeSymbols[cursor % nativeSymbols.length];
    cursor++;
    return x;
  });
  const plantedCipher = encodeFHold(plain, w.shell);
  assert.equal(plantedCipher.length, plain.length);
  assertTruePathReachable(plantedCipher, plain, w.shell);
  plantedRunes += plain.length;
}
assert.equal(plantedRunes, 7238);

const result = {
  status: 'PASS',
  hypothesis: 'per-word shell [left,right] as repeating two-symbol GP29 additive key; reset each word',
  target: { bodyWordsWithInterior: body.length, interiorRunes, redRubricWordsExcluded: 2 },
  noHold: {
    convention: 'P=C-K mod29; key advances every interior rune',
    ioc: noHoldIoC.ioc,
    uniformBaseline: 1 / MOD,
    firstDecodedInteriors: body.slice(0, 16).map((w, i) => ({
      wordIndex: w.wordIndex,
      shell: tape.shells[w.wordIndex],
      cipher: tape.interiors[w.wordIndex],
      decoded: translit(noHold[i]),
    })),
  },
  transparentF: {
    convention: 'P=F emits ciphertext F and does not advance; non-F uses P=C-K mod29 and advances',
    failedWords: failures.length,
    totalInteriorWords: body.length,
    ambiguousFinalPhaseWords,
    firstContradiction: {
      wordIndex: firstFailure.wordIndex,
      shell: firstFailure.shell,
      interior: firstFailure.interior,
      position: firstFailure.position,
      cipherRune: rune(firstFailure.cipher),
      keyRune: rune(firstFailure.keyValue),
      phaseBefore: firstFailure.phasesBefore,
      reason: 'C equals the active key rune, so P=C-K would be F; transparent F must emit C=F, not this non-F ciphertext rune',
    },
  },
  nativePositiveControl: {
    clearLP1Pages: [3, 8, 9, 10, 11, 14],
    clearLP1RuneCounts: clearPageCounts,
    clearLP1Runes: clearPageCounts.reduce((a, b) => a + b, 0),
    clearPARABLERunes: parable.length,
    plantedWords: body.length,
    plantedRunes,
    trueFHoldPathsRemainReachable: true,
  },
};
console.log(JSON.stringify(result, null, 2));
