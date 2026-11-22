"use strict";

/**
 * Original LP2 two-plaintext-lag feedback invariant, including all 841
 * affine GF29 feedback parameter pairs and an arbitrary unknown
 * 29-symbol permutation after the feedback step.
 *
 * Candidate at each physical page's rune positions i >= 2:
 *   C[i] = C[i-1] + pi(P[i] + a*P[i-1] + b*P[i-2]) mod 29.
 * Each page's first two symbols are independently invertible headers.
 * The alphabet pi can be ANY unknown bijection, not only an affine map:
 * sorting the 29 output frequencies eliminates pi exactly.
 *
 * Matched native-GP English controls retain all 2,896 printed word lengths
 * and every physical page boundary. Native orthography uses authenticated
 * LP1 ING and IO glyph spellings. Nine deterministic controls (three each
 * from Shakespeare, Gibran, Emerson) are tested against the same original
 * 12,846 within-page positions. A complete reversible native plant tests
 * all 12,956 rune positions, including both header runes on every page.
 *
 * This is a finite-English-register exclusion for ONE exact cipher family,
 * not a plaintext/key discovery and not an exclusion of hidden-state pads.
 * Node.js 22+ CommonJS; read-only; no external packages.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8")
  .replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const layout = pages.map(p => ({number:p.page, length:p.indices.length}));
const mod = x => ((x % 29) + 29) % 29;

assert.equal(pages.length, 55);
assert.equal(layout.reduce((sum,p)=>sum+p.length,0),12956);
const glyphIds = new Map(corpus.runes.map((glyph,i)=>[glyph,i]));
const regex = new RegExp("[" + corpus.runes.join("") + "]+","gu");
const joined = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%")
  .replace(/\/\n/g,"").replace(/[\r\n%]/g,"");
const words = (joined.match(regex)||[]).map(word =>
  Array.from(word, symbol => glyphIds.get(symbol)));
assert.equal(words.length,2896);
assert.equal(words.flat().length,12956);
assert.deepEqual(words.flat(),pages.flatMap(p=>p.indices));
const N = layout.reduce((sum,p)=>sum+p.length-2,0);
assert.equal(N,12846);

/**
 * Difference count of original ciphertext, excluding each physical
 * page's two independent initialization/header glyphs.
 * @param {number[][]} streams
 * @returns {number[]}
 */
function ciphertextHistogram(streams) {
  const h = new Uint16Array(29);
  for(const stream of streams) for(let i=2;i<stream.length;i++)
    h[mod(stream[i]-stream[i-1])]++;
  return [...h];
}

/**
 * Fixed affine two-lag plaintext expression's histogram.
 * @param {number[][]} streams
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 */
function plaintextHistogram(streams,a,b) {
  const h=new Uint16Array(29);
  for(const stream of streams) for(let i=2;i<stream.length;i++)
    h[mod(stream[i]+a*stream[i-1]+b*stream[i-2])]++;
  return [...h];
}
/** @param {number[]} h */
function sorted(h){return [...h].sort((a,b)=>a-b);}
/** @param {number[]} left @param {number[]} right */
function totalVariation(left,right){
  return left.reduce((sum,x,i)=>sum+Math.abs(x-right[i]),0)/(2*N);
}

/** @param {number[]} whole */
function splitPages(whole) {
  let offset=0;
  const streams=layout.map(p=>{
    const s=whole.slice(offset,offset+p.length);
    offset+=p.length;
    return s;
  });
  assert.equal(offset,12956);
  return streams;
}
/** @param {number} seed */
function xorshift32(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;};
}
/** @param {string} source */
function wordPools(source){
  const byLength=new Map();
  for(const item of source.match(/[A-Za-z]+/g)||[]){
    const encoded=encodeSourceNativeGP(item);
    const n=encoded.length;
    if(!byLength.has(n))byLength.set(n,[]);
    byLength.get(n).push(encoded);
  }
  for(const original of words)
    assert(byLength.get(original.length)?.length,
      "reference source lacks a native GP word of length "+original.length);
  return byLength;
}
/** @param {Map<number,number[][]>} pools @param {()=>number} random */
function drawOriginalShape(pools,random){
  const plain=words.flatMap(original=>{
    const choices=pools.get(original.length);
    return choices[Math.floor(random()*choices.length)];
  });
  assert.equal(plain.length,12956);
  return splitPages(plain);
}

