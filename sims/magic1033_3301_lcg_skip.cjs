"use strict";
/**
 * Source-constrained, skip-aware test of 32-bit LCGs built from the two
 * manuscript magic-square totals 1033 and 3301. Neither total is a recovered
 * LCG parameter: both orientations and seed/output choices are conjectural.
 * The 2^32 LCGs are full-period (odd increment, a == 1 mod 4).
 *
 * Standalone: node sims/magic1033_3301_lcg_skip.cjs
 * No packages, writes, or network calls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT=path.resolve(__dirname,"..");
const read = p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const MOD=29, MAX_EXTRA=25, ADVANCE=3, STATES=(MAX_EXTRA+1)*ADVANCE, SKIP_COST=3.5;
const SYMBOLS=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const DIG={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const LET={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const mod=x=>(x%MOD+MOD)%MOD;

/** @param {string} raw */
function encode(raw){
  const s=raw.toUpperCase().replace(/[^A-Z]/g,"");
  const o=[];
  for(let i=0;i<s.length;i++){
    const d=DIG[s.slice(i,i+2)];
    if(d!==undefined){o.push(d);i++;}
    else o.push(LET[s[i]]);
  }
  return o;
}

/** Smoothed GP-English trigram model, independent of actual LP2 plaintext. */
function train(text){
  const xs=encode(text),u=new Uint32Array(MOD),b=new Uint32Array(MOD**2),t=new Uint32Array(MOD**3);
  for(let i=0;i<xs.length;i++){
    const x=xs[i];u[x]++;
    if(i)b[xs[i-1]*MOD+x]++;
    if(i>1)t[(xs[i-2]*MOD+xs[i-1])*MOD+x]++;
  }
  const U=new Float64Array(MOD),B=new Float64Array(MOD**2),T=new Float64Array(MOD**3);
  for(let c=0;c<MOD;c++)U[c]=Math.log((u[c]+1)/(xs.length+MOD));
  for(let a=0;a<MOD;a++)for(let c=0;c<MOD;c++)
    B[a*MOD+c]=Math.log((b[a*MOD+c]+12*Math.exp(U[c]))/(u[a]+12));
  for(let a=0;a<MOD;a++)for(let z=0;z<MOD;z++)for(let c=0;c<MOD;c++){
    const k=(a*MOD+z)*MOD+c;
    T[k]=Math.log((t[k]+9*Math.exp(B[z*MOD+c]))/(b[a*MOD+z]+9));
  }
  return {U,B,T,symbolCount:xs.length};
}

/** Inverse of an odd 32-bit multiplier, via five Newton iterations. */
function inverse32(a){
  let x=a>>>0;
  for(let i=0;i<5;i++)x=Math.imul(x,2-Math.imul(a,x))>>>0;
  assert.equal(Math.imul(x,a)>>>0,1);
  return x;
}

/** @param {number} state @param {number} mode */
function output(state,mode){
  switch(mode){
    case 0:return state%29;
    case 1:return(state>>>8)%29;
    case 2:return(state>>>16)%29;
    case 3:return(state>>>24)%29;
    case 4:return Math.floor(state*29/4294967296);
    case 5:return(state&255)%29;
    default:throw Error("mode");
  }
}

/** Full-width LCG output, forward or exact inverse 32-bit recurrence. */
function pad(seed,a,c,reverse,mode,count){
  let x=seed>>>0;
  const inv=reverse?inverse32(a):0;
  const k=new Uint8Array(count);
  for(let i=0;i<count;i++){
    x=reverse?Math.imul(inv,(x-c))>>>0:(Math.imul(x,a)+c)>>>0;
    k[i]=output(x,mode);
  }
  return k;
}

/** Exact Viterbi under max 25 additional consumed keys, 2 successive retries. */
function solve(cipher,key,sign,lang,trace=false){
  const N=cipher.length;
  assert(key.length>=N+MAX_EXTRA+2);
  assert(N>=3);
  const states=STATES;
  let old=new Float64Array(states).fill(-1e80);
  const back=trace?new Int16Array(N*states).fill(-1):null;
  const initial=mod(cipher[0]+sign*key[0]);
  for(let advance=1;advance<=ADVANCE;advance++){
    const j=advance,skips=advance-1;
    let valid=true;
    const p=mod(cipher[1]+sign*key[j]);
    for(let r=1;r<advance;r++)
      if(mod(p-sign*key[r])!==cipher[0]){valid=false;break;}
    if(valid)old[skips*ADVANCE+advance-1]=
      lang.U[initial]+lang.B[initial*MOD+p]-skips*SKIP_COST;
  }
  for(let i=2;i<N;i++){
    const next=new Float64Array(states).fill(-1e80);
    for(let state=0;state<states;state++){
      const base=old[state];if(base< -1e70)continue;
      const extra=(state/ADVANCE)|0,lastAdvance=state%ADVANCE+1;
      const j=i-1+extra;
      const p2=mod(cipher[i-2]+sign*key[j-lastAdvance]);
      const p1=mod(cipher[i-1]+sign*key[j]);
      for(let advance=1;advance<=ADVANCE&&extra+advance-1<=MAX_EXTRA;advance++){
        const newIndex=j+advance,p=mod(cipher[i]+sign*key[newIndex]);
        let valid=true;
        for(let r=1;r<advance;r++)
          if(mod(p-sign*key[j+r])!==cipher[i-1]){valid=false;break;}
        if(!valid)continue;
        const stateNew=(extra+advance-1)*ADVANCE+advance-1;
        const s=base+lang.T[(p2*MOD+p1)*MOD+p]-(advance-1)*SKIP_COST;
        if(s>next[stateNew]){
          next[stateNew]=s;
          if(back)back[i*states+stateNew]=state;
        }
      }
    }
    old=next;
  }
  let best=-1e80,last=-1;
  for(let state=0;state<states;state++)
    if(old[state]>best){best=old[state];last=state;}
  if(!trace)return {perRune:best/N};
  const plain=Array(N);
  let state=last,skips=0;
  for(let i=N-1;i>=1;i--){
    const extra=(state/ADVANCE)|0,advance=state%ADVANCE+1;
    plain[i]=mod(cipher[i]+sign*key[i+extra]);
    skips+=advance-1;
    if(i===1){
      plain[0]=initial;
      break;
    }
    state=back[i*states+state];
    assert(state>=0);
  }
  return {perRune:best/N,plain,skips,preview:plain.slice(0,60).map(x=>SYMBOLS[x]).join(" ")};
}

