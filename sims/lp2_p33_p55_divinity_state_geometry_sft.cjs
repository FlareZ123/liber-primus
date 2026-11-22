"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

// Authenticated/recovered DH state.
const state = {
  p: 23,
  g: 5,
  b: 15,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
  A: 8,
};

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}
assert.equal(state.p - state.g, 18);
assert.equal(state.b + state.K, 17);
assert.equal(state.K * state.g, 10);

/** @param {number} address @param {string} alphabet @param {number} radix @returns {number} */
function tableValue(address, alphabet, radix) {
  const token = tape[address];
  return radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}

// P33's map-road RISE receiver.
const RISE_GP0 = 47;
assert.equal(tape[RISE_GP0], "1G");
const rise59 = tableValue(RISE_GP0, alpha59, 59);
const rise60 = tableValue(RISE_GP0, alpha60, 60);
assert.deepEqual([rise59, rise60], [75, 76]);

// Reconstruct continuous words and page-crossing carries exactly as printed.
const segments = raw.split("%").slice(0, 55);
const stream = segments.join("%");

/** @typedef {{page:number,value:number}[]} Word */
/** @type {Word[]} */
const words = [];
/** @type {{page:number,value:number}[]} */
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({ page: runePage, value: runeIndex.get(character) });
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Physical line wrapping preserves the current word.
  } else {
    finishWord();
  }
}
finishWord();

/** @param {number} page @returns {number} */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

// Incoming carry length for every rune page.
const carryByPhysical = new Map([[0, 0]]);
for (let page = 1; page < segments.length; page += 1) {
  const crossing = words.find((word) =>
    word[0].page < page && word.some((site) => site.page === page)
  );
  carryByPhysical.set(
    physicalPage(page),
    crossing ? crossing.filter((site) => site.page === page).length : 0
  );
}

// RISE's two radix readings uniquely identify p55's two legitimate counts:
// 76 physical runes, 75 locally owned after the one-rune incoming carry.
const risePageHits = corpus.pages
  .filter((page) => page.page <= 55)
  .map((page) => ({
    physicalPage: page.page,
    runes: page.indices.length,
    carry: carryByPhysical.get(page.page) || 0,
    localRunes: page.indices.length - (carryByPhysical.get(page.page) || 0),
  }))
  .filter((page) => page.runes === rise60 && page.localRunes === rise59);

assert.deepEqual(risePageHits, [{
  physicalPage: 55,
  runes: 76,
  carry: 1,
  localRunes: 75,
}]);

// Build strict word-interior streams page by page. Only words wholly contained
// on a page contribute interiors; cross-page carry fragments are boundaries.
const pageInteriors = [];
for (let page = 0; page < segments.length; page += 1) {
  const completeWords = words.filter((word) =>
    word[0].page === page && word[word.length - 1].page === page
  );
  const interior = completeWords.flatMap((word) =>
    word.length >= 3 ? word.slice(1, -1).map((site) => site.value) : []
  );
  pageInteriors.push({
    physicalPage: physicalPage(page),
    completeWords: completeWords.length,
    interior,
  });
}

const p55 = pageInteriors.find((page) => page.physicalPage === 55);
assert.ok(p55);
assert.equal(p55.completeWords, 16);
assert.equal(p55.interior.length, 43);

// "DIVINITY" begins with D, whose GP ordinal is p=23. In the peeled p55
// interior D occurs exactly at one-based positions g=5 and p=23.
const dPositions = p55.interior
  .map((value, index) => value === state.p ? index + 1 : null)
  .filter((position) => position !== null);
assert.deepEqual(dPositions, [state.g, state.p]);

const left = state.g;
const right = state.p;
const span = p55.interior.slice(left - 1, right);
const centerPosition = (left + right) / 2;
const centerValue = p55.interior[centerPosition - 1];

assert.equal(right - left, state.p - state.g);
assert.equal(right - left - 1, state.b + state.K);
assert.equal(span.length, state.B);
assert.equal(centerPosition, 14);
assert.equal(centerValue, state.K * state.g);

