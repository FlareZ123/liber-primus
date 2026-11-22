"use strict";
/**
 * Single-file source-first test: Node22, Windows-compatible CommonJS.
 * Original PARABLE clause prime ordinals select a 5x5 p50 grid tile;
 * consume the 75 complete-word glyphs on p55 under a direct Hill5 inverse.
 *
 * Run: node sims/lp2_p57_parable_p50_tile_p55_hill5_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} filename */
const read = filename => fs.readFileSync(path.join(root, filename), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const gpLatin = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
const M = 29;
/** @param {number} n */
const mod = n => ((n % M) + M) % M;

/* Recover the contemporary prime-weight clause sums from the full parable
 * and source chart, before reading p50 or selecting p55.
 */
const p57 = gp.pages[57].indices;
assert.equal(p57.length, 95);
const clauses = [p57.slice(7, 37), p57.slice(37, 67), p57.slice(67, 95)];
assert.deepEqual(clauses.map(x => x.length), [30, 30, 28]);
const clauseSums = clauses.map(s => s.reduce((a, i) => a + gp.prime[i], 0));
assert.deepEqual(clauseSums, [1259, 1031, 1229]);
assert.equal(clauseSums.reduce((a, b) => a * b, 1), 1595277641);
/** @param {number} n */
function primeRank(n) {
  let rank = 0;
  for (let candidate = 2; candidate <= n; candidate++) {
    let isPrime = true;
    for (let k = 2; k * k <= candidate; k++) {
      if (candidate % k === 0) { isPrime = false; break; }
    }
    if (isPrime) rank++;
  }
  return rank;
}
const ranks = clauseSums.map(primeRank);
assert.deepEqual(ranks, [205, 173, 201]);
const allTokens = grid.pages.flatMap(p => p.tokens);
assert.equal(allTokens.length, 256);
const cell = i => allTokens[i];
assert.deepEqual(ranks.map(cell), ["1G", "1v", "1E"]);
const positions = ranks.map(i => [Math.floor(i / 8), i % 8]);
assert.deepEqual(positions, [[25, 5], [21, 5], [25, 1]]);
const fourthCorner = 21 * 8 + 1;
assert.equal(fourthCorner, 169);
assert.equal(cell(fourthCorner), "3m");
const tile = Array.from({length: 5}, (_, r) =>
  Array.from({length: 5}, (_, col) => allTokens[(21 + r) * 8 + (1 + col)]));
assert.deepEqual(tile, [
  ["3m", "4E", "0s", "2S", "1v"],
  ["2B", "2k", "2t", "2O", "0e"],
  ["2a", "0J", "1L", "0c", "3C"],
  ["2Z", "2d", "1T", "2u", "1t"],
  ["1E", "3T", "18", "3E", "1G"],
]);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");
assert.equal(base60.length, 60);
assert.equal(base59.length, 59);
/** @param {string} token @param {number} radix */
function readToken(token, radix) {
  const alphabet = radix === 59 ? base59 : base60;
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  return radix * a + b;
}
assert.deepEqual([205, 173, 201, 169].map(cell).map(t => readToken(t, 59)),
  [75, 115, 73, 224]);

/* A new independently checkable original-source relation: the source-selected
 * tile totals and peeled center reproduce the historical Cicada magic-square
 * row totals and phi(1033) under base59. This was noticed after the tile was
 * identified, so it is an arithmetic clue candidate, not an author instruction.
 */
/** @param {number} n */
function phi(n) {
  let value = n;
  for (let p = 2; p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      value -= value / p;
    }
  }
  return value;
}
/** @param {number} radix @param {string[][]} block */
function numeralMatrix(radix, block) {
  return block.map(row => row.map(token => readToken(token, radix)));
}
/** @param {number[][]} a */
const total = a => a.flat().reduce((s, n) => s + n, 0);
/** @param {number[][]} a */
const center = a => total(a.slice(1, 4).map(row => row.slice(1, 4)));
const originalSquares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/u)
  .map(section => section.trim().split(/\r?\n/u)
    .map(row => row.trim().split(/\s+/u).map(Number)));
