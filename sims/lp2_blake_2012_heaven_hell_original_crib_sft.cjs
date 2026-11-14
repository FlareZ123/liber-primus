'use strict';
/**
 * Direct source-motivated plaintext crib acquisition from William Blake's
 * The Marriage of Heaven and Hell, a known 2012 Cicada book-code source.
 * It independently shares rare "circumference" imagery with original p57.
 * Run on Windows 11: node sims/lp2_blake_2012_heaven_hell_original_crib_sft.cjs
 * @returns {Promise<void>}
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {latinWords,originalWords,search,nearCribs,keyFromCrib}=require('./lp2_original_wordlength_crib_sft.cjs');
const root=path.resolve(__dirname,'..');
const source='https://www.gutenberg.org/cache/epub/45315/pg45315.txt';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

/**
 * Seek a long original-source English crib when every source word may have
 * exactly zero or one additional encrypted rune. No padding positions fit.
 * @param {{n:number,page?:number}[]} original
 * @param {{word?:string,n:number}[]} source
 */
function plusOneCribs(original,source){
 const span=8,key=(a,i)=>a.slice(i,i+span).map(x=>x.n).join(',');
 const lookup=new Map();
 for(let i=0;i+span<=original.length;i++){
  const k=key(original,i);
  if(!lookup.has(k))lookup.set(k,[]);
  lookup.get(k).push(i);
 }
 let seeds=0,max=0,long24=0;
 const found=[];
 for(let j=0;j+span<=source.length;j++){
  for(let mask=0;mask<256;mask++){
   const k=Array.from({length:span},(_,u)=>source[j+u].n+((mask>>>u)&1)).join(',');
   for(const i of lookup.get(k)||[]){
    seeds++;
    if(i&&j&&[0,1].includes(original[i-1].n-source[j-1].n))continue;
    let n=span,padding=0;
    for(let t=0;t<span;t++)padding+=((mask>>>t)&1);
    while(i+n<original.length&&j+n<source.length){
     const d=original[i+n].n-source[j+n].n;
     if(d!==0&&d!==1)break;
     padding+=d;n++;
    }
    max=Math.max(max,n);if(n>=24)long24++;
    if(n>=10)found.push({words:n,page:original[i].page,originalIndex:i,sourceIndex:j,paddedWords:padding,
     phrase:source.slice(j,j+Math.min(n,35)).map(x=>x.word).join(' ')});
   }
  }
 }
 found.sort((a,b)=>b.words-a.words||a.originalIndex-b.originalIndex);
 return {eightWordSeedHits:seeds,longest:max,atLeast24:long24,best:found.slice(0,15)};
}

async function main(){
 const r=await fetch(source,{signal:AbortSignal.timeout(25000),
  headers:{'user-agent':'Cicada-research-original-Blake-text-crib/1.0'}});
 assert.equal(r.status,200,'Gutenberg original published book source');
 const body=await r.text();
 assert.equal(sha(body),'fc9a76619fcb76c58273d7fc9e034108b0d7fffed3780ad5b8226954a12b289a');
 assert(body.includes('THE MARRIAGE OF HEAVEN AND HELL'));
 const begin=body.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK');
 const end=body.indexOf('*** END OF THE PROJECT GUTENBERG EBOOK');
 assert(begin>=0 && end>begin);
 const text=body.slice(body.indexOf('\n',begin)+1,end);
 assert(/outward circumference of Energy/i.test(text),
  'The source passage motivating this exact 2012 book is present');
 const words=latinWords(text);
 const original=originalWords(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8'));
 const unknown=original.filter(w=>w.page<=55);
 assert.equal(unknown.length,2896);
 assert.equal(unknown.reduce((s,w)=>s+w.n,0),12956);
 const solved=original.filter(w=>w.page===57);
 const control=latinWords(fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8').replace(/\r\n?/g,'\n').split('### 57\n')[1]);
 assert.deepEqual(solved.map(w=>w.n),control.map(w=>w.n));
 assert.equal(search(solved,control).longest,20);
 const syntheticOneRuneEveryOtherWord=solved.map((x,i)=>({...x,n:x.n+i%2}));
 assert.equal(plusOneCribs(syntheticOneRuneEveryOtherWord,control).longest,20);
 assert.deepEqual(keyFromCrib(solved,control,0,0,20),Array(95).fill(0));
 const padded=plusOneCribs(unknown,words);
 const full=search(unknown,words,7);
 const near=nearCribs(unknown,words);
 const largestNear=near.best.map(x=>({...x,originalPage:unknown[x.originalIndex].page,
   phrase:words.slice(x.sourceIndex,x.sourceIndex+15).map(w=>w.word).join(' ')}));
 const cribKeys=full.best.filter(x=>x.n>=10).map(x=>
  ({...x,key:keyFromCrib(unknown,words,x.originalIndex,x.sourceIndex,x.n)}));
 console.log(JSON.stringify({
  source,sourceSha256:sha(body),sourceBytes:Buffer.byteLength(body),
  sourceTextSha256:sha(text),sourceWordCount:words.length,
  sourceClue:'Cicada 2012 second-chance Blake book-code; source phrase outward circumference of Energy / p57 SHED OUR OWN CIRCUMFERENCES',
  controls:{solvedP57Words:20,knownKeyLength:95},
  unknown:{words:unknown.length,runes:12956},sevenWordSignature:full,
  fifteenWordNearTwoSubstitutions:{...near,best:largestNear},
  tenPlusCandidateKeys:cribKeys,
  atMostOneExtraneousRunePerPrintedWord:{...padded,plantedSolvedP57Words:20},
  interpretation:full.atLeast10?'A source-selected long exact word-length crib candidate needs independent original cipher verification':'No exact >=10-word GP29-length source quote; long paraphrase/other orthography not excluded'
 },null,2));
}
main().catch(e=>{console.error(e.stack??String(e));process.exitCode=1});
