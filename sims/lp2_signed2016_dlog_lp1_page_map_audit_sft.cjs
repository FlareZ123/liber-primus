"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const archiveReadme = read("resources/liber-primus/README.md");
const p15Established = read("results/lp2-p15-fibonacci-prime-spiral.md");
const cuneiformReport = read("im-results/lp2-cuneiform-1033-3301-gp29-primeindex-gate.md");

const bodyStart = signed.indexOf("Hello.");
const bodyEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && bodyEnd > bodyStart);
const sourceWords = signed.slice(bodyStart, bodyEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g) || [];
assert.equal(sourceWords.length, 43);
assert.deepEqual(
  [20,23,26,29,39,42].map(i => sourceWords[i].toLowerCase()),
  ["meaning","road","numbers","direction","false","openpgp"]
);

assert.equal(corpus.translit.length, 29);
assert.equal(corpus.prime.length, 29);
const tokens = ["TH","EO","NG","OE","AE","IA","EA",
  ...corpus.translit.filter(x => x.length === 1)];

/** @param {string} word @param {boolean} manuscriptOrthography */
function encode(word, manuscriptOrthography) {
  let s = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/Q/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S");
  if (manuscriptOrthography) {
    s = s.replace(/ING/g, "NG").replace(/IO/g, "IA");
  }
  const out = [];
  while (s.length) {
    const token = tokens.find(candidate => s.startsWith(candidate));
    assert.ok(token, `cannot GP-encode ${word}: ${s}`);
    out.push(corpus.translit.indexOf(token));
    s = s.slice(token.length);
  }
  return out;
}

/** @param {number} n */
function mod23(n) {
  return ((n % 23) + 23) % 23;
}

/** @param {number} base */
function primitiveRoot(base) {
  const seen = new Set();
  let x = 1;
  for (let e = 0; e < 22; e++) {
    seen.add(x);
    x = (x * base) % 23;
  }
  return seen.size === 22;
}

/** @param {number} value @param {number} base */
function discreteLog(value, base) {
  value = mod23(value);
  if (value === 0) return null;
  let x = 1;
  for (let e = 0; e < 22; e++) {
    if (x === value) return e;
    x = (x * base) % 23;
  }
  return null;
}

/** @param {string} word @param {boolean} manuscriptOrthography @param {"prime"|"gp0"} metric */
function wordNumber(word, manuscriptOrthography, metric) {
  const indices = encode(word, manuscriptOrthography);
  if (metric === "gp0") return indices.reduce((a, b) => a + b, 0);
  return indices.reduce((sum, i) => sum + corpus.prime[i], 0);
}

const primitiveRoots = Array.from({length:21}, (_, i) => i + 2)
  .filter(primitiveRoot);
assert.deepEqual(primitiveRoots, [5,7,10,11,14,15,17,19,20,21]);
assert.equal((5 * 14) % 23, 1);

const literalRows = sourceWords.map((word, index) => {
  const indices = encode(word, false);
  const gp0 = indices.reduce((a, b) => a + b, 0);
  const primeSum = indices.reduce((sum, i) => sum + corpus.prime[i], 0);
  return {
    index,
    word,
    tokens:indices.map(i => corpus.translit[i]).join(" "),
    gp0,
    primeSum,
    residue:mod23(primeSum),
    log5:discreteLog(primeSum, 5)
  };
});

const reported = {
  meaning:{primeSum:319,page:5},
  road:{primeSum:204,page:5},
  numbers:{primeSum:295,page:15},
  direction:{primeSum:337,page:17},
  openpgp:{primeSum:249,page:15}
};
for (const [word, expected] of Object.entries(reported)) {
  const row = literalRows.find(x => x.word.toLowerCase() === word);
  assert.equal(row.primeSum, expected.primeSum);
  assert.equal(row.log5, expected.page);
}
const beware = literalRows.find(x => x.word.toLowerCase() === "beware");
assert.equal(beware.residue, 0);
assert.equal(beware.log5, null);
assert.equal(literalRows.find(x => x.word.toLowerCase() === "false").log5, 8);

const nativeMeaning = wordNumber("meaning", true, "prime");
const nativeDirection = wordNumber("direction", true, "prime");
assert.equal(nativeMeaning, 288);
assert.equal(nativeDirection, 406);
assert.equal(discreteLog(nativeMeaning, 5), 20);
assert.equal(discreteLog(nativeDirection, 5), 17);

