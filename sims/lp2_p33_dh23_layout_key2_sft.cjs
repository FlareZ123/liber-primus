"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const model = buildSourceNativeTrigramModel({
  corpus, referenceText: read("resources/liber-primus/lp1-plaintext-reference.txt")
});
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m);
const physicalPart = page => parts[page <= 49 ? page : page - 1];
function wordRows(page) {
  let offset = 0;
  const words = (physicalPart(page).replace(/\/\s*/g, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map(w => [...w].map(r => {
      const n = runeIndex.get(r); assert.notEqual(n, undefined); return n;
    }));
  return words.map(values => {
    const row = { values, start: offset, end: offset + values.length };
    offset = row.end; return row;
  });
}
const mod = (n, m) => ((n % m) + m) % m;
function powMod(b, e, m) {
  let r = 1; for (; e > 0; e = Math.floor(e / 2), b = b * b % m) if (e % 2) r = r * b % m;
  return r;
}
function formatWords(values, rows) {
  let offset = 0;
  return rows.map(row => {
    const word = values.slice(offset, offset + row.values.length);
    offset += row.values.length; return model.spell(word);
  }).join(" ");
}
const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
assert.equal(powMod(dh.g, dh.a, dh.p), dh.A);
assert.equal(powMod(dh.g, dh.b, dh.p), dh.B);
assert.equal(powMod(dh.B, dh.a, dh.p), dh.K);
assert.equal(powMod(dh.A, dh.b, dh.p), dh.K);
const rows = wordRows(33);
const bodyRows = rows.filter(r => r.start >= 99 && r.end <= 214);
const body = bodyRows.flatMap(r => r.values);
assert.equal(bodyRows.length, 28);
assert.equal(body.length, 115);
assert.deepEqual(body, corpus.pages.find(p => p.page === 33).indices.slice(99, 214));
assert.deepEqual(bodyRows.map(r => r.values.length),
  [6,7,4,3,4,2,2,3,2,4,2,1,9,8,4,4,9,5,5,2,4,2,4,3,7,3,5,1]);
const orbit = []; let state = dh.K;
for (let i = 0; i < dh.p - 1; i++) { orbit.push(state); state = state * dh.g % dh.p; }
assert.equal(state, dh.K); orbit.push(0);
assert.equal(orbit.length, 23); assert.equal(new Set(orbit).size, 23);
const plus = body.map((v,i) => mod(v + orbit[i % 23], 29));
const minus = body.map((v,i) => mod(v - orbit[i % 23], 29));
const matrix = Array.from({length:5},(_,r)=>body.slice(r*23,(r+1)*23));
const columns = orbit.flatMap(c => matrix.map(row => row[c]));
const reverseColumns = [...columns].reverse();
const p57 = corpus.pages.find(p => p.page === 57).indices;
const scores = {
  p57_positive_control: model.scoreStream(p57).mean,
  raw_body2: model.scoreStream(body).mean,
  add_K2_orbit: model.scoreStream(plus).mean,
  subtract_K2_orbit: model.scoreStream(minus).mean,
  columns_K2_orbit: model.scoreStream(columns).mean,
  reverse_columns_K2_orbit: model.scoreStream(reverseColumns).mean
};
const expected = [-2.468144714244746,-3.45779903030822,-3.414285324681327,-3.4357974287643076,-3.3901746211245496,-3.405065970388025];
Object.values(scores).forEach((v,i)=>assert(Math.abs(v-expected[i])<1e-12));
console.log(JSON.stringify({
  dh23:dh, body:{page:33,offsets:[99,214],runes:body.length,words:bodyRows.length,
    word_lengths:bodyRows.map(r=>r.values.length)}, orbit_K2_g5:orbit, scores,
  word_preserving_outputs:{raw:formatWords(body,bodyRows),add:formatWords(plus,bodyRows),subtract:formatWords(minus,bodyRows)},
  transposed_outputs:{columns:model.spell(columns),reverse_columns:model.spell(reverseColumns)}
},null,2));
