'use strict';

/**
 * Original LP2 GP29 predecessor-exclusion, independently secret word-private
 * affine GF28-rank lexical gate. Native GP word source is the author-stable
 * source corpus, lexicon is the separately preserved TextBlob frequency list.
 *
 * In each complete printed word, first plaintext rune is unrestricted.
 * For all later positions, decoded GP28 rank is translated through ANY of
 * 336 invertible maps P=(a*rank+b) mod28, separately keyed in every word.
 * Adjacent-equal ciphertext remains the extra EA=28 symbol.
 *
 * Both natural predecessor-omission ranks are tested:
 *  - additive: (current-previous mod29)-1 for nonzero differences
 *  - ordinal: GP index among 28 choices excluding previous ciphertext
 *
 * SFT: node sims/lp2_wordprivate_rank28_affine_nativelex_sft.cjs
 * Read-only, Node.js 22, Windows 11 compatible.
 *
 * This excludes only the named receiver and tested native word register.
 * It does not rule out unrestricted word-private substitution, position
 * changes, boundary changes, other languages or hidden key/state.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8').replace(/\r\n/g,'\n');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const runeIds=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} text @returns {number[][]} */
function parseWords(text){
  const out=[];
  let active=[];
  for(const ch of text){
    if(runeIds.has(ch))active.push(runeIds.get(ch));
    else if('- .&$§'.includes(ch)){
      if(active.length){out.push(active);active=[];}
    }
    // Physical page/line separators are not word delimiters.
  }
  if(active.length)out.push(active);
  return out;
}
const transcript=read('resources/liber-primus/lp2-transcription.txt').split('%');
assert.equal(transcript.length,57);
const words=parseWords(transcript.slice(0,55).join('%'));
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),original);
const solved57=parseWords(transcript[56]);
assert.deepEqual(solved57.flat(),corpus.pages[57].indices);

const glyphTokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number[]|null} */
function nativeGP(raw){
  const s=raw.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S')
    .replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out=[];
  for(let i=0;i<s.length;){
    const t=glyphTokens.find(z=>s.startsWith(z.s,i));
    if(!t)return null;
    out.push(t.i);
    i+=t.s.length;
  }
  return out;
}
assert.deepEqual(nativeGP('PARABLE'),solved57[0]);
const rawLex=read('resources/control/english_wordfreq_textblob.txt');
/** @type {Map<string,{word:string,freq:number}>} */
const lexicon=new Map();
let encoded=0;
for(const m of rawLex.matchAll(/^([a-z]+) (\d+)$/gm)){
  const gp=nativeGP(m[1]);
  if(!gp||gp.length<4||gp.length>16)continue;
  encoded++;
  const key=gp.length+':'+gp.slice(1).join(',');
  // First plaintext rune is free and not considered in a match.
  const existing=lexicon.get(key);
  if(!existing||existing.freq<Number(m[2]))
    lexicon.set(key,{word:m[1],freq:Number(m[2])});
}
assert(encoded>25000);
assert(lexicon.size>15000);
const units=[1,3,5,9,11,13,15,17,19,23,25,27];
assert.equal(units.length,12);
for(const a of units)assert.equal((a*inverse(a))%28,1);
/** @param {number} a @returns {number} */
function inverse(a){
  for(let n=1;n<28;n++)if((a*n)%28===1)return n;
  throw Error('Non-unit modulo28: '+a);
}
/**
 * @param {number} cipher
 * @param {number} previous
 * @param {'difference'|'skip'} mode
 * @returns {number}
 */
function rank(cipher,previous,mode){
  if(cipher===previous)return 28; // the reserved EA
  if(mode==='difference')return (cipher-previous+29)%29-1;
  assert.equal(mode,'skip');
  return cipher-Number(cipher>previous);
}
/**
 * @param {number} symbol
 * @param {number} previous
 * @param {'difference'|'skip'} mode
 * @returns {number}
 */
function unrank(symbol,previous,mode){
  assert(symbol>=0&&symbol<=28);
  if(symbol===28)return previous;
  if(mode==='difference')return (previous+symbol+1)%29;
  assert.equal(mode,'skip');
  return symbol+Number(symbol>=previous);
}
/** @param {number[]} cipher @param {'difference'|'skip'} mode */
function observedRanks(cipher,mode){
  const out=[];
  let previous=0;
  for(const value of cipher){
    const rankValue=rank(value,previous,mode);
    out.push(rankValue);
    previous=value;
  }
  return out;
}
/**
 * @param {number[]} ranks
 * @returns {{word:string,freq:number,a:number,b:number}[]}
 */
function findNative(ranks){
  if(ranks.length<4)return [];
  const found=[];
  for(const a of units){
    for(let b=0;b<28;b++){
      const suffix=ranks.slice(1).map(x=>x===28?28:(a*x+b)%28);
      const hit=lexicon.get(ranks.length+':'+suffix.join(','));
      if(hit)found.push({...hit,a,b});
    }
  }
  return found;
}
/**
 * @param {number[]} plaintext
 * @param {'difference'|'skip'} mode
 * @param {number} a
 * @param {number} b
 * @param {number} firstCipher
 */
