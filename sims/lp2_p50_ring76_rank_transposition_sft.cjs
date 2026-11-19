'use strict';
/**
 * Original LP2 table-perimeter rank-transposition gate (CJS SFT).
 * Read the 32x8 printed grid and authentic p55 rune indices from pinned resources.
 * Enumerate all 76 starts x 2 directions x 2 ranks x 2 permutation senses
 * x 3 unshifted/additive choices x 2 operation orders.
 * A correct synthetic decoder must re-encrypt. A real plaintext also needs
 * independent key evidence and original-language consistency.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', p), 'utf8'));
const corpus = read('lp2-corpus.json');
const sourceGrid = read('base60-grid.json');
const sourceText = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const alphabet = sourceGrid.alphabet;
const table = sourceGrid.rows.flat().map(token => alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]));
const cipher = corpus.pages.find(page => page.page === 55).indices;
const control = corpus.pages.find(page => page.page === 57).indices.slice(0, 76);
assert.equal(table.length, 256);
assert.equal(cipher.length, 76);
assert.equal(control.length, 76);

const ring = [];
for (let x = 0; x < 8; x++) ring.push(x);
for (let y = 1; y < 32; y++) ring.push(8 * y + 7);
for (let x = 6; x >= 0; x--) ring.push(31 * 8 + x);
for (let y = 30; y > 0; y--) ring.push(y * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);

const names = corpus.translit;
const labels = new Map(names.map((name, i) => [name, i]));
const patterns = [...names].sort((a, b) => b.length - a.length);
const aliases = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
/** @param {string} s @returns {number[]} */
function encode(s) {
  const words = s.toUpperCase().replace(/#[^\n]*/g, ' ')
    .replace(/\[.*?\]/g, ' ').match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    let i = 0;
    while (i < word.length) {
      const pattern = patterns.find(p => word.startsWith(p, i));
      if (pattern) {
        out.push(labels.get(pattern));
        i += pattern.length;
      } else {
        const rune = labels.get(aliases[word[i]] || word[i]);
        if (rune !== undefined) out.push(rune);
        i++;
      }
    }
  }
  return out;
}

const native = encode(sourceText);
const triples = new Map();
const bigrams = new Map();
for (let i = 2; i < native.length; i++) {
  const context = 29 * native[i - 2] + native[i - 1];
  const triple = 29 * context + native[i];
  triples.set(triple, (triples.get(triple) || 0) + 1);
  bigrams.set(context, (bigrams.get(context) || 0) + 1);
}
/** @param {number[]} seq @returns {number} */
function score(seq) {
  let sum = 0;
  for (let i = 2; i < seq.length; i++) {
    const context = 29 * seq[i - 2] + seq[i - 1];
    sum += Math.log((triples.get(29 * context + seq[i]) || 0) + 0.2);
    sum -= Math.log((bigrams.get(context) || 0) + 29 * 0.2);
  }
  return sum / (seq.length - 2);
}
const windows = [];
for (let i = 0; i + 76 <= native.length; i++) windows.push(score(native.slice(i, i + 76)));
windows.sort((a, b) => a - b);

/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} rank @param {boolean} inverse @returns {number[]} */
function permute(a, rank, inverse) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    if (inverse) out[rank[i]] = a[i];
    else out[i] = a[rank[i]];
  }
  return out;
}
/** @param {number[]} a @param {number[]} rank @param {boolean} inverse @returns {number[]} */
function unpermute(a, rank, inverse) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    if (inverse) out[i] = a[rank[i]];
    else out[rank[i]] = a[i];
  }
  return out;
}
/** @param {number[]} data @param {number[]} key @param {number[]} rank @param {number} sign @param {boolean} inverse @param {boolean} before @returns {number[]} */
function decode(data, key, rank, sign, inverse, before) {
  const shifted = before ? data.map((v, i) => mod(v + sign * key[i])) : data;
  const out = permute(shifted, rank, inverse);
  return before ? out : out.map((v, i) => mod(v + sign * key[i]));
}
/** @param {number[]} data @param {number[]} key @param {number[]} rank @param {number} sign @param {boolean} inverse @param {boolean} before @returns {number[]} */
function encodeCipher(data, key, rank, sign, inverse, before) {
  const pre = before ? data : data.map((v, i) => mod(v - sign * key[i]));
  const out = unpermute(pre, rank, inverse);
  return before ? out.map((v, i) => mod(v - sign * key[i])) : out;
}
const candidates = [];
for (const direction of [1, -1]) {
  for (let start = 0; start < 76; start++) {
    const order = Array.from({ length: 76 }, (_, i) => ring[(start + direction * i + 76 * 100) % 76]);
    const key = order.map(pos => table[pos]);
    for (const asc of [true, false]) {
      const rank = Array.from({ length: 76 }, (_, i) => i)
        .sort((a, b) => (asc ? key[a] - key[b] : key[b] - key[a]) || a - b);
      for (const inverse of [false, true]) {
        for (const sign of [-1, 0, 1]) {
          for (const before of [true, false]) {
            const output = decode(cipher, key, rank, sign, inverse, before);
            assert.deepEqual(encodeCipher(output, key, rank, sign, inverse, before), cipher);
            assert.deepEqual(decode(encodeCipher(control, key, rank, sign, inverse, before), key, rank, sign, inverse, before), control);
            candidates.push({ direction, start, asc, inverse, sign, before, score: score(output), output });
          }
        }
      }
    }
  }
}
candidates.sort((a, b) => b.score - a.score);
assert.equal(candidates.length, 3648);
assert(Math.abs(candidates[0].score - (-3.3131541950496324)) < 1e-10);
assert(Math.abs(windows[0] - (-2.3000292222494285)) < 1e-10);
console.log(JSON.stringify({
  family: 'p50-p55 ring76 stable-value rank transposition plus direct mod29 byte shift',
  candidates: candidates.length,
  best: { ...candidates[0], output: candidates[0].output.map(i => names[i]).join('-') },
  bestPure: candidates.find(v => v.sign === 0).score,
  nativeWindows: { n: windows.length, min: windows[0], q01: windows[Math.floor(windows.length * 0.01)] },
  nativeSolvedPage57: score(control),
  tested: 'Each key starts at every ring cell in either direction; all synthetic-positive and exact original inverse round trips passed.'
}, null, 2));

