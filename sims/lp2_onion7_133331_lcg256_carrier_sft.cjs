"use strict";
/**
 * Source-fixed 2014 Onion7 title/id linear-congruential 256-cell readout.
 *
 * Tests whether the archived 133 and 331 can form a full-period
 * permutation of the entire original pp49-51 table and whether its
 * standout printable / Base64 run is a self-authenticating payload.
 *
 * This is a carrier-selection gate, not a decryption.
 * @module lp2_onion7_133331_lcg256_carrier_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} rel */
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
/** @param {number} n */
const inBase64 = (n) => (
  (n >= 65 && n <= 90) || (n >= 97 && n <= 122) ||
  (n >= 48 && n <= 57) || n === 43 || n === 47
);
/** @param {number} n */
const isPrintable = (n) => (
  (n >= 32 && n <= 126) || n === 9 || n === 10 || n === 13
);
/**
 * @param {number[]} values
 * @param {(x:number)=>boolean} accept
 * @returns {{length:number,start:number,text:string,indices:number[]}}
 */
function bestRun(values, accept) {
  let best = { length: 0, start: -1, text: "", indices: [] };
  for (let i = 0; i < values.length;) {
    if (!accept(values[i])) { i++; continue; }
    let end = i;
    while (end < values.length && accept(values[end])) end++;
    if (end - i > best.length) {
      best = {
        start: i, length: end - i,
        text: Buffer.from(values.slice(i, end)).toString("latin1"),
        indices: Array.from({length: end - i}, (_, k) => i + k),
      };
    }
    i = end;
  }
  return best;
}
/** @param {number} n @param {number} k */
function choose(n, k) {
  let result = 1n;
  for (let j = 1; j <= k; j++) {
    result = result * BigInt(n + 1 - j) / BigInt(j);
  }
  return result;
}
/**
 * Exact fixed-inventory null: n positions, k characters in a class,
 * probability of at least one contiguous run of length >= r under a
 * uniformly permuted original byte multiset. Computed without Monte Carlo.
 * @param {number} n @param {number} k @param {number} r
 */
function exactRunTail(n, k, r) {
  let dp = Array(k + 1).fill(0n);
  dp[0] = 1n;
  for (let gap = 0; gap <= n - k; gap++) {
    const next = Array(k + 1).fill(0n);
    for (let count = 0; count <= k; count++) {
      for (let added = 0; added < r && count + added <= k; added++) {
        next[count + added] += dp[count];
      }
    }
    dp = next;
  }
  const total = choose(n, k);
  const hit = total - dp[k];
  assert.ok(hit > 0n && hit < total);
  return {n,k,r,tailProbability:Number(hit) / Number(total)};
}
/** @param {number[]} bytes */
function sourceAndReadout(bytes) {
  const html = read("resources/cicada2014-onion7-index.html");
  const a = Number(html.match(/<title>\s*(\d+)\s*<\/title>/i)?.[1]);
  const c = Number(html.match(/<div id="(\d+)"/i)?.[1]);
  assert.deepEqual([a,c],[133,331]);
  assert.equal((html.match(/<img src="\d+\.jpg"/g) || []).length,58);
  assert.equal(bytes.length,256);

  // The natural first-integer-as-multiplier interpretation is a full-cycle
  // LCG mod 2^8 (133 % 4 = 1; 331 odd). Reversing the roles is not.
  /** @param {number} mul @param {number} add */
  const orbit = (mul, add) => {
    const p = [], seen = new Set();
    let x = 0;
    while (!seen.has(x)) {
      seen.add(x);
      p.push(x);
      x = (mul*x+add) % 256;
    }
    return { positions:p, final:x };
  };
  const selected = orbit(a,c);
  const swapped = orbit(c,a);
  assert.equal(selected.positions.length,256);
  assert.equal(selected.final,0);
  assert.ok(swapped.positions.length < 256);
  const readout = selected.positions.map(i => bytes[i]);
  return {a,c,selected,swapped,readout};
}
/** @param {number[]} b */
function asciiSummary(b) {
  const printable = b.filter(isPrintable).length;
  const base64Count = b.filter(inBase64).length;
  const printableRun = bestRun(b,isPrintable);
  const base64Run = bestRun(b,inBase64);
  return {printable,base64Count,printableRun,base64Run};
}
/**
 * Exhaust the 8192 full-period affine traversals modulo 256,
 * a = 1 mod 4 and odd increment c.
 * @param {number[]} bytes
 */
function allFullCycleAffineTraversals(bytes) {
  const longRuns = [], repeatedSlash = [];
  for (let a=1; a<256; a+=4) {
    for (let c=1; c<256; c+=2) {
      const v = [];
      let x=0;
      for (let t=0; t<256; t++) {
        v.push(bytes[x]);
        x=(a*x+c)&255;
      }
      assert.equal(x,0);
      const run=bestRun(v,inBase64);
      if (run.length >= 11) longRuns.push({a,c,...run});
      for (let i=0;i+4<256;i++) {
        if (v[i+2] === 47 &&
            v[i] === v[i+3] && v[i+1] === v[i+4] &&
            inBase64(v[i]) && inBase64(v[i+1])) {
          repeatedSlash.push({
            a,c,start:i,
            text:Buffer.from(v.slice(i,i+5)).toString("latin1")
          });
        }
      }
    }
  }
  return {traversals:8192,longRuns,repeatedSlash};
}
/**
 * Fixed-inventory expected AB/AB matches in 252 windows of a uniformly
 * shuffled original table; this is an upper bound for >=1 match.
 * This event was recognized after viewing the output.
 * @param {number[]} bytes
 */
