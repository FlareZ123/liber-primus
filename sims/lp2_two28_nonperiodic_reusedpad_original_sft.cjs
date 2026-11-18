"use strict";

/**
 * Complete original-input necessary-condition gate for the source-motivated
 * physical p,p+28 shared additive GP29 pad. The pad is allowed to be totally
 * arbitrary and nonperiodic, with a fresh secret sequence for every pair.
 *
 * Compare same page-local offsets (natural 28-page fold) and independently
 * clue-motivated +42 offsets (the unique p27 local28..33 = p55 local70..75
 * six-rune echo), excluding those six copied cells from the +42 gate.
 *
 * Windows 11, Node.js 22+, CommonJS; read-only; no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalPages = corpus.pages.filter((page) => page.page >= 0 && page.page <= 55);
assert.equal(originalPages.length, 56);
assert.deepEqual(originalPages.map((page) => page.page),
  Array.from({length:56}, (_, i) => i));
const original = originalPages.map((page) => page.indices);
const lengths = original.map((p) => p.length);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(original[50].length, 0);
assert.equal(original[27].slice(28, 34).join(","),
  original[55].slice(70, 76).join(","));

/**
 * Exact source-visible two-28 page pairing and explicit original alignment.
 * The +42 mode excludes the source-defining p27/p55 copied six-rune witness.
 * @param {number[][]} pages
 * @param {0|42} displacement
 * @returns {{opportunities:number, matches:number, ratio:number, byPair:object[]}}
 */
function coincidences(pages, displacement) {
  let opportunities = 0;
  let matches = 0;
  const byPair = [];
  for (let p = 0; p < 28; p++) {
    const left = pages[p];
    const right = pages[p + 28];
    let tested = 0;
    let equal = 0;
    for (let i = 0; i < left.length; i++) {
      const j = i + displacement;
      if (j >= right.length) continue;
      if (displacement === 42 && p === 27 && i >= 28 && i < 34)
        continue; // the six known motif symbols do not score as evidence
      tested++;
      if (left[i] === right[j]) equal++;
    }
    opportunities += tested;
    matches += equal;
    byPair.push({first:p,second:p+28,opportunities:tested,matches:equal});
  }
  return {opportunities,matches,ratio:matches/opportunities,byPair};
}

/** @param {number[]} sequence @returns {number[][]} */
function pagesFromTape(sequence) {
  let cursor = 0;
  const split = lengths.map((len) => {
    const page = sequence.slice(cursor,cursor+len);
    cursor += len;
    assert.equal(page.length,len);
    return page;
  });
  assert.equal(cursor,sequence.length);
  return split;
}

const translit = new Map(corpus.translit.map((x, i) => [x,i]));
/**
 * Encode English in the same historically established GP29 transliteration
 * used by the existing source-native control SFTs.
 * @param {string} token
 * @returns {number[]}
 */
function encodeWord(token) {
  const normalized = token.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING",i)) {
      out.push(21); i += 3;
    } else if (normalized.startsWith("IO",i)) {
      out.push(27); i += 2;
    } else {
      const digraph = normalized.slice(i,i+2);
      const rune = translit.has(digraph) ? digraph : normalized[i];
      assert.ok(translit.has(rune), "No GP rune for " + rune);
      out.push(translit.get(rune));
      i += rune.length;
    }
  }
  return out;
}
/** @param {string} raw @returns {number[]} */
function encodeEnglish(raw) {
  return (raw.match(/[A-Za-z]+/g) || []).flatMap(encodeWord);
}

/** @returns {() => number} */
function randomSource() {
  let seed = 0x33011728;
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
}
/**
 * Encrypt native GP plaintext under a different secret, entirely arbitrary
 * nonperiodic additive key per physical 28-page pair. The same offset-key is
 * used in both paired source pages. All non-paired cells get random keys.
 * @param {number[][]} plainPages
 * @param {0|42} displacement
 * @returns {number[][]}
 */
function encryptSharedPad(plainPages,displacement) {
  const rand = randomSource();
  const pads = plainPages.map(p=>p.map(() => rand()%29));
  for(let p=0;p<28;p++) {
    for(let i=0;i<plainPages[p].length;i++) {
      const j=i+displacement;
      if(j>=plainPages[p+28].length)continue;
      pads[p+28][j]=pads[p][i];
    }
  }
  return plainPages.map((page,p)=>
    page.map((rune,i)=>(rune+pads[p][i])%29));
}

const sourceCounts = {};
const controls = [];
for (const [name,rel] of [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
]) {
  const encoded = encodeEnglish(read(rel));
  sourceCounts[name]=encoded.length;
  for(let offset=0;offset+12956<=encoded.length;offset+=12956) {
    const pages=pagesFromTape(encoded.slice(offset,offset+12956));
    controls.push({source:name,offset,
      same:coincidences(pages,0), echoOffset42:coincidences(pages,42)});
  }
}
assert.equal(controls.filter(x=>x.source==="Shakespeare").length,16);
assert.equal(controls.filter(x=>x.source==="Gibran").length,4);

const originalSame = coincidences(original,0);
const original42 = coincidences(original,42);
assert.deepEqual([originalSame.opportunities,originalSame.matches],[5663,195]);
assert.deepEqual([original42.opportunities,original42.matches],[4815,151]);
assert.ok(controls.every(x=>x.same.ratio>originalSame.ratio));
assert.ok(controls.every(x=>x.echoOffset42.ratio>original42.ratio));

const plantSource=pagesFromTape(
  encodeEnglish(read("resources/control/shakespeare_first300k.txt")).slice(0,12956));
const planted = [];
for(const displacement of [0,42]) {
  const before=coincidences(plantSource,displacement);
  const encrypted=encryptSharedPad(plantSource,displacement);
  const after=coincidences(encrypted,displacement);
  assert.deepEqual([after.opportunities,after.matches],
    [before.opportunities,before.matches]);
  assert.notDeepEqual(encrypted,plantSource);
  planted.push({displacement,matchedBefore:before.matches,
    matchedAfter:after.matches,positions:after.opportunities});
}

const pairs = controls.map(({source,offset,same,echoOffset42})=>({
  source,offset,same:same.matches,
  echoOffset42:echoOffset42.matches
}));
const summarize=(name)=>({
  n:controls.length,
  minimumMatches:Math.min(...controls.map(x=>x[name].matches)),
  maximumMatches:Math.max(...controls.map(x=>x[name].matches)),
  meanMatches:controls.reduce((s,x)=>s+x[name].matches,0)/controls.length,
  minimumRate:Math.min(...controls.map(x=>x[name].ratio))
});
console.log(JSON.stringify({
  original:{pages:56,runeBearingPages:55,runelessPage50:true,
    length:12956,paired28Same:originalSame,
    paired28Offset42EchoExcluded:original42},
  sourceCounts,
  controls:{total:controls.length,
    same:summarize("same"),echoOffset42:summarize("echoOffset42"),pairs},
  reusedArbitraryNonperiodicGP29PadPlant:planted,
  conclusion:"Direct same-offset or +42 source-echo-offset additive GP29 key reuse across every p,p+28 pair fails a key-independent original-cipher plaintext-coincidence necessity test in the studied source-native GP-English register; no original plaintext or key recovered"
},null,2));
console.log("PASS: original 28-page pair key-reuse necessity and native plaintext positive plants");
