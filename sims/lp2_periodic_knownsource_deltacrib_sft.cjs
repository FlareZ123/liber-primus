'use strict';

/**
 * All-offset original-LP2 periodic Vigenere crib search against first-party
 * solved runes and PGP-clearsigned historical prose. Read-only Windows Node22 SFT.
 * Tested family: C_i = s * P_i + K_(i mod k) (mod29), s in {+1,-1},
 * unknown 29-symbol additive key of period 1..256, and optional reversal
 * of the complete known-source message. No plaintext-F bypass is assumed.
 *
 * Equality of differences C_(i+k)-C_i and s*(P_(i+k)-P_i) is a
 * key-independent necessary condition. Seven consecutive matching
 * differences imply a k+7-rune window fitting some period-k additive key.
 * When k>7 this need not identify the k unrepeated key positions.
 *
 * No original plaintext, key, or destination is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const relikd = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((symbol, index) => ({ symbol, index }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const mod = v => (v % 29 + 29) % 29;

/** @param {string} txt @returns {number[]} */
function nativeGP(txt) {
  const out = [];
  for (const raw of txt.toUpperCase().match(/[A-Z]+/g) || []) {
    const w = raw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
      .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    for (let i = 0; i < w.length;) {
      const token = tokens.find(t => w.startsWith(t.symbol, i));
      assert.ok(token, 'unknown GP letter in ' + raw);
      out.push(token.index);
      i += token.symbol.length;
    }
  }
  return out;
}

