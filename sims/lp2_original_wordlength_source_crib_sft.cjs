"use strict";
/**
 * Key-independent historical-plaintext crib recovery from LP2 printed word
 * lengths, with three pinned pre-existing public-domain source corpora.
 * SFT: node sims/lp2_original_wordlength_source_crib_sft.cjs
 * This neither assumes nor searches a cipher key. A real exact source
 * passage must preserve the displayed original GP29 word lengths.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
/** @param {string} name */
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes=new Set(gp.runes);
const fragments=read("resources/lp2-transcription.txt").split("%").slice(0,55);
const transcription=fragments.join("%");
const original=[];
let word="";
for(const char of transcription){
  if(runes.has(char)){word+=char;continue;}
  if(char==="%"||char==="/"||/\s/u.test(char))continue;
  if(word){original.push(word);word="";}
}
if(word)original.push(word);
const lengths=original.map(x=>Array.from(x).length);
assert.equal(original.length,2896);
assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
assert.deepEqual(original.flatMap(x=>Array.from(x)).map(r=>gp.runes.indexOf(r)),
  gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));

const tokens=gp.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} w */
function gpWordLength(w){
  const value=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  let count=0;
  for(let i=0;i<value.length;){
    const t=tokens.find(x=>value.startsWith(x,i));
    assert.ok(t,"GP29 parsing failed at "+value.slice(i));
    i+=t.length;
    count++;
  }
  return count;
}
/** @param {string} text @param {"gp"|"latin"} register */
function parseText(text,register){
  return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>({
    word:w,length:register==="gp"?gpWordLength(w):w.length
  }));
}
/**
 * Return longest exact word-length run over all offsets. The search checks
 * every candidate seeded by an exact six-length match, with no language
 * score and no adaptive exceptions.
 * @param {number[]} target
 * @param {{word:string,length:number}[]} candidate
 */
function bestRun(target,candidate){
  const K=6,lookup=new Map();
  for(let i=0;i<=target.length-K;i++){
    const k=target.slice(i,i+K).join(",");
    let xs=lookup.get(k);
    if(!xs)lookup.set(k,xs=[]);
    xs.push(i);
  }
  let best={length:0,targetOffset:-1,sourceOffset:-1,sourceWords:""};
  let atLeast8=0;
  for(let j=0;j<=candidate.length-K;j++){
    const key=candidate.slice(j,j+K).map(x=>x.length).join(",");
    const matches=lookup.get(key)||[];
    for(const i of matches){
      let n=K;
      while(i+n<target.length&&j+n<candidate.length&&
            target[i+n]===candidate[j+n].length)n++;
      if(n>=8)atLeast8++;
      if(n>best.length)best={
        length:n,targetOffset:i,sourceOffset:j,
        sourceWords:candidate.slice(j,j+Math.min(n,40)).map(x=>x.word).join(" ")
      };
    }
  }
  return {...best,atLeast8};
}
const sources=[
  {file:"resources/control/shakespeare_first300k.txt",nWords:55407,max:{gp:9,latin:9}},
  {file:"resources/control/gibran_prophet_58585.txt",nWords:15733,max:{gp:9,latin:9}},
  {file:"resources/control/emerson_essays_2944.txt",nWords:77932,max:{gp:9,latin:10}}
];
const results=[];
for(const item of sources){
  const text=read(item.file);
  for(const register of ["gp","latin"]){
    const words=parseText(text,register);
    assert.equal(words.length,item.nWords);
    const match=bestRun(lengths,words);
    assert.equal(match.length,item.max[register]);
    results.push({file:item.file,register,words:words.length,...match});
  }
}
// Positive control: replace an original interval with 32 source-native
// printed word lengths. A recoverable copied passage must now be found.
const plantSource=parseText(read(sources[0].file),"gp");
const planted=lengths.slice();
const inserted=plantSource.slice(1000,1032).map(x=>x.length);
planted.splice(500,inserted.length,...inserted);
const recovery=bestRun(planted,plantSource);
assert.ok(recovery.length>=32);
assert.ok(recovery.targetOffset<=500&&recovery.targetOffset+recovery.length>=532);
assert.ok(recovery.sourceOffset<=1000&&recovery.sourceOffset+recovery.length>=1032);
console.log(JSON.stringify({
  originalWordCount:original.length,originalRuneCount:12956,
  sourceFiles:results,
  positivePlant:{insertOriginalWordAt:500,sourceWordAt:1000,
                 embeddedLength:32,recoveredLength:recovery.length},
  inference:"No exact >=11-word source-language length crib among these three finite public-domain texts. Other sources, page-boundary errors, variable-length ciphers and non-English input remain open."
},null,2));
