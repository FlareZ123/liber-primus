'use strict';

/**
 * Source-dated in-channel LP2 readout search with dialogue carry-over.
 * Unlike a same-message page/claim query, this examines claims whose page
 * reference appears earlier in the 2014 discussion. It preserves original
 * line numbers and exact context; participant guesses are never plaintext.
 * Node.js 22, CommonJS, no packages.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

/** @typedef {{name:string, bytes:number, sha:string}} Original */
/** @type {Original[]} */
const origins = [
  {name:'#cicadasolvers.freenode.log',bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log',bytes:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#33012014.freenode.log',bytes:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const date = /^2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d <([^>]+)> (.*)$/;
const page = /\b(?:page|pg|pic(?:ture)?|p)\s*[:#.\-]?\s*(0?\d|[1-4]\d|5[0-5])\b/ig;
const claim = /\b(?:solved|decoded|decrypted|deciphered|translated|cracked|plaintext|cleartext|(?:it|this|that)\s+(?:says|reads|translates)|(?:i|we)\s+(?:got|have|found|figured|worked)|(?:first|next|second|last)\s+(?:word|line)s?\s+(?:is|are)|key\s+(?:is|works|found)|(?:works|worked)\s+(?:on|for))\b/i;
const method = /\b(?:key(?:word|stream)?|vigen[eè]re|caesar|cipher|rot\d+|shift(?:s|ed)?|prime(?:s)?|mod(?:ulo)?|totient|xor|transpos(?:e|ition)|matrix|mapping|formula|algorithm)\b/i;
const text = /(?:"[^"]{12,}"|'[^']{12,}'|\b(?:[A-Z]{3,}\s+){3,}[A-Z]{3,}\b)/;
const runes = /\b(?:TH|NG|EO|OE|EA|AE|IA|IO|ING|[A-Z])(?:[- /]+(?:TH|NG|EO|OE|EA|AE|IA|IO|ING|[A-Z])){7,}\b/i;
const guess = /\b(?:maybe|guess(?:ing)?|could|might|perhaps|trying|closest|not\s+(?:sure|working)|can't|cannot|doesn't|didn't|no\s+(?:idea|luck)|joking|jk|lol)\b/i;
const solved = /\b(?:page\s*56|p56|an\s+end|deep\s+web|36367763|hashes\s+to)\b/i;

/** @param {Buffer} b @returns {string} */
function gitHash(b) {
  return crypto.createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
}

/** @param {string} s @returns {number[]} */
function pages(s) {
  const result = [...s.matchAll(page)].map(m => Number(m[1])).filter(n => n <= 55);
  return [...new Set(result)];
}

/** @param {string} raw @param {number} line @returns {object|null} */
function row(raw, line) {
  const m = raw.match(date);
  if (!m) return null;
  return {line, day:raw.slice(0,11),minute:raw.slice(12,17),nick:m[1],
    body:m[2],pages:pages(m[2])};
}

/** @param {object[]} rows @returns {object[]} */
function mine(rows) {
  const candidates = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const c = claim.test(r.body), t = text.test(r.body), k = method.test(r.body);
    const q = runes.test(r.body);
    if (!(c || (t && k) || (q && k))) continue;
    let near = null;
    for (let j = i; j >= Math.max(0,i-80); j--) {
      const s = rows[j];
      if (s.day !== r.day) break;
      if (s.pages.length && !solved.test(s.body)) {near = {row:s,distance:i-j};break;}
    }
    if (!near) continue;
    const score = (c?10:0) + (t?8:0) + (k?5:0) + (q?7:0)
      + (r.pages.length?8:0) + (near.distance <= 5?7:near.distance <= 20?3:0)
      - (guess.test(r.body)?9:0) - (solved.test(r.body)?15:0);
    candidates.push({source:r.source,line:r.line,date:r.day+' '+r.minute,
      nick:r.nick, pages:near.row.pages, pageEvidenceLine:near.row.line,
      proximity:near.distance,score,body:r.body.slice(0,550),idx:i});
  }
  const selected = [];
  for (const candidate of candidates.sort((a,b)=>b.score-a.score||a.line-b.line)) {
    if(selected.some(x=>x.source===candidate.source &&
      Math.abs(x.line-candidate.line)<15)) continue;
    selected.push(candidate);
  }
  return {candidates, selected};
}

function selftest() {
  assert.equal(gitHash(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  assert.deepEqual(pages('page 54 and p0, page56 and p57'),[54,0]);
  const xs=[
    '2014 May 19 10:01 <a> page 42 has some stuff',
    '2014 May 19 10:02 <b> I decrypted it: "THE FOREST HAS A SECRET"',
    '2014 May 19 10:03 <b> try this key formula',
    '2014 May 20 10:04 <c> I decoded page 56 AN END'
  ].map((s,i)=>row(s,i+1)).filter(Boolean).map(s=>({...s,source:'plant'}));
  const hit=mine(xs);
  assert(hit.candidates.some(c=>c.line===2&&c.pages.includes(42)));
  assert(!hit.candidates.some(c=>c.line===4));
  console.log('SELFTEST PASS: source-hash, strict unknown-page parsing, conversation carry-over and day separation');
}

async function main(){
  selftest();
  let full = [];
  for(const origin of origins){
    const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'
      +encodeURIComponent(origin.name);
    const response=await fetch(url);
    assert.equal(response.status,200,'Original source HTTP '+url);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length,origin.bytes,'Source length '+origin.name);
    assert.equal(gitHash(bytes),origin.sha,'Original Git SHA '+origin.name);
    const lines=bytes.toString('latin1').split(/\r?\n/);
    const rows=[];
    for(let i=0;i<lines.length;i++){
      const r=row(lines[i],i+1);
      if(r)rows.push({...r,source:origin.name});
    }
    const m=mine(rows);
    console.log('ORIGINAL '+origin.name+' '+origin.sha+' sourceRows='+rows.length+
      ' dialogueCandidates='+m.candidates.length+' clusters='+m.selected.length);
    full.push({name:origin.name,rows,selected:m.selected});
  }
  const ranked=full.flatMap(f=>f.selected).sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date));
  console.log('RANKED DISTINCT DIALOGUE CLUSTERS '+ranked.length);
  for(let i=0;i<Math.min(90,ranked.length);i++){
    const c=ranked[i];
    console.log('HIT '+(i+1)+' '+JSON.stringify({...c,idx:undefined}));
    if(i>=24)continue;
    const source=full.find(f=>f.name===c.source);
    const j=c.idx;
    for(let t=Math.max(0,j-4);t<Math.min(source.rows.length,j+5);t++){
      const r=source.rows[t];
      if(r.day!==source.rows[j].day)continue;
      console.log('  L'+r.line+' '+r.day+' '+r.minute+' <'+r.nick+'> '+r.body.slice(0,360));
    }
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
