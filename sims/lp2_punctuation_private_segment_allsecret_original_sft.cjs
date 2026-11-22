"use strict";
/**
 * Every-secret-alphabet GP29 punctuation-segment source gate.
 * Every span ending at an authentic printed punctuation mark gets its own
 * entirely arbitrary 29! symbol permutation. No key search is performed.
 *
 * Source: original physical LP2 p0–55, exactly 175 printed punctuation events,
 * 172 unique rune boundaries (including last event), 12,956 GP29 runes.
 * Exclude derivative events #57–60 (numeric-row dots missing in p15 JPEG) and
 * #125 (mark absent on p37 JPEG).
 *
 * Node 22 CommonJS SFT, read-only. No novel LP2 plaintext is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");

const ROOT = path.join(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const marks = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const valid = marks.events.filter(e => !new Set([57,58,59,60,125]).has(e.index));
const plainSource = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
const boundaries = [...new Set([0, plainSource.length,
  ...valid.map(e => e.rune_offset)])].sort((a,b)=>a-b);

/** @param {number[]} values @returns {number[][]} */
function histograms(values) {
  return boundaries.slice(1).map((end, j) => {
    const bins = new Array(29).fill(0);
    for(let k=boundaries[j]; k<end; k++) bins[values[k]]++;
    return bins.sort((a,b)=>b-a);
  });
}

/** Maximum number of any preselected k distinct plaintext runes under
 * completely unrestricted, independently secret per-segment bijections.
 * @param {number[][]} bins
 * @param {number} k
 * @returns {number} */
function capacity(bins,k) {
  return bins.reduce((sum,h)=>sum+h.slice(0,k).reduce((s,x)=>s+x,0),0);
}

/** Minimum number of occurrences of a fixed plaintext rune set in any
 * full-length consecutive native-GP reference window.
 * @param {number[]} seq
 * @param {number[]} fixed
 * @param {number} n
 * @returns {number} */
function minimumWindow(seq,fixed,n) {
  assert.ok(seq.length >= n);
  const selected = new Set(fixed);
  let count=0,best=Infinity;
  for(let i=0;i<seq.length;i++) {
    if(selected.has(seq[i]))count++;
    if(i>=n && selected.has(seq[i-n]))count--;
    if(i>=n-1 && count<best)best=count;
  }
  return best;
}

/** Deterministic generator used only for the positive plant.
 * @returns {()=>number} */
function generator(){
  let x=0x33012026;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** Encrypt and decrypt native GP text under 172 independent random bijections,
 * retaining every authentic punctuation boundary.
 * @param {number[]} originalPlain
 * @returns {{cipher:number[], recovered:number[]}} */
function plant(originalPlain) {
  const cipher=new Array(originalPlain.length);
  const recovered=new Array(originalPlain.length);
  const rand=generator();
  for(let j=0;j<boundaries.length-1;j++){
    const permutation=Array.from({length:29},(_,k)=>k);
    for(let k=28;k>0;k--){
      const i=rand()%(k+1);
      [permutation[i],permutation[k]]=[permutation[k],permutation[i]];
    }
    const inverse=new Array(29);
    for(let k=0;k<29;k++)inverse[permutation[k]]=k;
    for(let i=boundaries[j];i<boundaries[j+1];i++){
      cipher[i]=permutation[originalPlain[i]];
      recovered[i]=inverse[cipher[i]];
    }
  }
  assert.deepEqual(recovered,originalPlain);
  return {cipher,recovered};
}

function main(){
  assert.equal(plainSource.length,12956);
  assert.equal(valid.length,175);
  assert.equal(new Set(valid.map(e=>e.rune_offset)).size,172);
  assert.equal(boundaries.length-1,172);
  const bins=histograms(plainSource), upperE=capacity(bins,1),
    upperEO=capacity(bins,2);
  assert.deepEqual([upperE,upperEO],[1012,1874]);
  const E=corpus.translit.indexOf("E"),O=corpus.translit.indexOf("O");
  assert.ok(E>=0&&O>=0);
  const references = [
    ["Gibran","resources/control/gibran_prophet_58585.txt",1407,2556],
    ["Emerson","resources/control/emerson_essays_2944.txt",1482,2455],
    ["Shakespeare","resources/control/shakespeare_first300k.txt",1397,2430]
  ];
  const native=references.map(([name,file,expectedE,expectedEO])=>{
    const runes=encodeWords(read(file)).flat();
    const minE=minimumWindow(runes,[E],plainSource.length);
    const minEO=minimumWindow(runes,[E,O],plainSource.length);
    assert.deepEqual([minE,minEO],[expectedE,expectedEO]);
    assert.ok(upperE<minE && upperEO<minEO);
    return {name,minE,minEO};
  });
  const sourceNative=encodeWords(read(references[0][1])).flat()
    .slice(0,plainSource.length);
  const positive=plant(sourceNative);
  assert.ok(capacity(histograms(positive.cipher),1)>=
    sourceNative.filter(x=>x===E).length);
  assert.ok(capacity(histograms(positive.cipher),2)>=
    sourceNative.filter(x=>x===E||x===O).length);
  const out={
    source:{runes:plainSource.length,physicalMarks:valid.length,
      distinctRuneOffsets:172,privateKeySegments:bins.length},
    allSecretMaximum:{E:upperE,EplusO:upperEO},
    nativeControlMinimum:native,
    positive:{exactRecovery:positive.recovered.length,
      privateAlphabets:bins.length,
      ciphertextCapE:capacity(histograms(positive.cipher),1),
      ciphertextCapEO:capacity(histograms(positive.cipher),2)},
    decision:"EXCLUDED: fixed per-physical-punctuation-segment GP29 bijections as direct ordinary GP-English decoding"
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)main();
module.exports={main,histograms,capacity,minimumWindow,plant};
