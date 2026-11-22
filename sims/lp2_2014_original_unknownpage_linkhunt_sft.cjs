"use strict";
/**
 * Agent3: 2014 original IRC source-linked unknown-page executable/payload hunt.
 * Every hit retains original URL, date, page context and source line number.
 * Node.js 22 CommonJS; read-only network mode, no third-party code execution.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const SOURCES = [
  ["#cicadasolvers.freenode.log",18487233,"bdd277c14f94c34b5ae714cd00c238065beeed4e"],
  ["#cicadasolvers.freenode.2.log",27234234,"72634a9d071d32af767edbffc0493d810e88cd0d"],
  ["#33012014.freenode.log",8629610,"a2880b1db31ce523599ef30ca2e55291bf295900"]
];
const PERIOD = /^2014 (?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2} \d{2}:\d{2} /;
const PAGE = /\b(?:page|pg|p)\s*[:#.\-]?\s*(0?[0-9]|[1-4][0-9]|5[0-5])\b/ig;
const CLAIM = /\b(?:solv(?:e|ed|ing)|decipher(?:ed|ing)?|decrypt(?:ed|ing|ion)?|decode(?:d|r)?|crack(?:ed)?|plaintext|cleartext|key(?:stream|word)?|script|program|tool|code|file|source|output|attachment|download|upload)\b/i;
const STRONG = /\b(?:solv(?:ed|ing)|decipher(?:ed|ing)?|decrypt(?:ed|ing)?|decode(?:d)?|crack(?:ed)?|plaintext|cleartext|key(?:stream)?|vigenere|prime\s+(?:key|stream)|actual\s+output)\b/i;
const OPERAND = /\b(?:run(?:es|ic)|liber|primus|lp2|gematria|cipher|page|decode|decrypt|key|plaintext|script|program)\b/i;
const FILE = /(?:pastebin|paste\.ee|paste2|hastebin|sprunge|gist|mediafire|dropbox|github|\.py(?:[?#]|$)|\.jar(?:[?#]|$)|\.txt(?:[?#]|$)|\.zip(?:[?#]|$)|\.exe(?:[?#]|$)|\.html?(?:[?#]|$)|\.c(?:[?#]|$)|\.ods(?:[?#]|$)|\.js(?:[?#]|$))/i;
const EXCLUDE = /(?:\btitanpad\.|\bunfiction\.|\/wiki\/|\bimgur\.|youtu\.be|youtube\.com|wikipedia|\breddit\.|\btwitter\.|\bonion\.to\/?$)/i;
const ALREADY = /(?:R01rN7ZX|LHTRYZjv|Cv2yHt1K|kRHEVgjj|PBPT|M5BccDpT|isa7Hh1x|BgYrwudm|6jznh1UD|uqvlspfs3ny3516|umlv6bbd54n5w9d|onecool\.us|terrafant\.asia|infotomb\.com\/p2emj)/i;
/** @param {Buffer} b */
const blob = b => crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
/** @param {string} s */
const urls = s => [...s.matchAll(/https?:\/\/[^\s<>"'()]+/ig)].map(m=>m[0].replace(/[\],;:.!?}\]]+$/g,""));
/** @param {string} s */
const pages = s => [...new Set([...s.matchAll(PAGE)].map(x=>Number(x[1])))];
/** @param {string[]} lines @param {string} name */
function extract(lines,name){
  const candidates = new Map();
  let dates=0,links=0;
  for(let i=0;i<lines.length;i++){
    const line=lines[i]; if(!PERIOD.test(line))continue;dates++;
    const here=urls(line);if(!here.length)continue;links+=here.length;
    const day=line.slice(0,11);
    const neighbor=lines.slice(Math.max(0,i-12),Math.min(lines.length,i+13))
      .map((s,k)=>({n:Math.max(0,i-12)+k+1,s}))
      .filter(x=>PERIOD.test(x.s)&&x.s.slice(0,11)===day);
    const cited=neighbor.filter(x=>pages(x.s).length>0);
    const strong=neighbor.filter(x=>STRONG.test(x.s));
    const full=neighbor.map(x=>x.s).join(" ");
    if(!cited.length || !strong.length || !OPERAND.test(full))continue;
    for(const url of here){
      if(EXCLUDE.test(url)||ALREADY.test(url))continue;
      const direct=pages(line);
      const nearPages=[...new Set(cited.flatMap(x=>pages(x.s)))];
      const relevant=nearPages.filter(n=>n<=55);
      if(!relevant.length)continue;
      const claim = STRONG.test(line);
      const file = FILE.test(url);
      const dist=Math.min(...cited.map(x=>Math.abs(x.n-(i+1))));
      const strongDist=Math.min(...strong.map(x=>Math.abs(x.n-(i+1))));
      const score=15*Number(direct.some(n=>n<=55))+10*Number(claim)+9*Number(file)
        +7*Number(dist<=3)+5*Number(strongDist<=3)+3*Number(CLAIM.test(line))
        +2*Number(/\b(?:first|second|third)\s+page\b/i.test(full))
        -3*Number(/(?:p56|page\s*56|an end)/i.test(full));
      const row={source:name,line:i+1,date:line.slice(0,17),url,score,pages:relevant,
        posted:line.slice(0,500),evidence:cited.sort((a,b)=>Math.abs(a.n-(i+1))-Math.abs(b.n-(i+1))).slice(0,2),
        claimEvidence:strong.sort((a,b)=>Math.abs(a.n-(i+1))-Math.abs(b.n-(i+1))).slice(0,2)};
      const key=url.toLowerCase().replace(/^http:/,"https:");
      const prev=candidates.get(key);if(!prev||row.score>prev.score)candidates.set(key,row);
    }
  }
  return {source:name,datedLines:dates,urlsSeen:links,qualified:[...candidates.values()].sort((a,b)=>b.score-a.score||a.line-b.line)};
}
function selftest(){
  assert.deepEqual(pages("p0 p55 page 56 and page 32"),[0,55,32]);
  assert.equal(urls("text https://example.org/a.py." )[0],"https://example.org/a.py");
  const x=extract([
    "2014 May 21 10:10 <a> I decrypted page 29",
    "2014 May 21 10:11 <a> my script: http://example.org/decoder.py",
    "2014 May 21 10:12 <b> the original plaintext reads something",
    "2014 May 22 10:13 <c> I decrypted page 30"
  ],"plant");
  assert.equal(x.qualified.length,1);assert.deepEqual(x.qualified[0].pages,[29]);
  console.log("SELFTEST PASS: source-day confinement, page extraction, link parsing");
}
async function main(){
  selftest();
  if(!process.argv.includes("--network"))return;
  for(const [name,size,sha] of SOURCES){
    const url="https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/"+encodeURIComponent(name);
    const r=await fetch(url,{signal:AbortSignal.timeout(120000)});
    assert.equal(r.status,200,url);
    const b=Buffer.from(await r.arrayBuffer());
    assert.equal(b.length,size,name+" source byte length");
    assert.equal(blob(b),sha,name+" original Git blob hash");
    const o=extract(b.toString("latin1").split(/\r?\n/),name);
    console.log("SOURCE",JSON.stringify({source:o.source,sha,datedLines:o.datedLines,urlsSeen:o.urlsSeen,newCandidateLinks:o.qualified.length}));
    for(const hit of o.qualified.slice(0,75))console.log("HIT",JSON.stringify(hit));
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
