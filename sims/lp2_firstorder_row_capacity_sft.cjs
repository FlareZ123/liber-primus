"use strict";
/**
 * Original-cipher SFT: all-secret complete first-order ciphertext-state
 * row-codebook capacity, for native GP29 and Latin26 plaintext registers.
 *
 * Run: node sims/lp2_firstorder_row_capacity_sft.cjs
 * Node 22, local repository fixtures only; no libraries or network.
 *
 * A full encoder mapping every A-letter plaintext alphabet symbol at each
 * preceding-ciphertext state into one of 29 runes requires at least one
 * output rune per plaintext symbol. Any group of k plaintext symbols can
 * thus occupy no more than k+(29-A) outputs in that row, even if other
 * output runes are homophonic. Summing the most populated original source
 * outputs in every state supplies an exact, all-secret upper bound.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(page => page.page < 56 && page.indices.length);
const lengths = pages.map(page => page.indices.length);
const originalN = lengths.reduce((sum, size) => sum + size, 0);
const observedEligible = originalN - lengths.length;
assert.equal(originalN, 12956);
assert.equal(lengths.length, 55);
assert.equal(observedEligible, 12901);
const chapterEndExclusive = [3, 8, 15, 23, 27, 33, 40, 54, 56];
/** @param {number} page @returns {number} */
function chapterOf(page) {
  return chapterEndExclusive.findIndex(end => page < end);
}

/**
 * Count actual adjacent ciphertext transitions in each candidate
 * book/chapter/eight-phase decoder state. Page-initial runes remain
 * untested because the previous-state value is not source-fixed.
 * @param {{page:number,indices:number[]}[]} corpus
 * @param {"book"|"chapter"|"eight-phase"|"chapter-eight-phase"|"page"} clock
 * @returns {Map<string, Uint32Array>}
 */
function transitionRows(corpus, clock) {
  const states = new Map();
  for (const page of corpus) {
    const c = page.indices, chapter = chapterOf(page.page);
    for (let i = 1; i < c.length; i++) {
      const phase = (i - 1) % 8;
      const state = clock === "book" ? "b"
        : clock === "chapter" ? String(chapter)
        : clock === "eight-phase" ? String(phase)
        : clock === "page" ? String(page.page)
        : chapter + "/" + phase;
      const key = state + ":" + c[i - 1];
      if (!states.has(key)) states.set(key, new Uint32Array(29));
      states.get(key)[c[i]]++;
    }
  }
  return states;
}

/**
 * Exact optimistic upper bound on plaintext occupancy of ANY selected
 * k symbols, under complete rowwise 29-output/A-input secret decoder.
 * @param {Map<string, Uint32Array>} rows
 * @param {26|29} alphabetSize
 * @param {number} k
 * @returns {number}
 */
function maxGroupOccupancy(rows, alphabetSize, k) {
  assert(k >= 1 && k <= alphabetSize);
  const outputsAvailable = k + 29 - alphabetSize;
  let capacity = 0;
  for (const row of rows.values()) {
    const values = [...row].sort((a,b) => b-a);
    for (let j = 0; j < outputsAvailable; j++) capacity += values[j];
  }
  return capacity;
}
const clocks = ["book", "chapter", "eight-phase", "chapter-eight-phase", "page"];
const originalRows = Object.fromEntries(clocks.map(clock =>
  [clock, transitionRows(pages, clock)]));
const sourceCapacity = {};
for (const clock of clocks) {
  const rows = originalRows[clock];
  sourceCapacity[clock] = {
    stateRows: rows.size,
    gp29: {
      top1: maxGroupOccupancy(rows, 29, 1),
      top5: maxGroupOccupancy(rows, 29, 5)
    },
    latin26: {
      top1: maxGroupOccupancy(rows, 26, 1),
      top4: maxGroupOccupancy(rows, 26, 4),
      top5: maxGroupOccupancy(rows, 26, 5)
    }
  };
}
assert.deepEqual(sourceCapacity.book.gp29, {top1:714, top5:3135});
assert.deepEqual(sourceCapacity.chapter.gp29, {top1:1255, top5:4811});
assert.deepEqual(sourceCapacity["eight-phase"].gp29, {top1:1216,top5:4767});
assert.deepEqual(sourceCapacity.book.latin26,
  {top1:2564,top4:4232,top5:4759});
assert.equal(sourceCapacity["chapter-eight-phase"].gp29.top1,3040);
assert.equal(sourceCapacity.page.gp29.top1,2735);

// Source-attested English GP spelling: ING and IO are single runes.
const tokens = gp.translit.map((text, code)=>({text,code}))
  .sort((a,b)=>b.text.length-a.text.length);
/** @param {string} source @returns {number[]} */
function encodeGP(source) {
  const normalized=source.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const output=[];
  for(const word of normalized.match(/[A-Z]+/g)||[]) {
    for(let i=0;i<word.length;) {
      if(word.startsWith("ING",i)){output.push(21);i+=3;}
      else if(word.startsWith("IO",i)){output.push(27);i+=2;}
      else{
        const token=tokens.find(t=>word.startsWith(t.text,i));
        assert(token,"unmatched GP spelling "+word.slice(i));
        output.push(token.code);
        i+=token.text.length;
      }
    }
  }
  return output;
}
/** @param {string} source @returns {number[]} */
const encodeLatin = source => [...(source.toUpperCase().match(/[A-Z]/g)||[])]
  .map(letter=>letter.charCodeAt(0)-65);
