"use strict";
/**
 * SFT: exact enumerative constrained-code capacity and original-source
 * arithmetic rank inversion for Liber Primus LP2.
 *
 * Run on Windows 11 with Node.js 22:
 *   node sims/lp2_enumerative_exception_capacity_original_sft.cjs
 *
 * Original word breaks and punctuation come from the canonical transcription.
 * A 29-symbol source is assumed unrestricted and length-preserving. The
 * tested output codebooks FIX observed equal-adjacent counts per whole book,
 * physical page, or complete printed word. This is a conditional capacity
 * theorem, not a claim that Cicada used this encoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punctuation = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const toIndices = s => [...s].map(r => {
  const i = lookup.get(r);
  assert.notEqual(i, undefined, "unknown GP rune");
  return i;
});
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(s => /[\u16A0-\u16FF]/u.test(s))
  .slice(0, 2896)
  .map(toIndices);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const full = pages.flatMap(p => p.indices);
const total = full.length;
const repeatCount = a => a.slice(1).reduce((n, v, i) => n + Number(v === a[i]), 0);

/** @param {number} n @param {number} k */
function choose(n, k) {
  assert.ok(Number.isInteger(n) && Number.isInteger(k) && n >= 0 && k >= 0);
  if (k > n) return 0n; // zero combinatorial completions when rank prefix runs out
  let z = 1n;
  for (let j = 1; j <= Math.min(k, n - k); j++) {
    z = z * BigInt(n - j + 1) / BigInt(j);
  }
  return z;
}

/** Count GP29 ciphertext segments with fixed length and exact repeat count. */
function codebook(a) {
  const t = a.length - 1, e = repeatCount(a);
  return 29n * choose(t, e) * (28n ** BigInt(t - e));
}

/** Minimum fixed-length binary side field to encode EVERY GP29 source. */
function missingBits(sourceSize, codebookSize) {
  const n = (sourceSize + codebookSize - 1n) / codebookSize - 1n;
  return n === 0n ? 0 : n.toString(2).length;
}
assert.equal(words.length, 2896);
assert.equal(total, 12956);
assert.equal(words.reduce((s, w) => s + w.length, 0), total);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + repeatCount(p.indices), 0), 86);
assert.equal(words.reduce((s, w) => s + repeatCount(w), 0), 63);

const sourceSize = 29n ** BigInt(total);
const bookSize = codebook(full);
const pageSize = pages.reduce((v, p) => v * codebook(p.indices), 1n);
const wordSize = words.reduce((v, w) => v * codebook(w), 1n);
const required = {
  global: missingBits(sourceSize, bookSize),
  pageFixed: missingBits(sourceSize, pageSize),
  wordFixed: missingBits(sourceSize, wordSize)
};
assert.deepEqual(required, { global: 328, pageFixed: 446, wordFixed: 679 });

const ends = [];
let offset = 0;
for (const word of words) {
  offset += word.length;
  ends.push(offset);
}
const endSet = new Set(ends);
const events = punctuation.events;
const distinctSites = new Set(events.map(e => e.rune_offset));
assert.equal(events.length, 180);
assert.equal(distinctSites.size, 173);
assert.ok(events.every(e => endSet.has(e.rune_offset)));
assert.deepEqual(punctuation.counts, { "⁜": 31, "⁘": 145, "⁚": 4 });
const ternaryIdentities = 3n ** BigInt(events.length);
const fact = n => {
  let x = 1n;
  for (let i = 2; i <= n; i++) x *= BigInt(i);
  return x;
};
const multisetIdentities = fact(180) / (fact(31) * fact(145) * fact(4));
const possiblePositions = choose(words.length, distinctSites.size);
assert.ok(sourceSize > bookSize * ternaryIdentities);
assert.ok(sourceSize > pageSize * ternaryIdentities);
assert.ok(sourceSize > wordSize * ternaryIdentities);
assert.ok(sourceSize > wordSize * multisetIdentities);
assert.ok(sourceSize <= wordSize * possiblePositions);

/*
 * Source26 into predecessor-excluding GP28: could the 28 rank labels hold
 * ordinary 26-letter content plus one/two genuinely rare escape symbols?
 * For ANY unknown stationary ordering of q runes, each fixed output rank
 * sees one adjacent pair a,b. Every other predecessor may be placed above
 * or below that pair, so the attainable MINIMUM population of any rank is
 * the pair's mutual transitions plus min of its two incoming counts at
 * each other predecessor. This dual of the known all-secret MAX theorem is
 * exact, and independently checked against every permutation of five runes.
 */
