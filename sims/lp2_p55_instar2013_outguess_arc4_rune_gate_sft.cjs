'use strict';

/**
 * Source-constrained exploratory original-LP2 p55 rune-layer ARC4 gate.
 * The 2013 music title "The Instar Emergence" and historical OutGuess v0.4
 * ARC4 Encryption-key schedule select one source-visible KDF/password.
 * The extra byte%29 additive rune consumer is a hypothesis, not Cicada-authored.
 *
 * Reproduce with Node.js 22:
 * node sims/lp2_p55_instar2013_outguess_arc4_rune_gate_sft.cjs
 *
 * Read only, exact corpus, 10,000 deterministic wrong-password controls,
 * independent p54 and known-clear p57 statistical/lexical controls.
 */
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const previous = corpus.pages[54].indices;
const terminal = corpus.pages[55].indices;
const nativeClear = corpus.pages[57].indices;
const password = 'The Instar Emergence';
assert.deepEqual([previous.length, terminal.length, nativeClear.length], [232, 76, 95]);
assert.equal(corpus.translit.length, 29);

/**
 * Exact OutGuess v0.4 arc4_initkey("Encryption", key) and arc4_getbyte stream.
 * This KDF first MD5-hashes the ASCII stream label concatenated with UTF-8 key.
 * @param {string} key
 * @param {number} count
 * @returns {number[]}
 */
