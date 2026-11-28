'use strict';

/**
 * Agent11, 28 Nov 2026 — Director #3386.
 *
 * Adversarial whole-corridor structural null for the p30..p42 p6 grammar.
 * This script deliberately excludes every fitted local key and every
 * ciphertext-to-known-target equality. It uses only:
 *   - authenticated signed-source GP lengths/GP0/source endpoints;
 *   - the already published p6 source selector families;
 *   - target-blind receiver predicates already frozen in repository reports;
 *   - original LP2 printed groups and receiver-side marker/address structure.
 *
 * The null scans every contiguous 13-word source window (31) against every
 * physical 13-page interval p0..p55 (44 starts, including intervals crossing
 * rune-free p50), for 1,364 matched source/page configurations.
 *
 * It reports both the exact frozen receiver grammar and a conservative charge
 * that allows all 24 coordinate permutations of each q-block residue vector.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} x @returns {number[]} */
function h2(x) {
  assert.equal(x.length, 2);
  return [mod29(x[0] - x[1]), mod29(x[0] + x[1])];
}

/** @param {number[]} x @returns {number[]} */
function h3(x) {
  assert.equal(x.length, 3);
  return [mod29(x[0] - x[2]), x[1], mod29(x[0] + x[2])];
}

/** @param {number[]} x @returns {number[]} */
function h4(x) {
  assert.equal(x.length, 4);
  return [
    mod29(x[0] - x[3]),
    mod29(x[1] - x[2]),
    mod29(x[1] + x[2]),
    mod29(x[0] + x[3]),
  ];
}

