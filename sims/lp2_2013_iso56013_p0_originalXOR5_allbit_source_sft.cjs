"use strict";
/**
 * Source-exact 2013 CicadaOS phone-style XOR applied to LP2 GP29 bit indices.
 *
 * Cicada actually used byte XOR with DATA/560.13 in its 2013 phone stage.
 * A testable transfer to GP29 is 5-bit XOR (29 public symbols fit 5 bits).
 * The independently proposed p0 initial plaintext "EPIPHANY SEECS" fixes
 * exactly 13 consecutive original ciphertext/plaintext symbol pairs.
 *
 * Exhaustively search every raw 5-bit source alignment in the original
 * 118,818,811-byte verified file. Charge both bit orders within 5-bit words,
 * both within each source byte and both source-byte directions. For every
 * source-bit alignment use a 7/8 complete-byte exact filter and then verify
 * all 65 bits with no low-complexity approximate or language matching.
 * Also scan directly projected low/high five bits of successive source bytes.
 *
 * No source-key selection has been fitted to original ciphertext.
 * Full 13-rune title is the only initial success criterion. Synthetic
 * source plants check every bit offset and both bit orders.
 * Node22 CommonJS, read-only; SHA-256 checks source identity.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const p0=corpus.pages.find(p=>p.page===0).indices;
const clear=[18,13,10,13,8,24,9,26,15,18,18,5,15];
const sourceKey=p0.slice(0,13).map((x,i)=>x^clear[i]);
assert.equal(sourceKey.length,13);
assert.ok(sourceKey.every(x=>x>=0&&x<32));
/**
 * @param {number[]} fiveBitValues
 * @param {"msb"|"lsb"} order
 * @returns {number[]} all bit values0/1 in chronological source order
 */
function encodeBits(fiveBitValues,order){
 const bits=[];
 for(const x of fiveBitValues)for(let j=0;j<5;j++)
   bits.push((x>>(order==="msb"?4-j:j))&1);
 return bits;
}
/**
 * @param {Buffer} data
 * @param {number} bit
 * @param {"msb"|"lsb"} byteOrder
 * @returns {0|1}
 */
function getBit(data,bit,byteOrder){
 const byte=data[bit>>>3];
 return (byte>>(byteOrder==="msb"?7-(bit&7):(bit&7)))&1;
}
/** @param {Buffer} data @param {number} offset
 * @param {0|1} value @param {"msb"|"lsb"} byteOrder */
function setBit(data,offset,value,byteOrder){
 const shift=byteOrder==="msb"?7-(offset&7):(offset&7);
 if(value)data[offset>>>3]|=1<<shift;
 else data[offset>>>3]&=~(1<<shift);
}
/**
 * @param {Buffer} data
 * @param {number[]} bits
 * @param {"msb"|"lsb"} byteOrder
 * @returns {number[]} all bit starts matching all source values exactly
 */
function findBitPattern(data,bits,byteOrder){
 assert.ok(bits.length===65);
 const found=[];
 for(let phase=0;phase<8;phase++){
   const skip=(8-phase)%8;
   const count=Math.floor((bits.length-skip)/8);
   assert.ok(count>=7);
   const aligned=Buffer.alloc(count);
   for(let j=0;j<count;j++)for(let k=0;k<8;k++){
     const bit=bits[skip+j*8+k];
     if(bit)aligned[j]|=1<<(byteOrder==="msb"?7-k:k);
   }
   for(let at=data.indexOf(aligned);at>=0;at=data.indexOf(aligned,at+1)){
     const startBit=(at-(phase?1:0))*8+phase;
     if(startBit<0||startBit+bits.length>data.length*8)continue;
     let matched=true;
     for(let k=0;k<bits.length;k++){
       if(getBit(data,startBit+k,byteOrder)!==bits[k]){
         matched=false;break;
       }
     }
     if(matched)found.push(startBit);
   }
 }
 found.sort((a,b)=>a-b);
 return found;
}
/**
 * @param {Buffer} data
 * @param {number[]} values
 * @param {0|3} shift
 * @returns {number[]} all byte starts with exact13 5-bit values
 */
