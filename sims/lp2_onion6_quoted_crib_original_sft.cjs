'use strict';
// Read-only, offline original-source single-file test for Director #2393.
// Usage from the repository: node sims/lp2_onion6_quoted_crib_original_sft.cjs

/** @typedef {{ start:number, end:number, text:string }} Word */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const archive = JSON.parse(read('resources/external/2014-onion6-seven-rune-pages.json'));
const quoteMetadata = JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const originalTape = read('resources/liber-primus/lp2-transcription.txt');
const RUNE = /[\u16A0-\u16FF]/u;
const LATIN = /[A-Za-z]/;

/** Count Unicode GP glyphs (or Latin letters) in physical printed words.
 * Slash/newline, percent page markers and source colon-before-F do not split words.
 * Printed word boundaries alone split words. Original ciphertext rune offsets
 * are accumulated before splitting, preserving genuine physical page carries.
 * @param {string} source
 * @param {RegExp} letter
 * @returns {{ words:Word[], count:number }}
 */
function parseWords(source, letter) {
  /** @type {Word[]} */
  const words = [];
  let word = '';
  let start = 0;
  let count = 0;
  function flush() {
    if (word) {
      words.push({ start, end:count, text:word });
      word = '';
    }
  }
  for (const c of source) {
    if (letter.test(c)) {
      if (!word) start = count;
      word += c.toUpperCase();
      count++;
    } else if ('-.$&§'.includes(c)) {
      flush();
    }
  }
  flush();
  return { words, count };
}

/** Canonical 2014 GP composite-letter spelling, longest match first.
 * @param {string} word
 * @returns {number}
 */
function projectedLength(word) {
  const parts = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'EA', 'IA'];
  let i = 0, length = 0;
  while (i < word.length) {
    const compound = parts.find(p => word.startsWith(p, i));
    i += compound ? compound.length : 1;
    length++;
  }
  return length;
}

/** Exhaustive fixed-word-count source scan and longest contiguous run.
 * @param {number[]} target
 * @param {number[]} donor
 */
function compare(target, donor) {
  let fullMatches = 0;
  let maxWords = 0;
  let maxRunes = 0;
  let coordinates = null;
  for (let ti = 0; ti < target.length; ti++) {
    for (let di = 0; di < donor.length; di++) {
      let n = 0, runes = 0;
      while (ti+n < target.length && di+n < donor.length &&
             target[ti+n] === donor[di+n]) {
        runes += target[ti+n];
        n++;
      }
      if (ti === 0 && n === target.length) fullMatches++;
      if (n > maxWords || (n === maxWords && runes > maxRunes)) {
        maxWords = n;
        maxRunes = runes;
        coordinates = { quoteWordOffset:ti, sourceWordOffset:di };
      }
    }
  }
  return { fullMatches, maxWords, maxRunes, coordinates };
}

const tape = parseWords(originalTape, RUNE);
assert.equal(tape.count, 13136, 'full original LP2 tape including solved p56/57');
assert.equal(tape.words.filter(w => w.start < 12956).length, 2896);
const targets = quoteMetadata.quotes.map((q, n) => {
  const selected = tape.words.filter(w => w.start >= q.start && w.end <= q.end);
  assert.equal(selected[0].start, q.start, 'quote start ' + n);
  assert.equal(selected[selected.length - 1].end, q.end, 'quote end ' + n);
  const lengths = selected.map(w => w.text.length);
  assert.equal(lengths.reduce((a,b)=>a+b,0), q.length);
  return lengths;
});
assert.deepEqual(targets.map(t => t.length), [4,5,2,14,13,34,14]);

const originalPages = archive.originals.map(p => p.runic_text);
assert.deepEqual(archive.originals.map(p => p.page),
  ['10','11','12','13','107','167','229']);
const runicGroups = [
  originalPages.slice(0,4).join('\n'),
  originalPages.slice(4,6).join('\n'),
  originalPages[6]
];
const original = runicGroups.map(s => parseWords(s, RUNE).words.map(w=>w.text.length));
assert.deepEqual(original.map(s=>s.length), [181,87,18]);
assert.deepEqual(runicGroups.map(s=>parseWords(s,RUNE).count), [755,319,89]);

