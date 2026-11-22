"use strict";

/**
 * Full-original, key-independent obstruction for the 5 GP28 digits -> 3-byte
 * fixed-packet codec. The ciphertext has exactly 86 duplicate-rune events;
 * removing these explicit 29th symbols leaves exactly 12,870 ranks = 2,574*5.
 *
 * A standard radix-28 five-digit packet covers 28^5 values, whereas three
 * bytes can contain only 2^24. Allow an unrestricted, independently secret
 * permutation of digits 0..27 at EACH of the five packet positions.
 * A packet beginning with digit27 then digit9+ necessarily overflows.
 * Every possible first raw rank has at least 24 distinct second-rank followers
 * at each of five offsets, so all five secret permutations still force 15+
 * distinct overflowing packets. This holds for all 28!^5 secret key choices.
 *
 * Strict packet codec only; variable-rate coding and hidden evolving state
 * can evade the result. Run from repository root with Node.js >=22:
 *   node sims/lp2_base28_five_to_three_allsecret_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const ROOT=path.resolve(__dirname,"..");
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const RADIX=28,PACKET_DIGITS=5,CAP=2**24;
const MAX_FIRST=27;
const HIGH_SECOND=9;
assert.equal(RADIX**PACKET_DIGITS,17210368);
assert.equal(CAP,16777216);
assert(27*RADIX**4+8*RADIX**3<CAP);
assert(27*RADIX**4+9*RADIX**3>=CAP);

/** @param {number} n @returns {number} */
const mod29=n=>(n%29+29)%29;
const log15=Array(29).fill(-1);
for(let i=0,v=1;i<28;i++,v=v*15%29) {
  assert.equal(log15[v],-1);
  log15[v]=i;
}
assert.deepEqual([...log15].filter(i=>i>=0).length,28);

/**
 * Lossless predecessor-excluding 28-rank stream with explicit equality
 * markers (code28) and two other equally source-recognizable difference
 * conventions. The three streams have exactly the SAME surviving positions.
 * @param {number[]} cipher
 * @returns {{rank:number[],deltaMinusOne:number[],log15:number[],masks:boolean[]}}
 */
function extract(cipher) {
  const streams={rank:[],deltaMinusOne:[],log15:[],masks:[]};
  let prev=0;
  for(const c of cipher) {
    const d=mod29(c-prev);
    streams.masks.push(d===0);
    if(d!==0) {
      streams.rank.push(c>prev?c-1:c);
      streams.deltaMinusOne.push(d-1);
      streams.log15.push(log15[d]);
    }
    prev=c;
  }
  assert.equal(streams.masks.filter(Boolean).length,86);
  for(const name of ["rank","deltaMinusOne","log15"]) {
    assert.equal(streams[name].length,12870);
    assert(streams[name].every(x=>x>=0&&x<28));
  }
  return streams;
}

/**
 * For a 5-digit packet with an unknown independent secret bijection on each
 * position: some first raw value MUST map to 27. Every distinct raw second
 * value following it must have its own mapped digit. At most nine different
 * seconds can map to 0..8, so followers beyond nine FORCE an overflow.
 * @param {number[]} stream
 * @param {number} offset Initial raw ranks ignored for phase alignment
 * @returns {{offset:number,packets:number,distinctFollowers:number[],
 *   minimumFollowers:number,atLeastForcedOverflowPackets:number,
 *   directInvalidPackets:number}}
 */
function measure(stream,offset) {
  const followers=Array.from({length:28},()=>new Set());
  let invalid=0,packets=0;
  for(let at=offset;at+5<=stream.length;at+=5) {
    followers[stream[at]].add(stream[at+1]);
    let n=0;
    for(let j=0;j<5;j++)n=28*n+stream[at+j];
    if(n>=CAP)invalid++;
    packets++;
  }
  const distinctFollowers=followers.map(set=>set.size);
  assert(distinctFollowers.every(n=>n>0));
  const minimumFollowers=Math.min(...distinctFollowers);
  // If first rank a maps to 27, its second-rank followers must all map
  // into the at-most-nine legal second digits. There are too many.
  const atLeastForcedOverflowPackets=Math.min(
    ...distinctFollowers.map(n=>Math.max(0,n-HIGH_SECOND)));
  assert(atLeastForcedOverflowPackets>=15);
  return {
    offset,packets,distinctFollowers,minimumFollowers,
    atLeastForcedOverflowPackets,directInvalidPackets:invalid
  };
}

