"use strict";
/**
 * Exact source-square palindrome necessary condition on the ORIGINAL p0 red
 * 8|5 GP29 ciphertext. Grants an arbitrary secret 29-way shift table from
 * the actual printed 2014 central 5x5 diagonal band to p0, WITHOUT supplying
 * a plaintext crib or choosing a shift key. Checks the pinned English word
 * source under both historical native and literal-letter GP spellings.
 * Also grants the independently established p56 transparent-literal-F rule.
 *
 * Windows 11 / Node22 / CommonJS.
 * Run: node sims/lp2_p0_dot13_allsecret_english_wordpair_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=filename=>fs.readFileSync(path.join(ROOT,filename),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originals=gp.pages.find(page=>page.page===0).indices.slice(0,13);
assert.deepEqual(originals,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const words=read("resources/control/english_wordfreq_textblob.txt").match(/^[a-z]+/gmi)||[];
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const singles=new Map(gp.translit.map((s,i)=>[s,i]));
const mod=v=>((v%29)+29)%29;

/** @param {string} input @param {"native"|"letter"} spelling @returns {number[]} */
function encodeWord(input,spelling){
  const word=input.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const result=[];
  for(let i=0;i<word.length;){
    if(spelling==="native"&&word.startsWith("ING",i)){
      result.push(21);i+=3;
    }else if(spelling==="native"&&word.startsWith("IO",i)){
      result.push(27);i+=2;
    }else if(spelling==="letter"){
      result.push(singles.get(word[i]));i++;
    }else{
      const token=tokens.find(item=>word.startsWith(item.s,i));
      assert.ok(token,word);
      result.push(token.i);i+=token.s.length;
    }
  }
  return result;
}

/** @param {string} spelling @returns {{eights:Map<string,string[]>,fives:Map<string,string[]>}} */
function lexicon(spelling){
  const eights=new Map(),fives=new Map();
  for(const word of words){
    const rune=encodeWord(word,spelling);
    const target=rune.length===8?eights:rune.length===5?fives:null;
    if(target){
      const key=rune.join(",");
      if(!target.has(key))target.set(key,[]);
      target.get(key).push(word);
    }
  }
  return {eights,fives};
}

/**
 * A palindrome of the 13 original square values forces additive
 * shifts K[i] === K[12-i] for all mirror pairs with non-literal-F
 * plaintext. Test source-native word pairs WITHOUT knowing f(value).
 * @param {number[]} cipher
 * @param {Map<string,string[]>} firstWords
 * @param {Map<string,string[]>} secondWords
 * @param {boolean} literalF
 */
function screen(cipher,firstWords,secondWords,literalF){
  assert.equal(cipher.length,13);
  let internalSurvivors=0,exceptionAtSeven=0;
  const matches=[];
  for(const [signature,names] of firstWords){
    const first=signature.split(",").map(Number);
    if(literalF && first.some((v,i)=>v===0&&cipher[i]!==0))continue;
    const bypass=literalF&&first[7]===0;
    if(!bypass && mod(first[5]-first[7])!==mod(cipher[5]-cipher[7]))continue;
    internalSurvivors++;
    if(bypass)exceptionAtSeven++;
    const second=Array(5);
    for(let i=0;i<5;i++)
      second[4-i]=mod(first[i]-cipher[i]+cipher[12-i]);
    if(literalF && second.some((v,i)=>v===0&&cipher[i+8]!==0))continue;
    const names2=secondWords.get(second.join(","));
    if(names2)matches.push({first:names[0],second:names2[0],firstGP:first,secondGP:second});
  }
  return {internalSurvivors,exceptionAtSeven,matchedDistinctPairs:matches.length,matches};
}

/** @param {number[]} plaintext @param {number[]} symmetricKey @param {boolean} literalF */
function encrypt(plaintext,symmetricKey,literalF){
  return plaintext.map((v,i)=>literalF&&v===0?0:mod(v+symmetricKey[i]));
}

