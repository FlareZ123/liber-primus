"use strict";

/**
 * Director #3407 exploratory/decision SFT.
 *
 * Freeze the p6 4/5/4 address-grid grammar, then ask which original red
 * controls can instantiate it without target-specific additions. For the one
 * transformed analogue justified independently (p23), also grant the strongest
 * source-motivated completion: terminal 13-dot supplies the global stencil,
 * p23 red H4 supplies roles, the established THE ONE RISE supplies +1, and the
 * adjacent black-successor H boundary supplies F=0. Scan the same whole-book
 * structural receiver family used by the p6 matched-null, without plaintext
 * spelling or fitted key values.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const mod29 = (x) => ((x % 29) + 29) % 29;

function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

function outerH(values) {
  const half = Math.floor(values.length / 2);
  const out = [];
  for (let i = 0; i < half; i += 1) {
    out.push(mod29(values[i] - values[values.length - 1 - i]));
  }
  if (values.length % 2) out.push(values[half]);
  for (let i = half - 1; i >= 0; i -= 1) {
    out.push(mod29(values[i] + values[values.length - 1 - i]));
  }
  return out;
}

function addressGrid(roles, one, F) {
  const [r0, r1, r2, r3] = roles;
  const left = [r1, one, mod29(-r1), r0];
  const center = [r1, one, F, one, mod29(-r1)];
  const transition = [mod29(-r3), r2, mod29(-r0), one];
  const right = left.map((value, i) => mod29(value + transition[i]));
  return [...left, ...center, ...right];
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
      values.push(21); offset += 3; continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27); offset += 2; continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

// Canonical page-local words, with exact rune offsets.
const parts = transcription.split(/^\s*%\s*$/m);
function pageSegment(p) {
  if (p === 50) return "";
  return parts[p >= 51 ? p - 1 : p];
}
function pageWords(p) {
  if (p === 50) return [];
  const row = corpus.pages.find((x) => x.page === p);
  assert.ok(row);
  const out = [];
  let values = [];
  let start = 0;
  let offset = 0;
  const emit = () => {
    if (!values.length) return;
    out.push({ start, values });
    values = [];
  };
  for (const ch of pageSegment(p)) {
    if (runeIndex.has(ch)) {
      if (!values.length) start = offset;
      assert.equal(row.indices[offset], runeIndex.get(ch));
      values.push(runeIndex.get(ch));
      offset += 1;
    } else if ("-.&$§".includes(ch)) {
      emit();
    }
  }
  emit();
  assert.equal(offset, row.indices.length);
  return out;
}
const pages = Array.from({ length: 56 }, (_, p) => pageWords(p));

// Reconstruct all red spans and their complete printed word-length vectors.
const redSpans = [];
for (const ann of ink.pages) {
  const ws = ann.page <= 55 ? pages[ann.page] : pageWords(ann.page);
  for (const span of ann.red_spans || []) {
    const wordLengths = ws
      .filter((w) =>
        w.start >= span.start &&
        w.start + w.values.length <= span.start + span.length
      )
      .map((w) => w.values.length);
    const punct = ann.large_punctuation || [];
    const start13 = punct.some((m) =>
      m[0] === span.start && m[1] === 13 && m[2] === "red"
    );
    const end13 = punct.some((m) =>
      m[0] === span.start + span.length && m[1] === 13 && m[2] === "red"
    );
    const successor = ws.find((w) => w.start === span.start + span.length) || null;
    redSpans.push({
      page: ann.page,
      start: span.start,
      length: span.length,
      wordLengths,
      start13,
      end13,
      successor,
    });
  }
}

const double13 = redSpans.filter((x) => x.start13 && x.end13);
assert.deepEqual(
  double13.map((x) => [x.page, x.start, x.wordLengths]),
  [
    [3,119,[3]],
    [6,71,[4,1,4,2]],
    [7,194,[2,4,3,2,3]],
    [15,0,[4,5]],
    [15,9,[4,2,5]],
    [33,91,[3,5]],
    [39,119,[3]],
  ]
);

// Strict literal program requires the global 13-dot stencil plus four source
// roles and the literal singleton-width 1 that occurs inside the red seed.
const strictLiteral = double13.filter((x) =>
  x.wordLengths.length === 4 && x.wordLengths.includes(1)
);
assert.deepEqual(strictLiteral.map((x) => [x.page, x.start]), [[6,71]]);

const p6 = redSpans.find((x) => x.page === 6 && x.start === 71);
const p23 = redSpans.find((x) => x.page === 23 && x.start === 0);
assert.ok(p6 && p23);
assert.deepEqual(p6.wordLengths, [4,1,4,2]);
assert.deepEqual(p23.wordLengths, [2,6,3,5]);
assert.equal(p23.start13, false);
assert.equal(p23.end13, true);
assert.ok(p23.successor);
assert.equal(outerH(p23.successor.values)[0], 0);

// P23 is the only four-word transformed analogue independently justified by
// the p6->p23 red morphism and #3403 black continuation. Generously grant:
// - its terminal 13-dot as the shared 4/5/4 stencil;
// - +1 from the established THE ONE RISE cardinal readout;
// - F=0 from its immediate black successor's H boundary.
// No target/corridor values are used to construct this tape.
const p23Roles = h4(p23.wordLengths);
assert.deepEqual(p23Roles, [26,3,9,7]);
const p23Delta = addressGrid(p23Roles, 1, 0);
assert.deepEqual(p23Delta, [3,1,26,26, 3,1,0,1,26, 25,10,0,27]);

// Parse the authenticated 2016 source only for source-word arity/index.
// Spelling is never used as a score.
const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .slice(signed.indexOf("Hello."));
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({ index, length: gp(word).length }));
assert.equal(sourceWords.length, 43);

const q = 4;
const K = 2;
const F = 0;
function hPair3(values) {
  assert.equal(values.length, 3);
  return [mod29(values[0]-values[2]), mod29(values[0]+values[2]), values[1]];
}

// Same target-free structural receiver classes frozen in the p6 matched null.
const prepared = pages.map((words) => {
  const maps = {
    direct: new Map(),
    adj23: new Map(),
    centerQ: new Map(),
    centerF: new Map(),
    terminal: new Map(),
  };
  const put = (map, length, residue) => {
    const key = length + "|" + residue;
    map.set(key, (map.get(key) || 0) + 1);
  };
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const residue = mod29(index + 1);
    put(maps.direct, word.values.length, residue);
    if (
      index + 1 < words.length &&
      word.values.length === 2 &&
      words[index + 1].values.length === 3
    ) {
      put(maps.adj23, 5, residue);
    }
    if (word.values.length % 2 === 1) {
      const middle = (word.values.length - 1) / 2;
      if (word.values[middle] === q) put(maps.centerQ, word.values.length - 1, residue);
      if (word.values[middle] === F) put(maps.centerF, word.values.length - 1, residue);
    }
    if (word.values.length > 1 && word.values[1] === F && index >= K) {
      const marker = words[index - K];
      if (
        marker.values.length === 3 &&
        hPair3(marker.values).join(",") === "2,1,0"
      ) {
        put(maps.terminal, word.values.length - 1, residue);
      }
    }
  }
  return maps;
});
const kindByLane = [
  "direct","direct","direct","direct","direct",
  "adj23","centerQ",
  "direct","direct","direct","direct",
  "centerF","terminal",
];

function laneCount(sourceStart, pageStart, lane, delta) {
  const source = sourceWords[sourceStart + lane];
  const page = pageStart + lane;
  const residue = mod29(source.index + delta[lane]);
  const map = prepared[page][kindByLane[lane]];
  return map.get(source.length + "|" + residue) || 0;
}

const survivors = [];
const scoreHist = new Map();
for (let sourceStart = 0; sourceStart <= 30; sourceStart += 1) {
  for (let pageStart = 0; pageStart <= 43; pageStart += 1) {
    const counts = [];
    let score = 0;
    for (let lane = 0; lane < 13; lane += 1) {
      const count = laneCount(sourceStart, pageStart, lane, p23Delta);
      counts.push(count);
      if (count > 0) score += 1;
    }
    scoreHist.set(score, (scoreHist.get(score) || 0) + 1);
    if (score === 13) survivors.push({ sourceStart, pageStart, counts });
  }
}

console.log(JSON.stringify({
  classification:
    "Director #3407 transformed-control test; structural addressing only, no plaintext/key score",
  literalControls: {
    double13Count: double13.length,
    strictLiteralProgramSites: strictLiteral.map((x) => ({
      page: x.page, start: x.start, wordLengths: x.wordLengths,
    })),
    p15NearControl: double13
      .filter((x) => x.page === 15)
      .map((x) => ({ start:x.start, wordLengths:x.wordLengths })),
  },
  p23GenerousTransformedAnalogue: {
    redLengths: p23.wordLengths,
    h4Roles: p23Roles,
    start13: p23.start13,
    end13: p23.end13,
    importedOneFromEstablishedP23CardinalReadout: 1,
    adjacentBlackHBoundaryF: outerH(p23.successor.values)[0],
    delta: p23Delta,
  },
  structuralScan: {
    sourceWindows: 31,
    pageIntervals: 44,
    alignments: 31*44,
    full13LaneSurvivors: survivors,
    scoreHistogram: Object.fromEntries([...scoreHist.entries()].sort((a,b)=>a[0]-b[0])),
  },
  evidenceBoundary:
    "P23 requires a transformed-analogue grant because it lacks p6's double bracket and visible singleton-width 1. A full 13-lane survivor would still be structural, not plaintext authentication.",
}, null, 2));
