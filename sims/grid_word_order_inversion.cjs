"use strict";
/**
 * Eight original LP2 base60 grid columns as *whole-word permutation keys*.
 *
 * Direct GP-pad uses of these keys have been tested elsewhere. This distinct
 * inversion checks a sectionwise Fisher-Yates shuffle driven by AES-256-CTR
 * or ChaCha20. Word length order is observable without recovering any rune.
 *
 * Node.js 22, CommonJS, no network or dependencies.
 * Reproduce: node sims/grid_word_order_inversion.cjs
 */
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {englishWords,runeLength}=require("./wordlength_crib_scan.js");
const {manuscriptBodies,generator,fisherYates}=require("./wordlength_seeded_shuffle.cjs");
const read=relative=>fs.readFileSync(path.join(__dirname,"..",relative),"utf8");
const CATS=5;
const BINS=[1,2,4,6,Infinity];
const SETTINGS=[];
for(const algo of ["aes-256-ctr","chacha20"])
for(const reverseKey of [false,true])
for(const wordEndian of ["BE","LE"])
for(const inverse of [false,true])
  SETTINGS.push({algo,reverseKey,wordEndian,inverse});

/** @param {number} n @returns {number} */
function bin(n){return n<=1?0:n<=2?1:n<=4?2:n<=6?3:4;}

/**
 * Odds of adjacent word lengths under an independent previously unseen
 * Shakespeare-language source. A common class's frequency is divided out.
 */
function languageModel(){
  const words=englishWords(read("resources/control/shakespeare_first300k.txt"));
  const cut=Math.floor(words.length*0.8);
  const len=words.slice(0,cut).map(w=>bin(runeLength(w)));
  const counts=Array.from({length:CATS},()=>Array(CATS).fill(0));
  const marg=new Float64Array(CATS);
  for(let i=0;i<len.length;i++){
    marg[len[i]]++;
    if(i)counts[len[i-1]][len[i]]++;
  }
  const n=counts.flat().reduce((a,b)=>a+b,0),total=marg.reduce((a,b)=>a+b,0);
  const ratios=counts.map((r,i)=>r.map((v,j)=>{
    const cond=(v+0.5)/(r.reduce((a,b)=>a+b,0)+CATS*0.5);
    const independent=(marg[j]+0.5)/(total+CATS*0.5);
    return Math.log(cond/independent);
  }));
  return {ratios,heldout:words.slice(cut).map(runeLength),
    trainingWords:cut,weights:ratios.map(r=>r.map(x=>Number(x.toFixed(5))))};
}

/** @returns {Buffer[]} Eight authentic 32-byte vertical keys. */
function originalKeys(){
  const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
  assert.equal(grid.byte_rows.length,32);
  assert.ok(grid.byte_rows.every(row=>row.length===8));
  const bytes=Buffer.from(grid.byte_rows.flat());
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  return Array.from({length:8},(_,col)=>Buffer.from(grid.byte_rows.map(row=>row[col])));
}

/**
 * Generates a deterministic Fisher-Yates ordering from section-key stream.
 * Four bytes per rejection-free random draw, reduced modulo available slots.
 * The modulo bias is tiny and explicitly part of this candidate cipher.
 *
 * @param {number} n @param {Buffer} key @param {object} mode
 * @returns {Int32Array}
 */
function cipherPermutation(n,key,mode){
  const k=mode.reverseKey?Buffer.from(key).reverse():key;
  const cipher=crypto.createCipheriv(mode.algo,k,Buffer.alloc(16));
  const stream=Buffer.concat([cipher.update(Buffer.alloc((n-1)*4)),cipher.final()]);
  let offset=0;
  const next=()=>{
    const value=mode.wordEndian==="LE"?stream.readUInt32LE(offset):stream.readUInt32BE(offset);
    offset+=4;
    return value;
  };
  const perm=fisherYates(n,next);
  assert.equal(offset,(n-1)*4);
  return perm;
}

/**
 * Applying inverse=false interprets the observed word in slot i as source
 * word perm[i]. inverse=true tests the other natural reading direction.
 * @param {number[]} observed @param {Int32Array} perm @param {boolean} inverse
 */
function restored(observed,perm,inverse){
  const result=new Int32Array(observed.length);
  if(!inverse){
    for(let i=0;i<perm.length;i++)result[perm[i]]=observed[i];
  }else{
    for(let i=0;i<perm.length;i++)result[i]=observed[perm[i]];
  }
  return result;
}

/** @param {number[]} lengths @param {number[][]} ratios */
function orderScore(lengths,ratios){
  let score=0;
  for(let i=1;i<lengths.length;i++)
    score+=ratios[bin(lengths[i-1])][bin(lengths[i])];
  return score;
}

/** @param {Buffer[]} keys @param {number[][]} bodies @param {object} setting @param {number[][]} ratios */
function scoreMatrix(keys,bodies,setting,ratios){
  return bodies.map(arr=>keys.map(k=>{
    const perm=cipherPermutation(arr.length,k,setting);
    return orderScore(restored(arr,perm,setting.inverse),ratios);
  }));
}

