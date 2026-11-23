'use strict';

/**
 * Original LP2 GP29 additive-key-increment lower-bound and native-register plants.
 *
 * A plaintext-independent stationary additive key increment V has
 *   C_i - C_(i-1) = (P_i - P_(i-1)) + V_i (mod 29).
 * Therefore Pr(C_i=C_(i-1)) = sum_d p_P(d) * q_V(-d)
 *                              >= min_d p_P(d).
 * This inequality is an EXPECTED-rate restriction under independence, not
 * an all-keys deterministic cipher exclusion: a one-time pad may correlate
 * with an already-fixed word stream by coincidence, and the unknown plaintext
 * may have different transition frequencies. The source-shaped controls test
 * whether the original's suppression is typical for natural GP English.
 *
 * Windows 11, Node.js 22; all inputs read-only; no packages; no files written.
 * Usage: node sims/lp2_independent_increment_native_lowerbound_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printed = read('resources/liber-primus/lp2-transcription.txt');
const originalPages = corpus.pages.filter(page => page.page <= 55);
const original = originalPages.flatMap(page => page.indices);
assert.equal(original.length, 12956);
assert.equal(corpus.translit.length, 29);

/** @type {Set<number>} Original physical page-start positions. */
const cuts = new Set();
let lengthSoFar = 0;
for (const page of originalPages) {
  if (lengthSoFar) cuts.add(lengthSoFar);
  lengthSoFar += page.indices.length;
}
assert.equal(lengthSoFar, original.length);

/**
 * @param {number[]} runes
 * @returns {number[]} 29 circular adjacent-difference counts, omitting physical page breaks
 */
function differences(runes) {
  const count = Array(29).fill(0);
  assert.equal(runes.length, original.length);
  for (let i = 1; i < runes.length; i++) {
    if (!cuts.has(i)) count[(runes[i] - runes[i - 1] + 29) % 29]++;
  }
  return count;
}
/**
 * Nontrivial Fourier magnitudes of an empirical circular GP29 difference distribution.
 * Independence gives spectrum(C)=spectrum(P)*spectrum(K) and |spectrum(K)| <= 1.
 * @param {number[]} histogram
 * @returns {number[]}
 */
function spectrum(histogram) {
  const total = histogram.reduce((sum, x) => sum + x, 0);
  assert.ok(total > 0);
  return Array.from({length: 14}, (_, k) => {
    let real = 0, imag = 0;
    for (let d = 0; d < 29; d++) {
      const angle = 2 * Math.PI * (k + 1) * d / 29;
      real += histogram[d] * Math.cos(angle);
      imag += histogram[d] * Math.sin(angle);
    }
    return Math.hypot(real, imag) / total;
  });
}
const origCounts = differences(original);
assert.equal(origCounts.reduce((a, b) => a + b, 0), 12901);
assert.equal(origCounts[0], 86);
assert.deepEqual(origCounts, [86,457,503,436,435,445,430,470,425,510,
  497,454,443,499,470,468,446,401,432,472,467,460,420,485,
  466,466,456,472,430]);
const originalSpectrum = spectrum(origCounts);
assert.ok(Math.abs(originalSpectrum[4] - 0.043846016962099) < 1e-12);
/** @param {number[]} sourceSpectrum */
function excludedFourierModes(sourceSpectrum) {
  return sourceSpectrum.flatMap((amplitude, i) =>
    originalSpectrum[i] > amplitude + 1e-12
      ? [{harmonic: i + 1, plainAmplitude: amplitude,
          cipherAmplitude: originalSpectrum[i]}] : []);
}