function transitionMatrix(sourcePages, q = 29) {
  const m = Array.from({length:q}, () => Array(q).fill(0));
  for (const page of sourcePages) {
    for (let j = 1; j < page.indices.length; j++) {
      const a = page.indices[j-1], b = page.indices[j];
      if (a !== b) m[a][b]++;
    }
  }
  return m;
}
function rankMinimum(t) {
  const q = t.length;
  let minimum = Infinity, bestPair = null;
  for (let a = 0; a < q; a++) for (let b = a+1; b < q; b++) {
    let count = t[a][b] + t[b][a];
    for (let prev = 0; prev < q; prev++) if (prev !== a && prev !== b) {
      count += Math.min(t[prev][a], t[prev][b]);
    }
    if (count < minimum) {
      minimum = count;
      bestPair = [a,b];
    }
  }
  const [a,b] = bestPair;
  const before = [], after = [];
  for (let prev = 0; prev < q; prev++) if (prev !== a && prev !== b) {
    if (t[prev][b] <= t[prev][a]) before.push(prev);
    else after.push(prev);
  }
  const order = [...before,a,b,...after];
  const pos = Array(q);
  order.forEach((v,i) => { pos[v] = i; });
  const rank = before.length;
  const witness = t.reduce((sum,row,prev) =>
    sum + row.reduce((z,n,cur) =>
      z + (prev !== cur && pos[cur] - Number(pos[prev] < pos[cur]) === rank ? n : 0), 0),0);
  assert.equal(witness,minimum);
  return {minimum, pair:bestPair, order, witnessRank:rank};
}
const toyT = Array.from({length:5},(_,s) =>
  Array.from({length:5},(_,c) => s===c?0:(7*s+11*c+3*s*c+1)%17));
function permutations(a) {
  if(a.length === 1) return [a];
  return a.flatMap((v,i) => permutations(a.filter((_,j)=>j!==i))
    .map(p => [v,...p]));
}
let toyExhaustiveMin = Infinity;
for (const order of permutations([0,1,2,3,4])) {
  const pos = Array(5);
  order.forEach((v,i)=>{pos[v]=i;});
  const bins = Array(4).fill(0);
  for (let prev=0;prev<5;prev++) for (let cur=0;cur<5;cur++) {
    if (prev===cur) continue;
    bins[pos[cur]-Number(pos[prev]<pos[cur])] += toyT[prev][cur];
  }
  toyExhaustiveMin = Math.min(toyExhaustiveMin,...bins);
}
assert.equal(toyExhaustiveMin,rankMinimum(toyT).minimum);
const globalRankMin = rankMinimum(transitionMatrix(pages));
assert.equal(globalRankMin.minimum,348);
assert.deepEqual(globalRankMin.pair,[4,12]);
const visualChapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const perChapterRankMin = visualChapters.map(([lo,hi]) =>
  rankMinimum(transitionMatrix(pages.filter(p=>p.page>=lo && p.page<=hi))).minimum);
assert.deepEqual(perChapterRankMin,[5,12,23,31,11,20,23,54,0]);
const chapterMinTotal = perChapterRankMin.reduce((sum,n)=>sum+n,0);
assert.equal(chapterMinTotal,179);
assert.ok(chapterMinTotal > 86); // one reserved rank already exceeds all original 86 doublets

/*
 * Exact minimum of TWO 28-rank labels under ANY one hidden GP29 ordering.
 * Two chosen output ranks correspond to adjacent source-symbol pairs,
 * either touching (a,b,c) or disjoint (a,b,c,d). For each other source
 * predecessor the 2 or 3 placement regions are freely selectable. This
 * is the minimum-side dual of the earlier exact maximum-two-rank theorem.
 */
