"use strict";
/**
 * LP1 p05 JPEG bytes selected at prime or totient index as a running
 * mod-29 LP2 pad. All safe sequence start offsets, byte directions,
 * two reducers and signs searched with skip-aware Viterbi controls.
 * Reproduce: node sims/mirror_jpeg_number_index.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {decode,encrypt,imageStreams}=require("./mirror_jpeg_pad.cjs");
const {headScore,exhaustive}=require("./mirror_jpeg_offsets.cjs");
const ROOT=path.resolve(__dirname,".."),HEAD=24,WINDOW=220;
/** @param {number} limit Exclusive upper bound. @returns {number[]} */
function primes(limit){
  const marked=new Uint8Array(limit),out=[];
  for(let i=2;i<limit;i++){
    if(marked[i])continue;
    out.push(i);
    if(i*i<limit)for(let j=i*i;j<limit;j+=i)marked[j]=1;
  }
  return out;
}
/** @param {number} n @returns {Uint32Array} */
function totients(n){
  const phi=Uint32Array.from({length:n+1},(_,i)=>i);
  for(let p=2;p<=n;p++)if(phi[p]===p)
    for(let i=p;i<=n;i+=p)phi[i]-=phi[i]/p;
  return phi;
}
/** @param {Uint8Array} bytes @param {string} name */
function indexedKeys(bytes,name){
  const pm=primes(bytes.length);
  const N=Math.min(40000,bytes.length-1),phi=totients(N);
  const modes=[
    {tag:"prime",key:Uint8Array.from(pm,i=>bytes[i])},
    {tag:"totient",key:Uint8Array.from(
      Array.from({length:N},(_,i)=>phi[i+1]),i=>bytes[i])}
  ];
  const out=[];
  for(const m of modes){
    out.push({name:name+":"+m.tag+":mod29",
      key:Uint8Array.from(m.key,b=>b%29)});
    out.push({name:name+":"+m.tag+":scaled29",
      key:Uint8Array.from(m.key,b=>Math.floor(b*29/256))});
  }
  return out;
}
function main(){
  const source=fs.readFileSync(path.join(ROOT,
    "resources","liber-primus","05.jpg"));
  const streams=imageStreams(source);
  const keys=streams.flatMap(s=>indexedKeys(s.bytes,s.name));
  assert.equal(keys.length,16);
  const lm=train(fs.readFileSync(path.join(ROOT,
    "resources","control","shakespeare_first300k.txt"),"utf8"));
  const data=JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources","liber-primus","lp2-corpus.json"),"utf8"));
  const cipher=data.pages.find(x=>x.page===0).indices.slice(0,WINDOW);
  assert.equal(cipher.length,WINDOW);
  const solved=fs.readFileSync(path.join(ROOT,
    "resources","liber-primus","lp1-plaintext-reference.txt"),"utf8");
  const plain=encode(solved.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
  assert.equal(plain.length,WINDOW);
  const controlKey=keys.find(x=>x.name==="whole-jpeg:prime:mod29").key;
  const plantedOffset=23000;
  assert.ok(new Set(controlKey.slice(plantedOffset,plantedOffset+WINDOW)).size>=27);
  const plant=encrypt(plain,controlKey,plantedOffset,1,0x3351c16a);
  const truth=headScore(plant.cipher.slice(0,HEAD),controlKey,plantedOffset,1,lm);
  let rank=1;
  for(let offset=0;offset<=controlKey.length-3*WINDOW;offset++){
    if(offset===plantedOffset)continue;
    if(headScore(plant.cipher.slice(0,HEAD),controlKey,offset,1,lm)>truth)rank++;
  }
  const recovered=decode(plant.cipher,controlKey,plantedOffset,1,lm);
  const exact=recovered.plain.filter((r,i)=>r===plain[i]).length;
  console.log("CONTROL",JSON.stringify({
    plantedOffset,rank,headScore:truth,padLength:controlKey.length,
    plantedSkips:plant.skips,decodedSkips:recovered.skips,
    recovered:exact,total:WINDOW
  }));
  assert.ok(exact>=Math.ceil(0.9*WINDOW));
  assert.ok(rank<=140);
  const result=exhaustive(cipher.slice(0,HEAD),keys,lm,140);
  const top=result.best.map(x=>{
    const key=keys.find(z=>z.name===x.name).key;
    const d=decode(cipher,key,x.offset,x.sign,lm);
    return {...x,fullScore:d.perRune,skips:d.skips,
      first40:d.plain.slice(0,40)};
  }).sort((a,b)=>b.fullScore-a.fullScore);
  console.log("FINAL",JSON.stringify({
    page:0,head:HEAD,full:WINDOW,checked:result.checked,
    topFull:top.slice(0,20),topHead:result.best.slice(0,20)
  }));
}
if(require.main===module)main();
module.exports={primes,totients,indexedKeys};
