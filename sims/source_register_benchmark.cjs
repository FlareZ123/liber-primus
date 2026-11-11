'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { encode, train } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const round = (x) => Number(x.toFixed(6));
const mod = (x) => ((x % 29) + 29) % 29;

function extractBlock(text, begin, end) {
  const a = text.indexOf(begin);
  const b = text.indexOf(end, a + begin.length);
  if (a < 0 || b < 0) throw new Error('Missing source-text delimiter: ' + begin);
  return text.slice(a + begin.length, b).trim();
}

function pageSection(text, page) {
  const re = new RegExp('^### ' + page + '\\s*$', 'm');
  const match = re.exec(text);
  if (!match) throw new Error('Missing LP1 plaintext page ' + page);
  const rest = text.slice(match.index + match[0].length);
  const next = rest.search(/^### \d+/m);
  return (next < 0 ? rest : rest.slice(0, next))
    .replace(/\[[^\]]*Continuation[^\]]*\]/gi, ' ')
    .trim();
}

function clearSignedMessage(text, label) {
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const begin = s.indexOf('-----BEGIN PGP SIGNED MESSAGE-----');
  const headerEnd = s.indexOf('\n\n', begin);
  const signature = s.indexOf('-----BEGIN PGP SIGNATURE-----', headerEnd);
  if (begin < 0 || headerEnd < 0 || signature < 0) {
    throw new Error('Could not extract clear-signed payload: ' + label);
  }
  return s.slice(headerEnd + 2, signature).replace(/^- /gm, '').trim();
}

