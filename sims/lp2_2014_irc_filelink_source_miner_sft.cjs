'use strict';
/**
 * Source-locked May--August 2014 IRC file/code link mining.
 * Node.js 22 CommonJS. Result is participant evidence, not 3301 instructions.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
/** @typedef {{name:string,bytes:number,sha:string}} OriginalLog */
/** @type {OriginalLog[]} */
const origins=[
 {name:'#cicadasolvers.freenode.log',bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
 {name:'#cicadasolvers.freenode.2.log',bytes:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
 {name:'#33012014.freenode.log',bytes:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
/** @param {Buffer} b */
function gitSha(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
/** @param {string} line */
function period(line){return /^2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d\b/.test(line);}
/** @param {string} line */
function urls(line){
 return (line.match(/https?:\/\/[^\s<>"'\x00-\x20]+/ig)||[])
 .map(u=>u.replace(/[.,;:!?)\]}]+$/g,''))
 .filter(u=>!/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|twitter\.com|facebook\.com|x\.com)\//i.test(u));
}
/** @param {string} s */
function textScore(s){
 let n=0;
 if(/\b(?:liber[\s-]?primus|lp2|page\s*(?:0?[0-9]|[1-5][0-9])\b|runic|runes?|gematria|ciphertext)\b/i.test(s))n+=6;
 if(/\b(?:decrypt(?:ed|ion|ing)?|decipher|crack(?:ed|ing)?|plaintext|solve|solved|key(?:space|stream|word)?|cipher|cryptanalysis)\b/i.test(s))n+=5;
 if(/\b(?:script|source|code|program|python|ruby|perl|paste(?:bin)?|github|gist|download|algorithm|formula|function)\b/i.test(s))n+=4;
 if(/\b(?:prime|totient|vigenere|caesar|transpos|hash|image|onion|page\s*56|p56)\b/i.test(s))n+=2;
 return n;
}
/** @param {string} url */
function urlScore(url){
 let n=0;
 if(/(?:gist\.github\.com|github\.com|pastebin\.com|bpaste\.net|hastebin|bitbucket|sourceforge|raw\.githubusercontent|codepad|ideone)/i.test(url))n+=8;
 if(/\.(?:py|rb|pl|js|c|cpp|h|txt|zip|7z|tar(?:\.gz)?|tgz|pdf|bin|json)(?:[?#]|$)/i.test(url))n+=7;
 if(/(?:dl\.dropboxusercontent|dropbox\.com|mediafire|mega\.|transfer\.sh|tinyupload|sendspace|filedropper)/i.test(url))n+=5;
 if(/(?:image|imgur|jpg|jpeg|png|gif|youtube|google\.|wikipedia|pastehtml)/i.test(url))n-=3;
 return n;
}
/** @param {string[]} lines @param {string} source */
function mine(lines,source){
 const hits=[];
 for(let i=0;i<lines.length;i++){
  if(!period(lines[i]))continue;
  const context=lines.slice(Math.max(0,i-3),Math.min(lines.length,i+4)).filter(period);
  for(const url of urls(lines[i])){
   const score=textScore(lines[i])*3+Math.max(0,...context.map(textScore))+urlScore(url);
   if(score<12)continue;
   hits.push({source,line:i+1,url,score,date:lines[i].slice(0,17),
    quote:lines[i].slice(0,560),context:context.map(x=>x.slice(0,350))});
  }
 }
 return hits;
}
/** @param {string} file */
function read(file){
 const origin=origins.find(o=>file.endsWith(o.name));
 assert(origin,'Unexpected log path '+file);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.length,origin.bytes,'Source length: '+origin.name);
 assert.equal(gitSha(bytes),origin.sha,'Source Git SHA: '+origin.name);
 const hits=mine(bytes.toString('latin1').split(/\r?\n/),origin.name);
 console.log('VERIFIED '+origin.name+' '+origin.bytes+' '+origin.sha+' eligible-URL-hits='+hits.length);
 return hits;
}
function selftest(){
 const lines=[
  '2014 May 13 12:00 <me> I have a python script to decrypt Liber Primus runes',
  '2014 May 13 12:01 <me> source: https://gist.github.com/puzzle/1234',
  '2014 May 13 12:02 <you> did the key recover anything?',
  '2014 Apr 13 12:04 <you> https://github.com/irrelevant',
  '2014 Aug 13 12:05 <you> https://example.org/a.zip',
  '2015 Jun 13 12:06 <you> new cipher https://gist.github.com/puzzle/1234'
 ];
 const hits=mine(lines,'plant');
 assert(hits.some(x=>x.url==='https://gist.github.com/puzzle/1234'&&x.line===2));
 assert(!hits.some(x=>x.url==='https://github.com/irrelevant'));
 assert(!hits.some(x=>x.date.startsWith('2015')));
 assert.equal(gitSha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 console.log('PASS: original May-Aug date gate, contextual script URLs, Git blob identity');
}
function main(){
 selftest();
 if(process.argv.includes('--selftest'))return;
 assert.equal(process.argv.length,5,'Pass three original 2014 log paths');
 const all=process.argv.slice(2).flatMap(read), unique=new Map();
 for(const hit of all){
  const key=hit.url.toLowerCase().replace(/^http:/,'https:');
  if(!unique.has(key)||hit.score>unique.get(key).score)unique.set(key,hit);
 }
 const ranked=[...unique.values()].sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date));
 console.log('TOTAL eligible-hits='+all.length+' distinct-source-urls='+unique.size+'; best-ranked 75 below');
 for(let i=0;i<Math.min(75,ranked.length);i++)
  console.log('CANDIDATE '+(i+1)+' '+JSON.stringify(ranked[i]));
}
main();
