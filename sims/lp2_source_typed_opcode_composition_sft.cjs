'use strict';

/**
 * Director #2202. Source-typed, bounded Cicada-operator composition on ORIGINAL
 * LP2 p16..21; freeze the training winner before disjoint p40..53 prediction.
 *
 * Three documented inverse primitives, with no fitted keys:
 * PHI:  LP2 solved p56 subtracts phi(consecutive primes), starting at prime 2.
 * VIG:  2014 Stage04 subtracts native GP29 indices of WELCOME PILGRIM TO THE.
 * COL7: 2014 Stage05 reads 7-item rows in [0,6,2,5,1,4,3] order.
 *
 * Grammar: 1 or 2 ordered operators from {PHI,VIG,COL7}, plus a clock scope
 * {page,section}. No word resets, offsets, key fitting, variable alphabets,
 * guessed F literals, arbitrary passwords, or image/byte-to-rune coercions.
 * Incomplete seven-item rows pass unchanged: explicit extra assumption beyond
 * the exactly divisible original 2014 56-item carrier.
 *
 * Read-only SFT, Node22 CommonJS, tested on original corpus and solved controls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const sourceKey = 'WELCOME PILGRIM TO THE';
const historicalColumn = [0, 6, 2, 5, 1, 4, 3];
const columnInverse = historicalColumn.map((_, i) => historicalColumn.indexOf(i));
const hash = values => crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');

const spell = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));

/** GP-native greedy transliteration. Ignore ASCII letters unavailable in GP. 
 * @param {string} text
 * @returns {number[]}
 */
function toGP(text) {
  const result = [];
  const cleaned = text.toUpperCase().replace(/V/g, 'U').replace(/K/g, 'C');
  for (const word of cleaned.split(/[^A-Z]+/u)) {
    for (let i = 0; i < word.length;) {
      const item = spell.find(({ token }) => word.startsWith(token, i));
      if (item) {
        result.push(item.index);
        i += item.token.length;
      } else {
        i++;
      }
    }
  }
  return result;
}
const vigKey = toGP(sourceKey);
assert.deepEqual(vigKey, [7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18]);

/** @param {number} n @returns {number[]} */
function primeTotients(n) {
  const result = [];
  for (let candidate = 2; result.length < n; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { prime = false; break; }
    }
    if (prime) result.push(candidate - 1);
  }
  return result;
}
const phi = primeTotients(14000);

/** @param {number[]} values @param {number[]} order @returns {number[]} */
function permute(values, order) {
  const out = values.slice();
  for (let offset = 0; offset + 7 <= values.length; offset += 7)
    for (let j = 0; j < 7; j++) out[offset + j] = values[offset + order[j]];
  return out;
}

/** One fully reversible primitive, with its clock starting at zero. 
 * @param {number[]} values
 * @param {'PHI'|'VIG'|'COL7'} op
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function step(values, op, decrypt) {
  if (op === 'COL7') return permute(values, decrypt ? historicalColumn : columnInverse);
  const key = op === 'PHI' ? phi : vigKey;
  const sign = decrypt ? -1 : 1;
  return values.map((value, i) => mod(value + sign * key[i % key.length]));
}

/** @param {number[][]} pages @param {string} op 
 * @param {'page'|'section'} scope @param {boolean} decrypt
 * @returns {number[][]}
 */
function apply(pages, op, scope, decrypt) {
  if (scope === 'page') return pages.map(p => step(p, op, decrypt));
  const flat = step(pages.flat(), op, decrypt);
  let i = 0;
  return pages.map(page => {
    const segment = flat.slice(i, i + page.length);
    i += page.length;
    return segment;
  });
}

/** @param {number[][]} pages @param {string[]} program
 * @param {'page'|'section'} scope @param {boolean} decrypt
 * @returns {number[][]}
 */
function transform(pages, program, scope, decrypt) {
  const operations = decrypt ? program : program.slice().reverse();
  return operations.reduce((units, op) => apply(units, op, scope, decrypt),
    pages.map(page => page.slice()));
}

