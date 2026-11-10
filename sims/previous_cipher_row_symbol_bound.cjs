"use strict";
/**
 * Exact maximum one-symbol plaintext count for any BOOK-WIDE bijective
 * predecessor-ciphertext row substitution of the original LP2 runes.
 *
 * C[page,i] = S[C[page,i-1]][P[page,i]], i >= 1.
 * Every one of the 29 rows S[x] is an arbitrary permutation of all 29 runes,
 * shared across all 55 rune-bearing physical pages. The first rune of each
 * page is unconstrained, deliberately making the bound generous.
 *
 * For every plaintext rune a, a fixed row can map a to precisely one next
 * ciphertext rune y. Thus count(P=a) at within-page transitions is bounded
 * by sum_x max_y count(Cprev=x,Cnext=y). This exact combinatorial bound
 * includes NONZERO and ZERO ciphertext steps. It requires no key search,
 * language score, independence assumption or fitted cipher parameters.
 *
 * The key-independent bound applies to the F29 zero-step-EA construction
 * with a fixed 29-state ciphertext-dependent F28 pad, as a subfamily.
 * It does not apply to a page-varying row table or a lossy repair channel.
 *
 * Run: node sims/previous_cipher_row_symbol_bound.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const M = 29;
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);

/** @param {number[][]} inputPages */
function rows(inputPages) {
  const counts = Array.from({length: M}, () => Array(M).fill(0));
  for (const page of inputPages)
    for (let i = 1; i < page.length; i++)
      counts[page[i - 1]][page[i]]++;
  return counts;
}
/** @param {number[][]} counts */
function rowBound(counts) {
  return counts.reduce((total, row) => total + Math.max(...row), 0);
}

/**
 * Construct an explicit 29x29 inverse S-box that ATTAINS the bound for
 * a chosen plaintext symbol across every within-page transition.
 * @param {number[][]} counts
 * @param {number} target
 */
function witnessInverse(counts, target) {
  return counts.map(countRow => {
    const winningCipher = countRow.indexOf(Math.max(...countRow));
    const remaining = Array.from({length: M}, (_, i) => i)
      .filter(i => i !== target);
    let j = 0;
    return Array.from({length: M}, (_, ciphertext) =>
      ciphertext === winningCipher ? target : remaining[j++]);
  });
}

/**
 * All plaintext characters after each page's first rune are decoded under
 * the same shared rows. Page-first runes are copied for the witness.
 * @param {number[][]} ciphertext
 * @param {number[][]} inverse
 */
function decode(ciphertext, inverse) {
  return ciphertext.map(page => {
    const out = [page[0]];
    for (let i = 1; i < page.length; i++)
      out.push(inverse[page[i - 1]][page[i]]);
    return out;
  });
}
/** @param {number[][]} inverse */
function forwardRows(inverse) {
  return inverse.map(row => {
    const f = Array(M);
    row.forEach((plain, cipher) => { f[plain] = cipher; });
    assert.equal(new Set(f).size, M);
    return f;
  });
}
/** @param {number[][]} plaintext @param {number[][]} forward */
function encodeRows(plaintext, forward) {
  return plaintext.map(page => {
    const cipher = [page[0]];
    for (let i = 1; i < page.length; i++)
      cipher.push(forward[cipher[i - 1]][page[i]]);
    return cipher;
  });
}

/**
 * GP source-normalization contract shared with the project's reference
 * simulators. This is a source-register diagnostic, not original plaintext.
 * @param {string} text
 * @returns {number[]}
 */
function englishGP(text) {
  const tokens = new Map(corpus.translit.map((s, i) => [s, i]));
  const out = [];
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const w = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < w.length;) {
      let matched = false;
      for (const len of [3, 2, 1]) {
        const v = tokens.get(w.slice(i, i + len));
        if (v !== undefined) { out.push(v); i += len; matched = true; break; }
      }
      assert.ok(matched, "Source contains unsupported GP symbol");
    }
  }
  return out;
}

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function randomRows(seed) {
  const random = rng(seed);
  return Array.from({length: M}, () => {
    const row = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    return row;
  });
}