const corrected = archive.corrected_roman.map(p => parseWords(p.text, LATIN).words.map(w=>w.text));
assert.deepEqual(corrected.map(s=>s.length), [181,87,18]);
const modes = {
  'source-native-GP-runes':original,
  'editorially-corrected-GP29':corrected.map(s=>s.map(projectedLength)),
  'editorially-corrected-raw-Latin':corrected.map(s=>s.map(w=>w.length))
};
const result = Object.fromEntries(Object.entries(modes).map(([name, groups]) =>
  [name, targets.map(q => groups.map(g => compare(q,g)))]
));
for (const rows of Object.values(result)) {
  for (const i of [0,1,3,4,5,6]) {
    assert.ok(rows[i].every(z => z.fullMatches === 0));
  }
  assert.ok(rows.every(row => row.every(z => z.maxWords < 12 && z.maxRunes < 40)));
}
assert.equal(result['source-native-GP-runes'][2][0].fullMatches, 2);
assert.equal(result['editorially-corrected-raw-Latin'][2][0].fullMatches, 5);
assert.equal(result['source-native-GP-runes'][5][0].maxWords, 6);
assert.equal(result['source-native-GP-runes'][5][0].maxRunes, 22);

console.log(JSON.stringify({
  sourcePages:archive.originals.map(p => p.page),
  sourceWordCounts:original.map(g=>g.length),
  quotedWordVectors:targets,
  byConvention:result,
  interpretation:'NO full 12-word/40-rune 2014 Onion6 literal quote crib'
}, null, 2));


// Historical 2014 source-plaintext 13-rune Vigenere clock (Director #2393).
// Any secret period-13 key satisfies C[i+13]-C[i] == +/- (P[j+13]-P[j]),
// so common substrings in lag-difference tapes test every key at once.
const historicalGpKeys=[...'ᛠᛡᚣᚫᚪᛞᛟᛝᛚᛗᛖᛒᛏᛋᛉᛈᛇᛄᛁᚾᚻᚹᚷᚳᚱᚩᚦᚢᚠ'];
const historicalReverseKeys=[...historicalGpKeys].reverse();
const documentedFskipShifts=[29,19,25,29,28,10,29,11,25,11,20,29,11];
const historicalIndex=new Map(historicalGpKeys.map((v,i)=>[v,i]));
assert.equal(historicalGpKeys.length,29);
assert.equal(new Set(historicalGpKeys).size,29);
assert.equal(documentedFskipShifts.length,13);
let sourceKeyClock=0,markedSkips=0;
const originalSourcePlainRunes=[];
for(let i=0;i<archive.originals.length;i++) {
  const entry=archive.originals[i];
  let out='';
  for(let pos=0;pos<entry.runic_text.length;pos++) {
    const glyph=entry.runic_text[pos];
    if(!RUNE.test(glyph))continue;
    if(i<4||i===6) {
      out+=glyph;
    } else {
      const cipherIdx=historicalReverseKeys.indexOf(glyph);
      assert.ok(cipherIdx>=0);
      const isMarkedF=pos>0&&entry.runic_text[pos-1]===':';
      const pIdx=isMarkedF?cipherIdx:
        (cipherIdx+documentedFskipShifts[sourceKeyClock%13])%29;
      out+=historicalGpKeys[pIdx];
      if(isMarkedF)markedSkips++;else sourceKeyClock++;
    }
  }
  originalSourcePlainRunes.push(out);
}
assert.deepEqual(originalSourcePlainRunes.map(x=>x.length),
  [187,207,192,169,226,93,89]);
assert.equal(markedSkips,2);
assert.equal(sourceKeyClock,317,'continuous 2014 KOAN clock across both JPEGs');
assert.equal(originalSourcePlainRunes[4].slice(0,5),'ᚱᛞᚫᚱᛗ',
  'source KOAN begins A-KOAN in historical GP script');

/** Map GP rune glyphs into a fixed historical 29-way cyclic register.
 * @param {string} runes
 * @returns {number[]}
 */
function historicalIndices(runes) {
  const out=[];
  for(const glyph of runes) {
    const index=historicalIndex.get(glyph);
    assert.notEqual(index,undefined);
    out.push(index);
  }
  return out;
}

/** Exhaustively find one arbitrary-secret 13-rune Vigenere period.
 * @param {number[]} c Full original LP2 unknown cipher
 * @param {number[]} p Fixed source-author plaintext
 * @param {1|-1} sign The source-plaintext sign in the cipher
 * @returns {{runes:number,cipherStart:number,sourceStart:number}}
 */
