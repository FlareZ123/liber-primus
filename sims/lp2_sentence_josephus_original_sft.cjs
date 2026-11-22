"use strict";
/**
 * Sentence-local Josephus permutation on authentic LP2 printed word lengths.
 * Independent GP-native English-control grammar and sentence-preserving null.
 * Node.js 22 CommonJS, standard modules, read-only SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("%");
const runes=new Set(corpus.runes),sentences=[];
let word="",sentence=[];
function flushWord(){if(word)sentence.push([...word].length);word="";}
function flushSentence(){if(sentence.length)sentences.push(sentence);sentence=[];}
for(const glyph of source){
  if(runes.has(glyph))word+=glyph;
  else if("-.$&".includes(glyph)){
    flushWord();
    if(glyph===".")flushSentence();
  }else if(!/[\s\/%]/u.test(glyph))flushWord();
}
flushWord();flushSentence();
const lengths=sentences.flat(),n=lengths.length;
assert.equal(sentences.length,175);
assert.equal(n,2896);
assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
const spans=[];
let pos=0;
for(const line of sentences){spans.push([pos,pos+line.length]);pos+=line.length;}
const alphabet=corpus.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} input @returns {number} */
function gpLength(input){
  const normalized=input.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let count=0;
  for(let i=0;i<normalized.length;){
    const t=normalized.startsWith("ING",i)?"ING"
      :normalized.startsWith("IO",i)?"IO"
      :alphabet.find(k=>normalized.startsWith(k,i));
    assert(t,"Invalid GP control word: "+input);
    count++;
    i+=t.length;
  }
  return count;
}
const files=["resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"];
const controls=files.map(file=>(read(file).match(/[A-Za-z]+/g)||[]).map(gpLength));
assert.deepEqual(controls.map(x=>x.length),[15733,55407,77932]);
const mat=Array.from({length:9},()=>Array(9).fill(0)),freq=Array(9).fill(0);
for(const sourceWords of controls)for(let i=1;i<sourceWords.length;i++){
  const a=Math.min(8,sourceWords[i-1]-1),b=Math.min(8,sourceWords[i]-1);
  mat[a][b]++;freq[b]++;
}
const row=mat.map(v=>v.reduce((a,b)=>a+b));
const total=freq.reduce((a,b)=>a+b);
const llr=mat.map((r,i)=>r.map((c,j)=>
  Math.log((c+0.5)/(row[i]+4.5))-
  Math.log((freq[j]+0.5)/(total+4.5))));
/** @param {number[]} words @param {number[]} map @returns {number} */
function score(words,map){
  let s=0;
  for(const [start,end] of spans)for(let i=start+1;i<end;i++){
    s+=llr[Math.min(8,words[map[i-1]]-1)][Math.min(8,words[map[i]]-1)];
  }
  return s;
}
/** @param {number} length @param {number[]} steps @returns {number[]} */
function elimination(length,steps){
  const remain=Array.from({length},(_,i)=>i),order=[];
  let cursor=0;
  while(remain.length){
    const step=steps[order.length%steps.length];
    assert(Number.isSafeInteger(step)&&step>0);
    cursor=(cursor+step-1)%remain.length;
    order.push(remain.splice(cursor,1)[0]);
  }
  return order;
}
/** @param {number[]} steps @param {boolean} inverse @returns {number[]} */
function permutation(steps,inverse){
  const map=new Array(n);
  for(const [start,end] of spans){
    const order=elimination(end-start,steps);
    for(let i=0;i<order.length;i++){
      if(inverse)map[start+order[i]]=start+i;
      else map[start+i]=start+order[i];
    }
  }
  assert.equal(new Set(map).size,n);
  return map;
}
const fixed=[
  ["GP29",[29]],
  ["grid256",[256]],
  ["p15-center3299",[3299]],
  ["Cicada3301",[3301]],
  ["p15-spiral-distances",[3299,3298,3296,3294,3288,3278,3258,3222,
    3152,3038,2838,2472,1820,708,1206,4516]],
  ["p15-prime-ordinals",[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]],
  ["p15-prime-values",[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]]
];
const cases=fixed.flatMap(([name,steps])=>[false,true].map(inverse=>{
  const map=permutation(steps,inverse);
  return {name,inverse,map,score:score(lengths,map)};
}));
const identity=Array.from({length:n},(_,i)=>i);
const raw=score(lengths,identity);
const best=cases.reduce((a,b)=>a.score>b.score?a:b);
assert.equal(best.name,"GP29");assert(best.inverse);
assert(Math.abs(raw+79.33628753192995)<1e-8);
assert(Math.abs(best.score+69.72596118554925)<1e-8);
let seed=0x0f8311f2;
/** @returns {number} */
function next(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const shuffled=lengths.slice(),trials=1500,hits=Array(cases.length).fill(0);
let familyHits=0,familyTotal=0;
for(let t=0;t<trials;t++){
  for(const [start,end] of spans)for(let i=end-1;i>start;i--){
    const j=start+next()%(i-start+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  let maximum=-Infinity;
  for(let i=0;i<cases.length;i++){
    const result=score(shuffled,cases[i].map);
    if(result>=cases[i].score)hits[i]++;
    maximum=Math.max(maximum,result);
  }
  familyTotal+=maximum;
  if(maximum>=best.score)familyHits++;
}
assert.equal(familyHits,trials);
assert(Math.abs(familyTotal/trials+56.52107122429006)<1e-7);
assert.equal(hits[1],603);
const plants=[];
for(let i=0;i<controls.length;i++){
  const native=controls[i].slice(4000,4000+n);
  const masked=cases[0].map.map(j=>native[j]);
  const restored=cases[1].map.map(j=>masked[j]);
  assert.deepEqual(restored,native);
  plants.push({source:files[i],recovered:native.length,
    nativeScore:score(native,identity),maskedScore:score(masked,identity)});
}
const report={
  counts:{sentences:sentences.length,words:n,runes:12956},
  rawEnglishScore:raw,best:{name:best.name,inverse:best.inverse,score:best.score},
  candidates:cases.map((c,i)=>({name:c.name,inverse:c.inverse,
    score:c.score,fixedNullUpperP:(hits[i]+1)/(trials+1)})),
  null:{samples:trials,exceedances:familyHits,
    familywiseP:(familyHits+1)/(trials+1),meanFamilyMaximum:familyTotal/trials},
  nativePositivePlants:plants
};
console.log(JSON.stringify(report,null,2));
console.log("PASS original LP2, finite source steps, independent controls, inverse plants");
