#!/usr/bin/env node
"use strict";

// Frozen test for issue #2626.
// Run from the repository root: node sims/lp2_p50_ordered_row_enumerative_rank_gate_sft.cjs
// No network access or third-party dependencies.

const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { TextDecoder } = require("node:util");

const grid = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json", "utf8"));
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256, "expected exactly 256 source cells");

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";

function decodeCells(alphabet) {
  return tokens.map((token) => {
    assert.equal(token.length, 2, "each source cell must contain two digits");
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "token is not valid in selected radix");
    return alphabet.length * hi + lo;
  });
}

function rankOrderedEight(row) {
  assert.equal(row.length, 8);
  const remaining = Array.from({ length: 256 }, (_, i) => i);
  let rank = 0n;
  for (let i = 0; i < 8; i += 1) {
    const digit = remaining.indexOf(row[i]);
    assert.ok(digit >= 0, "row contains a duplicate or invalid byte");
    rank = rank * BigInt(256 - i) + BigInt(digit);
    remaining.splice(digit, 1);
  }
  return rank;
}

function unrankOrderedEight(rank) {
  const digits = Array(8);
  let value = rank;
  for (let i = 7; i >= 0; i -= 1) {
    const radix = BigInt(256 - i);
    digits[i] = Number(value % radix);
    value /= radix;
  }
  assert.equal(value, 0n, "rank outside the 8-of-256 space");
  const remaining = Array.from({ length: 256 }, (_, i) => i);
  return digits.map((digit) => remaining.splice(digit, 1)[0]);
}

function toBase29(value) {
  if (value === 0n) return "0";
  let n = value;
  let out = "";
  while (n > 0n) {
    out = base29Alphabet[Number(n % 29n)] + out;
    n /= 29n;
  }
  return out;
}

