"use strict";

/**
 * Source-to-grid navigation test. Two visible manuscript numerals 3301/1033
 * use the authenticated 2013 Cicada BASE29 command. Their 2-character
 * prefixes occur exactly once in the LP2 physical 32x8 numeric table.
 *
 * This tests a bounded ORIGINAL navigation hypothesis, NOT a GP29 cipher.
 * It enumerates no plaintext or secret key.
 *
 * Windows 11, Node.js 22:
 *   node sims/lp2_2013_base29_dualprefix_p50_graph_sft.cjs
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

/** @param {number} value @param {number} base @param {string} alphabet @returns {string} */
function encode(value, base, alphabet) {
  assert(Number.isSafeInteger(value) && value >= 0);
  assert.equal(alphabet.length, base);
  let n = value;
  let output = "";
  do {
    output = alphabet[n % base] + output;
    n = Math.floor(n / base);
  } while (n > 0);
  return output;
}
/** @param {number[]} bytes @param {number} start @param {number} steps @returns {number} */
function follow(bytes, start, steps) {
  let p = start;
  for (let j = 0; j < steps; j++) p = bytes[p];
  return p;
}
/** @param {number[]} bytes @param {number} start @returns {Map<number,number>} */
function visit(bytes, start) {
  const found = new Map();
  let n = start;
  while (!found.has(n)) {
    found.set(n, found.size);
    n = bytes[n];
  }
  return found;
}
/** @param {number[]} bytes @param {number} a @param {number} b @returns {{node:number,firstSteps:number,secondSteps:number}|null} */
function firstCoalescence(bytes, a, b) {
  const left = visit(bytes, a), right = visit(bytes, b);
  for (const [node, secondSteps] of right) {
    if (left.has(node)) return {node, firstSteps: left.get(node), secondSteps};
  }
  return null;
}
const source2013 = read("resources/external/2013-tcp-server-signed-source.md");
assert(source2013.includes("BASE29 3301") && source2013.includes("3QO"));
assert(source2013.includes("BASE29 1033") && source2013.includes("16I"));
const gp29 = "0123456789ABCDEFGHIJKLMNOPQRS";
const code3301 = encode(3301, 29, gp29);
const code1033 = encode(1033, 29, gp29);
assert.equal(code3301, "3QO");
assert.equal(code1033, "16I");

// Treat the leading two source digits as table tokens, with the third
// source digit still unexplained. This is an inferred operation!
const prefix3301 = code3301.slice(0, 2);
const prefix1033 = code1033.slice(0, 2);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const cells = grid.pages.flatMap((p) => p.tokens);
const bytes = grid.bytes;
assert.equal(cells.length, 256);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
/** @param {string} t @returns {number} */
function decode60(t) {
  assert.equal(t.length, 2);
  return grid.alphabet.indexOf(t[0]) * 60 + grid.alphabet.indexOf(t[1]);
}
assert.deepEqual(cells.map(decode60), bytes);
const firstMatches = cells.flatMap((x, i) => x === prefix3301 ? [i] : []);
const secondMatches = cells.flatMap((x, i) => x === prefix1033 ? [i] : []);
assert.deepEqual(firstMatches, [103]);
assert.deepEqual(secondMatches, [29]);
const start1 = firstMatches[0], start2 = secondMatches[0];
assert.deepEqual([bytes[start1], bytes[start2]], [206,66]);

const merged = firstCoalescence(bytes, start1, start2);
assert.deepEqual(merged, {node:73,firstSteps:6,secondSteps:9});
const partA = Array.from({length:13}, (_,n) => follow(bytes,start1,n));
const partB = Array.from({length:16}, (_,n) => follow(bytes,start2,n));
assert.deepEqual(partA, [103,206,127,193,155,112,73,79,82,201,74,205,76]);
assert.deepEqual(partB, [29,66,25,198,105,63,51,59,69,73,79,82,201,74,205,76]);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

// The 2013 audio track has a historical 761 filename and a literal ID3
// PARABLE number 1,595,277,641. Three original 2014 clear-p57 clauses
// independently reproduce the latter source number by GP prime products.
const solved=corpus.pages[57].indices, primes=corpus.prime;
const weight=(a) => a.reduce((sum,v)=>sum+primes[v],0);
const parableSums=[
  weight(solved.slice(7,37)),
  weight(solved.slice(37,67)),
  weight(solved.slice(67,95))
];
assert.deepEqual(parableSums,[1259,1031,1229]);
const parableId3=parableSums.reduce((a,v)=>a*v,1);
assert.equal(parableId3,1595277641);
assert.equal(parableId3%256,73);

// A second INDEPENDENT candidate addresses the 256 original cells by
// the lowest eight bits of other historically printed values. It does not
// follow from the BASE29 prefix opcode, and both are hypotheses.
const traditional={wisdom1033:1033%256,mp3Title761:761%256,wisdom3301:3301%256,
  parableId3:parableId3%256};
