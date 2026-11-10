"use strict";

/**
 * Physical LP2 page 17: complete 4096-mask cubic-GP29 inverse.
 *
 * Model: C_i=P_i+K(t_i) mod29, K(t)=a*t^3+b*t^2+c*t+d,
 * where t_i is the page-local rune index minus a freely chosen subset
 * of original ciphertext Fehu (GP 0) before i. Each skipped Fehu is
 * a plaintext literal F; it emits ciphertext F and consumes no key tick.
 *
 * Five ORIGINAL black singleton words are given the literal native-English
 * plaintext alphabet {A,I}; all cubic coefficients and singleton plaintext
 * assignments are inferred exactly from the five observed ciphertext
 * symbols without a guessed key or language score. The 273-rune original
 * page is completely decrypted for ALL 4096 skip masks.
 *
 * A 273-rune native-English GP synthetic text, encrypted under exactly
 * this page/key family and the same singleton ciphertext cribs, verifies
 * exact recovery by the procedure.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const reference = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
const page = source.pages.find(p => p.page === 17);
assert.ok(page);
const C = page.indices;
assert.equal(C.length, 273);
const offsets = [113, 119, 147, 188, 204];
const symbols = [17, 28, 10, 16, 4];
const F = C.flatMap((v,i) => v === 0 ? [i] : []);
assert.deepEqual(F, [42,51,56,58,98,187,221,228,230,248,264,272]);
const redSpans = ink.pages.find(p => p.page === 17)?.red_spans || [];
for (let i = 0; i < offsets.length; i++) {
  assert.equal(C[offsets[i]], symbols[i]);
  assert.ok(!redSpans.some(r =>
    offsets[i] >= r.start && offsets[i] < r.start + r.length));
}
assert.deepEqual(F.filter(x => x > 113 && x < 188), [187]);
assert.deepEqual(F.filter(x => x > 188 && x < 204), []);

/** @param {number} a @returns {number} */
function mod(a) {return ((a % 29) + 29) % 29;}

/** @param {number} a @returns {number} */
function inverse(a) {
  const v = mod(a);
  for (let i = 1; i < 29; i++) if (mod(v*i) === 1) return i;
  throw new Error("noninvertible residue");
}

/**
 * @param {number[]} coeff
 * @param {number} t
 * @returns {number}
 */
function polynomial(coeff,t) {
  return mod(((coeff[0]*t + coeff[1])*t + coeff[2])*t + coeff[3]);
}

/**
 * Solve a 4x4 Vandermonde linear system over GP F29, returning
 * coefficient order [t^3,t^2,t,1].
 * @param {number[]} ts
 * @param {number[]} ys
 * @returns {number[]|null}
 */
function interpolate(ts,ys) {
  const mat = ts.map((t,i) => {
    const x = mod(t);
    return [mod(x*x*x),mod(x*x),x,1,mod(ys[i])];
  });
  for (let k = 0; k < 4; k++) {
    const pivot = mat.findIndex((row,i) => i >= k && row[k] !== 0);
    if (pivot < 0) return null;
    [mat[pivot],mat[k]] = [mat[k],mat[pivot]];
    const reciprocal = inverse(mat[k][k]);
    for (let j = k; j <= 4; j++) mat[k][j] = mod(mat[k][j]*reciprocal);
    for (let i = 0; i < 4; i++) {
      if (i === k) continue;
      const factor = mat[i][k];
      for (let j = k; j <= 4; j++)
        mat[i][j] = mod(mat[i][j] - factor*mat[k][j]);
    }
  }
  return mat.map(row => row[4]);
}

/**
 * @param {boolean} skip187
 * @returns {{skip187:boolean,plain:number[],coefficient:number[]}[]}
 */
function solveFiveCribs(skip187) {
  const ts = offsets.map(i => i - Number(skip187 && i > 187));
  const answers = [];
  for (let mask = 0; mask < 32; mask++) {
    const plain = offsets.map((_,i) => (mask & (1<<i)) ? 24 : 10);
    const coeff = interpolate(ts.slice(0,4),
      plain.slice(0,4).map((p,i) => mod(symbols[i]-p)));
    if (coeff === null) continue;
    if (polynomial(coeff,ts[4]) === mod(symbols[4]-plain[4]))
      answers.push({skip187,plain,coefficient:coeff});
  }
  return answers;
}

const bases = [solveFiveCribs(false),solveFiveCribs(true)];
assert.deepEqual(bases.map(x => x.length), [1,1]);
assert.deepEqual(bases[0][0].plain, [24,10,24,10,10]);
assert.deepEqual(bases[1][0].plain, [24,10,10,24,10]);
assert.deepEqual(bases[0][0].coefficient, [14,23,28,16]);
assert.deepEqual(bases[1][0].coefficient, [3,19,11,23]);

/**
 * @param {number[]} sequence
 * @returns {number} GP29 collision-form index of coincidence (random=1).
 */
