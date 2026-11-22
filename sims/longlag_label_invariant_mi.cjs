"use strict";

/**
 * Key-independent two-stream dependence test at LP2's exact bookend-phrase
 * separation (6395 runes). Distinct arbitrary bijections of the 29 symbols
 * on the two aligned streams preserve their mutual information.
 *
 * A reused additive pad in GP-English plaintext should introduce a
 * dependence between the two streams even if the output alphabets are
 * entirely unknown. This test learns nothing from the 6 discovery runes.
 *
 * Run from repository root: node sims/longlag_label_invariant_mi.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const M=29, DELTA=6395, DISCOVERY=6, N_NULL=1000, N_PLANT=400;
const ALPHABET=["F","U","TH","O","R","C","G","W","H","N","I","J",
  "EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const GP=new Map(ALPHABET.map((s,i)=>[s,i]));
const REFERENCES=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];

/** @param {number} seed Nonzero unsigned state. */
function random32(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** @param {string} text English orthographic text. */
function encode(text) {
  const o=[];
  for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    w=w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;) {
      const pair=w.slice(i,i+2);
      if(GP.has(pair)){o.push(GP.get(pair));i+=2;}
      else{
        const x=GP.get(w[i]);
        if(x===undefined)throw Error("Unknown grapheme");
        o.push(x);i++;
      }
    }
  }
  return Uint8Array.from(o);
}

/**
 * Mutual information in natural-log nats with 29×29 empirical contingency.
 * @param {Uint8Array|number[]} a N aligned symbols.
 * @param {Uint8Array|number[]} b N aligned symbols.
 */
function mutualInformation(a,b) {
  if(a.length!==b.length)throw Error("Paired streams differ in length");
  const n=a.length,joint=new Int32Array(M*M);
  const rows=new Int32Array(M),columns=new Int32Array(M);
  for(let i=0;i<n;i++) {
    const x=a[i],y=b[i];
    joint[x*M+y]++;
    rows[x]++;
    columns[y]++;
  }
  let mi=0;
  for(let x=0;x<M;x++)for(let y=0;y<M;y++) {
    const count=joint[x*M+y];
    if(count)mi+=count/n*Math.log(count*n/(rows[x]*columns[y]));
  }
  return mi;
}

/** @param {() => number} rng Deterministic RNG. */
function permute(rng) {
  const o=Uint8Array.from({length:M},(_,i)=>i);
  for(let i=M-1;i>0;i--){
    const j=rng()%(i+1);
    [o[i],o[j]]=[o[j],o[i]];
  }
  return o;
}

/** @param {number[]} values Nonempty real-valued sample. */
function stats(values) {
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const variance=values.reduce((a,b)=>a+(b-mean)**2,0)/values.length;
  return {mean,sd:Math.sqrt(variance),min:Math.min(...values),
    max:Math.max(...values)};
}

/**
 * @param {Uint8Array} GPPlain GP-English contiguous source window.
 * @param {Set<number>} sectionStarts True manuscript section positions.
 * @param {() => number} rng Seeded RNG.
 */
function periodicCipher(GPPlain,sectionStarts,rng) {
  const key=new Uint8Array(DELTA);
  for(let i=0;i<key.length;i++)key[i]=rng()%M;
  const c=new Uint8Array(GPPlain.length);
  let prev=-1,repeatEvents=0;
  for(let i=0;i<c.length;i++) {
    if(sectionStarts.has(i))prev=-1;
    let x=(GPPlain[i]+key[i%DELTA])%M;
    if(x===prev && rng()%100<81)x=(x+1+rng()%28)%M;
    else if(x===prev)repeatEvents++;
    c[i]=x;prev=x;
  }
  return {cipher:c,repeatEvents};
}

