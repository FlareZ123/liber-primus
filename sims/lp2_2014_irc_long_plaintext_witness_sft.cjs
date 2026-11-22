'use strict';
/**
 * Issue #959: original-2014 long plaintext-claim witness search.
 * Scans claims of decrypted prose rather than re-running prior operator menus.
 * Usage: node sims/lp2_2014_irc_long_plaintext_witness_sft.cjs LOG
 * @module lp2_2014_irc_long_plaintext_witness_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const SIZE=18487233, SHA='bdd277c14f94c34b5ae714cd00c238065beeed4e';
const date=/^2014 (May|Jun|Jul|Aug) (\d\d) (\d\d:\d\d) <([^>]+)> (.*)$/;
const page=/\b(?:page|pg|p)\s*[#:.\-]?\s*(0?[0-9]|[1-4][0-9]|5[0-5])\b/ig;
const claim=/\b(?:I(?:'ve| have| just)?|we(?:'ve| have)?|(?:it|this|the\s+text|the\s+page))\s+(?:\w+\s+){0,5}?(?:solved|decoded|deciphered|decrypted|translated|translates|says|reads|got\s+(?:it|this|the\s+page)|found\s+(?:a\s+)?(?:key|plaintext|message))\b|\b(?:actual|full|partial|entire|complete|first|last)\s+(?:plaintext|cleartext|translation|decryption|sentence|paragraph)\b|\b(?:plaintext|cleartext)\s*[:=]/i;
const prose=/(?:"[A-Za-z][^"\r\n]{45,}"|'[A-Za-z][^'\r\n]{45,}'|(?:\b[A-Z]{2,}\b[\s,.;:!?-]+){7,}\b[A-Z]{2,}\b)/g;
const key=/\b(?:key|shift|modulo|prime|totient|vigenere|autokey|cipher|algorithm|offset|decrypt|decode|plaintext|translated|translation|sentence|says|reads|meaning|message)\b/i;
const doubt=/\b(?:think|perhaps|maybe|guess|speculat|joke|troll|random|brute|can't|doesn't|wrong|false)\b/i;
const previous=[185125,185988,204070,216041,235622,186408,182827,184913,181056,198542,198163,212393,212618,217607,217752,223015,226753,235145,235620,186651,188780,190223,198540,220697,237788,237816,179464];
/** @param {Buffer} b @returns {string} */
function blob(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
/** @param {string} s @returns {number[]} */
function pages(s){page.lastIndex=0;return [...new Set([...s.matchAll(page)].map(m=>Number(m[1])))];}
/** @param {string} s @param {number} line @returns {object|null} */
function parse(s,line){const m=s.match(date);return m?{line,date:'2014 '+m[1]+' '+m[2],time:m[3],nick:m[4],text:m[5],pages:pages(m[5])}:null;}
/** @param {string} s @returns {number} */
function letters(s){let max=0;prose.lastIndex=0;for(const m of s.matchAll(prose)){if((m[0].match(/\b[A-Za-z]{2,}\b/g)||[]).length>=7)max=Math.max(max,m[0].replace(/[^A-Za-z]/g,'').length);}return max;}
/** @param {object[]} original @returns {object} */
function mine(original){
 const rows=original.filter(Boolean),hits=[];
 for(let i=0;i<rows.length;i++){
  const r=rows[i],c=claim.test(r.text),n=letters(r.text);
  if(!c&&!n)continue;
  if(!c&&!key.test(r.text))continue;
  if(previous.some(k=>Math.abs(k-r.line)<=25))continue;
  let near=null;
  for(let d=0;d<=70&&!near;d++)for(const j of d===0?[i]:[i-d,i+d]){
   const q=rows[j];if(!q||q.date!==r.date||!q.pages.length)continue;
   if(/\b(?:p(?:age)?\s*56|an\s+end|p(?:age)?\s*57|deep\s+web)\b/i.test(q.text))continue;
   near={line:q.line,pages:q.pages,dist:d,text:q.text.slice(0,200)};break;
  }
  if(!near)continue;
  const around=rows.slice(Math.max(0,i-8),Math.min(rows.length,i+9)).filter(q=>q.date===r.date);
  const extra=around.reduce((m,q)=>Math.max(m,letters(q.text)),0);
  if(!n&&!extra&&!/\b(?:full|complete|entire|paragraph|sentence|plaintext|cleartext|translation)\b/i.test(r.text))continue;
  const score=20*(n>=45)+10*(extra>=45)+8*c+7*(near.dist<=8)+5*(r.pages.length>0)+3*(near.dist<=25)-6*doubt.test(r.text)-Math.floor(near.dist/15);
  hits.push({line:r.line,date:r.date,time:r.time,nick:r.nick,body:r.text.slice(0,500),near,quoted:n,nearQuoted:extra,score,idx:i});
 }
 hits.sort((a,b)=>b.score-a.score||a.line-b.line);
 const distinct=[];
 for(const h of hits)if(!distinct.some(x=>Math.abs(x.line-h.line)<=12))distinct.push(h);
 return {rows,raw:hits.length,distinct};
}
function selftest(){
 assert.equal(blob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 assert.deepEqual(pages('p0 page55 page56 p57 and pg30'),[0,55,30]);
 const xs=['2014 May 12 12:01 <a> page 34','2014 May 12 12:02 <b> I decrypted a complete sentence','2014 May 12 12:03 <b> plaintext: "SOME LONG PLAIN ENGLISH SENTENCE WITH MANY LONG WORDS FOR TESTING HERE"','2014 May 13 12:00 <a> page 56','2014 May 13 12:01 <b> plaintext: "THIS VERY LONG TEXT IS ABOUT THE DEEP WEB AND THE END OF THE BOOK"'].map((s,i)=>parse(s,i+1));
 const out=mine(xs).distinct;
 assert(out.some(x=>x.line===3&&x.near.pages.includes(34)));
 assert(!out.some(x=>x.line===5));
 console.log('SELFTEST PASS: original SHA1, unknown-page scope, long-prose context, p56 separation');
}
function main(){
 selftest();if(process.argv.includes('--selftest'))return;
 assert.equal(process.argv.length,3);
 const b=fs.readFileSync(process.argv[2]);assert.equal(b.length,SIZE);assert.equal(blob(b),SHA);
 const lines=b.toString('latin1').split(/\r?\n/);
 const out=mine(lines.map((s,i)=>parse(s,i+1)));
 console.log('ORIGINAL '+JSON.stringify({bytes:SIZE,sha:SHA,lines:lines.length,dated:out.rows.length,eligible:out.raw,nonoverlap:out.distinct.length,excluded:previous}));
 for(const h of out.distinct.slice(0,90)){const {idx,...rest}=h;console.log('CLAIM '+JSON.stringify(rest));}
 for(const h of out.distinct.slice(0,28)){
  const context=out.rows.slice(Math.max(0,h.idx-7),Math.min(out.rows.length,h.idx+10)).filter(r=>r.date===h.date).map(r=>({L:r.line,who:r.nick,body:r.text.slice(0,550)}));
  console.log('DISCUSSION '+JSON.stringify({line:h.line,context}));
 }
}
main();