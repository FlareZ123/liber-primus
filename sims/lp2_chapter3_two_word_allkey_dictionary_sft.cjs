'use strict';

/**
 * Original LP2 chapter 3: exact two-cipherword contradiction for every
 * independent nonempty injective GP29-rune -> ASCII-string codebook whose
 * complete decoded words lie in the pinned 29,157-word English dictionary.
 *
 * Node 22, no flags, no writes, reproducible from repository root or elsewhere.
 * All 26 one-letter ASCII dictionary entries remain allowed; no A/I/O gate
 * or preferred ciphertext keys are assumed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const GP = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const glyphs = new Set(GP);
const anchor = {start:5447,w:'ᚹᛒᛗᚱᚾᛗᚻᛗᛁᚾᚪᛞ'};
const challenge = {start:4061,w:'ᚱᛁ'};
const expectedMap = new Map([
  ['ᚹ','in'],['ᛒ','s'],['ᛗ','i'],['ᚱ','g'],['ᚾ','n'],
  ['ᚻ','f'],['ᛁ','ca'],['ᚪ','c'],['ᛞ','e']
]);

/** @returns {{start:number,w:string}[]} */
function originalWords() {
  const out = [];
  let word = '',start = 0, offset = 0;
  for (const c of read('resources/liber-primus/lp2-transcription.txt')) {
    if (glyphs.has(c)) {
      if (offset === 12956) break;
      if (!word) start = offset;
      word += c;
      offset++;
    } else if ('-.$&'.includes(c) && word) {
      out.push({start,w:word});
      word = '';
    }
  }
  if (word) out.push({start,w:word});
  assert.equal(offset,12956);
  assert.equal(out.length,2896);
  return out;
}

/**
 * Exhaust all nonempty contiguous segmentations of one dictionary word
 * into the fixed rune word. A repeated rune is forced to the identical
 * substring; all unequal runes must receive unequal strings. Every rune
 * occurring as a separate one-rune cipherword must receive a dictionary
 * whole word, regardless of the codeword's length.
 *
 * @param {string} cipher
 * @param {string} plain
 * @param {Set<string>} singletonRunes
 * @param {Set<string>} dict
 * @returns {Map<string,string>[]}
 */
function exactMaps(cipher,plain,singletonRunes,dict) {
  const keys = [...cipher], ans = [];
  const mapping = new Map(),used = new Set();

  /** @param {number} i @param {number} j */
  function walk(i,j) {
    if (i === keys.length) {
      if (j === plain.length) ans.push(new Map(mapping));
      return;
    }
    const rune = keys[i], trailing = keys.length-i-1;
    if (j >= plain.length-trailing) return;
    if (mapping.has(rune)) {
      const literal = mapping.get(rune);
      if (plain.startsWith(literal,j)) walk(i+1,j+literal.length);
      return;
    }
    for (let length = 1; length <= plain.length-j-trailing; length++) {
      const candidate = plain.slice(j,j+length);
      if (used.has(candidate)) continue;
      if (singletonRunes.has(rune) && !dict.has(candidate)) continue;
      mapping.set(rune,candidate);
      used.add(candidate);
      walk(i+1,j+length);
      used.delete(candidate);
      mapping.delete(rune);
    }
  }
  if (plain.length >= keys.length) walk(0,0);
  return ans;
}

/** @param {string} cipher @param {Map<string,string>} mapping */
function decode(cipher,mapping) {
  return [...cipher].map((rune) => {
    assert.ok(mapping.has(rune),'missing cipher key entry');
    return mapping.get(rune);
  }).join('');
}

