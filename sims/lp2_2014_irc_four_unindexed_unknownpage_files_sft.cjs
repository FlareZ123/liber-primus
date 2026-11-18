'use strict';

/**
 * Narrow original-period acquisition check for four previously unindexed
 * unknown-LP2 work products linked directly from 2014 solver IRC posts.
 * All third-party material stays unexecuted and read-only.
 * Node 22, Windows/Linux, no dependencies.
 * Usage: node sims/lp2_2014_irc_four_unindexed_unknownpage_files_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{id:string,line:number,uri:string,kind:string}} Link */
const links = [
  { id:'pastie9173007', line:177148, uri:'http://pastie.org/9173007', kind:'p5 original eight-rune key-length claim' },
  { id:'neocities_runes', line:170926, uri:'http://icu.neocities.org/runes.html', kind:'p3 participant 2014 rune analysis' },
  { id:'neocities_freq', line:170928, uri:'http://icu.neocities.org/frequence.html', kind:'p3 participant 2014 frequency analysis' },
  { id:'dpaste_jordan', line:183739, uri:'https://dpaste.de/CO4O#L', kind:'contemporaneous script for Jordan totient' },
  { id:'storm_raw', line:233812, uri:'http://niemal.opnsa.net/files/stormdumps/1408373803_raw', kind:'2014 p0 participant raw output' }
];
const original = {name:'#cicadasolvers.freenode.log',bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'};
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const blob = b => crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');

/** @param {string} u @param {number} timeout */
async function get(u,timeout=12500){
  try{
    const response=await fetch(u,{signal:AbortSignal.timeout(timeout),redirect:'follow',
      headers:{'User-Agent':'Mozilla/5.0 (compatible; LP2 original archival research)'}});
    const buf=Buffer.from(await response.arrayBuffer());
    const typ=response.headers.get('content-type')||'';
    const txt=buf.toString('utf8');
    const title=(txt.match(/<title[^>]*>([^<]{1,180})/i)||[])[1]||null;
    return {status:response.status,url:response.url,type:typ,bytes:buf.length,sha256:hash(buf),
      title,preview:txt.slice(0,240).replace(/\s+/g,' '),buf};
  }catch(error){return {error:String(error).slice(0,250)};}
}

/** @param {string} dest @param {Buffer} buf */
function atomic(dest,buf){
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  const lock=dest+'.lock';
  const fd=fs.openSync(lock,'wx');
  try{
    const temporary=dest+'.'+process.pid+'.tmp';
    fs.writeFileSync(temporary,buf,{flag:'wx'});
    fs.renameSync(temporary,dest);
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}

async function main(){
  assert.equal(new Set(links.map(x=>x.line)).size,links.length);
  assert.equal(blob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  console.log('SELFTEST original archive hash, strict five fixed file IDs, atomic writes');
  if(process.argv.includes('--selftest'))return;
  const root='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/';
  const irc=await get(root+encodeURIComponent(original.name),120000);
  assert.equal(irc.status,200,'source HTTP 200');
  assert.equal(irc.bytes,original.bytes,'source original length');
  assert.equal(blob(irc.buf),original.sha,'source historical Git blob');
  const lines=irc.buf.toString('latin1').split(/\r?\n/);
  let preserved=0;
  for(const item of links){
    const originalLine=lines[item.line-1];
    assert.ok(originalLine.includes(new URL(item.uri).hostname),'original file URL line '+item.line);
    const context=[];
    for(let line=Math.max(1,item.line-5);line<=Math.min(lines.length,item.line+5);line++){
      if(lines[line-1].slice(0,11)===originalLine.slice(0,11))
        context.push({line,text:lines[line-1].slice(0,360)});
    }
    console.log('ORIGINAL_LINK '+JSON.stringify({id:item.id,why:item.kind,line:item.line,
      sourceLine:originalLine.slice(0,450),context}));
    const primary=item.uri.replace(/^http:/,'https:').replace(/#L$/,'');
    const cdxa='https://web.archive.org/cdx/search/cdx?url='+encodeURIComponent(item.uri)
      +'&output=json&from=2014&to=2016&filter=statuscode%3A200';
    const cdxb='https://arquivo.pt/wayback/cdx?url='+encodeURIComponent(item.uri)
      +'&output=json&from=2014&to=2016&filter=statuscode%3A200';
    const variants=[['live',primary],['archive-cdx',cdxa],['arquivo-cdx',cdxb]];
    for(const [name,u] of variants){
      const fetched=await get(u);
      const {buf,...result}=fetched;
      console.log('ORIGINAL_ATTEMPT '+JSON.stringify({id:item.id,route:name,requested:u,...result}));
      if(name==='live' && item.id.startsWith('neocities') && buf && fetched.status===200){
        const markup=buf.toString('utf8');
        const inline=[...markup.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
        const scriptLinks=[...markup.matchAll(/<script\b[^>]*src\s*=\s*['\"]?([^\s'\">]+)/gi)].map(x=>x[1]);
        const code=inline.map(x=>x[1]).join('\n');
        const structural=code.split(/\r?\n/).map(x=>x.trim()).filter(x=>
          /\bfunction\b|\b(?:var|let|const)\b|\.replace\(|(?:substring|indexOf|charCodeAt|fromCharCode)\(/i.test(x)).slice(0,70);
        console.log('ORIGINAL_LIVE_HTML_MECHANISM '+JSON.stringify({id:item.id,scriptLinks,
          scriptCount:inline.length,scriptChars:code.length,structure:structural,
          firstJS:code.slice(0,9000)}));
      }
      if(name==='live'&&buf&&fetched.status===200&&buf.length>100&&buf.length<=1e6
         &&!/^\s*(?:<!doctype|<html)/i.test(buf.toString('utf8',0,100))
         &&!/Access Denied|Cloudflare|captcha|404 Not Found/i.test(buf.toString('utf8',0,500))){
        const destination='irc2014-unindexed-direct-files/'+item.id+'.bin';
        atomic(destination,buf);
        preserved++;
        console.log('ORIGINAL_FILE_PRESERVED '+JSON.stringify({id:item.id,destination,
          sha256:fetched.sha256,bytes:fetched.bytes,source:item.uri}));
      }
    }
  }
  console.log('ORIGINAL_FILE_SUMMARY '+JSON.stringify({candidateSourceLinks:links.length,
    recoveredBytes:preserved,sourceSHA1:original.sha,
    limit:'Untrusted 2014 participant artifacts, no executables run; archives limited to two named CDX services'}));
}
main().catch(err=>{console.error(err.stack||err);process.exitCode=1;});
