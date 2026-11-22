"use strict";

/**
 * Test a concrete, historically motivated two-operation LP2 solve path:
 *    2014 Stage03 14-column printed-WORD reorder (both directions),
 *    then authentic p56 plaintext-F-transparent prime-totient GP29 inverse.
 *
 * Exactly 5,000 initial prime indices are searched per untouched visual
 * chapter, with exhaustive F-skip reachability. Complete survivors are
 * subjected to an independently frozen native GP English bigram model.
 * Original solved p56 and true 14-column plants are positive controls.
 * SFT: Windows Node22 CommonJS, no npm dependencies, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const Shakespeare = read("resources/control/shakespeare_first300k.txt");
const Gibran = read("resources/control/gibran_prophet_58585.txt");
const indices = new Map(gp.runes.map((r, i) => [r, i]));
const sizes = [158,255,383,437,224,326,378,669,66];
const widths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const order = [2,8,9,1,12,13,11,4,5,7,3,0,6,10];
const K = 5000;
const expected = {
  historicalDecode: {
    maxima:[603,426,614,571,546,548,463,595,308],
    starts:[1514,943,1989,2133,2365,2217,2137,1586,4456],
    completed:[[],[],[],[],[],[],[],[],[4456]]
  },
  historicalEncrypt: {
    maxima:[729,433,554,560,509,664,505,921,308],
    starts:[3442,1163,432,3116,3830,1208,4712,2161,3498],
    completed:[[3442,3444,3445,3446],[],[],[],[],[],[],[],[3498,4563]]
  }
};
/** @returns {number[][]} */
function printedWords() {
  const words = [];
  let word = [], count = 0;
  for (const char of raw) {
    if (indices.has(char)) {
      word.push(indices.get(char));
      count++;
      if (count === 12956) {words.push(word); break;}
    } else if ("-.&".includes(char) && word.length) {
      words.push(word);
      word = [];
    }
  }
  assert.equal(count, 12956);
  assert.equal(words.length, 2896);
  assert.deepEqual(words.flat(), gp.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices || []));
  return words;
}
const words = printedWords();
let index = 0;
const chapters = sizes.map((size, j) => {
  const result = words.slice(index, index+size);
  index += size;
  assert.equal(result.flat().length, widths[j]);
  return result;
});
assert.equal(index, 2896);

/**
 * The inverse in a partial final row must use the restricted 14-permutation.
 * @template T
 * @param {T[]} sequence
 * @param {boolean} decode
 * @returns {T[]}
 */
function shuffle14(sequence, decode) {
  const out = [];
  for (let i = 0; i < sequence.length; i += 14) {
    const row = sequence.slice(i,i+14);
    const perm = order.filter(j => j < row.length);
    const next = Array(row.length);
    for (let j = 0; j < perm.length; j++) {
      if (decode) next[j] = row[perm[j]];
      else next[perm[j]] = row[j];
    }
    out.push(...next);
  }
  return out;
}
const historicalCipher = "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ";
const historicalPlain = "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";
assert.equal(shuffle14(Array.from(historicalCipher),true).join(""),historicalPlain);
assert.equal(shuffle14(Array.from(historicalPlain),false).join(""),historicalCipher);
for(const original of chapters) {
  assert.deepEqual(shuffle14(shuffle14(original,true),false),original);
}
const composite = new Uint8Array(180000);
const primeKey = [];
for (let p = 2; p < composite.length && primeKey.length < 9000; p++) {
  if (composite[p]) continue;
  primeKey.push((p-1)%29);
  if (p*p < composite.length) {
    for(let q=p*p;q<composite.length;q+=p) composite[q]=1;
  }
}
assert.equal(primeKey.length,9000);
const mod = (n) => ((n%29)+29)%29;
/**
 * All F branches; merging equal consumed-prime states is exact for
 * reachability, independent of language guesses and score.
 * @param {number[]} ciphertext
 * @param {number} start
 * @returns {number}
 */
