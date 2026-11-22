"use strict";
/**
 * Order-blind GP word-length source locator for the eight original LP2 sections.
 *
 * A section-level permutation of intact plaintext words preserves its complete
 * word-length multiset, even if every adjacent pair has been scrambled.
 * Compare that necessary invariant to every contiguous, equal-word-count
 * window of the fixed 92-book GITenberg bibliography.
 *
 * No plaintext, substitution alphabet, permutation key, or source offsets are
 * fitted to LP2. This test is about recoverable source locations under an
 * explicit whole-word-transposition hypothesis.
 *
 * Node.js 22, CommonJS. Network downloads are read-only; no file writes.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {runeWords, runeLength, englishWords} = require("./wordlength_crib_scan.js");
const {selectBooks,fetchEdition,cleanGutenberg} =
  require("./padded_wordlength_corpus.cjs");

const root = path.resolve(__dirname, "..");
const text = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8");
const runePages = text.split("%").slice(0, 55).join("%");
const sections = runePages.split("$").map(chunk =>
  runeWords(chunk).map(word => [...word].length)).filter(a => a.length);
assert.deepEqual(sections.map(a => a.length),
  [158,255,385,435,224,326,378,735]);
assert.deepEqual(sections.map(a => a.reduce((s,n) => s+n,0)),
  [729,1145,1738,1894,1021,1433,1680,3316]);
assert.equal(sections.flat().length, 2896);

const MAX_LENGTH = 64;
/** @param {number} x @returns {number} */
function bucket(x) {
  assert(Number.isInteger(x) && x >= 1);
  return Math.min(x, MAX_LENGTH);
}
/** @param {number[]} lengths @returns {Int32Array} */
function histogram(lengths) {
  const out = new Int32Array(MAX_LENGTH+1);
  for (const n of lengths) out[bucket(n)]++;
  return out;
}
/**
 * Find the least possible number of word-length substitutions needed to
 * identify the target multiset with any contiguous reference window. Counts
 * are updated in O(1) per shifted window, so all windows are inspected.
 *
 * @param {number[]} source Preserved-order source GP word lengths
 * @param {number[]} target An original LP2 section's GP word lengths
 * @returns {{minL1:number,changedWordsLowerBound:number,offset:number,ties:number}}
 */
function bestBag(source,target) {
  const m=target.length;
  assert(source.length>=m && m>0);
  const h=histogram(source.slice(0,m)),t=histogram(target);
  let distance=0;
  for(let c=1;c<=MAX_LENGTH;c++)distance+=Math.abs(h[c]-t[c]);
  let best=distance,offset=0,ties=1;
  for(let end=m;end<source.length;end++){
    const left=bucket(source[end-m]),right=bucket(source[end]);
    if(left!==right){
      distance-=Math.abs(h[left]-t[left])+Math.abs(h[right]-t[right]);
      h[left]--;h[right]++;
      distance+=Math.abs(h[left]-t[left])+Math.abs(h[right]-t[right]);
    }
    if(distance<best){best=distance;offset=end-m+1;ties=1;}
    else if(distance===best)ties++;
  }
  assert.equal(best%2,0);
  return {minL1:best,changedWordsLowerBound:best/2,offset,ties};
}
/** Deterministic permutation, independent of the content of original LP2. */
function shuffle(values,seed) {
  const out=values.slice();
  let s=seed>>>0;
  for(let i=out.length-1;i>0;i--){
    s^=s<<13;s^=s>>>17;s^=s<<5;
    const j=(s>>>0)%(i+1);
    const tmp=out[i];out[i]=out[j];out[j]=tmp;
  }
  return out;
}
/** An exact source excerpt remains locatable after *all* words are shuffled. */
function syntheticPositive(){
  const content=fs.readFileSync(path.join(root,
    "resources/control/gibran_prophet_58585.txt"),"utf8");
  const words=englishWords(content).map(runeLength);
  assert(words.length>12000);
  const recovered=[];
  let offset=311;
  for(let i=0;i<sections.length;i++){
    const n=sections[i].length;
    const target=shuffle(words.slice(offset,offset+n),0x33012915^i);
    assert.equal(target.length,n);
    const found=bestBag(words,target);
    assert.equal(found.minL1,0);
    assert.deepEqual(histogram(words.slice(offset,offset+n)),
      histogram(target));
    recovered.push({section:i,plantedSourceOffset:offset,
      bestSourceOffset:found.offset,minimumLengthChanges:found.changedWordsLowerBound,
      exactAtKnownOffset:true});
    offset+=n+19;
  }
  return recovered;
}
/**
 * Relative variance of sums over all consecutive W-word windows. Under a
 * uniformly shuffled, within-section fixed inventory, expectation is 1:
 * E[(sum_W - W*mean)^2] = W*(n-W)/(n-1)*populationVariance.
 * A natural language's word-length grammar can suppress short-window
 * variance, even after conditioning on each original section histogram.
 *
 * @param {number[][]} parts Sections of complete GP word lengths
 * @param {number} width
 * @returns {number}
 */
