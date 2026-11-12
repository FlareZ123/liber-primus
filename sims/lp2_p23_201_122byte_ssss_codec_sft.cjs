"use strict";
/**
 * Exact GP29 anti-repeat enumerative codec and historical SSSS 0.5 inverse
 * on the five contiguous 201-rune LP2 p23–26 strands.
 *
 * This is a candidate binary share register, not an authenticated Cicada
 * codec or decryption. The maximal k=7 adjacent equal transitions is fixed
 * by the historical 122-byte field capacity, before examining shares.
 *
 * Run: node sims/lp2_p23_201_122byte_ssss_codec_sft.cjs
 * @module lp2_p23_201_122byte_ssss_codec_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const GP=29, STEPS=200, LIMIT=7, FIELD_BYTES=122;
const MAX=1n<<976n;
/** S(m,k): count of m successor GP29 differences with at most k zeros. */
const S=Array.from({length:STEPS+1},()=>Array(LIMIT+1).fill(0n));
for(let k=0;k<=LIMIT;k++)S[0][k]=1n;
for(let m=1;m<=STEPS;m++)for(let k=0;k<=LIMIT;k++)
  S[m][k]=28n*S[m-1][k]+(k?S[m-1][k-1]:0n);
const TOTAL=29n*S[STEPS][LIMIT];
assert.ok(TOTAL<=MAX);

/**
 * Injective lexicographic rank over all 201-rune streams with <=7 repeats.
 * @param {number[]} rune
 * @returns {{value:bigint,repeatCount:number}}
 */
function pack(rune){
  assert.equal(rune.length,201);
  let prev=rune[0],zeros=0;
  assert.ok(Number.isInteger(prev)&&prev>=0&&prev<GP);
  let v=BigInt(prev)*S[STEPS][LIMIT];
  for(let i=1;i<rune.length;i++){
    const next=rune[i];
    assert.ok(Number.isInteger(next)&&next>=0&&next<GP);
    const d=(next-prev+GP)%GP;
    const remaining=rune.length-i-1;
    for(let q=0;q<d;q++){
      const nextZeros=zeros+(q===0?1:0);
      if(nextZeros<=LIMIT)
        v+=S[remaining][LIMIT-nextZeros];
    }
    if(d===0)zeros++;
    prev=next;
  }
  assert.ok(zeros<=LIMIT,"more than seven adjacent repeats");
  assert.ok(v<TOTAL&&v<MAX);
  return {value:v,repeatCount:zeros};
}

/** Exact inverse of pack, for any rank 0..TOTAL-1.
 * @param {bigint} number
 * @returns {number[]}
 */
function unpack(number){
  assert.ok(number>=0n&&number<TOTAL);
  let prev=Number(number/S[STEPS][LIMIT]);
  let rest=number%S[STEPS][LIMIT],zeros=0;
  const out=[prev];
  for(let i=1;i<=STEPS;i++){
    const remaining=STEPS-i;
    let chosen=-1;
    for(let d=0;d<GP;d++){
      const zz=zeros+(d===0?1:0);
      const count=zz<=LIMIT?S[remaining][LIMIT-zz]:0n;
      if(rest>=count){rest-=count;continue;}
      chosen=d;zeros=zz;break;
    }
    assert.ok(chosen>=0);
    prev=(prev+chosen)%GP;
    out.push(prev);
  }
  assert.equal(rest,0n);
  return out;
}

/**
 * Source SSSS GF(2^m), with polynomial x^m+sum(x^tap)+1.
 * @param {number} degree @param {number[]} taps
 */
