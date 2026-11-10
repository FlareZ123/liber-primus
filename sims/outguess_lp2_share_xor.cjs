"use strict";
/**
 * Compare LP2 default-key OutGuess arrays against the genuine 2014 three-share
 * bytewise-XOR secret-sharing mechanism. Entire aligned-subset family follows
 * from the common prefix, with a concrete all-triples scan and authentic plant.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const RAW=path.join(ROOT,"outguess-results");
const names=[17,21,43,57,58,59,60,61,62,63,64,65,68,69,70,71];
const streams=names.map(n=>fs.readFileSync(path.join(RAW,String(n).padStart(2,"0")+".payload")));
const SHA=b=>crypto.createHash("sha256").update(b).digest("hex");
/** @param {Buffer[]} arrays @returns {Buffer} */
function xor(arrays){
  assert.ok(arrays.length>0);
  const len=arrays[0].length;
  assert.ok(arrays.every(a=>a.length===len));
  const out=Buffer.alloc(len);
  for(const arr of arrays)for(let i=0;i<len;i++)out[i]^=arr[i];
  return out;
}
function commonPrefix(list){
  const n=Math.min(...list.map(x=>x.length));
  let i=0;while(i<n&&list.every(a=>a[i]===list[0][i]))i++;
  return i;
}
function commonSuffix(list){
  const n=Math.min(...list.map(x=>x.length));
  let i=0;while(i<n&&list.every(a=>a[a.length-1-i]===list[0][list[0].length-1-i]))i++;
  return i;
}
function main(){
  assert.deepEqual(streams.map(x=>x.length),Array(16).fill(58152));
  const historical=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/cicada2014-outguess-hex.json"),"utf8"));
  const shares=historical.sources.map(x=>Buffer.from(x.hex,"hex"));
  assert.deepEqual(shares.map(x=>x.length),[991,991,991]);
  const historicalText=xor(shares);
  assert.ok(historicalText.toString("utf8",0,40).startsWith("-----BEGIN PGP SIGNED MESSAGE-----"));
  const prefix=commonPrefix(streams),suffix=commonSuffix(streams);
  assert.ok(prefix>=1417&&suffix>=1554);
  assert.ok(!streams[0].subarray(0,prefix).includes(Buffer.from("-----BEGIN PGP")));
  assert.ok(streams[0][0]!==0);
  const needle=Buffer.from("-----BEGIN PGP SIGNED MESSAGE-----");
  let triples=0, signatures=0, bestPrintable=0, bestTriple=[];
  for(let a=0;a<16;a++)for(let b=a+1;b<16;b++)for(let c=b+1;c<16;c++){
    const data=xor([streams[a],streams[b],streams[c]]);
    triples++;
    if(data.subarray(0,needle.length).equals(needle))signatures++;
    let printable=0;
    for(const x of data)if(x===9||x===10||x===13||x>=32&&x<=126)printable++;
    const fraction=printable/data.length;
    if(fraction>bestPrintable){bestPrintable=fraction;bestTriple=[names[a],names[b],names[c]];}
  }
  // Search for historic PGP or base64-encoded historic PGP at any byte offset,
  // in all directly aligned 2-, 3- and 4-share combinations.
  let checked234=0,embeddedPGP=0,embeddedBase64PGP=0;
  const pgp=Buffer.from("-----BEGIN PGP");
  const pgp64=Buffer.from("LS0tLS1CRUdJTiBQR1A");
  for(let a=0;a<16;a++)for(let b=a+1;b<16;b++){
    const pair=xor([streams[a],streams[b]]);
    checked234++;
    embeddedPGP+=Number(pair.indexOf(pgp)>=0);
    embeddedBase64PGP+=Number(pair.indexOf(pgp64)>=0);
    for(let c=b+1;c<16;c++){
      const trio=xor([streams[a],streams[b],streams[c]]);
      checked234++;
      embeddedPGP+=Number(trio.indexOf(pgp)>=0);
      embeddedBase64PGP+=Number(trio.indexOf(pgp64)>=0);
      for(let d=c+1;d<16;d++){
        const quad=xor([streams[a],streams[b],streams[c],streams[d]]);
        checked234++;
        embeddedPGP+=Number(quad.indexOf(pgp)>=0);
        embeddedBase64PGP+=Number(quad.indexOf(pgp64)>=0);
      }
    }
  }
  assert.equal(checked234,2500);
  assert.equal(embeddedPGP,0);
  assert.equal(embeddedBase64PGP,0);
  assert.equal(triples,560);
  assert.equal(signatures,0);
  const originalPrefixHex=streams[0].subarray(0,32).toString("hex");
  const report={
    reference:"Authentic 2014 three-share XOR from pinned historical payload reference",
    referenceSourceCount:shares.length,referenceBytes:historicalText.length,
    referenceKnownSignedPGP:true,
    candidatePayloads:streams.length,candidateBytesEach:streams[0].length,
    commonPrefixBytes:prefix,commonSuffixBytes:suffix,
    sharedPrefixFirst32Hex:originalPrefixHex,
    evenSizeSubsetPrefix:"all zero bytes, common prefix length",
    oddSizeSubsetPrefix:"exact common non-PGP prefix",
    nonemptySubsetTotal:65535,nonemptyOddSubsets:32768,nonemptyEvenSubsets:32767,
    originalTriplesScanned:triples,PGPSignatureTriples:signatures,
    alignedSubsetsOfSize2to4CheckedAtAllByteOffsets:checked234,
    embeddedRawPGPSignatures:embeddedPGP,embeddedBase64PGPSignatures:embeddedBase64PGP,
    tripleMaxASCIIPrintableFraction:bestPrintable,tripleMaxASCIIPrintablePages:bestTriple,
    streamSHA256:Object.fromEntries(names.map((n,i)=>[String(n),SHA(streams[i])])),
    conclusion:"No aligned subset XOR of these 16 streams can start with an authentic PGP signed-message signature, for any nonempty subset size. This does not exclude offset, other binary formats, or other shares."
  };
  const target=path.join(RAW,"xor-share-summary.json");
  const tmp=target+".incomplete";
  fs.writeFileSync(tmp,JSON.stringify(report,null,2)+"\n");
  fs.renameSync(tmp,target);
  console.log("OUTGUESS_SHARE_XOR "+JSON.stringify(report));
  return report;
}
if(require.main===module)main();
module.exports={main,xor,commonPrefix,commonSuffix};
