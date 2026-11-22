"use strict";
/**
 * Issue #923: source-exact, date-attributed evidence for the 6 Aug 2015
 * glyph420 "offline onion" claim. Read-only, first-party IRC original.
 * Searches only the named participant and explicit references to their nick.
 */
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const url = "https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log";
const bytes = 27234234;
const blob = "72634a9d071d32af767edbffc0493d810e88cd0d";
async function main() {
  const res = await fetch(url, {signal: AbortSignal.timeout(60000)});
  assert.equal(res.status, 200);
  const raw = Buffer.from(await res.arrayBuffer());
  assert.equal(raw.length, bytes);
  assert.equal(crypto.createHash("sha1").update("blob " + raw.length + "\0").update(raw).digest("hex"), blob);
  const lines = raw.toString("latin1").split(/\r?\n/);
  const author = [], mentions = [];
  for (let i=0;i<lines.length;i++) {
    const match = lines[i].match(/^201[56] \w{3} \d\d \d\d:\d\d <([^>]+)> (.*)$/);
    if(!match) continue;
    if(/^glyph420$/i.test(match[1])) author.push(i);
    else if(/\bglyph420\b/i.test(match[2])) mentions.push(i);
  }
  console.log("SOURCE bytes=" + raw.length + " sha=" + blob +
    " physicalLines=" + lines.length + " glyph420Authored=" + author.length +
    " mentions=" + mentions.length);
  const exact = [149471,149472,149473,149474,149475,149476,149477,149478,149479,149480,149481,149482,149483,149484];
  for (const no of exact) console.log("WITNESS L" + no + " " + lines[no-1]);
  const unique=new Set([...author,...mentions]);
  const candidates = [...unique].sort((a,b)=>a-b);
  for (const i of candidates) {
    const text=lines[i];
    if (i>149440&&i<149510) continue;
    if (author.includes(i) || /\b(onion|decrypt|decode|decipher|rune|primus|http|paste|reddit|twitter|irc|key|facebook|forum|github|gist|contact|email)\b/i.test(text)) {
      console.log("PARTICIPANT L"+(i+1)+" "+text.slice(0,500));
      const surrounding=lines.slice(Math.max(0,i-3),Math.min(lines.length,i+4));
      for(let off=0;off<surrounding.length;off++){
        if (/https?:\/\/|www\.|\b(?:pastebin|reddit|github|forum|twitter|contact)\b/i.test(surrounding[off]))
          console.log("NEARBY L"+(Math.max(0,i-3)+off+1)+" "+surrounding[off].slice(0,500));
      }
    }
  }
  const allUrls = [...new Set(candidates.flatMap(i=>[lines[i],lines[i-1]??"",lines[i+1]??""]
    .flatMap(line=>[...line.matchAll(/https?:\/\/[^\s<>"']+/g)].map(m=>m[0]))))];
  console.log("SAME-SPEAKER-OR-MENTION-NEAR-URLS "+JSON.stringify(allUrls.slice(0,80)));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
