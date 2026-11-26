'use strict';
/**
 * Bounded 2014 participant-host URL scan for the signed CGI-upload handoff.
 * Fetches only frozen public IRC exports, verifies exact Git blob identities,
 * then scans the Jan 19–Feb 15 submission window and May 1–5 callback window.
 * It does not contact or probe any onion service.
 * Node.js 22, no dependencies.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const owner = 'neuroretransmit/cicada';
const ref = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const sources = [
  ['#cicadasolvers.freenode.log', 18487233, 'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
  ['#33012014.freenode.log', 8629610, 'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const knownCicada = new Set([
  'auqgnxjtvdbll3pv', 'cu343l33nqaekrnw', 'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n', 'q4utgdi2n4m4uim5', 'ut3qtzbrvs7dtvzp',
  'ky2khlqdf7qdznac'
]);
const hostRe = /\b([a-z2-7]{16})(?:\.onion)?\b/gi;
const onionUrlRe = /\b(?:https?:\/\/)?([a-z2-7]{16})\.onion(?:\/[^\s<>()]*)?/gi;
const urlRe = /\bhttps?:\/\/[^\s<>()]+/gi;
const serviceCue = /\b(?:cgi[- ]?bin|key\.asc|upload(?:ed|ing)?|hidden service|tor service|magic squares?|submit(?:ted|ting)?|onion address|service url|server|participant service)\b/i;
const firstPersonCue = /\b(?:i|we|my|our|here|this is|at|host(?:ed|ing)?|running|set up|post(?:ed|ing)?|submit(?:ted|ting)?|url|address)\b/i;
const windows = [
  { label: '2014-01-19..2014-02-15', lo: 119, hi: 215 },
  { label: '2014-05-01..2014-05-05', lo: 501, hi: 505 }
];
const monthNo = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5 };

function blobSha1(buffer) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + buffer.length + '\0', 'ascii'))
    .update(buffer)
    .digest('hex');
}
function parse(line) {
  const m = line.match(/^2014 (Jan|Feb|Mar|Apr|May) (\d{2}) (\d{2}:\d{2}) <([^>]+)>\s?(.*)$/);
  if (!m) return null;
  return {
    key: monthNo[m[1]] * 100 + Number(m[2]),
    timestamp: '2014 ' + m[1] + ' ' + m[2] + ' ' + m[3],
    nick: m[4],
    message: m[5]
  };
}
function inWindow(key) {
  return windows.some(w => key >= w.lo && key <= w.hi);
}
function unique(xs) { return [...new Set(xs)]; }

async function scan(source) {
  const name = source[0], expectedBytes = source[1], expectedSha = source[2];
  const url = 'https://raw.githubusercontent.com/' + owner + '/' + ref + '/irc-logs/' + encodeURIComponent(name);
  const response = await fetch(url);
  assert.equal(response.status, 200, name + ': HTTP ' + response.status);
  const raw = Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length, expectedBytes, name + ': byte length');
  const actualSha = blobSha1(raw);
  assert.equal(actualSha, expectedSha, name + ': original Git blob SHA-1');

  const lines = raw.toString('latin1').split(/\r?\n/);
  const hits = [];
  const hostRows = new Map();
  const windowCounts = Object.fromEntries(windows.map(w => [w.label, 0]));

  for (let i = 0; i < lines.length; i++) {
    const parsed = parse(lines[i]);
    if (!parsed || !inWindow(parsed.key)) continue;
    const win = windows.find(w => parsed.key >= w.lo && parsed.key <= w.hi);
    windowCounts[win.label]++;

    const onionUrls = [...parsed.message.matchAll(onionUrlRe)].map(m => m[1].toLowerCase());
    const hostTokens = [...parsed.message.matchAll(hostRe)].map(m => m[1].toLowerCase());
    const hasOnionWord = /\bonion\b|\bservice\b/i.test(parsed.message);
    const hosts = unique([...onionUrls, ...hostTokens.filter(h => hasOnionWord)]);
    const urls = [...parsed.message.matchAll(urlRe)].map(m => m[0]);
    const cue = serviceCue.test(parsed.message);
    const firstPerson = firstPersonCue.test(parsed.message);
    if (hosts.length) {
      for (const h of hosts) {
        if (!hostRows.has(h)) hostRows.set(h, []);
        hostRows.get(h).push({ line: i + 1, timestamp: parsed.timestamp, nick: parsed.nick, message: parsed.message });
      }
    }
    if (hosts.length || (cue && firstPerson) || (cue && urls.length)) {
      hits.push({
        line: i + 1,
        timestamp: parsed.timestamp,
        nick: parsed.nick,
        hosts,
        knownCicada: hosts.filter(h => knownCicada.has(h)),
        urls,
        message: parsed.message
      });
    }
  }

  console.log('\n=== ' + name + ' ===');
  console.log(JSON.stringify({
    pinnedRef: ref,
    bytes: raw.length,
    gitBlobSha1: actualSha,
    lines: lines.length,
    windowLineCounts: windowCounts,
    relevantHitCount: hits.length,
    uniqueHostTokenCount: hostRows.size,
    unknownHostTokenCount: [...hostRows.keys()].filter(h => !knownCicada.has(h)).length
  }, null, 2));

  for (const [host, rows] of hostRows.entries()) {
    console.log('HOST ' + host + ' classification=' + (knownCicada.has(host) ? 'known-Cicada-address' : 'unclassified') + ' occurrences=' + rows.length);
    for (const row of rows.slice(0, 8)) {
      console.log('  L' + row.line + ' ' + row.timestamp + ' <' + row.nick + '> ' + row.message.slice(0, 500));
    }
  }
  if (name === '#cicadasolvers.freenode.log') {
    const candidateNicks = new Set(['cheetahburn', 'mlehmk', 'nicelurk', 'dynomite27', 'amone', 'jonsmif']);
    const followups = [];
    for (let i = 0; i < lines.length; i++) {
      const parsed = parse(lines[i]);
      if (!parsed || !inWindow(parsed.key)) continue;
      const nick = parsed.nick.toLowerCase();
      const isFebFollowup = candidateNicks.has(nick) && parsed.key >= 204 && parsed.key <= 212;
      const isMayOwner = candidateNicks.has(nick) && parsed.key >= 501 && parsed.key <= 505;
      const isMayService = parsed.key >= 501 && parsed.key <= 505 &&
        /kholyg7cewyywujo|upload7dq6dgt7cx|cgi-bin|key\.asc|message\.txt\.asc|CicaDOS|(?:cicada.*(?:server|service|upload|message|request|key))|(?:(?:server|service|upload|message|request|key).*cicada)/i.test(lines[i]);
      if (isFebFollowup || isMayOwner || isMayService) {
        followups.push({ line: i + 1, timestamp: parsed.timestamp, nick: parsed.nick, message: parsed.message });
      }
    }
    console.log('--- candidate service-owner/callback lines ---');
    for (const row of followups) {
      console.log('L' + row.line + ' ' + row.timestamp + ' <' + row.nick + '> ' + row.message.slice(0, 700));
    }
  }
  console.log('--- participant/service-context lines ---');
  for (const h of hits.slice(0, 220)) {
    console.log('L' + h.line + ' ' + h.timestamp + ' <' + h.nick + '> hosts=' + (h.hosts.join(',') || '-') + ' urls=' + (h.urls.join(',') || '-') + ' ' + h.message.slice(0, 500));
  }
  if (hits.length > 220) console.log('TRUNCATED ' + (hits.length - 220) + ' further hits');
}

async function main() {
  console.log('Read-only scan: no onion requests, no credential use, no participant contact.');
  for (const source of sources) await scan(source);
}
main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
