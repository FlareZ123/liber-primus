"use strict";
/**
 * P53 black/red, p54 enlarged-A, p55 tree vs original LP2 numeric pages.
 * Exact, source-selected 128 two-byte table pairs and two 128-rune streams.
 * Tests a *bounded* 16-case additive GP29 2-byte/2-rune reading.
 *
 * Run: node sims/terminal_p50_two_byte_page_frame_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {any} */
const readJson = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const page = n => corpus.pages.find(p => p.page === n);
const marks = n => ink.pages.find(p => p.page === n);

assert.deepEqual(grid.pages.map(p => [p.page, p.bytes.length]),
  [[49,80],[50,104],[51,72]]);
assert.deepEqual(grid.pages.map(p => p.bytes.length/2),[40,52,36]);
assert.deepEqual(marks(53).red_spans.map(s => [s.start,s.length]),
  [[128,51]]);
assert.deepEqual(marks(54).red_spans.map(s => [s.start,s.length]),
  [[0,9]]);
assert.equal(page(54).indices[0],24); // illuminated enlarged A
assert.deepEqual([page(53).indices.length,page(54).indices.length,
  page(55).indices.length],[179,232,76]);

const black = page(53).indices.slice(0,128);
const marked = [...page(53).indices.slice(128),
  page(54).indices[0], ...page(55).indices];
assert.deepEqual([black.length,marked.length,grid.bytes.length],[128,128,256]);
assert.equal(page(53).indices.slice(128).length+1,52);
assert.equal(page(55).indices.length,40+36);
assert.deepEqual(marks(53).large_punctuation,[[179,13,"red"]]);
assert.deepEqual(marks(54).large_punctuation,[[9,13,"red"]]);
assert.deepEqual(marks(55).large_punctuation,[[76,13,"red"]]);

const mod29 = x => (x%29+29)%29;
/** @param {number[]} a */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[mod29(x)]++;
  return f.reduce((s,n) => s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
const translit = a => a.map(x => corpus.translit[mod29(x)]).join("");
const middle = grid.pages.find(p => p.page === 50).bytes;
const left = grid.pages.find(p => p.page === 49).bytes;
const right = grid.pages.find(p => p.page === 51).bytes;
const sources = {
  "printed-p49-p50-p51":grid.bytes,
  "middle-first-p50-p49-p51":[...middle,...left,...right]
};

/**
 * @param {number[]} source
 * @param {number[]} first
 * @param {-1|1} signBlack
 * @param {-1|1} signX
 * @param {-1|1} signY
 * @returns {number[]}
 */
function decode(source, first, signBlack, signX, signY) {
  assert.equal(source.length,256);
  assert.equal(first.length,128);
  return marked.map((b,i) =>
    mod29(b+signBlack*first[i]+signX*source[2*i]+signY*source[2*i+1]));
}
/**
 * @param {number[]} plain
 * @param {number[]} source
 * @param {number[]} first
 * @param {-1|1} signBlack
 * @param {-1|1} signX
 * @param {-1|1} signY
 * @returns {number[]}
 */
function encode(plain, source, first, signBlack, signX, signY) {
  assert.equal(plain.length,128);
  return plain.map((v,i) =>
    mod29(v-signBlack*first[i]-signX*source[2*i]-signY*source[2*i+1]));
}

/** @param {string} text @returns {number[]} */
function nativeGP(text) {
  const tokens = corpus.translit.map((s,i) => ({s,i}))
    .sort((a,b) => b.s.length-a.s.length);
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    for (let k=0;k<word.length;) {
      const hit=tokens.find(t=>word.startsWith(t.s,k));
      assert(hit,"GP-spellable reference language");
      out.push(hit.i);
      k+=hit.s.length;
    }
  }
  return out;
}
const native = nativeGP(fs.readFileSync(path.join(ROOT,
  "resources/control/gibran_prophet_58585.txt"),"utf8"));
assert.equal(native.length,62696);
const positive = native.slice(1024,1152);
assert.equal(positive.length,128);
const referenceIoCs = [];
for (let i=0;i+128<=native.length;i+=128)
  referenceIoCs.push(ioc(native.slice(i,i+128)));
assert.equal(referenceIoCs.length,489);
const nativeLowest = Math.min(...referenceIoCs);
assert(Math.abs(nativeLowest-0.04982775590551181)<1e-12);

const results = [];
for (const [name,source] of Object.entries(sources)) {
  assert.equal(source.length,256);
  for (const signBlack of [-1,1])
    for (const signX of [-1,1])
      for (const signY of [-1,1]) {
        const output = decode(source,black,signBlack,signX,signY);
        // For source-original ciphertext, verify algebraically by re-encoding
        // the candidate; this does not establish that the candidate is real.
        assert.deepEqual(encode(output,source,black,
          signBlack,signX,signY),marked);
        // True independent native-GP positive: do not adapt parameters to
        // source ciphertext or the planted plaintext.
        const plantCipher = encode(positive,source,black,
          signBlack,signX,signY);
        const plantRecovered = plantCipher.map((cipher,i) =>
          mod29(cipher+signBlack*black[i]+
            signX*source[2*i]+signY*source[2*i+1]));
        assert.deepEqual(plantRecovered,positive);
        results.push({
          layout:name,signBlack,signX,signY,
          originalIoC:ioc(output),
          first40GP:translit(output.slice(0,40))
        });
      }
}
assert.equal(results.length,16);
const originalBest = Math.max(...results.map(x=>x.originalIoC));
assert(originalBest<0.04);
assert(originalBest<nativeLowest);

console.log(JSON.stringify({
  status:"original source-level grouping; bounded negative, no unknown plaintext",
  structural:{
    numericPageCounts:[80,104,72],
    numericPagePairs:[40,52,36],
    blackRunes:128,redP53Runes:51,enlargedRedA:1,
    remainingP54RedHeadingRunes:8,lastTreePageRunes:76,
    matchedMiddlePairs:52,matchedOuterPairs:76,
    terminal13DotMarks:[179,9,76]
  },
  original:{
    candidates:results.length,model:"B_i plus signed A_i and two signed numeric byte residues modulo29",
    rawBlackIoC:ioc(black),rawMarkedIoC:ioc(marked),
    bestOriginalIoC:originalBest,results
  },
  positive:{
    nativeRunes:positive.length,nativeIoC:ioc(positive),
    exactOriginalRoundtrips:16,exactNativePlantRecoveries:16,
    GibranNonoverlapWindows:referenceIoCs.length,
    nativeLowestIoC:nativeLowest
  },
  scope:"Two source-sized layouts and both signs per component. No evidence for this additive codec; nonlinear/external encoding remains open."
},null,2));
