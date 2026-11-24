#!/usr/bin/env node
"use strict";

// Key-independent gate for a source-motivated 30-symbol, 5x6 rectangular
// Bifid hypothesis with odd period 13. The 30 symbols are GP29 + SPACE.
//
// Source selection being tested:
//   * p15 butterfly -> Bifid / coordinate fractionation;
//   * p0 red 13-rune span and adjacent 13-dot marker -> period 13;
//   * 2016 signed message's "path lies empty" -> SPACE is a cipher symbol;
//   * 29 GP runes + SPACE = 30 cells, a 5x6 rectangle.
//
// For odd period 13, the standard Bifid coordinate split can be interpreted
// on a 5x6 rectangle by swapping row/column orientation on odd output indices.
// The capacity bound below covers every fixed permutation of the 30-symbol
// key square, not merely a guessed keyword.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const PERIOD = 13;
const N = 30;
const SPACE = 29;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const canonical = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const GLYPHS = new Map(corpus.runes.map((r, i) => [r, i]));
const ENGLISH = new Map(corpus.translit.map((t, i) => [t, i]));

function sourceSections() {
  return canonical.split("$").slice(0, 8).map((text) => {
    const out = [];
    for (const ch of text) {
      const rune = GLYPHS.get(ch);
      if (rune !== undefined) out.push(rune);
      else if ((ch === "-" || ch === ".") && out.length && out[out.length - 1] !== SPACE) {
        out.push(SPACE);
      }
    }
    while (out[out.length - 1] === SPACE) out.pop();
    return out;
  });
}

function removeP0RedKey(parts) {
  const redRunes = [...ink.pages[0].red_spans[0].runes];
  const redIndices = redRunes.map((r) => GLYPHS.get(r));
  assert.equal(redIndices.length, 13, "p0 red key must contain 13 runes");
  const prefix = parts[0].slice(0, 15);
  assert.equal(prefix.filter((x) => x !== SPACE).length, 13);
  assert.equal(prefix.filter((x) => x === SPACE).length, 2);
  assert.deepEqual(prefix.filter((x) => x !== SPACE), redIndices,
    "first 13 p0 runes must match the annotated red span");
  // The prefix is 13 red runes, their internal word separator, and the
  // following 13-dot delimiter (serialized as the next separator).
  return [parts[0].slice(15), ...parts.slice(1)];
}


function source13DotResetSegments() {
  const pageStarts = new Map();
  let cumulativeRunes = 0;
  for (const page of corpus.pages) {
    pageStarts.set(page.page, cumulativeRunes);
    cumulativeRunes += page.runic_count;
  }
  const dotOffsets = new Set();
  for (const page of ink.pages) {
    if (page.page > 55) continue;
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13) dotOffsets.add(pageStarts.get(page.page) + mark[0]);
    }
  }

  const segments = [[]];
  const matched = [];
  let runeOffset = 0;
  for (const section of canonical.split("$").slice(0, 8)) {
    for (const ch of section) {
      const rune = GLYPHS.get(ch);
      if (rune !== undefined) {
        segments[segments.length - 1].push(rune);
        runeOffset++;
      } else if (ch === "-" || ch === ".") {
        if (ch === "." && dotOffsets.has(runeOffset)) {
          while (segments[segments.length - 1].at(-1) === SPACE) {
            segments[segments.length - 1].pop();
          }
          segments.push([]);
          matched.push(runeOffset);
        } else if (segments[segments.length - 1].length &&
                   segments[segments.length - 1].at(-1) !== SPACE) {
          segments[segments.length - 1].push(SPACE);
        }
      }
    }
    while (segments[segments.length - 1].at(-1) === SPACE) {
      segments[segments.length - 1].pop();
    }
  }

  assert.equal(runeOffset, 12956, "the eight unsolved sections must contain 12,956 runes");
  assert.equal(dotOffsets.size, 26, "expected 26 annotated 13-dot marks on p0-p55");
  assert.deepEqual(matched.slice().sort((a, b) => a - b),
    Array.from(dotOffsets).sort((a, b) => a - b),
    "every annotated 13-dot mark must match a transcription delimiter");
  assert.equal(segments[0].filter((x) => x !== SPACE).length, 13);
  assert.equal(segments[0].filter((x) => x === SPACE).length, 1,
    "the p0 red key is two words: 13 runes plus one internal separator");

  return {
    segments: segments.slice(1),
    markerCount: dotOffsets.size,
    redKeyTokens: segments[0].length
  };
}

function nativeGP30(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const two = ENGLISH.get(word.slice(i, i + 2));
      if (two !== undefined) {
        out.push(two);
        i += 2;
      } else {
        const one = ENGLISH.get(word[i]);
        if (one !== undefined) out.push(one);
        i++;
      }
    }
    out.push(SPACE);
  }
  if (out.length) out.pop();
  return out;
}

function minWindowMax(a, length) {
  assert.ok(a.length >= length, "reference shorter than requested window");
  const counts = new Int32Array(N);
  for (let i = 0; i < length; i++) counts[a[i]]++;
  let min = Math.max(...counts);
  let at = 0;
  for (let start = 1; start <= a.length - length; start++) {
    counts[a[start - 1]]--;
    counts[a[start + length - 1]]++;
    const current = Math.max(...counts);
    if (current < min) {
      min = current;
      at = start;
    }
  }
  return { min, at, windows: a.length - length + 1 };
}

