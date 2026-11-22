'use strict';
/**
 * 2014 original IRC solver-program link inventory with NO page-number prerequisite.
 * Identifies first-party period discussion of original code, candidate plaintext,
 * and key receipts. Uses a frozen Git-blob line witness and excludes known 2014
 * sources. Does not execute code or dereference arbitrary links.
 * Node.js 22 CommonJS, manual-only Actions.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const PIN={name:'#cicadasolvers.freenode.log',bytes:18487233,blob:'bdd277c14f94c34b5ae714cd00c238065beeed4e'};
const URL=/https?:\/\/[^\s<>"'()]+/ig;
const ACTIVE=/^2014 (?:May|Jun|Jul|Aug) \d{2} \d{2}:\d{2} /;
const CODEHOST=/(?:pastebin\.com|sprunge\.us|gist\.github\.com|github\.com|mediafire\.com|sendspace\.com|dropbox\.com|d\.pr\/|pastie\.org|paste\.ee|paste2\.org|hastebin\.com|raw\.githubusercontent\.com)/i;
const KNOWN=/(?:R01rN7ZX|LHTRYZjv|Cv2yHt1K|kRHEVgjj|PBPT|M5BccDpT|isa7Hh1x|BgYrwudm|6jznh1UD|uqvlspfs3ny3516|umlv6bbd54n5w9d|Cv2yHt1K|dGJSgN0m|9U7SbHQE|8cStVBG9|gXDGVf1Y|N3qCRSq2|RZdd|DbXN|BbUK|LIWC|EMXR|k7ufm0|lvT7|onecool\.us|infotomb|terrafant\.asia)/i;
const SOLVER=/\b(?:solv(?:ed|er|ing)|crack(?:ed|ing)?|decrypt(?:ed|ion|ing)?|decipher(?:ed|ing)?|plaintext|cleartext|key(?:stream|word)?|encode|decode|crypt(?:analysis)?|script|python|source|program|code|function|algorithm|my\s+(?:tool|code|script)|output|results?|working)\b/i;
const STRONG=/\b(?:solved|cracked|decrypted|deciphered|plaintext|cleartext|found\s+(?:the|a)\s+(?:key|solution)|got\s+(?:it|the\s+key)|works\b|working|original\s+(?:key|file)|my\s+(?:tool|script|program))\b/i;
const CIPHER=/\b(?:liber|primus|rune|page|cipher|3301|cicada|gematria|key|vigenere|totient|decrypt|prime|oeis|index\s+of\s+coincidence|ioc)\b/i;
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const links=s=>[...s.matchAll(URL)].map(x=>x[0].replace(/[\],;:.!?}\]]+$/g,''));
const voice=s=>(s.match(/ <([^>]{1,60})> /)||[])[1]||'';
function invent(lines){
  const sightings=new Map();
  let examined=0,linksCount=0;
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!ACTIVE.test(line))continue;
    examined++;
    const uris=links(line).filter(x=>CODEHOST.test(x)&&!KNOWN.test(x));
    if(!uris.length)continue;linksCount+=uris.length;
    const nearby=lines.slice(Math.max(0,i-12),Math.min(lines.length,i+13)).filter(x=>ACTIVE.test(x)&&x.slice(0,11)===line.slice(0,11));
    const speaker=voice(line);
    const own=nearby.filter(x=>speaker&&voice(x)===speaker);
    const cited=nearby.filter(x=>SOLVER.test(x)&&CIPHER.test(x));
    const explicit=nearby.filter(x=>STRONG.test(x)&&CIPHER.test(x));
    if(!cited.length||!explicit.length)continue;
    for(const url of uris){
      const score=15*Number(SOLVER.test(line))+13*Number(STRONG.test(line))+
        10*Number(/pastebin|gist|raw\.githubusercontent|pastie|sprunge/i.test(url))+
        6*Number(own.some(x=>STRONG.test(x)&&CIPHER.test(x)))+
        5*Number(own.some(x=>/\b(?:my|our|here|code|script|key|program|original|found|output)\b/i.test(x)))+
        2*Number(/\b(?:decrypt|key|solved|rune|liber|script)\b/i.test(nearby.map(x=>x.slice(17)).join(' ')));
      const hit={url,date:line.slice(0,17),sourceLine:i+1,author:speaker,score,
        posted:line.slice(0,270),
        authorContext:own.filter(x=>SOLVER.test(x)||STRONG.test(x)).slice(0,6).map(x=>x.slice(0,280)),
        otherContext:explicit.slice(0,3).map(x=>x.slice(0,280))};
      const prior=sightings.get(url.toLowerCase());
      if(!prior||hit.score>prior.score)sightings.set(url.toLowerCase(),hit);
    }
  }
  return {examined,linksCount,candidates:[...sightings.values()].sort((a,b)=>b.score-a.score||a.sourceLine-b.sourceLine)};
}
async function main(){
  assert.deepEqual(links('Here: http://pastebin.com/ABcd.'),['http://pastebin.com/ABcd']);
  assert.equal(blob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  console.log('SELFTEST PASS original source parser');
  if(process.argv.includes('--selftest'))return;
  const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(PIN.name);
  const r=await fetch(url,{signal:AbortSignal.timeout(120000)});
  assert.equal(r.status,200);
  const b=Buffer.from(await r.arrayBuffer());
  assert.equal(b.length,PIN.bytes);
  assert.equal(blob(b),PIN.blob);
  const result=invent(b.toString('latin1').split(/\r?\n/));
  console.log('ORIGINAL_2014_CODEHOST_SCOPE '+JSON.stringify({source:PIN,examined:result.examined,candidateURLHits:result.linksCount,uniqueContextQualified:result.candidates.length}));
  for(const row of result.candidates.slice(0,80))console.log('ORIGINAL_CANDIDATE '+JSON.stringify(row));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
