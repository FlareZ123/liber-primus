"use strict";

/**
 * Original-LP2 GF(29^2) paired-rune inverse selected by the p3 red trinomial.
 *
 * The *only* red three-rune inscriptions are p3 [13,23,2] and p39 [27,5,15],
 * both at local rune offset 119. The p3 primitive modulus is
 * 2u²+23u+13=0, or u²=3u+8. In GF(29²), u has order 840.
 *
 * Hypothesis: pairs of GP29 ciphertext symbols are one field element,
 * encrypted by a successive power u^j. Search 840 phases, both group
 * orientations, both clock directions and book/page pair clocks. No extra
 * fitted keys or original-cipher modifications. This is a finite original
 * decoding experiment; it does not establish the historical cipher.
 *
 * Run with Node.js 22, no extra packages, from any current directory.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} name */
const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const corpus=load("resources/liber-primus/lp2-corpus.json");
const ink=load("resources/liber-primus/lp2-ink-annotations.json");
const {parseSegments,runeWords}=require("./solved_cipher_regression.cjs");
const master=fs.readFileSync(path.join(root,"resources/transcriptions/liber_primus_master.txt"),"utf8");
const sections=parseSegments(master).map(runeWords);
const warning=sections[0].flat().map(c=>28-c);
const p57=corpus.pages.find(p=>p.page===57).indices;
const native=warning.concat(p57);
assert.deepEqual([warning.length,p57.length,native.length],[184,95,279]);
const weights=Array(29).fill(0);
for(const g of native)weights[g]++;
const logp=weights.map(n=>Math.log((n+0.5)/(native.length+14.5)));
const all=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const source=all.flatMap(p=>p.indices);
const trainingLength=all.filter(p=>p.page<28).reduce((n,p)=>n+p.indices.length,0);
assert.equal(source.length,12956);
assert.equal(trainingLength,6761);
/** @param {number} x */
const mod=x=>((x%29)+29)%29;
/** @param {number[]} x @param {number[]} y @returns {number[]} */
const mul=([a,b],[c,d])=>[mod(a*c+8*b*d),mod(a*d+b*c+3*b*d)];
const triads=ink.pages.flatMap(p=>(p.red_spans||[])
  .filter(span=>span.length===3)
  .map(span=>[p.page,span.start,[...span.runes].map(c=>corpus.runes.indexOf(c))]));
assert.deepEqual(triads,[[3,119,[13,23,2]],[39,119,[27,5,15]]]);
assert.equal(corpus.pages.find(p=>p.page===54).indices[0],24);
assert.deepEqual([mod(15*24*24),mod(-2*15*24),15],[27,5,15]);
const powers=[[1,0]],visited=new Set(["1,0"]);
for(let j=1;j<840;j++){
  const point=mul(powers.at(-1),[0,1]);
  assert(!visited.has(point.join(",")),"p3 polynomial is not primitive");
  powers.push(point);visited.add(point.join(","));
}
assert.deepEqual(mul(powers.at(-1),[0,1]),[1,0]);
assert.equal(visited.size,840);

/** @param {number[]} flat @returns {Array<{page:number,indices:number[]}>} */
function asPages(flat) {
  let ptr=0;
  return all.map(page=>{
    const indices=flat.slice(ptr,ptr+page.indices.length);
    ptr+=indices.length;
    return {page:page.page,indices};
  });
}

/**
 * Apply GF841 field multiplication to every adjacent GP-rune pair. In
 * page-local mode leave the trailing odd rune unchanged. Book-local mode
 * carries pairs across physical page boundaries and has no dropped runes.
 *
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number} phase
 * @param {1|-1} direction
 * @param {"book"|"page"} clock
 * @param {boolean} swap
 * @param {boolean} encrypt True applies inverse key, decoding's inverse.
 * @returns {number[]}
 */
function transform(pages,phase,direction,clock,swap,encrypt=false) {
  const chunks=clock==="page"?pages.map(p=>p.indices):[pages.flatMap(p=>p.indices)];
  const allOutput=[];
  for(const seq of chunks) {
    for(let j=0;j+1<seq.length;j+=2){
      const k=phase+direction*(j>>1);
      const signed=encrypt?-k:k;
      const fieldKey=powers[((signed%840)+840)%840];
      const v=swap?[seq[j+1],seq[j]]:[seq[j],seq[j+1]];
      const result=mul(v,fieldKey);
      if(swap)result.reverse();
      allOutput.push(...result);
    }
    if(seq.length%2)allOutput.push(seq.at(-1));
  }
  return allOutput;
}

/** @param {number[]} values */
function frequency(values) {
  const bins=Array(29).fill(0);
  for(const v of values)bins[v]++;
  return bins;
}
/** @param {number[]} values */
function stats(values) {
  const f=frequency(values);
  return {
    ioC:f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1)),
    gpSolvedUnigram:f.reduce((s,n,i)=>s+n*logp[i],0)/values.length
  };
}
/** @param {number[]} values */
function splitStats(values){
  return {train:stats(values.slice(0,trainingLength)),
    holdout:stats(values.slice(trainingLength))};
}

function run() {
  /** @type {Array<{clock:string,direction:number,swap:boolean,best:any,holdoutPostselected:any}>} */
  const models=[];
  for(const clock of ["book","page"])
    for(const direction of [-1,1])
      for(const swap of [false,true]) {
        let best={train:{gpSolvedUnigram:-Infinity}};
        let holdoutPostselected={holdout:{gpSolvedUnigram:-Infinity}};
        for(let phase=0;phase<840;phase++) {
          const result=splitStats(transform(all,phase,direction,clock,swap));
          const row={phase,...result};
          if(result.train.gpSolvedUnigram>best.train.gpSolvedUnigram)best=row;
          if(result.holdout.gpSolvedUnigram>holdoutPostselected.holdout.gpSolvedUnigram)
            holdoutPostselected=row;
        }
        models.push({clock,direction,swap,best,holdoutPostselected});
      }
  models.sort((a,b)=>b.best.train.gpSolvedUnigram-a.best.train.gpSolvedUnigram);
  const winning=models[0],option=winning.best;
  const decrypted=transform(all,option.phase,winning.direction,winning.clock,winning.swap);
  assert.deepEqual(transform(asPages(decrypted),option.phase,winning.direction,
    winning.clock,winning.swap,true),source);

  const truePlain=all.map(page=>({page:page.page,
    indices:page.indices.map((_,i)=>p57[i%p57.length])}));
  const trueSource=truePlain.flatMap(p=>p.indices);
  const planted=transform(truePlain,24,1,"page",false,true);
  const recovered=transform(asPages(planted),24,1,"page",false);
  assert.deepEqual(recovered,trueSource);
  const wrong=transform(asPages(planted),25,1,"page",false);
  assert.ok(stats(recovered).gpSolvedUnigram>stats(wrong).gpSolvedUnigram);
  const result={
    classification:"bounded original-GP pair-field inverse negative; no recovered LP2 plaintext",
    originalSource:"p3 primitive red polynomial GF29^2 and p39 source factor",
    candidateFamily:6720,
    originalRunes:source.length,trainingRunes:trainingLength,
    primitivePeriod:840,
    original:splitStats(source),
    positiveControl:{plantedPhase:24,trueRecovered:recovered.length,
      originalNative:splitStats(trueSource),wrongPhase:splitStats(wrong)},
    originalRoundtrip:source.length+"/"+source.length,
    models
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,transform,mul,asPages,stats};
