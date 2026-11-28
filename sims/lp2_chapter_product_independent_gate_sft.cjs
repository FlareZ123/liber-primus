"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const runeId = new Map(corpus.runes.map((rune, i) => [rune, i]));
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const chapters = [0,3,8,15,23,27,33,40,54];
const mod29 = (x) => ((x % 29) + 29) % 29;
const product = (values) => values.reduce((n, x) => mod29(n * x), 1);

function chapterRecord(page) {
  const source = corpus.pages.find((row) => row.page === page).indices;
  const ann = ink.pages.find((row) => row.page === page);
  let redEnd = ann.red_spans[0].length;
  for (let i = 1; i < ann.red_spans.length && ann.red_spans[i].start === redEnd; i += 1) {
    redEnd += ann.red_spans[i].length;
  }
  const text = transcription[page >= 51 ? page - 1 : page];
  const words = [];
  let current = [];
  let offset = 0;
  const emit = () => {
    if (!current.length) return;
    words.push(current.slice());
    current = [];
  };
  for (const ch of text) {
    if (runeId.has(ch)) {
      assert.equal(source[offset], runeId.get(ch));
      current.push({ offset, value: source[offset] });
      offset += 1;
    } else if ("-.&$§".includes(ch)) {
      emit();
    }
  }
  emit();
  assert.equal(offset, source.length);

  const redWords = words.filter((word) => word[0].offset < redEnd && word.at(-1).offset < redEnd);
  const firstBlack = words.find((word) => word[0].offset === redEnd);
  assert.ok(firstBlack);

  const red = source.slice(0, redEnd);
  const black = firstBlack.map((x) => x.value);
  const primitive = new Set([
    redEnd % 29,
    red[0],
    red.at(-1),
    ...redWords.map((word) => word.length % 29),
  ]);
  if (red.length % 2) primitive.add(red[Math.floor(red.length / 2)]);

  return {
    page,
    black,
    redEnd,
    redWordLengths: redWords.map((word) => word.length),
    primitive,
  };
}

const records = chapters.map(chapterRecord);
const statistics = {
  length: (w) => w.length % 29,
  rune_sum: (w) => mod29(w.reduce((a,b) => a+b, 0)),
  rune_product: (w) => product(w),
  prime_sum: (w) => mod29(w.reduce((a,b) => a + primes[b], 0)),
  prime_product: (w) => mod29(w.reduce((a,b) => a * primes[b], 1)),
  first: (w) => w[0],
  last: (w) => w.at(-1),
  first_plus_last: (w) => mod29(w[0] + w.at(-1)),
  first_times_last: (w) => mod29(w[0] * w.at(-1)),
};

const expected = [
  [0,4,15,23],
  [3,4,9,11],
  [8,3,23,2],
  [15,4,22,13],
  [23,8,25,16],
  [27,7,2,19],
  [33,2,5,3],
  [40,5,27,3],
  [54,8,19,27],
];
assert.deepEqual(records.map((r) => [
  r.page,
  statistics.length(r.black),
  statistics.rune_sum(r.black),
  statistics.rune_product(r.black),
]), expected);

const inValues = records.map((r) => statistics.rune_sum(r.black));
function graph(outName) {
  return records.map((record) => {
    const value = statistics[outName](record.black);
    return inValues.flatMap((x, i) => x === value ? [i] : []);
  });
}
function longestFrom0(edges) {
  let best = [];
  function walk(node, seen, path) {
    if (path.length > best.length) best = path.slice();
    for (const next of edges[node]) {
      if (seen.has(next)) continue;
      const copy = new Set(seen);
      copy.add(next);
      walk(next, copy, [...path, next]);
    }
  }
  walk(0, new Set([0]), [0]);
  return best.map((i) => chapters[i]);
}

const outFamily = Object.keys(statistics).filter((name) => name !== "rune_sum");
const routeCensus = Object.fromEntries(outFamily.map((name) => [name, longestFrom0(graph(name))]));
assert.deepEqual(routeCensus, {
  length: [0],
  rune_product: [0,8,27,54,40],
  prime_sum: [0],
  prime_product: [0],
  first: [0,27,3],
  last: [0,23],
  first_plus_last: [0,40],
  first_times_last: [0],
});

const fields = {
  length: (w) => w.length % 29,
  sum: statistics.rune_sum,
  product: statistics.rune_product,
  first: statistics.first,
  last: statistics.last,
};
const tail = new Set([27,54,40]);
const primitiveMatches = {};
for (const [name, fn] of Object.entries(fields)) {
  primitiveMatches[name] = records
    .filter((r) => tail.has(r.page))
    .map((r) => ({ page: r.page, value: fn(r.black), hit: r.primitive.has(fn(r.black)) }));
}
assert.deepEqual(
  Object.fromEntries(Object.entries(primitiveMatches).map(([name, rows]) => [
    name, rows.filter((row) => row.hit).length,
  ])),
  { length: 2, sum: 1, product: 3, first: 1, last: 2 }
);

const allPrimitiveCounts = Object.fromEntries(Object.entries(fields).map(([name, fn]) => [
  name,
  records.filter((r) => r.primitive.has(fn(r.black))).length,
]));
assert.deepEqual(allPrimitiveCounts, { length: 4, sum: 2, product: 5, first: 1, last: 2 });

console.log(JSON.stringify({
  classification:
    "PRODUCT is the strongest conditional OUT statistic, but no common red-source rule independently selects it",
  fixedIn: "rune_sum",
  routeCensus,
  routeTailRawPrimitiveMatches: primitiveMatches,
  allNineRawPrimitiveMatchCounts: allPrimitiveCounts,
  decision:
    "retain first-black+SUM as causally stronger; keep PRODUCT-as-OUT and PRODUCT-dependent downstream algebra conditional pending a common source cue or fresh receiver",
}, null, 2));
