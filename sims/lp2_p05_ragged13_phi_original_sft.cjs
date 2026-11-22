'use strict';
/**
 * Source-native hypothesis: the 13 verbal cells of the solved LP1 p05 square
 * supply a ragged 13-column width profile (their exact 76 GP symbols), and
 * their GP prime sums supply a column reading order, for moth-linked LP2 p55.
 * Apply the already-solved LP2 p56 phi(prime) / transparent-plaintext-F inverse
 * after undoing that source-length-selected transposition. This is a bounded
 * hypothesis, not an authenticated LP2 decoding instruction.
 *
 * Node.js 22, CommonJS, single-file SFT, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { trainNativeGP, languageScore } =
  require('./historical_solve_path_transfer.cjs');
const { plaintextWords } =
  require('./authentic_decryption_regression.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const punctuation = JSON.parse(read('resources/liber-primus/lp2-punctuation-identity.json'));
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const lines = lp1.split(/\r?\n/);
const rowStart = lines.findIndex(s => s.startsWith('272-138-'));
assert.ok(rowStart >= 0);
const tokens = lines.slice(rowStart, rowStart + 5)
  .flatMap(s => s.replace(/\/$/, '').split('-'));
assert.equal(tokens.length, 25);
const words = tokens.filter(x => !/^\d+$/.test(x));
assert.equal(words.length, 13);
const indices = words.map(w => [...w].map(r => {
  assert.ok(alphabet.has(r)); return alphabet.get(r);
}));
const widths = indices.map(x => x.length);
const sums = indices.map(x => x.reduce((s, n) => s + gp.prime[n], 0));
assert.deepEqual(widths, [7,6,7,4,6,7,4,6,6,4,8,6,5]);
assert.deepEqual(sums, [341,366,199,130,320,245,91,226,320,130,199,366,341]);
assert.equal(widths.reduce((s, n) => s + n, 0), 76);
const p55 = gp.pages.find(x => x.page === 55).indices;
assert.equal(p55.length, 76);
assert.deepEqual(p55.flatMap((c, i) => c === 0 ? [i] : []), [15,25,41]);
const mark = punctuation.events.find(x => x.page === 55 &&
  x.rune_offset === 12956 && x.symbol === '⁜');
assert.equal(mark.large_mark.dot_count, 13);

const keys = [], composite = new Uint8Array(180000);
for (let p = 2; p < composite.length && keys.length < 9000; p++) {
  if (composite[p]) continue;
  keys.push((p - 1) % 29);
  if (p * p < composite.length)
    for (let n = p * p; n < composite.length; n += p) composite[n] = 1;
}
assert.equal(keys.length, 9000);
const mod = n => (n % 29 + 29) % 29;
const model = trainNativeGP(read('resources/control/emerson_essays_2944.txt'));
const p57 = gp.pages.find(x => x.page === 57).indices;
const control = p57.slice(0, 76);

/**
 * Ragged-column source-position permutation. Each original column c has
 * exactly widths[c] cells. The source key sorts the columns by the exact
 * original p05 GP-prime word-cell sum, with stable ties. 
 * @param {boolean} descending
 * @returns {number[]} output source indices for a normal row-major input
 */
function columnPermutation(descending) {
  const table = Array.from({length:Math.max(...widths)},
    () => Array(widths.length).fill(-1));
  let k=0;
  for (let r=0;r<table.length;r++)
    for (let c=0;c<widths.length;c++)
      if (r<widths[c]) table[r][c]=k++;
  assert.equal(k,76);
  const cols = widths.map((w,c)=>c).sort((a,b)=>
    (descending ? sums[b]-sums[a] : sums[a]-sums[b]) || a-b);
  return cols.flatMap(c => table.slice(0,widths[c]).map(row=>row[c]));
}

/**
 * @param {number[]} input
 * @param {number[]} p
 * @param {boolean} inverse
 * @returns {number[]}
 */
