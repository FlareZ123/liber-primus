'use strict';
/**
 * Fully reversible, fixed-word-length GP29 <-> enumerated 28-choice transition
 * codec with an exact 63-repeat constraint. The complete source-original LP2
 * p0-p55 register is tested against EVERY possible external sidecar value.
 *
 * This architecture is a hypothetical historical BASE29 + enumerative-code
 * consumer; it is not an authenticated Cicada encoding instruction.
 *
 * Windows Node.js 22: node sims/lp2_word63_enumerative_allsidecar_tail_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const source = fs.readFileSync(path.join(root,'lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const grid = JSON.parse(fs.readFileSync(path.join(root,'lp2-grid-256.json'),'utf8'));
const native = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','external','relikd-solved-gp29-native-v1.json'),'utf8'));
const gp = new Map(corpus.runes.map((c,i)=>[c,i]));

/** @param {string} original @returns {number[][]} */
function getWords(original){
  const out=[];let word=[];
  for(const ch of original){
    const rune=gp.get(ch);
    if(rune!==undefined)word.push(rune);
    else if((ch==='-' || ch==='.') && word.length){out.push(word);word=[];}
  }
  if(word.length)out.push(word);
  return out;
}
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0 || k>n)return 0n;
  k=Math.min(k,n-k);let a=1n;
  for(let i=1;i<=k;i++)a=a*BigInt(n-k+i)/BigInt(i);
  return a;
}
/** @param {number[]} symbols @param {bigint} base @returns {bigint} */
function toInteger(symbols,base){
  let a=0n;for(const x of symbols)a=a*base+BigInt(x);
  return a;
}
/** @param {bigint} number @param {bigint} base @param {number} length @returns {number[]} */
function digits(number,base,length){
  const out=new Array(length);
  for(let i=length-1;i>=0;i--){out[i]=Number(number%base);number/=base;}
  assert.equal(number,0n,'integer exceeds reserved digit count');
  return out;
}
/** @param {number[]} slots @returns {bigint} */
function rankCombination(slots){
  let rank=0n;
  for(let i=0;i<slots.length;i++)rank+=choose(slots[i],i+1);
  return rank;
}
/** @param {bigint} rank @param {number} n @param {number} k @returns {number[]} */
function unrankCombination(rank,n,k){
  assert(rank>=0n && rank<choose(n,k));
  const positions=new Array(k);let ceiling=n;
  for(let j=k;j>=1;j--){
    let low=j-1, high=ceiling-1, found=j-1;
    while(low<=high){
      const mid=Math.floor((low+high)/2);
      if(choose(mid,j)<=rank){found=mid;low=mid+1;}
      else high=mid-1;
    }
    positions[j-1]=found;
    rank-=choose(found,j);
    ceiling=found;
  }
  assert.equal(rank,0n);
  return positions;
}
/**
 * Pack each word's first GP29 symbol into the first register; the exact
 * repeated-position subset into a combinadic register; and all nonrepeat
 * successor ranks into BASE28, in their authentic printed sequence.
 * @param {number[][]} words
 */
function pack(words){
  const lengths=words.map(w=>w.length);
  const first=words.map(w=>w[0]);
  const nonrepeat=[], repeated=[];
  let within=0;
  for(const w of words){
    for(let j=1;j<w.length;j++){
      const current=w[j], previous=w[j-1];
      if(current===previous)repeated.push(within);
      else nonrepeat.push(current>previous?current-1:current);
      within++;
    }
  }
  const k=repeated.length;
  const b=choose(within,k), p28=28n**BigInt(within-k);
  const firstRank=toInteger(first,29n);
  const repeatedRank=rankCombination(repeated);
  const nonrepeatRank=toInteger(nonrepeat,28n);
  const r=((firstRank*b+repeatedRank)*p28)+nonrepeatRank;
  const m=(29n**BigInt(words.length))*b*p28;
  assert(r>=0n && r<m);
  return {lengths,within,k,r,m,b,p28,firstRank,repeatedRank,nonrepeatRank};
}
/**
 * Unique inverse of the three-register enumerator, including repeats.
 * @param {bigint} r @param {number[]} lengths @param {number} k
 * @returns {number[][]}
 */