const extracted=extract(original);

// Grant an adversary a much stronger local escape hypothesis: any packet
// near any of the 86 repeated-rune markers may be discarded as unknown.
// Does an untouched source region STILL disallow arbitrary secret keys?
const livePositions=extracted.masks.flatMap((isRepeat,i)=>isRepeat?[]:[i]);
assert.equal(livePositions.length,12870);
const cumulativeMarkers=new Uint16Array(original.length+1);
for(let i=0;i<original.length;i++)
  cumulativeMarkers[i+1]=cumulativeMarkers[i]+Number(extracted.masks[i]);
/**
 * Ignore any five-rank packet containing an original repeated rune within
 * pad raw-cipher symbols of any of its five underlying live rune positions.
 * An arbitrary marker-local payload may replace those discarded packets.
 * @param {number[]} stream
 * @param {number} offset
 * @param {number} pad
 * @returns {{offset:number,pad:number,unaffectedPackets:number,
 *   ignoredPackets:number,minimumDistinctFollowers:number,
 *   unavoidableInvalidPackets:number}}
 */
function measureFarFromMarkers(stream,offset,pad) {
  const followers=Array.from({length:28},()=>new Set());
  let unaffectedPackets=0,ignoredPackets=0;
  for(let at=offset;at+5<=stream.length;at+=5) {
    const first=livePositions[at],last=livePositions[at+4];
    const left=Math.max(0,first-pad);
    const right=Math.min(original.length-1,last+pad);
    if(cumulativeMarkers[right+1]>cumulativeMarkers[left]) {
      ignoredPackets++;
      continue;
    }
    followers[stream[at]].add(stream[at+1]);
    unaffectedPackets++;
  }
  const minimumDistinctFollowers=Math.min(...followers.map(set=>set.size));
  assert(minimumDistinctFollowers>=16);
  return {offset,pad,unaffectedPackets,ignoredPackets,
    minimumDistinctFollowers,
    unavoidableInvalidPackets:minimumDistinctFollowers-9};
}
const markerLocalRobustness={};
for(const [name,source] of Object.entries({
  rank:extracted.rank,deltaMinusOne:extracted.deltaMinusOne,
  log15:extracted.log15
})) {
  markerLocalRobustness[name]=[0,1,5,10,20,40].map(pad=>{
    const versions=Array.from({length:5},(_,off)=>
      measureFarFromMarkers(source,off,pad));
    return {pad,minimumUnaffectedPackets:Math.min(
      ...versions.map(v=>v.unaffectedPackets)),
      maximumIgnoredPackets:Math.max(...versions.map(v=>v.ignoredPackets)),
      leastDistinctFollowers:Math.min(
        ...versions.map(v=>v.minimumDistinctFollowers)),
      leastForcedInvalidPackets:Math.min(
        ...versions.map(v=>v.unavoidableInvalidPackets))};
  });
}
assert.equal(markerLocalRobustness.rank.at(-1).leastDistinctFollowers,16);
assert.equal(markerLocalRobustness.deltaMinusOne.at(-1).leastDistinctFollowers,20);
assert.equal(markerLocalRobustness.log15.at(-1).leastDistinctFollowers,20);

const analysis={};
for(const name of ["rank","deltaMinusOne","log15"]) {
  analysis[name]=Array.from({length:5},(_,offset)=>
    measure(extracted[name],offset));
}
assert.deepEqual(
  ["rank","deltaMinusOne","log15"].map(name=>
    analysis[name][0].directInvalidPackets),[71,54,68]);
assert.equal(analysis.rank[0].packets,2574);

/**
 * Ciphertext from arbitrary successor-exclusion ranks.
 * Rank28 encodes a repeated previous rune, all other values choose a
 * distinct alphabet rune, so this remains invertible.
 * @param {number[]} codes
 * @returns {number[]}
 */
function ranksToCipher(codes) {
  const cipher=[];
  let previous=0;
  for(const r of codes) {
    assert(Number.isInteger(r)&&r>=0&&r<=28);
    const c=r===28?previous:r<previous?r:r+1;
    cipher.push(c);
    previous=c;
  }
  return cipher;
}