/** @param {number[][]} pg @param {number} rune */
function transitionOccurrences(pg, rune) {
  let count = 0;
  for (const page of pg)
    for (let i = 1; i < page.length; i++)
      count += Number(page[i] === rune);
  return count;
}


/**
 * Exact capacity for all m-symbol plaintext subsets, for any contiguous
 * whole-page interval and every unknown key-epoch partition.
 * @param {number[][]} sourcePages
 */
function epochCapacities(sourcePages) {
  const n=sourcePages.length;
  const counts=sourcePages.map(page=>{
    const a=new Int32Array(M*M);
    for(let i=1;i<page.length;i++)a[page[i-1]*M+page[i]]++;
    return a;
  });
  const cap=Array.from({length:M},()=>Array.from({length:n+1},
    ()=>new Int32Array(n+1)));
  for(let start=0;start<n;start++){
    const sum=new Int32Array(M*M);
    for(let end=start+1;end<=n;end++){
      const add=counts[end-1];
      for(let i=0;i<sum.length;i++)sum[i]+=add[i];
      for(let row=0;row<M;row++){
        const sorted=Array.from(sum.slice(row*M,(row+1)*M))
          .sort((a,b)=>b-a);
        let partial=0;
        for(let m=1;m<M;m++){
          partial+=sorted[m-1];
          cap[m][start][end]+=partial;
        }
      }
    }
  }
  const best=Array.from({length:M},()=>new Int32Array(n+1));
  for(let m=1;m<M;m++){
    const dp=Array.from({length:n+1},()=>
      new Int32Array(n+1).fill(-10000000));
    dp[0][0]=0;
    for(let epochs=1;epochs<=n;epochs++){
      for(let end=epochs;end<=n;end++){
        let upper=-10000000;
        for(let start=epochs-1;start<end;start++)
          upper=Math.max(upper,dp[epochs-1][start]+cap[m][start][end]);
        dp[epochs][end]=upper;
      }
      best[m][epochs]=dp[epochs][n];
    }
  }
  return best;
}
/**
 * Source GP rank-m proportions are a conditional plaintext register,
 * never an assertion that LP2 is English/Latin. The maximum source
 * proportion is compared to an EXACT manuscript combinatorial bound
 * with fully unknown k epoch partitions and 55 unrestricted initials.
 * @param {Int32Array[]} best
 * @param {number[]} values Source histogram in GP order
 * @param {number} total Source rune length
 */
function sourceEpochRequirement(best,values,total){
  assert.equal(values.length,M);
  assert.equal(values.reduce((a,b)=>a+b,0),total);
  const sorted=values.slice().sort((a,b)=>b-a),byRank=[];
  let cum=0;
  for(let m=1;m<M;m++){
    cum+=sorted[m-1];
    let k=1;
    for(;k<=pages.length;k++){
      if((best[m][k]+pages.length)*total>=12956*cum)break;
    }
    assert.ok(k<=pages.length);
    byRank.push({rank:m,epochs:k,sourceShare:cum/total});
  }
  const threshold=Math.max(...byRank.map(x=>x.epochs));
  return {necessaryEpochs:threshold,
    bindingRanks:byRank.filter(x=>x.epochs===threshold).map(x=>x.rank),
    byRank};
}
/**
 * Check all top-m source frequency constraints on an actual encrypted
 * synthetic message under the proper number of true key epochs.
 * @param {number[][]} plain
 * @param {number[][]} encrypted
 * @param {number} epochs
 */
function assertPlantedMajorization(plain,encrypted,epochs){
  const bound=epochCapacities(encrypted);
  const counts=Array(M).fill(0);
  for(const p of plain)for(let i=1;i<p.length;i++)counts[p[i]]++;
  counts.sort((a,b)=>b-a);
  let sum=0;
  for(let m=1;m<M;m++){
    sum+=counts[m-1];
    assert.ok(sum<=bound[m][epochs],"Positive rank bound m="+m);
  }
}


