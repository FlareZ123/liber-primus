'use strict';

/**
 * Original-cipher H2 cyclic/Latin singleton keyset exclusion.
 *
 * Model: C[i]=(tau(P[i])+r[j]) mod29, with one unknown permutation tau
 * and r[j]=phi(prime[j]) mod29; when a proposed ciphertext repeats
 * C[i-1], the encryptor may reject it (q=.81) and advance the same
 * plaintext rune to the next prime row.
 *
 * Every hidden pointer path and every 2- or 3-value keyset for one-rune
 * English words is jointly tested. No true secret alphabet, plaintext,
 * or skip positions are available to the decoder. Source-original data
 * is read, unchanged, from the repository.
 *
 * The gate is conditional on authentic word boundaries, GP-native English
 * singleton words {A,I,O}, a book-global prime clock, and this exact
 * cyclic cipher architecture. It is not a generic attack on LP2.
 *
 * Node.js 22, CommonJS, self-contained read-only test.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt');
const source=read('resources/control/gibran_prophet_58585.txt');
const N=29, LENGTH=12956, D=850;
const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(C.length,LENGTH);
const mp=new Map(gp.runes.map((r,i)=>[r,i]));
const words=[];
let pending=[],offset=0;
for(const glyph of transcription.split('%').slice(0,55).join('%')){
  if(mp.has(glyph)){
    assert.equal(mp.get(glyph),C[offset]);
    pending.push(offset++);
  }else if(glyph==='/'||glyph==='%'||/\s/u.test(glyph)){
    // Physical line/page breaks do not terminate a printed word.
  }else if(pending.length){
    words.push(pending);pending=[];
  }
}
if(pending.length)words.push(pending);
const singles=words.filter(w=>w.length===1).map(w=>w[0]);
assert.deepEqual([offset,words.length,singles.length],[LENGTH,2896,83]);
assert.deepEqual(singles.slice(0,10),
  [176,244,350,530,644,792,967,1025,1062,1250]);
assert.deepEqual([gp.translit[24],gp.translit[10],gp.translit[3]],
  ['A','I','O']);

const composite=new Uint8Array(650001),rows=[];
for(let p=2;p<composite.length&&rows.length<45000;p++){
  if(composite[p])continue;
  rows.push((p-1)%N);
  if(p*p<composite.length)
    for(let j=p*p;j<composite.length;j+=p)composite[j]=1;
}
assert.equal(rows.length,45000);
let run=1,largestRun=1;
for(let i=1;i<LENGTH+D+3;i++){
  run=rows[i]===rows[i-1]?run+1:1;
  largestRun=Math.max(largestRun,run);
}
assert.equal(largestRun,2);

/**
 * Exactly construct the finite universe of 2- or 3-element keysets.
 * Each of the 29 possible GP base-symbol values has a bitset of all
 * keysets containing it. A DP state is a *set of keysets*, not a guessed
 * dictionary word or a privileged secret tableau.
 * @param {2|3} n
 */
function candidates(n){
  const sets=[];
  for(let a=0;a<N;a++)
    for(let b=a+1;b<N;b++)
      if(n===2)sets.push([a,b]);
      else for(let c=b+1;c<N;c++)sets.push([a,b,c]);
  const width=Math.ceil(sets.length/32);
  const masks=Array.from({length:N},()=>new Uint32Array(width));
  const all=new Uint32Array(width);
  for(let q=0;q<sets.length;q++){
    const w=q>>>5,bit=1<<(q&31);
    all[w]|=bit;
    for(const v of sets[q])masks[v][w]|=bit;
  }
  assert.equal(sets.length,n===2?406:3654);
  return {sets,width,masks,all};
}
const sets2=candidates(2),sets3=candidates(3);

/**
 * All paths through the unknown prime pointer are represented exactly.
 * At i, drift d means accepted key row j=i+d. A skipped proposal at row
 * i+d_old+k must map the SAME plaintext base to previous ciphertext.
 * Thus all rejected row residues equal rows[i+d_new]+C[i-1]-C[i] (mod29).
 * The unknown permutation cancels; no corpus words are read by this DP.
 *
 * Since every run of identical prime residues in the used source stream
 * is <=2, three or more rejected proposals at a single rune are
 * mathematically impossible, even if the rejection coin permits them.
 *
 * @param {number[]} ciphertext
 * @param {2|3} n
 * @param {{stop?:number,truth?:{pointer:number[],baseSet:number[]}}} opts
 */