assert.deepEqual(originalSquares.map(s => s.length), [5, 7, 5]);
assert.deepEqual(originalSquares.map(s => sumNumbers(s[0])), [3301, 1033, 1033]);
assert.equal(originalSquares[2][2][2], 91);
assert.equal(phi(1033), 1032);
assert.equal(total(numeralMatrix(59, tile)), 3210);
assert.equal(center(numeralMatrix(59, tile)), 1032);
assert.equal(total(numeralMatrix(60, tile)), 3258);
assert.equal(center(numeralMatrix(60, tile)), 1047);
assert.equal(3210 + originalSquares[2][2][2], 3301);
assert.equal(center(numeralMatrix(59, tile)), phi(sumNumbers(originalSquares[1][0])));
/** @param {number[]} a */
function sumNumbers(a) {return a.reduce((s, x) => s + x, 0);}
const allWindows = [];
for (let row = 0; row <= 27; row++) {
  for (let col = 0; col <= 3; col++) {
    const block = Array.from({length: 5}, (_, dr) =>
      Array.from({length: 5}, (_, dc) => allTokens[(row + dr) * 8 + col + dc]));
    const values = numeralMatrix(59, block);
    allWindows.push({row, col, sum: total(values), inner: center(values)});
  }
}
assert.equal(allWindows.length, 112);
assert.deepEqual(allWindows.filter(x => x.sum === 3210 && x.inner === 1032),
  [{row: 21, col: 1, sum: 3210, inner: 1032}]);


/** @param {number[][]} source @returns {number[][]} */
function invert(source) {
  const n = source.length;
  const a = source.map((row, i) => [
    ...row.map(mod), ...Array.from({length: n}, (_, j) => i === j ? 1 : 0),
  ]);
  for (let col = 0; col < n; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    assert(pivot >= 0, "source matrix must be nonsingular");
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const pivotInverse = Array.from({length: M}, (_, i) => i)
      .find(x => mod(x * a[col][col]) === 1);
    assert.notEqual(pivotInverse, undefined);
    a[col] = a[col].map(x => mod(x * pivotInverse));
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = a[r][col];
      a[r] = a[r].map((x, j) => mod(x - factor * a[col][j]));
    }
  }
  return a.map(row => row.slice(n));
}
/**
 * Natural Hill vectors of 5 source runes each, with either column or row
 * convention; no rotation, phase fitting or plaintext-dependent choices.
 * @param {number[][]} matrix
 * @param {number[]} input
 * @param {"col"|"row"} convention
 */
