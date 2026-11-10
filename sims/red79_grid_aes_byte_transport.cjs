"use strict";

/**
 * Finite source-key challenge: LP2 repeat-erased 78-rank packets, a red79
 * first-occurrence GP29 cycle, and eight source-grid AES-256-CTR pads.
 * No external libraries. Source input is original canonical ciphertext.
 *
 * A 47-byte printable ASCII packet maps to 78 radix-28 digits. The
 * published rune at each digit is selected from the 28 possibilities other
 * than the previous rune. AES-CTR bytes (mod28) pad these radix digits,
 * with one 256-bit grid key and fresh zero counter per printed text section.
 * Duplicate ciphertext runes are literal nonconsuming markers.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/base60-grid.json");
const starts = [0, 3, 8, 15, 23, 27, 33, 40];
const packetDigits = 78, packetBytes = 47;
const original = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const red79 = [40, 15, 53].flatMap((p) =>
  ink.pages.find((x) => x.page === p).red_spans.flatMap((s) =>
    [...s.runes].map((r) => runes.get(r))));
const firstSeen = [...new Set(red79)];
const omitted = Array.from({length: 29}, (_, i) => i)
  .filter((i) => !firstSeen.includes(i));
assert.equal(red79.length, 79);
assert.equal(firstSeen.length, 28);
assert.deepEqual(omitted, [18]);

/** @typedef {{page:number, section:number, glyph:number}} Entry */
const entries = [];
const sourceMarkerSlots = [];
let actualMarkers = 0, physical = 0;
for (const page of original) {
  const section = starts.reduce((s, n, i) => page.page >= n ? i : s, 0);
  for (let i = 0; i < page.indices.length; i++) {
    const glyph = page.indices[i];
    if (i > 0 && glyph === page.indices[i - 1]) {
      sourceMarkerSlots.push(physical);
      actualMarkers++;
    } else entries.push({page: page.page, section, glyph});
    physical++;
  }
}
assert.equal(physical, 12956);
assert.equal(actualMarkers, 86);
assert.equal(entries.length, 12870);
assert.equal(entries.length % packetDigits, 0);

const token59 = grid.alphabet.replace("f", "");
const repairs = [[45, 107, 81], [50, 47, 21],
  [165, 18, 47], [172, 148, 174], [246, 198, 224]];
/** Independently image-audited five-cell alternative, as printed base60 tokens. */
function sourceGridRows(radix, corrected) {
  const tokens = grid.rows.flat();
  if (corrected) for (const [index, previous, replacement] of repairs) {
    const oldToken = tokens[index];
    const oldValue = grid.alphabet.indexOf(oldToken[0]) * 60 +
      grid.alphabet.indexOf(oldToken[1]);
    assert.equal(oldValue, previous);
    tokens[index] = grid.alphabet[Math.floor(replacement / 60)] +
      grid.alphabet[replacement % 60];
  }
  const alphabet = radix === 59 ? token59 : grid.alphabet;
  const bytes = tokens.map((t) =>
    alphabet.indexOf(t[0]) * radix + alphabet.indexOf(t[1]));
  assert(bytes.every((n) => n >= 0 && n <= 255));
  return Array.from({length: 32}, (_, i) => bytes.slice(i * 8, i * 8 + 8));
}
assert.deepEqual(sourceGridRows(60, false), grid.byte_rows);

/**
 * @param {number[][]} rows
 * @param {"column"|"block"} layout
 * @param {"identity"|"reverse"|"patience"|"patienceInverse"} order
 * @returns {Buffer[]}
 */
function sectionKeys(rows, layout, order) {
  const flat = rows.flat();
  const keys = Array.from({length: 8}, (_, k) =>
    layout === "column"
      ? Buffer.from(rows.map((r) => r[k]))
      : Buffer.from(flat.slice(k * 32, k * 32 + 32)));
  assert(keys.every((b) => b.length === 32));
  const patience = [6, 5, 3, 0, 2, 4, 7, 1];
  const inverse = Array(8);
  for (let i = 0; i < 8; i++) inverse[patience[i]] = i;
  const choices = {identity: [0, 1, 2, 3, 4, 5, 6, 7],
    reverse: [7, 6, 5, 4, 3, 2, 1, 0],
    patience, patienceInverse: inverse};
  return choices[order].map((i) => keys[i]);
}