const runeSet = new Set(corpus.runes);
const slotLengths = [];
let runeCount = 0;
let currentLength = 0;
for (const mark of printed) {
  if (runeSet.has(mark)) {
    currentLength++;
    runeCount++;
    if (runeCount === original.length) {
      slotLengths.push(currentLength);
      break;
    }
  } else if (mark === '-' || mark === '.' || mark === '&') {
    if (currentLength) slotLengths.push(currentLength);
    currentLength = 0;
  }
}
assert.equal(runeCount, 12956);
assert.equal(slotLengths.length, 2896);
assert.equal(slotLengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(Math.max(...slotLengths), 14);

const spellings = [...corpus.translit].sort((a, b) => b.length - a.length);
const gpIndex = new Map(corpus.translit.map((token, i) => [token, i]));
/**
 * Native GP orthography as in prior established LP2 corpus control encoders.
 * @param {string} raw
 * @returns {number[]}
 */
function gpWord(raw) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out.push(21); i += 3; continue; }
    if (word.startsWith('IO', i)) { out.push(27); i += 2; continue; }
    const token = spellings.find(t => word.startsWith(t, i));
    assert.ok(token, 'Unknown GP orthography ' + raw);
    out.push(gpIndex.get(token));
    i += token.length;
  }
  return out;
}
/**
 * @param {string} sourceText
 * @returns {{buckets:number[][][],nWords:number,nRunes:number,fullSourceDeltas:number[]}}
 */
function donor(sourceText) {
  const sourceWords = sourceText.match(/[A-Za-z]+/g) || [];
  const buckets = Array.from({length: 15}, () => []);
  let nRunes = 0;
  let lastSymbol = null;
  const fullSourceDeltas = Array(29).fill(0);
  for (const w of sourceWords) {
    const g = gpWord(w);
    nRunes += g.length;
    if (g.length <= 14) buckets[g.length].push(g);
    for (const rune of g) {
      if (lastSymbol !== null) fullSourceDeltas[(rune - lastSymbol + 29) % 29]++;
      lastSymbol = rune;
    }
  }
  for (const width of new Set(slotLengths)) assert.ok(buckets[width]?.length,
    'Missing native GP word-length bucket ' + width);
  assert.equal(fullSourceDeltas.reduce((a,b)=>a+b,0),nRunes-1);
  return {buckets, nWords: sourceWords.length, nRunes, fullSourceDeltas};
}

/** Exact conversion of a fixed word stream to stationary-increment pad and back. */
function counterPad(runes, step, decrypt = false) {
  return runes.map((x, i) => ((x + (decrypt ? -step : step) * i) % 29 + 29) % 29);
}
function sourceRunicFirstParty() {
  const source = read('resources/transcriptions/lp1_wulfic_canonical.txt');
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const groups = source.split('%');
  const pages = [];
  for (const index of [3, 8, 9, 10, 11, 14]) {
    const local = groups[index].split('&').map(part => [...part]
      .filter(glyph => runeIndex.has(glyph))
      .map(glyph => runeIndex.get(glyph))).filter(x => x.length);
    pages.push(...local);
  }
  let counts = Array(29).fill(0);
  let nRunes = 0, nPairs = 0;
  for (const page of pages) {
    nRunes += page.length;
    for (let i = 1; i < page.length; i++) {
      nPairs++;
      counts[(page[i] - page[i - 1] + 29) % 29]++;
    }
  }
  assert.deepEqual([pages.length, nRunes, nPairs, counts[0], Math.min(...counts)],
    [10, 1001, 991, 28, 7]);
  return {pages: pages.length, nRunes, nPairs, nativeRepeats: 28,
    minimumPossibleRepeatCountUnderOneCounterStep: 7,
    minimumNativeDifferenceResidue: counts.indexOf(7),
    allKeyFourierIncompatibilities: excludedFourierModes(spectrum(counts)), deltaCounts: counts};
}

/**
 * Stronger source-visible case: allow unrelated stationary additive increment
 * laws in EACH of the nine physically printed visual chapters, rather than
 * one shared unknown distribution for the whole book. The key's best zero-
 * difference probability in a chapter is its rarest plaintext difference.
 *
 * Also calculate the mathematically OPTIMISTIC floor for all 55 independent
 * rune-bearing page keys and how many arbitrary contiguous page-zone resets
 * would be needed to make the expected doublet count <= 86. This is an
 * expectation bound, not a deterministic impossibility for any chosen pad.
 * @param {number[]} data
 */
