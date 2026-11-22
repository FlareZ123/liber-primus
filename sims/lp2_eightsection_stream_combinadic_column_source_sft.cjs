'use strict';
/**
 * Original eight-$-section GP29 streaming 28-rank combinadic inverse, with
 * exactly observed repeated sites included in the enumerable ciphertext state.
 * Different from word-initial-register rank: only one GP29 seed per section.
 *
 * Source column to quotient maps the literal row-major 32x8 p50 byte field
 * by Q = columnInteger % (maxLegalOriginalQ + 1). This reduction is a frozen
 * hypothesis, not an authenticated Cicada instruction. Results are not a solve.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_eightsection_stream_combinadic_column_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname,'..','resources','liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base,'lp2-corpus.json'),'utf8'));
const transcription = fs.readFileSync(path.join(base,'lp2-transcription.txt'),'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(base,'lp2-grid-256.json'),'utf8'));
const solved = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','external','relikd-solved-gp29-native-v1.json'),'utf8'));
const ord = new Map(corpus.runes.map((s,i)=>[s,i]));
const fullSource = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const sectionSource = transcription.replace(/\r/g,'').split('%').slice(0,55).join('%').split('$');
const original = sectionSource.map(s=>[...s].filter(x=>ord.has(x)).map(x=>ord.get(x))).filter(x=>x.length);
assert.equal(original.length,8);
assert.deepEqual(original.flat(),fullSource);
assert.equal(fullSource.length,12956);
assert.equal(grid.bytes.length,256);
const nativeSource = solved.sections.flatMap(s=>[...s.source_text].filter(x=>ord.has(x)).map(x=>ord.get(x)));
assert.equal(nativeSource.length,2979);

/**
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n,k){
  if(k<0||k>n)return 0n;
  k=Math.min(k,n-k);
  let p=1n;
  for(let j=1;j<=k;j++)p=p*BigInt(n-k+j)/BigInt(j);
  return p;
}
/** @param {number[]} digits @param {bigint} base */
function rankDigits(digits,base){
  let value=0n;
  for(const digit of digits)value=value*base+BigInt(digit);
  return value;
}
/** @param {bigint} value @param {bigint} base @param {number} length */
function decodeDigits(value,base,length){
  const result=new Array(length);
  for(let i=length-1;i>=0;i--){result[i]=Number(value%base);value/=base;}
  assert.equal(value,0n,'register overflow');
  return result;
}
/** @param {number[]} positions */
function rankSubset(positions){
  return positions.reduce((a,site,j)=>a+choose(site,j+1),0n);
}
/** @param {bigint} value @param {number} n @param {number} k */
function unrankSubset(value,n,k){
  assert(value>=0n&&value<choose(n,k));
  const sites=new Array(k);let ceiling=n;
  for(let j=k;j>=1;j--){
    let low=j-1,high=ceiling-1,found=low;
    while(low<=high){
      const mid=Math.floor((low+high)/2);
      if(choose(mid,j)<=value){found=mid;low=mid+1;}
      else high=mid-1;
    }
    sites[j-1]=found;
    value-=choose(found,j);
    ceiling=found;
  }
  assert.equal(value,0n);
  return sites;
}
/** @param {number[]} tape */
function pack(tape){
  const n=tape.length;
  assert(n>=2);
  const repeats=[],other=[];
  for(let i=1;i<n;i++){
    const previous=tape[i-1],current=tape[i];
    if(previous===current)repeats.push(i-1);
    else other.push(current>previous?current-1:current);
  }
  const k=repeats.length,b=choose(n-1,k),pow28=28n**BigInt(other.length);
  const r=((BigInt(tape[0])*b+rankSubset(repeats))*pow28)+rankDigits(other,28n);
  const m=29n*b*pow28;
  assert(r>=0n&&r<m);
  return {n,k,r,m,b,pow28,initial:tape[0],repeats};
}
/**
 * Complete inverse of the continuous section encoder.
 * @param {bigint} rank
 * @param {number} n
 * @param {number} k
 * @returns {number[]}
 */