function gf(degree,taps){
  const top=1n<<BigInt(degree);
  const poly=taps.reduce((p,k)=>p|(1n<<BigInt(k)),top|1n);
  /** @param {bigint} x @param {bigint} y */
  function mul(x,y){
    let z=0n;
    while(y){
      if(y&1n)z^=x;
      y>>=1n;
      x<<=1n;
      if(x&top)x^=poly;
    }
    return z;
  }
  /** @param {bigint} x */
  function inv(x){
    assert.notEqual(x,0n);
    let u=x,v=poly,a=1n,b=0n;
    while(u!==1n){
      assert.notEqual(u,0n);
      let shift=u.toString(2).length-v.toString(2).length;
      if(shift<0){
        [u,v]=[v,u];[a,b]=[b,a];shift=-shift;
      }
      u^=v<<BigInt(shift);
      a^=b<<BigInt(shift);
    }
    while(a>=top)a^=poly<<BigInt(a.toString(2).length-degree-1);
    return a;
  }
  /** @param {bigint} x @param {number} n */
  function pow(x,n){
    let v=1n;for(let i=0;i<n;i++)v=mul(v,x);
    return v;
  }
  /** @param {bigint[]} ids @param {bigint[]} ys */
  function restore(ids,ys){
    assert.equal(ids.length,5);
    assert.equal(new Set(ids.map(String)).size,5);
    let value=0n;
    for(let i=0;i<5;i++){
      let b=1n;
      for(let j=0;j<5;j++)if(j!==i)
        b=mul(b,mul(ids[j],inv(ids[i]^ids[j])));
      value^=mul(ys[i]^pow(ids[i],5),b);
    }
    return value;
  }
  /** @param {bigint[]} coefficients @param {bigint} id */
  function split(coefficients,id){
    let value=1n;
    for(let i=4;i>=0;i--)value=mul(value,id)^coefficients[i];
    return value;
  }
  return{mul,inv,restore,split};
}

/** @param {number} v0 @param {number} v1 */
function xteaDecrypt(v0,v1){
  const DELTA=0x9e3779b9;
  let total=0xc6ef3720;
  for(let i=0;i<32;i++){
    const m1=(((((v0<<4)^(v0>>>5))+v0)^total))>>>0;
    v1=(v1-m1)>>>0;
    total=(total-DELTA)>>>0;
    const m0=(((((v1<<4)^(v1>>>5))+v1)^total))>>>0;
    v0=(v0-m0)>>>0;
  }
  return[v0,v1];
}

/** Exact reverse SSSS 0.5 default XTEA diffusion, two-byte mpz words.
 * @param {bigint} encoded @param {number} byteLength */
function decodeDiffusion(encoded,byteLength){
  assert.equal(byteLength%2,0);
  const big=Buffer.from(encoded.toString(16).padStart(2*byteLength,"0"),"hex");
  assert.equal(big.length,byteLength);
  const work=Buffer.alloc(byteLength);
  for(let i=0;i<byteLength;i+=2){
    work[i]=big[byteLength-i-2];work[i+1]=big[byteLength-i-1];
  }
  for(let i=40*byteLength-2;i>=0;i-=2){
    const left=Buffer.from(Array.from({length:4},(_,k)=>work[(i+k)%byteLength]));
    const right=Buffer.from(Array.from({length:4},(_,k)=>work[(i+4+k)%byteLength]));
    const [v0,v1]=xteaDecrypt(left.readUInt32BE(0),right.readUInt32BE(0));
    const replacement=Buffer.alloc(8);
    replacement.writeUInt32BE(v0,0);replacement.writeUInt32BE(v1,4);
    for(let k=0;k<8;k++)work[(i+k)%byteLength]=replacement[k];
  }
  const output=Buffer.alloc(byteLength);
  for(let i=0;i<byteLength;i+=2){
    output[i]=work[byteLength-i-2];output[i+1]=work[byteLength-i-1];
  }
  return output;
}

/** Source-preserved 2013 historical threshold/reverse-diffusion control. */
function historicalControl(){
  const known=[
    [2n,0x41cc481a51fe77f91600f593c1db2ce9babd2626ea6en],
    [3n,0x7678a5f6b72042d839151b34b02ffe161cf997fed484n],
    [5n,0xfcd82965b6632ea25d80edc3e58baafb4b2938895cbdn],
    [7n,0xf3adb3aacb0b4336fa28178bc1e5edce940c16ce5caan],
    [8n,0xb970e507dbc4ac115a273126f62671654c480fce32e5n]
  ];
  const g=gf(176,[11,3,2]);
  const secret=g.restore(known.map(p=>p[0]),known.map(p=>p[1]));
  assert.equal(secret,0x65b9c4065cc47a4a48e01d17de166a94252dfbb44e69n);
  const plain=decodeDiffusion(secret,22);
  assert.equal(plain.toString("ascii"),"p7amjopgric7dfdi.onion");
  return plain.toString("ascii");
}

