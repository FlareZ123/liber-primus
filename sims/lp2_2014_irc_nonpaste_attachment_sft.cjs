"use strict";
/**
 * Source-pinned, bounded 2014 IRC link extractor for non-paste,
 * non-Git, non-forum and non-pad downloadable solver attachments.
 * Does not download or execute any referenced third-party code.
 *
 * Node.js 22 on Windows: node sims/lp2_2014_irc_nonpaste_attachment_sft.cjs --selftest
 * Network retrieval of historical IRC is CI-manual only: --network.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const sources = [
  {name:"#cicadasolvers.freenode.log",sha:"bdd277c14f94c34b5ae714cd00c238065beeed4e",size:18487233},
  {name:"#33012014.freenode.log",sha:"a2880b1db31ce523599ef30ca2e55291bf295900",size:8629610}
];
/** @param {Buffer} buf @returns {string} */
function gitBlob(buf) {
  return crypto.createHash("sha1").update("blob "+buf.length+"\0","ascii")
    .update(buf).digest("hex");
}
const lp2 = /(?:liber[ -]?primus|lp2|rune|runic|decrypt|decryp|cipher|transcri|p(?:age)?\s*\d\d|prime|key(?:word)?|gematria|solver|script|code)/i;
const nonSource = /(?:pastebin(?:\.com)?|sprunge\.us|gist\.github|github\.com|bitbucket\.org|gitlab\.com|titanpad|etherpad|unfiction|4chan|4plebs|fandom|reddit|twitter|facebook|wikipedia)/i;
const fileHost = /(?:dropbox\.com\/s\/|drive\.google\.com\/file\/|docs\.google\.com\/file\/|mediafire\.com|mega\.(?:co\.nz|nz)|box\.com\/s\/|sendspace\.com\/file\/|rapidshare\.com\/files\/)/i;
const fileExt = /\.(?:zip|rar|7z|tar|tgz|gz|bz2|py|rb|pl|js|c|cpp|h|java|txt|csv|tsv|json|xls|xlsx|ods|pdf|doc|docx|ipynb|exe|dll|bin|dat|mp3|wav|ogg|asc)(?:[?#]|$)/i;
/** @param {string} raw @returns {string[]} */
function links(raw) {
  return (raw.match(/(?:https?:\/\/|www\.)[^\s<>\x22\x27()]+/ig) || [])
    .map(x=>x.replace(/[\],;:.!?]+$/g,""));
}
/** @param {string} url @returns {boolean} */
function candidate(url) {
  if (nonSource.test(url)) return false;
  return fileExt.test(url) || fileHost.test(url);
}
/**
 * @param {string[]} lines
 * @param {string} name
 * @returns {{source:string,totalMayAug:number,allCandidateLinks:number,selected:Array<object>}}
 */
function mine(lines,name) {
  const chosen = new Map();
  let totalMayAug = 0, allCandidateLinks = 0;
  for (let i=0;i<lines.length;i++) {
    const line=lines[i];
    if (!/^2014 (May|Jun|Jul|Aug) \d\d \d\d:\d\d/.test(line)) continue;
    totalMayAug++;
    for (const url of links(line)) {
      if (!candidate(url)) continue;
      allCandidateLinks++;
      const context = lines.slice(Math.max(0,i-2),Math.min(i+3,lines.length))
        .filter(s => /^2014 (May|Jun|Jul|Aug) \d\d /.test(s))
        .map(s=>s.slice(0,450));
      const around=context.join(" ");
      if (!lp2.test(around)) continue;
      // Avoid p56-only links unless source also connects unknown LP2.
      const score=4*Number(/(?:liber[ -]?primus|lp2|rune|runic|gematria)/i.test(around))
        +3*Number(/(?:decrypt|cipher|key|code|solver|script)/i.test(around))
        +2*Number(/(?:p(?:age)?\s*(?:[0-4]?\d|5[0-5]))\b/i.test(around))
        +Number(/(?:upload|download|saved|attached|file|zip)/i.test(around));
      const item={url,source:name,line:i+1,date:line.slice(0,17),
        score,posted:line.slice(0,500),context};
      const key=url.toLowerCase().replace(/^http:/,"https:");
      const old=chosen.get(key);
      if(!old||item.score>old.score) chosen.set(key,item);
    }
  }
  const selected=[...chosen.values()].sort((a,b)=>b.score-a.score||a.line-b.line).slice(0,75);
  return {source:name,totalMayAug,allCandidateLinks,sourceRelevantDistinct:chosen.size,selected};
}
function selftest() {
  const lines=[
    "2014 May 11 10:02 <a> decoding some runes in Liber Primus page 5",
    "2014 May 11 10:03 <b> my cipher script http://files.example.org/rune_decoder.py",
    "2014 May 11 10:04 <c> copied notes http://pastebin.com/script.py",
    "2014 May 11 10:05 <c> .jpg image http://files.example.org/rune.jpg",
    "2014 May 11 10:06 <d> original work http://www.dropbox.com/s/abcd/solver.zip",
    "2014 May 11 10:07 <e> an unrelated http://github.com/test/solver.py",
    "2014 Sep 11 10:08 <f> test script http://files.example.org/unrelated.c"
  ];
  const out=mine(lines,"synthetic");
  assert.equal(out.totalMayAug,6);
  assert.equal(out.sourceRelevantDistinct,2);
  assert.equal(out.selected[0].url,"http://files.example.org/rune_decoder.py");
  assert.equal(out.selected[1].url,"http://www.dropbox.com/s/abcd/solver.zip");
  assert.equal(links(lines[1])[0],"http://files.example.org/rune_decoder.py");
  console.log("PASS: fixed 2014 date, non-paste, file-host and source-context selectors");
}
async function main() {
  if (process.argv.includes("--selftest")) {selftest();return;}
  assert.ok(process.argv.includes("--network"),"choose --selftest or --network");
  const results=[];
  for (const meta of sources) {
    const url="https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23"+meta.name.slice(1);
    const response=await fetch(url,{signal:AbortSignal.timeout(120000),
      headers:{"user-agent":"LP2-2014-nonpaste-source-attachments/1.0"}});
    assert.equal(response.status,200,url+" status="+response.status);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length,meta.size,"original IRC size");
    assert.equal(gitBlob(bytes),meta.sha,"original IRC Git blob");
    const result=mine(bytes.toString("latin1").split(/\r?\n/),meta.name);
    results.push(result);
    console.log(JSON.stringify({source:meta.name,sourceBlob:meta.sha,
      totalMayAug:result.totalMayAug,candidateLinks:result.allCandidateLinks,
      sourceRelevantDistinct:result.sourceRelevantDistinct,
      selected:result.selected},null,2));
  }
  console.log("SOURCE-GATE "+JSON.stringify({
    sourceBlobs:sources.map(s=>s.sha),
    totalMayAug:results.reduce((x,r)=>x+r.totalMayAug,0),
    allFileLinks:results.reduce((x,r)=>x+r.allCandidateLinks,0),
    importantLimit:"Only original IRC URL inventory; no third-party file was authenticated or executed"
  }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
