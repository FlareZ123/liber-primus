"use strict";
/**
 * Is the rare published C[t]==C[t-1] an authentic plaintext GP-EA marker?
 *
 * Necessary condition when printed word segmentation is preserved:
 * the 86 source doublets must have the word-position distribution of
 * actual GP-EA in native English words of the same GP lengths.
 *
 * This tests the plaintext leak, not the existence of a cipher. It is
 * independent of the earlier exact-excerpt EA source-locator searches.
 * SFT: node sims/lp2_ea_marker_word_terminal_gate_sft.cjs
 * Node 22 CJS, Windows-safe, read-only, no npm packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=c.pages.filter(p=>p.page<=55),stream=pages.flatMap(p=>p.indices);
assert.equal(stream.length,12956);
const rune=new Map(c.runes.map((r,i)=>[r,i]));
const latin=new Map(c.translit.map((r,i)=>[r,i]));
const starts=new Set(),pageLocal=[],pageEligible=Array(56).fill(0);
let cursor=0;
for(const p of pages){starts.add(cursor);for(let i=0;i<p.indices.length;i++){
  pageLocal[cursor+i]=p.page;if(i)pageEligible[p.page]++;
}cursor+=p.indices.length;}
assert.equal(cursor,12956);

/** Canonical source word parser: visual line and page breaks are transparent.
 * @returns {{runes:number[],positions:number[],marked:boolean[]}[]} */
function originalWords(){
  const text=read("resources/lp2-transcription.txt")
    .split("%").slice(0,55).join("%");
  const out=[];let word=[],positions=[],marked=[],index=0;
  const flush=()=>{if(word.length){out.push({runes:word,positions,marked});
    word=[];positions=[];marked=[];}};
  for(const ch of text){
    const v=rune.get(ch);
    if(v!==undefined){
      assert.equal(stream[index],v);
      word.push(v);positions.push(index);
      marked.push(index>0&&!starts.has(index)&&stream[index-1]===v);
      index++;
    }else if(!"%/\r\n\t ".includes(ch)){flush();}
  }
  flush();
  assert.equal(index,stream.length);
  assert.equal(out.length,2896);
  return out;
}
const words=originalWords();
const original={
  words:words.length,runes:stream.length,
  repeated:words.reduce((s,w)=>s+w.marked.filter(Boolean).length,0),
  atWordStart:words.filter(w=>w.marked[0]).length,
  atWordEnd:words.filter(w=>w.marked.at(-1)).length,
  inWordsWithTwoOrMore:words.filter(w=>w.marked.filter(Boolean).length>=2).length
};
assert.deepEqual(original,{words:2896,runes:12956,repeated:86,
  atWordStart:23,atWordEnd:19,inWordsWithTwoOrMore:1});
const longDouble=words.filter(w=>w.marked.filter(Boolean).length>=2)
  .map(w=>({runeLength:w.runes.length,
    runePositions:w.marked.flatMap((b,i)=>b?[i]:[]),
    absolutePosition:w.positions[0],transliteration:w.runes.map(i=>c.translit[i]).join("")}));
assert.equal(longDouble.length,1);
assert.equal(longDouble[0].runeLength,12);
assert.deepEqual(longDouble[0].runePositions,[5,11]);

/** @param {string} text @returns {number[][]} */
function gpWords(text){
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    const letters=[];
    for(let j=0;j<word.length;){
      const p=latin.get(word.slice(j,j+2));
      if(p!==undefined){letters.push(p);j+=2;}
      else{const v=latin.get(word[j]);j++;
        if(v!==undefined)letters.push(v);}
    }
    if(letters.length)out.push(letters);
  }
  return out;
}
const sizes=new Map();
for(const w of words)sizes.set(w.runes.length,(sizes.get(w.runes.length)||0)+1);

/** Stable exact upper tail of a length-stratified Poisson-binomial model.
 * Successes >= threshold are accumulated in the last bucket.
 * @param {{p:number,n:number}[]} classes @param {number} threshold */
