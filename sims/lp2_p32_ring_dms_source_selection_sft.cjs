#!/usr/bin/env node
"use strict";

/**
 * Original-input source-selection gate for LP2 p57 four-ring -> 2016 four-word
 * -> 256-cell grid -> LP2 p32 compass -> speculative GPS/DMS.
 *
 * This deliberately freezes the previously proposed zero-based addressing,
 * byte compass orientation and start cell; it exhausts ordering and coordinate
 * interpretations rather than choosing a desired landmark.
 *
 * Node.js 22, from repository root: node sims/lp2_p32_ring_dms_source_selection_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const text = signed.slice(signed.indexOf("Hello."), signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const words = text.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g);
assert.equal(words.length, 43);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(grid.pages.map(x => x.page), [49, 50, 51]);

const tokens = corpus.translit.map((token, index) => ({
  token: token.toUpperCase(), index
})).sort((a, b) => b.token.length - a.token.length);
/** @param {string} word */
function primeSum(word) {
  const norm = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  let total = 0;
  for (let at = 0; at < norm.length;) {
    const t = tokens.find(x => norm.startsWith(x.token, at));
    assert.ok(t);
    total += corpus.prime[t.index];
    at += t.token.length;
  }
  return total;
}
/** @param {number} x */
function phi(x) {
  let n = x, result = x;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    while (n % p === 0) n /= p;
    result -= result / p;
  }
  if (n > 1) result -= result / n;
  return result;
}
const rings = Array.from({length: 4}, (_, i) => 2 * (32 - 2*i + 8 - 2*i) - 4);
assert.deepEqual(rings, [76,68,60,52]);
const oneBased = rings.map(phi).reverse();
assert.deepEqual(oneBased, [24,16,32,36]);
const selected = oneBased.map(i => words[i - 1].toLowerCase());
assert.deepEqual(selected, ["road","words","and","found"]);
const sums = selected.map(primeSum);
assert.deepEqual(sums, [204,179,215,130]);
const bytes = selected.map((_, i) => grid.bytes[sums[i]]);
assert.deepEqual(bytes, [194,175,84,86]);

const directions = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const p32 = corpus.pages.find(p => p.page === 32).indices;
assert.equal(p32.length, 121);
assert.equal(p32.slice(33,38).map(i => corpus.translit[i]).join(""), "HOMEX");
const mod = (a, m) => (a % m + m) % m;
/** @param {number[]} key */
function walk(key) {
  let row = 3, col = 0;
  const result = [];
  for (const b of key) {
    const [dr,dc] = directions[b & 7];
    const distance = b >> 3;
    row = mod(row + dr*distance, 11);
    col = mod(col + dc*distance, 11);
    result.push(11*row + col);
  }
  return result;
}
assert.deepEqual(walk(bytes), [35,47,36,37]);
assert.deepEqual(walk([...bytes].reverse()), [34,23,35,37]);

/** @template T @param {T[]} xs */
function permute(xs) {
  if (!xs.length) return [[]];
  return xs.flatMap((value, i) =>
    permute(xs.filter((_, j) => i !== j)).map(tail => [value, ...tail]));
}
const permutations = permute([0,1,2,3]);
assert.equal(permutations.length, 24);
/** @param {number[]} p */
function asDegrees(p) {
  assert.equal(p.length,4);
  return p[0] + p[1]/60 + p[2]/3600 + p[3]/360000;
}
const routes = permutations.map(order => {
  const cells = walk(order.map(i => bytes[i]));
  return {order: order.map(i => selected[i]), cells, degrees: asDegrees(cells)};
});
assert.equal(routes.length,24);
assert.ok(routes.every(r => r.cells[1] < 60 && r.cells[2] < 60 &&
  r.cells[3] < 100 && r.cells[0] <= 90));
assert.deepEqual([...new Set(routes.map(r => r.cells[3]))],[37]);
assert.deepEqual([...new Set(routes.map(r => r.cells[0]))].sort((a,b)=>a-b),
  [22,34,35,45]);
assert.equal(new Set(routes.map(r => r.cells.join(","))).size,24);

// Fixed BEFORE location comparison: all fourteen archived 2012 poster coordinates.
// The source historically uses decimal-degree signed latitude/longitude, not DMS.
// https://3301cicada.wordpress.com/2012-2/
// https://uncovering-cicada.fandom.com/wiki/Map_of_all_locations_of_3301s_posters
const poster2012 = [
  [52.216802,21.018334],[48.85057059876962,2.406892329454422],
  [48.85030144151387,2.407538741827011],[47.664196,-122.313301],
  [47.637520,-122.346277],[47.622993,-122.312576],
  [37.577070,126.813122],[37.5196666666667,126.995],
  [36.0665472222222,-94.1726416666667],[33.966808,-117.650488],
  [29.909098706850486,-89.99312818050384],[25.684702,-80.441289],
  [21.584069,-158.104211],[-33.90281,151.18421]
];
/** @param {[number,number]} a @param {[number,number]} b */
function distanceKm(a,b) {
  const rad = Math.PI/180;
  const [lat1,lon1] = a.map(x=>x*rad);
  const [lat2,lon2] = b.map(x=>x*rad);
  const h = Math.sin((lat2-lat1)/2)**2 + Math.cos(lat1)*Math.cos(lat2) *
    Math.sin((lon2-lon1)/2)**2;
  return 2 * 6371.0088 * Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
let closest = {distanceKm: Infinity};
let pairCount = 0;
for (const lat of routes) {
  for (const lon of routes) {
    if (lat === lon) continue;
    for (const latSign of [1,-1]) {
      for (const lonSign of [1,-1]) {
        const coordinate = [lat.degrees*latSign,lon.degrees*lonSign];
        for (let i=0;i<poster2012.length;i++) {
          const d=distanceKm(coordinate,poster2012[i]);
          if (d < closest.distanceKm) closest = {distanceKm:d,coordinate,
            posterIndex:i,latRoute:lat.order,lonRoute:lon.order};
        }
        pairCount++;
      }
    }
  }
}
assert.equal(pairCount, 24*23*4);
assert.ok(Math.abs(closest.distanceKm - 720.8204763192779) < 1e-8);
console.log(JSON.stringify({
  classification:"No source-selected DMS/GPS destination, no unknown-page plaintext",
  original2016WordIndices:oneBased,
  originalWordSums:sums,
  originalTableBytes:bytes,
  possibleRouteCount:routes.length,
  validDMSRouteCount:routes.length,
  possibleDMSRoutes:routes,
  lastCellForcedByCommutativeDisplacement:37,
  old2012PosterFormat:"Signed decimal-degree latitude and longitude",
  candidateLatLonReadingsConsideringAllOrdersAndSigns:pairCount,
  closestKnown2012PosterKm:closest,
  caveat:"The original manuscript supplies no DMS, coordinate-pairing, sign, or unique permutation selector."
},null,2));
console.log("SFT PASS: all source routes and historic-coordinate comparison.");
