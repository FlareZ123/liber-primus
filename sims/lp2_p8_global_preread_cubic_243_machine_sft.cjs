"use strict";

/**
 * Source-constrained p7->p8 global PRE-READ cell update test, Director #2256.
 *
 * Historical first-party visible operands:
 * - p7 final red word products (GP29 indices) [11,26,8,15,2],
 *   reduced GF3 [2,2,2,0,2]: primitive degree-5 ternary taps.
 * - p7 five-dot height ranks [3,5,1,4,2], reduced3 [0,2,1,1,2] seed.
 * - p8 first red product 4, second 3, last red M=19: GF29 cubing has
 *   inverse 19 and gives one plausible whole-table mutation.
 * - p8 black exactly243 GP29 symbol values serve as cell contents.
 *
 * Unlike local after-read cell updates, mutate ALL 243 state cells by
 * GP29 cubing before the FIRST p9 receiver rune and at every subsequent
 * 243-rune receiver boundary. The receiver address is formed from the
 * preceding FIVE ORIGINAL CIPHERTEXT GP29 indices modulo3.
 * This conditional original-input experiment is not an authored operation.
 *
 * Run: node sims/lp2_p8_global_preread_cubic_243_machine_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const {pages,translit}=corpus;
/** @param {number} n @param {number} mod */
const residue=(n,mod=29)=>((n%mod)+mod)%mod;
/** @param {number[]} values */
const product=values=>values.reduce((v,n)=>residue(v*n),1);
/** @param {number[]} arr */
function ioc(arr) {
  const hist=Array(29).fill(0);
  for(const v of arr)hist[v]++;
  return hist.reduce((z,n)=>z+n*(n-1),0)/(arr.length*(arr.length-1));
}
/** @param {number[]} arr */
const gp=arr=>arr.map(x=>translit[x]).join("");

const p7Final=pages[7].indices.slice(194);
const fiveRed=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(p7Final,fiveRed.flat());
assert.deepEqual(fiveRed.map(product),[11,26,8,15,2]);
const redP8=pages[8].indices.slice(0,12);
assert.deepEqual(redP8,[14,10,14,19,1,14,19,5,2,13,3,17]);
assert.deepEqual([product(redP8.slice(0,4)),product(redP8.slice(4))],[4,3]);
const taps=fiveRed.map(word=>residue(product(word),3));
assert.deepEqual(taps,[2,2,2,0,2]);
const sourceDotRanks=[3,5,1,4,2];
const seed=sourceDotRanks.map(v=>residue(v,3));
assert.deepEqual(seed,[0,2,1,1,2]);
/** @param {number[]} state */
const advance=state=>state.slice(1).concat(residue(
  state.reduce((s,x,i)=>s+x*taps[i],0),3));
const orbit=[];
let state=seed.slice();
do {
  assert(orbit.length<243);
  orbit.push(state);
  state=advance(state);
} while(state.join("")!==seed.join(""));
assert.equal(orbit.length,242);
const trits=orbit.map(row=>row[0]);
const zeroRuns=[];
for(let i=0;i<242;i++){
  if([0,1,2,3].every(k=>trits[(i+k)%242]===0))zeroRuns.push(i);
}
assert.deepEqual(zeroRuns,[22,143]);

const cells=pages[8].indices.slice(12);
assert.equal(cells.length,243);
const original=pages.slice(9,15).flatMap(page=>page.indices);
assert.equal(original.length,1474);
const p9Length=pages[9].indices.length;
const untilP13=pages.slice(9,13).reduce((sum,p)=>sum+p.indices.length,0);
const p13Holdout=original.slice(untilP13,untilP13+200);
assert.equal(p13Holdout.length,200);
const lastFiveP8=pages[8].indices.slice(-5);
assert.equal(lastFiveP8.length,5);

/** @param {number} run */
function initTable(run) {
  const insertAt=(run+4)%242;
  const tape=trits.slice(0,insertAt).concat(0,trits.slice(insertAt));
  assert.equal(tape.length,243);
  const table=new Map();
  for(let i=0;i<243;i++) {
    const addr=Array.from({length:5},(_,j)=>tape[(i+j)%243]).join("");
    assert(!table.has(addr));
    table.set(addr,cells[i]);
  }
  assert.equal(table.size,243);
  assert(table.has("00000"));
  return table;
}
/** @param {Map<string,number>} table */
function cubeAll(table) {
  for(const [address,value] of table)table.set(address,Number(BigInt(value)**3n%29n));
}
/**
 * @param {number[]} input
 * @param {number} splice
 * @param {-1|1} sign
 * @param {boolean} encode
 * @param {number[]} [sourceCells]
 */
function transform(input,splice,sign,encode,sourceCells=cells) {
  const table=initTable(splice);
  // Deterministic, original-source pre-read table conversion; no unknown key.
  const prior=lastFiveP8.slice();
  let prev=prior;
  const out=[];
  for(let i=0;i<input.length;i++){
    if(i%243===0)cubeAll(table);
    const address=prev.map(x=>residue(x,3)).join("");
    const key=table.get(address);
    assert.notEqual(key,undefined);
    const value=input[i];
    const transformed=residue(value+(encode?sign:-sign)*key);
    const cipher=encode?transformed:value;
    out.push(transformed);
    prev=prev.slice(1).concat(cipher);
  }
  return out;
}
const nativeSource=pages[57].indices;
assert.equal(nativeSource.length,95);
const plant=Array.from({length:original.length},(_,i)=>nativeSource[i%95]);
assert(ioc(plant)>0.05);

const results=[];
for(const splice of zeroRuns)for(const sign of [-1,1]){
  const decoded=transform(original,splice,sign,false);
  assert.deepEqual(transform(decoded,splice,sign,true),original);
  const seeded=transform(plant,splice,sign,true);
  assert.deepEqual(transform(seeded,splice,sign,false),plant);
  assert(ioc(decoded)<0.04);
  results.push({
    sourceZeroRun:splice,sign,
    first300OriginalIoC:ioc(decoded.slice(0,300)),
    disjointP13First200IoC:ioc(decoded.slice(untilP13,untilP13+200)),
    complete1474OriginalIoC:ioc(decoded),
    first80GP:gp(decoded.slice(0,80)),
    p13First60GP:gp(decoded.slice(untilP13,untilP13+60)),
    originalForwardReplay:true,
    plantedNative1474Recovered:true
  });
}
assert.equal(results.length,4);
assert(results.every(x=>x.first300OriginalIoC<0.045));
assert(results.every(x=>x.disjointP13First200IoC<0.045));
console.log(JSON.stringify({
  originalSource:"p7 red five products, p8 red [4,3], p7 five-dot seed, p8 243 black",
  originalP9ThroughP14Length:original.length,
  targetP13Start:untilP13,
  seed,taps,zeroRuns,
  mutation:"Global GP29 cube before first read and every 243 input runes",
  receiver:"GP29 Vigenere +/- key from five preceding source ciphertext residues mod3",
  ciphertextIoC:ioc(original),
  nativePlantIoC:ioc(plant),
  tested:results,
  decision:"all four globally pre-cubed source-table receivers nonprose on intact p9 original and p13 holdout; no author-signed table role/mutation",
},null,2));
