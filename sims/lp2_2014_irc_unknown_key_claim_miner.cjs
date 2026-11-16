'use strict';

/**
 * Source-locked original 2014 unknown-LP2 key-claim inventory.
 * Processes untouched period Freenode logs read-only and extracts potential
 * first-party source links / decipherment claims; participants are unverified.
 * Node 22 (CommonJS), no dependencies, no file writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const sources = [
  {file:'#cicadasolvers.freenode.log', size:18487233, blob:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {file:'#cicadasolvers.freenode.2.log', size:27234234, blob:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {file:'#33012014.freenode.log', size:8629610, blob:'a2880b1db31ce523599ef30ca2e55291bf295900'},
];
const period = /^2014 (May|Jun|Jul|Aug|Sep) \d\d \d\d:\d\d /;
const page = /\b(?:liber|primus|runes?|page|pages|cipher|p(?:age)?[-\s]?(?:0|1|2|3|4|5|6|7|8|9|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-5]))\b/i;
const action = /\b(?:decrypt(?:ed|ion|ing)?|decipher(?:ed)?|solv(?:ed|ing)?|crack(?:ed)?|got it|found (?:the )?key|working key|plaintext|plain text|keyword|key|outguess|shift|vigenere|autokey|method|decoded|algorithm)\b/i;
const source = /\b(?:gist\.github\.com|pastebin\.com|github\.com|titanpad|etherpad|clue|url)\b/i;
const link = /https?:\/\/[^\s<>()"']+/g;

/** @param {Buffer} b */
function gitBlob(b) {
  return crypto.createHash('sha1').update('blob ' + b.length + '\0','ascii')
    .update(b).digest('hex');
}
/** @param {string} line */
function weight(line) {
  let w=0;
  if(page.test(line)) w+=3;
  if(action.test(line)) w+=4;
  if(source.test(line)) w+=1;
  if(/\b(?:worked|working|works|found|got|success|correct|right|confirmed|try|solution)\b/i.test(line)) w+=2;
  if(/\b(?:p56|page 56|an end|history|wiki|sudoku)\b/i.test(line)) w-=3;
  if(/https?:\/\//.test(line)) w+=1;
  return w;
}
/** @param {{file:string,size:number,blob:string}} meta */
async function read(meta) {
  const url = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/' +
    encodeURIComponent(meta.file);
  const response=await fetch(url, {headers:{'User-Agent':'LP2-source-research-2014'}});
  assert.equal(response.status,200, 'historical source HTTP status '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,meta.size,'byte size changed');
  assert.equal(gitBlob(bytes),meta.blob,'original Git source changed');
  const lines=bytes.toString('latin1').split(/\r?\n/);
  let periodCount=0;
  const messages=[], links=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!period.test(line)) continue;
    periodCount++;
    const rank=weight(line);
    if(rank>=7 && (page.test(line)||source.test(line))) {
      messages.push({n:i+1,rank,text:line.slice(0,480)});
    }
    for(const url of line.match(link)||[]){
      if(!/(pastebin\.com|gist\.github\.com|github\.com|titanpad|etherpad|raw\.githubusercontent)/i.test(url)) continue;
      links.push({n:i+1,rank,url:url.replace(/[.?,;!)]+$/,''),
        text:line.slice(0,480)});
    }
  }
  return {file:meta.file,sha:meta.blob,periodCount,messageCount:messages.length,linkCount:links.length,messages,links,lines};
}
(async()=>{
  const records=[];
  for(const s of sources) records.push(await read(s));
  const lines=records.flatMap(r=>r.messages.map(c=>({...c,file:r.file})))
    .sort((a,b)=>b.rank-a.rank || a.file.localeCompare(b.file) || a.n-b.n);
  const allLinks=new Map();
  for(const r of records)for(const l of r.links){
    const old=allLinks.get(l.url);
    if(!old||l.rank>old.rank)allLinks.set(l.url,{...l,file:r.file});
  }
  const selectedContexts=records.flatMap(r=>{
    const picks=r.file==="#cicadasolvers.freenode.log"?[165336,165780,175235,187146,188780,225858,226693,229866]:[];
    return picks.map(n=>({file:r.file,n,near:r.lines.slice(Math.max(0,n-15),n+14).map((line,i)=>({n:Math.max(0,n-15)+i+1,line:line.slice(0,360)}))}));
  });
  const output={
    selectedContexts,
    sources:records.map(r=>({file:r.file,sha:r.sha,periodCount:r.periodCount,
      matchingLines:r.messageCount,sourceLinkMentions:r.linkCount})),
    topUnknownPageMessages:lines.slice(0,150),
    uniqueLinkedOriginalSources:allLinks.size,
    topLinkedOriginalSources:[...allLinks.values()].sort((a,b)=>b.rank-a.rank).slice(0,130),
    status:'Contemporaneous but unauthenticated IRC participant statements; a cryptanalytic claim requires a source-frozen original-cipher inverse and independent holdout.'
  };
  console.log('MINER_OUTPUT_BEGIN');
  console.log(JSON.stringify(output,null,2));
  console.log('MINER_OUTPUT_END');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
