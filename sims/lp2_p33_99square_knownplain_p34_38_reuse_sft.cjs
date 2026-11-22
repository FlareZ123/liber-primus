'use strict';

/**
 * Known-plaintext attack against p33's 198=2×99 source-sized register.
 *
 * Hypothesis: the 99 authentic 2014 Stage7 magic-square integers are a
 * known plaintext encoded as 99 successive base841 GP-rune pairs at original
 * p33 (including two original p34 carry runes). Recover the COMPLETE unknown
 * period99 pair keystream without guessing its 99 entries, then predict
 * untouched 198-rune windows from p34..p38. Freeze:
 * - 2014 5×5 / 7×7 / 5×5 order, 99 literal integers modulo841;
 * - both common GP base29 high/low pair endian orders;
 * - historical Vigenere (C=P+K) and Beaufort (C=K−P);
 * - one full99-pair key reset per source page, no offset tuning.
 *
 * This is a concrete causal attempt to decrypt unknown LP2 text, with exact
 * full source input and native p57 original solved GP positive plants.
 *
 * Run on Windows 11 with Node22:
 * node sims/lp2_p33_99square_knownplain_p34_38_reuse_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const load = name => fs.readFileSync(path.join(root,name),'utf8').replace(/\r/g,'');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const pages = load('resources/liber-primus/lp2-transcription.txt').split('\n%\n');
const matrices = load('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(s=>s.trim().split(/\s+/).map(Number));

assert.equal(pages.length,57);
assert.deepEqual(matrices.map(x=>x.length),[25,49,25]);
const M=matrices.flat().map(x=>x%841);
assert.equal(M.length,99);
assert.ok(matrices[0].some(x=>x>840),'2014 literal values need a modulo841 fold');

const sections=pages[33].replace(/[\s/]/g,'').split('&');
assert.equal(sections.length,2);
const wordGroups=sections.map(s=>s.slice(s.indexOf('.')+1).split(/[-.]/).filter(Boolean));
assert.deepEqual(wordGroups.map(x=>x.length),[21,28]);
const words=wordGroups.flat();
assert.equal(words[48],'ᛒ');
assert.ok(pages[34].replace(/[\s/]/g,'').startsWith('ᛗᛒ-'));
words[48]+='ᛗᛒ';
const ix=new Map(corpus.runes.map((r,i)=>[r,i]));
const tape=[...words.join('')].map(r=>ix.get(r));
assert.equal(tape.length,198);
assert.equal(tape.every(x=>Number.isInteger(x)),true);

const holdouts=Array.from({length:5},(_,i)=>{
  const page=34+i, start=page===34?2:0;
  return {page, text:corpus.pages[page].indices.slice(start,start+198)};
});
assert.deepEqual(holdouts.map(x=>x.text.length),[198,198,198,198,198]);

const mod=n=>((n%841)+841)%841;

/** @param {number[]} v @param {'hi'|'lo'} endian */
function pack(v,endian){
  assert.equal(v.length,198);
  return Array.from({length:99},(_,i)=>
    endian==='hi'?v[2*i]*29+v[2*i+1]:v[2*i]+v[2*i+1]*29);
}

/** @param {number[]} v @param {'hi'|'lo'} endian */
function unpack(v,endian){
  return v.flatMap(x=>{
    const hi=Math.floor(x/29),lo=x%29;
    return endian==='hi'?[hi,lo]:[lo,hi];
  });
}

/**
 * Original p33 known plaintext and ciphertext define all 99 secret pad entries.
 * @param {number[]} c Known original p33 packed ciphertext
 * @param {'vigenere'|'beaufort'} mode
 * @returns {number[]}
 */
function recoverKey(c,mode){
  return c.map((value,i)=>mod(mode==='vigenere'?value-M[i]:value+M[i]));
}

/** @param {number[]} key @param {number[]} plain @param {'vigenere'|'beaufort'} mode */
function encrypt(key,plain,mode){
  return plain.map((p,i)=>mod(mode==='vigenere'?p+key[i]:key[i]-p));
}

/** @param {number[]} key @param {number[]} cipher @param {'vigenere'|'beaufort'} mode */
function decrypt(key,cipher,mode){
  return cipher.map((cc,i)=>mod(mode==='vigenere'?cc-key[i]:key[i]-cc));
}

function ioc(v){
 const f=Array(29).fill(0);
 for(const x of v)f[x]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
}
const GP=v=>v.slice(0,24).map(x=>corpus.translit[x]).join('-');
const control=Array.from({length:198},(_,i)=>corpus.pages[57].indices[i%95]);
assert.equal(corpus.pages[57].indices.length,95);
assert.ok(ioc(control)>0.05);

console.log('Known 2014 99 squares matched to 198 original p33 GP29 complete-word runes.');
console.log('Windows Node22 five untouched p34..p38 holdouts; no letter or key fitted to holdouts.');
console.log('Historical plaintext integer >840 is explicitly folded modulo841.');
for(const endian of ['hi','lo'])for(const mode of ['vigenere','beaufort']){
  const cipher33=pack(tape,endian),key=recoverKey(cipher33,mode);
  assert.deepEqual(encrypt(key,M,mode),cipher33,'Authentic p33 known-plaintext cipher replay');
  const positive=encrypt(key,pack(control,endian),mode);
  assert.deepEqual(unpack(decrypt(key,positive,mode),endian),control,
    'Full source-native solved GP plant must recover 198/198');

  for(const h of holdouts){
    const plain=unpack(decrypt(key,pack(h.text,endian),mode),endian);
    assert.deepEqual(unpack(encrypt(key,pack(plain,endian),mode),endian),h.text,
      'Untouched full original cipher re-encryption');
    assert.ok(ioc(plain)<0.04,'No unguessed original native-GP plaintext');
    console.log(`mode=${mode},endian=${endian},physical=p${h.page},IoC=${ioc(plain).toFixed(9)},first24=${GP(plain)}`);
  }
}
console.log('PASS: source recovered all four distinct 99-key variants; 20/20 original 198-rune holdout replay, 4/4 198-rune native-GP solved plants; 0/20 plaintext.');
