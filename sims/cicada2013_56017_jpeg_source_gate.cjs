"use strict";

/**
 * Exact 2013 DATA/560.17 JPEG-header gate motivated by a dated 2014 IRC line.
 * Original #cicadasolvers 20 Jan 2014 L64310 reports multiple FF D8 pairs.
 * Tests whether those are standard self-framed JPEG images, not random SOI pairs.
 * Node 22, CJS, no third-party dependencies.
 */
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const fs=require("node:fs/promises");
const SRC="https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/3301-contents/data/560.17";
const SOURCE_SHA="d5676b1e01fd371cb13415b59b2eca4336e96f7bb05e789198b8d6baab580c19";
const SOURCE_BLOB="49df8e57f8e6052eb2d5c2b483282461e53ef5ff";
function sha(b){return crypto.createHash("sha256").update(b).digest("hex");}
function gitBlob(b){return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");}
/**
 * Structural validator for a conventional JPEG header at an exact SOI address.
 * Requires first FF marker, valid finite segment lengths, a frame header and
 * start-of-scan marker. It does not decompress entropy-coded image data.
 * @param {Buffer} b
 * @param {number} start
 * @returns {{ok:boolean,reason:string,markers:number[],frame:boolean,scan:boolean}}
 */
function inspectHeader(b,start){
  const markers=[];
  const fail=(reason)=>({ok:false,reason,markers,frame:false,scan:false});
  if(start<0 || start+4>=b.length || b[start]!==255 || b[start+1]!==216)return fail("not SOI");
  let pos=start+2,frame=false,dqt=false;
  for(let step=0;step<200;step++){
    if(pos+4>b.length||b[pos]!==255)return fail("no next FF marker");
    while(pos<b.length&&b[pos]===255)pos++;
    if(pos>=b.length)return fail("marker truncated");
    const m=b[pos++];
    markers.push(m);
    if(m===0xda){
      if(!frame)return fail("SOS before frame");
      if(pos+2>b.length)return fail("SOS length truncated");
      const len=b.readUInt16BE(pos);
      if(len<6||pos+len>b.length)return fail("invalid SOS length");
      return {ok:true,reason:"valid SOI/marker/frame/SOS header",markers,frame,scan:true,dqt};
    }
    if(m===0xd9||m===0xd8||m===0x00||m>=0xd0&&m<=0xd7)return fail("illegal marker before scan");
    if(pos+2>b.length)return fail("segment length missing");
    const len=b.readUInt16BE(pos);
    if(len<2||pos+len>b.length)return fail("segment out of bounds");
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(m)){
      if(len<8)return fail("short SOF");
      const height=b.readUInt16BE(pos+3),width=b.readUInt16BE(pos+5);
      if(!height||!width)return fail("zero pixel dimensions");
      frame=true;
    }
    if(m===0xdb)dqt=true;
    pos+=len;
  }
  return fail("too many JPEG headers");
}
async function main(){
  const t=Buffer.from([255,216,255,224,0,4,1,2,255,192,0,8,8,0,1,0,1,1,255,218,0,6,1,1,0,0,0]);
  assert.equal(inspectHeader(t,0).ok,true,"positive synthetic JPEG header");
  assert.equal(inspectHeader(Buffer.from([255,216,1,2,3,4,5]),0).ok,false,"negative random SOI");
  const originalImage=await fs.readFile("resources/liber-primus/44.jpg");
  assert.equal(originalImage.subarray(0,3).toString("hex"),"ffd8ff");
  const control=inspectHeader(originalImage,0);
  assert(control.ok&&control.frame&&control.scan,"original LP2 p27 JPEG positive header control");
  console.log("CONTROL "+JSON.stringify({lp2Image:"resources/liber-primus/44.jpg",bytes:originalImage.length,sha256:sha(originalImage),header:control}));

  const response=await fetch(SRC);
  assert.equal(response.status,200,"source HTTP");
  const b=Buffer.from(await response.arrayBuffer());
  assert.equal(b.length,1183811,"original 2013 560.17 length");
  assert.equal(sha(b),SOURCE_SHA,"original sha256");
  assert.equal(gitBlob(b),SOURCE_BLOB,"original Git blob sha");
  const starts=[],ends=[],possibleHeaders=[];
  for(let i=0;i+2<b.length;i++){
    if(b[i]===255&&b[i+1]===216){
      starts.push(i);
      if(b[i+2]===255){
        const h=inspectHeader(b,i);
        possibleHeaders.push({offset:i,bytes:b.subarray(i,i+16).toString("hex"),...h});
      }
    }
    if(b[i]===255&&b[i+1]===217)ends.push(i);
  }
  console.log("SOURCE "+JSON.stringify({file:"2013/DATA/560.17",bytes:b.length,sha256:sha(b),gitBlob:gitBlob(b),sourceCue:"2014 Jan 20 L64310",soiCount:starts.length,eoiCount:ends.length,soiPositions:starts,soiFollowedByFF:possibleHeaders.length,completeJpegHeaders:possibleHeaders.filter(x=>x.ok).length,candidateHeaders:possibleHeaders}));
  if(possibleHeaders.some(x=>x.ok))console.log("NOTICE: source has a valid JPEG segment header; verify full entropy decode and independent LP2 relationship before claiming a payload");
}
main().catch(e=>{console.error(e);process.exitCode=1;});
