"use strict";

/**
 * Original-source GF(29) dual-polynomial error-correction test.
 *
 * Input A is the exact 2014 archived 256-byte sexagesimal table, whose
 * independently surviving 49/50/51 source sheets expose seven visually
 * confusable I/i, L/l readings and three explicit 50.txt corrections.
 * Input B is the original LP2 printed table, reserved for the final
 * exact byte-for-byte comparison. Candidate values below are derived
 * from the 2014 case alternatives and explicit 50.txt correction notes,
 * not from fitting the LP2 output.
 *
 * Source-defined candidate constraints:
 * H(X) = 3 + 26X + 24X^2, from signed 2013 BASE29 3301 -> 3QO;
 * G(X) = 27 + 5X + 15X^2, from original p39 marked GP triad.
 * The archival table is read high-degree coefficient first over GF(29).
 *
 * Run: node sims/lp2_grid_dual_factor_error_corrector_sft.cjs
 * Read-only, Node.js 22 CommonJS, no dependencies or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {any} */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const historical = json("resources/cicada2014-sexagesimal-source.json").decimal_values;
const original = json("resources/liber-primus/lp2-grid-256.json").bytes;
assert.equal(historical.length, 256);
assert.equal(original.length, 256);
assert.equal(createHash("sha256").update(Buffer.from(original)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @typedef {{index:number,old:number,corrected:number,reason:string}} Correction */
/** Candidate readings fixed by archived 2014 letter shapes or correction notes.
 * 165's delta -29 is algebraically invisible in GF(29). */
const corrections = /** @type {Correction[]} */ ([
  {index:25, old:224, corrected:198, reason:"3i/3I"},
  {index:45, old:81, corrected:107, reason:"1L/1l"},
  {index:50, old:21, corrected:47, reason:"0L/0l"},
  {index:165, old:47, corrected:18, reason:"50.txt explicit annotation"},
  {index:170, old:194, corrected:254, reason:"50.txt explicit annotation"},
  {index:172, old:174, corrected:148, reason:"50.txt explicit annotation"},
  {index:175, old:44, corrected:18, reason:"0i/0I"},
  {index:182, old:141, corrected:167, reason:"2L/2l"},
  {index:199, old:21, corrected:47, reason:"0L/0l"},
  {index:246, old:224, corrected:198, reason:"3i/3I"}
]);
for (const correction of corrections)
  assert.equal(historical[correction.index], correction.old);

/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {number} n @returns {number} */
function inverse(n) {
  for (let k=1; k<29; k++) if (mod(n*k) === 1) return k;
  throw new Error("zero leading polynomial coefficient");
}
/**
 * Fixed-width descending polynomial division over GF(29).
 * @param {number[]} input
 * @param {number[]} factor Three descending coefficients.
 * @returns {number[]} Two-element remainder.
 */
function remainder(input, factor) {
  const a = input.map(mod);
  const unit = inverse(factor[0]);
  for (let i=0; i<=a.length-factor.length; i++) {
    const q = mod(a[i]*unit);
    for (let j=0; j<factor.length; j++)
      a[i+j] = mod(a[i+j]-q*factor[j]);
  }
  return a.slice(a.length-factor.length+1);
}
/** @param {number[]} a @returns {boolean} */
const zero = a => a.every(x => x === 0);

/** 2013 signed historical BASE29 digits as ascending coefficients. */
const H = [24,26,3];
/** Original p39 marked GP prime-field triad, same orientation. */
const G = [15,5,27];
assert.deepEqual(remainder(original,H), [0,0]);
assert.deepEqual(remainder(original,G), [0,0]);
assert.deepEqual(remainder(historical,H), [14,13]);
assert.deepEqual(remainder(historical,G), [26,8]);

/**
 * Enumerate a fixed list of source-visible alternative readings without
 * changing any other bytes. Output masks refer to the supplied order.
 * @param {Correction[]} candidates
 * @param {number[]} base
 */
function enumerate(candidates, base) {
  const masks = {H:[],G:[],both:[],reverseH:[],reverseG:[]};
  for (let mask=0; mask < 2**candidates.length; mask++) {
    const stream=base.slice();
    for (let i=0;i<candidates.length;i++)
      if ((mask >> i) & 1)
        stream[candidates[i].index]=candidates[i].corrected;
    const h=zero(remainder(stream,H));
    const g=zero(remainder(stream,G));
    if (h) masks.H.push(mask);
    if (g) masks.G.push(mask);
    if (h && g) masks.both.push(mask);
    if (zero(remainder(stream,H.slice().reverse())))
      masks.reverseH.push(mask);
    if (zero(remainder(stream,G.slice().reverse())))
      masks.reverseG.push(mask);
  }
  return masks;
}

const nine=corrections.filter(x=>x.index!==165);
const nineResult=enumerate(nine,historical);
assert.deepEqual(nineResult.H,[511]);
assert.deepEqual(nineResult.G,[67,511]);
assert.deepEqual(nineResult.both,[511]);
assert.deepEqual(nineResult.reverseH,[]);

const tenResult=enumerate(corrections,historical);
assert.deepEqual(tenResult.H,[1015,1023]);
assert.deepEqual(tenResult.G,[131,139,1015,1023]);
assert.deepEqual(tenResult.both,[1015,1023]);

const restored=historical.slice();
for(const c of nine)restored[c.index]=c.corrected;
assert.equal(restored[165],historical[165]);
assert.notDeepEqual(restored,original);
restored[165]=18; // Independent original 2014 numeric correction note.
assert.deepEqual(restored,original);

const annotated=historical.slice();
for(const c of corrections.filter(x=>x.reason==="50.txt explicit annotation"))
  annotated[c.index]=c.corrected;
const seven=corrections.filter(x=>x.reason!=="50.txt explicit annotation");
const sevenResult=enumerate(seven,annotated);
assert.deepEqual(sevenResult.H,[127]);
assert.deepEqual(sevenResult.G,[127]);
assert.deepEqual(sevenResult.both,[127]);


const sourceOnions=json("resources/cicada-hiddenservice-256-candidates.json").sourceServices;
assert.equal(sourceOnions.length,3);
const historicalOnionControls=sourceOnions.map(entry=>{
  assert.equal(entry.hex.length,512);
  const bytes=Array.from(Buffer.from(entry.hex,"hex"));
  const h=remainder(bytes,H),g=remainder(bytes,G);
  assert(!zero(h)&&!zero(g));
  return {id:entry.id,H:h,G:g};
});
assert.deepEqual(historicalOnionControls,[
  {id:"onion2",H:[1,11],G:[14,7]},
  {id:"onion3",H:[22,1],G:[4,15]},
  {id:"onion4",H:[26,17],G:[3,18]}
]);


/**
 * Error-correction strength of the *entire* H*G checksum. This is a
 * rate-252/256 degree-four linear GF29 polynomial code, not Reed-Solomon:
 * it has minimum Hamming distance THREE, correcting one arbitrary nonzero
 * residue error at an unknown position, but not two arbitrary errors.
 * This bounds the nine *known alternative readings* result above.
 */
const F = [12,17,11,21,23]; // Descending product of H and G, degree four.
assert.deepEqual(remainder(original,F),[0,0,0,0]);
const allSingleResidueSyndromes=new Map();
for(let position=0;position<256;position++) {
  const unit=Array(256).fill(0);
  unit[position]=1;
  const basis=remainder(unit,F);
  assert(!zero(basis),"each polynomial position must have nonzero syndrome");
  for(let delta=1;delta<29;delta++) {
    const syndrome=basis.map(x=>mod(delta*x)).join(",");
    assert(!allSingleResidueSyndromes.has(syndrome),
      "single-symbol correction must have unique position and residue");
    allSingleResidueSyndromes.set(syndrome,{position,delta});
  }
}
assert.equal(allSingleResidueSyndromes.size,256*28);
const oneWrong=original.slice(),syntheticIndex=123;
const syntheticDelta=original[syntheticIndex]===255?28:1;
oneWrong[syntheticIndex]=original[syntheticIndex]+(syntheticDelta===28?-1:1);
const recoveredSingle=allSingleResidueSyndromes.get(remainder(oneWrong,F).join(","));
assert.deepEqual(recoveredSingle,{position:syntheticIndex,delta:syntheticDelta});
oneWrong[recoveredSingle.position]=
  mod(oneWrong[recoveredSingle.position]-recoveredSingle.delta)+
  29*Math.floor(original[syntheticIndex]/29);
// Residue recovery is exact; full-byte recovery still needs upper-quotient data.
assert.equal(mod(oneWrong[syntheticIndex]),mod(original[syntheticIndex]));

// This source-factor-defined 26-term polynomial has exactly THREE nonzeros:
// T(X)=1+25X^20+22X^25. H*G divides it exactly; code distance <=3.
const sparseTriple=Array(26).fill(0);
sparseTriple[0]=22;sparseTriple[5]=25;sparseTriple[25]=1;
assert.deepEqual(remainder(sparseTriple,F),[0,0,0,0]);
const added=Array(256).fill(0);
added[230]=22;added[235]=25;added[255]=1;
assert.deepEqual(remainder(added,F),[0,0,0,0]);
const secondValid=original.map((x,i)=>mod(x+added[i]));
const originalResidues=original.map(mod);
const distance=(a,b)=>a.filter((x,i)=>x!==b[i]).length;
assert.equal(distance(secondValid,originalResidues),3);
const twoErrors=originalResidues.slice();
twoErrors[235]=mod(twoErrors[235]+25);
twoErrors[255]=mod(twoErrors[255]+1);
assert.equal(distance(twoErrors,originalResidues),2);
assert.equal(distance(twoErrors,secondValid),1);

console.log(JSON.stringify({
  originalByteCount:original.length,
  historicalOnionControls,
  sourceParityCode:{dimension:252,length:256,minimumDistance:3,
    singleResidueSyndromes:allSingleResidueSyndromes.size,
    correctedSyntheticResidueAt:recoveredSingle.position,
    weightThreeWitness:"1+25X^20+22X^25",
    arbitraryTwoResidueErrorCorrection:false},
  historicalDiscrepancyIndices:corrections.map(x=>x.index),
  factorRemainsSourceSelected:"2013 signed BASE29 -> H; p39 red GP triad -> G",
  uncorrectedHistoricalRemainders:{H:remainder(historical,H),G:remainder(historical,G)},
  nineAmbiguitiesWithoutIndex165:{
    choices:512,HPass:nineResult.H.length,GPass:nineResult.G.length,
    bothPass:nineResult.both.length,winningMask:nineResult.both[0],
    reversedHMatches:nineResult.reverseH.length
  },
  allTenAmbiguities:{
    choices:1024,HPass:tenResult.H.length,GPass:tenResult.G.length,
    bothPass:tenResult.both.length,winningMasks:tenResult.both,
    undecidableIndex165:"47 and 18 differ by exactly 29"
  },
  sevenCaseAmbiguitiesAfterThreeHistoricalCorrections:{
    choices:128,HPass:sevenResult.H.length,GPass:sevenResult.G.length,
    bothPass:sevenResult.both.length,winningMask:sevenResult.both[0]
  },
  originalBytesRestoredExactly:restored.length,
  plaintextOrKeyRecovered:false
},null,2));
