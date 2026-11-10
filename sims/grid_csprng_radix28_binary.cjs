'use strict';
/**
 * Recover a fixed-width binary payload beneath a predecessor-excluding GP28
 * output map and a source-grid-derived AES/ChaCha key stream.
 *
 * For each nonrepeated C after the previous published rune, invert either
 * sorted 28-rank or cyclic 28-rank; subtract a source grid cipher keystream
 * modulo28. In the correct model, each five consecutive digits encodes a
 * three-byte integer in [0,2^24). Byte overflows are a necessary contradiction
 * for this exact binary representation and do not depend on English spelling.
 *
 * Source: original 32x8 numeric grid, original 55 LP2 ciphertext pages.
 * No original data is altered. Train on first400 rank digits per text section,
 * freeze source keys and settings, hold out digits400..700.
 *
 * Reproduction: node sims/grid_csprng_radix28_binary.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} filename */
const read=filename=>fs.readFileSync(path.join(ROOT,filename),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const PAGE=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(PAGE.length,55);
const FLAT=PAGE.flatMap(p=>p.indices);
assert.equal(FLAT.length,12956);
const LENGTHS=[729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(LENGTHS.reduce((a,b)=>a+b,0),FLAT.length);
let offset=0;
const SECTIONS=LENGTHS.map(length=>{
  const result=FLAT.slice(offset,offset+length);
  offset+=length;return result;
});
const ROW=source.byte_rows;
assert.equal(ROW.length,32);
assert.ok(ROW.every(r=>r.length===8));
const KEYS={
  columns:Array.from({length:8},(_,i)=>Buffer.from(ROW.map(r=>r[i]))),
  rowchunks:Array.from({length:8},(_,i)=>Buffer.from(ROW.flat().slice(32*i,32*(i+1))))
};
const ALG=['aes-256-ctr','aes-256-ofb','chacha20'];
const MAP=['mod','scale'];
const DROPS=[0,256];
const SIGN=[-1,1];
const RANK=['sorted','cyclic'];
const PHASE=[0,1,2,3,4];
const TRAIN=400, END=700, CAP=2**24;

/**
 * Extract exact source-key-derived 28-way pad.
 * @param {Buffer} key
 * @param {string} cipherName
 * @param {string} map
 * @param {number} drop
 */
function pad(key,cipherName,map,drop) {
  const cipher=crypto.createCipheriv(cipherName,key,Buffer.alloc(16));
  const raw=Buffer.concat([cipher.update(Buffer.alloc(1500)),cipher.final()]);
  return Uint8Array.from(raw.subarray(drop),
    b=>map==='scale'?Math.floor(b*28/256):b%28);
}
/** @param {number[]} code @param {string} mode */
function inverseRank(code,mode) {
  const result=[];
  for(let i=1;i<code.length;i++){
    const c=code[i],prev=code[i-1];
    if(c===prev)continue;
    result.push(mode==='sorted'?c-Number(c>prev):(c-prev+28)%29);
  }
  return result;
}
/**
 * Return number of exactly impossible 3-byte codewords. This cannot
 * prove plaintext: correct arbitrary byte streams need a positive payload.
 * @param {number[]} ranks
 * @param {Uint8Array} key
 * @param {number} sign
 * @param {number} phase
 * @param {number} begin
 * @param {number} end
 * @returns {{overflow:number,blocks:number}}
 */
function capacity(ranks,key,sign,phase,begin,end) {
  let invalid=0,blocks=0;
  for(let i=phase;i+5<=Math.min(ranks.length,end);i+=5) {
    if(i<begin)continue;
    let n=0;
    for(let j=0;j<5;j++){
      const digit=(ranks[i+j]-sign*key[i+j]+56)%28;
      n=n*28+digit;
    }
    invalid+=+(n>=CAP);
    blocks++;
  }
  return {overflow:invalid,blocks};
}
/**
 * Exact 8-key one-to-one assignment.
 * @param {number[][]} scores
 * @returns {{cost:number,assignment:number[]}}
 */
function assign(scores){
  const cost=Float64Array.from({length:256},()=>Infinity);
  const previous=new Int16Array(256).fill(-1);
  const chosen=new Int8Array(256).fill(-1);
  cost[0]=0;
  for(let mask=0;mask<256;mask++){
    const row=mask.toString(2).replace(/0/g,'').length;
    if(row>=8||!Number.isFinite(cost[mask]))continue;
    for(let j=0;j<8;j++){
      if(mask&(1<<j))continue;
      const m=mask|(1<<j),s=cost[mask]+scores[row][j];
      if(s<cost[m]){cost[m]=s;chosen[m]=j;previous[m]=mask;}
    }
  }
  const assignment=new Array(8);let mask=255;
  for(let row=7;row>=0;row--){assignment[row]=chosen[mask];mask=previous[mask];}
  assert.equal(mask,0);
  return {cost:cost[255],assignment};
}
/** @param {number[][]} ciphertext */
function scan(ciphertext) {
  const mapped=Object.fromEntries(RANK.map(m=>[m,ciphertext.map(x=>inverseRank(x,m))]));
  assert.ok(Object.values(mapped).every(all=>all.every(r=>r.length>=END)));
  const candidates=[];
  for(const [layout,keys] of Object.entries(KEYS))
  for(const algo of ALG)for(const map of MAP)for(const drop of DROPS) {
    const keyPads=keys.map(k=>pad(k,algo,map,drop));
    for(const sign of SIGN)for(const rank of RANK)for(const phase of PHASE) {
      const matrix=mapped[rank].map(r=>keyPads.map(k=>capacity(r,k,sign,phase,0,TRAIN).overflow));
      const fitted=assign(matrix);
      let held=0,blocks=0;
      for(let section=0;section<8;section++){
        const s=capacity(mapped[rank][section],keyPads[fitted.assignment[section]],
          sign,phase,TRAIN,END);
        held+=s.overflow;blocks+=s.blocks;
      }
      candidates.push({layout,algo,map,drop,sign,rank,phase,
        trainOverflows:fitted.cost,trainBlocks:8*Math.floor((TRAIN-phase)/5),
        heldOverflows:held,heldBlocks:blocks,assignment:fitted.assignment});
    }
  }
  candidates.sort((a,b)=>a.trainOverflows-b.trainOverflows||
    a.heldOverflows-b.heldOverflows);
  return candidates;
}
/** @param {number[]} bytes */
function packBytes(bytes) {
  assert.equal(bytes.length%3,0);
  const digits=[];
  for(let i=0;i<bytes.length;i+=3){
    let n=bytes[i]*65536+bytes[i+1]*256+bytes[i+2];
    const block=[0,0,0,0,0];
    for(let j=4;j>=0;j--){block[j]=n%28;n=Math.floor(n/28);}
    assert.equal(n,0);
    digits.push(...block);
  }
  return digits;
}
/**
 * Recover the exact candidate binary bytes when every radix28 block is
 * a legal 24-bit integer; invalid codewords are retained only for counting.
 * @param {number[]} ranks
 * @param {Uint8Array} key
 * @param {number} sign
 * @returns {{bytes:Buffer,invalid:number}}
 */
function recoverBytes(ranks,key,sign){
  const bytes=Buffer.alloc(Math.floor(ranks.length/5)*3);
  let invalid=0;
  for(let i=0,j=0;i+5<=ranks.length;i+=5,j+=3){
    let n=0;
    for(let t=0;t<5;t++)n=n*28+
      (ranks[i+t]-sign*key[i+t]+56)%28;
    invalid+=+(n>=CAP);
    bytes[j]=(n>>16)&255;
    bytes[j+1]=(n>>8)&255;
    bytes[j+2]=n&255;
  }
  return {bytes,invalid};
}
/**
 * Construct byte-for-byte positive control with actual grid AES-CTR keys.
 * Each section begins with complete gzip bytes, then deterministic filler.
 * @returns {{ciphertext:number[][],bytes:Buffer[]}}
 */
function plant(){
  const gz=zlib.gzipSync(Buffer.from(
    'CICADA LIBER PRIMUS BINARY SOURCE-KEY CONTROL. '.repeat(8)),{mtime:0});
  const output=[],plainBytes=[];
  for(let section=0;section<8;section++){
    const n=LENGTHS[section]-1;
    const bytes=Buffer.alloc(Math.ceil(n/5)*3);
    let x=(0x23279911+section*0x100011)>>>0;
    for(let j=0;j<bytes.length;j++){
      x^=x<<13;x^=x>>>17;x^=x<<5;bytes[j]=x&255;
    }
    gz.copy(bytes,0);plainBytes.push(bytes);
    const digits=packBytes(bytes);
    const key=pad(KEYS.columns[section],'aes-256-ctr','mod',0);
    const encrypted=[8];
    for(let j=0;j<n;j++){
      const r=(digits[j]+key[j])%28,prev=encrypted.at(-1);
      encrypted.push(r<prev?r:r+1);
    }
    output.push(encrypted);
  }
  return {ciphertext:output,bytes:plainBytes};
}
const synthetic=plant();
const exactRecovered=synthetic.ciphertext.map((section,i)=>{
  const ranks=inverseRank(section,'sorted');
  const recovered=recoverBytes(ranks,
    pad(KEYS.columns[i],'aes-256-ctr','mod',0),1);
  assert.equal(recovered.invalid,0);
  assert.deepEqual(recovered.bytes,
    synthetic.bytes[i].subarray(0,recovered.bytes.length));
  return recovered.bytes.length;
});
const positives=scan(synthetic.ciphertext),actual=scan(SECTIONS);
const rank=positives.findIndex(x=>x.layout==='columns'&&x.algo==='aes-256-ctr'&&
  x.map==='mod'&&x.drop===0&&x.sign===1&&x.rank==='sorted'&&x.phase===0)+1;
const truth=positives[rank-1];
assert.ok(rank>0);
assert.equal(truth.trainOverflows,0);
assert.equal(truth.heldOverflows,0);
assert.deepEqual(truth.assignment,[0,1,2,3,4,5,6,7]);
assert.equal(actual.length,480);
assert.equal(positives.length,480);
console.log(JSON.stringify({
  scope:{originalRunePages:PAGE.length,originalRuneCount:FLAT.length,
    sectionLengths:LENGTHS,rankPolicy:'first rune context, subsequent equal output erased',
    candidateModels:480,fitRankDigits:[0,TRAIN],holdoutRankDigits:[TRAIN,END],
    test:'5 x radix28 digits represent an exact unsigned 24-bit integer',
    source:'original grid 8 x 32-byte AES/ChaCha keys',
    limitations:'direct grid stream key, zero nonce, source-order section restarts; no hidden KDF/variable widths'},
  positive:{trueCandidateRank:rank,trueCandidate:truth,best:positives.slice(0,3),
    firstSourceBytes:synthetic.bytes[0].subarray(0,8).toString('hex'),
    exactByteRecovery:exactRecovered.reduce((a,b)=>a+b,0)},
  original:{top:actual.slice(0,8),zeroTraining:actual.filter(x=>x.trainOverflows===0).length,
    zeroHeldout:actual.filter(x=>x.heldOverflows===0).length,
    zeroBoth:actual.filter(x=>x.heldOverflows===0&&x.trainOverflows===0).length},
},null,2));