/** Exact maximization over 8! distinct key-to-section assignments. */
function matchColumns(matrix){
  const dp=new Float64Array(256).fill(-Infinity),prev=new Int16Array(256).fill(-1),choices=new Int8Array(256);
  dp[0]=0;
  for(let mask=0;mask<256;mask++){
    if(dp[mask]===-Infinity)continue;
    let row=0;for(let b=0;b<8;b++)row+=(mask>>b)&1;
    if(row===8)continue;
    for(let c=0;c<8;c++){
      const bit=1<<c;
      if(mask&bit)continue;
      const next=mask|bit, value=dp[mask]+matrix[row][c];
      if(value>dp[next]){
        dp[next]=value;prev[next]=mask;choices[next]=c;
      }
    }
  }
  assert.equal(Number.isFinite(dp[255]),true);
  const columns=new Array(8);
  let mask=255;
  for(let i=7;i>=0;i--){columns[i]=choices[mask];mask=prev[mask];}
  assert.equal(mask,0);
  return {score:dp[255],columns};
}

/** @param {Buffer[]} keys @param {number[][]} bodies @param {number[][]} ratios */
function search(keys,bodies,ratios){
  let best={score:-Infinity};
  const options=[];
  for(const setting of SETTINGS){
    const matrix=scoreMatrix(keys,bodies,setting,ratios);
    const match=matchColumns(matrix);
    options.push({...setting,...match});
    if(match.score>best.score)best={...setting,...match};
  }
  return {best,settings:options.length,top:options.sort((a,b)=>b.score-a.score).slice(0,5)};
}

/** @param {Buffer[]} keys @param {number[][]} bodies @param {number[][]} ratios */
function calibratedNull(keys,bodies,ratios){
  const next=generator(0x3704a6d,"xorshift");
  const maxima=[];
  for(let t=0;t<64;t++){
    const randomized=keys.map(k=>{
      const a=Buffer.from(k);
      for(let i=a.length-1;i>0;i--){
        const j=next()%(i+1),old=a[i];
        a[i]=a[j];a[j]=old;
      }
      return a;
    });
    maxima.push(search(randomized,bodies,ratios).best.score);
  }
  maxima.sort((a,b)=>a-b);
  return {trials:64,seed:"0x3704a6d",median:maxima[32],
    minimum:maxima[0],maximum:maxima[63],maxima};
}

/** @param {number[][]} bodies @param {Buffer[]} keys @param {number[][]} ratios @param {number[]} tail @param {number} pad */
function planted(bodies,keys,ratios,tail,pad){
  const n=bodies.reduce((s,g)=>s+g.length,0);
  assert.ok(tail.length>=n);
  const random=generator(0x3701c51,"xorshift");
  let cursor=0;
  const source=bodies.map(g=>Array.from({length:g.length},()=>{
    const l=tail[cursor++];
    return l+Number((random()/4294967296)<pad);
  }));
  const trueColumns=[6,2,4,0,1,7,5,3];
  const trueMode=SETTINGS.find(m=>m.algo==="aes-256-ctr"&&!m.reverseKey&&m.wordEndian==="BE"&&!m.inverse);
  const ciphered=source.map((plain,g)=>{
    const perm=cipherPermutation(plain.length,keys[trueColumns[g]],trueMode);
    return Array.from(perm,i=>plain[i]);
  });
  const result=search(keys,ciphered,ratios);
  const unshuffled=source.reduce((s,g)=>s+orderScore(g,ratios),0);
  return {paddingProbability:pad,trueColumns,sourceScore:unshuffled,
    cipherScore:ciphered.reduce((s,g)=>s+orderScore(g,ratios),0),
    selected:result.best,
    keyFamilyRecovered:result.best.algo===trueMode.algo &&
      result.best.reverseKey===false&&result.best.wordEndian==="BE"&&!result.best.inverse,
    assignmentRecovered:result.best.columns.every((x,i)=>x===trueColumns[i])};
}

function main(){
  const model=languageModel(), keys=originalKeys(), bodies=manuscriptBodies();
  assert.equal(bodies.reduce((s,g)=>s+g.length,0),2875);
  const baseline=bodies.reduce((s,g)=>s+orderScore(g,model.ratios),0);
  const actual=search(keys,bodies,model.ratios);
  const controls=[planted(bodies,keys,model.ratios,model.heldout,0),
    planted(bodies,keys,model.ratios,model.heldout,0.45)];
  const nulls=calibratedNull(keys,bodies,model.ratios);
  const exceed=nulls.maxima.filter(x=>x>=actual.best.score).length;
  const out={model:"grid-column AES/ChaCha Fisher-Yates inversion of preserved rune-word lengths",
    trainingWords:model.trainingWords,weightMatrix:model.weights,
    bodyLengths:bodies.map(g=>g.length),baselineOriginalScore:baseline,
    original:actual,controls,
    gridShuffledNull:{...nulls,exceed,upperTail:(exceed+1)/(nulls.trials+1)},
    caveat:"Source-specific word-order hypothesis; statistical recovery does not establish decrypted rune plaintext."};
  process.stdout.write(JSON.stringify(out,null,2)+"\n");
}
if(require.main===module)main();
module.exports={languageModel,originalKeys,cipherPermutation,restored,orderScore,
  scoreMatrix,matchColumns,search,calibratedNull,planted};
