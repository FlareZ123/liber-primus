'use strict';
/**
 * Exact all-secret-state plaintext-letter capacity for the reversible
 * EA/T6/U5/E5 tableau from lossless_echo_table_inverse.cjs.
 *
 * For each public state (previous ciphertext rune, clock phase) every secret
 * rotation 0..27 is unrestricted. Because the tableau is determined solely
 * by published ciphertext history, the maximal count of a given plaintext
 * symbol is a sum of independent per-state maxima. This is an EXACT global
 * optimization over an exponentially large family, no heuristic fitting.
 *
 * Scope: the previously postselected tableau, original GP rune-word borders,
 * single universal state-key table, direct GP-language plaintext.
 * SFT: node sims/lossless_echo_predecessor_clock_capacity.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const {gpText,partial,permutation,descriptors,decryptPrepared}=
  require('./lossless_echo_table_inverse.cjs');

const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const source=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const id=new Map(source.runes.map((r,i)=>[r,i]));
const WORDS=parseSharedCorpus().words.map(w=>[...w.runes].map(c=>id.get(c)));
const ORIGINAL=WORDS.flat();
assert.equal(ORIGINAL.length,12956);
assert.equal(WORDS.length,2896);
assert.deepEqual(ORIGINAL,source.pages.filter(p=>p.page<56&&p.indices.length)
  .flatMap(p=>p.indices));
const MAX_WORD=Math.max(...WORDS.map(w=>w.length));
const GP_E=18;

/** Original section/page/word clocks, checked against source parser. */
function originalCoordinates(){
  const raw=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
  const result=[];
  let global=0,sectionAt=0,pageAt=0,wordAt=0;
  for(const c of raw){
    if(id.has(c)){
      result.push({global:global++,sectionAt:sectionAt++,pageAt:pageAt++,wordAt:wordAt++});
    }else if(c==='%'){pageAt=0;}
    else if(c==='$'){sectionAt=0;wordAt=0;}
    else if(c==='/'||/\s/u.test(c)){}
    else {wordAt=0;}
  }
  assert.equal(result.length,ORIGINAL.length);
  let ptr=0;
  for(const w of WORDS)for(let j=0;j<w.length;j++)
    assert.equal(result[ptr++].wordAt,j);
  return result;
}
const COORD=originalCoordinates();

/** Cipher-derived descriptors with preserved predecessor glyph and clock. */
function observed(cipherwords){
  const desc=descriptors(cipherwords);
  const prev=[];
  let last=8;
  for(const word of cipherwords)for(const c of word){
    prev.push(last);last=c;
  }
  assert.equal(prev.length,desc.length);
  return desc.map((item,i)=>({
    ...item,prev:prev[i], ...COORD[i]
  }));
}

/**
 * @param {ReturnType<typeof observed>} data
 * @param {string} clock one of original source clock names
 * @param {number} period 1..29, except exact unrestricted word position
 * @param {number} target GP symbol
 */
function capacity(data,clock,period,target=GP_E){
  const width=clock==='wordExact'?MAX_WORD+1:period;
  const buckets=Array.from({length:29*width},()=>new Uint16Array(28));
  let forced=0;
  for(const item of data){
    if(item.fixed>=0){if(item.fixed===target)forced++;continue;}
    const time=clock==='wordExact'?item.wordAt:item[clock]%period;
    const bins=buckets[item.prev*width+time];
    const n=item.free.length;
    for(let k=0;k<28;k++){
      const plain=item.free[(item.rank-(k%n)+n)%n];
      if(plain===target)bins[k]++;
    }
  }
  let maximum=forced;
  let activeStates=0;
  for(const bucket of buckets){
    const best=Math.max(...bucket);maximum+=best;
    if(best>0)activeStates++;
  }
  return {maximum,forced,activeStates,states:29*width};
}
/** GP-native reference window extrema (all starts, no sampling). */
function windows(name,sourceText,size=ORIGINAL.length){
  const corpus=gpText(sourceText);
  let count=0;
  for(let i=0;i<size;i++)if(corpus[i]===GP_E)count++;
  let minimum=count,maximum=count,minAt=0;
  for(let i=size;i<corpus.length;i++){
    count+=Number(corpus[i]===GP_E)-Number(corpus[i-size]===GP_E);
    if(count<minimum){minimum=count;minAt=i-size+1;}
    maximum=Math.max(maximum,count);
  }
  return {name,sourceGP:corpus.length,windows:corpus.length-size+1,
    minE:minimum,maxE:maximum,minAt};
}
function rng(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
}
/**
 * Original-word-layout, real-literary-GP positive with an arbitrarily
 * secret predecessor×word-position key. All symbols must round-trip.
 */
