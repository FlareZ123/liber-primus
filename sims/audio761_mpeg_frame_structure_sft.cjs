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

/**
 * MPEG-1 Layer-III MSB-first side-info bit accessor.
 * @param {Buffer} bytes
 * @param {number} start
 * @param {number} width
 */
function bitsAt(bytes,start,width) {
  let v=0;
  for(let b=start;b<start+width;b++) {
    v=(v<<1)|((bytes[b>>>3]>>>(7-(b&7)))&1);
  }
  return v;
}

/**
 * Reconcile each frame's Huffman+scale-factor bit budget with next frame's
 * reservoir-backtracked bit start; skips the LAME encoder Info first frame.
 * @param {Array<{startBit:number,usedBits:number}>} data
 * @param {Buffer} main
 */
function ancillaryCensus(data,main) {
  const rawBits=[];
  let gapCount=0,zeroGapCount=0,overlaps=0,overlapMax=0,maxGap=0;
  let firstInfoGapBits=0,negativeStartCount=0;
  let fillMismatches=0,perfectFillGaps=0,nonstandardFillGaps=0;
  const nonstandardFillSamples=[];
  const completeAncillaryByteCounts=new Map(),nonFillBytePositions=[];
  let completeAncillaryBytes=0,nonFillerCompleteBytes=0;
  for(let i=0;i<data.length;i++) {
    const entry=data[i];
    if(entry.startBit<0){negativeStartCount++;continue;}
    const finish=entry.startBit+entry.usedBits;
    const next=(i+1<data.length)?data[i+1].startBit:main.length*8;
    const n=next-finish;
    if(n<0){overlaps++;overlapMax=Math.max(overlapMax,-n);continue;}
    if(i===0){firstInfoGapBits=n;continue;}
    if(n===0){zeroGapCount++;continue;}
    gapCount++;maxGap=Math.max(maxGap,n);
    for(let p=Math.ceil(finish/8);p<Math.floor(next/8);p++) {
      const value=main[p];
      tally(completeAncillaryByteCounts,value);
      completeAncillaryBytes++;
      if(value!==0x55&&value!==0xaa){
        nonFillerCompleteBytes++;
        if(nonFillBytePositions.length<24) {
          nonFillBytePositions.push({
            frame:i,globalMainDataOffset:p,valueHex:value.toString(16).padStart(2,"0"),
            contextHex:main.subarray(Math.max(0,p-8),Math.min(main.length,p+9)).toString("hex")
          });
        }
      }
    }
    let localMismatches=0;
    for(let bit=finish;bit<next;bit++){
      const actual=bitsAt(main,bit,1);
      rawBits.push(actual);
      if(actual!==(bit&1))localMismatches++;
    }
    fillMismatches+=localMismatches;
    if(localMismatches===0)perfectFillGaps++;
    else {
      nonstandardFillGaps++;
      if(nonstandardFillSamples.length<24) {
        const preview=main.subarray(finish>>>3,Math.min(main.length,(next+7)>>>3,(finish>>>3)+32));
        nonstandardFillSamples.push({
          frame:i,gapBits:n,globalBitStart:finish,fillMismatches:localMismatches,
          firstBytesHex:preview.toString("hex")
        });
      }
    }
  }
  const packed=Buffer.alloc(Math.ceil(rawBits.length/8));
  let ones=0;
  for(let i=0;i<rawBits.length;i++){
    if(rawBits[i]){ones++;packed[i>>>3]|=128>>>(i&7);}
  }
  return {
    dataUnitFrames:data.length,
    firstInfoMetadataGapBits:firstInfoGapBits,
    positiveAncillaryGaps:gapCount,zeroAncillaryGaps:zeroGapCount,
    overlappingDataUnits:overlaps,maxOverlapBits:overlapMax,
    negativeStartCount,maxGapBits:maxGap,
    candidateAncillaryBits:rawBits.length,candidateOneBits:ones,
    completeAncillaryBytes,nonFillerCompleteBytes,
    completeAncillaryByteTop:Object.entries(obj(completeAncillaryByteCounts))
      .sort((a,b)=>b[1]-a[1]).slice(0,12),
    nonFillBytePositions,
    standard55FillMismatchedBits:fillMismatches,
    perfect55FillGaps:perfectFillGaps,nonstandardFillGaps,
    nonstandardFillSamples,
    candidateZeroBits:rawBits.length-ones,
    candidatePackedSha256:digest(packed),
    candidatePackedFirst64Hex:packed.subarray(0,64).toString("hex")
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
  const sidePrivateCounts=new Map(),sidePrivateValues=[];
  const mainDataChunks=[],dataUnits=[];
  let mainBytes=0;
  while(offset+4<=bytes.length){
    const f=header(bytes,offset);
    if(!f)break;
    const sideStart=offset+4+(f.crcProtected?2:0);
    const back=(((bytes[sideStart]<<1)|(bytes[sideStart+1]>>>7))&511);
    if(back>mainDataBeginMax)mainDataBeginMax=back;
    if(back!==0)nonzeroReservoir++;
    const private3=(bytes[sideStart+1]>>>4)&7;
    tally(sidePrivateCounts,private3);
    sidePrivateValues.push(private3);
    assert.notEqual(f.channelMode,3,"This side-info census requires MPEG1 stereo");
    const side=bytes.subarray(sideStart,sideStart+32);
    let usedBits=0;
    for(let grch=0;grch<4;grch++)usedBits+=bitsAt(side,20+59*grch,12);
    const mainData=bytes.subarray(sideStart+32,offset+f.size);
    dataUnits.push({startBit:8*(mainBytes-back),usedBits});
    mainDataChunks.push(mainData);
    mainBytes+=mainData.length;
    for(const [k,v] of Object.entries(counts))tally(v,f[k]);
    if(!first)first=f;
    last=f; frames++;offset+=f.size;
  }
  assert.ok(frames>1,label+" must contain valid sequential frames");
  const mainConcatenated=Buffer.concat(mainDataChunks,mainBytes);
  const ancillary=ancillaryCensus(dataUnits,mainConcatenated);
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
    sideInfo:{
      nonzeroReservoirFrames:nonzeroReservoir,maximumBackPointer:mainDataBeginMax,
      private3Distribution:obj(sidePrivateCounts),
      private3Nonzero:sidePrivateValues.filter(x=>x!==0).length,
      private3First64:sidePrivateValues.slice(0,64).join(""),
      private3PackedHex:(()=>{
        const data=Buffer.alloc(Math.ceil(sidePrivateValues.length*3/8));
        for(let i=0;i<sidePrivateValues.length;i++){
          for(let b=0;b<3;b++){
            if(sidePrivateValues[i]&(4>>>b)){
              const j=3*i+b;data[j>>>3]|=128>>>(j&7);
            }
          }
        }
        return data.subarray(0,48).toString("hex");
      })()
    },
    ancillaryMpegBitBudget:ancillary,
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
assert.equal(a.trailing.bytes,0,"Original compressed audio must have no appended bytes");
assert.equal(b.trailing.bytes,0,"Matched control must have no appended bytes");
for(const p of [a,b]){
  assert.equal(p.firstFrameMetadata.xingOrInfo?.declaredFrames,p.frameCount-1,
    "LAME Info frame count excludes its own metadata frame");
  assert.equal(p.firstFrameMetadata.xingOrInfo?.declaredBytes,p.compressedFrameBytes);
}
const marker=Buffer.from("FROZEN_APPEND_TEST","ascii");
const plantedTail=audit(Buffer.concat([source,marker]),"synthetic appended payload control");
assert.equal(plantedTail.trailing.bytes,marker.length);
assert.equal(plantedTail.trailing.first32Hex,marker.toString("hex"));
assert.equal(a.sideInfo.private3Nonzero,0,"Original MPEG private bits must all be zero");
assert.equal(b.sideInfo.private3Nonzero,0,"Matched LAME control private bits must all be zero");
const plantedPrivate=Buffer.from(source);
plantedPrivate[a.id3Bytes+5]|=16; // second side-info byte after four-byte MPEG header
const plantedPrivateAudit=audit(plantedPrivate,"synthetic nonzero side-private marker");
assert.equal(plantedPrivateAudit.sideInfo.private3Nonzero,1,
  "One changed MPEG side-private field must be detected");
assert.equal(plantedPrivateAudit.sideInfo.private3Distribution["1"],1);
console.log(JSON.stringify({source:a,control:b,syntheticTailDetectionBytes:plantedTail.trailing.bytes,syntheticPrivateSideInfoEvents:plantedPrivateAudit.sideInfo.private3Nonzero,scope:
  "MPEG1 Layer3 frame structure, wrapper fields, append bytes; no spectral-stego claim"},null,2));
