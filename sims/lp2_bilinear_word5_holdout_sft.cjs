"use strict";
/**
 * Original LP2 bilinear five-back ciphertext-feedback inversion.
 * SFT: node sims/lp2_bilinear_word5_holdout_sft.cjs
 *
 * Lossless family over GF(29), zero word-local fiveback for positions 0..4:
 * P_i = C_i - a*C_(i-1) - b*C_(i-5) - g*C_(i-1)*C_(i-5) (mod 29).
 * The previous-ciphertext state stays global over printed word boundaries;
 * C_(i-5) exists only within the same complete printed word.
 *
 * Exhaust a,b,g in 0..28 using solely ORIGINAL deep-word positions on p0..39.
 * Freeze the 15 best training keys, then score p40..55 (p50 runeless).
 * Native GP orthography plants cover all 12,956 original-shaped positions.
 * Exact re-encryption is necessary but wrong-key roundtrip is not evidence.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root,name), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const symbols = new Map(data.runes.map((r,i) => [r,i]));
const runeRx = new RegExp("[" + data.runes.join("") + "]+", "gu");
const raw = read("resources/liber-primus/lp2-transcription.txt");
const words = (raw.split("%").slice(0,55).join("%")
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"").match(runeRx) || [])
  .map(s => Array.from(s,r => symbols.get(r)));
const original = words.flat();
const exactOriginal = data.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(original.length,12956);
assert.deepEqual(original,exactOriginal);
const trainEnd = data.pages.filter(p=>p.page<40)
  .reduce((sum,p)=>sum+p.indices.length,0);
assert.equal(trainEnd,9640);
const M = 29;
const mod = x => ((x % M)+M)%M;
const lengths = words.map(w=>w.length);
const positions = [[],[]];
let absolute = 0;
for (const word of words) {
  for (let j=0;j<word.length;j++,absolute++) {
    if(j>=5) positions[Number(absolute>=trainEnd)].push(absolute);
  }
}
assert.deepEqual(positions.map(x=>x.length),[1563,542]);

/** @param {number[]} tape */
function states(tape) {
  assert.equal(tape.length,original.length);
  const prev = new Uint8Array(tape.length);
  const five = new Uint8Array(tape.length);
  const product = new Uint8Array(tape.length);
  let i=0;
  for (const width of lengths) {
    for(let j=0;j<width;j++,i++){
      prev[i]=i?tape[i-1]:0;
      five[i]=j>=5?tape[i-5]:0;
      product[i]=(prev[i]*five[i])%M;
    }
  }
  assert.equal(i,tape.length);
  return {prev,five,product};
}
/**
 * @param {number[]} cipher
 * @param {{prev:Uint8Array,five:Uint8Array,product:Uint8Array}} state
 * @param {number} a
 * @param {number} b
 * @param {number} g
 */
function decode(cipher,state,a,b,g) {
  return cipher.map((x,i)=>mod(x-a*state.prev[i]-b*state.five[i]-g*state.product[i]));
}
/** @param {number[]} plain */
function encode(plain,a,b,g) {
  const out=[];
  let i=0;
  for(const width of lengths) for(let j=0;j<width;j++,i++){
    const prev=i?out[i-1]:0;
    const five=j>=5?out[i-5]:0;
    out.push(mod(plain[i]+a*prev+b*five+g*prev*five));
  }
  assert.equal(out.length,original.length);
  return out;
}
/** @param {number[]} tape @param {number[]} positions */
function normalizedIoc(tape,sites) {
  const hist = new Uint16Array(M);
  for(const i of sites)hist[tape[i]]++;
  const collisions=hist.reduce((v,n)=>v+n*(n-1),0);
  return M*collisions/(sites.length*(sites.length-1));
}
/**
 * Exhaust 29^3 = 24,389 keys only on the declared training sites.
 * Key ordering in ties is deterministic; no holdout data enter selection.
 * @param {number[]} cipher
 * @param {ReturnType<typeof states>} state
 */
