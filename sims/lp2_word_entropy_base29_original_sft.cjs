'use strict';
/**
 * Two frozen, public, word-reset, lossless GP29 entropy-coder inverses.
 *
 * Motivation: 2013 Cicada BASE29 number conversion and the near-uniform
 * LP2 unknown rune inventory. This is a bounded decoder gate, not a claim
 * that either codec was selected by Cicada.
 *
 * (A) Witten-Neal-Cleary-style exact static arithmetic word coder,
 *     terminated by EOS; shortest completely contained base29 interval.
 * (B) Huffman (1952) binary word coder with EOS, a leading-1 bit sentinel
 *     for exact bit length, and minimal big-endian radix29 conversion.
 *
 * Fixed public source model: 29 GP-rune frequencies from the repository's
 * independently solved LP1 reference; Laplace +1 per rune, EOS = number
 * of words + 1. Source GP transliteration is deterministic with ING
 * encoded as one NG rune (the historical solved-page orthography).
 * No 29! substitution or source-cipher fit. Word-breaks are genuine
 * original printed punctuation, with source physical page wraps joined.
 *
 * Run from repo root: node sims/lp2_word_entropy_base29_original_sft.cjs
 * Read-only. Node.js 22, built-ins only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=read('resources/lp2-transcription.txt');
const reference=read('resources/liber-primus/lp1-plaintext-reference.txt');
assert.equal(gp.runes.length,29);
const lex=gp.translit.map((s,i)=>({s:s.toLowerCase(),i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function gpWord(word){
  const w=word.toLowerCase().replace(/v/g,'u').replace(/k/g,'c').replace(/z/g,'s');
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ing',i)){out.push(21);i+=3;continue;}
    const token=lex.find(t=>w.startsWith(t.s,i));
    if(!token)throw Error('untransliterable '+w+' at '+i);
    out.push(token.i);i+=token.s.length;
  }
  return out;
}
const native=(reference.replace(/^#.*$/gm,'').match(/[A-Za-z]+/g)||[])
  .flatMap(w=>{try{return [gpWord(w)];}catch{return [];}});
assert.equal(native.length,875);
const freq=Array(30).fill(1);
for(const word of native){for(const s of word)freq[s]++;freq[29]++;}
const cumulative=[0];
for(const n of freq)cumulative.push(cumulative.at(-1)+n);
const total=BigInt(cumulative.at(-1));
assert.equal(total,4441n);
assert.deepEqual(freq.slice(0,8),[74,178,119,330,216,122,58,104]);
assert.equal(freq[29],876);
const pages=original.split(/\s*%\s*/);
assert.equal(pages.length,57);
const runeNumber=new Map(gp.runes.map((r,i)=>[r,i]));
/** Joins printed page wraps and line wraps; genuine punctuation separates words.
 * @param {number} a index into 57 page-containing transcription records
 * @param {number} b inclusive last record
 * @returns {number[][]}
 */
function chapterWords(a,b){
  return pages.slice(a,b+1).join('').replaceAll('/','').replace(/\s/g,'')
    .split(/[-.&$§,:!?]/u).map(fragment=>
      [...fragment].filter(c=>runeNumber.has(c)).map(c=>runeNumber.get(c)))
    .filter(w=>w.length);
}
/** @param {number[]} digits */
function base29ToInteger(digits){
  return digits.reduce((n,x)=>29n*n+BigInt(x),0n);
}
/** @param {bigint} value */
function integerToBase29(value){
  const out=[];
  while(value>0n){out.unshift(Number(value%29n));value/=29n;}
  return out.length?out:[0];
}
/**
 * Exact arithmetic decode from center of the original radix29 word interval.
 * Stop on the explicit, public EOS symbol (29). Cap is a frozen engineering
 * bound, not a guessed per-ciphertext plaintext length.
 * @param {number[]} cipher
 */
function arithmeticDecode(cipher){
  let num=2n*base29ToInteger(cipher)+1n;
  let den=2n*29n**BigInt(cipher.length);
  const out=[];
  for(let j=0;j<75;j++){
    const q=num*total/den;
    const s=freq.findIndex((_,i)=>q<BigInt(cumulative[i+1]));
    if(s===29)return {kind:out.length?'complete':'empty',out};
    if(s<0)throw Error('arithmetic partition invariant failed');
    out.push(s);
    num=num*total-BigInt(cumulative[s])*den;
    den*=BigInt(freq[s]);
  }
  return {kind:'runoff',out};
}
/**
 * Canonical shortest base29 integer whose ENTIRE digit interval belongs
 * to the exact finished arithmetic code interval. No padding freedoms.
 * @param {number[]} word
 */
