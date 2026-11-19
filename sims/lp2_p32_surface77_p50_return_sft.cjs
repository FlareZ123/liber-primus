"use strict";

/**
 * SFT: selected p32 NE "TO THE SURFACE" exit -> p50 route closure.
 *
 * Reconstructs the already source-selected EPIPHANY/SEEKS/THE/DEVOTED route,
 * the p32 final-fragment NE PARABLE continuation, then tests the raw
 * out-of-square continuation as a zero-based p50 address.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word */
function gpValues(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find(item =>
      normalized.startsWith(item.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} word */
const gp0 = word => gpValues(word).reduce((sum, value) => sum + value, 0);

const tokens = grid.pages.flatMap(page => page.tokens);
const alphabet60 = grid.alphabet;
/** @param {string} token */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}
const table = tokens.map(decode60);

/** @param {number} start @param {number} steps */
function walk(start, steps) {
  const route = [start];
  let current = start;
  for (let step = 0; step < steps; step += 1) {
    assert.ok(current >= 0 && current < table.length);
    current = table[current];
    route.push(current);
  }
  return route;
}

/**
 * Parse page-local printed fragments with page-edge carries preserved.
 * @param {string} page
 */
function parsePage(page) {
  const fragments = [];
  let current = [];
  let start = 0;
  let count = 0;
  const finish = () => {
    if (!current.length) return;
    fragments.push({
      start,
      len: current.length,
      runes: [...current],
      text: current.map(rune => corpus.translit[runeIndex.get(rune)]).join(""),
    });
    current = [];
  };
  for (const ch of page) {
    if (runeIndex.has(ch)) {
      if (!current.length) start = count;
      current.push(ch);
      count += 1;
    } else if (ch === "/" || /\s/u.test(ch)) {
      continue;
    } else {
      finish();
    }
  }
  finish();
  return {count, fragments};
}

const pages = transcription.split("%");
const p32 = parsePage(pages[32]);
assert.equal(p32.count, 121);
assert.equal(p32.fragments.length, 22);

// Frozen source route and DH quantities.
const dh = {p:23, g:5, a:6, b:15, A:8, B:19, K:2};
const route = walk(gp0("SEEKS"), dh.p);
assert.deepEqual(route, [
  71,108,14,183,81,58,146,92,236,238,129,179,
  175,18,15,212,70,169,228,144,125,20,102,32,
]);
assert.equal(route[21], gp0("THE"));
assert.equal(route[22], gp0("DEVOTED"));
assert.equal(route[23], 32);

const q = gp0("EMPTY") / dh.p;
assert.equal(q, 4);

// THE@21 fixes the final local fragment and its start.
const finalFragment = p32.fragments[21];
assert.deepEqual(
  {start:finalFragment.start, len:finalFragment.len, text:finalFragment.text},
  {start:117, len:4, text:"AGBEO"}
);

const p32Indices = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32Indices.length, 121);
const side = 11;
const parable = [
  "LIKE","THE","INSTAR","TUNNELING","TO","THE","SURFACE",
  "WE","MUST","SHED","OUR","OWN","CIRCUMFERENCES","FIND",
  "THE","DIVINITY","WITHIN","AND","EMERGE",
];
assert.equal(parable.length, dh.B);

const primeMatrix = Array.from({length:side}, (_, row) =>
  p32Indices.slice(row * side, (row + 1) * side)
    .map(index => corpus.prime[index] % dh.B)
);

const start = {
  row: Math.floor(finalFragment.start / side),
  column: finalFragment.start % side,
};
assert.deepEqual(start, {row:10, column:7});

const directions = [
  [-1,-1,"NW"],[-1,0,"N"],[-1,1,"NE"],[0,-1,"W"],
  [0,1,"E"],[1,-1,"SW"],[1,0,"S"],[1,1,"SE"],
];

