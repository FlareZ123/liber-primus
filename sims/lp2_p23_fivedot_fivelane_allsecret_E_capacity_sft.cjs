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
/** @param {number[][]} lanes Five exactly 201-rune lanes. @returns {number} */
function fiveLanePairNumerator(lanes) {
  return lanes.reduce((sum,lane)=>{
    const counts=Array(29).fill(0);
    for(const v of lane) counts[v]++;
    return sum+counts.reduce((n,c)=>n+c*(c-1),0);
  },0);
}
const originalPairNumerators={
  stripes:fiveLanePairNumerator(splitLanes(body,"stripes")),
  quintets:fiveLanePairNumerator(splitLanes(body,"quintets"))
};
assert.deepEqual(originalPairNumerators,{stripes:6618,quintets:6892});
/**
 * All native 1005-rune windows: count index-of-coincidence *within* each
 * of five 201-rune stationary substitution lanes. This is keyless and exact:
 * a bijection preserves counts and hence each lane's ordered equal pairs.
 * Each five-lane mean IoC = integer pairNumerator / 201000.
 *
 * The two layouts are checked in O(n) with rolling lane histograms. Both
 * are tested on original ciphertext, known native source registers, and
 * fixed-key bijection plants.
 * @param {number[]} values Native register, at least 1005 rune indices.
 * @returns {{stripes:{min:number,at:number,atOrBelow:number},quintets:{min:number,at:number,atOrBelow:number}}}
 */
