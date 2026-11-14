"use strict";

/**
 * Source-pinned 2015-2016 Freenode external-public-discussion discovery.
 * Read immutable original logs, identify dated URLs to source-period public
 * threads with LP2 / cryptanalytic context. Prints bounded textual candidates.
 * Node.js 22 / CommonJS, no file writes or third-party dependencies.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const SOURCES = [
  {name: "#cicadasolvers.freenode.log", bytes: 18487233,
    sha: "bdd277c14f94c34b5ae714cd00c238065beeed4e"},
  {name: "#cicadasolvers.freenode.2.log", bytes: 27234234,
    sha: "72634a9d071d32af767edbffc0493d810e88cd0d"}
];

/** @param {Buffer} data @returns {string} */
function blobSha(data) {
  return crypto.createHash("sha1")
    .update("blob " + data.length + "\0").update(data).digest("hex");
}
const datePattern = /^(201[56]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d\d) (\d\d):(\d\d) <([^>]+)> (.*)$/u;
const urlPattern = /https?:\/\/[^\s<>[\]{}"'\\]+|(?:www\.)?[a-z\d.-]+\.(?:com|org|net)\/(?:thread|topic|viewtopic|discussion|forum)\/[^\s<>[\]{}"'\\]+/ig;
const contextPattern = /\b(?:liber|primus|LP2|cipher|decry|decod|plain|key|prime|rune|pages?|solution|freenode)\b/i;
const discussionPattern = /\b(?:forum|thread|discussion|boards?|reddit|unfiction|4chan|8chan|talk|cryptography|post|conversation|archive|outguess)\b/i;
const exclusions = /(?:github\.com|raw\.githubusercontent\.com|titanpad|pastebin|imgur|prntscr|gyazo|puu\.sh|dropbox|mediafire|twitter|infotomb|youtube|youtu\.be)/i;

/**
 * @param {string} sourceName
 * @param {string} content
 * @returns {Array<{source:string,date:string,line:number,url:string,text:string,rank:number}>}
 */
function select(sourceName, content) {
  const lines = content.split(/\r?\n/u);
  const records = [];
  for (let k = 0; k < lines.length; k++) {
    const m = datePattern.exec(lines[k]);
    if (!m) continue;
    const body = m[7];
    const urls = [...body.matchAll(urlPattern)].map(v => v[0].replace(/[.,;!?)]+$/g, ""));
    for (const url of urls) {
      if (exclusions.test(url)) continue;
      const nearby = lines.slice(Math.max(0, k - 12), Math.min(lines.length, k + 13)).join("\n");
      const rank = (discussionPattern.test(url) ? 15 : 0) +
        (discussionPattern.test(body) ? 8 : 0) +
        (contextPattern.test(body) ? 7 : 0) +
        (contextPattern.test(nearby) ? 2 : 0) +
        (/\b(?:solved|decrypted|decoded|cracked|key is|prime|page)\b/i.test(nearby) ? 3 : 0);
      if (rank < 4) continue;
      records.push({
        source: sourceName,
        date: m[1] + " " + m[2] + " " + m[3] + " " + m[4] + ":" + m[5],
        line: k + 1, url, text: body.slice(0, 350), rank
      });
    }
  }
  return records;
}
async function main() {
  assert.equal(blobSha(Buffer.from("test")), "30d74d258442c7c65512eafab474568dd706c430");
  assert.equal(select("dummy", '2015 Feb 03 01:12 <x> https://boards.net/thread/5 liber primus').length, 1);
  const items = [];
  for (const source of SOURCES) {
    const url = "https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/" +
      encodeURIComponent(source.name);
    const response = await fetch(url);
    assert.equal(response.status, 200, "Original log fetch");
    const raw = Buffer.from(await response.arrayBuffer());
    assert.equal(raw.length, source.bytes);
    assert.equal(blobSha(raw), source.sha);
    const candidates = select(source.name, raw.toString("latin1"));
    items.push(...candidates);
    console.log("SOURCE", source.name, "sha", source.sha, "candidateURLs", candidates.length);
  }
  const groups = new Map();
  for (const item of items) {
    const url = item.url.toLowerCase().replace(/\/$/, "");
    if (!groups.has(url)) groups.set(url, []);
    groups.get(url).push(item);
  }
  const dedup = [...groups.values()].map(arr => arr.sort((a,b)=>b.rank-a.rank)[0])
    .sort((a,b)=>b.rank-a.rank || a.date.localeCompare(b.date));
  console.log("distinct candidate non-repo non-media discussion URLs",dedup.length);
  for (const [i, item] of dedup.slice(0,100).entries()) {
    console.log("LINK",i+1,JSON.stringify(item));
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
