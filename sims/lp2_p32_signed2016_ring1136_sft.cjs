"use strict";
/**
 * LP2 physical p32 nested GP-prime circumferences versus the authenticated
 * 2016 OutGuess-signed plaintext byte count. Node.js 22 CommonJS SFT.
 *
 * Pure original-input reproduction, no language model or unknown-cipher fit.
 * The randomization is descriptive and preserves both independently attested
 * 2016 image-size axes entry for entry.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
// Windows checkout may replace LF with CRLF; restore exact original
// authenticated Git-blob bytes before the length/hash test.
const signedCheckedOut = fs.readFileSync(path.join(
  root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const signed = Buffer.from(signedCheckedOut.replace(/\r\n/g, "\n"), "utf8");
const signedImage = fs.readFileSync(path.join(
  root, "resources/historical/cicada2016-4gq25.jpg"));
/** @param {Buffer} bytes @returns {string} */
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

assert.equal(corpus.pages[32].runic_count, 121);
assert.equal(corpus.pages[32].status, "unsolved");
assert.equal(signed.length, 1136);
assert.equal(sha256(signed),
  "fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010");
assert(signed.toString("utf8").includes("Its words are the map"));
assert.equal(signedImage[0], 0xff);
assert.equal(signedImage[1], 0xd8);
const primes = corpus.pages[32].indices.map(index => corpus.prime[index]);
const gp = corpus.pages[32].indices.map(index => corpus.translit[index]);
assert.equal(primes.length, 121);

/**
 * Index the perimeter of the source-reshaped (11-2*depth)^2 square.
 * @param {number} depth @returns {number[]}
 */
function ring(depth) {
  const positions = [];
  for (let row=depth; row<11-depth; row++) {
    for (let col=depth; col<11-depth; col++) {
      if (row===depth || col===depth ||
          row===10-depth || col===10-depth)positions.push(row*11+col);
    }
  }
  return positions;
}
/** @param {number[]} values @param {number[]} positions @returns {number} */
const primeSum = (values, positions) =>
  positions.reduce((total, index) => total+values[index], 0);
const rings = Array.from({length:6},(_,i)=>ring(i));
const ringLengths = rings.map(x=>x.length);
const sums = rings.map(r=>primeSum(primes,r));
assert.deepEqual(ringLengths,[40,32,24,16,8,1]);
assert.deepEqual(sums,[1917,1539,1046,1136,388,19]);

const firstRow = Array.from({length:11},(_,i)=>i);
const firstColumn = Array.from({length:11},(_,i)=>i*11);
assert.equal(primeSum(primes,firstRow),563);
assert.equal(primeSum(primes,firstColumn),569);
const centerFive = rings[3];
assert.equal(centerFive.length, 16);
assert.deepEqual(centerFive.map(index=>primes[index]),
  [67,47,19,89,53,107,89,17,107,107,61,41,79,107,109,37]);
assert.equal(sums[3],signed.length);
assert.equal(sums[3]/centerFive.length,71);
assert.equal(corpus.prime[corpus.translit.indexOf("M")],71);
assert.equal([71,97,43].reduce((a,b)=>a+b),211);

// Exactly partition the authenticated bytes in source row-major perimeter
// order. Partitioning alone selects no character and recovers no plaintext.
let cursor=0;
const partitions=centerFive.map(index=>{
  const part=signed.subarray(cursor,cursor+primes[index]);
  cursor+=primes[index];
  return part;
});
assert.equal(cursor,signed.length);
assert(Buffer.concat(partitions).equals(signed));

/** Deterministic xorshift32 randomizer, used only for fixed-inventory controls. */
let seed=0x20161136;
/** @returns {number} */
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const mutable = [];
for(let row=1;row<11;row++)for(let col=1;col<11;col++)
  mutable.push(row*11+col);
assert.equal(mutable.length,100);
const pool=mutable.map(index=>primes[index]);
const observed=sums[3];
const trials=200000;
let hitsCenter=0,hitsOther=0,hitsAny=0;
let sumCenter=0, sumCenterSquared=0;
for(let trial=0;trial<trials;trial++){
  const shuffled=pool.slice();
  for(let k=shuffled.length-1;k>0;k--){
    const j=next()%(k+1);
    [shuffled[k],shuffled[j]]=[shuffled[j],shuffled[k]];
  }
  const p=primes.slice();
  for(let k=0;k<100;k++)p[mutable[k]]=shuffled[k];
  const ringSums=rings.map(r=>primeSum(p,r));
  const center=ringSums[3];
  sumCenter+=center;
  sumCenterSquared+=center*center;
  if(center===observed)hitsCenter++;
  if(ringSums.some(n=>n===observed))hitsAny++;
  if(ringSums.some((n,i)=>i!==3&&n===observed))hitsOther++;
}
assert.deepEqual({hitsCenter,hitsOther,hitsAny},
  {hitsCenter:27,hitsOther:564,hitsAny:591});
console.log("LP2_2016_RING1136_RESULT "+JSON.stringify({
  original:{p32TotalRunes:primes.length,firstRowPrimeSum:563,
    firstColumnPrimeSum:569,ringLengths,ringSums:sums,
    center5PerimeterGP:centerFive.map(i=>gp[i]).join(" "),
    center5PerimeterPrimes:centerFive.map(i=>primes[i]),
    signedBytes:signed.length,signedSHA256:sha256(signed),
    signedJpegSHA256:sha256(signedImage),
    segmentLengths:centerFive.map(i=>primes[i]),segmentCount:partitions.length,
    bytePartitionRoundTrip:true},
  conditional:{null:"shuffle 100 non-axis original primes; preserve 21 image-size axis entries",
    seed:"0x20161136",trials,hitsCenter,hitsOther,hitsAny,
    meanCenter:sumCenter/trials,
    sdCenter:Math.sqrt(sumCenterSquared/trials-(sumCenter/trials)**2),
    centerPlusOne:(hitsCenter+1)/(trials+1),
    anyRingPlusOne:(hitsAny+1)/(trials+1)},
  interpretation:"source arithmetic coincidence; no decoded LP2 plaintext/key"
}));
