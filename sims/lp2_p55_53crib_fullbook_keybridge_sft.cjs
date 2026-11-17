'use strict';

/**
 * Original p55 53-rune two-crib recovered-key test, for a concrete
 * possibility of decoding its untouched 23-rune prefix.
 *
 * C1: contemporary May 2014 participant guess ENLIGHTENMENT AWAITS THOSE
 * C2: moth-linked exact GP29-length native LP1 phrase
 * THE TOTIENT FUNCTION IS SACRED ALL THINGS
 * Both are conditional and NOT authenticated plaintext.
 *
 * For a word-preserving GP29 additive or ciphertext-difference cipher,
 * derive all 53 required key symbols, then search the complete intact
 * original unknown manuscript, solved p56+p57, original LP1 rune
 * transcription, LP1 translated-reference prose and authenticated
 * 2016 signed prose for a contiguous source key, allowing affine GP29
 * and both source read directions. Additionally grant an arbitrary secret
 * global GP29 alphabet bijection on these donor registers, testing its
 * exact necessary equality constraints without searching 29! candidates.
 * Also test whether an inferred low-order
 * GF29 key recurrence predicts held-out crib symbols. The predeclared
 * key-only match threshold is all 53 symbols, with independent prefix
 * recovery as positive. No target fitting may be added after the screen.
 *
 * Windows Node22: node sims/lp2_p55_53crib_fullbook_keybridge_sft.cjs
 * Single read-only CommonJS file. Uses original repository sources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const get = name => fs.readFileSync(path.join(root,name),'utf8');
const gp = JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const tr = get('resources/liber-primus/lp2-transcription.txt');
const mod = x => ((x%29)+29)%29;
const dictionary = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
const p55 = gp.pages[55].indices;
assert.equal(p55.length,76);
const printedWords = tr.split('%')[54].replace(/\/\s*/g,'')
  .match(/[\u16A0-\u16FF]+/gu);