function shannonBits(bytes) {
  const counts = Array(256).fill(0);
  for (const byte of bytes) counts[byte] += 1;
  let entropy = 0;
  for (const count of counts) {
    if (count === 0) continue;
    const p = count / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function headerDescription(bytes) {
  const first = bytes[0];
  if ((first & 0xc0) !== 0x80) {
    return { firstByte: "0x" + first.toString(16).padStart(2, "0"), format: "not old-format" };
  }
  const tag = (first >> 2) & 0x0f;
  const lengthType = first & 0x03;
  const result = {
    firstByte: "0x" + first.toString(16).padStart(2, "0"),
    format: "old",
    tag,
    lengthType
  };
  if (lengthType === 3) {
    result.length = "indeterminate";
  } else if (lengthType === 2 && bytes.length >= 5) {
    result.declaredLength =
      bytes[1] * 0x1000000 +
      bytes[2] * 0x10000 +
      bytes[3] * 0x100 +
      bytes[4];
  }
  return result;
}

function buildReading(name, alphabet) {
  const cells = decodeCells(alphabet);
  const rows = [];
  const ranks = [];
  const bytes = Buffer.alloc(256);

  for (let rowIndex = 0; rowIndex < 32; rowIndex += 1) {
    const row = cells.slice(rowIndex * 8, rowIndex * 8 + 8);
    assert.equal(new Set(row).size, 8, name + " row " + rowIndex + " is not distinct");
    const rank = rankOrderedEight(row);
    assert.deepEqual(unrankOrderedEight(rank), row, name + " row " + rowIndex + " failed round-trip");
    rows.push(row);
    ranks.push(rank);
    bytes.writeBigUInt64BE(rank, rowIndex * 8);
  }

  assert.equal(new Set(ranks.map(String)).size, 32, name + " row ranks are not unique");
  assert.equal(bytes.length, 256);

  let wholeInteger = 0n;
  for (const byte of bytes) wholeInteger = (wholeInteger << 8n) | BigInt(byte);
  const rowBase29 = ranks.map(toBase29);

  let utf8Valid = true;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    utf8Valid = false;
  }

  return {
    name,
    rows,
    ranks,
    bytes,
    summary: {
      rowCount: rows.length,
      cellsPerRow: 8,
      distinctValuesPerRow: true,
      uniqueRanks: new Set(ranks.map(String)).size,
      firstFourRanks: ranks.slice(0, 4).map(String),
      outputBytes: bytes.length,
      first16Hex: bytes.subarray(0, 16).toString("hex"),
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      entropyBitsPerByte: shannonBits(bytes),
      printableAsciiBytes: [...bytes].filter((x) => x >= 32 && x <= 126).length,
      zeroBytes: [...bytes].filter((x) => x === 0).length,
      validUtf8: utf8Valid,
      firstPacketHeader: headerDescription(bytes),
      rowBase29Lengths: rowBase29.map((x) => x.length),
      firstFourRowsBase29: rowBase29.slice(0, 4),
      wholeStreamBase29Length: toBase29(wholeInteger).length,
      wholeStreamBase29Prefix: toBase29(wholeInteger).slice(0, 64)
    }
  };
}

function randomDistinctRowControls(trials) {
  let seed = 0x26262026;
  function nextU32() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }

  let exactB3 = 0;
  let oldIndeterminateHeader = 0;
  let newFormatSignatureHeader = 0;
  let printableTotal = 0;
  let zeroTotal = 0;

  for (let trial = 0; trial < trials; trial += 1) {
    const bytes = Buffer.alloc(256);
    for (let rowIndex = 0; rowIndex < 32; rowIndex += 1) {
      const pool = Array.from({ length: 256 }, (_, i) => i);
      for (let i = 0; i < 8; i += 1) {
        const j = i + (nextU32() % (256 - i));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const rank = rankOrderedEight(pool.slice(0, 8));
      bytes.writeBigUInt64BE(rank, rowIndex * 8);
    }

    const first = bytes[0];
    if (first === 0xb3) exactB3 += 1;
    if ((first & 0xc3) === 0x83 && ((first >> 2) & 0x0f) !== 0) {
      oldIndeterminateHeader += 1;
    }
    if ((first & 0xc0) === 0xc0 && (first & 0x3f) === 2) {
      newFormatSignatureHeader += 1;
    }
    for (const byte of bytes) {
      if (byte >= 32 && byte <= 126) printableTotal += 1;
      if (byte === 0) zeroTotal += 1;
    }
  }

  return {
    trials,
    generator: "xorshift32 seed 0x26262026; Fisher-Yates 8-of-256 per row",
    exactBase59HeaderB3: exactB3,
    anyOldFormatIndeterminateHeader: oldIndeterminateHeader,
    newFormatSignatureHeader: newFormatSignatureHeader,
    meanPrintableAsciiBytesPer256: printableTotal / trials,
    meanZeroBytesPer256: zeroTotal / trials
  };
}

let rankSpace = 1n;
for (let i = 0; i < 8; i += 1) rankSpace *= BigInt(256 - i);
const two64 = 1n << 64n;
assert.ok(rankSpace < two64, "rank space must fit in eight bytes");

const base60 = buildReading("base60", alphabet60);
const base59 = buildReading("base59", alphabet59);
assert.equal(base60.summary.outputBytes, 256);
assert.equal(base59.summary.outputBytes, 256);
assert.equal(base59.summary.firstPacketHeader.firstByte, "0xb3");
assert.equal(base60.summary.firstPacketHeader.firstByte, "0xb6");

const firstByteBucket = 1n << 56n;
const maxFirstByte = Number((rankSpace - 1n) / firstByteBucket);
const controls = randomDistinctRowControls(10000);

const output = {
  operation: "lexicographic rank of each ordered 8-tuple from 0..255; mixed radices 256,255,254,253,252,251,250,249; unsigned 8-byte big-endian per row",
  rankSpace: rankSpace.toString(),
  maximumRank: (rankSpace - 1n).toString(),
  uint64Limit: two64.toString(),
  maxPossibleFirstByte: maxFirstByte,
  exactProbabilityFirstByteB3: Number(firstByteBucket) / Number(rankSpace),
  exactProbabilityAnyOldFormatIndeterminateHeader: Number(15n * firstByteBucket) / Number(rankSpace),
  base60: base60.summary,
  base59: base59.summary,
  matchedRandomControls: controls
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
