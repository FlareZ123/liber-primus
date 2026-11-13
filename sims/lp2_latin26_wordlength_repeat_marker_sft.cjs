'use strict';
/** Reproduce: node sims/lp2_latin26_wordlength_repeat_marker_sft.cjs (Node 22). */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} filename @returns {string} */
const read=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const runeSet=new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);
const runeOrder=[...runeSet],runeIndex=new Map(runeOrder.map((r,i)=>[r,i]));
const source=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
let page=0,previous=null,word=[],words=[],repeat=[0,0,0],total=0;
/** @returns {void} */
function finish(){
 if(!word.length)return;
 const L=word.length;
 word.forEach((x,k)=>{if(x.event){repeat[0]++;if(L>=8)repeat[1]++;if(k===0)repeat[2]++;}});
 words.push(word);word=[];
}
for(const c of source){
 if(runeSet.has(c)){
  const eligible=previous!==null&&previous.page===page;
  const valueIndex=runeIndex.get(c);
  const previousIndex=eligible?runeIndex.get(previous.value):null;
  const r={eligible,event:eligible&&previous.value===c,page,value:c,valueIndex,previousIndex};
  word.push(r);previous=r;total++;
 }else if(c==='%')page++;
 else if(c==='/'||/\s/u.test(c)){}
 else finish();
}
finish();
assert.equal(total,12956);assert.equal(words.length,2896);
assert.deepEqual(repeat,[86,21,23]);

// Descriptive absolute-output coverage only. A fixed rank map into the 28
// successors is state-relative and can produce all 29 absolute runes, so
// these counts do not bound that model. Exclude page-first headers/repeats.
const pageAlphabets=new Map();
const physicalPage=p=>p>=50?p+1:p; // physical p50 has no runic transcription segment.
for(const w of words)for(const r of w){
 if(!r.eligible||r.event)continue;
 const p=physicalPage(r.page);
 if(!pageAlphabets.has(p))pageAlphabets.set(p,new Set());
 pageAlphabets.get(p).add(r.value);
}
assert.equal(pageAlphabets.size,55);
const pageDistinct=[...pageAlphabets.entries()].map(([p,set])=>[p,set.size]);
assert.equal(pageDistinct.filter(([,n])=>n===29).length,53);
assert.deepEqual(pageDistinct.filter(([,n])=>n!==29),[[49,28],[55,25]]);
const chapterRanges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapterDistinct=chapterRanges.map(([lo,hi])=>{
 const set=new Set();
 for(const [p,values] of pageAlphabets)if(p>=lo&&p<=hi)for(const v of values)set.add(v);
 return set.size;
});
assert.deepEqual(chapterDistinct,[29,29,29,29,29,29,29,29,29]);

// Normalize each nonrepeat ciphertext rune by its predecessor: its rank in
// the GP29 alphabet after removing the previous ciphertext rune. A fixed
// 25-letter plaintext map can emit at most 25 distinct successor ranks.
const pageRankSets=new Map(),globalRanks=new Set();
for(const w of words)for(const r of w){
 if(!r.eligible||r.event)continue;
 const rank=r.valueIndex-(r.valueIndex>r.previousIndex?1:0);
 assert(rank>=0&&rank<28);
 globalRanks.add(rank);
 const p=physicalPage(r.page);
 if(!pageRankSets.has(p))pageRankSets.set(p,new Set());
 pageRankSets.get(p).add(rank);
}
const pageRankDistinct=[...pageRankSets.entries()].map(([p,set])=>[p,set.size]);
assert.equal(globalRanks.size,28);
assert.equal(pageRankDistinct.length,55);
assert.equal(pageRankDistinct.filter(([,n])=>n===28).length,52);
assert.deepEqual(pageRankDistinct.filter(([,n])=>n!==28),[[22,27],[49,27],[55,24]]);
assert.equal(pageRankDistinct.filter(([,n])=>n>25).length,54);
const chapterRankDistinct=chapterRanges.map(([lo,hi])=>{
 const set=new Set();
 for(const [p,values] of pageRankSets)if(p>=lo&&p<=hi)for(const v of values)set.add(v);
 return set.size;
});
assert.deepEqual(chapterRankDistinct,[28,28,28,28,28,28,28,28,28]);

