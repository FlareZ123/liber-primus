'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/transcriptions/lp2_krisyotam_2017.txt');
const midiMeta = JSON.parse(read('resources/external/cicada2012-midi-source.json'));
const midiWords = read('resources/historical/cicada2012-midi-50-entries.txt').trim().split(/\s+/);
const primeEchoSource = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const stage11 = JSON.parse(read('resources/historical/stage11-2014-index-manifest.json'));
const wisdom = read('resources/external/2013-0-wisdom.txt');
const tcp = read('resources/external/2013-tcp-server-signed-source.md');
const wisdomFollyReport = read('im-results/2013-os-wisdom-folly-source-classification.md');
const signed2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');

const RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const runeIndex = new Map([...RUNES].map((r, i) => [r, i]));
const N = 12956;
const breaks = new Set('-.&$§');

// Corrected physical framing: slash, percent and line wraps carry a word.
const stream = [];
const records = [];
let current = null;
function closeWord() {
  if (current && current.values.length) records.push(current);
  current = null;
}
for (const ch of transcription) {
  if (runeIndex.has(ch)) {
    if (!current) current = { start: stream.length, values: [] };
    const v = runeIndex.get(ch);
    current.values.push(v);
    stream.push(v);
  } else if (breaks.has(ch) || /[0-9]/.test(ch)) {
    closeWord();
  }
}
closeWord();
const tape = corpus.pages.filter(p => p.page >= 0 && p.page <= 55).flatMap(p => p.indices);
assert.equal(tape.length, N);
assert.deepEqual(stream.slice(0, N), tape);
const groups = records.filter(w => w.start + w.values.length <= N);
const typeCounts = new Map();
for (const w of groups) {
  const key = w.values.join(',');
  typeCounts.set(key, (typeCounts.get(key) || 0) + 1);
}
const multiplicityHistogram = {};
for (const count of typeCounts.values()) multiplicityHistogram[count] = (multiplicityHistogram[count] || 0) + 1;
assert.equal(groups.length, 2896);
assert.equal(typeCounts.size, 2731);
assert.equal(Math.max(...typeCounts.values()), 5);
assert.deepEqual(multiplicityHistogram, { 1: 2611, 2: 90, 3: 20, 4: 5, 5: 5 });

// 2012: verified signed MIDI; the decoded list is a recipient-specific 50-entry submission.
const midiFreq = new Map();
for (const w of midiWords) midiFreq.set(w, (midiFreq.get(w) || 0) + 1);
const midiDuplicates = [...midiFreq].filter(([, n]) => n > 1);
assert.equal(midiWords.length, 50);
assert.equal(midiFreq.size, 48);
assert.deepEqual(midiDuplicates, [['box', 2], ['tray', 2]]);
assert.equal(midiMeta.submission_wordlist.native_entries, 50);
assert.equal(midiMeta.submission_wordlist.distinct_entries, 48);
assert.match(midiMeta.authentication, /recipient-specific/i);

// 2013 OS: the source script literally prints all 464 ascending primes from 2 to 3301.
const primeEcho = [...primeEchoSource.matchAll(/echo(?: -n)?\s+"(\d+)(?:\\t|\t)"/g)].map(m => Number(m[1]));
const lineBreakPrimes = [...primeEchoSource.matchAll(/echo\s+"(\d+)(?:\\t|\t)"/g)].map(m => Number(m[1]));
const longPauses = [...primeEchoSource.matchAll(/echo(?: -n)?\s+"(\d+)(?:\\t|\t)";\s*sleep\s+([0-9.]+)/g)]
  .map(m => ({ prime: Number(m[1]), seconds: Number(m[2]) }))
  .filter(x => x.seconds > 0.1);
assert.equal(primeEcho.length, 464);
assert.equal(new Set(primeEcho).size, 464);
assert.equal(primeEcho[0], 2);
assert.equal(primeEcho.at(-1), 3301);
assert.ok(primeEcho.every((p, i) => i === 0 || p > primeEcho[i - 1]));
assert.equal(lineBreakPrimes.length, 46); // actual script formatting is ten primes per line, then four final entries
assert.deepEqual(longPauses, [{ prime: 1033, seconds: 2 }, { prime: 3301, seconds: 2 }]);
const primeMinusOneMod29 = new Uint32Array(29);
for (const p of primeEcho) primeMinusOneMod29[(p - 1) % 29]++;
assert.equal(primeMinusOneMod29.filter(x => x > 0).length, 29);
assert.equal(Math.max(...primeMinusOneMod29), 20);
assert.equal(Math.min(...primeMinusOneMod29), 1);