function unpack(r,lengths,k){
  const within=lengths.reduce((a,n)=>a+n-1,0);
  const base28=28n**BigInt(within-k);
  const b=choose(within,k),non=r%base28;
  const intermediate=r/base28;
  const repeated=unrankCombination(intermediate%b,within,k);
  const first=digits(intermediate/b,29n,lengths.length);
  const trailing=digits(non,28n,within-k);
  const out=[];let slot=0, ri=0, ni=0;
  for(let w=0;w<lengths.length;w++){
    const word=[first[w]];let prev=first[w];
    for(let j=1;j<lengths[w];j++){
      let next;
      if(ri<repeated.length && repeated[ri]===slot){next=prev;ri++;}
      else{
        const value=trailing[ni++];
        next=value>=prev?value+1:value;
      }
      assert(next>=0 && next<29);
      word.push(next);prev=next;slot++;
    }
    out.push(word);
  }
  assert.equal(slot,within);assert.equal(ri,k);assert.equal(ni,within-k);
  return out;
}
/** @param {number[]} letters @returns {number} */
function ioc(letters){
  const f=new Array(29).fill(0);
  for(const c of letters)f[c]++;
  return f.reduce((a,n)=>a+n*(n-1),0)/(letters.length*(letters.length-1));
}
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const words=getWords(source.split('%').slice(0,55).join('%'));
const model=pack(words);
assert.equal(original.length,12956);
assert.equal(words.length,2896);
assert.equal(model.within,10060);
assert.equal(model.k,63);
assert.deepEqual(words.flat(),original);
assert.deepEqual(unpack(model.r,model.lengths,model.k).flat(),original);
let across=0;for(let w=1;w<words.length;w++)if(words[w][0]===words[w-1].at(-1))across++;
assert.equal(across,23);
const nativeLetters=native.sections.flatMap(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x)));
assert.equal(nativeLetters.length,2979);
const tailBase=29n**BigInt(words.length);
assert.equal(model.m%tailBase,0n,'sidecar must not change the bottom 2896 base29 digits');
const tail=digits(model.r%tailBase,29n,words.length);
const solvedWindowIoCs=[];
for(let i=0;i+words.length<=nativeLetters.length;i++)
  solvedWindowIoCs.push(ioc(nativeLetters.slice(i,i+words.length)));
const firstLastIoC={min:Math.min(...solvedWindowIoCs),max:Math.max(...solvedWindowIoCs)};
// Exhaust the six mathematically distinct natural full-register orderings.
// Any high-quotient sidecar Q is powerless to change the same low 2896 runes,
// although the fixed suffix differs across these six independently frozen laws.
const fields={
  A:{rank:model.firstRank,base:tailBase},
  B:{rank:model.repeatedRank,base:model.b},
  D:{rank:model.nonrepeatRank,base:model.p28}
};
const sixRegisterOrderTails=['ABD','ADB','BAD','BDA','DAB','DBA'].map(order=>{
  let r=0n;
  for(const field of order)r=r*fields[field].base+fields[field].rank;
  assert(r>=0n && r<model.m);
  const recovered={};
  let residue=r;
  for(let i=order.length-1;i>=0;i--){
    const field=order[i];
    recovered[field]=residue%fields[field].base;
    residue/=fields[field].base;
  }
  assert.equal(residue,0n);
  for(const field of order)assert.equal(recovered[field],fields[field].rank);
  const canonical=((recovered.A*model.b+recovered.B)*model.p28)+recovered.D;
  assert.equal(canonical,model.r);
  assert.deepEqual(unpack(canonical,model.lengths,model.k).flat(),original);
  const fixedTail=digits(r%tailBase,29n,words.length);
  assert.equal((r+model.m*29n)%tailBase,r%tailBase);
  return {order,tailIoC:ioc(fixedTail),
    first30:fixedTail.slice(0,30).map(x=>corpus.translit[x]).join(' ')};
});
assert(sixRegisterOrderTails.every(x=>x.tailIoC<firstLastIoC.min));
// The eight authentic complete printed $ sections each reset the enumerator.
// Literal eight 32-byte source columns are independent proposed sidecars.
const sourceSections=source.split('%').slice(0,55).join('%')
  .split('$').map(getWords).filter(words=>words.length);
