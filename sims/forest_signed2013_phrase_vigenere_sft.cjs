"use strict";
/**
 * Source-attributed literal signed-2013 forest quotation as GP29 Vigenere key.
 * Run: node sims/forest_signed2013_phrase_vigenere_sft.cjs
 * Freeze: original p40–55 runes, one continuous clock, both ordinary signs.
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const gp = corpus.translit;
const phrase = "YOU CANT SEE THE FOREST WHEN YOURE LOOKING AT THE TREES";
const normalized = phrase.replace(/[^A-Z]/g,"").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S");
const spellings = [["ING",21],...gp.map((x,i)=>[x,i])]
  .sort((a,b)=>b[0].length-a[0].length);
/** @param {string} text */
function tokenize(text) {
  const output = [];
  while (text.length) {
    const match = spellings.find(([spelling])=>text.startsWith(spelling));
    assert.ok(match, `Unmapped phrase beginning: ${text}`);
    output.push(match[1]);
    text=text.slice(match[0].length);
  }
  return output;
}
const key = tokenize(normalized);
assert.equal(key.length,41);
const pages = corpus.pages.filter(p=>p.page>=40 && p.page<=55);
const cipher=pages.flatMap(p=>p.indices);
assert.equal(cipher.length,3316);
const mod29=n=>(n%29+29)%29;
/** @param {number[]} x */
function ioc(x) {
  const hist=Array(29).fill(0);
  x.forEach(n=>hist[n]++);
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(x.length*(x.length-1));
}
/** @param {number[]} x @param {-1|1} sign */
function decode(x,sign) {
  return x.map((c,i)=>mod29(c+sign*key[i%key.length]));
}
const output={source:"signed 6-Jan-2013 forest clue",keyLength:key.length,
  originalIoC:ioc(cipher),results:[]};
for(const sign of [-1,1]) {
  const p=decode(cipher,sign);
  assert.deepEqual(p.map((n,i)=>mod29(n-sign*key[i%key.length])),cipher);
  const value=ioc(p);
  assert.ok(Math.abs(value-(sign===-1?0.034392961044490175:0.03460619656603478))<1e-14);
  const planted=corpus.pages.find(p=>p.page===57).indices;
  const encrypted=planted.map((n,i)=>mod29(n-sign*key[i%key.length]));
  assert.deepEqual(decode(encrypted,sign),planted);
  output.results.push({sign,ioC:value,
    prefix:p.slice(0,80).map(n=>gp[n]).join(" ")});
}
console.log(JSON.stringify({...output,decision:
  "Neither literal phrase-key sign yields GP-English-like runes; no LP2 key/plaintext recovered"},null,2));
