'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 29;

/**
 * @param {number} a
 * @param {number} e
 * @param {number} m
 * @returns {number}
 */
function modPow(a, e, m) {
  let r = 1n;
  let b = BigInt(a % m);
  let n = BigInt(e);
  const mm = BigInt(m);
  while (n > 0n) {
    if ((n & 1n) === 1n) r = (r * b) % mm;
    b = (b * b) % mm;
    n >>= 1n;
  }
  return Number(r);
}

/**
 * @param {[number, number, number, number]} k
 * @returns {[number, number, number, number]}
 */
function H4(k) {
  const [k0,k1,k2,k3] = k;
  return [
    (k0-k3+MOD)%MOD,
    (k1-k2+MOD)%MOD,
    (k1+k2)%MOD,
    (k0+k3)%MOD
  ];
}

/**
 * @param {[number, number, number, number]} h
 * @returns {[number, number, number, number]}
 */
function H4Inv(h) {
  const [h0,h1,h2,h3] = h;
  const inv2 = 15; // 2^-1 mod29
  return [
    ((h0+h3)*inv2)%MOD,
    ((h1+h2)*inv2)%MOD,
    ((h2-h1+MOD)*inv2)%MOD,
    ((h3-h0+MOD)*inv2)%MOD
  ];
}

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const transcription = fs.readFileSync(path.join(root,'resources','liber-primus','lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const signedSource = fs.readFileSync(path.join(root,'resources','historical','cicada2016-4gq25-outguess.asc'),'utf8').replace(/\r/g,'');
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const gpTokens = corpus.translit.map((symbol,value)=>({symbol,value})).sort((l,r)=>r.symbol.length-l.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

/**
 * @returns {Array<{
 *   startPage:number,startOffset:number,endPage:number,endOffset:number,
 *   values:number[]
 * }>}
 */
function parseWords() {
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  const close = () => {
    if (runes.length === 0) return;
    words.push({
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
      values: runes.map((rune) => runeIndex.get(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  };

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      close();
    } else if (ch === "%") {
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

const canonicalWords = parseWords();
function pageWords(page) {
  return canonicalWords.filter(w=>w.startPage===page && w.endPage===page).map(w=>({start:w.startOffset,len:w.values.length,sum:w.values.reduce((a,b)=>a+b,0),inds:w.values}));
}
for(let p=0;p<58;p++) assert.equal(corpus.pages[p].indices.length,corpus.pages[p].runic_count);

const p25Object = corpus.pages[25].indices.slice(144,150);
assert.deepEqual(p25Object, [18,3,20,10,11,16]);
assert.deepEqual(
  [(p25Object[0]-p25Object[5]+MOD)%MOD,(p25Object[0]+p25Object[5])%MOD],
  [2,5]
);

const e = 3;
const reciprocalExponent = 27;
const transformed = [
  modPow(p25Object[0], e, MOD),
  ...p25Object.slice(1).map((x)=>modPow(x, reciprocalExponent, MOD))
];
assert.deepEqual(transformed, [3,10,16,3,8,20]);

const cuts = [];
for (let cut=1; cut<transformed.length; cut++) {
  cuts.push([
    transformed.slice(0,cut).reduce((a,b)=>a+b,0),
    transformed.slice(cut).reduce((a,b)=>a+b,0)
  ]);
}
assert.deepEqual(cuts, [[3,57],[13,47],[29,31],[32,28],[40,20]]);
assert.deepEqual(cuts[4], [40,20]);

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/).filter(w=>/^[A-Za-z]+$/.test(w)).map(w=>({word:w.toUpperCase(),gp:gp(w)}));
assert.equal(signed.length,43);
const targetStates = new Map(signed.map((w,i)=>[i,w]));
assert.deepEqual(signed[20],{word:"MEANING",gp:[19,28,9,21]});
assert.deepEqual(signed[29],{word:"DIRECTION",gp:[23,10,4,18,5,16,27,9]});

const inRange = [...new Set(cuts.flat().filter((x)=>targetStates.has(x)))].sort((a,b)=>a-b);
assert.deepEqual(inRange, [3,13,20,28,29,31,32,40]);

const receiverRows = [];
for (const n of inRange) {
  const target = targetStates.get(n);
  const len = target.gp.length;
  const sum = target.gp.reduce((a,b)=>a+b,0);
  const matches = pageWords(n).filter((w)=>w.len===len && w.sum===sum);
  receiverRows.push({index:n,word:target.word,len,sum,matches});
}

const hits = receiverRows.filter((r)=>r.matches.length>0);
assert.equal(hits.length,1);
assert.equal(hits[0].index,40);
assert.equal(hits[0].word,'PATHS');
assert.equal(hits[0].matches.length,1);
assert.deepEqual(hits[0].matches[0],{
  start:71,
  len:4,
  sum:54,
  inds:[4,15,14,21]
});

// Origin sensitivity: the signed-source ordinal and printed page-number
// convention are not interchangeable. Keep the selected zero/zero convention
// but expose all four finite index variants without selecting a new receiver.
const originCounts = [];
for (const sourceOrigin of [0,1]) for (const pageOrigin of [0,1]) {
  const rows = inRange.map(n=>{
    const target = signed[n-sourceOrigin];
    const sum = target.gp.reduce((a,b)=>a+b,0);
    const matches = pageWords(n-pageOrigin).filter(w=>w.len===target.gp.length && w.sum===sum);
    return {n,target:target.word,page:n-pageOrigin,matches};
  });
  originCounts.push([sourceOrigin,pageOrigin,rows.filter(row=>row.matches.length).length,rows.reduce((a,row)=>a+row.matches.length,0)]);
}
assert.deepEqual(originCounts,[[0,0,1,1],[0,1,3,5],[1,0,4,4],[1,1,0,0]]);
console.log('source/page origin sensitivity (origin pair, hit indices, hit objects):',originCounts);

const p = 23;
const g = 5;
const A = 8;
const inverseG = modPow(g,p-2,p);
assert.equal(inverseG,14);
assert.equal(inverseG*g - e*p,1);

const shell = [inverseG,A,e,(MOD-e)%MOD];
assert.deepEqual(shell,[14,8,3,26]);

const key = H4Inv(shell);
assert.deepEqual(key,[20,20,12,6]);
assert.deepEqual(H4(key),shell);

const cipher = hits[0].matches[0].inds;
const plain = cipher.map((x,i)=>(x-key[i]+MOD)%MOD);
assert.deepEqual(plain,targetStates.get(40).gp);
assert.deepEqual(plain,[13,24,2,15]);

const replay = plain.map((x,i)=>(x+key[i])%MOD);
assert.deepEqual(replay,cipher);

console.log('P25 -> PATHS40 direct consumer witness');
console.log('p25 source object:', p25Object);
console.log('transformed:', transformed);
console.log('all cut sums:', cuts);
console.log('same-index candidate rows:');
for (const row of receiverRows) {
  console.log(row.index, row.word, 'state', [row.len,row.sum], 'matches', row.matches.length,
    row.matches.map((m)=>({start:m.start,inds:m.inds})));
}
console.log('selected shell:', shell);
console.log('H^-1 shell key:', key);
console.log('p40 cipher:', cipher);
console.log('plaintext GP:', plain, '= PATHS');
console.log('forward replay:', replay);
console.log('PASS');
