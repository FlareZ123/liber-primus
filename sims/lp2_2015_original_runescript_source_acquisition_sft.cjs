'use strict';
/**
 * Issue #1109: source-linked 2015 wiki original rune-decoder code acquisition.
 * Named source in 2015-07-07 original revision 26139 page 9003:
 *  - original runescript.py: http://pastebin.com/zXMgSFLM
 *  - original runes.py: http://git.io/xQrlUg
 * Static source only. Neither third-party script is executed.
 * Node 22. Manual source network test.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const urls=[
  {label:'runescript',source:'http://pastebin.com/zXMgSFLM',
    get:'https://pastebin.com/raw/zXMgSFLM'},
  {label:'runes-upstream',source:'http://git.io/xQrlUg',
    get:'https://git.io/xQrlUg'}
];
/** @param {Buffer} b @returns {string} */
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
/** @param {string} uri */
async function get(uri) {
  try {
    const r=await fetch(uri,{redirect:'follow',signal:AbortSignal.timeout(25000),
      headers:{'User-Agent':'Cicada-2015-dated-rune-source-static-acquisition/1.0'}});
    return {response:r,bytes:Buffer.from(await r.arrayBuffer())};
  }catch(e){return {error:String(e)};}
}
/** @param {string} s */
function metadata(s) {
  const lines=s.split(/\r?\n/);
  const selected=[];
  for(let i=0;i<lines.length;i++) {
    if(/^(?:def |class |import |from )|(?:decrypt|vigen|decode|rot|key|prime|frequency|bruteforce|source|help|usage)/i.test(lines[i])) {
      selected.push({line:i+1,text:lines[i].slice(0,210)});
    }
  }
  return {lines:lines.length,selected:selected.slice(0,90),selectedCount:selected.length,
    sourceTypes:{def:lines.filter(x=>/^def /.test(x)).length,
      plaintext:lines.filter(x=>/plain|translat|decryp/i.test(x)).length,
      key:lines.filter(x=>/key/i.test(x)).length}};
}
async function main() {
  assert.equal(urls.length,2);
  assert.equal(urls[0].get,'https://pastebin.com/raw/zXMgSFLM');
  console.log('SELFTEST original 2015 source code IDs PASS');
  if(!process.argv.includes('--network'))return;
  for(const item of urls) {
    const q=await get(item.get);
    if(q.error){console.log('RETRIEVAL',JSON.stringify({label:item.label,
      source:item.source,error:q.error}));continue;}
    const {response,bytes}=q;
    const string=bytes.toString('utf8');
    const header={label:item.label,source:item.source,final:response.url,
      http:response.status,type:response.headers.get('content-type'),
      bytes:bytes.length,sha256:sha256(bytes),
      html:/<html|<!doctype/i.test(string.slice(0,500)),head:string.slice(0,220)};
    console.log('RETRIEVAL',JSON.stringify(header));
    if(response.status===200&&!header.html&&bytes.length<200000){
      console.log('STATIC_METHOD',JSON.stringify({label:item.label,...metadata(string)}));
    }
  }
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
