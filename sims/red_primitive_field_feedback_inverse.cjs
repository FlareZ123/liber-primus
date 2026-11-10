"use strict";
/**
 * Source-motivated original LP2 GF(29^2) ciphertext-feedback inverse.
 *
 * The p3 marked 3-rune polynomial (13,23,2) defines u^2=3u+8,
 * a primitive 840-cycle over GF29. The p39 polynomial 15(X-24)^2
 * and oversized p54 Ac provide the independent numeric selector 24.
 * An independently identified grid root z=23+27u (and conjugate) supplies\n * four further source-defined field multipliers in addition to u^±1.\n * For field state s: output c=p+Tr(s), then update s=g*s+beta*c,
 * with Tr(a+b*u)=2a+3b and beta in {±1,±u,±24,±24u}.
 *
 * Exhaust all 29^2 initial states, six primitive field multipliers and two
 * source-visible state clocks, preserving every ciphertext glyph.
 * Distinct from the per-phase unknown-bijection invariant: state here
 * depends on earlier original ciphertext, so equal positions need not
 * have identical state. No authentic key or plaintext is claimed.
 *
 * Node.js 22, CommonJS. SFT: node sims/red_primitive_field_feedback_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = p => JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const original = pages.flatMap(p => p.indices);
const solved = corpus.pages.find(p => p.page === 57).indices;
const m = x => ((x % 29) + 29) % 29;
const TRAIN = pages.filter(p => p.page < 28).reduce((s,p) => s+p.indices.length,0);
const N = original.length;
assert.equal(N,12956);
assert.equal(TRAIN,6761);
assert.equal(N-TRAIN,6195);
assert.equal(solved.length,95);
const triads=ink.pages.flatMap(p=>(p.red_spans || []).filter(s=>s.length===3)
  .map(s=>[p.page,s.start,[...s.runes].map(r=>corpus.runes.indexOf(r))]));
assert.deepEqual(triads,[[3,119,[13,23,2]],[39,119,[27,5,15]]]);
const AC = corpus.pages.find(p=>p.page===54).indices[0];
assert.equal(AC,24);

/** @typedef {[number,number]} Field29Square */
/** @param {Field29Square} x @param {Field29Square} y @returns {Field29Square} */
function multiply(x,y) {
  return [m(x[0]*y[0]+8*x[1]*y[1]),
    m(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
}
const GENERATORS={
  "u+":[0,1],"u-":[25,11],
  "z+":[23,27],"z-":[20,16],
  "zc+":[17,2],"zc-":[10,13]
};
for(const [a,b] of [["u+","u-"],["z+","z-"],["zc+","zc-"]])
  assert.deepEqual(multiply(GENERATORS[a],GENERATORS[b]),[1,0]);
const grid=load("resources/liber-primus/base60-grid.json");
const fieldPolynomial=grid.byte_rows.flat().map(m);
/** Evaluate printed descending F29 coefficients at an extension-field root. */
function evaluateField(coefficients,z){
  let state=[0,0];
  for(const v of coefficients){
    state=multiply(state,z);
    state[0]=m(state[0]+v);
  }
  return state;
}
assert.equal(fieldPolynomial.length,256);
for(const root of [[AC,0],GENERATORS["z+"],GENERATORS["zc+"]])
  assert.deepEqual(evaluateField(fieldPolynomial,root),[0,0]);

/** @param {Field29Square} state @param {string} generator */
function multiplyGenerator(state,generator) {
  return multiply(state,GENERATORS[generator]);
}

/** Source-defined primitive powers and their two trace basis columns. */
function traceBases(generator) {
  let state=[1,0];
  const seen=new Set(),ta=[],tb=[];
  for(let i=0;i<840;i++) {
    const key=state.join(",");
    assert(!seen.has(key));
    seen.add(key);
    ta.push(m(2*state[0]+3*state[1]));
    const nextU=[m(8*state[1]),m(state[0]+3*state[1])];
    tb.push(m(2*nextU[0]+3*nextU[1]));
    state=multiplyGenerator(state,generator);
  }
  assert.deepEqual(state,[1,0]);
  assert.equal(seen.size,840);
  return {ta,tb};
}
const traces=Object.fromEntries(Object.keys(GENERATORS).map(g=>[g,traceBases(g)]));
for(let i=0;i<840;i++)
  assert.equal(traces["u+"].ta[(i+420)%840],m(-traces["u+"].ta[i]));

const ticks={book:new Uint16Array(N),page:new Uint16Array(N)};
let global=0;
for(const page of pages) {
  for(let j=0;j<page.indices.length;j++,global++) {
    ticks.book[global]=global%840;
    ticks.page[global]=j%840;
  }
}
assert.equal(global,N);

/** @param {Uint16Array} f @param {number} n */
function ioc(f,n) {
  let count=0;
  for(const v of f)count+=v*(v-1);
  return count/(n*(n-1));
}

/** @param {number[]} values */
function streamIoc(values) {
  const f=new Uint16Array(29);
  for(const x of values)f[x]++;
  return ioc(f,values.length);
}
const DRIVES=[
  ["base+",1,0],["base-",-1,0],
  ["u+",0,1],["u-",0,-1],
  ["ac-base+",AC,0],["ac-base-",-AC,0],
  ["ac-u+",0,AC],["ac-u-",0,-AC]
];

/**
 * Decode or encrypt an original-shaped GP stream with the indicated
 * ciphertext-feedback model. Encryption updates with generated c.
 * @param {number[]} input
 * @param {{clock:string,generator:string,e0:number,e1:number,a:number,b:number}} model
 * @param {boolean} encrypt
 */
function transform(input,model,encrypt) {
  assert.equal(input.length,N);
  const output=[];
  let a=model.a,b=model.b,position=0;
  for(const page of pages) {
    if(model.clock==="page") { a=model.a; b=model.b; }
    for(let j=0;j<page.indices.length;j++,position++) {
      const v=input[position];
      const symbol=m(v+(encrypt?1:-1)*m(2*a+3*b));
      output.push(symbol);
      const c=encrypt?symbol:v;
      [a,b]=multiplyGenerator([a,b],model.generator);
      a=m(a+model.e0*c);
      b=m(b+model.e1*c);
    }
  }
  return output;
}

/** Derive all seed-independent forced outputs from original ciphertext. */
function forcedTrace(clock,generator,e0,e1) {
  const trace=new Uint8Array(N);
  let a=0,b=0,pos=0;
  for(const page of pages) {
    if(clock==="page"){a=0;b=0;}
    for(let j=0;j<page.indices.length;j++,pos++){
      trace[pos]=m(2*a+3*b);
      [a,b]=multiplyGenerator([a,b],generator);
      a=m(a+e0*original[pos]);
      b=m(b+e1*original[pos]);
    }
  }
  return trace;
}

function main() {
  const results=[];
  for(const clock of ["book","page"])for(const generator of Object.keys(GENERATORS)) {
    const {ta,tb}=traces[generator];
    const ha=Array.from(ticks[clock],i=>ta[i]);
    const hb=Array.from(ticks[clock],i=>tb[i]);
    for(const [drive,e0,e1] of DRIVES){
      const forced=forcedTrace(clock,generator,e0,e1);
      for(let a=0;a<29;a++)for(let b=0;b<29;b++){
        const f0=new Uint16Array(29),f1=new Uint16Array(29);
        for(let i=0;i<N;i++){
          const p=m(original[i]-forced[i]-a*ha[i]-b*hb[i]);
          (i<TRAIN?f0:f1)[p]++;
        }
        results.push({clock,generator,drive,e0,e1,a,b,
          train:ioc(f0,TRAIN),heldout:ioc(f1,N-TRAIN)});
      }
    }
  }
  assert.equal(results.length,80736);
  results.sort((x,y)=>y.train-x.train);
  const selected=results[0];
  const largestHeldout=results.reduce((a,b)=>b.heldout>a.heldout?b:a);
  const realDecoded=transform(original,selected,false);
  assert.deepEqual(transform(realDecoded,selected,true),original);
  const planted=Array.from({length:N},(_,i)=>solved[i%solved.length]);
  const fixed={clock:"book",generator:"z+",drive:"ac-base+",e0:24,e1:0,a:23,b:27};
  const plantedCipher=transform(planted,fixed,true);
  const decodedPlant=transform(plantedCipher,fixed,false);
  assert.deepEqual(decodedPlant,planted);
  const wrong=transform(plantedCipher,{...fixed,a:24},false);
  const prior=results.find(r=>r.clock==="book"&&r.generator==="z+"&&r.drive==="ac-base+"&&r.a===23&&r.b===27);
  const GP=corpus.translit;
  console.log(JSON.stringify({
    classification:"Original-input finite source-triad ciphertext-feedback inverse, negative under native GP language",
    source:{p3:[13,23,2],p39:[27,5,15],ac:AC,fieldRelation:"u^2=3u+8",
      generatorOrder:840,gridRoots:[[24,0],[23,27],[17,2]]},
    samples:{full:N,train:TRAIN,heldout:N-TRAIN,originalPages:55},
    models:results.length,clocks:["book","page"],generators:GENERATORS,
    drives:DRIVES.map(x=>x[0]),seedsPerMode:841,
    nativeGPUniformIoc:1/29,originalIoc:streamIoc(original),
    sourceFrozen:prior,bestTraining:selected,
    postSelectedMaxHeldout:largestHeldout,topTraining:results.slice(0,5),
    candidatePrefix:realDecoded.slice(0,90).map(x=>GP[x]).join(" "),
    originalForwardRoundtrip:N+"/"+N,
    plantedControl:{register:"solved physical p57 repeated, synthetic ciphertext-feedback encoding",
      seed:[23,27],generator:"z+",drive:"ac-base+",decoded:N+"/"+N,
      trueIoc:streamIoc(planted),wrongSeedIoc:streamIoc(wrong)},
    conclusion:"No GP-language concentration among the frozen or 80736 searched original inversions. The named feedback family is conditionally excluded as a direct original native-GP decoder, not all possible field/state ciphers."
  },null,2));
}
if(require.main===module)main();
module.exports={multiplyGenerator,transform,traceBases,forcedTrace};