function everyWindowPairMinimum(values) {
  const n=values.length,w=body.length,windows=n-w+1;
  assert.ok(windows>0);
  const result={
    stripes:{min:Infinity,at:0,atOrBelow:0},
    quintets:{min:Infinity,at:0,atOrBelow:0}
  };
  const check=(layout,score,start)=>{
    const current=result[layout];
    if(score<current.min){current.min=score;current.at=start;}
    if(score<=originalPairNumerators[layout]) current.atOrBelow++;
  };
  // Five consecutive blocks of 201: rolling every native 201-rune pair sum.
  const counts=new Int32Array(29),shortPairs=new Int32Array(n-200);
  let pairs=0;
  for(let i=0;i<201;i++){
    const value=values[i];pairs+=2*counts[value];counts[value]++;
  }
  shortPairs[0]=pairs;
  for(let start=1;start<shortPairs.length;start++){
    const old=values[start-1],fresh=values[start+200];
    pairs-=2*(counts[old]-1); counts[old]--;
    pairs+=2*counts[fresh];counts[fresh]++;
    shortPairs[start]=pairs;
  }
  for(let start=0;start<windows;start++){
    let sum=0;
    for(let lane=0;lane<5;lane++)sum+=shortPairs[start+lane*201];
    check("stripes",sum,start);
  }
  // Five interleaved residue lanes. Window advancement replaces one rune in
  // exactly one absolute residue lane since 1005 is divisible by five.
  const quinCounts=Array.from({length:5},()=>new Int32Array(29));
  let quinPairs=0;
  for(let i=0;i<w;i++){
    const counts=quinCounts[i%5],v=values[i];
    quinPairs+=2*counts[v];counts[v]++;
  }
  for(let start=0;start<windows;start++){
    check("quintets",quinPairs,start);
    if(start===windows-1)break;
    const counts=quinCounts[start%5],old=values[start],fresh=values[start+w];
    quinPairs-=2*(counts[old]-1);counts[old]--;
    quinPairs+=2*counts[fresh];counts[fresh]++;
  }
  return result;
}


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
const pairStats = {};
for (const [name,file] of sources) {
  const gp = toGP(read(file));
  pairStats[name]=everyWindowPairMinimum(gp);
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
// Independent source-native Anglo-Saxon control uses the corrected, pinned
// Old English original GP29 profile rather than a lossy ASCII re-tokenization.
const beowulf=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
assert.equal(beowulf.positiveControlAlphabet.length,29);
assert.equal(beowulf.sourceGpBase29.length,48012);
const nativeOE=[...beowulf.sourceGpBase29]
  .map((character)=>beowulf.positiveControlAlphabet.indexOf(character));
assert.ok(nativeOE.every((i)=>i>=0&&i<29));
pairStats["Beowulf (corrected Old English)"]=everyWindowPairMinimum(nativeOE);
stats["Beowulf (corrected Old English)"]={
  stripes:nativeWindows(nativeOE,ceilings.stripes),
  quintets:nativeWindows(nativeOE,ceilings.quintets)
};
assert.deepEqual([
  stats["Beowulf (corrected Old English)"].quintets.symbols,
  stats["Beowulf (corrected Old English)"].quintets.minE,
  stats["Beowulf (corrected Old English)"].quintets.lessOrEqual
],[48012,94,0]);

assert.ok(stats["Latin Vulgate"].stripes.lessOrEqual>0,
  "Latin should demonstrate why this is a finite-language comparison");

// Strongest internal reference: authentic SOLVED Cicada GP29 letter stream,
// recovered from LP1's original runes under the historically established keys.
// This avoids relying on generic modern-English orthographic assumptions.
const {parseSegments, runeWords}=require("./solved_cipher_regression.cjs");
const oldSections=parseSegments("\n\n"+read("resources/transcriptions/liber_primus_master.txt"))
  .map((section)=>runeWords(section).flat());
assert.equal(oldSections.length,18);
assert.deepEqual(oldSections.slice(0,5).map((v)=>v.length),
  [184,515,157,778,755]);
/** @param {number} n @returns {number} */
const mod29=(n)=>((n%29)+29)%29;
const warningPlain=oldSections[0].map((v)=>28-v);
assert.deepEqual(warningPlain.map((v)=>28-v),oldSections[0]);
const welcomeLiteralSites=[48,74,84,132,159,160,250,421,443,465,514];
const welcomeSkips=new Set(welcomeLiteralSites);
const divinity=[23,10,1,10,9,10,16,26];
let clock=0;
const welcomePlain=oldSections[1].map((v,i)=>welcomeSkips.has(i)?0:
  mod29(v-divinity[(clock++)%divinity.length]));
assert.equal(clock,504);
assert.deepEqual(welcomePlain.flatMap((v,i)=>v===0?[i]:[]),welcomeLiteralSites);
let reencryptionClock=0;
assert.deepEqual(welcomePlain.map((v)=>v===0?0:mod29(v+
  divinity[(reencryptionClock++)%divinity.length])),oldSections[1]);
const koanPlain=oldSections[3].map((v)=>mod29(28-v+3));
assert.deepEqual(koanPlain.map((v)=>mod29(28-v+3)),oldSections[3]);
const solvedCicada=[
  ...warningPlain,...welcomePlain,...oldSections[2],...koanPlain,...oldSections[4]
];
assert.equal(solvedCicada.length,2389);
assert.deepEqual(
  [warningPlain,welcomePlain,oldSections[2],koanPlain,oldSections[4]]
    .map((section)=>section.slice(0,5).map((v)=>corpus.translit[v]).join("")),
  ["AWARN","WELCO","SOMEW","ACOAN","THELOS"]);
pairStats["Authentic solved Cicada LP1 GP"]=everyWindowPairMinimum(solvedCicada);
stats["Authentic solved Cicada LP1 GP"]={
  stripes:nativeWindows(solvedCicada,ceilings.stripes),
  quintets:nativeWindows(solvedCicada,ceilings.quintets)
};
assert.deepEqual([
  stats["Authentic solved Cicada LP1 GP"].quintets.symbols,
  stats["Authentic solved Cicada LP1 GP"].quintets.windows,
  stats["Authentic solved Cicada LP1 GP"].quintets.minE,
  stats["Authentic solved Cicada LP1 GP"].quintets.lessOrEqual
],[2389,1385,108,0]);

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
  assert.equal(fiveLanePairNumerator(cipherLanes),
    fiveLanePairNumerator(originalLanes),
    "Unknown stationary secret alphabets must preserve within-lane pair counts");
  console.log("POSITIVE PLANT",JSON.stringify({layout,trueE:knownPlantE,
    maxPossibleE:plantCeiling,recoveredRunes:1005}));
}
for(const [name,scan] of Object.entries(pairStats)){
  for(const layout of ["stripes","quintets"]){
    assert.ok(scan[layout].min>originalPairNumerators[layout],
      "Native source matches or undercuts original five-lane coincidence: "+name+":"+layout);
    assert.equal(scan[layout].atOrBelow,0);
  }
}
console.log("ORIGINAL FIVE-LANE PAIR NUMERATORS",JSON.stringify(originalPairNumerators));
console.log("ALL-WINDOW FIVE-LANE PAIR MINIMA",JSON.stringify(pairStats));
console.log("ORIGINAL FIVE-LANE E CEILINGS",JSON.stringify(ceilings));
console.log("FULL 1005-RUNE NATIVE WINDOWS",JSON.stringify(stats));
console.log("DECISION: five independent stationary secret GP29 lane alphabets "
+"cannot encode any of the full-length native English and corrected Old English control windows "
+"with intact E rune counts; Latin is not completely excluded. "
+"No source-selected cipher/key or unknown plaintext recovered.");