function twoRankMinimum(t) {
  const q = t.length;
  const pairSum = Array.from({length:q},(_,z) =>
    Array.from({length:q},(_,a) =>
      Int32Array.from({length:q},(_,b)=>t[z][a]+t[z][b])));
  let best=Infinity, kind='', labels=[];
  touch: for(let a=0;a<q;a++) for(let b=0;b<q;b++) if(a!==b) {
    for(let c=0;c<q;c++) if(c!==a && c!==b) {
      let count=t[a][b]+t[a][c]+t[b][a]+t[b][c]+t[c][a]+t[c][b];
      if(count>=best) continue;
      for(let z=0;z<q;z++) if(z!==a && z!==b && z!==c) {
        count+=Math.min(pairSum[z][b][c],pairSum[z][a][b]);
        if(count>=best) break;
      }
      if(count<best){best=count;kind='touch';labels=[a,b,c];}
      if(best===0) break touch;
    }
  }
  disjoint: for(let a=0;a<q;a++) for(let b=0;b<q;b++) if(a!==b) {
    for(let c=0;c<q;c++) if(c!==a && c!==b) {
      for(let d=0;d<q;d++) if(d!==a && d!==b && d!==c) {
        let count=t[a][b]+t[a][d]+t[b][a]+t[b][d]+
          t[c][a]+t[c][d]+t[d][a]+t[d][c];
        if(count>=best) continue;
        for(let z=0;z<q;z++) if(z!==a && z!==b && z!==c && z!==d) {
          count+=Math.min(pairSum[z][b][d],pairSum[z][a][d],pairSum[z][a][c]);
          if(count>=best) break;
        }
        if(count<best){best=count;kind='disjoint';labels=[a,b,c,d];}
        if(best===0) break disjoint;
      }
    }
  }
  const [a,b,c,d]=labels;
  const before=[],middle=[],after=[];
  for(let z=0;z<q;z++) if(!labels.includes(z)) {
    if(kind==='touch') {
      if(pairSum[z][b][c] <= pairSum[z][a][b]) before.push(z);
      else after.push(z);
    } else {
      const v0=pairSum[z][b][d], v1=pairSum[z][a][d],
        v2=pairSum[z][a][c];
      if(v0<=v1 && v0<=v2)before.push(z);
      else if(v1<=v2)middle.push(z);
      else after.push(z);
    }
  }
  const order=kind==='touch'?[...before,a,b,c,...after]:
    [...before,a,b,...middle,c,d,...after];
  const rankIds=kind==='touch'?[before.length,before.length+1]:
    [before.length,before.length+2+middle.length];
  assert.equal(new Set(order).size,q);
  const pos=Array(q);order.forEach((x,i)=>{pos[x]=i});
  const histogram=Array(q-1).fill(0);
  for(let z=0;z<q;z++)for(let x=0;x<q;x++)if(z!==x) {
    histogram[pos[x]-Number(pos[z]<pos[x])]+=t[z][x];
  }
  assert.equal(histogram[rankIds[0]]+histogram[rankIds[1]],best);
  return {minimum:best,kind,labels,order,rankIds};
}
let toyTwoExhaustiveMin=Infinity;
for(const order of permutations([0,1,2,3,4])) {
  const pos=Array(5);order.forEach((v,i)=>{pos[v]=i});
  const ranks=Array(4).fill(0);
  for(let z=0;z<5;z++)for(let x=0;x<5;x++)if(z!==x) {
    ranks[pos[x]-Number(pos[z]<pos[x])]+=toyT[z][x];
  }
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++) {
    toyTwoExhaustiveMin=Math.min(toyTwoExhaustiveMin,ranks[a]+ranks[b]);
  }
}
assert.equal(toyTwoExhaustiveMin,twoRankMinimum(toyT).minimum);
const globalTwoRankMin=twoRankMinimum(transitionMatrix(pages));
assert.equal(globalTwoRankMin.minimum,726);
const chapterTwoRankMin=visualChapters.map(([lo,hi])=>
  twoRankMinimum(transitionMatrix(pages.filter(p=>p.page>=lo && p.page<=hi))).minimum);
assert.deepEqual(chapterTwoRankMin,[14,30,54,68,25,47,56,116,0]);
const pageTwoRankMin=pages.map(p=>twoRankMinimum(transitionMatrix([p])).minimum);
assert.ok(pageTwoRankMin.every(n=>n===0)); // page resets can hide 2 arbitrary rank labels
assert.equal(chapterTwoRankMin.reduce((a,b)=>a+b,0),410);

