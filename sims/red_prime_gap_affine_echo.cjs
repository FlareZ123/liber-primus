"use strict";

/**
 * Source-selected prime-triplet echo test for original LP2 ciphertext.
 * Derived solely from the complete red heading on physical LP2 page 40:
 * its GP-prime sum / 29 selects rune index 15 (S), assigned prime 53.
 * The consecutive primes 47, 53, 59 have equal gaps of 6.
 * For each equal-gap GP-prime center j, test C_i = (p_j - 2 C_(i-gap)) mod29
 * within original complete ciphertext words. Calibrate the two possible
 * centers under an exact-word-multiset, exact-adjacent-doublet-count null.
 *
 * The selected formula coincides with the previously published T6 anomaly.
 * This source link was noticed after that anomaly; it is NOT a fresh
 * discovery-controlled p-value, cipher key, or original LP2 decryption.
 *
 * Run: node sims/red_prime_gap_affine_echo.cjs
 * Optional: set LP2_TRIPLET_REPS to a positive simulation count.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const corpusPath = path.join(ROOT, "resources/liber-primus/lp2-corpus.json");
const annotationPath = path.join(ROOT, "resources/liber-primus/lp2-ink-annotations.json");
const corpusBuffer = fs.readFileSync(corpusPath);
const corpus = JSON.parse(corpusBuffer.toString("utf8"));
const ink = JSON.parse(fs.readFileSync(annotationPath, "utf8"));
const runeIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = parseSharedCorpus().words.map(record =>
  [...record.runes].map(glyph => {
    assert.ok(runeIndex.has(glyph));
    return runeIndex.get(glyph);
  }));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
assert.deepEqual(words.flat(),
  corpus.pages.filter(page => page.status === "unsolved")
    .flatMap(page => page.indices));

/** @param {number} x */
function mod29(x) {return ((x % 29) + 29) % 29;}

/** @param {number[]} word */
function doubles(word) {
  let matches = 0;
  for (let i = 1; i < word.length; i++)
    if (word[i] === word[i - 1]) matches++;
  return matches;
}

/**
 * @param {number[]} word Original rune-index sequence.
 * @param {{index:number,prime:number,gap:number}} model
 */
function countEcho(word, model) {
  let matches = 0;
  for (let i = model.gap; i < word.length; i++)
    if (word[i] === mod29(model.prime - 2 * word[i - model.gap]))
      matches++;
  return matches;
}

/** @param {number} state Nonzero uint32 seed. */
function random32(state) {
  let s = state >>> 0;
  assert.ok(s !== 0);
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return s >>> 0;
  };
}

