'use strict';
/**
 * Source-constrained LP2 AES probe: the corrected 51 red runes on physical
 * page 53 form a base-29 integer, zero-padded to an AES-256 key.
 * The first 128 preceding black runes supply a candidate parity IV.
 * Node.js 22, CommonJS, built-in crypto, exact planted inverses.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
/** @param {string} name @returns {any} */
const get = name => JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus',name),'utf8'));
const corpus = get('lp2-corpus.json');
const grid = get('lp2-grid-256.json');
const red = get('lp2-page53-red-span.json');
const p53 = corpus.pages.find(p=>p.page===53);
const rs = [...red.red_text.runes].map(r=>ALPHABET.indexOf(r));
if(rs.length!==51 || rs.some(x=>x<0) || p53.indices.length!==179 ||
   rs.some((x,i)=>x!==p53.indices[128+i]))throw Error('Original p53 red span mismatch');
const ciphertext = corpus.pages.filter(p=>p.status==='unsolved').flatMap(p=>p.indices);
if(ciphertext.length!==12956 || ciphertext.some(x=>!Number.isInteger(x)||x<0||x>=29))
  throw Error('Unexpected unsolved LP2 rune corpus');
const gridBytes = Buffer.from(grid.pages.flatMap(p=>p.bytes));
if(gridBytes.length!==256)throw Error('Original base60 grid length mismatch');
/** @param {number[]} digits @returns {Buffer} */
function base29Key(digits){
 let z=0n;
 for(const d of digits)z=29n*z+BigInt(d);
 const hex=z.toString(16).padStart(64,'0');
 if(hex.length!==64)throw Error('Key exceeds 256 bits');
 return Buffer.from(hex,'hex');
}
/** @param {number[]} indices @returns {Buffer} */
function parityIV(indices){
 if(indices.length!==128)throw Error('IV length mismatch');
 let n=0n;
 for(const x of indices)n=(n<<1n)|BigInt(x&1);
 return Buffer.from(n.toString(16).padStart(32,'0'),'hex');
}
const ivs=[
 {name:'zero',bytes:Buffer.alloc(16)},
 {name:'black128-parity',bytes:parityIV(p53.indices.slice(0,128))}
];
const transforms=[
 {name:'forward',v:rs},
 {name:'reversed',v:rs.slice().reverse()},
 {name:'atbash',v:rs.map(x=>28-x)},
 {name:'atbash-reversed',v:rs.slice().reverse().map(x=>28-x)}
];
/**
 * @param {Buffer} source
 * @param {Buffer} key
 * @param {string} mode
 * @param {Buffer|null} iv
 * @returns {Buffer}
 */
function decrypt(source,key,mode,iv){
 const decipher=crypto.createDecipheriv('aes-256-'+mode,key,iv);
 if(mode==='cbc'||mode==='ecb')decipher.setAutoPadding(false);
 return Buffer.concat([decipher.update(source),decipher.final()]);
}
/** @param {number[]} v @returns {number} */
function ioc(v){
 const hist=Array(29).fill(0);
 for(const x of v)hist[x]++;
 return hist.reduce((a,x)=>a+x*(x-1),0)/(v.length*(v.length-1));
}
const gridScores=[],runeScores=[];
for(const {name,v} of transforms){
 const key=base29Key(v);
 for(const iv of ivs){
  for(const mode of ['cbc','ctr','cfb','ofb','ecb']){
   if(mode==='ecb'&&iv.name!=='zero')continue;
   const decoded=decrypt(gridBytes,key,mode,mode==='ecb'?null:iv.bytes);
   gridScores.push({
    key:name,iv:iv.name,mode,
    asciiLike:[...decoded].filter(b=>b===9||b===10||b===13||(b>=32&&b<=126)).length,
    printable:[...decoded].filter(b=>b>=32&&b<=126).length,
    low29:[...decoded].filter(b=>b<29).length,
    first32Hex:decoded.subarray(0,32).toString('hex')
   });
  }
  const pad=decrypt(Buffer.alloc(ciphertext.length),key,'ctr',iv.bytes);
  for(const sign of [-1,1]){
   const plaintext=ciphertext.map((c,i)=>(c+sign*(pad[i]%29)+29)%29);
   runeScores.push({
    key:name,iv:iv.name,sign,
    wholeIoC:ioc(plaintext),prefix4096IoC:ioc(plaintext.slice(0,4096)),
    first80Runes:plaintext.slice(0,80).map(i=>ALPHABET[i]).join('')
   });
  }
 }
}
gridScores.sort((a,b)=>b.asciiLike-a.asciiLike||b.printable-a.printable);
runeScores.sort((a,b)=>b.prefix4096IoC-a.prefix4096IoC);
const key=base29Key(rs);
const clear=Buffer.alloc(256,0x41);
const encrypt=crypto.createCipheriv('aes-256-cbc',key,Buffer.alloc(16));
encrypt.setAutoPadding(false);
const plant=Buffer.concat([encrypt.update(clear),encrypt.final()]);
if(!decrypt(plant,key,'cbc',Buffer.alloc(16)).equals(clear))
 throw Error('AES CBC synthetic full roundtrip failed');
