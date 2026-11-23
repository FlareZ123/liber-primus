'use strict';
/**
 * LP2 p40/p53 quoted-incipit original-source SFT.
 *
 * Run from repository root: node sims/lp2_quote_parallel_incipit_sft.cjs
 * Requires Node 22 and only core libraries. All source strings and numerical
 * verdicts derive from the committed canonical GP29 transcription.
 *
 * Classification: matched printed quote-length structure, with conditional
 * original-cipher constraints; not authenticated repeated plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const marks = new Set(gp.runes);

/**
 * Respect original joined words and page-carried words. Word length is the
 * number of GP rune symbols, not Latin characters/digraph expansions.
 * @param {string} text @returns {{start:number,end:number,length:number}[]}
 */
function printedWords(text) {
  const words = [];
  let pos = 0, start = 0;
  for (const c of text) {
    if (marks.has(c)) pos++;
    else if ('-.$&§'.includes(c) && pos > start) {
      words.push({start, end:pos, length:pos-start});
      start = pos;
    }
  }
  if (pos > start) words.push({start, end:pos, length:pos-start});
  assert.equal(pos, 13136);
  assert.equal(words.length, 2941);
  return words;
}
const words = printedWords(read('resources/liber-primus/lp2-transcription.txt'));
const quotes = annotations.quotes;
assert.equal(quotes.length, 7);

/** @param {{start:number,end:number,length:number}} q */
function quoteLengths(q) {
  const a = words.findIndex(w => w.start === q.start);
  const b = words.findIndex(w => w.end === q.end);
  assert(a >= 0 && b >= a, 'Quoted span must start/end at printed whole-word boundary');
  const out = words.slice(a, b+1).map(w => w.length);
  assert.equal(out.reduce((x, y) => x+y, 0), q.length);
  return out;
}
const profiles = quotes.map(quoteLengths);
const q40 = profiles[3], q53 = profiles[6];
assert.deepEqual(q40, [5,7,2,3,4,6,4,3,3,4,4,4,5,4]);
assert.deepEqual(q53, [5,7,2,3,4,10,3,9,7,3,7,4,3,3]);
assert.deepEqual(quotes.map(q => q.length), [18,19,12,58,68,160,70]);
const lens = words.map(w => w.length);
const opening = '5,7,2,3,4';
const matchingStarts = [];
for (let i=0;i<=lens.length-5;i++) {
  if (lens.slice(i,i+5).join(',') === opening) matchingStarts.push(words[i].start);
}
assert.deepEqual(matchingStarts, [quotes[3].start, quotes[6].start]);
for (let i=0;i<profiles.length;i++) for (let j=i+1;j<profiles.length;j++) {
  let shared = 0;
  while (shared < Math.min(profiles[i].length,profiles[j].length) &&
         profiles[i][shared] === profiles[j][shared]) shared++;
  if (i === 3 && j === 6) assert.equal(shared, 5);
  else assert(shared < 5);
}

/**
 * Exact conditional null pool of original whole-word windows with prescribed
 * number of words and total GP29 rune symbols, exposing first-five lengths.
 * @param {number[]} all @param {number} n @param {number} total
 * @returns {string[]}
 */
function firstFivePool(all,n,total) {
  const out = [];
  for (let i=0;i<=all.length-n;i++) {
    let sum = 0;
    for (let j=0;j<n;j++) sum += all[i+j];
    if (sum === total) out.push(all.slice(i,i+5).join(','));
  }
  return out;
}
/** @param {string[]} a @param {string[]} b */
function pairMatches(a,b) {
  const A = new Map(), B = new Map();
  for (const x of a) A.set(x,(A.get(x)||0)+1);
  for (const x of b) B.set(x,(B.get(x)||0)+1);
  let count=0;
  for (const [x,n] of A) count+=n*(B.get(x)||0);
  return {count, possibilities:a.length*b.length,
    rate:count/(a.length*b.length)};
}
const pools = profiles.map((p,i)=>firstFivePool(lens,p.length,quotes[i].length));
const fixed = pairMatches(pools[3],pools[6]);
assert.deepEqual([pools[3].length,pools[6].length,fixed.count,fixed.possibilities],
  [130,80,1,10400]);
let familyUnion = 0;
for (let i=0;i<profiles.length;i++) for (let j=i+1;j<profiles.length;j++) {
  if (profiles[i].length >= 5 && profiles[j].length >= 5)
    familyUnion += pairMatches(pools[i],pools[j]).rate;
}
assert(Math.abs(familyUnion - 0.0054679614) < 1e-9);

