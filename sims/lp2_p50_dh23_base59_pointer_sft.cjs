'use strict';

/**
 * Source-fixed p57 DH-candidate seed to the original 32x8 numeral table graph.
 * Run: node sims/lp2_p50_dh23_base59_pointer_sft.cjs
 * Read-only, standard Node.js modules, no external dependency or fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
const grid = read('resources/liber-primus/base60-grid.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const rows = grid.rows;
assert.equal(rows.length, 32);
assert(rows.every((row) => row.length === 8));
const tokens = rows.flat();
assert.equal(tokens.length, 256);

const digits60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digits59 = digits60.replace('f', '');
assert.equal(digits60.length, 60);
assert.equal(digits59.length, 59);
assert(tokens.every((s) => s.length === 2 && [...s].every((c) => digits59.includes(c))));

/** @param {number} radix */
function decode(radix) {
  const alphabet = radix === 59 ? digits59 : digits60;
  return tokens.map((s) => radix * alphabet.indexOf(s[0]) + alphabet.indexOf(s[1]));
}

/** @param {number[]} map @param {number} start */
function orbit(map, start) {
  const seen = new Map();
  const nodes = [];
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, nodes.length);
    nodes.push(at);
    at = map[at];
  }
  return {nodes, repeated: at, prefix: seen.get(at), period: nodes.length - seen.get(at)};
}

/** @param {number[]} map @param {number} root */
function allReachRoot(map, root) {
  if (map[root] !== root) return false;
  for (let seed = 0; seed < map.length; seed++) {
    let at = seed;
    let steps = 0;
    while (at !== root && steps < map.length) {
      at = map[at];
      steps++;
    }
    if (at !== root) return false;
  }
  return true;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let x = 1;
  for (let k = 0; k < exponent; k++) x = (x * base) % modulus;
  return x;
}

/** @param {number} lo @param {number} hi */
function primeSum(lo, hi) {
  return corpus.pages[57].indices.slice(lo, hi)
    .reduce((acc, rune) => acc + corpus.prime[rune], 0);
}

const base59 = decode(59);
const base60 = decode(60);

// Independent signed-2013 route using STANDARD base60. The 2013 DH
// example specifies p=23, server base=5; interpreting them as ZERO-BASED
// 32-by-8 table coordinates remains an explicit hypothesis.
const historicalDH = {p:23, base:5, serverPublic:8, clientPublic:19, shared:2};
const historicalBase29Operand = 3301;
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
// The signed 2013 DH worked server-public share is 8, exactly the
// original numeric table's independently printed row width.
assert.equal(historicalDH.serverPublic, grid.rows[0].length);
assert.equal(grid.page_row_counts[0]+grid.page_row_counts[1],historicalDH.p);
assert.deepEqual(grid.rows[historicalDH.p], ['28','2a','0J','1L','0c','3C','2o','0X']);
assert.equal(grid.rows[historicalDH.p+1][0],'00');
const dhCell = historicalDH.p * 8 + historicalDH.base; // original 189
assert.equal(dhCell, historicalDH.p * historicalDH.serverPublic + historicalDH.base);
assert.equal(dhCell, 189);
// Independent second field of the SAME signed DH worked example:
// the original row23 column[shared DH key2] prints 0J=19,
// exactly the source's CLIENT PUBLIC SHARE 19.
const dhSharedColumnCell = historicalDH.p * historicalDH.serverPublic + historicalDH.shared;
assert.equal(dhSharedColumnCell, 186);
assert.equal(tokens[dhSharedColumnCell], '0J');
assert.equal(base60[dhSharedColumnCell], historicalDH.clientPublic);
// Original value19 is unique; value192 occurs at four exact cells.
assert.deepEqual(base60.flatMap((n,i)=>n===19?[i]:[]),[186]);
assert.deepEqual(base60.flatMap((n,i)=>n===192?[i]:[]),[67,162,189,247]);
assert.equal(tokens[dhCell], '3C');
assert.equal(base60[dhCell], 192);
assert.equal(tokens[base60[dhCell]], '00');
assert.equal(base60[base60[dhCell]], 0);
// The signed server public share A=8 itself is precisely the last
// coordinate carry from row23 into the next row's leading 00.
assert.equal(historicalDH.p*historicalDH.serverPublic+historicalDH.serverPublic,192);
assert.equal(base60[historicalDH.p*historicalDH.serverPublic+historicalDH.serverPublic],0);
// The second zero is independently addressed by the authenticated
// BASE29 example's source numeric operand, 3301, modulo 256.
const secondZero = historicalBase29Operand % 256;
assert.equal(secondZero, 229);
assert.equal(tokens[secondZero], '00');
assert.deepEqual(base60.flatMap((n, i) => n === 0 ? [i] : []), [192, 229]);
// Original p39 rune triad [27,5,15] has double GF29 root 24.
const p39Root=24;
assert.equal((27 + 5*p39Root + 15*p39Root*p39Root) % 29, 0);
assert.equal((5 + 30*p39Root) % 29, 0);
assert.equal(p39Root * 8, 192);
assert.equal(historicalBase29Operand % 29, p39Root);
const zeroBracket = base60.slice(193, secondZero);
assert.equal(zeroBracket.length, 36);
assert.deepEqual(zeroBracket, [
  155,159,89,176,115,105,47,110,74,209,68,194,
  76,127,21,57,175,6,61,70,150,251,84,142,
  219,148,59,58,52,51,151,68,52,73,249,144
]);

