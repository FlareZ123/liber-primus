"use strict";

/**
 * Original LP2 p7: five red-word GF29 products and five black dots as
 * historically motivated Shamir 5-of-5 shares. Source-only, read-only SFT.
 * Node.js 22 CommonJS; independent original-image dot coordinates are
 * pinned against SHA-256 of resources/liber-primus/24.jpg.
 *
 * This is an intermediate known-state reconstruction, NOT a decipherment
 * of any original unknown page. The Shamir operand and axis consumer are
 * hypotheses recognized after prior DH23 correspondence research.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {buildSourceNativeTrigramModel} =
  require("./lp1_source_native_trigram_model.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const sourceJpeg = fs.readFileSync(path.join(ROOT,"resources/liber-primus/24.jpg"));
assert.equal(crypto.createHash("sha256").update(sourceJpeg).digest("hex"),
  "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c");
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let n = 1; n < 29; n++) if (mod(a * n) === 1) return n;
  throw new Error("Non-invertible GF29 denominator");
}
/** @param {number[]} c @param {number} x @returns {number} */
function evaluate(c, x) {
  return c.reduceRight((z, n) => mod(z * x + n), 0);
}
/** @param {number[]} x @param {number[]} y @returns {number[]} */
function interpolate(x, y) {
  assert.equal(x.length, 5);
  assert.equal(y.length, 5);
  assert.equal(new Set(x).size, 5);
  const result = Array(5).fill(0);
  for (let k = 0; k < 5; k++) {
    let polynomial = [1];
    let denominator = 1;
    for (let j = 0; j < 5; j++) {
      if (j === k) continue;
      const next = Array(polynomial.length + 1).fill(0);
      for (let i = 0; i < polynomial.length; i++) {
        next[i] = mod(next[i] - x[j] * polynomial[i]);
        next[i + 1] = mod(next[i + 1] + polynomial[i]);
      }
      denominator = mod(denominator * (x[k] - x[j]));
      polynomial = next;
    }
    const scale = mod(y[k] * inverse(denominator));
    for (let i = 0; i < 5; i++)
      result[i] = mod(result[i] + scale * polynomial[i]);
  }
  assert.deepEqual(x.map(t => evaluate(result, t)), y);
  return result;
}
const page7 = corpus.pages.find(p => p.page === 7).indices;
const page8 = corpus.pages.find(p => p.page === 8).indices;
const ink7 = ink.pages.find(p => p.page === 7);
assert.equal(page7.length, 208);
assert.equal(page8.length, 255);
assert.deepEqual(ink7.red_spans.map(s => [s.start,s.length]), [[194,14]]);
const lastRed = page7.slice(194);
let offset = 0;
const words = [2,4,3,2,3].map(length => {
  const word = lastRed.slice(offset,offset + length);
  offset += length;
  return word;
});
assert.equal(offset, lastRed.length);
assert.deepEqual(words, [
  [23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]
]);
const products = words.map(w => w.reduce((z,n) => mod(z*n),1));
assert.deepEqual(products,[11,26,8,15,2]);

/* Native JPEG centers measured in the pre-existing independent original
 * image audit sims/lp2_p7_fivedot_seven_header_alignment_sft.cjs.
 * They are in left-to-right order, in 2400x3600 original pixel coordinates.
 * Only relative coordinate ranks matter to this proposed source operation.
 */
const dots = [
  {x:796.94613,y:3105.73973},
  {x:992.46667,y:3166.68765},
  {x:1296.96618,y:2866.70402},
  {x:1479.36384,y:3127.5},
  {x:1527.21721,y:2936.20488}
];
assert(dots.every((d,i) => i === 0 || d.x > dots[i-1].x));
const horizontal = [1,2,3,4,5];
const vertical = dots.map(d => 1+dots.filter(other => other.y < d.y).length);
assert.deepEqual(vertical,[3,5,1,4,2]);
const polynomialH = interpolate(horizontal,products);
const polynomialV = interpolate(vertical,products);
assert.deepEqual(polynomialH,[5,6,23,26,9]);
assert.deepEqual(polynomialV,[23,18,21,22,11]);
assert.equal(polynomialH[0],5);  // historical DH base g
assert.equal(polynomialV[0],23); // historical DH modulus p
// Independent synthetic positive: the exact polynomial must be recovered
// for BOTH register orders, including non-monotonic x coordinates.
for (const xs of [horizontal,vertical]) {
  const secretCoefficients = [7,11,3,9,17];
  assert.deepEqual(interpolate(xs,xs.map(x => evaluate(secretCoefficients,x))),
    secretCoefficients);
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (!values.length) return [[]];
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const rest = values.slice(0,i).concat(values.slice(i+1));
    for (const sub of permutations(rest)) out.push([values[i],...sub]);
  }
  return out;
}
let matchHorizontal = 0, matchVertical = 0, matchBoth = 0;
for (const order of permutations(products)) {
  const h = interpolate(horizontal,order)[0] === 5;
  const v = interpolate(vertical,order)[0] === 23;
  if (h) matchHorizontal++;
  if (v) matchVertical++;
  if (h && v) {
    matchBoth++;
    assert.deepEqual(order,products);
  }
}
assert.deepEqual([matchHorizontal,matchVertical,matchBoth],[5,5,1]);
const aggregates = [
  ["index product",products],
  ["prime product",words.map(w => w.reduce((z,n) => mod(z*corpus.prime[n]),1))],
  ["index sum",words.map(w => mod(w.reduce((z,n) => z+n,0)))],
  ["prime sum",words.map(w => mod(w.reduce((z,n) => z+corpus.prime[n],0)))],
  ["first rune",words.map(w => w[0])],
  ["last rune",words.map(w => w[w.length-1])],
  ["word length",words.map(w => w.length)]
];
const alternatives = aggregates.map(([name,values]) => ({
  name,shareValues:values,secretHorizontal:interpolate(horizontal,values)[0],
  secretVertical:interpolate(vertical,values)[0]
}));
assert.deepEqual(alternatives.map(x=>[x.secretHorizontal,x.secretVertical]),[
  [5,23],[21,1],[17,19],[21,21],[26,2],[15,12],[22,28]
]);

