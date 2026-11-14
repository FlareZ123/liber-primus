"use strict";

/**
 * Director #912: source-dated versioned repository handles from 2015–2016
 * Freenode #cicadasolvers. Original Git blobs verified before extraction.
 * Windows 11 / Node.js 22; read-only, standard library only.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const REV = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3";
const SOURCES = [
  ["#cicadasolvers.freenode.log", 18487233,
    "bdd277c14f94c34b5ae714cd00c238065beeed4e"],
  ["#cicadasolvers.freenode.2.log", 27234234,
    "72634a9d071d32af767edbffc0493d810e88cd0d"]
];
const DATE = /^201[56] (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) /;
const GP = /\b(?:liber.?primus|lp2|runes?|decryp|deciph|cipher|translated?|solved?|page\s*(?:[0-9]|[1-4][0-9]|5[0-5])|p(?:0|[1-4][0-9]|5[0-5])\b|gematria)\b/i;

/** @param {Buffer} input @returns {string} */
function gitBlob(input) {
  return crypto.createHash("sha1")
    .update("blob " + input.length + "\0").update(input).digest("hex");
}

/** @param {string} line */
function repoLinks(line) {
  const links = [];
  const re = /(?:https?:\/\/|git:\/\/)(?:www\.)?(?:github\.com|gist\.github\.com|bitbucket\.org|gitlab\.com|sourceforge\.net|code\.google\.com)\/[^\s<>'"()[\]{}]+/gi;
  for (const match of line.matchAll(re)) {
    const url = match[0].replace(/[.,;:!?]+$/, "");
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) continue;
    const handle = parsed.host.toLowerCase() + "/" +
      parts.slice(0, 2).join("/");
    links.push({url, handle});
  }
  return links;
}

/** @param {string[]} lines @param {number} i */
function nearbyContext(lines, i) {
  const day = lines[i].slice(0, 11);
  const sample = [];
  for (let j = Math.max(0, i - 14); j <= Math.min(lines.length - 1, i + 14); j++) {
    if (lines[j].slice(0, 11) === day) sample.push(lines[j]);
  }
  return GP.test(sample.join(" "));
}

async function main() {
  assert.equal(gitBlob(Buffer.from("test")),
    "30d74d258442c7c65512eafab474568dd706c430");
  assert.deepEqual(repoLinks("2016 Feb 05 http://github.com/x/y/blob/main/a"),
    [{url:"http://github.com/x/y/blob/main/a",handle:"github.com/x/y"}]);

  const handles = new Map();
  let scanned = 0, rawLinks = 0;
  for (const [filename, length, sha] of SOURCES) {
    const url = "https://raw.githubusercontent.com/neuroretransmit/cicada/" +
      REV + "/irc-logs/" + encodeURIComponent(filename);
    const res = await fetch(url);
    assert.equal(res.status, 200);
    const bytes = Buffer.from(await res.arrayBuffer());
    assert.equal(bytes.length, length);
    assert.equal(gitBlob(bytes), sha);
    const lines = bytes.toString("latin1").split(/\r?\n/);
    let n = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!DATE.test(lines[i])) continue;
      scanned++;
      const urls = repoLinks(lines[i]);
      if (!urls.length) continue;
      rawLinks += urls.length;
      const direct = GP.test(lines[i]);
      const context = nearbyContext(lines, i);
      for (const link of urls) {
        const h = handles.get(link.handle) || {
          handle: link.handle, appearances: 0, direct: 0,
          context: 0, records: []
        };
        h.appearances++;
        h.direct += Number(direct);
        h.context += Number(context);
        if (h.records.length < 12) {
          h.records.push({
            filename, line: i + 1, date: lines[i].slice(0, 17),
            url: link.url, direct, context,
            dialogue: lines[i].slice(0, 440)
          });
        }
        handles.set(link.handle, h);
        n++;
      }
    }
    console.log("AUTHENTIC " + filename + " gitBlob=" + sha +
      " bytes=" + length + " sourceLines=" + lines.length +
      " datedRepositoryRefs=" + n);
  }

  const result = [...handles.values()].map(h => ({
    ...h, priority: 10 * Number(h.direct > 0) +
      5 * Number(h.context > 0) + Math.min(4, h.appearances)
  })).sort((a,b) => b.priority - a.priority ||
    b.context - a.context || a.handle.localeCompare(b.handle));
  console.log("SCOPE totalPeriodLines=" + scanned + " totalURLMentions=" +
    rawLinks + " distinctVersionedHandles=" + handles.size);
  for (const h of result) {
    console.log("REPOSITORY " + JSON.stringify({
      handle: h.handle, priority: h.priority,
      mentions: h.appearances, direct: h.direct, context: h.context,
      records: h.records.slice(0, 4)
    }));
  }
  assert.ok(scanned > 10000);
  assert.ok(handles.size > 0);
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
