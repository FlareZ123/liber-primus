"use strict";
/**
 * SFT: one conditional "EAST OF THE MAP" continuation of the externally
 * selected 27x27 passage, tested on wholly unselected original LP2 p3.
 *
 * The *candidate*, not authenticated, 38-block p0-p2 reading says:
 * "THE KEY IS TO GO TO THE EAST OF THE MAP".
 * Independent original p32 + 2016 signed-image checksum fixes a candidate
 * 11x11 map (first row prime sum 563 = width; first column 569 = height).
 * Two *source-visible* competing maps: the claim's own 27x27 p0-p2
 * map (27-rune east edge), and the independently supported signed-image
 * 11x11 p32 map (11-rune east edge). Each is tested exactly once on the
 * next physical LP2 page3 without altering the original ciphertext.
 * Free parameters fixed here: no skip, initial phase0, no rekey or tuning.
 *
 * No unknown plaintext is recovered; original p3 output remains random-like.
 * Node 22+ / CommonJS / no dependencies / no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const d = JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"
));
/** @param {number} page @returns {number[]} */
function get(page) {
  const x = d.pages.find((p) => p.page === page);
  assert.ok(x);
  return x.indices;
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const x of arr) counts[x]++;
  return counts.reduce((s,n) => s+n*(n-1), 0)/(arr.length*(arr.length-1));
}
/**
 * @param {number[]} vals
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function transform(vals,key,sign) {
  return vals.map((x,i) => (x+29+sign*key[i%key.length])%29);
}
const map=get(32),cipher=get(3);
const first729=get(0).concat(get(1),get(2));
assert.equal(first729.length,729);
const ownMapEast=Array.from({length:27},(_,r)=>first729[r*27+26]);
const ownMapWest=Array.from({length:27},(_,r)=>first729[r*27]);
assert.deepEqual(ownMapEast,
  [17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]);
const selfMapOut=transform(cipher,ownMapEast,-1);
const selfMapWrong=transform(cipher,ownMapWest,-1);
assert.deepEqual(transform(selfMapOut,ownMapEast,1),cipher);
assert.ok(Math.abs(ioc(selfMapOut)-0.03332479945383171)<1e-12);
assert.ok(Math.abs(ioc(selfMapWrong)-0.035970302099334356)<1e-12);
assert.equal(map.length,121);
assert.equal(cipher.length,217);
// 2016 width/height source control: top row/left column.
assert.equal(map.slice(0,11).reduce((s,x)=>s+d.prime[x],0),563);
assert.equal(Array.from({length:11},(_,i)=>d.prime[map[i*11]])
  .reduce((s,x)=>s+x,0),569);
const east=Array.from({length:11},(_,row)=>map[row*11+10]);
const west=Array.from({length:11},(_,row)=>map[row*11+0]);
assert.deepEqual(east,[21,7,2,23,14,17,7,2,11,24,12]);
const result=transform(cipher,east,-1);
assert.deepEqual(transform(result,east,1),cipher);
assert.ok(Math.abs(ioc(cipher)-0.03306878306878307)<1e-12);
assert.ok(Math.abs(ioc(result)-0.03375149342891278)<1e-12);
// Wrong-edge geometry control, not an alternative to optimize.
const control=transform(cipher,west,-1);
assert.ok(Math.abs(ioc(control)-0.03439153439153439)<1e-12);
// Synthetic source-native known text control tests exact full-page arithmetic.
const solved=get(57);
const plant=Array.from({length:217},(_,i)=>solved[i%solved.length]);
assert.deepEqual(transform(transform(plant,east,1),east,-1),plant);
assert.deepEqual(transform(transform(plant,ownMapEast,1),ownMapEast,-1),plant);
assert.notDeepEqual(transform(transform(plant,ownMapEast,1),ownMapWest,-1),plant);
assert.notDeepEqual(transform(transform(plant,east,1),west,-1),plant);
console.log("p0-p2 own-map eastern-edge GP key:",ownMapEast.map(k=>d.translit[k]).join(" "));
console.log("p0-p2 own-map eastern output IoC:",ioc(selfMapOut));
console.log("p0-p2 wrong-west output IoC:",ioc(selfMapWrong));
console.log("p32 independent-map eastern-edge key:",east.map(k=>d.translit[k]).join(" "));
console.log("p3 native rune count:",cipher.length);
console.log("IoC p3 original:",ioc(cipher));
console.log("IoC p3 decoded east:",ioc(result));
console.log("IoC p3 wrong west edge:",ioc(control));
console.log("Decoded first 40:",
  result.slice(0,40).map(x=>d.translit[x]).join(" "));
console.log("PASS: both direct maps re-encrypt 217 original runes, both plants recover 217/217.");
console.log("No authentic p3 plaintext recovered under this frozen operation.");