/** @param {Buffer[]} keys @returns {Uint8Array} */
function derivePads(keys) {
  const sizes = Array(8).fill(0);
  for (const e of entries) sizes[e.section]++;
  const streams = keys.map((k, i) =>
    crypto.createCipheriv("aes-256-ctr", k, Buffer.alloc(16))
      .update(Buffer.alloc(sizes[i])));
  const pads = new Uint8Array(entries.length);
  const indices = Array(8).fill(0);
  for (let i = 0; i < entries.length; i++) {
    const s = entries[i].section;
    pads[i] = streams[s][indices[s]++] % 28;
  }
  return pads;
}

/** @param {number[]} cycle @returns {Uint8Array} */
function extractRanks(cycle, input = entries.map((e) => e.glyph)) {
  const pos = Array(29);
  for (let i = 0; i < 29; i++) pos[cycle[i]] = i;
  const digits = new Uint8Array(input.length);
  let prev = omitted[0];
  for (let i = 0; i < input.length; i++) {
    const next = input[i];
    const rank = (pos[next] - pos[prev] + 28) % 29;
    assert(rank < 28);
    digits[i] = rank;
    prev = next;
  }
  return digits;
}

/** @param {Uint8Array} ranks @param {Uint8Array} pads @param {number} sign */
function unpad(ranks, pads, sign) {
  const result = new Uint8Array(ranks.length);
  for (let i = 0; i < ranks.length; i++)
    result[i] = (ranks[i] - sign * pads[i] + 28) % 28;
  return result;
}

/** @param {Uint8Array} digits @param {boolean} backwards */
function fromDigits(digits, backwards) {
  const result = Buffer.alloc((digits.length / 78) * 47);
  let out = 0;
  for (let i = 0; i < digits.length; i += 78) {
    let value = 0n;
    for (let j = 0; j < 78; j++) {
      const d = digits[i + (backwards ? 77 - j : j)];
      value = value * 28n + BigInt(d);
    }
    for (let j = 46; j >= 0; j--) {
      result[out + j] = Number(value & 255n);
      value >>= 8n;
    }
    assert.equal(value, 0n);
    out += 47;
  }
  return result;
}

/** @param {Buffer} bytes */
function measure(bytes) {
  let printable = 0, bestRun = 0, run = 0;
  for (const b of bytes) {
    if (b >= 32 && b <= 126) {
      printable++;
      if (++run > bestRun) bestRun = run;
    } else run = 0;
  }
  const trainSize = 55 * 47;
  return {
    train: bytes.subarray(0, trainSize).reduce((n, b) =>
      n + (b >= 32 && b <= 126), 0),
    held: bytes.subarray(trainSize).reduce((n, b) =>
      n + (b >= 32 && b <= 126), 0),
    printable, bestRun,
    head: bytes.subarray(0, 20).toString("hex"),
    preview: bytes.subarray(0, 100).toString("latin1")
      .replace(/[^ -~]/g, ".")
  };
}

const cycles = [];
for (const direction of [1, -1]) {
  const basic = direction === 1 ? firstSeen : [...firstSeen].reverse();
  for (let insertion = 0; insertion <= 28; insertion++) {
    const cycle = [...basic.slice(0, insertion), 18,
      ...basic.slice(insertion)];
    cycles.push({direction, insertion, cycle});
  }
}

/** @param {number[]} glyphs @param {Uint8Array} pads */
function bestOfSource(glyphs, padsByFamily, collectBest = 8) {
  const scores = [];
  for (const {direction, insertion, cycle} of cycles) {
    const ranks = extractRanks(cycle, glyphs);
    for (const family of padsByFamily) {
      for (const sign of [-1, 1]) {
        const unmasked = unpad(ranks, family.pads, sign);
        for (const backwards of [false, true]) {
          const evidence = measure(fromDigits(unmasked, backwards));
          scores.push({
            direction, insertion, radix: family.radix,
            corrected: family.corrected, layout: family.layout,
            keyOrder: family.keyOrder,
            sign, backwards, ...evidence
          });
        }
      }
    }
  }
  scores.sort((a, b) => b.train - a.train ||
    b.held - a.held || b.bestRun - a.bestRun);
  return {count: scores.length, top: scores.slice(0, collectBest),
    maxTrain: scores[0].train,
    maxHeldPostselected: scores.reduce((m, x) => Math.max(m, x.held), 0),
    maxBestRun: scores.reduce((m, x) => Math.max(m, x.bestRun), 0),
    over90pct: scores.filter((x) => x.printable >= 6980).length};
}

const families = [];
for (const radix of [60, 59]) for (const corrected of [false, true]) {
  const rows = sourceGridRows(radix, corrected);
  for (const layout of ["column", "block"])
    for (const keyOrder of ["identity", "reverse", "patience", "patienceInverse"]) {
      families.push({radix, corrected, layout, keyOrder,
        pads: derivePads(sectionKeys(rows, layout, keyOrder))});
    }
}
assert.equal(families.length, 32);

