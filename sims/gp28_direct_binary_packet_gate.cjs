"use strict";
/**
 * Key-independent 28-digit to raw-byte fixed-packet capacity obstruction.
 *
 * Conditional original-source architecture:
 * - Delete the 55 physical page-first IV glyphs.
 * - Treat exactly 86 adjacent-equal LP2 ciphertext glyphs as transparent,
 *   non-payload markers.
 * - Convert each nonzero GP29 consecutive step to one of 28 labels.
 * - Permit an arbitrary unknown fixed bijection (all 28! possible orders)
 *   between labels and base28 digit values 0..27.
 * - Interpret 5 digits as an unrestricted 24-bit integer or 10 digits as an
 *   unrestricted 48-bit integer, with global/page/section packet resets and
 *   a fixed phase and direction for each chosen reset convention.
 *
 * The necessary leading-digit/follower support obstruction is exact over
 * every secret alphabet and does not assume the native GP digit order.
 * Output distinguishes this restricted, keyless transport from encrypted or
 * evolving-permutation systems. Node 18+, CommonJS, no dependencies.
 *
 * Run: node sims/gp28_direct_binary_packet_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const raw=JSON.parse(fs.readFileSync(path.join(
  __dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const pages=raw.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);

const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];

/** @param {number[]} values @returns {number[]} */
function nonzeroSteps(values) {
  const out=[];
  for(let i=1;i<values.length;i++) {
    const delta=(values[i]-values[i-1]+29)%29;
    if(delta!==0)out.push(delta-1);
  }
  return out;
}
const origPageSteps=pages.map(p=>nonzeroSteps(p.indices));
const origSteps=origPageSteps.flat();
assert.equal(origSteps.length,12815);
const originalMarkers=pages.reduce((s,p)=>s+p.indices.length-1-nonzeroSteps(p.indices).length,0);
assert.equal(originalMarkers,86);
assert.equal(original.length-origSteps.length,55+86);

const originalModes={
  global:[origSteps],
  sections:sections.map(([first,last])=>pages
    .filter(p=>p.page>=first&&p.page<=last)
    .flatMap(p=>origPageSteps[pages.indexOf(p)])),
  pages:origPageSteps,
};

/**
 * Inspect the 28 possible first-digit labels and the sets of their successors.
 * For 5×base28 -> 3 raw bytes, if the leading digit is 27, its second digit
 * must be 0..8, so its observed next-label set can have cardinality at most 9.
 * For 10×base28 -> 6 raw bytes, digit27 is always forbidden at packet starts,
 * so at least one input label must be absent among all first positions.
 *
 * @param {number[][]} streams Section streams already stripped of page IV/EA.
 * @param {5|10} width
 * @param {number} phase
 * @param {boolean} reverse
 */
function screen(streams,width,phase,reverse) {
  const followers=Array.from({length:28},()=>new Set());
  const starts=new Set();
  let packets=0;
  for(const stream of streams)
    for(let i=phase;i+width<=stream.length;i+=width) {
      const lead=stream[i+(reverse?width-1:0)];
      const second=stream[i+(reverse?width-2:1)];
      assert(lead>=0&&lead<28&&second>=0&&second<28);
      starts.add(lead);
      followers[lead].add(second);
      packets++;
    }
  const possibleTopLabels=width===5
    ? followers.map((set,i)=>set.size<=9?i:null).filter(x=>x!==null)
    : Array.from({length:28},(_,i)=>i).filter(i=>!starts.has(i));
  return {phase,reverse,packets,leadSymbols:starts.size,
    minFollowers:Math.min(...followers.filter(x=>x.size>0).map(x=>x.size)),
    maxFollowers:Math.max(...followers.map(x=>x.size)),
    survivingFirstDigitLabels:possibleTopLabels,
    exactExclusion:possibleTopLabels.length===0};
}

/** Deterministic and independent from the original ciphertext. */
function rand(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
}

/** @param {number} value @param {number} width @returns {number[]} */
function base28(value,width){
  assert(Number.isSafeInteger(value)&&value>=0);
  const digits=Array(width).fill(0);
  let x=value;
  for(let j=width-1;j>=0;j--){digits[j]=x%28;x=Math.floor(x/28)}
  assert.equal(x,0);
  return digits;
}

