"use strict";
/**
 * Keyless conditional-IoC test for a massive unknown-table cipher family.
 *
 * GP prime running sum q of published ciphertext (mod 32), and publicly
 * visible 8-way section/clock column, select one of 256 state rows.
 * Each state row has an arbitrary SECRET 28-permutation. The plaintext
 * special rune EA is encoded as a repeated ciphertext symbol; all other
 * plaintext glyphs are mapped to a 28-rank that excludes prior C.
 *
 * Conditional rank histograms are merely permuted by any secret key row.
 * Their pooled within-row coincidence is invariant to all (28!)^256
 * possible hidden tables. Contrasts original LP2 against source-native
 * GP English with independent secret key and a matched original-marker
 * random nonrepeat negative control.
 *
 * Run node sims/grid_prime_state_permutation_invariant.cjs
 * Node 22, built-ins only, no writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text=read("resources/lp2-transcription.txt").split("%").slice(0,55).join("%");
const id=new Map(GP.runes.map((c,i)=>[c,i]));
const original=[];
let page=0,section=0,word=0,opened=false;
for(const ch of text){
  if(id.has(ch)){
    original.push({c:id.get(ch),page:page>=50?page+1:page,section,word});
    opened=true;
  }else if(ch==="%"){
    page++;
  }else if(ch==="$"){
    if(opened){word++;opened=false;}
    section++;
  }else if(ch==="/"||/\s/u.test(ch)){
    // Page and printed line wraps preserve a word.
  }else if(opened){word++;opened=false;}
}
if(opened)word++;
assert.equal(original.length,12956);
assert.equal(word,2896);
assert.equal(section,8);
assert.deepEqual(original.map(v=>v.c),GP.pages.filter(p=>p.page<56&&p.indices.length).flatMap(p=>p.indices));
const modes=[];
for(const reset of ["book","page","section","word"])
for(const column of ["section","rune-clock"])
for(const rank of ["cyclic","sorted"])modes.push({reset,column,rank});
assert.equal(modes.length,16);

/** @param {number} seed */
function random(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {string} source */
function gpText(source){
  const all=[];
  const tokens=GP.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  for(let w of source.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
      .replace(/Z/g,"S").replace(/ING/g,"NG");
    const out=[];
    for(let i=0;i<w.length;){
      const found=tokens.find(x=>w.startsWith(x.s,i));
      if(!found){out.length=0;break;}
      out.push(found.i);i+=found.s.length;
    }
    all.push(...out);
  }
  return all;
}
/** @param {number[]} ciphertext @param {typeof modes[number]} mode
 *  @param {number[] | null} plaintext
 */
function statistic(ciphertext,mode,plaintext=null){
  const groups=Array.from({length:256},()=>new Uint16Array(28));
  const plainGroups=plaintext?Array.from({length:256},()=>new Uint16Array(28)):null;
  let state=0,previous=-1,oldGroup=null,previousPage=-1;
  for(let i=0;i<original.length;i++){
    const o=original[i],current=ciphertext[i];
    const group=mode.reset==="book"?0:o[mode.reset];
    if(group!==oldGroup){state=0;oldGroup=group;}
    if(o.page!==previousPage)previous=-1;
    const col=mode.column==="section"?o.section:i%8;
    if(previous>=0&&current!==previous){
      const rank=mode.rank==="cyclic"?((current-previous-1+29)%29):
        current-Number(current>previous);
      groups[8*state+col][rank]++;
      if(plainGroups){
        const plain=plaintext[i];
        assert.ok(plain>=0&&plain<28);
        plainGroups[8*state+col][plain]++;
      }
    }
    previous=current;previousPage=o.page;
    state=(state+GP.prime[current])%32;
  }
  /** @param {Uint16Array[]} table */
  function count(table){
    let observed=0,pairs=0,cells=0;
    for(const row of table){
      const n=row.reduce((a,b)=>a+b,0);
      if(n>1){cells++;pairs+=n*(n-1);}
      for(const k of row)observed+=k*(k-1);
    }
    return {ioc:observed/pairs,observed,pairs,nonemptyCells:cells};
  }
  const cipher=count(groups);
  if(plainGroups){
    const expected=count(plainGroups);
    assert.equal(cipher.ioc,expected.ioc,
      "Permutation cannot change within-state conditional coincidence");
    return {...cipher,plaintextInvariant:true};
  }
  return cipher;
}
/**
 * GP-English plant with a different arbitrary 28-permutation in every
 * observable state cell. Its known first glyph on each page is transported.
 * @param {number[]} plaintext
 * @param {typeof modes[number]} mode
 * @param {number[][]} secret
 */
function encrypt(plaintext,mode,secret){
  assert.equal(plaintext.length,original.length);
  const result=[];
  let state=0,previous=-1,oldGroup=null,oldPage=-1;
  for(let i=0;i<plaintext.length;i++){
    const row=original[i],group=mode.reset==="book"?0:row[mode.reset];
    if(group!==oldGroup){state=0;oldGroup=group;}
    if(row.page!==oldPage)previous=-1;
    const q=plaintext[i],col=mode.column==="section"?row.section:i%8;
    const c=previous<0?q:q===28?previous:
      mode.rank==="cyclic"?
        (previous+secret[8*state+col][q]+1)%29:
        secret[8*state+col][q]+
          Number(secret[8*state+col][q]>=previous);
    result.push(c);
    previous=c;oldPage=row.page;
    state=(state+GP.prime[c])%32;
  }
  return result;
}
/** @param {number[]} ciphertext @param {typeof modes[number]} mode
 *  @param {number[][]} secret
 */
function decrypt(ciphertext,mode,secret){
  const inverse=secret.map(row=>{
    const inv=new Int8Array(28);
    for(let i=0;i<28;i++)inv[row[i]]=i;
    return inv;
  });
  const out=[];
  let state=0,previous=-1,oldGroup=null,oldPage=-1;
  for(let i=0;i<ciphertext.length;i++){
    const row=original[i],group=mode.reset==="book"?0:row[mode.reset];
    if(group!==oldGroup){state=0;oldGroup=group;}
    if(row.page!==oldPage)previous=-1;
    const c=ciphertext[i],col=mode.column==="section"?row.section:i%8;
    const rank=previous<0?-1:c===previous?28:
      mode.rank==="cyclic"?(c-previous-1+29)%29:
        c-Number(c>previous);
    out.push(rank<0?c:rank===28?28:inverse[8*state+col][rank]);
    previous=c;oldPage=row.page;
    state=(state+GP.prime[c])%32;
  }
  return out;
}
/**
 * Preserve all real physical-page heads and exact locations of repeated
 * glyphs, randomize the other 28-way output choices.
 * @param {() => number} next
 */
function matchedNull(next){
  const result=new Array(original.length);
  let prev=-1,oldPage=-1,oldOriginal=-1;
  for(let i=0;i<original.length;i++){
    const row=original[i];
    if(row.page!==oldPage){prev=-1;oldOriginal=-1;}
    const repeat=oldOriginal>=0&&row.c===oldOriginal;
    const c=prev<0?row.c:repeat?prev:
      (prev+1+next()%28)%29;
    result[i]=c;
    prev=c;oldOriginal=row.c;oldPage=row.page;
  }
  return result;
}
function run(){
  const model={reset:"page",column:"rune-clock",rank:"cyclic"};
  const next=random(0x33012956);
  const secret=Array.from({length:256},()=>{
    const row=Array.from({length:28},(_,i)=>i);
    for(let j=27;j>0;j--){
      const k=next()%(j+1);
      [row[k],row[j]]=[row[j],row[k]];
    }
    return row;
  });
  const english=gpText(read("resources/control/shakespeare_first300k.txt"));
  assert.ok(english.length>=original.length);
  const source=english.slice(0,original.length);
  const planted=encrypt(source,model,secret);
  const clear=decrypt(planted,model,secret);
  assert.deepEqual(clear,source);
  assert.deepEqual(encrypt(clear,model,secret),planted);
  const measured=statistic(original.map(x=>x.c),model);
  const plantedMeasured=statistic(planted,model,source);
  const allOriginal=modes.map(m=>({...m,...statistic(original.map(x=>x.c),m)}))
    .sort((a,b)=>b.ioc-a.ioc);
  const nulls=[],nullNext=random(0x33123256);
  for(let i=0;i<128;i++){
    nulls.push(statistic(matchedNull(nullNext),model).ioc);
  }
  const mu=nulls.reduce((a,b)=>a+b,0)/nulls.length;
  const sd=Math.sqrt(nulls.reduce((a,b)=>a+(b-mu)**2,0)/(nulls.length-1));
  const upper=nulls.filter(x=>x>=measured.ioc).length;
  return {
    family:"arbitrary independent 28-permutation in each public GP-prime accumulator/column state",
    stateRows:256,perRowKeyCount:"28!",overallKeyCount:"(28!)^256",
    alphabetDependentRankPatterns:modes.length,
    testSource:"12,956 original LP2 runes, exact 2,896 original words, eight sections",
    chosenModel:model,
    original:measured,
    originalMaxPostselected:allOriginal.slice(0,5),
    sourceNativePositive:{
      mode:model,arbitraryIndependentSecretPermutations:256,
      actualRecovered:clear.filter((v,i)=>v===source[i]).length,
      total:source.length,conditionalStatistic:plantedMeasured
    },
    matchedOriginalRepeatNull:{
      n:128,mean:mu,sd,
      upperTail:(upper+1)/(nulls.length+1),
      min:Math.min(...nulls),max:Math.max(...nulls)
    },
    uniform28:1/28,
    interpretation:"No detectable GP-English conditional marginals under any unknown fixed 28-permutation per public running-prime state. Different plaintext registers, dynamic keys or hidden state are not excluded."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={statistic,encrypt,decrypt,matchedNull,run};