function apply(matrix, input, convention) {
  assert.equal(input.length % 5, 0);
  const output = [];
  for (let start = 0; start < input.length; start += 5) {
    const v = input.slice(start, start + 5);
    for (let j = 0; j < 5; j++) {
      let n = 0;
      for (let i = 0; i < 5; i++) {
        n += (convention === "col" ? matrix[j][i] : matrix[i][j]) * v[i];
      }
      output.push(mod(n));
    }
  }
  return output;
}
/** @param {number[]} input */
function normalizedIC(input) {
  const hist = Array(M).fill(0);
  for (const k of input) hist[k]++;
  return M * hist.reduce((a, b) => a + b * (b - 1), 0) /
    (input.length * (input.length - 1));
}
/** @param {string} str @returns {number[]|null} */
function native(str) {
  const word = str.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (word.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const next = gpLatin.find(x => word.startsWith(x.s, i));
    if (!next) return null;
    out.push(next.i);
    i += next.s.length;
  }
  return out;
}
const dictionary = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
  const match = /^([a-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const v = native(match[1]);
  if (v) dictionary.add(v.join(","));
}
assert.equal(dictionary.size, 29060);

/* Canonical corpus includes the blank p50, but the historical rune
 * transcription omits p50; therefore physical p55 is transcript slot54.
 * Explicit equality check prevents an off-by-one false word-boundary test.
 */
assert.equal(gp.pages[55].indices.length, 76);
assert.deepEqual([...transcription[54]].filter(c => runeIndex.has(c))
  .map(c => runeIndex.get(c)), gp.pages[55].indices);
const body = gp.pages[55].indices.slice(1);
assert.equal(body.length, 75);
assert.equal(body[0], gp.pages[55].indices[1]);
assert.equal(gp.pages[55].indices[0], 21); // carried NG from p54
const wordPositions = [];
let offset = 0, word = [];
for (const c of transcription[54]) {
  const v = runeIndex.get(c);
  if (v !== undefined) {
    if (offset > 0) word.push(offset - 1);
    offset++;
  } else if ("-.$&§".includes(c)) {
    if (word.length) wordPositions.push(word);
    word = [];
  }
}
if (word.length) wordPositions.push(word);
assert.equal(offset, 76);
assert.deepEqual(wordPositions.map(w => w.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const longWords = wordPositions.filter(w => w.length >= 4);
assert.equal(longWords.length, 9);

/* 75 native-clear p57 symbols are the untouched positive source. */
const plant = gp.pages[57].indices.slice(0, 75);
assert.equal(plant.length, 75);
const results = [];
for (const radix of [59, 60]) {
  const matrix = tile.map(row => row.map(t => mod(readToken(t, radix))));
  const inverse = invert(matrix);
  for (const convention of ["col", "row"]) {
    const plaintext = apply(inverse, body, convention);
    assert.deepEqual(apply(matrix, plaintext, convention), body);
    assert.deepEqual(apply(inverse, apply(matrix, plant, convention), convention), plant);
    const hitCount = longWords.filter(word =>
      dictionary.has(word.map(i => plaintext[i]).join(","))).length;
    assert.equal(hitCount, 0);
    results.push({
      radix,
      convention,
      normalizedIC: normalizedIC(plaintext),
      longWords: longWords.length,
      dictionaryHits: hitCount,
      prefix: plaintext.slice(0, 35).map(i => gp.translit[i]).join(""),
    });
  }
}
assert.equal(results.length, 4);
assert.deepEqual(results.map(r => Math.round(r.normalizedIC * 1e12)), [
  982342342342, 1055495495495, 836036036036, 982342342342,
]);

/* The totient identity provides a historically motivated *new key
 * representation*, distinct from raw token values. Try exactly a repeated
 * 25-glyph phi-pad, both additive signs, and a phi(Hill5) matrix for both
 * vector conventions. Word punctuation and all original positions stay fixed.
 */
const phiResults = [];
for (const radix of [59, 60]) {
  const phiKey = numeralMatrix(radix, tile).map(row => row.map(x => mod(phi(x))));
  const tape = phiKey.flat();
  for (const sign of [-1, 1]) {
    const candidate = body.map((c, i) => mod(c + sign * tape[i % tape.length]));
    assert.deepEqual(candidate.map((p, i) => mod(p - sign * tape[i % tape.length])), body);
    const clearEncrypted = plant.map((p, i) => mod(p - sign * tape[i % tape.length]));
    assert.deepEqual(clearEncrypted.map((c, i) => mod(c + sign * tape[i % tape.length])), plant);
    const hits = longWords.filter(w => dictionary.has(w.map(i => candidate[i]).join(","))).length;
    assert.equal(hits, 0);
    phiResults.push({radix, kind: "phi25_additive", sign, normalizedIC: normalizedIC(candidate),
      dictionaryHits: hits});
  }
  const phiInverse = invert(phiKey);
  for (const convention of ["col", "row"]) {
    const candidate = apply(phiInverse, body, convention);
    assert.deepEqual(apply(phiKey, candidate, convention), body);
    assert.deepEqual(apply(phiInverse, apply(phiKey, plant, convention), convention), plant);
    const hits = longWords.filter(w => dictionary.has(w.map(i => candidate[i]).join(","))).length;
    assert.equal(hits, 0);
    phiResults.push({radix, kind: "phi_hill5", convention,
      normalizedIC: normalizedIC(candidate), dictionaryHits: hits});
  }
}
assert.equal(phiResults.length, 8);


/* Applying the *same* source-selected 5x5 tile to p32 has a distinct
 * source-image motivation: first-party p32 (49.jpg) is a visibly blurred
 * version of p55's detailed central tree (72.jpg), and the printed PARABLE
 * instructs shedding circumferences. The center of the key window is 1L.
 * Under the debated base59 reading it is 80, and phi(80)=32 selects p32;
 * base60 instead gives 81 and phi(81)=54, the separate tree-side-art p54.
 * This is a conditional navigation clue, not author authentication.
 */
const tileCenter = tile[2][2];
assert.equal(tileCenter, "1L");
assert.equal(23 * 8 + 3, 187);
assert.equal(allTokens[187], tileCenter);
assert.equal(readToken(tileCenter, 59), 80);
assert.equal(phi(readToken(tileCenter, 59)), 32);
assert.equal(readToken(tileCenter, 60), 81);
assert.equal(phi(readToken(tileCenter, 60)), 54);
/** @param {number[][]} square @param {number[]} source */
function matVec(square, source) {
  assert.equal(square.length, source.length);
  return square.map(row => mod(row.reduce((s, a, i) => s + a * source[i], 0)));
}
/**
 * Correlation-form 5x5 zero-boundary 2D convolution on a row-major 11x11
 * GP29 symbol field. The key is fixed by the source prime-ranked p50 window.
 * @param {number[][]} kernel
 */
function blurMatrix(kernel) {
  const result = Array.from({length: 121}, () => Array(121).fill(0));
  for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const y = r + i - 2, x = c + j - 2;
      if (y >= 0 && y < 11 && x >= 0 && x < 11) {
        result[r * 11 + c][y * 11 + x] = kernel[i][j];
      }
    }
  }
  return result;
}
assert.equal(gp.pages[32].indices.length, 121);
const page32Cipher = gp.pages[32].indices;
const page32ClearPlant = Array.from({length: 121}, (_, i) => p57[i % p57.length]);
const blurResults = [];
for (const radix of [59, 60]) {
  for (const values of ["raw", "phi"]) {
    const kernel = numeralMatrix(radix, tile).map(row =>
      row.map(x => mod(values === "phi" ? phi(x) : x)));
    const matrix = blurMatrix(kernel);
    const inv = invert(matrix);
    const out = matVec(inv, page32Cipher);
    assert.deepEqual(matVec(matrix, out), page32Cipher);
    assert.deepEqual(matVec(inv, matVec(matrix, page32ClearPlant)), page32ClearPlant);
    blurResults.push({
      radix, values, normalizedIC: normalizedIC(out),
      prefix: out.slice(0, 40).map(i => gp.translit[i]).join(""),
    });
  }
}
assert.deepEqual(blurResults.map(r => Math.round(r.normalizedIC * 1e12)), [
  1010606060606, 1022589531680, 1074517906336, 1026584022039,
]);


/* The same p32 page has one genuine carried opening rune from p31.
 * Dropping that printed carry leaves exactly 120 intact glyphs = 24x5,
 * so the source-selected 5x5 tile is a direct Hill5/pad key on this p32
 * receiver too. Keep the original word breaks to check native language.
 */
assert.equal(page32Cipher[0], 20); // printed single carried L rune
const body32 = page32Cipher.slice(1);
assert.equal(body32.length, 120);
assert.deepEqual([...transcription[32]].filter(ch => runeIndex.has(ch))
  .map(ch => runeIndex.get(ch)), page32Cipher);
const page32Words = [];
let page32Offset = 0, page32Word = [];
for (const ch of transcription[32]) {
  const rune = runeIndex.get(ch);
  if (rune !== undefined) {
    if (page32Offset > 0) page32Word.push(page32Offset - 1);
    page32Offset++;
  } else if ("-.$&§".includes(ch)) {
    if (page32Word.length) page32Words.push(page32Word);
    page32Word = [];
  }
}
if (page32Word.length) page32Words.push(page32Word);
assert.equal(page32Offset, 121);
assert.deepEqual(page32Words.map(x => x.length),
  [3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4].map(Number));
const long32 = page32Words.filter(w => w.length >= 4);
assert.equal(long32.length, 16);
const plant32 = Array.from({length: 120}, (_, i) => p57[i % p57.length]);
const direct32Results = [];
for (const radix of [59, 60]) {
  const literal = numeralMatrix(radix, tile);
  for (const representation of ["raw", "phi"]) {
    const matrix = literal.map(row => row.map(x => mod(representation === "phi" ? phi(x) : x)));
    const inverse = invert(matrix);
    for (const convention of ["col", "row"]) {
      const candidate = apply(inverse, body32, convention);
      assert.deepEqual(apply(matrix, candidate, convention), body32);
      assert.deepEqual(apply(inverse, apply(matrix, plant32, convention), convention), plant32);
      const hits = long32.filter(w => dictionary.has(w.map(i => candidate[i]).join(","))).length;
      assert.equal(hits, 0);
      direct32Results.push({radix, representation, mode: "Hill5", convention,
        normalizedIC: normalizedIC(candidate), dictionaryHits: hits});
    }
    const tape = matrix.flat();
    for (const sign of [-1, 1]) {
      const candidate = body32.map((x, i) => mod(x + sign * tape[i % 25]));
      assert.deepEqual(candidate.map((x, i) => mod(x - sign * tape[i % 25])), body32);
      const encryptedPlant = plant32.map((x, i) => mod(x - sign * tape[i % 25]));
      assert.deepEqual(encryptedPlant.map((x, i) => mod(x + sign * tape[i % 25])), plant32);
      const hits = long32.filter(w => dictionary.has(w.map(i => candidate[i]).join(","))).length;
      assert.equal(hits, 0);
      direct32Results.push({radix, representation, mode: "period25", sign,
        normalizedIC: normalizedIC(candidate), dictionaryHits: hits});
    }
  }
}
assert.equal(direct32Results.length, 16);
assert.equal(Math.max(...direct32Results.map(r => r.dictionaryHits)), 0);
assert(Math.abs(Math.max(...direct32Results.map(r => r.normalizedIC)) -
  1.242857142857143) < 1e-12);


/* Source-selected SHED CIRCUMFERENCES: remove the original 5x5 perimeter.
 * The central 3x3 has base59 total phi(1033)=1032, and each selected
 * page's complete-word rune body divides by three: p32 120, p55 75.
 * Freeze each natural raw/phi, base59/60, row/col Hill3, then use the
 * same original 3x3 tile as 11x11 p32 zero-edge image convolution.
 */
const inner3 = tile.slice(1, 4).map(row => row.slice(1, 4));
assert.deepEqual(inner3, [
  ["2k", "2t", "2O"], ["0J", "1L", "0c"], ["2d", "1T", "2u"],
]);
assert.equal(total(numeralMatrix(59, inner3)), phi(1033));
/** @param {number[][]} matrix @param {number[]} source @param {"col"|"row"} orientation */
function hill3(matrix, source, orientation) {
  assert.equal(source.length % 3, 0);
  const out = [];
  for (let k = 0; k < source.length; k += 3) for (let row = 0; row < 3; row++) {
    let value = 0;
    for (let i = 0; i < 3; i++) {
      value += (orientation === "col" ? matrix[row][i] : matrix[i][row]) * source[k + i];
    }
    out.push(mod(value));
  }
  return out;
}
/** @param {number[][]} kernel */
function blur3Matrix(kernel) {
  const out = Array.from({length: 121}, () => Array(121).fill(0));
  for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const y = r + i - 1, x = c + j - 1;
      if (y >= 0 && y < 11 && x >= 0 && x < 11) {
        out[r * 11 + c][y * 11 + x] = kernel[i][j];
      }
    }
  }
  return out;
}
const shed3Results = [], shed3BlurResults = [];
for (const radix of [59, 60]) {
  const values = numeralMatrix(radix, inner3);
  for (const representation of ["raw", "phi"]) {
    const matrix = values.map(row => row.map(x =>
      mod(representation === "phi" ? phi(x) : x)));
    const inverse = invert(matrix);
    for (const original of [
      {page: 55, cipher: body, planted: plant, longWords},
      {page: 32, cipher: body32, planted: plant32, longWords: long32},
    ]) {
      for (const orientation of ["col", "row"]) {
        const plaintext = hill3(inverse, original.cipher, orientation);
        assert.deepEqual(hill3(matrix, plaintext, orientation), original.cipher);
        assert.deepEqual(
          hill3(inverse, hill3(matrix, original.planted, orientation), orientation),
          original.planted);
        const hits = original.longWords.filter(w =>
          dictionary.has(w.map(i => plaintext[i]).join(","))).length;
        assert.equal(hits, 0);
        shed3Results.push({radix, representation, page: original.page,
          orientation, normalizedIC: normalizedIC(plaintext), dictionaryHits: hits});
      }
    }
    const blur = blur3Matrix(matrix), invBlur = invert(blur);
    const p32 = matVec(invBlur, page32Cipher);
    assert.deepEqual(matVec(blur, p32), page32Cipher);
    assert.deepEqual(matVec(invBlur, matVec(blur, page32ClearPlant)), page32ClearPlant);
    shed3BlurResults.push({radix, representation, normalizedIC: normalizedIC(p32)});
  }
}
assert.equal(shed3Results.length, 16);
assert.equal(shed3BlurResults.length, 4);
assert.equal(Math.max(...shed3Results.map(r => r.dictionaryHits)), 0);