assert.equal(sourceSections.length,8);
assert.deepEqual(sourceSections.flat(2),original);
const sectionModels=sourceSections.map((part,index)=>{
  const local=pack(part);
  const flat=part.flat();
  assert.deepEqual(unpack(local.r,local.lengths,local.k).flat(),flat);
  const wordBase=29n**BigInt(part.length);
  assert.equal(local.m%wordBase,0n);
  const totalPlaintextValues=29n**BigInt(flat.length);
  const maxQ=(totalPlaintextValues-1n)/local.m;
  let sourceColumnQ=0n;
  for(let row=0;row<32;row++){
    sourceColumnQ=sourceColumnQ*256n+BigInt(grid.bytes[8*row+index]);
  }
  assert(sourceColumnQ>maxQ,'authentic 256-bit column cannot be literal section quotient');
  const nativeIoCs=[];
  for(let i=0;i+part.length<=nativeLetters.length;i++){
    nativeIoCs.push(ioc(nativeLetters.slice(i,i+part.length)));
  }
  const nativeMin=Math.min(...nativeIoCs),nativeMax=Math.max(...nativeIoCs);
  const fields={
    A:{rank:local.firstRank,base:wordBase},
    B:{rank:local.repeatedRank,base:local.b},
    D:{rank:local.nonrepeatRank,base:local.p28}
  };
  const sixTails=['ABD','ADB','BAD','BDA','DAB','DBA'].map(order=>{
    let r=0n;
    for(const field of order)r=r*fields[field].base+fields[field].rank;
    let recoveredR=r;
    const recovered={};
    for(let j=order.length-1;j>=0;j--){
      const field=order[j];
      recovered[field]=recoveredR%fields[field].base;
      recoveredR/=fields[field].base;
    }
    assert.equal(recoveredR,0n);
    for(const field of order)assert.equal(recovered[field],fields[field].rank);
    const canonical=((recovered.A*local.b+recovered.B)*local.p28)+recovered.D;
    assert.equal(canonical,local.r);
    assert.deepEqual(unpack(canonical,local.lengths,local.k).flat(),flat);
    assert.equal((r+local.m*sourceColumnQ)%wordBase,r%wordBase);
    const fixedTail=digits(r%wordBase,29n,part.length);
    const score=ioc(fixedTail);
    assert(score<nativeMin,'source-section fixed plaintext tail is outside native control');
    return {order,tailIoC:score};
  });
  return {section:index,runes:flat.length,words:part.length,
    withinWordRepeats:local.k,maxQuotientBits:maxQ.toString(2).length,
    literalSource256BitColumnFits:false,solvedNativeIoCRange:{min:nativeMin,max:nativeMax},sixAllKeyTails:sixTails};
});
assert.equal(sectionModels.reduce((a,v)=>a+v.runes,0),original.length);
assert.equal(sectionModels.reduce((a,v)=>a+v.withinWordRepeats,0),63);
const codeSize=29n**BigInt(original.length);
const maxQ=(codeSize-1n)/model.m;
const minSidecarBits=maxQ.toString(2).length;
assert.equal(minSidecarBits,265);
const nativePlant=Array.from({length:original.length},(_,i)=>nativeLetters[i%nativeLetters.length]);
const nativeValue=toInteger(nativePlant,29n);
const nativeQuotient=nativeValue/model.m;
const nativeRemainder=nativeValue%model.m;
const planted=unpack(nativeRemainder,model.lengths,model.k);
assert.equal(pack(planted).r,nativeRemainder);
assert.deepEqual(digits(nativeQuotient*model.m+pack(planted).r,29n,original.length),nativePlant);
assert.equal(grid.bytes.length,256);
const columnResults=[];
for(let column=0;column<8;column++){
  let quotient=0n;
  for(let row=0;row<32;row++)quotient=256n*quotient+BigInt(grid.bytes[8*row+column]);
  assert(quotient<2n**256n);
  const value=quotient*model.m+model.r;
  assert(value<codeSize);
  const plain=digits(value,29n,original.length);
  assert.equal(value/model.m,quotient);
  assert.equal(value%model.m,model.r);
  assert.deepEqual(unpack(value%model.m,model.lengths,model.k).flat(),original);
  assert.deepEqual(plain.slice(-words.length),tail);
  const offset16=corpus.pages.filter(p=>p.page<16).reduce((a,p)=>a+p.indices.length,0);
  const offset40=corpus.pages.filter(p=>p.page<40).reduce((a,p)=>a+p.indices.length,0);
  columnResults.push({
    column, totalIoC:ioc(plain),
    page0IoC:ioc(plain.slice(0,262)),
    page16IoC:ioc(plain.slice(offset16,offset16+corpus.pages[16].indices.length)),
    page40IoC:ioc(plain.slice(offset40,offset40+corpus.pages[40].indices.length)),
    prefix:plain.slice(0,25).map(x=>corpus.translit[x]).join(' ')
  });
}
const summary={
  originalRunes:original.length, originalWords:words.length,
  wordInternalTransitions:model.within,
  wordInternalRepeatedPairs:model.k,
  crossWordRepeatedPairs:across,
  sourceConditionalCodebook:{
    minimumQuotientBits:minSidecarBits,
    eachLiteralEightColumnSidecarBits:256,
    shortfallBits:minSidecarBits-256
  },
  eightAuthenticSectionLocalSourceBounds:sectionModels,
  sixCompleteNaturalRegisterOrderings:sixRegisterOrderTails,
  commonAllSecretPlaintextTail:{
    gpRunes:tail.length, IoC:ioc(tail), 
    solvedNativeControlIoCRange:firstLastIoC,
    first40:tail.slice(0,40).map(x=>corpus.translit[x]).join(' ')
  },
  exactOriginalReencoding:true,
  solvedNativeFullLengthPlantedReencoding:true,
  originalPrintedByteColumnConsumers:columnResults
};
console.log(JSON.stringify(summary,null,2));
console.log('PASS: eight source chapters x six rank orders original fixed tails nonnative, raw column quotients invalid, full original and solved-source positives exact.');