function main() {
  const corpus = originalWords();
  const chapter = corpus.filter(({start}) => start >= 3603 && start < 5506);
  assert.equal(chapter.length,437);
  assert.ok(chapter.some(({start,w}) => start === anchor.start && w === anchor.w));
  assert.ok(chapter.some(({start,w}) => start === challenge.start && w === challenge.w));
  const singletonRunes = new Set(chapter.filter(({w}) => w.length === 1).map(({w}) => w));
  assert.equal(singletonRunes.size,12);

  const entries = read('resources/control/english_wordfreq_textblob.txt')
    .split(/\r?\n/).filter((line) => /^[a-z]+ [0-9]+$/.test(line))
    .map((line) => line.split(' ')[0]);
  assert.equal(entries.length,29157);
  const dict = new Set(entries);
  assert.equal(dict.size,29157);
  assert.ok([...('abcdefghijklmnopqrstuvwxyz')].every((letter) => dict.has(letter)));
  assert.ok(dict.has('insignificance'));
  assert.ok(!dict.has('gca'));

  const allMaps = [];
  let eligibleWords = 0;
  for (const plain of dict) {
    if (plain.length < anchor.w.length) continue;
    eligibleWords++;
    for (const mapping of exactMaps(anchor.w,plain,singletonRunes,dict)) {
      allMaps.push({plain,mapping});
    }
  }
  assert.equal(eligibleWords,1986);
  assert.equal(allMaps.length,1);
  const only = allMaps[0];
  assert.equal(only.plain,'insignificance');
  assert.deepEqual([...only.mapping], [...expectedMap]);
  assert.equal(decode(anchor.w,only.mapping),'insignificance');
  assert.equal(decode(challenge.w,only.mapping),'gca');
  assert.ok(!dict.has(decode(challenge.w,only.mapping)));
  console.log('Original chapter 3: 437 complete words; 12 distinct source singleton runes.');
  console.log('All ' + dict.size + ' distinct native dictionary words (including all 26 singleton ASCII letters) were allowed.');
  console.log('Anchor original rune offset ' + anchor.start + ': ' + anchor.w);
  console.log('Exact original anchor candidates among ' + eligibleWords + ' length-feasible dictionary words: 1');
  console.log('Only plaintext = ' + only.plain + ', uniquely forcing 9 codeword assignments.');
  console.log('Independent original chapter word at offset ' + challenge.start +
    ' is ' + challenge.w + ', forced plaintext ' + decode(challenge.w,only.mapping) + '.');
  console.log('The forced plaintext is absent from the entire fixed dictionary: no nine-chapter or chapter-3 fixed injective variable-string codebook can encode all words in this dictionary.');

  // Construct an independent positive original-register test with two-letter
  // codewords actually used. This proves the segmentation enumerator accepts
  // known valid variable-length, injective and reversible codebooks.
  const positiveCodes = [...'abcdefghijklmnopqrstuvwxyz'].filter((s) => s !== 'c')
    .concat(['ca','ce','ch','ck']);
  assert.equal(positiveCodes.length,29);
  assert.ok(positiveCodes.every((s,i) =>
    positiveCodes.every((t,j) => i === j || !t.startsWith(s))));
  const positiveEncode = new Map(positiveCodes.map((word,i) =>
    [word, GP[(7*i+3)%29]]));
  const inverse = new Map([...positiveEncode].map(([word,rune]) => [rune,word]));
  assert.equal(inverse.size,29);
  const native = 'insignificance';
  let plant = '';
  for (let i = 0; i < native.length;) {
    const code = native[i] === 'c' ? native.slice(i,i+2) : native[i];
    assert.ok(positiveEncode.has(code));
    plant += positiveEncode.get(code);
    i += code.length;
  }
  assert.equal(plant.length,12);
  assert.equal(decode(plant,inverse),native);
  const positiveSingletons = new Set([
    positiveEncode.get('a'),positiveEncode.get('i'),positiveEncode.get('ca')
  ]);
  const plantMaps = exactMaps(plant,native,positiveSingletons,dict);
  assert.ok(plantMaps.some((m) => decode(plant,m) === native));
  console.log('Blind positive: secret prefix-free 29-symbol codebook, 12-rune planted word with two actual 2-letter codewords, exact inverse and matching certificate PASS.');
  console.log('PASS: two-word original finite-lexicon all-key impossibility.');
}

main();
