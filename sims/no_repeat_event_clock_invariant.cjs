"use strict";
/**
 * Key-free event-clock phase test for GP28 no-repeat rank inversion.
 * 12 observable clock rules x two rank conventions x two reset scopes
 * x six key periods = 288 models with a full-family rotational null.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length)
  .map(p=>p.indices);
const PERIODS=[8,16,32,64,128,256];
const CLOCKS=["","D","T","S","E","DT","DS","DE","TS","TE","DTS","DTE"];
const NULL_COUNT=300,SEED=0x252563d1;
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.length,0),12956);

/** @param {number} seed @returns {()=>number} */
function randomizer(seed){let x=seed>>>0;return()=>{
  x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;
};}

/** @returns {number[][]} Canonical true word-local rune offsets. */
function originalWordOffsets(){
  const symbols=new Map(corpus.runes.map((x,i)=>[x,i]));
  const text=fs.readFileSync(path.join(ROOT,
    "resources/lp2-transcription.txt"),"utf8").split("%").slice(0,55).join("%");
  const offsets=pages.map(()=>[]),checked=pages.map(()=>[]);
  let currentPage=0,wordOffset=0;
  for(const ch of text){
    if(symbols.has(ch)){offsets[currentPage].push(wordOffset++);
      checked[currentPage].push(symbols.get(ch));}
    else if(ch==="%")currentPage++;
    else if(ch==="/"||/\s/u.test(ch)){}
    else wordOffset=0;
  }
  for(let i=0;i<pages.length;i++)
    assert.deepEqual(checked[i],pages[i],"Transcription does not match rune page "+i);
  return offsets;
}

/**
 * Within-page doublet D; word-local T(c[i-6]), lag5 E and S-only S.
 * Word-local source history crosses physical page/printed-line boundaries.
 * @param {number[][]} cipher @param {number[][]} offsets
 */
function deriveTags(cipher,offsets){
  const result=cipher.map(()=>[]);
  let history=[];
  for(let p=0;p<cipher.length;p++)for(let i=0;i<cipher[p].length;i++){
    const c=cipher[p][i],wordIndex=offsets[p][i];
    if(wordIndex===0)history=[];
    assert.equal(history.length,wordIndex);
    const T=wordIndex>=6&&c===(24-2*history[wordIndex-6]+58)%29;
    const E=wordIndex>=5&&c===history[wordIndex-5];
    const D=i>0&&c===cipher[p][i-1];
    result[p].push({D,T,E,S:E&&c===15});
    history.push(c);
  }
  return result;
}

/** @param {number} c @param {number} prev @param {number} type */
function rank(c,prev,type){
  return type===0 ? c-Number(c>prev) : (c-prev+29)%29-1;
}

/**
 * Every keyed output contributes a rank observation. For any selected event
 * X in the clock, skip the key increment and erase its potentially rewritten
 * rune. At unchanged key phases rank equality is unchanged by the unknown
 * additive 28-key and any one fixed internal alphabet permutation.
 * @param {number[][]} cipher @param {object[][]} tags
 * @param {string} clock @param {number} type
 * @param {number} scope @param {number} period
 */
function phaseScore(cipher,tags,clock,type,scope,period){
  const hist=Array.from({length:period},()=>new Uint16Array(28));
  let pointer=0,valid=0;
  for(let p=0;p<cipher.length;p++){
    if(scope===1)pointer=0;
    for(let i=0;i<cipher[p].length;i++){
      const c=cipher[p][i],d=i>0&&c===cipher[p][i-1];
      const tag=tags[p][i];
      const skip=[...clock].some(ch=>ch==="D"?d:tag[ch]);
      if(i>0&&!d&&!skip){
        hist[pointer%period][rank(c,cipher[p][i-1],type)]++;
        valid++;
      }
      if(!skip)pointer++;
    }
  }
  let same=0,pairs=0;
  for(const row of hist){
    let n=0;
    for(const x of row){n+=x;same+=x*(x-1);}
    pairs+=n*(n-1);
  }
  assert.ok(pairs);
  return {rate:same/pairs,nominalZ:(same-pairs/28)/Math.sqrt(pairs*27/784),
    same,pairs,valid};
}

/** @param {number[][]} cipher @param {object[][]} tags */
function scan(cipher,tags){
  const result=[];
  for(const clock of CLOCKS)for(let type=0;type<2;type++)
    for(let scope=0;scope<2;scope++)for(const period of PERIODS)
      result.push({clock:clock||"none",type:type?"cyclic":"sorted",
        scope:scope?"page":"continuous",period,
        ...phaseScore(cipher,tags,clock,type,scope,period)});
  return result.sort((a,b)=>b.nominalZ-a.nominalZ);
}

/**
 * Rotate both original runes and their attached event labels within each
 * physical page, preserving their empirical joint distribution. Doublet
 * events D are recomputed at the new page seam when scoring the null.
 * @param {number[][]} cipher @param {object[][]} tags
 * @param {()=>number} rng
 */
