"use strict";
/**
 * EXACT SOURCE-DERIVED SKIP-CLOCK inversion of the reversible 29-symbol
 * contextual marker model. The pad is consumed ONLY when an output is
 * key-dependent; the 265 original conditional special markers (EA/S/L/E)
 * do NOT consume any key digit. The skip mask is entirely observable from
 * original ciphertext, so this is an exact inverse with no latent fitting.
 *
 * Train-first and frozen-heldout source-red 225-pad schedules and full
 * arbitrary 225-digit unknown-pad recovery are evaluated. Native GP plants
 * with the same true skip behavior demonstrate key recovery power.
 *
 * Run: node sims/contextual_marker29_skipstream_inverse.cjs
 */
const assert=require("node:assert/strict");
const {
  alphabet
}=require("./contextual_marker29_reversible.cjs");
const {
  records,original,pageIndex,pageLocal,first,source,red,pages,logPrior
}=require("./contextual_marker29_period225_key_recovery.cjs");
const N=original.length,M=29,Q=225;
assert.equal(N,12956);assert.equal(red.length,Q);
const mod=(x,n)=>(x%n+n)%n;
/**
 * @param {ArrayLike<number>} cipher
 * @returns {{items:Array<object>,global:Uint16Array,page:Uint16Array,keyed:number}}
 */
function recordClock(cipher){
  const items=records(cipher),included=new Uint8Array(N);
  for(const r of items)included[r.i]=1;
  const global=new Uint16Array(N),page=new Uint16Array(N);
  let g=0,l=0;
  for(let i=0;i<N;i++){
    if(first[i])l=0;
    global[i]=g;page[i]=l;
    if(included[i]){g++;l++;}
  }
  assert.equal(g,items.length);
  return {items,global,page,keyed:g};
}
/** @param {ArrayLike<number>} cipher @param {number[]} pad @param {"global"|"page"} clock */
function decode(cipher,pad,clock){
  const rs=recordClock(cipher),out=new Uint8Array(N);
  const byIndex=new Map(rs.items.map(x=>[x.i,x]));
  for(let i=0;i<N;i++){
    const r=byIndex.get(i);
    if(r===undefined){
      const a=alphabet(cipher,i),delta=mod(cipher[i]-cipher[i-1],29);
      const find=[...a.reserved].find(([,v])=>v===delta);
      assert.ok(find);
      out[i]=find[0];continue;
    }
    const t=(clock==="global"?rs.global[i]:rs.page[i])%pad.length;
    const k=pad[t];
    out[i]=r.first?mod(r.rank-k,M):
      r.symbols[mod(r.rank-k,r.radix)];
  }
  return out;
}
/**
 * Full lossless skip-clock encryption of all GP symbols, including page IV.
 * @param {ArrayLike<number>} plain
 * @param {number[]} pad
 * @param {"global"|"page"} clock
 */
function encrypt(plain,pad,clock){
  const c=new Uint8Array(N);
  let g=0,l=0;
  for(let i=0;i<N;i++){
    if(first[i])l=0;
    const t=(clock==="global"?g:l)%pad.length,k=pad[t],p=plain[i];
    if(first[i]){
      c[i]=mod(p+k,M);g++;l++;continue;
    }
    const a=alphabet(c,i);
    const fixed=a.reserved.get(p);
    if(fixed!==undefined){
      c[i]=mod(c[i-1]+fixed,M);
      continue;
    }
    const rank=a.freeSymbols.indexOf(p);
    assert.ok(rank>=0);
    const delta=a.freeDeltas[mod(rank+k,a.freeDeltas.length)];
    c[i]=mod(c[i-1]+delta,M);
    g++;l++;
  }
  return c;
}
/**
 * For a fixed phase-clock map, infer all 225 arbitrary 29-residue pad digits
 * from original pages0..27 and score frozen original p28..55.
 * @param {ArrayLike<number>} ciphertext
 * @param {"global"|"page"} clock
 * @param {number} [period=225]
 */
