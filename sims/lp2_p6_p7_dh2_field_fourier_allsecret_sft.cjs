"use strict";
/**
 * P6/P7 source-selected 28x11 receiver: finite-field Fourier inversion over
 * GF(29), with every unknown column-wise affine output key optimized exactly.
 *
 * SFT (Windows Node 22): node sims/lp2_p6_p7_dh2_field_fourier_allsecret_sft.cjs
 * No writes, downloads, dependencies or randomness.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const page = n => gp.pages.find(p => p.page === n).indices;
const mod = n => (n % 29 + 29) % 29;
const mod28 = n => (n % 28 + 28) % 28;
const inv = Array.from({length:29}, (_, value) => {
  if (!value) return 0;
  for (let i = 1; i < 29; i++) if (mod(i * value) === 1) return i;
  throw new Error("GF29 inverse missing");
});
const red6 = ink.pages.find(p => p.page === 6).red_spans[0];
const red7 = ink.pages.find(p => p.page === 7).red_spans[0];
assert.deepEqual([red6.start, red6.length, red7.start, red7.length],
  [71,11,194,14]);
const key = page(6).slice(71, 82);
const closing = page(7).slice(194, 208);
const cipher = page(6).slice(82).concat(page(7).slice(0,194));
assert.equal(cipher.length, 308);
assert.deepEqual(key, [24,16,14,17,19,6,27,15,17,14,12]);
assert.deepEqual(closing, [23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
assert.equal(key.reduce((a,b) => a+b), 181);
assert.equal(closing.reduce((a,b) => a+b), 209);
assert.equal(308 / 11, 209-181);
const word5 = closing.slice(11);
assert.equal(mod(word5.reduce((a,b) => a*b, 1)),2);
const power = Array.from({length:28}, (_, i) => mod(2**i));
assert.equal(new Set(power).size,28);
assert.equal(mod(power[27]*2),1);

/**
 * The GF29 length-28 DFT: inverse coefficient 28^-1=28=-1 mod29.
 * @param {number[]} vector a 28-element vector
 * @param {boolean} inverse true gives the inverse DFT
 * @returns {number[]}
 */
function dft28(vector, inverse) {
  assert.equal(vector.length, 28);
  return Array.from({length:28}, (_, k) => {
    let result=0;
    for(let r=0;r<28;r++) {
      result += vector[r] * power[mod28((inverse ? -1:1)*k*r)];
    }
    return mod((inverse ? -1:1)*result);
  });
}
/**
 * Turn one of the two literal 308-rune serializations into 11 independent
 * 28-point columns. Return its DFT output in canonical row-major order.
 * @param {number[]} values
 * @param {"row"|"column"} serialization
 * @param {boolean} inverse
 */
