"use strict";
/**
 * A key-free necessary-condition test for field-unit (nonzero-key) GP ciphers.
 *
 * If C_t=C_(t-1)+(P_t+1)*K_t (mod 29) with K_t!=0, then
 * C_t=C_(t-1) iff P_t=28 (EA).  More generally, a single unknown fixed
 * substitution maps these equalities to exactly ONE plaintext GP rune.
 *
 * Here test all 29 possible plaintext markers using observable word-start
 * vs word-internal counts, conditioning the GP-English reference on the
 * actual canonical LP2 whole-word lengths. Samples calibrate the *best*
 * marker chosen after examining ciphertext; no original key is fitted.
 * @module field_unit_marker_positions
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {createHash}=require("node:crypto");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.resolve(__dirname,"..");
const R=(filename)=>fs.readFileSync(path.join(ROOT,filename),"utf8");
const DATA=JSON.parse(R("resources/liber-primus/lp2-corpus.json"));
const GP=new Map(DATA.translit.map((name,i)=>[name,i]));
const ENTRIES=[...GP].sort((a,b)=>b[0].length-a[0].length);
const TRIALS=Number(process.argv[2]||1200);
const SEED=0x3377ea28;
const MAX_LEN_BIN=10;
const MAX_POS_BIN=8;

/** @param {string} spelling @param {boolean} collapseIng @returns {number[]|null} */
function encode(spelling,collapseIng){
  let s=spelling.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  if(collapseIng)s=s.replace(/ING/g,"NG");
  const result=[];
  for(let pos=0;pos<s.length;){
    const token=ENTRIES.find(([name])=>s.startsWith(name,pos));
    if(!token)return null;
    result.push(token[1]);
    pos+=token[0].length;
  }
  return result;
}
/** @param {string} content @returns {string} */
function gutenbergText(content){
  const first=content.search(/\*\*\* START OF (?:THIS )?PROJECT GUTENBERG EBOOK/i);
  const last=content.search(/\*\*\* END OF (?:THIS )?PROJECT GUTENBERG EBOOK/i);
  return content.slice(first<0?0:first+90,last<0?undefined:last);
}
/**
 * @param {number[][]} words Canonical GP rune sequences
 * @returns {{first:number,inside:number,dFirst:number,dInside:number,slots:number[][]}}
 */
function observed(words){
  const slots=Array.from({length:MAX_LEN_BIN+1},()=>[]);
  let prev=-1,first=0,inside=0,dFirst=0,dInside=0;
  for(const word of words){
    const length=Math.min(MAX_LEN_BIN,word.length);
    for(let pos=0;pos<word.length;pos++){
      if(prev!==-1){
        const p=Math.min(pos,MAX_POS_BIN);
        slots[length].push(p);
        if(pos===0){first++;dFirst+=Number(prev===word[pos]);}
        else{inside++;dInside+=Number(prev===word[pos]);}
      }
      prev=word[pos];
    }
  }
  return {first,inside,dFirst,dInside,slots};
}
/**
 * Given a reference-language word corpus, estimate the expected first vs
 * interior frequency of each putative zero-increment plaintext rune at
 * exactly the observed LP2 word-length and rune-position slot inventory.
 * L>=10 and internal pos>=8 are pooled to retain source sample sizes.
 * @param {number[][]} words
 * @param {number[][]} slots
 * @returns {{first:number,inside:number,sourceFirst:number,sourceInside:number}[]}
 */
function probabilities(words,slots){
  const bins=Array.from({length:MAX_LEN_BIN+1},()=>[]);
  for(const word of words){
    const byPosition=bins[Math.min(word.length,MAX_LEN_BIN)];
    for(let pos=0;pos<word.length;pos++){
      const p=Math.min(pos,MAX_POS_BIN);
      byPosition[p]??=new Uint32Array(29);
      byPosition[p][word[pos]]++;
    }
  }
  const result=Array.from({length:29},()=>({
    first:0,inside:0,sourceFirst:0,sourceInside:0
  }));
  // Precount target layout slots so source probabilities are weighted by
  // manuscript word-length distribution, rather than by Shakespeare length.
  for(let length=1;length<=MAX_LEN_BIN;length++){
    const targetCount=new Uint32Array(MAX_POS_BIN+1);
    for(const pos of slots[length])targetCount[pos]++;
    for(let pos=0;pos<=MAX_POS_BIN;pos++){
      if(!targetCount[pos])continue;
      const row=bins[length][pos];
      assert.ok(row,"Missing reference GP words at length="+length+" pos="+pos);
      const total=row.reduce((sum,x)=>sum+x,0);
      assert.ok(total>0);
      for(let rune=0;rune<29;rune++){
        const expected=targetCount[pos]*row[rune]/total;
        if(pos===0){result[rune].first+=expected;result[rune].sourceFirst+=row[rune];}
        else{result[rune].inside+=expected;result[rune].sourceInside+=row[rune];}
      }
    }
  }
  return result;
}
/** @param {number} n @param {number} successes @param {number} p @returns {number} */
function logBinomial(n,successes,p){
  if(p<=0)return successes? -Infinity:0;
  if(p>=1)return successes===n?0:-Infinity;
  return successes*Math.log(p)+(n-successes)*Math.log1p(-p);
}
/** @param {number} f @param {number} i @param {number} nf @param {number} ni @param {{first:number,inside:number}} expected */
function deviance(f,i,nf,ni,expected){
  const fixed=logBinomial(nf,f,f/nf)+logBinomial(ni,i,i/ni);
  const model=logBinomial(nf,f,expected.first/nf)+
    logBinomial(ni,i,expected.inside/ni);
  return 2*(fixed-model);
}
/** @param {number} seed @returns {()=>number} */
function rng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)+0.5)/4294967296;};
}
/**
 * Exact geometric-waiting-time binomial random sampler.
 * @param {number} n @param {number} p @param {()=>number} random
 */
