'use strict';
/**
 * Byte-exact SHA-512 preimage search of two independently archived 2014
 * Cicada-participant repositories, frozen before reading any hash results.
 * No salts, trimming, URL transforms, decoders or guessed keys.
 *
 * This is a complete negative/positive source inventory, not an attempt
 * to brute-force SHA-512 and not a substitute for private onion content.
 * Invoked in read-only GitHub Actions with the two repo paths as args.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const sha512 = data => crypto.createHash('sha512').update(data).digest('hex');
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
assert.equal(target.length,128);
assert.equal(sha512(Buffer.from('abc','ascii')),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
const root = path.resolve(__dirname,'..');
const historical = path.resolve(process.argv[2]||path.join(root,'upstream_micheloosterhof'));
const reconstructed = path.resolve(process.argv[3]||path.join(root,'upstream_neuroretransmit'));
assert.ok(fs.existsSync(historical),'Missing pinned micheloosterhof original archive');
assert.ok(fs.existsSync(reconstructed),'Missing pinned neuroretransmit original archive');

/** @param {string} dir @param {string} rel @param {string[]} out */
function walk(dir,rel,out) {
  for(const node of fs.readdirSync(path.join(dir,rel),{withFileTypes:true})) {
    if (node.name==='.git') continue;
    const next=path.join(rel,node.name);
    if(node.isDirectory()) walk(dir,next,out);
    else if(node.isFile()) out.push(next);
  }
}
/** @type {{kind:string,root:string,rel:string}[]} */
const records=[];
for(const [kind,base,prefix] of [
  ['2014-stage','upstream_micheloosterhof','stage'],
  ['2014-reconstruction','upstream_neuroretransmit','2014']
]) {
  const dirname=base==='upstream_micheloosterhof'?historical:reconstructed;
  assert.ok(fs.existsSync(dirname));
  const names=fs.readdirSync(dirname,{withFileTypes:true});
  const dirs=kind==='2014-stage'
    ?names.filter(e=>e.isDirectory()&&/^stage\d+$/i.test(e.name)).map(e=>e.name)
    :names.filter(e=>e.isDirectory()&&e.name==='2014').map(e=>e.name);
  assert.ok(dirs.length>0,'Missing source stage folders '+dirname);
  for(const d of dirs) {
    const sub=[];walk(dirname,d,sub);
    for(const rel of sub) records.push({kind,root:dirname,rel});
  }
}
for(const rel of [
  'resources/cicada2014-onion7-index.html',
  'resources/historical/cicada2014-stage11-message.asc'
]) {
  const file=path.join(root,rel);
  assert.ok(fs.existsSync(file));
  records.push({kind:'repo-original-copies',root,rel});
}
assert.ok(records.length>15,'Archives must contain more than 15 source files');
const seen=new Set(),summary={},hits=[],extensions={},cases=[];
for(const rec of records) {
  const bytes=fs.readFileSync(path.join(rec.root,rec.rel));
  const signature=sha256(bytes);
  const digest=sha512(bytes);
  if(!summary[rec.kind]) summary[rec.kind]={files:0,unique:0,bytes:0,zeroBytes:0};
  const row=summary[rec.kind];
  row.files++;row.bytes+=bytes.length;
  if(bytes.length===0)row.zeroBytes++;
  if(!seen.has(signature)){row.unique++;seen.add(signature);}
  const ext=path.extname(rec.rel).toLowerCase()||'(none)';
  extensions[ext]=(extensions[ext]||0)+1;
  if(digest===target)hits.push({kind:rec.kind,path:rec.rel,length:bytes.length,sha256:signature});
  if(/(?:index|\.html?)$/i.test(rec.rel)&&cases.length<16)
    cases.push({kind:rec.kind,path:rec.rel,length:bytes.length,sha512Prefix:digest.slice(0,20)});
}
assert.ok((summary['2014-stage']?.files||0)>15);
assert.ok((summary['2014-reconstruction']?.files||0)>15);
console.log(JSON.stringify({
  result: hits.length?'ORIGINAL_BYTE_PREIMAGE_FOUND':'NO_DIRECT_PREIMAGE_IN_FIXED_ARCHIVE',
  target,algorithm:'SHA-512 raw exact bytes, no canonicalization or salt',
  archives:{
    micheloosterhof:'historical pinned commit 6c3421a4d245596e403c88e037509d162a2afd17',
    neuroretransmit:'historical pinned commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3'
  },
  sourceCounts:summary,totalFiles:records.length,uniqueSha256Bytes:seen.size,
  extensions,firstIndexedHtml:cases,matchCount:hits.length,matches:hits,
  positiveSha512Abc:true,
  scope:'Only archived git files at two commits, not the unknown private Tor HTTP response or original live onion bytes.'
},null,2));
