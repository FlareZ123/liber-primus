'use strict';

/**
 * Director #1521: printed second base60 digit as the source-selected value
 * operand beneath the frozen #1422 zero-F moving-exception surface inverse.
 *
 * Frozen before language scoring:
 *   P_i = M_i - (lowPrintedDigit[i mod256] mod29) mod29
 * under the continuous global phase-zero p50 clock.
 *
 * Wrong-clue control:
 *   identical subtraction using the first printed digit instead.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const original=corpus.pages.filter(p=>p.page<=55&&p.indices.length)
  .flatMap(p=>p.indices);
const tokens=grid.pages.flatMap(p=>p.tokens);
const bytes=grid.bytes;
const digits='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const special=[0,2,12,21,22,25,27,28];
const mod=x=>((x%29)+29)%29;
assert.equal(original.length,12956);
assert.equal(tokens.length,256);
assert.equal(bytes.length,256);

/** @param {number} value @param {number} left @param {number} right */
function swap(value,left,right){
  if(left===right)return value;
  if(value===left)return right;
  if(value===right)return left;
  return value;
}
/** @param {number} control */
function marker(control){
  return tokens[control][0]==='0'?0:special[bytes[control]&7];
}
/** @param {number[]} plain */
function outerEncrypt(plain){
  const out=new Array(plain.length);
  out[0]=plain[0];
  for(let i=1;i<plain.length;i++){
    out[i]=swap(plain[i],out[i-1],marker((i-1)&255));
  }
  return out;
}
/** @param {number[]} cipher */
function outerDecrypt(cipher){
  const out=new Array(cipher.length);
  out[0]=cipher[0];
  for(let i=1;i<cipher.length;i++){
    out[i]=swap(cipher[i],cipher[i-1],marker((i-1)&255));
  }
  return out;
}
const intermediate=outerDecrypt(original);
assert.deepEqual(outerEncrypt(intermediate),original);
assert.equal(intermediate.reduce((s,v,i)=>s+Number(v!==original[i]),0),549);

const high=tokens.map(token=>digits.indexOf(token[0]));
const low=tokens.map(token=>digits.indexOf(token[1]));
assert.ok(high.every(value=>value>=0));
assert.ok(low.every(value=>value>=0));
assert.ok(high.every(value=>value<=4));
assert.ok(low.every(value=>value<=59));

/** @param {number[]} operand @param {number[]} input */
function decryptValue(operand,input){
  return input.map((value,index)=>mod(value-(operand[index&255]%29)));
}
/** @param {number[]} operand @param {number[]} plain */
function encryptValue(operand,plain){
  return plain.map((value,index)=>mod(value+(operand[index&255]%29)));
}

/* Canonical source word lengths. */
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const source=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%');
const wordLengths=[];
let pending=0,runes=0;
for(const ch of source){
  if(runeIndex.has(ch)){pending++;runes++;}
  else if(ch==='%'||ch==='/'||/\s/u.test(ch)){
    // layout only
  }else if(pending){
    wordLengths.push(pending);
    pending=0;
  }
}
if(pending)wordLengths.push(pending);
assert.deepEqual([runes,wordLengths.length],[12956,2896]);

/* Native-GP dictionary, source-calibrated IO/ING spellings. */
const translit=corpus.translit.map((symbol,index)=>({symbol,index}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} raw */
function encodeWord(raw){
  const s=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const token=translit.find(entry=>s.startsWith(entry.symbol,i));
    if(!token)return [];
    out.push(token.index);
    i+=token.symbol.length;
  }
  return out;
}
const dictionary=new Map();
for(const line of read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/)){
  const match=line.match(/^([A-Za-z]+)/);
  if(!match)continue;
  const encoded=encodeWord(match[1]);
  if(!encoded.length)continue;
  if(!dictionary.has(encoded.length))dictionary.set(encoded.length,new Set());
  dictionary.get(encoded.length).add(encoded.join(','));
}
/** @param {number[]} stream */
function lexical(stream){
  let offset=0,hits=0,longHits=0,maxRunRunes=0,run=0;
  const byLength={};
  for(const length of wordLengths){
    const word=stream.slice(offset,offset+length);
    offset+=length;
    const hit=dictionary.get(length)?.has(word.join(','))||false;
    if(!byLength[length])byLength[length]={total:0,hits:0};
    byLength[length].total++;
    byLength[length].hits+=Number(hit);
    if(hit){
      hits++;
      longHits+=Number(length>=5);
      run+=length;
      maxRunRunes=Math.max(maxRunRunes,run);
    }else run=0;
  }
  assert.equal(offset,stream.length);
  return {hits,longHits,maxRunRunes,byLength};
}
/** @param {number[]} stream */
function ioc(stream){
  const counts=new Uint32Array(29);
  for(const value of stream)counts[value]++;
  return Array.from(counts).reduce((s,n)=>s+n*(n-1),0)/
    (stream.length*(stream.length-1));
}

const secondDigit=decryptValue(low,intermediate);
const firstDigit=decryptValue(high,intermediate);
const secondLex=lexical(secondDigit);
const firstLex=lexical(firstDigit);
assert.ok(Math.abs(ioc(secondDigit)-0.03447818338087919)<1e-15);
assert.deepEqual(
  [secondLex.hits,secondLex.longHits,secondLex.maxRunRunes],
  [178,0,8]
);
assert.ok(Math.abs(ioc(firstDigit)-0.03448093592075259)<1e-15);
assert.deepEqual(
  [firstLex.hits,firstLex.longHits,firstLex.maxRunRunes],
  [190,0,4]
);

/* Complete layered source-native plant. */
const p57=corpus.pages.find(page=>page.page===57).indices;
const positivePlain=Array.from({length:original.length},
  (_,index)=>p57[index%p57.length]);
const positiveInner=encryptValue(low,positivePlain);
const positiveOuter=outerEncrypt(positiveInner);
assert.deepEqual(
  decryptValue(low,outerDecrypt(positiveOuter)),
  positivePlain
);

console.log(JSON.stringify({
  candidate:{
    operand:'second printed base60 digit',
    rule:'P=M-(lowDigit mod29), global p50 phase0',
    ioc:ioc(secondDigit),
    dictionaryHits:secondLex.hits,
    length5PlusHits:secondLex.longHits,
    maxDictionaryRunRunes:secondLex.maxRunRunes
  },
  wrongClueControl:{
    operand:'first printed base60 digit',
    ioc:ioc(firstDigit),
    dictionaryHits:firstLex.hits,
    length5PlusHits:firstLex.longHits,
    maxDictionaryRunRunes:firstLex.maxRunRunes
  },
  positive:{
    source:'repeated solved p57 native GP',
    runes:positivePlain.length,
    exactLayeredRoundtrip:true
  },
  decision:'FAIL: candidate and wrong-clue control are uniform/nonlinguistic with zero exact native-GP dictionary words of length >=5.'
},null,2));