assert.deepEqual(printedWords.map(w=>[...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
/** @param {string} input @returns {number[]} */
function encode(input){
  const word=input.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<word.length;){
    if(word.startsWith('ING',i)){out.push(21);i+=3;}
    else if(word.startsWith('IO',i)){out.push(27);i+=2;}
    else{
      const t=dictionary.find(t=>word.startsWith(t.s,i));
      assert(t,'missing GP token '+word.slice(i));
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const phrases=['ENLIGHTENMENT AWAITS THOSE',
  'THE TOTIENT FUNCTION IS SACRED ALL THINGS'];
const words=phrases.join(' ').split(' ');
const lengths=words.map(w=>encode(w).length);
assert.deepEqual(lengths,[13,6,4,2,7,7,2,6,3,3]);
const known=words.flatMap(encode);
assert.equal(known.length,53);
const sourceUnknown=gp.pages.filter(p=>p.page<56)
  .flatMap(p=>p.indices);
const sourceSolved=gp.pages.filter(p=>p.page>=56)
  .flatMap(p=>p.indices);
assert.equal(sourceUnknown.length,12956);
assert.equal(sourceSolved.length,180);
// The original first release and the authenticated signed follow-up are
// candidate *donor material*, never original LP2 plaintext or fitted keys.
const gpIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const lp1Original=[...get('resources/transcriptions/lp1_wulfic_canonical.txt')]
  .filter(ch=>gpIndex.has(ch)).map(ch=>gpIndex.get(ch));
assert(lp1Original.length>2000);
const editorialReference=get('resources/liber-primus/lp1-plaintext-reference.txt');
const lp1Translated=editorialReference.split(/^### /m)
  .filter(section=>/^([1-9]|1[0-7])\b/.test(section))
  .join('\n').split('\n')
  .filter(line=>line && !line.startsWith('#') && !line.startsWith('[')
    && !/^\d+\s*$/.test(line))
  .join(' ').match(/[A-Za-z]+/g).flatMap(encode);
assert(lp1Translated.length>500);
const signedText=get('resources/historical/cicada2016-4gq25-outguess.asc');
const signedBody=signedText.split('-----BEGIN PGP SIGNED MESSAGE-----')[1]
  .split('\n\n').slice(1).join('\n\n')
  .split('-----BEGIN PGP SIGNATURE-----')[0];
const signedLatin=signedBody.match(/\b[A-Za-z]+\b/g);
assert.equal(signedLatin.length,43);
const signedGP=signedLatin.flatMap(encode);
assert(signedGP.length>100);
/** @param {string} pathOfSigned */
function sourceGPFromSigned(pathOfSigned){
  const raw=get(pathOfSigned).replace(/\r\n/g,'\n');
  assert(raw.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'));
  const body=raw.split('-----BEGIN PGP SIGNED MESSAGE-----')[1]
    .split('\n\n').slice(1).join('\n\n')
    .split('-----BEGIN PGP SIGNATURE-----')[0];
  const lines=body.split('\n')
    .filter(line=>!/^\s*[0-9a-f]{32,}\s*$/i.test(line));
  const words=lines.join(' ').match(/\b[A-Za-z]+\b/g)||[];
  return words.flatMap(encode);
}
const sourceSigned2014=sourceGPFromSigned('resources/cicada2014-may2-signed-message.asc');
const sourceSigned2014stage9=sourceGPFromSigned('resources/historical/cicada2014-stage09-first-jpeg-recovered.asc');
const sourceSigned2012midi=sourceGPFromSigned('resources/historical/cicada2012-midi-email.asc');
const sourceSigned2013=sourceGPFromSigned('resources/historical/cicada2013-no-more-testing.asc');
assert(sourceSigned2014.length>=53);
assert(sourceSigned2014stage9.length>=53);
assert(sourceSigned2012midi.length>=53);
assert(sourceSigned2013.length>=53);

/** @param {number[]} C @param {number[]} P @param {'direct'|'delta'} kind */
function knownKey(C,P,kind){
  return P.map((p,i)=>mod(C[23+i]-(kind==='delta'?C[22+i]:0)-p));
}
/** @param {number} a @param {number} n */
function pow(a,n){
  let x=1;
  while(n){if(n&1)x=mod(x*a);a=mod(a*a);n>>=1;}
  return x;
}
/** @param {number[]} seq */
function berlekampMassey(seq){
  const n=seq.length,C=Array(n+1).fill(0),B=Array(n+1).fill(0);
  C[0]=B[0]=1;
  let length=0,age=1,last=1;
  for(let i=0;i<n;i++){
    let delta=seq[i];
    for(let j=1;j<=length;j++)delta=mod(delta+C[j]*seq[i-j]);
    if(!delta){age++;continue;}
    const old=[...C],factor=mod(delta*pow(last,27));
    for(let j=0;j<=n-age;j++)
      C[j+age]=mod(C[j+age]-factor*B[j]);
    if(2*length<=i){
      length=i+1-length;
      for(let j=0;j<B.length;j++)B[j]=old[j];
      last=delta;age=1;
    } else age++;
  }
  return {degree:length,coefficients:C.slice(0,length+1)};
}
/** @param {number[]} key @param {number} cutoff */
function predict(key,cutoff){
  const model=berlekampMassey(key.slice(0,cutoff));
  const state=key.slice(0,cutoff);
  for(let i=cutoff;i<key.length;i++){
    let acc=0;
    for(let j=1;j<=model.degree;j++)
      acc+=model.coefficients[j]*state[i-j];
    state.push(mod(-acc));
  }
  return {
    inferredDegree:model.degree,
    correct:state.slice(cutoff)
      .filter((v,i)=>v===key[cutoff+i]).length,
    total:key.length-cutoff
  };
}
/**
 * @param {number[]} key
 * @param {number[]} source
 * @param {boolean} reversed
 */
function bestAffinePrefix(key,source,reversed){
  const seq=reversed?[...source].reverse():source;
  let best={prefix:0,offset:-1,a:0,b:0};
  let full53=0;
  for(let start=0;start<=seq.length-key.length;start++){
    const first=seq[start];
    for(let a=1;a<29;a++){
      const b=mod(key[0]-a*first);
      let j=1;
      while(j<key.length && mod(a*seq[start+j]+b)===key[j])j++;
      if(j>best.prefix){
        best={prefix:j,
          offset:reversed?source.length-1-start:start,
          a,b};
      }
      if(j===key.length)full53++;
    }
  }
  return {...best,full53};
}
/**
 * Exact, keyless source-compatibility test for a single arbitrary secret
 * GP29 permutation applied to a contiguous source's symbols. A full53
 * match is necessary for the same static source substitution key to
 * recover p55. This grants up to 29! secret mappings without brute force.
 * @param {number[]} key @param {number[]} source
 * @param {boolean} reversed
 */
function bestPermutationPrefix(key,source,reversed){
  const seq=reversed?[...source].reverse():source;
  let best={prefix:0,offset:-1};
  let full53=0;
  for(let start=0;start<=seq.length-key.length;start++){
    const map=Array(29).fill(-1),inverse=Array(29).fill(-1);
    let j=0;
    for(;j<key.length;j++){
      const from=seq[start+j],to=key[j];
      if((map[from]>=0 && map[from]!==to) ||
         (inverse[to]>=0 && inverse[to]!==from))break;
      map[from]=to;inverse[to]=from;
    }
    if(j>best.prefix){
      best={prefix:j,offset:reversed?source.length-1-start:start};
    }
    if(j===key.length)full53++;
  }
  return {...best,full53};
}
/**
 * Extend an order-d discovered recurrence 23 positions backwards
 * from known keys at 23..75. Only possible with nonzero final lag.
 * @param {number[]} tail
 * @param {number[]} coeff
 */
function extendBack(tail,coeff){
  const d=coeff.length-1;
  assert(d>0&&d<23&&coeff[d]!==0);
  const key=Array(76);
  for(let i=0;i<53;i++)key[23+i]=tail[i];
  for(let at=22;at>=0;at--){
    const i=at+d;
    let accum=key[i];
    for(let j=1;j<d;j++)
      accum+=coeff[j]*key[i-j];
    key[at]=mod(-accum*pow(coeff[d],27));
  }
  return key;
}
/** @param {number[]} plaintext @param {number[]} stream @param {'direct'|'delta'} kind */
function encrypt(plaintext,stream,kind){
  const cipher=[];
  for(let i=0;i<plaintext.length;i++)
    cipher.push(mod(plaintext[i]+stream[i]+
      (kind==='delta'?(i?cipher[i-1]:0):0)));
  return cipher;
}
/** @param {number[]} cipher @param {number[]} stream @param {'direct'|'delta'} kind */
function decrypt(cipher,stream,kind){
  return cipher.map((c,i)=>mod(c-stream[i]-
    (kind==='delta'?(i?cipher[i-1]:0):0)));
}
const plantedPlain=gp.pages[57].indices.slice(0,76);
assert.equal(plantedPlain.length,76);
const positive=[];
for(const kind of ['direct','delta']){
  // PLANT A: independent low-order native GP key with 53 known
  // p55-tail symbols yields full untouched 23-rune prefix recovery.
  const plantedKey=[2,3,5,7,11,13,17];
  const coeff=[1,2,3,5,7,11,13,17];
  for(let i=7;i<76;i++){
    let v=0;
    for(let j=1;j<=7;j++)v+=coeff[j]*plantedKey[i-j];
    plantedKey.push(mod(-v));
  }
  const c=encrypt(plantedPlain,plantedKey,kind);
  const prefixKnown=knownKey(c,plantedPlain.slice(23),kind);
  assert.deepEqual(prefixKnown,plantedKey.slice(23));
  const recovered=berlekampMassey(prefixKnown);
  assert.equal(recovered.degree,7);
  const back=extendBack(prefixKnown,recovered.coefficients);
  assert.deepEqual(back,plantedKey);
  assert.deepEqual(decrypt(c,back,kind),plantedPlain);

  // PLANT B: known original p57 donor with one secret affine alphabet
  // permits direct source recovery of every unknown prefix symbol.
  const donor=sourceSolved;
  const donorStart=29,a=17,b=4;
  const affine=Array.from({length:76},
    (_,i)=>mod(a*donor[donorStart+i]+b));
  const c2=encrypt(plantedPlain,affine,kind);
  const knownAffine=knownKey(c2,plantedPlain.slice(23),kind);
  const match=bestAffinePrefix(knownAffine,donor,false);
  assert.equal(match.prefix,53);
  assert.equal(match.offset,donorStart+23);
  assert.equal(match.a,a);
  assert.equal(match.b,b);
  const recoveredKey=Array.from({length:76},
    (_,i)=>mod(match.a*donor[donorStart+i]+match.b));
  assert.deepEqual(decrypt(c2,recoveredKey,kind),plantedPlain);
  // PLANT C: the original LP2 glyph stream as a hidden running key
  // under an arbitrary non-affine secret 29-symbol bijection.
  // This original source window has 23/23 prefix donor symbols already
  // witnessed in the 53-key training suffix.
  const donorIndex=105,donorGlyphs=sourceUnknown;
  const secretPerm=Array.from({length:29},(_,i)=>i);
  let state=0x3301d15c;
  for(let i=28;i>0;i--){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    const j=(state>>>0)%(i+1);
    [secretPerm[i],secretPerm[j]]=[secretPerm[j],secretPerm[i]];
  }
  const secretKey=donorGlyphs.slice(donorIndex-23,donorIndex+53)
    .map(x=>secretPerm[x]);
  const planted3=encrypt(plantedPlain,secretKey,kind);
  const suffixKey=knownKey(planted3,plantedPlain.slice(23),kind);
  const found=bestPermutationPrefix(suffixKey,donorGlyphs,false);
  assert.equal(found.prefix,53);
  assert.equal(found.full53,1);
  assert.equal(found.offset,donorIndex);
  const recoveredPerm=Array(29).fill(-1);
  for(let i=0;i<53;i++)
    recoveredPerm[donorGlyphs[found.offset+i]]=suffixKey[i];
  const recoveredPrefix=donorGlyphs.slice(found.offset-23,found.offset)
    .map(x=>recoveredPerm[x]);
  assert(recoveredPrefix.every(x=>x>=0));
  assert.deepEqual(decrypt(planted3.slice(0,23),recoveredPrefix,kind),
    plantedPlain.slice(0,23));
  positive.push({kind,linearDegree:recovered.degree,
    linearHeldoutRecovered:23,sourceAffinePrefix:match.prefix,
    sourceAffineHeldoutRecovered:23,permutationPrefix:found.prefix,
    permutationHeldoutRecovered:23});
}
const output=[];
for(const kind of ['direct','delta']){
  const key=knownKey(p55,known,kind);
  const record={kind,originalKey53:key,
    fullLinearDegree:berlekampMassey(key).degree,
    sourceCrib23LinearDegree:berlekampMassey(key.slice(0,23)).degree,
    heldout26:predict(key,26),heldout40:predict(key,40),
    sourceMatches:[],permutationMatches:[]};
  for(const [name,source] of [
    ['original LP2 p0-55',sourceUnknown],
    ['original solved p56+p57',sourceSolved],
    ['original LP1 runes',lp1Original],
    ['LP1 edited plain reference',lp1Translated],
    ['2016 verified signed words',signedGP],
    ['2014 signed enlightenment message',sourceSigned2014],
    ['2014 signed stage9 original instructions',sourceSigned2014stage9],
    ['2012 signed MIDI/poem instructions',sourceSigned2012midi],
    ['2013 signed no-more-testing note',sourceSigned2013]
  ]){
    for(const reversed of [false,true]){
      record.sourceMatches.push({source:name,reversed,
        ...bestAffinePrefix(key,source,reversed)});
      record.permutationMatches.push({source:name,reversed,
        ...bestPermutationPrefix(key,source,reversed)});
    }
  }
  output.push(record);
}
assert.deepEqual(output.map(x=>x.fullLinearDegree),[27,27]);
assert.deepEqual(output.map(x=>x.sourceCrib23LinearDegree),[12,12]);
assert.deepEqual(output.map(x=>x.heldout40.correct),[1,2]);
assert(output.every(x=>x.sourceMatches.every(m=>m.full53===0)));
assert(output.every(x=>x.permutationMatches.every(m=>m.full53===0)));

console.log(JSON.stringify({
  classification:'conditional historical 53-rune known-plaintext-key recovery, no authentic unknown p55 plaintext',
  sourceWarning:'Both plaintext segments remain unverified hypotheses; their concatenation is NOT a Cicada-authenticated source quote',
  originalPrintedShape:printedWords.map(x=>[...x].length),
  conditionalCrib:phrases,cribGP29Symbols:known.length,
  donorLengths:{originalLP2:sourceUnknown.length,solvedLP2:sourceSolved.length,
    originalLP1:lp1Original.length,editedLP1:lp1Translated.length,
    signed2016:signedGP.length,signed2014:sourceSigned2014.length,
    signedStage9:sourceSigned2014stage9.length,
    signed2012MIDI:sourceSigned2012midi.length,
    signed2013Note:sourceSigned2013.length},
  nativePlantPositive:positive,originalResults:output
},null,2));
