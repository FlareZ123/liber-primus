"use strict";

/**
 * Test whether the printed LP2 word-length ordering preserves GP-native English
 * adjacent-length dependence. Source-only original LP2, authentic solved LP1,
 * two independent English register controls, chapter-constrained permutation null.
 * Diagnostic only: a null dependence does not identify a cipher or plaintext.
 * Node 22 CommonJS, read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp2Text = read("resources/liber-primus/lp2-transcription.txt");
const lp1Text = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const Shakespeare = read("resources/control/shakespeare_first300k.txt");
const Gibran = read("resources/control/gibran_prophet_58585.txt");
const runeSet = new Set(gp.runes);
const CHAPTER_ENDS = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const CHAPTER_WORDS = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const TOTAL = 12956;
const K = 12;
const LEN = 2896;

/**
 * Parse actual printed rune words, joining visual line and page carries.
 * The source's hyphens, periods, and '&' delimit words. Page '%' and
 * line '/' never end words. Stop before solved p56/p57.
 * @param {string} data
 * @param {number|null} limit
 * @returns {{start:number,len:number}[]}
 */
function printedWords(data, limit = null) {
  const result = [];
  let total = 0, len = 0, start = 0;
  for (const ch of data) {
    if (runeSet.has(ch)) {
      if (!len) start = total;
      total++;
      len++;
      if (limit !== null && total === limit) {
        result.push({start, len});
        return result;
      }
    } else if (ch === "-" || ch === "." || ch === "&") {
      if (len) result.push({start, len});
      len = 0;
    }
  }
  if (len) result.push({start, len});
  return result;
}

const unknown = printedWords(lp2Text, TOTAL);
assert.equal(unknown.length, LEN);
assert.equal(unknown.reduce((s,w) => s+w.len, 0), TOTAL);
assert.deepEqual(CHAPTER_WORDS.reduce((s,v)=>s+v,0), LEN);
const cross = unknown.filter(w=>CHAPTER_ENDS.some(e=>w.start<e && e<w.start+w.len));
assert.equal(cross.length, 0, "all section seams are complete printed-word seams");
const chapters = CHAPTER_ENDS.map((end,i) => unknown
  .filter(w=>w.start >= (CHAPTER_ENDS[i-1]||0) && w.start < end).map(w=>w.len));
assert.deepEqual(chapters.map(x=>x.length), CHAPTER_WORDS);
assert.deepEqual(chapters.map(x=>x.reduce((s,v)=>s+v,0)),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);

const lp1Sections = lp1Text.split("%").map(s=>printedWords(s).map(w=>w.len))
  .filter(s=>s.length>=2);
assert.equal(lp1Sections.length, 15);
assert.equal(lp1Sections.reduce((s,c)=>s+c.length,0), 698);

/** @param {string} word @returns {number} */
function gpEnglishLength(word) {
  const w = word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const tokens = gp.translit.slice().sort((a,b)=>b.length-a.length);
  let n=0;
  for(let i=0;i<w.length;) {
    const size = w.startsWith("ING",i) ? 3 : w.startsWith("IO",i) ? 2
      : (tokens.find(token=>w.startsWith(token,i))||"").length;
    assert.ok(size>0,"unmapped word spelling "+word);
    i+=size; n++;
  }
  return n;
}
const controlLengths = [
  {name:"Shakespeare",lens:(Shakespeare.match(/[A-Za-z]+/g)||[]).map(gpEnglishLength)},
  {name:"Gibran",lens:(Gibran.match(/[A-Za-z]+/g)||[]).map(gpEnglishLength)}
];
assert.deepEqual(controlLengths.map(c=>c.lens.length), [55407,15733]);

/**
 * Plug-in (biased finite-sample) mutual information in natural units.
 * Joint sample at lag stays entirely inside each source chapter.
 * Length classes 1..11 and 12+ are fixed before original measurement.
 * @param {number[][]} groups
 * @param {number} lag
 * @returns {number}
 */
function mi(groups,lag=1) {
  const joint = new Float64Array(K*K), a = new Float64Array(K),
    b = new Float64Array(K);
  let n=0;
  for(const group of groups) for(let i=lag;i<group.length;i++) {
    const x=Math.min(K-1,group[i-lag]-1);
    const y=Math.min(K-1,group[i]-1);
    assert.ok(x>=0&&y>=0);
    joint[x*K+y]++; a[x]++; b[y]++; n++;
  }
  assert.ok(n>100);
  let value=0;
  for(let x=0;x<K;x++) for(let y=0;y<K;y++) {
    const count=joint[x*K+y];
    if(count) value+=count/n*Math.log(count*n/(a[x]*b[y]));
  }
  return value;
}

