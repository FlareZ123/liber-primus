'use strict';
/**
 * Page- and rune-word-length-conditioned shuffle of the genuine duplicated
 * 3+3 LP2 terminal word pair. Tests page layout as an alternative explanation
 * to the earlier very low section-conditioned rarity estimate.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const {parseSections}=require('./lp2_repeated_wordpair_probe.cjs');
const raw=fs.readFileSync('resources/lp2-transcription.txt','utf8');
const full=parseLP2Words(raw).words,sections=parseSections(raw),flat=sections.flat(),length=flat.length;
assert.equal(length,2896);
const terms=flat.map((w,i)=>{
  assert.equal(w.word,full[i].runes);
  return {word:w.word,length:w.length,section:sections.findIndex(s=>s.includes(w)),page:full[i].startPage};
});
// Section index derived once from exact section position, independent of word equality.
let idx=0;
for(let i=0;i<sections.length;i++)for(const w of sections[i])terms[idx++].section=i;
const vocabulary=new Map();
const codes=terms.map(w=>{
  if(!vocabulary.has(w.word))vocabulary.set(w.word,vocabulary.size);
  return vocabulary.get(w.word);
});
const base=vocabulary.size+1,ends=terms.map((w,i)=>i===0||w.section!==terms[i-1].section);
const lengthAt=terms.map(w=>w.length);
function score(values){
  const seen=new Map();
  let repeatTypes=0,longest=0,terminal=false;
  for(let i=0;i+1<values.length;i++){
    if(ends[i+1])continue;
    const pair=values[i]*base+values[i+1];
    const prior=seen.get(pair);
    if(prior!==undefined){
      repeatTypes++;
      longest=Math.max(longest,lengthAt[i]+lengthAt[i+1]);
      terminal ||= i===values.length-2||prior===values.length-2;
    }else seen.set(pair,i);
  }
  return {repeatTypes,longest,terminal};
}
const observed=score(codes);
assert.deepEqual(observed,{repeatTypes:1,longest:6,terminal:true});
const groups=new Map();
for(let i=0;i<terms.length;i++){
  const key=terms[i].page+':'+terms[i].length;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(i);
}
let rng=0x05e27111;
function random(){
  rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
  return (rng>>>0)/4294967296;
}
const reps=20000,tails={any:0,len6:0,terminal:0},hist={},lengthGroups=[...groups.values()].filter(g=>g.length>1);
for(let sample=0;sample<reps;sample++){
  const vals=codes.slice();
  for(const g of lengthGroups)for(let k=g.length-1;k>0;k--){
    const j=Math.floor(random()*(k+1)),a=g[k],b=g[j];
    [vals[a],vals[b]]=[vals[b],vals[a]];
  }
  const result=score(vals);
  tails.any+=result.repeatTypes>=1;
  tails.len6+=result.longest>=6;
  tails.terminal+=result.terminal;
  hist[result.repeatTypes]=(hist[result.repeatTypes]||0)+1;
}
const pages=[27,54].map(index=>{
  const ids=terms.map((w,i)=>w.page===index?i:-1).filter(i=>i>=0);
  const n3=ids.filter(i=>terms[i].length===3).length;
  let adj=0;
  for(let i=0;i+1<terms.length;i++)
    if(terms[i].page===index&&terms[i+1].page===index&&
      !ends[i+1]&&terms[i].length===3&&terms[i+1].length===3)adj++;
  return {transcriptionPage:index,physicalPage:index<50?index:index+1,words:ids.length,
    threeRuneWords:n3,adjacentThreeRuneSlots:adj};
});
assert.deepEqual(pages.map(x=>[x.threeRuneWords,x.adjacentThreeRuneSlots]),[[13,4],[2,1]]);
const exactPairPlacementProbability=pages[0].adjacentThreeRuneSlots/
  (pages[0].threeRuneWords*(pages[0].threeRuneWords-1));
console.log(JSON.stringify({observed,words:length,uniqueWords:vocabulary.size,
  originalSourcePages:pages,model:'shuffles same-length whole rune words only within the same physical source page',
  exactConditionalTargetPairProbability:exactPairPlacementProbability,exactFormula:'4 / (13 * 12) = 1/39',
  trials:reps,seed:'0x05e27111',nullRepeatHistogram:hist,
  exceedances:tails,plusOneP:{any:(tails.any+1)/(reps+1),len6:(tails.len6+1)/(reps+1),
    terminal:(tails.terminal+1)/(reps+1)}},null,2));
