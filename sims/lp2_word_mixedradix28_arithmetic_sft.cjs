'use strict';
/**
 * Frozen original-input test: a GP29 printable no-repeat transport over a
 * GP28 successor code, combined with exact static arithmetic word coding.
 *
 * The source provides BASE29 and printed word separators, and strongly
 * suppresses exact adjacent rune repeats. It does not authenticate this codec.
 * Distinct from the existing base29 arithmetic word code and direct GP28
 * predecessor transforms: the arithmetic coder is variable-length, EOS
 * terminated and reconstructed canonically under mixed radix 29/28 or radix28.
 *
 * Node 22, CommonJS, built-ins only; read-only, no writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/lp2-transcription.txt');
const reference=read('resources/liber-primus/lp1-plaintext-reference.txt');
assert.equal(gp.runes.length,29);
const lex=gp.translit.map((s,i)=>({s:s.toLowerCase(),i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** Authentic source-calibrated greedy ING/IO spelling; @param {string} w */
function gpWord(w){
  w=w.toLowerCase().replace(/v/g,'u').replace(/k/g,'c').replace(/z/g,'s');
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ing',i)){out.push(21);i+=3;continue;}
    const token=lex.find(t=>w.startsWith(t.s,i));
    if(!token)throw Error('untransliterable '+w);
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
assert.equal(freq[29],876);
assert.deepEqual(freq.slice(0,8),[74,178,119,330,216,122,58,104]);
const pages=transcript.split(/\s*%\s*/);
assert.equal(pages.length,57);
const runeNumber=new Map(gp.runes.map((r,i)=>[r,i]));
/** Rejoin physical page and line wraps before applying genuine word separators.
 * @param {number} first @param {number} last
 */
function words(first,last){
  return pages.slice(first,last+1).join('').replaceAll('/','')
    .replace(/\s/g,'').split(/[-.&$§,:!?]/u)
    .map(s=>[...s].filter(c=>runeNumber.has(c)).map(c=>runeNumber.get(c)))
    .filter(w=>w.length);
}
/**
 * The first digit uses radix29 for word-reset mode. Otherwise each source rune
 * is encoded as its zero-based rank in 0..28 *excluding the previous glyph*.
 * On an immediately repeated source glyph the transport is undefined; record
 * such original words as hard exceptions, never silently edit a source rune.
 * @param {number[]} cipher @param {'word'|'carry'} mode @param {number} prev
 */
function interval(cipher,mode,prev){
  let value=0n,denominator=1n,last=prev;
  for(let i=0;i<cipher.length;i++){
    const x=cipher[i],radix=mode==='word'&&i===0?29:28;
    if(radix===28&&x===last)return null;
    const rank=radix===29?x:x<last?x:x-1;
    value=value*BigInt(radix)+BigInt(rank);
    denominator*=BigInt(radix);
    last=x;
  }
  return {value,denominator};
}
/**
 * Freeze a 30-symbol arithmetic language model and encode a word + EOS.
 * Choose the smallest nonnegative integer and the *shortest* mixed-radix
 * interval fully contained in the rational arithmetic output interval.
 * @param {number[]} plain @param {'word'|'carry'} mode @param {number} prev
 */
function encode(plain,mode,prev){
  let lo=0n,hi=1n,den=1n;
  for(const s of [...plain,29]){
    const width=hi-lo;
    const a=lo*total+width*BigInt(cumulative[s]);
    const b=lo*total+width*BigInt(cumulative[s+1]);
    lo=a;hi=b;den*=total;
  }
  let capacity=1n;
  for(let n=1;n<=100;n++){
    capacity*=BigInt(mode==='word'&&n===1?29:28);
    let v=(lo*capacity+den-1n)/den;
    if((v+1n)*den>hi*capacity)continue;
    const digits=Array(n).fill(0);
    for(let i=n-1;i>=0;i--){
      const radix=BigInt(mode==='word'&&i===0?29:28);
      digits[i]=Number(v%radix);v/=radix;
    }
    let last=prev;
    for(let i=0;i<n;i++){
      if(mode==='word'&&i===0){last=digits[i];continue;}
      const x=digits[i]<last?digits[i]:digits[i]+1;
      digits[i]=x;last=x;
    }
    return digits;
  }
  throw Error('canonical arithmetic-prefix overflow');
}
/** @param {number[]} cipher @param {'word'|'carry'} mode @param {number} prev */
function decode(cipher,mode,prev){
  const source=interval(cipher,mode,prev);
  if(!source)return {kind:'doublet',out:[]};
  let num=2n*source.value+1n,den=2n*source.denominator;
  const out=[];
  for(let i=0;i<75;i++){
    const q=num*total/den;
    const s=freq.findIndex((_,j)=>q<BigInt(cumulative[j+1]));
    if(s===29)return {kind:out.length?'complete':'empty',out};
    assert(s>=0,'arithmetic partition');
    out.push(s);
    num=num*total-BigInt(cumulative[s])*den;
    den*=BigInt(freq[s]);
  }
  return {kind:'runoff',out};
}
const cases=[
  ['p0–2',0,2,0,158],
  ['p33–39',33,39,gp.pages[32].indices.at(-1),378],
  ['p54–55',53,54,gp.pages[53].indices.at(-1),66],
  ['p57 clear',56,56,gp.pages[56].indices.at(-1),20]
];
const expected={
  word:[[127,29,2,0,2],[300,70,8,0,3],[55,10,1,0,2],[17,2,1,0,0]],
  carry:[[123,31,4,0,4],[299,67,12,0,6],[53,10,3,0,1],[18,1,1,0,0]]
};
const results=[];
for(const mode of ['word','carry']){
  let previous=mode==='word'?0:13;
  let controls=0;
  for(const plain of native.slice(50,250)){
    const cipher=encode(plain,mode,previous);
    const decoded=decode(cipher,mode,previous);
    assert.equal(decoded.kind,'complete');
    assert.deepEqual(decoded.out,plain);
    assert.deepEqual(encode(decoded.out,mode,previous),cipher);
    for(let i=1;i<cipher.length;i++)assert.notEqual(cipher[i],cipher[i-1]);
    if(mode==='carry')assert.notEqual(cipher[0],previous);
    previous=cipher.at(-1);
    controls++;
  }
  assert.equal(controls,200);
  for(const [j,[name,a,b,start,wordCount]] of cases.entries()){
    const source=words(a,b);
    assert.equal(source.length,wordCount,name);
    const summary={mode,region:name,sourceWords:wordCount,complete:0,
      empty:0,doublet:0,runoff:0,canonical:0,examples:[]};
    let prev=start;
    for(const [i,cipher] of source.entries()){
      const candidate=decode(cipher,mode,prev);
      if(candidate.kind==='complete'){
        summary.complete++;
        if(encode(candidate.out,mode,prev).join(',')===cipher.join(',')){
          summary.canonical++;
          if(summary.examples.length<5)summary.examples.push({
            wordIndex:i,
            source:cipher.map(x=>gp.translit[x]).join(''),
            decoded:candidate.out.map(x=>gp.translit[x]).join('')
          });
        }
      }else summary[candidate.kind]++;
      prev=cipher.at(-1);
    }
    assert.deepEqual([summary.complete,summary.empty,summary.doublet,
      summary.runoff,summary.canonical],expected[mode][j],name+' '+mode);
    results.push(summary);
  }
}
console.log(JSON.stringify({
  model:'source-native GP29 frequencies, arithmetic+EOS, canonical radix29/28 or carry radix28',
  sourceModelWords:native.length,frequencyTotal:Number(total),
  positivePlantedNativeWordsPerMode:200,
  result:'Neither fixed no-repeat word entropy transport recovers original unknown plaintext; 86 repeated adjacent runes require another authored escape rule.',
  results
},null,2));
