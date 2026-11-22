'use strict';
/**
 * Acquire source-posted July 30, 2014 modified rcrypto and its OEIS helper.
 * Strict original IRC URL witnesses, original program hash, static-only source
 * inspection. Never execute downloaded Python.
 * Node.js 22 CommonJS, local or manual-only GitHub Actions.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const SOURCE={name:'#cicadasolvers.freenode.log',size:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'};
const SOURCES=[
  {line:229856,id:'rcrypto-modified',slug:'dGJSgN0m',expectedBytes:26295,sha256:'4ff35eacb900a99fc87890048e9b360d22e2483dde4ce75cc062b9c969720e70'},
  {line:229860,id:'oeis-modified',slug:'9U7SbHQE'},
  {line:229863,id:'page56-input',slug:'8cStVBG9'}
];
/** @param {Buffer} b */
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
/** @param {Buffer} b */
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
/** @param {string} filename @param {Buffer} b */
function atomic(filename,b){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const fd=fs.openSync(filename+'.lock','wx');
  try{const tmp=filename+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,filename);}
  finally{fs.closeSync(fd);fs.unlinkSync(filename+'.lock');}
}
/** @param {string} uri */
async function get(uri){
  const r=await fetch(uri,{redirect:'follow',signal:AbortSignal.timeout(30000)});
  const b=Buffer.from(await r.arrayBuffer());
  return {status:r.status,buffer:b,contentType:r.headers.get('content-type'),url:r.url};
}
/** @param {string} id @param {string} source */
function inspect(id,source){
  const lines=source.split(/\r?\n/);
  const members=[];
  const matcher=/\b(?:import|class|def|OEIS|rcrypto|prime|key(?:word|stream)?|sequence|p54|page\s*(?:0|54)|decrypt|decipher|vigenere|unshift|translat|shift|totient|cipher|gen(?:erator)?|guess|__main__)\b/i;
  for(let i=0;i<lines.length;i++){
    if(/^\s*(?:def|class|from|import)\s+/.test(lines[i])||matcher.test(lines[i]))
      members.push(i);
  }
  const shown=new Set();
  for(const i of members){
    for(let j=Math.max(0,i-2);j<=Math.min(lines.length-1,i+3);j++)shown.add(j);
  }
  console.log('SOURCE_OUTLINE '+JSON.stringify({id,lines:lines.length,functions:lines.map((t,i)=>({line:i+1,text:t.trim()})).filter(x=>/^\s*(?:def|class)\s+/.test(x.text)),keywordContextLines:shown.size}));
  for(const i of [...shown].sort((a,b)=>a-b).slice(0,420)){
    console.log('SOURCE_LINE '+id+' '+(i+1)+' '+lines[i].slice(0,320));
  }
  if(shown.size>420)console.log('SOURCE_TRUNCATED '+id+' '+(shown.size-420));
  if(id==='rcrypto-modified'){
    for(const [from,to] of [[110,152],[356,430],[682,697],[711,757]]){
      for(let i=from;i<=to;i++)console.log('TARGET_LINE '+id+' L'+i+' '+lines[i-1]);
    }
  }
}
/** @returns {Promise<void>} */
async function main(){
  assert.equal(SOURCES.length,3);
  assert.equal(blob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  assert.equal(SOURCES[0].slug,'dGJSgN0m');
  console.log('SELFTEST PASS: original Git SHA, exact first-source identity, static-only inspection');
  if(process.argv.includes('--selftest'))return;
  const uri='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(SOURCE.name);
  const orig=await get(uri);
  assert.equal(orig.status,200,'Original IRC status');
  assert.equal(orig.buffer.length,SOURCE.size,'Original IRC bytes');
  assert.equal(blob(orig.buffer),SOURCE.sha,'Original Git source blob');
  const lines=orig.buffer.toString('latin1').split(/\r?\n/);
  for(const item of SOURCES){
    assert(lines[item.line-1].includes('http://pastebin.com/'+item.slug),'2014 exact link witness '+item.id);
    console.log('HISTORICAL_CLAIM '+item.id+' L'+item.line+' '+lines[item.line-1].slice(0,400));
    const result=await get('https://pastebin.com/raw/'+item.slug);
    assert.equal(result.status,200,item.id+' HTTP status');
    if(item.expectedBytes)assert.equal(result.buffer.length,item.expectedBytes,item.id+' source bytes');
    if(item.sha256)assert.equal(sha(result.buffer),item.sha256,item.id+' SHA256');
    assert(result.buffer.length>50&&result.buffer.length<300000,'Reasonable source size');
    const text=result.buffer.toString('utf8');
    const html=/^\s*<(?:!doctype|html|head|body)/i.test(text);
    assert(!html,'HTML response rather than original source');
    console.log('ORIGINAL_FILE '+JSON.stringify({id:item.id,sourceLine:item.line,bytes:result.buffer.length,sha256:sha(result.buffer),url:result.url,first180:text.slice(0,180)}));
    atomic('irc2014-source-code/'+item.id+'.py',result.buffer);
    if(item.id==='page56-input')console.log('SOURCE_COMPLETE page56-input '+text.slice(0,2500));
    else inspect(item.id,text);
  }

  const older=await get('https://raw.githubusercontent.com/kenorb-contrib/cicada_toolset/bd63ab1475e08b6125860f5c74f0271977ab8a69/runeaylze/rcrypto.py');
  assert.equal(older.status,200,'2014 cluosh source');
  assert.equal(older.buffer.length,18283,'2014 original rcrypto bytes');
  assert.equal(blob(older.buffer),'9a82a844d8574d2040eed60de76f4becdd77a666','2014 original rcrypto git blob');
  const newer=await get('https://pastebin.com/raw/dGJSgN0m');
  assert.equal(sha(newer.buffer),SOURCES[0].sha256,'2014 modified rcrypto repeat fetch');
  /** @param {string} raw */
  function blocks(raw){
    const result=new Map(),rows=raw.replace(/\r\n/g,'\n').split('\n');
    const starts=[];
    for(let i=0;i<rows.length;i++){
      const m=/^([ \t]*)(def|class)\s+([A-Za-z_][A-Za-z_0-9]*)/.exec(rows[i]);
      if(m)starts.push({i,indent:m[1].replaceAll('\t','    ').length,type:m[2],name:m[3]});
    }
    for(const a of starts){
      const after=starts.find(x=>x.i>a.i&&x.indent<=a.indent);
      const body=rows.slice(a.i,after?after.i:rows.length).join('\n').replace(/\s+$/,'');
      result.set(a.type+' '+a.name,{first:a.i+1,lines:body.split('\n').length,hash:sha(Buffer.from(body))});
    }
    return result;
  }
  const oldBlocks=blocks(older.buffer.toString('utf8'));
  const newBlocks=blocks(newer.buffer.toString('utf8'));
  const delta=[...new Set([...oldBlocks.keys(),...newBlocks.keys()])]
    .filter(name=>oldBlocks.get(name)?.hash!==newBlocks.get(name)?.hash)
    .map(name=>({name,old:oldBlocks.get(name)||null,new:newBlocks.get(name)||null}));
  console.log('HISTORICAL_DIFF '+JSON.stringify({originalBytes:older.buffer.length,originalBlob:blob(older.buffer),modifiedBytes:newer.buffer.length,modifiedSha256:sha(newer.buffer),oldFunctions:oldBlocks.size,newFunctions:newBlocks.size,modifiedOrAdded:delta},null,2));
  for(let i=229850;i<=229888;i++)console.log('ORIGINAL_CONTEXT L'+i+' '+lines[i-1].slice(0,500));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
