"use strict";

/**
 * Source-locked audit of a proposed LP2 non-GP register:
 *   - 13-dot-delimited, variable-width base-29 integer fragments -> bytes;
 *   - a reversible 32x8 state/class -> 5-bit Base32 register.
 *
 * No key search, language-model fitting, or free parameter sweep.
 * Run: node sims/state_class_nongp_register_audit.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const GRID_PATH = "resources/liber-primus/base60-grid.json";
const CORPUS_PATH = "resources/liber-primus/lp2-corpus.json";
const INK_PATH = "resources/liber-primus/lp2-ink-annotations.json";
const grid = JSON.parse(read(GRID_PATH)).byte_rows;
const corpus = JSON.parse(read(CORPUS_PATH));
const ink = JSON.parse(read(INK_PATH));
const N = 29;
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

assert.equal(grid.length, 32);
assert.ok(grid.every(row => row.length === 8));
assert.ok(grid.flat().every(x => Number.isInteger(x) && x >= 0 && x <= 255));

function permutations(items) {
  if (items.length === 0) return [[]];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const tail of permutations(rest)) out.push([items[i], ...tail]);
  }
  return out;
}
const perms4 = permutations([0, 1, 2, 3]);
assert.equal(perms4.length, 24);
const inversePerms4 = perms4.map(p => {
  const inv = [];
  p.forEach((v, i) => { inv[v] = i; });
  return inv;
});
const mod = (x, n) => ((x % n) + n) % n;

/** Eight transition classes: seven quartiles of four non-predecessors + repeat. */
function transitionClass(current, predecessor) {
  if (current === predecessor) return 7;
  const rank = current - (current > predecessor ? 1 : 0);
  return Math.floor(rank / 4);
}

/**
 * Frozen lossless completion of the 32x8 proposal:
 * columns 0..6 select a 4! permutation (byte mod 24);
 * column 7 selects one of the four reserved repeat codes (28..31).
 * Codes 0..27 carry the seven four-symbol quartiles.
 */
function encodeTransition(state, current, direction = "forward") {
  const predecessor = state % N;
  if (current === predecessor) return 28 + (grid[state][7] % 4);
  const rank = current - (current > predecessor ? 1 : 0);
  const q = Math.floor(rank / 4);
  const within = rank % 4;
  const permutationIndex = grid[state][q] % 24;
  const permutation = direction === "forward"
    ? perms4[permutationIndex] : inversePerms4[permutationIndex];
  return 4 * q + permutation[within];
}

function decodeTransition(state, code, direction = "forward") {
  const predecessor = state % N;
  if (code >= 28) {
    assert.equal(code, 28 + (grid[state][7] % 4), "invalid repeat code for state");
    return predecessor;
  }
  const q = Math.floor(code / 4);
  const mappedWithin = code % 4;
  const permutationIndex = grid[state][q] % 24;
  const inverse = direction === "forward"
    ? inversePerms4[permutationIndex] : perms4[permutationIndex];
  const within = inverse[mappedWithin];
  const rank = 4 * q + within;
  return rank + (rank >= predecessor ? 1 : 0);
}

/** Convert a base-29 digit block to the unique fixed-width big-endian integer bytes. */
function base29BlockBytes(digits, reverseDigits = false) {
  const seq = reverseDigits ? digits.slice().reverse() : digits;
  let value = 0n;
  for (const d of seq) value = value * 29n + BigInt(d);
  const cardinality = 29n ** BigInt(seq.length);
  let width = 0;
  let capacity = 1n;
  while (capacity < cardinality) {
    capacity *= 256n;
    width++;
  }
  const out = Buffer.alloc(width);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return out;
}

function byteStats(buffer) {
  const counts = new Uint32Array(256);
  for (const b of buffer) counts[b]++;
  let entropy = 0;
  for (const n of counts) if (n) {
    const p = n / buffer.length;
    entropy -= p * Math.log2(p);
  }
  let printable = 0, longestRun = 0, run = 0;
  for (const b of buffer) {
    const ok = b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126);
    if (ok) { printable++; run++; longestRun = Math.max(longestRun, run); }
    else run = 0;
  }
  const head = buffer.subarray(0, 32).toString("hex");
  const signatures = [
    ["ZIP", "504b0304"], ["GZIP", "1f8b08"], ["ZLIB", "789c"],
    ["PDF", "25504446"], ["PNG", "89504e47"], ["JPEG", "ffd8ff"],
    ["XML", "3c3f786d6c"], ["BMP", "424d"]
  ].filter(([, hex]) => head.startsWith(hex)).map(([name]) => name);
  return {
    bytes: buffer.length,
    shannon_bits_per_byte: entropy,
    unique_byte_values: counts.filter(Boolean).length,
    printable_fraction: printable / buffer.length,
    longest_printable_run: longestRun,
    first32_hex: head,
    common_file_signature_at_offset0: signatures
  };
}