/* Page-local punctuation-placement capacity fails for seven physical pages. */
let pageStart = 0;
const localDeficits = [];
for (const p of pages) {
  const pageEnd = pageStart + p.indices.length;
  const endings = ends.filter(v => v > pageStart && v <= pageEnd).length;
  const punctuationSites = new Set(events.filter(e =>
    e.rune_offset > pageStart && e.rune_offset <= pageEnd
  ).map(e => e.rune_offset)).size;
  const n = p.indices.length;
  const source = 29n ** BigInt(n);
  const side = choose(endings, punctuationSites);
  if (source > codebook(p.indices) * side) {
    localDeficits.push(p.page);
  }
  pageStart = pageEnd;
}
assert.deepEqual(localDeficits, [13, 20, 21, 23, 37, 51, 54]);

/* Original nine printed chapter groupings are source-visible. Verify that
   word-preserving local punctuation positions lack capacity in two chapters. */
const chapterRanges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapterDeficits = [];
const chapterDeficitsEvenWithTernaryGlyphs = [];
const starts = new Map();
let running = 0;
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  starts.set(page.page, running);
  running += page.indices.length;
}
for (const [first, last] of chapterRanges) {
  const lo = starts.get(first);
  const hi = starts.get(last) + corpus.pages.find(p => p.page === last).indices.length;
  const chapterWords = words.filter((_, i) => ends[i] > lo && ends[i] <= hi);
  const chapterRunes = chapterWords.reduce((s, w) => s + w.length, 0);
  assert.equal(chapterRunes, hi - lo, "chapter division cannot bisect a word");
  const chapterMarks = events.filter(e => e.rune_offset > lo && e.rune_offset <= hi);
  const nSites = new Set(chapterMarks.map(e => e.rune_offset)).size;
  const sidePositions = choose(chapterWords.length, nSites);
  const encoded = chapterWords.reduce((v, w) => v * codebook(w), 1n);
  const unconstrained = 29n ** BigInt(chapterRunes);
  if (unconstrained > encoded * sidePositions) chapterDeficits.push(first);
  if (unconstrained > encoded * sidePositions * 3n ** BigInt(chapterMarks.length)) {
    chapterDeficitsEvenWithTernaryGlyphs.push(first);
  }
}
assert.deepEqual(chapterDeficits, [23, 54]);
assert.deepEqual(chapterDeficitsEvenWithTernaryGlyphs, [23, 54]);

