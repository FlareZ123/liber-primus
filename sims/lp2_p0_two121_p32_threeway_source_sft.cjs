"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const SOURCE = fs.readFileSync(
  path.join(ROOT, "resources/control/gibran_prophet_58585.txt"), "utf8");

/**
 * Hypothesis: the first p0 printed line (13 red + 7 black runes) is
 * auxiliary, leaving two 121-rune runs after offset 20. The exact
 * tree-labelled p32 page has 121 runes. An authenticated earlier Cicada
 * stage used multiple XOR shares, while p0's two crosses are half-turned;
 * here we test the simplest GP29 additive three-stream counterpart.
 *
 * The source does NOT command this inverse. It is a finite early
 * discriminator with unmodified original inputs, not a found key.
 * This script does not infer any missing symbols, plaintext, or
 * intermediate alphabet. It writes no files.
 */

/** @param {number} a @returns {number} Canonical GP29 residue. */
function mod29(a) { return ((a % 29) + 29) % 29; }

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const h = new Int16Array(29);
  for (const a of symbols) h[a]++;
  const same = h.reduce((acc, c) => acc + c * (c - 1), 0);
  return same / (symbols.length * (symbols.length - 1));
}

/**
 * Original p0 divisions are source-visible, not optimized by scoring.
 * @returns {{A:number[],B:number[],K:number[]}}
 */
function inputs() {
  const p0 = CORPUS.pages.find((p) => p.page === 0).indices;
  const K = CORPUS.pages.find((p) => p.page === 32).indices;
  assert.equal(p0.length, 262);
  assert.equal(K.length, 121);
  // Original p0 first line: 13 red heading runes and 7 following black.
  const A = p0.slice(20, 141), B = p0.slice(141, 262);
  assert.equal(A.length, 121);
  assert.equal(B.length, 121);
  return {A, B, K};
}

/**
 * All 2^3 signs × 2 reversals of second p0 half × 2 reversals of p32.
 * The first 121-rune p0 half is always in original forward order, as
 * anchor. Half-turn crosses motivate reversing the second and/or key.
 * @param {{A:number[],B:number[],K:number[]}} x
 * @returns {{signs:number[],reverseB:boolean,reverseK:boolean,
 *   ioc:number,first35:string,decoded:number[]}[]}
 */
function decodeFamily(x) {
  const results = [];
  for (const a of [-1, 1]) for (const b of [-1, 1])
    for (const k of [-1, 1]) for (const reverseB of [false, true])
      for (const reverseK of [false, true]) {
        const decoded = Array.from({length: 121}, (_, i) =>
          mod29(a * x.A[i] + b * x.B[reverseB ? 120 - i : i] +
            k * x.K[reverseK ? 120 - i : i]));
        results.push({
          signs: [a,b,k],reverseB,reverseK,ioc:ioc(decoded),
          first35: decoded.slice(0,35).map(z=>CORPUS.translit[z]).join(""),
          decoded
        });
      }
  results.sort((u,v)=>v.ioc-u.ioc);
  return results;
}

/**
 * Native-GP wording control: original orthographic fold and longest GP
 * digraph contraction. Same convention as source-linked corpus work.
 * @param {string} source
 * @returns {number[]}
 */
function gpEncode(source) {
  const s=source.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const dict=Object.fromEntries(CORPUS.translit.map((x,i)=>[x,i]));
  const digs=new Set(["TH","EO","NG","OE","AE","IA","EA"]);
  const xs=[];
  for(let i=0;i<s.length;i++){
    const pair=s.slice(i,i+2);
    if(digs.has(pair)){xs.push(dict[pair]);i++;}
    else if(dict[s[i]]!==undefined)xs.push(dict[s[i]]);
  }
  return xs;
}

/**
 * Historical XOR used bytes, while these independent inputs are 0..28 GP
 * indices in five-bit slots. A literal native-GP three-share XOR must
 * produce only 0..28. This necessary capacity condition has no secret key.
 * @param {{A:number[],B:number[],K:number[]}} x
 * @returns {{reverseB:boolean,reverseK:boolean,illegalGP29:number}[]}
 */
function xorCapacity(x) {
  const rows=[];
  for(const reverseB of [false,true])for(const reverseK of [false,true]){
    const symbols=Array.from({length:121},(_,i)=>
      x.A[i]^x.B[reverseB?120-i:i]^x.K[reverseK?120-i:i]);
    rows.push({reverseB,reverseK,
      illegalGP29:symbols.filter(v=>v>=29).length});
  }
  return rows;
}

/** Print a complete finite original-input gate. */
function main() {
  const x=inputs(), found=decodeFamily(x);
  assert.equal(found.length, 32);
  assert.deepEqual([found[0].signs,found[0].reverseB,
    found[0].reverseK,Number(found[0].ioc.toFixed(12))],
    [[-1,-1,1],true,false,Number((.03925619834710744).toFixed(12))]);

  const xorRows=xorCapacity(x);
  assert.deepEqual(xorRows.map(y=>y.illegalGP29),[5,12,9,11]);

  const prose=gpEncode(SOURCE);
  assert.equal(prose.length, 63114);
  const natives=[];
  for(let start=0;start+121<=prose.length;start+=7){
    natives.push(ioc(prose.slice(start,start+121)));
  }
  assert.equal(natives.length, 9000);
  natives.sort((a,b)=>a-b);
  assert.ok(found[0].ioc < natives[0]);

  // Make a native 121-rune triple-share plaintext plant with arbitrary
  // real p32 and p0 second-half streams. Only the other 121-rune half
  // is synthesized. The true family reading is +A +reverse(B) +K.
  const native=prose.slice(300,421);
  const Aplant=native.map((p,i)=>mod29(p-x.B[120-i]-x.K[i]));
  const plantFamily=decodeFamily({A:Aplant,B:x.B,K:x.K});
  const truePlant=plantFamily.find(y=>
    y.signs.every(v=>v===1) && y.reverseB && !y.reverseK);
  assert.ok(truePlant);
  assert.deepEqual(truePlant.decoded,native);
  assert.ok(truePlant.ioc>found[0].ioc);

  process.stdout.write(JSON.stringify({
    original: {p0OriginalRunes:262,p0AuxiliaryFirstLine:20,
      A:121,B:121,p32K:121,signAndDirectionCases:32},
    winningOriginal: {signs:found[0].signs,
      reverseB:found[0].reverseB,reverseK:found[0].reverseK,
      ioc:found[0].ioc,first35:found[0].first35},
    originalAllCaseIoC:found.map(v=>v.ioc),
    rawFiveBitXorCapacity:xorRows,
    nativeGP: {source:"original Gibran reference",
      runes:prose.length,step:7,window:121,windows:natives.length,
      min:natives[0],median:natives[4500],max:natives.at(-1),
      matchesOrUnderOriginalMax:natives.filter(y=>y<=found[0].ioc).length},
    positive: {trueThreeWayNative121Recovered:
      truePlant.decoded.length,exact:true},
    conclusion:"No original GP29 plaintext recovered",
  },null,2)+"\n");
}

if(require.main===module)main();
module.exports={inputs,decodeFamily,xorCapacity,gpEncode};