/** @param {number[]} word @param {() => number} random */
function shuffled(word, random) {
  const copy = word.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sourceSelection() {
  const record = ink.pages.find(entry => entry.page === 40);
  const page = corpus.pages.find(entry => entry.page === 40);
  assert.equal(record.red_spans.length, 1);
  const span = record.red_spans[0];
  assert.equal(span.start, 0);
  assert.equal(span.length, 8);
  const sourceSum = [...span.runes].reduce(
    (total, glyph) => total + corpus.prime[runeIndex.get(glyph)], 0);
  assert.equal(sourceSum, 435);
  assert.equal(sourceSum % 29, 0);
  const center = sourceSum / 29;
  assert.equal(center, 15);
  assert.equal(corpus.runes[center], "ᛋ");
  assert.deepEqual(corpus.prime.slice(center - 1, center + 2), [47, 53, 59]);
  assert.deepEqual(page.indices.slice(0, span.length),
    [...span.runes].map(glyph => runeIndex.get(glyph)));
  let same = 0, divisible = 0;
  for (let start = 0; start < page.indices.length; start++) {
    let sum = 0;
    for (let i = 0; i < span.length; i++)
      sum += corpus.prime[page.indices[(start + i) % page.indices.length]];
    if (sum === sourceSum) same++;
    if (sum % 29 === 0) divisible++;
  }
  assert.equal(same, 1);
  assert.equal(divisible, 8);
  return {page: 40, redRunes: span.runes, runeCount: span.length,
    gpPrimeSum: sourceSum, divisor: 29, selectedIndex: center,
    selectedRune: corpus.runes[center], selectedPrime: corpus.prime[center],
    circularStartControl: {pagePositions: page.indices.length,
      exact435: same, any29Divisible: divisible}};
}


/** Source-only factorization: the T6 fixed point, primitive root and 13-dot exponent. */
function sourceExponent() {
  const source=ink.pages.find(p=>p.page===40).red_spans.find(s=>s.start===0&&s.length===8);
  const last=[...source.runes].at(-1);
  assert.equal(runeIndex.get(last),8);
  let value=1;
  for(let i=0;i<13;i++)value=value*15%29;
  assert.equal(value,27);
  let order=1,v=15;
  while(v!==1){order++;v=v*15%29;}
  assert.equal(order,28);
  const marks=ink.pages.reduce((n,p)=>n+(p.large_punctuation||[])
    .filter(mark=>mark[1]===13).length,0);
  assert.equal(marks,31);
  for(let x=0;x<29;x++)
    assert.equal(mod29(8+value*(x-8)),mod29(24-2*x));
  return {redLastRune:last,redLastRuneIndex:8,redLength:8,
    base:15,exponent:13,source13DotMarks:marks,baseOrder:order,
    power:value,expression:"8+15^13*(x-8)=24-2*x mod29",
    caution:"Retrospective link; thirteen-dot punctuation is common and absent at the selected page40 heading"};
}
/** @param {string} text */
function nativeText(text) {
  return text.split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return !s.startsWith("#")&&!s.startsWith("[")&&!/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
}
/** @param {string} text @param {boolean} alias */
function gpBins(text,alias) {
  const tokens=new Map(corpus.translit.map((s,i)=>[s,i]));
  const bins=new Map();
  for(const rawWord of text.match(/[A-Za-z]+/gu)||[]) {
    let s=rawWord.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    if(alias)s=s.replace(/ING/g,"NG");
    const word=[];
    for(let i=0;i<s.length;) {
      const pair=tokens.get(s.slice(i,i+2));
      if(pair!==undefined){word.push(pair);i+=2;}
      else{const x=tokens.get(s[i]);assert.notEqual(x,undefined);word.push(x);i++;}
    }
    if(!bins.has(word.length))bins.set(word.length,[]);
    bins.get(word.length).push(word);
  }
  return bins;
}
/** @param {number[]} probabilities @param {number} k */
function poissonLow(probabilities,k) {
  const dp=new Float64Array(k+1);dp[0]=1;
  for(const p of probabilities){
    for(let j=k;j>0;j--)dp[j]=dp[j]*(1-p)+dp[j-1]*p;
    dp[0]*=1-p;
  }
  return dp.reduce((s,v)=>s+v,0);
}
/** @param {number[]} probabilities @param {number} k */
function poissonHigh(probabilities,k) {
  const dp=new Float64Array(k+1);dp[0]=1;
  for(const p of probabilities){
    dp[k]+=dp[k-1]*p;
    for(let j=k-1;j>0;j--)dp[j]=dp[j]*(1-p)+dp[j-1]*p;
    dp[0]*=1-p;
  }
  return dp[k];
}
/** Exactly reversible exclusive-T6-as-S toy cipher, independent of real LP2. */
function encS(plain) {
  const c=[];
  for(let i=0;i<plain.length;i++){
    if(i<6)c.push(mod29(plain[i]+15));
    else{
      const t=mod29(24-2*c[i-6]);
      const rank=plain[i]<15?plain[i]+1:plain[i];
      c.push(plain[i]===15?t:mod29(t+rank));
    }
  }
  return c;
}
/** @param {number[]} c */
function decS(c) {
  const p=[];
  for(let i=0;i<c.length;i++){
    if(i<6)p.push(mod29(c[i]-15));
    else{
      const rank=mod29(c[i]-mod29(24-2*c[i-6]));
      p.push(rank===0?15:rank<=15?rank-1:rank);
    }
  }
  return p;
}
/** Necessary source-position check if T6 equals literal plaintext S inside intact GP words. */
function sourceSRole(){
  const original={eligibleWords:0,positions:0,hits:0,final:0,penultimate:0,earlier:0};
  const sizeCounts=new Map();
  for(const w of words){
    if(w.length<7)continue;
    original.eligibleWords++;
    sizeCounts.set(w.length,(sizeCounts.get(w.length)||0)+1);
    for(let i=6;i<w.length;i++){
      original.positions++;
      if(w[i]!==mod29(24-2*w[i-6]))continue;
      original.hits++;
      original.final+=Number(i===w.length-1);
      original.penultimate+=Number(i===w.length-2);
      original.earlier+=Number(i<w.length-2);
    }
  }
  assert.deepEqual(original,{eligibleWords:559,positions:1290,hits:80,
    final:32,penultimate:28,earlier:20});
  const sources=[
    ["solved-Cicada","resources/liber-primus/lp1-plaintext-reference.txt"],
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"]
  ];
  const comparisons=[];
  let plantBins;
  for(const [name,file] of sources){
    const raw=fs.readFileSync(path.join(ROOT,file),"utf8");
    const text=name==="solved-Cicada"?nativeText(raw):raw;
    for(const ingAlias of [false,true]){
      const bins=gpBins(text,ingAlias);
      if(name==="Shakespeare"&&!ingAlias)plantBins=bins;
      const pf=[],pp=[];let expectedTotal=0,possiblePenultimate=0,minPool=Infinity;
      for(const [L,n] of sizeCounts){
        const bin=bins.get(L);
        assert(bin&&bin.length,name+" missing GP word length "+L);
        minPool=Math.min(minPool,bin.length);
        let all=0,final=0,pen=0;
        for(const w of bin){
          final+=Number(w[L-1]===15);
          if(L>=8)pen+=Number(w[L-2]===15);
          for(let i=6;i<L;i++)all+=Number(w[i]===15);
        }
        expectedTotal+=n*all/bin.length;
        if(pen)possiblePenultimate+=n;
        for(let j=0;j<n;j++){pf.push(final/bin.length);pp.push(pen/bin.length);}
      }
      assert.equal(pf.length,559);
      comparisons.push({source:name,ingAlias,
        sourceWords:[...bins.values()].reduce((n,w)=>n+w.length,0),
        minimumSourceLengthPool:minPool,expectedS:expectedTotal,
        expectedFinalS:pf.reduce((s,v)=>s+v,0),
        expectedPenultimateS:pp.reduce((s,v)=>s+v,0),
        maximumFiniteVocabularyPenultimate:possiblePenultimate,
        pFinalAtMost32:poissonLow(pf,32),
        pPenultimateAtLeast28:poissonHigh(pp,28)
      });
    }
  }
  const native=comparisons.find(c=>c.source==="solved-Cicada"&&!c.ingAlias);
  assert.equal(native.maximumFiniteVocabularyPenultimate,4);
  assert.equal(native.pPenultimateAtLeast28,0);
  const plantedWords=words.map((w,i)=>{
    const bin=plantBins.get(w.length);assert(bin&&bin.length);
    return bin[(Math.imul(i,3301)+17)%bin.length];
  });
  const encrypted=plantedWords.map(encS),decrypted=encrypted.map(decS);
  assert.deepEqual(decrypted,plantedWords);
  let symbols=0,runicS=0,echoS=0;
  for(let i=0;i<encrypted.length;i++)for(let j=6;j<encrypted[i].length;j++){
    const hit=encrypted[i][j]===mod29(24-2*encrypted[i][j-6]);
    const s=plantedWords[i][j]===15;
    assert.equal(hit,s);
    symbols++;runicS+=Number(s);echoS+=Number(hit);
  }
  assert.equal(symbols,1290);
  return {original,sourceComparisons:comparisons,
    controlledPlant:{words:2896,exactRecoveredRunes:decrypted.flat().length,
      eligibleSlots:symbols,plainS:runicS,cipherT6:echoS,exactMarkers:true},
    limitation:"Only intact ciphertext-to-plaintext word boundaries with exclusive literal GP-S T6 channel; intermediate codecs or independently segmented plaintext may evade this gate"};
}

/** @param {number} replicates @param {number} seed */
function analyze(replicates, seed) {
  assert.ok(Number.isSafeInteger(replicates) && replicates > 0);
  const source = sourceSelection();
  const centers = [];
  for (let index = 1; index < corpus.prime.length - 1; index++) {
    const gapBefore = corpus.prime[index] - corpus.prime[index - 1];
    const gapAfter = corpus.prime[index + 1] - corpus.prime[index];
    if (gapBefore === gapAfter)
      centers.push({index, prime: corpus.prime[index], gap: gapBefore});
  }
  assert.deepEqual(centers, [{index: 2, prime: 5, gap: 2},
    {index: 15, prime: 53, gap: 6}]);
  assert.ok(centers.some(center => center.index === source.selectedIndex));
  const observed = centers.map(model =>
    words.reduce((sum, word) => sum + countEcho(word, model), 0));
  assert.deepEqual(observed, [230, 80]);
  const eligible = centers.map(model =>
    words.reduce((sum, word) => sum + Math.max(0, word.length - model.gap), 0));
  assert.deepEqual(eligible, [7247, 1290]);

  const random = random32(seed);
  const doublesPerWord = words.map(doubles);
  const sums = [0, 0], squares = [0, 0], counts = [0, 0];
  const simulations = [];
  for (let t = 0; t < replicates; t++) {
    const measurement = [0, 0];
    for (let wi = 0; wi < words.length; wi++) {
      const original = words[wi];
      if (original.length < 3) continue;
      let permuted;
      do {
        permuted = shuffled(original, random);
      } while (doubles(permuted) !== doublesPerWord[wi]);
      for (let j = 0; j < centers.length; j++)
        measurement[j] += countEcho(permuted, centers[j]);
    }
    for (let j = 0; j < centers.length; j++) {
      const value = measurement[j];
      sums[j] += value;
      squares[j] += value * value;
      if (value >= observed[j]) counts[j]++;
    }
    simulations.push(measurement);
  }
  const means = sums.map(total => total / replicates);
  const sds = squares.map((total, j) =>
    Math.sqrt(total / replicates - means[j] * means[j]));
  const zScores = observed.map((count, j) =>
    (count - means[j]) / sds[j]);
  const actualMaximum = Math.max(...zScores);
  const maximumExceedances = simulations.filter(sample =>
    sample.some((count, j) =>
      (count - means[j]) / sds[j] >= actualMaximum)).length;
  return {
    status: "postselected source-to-cipher crosslink, no key/plaintext recovered",
    input: {words: words.length, runes: 12956,
      sourceSha256: crypto.createHash("sha256").update(corpusBuffer).digest("hex")},
    source,
    sourceExponent: sourceExponent(),
    literalSRole: sourceSRole(),
    candidateRule: "At equal GP-prime gap d around p[j], test C[i] = (p[j] - 2*C[i-d]) mod 29 within complete words",
    candidateCenters: centers.map((model, j) => ({...model,
      eligiblePositions: eligible[j], observedHits: observed[j],
      unconditionedUniformMean: eligible[j] / 29,
      nullMean: means[j], nullSd: sds[j],
      nullZ: zScores[j], nullUpperTail: (1 + counts[j]) / (replicates + 1)})),
    null: {seed: "0x" + seed.toString(16), replicates,
      conditioning: "Each complete word preserves length, rune multiset and exact adjacent repeat count",
      maximumZ: actualMaximum, exceedances: maximumExceedances,
      twoCenterFamilyUpperTail: (1 + maximumExceedances) / (replicates + 1)},
    caveat: "The T6 formula and p40→15 red-pointer relation were previously found independently; this exact bridge was identified after both. Null corrects only the two equal-prime-gap centers, not historical hypothesis selection."
  };
}

if (require.main === module) {
  const reps = Number(process.env.LP2_TRIPLET_REPS || 1500);
  console.log(JSON.stringify(analyze(reps, 0x33011553), null, 2));
}
module.exports = {analyze, sourceSelection, countEcho, sourceExponent, sourceSRole};