/* Independent new whole-book hypothesis from the same three frozen 2013
 * prime ordinals: under base60 their original p50 pointer nodes have
 * subtree sizes 58,8,56. Particularly 201 -> 74 -> 205 is the unique
 * 56->57->58 ancestor chain: exact count of all LP2 pages, then the
 * 56 encrypted and two clear terminal pages. Existing signed 2016
 * THE(20)->DEVOTED(102) is another 56->57 ancestry. This structural
 * association is retrospective and is not an authenticated page decoder.
 */
const parent60 = allTokens.map(token => readToken(token, 60));
/** @param {number} from @returns {number[]} */
function orbit60(from) {
  const seen = new Set(), visited = [];
  let node = from;
  while (!seen.has(node)) {
    seen.add(node);
    visited.push(node);
    node = parent60[node];
  }
  return visited;
}
/** @param {number} target @returns {number[]} */
function descendants60(target) {
  return Array.from({length: 256}, (_, i) => i)
    .filter(i => orbit60(i).includes(target));
}
const graphSizes60 = Array.from({length: 256}, (_, i) => descendants60(i).length);
assert.deepEqual(ranks.map(i => graphSizes60[i]), [58, 8, 56]);
assert.deepEqual([parent60[201], parent60[74], parent60[205]], [74, 205, 76]);
assert.deepEqual([201, 74, 205].map(i => graphSizes60[i]), [56, 57, 58]);
assert.deepEqual([20, 102].map(i => graphSizes60[i]), [56, 57]);
assert.equal(parent60[20], 102);
assert.equal(parent60[102], 32);
assert.equal(parent60[32], 115);
assert.deepEqual(Array.from({length: 256}, (_, i) => i)
  .filter(i => graphSizes60[i] === 58), [205]);
