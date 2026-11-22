"use strict";
/**
 * Exact original LP2 F29/28-unit inverse for low-dimensional ciphertext feedback.
 * Model at page-local i>=6:
 *   delta=C[i]-C[i-1] mod29.
 *   if delta==0, P[i]=EA(index28).
 *   otherwise P[i]=(log_15(delta)-a*f(C_history)-b*g(C_history)-d) mod28.
 * The corresponding forward function is deterministic and reversible.
 * No LP2 key or plaintext is claimed. Original first 27 rune-bearing pages
 * select keys; remaining 28 are held out. Source GP-Shakespeare is disjoint
 * from the positive-control plaintext. Run: node sims/field_unit_feedback_inverse.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const ROOT=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pageRecords=gp.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pageRecords.length,55);
assert.equal(pageRecords.reduce((a,p)=>a+p.indices.length,0),12956);
const pages=pageRecords.map(p=>p.indices);
const M=28,MOD=29;
const m28=x=>(x%M+M)%M,m29=x=>(x%MOD+MOD)%MOD;
const exp=new Uint8Array(M),log=new Int8Array(MOD).fill(-1);
for(let k=0,x=1;k<28;k++,x=x*15%29){exp[k]=x;log[x]=k;}
assert.equal(new Set(exp).size,28);
const dictionary=new Map(gp.translit.map((s,i)=>[s,i]));
const pairs=[
  ["prev","prev2"],["prev","prev5"],["prev","prev6"],
  ["prev2","prev5"],["prev5","prev6"],["prev","delta"],
  ["prev","index"],["prev2","index"],["prev5","index"],
  ["prev6","index"],["delta","index"]
];

/** @param {string} text @returns {number[]} */
function encode(text){
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const d=dictionary.get(word.slice(i,i+2));
      if(d!==undefined){out.push(d);i+=2;}
      else{const v=dictionary.get(word[i]);if(v!==undefined)out.push(v);i++;}
    }
  }
  return out;
}
const source=encode(read("resources/control/shakespeare_first300k.txt"));
assert.equal(source.length,218800);
const counts=new Float64Array(28).fill(.5);
for(const v of source.slice(0,100000))if(v<28)counts[v]++;
const count=counts.reduce((a,b)=>a+b,0);
const prior=Array.from(counts,v=>Math.log(28*v/count));
const expected=prior.reduce((sum,v,i)=>sum+v*counts[i]/count,0);

/**
 * @param {number[][]} input
 * @param {"forward"|"reverse"} direction
 * @returns {Array<{x:number,f:Record<string,number>}>[]}
 */
function observations(input,direction){
  const train=[],test=[];
  for(let p=0;p<input.length;p++){
    const a=direction==="forward"?input[p]:input[p].toReversed();
    for(let i=6;i<a.length;i++){
      const step=m29(a[i]-a[i-1]),x=log[step];
      if(x<0)continue;
      const u=a[i-1],v=a[i-2],w=a[i-5],z=a[i-6];
      (p<27?train:test).push({x,f:{
        prev:u%28,prev2:v%28,prev5:w%28,prev6:z%28,
        delta:m28(u-v),index:i%28
      }});
    }
  }
  return [train,test];
}

/** @param {Int32Array} hist
 *  @param {number} a @param {number} b @param {number} d */
function score(hist,a,b,d){
  let sum=0;
  for(let k=0;k<hist.length;k++){
    const ct=hist[k];
    if(ct){
      const u=Math.floor(k/784),v=Math.floor(k/28)%28,x=k%28;
      sum+=ct*prior[m28(x-a*u-b*v-d)];
    }
  }
  return sum;
}

/**
 * Select all 28^3 feedback coefficients on original training samples.
 * @param {Array<{x:number,f:Record<string,number>}>} train
 * @param {Array<{x:number,f:Record<string,number>}>} held
 */
