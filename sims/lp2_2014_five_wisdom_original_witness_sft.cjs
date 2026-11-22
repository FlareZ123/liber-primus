"use strict";
/**
 * Agent47: original 2014 IRC source screen for the five numbered LP2 pp36-38
 * Wisdom passages. No invented decryption, no persistence, exact Git blobs.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const SOURCES = [
  ["#cicadasolvers.freenode.log",18487233,"bdd277c14f94c34b5ae714cd00c238065beeed4e"],
  ["#cicadasolvers.freenode.2.log",27234234,"72634a9d071d32af767edbffc0493d810e88cd0d"],
  ["#33012014.freenode.log",8629610,"a2880b1db31ce523599ef30ca2e55291bf295900"]
];
const DATE = /^2014 (May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d\d) (\d\d:\d\d) /;
const PAGE = /(?:\b(?:page|pg|p)(?:age)?\s*[-#:]?\s*3[6-8]\b|\b(?:pages|pp)\s*3[6-8]\s*[-/]\s*3[6-8]\b)/i;
const WISDOM = /\b(?:wisdom|cuneiform|five numbered|numbered (?:parts|blocks|sections|passages)|five (?:passages|paragraphs|sections)|5 passages|1033|3301)\b/i;
const OP = /\b(?:cipher|decode|decrypt|encrypt|mix|read|key|transpose|direction|code|passage|paragraph|script|numbers|square|matrix|prime|totient|found|means|solve|fibonacci|column|row|book|input|output|operation|order|reverse)\b/i;
function checkBlob(bytes) {
  return crypto.createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
}
function audit(lines,filename) {
  const mentions = [];
  for(let i=0;i<lines.length;i++) {
    if (!DATE.test(lines[i])) continue;
    if (!PAGE.test(lines[i]) && !WISDOM.test(lines[i])) continue;
    const text=lines[i];
    // Only keep a page-specific line or an operational line naming a cue.
    if(PAGE.test(text) || (WISDOM.test(text)&&OP.test(text))) mentions.push(i);
  }
  const categories = {};
  const witnessed = [];
  for(const i of mentions) {
    const l=lines[i];
    const kind=PAGE.test(l)?"page36-38":(/cuneiform/i.test(l)?"cuneiform":(/\bwisdom\b/i.test(l)?"wisdom":(/\b1033\b/i.test(l)?"1033":"3301")));
    categories[kind]=(categories[kind]||0)+1;
    if (kind==="page36-38" || kind==="cuneiform" || /(?:five|numbered|5\s*(?:passages|paragraphs))/i.test(l)) {
      const date=l.slice(0,11);
      let context=[];
      for(let j=Math.max(0,i-2);j<=Math.min(lines.length-1,i+3);j++)if(lines[j].slice(0,11)===date)context.push({line:j+1,text:lines[j].slice(0,500)});
      witnessed.push({line:i+1,kind,context});
    }
  }
  return {filename,originalDatedMentions:mentions.length,categories,priority:witnessed};
}
function test() {
  assert(PAGE.test("2014 Jul 05 12:00 <x> page 36"));
  assert(PAGE.test("2014 Jul 05 12:00 <x> pg38"));
  assert(!PAGE.test("2014 Jul 05 12:00 <x> page 56"));
  assert(WISDOM.test("2014 Jul 05 12:00 <x> five numbered passages"));
  assert(!DATE.test("2015 Jan 01 00:00 <x> hello"));
  assert.equal(checkBlob(Buffer.from("test")),"30d74d258442c7c65512eafab474568dd706c430");
  console.log("SELFTEST PASS");
}
async function main() {
  test();
  if (!process.argv.includes("--network")) return;
  for(const [filename,size,sha] of SOURCES) {
    const url="https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/"+encodeURIComponent(filename);
    const r=await fetch(url,{signal:AbortSignal.timeout(120000)});
    assert.equal(r.status,200);
    const b=Buffer.from(await r.arrayBuffer());
    assert.equal(b.length,size);
    assert.equal(checkBlob(b),sha);
    const v=audit(b.toString("utf8").split(/\r?\n/),filename);
    console.log("RESULT",JSON.stringify({filename,sha,originalDatedMentions:v.originalDatedMentions,categories:v.categories,priorityCount:v.priority.length}));
    for (const hit of v.priority.slice(0,150)) console.log("WITNESS",JSON.stringify(hit));
    if(v.priority.length>150) console.log("TRUNCATED",v.priority.length);
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