function learn(ciphertext,clock,period=Q){
  const rs=recordClock(ciphertext);
  const histogram=Array.from({length:period},()=>new Float64Array(M));
  const keyCount=new Uint16Array(period);
  for(const r of rs.items){
    if(pageIndex[r.i]>=28)continue;
    const t=(clock==="global"?rs.global[r.i]:rs.page[r.i])%period;
    keyCount[t]++;
    for(let k=0;k<M;k++){
      const p=r.first?mod(r.rank-k,M):
        r.symbols[mod(r.rank-k,r.radix)];
      histogram[t][k]+=logPrior[p];
    }
  }
  const key=histogram.map(row=>{
    let best=0;for(let k=1;k<M;k++)if(row[k]>row[best])best=k;
    return best;
  });
  let train=0,hold=0,baseline=0,nt=0,nh=0;
  for(const r of rs.items){
    const t=(clock==="global"?rs.global[r.i]:rs.page[r.i])%period,
      k=key[t],p=r.first?mod(r.rank-k,M):
        r.symbols[mod(r.rank-k,r.radix)];
    if(pageIndex[r.i]<28){train+=logPrior[p];nt++;}
    else{
      hold+=logPrior[p];nh++;
      baseline+=r.first?logPrior.reduce((a,b)=>a+b,0)/M:
        r.symbols.reduce((a,b)=>a+logPrior[b],0)/r.radix;
    }
  }
  return {key,train:train/nt,hold:hold/nh,uniform:baseline/nh,
    trainCount:nt,holdCount:nh,
    columns:{min:Math.min(...keyCount),max:Math.max(...keyCount)}};
}
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function nativePlant(rand){
  const p=new Uint8Array(N);let at=0;
  for(const page of pages){
    const off=rand()%source.length;
    for(let i=0;i<page.indices.length;i++)
      p[at+i]=source[(off+i)%source.length];
    at+=page.indices.length;
  }
  assert.equal(at,N);return p;
}
/** @param {ArrayLike<number>} x @param {ArrayLike<number>} y */
function holdAccuracy(x,y){
  let ok=0,n=0;
  for(let i=0;i<N;i++)if(pageIndex[i]>=28){
    n++;ok+=Number(x[i]===y[i]);
  }
  return ok/n;
}
function scanDirect(rs,clock){
  const variants=[];
  for(const repr of ["index","prime"])for(const reverse of [false,true]){
    variants.push({repr,reverse,seq:red.map((_,i)=>{
      const value=red[reverse?Q-1-i:i];
      return repr==="prime"?
        [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,
          71,73,79,83,89,97,101,103,107,109][value]:value;
    })});
  }
  const output=[];
  for(const {repr,reverse,seq} of variants)for(const sign of [1,-1]){
    let best=null;
    for(let phase=0;phase<Q;phase++){
      let tr=0,ho=0,nt=0,nh=0;
      for(const r of rs.items){
        const pos=(clock==="global"?rs.global[r.i]:rs.page[r.i]),
          k=sign*seq[(pos+phase)%Q],
          p=r.first?mod(r.rank-k,M):
            r.symbols[mod(r.rank-k,r.radix)];
        if(pageIndex[r.i]<28){tr+=logPrior[p];nt++;}
        else{ho+=logPrior[p];nh++;}
      }
      const train=tr/nt;
      if(best===null||train>best.train)
        best={repr,reverse,sign,phase,train,hold:ho/nh};
    }
    output.push(best);
  }
  return output.sort((a,b)=>b.train-a.train);
}
function run(){
  const rs=recordClock(original);
  const actualGlobal=learn(original,"global");
  const actualPage=learn(original,"page");
  const directGlobal=scanDirect(rs,"global");
  const directPage=scanDirect(rs,"page");
  // Full exact original ciphertext forward re-encryption under learned key
  for(const [clock,fit] of [["global",actualGlobal],["page",actualPage]]){
    const plain=decode(original,fit.key,clock);
    assert.deepEqual(encrypt(plain,fit.key,clock),Uint8Array.from(original));
  }
  const random=rng(0x2250beef),controls=[];
  for(let n=0;n<8;n++){
    const plain=nativePlant(random),cipher=encrypt(plain,red,"global");
    const trueRecover=decode(cipher,red,"global");
    assert.deepEqual(trueRecover,plain);
    const fit=learn(cipher,"global");
    const inverse=decode(cipher,fit.key,"global");
    assert.deepEqual(encrypt(inverse,fit.key,"global"),cipher);
    controls.push({matchingKeyDigits:fit.key.filter((x,i)=>x===red[i]).length,
      holdoutAccuracy:holdAccuracy(inverse,plain),heldoutSourceLog:fit.hold,
      heldoutUniformReference:fit.uniform});
  }
  return {
    cipher:"exact GP29 contextual reserved markers with 225-pad skip clocks",
    source:{runes:N,sourceRed225:red.length,
      keylessConditionalMarkers:N-rs.keyed,
      keyedOriginal:N-(N-rs.keyed),trainPages:"0..27",
      frozenOriginalPages:"28..55"},
    original:{
      unknownGlobalPad:{...actualGlobal,key:undefined},
      unknownPagePad:{...actualPage,key:undefined},
      bestDirectGlobal:directGlobal[0],bestDirectPage:directPage[0],
      directSchedulesTested:variantsCount(),
      unknownPadOriginalExactRoundtrip:true
    },
    sourceNativeControls:{seed:"0x2250beef",trials:controls},
    caveat:"Postselected mechanism; exact original re-encoding holds under any fitted key and supplies no authentication or readable plaintext."
  };
}
function variantsCount(){return 2*2*2*225*2;}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={recordClock,decode,encrypt,learn,run};
