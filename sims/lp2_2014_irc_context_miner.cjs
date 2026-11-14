'use strict';

/**
 * Mine period-original 2014 Cicada IRC logs for source context around LP2 p56,
 * the first "AN END" solve discussion, the hash/continuation, and cluosh's
 * contemporaneous cryptographic-method messages. Uses latin1 deliberately:
 * the original mIRC exports contain non-UTF-8 bytes but ASCII timestamps and
 * message text are preserved byte-for-byte.
 *
 * Node.js 22, no dependencies. Pass the three pinned original log files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const inputs = process.argv.slice(2);
assert.equal(inputs.length, 3, 'Pass the three original IRC log paths');

const directPatterns = [
  ['p56', /\b(?:p\s*56|p\.56|page\s*56|page56)\b/i],
  ['an-end', /\ban\s+end\b/i],
  ['deep-web', /deep[\s-]?web/i],
  ['hash-to', /\bhash(?:es|ed)?\s+to\b/i],
  ['known-hash-prefix', /\b36367763\b/i],
  ['onion', /\.onion\b|\bonion\b/i],
  ['liber-primus', /\bliber\s+primus\b/i],
];
const methodPattern = /\b(?:totient|euler(?:'s)?\s+phi|phi|prime(?:s|d)?|cipher|decrypt(?:ed|ion)?|encrypt(?:ed|ion)?|key|rune|alphabet|gematria|fibonacci|hash|solv(?:e|ed|ing)|plaintext|ciphertext|mod(?:ulo)?)\b/i;
const solvePattern = /\b(?:solv(?:e|ed|ing)|decrypt(?:ed|ion)?|decipher(?:ed|ing)?|decoded|finished|cracked)\b/i;
const longHexPattern = /\b[0-9a-f]{64,128}\b/ig;
const urlPattern = /https?:\/\/[^\s<>"']+|[a-z2-7]{16}\.onion\b|[a-z2-7]{56}\.onion\b/ig;

function parseLine(raw, lineNo) {
  const m = raw.match(/^(20\d\d [A-Z][a-z]{2} \d\d \d\d:\d\d)\s+<([^>]+)>\s?(.*)$/);
  if (!m) return {lineNo, raw, date: null, nick: null, body: raw};
  return {lineNo, raw, date: m[1], nick: m[2], body: m[3]};
}

function collect(path) {
  const raw = fs.readFileSync(path);
  const lines = raw.toString('latin1').split(/\r?\n/);
  const entries = lines.map((line, i) => parseLine(line, i + 1));
  const dated = entries.filter(e => e.date && e.date.startsWith('2014 '));
  const mayAug = dated.filter(e => /^2014 (May|Jun|Jul|Aug) /.test(e.date));
  const direct = [];
  const cluoshMethods = [];
  const hashes = [];
  const urls = [];
  const counts = Object.fromEntries(directPatterns.map(([k]) => [k, 0]));
  let longHexCount = 0, urlCount = 0, solveCount = 0;

  for (const e of dated) {
    const tags = [];
    for (const [name, re] of directPatterns) {
      if (re.test(e.body)) { tags.push(name); counts[name]++; }
    }
    const hexes = e.body.match(longHexPattern) || [];
    const links = e.body.match(urlPattern) || [];
    if (hexes.length) { longHexCount += hexes.length; hashes.push({lineNo:e.lineNo,date:e.date,nick:e.nick,values:hexes.slice(0,4),body:e.body.slice(0,420)}); }
    if (links.length) { urlCount += links.length; urls.push({lineNo:e.lineNo,date:e.date,nick:e.nick,values:links.slice(0,5),body:e.body.slice(0,420)}); }
    if (solvePattern.test(e.body) && /(?:p\s*56|page\s*56|page56|an\s+end|deep[\s-]?web|hash)/i.test(e.body)) solveCount++;
    if (tags.length) direct.push({...e,tags,score:tags.reduce((n,t)=>n+({p56:10,'an-end':10,'deep-web':8,'hash-to':9,'known-hash-prefix':10,onion:10,'liber-primus':3}[t]||0),0)});
    if ((e.nick || '').toLowerCase() === 'cluosh' && methodPattern.test(e.body)) {
      cluoshMethods.push({...e,tags:['cluosh-method'],score:5});
    }
  }

  function makeWindows(hits) {
    const clusters = [];
    for (const hit of hits.sort((a,b)=>a.lineNo-b.lineNo)) {
      const last = clusters[clusters.length - 1];
      if (last && hit.lineNo <= last.end + 4) {
        last.hits.push(hit);
        last.end = Math.max(last.end, hit.lineNo);
        last.score = Math.max(last.score, hit.score);
      } else {
        clusters.push({start:hit.lineNo,end:hit.lineNo,score:hit.score,hits:[hit]});
      }
    }
    return clusters.map(cluster => {
      const lo = Math.max(1, cluster.start - 2), hi = Math.min(entries.length, cluster.end + 2);
      return {
        from: lo, to: hi, score: cluster.score,
        hitTags: [...new Set(cluster.hits.flatMap(h=>h.tags))],
        lines: entries.slice(lo-1,hi).map(e=>({n:e.lineNo,date:e.date,nick:e.nick,text:e.body.slice(0,500)}))
      };
    });
  }
  const directWindows = makeWindows(direct);
  const cluoshWindows = makeWindows(cluoshMethods);

  const first = {};
  for (const [name,re] of directPatterns) {
    const e = dated.find(x=>re.test(x.body));
    if (e) first[name] = {lineNo:e.lineNo,date:e.date,nick:e.nick,text:e.body.slice(0,500)};
  }
  const cluoshFirst = cluoshMethods[0] || null;
  const liberPrimusMentions = dated.filter(e=>/\\bliber\\s+primus\\b/i.test(e.body)).length;
  return {
    source: path.split(/[\\/]/).pop(),
    bytes: raw.length,
    totalLines: lines.length,
    dated2014Lines: dated.length,
    mayAug2014Lines: mayAug.length,
    counts: {...counts, liberPrimusMentions, cluoshCryptoMessages:cluoshMethods.length, longHexOccurrences:longHexCount, urlOccurrences:urlCount, solveMessagesNearP56:solveCount},
    first,
    firstCluoshCryptoMessage: cluoshFirst && {lineNo:cluoshFirst.lineNo,date:cluoshFirst.date,text:cluoshFirst.body.slice(0,500)},
    longHexSamples: hashes.slice(0,30),
    urlSamples: urls.slice(0,50),
    directContextWindows: directWindows.slice(0,60).concat(directWindows.length>60?directWindows.slice(-20):[]),
    cluoshMethodContextWindows: cluoshWindows.slice(0,35).concat(cluoshWindows.length>35?cluoshWindows.slice(-10):[])
  };
}

const reports = inputs.map(collect);
const summary = reports.map(r=>({
  source:r.source,bytes:r.bytes,totalLines:r.totalLines,dated2014Lines:r.dated2014Lines,
  mayAug2014Lines:r.mayAug2014Lines,counts:r.counts,first:r.first,
  firstCluoshCryptoMessage:r.firstCluoshCryptoMessage
}));
console.log('=== 2014 ORIGINAL IRC CONTEXT MINER: SUMMARY ===');
console.log(JSON.stringify(summary,null,2));
for (const r of reports) {
  console.log('\n=== SOURCE: '+r.source+' | DIRECT P56 / HASH CONTEXT WINDOWS ===');
  console.log(JSON.stringify(r.directContextWindows,null,2));
  console.log('\n=== SOURCE: '+r.source+' | CLUOSH METHOD CONTEXT WINDOWS ===');
  console.log(JSON.stringify(r.cluoshMethodContextWindows,null,2));
  console.log('\n=== SOURCE: '+r.source+' | LONG HEX SAMPLES ===');
  console.log(JSON.stringify(r.longHexSamples,null,2));
  console.log('\n=== SOURCE: '+r.source+' | URL SAMPLES ===');
  console.log(JSON.stringify(r.urlSamples,null,2));
}