function variability(parts,width){
  let observed=0,expected=0;
  for(const a of parts){
    const n=a.length;
    if(width>n)continue;
    const mean=a.reduce((sum,x)=>sum+x,0)/n;
    const variance=a.reduce((sum,x)=>sum+(x-mean)**2,0)/n;
    let total=0;
    for(let j=0;j<width;j++)total+=a[j];
    let sum=(total-width*mean)**2;
    for(let j=width;j<n;j++){
      total+=a[j]-a[j-width];
      sum+=(total-width*mean)**2;
    }
    observed+=sum;
    expected+=(n-width+1)*width*(n-width)/(n-1)*variance;
  }
  assert(expected>0);
  return observed/expected;
}
/** @param {number[][]} parts @param {number} block @param {number} seed */
function blockShuffle(parts,block,seed){
  return parts.map((a,i)=>Array.from(
    {length:Math.ceil(a.length/block)},(_,j)=>
      shuffle(a.slice(j*block,(j+1)*block),seed^(i<<12)^j)).flat());
}
/** @param {number[]} source @param {number} offset */
function sourceWindows(source,offset){
  let cursor=offset;
  return sections.map(original=>{
    const chunk=source.slice(cursor,cursor+original.length);
    assert.equal(chunk.length,original.length);
    cursor+=chunk.length;
    return chunk;
  });
}
const WIDTHS=[4,8,16,32,64];
const ORIGINAL_SCALE=WIDTHS.map(w=>variability(sections,w));
/** @param {object} panels @returns {object} */
function scaleSummary(panels){
  function details(rows){
    return WIDTHS.map((width,i)=>{
      const scores=rows.map(r=>r.scores[i]).sort((a,b)=>a-b);
      const actual=ORIGINAL_SCALE[i],n=scores.length;
      const above=rows.filter(r=>r.scores[i]>=actual);
      return {width,original:actual,
        referenceMean:scores.reduce((a,b)=>a+b,0)/n,
        referenceMedian:scores[Math.floor(n/2)],
        referenceP01:scores[Math.floor((n-1)*0.01)],
        referenceP99:scores[Math.floor((n-1)*0.99)],
        samplesAtOrAboveOriginal:above.length,samples:n,
        booksWithAnySampleAtOrAboveOriginal:new Set(above.map(r=>r.id)).size};
    });
  }
  return {definition:"within-section moving-sum variance / exact inventory-shuffle expectation",
    widths:WIDTHS,rawOriginal:ORIGINAL_SCALE,
    genuineSource:details(panels.native),
    planted32WordScramble:details(panels.block32),
    fullyScrambled:details(panels.random),
    referenceWindows:panels.native.length,
    referenceBooks:new Set(panels.native.map(r=>r.id)).size};
}

async function main(){
  const planted=syntheticPositive();
  const configured=await selectBooks();
  const allowed=Number(process.env.MAX_BOOKS||configured.length);
  assert(Number.isInteger(allowed) && allowed>=1);
  const selected=configured.slice(0,allowed);
  const winners=sections.map(()=>[]);
  const records=[];
  const failures=[];
  const panels={native:[],block32:[],random:[]};
  for(let i=0;i<selected.length;i++){
    const book=selected[i];
    try{
      const edition=cleanGutenberg(await fetchEdition(book));
      const words=englishWords(edition);
      if(words.length<736 || words.length>2000000)
        throw Error("source word count outside declared bounds: "+words.length);
      const lengths=words.map(runeLength);
      if(lengths.length>=sections.flat().length){
        const maxStart=lengths.length-sections.flat().length;
        const offsets=new Set(Array.from({length:8},(_,i)=>
          Math.floor(maxStart*(i+1)/9)));
        let iteration=0;
        for(const offset of offsets){
          const parts=sourceWindows(lengths,offset);
          const modes={
            native:parts,
            block32:blockShuffle(parts,32,(book.id^offset)>>>0),
            random:parts.map((p,i)=>shuffle(p,(book.id+offset+i*65537)>>>0))
          };
          for(const [name,model] of Object.entries(modes))
            panels[name].push({id:book.id,offset,
              scores:WIDTHS.map(w=>variability(model,w))});
          iteration++;
        }
      }
      const results=sections.map(s=>bestBag(lengths,s));
      const record={id:book.id,title:book.title,sourceWords:words.length,
        sha256:crypto.createHash("sha256").update(edition).digest("hex"),
        bySection:results};
      records.push(record);
      for(let s=0;s<sections.length;s++){
        const r=results[s];
        winners[s].push({id:book.id,title:book.title,...r});
      }
      console.log("BOOK",JSON.stringify({id:book.id,
        sourceWords:words.length,minimumChangedWords:results.map(r=>
          r.changedWordsLowerBound)}));
    }catch(e){
      failures.push({id:book.id,error:String(e)});
      console.log("BOOK_ERROR",JSON.stringify(failures.at(-1)));
    }
    if((i+1)%25===0)console.log("PROGRESS",JSON.stringify({
      booksProcessed:i+1,scanned:records.length,failures:failures.length}));
  }
  const strongest=winners.map((a,s)=>({
    section:s,originalWords:sections[s].length,
    candidates:a.sort((x,y)=>x.minL1-y.minL1).slice(0,8)
  }));
  const exact=records.flatMap(rec=>rec.bySection.flatMap((r,s)=>
    r.minL1===0?[{source:rec.id,section:s,offset:r.offset}]:[]));
  console.log("SUMMARY",JSON.stringify({model:
    "arbitrary permutation of intact GP words within eight complete LP2 sections",
    originalWords:2896,originalRunes:12956,
    configuredSources:configured.length,selectedSources:selected.length,
    fetched:records.length,failures,sourcePositive:planted,
    exactMultisetMatches:exact,topBySection:strongest,
    multiScale:scaleSummary(panels)}));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={bestBag,histogram,shuffle,syntheticPositive,variability,blockShuffle,main};
