"use strict";

/*
 * Frozen p23-p26 per-page mayfly half-turn / authentic p56 prime-minus-one
 * transparent-F clock test. No key, phase, origin, split or orientation sweep.
 *
 * Run from the repository root:
 *   node sims/lp2_p23_26_mayfly_halfturn_p56_clock_gate_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "resources", "liber-primus");
const readText = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(readText("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(readText("resources/liber-primus/lp2-ink-annotations.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const expectedImageHashes = {
  23: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
  24: "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80",
  25: "a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff",
  26: "ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7",
};

for (const page of [23, 24, 25, 26]) {
  const jpeg = fs.readFileSync(path.join(SRC, String(page + 17) + ".jpg"));
  const digest = crypto.createHash("sha256").update(jpeg).digest("hex");
  assert.equal(digest, expectedImageHashes[page], "original JPEG hash for p" + page);
}

function pageIndices(page) {
  const found = corpus.pages.find((x) => x.page === page);
  assert.ok(found, "missing corpus page " + page);
  return found.indices.slice();
}

const rawTranscription = readText("resources/liber-primus/lp2-transcription.txt");
const rawChars = Array.from(rawTranscription);
const sourceRunes = [];
const sourcePositions = [];
for (let i = 0; i < rawChars.length; i++) {
  if (runeIndex.has(rawChars[i])) {
    sourceRunes.push(rawChars[i]);
    sourcePositions.push(i);
  }
}
const sourceRuneText = sourceRunes.join("");

function pageLines(page) {
  const target = pageIndices(page).map((i) => corpus.runes[i]).join("");
  const start = sourceRuneText.indexOf(target);
  assert.ok(start >= 0, "page sequence missing from transcription: " + page);
  assert.equal(sourceRuneText.indexOf(target, start + 1), -1,
    "page sequence unexpectedly repeats in transcription: " + page);
  const rawStart = sourcePositions[start];
  const rawEnd = sourcePositions[start + target.length - 1] + 1;
  const chunk = rawChars.slice(rawStart, rawEnd).join("");
  return chunk.split(/\r?\n/).filter((line) =>
    Array.from(line).some((ch) => runeIndex.has(ch))
  );
}

function runeCount(s) {
  return Array.from(s).filter((ch) => runeIndex.has(ch)).length;
}

const expectedLineCounts = {
  24: [22, 24, 21, 24, 23, 21, 22, 23, 23, 22, 22, 23],
  25: [22, 22, 24, 23, 23, 23, 24, 23, 21, 24, 23, 21],
  26: [20, 22, 23, 22, 24, 23, 24, 21, 19, 24, 23, 20],
};
const lines = {};
const lineCounts = {};
const splits = {};
const crossings = {};

function crossingWord(page, pageLinesValue) {
  const left = pageLinesValue[5].replace(/\/+$/, "");
  const right = pageLinesValue[6].replace(/\/+$/, "");
  const leftEndsWord = /[-.]$/.test(left);
  if (leftEndsWord) return { crosses: false };
  const leftFragment = left.split(/[-.]/).filter(Boolean).pop();
  const rightFragment = right.split(/[-.]/).filter(Boolean)[0];
  return {
    crosses: true,
    lineBoundary: "6|7",
    leftFragment,
    rightFragment,
    joinedPrintedWord: leftFragment + rightFragment,
  };
}

for (const page of [24, 25, 26]) {
  lines[page] = pageLines(page);
  assert.equal(lines[page].length, 12, "expected 12 physical text lines on p" + page);
  lineCounts[page] = lines[page].map(runeCount);
  assert.deepEqual(lineCounts[page], expectedLineCounts[page],
    "transcription/image line counts changed on p" + page);
  splits[page] = lineCounts[page].slice(0, 6).reduce((a, b) => a + b, 0);
  crossings[page] = crossingWord(page, lines[page]);
}

assert.deepEqual(splits, { 24: 135, 25: 137, 26: 134 });
assert.deepEqual(crossings[24], {
  crosses: true, lineBoundary: "6|7", leftFragment: "ᛈᛟ",
  rightFragment: "ᚠ", joinedPrintedWord: "ᛈᛟᚠ",
});
assert.deepEqual(crossings[25], { crosses: false });
assert.deepEqual(crossings[26], {
  crosses: true, lineBoundary: "6|7", leftFragment: "ᛉᛖᛡ",
  rightFragment: "ᛞᚦ", joinedPrintedWord: "ᛉᛖᛡᛞᚦ",
});

function halfTurn(values, page) {
  if (page === 23) return values.slice();
  const split = splits[page];
  return values.slice(0, split).concat(values.slice(split).reverse());
}

const redHeading = ink.pages.find((p) => p.page === 23).red_spans[0];
assert.equal(redHeading.start, 0);
assert.equal(redHeading.length, 16);
const pageLengths = {
  23: pageIndices(23).length - redHeading.length,
  24: pageIndices(24).length,
  25: pageIndices(25).length,
  26: pageIndices(26).length,
};
assert.deepEqual(pageLengths, { 23: 197, 24: 270, 25: 273, 26: 265 });

const bodyPages = {
  23: pageIndices(23).slice(redHeading.length),
  24: halfTurn(pageIndices(24), 24),
  25: halfTurn(pageIndices(25), 25),
  26: halfTurn(pageIndices(26), 26),
};
const body = [bodyPages[23], bodyPages[24], bodyPages[25], bodyPages[26]].flat();
assert.equal(body.length, 1005);

function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push(x);
  }
  return out;
}
const primes = firstPrimes(1200);
const shifts = primes.map((p) => (p - 1) % 29);
const mod29 = (x) => ((x % 29) + 29) % 29;

function encrypt(plain) {
  let keyTick = 0;
  let literalFHolds = 0;
  const cipher = [];
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
      literalFHolds++;
    } else {
      cipher.push(mod29(p + shifts[keyTick]));
      keyTick++;
    }
  }
  return { cipher, keyTick, literalFHolds };
}

function decodeKnown(cipher, knownPlain) {
  assert.equal(cipher.length, knownPlain.length);
  let keyTick = 0;
  let literalFHolds = 0;
  const decoded = [];
  for (let i = 0; i < cipher.length; i++) {
    if (knownPlain[i] === 0) {
      assert.equal(cipher[i], 0, "literal plaintext F must pass unchanged at " + i);
      decoded.push(0);
      literalFHolds++;
    } else {
      const p = mod29(cipher[i] - shifts[keyTick]);
      assert.notEqual(p, 0, "non-F ciphertext cannot decode to plaintext F at " + i);
      assert.equal(p, knownPlain[i], "known-plaintext inverse mismatch at " + i);
      decoded.push(p);
      keyTick++;
    }
  }
  return { decoded, keyTick, literalFHolds };
}

function fnv32(values) {
  let h = 2166136261;
  for (const value of values) {
    h ^= value;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function encodeGp(text, normalize) {
  let source = text.toUpperCase();
  if (normalize) {
    source = source.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
  }
  const tokenMap = new Map(corpus.translit.map((token, i) => [token, i]));
  tokenMap.set("ING", 21);
  const tokens = Array.from(tokenMap.entries()).sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (let i = 0; i < source.length;) {
    const code = source.charCodeAt(i);
    if (code < 65 || code > 90) { i++; continue; }
    const hit = tokens.find(([token]) => source.startsWith(token, i));
    assert.ok(hit, "unmapped Latin letter at source offset " + i + ": " + source[i]);
    out.push(hit[1]);
    i += hit[0].length;
  }
  return out;
}

const p56Cipher = pageIndices(56);
const p56KnownPlain = encodeGp(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE",
  false
);
assert.equal(p56KnownPlain.length, 85);
const p56Forward = encrypt(p56KnownPlain);
assert.deepEqual(p56Forward.cipher, p56Cipher,
  "authentic p56 prime-minus-one/F positive control");
const p56Inverse = decodeKnown(p56Cipher, p56KnownPlain);
const p56PlainF = p56KnownPlain.flatMap((x, i) => x === 0 ? [i] : []);
const p56CipherF = p56Cipher.flatMap((x, i) => x === 0 ? [i] : []);
assert.deepEqual(p56PlainF, [56]);
assert.deepEqual(p56CipherF, [35, 47, 51, 56, 74]);
assert.equal(p56Inverse.keyTick, 84);

const first12Cipher = body.slice(0, 12);
const first12Shifts = shifts.slice(0, 12);
const first12CandidatePlain = first12Cipher.map((c, i) => mod29(c - first12Shifts[i]));
assert.equal(first12Cipher.slice(0, 11).filter((x) => x === 0).length, 0);
assert.equal(first12CandidatePlain.slice(0, 11).filter((x) => x === 0).length, 0);
assert.deepEqual(first12Cipher, [28, 6, 15, 25, 13, 7, 19, 28, 12, 11, 12, 7]);
assert.deepEqual(first12Shifts, [1, 2, 4, 6, 10, 12, 16, 18, 22, 28, 1, 7]);
assert.equal(primes[11], 37);
assert.equal(first12Cipher[11], 7);
assert.equal(first12CandidatePlain[11], 0);

function firstStrictFPathFailure(cipher) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const keyTick of states) {
      const shift = shifts[keyTick];
      const candidate = mod29(cipher[i] - shift);
      if (cipher[i] === 0) {
        next.add(keyTick); // literal plaintext F: hold the clock
        if (candidate !== 0) next.add(keyTick + 1); // encrypted non-F
      } else if (candidate !== 0) {
        next.add(keyTick + 1);
      }
    }
    states = next;
    if (states.size === 0) return i;
  }
  return null;
}
const firstNoPath = firstStrictFPathFailure(body);
assert.equal(firstNoPath, 11);

const controlPaths = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
];
const developmentLength = pageLengths[23] + pageLengths[24];
const holdoutLength = pageLengths[25] + pageLengths[26];
assert.equal(developmentLength, 467);
assert.equal(holdoutLength, 538);

const controls = [];
for (const [name, sourcePath] of controlPaths) {
  const native = encodeGp(readText(sourcePath), true);
  assert.ok(native.length >= 1005, "native source too short: " + sourcePath);
  const plain = native.slice(0, 1005);
  const forward = encrypt(plain);

  const physical = {};
  let offset = 0;
  for (const page of [23, 24, 25, 26]) {
    const segment = forward.cipher.slice(offset, offset + pageLengths[page]);
    offset += pageLengths[page];
    physical[page] = halfTurn(segment, page);
  }
  assert.equal(offset, 1005);
  const reread = [
    physical[23],
    halfTurn(physical[24], 24),
    halfTurn(physical[25], 25),
    halfTurn(physical[26], 26),
  ].flat();
  assert.deepEqual(reread, forward.cipher,
    "geometric readout did not invert physical layout for " + name);

  const inverse = decodeKnown(reread, plain);
  assert.deepEqual(inverse.decoded, plain);
  assert.deepEqual(inverse.decoded.slice(0, developmentLength), plain.slice(0, developmentLength));
  assert.deepEqual(inverse.decoded.slice(developmentLength), plain.slice(developmentLength));
  controls.push({
    source: name,
    sourcePath,
    runes: plain.length,
    literalFHolds: forward.literalFHolds,
    keySymbolsConsumed: forward.keyTick,
    developmentRunes: developmentLength,
    developmentLiteralFs: plain.slice(0, developmentLength).filter((x) => x === 0).length,
    developmentExact: true,
    frozenHoldoutRunes: holdoutLength,
    holdoutLiteralFs: plain.slice(developmentLength).filter((x) => x === 0).length,
    holdoutExact: true,
    plaintextFNV32: fnv32(plain),
    readCipherFNV32: fnv32(reread),
  });
}

const output = {
  task: "p23-p26 mayfly-selected per-page half-turn plus authentic p56 phi(prime)/transparent-F clock",
  decision: "REJECTED: first strict transparent-F contradiction at body offset 11",
  source: {
    pageImageMap: { p23: "40.jpg", p24: "41.jpg", p25: "42.jpg", p26: "43.jpg" },
    imageSha256: expectedImageHashes,
    redHeading: { start: redHeading.start, length: redHeading.length },
  },
  geometry: {
    lineCounts,
    upperLowerRuneSplits: splits,
    pageBodyLengths: pageLengths,
    bodyLength: body.length,
    crossings,
    transformedBodyFNV32: fnv32(body),
    rule: "p23 unchanged; on p24-p26 upper six printed lines forward, lower six lines reversed",
  },
  authenticP56PositiveControl: {
    cipherRunes: p56Cipher.length,
    plaintextRunes: p56KnownPlain.length,
    plaintextFPositions: p56PlainF,
    ciphertextFPositions: p56CipherF,
    keySymbolsConsumed: p56Inverse.keyTick,
    exact: true,
  },
  original: {
    bodyStart: "p23 rune offset 16, immediately after the red heading/marker",
    first12Cipher: first12Cipher,
    first12PrimeMinusOne: first12Shifts,
    first12CandidatePlain: first12CandidatePlain,
    first11CipherFCount: 0,
    firstForcedPlainF: {
      bodyOffset: 11,
      page: 23,
      pageRuneOffset: 27,
      ciphertextValue: 7,
      prime: 37,
      shift: 7,
      candidatePlainValue: 0,
    },
    firstNoPath: firstNoPath,
    transformedBodySha256: crypto.createHash("sha256").update(Buffer.from(body)).digest("hex"),
  },
  nativePositivePlants: controls,
};
console.log(JSON.stringify(output, null, 2));
