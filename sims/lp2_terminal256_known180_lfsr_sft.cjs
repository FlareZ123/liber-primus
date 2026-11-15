"use strict";
/**
 * An original-cipher known-plaintext attack on the 32x8 LP2 numerical table.
 * Outer 76 cells are juxtaposed with unknown p55 (76 GP runes); interior 180
 * cells with solved p56+p57 (85+95 GP runes). Does a common binary LFSR
 * of at most 46 stages encode the byte/GP pair? This is an exact necessary
 * test, even if the LFSR restarts independently on every printed row.
 *
 * SFT: node sims/lp2_terminal256_known180_lfsr_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const json = name => JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const originalGrid = json("resources/liber-primus/lp2-grid-256.json");
const pages=corpus.pages.map(p=>p.indices);
assert.equal(originalGrid.bytes.length,256);
assert.equal(pages[55].length,76);
assert.equal(pages[57].length,95);
const p56text="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const gp=corpus.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
const known56=[];
for(const word of p56text.split(" ")){
  for(let i=0;i<word.length;){
    const found=gp.find(t=>word.startsWith(t.name,i));
    assert.ok(found,"Source p56 GP spelling must parse");
    known56.push(found.index);
    i+=found.name.length;
  }
}
assert.equal(known56.length,85);
const known=[...known56,...pages[57]];
assert.equal(known.length,180);
const inner=[];
for(let r=1;r<=30;r++)for(let c=1;c<=6;c++)inner.push(8*r+c);
assert.equal(inner.length,180);
const perimeter=[];
for(let c=0;c<8;c++)perimeter.push(c);
for(let r=1;r<31;r++)perimeter.push(8*r+7);
for(let c=7;c>=0;c--)perimeter.push(31*8+c);
for(let r=30;r>0;r--)perimeter.push(8*r);
assert.equal(perimeter.length,76);
assert.equal(new Set([...inner,...perimeter]).size,256);
/** @param {number} v @param {"index"|"prime"|"totient"} register */
function runeValue(v,register){
  return register==="index" ? v :
    register==="prime" ? corpus.prime[v] : corpus.prime[v]-1;
}
/** @param {number} b @param {number} u @param {"xor"|"minus"|"plus"} mode */
function unmask(b,u,mode){
  if(mode==="xor")return b^u;
  if(mode==="minus")return (b-u+256)%256;
  return (b+u)%256;
}
/** @param {number[]} bytes @param {"msb"|"lsb"} order */
function bitString(bytes,order){
  return bytes.flatMap(byte=>Array.from({length:8},(_,i)=>
    (byte>>(order==="msb"?7-i:i))&1));
}
/** @param {number[]} values @param {string} register @param {string} mode */
function interiorBytes(values,register,mode){
  return inner.map((sourcePos,i)=>
    unmask(values[sourcePos],runeValue(known[i],register),mode));
}
/**
 * Every six-byte interior row has 48 contiguous key bits. At order L=46,
 * this fixes two equations per row on the same unknown feedback polynomial;
 * 30 rows give 60 equations, even with arbitrary independent row seeds.
 * @param {number[]} key @param {string} bitOrder @param {number} length
 */
function equations(key,bitOrder,length){
  assert.equal(key.length,180);
  assert.ok(length>=1&&length<=46);
  const result=[];
  for(let r=0;r<30;r++){
    const bits=bitString(key.slice(r*6,r*6+6),bitOrder);
    assert.equal(bits.length,48);
    for(let i=0;i+length<48;i++){
      let e=BigInt(bits[i+length])<<BigInt(length);
      for(let j=0;j<length;j++)if(bits[i+j])e|=1n<<BigInt(j);
      result.push(e);
    }
  }
  return result;
}
/**
 * Exact GF2 elimination. Bit L is the right-hand side.
 * @param {bigint[]} rows @param {number} length
 */
function solve(rows,length){
  const pivots=new Array(length);
  const mask=(1n<<BigInt(length))-1n;
  let rank=0;
  for(let i=0;i<rows.length;i++){
    let equation=rows[i];
    for(let j=length-1;j>=0;j--){
      if(!(equation&(1n<<BigInt(j))))continue;
      if(pivots[j]!==undefined)equation^=pivots[j];
      else{pivots[j]=equation;rank++;break;}
    }
    if((equation&mask)===0n&&(equation>>BigInt(length))===1n)
      return {consistent:false,rank,firstContradiction:i};
  }
  const taps=[];
  if(rank===length){
    for(let j=0;j<length;j++){
      let rhs=Number((pivots[j]>>BigInt(length))&1n);
      for(let k=0;k<j;k++)if(pivots[j]&(1n<<BigInt(k)))rhs^=taps[k];
      taps.push(rhs);
    }
  }
  return {consistent:true,rank,taps};
}
const original=[];
for(const register of ["index","prime","totient"])
  for(const operation of ["xor","minus","plus"])
    for(const bitOrder of ["msb","lsb"]){
      const key=interiorBytes(originalGrid.bytes,register,operation);
      const outcome=solve(equations(key,bitOrder,46),46);
      original.push({register,operation,bitOrder,rankAtFailure:outcome.rank,
        firstContradiction:outcome.firstContradiction,
        consistent:outcome.consistent});
    }
