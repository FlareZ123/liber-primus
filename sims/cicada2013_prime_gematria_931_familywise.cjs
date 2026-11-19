#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync("im-results/data/cicada2013-clear-signed-text-corpus.json", "utf8"));
const grid = JSON.parse(fs.readFileSync("resources/liber-primus/base60-grid.json", "utf8"));
const html = fs.readFileSync("resources/external/cicada2014-stage11-onion7-original-index.html", "utf8");

// Exact participant tokenizer: normalize QU->CW and Q->K, split the source
// into alphabetic words, then greedily consume the longest 3/2/1-letter token.
// Aliases U/V, C/K, S/Z, NG/ING, and IA/IO share their original prime values.
const LOOKUP = {
  F:2,U:3,V:3,TH:5,O:7,R:11,C:13,K:13,G:17,W:19,H:23,N:29,
  I:31,J:37,EO:41,P:43,X:47,S:53,Z:53,T:59,B:61,E:67,M:71,L:73,
  NG:79,ING:79,OE:83,D:89,A:97,AE:101,Y:103,IA:107,IO:107,EA:109
};
const PRIME_VALUES = [...new Set(Object.values(LOOKUP))].sort((a,b)=>a-b);
assert.equal(PRIME_VALUES.length, 29);
const GP0 = new Map(PRIME_VALUES.map((prime,index)=>[prime,index]));
const TOKENS = Object.keys(LOOKUP).sort((a,b)=>b.length-a.length || a.localeCompare(b));
const BASE29 = "0123456789ABCDEFGHIJKLMNOPQRS";
const BASE60 = grid.alphabet;
const BASE59 = BASE60.replace("f", "");

function base29(value) {
  if (value === 0) return "0";
  let n = value, out = "";
  while (n > 0) { out = BASE29[n % 29] + out; n = Math.floor(n / 29); }
  return out;
}
function tokenizeWord(word) {
  const out = [];
  for (let i=0; i<word.length;) {
    const token = TOKENS.find(candidate => word.startsWith(candidate, i));
    assert.ok(token, "unmapped token at " + word.slice(i));
    const prime = LOOKUP[token];
    out.push({token, prime, gp0:GP0.get(prime)});
    i += token.length;
  }
  return out;
}
function tokenizeBody(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW").replace(/Q/g, "K");
  const words = normalized.match(/[A-Z]+/g) || [];
  return words.flatMap(tokenizeWord);
}
function sum(items, key) { return items.reduce((total,item)=>total+item[key],0); }
function charSum(text, offset) {
  return [...text].reduce((total,ch)=>total + ch.charCodeAt(0) - 65 + offset, 0);
}
function cellAt(address) {
  if (!Number.isInteger(address) || address < 0 || address > 255) return null;
  const row = Math.floor(address / 8), col = address % 8;
  const token = grid.rows[row][col];
  const h60 = BASE60.indexOf(token[0]), l60 = BASE60.indexOf(token[1]);
  const h59 = BASE59.indexOf(token[0]), l59 = BASE59.indexOf(token[1]);
  return {
    address, row, col, token,
    base60: h60 < 0 || l60 < 0 ? null : h60 * 60 + l60,
    base59: h59 < 0 || l59 < 0 ? null : h59 * 59 + l59,
    perimeter: row === 0 || row === 31 || col === 0 || col === 7
  };
}
function newAddressStats(windows) {
  return {windows, valid:0, perimeter:0, base60_180:0, base59_180:0, address252:0};
}
function addAddress(stats, address) {
  if (address > 255) return;
  stats.valid++;
  const cell = cellAt(address);
  if (cell.perimeter) stats.perimeter++;
  if (cell.base60 === 180) stats.base60_180++;
  if (cell.base59 === 180) stats.base59_180++;
  if (address === 252) stats.address252++;
}

const targetText = "THE KEY IS ALL AROUND YOU";
const targetTokens = tokenizeBody(targetText);
const targetLetters = targetText.toUpperCase().replace(/[^A-Z]/g, "");
const targetGp0 = sum(targetTokens, "gp0");
const targetPrime = sum(targetTokens, "prime");
const targetA0Z25 = charSum(targetLetters, 0);
const targetA1Z26 = charSum(targetLetters, 1);
assert.equal(targetTokens.length, 19);
assert.equal(targetGp0, 252);
assert.equal(targetPrime, 931);
assert.equal(targetA0Z25, 241);
assert.equal(targetA1Z26, 261);

let total19 = 0, total20 = 0;
const gp0Hits = [], primeHits = [];
const gp0Stats = newAddressStats(0);
const a0Stats = newAddressStats(0), a1Stats = newAddressStats(0);
const fullMessageControls = [];