function chapterAndPageKeyFloors(data) {
  const zones = [[0,2],[3,7],[8,14],[15,22],[23,26],
    [27,32],[33,39],[40,53],[54,55]];
  const pageRows = [];
  const chapterRows = zones.map(()=>Array(29).fill(0));
  let pos=0;
  for (const page of originalPages) {
    if (!page.indices.length) continue;
    const row=Array(29).fill(0);
    for(let i=1;i<page.indices.length;i++)
      row[(data[pos+i]-data[pos+i-1]+29)%29]++;
    const chapter=zones.findIndex(([a,b])=>page.page>=a && page.page<=b);
    assert.ok(chapter>=0);
    row.forEach((v,r)=>chapterRows[chapter][r]+=v);
    pageRows.push(row);
    pos+=page.indices.length;
  }
  assert.equal(pos,12956);
  assert.equal(pageRows.length,55);
  assert.equal(chapterRows.reduce((n,c)=>n+c.reduce((a,b)=>a+b,0),0),12901);
  const minSum=rows=>rows.reduce((n,c)=>n+Math.min(...c),0);
  const fixedChapterFloor=minSum(chapterRows);
  const fullyVariablePageFloor=minSum(pageRows);

  // Exact partition DP: each zone contains >=1 whole original page; an
  // unconstrained stationary key-increment distribution per zone; minimize
  // expected zero-deltas over ALL possible cuts at original physical seams.
  const size=pageRows.length;
  const intervalCosts=Array.from({length:size},()=>new Float64Array(size+1));
  for(let i=0;i<size;i++){
    const counts=new Int32Array(29);
    for(let j=i+1;j<=size;j++){
      pageRows[j-1].forEach((x,r)=>counts[r]+=x);
      intervalCosts[i][j]=Math.min(...counts);
    }
  }
  let prior=Array(size+1).fill(Infinity);
  prior[0]=0;
  let firstAchievableZones=null;
  const fixedZoneFloor={};
  for(let z=1;z<=size;z++){
    const next=Array(size+1).fill(Infinity);
    for(let j=z;j<=size;j++)
      for(let i=z-1;i<j;i++)
        next[j]=Math.min(next[j],prior[i]+intervalCosts[i][j]);
    prior=next;
    if(z===10 || z===20)fixedZoneFloor[z]=next[size];
    if(firstAchievableZones===null && next[size]<=86)
      firstAchievableZones=z;
  }
  assert.equal(prior[size],fullyVariablePageFloor);
  return {nineVisibleChapterFloor:fixedChapterFloor,
    fiftyFiveIndependentPageFloor:fullyVariablePageFloor,
    minimumArbitraryPageZonesForAtMost86ExpectedDoublets:
      firstAchievableZones, fixedZoneFloor};
}
const counts = [];
const donors = [
  ['Gibran', donor(read('resources/control/gibran_prophet_58585.txt'))],
  ['Shakespeare', donor(read('resources/control/shakespeare_first300k.txt'))]
];
assert.deepEqual(donors.map(([,s]) => [s.nWords,s.nRunes]),
  [[15733,62492],[55407,217106]]);