function transform(values, serialization, inverse) {
  assert.equal(values.length,308);
  const columns = Array.from({length:11}, (_,c) =>
    Array.from({length:28}, (_,r) =>
      values[serialization==="row" ? 11*r+c : 28*c+r]));
  const transformed=columns.map(col => dft28(col,inverse));
  return Array.from({length:308}, (_,i) =>
    transformed[i%11][Math.floor(i/11)]);
}
const clear = gp.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
for(const data of [clear, cipher.slice(0,28)]) {
  if(data.length!==28) continue;
  assert.deepEqual(dft28(dft28(data,false),true),data);
}
const gibran=encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const controls=[
  ["Gibran",gibran],
  ["Shakespeare",encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"))],
  ["Emerson",encodeSourceNativeGP(read("resources/control/emerson_essays_2944.txt"))]
].flatMap(([name,source]) =>
  Array.from({length:24},(_,i)=>({
    corpus:name,plaintext:source.slice(3000+i*1319,3308+i*1319)
  })));
assert.equal(gibran.length,62492);
assert.equal(controls.length,72);
assert(controls.every(x=>x.plaintext.length===308));
const count=Array(29).fill(0.5);
for(const value of gibran) count[value]++;
const total=count.reduce((a,b)=>a+b,0);
const logfreq=count.map(x=>Math.log(x/total));
/**
 * Optimize all 812^11 possible output affine keys exactly, independently
 * per column under a source-calibrated native-GP unigram likelihood.
 * @param {number[]} transformed canonical row-major field values
 * @param {14|28} trainRows
 */
function fitAllSecret(transformed,trainRows) {
  const key=[];
  let training=0;
  for(let c=0;c<11;c++) {
    let best=-Infinity, bestA=-1,bestB=-1;
    for(let a=1;a<29;a++)for(let b=0;b<29;b++) {
      let score=0;
      for(let r=0;r<trainRows;r++) {
        score += logfreq[mod(a*transformed[11*r+c]+b)];
      }
      if(score>best) {best=score;bestA=a;bestB=b;}
    }
    key.push([bestA,bestB]);
    training+=best;
  }
  const decoded=transformed.map((value,i) =>
    mod(key[i%11][0]*value + key[i%11][1]));
  const result={key,train:training/(11*trainRows),
    first100:decoded.slice(0,100).map(v=>gp.translit[v]).join("")};
  if(trainRows<28) {
    result.holdout=decoded.slice(11*trainRows).reduce((s,v)=>
      s+logfreq[v],0)/(11*(28-trainRows));
  }
  return result;
}
/**
 * Original red11 provides an independently fixed secret-key control.
 * It is used only in native plaintext synthetic positives, never tuned
 * against the original unknown body.
 * @param {number[]} plaintext
 */
function reverseRedAffine(plaintext) {
  return plaintext.map((value,i) => {
    const b=key[i%11],a=b%28+1;
    return mod(inv[a]*(value-b));
  });
}
/** @param {number[]} canonicalRows */
function toColumnMajor(canonicalRows) {
  return Array.from({length:308}, (_,i) =>
    canonicalRows[(i%28)*11+Math.floor(i/28)]);
}
const readings=[];
for(const serialization of ["row","column"])for(const inverse of [true,false]) {
  const direct=transform(cipher,serialization,inverse);
  const original=fitAllSecret(direct,14);
  const oracle=fitAllSecret(direct,28);
  const sampleHoldout=[],sampleOracle=[];
  for(const entry of controls) {
    const sourceX=reverseRedAffine(entry.plaintext);
    let plantedCipher=transform(sourceX,"row",!inverse);
    if(serialization==="column") plantedCipher=toColumnMajor(plantedCipher);
    const recovered=transform(plantedCipher,serialization,inverse);
    assert.deepEqual(recovered,sourceX,
      "positive source-GP Fourier transform and exact inverse");
    const fitted=fitAllSecret(recovered,14);
    const full=fitAllSecret(recovered,28);
    sampleHoldout.push(fitted.holdout);
    sampleOracle.push(full.train);
  }
  const minHold=Math.min(...sampleHoldout);
  const minOracle=Math.min(...sampleOracle);
  readings.push({
    serialization,operation: inverse?"inverse DFT":"forward DFT",
    originalHoldout:original.holdout,controlMinimumHoldout:minHold,
    originalOracle:oracle.train,controlMinimumOracle:minOracle,
    worseThanAll72Holdout:original.holdout<minHold,
    worseThanAll72Oracle:oracle.train<minOracle,
    originalBestTrainKey:original.key,
    originalFirst100:original.first100
  });
}
assert(readings.every(r=>r.worseThanAll72Holdout && r.worseThanAll72Oracle));
console.log(JSON.stringify({
  status:"negative for fixed p6/p7 28-point GF29 DFT plus arbitrary 11-column secret affine output",
  original:"p6[82..195] + p7[0..193]",runicLength:308,
  sourceRoot:2,field:29,columns:11,rows:28,
  trainingRows:14,heldoutRows:14,controlWindows:72,
  sourceNativePlantForwardInverse:true,results:readings
},null,2));