function terminalTail(classes,threshold){
  const dp=new Float64Array(threshold+1);
  dp[0]=1;
  for(const {p,n} of classes)for(let i=0;i<n;i++){
    for(let k=threshold;k>=1;k--){
      dp[k]=k===threshold?dp[k]+dp[k-1]*p:
        dp[k]*(1-p)+dp[k-1]*p;
    }
    dp[0]*=1-p;
  }
  return dp[threshold];
}
function benchmark(input){
  const all=gpWords(input);
  const by=new Map();
  for(const word of all){
    let row=by.get(word.length);
    if(!row){row={words:0,EA:0,first:0,last:0,two:0};by.set(word.length,row);}
    const ct=word.filter(v=>v===28).length;
    row.words++;row.EA+=ct;row.first+=Number(word[0]===28);
    row.last+=Number(word[word.length-1]===28);row.two+=Number(ct>=2);
  }
  const predicted={EA:0,first:0,last:0,two:0};
  const classes=[];
  const missing=[];
  for(const [len,count] of sizes){
    const row=by.get(len);
    if(!row){missing.push(len);continue;}
    for(const k of ["EA","first","last","two"])
      predicted[k]+=count*row[k]/row.words;
    classes.push({p:row.last/row.words,n:count});
  }
  assert.equal(missing.length,0,"Native benchmark must cover all ciphertext word lengths");
  return {nativeWords:all.length,totalEA:all.reduce((s,w)=>
    s+w.filter(v=>v===28).length,0),expectedForSourceWordLengths:predicted,
    probabilityAtLeast19TerminalEA:terminalTail(classes,19),
    sourceWordsWithTwoEA:all.filter(w=>w.filter(v=>v===28).length>=2).length};
}
const references=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["Solved LP1","resources/liber-primus/lp1-plaintext-reference.txt"]
].map(([name,source])=>({name,...benchmark(read(source))}));
assert.equal(references[0].nativeWords,55407);
assert.equal(references[1].nativeWords,15733);
assert.equal(references[2].nativeWords,77932);
for(const item of references.slice(0,3)){
  assert.ok(item.expectedForSourceWordLengths.last<3);
  assert.ok(item.probabilityAtLeast19TerminalEA<1e-10);
}

// Compare with a simple position-independent source-repeat null. Preserve
// actual repeat totals on each physical page and the exact printed positions.
const terminalByPage=Array(56).fill(0);
const startsByPage=Array(56).fill(0);
for(const w of words){
  const first=w.positions[0],last=w.positions.at(-1);
  if(!starts.has(first))startsByPage[pageLocal[first]]++;
  if(!starts.has(last))terminalByPage[pageLocal[last]]++;
}
const repeatsByPage=Array(56).fill(0);
for(const w of words)for(let i=0;i<w.marked.length;i++)
  if(w.marked[i])repeatsByPage[pageLocal[w.positions[i]]]++;
assert.equal(repeatsByPage.reduce((a,b)=>a+b,0),86);
let baselineEnd=0,baselineStart=0;
for(let p=0;p<56;p++){
  if(pageEligible[p]===0)continue;
  baselineEnd+=repeatsByPage[p]*terminalByPage[p]/pageEligible[p];
  baselineStart+=repeatsByPage[p]*startsByPage[p]/pageEligible[p];
}
const out={
  status:"Original-cipher necessary-condition rejection of literal EA repeat markers, conditional on published words retaining plaintext boundaries",
  source:original,longDouble,
  nativeEnglishWordPositionControls:references,
  pageCountPreservingRandomRepeatExpectation:{terminal:baselineEnd,initial:baselineStart},
  result:"The original has 19 doublets at printed word ends. Native GP English matched to every original word length predicts 0..2.5 terminal EA words among 2896. A source-native literal GP-EA marker assignment is implausible without changed word boundaries or atypical language.",
  scope:"The repeated ciphertext rune may still indicate another plaintext value, transport reset, escape, punctuation, or unkeyed side channel. No original unknown plaintext is asserted."
};
console.log(JSON.stringify(out,null,2));
