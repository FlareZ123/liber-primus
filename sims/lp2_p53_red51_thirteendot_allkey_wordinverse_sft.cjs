"use strict";
/**
 * Original LP2 physical p53's red terminal 51-rune/12-word segment is
 * followed by an original red 13-dot delimiter. Its first 3 printed words
 * have 5+4+4=13 runes. Test the bounded, human-available proposal that
 * the color change resets one repeating 13-rune additive GP29 pad.
 *
 * C[t]=(P[t]+K[t%13]) mod29. The 11-rune fourth word alone fixes 11 of
 * the 13 secret pad symbols, including the five key symbols used by the
 * first printed word. Exhaust all source-native English 11-rune words
 * and test the first word EXACTLY. No key guessing, tuning or beam clipping.
 *
 * The search is dictionary-conditional; the 13 dots are a puzzle-design
 * hypothesis, not an established cipher specification. This program is
 * read-only, Windows Node22, CommonJS. No network.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8").replace(/\r\n/g,"\n");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const original=gp.pages.find(x=>x.page===53);
const annotation=annotations.pages.find(x=>x.page===53);
assert.equal(original.runic_count,179);
assert.deepEqual(annotation.red_spans.map(x=>[x.start,x.length]),[[128,51]]);
assert.deepEqual(annotation.large_punctuation,[[179,13,"red"]]);
const runeId=new Map(gp.runes.map((r,i)=>[r,i]));
// The canonical page-transcription omits p50 because it carries no runes;
// physical p53 therefore occupies the 52nd zero-index transcript chunk.
const physicalPages=read("resources/lp2-transcription.txt").split(/^%\s*$/m);
const raw=physicalPages[52].replace(/\/\n/g,"").replace(/\s+/g,"");
const wordPattern=new RegExp("["+gp.runes.join("")+"]+","gu");
const words=[];let pos=0;
for(const m of raw.matchAll(wordPattern)){
  const runes=Array.from(m[0],c=>runeId.get(c));
  words.push({start:pos,end:pos+runes.length,nums:runes});
  pos+=runes.length;
}
assert.equal(pos,179);
assert.deepEqual(words.flatMap(x=>x.nums),original.indices);
assert.equal(words.find(x=>x.start===128).start,128);
const redWords=words.filter(w=>w.start>=128).map(w=>({
  start:w.start-128,len:w.nums.length,nums:w.nums
}));
const EXPECTED=[5,4,4,11,2,3,2,6,5,5,2,2];
assert.deepEqual(redWords.map(x=>x.len),EXPECTED);
assert.equal(redWords.at(-1).start+redWords.at(-1).len,51);
const red=original.indices.slice(128);
assert.deepEqual(red,annotation.red_spans[0].runes.split("").map(r=>runeId.get(r)));
const P=13,M=29,mod=x=>((x%M)+M)%M;
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
/** @typedef {{nums:number[],display:string}} LexWord */
const unique=new Map();
/** @param {number[]} nums @param {string} display */
function add(nums,display){
  if(!nums.length||nums.length>24)return;
  const token=nums.map(n=>String.fromCharCode(65+n)).join("");
  if(!unique.has(token))unique.set(token,{nums,display});
}
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){
  const match=/^([a-z]+) (\d+)$/.exec(line);
  if(match)add(encodeSourceNativeGP(match[1]),match[1]);
}
// Authenticated original-runic GP spelling control, independent of the
// unsolved p53 text (solved LP1 physical pp10–13).
const solved=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const begin=solved.indexOf("ᚦᛖ-ᛚᚩᛋᛋ"),stop=solved.indexOf("\n$\n%\n",begin);
assert(begin>=0&&stop>begin);
for(const m of solved.slice(begin,stop).matchAll(wordPattern))
  add(Array.from(m[0],r=>runeId.get(r)),"solved-LP1-native");
const lex=Array.from({length:25},()=>[]);
const lookup=Array.from({length:25},()=>new Map());
for(const [k,w] of unique){lex[w.nums.length].push(w);lookup[w.nums.length].set(k,w);}
assert(lex[11].length>1000 && lex[5].length>3000);
const token=a=>a.map(n=>String.fromCharCode(65+n)).join("");
/**
 * @param {number[]} cipher 51 GP symbols
 * @param {number} start A complete original printed word's local offset
 * @param {number[]} plain Candidate word
 * @param {number[]} key 13 unknowns stored as -1
 * @returns {number[]|null}
 */
