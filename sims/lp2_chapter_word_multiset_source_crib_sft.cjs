// @ts-check
/**
 * Source-independent whole-word permutation crib test for nine original LP2
 * chapters against historically relevant plaintext donors.
 *
 * Run: node sims/lp2_chapter_word_multiset_source_crib_sft.cjs
 *
 * A word transposition leaves the exact multiset of GP-rune word lengths
 * unchanged. This finite test seeks that necessary condition without tuning
 * transposition keys, boundaries, cipher symbols or candidate words.
 */
"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");

const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const expectedCounts = [158,255,383,437,224,326,378,669,66];
const expectedRunes = [729,1145,1729,1903,1021,1433,1680,3008,308];
const DIGRAPHS = ["TH","EO","NG","OE","AE","IA","EA"];
const BINS = 15;
const read = file => fs.readFileSync(file,"utf8");

/** @param {string} word */
function gpLength(word) {
  const text=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let count=0;
  for (let i=0; i<text.length;) {
    const double=DIGRAPHS.some(g=>text.startsWith(g,i));
    i+=double?2:1;
    count++;
  }
  return count;
}

/** Original physical pages are p0..p49, numeric-only p50, p51..p55. */
function originalWordChapters() {
  const sections=read("resources/lp2-transcription.txt").split("%").slice(0,55);
  /** @type {{ length:number,physicalPage:number }[]} */
  const words=[];
  let word="",startPage=0;
  function finish() {
    if (!word) return;
    words.push({length:[...word].length,
      physicalPage:startPage>=50?startPage+1:startPage});
    word="";
  }
  for (let page=0;page<sections.length;page++) {
    for (const c of sections[page]) {
      if (/[\u16a0-\u16ff]/u.test(c)) {
        if(!word)startPage=page;
        word+=c;
      } else if(c==="/"||/\s/u.test(c)) {
        // Source printed line-wraps and page boundaries do not split words.
      } else finish();
    }
  }
  finish();
  assert.equal(words.length,2896);
  assert.equal(words.reduce((a,w)=>a+w.length,0),12956);
  return chapterRanges.map(([a,b],i)=>{
    const lengths=words.filter(w=>w.physicalPage>=a && w.physicalPage<=b)
      .map(w=>w.length);
    assert.equal(lengths.length,expectedCounts[i]);
    assert.equal(lengths.reduce((x,y)=>x+y,0),expectedRunes[i]);
    return lengths;
  });
}

/** @param {number[]} xs */
function histogram(xs) {
  const counts=new Int32Array(BINS);
  for (const n of xs) {
    assert(Number.isInteger(n) && n>=1, "Invalid GP word length");
    counts[Math.min(n,BINS-1)]++;
  }
  return counts;
}
/** @param {Int32Array} left @param {Int32Array} right */
function distance(left,right) {
  let sum=0;
  for(let i=0;i<BINS;i++)sum+=Math.abs(left[i]-right[i]);
  return sum;
}
/**
 * Find the closest ORIGINAL-SOURCE contiguous window whose order is ignored.
 * @param {number[]} target
 * @param {number[]} reference
 */
function scan(target,reference) {
  const n=target.length;
  if(n>reference.length)return null;
  const wanted=histogram(target),running=histogram(reference.slice(0,n));
  let closest=Infinity,closestOffset=-1,exact=0;
  for(let start=0;start+n<=reference.length;start++) {
    const d=distance(wanted,running);
    if(d<closest){closest=d;closestOffset=start;}
    if(d===0)exact++;
    if(start+n<reference.length) {
      running[Math.min(reference[start],BINS-1)]--;
      running[Math.min(reference[start+n],BINS-1)]++;
    }
  }
  assert(closest>=0 && closest%2===0);
  return {windows:reference.length-n+1,closest,
    closestOffset,exact};
}

/** @returns {[string,number[]][]} */
function donorData() {
  /** @type {[string,number[]][]} */
  const donors=[];
  for(const [name,file] of [
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Crowley II printed","resources/external/2013-book-of-law-II.txt"],
    ["Blake Marriage","resources/external/blake-marriage-1906-gutenberg45315.txt"],
    ["Tennyson Shalott","resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt"]
  ]) {
    donors.push([name,(read(file).match(/[A-Za-z]+/g)||[]).map(gpLength)]);
  }
  donors.push(["Latin Vulgate",read("resources/control/latin-vulgate-gp-wholewords.txt")
    .split(/\r?\n/).map(x=>x.trim()).filter(x=>/^[0-9A-S]+$/.test(x))
    .map(x=>x.length)]);
  const mab=JSON.parse(read(
    "resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json"));
  donors.push(["Mabinogion",mab.mabinogion_story_word_lengths],
    ["Lady of the Fountain",mab.lady_of_the_fountain_word_lengths]);
  const crowley=JSON.parse(read(
    "resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json"));
  for(const ch of crowley.chapters)
    donors.push(["Crowley "+ch.chapter,ch.word_lengths]);
  const agrippa=JSON.parse(read(
    "resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json"));
  donors.push(["Agrippa",agrippa.word_lengths]);
  assert.equal(donors.length,13);
  return donors;
}

function run() {
  const chapters=originalWordChapters(),donors=donorData();
  // Source-native positive control: exact source window after reversed order
  // must be found at distance zero, independent of all ciphertext labels.
  const native=donors[0][1].slice(4820,4820+chapters[3].length);
  const plant=scan(native.slice().reverse(),donors[0][1]);
  assert(plant && plant.exact>=1 && plant.closest===0);
  const results=chapters.map((chapter,i)=>({
    chapter:i,pages:chapterRanges[i],wordCount:chapter.length,
    runeCount:expectedRunes[i],windows:0,exact:0,
    nearestSource:"",minimumL1:Infinity,nearestOffset:-1
  }));
  const sources=[];
  for(const [name,lengths] of donors) {
    /** @type {number[]} */
    const minimumByChapter=[];
    for(let i=0;i<9;i++){
      const hit=scan(chapters[i],lengths);
      if(!hit)continue;
      minimumByChapter.push(hit.closest);
      const result=results[i];
      result.windows+=hit.windows;
      result.exact+=hit.exact;
      if(hit.closest<result.minimumL1) {
        result.minimumL1=hit.closest;
        result.nearestSource=name;
        result.nearestOffset=hit.closestOffset;
      }
    }
    sources.push({name,words:lengths.length,minimumByChapter});
  }
  assert(results.every(x=>x.exact===0));
  assert.deepEqual(results.map(x=>x.minimumL1),
    [18,38,34,40,28,26,36,66,6]);
  const windows=results.reduce((a,x)=>a+x.windows,0);
  console.log(JSON.stringify({
    hypothesis:"Each original visual chapter consists of an arbitrary whole-word permutation of one contiguous passage of the specified source; printed GP word lengths preserved",
    original:{words:2896,runes:12956,physicalChapters:9,
      runelessPhysicalPage50Excluded:true,crossPageWordsPreserved:true},
    control:{sourceShuffledPositiveMatches:plant.exact>=1},
    windows,chapters:results,sources,
    conclusion:"No source passage supplies an exact chapter word-length multiset; finite donor/source negative only, not an original-text or arbitrary-permutation exclusion"
  },null,2));
}
if(require.main===module)run();
module.exports={gpLength,scan,run};
