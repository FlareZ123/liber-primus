'use strict';

/**
 * Exact source-79 two-block additive-pad inversion on the 10-dot table bridge.
 * Run: node sims/p49_p51_79_two_block_pad_word_ac_sft.cjs
 *
 * The authentic LP2 p49 (66 runes) and p51 (92 runes) surround the
 * 32×8 printed table, and together contain exactly 158=2×79 runes.
 * Independently, the p15 Fibonacci-prime square contains p_22=79,
 * and the red p53 prime-sum quotient is p_22-1=78.
 *
 * Hypothesis: the p49+p51 runes use one synchronized additive GP29 pad
 * of period 79 across the table, with the same GP-native word
 * delimiters. Cancellation between the two 79-rune packets eliminates
 * ALL 79 unknown key values, leaving exact word-pair constraints.
 *
 * The algorithm applies the declared word lexicon only to full interior
 * fragments; the page boundary, period-79 split, and outer fragments
 * may be incomplete and are not independently constrained.
 *
 * This exact finite necessary test does not rule out unsampled words,
 * changing key, a cipher outer layer, or nonstandard delimiter rules.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const chunks=read('resources/lp2-transcription.txt').split('%');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const gpIndex=new Map(corpus.translit.map((r,i)=>[r,i]));
const vocabSources=[
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt'
];

/** @param {string} word @returns {number[]|null} */
function encode(word) {
  word=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<word.length;) {
    const pair=gpIndex.get(word.slice(i,i+2));
    if(pair!==undefined){out.push(pair);i+=2;}
    else {
      const one=gpIndex.get(word[i]);
      if(one===undefined)return null;
      out.push(one);i++;
    }
  }
  return out;
}
const wordsByLength=new Map();
for(const filename of vocabSources)
  for(const word of read(filename).match(/[A-Za-z]+/g)||[]) {
    const gp=encode(word);
    if(!gp)continue;
    let words=wordsByLength.get(gp.length);
    if(!words){words=new Map();wordsByLength.set(gp.length,words);}
    words.set(gp.join(','),gp);
  }
/** @param {number} index Excludes the runeless physical p50. */
function fragments(index) {
  return chunks[index].replace(/\/\s*/g,'')
    .split(/[-.$&§\s]+/)
    .filter(w=>/^[\u16A0-\u16FF]+$/u.test(w))
    .map(w=>[...w].map(glyph=>runeIndex.get(glyph)));
}
const page49=fragments(49),page51=fragments(50);
const len=a=>a.reduce((s,w)=>s+w.length,0);
assert.equal(len(page49),66);
assert.equal(len(page51),92);
const all=[...page49,...page51];
assert.equal(len(all),158);

// A 79-rune boundary lies four glyphs into the third word of p51.
// Splitting here leaves a partial word on each side of the packet
// boundary; neither of those two fragments is independently required
// to be a dictionary word.
let offset=0;
const first=[],second=[];
for(const word of all){
  const end=offset+word.length;
  if(offset<79){
    const count=Math.min(end,79)-offset;
    first.push(word.slice(0,count));
    if(end>79)second.push(word.slice(count));
  }else second.push(word);
  offset=end;
}
assert.deepEqual([len(first),len(second),first.length,second.length],
  [79,79,21,18]);
assert.deepEqual(first.slice(-1),[[...page51[2].slice(0,4)]]);
assert.deepEqual(second.slice(0,1),[[page51[2].at(-1)]]);

const actual=[49,51].flatMap(page=>
  corpus.pages.find(p=>p.page===page).indices);
assert.deepEqual(actual,[...first.flat(),...second.flat()]);
const left=first.flat(),right=second.flat();

/** @param {number[][]} words */
function domains(words){
  let offset=0;
  return words.map((word,i)=>{
    const next={i,start:offset,len:word.length,
      options:[...(wordsByLength.get(word.length)?.values()||[])]};
    offset+=word.length;
    return next;
  });
}
const edgeSkeleton=(()=>{
  const A=domains(first),B=domains(second),edges=[];
  for(let i=1;i<A.length-1;i++)
    for(let j=1;j<B.length-1;j++) {
      const a=A[i],b=B[j];
      const start=Math.max(a.start,b.start);
      const end=Math.min(a.start+a.len,b.start+b.len);
      if(end>start)edges.push({i,j,start,end});
    }
  return edges;
})();
assert.equal(edgeSkeleton.length,31);

