"use strict";
/**
 * Source-guided 27x27 ciphertext-direction walker. Derive the 729-cell key
 * from original LP2 physical pages 0–2. The suggested (13,12) root is
 * retrospective; the signed "numbers are the direction" clue does not
 * authenticate these compass mappings. The model explicitly tests, rather
 * than assumes, the original ciphertext is decryptable this way.
 *
 * With a fresh physical-page first rune, C=(P+sK) mod29. Thereafter
 * plaintext GP-EA=28 produces C=previous C. Other plaintext labels use
 * 28-valued successor ranks relative to the previous C, in forward/reverse
 * source GP cyclic order. The grid pointer moves after reading published C.
 *
 * SFT: node sims/source27_cipher_direction_inverse.cjs
 * Node 22, CJS, no dependencies, no file writes. Complete exact original
 * re-encryption, blind 1024-way source-true plaintext recovery, wrong-source
 * controls, two-section train / five-section original heldout.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=GP.pages.filter(p=>p.page<=55&&p.indices.length);
const bodies=pages.filter(p=>p.page>=3);
const grid=pages.slice(0,3).flatMap(p=>p.indices);
const origin=11+27*12, mod=(v,n)=>((v%n)+n)%n;
const starts=new Set([3,8,15,23,27,33,40]);
const dirs=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
assert.equal(grid.length,729);
assert.equal(bodies.reduce((s,p)=>s+p.indices.length,0),12227);
/** @param {string} raw @returns {number[]} */
function encode(raw){
 const index=Object.fromEntries(GP.translit.map((s,i)=>[s,i]));
 const doubles=new Set(["TH","NG","EO","OE","AE","IA","EA"]), out=[];
 for(let word of raw.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
   .replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let i=0;i<word.length;i++){
   const dig=word.slice(i,i+2);
   if(doubles.has(dig)){out.push(index[dig]);i++;}
   else if(index[word[i]]!==undefined)out.push(index[word[i]]);
  }
 }
 return out;
}
/** @param {number[]} text */
function model(text){
 const count=new Float64Array(29).fill(1);
 for(const x of text)count[x]++;
 return Array.from(count,x=>Math.log(x/(text.length+29)));
}
/** @param {number} pos @param {number} glyph @param {object} m */
function advance(pos,glyph,m){
 const n=m.primeStep?GP.prime[glyph]%8:glyph%8;
 const [dy,dx]=dirs[mod(m.offset+m.mirror*n,8)];
 return 27*mod(Math.floor(pos/27)+m.step*dy,27)+
  mod(pos%27+m.step*dx,27);
}
/**
 * Lossless inverse/forward map under fixed source grid and source-dependent
 * modes. Ciphertext, not conjectured plaintext, determines pointer state.
 * @param {object} m @param {number[][]} input
 * @param {boolean} forward @param {number[]} [keyGrid]
 */
