"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const parsed = parseLP2Words(read("resources/lp2-transcription.txt"), 57);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = new Map(corpus.pages.map((p) => [p.page, p]));
const marks = new Map(ink.pages.map((p) => [p.page, p]));
function interior(pageIndex) {
  return parsed.byContainedPage[pageIndex].flatMap((w) =>
    [...w.runes].slice(1, -1).map((r) => runeIndex.get(r)));
}
function base29(n) {
  const out = [];
  do { out.unshift(n % 29); n = Math.floor(n / 29); } while (n > 0);
  return out;
}
function primeOrdinal(n) {
  let count = 0;
  for (let x = 2; x <= n; x++) {
    let prime = true;
    for (let d = 2; d*d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) count++;
  }
  return count;
}
function choose(n, k) {
  let v = 1;
  for (let i = 1; i <= k; i++) v = v * (n - i + 1) / i;
  return v;
}
function subsetCount(values, k, target) {
  const dp = Array.from({length:k+1}, () => Array(target+1).fill(0));
  dp[0][0] = 1;
  for (const v of values) for (let j=k; j>=1; j--)
    for (let s=target; s>=v; s--) dp[j][s] += dp[j-1][s-v];
  return dp[k][target];
}
function centerFive(values) {
  const start = Math.floor((values.length - 5) / 2);
  return {start, values:values.slice(start,start+5)};
}
function markCount(page, offset) {
  const mark = marks.get(page).large_punctuation.find(
    (x) => x[0] === offset && x[2] === "red");
  assert.ok(mark);
  return mark[1];
}
const p55Words = parsed.byContainedPage[54];
const p55 = interior(54), p56 = interior(55), p57 = interior(56);
const core = centerFive(p55);
const weights = core.values.map((i) => corpus.prime[i]);
const sum = weights.reduce((a,b) => a+b, 0);
const digits = base29(sum);
const text = digits.map((i) => corpus.translit[i]).join("");
assert.equal(p55Words.length, 16);
assert.equal(p55Words.reduce((a,w) => a+w.length, 0), 75);
assert.equal(pages.get(55).runic_count, 76);
assert.equal(p55.length, 43);
assert.deepEqual(core.values, [21,20,15,23,27]);
assert.deepEqual(weights, [79,73,53,89,107]);
assert.equal(sum, 401);
assert.deepEqual(digits, [13,24]);
assert.equal(text, "PA");
assert.deepEqual(pages.get(57).indices.slice(0,2), [13,24]);
assert.equal(runeIndex.get(marks.get(54).red_spans[0].runes[0]), 24);
assert.equal(markCount(55,76), 13);
assert.equal(markCount(57,7), 13);
assert.equal(markCount(57,95), 23);
assert.equal(p56.length, 36);
assert.equal(p57.length, 55);
assert.equal(primeOrdinal(401), 79);
assert.equal(p55.length + p56.length, 79);
const p56Text = base29(centerFive(p56).values.reduce((a,i)=>a+corpus.prime[i],0))
  .map((i)=>corpus.translit[i]).join("");
const p57Text = base29(centerFive(p57).values.reduce((a,i)=>a+corpus.prime[i],0))
  .map((i)=>corpus.translit[i]).join("");
assert.equal(p56Text, "HI");
assert.equal(p57Text, "THM");
const nulls = [];
for (let pageIndex=0; pageIndex<55; pageIndex++) {
  const vals = interior(pageIndex).map((i)=>corpus.prime[i]);
  const c = centerFive(vals);
  const count = subsetCount(vals,5,401);
  const physicalPage = pageIndex >= 50 ? pageIndex+1 : pageIndex;
  nulls.push({physicalPage, n:vals.length,
    centerSum:c.values.reduce((a,b)=>a+b,0),
    count, total:choose(vals.length,5), p:count/choose(vals.length,5)});
}
const p55Null = nulls.find((x)=>x.physicalPage===55);
assert.equal(p55Null.count,751);
assert.equal(p55Null.total,962598);
const familywise = 1-nulls.reduce((a,x)=>a*(1-x.p),1);
assert.deepEqual(nulls.filter((x)=>x.centerSum===401).map((x)=>x.physicalPage),[55]);
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash: SHA1\r?\n\r?\n/,"")
  .replace(/\b[0-9A-F]{8}\b/g,"");
const words = clear.match(/[A-Za-z]+/g) || [];
assert.equal(words.length,43);
assert.equal(words[12].toLowerCase(),"the");
assert.equal(words[23].toLowerCase(),"road");
console.log(JSON.stringify({
  p55:{completeWords:p55Words.length,interiorCount:p55.length,centerOffset:core.start,
    centralIndices:core.values,primeWeights:weights,sum,base29:digits,output:text},
  crossChecks:{p54FirstRedRune:24,p55Dots:markCount(55,76),
    p57TitlePrefix:pages.get(57).indices.slice(0,2),p57TitleDots:markCount(57,7),
    p57TerminalDots:markCount(57,95),primeOrdinal:79,p55PlusP56Interiors:79,
    signed2016Words13and24:[words[12],words[23]]},
  controls:{p56:p56Text,p57:p57Text,p55SubsetNull:p55Null.p,
    p55SubsetCount:p55Null.count,p55SubsetTotal:p55Null.total,
    familywiseAnyPageCenterSum401:familywise}
},null,2));
