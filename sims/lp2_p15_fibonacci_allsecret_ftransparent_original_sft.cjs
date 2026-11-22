'use strict';

/**
 * Authentic solved-p56 plaintext-F-bypass inverse for all 29^2 unknown
 * initial Fibonacci GP29 key pairs. Page15 source cue; no guessed F masks.
 * Read-only original-input Windows Node.js 22 CommonJS SFT.
 *
 * K[j+2]=K[j+1]+K[j] mod29; C = P+K[consumed] mod29 for P!=F;
 * P=F (index0) emits C=F and does not consume a key symbol.
 * All 14 key-phase states and all latent plaintext-F branches are retained.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT,name),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runes = new Map(corpus.runes.map((r,i) => [r,i]));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const AIO = new Set([24,10,3]);
/** @param {number} x */
const mod = x => (x%29+29)%29;

/** @returns {Array<{offset:number,cipher:number}>} */
function originalSingletons() {
  const singles = [];
  let word = [],n=0,words=0;
  const finish = () => {
    if (!word.length) return;
    words++;
    if (word.length===1) singles.push(word[0]);
    word=[];
  };
  for (const char of transcript.split('%').slice(0,55).join('%')) {
    if (runes.has(char)) {
      word.push({offset:n,cipher:runes.get(char)});
      n++;
    } else if (char==='%'||char==='/'||/\s/u.test(char)) {
      // Printed words continue over line/page breaks.
    } else finish();
  }
  finish();
  assert.deepEqual([n,words,singles.length],[12956,2896,83]);
  assert.deepEqual(corpus.pages.filter(p=>p.page<=55)
    .flatMap(p=>p.indices).length,n);
  return singles;
}

/** @param {number} a @param {number} b */
function fibonacciKey(a,b) {
  const k=[a,b];
  for (let i=2;i<14;i++) k.push(mod(k[i-1]+k[i-2]));
  assert.equal(mod(k[13]+k[12]),a);
  assert.equal(mod(a+k[13]),b);
  return k;
}

/**
 * Exhaustive F-skip state reachability, preserving key consumption ambiguity.
 * @param {number[]} cipher
 * @param {number[]} key14
 * @param {Set<number>} restrictedSites
 */
function inverse(cipher,key14,restrictedSites) {
  let states=1;
  let matched=0;
  for (let i=0;i<cipher.length;i++) {
    let next=0;
    const c=cipher[i];
    const singleton=restrictedSites.has(i);
    for (let phase=0;phase<14;phase++) {
      if (!(states&(1<<phase))) continue;
      if (c===0 && !singleton) {
        // Literal plaintext F, exact bypass without consuming the key.
        next|=1<<phase;
      }
      const p=mod(c-key14[phase]);
      if (p!==0 && (!singleton||AIO.has(p))) {
        // Normal key-consuming path; plaintext F is forbidden here.
        next|=1<<((phase+1)%14);
      }
    }
    states=next;
    if (!states) return {complete:false,firstImpossible:i,matchedSingletons:matched};
    if (singleton) matched++;
  }
  return {complete:true,firstImpossible:null,matchedSingletons:matched,
    survivingPhaseMask:states};
}

/**
 * Historical F-transparent forward encoder for native-GP control.
 * @param {number[]} plain @param {number[]} key14
 */
function encrypt(plain,key14) {
  let phase=0;
  return plain.map(p=>{
    if(p===0)return 0;
    const c=mod(p+key14[phase]);
    phase=(phase+1)%14;
    return c;
  });
}

const originals = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const firstChapterOffset = corpus.pages.filter(p=>p.page<15)
  .reduce((sum,p)=>sum+p.indices.length,0);
const lastChapterOffset = corpus.pages.filter(p=>p.page<23)
  .reduce((sum,p)=>sum+p.indices.length,0);
assert.deepEqual([firstChapterOffset,lastChapterOffset],[3603,5506]);
const chapter = originals.slice(firstChapterOffset,lastChapterOffset);
assert.equal(chapter.length,1903);
const selected = originalSingletons()
  .filter(s=>s.offset>=firstChapterOffset&&s.offset<lastChapterOffset)
  .map(s=>({offset:s.offset-firstChapterOffset,cipher:s.cipher}));