/** Native-GP, no sidecar: base28 ordered/cyclic nonrepeat-rank inverse. */
function directInverse(cipher, cyclic, mirror, reverseDigits) {
  const digits = [];
  for (let i = 1; i < cipher.length; i++) {
    const prev = cipher[i - 1], v = cipher[i];
    if (v === prev) continue; // literal repeat event, carried as visible mask
    const k = cyclic ? (v - prev + 28) % 29 : v - Number(v > prev);
    digits.push(mirror ? 27 - k : k);
  }
  if (reverseDigits) digits.reverse();
  let value = 0n;
  for (const d of digits) value = value * 28n + BigInt(d);
  const outputLength = Math.ceil(digits.length * Math.log(28) / Math.log(29));
  const output = Array(outputLength).fill(0);
  for (let i = output.length - 1; i >= 0; i--) {
    output[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return [cipher[0], ...output];
}
const ioc = a => {
  const freq = Array(29).fill(0);
  for (const v of a) freq[v]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const solvedSections = solved.sections.map(x =>
  ([...x.source_text].filter(c => lookup.has(c))).map(c => lookup.get(c)));
function minimumSolvedIoc(n) {
  let best = Infinity;
  let count = 0;
  for (const section of solvedSections) {
    for (let i = 0; i + n <= section.length; i++) {
      best = Math.min(best, ioc(section.slice(i, i + n)));
      count++;
    }
  }
  return { min: best, count };
}
const controls = { n200: minimumSolvedIoc(200), n300: minimumSolvedIoc(300) };
assert.equal(controls.n200.count, 1573);
assert.equal(controls.n300.count, 1173);
const variants = [];
const p0 = pages.find(p => p.page === 0).indices;
const p1 = pages.find(p => p.page === 1).indices;
const p16 = pages.find(p => p.page === 16).indices;
for (const cyclic of [false, true]) {
  for (const mirror of [false, true]) {
    for (const reverseDigits of [false, true]) {
      const opening = [...directInverse(p0, cyclic, mirror, reverseDigits),
        ...directInverse(p1, cyclic, mirror, reverseDigits)].slice(0, 300);
      const holdout = directInverse(p16, cyclic, mirror, reverseDigits).slice(0, 200);
      variants.push({
        cyclic, mirror, reverseDigits,
        p0p1Ioc300: ioc(opening), p16Ioc200: ioc(holdout)
      });
    }
  }
}
assert.ok(variants.every(v => v.p0p1Ioc300 < controls.n300.min));
assert.ok(variants.every(v => v.p16Ioc200 < controls.n200.min));

/*
 * For canonical mixed-radix word enumeration P = S*M + R, each word
 * codebook has a factor 29. Thus M is divisible by 29^2896, fixing the
 * final 2896 plaintext GP digits for EVERY external sidecar S.
 */
function mixedWordRank(cyclic) {
  let rank = 0n, choicesAll = 1n;
  for (const w of words) {
    const t = w.length - 1, sites = [], digits = [];
    for (let j = 1; j < w.length; j++) {
      const x = w[j], p = w[j - 1];
      if (x === p) sites.push(j - 1);
      else digits.push(cyclic ? (x - p + 28) % 29 : x - Number(x > p));
    }
    const e = sites.length, masks = choose(t, e), base = 28n ** BigInt(digits.length);
    let maskRank = 0n, used = 0;
    for (let j = 0; j < t; j++) {
      if (sites[used] === j) {
        maskRank += choose(t - j - 1, e - used);
        used++;
      }
    }
    let dr = 0n;
    for (const d of digits) dr = dr * 28n + BigInt(d);
    const m = 29n * masks * base, r = (BigInt(w[0]) * masks + maskRank) * base + dr;
    assert.ok(r >= 0n && r < m);
    rank = rank * m + r;
    choicesAll *= m;
  }
  assert.equal(choicesAll, wordSize);
  return rank;
}
const suffixModulus = 29n ** BigInt(words.length);
assert.equal(wordSize % suffixModulus, 0n);
const suffixIoc = cyclic => {
  const rank = mixedWordRank(cyclic);
  assert.equal((rank + 123456789n * wordSize) % suffixModulus,
    rank % suffixModulus);
  let x = rank % suffixModulus;
  const out = Array(words.length).fill(0);
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = Number(x % 29n);
    x /= 29n;
  }
  return ioc(out);
};
const sideInvariantSuffix = {
  ordinal: suffixIoc(false), cyclic: suffixIoc(true),
  solvedNative: ioc(solvedSections.flat().slice(-words.length))
};
assert.ok(sideInvariantSuffix.ordinal < 0.04);
assert.ok(sideInvariantSuffix.cyclic < 0.04);
assert.ok(sideInvariantSuffix.solvedNative > 0.06);

/*
 * A source-native alphabet-sensitive rival: the 2,979 known solved GP runes
 * use NEITHER EO nor OE. The remaining 27 GP symbols may be enough for
 * a length-preserving, word-exact constrained-code mapping WITHOUT a
 * variable sidecar. Verify capacity and test canonical arithmetic scaling.
 *
 * Given a source integer X in [0,27^L), output constrained codeword rank
 * R=floor(X*M/27^L); M>=27^L ensures injectivity. Decode any rank using
 * X=floor(((R+1)*27^L-1)/M). A real canonical encoder must additionally
 * satisfy R=floor(X*M/27^L) exactly; otherwise any apparent output text
 * is a mathematical readout of an INVALID source frame.
 */
const source27 = corpus.translit.map((_,i)=>i).filter(i=>i!==12 && i!==22);
assert.equal(source27.length,27);
const gpTo27=new Map(source27.map((v,i)=>[v,i]));
assert.ok(solvedSections.flat().every(i=>gpTo27.has(i)));
const plain27Size=27n ** BigInt(total);
assert.ok(wordSize>=plain27Size); // zero additional side bits for all-source GP27
const plain28Size=28n ** BigInt(total);
assert.ok(plain28Size>wordSize); // all-source GP28 still needs a small side field
assert.equal(missingBits(plain28Size,wordSize),23);
function toBase(n,q,count) {
  const out=Array(count).fill(0);
  for(let i=count-1;i>=0;i--){out[i]=Number(n%BigInt(q));n/=BigInt(q);}
  assert.equal(n,0n);
  return out;
}
function wordRankOne(w,cyclic) {
  const t=w.length-1,maskSites=[],digits=[];
  for(let j=1;j<w.length;j++) {
    const prev=w[j-1],v=w[j];
    if(v===prev)maskSites.push(j-1);
    else digits.push(cyclic?(v-prev+28)%29:v-Number(v>prev));
  }
  const e=maskSites.length,masks=choose(t,e),base=28n**BigInt(t-e);
  let posRank=0n,used=0;
  for(let j=0;j<t;j++)if(maskSites[used]===j){
    posRank+=choose(t-j-1,e-used);used++;
  }
  let digitRank=0n;
  for(const d of digits)digitRank=digitRank*28n+BigInt(d);
  return (BigInt(w[0])*masks+posRank)*base+digitRank;
}
function rankWords(scope,cyclic) {
  let rank=0n;
  for(const w of scope)rank=rank*codebook(w)+wordRankOne(w,cyclic);
  return rank;
}
function unrankWords(rank,scope,cyclic) {
  const codes=Array(scope.length);
  for(let i=scope.length-1;i>=0;i--){
    const word=scope[i],t=word.length-1,e=repeatCount(word);
    const m=codebook(word),wRank=rank%m;
    rank/=m;
    const base=28n**BigInt(t-e),masks=choose(t,e);
    let digitsValue=wRank%base;
    const top=wRank/base;
    let maskValue=top%masks;
    const first=Number(top/masks);
    const digits=toBase(digitsValue,28,t-e);
    const flags=Array(t).fill(false);
    let remaining=e;
    for(let j=0;j<t;j++){
      const skip=choose(t-j-1,remaining);
      if(remaining>0 && maskValue>=skip){
        flags[j]=true;maskValue-=skip;remaining--;
      }
    }
    assert.equal(maskValue,0n);
    assert.equal(remaining,0);
    const decoded=[first];
    let nextDigit=0;
    for(let j=0;j<t;j++){
      const prev=decoded.at(-1);
      if(flags[j])decoded.push(prev);
      else{
        const d=digits[nextDigit++];
        decoded.push(cyclic?(prev+d+1)%29:d+Number(d>=prev));
      }
    }
    assert.equal(nextDigit,t-e);
    assert.equal(wordRankOne(decoded,cyclic),wRank);
    codes[i]=decoded;
  }
  assert.equal(rank,0n);
  return codes;
}
/*
 * The original 31 physically visible large punctuation glyphs carry a
 * source-observable binary shape: 28 thirteen-dot and 3 ten-dot. A natural
 * (but still speculative) quotient-sidecar read takes 13-dot=0, 10-dot=1
 * from first to last. That read is S=392, within the GP28 23-bit quotient
 * domain. The other binary polarity and endianness reads are out of range.
 * Exact original GP28 decoding and an independently planted genuine
 * solved-native GP28 positive are both checked before claiming a key.
 */
const largeDots=punctuation.events.filter(e=>e.symbol==="⁜")
  .map(e=>e.large_mark.dot_count);
assert.equal(largeDots.length,31);
assert.equal(largeDots.filter(n=>n===10).length,3);
assert.equal(largeDots.filter(n=>n===13).length,28);
const mask31=(list,tenIsOne)=>list.reduce(
  (v,d)=>(v<<1n)+BigInt(Number((d===10)===tenIsOne)),0n);
const glyphQuotient=mask31(largeDots,true);
assert.equal(glyphQuotient,392n);
const quotientDomainMax=(plain28Size-1n)/wordSize;
assert.equal(quotientDomainMax,5082098n);
for(const alt of [
  mask31(largeDots,false),mask31(largeDots.slice().reverse(),true),
  mask31(largeDots.slice().reverse(),false)
]) assert.ok(alt>quotientDomainMax);
const gp28Alphabet=corpus.translit.map((_,i)=>i).filter(i=>i!==12);
const gp28Index=new Map(gp28Alphabet.map((n,i)=>[n,i]));
const original28=[];
for(const cyclic of [false,true]){
  const v=glyphQuotient*wordSize+rankWords(words,cyclic);
  assert.ok(v<plain28Size);
  const runes=toBase(v,28,total).map(i=>gp28Alphabet[i]);
  original28.push({cyclic,globalIoc:ioc(runes),
    p0p1Ioc300:ioc(runes.slice(0,300)),
    p16Ioc200:ioc(runes.slice(3762,3962)),
    last2896Ioc:ioc(runes.slice(-2896))});
}
assert.ok(original28.every(v=>v.p0p1Ioc300<controls.n300.min));
assert.ok(original28.every(v=>v.p16Ioc200<controls.n200.min));

const fullNativeGp28=Array.from({length:total},(_,i)=>
  solvedSections.flat()[i % solvedSections.flat().length]);
assert.ok(fullNativeGp28.every(i=>gp28Index.has(i)));
const fullNativeInt=fullNativeGp28.reduce(
  (v,i)=>v*28n+BigInt(gp28Index.get(i)),0n);
const nativeSide=fullNativeInt/wordSize;
const nativeRank=fullNativeInt%wordSize;
assert.ok(nativeSide<=quotientDomainMax);
const native31Bits=toBase(nativeSide,2,31);
assert.equal(native31Bits.reduce((v,d)=>v*2n+BigInt(d),0n),nativeSide);
const nativeCipher=unrankWords(nativeRank,words,false);
assert.equal(rankWords(nativeCipher,false),nativeRank);
const nativeDecoded=toBase(nativeSide*wordSize+
  rankWords(nativeCipher,false),28,total).map(i=>gp28Alphabet[i]);
assert.deepEqual(nativeDecoded,fullNativeGp28);
assert.equal(nativeCipher.reduce((v,w)=>v+w.length,0),total);

const chapterOpeningWords=words.filter((w,i)=>{
  let prefix=0;
  for(let j=0;j<=i;j++)prefix+=words[j].length;
  return prefix<=729;
});
assert.equal(chapterOpeningWords.length,158);
assert.equal(chapterOpeningWords.reduce((sum,w)=>sum+w.length,0),729);
const openingM=chapterOpeningWords.reduce((v,w)=>v*codebook(w),1n);
const native27=solvedSections.flat().slice(0,729);
const xNative=native27.reduce((v,z)=>v*27n+BigInt(gpTo27.get(z)),0n);
const pNative=27n ** 729n;
assert.ok(openingM>=pNative);
const rankPlant=xNative*openingM/pNative;
const plantedWords=unrankWords(rankPlant,chapterOpeningWords,false);
assert.equal(rankWords(plantedWords,false),rankPlant);
assert.equal(((rankPlant+1n)*pNative-1n)/openingM,xNative);
assert.deepEqual(toBase(xNative,27,729).map(i=>source27[i]),native27);

const plain27Original=[];
for(const cyclic of [false,true]) {
  const originalRank=rankWords(words,cyclic);
  const x=((originalRank+1n)*plain27Size-1n)/wordSize;
  const canonicalRank=x*wordSize/plain27Size;
  assert.notEqual(originalRank,canonicalRank);
  const plain=toBase(x,27,total).map(i=>source27[i]);
  plain27Original.push({
    cyclic,wholeIoc:ioc(plain),p0p1Ioc300:ioc(plain.slice(0,300)),
    p16Ioc200:ioc(plain.slice(3762,3962)),
    canonicalForwardMatchesOriginal:originalRank===canonicalRank
  });
}
assert.ok(plain27Original.every(v=>v.p0p1Ioc300<controls.n300.min));
assert.ok(plain27Original.every(v=>v.p16Ioc200<controls.n200.min));

/*
 * The smaller GP28 source reduces the whole-book deficit to 23 bits, but
 * the physical 31 large ornaments alone cannot serve as independent
 * chapter-local GP28 quotient fields. The nine original visual chapters
 * have actual exact-word GP28 minimum side bits 0,0,0,6,16,4,3,6,0;
 * only 4,2,2,2 physical large glyphs appear respectively in the four
 * failing chapters. This uses marks' source-page attributes to avoid
 * counting a boundary mark twice at the same printed rune offset.
 */
const native28ChapterNeeds=[],largeGlyphChapterCounts=[],largeGlyphDeficits=[];
for(const [lo,hi] of visualChapters){
  const start=starts.get(lo);
  const end=starts.get(hi)+corpus.pages.find(p=>p.page===hi).indices.length;
  const scope=words.filter((_,i)=>ends[i]>start&&ends[i]<=end);
  const L=scope.reduce((v,w)=>v+w.length,0);
  assert.equal(L,end-start);
  const M=scope.reduce((v,w)=>v*codebook(w),1n);
  const requiredBits=missingBits(28n**BigInt(L),M);
  const large=punctuation.events.filter(e=>e.symbol==='⁜' &&
    e.page>=lo&&e.page<=hi).length;
  native28ChapterNeeds.push(requiredBits);
  largeGlyphChapterCounts.push(large);
  if(requiredBits>large)largeGlyphDeficits.push([lo,requiredBits,large]);
}
assert.deepEqual(native28ChapterNeeds,[0,0,0,6,16,4,3,6,0]);
assert.deepEqual(largeGlyphChapterCounts,[2,8,1,4,2,2,8,2,2]);
assert.deepEqual(largeGlyphDeficits,[[15,6,4],[23,16,2],[27,4,2],[40,6,2]]);

/* Real solved-native plaintext, planted through a length-expanding GP28
   nonrepeat transition encoder, recovers exactly under the same decoder. */
const native = solvedSections.flat().slice(0, 300);
let value = 0n;
for (const v of native) value = value * 29n + BigInt(v);
let m = 0;
while (28n ** BigInt(m) < 29n ** BigInt(native.length)) m++;
const digits = Array(m).fill(0);
for (let j = digits.length - 1; j >= 0; j--) {
  digits[j] = Number(value % 28n);
  value /= 28n;
}
assert.equal(value, 0n);
const planted = [0];
for (const d of digits) {
  const prev = planted[planted.length - 1];
  planted.push(d >= prev ? d + 1 : d);
}
assert.equal(repeatCount(planted), 0);
assert.deepEqual(directInverse(planted, false, false, false).slice(-native.length), native);

console.log(JSON.stringify({
  original: { runes: total, words: words.length, pages: pages.length,
    withinPageRepeats: 86, withinWordRepeats: 63 },
  exactMissingBits: required,
  predecessorRankMinimum: { global:globalRankMin.minimum,
    simultaneousTwoRanks:globalTwoRankMin.minimum,
    twoRankAttainingSourceLabels:globalTwoRankMin.labels.map(i=>corpus.translit[i]),
    chapterTwoRankMinima:chapterTwoRankMin,
    chapterTwoRankTotal:chapterTwoRankMin.reduce((a,b)=>a+b,0),
    pageResetTwoRankMinimum:pageTwoRankMin.reduce((a,b)=>a+b,0),
    exhaustiveQ5TwoRank:toyTwoExhaustiveMin,
    attainingSourcePair:globalRankMin.pair.map(i=>corpus.translit[i]),
    perVisualChapter:perChapterRankMin, chapterTotal:chapterMinTotal,
    exhaustiveQ5Control:toyExhaustiveMin },
  punctuation: { events: events.length, distinctWordEndSites: distinctSites.size,
    identityOnlyMaxBits: events.length * Math.log2(3),
    fixedMultisetBits: Math.log2(Number(multisetIdentities)),
    placementBits: Math.log2(Number(possiblePositions)) },
  insufficientLocalPages: localDeficits,
  insufficientWordPreservingLocalChapters: chapterDeficits,
  chaptersStillInsufficientWithThreePunctuationSymbols: chapterDeficitsEvenWithTernaryGlyphs,
  solvedIoc: controls, directOriginalInverses: variants,
  sidecarIndependent2896RuneSuffix: sideInvariantSuffix,
  literal31GlyphGP28Sidecar: {
    binaryRead: glyphQuotient.toString(), maxQuotient:quotientDomainMax.toString(),
    competingThreeBinaryReadsInvalid: true, actualDecoded:original28,
    nativeGP28ChapterRequiredBits:native28ChapterNeeds,
    physicalLargeGlyphsPerChapter:largeGlyphChapterCounts,
    chapterLocalInsufficientLargeGlyphs:largeGlyphDeficits,
    plantedNativeGP28Runes:total, plantedSide: nativeSide.toString()
  },
  genuineGP27ReducedSource: {missingBits:0,
    GP28WordFixedMissingBits:23,
    openingPlantedRunes:729,original:plain27Original},
  plantedPositive: "PASS"
}, null, 2));
