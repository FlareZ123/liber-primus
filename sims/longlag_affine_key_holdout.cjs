"use strict";

/**
 * Fixed-lag affine keystream inversion at the 6395-rune separation of the
 * genuine duplicated LP2 six-rune two-word phrase.
 *
 * Hypothesis: C_i = P_i + K_i mod 29, K_{i+6395} = a*K_i + b mod29,
 * a=1..28, b=0..28. For a general affine key relation the key cancels in
 * D_i = C_{i+6395} - a*C_i = P_{i+6395} - a*P_i + b.
 *
 * 29-value difference histograms are scored against independently sourced
 * GP-English difference distributions. Choose a,b on the first half of
 * 6555 unseen pairs, evaluate on frozen second half, and calibrate all
 * selection under rotations. The six discovery-rune positions are excluded.
 *
 * Run from repository root: node sims/longlag_affine_key_holdout.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname,"..");
const MOD = 29, DELTA = 6395, DISCOVERY = 6, N_NULL = 500, N_PLANT = 40;
const GP = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
  "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const GPMAP = new Map(GP.map((x,i)=>[x,i]));
const REFERENCES = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];

/** @param {number} n @returns {number} */
const mod = n => ((n % MOD)+MOD)%MOD;

/** @param {number} seed Positive unsigned 32-bit seed. */
function random32(seed) {
  let x=seed>>>0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x>>>0;
  };
}

/** @param {string} input Contiguous orthographic English. */
function encodeGP(input) {
  const result=[];
  for (let w of input.toUpperCase().match(/[A-Z]+/g) || []) {
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;) {
      const digraph=w.slice(i,i+2);
      if(GPMAP.has(digraph)) {
        result.push(GPMAP.get(digraph)); i+=2;
      } else {
        const rune=GPMAP.get(w[i]);
        if(rune===undefined) throw Error("Unrecognized letter "+w[i]);
        result.push(rune); i++;
      }
    }
  }
  return Uint8Array.from(result);
}

/** @param {Uint8Array} source GP source runes, @returns {number[]} */
function sourceFrequency(source) {
  const freq=new Array(MOD).fill(.5);
  for(const c of source) freq[c]++;
  const total=freq.reduce((x,y)=>x+y,0);
  return freq.map(x=>x/total);
}

/**
 * @param {number[]} freq Letter frequencies, sum one.
 * @returns {Array<Float64Array>} For each slope 1..28, log(29*p(D_i=d)).
 */
function modelLogWeights(freq) {
  const weights=[null];
  for(let a=1;a<MOD;a++) {
    const dist=new Float64Array(MOD);
    for(let u=0;u<MOD;u++)
      for(let v=0;v<MOD;v++)
        dist[mod(v-a*u)]+=freq[u]*freq[v];
    weights[a]=Float64Array.from(dist, p=>Math.log(MOD*p));
  }
  return weights;
}

/**
 * @param {number[]} ciphertext Original or synthetic ciphertext indices.
 * @param {Float64Array[]} model Model by affine slope.
 * @param {number} [shift=0] Circular rotation of second aligned stream
 * @returns {{a:number,b:number,train:number,hold:number,trainPerRune:number,holdPerRune:number}}
 */
function scan(ciphertext,model,shift=0) {
  const totalPairs=ciphertext.length-DELTA-DISCOVERY;
  const trainPairs=Math.floor(totalPairs/2);
  const train=Array.from({length:MOD},()=>new Int32Array(MOD));
  const held=Array.from({length:MOD},()=>new Int32Array(MOD));
  for(let i=0;i<totalPairs;i++) {
    const c0=ciphertext[i],c1=ciphertext[(i+DELTA+shift)%ciphertext.length];
    const h=i<trainPairs ? train : held;
    for(let a=1;a<MOD;a++) h[a][mod(c1-a*c0)]++;
  }
  let best={a:1,b:0,train:-Infinity};
  for(let a=1;a<MOD;a++) for(let b=0;b<MOD;b++) {
    const weights=model[a],h=train[a];
    let value=0;
    for(let d=0;d<MOD;d++)value+=h[d]*weights[mod(d-b)];
    if(value>best.train)best={a,b,train:value};
  }
  let hold=0;
  for(let d=0;d<MOD;d++)
    hold+=held[best.a][d]*model[best.a][mod(d-best.b)];
  return {...best,hold,trainPerRune:best.train/trainPairs,
    holdPerRune:hold/(totalPairs-trainPairs)};
}

/**
 * @param {Uint8Array} plain Contiguous GP plaintext from control.
 * @param {number} a Key recurrence multiplier.
 * @param {number} b Key recurrence increment.
 * @param {Set<number>} boundaries Section starts after first section.
 * @param {() => number} random seeded RNG.
 * @returns {{cipher:Uint8Array,adjacentDoublets:number}}
 */