const targetPages = {meaning:5,road:5,numbers:15,openpgp:15,direction:17};
const variants = [];
for (const manuscriptOrthography of [false,true]) {
  for (const metric of ["prime","gp0"]) {
    for (const base of primitiveRoots) {
      for (const orientation of ["forward","inverse"]) {
        for (const origin of [0,1]) {
          const map = new Map();
          for (const word of sourceWords) {
            const log = discreteLog(
              wordNumber(word, manuscriptOrthography, metric),
              base
            );
            const exponent = log === null ? null :
              (orientation === "forward" ? log : (22 - log) % 22);
            map.set(
              word.toLowerCase(),
              exponent === null ? null : exponent + origin
            );
          }
          const score = Object.entries(targetPages)
            .filter(([word, page]) => map.get(word) === page).length;
          variants.push({
            manuscriptOrthography, metric, base, orientation, origin, score, map
          });
        }
      }
    }
  }
}
assert.equal(variants.length, 160);
const scoreHistogram = {};
for (const variant of variants) {
  scoreHistogram[variant.score] = (scoreHistogram[variant.score] || 0) + 1;
}
assert.deepEqual(scoreHistogram, {0:136,1:18,2:2,4:2,5:2});

const exact = variants.filter(x => x.score === 5);
assert.equal(exact.length, 2);
assert.deepEqual(
  exact.map(x => [
    x.manuscriptOrthography, x.metric, x.base, x.orientation, x.origin
  ]),
  [
    [false,"prime",5,"forward",0],
    [false,"prime",14,"inverse",0]
  ]
);
for (const word of sourceWords) {
  assert.equal(
    exact[0].map.get(word.toLowerCase()),
    exact[1].map.get(word.toLowerCase())
  );
}

const pageCounts = new Map();
for (const row of literalRows) {
  pageCounts.set(row.log5, (pageCounts.get(row.log5) || 0) + 1);
}
assert.equal(pageCounts.get(5), 2);
assert.equal(pageCounts.get(15), 2);
assert.equal(pageCounts.get(17), 4);
const shuffleProbability = (2/43) * (1/42) * (2/41) * (1/40) * (4/39);
assert.ok(Math.abs(shuffleProbability - 1/7219485) < 1e-15);

assert.ok(archiveReadme.includes("LP1 occupies `00.jpg`–`16.jpg` (17 images)"));
assert.ok(/(?:LP2 physical page|physical LP2 page)[^\n]*15/.test(p15Established));
assert.ok(p15Established.includes("red 3299"));
assert.ok(cuneiformReport.includes("physical pp33–39"));
assert.ok(cuneiformReport.includes("`1033` and `3301`"));

/** @param {number} page */
function lp1Section(page) {
  const marker = `### ${page}`;
  const start = lp1Reference.indexOf(marker);
  if (start < 0) return null;
  const next = lp1Reference.indexOf("\n### ", start + marker.length);
  return lp1Reference.slice(start, next < 0 ? undefined : next);
}

const p5 = lp1Section(5);
const p8 = lp1Section(8);
const p15 = lp1Section(15);
const p16 = lp1Section(16);
assert.ok(p5 && p5.includes("THE PRIMES ARE SACRED") && p5.includes("TOTIENT"));
assert.ok(p15 && !p15.includes("3299"));
assert.ok(p16 && !p16.includes("1033"));
assert.equal(lp1Section(17), null);

const falsePage = exact[0].map.get("false");
assert.equal(falsePage, 8);
assert.ok(p8 && p8.includes("Continuation of pages 06-09 spread"));
assert.ok(!p8.includes("WARNING") && !p8.includes("DECEPTION"));

console.log(JSON.stringify({
  classification:"NEGATIVE: retire LP1 clue-page interpretation",
  sourceWordCount:sourceWords.length,
  primitiveRoots,
  literalPrimeBase5Map:literalRows,
  tokenizerSensitivity:{
    literalMeaningPrimeSum:reported.meaning.primeSum,
    manuscriptMeaningPrimeSum:nativeMeaning,
    literalMeaningPage:reported.meaning.page,
    manuscriptMeaningPage:discreteLog(nativeMeaning, 5),
    literalDirectionPrimeSum:reported.direction.primeSum,
    manuscriptDirectionPrimeSum:nativeDirection
  },
  rivalFamily:{
    total:variants.length,
    scoreHistogram,
    exactReportedVariants:exact.map(x => ({
      manuscriptOrthography:x.manuscriptOrthography,
      metric:x.metric,
      base:x.base,
      orientation:x.orientation,
      origin:x.origin
    })),
    exactVariantsAreOneAlgebraicClass:true
  },
  postSelectedLabelShuffle:{
    probability:shuffleProbability,
    oneIn:1/shuffleProbability
  },
  namespaceAudit:{
    lp1Images:"00.jpg..16.jpg",
    page5PrimeTotient:true,
    claimedPage15_3299:false,
    actual3299:"LP2 physical p15",
    claimedLP1Page17_1033:false,
    actual1033:"LP2 physical pp33..39"
  },
  heldout:{
    word:"FALSE",
    selectedPage:falsePage,
    expectedClass:"warning/deception/false-path",
    actualClass:"koan continuation",
    pass:false,
    beware:{residue:beware.residue,page:beware.log5}
  },
  decision:"Arithmetic survives under one literal-tokenization equivalence class. The LP1 clue interpretation conflates LP1 with LP2, and the locked FALSE diagnostic misses."
}, null, 2));