const histogram=new Uint32Array(14);
for(const w of words)histogram[w.length-1]++;
assert.deepEqual([...histogram],[83,448,720,513,317,256,216,156,78,52,32,18,4,3]);
const refs=[
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/liber-primus/lp1-plaintext-reference.txt'
];
/** @param {number[]} values @returns {number[]} */
function probs(values){
 const n=values.length,counts=new Uint32Array(15);
 for(const v of values)counts[Math.min(v,15)-1]++;
 return [...counts].map(x=>x/n);
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function kl(a,b){return a.reduce((sum,p,k)=>sum+p*Math.log((p+1e-12)/(b[k]+1e-12)),0);}
const original=probs(words.map(w=>w.length));
const records=[];
for(const file of refs){
 const lines=read(file).split('\n');
 const txt=file.includes('lp1-plaintext-reference')?lines.filter(s=>!s.startsWith('#')).join(' '):lines.join('\n');
 const entries=txt.toUpperCase().match(/[A-Z]+/g)||[];
 const latin=entries.map(w=>w.length);
 const gp=entries.map(w=>{
  const x=w.replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
  return (x.match(/TH|NG|EO|OE|AE|IA|EA|./g)||[]).length;
 });
 // Also test the source-calibrated LP1/p57 English spelling: QU→CW,
 // V→U, K/Q→C, Z→S, with ING and IO each emitted as one rune.
 const sourceGp=entries.map(w=>{
  const x=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  return (x.match(/ING|IO|TH|NG|EO|OE|AE|IA|EA|./g)||[]).length;
 });
 const latinKL=kl(original,probs(latin)),gpKL=kl(original,probs(gp));
 const sourceGpKL=kl(original,probs(sourceGp));
 assert(latinKL<gpKL,file+' native Latin shape should fit better than legacy GP29');
 assert(latinKL<sourceGpKL,file+' native Latin shape should fit better than source-calibrated GP29');
 const occ=Array.from({length:15},(_,n)=>Array.from({length:n+1},()=>new Uint32Array(26)));
 const pop=new Uint32Array(15);
 for(const w of entries){
  const len=w.length;if(len<1||len>14)continue;
  pop[len]++;
  for(let k=0;k<len;k++)occ[len][k][w.charCodeAt(k)-65]++;
 }
 const expected=Array.from({length:26},()=>[0,0,0]);
 for(const w of words){
  const L=w.length;
  assert(pop[L]>0);
  for(let k=0;k<L;k++){
   if(!w[k].eligible)continue;
   for(let q=0;q<26;q++){
    const p=occ[L][k][q]/pop[L];
    expected[q][0]+=p;
    if(L>=8)expected[q][1]+=p;
    if(k===0)expected[q][2]+=p;
   }
  }
 }
 const score=v=>Math.sqrt(v.reduce((s,x,k)=>s+((x-repeat[k])/Math.sqrt(repeat[k]))**2,0));
 const rank=expected.map((v,q)=>({q,score:score(v)})).sort((a,b)=>a.score-b.score);
 assert.equal(rank[0].q,10,'Latin K expected to be nearest of 26 in '+file);
 records.push({file,referenceWords:entries.length,latinMean:latin.reduce((s,n)=>s+n,0)/entries.length,
  gpMean:gp.reduce((s,n)=>s+n,0)/entries.length,
  sourceCalibratedGpMean:sourceGp.reduce((s,n)=>s+n,0)/entries.length,
  KLlatin:latinKL,KLgp:gpKL,KLsourceCalibratedGP:sourceGpKL,
  bestMarker:String.fromCharCode(65+rank[0].q),expectedK:expected[10],
  markerSecond:String.fromCharCode(65+rank[1].q)});
}
console.log(JSON.stringify({result:'PASS; Latin-register discriminator and predecessor-relative rank-map exclusion, no cipher/key or plaintext',
 original:{runes:total,words:words.length,repeat,mean:total/words.length},
 absoluteOutputCoverage:{pages:pageDistinct,visualChapterDistinct:chapterDistinct,
  interpretation:'descriptive only; absolute rune coverage does not constrain relative successor ranks'},
 relativeSuccessorRankCoverage:{globalDistinct:globalRanks.size,pages:pageRankDistinct,
  pagesWithAll28:pageRankDistinct.filter(([,n])=>n===28).length,
  pagesWithMoreThan25:pageRankDistinct.filter(([,n])=>n>25).length,
  visualChapterDistinct:chapterRankDistinct,
  interpretation:'a fixed map from 25 ordinary Latin letters to 28 predecessor-relative successor ranks cannot produce 28 distinct ranks; it is excluded globally, per chapter, and on 54/55 physical pages'},
 references:records},null,2));
/**
 * Source-native follow-up: full exact repeat mask on independently printed
 * lexicon words, plus an authentic-original one-based GP29 accumulator.
 *
 * The count comparison is a fixed-corpus diagnostic, not a cipher solution.
 * @param {number[]} sequence
 * @param {number} marker
 * @param {number[]} mask 1=observed repeat, 0=observed nonrepeat, 2=page-first unknown
 * @returns {boolean}
 */
function maskMatches(sequence, marker, mask) {
  return sequence.length === mask.length &&
    sequence.every((symbol, index) =>
      mask[index] === 2 || (symbol === marker) === (mask[index] === 1));
}

const gpCorpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const gpTokens = gpCorpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * GP source-calibrated spelling: exactly the independent LP1/p57 conventions.
 * @param {string} original
 * @returns {number[]}
 */
function encodeNativeWord(original) {
  const s=original.replace(/QU/g, 'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const output=[];
  for(let k=0;k<s.length;){
    if(s.startsWith('ING',k)){output.push(21);k+=3;}
    else if(s.startsWith('IO',k)){output.push(27);k+=2;}
    else {
      const token=gpTokens.find(t=>s.startsWith(t.s,k));
      assert(token,'unmapped source GP token '+s.slice(k));
      output.push(token.i);k+=token.s.length;
    }
  }
  return output;
}
assert.equal(gpCorpus.runes[28], 'ᛠ');
const lexicon=read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/u)
  .map(line => /^([a-z]+)\s+(\d+)\s*$/u.exec(line))
  .filter(Boolean)
  .map(hit => ({word:hit[1].toUpperCase(), frequency:Number(hit[2])}))
  .filter(x=>x.word.length<=16);
assert.equal(lexicon.length, 29144);
const lexData=lexicon.map(x=>({
  ...x,
  latin:[...x.word].map(s=>s.charCodeAt(0)-65),
  gp:encodeNativeWord(x.word)
}));
const exactMasks=words.map(w=>w.map(x=>x.event?1:x.eligible?0:2));
const eventMasks=exactMasks.filter(m=>m.includes(1));
const twoMasks=exactMasks.filter(m=>m.length===2);
const twoFirstEvents=twoMasks.filter(m=>m[0]===1).length;
const twoSecondEvents=twoMasks.filter(m=>m[1]===1).length;
assert.equal(eventMasks.length,85);
assert.deepEqual([twoMasks.length,twoFirstEvents,twoSecondEvents],[448,3,1]);

/**
 * Compute stable small-p binomial upper tail for at least three occurrences.
 * @param {number} n
 * @param {number} p
 * @returns {number}
 */
function binomialTailAtLeastThree(n,p) {
  let term=n*(n-1)*(n-2)*p**3*Math.pow(1-p,n-3)/6;
  let result=term;
  for(let k=3;k<n;k++) {
    term *= (n-k)*p/((k+1)*(1-p));
    result += term;
    if(term<result*1e-16)break;
  }
  return result;
}

/**
 * @param {'latin'|'gp'} alphabet
 * @param {number} marker
 * @returns {object}
 */
function evaluateMarker(alphabet, marker) {
  const byLength=Array.from({length:15},()=>[]);
  for(const entry of lexData){
    const sequence=entry[alphabet];
    if(sequence.length<=14)byLength[sequence.length].push({...entry, sequence});
  }
  let supported=0;
  const unsupported=[];
  for(let i=0;i<exactMasks.length;i++) {
    const mask=exactMasks[i];
    if(!mask.includes(1))continue;
    if(byLength[mask.length].some(x=>maskMatches(x.sequence,marker,mask))) {
      supported++;
    } else {
      unsupported.push({word:i,length:mask.length,mask:mask.join('')});
    }
  }
  const twoLetterEntries=byLength[2];
  const denominator=twoLetterEntries.reduce((s,x)=>s+x.frequency,0);
  const numerator=twoLetterEntries.reduce((s,x)=>s+(x.sequence[0]===marker?x.frequency:0),0);
  const p=numerator/denominator;
  return {alphabet,marker,eventWordsSupported:supported,eventWordsTotal:eventMasks.length,
    unsupported,tworuneFirstObserved:twoFirstEvents,referenceFrequency:numerator,
    referenceDenominator:denominator,referenceProbability:p,
    expectedTworuneFirst:twoMasks.length*p,
    binomialTailAtLeastThree:binomialTailAtLeastThree(twoMasks.length,p)};
}
const lexDecisions=[
  evaluateMarker('latin',10),
  evaluateMarker('gp',28),
  evaluateMarker('gp',27)
];
assert.deepEqual(lexDecisions.map(x=>x.eventWordsSupported),[84,80,80]);
assert.deepEqual(lexDecisions.map(x=>[x.referenceFrequency,x.referenceDenominator]),[
  [11,190784],[103,271902],[1,271902]
]);
assert(lexDecisions[0].unsupported.some(x=>x.length===12&&x.mask==='000001000001'));

/** Direct one-based GP accumulator: P[i] = C[i]-C[i-1]-1 (mod 29).
 * Page-first symbols have no previous original ciphertext and are excluded.
 */
const unknownPages=gpCorpus.pages.filter(p=>p.page<56&&p.indices.length);
const inferred=[];
for(const p of unknownPages){
  for(let i=1;i<p.indices.length;i++) {
    inferred.push((p.indices[i]-p.indices[i-1]+57)%29);
  }
}
assert.equal(inferred.length,12901);
const count29=new Uint32Array(29);
for(const index of inferred) count29[index]++;
assert.equal(count29[28],86);
const adjacentIoC=count29.reduce((s,n)=>s+n*(n-1),0)/
  (inferred.length*(inferred.length-1));
assert(Math.abs(adjacentIoC-0.035325030389447606)<1e-13);
assert.equal(Math.min(...count29.slice(0,28)),401);
assert.equal(Math.max(...count29.slice(0,28)),510);
// Exact planted encoder/decoder at one-based GP values.
const plant=[0,28,12,5,28,1,17,28,25];
let prevCipher=7;
const plantCipher=plant.map(v=>(prevCipher=(prevCipher+v+1)%29));
prevCipher=7;
const plantPlain=plantCipher.map(v=>{
  const decoded=(v-prevCipher+57)%29;
  prevCipher=v;
  return decoded;
});
assert.deepEqual(plantPlain,plant);

console.log(JSON.stringify({
  markerLexiconStatus:'PASS: original word masks vs independent TextBlob lexicon',
  lexiconEntries:lexicon.length,
  observedTwoRuneWords:twoMasks.length,
  originalTwoRuneStartRepeat:twoFirstEvents,
  originalTwoRuneSecondRepeat:twoSecondEvents,
  candidateMarkerMasks:lexDecisions,
  sourceOneBasedAccumulator:{eligibleRunes:inferred.length,
    zeroIncrementSites:count29[28],decodedIoC:adjacentIoC,
    nonRareRuneCountRange:[Math.min(...count29.slice(0,28)),
      Math.max(...count29.slice(0,28))],
    plantRoundTripExact:true,
    originalUnknownPlaintextRecovered:false}
},null,2));