function encryptPlant(plaintext,mode,a,b,firstCipher){
  const inverseA=inverse(a);
  const out=[firstCipher];
  for(let i=1;i<plaintext.length;i++){
    const p=plaintext[i];
    const r=p===28?28:(inverseA*(p-b+28))%28;
    out.push(unrank(r,out[out.length-1],mode));
  }
  return out;
}
const baseline={};
const sourceRanked={};
for(const mode of ['difference','skip']){
  // Original Cprev always uses the physical continuous rune stream.
  const stream=observedRanks(original,mode);
  assert.equal(stream.length,12956);
  const shaped=[];
  let start=0;
  for(const w of words){shaped.push(stream.slice(start,start+w.length));start+=w.length;}
  assert.equal(start,original.length);
  sourceRanked[mode]=shaped;
  const byLength={};
  let longWords=0,longAny=0,longFreq20=0;
  for(let i=0;i<words.length;i++){
    const len=words[i].length;
    if(len<5)continue;
    if(!byLength[len])byLength[len]={total:0,withAny:0,withFreq20:0};
    const matches=findNative(shaped[i]);
    byLength[len].total++;
    if(matches.length)byLength[len].withAny++;
    if(matches.some(x=>x.freq>=20))byLength[len].withFreq20++;
    if(len>=7){longWords++;longAny+=Number(matches.length>0);
      longFreq20+=Number(matches.some(x=>x.freq>=20));}
  }
  assert.deepEqual(Object.keys(byLength).map(Number),[5,6,7,8,9,10,11,12,13,14]);
  assert.equal(longWords,559);
  assert.equal(longAny,0);
  assert.equal(longFreq20,0);
  const expected=mode==='difference'?
    [204,18,0,0,0,0,0,0,0,0]:
    [201,13,0,0,0,0,0,0,0,0];
  assert.deepEqual(Object.values(byLength).map(r=>r.withAny),expected);
  baseline[mode]={byLength,longWords,longAny,longFreq20};
}
assert.equal(baseline.difference.longWords+baseline.skip.longWords,1118);

// Positive: real solved p57 whole source words are re-encoded using independent
// secret keys and first ciphertext symbols. Each must be recoverable without
// relying on its original first plaintext rune.
let positiveFromSolved=0;
let positiveFromLexicon=0;
for(const mode of ['difference','skip']){
  for(let i=0;i<solved57.length;i++){
    const gp=solved57[i];
    if(gp.length<5||!lexicon.has(gp.length+':'+gp.slice(1).join(',')))continue;
    for(const [a,b] of [[5,13],[17,7]]){
      const plant=encryptPlant(gp,mode,a,b,(9*i+a+b)%29);
      const ranks=observedRanks(plant,mode);
      assert.deepEqual(ranks.slice(1).map(r=>r===28?28:(a*r+b)%28),gp.slice(1));
      assert(findNative(ranks).some(x=>x.a===a&&x.b===b));
      positiveFromSolved++;
    }
  }
  const sample=[...rawLex.matchAll(/^([a-z]+) (\d+)$/gm)]
    .map(m=>({s:m[1],gp:nativeGP(m[1])}))
    .filter(x=>x.gp&&x.gp.length>=7&&x.gp.length<=12)
    .slice(0,40);
  assert.equal(sample.length,40);
  for(let i=0;i<sample.length;i++){
    const gp=sample[i].gp;
    const a=units[i%units.length],b=(17*i+3)%28;
    const plant=encryptPlant(gp,mode,a,b,(i*7+8)%29);
    const ranks=observedRanks(plant,mode);
    assert.deepEqual(ranks.slice(1).map(r=>r===28?28:(a*r+b)%28),gp.slice(1));
    assert(findNative(ranks).some(x=>x.a===a&&x.b===b));
    positiveFromLexicon++;
  }
}
assert(positiveFromSolved>0,'Expected source-authentic solved p57 words in lexicon');
assert.equal(positiveFromLexicon,80);
console.log(JSON.stringify({
  source:{unknownRunes:original.length,unknownWords:words.length,
    nativeLexEntries:encoded,suffixKeys:lexicon.size},
  rule:{secretInvertibleAffineKeysPerWord:336,
    independentFirstPlaintextRune:true,alpha:28,
    equalCipherRemainderIsEA:true},
  original:baseline,
  positive:{solved57Roundtrips:positiveFromSolved,
    independentEnglishWordRoundtrips:positiveFromLexicon},
  conclusion:'Both named word-private 336-key rank inverses have zero English matches among 559 original length>=7 words.'
},null,2));
console.log('PASS: original rank28 independent word-private affine native-English inverse gate.');