function topSum(values, count) {
  return Array.from(values).sort((a, b) => b - a).slice(0, count).reduce((a, b) => a + b, 0);
}

// The inverse Bifid map: ciphertext coordinates are interleaved, split into
// two length-13 streams, then paired. Since 13 is odd, even i gives (row,col)
// and odd i gives (col,row), which is transposed back to (row,col).
function bifidDecryptBlock(block, key) {
  assert.equal(block.length, PERIOD);
  const pos = new Map(key.map((symbol, i) => [symbol, i]));
  const z = [];
  for (const symbol of block) {
    const v = pos.get(symbol);
    assert.notEqual(v, undefined);
    z.push(Math.floor(v / 6), v % 6);
  }
  const a = z.slice(0, PERIOD);
  const b = z.slice(PERIOD);
  const out = [];
  for (let i = 0; i < PERIOD; i++) {
    const row = i % 2 === 0 ? a[i] : b[i];
    const col = i % 2 === 0 ? b[i] : a[i];
    assert.ok(row < 5 && col < 6);
    out.push(key[row * 6 + col]);
  }
  return out;
}

function bifidEncryptBlock(block, key) {
  assert.equal(block.length, PERIOD);
  const pos = new Map(key.map((symbol, i) => [symbol, i]));
  const a = [];
  const b = [];
  for (let i = 0; i < PERIOD; i++) {
    const v = pos.get(block[i]);
    assert.notEqual(v, undefined);
    const row = Math.floor(v / 6);
    const col = v % 6;
    if (i % 2 === 0) {
      a.push(row);
      b.push(col);
    } else {
      a.push(col);
      b.push(row);
    }
  }
  const z = a.concat(b);
  const out = [];
  for (let j = 0; j < PERIOD; j++) {
    const row = z[2 * j];
    const col = z[2 * j + 1];
    assert.ok(row < 5 && col < 6);
    out.push(key[row * 6 + col]);
  }
  return out;
}

function transformParts(parts, key, direction) {
  return parts.map((part) => {
    const out = [];
    let start = 0;
    for (; start + PERIOD <= part.length; start += PERIOD) {
      const block = part.slice(start, start + PERIOD);
      out.push(...(direction === "encrypt"
        ? bifidEncryptBlock(block, key)
        : bifidDecryptBlock(block, key)));
    }
    // Preserve incomplete tails outside the tested full-block transform.
    out.push(...part.slice(start));
    return out;
  });
}

// Bifid inverse pair schedule: for plaintext position i, take the row
// coordinate from C[floor(i/2)] and the column from C[floor((i+13)/2)],
// swapping source order for odd i.
// Forward pair schedule: output position j takes row from C[2j mod 13]
// and column from C[(2j+1) mod 13].
function pairCapacity(parts, direction) {
  const F = Array.from({ length: N }, () => new Uint32Array(N));
  let used = 0;
  const remainders = [];
  for (const part of parts) {
    let start = 0;
    for (; start + PERIOD <= part.length; start += PERIOD) {
      const block = part.slice(start, start + PERIOD);
      for (let i = 0; i < PERIOD; i++) {
        let rowSource;
        let colSource;
        if (direction === "decrypt") {
          const p = Math.floor(i / 2);
          const q = Math.floor((i + PERIOD) / 2);
          rowSource = i % 2 === 0 ? block[p] : block[q];
          colSource = i % 2 === 0 ? block[q] : block[p];
        } else {
          rowSource = block[(2 * i) % PERIOD];
          colSource = block[(2 * i + 1) % PERIOD];
        }
        F[rowSource][colSource]++;
        used++;
      }
    }
    remainders.push(part.length - start);
  }
  // For one plaintext cell, its source pairs lie in a 6-symbol row x
  // 5-symbol column rectangle: 30 ordered pairs. Relax row/column
  // disjointness independently to obtain a key-independent upper bound.
  const rowRelax = topSum(F.map((row) => topSum(row, 5)), 6);
  const colRelax = topSum(
    Array.from({ length: N }, (_, col) => topSum(F.map((row) => row[col]), 6)),
    5
  );
  return {
    used,
    remainders,
    rowRelax,
    colRelax,
    cap: Math.min(rowRelax, colRelax)
  };
}

function largestSymbolFrequency(a) {
  const counts = new Int32Array(N);
  for (const x of a) counts[x]++;
  return Math.max(...counts);
}

