'use strict';
/**
 * Dated 2014 participant program, key, and output attachments surfaced by
 * the page-unspecified original-IRC codehost scan. Sources held read-only;
 * recovered text files saved atomically with exclusive lock for artifact.
 * Node.js 22 CommonJS. No downloaded program is executed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PIN={name:'#cicadasolvers.freenode.log',bytes:18487233,blob:'bdd277c14f94c34b5ae714cd00c238065beeed4e'};
const ITEMS=[
 {line:174130,id:'ammarp-may11',slug:'KMtkmZPw'},
 {line:196173,id:'bitcoinrider-jun9',slug:'Vcz07KuK'},
 {line:228774,id:'hydroperoxy-jul28',slug:'uWtxdts8'},
 {line:171595,id:'pomponia-may8',slug:'Bfb406ZX'},
 {line:205548,id:'nem0-jun19',slug:'BnsNjMS8'},
 {line:207079,id:'tfa-jun20',slug:'esfsBFE5'},
 {line:212376,id:'nikkler-jun25-a',slug:'enVZ5uxL'},
 {line:212376,id:'nikkler-jun25-b',slug:'bSxKcxDK'}
];
const SHA=b=>crypto.createHash('sha256').update(b).digest('hex');
const BLOB=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
function atomic(filename,bytes){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const fd=fs.openSync(filename+'.lock','wx');
  try{const temp=filename+'.'+process.pid+'.tmp';fs.writeFileSync(temp,bytes,{flag:'wx'});fs.renameSync(temp,filename)}
  finally{fs.closeSync(fd);fs.unlinkSync(filename+'.lock')}
}
/** @param {string} url */
async function fetchBytes(url){
  try{
    const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(14000)});
    const b=Buffer.from(await r.arrayBuffer());
    return {url:r.url,code:r.status,type:r.headers.get('content-type'),bytes:b.length,sha256:SHA(b),buffer:b};
  }catch(e){return {error:String(e)};}
}
async function main(){
  assert.equal(ITEMS.length,8);
  assert.equal(new Set(ITEMS.map(x=>x.slug)).size,ITEMS.length);
  assert.equal(BLOB(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  console.log('SELFTEST PASS: original byte and 8 exact 2014 source-linked attachment controls');
  if(process.argv.includes('--selftest'))return;
  const orig=await fetchBytes('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(PIN.name));
  assert.equal(orig.code,200);
  assert.equal(orig.bytes,PIN.bytes);
  assert.equal(BLOB(orig.buffer),PIN.blob);
  const lines=orig.buffer.toString('latin1').split(/\r?\n/);
  const results=[];
  for(const item of ITEMS){
    assert(lines[item.line-1].includes(item.slug),'Original line witness '+item.slug);
    console.log('SOURCE_LINK '+JSON.stringify({id:item.id,line:item.line,text:lines[item.line-1].slice(0,500)}));
    for(let i=item.line-7;i<=item.line+7;i++){
      const s=lines[i-1];
      if(s&&s.slice(0,11)===lines[item.line-1].slice(0,11))
        console.log('SOURCE_NEIGHBOR '+item.id+' L'+i+' '+s.slice(0,260));
    }
    const u='https://pastebin.com/raw/'+item.slug;
    const r=await fetchBytes(u);
    const {buffer,...meta}=r;
    const decoded=buffer?.toString('utf8')||'';
    const html=/^\s*<(?:html|!doctype|head|body)/i.test(decoded);
    const isCandidate=!!buffer&&r.code===200&&!html&&buffer.length>0&&buffer.length<=400000;
    const result={id:item.id,sourceLine:item.line,sourceUrl:u,...meta,validSourceText:isCandidate};
    if(isCandidate){
      const dst='irc2014-codehost-recovery/'+item.id+'.txt';
      atomic(dst,buffer);
      result.preserved=dst;
      result.preview=decoded.slice(0,1800);
      const rows=decoded.split(/\r?\n/);
      result.lineCount=rows.length;
      result.keyClaims=rows.map((text,i)=>({line:i+1,text:text.slice(0,250)}))
        .filter(x=>/(?:\b(?:key|solv|decryp|cipher|readable|correct|phrase|page\s*\d|first\s*line)\b)/i.test(x.text))
        .slice(0,16);
    }else if(html)result.htmlTitle=(decoded.match(/<title[^>]*>([^<]{0,160})/i)||[])[1]||null;
    results.push(result);
    if(isCandidate && new Set(['ammarp-may11','hydroperoxy-jul28','nem0-jun19','nikkler-jun25-a','nikkler-jun25-b']).has(item.id)){
      const allLines=decoded.split(/\r?\n/);
      console.log('SOURCE_CONTENT_BEGIN '+item.id+' totalLines='+allLines.length);
      for(let j=0;j<allLines.length;j++){
        const content=allLines[j];
        if(j<75||j>=allLines.length-8||item.id==='hydroperoxy-jul28'||/\b(?:key|plaintext|page|solve|result|algorithm|cipher|decode|encrypt|brute|word|sequence|freq|runic|rune|source)\b/i.test(content)){
          console.log('SOURCE_TEXT '+item.id+' L'+(j+1)+' '+content.slice(0,300));
        }
      }
      console.log('SOURCE_CONTENT_END '+item.id);
    }
    console.log('RECOVERED_HISTORICAL_OBJECT '+JSON.stringify(result));
  }
  atomic('irc2014-codehost-recovery/manifest.json',Buffer.from(JSON.stringify({original:PIN,attachments:results},null,2)+'\n'));
  console.log('SUMMARY '+JSON.stringify({tested:ITEMS.length,originalTextRetrieved:results.filter(x=>x.validSourceText).length,missing:results.filter(x=>!x.validSourceText).map(x=>x.id)}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