/**
 * Full original-page-format synthetic plant: authentic page lengths, 55 IVs,
 * all 86 literal marker positions, arbitrary SECRET 28-symbol bijection,
 * unrestricted random 24/48-bit input packets, exact inverse and full
 * 12,956-symbol re-encipherment.
 * @param {5|10} width
 */
function plant(width) {
  const random=rand((0x3301cafe+width)>>>0);
  const order=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--){const j=random()%(i+1);[order[i],order[j]]=[order[j],order[i]]}
  const available=Math.floor(origSteps.length/width);
  const payload=[],bytes=[];
  for(let n=0;n<available;n++){
    const byteCount=width===5?3:6;
    let val=0;
    for(let j=0;j<byteCount;j++){const b=random()&255;bytes.push(b);val=256*val+b}
    payload.push(...base28(val,width).map(d=>order[d]));
  }
  while(payload.length<origSteps.length) payload.push(order[0]);
  const published=[];
  let clock=0;
  for(const page of pages) {
    const chars=[];
    let previous=(7*page.page+5)%29;
    chars.push(previous);
    for(let j=1;j<page.indices.length;j++) {
      if(page.indices[j]!==page.indices[j-1]) {
        previous=(previous+payload[clock++]+1)%29;
      }
      chars.push(previous);
    }
    published.push(chars);
  }
  assert.equal(clock,12815);
  const recovered=published.flatMap(nonzeroSteps);
  assert.deepEqual(recovered,payload);
  assert.equal(published.reduce((s,p)=>s+p.length,0),12956);
  const backward=Array(28);
  for(let i=0;i<28;i++) backward[order[i]]=i;
  const decoded=[];
  for(let i=0;i<available;i++){
    let value=0;
    for(let j=0;j<width;j++)value=28*value+backward[recovered[width*i+j]];
    for(let j=width===5?2:5;j>=0;j--){
      decoded.push(Math.floor(value/256**j)%256);
    }
  }
  assert.deepEqual(decoded,bytes);
  const gate=screen([recovered],width,0,false);
  assert.equal(gate.exactExclusion,false);
  assert(gate.survivingFirstDigitLabels.includes(order[27]));
  return {payloadPackets:available,binaryBytes:bytes.length,
    recoveredBinaryBytes:decoded.length,originalShapeRunes:12956,
    originalMarkerSites:86,secretPermutationAll28:true,
    passedSourceOnlyNecessaryGate:!gate.exactExclusion};
}

function main() {
  const results=[];
  for(const [mode,streams] of Object.entries(originalModes))
    for(const width of [5,10]) {
      const phases=[];
      for(let p=0;p<width;p++)for(const reverse of [false,true])
        phases.push(screen(streams,width,p,reverse));
      results.push({mode,width,bytesPerPacket:width===5?3:6,
        firstDigitUpperBound:width===5?27:26,
        secondDigitUpperBoundWhenFirst27:width===5?8:null,
        variants:phases.length,allExcluded:phases.every(x=>x.exactExclusion),
        minFollowerSupport:Math.min(...phases.map(x=>x.minFollowers)),
        minimumObservedStartAlphabet:Math.min(...phases.map(x=>x.leadSymbols)),
        originalPhase0Forward:phases[0],
        capacitySurvivorCount:phases.filter(x=>!x.exactExclusion).length});
    }
  assert.equal(results.length,6);
  assert(results.every(r=>r.allExcluded));
  return {claim:"Exact original-source necessary-condition exclusions, not a decipherment",
    sourceRunes:original.length,physicalPageIVs:pages.length,
    literalDoublets:originalMarkers,nonzeroStepDigits:origSteps.length,
    originalRadix28PacketCountAtWidth5:origSteps.length/5,
    fixedOrderProof:"For width5 any top label assigned digit27 needs <=9 distinct second labels; for width10 a top label assigned digit27 must be absent at all packet starts.",
    testedCommonPhaseAndDirectionResets:results,
    fullyInvertedSourceNativePositivePlants:[plant(5),plant(10)],
    limitations:"Secret order is fixed for whole book; phase and direction fixed within each reset model; marked doublets and page initials are omitted rather than encoded. This does not exclude variable-length or restricted-codebook binary, per-page independent clock offsets, secret per-packet substitutions, nonlinear running-key masks, or non-GP intermediate encodings."};
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={nonzeroSteps,screen,plant,main};