const candidates = [];
for (const [dr, dc, name] of directions) {
  const cells = [];
  for (let step = 0; step < q; step += 1) {
    const row = start.row + dr * step;
    const column = start.column + dc * step;
    if (row < 0 || row >= side || column < 0 || column >= side) {
      cells.length = 0;
      break;
    }
    cells.push({row, column, offset:row * side + column});
  }
  if (cells.length !== q) continue;

  const residues = cells.map(cell => primeMatrix[cell.row][cell.column]);
  const consecutive = residues.every((value, index) =>
    index === 0 || value === residues[index - 1] + 1
  );
  const nextRow = start.row + dr * q;
  const nextColumn = start.column + dc * q;
  const nextLinear = nextRow * side + nextColumn;
  const nextLeaves =
    nextRow < 0 || nextRow >= side || nextColumn < 0 || nextColumn >= side;

  const gWalk =
    nextLinear >= 0 && nextLinear < table.length
      ? walk(nextLinear, dh.g)
      : null;

  candidates.push({
    direction:name,
    offsets:cells.map(cell => cell.offset),
    residues,
    words:residues.map(value => parable[value]),
    consecutive,
    nextCoord:[nextRow, nextColumn],
    nextLinear,
    nextLeaves,
    gWalk,
    gEndpoint:gWalk ? gWalk.at(-1) : null,
  });
}

const selected = candidates.filter(row => row.consecutive);
assert.deepEqual(selected.map(row => row.direction), ["NE"]);
const ne = selected[0];
assert.deepEqual(ne.offsets, [117,107,97,87]);
assert.deepEqual(ne.residues, [2,3,4,5]);
assert.deepEqual(ne.words, ["INSTAR","TUNNELING","TO","THE"]);
assert.deepEqual(ne.nextCoord, [6,11]);
assert.equal(ne.nextLeaves, true);
assert.equal(parable[6], "SURFACE");

// The literal unwrapped fifth step is a new address, not a wrapped p32 rune.
assert.equal(ne.nextLinear, 77);

// Identify all authenticated words with this exact GP0 address.
const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const signedWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word, index) => ({index, word:word.toUpperCase(), gp0:gp0(word)}));
const at77 = signedWords.filter(row => row.gp0 === ne.nextLinear);
assert.deepEqual(at77, [
  {index:20, word:"MEANING", gp0:77},
  {index:39, word:"FALSE", gp0:77},
]);

// Promoted whole-word GP0 -> zero-based p50-address navigation closes the
// out-of-square address back onto the exact suffix of the selected p32 route.
assert.deepEqual(ne.gWalk, [77,144,125,20,102,32]);
assert.equal(ne.gEndpoint, 32);
assert.deepEqual(ne.gWalk.slice(-3), [gp0("THE"), gp0("DEVOTED"), 32]);
assert.deepEqual(route.slice(-6), [144,125,20,102,32].length === 5
  ? [228,144,125,20,102,32]
  : []);

// Exact suffix join: after one pointer from 77, the route is the final five
// states of the original SEEKS -> p32 path.
assert.deepEqual(ne.gWalk.slice(1), route.slice(-5));

// Direction control: NE is unique among all q-valid directions in being both
// a literal surface exit and a g-step p50 return to p32.
const surfaceReturns = candidates.filter(row =>
  row.nextLeaves && row.gEndpoint === 32
);
assert.deepEqual(surfaceReturns.map(row => row.direction), ["NE"]);

// The other surface exit is E. It lands on GP0(EPIPHANY)=121 but does not
// return to p32 in g steps, which is a useful matched geometric control.
const east = candidates.find(row => row.direction === "E");
assert.ok(east);
assert.equal(east.nextLeaves, true);
assert.equal(east.nextLinear, gp0("EPIPHANY"));
assert.equal(east.gEndpoint, 192);

// The selected semantic next word itself independently has the historical
// SURFACE number used by the existing wrapper receiver route.
assert.equal(gp0("SURFACE"), 67);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "new p32 surface-exit closure: the source-selected NE continuation reaches address77 and rejoins the selected p50 route back to p32 in exactly g=5 steps",
  upstreamRoute:route,
  selectedDirection:ne,
  address77Words:at77,
  directionControls:candidates.map(row => ({
    direction:row.direction,
    nextCoord:row.nextCoord,
    nextLinear:row.nextLinear,
    nextLeaves:row.nextLeaves,
    gEndpoint:row.gEndpoint,
    consecutive:row.consecutive,
  })),
  surfaceReturnDirections:surfaceReturns.map(row => row.direction),
  semanticNextWord:{word:"SURFACE",gp0:gp0("SURFACE")},
  decision:
    "Treat 77 as a deterministic surface-exit/navigation state, not plaintext. It aliases MEANING and FALSE in the authenticated source and closes onto THE->DEVOTED->p32.",
}, null, 2));
