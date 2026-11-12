"use strict";
/**
 * LP2 original-input keyless gate for a repeated 256-phase GP28 chain-step key.
 * Covers any phase-specific 28-symbol bijection, including all 256-byte additive
 * key schedules, with a reserved EA zero step that does not advance the clock.
 * Source clocks: full book and nine image-visible original chapter boundaries.
 * Run: node sims/lp2_chain256_phase_bijection_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
function read(name){return fs.readFileSync(path.join(ROOT,name),"utf8");}
const db=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const C=db.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const N=C.length;
assert.equal(N,12956);
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(row=>row.length===8));
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
const chapters=[0,729,1874,3603,5506,6527,7960,9640,12648,N];
const contracts={book:[0,N],visual_chapter:chapters};
const pow=[],log=Array(29).fill(-1);
let z=1;
for(let e=0;e<28;e++){
  pow[e]=z;
  log[z]=e;
  z=z*15%29;
}
assert.equal(z,1);
assert.equal(new Set(pow).size,28);
function chainSteps(cipher){
  let prev=0;
  return cipher.map(c=>{
    const d=(c-prev+29)%29;
    prev=c;
    return d===0?28:log[d];
  });
}
const steps=chainSteps(C);
assert.equal(steps.filter(x=>x===28).length,86);
const gp=db.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} text */
function tokenize(text){
  const out=[];
  for(const original of text.match(/[A-Za-z]+/g)||[]){
    const word=original.toUpperCase().replace(/[VKZQ]/g,
      x=>({V:"U",K:"C",Z:"S",Q:"C"})[x]);
    for(let i=0;i<word.length;){
      const matched=gp.find(t=>word.startsWith(t.token,i));
      assert(matched,"Unencodable control word "+word);
      out.push(matched.index);
      i+=matched.token.length;
    }
  }
  return out;
}
/**
 * Exact secret-independent same-phase rune equality statistic.
 * Only non-EA symbols consume one phase. Each reset segment starts phase 0.
 * Any independent bijection per secret phase preserves this statistic.
 * @param {number[]} stream
 * @param {number[]} cuts
 */
function collisions(stream,cuts){
  let match=0,pairs=0,ea=0;
  for(let s=0;s<cuts.length-1;s++){
    const bins=Array.from({length:256},()=>new Int32Array(28));
    let clock=0;
    for(let i=cuts[s];i<cuts[s+1];i++){
      const rune=stream[i];
      if(rune===28){ea++;continue;}
      assert(rune>=0&&rune<28);
      bins[clock%256][rune]++;
      clock++;
    }
    for(const bin of bins){
      let total=0;
      for(const n of bin){match+=n*(n-1)/2;total+=n;}
      pairs+=total*(total-1)/2;
    }
  }
  return {match,pairs,ea,rate:match/pairs};
}
const observed={};
for(const [scope,cuts] of Object.entries(contracts))
  observed[scope]=collisions(steps,cuts);
const sources=[
  {name:"Shakespeare",file:"resources/control/shakespeare_first300k.txt",stride:6000},
  {name:"Gibran",file:"resources/control/gibran_prophet_58585.txt",stride:3000},
  {name:"Emerson",file:"resources/control/emerson_essays_2944.txt",stride:6000}
];
const controls=[],windows=[];
for(const source of sources){
  const native=tokenize(read(source.file));
  let count=0;
  const minima={book:Infinity,visual_chapter:Infinity};
  const maxima={book:0,visual_chapter:0};
  for(let start=0;start+N<=native.length;start+=source.stride){
    const values=native.slice(start,start+N);
    const measured={};
    for(const [scope,cuts] of Object.entries(contracts)){
      const stat=collisions(values,cuts);
      assert(stat.rate>observed[scope].rate,
        "Native control below source rate "+source.name+" "+scope+" "+start);
      measured[scope]=stat;
      minima[scope]=Math.min(minima[scope],stat.rate);
      maxima[scope]=Math.max(maxima[scope],stat.rate);
    }
    windows.push({name:source.name,start,values});
    count++;
  }
  controls.push({name:source.name,nativeRunes:native.length,
    windows:count,minima,maxima});
}
assert.equal(windows.length,104);
const seedStart=0x13a37b3d;
let rngState=seedStart;
function random(){
  rngState^=rngState<<13;
  rngState^=rngState>>>17;
  rngState^=rngState<<5;
  return rngState>>>0;
}
const permutation=Array.from({length:256},()=>{
  const p=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--){
    const j=random()%(i+1);
    [p[i],p[j]]=[p[j],p[i]];
  }
  return p;
});
const inverses=permutation.map(row=>{
  const inv=Array(28);
  row.forEach((e,i)=>inv[e]=i);
  return inv;
});
/** @param {number[]} plain @param {number[]} cuts */
function encrypt(plain,cuts){
  const cipher=Array(plain.length);
  let prev=0,phase=0,segment=1;
  for(let i=0;i<plain.length;i++){
    if(i===cuts[segment]){phase=0;segment++;}
    const p=plain[i];
    if(p!==28){
      prev=(prev+pow[permutation[phase%256][p]])%29;
      phase++;
    }
    cipher[i]=prev;
  }
  return cipher;
}
/** @param {number[]} cipher @param {number[]} cuts */
function decrypt(cipher,cuts){
  const plain=Array(cipher.length);
  let prev=0,phase=0,segment=1;
  for(let i=0;i<cipher.length;i++){
    if(i===cuts[segment]){phase=0;segment++;}
    const d=(cipher[i]-prev+29)%29;
    prev=cipher[i];
    if(d===0){plain[i]=28;continue;}
    plain[i]=inverses[phase%256][log[d]];
    phase++;
  }
  return plain;
}
const positive=[];
for(const [scope,cuts] of Object.entries(contracts)){
  const native=windows[0].values;
  const cipher=encrypt(native,cuts);
  const decoded=decrypt(cipher,cuts);
  assert.deepEqual(decoded,native);
  assert.deepEqual(encrypt(decoded,cuts),cipher);
  assert.deepEqual(collisions(chainSteps(cipher),cuts),collisions(native,cuts));
  positive.push({scope,recoveredRunes:N,
    forwardExact:true,allSecretCollisionsPreserved:true});
}
// Direct, source-order 256-byte table as an additive log(15) keystream.
// This is a restricted consumer covered by the all-secret theorem above.
const direct=[];
for(const sign of [-1,1]){
  const out=[];
  let keyClock=0;
  for(const e of steps){
    if(e===28){out.push(28);continue;}
    const key=bytes[keyClock%256]%28;
    out.push((e+sign*key+56)%28);
    keyClock++;
  }
  direct.push({sign,rate:collisions(out,[0,N]).rate,
    wholeBookIOC:(()=>{
      const counts=Array(29).fill(0);
      out.forEach(x=>counts[x]++);
      return counts.reduce((s,n)=>s+n*(n-1),0)/(N*(N-1));
    })()});
}