/** Wholly original ciphertext and exact decoder test. */
function main(){
  const c=JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp2-corpus.json"),"utf8"));
  const pages=c.pages.slice(23,27);
  assert.deepEqual(pages.map(p=>p.indices.length),[213,270,273,265]);
  const all=pages.flatMap(p=>p.indices);
  assert.deepEqual(all.slice(0,16),
    [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
  const body=all.slice(16);
  assert.equal(body.length,1005);
  const historicalOnion=historicalControl();
  const field=gf(976,[17,10,6]);
  assert.equal(field.mul(17n,field.inv(17n)),1n);
  const coeff=[1n,2n,3n,4n,5n];
  const ids=[2n,3n,5n,7n,8n];
  assert.equal(field.restore(ids,ids.map(x=>field.split(coeff,x))),1n);

  const continuous=Array.from({length:5},(_,j)=>body.slice(j*201,(j+1)*201));
  const interleaved=Array.from({length:5},(_,j)=>body.filter((_,i)=>i%5===j));
  const countRepeats=p=>p.slice(1).reduce((n,x,i)=>n+Number(x===p[i]),0);
  const contiguousCounts=continuous.map(countRepeats);
  const interleavedCounts=interleaved.map(countRepeats);
  assert.deepEqual(contiguousCounts,[1,4,3,2,1]);
  assert.deepEqual(interleavedCounts,[7,11,3,9,8]);
  const outcomes={};
  for(const [direction,reversed] of [["forward",false],["reverse",true]]){
    const p=continuous.map(l=>pack(reversed?[...l].reverse():l));
    for(let i=0;i<5;i++)assert.deepEqual(unpack(p[i].value),
      reversed?[...continuous[i]].reverse():continuous[i]);
    const encoded=field.restore(ids,p.map(v=>v.value));
    const decrypted=decodeDiffusion(encoded,FIELD_BYTES);
    let printable=0,gpBytes=0;
    for(const b of decrypted){
      printable+=Number((b>=32&&b<=126)||b===9||b===10||b===13);
      gpBytes+=Number(b<29);
    }
    outcomes[direction]={
      shareRepeatCounts:p.map(v=>v.repeatCount),
      sharesAllFit:true,plainBytes:decrypted.length,
      plaintextFirst32Hex:decrypted.subarray(0,32).toString("hex"),
      printableBytes:printable,gpIndexBytes:gpBytes,
      completePrintable:printable===FIELD_BYTES,
      completeGp:gpBytes===FIELD_BYTES
    };
  }
  assert.equal(outcomes.forward.plaintextFirst32Hex,
    "839dc666c476dd982cb521b25fe3c94494031769673e9f90cfe3f69100aa8297");
  assert.equal(outcomes.reverse.plaintextFirst32Hex,
    "f34c85f94532b8b77de2ccbbd37d920f6329a149224ca4cf38e9c145ace2dcc");
  const output={bodyRunes:1005,strandLength:201,
    compression:"enumerative GP29 predecessor differences with <=7 repeats",
    totalRankBitLength:TOTAL.toString(2).length,
    fieldBits:976,fieldBytes:122,
    contiguousCounts,interleavedCounts,
    interleavedEligible:interleavedCounts.map(k=>k<=LIMIT),
    historical2013OnionControl:historicalOnion,
    historicalShareIds:ids.map(String),
    outcomes,decision:"Lossless candidate packed shares; no native plaintext or recovered key"
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)main();
module.exports={pack,unpack,gf,decodeDiffusion,main};