function search(cipher,state) {
  const idx=positions[0];
  const leaders=[];
  for(let a=0;a<M;a++)for(let b=0;b<M;b++)for(let g=0;g<M;g++){
    const h=new Uint16Array(M);
    for(const i of idx)h[mod(cipher[i]-a*state.prev[i]-b*state.five[i]-g*state.product[i])]++;
    let pair=0;
    for(const n of h)pair+=n*(n-1);
    const train=M*pair/(idx.length*(idx.length-1));
    if(leaders.length<15 || train>leaders[leaders.length-1].train){
      leaders.push({a,b,g,train});
      leaders.sort((x,y)=>y.train-x.train||x.a-y.a||x.b-y.b||x.g-y.g);
      if(leaders.length>15)leaders.pop();
    }
  }
  return leaders.map(key=>{
    const plain=decode(cipher,state,key.a,key.b,key.g);
    return {...key,
      holdout:normalizedIoc(plain,positions[1]),
      reencryptionExact:encode(plain,key.a,key.b,key.g)
        .every((v,i)=>v===cipher[i])
    };
  });
}
/** Original-source calibrated English->GP29 spelling. */
const tokens = data.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function nativeGp(source){
  const s=source.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let j=0;j<s.length;){
    if(s.startsWith("ING",j)){out.push(21);j+=3;}
    else if(s.startsWith("IO",j)){out.push(27);j+=2;}
    else{
      const item=tokens.find(t=>s.startsWith(t.s,j));
      assert(item,"unmapped source orthography: "+s);
      out.push(item.i);j+=item.s.length;
    }
  }
  return out;
}
assert.deepEqual(nativeGp("FUNCTION"),[0,1,9,5,16,27,9]);
assert.deepEqual(nativeGp("FOLLOWING"),[0,3,20,20,3,7,21]);
const pools=new Map();
for(const sourceWord of read("resources/control/gibran_prophet_58585.txt").match(/[A-Za-z]+/g)||[]){
  const encoded=nativeGp(sourceWord);
  if(!pools.has(encoded.length))pools.set(encoded.length,[]);
  pools.get(encoded.length).push(encoded);
}
const plantedWords=lengths.map((n,i)=>{
  const pool=pools.get(n);
  assert(pool?.length, "reference word supply for length "+n);
  return pool[(i*17+3)%pool.length];
});
const plantPlain=plantedWords.flat();
assert.equal(plantPlain.length,original.length);
const key={a:7,b:11,g:19};
const plantCipher=encode(plantPlain,key.a,key.b,key.g);
const plantState=states(plantCipher);
assert.deepEqual(decode(plantCipher,plantState,key.a,key.b,key.g),plantPlain);
const positiveLeaders=search(plantCipher,plantState);
assert.deepEqual([positiveLeaders[0].a,positiveLeaders[0].b,positiveLeaders[0].g],
  [key.a,key.b,key.g]);
assert.equal(positiveLeaders[0].reencryptionExact,true);
const originalState=states(original);
const originalLeaders=search(original,originalState);
assert.deepEqual([originalLeaders[0].a,originalLeaders[0].b,originalLeaders[0].g],
  [5,6,19]);
assert.ok(originalLeaders[0].train<1.05);
assert.ok(originalLeaders.every(x=>x.reencryptionExact));
const controlDeep=[normalizedIoc(plantPlain,positions[0]),
  normalizedIoc(plantPlain,positions[1])];
assert.ok(controlDeep[0]>2 && controlDeep[1]>2);
const result={
  hypothesis:"bilinear ciphertext-feedback with word-local fifth predecessor",
  scope:{ciphertextRunes:original.length,words:words.length,
    trainPages:"p0-p39",holdoutPages:"p40-p55 (p50 has no runes)",
    firstHoldoutIndex:trainEnd,deepTrain:positions[0].length,
    deepHoldout:positions[1].length,keyspace:M**3},
  original:{topTrainingKeys:originalLeaders,unknownPlaintextRecovered:false},
  sourceNativePositive:{plant:"Gibran native-GP source words with exact printed lengths",
    trueKey:key,trainNormalizedIoc:controlDeep[0],
    holdoutNormalizedIoc:controlDeep[1],
    exactRecovered:plantPlain.length,topTrainingKey:positiveLeaders[0]},
  caveats:"No first-party instruction selects the bilinear term. This model does not by itself enforce the original adjacency deficit; all wrong inverse keys also round-trip. No new original plaintext."
};
console.log(JSON.stringify(result,null,2));
