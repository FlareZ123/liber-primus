"use strict";
/**
 * p6/p7 28-row, 11-column DH-shared-2 chain cipher complete-secret attack.
 * Tests a genuine ciphertext predecessor-feedback architecture, unlike the
 * previously rejected unchained red11-DH2 affine / additive / product models.
 *
 * The first cipher predecessor is the actual last original p6 red rune.
 * The original 308 black runes are not reordered, masked or phase shifted.
 * Learn each completely unrestricted 11-position key on first 154 original
 * ciphertext runes and score the untouched last 154.
 *
 * Windows Node.js 22: node sims/lp2_p6_p7_dh2_chained_allsecret_native_gp_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const read = p => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
const sourceCorpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const page = n => sourceCorpus.pages.find(p => p.page === n).indices;
const mod = n => ((n % 29) + 29) % 29;
const inv = Array.from({length: 29}, (_, n) => {
  if (!n) return 0;
  for (let i = 1; i < 29; i++) if ((n * i) % 29 === 1) return i;
  throw new Error("GF29 inverse missing");
});
const sum = xs => xs.reduce((a, b) => a + b, 0);
const red6 = ink.pages.find(p => p.page === 6).red_spans[0];
const red7 = ink.pages.find(p => p.page === 7).red_spans[0];
assert.deepEqual([red6.start, red6.length, red7.start, red7.length], [71,11,194,14]);
const seed = [...red6.runes].map(r => sourceCorpus.runes.indexOf(r));
const previous = seed[10];
const p7sum = sum([...red7.runes].map(r => sourceCorpus.runes.indexOf(r)));
assert.deepEqual([seed.length, previous, sum(seed), p7sum], [11, 12, 181, 209]);
const source = page(6).slice(82).concat(page(7).slice(0,194));
assert.equal(source.length, 308);
const states = Array.from({length: 28}, (_, r) => {
  let v=1; for(let i=0;i<r;i++) v=mod(v*2); return v;
});
assert.equal(new Set(states).size,28);
const native = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
assert.ok(native.length > 30000);
const freq = Array(29).fill(0.5);
for (const v of native) freq[v]++;
const total = sum(freq);
const logp = freq.map(v=>Math.log(v/total));
const difference = (c, prior) =>
  c.map((v,i) => mod(v-(i===0?prior:c[i-1])));
const sourceDelta = difference(source,previous);
const deltaZero = sourceDelta.filter(x => x===0).length;
const singleRowCol = (type,d,k,row) => {
  const state=states[row];
  if(type===0) return mod(inv[state]*(d-k));
  if(type===1) return mod(d-state*k);
  return mod(d*inv[mod(state*k)]);
};
const forwardValue = (type,p,k,row) => {
  const state=states[row];
  if(type===0)return mod(state*p+k);
  if(type===1)return mod(p+state*k);
  return mod(state*k*p);
};
const decode=(type,c,key,prior)=>difference(c,prior).map((v,i)=>
  singleRowCol(type,v,key[i%11],Math.floor(i/11)));
const encode=(type,p,key,prior)=>{
  const out=[];let last=prior;
  for(let i=0;i<p.length;i++){
    const d=forwardValue(type,p[i],key[i%11],Math.floor(i/11));
    last=mod(last+d);out.push(last);
  }
  return out;
};
const score=(plain,lo,hi)=>sum(plain.slice(lo*11,hi*11).map(v=>logp[v]))/((hi-lo)*11);
const render=xs=>xs.map(v=>sourceCorpus.translit[v]).join("");
function recover(type,c,prior,trainRows){
  const d=difference(c,prior);
  const key=[];
  for(let col=0;col<11;col++){
    let best=-Infinity,arg=-1;
    for(let k=type===2?1:0;k<29;k++){
      let value=0;
      for(let row=0;row<trainRows;row++)
        value+=logp[singleRowCol(type,d[row*11+col],k,row)];
      if(value>best){best=value;arg=k}
    }
    key.push(arg);
  }
  const plaintext=decode(type,c,key,prior);
  assert.deepEqual(encode(type,plaintext,key,prior),c);
  return {
    key,
    train:score(plaintext,0,trainRows),
    holdout:trainRows===28?null:score(plaintext,trainRows,28),
    oracle:score(plaintext,0,28),
    first100:render(plaintext.slice(0,100)),
    sourcePlaintextF:plaintext.filter(x=>x===0).length
  };
}
const quantile=(x,q)=>x.slice().sort((a,b)=>a-b)[Math.floor((x.length-1)*q)];
const corpusSources=[
  ["Gibran",native],
  ["Shakespeare",encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"))],
  ["Emerson",encodeSourceNativeGP(read("resources/control/emerson_essays_2944.txt"))]
];
const controls=corpusSources.map(([name,runic])=>{
  assert.ok(runic.length > 33000);
  const windows=Array.from({length:24},(_,i)=>
    runic.slice(3000+i*1319,3308+i*1319));
  assert.ok(windows.every(w=>w.length===308));
  return {name,runicLength:runic.length,windows};
});
const results=[];
for(let type=0;type<3;type++){
  const sourceKeyFit=recover(type,source,previous,14);
  const sourceOracle=recover(type,source,previous,28);
  const sourceSeedReadout=decode(type,source,seed,previous);
  assert.deepEqual(encode(type,sourceSeedReadout,seed,previous),source);
  const sourceNative=controls.map(c=>{
    const fit=c.windows.map(plain=>{
      const encoded=encode(type,plain,seed,previous);
      assert.deepEqual(decode(type,encoded,seed,previous),plain);
      return recover(type,encoded,previous,14);
    });
    const full=c.windows.map(plain=>
      recover(type,encode(type,plain,seed,previous),previous,28));
    const hold=fit.map(v=>v.holdout),oracle=full.map(v=>v.oracle);
    return {
      corpus:c.name, GPencodedSourceRunes:c.runicLength, samples:24,
      minimumHeldout:Math.min(...hold), medianHeldout:quantile(hold,0.5),
      minimumOracle:Math.min(...oracle), medianOracle:quantile(oracle,0.5),
      originalBelowAllHeldout:sourceKeyFit.holdout < Math.min(...hold),
      originalBelowAllOracle:sourceOracle.oracle < Math.min(...oracle)
    };
  });
  results.push({
    model:[
      "cipherchain C_i=C_(i-1) + 2^row P_i + K_col",
      "cipherchain C_i=C_(i-1) + P_i + 2^row K_col",
      "cipherchain C_i=C_(i-1) + 2^row K_col P_i"
    ][type],
    keySpace:type===2?"28^11":"29^11", exactGlobalKeyOptimum:true,
    fittedOriginalFirst14Rows:sourceKeyFit,
    originalOptimisticAll28Rows:sourceOracle,
    seedDerivedOriginalFirst100:render(sourceSeedReadout.slice(0,100)),
    positiveControls:sourceNative
  });
}
console.log(JSON.stringify({
  classification:"bounded 2^row fully-secret chained original receiver test",
  sourcePreviousCipher:previous,
  originalRunes:source.length,
  sourceDeltaZeroEvents:deltaZero,
  controls:"Gibran-trained source-native GP + independent Shakespeare/Emerson",
  trainRows:14, heldoutRows:14,
  results
},null,2));
