"use strict";

/**
 * Read-only archival search of the contemporary January 2013 Cicada IRC log.
 * This tests whether any participant actually discussed the newly proposed
 * UDP Echo7 / Daytime13 / QOTD17 / WHOIS43 / DNS53 service route.
 *
 * The entire 13,345,841-byte original log is pinned by SHA-256. No live
 * server or old IP is contacted. Run in manual Windows GitHub Actions.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const SOURCE = "https://raw.githubusercontent.com/neuroretransmit/cicada/"
  + "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/"
  + "irc-logs/%2333012013.freenode.log";
const SHA256 = "3589f67c010e3290845900d1247ae1d65919859bb05e7e5efffb90b70dc46028";
const LENGTH = 13345841;
/** @type {Record<string, RegExp>} */
const matchers = {
  qotd: /\bqotd\b|quote[ -]of[ -]the[ -]day/i,
  udp: /\budp\b/i,
  echoService: /\becho\s+(?:service|port)|(?:port|udp)\s*7\b/i,
  daytime: /\bdaytime\b|(?:port|udp)\s*13\b/i,
  quotePort: /\bport\s*17\b|\budp\s*17\b/i,
  whois: /\bwhois\b|\bport\s*43\b/i,
  dns: /\bdns\b|\bport\s*53\b/i,
};
/** @returns {Promise<void>} */
async function main() {
  const response = await fetch(SOURCE, {
    headers: { "User-Agent": "LP2-source-archival-key-search" }
  });
  assert.equal(response.status, 200, "pinned historical text is unavailable");
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, LENGTH, "historic IRC text length changed");
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), SHA256,
    "historical source checksum changed");
  const lines = bytes.toString("utf8").split(/\r?\n/);
  const counts = {};
  const examples = {};
  for (const [key, re] of Object.entries(matchers)) {
    let n = 0;
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      if (!re.test(lines[i])) continue;
      n++;
      if (rows.length < 35) rows.push({ line: i + 1, text: lines[i].slice(0, 450) });
    }
    counts[key] = n;
    examples[key] = rows;
  }
  assert.ok(lines.length > 190000, "unexpected historical log truncation");
  // Freeze original early-stage leads, then inspect neighbors for exact endpoints
  // and the author's 2013 chronology without relying on search snippets.
  const jan14UdpContexts = [21558, 21566, 22301].map(anchor => ({
    anchor,
    lines: Array.from({length: 41}, (_, j) => ({
      line: anchor - 20 + j, text: lines[anchor - 21 + j].slice(0, 450)
    }))
  }));
  // Scan the immediate 2013-Jan-14 temporal neighborhood for any explicit
  // destination address, port list or participant-confirmed response.
  const siteContext = lines.slice(21100, 22500).map((text, i) => ({
    line: i + 21101, text: text.slice(0, 340)
  })).filter(x => /\b(udp|port|knock|scan|linode|clearnet|target|qotd|106\\.187|whois|dns)\b/i.test(x.text));
  const earlyDnsCandidate = lines.map((v, i) => ({line: i + 1, text: v.slice(0, 460)}))
    .filter(x => /^2013 Jan (?:0[6-9]|1[0-6])\b/.test(x.text))
    .filter(x => /\b(?:whois|dns|dig|txt record|txt query|port 53|port 17|daytime|qotd)\b/i.test(x.text));
  console.log(JSON.stringify({
    source: SOURCE, sha256: SHA256, size: bytes.length,
    lines: lines.length, counts, examples, jan14UdpContexts,
    jan14ScanTargetContext: siteContext.slice(0, 125),
    earlyDnsCandidate: earlyDnsCandidate.slice(0, 150),
    earlyDnsTotal: earlyDnsCandidate.length
  }, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