assert.deepEqual(Array.from({length: 256}, (_, i) => i)
  .filter(i => graphSizes60[i] === 57), [74, 102]);
assert.deepEqual(Array.from({length: 256}, (_, i) => i)
  .filter(i => graphSizes60[i] === 56), [20, 201]);
const s56 = new Set(descendants60(201)), s57 = new Set(descendants60(74));
const s58 = new Set(descendants60(205));
assert.deepEqual([...s57].filter(i => !s56.has(i)), [74]);
assert.deepEqual([...s58].filter(i => !s57.has(i)), [205]);
assert.equal(descendants60(173).length, 8);

/* Whole-manuscript physical page layout is finer than the 58/8/56 count.
 * LP2 physical p50 is itself the unique rune-free 256-cell numeric table;
 * p0..49 are 50 preceding rune-bearing pages, p51..55 are 5 following.
 * The source-frozen 56-node S(201) splits into child subtrees of exactly
 * 50 and5; its 50-node child splits again into 44 and5 at root82.
 * These exact nested counts are not sufficient to prove an authored page
 * permutation; they are independent fixed page-layout targets.
 */
assert.equal(gp.pages[50].indices.length, 0);
assert.equal(gp.pages.slice(0, 50).filter(p => p.indices.length > 0).length, 50);
assert.equal(gp.pages.slice(51, 56).filter(p => p.indices.length > 0).length, 5);
/** @param {number} node */
function treeChildren60(node) {
  return Array.from({length: 256}, (_, i) => i).filter(i => parent60[i] === node);
}
assert.deepEqual(treeChildren60(201), [82, 128]);
assert.deepEqual([82, 128].map(i => graphSizes60[i]), [50, 5]);
assert.deepEqual([82, 128].map(i => allTokens[i]), ["3L", "3L"]);
assert.deepEqual(treeChildren60(82), [79, 163]);
assert.deepEqual([79, 163].map(i => graphSizes60[i]), [44, 5]);
assert.deepEqual([79, 163].map(i => allTokens[i]), ["1M", "1M"]);
const core = new Set(descendants60(201));
assert.equal(core.size, 56);
assert.equal(descendants60(82).filter(i => descendants60(128).includes(i)).length, 0);
/* A source-ordered candidate, not a verified plaintext/page alignment:
 * recurse into the largest child subtree, read its parent, then append
 * smaller children (descending size, ties printed address). This places
 * the unique numeral-table page at physical position50 without padding.
 */
