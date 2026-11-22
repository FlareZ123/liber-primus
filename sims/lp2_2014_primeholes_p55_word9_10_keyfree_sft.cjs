'use strict';
/**
 * A fully source-fixed p55 native-word obstruction to any value-stationary
 * GP29 additive key on the specific 2014 99-cell prime-hole placement.
 *
 * In p55 segment9, original local rune positions 36..41 use numeric source
 * values [72,15,16,65,270,270], with 270 repeated. Segment10 at
 * original positions 42..45 uses [65,16,15,72]. Any per-value additive
 * key of any complexity must therefore satisfy:
 * P9[4]-P9[5] = C40-C41 (mod29),
 * P10 = C[42..45] - reverse(C[36..39]-P9[0..3]) (mod29).
 *
 * Enumerate the exact available independent source-native GP English lexicon,
 * including all distinct 6-GP and 4-GP words. No key/phase/shift is searched.
 * Run: node sims/lp2_2014_primeholes_p55_word9_10_keyfree_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt');
const squares=read('resources/cicada2014-openpuff-magic-squares.txt').trim()
  .split(/\r?\n\s*\r?\n/).map(block=>block.trim().split(/\r?\n/)
    .map(row=>row.trim().split(/\s+/).map(Number)));
/** @param {number} n @returns {boolean} */
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
const values=squares.flatMap((square,i)=>
  square.flat().filter(v=>i===0||!isPrime(v)));
const c=db.pages.find(page=>page.page===55).indices;
const words=transcription.split('%')[54].replace(/\/\s*/g,'')
  .match(/[\u16A0-\u16FF]+/gu)||[];
const wordLens=words.map(word=>[...word].length);
assert.deepEqual(wordLens,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual([c.length,values.length],[76,76]);
assert.deepEqual(values.slice(36,42),[72,15,16,65,270,270]);
assert.deepEqual(values.slice(42,46),[65,16,15,72]);
assert.deepEqual(c.slice(36,42).map(i=>db.translit[i]),
  ['M','S','D','IA','P','F']);
assert.deepEqual(c.slice(42,46).map(i=>db.translit[i]),
  ['B','H','EO','C']);
const tokens=db.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} w @returns {number[]|null} */
function gp(w){
  const text=w.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<text.length;){
    const t=tokens.find(v=>text.startsWith(v.token,i));
    if(!t)return null;
    out.push(t.index);i+=t.token.length;
  }
  return out;
}
const corpus=[
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt'],
  ['LP1 solved','resources/liber-primus/lp1-plaintext-reference.txt']
];
/** @type {Map<string,{word:string,p:number[],sources:Set<string>}>} */
const word6=new Map(),word4=new Map();
for(const [name,file] of corpus){
  const entries=read(file).match(/[A-Za-z]+/g)||[];
  for(const word of entries){
    const p=gp(word);
    if(!p||![4,6].includes(p.length))continue;
    const key=p.join(','),dictionary=p.length===4?word4:word6;
    if(!dictionary.has(key))dictionary.set(key,{word,p,sources:new Set()});
    dictionary.get(key).sources.add(name);
  }
}
const mod=x=>(x%29+29)%29;
/** @param {number[]} p6 @returns {number[]} */
function predict4(p6){
  assert.equal(p6.length,6);
  return [
    mod(c[42]-c[39]+p6[3]),
    mod(c[43]-c[38]+p6[2]),
    mod(c[44]-c[37]+p6[1]),
    mod(c[45]-c[36]+p6[0])
  ];
}
const mustMatch=mod(c[40]-c[41]);
assert.equal(mustMatch,13);
const compatible6=[...word6.values()].filter(x=>
  mod(x.p[4]-x.p[5])===mustMatch);
const hits=compatible6.map(x=>({
  word9:x.word,
  word10:word4.get(predict4(x.p).join(','))?.word,
  word10Gp:predict4(x.p).map(i=>db.translit[i]).join(''),
  sourceWords:[...x.sources]
})).filter(x=>x.word10!==undefined);
assert.equal(word6.size,2202);
assert.equal(word4.size,1182);
assert.equal(compatible6.length,14);
assert.deepEqual(hits,[]);
// Independent motivated 2013 source word WISDOM (6 GP runes) survives only
// its internal constraint and predicts an unattested 4-GP sequence.
const wisdom=gp('WISDOM');
assert.equal(wisdom.length,6);
assert.equal(mod(wisdom[4]-wisdom[5]),13);
assert.deepEqual(predict4(wisdom).map(i=>db.translit[i]),
  ['P','F','W','OE']);
assert.equal(word4.has(predict4(wisdom).join(',')),false);
// Exact native GP positive plant with any word9 and independent word10.
// Use fixed literal printed values as a deterministic pad; no learned keys.
// A 6+4 native plant must predict its second word exactly.
const native6=gp('WISDOM'),native4=gp('LIFE');
assert.equal(native4.length,4);
const keyFn=v=>v%29;
const plantC6=native6.map((p,i)=>mod(p+keyFn(values[36+i])));
const plantC4=native4.map((p,i)=>mod(p+keyFn(values[42+i])));
const predictedPlant=[
  mod(plantC4[0]-plantC6[3]+native6[3]),
  mod(plantC4[1]-plantC6[2]+native6[2]),
  mod(plantC4[2]-plantC6[1]+native6[1]),
  mod(plantC4[3]-plantC6[0]+native6[0])
];
assert.deepEqual(predictedPlant,native4);
assert.equal(mod(plantC6[4]-plantC6[5]),mod(native6[4]-native6[5]));
if(require.main===module)console.log(JSON.stringify({
  status:'PASS',
  scope:'original p55 local word9 and word10; any per-value stationary additive GP29 key on 2014 99-cell prime-hole mask',
  fixedSquareValuesWord9:values.slice(36,42),
  fixedSquareValuesWord10:values.slice(42,46),
  originalGPcipherWord9:c.slice(36,42).map(i=>db.translit[i]),
  originalGPcipherWord10:c.slice(42,46).map(i=>db.translit[i]),
  requiredLastPairDifference:mustMatch,
  independentFiniteLexicon:{sources:corpus.map(x=>x[0]),
    distinct6Gp:word6.size,distinct4Gp:word4.size,
    word9CandidatesMatchingOriginalDelta:compatible6.length,
    survivingNativeWord9Word10Pairs:hits.length},
  compatibleWord9Examples:compatible6.map(x=>({word:x.word,
    output4:predict4(x.p).map(i=>db.translit[i]).join('')})),
  authenticHistoricalCribWord9WisdomPredicts:'PFWOE',
  exactNativeWisdomLifePlant:predictedPlant.map(i=>db.translit[i]).join(''),
  conclusion:'No pair of recorded GP-native English 6+4 words fits the original strict word-pair inversion; this is a finite-lexicon obstruction only, not a universal language proof'
},null,2));
module.exports={gp,predict4};