function seedSet(grid){
  const seeds=new Set([1033,3301,2012,2013,2014,91,809,0x33012014,0x10333301]);
  for(let i=0;i<256;i++)seeds.add(i);
  for(const row of [
    [272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],
    [434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626]
  ])for(const v of row)seeds.add(v);
  for(let col=0;col<8;col++)for(const backwards of [false,true]){
    let x=0;
    for(let row=0;row<4;row++){
      const at=backwards?3-row:row;
      x=(x*256+grid.byte_rows[at][col])>>>0;
    }
    seeds.add(x);
  }
  return [...seeds].sort((a,b)=>a-b);
}

/** Deterministic model plant, unknown to the search. */
function planted(plain,key,sign,seed){
  let rng=seed>>>0;
  const rand=()=>{
    rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
    return (rng>>>0)/4294967296;
  };
  let j=0,previous=-1,skips=0;
  const cipher=[];
  for(const p of plain){
    let c=mod(p-sign*key[j]),attempts=0;
    while(previous>=0&&c===previous&&attempts<2&&rand()<0.81){
      j++;skips++;attempts++;
      c=mod(p-sign*key[j]);
    }
    cipher.push(c);
    previous=c;j++;
  }
  return {cipher,skips};
}

function main(){
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
  const ps=corpus.pages.filter(p=>p.page<56&&p.indices.length);
  assert.equal(ps.length,55);
  assert.equal(ps.reduce((s,p)=>s+p.indices.length,0),12956);
  const training=read("resources/control/shakespeare_first300k.txt");
  const lang=train(training.slice(0,180000));
  const controlText=encode(training.slice(180000));
  const seeds=seedSet(grid);
  assert.equal(seeds.length,295);

  const positive=[];
  for(const [a,c,reverse,mode,sign,seed] of [
    [3301,1033,false,5,-1,73],
    [1033,3301,true,3,1,91]
  ]){
    const sample=controlText.slice(500,500+262);
    const key=pad(seed,a,c,reverse,mode,sample.length+MAX_EXTRA+5);
    const source=planted(sample,key,sign,0x42ac9871);
    const recovered=solve(source.cipher,key,sign,lang,true);
    const matches=recovered.plain.filter((x,i)=>x===sample[i]).length;
    positive.push({a,c,reverse,mode,sign,seed,knownSymbols:sample.length,
      actualSkips:source.skips,recoveredSymbols:matches,inferredSkips:recovered.skips,
      logScore:recovered.perRune});
    assert(matches>=sample.length*0.95,"Known-model planted plaintext not recovered");
  }

  const rows=[];
  for(const pageNum of [0,52]){
    const source=ps.find(p=>p.page===pageNum);
    assert(source);
    const cipher=source.indices;
    let best=[];
    for(const [a,c] of [[3301,1033],[1033,3301]])
      for(const reverse of [false,true])
        for(const seed of seeds)
          for(let mode=0;mode<6;mode++){
            const key=pad(seed,a,c,reverse,mode,cipher.length+MAX_EXTRA+5);
            for(const sign of [-1,1]){
              const perRune=solve(cipher,key,sign,lang).perRune;
              best.push({page:pageNum,a,c,reverse,seed,mode,sign,perRune});
            }
          }
    best.sort((x,y)=>y.perRune-x.perRune);
    const top=best.slice(0,10).map(x=>{
      const key=pad(x.seed,x.a,x.c,x.reverse,x.mode,cipher.length+MAX_EXTRA+5);
      const recon=solve(cipher,key,x.sign,lang,true);
      return {...x,skips:recon.skips,preview:recon.preview};
    });
    rows.push({page:pageNum,runicLength:cipher.length,candidateCount:best.length,
      bestPerRune:best[0].perRune,medianPerRune:best[(best.length/2)|0].perRune,top});
  }
  console.log(JSON.stringify({hypothesis:"Full-period 2^32 LCG with magic-square totals (1033,3301) as multiplier/increment; unknown clue-derived seed, six byte-reductions, direct or inverse recurrence, skip-aware GP-English decoding",
    seedCount:seeds.length,firstPage:0,postGridPage:52,
    controlTrainingRunes:lang.symbolCount,positives:positive,results:rows,
    scope:"Finite seed/output/retry family only; no complete LP2 decryption implied."},null,2));
}
if(require.main===module)main();
module.exports={encode,train,inverse32,pad,solve,seedSet,planted};
