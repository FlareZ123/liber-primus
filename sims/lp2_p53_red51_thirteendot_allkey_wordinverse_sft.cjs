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
  decision:"source-selected 13-period fixed additive red-only key has zero " +
    "full native-word inverse on original p53, with no search clipping. " +
    "This is dictionary-conditional and does not identify other red ciphers."
}));
