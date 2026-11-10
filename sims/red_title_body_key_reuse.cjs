"use strict";
/**
 * Test whether LP2's eight substantive section bodies reuse an additive
 * mod-29 pad, restarted at their precisely annotated red-title endpoints.
 *
 * Reads the existing canonical master, red-ink annotations and solved LP1
 * reference. Run with Node 22: node sims/red_title_body_key_reuse.cjs
 * All observations, nulls and planted controls are deterministic.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const runes = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const number = new Map(runes.map((r, i) => [r, i]));
const sectionIndices = [0, 1, 2, 4, 5, 6, 7, 8];
const headings = [
  [0, 0, 13], [3, 0, 16], [8, 0, 12], [15, 9, 11],
  [23, 0, 16], [27, 0, 19], [33, 91, 8], [40, 0, 8]
];
const lengths = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];

/** @returns {number[][]} */
function corpusBodies() {
  const master = read("resources/transcriptions/liber_primus_master.txt");
  const opening = master.indexOf("ᛋᚻᛖᚩᚷ");
  assert.ok(opening >= 0);
  const unsolved = master.slice(opening).split("%").slice(0, 56).join("%");
  const sections = unsolved.split("$")
    .map(s => [...s].filter(c => number.has(c))).filter(a => a.length);
  assert.deepEqual(sections.map(a => a.length), lengths);
  const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const bodies = sectionIndices.map((id, i) => {
    const [page, offset, size] = headings[i];
    const annotated = annotations.pages.find(p => p.page === page);
    const span = annotated.red_spans.find(s => s.start === offset);
    assert.ok(span && span.length === size);
    assert.equal(sections[id].slice(0, size).join(""), span.runes);
    return sections[id].slice(size).map(c => number.get(c));
  });
  assert.deepEqual(bodies.map(a => a.length),
    [716, 1129, 1717, 1883, 1005, 1505, 1581, 3308]);
  assert.equal(bodies.reduce((s, x) => s + x.length, 0), 11844);
  return bodies;
}

/** @param {number} initial */
function rng(initial) {
  let seed = initial >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** @param {number[][]} bodies */
function score(bodies) {
  let pooledEqual = 0, pooledCompared = 0, maxSymmetric = -Infinity;
  let topPair = null;
  const pairs = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const n = Math.min(bodies[i].length, bodies[j].length);
      const counts = new Int32Array(29);
      for (let k = 0; k < n; k++)
        counts[(bodies[i][k] - bodies[j][k] + 29) % 29]++;
      pooledEqual += counts[0];
      pooledCompared += n;
      const e = n / 29;
      let symmetric = (counts[0] - e) ** 2 / e;
      for (let d = 1; d <= 14; d++)
        symmetric += (counts[d] + counts[29 - d] - 2 * e) ** 2 / (2 * e);
      const current = {i, j, compared:n, equal:counts[0], symmetric};
      pairs.push(current);
      if (symmetric > maxSymmetric) {
        maxSymmetric = symmetric;
        topPair = current;
      }
    }
  }
  assert.equal(pairs.length, 28);
  return {pooledEqual, pooledCompared,
    pooledRate:pooledEqual / pooledCompared, maxSymmetric, topPair, pairs};
}

/**
 * A genuine cipher-pair difference under a common mod-29 additive pad
 * cancels the key. This stat is sensitive to both zero-difference
 * coincidence and symmetric nonuniform difference distributions.
 * @param {number[][]} bodies
 * @param {ReturnType<typeof score>} observed
 */
