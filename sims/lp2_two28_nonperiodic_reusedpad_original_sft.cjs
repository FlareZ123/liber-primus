"use strict";

/**
 * Complete original-input necessary-condition gate for the source-motivated
 * physical p,p+28 shared additive GP29 pad. The pad is allowed to be totally
 * arbitrary and nonperiodic, with a fresh secret sequence for every pair.
 *
 * Compare same page-local offsets (natural 28-page fold) and independently
 * clue-motivated +42 offsets (the unique p27 local28..33 = p55 local70..75
 * six-rune echo), excluding those six copied cells from the +42 gate.
 *
 * Windows 11, Node.js 22+, CommonJS; read-only; no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalPages = corpus.pages.filter((page) => page.page >= 0 && page.page <= 55);
assert.equal(originalPages.length, 56);
assert.deepEqual(originalPages.map((page) => page.page),
  Array.from({length:56}, (_, i) => i));
const original = originalPages.map((page) => page.indices);
const lengths = original.map((p) => p.length);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(original[50].length, 0);
assert.equal(original[27].slice(28, 34).join(","),
  original[55].slice(70, 76).join(","));

/**
 * Exact source-visible two-28 page pairing and explicit original alignment.
 * The +42 mode excludes the source-defining p27/p55 copied six-rune witness.
 * @param {number[][]} pages
 * @param {0|42} displacement
 * @returns {{opportunities:number, matches:number, ratio:number, byPair:object[]}}
 */
function coincidences(pages, displacement) {
  let opportunities = 0;
  let matches = 0;
  const byPair = [];
  for (let p = 0; p < 28; p++) {
    const left = pages[p];
    const right = pages[p + 28];
    let tested = 0;
    let equal = 0;
    for (let i = 0; i < left.length; i++) {
      const j = i + displacement;
      if (j >= right.length) continue;
      if (displacement === 42 && p === 27 && i >= 28 && i < 34)
        continue; // the six known motif symbols do not score as evidence
      tested++;
      if (left[i] === right[j]) equal++;
    }
    opportunities += tested;
    matches += equal;
    byPair.push({first:p,second:p+28,opportunities:tested,matches:equal});
  }
  return {opportunities,matches,ratio:matches/opportunities,byPair};
}

/** @param {number[]} sequence @returns {number[][]} */
function pagesFromTape(sequence) {
  let cursor = 0;
  const split = lengths.map((len) => {
    const page = sequence.slice(cursor,cursor+len);
    cursor += len;
    assert.equal(page.length,len);
    return page;
  });
  assert.equal(cursor,sequence.length);
  return split;
}

const translit = new Map(corpus.translit.map((x, i) => [x,i]));
/**
 * Encode English in the same historically established GP29 transliteration
 * used by the existing source-native control SFTs.
 * @param {string} token
 * @returns {number[]}
 */
function encodeWord(token) {
  const normalized = token.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING",i)) {
      out.push(21); i += 3;
    } else if (normalized.startsWith("IO",i)) {
      out.push(27); i += 2;
    } else {
      const digraph = normalized.slice(i,i+2);
      const rune = translit.has(digraph) ? digraph : normalized[i];
      assert.ok(translit.has(rune), "No GP rune for " + rune);
      out.push(translit.get(rune));
      i += rune.length;
    }
  }
  return out;
}
/** @param {string} raw @returns {number[]} */
function encodeEnglish(raw) {
  return (raw.match(/[A-Za-z]+/g) || []).flatMap(encodeWord);
}

/** @returns {() => number} */
function randomSource() {
  let seed = 0x33011728;
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
}
/**
 * Encrypt native GP plaintext under a different secret, entirely arbitrary
 * nonperiodic additive key per physical 28-page pair. The same offset-key is
 * used in both paired source pages. All non-paired cells get random keys.
 * @param {number[][]} plainPages
 * @param {0|42} displacement
 * @returns {number[][]}
 */
function encryptSharedPad(plainPages,displacement) {
  const rand = randomSource();
  const pads = plainPages.map(p=>p.map(() => rand()%29));
  for(let p=0;p<28;p++) {
    for(let i=0;i<plainPages[p].length;i++) {
      const j=i+displacement;
      if(j>=plainPages[p+28].length)continue;
      pads[p+28][j]=pads[p][i];
    }
  }
  return plainPages.map((page,p)=>
    page.map((rune,i)=>(rune+pads[p][i])%29));
}

