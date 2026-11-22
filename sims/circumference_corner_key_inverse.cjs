"use strict";
/**
 * Original source hypothesis: solved LP2 PARABLE says "shed our own
 * circumferences". The 32x8 base60 grid has exactly four rectangular rings,
 * contributing 4*4=16 corners (128-bit key); a 16x16 reshape has eight
 * square rings, contributing 8*4=32 corners (256-bit key).
 *
 * Tests raw and SHA256 ring-corner keys against ALL 12,956 original runes,
 * with both direct GP29 and invertible EA-zero/GP28 predecessor transitions.
 * No key bytes are optimized on the original ciphertext.
 * Node.js 22 CJS. Reproduce: node sims/circumference_corner_key_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createCipheriv,createHash}=require("node:crypto");
const {encode}=require("./grid_keyskip_viterbi.cjs");
const {powers,logs}=require("./ea_zero_step_reversible.cjs");
const ROOT=path.resolve(__dirname,"..");
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const GRID=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const PAGES=GP.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
const N=12956, MOD=29;
assert.equal(PAGES.length,55);
assert.equal(PAGES.reduce((n,p)=>n+p.indices.length,0),N);
const CIPHER=PAGES.flatMap(p=>p.indices);
const PSTART=new Set(), SPLIT=PAGES.slice(0,28).reduce((n,p)=>n+p.indices.length,0);
for(let p=0,at=0;p<PAGES.length;p++){PSTART.add(at);at+=PAGES[p].indices.length;}
assert.ok(SPLIT>6000&&SPLIT<7500);
const mod=(x,n)=>(x%n+n)%n;

/**
 * Four corners from each rectangular ring, TL/TR/BR/BL.
 * @param {Buffer} input
 * @param {number} rows
 * @param {number} columns
 */
function corners(input,rows,columns){
  assert.equal(input.length,rows*columns);
  const output=[];
  for(let ring=0;ring<Math.min(rows,columns)/2;ring++){
    const r=ring,c=ring;
    output.push([input[r*columns+c],
      input[r*columns+columns-1-c],
      input[(rows-1-r)*columns+columns-1-c],
      input[(rows-1-r)*columns+c]]);
  }
  return output;
}
/** @returns {Array<{name:string,key:Buffer}>} */
function keys(){
  const raw=Buffer.from(GRID.bytes);
  assert.equal(raw.length,256);
  const shapes=[
    {name:"original-32x8",data:raw,rows:32,columns:8},
    {name:"reshaped-16x16",data:raw,rows:16,columns:16},
    {name:"column-reordered-16x16",
      data:Buffer.from(Array.from({length:256},(_,i)=>raw[(i%16)*16+Math.floor(i/16)])),
      rows:16,columns:16}
  ];
  const out=[];
  for(const s of shapes){
    const rings=corners(s.data,s.rows,s.columns);
    assert.equal(rings.length,s.name==="original-32x8"?4:8);
    for(const reverse of [false,true])
      for(const clockwise of [true,false])
        for(let phase=0;phase<4;phase++){
          const selected=reverse?rings.slice().reverse():rings;
          const key=Buffer.from(selected.flatMap(r=>
            Array.from({length:4},(_,i)=>r[mod(phase+(clockwise?i:-i),4)])));
          assert.equal(key.length,s.name==="original-32x8"?16:32);
          out.push({name:[s.name,reverse?"inside-out":"outside-in",
            clockwise?"clockwise":"anticlockwise","corner"+phase].join(":"),key});
        }
  }
  assert.equal(out.length,48);
  return out;
}
/** @param {{name:string,key:Buffer}} seed */
function streamModes(seed){
  if(seed.key.length===16){
    const hash=createHash("sha256").update(seed.key).digest();
    return [{name:seed.name+":AES128",key:seed.key,algorithm:"aes-128-ctr"},
      {name:seed.name+":SHA256-AES256",key:hash,algorithm:"aes-256-ctr"},
      {name:seed.name+":SHA256-ChaCha",key:hash,algorithm:"chacha20"}];
  }
  return [{name:seed.name+":AES256",key:seed.key,algorithm:"aes-256-ctr"},
    {name:seed.name+":first16-AES128",key:seed.key.subarray(0,16),algorithm:"aes-128-ctr"},
    {name:seed.name+":ChaCha",key:seed.key,algorithm:"chacha20"}];
}
/**
 * @param {Buffer} key 
 * @param {string} algorithm 
 * @param {number} len
 */
function stream(key,algorithm,len){
  const iv=Buffer.alloc(16);
  const enc=createCipheriv(algorithm,key,iv);
  return Buffer.concat([enc.update(Buffer.alloc(len)),enc.final()]);
}
/**
 * Plaintext GP decode (reversible) using original page-start flags.
 * @param {number[]} c Complete GP ciphertext register.
 * @param {Buffer} s Known-source pseudorandom mask, N+256 bytes.
 * @param {{sign:number,scaled:boolean,reset:boolean,drop:number,step28:boolean}} mode
 */