function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function positiveControl(source, dotResetLengths) {
  const rand = xorshift(0x3301b1f1);
  const key = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [key[i], key[j]] = [key[j], key[i]];
  }

  const globalPlain = source.slice(0, 15834);
  assert.equal(globalPlain.length, 15834);
  const globalCipher = transformParts([globalPlain], key, "encrypt")[0];
  const globalRecovered = transformParts([globalCipher], key, "decrypt")[0];
  assert.deepEqual(globalRecovered, globalPlain);
  const globalBound = pairCapacity([globalCipher], "decrypt").cap;
  assert.ok(globalBound >= largestSymbolFrequency(globalPlain));

  const sectionLengths = [871, 1391, 2119, 2327, 1235, 1755, 2054, 4043];
  const sectionPlain = [];
  let offset = 0;
  for (const length of sectionLengths) {
    sectionPlain.push(source.slice(offset, offset + length));
    offset += length;
  }
  const sectionCipher = transformParts(sectionPlain, key, "encrypt");
  const sectionRecovered = transformParts(sectionCipher, key, "decrypt");
  assert.deepEqual(sectionRecovered, sectionPlain);
  const sectionBound = pairCapacity(sectionCipher, "decrypt").cap;
  assert.ok(sectionBound >= largestSymbolFrequency(sectionPlain.flat()));

  // Validate the opposite transform direction independently.
  const reverseCipher = transformParts([globalPlain], key, "decrypt")[0];
  const reverseRecovered = transformParts([reverseCipher], key, "encrypt")[0];
  assert.deepEqual(reverseRecovered, globalPlain);
  const reverseBound = pairCapacity([reverseCipher], "encrypt").cap;
  assert.ok(reverseBound >= largestSymbolFrequency(globalPlain));


    const dotPlain = [];
  offset = 0;
  for (const length of dotResetLengths) {
    dotPlain.push(source.slice(offset, offset + length));
    offset += length;
  }
  const dotCipher = transformParts(dotPlain, key, "encrypt");
  const dotRecovered = transformParts(dotCipher, key, "decrypt");
  assert.deepEqual(dotRecovered, dotPlain);
  const dotBound = pairCapacity(dotCipher, "decrypt").cap;
  assert.ok(dotBound >= largestSymbolFrequency(dotPlain.flat()));

  return {
    keyPermutation: key,
    global: {
      length: globalPlain.length,
      exactRoundTrip: true,
      boundAdmitsPlaintext: globalBound,
      plaintextMaxFrequency: largestSymbolFrequency(globalPlain)
    },
    sectionReset: {
      lengths: sectionLengths,
      exactRoundTrip: true,
      boundAdmitsPlaintext: sectionBound,
      plaintextMaxFrequency: largestSymbolFrequency(sectionPlain.flat())
    },
    reverseDirection: {
      exactRoundTrip: true,
      boundAdmitsPlaintext: reverseBound,
      plaintextMaxFrequency: largestSymbolFrequency(globalPlain)
    },
    dotReset: {
      lengths: dotResetLengths,
      exactRoundTrip: true,
      boundAdmitsPlaintext: dotBound,
      plaintextMaxFrequency: largestSymbolFrequency(dotPlain.flat())
    }
  };
}

function main() {
  const sections = sourceSections();
  const body = removeP0RedKey(sections);
  const full = { global: [sections.flat()], section: sections };
  const bodyOnly = { global: [body.flat()], section: body };
  const dotResetData = source13DotResetSegments();
  const dotReset = { "13-dot": dotResetData.segments };
  const references = {
    Shakespeare: nativeGP30(read("resources/control/shakespeare_first300k.txt")),
    Gibran: nativeGP30(read("resources/control/gibran_prophet_58585.txt")),
    Emerson: nativeGP30(read("resources/control/emerson_essays_2944.txt"))
  };
  const output = {
    hypothesis: "30-symbol GP29+SPACE, 5x6 rectangular Bifid, period 13",
    sourceSectionLengths: sections.map((x) => x.length),
    bodySectionLengthsAfterP0KeyAndDelimiter: body.map((x) => x.length),
    p0RedRuneCount: ink.pages[0].red_spans[0].runes.length,
    p0RedKeyTokens: dotResetData.redKeyTokens,
    annotated13DotResetCount: dotResetData.markerCount,
    13DotResetSegmentLengths: dotResetData.segments.map((x) => x.length),
    period: PERIOD,
    cases: {}
  };

  for (const [scope, configs] of Object.entries({ full, bodyOnly, dotReset })) {
    output.cases[scope] = {};
    for (const [clock, parts] of Object.entries(configs)) {
      output.cases[scope][clock] = {};
      for (const direction of ["decrypt", "encrypt"]) {
        const bound = pairCapacity(parts, direction);
        const controls = {};
        for (const [name, text] of Object.entries(references)) {
          controls[name] = minWindowMax(text, bound.used);
        }
        const minimumReference = Math.min(...Object.values(controls).map((x) => x.min));
        output.cases[scope][clock][direction] = {
          ...bound,
          controls,
          minimumReference,
          excluded: bound.cap < minimumReference
        };
      }
    }
  }

  // Every tested original-text scope and direction must be excluded.
  for (const scope of Object.values(output.cases)) {
    for (const clock of Object.values(scope)) {
      for (const result of Object.values(clock)) assert.equal(result.excluded, true);
    }
  }

  const dotResetLengths = dotResetData.segments.map((part) =>
    Math.floor(part.length / PERIOD) * PERIOD);
  output.positiveControl = positiveControl(references.Shakespeare, dotResetLengths);
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}

main();