function rotationNull(bodies, observed) {
  const random = rng(37061337);
  let exceedsPooled = 0, exceedsMaxSymmetric = 0;
  const rates = [], maxima = [];
  for (let trial = 0; trial < 2000; trial++) {
    const rotated = bodies.map(a => {
      const shift = Math.floor(random() * a.length);
      return a.slice(shift).concat(a.slice(0, shift));
    });
    const s = score(rotated);
    exceedsPooled += Number(s.pooledRate >= observed.pooledRate);
    exceedsMaxSymmetric += Number(s.maxSymmetric >= observed.maxSymmetric);
    rates.push(s.pooledRate);
    maxima.push(s.maxSymmetric);
  }
  rates.sort((a,b) => a-b);
  maxima.sort((a,b) => a-b);
  return {trials:2000, seed:37061337,
    exceedPooled:exceedsPooled, pooledP:(exceedsPooled + 1)/2001,
    pooledRateQuantiles:[rates[0], rates[100], rates[1000], rates[1900], rates[1999]],
    exceedMaxSymmetric:exceedsMaxSymmetric, maxSymmetricP:(exceedsMaxSymmetric+1)/2001,
    maxSymmetricMedian:maxima[1000], maxSymmetricMaximum:maxima[1999]};
}

/** GP-digraph transliteration of the solved, independent LP1 prose source. */
function solvedReferenceMarginal() {
  const labels = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO",
    "P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
  const index = new Map(labels.map((x,i) => [x,i]));
  const ranked = labels.slice().sort((a,b) => b.length - a.length);
  const text = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split("\n").filter(line => !line.startsWith("#")).join(" ")
    .toUpperCase().replace(/[^A-Z]/g,"");
  const counts = Array(29).fill(0);
  let total = 0;
  for (let i=0; i < text.length;) {
    const match = ranked.find(x => text.startsWith(x, i));
    if (match) {counts[index.get(match)]++; total++; i += match.length;}
    else i++;
  }
  assert.equal(total, 3473);
  return counts.map(x=>x/total);
}

/**
 * Strong positive control: independent GP-like sources encrypted by the same
 * pseudorandom additive pad restarted at the body boundary; whenever the
 * output repeats, reroute with probability 0.81.
 * @param {number[][]} bodies
 */
function plantedSharedPad(bodies) {
  const random = rng(0x3701c51);
  const weights = solvedReferenceMarginal();
  const rates = [];
  for (let trial=0; trial<100; trial++) {
    const maxN = Math.max(...bodies.map(a => a.length));
    const pad = Array.from({length:maxN}, () => Math.floor(random()*29));
    const planted = bodies.map(a => {
      let previous = -1;
      return Array.from({length:a.length}, (_, k) => {
        let t = random(), index = 0;
        while (t >= weights[index] && index < 28) {t -= weights[index];index++;}
        let c = (index+pad[k]) % 29;
        if (c === previous && random() < 0.81)
          c = (c + 1 + Math.floor(random()*28)) % 29;
        previous = c;
        return c;
      });
    });
    rates.push(score(planted).pooledRate);
  }
  rates.sort((a,b)=>a-b);
  return {trials:100, seed:"0x3701c51", registerRunes:3473,
    meanGPReferenceCollision:weights.reduce((s,x)=>s+x*x,0),
    minimum:rates[0], median:rates[49], maximum:rates[99]};
}

function main() {
  const bodies=corpusBodies();
  const observed=score(bodies);
  const answer={hypothesis:"Same direct mod-29 additive pad restarts after each annotated red section title",
    bodies:bodies.map(b=>b.length), comparedPairs:observed.pairs.length,
    original:{pooledEqual:observed.pooledEqual,
      pooledCompared:observed.pooledCompared, pooledRate:observed.pooledRate,
      maxSymmetric:observed.maxSymmetric, topPair:observed.topPair,
      topFivePairs:observed.pairs.slice().sort((a,b)=>b.symmetric-a.symmetric).slice(0,5)},
    null:rotationNull(bodies, observed), positive:plantedSharedPad(bodies),
    interpretation:"No observed title-anchored shared-pad signal. Strictly conditional on common key phase and English-like direct GP plaintext."};
  process.stdout.write(JSON.stringify(answer,null,2)+"\n");
}
if (require.main === module) main();
module.exports={corpusBodies, score, rotationNull, plantedSharedPad, solvedReferenceMarginal};
