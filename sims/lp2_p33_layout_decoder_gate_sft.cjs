"use strict";

/**
 * Director #1783 SFT: three predeclared p33 layout-selected reversible consumers.
 *
 * Consumers:
 *  1. Physical-line readout permutations.
 *  2. One reversible outer-pair H/Hinv pass within each printed body line.
 *  3. Solved p56 prime-totient stream, reset at each visible p33 section,
 *     with exhaustive F-interrupter keep/literal masks.
 *
 * Exact inverse/forward checks are required for every candidate. Language
 * ranking uses a fixed GP29 trigram model built only from published solved
 * plaintext records; p56 is excluded from the model when used as a positive
 * totient control.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune,index) => [rune,index]));
const mod29 = value => ((value % 29) + 29) % 29;
const inv2 = 15;
const H = (left,right) => [mod29(left-right),mod29(left+right)];
const Hinv = (diff,sum) => [
  mod29((diff+sum)*inv2),
  mod29((sum-diff)*inv2),
];

/** @param {string} source */
const runeValues = source =>
  [...source]
    .map(ch => runeIndex.get(ch))
    .filter(value => value !== undefined);

/** @param {number[]} values */
const translit = values => values.map(value => corpus.translit[value]).join("");

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const n = values.length;
  return counts.reduce((sum,count) => sum+count*(count-1),0)/(n*(n-1));
}

// ---------------------------------------------------------------------------
// Source layout: parse p33's two visible sections and preserve exact body lines.
// ---------------------------------------------------------------------------

const p33Text = transcription.split("%")[33];
const rawSections = p33Text.split("&");
assert.equal(rawSections.length,2);

function parseSection(sectionText) {
  const physical = sectionText
    .split("/")
    .filter(line => line.trim().length > 0);
  let titleDone = false;
  let title = [];
  const bodyLines = [];

  for (const line of physical) {
    let bodyPart = line;
    if (!titleDone) {
      const dot = line.indexOf(".");
      assert.ok(dot >= 0);
      title = runeValues(line.slice(0,dot));
      bodyPart = line.slice(dot+1);
      titleDone = true;
    }
    bodyLines.push(runeValues(bodyPart));
  }

  return {
    title,
    bodyLines,
    body:bodyLines.flat(),
    lineLengths:bodyLines.map(line => line.length),
  };
}

const sections = rawSections.map(parseSection);
assert.deepEqual(
  sections.map(section => ({
    title:section.title.length,
    body:section.body.length,
    lines:section.lineLengths,
  })),
  [
    {title:10,body:81,lines:[8,16,18,23,16]},
    {title:8,body:115,lines:[11,18,18,22,22,24]},
  ]
);

const p33 = corpus.pages.find(page => page.page === 33);
assert.ok(p33);
assert.deepEqual(sections[0].title,p33.indices.slice(0,10));
assert.deepEqual(sections[0].body,p33.indices.slice(10,91));
assert.deepEqual(sections[1].title,p33.indices.slice(91,99));
assert.deepEqual(sections[1].body,p33.indices.slice(99,214));

// ---------------------------------------------------------------------------
// Fixed language reference: GP29 trigrams from solved plaintext, excluding p56.
// ---------------------------------------------------------------------------

const training = solved.sections
  .filter(section => section.name !== "p56_an_end")
  .map(section => runeValues(section.source_text));

const N = 29;
const alpha = 0.1;
const trigramCounts = new Map();
let trigramTotal = 0;
for (const values of training) {
  for (let i=0; i+2<values.length; i+=1) {
    const key = values[i]*N*N + values[i+1]*N + values[i+2];
    trigramCounts.set(key,(trigramCounts.get(key)||0)+1);
    trigramTotal += 1;
  }
}
const denom = trigramTotal + alpha*N*N*N;
const unseenLog = Math.log(alpha/denom);

/** @param {number[]} values */
function trigramScore(values) {
  let score = 0;
  let count = 0;
  for (let i=0; i+2<values.length; i+=1) {
    const key = values[i]*N*N + values[i+1]*N + values[i+2];
    const hits = trigramCounts.get(key)||0;
    score += hits
      ? Math.log((hits+alpha)/denom)
      : unseenLog;
    count += 1;
  }
  return score/count;
}

const solvedScores = training
  .filter(values => values.length >= 50)
  .map(values => trigramScore(values));