/** @param {number[]} shell @returns {number[]} */
function h4Inverse(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

/**
 * Outside-pair H serialization used by the p42 [K,1,F] selector.
 * @param {number[]} x
 * @returns {number[]}
 */
function hPair3(x) {
  assert.equal(x.length, 3);
  return [mod29(x[0] - x[2]), mod29(x[0] + x[2]), x[1]];
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const out = new Map();
  function visit(prefix, rest) {
    if (!rest.length) {
      out.set(prefix.join(','), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(
        prefix.concat(rest[index]),
        rest.slice(0, index).concat(rest.slice(index + 1)),
      );
    }
  }
  visit([], values);
  return [...out.values()];
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, 'unmapped GP spelling: ' + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .slice(signed.indexOf('Hello.'));

const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => {
    const values = gp(word);
    const gp0 = values.reduce((sum, value) => sum + value, 0);
    return {
      index,
      word: word.toUpperCase(),
      values,
      length: values.length,
      gp0mod29: mod29(gp0),
    };
  });

assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(30).map((row) => row.word), [
  'SEEK', 'AND', 'YOU', 'WILL', 'BE', 'FOUND', 'GOOD',
  'LUCK', 'BEWARE', 'FALSE', 'PATHS', 'VERIFY', 'OPENPGP',
]);

// Parse canonical complete page-local printed groups.
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const allWords = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

/** Flush one printed group. */
function flush() {
  if (!current.length) return;
  allWords.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = allWords.filter((word) => word.page === word.endPage);

/** @param {number} page @returns {{page:number,endPage:number,start:number,values:number[]}[]} */
function localWords(page) {
  return canonical.filter((word) => word.page === page);
}

/** @param {number} page @param {{page:number,start:number,values:number[]}} word @returns {number} */
function ordinal(page, word) {
  return localWords(page).indexOf(word) + 1;
}

/**
 * @param {number} page
 * @param {number} length
 * @param {number} residue
 * @returns {{page:number,start:number,values:number[]}[]}
 */
function completeHits(page, length, residue) {
  return localWords(page).filter((word) =>
    word.values.length === length && mod29(word.start) === residue
  );
}

/**
 * Exact p35 receiver class: adjacent canonical 2-rune + 3-rune packet.
 * @param {number} page
 * @param {number} residue
 * @returns {{first:object,second:object}[]}
 */
function adjacent23Hits(page, residue) {
  const words = localWords(page);
  const hits = [];
  for (let index = 0; index + 1 < words.length; index += 1) {
    if (
      words[index].values.length === 2 &&
      words[index + 1].values.length === 3 &&
      mod29(words[index].start) === residue
    ) {
      hits.push({ first: words[index], second: words[index + 1] });
    }
  }
  return hits;
}

const state = Object.freeze({ q: 4, K: 2, e: 3, F: 0 });
const q1Residues = [1, 16, 4, 25];
const q3Residues = [1, 28, 16, 13];

// Rebuild the two already-published source-selector family charges.
const W1 = [24, 16, 14, 17];
const titleLengths = [4, 1, 4, 2];
const titleH = h4(titleLengths);
const layoutFamily = permutations(titleLengths);

const lengthRoleFamily = new Set();
for (let left = 0; left < 4; left += 1) {
  for (const leftSign of [1, -1]) {
    for (let right = 0; right < 4; right += 1) {
      if (right === left) continue;
      for (const rightSign of [1, -1]) {
        lengthRoleFamily.add([
          mod29(leftSign * W1[left]),
          state.q,
          19,
          mod29(rightSign * W1[right]),
        ].join(','));
      }
    }
  }
}
assert.equal(lengthRoleFamily.size, 48);

const gp0RoleFamily = new Set();
for (let repeated = 0; repeated < 4; repeated += 1) {
  for (const repeatedSign of [1, -1]) {
    const x = mod29(repeatedSign * W1[repeated]);
    for (let middle = 0; middle < 4; middle += 1) {
      if (middle === repeated) continue;
      for (const middleSign of [1, -1]) {
        const y = mod29(middleSign * W1[middle]);
        for (let tail = 0; tail < 4; tail += 1) {
          for (const tailSign of [1, -1]) {
            gp0RoleFamily.add([
              x,
              y,
              x,
              mod29(tailSign * titleH[tail]),
            ].join(','));
          }
        }
      }
    }
  }
}

assert.equal(gp0RoleFamily.size, 384);

// Full post-discovery joint-address families from the two published q-block
// receiver reports. These are charged as whole families, not just by
// permuting the successful residue vectors.
//
// Block1: 1,488 typed-artifact residue shells x 4 mirrored adjacent-title
// quotient vectors = 5,952 complete base29 address grammars.
const W4 = [14, 12];
const sharedLineWidths = [20, 24];
const titleGp0 = [13, 19, 7, 26];
const q1ResidueFamily = new Map();
for (const a of titleH) {
  for (const b of W4) {
    for (const c of sharedLineWidths) {
      for (const d of titleGp0) {
        for (const shell of permutations([a, b, c, d])) {
          const residues = h4Inverse(shell);
          q1ResidueFamily.set(residues.join(','), residues);
        }
      }
    }
  }
}
assert.equal(q1ResidueFamily.size, 1488);

const q1QuotientFamily = [
  [4, 1, 0, 0],
  [1, 4, 0, 0],
  [4, 2, 0, 0],
  [2, 4, 0, 0],
];
const q1AddressFamily = [];
for (const residues of q1ResidueFamily.values()) {
  for (const quotients of q1QuotientFamily) {
    q1AddressFamily.push(
      residues.map((residue, lane) => 29 * quotients[lane] + residue)
    );
  }
}
assert.equal(q1AddressFamily.length, 5952);

// Block3: 48 W1/W3-segment/W4 residue constructions x 16 one-coordinate
// title/H(title) quotient splices = 768 complete base29 address grammars.
const W3 = [6, 27, 15, 17];
const orientations = (values) => [values.slice(), values.slice().reverse()];
const q3ResidueFamily = [];
for (const qWord of [W1, W3]) {
  for (let segmentStart = 0; segmentStart <= qWord.length - state.K; segmentStart += 1) {
    const segment = qWord.slice(segmentStart, segmentStart + state.K);
    for (const A of orientations(segment)) {
      for (const B of orientations(W4)) {
        for (const first of ['A', 'B']) {
          const shell = first === 'A'
            ? [A[0], B[0], A[1], B[1]]
            : [B[0], A[0], B[1], A[1]];
          q3ResidueFamily.push(h4Inverse(shell));
        }
      }
    }
  }
}
assert.equal(q3ResidueFamily.length, 48);

const q3QuotientFamily = [];
for (let replaceIndex = 0; replaceIndex < titleLengths.length; replaceIndex += 1) {
  for (let hIndex = 0; hIndex < titleH.length; hIndex += 1) {
    const quotients = titleLengths.slice();
    quotients[replaceIndex] = titleH[hIndex];
    q3QuotientFamily.push(quotients);
  }
}
assert.equal(new Set(q3QuotientFamily.map((q) => q.join(','))).size, 16);

const q3AddressFamily = [];
for (const residues of q3ResidueFamily) {
  for (const quotients of q3QuotientFamily) {
    q3AddressFamily.push(
      residues.map((residue, lane) => 29 * quotients[lane] + residue)
    );
  }
}
assert.equal(q3AddressFamily.length, 768);

/**
 * Build one lane index start -> grammar ids.
 * @param {number[][]} addressFamily
 * @returns {Map<number, number[]>[]}
 */
function addressLaneIndex(addressFamily) {
  return Array.from({ length: 4 }, (_, lane) => {
    const index = new Map();
    for (let grammar = 0; grammar < addressFamily.length; grammar += 1) {
      const start = addressFamily[grammar][lane];
      if (!index.has(start)) index.set(start, []);
      index.get(start).push(grammar);
    }
    return index;
  });
}

const q1AddressIndex = addressLaneIndex(q1AddressFamily);
const q3AddressIndex = addressLaneIndex(q3AddressFamily);

/**
 * @param {Map<number, number[]>} index
 * @param {number[]} starts
 * @returns {Set<number>}
 */
function grammarIdsForStarts(index, starts) {
  const ids = new Set();
  for (const start of starts) {
    const matched = index.get(start);
    if (matched) for (const id of matched) ids.add(id);
  }
  return ids;
}

/** @param {Set<number>[]} sets @returns {number} */
function intersectionCount(sets) {
  const ordered = sets.slice().sort((left, right) => left.size - right.size);
  if (!ordered.length || ordered[0].size === 0) return 0;
  let count = 0;
  for (const id of ordered[0]) {
    if (ordered.slice(1).every((set) => set.has(id))) count += 1;
  }
  return count;
}

/**
 * Count full four-lane address grammars in the entire charged q-block family.
 * @param {object[]} source
 * @param {number} pageStart
 * @param {1|3} block
 * @returns {number}
 */
function fullAddressFamilyCount(source, pageStart, block) {
  const isQ1 = block === 1;
  const lengths = isQ1
    ? source.slice(2, 6).map((row) => row.length)
    : source.slice(7, 11).map((row) => row.length);
  const laneIndex = isQ1 ? q1AddressIndex : q3AddressIndex;
  const pageOffset = isQ1 ? 2 : 7;
  const sets = [];

  for (let lane = 0; lane < 4; lane += 1) {
    const page = pageStart + pageOffset + lane;
    let starts;
    if (isQ1 && lane === 3) {
      starts = lengths[lane] === 5
        ? adjacent23Hits(page, 0).map(() => null)
        : [];
      // adjacent23Hits is residue-oriented, so recover the raw starts directly.
      if (lengths[lane] === 5) {
        const words = localWords(page);
        starts = [];
        for (let index = 0; index + 1 < words.length; index += 1) {
          if (
            words[index].values.length === 2 &&
            words[index + 1].values.length === 3
          ) {
            starts.push(words[index].start);
          }
        }
      }
    } else {
      starts = localWords(page)
        .filter((word) => word.values.length === lengths[lane])
        .map((word) => word.start);
    }
    sets.push(grammarIdsForStarts(laneIndex[lane], starts));
  }

  return intersectionCount(sets);
}

/**
 * Count source-selector hits for one fixed 11-word core under all 12 p6
 * layout permutations. The role family itself is already charged internally.
 * @param {number} coreStart
 * @param {'length'|'gp0'} metric
 * @returns {number}
 */
function sourceSelectorHits(coreStart, metric) {
  let hits = 0;
  for (const layout of layoutFamily) {
    const cuts = [0];
    for (const width of layout) cuts.push(cuts.at(-1) + width);
    const sums = [];
    for (let block = 0; block < 4; block += 1) {
      let total = 0;
      for (
        let index = coreStart + cuts[block];
        index < coreStart + cuts[block + 1];
        index += 1
      ) {
        total += metric === 'length'
          ? sourceWords[index].length
          : sourceWords[index].gp0mod29;
      }
      sums.push(mod29(total));
    }
    if (metric === 'length') {
      if (lengthRoleFamily.has(sums.join(','))) hits += 1;
    } else if (gp0RoleFamily.has(h4(sums).join(','))) {
      hits += 1;
    }
  }
  return hits;
}

/**
 * Score one q1 residue ordering.
 * @param {object[]} source
 * @param {number} pageStart
 * @param {number[]} residues
 * @returns {{support:number,unique:number}}
 */
function q1Score(source, pageStart, residues) {
  const lengths = source.slice(2, 6).map((row) => row.length);
  const hits = [
    completeHits(pageStart + 2, lengths[0], residues[0]),
    completeHits(pageStart + 3, lengths[1], residues[1]),
    completeHits(pageStart + 4, lengths[2], residues[2]),
    lengths[3] === 5
      ? adjacent23Hits(pageStart + 5, residues[3])
      : [],
  ];
  return {
    support: hits.filter((rows) => rows.length > 0).length,
    unique: hits.filter((rows) => rows.length === 1).length,
  };
}

/**
 * Score one q3 residue ordering.
 * @param {object[]} source
 * @param {number} pageStart
 * @param {number[]} residues
 * @returns {{support:number,unique:number,address71:number}}
 */
function q3Score(source, pageStart, residues) {
  const lengths = source.slice(7, 11).map((row) => row.length);
  const hits = lengths.map((length, lane) =>
    completeHits(pageStart + 7 + lane, length, residues[lane])
  );
  const address71 = localWords(pageStart + 10).some((word) =>
    word.start === 71 &&
    word.values.length === lengths[3] &&
    mod29(word.start) === residues[3]
  );
  return {
    support: hits.filter((rows) => rows.length > 0).length,
    unique: hits.filter((rows) => rows.length === 1).length,
    address71: Number(address71),
  };
}

/**
 * Score all non-q-block receiver predicates.
 * @param {object[]} source
 * @param {number} sourceStart
 * @param {number} pageStart
 * @returns {object}
 */
function nonQScore(source, sourceStart, pageStart) {
  let p30 = 0;
  let p31 = 0;

  // Source-conditioned p30/p31 target-blind receiver shells. Their exact
  // fitted subtraction keys are intentionally absent.
  if (source[0].length === 4 && source[1].length === 3) {
    const circumference = h2([
      source[0].values[0],
      source[0].values.at(-1),
    ]);
    const p30Shell = [
      circumference[0],
      circumference[1],
      source[0].values[0],
      state.e,
    ];
    const p31Shell = [
      mod29(source[0].values[0] - state.q),
      source[1].values.at(-1),
      mod29(source[0].values[0] - state.K),
    ];

    const p30Hits = localWords(pageStart).filter((word) =>
      word.values.length === 4 &&
      h4(word.values).join(',') === p30Shell.join(',') &&
      ordinal(pageStart, word) === source[0].gp0mod29
    );
    const p31Hits = localWords(pageStart + 1).filter((word) =>
      word.values.length === 3 &&
      h3(word.values).join(',') === p31Shell.join(',') &&
      ordinal(pageStart + 1, word) === sourceStart + 2
    );
    p30 = Number(p30Hits.length === 1);
    p31 = Number(p31Hits.length === 1);
  }

  // P6 singleton block: p_i / local word_i, center q, remove q, arity match.
  const singletonPage = pageStart + 6;
  const singletonWord = localWords(singletonPage)[singletonPage - 1];
  const singleton = Number(
    !!singletonWord &&
    singletonWord.values.length % 2 === 1 &&
    singletonWord.values[(singletonWord.values.length - 1) / 2] === state.q &&
    singletonWord.values.length - 1 === source[6].length
  );

  // P6 K-block: p_i / local word_(i+1), consecutive F-center pair.
  const p41Page = pageStart + 11;
  const p42Page = pageStart + 12;
  const p41Word = localWords(p41Page)[p41Page];
  const p42Word = localWords(p42Page)[p42Page];
  const centerF = (word) =>
    !!word &&
    word.values.length % 2 === 1 &&
    word.values[(word.values.length - 1) / 2] === state.F;

  const terminalPair = Number(
    centerF(p41Word) &&
    centerF(p42Word) &&
    p41Word.values.length - 1 === source[11].length
  );

  // Stronger p42 target-blind instruction:
  // ordinal word emits [K,1,F], +K words, rune1=F, delete F, arity match.
  let terminalInstruction = 0;
  if (
    terminalPair &&
    p42Word.values.length === 3 &&
    hPair3(p42Word.values).join(',') === '2,1,0'
  ) {
    const words = localWords(p42Page);
    const destination = words[words.indexOf(p42Word) + state.K];
    terminalInstruction = Number(
      !!destination &&
      destination.values.length > 1 &&
      destination.values[1] === state.F &&
      destination.values.length - 1 === source[12].length
    );
  }

  return { p30, p31, singleton, terminalPair, terminalInstruction };
}

/**
 * Score one source-window/page-interval pair.
 * @param {number} sourceStart
 * @param {number} pageStart
 * @returns {object}
 */
function score(sourceStart, pageStart) {
  const source = sourceWords.slice(sourceStart, sourceStart + 13);

  const initialsH = h2([source[0].values[0], source[1].values[0]]);
  const sourcePrelude = Number(
    source[0].length === 4 &&
    source[1].length === 3 &&
    source[0].gp0mod29 === 27 &&
    source[1].gp0mod29 === 27 &&
    initialsH[0] === 20 &&
    initialsH[1] === 10
  );
  const lengthSelectorHits = sourceSelectorHits(sourceStart + 2, 'length');
  const gp0SelectorHits = sourceSelectorHits(sourceStart + 2, 'gp0');
  const sourceScore =
    sourcePrelude +
    Number(lengthSelectorHits > 0) +
    Number(gp0SelectorHits > 0);

  const fixedQ1 = q1Score(source, pageStart, q1Residues);
  const fixedQ3 = q3Score(source, pageStart, q3Residues);
  const nonQ = nonQScore(source, sourceStart, pageStart);

  const fixedQ =
    fixedQ1.support + fixedQ1.unique +
    fixedQ3.support + fixedQ3.unique + fixedQ3.address71;
  const exception =
    nonQ.singleton + nonQ.terminalPair + nonQ.terminalInstruction;
  const fixedNoPrelude = fixedQ + exception;
  const fixedReceiver = fixedNoPrelude + nonQ.p30 + nonQ.p31;
  const supportOnly =
    fixedQ1.support + fixedQ3.support + fixedQ3.address71 +
    exception + nonQ.p30 + nonQ.p31;

  // Conservative lane-order charge: maximize each q block over all 24
  // permutations of its frozen residue multiset.
  let chargedQ1 = { score: -1 };
  for (const residues of permutations(q1Residues)) {
    const result = q1Score(source, pageStart, residues);
    const laneScore = result.support + result.unique;
    if (laneScore > chargedQ1.score) {
      chargedQ1 = { ...result, residues, score: laneScore };
    }
  }

  let chargedQ3 = { score: -1 };
  for (const residues of permutations(q3Residues)) {
    const result = q3Score(source, pageStart, residues);
    const laneScore = result.support + result.unique + result.address71;
    if (laneScore > chargedQ3.score) {
      chargedQ3 = { ...result, residues, score: laneScore };
    }
  }

  const chargedQ = chargedQ1.score + chargedQ3.score;
  const chargedNoPrelude = chargedQ + exception;
  const chargedReceiver = chargedNoPrelude + nonQ.p30 + nonQ.p31;

  const q1AddressFullCount = fullAddressFamilyCount(source, pageStart, 1);
  const q3AddressFullCount = fullAddressFamilyCount(source, pageStart, 3);
  const addressBlockHits =
    Number(q1AddressFullCount > 0) + Number(q3AddressFullCount > 0);
  const addressFamilyScore =
    addressBlockHits + exception + nonQ.p30 + nonQ.p31;

  return {
    sourceStart,
    pageStart,
    sourcePrelude,
    lengthSelectorHits,
    gp0SelectorHits,
    sourceScore,
    fixedQ1,
    fixedQ3,
    ...nonQ,
    fixedQ,
    exception,
    fixedNoPrelude,
    fixedReceiver,
    supportOnly,
    totalScore: fixedReceiver + sourceScore,
    chargedQ1,
    chargedQ3,
    chargedQ,
    chargedNoPrelude,
    chargedReceiver,
    q1AddressFullCount,
    q3AddressFullCount,
    addressBlockHits,
    addressFamilyScore,
  };
}

const rows = [];
for (let sourceStart = 0; sourceStart <= 30; sourceStart += 1) {
  for (let pageStart = 0; pageStart <= 43; pageStart += 1) {
    rows.push(score(sourceStart, pageStart));
  }
}
assert.equal(rows.length, 31 * 44);

const original = rows.find((row) =>
  row.sourceStart === 30 && row.pageStart === 30
);
assert.ok(original);

/**
 * Rank the original configuration under one score.
 * @param {string} field
 * @returns {{value:number,rank:number,ties:number,nextBest:number,total:number}}
 */
function rank(field) {
  const value = original[field];
  const others = rows.filter((row) => row !== original);
  return {
    value,
    rank: 1 + rows.filter((row) => row[field] > value).length,
    ties: rows.filter((row) => row[field] === value).length,
    nextBest: Math.max(...others.map((row) => row[field])),
    total: rows.length,
  };
}

// Frozen grammar: original is uniquely first even without p30/p31 and even
// when uniqueness bonuses are removed.
assert.deepEqual({
  fixedReceiver: rank('fixedReceiver'),
  fixedNoPrelude: rank('fixedNoPrelude'),
  fixedQ: rank('fixedQ'),
  supportOnly: rank('supportOnly'),
  totalScore: rank('totalScore'),
}, {
  fixedReceiver: { value: 20, rank: 1, ties: 1, nextBest: 13, total: 1364 },
  fixedNoPrelude: { value: 18, rank: 1, ties: 1, nextBest: 13, total: 1364 },
  fixedQ: { value: 15, rank: 1, ties: 1, nextBest: 12, total: 1364 },
  supportOnly: { value: 14, rank: 1, ties: 1, nextBest: 8, total: 1364 },
  totalScore: { value: 23, rank: 1, ties: 1, nextBest: 14, total: 1364 },
});

// Full q-lane permutation charge: the original still ranks uniquely first,
// and its own best permutations are the published printed-order residues.
assert.deepEqual(original.chargedQ1.residues, q1Residues);
assert.deepEqual(original.chargedQ3.residues, q3Residues);
assert.deepEqual({
  chargedReceiver: rank('chargedReceiver'),
  chargedNoPrelude: rank('chargedNoPrelude'),
  chargedQ: rank('chargedQ'),
}, {
  chargedReceiver: { value: 20, rank: 1, ties: 1, nextBest: 14, total: 1364 },
  chargedNoPrelude: { value: 18, rank: 1, ties: 1, nextBest: 14, total: 1364 },
  chargedQ: { value: 15, rank: 1, ties: 1, nextBest: 14, total: 1364 },
});

// Strongest familywise control: charge every complete base29 address grammar
// from the published block1 (5,952) and block3 (768) post-discovery families.
// Only source30/page30 supports both q blocks; block1 has no other complete
// match anywhere in the 1,364-grid.
assert.equal(rows.filter((row) => row.q1AddressFullCount > 0).length, 1);
assert.equal(rows.filter((row) => row.q3AddressFullCount > 0).length, 2);
assert.equal(rows.filter((row) =>
  row.q1AddressFullCount > 0 && row.q3AddressFullCount > 0
).length, 1);
assert.equal(original.q1AddressFullCount, 1);
assert.equal(original.q3AddressFullCount, 1);
assert.deepEqual({
  addressBlockHits: rank('addressBlockHits'),
  addressFamilyScore: rank('addressFamilyScore'),
}, {
  addressBlockHits: { value: 2, rank: 1, ties: 1, nextBest: 1, total: 1364 },
  addressFamilyScore: { value: 7, rank: 1, ties: 1, nextBest: 2, total: 1364 },
});

const topFixed = [...rows]
  .sort((left, right) =>
    right.fixedReceiver - left.fixedReceiver ||
    left.sourceStart - right.sourceStart ||
    left.pageStart - right.pageStart
  )
  .slice(0, 12)
  .map((row) => ({
    sourceStart: row.sourceStart,
    pageStart: row.pageStart,
    fixedReceiver: row.fixedReceiver,
    fixedNoPrelude: row.fixedNoPrelude,
    fixedQ: row.fixedQ,
    sourceScore: row.sourceScore,
    q1: row.fixedQ1,
    q3: row.fixedQ3,
    p30: row.p30,
    p31: row.p31,
    singleton: row.singleton,
    terminalPair: row.terminalPair,
    terminalInstruction: row.terminalInstruction,
  }));

const topCharged = [...rows]
  .sort((left, right) =>
    right.chargedReceiver - left.chargedReceiver ||
    left.sourceStart - right.sourceStart ||
    left.pageStart - right.pageStart
  )
  .slice(0, 12)
  .map((row) => ({
    sourceStart: row.sourceStart,
    pageStart: row.pageStart,
    chargedReceiver: row.chargedReceiver,
    chargedNoPrelude: row.chargedNoPrelude,
    chargedQ: row.chargedQ,
    q1Residues: row.chargedQ1.residues,
    q3Residues: row.chargedQ3.residues,
    sourceScore: row.sourceScore,
    singleton: row.singleton,
    terminalPair: row.terminalPair,
    terminalInstruction: row.terminalInstruction,
  }));

console.log(JSON.stringify({
  status: 'PASS',
  issue: 3386,
  author: 'Agent11',
  exclusion: 'No fitted key, no ciphertext-to-known-target equality, no language score.',
  search: {
    sourceWindows: 31,
    pageIntervals: 44,
    configurations: rows.length,
    sourceStartRange: [0, 30],
    pageStartRange: [0, 43],
  },
  original: {
    sourceStart: original.sourceStart,
    pageStart: original.pageStart,
    sourceScore: original.sourceScore,
    sourcePrelude: original.sourcePrelude,
    lengthSelectorHits: original.lengthSelectorHits,
    gp0SelectorHits: original.gp0SelectorHits,
    fixedReceiver: original.fixedReceiver,
    fixedNoPrelude: original.fixedNoPrelude,
    fixedQ: original.fixedQ,
    supportOnly: original.supportOnly,
    exception: original.exception,
    p30: original.p30,
    p31: original.p31,
    singleton: original.singleton,
    terminalPair: original.terminalPair,
    terminalInstruction: original.terminalInstruction,
    chargedReceiver: original.chargedReceiver,
    chargedNoPrelude: original.chargedNoPrelude,
    chargedQ: original.chargedQ,
    chargedQ1Residues: original.chargedQ1.residues,
    chargedQ3Residues: original.chargedQ3.residues,
    q1AddressFullCount: original.q1AddressFullCount,
    q3AddressFullCount: original.q3AddressFullCount,
    addressBlockHits: original.addressBlockHits,
    addressFamilyScore: original.addressFamilyScore,
  },
  ranks: {
    fixedReceiver: rank('fixedReceiver'),
    fixedNoPrelude: rank('fixedNoPrelude'),
    fixedQ: rank('fixedQ'),
    supportOnly: rank('supportOnly'),
    totalScore: rank('totalScore'),
    chargedReceiver: rank('chargedReceiver'),
    chargedNoPrelude: rank('chargedNoPrelude'),
    chargedQ: rank('chargedQ'),
    addressBlockHits: rank('addressBlockHits'),
    addressFamilyScore: rank('addressFamilyScore'),
  },
  fullAddressFamilyCharge: {
    q1ResidueVectors: q1ResidueFamily.size,
    q1AddressGrammars: q1AddressFamily.length,
    q3ResidueConstructions: q3ResidueFamily.length,
    q3AddressGrammars: q3AddressFamily.length,
    configurationsWithFullQ1: rows.filter((row) => row.q1AddressFullCount > 0).length,
    configurationsWithFullQ3: rows.filter((row) => row.q3AddressFullCount > 0).length,
    configurationsWithBoth: rows.filter((row) =>
      row.q1AddressFullCount > 0 && row.q3AddressFullCount > 0
    ).length,
  },
  topFixed,
  topCharged,
  interpretation:
    'Conditional on the published target-blind p6 structural grammar, the p30..p42/source30..42 object is the unique top structural alignment. It remains unique after deleting p30/p31, removing uniqueness bonuses, allowing all 24 residue-coordinate permutations independently, and charging the complete 5,952-member block1 plus 768-member block3 base29 address families. This is a charged structural rank, not a discovery-wide probability and not plaintext authentication.',
}, null, 2));
