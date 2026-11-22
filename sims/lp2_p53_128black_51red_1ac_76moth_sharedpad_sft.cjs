"use strict";
/**
 * Original-source 128/128 two-time-pad inverse, 22 Nov 2026, Agent27.
 *
 * Source selector: physical p53 is 128 BLACK + 51 RED runes;
 * physical p54's first A is enlarged; physical p55's 76-runic moth page
 * echoes p53 art. 51 + 1 + 76 = 128. Read 128 black runes
 * against [51 red p53 + one original p54 large-A + 76 p55] runes.
 *
 * If the two source halves share an arbitrary additive GP29 pad, the
 * plaintext pairwise difference is fixed and must be supported by TWO
 * native-GP dictionary words in every complete-print-word intersection.
 * Exact necessary-condition gate, no key, no chosen offset, no beam.
 *
 * This is independent of previous p53 red51->black128 known-key and
 * original p53/p55 first/last76 pad tests, which had different clocks.
 * Read-only Windows Node22/CommonJS.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const p53=corpus.pages.find(p=>p.page===53);
const p54=corpus.pages.find(p=>p.page===54);
const p55=corpus.pages.find(p=>p.page===55);
const marked=ink.pages.find(p=>p.page===53);
assert.deepEqual([p53.indices.length,p54.indices.length,p55.indices.length],
  [179,232,76]);
assert.deepEqual(marked.red_spans.map(x=>[x.start,x.length]),[[128,51]]);
assert.equal(p54.indices[0],24);
const black=p53.indices.slice(0,128);
const second=p53.indices.slice(128).concat([p54.indices[0]],p55.indices);
assert.equal(black.length,128);
assert.equal(second.length,128);
const rune=new Map(corpus.runes.map((v,i)=>[v,i]));
const wordRe=new RegExp("["+corpus.runes.join("")+"]+","gu");
const sourceChunks=read("resources/lp2-transcription.txt").split(/^%\s*$/m);
assert.equal(sourceChunks.length,57);
/** @param {number} block @param {number[]} exact */
function words(block,exact){
  let pos=0, arr=[];
  const literal=sourceChunks[block].replace(/\/\n/g,"").replace(/\s+/g,"");
  for(const m of literal.matchAll(wordRe)){
    const values=Array.from(m[0],v=>rune.get(v));
    assert(values.every(Number.isInteger));
    arr.push({start:pos,end:pos+values.length,length:values.length});
    pos+=values.length;
  }
  assert.deepEqual(Array.from(literal.matchAll(wordRe)).flatMap(m=>
    Array.from(m[0],v=>rune.get(v))),exact);
  assert.equal(pos,exact.length);
  return arr;
}
const w53=words(52,p53.indices);
const w55=words(54,p55.indices);
assert.equal(w53.some(w=>w.end===128),true);
assert.equal(w53.some(w=>w.start===128),true);
assert.deepEqual(w55.map(w=>w.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const Awords=w53.filter(w=>w.start>=5&&w.end<=128)
  .map(w=>({s:w.start,n:w.length}));
const Bwords=w53.filter(w=>w.start>=128)
  .map(w=>({s:w.start-128,n:w.length}))
  .concat(w55.filter(w=>w.start>=1)
    .map(w=>({s:w.start+52,n:w.length})));
// The first 5 p53 black runes carry the preceding p52's word;
// p54's enlarged A and p55's first NG carry their own source boundaries.
// These three incomplete/bridging positions are unconditionally FREE:
const freeBlack=Array.from({length:5},(_,i)=>i);
const freeSecond=[51,52];
assert.equal(Bwords[0].s,0);
assert.equal(Bwords[12].s,53);
assert.equal(Awords[0].s,5);
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const dictionary=new Map();
/** @param {number[]} values */
const token=values=>values.join(",");
/** @param {number[]} nums */
function add(nums){
  if(!nums.length||nums.length>25)return;
  let row=dictionary.get(nums.length);
  if(!row){row=new Map();dictionary.set(nums.length,row);}
  row.set(token(nums),nums);
}
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){
  const m=/^([a-z]+) (\d+)$/.exec(line);
  if(m)add(encodeSourceNativeGP(m[1]));
}
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const begin=lp1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const end=lp1.indexOf("\n$\n%\n",begin);
assert(begin>=0&&end>begin);
let nativeWitness=0;
for(const m of lp1.slice(begin,end).replace(/\/\n%\n/g,"").replace(/\/\n/g,"").replace(/\n/g,"").matchAll(wordRe)){
  add(Array.from(m[0],c=>rune.get(c)));nativeWitness++;
}
assert.equal(nativeWitness,181);
const list=Object.fromEntries([...dictionary].map(([k,row])=>
  [k,Array.from(row.values())]));
/**
 * Given a pair of unmodified original streams and source-printed complete
 * words, independently search each overlapping complete word pair.
 * Any unsupported overlap forbids a SHARED additive pad for ALL possible
 * secret 128 GP digits, regardless of other word or key choices.
 */
function audit(a,b){
  assert.equal(a.length,128);assert.equal(b.length,128);
  const difference=a.map((c,i)=>(c-b[i]+29)%29),out=[];
  for(let ia=0;ia<Awords.length;ia++)
    for(let ib=0;ib<Bwords.length;ib++){
      const aw=Awords[ia],bw=Bwords[ib];
      const start=Math.max(aw.s,bw.s),end=Math.min(aw.s+aw.n,bw.s+bw.n);
      if(start>=end)continue;
      const aa=list[aw.n]||[],bb=list[bw.n]||[];
      const candidates=new Set(bb.map(w=>token(w.slice(start-bw.s,end-bw.s))));
      let compatible=false;
      for(const w of aa){
        const implied=Array.from({length:end-start},(_,k)=>
          (w[start-aw.s+k]-difference[start+k]+29)%29);
        if(candidates.has(token(implied))){compatible=true;break;}
      }
      out.push({aWord:ia,bWord:ib,aLength:aw.n,bLength:bw.n,
        offset:start,end,overlap:end-start,compatible});
    }
  return {total:out.length,unsupported:out.filter(x=>!x.compatible)};
}
const actual=audit(black,second);
assert.equal(actual.total,48);
assert.deepEqual(actual.unsupported.map(x=>[x.offset,x.end]),
  [[75,84],[88,94],[107,113]]);
// Independently shaped native-English controls have exactly the same
// printed-word tape, partial-word holes and original physical coordinates.
let state=0x33015355;
function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
function natural(words,holes){
  const target=Array(128).fill(0);
  for(const w of words){
    const eligible=list[w.n];assert(eligible?.length>0);
    const chosen=eligible[rng()%eligible.length];
    target.splice(w.s,w.n,...chosen);
  }
  for(const i of holes)target[i]=rng()%29;
  assert.equal(target.length,128);
  return target;
}
function pad(){return Array.from({length:128},()=>rng()%29);}
function encrypt(x,key){return x.map((a,i)=>(a+key[i])%29);}
let pos=0,neg=0,negativeFirstUnsupported=null;
for(let rep=0;rep<12;rep++){
  const a=natural(Awords,freeBlack),b=natural(Bwords,freeSecond);
  const key=pad(),c1=encrypt(a,key),c2=encrypt(b,key);
  const positive=audit(c1,c2);
  assert.equal(positive.unsupported.length,0);
  pos++;
  const wrong=audit(c1,encrypt(b,pad()));
  if(wrong.unsupported.length>0)neg++;
  if(negativeFirstUnsupported===null)
    negativeFirstUnsupported=wrong.unsupported.length;
}
assert.equal(pos,12);assert.equal(neg,12);
console.log("summary",JSON.stringify({
  source:{p53Runes:179,black128:128,red51:51,
    p54EnlargedFirstRuneIndex:24,p55Runes:76,second128:second.length,
    originalTwoTrackSource:"p53 black 128 vs p53 red51 + p54 enlarged A + p55 all76",
    freeBlack,freeSecond},
  printed:{completeBlackWords:Awords.length,completeSecondWords:Bwords.length,
    allSourceWordIntersections:actual.total},
  lexicon:{uniqueWords:[...dictionary.values()].reduce((s,m)=>s+m.size,0),
    nativeLP1WitnessWords:nativeWitness},
  originalCipher:{unsupportedIntersections:actual.unsupported,
    exactNoPathWithinCompletePrintedWords:actual.unsupported.length>0},
  controls:{nativeLayoutMatchedSharedPadPass:pos,
    independentPadRejected:neg,firstNegativeUnsupported:negativeFirstUnsupported},
  decision:"The exact original 128-vs-128 moth/color/drop-cap source split " +
    "cannot carry TWO complete native-English dictionary plaintexts " +
    "under a single arbitrary GP29 additive pad reset at the original boundary. " +
    "Three separate word-pair intersections are impossible independent of any key."
}));