// The p33-authenticated H orientation splits the B=19 span into two
// nine-rune branches plus the fixed center. Their GP0 sums exactly label the
// p57 instruction object and title.
const circumferenceBranch = [];
const parableBranch = [];
for (let index = 0; index < (span.length - 1) / 2; index += 1) {
  const [difference, sum] = H(span[index], span[span.length - 1 - index]);
  circumferenceBranch.push(difference);
  parableBranch.push(sum);
}
const circumferenceBranchGp0 = circumferenceBranch.reduce((sum, value) => sum + value, 0);
const parableBranchGp0 = parableBranch.reduce((sum, value) => sum + value, 0);
assert.equal(circumferenceBranchGp0, 131); // GP0(CIRCUMFERENCES)
assert.equal(parableBranchGp0, 120); // GP0(PARABLE)

// Existing p57/p50 word-graph edges converge on the same PARABLE number.
const shedGp0 = 64;
assert.equal(tableValue(shedGp0, alpha59, 59), parableBranchGp0);
assert.equal(tableValue(circumferenceBranchGp0, alpha60, 60), parableBranchGp0);
assert.equal(tableValue(parableBranchGp0, alpha60, 60), 42); // GP0(FIND)

// "WITHIN" plus the already selected e^2=9 size picks the centered nine-rune
// shell of the 43-rune interior. The same H split yields two authenticated
// source labels whose H combination reconstructs [e,A].
const centerNineStart = (p55.interior.length - state.e ** 2) / 2;
assert.equal(centerNineStart, 17);
const centerNine = p55.interior.slice(
  centerNineStart,
  centerNineStart + state.e ** 2
);
assert.equal(centerNine.length, state.e ** 2);
assert.equal(centerNine[(centerNine.length - 1) / 2], state.b);

const instarBranch = [];
const openPgpBranch = [];
for (let index = 0; index < (centerNine.length - 1) / 2; index += 1) {
  const [difference, sum] = H(
    centerNine[index],
    centerNine[centerNine.length - 1 - index]
  );
  instarBranch.push(difference);
  openPgpBranch.push(sum);
}
const instarBranchGp0 = instarBranch.reduce((sum, value) => sum + value, 0);
const openPgpBranchGp0 = openPgpBranch.reduce((sum, value) => sum + value, 0);
assert.equal(instarBranchGp0, 78); // GP0(INSTAR)
assert.equal(openPgpBranchGp0, 75); // GP0(OPENPGP)
assert.deepEqual(H(instarBranchGp0, openPgpBranchGp0), [state.e, state.A]);