function furthest(ciphertext,start) {
  let states = [0];
  for(let i=0;i<ciphertext.length;i++) {
    const next = [], seen = new Uint8Array(i+2), c = ciphertext[i];
    for(const used of states) {
      if(c===0&&!seen[used]) {next.push(used);seen[used]=1;}
      if(mod(c-primeKey[start+used])!==0&&!seen[used+1]) {
        next.push(used+1);seen[used+1]=1;
      }
    }
    if(!next.length) return i;
    states=next;
  }
  return ciphertext.length;
}
const tokens = gp.translit.map((s,i) => ({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @returns {number[]} */
function gpEnglishWord(text) {
  const word = text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const output = [];
  for(let at=0;at<word.length;) {
    if(word.startsWith("ING",at)) {output.push(21);at+=3;continue;}
    if(word.startsWith("IO",at)) {output.push(27);at+=2;continue;}
    const m=tokens.find(x=>word.startsWith(x.s,at));
    assert.ok(m,"Cannot GP-tokenize original native word: "+text);
    output.push(m.i);at+=m.s.length;
  }
  return output;
}
/** @param {number[]} plain @param {number} start @returns {number[]} */
function encrypt(plain,start) {
  let used=0;
  return plain.map(p=>p===0 ? 0 : mod(p+primeKey[start+used++]));
}
const solvedP56Words = ("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE " +
  "THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE")
  .split(" ").map(gpEnglishWord);
const solvedP56 = solvedP56Words.flat();
assert.equal(solvedP56.length,85);
assert.deepEqual(encrypt(solvedP56,0),gp.pages[56].indices);
const sourceC56 = gp.pages[56].indices;
assert.equal(furthest(sourceC56,0),85);
assert.deepEqual(shuffle14(shuffle14(solvedP56Words,false),true),solvedP56Words);
const encodedWords = solvedP56Words.map(w=>encrypt(w,0)); // Only a geometry test.
assert.deepEqual(shuffle14(shuffle14(encodedWords,false),true),encodedWords);
// Full native-p56 cipher, split back at original word boundaries.
let consumed = 0;
const fullEncoded = solvedP56Words.map(w => {
  const result = sourceC56.slice(consumed,consumed+w.length);
  consumed+=w.length;return result;
});
assert.equal(consumed,85);
const plantedTransposition = shuffle14(fullEncoded,false).flat();
const restored = shuffle14(shuffle14(fullEncoded,false),true).flat();
assert.deepEqual(restored,sourceC56);
assert.equal(furthest(restored,0),85);
assert.ok(furthest(plantedTransposition,0)<=85);

// Independently trained native English GP bigram model.
// This model ranks full viable F paths; it cannot create mathematical paths.
const trainWords = [
  ...(Shakespeare.match(/[A-Za-z]+/g)||[]).slice(0,40000),
  ...(Gibran.match(/[A-Za-z]+/g)||[]).slice(0,9500)
].map(gpEnglishWord);
const dictionary = new Set(trainWords.map(w=>w.join(",")));
const bigrams=Array.from({length:30},()=>new Float64Array(29));
const totals = new Float64Array(30);
let prev=29;
for(const word of trainWords) for(const rune of word) {
  bigrams[prev][rune]++;totals[prev]++;prev=rune;
}
const logp=bigrams.map((row,i)=>Array.from(row,
  v=>Math.log((v+.2)/(totals[i]+29*.2))));

/**
 * Exact language-Viterbi over (consumed-key-count, last-plaintext-rune),
 * retaining back pointers. Scores do not prune different F histories.
 * @param {number[]} ciphertext
 * @param {number} start
 * @returns {{plain:number[],score:number,states:number}|null}
 */
function bestFullPath(ciphertext,start) {
  let states=new Map([["0:29",{used:0,last:29,score:0,prev:null,p:null}]]);
  for(const c of ciphertext) {
    const next=new Map();
    function extend(state,p,delta) {
      const used=state.used+delta, id=used+":"+p;
      const score=state.score+logp[state.last][p],old=next.get(id);
      if(!old||score>old.score) next.set(id,
        {used,last:p,score,prev:state,p});
    }
    for(const state of states.values()) {
      if(c===0) extend(state,0,0);
      const p=mod(c-primeKey[start+state.used]);
      if(p!==0) extend(state,p,1);
    }
    if(!next.size) return null;
    states=next;
  }
  const winner=[...states.values()].sort((a,b)=>b.score-a.score)[0];
  const plain=[];
  for(let node=winner;node.prev;node=node.prev) plain.push(node.p);
  plain.reverse();
  assert.deepEqual(encrypt(plain,start),ciphertext);
  return {plain,score:winner.score,states:states.size};
}
assert.deepEqual(bestFullPath(sourceC56,0).plain,solvedP56);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h=Array(29).fill(0);
  for(const x of a)h[x]++;
  return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} plain @param {number[][]} geometry */
function countWords(plain,geometry) {
  let offset=0,matches=0;
  for(const word of geometry) {
    const p=plain.slice(offset,offset+word.length);
    if(dictionary.has(p.join(",")))matches++;
    offset+=word.length;
  }
  assert.equal(offset,plain.length);
  return matches;
}

const output = {};
for(const [mode,decode] of [["historicalDecode",true],["historicalEncrypt",false]]) {
  const tests=[];
  for(let j=0;j<chapters.length;j++) {
    const geometry=shuffle14(chapters[j],decode);
    const ciphertext=geometry.flat();
    let max=0,maxStart=-1;
    const complete=[];
    for(let start=0;start<K;start++) {
      const reachable=furthest(ciphertext,start);
      if(reachable>max) {max=reachable;maxStart=start;}
      if(reachable===ciphertext.length) complete.push(start);
    }
    assert.equal(max,expected[mode].maxima[j],mode+" chapter "+j+" max");
    assert.equal(maxStart,expected[mode].starts[j],mode+" chapter "+j+" maxStart");
    assert.deepEqual(complete,expected[mode].completed[j]);
    const plaintextCandidates=complete.map(start=>{
      const candidate=bestFullPath(ciphertext,start);
      return {start,scorePerRune:candidate.score/candidate.plain.length,
        ioc:ioc(candidate.plain),nativeWordHits:countWords(candidate.plain,geometry),
        totalWords:geometry.length,finalFStates:candidate.states};
    });
    tests.push({chapter:j,runes:ciphertext.length,maxReach:max,
      initialPrimeOrdinalAtMaximum:maxStart,completePrimeStarts:complete,
      plaintextCandidates});
  }
  output[mode]=tests;
}

/**
 * Stronger literal transfer: the historical Stage03 acted on individual
 * characters. Preserve that source-faithful operation on original GP29
 * runes, not the speculative complete-word extension. Word separators
 * are not used by this second independent 90,000-case original screen.
 */
const expectedRune = {
  historicalDecode: {
    maxima:[729,474,526,592,526,544,519,498,308],
    starts:[2829,4113,4867,330,2982,3817,2886,1333,646],
    completed:[[2829,2830,2831],[],[],[],[],[],[],[],
      [646,1215,1217,2724,3715,3716,4052,4377]]
  },
  historicalEncrypt: {
    maxima:[729,414,455,551,631,670,481,555,308],
    starts:[1713,3956,4702,2064,3289,3579,631,1295,1264],
    completed:[[1713,1714,1715,1716,1718,1719,1720],[],
      [],[],[],[],[],[],[1264]]
  }
};
const runeOutput = {};
for(const [mode,decode] of [["historicalDecode",true],["historicalEncrypt",false]]) {
  const tests = [];
  for(let chapter=0;chapter<chapters.length;chapter++) {
    const original = chapters[chapter].flat();
    const sourceRuneCipher = shuffle14(original,decode);
    let bestPrefix=0, bestStart=-1;
    const complete=[];
    for(let start=0;start<K;start++) {
      const reached=furthest(sourceRuneCipher,start);
      if(reached>bestPrefix) {bestPrefix=reached;bestStart=start;}
      if(reached===sourceRuneCipher.length) complete.push(start);
    }
    assert.equal(bestPrefix,expectedRune[mode].maxima[chapter],
      mode+" rune-level chapter "+chapter+" maximal prefix");
    assert.equal(bestStart,expectedRune[mode].starts[chapter],
      mode+" rune-level chapter "+chapter+" argmax start");
    assert.deepEqual(complete,expectedRune[mode].completed[chapter],
      mode+" rune-level chapter "+chapter+" completion set");
    const candidates=complete.map(start=>{
      const v=bestFullPath(sourceRuneCipher,start);
      const meanBigramLog=v.score/v.plain.length, equalRate=ioc(v.plain);
      assert.ok(meanBigramLog<-4.7 && equalRate<.04,
        "Potential new real rune-level plaintext: inspect full original");
      return {start,meanBigramLog,ioc:equalRate,
        first40:v.plain.slice(0,40).map(x=>gp.translit[x]).join(" ")};
    });
    tests.push({chapter,originalRunes:original.length,maxPrefix:bestPrefix,
      startAtMaxPrefix:bestStart,completeStarts:complete,
      candidates});
  }
  runeOutput[mode]=tests;
}
assert.equal(runeOutput.historicalDecode.flatMap(r=>r.candidates).length,11);
assert.equal(runeOutput.historicalEncrypt.flatMap(r=>r.candidates).length,8);


/**
 * Third historical-key location: F is Cicada's known distinguished
 * GP29 interrupter, leaving 28 other rune symbols = two complete
 * original 14-column rows. Apply the same fixed 2014 permutation to
 * both non-F alphabet rows, leaving F untouched. This is a value-
 * substitution layer, not a glyph/word position transposition.
 * The alphabet mapping is exactly bijective in both directions.
 * @param {number} rune
 * @param {boolean} inverse
 * @returns {number}
 */
function mapNonF28(rune,inverse) {
  if(rune===0) return 0;
  const row=Math.floor((rune-1)/14), col=(rune-1)%14;
  return 1+14*row+(inverse?order.indexOf(col):order[col]);
}
for(let i=0;i<29;i++) {
  assert.equal(mapNonF28(mapNonF28(i,true),false),i);
  assert.equal(mapNonF28(mapNonF28(i,false),true),i);
}
const mappedP56=sourceC56.map(c=>mapNonF28(c,false));
assert.equal(furthest(mappedP56.map(c=>mapNonF28(c,true)),0),85);
const expectedAlphabet = {
  forward: {
    maxima:[613,545,618,518,518,580,408,559,308],
    starts:[4479,2382,3684,1997,115,3032,188,927,999],
    completed:[[],[],[],[],[],[],[],[],
      [999,1001,2048,2284,3461,3462,3801]]
  },
  inverse: {
    maxima:[712,426,539,520,584,554,468,490,308],
    starts:[3698,3070,1339,34,4146,1527,3669,1193,1835],
    completed:[[],[],[],[],[],[],[],[],[1835,3593]]
  }
};
const alphabetOutput = {};
for(const [mode,inverse] of [["forward",false],["inverse",true]]) {
  const tests=[];
  for(let chapter=0;chapter<chapters.length;chapter++) {
    const original=chapters[chapter].flat();
    const candidateCipher=original.map(c=>mapNonF28(c,inverse));
    let max=0,at=-1;
    const complete=[];
    for(let start=0;start<K;start++) {
      const reached=furthest(candidateCipher,start);
      if(reached>max) {max=reached;at=start;}
      if(reached===candidateCipher.length) complete.push(start);
    }
    assert.equal(max,expectedAlphabet[mode].maxima[chapter],
      mode+" alphabet chapter "+chapter+" max");
    assert.equal(at,expectedAlphabet[mode].starts[chapter],
      mode+" alphabet chapter "+chapter+" max arg");
    assert.deepEqual(complete,expectedAlphabet[mode].completed[chapter],
      mode+" alphabet chapter "+chapter+" complete set");
    const candidates=complete.map(start=>{
      const v=bestFullPath(candidateCipher,start);
      const meanBigramLog=v.score/v.plain.length;
      const collisionRate=ioc(v.plain);
      assert.ok(meanBigramLog<-4.7 && collisionRate<.04,
        "Potential authentic non-F alphabet transferred plaintext");
      return {start,meanBigramLog,ioc:collisionRate};
    });
    tests.push({chapter,originalRunes:original.length,maxPrefix:max,
      firstPrimeStartAtMax:at,completeStarts:complete,candidates});
  }
  alphabetOutput[mode]=tests;
}
assert.equal(alphabetOutput.forward.flatMap(t=>t.candidates).length,7);
assert.equal(alphabetOutput.inverse.flatMap(t=>t.candidates).length,2);

console.log(JSON.stringify({
  source:"12,956 original LP2 ciphertext runes/2,896 printed words",
  history:"signed 2014 Stage03 14-column permutation and authentic p56 prime-totient plaintext-F bypass",
  exactHistoricalStage03Positive:"70/70",
  authenticP56Positive:"85/85",
  nativeLayeredP56Plant:"85/85 ciphertext restored by historical word permutation",
  initialPrimeIndexRange:"0..4999",
  genuineCandidateScores:"All 7 complete originals have GP-English mean bigram<-5.05 and IoC<0.036; actual p56 score -2.66594, IoC 0.07003",
  controls:{originalP56BigramScore:bestFullPath(sourceC56,0).score/85,
    originalP56IoC:ioc(solvedP56)},results:output,runeLevelResults:runeOutput,alphabetLevelResults:alphabetOutput,
  conclusion:"All three source-fixed historical14 transfer levels fail to recover unknown LP2 plaintext under authentic p56-F prime clock over 5000 starts: whole words and runes have only opening/terminal nonprose completions; non-F 28-symbol alphabet transfer has only nine nonprose terminal completions."
},null,2));
