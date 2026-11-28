"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(x) { return ((x % 29) + 29) % 29; }
function gp(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = gpTokens.find(x => s.startsWith(x.symbol, i));
    assert.ok(token, "unmapped " + s.slice(i));
    out.push(token.value); i += token.symbol.length;
  }
  return out;
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/)
  .filter(x => /^[A-Za-z]+$/.test(x))
  .map((label, index) => ({
    index, ordinal: index + 1, label: label.toUpperCase(), gp: gp(label),
  }));
assert.equal(signed.length, 43);

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const allWords = [];
let current = [], startPage = -1, endPage = -1, start = -1;
function flush() {
  if (!current.length) return;
  allWords.push({page:startPage, endPage, start, values:current.slice()});
  current = [];
}
for (let block = 0; block < parts.length; block++) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const ch of parts[block]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) { startPage = page; start = offset; }
      endPage = page; current.push(value); offset++;
    } else if (!/[\s/]/u.test(ch)) flush();
  }
}
flush();
const canonical = allWords.filter(word => word.page === word.endPage);
const local = page => canonical.filter(word => word.page === page);
const word = (page, ordinal) => local(page)[ordinal - 1] || null;
function hpair(w) {
  if (!w || w.values.length !== 3) return null;
  const [left, center, right] = w.values;
  return [mod29(left - right), mod29(left + right), center];
}

function source(label) {
  const hit = signed.find(x => x.label === label);
  assert.ok(hit, label);
  return hit;
}
function branch(label, origin) {
  const target = source(label);
  const page = origin === "zero" ? target.index : target.ordinal;
  const receiver = word(page, target.ordinal);
  return {label, origin, page, ordinal:target.ordinal, targetLength:target.gp.length, receiver};
}

const verifyZero = branch("VERIFY", "zero");
const verifyOne = branch("VERIFY", "one");
assert.deepEqual([verifyZero.page, verifyZero.ordinal, verifyZero.targetLength], [41,42,6]);
assert.deepEqual(verifyZero.receiver.values, [27,12,5,0,17,13,19]);
assert.equal(verifyZero.receiver.values.length, 7);
assert.equal(verifyZero.receiver.values[3], 0);
assert.equal(verifyZero.receiver.values.length - 1, verifyZero.targetLength);
assert.deepEqual([verifyOne.page, verifyOne.ordinal], [42,42]);
assert.deepEqual(verifyOne.receiver.values, [11,13,11]);
assert.notEqual(verifyOne.receiver.values.length, 7);

const K = 2;
const selectorHits = [];
for (let page = 0; page <= 55; page++) {
  const pageWords = local(page);
  for (let i = 0; i < pageWords.length; i++) {
    const h = hpair(pageWords[i]);
    if (!h || h.join(",") !== "2,1,0") continue;
    const destination = pageWords[i + K] || null;
    selectorHits.push({
      page, ordinal:i + 1, start:pageWords[i].start,
      destination: destination && {
        ordinal:i + K + 1, start:destination.start, values:destination.values,
      },
    });
  }
}
assert.deepEqual(selectorHits, [{
  page:42, ordinal:43, start:206,
  destination:{ordinal:45,start:211,values:[10,0,14,1,3,26,8,2]},
}]);

const openZero = branch("OPENPGP", "zero");
const openOne = branch("OPENPGP", "one");
assert.deepEqual([openZero.page, openZero.ordinal, openZero.targetLength], [42,43,7]);
assert.deepEqual(openZero.receiver.values, [16,0,14]);
assert.deepEqual(hpair(openZero.receiver), [2,1,0]);
assert.equal(selectorHits[0].destination.values.length, 8);
assert.equal(selectorHits[0].destination.values[1], 0);
assert.equal(selectorHits[0].destination.values.length - 1, openZero.targetLength);

assert.deepEqual([openOne.page, openOne.ordinal], [43,43]);
assert.deepEqual(openOne.receiver.values, [22,17,8]);
assert.deepEqual(hpair(openOne.receiver), [14,1,17]);
assert.notDeepEqual(hpair(openOne.receiver), [2,1,0]);

console.log(JSON.stringify({
  status:"PASS",
  test:"chronological post-gate target-blind receiver predicates under two source-register origins",
  chronology:{
    originGateClosed:"2026-11-28T07:40:06Z",
    p41Commit:"bb414a6b574faf5e806e79aebd29776e601915af @ 08:50:41Z",
    p42Commit:"3f394505b4d6f066390e472c24a88fc741f88b39 @ 08:52:47Z",
  },
  verify:{
    zero:{page:41,ordinal:42,values:verifyZero.receiver.values,passesCenterFLength:true},
    oneBased:{page:42,ordinal:42,values:verifyOne.receiver.values,passesCenterFLength:false},
  },
  openpgp:{
    zero:{page:42,ordinal:43,values:openZero.receiver.values,hpair:hpair(openZero.receiver),passesK1F:true},
    oneBased:{page:43,ordinal:43,values:openOne.receiver.values,hpair:hpair(openOne.receiver),passesK1F:false},
    globalK1FSelectorHits:selectorHits,
  },
  score:{zeroOrigin:"2/2",oneBased:"0/2"},
  inferenceLimit:"chronological post-gate consistency only; investigations followed zero-origin route, so not an origin-blind p-value or plaintext proof",
}, null, 2));