function trans(input,p,inverse) {
  const out=Array(input.length);
  for (let i=0;i<input.length;i++)
    if (inverse) out[p[i]]=input[i];
    else out[i]=input[p[i]];
  return out;
}

/** Actual F-interrupted forward encoder from solved p56. 
 * @param {number[]} plain
 * @param {number} start
 * @returns {number[]}
 */
function encrypt(plain,start) {
  let used=0;
  return plain.map(x=>x===0?0:mod(x+keys[start+used++]));
}

/**
 * Exhaust exactly all 2^numberOfCiphertextFs potential bypass choices.
 * @param {number[]} cipher
 * @param {number} start
 * @returns {number[][]}
 */
function decode(cipher,start) {
  const f= cipher.flatMap((x,i)=>x===0?[i]:[]);
  const outputs=[];
  for(let mask=0;mask<(1<<f.length);mask++){
    let used=0,bit=0,valid=true;
    const plain=[];
    for(const c of cipher){
      const bypass=c===0 && ((mask>>>bit)&1)===1;
      if(c===0)bit++;
      const p=bypass?0:mod(c-keys[start+used++]);
      if(!bypass&&p===0){valid=false;break;}
      plain.push(p);
    }
    if(valid){assert.deepEqual(encrypt(plain,start),cipher);outputs.push(plain);}
  }
  return outputs;
}

/** @param {number[]} text @returns {number} */
function ioc(text) {
  const n=Array(29).fill(0);
  for(const c of text)n[c]++;
  return n.reduce((s,v)=>s+v*(v-1),0)/(text.length*(text.length-1));
}
const actual56=gp.pages.find(x=>x.page===56).indices;
const known56=plaintextWords('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE').flat();
assert.deepEqual(encrypt(known56,0),actual56);
assert.ok(decode(actual56,0).some(p=>p.join(',')===known56.join(',')));
console.log('Actual solved p56 exact 85/85 plus F-bypass: PASS');

const results=[];
for (const descending of [false,true]) {
  const perm=columnPermutation(descending);
  assert.deepEqual([...perm].sort((a,b)=>a-b),Array.from({length:76},(_,i)=>i));
  for(const inverse of [false,true]){
    const changed=trans(p55,perm,inverse);
    assert.deepEqual(trans(changed,perm,!inverse),p55);
    // Real native GP control: first 76 solved p57 runes, encrypted through
    // original p56 cipher, transposed, then exactly recovered with known key.
    const planted=trans(encrypt(control,167),perm,inverse);
    assert.deepEqual(trans(planted,perm,!inverse),encrypt(control,167));
    assert.ok(decode(trans(planted,perm,!inverse),167)
      .some(p=>p.join(',')===control.join(',')));
    let count=0,best=null;
    for(let start=0;start<5000;start++){
      const options=decode(changed,start);
      count+=options.length;
      for(const plain of options){
        const score=languageScore(plain,model);
        if(!best||score>best.score)best={score,start,ioc:ioc(plain),
          opening:plain.slice(0,38).map(x=>gp.translit[x]).join(' ')};
      }
    }
    const result={descending,inverse,originalRunes:76,
      firstOriginalSourceRune:gp.translit[p55[0]],validFPaths:count,best};
    console.log(JSON.stringify(result));
    results.push(result);
  }
}
assert.equal(results.length,4);
assert.ok(results.every(x=>x.best && x.validFPaths>0));
console.log(JSON.stringify({
  solvedP56Control:languageScore(known56,model),
  nativeP57Control:languageScore(control,model),
  originalUntransposed:languageScore(p55,model),
  widths, wordSums:sums, testedPrimeStartIndices:'0..4999',
  originalCandidates:results,
  conclusion:'Bounded irregular-source-word-width 13-column plus exact '+
    'phi-prime and optional transparent-F original test. No source '+
    'authorizes this operation; full English plaintext requires '+
    'genuinely readable output plus independent holdout.'
},null,2));