/** @param {number[]} cipherA @param {number[]} cipherB @returns {number[]} */
function delta(cipherA,cipherB){
  assert.equal(cipherA.length,79);
  assert.equal(cipherB.length,79);
  return cipherA.map((c,i)=>(c-cipherB[i]+29)%29);
}

/** Arc consistency is a necessary, never overrestrictive, test of the
 * declared shared-periodic-key/lexicon hypothesis.
 * @param {number[]} differences
 */
function constrain(differences){
  const A=domains(first),B=domains(second);
  const candidatesInitial=[A,B].map(all=>
    all.reduce((sum,fragment)=>sum+fragment.options.length,0));
  let removed=0;
  for(let pass=0;pass<20;pass++){
    let changes=0;
    for(const edge of edgeSkeleton){
      const a=A[edge.i],b=B[edge.j],width=edge.end-edge.start,
        ai=edge.start-a.start,bi=edge.start-b.start;
      const patternsB=new Set(b.options.map(word=>
        String.fromCharCode(...word.slice(bi,bi+width))));
      const survivingA=[],survivingPatterns=new Set();
      for(const word of a.options){
        const need=String.fromCharCode(...Array.from(
          {length:width},(_,i)=>
            (word[ai+i]-differences[edge.start+i]+29)%29
        ));
        if(patternsB.has(need)){
          survivingA.push(word);
          survivingPatterns.add(need);
        }
      }
      const survivingB=b.options.filter(word=>
        survivingPatterns.has(String.fromCharCode(
          ...word.slice(bi,bi+width))));
      changes+=a.options.length-survivingA.length +
        b.options.length-survivingB.length;
      a.options=survivingA;b.options=survivingB;
      if(!a.options.length||!b.options.length)
        return {feasible:false,pass,contradiction:edge,
          overlap:width,removed:removed+changes,candidatesInitial};
    }
    removed+=changes;
    if(changes===0)return {feasible:true,pass,removed,
      candidatesInitial,
      candidatesRemaining:[A,B].map(list=>
        list.reduce((sum,entry)=>sum+entry.options.length,0))};
  }
  return {feasible:true,incomplete:true,candidatesInitial,removed};
}
const original=constrain(delta(left,right));
assert.equal(original.feasible,false);

let state=0x15792267;
/** @returns {number} */
function random(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
}
// Generate actual 79-rune GP-English word sequences under the same
// original segment lengths. The synthesized true shared pad is hidden
// from the elimination algorithm and is never scored or searched.
const natural=a=>a.map(fragment=>{
  const candidates=[...wordsByLength.get(fragment.length).values()];
  return candidates[random()%candidates.length];
});
const plainA=natural(first).flat(),plainB=natural(second).flat();
const key=Array.from({length:79},()=>random()%29);
const encA=plainA.map((v,i)=>(v+key[i])%29),
  encB=plainB.map((v,i)=>(v+key[i])%29);
const plantDifferences=delta(encA,encB);
assert.deepEqual(plantDifferences,delta(plainA,plainB));
const planted=constrain(plantDifferences);
assert.equal(planted.feasible,true);

console.log(JSON.stringify({
  sourceLogic:{
    authentic10DotBridgeRunes:[66,92],
    printedGridBytes:256,
    periodFromVisiblePrime79:79,
    totalBridge:158,
    expectedBlocks:2,
    firstPacketPartialWordAtP51Offset:13,
    fragmentLengths:[first.map(w=>w.length),second.map(w=>w.length)],
    checkedCrossPacketWordConstraints:edgeSkeleton.length
  },
  vocabulary:vocabSources,
  originalPeriod79Cancellation:{
    padUnknownValuesCancelled:79,
    ciphertextEqualAlignedPositions:left.filter((v,i)=>v===right[i]).length,
    exactArcConsistency:original
  },
  plantedPeriod79SharedPad:{
    hiddenPadPositions:key.length,
    nativeGPWords:true,
    exactCancellation:true,
    sourceWordLengthsPreserved:true,
    exactArcConsistency:planted
  },
  conclusion:'Exact 79-period key reuse with the original GP-native word boundaries and this declared vocabulary is infeasible; no unknown plaintext or key recovered.'
},null,2));