/**
 * An explicit, very limited immediate-p8 consumer: each interpolated set
 * of five coefficients drives a GF29 +/- difference on the five base-three
 * axes of the original 243-rune p8 black block. This use is hypothetical;
 * its absence of native GP prose does not refute the Shamir state readout.
 * @param {number[]} source
 * @param {number[]} weights
 * @param {"forward"|"backward"} direction
 * @param {-1|1} sign
 * @returns {number[]}
 */
function axes(source,weights,direction,sign) {
  let data = source.slice();
  assert.equal(data.length,243);
  for(let axis=0;axis<5;axis++) {
    const step=3**axis;
    const old=data.slice();
    for(let i=0;i<data.length;i++) {
      const d=Math.floor(i/step)%3;
      if(direction==="forward" && d>0)
        data[i]=mod(old[i]+sign*weights[axis]*old[i-step]);
      if(direction==="backward" && d<2)
        data[i]=mod(old[i]+sign*weights[axis]*old[i+step]);
    }
  }
  return data;
}
const model=buildSourceNativeTrigramModel({
  corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")
});
const body=page8.slice(12);
assert.equal(body.length,243);
const bodyScore=model.scoreStream(body).mean;
const axisTrials=[];
for(const [name,coefficients] of [
  ["horizontal polynomial",polynomialH],["vertical polynomial",polynomialV]
]) for(const orientation of ["forward","reverse"]) {
  const weights=orientation==="forward"?coefficients:coefficients.slice().reverse();
  for(const direction of ["forward","backward"]) for(const sign of [-1,1]) {
    const out=axes(body,weights,direction,sign);
    const score=model.scoreStream(out).mean;
    const n=Array(29).fill(0);
    for(const v of out)n[v]++;
    const ioc=n.reduce((z,m)=>z+m*(m-1),0)/(out.length*(out.length-1));
    axisTrials.push({source:name,orientation,direction,sign,
      trigramScore:score,ioc,preview:model.spell(out.slice(0,28))});
  }
}
axisTrials.sort((a,b)=>b.trigramScore-a.trigramScore);
assert.equal(axisTrials.length,16);
assert(axisTrials.every(x=>x.trigramScore < model.p57Score-1),
  "unexpected original-language candidate; investigate before interpreting");
console.log(JSON.stringify({
  source:"Original 24.jpg p7, five red words and five separate black dots",
  historicalMotivation:"2013 Cicada used Shamir 5-of-10 secret sharing",
  sourceRuneProducts:products,
  horizontalDots:horizontal,verticalDotHeightRanks:vertical,
  polynomialHorizontalLowToHigh:polynomialH,
  polynomialVerticalLowToHigh:polynomialV,
  recoveredHistoricalDHBase:polynomialH[0],
  recoveredHistoricalDHModulus:polynomialV[0],
  permutationConditional:{total:120,horizontalHits:matchHorizontal,
    verticalHits:matchVertical,jointHits:matchBoth},
  aggregationControl:alternatives,
  p8Black243:{originalScore:bodyScore,knownClearP57Score:model.p57Score,
    bestCandidate:axisTrials[0],allAxisTrials:axisTrials},
  decision:"The original 5-dot height ranks provide a new geometric interpolation that recovers known p=23, while row order gives g=5. No unknown text/key or authoritative Shamir instruction, and the frozen immediate p8 five-axis receiver fails to recover prose."
},null,2));