function duplicateSlashNullBound(bytes) {
  const freq=Array(256).fill(0);
  for (const x of bytes) freq[x]++;
  const a2=freq.map((n,i)=>inBase64(i)&&i!==47 ? n*(n-1) : 0);
  let ordered=0;
  for (let a=0;a<256;a++) for (let b=0;b<256;b++) {
    if (a!==b) ordered+=a2[a]*a2[b];
  }
  const p=252*freq[47]*ordered/(256*255*254*253*252);
  return {slashCount:freq[47],expectedMotifs:p,probabilityUpperBound:p};
}
/** @param {number[]} values */
function printableHeader(values) {
  return Buffer.from(values.slice(0,32))
    .toString("latin1").replace(/[^\x20-\x7e]/g,".");
}
function run() {
  const data = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
  const bytes = data.bytes;
  assert.equal(data.shape,"32 rows by 8 columns across LP2 pages 49, 50, 51");
  const hash = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(hash,
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const src = sourceAndReadout(bytes);
  const ordinary = asciiSummary(bytes);
  const selected = asciiSummary(src.readout);
  const inverse = new Array(256);
  for (let i=0;i<256;i++) inverse[src.selected.positions[i]]=bytes[i];
  const inverseStats = asciiSummary(inverse);
  assert.equal(ordinary.base64Count,74);
  assert.equal(ordinary.base64Run.length,5);
  assert.equal(selected.base64Run.length,11);
  assert.equal(selected.base64Run.start,173);
  assert.equal(selected.base64Run.text,"Q8rI6/I6PiT");
  assert.equal(selected.printableRun.length,12);
  assert.equal(selected.printableRun.start,172);
  assert.equal(inverseStats.base64Run.length,4);
  assert.equal(src.readout[172],13);
  assert.equal(src.readout[184],231);
  const decoded = Buffer.from(selected.base64Run.text+"=","base64");
  assert.equal(decoded.toString("hex"),"43cac8ebf23a3e24");
  const sourceCells = src.selected.positions.slice(173,184);
  assert.deepEqual(sourceCells,[183,94,33,112,123,50,69,36,255,198,41]);
  const base64Null = exactRunTail(256,ordinary.base64Count,11);
  const printableNull = exactRunTail(256,ordinary.printable,12);
  const scan=allFullCycleAffineTraversals(bytes);
  assert.equal(scan.longRuns.length,2);
  assert.equal(scan.repeatedSlash.length,2);
  assert.deepEqual(scan.longRuns.map(r=>[r.a,r.c,r.length,r.start]),
    [[77,113,11,73],[133,75,11,173]]);
  assert.deepEqual(scan.repeatedSlash.map(r=>[r.a,r.c,r.start,r.text]),
    [[77,113,76,"6I/6I"],[133,75,176,"I6/I6"]]);
  assert.equal((77*133)%256,1);
  assert.equal((77*331+113)%256,0);
  const duplicateMotifBound=duplicateSlashNullBound(bytes);

  // The alternative plausible 59-symbol codec has no original lower-case
  // 'f' in the printed tokens. The source-token repeated pattern survives.
  const tokens=data.pages.flatMap(p=>p.tokens);
  const base59alphabet=data.alphabet.replace("f","");
  assert.equal(base59alphabet.length,59);
  assert.equal(tokens.length,256);
  const radix59=tokens.map(token=>
    59*base59alphabet.indexOf(token[0])+base59alphabet.indexOf(token[1]));
  assert.equal(Buffer.from(src.selected.positions
    .slice(173,184).map(i=>radix59[i])).toString("latin1"),
    "P7pH5.H5OgS");

  // A contemporary independently archived 2014 onion-2 256-byte value is
  // a genuine alternative source-side key. This tests only direct aligned
  // XOR, an output type Cicada previously used; no secret alignment tuning.
  const hexKey=read("resources/2014-onion2-final-256byte-hex.txt").trim();
  const key=Array.from(Buffer.from(hexKey,"hex"));
  assert.equal(key.length,256);
  const xor = src.readout.map((x,i)=>x^key[i]);
  const xorStats = asciiSummary(xor);

  return {
    source:{htmlTitle:src.a,htmlDivId:src.c,byteSha256:hash,
      selectedPeriod:src.selected.positions.length,
      swappedPeriod:src.swapped.positions.length},
    table:{raw:ordinary,lcgWalk:selected,inversePlacement:inverseStats,
      base64OriginalCellIndices:sourceCells,
      unpaddedBase64DecodedHex:decoded.toString("hex")},
    fixedInventoryNulls:{base64Null,printableNull,duplicateMotifBound},
    allFullCycleAffineTraversals:scan,
    base59SameSourceCells:"P7pH5.H5OgS",
    originalOnion2AlignedXor:{
      printable:xorStats.printable,
      longestPrintable:xorStats.printableRun.length,
      header:printableHeader(xor),
      hasPgpArmoredHeader:Buffer.from(xor).includes(Buffer.from("-----BEGIN PGP"))
    },
    result:"Exact source-selected candidate full-cycle readout exposes a short unexplained 11-character Base64-like run. No authenticated file, instruction, decryptable page plaintext, or key follows."
  };
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports = {run,sourceAndReadout,asciiSummary,exactRunTail,bestRun};