function decode(c,s,mode){
  const output=new Array(N);
  let pointer=mode.drop,prev=0;
  for(let i=0;i<N;i++){
    if(mode.reset&&PSTART.has(i))pointer=mode.drop;
    const x=s[pointer++];
    const byte29=mode.scaled?Math.floor(29*x/256):x%29;
    if(mode.step28&&!PSTART.has(i)){
      const d=mod(c[i]-prev,29);
      if(d===0&&mode.skipEA)pointer--;
      const byte28=mode.scaled?Math.floor(28*x/256):x%28;
      output[i]=d===0?28:mod(logs[d]+mode.sign*byte28,28);
    } else output[i]=mod(c[i]+mode.sign*byte29,29);
    prev=c[i];
  }
  return output;
}
/**
 * Forward operation used by the independent known-key plant.
 * @param {number[]} plain GP source, N symbols.
 * @param {Buffer} s N+256 cryptographic stream.
 * @param {{sign:number,scaled:boolean,reset:boolean,drop:number,step28:boolean}} mode
 */
function encodePlain(plain,s,mode){
  const c=new Array(N);
  let pointer=mode.drop,previous=0;
  for(let i=0;i<N;i++){
    if(mode.reset&&PSTART.has(i))pointer=mode.drop;
    const x=s[pointer++];
    const byte29=mode.scaled?Math.floor(29*x/256):x%29;
    const byte28=mode.scaled?Math.floor(28*x/256):x%28;
    if(mode.step28&&!PSTART.has(i)){
      if(plain[i]===28){c[i]=previous;if(mode.skipEA)pointer--;}
      else c[i]=mod(previous+powers[mod(plain[i]-mode.sign*byte28,28)],29);
    } else c[i]=mod(plain[i]-mode.sign*byte29,29);
    previous=c[i];
  }
  return c;
}
/** @param {number[]} plain @param {boolean} step28 */
function score(plain,step28){
  const a=new Uint32Array(step28?28:29);
  let train=0,hold=0;
  for(let i=0;i<N;i++){
    if(step28&&(plain[i]===28||PSTART.has(i)))continue;
    const v=plain[i];
    if(i<SPLIT){a[v]++;train++;}
  }
  let t=0;for(const f of a)t+=f*(f-1);
  const tr=t/(train*(train-1));
  a.fill(0);
  for(let i=SPLIT;i<N;i++){
    if(step28&&(plain[i]===28||PSTART.has(i)))continue;
    a[plain[i]]++;hold++;
  }
  let h=0;for(const f of a)h+=f*(f-1);
  return {train:tr,heldout:h/(hold*(hold-1))};
}
function run(){
  const cfg=[];
  for(const seed of keys())for(const candidate of streamModes(seed)){
    const pad=stream(candidate.key,candidate.algorithm,N+256);
    for(const sign of [-1,1])
      for(const scaled of [false,true])
        for(const reset of [false,true])
          for(const drop of [0,256])
            for(const step28 of [false,true])
              for(const skipEA of step28?[false,true]:[false]){
                const mode={sign,scaled,reset,drop,step28,skipEA};
                const plain=decode(CIPHER,pad,mode);
                cfg.push({name:candidate.name,algorithm:candidate.algorithm,mode,
                  ...score(plain,step28)});
              }
  }
  assert.equal(cfg.length,48*3*2*2*2*2*3);
  cfg.sort((a,b)=>b.train-a.train);
  const planted=cfg.find(m=>m.name===keys()[0].name+":AES128"&&
    m.mode.sign===-1&&!m.mode.scaled&&!m.mode.reset&&m.mode.drop===0&&m.mode.step28&&!m.mode.skipEA);
  assert.ok(planted);
  const ref=fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"),"utf8");
  const plain=encode(ref.slice(160000)).slice(0,N);
  assert.equal(plain.length,N);
  const seed=keys()[0];
  const fakePad=stream(seed.key,"aes-128-ctr",N+256);
  const fwd=encodePlain(plain,fakePad,planted.mode);
  const reversed=decode(fwd,fakePad,planted.mode);
  assert.deepEqual(reversed,plain);
  const skipMode={...planted.mode,skipEA:true};
  const skipCipher=encodePlain(plain,fakePad,skipMode);
  assert.deepEqual(decode(skipCipher,fakePad,skipMode),plain);
  const allKeys=keys();
  const summary={
    sourceKeyRings:{physical:4,square:8,keySizes:[16,32],sourceKeys:allKeys.length},
    fullGPSource:{pages:PAGES.length,runes:N,firstHalf:SPLIT,lastHalf:N-SPLIT},
    tested:cfg.length, original:{
      bestTrain:cfg.slice(0,10),
      bestTrainFrozenHeldout:cfg[0].heldout,
      bestHeldoutRetrospective:Math.max(...cfg.map(v=>v.heldout)),
      originalDirectIoC:score(CIPHER,false)
    },
    positive:{source:"heldout Shakespeare GP text",
      fullReencryptMatches:true,transparentKeyskipAlsoExact:true,fullRunesRecovered:N,
      knownKey:planted.name,knownKeyMode:planted.mode,
      recoveredIoC:score(reversed,true)},
    note:"Evidence gate: no key without source-native GP English on untouched data."
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={corners,keys,decode,encodePlain,score,run};
