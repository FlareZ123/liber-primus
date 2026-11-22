"use strict";
/**
 * Original-source source-frozen all-secret test:
 * Does the 91-rune 2016 signed-word-map interior equal an arbitrary
 * stationary GF29 linear projection (with free intercept and even
 * arbitrary 29-output function) of the three 91-cell layers in the
 * exact original p29/table G-adic residual?
 *
 * The 2016 base58 word map is explicitly conjectural, as is the
 * three-share interpretation of R273. This test decides only that
 * combined consumer and does not assert a Cicada decoder.
 *
 * Node.js 22, CommonJS. Run from the repository root:
 * node sims/lp2_p29_gadic_three_share_2016_map_sft.cjs
 * All file reads are immutable; no files are written.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const read = file => fs.readFileSync(file, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const bytes = grid.byte_rows.flat();
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const source = read("resources/lp2-transcription.txt").split("%");
const m = x => ((x % 29) + 29) % 29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i+j] = m(out[i+j] + a[i] * b[j]);
  return out;
}

/** @param {string} page @returns {string[]} */
function printedWords(page) {
  return page.replaceAll("/", "").replaceAll("\n", "")
    .replaceAll("\r", "").split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}

/** @returns {number[]} */
function exactResidual() {
  assert.equal(bytes.length, 256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes))
    .digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const p29 = corpus.pages.find(p => p.page === 29).indices;
  assert.equal(p29.length, 277);
  const G = [15, 5, 27];
  const square = multiply(G, G);
  assert.deepEqual(square, [22, 5, 23, 9, 4]);
  const original = p29.map((v, i) =>
    m(v - (i >= 21 ? bytes[i-21] : 0)
        - (i >= 274 ? 2 * G[i-274] : 0)));
  const remainder = original.slice();
  const R = [];
  for (let i = 0; i < 273; i++) {
    const v = m(4 * remainder[i]); // 4 = inverse_GF29(22)
    R.push(v);
    for (let k = 0; k < square.length; k++)
      remainder[i+k] = m(remainder[i+k] - v * square[k]);
  }
  assert.deepEqual(remainder.slice(-4), [0,0,0,0]);
  assert.deepEqual(multiply(R, square), original);
  return R;
}

