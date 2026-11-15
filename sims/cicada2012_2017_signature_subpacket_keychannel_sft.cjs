"use strict";
/**
 * Source-authentic packet-level key-channel census for fifteen published
 * Cicada RSA OpenPGP clear-signatures, 2012–2017.
 * Looks for extra signed metadata, notation or embedded secret subpackets
 * which could be recovered without decrypting GP29 ciphertext.
 *
 * SFT: node sims/cicada2012_2017_signature_subpacket_keychannel_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname,"..");
const sources = [
"resources/cicada2014-may2-signed-message.asc",
"resources/external/2013-do-not-share-this-information-2.asc",
"resources/historical/cicada2012-countdown-message.asc",
"resources/historical/cicada2012-midi-email.asc",
"resources/historical/cicada2013-first-onion-hello.asc",
"resources/historical/cicada2013-forest-clue.asc",
"resources/historical/cicada2013-second-onion-everything-you-need.asc",
"resources/historical/cicada2013-second-onion-icmp-echo.asc",
"resources/historical/cicada2014-stage09-first-jpeg-recovered.asc",
"resources/historical/cicada2014-stage11-message.asc",
"resources/historical/cicada2016-4gq25-outguess.asc",
"resources/historical/cicada2017-yEiTHhvF.asc",
"resources/historical/pklmx-2013/annapolis-md.txt.asc",
"resources/historical/pklmx-2013/okinawa-japan.txt.asc",
"resources/historical/pklmx-2013/standby.txt.asc"
];
/** @param {string} filename */
function signatureBytes(filename) {
  const source=fs.readFileSync(path.join(root,filename),"utf8");
  const marker="-----BEGIN PGP SIGNATURE-----";
  const index=source.indexOf(marker);
  assert(index>=0, filename);
  const lines=source.slice(index+marker.length).split(/\r?\n/);
  const separator=lines.findIndex(line=>line.trim()==="");
  assert(separator>=0, filename);
  const armor=lines.slice(separator+1).filter(line=>/^[A-Za-z0-9+/]+={0,2}$/.test(line)).join("");
  assert(armor.length>0, filename);
  return Buffer.from(armor,"base64");
}
/** @param {Buffer} buffer @returns {{tag:number,body:Buffer,totalLength:number}} */
function packet(buffer) {
  const header=buffer[0];
  assert(header&0x80);
  let offset=1,tag,size;
  if(header&0x40) {
    tag=header&63;
    const length=buffer[offset++];
    if(length<192)size=length;
    else if(length<224)size=((length-192)<<8)+buffer[offset++]+192;
    else if(length===255){size=buffer.readUInt32BE(offset);offset+=4;}
    else throw new Error("Partial packet length not part of this fixed archive");
  } else {
    tag=(header>>2)&15;
    const form=header&3;
    if(form===0)size=buffer[offset++];
    else if(form===1){size=buffer.readUInt16BE(offset);offset+=2;}
    else if(form===2){size=buffer.readUInt32BE(offset);offset+=4;}
    else throw new Error("Indeterminate packet size");
  }
  assert.equal(offset+size,buffer.length,"Exactly one OpenPGP signature packet");
  return {tag,body:buffer.subarray(offset),totalLength:buffer.length};
}
/** @param {Buffer} block */
function subpackets(block){
  const items=[];
  let offset=0;
  while(offset<block.length) {
    let length=block[offset++];
    if(length>=192&&length<255)length=((length-192)<<8)+block[offset++]+192;
    else if(length===255){length=block.readUInt32BE(offset);offset+=4;}
    assert(length>=1 && offset+length<=block.length);
    const value=block.subarray(offset+1,offset+length);
    items.push({type:block[offset]&127,critical:!!(block[offset]&128),value});
    offset+=length;
  }
  assert.equal(offset,block.length);
  return items;
}
/** @param {Buffer} signatureBody */
function parse(signatureBody) {
  assert.equal(signatureBody[0],4,"Expected OpenPGP v4 signed message");
  let offset=4;
  const hashedLength=signatureBody.readUInt16BE(offset);offset+=2;
  const hashed=subpackets(signatureBody.subarray(offset,offset+hashedLength));
  offset+=hashedLength;
  const unhashedLength=signatureBody.readUInt16BE(offset);offset+=2;
  const unhashed=subpackets(signatureBody.subarray(offset,offset+unhashedLength));
  offset+=unhashedLength;
  assert(offset+2<signatureBody.length);
  return {
    signatureType:signatureBody[1],
    publicKeyAlgorithm:signatureBody[2],
    hashAlgorithm:signatureBody[3],
    hashed,unhashed,
    length:signatureBody.length
  };
}
const observed=[];
for(const filename of sources) {
  const blob=signatureBytes(filename);
  const outer=packet(blob);
  assert.equal(outer.tag,2);
  assert.equal(blob.length,543);
  const sig=parse(outer.body);
  assert.equal(sig.length,540);
  assert.equal(sig.signatureType,1);
  assert.equal(sig.publicKeyAlgorithm,1);
  assert.ok(sig.hashAlgorithm===2||sig.hashAlgorithm===10);
  assert.deepEqual(sig.hashed.map(x=>x.type),[2],"Only timestamp hashed subpacket");
  assert.deepEqual(sig.unhashed.map(x=>x.type),[16],"Only issuer key ID unhashed subpacket");
  assert.equal(sig.hashed[0].value.length,4);
  assert.equal(sig.unhashed[0].value.toString("hex"),"181f01e57a35090f");
  observed.push({
    filename,signatureSha256:createHash("sha256").update(blob).digest("hex"),
    packetBytes:blob.length,rsaSignatureBodyBytes:sig.length,
    hashAlgorithm:sig.hashAlgorithm,
    creationTime:sig.hashed[0].value.readUInt32BE(0),
    signerKeyId:sig.unhashed[0].value.toString("hex"),
    hashedSubpacketTypes:sig.hashed.map(x=>x.type),
    unhashedSubpacketTypes:sig.unhashed.map(x=>x.type)
  });
}
/* Parser positive: a synthetic notation (type 20), to prove we detect one. */
const sourceBody=packet(signatureBytes(sources[0])).body;
const hashedLength=sourceBody.readUInt16BE(4);
const fakeNotation=Buffer.from([5,20,65,66,67,68]);
const inserted=Buffer.concat([
  sourceBody.subarray(0,4),
  Buffer.from([0,hashedLength+fakeNotation.length]),
  sourceBody.subarray(6,6+hashedLength),
  fakeNotation,
  sourceBody.subarray(6+hashedLength)
]);
const changed=parse(inserted);
assert.ok(changed.hashed.some(x=>x.type===20 && x.value.toString("ascii")==="ABCD"));
assert.ok(observed.every(x=>x.hashedSubpacketTypes.length===1&&x.unhashedSubpacketTypes.length===1));
const uniqueSignatures=new Set(observed.map(x=>x.signatureSha256)).size;
const stage10PrimeFilenames=new Set([107,167,229]);
const matchingStage10Clocks=observed.filter(item=>{
  const date=new Date(item.creationTime*1000);
  const hhmmss=date.getUTCHours()*10000+date.getUTCMinutes()*100+date.getUTCSeconds();
  return stage10PrimeFilenames.has(hhmmss);
}).map(item=>item.filename);
assert.deepEqual(matchingStage10Clocks,["resources/historical/cicada2016-4gq25-outguess.asc"]);
assert.equal(uniqueSignatures,14,"The 2014 May2 and stage11 files share one identical signature");
console.log(JSON.stringify({
  source:"15 original archived Cicada RSA clearsignatures, including independently pinned historical 2012–2017 stages",
  scopedFinding:"All 15 signature packets have only a four-byte creation time and an eight-byte issuer ID as their v4 metadata. None contains notation (20), embedded signature (32), or any other key-bearing extra subpacket.",
  sourceFileCount:observed.length,
  distinctSignatureBlocks:uniqueSignatures,
  retroactive2014Stage10FilenameClockMatches:matchingStage10Clocks,
  packetFormat:"OpenPGP v4 RSA signed message, total 543 bytes, signature packet body 540 bytes",
  positivePlant:"Synthetic type-20 notation ABCD inserted and detected exactly",
  caveat:"RSA signature MPI values are original signed cryptographic checks, not separately decoded hidden keys; this test only rules out the native OpenPGP metadata subpacket carrier.",
  findings:observed
},null,2));