/**
 * Native-Cicada word-length-matched source model, mirroring the same
 * 796 solved-reference source words and 2,896 original printed word lengths
 * as the adjacent hidden-mode capacity challenge. This is a probabilistic
 * source *condition*, not a randomly generated LP2 true plaintext.
 * @param {string[]} referenceLines
 * @param {Int32Array[]} exactCap
 */
function sourceNativeEpochMonteCarlo(referenceLines,exactCap){
  const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
  const lengths=parseSharedCorpus().words.map(w=>w.length);
  assert.equal(lengths.length,2896);
  assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
  const words=(referenceLines.join(" ").match(/[A-Za-z]+/g)||[])
    .map(englishGP);
  assert.equal(words.length,796);
  const buckets=new Map();
  for(const word of words){
    const counts=new Int32Array(M);
    for(const x of word)counts[x]++;
    if(!buckets.has(word.length))buckets.set(word.length,[]);
    buckets.get(word.length).push(counts);
  }
  for(const length of lengths)assert.ok(buckets.has(length));
  const random=rng(0x33011415),samples=3000;
  const histogram=new Int32Array(pages.length+1);
  const rank9Threshold=exactCap[9][14]+pages.length;
  const rank11Threshold=exactCap[11][14]+pages.length;
  let totalLeading=0,totalTop8=0;
  for(let trial=0;trial<samples;trial++){
    const counts=new Int32Array(M);
    for(const n of lengths){
      const bucket=buckets.get(n);
      const word=bucket[random()%bucket.length];
      for(let i=0;i<M;i++)counts[i]+=word[i];
    }
    const ordered=Array.from(counts).sort((a,b)=>b-a);
    totalLeading+=ordered[0];
    totalTop8+=ordered.slice(0,8).reduce((a,b)=>a+b,0);
    let sum=0,required=1;
    for(let rank=1;rank<M;rank++){
      sum+=ordered[rank-1];
      let k=1;
      while(k<=pages.length &&
          exactCap[rank][k]+pages.length<sum)k++;
      assert.ok(k<=pages.length);
      required=Math.max(required,k);
    }
    histogram[required]++;
  }
  assert.deepEqual(Array.from(histogram.slice(14,18)),
    [120,2640,231,9]);
  assert.equal(histogram.reduce((a,b)=>a+b,0),samples);
  return {
    seed:"0x33011415",sourceWords:words.length,
    originalPrintedWordLengths:lengths.length,samples,
    histogram:Array.from(histogram).map((n,k)=>({k,n}))
      .filter(x=>x.n),
    fractionNeedingAtLeast14:1,
    fractionNeedingAtLeast15:(samples-histogram[14])/samples,
    sourceGPMeanLeadingCount:totalLeading/samples,
    sourceGPMeanTop8Count:totalTop8/samples,
    original14EpochTop9Capacity:rank9Threshold,
    original14EpochTop11Capacity:rank11Threshold,
    caveat:"Monte Carlo source-family coverage, not a posterior probability " +
      "of an actual LP2 cipher; historical model selection was post hoc"
  };
}