function cleanCicadaMessage(text) {
  return text
    .replace(/\b[a-z0-9.-]+\.onion\b/gi, ' ')
    .replace(/\b[0-9a-f]{8}\b/gi, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function split80(text) {
  const words = text.match(/[A-Za-z]+/g) || [];
  const cut = Math.floor(words.length * 0.8);
  return {
    train: words.slice(0, cut).join(' '),
    holdout: words.slice(cut).join(' ')
  };
}

function trainSymbols(xs) {
  const M = 29;
  const unigramCount = new Uint32Array(M);
  const bigramCount = new Uint32Array(M * M);
  const trigramCount = new Uint32Array(M * M * M);
  for (let i = 0; i < xs.length; i++) {
    unigramCount[xs[i]]++;
    if (i > 0) bigramCount[xs[i - 1] * M + xs[i]]++;
    if (i > 1) trigramCount[(xs[i - 2] * M + xs[i - 1]) * M + xs[i]]++;
  }
  const unigram = new Float64Array(M);
  const bigram = new Float64Array(M * M);
  const trigram = new Float64Array(M * M * M);
  for (let c = 0; c < M; c++) {
    unigram[c] = Math.log((unigramCount[c] + 1) / (xs.length + M));
  }
  for (let a = 0; a < M; a++) {
    for (let c = 0; c < M; c++) {
      bigram[a * M + c] = Math.log(
        (bigramCount[a * M + c] + 12 * Math.exp(unigram[c])) /
        (unigramCount[a] + 12)
      );
    }
  }
  for (let a = 0; a < M; a++) {
    for (let b = 0; b < M; b++) {
      for (let c = 0; c < M; c++) {
        const i = (a * M + b) * M + c;
        trigram[i] = Math.log(
          (trigramCount[i] + 9 * Math.exp(bigram[b * M + c])) /
          (bigramCount[a * M + b] + 9)
        );
      }
    }
  }
  return { symbols: xs.length, unigram, bigram, trigram };
}

function score(xs, model) {
  if (xs.length < 3) return null;
  const M = 29;
  let total = model.unigram[xs[0]] + model.bigram[xs[0] * M + xs[1]];
  for (let i = 2; i < xs.length; i++) {
    total += model.trigram[(xs[i - 2] * M + xs[i - 1]) * M + xs[i]];
  }
  return total / xs.length;
}

function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function rankScores(xs, models) {
  return Object.entries(models)
    .map(([name, model]) => ({ model: name, score: round(score(xs, model)) }))
    .sort((a, b) => b.score - a.score);
}

function median(values) {
  const xs = values.slice().sort((a, b) => a - b);
  return xs[Math.floor(xs.length / 2)];
}

function transposeDecrypt(xs, order) {
  const columns = new Array(7);
  let cursor = 0;
  for (const col of order) {
    const n = Math.floor(xs.length / 7) + Number(col < xs.length % 7);
    columns[col] = xs.slice(cursor, cursor + n);
    cursor += n;
  }
  const out = [];
  for (let row = 0; row < Math.ceil(xs.length / 7); row++) {
    for (let col = 0; col < 7; col++) {
      if (row < columns[col].length) out.push(columns[col][row]);
    }
  }
  return out;
}

const lp2 = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');

const blakeTrain = extractBlock(
  read('resources/control/blake_song_of_liberty_train.txt'),
  'BEGIN SOURCE TEXT',
  'END SOURCE TEXT'
);
const blakeChorus = extractBlock(
  read('resources/control/cicada2012_blake_chorus.txt'),
  'BEGIN SOURCE TEXT',
  'END SOURCE TEXT'
);
const koanTrain = pageSection(lp1, 6);
const koanHoldout = pageSection(lp1, 14) + ' ' + pageSection(lp1, 15);

const signed2012 = cleanCicadaMessage(clearSignedMessage(
  read('resources/historical/cicada2012-countdown-message.asc'), '2012 countdown'
));
const signed2014 = cleanCicadaMessage(clearSignedMessage(
  read('resources/historical/cicada2014-stage11-message.asc'), '2014 stage11'
));
const signed2016 = cleanCicadaMessage(clearSignedMessage(
  read('resources/historical/cicada2016-4gq25-outguess.asc'), '2016 signed message'
));
const signed2017 = cleanCicadaMessage(clearSignedMessage(
  read('resources/historical/cicada2017-yEiTHhvF.asc'), '2017 signed warning'
));

const gibran = split80(read('resources/control/gibran_prophet_58585.txt'));
const emerson = split80(read('resources/control/emerson_essays_2944.txt'));
const shakespeare = split80(read('resources/control/shakespeare_first300k.txt'));
const latin = split80(read('resources/control/latin-vulgate-gp-wholewords.txt'));

const sources = {
  blake: {
    train: blakeTrain,
    holdouts: { chorus: blakeChorus },
    role: 'source-backed: 2012 Blake poem named by the MIDI clue; chorus transcription held out'
  },
  cicada: {
    train: signed2012 + ' ' + signed2014,
    holdouts: { signed2016: signed2016, signed2017: signed2017 },
    role: 'source-backed short prose; 2012/2014 clear-signed training, 2016/2017 signed held-outs'
  },
  a_koan: {
    train: koanTrain,
    holdouts: { second_koan: koanHoldout },
    role: 'source-backed solved LP1 dialogue/koan pages 6–9 versus 14–16'
  },
  gibran: {
    train: gibran.train,
    holdouts: { heldout: gibran.holdout },
    role: 'legacy generic English comparator; not established as p57 source'
  },
  emerson: {
    train: emerson.train,
    holdouts: { heldout: emerson.holdout },
    role: 'legacy generic English comparator'
  },
  shakespeare: {
    train: shakespeare.train,
    holdouts: { heldout: shakespeare.holdout },
    role: 'legacy generic English comparator'
  },
  latin: {
    train: latin.train,
    holdouts: { heldout: latin.holdout },
    role: 'wrong-language control only; not a candidate LP2 language'
  }
};

const fullModels = Object.fromEntries(
  Object.entries(sources).map(([name, source]) => [name, train(source.train)])
);

const heldoutTests = [];
for (const [source, definition] of Object.entries(sources)) {
  for (const [label, text] of Object.entries(definition.holdouts)) {
    heldoutTests.push({ id: source + '_' + label, source, text, xs: encode(text) });
  }
}

const fullHeldouts = heldoutTests.map((test) => {
  const ranked = rankScores(test.xs, fullModels);
  const ownRank = ranked.findIndex((x) => x.model === test.source) + 1;
  return {
    id: test.id,
    source: test.source,
    runes: test.xs.length,
    own_rank: ownRank,
    scores: ranked
  };
});

const positivePlants = [];
let plantIndex = 1;
for (const test of heldoutTests) {
  const model = fullModels[test.source];
  const next = xorshift32(0x330100 + plantIndex++);
  const encrypted = test.xs.map((v) => mod(v + (next() % 29)));
  const plainScore = score(test.xs, model);
  const cipherScore = score(encrypted, model);
  positivePlants.push({
    id: test.id,
    runes: test.xs.length,
    plain_score: round(plainScore),
    seeded_additive_cipher_score: round(cipherScore),
    margin: round(plainScore - cipherScore)
  });
}

const p56Text = pageSection(lp1, 56).replace(/[0-9a-f]{32,}/gi, ' ');
const p57Text = pageSection(lp1, 57);
const knownPlaintext = {
  p56: encode(p56Text),
  p57: encode(p57Text)
};
const knownPlaintextFull = Object.fromEntries(
  Object.entries(knownPlaintext).map(([name, xs]) => [
    name,
    Object.fromEntries(Object.entries(fullModels).map(([model, m]) => [model, round(score(xs, m))]))
  ])
);

const MATCHED_SIZE = 1400;
const matchedModels = {};
for (const [name, definition] of Object.entries(sources)) {
  if (name === 'cicada') continue;
  const xs = encode(definition.train).slice(0, MATCHED_SIZE);
  if (xs.length !== MATCHED_SIZE) throw new Error('Insufficient matched-size training data: ' + name);
  matchedModels[name] = trainSymbols(xs);
}
const matchedHeldouts = heldoutTests.map((test) => ({
  id: test.id,
  source: test.source,
  runes: test.xs.length,
  own_rank: matchedModels[test.source]
    ? rankScores(test.xs, matchedModels).findIndex((x) => x.model === test.source) + 1
    : null,
  scores: rankScores(test.xs, matchedModels)
}));
const knownPlaintextMatched = Object.fromEntries(
  Object.entries(knownPlaintext).map(([name, xs]) => [
    name,
    Object.fromEntries(Object.entries(matchedModels).map(([model, m]) => [model, round(score(xs, m))]))
  ])
);

const unknownPages = lp2.pages.filter((page) => page.page <= 55 && page.indices.length >= 3);
const unknownRunes = unknownPages.reduce((sum, page) => sum + page.indices.length, 0);
function summarizeUnknown(models) {
  return Object.fromEntries(Object.entries(models).map(([name, model]) => {
    const pageScores = unknownPages.map((page) => ({
      page: page.page,
      runes: page.indices.length,
      score: score(page.indices, model)
    }));
    const values = pageScores.map((x) => x.score);
    const weighted = pageScores.reduce((sum, x) => sum + x.score * x.runes, 0) / unknownRunes;
    return [name, {
      page_count: pageScores.length,
      rune_count: unknownRunes,
      mean_page_score: round(values.reduce((a, b) => a + b, 0) / values.length),
      weighted_mean_score: round(weighted),
      median_page_score: round(median(values)),
      best_page: pageScores.slice().sort((a, b) => b.score - a.score)[0]
    }];
  }));
}
const unknownFull = summarizeUnknown(fullModels);
const unknownMatched = summarizeUnknown(matchedModels);

const p33to39 = lp2.pages
  .filter((page) => page.page >= 33 && page.page <= 39)
  .map((page) => page.indices);
const p33to39Flat = p33to39.flat();
const historicalOrder = [0, 6, 2, 5, 1, 4, 3];
const rankOrder = historicalOrder.map((_, i) => historicalOrder.indexOf(i));
const negativeOutputs = {
  whole_historical_order: transposeDecrypt(p33to39Flat, historicalOrder),
  whole_rank_order: transposeDecrypt(p33to39Flat, rankOrder),
  per_page_rank_order: p33to39.flatMap((page) => transposeDecrypt(page, rankOrder))
};
const negativeFull = Object.fromEntries(
  Object.entries(negativeOutputs).map(([name, xs]) => [
    name,
    Object.fromEntries(Object.entries(fullModels).map(([model, m]) => [model, round(score(xs, m))]))
  ])
);
const negativeMatched = Object.fromEntries(
  Object.entries(negativeOutputs).map(([name, xs]) => [
    name,
    Object.fromEntries(Object.entries(matchedModels).map(([model, m]) => [model, round(score(xs, m))]))
  ])
);

const gibranText = read('resources/control/gibran_prophet_58585.txt').toUpperCase();
const p57DistinctivePhrases = ['LIKE THE INSTAR', 'CIRCUMFERENCES', 'DIVINITY WITHIN'];
const p57InGibranControl = Object.fromEntries(
  p57DistinctivePhrases.map((phrase) => [phrase, gibranText.includes(phrase)])
);

const sourceSizes = Object.fromEntries(
  Object.entries(fullModels).map(([name, model]) => [name, model.symbols])
);
const report = {
  model: 'GP29 character trigram, grid_keyskip_viterbi encoder and smoothing',
  parameters: {
    alphabet_size: 29,
    digraphs: ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'],
    letter_collapses: ['Q→C', 'K→C', 'V→U', 'Z→S'],
    word_boundaries: false,
    smoothing: 'unigram add-one; bigram interpolation 12; trigram interpolation 9',
    matched_training_runes: MATCHED_SIZE
  },
  source_roles: Object.fromEntries(Object.entries(sources).map(([name, definition]) => [name, definition.role])),
  source_training_runes: sourceSizes,
  heldout_full_panel: fullHeldouts,
  heldout_matched_panel: matchedHeldouts,
  seeded_positive_plants: positivePlants,
  known_plaintext_full_panel: knownPlaintextFull,
  known_plaintext_matched_panel: knownPlaintextMatched,
  original_lp2_ciphertext_pages_0_55_full_panel: unknownFull,
  original_lp2_ciphertext_pages_0_55_matched_panel: unknownMatched,
  known_negative_p33_39_transpositions_full_panel: negativeFull,
  known_negative_p33_39_transpositions_matched_panel: negativeMatched,
  source_audit: {
    p57_distinctive_phrases_in_gibran_the_prophet_control: p57InGibranControl,
    note: 'Absence in this one Gibran corpus does not exclude influence from another Gibran work.'
  },
  interpretation: [
    'Cross-model absolute log-likelihoods are not comparable unless training sizes are matched; use the matched panel for register comparisons.',
    'The Cicada-signed prose model has only 139 training runes and is a qualitative control, not a standalone language gate.',
    'The Latin corpus is included only as a wrong-language control.',
    'Seeded additive ciphertexts are synthetic scoring controls, not a hypothesis about the LP2 cipher.'
  ]
};

assert.equal(unknownPages.length, 55, 'Expected 55 rune-bearing unknown LP2 pages');
assert.equal(unknownRunes, 12956, 'Unexpected LP2 unknown-rune total');
assert.equal(p33to39Flat.length, 1680, 'Unexpected p33–39 rune total');
assert.equal(negativeOutputs.per_page_rank_order.length, 1680);
assert.equal(sourceSizes.cicada < 300, true, 'Cicada signed-message model unexpectedly large');
assert.equal(p57InGibranControl['LIKE THE INSTAR'], false);
assert.equal(p57InGibranControl['CIRCUMFERENCES'], false);
assert.equal(p57InGibranControl['DIVINITY WITHIN'], false);
assert.equal(fullHeldouts.find((x) => x.id === 'a_koan_second_koan').own_rank, 1);
assert.equal(fullHeldouts.find((x) => x.id === 'latin_heldout').own_rank, 1);
assert(positivePlants.every((x) => x.margin > 0), 'A seeded additive plant did not reduce its source model score');

for (const [model, p56] of Object.entries(knownPlaintextFull.p56)) {
  const p57 = knownPlaintextFull.p57[model];
  assert(unknownFull[model].mean_page_score < p56 && unknownFull[model].mean_page_score < p57,
    'Unknown ciphertext unexpectedly outranks solved plaintext under ' + model);
  for (const [negative, scores] of Object.entries(negativeFull)) {
    assert(scores[model] < p56 && scores[model] < p57,
      'Known negative output unexpectedly outranks solved plaintext: ' + negative + '/' + model);
  }
}
for (const [model, p56] of Object.entries(knownPlaintextMatched.p56)) {
  const p57 = knownPlaintextMatched.p57[model];
  assert(unknownMatched[model].mean_page_score < p56 && unknownMatched[model].mean_page_score < p57,
    'Matched unknown ciphertext unexpectedly outranks solved plaintext under ' + model);
}

console.log(JSON.stringify(report, null, 2));
