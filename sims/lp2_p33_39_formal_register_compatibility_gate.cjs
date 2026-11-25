'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const protocol = fs.readFileSync('resources/external/2013-tcp-server-signed-source.md', 'utf8');
const stage10 = fs.readFileSync('resources/historical/cicada2014-stage10-original-form.html', 'utf8');
const profile = fs.readFileSync('im-results/cicada-authenticated-solvepath-operation-contracts-2012-2016.md', 'utf8');
const prior = fs.readFileSync('im-results/lp2-five-numbered-program-source-type-invariant.md', 'utf8');

const direct = new Set(corpus.translit.join('').split(''));
const allowed = new Set([...direct, 'K', 'V']); // grant the common C/K and U/V variants
const missing = s => [...new Set([...s].filter(ch => !allowed.has(ch)))];
const commands = ['RAND', 'QUINE', 'BASE29', 'CODE', 'KOAN', 'DH', 'NEXT', 'GOODBYE'];
const commandCompatibility = commands.map(command => ({
  command, missing: missing(command), lexicallyRepresentable: missing(command).length === 0
}));
assert.equal(corpus.runes.length, 29);
assert(protocol.includes('commands RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, and GOODBYE'));
assert(protocol.includes('BASE29 3301 → 3QO'));
assert(protocol.includes('contains **no NUMBER, PRIMES, or COUNT command**'));
assert(profile.includes('no conversion from \`3QO\` into three GP29 runes'));
assert(prior.includes('five separate *red Arabic numerals* 1–5'));
assert(prior.includes('same two-line cuneiform-style title copied on each page'));
for (const field of ['53301', '71033', '51033']) assert(stage10.includes('name="' + field + '"'));
assert.deepEqual(missing('QUINE'), ['Q']);
assert.deepEqual(missing('BASE29'), ['2', '9']);
assert.deepEqual(missing('3QO'), ['3', 'Q']);
assert.deepEqual(missing('3301'), ['3', '0', '1']);

const result = {
  gp29: { symbolCount: corpus.runes.length, canonicalTransliterations: corpus.translit, allowedAliases: ['K', 'V'], directLetters: [...direct].sort() },
  signed2013TcpCommands: commandCompatibility,
  workedExamples: {
    base29: { input: '3301', output: '3QO', unsupportedInputSymbols: missing('3301'), unsupportedOutputSymbols: missing('3QO'), sourceDefinedGp29IndexBridge: false },
    dh: { example: 'DH 23', unsupportedParameterSymbols: missing('23'), baseAndSecretChosenByParticipant: true },
    next: { semantics: 'client-supplied text stored by server; not a computed next instruction' }
  },
  stage10: {
    fieldNames: ['53301', '71033', '51033'], numericFieldNamesRepresentable: false,
    cgi: '/cgi-bin/upload', fileField: 'file', keyPath: '/key.asc',
    classification: 'typed HTML upload contract, not a GP29 instruction grammar'
  },
  originalFiveUnits: { labels: [1, 2, 3, 4, 5], runeCounts: [139, 91, 98, 96, 129], wordCounts: [30, 20, 25, 19, 28], repeatedTwoLineCuneiformHeader: true },
  decision: 'No source-fixed formal-instruction grammar in the preserved 2012–2014 Cicada materials is both historically attested and directly representable in GP29. Stop before original scoring.'
};
console.log(JSON.stringify(result, null, 2));
