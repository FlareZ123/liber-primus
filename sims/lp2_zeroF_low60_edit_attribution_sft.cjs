'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = pages.flatMap((page) => page.indices);
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.bytes;
const pageAt = new Uint8Array(original.length);

let pageOffset = 0;
for (const page of pages) {
  pageAt.fill(page.page, pageOffset, pageOffset + page.indices.length);
  pageOffset += page.indices.length;
}

const special = [
  corpus.translit.indexOf('F'),
  ...corpus.translit
    .map((value, index) => value.length === 2 ? index : -1)
    .filter((index) => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);
assert.equal(original.length, 12956);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);

/** @param {number} value @param {number} left @param {number} right */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/** @param {number} control */
function marker(control) {
  return tokens[control][0] === '0' ? 0 : special[bytes[control] & 7];
}

const decoded = original.slice();
for (let i = 1; i < original.length; i++) {
  decoded[i] = swap(
    original[i],
    original[i - 1],
    marker((i - 1) & 255)
  );
}

const participates = new Uint8Array(original.length);
let originalRepeats = 0;
for (let i = 1; i < original.length; i++) {
  if (pageAt[i] === pageAt[i - 1] && original[i] === original[i - 1]) {
    originalRepeats++;
    participates[i] = 1;
    participates[i - 1] = 1;
  }
}
assert.equal(originalRepeats, 86);

function emptyClass() {
  return {
    controlledPositions: 0,
    edits: 0,
    originalRepeatOwners: 0,
    editedOriginalRepeatOwners: 0,
    originalRepeatParticipatingPositions: 0,
    editedOriginalRepeatParticipants: 0,
    eligibleAdjacentOpportunities: 0,
    decodedAdjacentRepeats: 0
  };
}

const classes = {
  low60: emptyClass(),
  nonLow60: emptyClass()
};

for (let i = 1; i < original.length; i++) {
  const low = tokens[(i - 1) & 255][0] === '0';
  const target = low ? classes.low60 : classes.nonLow60;
  const edited = decoded[i] !== original[i];
  const originalRepeat =
    pageAt[i] === pageAt[i - 1] && original[i] === original[i - 1];
  const decodedRepeat =
    pageAt[i] === pageAt[i - 1] && decoded[i] === decoded[i - 1];

  target.controlledPositions++;
  target.edits += Number(edited);
  target.originalRepeatOwners += Number(originalRepeat);
  target.editedOriginalRepeatOwners += Number(originalRepeat && edited);
  target.originalRepeatParticipatingPositions += Number(participates[i]);
  target.editedOriginalRepeatParticipants += Number(participates[i] && edited);

  if (pageAt[i] === pageAt[i - 1]) {
    target.eligibleAdjacentOpportunities++;
    target.decodedAdjacentRepeats += Number(decodedRepeat);
  }
}

const totalEdits = classes.low60.edits + classes.nonLow60.edits;
const decodedRepeats =
  classes.low60.decodedAdjacentRepeats + classes.nonLow60.decodedAdjacentRepeats;
const netIncrease = decodedRepeats - originalRepeats;
const lowNet =
  classes.low60.decodedAdjacentRepeats - classes.low60.originalRepeatOwners;
const highNet =
  classes.nonLow60.decodedAdjacentRepeats -
  classes.nonLow60.originalRepeatOwners;

assert.deepEqual(classes.low60, {
  controlledPositions: 3036,
  edits: 144,
  originalRepeatOwners: 33,
  editedOriginalRepeatOwners: 32,
  originalRepeatParticipatingPositions: 54,
  editedOriginalRepeatParticipants: 32,
  eligibleAdjacentOpportunities: 3025,
  decodedAdjacentRepeats: 114
});
assert.deepEqual(classes.nonLow60, {
  controlledPositions: 9919,
  edits: 405,
  originalRepeatOwners: 53,
  editedOriginalRepeatOwners: 49,
  originalRepeatParticipatingPositions: 118,
  editedOriginalRepeatParticipants: 51,
  eligibleAdjacentOpportunities: 9876,
  decodedAdjacentRepeats: 364
});
assert.equal(totalEdits, 549);
assert.equal(decodedRepeats, 478);
assert.equal(netIncrease, 392);
assert.equal(lowNet, 81);
assert.equal(highNet, 311);
assert.equal(decoded[0], original[0]);

const result = {
  classification: 'exact attribution of frozen zeroF transform; no rule changes',
  classes,
  totals: {
    runes: original.length,
    controlledPositions: original.length - 1,
    edits: totalEdits,
    originalAdjacentRepeats: originalRepeats,
    decodedAdjacentRepeats: decodedRepeats,
    netAdjacentIncrease: netIncrease
  },
  attribution: {
    low60ControlledPositionShare:
      classes.low60.controlledPositions / (original.length - 1),
    low60EditShare: classes.low60.edits / totalEdits,
    nonLow60EditShare: classes.nonLow60.edits / totalEdits,
    lowVsNonLowEditRateRatio:
      (classes.low60.edits / classes.low60.controlledPositions) /
      (classes.nonLow60.edits / classes.nonLow60.controlledPositions),
    low60OriginalRepeatShare:
      classes.low60.originalRepeatOwners / originalRepeats,
    low60NetAdjacentIncrease: lowNet,
    nonLow60NetAdjacentIncrease: highNet,
    nonLow60NetAdjacentIncreaseShare: highNet / netIncrease
  }
};

console.log(JSON.stringify(result, null, 2));
