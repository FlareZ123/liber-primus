"use strict";

/**
 * 2012 Blake historically selected source: frozen original LP2 direct prose
 * and literal-quotation gates, without fitted source offset or cipher period.
 *
 * Source: William Blake, Marriage of Heaven and Hell, 1906 Boston edition,
 * Project Gutenberg #45315, public-domain text, header/footer removed.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const book = fs.readFileSync(path.join(root, "resources", "external",
  "blake-marriage-1906-gutenberg45315.txt"), "utf8");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ciphertext = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
const observed = parseSharedCorpus().words.map(x => x.length);
assert.equal(ciphertext.length, 12956);
assert.equal(observed.length, 2896);
const token = new Map(corpus.translit.map((s, i) => [s, i]));

/** @param {string} text @returns {number[]} */
function gpSymbols(text) {
  const s = text.toUpperCase().replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const pair = s.slice(i, i + 2);
    if (token.has(pair)) { out.push(token.get(pair)); i++; }
    else if (token.has(s[i])) out.push(token.get(s[i]));
  }
  return out;
}
const words = book.toUpperCase().match(/[A-Z]+/g) || [];
assert.equal(words.length, 4609);
const key = gpSymbols(book);
assert.equal(key.length, 18584);
const mod29 = x => (x % 29 + 29) % 29;
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const hist = Array(29).fill(0);
  for (const value of seq) hist[value]++;
  return hist.reduce((s,n) => s + n*(n-1),0) /
    (seq.length*(seq.length-1));
}
/** @param {number[]} data @param {number} sign @returns {number[]} */
function decode(data, sign) {
  return data.map((c, i) => mod29(c + sign*key[i]));
}
/** @param {number[]} data @param {number} sign @returns {number[]} */
function encode(data, sign) {
  return data.map((p,i) => mod29(p - sign*key[i]));
}
const plant = ciphertext.map((_,i) =>
  corpus.pages.find(p => p.page === 57).indices[i%95]);
const decoded = [];
for(const sign of [-1,1]) {
  const out = decode(ciphertext,sign);
  assert.deepEqual(encode(out,sign),ciphertext);
  assert.deepEqual(decode(encode(plant,sign),sign),plant);
  decoded.push({sign,ioc:ioc(out),first72:out.slice(0,72)
    .map(v=>corpus.translit[v]).join("")});
}
/** @param {number[]} original @param {number[]} source
 * @returns {{best:number,positions:Array<[number,number]>}} */
function matchWordLengths(original, source) {
  const width = 8, index = new Map();
  for (let i=0; i+width<=original.length;i++){
    const s=original.slice(i,i+width).join(",");
    if(!index.has(s))index.set(s,[]);
    index.get(s).push(i);
  }
  let best=0,positions=[];
  for(let j=0;j+width<=source.length;j++){
    const positionsAtPrefix=index.get(source.slice(j,j+width).join(","))||[];
    for(const i of positionsAtPrefix){
      let length=width;
      while(i+length<original.length&&j+length<source.length&&
        original[i+length]===source[j+length])length++;
      if(length>best){best=length;positions=[[i,j]];}
      else if(length===best)positions.push([i,j]);
    }
  }
  return {best,positions};
}
const latin=matchWordLengths(observed,words.map(w=>w.length));
const gp=matchWordLengths(observed,words.map(w=>gpSymbols(w).length));
assert.equal(latin.best,0);
assert.equal(gp.best,8);
const seeded=observed.slice();
const sourceGP=words.map(w=>gpSymbols(w).length);
for(let i=0;i<16;i++)seeded[1000+i]=sourceGP[500+i];
const plantedMatch=matchWordLengths(seeded,sourceGP);
assert.ok(plantedMatch.best>=16);
assert.ok(plantedMatch.positions.some(([x,y])=>x===1000&&y===500));
console.log(JSON.stringify({
  classification:"Source-selected 2012 Blake reference, frozen full prose key and crib",
  source:"1906 Marriage of Heaven and Hell, Gutenberg 45315",
  originalRunes:ciphertext.length,originalWords:observed.length,
  originalIoC:ioc(ciphertext), sourceWords:words.length,
  sourceGPRunes:key.length,sourceLatinLetters:words.join("").length,
  directRunningKey:decoded, literalWordLengths:{latin,gp},
  sourceNativePlantRecovered:true, planted16WordCribRecovered:true
},null,2));