function gate(ciphertext,n,opts={}){
  const {sets,width,masks,all}=n===2?sets2:sets3;
  const total=(D+1)*width;
  let current=new Uint32Array(total),next=new Uint32Array(total);
  current.set(all);
  let highest=0,at=0,alive=true;
  const stages=[];
  const stop=Math.min(opts.stop??ciphertext.length,ciphertext.length);
  const expectedSet=opts.truth?
    sets.findIndex(s=>s.length===opts.truth.baseSet.length
      && s.every((x,i)=>x===opts.truth.baseSet[i])):-1;
  if(opts.truth)assert.ok(expectedSet>=0);
  for(let i=1;i<stop;i++){
    next.fill(0);
    const difference=(ciphertext[i-1]-ciphertext[i]+N)%N;
    let newHighest=0;
    for(let d=0;d<=highest;d++){
      const off=d*width;
      let hasBits=0;
      for(let w=0;w<width;w++){
        const v=current[off+w];
        hasBits|=v;
        next[off+w]|=v; // zero skips always remains possible.
      }
      if(!hasBits)continue;
      for(let k=1;k<=2&&d+k<=D;k++){
        const target=(rows[i+d+k]+difference)%N;
        let valid=true;
        for(let u=0;u<k;u++)
          if(rows[i+d+u]!==target){valid=false;break;}
        if(!valid)continue;
        const dest=(d+k)*width;
        for(let w=0;w<width;w++)next[dest+w]|=current[off+w];
        newHighest=Math.max(newHighest,d+k);
      }
    }
    highest=Math.max(highest,newHighest);
    if(at<singles.length&&singles[at]===i){
      for(let d=0;d<=highest;d++){
        const label=(ciphertext[i]-rows[i+d]+N)%N;
        const base=masks[label],off=d*width;
        for(let w=0;w<width;w++)next[off+w]&=base[w];
      }
      const union=new Uint32Array(width);
      for(let d=0;d<=highest;d++)
        for(let w=0;w<width;w++)union[w]|=next[d*width+w];
      let num=0;
      for(const v of union){
        let x=v;
        while(x){x&=x-1;num++;}
      }
      stages.push({ordinal:at+1,offset:i,survivingKeysets:num});
      if(opts.truth){
        const d=opts.truth.pointer[i]-i;
        const wi=expectedSet>>>5,bit=1<<(expectedSet&31);
        assert.ok(d>=0&&d<=D&&((next[d*width+wi]&bit)!==0),
          'Synthetic true keyset and hidden pointer must survive');
      }
      if(num===0){alive=false;break;}
      at++;
    }
    [next,current]=[current,next];
  }
  if(!alive)return {possible:false,firstContradiction:stages.at(-1),
    stages:stages.slice(0,12)};
  const union=new Uint32Array(width);
  let minimum=D+1,maximum=-1;
  for(let d=0;d<=highest;d++){
    let hasBits=0;
    for(let w=0;w<width;w++){
      const bits=current[d*width+w];
      union[w]|=bits;hasBits|=bits;
    }
    if(hasBits){minimum=Math.min(minimum,d);maximum=d;}
  }
  const survivors=sets.filter((_,q)=>
    (union[q>>>5]&(1<<(q&31)))!==0);
  return {possible:survivors.length>0,
    singletonSitesProcessed:at,finalKeysets:survivors.length,
    singletonBaseSets:survivors.slice(0,8),
    finalDriftRange:[minimum,maximum],
    lastStages:stages.slice(-6)};
}

