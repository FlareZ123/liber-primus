'use strict';
/**
 * Original 2013 prime_echo two-pause ↔ LP2 numbered-passage 10-dot boundary gate.
 * Director #2348. This records a bounded source boundary correspondence,
 * and deliberately does not invent a ciphertext consumer or variable key phase.
 * Run: node sims/lp2_prime_echo_pause_tendot_boundary_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} text */
function digest(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/** @param {string} source */
function parseOriginalScript(source) {
  const content = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const echoLines = content.filter(line => line.startsWith('echo'));
  assert.equal(content[0], '#!/bin/ash');
  assert.equal(content.length, 465, 'one original shebang plus 464 literal prime echoes');
  assert.equal(echoLines.length, 464);
  const echo = echoLines.map((line, i) => {
    const match = /^echo\s+(?:-n\s+)?"(\d+)\s*";\s*sleep\s+(\d*\.?\d+)$/.exec(line);
    assert.ok(match, 'literal echo/sleep program at line ' + (i + 1));
    return { ordinal: i + 1, value: Number(match[1]), seconds: Number(match[2]),
      newline: !/^echo\s+-n/.test(line) };
  });
  const sourcePrimes = [];
  for (let n = 2; n <= 3301; n++) {
    let prime = true;
    for (let k = 2; k * k <= n; k++) if (n % k === 0) { prime = false; break; }
    if (prime) sourcePrimes.push(n);
  }
  assert.deepEqual(echo.map(x => x.value), sourcePrimes);
  assert.deepEqual(echo.filter(x => x.newline).map(x => x.ordinal),
    Array.from({ length: 46 }, (_, i) => (i + 1) * 10));
  assert.ok(echo.every(x => x.seconds === 0.05 || x.seconds === 2));
  const pauses = echo.filter(x => x.seconds === 2).map(x => ({
    ordinal: x.ordinal, prime: x.value,
    displayRow: Math.floor((x.ordinal - 1) / 10) + 1,
    displayColumn: (x.ordinal - 1) % 10 + 1
  }));
  assert.deepEqual(pauses, [
    { ordinal: 174, prime: 1033, displayRow: 18, displayColumn: 4 },
    { ordinal: 464, prime: 3301, displayRow: 47, displayColumn: 4 }
  ]);
  return { pauses, literalPrimeCount: echo.length,
    intervalPrimesAfterFirstThroughSecond: pauses[1].ordinal - pauses[0].ordinal,
    interveningDisplayRows: pauses[1].displayRow - pauses[0].displayRow };
}

function run() {
  const source = fs.readFileSync(path.join(ROOT,
    'resources/historical/cicada2013-os-original-prime-echo.sh'), 'utf8');
  const script = parseOriginalScript(source);
  assert.equal(script.intervalPrimesAfterFirstThroughSecond, 290);
  assert.equal(script.interveningDisplayRows, 29);

  const annotations = JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const tenDot = annotations.pages.flatMap(page => (page.large_punctuation || [])
    .filter(entry => entry[1] === 10)
    .map(entry => ({ page: page.page, position: entry[0], modulo29: entry[0] % 29 })));
  assert.deepEqual(tenDot, [
    { page: 36, position: 99, modulo29: 12 },
    { page: 38, position: 186, modulo29: 12 },
    { page: 49, position: 66, modulo29: 8 },
    { page: 56, position: 45, modulo29: 16 }
  ]);
  const count = p => corpus.pages.find(page => page.page === p).indices.length;
  assert.deepEqual([33,34,35,36,37,38,39].map(count),
    [214,261,271,238,228,228,240]);
  const runesBetweenCuneiformDots = count(36) - 99 + count(37) + 186;
  assert.equal(runesBetweenCuneiformDots, 553);
  const transcript = fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-transcription.txt'), 'utf8').split('%');
  assert.ok(transcript[36].includes('1-'));
  assert.ok(transcript[37].includes('2-') && transcript[37].includes('3-') &&
    transcript[37].includes('4-'));
  assert.ok(transcript[38].includes('5-'));

  // The only two red 10-dot signs *within* the numbered cuneiform chapter
  // have equal page-local GP29 clock phase. Two additional equally genuine
  // red10 signs exist elsewhere, so a global "10-dot = 2-second pause"
  // rule is NOT specified by the original artifacts.
  const local = tenDot.filter(x => x.page >= 33 && x.page <= 39);
  assert.equal(local.length, 2);
  assert.equal(local[0].modulo29, local[1].modulo29);
  assert.notEqual(runesBetweenCuneiformDots, script.intervalPrimesAfterFirstThroughSecond);

  return {
    classification: 'Original 2013 display and LP2 ink alignment; no decipherment instruction',
    firstPartyScriptSHA256: digest(source),
    originalProgram: script,
    allOriginalRed10DotMarkers: tenDot,
    selectedPageRange: [33,39],
    cuneiformMarkedTape: {
      first: { page: 36, afterRune: 99 },
      last: { page: 38, afterRune: 186 },
      interveningGP29Runes: runesBetweenCuneiformDots,
      printedNumberedItems: 5,
      pageLocalMarkerPhaseModulo29: 12
    },
    competingInterpretation: 'Two script pauses could be display pacing. Pair selection, page-reset clock, and the 553-rune/290-prime consumer are not instructed by either source.',
    decision: 'Missing original GP29 opcode, a unique source-selected mapping from the two pauses to manuscript marks, and a 290→553 positional transport. No authentic unknown plaintext or key.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
