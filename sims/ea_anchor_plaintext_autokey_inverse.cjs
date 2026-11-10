"use strict";
/**
 * Exact EA-anchor plaintext-autokey inversion on original LP2 ciphertext.
 * When C[i]==C[i-1], the F29/28-unit model requires GP-EA at plaintext i.
 * Every such observation synchronizes a first-order plaintext-autokey:
 *   D[i] = 0 if P[i]==EA, else 15^((P[i]+a*P[i-1]+b) mod28) mod29.
 *   For D[i]!=0, P[i] = log_15(D[i])-a*P[i-1]-b mod28.
 * The first zero delta within each reset scope is a known plaintext anchor.
 * Every subsequent symbol is then exactly decodable for a known (a,b).
 * Runs true source-disjoint planted tests and the authentic LP2 original.
 * Run: node sims/ea_anchor_plaintext_autokey_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(pages.flat().length,12956);
const token=new Map(corpus.translit.map((s,i)=>[s,i]));
const source=[];
for(let word of read("resources/control/shakespeare_first300k.txt").toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  for(let i=0;i<word.length;){
    const d=token.get(word.slice(i,i+2));
    if(d!==undefined){source.push(d);i+=2;}
    else{const v=token.get(word[i]);if(v!==undefined)source.push(v);i++;}
  }
}
assert.equal(source.length,218800);
const m28=x=>(x%28+28)%28,m29=x=>(x%29+29)%29;
const exp=new Uint8Array(28),log=new Int8Array(29).fill(-1);
for(let i=0,x=1;i<28;i++,x=x*15%29){exp[i]=x;log[x]=i;}
assert.equal(new Set(exp).size,28);
const cnt=new Float64Array(28).fill(.5);
for(const v of source.slice(0,100000))if(v<28)cnt[v]++;
const total=cnt.reduce((a,b)=>a+b,0);
const prior=Array.from(cnt,v=>Math.log(28*v/total));
const expected=prior.reduce((s,p,i)=>s+p*cnt[i]/total,0);

/** @param {number[][]} input @param {"global"|"page"} scope
 *  @param {"forward"|"reverse"} direction
 *  @returns {number[][]} */
function streams(input,scope,direction){
  if(scope==="global"){
    const combined=input.flat();
    return [direction==="reverse"?combined.toReversed():combined];
  }
  return input.map(a=>direction==="reverse"?a.toReversed():a);
}

/**
 * Only emit observations from a position AFTER a zero-step EA anchor.
 * @param {number[][]} input
 * @param {"global"|"page"} scope
 * @param {"forward"|"reverse"} direction
 * @param {number} a
 * @param {number} b
 */
function decode(input,scope,direction,a,b){
  const blocks=streams(input,scope,direction);
  const output=[],scores=[0,0],counts=[0,0],marks=[0,0];
  let nGlobal=0;
  for(let page=0;page<blocks.length;page++){
    const c=blocks[page],p=Array(c.length).fill(-1);
    let anchored=false,prev=28;
    for(let i=1;i<c.length;i++){
      const x=log[m29(c[i]-c[i-1])];
      if(x<0){
        p[i]=28;prev=28;anchored=true;
        const idx=scope==="page"?(page<27?0:1):(nGlobal+i<6480?0:1);
        marks[idx]++;
        continue;
      }
      if(!anchored)continue;
      const value=m28(x-a*(prev%28)-b);
      p[i]=value;prev=value;
      const idx=scope==="page"?(page<27?0:1):(nGlobal+i<6480?0:1);
      scores[idx]+=prior[value];counts[idx]++;
    }
    output.push(p);
    nGlobal+=c.length;
  }
  return {train:scores[0]/counts[0],held:scores[1]/counts[1],
    trainCount:counts[0],heldCount:counts[1],
    markerCount:marks[0]+marks[1],unanchoredPages:
      scope==="page"?output.filter(x=>x.every(v=>v<0)).length:0,
    output};
}

/** @param {number[][]} input @param {"global"|"page"} scope
 *  @param {"forward"|"reverse"} direction */
function search(input,scope,direction){
  const candidates=[];
  for(let a=0;a<28;a++)for(let b=0;b<28;b++){
    const v=decode(input,scope,direction,a,b);
    candidates.push({a,b,train:v.train,held:v.held,
      trainCount:v.trainCount,heldCount:v.heldCount,
      markerCount:v.markerCount,
      unanchoredPages:v.unanchoredPages});
  }
  candidates.sort((x,y)=>y.train-x.train);
  return candidates.slice(0,6);
}

/**
 * Encrypt held-out source to an authentic F29-differential stream using known
 * plaintext feedback and independently chosen IVs. Exactly decrypt every
 * post-EA-anchored symbol with the undisclosed true coefficients.
 * @param {"global"|"page"} scope
 */