const sourceCounts = {};
const controls = [];
for (const [name,rel] of [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
]) {
  const encoded = encodeEnglish(read(rel));
  sourceCounts[name]=encoded.length;
  for(let offset=0;offset+12956<=encoded.length;offset+=12956) {
    const pages=pagesFromTape(encoded.slice(offset,offset+12956));
    controls.push({source:name,offset,
      same:coincidences(pages,0), echoOffset42:coincidences(pages,42)});
  }
}
assert.equal(controls.filter(x=>x.source==="Shakespeare").length,16);
assert.equal(controls.filter(x=>x.source==="Gibran").length,4);

const originalSame = coincidences(original,0);
const original42 = coincidences(original,42);
assert.deepEqual([originalSame.opportunities,originalSame.matches],[5663,195]);
assert.deepEqual([original42.opportunities,original42.matches],[4815,151]);
assert.ok(controls.every(x=>x.same.ratio>originalSame.ratio));
assert.ok(controls.every(x=>x.echoOffset42.ratio>original42.ratio));

const plantSource=pagesFromTape(
  encodeEnglish(read("resources/control/shakespeare_first300k.txt")).slice(0,12956));
const planted = [];
for(const displacement of [0,42]) {
  const before=coincidences(plantSource,displacement);
  const encrypted=encryptSharedPad(plantSource,displacement);
  const after=coincidences(encrypted,displacement);
  assert.deepEqual([after.opportunities,after.matches],
    [before.opportunities,before.matches]);
  assert.notDeepEqual(encrypted,plantSource);
  planted.push({displacement,matchedBefore:before.matches,
    matchedAfter:after.matches,positions:after.opportunities});
}


/**
 * A sign-mirrored rival: paired pages may share the same secret random pad,
 * while the second page emits -P+K instead of P+K. Let D=C1-C2 mod29.
 * Then the pad vanishes and D is either P1-P2 or P1+P2; the complete
 * 29-residue histogram is a key-independent plaintext witness.
 *
 * Score both analytically predicted GP-English convolutions relative to an
 * iid uniform difference distribution. Select each pair's sign on its first
 * floor(n/2) original matched sites and evaluate the remaining sites, with
 * no access to their signs during selection.
 */
const pool = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt"
].flatMap((file)=>encodeEnglish(read(file)));
const gpCounts=Array(29).fill(1);
for(const x of pool)gpCounts[x]++;
const gpMass=gpCounts.reduce((a,b)=>a+b,0);
const gpFrequency=gpCounts.map(x=>x/gpMass);
const convolutions=Array.from({length:2},()=>Array(29).fill(0));
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  convolutions[0][(a-b+29)%29]+=gpFrequency[a]*gpFrequency[b];
  convolutions[1][(a+b)%29]+=gpFrequency[a]*gpFrequency[b];
}
const modelLog=convolutions.map(row=>row.map(x=>Math.log(29*x)));

/**
 * @param {number[][]} pages
 * @param {0|42} displacement
 * @returns {{training:number,heldout:number,postSelectedWhole:number,pairCount:number}}
 */
function blindSignedPairScore(pages,displacement) {
  let training=0;
  let heldout=0;
  let postSelectedWhole=0;
  let pairCount=0;
  for(let p=0;p<28;p++) {
    const differences=[];
    const left=pages[p];
    const right=pages[p+28];
    for(let i=0;i<left.length;i++) {
      const j=i+displacement;
      if(j>=right.length) continue;
      if(displacement===42 && p===27 && i>=28 && i<34) continue;
      differences.push((left[i]-right[j]+29)%29);
    }
    if(!differences.length)continue;
    pairCount++;
    const firstHalf=Math.floor(differences.length/2);
    const train=[0,0],test=[0,0],full=[0,0];
    for(let i=0;i<differences.length;i++)
      for(let candidate=0;candidate<2;candidate++) {
        const increment=modelLog[candidate][differences[i]];
        full[candidate]+=increment;
        if(i<firstHalf)train[candidate]+=increment;
        else test[candidate]+=increment;
      }
    const selected=train[0]>=train[1]?0:1;
    training+=train[selected];
    heldout+=test[selected];
    postSelectedWhole+=Math.max(...full);
  }
  return {training,heldout,postSelectedWhole,pairCount};
}