/** @param {number} initial */
function random(initial){
  let x=initial>>>0;
  const float=()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return(x>>>0)/4294967296;
  };
  return {float,int:n=>Math.floor(float()*n)};
}
/** @param {{int:(n:number)=>number}} r */
function permutation(r){
  const p=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--){
    const j=r.int(i+1);[p[i],p[j]]=[p[j],p[i]];
  }
  return p;
}
const translit=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function toGP(word){
  const w=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const result=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ING',i)){result.push(21);i+=3;}
    else if(w.startsWith('IO',i)){result.push(27);i+=2;}
    else{
      const t=translit.find(t=>w.startsWith(t.s,i));
      assert.ok(t);
      result.push(t.i);i+=t.s.length;
    }
  }
  return result;
}
const byLength=Array.from({length:15},()=>[]);
for(const token of source.match(/[A-Za-z]+/g)||[]){
  const runes=toGP(token);
  if(runes.length<byLength.length)byLength[runes.length].push(runes);
}
assert.ok(words.every(w=>w.length>0&&w.length<15
  &&byLength[w.length].length>0));

/**
 * Genuine independent original-word-length-shaped English plant.
 * The 83 single-rune words are selected from GP-native A/I or A/I/O.
 * The true table and pointer are sealed from gate(), with truth used
 * solely for an after-transition membership assertion.
 * @param {number} seed
 * @param {2|3} keysetSize
 */
function plant(seed,keysetSize){
  const r=random(seed),allowed=keysetSize===2?[24,10]:[24,10,3];
  const plain=[];
  for(const word of words){
    const chosen=word.length===1
      ?[allowed[r.int(allowed.length)]]
      :byLength[word.length][r.int(byLength[word.length].length)];
    plain.push(...chosen);
  }
  assert.equal(plain.length,LENGTH);
  const tau=permutation(r),cipher=[],pointer=[];
  let p=0,previous=-1,skippedTotal=0,maxLocal=0;
  for(const rune of plain){
    let c=(tau[rune]+rows[p])%N,skipped=0;
    while(c===previous&&r.float()<.81){
      p++;skipped++;skippedTotal++;
      c=(tau[rune]+rows[p])%N;
    }
    assert.ok(skipped<=2);
    maxLocal=Math.max(maxLocal,skipped);
    cipher.push(c);pointer.push(p);
    previous=c;p++;
  }
  const baseSet=allowed.map(x=>tau[x]).sort((a,b)=>a-b);
  return {cipher,pointer,baseSet,skippedTotal,maxLocal};
}
const original2=gate(C,2),original3=gate(C,3);
assert.equal(original2.possible,false);
assert.deepEqual(original2.firstContradiction,
  {ordinal:7,offset:967,survivingKeysets:0});
assert.equal(original3.possible,false);
assert.deepEqual(original3.firstContradiction,
  {ordinal:10,offset:1250,survivingKeysets:0});
const positive=[];
for(let trial=0;trial<3;trial++){
  const p=plant((0x3301abcd+trial*1013904223)>>>0,2);
  const decoded=gate(p.cipher,2,{truth:p});
  assert.ok(decoded.possible);
  assert.ok(decoded.singletonBaseSets.some(s=>
    s.every((v,i)=>v===p.baseSet[i])));
  positive.push({seed:trial,keysetSize:2,skips:p.skippedTotal,
    maxLocalSkip:p.maxLocal,finalSets:decoded.finalKeysets,
    recoveredTrueSet:true,finalDrift:decoded.finalDriftRange});
}
const triplePlant=plant(0x3301cafe,3);
const tripleGate=gate(triplePlant.cipher,3,{
  stop:1501,truth:triplePlant
});
assert.ok(tripleGate.possible);
positive.push({seed:'0x3301cafe',keysetSize:3,
  testedPrefixRunes:1501,skipsInFullPlant:triplePlant.skippedTotal,
  prefixSets:tripleGate.finalKeysets,recoveredTrueSet:true});
console.log(JSON.stringify({
  status:'PASS; conditional original cyclic-H2 keyset exclusion',
  authenticCipherRunes:C.length,originalPrintedWords:words.length,
  actualSingletonWords:singles.length,primeResidueMaxRun:largestRun,
  originalTwoBase:original2,originalThreeBase:original3,
  positive,limitations:'Requires cyclic/Latin one-permutation H2, book-global prime clock, genuine English one-rune A/I/O words and preserved printed word boundaries. Does not exclude independent 29-row tableaux, reset clocks, other plaintext languages or source-supplied layers.'
},null,2));
