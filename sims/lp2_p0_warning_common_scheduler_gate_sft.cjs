"use strict";

/**
 * SFT: common-scheduler gate for the source-selected p0 warning packet.
 *
 * The receiver/segmentation candidate at p0 offsets166..188 is frozen before
 * this test. Its proposed plaintext is the authenticated 2016 warning subset
 * OPENPGP / PATHS / VERIFY / BEWARE. The purpose here is narrower: ask
 * whether ONE low-description scheduler, selected from source-native objects
 * already active in the route, generates all 23 exact additive key symbols.
 *
 * No English scoring or target search is performed.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const alpha60 = grid.alphabet;
const tableTokens = grid.rows.flat();
const tableBytes = grid.byte_rows.flat();

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function hInv(diff, sum) {
  const inv2 = 15;
  return [
    mod29((diff + sum) * inv2),
    mod29((sum - diff) * inv2),
  ];
}

function outerShell(values, inverse = false) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(...(inverse
      ? hInv(values[left], values[right])
      : H(values[left], values[right])));
  }
  if (values.length % 2 === 1) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

function parsePhysicalLines(pageText) {
  return pageText
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

function runeValues(text) {
  return [...text]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word, index) => {
      const values = gp(word);
      const sum = values.reduce((total, value) => total + value, 0);
      const length = values.length;
      const delta = mod29(index - sum);
      const [hdiff, hsum] = H(delta, length);
      const byteAt = (address) => tableBytes[address] === undefined
        ? null
        : mod29(tableBytes[address]);
      return {
        word: word.toUpperCase(),
        index,
        gp0: sum,
        gp0mod: mod29(sum),
        length,
        delta,
        hdiff,
        hsum,
        p50gp: byteAt(sum),
        p50delta: byteAt(delta),
      };
    });
}

const pages = transcription.split(/^\s*%\s*$/m);
const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
const cipher = p0.indices.slice(166, 189);
assert.equal(cipher.length, 23);

const packetWords = ["OPENPGP", "PATHS", "VERIFY", "BEWARE"];
const packetLengths = packetWords.map((word) => gp(word).length);
assert.deepEqual(packetLengths, [7, 4, 6, 6]);
const plain = packetWords.flatMap(gp);
assert.equal(plain.length, 23);

const key = cipher.map((value, index) => mod29(value - plain[index]));
assert.deepEqual(key, [
  23, 3, 24, 1, 18, 17, 27,
  9, 13, 18, 13,
  28, 25, 21, 3, 6, 17,
  12, 2, 0, 17, 12, 7,
]);

const segmentShells = [];
let packetOffset = 0;
for (const length of packetLengths) {
  segmentShells.push(outerShell(key.slice(packetOffset, packetOffset + length)));
  packetOffset += length;
}
const shell = segmentShells.flat();
assert.deepEqual(segmentShells, [
  [25, 21, 15, 20, 6, 13, 1],
  [25, 22, 24, 2],
  [11, 16, 19, 2, 18, 24],
  [5, 19, 19, 14, 12, 17],
]);

// Source-local DH line: p28 physical line6 is exactly 23 runes.
const p28Lines = parsePhysicalLines(pages[28]);
assert.equal(p28Lines.length, 12);
const dhLine = runeValues(p28Lines[5]);
assert.equal(dhLine.length, 23);

const direct23Candidates = [];
for (const reversed of [false, true]) {
  const base = reversed ? [...dhLine].reverse() : dhLine;
  for (const exponent of [1, 3, 9, 27, 25, 19]) {
    const powered = base.map((value) => value === 0 ? 0 : Number(BigInt(value) ** BigInt(exponent) % 29n));
    direct23Candidates.push({
      label: `raw/rev=${reversed}/pow=${exponent}`,
      values: powered,
    });
    direct23Candidates.push({
      label: `H-shell/rev=${reversed}/pow=${exponent}`,
      values: outerShell(powered),
    });
    direct23Candidates.push({
      label: `Hinv-shell/rev=${reversed}/pow=${exponent}`,
      values: outerShell(powered, true),
    });
  }
}
const direct23Hits = direct23Candidates.filter((candidate) =>
  candidate.values.every((value, index) => value === key[index])
);
assert.deepEqual(direct23Hits, []);

// Standard segment-reset state recurrences. A single recurrence must explain
// every within-segment transition, with word boundaries allowed to reset.
const keySegments = [];
const plainSegments = [];
packetOffset = 0;
for (const length of packetLengths) {
  keySegments.push(key.slice(packetOffset, packetOffset + length));
  plainSegments.push(plain.slice(packetOffset, packetOffset + length));
  packetOffset += length;
}

const transitionRows = [];
for (let segment = 0; segment < keySegments.length; segment += 1) {
  for (let offset = 0; offset < keySegments[segment].length - 1; offset += 1) {
    transitionRows.push({
      k: keySegments[segment][offset],
      nextK: keySegments[segment][offset + 1],
      p: plainSegments[segment][offset],
      nextP: plainSegments[segment][offset + 1],
    });
  }
}

const affineHits = [];
for (let a = 0; a < 29; a += 1) {
  for (let b = 0; b < 29; b += 1) {
    if (transitionRows.every((row) => mod29((a * row.k) + b) === row.nextK)) {
      affineHits.push({ a, b });
    }
  }
}
assert.deepEqual(affineHits, []);

const autokeyHits = [];
for (const sourceField of ["p", "nextP"]) {
  for (let a = 0; a < 29; a += 1) {
    for (let b = 0; b < 29; b += 1) {
      for (let c = 0; c < 29; c += 1) {
        const ok = transitionRows.every((row) => {
          const source = row[sourceField];
          return mod29((a * row.k) + (b * source) + c) === row.nextK;
        });
        if (ok) autokeyHits.push({ sourceField, a, b, c });
      }
    }
  }
}
assert.deepEqual(autokeyHits, []);

// P50 scheduler family: source-selected starts only, every nonzero constant
// stride modulo256, and five direct printed/base60 component readings.
const pInverse29 = 24;
const sourceStarts = [
  gp0("OPENPGP"),
  tableBytes[gp0("OPENPGP")],
  166,
  177,
  188,
  23, 5, 6, 15, 8, 19, 2, 3, pInverse29,
];

function tokenRepresentations(index) {
  const token = tableTokens[index];
  const high = alpha60.indexOf(token[0]);
  const low = alpha60.indexOf(token[1]);
  return {
    byte: mod29(tableBytes[index]),
    high: mod29(high),
    low: mod29(low),
    sum: mod29(high + low),
    diff: mod29(high - low),
  };
}

const tableHits = [];
for (const start of sourceStarts) {
  for (let step = 1; step < 256; step += 1) {
    const rows = Array.from({ length: 23 }, (_, index) =>
      tokenRepresentations(mod29(0) + ((start + (index * step)) % 256))
    );
    for (const representation of ["byte", "high", "low", "sum", "diff"]) {
      const values = rows.map((row) => row[representation]);
      if (values.every((value, index) => value === key[index])) {
        tableHits.push({ start, step, representation, target: "key" });
      }
      if (values.every((value, index) => value === shell[index])) {
        tableHits.push({ start, step, representation, target: "shell" });
      }
    }
  }
}
assert.deepEqual(tableHits, []);

// Authenticated-word tape scheduler: each target starts at one fixed source
// coordinate and walks the 43 signed words by one shared constant step, while
// emitting one fixed source-word feature. The same rule must work for all four
// target segments.
const message = signedWords();
assert.equal(message.length, 43);
const sourceIndex = new Map(message.map((row) => [row.word, row.index]));
const featureNames = [
  "index", "gp0mod", "length", "delta", "hdiff", "hsum", "p50gp", "p50delta",
];
const startFunctions = {
  sourceIndex: (word) => sourceIndex.get(word),
  delta: (word) => message[sourceIndex.get(word)].delta,
  gp0mod43: (word) => message[sourceIndex.get(word)].gp0 % 43,
  gp0mod29: (word) => message[sourceIndex.get(word)].gp0mod,
};

const signedTapeHits = [];
for (const [startName, startFunction] of Object.entries(startFunctions)) {
  for (const feature of featureNames) {
    for (let step = -42; step <= 42; step += 1) {
      if (step === 0) continue;
      for (const targetName of ["key", "shell"]) {
        let cursor = 0;
        let exact = true;
        for (let segment = 0; segment < packetWords.length; segment += 1) {
          const word = packetWords[segment];
          const start = startFunction(word);
          const length = packetLengths[segment];
          const target = targetName === "key" ? key : shell;
          for (let local = 0; local < length; local += 1) {
            const messageIndex = ((start + (local * step)) % 43 + 43) % 43;
            if (message[messageIndex][feature] !== target[cursor + local]) {
              exact = false;
              break;
            }
          }
          if (!exact) break;
          cursor += length;
        }
        if (exact) signedTapeHits.push({ startName, feature, step, targetName });
      }
    }
  }
}
assert.deepEqual(signedTapeHits, []);

// The key is not itself copied from raw/reversed/first-difference LP2 text.
const manuscriptHits = [];
for (const page of corpus.pages) {
  const values = page.indices || [];
  const candidates = [
    ["raw", values],
    ["reverse", [...values].reverse()],
    ["difference", values.slice(1).map((value, index) => mod29(value - values[index]))],
  ];
  for (const [kind, candidate] of candidates) {
    for (let start = 0; start + key.length <= candidate.length; start += 1) {
      if (candidate.slice(start, start + key.length)
        .every((value, index) => value === key[index])) {
        manuscriptHits.push({ page: page.page, kind, start });
      }
    }
  }
}
assert.deepEqual(manuscriptHits, []);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "bounded negative: the source-selected p0 warning receiver remains intact, but its 23 exact additive key symbols are not generated by the tested common source-native schedulers",
  packet: {
    words: packetWords,
    lengths: packetLengths,
    cipher,
    plain,
    key,
    shell: segmentShells,
  },
  families: {
    p28Direct23: {
      configurations: direct23Candidates.length,
      exactHits: direct23Hits.length,
    },
    segmentResetAffine: {
      configurations: 29 * 29,
      exactHits: affineHits.length,
    },
    segmentResetAutokey: {
      configurations: 2 * 29 * 29 * 29,
      exactHits: autokeyHits.length,
    },
    p50ConstantStride: {
      sourceStarts: sourceStarts.length,
      configurations: sourceStarts.length * 255 * 5 * 2,
      exactHits: tableHits.length,
    },
    signedWordTape: {
      configurations:
        Object.keys(startFunctions).length * featureNames.length * 84 * 2,
      exactHits: signedTapeHits.length,
    },
    manuscriptCopy: {
      exactHits: manuscriptHits.length,
    },
  },
}, null, 2));