assert.deepEqual(selected.map(s=>s.offset),
  [135,180,278,403,539,545,573,614,630,755,871,1030,1096,
   1148,1191,1650,1716,1733]);
const singletonPositions = new Set(selected.map(s=>s.offset));
assert.equal(singletonPositions.size,18);
const histogram=Array(19).fill(0);
let best={matchedSingletons:-1};
let legalNoGrammar=0;
let maxNonzeroFail=-1;
const survivingNoGrammar=[];
const fullyCompatible=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++) {
  const key=fibonacciKey(a,b);
  const exact=inverse(chapter,key,singletonPositions);
  histogram[exact.matchedSingletons]++;
  if (exact.matchedSingletons>best.matchedSingletons)
    best={seed:[a,b],...exact};
  if (exact.complete) fullyCompatible.push([a,b]);
  const noGrammar=inverse(chapter,key,new Set());
  if (noGrammar.complete) {
    legalNoGrammar++;
    survivingNoGrammar.push([a,b]);
  } else if ((a!==0||b!==0)
    && noGrammar.firstImpossible>maxNonzeroFail)
    maxNonzeroFail=noGrammar.firstImpossible;
}
assert.deepEqual(histogram,[801,36,4,...Array(16).fill(0)]);
assert.deepEqual(best,{
  seed:[0,4],complete:false,firstImpossible:278,matchedSingletons:2});
assert.equal(fullyCompatible.length,0);
assert.deepEqual(survivingNoGrammar,[[0,0]]);
assert.equal(legalNoGrammar,1);
assert.equal(maxNonzeroFail,368);

const originalPages=corpus.pages.filter(p=>p.page>=15&&p.page<=22);
const pageSurvivors=[];
for(const page of originalPages) {
  let accepted=0,nonzero=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++) {
    const result=inverse(page.indices,fibonacciKey(a,b),new Set());
    if(result.complete) {
      accepted++;
      if(a!==0||b!==0)nonzero++;
    }
  }
  pageSurvivors.push({page:page.page,len:page.indices.length,
    feasibleSeedPairs:accepted,nontrivialFeasible:nonzero});
}
assert.deepEqual(pageSurvivors.map(p=>p.feasibleSeedPairs),
  [143,4,7,11,10,1,2,68]);
assert.deepEqual(pageSurvivors.map(p=>p.nontrivialFeasible),
  [142,3,6,10,9,0,1,67]);

// Native clear p57 plaintext on all 1,903 original source slots;
// A/I/O at each of the exact original 18 printed singleton locations.
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const plantPlain=Array.from({length:chapter.length},(_,i)=>native[i%95]);
selected.forEach((site,j)=>{plantPlain[site.offset]=[24,10,3][j%3];});
for(const seed of [[5,8],[3,17]]) {
  const key=fibonacciKey(seed[0],seed[1]);
  const cipher=encrypt(plantPlain,key);
  const decision=inverse(cipher,key,singletonPositions);
  assert.ok(decision.complete,'true positive hidden seed must survive every source slot');
  assert.equal(decision.matchedSingletons,18);
  assert.equal(cipher.length,1903);
  assert.deepEqual(encrypt(plantPlain,key),cipher);
  console.log('Plant successful',JSON.stringify({
    seed,recoveredAllSourceShape:true,sourceRunes:cipher.length,
    sourceSingletons:18,trueKeyPhaseSurvivors:decision.survivingPhaseMask
  }));
}
console.log('All-secret historical-F-transparent Fibonacci decision',
  JSON.stringify({
    sourceChapter:'physical p15-p22',sourceRunes:chapter.length,
    originalSingletons:18,secretSeedPairsTested:841,
    completeWithSingletonGrammar:fullyCompatible.length,
    singletonMatchHistogram:histogram,best,
    completeIgnoringSingletons:legalNoGrammar,
    completeUnrestrictedSeeds:survivingNoGrammar,
    lastImpossibleOriginalPositionAnyNonzeroSeed:maxNonzeroFail,
    pageResetCipherLegality:pageSurvivors,
    conclusion:'No F-transparent nonzero Fibonacci key can generate full original chapter; only zero-key identity is cipher-legal and it fails English singleton grammar'
  },null,2));
