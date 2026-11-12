"use strict";
/**
 * Source-exact MPEG container boundary audit for original 2013 Cicada 761.MP3.
 * Run: node sims/audio761_mpeg_frame_structure_sft.cjs SOURCE.mp3 CONTROL.mp3
 * Intentionally does not search spectral peaks or derive LP2 keys.
 * @module audio761_mpeg_frame_structure_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const digest = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const PIN = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const BITRATE = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0];
const SAMPLE = [44100,48000,32000,0];

/** @param {Buffer} buf @returns {number} */
function audioStart(buf) {
  if (buf.toString("ascii",0,3)!=="ID3") return 0;
  assert.ok(buf.length>=10);
  const head=buf.subarray(6,10);
  assert.ok([...head].every(x=>(x&128)===0),"ID3v2 size must be synchsafe");
  const body=((head[0]<<21)|(head[1]<<14)|(head[2]<<7)|head[3]);
  return 10+body+((buf[5]&16)?10:0);
}

/**
 * Parse one MPEG-1 Layer III header at an exact expected frame boundary.
 * @param {Buffer} buf
 * @param {number} pos
 * @returns {object|null}
 */
function header(buf,pos) {
  if (pos+4>buf.length) return null;
  const value=buf.readUInt32BE(pos);
  const sync=value>>>21, ver=(value>>>19)&3, layer=(value>>>17)&3;
  const bitrateIndex=(value>>>12)&15, srIndex=(value>>>10)&3;
  if (sync!==2047||ver!==3||layer!==1||
      bitrateIndex===0||bitrateIndex===15||srIndex===3) return null;
  const bitrate=BITRATE[bitrateIndex],sampleRate=SAMPLE[srIndex];
  const padding=(value>>>9)&1,crcProtected=(((value>>>16)&1)===0);
  const size=Math.floor(144000*bitrate/sampleRate)+padding;
  if (size<36||pos+size>buf.length) return null;
  return {
    offset:pos,size,bitrateKbps:bitrate,sampleRate,padding,
    crcProtected,privateBit:(value>>>8)&1,channelMode:(value>>>6)&3,
    modeExtension:(value>>>4)&3,copyright:(value>>>3)&1,
    original:(value>>>2)&1,emphasis:value&3,
    headerHex:buf.subarray(pos,pos+4).toString("hex")
  };
}

/** @param {Map<string,number>} map @param {string|number} v */
function tally(map,v) { const k=String(v);map.set(k,(map.get(k)||0)+1); }
/** @param {Map<string,number>} map @returns {object} */
function obj(map) { return Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]))); }

/**
 * Parse every frame at its exact next expected start; any surplus is exposed.
 * @param {Buffer} bytes
 * @param {string} label
 */
function audit(bytes,label) {
  const start=audioStart(bytes);
  const counts=Object.fromEntries(
    ["bitrateKbps","sampleRate","padding","crcProtected","privateBit",
     "channelMode","modeExtension","copyright","original","emphasis"].map(k=>[k,new Map()]));
  let offset=start,frames=0,mainDataBeginMax=0,nonzeroReservoir=0;
  let first=null,last=null;
  while(offset+4<=bytes.length){
    const f=header(bytes,offset);
    if(!f)break;
    const sideStart=offset+4+(f.crcProtected?2:0);
    const back=(((bytes[sideStart]<<1)|(bytes[sideStart+1]>>>7))&511);
    if(back>mainDataBeginMax)mainDataBeginMax=back;
    if(back!==0)nonzeroReservoir++;
    for(const [k,v] of Object.entries(counts))tally(v,f[k]);
    if(!first)first=f;
    last=f; frames++;offset+=f.size;
  }
  assert.ok(frames>1,label+" must contain valid sequential frames");
  const firstFrame=bytes.subarray(first.offset,first.offset+first.size);
  const sideLength=first.channelMode===3?17:32;
  const infoOffset=4+(first.crcProtected?2:0)+sideLength;
  const infoTag=firstFrame.toString("ascii",infoOffset,infoOffset+4);
  const isXing=infoTag==="Xing"||infoTag==="Info";
  let info=null;
  if(isXing){
    const flags=firstFrame.readUInt32BE(infoOffset+4);
    let cursor=infoOffset+8;
    const data={tag:infoTag,flags};
    if(flags&1){data.declaredFrames=firstFrame.readUInt32BE(cursor);cursor+=4;}
    if(flags&2){data.declaredBytes=firstFrame.readUInt32BE(cursor);cursor+=4;}
    if(flags&4)cursor+=100;
    if(flags&8){data.vbrScale=firstFrame.readUInt32BE(cursor);cursor+=4;}
    data.encoderAfterXing=firstFrame.toString("ascii",cursor,cursor+12).replace(/[^ -~]/gu,".");
    info=data;
  }
  const firstEncoderIndex=firstFrame.indexOf("LAME",0,"ascii");
  const end=bytes.subarray(offset);
  const thirdPartyTags={
    ID3v1:end.length>=128 && end.toString("ascii",end.length-128,end.length-125)==="TAG",
    APEv2:end.indexOf("APETAGEX")>=0
  };
  return {
    label,fileBytes:bytes.length,sha256:digest(bytes),id3Bytes:start,
    compressedFrameBytes:offset-start,frameCount:frames,secondsByFrameClock:frames*1152/first.sampleRate,
    firstFrame:first,lastFrame:last,headerFieldCounts:Object.fromEntries(
      Object.entries(counts).map(([k,m])=>[k,obj(m)])),
    sideInfo:{nonzeroReservoirFrames:nonzeroReservoir,maximumBackPointer:mainDataBeginMax},
    firstFrameMetadata:{
      xingOrInfo:info,
      hasLAMEEncoderMarker:firstEncoderIndex>=0,
      lameMarkerOffsetWithinFirstFrame:firstEncoderIndex,
      firstFrameAsciiStrings:firstFrame.toString("latin1").match(/[ -~]{6,}/gu)?.slice(0,8)||[]
    },
    trailing:{bytes:end.length,sha256:digest(end),first32Hex:end.subarray(0,32).toString("hex"),tags:thirdPartyTags}
  };
}
const [sourceFile,controlFile]=process.argv.slice(2);
assert.ok(sourceFile&&controlFile,"Pass original and independently encoded control files");
const source=fs.readFileSync(sourceFile),control=fs.readFileSync(controlFile);
assert.equal(source.length,4010732);
assert.equal(digest(source),PIN,"Original 2013 audio must match pinned SHA-256");
assert.equal(source.toString("ascii",0,3),"ID3");
assert.equal(audioStart(source),206);
const a=audit(source,"2013 original 761.MP3");
const b=audit(control,"synthetic FFmpeg/LAME 192k 44.1k stereo control");
assert.equal(b.headerFieldCounts.bitrateKbps["192"],b.frameCount);
assert.equal(b.headerFieldCounts.sampleRate["44100"],b.frameCount);
console.log(JSON.stringify({source:a,control:b,scope:
  "MPEG1 Layer3 frame structure, wrapper fields, append bytes; no spectral-stego claim"},null,2));
