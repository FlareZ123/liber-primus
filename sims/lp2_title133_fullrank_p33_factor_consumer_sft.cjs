"use strict";

/**
 * SFT: title133 full-rank factors -> independently selected p33 section states.
 *
 * Reconstructs the class-A 31-of-256 rank and its fixed factorization, then
 * consumes the factor values through the already established modulo-256 p50
 * address space and the independently selected p33 M/NG section grammar.
 *
 * Run:
 *   node sims/lp2_title133_fullrank_p33_factor_consumer_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const dh = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3};
const q = 4;
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let out = 1n;
  for (let i = 1; i <= kk; i += 1) {
    out = out * BigInt(n - kk + i) / BigInt(i);
  }
  return out;
}

/** @param {number} n @param {number} k @param {number[]} positions */
function lexRank(n, k, positions) {
  let rank = 0n;
  let previous = -1;
  for (let i = 0; i < k; i += 1) {
    for (
      let candidate = previous + 1;
      candidate < positions[i];
      candidate += 1
    ) {
      rank += choose(n - candidate - 1, k - i - 1);
    }
    previous = positions[i];
  }
  return rank;
}

/** @param {number} start @param {number} steps */
function walk(start, steps) {
  const path = [start];
  let current = start;
  for (let i = 0; i < steps; i += 1) {
    assert.ok(current >= 0 && current < table.length);
    current = table[current];
    path.push(current);
  }
  return path;
}

// Reconstruct title133 class A: all 13-dot marks plus the 225 red runes.
const events = [];
let serial = 0;
for (const page of [...ink.pages].sort((left,right) => left.page-right.page)) {
  for (const span of page.red_spans || []) {
    const runes = Array.from(span.runes);
    for (let i = 0; i < runes.length; i += 1) {
      events.push({
        page:page.page,
        offset:span.start+i+0.5,
        bit:0,
        serial:serial++,
      });
    }
  }
  for (const [offset,dots,color] of page.large_punctuation || []) {
    if (dots !== 13) continue;
    events.push({
      page:page.page,
      offset,
      bit:1,
      color,
      serial:serial++,
    });
  }
}
events.sort((left,right) =>
  left.page-right.page ||
  left.offset-right.offset ||
  ((left.bit ? 0 : 1) - (right.bit ? 0 : 1)) ||
  left.serial-right.serial
);
const positions = events
  .map((event,index) => event.bit ? index : null)
  .filter(index => index !== null);
assert.equal(events.length,256);
assert.equal(positions.length,31);

const rank = lexRank(256,31,positions);
assert.equal(rank,6823208894503251143167281798760439560912n);

const factor43 = 43n;
const q13 = 5051n;
const q32 = 3435600587n;
const q79 = 571505208178548184347727n;
assert.equal(rank,16n*factor43*q13*q32*q79);

const lowBytes = {
  factor43:Number(factor43 & 255n),
  q13:Number(q13 & 255n),
  q32:Number(q32 & 255n),
  q79:Number(q79 & 255n),
};
assert.deepEqual(lowBytes,{factor43:43,q13:187,q32:203,q79:79});

// Reconstruct p33's two source body lengths from the canonical transcription.
const runeSet = new Set(corpus.runes);
const countRunes = value => [...value].filter(ch => runeSet.has(ch)).length;
const pages = transcription.split("%");
const p33Text = pages[33];
const firstUnitEnd = p33Text.indexOf("&");
assert.ok(firstUnitEnd > 0);
const firstUnit = p33Text.slice(0,firstUnitEnd);
const firstTitleEnd = firstUnit.indexOf(".");
assert.ok(firstTitleEnd > 0);
const firstTitleLength = countRunes(firstUnit.slice(0,firstTitleEnd));
const firstBodyLength = countRunes(firstUnit) - firstTitleLength;

const secondUnit = p33Text.slice(firstUnitEnd+1);
const secondTitleEnd = secondUnit.indexOf(".");
assert.ok(secondTitleEnd > 0);
const secondTitleLength = countRunes(secondUnit.slice(0,secondTitleEnd));
const secondBodyLength = countRunes(secondUnit) - secondTitleLength;

assert.deepEqual(
  {firstTitleLength,firstBodyLength,secondTitleLength,secondBodyLength},
  {firstTitleLength:10,firstBodyLength:81,secondTitleLength:8,secondBodyLength:115}
);
assert.equal(firstTitleLength,dh.A+dh.K);
assert.equal(secondTitleLength,dh.A);