function arithmeticEncode(word){
  let lo=0n,hi=1n,den=1n;
  for(const sym of [...word,29]){
    const width=hi-lo;
    const start=lo*total+width*BigInt(cumulative[sym]);
    const end=lo*total+width*BigInt(cumulative[sym+1]);
    lo=start;hi=end;den*=total;
  }
  for(let n=1,power=29n;n<=120;n++,power*=29n){
    const k=(lo*power+den-1n)/den;
    if((k+1n)*den<=hi*power){
      const out=Array(n).fill(0);
      let value=k;
      for(let i=n-1;i>=0;i--){
        out[i]=Number(value%29n);
        value/=29n;
      }
      return out;
    }
  }
  throw Error('arithmetic canonical prefix overflow');
}
// Deterministic Huffman: smallest frequency first, tie by smallest leaf id.
const heap=freq.map((weight,i)=>({weight,minLeaf:i,leaf:i}));
while(heap.length>1){
  heap.sort((a,b)=>a.weight-b.weight||a.minLeaf-b.minLeaf);
  const left=heap.shift(),right=heap.shift();
  heap.push({weight:left.weight+right.weight,
    minLeaf:Math.min(left.minLeaf,right.minLeaf),left,right});
}
const huffmanRoot=heap[0],huffmanCodes=Array(30);
function buildCodes(node,code){
  if(node.leaf!==undefined){huffmanCodes[node.leaf]=code||'0';return;}
  buildCodes(node.left,code+'0');
  buildCodes(node.right,code+'1');
}
buildCodes(huffmanRoot,'');
assert.equal(huffmanCodes[29],'00');
/**
 * Huffman bitstream plus EOS. Prepend 1 to retain bit length under
 * base29 integer serialization; zero padding forbidden.
 * @param {number[]} word
 */
function huffmanEncode(word){
  const bits='1'+[...word,29].map(s=>huffmanCodes[s]).join('');
  return integerToBase29(BigInt('0b'+bits));
}
/** @param {number[]} cipher */
function huffmanDecode(cipher){
  const n=base29ToInteger(cipher);
  if(n===0n)return {kind:'invalid',out:[]};
  const bits=n.toString(2),out=[];
  let node=huffmanRoot;
  for(let i=1;i<bits.length;i++){
    node=bits[i]==='0'?node.left:node.right;
    if(node.leaf===undefined)continue;
    if(node.leaf===29){
      return {kind:(out.length&&i===bits.length-1)?'complete':'invalid',out};
    }
    out.push(node.leaf);node=huffmanRoot;
    if(out.length>=75)return {kind:'runoff',out};
  }
  return {kind:'invalid',out};
}
/** @param {{name:string,encode:Function,decode:Function}} codec */
function test(codec){
  const controls=native.slice(50,250);
  assert.equal(controls.length,200);
  for(const word of controls){
    const c=codec.encode(word),d=codec.decode(c);
    assert.equal(d.kind,'complete');
    assert.deepEqual(d.out,word);
    assert.deepEqual(codec.encode(d.out),c);
  }
  const cases=[
    ['unknown p0-2',0,2,158],
    ['independent unknown p33-39',33,39,378],
    ['final unknown p54-55',53,54,66],
    ['known clear p57 negative control',56,56,20]
  ];
  const results=[];
  for(const [chapter,first,last,expected] of cases){
    const words=chapterWords(first,last);
    assert.equal(words.length,expected,chapter);
    const outcome={chapter,sourceWords:words.length,complete:0,empty:0,
      invalidOrRunoff:0,exactCanonicalNonempty:0,
      firstThreeDecoded:[]};
    for(const word of words){
      const decoded=codec.decode(word);
      if(decoded.kind==='complete'){
        outcome.complete++;
        const copy=codec.encode(decoded.out);
        if(copy.join(',')===word.join(','))outcome.exactCanonicalNonempty++;
        if(outcome.firstThreeDecoded.length<3){
          outcome.firstThreeDecoded.push({
            source:word.map(i=>gp.translit[i]).join(''),
            output:decoded.out.map(i=>gp.translit[i]).join(''),
            canonical:copy.join(',')===word.join(',')
          });
        }
      }else if(decoded.kind==='empty')outcome.empty++;
      else outcome.invalidOrRunoff++;
    }
    results.push(outcome);
  }
  return {codec:codec.name,sourceModelWords:native.length,
    plantedAuthenticEnglishWords:controls.length,
    plantedExactForwardAndInverse:controls.length,
    results};
}
const arithmetic=test({
  name:'static 30-symbol arithmetic+EOS shortest radix29 interval',
  encode:arithmeticEncode,decode:arithmeticDecode
});
const huffman=test({
  name:'fixed Huffman+EOS leading1 bit sentinel, minimal radix29 integer',
  encode:huffmanEncode,decode:huffmanDecode
});
const get=(object,index)=>object.results[index].exactCanonicalNonempty;
assert.deepEqual(arithmetic.results.map((_,i)=>get(arithmetic,i)),[3,7,0,1]);
assert.deepEqual(huffman.results.map((_,i)=>get(huffman,i)),[2,9,1,0]);
console.log(JSON.stringify({
  decision:'No complete, source-canonical, native-GP word decoder on either original unknown chapter; no genuine plaintext or source-selected compressor found.',
  evidenceClass:'two fixed scoped negative codecs, known-solved positive and original clear negative controls',
  source:'original physical printed words (complete across page/line wraps), fixed LP1 English model and literal GP29 index',
  knownSourceModel:{nativeWords:native.length,totalFrequency:Number(total),
    eosFrequency:freq[29],gpHead8:freq.slice(0,8)},
  arithmetic,huffman
},null,2));