/** @param {number[]} text @returns {number} */
function ioc(text) {
  const freq = Array(29).fill(0);
  for (const x of text) freq[x]++;
  return freq.reduce((n, f) => n + f * (f - 1), 0) /
    (text.length * (text.length - 1));
}

/** One fixed, native-GP interpolating trigram model from LP1 and solved LP2 p56–57 reference. */
function makeScorer(training) {
  const bigrams = new Uint32Array(29 * 29);
  const trigrams = new Uint32Array(29 * 29 * 29);
  for (let i = 2; i < training.length; i++) {
    const big = training[i-2] * 29 + training[i-1];
    bigrams[big]++;
    trigrams[big * 29 + training[i]]++;
  }
  return text => {
    let total = 0;
    for (let i = 2; i < text.length; i++) {
      const big = text[i-2] * 29 + text[i-1];
      total += Math.log((1 + trigrams[big * 29 + text[i]]) /
        (29 + bigrams[big]));
    }
    return total / (text.length - 2);
  };
}

function nativeControl() {
  const p56 = corpus.pages.find(p => p.page === 56).indices;
  const original = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
  const expected = toGP(original);
  assert.equal(p56.length, 85);
  assert.equal(expected.length, 85);
  const visibleF = p56.flatMap((v, i) => v === 0 ? [i] : []);
  assert.deepEqual(visibleF, [35, 47, 51, 56, 74]);
  // Only the source-known literal-F at position 56 bypasses the shifting clock.
  let k = 0;
  const decoded = p56.map((rune, i) =>
    i === 56 ? 0 : mod(rune - phi[k++]));
  assert.deepEqual(decoded, expected);
  const encoded = decoded.map((rune, i) =>
    i === 56 ? 0 : mod(rune + phi[i < 56 ? i : i-1]));
  assert.deepEqual(encoded, p56);

  const cipher = 'ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ';
  let j = 0;
  const sourceStage04 = [...cipher].map(ch => {
    const i = runeMap.get(ch);
    return i === undefined ? ch : corpus.translit[mod(i - vigKey[j++ % vigKey.length])];
  }).join('');
  assert.equal(j, 18);
  assert.equal(sourceStage04, 'AUOWYFGL5LCSFJ3NONIAN');
  // Source GP rune 27 admits IA and IO; IO produces its period host spelling.
  assert.equal(sourceStage04.replace(/NONIAN$/, 'NONION'), 'AUOWYFGL5LCSFJ3NONION');

  const stage05Cipher = 'TL BE IE OV UT HT RE ID TS EO ST PO SO YR ' +
    'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M';
  const originalChars = [...stage05Cipher.replace(/\s+/gu, '')];
  assert.equal(originalChars.length, 56);
  const index = Array.from({length: originalChars.length}, (_, i) => i);
  const ordered = permute(index, historicalColumn).map(i => originalChars[i]).join('');
  assert.equal(ordered, 'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133');
  assert.deepEqual(permute(permute(index, historicalColumn), columnInverse), index);

  return { solvedP56: true, literalFOriginalPosition: 56, p56RuneCount: 85,
    stage04SourceHost: sourceStage04, stage05SourceWords: ordered };
}

