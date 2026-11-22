'use strict';

/**
 * Source-era 1033/3301 cuneiform-to-prime_echo bridge acquisition.
 * Inspects pinned original Freenode logs only; never treats participant
 * conjectures as Cicada-issued instructions.
 * Node 22, CommonJS, no packages, read-only. Run in manual GitHub Actions.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

/** @typedef {{name:string,size:number,sha:string}} Source */
/** @type {Source[]} */
const sources = [
  {name:'#cicadasolvers.freenode.log',size:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log',size:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#33012014.freenode.log',size:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const relevantYear = /^201[456] /;
const dated = /^201[456] [A-Z][a-z]{2} \d{2} \d{2}:\d{2} /;
const needle = /\b(?:1033|cuneiform|babylon(?:ian)?|sumer(?:ian)?|sexagesimal|prime[_ -]?echo|prime\s+countdown|prime\s+video|pause(?:d|s|ing)?\s+(?:at|on)\s+1033)\b/i;
const theme = /\b(?:prime(?:s)?|rune(?:s)?|liber|primus|page(?:s)?|p3[3-9]|iso|cicada|os|image|video|key|cuneiform|babylon|numbers?|square|code|decrypt|cipher|2013|2014)\b/i;
const bridge = /\b(?:cuneiform|babylon(?:ian)?|sumer(?:ian)?|sexagesimal|prime[_ -]?echo|prime\s+countdown|1033)\b/i;

/** @param {Buffer} bytes */
function gitBlob(bytes) {
  return crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}

/** @param {string[]} lines @param {number} i @returns {string[]} */
function context(lines,i) {
  const day = lines[i].slice(0,11);
  const out = [];
  for (let j=Math.max(0,i-5);j<=Math.min(lines.length-1,i+5);j++) {
    if (!dated.test(lines[j]) || lines[j].slice(0,11)!==day) continue;
    out.push((j+1)+':'+lines[j].slice(0,350));
  }
  return out;
}

/** @param {string[]} lines @param {string} source */
function inspect(lines,source) {
  const hits = [];
  for (let i=0;i<lines.length;i++) {
    const s=lines[i];
    if (!dated.test(s)||!needle.test(s)) continue;
    const ctx=context(lines,i);
    const neighborhood=ctx.join(' ');
    const score=(/1033/.test(s)?3:0)
      +(/cunei|babylon|sumer|sexagesimal/i.test(s)?7:0)
      +(/prime[_ -]?echo|countdown|pause/i.test(s)?7:0)
      +(/p3[3-9]|page\s*(?:3[3-9]|5[0-6])|liber|primus/i.test(neighborhood)?4:0)
      +(bridge.test(neighborhood)&&theme.test(neighborhood)?2:0);
    hits.push({source,line:i+1,date:s.slice(0,17),score,body:s.slice(0,300),context:ctx});
  }
  return hits;
}

async function main() {
  assert(needle.test('2014 May 22 00:10 <x> cuneiform and 1033'));
  assert(needle.test('2014 May 22 00:10 <x> prime_echo pauses'));
  assert(!needle.test('2014 May 22 00:10 <x> unrelated comment'));
  const all = [];
  for(const source of sources) {
    const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(source.name);
    const res=await fetch(url);
    assert.equal(res.status,200,'original IRC source '+source.name);
    const b=Buffer.from(await res.arrayBuffer());
    assert.equal(b.length,source.size,'source byte count '+source.name);
    assert.equal(gitBlob(b),source.sha,'source Git blob identity '+source.name);
    const lines=b.toString('latin1').split(/\r?\n/);
    const hits=inspect(lines,source.name);
    console.log('SOURCE '+JSON.stringify({name:source.name,sha:source.sha,lines:lines.length,hits:hits.length}));
    all.push(...hits);
  }
  const matchedPauses=all.filter(x=>/prime[_ -]?echo|prime\\s+countdown|\\bpaus(?:e|ed|es|ing)\\b/i.test(x.body));
  const oldMay=all.filter(x=>x.date.startsWith('2014 May')&&/1033|cunei|babylon|sexagesimal/i.test(x.body));
  const strictBridge=all.filter(x=>/1033/.test(x.context.join(' ')) &&
    /prime[_ -]?echo|prime\\s+countdown|\\bpaus(?:e|ed|es|ing)\\b/i.test(x.context.join(' ')) &&
    /p(?:age)?\\s*3[3-9]|cuneiform|babylon|sexagesimal/i.test(x.context.join(' ')));
  console.log('PAUSE_REFERENCES '+JSON.stringify(matchedPauses.map(x=>({source:x.source,line:x.line,date:x.date,body:x.body}))));
  console.log('MAY2014_CUNEI '+JSON.stringify(oldMay.map(x=>({source:x.source,line:x.line,date:x.date,body:x.body}))));
  console.log('STRICT_CUNEIFORM_PRIMEECHO_BRIDGES '+JSON.stringify(strictBridge.map(x=>({source:x.source,line:x.line,date:x.date,body:x.body}))));
  const ranked=all.sort((a,b)=>b.score-a.score||a.source.localeCompare(b.source)||a.line-b.line);
  console.log('BRIDGE_CANDIDATES '+ranked.length);
  const distinctive=ranked.filter(x=>/cuneiform|babylon|sexagesimal|prime[_ -]?echo|prime\s+countdown/i.test(x.body));
  console.log('DISTINCTIVE_CANDIDATES '+distinctive.length);
  for(const h of distinctive.slice(0,50)) console.log('DISTINCT '+JSON.stringify(h));
  const other=ranked.filter(x=>!distinctive.includes(x));
  for(const h of other.slice(0,50)) console.log('NUMBER '+JSON.stringify(h));
  console.log('SOURCE_SCAN_DONE '+JSON.stringify({originalSourceCount:sources.length,distinctive:distinctive.length,total:all.length}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
