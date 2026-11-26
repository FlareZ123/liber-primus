"use strict";
/*
 * Exact-byte gate for the p56 128-hex deep-web digest against the preserved
 * 2014 third-onion Apache server-status page snapshots.
 * Source: krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469 (GPL-3.0 community archive).
 * No HTML normalization, extracted-image hashing, or wrapper reconstruction.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const ARCHIVE="krisyotam/cicada3301";
const COMMIT="76d3ee8c762f60025822c8c05edbf31351636469";
const TARGET="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const CANDIDATES=[
  {
    "label": "apache-status-copy",
    "path": "archives/cijhho/2014/additional docs/Apache server status.txt",
    "size": 17674,
    "blob": "094e2a6d085b1052fcc22bfcac2aa9a5df6668c0"
  },
  {
    "label": "third-onion-original-status",
    "path": "archives/cijhho/assets/2014/li676-224_server-status_orig.txt",
    "size": 17476,
    "blob": "0f36e924b18642f94b29e719aac5f6a21df0ffd7"
  },
  {
    "label": "third-onion-updated-status",
    "path": "archives/cijhho/assets/2014/li676-224_server-status_new.txt",
    "size": 1370851,
    "blob": "0d824a4a91ed38c0bcddd24eeff72ca267717bce"
  },
  {
    "label": "third-onion-stage04-status",
    "path": "archives/cijhho/assets/2014/stage04/fv7lyucmeozzd5j4.onion/server-status",
    "size": 1370852,
    "blob": "071fb34c82ba56c5dfbba376200be43822e31ee0"
  }
];
const encodePath=p=>p.split("/").map(encodeURIComponent).join("/");
const gitBlobSHA1=b=>crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const algorithms=["sha512","blake2b512"];
for(const a of algorithms)if(!crypto.getHashes().includes(a))throw new Error("Unavailable hash "+a);
async function main(){
 const results=[];
 for(const item of CANDIDATES){
  const url="https://raw.githubusercontent.com/"+ARCHIVE+"/"+COMMIT+"/"+encodePath(item.path);
  const response=await fetch(url,{headers:{"User-Agent":"liber-primus-p56-server-status-sft"}});
  if(!response.ok)throw new Error(item.label+": HTTP "+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,item.size,item.label+" byte length");
  const blob=gitBlobSHA1(bytes);assert.equal(blob,item.blob,item.label+" Git blob SHA-1");
  const row={label:item.label,path:item.path,bytes:bytes.length,gitBlobSHA1:blob,
   sha512:crypto.createHash("sha512").update(bytes).digest("hex"),
   blake2b512:crypto.createHash("blake2b512").update(bytes).digest("hex")};
  row.matches={sha512:row.sha512===TARGET,blake2b512:row.blake2b512===TARGET};
  results.push(row);
 }
 const matches=results.filter(x=>x.matches.sha512||x.matches.blake2b512);
 console.log(JSON.stringify({source:{repository:ARCHIVE,commit:COMMIT},target:TARGET,
  scope:"four preserved third-onion server-status page snapshots; exact raw bytes only",
  algorithms,comparisons:results.length*algorithms.length,matches:matches.length,
  classification:matches.length?"MATCH FOUND":"BOUNDED NEGATIVE: no preserved server-status page snapshot matches",
  results},null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
