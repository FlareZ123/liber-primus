'use strict';
/**
 * LP2 source-256-byte directed word swaps: a reversible original-cipher gate.
 *
 * Hypothesis (never an authenticated Cicada instruction): signed 2016 wording
 * "words ... map ... numbers ... direction" could mean the printed 256 numerical
 * cells specify, in published order, how to transpose intact printed words.
 * For each position i, swap with (i + byte[i mod 256]) mod N. We test exactly
 * the forward schedule and its inverse under three source clocks: all unknown
 * words; the nine image-visible chapters; eleven 256-word records plus the
 * untouched final 80. No phases, key guesses, word edits or source tuning.
 *
 * A positive should restore independently learned source-native GP English
 * word-length succession across withheld chapter units, not merely improve one
 * hand-picked word. This test returns the full selection-corrected null.
 *
 * Windows 11, Node.js 22, CommonJS; read-only; no packages.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
assert.ok(bytes.every(v=>Number.isInteger(v)&&v>=0&&v<=255));
const pageStarts=[0,3,8,15,23,27,33,40,54,56];
const text=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
const rune=/[\u16A0-\u16FF]/u;
/** @typedef {{length:number, page:number}} RuneWord */
/** @type {RuneWord[]} */
const words=[];
let page=0,length=0,startPage=0,runes=0;
function finish(){
  if(length>0){words.push({length,page:startPage>=50?startPage+1:startPage});length=0;}
}
for(const ch of text){
  if(rune.test(ch)){if(length===0)startPage=page; length++; runes++;}
  else if(ch==='%')page++;
  else if(ch==='/'||/\s/u.test(ch)){} // printed line/page wrap
  else finish();
}
finish();
assert.equal(runes,12956);
assert.equal(words.length,2896);
assert.equal(page,54);
const chapters=Array.from({length:9},(_,i)=>words
  .filter(w=>w.page>=pageStarts[i]&&w.page<pageStarts[i+1])
  .map(w=>w.length));
assert.deepEqual(chapters.map(c=>c.length),[158,255,383,437,224,326,378,669,66]);
const original=chapters.flat();
const clocks={
  book:[original.length],
  chapters:chapters.map(c=>c.length),
  blocks256:Array(11).fill(256).concat([80])
};
assert.ok(Object.values(clocks).every(v=>v.reduce((a,b)=>a+b,0)===2896));
/**
 * Position-only permutation driven by public grid byte tape.
 * The inverse is the same swaps in descending order.
 * @template T
 * @param {T[]} input
 * @param {number[]} clock
 * @param {boolean} inverse
 * @returns {T[]}
 */
function transpose(input,clock,inverse){
  const out=input.slice();let offset=0;
  for(const n of clock){
    // Reuse cell 0 at each published reset, as the source-leading byte.
    // This is an explicit test choice, not an inferred chapter cipher clock.
    const swapAt=i=>{
      const j=(i+bytes[i%256])%n;
      const p=offset+i,q=offset+j;
      [out[p],out[q]]=[out[q],out[p]];
    };
    if(inverse){for(let i=n-1;i>=0;i--)swapAt(i);}
    else{for(let i=0;i<n;i++)swapAt(i);}
    offset+=n;
  }
  assert.equal(offset,input.length);
  return out;
}
for(const clock of Object.values(clocks)){
  const tape=Array.from({length:2896},(_,i)=>i);
  assert.deepEqual(transpose(transpose(tape,clock,false),clock,true),tape);
  assert.deepEqual(transpose(transpose(tape,clock,true),clock,false),tape);
}
const K=18,alpha=0.2;
const doublets=new Set(['TH','NG','EO','OE','AE','IA','EA','IO']);
/** @param {string} s @returns {number} */
function gpLength(s){
  let n=0;
  for(let i=0;i<s.length;i++){
    if(s.slice(i,i+3)==='ING'){i+=2;n++;continue;}
    if(doublets.has(s.slice(i,i+2)))i++;
    n++;
  }
  return Math.min(K-1,n);
}
/** @param {string} s @returns {number[]} */
function toLengths(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(gpLength);}
const train=toLengths(
  read('resources/control/shakespeare_first300k.txt')+' '+
  read('resources/control/emerson_essays_2944.txt')
);
const native=toLengths(read('resources/control/gibran_prophet_58585.txt'))
  .slice(3000,5896);