for (const file of corpus.files) {
  const tokens = tokenizeBody(file.body);
  const letters = file.body.toUpperCase().replace(/[^A-Z]/g, "");
  const fullGp0 = sum(tokens, "gp0");
  const fullPrime = sum(tokens, "prime");
  const fullA0 = charSum(letters, 0), fullA1 = charSum(letters, 1);
  fullMessageControls.push({
    path:file.source_path, source_blob_sha:file.source_blob_sha,
    token_count:tokens.length, full_gp0_sum:fullGp0,
    full_prime_sum:fullPrime, full_prime_base29:base29(fullPrime),
    letter_count:letters.length, full_A0Z25_sum:fullA0, full_A1Z26_sum:fullA1
  });

  for (let start=0; start+19<=tokens.length; start++) {
    total19++;
    const window = tokens.slice(start,start+19);
    const gp0Sum = sum(window, "gp0"), primeSum = sum(window, "prime");
    addAddress(gp0Stats, gp0Sum);
    if (gp0Sum === 252) gp0Hits.push({
      path:file.source_path, start_token:start,
      tokens:window.map(item=>item.token).join(" "),
      target:window.map(item=>item.token).join(" ")===targetTokens.map(item=>item.token).join(" ")
    });
    if (primeSum === 931) primeHits.push({
      path:file.source_path, start_token:start,
      tokens:window.map(item=>item.token).join(" "),
      target:window.map(item=>item.token).join(" ")===targetTokens.map(item=>item.token).join(" ")
    });
  }

  for (let start=0; start+20<=letters.length; start++) {
    total20++;
    const window = letters.slice(start,start+20);
    addAddress(a0Stats, charSum(window,0));
    addAddress(a1Stats, charSum(window,1));
  }
}
gp0Stats.windows = total19;
a0Stats.windows = total20;
a1Stats.windows = total20;

const os = fullMessageControls.find(item=>item.path.includes("message.txt.asc"));
assert.equal(corpus.files.length, 10);
assert.equal(os.full_gp0_sum, 318);
assert.equal(os.full_prime_sum, 1153);
assert.equal(os.full_prime_base29, "1AM");
assert.equal(total19, 1953);
assert.equal(gp0Hits.length, 20);
assert.equal(primeHits.length, 13);
assert.equal(gp0Hits.filter(hit=>hit.target).length, 1);
assert.equal(primeHits.filter(hit=>hit.target).length, 1);
assert.equal(gp0Stats.valid, 1393);
assert.equal(gp0Stats.perimeter, 478);
assert.equal(gp0Stats.base60_180, 20);
assert.equal(gp0Stats.base59_180, 0);
assert.equal(total20, 2031);
assert.equal(a0Stats.valid, 1777);
assert.equal(a0Stats.perimeter, 593);
assert.equal(a0Stats.base60_180, 28);
assert.equal(a0Stats.base59_180, 0);
assert.equal(a1Stats.valid, 1267);
assert.equal(a1Stats.perimeter, 484);
assert.equal(a1Stats.base60_180, 24);
assert.equal(a1Stats.base59_180, 0);
assert.ok(fullMessageControls.every(item=>item.full_gp0_sum!==252 && item.full_prime_sum!==931 && item.full_A0Z25_sum!==252 && item.full_A1Z26_sum!==252));

const selectedCell = cellAt(252);
assert.deepEqual(
  {row:selectedCell.row,col:selectedCell.col,token:selectedCell.token,base60:selectedCell.base60,base59:selectedCell.base59,perimeter:selectedCell.perimeter},
  {row:31,col:4,token:"30",base60:180,base59:177,perimeter:true}
);
const stage11Title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.trim() ?? null;
const stage11Ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match=>match[1]);
const stage11Images = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:jpg|jpeg|png))/gi)].map(match=>match[1]);
assert.equal(base29(931), "133");
assert.equal(stage11Title, "133");
assert.equal(stage11Images.length, 58);

console.log(JSON.stringify({
  corpus_selection:corpus.selection,
  tokenizer:"per-word greedy longest match; QU->CW; Q->K; aliases U/V, C/K, S/Z, NG/ING, IA/IO",
  target:{
    text:targetText, tokens:targetTokens.map(item=>item.token),
    token_count:targetTokens.length, word_GP0_sums:targetText.split(/\s+/).map(word=>sum(tokenizeBody(word),"gp0")),
    GP0_sum:targetGp0, GP_prime_sum:targetPrime, GP_prime_BASE29:base29(targetPrime),
    A0Z25_sum:targetA0Z25, A1Z26_sum:targetA1Z26
  },
  familywise:{
    GP0_19_token_windows:total19, GP0_sum252_hits:gp0Hits.length,
    GP0_target_is_one_of_hits:gp0Hits.some(hit=>hit.target), GP0_address_stats:gp0Stats,
    GP_prime_sum931_hits:primeHits.length, GP_prime_target_is_one_of_hits:primeHits.some(hit=>hit.target),
    GP_prime_hits:primeHits,
    GP0_252_hits:gp0Hits,
    character_20_letter_windows:total20, A0Z25_address_stats:a0Stats, A1Z26_address_stats:a1Stats
  },
  full_message_controls:fullMessageControls,
  cell252:selectedCell,
  stage11:{title:stage11Title,ids:stage11Ids,image_count:stage11Images.length,first_image:stage11Images[0],last_image:stage11Images.at(-1),has_image_133:stage11Images.some(path=>/(?:^|\/)133\./.test(path))}
}, null, 2));
