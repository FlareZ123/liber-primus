'use strict';

/**
 * Key-independent first/last-rune reuse discriminator for a historically
 * motivated wordwise key-pointer reversal: signed 2016 "numbers direction";
 * previous-word GP prime-sum parity determines direction; backward words
 * step back before first read (external direction convention h=1,m=0,c=0).
 *
 * At every forward->backward word turn the same hidden keystream symbol is
 * reused at the last GP rune of the previous word and the first GP rune of
 * the next. Therefore Cfirst-Clast=Pfirst-Plast (mod29), independent of
 * the secret key stream. Collision retry affects only a small fraction
 * of these pairs, measured by positive plants.
 *
 * Read-only original source, Windows Node.js 22, CommonJS; no dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} s */
const read=s=>fs.readFileSync(path.join(ROOT,s),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt');
const gibran=read('resources/control/gibran_prophet_58585.txt');
const shakespeare=read('resources/control/shakespeare_first300k.txt');
const prime=corpus.prime||corpus.primes;
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const spellMap=new Map(corpus.translit.map((r,i)=>[r,i]));
const digs=corpus.translit.filter(s=>s.length>1)
  .sort((a,b)=>b.length-a.length);

/** @param {string} text */
function sourceWords(text) {
  /** @type {number[][]} */
  const words=[];
  let word=[];
  const finish=()=>{if(word.length){words.push(word);word=[];}};
  for(const g of text.split('%').slice(0,55).join('%')) {
    if(runeMap.has(g))word.push(runeMap.get(g));
    else if(g==='%'||g==='/'||/\s/u.test(g)){}
    else finish();
  }
  finish();
  return words;
}

/** @param {string} text */
function encodedEnglish(text) {
  const raws=text.match(/[A-Za-z]+/g)||[];
  return raws.map(raw=>{
    const word=raw.toUpperCase()
      .replace(/QU/g,'CW').replace(/K/g,'C')
      .replace(/V/g,'U').replace(/Z/g,'S');
    const result=[];
    for(let i=0;i<word.length;) {
      const dig=digs.find(s=>word.startsWith(s,i));
      if(dig){result.push(spellMap.get(dig));i+=dig.length;}
      else if(spellMap.has(word[i])){
        result.push(spellMap.get(word[i]));i++;
      }else i++;
    }
    return result;
  }).filter(x=>x.length);
}

/** @param {number[]} word */
function gpSum(word) {return word.reduce((sum,r)=>sum+prime[r],0);}

/**
 * The first word reads forward. Every later direction is computed from
 * only the *previous ciphertext word* and is hence encoder-causal.
 * @param {number[][]} ciphertextWords
 */
function turnScore(ciphertextWords,weights) {
  const hist=Array(29).fill(0);
  let direction=1;
  for(let i=1;i<ciphertextWords.length;i++) {
    const next=gpSum(ciphertextWords[i-1])%2===0?1:-1;
    if(direction===1&&next===-1) {
      const diff=(ciphertextWords[i][0]
        -ciphertextWords[i-1].at(-1)+29)%29;
      hist[diff]++;
    }
    direction=next;
  }
  const n=hist.reduce((a,b)=>a+b,0);
  const score=hist.reduce((a,count,i)=>a+count*weights[i],0);
  return {n,score,perEvent:score/n,hist};
}

/** @param {number} seed */
function random(seed) {
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return(state>>>0)/4294967296;
  };
}

/**
 * Independent forward simulator: a hidden length-50k random GP29 key, one
 * read per attempt, reverse at word boundaries by previous ciphertext GP
 * prime-sum parity. On a repeated tentative ciphertext symbol, retry with
 * probability 0.81 (maximum five retries), as in the source keyed
 * antirepeat pointer hypothesis. Maintains actual key-position identities.
 *
 * @param {number[][]} nativeWords
 * @param {number} seed
 */
