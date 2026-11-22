"use strict";

/**
 * Label-invariant period-168 exclusion test for red53 six-lane running pads.
 *
 * Given K[i]=(53-2*K[i-6]) mod29, every key digit recurs after 6*28=168
 * runes, with ANY initial six seeds. Therefore for same-page positions:
 *   [C[i] == C[i-168]] == [P[i] == P[i-168]]
 * for an additive F29 pad and any arbitrary page-local bijection of the
 * published runes, prior to any collision rewriting. A small number of
 * collision repairs can perturb the equality indicator. This test uses
 * true original physical page sizes and models 81% collision suppression.
 *
 * Run: node sims/red53_period168_label_invariant.cjs
 * @module red53_period168_label_invariant
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");

const ROOT=path.resolve(__dirname,"..");
const CORPUS=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const INK=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const SOURCES=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"]
];
const PAGE_ROWS=CORPUS.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
const PAGE_LENGTHS=PAGE_ROWS.map(p=>p.indices.length);
const ORIGINAL=PAGE_ROWS.flatMap(p=>p.indices);
const GP=new Map(CORPUS.translit.map((g,i)=>[g,i]));
const ID=new Map(CORPUS.runes.map((g,i)=>[g,i]));
const LAG=168,M=29,REPS=1000,SEED=0x33015328;
assert.equal(PAGE_ROWS.length,55);
assert.equal(ORIGINAL.length,12956);
const span=INK.pages.find(p=>p.page===40).red_spans[0];
const q40=[...span.runes].reduce((sum,r)=>sum+CORPUS.prime[ID.get(r)],0)/29;
assert.equal(q40,15);
assert.deepEqual(CORPUS.prime.slice(q40-1,q40+2),[47,53,59]);

function mod(x){return (x%M+M)%M;}
function T(x){return mod(53-2*x);}
const KEY_CYCLES=Array.from({length:M},(_,seed)=>{
  const values=[seed];
  for(let i=1;i<28;i++)values.push(T(values.at(-1)));
  assert.equal(T(values.at(-1)),seed);
  return values;
});

/** @param {string} text */
function encode(text){
  const result=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const pair=GP.get(word.slice(i,i+2));
      if(pair!==undefined){result.push(pair);i+=2;}
      else{
        const single=GP.get(word[i]);
        assert.notEqual(single,undefined);
        result.push(single);i++;
      }
    }
  }
  return result;
}

/** @param {number} seed */
function random32(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** @param {number[]} data @param {()=>number} draw */
function shuffle(data,draw){
  for(let i=data.length-1;i>0;i--){
    const j=draw()%(i+1);
    [data[i],data[j]]=[data[j],data[i]];
  }
  return data;
}

/** @param {number[][]} pages */
function measure(pages){
  let eligible=0,hits=0,doublets=0;
  for(const p of pages){
    for(let i=1;i<p.length;i++)doublets+=+(p[i]===p[i-1]);
    for(let i=LAG;i<p.length;i++){
      eligible++;
      hits+=+(p[i]===p[i-LAG]);
    }
  }
  return {eligible,hits,rate:hits/eligible,doublets};
}

/**
 * @param {number[]} source One GP-English source window of exactly 12956.
 * @param {()=>number} draw
 */
function plant(source,draw) {
  let start=0,repairs=0,originalEqual=0;
  const pages=[];
  for(const length of PAGE_LENGTHS){
    const seeds=Array.from({length:6},()=>draw()%M);
    const permutation=shuffle(Array.from({length:M},(_,i)=>i),draw);
    const output=[];
    let prev=-1;
    for(let i=0;i<length;i++){
      const key=KEY_CYCLES[seeds[i%6]][Math.floor(i/6)%28];
      let c=mod(source[start+i]+key);
      if(c===prev && draw()%10000<8100){
        const rank=draw()%(M-1);
        c=rank>=prev?rank+1:rank;
        repairs++;
      }
      output.push(permutation[c]);
      prev=c;
    }
    for(let i=LAG;i<length;i++)
      originalEqual+=+(source[start+i]===source[start+i-LAG]);
    pages.push(output);
    start+=length;
  }
  assert.equal(start,source.length);
  return {measurement:measure(pages),repairs,sourceEqual:originalEqual};
}

function summary(values){
  const mean=values.reduce((s,x)=>s+x,0)/values.length;
  return {mean,sd:Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/values.length),
    min:Math.min(...values),max:Math.max(...values)};
}

function run(){
  const actual=measure(PAGE_ROWS.map(p=>p.indices));
  assert.deepEqual([actual.eligible,actual.hits,actual.doublets],[4110,140,86]);
  const random=random32(SEED),tests=[];
  for(const [name,relative] of SOURCES){
    const bytes=fs.readFileSync(path.join(ROOT,relative));
    const data=encode(bytes.toString("utf8"));
    assert.ok(data.length>=ORIGINAL.length);
    const hitCounts=[],sourceCounts=[],doubletCounts=[],repairCounts=[];
    for(let r=0;r<REPS;r++){
      const start=random()%(data.length-ORIGINAL.length+1);
      const generated=plant(data.slice(start,start+ORIGINAL.length),random);
      hitCounts.push(generated.measurement.hits);
      sourceCounts.push(generated.sourceEqual);
      doubletCounts.push(generated.measurement.doublets);
      repairCounts.push(generated.repairs);
    }
    tests.push({name,runeReferenceLength:data.length,
      referenceSHA256:createHash("sha256").update(bytes).digest("hex"),
      draws:REPS,sourceLag168Hits:summary(sourceCounts),
      syntheticCipherLag168Hits:summary(hitCounts),
      syntheticDoublets:summary(doubletCounts),
      syntheticRewrites:summary(repairCounts),
      modelsAtOrBelowOriginal:hitCounts.filter(x=>x<=actual.hits).length,
      conditionalLowerP:(1+hitCounts.filter(x=>x<=actual.hits).length)/(REPS+1)});
  }
  return {
    status:"Key/label-independent necessary equality condition fails under matched GP-English plants",
    sourcePrime53:true,
    theorem:"K[i+168]=K[i] for K[i]=53-2K[i-6] mod29; equality at lag168 is invariant under any same-page rune bijection before collision repairs",
    original:actual,
    libraries:tests,
    caveat:"The comparison uses two English reference corpora, each with original physical page lengths and stochastic collision repair. It does not refute non-English sources, aperiodic keyed skips, non-bijective outer layers, or the T6 collision-repair explanation itself. The source-prime link was retrospective."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encode,measure,plant,run};
