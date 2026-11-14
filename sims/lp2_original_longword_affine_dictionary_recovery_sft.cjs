'use strict';
/**
 * Direct original-word known-plaintext recovery test:
 * entire printed words of >=8 GP runes under a per-word invertible affine
 * alphabet C = a*P+b (mod29), a!=0, b arbitrary.
 *
 * A source-native English dictionary is built from existing unchanged
 * control registers; solved p56/p57 words serve independent anchors.
 * No key guessing, no synthetic "best words" promoted as plaintext.
 * Node22 CommonJS, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus,physicalLP2Page}=require('./lp2_word_pages.cjs');
const gp=require('../resources/liber-primus/lp2-corpus.json');
const root=path.join(__dirname,'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const known=gp.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
const index=new Map(gp.runes.map((r,i)=>[r,i]));
const mod=x=>(x%29+29)%29;
const inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,i)=>i+1).find(y=>x*y%29===1):0);
function encode(s){
 const upper=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C')
  .replace(/Z/g,'S').replace(/Q/g,'C');
 const result=[];
 for(let i=0;i<upper.length;){
  const k=known.find(o=>upper.startsWith(o.token,i));
  if(!k)return null;
  result.push(k.index);
  i+=k.token.length;
 }
 return result;
}
function signature(array){
 const first=array[0];
 let j=1;
 while(j<array.length&&first===array[j])j++;
 if(j===array.length)return null;
 const factor=inv[mod(array[j]-first)];
 return array.map(x=>mod(x-first)*factor%29).join(',');
}
const sources=[
 ['English-frequency','resources/control/english_wordfreq_textblob.txt'],
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
];
const dictionary=new Map();
for(const [label,file] of sources)for(const word of read(file).match(/[A-Za-z]+/g)||[]){
 const g=encode(word);
 if(!g||g.length<8||g.length>14)continue;
 const key=signature(g);if(!key)continue;
 const arr=dictionary.get(key)||[];
 if(!arr.some(z=>z.runes.join(',')===g.join(',')))arr.push({word:word.toUpperCase(),runes:g,source:label});
 dictionary.set(key,arr);
}
for(const page of gp.pages.filter(p=>p.page===56||p.page===57)){
 const text=page.text || page.runes || '';
 for(const word of String(text).match(/[A-Za-z]+/g)||[]){
  const g=encode(word);
  if(!g||g.length<8||g.length>14)continue;
  const key=signature(g);if(!key)continue;
  const arr=dictionary.get(key)||[];
  if(!arr.some(z=>z.runes.join(',')===g.join(',')))arr.push({word:word.toUpperCase(),runes:g,source:'solved-LP2'});
  dictionary.set(key,arr);
 }
}
const words=parseSharedCorpus().words;
assert.equal(words.length,2896);
const queries=words.map((w,i)=>({
 i,p:physicalLP2Page(w.startPage),endPage:physicalLP2Page(w.endPage),
 runes:Array.from(w.runes,r=>index.get(r))
})).filter(w=>w.runes.length>=8);
const hits=[];
for(const w of queries){
 const key=signature(w.runes);
 for(const d of dictionary.get(key)||[]){
  const p=d.runes,c=w.runes;
  let j=1;while(j<p.length&&p[j]===p[0])j++;
  const a=mod(c[j]-c[0])*inv[mod(p[j]-p[0])]%29;
  const b=mod(c[0]-a*p[0]);
  assert(a>0&&p.length===c.length);
  assert(c.every((v,k)=>v===mod(a*p[k]+b)));
  hits.push({page:w.p,endPage:w.endPage,wordIndex:w.i,wordLen:c.length,
    candidate:d.word,source:d.source,a,b,cipher:c,plain:p});
 }
}
const uniqueDictionary=[...dictionary.values()].reduce((t,x)=>t+x.length,0);
const bySource=Object.fromEntries(sources.map(x=>[x[0],0]));
for(const values of dictionary.values())for(const v of values)if(v.source in bySource)bySource[v.source]++;
const longest=queries.reduce((a,w)=>Math.max(a,w.runes.length),0);
const morphology=queries.filter(x=>x.p===53||x.p===55);
console.log('ORIGINAL_NATIVE_WORD_AFFINE '+JSON.stringify({
 sourceRunes:12956,sourceWords:words.length,cipherWords8Plus:queries.length,
 maxCipherWordLen:longest,nativeDictionarySignatures:dictionary.size,
 dictionaryUniqueWords:uniqueDictionary,dictionarySourceContribution:bySource,
 mothWord8Plus:morphology.length,hits,
 originalMothHits:hits.filter(x=>x.page===53||x.page===55)
}));
const sample=[...dictionary.values()].flat().filter(x=>x.runes.length>=8);
assert(sample.length>100);
for(let i=0;i<30;i++){
 const d=sample[(i*673)%sample.length];
 const a=1+(i%28),b=(i*17+3)%29,encrypted=d.runes.map(x=>mod(a*x+b));
 const recovered=(dictionary.get(signature(encrypted))||[])
   .find(x=>x.runes.join(',')===d.runes.join(','));
 assert(recovered,'Positive known-word affine plant must recover unaltered word');
}
console.log('PLANT 30/30 GP29 native words recovered after independently keyed affine encipherment');
