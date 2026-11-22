"use strict";

/**
 * Exact p50 interior180 known-text arbitrary-byte-homophone gate.
 * Windows 11 Node.js 22, CommonJS, read-only original-source SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal(grid.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
const pg = page => corpus.pages.find(x => x.page === page);
assert.equal(pg(55).indices.length, 76);
assert.equal(pg(56).indices.length, 85);
assert.equal(pg(57).indices.length, 95);
const primes = [];
for (let n = 2; primes.length < 85; n++)
  if (primes.every(p => n % p !== 0)) primes.push(n);
const authentic56 = pg(56).indices.map((c, i) => i === 56 ? 0 :
  ((c - (primes[i - (i > 56 ? 1 : 0)] - 1)) % 29 + 29) % 29);
assert.equal(pg(56).indices[56], 0, "solved literal-F key bypass");
assert.equal(authentic56.map(i => corpus.translit[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
const registers = [
  {name: "p56 solved plaintext + original p57 clear", known: [...authentic56, ...pg(57).indices]},
  {name: "p56 original ciphertext + original p57 clear", known: [...pg(56).indices, ...pg(57).indices]}
];
for (const r of registers) assert.equal(r.known.length, 180);
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
const cellTokens = grid.pages.flatMap(p => p.tokens);
assert.equal(cellTokens.length, 256);
const sources = [alphabet60, alphabet59].map(alphabet => {
  const width = alphabet.length;
  return cellTokens.map(t => {
    assert.equal(t.length, 2);
    const a = alphabet.indexOf(t[0]), b = alphabet.indexOf(t[1]);
    assert.ok(a >= 0 && b >= 0);
    const byte = a * width + b;
    assert.ok(byte >= 0 && byte < 256);
    return byte;
  });
});
assert.deepEqual(sources[0], grid.bytes);
assert.equal(new Set(sources[0]).size, 161);
assert.equal(new Set(sources[1]).size, 161);
/** @returns {number[]} */
function gridPositions(mode, reverseRows, reverseColumns) {
  const cells = [];
  for (let k = 0; k < 180; k++) {
    const rr = mode === "row" ? Math.floor(k / 6) : k % 30;
    const cc = mode === "row" ? k % 6 : Math.floor(k / 30);
    const r = reverseRows ? 30 - rr : rr + 1;
    const c = reverseColumns ? 6 - cc : cc + 1;
    cells.push(8 * r + c);
  }
  assert.equal(cells.length, 180);
  assert.equal(new Set(cells).size, 180);
  assert.ok(cells.every(i => i >= 8 && i < 248 && i % 8 > 0 && i % 8 < 7));
  return cells;
}
const interior0 = gridPositions("row", false, false);
const perimeter = [];
for (let c = 0; c < 8; c++) perimeter.push(c);
for (let r = 1; r < 32; r++) perimeter.push(8 * r + 7);
for (let c = 6; c >= 0; c--) perimeter.push(8 * 31 + c);
for (let r = 30; r >= 1; r--) perimeter.push(8 * r);
assert.equal(perimeter.length, 76);
assert.equal(new Set(perimeter).size, 76);
assert.equal(new Set([...perimeter, ...interior0]).size, 256);

/**
 * A fully arbitrary and unknown byte→GP29 codebook can assign multiple
 * bytes to one rune, but a repeated source byte can represent only a
 * single rune under the same static codebook.
 * @param {number[]} bytes
 * @param {number[]} known
 */
function conflicts(bytes, known) {
  assert.equal(bytes.length, known.length);
  const label = new Map();
  let contradictions = 0, repeatAgreements = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (label.has(bytes[i])) {
      if (label.get(bytes[i]) === known[i]) repeatAgreements++;
      else contradictions++;
    } else label.set(bytes[i], known[i]);
  }
  return {distinctBytes: label.size, repeatedBytes: bytes.length - label.size,
    contradictions, repeatAgreements, mapping: label};
}
const outcomes = [];
for (const [sourceIndex, cells] of sources.entries()) {
  for (const mode of ["row", "column"]) {
    for (const reverseRows of [false, true]) {
      for (const reverseColumns of [false, true]) {
        const interior = gridPositions(mode, reverseRows, reverseColumns)
          .map(i => cells[i]);
        for (const {name, known} of registers) {
          const whole = conflicts(interior, known);
          const left = conflicts(interior.slice(0, 85), known.slice(0, 85));
          const right = conflicts(interior.slice(85), known.slice(85));
          assert.equal(whole.repeatedBytes, 53);
          assert.ok(whole.contradictions >= 47);
          if (name.startsWith("p56 solved")) {
            assert.ok(left.contradictions >= 9);
            assert.ok(right.contradictions >= 14);
          }
          outcomes.push({radix: sourceIndex ? 59 : 60,
            mode, reverseRows, reverseColumns, register: name,
            whole: {distinctBytes: whole.distinctBytes,
              repeatedBytes: whole.repeatedBytes, contradictions: whole.contradictions,
              agreements: whole.repeatAgreements},
            page56Conflicts: left.contradictions, page57Conflicts: right.contradictions});
        }
      }
    }
  }
}
/**
 * Solved p57 expressly names shedding circumferences. These eight spiral
 * paths are the separate source-readable interior 68+60+52 ring orders,
 * each with one of four physical corner starts and clockwise/anticlockwise
 * traversal, without changing the published 30x6 inner cells.
 * @param {number} corner
 * @param {boolean} reverse
 */
