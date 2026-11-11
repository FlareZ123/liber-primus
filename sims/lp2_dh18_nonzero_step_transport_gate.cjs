"use strict";

const fs = require("node:fs");
const assert = require("node:assert/strict");
const read = (p) => fs.readFileSync(p, "utf8");
const mod = (x, n) => ((x % n) + n) % n;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/lp2-transcription.txt");
const translit = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const ciphertext = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(ciphertext.length, 12956);

function parseSection(section) {
  const records = [];
  const wordStarts = new Set();
  let wordOpen = false;
  for (const ch of section) {
    if (runeIndex.has(ch)) {
      if (!wordOpen) wordStarts.add(records.length);
      records.push(runeIndex.get(ch));
      wordOpen = true;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line/page boundaries preserve a word.
    } else {
      wordOpen = false;
    }
  }
  return { records, wordStarts };
}

const sections = transcription.split("%");
const records = [];
const pageOfRune = [];
const wordStarts = new Set();
let wordOpen = false;
for (let runePage = 0; runePage < 55; runePage += 1) {
  const physicalPage = runePage < 50 ? runePage : runePage + 1; // p50 has no rune transcription
  for (const ch of sections[runePage] || "") {
    if (runeIndex.has(ch)) {
      if (!wordOpen) wordStarts.add(records.length);
      records.push(runeIndex.get(ch));
      pageOfRune.push(physicalPage);
      wordOpen = true;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line/page boundaries preserve a word.
    } else {
      wordOpen = false;
    }
  }
}
assert.deepEqual(records, ciphertext);
assert.equal(wordStarts.size, 2896);

const zeroCount = ciphertext.slice(1).filter((x, i) => x === ciphertext[i]).length;
assert.equal(zeroCount, 86);

function bigBase29(xs) {
  return xs.reduce((n, x) => n * 29n + BigInt(x), 0n);
}
function powMod(base, exponent, modulus) {
  let result = 1;
  let b = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e % 2) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}
function multiplicativeOrder(a, p) {
  let x = 1;
  for (let n = 1; n <= p; n += 1) {
    x = (x * a) % p;
    if (x === 1) return n;
  }
  return null;
}
function logTable(root) {
  const out = new Map();
  for (let e = 0; e < 28; e += 1) {
    const value = powMod(root, e, 29);
    assert(!out.has(value), "root does not generate 28 distinct nonzero residues");
    out.set(value, e);
  }
  assert.equal(out.size, 28);
  return out;
}

const signedDh = {
  p: 23,
  g: 5,
  serverSecret: 6,
  clientSecret: 15,
  serverPublic: powMod(5, 6, 23),
  clientPublic: powMod(5, 15, 23),
  shared: powMod(19, 6, 23),
};
assert.deepEqual(signedDh, {
  p: 23, g: 5, serverSecret: 6, clientSecret: 15,
  serverPublic: 8, clientPublic: 19, shared: 2,
});
assert.equal(multiplicativeOrder(2, 29), 28);

// Conditional p0 reuse of the signed 2013 DH worked-example group.
const p0 = corpus.pages.find((p) => p.page === 0);
const p0Ink = ink.pages.find((p) => p.page === 0);
const redSpan = p0Ink.red_spans[0];
const red = p0.indices.slice(redSpan.start, redSpan.start + redSpan.length);
const p0FirstLine = [...(sections[0].split("/")[0] || "")]
  .filter((ch) => runeIndex.has(ch))
  .map((ch) => runeIndex.get(ch));
const firstBlack = p0FirstLine.slice(redSpan.length);
assert.equal(red.length, 13);
assert.equal(p0FirstLine.length, 20);
assert.equal(firstBlack.length, 7);
const N = bigBase29(red);
const M = bigBase29(firstBlack);
assert.equal(N % 23n, 0n);
assert.equal(N % 22n, 7n);
assert.equal(red.at(-1), 5);
assert.equal(M % 23n, 16n);
const p0Dh = {
  N: N.toString(),
  M: M.toString(),
  p: 23,
  g: 5,
  privateExponent: 7,
  publicA: powMod(5, 7, 23),
  publicB: Number(M % 23n),
  shared: powMod(Number(M % 23n), 7, 23),
};
assert.equal(p0Dh.publicA, 17);
assert.equal(p0Dh.shared, 18);
assert.equal(multiplicativeOrder(18, 29), 28);

const redSpans = [];
for (const page of ink.pages) {
  const source = corpus.pages.find((p) => p.page === page.page);
  for (const span of page.red_spans || []) {
    const digits = source.indices.slice(span.start, span.start + span.length);
    const n = bigBase29(digits);
    redSpans.push({
      page: page.page,
      last: digits.at(-1),
      mod23: Number(n % 23n),
      mod22: Number(n % 22n),
    });
  }
}
assert.equal(redSpans.length, 18);
const p0SelectorMatches = redSpans.filter(
  (x) => x.mod23 === 0 && x.mod22 === 7 && x.last === 5,
);
assert.deepEqual(p0SelectorMatches.map((x) => x.page), [0]);

