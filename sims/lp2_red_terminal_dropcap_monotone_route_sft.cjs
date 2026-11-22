"use strict";
/**
 * Original LP2: last rune of each red span → oversized first red rune
 * on a later physical page, under the signed 2016 "numbers direction"
 * hint's simplest increasing-page interpretation. Distinct historical
 * page-57 known plaintext is tested as an unfitted direct running key.
 * Read-only, Windows Node.js 22 single-file test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const resource = (file) => path.join(__dirname, "..", "resources", "liber-primus", file);
const co = JSON.parse(fs.readFileSync(resource("lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(resource("lp2-ink-annotations.json"), "utf8"));
const ord = new Map(co.runes.map((r, i) => [r, i]));
const bigCapSources = [
  "0:0","3:0","3:119","6:71","8:0","15:9","23:0","27:0",
  "33:0","33:91","39:119","40:0","54:0","56:0","57:0"
];
const reds = ink.pages.flatMap(({page, red_spans}) =>
  (red_spans || []).map(({start, length, runes}) => {
    const glyphs = [...runes].map(c => ord.get(c));
    assert.equal(glyphs.length, length);
    assert.ok(glyphs.every(Number.isInteger));
    const ident = page + ":" + start;
    const original = co.pages.find(p => p.page === page);
    assert.deepEqual(original.indices.slice(start, start + length), glyphs);
    return {
      page, start, ident, length, first: glyphs[0],
      last: glyphs[glyphs.length - 1]
    };
  }));
assert.equal(reds.length, 18);
const giants = reds.filter(x => bigCapSources.includes(x.ident));
assert.equal(giants.length, 15);
assert.equal(new Set(giants.map(x=>x.ident)).size, 15);
const links = reds.flatMap(s => giants.filter(t =>
  t.page > s.page && s.last === t.first).map(t => ({
    source: s.ident, destination: t.ident,
    rune: co.translit[s.last]
  })));
assert.deepEqual(links, [
  {source:"7:194", destination:"27:0", rune:"M"},
  {source:"15:0", destination:"54:0", rune:"A"},
  {source:"15:9", destination:"33:91", rune:"NG"},
  {source:"27:0", destination:"57:0", rune:"P"}
]);
const twoHop = links.flatMap(a => links.filter(b => b.source === a.destination)
  .map(b => ({source:a.source, via:a.destination,
    destination:b.destination, markings:[a.rune,b.rune]})));
assert.deepEqual(twoHop, [{
  source:"7:194", via:"27:0", destination:"57:0",
  markings:["M","P"]
}]);
for(const [from,to,last] of [[7,27,19],[54,27,19],[27,57,13]]) {
  const a = reds.find(x => x.page === from && x.last === last);
  assert.ok(a);
  const b = giants.find(x => x.page === to && x.first === last);
  assert.ok(b);
}
const page = p => co.pages.find(x=>x.page===p).indices;
const known = page(57);
assert.equal(known.length,95);
const keys = [
  ["heading7",known.slice(0,7)],
  ["body88",known.slice(7)],
  ["all95",known]
];
/** @param {number} x @returns {number} */
const mod = x => ((x % 29)+29)%29;
/** @param {readonly number[]} a @returns {number} */
const ioc = a => {
  const counts=Array(29).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
/**
 * @param {number[]} xs
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} transparentF
 * @returns {{out:number[],illegalF:number}}
 */
function decode(xs, key, sign, transparentF) {
  const out=[];
  let clock=0, illegalF=0;
  for(const cipher of xs) {
    if(transparentF && cipher===0) { out.push(0); continue; }
    const plain = mod(cipher + sign*key[clock % key.length]);
    if(transparentF && cipher!==0 && plain===0) illegalF++;
    out.push(plain);
    clock++;
  }
  return {out,illegalF};
}
// Cipher implementation positive on an actual, independently solved
// 95-rune passage under a planted source-heading running key.
const heading = keys[0][1];
const planted=known.map((p,i)=>mod(p + heading[i%heading.length]));
assert.deepEqual(decode(planted,heading,-1,false).out,known);
const receivers=[
  ["p27-black215",page(27).slice(19)],
  ["p54-black223",page(54).slice(9)],
  ["p55-all76",page(55)]
];
const outcomes=[];
for (const [name,cs] of receivers) for (const [keyName,key] of keys)
  for(const sign of [-1,1]) for(const transparentF of [false,true]) {
    const {out, illegalF}=decode(cs,key,sign,transparentF);
    outcomes.push({name,keyName,sign,transparentF,illegalF,
      ioc:Number(ioc(out).toFixed(6)),
      start:out.slice(0,40).map(c=>co.translit[c]).join("")});
  }
for(const [name,high] of [
  ["p27-black215",0.041], ["p54-black223",0.038],
  ["p55-all76",0.045]
]) {
  const max = Math.max(...outcomes.filter(x=>x.name===name).map(x=>x.ioc));
  assert.ok(max < high, name+" registered high-IoC readout: "+max);
}
console.log(JSON.stringify({
  originalRedSpans:reds.length, sourceVerifiedOversized:giants.length,
  allIncreasingLinks:links, allIncreasingTwoHopPaths:twoHop,
  sourcePage57IoC:Number(ioc(known).toFixed(6)),
  directKnownP57RunningKey:outcomes
},null,2));
console.log("PASS: exact unique 7→27→57 original-source route, and source-key inverse controls");