/* Independent, native-GP English controls, matched on both 14-word totals. */
const syllables = gp.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} text @returns {number[]} */
function nativeWordLengths(text) {
  const clean = text.replace(/^#.*$/gm,' ').toUpperCase()
    .replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
  return (clean.match(/[A-Z]+/g)||[]).map(word=>{
    let i=0,n=0;
    while(i<word.length) {
      const glyph = syllables.find(x=>word.startsWith(x,i));
      assert(glyph,'Native source has unmappable symbol in '+word);
      i+=glyph.length;
      n++;
    }
    return n;
  });
}
const donors = [
  ['Gibran','resources/control/gibran_prophet_58585.txt',620,168,7],
  ['Emerson','resources/control/emerson_essays_2944.txt',3671,1301,194],
  ['Shakespeare','resources/control/shakespeare_first300k.txt',2580,515,39]
];
const donorRates = donors.map(([name,file,expectedA,expectedB,expectedHits])=>{
  const native = nativeWordLengths(read(file));
  const A = firstFivePool(native,14,58), B = firstFivePool(native,14,70);
  const hit = pairMatches(A,B);
  assert.deepEqual([A.length,B.length,hit.count],
    [expectedA,expectedB,expectedHits]);
  return {name, ...hit};
});

/* Locked hypothesized duplicate: all 21 runes in the shared 5-word opening. */
const cipher = gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(cipher.length,12956);
const A = cipher.slice(quotes[3].start,quotes[3].start+21);
const B = cipher.slice(quotes[6].start,quotes[6].start+21);
const diff = A.map((v,i)=>(v-B[i]+29)%29);
assert.deepEqual(diff,
  [1,9,7,16,2,10,19,26,27,23,9,5,2,16,26,19,14,27,0,1,11]);
/** @param {number[]} a @returns {Set<string>} */
function equalPairs(a) {
  const out=new Set();
  for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++)
    if(a[i]===a[j]) out.add(i+':'+j);
  return out;
}
const ea=equalPairs(A), eb=equalPairs(B);
assert.deepEqual([ea.size,eb.size,[...ea].filter(x=>eb.has(x)).length],[8,4,0]);

/** @param {number} m @param {number} x @param {number} y */
function periodicAdditiveCompatible(m,x,y) {
  const graph=Array.from({length:m},()=>[]);
  for(let i=0;i<diff.length;i++) {
    const u=(x+i)%m, v=(y+i)%m, d=diff[i];
    graph[v].push([u,d]);
    graph[u].push([v,(29-d)%29]);
  }
  const val=Array(m).fill(null);
  for(let i=0;i<m;i++) {
    if(val[i]!==null)continue;
    val[i]=0;
    const queue=[i];
    for(const u of queue) for(const [v,d] of graph[u]) {
      const proposed=(val[u]+d)%29;
      if(val[v]===null) {val[v]=proposed;queue.push(v);}
      else if(val[v]!==proposed) return false;
    }
  }
  return true;
}
const initialGlobal=Array.from({length:120},(_,i)=>i+1)
  .find(m=>periodicAdditiveCompatible(m,quotes[3].start,quotes[6].start));
const initialLocal=Array.from({length:120},(_,i)=>i+1)
  .find(m=>periodicAdditiveCompatible(m,171,53));
assert.deepEqual([initialGlobal,initialLocal],[22,23]);
assert(!periodicAdditiveCompatible(120,0,0));

/* Genuine p56 totient-of-consecutive-primes additive key, with the only
 * possible common plaintext F transparency position at word-prefix rune18.
 */
const primes=[];
for(let n=2;primes.length<13000;n++) {
  let prime=true;
  for(let d=2;d*d<=n;d++) if(n%d===0) {prime=false;break;}
  if(prime)primes.push(n);
}
const key=primes.map(n=>(n-1)%29);
const bothLiteralF=A.flatMap((z,i)=>z===0&&B[i]===0?[i]:[]);
assert.deepEqual(bothLiteralF,[18]);
const primeTrials=[];
for(const [clock,x,y] of [
  ['global',quotes[3].start,quotes[6].start],
  ['page',171,53],['quote',0,0]
]) for(const sign of [-1,1]) for(const skip18 of [false,true]) {
  let matches=0,skips=0;
  for(let i=0;i<21;i++) {
    const p1=(skip18&&i===18)?0:(A[i]+sign*key[x+i-skips]+29)%29;
    const p2=(skip18&&i===18)?0:(B[i]+sign*key[y+i-skips]+29)%29;
    if(p1===p2 && (!skip18||i===18||p1!==0))matches++;
    if(skip18&&i===18)skips++;
  }
  primeTrials.push({clock,sign,skip18,matches});
  assert(matches<21);
}
assert.equal(Math.max(...primeTrials.map(x=>x.matches)),3);
console.log(JSON.stringify({
  status:'PASS: original cross-page quoted incipit; conditional crib only',
  matchedPages:[40,53], quoteLengths:[14,14],
  sharedOpening:[5,7,2,3,4], conditionalFixed:fixed,
  allSevenQuoteFamilyUnionUpperBound:familyUnion,
  nativeControls:donorRates,
  cipherDifferenceGP29:diff,
  samePlaintextStationaryQuoteSubstitutionPossible:ea.size===eb.size &&
    [...ea].every(x=>eb.has(x)),
  minimalCompatibleAdditivePeriod:{global:initialGlobal,pageLocal:initialLocal},
  realP56PrimeTotientTrials:primeTrials
},null,2));