const pad=decrypt(Buffer.alloc(ciphertext.length),key,'ctr',Buffer.alloc(16));
const enc=ciphertext.map((p,i)=>(p+pad[i]%29)%29);
const dec=enc.map((c,i)=>(c-pad[i]%29+29)%29);
if(dec.some((p,i)=>p!==ciphertext[i]))
 throw Error('GP rune stream synthetic full roundtrip failed');

/** @param {number} seed @returns {() => number} */
function random32(seed){
 let state=seed>>>0;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
/** @param {number[]} sourceDigits @returns {number} */
function maximalAscii(sourceDigits){
 let best=0;
 const ops=[
  sourceDigits,sourceDigits.slice().reverse(),
  sourceDigits.map(x=>28-x),
  sourceDigits.slice().reverse().map(x=>28-x)
 ];
 for(const digits of ops){
  const k=base29Key(digits);
  for(const iv of ivs)for(const mode of ['cbc','ctr','cfb','ofb','ecb']){
   if(mode==='ecb'&&iv.name!=='zero')continue;
   const clear=decrypt(gridBytes,k,mode,mode==='ecb'?null:iv.bytes);
   const count=[...clear].filter(x=>x===9||x===10||x===13||(x>=32&&x<=126)).length;
   if(count>best)best=count;
  }
 }
 return best;
}
// Keep the original marked stanza's exact 51-rune multiset. Randomize only
// its ordering; every 36-model family is searched identically in each control.
const rng=random32(0x22a51e51);
const nullTrials=4000;
let maxExceed=0,maxTotal=0;
const observedMax=gridScores[0].asciiLike;
for(let trial=0;trial<nullTrials;trial++){
 const sample=rs.slice();
 for(let i=sample.length-1;i>0;i--){
  const j=rng()%(i+1);
  [sample[i],sample[j]]=[sample[j],sample[i]];
 }
 const candidate=maximalAscii(sample);
 maxTotal+=candidate;
 if(candidate>=observedMax)maxExceed++;
}
const gridCalibration={originalMax:observedMax,conditionalShuffles:nullTrials,
 seed:'0x22a51e51',controlMean:maxTotal/nullTrials,
 exceedCount:maxExceed,addOneP:(maxExceed+1)/(nullTrials+1)};
console.log(JSON.stringify({
 source:{unresolvedRunes:ciphertext.length,redDigits:51,gridBytes:gridBytes.length,
  redIndicesSha256:crypto.createHash('sha256').update(Buffer.from(rs)).digest('hex'),
  gridSha256:crypto.createHash('sha256').update(gridBytes).digest('hex'),
  originalFullIoC:ioc(ciphertext),originalPrefix4096IoC:ioc(ciphertext.slice(0,4096))},
 gridTrialCount:gridScores.length,bestGrid:gridScores.slice(0,6),gridCalibration,
 runeTrialCount:runeScores.length,bestWholeRune:runeScores.slice().sort((a,b)=>b.wholeIoC-a.wholeIoC)[0],bestRunes:runeScores.slice(0,6),
 plantedInverse:{aes256CBC:true,aes256CTRGP:true}
},null,2));