function packFiveBit(codes) {
  const out = [];
  let accumulator = 0, bitCount = 0;
  for (const code of codes) {
    assert.ok(code >= 0 && code < 32);
    accumulator = (accumulator << 5) | code;
    bitCount += 5;
    while (bitCount >= 8) {
      bitCount -= 8;
      out.push((accumulator >> bitCount) & 255);
      accumulator &= (1 << bitCount) - 1;
    }
  }
  return Buffer.from(out);
}

function main() {
  const pageStarts = new Map();
  const globalPages = [];
  const allRunes = [];
  for (const p of corpus.pages) {
    pageStarts.set(p.page, allRunes.length);
    for (const r of p.indices || []) {
      allRunes.push(r);
      globalPages.push(p.page);
    }
  }
  const unknownPages = corpus.pages.filter(p => p.page <= 55 && (p.indices || []).length);
  const unknownRunes = unknownPages.reduce((n, p) => n + p.indices.length, 0);
  assert.equal(unknownPages.length, 55);
  assert.equal(unknownRunes, 12956);

  const marks = [];
  for (const p of ink.pages) {
    for (const [offset, dots, color] of p.large_punctuation || []) {
      marks.push({
        pos: pageStarts.get(p.page) + offset,
        page: p.page, offset, dots, color
      });
    }
  }
  marks.sort((a, b) => a.pos - b.pos);
  const marks13 = marks.filter(m => m.dots === 13);
  assert.equal(marks13.length, 31);

  const repeats = [];
  const pageInitialPositions = [];
  for (const p of unknownPages) {
    const start = pageStarts.get(p.page);
    pageInitialPositions.push(start);
    for (let i = 1; i < p.indices.length; i++) {
      if (p.indices[i] === p.indices[i - 1]) {
        repeats.push({ pos: start + i, page: p.page, rune: p.indices[i] });
      }
    }
  }
  assert.equal(repeats.length, 86);
  const markerPositions = new Set(marks13.filter(m => m.pos < unknownRunes).map(m => m.pos));
  const pageInitialSet = new Set(pageInitialPositions);
  const repeatAtPageInitial = repeats.filter(r => pageInitialSet.has(r.pos)).length;
  const repeatAtMarkerOrAdjacent = repeats.filter(r =>
    markerPositions.has(r.pos) || markerPositions.has(r.pos - 1)
  ).length;

  // The 31 marks produce 32 segments; the first 28 contain all 12,956 unknown runes.
  const cuts = [0, ...marks13.map(m => m.pos), allRunes.length];
  const segments = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    segments.push(allRunes.slice(cuts[i], cuts[i + 1]));
  }
  assert.equal(segments.length, 32);
  const unknownSegments = segments.slice(0, 28);
  assert.equal(unknownSegments.reduce((n, s) => n + s.length, 0), unknownRunes);
  const fragmentLengths = unknownSegments.map(s => s.length);
  const base29BE = Buffer.concat(unknownSegments.map(s => base29BlockBytes(s, false)));
  const base29LE = Buffer.concat(unknownSegments.map(s => base29BlockBytes(s, true)));

  // Key-independent obstruction: 29 transition inputs collapse to eight classes.
  const classCardinalities = [];
  for (let state = 0; state < 32; state++) {
    const counts = Array(8).fill(0);
    for (let current = 0; current < N; current++) {
      counts[transitionClass(current, state % N)]++;
    }
    classCardinalities.push(counts);
    assert.deepEqual(counts, [4, 4, 4, 4, 4, 4, 4, 1]);
  }

  // The direct table-cell byte is only a key/class lookup, not a lossless output.
  const directBytes = [];
  let state = 0, previousPage = null, markIndex = 0;
  const unknownMarks13 = marks13.filter(m => m.pos < unknownRunes);
  for (let j = 0; j < unknownRunes; j++) {
    while (markIndex < unknownMarks13.length && unknownMarks13[markIndex].pos === j) {
      state = unknownMarks13[markIndex].color === "black" ? 31 : 13;
      markIndex++;
    }
    const page = globalPages[j], current = allRunes[j];
    if (page !== previousPage) {
      state = current; previousPage = page;
      continue; // page-initial rune is the visible IV
    }
    const q = transitionClass(current, state % N);
    directBytes.push(grid[state][q]);
    state = current;
  }

  // Verify the frozen five-bit completion is bijective for every state/input.
  let nativeTransitions = 0;
  for (let s = 0; s < 32; s++) {
    const seen = new Set();
    for (let current = 0; current < N; current++) {
      for (const direction of ["forward", "inverse"]) {
        const code = encodeTransition(s, current, direction);
        assert.equal(decodeTransition(s, code, direction), current);
        if (direction === "forward") seen.add(code);
        nativeTransitions++;
      }
    }
    assert.equal(seen.size, 29);
  }

  function makeFiveBitRegister(direction) {
    const codes = [];
    let rowState = 0, lastPage = null, markerIndex = 0;
    for (let j = 0; j < unknownRunes; j++) {
      while (markerIndex < unknownMarks13.length && unknownMarks13[markerIndex].pos === j) {
        rowState = unknownMarks13[markerIndex].color === "black" ? 31 : 13;
        markerIndex++;
      }
      const page = globalPages[j], current = allRunes[j];
      if (page !== lastPage) {
        rowState = current;
        lastPage = page;
        continue; // visible page-initial IV is not part of the register
      }
      codes.push(encodeTransition(rowState, current, direction));
      rowState = current; // ciphertext feedback: next row is previous visible GP rune
    }
    return codes;
  }

  const registerVariants = {};
  for (const direction of ["forward", "inverse"]) {
    const codes = makeFiveBitRegister(direction);
    const base32Text = codes.map(c => BASE32[c]).join("");
    const bytes = packFiveBit(codes);
    const residue = codes.length % 8;
    const paddingBits = residue === 5 ? 3 : null;
    registerVariants[direction] = {
      symbols: codes.length,
      base32_length_mod_8: residue,
      final_symbol_code: codes[codes.length - 1],
      final_padding_bits: paddingBits,
      final_padding_value: paddingBits === null ? null : (codes[codes.length - 1] & 7),
      canonical_unpadded_base32_padding:
        [0, 2, 4, 5, 7].includes(residue) &&
        (residue !== 5 || (codes[codes.length - 1] & 7) === 0),
      base32_prefix: base32Text.slice(0, 80),
      base32_suffix: base32Text.slice(-40),
      decoded_byte_stats: byteStats(bytes)
    };
  }

  const sourceHashes = {};
  for (const name of [GRID_PATH, CORPUS_PATH, INK_PATH]) {
    sourceHashes[name] = crypto.createHash("sha256").update(read(name)).digest("hex");
  }

  return {
    claim: "No source-selected non-GP plaintext register recovered; the frozen 32x8 Base32 completion is invertible but produces random-like bytes.",
    source_sha256: sourceHashes,
    source_counts: {
      grid_rows: grid.length,
      grid_columns: grid[0].length,
      total_LP2_runes: allRunes.length,
      unknown_pages_with_runes: unknownPages.length,
      unknown_runes: unknownRunes,
      page_initial_IVs: pageInitialPositions.length,
      all_13_dot_marks: marks13.length,
      13_dot_marks_inside_unknown_stream: unknownMarks13.length,
      adjacent_equal_runes_within_pages: repeats.length,
      repeats_at_page_initials: repeatAtPageInitial,
      repeats_at_or_immediately_after_13_dot_marks: repeatAtMarkerOrAdjacent
    },
    fragmentwise_base29_integer: {
      fragment_count: segments.length,
      unknown_fragment_count: unknownSegments.length,
      unknown_fragment_lengths: fragmentLengths,
      fixed_width_big_endian: byteStats(base29BE),
      fixed_width_little_endian: byteStats(base29LE)
    },
    direct_32x8_lookup: {
      output_bytes: directBytes.length,
      stats: byteStats(Buffer.from(directBytes)),
      classes_per_state: classCardinalities[0]
    },
    five_bit_state_class_register: {
      construction: "state=previous ciphertext GP rune; 13-dot red reset=13, black reset=31; columns 0..6 select lexicographic S4 permutation by byte mod 24; column 7 selects repeat code 28+(byte mod 4); omit 55 visible page-initial IVs",
      bijection_control: {
        tested_state_input_pairs: nativeTransitions / 2,
        all_32_states_bijective: true
      },
      variants: registerVariants
    }
  };
}

if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = { main, encodeTransition, decodeTransition };