for (const [name, source] of donors) {
  const minima = [];
  const originalShapedRepeats = [];
  const rarestResidues = [];
  const chapterFloors=[], pageFloors=[], zone10Floors=[], zone20Floors=[];
  const requiredZoneCounts=[];
  let sourceShapeFourierFailures = 0;
  // This is exactly the source-shaped 128-plant experiment, seeded once
  // per donor and advanced continuously through all 2,896 word slots.
  let state = 0x33011717;
  for (let sample = 0; sample < 128; sample++) {
    const plant = [];
    for (const len of slotLengths) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const pool = source.buckets[len];
      plant.push(...pool[(state >>> 0) % pool.length]);
    }
    assert.equal(plant.length, original.length);
    const histogram = differences(plant);
    const stateful=chapterAndPageKeyFloors(plant);
    chapterFloors.push(stateful.nineVisibleChapterFloor);
    pageFloors.push(stateful.fiftyFiveIndependentPageFloor);
    zone10Floors.push(stateful.fixedZoneFloor[10]);
    zone20Floors.push(stateful.fixedZoneFloor[20]);
    requiredZoneCounts.push(
      stateful.minimumArbitraryPageZonesForAtMost86ExpectedDoublets);
    const min = Math.min(...histogram);
    minima.push(min);
    originalShapedRepeats.push(histogram[0]);
    rarestResidues.push(histogram.indexOf(min));
    const frequencies = spectrum(histogram);
    if (excludedFourierModes(frequencies).length) sourceShapeFourierFailures++;
    if (sample === 0) {
      // A shift at the *rarest native difference* attains the exact lower
      // count for a single deterministic counter key. It stays visibly
      // nonuniform in the remaining 28 bins, unlike the original.
      const step = (29 - histogram.indexOf(min)) % 29;
      const encrypted = counterPad(plant, step);
      assert.deepEqual(counterPad(encrypted, step, true), plant);
      assert.equal(differences(encrypted)[0], min);
      assert.ok(spectrum(differences(encrypted)).every((value, i) =>
        Math.abs(value - frequencies[i]) < 1e-10),
        'Counterpad GP29 difference spectra must be pure circular shifts');
    }
  }
  minima.sort((a, b) => a - b);
  originalShapedRepeats.sort((a, b) => a - b);
  const range = seq=>{
    const copy=[...seq].sort((a,b)=>a-b);
    return {min:copy[0],median:copy[64],max:copy[127],
      samplesAtOrBelow86:copy.filter(x=>x<=86).length};
  };
  counts.push({donor: name, controls: 128, sourceWords: source.nWords,
    sourceRunes: source.nRunes, minimumNativeDifferenceCount: {
      min: minima[0], median: minima[64], max: minima[127]},
    nativeActualRepeatCount: {
      min: originalShapedRepeats[0], max: originalShapedRepeats[127]},
    dominantRarestDelta: rarestResidues.reduce((acc, x) =>
      (acc[x] = (acc[x] || 0) + 1, acc), {}),
    sourceShapeFourierFailures,
    sourceResetKeyFloors: {
      nineVisibleChapters:range(chapterFloors),
      tenFreelyPlacedPageZones:range(zone10Floors),
      twentyFreelyPlacedPageZones:range(zone20Floors),
      fiftyFiveIndependentPages:range(pageFloors),
      plantsWithAnyPageSeamPartitionMatching86:
        requiredZoneCounts.filter(x=>x!==null).length,
      minimumRequiredPageZonesAmongThosePlants:
        requiredZoneCounts.filter(x=>x!==null).length ?
        Math.min(...requiredZoneCounts.filter(x=>x!==null)) : null
    },
    allKeyFourierIncompatibilitiesFullDonor: excludedFourierModes(
      spectrum(source.fullSourceDeltas))});
}
assert.deepEqual(counts.map(x => x.minimumNativeDifferenceCount),
  [{min:151,median:188,max:227},{min:165,median:209,max:249}]);
assert.deepEqual(counts.map(x => x.nativeActualRepeatCount),
  [{min:381,max:486},{min:400,max:492}]);
assert.ok(counts.every(x=>x.minimumNativeDifferenceCount.min > 86));
assert.deepEqual(counts.map(x => x.sourceShapeFourierFailures),[50,128]);
assert.deepEqual(counts.map(x => x.sourceResetKeyFloors.nineVisibleChapters),
  [{min:149,median:174,max:193,samplesAtOrBelow86:0},
   {min:161,median:192,max:221,samplesAtOrBelow86:0}]);
assert.deepEqual(counts.map(x => x.sourceResetKeyFloors.fiftyFiveIndependentPages),
  [{min:81,median:96,max:110,samplesAtOrBelow86:10},
   {min:88,median:106,max:124,samplesAtOrBelow86:0}]);
assert.deepEqual(counts.map(x => x.sourceResetKeyFloors.tenFreelyPlacedPageZones),
  [{min:126,median:146,max:166,samplesAtOrBelow86:0},
   {min:136,median:162,max:187,samplesAtOrBelow86:0}]);
assert.deepEqual(counts.map(x => x.sourceResetKeyFloors.twentyFreelyPlacedPageZones),
  [{min:107,median:122,max:141,samplesAtOrBelow86:0},
   {min:118,median:136,max:160,samplesAtOrBelow86:0}]);
