"use strict";

/**
 * The original p23–26 five-dot, 5x201-body source gate:
 * Any independent but FIXED GP29 substitution alphabet per lane preserves
 * the number of occurrences of a plaintext E in that lane, up to relabeling.
 * No secret alphabet enumeration, ciphertext-fitted language score, or
 * arbitrary phase is needed for the exact five-lane E capacity.
 *
 * This is a scoped conditional exclusion, not an LP2 decipherment.
 * Run from the repo: node sims/lp2_p23_fivedot_fivelane_allsecret_E_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");

/** @param {string} file Relative repo path. @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const imageSha256 = crypto.createHash("sha256")
  .update(fs.readFileSync(path.join(root, "resources/liber-primus/40.jpg")))
  .digest("hex");
assert.equal(imageSha256,
  "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee");

const printed = [23,24,25,26].map((page) => corpus.pages.find((p) => p.page === page));
assert.deepEqual(printed.map((p) => p.indices.length), [213,270,273,265]);
const heading = ink.pages.find((p) => p.page === 23).red_spans[0];
assert.deepEqual([heading.start, heading.length], [0,16]);
const body = [
  ...printed[0].indices.slice(heading.length),
  ...printed.slice(1).flatMap((p) => p.indices)
];
assert.equal(body.length, 1005);

/** @param {number[]} values A 1005-rune text. @param {"stripes"|"quintets"} layout @returns {number[][]} */
function splitLanes(values, layout) {
  assert.equal(values.length, 1005);
  return Array.from({length:5}, (_, lane) =>
    layout === "stripes"
      ? values.slice(lane*201,(lane+1)*201)
      : values.filter((_,i)=>i%5===lane));
}
/** @param {number[][]} lanes Original ciphertext or a plant. @returns {number} */
function allSecretECeiling(lanes) {
  return lanes.reduce((sum, lane) => {
    const count = Array(29).fill(0);
    for (const rune of lane) count[rune]++;
    return sum + Math.max(...count);
  }, 0);
}
const ceilings = {
  stripes: allSecretECeiling(splitLanes(body, "stripes")),
  quintets: allSecretECeiling(splitLanes(body, "quintets"))
};
assert.deepEqual(ceilings, {stripes:58,quintets:64});

const runeByName = new Map(corpus.translit.map((name,i)=>[name,i]));
const multis = ["ING","TH","NG","EO","OE","AE","IO","IA","EA"];
/**
 * Source-consistent GP29 spelling, including authentic single ING and IO.
 * Split text on nonletters before applying greedy multigraphs so a match
 * cannot cross a printed word boundary.
 * @param {string} s Native text. @returns {number[]} GP29 rune indices.
 */
function toGP(s) {
  const out = [];
  for (const word of s.toUpperCase()
    .replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C")
    .replace(/Z/g,"S").split(/[^A-Z]+/)) {
    for (let i=0;i<word.length;) {
      const match = multis.find((pair)=>word.startsWith(pair,i));
      const spelling = match === "ING" ? "NG" : match === "IO" ? "IA" : (match || word[i]);
      const rune = runeByName.get(spelling);
      assert.notEqual(rune, undefined, "Unsupported source-normalized character: "+spelling);
      out.push(rune);
      i += match ? match.length : 1;
    }
  }
  return out;
}

/** @param {number[]} values A native GP source register. @param {number} ceiling The exact original ceiling.
 * @returns {{symbols:number,windows:number,minE:number,minAt:number,lessOrEqual:number,firstE:number}}
 */
function nativeWindows(values, ceiling) {
  const width=body.length;
  assert.ok(values.length>=width);
  let count=values.slice(0,width).filter((v)=>v===runeByName.get("E")).length;
  let minE=count,minAt=0,lessOrEqual=(count<=ceiling?1:0);
  const firstE=count;
  for (let end=width;end<values.length;end++) {
    count += Number(values[end]===runeByName.get("E"));
    count -= Number(values[end-width]===runeByName.get("E"));
    if (count<minE) {minE=count;minAt=end-width+1;}
    if (count<=ceiling) lessOrEqual++;
  }
  return {symbols:values.length,windows:values.length-width+1,
    minE,minAt,lessOrEqual,firstE};
}
const sources = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["Latin Vulgate","resources/control/latin-vulgate-latin26-normalized.txt"]
];
const stats = {};
for (const [name,file] of sources) {
  const gp = toGP(read(file));
  stats[name] = {
    stripes:nativeWindows(gp,ceilings.stripes),
    quintets:nativeWindows(gp,ceilings.quintets)
  };
}
assert.deepEqual(sources.slice(0,3).map(([name]) => [
  stats[name].quintets.symbols,stats[name].quintets.minE,
  stats[name].quintets.lessOrEqual
]),[[217106,74,0],[62492,90,0],[321327,86,0]]);
assert.equal(stats["Latin Vulgate"].quintets.lessOrEqual, 513);
assert.ok(stats["Latin Vulgate"].stripes.lessOrEqual>0,
  "Latin should demonstrate why this is a finite-language comparison");

/** @param {number} seed Positive deterministic seed.
 * @returns {()=>number} 32-bit test-only PRNG. */
function seeded(seed) {
  let x=seed>>>0;
  return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return x>>>0; };
}
/** @param {()=>number} next Random-like seed control. @returns {number[]} Secret alphabet. */
function permutation(next) {
  const a=Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--) {
    const k=next()%(j+1);
    [a[j],a[k]]=[a[k],a[j]];
  }
  return a;
}
const next=seeded(0x33010005);
const key=Array.from({length:5},()=>permutation(next));
const target=toGP(read(sources[0][1])).slice(0,1005);
for(const layout of ["stripes","quintets"]) {
  const originalLanes=splitLanes(target,layout);
  const cipherLanes=originalLanes.map((lane,i)=>lane.map((v)=>key[i][v]));
  const decodedLanes=cipherLanes.map((lane,i)=>{
    const inverse=Array(29);
    for(let j=0;j<29;j++) inverse[key[i][j]]=j;
    return lane.map((v)=>inverse[v]);
  });
  assert.deepEqual(decodedLanes,originalLanes,"Every planted rune must be recovered");
  const plantCeiling=allSecretECeiling(cipherLanes);
  const knownPlantE=target.filter((v)=>v===runeByName.get("E")).length;
  assert.ok(plantCeiling>=knownPlantE,
    "All-secret maximum must admit true planted native E count");
  console.log("POSITIVE PLANT",JSON.stringify({layout,trueE:knownPlantE,
    maxPossibleE:plantCeiling,recoveredRunes:1005}));
}
console.log("ORIGINAL FIVE-LANE E CEILINGS",JSON.stringify(ceilings));
console.log("FULL 1005-RUNE NATIVE WINDOWS",JSON.stringify(stats));
console.log("DECISION: five independent stationary secret GP29 lane alphabets "
+"cannot encode any of the full-length native English control windows "
+"with intact E rune counts; Latin is not completely excluded. "
+"No source-selected cipher/key or unknown plaintext recovered.");
