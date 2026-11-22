"use strict";
/**
 * Lossless, explicit 29-choice source-GP successor encoder with three
 * context-specific reserved outputs. The objective is a constructive
 * architecture test; no historical key or plaintext is claimed.
 *
 * EA -> repeated preceding ciphertext rune (any non-page initial position).
 * S  -> T6=(24-2*C[word,i-6]) mod29 at printed-word offsets >=6.
 * U  -> C[word,i-5] at offsets>=5, except when that rune is 15:
 * E  -> 15 at those specific lag-five contexts.
 *
 * The source label S/index15 is also the page-40 red-span quotient.
 * Output collisions among the reserved classes are resolved by the next
 * unused 29-state output. All 29 input symbols map to distinct outputs.
 * Unreserved input symbols map by a uniform random-key cyclic rotation
 * through the unused outputs, supplying a truly bijective transducer.
 * Visible cipher-word breaks are independent from source-word breaks.
 *
 * Comparison: 1000 source-native GP manuscripts, original LP2 2896 cipher
 * word lengths / 55 physical page seeds, exact forward-reverse checks.
 * Parameters and source labels were selected following study of ciphertext
 * frequencies; the simulation is a constructive fit, not discovery evidence.
 *
 * Run: node sims/lp2_lossless_three_reserve_forward.cjs (Node>=22).
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
const glyph=new Map(corpus.runes.map((x,i)=>[x,i]));
const text=read("resources/lp2-transcription.txt").split("%").slice(0,55).join("%");
const words=text.split(/[-.&$§]/u).map(s=>[...s].filter(c=>glyph.has(c)).map(c=>glyph.get(c))).filter(x=>x.length);
assert.deepEqual(words.flat(),original);assert.equal(words.length,2896);
const pageStarts=new Set();let pos=0;
for(const p of pages){pageStarts.add(pos);pos+=p.indices.length;}
assert.equal(pos,12956);
const n=pos,M=29,TRIALS=1000;
const mod=(a,b)=>(a%b+b)%b;
const cleaned=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return !s.startsWith("#")&&!s.startsWith("[")&&!/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
const gpToken=new Map(corpus.translit.map((s,i)=>[s,i]));
const sourceWords=(cleaned.match(/[A-Za-z]+/gu)||[]).map(raw=>{
  const s=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const row=[];
  for(let i=0;i<s.length;){
    const pair=gpToken.get(s.slice(i,i+2));
    if(pair!==undefined){row.push(pair);i+=2;}
    else{const single=gpToken.get(s[i]);assert(single!==undefined);row.push(single);i++;}
  }
  return row;
}).filter(w=>w.length);
assert.equal(sourceWords.flat().length,3248);

/** @param {number} seed */
function rng(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
/** @param {()=>number} rand */
function sourcePlain(rand){
  const p=[];
  while(p.length<n){
    const selected=sourceWords[rand()%sourceWords.length];
    for(const r of selected)p.push(r);
  }
  p.length=n;return p;
}
/**
 * Given previously published outputs within this printed word, build an
 * exact 29-choice GP plaintext -> ciphertext permutation.
 *
 * @param {number[]} observedWord Before current glyph (index j)
 * @param {number} j Index within printed cipher word
 * @param {number} prev Last published GP glyph, across word breaks
 */
function alphabet(observedWord,j,prev){
  const special=new Map(),used=new Set();
  function reserve(letter,requested){
    let target=requested;
    while(used.has(target))target=(target+1)%M;
    used.add(target);special.set(letter,target);
  }
  reserve(28,prev); // first priority: exact adjacent repeat / GP EA
  if(j>=6)reserve(15,mod(24-2*observedWord[j-6],M));
  if(j>=5)reserve(observedWord[j-5]===15?18:1,observedWord[j-5]);
  const remainingPlain=Array.from({length:M},(_,i)=>i).filter(v=>!special.has(v));
  const remainingCipher=Array.from({length:M},(_,i)=>i).filter(v=>!used.has(v));
  assert.equal(special.size+remainingPlain.length,M);
  assert.equal(special.size+remainingCipher.length,M);
  return {special,remainingPlain,remainingCipher};
}
/**
 * Exact encoder. Keys specify a cyclic rotation among unreserved symbols.
 * Source page-head symbols are replaced by IV glyphs, with no plaintext
 * claimed for those 55 positions.
 * @param {number[]} plain @param {()=>number} random
 */
function encrypt(plain,random){
  assert.equal(plain.length,n);
  const ciphertext=[],keys=[];
  let offset=0;
  for(const word of words){
    const row=[];
    for(let j=0;j<word.length;j++){
      const absolute=offset+j;
      if(pageStarts.has(absolute)){
        const initial=random()%M;
        row.push(initial);ciphertext.push(initial);keys.push(-1);
        continue;
      }
      const {special,remainingPlain,remainingCipher}=alphabet(
        row,j,ciphertext.at(-1));
      const letter=plain[absolute],ki=random()%remainingPlain.length;
      const result=special.has(letter)?special.get(letter):
        remainingCipher[(remainingPlain.indexOf(letter)+ki)%remainingPlain.length];
      assert(result>=0&&result<M);
      row.push(result);ciphertext.push(result);keys.push(ki);
    }
    offset+=word.length;
  }
  assert.equal(ciphertext.length,n);
  return {ciphertext,keys};
}
/**
 * @param {number[]} ciphertext Original or planted published runes
 * @param {number[]|null} keys Null means only recover reserved-label markers
 */
function decrypt(ciphertext,keys=null){
  assert.equal(ciphertext.length,n);
  const out=new Array(n).fill(null);
  let offset=0;
  for(const word of words){
    const row=[];
    for(let j=0;j<word.length;j++){
      const abs=offset+j,cipher=ciphertext[abs];
      if(pageStarts.has(abs)){row.push(cipher);continue;}
      const {special,remainingPlain,remainingCipher}=alphabet(
        row,j,ciphertext[abs-1]);
      const literal=[...special].find(([,v])=>v===cipher);
      if(literal)out[abs]=literal[0];
      else if(keys){
        const index=remainingCipher.indexOf(cipher),key=keys[abs];
        assert(index>=0&&key>=0);
        out[abs]=remainingPlain[mod(index-key,remainingPlain.length)];
      }
      row.push(cipher);
    }
    offset+=word.length;
  }
  return out;
}
/** @param {number[]} cipher */
function measurements(cipher){
  const s={repeat:0,lag5:0,T6:0,S5:0,reverseT6:0,lag4:0,lag6equal:0};
  let offset=0;
  for(const word of words){
    for(let j=0;j<word.length;j++){
      const i=offset+j,v=cipher[i];
      if(i>0&&!pageStarts.has(i)&&v===cipher[i-1])s.repeat++;
      if(j>=4&&v===cipher[i-4])s.lag4++;
      if(j>=5){
        if(v===cipher[i-5])s.lag5++;
        if(cipher[i-5]===15&&v===15)s.S5++;
      }
      if(j>=6){
        if(v===mod(24-2*cipher[i-6],M))s.T6++;
        if(cipher[i-6]===mod(24-2*v,M))s.reverseT6++;
        if(v===cipher[i-6])s.lag6equal++;
      }
    }
    offset+=word.length;
  }
  return s;
}
/** Sparse plaintext-marker co-occurrences at separations 1..6. */
function markerCoupling(mark){
  let close=0,adjacent=0,ident=0;
  for(let i=1;i<mark.length;i++){
    if(mark[i]===null)continue;
    if(mark[i-1]!==null){adjacent++;if(mark[i]===mark[i-1])ident++;}
    for(let k=1;k<=6&&i-k>=0;k++)if(mark[i-k]!==null)close++;
  }
  const count=Object.create(null);
  for(const value of mark)if(value!==null)count[corpus.translit[value]]=(count[corpus.translit[value]]||0)+1;
  return {adjacent,ident,within6:close,count};
}
function study(){
  const random=rng(0x15227803),observed=measurements(original);
  assert.deepEqual([observed.repeat,observed.lag5,observed.T6,observed.S5],
    [86,104,80,11]);
  const observedMarkers=markerCoupling(decrypt(original));
  const names=Object.keys(observed),markers=["adjacent","ident","within6"];
  const results=new Map([...names,...markers].map(x=>[x,[]]));
  let plaintextRoundtrips=0,plantedReversals=0,realInversions=0;
  for(let rep=0;rep<TRIALS;rep++){
    const plain=sourcePlain(random),{ciphertext,keys}=encrypt(plain,random);
    const recovered=decrypt(ciphertext,keys);
    const inferred=decrypt(ciphertext);
    for(let i=0;i<n;i++){
      if(pageStarts.has(i)){assert.equal(recovered[i],null);continue;}
      assert.equal(recovered[i],plain[i]);
      plaintextRoundtrips++;
      if(inferred[i]!==null){
        assert.equal(inferred[i],plain[i]);
        plantedReversals++;
      }
    }
    const stats=measurements(ciphertext),coupled=markerCoupling(inferred);
    for(const name of names)results.get(name).push(stats[name]);
    for(const name of markers)results.get(name).push(coupled[name]);
  }
  const summary={};
  for(const [name,arr] of results){
    const value=observed[name]??observedMarkers[name];
    const mean=arr.reduce((s,x)=>s+x,0)/TRIALS;
    const variance=arr.reduce((s,x)=>s+(x-mean)**2,0)/TRIALS;
    const ge=arr.filter(x=>x>=value).length,le=arr.filter(x=>x<=value).length;
    summary[name]={original:value,mean,sd:Math.sqrt(variance),
      simulatedMin:Math.min(...arr),simulatedMax:Math.max(...arr),
      upperTail:(ge+1)/(TRIALS+1),lowerTail:(le+1)/(TRIALS+1)};
  }
  return {
    classification:"fully reversible synthetic mechanism, not LP2 decryption",
    source:"original LP2 words and pages; known Cicada GP source vocabulary",
    sourceRunes:sourceWords.flat().length,
    originalRunes:n,printedWords:words.length,printedPages:pages.length,
    trials:TRIALS,baselineMarking:"EA -> prev, S -> T6, U/E -> lag5",
    roundtripRunes:plaintextRoundtrips,observedMarkers,
    plantedReservedExact:plantedReversals,summary,
    caveat:"Marker labels/target expressions were chosen after inspecting LP2"
  };
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={alphabet,encrypt,decrypt,measurements,markerCoupling,study};
