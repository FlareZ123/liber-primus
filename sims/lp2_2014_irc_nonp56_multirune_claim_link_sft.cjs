'use strict';
/**
 * Original May–Aug 2014 IRC: links adjacent to explicit *non-p56*
 * plaintext-claim sentences, not an inventory of generic page comments.
 * 2014 log corpus is pinned by original Git blob and byte count.
 * Requires Node.js 22 network at execution; no third-party code is run.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const SOURCES=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
/** @param {Buffer} b @returns {string} */
function blob(b){
 return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
}
/** @param {string} s @param {number} i @returns {object|null} */
function entry(s,i){
 const m=s.match(/^(2014 (May|Jun|Jul|Aug) (\d\d) (\d\d):(\d\d)) <([^>]+)> ?(.*)$/);
 return m ? {line:i+1,date:m[1],day:m[2]+' '+m[3],
   minute:Number(m[4])*60+Number(m[5]),nick:m[6],body:m[7]}:null;
}
const claimed=/\b(?:(?:i|we|my|our|he|she|they|someone)\b.{0,40}\b(?:decrypt(?:ed)?|decipher(?:ed)?|solv(?:ed)?|decode(?:d)?|recover(?:ed)?|found\s+(?:a\s+)?(?:plaintext|key|solution))|(?:decrypted|decoded|deciphered|cracked|plaintext|cleartext)\b.{0,65}\b(?:p(?:age)?\s*0?[0-9]|p(?:age)?\s*[1-4]\d|p(?:age)?\s*5[0-5]))\b/i;
const pages=/(?:\bp(?:age)?\s*[:#.-]?\s*(?:0?\d|[1-4]\d|5[0-5])\b|\bfirst\s+(?:page|chapter)|\bliber\s+primus\b|\blp2\b)/i;
const p56=/\bp(?:age)?\s*[:#.-]?\s*56\b|\ban\s+end\b/i;
const link=/https?:\/\/[^\s<>"'()]+/ig;
const linkedCode=/(?:pastebin|pastie|dpaste|paste\.ee|sprunge|hastebin|gist\.github|github|\.py\b|\.rb\b|\.js\b|\.txt\b|\.jar\b|\.zip\b|\.ods\b|\.xls\b|\.c\b|\.pl\b|\.json\b|\.html?\b)/i;
const skip=/(?:\btitanpad\.|unfiction|imgur|youtube|youtu\.be|\.onion|reddit|wikipedia|twitter|google\.com\/search|9173007|9173010|CO4O|PBPT|M5BccDpT|R01rN7ZX|LHTRYZjv|Cv2yHt1K|kRHEVgjj|isa7Hh1x|BgYrwudm|6jznh1UD|uqvlspfs3ny3516|umlv6bbd54n5w9d|onecool\.us|terrafant\.asia|icu\.neocities|stormdumps|pastebin\.com\/kRHEVgjj|pastebin\.com\/XVwtsUZ1)/i;
/** @param {string[]} lines @param {string} name @returns {object} */
function scan(lines,name){
 const all=lines.map(entry);
 const found=[];
 let explicit=0,eligible=0;
 for(let i=0;i<all.length;i++){
  const x=all[i];
  if(!x || !claimed.test(x.body)||!pages.test(x.body)||p56.test(x.body))continue;
  explicit++;
  const near=all.slice(Math.max(0,i-9),Math.min(all.length,i+10))
    .filter(z=>z&&z.day===x.day&&Math.abs(z.minute-x.minute)<=12);
  const out=[];
  for(const y of near){
   const urls=[...y.body.matchAll(link)].map(m=>m[0].replace(/[.,;\]}!?]+$/g,''));
   for(const url of urls){
    if(!linkedCode.test(url)||skip.test(url))continue;
    out.push({url,sourceLine:y.line,sourceNick:y.nick,
      snippet:y.body.slice(0,220),
      sameNick:y.nick.toLowerCase()===x.nick.toLowerCase()});
   }
  }
  if(out.length)eligible++;
  for(const y of out)found.push({source:name,claimLine:x.line,claimWhen:x.date,
    claimNick:x.nick,claimText:x.body.slice(0,370),...y,
    score:20+10*Number(y.sameNick)+8*Number(Math.abs(y.sourceLine-x.line)<=2)
      +8*Number(/\b(?:two|three|four|several|first \d|word(?:s)?\s+of|sentence|paragraph|entire|full|page)\b/i.test(x.body))
      -Math.min(9,Math.abs(y.sourceLine-x.line))});
 }
 const byURL=new Map();
 for(const x of found){
  const key=x.url.toLowerCase().replace(/^http:/,'https:');
  const previous=byURL.get(key);
  if(!previous||x.score>previous.score)byURL.set(key,x);
 }
 return {source:name,explicitClaimLines:explicit,eligibleClaimLines:eligible,
  distinctCandidateLinks:byURL.size,
  selected:[...byURL.values()].sort((a,b)=>b.score-a.score||a.claimLine-b.claimLine).slice(0,35)};
}
const plant=[
 '2014 May 23 09:00 <alice> I decrypted page 10, all words of the first sentence',
 '2014 May 23 09:01 <alice> code and plaintext http://example.test/test.py',
 '2014 May 23 09:02 <bob> interesting',
 '2014 May 23 10:01 <alice> I decoded page 56 AN END',
 '2014 May 23 10:02 <alice> http://example.test/second.py'
];
const check=scan(plant,'plant');
assert.equal(check.selected.length,1);
assert.equal(check.selected[0].url,'http://example.test/test.py');
assert.equal(blob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
console.log('CONTROLS PASS explicit 2014 non-p56 multirune claim link, no p56-only link');
async function main(){
 for(const [name,size,sha] of SOURCES){
  const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name);
  const r=await fetch(url,{signal:AbortSignal.timeout(120000)});
  assert.equal(r.status,200,url);
  const bytes=Buffer.from(await r.arrayBuffer());
  assert.equal(bytes.length,size,name+' original bytes');
  assert.equal(blob(bytes),sha,name+' original Git blob');
  const result=scan(bytes.toString('latin1').split(/\r?\n/),name);
  console.log('VERIFIED-ORIGINAL '+JSON.stringify({source:name,sha,bytes:bytes.length,explicitClaimLines:result.explicitClaimLines,eligibleClaimLines:result.eligibleClaimLines,distinctCandidateLinks:result.distinctCandidateLinks}));
  for(const x of result.selected)console.log('CLAIMED-LINK '+JSON.stringify(x));
 }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
