"use strict";
/**
 * Agent19 original LP2 GP29 / GP28 inverse using the source-derived
 * four-orbits-of-seven partition of the affine map T^-36. In the full
 * 28-cycle T(x)=24-2x, powers with exponents equal mod4 form four
 * 7-cycles; index each as one printed eight-row group (seven runes
 * plus the fixed-point sentinel H) of the physical 32x8 byte grid.
 *
 * Only the preceding original ciphertext symbol chooses the row;
 * position mod8 chooses the column. The inverse is exact and stateful,
 * uses no fitted key, and is independently planted with Shakespeare GP.
 *
 * Node 22, CommonJS, no filesystem writes.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=load("resources/liber-primus/lp2-corpus.json");
const grid=load("resources/liber-primus/base60-grid.json").byte_rows;
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(grid.length,32);
assert(grid.every(x=>x.length===8));
assert.equal(pages.reduce((a,p)=>a+p.indices.length,0),12956);
const mod=(x,n)=>((x%n)+n)%n;
const T=x=>mod(24-2*x,29);
/** @param {number} origin */
function orbit(origin){
  const out=[],byRune=new Map();
  let x=origin;
  for(let k=0;k<28;k++){
    assert(!byRune.has(x));
    byRune.set(x,k);out.push(x);x=T(x);
  }
  assert.equal(x,origin);assert.equal(byRune.size,28);
  assert(!byRune.has(8));
  return {out,byRune};
}
/** @param {number} origin @param {"group"|"serial"} layout */
function rowSelector(origin,layout){
  const {byRune}=orbit(origin);
  /** @param {number} previous @param {number} page */
  return (previous,page)=>{
    if(previous===8)return layout==="group"?8*(page%4)+7:28+(page%4);
    const k=byRune.get(previous);
    assert.notEqual(k,undefined);
    return layout==="group"?8*(k%4)+Math.floor(k/4):k;
  };
}
function coincidence(x){
  const counts=new Uint32Array(29);
  for(const value of x)counts[value]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
const originals=pages.map(p=>p.indices);
const all=originals.flat();
const txt=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8").toUpperCase()
  .replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
const tokens=corpus.translit.map((value,index)=>({value,index}))
  .sort((a,b)=>b.value.length-a.value.length);
/** @returns {number[]} */
function nativeReference(){
  const answer=[];
  for(const word of txt.match(/[A-Z]+/g)||[]){
    for(let k=0;k<word.length;){
      const match=tokens.find(x=>word.startsWith(x.value,k));
      assert(match,"Missing GP symbol "+word.slice(k));
      answer.push(match.index);k+=match.value.length;
      if(answer.length===12956)return answer;
    }
  }
  throw Error("Reference too short");
}
const text=nativeReference();
const nativePages=[];
let at=0;
for(const p of originals){nativePages.push(text.slice(at,at+p.length));at+=p.length;}
assert.equal(at,12956);
/** @param {number[][]} source @param {number} origin @param {"group"|"serial"} layout @param {"global"|"page"} clock @param {"gp29"|"gp28"} mode @param {-1|1} sign */
function decode(source,origin,layout,clock,mode,sign){
  const row=rowSelector(origin,layout);
  const plain=[];
  let pos=0;
  for(let j=0;j<source.length;j++){
    const ciphertext=source[j],out=[ciphertext[0]];
    if(clock==="page")pos=0;
    pos++;
    for(let i=1;i<ciphertext.length;i++){
      const prev=ciphertext[i-1],next=ciphertext[i];
      const key=grid[row(prev,pages[j].page)][pos%8]%(mode==="gp29"?29:28);
      const value=mode==="gp29"?mod(next+sign*key,29):
        next===prev?28:mod(mod(next-prev,29)-1+sign*key,28);
      out.push(value);pos++;
    }
    plain.push(out);
  }
  return plain;
}
/** @param {number[][]} plain @param {number[][]} initial @param {number} origin @param {"group"|"serial"} layout @param {"global"|"page"} clock @param {"gp29"|"gp28"} mode @param {-1|1} sign */
function encode(plain,initial,origin,layout,clock,mode,sign){
  const row=rowSelector(origin,layout);
  const encrypted=[];
  let pos=0;
  for(let j=0;j<plain.length;j++){
    const out=[initial[j][0]];
    if(clock==="page")pos=0;
    pos++;
    for(let i=1;i<plain[j].length;i++){
      const prev=out[i-1];
      const key=grid[row(prev,pages[j].page)][pos%8]%(mode==="gp29"?29:28);
      const value=plain[j][i];
      const ciphertext=mode==="gp29"?mod(value-sign*key,29):
        value===28?prev:mod(prev+mod(value-sign*key,28)+1,29);
      out.push(ciphertext);pos++;
    }
    encrypted.push(out);
  }
  return encrypted;
}
const variants=[];
for(const origin of [13,24])
for(const layout of ["group","serial"])
for(const clock of ["global","page"])
for(const mode of ["gp29","gp28"])
for(const sign of [-1,1]){
  const opts=[origin,layout,clock,mode,sign];
  const back=decode(originals,...opts);
  assert.deepEqual(encode(back,originals,...opts),originals);
  const plant=encode(nativePages,originals,...opts);
  const recovered=decode(plant,...opts);
  for(let j=0;j<pages.length;j++)assert.deepEqual(recovered[j].slice(1),nativePages[j].slice(1));
  const values=back.flatMap(x=>x.slice(1));
  const native=nativePages.flatMap(x=>x.slice(1));
  variants.push({origin,layout,clock,mode,sign,
    originalIoC:coincidence(values),nativeIoC:coincidence(native),
    preview:values.slice(0,70).map(i=>corpus.translit[i]).join("")});
}
variants.sort((a,b)=>b.originalIoC-a.originalIoC);
const sourceSample=all.slice(0,80).map(i=>corpus.translit[i]).join("");
console.log(JSON.stringify({
  status:"Finite source-orbit/printed-grid original-input inverse; no key assumed",
  model:"Ciphertext predecessor rune -> 4x(7+1) rows -> source eight-column pad",
  sourceCycle:{T:"24-2*x mod29",TtoGap36:"23*x+27",orbits:4,nonfixedPerOrbit:7,
    origins:[13,24],sourceRows:32,sourceCols:8},
  originalRunes:all.length,runeBearingPages:pages.length,
  ciphertextIoC:coincidence(all),models:variants.length,
  nativePlantChecks:variants.length,
  bestOriginalIoC:variants[0].originalIoC,
  minOriginalIoC:variants.at(-1).originalIoC,
  nativeReferenceIoC:variants[0].nativeIoC,
  best:variants.slice(0,8),
  sampleSource:sourceSample,
  conclusion:"Planted roundtrip confirms model invertibility only. Compare original GP language evidence to the native plant; no mechanism or plaintext has been authenticated."
},null,2));