/** @param {string} input @param {{rsa?:boolean,email?:boolean}} opts */
function signedText(input, opts) {
  assert.ok(input.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'));
  const marker = '-----BEGIN PGP SIGNATURE-----';
  assert.ok(input.includes(marker));
  const body = input.replace(/\r\n/g, '\n')
    .split(marker)[0].split('\n\n').slice(1).join('\n\n')
    .split('- -----BEGIN PGP MESSAGE-----')[0];
  let prose = body;
  if (opts.rsa) {
    const section = 'The encrypted message is a number.';
    const tail = prose.includes(section) ? section + prose.split(section)[1] : '';
    prose = prose.split('- -----BEGIN COMPRESSED RSA ENCRYPTED MESSAGE-----')[0]
      + '\n' + tail;
  }
  prose = prose.replace(/\b[a-z0-9]{16}\.onion\b/gi, ' ').replace(/\b3301\b/g, ' ');
  if (opts.email)
    prose = prose.replace(/\b[\w.+-]+@[\w.-]+\.\w+\b/g, ' ');
  return nativeGP(prose);
}

const original = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(original.length, 55);
assert.equal(original.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const solved = relikd.sections.map(s => ({
  name: s.name,
  values: [...s.source_text].filter(r => runeIndex.has(r))
    .map(r => runeIndex.get(r))
}));
assert.deepEqual(solved.map(s => s.values.length),
  [184, 515, 157, 780, 755, 319, 89, 85, 95]);
assert.deepEqual(solved[8].values, gp.pages[57].indices);

const signedSources = [
  ['2016', 'resources/historical/cicada2016-4gq25-outguess.asc', {}],
  ['2014', 'resources/historical/cicada2014-stage11-message.asc', {}],
  ['2012count', 'resources/historical/cicada2012-countdown-message.asc', {}],
  ['2012midi', 'resources/historical/cicada2012-midi-email.asc', {}],
  ['2013first', 'resources/historical/cicada2013-first-onion-hello.asc', {}],
  ['2013forest', 'resources/historical/cicada2013-forest-clue.asc', {}],
  ['2013second', 'resources/historical/cicada2013-second-onion-everything-you-need.asc', {}],
  ['2013icmp', 'resources/historical/cicada2013-second-onion-icmp-echo.asc', {}],
  ['2014stage09', 'resources/historical/cicada2014-stage09-first-jpeg-recovered.asc', {}],
  ['2012song', 'resources/historical/cicada2012-song-is-your-own-path.asc', {}],
  ['2012rsa', 'resources/historical/cicada2012-message-only-displayed.asc', { rsa: true, email: true }],
  ['2013welcome', 'resources/historical/cicada2013-welcome-and-congratulations.asc', {}],
  ['2013followed', 'resources/historical/cicada2013-if-you-followed.asc', { email: true }],
  ['2013nomore', 'resources/historical/cicada2013-no-more-testing.asc', {}],
  ['2013donot', 'resources/external/2013-do-not-share-this-information-2.asc', { email: true }]
];
for (const [name, filename, opts] of signedSources)
  solved.push({ name, values: signedText(read(filename), opts) });
assert.deepEqual(solved.slice(9).map(s => s.values.length),
  [177, 65, 73, 335, 43, 49, 91, 30, 167, 335, 517, 997, 98, 130, 1684]);

const WIDTH = 7;
const HIGH_POWER = 29 ** (WIDTH - 1);
/**
 * @param {{page:number,indices:number[]}[]} ciphertext
 * @param {{name:string,values:number[]}[]} source
 * @param {number[]} periods
 * @param {number[]} signs
 * @param {boolean[]} reverseOptions
 */
function findCribs(ciphertext, source, periods, signs, reverseOptions) {
  const matches = [];
  for (const sign of signs) for (const reversed of reverseOptions)
    for (const period of periods) {
      const index = new Map();
      for (const text of source) {
        const values = reversed ? text.values.slice().reverse() : text.values;
        const count = values.length - period - WIDTH + 1;
        if (count <= 0) continue;
        const diffs = Array.from({ length: values.length - period }, (_, i) =>
          mod(sign * (values[i + period] - values[i])));
        let hash = 0;
        for (let i = 0; i < WIDTH; i++) hash = 29 * hash + diffs[i];
        for (let i = 0; i < count; i++) {
          if (i) hash = (hash - diffs[i - 1] * HIGH_POWER) * 29
            + diffs[i + WIDTH - 1];
          const found = index.get(hash);
          if (found) found.push({ text, values, at: i });
          else index.set(hash, [{ text, values, at: i }]);
        }
      }
      for (const page of ciphertext) {
        const values = page.indices;
        const count = values.length - period - WIDTH + 1;
        if (count <= 0) continue;
        const diffs = Array.from({ length: values.length - period }, (_, i) =>
          mod(values[i + period] - values[i]));
        let hash = 0;
        for (let i = 0; i < WIDTH; i++) hash = 29 * hash + diffs[i];
        for (let i = 0; i < count; i++) {
          if (i) hash = (hash - diffs[i - 1] * HIGH_POWER) * 29
            + diffs[i + WIDTH - 1];
          const collisions = index.get(hash);
          if (!collisions) continue;
          for (const candidate of collisions) {
            let run = WIDTH;
            while (i + period + run < values.length
              && candidate.at + period + run < candidate.values.length
              && diffs[i + run] === mod(sign * (
                candidate.values[candidate.at + period + run]
                - candidate.values[candidate.at + run])))
              run++;
            matches.push({ sign, reversed, period, run,
              page: page.page, source: candidate.text.name,
              ciphertextStart: i, sourceStart: candidate.at });
          }
        }
      }
    }
  return matches;
}

const periods = Array.from({ length: 256 }, (_, i) => i + 1);
const matches = findCribs(original, solved, periods, [1, -1], [false, true]);
assert.deepEqual(matches, [{
  sign: 1, reversed: false, period: 8, run: 7,
  page: 36, source: '0_welcome', ciphertextStart: 131, sourceStart: 148
}]);

const known = solved.find(s => s.name === '0_welcome').values;
const originalPart = gp.pages[36].indices.slice(131, 147);
const clearPart = known.slice(148, 164);
const k = Array.from({ length: 8 }, (_, i) => mod(originalPart[i] - clearPart[i]));
assert.deepEqual(k, [25, 9, 26, 4, 13, 26, 19, 0]);
for (let i = 0; i < 15; i++)
  assert.equal(originalPart[i], mod(clearPart[i] + k[i % 8]));
assert.notEqual(originalPart[15], mod(clearPart[15] + k[7]));
assert.equal(gp.translit[clearPart[15]], 'NG');

const plantedPlain = known.slice(100, 164);
const plantedKey = nativeGP('DIVINITY');
assert.equal(plantedKey.length, 8);
const planted = plantedPlain.map((x, i) => mod(x + plantedKey[i % 8]));
const synthetic = findCribs([{ page: 999, indices: planted }],
  [{ name: '0_welcome', values: known }], [8], [1], [false]);
assert.ok(synthetic.some(m => m.page === 999
  && m.ciphertextStart === 0 && m.sourceStart === 100 && m.run === 56));
assert.deepEqual(planted.map((x, i) => mod(x - plantedKey[i % 8])), plantedPlain);

console.log(JSON.stringify({
  family: 'all-key periodic additive and additive-reflected GP29 first-party crib',
  originalPages: original.length,
  originalRunes: 12956,
  sources: solved.length,
  periods: [1, 256],
  sourceOrientation: ['forward', 'reverse'],
  plaintextMultiplier: [1, -1],
  deltaSeedLength: WIDTH,
  genuineMatches: matches,
  originalFullPage36UnderMatchedKey: 'nonprose, key does not extend',
  positiveNativeGpRunesRecovered: plantedPlain.length,
  evidence: 'partial seven-difference collision, not recovered unknown plaintext'
}, null, 2));
