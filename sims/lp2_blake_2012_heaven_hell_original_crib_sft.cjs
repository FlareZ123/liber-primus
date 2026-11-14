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
async function main(){
 const r=await fetch(source,{signal:AbortSignal.timeout(25000),
  headers:{'user-agent':'Cicada-research-original-Blake-text-crib/1.0'}});
 assert.equal(r.status,200,'Gutenberg original published book source');
 const body=await r.text();
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
 assert.deepEqual(keyFromCrib(solved,control,0,0,20),Array(95).fill(0));
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
  interpretation:full.atLeast10?'A source-selected long exact word-length crib candidate needs independent original cipher verification':'No exact >=10-word GP29-length source quote; long paraphrase/other orthography not excluded'
 },null,2));
}
main().catch(e=>{console.error(e.stack??String(e));process.exitCode=1});