// Corpus-wide control in the correct source object: concatenate the strict
// interiors of complete words on each page, then charge every 43-rune window
// for the exact [D at g, D at p, center K*g] state geometry.
let chargedWindows = 0;
const geometryHits = [];
let spanWindows = 0;
let centerNineWindows = 0;
let circumferenceOnlyHits = 0;
let parableOnlyHits = 0;
let branchPairHits = 0;
const typedSpanHits = [];
let instarOnlyHits = 0;
let openPgpOnlyHits = 0;
let centerNinePairHits = 0;
const typedCenterNineHits = [];
for (const page of pageInteriors) {
  for (let start = 0; start + 43 <= page.interior.length; start += 1) {
    chargedWindows += 1;
    const values = page.interior;
    if (
      values[start + state.g - 1] === state.p
      && values[start + state.p - 1] === state.p
      && values[start + centerPosition - 1] === state.K * state.g
    ) {
      geometryHits.push({
        physicalPage: page.physicalPage,
        start,
        interiorLength: page.interior.length,
      });
    }
  }

  for (let start = 0; start + state.B <= page.interior.length; start += 1) {
    spanWindows += 1;
    const candidate = page.interior.slice(start, start + state.B);
    const differences = [];
    const sums = [];
    for (let index = 0; index < (state.B - 1) / 2; index += 1) {
      const [difference, sum] = H(
        candidate[index],
        candidate[state.B - 1 - index]
      );
      differences.push(difference);
      sums.push(sum);
    }
    const differenceGp0 = differences.reduce((total, value) => total + value, 0);
    const sumGp0 = sums.reduce((total, value) => total + value, 0);
    if (differenceGp0 === circumferenceBranchGp0) circumferenceOnlyHits += 1;
    if (sumGp0 === parableBranchGp0) parableOnlyHits += 1;
    if (
      differenceGp0 === circumferenceBranchGp0
      && sumGp0 === parableBranchGp0
    ) {
      branchPairHits += 1;
      if (candidate[(state.B - 1) / 2] === state.K * state.g) {
        typedSpanHits.push({
          physicalPage: page.physicalPage,
          start,
          center: candidate[(state.B - 1) / 2],
        });
      }
    }
  }

  for (let start = 0; start + state.e ** 2 <= page.interior.length; start += 1) {
    centerNineWindows += 1;
    const candidate = page.interior.slice(start, start + state.e ** 2);
    const differences = [];
    const sums = [];
    for (let index = 0; index < (candidate.length - 1) / 2; index += 1) {
      const [difference, sum] = H(
        candidate[index],
        candidate[candidate.length - 1 - index]
      );
      differences.push(difference);
      sums.push(sum);
    }
    const differenceGp0 = differences.reduce((total, value) => total + value, 0);
    const sumGp0 = sums.reduce((total, value) => total + value, 0);
    if (differenceGp0 === instarBranchGp0) instarOnlyHits += 1;
    if (sumGp0 === openPgpBranchGp0) openPgpOnlyHits += 1;
    if (
      differenceGp0 === instarBranchGp0
      && sumGp0 === openPgpBranchGp0
    ) {
      centerNinePairHits += 1;
      if (candidate[(candidate.length - 1) / 2] === state.b) {
        typedCenterNineHits.push({
          physicalPage: page.physicalPage,
          start,
          center: candidate[(candidate.length - 1) / 2],
        });
      }
    }
  }
}

assert.equal(chargedWindows, 4803);
assert.deepEqual(geometryHits, [{
  physicalPage: 55,
  start: 0,
  interiorLength: 43,
}]);
assert.equal(spanWindows, 6112);
assert.equal(circumferenceOnlyHits, 77);
assert.equal(parableOnlyHits, 93);
assert.equal(branchPairHits, 3);
assert.deepEqual(typedSpanHits, [{
  physicalPage: 55,
  start: state.g - 1,
  center: state.K * state.g,
}]);
assert.equal(centerNineWindows, 6662);
assert.equal(instarOnlyHits, 68);
assert.equal(openPgpOnlyHits, 88);
assert.equal(centerNinePairHits, 1);
assert.deepEqual(typedCenterNineHits, [{
  physicalPage: 55,
  start: centerNineStart,
  center: state.b,
}]);