/** Deterministic, seeded xorshift32; no source or planted secrets. */
let seed=0x3301c1ca;
function random() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed>>>0)/4294967296;
}
/** @param {number[]} seq @returns {number[]} */
function shuffle(seq) {
  const a=seq.slice();
  for(let i=a.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
/** @param {number[]} a @returns {{n:number,mean:number,min:number,max:number,p025:number,median:number,p975:number}} */
function summarize(a) {
  const sorted=a.slice().sort((x,y)=>x-y);
  return {n:sorted.length,mean:a.reduce((s,x)=>s+x,0)/a.length,
    min:sorted[0],max:sorted[sorted.length-1],
    p025:sorted[Math.floor(.025*a.length)],
    median:sorted[Math.floor(.5*a.length)],
    p975:sorted[Math.floor(.975*a.length)]};
}
/** @param {number[][]} a @param {number} trials */
function nullTest(a,trials) {
  const value=mi(a),n=Array.from({length:trials},()=>mi(a.map(shuffle)));
  return {wordCount:a.reduce((s,x)=>s+x.length,0),observedMI:value,
    null:summarize(n),upperP:(1+n.filter(x=>x>=value).length)/(trials+1)};
}
const lp2=nullTest(chapters,3000);
const lp1=nullTest(lp1Sections,3000);
assert.ok(lp2.upperP>.2, "unexpected original LP2 adjacency effect");
assert.ok(lp1.upperP<.05, "authentic solved-LP1 calibration failed");

/** Segment a contiguous English sample at the nine original chapter word counts. */
function splitLikeChapters(x) {
  let offset=0;
  return CHAPTER_WORDS.map(n=>{const out=x.slice(offset,offset+n);offset+=n;return out;});
}
const literature=controlLengths.map(c=>{
  const values=[];
  for(let i=0;i<128;i++) {
    const at=Math.floor(random()*(c.lens.length-LEN+1));
    values.push(mi(splitLikeChapters(c.lens.slice(at,at+LEN))));
  }
  assert.ok(values.every(v=>v>lp2.observedMI),
    "original MI is no longer below all native-English control windows");
  return {name:c.name,controls:values.length,stats:summarize(values),
    windowsAtOrBelowOriginal:values.filter(v=>v<=lp2.observedMI).length};
});

// Source-nominated lags that might reveal columnar transposition. A nominal
// peak must beat its joint family null, not just one uncorrected statistic.
const lags=[1,2,3,4,5,6,7,8,10,11,13,14,16,28,29,32,64,76,128,256];
const realLags=lags.map(lag=>mi(chapters,lag));
const shuffles=400;
const nullLag=lags.map(()=>[]);
for(let k=0;k<shuffles;k++) {
  const x=chapters.map(shuffle);
  for(let j=0;j<lags.length;j++) nullLag[j].push(mi(x,lags[j]));
}
const means=nullLag.map(a=>a.reduce((s,x)=>s+x,0)/a.length);
const sd=nullLag.map((a,j)=>Math.sqrt(
  a.reduce((s,x)=>s+(x-means[j])**2,0)/a.length));
const originalZ=realLags.map((x,j)=>(x-means[j])/sd[j]);
const nullMaxZ=Array.from({length:shuffles},(_,i)=>
  Math.max(...lags.map((l,j)=>(nullLag[j][i]-means[j])/sd[j])));
const best=Math.max(...originalZ),bestJ=originalZ.indexOf(best);
const motifLag={testedLags:lags,largestUncorrectedZ:best,
  correspondingLag:lags[bestJ],familywiseUpperP:
    (1+nullMaxZ.filter(x=>x>=best).length)/(shuffles+1),
  perLag:lags.map((lag,j)=>({lag,mi:realLags[j],z:originalZ[j]}))};
const result={
  evidence:"original printed-word-length dependence only, not ciphertext decoding",
  originalSource:{runes:TOTAL,words:LEN,chapterWords:CHAPTER_WORDS,
    lengthHistogram1to11and12plus:Array.from({length:K},(_,i)=>
      unknown.filter(w=>Math.min(K-1,w.len-1)===i).length)},
  lp2,solvedLp1:lp1,literature,motifLag,
  conclusion:"No preserved native-English adjacent-length grammar or source-nominated lag indicated by this finite source-conditioned test; no plaintext or key recovered"
};
console.log(JSON.stringify(result,null,2));