assert.deepEqual(traditional,{wisdom1033:9,mp3Title761:249,
  wisdom3301:229,parableId3:73});
assert.deepEqual([bytes[9],bytes[249],bytes[229]],[249,158,0]);
assert.deepEqual([bytes[73],bytes[201],bytes[205]],[79,74,76]);

// Historically documented toy-DH exponent6 and recovered client exponent15,
// whose reading as graph hop-counts is also a human-route hypothesis.
assert.equal(follow(bytes,start1,6),73);
assert.equal(follow(bytes,start2,15),76);

// Null: original 256 full byte values retained, independently reshuffled
// ONLY between indices with identical original residue modulo29. Therefore
// every original GF29 coefficient position and every original H/G parity check
// is unchanged in every replicate. The two source tokens follow their new
// locations; no original index 103 or29 is privileged in controls.
// This is conditional on our previously discovered candidate operations.
const bins = Array.from({length:29},()=>[]);
for (let i=0;i<256;i++) bins[bytes[i]%29].push(i);
const simulated = bytes.slice();
let state = 0x33011033;
/** @returns {number} */
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const sampleCount=200000;
const counts={
  mergeAt73:0,
  mergeExactly6and9At73:0,
  dualDhEndpoints:0,
  fullTerminalTrace:0,
  mergedAtAnyOf73_74_76:0,
  twoPrefixSameComponent:0,
  wisdom1033To761:0,
  wisdom3301ToZero:0,
  bothTraditionalHits:0,
  traditionalAndMerge:0,
  traditionalAndDualDh:0,
};
for (let trial=0;trial<sampleCount;trial++) {
  for (const positions of bins) {
    for(let j=positions.length-1;j>0;j--) {
      const k=next()%(j+1),a=positions[j],b=positions[k];
      [simulated[a],simulated[b]]=[simulated[b],simulated[a]];
    }
  }
  const first = simulated.indexOf(206), second = simulated.indexOf(66);
  const is1033to761=simulated[9]===249, is3301to0=simulated[229]===0;
  if(is1033to761) counts.wisdom1033To761++;
  if(is3301to0) counts.wisdom3301ToZero++;
  if(is1033to761&&is3301to0) counts.bothTraditionalHits++;
  const match = firstCoalescence(simulated,first,second);
  if(match!==null) {
    counts.twoPrefixSameComponent++;
    if([73,74,76].includes(match.node))counts.mergedAtAnyOf73_74_76++;
    if(match.node===73) counts.mergeAt73++;
    if(match.node===73&&match.firstSteps===6&&match.secondSteps===9)
      counts.mergeExactly6and9At73++;
  }
  if(is1033to761&&is3301to0&&match!==null
    &&match.node===73&&match.firstSteps===6&&match.secondSteps===9)
      counts.traditionalAndMerge++;
  const dh6=follow(simulated,first,6)===73;
  const dh15=follow(simulated,second,15)===76;
  if(dh6&&dh15) counts.dualDhEndpoints++;
  if(is1033to761&&is3301to0&&dh6&&dh15)
    counts.traditionalAndDualDh++;
  if(dh6&&dh15&&follow(simulated,first,10)===74)
    counts.fullTerminalTrace++;
}

assert.deepEqual(counts,{
  mergeAt73:5383,mergeExactly6and9At73:23,dualDhEndpoints:23,
  fullTerminalTrace:1,mergedAtAnyOf73_74_76:7031,
  twoPrefixSameComponent:140593,
  wisdom1033To761:74942,wisdom3301ToZero:57224,
  bothTraditionalHits:21397,traditionalAndMerge:2,
  traditionalAndDualDh:1
});
console.log(JSON.stringify({
  original:{
    authenticated2013Base29:{number3301:code3301,number1033:code1033,
      prefix3301,prefix1033,unconsumedDigits:[code3301[2],code1033[2]]},
    sourceNumberBytes:traditional,sourceParableClauseSums:parableSums,
    uniquePrefixCells:[start1,start2],first12Hops:partA,
    second15Hops:partB,firstMerge:merged,
    actualPage55Runes:76,syntheticCombinedScanNumbers:
      {note:"17 LP1 + LP2 p56/p57, NOT original LP2 filenames",
        solved56:73,solved57:74}
  },
  null:{
    kind:"full-byte-permutation-within-identical-original-GF29-residue",
    seed:"0x33011033",sampleCount,counts,
    conditionalPlusOne:Object.fromEntries(
      Object.entries(counts).map(([name,n])=>[name,(n+1)/(sampleCount+1)]))
  },
  conclusion:"Historical BASE29, 761, 1033, 3301 and ID3 Parable provide independent source-number entries into a common p50 graph. Not a decoder; all opcodes/targets were selected retrospectively."
},null,2));
