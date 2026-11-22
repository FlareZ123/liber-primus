"use strict";
/**
 * Key-independent collision test of every full-GP29 secret output permutation
 * indexed by the two preceding original ciphertext runes.
 * Node 22, from repository root: node sims/lp2_two_ciphertext_history_allsecret_collision_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const file = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(file("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const starts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const total = pages.reduce((sum,p) => sum + p.indices.length, 0);
assert.equal(total, 12956);
assert.equal(pages.length,55);
function chapter(p) {
  return starts.findLastIndex(start => p >= start);
}
/**
 * @param {{page:number,indices:number[]}[]} source
 * @param {boolean} byChapter
 * @returns {{numerator:number,denominator:number,rate:number,states:number}}
 */
function measure(source, byChapter=false) {
  const table = new Map();
  for (const p of source) {
    const a = p.indices;
    for (let i=2; i<a.length; i++) {
      const state=(byChapter ? chapter(p.page)*841 : 0)+a[i-2]*29+a[i-1];
      if (!table.has(state)) table.set(state, new Int32Array(29));
      table.get(state)[a[i]]++;
    }
  }
  let numerator=0,denominator=0;
  for (const row of table.values()) {
    let count=0;
    for (const n of row) {
      numerator+=n*(n-1);
      count+=n;
    }
    denominator+=count*(count-1);
  }
  return {numerator,denominator,rate:numerator/denominator,states:table.size};
}
const original=measure(pages), originalChapter=measure(pages,true);
assert.deepEqual(original,{numerator:7022,denominator:201168,rate:7022/201168,states:840});
assert.deepEqual(originalChapter,{numerator:970,denominator:27958,rate:970/27958,states:5642});

/**
 * Original solved-English GP spelling: QU→CW, V→U, K/Q→C, Z→S,
 * ING→NG and IO→IA as single genuine GP rune identities.
 * @param {string} sourceText
 * @returns {number[]}
 */
function gpEncode(sourceText) {
  const lexicon=gp.translit.map((text,i)=>({text,i}))
    .sort((a,b)=>b.text.length-a.text.length);
  const text=sourceText.toUpperCase().replace(/QU/g,"CW")
    .replace(/ING/g,"NG").replace(/IO/g,"IA")
    .replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/Q/g,"C");
  const output=[];
  for (const word of text.match(/[A-Z]+/g)||[]) {
    for (let i=0; i<word.length;) {
      const token=lexicon.find(r=>word.startsWith(r.text,i));
      if (token) {output.push(token.i);i+=token.text.length;}
      else i++;
    }
  }
  return output;
}

/**
 * Cipher: C[i] = a(previous TWO ciphertext runes)*P[i]+b(state) mod29.
 * Every state table is a fixed bijection; parameters never depend on P[i].
 * Page starts use two fixed sentinels, and every source page length is kept.
 * @param {number[]} native
 * @returns {{page:number,indices:number[]}[]}
 */
function plant(native) {
  let cursor=0;
  const source=[];
  for (const p of pages) {
    let prev2=-1,prev1=-1;
    const cipher=[];
    for (let j=0;j<p.indices.length;j++) {
      const mul=1+((prev2+1)*7+(prev1+1)*11)%28;
      const add=((prev2+1)*3+(prev1+1)*5)%29;
      const plain=native[cursor++];
      assert(Number.isInteger(plain) && plain>=0 && plain<29);
      const output=(mul*plain+add)%29;
      // Prime modulus 29 guarantees mul has a unique inverse.
      let found=-1;
      for (let v=0;v<29;v++) if ((v*mul+add)%29===output) {
        assert.equal(found,-1);
        found=v;
      }
      assert.equal(found,plain);
      cipher.push(output);
      prev2=prev1;prev1=output;
    }
    source.push({page:p.page,indices:cipher});
  }
  assert.equal(cursor,total);
  return source;
}
const controls={};
for (const [label,source] of [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
]) {
  const normalized=gpEncode(file(source));
  assert(normalized.length>=total);
  const encrypted=plant(normalized.slice(0,total));
  const observed=measure(encrypted);
  const chapterObserved=measure(encrypted,true);
  assert(observed.rate>0.05);
  assert(chapterObserved.rate>0.05);
  controls[label]={native_runes:normalized.length,
    ciphertext_history2:observed,chapter_history2:chapterObserved};
}
console.log(JSON.stringify({
  model:"GP29 secret state-dependent bijection with previous two cipher runes",
  original,originalChapter,controls,
  interpretation:"Original data has far fewer within-state equality pairs than full-symbol native GP plants; state-specific secret permutations cannot change those pairs."
},null,2));
console.log("PASS: all-secret two-ciphertext-history original capacity gate; no plaintext");