function unpack(rank,n,k){
  const pow28=28n**BigInt(n-1-k),b=choose(n-1,k);
  const trailing=decodeDigits(rank%pow28,28n,n-1-k),middle=rank/pow28;
  const repeated=unrankSubset(middle%b,n-1,k);
  const first=Number(middle/b);
  assert(first>=0&&first<29);
  const result=[first];let r=0,j=0;
  for(let p=0;p<n-1;p++){
    const previous=result.at(-1);
    let current;
    if(r<k&&repeated[r]===p){current=previous;r++;}
    else{
      const nonrepeat=trailing[j++];
      current=nonrepeat>=previous?nonrepeat+1:nonrepeat;
    }
    result.push(current);
  }
  assert.equal(result.length,n);
  assert.equal(j,n-1-k);
  assert.equal(r,k);
  return result;
}
/** @param {number[]} tape */
function ioc(tape){
  const freq=new Array(29).fill(0);
  for(const c of tape)freq[c]++;
  return freq.reduce((a,n)=>a+n*(n-1),0)/(tape.length*(tape.length-1));
}
/** @param {bigint} n */
function v29(n){
  let count=0;
  while(n%29n===0n){count++;n/=29n;}
  return count;
}
let sumK=0;
const findings=original.map((cipher,section)=>{
  const model=pack(cipher);
  sumK+=model.k;
  assert.deepEqual(unpack(model.r,model.n,model.k),cipher);
  const fullBase=29n**BigInt(model.n);
  const maxQ=(fullBase-1n-model.r)/model.m;
  assert(maxQ>=0n);
  let sourceColumn=0n;
  for(let row=0;row<32;row++)sourceColumn=sourceColumn*256n+BigInt(grid.bytes[8*row+section]);
  assert(sourceColumn>maxQ,'authentic source column is not a literal 256bit quotient');
  const q=sourceColumn%(maxQ+1n);
  const plaintext=q*model.m+model.r;
  assert(plaintext<fullBase);
  const direct=decodeDigits(plaintext,29n,model.n);
  assert.equal(rankDigits(direct,29n),plaintext);
  assert.equal(plaintext/model.m,q);
  assert.equal(plaintext%model.m,model.r);
  assert.deepEqual(unpack(plaintext%model.m,model.n,model.k),cipher);
  const pad29=v29(model.m);
  const fixedTail=decodeDigits(model.r%(29n**BigInt(pad29)),29n,pad29);
  assert.deepEqual(direct.slice(-pad29),fixedTail);
  // Every legal possible Q preserves these original-source final GP runes.
  assert.equal((model.r+model.m*maxQ)%(29n**BigInt(pad29)),model.r%(29n**BigInt(pad29)));
  // A true solved-native original-length planted positive has a complete
  // source-different but exact 29->28 / 28->29 forward/decoder transcript.
  const nativePlain=Array.from({length:model.n},(_,i)=>nativeSource[i%nativeSource.length]);
  const srcNum=rankDigits(nativePlain,29n),nativeQ=srcNum/model.m,nativeR=srcNum%model.m;
  const plantedCipher=unpack(nativeR,model.n,model.k);
  const replay=pack(plantedCipher);
  assert.equal(replay.r,nativeR);
  assert.equal(replay.m,model.m);
  assert.deepEqual(decodeDigits(nativeQ*replay.m+replay.r,29n,model.n),nativePlain);
  return {
    section,runes:model.n,observedRepeatPositions:model.k,quotientBits:maxQ.toString(2).length,
    originalSourceColumnDirectlyFits:false,
    originalByteColumnReducedQuotient:q.toString(),fixedFinalPlaintext:fixedTail.map(x=>corpus.translit[x]).join(' '),
    decodedIoC:ioc(direct),nativeSourceIoC:ioc(nativePlain),
    actualPlaintextFirst30:direct.slice(0,30).map(x=>corpus.translit[x]).join(' '),
    plantedSolvedSourceFullInverse:true
  };
});
assert.equal(sumK,86);
assert(findings.every(s=>s.decodedIoC<0.04&&s.nativeSourceIoC>0.05));
/**
 * Exhaustive, exact first-section full-domain quotient experiment.
 * Original first three LP2 pages (729 rune section0) have only 6,585,649
 * legal high quotient Q values. No key guess, table guess, or source text fit
 * is required. Retain genuine solved-GP29 original-length windows as controls.
 */
