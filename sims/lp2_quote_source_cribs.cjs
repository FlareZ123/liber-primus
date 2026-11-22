"use strict";
/**
 * Exact word-length source search confined to seven original LP2 quoted spans.
 *
 * The seven spans are selected by independently annotated quote glyphs,
 * before inspecting external text. Candidate phrases are not decryptions:
 * key agreement and a lossless original-input inverse remain necessary.
 *
 * Run: node sims/lp2_quote_source_cribs.cjs
 * Node 22 CommonJS. External sources are frozen by the bibliography
 * in padded_wordlength_corpus.cjs; no filesystem writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {parseWords}=require("./lp2_quote_length_crosslink.cjs");
const {runeLength,englishWords}=require("./wordlength_crib_scan.js");
const {selectBooks,fetchEdition,cleanGutenberg}=
  require("./padded_wordlength_corpus.cjs");
const ROOT=path.resolve(__dirname,"..");
const raw=fs.readFileSync(path.join(ROOT,
  "resources/lp2-transcription.txt"),"utf8");
const marks=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-quote-punctuation-spans.json"),"utf8"));
const words=parseWords(raw);
const quotes=marks.quotes.map(q=>{
  const inside=words.filter(w=>w.start>=q.start&&w.end<=q.end);
  const lengths=inside.map(w=>w.length);
  assert.equal(lengths.reduce((n,v)=>n+v,0),q.length);
  assert.equal(inside[0].start,q.start);
  assert.equal(inside[inside.length-1].end,q.end);
  return {start:q.start,end:q.end,page:q.page_slices[0].page,lengths};
});
assert.equal(quotes.length,7);
assert.equal(quotes.reduce((n,q)=>n+q.end-q.start,0),405);
assert.deepEqual(quotes.map(q=>q.lengths.length),[4,5,2,14,13,34,14]);
assert.deepEqual(quotes[3].lengths.slice(0,5),[5,7,2,3,4]);
assert.deepEqual(quotes[6].lengths.slice(0,5),[5,7,2,3,4]);

const SEED=5;
const seeds=new Map();
for(const [qid,q] of quotes.entries())
  for(let i=0;i+SEED<=q.lengths.length;i++){
    const key=q.lengths.slice(i,i+SEED).join(",");
    if(!seeds.has(key))seeds.set(key,[]);
    seeds.get(key).push({qid,offset:i});
  }

/**
 * Scan one independent book against all five-word-plus quotes in one pass.
 * Expand exact matching seeds left and right inside original quote boundaries.
 * @param {number[]} lengths
 * @param {string[]} sourceWords
 * @returns {{best:object[],seedHits:number,exactFull:object[],strong:object[]}}
 */
function scan(lengths,sourceWords){
  assert.equal(lengths.length,sourceWords.length);
  const best=quotes.map(()=>null),exactFull=[],strong=[];
  let seedHits=0;
  for(let j=0;j+SEED<=lengths.length;j++){
    const matches=seeds.get(lengths.slice(j,j+SEED).join(","));
    if(!matches)continue;
    for(const {qid,offset} of matches){
      seedHits++;
      const q=quotes[qid],target=q.lengths;
      let left=0,right=SEED;
      while(offset-left>0&&j-left>0&&
        target[offset-left-1]===lengths[j-left-1])left++;
      while(offset+right<target.length&&j+right<lengths.length&&
        target[offset+right]===lengths[j+right])right++;
      const n=left+right,sourceAt=j-left,quoteAt=offset-left;
      const current={quoteStart:q.start,quotePage:q.page,
        originalQuoteWordCount:target.length,
        matchedWords:n,sourceWord:sourceAt,quoteWord:quoteAt,
        fullMatch:n===target.length,
        phrase:sourceWords.slice(sourceAt,sourceAt+n).join(" ")};
      if(!best[qid]||n>best[qid].matchedWords)
        best[qid]=current;
      if(n===target.length&&quoteAt===0&&exactFull.length<50)
        exactFull.push(current);
      if(n>=9&&strong.length<100)strong.push(current);
    }
  }
  return {best:best.filter(Boolean),seedHits,exactFull,strong};
}

/** Test exact recovery under two source offsets with the original quote shapes. */
function selfTest(){
  const target=quotes[5].lengths;
  const pre=Array(15).fill("B");
  const planted=target.map(n=>"B".repeat(n));
  const sourceWords=pre.concat(planted,pre);
  const result=scan(sourceWords.map(runeLength),sourceWords);
  assert(result.exactFull.some(hit=>hit.quoteStart===quotes[5].start&&
    hit.sourceWord===15&&hit.quoteWord===0&&hit.matchedWords===target.length));
  return {positiveQuote:quotes[5].start,sourceWord:15,
    exactRecoveredWords:target.length};
}

async function main(){
  const positive=selfTest();
  const selected=(await selectBooks()).slice(0,Number(process.env.MAX_BOOKS||92));
  const scanned=[],failures=[];
  for(const [i,book] of selected.entries()){
    try{
      const content=cleanGutenberg(await fetchEdition(book));
      const sourceWords=englishWords(content);
      if(sourceWords.length<300||sourceWords.length>2000000)
        throw Error("unsupported source word count");
      const evidence=scan(sourceWords.map(runeLength),sourceWords);
      const hash=crypto.createHash("sha256").update(content).digest("hex");
      scanned.push({id:book.id,title:book.title,sha256:hash,
        words:sourceWords.length,seedHits:evidence.seedHits,
        best:evidence.best,exactFull:evidence.exactFull.length,
        strong:evidence.strong.length});
      for(const hit of evidence.strong)
        console.log("QUOTE_CANDIDATE",JSON.stringify({
          id:book.id,title:book.title,sha256:hash,...hit}));
    }catch(error){failures.push({id:book.id,error:String(error)});}
    if((i+1)%20===0)console.log("PROGRESS",JSON.stringify({
      seen:i+1,scanned:scanned.length,failures:failures.length}));
  }
  const ranked=scanned.flatMap(book=>book.best.map(hit=>({
    id:book.id,title:book.title,sha256:book.sha256,...hit
  }))).sort((a,b)=>b.matchedWords-a.matchedWords);
  console.log("SUMMARY",JSON.stringify({
    classification:"Original quote-selected GP word-length crib search",
    scope:"Five-word exact seeds within 7 source-annotated quote spans, 92 frozen historical literary editions",
    sourceQuoteShapes:quotes,positive,selected:selected.length,
    scanned:scanned.length,failures,
    totalSourceWords:scanned.reduce((n,b)=>n+b.words,0),
    totalSeedHits:scanned.reduce((n,b)=>n+b.seedHits,0),
    exactFullQuotes:scanned.reduce((n,b)=>n+b.exactFull,0),
    nineWordOrLongerCandidates:scanned.reduce((n,b)=>n+b.strong,0),
    strongest:ranked.slice(0,30),
    caution:"A matching word-length pattern is a crib lead, never a plaintext recovery without a source-fixed cipher and full original reencryption."
  }));
}
if(require.main===module)main().catch(error=>{
  console.error(error);process.exitCode=1;
});
module.exports={quotes,scan,selfTest,main};