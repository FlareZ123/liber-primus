"use strict";

/**
 * Period-authentic Steghide v0.5.1 JPEG carrier fingerprint gate.
 *
 * This tests every original LP1 and LP2 archive JPEG with nine fixed Cicada
 * source-literal passwords plus the standard empty passphrase. The first
 * 24-bit Steghide embedded magic is the necessary filter; any match is
 * followed by the upstream full identifier and actual payload extraction.
 *
 * External dependency: rickschaves/stegostudio at pinned commit
 * 201689b5755c0f1267223cd881429e679230b835, GPL-3.0. The oracle
 * fixtures were generated from an authentic Steghide Win32 v0.5.1 binary.
 * No decoder code is vendored.
 *
 * This is a Windows 11/Node.js 22 single runnable test file (SFT).
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const upstream=process.env.STEGOSTUDIO_DIR;
assert(upstream,"Missing STEGOSTUDIO_DIR pointing to pinned upstream checkout");
const up=file=>fs.readFileSync(path.join(upstream,file));
const api=new Function(
  up("src/jpeg_dct.js").toString("utf8")+"\n"+
  up("src/decoder.js").toString("utf8")+"\n"+
  "return {decodeJpegCoefficients,shJpegEValues,shMakeBitReader,shIdentifyJpeg,shDecodeJpeg};"
)();
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const magic=0x73688D;

/** @param {Uint8Array} values @param {string} passphrase */
function containsSteghideHeader(values,passphrase){
  const reader=api.shMakeBitReader(values,passphrase,3,2);
  return reader.getValue(24)===magic;
}

async function main(){
  const dir="test/fixtures/third-party/steghide-f12/";
  const manifest=JSON.parse(up(dir+"manifest.json"));
  assert.equal(manifest.oracleTool,"steghide version 0.5.1");
  const caseCbc=manifest.modes.find(x=>x.mode==="cbc");
  const witnessBytes=new Uint8Array(up(dir+caseCbc.file));
  assert.equal(sha(witnessBytes),caseCbc.sha256,"official fixture changed");
  const dct=api.decodeJpegCoefficients(witnessBytes);
  const values=api.shJpegEValues(witnessBytes,dct);
  assert(containsSteghideHeader(values,manifest.passphrase),
    "historical fixture not found by 24-bit source-format filter");
  assert(!containsSteghideHeader(values,manifest.wrongPassphrase),
    "wrong-password fixture unexpectedly passed");
  const tagged=api.shIdentifyJpeg(witnessBytes,manifest.passphrase,dct);
  assert(tagged && tagged.algo===2 && tagged.mode===1 && tagged.supported,
    "original v0.5.1 AES-CBC header not positively identified");
  const extracted=await api.shDecodeJpeg(witnessBytes,manifest.passphrase,dct);
  assert(extracted && extracted.data instanceof Uint8Array,"fixture extraction absent");
  assert.equal(sha(extracted.data),manifest.seed.payloadSha256);
  assert.equal(extracted.data.length,manifest.seed.payloadBytes);
  console.log("Steghide 0.5.1 positive:",extracted.data.length,
    "byte-exact AES-CBC payload; wrong password excluded");

  const passwords=[
    "", "3301", "7A35090F", "FOLD", "epiphany",
    "THE PRIMES ARE SACRED", "THE TOTIENT FUNCTION IS SACRED",
    "Liber Primus is the way", "LET THE TEXT GUIDE YOU", "SOME WISDOM"
  ];
  const findings=[];
  for(let archiveIndex=0;archiveIndex<75;archiveIndex++){
    const archive=String(archiveIndex).padStart(2,"0")+".jpg";
    const bytes=new Uint8Array(fs.readFileSync(path.join(root,"resources","liber-primus",archive)));
    const dec=api.decodeJpegCoefficients(bytes);
    const ev=api.shJpegEValues(bytes,dec);
    let candidates=0;
    for(const password of passwords){
      if(!containsSteghideHeader(ev,password))continue;
      candidates++;
      const header=api.shIdentifyJpeg(bytes,password,dec);
      const decoded=header?.supported ? await api.shDecodeJpeg(bytes,password,dec) : null;
      const finding={
        archive, password, header, length:decoded?.data?.length||0,
        sha256:decoded?.data ? sha(decoded.data):null,
        text:decoded?.text?.slice(0,512)||null
      };
      findings.push(finding);
      console.log("STEHIDE_ORIGINAL_MAGIC_HIT",JSON.stringify(finding));
    }
    console.log("Steghide original image",archive,"bytes",bytes.length,
      "nonzeroDct",ev.length,"keys",passwords.length,"magicCandidates",candidates);
    if(global.gc)global.gc();
  }
  console.log(JSON.stringify({
    status:"Steghide 0.5.1 original-archive fixed-key gate",
    oracle:"authentic Steghide 0.5.1 160-byte AES-CBC recovered byte exact",
    archiveCount:75, keysPerArchive:passwords.length,
    magicHits:findings.length,findings
  },null,2));
}

if(require.main===module)main().catch(err=>{console.error(err.stack||err);process.exit(1)});