function main() {
  const counts = rows(pages);
  const total = counts.flat().reduce((a, b) => a + b, 0);
  const repeats = counts.reduce((n, row, i) => n + row[i], 0);
  assert.equal(total, 12901);
  assert.equal(repeats, 86);
  const bound = rowBound(counts);
  assert.equal(bound, 714);
  const target = 18; // GP E; any of the 29 targets has the same exact bound.
  const inverse = witnessInverse(counts, target);
  const forward = forwardRows(inverse);
  const decoded = decode(pages, inverse);
  assert.deepEqual(encodeRows(decoded, forward), pages);
  const attained = transitionOccurrences(decoded, target);
  assert.equal(attained, bound);

  const shakespeare = read("resources/control/shakespeare_first300k.txt");
  const training = englishGP(shakespeare.slice(0, 210000));
  const heldout = englishGP(shakespeare.slice(210000));
  assert.equal(training.length, 153216);
  assert.ok(heldout.length > 12956 + 17);
  const englishE = training.filter(x => x === target).length;
  const latin = JSON.parse(read("resources/control/latin-vulgate-gp-trigrams.json"));
  assert.equal(latin.n, 203357);
  const sourcePages = [];
  let at = 17;
  for (const page of pages) {
    sourcePages.push(heldout.slice(at, at + page.length));
    at += page.length;
  }

  // Independent source-English positive using random arbitrary 29x29 rows.
  // The exact plaintext and all shared 29 substitution tables are recovered.
  const plantRows = randomRows(0x3301cafe);
  const plantedCipher = encodeRows(sourcePages, plantRows);
  const plantedInverse = forwardRows(plantRows);
  const recovered = decode(plantedCipher, plantedInverse);
  assert.deepEqual(recovered, sourcePages);
  assert.deepEqual(encodeRows(recovered, plantRows), plantedCipher);
  const plantBound = rowBound(rows(plantedCipher));
  const sourceE = transitionOccurrences(sourcePages, target);
  assert.equal(sourceE, 1484);
  assert.equal(plantBound, 1586);
  assert.ok(plantBound >= sourceE);
  assert.ok(englishE / training.length > (bound + 55) / 12956);
  assert.ok(latin.u[target] / latin.n > (bound + 55) / 12956);


  const sourceCounts=values=>{
    const counts=Array(M).fill(0);
    for(const x of values)counts[x]++;
    return counts;
  };
  const exactCap=epochCapacities(pages);
  assert.equal(exactCap[1][1],bound);
  assert.deepEqual([12,13,14].map(k=>exactCap[8][k]+55),
    [7576,7742,7889]);
  assert.deepEqual([22,23,24].map(k=>exactCap[11][k]+55),
    [10743,10879,11013]);
  const englishEpochs=sourceEpochRequirement(
    exactCap,sourceCounts(training),training.length);
  const latinEpochs=sourceEpochRequirement(exactCap,latin.u,latin.n);
  assert.equal(englishEpochs.necessaryEpochs,14);
  assert.equal(latinEpochs.necessaryEpochs,24);
  // The most relevant native plaintext register is the verified solved
  // Cicada LP1 reference. Omit source notes and continuation editorial
  // brackets; preserve all documented original prose and headings.
  const nativeText=read("resources/liber-primus/lp1-plaintext-reference.txt");
  const nativeLines=nativeText.split(/\r?\n/).filter(line=>{
    const t=line.trim();
    return !t.startsWith("#") && !t.startsWith("[") &&
      !/^[0-9a-f]{25,}$/i.test(t);
  });
  const native=englishGP(nativeLines.join(" "));
  assert.equal(native.length,3248);
  const nativeEpochs=sourceEpochRequirement(
    exactCap,sourceCounts(native),native.length);
  assert.equal(nativeEpochs.necessaryEpochs,15);
  assert.deepEqual([14,15].map(k=>exactCap[1][k]+55),
    [1590,1631]);
  assert.deepEqual([14,15].map(k=>exactCap[8][k]+55),
    [7889,8032]);
  assert.ok(nativeEpochs.bindingRanks.includes(1));
  assert.ok(nativeEpochs.bindingRanks.includes(8));
  const nativeCalibration=sourceNativeEpochMonteCarlo(
    nativeLines,exactCap);

  assert.ok(englishEpochs.bindingRanks.includes(8));
  assert.ok(latinEpochs.bindingRanks.includes(11));
  assertPlantedMajorization(sourcePages,plantedCipher,1);

  // Fourteen independently chosen random permutation-table epochs.
  // The source and ciphertext reconstruct identically for every rune.
  const tables=Array.from({length:14},(_,i)=>
    randomRows((0x3301cafe+1234567*(i+1))>>>0));
  const epochOf=i=>Math.floor(14*i/pages.length);
  const plantedRekeys=sourcePages.map((p,i)=>
    encodeRows([p],tables[epochOf(i)])[0]);
  const recoveredRekeys=plantedRekeys.map((p,i)=>
    decode([p],forwardRows(tables[epochOf(i)]))[0]);
  assert.deepEqual(recoveredRekeys,sourcePages);
  assertPlantedMajorization(sourcePages,plantedRekeys,14);

  const output = {
    status: "Exact key-independent bound; no unknown LP2 plaintext recovered",
    family: "One BOOK-WIDE 29x29 bijection S[previous published ciphertext]",
    original: {
      physicalRunePages: pages.length, runes: 12956,
      withinPageTransitions: total, equalAdjacentSteps: repeats,
      maxCountForAnyPlaintextSymbolOnTransitions: bound,
      arbitraryFirstPageRunes: pages.length,
      maxCountForAnyPlaintextSymbolInFullText: bound + pages.length,
      maxFractionInFullText: (bound + pages.length) / 12956,
      rowMaximumCounts: counts.map(row => Math.max(...row)),
      explicitWitnessSymbol: corpus.translit[target],
      witnessAchievedTransitionCount: attained,
      originalCiphertextRoundtripRunes: 12956
    },
    rekeyMajorization: {
      assumption: "Arbitrary 29x29 predecessor-indexed bijective rows, " +
        "one shared table per contiguous whole-page key epoch",
      unknownBreaks: "Exact DP over all physical-page partitions",
      necessaryEpochCountForReferenceRanks: {
        english: englishEpochs.necessaryEpochs,
        latin: latinEpochs.necessaryEpochs
      },
      nativeCicadaSolvedRunes: native.length,
      nativeCicadaNeededEpochs: nativeEpochs.necessaryEpochs,
      nativeCicadaBindingRanks: nativeEpochs.bindingRanks,
      nativeCicadaTop1Share: nativeEpochs.byRank[0].sourceShare,
      nativeCicadaTop8Share: nativeEpochs.byRank[7].sourceShare,
      nativeCicadaWordLengthMatchedSampling: nativeCalibration,
      nativeCicadaTop1Bounds: [14,15].map(k=>
        ({epochs:k,maximumSourceLikeRunes:exactCap[1][k]+55})),
      nativeCicadaTop8Bounds: [14,15].map(k=>
        ({epochs:k,maximumSourceLikeRunes:exactCap[8][k]+55})),
      bindingEnglishRanks: englishEpochs.bindingRanks,
      bindingLatinRanks: latinEpochs.bindingRanks,
      englishRank8Share: englishEpochs.byRank[7].sourceShare,
      latinRank11Share: latinEpochs.byRank[10].sourceShare,
      actualEnglishRank8Upper: [12,13,14].map(k=>
        ({epochs:k,maximumSourceLikeRunes:exactCap[8][k]+55})),
      actualLatinRank11Upper: [22,23,24].map(k=>
        ({epochs:k,maximumSourceLikeRunes:exactCap[11][k]+55})),
      genuineEnglishControl: {
        independentEpochTables:14,decodedRunes:12956,
        originalCiphertextRoundtripRunes:12956,rankConstraints:28
      }
    },
    controls: {
      englishTraining: {runes: training.length,
        E: englishE, Eshare: englishE / training.length},
      latinVulgate: {runes: latin.n, E: latin.u[target],
        Eshare: latin.u[target] / latin.n},
      authenticGPShakespearePlant: {
        seed: "0x3301cafe", plaintextRunes: 12956,
        trueESymbolsOnTransitions: sourceE,
        cipherRowBound: plantBound,
        exactlyRecoveredPlaintextRunes: 12956,
        roundtripCiphertextRunes: 12956
      }
    },
    scope: "Book-wide or whole-page-epoch-wise predecessor-ciphertext " +
      "bijective row tables. Unknown page-boundary key epochs are optimized " +
      "exactly, and the reference-language source rank spectra are " +
      "explicit conditional assumptions. Within-page rekeys, hidden " +
      "clock/state, lossy repairs and alternate plaintext registers " +
      "remain unconstrained."
  };
  console.log(JSON.stringify(output, null, 2));
}
main();