assert.equal(counts[0].allKeyFourierIncompatibilitiesFullDonor[0].harmonic,1);
assert.equal(counts[1].allKeyFourierIncompatibilitiesFullDonor[0].harmonic,1);


/**
 * Primal/dual certificates for the *whole* GP29 difference distribution.
 *
 * For a fixed plaintext native delta law p, all independent stationary
 * additive increment laws q lie in the convex hull of 29 cyclic shifts of p.
 * For any certificate 0<=v[d]<=1, the total-variation distance obeys
 *
 *   TV(c,p*q) >= dot(v,c) - max_j dot(v,shift_j(p)).
 *
 * A supplied nonnegative q with sum1 gives an attainable upper bound.
 * Equality of the bounds certifies the exact global optimum, independently
 * of the optimizer used to find these vectors. Witnesses obtained with
 * SciPy HiGHS, then FROZEN as data; this Node program checks them from scratch.
 */
const convolutionCertificates = {
  Gibran: {
    dual: [
      0,0.886577546447720,0.853654048682991,0.894238916220717,1,
      0.948698128238870,0.796679395846780,1,0.364882276495596,
      0.893664870799552,0.884231793575851,1,0.739664907872389,1,
      1,1,0.918510505935619,0.433372394311454,0.918464157980121,
      1,0.007227641035081,1,0.310592918226174,1,0.769930205159138,
      1,0.517068391528606,0.959900830092424,0.849461291029766],
    primal: [
      0.058565608079121,0.032378955253077,0,0,0.123018445332227,
      0.050966728187590,0,0.069498580573593,0.045923742533399,0,
      0.082564624834091,0.073053610947069,0.021503211532858,
      0.000657476041774,0,0,0.043019049351124,0.069339438396016,
      0.024026608021657,0,0.002447146682763,0,0.071006482937008,0,
      0.081678476742025,0.083741543263695,0,0.018801259190142,
      0.047809012100770],
    target: 0.0200894452497737
  },
  Shakespeare: {
    dual: [
      0,0.738112431984205,1,0.683001003998659,1,0.493753053584455,
      1,1,0,0.895075832853168,0.805564881000530,0.831068978199515,
      0.844313987597061,1,1,1,0.914132031447635,0.064490521811919,
      1,0.999541067555562,0,1,0.408701846675700,0.947718385515487,
      0.800685019991840,0.564189568671489,0.497116762972415,
      0.958125015211440,0.407384454616524],
    primal: [
      0.031562287892632,0,0,0,0.115116349019518,0.072346528260990,
      0,0.051421376521191,0.013143553515595,0,0.057584997734781,
      0.018658427944587,0.003902726484975,0.050372272293114,0,0,
      0.090823677144463,0.011620933100793,0.040338744059325,0,
      0.020261889652051,0,0.136712798274058,0,0.104292447241372,
      0.153589207047988,0,0.005256982203557,0.022994801609008],
    target: 0.0227007601866970
  },
  AuthorLP1: {
    dual: [
      0,0.687045212962449,1,1,0.439685159886845,0.096539342995993,
      0.311500906036582,0.789808649538263,0.692295189302714,1,1,1,
      0.627820882503046,1,1,0.945957527486982,0.924985280009610,
      0.781860463169317,0.931166458730515,1,1,0.663305138454793,
      0.694800370366909,0.904722220687505,0.546324339898270,1,
      0.922586987742662,0.640375044261994,0],
    primal: [
      0.049100972561278,0,0.027279917138966,0.096113215648078,
      0.155940208839403,0,0,0.014776781111400,0.026252841511724,
      0.050137909157953,0.136025199900663,0.081020762011371,
      0.025278134866945,0,0,0,0.029237468926561,0,0,0,
      0.060409824284146,0,0.088469838784539,0,0.043268103161617,
      0.050196086435013,0.030614092119794,0.033273544209688,
      0.002605099330831],
    target: 0.0213266856965488
  }
};
/**
 * @param {number[]} plainCounts
 * @param {{dual:number[],primal:number[],target:number}} cert
 */