function plant(nativeWords,seed) {
  const rng=random(seed);
  const key=Uint8Array.from({length:50000},()=>Math.floor(rng()*29));
  let pointer=20000,previous=null,oldDir=null,oldLastKey=null;
  const encoded=[];
  let expectedTurns=0,trueReuses=0,allGlyphs=0;
  for(let w=0;w<nativeWords.length;w++) {
    const dir=w===0?1:(gpSum(encoded[w-1])%2===0?1:-1);
    if(dir===-1)pointer--;
    const cipher=[],firstKey=[],usedKeys=[];
    for(const plain of nativeWords[w]) {
      let cc,used,tries=0;
      do {
        used=pointer;
        assert.ok(pointer>=0&&pointer<key.length);
        cc=(plain+key[pointer])%29;
        pointer+=dir;
        tries++;
      }while(previous!==null&&cc===previous&&rng()<0.81&&tries<6);
      cipher.push(cc);
      usedKeys.push(used);
      previous=cc;
      allGlyphs++;
      // The final key draw is the one that emitted the glyph.
      assert.equal(cc,(plain+key[used])%29);
    }
    if(oldDir===1&&dir===-1) {
      expectedTurns++;
      if(usedKeys[0]===oldLastKey)trueReuses++;
    }
    oldDir=dir;
    oldLastKey=usedKeys.at(-1);
    encoded.push(cipher);
  }
  return {
    words:encoded,
    runes:allGlyphs,
    turns:expectedTurns,
    trueReuses
  };
}

const source=sourceWords(transcript);
assert.equal(source.length,2896);
assert.equal(source.flat().length,12956);
assert.deepEqual(source.flat(),corpus.pages.filter(p=>p.page<=55)
  .flatMap(p=>p.indices));
const GW=encodedEnglish(gibran);
const SW=encodedEnglish(shakespeare);
assert.equal(GW.length,15733);
assert.equal(SW.length,55407);
const counts=Array(29).fill(1);
for(let i=1;i<SW.length;i++){
  const diff=(SW[i][0]-SW[i-1].at(-1)+29)%29;
  counts[diff]++;
}
const total=counts.reduce((a,b)=>a+b,0);
const weights=counts.map(c=>Math.log(29*c/total));
const real=turnScore(source,weights);
assert.equal(real.n,734);
assert.ok(Math.abs(real.score-(-22.130215165462026))<1e-8);
assert.deepEqual(real.hist,
  [7,26,37,19,25,26,25,26,18,32,26,23,25,28,31,26,25,
   22,28,28,20,29,21,23,33,29,21,29,26]);

const byLength=new Map();
for(const word of GW){
  const n=word.length;
  if(!byLength.has(n))byLength.set(n,[]);
  byLength.get(n).push(word);
}
const simulations=[];
for(let trial=0;trial<100;trial++){
  const used=new Map();
  const words=source.map(sourceWord=>{
    const n=sourceWord.length;
    const choices=byLength.get(n);
    assert.ok(choices&&choices.length);
    const k=used.get(n)||0;
    used.set(n,k+1);
    return choices[(k*67+trial*131)%choices.length];
  });
  assert.deepEqual(words.map(w=>w.length),source.map(w=>w.length));
  const planted=plant(words,0x423301+trial*271);
  const scored=turnScore(planted.words,weights);
  assert.equal(scored.n,planted.turns);
  simulations.push({...scored,turns:planted.turns,
    trueReuses:planted.trueReuses});
}
const ordered=simulations.map(x=>x.score).sort((a,b)=>a-b);
const below=simulations.filter(x=>x.score<=real.score).length;
const matchedReuses=simulations.reduce((s,x)=>s+x.trueReuses,0);
const matchedTurns=simulations.reduce((s,x)=>s+x.turns,0);
assert.equal(below,0);
assert.ok(Math.abs(ordered[0]-(-3.2494789753379045))<1e-8);
assert.ok(Math.abs(ordered[49]-14.943411310424967)<1e-8);
assert.ok(Math.abs(ordered[99]-35.033727606272485)<1e-8);
assert.ok(Math.abs(matchedReuses/matchedTurns-
  0.9642852296627994)<1e-9);
console.log(JSON.stringify({
  hypothesis:'Causal previous-word GP prime parity directs key pointer',
  pointerConvention:'h1/m0/c0 backward first step back; no interword move',
  original:{words:source.length,runes:12956,
    firstLastPredictedKeyReuseSites:real.n,
    nativeLogLikelihoodRatioVsFlatKey:real.score,
    nativeLLRPerEvent:real.perEvent,
    observedDifferenceResidues:real.hist},
  control:{nativeSource:'Gibran',nativeTrain:'disjoint Shakespeare',
    fullOriginalPrintedWordLengthOverlay:true,
    plants:simulations.length,
    originalSizeWords:source.length,
    scoreMin:ordered[0],scoreMedian:ordered[49],scoreMax:ordered[99],
    plantedAtOrBelowReal:below,
    keyIndexReuseFraction:matchedReuses/matchedTurns,
    originalScoresImpossibleUnderPlantedSample:true},
  interpretation:'Conditional source-native key-independent obstruction; not an exclusion of all direction rules/conventions or non-English plaintext'
},null,2));
