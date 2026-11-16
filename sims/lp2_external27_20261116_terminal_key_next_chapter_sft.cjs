"use strict";

/**
 * A single conditional held-out LP2 chapter test of the 16 Nov 2026 external
 * 27x27 report's published terminal original key node, T-M-EA.
 *
 * Frozen hypothesis: apply final direct 3-rune node, unchanged, as the
 * phase-zero repeated subtractive GP29 key over the next original chapter
 * (physical p3-p7), with no F skipping, row/path search, page reset or
 * English-word selection.
 * This is a downstream hypothesis, not an authenticated Cicada instruction.
 * Run: node sims/lp2_external27_20261116_terminal_key_next_chapter_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const sourcePages = source.pages.slice(3, 8);
const original = sourcePages.flatMap(p => p.indices);
assert.deepEqual(sourcePages.map(p => p.page), [3, 4, 5, 6, 7]);
assert.deepEqual(sourcePages.map(p => p.indices.length), [217, 235, 267, 218, 208]);
assert.equal(original.length, 1145);
assert.equal(source.pages.slice(0, 3).reduce((s,p)=>s+p.indices.length,0), 729);

/** @type {readonly number[]} */
const terminalKey = [16, 19, 28]; // T, M, EA: original 27x27 cells (11,13),(12,13),(13,13)
const opening = source.pages.slice(0, 3).flatMap(p => p.indices);
/** @param {number} r @param {number} c @returns {number} */
function get(r,c){return opening[(r-1)*27 + c-1]}
assert.deepEqual([get(11,13),get(12,13),get(13,13)], terminalKey);
assert.deepEqual(terminalKey.map(i=>source.translit[i]), ["T","M","EA"]);
/** @param {number[]} input @param {number} sign @returns {number[]} */
function convert(input, sign) {return input.map((v,i)=>(v+sign*terminalKey[i%3]+58)%29)}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const n=Array(29).fill(0);for(const v of a)n[v]++;
  return n.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @returns {string} */
function txt(a){return a.map(i=>source.translit[i]).join("")}
const candidate=convert(original,-1);
assert.deepEqual(convert(candidate,+1),original);
assert.equal(candidate.length,1145);
assert.ok(Math.abs(ioc(original)-0.034633706904449266)<1e-12);
assert.ok(Math.abs(ioc(candidate)-0.03435429199621339)<1e-12);
assert.ok(Math.abs(ioc(candidate.slice(0,217))-0.03537293053422086)<1e-12);
assert.ok(txt(candidate.slice(0,20)).startsWith("RNGPNGTHGSYYAYSNGYTH"));

// A source-authentic clear-GP control: source page57 is the solved PARABLE,
// 95 authentic plaintext runes; plant it under the same frozen key.
const clear=source.pages[57].indices;
assert.equal(clear.length,95);
assert.deepEqual(convert(convert(clear,+1),-1),clear);
const output={
  externalReport:"https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/771efe5f89f5ae0325b58c4b769f41e2ebf58025/ai-analysis/report-01.md",
  frozenKey:terminalKey.map(i=>source.translit[i]).join(" "),
  sourceCoordinates:"(11,13),(12,13),(13,13)",
  target:"unchanged physical LP2 pp3-7 after the proposed 729-cell p0-2 map",
  originalRuneCount:original.length,
  originalIoC:ioc(original),
  decodedIoC:ioc(candidate),
  firstPageDecodedIoC:ioc(candidate.slice(0,217)),
  first110:txt(candidate.slice(0,110)),
  plantRecovered:clear.length,
  reencryptedMatches:convert(candidate,+1).filter((v,i)=>v===original[i]).length,
  status:"No readable GP29 plaintext; frozen final-node-to-next-chapter direct cipher fails"
};
console.log(JSON.stringify(output,null,2));