function hypothesisInorder60(node) {
  const children = treeChildren60(node)
    .filter(i => core.has(i))
    .sort((a, b) => graphSizes60[b] - graphSizes60[a] || a - b);
  if (!children.length) return [node];
  return [
    ...hypothesisInorder60(children[0]),
    node,
    ...children.slice(1).flatMap(hypothesisInorder60),
  ];
}
const hypothesized56PageNodes = hypothesisInorder60(201);
assert.equal(hypothesized56PageNodes.length, 56);
assert.equal(new Set(hypothesized56PageNodes).size, 56);
assert.deepEqual([32, 43, 44, 49, 50, 51, 55]
  .map(i => hypothesized56PageNodes[i]),
  [73, 79, 82, 163, 201, 24, 128]);

assert.equal(parent60[173], 117);
assert.equal(readToken(allTokens[173], 59), 115);
assert.equal(parent60[32], readToken(allTokens[173], 59));
assert.equal(readToken(allTokens[205], 60), gp.pages[55].indices.length);
assert.equal(readToken(allTokens[205], 59), body.length);
const fullManuscriptLadder = [201, 74, 205].map(i => ({
  address: i, token: allTokens[i], parent: parent60[i], subtree: graphSizes60[i],
}));

console.log(JSON.stringify({
  sourcePrimeSums: clauseSums,
  originalP50PrimeRanks: ranks,
  originalTile: tile,
  receiver: "physical p55; first carried rune omitted; 75 runes; 15 Hill5 vectors",
  sourceNormalizedIC: normalizedIC(body),
  authenticClear75NormalizedIC: normalizedIC(plant),
  variants: results,
  historicalSquareChecksums: {tileSum59:3210,inner59:1032,magicTotal3301:3301,magicTotal1033:1033,center91:91,phi1033:1032,physicalWindows:allWindows.length},
  phiVariants: phiResults,
  centerNavigation: {sourceToken:tileCenter, base59:80, phi59:32, base60:81, phi60:54},
  page32BlurVariants: blurResults,
  page32SourceBody: {carriedOpeningRune:20,completeRunes:body32.length,fullWords:page32Words.length,longWords:long32.length,normalizedIC:normalizedIC(body32)},
  page32DirectVariants: direct32Results,
  shedInner3: inner3,
  shedInner3HillVariants: shed3Results,
  shedInner3BlurVariants: shed3BlurResults,
  base60ManuscriptLadder: fullManuscriptLadder,
  physicalPageSplit: {numericPage:50, branch50:82, branch5:128, secondSplit44:79, secondSplit5:163},
  fixedCandidateInorder56: hypothesized56PageNodes,
  sourcePrimeOrdinalSubtrees: ranks.map(i => ({address:i, token:allTokens[i], subtree:graphSizes60[i]})),
  signedTheDevotedSubtreeCounts: [20,102].map(i => graphSizes60[i]),
  control: "4/4 raw and 8/8 phi p55 replays/plants 75/75; 4/4 p32 blur 121/121 and 16/16 p32 direct 120/120",
}, null, 2));