// One closed original-cipher receiver using ONLY the source's DH
// modular exponentiation operation: treat each of the 36 bracket byte
// values as exponent and compute K=5^byte mod23. Apply one continuous
// 36-position cyclic additive GP29 inverse to the adjacent complete
// 170-rune p51+early-p52 post-table original sentence. No key fitting.
const dhKey36=zeroBracket.map(v=>powMod(historicalDH.base,v,historicalDH.p));
assert.equal(dhKey36.length,36);
assert.deepEqual(dhKey36,[5,20,5,1,20,15,10,1,16,22,2,6,
  9,15,14,21,14,8,15,4,6,11,6,9,14,3,19,13,16,17,7,2,16,17,17,18]);
const gpmod=v=>(v%29+29)%29;
const posttable=corpus.pages[51].indices.concat(corpus.pages[52].indices.slice(0,78));
assert.equal(posttable.length,170);
const terminal=corpus.pages[54].indices.concat(corpus.pages[55].indices);
assert.equal(terminal.length,308);
const decrypt=(arr)=>arr.map((v,i)=>gpmod(v-dhKey36[i%36]));
const encrypt=(arr)=>arr.map((v,i)=>gpmod(v+dhKey36[i%36]));
const symbolIoc=(arr)=>{
  const h=Array(29).fill(0);arr.forEach(v=>h[v]++);
  return h.reduce((acc,c)=>acc+c*(c-1),0)/(arr.length*(arr.length-1));
};
const postPlain=decrypt(posttable),terminalPlain=decrypt(terminal);
assert.deepEqual(encrypt(postPlain),posttable);
assert.deepEqual(encrypt(terminalPlain),terminal);
// Solved p57 is an actual 95-rune GP-native positive with an unknown
// posttable plaintext response. The plant checks full inverse validity.
const clear95=corpus.pages[57].indices;
assert.equal(clear95.length,95);
assert.deepEqual(decrypt(encrypt(clear95)),clear95);
assert.equal(symbolIoc(postPlain),0.033275321963104766);
assert.equal(symbolIoc(terminalPlain),0.03462498413638479);
// Both unchanged unknown original outputs remain near uniform 1/29;
// an independently chosen external source key/clock would be needed.

// Alternative normal one-based row/column interpretations fail this link.
assert.equal(base60[(23-1)*8+(5-1)],144);
assert.equal(base60[(23-1)*8+5],40);
assert.equal(base60[23*8+(5-1)],38);
// Base59 skips the zero: cell189 points to itself instead of 192.
assert.equal(base59[dhCell], dhCell);
// This conditional index match does NOT supply a key schedule,
// authenticate a Cicada-selected row/column instruction, or decode runes.

assert.equal(base59[189], 189);
assert.equal(tokens[189], '3C');
assert.equal(Math.floor(189 / 8), 23);
assert.equal(189 % 8, 5);
assert.equal(allReachRoot(base59, 189), true);
assert.equal(allReachRoot(base60, 189), false);
assert.deepEqual([primeSum(7, 37), primeSum(37, 67), primeSum(67, 95)],
  [1259, 1031, 1229]);
