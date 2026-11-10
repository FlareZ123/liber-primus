"use strict";
/**
 * Source-root GF(29²) ciphertext-feedback, unknown-per-state-permutation
 * equality invariant on the actual 12,956 LP2 ciphertext runes.
 *
 * The source p3 red trinomial defines u²=3u+8. The independent root
 * z=23+27u of the printed 256-coefficient grid polynomial is taken
 * as the frozen initial state and multiplier; the oversized Ac24
 * supplies the ciphertext-feedback term.
 *
 * State follows s_(i+1) = z*s_i + 24*c_i over GF(29²).
 * At repeated state, ANY fixed secret bijection
 * c_i = permutation_state(p_i) preserves the equality of rune pairs.
 * This goes beyond the public-phase 840-state invariant because the
 * state depends on the original preceding ciphertext.
 *
 * Test exactly source-fixed book-continuous and page-restarting clocks,
 * with 300 natural-GP control windows from each of three separate books,
 * and construct/roundtrip a state-dependent affine secret permutation
 * on natural GP plaintext using the same evolving ciphertext feedback.
 *
 * Conditional original-source exclusion, no key or LP2 plaintext.
 * Node.js 22, CommonJS: node sims/red_gf841_cipherfeedback_allkey_invariant.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = p => JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/base60-grid.json");
const pages = corpus.pages.filter(p=>p.page<=55 && p.indices.length>0);
const original = pages.flatMap(p=>p.indices);
const N = original.length;
assert.equal(N,12956);
const M = x => ((x%29)+29)%29;
const Z=[23,27],CONJ=[17,2],AC=24;
const MULT=29;
const WINDOW_COUNT=300;
const SOURCE_FILES=[
  "shakespeare_first300k.txt",
  "gibran_prophet_58585.txt",
  "emerson_essays_2944.txt"
];

/** @typedef {[number,number]} Field */
/** @param {Field} a @param {Field} b @returns {Field} */
function mul(a,b) {
  return [M(a[0]*b[0]+8*a[1]*b[1]),
    M(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
}
const originalTriads=ink.pages.flatMap(p=>(p.red_spans||[])
  .filter(s=>s.length===3)
  .map(s=>[p.page,s.start,[...s.runes].map(c=>corpus.runes.indexOf(c))]));
assert.deepEqual(originalTriads,[[3,119,[13,23,2]],[39,119,[27,5,15]]]);
assert.equal(corpus.pages.find(p=>p.page===54).indices[0],AC);
const coefficients=grid.byte_rows.flat().map(M);
assert.equal(coefficients.length,256);
/** @param {Field} x */
function evaluate(x) {
  let v=[0,0];
  for(const c of coefficients){v=mul(v,x);v[0]=M(v[0]+c);}
  return v;
}
assert.deepEqual(evaluate([AC,0]),[0,0]);
assert.deepEqual(evaluate(Z),[0,0]);
assert.deepEqual(evaluate(CONJ),[0,0]);

/** @param {Field} s */
const stateId=s=>s[0]*MULT+s[1];

/**
 * Capture the precise state before every *observed* cipher output.
 * Book clock runs across punctuation, p50 grid and page turns, with
 * zero cipher-symbol steps on p50. Page clock reinitializes at every
 * original physical rune page.
 * @param {number[]} cipher
 * @param {"book"|"page"} clock
 * @returns {Uint16Array}
 */
function observedStates(cipher,clock) {
  assert.equal(cipher.length,N);
  const states=new Uint16Array(N);
  let s=[...Z],pos=0;
  for(const page of pages){
    if(clock==="page")s=[...Z];
    for(let j=0;j<page.indices.length;j++,pos++){
      states[pos]=stateId(s);
      s=mul(s,Z);
      s[0]=M(s[0]+AC*cipher[pos]);
    }
  }
  assert.equal(pos,N);
  return states;
}

/**
 * Count pairs with the same state and equal rune, invariant under
 * an arbitrary unknown *bijective* permutation for each source state.
 * @param {number[]} symbols Must include offset+N symbols.
 * @param {Uint16Array} states
 * @param {number} [offset]
 */
function collision(symbols,states,offset=0) {
  const byState=new Uint16Array(MULT*MULT*MULT);
  const stateTotal=new Uint16Array(MULT*MULT);
  for(let i=0;i<N;i++){
    const st=states[i],symbol=symbols[offset+i];
    assert(symbol>=0&&symbol<29);
    byState[st*MULT+symbol]++;
    stateTotal[st]++;
  }
  let pairs=0,matches=0,occupied=0,maxStateCount=0;
  for(let s=0;s<stateTotal.length;s++){
    const n=stateTotal[s];
    if(n===0)continue;
    occupied++;
    maxStateCount=Math.max(maxStateCount,n);
    pairs+=n*(n-1)/2;
    for(let j=0;j<29;j++){
      const c=byState[s*29+j];
      matches+=c*(c-1)/2;
    }
  }
  return {matches,pairs,rate:matches/pairs,
    occupiedStates:occupied,maxStateCount};
}

/**
 * Encode English text using the established native-GP spelling
 * normalization and greedy longest-rune matching, consistent with
 * existing control conversions in this repository.
 * @param {string} source
 * @returns {number[]}
 */
function nativeGP(source) {
  const glyphs=corpus.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const words=source.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/ING/g,"NG")
    .match(/[A-Z]+/g)||[];
  const values=[];
  for(const word of words){
    const local=[];
    for(let i=0;i<word.length;){
      const match=glyphs.find(g=>word.startsWith(g.token,i));
      if(!match){local.length=0;break;}
      local.push(match.index);
      i+=match.token.length;
    }
    values.push(...local);
  }
  return values;
}

/**
 * Actual bijective cipher in each field state: multiplier 1..28,
 * additive field trace; source-driven ciphertext feedback.
 * A deliberately hidden deterministic state-dependent affine key
 * is a positive control, not a candidate authenticated LP2 key.
 * @param {number[]} plain
 * @param {"book"|"page"} clock
 */
function plant(plain,clock) {
  assert.equal(plain.length,N);
  const cipher=[],states=new Uint16Array(N);
  let s=[...Z],pos=0;
  for(const page of pages){
    if(clock==="page")s=[...Z];
    for(let j=0;j<page.indices.length;j++,pos++){
      states[pos]=stateId(s);
      const alpha=1+((s[0]+17*s[1])%28);
      const shift=M(2*s[0]+3*s[1]);
      const c=M(alpha*plain[pos]+shift);
      cipher.push(c);
      s=mul(s,Z);
      s[0]=M(s[0]+AC*c);
    }
  }
  assert.equal(cipher.length,N);
  return {cipher,states};
}

/**
 * Decrypt the planted cipher with its deliberately specified key.
 * @param {number[]} cipher
 * @param {"book"|"page"} clock
 */
function inversePlant(cipher,clock) {
  const inverse=new Map();
  for(let x=1;x<29;x++)
    for(let y=1;y<29;y++)
      if(M(x*y)===1)inverse.set(x,y);
  assert.equal(inverse.size,28);
  const out=[];
  let s=[...Z],pos=0;
  for(const page of pages){
    if(clock==="page")s=[...Z];
    for(let j=0;j<page.indices.length;j++,pos++){
      const alpha=1+((s[0]+17*s[1])%28);
      const shift=M(2*s[0]+3*s[1]);
      out.push(M((cipher[pos]-shift)*inverse.get(alpha)));
      s=mul(s,Z);
      s[0]=M(s[0]+AC*cipher[pos]);
    }
  }
  return out;
}

function main(){
  const clocks=["book","page"];
  const states=Object.fromEntries(clocks.map(c=>[c,observedStates(original,c)]));
  const observed=Object.fromEntries(clocks.map(c=>[c,collision(original,states[c])]));
  assert.deepEqual(
    {matches:observed.book.matches,pairs:observed.book.pairs},
    {matches:3517,pairs:99957}
  );
  const controls=[];
  for(const file of SOURCE_FILES){
    const text=fs.readFileSync(path.resolve(__dirname,"..","resources/control",file),"utf8");
    const runes=nativeGP(text);
    assert(runes.length>N+WINDOW_COUNT);
    const originalClockValues=Object.fromEntries(clocks.map(c=>[c,[]]));
    const plantedClockValues=Object.fromEntries(clocks.map(c=>[c,[]]));
    for(let i=0;i<WINDOW_COUNT;i++){
      const start=Math.floor((runes.length-N-1)*i/(WINDOW_COUNT-1));
      for(const clock of clocks){
        const originalClock=collision(runes,states[clock],start);
        originalClockValues[clock].push(originalClock.rate);
        const plain=runes.slice(start,start+N);
        const generated=plant(plain,clock);
        const check=collision(plain,generated.states);
        const cipherCheck=collision(generated.cipher,generated.states);
        assert.deepEqual([check.matches,check.pairs],
          [cipherCheck.matches,cipherCheck.pairs],
          "Any fixed per-state bijection must preserve exact pair equality");
        plantedClockValues[clock].push(check.rate);
        if(i===0 || i===WINDOW_COUNT-1)
          assert.deepEqual(inversePlant(generated.cipher,clock),plain);
      }
    }
    const summarize=values=>({
      min:Math.min(...values),median:[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)],
      max:Math.max(...values)
    });
    const summaries={};
    for(const clock of clocks){
      const reference=summarize(originalClockValues[clock]);
      const synthetic=summarize(plantedClockValues[clock]);
      summaries[clock]={originalStateFixedReference:reference,
        nativeEncryptedFeedbackControl:synthetic,
        referenceAtOrBelowOriginal:originalClockValues[clock]
          .filter(x=>x<=observed[clock].rate).length,
        encryptedAtOrBelowOriginal:plantedClockValues[clock]
          .filter(x=>x<=observed[clock].rate).length};
    }
    controls.push({file,nativeSourceRunes:runes.length,windows:WINDOW_COUNT,
      byClock:summaries});
  }
  assert(controls.every(row=>clocks.every(clock=>
    row.byClock[clock].referenceAtOrBelowOriginal===0 &&
    row.byClock[clock].encryptedAtOrBelowOriginal===0)));
  console.log(JSON.stringify({
    classification:"Source-frozen ciphertext-feedback, all-secret per-state collision invariant: conditional direct GP exclusion",
    source:{redTriads:originalTriads,ac24:AC,
      field:"GF29[u]/(u²-3u-8)",root:"z=23+27u",
      gridRootChecks:"Ac24,z,Frobenius conjugate all exact"},
    originalCiphertextSymbols:N,sourceClocks:clocks,
    observed,languageControls:controls,
    verifiedPlantedAffineDecryptions:SOURCE_FILES.length*clocks.length*2,
    note:"A source-fixed evolving-state model can be tested without knowing its 841 hidden per-state output permutations. English controls and their genuinely encrypted forms all show much higher same-state equality. This is conditional on the specified source feedback, segmentation and native GP register; arbitrary other states or intermediate registers remain open."
  },null,2));
}
if(require.main===module)main();
module.exports={mul,observedStates,collision,plant,inversePlant,nativeGP};
