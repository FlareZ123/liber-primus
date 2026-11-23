'use strict';
/* Static original Jan 17 2016 solver program inspection; never execute source. */
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const URL='https://pastebin.com/raw/m5pqeHwW',N=59262,SHA='ecaca506b95cb771cd39a3173bd08914590181117b04c23b639455556993a80a';
(async()=>{
const r=await fetch(URL,{signal:AbortSignal.timeout(22000)});
assert.equal(r.status,200);
const b=Buffer.from(await r.arrayBuffer());
assert.equal(b.length,N);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),SHA);
const s=b.toString('utf8'),l=s.split(/\r?\n/);
console.log('PIN '+JSON.stringify({bytes:b.length,sha:SHA,lines:l.length}));
const tests=/^\s*(?:def\s|class\s|[A-Za-z_]\w*\s*=|for\s|if\s|while\s|return\b|print\b|import\s|from\s|#)/;
const target=/(?:def\s|class\s|print\b|key\b|crack|vigenere|cipher|decrypt|encrypt|pattern|english|plaintext|dictionary|find|result|output|shift|append|page\d?|for\s|while\s|break\b|return\b|with\s|wordlist|modulo|mod\s|range\(|open\(|urllib|eval\(|exec\(|__main__)/i;
for(let i=0;i<l.length;i++)if(tests.test(l[i])&&target.test(l[i]))
 console.log('DECL '+JSON.stringify({n:i+1,s:l[i].slice(0,420)}));
for(let i=Math.max(0,l.length-115);i<l.length;i++)console.log('TAIL L'+(i+1)+' '+l[i].slice(0,420));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});