function convert(m,input,forward,keyGrid=grid){
 let pos=origin;
 return input.map((line,j)=>{
  if(m.reset==="page"||(m.reset==="section"&&starts.has(bodies[j].page)))
   pos=origin;
  const out=[];let prev=-1;
  for(let i=0;i<line.length;i++){
   const value=keyGrid[pos],k=(m.primeKey?GP.prime[value]:value)%28;
   let p,c;
   if(forward){
    p=line[i];
    if(i===0)c=mod(p+m.sign*k,29);
    else if(p===28)c=prev;
    else {
     let rank=mod(p+m.sign*k,28);
     if(m.reverse)rank=27-rank;
     c=mod(prev+1+rank,29);
    }
    out.push(c);
   }else{
    c=line[i];
    if(i===0)p=mod(c-m.sign*k,29);
    else if(c===prev)p=28;
    else {
     let rank=mod(c-prev,29)-1;
     if(m.reverse)rank=27-rank;
     p=mod(rank-m.sign*k,28);
    }
    out.push(p);
   }
   prev=c;
   pos=advance(pos,c,m);
  }
  return out;
 });
}
/** @param {number[][]} texts @param {number[]} lp */
function stats(texts,lp){
 const f=new Uint32Array(29);let log=0,n=0;
 for(const t of texts)for(const x of t){f[x]++;log+=lp[x];n++;}
 return {n,meanLog:log/n,
  ioc:f.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1))};
}
/** Fully enumerated finite hypothesis family. */
function variants(){
 const v=[];
 for(const primeStep of [true,false])
 for(const primeKey of [false,true])
 for(const step of [1,5])
 for(let offset=0;offset<8;offset++)
 for(const mirror of [1,-1])
 for(const sign of [1,-1])
 for(const reverse of [false,true])
 for(const reset of ["page","section"])
  v.push({primeStep,primeKey,step,offset,mirror,sign,reverse,reset});
 assert.equal(v.length,1024);return v;
}
/** Frozen train choice based on p3–14 only. */
function rank(cipher,lp){
 return variants().map(mode=>{
  const plain=convert(mode,cipher,false);
  return {mode,train:stats(plain.slice(0,12),lp),
   heldout:stats(plain.slice(12),lp)};
 }).sort((a,b)=>b.train.meanLog-a.train.meanLog);
}
/** @param {number[]} values */
function reshape(values){
 let offset=0;
 const chunks=bodies.map(p=>{
  const t=values.slice(offset,offset+p.indices.length);
  offset+=p.indices.length;return t;
 });
 assert.equal(offset,12227);
 return chunks;
}
/** @param {number} seed */
function random(seed){
 let x=seed>>>0;
 return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {number[]} a @param {() => number} next */
function shuffle(a,next){
 const b=a.slice();
 for(let i=b.length-1;i>0;i--){const j=next()%(i+1);[b[i],b[j]]=[b[j],b[i]];}
 return b;
}
function run(){
 const shakespeare=read("resources/control/shakespeare_first300k.txt");
 const lp=model(encode(shakespeare.slice(0,190000)));
 const native=reshape(encode(shakespeare.slice(205000)).slice(0,12227));
 const original=bodies.map(p=>p.indices);
 const actualRank=rank(original,lp),originalBest=actualRank[0];
 const realClear=convert(originalBest.mode,original,false);
 assert.deepEqual(convert(originalBest.mode,realClear,true),original);
 const plantedMode={primeStep:true,primeKey:false,step:5,offset:0,
  mirror:1,sign:1,reverse:false,reset:"section"};
 const planted=convert(plantedMode,native,true);
 const plantRank=rank(planted,lp);
 assert.deepEqual(plantRank[0].mode,plantedMode);
 const inverted=convert(plantRank[0].mode,planted,false);
 assert.deepEqual(inverted,native);
 assert.deepEqual(convert(plantRank[0].mode,inverted,true),planted);
 const repeat=t=>t.reduce((s,p)=>s+p.slice(1).filter((x,i)=>x===p[i]).length,0);
 const n=128,prng=random(0x16273301),wrongOriginal=[],wrongPlant=[];
 for(let i=0;i<n;i++){
  const wrong=shuffle(grid,prng);
  wrongOriginal.push(stats(convert(originalBest.mode,original,false,wrong).slice(12),lp).meanLog);
  wrongPlant.push(stats(convert(plantedMode,planted,false,wrong),lp).meanLog);
 }
 const exceed=wrongOriginal.filter(x=>x>=originalBest.heldout.meanLog).length;
 const plantedScore=stats(native,lp);
 const abovePlant=wrongPlant.filter(x=>x>=plantedScore.meanLog).length;
 const report={
  source:"Unsolved original LP2 pages 0–2, 729 GP runes; candidate 27×27 source grid with retrospective root J(13,12)",
  inputRunes:12227,models:1024,
  fitted:"physical pages 3–14, 2874 runes, two complete sections",
  heldout:"physical pages 15–55, 9353 runes, five sections",
  nativeReference:plantedScore,
  original:{winner:originalBest,alternates:actualRank.slice(1,4),
   originalReencryptedExactly:12227,adjacentEqualOutputs:repeat(original),
   wrongSource:{shuffles:n,seed:"0x16273301",outperform:exceed,
    addOneUpperTail:(exceed+1)/(n+1),
    lowest:Math.min(...wrongOriginal),highest:Math.max(...wrongOriginal)},
   decodedFirst65:realClear.flat().slice(0,65).map(i=>GP.translit[i]).join(" ")},
  positive:{trueMode:plantedMode,actualTrainingRank:1,
   correctPlaintextRunes:inverted.flat().filter((x,i)=>x===native.flat()[i]).length,
   total:12227,doublets:repeat(planted),wrongSource:{shuffles:n,outperform:abovePlant,
    addOneUpperTail:(abovePlant+1)/(n+1)}},
  conclusion:"No recovered LP2 plaintext or authenticated original cipher key; the declared finite source-guided walker fails a strong prospective original heldout."
 };
 assert.ok(originalBest.heldout.meanLog < -3.8);
 assert.equal(report.positive.correctPlaintextRunes,12227);
 process.stdout.write(JSON.stringify(report,null,2)+"\n");
 return report;
}
if(require.main===module)run();
module.exports={encode,model,advance,convert,stats,variants,rank,reshape,run};