function main(){
  const source=read("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/)
    .map(block=>block.trim().split(/\r?\n/)
      .map(row=>row.trim().split(/\s+/).map(Number)));
  assert.deepEqual(source.map(square=>square.length),[5,7,5]);
  for(const si of [0,2]){
    const square=source[si],band=[];
    for(const delta of [1,0,-1])
      for(let row=0;row<5;row++){
        const column=row-delta;
        if(column>=0&&column<5)band.push(square[row][column]);
      }
    assert.equal(band.length,13);
    for(let i=0;i<6;i++)assert.equal(band[i],band[12-i]);
  }
  const sourceBand=[];
  for(const delta of [1,0,-1])
    for(let row=0;row<5;row++){
      const column=row-delta;
      if(column>=0&&column<5)sourceBand.push(source[0][row][column]);
    }
  const key=sourceBand.map(v=>v%29);
  const results={};
  for(const spelling of ["native","letter"]){
    const {eights,fives}=lexicon(spelling);
    const normal=screen(originals,eights,fives,false);
    const transparent=screen(originals,eights,fives,true);
    assert.equal(normal.matchedDistinctPairs,0);
    assert.equal(transparent.matchedDistinctPairs,0);
    const totalCounts={native:[4325,3613,153,137],letter:[4472,2940,169,152]}[spelling];
    assert.deepEqual([eights.size,fives.size,normal.internalSurvivors,
      transparent.internalSurvivors],totalCounts);

    // Positive original-source control: construct an actual English-source
    // 8|5 GP phrase and encrypt it with the 2014 source-square diagonal
    // numeric key. The same key-free lexical reader must admit the phrase.
    const phrase=["epiphany","seeks"].map(w=>encodeWord(w,spelling));
    assert.deepEqual(phrase.map(x=>x.length),[8,5]);
    const clear=phrase.flat();
    for(const literalF of [false,true]){
      const plant=encrypt(clear,key,literalF);
      const positive=screen(plant,eights,fives,literalF);
      assert(positive.matches.some(x=>x.first==="epiphany"&&x.second==="seeks"));
    }
    results[spelling]={
      distinctSourceWords8:eights.size,distinctSourceWords5:fives.size,
      allConsumed:normal,transparentF:transparent,positivePlants:2
    };
  }
  // Independent pinned source-language control: Latin Vulgate source-word
  // GP29 spellings, with exactly the manuscript's whole-word boundaries.
  const latinAlphabet="0123456789ABCDEFGHIJKLMNOPQRS";
  const latinSource=read("resources/control/latin-vulgate-gp-wholewords.txt")
    .split(/\r?\n/).filter(line=>/^[0-9A-S]{5}$|^[0-9A-S]{8}$/.test(line));
  const latin={eights:new Map(),fives:new Map()};
  for(const code of latinSource){
    const target=code.length===8?latin.eights:latin.fives;
    const key=[...code].map(ch=>latinAlphabet.indexOf(ch)).join(",");
    if(!target.has(key))target.set(key,[]);
    target.get(key).push(code);
  }
  assert.deepEqual([latin.eights.size,latin.fives.size],[1130,793]);
  const latinNormal=screen(originals,latin.eights,latin.fives,false);
  const latinTransparent=screen(originals,latin.eights,latin.fives,true);
  for(const check of [latinNormal,latinTransparent]){
    assert.equal(check.matchedDistinctPairs,1);
    assert.equal(check.matches[0].first,"5I41A5IF");
    assert.equal(check.matches[0].second,"JO42O");
  }
  const latinFull=read("resources/control/latin-vulgate-latin26-wholewords.txt");
  assert.ok(latinFull.includes("CERVICES"));
  assert.ok(latinFull.includes("MARTHA"));
  assert.equal(latinFull.includes("CERVICES MARTHA"),false);
  results.latinVulgate={
    distinctSourceWords8:latin.eights.size,distinctSourceWords5:latin.fives.size,
    allConsumed:latinNormal,transparentF:latinTransparent,
    oneConditionalNormalizedPair:"CERVICES MARTHA",
    attestedAdjacentSourcePhrase:false
  };

  console.log(JSON.stringify({
    status:"PASS",source:"Original 2014 two 5x5 numerical squares, original p0 13 glyphs, pinned TextBlob English wordfreq.",
    originalCipher:originals,geometry:"rotated 4|5|4 source square band is symmetric",
    results,decision:"No original 8+5 English word pair in either fixed spelling convention is compatible with ANY stationary symmetric additive GP29 key, with or without plaintext-literal-F bypass; the independent Latin Vulgate whole-word corpus admits exactly one unattested and ungrammatical cross-sample pair, CERVICES MARTHA. This is a finite language-source coverage decision, not recovery of unknown plaintext."
  },null,2));
}
if(require.main===module)main();
module.exports={encodeWord,lexicon,screen,encrypt};