// 2014 Stage11: 58 sequential page-image references in a participant archive, not a signed HTTP response.
const pageIds = stage11.images.map(x => Number(x.sourceFile.replace(/\.jpg$/, '')));
const pageIdMod29 = new Uint32Array(29);
for (const id of pageIds) pageIdMod29[id % 29]++;
assert.equal(pageIds.length, 58);
assert.equal(new Set(pageIds).size, 58);
assert.ok(pageIdMod29.every(x => x === 2));
assert.match(stage11.provenance.historicalAuthentication, /not PGP signed HTTP response/i);

// 2014 Stage04 / LP1 page05: known 5x5 mixed table, 12 numeric + 13 word cells.
const wisdomLines = wisdom.split(/\r?\n/);
const gridHeader = wisdomLines.findIndex(line => line.startsWith('ᚳᚾᚩᚹ'));
assert.notEqual(gridHeader, -1);
const gridRows = wisdomLines.slice(gridHeader + 1).filter(line => line.trim()).slice(0, 5);
const cells = gridRows.flatMap(line => line.trim().split(/\s+/).map(x => x.replace(/[⁘⁜]+$/g, '')));
const numericCells = cells.filter(x => /^\d+$/.test(x));
const wordCells = cells.filter(x => !/^\d+$/.test(x));
assert.equal(gridRows.length, 5);
assert.equal(cells.length, 25);
assert.equal(numericCells.length, 12);
assert.equal(wordCells.length, 13);

// 2013 TCP signed source contains only a short BASE29 vector and DH worked example, not a long register.
assert.match(tcp, /BASE29 3301\s*→\s*3QO/);
assert.match(tcp, /DH 23 exchange/);
assert.match(tcp, /participant-selected/i);

// The 2013 OS wisdom/folly object is explicitly classified as the same opaque high-entropy 3,368-byte object.
assert.match(wisdomFollyReport, /3,368-byte high-entropy object/);
assert.match(wisdomFollyReport, /byte-for-byte identical/);

// 2016: authenticated message's central 29-word core is prose, not a structured numeric register.
const body = signed2016.slice(signed2016.indexOf('Hash: SHA1') + 'Hash: SHA1'.length,
  signed2016.indexOf('-----BEGIN PGP SIGNATURE-----'));
const signedWords = body.match(/[A-Za-z]+/g) || [];
const core29 = signedWords.slice(1, 30);
assert.equal(signedWords[0].toLowerCase(), 'hello');
assert.equal(core29.length, 29);
assert.equal(core29[0].toLowerCase(), 'the');
assert.equal(core29[28].toLowerCase(), 'direction');

const result = {
  originalP0P55: {
    groups: groups.length,
    distinctGroups: typeCounts.size,
    repeatOccurrences: groups.length - typeCounts.size,
    maximumMultiplicity: Math.max(...typeCounts.values()),
    multiplicityHistogram
  },
  2012SignedMIDI: {
    entries: midiWords.length,
    distinctEntries: midiFreq.size,
    duplicates: midiDuplicates,
    midiBytes: midiMeta.midi_artifact.size_bytes,
    midiSha256: midiMeta.midi_artifact.sha256,
    signature: midiMeta.midi_artifact.inner_signature_status,
    recipientSpecific: true
  },
  2013PrimeEcho: {
    entries: primeEcho.length,
    distinctPrimes: new Set(primeEcho).size,
    first: primeEcho[0],
    last: primeEcho.at(-1),
    actualLineBreaks: lineBreakPrimes.length,
    longPauses,
    primeMinusOneMod29Counts: Array.from(primeMinusOneMod29)
  },
  2013TCPSignedSpec: {
    base29Example: '3301 -> 3QO (3 symbols)',
    dh23Example: 'base 5; server public 8; client public 19; shared 2',
    fixedLongRegister: false
  },
  2013WisdomFolly: {
    sameOpaqueObject: true,
    bytes: 3368,
    highEntropy: true,
    plaintextRegister: false
  },
  2014Stage04LP1Wisdom: {
    cells: cells.length,
    numericCells: numericCells.length,
    wordCells: wordCells.length,
    sourceDate: '2014 Stage04 original LP1 page05 binary; not an established 2013 artifact'
  },
  2014Stage11Index: {
    images: pageIds.length,
    uniquePageIds: new Set(pageIds).size,
    mod29Counts: Array.from(pageIdMod29),
    sourceCommit: stage11.provenance.sourceCommit,
    sourceTimestampUTC: stage11.provenance.sourceCommitTimestampUTC,
    authentication: stage11.provenance.historicalAuthentication
  },
  2016SignedMessage: { totalBodyWords: signedWords.length, coreWords: core29.length, coreStart: core29[0], coreEnd: core29.at(-1) },
  decision: 'No distinct first-party source-defined GP29 plaintext register survives; the only long numeric sequence is the already tested prime clock, while other candidates are recipient-specific, short protocol vectors, known LP1 pages, participant archives/inputs, or opaque bytes.'
};
console.log(JSON.stringify(result, null, 2));