function scan(train,held){
  const out=[];
  for(const [first,second] of pairs){
    const tr=new Int32Array(28**3),te=new Int32Array(28**3);
    const ix=r=>(r.f[first]*28+r.f[second])*28+r.x;
    for(const r of train)tr[ix(r)]++;
    for(const r of held)te[ix(r)]++;
    const nonempty=[];
    for(let i=0;i<tr.length;i++)if(tr[i])
      nonempty.push([Math.floor(i/784),Math.floor(i/28)%28,i%28,tr[i]]);
    let best={trainSum:-Infinity,a:0,b:0,d:0};
    for(let a=0;a<28;a++)for(let b=0;b<28;b++){
      const residual=new Float64Array(28);
      for(const [u,v,x,ct] of nonempty)
        residual[m28(x-a*u-b*v)]+=ct;
      for(let d=0;d<28;d++){
        let s=0;
        for(let x=0;x<28;x++)s+=residual[x]*prior[m28(x-d)];
        if(s>best.trainSum)best={trainSum:s,a,b,d};
      }
    }
    const frozenTest=score(te,best.a,best.b,best.d);
    out.push({features:[first,second],a:best.a,b:best.b,d:best.d,
      trainExcessNatsPerRune:best.trainSum/train.length,
      heldExcessNatsPerRune:frozenTest/held.length,
      trainSymbols:train.length,heldSymbols:held.length});
  }
  return out.sort((a,b)=>b.trainExcessNatsPerRune-a.trainExcessNatsPerRune);
}

/**
 * Encrypt a disjoint authentic-GP control using known withheld coefficients;
 * first six runes of each physical page are separate public IV symbols.
 * @param {number[][]} lengths
 */
function plant(lengths){
  let start=source.length-12956;
  const plain=lengths.map(a=>source.slice(start,start+=a.length));
  start=0;
  const cipher=[];
  for(let j=0;j<plain.length;j++){
    const p=plain[j],c=[];
    for(let i=0;i<p.length;i++){
      if(i<6){c.push((j*13+i*7+3)%29);continue;}
      const k=m28(7*(c[i-1]%28)+11*(c[i-6]%28)+5);
      c.push(p[i]===28?c[i-1]:m29(c[i-1]+exp[m28(p[i]+k)]));
    }
    for(let i=6;i<p.length;i++){
      const d=m29(c[i]-c[i-1]);
      const guess=d===0?28:m28(log[d]-
        7*(c[i-1]%28)-11*(c[i-6]%28)-5);
      assert.equal(guess,p[i],"Exact synthetic roundtrip");
    }
    cipher.push(c);
  }
  return cipher;
}
const original=Object.fromEntries(["forward","reverse"].map(d=>{
  const [train,held]=observations(pages,d);
  return [d,scan(train,held)];
}));
const [pt,ph]=observations(plant(pages),"forward");
const positive=scan(pt,ph).find(r=>r.features[0]==="prev"&&r.features[1]==="prev6");
assert.deepEqual([positive.a,positive.b,positive.d],[7,11,5]);
assert(positive.heldExcessNatsPerRune>0.2);
assert(original.forward[0].heldExcessNatsPerRune<0);
assert(original.reverse[0].heldExcessNatsPerRune<0);
console.log(JSON.stringify({
  model:"Reversible zero-step GP-EA F29 differential with affine ciphertext-history key",
  sourceGP:source.length,physicalRunePages:pages.length,originalRunes:12956,
  keySource:"ciphertext history; 11 explicitly predefined feature pairs",
  settingsPerFeature:28**3,readingDirections:2,
  zeroStepMarker:"EA at plaintext GP index28",
  priorExpectedExcessNatsPerRune:expected,
  original,
  positive:{
    trueFeatures:["prev","prev6"],trueCoefficients:[7,11,5],
    recovered:positive,
    exactRoundtripForAllPostIVRunes:true
  },
  result:"No recoverable LP2 plaintext or original key in the tested feedback families"
},null,2));
