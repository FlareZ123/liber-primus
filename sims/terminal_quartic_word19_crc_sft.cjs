"use strict";
/**
 * Original-source cross-channel gate for the p3/p39 red-triad quartic,
 * 32x8 printed bytes, 256 ink events, and PARABLE's 19 body words.
 * No unknown plaintext or key is claimed.
 *
 * Run: node sims/terminal_quartic_word19_crc_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} name @returns {any} */
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
/** @param {number} value @returns {number} */
const mod = (value) => ((value % 29) + 29) % 29;

/**
 * Multiply descending-coefficient polynomials over GF(29).
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number[]}
 */
function product(left, right) {
  const out = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++)
    for (let j = 0; j < right.length; j++)
      out[i + j] = mod(out[i + j] + left[i] * right[j]);
  return out;
}

/**
 * Monic polynomial remainder, using descending coefficients.
 * @param {number[]} coefficients
 * @param {number[]} factor
 * @returns {number[]}
 */
function remainder(coefficients, factor) {
  const r = Array(factor.length - 1).fill(0);
  for (const value of coefficients) {
    const leading = r.shift();
    r.push(mod(value));
    for (let j = 1; j < factor.length; j++)
      r[j - 1] = mod(r[j - 1] - leading * factor[j]);
  }
  return r;
}

/** @param {number[]} values @returns {number} */
function xor(values) {
  return values.reduce((a, b) => a ^ b, 0);
}

