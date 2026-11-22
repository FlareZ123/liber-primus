"use strict";
/**
 * Independent public-domain plaintext crib discovery by exact GP29 word lengths.
 * Original manuscript glyphs are not fitted. A length match is no decryption:
 * any candidate still requires a ciphertext-compatible key and full reencryption.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {gpWords} = require("./spiral16_public_row_invariant.cjs");

const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
const target = original.words.map(w => w.length);
const sources = [
  [14209, "The Kybalion (Three Initiates)"],
  [2017, "The Dhammapada (Muller)"],
  [2680, "Meditations (Marcus Aurelius)"],
  [216, "Tao Te Ching (Legge)"],
  [1998, "Thus Spake Zarathustra (Nietzsche)"],
  [1497, "The Republic (Plato/Jowett)"],
  [3283, "The Upanishads (Paramananda)"],
  [2388, "The Bhagavad Gita (Arnold)"],
  [45109, "The Enchiridion (Epictetus)"]
];

/** @param {number[]} values */
function automaton(values) {
  const nodes = [{len:0,link:-1,next:new Map(),first:-1}];
  let last = 0;
  for (let i = 0; i < values.length; i++) {
    const current = nodes.length;
    nodes.push({len:nodes[last].len+1,link:0,next:new Map(),first:i});
    let p = last;
    while (p >= 0 && !nodes[p].next.has(values[i])) {
      nodes[p].next.set(values[i], current);
      p = nodes[p].link;
    }
    if (p >= 0) {
      const q = nodes[p].next.get(values[i]);
      if (nodes[p].len+1 === nodes[q].len) nodes[current].link = q;
      else {
        const clone = nodes.length;
        nodes.push({len:nodes[p].len+1,link:nodes[q].link,
          next:new Map(nodes[q].next),first:nodes[q].first});
        while (p >= 0 && nodes[p].next.get(values[i]) === q) {
          nodes[p].next.set(values[i], clone);
          p = nodes[p].link;
        }
        nodes[q].link = clone;
        nodes[current].link = clone;
      }
    }
    last = current;
  }
  return nodes;
}

/**
 * @param {ReturnType<typeof automaton>} nodes
 * @param {number[]} values
 */
function longest(nodes, values) {
  let state = 0, len = 0, best = {length:0,manuscriptWord:0,sourceWord:0};
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    while (state >= 0 && !nodes[state].next.has(value)) {
      state = nodes[state].link;
      if (state >= 0) len = nodes[state].len;
    }
    if (state < 0) {state = 0;len = 0;continue;}
    state = nodes[state].next.get(value);
    len++;
    if (len > best.length) best = {
      length:len,manuscriptWord:nodes[state].first-len+1,
      sourceWord:i-len+1};
  }
  return best;
}

/** @param {number} id */
async function fetchBook(id) {
  const urls = [
    "https://www.gutenberg.org/cache/epub/" + id + "/pg" + id + ".txt",
    "https://www.gutenberg.org/files/" + id + "/" + id + "-0.txt"
  ];
  const errors = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        headers: {"User-Agent":"LiberPrimus-Research/1.0 (public-text analysis)"}
      });
      if (!response.ok) {errors.push(String(response.status)+" "+url);continue;}
      const body = await response.text();
      const start = body.search(/\*{3}\s*START OF (?:THE )?PROJECT GUTENBERG EBOOK/i);
      const end = body.search(/\*{3}\s*END OF (?:THE )?PROJECT GUTENBERG EBOOK/i);
      const plain = body.slice(start >= 0 ? start+8 : 0,
        end > start ? end : undefined).normalize("NFKD").replace(/\p{M}/gu,"");
      if (plain.length < 2000) throw Error("text too short");
      return {text:plain,url,sha256:crypto.createHash("sha256")
        .update(body).digest("hex")};
    } catch (e) {errors.push(String(e));}
  }
  return {error:errors.join(" | ")};
}

async function run() {
  const nodes = automaton(target);
  assert.equal(longest(nodes,target).length,target.length);
  const output = [];
  for (const [id,title] of sources) {
    const data = await fetchBook(id);
    if (!data.text) {output.push({id,title,skipped:data.error});continue;}
    const words = data.text.toUpperCase().match(/[A-Z]+/g) || [];
    const encoded = gpWords(data.text);
    assert.equal(words.length,encoded.length);
    const match = longest(nodes,encoded.map(w=>w.length));
    const item = {id,title,url:data.url,sourceSHA256:data.sha256,
      wordCount:encoded.length,match,
      lengths:target.slice(match.manuscriptWord,
        match.manuscriptWord+match.length),
      sourceExcerpt:words.slice(match.sourceWord,
        match.sourceWord+match.length).join(" "),
      manuscriptStartPage:original.words[match.manuscriptWord].startPage};
    output.push(item);
    console.log("SOURCE "+JSON.stringify(item));
  }
  const found = output.filter(item => item.match)
    .sort((a,b)=>b.match.length-a.match.length);
  return {status:"source-length crib search; no unknown LP2 plaintext claimed",
    compared:found.length,skipped:output.filter(x=>x.skipped).length,
    best:found.slice(0,10),skippedDetails:output
      .filter(x=>x.skipped).map(x=>({id:x.id,error:x.skipped}))};
}
if (require.main === module) {
  run().then(result=>console.log("FINAL "+JSON.stringify(result)))
    .catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports = {automaton,longest,fetchBook,run};