assert.deepEqual(encodeGP("THINGS"), [2,21,15]);
assert.deepEqual(encodeGP("FUNCTION"), [0,1,9,5,16,27,9]);

/**
 * Count top-k source-native plaintext symbols at the source page cuts.
 * The top-k symbols are selected within each independent control window,
 * which remains legitimate because the capacity bound applies to any set.
 * @param {number[]} window
 * @param {26|29} alphabetSize
 * @param {number} k
 * @returns {number}
 */
function controlTopK(window, alphabetSize, k) {
  assert.equal(window.length, originalN);
  const counts = new Uint32Array(alphabetSize);
  let offset = 0;
  for (const size of lengths) {
    for (let i = 1; i < size; i++) counts[window[offset+i]]++;
    offset += size;
  }
  return [...counts].sort((a,b)=>b-a).slice(0,k)
    .reduce((sum,count)=>sum+count,0);
}
const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt",32,34],
  ["Gibran", "resources/control/gibran_prophet_58585.txt",8,9],
  ["Emerson", "resources/control/emerson_essays_2944.txt",48,51]
];
const controlResults = [];
for(const [name,filename,expectedGP,expectedLatin] of sources){
  const original=read(filename);
  for(const [register,encoder,alphabetSize,expected] of [
    ["gp29",encodeGP,29,expectedGP],
    ["latin26",encodeLatin,26,expectedLatin]
  ]) {
    const encoded=encoder(original);
    const data=[];
    for(let start=0;start+originalN<=encoded.length;
      start+=Math.floor(originalN/2)){
      const window=encoded.slice(start,start+originalN);
      data.push({top1:controlTopK(window,alphabetSize,1),
        top4:controlTopK(window,alphabetSize,4),
        top5:controlTopK(window,alphabetSize,5)});
    }
    assert.equal(data.length,expected,name+" "+register+" control windows");
    const minima=Object.fromEntries(["top1","top4","top5"]
      .map(key=>[key,Math.min(...data.map(x=>x[key]))]));
    const gate = register==="gp29"
      ? {
        bookOne: minima.top1>sourceCapacity.book.gp29.top1,
        chapterOne: minima.top1>sourceCapacity.chapter.gp29.top1,
        eightPhaseOne: minima.top1>sourceCapacity["eight-phase"].gp29.top1,
        chapterFive: minima.top5>sourceCapacity.chapter.gp29.top5
      }
      : {
        bookFour: minima.top4>sourceCapacity.book.latin26.top4,
        bookFive: minima.top5>sourceCapacity.book.latin26.top5
      };
    assert(Object.values(gate).every(Boolean),
      name+" "+register+" all secret capacity contradiction");
    controlResults.push({name,register,windows:data.length,
      minTop1:minima.top1,minTop4:minima.top4,minTop5:minima.top5,gate});
  }
}
assert.equal(controlResults.reduce((sum,r)=>sum+r.windows,0),182);

/**
 * Fully reversible synthetic source-native example using a deterministic
 * complete row injection: C_i = 11*P_i + 7*C_(i-1) mod29.
 * For Latin26, the other three output symbols remain available as unused
 * homophones, but the injection is already a valid complete encryption.
 * @param {number[]} input
 * @param {26|29} alphabetSize
 * @returns {{correct:number,capacityHolds:boolean}}
 */
function positivePlant(input, alphabetSize) {
  assert.equal(input.length,originalN);
  let offset=0,correct=0;
  const planted=[];
  for(const size of lengths){
    let prev=7;
    const indices=[];
    for(let i=0;i<size;i++){
      const p=input[offset+i];
      assert(p<alphabetSize);
      const c=(11*p+7*prev)%29;
      const inverse=((8*(c-7*prev))%29+29)%29;
      assert.equal(inverse,p,"row inverse must reproduce plant");
      indices.push(c);prev=c;correct++;
    }
    planted.push({page:pages[planted.length].page, indices});
    offset+=size;
  }
  const boundRows=transitionRows(planted,"book");
  const topFive=controlTopK(input,alphabetSize,5);
  const capacityHolds=topFive<=maxGroupOccupancy(boundRows,alphabetSize,5);
  assert(capacityHolds,"planted complete row injection must satisfy theorem");
  assert.equal(correct,originalN);
  return {correct,capacityHolds,topFive,
    plantedTopFiveBound:maxGroupOccupancy(boundRows,alphabetSize,5)};
}
const gpPlant=positivePlant(encodeGP(read(sources[1][1])).slice(0,originalN),29);
const latinPlant=positivePlant(encodeLatin(read(sources[0][1])).slice(0,originalN),26);
console.log(JSON.stringify({
  result:"PASS: exact original all-secret complete first-order row capacity; no plaintext recovered",
  original:{runes:originalN,runeBearingPages:lengths.length,
    eligibleWithinPage:observedEligible},
  sourceCapacity,
  originalControls:controlResults,
  positivePlant:{gp29:gpPlant,latin26:latinPlant}
},null,2));