/** @param {number} value @returns {number[]} */
function toBase28(value) {
  assert(Number.isInteger(value)&&value>=0&&value<CAP);
  const digits=Array(5).fill(0);
  for(let i=4;i>=0;i--) {
    digits[i]=value%28;
    value=Math.floor(value/28);
  }
  assert.equal(value,0);
  return digits;
}

/** @param {number[]} d @returns {number} */
function fromBase28(d) {
  assert.equal(d.length,5);
  const value=d.reduce((n,x)=>n*28+x,0);
  assert(value>=0&&value<CAP);
  return value;
}

/** @returns {number} */
let seed=0x2833301;
function next32(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const boxes=Array.from({length:5},()=>{
  const p=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--) {
    const j=next32()%(i+1);
    [p[i],p[j]]=[p[j],p[i]];
  }
  assert.equal(new Set(p).size,28);
  return p;
});
const back=boxes.map(p=>{
  const inverse=new Uint8Array(28);
  for(let i=0;i<28;i++)inverse[p[i]]=i;
  return inverse;
});

// Positive encryption plant: real unmodified Shakespeare bytes, known only
// to the control; five secret bijections and the original 86 event positions.
const plainBytes=Buffer.from(read("resources/control/shakespeare_first300k.txt"),
  "utf8").subarray(0,2574*3);
assert.equal(plainBytes.length,7722);
const shuffledDigits=[];
for(let i=0;i<plainBytes.length;i+=3) {
  const v=plainBytes[i]*65536+plainBytes[i+1]*256+plainBytes[i+2];
  const raw=toBase28(v);
  for(let j=0;j<5;j++)shuffledDigits.push(boxes[j][raw[j]]);
}
assert.equal(shuffledDigits.length,12870);
let at=0;
const plantedCodes=extracted.masks.map(isRepeat=>
  isRepeat?28:shuffledDigits[at++]);
assert.equal(at,shuffledDigits.length);
const plantedCipher=ranksToCipher(plantedCodes);
assert.equal(plantedCipher.length,12956);
const plantedExtracted=extract(plantedCipher);
assert.deepEqual(plantedExtracted.masks,extracted.masks);
assert.deepEqual(plantedExtracted.rank,shuffledDigits);
let decoded=Buffer.alloc(plainBytes.length);
for(let i=0,k=0;i<shuffledDigits.length;i+=5,k+=3) {
  const d=Array.from({length:5},(_,j)=>back[j][shuffledDigits[i+j]]);
  const v=fromBase28(d);
  decoded[k]=Math.floor(v/65536);
  decoded[k+1]=Math.floor(v/256)%256;
  decoded[k+2]=v%256;
}
assert.deepEqual(decoded,plainBytes);
assert.deepEqual(ranksToCipher(plantedCodes),plantedCipher);
assert.deepEqual(extract(plantedCipher).masks,extracted.masks);

console.log(JSON.stringify({
  classification:"all-secret original-input obstruction, no recovered LP2 plaintext",
  originalCipherRunes:original.length,repeatEscapeEvents:86,
  packedRanks:12870,packets:2574,possibleBytes:7722,
  comparedSecretFamilies:"Any five arbitrary independent 28-symbol digit bijections",
  secretIndependence:"For any first alphabet symbol assigned digit27, its 24+ distinct second-symbol followers cannot fit in the nine allowed digits0..8",
  threshold:{radix28Range:28**5,threeByteRange:CAP,
    second8CompatibleAtFirst27:27*28**4+8*28**3<CAP,
    second9ForbiddenAtFirst27:27*28**4+9*28**3>=CAP},
  sourceRepresentations:analysis,
  markerLocalRobustness,
  positiveControl:{
    originalEscapeMaskReused:true,plaintext:"Shakespeare UTF-8 source bytes",
    sourceBytes:plainBytes.length,cipherRunes:plantedCipher.length,
    recoveredBytes:decoded.length,exactCipherAndByteRoundtrip:true
  },
  inference:"Direct fixed-width 5 base28 digits to three bytes is impossible on the original ciphertext under ANY fixed packet-position digit permutations and all five packet alignments. Variable-rate, feedback-dependent, and changing-state maps are outside this gate."
},null,2));
