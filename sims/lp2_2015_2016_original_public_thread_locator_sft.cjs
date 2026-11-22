'use strict';
/**
 * LP2 2015–16 historical non-IRC public discussion link gate.
 * Source is original version-pinned, byte-verified IRC witness; no modern search.
 * Node 22 CommonJS. Read-only and deterministic.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const rev = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const sources = [
  {file:'#cicadasolvers.freenode.log', bytes:18487233,
    sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {file:'#cicadasolvers.freenode.2.log', bytes:27234234,
    sha:'72634a9d071d32af767edbffc0493d810e88cd0d'}
];
const dateRe = /^201[56] (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2} \d{2}:\d{2} <([^>]+)> (.*)$/;
const pageRe = /\b(?:lp2|liber primus|(?:page|pg|p)\s*#?\s*(?:0?[0-9]|[1-4][0-9]|5[0-5]))\b/i;
const subjectRe = /\b(?:liber|primus|runes?|cipher|decryp|deciph|plaintext|decode|solver|solved|translat|key|gematria|cicada)\b/i;
const claimRe = /\b(?:decrypt|solution|solve|key|decode|translation|plaintext|algorithm|method|shift|source|script)\b/i;
const hostsRe = /(?:reddit\.com|unfiction\.com|wikia\.com|fandom\.com|4chan\.org|4plebs\.org|archive\.4plebs|tumblr\.com|stackexchange\.com|cicada3301\.|forum|messageboard|discuss|discussion|board|thread|post\/)/i;
const knownFileRe = /(?:github|gist|pastebin|mediafire|dropbox|mega\.nz|youtube|imgur|drive\.google|docs\.google|titanpad|archive\.org|soundcloud|twitter|facebook)/i;

/** @param {Buffer} b */
function blobSha(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
/** @param {string} s */
function allUrls(s){
  return Array.from(s.matchAll(/(?:https?:\/\/|www\.)[^\s<>'"\)\]\[{}]+/ig),m=>m[0].replace(/[.,;:!?]+$/g,''));
}
/** @param {string} s */
function core(s){return s.toLowerCase().replace(/^https?:\/\/(www\.)?/,'').replace(/\/?[?#].*$/,'').replace(/\/$/,'');}
async function run(){
  assert.equal(blobSha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  const found = new Map();
  for(const source of sources){
    const url='https://raw.githubusercontent.com/neuroretransmit/cicada/'+rev+
      '/irc-logs/'+encodeURIComponent(source.file);
    const response=await fetch(url);
    assert.equal(response.status,200,'Original IRC source unavailable');
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length,source.bytes);
    assert.equal(blobSha(bytes),source.sha);
    const lines=bytes.toString('latin1').split(/\r?\n/);
    console.log('ORIGINAL verified '+source.file+' blob='+source.sha+' lines='+lines.length);
    for(let i=0;i<lines.length;i++){
      const m=dateRe.exec(lines[i]);
      if(!m)continue;
      const urls=allUrls(m[2]).filter(u=>hostsRe.test(u)&&!knownFileRe.test(u));
      if(!urls.length)continue;
      const around=lines.slice(Math.max(0,i-8),Math.min(lines.length,i+9))
        .filter(z=>z.slice(0,11)===lines[i].slice(0,11));
      const near=around.join(' ');
      if(!subjectRe.test(near))continue;
      const level=(pageRe.test(lines[i])?9:pageRe.test(near)?5:0)+
        (claimRe.test(lines[i])?6:claimRe.test(near)?3:0)+
        (subjectRe.test(lines[i])?4:2);
      for(const u of urls){
        const key=core(u), entry=found.get(key)||{url:u,mentions:0,records:[],score:0};
        entry.mentions++;
        entry.score=Math.max(level,entry.score);
        if(entry.records.length<5)entry.records.push({
          originalFile:source.file,line:i+1,date:lines[i].slice(0,17),
          nickname:m[1],direct:lines[i].slice(0,360),
          nearby:around.filter(z=>subjectRe.test(z)||claimRe.test(z)).slice(0,5)
            .map(z=>z.slice(0,260))
        });
        found.set(key,entry);
      }
    }
  }
  const rows=[...found.values()].sort((a,b)=>b.score-a.score||b.mentions-a.mentions||a.url.localeCompare(b.url));
  console.log('HISTORICAL_THREAD_CANDIDATES '+rows.length);
  for(const [i,r] of rows.entries())if(i<100)console.log('ORIGINAL_PUBLIC_THREAD '+(i+1)+' '+JSON.stringify(r));
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