// Independently image-read p33 decorative markers are M and NG. Their GP
// ordinal/prime properties are fixed by Gematria Primus.
const markerMIndex = corpus.translit.indexOf("M");
const markerNGIndex = corpus.translit.indexOf("NG");
assert.ok(markerMIndex >= 0 && markerNGIndex >= 0);
const markerM = {
  translit:"M",
  ordinal:markerMIndex,
  prime:corpus.prime[markerMIndex],
};
const markerNG = {
  translit:"NG",
  ordinal:markerNGIndex,
  prime:corpus.prime[markerNGIndex],
};
assert.deepEqual(markerM,{translit:"M",ordinal:19,prime:71});
assert.deepEqual(markerNG,{translit:"NG",ordinal:21,prime:79});

// Existing p33 grammar: M-prime walked q steps reaches body1; NG-prime
// walked its printed A=8 title length reaches body2.
const markerMRoute = walk(markerM.prime,q);
const markerNGRoute = walk(markerNG.prime,dh.A);
assert.deepEqual(markerMRoute,[71,108,14,183,81]);
assert.deepEqual(markerNGRoute,[79,82,201,74,205,76,114,197,115]);
assert.equal(markerMRoute.at(-1),firstBodyLength);
assert.equal(markerNGRoute.at(-1),secondBodyLength);

// New factor consumers.
//
// q79 is not merely 79 bits: its low byte is exactly the independently visible
// NG marker prime. The already fixed A-step p50 grammar therefore consumes it.
assert.equal(lowBytes.q79,markerNG.prime);
assert.equal(walk(lowBytes.q79,dh.A).at(-1),secondBodyLength);

// From the independently selected second body state, q steps land exactly on
// the low byte of the q32 factor.
const secondBodyQRoute = walk(secondBodyLength,q);
assert.deepEqual(secondBodyQRoute,[115,247,192,0,203]);
assert.equal(secondBodyQRoute.at(-1),lowBytes.q32);

// The q13 factor selects p50 cell187; one ordinary pointer step lands exactly
// on first body length81, the same state selected by M-prime under q steps.
assert.equal(table[lowBytes.q13],firstBodyLength);
assert.equal(walk(lowBytes.q13,1).at(-1),firstBodyLength);
assert.equal(firstBodyLength,markerMRoute.at(-1));

// The q13 byte also has a pre-existing DH-coordinate spelling.
assert.equal(lowBytes.q13,dh.p*dh.A+dh.e);

// Bounded factor controls: among the four non-power factors, q79 alone has a
// low byte equal to either visible p33 marker prime, and q13 alone points in
// one p50 step to either body length.
const factors = [
  ["factor43",factor43],["q13",q13],["q32",q32],["q79",q79],
];
const markerPrimes = new Set([markerM.prime,markerNG.prime]);
const bodyLengths = new Set([firstBodyLength,secondBodyLength]);
const markerHits = factors
  .map(([name,value]) => ({name,byte:Number(value&255n)}))
  .filter(row => markerPrimes.has(row.byte));
const oneStepBodyHits = factors
  .map(([name,value]) => ({
    name,
    byte:Number(value&255n),
    next:table[Number(value&255n)],
  }))
  .filter(row => bodyLengths.has(row.next));

assert.deepEqual(markerHits,[{name:"q79",byte:79}]);
assert.deepEqual(oneStepBodyHits,[{name:"q13",byte:187,next:81}]);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "title133 full-rank factors have a fixed internal p33 consumer; Tor-v2 formatting is not required",
  rank:rank.toString(),
  lowBytes,
  p33:{
    markerM,
    markerNG,
    firstTitleLength,
    firstBodyLength,
    secondTitleLength,
    secondBodyLength,
    markerMRoute,
    markerNGRoute,
  },
  factorConsumers:{
    q79:[
      "q79 mod256 = 79 = prime(NG)",
      "p50^A(79) = 115 = p33 second-body length",
    ],
    q32:[
      "p50^q(115) = 203 = q32 mod256",
    ],
    q13:[
      "q13 mod256 = 187 = p*A+e",
      "p50[187] = 81 = p33 first-body length",
      "p50^q(prime(M)=71) = 81",
    ],
  },
  controls:{markerHits,oneStepBodyHits},
  decision:
    "Prefer internal route/state consumption of the full-rank factors. Do not promote pecvyau2ayqym5cp.onion without an independent historical receiver.",
},null,2));