assert.equal(original.length,18);
assert.ok(original.every(r=>!r.consistent));
/**
 * Independent positive control: 32-stage LFSR (taps 0,2,7,20,31)
 * encrypts a FULL 256-byte synthetic table, with 180 authentic solved
 * rune values inside, and the first 76 known p57 runes on the rim.
 */
const tapped=[0,2,7,20,31],length=32;
let randomState=0x33012014;
function randomBit(){
  randomState^=randomState<<13;
  randomState^=randomState>>>17;
  randomState^=randomState<<5;
  return randomState&1;
}
const allBits=Array.from({length:2048},()=>0);
for(let i=0;i<length;i++)allBits[i]=randomBit();
for(let i=0;i+length<2048;i++)
  allBits[i+length]=tapped.reduce((v,j)=>v^allBits[i+j],0);
const plain=Array(256).fill(-1);
for(let i=0;i<inner.length;i++)plain[inner[i]]=known[i];
for(let i=0;i<perimeter.length;i++)plain[perimeter[i]]=pages[57][i];
assert.ok(plain.every(v=>v>=0&&v<=28));
const keyBytes=Array.from({length:256},(_,i)=>
  Array.from({length:8},(_,bit)=>allBits[8*i+bit]<<(7-bit))
    .reduce((a,b)=>a|b,0));
const syntheticTable=keyBytes.map((k,i)=>k^plain[i]);
const positive=solve(equations(interiorBytes(syntheticTable,"index","xor"),"msb",32),32);
assert.equal(positive.consistent,true);
assert.equal(positive.rank,32);
assert.deepEqual(positive.taps,
  Array.from({length:32},(_,i)=>Number(tapped.includes(i))));
assert.equal(positive.taps[0],1);
/* 32 consecutive observed inner bits at global bit offset 72 fix the state.
 * A nonzero first tap makes exact backwards reconstruction possible. */
const stateBits=bitString(interiorBytes(syntheticTable,"index","xor").slice(0,4),"msb");
const recovered=Array(2048).fill(-1);
for(let i=0;i<32;i++)recovered[72+i]=stateBits[i];
for(let i=72;i+32<2048;i++)
  recovered[i+32]=positive.taps.reduce((v,t,j)=>v^(t&recovered[i+j]),0);
for(let i=71;i>=0;i--){
  let x=recovered[i+32];
  for(let j=1;j<32;j++)x^=positive.taps[j]&recovered[i+j];
  recovered[i]=x;
}
assert.deepEqual(recovered,allBits);
const derivedKeys=Array.from({length:256},(_,i)=>
  Array.from({length:8},(_,bit)=>recovered[8*i+bit]<<(7-bit))
    .reduce((a,b)=>a|b,0));
const inferredOuter=perimeter.map(pos=>syntheticTable[pos]^derivedKeys[pos]);
assert.deepEqual(inferredOuter,pages[57].slice(0,76));
const inferredInner=inner.map(pos=>syntheticTable[pos]^derivedKeys[pos]);
assert.deepEqual(inferredInner,known);
console.log(JSON.stringify({
  original:{
    printedGrid:"32x8",sourceCells:256,
    outerCells:76,innerCells:180,solvedP56RuneValues:85,clearP57RuneValues:95,
    assumption:"Interior row-major GP-index, GP-prime or GP-prime-totient byte masking by one common binary LFSR of at most 46 bits",
    bitOrders:["msb","lsb"],byteOperators:["xor","minus","plus"],
    variants:18,allInconsistent:true,
    eachEquationFamily:"30 original independent 48-bit interior rows, 2 recurrence equations per row",
    cases:original
  },
  positive:{
    simulatedLfsrStages:32,originalGeometryPreserved:true,
    recoveredTapBits:32,recoveredFullKeyBytes:256,
    recoveredKnownInteriorRunes:180,recoveredUnknownRimControlRunes:76
  },
  conclusion:"No such original 46-or-fewer-stage shared binary LFSR; original page55 plaintext and actual cipher mechanism remain unrecovered."
},null,2));