function main() {
  const positives = nativeControl();
  const gpTraining = toGP(reference.replace(/^#.*$/gm, ''));
  const scorer = makeScorer(gpTraining);
  const getPages = (a, b) => corpus.pages.filter(p => p.page >= a && p.page <= b &&
    p.indices.length).map(p => p.indices);
  const trainingPages = getPages(16, 21);
  const withheldPages = getPages(40, 53);
  const training = trainingPages.flat();
  const withheld = withheldPages.flat();
  assert.equal(trainingPages.length, 6);
  assert.equal(withheldPages.length, 13);
  assert.equal(training.length, 1613);
  assert.equal(withheld.length, 3008);
  const candidates = [];
  const ops = ['PHI', 'VIG', 'COL7'];
  const programs = ops.map(op => [op]);
  for (const a of ops) for (const b of ops) programs.push([a,b]);
  assert.equal(programs.length, 12);
  for (const scope of ['page', 'section'])
    for (const program of programs) {
      const plainPages = transform(trainingPages, program, scope, true);
      const recovered = plainPages.flat();
      assert.deepEqual(transform(plainPages, program, scope, false),
        trainingPages, 'original train reencryption mismatch');
      candidates.push({ scope, program, score: scorer(recovered),
        ioc: ioc(recovered), outputHash: hash(recovered),
        first80: recovered.slice(0,80).map(i => corpus.translit[i]).join('') });
    }

  // Sort by first-chapter training only, BEFORE touching withheld source runes.
  const ranked = candidates.sort((a,b) => b.score-a.score ||
    (a.scope+a.program.join(',')).localeCompare(b.scope+b.program.join(',')));
  const winner = ranked[0];
  const distinct = new Map();
  for (const c of ranked) if (!distinct.has(c.outputHash))
    distinct.set(c.outputHash, c);

  // Separate synthetic plant: the documented two-operator cipher must invert.
  const sample = gpTraining.slice(1500, 1500 + training.length);
  assert.equal(sample.length, training.length);
  const plantedPages = trainingPages.map(p => sample.splice(0,p.length));
  const composed = ['VIG', 'COL7'];
  const plantedCipher = transform(plantedPages, composed, 'section', false);
  assert.deepEqual(transform(plantedCipher, composed, 'section', true),
    plantedPages);
  assert.notDeepEqual(plantedCipher, plantedPages);

  const decodedWithheldPages = transform(withheldPages, winner.program,
    winner.scope, true);
  const prediction = decodedWithheldPages.flat();
  assert.deepEqual(transform(decodedWithheldPages, winner.program,
    winner.scope, false), withheldPages);
  const sourcePreview = values => values.map(i => corpus.translit[i]).join('');
  const solvedScore = scorer(toGP(
    'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'));
  const predictionResult = {
    testedPages: 'LP2 p40..p53, excluding the rune-free numeric p50',
    length: prediction.length, score: scorer(prediction), ioc: ioc(prediction),
    first260: sourcePreview(prediction.slice(0,260)),
    completeGpTransliteration: sourcePreview(prediction),
    last260: sourcePreview(prediction.slice(-260)),
    sha256: hash(prediction), exactForwardReplay: true,
    sourceSelectedOperandForLP2: false
  };
  assert.ok(prediction.length >= 200);
  console.log(JSON.stringify({
    evidenceClass: 'finite historical-opcode composition; not an authenticated LP2 key',
    status: 'all original and solved controls executed',
    grammar: { maxOps: 2, availableOps: ops, sourceKey,
      col7ReadOrder: historicalColumn, primeStart: 2,
      wordClock: 'never resets at printed word', fPolicyUnknown: 'no F bypass',
      pageTreatment: ['reset on physical page','continuous within chapter'],
      tailRule: 'incomplete 7-block passes unchanged (unhistorical extension)',
      consideredRawPrograms: candidates.length, distinctDecodedTrainingOutputs: distinct.size,
      excludedTypeMismatches: ['BASE29 numeric to digitstream','GZIP byte-to-byte',
        'OutGuess JPEG+password to bytes','book-coordinate requires book'] },
    controls: positives,
    syntheticPlant: { recovered: true, runes: training.length, program: composed,
      sectionClock: true },
    training: { pages:'LP2 p16..p21', runes: training.length,
      nativeLP1RuneTrainingSize: gpTraining.length, solvedP56Score: solvedScore,
      candidatesRankedOnlyOnTraining: ranked,
      winner: {scope:winner.scope,program:winner.program,score:winner.score} },
    frozenDisjointPrediction: predictionResult,
    conclusion: 'A source-authored selector/key for applying these operations to unknown LP2 pages is still absent.'
  }, null, 2));
}
main();