/** @returns {object} Fully reproducible 6395-lag label-free experiment. */
function run() {
  const corpus=JSON.parse(fs.readFileSync(
    path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const original=Uint8Array.from(corpus.pages.filter(p=>p.page<=55)
    .flatMap(p=>p.indices));
  const N=original.length,PAIRS=N-DELTA-DISCOVERY;
  if(N!==12956||PAIRS!==6555)throw Error("LP2 input changed");
  for(let i=6555;i<6561;i++)
    if(original[i]!==original[i+DELTA])throw Error("Original phrase changed");

  const realA=original.slice(0,PAIRS);
  const realB=original.slice(DELTA,DELTA+PAIRS);
  const actualMI=mutualInformation(realA,realB);
  const rng=random32(0xf00d3301);
  const nullSamples=[];
  for(let test=0;test<N_NULL;test++) {
    let shift;
    do{shift=100+rng()%(N-200);}
    while(Math.min((DELTA+shift)%N,N-(DELTA+shift)%N)<100);
    const b=Uint8Array.from({length:PAIRS},(_,i)=>
      original[(i+DELTA+shift)%N]);
    nullSamples.push(mutualInformation(realA,b));
  }

  const transcript=fs.readFileSync(
    path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
  const sections=transcript.split("%").slice(0,55).join("%").split("$")
    .filter(s=>/[\u16A0-\u16FF]/u.test(s))
    .map(s=>[...s].filter(c=>/[\u16A0-\u16FF]/u.test(c)).length);
  if(sections.length!==8||sections.reduce((a,b)=>a+b,0)!==N)
    throw Error("Section metadata mismatch");
  const sectionStarts=new Set(), total=sections.slice(0,-1);
  let offset=0;
  for(const n of total){offset+=n;sectionStarts.add(offset);}
  const plants=[];
  for(let sourceId=0;sourceId<REFERENCES.length;sourceId++) {
    const [name,file]=REFERENCES[sourceId];
    const ref=encode(fs.readFileSync(path.join(ROOT,file),"utf8"));
    if(ref.length<N)throw Error("Reference too short");
    const random=random32(0x43880605+(sourceId+1)*103);
    const miValues=[],doublets=[];
    let bitExactRelabels=0;
    for(let trial=0;trial<N_PLANT;trial++) {
      const start=random()%(ref.length-N+1);
      const plant=periodicCipher(ref.slice(start,start+N),sectionStarts,random);
      const a=plant.cipher.slice(0,PAIRS), b=plant.cipher.slice(DELTA,DELTA+PAIRS);
      const plainMI=mutualInformation(a,b);
      const permA=permute(random),permB=permute(random);
      const unknownA=a.map(x=>permA[x]),unknownB=b.map(x=>permB[x]);
      const encodedMI=mutualInformation(unknownA,unknownB);
      if(Math.abs(encodedMI-plainMI)<1e-12)bitExactRelabels++;
      miValues.push(encodedMI);
      doublets.push(plant.repeatEvents);
    }
    plants.push({source:name,trials:N_PLANT,
      unknownBijectiveLabelsValidated:bitExactRelabels,
      mutualInformation:stats(miValues),adjacentDoublets:stats(doublets),
      nullOrLower:miValues.filter(x=>x<=actualMI).length});
  }
  return {
    method:"Label-invariant MI for C[i],C[i+6395]; discovery six excluded",
    manuscript:{n: N,delta: DELTA,unfittedPairs:PAIRS,MI_nats:actualMI},
    rotationNull:{seed:"0xf00d3301",draws:N_NULL,MI_nats:stats(nullSamples),
      countAtLeastActual:nullSamples.filter(x=>x>=actualMI).length,
      upperTailP:(1+nullSamples.filter(x=>x>=actualMI).length)/(N_NULL+1)},
    plantedKeyModel:"GP-English + arbitrary uniform 6395-period additive pad + 81% doublet repair + independent unknown bijective 29-label maps",
    plants,
    scope:"Requires a synchronized same-pad alignment and fixed bijection on each compared stream; changing per-page label maps and position-specific skips can break MI"
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encode,mutualInformation,permute,periodicCipher,run};
