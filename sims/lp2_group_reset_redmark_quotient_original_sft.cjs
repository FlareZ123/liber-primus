'use strict';

/**
 * Exact original-input gate for a printed-group-reset enumerative receiver.
 *
 * Model:
 *   - Each explicit printed separator starts a new group; page breaks do not
 *     reset unless an explicit separator lies at the page edge.
 *   - The 29-symbol GP alphabet includes F as an ordinary symbol.
 *   - Each group head is free; within-group transitions are ranked as either
 *     a repeat (one choice) or one of 28 nonzero GP deltas.
 *   - The count-first codebook admits at most 63 within-group repeats.
 *   - A mixed-radix sidecar rank from original red-run positions, large-mark
 *     positions, four source-visible apostrophes and mark labels supplies the
 *     quotient. The sidecar is read in physical page order.
 *
 * Read-only SFT:
 *   node sims/lp2_group_reset_redmark_quotient_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sections = read('resources/transcriptions/lp2-image-corrected.txt').split('%');
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const typography = JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const quadText = read('resources/control/duko_round27_english_quadgrams.txt');
const translit = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const breaks = new Set(['-', '.', '&', '$', '§', '⁘', '⁚', '⁜', '⁕']);
const mod = n => ((n % 29) + 29) % 29;

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i += 1) {
    value = value * BigInt(n - k + i) / BigInt(i);
  }
  return value;
}

function rankColex(positions) {
  let rank = 0n;
  for (let i = 0; i < positions.length; i += 1) {
    rank += choose(positions[i], i + 1);
  }
  return rank;
}

function unrankColex(rank, n, k) {
  assert(rank >= 0n && rank < choose(n, k));
  const positions = new Array(k);
  let remainder = rank;
  let upper = n - 1;
  for (let i = k; i >= 1; i -= 1) {
    let low = i - 1;
    let high = upper;
    let best = low;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (choose(mid, i) <= remainder) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    positions[i - 1] = best;
    remainder -= choose(best, i);
    upper = best - 1;
  }
  assert.equal(remainder, 0n);
  return positions;
}

function pow(base, exponent) {
  return BigInt(base) ** BigInt(exponent);
}

function sumRepeatClasses(transitions, maxRepeats) {
  let chooseTerm = 1n;
  let powerTerm = pow(28, transitions);
  let total = 0n;
  for (let k = 0; k <= maxRepeats; k += 1) {
    total += chooseTerm * powerTerm;
    if (k < maxRepeats) {
      chooseTerm = chooseTerm * BigInt(transitions - k) / BigInt(k + 1);
      powerTerm /= 28n;
    }
  }
  return total;
}

function classOffset(transitions, repeats) {
  return repeats <= 0 ? 0n : sumRepeatClasses(transitions, repeats - 1);
}

function log2Big(value) {
  const bits = value.toString(2).length;
  const shift = BigInt(Math.max(0, bits - 53));
  const leading = Number(value >> shift);
  return Math.log2(leading) + Number(shift);
}

function baseRank(values, base) {
  return values.reduce((rank, value) => rank * BigInt(base) + BigInt(value), 0n);
}

function unrankBase(rank, base, length) {
  const values = new Array(length);
  let remainder = rank;
  for (let i = length - 1; i >= 0; i -= 1) {
    values[i] = Number(remainder % BigInt(base));
    remainder /= BigInt(base);
  }
  assert.equal(remainder, 0n);
  return values;
}

function toBase29(values) {
  return baseRank(values, 29);
}

function fromBase29(value, length) {
  return unrankBase(value, 29, length);
}

function splitByBoundaries(values, boundaries) {
  const groups = [];
  let start = 0;
  for (const boundary of boundaries) {
    groups.push(values.slice(start, boundary + 1));
    start = boundary + 1;
  }
  groups.push(values.slice(start));
  assert(groups.every(group => group.length > 0));
  return groups;
}

function rankCodebook(cipher, boundaries, maxRepeats) {
  const groups = splitByBoundaries(cipher, boundaries);
  const heads = [];
  const repeatedPositions = [];
  const nonrepeatDeltas = [];
  let transition = 0;

  for (const group of groups) {
    heads.push(group[0]);
    for (let i = 1; i < group.length; i += 1) {
      const delta = mod(group[i] - group[i - 1]);
      if (delta === 0) repeatedPositions.push(transition);
      else nonrepeatDeltas.push(delta - 1);
      transition += 1;
    }
  }

  const transitions = transition;
  const repeats = repeatedPositions.length;
  assert(repeats <= maxRepeats);
  const allClasses = sumRepeatClasses(transitions, maxRepeats);
  const headsRank = baseRank(heads, 29);
  const repeatMaskRank = rankColex(repeatedPositions);
  const deltaRank = baseRank(nonrepeatDeltas, 28);
  const rank = headsRank * allClasses
    + classOffset(transitions, repeats)
    + repeatMaskRank * pow(28, transitions - repeats)
    + deltaRank;

  return {
    rank,
    groups: groups.length,
    transitions,
    repeats,
    headsRank,
    repeatMaskRank,
    deltaRank
  };
}

function unrankCodebook(rank, length, boundaries, maxRepeats) {
  const groupCount = boundaries.length + 1;
  const transitions = length - groupCount;
  const allClasses = sumRepeatClasses(transitions, maxRepeats);
  assert(rank >= 0n && rank < pow(29, groupCount) * allClasses);

  const headsRank = rank / allClasses;
  let remainder = rank % allClasses;
  const heads = unrankBase(headsRank, 29, groupCount);

  let repeats = -1;
  for (let k = 0; k <= maxRepeats; k += 1) {
    const classSize = choose(transitions, k) * pow(28, transitions - k);
    if (remainder < classSize) {
      repeats = k;
      break;
    }
    remainder -= classSize;
  }
  assert(repeats >= 0);

  const deltaSpace = pow(28, transitions - repeats);
  const repeatMaskRank = remainder / deltaSpace;
  const deltaRank = remainder % deltaSpace;
  const repeatedPositions = unrankColex(repeatMaskRank, transitions, repeats);
  const deltas = unrankBase(deltaRank, 28, transitions - repeats);
  const repeatSet = new Set(repeatedPositions);

  const cipher = new Array(length);
  let groupStart = 0;
  let headIndex = 0;
  let transition = 0;
  let deltaIndex = 0;

  for (const groupEnd of [...boundaries, length - 1]) {
    let previous = heads[headIndex++];
    cipher[groupStart] = previous;
    for (let i = groupStart + 1; i <= groupEnd; i += 1) {
      if (repeatSet.has(transition)) {
        cipher[i] = previous;
      } else {
        cipher[i] = mod(previous + deltas[deltaIndex++] + 1);
      }
      previous = cipher[i];
      transition += 1;
    }
    groupStart = groupEnd + 1;
  }

  assert.equal(transition, transitions);
  assert.equal(deltaIndex, deltas.length);
  assert.equal(rankCodebook(cipher, boundaries, maxRepeats).rank, rank);
  return { cipher, repeats, heads, repeatedPositions };
}

function pageBoundaries(sectionIndex, pageRunes) {
  const chars = [...sections[sectionIndex]];
  const offsets = [];
  for (let i = 0; i < chars.length; i += 1) {
    if (runeIndex.has(chars[i])) offsets.push(i);
  }
  assert.equal(offsets.length, pageRunes.length);
  const boundaries = [];
  for (let i = 1; i < offsets.length; i += 1) {
    if (chars.slice(offsets[i - 1] + 1, offsets[i]).some(ch => breaks.has(ch))) {
      boundaries.push(i - 1);
    }
  }
  return boundaries;
}

function codebookParameters(length, groupCount, maxRepeats) {
  const transitions = length - groupCount;
  const space = pow(29, groupCount) * sumRepeatClasses(transitions, maxRepeats);
  const plaintextSpace = pow(29, length);
  const quotientSpace = (plaintextSpace + space - 1n) / space;
  return {
    transitions,
    space,
    plaintextSpace,
    quotientSpace,
    boundarySpace: choose(length - 1, groupCount - 1)
  };
}

function encodePlant(plaintext, groupCount, maxRepeats) {
  const params = codebookParameters(plaintext.length, groupCount, maxRepeats);
  const plainInteger = toBase29(plaintext);
  const quotient = plainInteger / params.space;
  const remainder = plainInteger % params.space;
  assert(quotient < params.boundarySpace);
  const boundaries = unrankColex(quotient, plaintext.length - 1, groupCount - 1);
  const encoded = unrankCodebook(remainder, plaintext.length, boundaries, maxRepeats);
  return {
    cipher: encoded.cipher,
    boundaries,
    quotient,
    remainder,
    repeats: encoded.repeats,
    params
  };
}

function decodePlant(cipher, boundaries, maxRepeats) {
  const groupCount = boundaries.length + 1;
  const params = codebookParameters(cipher.length, groupCount, maxRepeats);
  const sideRank = rankColex(boundaries);
  const quotient = sideRank % params.quotientSpace;
  const ranked = rankCodebook(cipher, boundaries, maxRepeats);
  const plainInteger = quotient * params.space + ranked.rank;
  assert(plainInteger < params.plaintextSpace);
  return {
    plaintext: fromBase29(plainInteger, cipher.length),
    quotient,
    sideRank,
    cipherRank: ranked.rank,
    repeats: ranked.repeats,
    params
  };
}

function buildOriginalGroups() {
  const runes = [];
  const boundaries = [];
  let previousPage = null;
  let totalAdjacentEquals = 0;
  let equalInsideGroups = 0;
  let equalAcrossBoundaries = 0;
  let crossPageBoundaries = 0;

  for (let pageNumber = 0; pageNumber <= 55; pageNumber += 1) {
    if (pageNumber === 50) continue;
    const sectionIndex = pageNumber < 50 ? pageNumber : pageNumber - 1;
    const chars = [...sections[sectionIndex]];
    const page = corpus.pages.find(x => x.page === pageNumber);
    const offsets = [];
    for (let i = 0; i < chars.length; i += 1) {
      if (runeIndex.has(chars[i])) offsets.push(i);
    }
    assert.equal(offsets.length, page.indices.length,
      'Corrected source alignment p' + pageNumber);

    if (previousPage !== null) {
      const between = previousPage.tail.concat(chars.slice(0, offsets[0]));
      const hasBoundary = between.some(ch => breaks.has(ch));
      if (hasBoundary) {
        boundaries.push(runes.length - 1);
        crossPageBoundaries += 1;
      }
      if (previousPage.lastRune === page.indices[0]) {
        totalAdjacentEquals += 1;
        if (hasBoundary) equalAcrossBoundaries += 1;
        else equalInsideGroups += 1;
      }
    }

    for (let i = 1; i < offsets.length; i += 1) {
      const between = chars.slice(offsets[i - 1] + 1, offsets[i]);
      const hasBoundary = between.some(ch => breaks.has(ch));
      if (hasBoundary) boundaries.push(runes.length + i - 1);
      if (page.indices[i] === page.indices[i - 1]) {
        totalAdjacentEquals += 1;
        if (hasBoundary) equalAcrossBoundaries += 1;
        else equalInsideGroups += 1;
      }
    }

    runes.push(...page.indices);
    previousPage = {
      lastRune: page.indices[page.indices.length - 1],
      tail: chars.slice(offsets[offsets.length - 1] + 1)
    };
  }

  const groups = splitByBoundaries(runes, boundaries);
  const transitions = runes.length - groups.length;
  const repeated = groups.reduce((sum, group) => {
    for (let i = 1; i < group.length; i += 1) {
      if (group[i] === group[i - 1]) sum += 1;
    }
    return sum;
  }, 0);

  assert.equal(runes.length, 12956);
  assert.equal(boundaries.length, 2895);
  assert.equal(groups.length, 2896);
  assert.equal(transitions, 10060);
  assert.equal(repeated, 63);
  assert.equal(totalAdjacentEquals, 86);
  assert.equal(equalInsideGroups, 63);
  assert.equal(equalAcrossBoundaries, 23);
  assert.equal(crossPageBoundaries, 22);

  return {
    runes,
    boundaries,
    groups,
    transitions,
    repeats: repeated,
    totalAdjacentEquals,
    equalAcrossBoundaries,
    crossPageBoundaries
  };
}

function buildSidecarRank() {
  let sideRank = 0n;
  let sideSpace = 1n;
  let redPositionBits = 0;
  let markPositionBits = 0;
  const allMarks = [];

  for (let pageNumber = 0; pageNumber <= 55; pageNumber += 1) {
    if (pageNumber === 50) continue;
    const sectionIndex = pageNumber < 50 ? pageNumber : pageNumber - 1;
    const chars = [...sections[sectionIndex]];
    const page = corpus.pages.find(x => x.page === pageNumber);
    const annotation = ink.pages.find(x => x.page === pageNumber);
    const redRuns = annotation ? [...(annotation.red_spans || [])]
      .sort((a, b) => a.start - b.start) : [];
    const marks = annotation ? [...(annotation.large_punctuation || [])]
      .sort((a, b) => a[0] - b[0]) : [];

    const boundarySet = new Set([0]);
    let offset = 0;
    for (const ch of chars) {
      if (runeIndex.has(ch)) offset += 1;
      else if (breaks.has(ch)) boundarySet.add(offset);
    }
    boundarySet.add(offset);
    assert.equal(offset, page.indices.length);

    const redLength = redRuns.reduce((sum, run) => sum + run.length, 0);
    let cumulativeRedLength = 0;
    const compressedRedStarts = redRuns.map(run => {
      const compressed = run.start - cumulativeRedLength;
      cumulativeRedLength += run.length;
      assert(boundarySet.has(run.start));
      assert(boundarySet.has(run.start + run.length));
      return compressed;
    });
    const redRadix = choose(page.indices.length - redLength + redRuns.length,
      redRuns.length);
    const redRank = rankColex(compressedRedStarts);
    assert(redRank < redRadix);

    const boundaryList = [...boundarySet].sort((a, b) => a - b);
    const markSlots = marks.map(mark => {
      assert(boundarySet.has(mark[0]));
      const slot = boundaryList.indexOf(mark[0]);
      assert(slot >= 0);
      return slot;
    }).sort((a, b) => a - b);
    const compressedMarkSlots = markSlots.map((slot, i) => slot + i);
    const markRadix = choose(boundaryList.length + marks.length - 1,
      marks.length);
    const markRank = rankColex(compressedMarkSlots);
    assert(markRank < markRadix);

    sideRank = sideRank * redRadix + redRank;
    sideSpace *= redRadix;
    sideRank = sideRank * markRadix + markRank;
    sideSpace *= markRadix;
    redPositionBits += log2Big(redRadix);
    markPositionBits += log2Big(markRadix);

    for (const mark of marks) {
      allMarks.push({
        page: pageNumber,
        offset: mark[0],
        dots: mark[1],
        color: mark[2]
      });
    }
  }

  const apostrophes = [...typography.source_visible_apostrophes]
    .sort((a, b) => a.page - b.page);
  assert.equal(apostrophes.length, 4);
  const apostrophePages = [4, 21, 35, 41];
  let apostropheRank = 0n;
  let apostropheSpace = 1n;
  for (const pageNumber of apostrophePages) {
    const page = corpus.pages.find(x => x.page === pageNumber);
    const apostrophe = apostrophes.find(x => x.page === pageNumber);
    assert(apostrophe);
    assert(apostrophe.local_before_rune >= 0
      && apostrophe.local_before_rune <= page.indices.length);
    apostropheRank = apostropheRank * BigInt(page.indices.length + 1)
      + BigInt(apostrophe.local_before_rune);
    apostropheSpace *= BigInt(page.indices.length + 1);
  }
  sideRank = sideRank * apostropheSpace + apostropheRank;
  sideSpace *= apostropheSpace;

  assert.equal(allMarks.length, 31);
  const tenDotSlots = allMarks.map((mark, i) => mark.dots === 10 ? i : -1)
    .filter(i => i >= 0);
  const blackSlots = allMarks.map((mark, i) => mark.color === 'black' ? i : -1)
    .filter(i => i >= 0);
  assert.equal(tenDotSlots.length, 3);
  assert.equal(blackSlots.length, 1);
  const labelRadix = choose(31, 3) * 31n;
  const labelRank = rankColex(tenDotSlots) * 31n + BigInt(blackSlots[0]);
  assert(labelRank < labelRadix);
  sideRank = sideRank * labelRadix + labelRank;
  sideSpace *= labelRadix;

  assert(sideRank < sideSpace);
  return {
    rank: sideRank,
    space: sideSpace,
    redPositionBits,
    markPositionBits,
    apostropheBits: log2Big(apostropheSpace),
    labelBits: log2Big(labelRadix),
    marks: allMarks.length,
    tenDotMarks: tenDotSlots.length,
    blackMarks: blackSlots.length,
    apostrophes: apostrophes.length
  };
}

function scoreQuadgrams(text, counts, totalCount) {
  const letters = text.replace(/[^A-Z]/g, '');
  const denominator = totalCount + 0.01 * 26 ** 4;
  let score = 0;
  let missing = 0;
  for (let i = 0; i + 4 <= letters.length; i += 1) {
    const count = counts.get(letters.slice(i, i + 4)) || 0;
    if (count === 0) missing += 1;
    score += Math.log((count + 0.01) / denominator);
  }
  const quadgrams = Math.max(0, letters.length - 3);
  return {
    letters: letters.length,
    quadgrams,
    avgNats: score / Math.max(1, quadgrams),
    missing,
    missingFraction: missing / Math.max(1, quadgrams)
  };
}

function loadQuadgrams() {
  const counts = new Map();
  let total = 0;
  for (const line of quadText.trim().split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 2) continue;
    const count = Number(parts[1]);
    if (!Number.isFinite(count)) continue;
    counts.set(parts[0], count);
    total += count;
  }
  assert.equal(counts.size, 79495);
  return { counts, total };
}

// Authentic p56 standard prime-minus-one control; F at offset 56 is literal
// under that already-solved cipher. In this new codebook F is ordinary GP29.
const p56Cipher = corpus.pages.find(x => x.page === 56).indices;
const primes = [];
const sieve = new Uint8Array(50000);
for (let n = 2; primes.length < 3100; n += 1) {
  if (sieve[n]) continue;
  primes.push(n);
  if (n * n < sieve.length) {
    for (let k = n * n; k < sieve.length; k += n) sieve[k] = 1;
  }
}
const primeKey = primes.map(p => (p - 1) % 29);
let p56Used = 0;
const p56Plain = p56Cipher.map((c, i) => {
  if (i === 56) return 0;
  return mod(c - primeKey[p56Used++]);
});
assert.equal(p56Plain.length, 85);
assert.equal(p56Used, 84);
assert.deepEqual(
  p56Plain.map(v => translit[v]).join(' '),
  'A N E N D W I TH I N TH E D E E P W E B TH E R E E X I S T S A P A G E TH A T H A S H E S T O I T I S TH E D U T Y O F E U E R Y P I L G R I M T O S E E C O U T TH I S P A G E'
);
const p57Plain = corpus.pages.find(x => x.page === 57).indices;
assert(p57Plain.length > 80);

function runNativePlant(name, plaintext, sectionIndex, maxRepeats) {
  const originalBoundaries = pageBoundaries(sectionIndex, plaintext);
  const groupCount = originalBoundaries.length + 1;
  const encoded = encodePlant(plaintext, groupCount, maxRepeats);
  const decoded = decodePlant(encoded.cipher, encoded.boundaries, maxRepeats);
  assert.deepEqual(decoded.plaintext, plaintext);
  const replay = encodePlant(decoded.plaintext, groupCount, maxRepeats);
  assert.deepEqual(replay.cipher, encoded.cipher);
  assert.deepEqual(replay.boundaries, encoded.boundaries);
  assert.equal(replay.quotient, encoded.quotient);
  assert.equal(replay.remainder, encoded.remainder);
  return {
    name,
    plaintextRunes: plaintext.length,
    sourceDerivedGroupCount: groupCount,
    maxRepeats,
    plantedCipherRepeats: encoded.repeats,
    quotientBits: log2Big(encoded.params.quotientSpace),
    boundarySpaceBits: log2Big(encoded.params.boundarySpace),
    movedBoundaryCount: encoded.boundaries.length,
    exactInverseAndForwardReplay: true,
    literalFOrdinarySymbol: plaintext.includes(0)
  };
}

const original = buildOriginalGroups();
const sidecar = buildSidecarRank();
const W = original.groups.length;
const N = original.runes.length;
const T = original.transitions;
const K = original.repeats;
const allClasses = sumRepeatClasses(T, K);
const M = pow(29, W) * allClasses;
const U = pow(29, N);
const Q = (U + M - 1n) / M;
const q = sidecar.rank % Q;
const salt = sidecar.rank / Q;
const ranked = rankCodebook(original.runes, original.boundaries, K);
const plaintextInteger = q * M + ranked.rank;
assert(plaintextInteger < U);
const candidate = fromBase29(plaintextInteger, N);

// Exact forward replay of the original rune stream from the candidate and
// the observed source boundary schedule.
const replay = unrankCodebook(ranked.rank, N, original.boundaries, K);
assert.deepEqual(replay.cipher, original.runes);
assert.equal(rankCodebook(replay.cipher, original.boundaries, K).rank,
  ranked.rank);
assert.equal(q * M + ranked.rank, plaintextInteger);

const quadgrams = loadQuadgrams();
const candidateText = candidate.map(v => translit[v]).join('');
const p56Text = p56Plain.map(v => translit[v]).join('');
const p57Text = p57Plain.map(v => translit[v]).join('');
const cipherText = original.runes.map(v => translit[v]).join('');
const candidateScore = scoreQuadgrams(candidateText, quadgrams.counts, quadgrams.total);
const p56Score = scoreQuadgrams(p56Text, quadgrams.counts, quadgrams.total);
const p57Score = scoreQuadgrams(p57Text, quadgrams.counts, quadgrams.total);
const cipherScore = scoreQuadgrams(cipherText, quadgrams.counts, quadgrams.total);

const p56Plant = runNativePlant('authentic p56 plaintext', p56Plain, 55, 1);
const p57Plant = runNativePlant('clear p57 plaintext', p57Plain, 56, 2);
assert(candidateScore.avgNats < p56Score.avgNats - 5);
assert(candidateScore.avgNats < p57Score.avgNats - 5);
assert(candidateScore.avgNats < cipherScore.avgNats);
assert(candidateScore.missingFraction > 0.5);

const result = {
  model: 'printed-group reset; F ordinary GP29 symbol; at most 63 within-group repeats; count-first enumerative rank; red-run/large-mark/apostrophe mixed-radix quotient',
  source: {
    originalRunes: N,
    explicitDelimiterGaps: original.boundaries.length,
    completePrintedGroups: W,
    withinGroupTransitions: T,
    withinGroupRepeats: K,
    acrossDelimiterRepeats: original.equalAcrossBoundaries,
    totalAdjacentEquals: original.totalAdjacentEquals,
    crossPageDelimiterGaps: original.crossPageBoundaries
  },
  sidecar: {
    redPositionCapacityBits: sidecar.redPositionBits,
    markPositionCapacityBits: sidecar.markPositionBits,
    apostropheCapacityBits: sidecar.apostropheBits,
    markLabelCapacityBits: sidecar.labelBits,
    totalCapacityBits: log2Big(sidecar.space),
    observedRankBits: log2Big(sidecar.rank),
    quotientBits: log2Big(Q),
    unusedPublicSaltBits: log2Big(salt),
    markCount: sidecar.marks,
    tenDotMarks: sidecar.tenDotMarks,
    blackMarks: sidecar.blackMarks,
    apostrophes: sidecar.apostrophes
  },
  codebook: {
    plaintextBits: log2Big(U),
    codebookBits: log2Big(M),
    capacityDeficitBits: log2Big(U) - log2Big(M),
    ciphertextRankBits: log2Big(ranked.rank),
    originalRepeatMaskCount: ranked.repeats,
    exactOriginalForwardReplay: true
  },
  languageDiagnostic: {
    candidate: candidateScore,
    p56KnownPlaintext: p56Score,
    p57ClearText: p57Score,
    originalCiphertextTransliteration: cipherScore
  },
  sourceNativePositiveControls: [p56Plant, p57Plant],
  candidatePreview: candidateText.slice(0, 500),
  decision: 'Reject this exact group-reset count-first rank and red/mark/apostrophe quotient mapping; candidate is non-English under the frozen quadgram diagnostic.'
};

console.log(JSON.stringify(result, null, 2));