assert.equal(1259 * 1031 * 1229, 1595277641);
assert.equal(primeSum(67, 71), 151); // FIND
assert.equal(primeSum(47, 50), 21);  // OUR
assert.equal(primeSum(81, 86), 115); // WITHIN
assert.equal(base59[173], 115); // At row21, col5
assert.equal(base59[201], 73);  // Candidate 2013-derived K
assert.equal(powMod(115, 21, 151), 73);
const candidate = orbit(base59, 73);
assert.equal(candidate.prefix, 31);
assert.equal(candidate.period, 1);
assert.equal(candidate.repeated, 189);
assert.equal(candidate.nodes.length, 32);
assert.deepEqual(candidate.nodes, [
  73, 78, 45, 105, 62, 122, 85, 28,
  148, 242, 41, 83, 190, 167, 244, 22,
  58, 144, 123, 53, 168, 236, 234, 193,
  153, 33, 112, 72, 161, 214, 247, 189
]);
assert.equal(ink.pages.flatMap((p) => p.large_punctuation || [])
  .filter((mark) => mark[1] === 13).length, 31);

// The numeral path is NOT the source's stencil-position mask.
// Construct the printed 256-event red-rune-plus-13-dot tape, punctuation
// before a rune when they share the same source-local offset.
const events = [];
for (const p of ink.pages) {
  for (const span of p.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      events.push({page: p.page, offset: span.start + i, order: 1, dot: false});
    }
  }
  for (const mark of p.large_punctuation || []) {
    if (mark[1] === 13) {
      events.push({page: p.page, offset: mark[0], order: 0, dot: true});
    }
  }
}
events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.order - b.order);
assert.equal(events.length, 256);
const dotPositions = events.flatMap((e, i) => e.dot ? [i] : []);
assert.equal(dotPositions.length, 31);
const dotSet = new Set(dotPositions);
const overlap = candidate.nodes.slice(0, -1).filter((i) => dotSet.has(i));
assert.deepEqual(overlap, [168, 153, 247]);

// Matched-table exploration preserving every original decoded base59 value.
// It characterizes the conditional graph; it cannot prove Cicada authorship.
let state = 0x3301ab25;
/** @returns {number} */
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 100000;
let root189 = 0;
let rootAnd31 = 0;
for (let t = 0; t < trials; t++) {
  const sample = base59.slice();
  for (let i = 255; i > 0; i--) {
    const j = nextRandom() % (i + 1);
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }
  if (allReachRoot(sample, 189)) {
    root189++;
    const o = orbit(sample, 73);
    if (o.prefix === 31 && o.period === 1 && o.repeated === 189) rootAnd31++;
  }
}
assert.equal(root189, 16);
assert.equal(rootAnd31, 1);
process.stdout.write(JSON.stringify({
  status: 'source-conditional structure only; NO UNKNOWN PLAINTEXT',
  base60SignedDHToFirstZero: {fromIndex: 189, printed: '3C', firstZeroIndex: 192,
    secondZeroIndex: 229, bracketLength: zeroBracket.length,
    sameDHExampleShared2Column186Value: historicalDH.clientPublic,
    serverPublic8ColumnCarryDirectFirstZero: 192,
    sourceValue19OccursOnceAt186: true,
    sourceValue192OccursAt: [67,162,189,247],
    p39RedDoubleRoot: p39Root, requiresZeroBasedCoordinates: true,
    firstTwoOriginalTablePagesRows: [10,13],
    thirdOriginalTablePageBeginsRow: 23,
    dhExponentKeyPosttableIoC: symbolIoc(postPlain),
    dhExponentKeyHeldoutIoC: symbolIoc(terminalPlain)},
  radix: 59,
  selfPointingCell: 189,
  originalToken: '3C',
  zeroBasedCoordinates: [23, 5],
  proposedHistoricalDH: {modulus: 23, generator: 5},
  candidateSeed: 73,
  pathLengthIncludingRoot: candidate.nodes.length,
  candidatePath: candidate.nodes,
  thirteenDotMarks: 31,
  pathDotOverlap: overlap,
  shuffledSameMultiset: {trials, allToRoot189: root189,
    allToRoot189And73Has31NonrootSteps: rootAnd31}
}, null, 2) + '\n');