/* Fixed carry-aligned nested-shed gate (19 Nov 2026); no free ring search. */
const transcription = fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const p55Text = transcription.split(/^\s*%\s*$/m)[55];
const p55Tokens = p55Text.replace(/[\/\r\n ]/g,'').split(/[-.&$§]+/).filter(Boolean)
  .map(w=>Array.from(w).map(ch=>corpus.runes.indexOf(ch)).filter(i=>i>=0)).filter(w=>w.length);
assert.deepEqual(p55Tokens.map(w=>w.length),[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const lengths=p55Tokens.slice(1).map(w=>w.length);
const splitBy=(items,sizes)=>{let n=0;const out=sizes.map(k=>{const a=items.slice(n,n+k);n+=k;return a;});assert.equal(n,items.length);return out;};
const peel=words=>words.map(w=>w.length>2?w.slice(1,-1):[]);
const p55Inner=peel(p55Tokens.slice(1)),p55Core=peel(p55Inner);
const p55Inner43=p55Inner.flat(),p55Core23=p55Core.flat();
const p50RingTokens=ring.map(i=>sourceGrid.rows.flat()[i]);
assert.equal(p50RingTokens.length,76);
const p50Inner=peel(splitBy(p50RingTokens.slice(1),lengths));
const p50Core=peel(p50Inner);
const p50Inner43=p50Inner.flat(),p50Core23=p50Core.flat();
assert.equal(p55Inner43.length,43);assert.equal(p55Core23.length,23);
assert.equal(p50Inner43.length,43);assert.equal(p50Core23.length,23);
const d60=alphabet,d59=alphabet.replace('f','');
const decodeToken=(t,d)=>{const a=d.indexOf(t[0]),b=d.indexOf(t[1]);assert(a>=0&&b>=0,'bad token '+t);return a*d.length+b;};
const modN=(x,n)=>(x%n+n)%n;
const renderGP=v=>v.map(x=>names[x]).join('');
const direct=[];
for(const [radix,d] of [[59,d59],[60,d60]]) for(const [depth,cipher,tokens] of [[43,p55Inner43,p50Inner43],[23,p55Core23,p50Core23]]) {
  const key=tokens.map(t=>decodeToken(t,d)%29);
  for(const sign of [-1,1]) direct.push({radix,depth,sign,text:renderGP(cipher.map((v,i)=>mod(v+sign*key[i])))});
}
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const sb=signed.slice(signed.indexOf('-----BEGIN PGP SIGNED MESSAGE-----')+35,signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
const signedWords=(sb.split(/\r?\n/).filter(x=>!/^Hash:/i.test(x)).join(' ').match(/(?<![A-Za-z0-9])[A-Za-z]+(?:-[A-Za-z]+)?(?![A-Za-z0-9])/g)||[]).map(w=>w.replace(/-/g,'').toLowerCase());
assert.equal(signedWords.length,43);
const bookMap=[];
for(const [radix,d] of [[59,d59],[60,d60]]) {
  const nums=p50Inner43.map(t=>decodeToken(t,d));
  for(const oneBased of [false,true]) for(const reverse of [false,true]) {
    let text='';
    for(let i=0;i<43;i++) {
      const wi=modN((reverse?p55Inner43[i]:nums[i])-(oneBased?1:0),43);
      const li=modN((reverse?nums[i]:p55Inner43[i])-(oneBased?1:0),signedWords[wi].length);
      text+=signedWords[wi][li];
    }
    bookMap.push({radix,oneBased,reverse,text});
  }
}
const patterns=names.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length);
function gpWord(word) {
  const s=word.toUpperCase().replace(/QU/g,'CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S').replace(/[^A-Z]/g,'');
  const out=[];
  for(let i=0;i<s.length;) {
    if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const hit=patterns.find(p=>s.startsWith(p.text,i));assert(hit,'unmapped '+word);out.push(hit.index);i+=hit.text.length;
  }
  return out;
}
const gp0=signedWords.map(w=>gpWord(w).reduce((a,b)=>a+b,0)%29);
const gp0Key=[-1,1].map(sign=>({sign,text:renderGP(p55Inner43.map((v,i)=>mod(v+sign*gp0[i])))}));
const r43=p50Inner43.map(t=>decodeToken(t,d59)%43),r23=p50Core23.map(t=>decodeToken(t,d59)%23);
const dlog5=v=>{if(v===0)return null;let x=1;for(let i=0;i<22;i++){if(x===v)return i;x=x*5%23;}return null;};
console.log(JSON.stringify({
  family:'fixed carry-aligned p50 ring76 / p55 nested-shed 75->43->23',
  p55Lengths:p55Tokens.map(w=>w.length),droppedRingCell:p50RingTokens[0],
  p50Inner43,p50Core23,p55Inner43:renderGP(p55Inner43),p55Core23:renderGP(p55Core23),
  direct,bookMap,signedWords,gp0,gp0Key,
  residue43Unique:new Set(r43).size,residue23Unique:new Set(r23).size,
  residue23Zeros:r23.filter(v=>v===0).length,dlog5Undefined:r23.map(dlog5).filter(v=>v===null).length
},null,2));
