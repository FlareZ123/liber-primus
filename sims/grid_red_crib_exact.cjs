'use strict';

/**
 * Ciphertext-producing test of the original LP2 32x8 table as 256-bit stream keys.
 * Targets the independently image-delimited eleven-rune word in page 53's red verse.
 *
 * The exact English-word anchor is never fitted to the key. Enumerate complete
 * AES-256-CTR / ChaCha20 streams from each row/column 32-byte chunk of the grid,
 * with three IVs, both key directions, and two base-29 mappings plus rejection.
 * Search 2,048 byte-stream phases, both additive signs, and two insertion/repair
 * interpretations. A direct word may differ in <=1 ciphertext symbol; a word
 * with one inserted ciphertext symbol must leave an exact ten-rune dictionary
 * word after a one-position key hold.
 *
 * Run from repository root: node sims/grid_red_crib_exact.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { encode } = require('./relative_key_english_probe.cjs');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const mod = x => (x % 29 + 29) % 29;
const chr = x => String.fromCharCode(65 + x);
const codes = seq => seq.map(chr).join('');
const W = 11;
const PHASES = 2048;
const IVS = ['zero', 'grid-head', 'page53'];
const MODES = ['mod29', 'scaled29', 'reject232'];
const CIPHERS = ['aes-256-ctr', 'chacha20'];
const SIGNS = [-1, 1];

/** @param {number[]} values */
function keyCandidates(values) {
  assert.equal(values.length, 256);
  const g = Buffer.from(values);
  const candidates = [];
  for (let i = 0; i < 8; i++) {
    const column = Buffer.from(Array.from({length: 32}, (_, r) => values[8*r+i]));
    const rows = g.subarray(i*32, i*32+32);
    for (const [basis, b] of [['column'+i, column], ['rows'+i, rows]]) {
      candidates.push({basis, bytes: b});
      candidates.push({basis: basis+'-reverse', bytes: Buffer.from(b).reverse()});
    }
  }
  const hash = crypto.createHash('sha256').update(g).digest();
  candidates.push({basis: 'sha256-all', bytes: hash});
  return candidates;
}

/** @param {Buffer} grid */
function ivVariants(grid) {
  return [
    {name: 'zero', bytes: Buffer.alloc(16)},
    {name: 'grid-head', bytes: grid.subarray(0,16)},
    {name: 'page53', bytes: Buffer.from([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,53])}
  ];
}

/** @param {Buffer} key @param {string} algorithm @param {Buffer} iv */
function rawStream(key, algorithm, iv) {
  const cipher = crypto.createCipheriv(algorithm,key,iv);
  return Buffer.concat([cipher.update(Buffer.alloc(8192)),cipher.final()]);
}

/** @param {Buffer} raw @param {string} how */
function mappedStream(raw,how) {
  const out = [];
  for (const b of raw) {
    if (how === 'reject232' && b >= 232) continue;
    out.push(how === 'scaled29' ? Math.floor(b*29/256) : b%29);
  }
  assert.ok(out.length >= PHASES+W+1);
  return out;
}

/** Source-derived, complete image word. */
function redAnchor() {
  const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const span = JSON.parse(read('resources/liber-primus/lp2-page53-red-span.json')).red_text;
  assert.deepEqual(span.word_lengths,[5,4,4,11,2,3,2,6,5,5,2,2]);
  const page = source.pages.find(p => p.page === 53);
  const at = span.start_rune_inclusive+span.word_lengths.slice(0,3).reduce((a,b)=>a+b,0);
  const cipher = page.indices.slice(at,at+W);
  assert.equal(at,141);
  assert.equal(cipher.length,W);
  assert.equal(cipher.map(x=>source.runes[x]).join(''),'ᚱᛡᛞᛡᚦᚪᛁᛇᚫᛉᛚ');
  return {cipher, at, image:'70.jpg'};
}

/** @returns {{word11:Map<string,string>, word10:Map<string,string>, fuzzy11:Map<string,string[]>}} */
function dictionary() {
  const unique = new Map();
  for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/u)) {
    const m = /^([a-z]+)\s+(\d+)$/u.exec(line);
    if (!m || /q(?!u)/u.test(m[1])) continue;
    const c = encode(m[1]);
    if (c.length !== 10 && c.length !== W) continue;
    const key = codes(c);
    if (!unique.has(key) || Number(m[2]) > unique.get(key).freq)
      unique.set(key,{word:m[1],freq:Number(m[2]),length:c.length});
  }
  const word10 = new Map(), word11 = new Map(), fuzzy11 = new Map();
  for (const [key, item] of unique) {
    if (item.length === 10) {word10.set(key,item.word);continue;}
    word11.set(key,item.word);
    for(let i=0;i<W;i++) {
      const pattern = key.slice(0,i)+'?'+key.slice(i+1);
      if (!fuzzy11.has(pattern)) fuzzy11.set(pattern,[]);
      fuzzy11.get(pattern).push(item.word);
    }
  }
  assert.ok(word10.size>1000 && word11.size>1000);
  return {word10,word11,fuzzy11};
}