function encryptPlant(plain,a,b,boundaries,random) {
  const pad=new Uint8Array(plain.length);
  for(let i=0;i<pad.length;i++)
    pad[i]=i<DELTA ? random()%MOD : mod(a*pad[i-DELTA]+b);
  const cipher=new Uint8Array(plain.length);
  let prior=-1,adjacentDoublets=0;
  for(let i=0;i<cipher.length;i++){
    if(boundaries.has(i))prior=-1;
    let c=mod(plain[i]+pad[i]);
    if(c===prior && random()%100<81)c=mod(c+1+random()%28);
    else if(c===prior)adjacentDoublets++;
    cipher[i]=c;
    prior=c;
  }
  return {cipher,adjacentDoublets};
}

/** @param {number[]} arr */
function stats(arr) {
  const mean=arr.reduce((a,b)=>a+b,0)/arr.length;
  const variance=arr.reduce((a,b)=>a+(b-mean)**2,0)/arr.length;
  return {mean,sd:Math.sqrt(variance),min:Math.min(...arr),max:Math.max(...arr)};
}

/** Run original input, anti-repeat-preserving null, and known-key plants. */
function run() {
  const corpus=JSON.parse(fs.readFileSync(path.join(
    ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const actual=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  if(actual.length!==12956)throw Error("LP2 rune count changed");
  const raw=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
  const sections=raw.split("%").slice(0,55).join("%").split("$")
    .filter(s=>/[\u16A0-\u16FF]/u.test(s))
    .map(s=>[...s].filter(c=>/[\u16A0-\u16FF]/u.test(c)).length);
  if(sections.length!==8 || sections.reduce((a,b)=>a+b,0)!==12956)
    throw Error("LP2 section parsing changed");
  const boundaries=new Set();
  let offset=0;
  for(let i=0;i<sections.length-1;i++){offset+=sections[i];boundaries.add(offset);}
  // Six original phrase symbols at source indices 6555..6560.
  for(let i=6555;i<6561;i++)
    if(actual[i]!==actual[i+DELTA])throw Error("Discovery echo changed");

  const refs=REFERENCES.map(([name,file])=>({
    name,
    plain:encodeGP(fs.readFileSync(path.join(ROOT,file),"utf8"))
  }));
  const model=modelLogWeights(sourceFrequency(refs[0].plain));
  const result=scan(actual,model);

  const rng=random32(0x430f6395),nullHold=[];
  for(let t=0;t<N_NULL;t++) {
    let shift;
    do {shift=100+rng()%(actual.length-200);}
    while(((DELTA+shift)%actual.length)===0 ||
          Math.min((DELTA+shift)%actual.length,
            actual.length-((DELTA+shift)%actual.length))<100);
    nullHold.push(scan(actual,model,shift).holdPerRune);
  }

  const plants=[];
  for(let k=0;k<refs.length;k++) for(const [a,b] of [[1,0],[6,15],[27,24]]) {
    const source=refs[k].plain;
    if(source.length<actual.length)throw Error("Reference too short");
    const holdScores=[],doublets=[];
    let exactKey=0,aboveReal=0;
    for(let t=0;t<N_PLANT;t++) {
      const start=rng()%(source.length-actual.length+1);
      const plain=source.slice(start,start+actual.length);
      const plant=encryptPlant(plain,a,b,boundaries,rng);
      const prediction=scan(plant.cipher,model);
      exactKey+=+(prediction.a===a && prediction.b===b);
      holdScores.push(prediction.holdPerRune);
      doublets.push(plant.adjacentDoublets);
      aboveReal+=+(prediction.holdPerRune>result.holdPerRune);
    }
    plants.push({source:refs[k].name,a,b,trials:N_PLANT,
      exactKey,aboveReal,heldout:stats(holdScores),doublets:stats(doublets)});
  }
  const cHist=new Int32Array(MOD);
  for(let i=0;i<actual.length-DELTA-DISCOVERY;i++)
    cHist[mod(actual[i+DELTA]-actual[i])]++;
  return {
    hypothesis:"K[i+6395]=a*K[i]+b mod29; C=P+K mod29; 812 affine relations",
    model:"Shakespeare 29-symbol independent GP pair differences, smoothed counts",
    corpus:{runes:actual.length,delta:DELTA,discoverySymbolsExcluded:6,
      unfittedPairs:actual.length-DELTA-DISCOVERY,
      sectionRuneLengths:sections,unchangedKeyDifferenceHistogram:[...cHist]},
    frozenHoldout:result,
    rotations:{trials:N_NULL,seed:"0x430f6395",nullHold:stats(nullHold),
      exceed:nullHold.filter(v=>v>=result.holdPerRune).length,
      familyUpperP:(1+nullHold.filter(v=>v>=result.holdPerRune).length)/(N_NULL+1)},
    plantedControls:plants,
    caution:"A changing outer-alphabet map, a non-English intermediate register or a local rather than bookwide relation can defeat this sieve"
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encodeGP,sourceFrequency,modelLogWeights,scan,encryptPlant,run};