function maximumThirteenClock(c,p,sign) {
  const lag=13,n=c.length-lag,m=p.length-lag;
  const dyn=new Uint16Array(n+1);
  let longest=0,cipherStart=0,sourceStart=0;
  for(let j=0;j<m;j++) {
    const sourceDelta=(p[j+lag]-p[j]+29)%29;
    for(let i=n-1;i>=0;i--) {
      const cipherDelta=(c[i+lag]-c[i]+29)%29;
      const same=sign===1 ?
        cipherDelta===sourceDelta:(cipherDelta+sourceDelta)%29===0;
      dyn[i+1]=same?dyn[i]+1:0;
      if(dyn[i+1]>longest) {
        longest=dyn[i+1];
        cipherStart=i-longest+1;
        sourceStart=j-longest+1;
      }
    }
    dyn[0]=0;
  }
  return {runes:longest+lag,cipherStart,sourceStart};
}
const realUnknown=originalTape.match(/[\u16A0-\u16FF]/gu).slice(0,12956).join('');
const knownPlainAll=originalSourcePlainRunes.join('');
const cipherNums=historicalIndices(realUnknown);
const sourceNums=historicalIndices(knownPlainAll);
assert.equal(sourceNums.length,1163);
const period13Results={
  difference:maximumThirteenClock(cipherNums,sourceNums,1),
  sum:maximumThirteenClock(cipherNums,sourceNums,-1)
};
assert.deepEqual(period13Results,{
  difference:{runes:18,cipherStart:873,sourceStart:713},
  sum:{runes:17,cipherStart:4354,sourceStart:6}
});
const plantSource=sourceNums.slice(120,320);
const plantKey=documentedFskipShifts.map(x=>x%29);
const plantCipher=plantSource.map((p,i)=>(p+plantKey[i%13])%29);
const nativePositive=maximumThirteenClock(plantCipher,sourceNums,1);
assert.ok(nativePositive.runes>=200);
assert.equal(nativePositive.sourceStart,120);
console.log(JSON.stringify({
  historicalSourcePlaintextRunes:sourceNums.length,
  originalSourceGlyphCounts:originalSourcePlainRunes.map(x=>x.length),
  originalColonSkips:markedSkips,
  originalKeyAdvances:sourceKeyClock,
  originalHistoricalPeriod:13,
  allSecretPeriod13OriginalResults:period13Results,
  nativePositive,
  decision:'no original >=40-rune period-13 GP29 Vigenere source crib in either sign'
},null,2));


// Independently frozen running-key alternative: the seven 2014 Onion6
// plaintext pages themselves as one unmodified historical GP29 key.
// Source order is 10,11,12,13,107,167,229; no subset, shift, key offset or
// chapter reset chosen after reading candidate plaintext.
/** @param {number[]} values
 * @returns {number}
 */
function indexOfCoincidence(values) {
  const counts=new Array(29).fill(0);
  for(const v of values)counts[v]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/
    (values.length*(values.length-1));
}
const sourcedCorpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
let position=0;
const firstRuneByPage={};
for(const p of sourcedCorpus.pages) {
  firstRuneByPage[p.page]=position;
  position+=p.runic_count;
}
assert.equal(firstRuneByPage[3],729);
assert.equal(firstRuneByPage[16],3762);
assert.equal(firstRuneByPage[22],5375);
assert.equal(firstRuneByPage[40],9640);
assert.equal(firstRuneByPage[54],12648);
const originalWindows={
  p0to2:[0,729],
  p16to21:[3762,5375],
  p40to53:[9640,12648],
  allUnknown:[0,12956]
};
const historicalRunningKey={};
for(const direction of [1,-1]) {
  const plaintext=cipherNums.map((x,i)=>
    (x+direction*sourceNums[i%sourceNums.length]+29)%29);
  const record={};
  for(const [name,[a,b]] of Object.entries(originalWindows)) {
    record[name]=indexOfCoincidence(plaintext.slice(a,b));
  }
  historicalRunningKey[direction]=record;

  // Source-native solved 2014 prose plant: same stream encrypts and decrypts
  // with the identical key and a fixed first position, without source tuning.
  const plantedPlain=sourceNums.slice(0,400);
  const encrypted=plantedPlain.map((p,i)=>
    (p-direction*sourceNums[i%sourceNums.length]+29)%29);
  const replay=encrypted.map((c,i)=>
    (c+direction*sourceNums[i%sourceNums.length]+29)%29);
  assert.deepEqual(replay,plantedPlain);
}
const clearP57=sourcedCorpus.pages.find(p=>p.page===57);
assert.ok(clearP57);
const clearIoc=indexOfCoincidence(clearP57.indices);
assert.ok(clearIoc>0.06);
assert.ok(Object.values(historicalRunningKey).every(
  x=>x.p0to2<0.04&&x.p16to21<0.04&&x.p40to53<0.04));
console.log(JSON.stringify({
  sourceKeyLength:sourceNums.length,
  keySourcePageOrder:archive.originals.map(x=>x.page),
  fixedSourceKeyOriginalGP29Ioc:historicalRunningKey,
  genuinelyClearP57Ioc:clearIoc,
  decision:'source-ordered 2014 1163-rune uninterrupted repeated running-key inversion yields no GP-native prose'
},null,2));
