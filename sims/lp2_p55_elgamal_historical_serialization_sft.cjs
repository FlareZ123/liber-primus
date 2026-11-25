"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const url = "https://raw.githubusercontent.com/iBotPeaches/cicada_3301/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc";
function decode(s) {
  let x=0,k=0,out=[];
  const abc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for(const line of s.split(/\r?\n/)){
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(line))continue;
    for(const c of line){if(c==="=")break;x=(x<<6)|abc.indexOf(c);k+=6;if(k>=8){k-=8;out.push((x>>k)&255)}}
  }
  return out;
}
function packetHeaders(bytes){
  let i=0,p=[];
  while(i<bytes.length){
    const h=bytes[i++];if(!(h&128))throw Error("bad header");
    let tag,len;
    if(h&64){
      tag=h&63;const n=bytes[i++];
      if(n<192)len=n;
      else if(n<224)len=((n-192)<<8)+bytes[i++]+192;
      else if(n===255){len=0;for(let k=0;k<4;k++)len=len*256+bytes[i++]}
      else throw Error("partial length");
    }else{
      tag=(h>>2)&15;const n=h&3;
      if(n===3)len=bytes.length-i;
      else{len=0;for(let k=0;k<(1<<n);k++)len=len*256+bytes[i++]}
    }
    if(i+len>bytes.length)throw Error("packet size");
    const row={tag,len};
    if(tag===6||tag===14){row.version=bytes[i];row.algorithm=bytes[i+5]}
    if(tag===8)row.compression=bytes[i];
    if(tag===1)row.algorithm=bytes[i+9];
    p.push(row);i+=len;
  }
  return p;
}
function pow(a,e,p){let x=1;while(e){if(e&1)x=x*a%p;a=a*a%p;e>>=1}return x}
function blobSha(b){return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex")}
(async()=>{
  const key=fs.readFileSync(path.join(__dirname,"../resources/historical/cicada-3301-2012-public-key.asc"));
  const tcp=process.argv[2]?fs.readFileSync(process.argv[2]):Buffer.from(await (await fetch(url)).arrayBuffer());
  assert.equal(blobSha(key),"d44aec389e2f346c6b9d149d4c61e890f62979c9");
  assert.equal(blobSha(tcp),"c540174ff660299e24dd0ae6f390743753ce4a72");
  const keyPackets=packetHeaders(decode(key.toString()));
  const tcpPackets=packetHeaders(decode(tcp.toString()));
  console.log({keyPackets,tcpPackets});
  assert.deepEqual(keyPackets.filter(x=>x.tag===6||x.tag===14).map(x=>x.algorithm),[1,1]);
  assert.deepEqual(tcpPackets,[{tag:8,len:2741,compression:2}]);
  const exps=Array.from({length:22},(_,i)=>i);
  const a=exps.filter(x=>pow(5,x,23)===8),b=exps.filter(x=>pow(5,x,23)===19);
  assert.deepEqual(a,[6]);assert.deepEqual(b,[15]);
  assert.equal(pow(19,a[0],23),2);assert.equal(pow(8,b[0],23),2);
  console.log({p:23,g:5,A:8,B:19,a,b,shared:2,modulusOctets:1,minimumPaddingOverheadOctets:11});
  console.log("PASS: historical DH example, RSA public key, compressed signed TCP payload; no LP2 ElGamal serialization identified.");
})().catch(e=>{console.error(e);process.exitCode=1});