function sourceNativePlant(){
  const literature=gpText(read('resources/control/shakespeare_first300k.txt'));
  const plain=literature.slice(17000,17000+ORIGINAL.length);
  assert.equal(plain.length,ORIGINAL.length);
  const next=rng(0x3301ea16),width=MAX_WORD+1;
  const key=Array.from({length:29*width},()=>next()%28);
  const cipherwords=[];
  let last=8,at=0;
  for(const w of WORDS){
    const c=[];
    for(let i=0;i<w.length;i++){
      const step=partial(last,c,i);
      const row=permutation(step,key[last*width+i]);
      const out=row[plain[at++]];
      c.push(out);last=out;
    }
    cipherwords.push(c);
  }
  assert.equal(at,ORIGINAL.length);
  const publicData=observed(cipherwords);
  const knownKey=(i,_n)=>key[publicData[i].prev*width+publicData[i].wordAt];
  const recovered=decryptPrepared(descriptors(cipherwords),knownKey);
  assert.deepEqual(recovered,plain);
  const cap=capacity(publicData,'wordExact',0,GP_E);
  const trueE=plain.filter(x=>x===GP_E).length;
  assert(cap.maximum>=trueE);
  let reconstructed=[],last2=8,off=0;
  for(const w of WORDS){
    const c=[];
    for(let i=0;i<w.length;i++){
      const row=permutation(partial(last2,c,i),key[last2*width+i]);
      const out=row[recovered[off++]];
      c.push(out);reconstructed.push(out);last2=out;
    }
  }
  assert.deepEqual(reconstructed,cipherwords.flat());
  return {trueE,capacity:cap.maximum,plaintextRecovered:recovered.length,
    encryptedRecovered:reconstructed.length,wordStateKeys:key.length};
}
function main(){
  const real=observed(WORDS);
  const original={runes:ORIGINAL.length,words:WORDS.length,
    maxWordLength:MAX_WORD,
    forcedE:real.filter(x=>x.fixed===GP_E).length,
    noClock:capacity(real,'global',1),
    arbitraryWordPosition:capacity(real,'wordExact',0)};
  const clocks={};
  for(const clock of ['global','sectionAt','pageAt','wordAt']){
    const values=Array.from({length:29},(_,p)=>capacity(real,clock,p+1).maximum);
    clocks[clock]={
      maxEByPeriod1to29:values,
      firstPeriodAtLeast1400:values.findIndex(x=>x>=1400)+1||null,
      firstPeriodAtLeast1575:values.findIndex(x=>x>=1575)+1||null
    };
  }
  const controls=[
    windows('Shakespeare300k',read('resources/control/shakespeare_first300k.txt')),
    windows('GibranProphet',read('resources/control/gibran_prophet_58585.txt')),
    windows('EmersonEssays',read('resources/control/emerson_essays_2944.txt'))
  ];
  const positive=sourceNativePlant();
  console.log(JSON.stringify({
    result:'Exact original-data predecessor×clock rotational-key capacity for EA/T6/U5/E5 tableau',
    sourceModel:'Previously published, postselected lossless_echo_table_inverse partial/permutation',
    original,clocks,controls,positive,
    interpretation:'Necessary count bound for native GP prose with original visible word boundaries. No LP2 plaintext or historical mechanism recovered.'
  },null,2));
}
if(require.main===module)main();
module.exports={originalCoordinates,observed,capacity,windows,sourceNativePlant};