const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedClear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(signedClear);
const sourceWords = (signedClear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

function hBranches(values) {
  assert.equal(values.length % 2, 1);
  const differences = [];
  const sums = [];
  for (let index = 0; index < (values.length - 1) / 2; index += 1) {
    const [difference, sum] = H(values[index], values[values.length - 1 - index]);
    differences.push(difference);
    sums.push(sum);
  }
  const differenceRaw = differences.reduce((total, value) => total + value, 0);
  const sumRaw = sums.reduce((total, value) => total + value, 0);
  return {
    differences, sums, center: values[(values.length - 1) / 2],
    differenceRaw, sumRaw,
    differenceGp0: mod29(differenceRaw), sumGp0: mod29(sumRaw),
  };
}
const flankLength = state.b + state.K;
const innerLength = state.e ** 2;
assert.deepEqual([flankLength, innerLength, flankLength], [17, 9, 17]);
assert.equal(2 * flankLength + innerLength, p55.interior.length);
const leftFlank = p55.interior.slice(0, flankLength);
const rightFlank = p55.interior.slice(flankLength + innerLength);
const leftFlankH = hBranches(leftFlank);
const rightFlankH = hBranches(rightFlank);
const centerIndices = [leftFlankH.center, centerNine[(centerNine.length - 1) / 2], rightFlankH.center];
const centerWords = centerIndices.map((index) => sourceWords[index]);
const emergeReadoutIndices = [leftFlankH.differenceGp0, leftFlankH.sumGp0, rightFlankH.differenceGp0, rightFlankH.sumGp0];
const emergeReadoutWords = emergeReadoutIndices.map((index) => sourceWords[index]);
assert.deepEqual([leftFlankH.differenceRaw,leftFlankH.sumRaw,rightFlankH.differenceRaw,rightFlankH.sumRaw],[128,89,98,88]);
assert.deepEqual(emergeReadoutIndices,[12,2,11,1]);
assert.deepEqual(emergeReadoutWords,["THE","PATH","IS","THE"]);
assert.deepEqual(centerIndices,[17,15,2]);
assert.deepEqual(centerWords,["THE","WORDS","PATH"]);

let emergeFlankWindows=0;
const emergeFlankMarginalHits=[0,0,0,0];
const emergeFlankHits=[];
for(const page of pageInteriors){
  for(let start=0;start+43<=page.interior.length;start+=1){
    emergeFlankWindows+=1;
    const candidate=page.interior.slice(start,start+43);
    const candidateLeft=hBranches(candidate.slice(0,flankLength));
    const candidateCenter=hBranches(candidate.slice(flankLength,flankLength+innerLength));
    const candidateRight=hBranches(candidate.slice(flankLength+innerLength));
    const indices=[candidateLeft.differenceGp0,candidateLeft.sumGp0,candidateRight.differenceGp0,candidateRight.sumGp0];
    indices.forEach((value,index)=>{if(value===[12,2,11,1][index])emergeFlankMarginalHits[index]+=1;});
    if(indices.every((value,index)=>value===[12,2,11,1][index])){
      emergeFlankHits.push({
        physicalPage:page.physicalPage,start,indices,
        words:indices.map(index=>sourceWords[index]),
        centerIndices:[candidateLeft.center,candidateCenter.center,candidateRight.center],
        centerNineSignature:[candidateCenter.differenceGp0,candidateCenter.sumGp0,candidateCenter.center],
        matchesDStateGeometry:candidate[state.g-1]===state.p&&candidate[state.p-1]===state.p&&candidate[centerPosition-1]===state.K*state.g,
      });
    }
  }
}
assert.equal(emergeFlankWindows,chargedWindows);
assert.deepEqual(emergeFlankMarginalHits,[167,172,183,162]);
assert.equal(emergeFlankHits.length,1);
assert.deepEqual(emergeFlankHits.map(hit=>[hit.physicalPage,hit.start]),[[55,0]]);
assert.deepEqual(emergeFlankHits[0].indices,[12,2,11,1]);
assert.deepEqual(emergeFlankHits[0].words,["THE","PATH","IS","THE"]);
assert.deepEqual(emergeFlankHits[0].centerIndices,[17,15,2]);
assert.deepEqual(emergeFlankHits[0].centerNineSignature,[20,17,15]);
assert.equal(emergeFlankHits[0].matchesDStateGeometry,true);

console.log(JSON.stringify({
  status: "PASS",
  sourceState: state,
  p33RiseReceiver: {
    gp0: RISE_GP0,
    token: tape[RISE_GP0],
    base59: rise59,
    base60: rise60,
    exactPageHits: risePageHits,
  },
  p55StrictInterior: {
    length: p55.interior.length,
    completeWords: p55.completeWords,
    dRuneOrdinal: state.p,
    dPositions,
    positionGap: right - left,
    strictBetween: right - left - 1,
    inclusiveSpan: span.length,
    centerPosition,
    centerValue,
    hSplit: {
      differenceBranch: circumferenceBranch,
      differenceGp0: circumferenceBranchGp0,
      differenceLabel: "CIRCUMFERENCES",
      sumBranch: parableBranch,
      sumGp0: parableBranchGp0,
      sumLabel: "PARABLE",
      center: centerValue,
      p50Convergence: {
        shedBase59ToParable: tableValue(shedGp0, alpha59, 59),
        circumferencesBase60ToParable: tableValue(circumferenceBranchGp0, alpha60, 60),
        parableBase60ToFind: tableValue(parableBranchGp0, alpha60, 60),
      },
    },
    centeredESquaredShell: {
      size: centerNine.length,
      start: centerNineStart,
      center: state.b,
      differenceBranch: instarBranch,
      differenceGp0: instarBranchGp0,
      differenceLabel: "INSTAR",
      sumBranch: openPgpBranch,
      sumGp0: openPgpBranchGp0,
      sumLabel: "OPENPGP",
      branchLabelH: H(instarBranchGp0, openPgpBranchGp0),
      stateLabels: ["e", "A"],
    },
    stateReading: {
      positions: ["g", "p"],
      gap: "p-g",
      strictBetween: "b+K",
      inclusiveSpan: "B",
      centerRune: "K*g",
    },
  },
  emergeFlanks: {
    structure:[flankLength,innerLength,flankLength],
    left:{length:leftFlank.length,differenceBranch:leftFlankH.differences,differenceRaw:leftFlankH.differenceRaw,differenceGp0:leftFlankH.differenceGp0,differenceWord:sourceWords[leftFlankH.differenceGp0],sumBranch:leftFlankH.sums,sumRaw:leftFlankH.sumRaw,sumGp0:leftFlankH.sumGp0,sumWord:sourceWords[leftFlankH.sumGp0],center:leftFlankH.center,centerWord:sourceWords[leftFlankH.center]},
    centerNine:{differenceGp0:instarBranchGp0,differenceWord:"INSTAR",sumGp0:openPgpBranchGp0,sumWord:"OPENPGP",center:centerNine[(centerNine.length-1)/2],centerWord:sourceWords[centerNine[(centerNine.length-1)/2]]},
    right:{length:rightFlank.length,differenceBranch:rightFlankH.differences,differenceRaw:rightFlankH.differenceRaw,differenceGp0:rightFlankH.differenceGp0,differenceWord:sourceWords[rightFlankH.differenceGp0],sumBranch:rightFlankH.sums,sumRaw:rightFlankH.sumRaw,sumGp0:rightFlankH.sumGp0,sumWord:sourceWords[rightFlankH.sumGp0],center:rightFlankH.center,centerWord:sourceWords[rightFlankH.center]},
    readoutIndices:emergeReadoutIndices,readoutWords:emergeReadoutWords,readout:emergeReadoutWords.join(" "),
    centerIndices,centerWords,centerReadout:centerWords.join(" "),
  },
  control: {
    strictInterior43Windows: chargedWindows,
    exactGeometryHits: geometryHits,
    strictInterior19Windows: spanWindows,
    circumferenceBranchHits: circumferenceOnlyHits,
    parableBranchHits: parableOnlyHits,
    orderedBranchPairHits: branchPairHits,
    exactTypedSpanHits: typedSpanHits,
    centeredESquared9Windows: centerNineWindows,
    instarBranchHits: instarOnlyHits,
    openPgpBranchHits: openPgpOnlyHits,
    centeredBranchPairHits: centerNinePairHits,
    exactTypedCenterNineHits: typedCenterNineHits,
    emergeFlank43Windows: emergeFlankWindows,
    emergeFlankMarginalHits,
    emergeFlankExactHits: emergeFlankHits,
  },
  decision: "P33's RISE road conditionally selects physical p55 by its 75/76 local/physical rune counts. After the source-instructed circumference peel, p55's 43-rune strict interior uniquely realizes D=p at [g,p]=[5,23] with B=19 and center K*g=10. The fixed H map on that B-span yields CIRCUMFERENCES=131 and PARABLE=120; the centered e^2=9 shell yields INSTAR=78 / OPENPGP=75 and H([78,75])=[e,A]. A further source-motivated 17+9+17 split applies H to the two 17-rune flanks and yields ordered branch GP0 indices [12,2,11,1] = THE PATH IS THE; the three preserved block centers are [17,15,2] = THE WORDS PATH. This exact four-index readout occurs once in 4,803 eligible 43-rune windows, at p55 offset0 (marginal counts 167/172/183/162). This is a conditional source-register readout, not ordinary plaintext or a recovered p55 cipher: the upstream p33 selector remains post-selected under Director #1835, and the phrase was recognized after observing the output.",
}, null, 2));