function findBytePattern(data,values,shift){
 const found=[];
 for(let start=0;start<=data.length-values.length;start++){
   if(((data[start]>>shift)&31)!==values[0])continue;
   let j=1;
   for(;j<values.length;j++)
     if(((data[start+j]>>shift)&31)!==values[j])break;
   if(j===values.length)found.push(start);
 }
 return found;
}
/** @returns {Buffer} */
function pseudoRandomBuffer(){
 let x=0x33012013;
 const b=Buffer.alloc(400);
 for(let i=0;i<b.length;i++){
   x^=x<<13;x^=x>>>17;x^=x<<5;
   b[i]=x&255;
 }
 return b;
}
/** @returns {object[]} */
function positiveControls(){
 const out=[];
 for(const wordOrder of ["msb","lsb"])
 for(const byteOrder of ["msb","lsb"]){
   const bits=encodeBits(sourceKey,wordOrder);
   for(let phase=0;phase<8;phase++){
     const data=pseudoRandomBuffer(),startBit=50*8+phase;
     for(let i=0;i<bits.length;i++)setBit(data,startBit+i,bits[i],byteOrder);
     const found=findBitPattern(data,bits,byteOrder);
     assert.ok(found.includes(startBit),
       "missed planted original GP5 XOR source at bit phase "+phase);
   }
   out.push({wordOrder,byteOrder,
     passedBitPhases:8,knownOriginalRunesReencoded:13});
 }
 for(const shift of [0,3]){
   const data=pseudoRandomBuffer(),start=125;
   for(let i=0;i<sourceKey.length;i++){
     const mask=31<<shift;
     data[start+i]=(data[start+i]&~mask)|(sourceKey[i]<<shift);
   }
   assert.ok(findBytePattern(data,sourceKey,shift).includes(start));
   out.push({byteProjection:shift===0?"low5":"high5",
     passedOriginalRunes:13});
 }
 assert.deepEqual(sourceKey.map((key,i)=>clear[i]^key),p0.slice(0,13));
 return out;
}
function main(){
 const planted=positiveControls();
 const file=process.env.CICADA_ISO_56013_PATH;
 assert.ok(file,"Set CICADA_ISO_56013_PATH to exact 2013 DATA/560.13");
 const source=fs.readFileSync(file);
 assert.equal(source.length,118818811);
 const sha256=crypto.createHash("sha256").update(source).digest("hex");
 assert.equal(sha256,
   "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
 const results=[];
 for(const direction of ["forward","reverse"]){
   const data=direction==="forward"?source:Buffer.from(source).reverse();
   for(const wordOrder of ["msb","lsb"])
   for(const byteOrder of ["msb","lsb"]){
     const bits=encodeBits(sourceKey,wordOrder);
     const hits=findBitPattern(data,bits,byteOrder);
     results.push({direction,sourceByteOrder:byteOrder,
       gpFiveBitOrder:wordOrder,sourceBitPositionsMatched:hits.length,
       sourceBitStarts:hits.slice(0,20)});
     console.log(JSON.stringify({direction,wordOrder,byteOrder,
       exactTitleHits:hits.length}));
   }
   for(const shift of [0,3]){
     const hits=findBytePattern(data,sourceKey,shift);
     results.push({direction,byteProjection:shift===0?"low5":"high5",
       sourceByteStartsMatched:hits.length,sourceByteStarts:hits.slice(0,20)});
     console.log(JSON.stringify({direction,byteProjection:shift,
       exactTitleHits:hits.length}));
   }
 }
 const all=results.reduce((sum,r)=>sum+
   (r.sourceBitPositionsMatched??r.sourceByteStartsMatched??0),0);
 const result={
   original:{runes:12956,titleKnownCiphertext:p0.slice(0,13),
     hypothesisPlaintext:clear,sourceKeyXorIndices:sourceKey,
     fileLength:source.length,sourceSha256:sha256},
   historicOpcode:"Cicada 2013 DATA/560.13 byte XOR, transferred hypothetically to 5-bit GP indices",
   sourceSearch:"all bit starts, word and source byte bit orders, both directions, raw5/high5 byte windows",
   planted,
   results,
   decision:all?"Exact source 13-rune XOR key candidate(s); require whole-body heldout"
     :"No 2013 source-file 5-bit XOR title match under all declared raw bit/byte orders"
 };
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,encodeBits,findBitPattern,findBytePattern,positiveControls};