const solvedRange = {
  min:Math.min(...solvedScores),
  max:Math.max(...solvedScores),
};

// ---------------------------------------------------------------------------
// Consumer 1: physical-line readout permutations.
// ---------------------------------------------------------------------------

function transformLines(lines,variant) {
  let current = lines.map(line => [...line]);

  if (variant.reverseLineOrder) current = [...current].reverse();
  if (variant.reverseEachLine) current = current.map(line => [...line].reverse());
  if (variant.boustrophedon !== null) {
    current = current.map((line,index) =>
      index%2 === variant.boustrophedon ? [...line].reverse() : [...line]
    );
  }
  return current;
}

// All low-description line-order variants. Raw is retained as a control.
const lineVariants = [
  {name:"raw",reverseLineOrder:false,reverseEachLine:false,boustrophedon:null},
  {name:"reverse-lines",reverseLineOrder:true,reverseEachLine:false,boustrophedon:null},
  {name:"reverse-each",reverseLineOrder:false,reverseEachLine:true,boustrophedon:null},
  {name:"reverse-both",reverseLineOrder:true,reverseEachLine:true,boustrophedon:null},
  {name:"boustro-even",reverseLineOrder:false,reverseEachLine:false,boustrophedon:0},
  {name:"boustro-odd",reverseLineOrder:false,reverseEachLine:false,boustrophedon:1},
];

const lineResults = [];
for (let sectionIndex=0; sectionIndex<sections.length; sectionIndex+=1) {
  const source = sections[sectionIndex].bodyLines;
  for (const variant of lineVariants) {
    const transformedLines = transformLines(source,variant);
    const output = transformedLines.flat();

    // Each transform is an involution except reverse-lines combined with
    // line-local operations whose indexing changes. Here variants are applied
    // independently, and the same named transform must restore the source.
    const roundTrip = transformLines(transformedLines,variant).flat();
    assert.deepEqual(roundTrip,sections[sectionIndex].body);

    lineResults.push({
      section:sectionIndex+1,
      variant:variant.name,
      score:trigramScore(output),
      ioc:ioc(output),
      preview:translit(output).slice(0,180),
    });
  }
}

// ---------------------------------------------------------------------------
// Consumer 2: one H/Hinv pass within each physical body line.
// ---------------------------------------------------------------------------

function linePairPass(lines,fn) {
  return lines.map(line => {
    const out = [...line];
    for (let left=0,right=line.length-1; left<right; left+=1,right-=1) {
      const pair = fn(line[left],line[right]);
      out[left] = pair[0];
      out[right] = pair[1];
    }
    return out;
  });
}

const hResults = [];
for (let sectionIndex=0; sectionIndex<sections.length; sectionIndex+=1) {
  const source = sections[sectionIndex].bodyLines;

  const h = linePairPass(source,H);
  const hRecovered = linePairPass(h,Hinv);
  assert.deepEqual(hRecovered.flat(),sections[sectionIndex].body);
  hResults.push({
    section:sectionIndex+1,
    variant:"H-per-line",
    score:trigramScore(h.flat()),
    ioc:ioc(h.flat()),
    preview:translit(h.flat()).slice(0,180),
  });

  const hi = linePairPass(source,Hinv);
  const hiRecovered = linePairPass(hi,H);
  assert.deepEqual(hiRecovered.flat(),sections[sectionIndex].body);
  hResults.push({
    section:sectionIndex+1,
    variant:"Hinv-per-line",
    score:trigramScore(hi.flat()),
    ioc:ioc(hi.flat()),
    preview:translit(hi.flat()).slice(0,180),
  });
}

// ---------------------------------------------------------------------------
// Consumer 3: solved p56 totient stream, reset at each p33 section.
// ---------------------------------------------------------------------------

