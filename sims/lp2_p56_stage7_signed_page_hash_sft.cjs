"use strict";
// Bounded original-source test: authentic 2014 Stage 7 signed page and exact MP3
// against the printed LP2 p56 digest under SHA-512 and historically claimed Whirlpool.
// No guessed URL, byte normalization, or input-dependent key phases.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const https = require("node:https");
const {spawnSync} = require("node:child_process");

const TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const URL = "https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/assets/2014/stage07/q4utgdi2n4m4uim5.onion/index.html";
const EXPECTED_SIGNED = {bytes:13526359, gitsha:"afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9"};
const EXPECTED_MP3 = {bytes:6651873, gitsha:"09fe068192b76a3697c47ec1d604b527703db798"};

function download(url, depth=0) {
  if (depth>4) return Promise.reject(new Error("Too many redirects"));
  return new Promise((resolve,reject)=>{
    https.get(url, {headers:{"user-agent":"lp2-source-key-audit/1.0"}}, res=>{
      if ([301,302,303,307,308].includes(res.statusCode)) {
        const next=res.headers.location;
        res.resume();
        if (!next) reject(new Error("Redirect missing Location"));
        else download(new URL(next,url).href,depth+1).then(resolve,reject);
        return;
      }
      if (res.statusCode!==200) {res.resume();reject(new Error("HTTP "+res.statusCode+" for pinned archive"));return;}
      const chunks=[];
      res.on("data",c=>chunks.push(c));
      res.on("end",()=>resolve(Buffer.concat(chunks)));
      res.on("error",reject);
    }).on("error",reject);
  });
}
function gitsha(buf) {
  const header=Buffer.from("blob "+buf.length+"\0","ascii");
  return crypto.createHash("sha1").update(header).update(buf).digest("hex");
}
function extractSignedHex(page) {
  const s=page.toString("ascii");
  const first=s.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");
  assert(first>=0,"Missing clear-signed header");
  const dblcr=s.indexOf("\r\n\r\n",first), dbl=s.indexOf("\n\n",first);
  const useCR=dblcr>=0 && (dbl<0 || dblcr<=dbl);
  const sep=useCR?dblcr:dbl, seplen=useCR?4:2;
  assert(sep>=0,"Missing separation after signed-page metadata");
  const tail=s.indexOf("-----BEGIN PGP SIGNATURE-----",sep+seplen);
  assert(tail>sep,"Missing signature delimiter");
  const raw=s.slice(sep+seplen,tail);
  const hex=raw.replace(/\s+/g,"");
  assert(/^[0-9a-fA-F]+$/.test(hex),"Signed payload includes non-hex characters");
  assert.equal(hex.length,13303746,"Signed hexadecimal payload length");
  return {raw:Buffer.from(raw,"ascii"), hex:Buffer.from(hex,"ascii"), mp3:Buffer.from(hex,"hex")};
}
function whirlpool(buf) {
  const exes=["openssl","openssl.exe","C:/Program Files/Git/mingw64/bin/openssl.exe","C:/Program Files/Git/usr/bin/openssl.exe","C:/Program Files/OpenSSL-Win64/bin/openssl.exe"];
  const argsets=[["dgst","-provider","default","-provider","legacy","-whirlpool"],["dgst","-whirlpool"]];
  for(const exe of exes) for(const args of argsets) {
    const r=spawnSync(exe,args,{input:buf,encoding:"utf8",maxBuffer:1024*1024,timeout:90000});
    if(r.status!==0)continue;
    const m=(r.stdout||"").match(/([0-9a-fA-F]{128})\s*$/);
    if(m)return {digest:m[1].toLowerCase(),method:exe+" "+args.join(" ")};
  }
  throw new Error("Whirlpool provider unavailable; cannot complete requested source candidate check");
}
async function main(){
  const page=await download(URL);
  assert.equal(page.length,EXPECTED_SIGNED.bytes);
  assert.equal(gitsha(page),EXPECTED_SIGNED.gitsha);
  const parts=extractSignedHex(page);
  assert.equal(parts.mp3.length,EXPECTED_MP3.bytes);
  assert.equal(gitsha(parts.mp3),EXPECTED_MP3.gitsha);
  const candidates=[
    ["raw_signed_stage7_page",page],
    ["raw_signed_cleartext_hex_with_whitespace",parts.raw],
    ["normalized_signed_hex_ascii",parts.hex],
    ["decoded_original_interconnectedness_mp3",parts.mp3]
  ];
  const result={input_url:URL,source_original_gitsha:gitsha(page),mp3_gitsha:gitsha(parts.mp3),
     target:TARGET,candidates:[]};
  for(const [name,bytes] of candidates){
    const sha512=crypto.createHash("sha512").update(bytes).digest("hex");
    const wh=whirlpool(bytes);
    result.candidates.push({name,bytes:bytes.length,sha512,whirlpool:wh.digest,
      whirlpool_provider:wh.method,sha512_matches_p56:sha512===TARGET,whirlpool_matches_p56:wh.digest===TARGET});
  }
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  console.log("STAGE7_P56_EXACT_BYTE_HASH_SFT_PASS");
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