function main() {
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const ink = load("resources/liber-primus/lp2-ink-annotations.json");
  const grid = load("resources/liber-primus/base60-grid.json");
  const transcript = fs.readFileSync(
    path.join(root, "resources/lp2-transcription.txt"), "utf8");
  const triples = ink.pages.flatMap((page) => (page.red_spans || [])
    .filter((span) => span.length === 3)
    .map((span) => [...span.runes].map((r) => corpus.runes.indexOf(r))));
  assert.deepEqual(triples, [[13, 23, 2], [27, 5, 15]]);
  const [first, second] = triples;

  // u^2=3u+8 from the first marked triad. Its own z=23-2u has
  // trace=norm=11, selecting h(X)=X^2+18X+11.
  const z0 = first[1], z1 = mod(-first[2]);
  const trace = mod(2 * z0 + 3 * z1);
  const norm = mod(z0 * z0 + 3 * z0 * z1 - 8 * z1 * z1);
  assert.deepEqual([trace, norm], [11, 11]);
  const h = [1, mod(-trace), norm];
  // Second marked triad is ascending 27+5X+15X^2; inverse(15)=2.
  const repeatedRoot = [1, mod(2 * second[1]), mod(2 * second[0])];
  assert.deepEqual(repeatedRoot, [1, 10, 25]);
  const g = product(h, repeatedRoot);
  assert.deepEqual(g, [1, 28, 13, 9, 14]);

  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const residues = bytes.map(mod);
  assert.deepEqual(remainder(residues, g), [0, 0, 0, 0]);

  // Systematic four-GP-symbol check: freeze the source-defined g and
  // the first 252 bytes, then predict all four final residues.
  const predictedCheck = remainder([...residues.slice(0, 252), 0, 0, 0, 0], g)
    .map((v) => mod(-v));
  assert.deepEqual(predictedCheck, [6, 7, 15, 22]);
  assert.deepEqual(bytes.slice(-4), [180, 36, 189, 80]);
  assert.deepEqual(bytes.slice(-4).map(mod), predictedCheck);
  const corrupt = residues.slice();
  corrupt[255] = mod(corrupt[255] + 1);
  assert.notDeepEqual(remainder(corrupt, g), [0, 0, 0, 0]);

  // The 225 red runes and 31 thirteen-dot marks create another exact
  // 256-event source stream. For each page, an offset-k mark follows
  // rune k-1 and therefore precedes the red rune at offset k.
  const events = [];
  for (const page of ink.pages) {
    const local = [];
    for (const span of page.red_spans || [])
      for (const [i, rune] of [...span.runes].entries())
        local.push({offset: span.start + i, type: "r",
          index: corpus.runes.indexOf(rune)});
    for (const [offset, dots] of page.large_punctuation || [])
      if (dots === 13) local.push({offset, type: "m", index: -1});
    local.sort((a, b) => a.offset - b.offset
      || (a.type === "m" ? -1 : 1));
    events.push(...local);
  }
  assert.equal(events.length, 256);
  assert.equal(events.filter((event) => event.type === "r").length, 225);
  assert.equal(events.filter((event) => event.type === "m").length, 31);

  const alternatives = [];
  for (const representation of ["index", "ordinal", "prime", "totient"])
    for (const marker of [0, 2, 13, 28])
      for (const reverse of [false, true]) {
        const stream = events.map((event) => {
          if (event.type === "m") return marker;
          const v = event.index;
          if (representation === "index") return v;
          if (representation === "ordinal") return v + 1;
          if (representation === "prime") return corpus.prime[v];
          return corpus.prime[v] - 1;
        });
        const check = remainder(reverse ? stream.reverse() : stream, g);
        alternatives.push({representation, marker, reverse, check});
      }
  assert.equal(alternatives.length, 32);
  assert.equal(alternatives.filter((caseResult) =>
    caseResult.check.every((x) => x === 0)).length, 0);
  const canonicalEvents = alternatives.find((a) => a.representation === "index"
    && a.marker === 13 && !a.reverse);
  assert.deepEqual(canonicalEvents.check, [2, 19, 22, 0]);

  // PARABLE has 19 body words; a speculative g(X) parity-four-per-word
  // pairing exactly spans p55's 76 GP ciphertext runes.
  const page55 = corpus.pages[55].indices;
  const page56 = corpus.pages[56].indices;
  const page57 = corpus.pages[57].indices;
  assert.deepEqual([page55.length, page56.length, page57.length],
    [76, 85, 95]);
  const paragraph = transcript.split("%").at(-1)
    .replace(/[\/\s]+/gu, "");
  const words = paragraph.split(/[-.&§]+/u)
    .filter((token) => [...token].some((rune) => corpus.runes.includes(rune)));
  assert.equal(words.length, 20); // PARABLE heading + 19 body words
  assert.equal([...words[0]].length, 7);
  const body = words.slice(1).map((word) =>
    [...word].map((rune) => corpus.runes.indexOf(rune)));
  assert.equal(body.length, 19);
  const predicted55 = body.flatMap((word) => {
    const checksum = mod(word.reduce((s, index) => s + corpus.prime[index], 0));
    return g.slice(1).map((coefficient) => mod(checksum * coefficient));
  });
  assert.equal(predicted55.length, 76);
  const matches55 = predicted55.filter((v, i) => v === page55[i]).length;
  assert.equal(matches55, 2);

  // The quartic factor and 19 PARABLE body words independently suggest
  // four-rune blocks. Over GF29 every secret affine 4x4 Hill transform
  // preserves linear dependence among the five-coordinate augmented
  // plaintext blocks [p0,p1,p2,p3,1]. A six-block witness suffices.
  const {decryptTotient} = require("./solved_cipher_regression.cjs");
  const knownPlain = [...decryptTotient(page56, new Set([56])),...page57];
  const knownVisible = [...page56,...page57];
  const interior = grid.byte_rows.slice(1,31)
    .flatMap((row) => row.slice(1,7).map(mod));
  assert.deepEqual([knownPlain.length,knownVisible.length,interior.length],
    [180,180,180]);
  const firstSix = Array.from({length:6},(_,i)=>
    [...knownPlain.slice(4*i,4*i+4),1]);
  assert.deepEqual(firstSix[0],[24,9,18,9,1]);
  assert.deepEqual(firstSix[5],[18,4,18,18,1]);
  const dependence=[27,18,17,7,19];
  for(let j=0;j<5;j++)
    assert.equal(mod(dependence.reduce(
      (sum,coefficient,k)=>sum+coefficient*firstSix[k][j],0)),
      firstSix[5][j]);

  /** @param {number[]} values @returns {{prediction:number[],actual:number[],equalCount:number}} */
  function affineWitness(values) {
    const blocks=Array.from({length:6},(_,i)=>values.slice(4*i,4*i+4));
    const prediction=Array.from({length:4},(_,j)=>mod(
      dependence.reduce((sum,beta,k)=>sum+beta*blocks[k][j],0)));
    const actual=blocks[5];
    return {prediction,actual,
      equalCount:prediction.filter((v,j)=>v===actual[j]).length};
  }
  const gridHill=affineWitness(interior);
  const visibleHill=affineWitness(knownVisible);
  const shiftHill=affineWitness(knownVisible.map(
    (v,i)=>mod(v-knownPlain[i])));
  assert.deepEqual(gridHill,{prediction:[20,22,3,4],
    actual:[10,25,22,17],equalCount:0});
  assert.deepEqual(visibleHill,{prediction:[9,9,6,26],
    actual:[3,24,13,19],equalCount:0});
  assert.deepEqual(shiftHill,{prediction:[20,5,17,8],
    actual:[14,20,24,1],equalCount:0});
  // Positive control: a secret affine map always respects this relation.
  const plant=firstSix.map((x)=>[
    mod(2*x[0]+5*x[2]+7*x[4]),
    mod(x[1]+x[3]+11*x[4]),
    mod(x[0]+x[1]+x[2]+x[3]+x[4]),
    mod(3*x[0]+23*x[1]+4*x[4])
  ]).flat();
  assert.equal(affineWitness(plant).equalCount,4);

  // Under the *full-field evaluation* GF(256) RS(256,180) model,
  // summing all 256 evaluations must be zero regardless of traversal.
  // This does not exclude an extended RS model with a point at infinity.
  assert.equal(xor(bytes), 148);
  const radix59 = grid.alphabet.replace("f", "");
  assert.equal(radix59.length, 59);
  const bytes59 = grid.rows.flat().map((token) =>
    59 * radix59.indexOf(token[0]) + radix59.indexOf(token[1]));
  assert(bytes59.every((byte) => byte >= 0 && byte < 256));
  assert.equal(xor(bytes59), 33);

  console.log(JSON.stringify({
    status: "Source-derived GF29 checksum relation; no unknown plaintext",
    quartic: g,
    predictedLastFour: predictedCheck,
    originalLastFour: bytes.slice(-4).map(mod),
    inkEventCases: alternatives.length,
    inkEventCodewords: 0,
    canonicalInkRemainder: canonicalEvents.check,
    word19ToPage55Matches: matches55,
    word19ToPage55Total: predicted55.length,
    fourRuneAffineHill:{firstSixDependency:dependence,
      gridInterior:gridHill,visibleCipher:visibleHill,
      originalKnownShift:shiftHill},
    gf256FullFieldEvaluationXor: {base60: 148, radix59: 33},
  }, null, 2));
}
if (require.main === module) main();