function certifyConvolution(plainCounts, cert) {
  const plainTotal = plainCounts.reduce((a,b)=>a+b,0);
  const cipherTotal = origCounts.reduce((a,b)=>a+b,0);
  const p = plainCounts.map(x=>x/plainTotal);
  const c = origCounts.map(x=>x/cipherTotal);
  const {dual, primal, target} = cert;
  assert.equal(dual.length,29);
  assert.equal(primal.length,29);
  assert.ok(dual.every(x=>x>=0 && x<=1));
  assert.ok(primal.every(x=>x>=0));
  assert.ok(Math.abs(primal.reduce((a,b)=>a+b,0)-1)<1e-10);
  const shiftExpectation = Array.from({length:29},(_,j)=>
    dual.reduce((sum,w,d)=>sum+w*p[(d-j+29)%29],0));
  const certifiedLower = dual.reduce((sum,w,d)=>sum+w*c[d],0)
    - Math.max(...shiftExpectation);
  const predicted = Array.from({length:29},(_,d)=>
    primal.reduce((sum,q,j)=>sum+q*p[(d-j+29)%29],0));
  const attainedUpper = predicted.reduce((sum,x,d)=>sum+Math.abs(x-c[d]),0)/2;
  assert.ok(certifiedLower>0);
  assert.ok(attainedUpper+1e-10>=certifiedLower);
  assert.ok(Math.abs(certifiedLower-target)<1e-10);
  assert.ok(Math.abs(attainedUpper-target)<1e-10);
  return {optimalTotalVariationDistance:certifiedLower,
    minimumAbsoluteDifferenceMassOn12901OriginalPositions:
      certifiedLower*12901,
    positiveProbabilityWeights:primal.filter(x=>x>1e-10).length,
    dualCertificateLower:certifiedLower,primalWitnessUpper:attainedUpper,
    bestAchievableDoubletRateInJointL1Fit:predicted[0]};
}
const originalFirstParty = sourceRunicFirstParty();
const exactConvolutionTV = {
  Gibran: certifyConvolution(donors[0][1].fullSourceDeltas,
    convolutionCertificates.Gibran),
  Shakespeare: certifyConvolution(donors[1][1].fullSourceDeltas,
    convolutionCertificates.Shakespeare),
  AuthorLP1: certifyConvolution(originalFirstParty.deltaCounts,
    convolutionCertificates.AuthorLP1)
};

const nonzero = origCounts.slice(1);
const mean = nonzero.reduce((a,b)=>a+b,0)/nonzero.length;
const nonzeroChi2 = nonzero.reduce((sum,n)=>sum+(n-mean)**2/mean,0);
assert.ok(Math.abs(nonzeroChi2 - 42.05595005852516) < 1e-9);

const result = {
  source: 'original LP2 p0–55 12,956 GP29 runes, 55 rune-bearing physical pages, 2,896 printed words',
  observed: {withinPagePairs:12901,repeatPairs:86,
    repeatRate:86/12901, nonzeroMod29DifferenceChi2df27:nonzeroChi2},
  independentIncrementExpectation: 'Pr(Cdiff=0) = sum_d Pr(Pdiff=d) Pr(Kdiff=-d) >= min_d Pr(Pdiff=d)',
  spectralExpectation: 'For each k=1..14, |DFT(Cdiff)[k]| <= |DFT(Pdiff)[k]| for any stationary independent increment distribution; a violating native control excludes an exact population convolution, not every finite plaintext instance',
  originalNonzeroFourierMagnitudes: originalSpectrum,
  nativeSourceWordshapeExactLengthPlants: counts,
  firstPartyClearLP1: originalFirstParty,
  allIndependentStationaryAdditiveIncrementMixtures: exactConvolutionTV,
  positive: 'Exact deterministic additive counter-pad forward+inverse plants pass and attain their native-delta minimum by choosing the best constant step',
  decision: 'Original repeats are below all 256 native donor wordshape-plant minimum transition counts, and source-shape Fourier constraints fail for 50 Gibran plus all 128 Shakespeare controls. Exact population convolution also fails at author LP1 modes 4 and 5 despite that source having a 7/991 native delta. These are model-dependent expected-register conflicts, NOT an all-key, all-language or finite one-time-pad impossibility.'
};
console.log(JSON.stringify(result, null, 2));