function ioc29(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  return 29*counts.reduce((s,v) => s+v*(v-1),0) /
    (sequence.length*(sequence.length-1));
}

/**
 * Decode a complete page with a freely chosen subset of Fehu literals;
 * key coefficients are inferred from ONLY the five original cribs.
 * @param {number[]} cipher
 * @param {number[]} originalFPositions
 * @param {number} mask
 * @returns {{plain:number[],skip:number[],coefficient:number[]}}
 */
function decode(cipher,originalFPositions,mask) {
  const skipped = originalFPositions.filter((_,i) => ((mask>>i)&1) !== 0);
  const e = skipped.includes(187);
  const q = skipped.filter(x => x < 113).length;
  const base = bases[Number(e)][0];
  const plain = [];
  let count = 0;
  for (let i = 0; i < cipher.length; i++) {
    if (count < skipped.length && skipped[count] === i) {
      assert.equal(cipher[i],0);
      plain.push(0);
      count++;
    } else {
      plain.push(mod(cipher[i] - polynomial(base.coefficient,
        i - count + q)));
    }
  }
  assert.deepEqual(offsets.map(x => plain[x]), base.plain);
  return {plain,skip:skipped,coefficient:base.coefficient};
}

const reports = [];
for (let mask = 0; mask < (1<<F.length); mask++) {
  const candidate = decode(C,F,mask);
  const ioc = ioc29(candidate.plain);
  reports.push({mask,ioc,skip:candidate.skip});
}
reports.sort((a,b) => b.ioc-a.ioc || a.mask-b.mask);
const maximum = reports[0];
const sorted = reports.map(x => x.ioc).sort((a,b)=>a-b);
assert.equal(reports.length,4096);
assert.ok(Math.abs(maximum.ioc - 1.0693007972419737) < 1e-12);
assert.equal(maximum.mask,1519);
const bestPlain = decode(C,F,maximum.mask).plain;

/**
 * GP transliteration of a native solved-plaintext English passage.
 * @param {string} input
 * @returns {number[]}
 */
function encodeGP(input) {
  const lookup = new Map(source.translit.map((s,i) => [s,i]));
  const plain = input.toUpperCase()
    .replace(/QU/g,"CW").replace(/Q/g,"C")
    .replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const out = [];
  for (let i=0;i<plain.length;) {
    const pair = plain.slice(i,i+2);
    if (lookup.has(pair)) {out.push(lookup.get(pair));i+=2;}
    else {
      assert.ok(lookup.has(plain[i]),"GP letter: "+plain[i]);
      out.push(lookup.get(plain[i]));
      i++;
    }
  }
  return out;
}

/**
 * Remove metadata and number grid from the known genuine English LP1
 * source; use a contiguous original solved-p3 native-GP window.
 * @returns {number[]}
 */
function englishControl() {
  const matched = reference.match(/^### 3\s*\n([\s\S]*?)(?=^### 6\s*$)/m);
  assert.ok(matched);
  const lines = matched[1].split(/\r?\n/).filter(x => !x.startsWith("["));
  const encoded = encodeGP(lines.join(" "));
  assert.ok(encoded.length >= C.length);
  return encoded.slice(0,C.length);
}

// A genuine 273-rune English-GP source, with the 5 singleton A/I cribs
// and one literal source F at 187, under the same hidden cubic page key.
const plantedPlain = englishControl();
for (let i=0;i<offsets.length;i++)
  plantedPlain[offsets[i]] = bases[1][0].plain[i];
plantedPlain[187] = 0;
const plantedCipher = plantedPlain.map((p,i) =>
  i === 187 ? 0 :
    mod(p + polynomial(bases[1][0].coefficient,
      i - Number(i > 187))));
assert.deepEqual(offsets.map(i=>plantedCipher[i]),symbols);
const recovered = decode(plantedCipher,[187],1).plain;
assert.deepEqual(recovered,plantedPlain);

const output = {
  classification:"Exact original LP2 page17 cubic full-page inverse; negative",
  source:"resources/liber-primus/lp2-corpus.json",
  page:17,originalRunes:C.length,
  originalSingletonOffsets:offsets,originalSingletonCipher:symbols,
  originalFehu:F,
  uniqueCubicCribs:bases.flat(),
  originalMasksTested:reports.length,
  bestOriginal:{
    mask:maximum.mask,skip:maximum.skip,ioc29:maximum.ioc,
    first100GP:bestPlain.slice(0,100).map(x=>source.translit[x]).join("")
  },
  originalIocMedian:sorted[sorted.length/2],
  originalIocP99:sorted[Math.floor(0.99*sorted.length)],
  syntheticNativeControl:{
    ciphertextRunes:plantedCipher.length,exactRecovered:recovered.length,
    ioc29:ioc29(recovered),
    source:"LP1 solved physical p3 native-English text (transliterated GP)",
    trueFSkipMask:[187]
  },
  qualification:"Assumes printed singleton words are literal English A/I; cubic additive GP29 page clock; only original F skips. No authentic plaintext/key."
};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