/** Independent solved-p56 phi(prime) transfer to conditional GP28 chain exponents. */
function firstPrimes(n){
  const out=[];
  for(let x=2;out.length<n;x++){
    let prime=true;
    for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}
    if(prime)out.push(x);
  }
  return out;
}
const primeSteps=firstPrimes(N);
function decodePrimePhi(cipher,cuts,skipEA,sign){
  let previous=0,clock=0,segment=1;
  return cipher.map((c,i)=>{
    if(i===cuts[segment]){clock=0;segment++;}
    const delta=(c-previous+29)%29;
    previous=c;
    if(delta===0){if(!skipEA)clock++;return 28;}
    return (log[delta]+sign*(primeSteps[clock++]-1)+28*100000)%28;
  });
}
function encodePrimePhi(plain,cuts,skipEA,sign){
  let previous=0,clock=0,segment=1;
  return plain.map((p,i)=>{
    if(i===cuts[segment]){clock=0;segment++;}
    if(p===28){if(!skipEA)clock++;return previous;}
    const e=(p-sign*(primeSteps[clock++]-1)+28*100000)%28;
    previous=(previous+pow[e])%29;
    return previous;
  });
}
const primePhiOutputs=[];
for(const [scope,cuts] of Object.entries(contracts))
  for(const skipEA of [true,false])
    for(const sign of [-1,1]){
      const out=decodePrimePhi(C,cuts,skipEA,sign);
      const counts=Array(29).fill(0);
      out.forEach(x=>counts[x]++);
      primePhiOutputs.push({scope,skipEA,sign,
        IOC:counts.reduce((a,n)=>a+n*(n-1),0)/(N*(N-1)),
        head:out.slice(0,32).map(x=>db.translit[x]).join("")});
    }
assert.equal(primePhiOutputs.length,8);
assert(Math.abs(Math.min(...primePhiOutputs.map(x=>x.IOC))-
  0.0352698186147718)<1e-10);
assert(Math.abs(Math.max(...primePhiOutputs.map(x=>x.IOC))-
  0.03530871164571023)<1e-10);
const phiPlant=encodePrimePhi(windows[0].values,chapters,true,-1);
assert.deepEqual(decodePrimePhi(phiPlant,chapters,true,-1),windows[0].values);

console.log(JSON.stringify({
  hypothesis:"Fixed 256-phase secret GP28 bijections on nonzero chain differences",
  sourceGP29CiphertextRunes:N,
  sourceEARepeatEvents:86,
  fixedPeriod:256,
  phaseClock:"Nonzero steps only, zero steps emitted as EA without key consumption",
  original:observed,controls,nativeWindows:windows.length,
  directBase60GridConsumer:direct,
  authenticP56PrimePhiTransfer:primePhiOutputs,
  phiPrimeSyntheticRecoveredRunes:N,
  positive,
  conclusion:"Both book and nine-original-chapter keyless invariants are below every one of the 104 native-GP English controls. No direct native-GP inverse or authentic key is identified; evolving state, other plaintext registers and alternative zero-symbol contracts remain open."
},null,2));