function plant(scope){
  const plain=source.slice(-12956);
  let start=0,prevGP=0;
  const cipher=[];
  for(let page=0;page<pages.length;page++){
    const p=plain.slice(start,start+=pages[page].length),c=[];
    for(let i=0;i<p.length;i++){
      const prev=scope==="page"?(i===0?28:p[i-1]):(start-p.length+i===0?28:prevGP);
      if(scope==="page"&&i===0)c.push((page*5+7)%29);
      else if(scope==="global"&&page===0&&i===0)c.push(7);
      else{
        const prevCipher=i>0?c[i-1]:cipher[page-1].at(-1);
        const d=p[i]===28?0:exp[m28(p[i]+7*(prev%28)+11)];
        c.push(m29(prevCipher+d));
      }
      prevGP=p[i];
    }
    cipher.push(c);
  }
  const valid=decode(cipher,scope,"forward",7,11).output;
  const expectedPlain=scope==="global"?[plain]:pages.map((p,i)=>{
    const offset=pages.slice(0,i).reduce((s,x)=>s+x.length,0);
    return plain.slice(offset,offset+p.length);
  });
  let n=0,correct=0,unanchored=0;
  for(let j=0;j<valid.length;j++){
    const values=valid[j],truth=expectedPlain[j];
    for(let i=0;i<values.length;i++){
      if(values[i]>=0){n++;correct+=Number(values[i]===truth[i]);}
      else unanchored++;
    }
  }
  assert.equal(correct,n,"Exact anchored GP plaintext roundtrip");
  assert(n>6000);
  const fit=search(cipher,scope,"forward")[0];
  assert.deepEqual([fit.a,fit.b],[7,11]);
  assert(fit.held>0.2);
  return {key:[7,11],recovered:fit,
    roundtrip:correct,anchoredSymbols:n,unanchoredSymbols:unanchored};
}
const original={};
for(const scope of ["page","global"]){
  for(const direction of ["forward","reverse"]){
    const s=search(pages,scope,direction);
    original[scope+"/"+direction]=s;
    assert(s[0].held<0);
  }
}
const positive={page:plant("page"),global:plant("global")};
/**
 * For delayed P[i-L] feedback, every zero step initializes one independent
 * residue chain i mod L. Following that chain's first marker, all later
 * plaintext symbols are exact for any a,b, without its missing initial seed.
 * Scans the full, continuous original LP2 sequence for L=1..16.
 * @param {number[]} input @param {number[]} lags
 */
function laggedScan(input,lags){
  const diffs=new Int8Array(input.length).fill(-1);
  for(let i=1;i<input.length;i++)
    diffs[i]=log[m29(input[i]-input[i-1])];
  const winners=[];
  for(const delay of lags){
    let best={delay,train:-Infinity};
    for(let a=0;a<28;a++)for(let b=0;b<28;b++){
      const value=new Uint8Array(delay),seen=new Uint8Array(delay);
      let tr=0,ho=0,nt=0,nh=0,markers=0;
      for(let i=1;i<diffs.length;i++){
        const group=i%delay,x=diffs[i];
        if(x<0){value[group]=0;seen[group]=1;markers++;continue;}
        if(!seen[group])continue;
        const p=m28(x-a*value[group]-b);
        value[group]=p;
        if(i<6480){tr+=prior[p];nt++;}
        else{ho+=prior[p];nh++;}
      }
      if(tr/nt>best.train){
        best={delay,a,b,train:tr/nt,held:ho/nh,
          trainRunes:nt,heldRunes:nh,markers,
          seededChains:seen.reduce((s,v)=>s+v,0)};
      }
    }
    winners.push(best);
  }
  return winners;
}
/** Source-disjoint actual English GP encrypted under a six-back autokey. */
function laggedPlant(){
  const plaintext=source.slice(-12956),cipher=[7],delay=6;
  for(let i=1;i<plaintext.length;i++){
    const p=plaintext[i],
      state=i>=delay?plaintext[i-delay]%28:0,
      increment=p===28?0:exp[m28(p+7*state+11)];
    cipher.push(m29(cipher[i-1]+increment));
  }
  const decoded=new Int16Array(cipher.length).fill(-1);
  const known=new Uint8Array(delay);
  let exact=0,covered=0;
  for(let i=1;i<cipher.length;i++){
    const x=log[m29(cipher[i]-cipher[i-1])],group=i%delay;
    if(x<0){known[group]=1;decoded[i]=28;}
    else if(known[group]){
      decoded[i]=m28(x-7*(decoded[i-delay]%28)-11);
    }
    if(decoded[i]>=0){covered++;exact+=Number(decoded[i]===plaintext[i]);}
  }
  assert.equal(exact,covered);
  assert(covered>10000);
  const selection=laggedScan(cipher,[delay])[0];
  assert.deepEqual([selection.a,selection.b],[7,11]);
  assert(selection.held>0.2);
  return {trueDelay:6,trueCoefficients:[7,11],selected:selection,
    exactRecovered:exact,anchoredCoverage:covered,
    sourceRunes:plaintext.length};
}
const originalLagged={
  forward:laggedScan(pages.flat(),Array.from({length:16},(_,i)=>i+1)),
  reverse:laggedScan(pages.flat().toReversed(),Array.from({length:16},(_,i)=>i+1))
};
const laggedPositive=laggedPlant();
assert(originalLagged.forward.every(x=>x.held<0));
assert(originalLagged.reverse.every(x=>x.held<0));

console.log(JSON.stringify({
  claim:"Bounded original LP2 first-order GP plaintext-autokey inverse; no genuine key",
  cipherModel:"F29 increment 0 iff P=EA, otherwise 15^((P+a*previous_P+b) mod28)",
  originalRunes:12956,originalPages:55,sourceGP:source.length,
  selection:"First27 rune pages/page-reset, or first6480 runes/global; 28 pages/global remainder held out",
  coefficients:784,settings:"2 scopes x 2 reading directions x 784",
  original,positive,laggedOriginal:originalLagged,laggedPositive,
  sourceExpectedExcessNatsPerNonzeroSymbol:expected
},null,2));
