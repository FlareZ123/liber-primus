'use strict';

// Transfer the already-published original red-dot/section-number MEANING
// palindrome key to *all* 122 intact printed words of the five numbered units.
// This tests a decoder selected before seeing the later paragraphs.
// Source: p36 1- and two (3,4,3) red ten-dot brackets, e=3/q=4.
// Exact full-word transcription includes p37->p38 physical carry.
// Read-only Node.js 22 SFT, Windows-friendly. No free key search.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {originalParagraphs} = require('./lp2_pp36_38_numbered_aphorism_crib_sft.cjs');

const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lengths=originalParagraphs(read('resources/liber-primus/lp2-transcription.txt'));
const C=[
  corpus.pages[36].indices.slice(99,238),
  corpus.pages[37].indices.slice(0,91),
  corpus.pages[37].indices.slice(91,189),
  corpus.pages[37].indices.slice(189,228).concat(corpus.pages[38].indices.slice(0,57)),
  corpus.pages[38].indices.slice(57,186),
];
assert.deepEqual(C.map(a=>a.length),[139,91,98,96,129]);
assert.deepEqual(lengths.map(a=>a.length),[30,20,25,19,28]);
assert.equal(lengths[3][8],6);
assert.equal(C.reduce((s,a)=>s+a.length,0),553);
assert.equal(lengths.reduce((s,a)=>s+a.length,0),122);
assert.deepEqual(C[0].slice(0,4),[20,2,12,22]);

const translate=corpus.translit;
const tokenRanks=translate.map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
const mod=x=>(x%29+29)%29;

/** @param {string} english @returns {number[]} */
function gp(english) {
  const s=english.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');
  const out=[];
  for(let i=0;i<s.length;) {
    if(s.startsWith('ING',i)){out.push(21);i+=3;continue}
    if(s.startsWith('IO',i)){out.push(27);i+=2;continue}
    const token=tokenRanks.find(x=>s.startsWith(x.symbol,i));
    assert(token,'invalid dictionary input '+english+' at '+i);
    out.push(token.value);i+=token.symbol.length;
  }
  return out;
}
const forms=new Map(),byLength=new Map();
for(const line of read('resources/control/english_wordfreq_textblob.txt').split('\n')) {
  const m=line.match(/^([a-z]+) (\d+)$/);
  if(!m) continue;
  const encoded=gp(m[1]),signature=encoded.join(','),frequency=Number(m[2]);
  const old=forms.get(signature);
  if(!old || frequency>old.frequency)
    forms.set(signature,{word:m[1],frequency,encoded});
  const prev=byLength.get(encoded.length);
  if(!prev || frequency>prev.frequency)
    byLength.set(encoded.length,{word:m[1],frequency,encoded});
}
assert.equal(forms.size,29060);
assert([...lengths.flat()].every(n=>byLength.has(n)),
  'native source lexicon must supply every original printed word length');

/**
 * @param {number[]} cipherOrPlain
 * @param {number[]} wordLengths
 * @param {number} section actual red paragraph number1..5
 * @param {number} interior symmetric red-dot column value3 or4
 * @param {1|-1} sign
 * @returns {number[]}
 */
function transform(cipherOrPlain,wordLengths,section,interior,sign) {
  let off=0;const out=[];
  for(const n of wordLengths) {
    for(let j=0;j<n;j++) {
      const delta=(j===0||j===n-1)?section:interior;
      out.push(mod(cipherOrPlain[off++]+sign*delta));
    }
  }
  assert.equal(off,cipherOrPlain.length);
  return out;
}
/** @param {number[]} a */
function ioc(a) {
  let h=Array(29).fill(0);
  a.forEach(n=>h[n]++);
  return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} flat @param {number[]} ws */
function match(flat,ws) {
  let off=0,wordHits=0,runeCoverage=0,longHits=0;
  /** @type {string[]} */
  const hits=[];
  ws.forEach((n,i)=>{
    const found=forms.get(flat.slice(off,off+n).join(','));
    off+=n;
    if(!found) return;
    wordHits++;runeCoverage+=n;
    if(n>=4) longHits++;
    hits.push(i+':'+found.word+'('+n+')');
  });
  return {wordHits,runeCoverage,longHits,hits};
}
let modelCount=0;
for(const interior of [3,4]) {
  for(const sign of [-1,1]) {
    let total={wordHits:0,longHits:0,runeCoverage:0};
    let holdout={wordHits:0,longHits:0,runeCoverage:0};
    for(let u=0;u<5;u++) {
      const original=C[u],ws=lengths[u];
      const out=transform(original,ws,u+1,interior,sign);
      const replay=transform(out,ws,u+1,interior,-sign);
      assert.deepEqual(replay,original);
      const hits=match(out,ws);
      total.wordHits+=hits.wordHits;
      total.longHits+=hits.longHits;
      total.runeCoverage+=hits.runeCoverage;
      if(u>0) {
        holdout.wordHits+=hits.wordHits;
        holdout.longHits+=hits.longHits;
        holdout.runeCoverage+=hits.runeCoverage;
      }
      if(interior===3&&sign===-1&&u===0) {
        assert.deepEqual(out.slice(0,4),[19,28,9,21]);
        assert.equal(hits.hits[0],'0:meaning(4)');
      }
      console.log(JSON.stringify({section:u+1,interior,sign,
        wordCount:ws.length,sourceRunes:original.length,
        decodedIoC:ioc(out),...hits}));
    }
    if(interior===3&&sign===-1) {
      assert.deepEqual(total,{wordHits:6,longHits:1,runeCoverage:12});
      assert.deepEqual(holdout,{wordHits:5,longHits:0,runeCoverage:8});
    }
    console.log(JSON.stringify({whole553:true,interior,sign,
      sourceWordCount:122,originalRuneCount:553,...total,
      heldoutFromItem2:{sourceRuneCount:414,wordCount:92,...holdout}}));
    modelCount++;
  }
}
// Fully controlled source-native positive at exactly all original word lengths.
// Keys are applied to synthetic *intact dictionary words*, then recovered.
const authenticPlant=lengths.map(ws=>ws.flatMap(n=>byLength.get(n).encoded));
assert.equal(authenticPlant.reduce((s,a)=>s+a.length,0),553);
for(const interior of [3,4]) for(const sign of [-1,1]) {
  for(let u=0;u<5;u++) {
    const fakeCipher=transform(authenticPlant[u],lengths[u],u+1,interior,-sign);
    const clear=transform(fakeCipher,lengths[u],u+1,interior,sign);
    assert.deepEqual(clear,authenticPlant[u]);
    assert.equal(match(clear,lengths[u]).wordHits,lengths[u].length);
    if(interior===3&&sign===-1&&u===0)
      assert(match(transform(fakeCipher,lengths[u],u+1,4,sign),lengths[u]).wordHits<lengths[u].length);
  }
}
assert.equal(modelCount,4);
console.log('PASS 4 source-frozen bracketed palindrome consumers, 122 original words, '+
  'original p37->p38 carried source words, exact forward/replay, all 122 native GP words '+
  'on synthetic positive, and wrong-key control; no continuous original plaintext.');
