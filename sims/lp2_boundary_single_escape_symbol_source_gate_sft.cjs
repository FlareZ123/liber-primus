'use strict';
/**
 * Original-word-boundary minimal lossless GP29->28 exclusion-escape test.
 * Exact static per-previous-cipher key-family exclusion, original/heldout split.
 * CommonJS SFT, no external libraries.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription=read('resources/lp2-transcription.txt');
const pages=transcription.split('%').slice(0,55);
assert.equal(pages.length,55);
const alphabet=new Map(corpus.runes.map((r,i)=>[r,i]));
const records=[];
const sizes=[];
for(let slot=0;slot<55;slot++){
 const physical=slot<50?slot:slot+1;
 const chars=[...pages[slot]];
 const positions=[];
 for(let j=0;j<chars.length;j++){
  if(alphabet.has(chars[j]))positions.push({rune:alphabet.get(chars[j]),pos:j});
 }
 const native=corpus.pages[physical].indices;
 assert.deepEqual(positions.map(o=>o.rune),native,'original physical p'+physical);
 sizes.push(native.length);
 for(let k=1;k<positions.length;k++){
  const prev=positions[k-1],curr=positions[k];
  const delimiter=chars.slice(prev.pos+1,curr.pos)
    .filter(c=>'.-&$§'.includes(c)).join('');
  records.push({page:physical,offset:k,prior:prev.rune,output:curr.rune,
    boundary:delimiter.length>0,separator:delimiter});
 }
}
assert.equal(sizes.reduce((a,b)=>a+b),12956);
assert.equal(records.length,12901);
const summary=(scope)=>{
 const events=records.filter(scope);
 const boundary=new Map();
 for(const o of events){
  if(!o.boundary)continue;
  if(!boundary.has(o.prior))boundary.set(o.prior,new Set());
  boundary.get(o.prior).add(o.output);
 }
 const repeated=events.filter(o=>o.output===o.prior);
 const inside=repeated.filter(o=>!o.boundary);
 const supported=[...boundary.entries()].map(([prior,values])=>({prior,count:values.size}));
 return {
  steps:events.length,boundaries:events.filter(o=>o.boundary).length,
  repeats:repeated.length,repeatsAtBoundary:repeated.length-inside.length,
  repeatedOutputWithoutBoundary:inside.length,
  priorStatesWithAtLeastTwoDistinctBoundaryOutputs:supported.filter(x=>x.count>=2).length,
  largestBoundaryOutputSupport:Math.max(...supported.map(x=>x.count)),
  sourceExamples:{
   firstB0Doublet:inside[0]&&[inside[0].page,inside[0].offset,inside[0].prior],
   largestBoundaryState:supported.slice().sort((a,b)=>b.count-a.count)[0]
  }
 };
};
// Stronger model-independent finite-state pigeonhole check:
// If the encoder receives exactly one GP29 plaintext symbol and only the
// previous ciphertext rune as state, it can output at most 29 different
// (printed word-start flag, ciphertext rune) pairs per state.
function pairCapacity(filter) {
 const map=new Map();
 for(const o of records.filter(filter)){
  if(!map.has(o.prior))map.set(o.prior,new Set());
  map.get(o.prior).add(Number(o.boundary)+':'+o.output);
 }
 const counts=[...map.values()].map(s=>s.size);
 return {states:counts.length,max:Math.max(...counts),
  above29:counts.filter(n=>n>29).length,
  min:Math.min(...counts)};
}
const inputPairTrain=pairCapacity(o=>o.page<=39);
const inputPairHeldout=pairCapacity(o=>o.page>=40);
const inputPairWhole=pairCapacity(()=>true);
const inputPairP40=pairCapacity(o=>o.page>=40&&o.page<=53);
assert.deepEqual(inputPairTrain,{states:29,max:58,above29:29,min:53});
assert.deepEqual(inputPairHeldout,{states:29,max:48,above29:29,min:38});
assert.deepEqual(inputPairWhole,{states:29,max:58,above29:29,min:54});
assert.equal(inputPairP40.max,47);
assert.equal(inputPairP40.above29,29);

const train=summary(o=>o.page<=39);
const heldout=summary(o=>o.page>=40&&o.page<=55);
const whole=summary(()=>true);
assert.deepEqual(
 [train.steps,train.boundaries,train.repeats,train.repeatsAtBoundary,train.repeatedOutputWithoutBoundary,
  train.priorStatesWithAtLeastTwoDistinctBoundaryOutputs,train.largestBoundaryOutputSupport],
 [9600,2141,65,17,48,29,29]);
assert.deepEqual(
 [heldout.steps,heldout.boundaries,heldout.repeats,heldout.repeatsAtBoundary,heldout.repeatedOutputWithoutBoundary,
  heldout.priorStatesWithAtLeastTwoDistinctBoundaryOutputs,heldout.largestBoundaryOutputSupport],
 [3301,732,21,6,15,29,20]);
assert.deepEqual(
 [whole.steps,whole.boundaries,whole.repeats,whole.repeatsAtBoundary,whole.repeatedOutputWithoutBoundary,
  whole.priorStatesWithAtLeastTwoDistinctBoundaryOutputs,whole.largestBoundaryOutputSupport],
 [12901,2873,86,23,63,29,29]);
// Concrete key choice within the all-secret family:
// p==prior => (boundary=1,c=(prior+1)%29), otherwise
// (boundary=0,c=p). Any 28-way fixed secret bijection for non-special
// symbols and one arbitrary fixed c for boundary=1 is equally excluded.
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const native=[];
for(let word of read('resources/control/shakespeare_first300k.txt').toUpperCase().match(/[A-Z]+/g)||[]){
 word=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C')
  .replace(/Z/g,'S').replace(/ING/g,'NG');
 for(let k=0;k<word.length;){
  const token=tokens.find(t=>word.startsWith(t.s,k));
  assert.ok(token);
  native.push(token.i);k+=token.s.length;
 }
 if(native.length>=12956)break;
}
assert.ok(native.length>=12956);
const plain=native.slice(0,12956);
let at=0,carrierOnes=0;
for(let page=0;page<sizes.length;page++){
 let prior=0;
 const emitted=[];
 for(let i=0;i<sizes[page];i++){
  const value=plain[at+i];
  const boundary=value===prior;
  const output=boundary?(prior+1)%29:value;
  assert.notEqual(output,prior);
  const recovered=boundary?prior:output;
  assert.equal(recovered,value);
  emitted.push({output,boundary});
  carrierOnes+=Number(boundary);
  prior=output;
 }
 // The decoder knows only emitted rune/flag pairs and page reset.
 let previous=0;
 for(let i=0;i<sizes[page];i++){
  const {output,boundary}=emitted[i];
  assert.equal(boundary?previous:output,plain[at+i]);
  previous=output;
 }
 at+=sizes[page];
}
assert.equal(at,12956);
console.log('PASS: source rune identity, exact 12,901 original gap flags, native GP29 12,956-symbol invertible planted code, and blind heldout obstruction');
console.log(JSON.stringify({train,heldout,whole,inputPairTrain,inputPairHeldout,inputPairWhole,inputPairP40,positivePlant:{plainSymbols:plain.length,carrierOnes,
  outputAlwaysExcludesPrior:true,completeRoundtrip:true},decision:
 'Minimal one-special-symbol per known preceding cipher state boundary-escape code is incompatible with original input on both splits; additional unselected escape vocabulary or state would be required.'},null,2));