/**
 * Match an eleven-symbol ciphertext against exact/one-error 11-rune words
 * or exact ten-rune words with one extraneous ciphertext symbol and one
 * associated key hold. All candidate plaintext words are fixed in advance.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} offset
 * @param {number} sign
 * @param {ReturnType<typeof dictionary>} dict
 * @returns {object[]}
 */
function match(cipher,key,offset,sign,dict) {
  const normal = [], held = [];
  for(let i=0;i<W;i++) {
    normal.push(chr(mod(cipher[i]-sign*key[offset+i])));
    held.push(chr(mod(cipher[i]-sign*key[offset+Math.max(0,i-1)])));
  }
  const text=normal.join('');
  const hits=[];
  const exact=dict.word11.get(text);
  if(exact) hits.push({kind:'full-exact',word:exact,misses:0,indices:text});
  for(let i=0;i<W;i++) {
    const pattern=text.slice(0,i)+'?'+text.slice(i+1);
    for(const word of dict.fuzzy11.get(pattern)||[])
      if(word!==exact) hits.push({kind:'full-one-overwrite',word,misses:1,overwritten:i,indices:text});
    const trimmed=normal.slice(0,i).concat(held.slice(i+1)).join('');
    const inserted=dict.word10.get(trimmed);
    if(inserted)hits.push({kind:'one-inserted-rune',word:inserted,inserted:i,indices:trimmed});
  }
  return hits;
}

/** @param {number[]} cipher @param {Buffer} grid @param {ReturnType<typeof dictionary>} dict */
function search(cipher,grid,dict) {
  let paths=0, runs=0;
  const hits=[];
  for(const {basis,bytes} of keyCandidates([...grid]))
    for(const algorithm of CIPHERS)
      for(const iv of ivVariants(grid)) {
        const raw=rawStream(bytes,algorithm,iv.bytes);
        runs++;
        for(const mode of MODES) {
          const key=mappedStream(raw,mode);
          for(const sign of SIGNS)
            for(let offset=0;offset<PHASES;offset++) {
              paths++;
              const matches=match(cipher,key,offset,sign,dict);
              for(const m of matches)
                hits.push({...m,basis,algorithm,iv:iv.name,mode,sign,offset});
            }
        }
      }
  return {paths,runs,hits};
}

/** Deterministic planted controls, included in the identical complete scan. */
function controls(grid,dict) {
  const byteKey=keyCandidates([...grid])[0].bytes;
  const raw=rawStream(byteKey,'aes-256-ctr',ivVariants(grid)[0].bytes);
  const stream=mappedStream(raw,'mod29'), off=37, sign=1;
  const source11=[...dict.word11].find(([,name])=>name==='enlightened') || [...dict.word11][0];
  const word11=[...source11[0]].map(c=>c.charCodeAt(0)-65);
  const cipher11=word11.map((v,i)=>mod(v+sign*stream[off+i]));
  cipher11[5]=mod(cipher11[5]+7);
  const match11=match(cipher11,stream,off,sign,dict);
  assert.ok(match11.some(m=>m.kind==='full-one-overwrite'&&m.word===source11[1]),'One-overwrite plant must be recovered');

  const source10=[...dict.word10].find(([,name])=>name==='knowledge') || [...dict.word10][0];
  const word10=[...source10[0]].map(c=>c.charCodeAt(0)-65);
  const insertAt=5;
  const cipher10=[];
  for(let i=0;i<W;i++)
    cipher10.push(i===insertAt ? 7 : mod(word10[i-(i>insertAt?1:0)]+sign*stream[off+i-(i>insertAt?1:0)]));
  const match10=match(cipher10,stream,off,sign,dict);
  assert.ok(match10.some(m=>m.kind==='one-inserted-rune'&&m.word===source10[1]&&m.inserted===insertAt),
    'Inserted-ciphertext plant must be recovered');
  return {oneOverwritten:{word:source11[1],found:true},oneInserted:{word:source10[1],position:insertAt,found:true}};
}

function main(){
  const grid=Buffer.from(JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows.flat());
  const dict=dictionary();
  const anchor=redAnchor();
  const positive=controls(grid,dict);
  const result=search(anchor.cipher,grid,dict);
  const out={
    source:'Original LP2 page 53 (70.jpg) red-ink word 4, 11 runes',
    sourceOffset:anchor.at,runicWord:anchor.cipher,
    candidateGridKeys:keyCandidates([...grid]).length,
    streamCiphers:CIPHERS,ivChoices:IVS,mappings:MODES,
    additiveSigns:SIGNS,phases:PHASES,
    lexicon:{tenRuneWords:dict.word10.size,elevenRuneWords:dict.word11.size},
    tests:{runs:result.runs,completeSettingPaths:result.paths,
      anchoredWordComparisonsPerPath:'11-rune <=1 substitution; 10-rune exact with one free insertion'},
    positive,hits:result.hits,
    conclusion:result.hits.length===0?'No complete or one-overwrite 11-rune English word, or one-insertion 10-rune English word, under this fixed grid-key AES/ChaCha family.':'Some candidate words survive; verify against other independent verse words before interpreting.'
  };
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
}
if(require.main===module)main();
module.exports={keyCandidates,ivVariants,rawStream,mappedStream,redAnchor,dictionary,match,search,controls};
