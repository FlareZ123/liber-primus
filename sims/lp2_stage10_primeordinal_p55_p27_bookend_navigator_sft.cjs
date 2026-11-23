"use strict";
/**
 * Independent first-party 2014 Stage10 filename-ordinal ⇄ p55 terminal
 * repeated-ciphertext navigation, plus exact p27 next-word GP-prime/table
 * handoff. Read-only source assertions; no unknown LP2 plaintext claim.
 *
 * Node.js 22, Windows11:
 * node sims/lp2_stage10_primeordinal_p55_p27_bookend_navigator_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const load = name => fs.readFileSync(path.join(root, name), "utf8");
const html = load("resources/external/2014-stage10-post-square-response.html");
const files = [...html.matchAll(/<img src="\/(\d+)[.]jpg" \/>/g)].map(m => Number(m[1]));
assert.deepEqual(files, [107, 167, 229]);
const prime = [2];
for (let n = 3; n <= 300; n += 2) {
  if (prime.every(p => n % p !== 0)) prime.push(n);
}
const ordinal = files.map(v => prime.indexOf(v) + 1);
assert.deepEqual(ordinal, [28, 39, 50]);
const source = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const at = p => source.pages.find(v => v.page === p).indices;
const p55 = at(55), p27 = at(27), p56 = at(56);
assert.equal(p55.length, 76);
assert.equal(p27.length, 234);
assert.equal(p56.length, 85);
const six = p55.slice(-6);
const seam = six.concat(p56[0]);
const hits = [];
for (const page of source.pages.filter(x => x.page <= 55)) {
  const s = page.indices;
  for (let i = 0; i + six.length <= s.length; i++) {
    if (six.every((v,j) => s[i+j] === v)) hits.push([page.page,i]);
  }
}
assert.deepEqual(hits, [[27,28],[55,70]]);
assert.deepEqual(p27.slice(28,34), six);
assert.deepEqual(p27.slice(28,35), seam);
assert.equal(p55[75], six[5]);
assert.equal(55 - 27, ordinal[0]);
assert.equal(28, ordinal[0]);
assert.equal(p27[34], p56[0]); // p56 first rune AE extends shared seam
assert.deepEqual(p27.slice(34,36), [25,0]); // first full word after echo: AE.F
assert.deepEqual(source.prime.slice(0,4), [2,3,5,7]);
const nextWordGpPrimeSum = source.prime[25] + source.prime[0];
assert.equal(nextWordGpPrimeSum, 103);
const tokens = table.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(tokens.slice(103,105), ["0W","3Q"]);
const signed2013 = load("resources/external/2013-tcp-server-signed-source.md");
assert.ok(signed2013.includes("BASE29 3301 → 3QO"));
const counterTargets = ordinal.slice(1).map(n => 55 - n);
assert.deepEqual(counterTargets, [16,5]);
const nullHits = counterTargets.map(p => {
  let count = 0;
  const s = at(p);
  for (let i = 0; i + six.length <= s.length; i++)
    count += Number(six.every((v,j) => s[i+j] === v));
  return {p,count};
});
assert.ok(nullHits.every(v => v.count === 0));
const spell = a => a.map(v => source.translit[v]).join(".");
console.log(JSON.stringify({
  source:"Exact HTML 2014 Stage10 107.jpg/167.jpg/229.jpg",
  primeOrdinal:ordinal,ordinalStep:[11,11],
  zeroBasedPageAddresses:ordinal.map(i=>i-1),
  backwardFromLastUnsolvedPage:ordinal.map(i=>55-i),
  independentP55TerminalSix:spell(six),
  p55TerminalRuneOffset:70,
  printedP27MatchingPage:27,
  p27MatchingRuneOffset:28,
  twoIndependent28Identities:{"55_minus_27":55-27, "p27_local_offset":28},
  firstFilenamePrimeOrdinal:ordinal[0],
  p55ToP56PhysicalSeamSeven:spell(seam),
  p27UnbrokenCipherSubstring:spell(p27.slice(28,35)),
  firstAfterEchoCompleteWord:spell(p27.slice(34,36)),
  firstAfterEchoWholeWordPrimeSum:nextWordGpPrimeSum,
  tableOriginalTokens103and104:tokens.slice(103,105),
  historic2013SignedBase29:"3301=3QO",
  allPhysicalOriginalCipherSixRuneHits:hits,
  otherHistoricalFilenameBackwardTargetHits:nullHits,
  strongQualification:"The source does not specify prime ordinal, reverse count, next-word prime sum or table lookup; all are conditional historical navigation hypotheses, no unknown plaintext"
},null,2));
console.log("PASS exact first-party filename ordinals and seven-rune original physical p55-p56 -> p27 navigation");
