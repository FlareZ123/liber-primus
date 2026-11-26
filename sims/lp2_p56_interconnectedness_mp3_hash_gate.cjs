#!/usr/bin/env node
"use strict";
/**
 * Exact p56 hash-preimage gate for the 2014 Onion5 Interconnectedness source.
 *
 * The PGP-clearsigned hex message and decoded MP3 are pinned to a verified
 * third-party archival commit; SHA-256 assertions bind both files to the
 * signed payload manifest. Only source-defined byte forms are tested.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const COMMIT = "fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb";
const BASE = `https://raw.githubusercontent.com/Dukotah/cicada3301/${COMMIT}/corpus/A-primary-artifacts`;
const MESSAGE_URL = `${BASE}/pgp/messages/corpus_2014-01-interconnectedness-hex.asc`;
const MP3_URL = `${BASE}/2014/signed_interconnectedness_decoded.bin`;
const MESSAGE_BYTES = 13526359;
const MESSAGE_SHA256 = "aa11ab74ea83d68dc4e0bf76c96baca9e7f37909432917ff4d8d5e924d9a8189";
const MP3_BYTES = 6651873;
const MP3_SHA256 = "1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6";
const P56 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

const digest = (name, b) => crypto.createHash(name).update(b).digest("hex");
const sha256 = b => digest("sha256", b);
const sha512 = b => digest("sha512", b);
const whirlpool = b => {
  const p = spawnSync("openssl", ["dgst", "-provider", "legacy", "-whirlpool"], {input:b});
  assert.equal(p.status, 0, p.stderr.toString("utf8"));
  return p.stdout.toString("utf8").trim().split("=").pop().trim().toLowerCase();
};
async function get(url, expectedBytes, expectedSha256) {
  const response = await fetch(url, {redirect:"follow"});
  assert.equal(response.status, 200, `HTTP ${response.status}: ${url}`);
  const data = Buffer.from(await response.arrayBuffer());
  assert.equal(data.length, expectedBytes, `unexpected length: ${url}`);
  assert.equal(sha256(data), expectedSha256, `source SHA-256 mismatch: ${url}`);
  return data;
}
function clearsignedBody(text) {
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  assert.ok(text.startsWith(marker));
  const after = text.slice(marker.length);
  const headerBreak = after.match(/\\r?\\n\\r?\\n/);
  assert.ok(headerBreak, "PGP cleartext header separator missing");
  const body = after.slice(headerBreak.index + headerBreak[0].length);
  const signatureAt = body.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(signatureAt >= 0, "PGP signature boundary missing");
  return body.slice(0, signatureAt);
}
function extractHex(text) {
  const body = clearsignedBody(text);
  const hexlines=[];
  let started=false;
  for(const line of body.split(/\r?\n/)) {
    const s=line.trim();
    if(/^[0-9a-fA-F]{16,}$/.test(s)) {hexlines.push(s);started=true;}
    else if(started && /^[0-9a-fA-F]{2,}$/.test(s)) hexlines.push(s);
    else if(started && s==="") continue;
    else if(started) break;
  }
  const hex=hexlines.join("");
  assert.equal(hex.length,13303746);
  assert.equal(hex.length%2,0);
  return {body,hex,bytes:Buffer.from(hex,"hex")};
}
function synchsafe(b,o) {
  let n=0; for(let i=0;i<4;i++){assert.equal(b[o+i]>>7,0);n=(n<<7)|b[o+i];} return n;
}
function frameText(id,payload) {
  if(!(id.startsWith("T")||id==="COMM"||id==="USLT")) return null;
  assert.ok(payload.length>=1);
  const enc=payload[0]; let data=payload.subarray(1);
  if(id==="COMM"||id==="USLT"){assert.ok(data.length>=3);data=data.subarray(3);}
  if(enc===0) return data.toString("latin1").replace(/\u0000/g," | ");
  if(enc===3) return data.toString("utf8").replace(/\u0000/g," | ");
  if(enc===1) {
    if(data.length>=2&&data[0]===0xfe&&data[1]===0xff){const x=Buffer.from(data.subarray(2));x.swap16();return x.toString("utf16le").replace(/\u0000/g," | ");}
    if(data.length>=2&&data[0]===0xff&&data[1]===0xfe)data=data.subarray(2);
    assert.equal(data.length%2,0);return data.toString("utf16le").replace(/\u0000/g," | ");
  }
  if(enc===2){const x=Buffer.from(data);assert.equal(x.length%2,0);x.swap16();return x.toString("utf16le").replace(/\u0000/g," | ");}
  throw new Error("Unsupported ID3 text encoding "+enc);
}
function parseId3(mp3) {
  assert.equal(mp3.toString("ascii",0,3),"ID3");
  const major=mp3[3],minor=mp3[4],flags=mp3[5];
  assert.ok(major===3||major===4);
  assert.equal(flags&0xc0,0,"ID3 unsynchronization/extended header requires separate parser");
  assert.equal(flags&0x10,0,"ID3 footer requires separate parser");
  const size=synchsafe(mp3,6),end=10+size;
  assert.ok(end<=mp3.length);
  const frames=[];let cur=10;
  while(cur+10<=end){
    const id=mp3.toString("ascii",cur,cur+4);
    if(id==="\u0000\u0000\u0000\u0000") break;
    assert.match(id,/^[A-Z0-9]{4}$/);
    const n=major===4?synchsafe(mp3,cur+4):mp3.readUInt32BE(cur+4);
    const next=cur+10+n;assert.ok(next<=end);
    const payload=mp3.subarray(cur+10,next);
    frames.push({id,start:cur,size:n,flags:mp3.readUInt16BE(cur+8),payload,text:frameText(id,payload)});
    cur=next;
  }
  assert.ok(mp3.subarray(cur,end).every(x=>x===0));
  return {major,minor,flags,size,end,frames};
}
function makeCandidates(message, body, hex, mp3) {
  const tag=parseId3(mp3), v1=mp3.subarray(-128), hasV1=v1.toString("ascii",0,3)==="TAG";
  const audioEnd=hasV1?mp3.length-128:mp3.length;
  const c=[];
  const add=(label,b)=>c.push({label,bytes:b});
  add("complete_pgp_clearsigned_message",message);
  add("clearsigned_body_before_signature",Buffer.from(body,"utf8"));
  add("compact_hex_payload_ascii",Buffer.from(hex,"ascii"));
  add("decoded_interconnectedness_mp3",mp3);
  add("id3v2_complete_tag",mp3.subarray(0,tag.end));
  add("id3v2_body_without_header",mp3.subarray(10,tag.end));
  add("raw_mpeg_audio_frame_stream",mp3.subarray(tag.end,audioEnd));
  if(hasV1) {
    add("id3v1_complete_tag",v1);
    for(const [name,a,b] of [["title",3,33],["artist",33,63],["album",63,93],["year",93,97],["comment",97,127],["genre",127,128]])
      add("id3v1_"+name,v1.subarray(a,b));
  }
  for(const f of tag.frames) {
    add("id3v2_"+f.id+"_complete_frame",mp3.subarray(f.start,f.start+10+f.size));
    add("id3v2_"+f.id+"_raw_payload",f.payload);
    if(f.text!==null)add("id3v2_"+f.id+"_decoded_text_utf8",Buffer.from(f.text,"utf8"));
    if(f.id==="APIC"&&f.payload.length>5){
      const p=f.payload;let q=1;const mimeEnd=p.indexOf(0,q);
      if(mimeEnd>q){q=mimeEnd+2;const step=p[0]===0||p[0]===3?1:2;let de=-1;
        for(let z=q;z+step<=p.length;z+=step)if(step===1?p[z]===0:(p[z]===0&&p[z+1]===0)){de=z;break;}
        if(de>=0)add("id3v2_APIC_image_data",p.subarray(de+step));
      }
    }
  }
  return {candidates:c,tag,hasV1,audioEnd};
}
async function main() {
  const [message,mp3]=await Promise.all([
    get(MESSAGE_URL,MESSAGE_BYTES,MESSAGE_SHA256),
    get(MP3_URL,MP3_BYTES,MP3_SHA256)
  ]);
  const messageText=message.toString("utf8");
  const extracted=extractHex(messageText);
  assert.equal(sha256(extracted.bytes),MP3_SHA256,"signed-message hex payload != pinned MP3");
  assert.deepEqual(extracted.bytes,mp3,"signed-message payload and decoded MP3 differ");
  const {candidates,tag,hasV1,audioEnd}=makeCandidates(message,extracted.body,extracted.hex,mp3);
  const rows=candidates.map(x=>{
    const hashes={
      sha512:sha512(x.bytes),
      sha3_512:digest("sha3-512",x.bytes),
      blake2b_512:digest("blake2b512",x.bytes),
      whirlpool:whirlpool(x.bytes)
    };
    return {source_form:x.label,bytes:x.bytes.length,...hashes,
      matches:Object.fromEntries(Object.entries(hashes).map(([alg,h])=>[alg,h===P56]))};
  });
  const matches=rows.flatMap(x=>Object.entries(x.matches).filter(([,v])=>v).map(([alg])=>({source_form:x.source_form,algorithm:alg})));
  console.log(JSON.stringify({
    test:"p56 digest against signed 2014 Onion5 Interconnectedness source and MP3",
    pinned_source:{repository:"Dukotah/cicada3301",commit:COMMIT,message_path:"corpus/A-primary-artifacts/pgp/messages/corpus_2014-01-interconnectedness-hex.asc",mp3_path:"corpus/A-primary-artifacts/2014/signed_interconnectedness_decoded.bin"},
    target:P56,
    message:{bytes:message.length,sha256:sha256(message)},
    mp3:{bytes:mp3.length,sha256:sha256(mp3),id3v2:{major:tag.major,minor:tag.minor,tag_bytes:tag.end,frames:tag.frames.map(f=>({id:f.id,payload_bytes:f.size,text:f.text}))},id3v1_present:hasV1,mpeg_stream_bytes:audioEnd-tag.end},
    hex_payload:{hex_digits:extracted.hex.length,decoded_bytes:extracted.bytes.length,sha256:sha256(extracted.bytes)},
    candidate_count:rows.length,candidates:rows,matches,
    conclusion:matches.length?"EXACT SOURCE PREIMAGE FOUND":"No tested exact Interconnectedness source form matches the p56 digest"
  },null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exit(1);});