/** Make 165 exact 47-byte natural ASCII packets, with no overflow. */
function positivePlain() {
  const source = fs.readFileSync(
    path.join(root, "resources/liber-primus/lp1-plaintext-reference.txt"),
    "utf8").toUpperCase().replace(/[^A-Z ]/g, " ").replace(/ +/g, " ").trim() + " ";
  const text = source.repeat(Math.ceil(7755 / source.length)).slice(0, 7755);
  assert.equal(text.length, 7755);
  return Buffer.from(text, "ascii");
}

/** @param {Buffer} bytes */
function toDigits(bytes) {
  assert.equal(bytes.length, 7755);
  const digits = new Uint8Array(entries.length);
  for (let p = 0; p < 165; p++) {
    let value = 0n;
    for (let j = 0; j < 47; j++)
      value = (value << 8n) + BigInt(bytes[p * 47 + j]);
    for (let j = 77; j >= 0; j--) {
      digits[p * 78 + j] = Number(value % 28n);
      value /= 28n;
    }
    assert.equal(value, 0n);
  }
  assert.deepEqual(fromDigits(digits, false), bytes);
  return digits;
}

/** @param {Uint8Array} digits @param {Uint8Array} pads @param {number[]} cycle */
function encryptRanks(digits, pads, cycle) {
  const gp = [];
  let prev = 18;
  const pos = Array(29);
  for (let i = 0; i < 29; i++) pos[cycle[i]] = i;
  for (let i = 0; i < digits.length; i++) {
    const masked = (digits[i] + pads[i]) % 28;
    prev = cycle[(pos[prev] + masked + 1) % 29];
    gp.push(prev);
  }
  return gp;
}

function run() {
  const actual = bestOfSource(entries.map((e) => e.glyph), families);
  const target = cycles.find((x) => x.direction === 1 && x.insertion === 11);
  const key = families.find((x) => x.radix === 60 && !x.corrected &&
    x.layout === "column" && x.keyOrder === "identity");
  const truePlain = positivePlain();
  const planted = encryptRanks(toDigits(truePlain), key.pads, target.cycle);
  const inverse = fromDigits(unpad(extractRanks(target.cycle, planted),
    key.pads, 1), false);
  assert.deepEqual(inverse, truePlain);
  assert.equal(measure(inverse).printable, truePlain.length);
  const recovered = bestOfSource(planted, families, 2);
  assert.equal(recovered.top[0].printable, 7755);
  assert.equal(recovered.top[0].radix, 60);
  assert.equal(recovered.top[0].layout, "column");
  assert.equal(recovered.top[0].corrected, false);
  assert.equal(recovered.top[0].keyOrder, "identity");
  assert.equal(recovered.top[0].direction, 1);
  assert.equal(recovered.top[0].insertion, 11);
  assert.equal(recovered.top[0].sign, 1);
  assert.equal(recovered.top[0].backwards, false);
  const originalRunes = original.map((p) => p.indices.length);
  const retargeted = [];
  let index = 0;
  for (const p of original) {
    const arr = [];
    for (let i = 0; i < p.indices.length; i++) {
      if (i && p.indices[i] === p.indices[i - 1])
        arr.push(arr[i - 1]);
      else arr.push(planted[index++]);
    }
    retargeted.push(arr);
  }
  assert.deepEqual(retargeted.map((a) => a.length), originalRunes);
  assert.equal(index, 12870);
  let dupes = 0;
  for (const a of retargeted)
    for (let i = 1; i < a.length; i++)
      if (a[i] === a[i - 1]) dupes++;
  assert.equal(dupes, 86);
  console.log(JSON.stringify({
    model: "red79-first-occurrence + repeat-erased 78-rank/47-byte + grid section AES-CTR modulo28",
    input: {runes: 12956, markers: 86, clean: 12870,
      packets: 165, bytes: 7755, red79: firstSeen,
      missingSymbol: omitted[0], sections: starts},
    familySize: actual.count,
    auditedCells: repairs.map((x) => x[0]),
    historicalPatienceGPPrimeOrder: [6, 5, 3, 0, 2, 4, 7, 1],
    original: actual,
    plant: {fullRecoveredBytes: truePlain.length, allMarkersReproduced: dupes,
      chosen: recovered.top[0], runnerUp: recovered.top[1]}
  }, null, 2));
}
run();