/**
 * A genuine fully encoded positive with a pair-specific nonperiodic shared
 * additive pad, and inverted plaintext on every second target page pair.
 * @param {number[][]} plainPages
 * @param {0|42} displacement
 * @returns {number[][]}
 */
function encryptWithMixedSigns(plainPages,displacement) {
  const rnd=randomSource();
  const pads=plainPages.map(page=>page.map(()=>rnd()%29));
  for(let p=0;p<28;p++)
    for(let i=0;i<plainPages[p].length;i++) {
      const j=i+displacement;
      if(j>=plainPages[p+28].length)continue;
      pads[p+28][j]=pads[p][i];
    }
  return plainPages.map((page,p)=>page.map((rune,i)=>{
    const sign=(p>=28 && (p-28)%2===0)?-1:1;
    return (sign*rune+pads[p][i]+29)%29;
  }));
}

const originalSigned = {
  same:blindSignedPairScore(original,0),
  echoOffset42:blindSignedPairScore(original,42)
};
assert.equal(originalSigned.same.pairCount,27);
assert.equal(originalSigned.echoOffset42.pairCount,27);
assert.ok(Math.abs(originalSigned.same.heldout+32.7927)<0.01);
assert.ok(Math.abs(originalSigned.echoOffset42.heldout+49.164)<0.01);

const signedControls=[];
for(const [source,file] of [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
]) {
  const tape=encodeEnglish(read(file));
  for(let offset=0;offset+12956<=tape.length;offset+=12956) {
    const plain=pagesFromTape(tape.slice(offset,offset+12956));
    const one={source,offset};
    for(const displacement of [0,42]) {
      const label=displacement===0?"same":"echoOffset42";
      const unaltered=encryptSharedPad(plain,displacement);
      const mixed=encryptWithMixedSigns(plain,displacement);
      one[label]={
        originalSignBlind:blindSignedPairScore(unaltered,displacement).heldout,
        mixedSignBlind:blindSignedPairScore(mixed,displacement).heldout
      };
    }
    signedControls.push(one);
  }
}
assert.equal(signedControls.length,20);
for(const label of ["same","echoOffset42"])
  for(const type of ["originalSignBlind","mixedSignBlind"])
    assert.ok(signedControls.every(item=>item[label][type]>0),
      label+" "+type+" native language holdout must beat uniform");
assert.ok(originalSigned.same.heldout<0 && originalSigned.echoOffset42.heldout<0);
const signedControlMinima=Object.fromEntries(["same","echoOffset42"].map(label=>[
  label, Object.fromEntries(["originalSignBlind","mixedSignBlind"].map(type=>[
    type,Math.min(...signedControls.map(item=>item[label][type]))
  ]))
]));


const pairs = controls.map(({source,offset,same,echoOffset42})=>({
  source,offset,same:same.matches,
  echoOffset42:echoOffset42.matches
}));
const summarize=(name)=>({
  n:controls.length,
  minimumMatches:Math.min(...controls.map(x=>x[name].matches)),
  maximumMatches:Math.max(...controls.map(x=>x[name].matches)),
  meanMatches:controls.reduce((s,x)=>s+x[name].matches,0)/controls.length,
  minimumRate:Math.min(...controls.map(x=>x[name].ratio))
});
console.log(JSON.stringify({
  original:{pages:56,runeBearingPages:55,runelessPage50:true,
    length:12956,paired28Same:originalSame,
    paired28Offset42EchoExcluded:original42},
  sourceCounts,
  controls:{total:controls.length,
    same:summarize("same"),echoOffset42:summarize("echoOffset42"),pairs},
  reusedArbitraryNonperiodicGP29PadPlant:planted,
  signedReusedPad:{original:originalSigned,controlHoldoutMinimum:signedControlMinima,sourceWindows:signedControls.length},
  conclusion:"Source-shape original GP29 ciphertext fails both direct same-pad equality invariants and first-half-selected blind second-half 29-residue English likelihoods for either sign in each paired page; all twenty true shared-pad native GP-English controls, including alternating inverted pages, pass. No LP2 plaintext or key."
},null,2));
console.log("PASS: original 28-page pair key-reuse necessity and native plaintext positive plants");