/** Exact finite-all-key output histogram test. */
function scanControl(plain,observed){
  let minimumNontrivialBin=Infinity;
  let best={tv:Infinity,a:-1,b:-1,min:-1,max:-1};
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const h=sorted(plaintextHistogram(plain,a,b));
    const smallest=h[0],largest=h[28];
    const tv=totalVariation(h,observed);
    if(a!==0 || b!==0)
      minimumNontrivialBin=Math.min(minimumNontrivialBin,smallest);
    if(tv<best.tv)best={tv,a,b,min:smallest,max:largest};
  }
  return {minimumNontrivialBin,best};
}

/**
 * A complete reversible plant with two independently recoverable initial
 * plaintext runes per page and a single global bijection pi(z)=7z+5.
 * @param {number[][]} source
 */
function exactPlant(source) {
  const a=10,b=20,multiplier=7,shift=5;
  const encrypt=(plain,page)=>{
    const out=[mod(11*plain[0]+2*page),
      mod(13*plain[1]+3*page)];
    for(let i=2;i<plain.length;i++){
      const q=mod(plain[i]+a*plain[i-1]+b*plain[i-2]);
      out.push(mod(out[i-1]+multiplier*q+shift));
    }
    return out;
  };
  const decrypt=(cipher,page)=>{
    const out=[mod(8*(cipher[0]-2*page)),
      mod(9*(cipher[1]-3*page))];
    for(let i=2;i<cipher.length;i++){
      const delta=mod(cipher[i]-cipher[i-1]);
      const q=mod(25*(delta-shift));
      out.push(mod(q-a*out[i-1]-b*out[i-2]));
    }
    return out;
  };
  const encrypted=source.map((plain,i)=>encrypt(plain,layout[i].number));
  const recovered=encrypted.map((cipher,i)=>decrypt(cipher,layout[i].number));
  assert.deepEqual(recovered,source);
  assert.deepEqual(encrypted,
    recovered.map((plain,i)=>encrypt(plain,layout[i].number)));
  assert.deepEqual(sorted(ciphertextHistogram(encrypted)),
    sorted(plaintextHistogram(source,a,b)));
  return {
    plantRunes:recovered.flat().length,
    recovered:recovered.flat().length,
    reencrypted:encrypted.flat().length,
    a,b,
    secretAlphabet:"pi(z) = 7z + 5 (mod29)",
    originalShapeWords:words.length,
    positiveHistogramExact:true
  };
}

const observed=sorted(ciphertextHistogram(pages.map(p=>p.indices)));
assert.equal(observed[0],85);
assert.equal(observed[28],508);
assert.equal(observed.reduce((s,v)=>s+v,0),N);
const sources=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt",0x33015637],
  ["Gibran","resources/control/gibran_prophet_58585.txt",0x33015638],
  ["Emerson","resources/control/emerson_essays_2944.txt",0x33015639]
];
const report=[];
let plant=null;
for(const [name,file,seed] of sources) {
  const pools=wordPools(read(file)),random=xorshift32(seed);
  const runs=[];
  for(let i=0;i<3;i++){
    const source=drawOriginalShape(pools,random);
    if(plant===null)plant=exactPlant(source);
    runs.push(scanControl(source,observed));
  }
  report.push({name,seed,controls:runs});
}
const minNontrivial=Math.min(...report.flatMap(x=>
  x.controls.map(y=>y.minimumNontrivialBin)));
assert.equal(minNontrivial,152,
  "source-native spelling or reference corpus changed");
assert(report.every(c=>c.controls.every(r=>r.best.tv>0.019)));
assert.equal(plant.recovered,12956);

if(require.main===module)console.log(JSON.stringify({
  claim:"finite 3-corpus matched-native GP-English exclusion, no original plaintext",
  model:"pagewise C[i]-C[i-1]=pi(P[i]+aP[i-1]+bP[i-2]) mod29, i>=2",
  keySpace:"all 841 a,b and every unknown shared GP29 alphabet permutation",
  original:{pages:55,runes:12956,words:2896,transitions:N,
    leastFrequentTransition:observed[0],
    mostFrequentTransition:observed[28]},
  controlRuns:9,smallestNontrivialEnglishBin:minNontrivial,
  independentPlant:plant,sources:report,
  limitation:"three finite GP-native English sources; other plain registers, changing keys and hidden-state encoders not excluded"
},null,2));
