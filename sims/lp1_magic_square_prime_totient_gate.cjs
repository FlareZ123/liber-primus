"use strict";
/**
 * Source-locked LP1 p05/p16 paired-square and Stage10 handoff transfer tests.
 *
 * This remains a bounded negative, not an LP2 decipherment. It verifies both
 * original LP1 source images and the paired 1033/3301 squares, then tests:
 *   - the existing 48 direct 25-cell additive transfers;
 *   - p16's Stage10-returned circumference/inside cues as 3x3 Hill,
 *     9-symbol interior-pad, and 8-symbol perimeter-pad candidates;
 *   - p16-centre p140 and LP2-p15-spiral p145 starts under the solved-p56
 *     phi(prime) inverse, targeted to pages 15/16 with exhaustive literal-F
 *     masks and crossed-start controls;
 *   - the existing manuscript-wide p174/p464/p493 prime-ordinal sweeps.
 *
 * The explicit prime/totient/encryption instruction is on LP1 p05. LP1 p16
 * supplies the 3301 square. The exact 2014 Stage10 response returns LP1 pages
 * 14-16; p14/p15's circumference/inside wording motivates the new extraction
 * tests but does not itself establish an authorial cipher instruction.
 *
 * Run from repository root:
 *   node sims/lp1_magic_square_prime_totient_gate.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { primeTotients, trainNativeGP, exhaustLiteralF, languageScore } =
  require("./historical_solve_path_transfer.cjs");
const { plaintextWords } = require("./authentic_decryption_regression.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const lp1English = read("resources/liber-primus/lp1-plaintext-reference.txt");
const stage10Handoff = read("im-results/2014-stage10-three-images-lp1-source-handoff.md");
const p15SpiralSource = read("results/lp2-p15-fibonacci-prime-spiral.md");
const emerson = read("resources/control/emerson_essays_2944.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const shaSums = read("resources/liber-primus/SHA256SUMS.txt");

const expectedImageSha = {
  "05.jpg": "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
  "16.jpg": "984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe"
};
for (const [name, expected] of Object.entries(expectedImageSha)) {
  const bytes = fs.readFileSync(path.join(ROOT, "resources/liber-primus", name));
  const actual = crypto.createHash("sha256").update(bytes).digest("hex");
  const manifest = shaSums.match(new RegExp("^([a-f0-9]{64})\\\\s+" + name.replace(".", "\\\\.") + "$", "m"));
  assert.equal(actual, expected, name + " original image hash");
  assert.ok(manifest, name + " checksum manifest entry");
  assert.equal(manifest[1], actual, name + " checksum manifest agreement");
}

assert.ok(lp1.includes("ᚦᛖ-ᛈᚱᛁᛗᛖᛋ-ᚪᚱᛖ-ᛋᚪᚳ/"));
assert.ok(lp1.includes("ᚱᛖᛞ.ᚦᛖ-ᛏᚩᛏᛁᛖᚾᛏ-ᚠᚢᚾᚳᛏᛡᚾ-ᛁᛋ-ᛋᚪ/"));
assert.ok(stage10Handoff.includes("final three physical pages (14, 15, 16)"));
assert.ok(stage10Handoff.includes("byte-identical"));
assert.ok(lp1English.includes("THE I IS THE VOICE OF THE CIRCUMFERENCE"));
assert.ok(lp1English.includes("DISCOVER TRUTH INSIDE YOURSELF"));
assert.ok(p15SpiralSource.includes("| 11 | 144 | 145 | 829 | 2472 |"));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpPrime = corpus.prime;
const lines = lp1.split(/\\r?\\n/);
function findFiveRows(prefix) {
  const start = lines.findIndex((line) => line.startsWith(prefix));
  assert.ok(start >= 0, "missing transcription row " + prefix);
  const rows = lines.slice(start, start + 5);
  assert.equal(rows.length, 5);
  assert.ok(rows.every((line) => line.endsWith("/")), "five contiguous source rows");
  return rows;
}
function rowTokens(line) {
  return line.replace(/\\/$/, "").split("-");
}
function tokenValue(token) {
  if (/^\\d+$/.test(token)) return Number(token);
  const indices = [...token].map((r) => {
    assert.ok(runeIndex.has(r), "unmapped source rune " + r);
    return runeIndex.get(r);
  });
  assert.ok(indices.length > 0, "empty word token");
  return indices.reduce((sum, i) => sum + gpPrime[i], 0);
}
const p05Rows = findFiveRows("272-138-");
const p16Rows = findFiveRows("434-1311-");
const A = p05Rows.map((line) => rowTokens(line).map(tokenValue));
const B = p16Rows.map((line) => rowTokens(line).map((token) => {
  assert.match(token, /^\\d+$/, "p16 square must be numeric");
  return Number(token);
}));
for (const M of [A, B]) {
  assert.equal(M.length, 5);
  assert.ok(M.every((r) => r.length === 5));
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++)
    assert.equal(M[i][j], M[4 - i][4 - j], "180-degree source symmetry");
}
function rowSums(M) { return M.map((r) => r.reduce((a, b) => a + b, 0)); }
function colSums(M) { return Array.from({ length: 5 }, (_, j) => M.reduce((s, r) => s + r[j], 0)); }
function diagSums(M) {
  return [
    M.reduce((s, r, i) => s + r[i], 0),
    M.reduce((s, r, i) => s + r[4 - i], 0)
  ];
}
const AStats = { rows: rowSums(A), columns: colSums(A), diagonals: diagSums(A) };
const BStats = { rows: rowSums(B), columns: colSums(B), diagonals: diagSums(B) };
assert.deepEqual(AStats.rows, [1033, 1033, 1033, 1033, 1033]);
assert.deepEqual(AStats.columns, [1033, 1033, 1033, 1033, 1033]);
assert.deepEqual(AStats.diagonals, [1033, 1033]);
assert.deepEqual(BStats.rows, [3301, 3301, 3301, 3301, 3301]);
assert.deepEqual(BStats.columns, [3301, 3301, 3301, 3301, 3301]);
assert.deepEqual(BStats.diagonals, [3301, 3301]);

function phi(n) {
  let x = n;
  let result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(n);
  }
  return out;
}
const maxCell = Math.max(...A.flat(), ...B.flat());
const primeList = firstPrimes(maxCell);
const primeOrdinal = (value) => primeList.indexOf(value) + 1;
const magicPrimeOrdinals = {
  p05: { constant: 1033, primeOrdinal: primeOrdinal(1033) },
  p16: { constant: 3301, primeOrdinal: primeOrdinal(3301) },
  ordinalGap: primeOrdinal(3301) - primeOrdinal(1033),
  interveningLP1Images: 16 - 5 - 1
};
assert.deepEqual(magicPrimeOrdinals.p05, { constant: 1033, primeOrdinal: 174 });
assert.deepEqual(magicPrimeOrdinals.p16, { constant: 3301, primeOrdinal: 464 });
assert.equal(magicPrimeOrdinals.ordinalGap, 290);
assert.equal(magicPrimeOrdinals.ordinalGap, 29 * magicPrimeOrdinals.interveningLP1Images);
const stage10CrossReleaseOrdinals = {
  stage10LP1Pages: [14, 15, 16],
  p16SquareCentre: B[2][2],
  p16CentrePrimeOrdinal: primeOrdinal(B[2][2]),
  p15SpiralPrimeOrdinals: [1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988],
  p15IncludesPrimeOrdinal145: true,
  p15Prime145: primeOrdinal(829),
  difference: primeOrdinal(829) - primeOrdinal(B[2][2])
};
assert.equal(stage10CrossReleaseOrdinals.p16SquareCentre, 809);
assert.equal(stage10CrossReleaseOrdinals.p16CentrePrimeOrdinal, 140);
assert.ok(stage10CrossReleaseOrdinals.p15SpiralPrimeOrdinals.includes(145));
assert.equal(stage10CrossReleaseOrdinals.p15Prime145, 145);
assert.equal(stage10CrossReleaseOrdinals.difference, 5);
assert.equal(A[1][0], 366, "source rune ᛠ is GP EA (prime 109), not IA (prime 107)");
assert.equal(A[3][4], 366);
function colMajor(M) {
  return Array.from({ length: 5 }, (_, j) =>
    Array.from({ length: 5 }, (_, i) => M[i][j])).flat();
}
function deriveKey(M, transform) {
  return M.flat().map((n) => {
    if (transform === "raw") return n % 29;
    if (transform === "phi") return phi(n) % 29;
    if (transform === "prime-index-totient") return (primeList[n - 1] - 1) % 29;
    throw new Error("unknown transform " + transform);
  });
}
const pages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(pages.length, 56);
const original = pages.flatMap((p) => p.indices);

const GP_MAP = new Map(corpus.translit.map((label, i) => [label, i]));
GP_MAP.set("ING", 21);
function englishToGP(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const token of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < token.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const part = token.slice(i, i + n);
        if (GP_MAP.has(part)) {
          out.push(GP_MAP.get(part));
          i += n;
          found = true;
          break;
        }
      }
      assert.ok(found, "unmapped GP plaintext at " + token.slice(i));
    }
  }
  return out;
}
const train = englishToGP(emerson);
const trigrams = new Map();
let trigramCount = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigrams.set(k, (trigrams.get(k) || 0) + 1);
  trigramCount++;
}
function metrics(indices) {
  const freq = Array(29).fill(0);
  for (const x of indices) freq[x]++;
  const ioc = freq.reduce((s, n) => s + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
  const top12 = freq.slice().sort((a, b) => b - a).slice(0, 12)
    .reduce((s, n) => s + n, 0) / indices.length;
  const alpha = 0.05;
  const denominator = trigramCount + alpha * 29 ** 3;
  let logScore = 0;
  for (let i = 0; i + 2 < indices.length; i++) {
    const k = indices[i] * 841 + indices[i + 1] * 29 + indices[i + 2];
    logScore += Math.log(((trigrams.get(k) || 0) + alpha) / denominator);
  }
  let adjacentEquals = 0;
  for (let i = 1; i < indices.length; i++)
    if (indices[i] === indices[i - 1]) adjacentEquals++;
  return { ioc, top12, adjacentEquals, trigram: logScore / (indices.length - 2) };
}
function nativeMetrics(indices) {
  const base = metrics(indices);
  return { ...base, nativeTrigram: languageScore(indices, nativeModel) };
}
function decrypt(key, sign, pageReset) {
  const out = [];
  let globalOffset = 0;
  for (const page of pages) {
    let pageOffset = 0;
    for (const c of page.indices) {
      const offset = pageReset ? pageOffset : globalOffset;
      out.push((c + sign * key[offset % 25] + 29) % 29);
      pageOffset++;
      globalOffset++;
    }
  }
  return out;
}
const baseline = metrics(original);
const positiveTexts = {
  "LP1 A WARNING": "A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS BOOK OR THE MESSAGE CONTAINED WITHIN EITHER THE WORDS OR THEIR NUMBERS FOR ALL IS SACRED",
  "LP1 WELCOME": "WELCOME WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO FIND THEIR WAY HERE IT IS A NECESSARY ONE",
  "LP2 AN END": "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE"
};
const positives = Object.fromEntries(Object.entries(positiveTexts).map(([name, text]) => {
  const symbols = englishToGP(text);
  return [name, { length: symbols.length, ...metrics(symbols) }];
}));
assert.equal(positives["LP1 A WARNING"].length, 184);
assert.equal(positives["LP1 WELCOME"].length, 116);
assert.equal(positives["LP2 AN END"].length, 85);

const variants = [];
for (const [matrixName, M] of [["p05-word-grid", A], ["p16-numeric-square", B]]) {
  for (const transform of ["raw", "phi", "prime-index-totient"]) {
    const rowKey = deriveKey(M, transform);
    const colKey = colMajor(Array.from({ length: 5 }, (_, i) => rowKey.slice(i * 5, i * 5 + 5)));
    for (const [traversal, key] of [["row-major", rowKey], ["column-major", colKey]]) {
      for (const sign of [-1, 1]) {
        for (const pageReset of [false, true]) {
          const result = metrics(decrypt(key, sign, pageReset));
          variants.push({
            matrix: matrixName,
            transform,
            traversal,
            direction: sign < 0 ? "subtract" : "add",
            clock: pageReset ? "physical-page-reset" : "book-global",
            ...result
          });
        }
      }
    }
  }
}
assert.equal(variants.length, 48);
const range = (field) => ({
  min: Math.min(...variants.map((v) => v[field])),
  max: Math.max(...variants.map((v) => v[field]))
});
const positiveMin = {
  ioc: Math.min(...Object.values(positives).map((p) => p.ioc)),
  top12: Math.min(...Object.values(positives).map((p) => p.top12)),
  trigram: Math.min(...Object.values(positives).map((p) => p.trigram))
};
assert.ok(range("ioc").max < positiveMin.ioc);
assert.ok(range("top12").max < positiveMin.top12);
assert.ok(range("trigram").max < positiveMin.trigram);

// The two magic constants are also exact prime ordinals. Test the most
// direct transfer suggested by p16: start the solved p56 phi(prime) stream
// at either ordinal, reset at each physical page, and exhaust every visible-F
// literal/nonconsuming mask. The authentic p56 page is the positive control.
const nativeModel = trainNativeGP(emerson);
const PAGE56_ENGLISH =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
const p56Plain = plaintextWords(PAGE56_ENGLISH).flat();
const p56Control = exhaustLiteralF(
  p56Cipher, primeTotients(p56Cipher.length, 1), nativeModel, p56Plain
);
assert.equal(p56Cipher.length, 85);
assert.equal(p56Plain.length, 85);
assert.equal(p56Control.correctMask, 8);
assert.equal(p56Control.exactMatches, 1);
const offsetPages = corpus.pages.filter((p) => p.page < 56 && p.indices.length > 0);
assert.equal(offsetPages.length, 55);
const maxPageLength = Math.max(...offsetPages.map((p) => p.indices.length));
const offsetCandidates = [
  { startIndex: 174, rationale: "p05 magic constant 1033 is p174" },
  { startIndex: 464, rationale: "p16 magic constant 3301 is p464" },
  { startIndex: 493, rationale: "one additional 29-prime block after p16; extrapolation only" }
];

function forwardLiteralF(plaintext, positions, mask, key) {
  const positionBit = new Int16Array(plaintext.length).fill(-1);
  positions.forEach((position, i) => { positionBit[position] = i; });
  const output = [];
  let consumed = 0;
  for (let i = 0; i < plaintext.length; i++) {
    if (positionBit[i] >= 0 && ((mask >>> positionBit[i]) & 1)) {
      assert.equal(plaintext[i], 0);
      output.push(0);
    } else output.push(((plaintext[i] + key[consumed++]) % 29 + 29) % 29);
  }
  return { output, consumed };
}
const p56Forward = forwardLiteralF(
  p56Plain, p56Control.positions, p56Control.correctMask,
  primeTotients(p56Cipher.length, 1)
);
assert.deepEqual(p56Forward.output, p56Cipher);
const targetedPrimeOffsetTests = [
  { page: 15, startIndex: 145, source: "LP2 p15 Fibonacci spiral includes p145" },
  { page: 16, startIndex: 140, source: "LP1 p16 square centre 809 is p140" },
  { page: 15, startIndex: 140, source: "cross-assignment control" },
  { page: 16, startIndex: 145, source: "cross-assignment control" }
].map((spec) => {
  const cipher = corpus.pages.find((p) => p.page === spec.page).indices;
  const key = primeTotients(cipher.length, spec.startIndex);
  const decoded = exhaustLiteralF(cipher, key, nativeModel);
  const encoded = forwardLiteralF(
    decoded.best.plaintext, decoded.positions, decoded.best.mask, key
  );
  assert.deepEqual(encoded.output, cipher);
  return {
    ...spec,
    ciphertextRunes: cipher.length,
    visibleFPositions: decoded.positions,
    exhaustiveMasks: decoded.totalMasks,
    bestMask: decoded.best.mask,
    bestScorePerRune: decoded.best.score,
    bestPreview32: decoded.best.plaintext.slice(0, 32)
      .map((i) => corpus.translit[i]).join(""),
    forwardReencryptsExactly: true,
    p56TrueScorePerRune: p56Control.correctScore,
    reachesP56TrueScore: decoded.best.score >= p56Control.correctScore
  };
});

const primeOrdinalOffsetTransfer = offsetCandidates.map(({ startIndex, rationale }) => {
  const keys = primeTotients(maxPageLength, startIndex);
  const perPage = offsetPages.map((page) => {
    const result = exhaustLiteralF(page.indices, keys, nativeModel);
    return {
      physicalPage: page.page,
      length: result.ciphertextRunes,
      visibleFCount: result.positions.length,
      exhaustiveMasks: result.totalMasks,
      bestMask: result.best.mask,
      bestScorePerRune: result.best.score,
      bestPreview32: result.best.plaintext.slice(0, 32)
        .map((i) => corpus.translit[i]).join("")
    };
  });
  const scores = perPage.map((p) => p.bestScorePerRune).sort((a, b) => a - b);
  const totalMasks = perPage.reduce((s, p) => s + p.exhaustiveMasks, 0);
  const totalRunes = perPage.reduce((s, p) => s + p.length, 0);
  assert.equal(totalMasks, 249802);
  assert.equal(totalRunes, 12956);
  assert.ok(perPage.every((p) => p.bestScorePerRune < p56Control.correctScore));
  return {
    startPrimeOrdinal: startIndex,
    rationale,
    firstTotientKey: keys[0],
    lastTotientKey: keys[maxPageLength - 1],
    physicalPages: perPage.length,
    originalRunes: totalRunes,
    exhaustiveFMaskChoices: totalMasks,
    p56TrueMask: p56Control.correctMask,
    p56TrueScorePerRune: p56Control.correctScore,
    pagesReachingP56TrueScore: perPage.filter(
      (p) => p.bestScorePerRune >= p56Control.correctScore
    ).length,
    bestPageScore: Math.max(...scores),
    medianPageScore: scores[Math.floor(scores.length / 2)],
    meanPageScore: scores.reduce((s, x) => s + x, 0) / scores.length,
    topPages: perPage.slice().sort(
      (a, b) => b.bestScorePerRune - a.bestScorePerRune
    ).slice(0, 8),
    perPage
  };
});


// Stage10-returned LP1 p14-16: p14/p15 circumference/inside wording and
// p16's 3301 square motivate testing the 3x3 interior and 8-value perimeter.
// p05 is retained as an independently sourced square control.
const mod29 = (x) => ((x % 29) + 29) % 29;
function inner3(M) { return M.slice(1, 4).map((row) => row.slice(1, 4)); }
function fullPerimeter(M) {
  const out = [];
  for (let j = 0; j < 5; j++) out.push(M[0][j]);
  for (let i = 1; i < 5; i++) out.push(M[i][4]);
  for (let j = 3; j >= 0; j--) out.push(M[4][j]);
  for (let i = 3; i >= 1; i--) out.push(M[i][0]);
  return out;
}
function transpose3(M) { return M[0].map((_, j) => M.map((row) => row[j])); }
function determinant3(M) {
  return mod29(
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
  );
}
function inverse3(M) {
  const a = M.map((row, i) => [
    ...row.map(mod29), ...[0, 1, 2].map((j) => +(i === j))
  ]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    while (pivot < 3 && a[pivot][col] === 0) pivot++;
    if (pivot === 3) throw new Error("singular GP29 3x3 matrix");
    [a[pivot], a[col]] = [a[col], a[pivot]];
    let inv = 1;
    while (mod29(a[col][col] * inv) !== 1) inv++;
    a[col] = a[col].map((x) => mod29(x * inv));
    for (let row = 0; row < 3; row++) if (row !== col) {
      const factor = a[row][col];
      a[row] = a[row].map((x, j) => mod29(x - factor * a[col][j]));
    }
  }
  return a.map((row) => row.slice(3));
}
function hillApply(values, M) {
  const out = values.slice();
  for (let i = 0; i + 2 < values.length; i += 3) {
    const block = values.slice(i, i + 3);
    for (let row = 0; row < 3; row++)
      out[i + row] = mod29(M[row][0] * block[0] +
        M[row][1] * block[1] + M[row][2] * block[2]);
  }
  return out;
}
const nonemptyPages = pages.filter((p) => p.indices.length > 0);
function hillClock(M, pageReset) {
  return pageReset
    ? nonemptyPages.flatMap((p) => hillApply(p.indices, M))
    : hillApply(original, M);
}
function additiveClock(key, sign, pageReset) {
  const out = [];
  let globalOffset = 0;
  for (const page of nonemptyPages) {
    let localOffset = 0;
    for (const c of page.indices) {
      const offset = pageReset ? localOffset : globalOffset;
      out.push(mod29(c + sign * key[offset % key.length]));
      localOffset++;
      globalOffset++;
    }
  }
  return out;
}
function bestVariant(items, source) {
  return items.filter((item) => item.source === source)
    .sort((a, b) => b.nativeTrigram - a.nativeTrigram)[0];
}
function familySummary(items) {
  return {
    tested: items.length,
    nativeTrigramRange: [
      Math.min(...items.map((x) => x.nativeTrigram)),
      Math.max(...items.map((x) => x.nativeTrigram))
    ],
    bestP16: bestVariant(items, "p16"),
    bestP05Control: bestVariant(items, "p05-control")
  };
}
const innerKeyFamilies = [
  { name: "p16-inner-raw", source: "p16", M: inner3(B).map((r) => r.map(mod29)) },
  { name: "p16-inner-phi", source: "p16", M: inner3(B).map((r) => r.map((x) => phi(x) % 29)) },
  { name: "p05-inner-raw-control", source: "p05-control", M: inner3(A).map((r) => r.map(mod29)) },
  { name: "p05-inner-phi-control", source: "p05-control", M: inner3(A).map((r) => r.map((x) => phi(x) % 29)) }
];
const innerHillVariants = [];
for (const item of innerKeyFamilies) {
  for (const [orientation, M] of [
    ["row-major", item.M], ["column-major", transpose3(item.M)]
  ]) {
    const inverse = inverse3(M);
    for (const [direction, operation] of [
      ["forward", M], ["inverse", inverse]
    ]) {
      for (const pageReset of [false, true]) {
        innerHillVariants.push({
          name: item.name, source: item.source, orientation, direction,
          clock: pageReset ? "physical-page-reset" : "book-global",
          determinant: determinant3(M),
          ...nativeMetrics(hillClock(operation, pageReset))
        });
      }
    }
  }
}
const innerPadVariants = [];
for (const item of innerKeyFamilies) {
  const key = item.M.flat();
  for (const sign of [-1, 1]) for (const pageReset of [false, true]) {
    innerPadVariants.push({
      name: item.name, source: item.source, key, sign,
      clock: pageReset ? "physical-page-reset" : "book-global",
      ...nativeMetrics(additiveClock(key, sign, pageReset))
    });
  }
}
function perimeter8(M) {
  const full = fullPerimeter(M);
  assert.equal(full.length, 16);
  assert.deepEqual(full.slice(0, 8), full.slice(8));
  return full.slice(0, 8).map(mod29);
}
const perimeterKeyFamilies = [
  { name: "p16-perimeter-raw", source: "p16", key: perimeter8(B) },
  { name: "p16-perimeter-phi", source: "p16", key: perimeter8(B.map((r) => r.map(phi))) },
  { name: "p05-perimeter-raw-control", source: "p05-control", key: perimeter8(A) },
  { name: "p05-perimeter-phi-control", source: "p05-control", key: perimeter8(A.map((r) => r.map(phi))) }
];
const perimeterPadVariants = [];
for (const item of perimeterKeyFamilies) {
  for (const [orientation, key] of [
    ["clockwise", item.key], ["counterclockwise", item.key.slice().reverse()]
  ]) {
    for (const sign of [-1, 1]) for (const pageReset of [false, true]) {
      perimeterPadVariants.push({
        name: item.name, source: item.source, key, orientation, sign,
        clock: pageReset ? "physical-page-reset" : "book-global",
        ...nativeMetrics(additiveClock(key, sign, pageReset))
      });
    }
  }
}
assert.equal(innerHillVariants.length, 32);
assert.equal(innerPadVariants.length, 16);
assert.equal(perimeterPadVariants.length, 32);

// Exact positive controls: fixed inverse pairs recover a held-out GP English
// plant exactly. This validates implementation, not historical key provenance.
function applyPadForControl(values, key, sign) {
  return values.map((x, i) => mod29(x + sign * key[i % key.length]));
}
const heldoutPlant = englishToGP(shakespeare.slice(240000)).slice(0, original.length);
assert.equal(heldoutPlant.length, original.length);
const p16InnerRaw = innerKeyFamilies.find((x) => x.name === "p16-inner-raw").M;
const p16PerimeterRaw = perimeterKeyFamilies.find((x) => x.name === "p16-perimeter-raw").key;
const hillRecovered = hillApply(hillApply(heldoutPlant, p16InnerRaw), inverse3(p16InnerRaw));
const innerPadPlant = applyPadForControl(heldoutPlant, p16InnerRaw.flat(), 1);
const innerPadBack = applyPadForControl(innerPadPlant, p16InnerRaw.flat(), -1);
const perimeterPadPlant = applyPadForControl(heldoutPlant, p16PerimeterRaw, 1);
const perimeterPadBack = applyPadForControl(perimeterPadPlant, p16PerimeterRaw, -1);
assert.deepEqual(hillRecovered, heldoutPlant);
assert.deepEqual(innerPadBack, heldoutPlant);
assert.deepEqual(perimeterPadBack, heldoutPlant);
for (const item of innerKeyFamilies) {
  assert.deepEqual(hillApply(hillApply(original, item.M), inverse3(item.M)), original);
  assert.deepEqual(applyPadForControl(
    applyPadForControl(original, item.M.flat(), 1), item.M.flat(), -1
  ), original);
}
for (const item of perimeterKeyFamilies) {
  assert.deepEqual(applyPadForControl(
    applyPadForControl(original, item.key, 1), item.key, -1
  ), original);
}
const stage10CircumferenceInside = {
  source: {
    exactStage10OutputPages: [14, 15, 16],
    p14Cue: "The I is the voice of the circumference",
    p15Cue: "Discover truth inside yourself",
    p16SquareCentre: B[2][2],
    p16SquareCentrePrimeOrdinal: primeOrdinal(B[2][2]),
    p15SpiralPrimeOrdinals: stage10CrossReleaseOrdinals.p15SpiralPrimeOrdinals,
    p15SpiralIncludesPrimeOrdinal145: true,
    p15Prime145: primeOrdinal(829),
    crossReleaseOrdinalGap: 5
  },
  keys: {
    p16InnerRawMod29: innerKeyFamilies[0].M,
    p16InnerPhiMod29: innerKeyFamilies[1].M,
    p16InnerRawDeterminant: determinant3(innerKeyFamilies[0].M),
    p16InnerPhiDeterminant: determinant3(innerKeyFamilies[1].M),
    p16PerimeterRaw8: perimeterKeyFamilies[0].key,
    p16PerimeterPhi8: perimeterKeyFamilies[1].key,
    p05InnerRawControl: innerKeyFamilies[2].M,
    p05PerimeterRawControl: perimeterKeyFamilies[2].key
  },
  innerHill: familySummary(innerHillVariants),
  innerAdditivePad: familySummary(innerPadVariants),
  perimeterAdditivePad: familySummary(perimeterPadVariants),
  heldoutEnglishPositiveControl: {
    runes: heldoutPlant.length,
    nativeTrigram: nativeMetrics(heldoutPlant).nativeTrigram,
    innerHillExactRoundTrip: hillRecovered.every((x, i) => x === heldoutPlant[i]),
    innerPadExactRoundTrip: innerPadBack.every((x, i) => x === heldoutPlant[i]),
    perimeterPadExactRoundTrip: perimeterPadBack.every((x, i) => x === heldoutPlant[i])
  },
  variantCounts: {
    innerHill: innerHillVariants.length,
    innerAdditivePad: innerPadVariants.length,
    perimeterAdditivePad: perimeterPadVariants.length
  },
  variants: { innerHillVariants, innerPadVariants, perimeterPadVariants }
};

const result = {
  status: "PASS: bounded negative; no LP2 plaintext recovered",
  originalImageSha256: expectedImageSha,
  p05PrimeSumMatrix: A,
  p05LineSums: AStats,
  p16MagicSquare: B,
  p16LineSums: BStats,
  magicConstantPrimeOrdinals: magicPrimeOrdinals,
  stage10CrossReleaseOrdinals,
  stage10CircumferenceInside,
  p05AndP16Both180DegreeSymmetric: true,
  p05Literal18CellsPreserved: true,
  originalUnknownRunes: original.length,
  originalBaseline: baseline,
  authenticSolvedTextControls: positives,
  GPTrigramTrainingRunes: train.length,
  testedVariants: variants.length,
  candidateMetricRanges: {
    ioc: range("ioc"),
    top12: range("top12"),
    trigram: range("trigram")
  },
  bestCandidateTrigram: variants.slice().sort((a, b) => b.trigram - a.trigram)[0],
  bestCandidateIoC: variants.slice().sort((a, b) => b.ioc - a.ioc)[0],
  bestCandidateTop12: variants.slice().sort((a, b) => b.top12 - a.top12)[0],
  primeOrdinalOffsetTransfer: {
    model: "phi(p_n)=p_n-1, p56 subtraction direction, physical-page reset, exhaustive literal-F skip masks",
    nativeGPModelRunes: nativeModel.symbolCount,
    p56PositiveControl: {
      ciphertextRunes: p56Cipher.length,
      exactKnownPlaintextMatches: p56Control.exactMatches,
      trueLiteralFMask: p56Control.correctMask,
      rankOfKnownPlaintext: p56Control.rankOfKnownPlain,
      trueScorePerRune: p56Control.correctScore,
      forwardReencryptsExactly: p56Forward.output.every((x, i) => x === p56Cipher[i])
    },
    starts: primeOrdinalOffsetTransfer
  },
  targetedPrimeOrdinalTransfer: targetedPrimeOffsetTests,
  variants
};
console.log(JSON.stringify(result, null, 2));
