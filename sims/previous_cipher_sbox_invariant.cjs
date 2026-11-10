"use strict";
/**
 * Necessary-condition experiment for pagewise first-order ciphertext feedback.
 *
 * Hypothesis: C[t] = S[page][C[t-1]][P[t]], where every 29-entry row
 * S[page][previousCipher] is a bijection of the rune alphabet.
 * The row's output collision rate is invariant to its arbitrary permutation.
 *
 * Dependencies: only Node.js 18+ built-ins and checked-in corpus files.
 * Run: node sims/previous_cipher_sbox_invariant.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const control = fs.readFileSync(path.join(root, "resources", "control", "shakespeare_first300k.txt"), "utf8");
const pages = corpus.pages.filter((p) => p.status === "unsolved" && p.indices.length > 0);
const lengths = pages.map((p) => p.indices.length);

/** @param {string} input @returns {number[]} */
function toGematria(input) {
  const map = new Map(corpus.translit.map((symbol, index) => [symbol, index]));
  const runes = [];
  for (let word of (input.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (map.has(pair)) {
        runes.push(map.get(pair));
        i += 2;
      } else {
        const single = map.get(word[i]);
        if (single !== undefined) runes.push(single);
        i++;
      }
    }
  }
  return runes;
}
const english = toGematria(control);

/** @param {number} seed */
function xorshift(seed) {
  let state = seed | 0;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} page @returns {{same:number,numerator:number,denominator:number,ratio:number}} */
function rowCollision(page) {
  const table = Array.from({length:29}, () => new Uint16Array(29));
  let same = 0;
  for (let i = 1; i < page.length; i++) {
    const previous = page[i-1];
    const current = page[i];
    table[previous][current]++;
    if (current === previous) same++;
  }
  let numerator = 0;
  let denominator = 0;
  for (const row of table) {
    let n = 0;
    for (const count of row) {
      n += count;
      numerator += count * (count - 1);
    }
    denominator += n * (n - 1);
  }
  return {same, numerator, denominator, ratio: numerator / denominator};
}

/** @param {number[][]} data */
function bookCollision(data) {
  let numerator = 0;
  let denominator = 0;
  let same = 0;
  for (const page of data) {
    const stat = rowCollision(page);
    numerator += stat.numerator;
    denominator += stat.denominator;
    same += stat.same;
  }
  return {ratio:numerator/denominator, repeatedRunePairs:numerator/2,
    eligibleRunePairs:denominator/2, sameNeighbors:same};
}

/** @param {()=>number} random @returns {number[]} */
function permutation(random) {
  const result = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = Math.floor(random() * (i+1));
    [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}

/**
 * @param {()=>number} random
 * @param {"english"|"null"} mode
 * @returns {number[][]}
 */
function simulate(random, mode) {
  const result = [];
  for (const length of lengths) {
    const substitutions = Array.from({length:29}, () => permutation(random));
    const start = Math.floor(random() * (english.length - length - 1));
    let previous = Math.floor(random() * 29);
    const page = [];
    for (let t = 0; t < length; t++) {
      let current;
      if (mode === "english") {
        current = substitutions[previous][english[start + t]];
        if (current === previous && random() < 0.81) {
          current = (current + 1 + Math.floor(random() * 28)) % 29;
        }
      } else {
        current = random() < 0.00667
          ? previous
          : (previous + 1 + Math.floor(random() * 28)) % 29;
      }
      page.push(current);
      previous = current;
    }
    result.push(page);
  }
  return result;
}

/** @param {number[]} sample @param {number} actual */
function distribution(sample, actual) {
  const mean = sample.reduce((sum, x) => sum + x, 0) / sample.length;
  const sd = Math.sqrt(sample.reduce((sum,x)=>sum+(x-mean)**2,0)/(sample.length-1));
  const ordered = [...sample].sort((a,b)=>a-b);
  return {mean,sd,min:ordered[0],max:ordered.at(-1),
    q95:ordered[Math.ceil(0.95 * sample.length)-1],
    pLower:(1+sample.filter((x)=>x<=actual).length)/(sample.length+1),
    pUpper:(1+sample.filter((x)=>x>=actual).length)/(sample.length+1)};
}

function main() {
  if (pages.length !== 55 || lengths.reduce((sum,x)=>sum+x,0)!==12956 || english.length!==218800) {
    throw new Error("Corpus or source transliteration invariant changed");
  }
  const actualPages = pages.map((page)=>rowCollision(page.indices));
  const actual = bookCollision(pages.map((page)=>page.indices));
  if (actual.sameNeighbors !== 86) throw new Error("Adjacent-repeat count changed");
  const englishFrequency = new Uint32Array(29);
  for (const rune of english) englishFrequency[rune]++;
  const sourceCollision = Array.from(englishFrequency).reduce((s,x)=>s+(x/english.length)**2,0);

  const rng=xorshift(0x1629edab);
  const nullBook=[];
  const plantedBook=[];
  for (let i=0;i<200;i++){
    nullBook.push(bookCollision(simulate(rng,"null")).ratio);
    plantedBook.push(bookCollision(simulate(rng,"english")).ratio);
  }

  const rng2=xorshift(0x1631cafe);
  const observedMax=Math.max(...actualPages.map((x)=>x.ratio));
  const nullMax=[];
  let plantedPagesAbove055=0;
  let plantedPageTotal=0;
  const individualTrials=1000;
  for (let i=0;i<individualTrials;i++){
    const nulls=simulate(rng2,"null").map((page)=>rowCollision(page).ratio);
    nullMax.push(Math.max(...nulls));
    const plants=simulate(rng2,"english").map((page)=>rowCollision(page).ratio);
    plantedPagesAbove055+=plants.filter((value)=>value>0.055).length;
    plantedPageTotal+=plants.length;
  }
  console.log(JSON.stringify({
    model:"per-page arbitrary 29x29 first-order ciphertext-feedback permutation",
    pages:pages.length,runes:lengths.reduce((s,x)=>s+x,0),
    shakespeareRunes:english.length,
    sourceCollision,
    actual,
    nullBook:distribution(nullBook,actual.ratio),
    plantedBook:distribution(plantedBook,actual.ratio),
    singlePage:{
      actualMax:observedMax,
      pageWithMaximum:pages[actualPages.findIndex((x)=>x.ratio===observedMax)].page,
      realPagesAbove055:actualPages.filter((x)=>x.ratio>0.055).length,
      nullMax:distribution(nullMax,observedMax),
      plantedFractionAbove055:plantedPagesAbove055/plantedPageTotal
    },
    seeds:["0x1629edab","0x1631cafe"],repairProbability:0.81,
    nullRepeatProbability:0.00667
  },null,2));
}
if (require.main === module) main();
module.exports={toGematria,rowCollision,bookCollision,simulate,distribution,xorshift};