function binomial(n,p,random){
  if(p<=0)return 0;
  if(p>=1)return n;
  if(p>.5)return n-binomial(n,1-p,random);
  const logFail=Math.log1p(-p);
  let hits=0,pos=-1;
  while(true){
    pos+=1+Math.floor(Math.log(random())/logFail);
    if(pos>=n)break;
    hits++;
  }
  return hits;
}
/** @param {number[]} plain @param {()=>number} random */
function fieldUnitPositive(plain,random){
  let prev=Math.floor(random()*29);
  let duplicate=0,zero=0;
  for(const p of plain){
    const key=1+Math.floor(random()*28);
    const next=(prev+(p+1)*key)%29;
    assert.equal(next===prev,p===28);
    const inverse=(next-prev+29)%29;
    assert.equal(inverse===0,p===28);
    if(next===prev)duplicate++;
    if(p===28)zero++;
    prev=next;
  }
  assert.equal(duplicate,zero);
  return {runes:plain.length,zeroIncrementEvents:duplicate,
    exactHiddenMarkerRecovery:"all/ all"};
}
/**
 * Composite-null simulation: under each possible source-language marker,
 * sample duplicate counts at starts and interiors, then allow an attacker
 * to select the BEST of all 29 reference markers. Report the LARGEST
 * (least favorable) empirical upper tail across all possible true markers.
 * @param {ReturnType<typeof probabilities>} candidates
 * @param {ReturnType<typeof observed>} target
 * @param {()=>number} random
 */
function simulate(candidates,target,random){
  const scored=candidates.map((q,rune)=>({
    rune,expectedFirst:q.first,expectedInside:q.inside,
    deviance:deviance(target.dFirst,target.dInside,target.first,target.inside,q)
  })).sort((a,b)=>a.deviance-b.deviance);
  const minimum=scored[0].deviance;
  const individual=[];
  for(let truth=0;truth<29;truth++){
    let exceed=0;
    for(let trial=0;trial<TRIALS;trial++){
      const f=binomial(target.first,candidates[truth].first/target.first,random);
      const i=binomial(target.inside,candidates[truth].inside/target.inside,random);
      let best=Infinity;
      for(const marker of candidates){
        const d=deviance(f,i,target.first,target.inside,marker);
        if(d<best)best=d;
      }
      if(best>=minimum-1e-10)exceed++;
    }
    individual.push({rune:truth,exceed,upperTail:(exceed+1)/(TRIALS+1)});
  }
  const worst=individual.slice().sort((a,b)=>b.upperTail-a.upperTail)[0];
  return {best:scored.slice(0,5),minDeviance:minimum,
    unknownMarkerWorstCaseTail:worst,
    EA:scored.find(x=>x.rune===28),simulatedNullPerMarker:TRIALS,
    nullCalibration:"All 29 possible true zero markers, best fit among 29 reselected each draw"};
}
function main(){
  const corpus=parseSharedCorpus();
  const words=corpus.words.map(w=>[...w.runes].map(r=>DATA.runes.indexOf(r)));
  assert.equal(words.length,2896);
  assert.equal(words.flat().length,12956);
  const target=observed(words);
  assert.deepEqual([target.first,target.inside,target.dFirst,target.dInside],
    [2895,10060,23,63]);
  const sources=[
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"]
  ];
  const random=rng(SEED),outputs=[];
  for(const [name,source] of sources){
    const text=R(source);
    for(const contractIng of [false,true]){
      const sourceWords=(gutenbergText(text).match(/[A-Za-z]+/g)||[])
        .map(w=>encode(w,contractIng)).filter(Boolean);
      const probabilitiesByLetter=probabilities(sourceWords,target.slots);
      const result=simulate(probabilitiesByLetter,target,random);
      outputs.push({name,contractIng,sourceSHA256:createHash("sha256")
        .update(text).digest("hex"),sourceWords:sourceWords.length,...result,
        positive:name==="Shakespeare"&&contractIng?
          fieldUnitPositive(sourceWords.slice(0,1200).flat(),random):undefined});
    }
  }
  return {hypothesis:"C_i-C_(i-1)=(P_i+1)*K_i mod29 with K_i nonzero, or an arbitrary fixed substitution of its zero mark",
    canonicalWords:words.length,canonicalRunes:corpus.runeCount,
    observed:{firstOpportunity:target.first,firstDuplicates:target.dFirst,
      interiorOpportunity:target.inside,interiorDuplicates:target.dInside},
    randomSeed:"0x"+SEED.toString(16),trialsPerTrueMarker:TRIALS,
    sources:outputs,
    interpretation:"Key-free necessary-condition check for GP-English, preserved whole-word boundaries. Does not exclude changing substitution by position, non-English plaintext or insertions."};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={encode,observed,probabilities,logBinomial,deviance,binomial,fieldUnitPositive,simulate,main};