function primes(count) {
  const out = [];
  for (let candidate=2; out.length<count; candidate+=1) {
    let prime = true;
    for (let divisor=2; divisor*divisor<=candidate; divisor+=1) {
      if (candidate%divisor===0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const primeList = primes(256);

/**
 * Enumerate the exact historical F-interrupter choice family.
 * A ciphertext F can either be enciphered normally or be a literal F that
 * consumes no prime. No other skip positions are allowed.
 * @param {number[]} cipher
 */
function totientCandidates(cipher) {
  const fPositions = cipher
    .map((value,index) => value===0 ? index : null)
    .filter(index => index !== null);

  const candidates = [];
  for (let mask=0; mask<(1<<fPositions.length); mask+=1) {
    const literal = new Set(
      fPositions.filter((_,bit) => (mask&(1<<bit)) !== 0)
    );
    let keyIndex = 0;
    const plain = [];

    for (let index=0; index<cipher.length; index+=1) {
      if (literal.has(index)) {
        plain.push(0);
        continue;
      }
      const key = (primeList[keyIndex]-1)%29;
      plain.push(mod29(cipher[index]-key));
      keyIndex += 1;
    }

    // Exact forward check with the same literal-F mask.
    keyIndex = 0;
    const rebuilt = [];
    for (let index=0; index<plain.length; index+=1) {
      if (literal.has(index)) {
        assert.equal(plain[index],0);
        rebuilt.push(0);
        continue;
      }
      const key = (primeList[keyIndex]-1)%29;
      rebuilt.push(mod29(plain[index]+key));
      keyIndex += 1;
    }
    assert.deepEqual(rebuilt,cipher);

    candidates.push({
      literal:[...literal],
      plain,
      score:trigramScore(plain),
      ioc:ioc(plain),
    });
  }

  return candidates.sort((left,right) => right.score-left.score);
}

// Held-out solved positive control. The p56 ciphertext has five F positions;
// exhaustive 32-mask application contains the exact published plaintext.
const p56 = corpus.pages.find(page => page.page === 56);
assert.ok(p56);
const publishedP56 = runeValues(
  solved.sections.find(section => section.name === "p56_an_end").source_text
);
const p56Candidates = totientCandidates(p56.indices);
const p56ExactIndex = p56Candidates.findIndex(candidate =>
  candidate.plain.length===publishedP56.length &&
  candidate.plain.every((value,index) => value===publishedP56[index])
);
assert.ok(p56ExactIndex>=0);
assert.deepEqual(p56Candidates[p56ExactIndex].literal,[56]);

const totientResults = [];
for (let sectionIndex=0; sectionIndex<sections.length; sectionIndex+=1) {
  const candidates = totientCandidates(sections[sectionIndex].body);
  const best = candidates[0];
  totientResults.push({
    section:sectionIndex+1,
    candidateCount:candidates.length,
    bestLiteral:best.literal,
    bestScore:best.score,
    bestIoc:best.ioc,
    bestPreview:translit(best.plain).slice(0,220),
    top4:candidates.slice(0,4).map(candidate => ({
      literal:candidate.literal,
      score:candidate.score,
    })),
  });
}

// ---------------------------------------------------------------------------
// Decision gate.
// ---------------------------------------------------------------------------

const allCandidateScores = [
  ...lineResults.filter(row => row.variant!=="raw").map(row => row.score),
  ...hResults.map(row => row.score),
  ...totientResults.map(row => row.bestScore),
];
const bestCandidateScore = Math.max(...allCandidateScores);

// The candidates remain far outside the solved plaintext calibration. This is
// a fixed diagnostic threshold rather than a learned key selector: even the
// best candidate must beat the worst long solved section to qualify for human
// plaintext inspection.
assert.ok(bestCandidateScore < solvedRange.min);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "Director #1783 compact negative: three p33 layout-selected reversible consumers fail",
  p33Layout:sections.map((section,index) => ({
    section:index+1,
    titleLength:section.title.length,
    bodyLength:section.body.length,
    bodyLineLengths:section.lineLengths,
  })),
  solvedCalibration:solvedRange,
  consumer1_lineReadouts:{
    count:lineResults.length,
    best:[...lineResults]
      .filter(row => row.variant!=="raw")
      .sort((a,b) => b.score-a.score)[0],
    results:lineResults,
  },
  consumer2_lineH:{
    count:hResults.length,
    best:[...hResults].sort((a,b) => b.score-a.score)[0],
    results:hResults,
  },
  consumer3_totient:{
    p56PositiveControl:{
      exactCandidateRank:p56ExactIndex+1,
      literalPositions:p56Candidates[p56ExactIndex].literal,
      exactScore:p56Candidates[p56ExactIndex].score,
      totalMasks:p56Candidates.length,
    },
    p33:totientResults,
  },
  bestCandidateScore,
  decision:
    "No p33 body plaintext. Retire these three layout-decoder consumers; keep p33 as a state/checkpoint page until a new source clue supplies a different operation.",
},null,2));