function spiralPositions(corner, reverse) {
  const output = [];
  for (let shell = 0; shell < 3; shell++) {
    const top = 1 + shell, bottom = 30 - shell;
    const left = 1 + shell, right = 6 - shell;
    const ring = [];
    for (let column = left; column <= right; column++)
      ring.push(8 * top + column);
    for (let row = top + 1; row <= bottom; row++)
      ring.push(8 * row + right);
    for (let column = right - 1; column >= left; column--)
      ring.push(8 * bottom + column);
    for (let row = bottom - 1; row > top; row--)
      ring.push(8 * row + left);
    assert.equal(ring.length, [68, 60, 52][shell]);
    const corners = [8 * top + left, 8 * top + right,
      8 * bottom + right, 8 * bottom + left];
    const start = ring.indexOf(corners[corner]);
    assert.ok(start >= 0);
    for (let i = 0; i < ring.length; i++)
      output.push(ring[(start + (reverse ? -i : i) + ring.length * 3) % ring.length]);
  }
  assert.equal(output.length, 180);
  assert.equal(new Set(output).size, 180);
  assert.deepEqual([...output].sort((a,b)=>a-b),
    [...interior0].sort((a,b)=>a-b));
  return output;
}
for (const [sourceIndex, cells] of sources.entries()) {
  for (let corner = 0; corner < 4; corner++) {
    for (const reverse of [false, true]) {
      const inner = spiralPositions(corner, reverse).map(i => cells[i]);
      for (const {name, known} of registers) {
        const whole = conflicts(inner, known);
        const left = conflicts(inner.slice(0, 85), known.slice(0, 85));
        const right = conflicts(inner.slice(85), known.slice(85));
        assert.equal(whole.repeatedBytes, 53);
        assert.ok(whole.contradictions >= 49);
        outcomes.push({radix: sourceIndex ? 59 : 60,
          mode: "spiral", corner, reverse, register: name,
          whole: {distinctBytes: whole.distinctBytes,
            repeatedBytes: whole.repeatedBytes, contradictions: whole.contradictions,
            agreements: whole.repeatAgreements},
          page56Conflicts: left.contradictions,
          page57Conflicts: right.contradictions});
      }
    }
  }
}
assert.equal(outcomes.length, 64);
assert.equal(Math.min(...outcomes.filter(x =>
  x.mode === "spiral" && x.register.startsWith("p56 solved"))
  .map(x => x.whole.contradictions)), 49);
assert.deepEqual(
  outcomes.slice(32, 48).map(x => x.whole.contradictions),
  outcomes.slice(48, 64).map(x => x.whole.contradictions));
assert.equal(Math.min(...outcomes.map(x => x.whole.contradictions)), 47);
assert.equal(Math.min(...outcomes.filter(x => x.register.startsWith("p56 solved"))
  .map(x => x.page56Conflicts)), 9);
assert.equal(Math.min(...outcomes.filter(x => x.register.startsWith("p56 solved"))
  .map(x => x.page57Conflicts)), 14);
assert.deepEqual(
  outcomes.slice(0, 16).map(x => x.whole.contradictions),
  outcomes.slice(16, 32).map(x => x.whole.contradictions),
  "base59 and base60 preserve collisions under byte-injective numeral parsing"
);

// Genuine page-shaped hidden-rune positive. Build an independent homophonic
// 256-byte table from 180 known solved GP symbols and a withheld 76-symbol
// authentic p57 passage. Encode symbols with up to two private byte aliases,
// then apply an unknown byte alphabet permutation to all 256 cells.
const planted = new Array(256).fill(0);
const seen = new Uint16Array(29);
const classCounts = new Uint16Array(29);
for (const rune of registers[0].known) classCounts[rune]++;
for (let i = 0; i < 180; i++) {
  const rune = registers[0].known[i];
  const homophone = seen[rune]++ % 2;
  planted[interior0[i]] = 10 + 4 * rune + homophone;
}
const hidden76 = pg(57).indices.slice(0, 76);
assert.equal(hidden76.length, 76);
for (let i = 0; i < 76; i++) {
  const rune = hidden76[i];
  assert.ok(classCounts[rune] > 0, "heldout plant must be learnable from known symbols");
  const homophone = classCounts[rune] >= 2 && i % 2 ? 1 : 0;
  planted[perimeter[i]] = 10 + 4 * rune + homophone;
}
const concealedByte = x => (173 * x + 47) % 256;
const plantedMask = planted.map(concealedByte);
const plantedKnown = interior0.map(i => plantedMask[i]);
const learned = conflicts(plantedKnown, registers[0].known);
assert.equal(learned.contradictions, 0);
const recovered76 = perimeter.map(i => learned.mapping.get(plantedMask[i]));
assert.deepEqual(recovered76, hidden76);
console.log("PASS original 256-cell table arbitrary-secret byte-homophone inversion gate");
console.log(JSON.stringify({
  terminal: {unknown55: 76, solved56: 85, clear57: 95,
    perimeter: perimeter.length, interior: interior0.length},
  originalCount: outcomes.length,
  originalBest: Math.min(...outcomes.map(o => o.whole.contradictions)),
  original: outcomes,
  plant: {known: 180, heldout: 76, recovered: recovered76.length,
    knownDistinct: learned.distinctBytes, contradictions: learned.contradictions}
}, null, 2));