function decodeFixed(cipher, root, zeroIndex, offset = 0) {
  const logs = logTable(root);
  const plain = [cipher[0]];
  for (let i = 1; i < cipher.length; i += 1) {
    const d = mod(cipher[i] - cipher[i - 1], 29);
    if (d === 0) {
      plain.push(zeroIndex);
    } else {
      const rank = mod(logs.get(d) - offset, 28);
      plain.push(zeroIndex === 0 ? rank + 1 : rank);
    }
  }
  return plain;
}
function encodeFixed(plain, root, zeroIndex, offset = 0) {
  const cipher = [plain[0]];
  for (let i = 1; i < plain.length; i += 1) {
    let d = 0;
    if (plain[i] !== zeroIndex) {
      const rank = zeroIndex === 0
        ? mod(plain[i] - 1 + offset, 28)
        : mod(plain[i] + offset, 28);
      d = powMod(root, rank, 29);
    }
    cipher.push(mod(cipher[i - 1] + d, 29));
  }
  return cipher;
}
function decodeCarry(cipher, root, offset = 0) {
  const logs = logTable(root);
  const plain = [cipher[0]];
  for (let i = 1; i < cipher.length; i += 1) {
    const prev = cipher[i - 1];
    const d = mod(cipher[i] - prev, 29);
    plain.push(d === 0 ? prev : mod(prev + logs.get(d) + 1 - offset, 29));
  }
  return plain;
}
function encodeCarry(plain, root, offset = 0) {
  const cipher = [plain[0]];
  for (let i = 1; i < plain.length; i += 1) {
    const prev = cipher[i - 1];
    const d = plain[i] === prev
      ? 0
      : powMod(root, mod(plain[i] - prev - 1 + offset, 28), 29);
    cipher.push(mod(prev + d, 29));
  }
  return cipher;
}
function decodeWordClock(cipher, root, phase, starts) {
  const logs = logTable(root);
  const plain = [cipher[0]];
  let j = 0;
  for (let i = 1; i < cipher.length; i += 1) {
    if (starts.has(i)) j = 0;
    const d = mod(cipher[i] - cipher[i - 1], 29);
    if (d === 0) {
      plain.push(0); // literal F; no key advance is not implied here
    } else {
      const key = mod(powMod(root, j + phase, 29) - 1, 28);
      plain.push(mod(logs.get(d) - key, 28) + 1);
    }
    j = (j + 1) % 28;
  }
  return plain;
}
function encodeWordClock(plain, root, phase, starts) {
  const cipher = [plain[0]];
  let j = 0;
  for (let i = 1; i < plain.length; i += 1) {
    if (starts.has(i)) j = 0;
    const prev = cipher[i - 1];
    let d = 0;
    if (plain[i] !== 0) {
      const key = mod(powMod(root, j + phase, 29) - 1, 28);
      d = powMod(root, mod(plain[i] - 1 + key, 28), 29);
    }
    cipher.push(mod(prev + d, 29));
    j = (j + 1) % 28;
  }
  return cipher;
}

const p57 = corpus.pages.find((p) => p.page === 57).indices;
const p57Parsed = parseSection(sections[56]);
assert.deepEqual(p57Parsed.records, p57);
assert.deepEqual(decodeFixed(encodeFixed(p57, 2, 0), 2, 0), p57);
assert.deepEqual(decodeFixed(encodeFixed(p57, 2, 28), 2, 28), p57);
assert.deepEqual(decodeCarry(encodeCarry(p57, 2), 2), p57);
assert.deepEqual(decodeFixed(encodeFixed(p57, 18, 0, 7), 18, 0, 7), p57);
assert.deepEqual(decodeCarry(encodeCarry(p57, 18, 7), 18, 7), p57);
assert.deepEqual(
  decodeWordClock(
    encodeWordClock(p57, 18, 7, p57Parsed.wordStarts),
    18, 7, p57Parsed.wordStarts,
  ),
  p57,
);

// A full-alphabet synthetic GP plant, including every symbol and zero/carry events.
const plant = Array.from({ length: 4096 }, (_, i) => (17 * i + 11) % 29);
const plantStarts = new Set();
for (let i = 0; i < plant.length; i += 23) plantStarts.add(i);
assert.deepEqual(decodeFixed(encodeFixed(plant, 18, 0, 7), 18, 0, 7), plant);
assert.deepEqual(decodeCarry(encodeCarry(plant, 18, 7), 18, 7), plant);
assert.deepEqual(
  decodeWordClock(
    encodeWordClock(plant, 18, 7, plantStarts),
    18, 7, plantStarts,
  ),
  plant,
);

function encodeWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/gu, "CW")
    .replace(/V/gu, "U")
    .replace(/K/gu, "C")
    .replace(/Z/gu, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    const pairIndex = translit.indexOf(pair);
    if (pairIndex >= 0) {
      out.push(pairIndex);
      i += 2;
    } else {
      const singleIndex = translit.indexOf(s[i]);
      if (singleIndex >= 0) out.push(singleIndex);
      i += 1;
    }
  }
  return out;
}
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const training = (shakespeare.slice(0, 240000).match(/[A-Za-z]+/gu) || [])
  .map(encodeWord).filter((w) => w.length).flat();
const heldout = (shakespeare.slice(240000).match(/[A-Za-z]+/gu) || [])
  .map(encodeWord).filter((w) => w.length).flat();
const alphabetSize = 30;
const smoothing = 0.15;
const contexts = Array.from({ length: alphabetSize }, () => Array(alphabetSize).fill(0));
const trigrams = Array.from({ length: alphabetSize }, () =>
  Array.from({ length: alphabetSize }, () => Array(alphabetSize).fill(0)));
const trainingSequence = [29, 29, ...training];
for (let i = 2; i < trainingSequence.length; i += 1) {
  const a = trainingSequence[i - 2];
  const b = trainingSequence[i - 1];
  const c = trainingSequence[i];
  trigrams[a][b][c] += 1;
  contexts[a][b] += 1;
}
function scoreSequence(sequence) {
  let score = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    const a = sequence[i - 2];
    const b = sequence[i - 1];
    const c = sequence[i];
    score += Math.log(
      (trigrams[a][b][c] + smoothing) /
      (contexts[a][b] + smoothing * alphabetSize),
    );
  }
  return score / Math.max(1, sequence.length - 2);
}
function scorePages(sequence, predicate) {
  let score = 0;
  let count = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    if (!predicate(pageOfRune[i])) continue;
    const a = sequence[i - 2];
    const b = sequence[i - 1];
    const c = sequence[i];
    score += Math.log(
      (trigrams[a][b][c] + smoothing) /
      (contexts[a][b] + smoothing * alphabetSize),
    );
    count += 1;
  }
  return score / Math.max(1, count);
}
function metrics(sequence) {
  const frequencies = Array(29).fill(0);
  for (const x of sequence) frequencies[x] += 1;
  const ioc = frequencies.reduce((sum, n) => sum + n * (n - 1), 0)
    / (sequence.length * (sequence.length - 1));
  return {
    full: scoreSequence(sequence),
    pages0to27: scorePages(sequence, (p) => p < 28),
    pages28to55: scorePages(sequence, (p) => p >= 28),
    ioc,
    frequencies,
    prefix: sequence.slice(0, 180).map((x) => translit[x]).join(""),
  };
}

const root2 = decodeFixed(ciphertext, 2, 0);
const root2EA = decodeFixed(ciphertext, 2, 28);
const root2Carry = decodeCarry(ciphertext, 2);
const root18 = decodeFixed(ciphertext, 18, 0);
const root18Phase7 = decodeFixed(ciphertext, 18, 0, 7);
const root18WordPhase7 = decodeWordClock(ciphertext, 18, 7, wordStarts);
const root18Carry = decodeCarry(ciphertext, 18);
const root18CarryPhase7 = decodeCarry(ciphertext, 18, 7);

const output = {
  input: {
    runeCount: ciphertext.length,
    wordStarts: wordStarts.size,
    adjacentEqualities: zeroCount,
    nonzeroDifferences: ciphertext.length - 1 - zeroCount,
  },
  historicalDH: signedDh,
  conditionalP0DH: {
    ...p0Dh,
    allOriginalRedSpans: redSpans.length,
    uniqueSelectorMatches: p0SelectorMatches.length,
    rootOrderMod29: multiplicativeOrder(18, 29),
  },
  positiveControls: {
    solvedP57Runes: p57.length,
    p57RoundTrips: true,
    plantedFullAlphabetGP: plant.length,
    plantedRoundTrips: true,
  },
  languageModel: {
    trainingRunes: training.length,
    heldoutShakespeareRunes: heldout.length,
    heldoutShakespeareScore: scoreSequence([29, 29, ...heldout]),
  },
  scores: {
    raw: metrics(ciphertext),
    signedDH2_fixedF: metrics(root2),
    signedDH2_fixedEA: metrics(root2EA),
    signedDH2_dynamicCarry: metrics(root2Carry),
    p0DH18_fixedF: metrics(root18),
    p0DH18_phase7: metrics(root18Phase7),
    p0DH18_wordClockPhase7: metrics(root18WordPhase7),
    p0DH18_dynamicCarry: metrics(root18Carry),
    p0DH18_dynamicCarryPhase7: metrics(root18CarryPhase7),
  },
  underdetermination: {
    nonzeroStepPermutations: "28! = 304888344611713860501504000000",
    bitsBeforeZeroEscapeAndState: Math.log2(28 * 1), // replaced below
  },
};
output.underdetermination.bitsBeforeZeroEscapeAndState = 97.94419575123733;
console.log(JSON.stringify(output, null, 2));