/** @returns {number[]} */
function exactMessageMapInteriors() {
  assert.equal(corpus.pages.length, 58);
  assert.equal(source.length, 57); // p50 numeral table has no text record.
  const pageWords = Array.from({length:58}, (_, i) =>
    i === 50 ? [] : printedWords(source[i > 50 ? i - 1 : i]));
  const alpha = corpus.translit.map((token,index) =>
    ({token:token.toLowerCase(), index}))
    .sort((a,b) => b.token.length - a.token.length);
  /** @param {string} word @returns {number[]} */
  const encodeWord = word => {
    const input = word.toLowerCase().replace(/v/g,"u")
      .replace(/k/g,"c").replace(/z/g,"s");
    const runes = [];
    for (let pos=0; pos < input.length;) {
      const hit = alpha.find(({token}) => input.startsWith(token,pos));
      assert(hit, "No GP transliteration for " + input.slice(pos));
      runes.push(hit.index);
      pos += hit.token.length;
    }
    return runes;
  };
  const msg = signed.slice(signed.indexOf("Hello."),
    signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
  const signedWords = msg.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
  assert.equal(signedWords.length, 43);
  const map = signedWords.map(word => {
    const value = encodeWord(word).reduce((sum,x) =>
      sum + corpus.prime[x], 0);
    return {word, selected:pageWords[value % 58][Math.floor(value/58)] || ""};
  });
  assert.deepEqual(map.filter(x => !x.selected).map(x => x.word), ["lies"]);
  const glyphIndex = new Map(corpus.runes.map((r,i) => [r,i]));
  const target = map.filter(x => x.selected)
    .flatMap(({selected}) => [...selected].slice(1,-1)
      .map(g => glyphIndex.get(g)));
  assert.equal(target.length, 91);
  assert.equal(target.slice(0,14).map(x => corpus.translit[x]).join(""),
    "IARFEIOLOEEAEOBOL");
  return target;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  values.forEach(x => counts[x]++);
  return counts.reduce((sum,n) => sum+n*(n-1),0)
    / (values.length*(values.length-1));
}

function run() {
  const R = exactResidual(), target = exactMessageMapInteriors();
  assert.equal(R.length, 273);
  const A = R.slice(0,91), B = R.slice(91,182), C = R.slice(182,273);
  const secret = A.map((_,i) => m(3*A[i]-3*B[i]+C[i]));
  const fourth = A.map((_,i) => m(A[i]-3*B[i]+3*C[i]));
  const matchedFourth = fourth.flatMap((v,i) => v===target[i]?[i]:[]);
  assert.deepEqual(matchedFourth, [4,16,21,72]);
  assert(Math.abs(ioc(secret)-0.035897435897435895)<1e-13);

  // Exhaust all 29^3 projections. For each projection a*A+b*B+c*C,
  // the best additive intercept d is exactly the most frequent residual.
  // A stronger model then grants a completely unknown arbitrary output
  // function f:GF29 -> GF29, chosen independently at every projected digit.
  let bestAffine=0, affineTies=0, bestFunction=0, functionTies=0;
  let bestAffineKey=null, bestFunctionKey=null, validFunction=0;
  for (let a=0;a<29;a++) for (let b=0;b<29;b++) for(let c=0;c<29;c++) {
    const counts = new Uint16Array(841);
    const residual = new Uint16Array(29);
    for (let i=0;i<91;i++) {
      const projected=m(a*A[i]+b*B[i]+c*C[i]);
      counts[29*projected+target[i]]++;
      residual[m(target[i]-projected)]++;
    }
    for (let d=0;d<29;d++) {
      const value=residual[d];
      if (value>bestAffine) {
        bestAffine=value; affineTies=1; bestAffineKey=[a,b,c,d];
      } else if (value===bestAffine) affineTies++;
    }
    let matched=0;
    for(let u=0;u<29;u++) {
      let top=0;
      for(let v=0;v<29;v++)top=Math.max(top,counts[29*u+v]);
      matched+=top;
    }
    if(matched===91)validFunction++;
    if(matched>bestFunction) {
      bestFunction=matched; functionTies=1;
      bestFunctionKey=[a,b,c];
    } else if(matched===bestFunction)functionTies++;
  }
  assert.deepEqual({bestAffine,affineTies,bestFunction,functionTies,validFunction},
    {bestAffine:13,affineTies:11,bestFunction:40,functionTies:28,validFunction:0});

  // Native-GP positive. Recover an independently clear p57 91-rune
  // message from three unmarked polynomial shares; predict share four.
  const planted = corpus.pages.find(p => p.page===57).indices.slice(0,91);
  assert.equal(planted.length,91);
  const shares = Array.from({length:4},(_,k) => planted.map((s,i) =>
    m(s+(7*i+5)*(k+1)+(13*i+9)*(k+1)*(k+1))));
  const recovered=planted.map((_,i) =>
    m(3*shares[0][i]-3*shares[1][i]+shares[2][i]));
  const predicted=planted.map((_,i) =>
    m(shares[0][i]-3*shares[1][i]+3*shares[2][i]));
  assert.deepEqual(recovered,planted);
  assert.deepEqual(predicted,shares[3]);

  // Source-fixed alternative Shamir coordinates: p39's printed red triad
  // is [27,5,15]. p57's terminal 23-dot mark supplies the held-out x=23.
  // This is distinct from treating [15,5,27] as coefficients of G(X).
  const p39Xs = [27, 5, 15];
  const inv29 = n => {
    for (let x = 1; x < 29; x++) if (m(x * n) === 1) return x;
    throw new Error("non-invertible Shamir denominator");
  };
  const lagrangeWeights = (xs, at) => xs.map((x, i) =>
    xs.reduce((w, y, j) => j === i ? w :
      m(w * m(at - y) * inv29(m(x - y))), 1));
  const p39AtZeroWeights = lagrangeWeights(p39Xs, 0);
  const p39At23Weights = lagrangeWeights(p39Xs, 23);
  assert.deepEqual(p39AtZeroWeights, [25, 17, 17]);
  assert.deepEqual(p39At23Weights, [19, 22, 18]);
  const combineP39 = weights => A.map((_, i) =>
    m(weights[0] * A[i] + weights[1] * B[i] + weights[2] * C[i]));
  const p39Secret = combineP39(p39AtZeroWeights);
  const p39Share23 = combineP39(p39At23Weights);
  const p39SecretMatches = p39Secret.flatMap((v, i) =>
    v === target[i] ? [i] : []);
  const p39Share23Matches = p39Share23.flatMap((v, i) =>
    v === target[i] ? [i] : []);
  assert.deepEqual(p39SecretMatches, [3, 24, 27, 60, 82]);
  assert.deepEqual(p39Share23Matches, [5, 7, 48]);
  assert(Math.abs(ioc(p39Secret) - 0.03394383394383394) < 1e-13);
  assert(Math.abs(ioc(p39Share23) - 0.030525030525030524) < 1e-13);

  // Native-GP positive for the same source-selected coordinates and x=23:
  // build a nonzero quadratic from independently clear p57 plaintext.
  const p39A = planted.map((_, i) => m(7 * i + 13));
  const p39B = planted.map((_, i) => m(11 * i + 23));
  const p39PositiveShares = p39Xs.map(x => planted.map((v, i) =>
    m(v + p39A[i] * x + p39B[i] * x * x)));
  const p39Expected23 = planted.map((v, i) =>
    m(v + p39A[i] * 23 + p39B[i] * 23 * 23));
  const p39Predicted23 = planted.map((_, i) =>
    m(p39At23Weights.reduce((sum, w, j) =>
      sum + w * p39PositiveShares[j][i], 0)));
  assert.deepEqual(p39Predicted23, p39Expected23);

  return {
    original:{p29Runes:277,sourceGridBytes:256,residualRunes:273,
      layerLength:91,signedWords:43,mapInteriors:91},
    threeShare:{secretIoC:ioc(secret),firstTranslit:secret.slice(0,35)
      .map(x=>corpus.translit[x]).join("")},
    fourthShare:{matchCount:matchedFourth.length,
      matchOffsetsZeroBased:matchedFourth},
    p39TriadShamir:{sourceCoordinates:p39Xs,targetCoordinate:23,
      weightsAtZero:p39AtZeroWeights,weightsAt23:p39At23Weights,
      secretMatches:p39SecretMatches.length,
      secretMatchOffsetsZeroBased:p39SecretMatches,
      secretIoC:ioc(p39Secret),secretFirst40:p39Secret.slice(0,40)
        .map(x=>corpus.translit[x]).join(""),
      fourthShareMatches:p39Share23Matches.length,
      fourthShareMatchOffsetsZeroBased:p39Share23Matches,
      fourthShareIoC:ioc(p39Share23),fourthShareFirst40:p39Share23.slice(0,40)
        .map(x=>corpus.translit[x]).join(""),
      nativeP57PositiveControl:p39Predicted23.filter((v,i)=>
        v===p39Expected23[i]).length},
    anyStationaryAffine:{keyCount:29**4,bestMatch:bestAffine,
      keyTies:affineTies,oneBestKey:bestAffineKey},
    anyStationaryOuterFunction:{projectionCount:29**3,
      bestMatch:bestFunction,keyTies:functionTies,
      validFullMappings:validFunction,oneBestProjection:bestFunctionKey},
    originalTargetSize:target.length,
    nativeSourcePlant:{secretRecovered:recovered.length,
      fourthSharePredicted:predicted.length}
  };
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports={run,exactResidual,exactMessageMapInteriors};
