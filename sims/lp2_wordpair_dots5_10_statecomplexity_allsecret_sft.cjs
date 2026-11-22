"use strict";
/**
 * Authentic five-dot / ten-dot word-pair state capacity gate.
 * All-secret endpoint-bijection condition vs unchanged 2,896 original
 * printed words and 2,000 GP-native word-length-matched books per donor.
 * Contrasts plausible small state clocks with 400–1,195 independent
 * secret 29²-element codebooks, and exactly roundtrips two genuine GP
 * native complete-book positives. Node22/CommonJS, writes no files.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ids=new Map(data.runes.map((r,i)=>[r,i]));
let length=0,word=[];
const original=[];
for(const c of read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"")){
  if(ids.has(c))word.push(ids.get(c));
  else if(word.length){original.push({start:length,word});length+=word.length;word=[];}
}
if(word.length){original.push({start:length,word});length+=word.length;}
assert.equal(original.length,2896);assert.equal(length,12956);
assert.deepEqual(original.flatMap(w=>w.word),data.pages.slice(0,56).flatMap(p=>p.indices));
const positions=[];let n=0;
for(const p of data.pages){positions.push(n);n+=p.indices.length;}
const starts=[0,3,8,15,23,27,33,40,54].map(i=>positions[i]);
/** @param {number} x */
function chap(x){let c=0;for(let i=0;i<starts.length;i++)if(x>=starts[i])c=i;return c;}
const pair=[],local=Array(9).fill(0);
for(let i=0;i+1<original.length;i+=2){
  const a=original[i],b=original[i+1],chapter=chap(a.start);
  pair.push({i,global:i/2,local:local[chapter]++,chapter,wordLengths:a.word.length+"/"+b.word.length});
}
assert.equal(pair.length,1448);
/** @param {typeof pair[number]} a @param {number} phase @param {string} model */
function group(a,phase,model){
  const p=model==="globalPhase"?a.global%phase:a.local%phase;
  if(model==="globalPhase")return String(p);
  if(model==="chapterPhase")return a.chapter+"/"+p;
  if(model==="lengthPhase")return a.wordLengths+"/"+p;
  return a.chapter+"/"+a.wordLengths+"/"+p;
}
/** @param {number[][]} words @param {number} phase @param {string} model */
function equality(words,phase,model){
  const buckets=new Map();let E=0;
  for(const p of pair){
    const key=group(p,phase,model);
    let hist=buckets.get(key);
    if(!hist){hist=new Uint16Array(841);buckets.set(key,hist);}
    const k=29*words[p.i].at(-1)+words[p.i+1].at(-1);
    E+=hist[k];hist[k]++;
  }
  return {E,contexts:buckets.size};
}
const modes=["globalPhase","chapterPhase","lengthPhase","chapterLengthPhase"];
const phaseCounts=[5,10],words=original.map(w=>w.word);
const measured=phaseCounts.flatMap(phase=>modes.map(model=>({phase,model,...equality(words,phase,model)})));
assert.deepEqual(measured.map(x=>x.E),[240,34,9,2,121,19,7,2]);
assert.deepEqual(measured.map(x=>x.contexts),[5,45,403,1030,10,90,603,1195]);
/** @param {number} n */
function rng(n){let x=n>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const translit=data.translit.map((str,value)=>({str,value})).sort((a,b)=>b.str.length-a.str.length);
/** @param {string} s */
function native(s){
  const text=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<text.length;){
    if(text.startsWith("ING",i)){out.push(21);i+=3;}
    else if(text.startsWith("IO",i)){out.push(27);i+=2;}
    else{const t=translit.find(x=>text.startsWith(x.str,i));assert(t);out.push(t.value);i+=t.str.length;}
  }
  return out;
}
const donors=[
  {label:"Shakespeare",file:"resources/control/shakespeare_first300k.txt",seed:0x33012510},
  {label:"Gibran",file:"resources/control/gibran_prophet_58585.txt",seed:0x33012511},
  {label:"Emerson",file:"resources/control/emerson_essays_2944.txt",seed:0x33012512}
];
const COUNT=2000,reports=[];
let planted;
for(const d of donors){
  const pools=new Map();
  for(const token of read(d.file).match(/[A-Za-z]+/g)||[]){
    const value=native(token),p=pools.get(value.length)||[];
    p.push(value);pools.set(value.length,p);
  }
  for(const o of original)assert(pools.get(o.word.length)?.length);
  const random=rng(d.seed);
  const results=measured.map(z=>({...z,min:Infinity,max:-Infinity,sum:0,atMost:0}));
  for(let n=0;n<COUNT;n++){
    const control=original.map(o=>{
      const arr=pools.get(o.word.length);
      return arr[random()%arr.length];
    });
    if(n===0&&d.label==="Shakespeare")planted=control.map(x=>[...x]);
    for(const x of results){
      const v=equality(control,x.phase,x.model).E;
      x.min=Math.min(x.min,v);x.max=Math.max(x.max,v);
      x.sum+=v;x.atMost+=v<=x.E;
    }
  }
  reports.push({donor:d.label,stats:results.map(x=>({
    phase:x.phase,model:x.model,original:x.E,contexts:x.contexts,
    min:x.min,max:x.max,mean:x.sum/COUNT,
    atMostOriginal:x.atMost,lowerTailAddOne:(x.atMost+1)/(COUNT+1)
  }))});
}
assert(planted);
const plantReports=[];
for(const {phase,model} of [{phase:5,model:"globalPhase"},{phase:10,model:"chapterLengthPhase"}]){
  const rand=rng(0x33012570+phase),map=new Map(),reverse=new Map();
  for(const p of pair){
    const label=group(p,phase,model);
    if(map.has(label))continue;
    const perm=Array.from({length:841},(_,i)=>i);
    for(let k=840;k>0;k--){const a=rand()%(k+1);[perm[a],perm[k]]=[perm[k],perm[a]];}
    const invert=Array(841);
    for(let k=0;k<841;k++)invert[perm[k]]=k;
    map.set(label,perm);reverse.set(label,invert);
  }
  /** @param {number[][]} input @param {Map<string,number[]>} book */
  function apply(input,book){
    const out=input.map(w=>[...w]);
    for(const p of pair){
      const perm=book.get(group(p,phase,model));assert(perm);
      const x=29*out[p.i].at(-1)+out[p.i+1].at(-1);
      const y=perm[x];
      out[p.i][out[p.i].length-1]=Math.floor(y/29);
      out[p.i+1][out[p.i+1].length-1]=y%29;
    }
    return out;
  }
  const cipher=apply(planted,map),plain=apply(cipher,reverse);
  assert.deepEqual(plain,planted);
  assert.deepEqual(equality(planted,phase,model),equality(cipher,phase,model));
  plantReports.push({phase,model,secretPermutationMaps:map.size,
    trueGPsymbols:plain.flat().length,
    invariantBefore:equality(planted,phase,model).E,
    invariantAfter:equality(cipher,phase,model).E,
    roundtrip:true
  });
}
console.log(JSON.stringify({
  question:"Do authentic five-dot / ten-dot period clocks alone yield a feasible all-secret paired BASE29 terminal-rune cipher?",
  source:"all 12,956 unchanged p0-p55 runes; 2,896 complete words; nine author-visible chapter headings",
  originalModels:measured,
  threeGenuineWordLengthMatchedGPDonors:reports,
  trueGPSecretSboxControls:plantReports,
  decision:"5/10 periodic phase-alone or chapter phase needs independent source map and fails strongly if its matched native-GP null is separate; ten phase plus chapter plus exact ordered lengths needs 1195 arbitrary independent 841-way secret maps before modest native-English survivor rate. No creator-selected maps or plaintext. E is necessary and key-invariant, language comparison conditional."
},null,2));