assert.equal(native.length,2896);
const gram=new Float64Array(K*K).fill(alpha);
const context=new Float64Array(K).fill(K*alpha);
const base=new Float64Array(K).fill(alpha);
for(const x of train)base[x]++;
for(let i=1;i<train.length;i++){gram[train[i-1]*K+train[i]]++;context[train[i-1]]++;}
const baseTotal=base.reduce((a,b)=>a+b,0);
const scores=gram.map((count,i)=>Math.log(count/context[Math.floor(i/K)])
                                    -Math.log(base[i%K]/baseTotal));
/**
 * Evaluate source grammar on fixed chapter windows. A contiguous all-book
 * word permutation can cross chapters, but the same nine original displayed
 * chapter spans are retained for hypothesis-independent scoring.
 * @param {number[]} sequence
 * @returns {{score:number, byChapter:number[]}}
 */
function score(sequence){
  const byChapter=[];let offset=0,whole=0,number=0;
  for(const chunk of chapters){
    let value=0;
    for(let i=1;i<chunk.length;i++){
      value+=scores[sequence[offset+i-1]*K+sequence[offset+i]];
    }
    byChapter.push(value/(chunk.length-1));
    whole+=value;number+=chunk.length-1;offset+=chunk.length;
  }
  return {score:whole/number,byChapter};
}
const modes=[{name:'printed',clock:null,inverse:false}];
for(const [name,clock] of Object.entries(clocks)){
  modes.push({name:name+'-forward',clock,inverse:false},
             {name:name+'-inverse',clock,inverse:true});
}
function allScores(sequence){return modes.map(m=>{
  const tape=m.clock?transpose(sequence,m.clock,m.inverse):sequence;
  return {mode:m.name,...score(tape)};
});}
const actual=allScores(original);
const nativeScores=allScores(native);
const positive={};
for(const [name,clock] of Object.entries(clocks)){
  const scrambled=transpose(native,clock,true);
  const decrypted=transpose(scrambled,clock,false);
  assert.deepEqual(decrypted,native);
  positive[name]={
    sourceNative:score(native).score,
    encryptedByInverse:score(scrambled).score,
    recoveredFromPlant:score(decrypted).score,
    exactRecovery:decrypted.every((v,i)=>v===native[i])
  };
}
let state=0x33012016;
/** @returns {number} */
function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
/** @param {number[]} arr @returns {number[]} */
function shuffled(arr){
  const out=arr.slice();
  for(let i=out.length-1;i>0;i--){
    const j=rand()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
const trials=500, bestNull=[];
for(let trial=0;trial<trials;trial++){
  const shuffledOriginal=chapters.flatMap(shuffled);
  bestNull.push(Math.max(...allScores(shuffledOriginal).map(x=>x.score)));
}
const baseline=bestNull.reduce((a,b)=>a+b,0)/trials;
const sd=Math.sqrt(bestNull.reduce((a,b)=>a+(b-baseline)**2,0)/trials);
const sorted=actual.slice().sort((a,b)=>b.score-a.score);
const best=sorted[0];
const rightTail=(1+bestNull.filter(v=>v>=best.score).length)/(trials+1);
const heldout=best.byChapter.slice(4).reduce((a,b)=>a+b,0)/5;
console.log(JSON.stringify({
  source:{runes,words:words.length,gridCells:bytes.length,
    chapterWordCounts:chapters.map(c=>c.length)},
  premise:'Source numbers as direct word-position swap direction',
  modes:actual,
  selectionCorrected:{bestMode:best.mode,bestScore:best.score,
    nullMean:baseline,nullSd:sd,z:(best.score-baseline)/sd,
    rightTail,heldoutLastFiveChapterMean:heldout,trials},
  independentNativeControl:{nativeLength:native.length,
    printed:score(native).score,variants:nativeScores,syntheticPlants:positive},
  decision:rightTail<0.01?'Possible grammar effect; requires a separate original-cipher plaintext test':
    'No source-native English word-order restoration under the fixed table-directed swap family',
  caveat:'Only the predeclared cyclic swap schedule and its three scopes are tested. No first-party message specifies this swap. A language-style effect is not plaintext.'
},null,2));
