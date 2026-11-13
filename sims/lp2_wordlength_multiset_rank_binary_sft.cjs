'use strict';
/**
 * SFT: source-original LP2 word-length order as an exact multiset-rank binary
 * carrier. Run node sims/lp2_wordlength_multiset_rank_binary_sft.cjs.
 * The 2016 signed words/numbers clue motivates this alternative transport,
 * but does not specify combinatorial ranking or promise such a payload.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const master=fs.readFileSync(path.join(ROOT,'resources/transcriptions/liber_primus_master.txt'),'utf8');
const gp=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const CHAPTER_ENDS=[729,1874,3603,5506,6527,7960,9640,12648,12956];
const CHAPTER_WORDS=[158,255,383,437,224,326,378,669,66];
const CHAPTER_RUNES=[729,1145,1729,1903,1021,1433,1680,3008,308];
const HIST=[83,448,720,513,317,256,216,156,78,52,32,18,4,3];

/** @returns {number[][]} */
function originalChapters(){
 const raw=master.slice(master.indexOf('\n\n')+2).split('$').slice(7,16);
 const words=raw.flatMap(section=>section.split(/[-.&§]/u)
   .map(fragment=>fragment.match(/[\u16A0-\u16FF]/gu)).filter(Boolean));
 const runes=new Map(gp.runes.map((r,i)=>[r,i]));
 const observed=words.flat().map(c=>runes.get(c));
 assert.deepEqual(observed,gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
 const lens=words.map(w=>w.length);
 assert.equal(lens.length,2896);
 assert.equal(observed.length,12956);
 assert.deepEqual(Array.from({length:14},(_,i)=>lens.filter(x=>x===i+1).length),HIST);
 let start=0,offset=0;
 const out=[];
 for(let i=0;i<lens.length;i++){
  offset+=lens[i];
  if(CHAPTER_ENDS.includes(offset)){out.push(lens.slice(start,i+1));start=i+1}
 }
 assert.equal(start,lens.length);
 assert.deepEqual(out.map(a=>a.length),CHAPTER_WORDS);
 assert.deepEqual(out.map(a=>a.reduce((s,x)=>s+x,0)),CHAPTER_RUNES);
 return out;
}
/** @param {number} n @returns {bigint} */
function factorial(n){let v=1n;for(let i=2;i<=n;i++)v*=BigInt(i);return v}
/** @param {number[]} xs @returns {number[]} */
function countsOf(xs){
 const cs=Array(15).fill(0);
 for(const x of xs){assert.ok(Number.isInteger(x)&&x>=1&&x<=14);cs[x]++}
 return cs;
}
/** @param {number[]} counts @returns {bigint} */
function arrangements(counts){
 const n=counts.reduce((s,x)=>s+x,0),num=factorial(n);
 const denominator=counts.reduce((s,x)=>s*factorial(x),1n);
 assert.equal(num%denominator,0n);
 return num/denominator;
}
/** @param {number[]} xs @returns {{index:bigint,ways:bigint}} */
function rank(xs){
 const cs=countsOf(xs),ways=arrangements(cs);
 let count=ways,index=0n,n=xs.length;
 for(const x of xs){
  for(let j=1;j<x;j++)if(cs[j]){
   const numerator=count*BigInt(cs[j]);
   assert.equal(numerator%BigInt(n),0n);
   index+=numerator/BigInt(n);
  }
  const numerator=count*BigInt(cs[x]);
  assert.equal(numerator%BigInt(n),0n);
  count=numerator/BigInt(n);
  cs[x]--;n--;
 }
 assert.equal(count,1n);
 assert.ok(index>=0n&&index<ways);
 return {index,ways};
}
/** @param {bigint} index @param {number[]} originalCounts @returns {number[]} */
function unrank(index,originalCounts){
 const cs=originalCounts.slice();
 let count=arrangements(cs),n=cs.reduce((s,x)=>s+x,0);
 assert.ok(index>=0n&&index<count);
 const out=[];
 while(n){
  let found=false;
  for(let x=1;x<=14;x++)if(cs[x]){
   const numerator=count*BigInt(cs[x]);
   assert.equal(numerator%BigInt(n),0n);
   const block=numerator/BigInt(n);
   if(index>=block){index-=block;continue}
   out.push(x);cs[x]--;count=block;found=true;break;
  }
  assert.ok(found);n--;
 }
 assert.equal(index,0n);
 return out;
}
/** @param {bigint} n @param {number} width @returns {Buffer} */
function fixedBytes(n,width){
 const hex=n.toString(16).padStart(width*2,'0');
 assert.equal(hex.length,width*2);
 return Buffer.from(hex,'hex');
}
/** @param {Buffer} bytes @returns {string|null} */
function signature(bytes){
 const head=bytes.subarray(0,16),ascii=head.toString('ascii');
 if(ascii.startsWith('-----BEGIN PGP'))return 'PGP';
 if(ascii.startsWith('%PDF-'))return 'PDF';
 if(ascii.startsWith('BZh'))return 'bzip2';
 if(ascii.startsWith('OggS'))return 'Ogg';
 for(const [name,hex] of [
  ['ZIP','504b0304'],['gzip','1f8b08'],['xz','fd377a585a00'],
  ['PNG','89504e470d0a1a0a']
 ])if(head.subarray(0,hex.length/2).equals(Buffer.from(hex,'hex')))return name;
 return null;
}
/** @param {number[]} xs @param {string} name */
function scan(xs,name){
 const ways=arrangements(countsOf(xs));
 const bits=(ways-1n).toString(2).length,width=Math.ceil(bits/8);
 const trials=[];
 for(const [orientation,values] of [
  ['printed',xs],['reversed',xs.slice().reverse()]
 ]){
  const {index,ways:other}=rank(values);
  assert.equal(ways,other);
  assert.deepEqual(unrank(index,countsOf(values)),values);
  for(const [labels,value] of [
   ['ascending-length',index],['descending-length',ways-1n-index]
  ]){
   const big=fixedBytes(value,width);
   for(const [endian,bytes] of [['big',big],['little',Buffer.from(big).reverse()]]){
    trials.push({orientation,labels,endian,format:signature(bytes),
     prefix:bytes.subarray(0,16).toString('hex'),
     printableFraction:Number((bytes.filter(v=>v===10||v===13||(v>=32&&v<=126)).length/bytes.length).toFixed(5))});
   }
  }
 }
 return {name,words:xs.length,bits,bytes:width,candidates:trials.length,
  exactHeaderHits:trials.filter(t=>t.format),natural:trials[0],
  bestPrintableFraction:Math.max(...trials.map(x=>x.printableFraction))};
}
/** @param {bigint} n @returns {number[]} Native GP29 digits of rank integer. */
function gpDigits(n){
 const out=[];
 do{out.push(Number(n%29n));n/=29n}while(n>0n);
 return out.reverse();
}
/** @param {number[]} a @returns {number} */
function coincidence(a){
 const cs=Array(29).fill(0);for(const v of a)cs[v]++;
 return cs.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {number[]} needle @returns {number} */
function exactOccurrences(a,needle){
 let n=0;
 for(let i=0;i+needle.length<=a.length;i++)
  if(needle.every((v,k)=>a[i+k]===v))n++;
 return n;
}
/** @param {number[]} a @returns {bigint} */
function parseGpNumber(a){
 let n=0n;for(const digit of a)n=29n*n+BigInt(digit);
 return n;
}
function main(){
 const chapters=originalChapters(),all=chapters.flat();
 const results=[scan(all,'book'),...chapters.map((c,i)=>scan(c,'chapter'+(i+1)))];
 assert.equal(results.reduce((n,x)=>n+x.candidates,0),80);
 assert.ok(results.every(x=>x.exactHeaderHits.length===0));
 assert.equal(results[0].bits,8792);
 assert.equal(results[0].bytes,1099);
 assert.equal(results[0].natural.prefix,'d7758df1640a621ac9d8f75d38a08131');
 const planted=Buffer.alloc(991,0x41);
 Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA256\n\nCONTROL ONLY\n').copy(planted);
 const number=BigInt('0x'+planted.toString('hex'));
 assert.ok(number<arrangements(countsOf(all)));
 const encoded=unrank(number,countsOf(all));
 assert.deepEqual(countsOf(encoded),countsOf(all));
 const restored=rank(encoded);
 assert.equal(restored.index,number);
 assert.deepEqual(fixedBytes(restored.index,991),planted);
 assert.equal(signature(planted),'PGP');
 // The signed 2013 Cicada server provided BASE29. This tests the rank
 // integer as a native GP29 plaintext transport, with no invented key.
 const p56Opening=['A','N','E','N','D'].map(token=>gp.translit.indexOf(token));
 assert.ok(p56Opening.every(index=>index>=0));
 const gpReadouts=[all,...chapters].flatMap((words,i)=>{
  const {index,ways}=rank(words);
  return [['normal',index],['complement',ways-1n-index]].map(([type,n])=>{
   const a=gpDigits(n);
   return {span:i===0?'book':'chapter'+i,type,GP29Runes:a.length,
    IoC:Number(coincidence(a).toFixed(8)),
    p56ANENDMatches:exactOccurrences(a,p56Opening),
    firstTokens:a.slice(0,32).map(v=>gp.translit[v]).join(' ')};
  });
 });
 assert.equal(gpReadouts.length,20);
 assert.ok(gpReadouts.every(record=>record.p56ANENDMatches===0));
 const p57=gp.pages.find(page=>page.page===57).indices;
 const sourceSolved=p57.slice(0,30);
 const gpPlantIndex=parseGpNumber(sourceSolved);
 assert.ok(gpPlantIndex<arrangements(countsOf(chapters[8])));
 const plantedChapter=unrank(gpPlantIndex,countsOf(chapters[8]));
 assert.deepEqual(gpDigits(rank(plantedChapter).index),sourceSolved);
 assert.ok(coincidence(p57)>0.055);
 console.log(JSON.stringify({source:'unchanged original 2896 words, 12956 runes, nine visual chapters',
  hypothesis:'entire order of original word-length multiset encodes binary via exact lexicographic ranking',
  results,gp29Readouts:gpReadouts,solvedGP29Control:{source:'p57',sourceRunes:p57.length,sourceIoC:Number(coincidence(p57).toFixed(8)),plantRunes:sourceSolved.length,exactRoundTrip:true},positive:{knownPayloadBytes:991,recovered:991,header:'PGP',exactRoundTrip:true},
  inference:'No direct fixed-prefix PGP or recognized file format in 80 source-native rank readings; no unknown LP2 plaintext or key identified.'},null,2));
}
if(require.main===module)main();
module.exports={originalChapters,countsOf,arrangements,rank,unrank,fixedBytes,signature,scan,main};