function outguessBytes(key, count) {
  const digest = createHash('md5').update(Buffer.from('Encryption' + key)).digest();
  const s = Array.from({length:256}, (_, i) => i);
  let i = 255;
  let j = 0;
  for (let k = 0; k < 256; k++) {
    i = (i + 1) & 255;
    j = (j + s[i] + digest[k & 15]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const result = [];
  for (let k = 0; k < count; k++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    result.push(s[(s[i] + s[j]) & 255]);
  }
  return result;
}
const mod = (x, n = 29) => (x % n + n) % n;
/** @param {number[]} input @param {number[]} key @returns {number[]} */
const decode = (input, key) => input.map((c, i) => mod(c - key[i] % 29));
/** @param {number[]} input @param {number[]} key @returns {number[]} */
const encode = (input, key) => input.map((p, i) => mod(p + key[i] % 29));
/** @param {number[]} input @returns {number} */
function coincidence(input) {
  const h = Array(29).fill(0);
  for (const value of input) h[value]++;
  return h.reduce((sum, n) => sum + n * (n - 1), 0) / (input.length * (input.length - 1));
}

const key = outguessBytes(password, previous.length + terminal.length);
const first = decode(terminal, key);
const predecessor = decode(previous, key);
const combined = decode([...previous, ...terminal], key);
const continuousTerminal = combined.slice(previous.length);
assert.deepEqual(encode(first, key), terminal);
assert.deepEqual(encode(predecessor, key), previous);
assert.deepEqual(encode(combined, key), [...previous, ...terminal]);
assert.deepEqual(first.slice(0, 10), [26,8,0,6,3,6,8,24,9,0]);
assert.equal(coincidence(first), 0.05473684210526316);
assert.equal(coincidence(continuousTerminal), 0.03368421052631579);
assert.equal(coincidence(terminal), 0.037894736842105266);

// The solved PARABLE explicitly says to shed word circumferences.
// Source-native p55 has 17 words. Test both operation orders and whether
// the elevated coincidence survives in the 43-symbol interiors.
const transcription = read('resources/lp2-transcription.txt').split('%');
assert.equal(transcription.length,57);
const printed = transcription[54].replace(/[\/\r\n]/g,'')
  .match(/[\u16A0-\u16FF]+/gu).map(word => [...word]);
assert.equal(printed.length,17);
const wordLengths = printed.map(word => word.length);
assert.deepEqual(wordLengths,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const sourceFlattened = printed.flat().map(rune => corpus.runes.indexOf(rune));
assert.deepEqual(sourceFlattened,terminal);
let at=0;
const innerIndices=[],shellIndices=[];
for(const n of wordLengths) {
  shellIndices.push(at);
  if(n>1)shellIndices.push(at+n-1);
  for(let i=1;i<n-1;i++)innerIndices.push(at+i);
  at+=n;
}
assert.deepEqual([innerIndices.length,shellIndices.length],[43,33]);
const rawInner=innerIndices.map(i=>terminal[i]);
const arc4ThenInner=innerIndices.map(i=>first[i]);
const arc4ThenShell=shellIndices.map(i=>first[i]);
const shedThenArc4=decode(rawInner,outguessBytes(password,rawInner.length));
assert.equal(coincidence(arc4ThenInner),0.047619047619047616);
assert.equal(coincidence(arc4ThenShell),0.056818181818181816);
assert.equal(coincidence(shedThenArc4),0.035437430786267994);

// Exactly one frozen native-GP signal: the p57 clear text encoded with this
// source-derived historical key is recovered symbol-for-symbol, including F.
const nativePad = outguessBytes(password, nativeClear.length);
const nativePlant = encode(nativeClear, nativePad);
assert.deepEqual(decode(nativePlant, nativePad), nativeClear);

// An exact SHA256-keyed null: unrelated random passwords, each hashed to a
// 64-character hex string. No PRNG key stream approximation or hidden tuning.
let above = 0, mean = 0, max = 0;
for (let t = 0; t < 10000; t++) {
  const wrong = createHash('sha256').update(String(t).padStart(5,'0') + ':20261117').digest('hex');
  const plaintext = decode(terminal, outguessBytes(wrong, terminal.length));
  const value = coincidence(plaintext);
  above += Number(value >= coincidence(first));
  mean += value;
  max = Math.max(max, value);
}
assert.equal(above, 1);

// Source-location specificity: hold the exact 2013 title and key clock
// fixed, slide one 76-rune window only within genuine original physical pages.
// This is a source-layout diagnostic, not a global discovery probability.
const terminalWindowPad=outguessBytes(password,76);
let originalWindows=0, windowsAtLeast=0, otherMaxIoc=0;
let otherMaxLocation={page:-1,start:-1};
for(const page of corpus.pages.filter(p=>p.page<=55&&p.indices.length>=76)){
  for(let start=0;start+76<=page.indices.length;start++){
    const plaintext=decode(page.indices.slice(start,start+76),terminalWindowPad);
    const value=coincidence(plaintext);
    originalWindows++;
    windowsAtLeast+=Number(value>=coincidence(first));
    if(page.page!==55 && value>otherMaxIoc){
      otherMaxIoc=value;otherMaxLocation={page:page.page,start};
    }
  }
}
assert.deepEqual([originalWindows,windowsAtLeast],[8840,1]);

// Native GP-English tetragram language check. Use the independently supplied
// source book, not words selected to fit the candidate.
const training = read('resources/control/shakespeare_first300k.txt');
assert.ok(training.length >= 300000);
const tokens = corpus.translit.map((token, index) => ({token,index}))
  .sort((a,b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function tokenize(text) {
  const words = text.toUpperCase()
    .replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C')
    .replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA')
    .match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) {
    for (let j=0;j<word.length;) {
      const item = tokens.find(x => word.startsWith(x.token, j));
      if (item) { result.push(item.index);j+=item.token.length; }
      else j++;
    }
  }
  return result;
}
const trainingRunes = tokenize(training);
assert.ok(trainingRunes.length > 200000);
/** @param {number[]} data @param {number} size */
function languageModel(data,size) {
  const counts = new Map();
  for (let i=0;i+size<=data.length;i++) {
    const key = data.slice(i,i+size).join(',');
    counts.set(key, (counts.get(key)||0) + 1);
  }
  return counts;
}
const tri = languageModel(trainingRunes,3);
/** @param {number[]} values @returns {number} */
function score3(values) {
  let score=0;
  for(let i=0;i+3<=values.length;i++) {
    score += Math.log(tri.get(values.slice(i,i+3).join(','))||0.05);
  }
  return score/(values.length-2);
}
const sourceClearScore=score3(nativeClear);
const candidateScore=score3(first);
assert.ok(candidateScore < sourceClearScore-4.0);

// One simple source-shaped potential rescue is 76=4x19. Test fixed row/col
// rearrangements and all 29 post-key Caesar offsets, reporting the best.
// This is a post-discovery diagnostic, not a sourced second-layer cipher.
function rearrange(values, rows, cols, orientation) {
  assert.equal(rows*cols, values.length);
  if (orientation === 'direct') return values.slice();
  if (orientation === 'reverse') return values.slice().reverse();
  const out = [];
  for (let i=0;i<values.length;i++) {
    const k=orientation==='col-read'
      ? (i%cols)*rows+Math.floor(i/cols)
      : Math.floor(i/rows)+(i%rows)*cols;
    out.push(values[k]);
  }
  return out;
}
let best = {score:-Infinity};
for (const [rows,cols] of [[4,19],[19,4]]) {
  for (const orientation of ['direct','reverse','col-read','row-read']) {
    for(let shift=0;shift<29;shift++) {
      const values=rearrange(first,rows,cols,orientation).map(c=>mod(c+shift));
      const score=score3(values);
      if(score>best.score)best={rows,cols,orientation,shift,score};
    }
  }
}
assert.ok(best.score < sourceClearScore-4.0);
console.log(JSON.stringify({
  hypothesis: 'Exact 2013 title -> authentic OutGuess Encryption ARC4 -> byte modulo29 -> direct terminal GP29 additive inverse',
  original: {terminalRunes:76,terminalIoc:coincidence(terminal),
    priorPageRunes:232, priorPageIoc:coincidence(previous)},
  candidate: {terminalIoc:coincidence(first),
    priorPageIoc:coincidence(predecessor),
    entire308Ioc:coincidence(combined),
    terminalIocWhenClockContinuesFromP54:coincidence(continuousTerminal),
    decodedFirst40: first.slice(0,40).map(i=>corpus.translit[i]).join('-'),
    gp3gramScorePerRune:candidateScore},
  originalShedCircumferenceOrder:{sourceWords:17,interiorRunes:43,shellRunes:33,
    rawInteriorIoc:coincidence(rawInner),arc4ThenShedIoc:coincidence(arc4ThenInner),
    arc4ThenShellIoc:coincidence(arc4ThenShell),shedThenArc4Ioc:coincidence(shedThenArc4)},
  sourceNativeControl: {p57RerencRoundTrip:true,
    originalP57Ioc:coincidence(nativeClear),
    nativeP57Gp3gramScorePerRune:sourceClearScore},
  matchedWrongPasswordControl:{trials:10000,seed:'sha256(00000:20261117)..sha256(09999:20261117)',
    countAtLeastCandidate:above,addOneTail:(above+1)/10001,meanIoc:mean/10000,maxIoc:max},
  originalSourceLocationCheck:{original76RuneWindows:originalWindows,
    atLeastP55Ioc:windowsAtLeast, otherWindowMaximum:otherMaxIoc,
    otherWindowLocation:otherMaxLocation},
  simple4x19TransposeAndCaesarBest:best,
  decision: 'Original p55 IoC coincidence is striking but neither GP English nor p54 holdout supports direct plaintext; any second layer lacks a source-selected operation'
}, null, 2));