function exhaustFirstSectionQuotients(){
  const originalP0=original[0];
  const model=pack(originalP0);
  assert.equal(model.n,729);
  assert.equal(model.k,4);
  const maxLegalQ=(29n**BigInt(model.n)-1n-model.r)/model.m;
  const count=Number(maxLegalQ);
  assert(Number.isSafeInteger(count));
  assert.equal(count,6585649,'original-section exact quotient count changed');
  const digitsM=decodeDigits(model.m,29n,model.n).reverse();
  const candidate=Uint8Array.from(decodeDigits(model.r,29n,model.n).reverse());
  const counts=new Int32Array(29);
  for(const v of candidate)counts[v]++;
  const denominator=model.n*(model.n-1);
  const numerator=()=>counts.reduce((sum,n)=>sum+n*(n-1),0);
  let currentNum=numerator(), maxNum=-1,bestQ=-1;
  let minNum=denominator+1,minQ=-1,aboveNative=0,observed=0;
  const nativeNumerator=seq=>{
    const counts=new Int32Array(29);
    for(const v of seq)counts[v]++;
    return counts.reduce((sum,n)=>sum+n*(n-1),0);
  };
  const controlNumerators=[];
  for(let i=0;i+model.n<=nativeSource.length;i++){
    controlNumerators.push(nativeNumerator(nativeSource.slice(i,i+model.n)));
  }
  const controlMin=Math.min(...controlNumerators);
  const controlMax=Math.max(...controlNumerators);
  assert(controlNumerators.length===nativeSource.length-model.n+1);
  const controls=new Set([0,1,2,29,300,100000,6500000,count]);
  for(let q=0;q<=count;q++){
    if(currentNum>maxNum){maxNum=currentNum;bestQ=q;}
    if(currentNum<minNum){minNum=currentNum;minQ=q;}
    if(currentNum>=controlMin)aboveNative++;
    if(controls.has(q)){
      const exact=decodeDigits(model.r+BigInt(q)*model.m,29n,model.n).reverse();
      assert.deepEqual([...candidate],exact,'base29 streaming recurrence has drift');
      assert.equal(currentNum,nativeNumerator(exact));
      observed++;
    }
    if(q===count)break;
    let carry=0;
    for(let j=0;j<model.n;j++){
      const old=candidate[j];
      let next=old+digitsM[j]+carry;
      if(next>=29){next-=29;carry=1;}
      else carry=0;
      if(next!==old){
        const oldBefore=counts[old];
        currentNum-=2*(oldBefore-1);
        counts[old]=oldBefore-1;
        const nextBefore=counts[next];
        currentNum+=2*nextBefore;
        counts[next]=nextBefore+1;
        candidate[j]=next;
      }
    }
    assert.equal(carry,0,'enumerator quotient wrapped beyond base29 plaintext range');
  }
  assert.equal(observed,controls.size);
  assert.equal(currentNum,numerator());
  const best=decodeDigits(model.r+BigInt(bestQ)*model.m,29n,model.n);
  const lower=decodeDigits(model.r+BigInt(minQ)*model.m,29n,model.n);
  assert.equal(nativeNumerator(best),maxNum);
  assert.equal(nativeNumerator(lower),minNum);
  const originalSourceColumn=(()=>{
    let col=0n;for(let row=0;row<32;row++)col=col*256n+BigInt(grid.bytes[8*row]);
    return col%(maxLegalQ+1n);
  })();
  return {
    qCount:count+1,absoluteMaxLegalQ:count,allLegalQuotientsTested:true,
    originalSourceSectionLength:model.n,originalSourceRepeatCount:model.k,
    originalLiteralTableColumnReducedQ:String(originalSourceColumn),
    solvedNative729RuneWindowCount:controlNumerators.length,
    nativeWindowNumerators:{min:controlMin,max:controlMax},
    originalAllQNumerators:{min:minNum,max:maxNum},
    originalAllQIoC:{min:minNum/denominator,max:maxNum/denominator},
    nativeWindowIoC:{min:controlMin/denominator,max:controlMax/denominator},
    candidatesMeetingNativeMin:aboveNative,
    maximumIoCOriginalQ:bestQ,
    minimumIoCOriginalQ:minQ,
    maxCandidateFirst60:best.slice(0,60).map(v=>corpus.translit[v]).join(' '),
    maxCandidateLast30:best.slice(-30).map(v=>corpus.translit[v]).join(' ')
  };
}
const exhaustiveFirstSection=exhaustFirstSectionQuotients();
console.log(JSON.stringify({exhaustiveFirstSection},null,2));
console.log(JSON.stringify({method:'8 source sections continuous one-seed no-repeat-rank + exact combinadic doublets',allOriginalRunes:fullSource.length,allOriginalDoublets:sumK,authenticColumnReading:'row-major: 8 columns x 32 bytes',quotientMap:'one 32-byte column modulo (maxQForSourceR+1)',originalReranking:true,originalNativeGPPlaintext:false,findings},null,2));
console.log('PASS: original continuous eight-section exact inverse and all 6,585,650 first-chapter Q source candidates exhaustively checked against solved-native GP with integer frequency replay.');