function rotate(cipher,tags,rng){
  const result={cipher:[],tags:[]};
  for(let p=0;p<cipher.length;p++){
    const k=Math.floor(rng()*cipher[p].length);
    result.cipher.push(cipher[p].slice(k).concat(cipher[p].slice(0,k)));
    result.tags.push(tags[p].slice(k).concat(tags[p].slice(0,k)));
  }
  return result;
}

/** @param {string} source */
function encodeEnglish(source){
  const DI={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:27};
  const LET={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,
    K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,
    W:7,X:14,Y:26,Z:15};
  const output=[];
  for(const word of source.toUpperCase().match(/[A-Z]+/g)){
    for(let i=0;i<word.length;i++){
      const d=DI[word.slice(i,i+2)];
      if(d!==undefined){output.push(d);i++;}
      else output.push(LET[word[i]]);
    }
    if(output.length>=12956)break;
  }
  assert.ok(output.length>=12956);
  return output.slice(0,12956);
}

/**
 * Genuine English-GP positive encrypted with a real unknown period key and
 * a deterministic event-clock consumption rule. The original LP2 doublet
 * positions are imposed as exactly 86 erasures. Other event flags are
 * detected from the actually emitted synthetic ciphertext.
 * @param {number[][]} original @param {number[][]} offsets
 * @param {string} clock @param {number} type @param {number} scope
 * @param {number} period
 */
function plant(original,offsets,clock,type,scope,period){
  const text=fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"),"utf8");
  const plaintext=encodeEnglish(text),rng=randomizer(SEED^0x1199bb77);
  const pad=Array.from({length:period},()=>Math.floor(rng()*28));
  const result=original.map(()=>[]);
  let history=[],pointer=0,sourcePos=0;
  for(let p=0;p<original.length;p++){
    if(scope===1)pointer=0;
    for(let i=0;i<original[p].length;i++){
      const offset=offsets[p][i];
      if(offset===0)history=[];
      assert.equal(history.length,offset);
      const inner=(plaintext[sourcePos++]+pad[pointer%period])%28;
      const prev=i?result[p][i-1]:null;
      let c=prev===null?inner:
        (type===0?(inner<prev?inner:inner+1):(prev+inner+1)%29);
      if(i>0&&original[p][i]===original[p][i-1])c=prev;
      const E=offset>=5&&c===history[offset-5];
      const tag={D:i>0&&c===prev,
        T:offset>=6&&c===(24-2*history[offset-6]+58)%29,
        E,S:E&&c===15};
      result[p].push(c);history.push(c);
      if(![...clock].some(ch=>tag[ch]))pointer++;
    }
  }
  assert.equal(sourcePos,12956);
  return {cipher:result,tags:deriveTags(result,offsets)};
}

function run(){
  const offsets=originalWordOffsets(),tags=deriveTags(pages,offsets);
  const events={D:0,T:0,S:0,E:0};
  for(const pg of tags)for(const tag of pg)
    for(const key of Object.keys(events))events[key]+=Number(tag[key]);
  assert.deepEqual(events,{D:86,T:80,S:11,E:104});
  const observed=scan(pages,tags);
  assert.equal(observed.length,288);
  const positives=[];
  for(const cfg of [
    {clock:"D",type:1,scope:0,period:256},
    {clock:"T",type:0,scope:1,period:8},
    {clock:"DTS",type:1,scope:0,period:64}
  ]){
    const synthetic=plant(pages,offsets,cfg.clock,cfg.type,cfg.scope,cfg.period);
    const score=phaseScore(synthetic.cipher,synthetic.tags,
      cfg.clock,cfg.type,cfg.scope,cfg.period);
    assert.ok(score.rate>0.050,"Positive source failed for "+cfg.clock);
    positives.push({...cfg,...score});
  }
  const rng=randomizer(SEED),winner=observed[0].nominalZ;
  const highestRaw=Math.max(...observed.map(x=>x.rate));
  let exceedZ=0,exceedRaw=0,sumZ=0,sumRaw=0;
  for(let i=0;i<NULL_COUNT;i++){
    const nullBook=rotate(pages,tags,rng);
    const scores=scan(nullBook.cipher,nullBook.tags);
    const maxZ=scores[0].nominalZ,maxRaw=Math.max(...scores.map(x=>x.rate));
    exceedZ+=Number(maxZ>=winner);
    exceedRaw+=Number(maxRaw>=highestRaw);
    sumZ+=maxZ;sumRaw+=maxRaw;
  }
  return {originalRunes:12956,modelCount:288,events,
    originalBest:observed.slice(0,24),originalMaxRaw:highestRaw,
    planted:positives,calibration:{seed:SEED,n:NULL_COUNT,
      maxNominalExceedances:exceedZ,
      pMaxNominal:(exceedZ+1)/(NULL_COUNT+1),
      maxRawExceedances:exceedRaw,
      pMaxRaw:(exceedRaw+1)/(NULL_COUNT+1),
      nullMeanMaxNominal:sumZ/NULL_COUNT,
      nullMeanMaxRaw:sumRaw/NULL_COUNT}};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={originalWordOffsets,deriveTags,phaseScore,
  scan,rotate,encodeEnglish,plant,run};
