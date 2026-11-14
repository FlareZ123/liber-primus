'use strict';

/**
 * Original-period LP2 page-specific claim prospecting, 2014 May-August.
 * This is a source discovery tool, not a decoder or a claim of Cicada authorship.
 * Run with Node.js 22 CommonJS and the three original Freenode log files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const sources = [
  {name:'#cicadasolvers.freenode.log', size:18487233, blob:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log', size:27234234, blob:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#33012014.freenode.log', size:8629610, blob:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const dt = /^2014 (May|Jun|Jul|Aug) \d\d \d\d:\d\d /;
const pageRe = /\b(?:p(?:age)?[ #.:_-]*)(\d{1,2})\b/gi;
const operationRe = /\b(?:encrypt(?:ion|ed)?|decrypt(?:ed|ion)?|decode(?:d|r)?|decipher(?:ed)?|plaintext|plain text|vigen[eè]re|atbash|one.time.pad|xor|caesar|key(?:s|stream)?|prime(?:s)?|totient|fibonacci|modulo|cipher(?:s|text)?|solv(?:ed|ing|e)|crack(?:ed)?|crib|formula|function|algorithm|shift(?:s)?|password|rotat(?:e|ion))\b/i;
const strongRe = /\b(?:decrypt(?:ed|ion)?|decipher(?:ed)?|plaintext|plain text|key(?:stream)?|solv(?:ed|e)|algorithm|formula|cipher|vigen[eè]re|atbash|crib|sequence)\b/i;
/** @param {Buffer} b */
function gitBlob(b) {
  return crypto.createHash('sha1').update('blob '+b.length+'\0','ascii').update(b).digest('hex');
}
/** @param {string} line */
function pageIds(line) {
  const found = [];
  pageRe.lastIndex = 0;
  for (const m of line.matchAll(pageRe)) {
    const n = Number(m[1]); if (n>=0 && n<=55) found.push(n);
  }
  return found;
}
const perFile=[],hits=[],contextSamples=[];
for (const path of process.argv.slice(2)) {
  const src = sources.find(s=>path.endsWith(s.name));
  assert(src, 'Unknown log path '+path);
  const b=fs.readFileSync(path);
  assert.equal(b.length,src.size);
  assert.equal(gitBlob(b),src.blob);
  const lines=b.toString('latin1').split(/\r?\n/);
  let dated=0,seen=0,nearKnown56=0;
  for(let i=0;i<lines.length;i++) {
    const line=lines[i];
    if(!dt.test(line)) continue;
    dated++;
    const pages=pageIds(line);
    if(/\b(?:page\s*56|p56)\b/i.test(line))nearKnown56++;
    if(!pages.length) continue;
    seen++;
    const lo=Math.max(0,i-2),hi=Math.min(lines.length,i+3);
    const near=lines.slice(lo,hi);
    const anyOp=near.some(v=>operationRe.test(v));
    if(!anyOp)continue;
    const thisOp=operationRe.test(line),thisStrong=strongRe.test(line);
    const nearStrong=near.some(v=>strongRe.test(v));
    const claims=/\b(?:found|think|possibly|seems|got|works|result|translat(?:e|ion)|guess|try|got|reveal)\b/i.test(line);
    const codeOrKey=/\b(?:mod\s*29|fibonacci|vigen[eè]re|totient|prime|rotate|xor|\+1|hill|aes|sha|key(?:s|stream)?|formula|atbash)\b/i.test(near.join(' '));
    const score=(thisStrong?5:0)+(thisOp?3:0)+(nearStrong?2:0)+(claims?2:0)+(codeOrKey?3:0)+Math.min(3,pages.length);
    hits.push({source:src.name,line:i+1,date:line.slice(0,20),pages:[...new Set(pages)],score,
      text:line.slice(0,340),
      context:near.map((v,k)=>({line:lo+k+1,text:v.slice(0,310)}))
    });
  }
  if(src.name==='#cicadasolvers.freenode.log'){
    const sites=[198542,212402,230517,216041,195329,212616,201989,201889,184843];
    for(const site of sites)contextSamples.push({site,lines:lines.slice(site-26,site+25)
      .map((v,k)=>({line:site-25+k,text:v.slice(0,400)}))});
  }
  perFile.push({name:src.name,sourceBlob:src.blob,datedMayAug:dated,pageMentionLines:seen,knownP56References:nearKnown56});
}
assert.equal(process.argv.length,5);
const ordered=hits.slice().sort((a,b)=>b.score-a.score||a.source.localeCompare(b.source)||a.line-b.line);
const byPage={};for(const h of hits)for(const p of h.pages)byPage[p]=(byPage[p]||0)+1;
const signal=ordered.filter(h=>h.score>=11);
const perPage=Object.entries(byPage).map(([p,n])=>({page:Number(p),candidates:n})).sort((a,b)=>b.candidates-a.candidates);
const summary={files:perFile,candidatesTotal:hits.length,highSignalTotal:signal.length,perPage:perPage.slice(0,35),
 topClaims:signal.slice(0,75),contextSamples};
console.log(JSON.stringify(summary,null,2));
