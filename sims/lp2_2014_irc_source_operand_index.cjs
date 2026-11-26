'use strict';
// Agent32 #3106: source-operand index, not another plaintext-claim ranker.
// Node 22; no dependencies. Raw text preserved as Latin-1 byte mapping.
const fs=require('node:fs'), crypto=require('node:crypto'), assert=require('node:assert/strict'), path=require('node:path');
const origins=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']];
const patterns={
 page:/\b(?:page(?:s)?|pg|p(?:ic(?:ture)?|age)?)[ .:#-]*(?:[0-5]?\d)\b/i,
 cipher:/\b(?:rune|runic|gematria|cipher|decrypt|decipher|encrypt|vigen[eè]re|keystream|key|autokey|transposition|permutation|matrix|modulo|modulus|prime|totient|xor|base[ -]?(?:29|60|64)|fibonacci|frequency|substitution|shift)(?:s|ing|ed)?\b/i,
 visual:/\b(?:illustration|border|drawing|diagram|image|picture|scan|red|black|colour|color|dot|spiral|wing|tree|cuneiform|margin|punctuation|circumference|glyph|symbol|numeral)(?:s)?\b/i,
 carrier:/\b(?:outguess|steganograph\w*|jpeg|jpg|exif|payload|attachment|upload|download|archive|pastebin|titanpad|etherpad|mediafire|dropbox|file|zip|torrent)\b/i,
 source:/\b(?:book|author|edition|chapter|verse|poem|quotation|quote|reference|source|pdf|library|isbn|wiki(?:pedia)?|paper|article)\b/i,
 url:/https?:\/\/[^\s<>"']+|(?:www\.)[^\s<>"']+|[a-z2-7]{16}\.onion\b/ig,
 number:/\b(?:1033|3301|256|29|23|13|58|128|512)\b/i,
 operation:/\b(?:multiply|divide|subtract|add|reverse|reflect|rotate|read|index|offset|start|skip|remove|take|combine|concatenate|extract|replace|convert|order|sort|map|decode|encode|mod|sum|product)(?:s|ed|ing)?\b/i,
 expression:/(?:\b[a-z]\([a-z0-9]+\)\s*=|[0-9a-z)\]]\s*(?:\+|\*|%|=|->|=>)\s*[0-9a-z(\[]|\b(?:[0-9]{1,3}[, -]){4,}[0-9]{1,3}\b)/i
};
function tags(body){return Object.entries(patterns).filter(([k,re])=>{re.lastIndex=0;return re.test(body)}).map(([k])=>k)}
const relevant=t=>t.includes('page')||t.includes('cipher')||t.includes('carrier')||t.includes('url')||(t.includes('visual')&&(t.includes('operation')||t.includes('number')))||(t.includes('source')&&t.includes('operation'));
function parse(line){const m=line.match(/^(2014 [A-Z][a-z]{2} \d\d \d\d:\d\d)\s+(?:<([^>]+)>\s+)?(.*)$/);return m&&{date:m[1],nick:m[2]||null,body:m[3]}}
function norm(s){return s.replace(/\s+/g,' ').trim().toLowerCase()}
function known(s){return /\b(?:p(?:age\s*)?56|an end|36367763|vFCy7T5p0O|hJ8pVQ5S43|M5BccDpT|fibonacci.prime|a beginning|conditionedness|oversimplifying|p(?:age\s*)?54)\b/i.test(s)}
function score(r){const t=r.tags;let s=0;for(const [key,w] of Object.entries({page:4,cipher:3,visual:4,carrier:3,source:4,url:7,number:1,operation:4,expression:6}))if(t.includes(key))s+=w;
 if(t.includes('url')&&(t.includes('page')||t.includes('visual')||t.includes('cipher')))s+=8;
 if(t.includes('expression')&&t.includes('cipher'))s+=7;
 if(t.includes('source')&&t.includes('page'))s+=6;
 if(!r.nick)s-=5;
 if(known(r.body))s-=15;
 if(/\b(?:maybe|guess|could|might|lol|jk)\b/i.test(r.body))s-=2;
 if(r.body.length<20)s-=6;
 return s}
async function main(){
 assert.deepEqual(tags('page 27: reverse the wing diagram https://example.org/plate.jpg').sort(),['carrier','operation','page','url','visual'].sort());
 const unique=new Map(), counts={}, sourceLines={};
 for(const [name,bytes,sha] of origins){
  const response=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));
  assert.equal(response.status,200);const b=Buffer.from(await response.arrayBuffer());
  assert.equal(b.length,bytes);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),sha);
  const lines=b.toString('latin1').split(/\r?\n/);sourceLines[name]=lines;
  const c=counts[name]={dated:0,afterRelease:0,matching:0,afterReleaseMatches:0};
  for(let i=0;i<lines.length;i++){
   const r=parse(lines[i]);if(!r)continue;c.dated++;
   const after=/^2014 (?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) /.test(r.date);
   if(after)c.afterRelease++;
   const t=tags(r.body);if(!relevant(t))continue;c.matching++;if(after)c.afterReleaseMatches++;
   const k=norm(r.body);let q=unique.get(k);
   if(!q){q={body:r.body,tags:t,occurrences:[]};unique.set(k,q)}
   q.occurrences.push({file:name,line:i+1,date:r.date,nick:r.nick,body:r.body});
  }
 }
 const all=[...unique.values()];
 const ranked=all.flatMap(q=>{const o=q.occurrences.find(x=>/^2014 (?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) /.test(x.date));return o?[{...o,tags:q.tags,duplicates:q.occurrences.length}]:[]}).map(r=>({...r,score:score(r)})).sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date)||a.line-b.line);
 const panels={
 artwork:r=>r.tags.includes('visual')&&r.tags.includes('url'),
 assets:r=>r.tags.includes('carrier')&&r.tags.includes('url'),
 equations:r=>r.tags.includes('expression')&&r.tags.includes('cipher'),
 source:r=>r.tags.includes('source')&&(r.tags.includes('page')||r.tags.includes('cipher')),
 operations:r=>r.tags.includes('page')&&r.tags.includes('operation')&&(r.tags.includes('visual')||r.tags.includes('cipher')),
 };
 const selected={};
 for(const [label,pred] of Object.entries(panels)){const x=[];for(const r of ranked){if(!pred(r)||known(r.body)||x.some(q=>q.file===r.file&&Math.abs(q.line-r.line)<8))continue;x.push(r);if(x.length>=22)break}selected[label]=x}
 const output={scope:'All dated 2014 lines; ranking May-Dec only; keyword retrieval not exhaustive semantic review',counts,unique:all.length,rankedCount:ranked.length,selected,index:all};
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(output));
 console.log('INDEX '+JSON.stringify({counts,unique:all.length,rankedCount:ranked.length}));
 for(const [label,x] of Object.entries(selected)){console.log('PANEL '+label);for(const r of x)console.log(JSON.stringify(r))}
 console.log('END INDEX');
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
