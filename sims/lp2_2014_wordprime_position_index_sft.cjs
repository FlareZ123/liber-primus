'use strict';
/**
 * One frozen interpretation of a 2014 participant conjecture:
 * S = sum of plaintext-word GP prime weights; q=0 per printed word;
 * plaintext F is transparent and does not advance q; otherwise
 * K=(prime[S+q]-1) mod29 and C=P+K mod29 (one-based prime index).
 * This is not an authenticated Cicada instruction.
 *
 * Run: node sims/lp2_2014_wordprime_position_index_sft.cjs
 * Node.js 22; no third-party dependencies.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const paths={transcript:'resources/lp2-transcription.txt',dictionary:'resources/control/english_wordfreq_textblob.txt',corpus:'resources/liber-primus/lp2-corpus.json',shakespeare:'resources/control/shakespeare_first300k.txt'};
const expected={transcript:'43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7',dictionary:'140e1d22b5f8c45deddd2e8b25549d9d6307d938',corpus:'054f2a0f780b7d46901acbe3d9bf4f0ac1801165',shakespeare:'94c677ad9dd50771c6670e0c4e4dad9052b46d85'};
const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.join(ROOT,p))]));
for(const [k,b] of Object.entries(raw)){
  const sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
  assert.equal(sha,expected[k],k+' source blob changed');
}
const corpus=JSON.parse(raw.corpus.toString('utf8'));
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
function parseWords(text){
  const stream=text.split('%').slice(0,55).join('%'),words=[],symbols=[];
  let current=[];
  for(const ch of stream){
    if(runeMap.has(ch)){const v=runeMap.get(ch);current.push(v);symbols.push(v);}
    else if(ch==='%'||ch==='/'||/\s/u.test(ch)){}
    else if(current.length){words.push(current);current=[];}
  }
  if(current.length)words.push(current);
  return {words,symbols};
}
const parsed=parseWords(raw.transcript.toString('utf8'));
assert.deepEqual(parsed.symbols,original);
assert.equal(parsed.words.length,2896);
const alphabet={TH:2,EO:12,NG:21,OE:22,AE:25,IA:27,EA:28,F:0,U:1,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,P:13,X:14,S:15,T:16,B:17,E:18,M:19,L:20,D:23,A:24,Y:26,K:5,Q:5,V:1,Z:15};
const tokens=Object.keys(alphabet).sort((a,b)=>b.length-a.length);
function encodeGP(word){
  const s=word.toUpperCase().replace(/[^A-Z]/g,''),out=[];
  for(let i=0;i<s.length;){
    let found=false;
    for(const t of tokens)if(s.startsWith(t,i)){out.push(alphabet[t]);i+=t.length;found=true;break;}
    if(!found)i++;
  }
  return out;
}
function firstPrimes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let ok=true;
    for(const p of out){if(p*p>n)break;if(n%p===0){ok=false;break;}}
    if(ok)out.push(n);
  }
  return out;
}
const primes=firstPrimes(10000);
function encryptWord(plain){
  const S=plain.reduce((a,v)=>a+corpus.prime[v],0);
  let q=0;
  return plain.map(v=>{
    if(v===0)return 0;
    const n=S+q;
    assert.ok(n>=1&&n<=primes.length);
    const key=(primes[n-1]-1)%29;
    q++;
    return (v+key)%29;
  });
}
const dictionary=[];
for(const line of raw.dictionary.toString('utf8').split(/\r?\n/)){
  const m=line.match(/^([a-z]+)\s+(\d+)$/i);
  if(!m)continue;
  const encoded=encodeGP(m[1]);
  if(encoded.length)dictionary.push({word:m[1].toUpperCase(),encoded});
}
assert.equal(dictionary.length,29157);
const byLength=new Map();
for(const d of dictionary){if(!byLength.has(d.encoded.length))byLength.set(d.encoded.length,[]);byLength.get(d.encoded.length).push(d);}
const encodings=new Set(dictionary.map(d=>d.encoded.join(',')));
const matches=cipher=>(byLength.get(cipher.length)||[]).filter(d=>{
  const out=encryptWord(d.encoded);
  return out.length===cipher.length&&out.every((v,i)=>v===cipher[i]);
}).map(d=>d.word);
const byRuneLength={},examples=[];
let matched=0,longWords=0,longMatches=0;
for(let i=0;i<parsed.words.length;i++){
  const c=parsed.words[i],m=matches(c);
  if(c.length>=6){longWords++;if(m.length)longMatches++;}
  if(m.length){matched++;byRuneLength[c.length]=(byRuneLength[c.length]||0)+1;if(examples.length<16)examples.push({wordIndex:i,length:c.length,cipher:c.map(v=>corpus.translit[v]).join(''),candidates:m.slice(0,6)});}
}
const shakespeareWords=(raw.shakespeare.toString('utf8').match(/[A-Za-z]+/g)||[]).map(x=>x.toUpperCase());
const longSource=shakespeareWords.map(word=>({word,encoded:encodeGP(word)})).filter(x=>x.encoded.length>=6);
const covered=longSource.filter(x=>encodings.has(x.encoded.join(',')));
const plants=covered.slice(0,1000);
assert.equal(plants.length,1000);
const recovered=plants.filter(x=>matches(encryptWord(x.encoded)).includes(x.word)).length;
assert.equal(recovered,1000);
assert.equal(longWords,815);
assert.equal(longMatches,0);
assert.equal(matched,161);
assert.deepEqual(byRuneLength,{1:53,2:85,3:21,4:2});
console.log(JSON.stringify({
  source:{originalRunes:original.length,parsedRunes:parsed.symbols.length,exactMatch:parsed.symbols.length===original.length&&parsed.symbols.every((v,i)=>v===original[i]),printedWords:parsed.words.length,gitBlobs:expected},
  model:{wordValue:'sum of plaintext GP prime weights',keyIndex:'one-based prime index S+q',key:'(prime[S+q]-1) mod29',direction:'C=P+K mod29',F:'transparent, no q advance',reset:'q resets per canonical printed word'},
  original:{wordsLengthAtLeast6:longWords,longWordsWithDictionaryMatch:longMatches,wordsWithAnyDictionaryMatch:matched,matchesByRuneLength:byRuneLength,shortExamples:examples},
  controls:{dictionaryEntries:dictionary.length,shakespeareLongTokens:longSource.length,shakespeareLongTokensCovered:covered.length,coverage:covered.length/longSource.length,plantedWords:plants.length,recovered}
},null,2));
