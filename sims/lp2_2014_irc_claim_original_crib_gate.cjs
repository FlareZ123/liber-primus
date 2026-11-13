'use strict';

/**
 * Historical June 11, 2014 LP2 claimed decipherment: two original-word cribs
 * and a completely fixed, reversible all-page extension.
 *
 * This is a SOURCE-EVIDENCE TEST, not a newly recovered key.
 * node sims/lp2_2014_irc_claim_original_crib_gate.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const book=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const text=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const segments=text.split('%');
const runeIndex=new Map(book.runes.map((r,i)=>[r,i]));
const mod=x=>(x%29+29)%29;
/** @param {string} s */
const ids=s=>Array.from(s).filter(x=>runeIndex.has(x)).map(x=>runeIndex.get(x));
/** @param {number[]} a */
const translit=a=>a.map(x=>book.translit[x]).join('');
/** @param {number[]} a */
const ioc=a=>{
  const h=Array(29).fill(0);
  for(const v of a)h[v]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
/**
 * @param {number} page
 * @param {number} line
 * @param {number} word
 */
function getOriginalWord(page,line,word){
  const lines=segments[page].trim().split(/\r?\n/);
  const tokens=lines[line-1].split(/[-.]/);
  assert(tokens[word-1]);
  const source=tokens[word-1],values=ids(source);
  const localStart=ids(lines.slice(0,line-1).join('')+tokens.slice(0,word-1).join('')).length;
  const globalStart=book.pages.slice(0,page).reduce((s,p)=>s+p.indices.length,0)+localStart;
  assert.deepEqual(book.pages[page].indices.slice(localStart,localStart+values.length),values);
  return {page,line,word,localStart,globalStart,values};
}
/** @param {number[]} indices @param {number} phase @param {boolean} reverse */
const progressive=(indices,phase,reverse=false)=>
  indices.map((v,i)=>mod(v+(reverse?-1:1)*(phase+i)));

function run(){
  const p34=getOriginalWord(34,4,4);
  const p35=getOriginalWord(35,4,3);
  assert.equal(p34.localStart,81);
  assert.equal(p35.localStart,78);
  assert.equal(p34.globalStart,8255);
  assert.equal(p35.globalStart,8513);
  assert.deepEqual(p34.values,[22,19,15,14]);
  assert.equal(translit(p34.values),'OEMSX');
  assert.equal(translit(progressive(p34.values,27)),'LESS');
  assert.equal(translit(progressive(p35.values,26)),'ITS');
  // The two claimed word starts cannot share an uninterrupted global +i clock.
  const globalClockDiff=mod(p35.globalStart-p34.globalStart);
  const proposedKeyDiff=mod(26-27);
  assert.equal(globalClockDiff,26);
  assert.equal(proposedKeyDiff,28);
  assert.notEqual(globalClockDiff,proposedKeyDiff);
  // One free initial key phase PER page can fit both cribs, but is not
  // independently selected by an original creator instruction.
  const phases={34:mod(27-p34.localStart),35:mod(26-p35.localStart)};
  assert.deepEqual(phases,{34:4,35:6});
  // Lowest-degree linear continuation *retrospectively fitted* to these two:
  // phase(page)=(2*page+23) mod 29, with intra-page increment +1.
  const allPages=book.pages.filter(p=>p.page<=55);
  const ciphertext=allPages.flatMap(p=>p.indices);
  const decoded=allPages.flatMap(p=>progressive(p.indices,mod(2*p.page+23)));
  assert.equal(ciphertext.length,12956);
  assert.equal(decoded.length,12956);
  const p34Plain=progressive(book.pages[34].indices,mod(2*34+23));
  const p35Plain=progressive(book.pages[35].indices,mod(2*35+23));
  assert.equal(translit(p34Plain.slice(p34.localStart,p34.localStart+4)),'LESS');
  assert.equal(translit(p35Plain.slice(p35.localStart,p35.localStart+3)),'ITS');
  assert(Math.abs(ioc(ciphertext)-0.03447839786450569)<1e-14);
  assert(Math.abs(ioc(decoded)-0.0344902302112342)<1e-14);
  // Fixed source-native positive plant: proven inverse/forward, no decoder
  // fitting or language model involved.
  const control=book.pages[57].indices;
  const planted=progressive(control,4,true);
  assert.deepEqual(progressive(planted,4),control);
  assert.notDeepEqual(planted,control);
  const report={
    source:'Archived #cicadasolvers IRC, June 11 2014, original line 198135 onward',
    source_blob:'bdd277c14f94c34b5ae714cd00c238065beeed4e',
    originalWordCribs:[
      {...p34,guessedPlain:'LESS',guessedIncrementalShifts:[27,28,0,1]},
      {...p35,guessedPlain:'ITS',guessedIncrementalShifts:[26,27,28]},
    ],
    globalProgressiveClock:{observedOffsetDifference:globalClockDiff,
      requiredKeyDifference:proposedKeyDiff,consistent:false},
    fittedPageClock:'phase=(2*physicalPage+23)%29, +1 per rune',
    allUnsolvedRunes:ciphertext.length,
    nativeOriginalIoC:ioc(ciphertext),
    allPageDecodedIoC:ioc(decoded),
    p34First150:translit(p34Plain.slice(0,150)),
    p35First150:translit(p35Plain.slice(0,150)),
    sourceNativePositiveControl:'exact forward/inverse solved p57',
    outcome:'Two small original words reproduced; global constant-increment clock incompatible; fitted per-page phase yields flat gibberish across entire 56-page unknown stream. No recovered plaintext or authentic key.'
  };
  console.log(JSON.stringify(report,null,2));
}
run();