function assign(cipher,start,plain,key){
  const out=key.slice();
  for(let j=0;j<plain.length;j++){
    const slot=(start+j)%P,secret=mod(cipher[start+j]-plain[j]);
    if(out[slot]>=0&&out[slot]!==secret)return null;
    out[slot]=secret;
  }
  return out;
}
/** @param {number[]} cipher @param {number[]} key */
function impliedFirstWord(cipher,key){
  const a=Array.from({length:EXPECTED[0]},(_,j)=>mod(cipher[j]-key[j]));
  return lookup[EXPECTED[0]].get(token(a));
}
/**
 * Exhaust the anchor plus a deterministic exact native-word join.
 * Every candidate full plaintext must appear, because the 11-rune
 * anchor word is exhaustively enumerated in lex[11].
 *
 * @param {number[]} cipher
 * @param {number} maxSolutions
 */
function invert(cipher,maxSolutions=5){
  assert.equal(cipher.length,51);
  const initial=Array(P).fill(-1),anchor=redWords[3];
  const candidates=[],lastStats={anchorTypes:lex[11].length,
    firstWordSurvivors:0,firstTwoSurvivors:0,fullSolutions:0,
    nodes:0,truncated:false};
  for(const word of lex[11]){
    const k=assign(cipher,anchor.start,word.nums,initial);
    if(!k)continue; // Relevant if future anchor length exceeds 13.
    const first=impliedFirstWord(cipher,k);
    if(!first)continue;
    lastStats.firstWordSurvivors++;
    // Second complete word starts at local offset5 and ends at8:
    // all four pad positions are already fixed by the anchor.
    const second=redWords[1];
    const secondPlain=Array.from({length:second.len},(_,j)=>
      mod(cipher[second.start+j]-k[(second.start+j)%P]));
    if(!lookup[second.len].has(token(secondPlain)))continue;
    lastStats.firstTwoSurvivors++;
    const chosen=Array(EXPECTED.length).fill(null);
    chosen[0]=first;chosen[1]=lookup[second.len].get(token(secondPlain));
    chosen[3]=word;
    /** @param {number} i @param {number[]} state */
    function dfs(i,state){
      lastStats.nodes++;
      if(i===redWords.length){
        lastStats.fullSolutions++;
        if(candidates.length<maxSolutions)
          candidates.push({key:state,words:chosen.map(w=>w.display),
            plain:chosen.flatMap(w=>w.nums)});
        else lastStats.truncated=true;
        return;
      }
      if(chosen[i]){
        dfs(i+1,state);
        return;
      }
      const part=redWords[i];
      // Whenever every key digit in this word is already known,
      // use O(1) exact-dictionary recognition, with no word-score prior.
      const fullyKnown=Array.from({length:part.len},
        (_,j)=>state[(part.start+j)%P]).every(n=>n>=0);
      const choices=fullyKnown?
        [lookup[part.len].get(token(Array.from({length:part.len},(_,j)=>
          mod(cipher[part.start+j]-state[(part.start+j)%P]))))].filter(Boolean):
        lex[part.len];
      for(const candidate of choices){
        const next=assign(cipher,part.start,candidate.nums,state);
        if(!next)continue;
        chosen[i]=candidate;
        dfs(i+1,next);
        chosen[i]=null;
      }
    }
    dfs(2,k);
  }
  return {stats:lastStats,candidates};
}
/** @param {number[]} plain @param {number[]} key */
function encipher(plain,key){
  return plain.map((p,i)=>mod(p+key[i%P]));
}
function seeded(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
const random=seeded(0x33015313);
const key=Array.from({length:P},()=>random()%M);
const plantedWords=EXPECTED.map((n,i)=>lex[n][(13+i*137)%lex[n].length]);
const planted=plantedWords.flatMap(w=>w.nums);
assert.equal(planted.length,51);
const plantedCipher=encipher(planted,key);
const posResult=invert(plantedCipher);
assert(posResult.stats.fullSolutions>=1);
assert(posResult.candidates.some(s=>token(s.plain)===token(planted)
 && s.key.every((n,i)=>n===key[i])));
const independentPad=Array.from({length:51},()=>random()%M);
const randomMasked=planted.map((p,i)=>mod(p+independentPad[i]));
const wrong=invert(randomMasked);
assert.equal(wrong.stats.fullSolutions,0);
const actual=invert(red);
assert.equal(actual.stats.firstWordSurvivors,0);
assert.equal(actual.stats.firstTwoSurvivors,0);
assert.equal(actual.stats.fullSolutions,0);
assert.equal(actual.stats.truncated,false);

/**
 * Plaintext-autokey alternative at the SAME source-selected 13-dot clock.
 *
 * C[t]=P[t]+sign*P[t-13] mod29 for t>=13. The independent first13
 * cipher cells are encrypted under an arbitrary 13-rune primer.
 * Given each candidate complete 11-rune fourth word P[13..23],
 * the recurrence fixes P[0..10] and the first two whole words BEFORE
 * considering the two missing primer runes P[11..12]. Exhaust both signs.
 *
 * @param {number[]} cipher
 * @param {number} sign 1 or -1, source-frozen finite convention
 */
function invertPlainAutokey(cipher,sign){
  const stats={sign,anchorTypes:lex[11].length,firstWordSurvivors:0,
    firstTwoSurvivors:0,thirdWordSurvivors:0,fullSolutions:0};
  const solutions=[];
  for(const anchor of lex[11]){
    const plain=Array(51).fill(-1);
    for(let j=0;j<11;j++){
      plain[13+j]=anchor.nums[j];
      plain[j]=mod(sign*(cipher[13+j]-plain[13+j]));
    }
    if(!lookup[5].has(token(plain.slice(0,5))))continue;
    stats.firstWordSurvivors++;
    if(!lookup[4].has(token(plain.slice(5,9))))continue;
    stats.firstTwoSurvivors++;
    // The third 4-rune word starts at rune9. The first two runes are
    // already fixed by the eleven-symbol fourth-word anchor.
    for(const third of lex[4]){
      if(third.nums[0]!==plain[9]||third.nums[1]!==plain[10])continue;
      stats.thirdWordSurvivors++;
      plain[11]=third.nums[2];plain[12]=third.nums[3];
      for(let j=24;j<51;j++)
        plain[j]=mod(cipher[j]-sign*plain[j-13]);
      const display=[];
      let valid=true;
      for(const word of redWords){
        const lexWord=lookup[word.len].get(token(plain.slice(
          word.start,word.start+word.len)));
        if(!lexWord){valid=false;break;}
        display.push(lexWord.display);
      }
      if(!valid)continue;
      const primer=Array.from({length:13},(_,j)=>mod(cipher[j]-plain[j]));
      const replay=Array.from({length:51},(_,j)=>j<13?
        mod(plain[j]+primer[j]):mod(plain[j]+sign*plain[j-13]));
      assert.deepEqual(replay,cipher);
      stats.fullSolutions++;
      if(solutions.length<5)solutions.push({plain:plain.slice(),
        primer,words:display});
    }
  }
  return {stats,solutions};
}
/**
 * Ciphertext-autokey alternative: after the first 13 arbitrary primer
 * slots, P[t] = C[t]-sign*C[t-13]. The first complete 11-rune word
 * after t13 is itself a direct original-cipher independent prediction.
 */
function invertCipherAutokey(cipher,sign){
  const post=Array.from({length:51},(_,j)=>j<13?null:
    mod(cipher[j]-sign*cipher[j-13]));
  const fourth=post.slice(13,24);
  let valid=0;
  if(lookup[11].has(token(fourth))){
    valid=redWords.slice(3).filter(w=>
      lookup[w.len].has(token(post.slice(w.start,w.start+w.len)))).length;
  }
  return {sign,firstPredictedWord:fourth.map(n=>gp.translit[n]).join(""),
    fourthDictionaryMatch:lookup[11].has(token(fourth)),
    sourceCompleteWordsValidated:valid,post};
}
function cipherAutokeyEncrypt(plain,primer,sign){
  const c=[];
  for(let j=0;j<plain.length;j++)
    c.push(mod(plain[j]+(j<13?primer[j]:sign*c[j-13])));
  return c;
}
function plainAutokeyEncrypt(plain,primer,sign){
  return plain.map((v,j)=>mod(v+(j<13?primer[j]:sign*plain[j-13])));
}
const autokeyControls=[],autokeyOriginal=[];
for(const sign of [-1,1]){
  const primer=Array.from({length:13},()=>random()%29);
  const plantedPlain=plainAutokeyEncrypt(planted,primer,sign);
  const found=invertPlainAutokey(plantedPlain,sign);
  assert(found.stats.fullSolutions>=1);
  assert(found.solutions.some(x=>token(x.plain)===token(planted)
    &&x.primer.every((v,i)=>v===primer[i])));
  const plantedCipher=cipherAutokeyEncrypt(planted,primer,sign);
  const predicted=invertCipherAutokey(plantedCipher,sign);
  assert(predicted.fourthDictionaryMatch);
  assert.deepEqual(predicted.post.slice(13),planted.slice(13));
  const realPlain=invertPlainAutokey(red,sign);
  const realCipher=invertCipherAutokey(red,sign);
  assert.equal(realPlain.stats.firstTwoSurvivors,0);
  assert.equal(realPlain.stats.fullSolutions,0);
  assert.equal(realCipher.fourthDictionaryMatch,false);
  autokeyControls.push({sign,plainFeedback:found.stats,
    authenticGP51Recovery:true,cipherFeedback:{
      fourthDictionaryMatch:predicted.fourthDictionaryMatch,
      postPrimer38Exact:true}});
  autokeyOriginal.push({sign,plainFeedback:realPlain.stats,
    cipherFeedback:{fourthDictionaryMatch:realCipher.fourthDictionaryMatch,
      predictedFourth:realCipher.firstPredictedWord}});
}


/**
 * Exhaust the native-field affine extension
 * C[t] = scalar*P[t]+K[t mod 13] (mod29), scalar in F29^*.
 *
 * The source-specific 11-rune long word fixes the first 11 phases of
 * the otherwise arbitrary 13-element pad. The first/second words are
 * independent dictionary holdouts, BEFORE fitting the last two phases.
 */
const inv29=Array(29).fill(-1);
for(let a=1;a<29;a++)
  for(let b=1;b<29;b++)
    if(a*b%29===1)inv29[a]=b;
assert(inv29.slice(1).every(v=>v>0));
function inverseAffine(cipher) {
  const stats={scalars:28,anchorTypes:lex[11].length,
    combinations:28*lex[11].length,firstWordSurvivors:0,
    firstTwoSurvivors:0,fullSolutions:0};
  const solutions=[];
  for(let scalar=1;scalar<29;scalar++){
    const ai=inv29[scalar];
    for(const anchor of lex[11]){
      const k=Array(P).fill(-1);
      for(let i=0;i<11;i++)
        k[i]=mod(cipher[13+i]-scalar*anchor.nums[i]);
      const partial=(start,len)=>Array.from({length:len},(_,j)=>
        mod(ai*(cipher[start+j]-k[start+j])));
      const one=partial(0,5),two=partial(5,4);
      if(!lookup[5].has(token(one)))continue;
      stats.firstWordSurvivors++;
      if(!lookup[4].has(token(two)))continue;
      stats.firstTwoSurvivors++;
      const partialThird=partial(9,2);
      for(const third of lex[4]){
        if(third.nums[0]!==partialThird[0]||
           third.nums[1]!==partialThird[1])continue;
        k[11]=mod(cipher[11]-scalar*third.nums[2]);
        k[12]=mod(cipher[12]-scalar*third.nums[3]);
        const plain=Array.from({length:51},(_,j)=>
          mod(ai*(cipher[j]-k[j%P])));
        const fullWords=redWords.map(w=>lookup[w.len].get(token(
          plain.slice(w.start,w.start+w.len))));
        if(fullWords.some(w=>!w))continue;
        assert.deepEqual(plain.slice(13,24),anchor.nums);
        assert.deepEqual(encipherAffine(plain,k,scalar),cipher);
        stats.fullSolutions++;
        if(solutions.length<5)solutions.push({scalar,key:k.slice(),
          plain,words:fullWords.map(w=>w.display)});
      }
    }
  }
  return {stats,solutions};
}
function encipherAffine(plain,key,scalar){
  return plain.map((p,i)=>mod(scalar*p+key[i%13]));
}
/**
 * Exhaust multiplicative nonzero GP29 source-unit keys:
 * C[t]=P[t]*K[t mod13] (mod29), with all 13 K units in 1..28.
 *
 * Source/power gate: original anchor ciphertext C[13..23] has no zeros;
 * hence any valid 11-rune anchor plaintext has no GP-F and uniquely
 * determines eleven multiplicative unit keys. Unknown slots K[11/12]
 * are exhaustively enumerated on the three-rune primer continuation.
 */
function inverseMultiplicative(cipher){
  assert(cipher.slice(13,24).every(x=>x>0),
    "Original and planted anchor ciphertext must be nonzero");
  const stats={anchorTypes:lex[11].length,admissibleAnchorTypes:0,
    firstWordSurvivors:0,firstTwoSurvivors:0,fullSolutions:0};
  const solutions=[];
  for(const anchor of lex[11]){
    if(anchor.nums.includes(0))continue;
    stats.admissibleAnchorTypes++;
    const k=Array(P).fill(0);
    for(let i=0;i<11;i++)k[i]=(cipher[13+i]*inv29[anchor.nums[i]])%29;
    const part=(start,len)=>Array.from({length:len},(_,j)=>
      cipher[start+j]*inv29[k[start+j]]%29);
    const first=part(0,5),second=part(5,4);
    if(!lookup[5].has(token(first)))continue;
    stats.firstWordSurvivors++;
    if(!lookup[4].has(token(second)))continue;
    stats.firstTwoSurvivors++;
    const knownThird=part(9,2);
    for(const third of lex[4]){
      if(third.nums[0]!==knownThird[0]||
        third.nums[1]!==knownThird[1])continue;
      /** Complete all keys, including source F=0/C=0 exceptions. */
      const keyChoices=[];
      for(let q=2;q<4;q++){
        const t=9+q,plain=third.nums[q],c=cipher[t];
        if(plain===0){keyChoices.push(c===0?
          Array.from({length:28},(_,i)=>i+1):[]);}
        else keyChoices.push(c===0?[]:[c*inv29[plain]%29].filter(x=>x>0));
      }
      for(const a of keyChoices[0])for(const b of keyChoices[1]){
        k[11]=a;k[12]=b;
        const plain=Array.from({length:51},(_,i)=>
          cipher[i]*inv29[k[i%P]]%29);
        const fullWords=redWords.map(w=>lookup[w.len].get(token(
          plain.slice(w.start,w.start+w.len))));
        if(fullWords.some(w=>!w))continue;
        assert.deepEqual(plain.slice(13,24),anchor.nums);
        assert.deepEqual(encipherMultiplicative(plain,k),cipher);
        stats.fullSolutions++;
        if(solutions.length<5)solutions.push({key:k.slice(),plain,
          words:fullWords.map(w=>w.display)});
      }
    }
  }
  return {stats,solutions};
}
function encipherMultiplicative(plain,key){
  return plain.map((v,i)=>v*key[i%13]%29);
}
const scalarControl=15,affinePad=Array.from({length:13},()=>random()%29);
const affineCipher=encipherAffine(planted,affinePad,scalarControl);
const affinePositive=inverseAffine(affineCipher);
assert(affinePositive.stats.fullSolutions>=1);
assert(affinePositive.solutions.some(x=>x.scalar===scalarControl
  &&token(x.plain)===token(planted)
  &&x.key.every((a,i)=>a===affinePad[i])));
const affineReal=inverseAffine(red);
assert.equal(affineReal.stats.firstTwoSurvivors,0);
assert.equal(affineReal.stats.fullSolutions,0);
const unitPad=Array.from({length:13},()=>1+(random()%28));
assert(planted.slice(13,24).every(x=>x!==0));
const multiplicativeCipher=encipherMultiplicative(planted,unitPad);
const multiplicativePositive=inverseMultiplicative(multiplicativeCipher);
assert(multiplicativePositive.stats.fullSolutions>=1);
assert(multiplicativePositive.solutions.some(x=>token(x.plain)===token(planted)
  &&x.key.every((v,i)=>v===unitPad[i])));
const multiplicativeReal=inverseMultiplicative(red);
assert.equal(multiplicativeReal.stats.firstWordSurvivors,0);
assert.equal(multiplicativeReal.stats.fullSolutions,0);


/**
 * Visually distinct two-step gate motivated by TWO original graphic
 * coordinates: red p53 ends with 13 dots and 51 runes, next physical
 * p54 starts with ONE oversized red A. 51+1=52=4*13. The appended
 * original A occupies the unique bottom-right cell, which stays LAST
 * under either natural 4x13 row/column reading direction.
 *
 * Freeze a single column transpose + arbitrary repeated 13-additive GP
 * key in both reciprocal natural read directions. An exhaustive
 * 11-rune fourth-word anchor fixes the FIRST two plaintext words,
 * independent of two missing key symbols. No language search ranking,
 * no fitted padding symbol, no phase shift, no deletion other than the
 * one source-marked oversized A.
 */
const p54BigA=gp.pages.find(x=>x.page===54).indices[0];
assert.equal(p54BigA,24);
function readSquare52(vals,mode){
  assert.equal(vals.length,52);
  const out=[];
  if(mode==="row-to-column"){
    for(let col=0;col<13;col++)
      for(let row=0;row<4;row++)out.push(vals[row*13+col]);
  }else if(mode==="column-to-row"){
    for(let row=0;row<4;row++)
      for(let col=0;col<13;col++)out.push(vals[col*4+row]);
  }else throw Error("unknown frozen source route");
  assert.equal(out.length,52);
  assert.equal(out[51],vals[51]);
  return out;
}
function source13AnchorStats(cipher){
  assert.equal(cipher.length,51);
  const result={longWordTypes:lex[11].length,
    firstWordSurvivors:0,firstTwoSurvivors:0};
  for(const anchored of lex[11]){
    const K=anchored.nums.map((v,j)=>mod(cipher[13+j]-v));
    const first=Array.from({length:5},(_,j)=>mod(cipher[j]-K[j]));
    if(!lookup[5].has(token(first)))continue;
    result.firstWordSurvivors++;
    const second=Array.from({length:4},(_,j)=>mod(cipher[5+j]-K[5+j]));
    if(lookup[4].has(token(second)))result.firstTwoSurvivors++;
  }
  return result;
}
const column13=[];
for(const [mode,inverse] of [
  ["row-to-column","column-to-row"],
  ["column-to-row","row-to-column"],
]){
  const actualPadded=readSquare52(red.concat([p54BigA]),mode);
  const originalStats=source13AnchorStats(actualPadded.slice(0,51));
  assert.equal(originalStats.firstTwoSurvivors,0);
  const knownCipher52=encipher(planted,key).concat([p54BigA]);
  const reconstructedSource=readSquare52(knownCipher52,inverse);
  const recovered=readSquare52(reconstructedSource,mode);
  assert.deepEqual(recovered,knownCipher52);
  const positiveStats=source13AnchorStats(recovered.slice(0,51));
  assert(positiveStats.firstTwoSurvivors>=1);
  column13.push({mode,original:originalStats,
    exact51GPPositive:true,planted:positiveStats});
}

console.log("summary",JSON.stringify({
  original:{physicalPage:53,redOffset:128,runes:51,redWordLengths:EXPECTED,
    punctuationDots:13,anchorStart:13,anchorLength:11,
    firstWordStart:0,firstWordLength:5},
  model:"one additive GP29 key of 13 symbols repeating over independent red text",
  lexicon:{unique:unique.size,words11:lex[11].length,
    words5:lex[5].length,solvedGPControl:181},
  planted:{authenticEnglishGpRunes:planted.length,key,
    truePlainWords:plantedWords.map(w=>w.display),search:posResult.stats,
    exactRecovery:true,exactForwardReplay:encipher(planted,key).every(
      (v,i)=>v===plantedCipher[i])},
  independentPadNegative:wrong.stats,
  originalCipher:actual.stats,
  autokeyControls,autokeyOriginal,
  fieldAffine:{planted:affinePositive.stats,original:affineReal.stats,
    scalarControl},
  fieldMultiplicative:{planted:multiplicativePositive.stats,
    original:multiplicativeReal.stats},
  red51PlusP54BigA4by13ColumnAndAdditive13:column13,
  decision:"No native-word inverse for p53 red51 under the source-selected " +
    "13-rune repeated additive, 13-lag plaintext autokey (+/-), " +
    "13-lag ciphertext autokey (+/-), 28-scalar affine/additive " +
    "or multiplicative unit-pad models. All original-native GP controls pass. " +
    "Finite-dictionary-conditional; no genuine red plaintext or key recovered."
}));
