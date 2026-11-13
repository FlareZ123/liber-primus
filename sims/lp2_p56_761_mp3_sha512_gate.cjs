#!/usr/bin/env node
"use strict";
/**
 * Exact SHA-512 preimage screen for the pinned original 2013 Cicada 761.MP3.
 *
 * Source: rtkd/iddqd commit f2267b0c2f1e1d2662806b90b9c3a2953b3a7023,
 * path 2013/02/761.MP3; byte length and SHA-256 are fixed below.
 *
 * In addition to the complete file, test only source-defined components:
 * ID3v2 tag/body, each complete frame and payload, decoded text-frame bodies,
 * the raw MPEG audio-frame stream after metadata, and ID3v1 fields. No guessed
 * re-encoding, truncation, arbitrary substring, or dictionary preimage search.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const EXPECTED_BYTES = 4010732;
const SOURCE_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const P56_SHA512 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const sha512 = b => crypto.createHash("sha512").update(b).digest("hex");

function synchsafe(bytes, offset) {
  let result=0;
  for(let i=0;i<4;i++) {
    assert.equal(bytes[offset+i]>>7,0);
    result=(result<<7)|bytes[offset+i];
  }
  return result;
}
function frameText(id,payload) {
  if(!(id.startsWith("T")||id==="COMM"||id==="USLT")) return null;
  assert.ok(payload.length>=1);
  const encoding=payload[0];
  let data=payload.subarray(1);
  if(id==="COMM"||id==="USLT") {
    assert.ok(data.length>=3);
    data=data.subarray(3);
  }
  if(encoding===0) return data.toString("latin1").replace(/\u0000/g," | ");
  if(encoding===3) return data.toString("utf8").replace(/\u0000/g," | ");
  if(encoding===1) {
    if(data.length>=2&&data[0]===0xfe&&data[1]===0xff) {
      const swapped=Buffer.from(data.subarray(2)); swapped.swap16();
      return swapped.toString("utf16le").replace(/\u0000/g," | ");
    }
    if(data.length>=2&&data[0]===0xff&&data[1]===0xfe) data=data.subarray(2);
    assert.equal(data.length%2,0);
    return data.toString("utf16le").replace(/\u0000/g," | ");
  }
  if(encoding===2) {
    const swapped=Buffer.from(data); assert.equal(swapped.length%2,0);
    swapped.swap16(); return swapped.toString("utf16le").replace(/\u0000/g," | ");
  }
  throw new Error("Unsupported ID3 text encoding "+encoding);
}
function parseTag(bytes) {
  assert.equal(bytes.toString("ascii",0,3),"ID3");
  const major=bytes[3], minor=bytes[4], flags=bytes[5];
  assert.ok(major===3||major===4);
  const size=synchsafe(bytes,6), end=10+size;
  assert.ok(end<=bytes.length);
  assert.equal(flags&0xc0,0,"Unsynchronization/extended header needs separate parser");
  assert.equal(flags&0x10,0,"ID3 footer needs separate parser");
  const frames=[];
  let cursor=10;
  while(cursor+10<=end) {
    const id=bytes.toString("ascii",cursor,cursor+4);
    if(id==="\u0000\u0000\u0000\u0000") break;
    assert.match(id,/^[A-Z0-9]{4}$/u);
    const frameSize=major===4?synchsafe(bytes,cursor+4):bytes.readUInt32BE(cursor+4);
    const next=cursor+10+frameSize;
    assert.ok(next<=end);
    const payload=bytes.subarray(cursor+10,next);
    frames.push({id,start:cursor,size:frameSize,frameFlags:bytes.readUInt16BE(cursor+8),
      text:frameText(id,payload),payload});
    cursor=next;
  }
  assert.ok(bytes.subarray(cursor,end).every(x=>x===0),"Only zero ID3 padding expected");
  return {major,minor,flags,size,end,frames};
}
function add(candidates,label,bytes) {
  candidates.push({label,bytes,sha512:sha512(bytes),sha256:sha256(bytes),length:bytes.length});
}
const input=process.argv[2];
assert.ok(input,"Pass the pinned original 761.MP3 path");
const data=fs.readFileSync(input);
assert.equal(data.length,EXPECTED_BYTES,"Refuse non-pinned 761.MP3 byte length");
assert.equal(sha256(data),SOURCE_SHA256,"Refuse non-pinned original 761.MP3 bytes");

const tag=parseTag(data);
assert.equal(tag.end,206,"Original ID3v2 tag should end at the recorded 206-byte boundary");
const v1=data.subarray(-128);
const hasV1=v1.toString("ascii",0,3)==="TAG";
const audioEnd=hasV1?data.length-128:data.length;
const candidates=[];
add(candidates,"raw-complete-mp3",data);
add(candidates,"id3v2-complete-tag",data.subarray(0,tag.end));
add(candidates,"id3v2-body-without-header",data.subarray(10,tag.end));
add(candidates,"raw-mpeg-audio-frame-stream",data.subarray(tag.end,audioEnd));
if(hasV1) {
  add(candidates,"id3v1-complete-tag",v1);
  for(const [label,start,end] of [
    ["title",3,33],["artist",33,63],["album",63,93],["year",93,97],["comment",97,127],["genre",127,128]
  ]) add(candidates,"id3v1-"+label,v1.subarray(start,end));
}
for(const frame of tag.frames) {
  add(candidates,"id3v2-"+frame.id+"-complete-frame",data.subarray(frame.start,frame.start+10+frame.size));
  add(candidates,"id3v2-"+frame.id+"-raw-payload",frame.payload);
  if(frame.text!==null) add(candidates,"id3v2-"+frame.id+"-decoded-text-utf8",Buffer.from(frame.text,"utf8"));
  if(frame.id==="APIC" && frame.payload.length>5) {
    const p=frame.payload;
    let q=1;
    const mimeEnd=p.indexOf(0,q);
    if(mimeEnd>q) {
      q=mimeEnd+2; // MIME NUL and picture-type byte
      const enc=p[0];
      let descEnd=-1, step=enc===0||enc===3?1:2;
      for(let z=q;z+step<=p.length;z+=step) {
        if(step===1?p[z]===0:(p[z]===0&&p[z+1]===0)){descEnd=z;break;}
      }
      if(descEnd>=0) add(candidates,"id3v2-APIC-image-data",p.subarray(descEnd+step));
    }
  }
}
const matches=candidates.filter(x=>x.sha512===P56_SHA512);
console.log(JSON.stringify({
  source:"rtkd/iddqd@f2267b0c2f1e1d2662806b90b9c3a2953b3a7023:2013/02/761.MP3",
  bytes:data.length,sha256:sha256(data),rawSha512:sha512(data),
  p56TargetSha512:P56_SHA512,
  id3v2:{major:tag.major,minor:tag.minor,tagBytes:tag.end,frames:tag.frames.map(f=>({
    id:f.id,offset:f.start,payloadBytes:f.size,text:f.text,
    payloadSha256:sha256(f.payload),payloadSha512:sha512(f.payload)
  }))},
  id3v1Present:hasV1,
  audioStreamBytes:audioEnd-tag.end,
  candidateCount:candidates.length,
  componentMatches:matches.map(({label,length,sha256,sha512})=>({label,length,sha256,sha512})),
  candidates:candidates.map(({label,length,sha256,sha512})=>({label,length,sha256,sha512})),
  scope:"exact source component boundaries only; no arbitrary substrings or alternate encodings"
},null,2));
