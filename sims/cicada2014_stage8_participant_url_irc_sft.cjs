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
  'auqgnxjtvdbll3pv', 'cu343l33nqaekrnw', 'auowyfgl5lkzfj3n',
  'fv7lyucmeozzd5j4', 'ut3qtzbrvs7dtvzp', 'ky2khlqdf7qdznac',
  'p7amjopgric7dfdi', 'xsxnaksict6egxkq', 'pklmx2eeh6fjt7zf'
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
    const focused = [];
    for (let i = 0; i < lines.length; i++) {
      const parsed = parse(lines[i]);
      if (!parsed || !inWindow(parsed.key)) continue;
      const lower = lines[i].toLowerCase();
      const targetOwner = parsed.nick.toLowerCase() === 'cheetahburn';
      const targetHost = lower.includes('kholyg7cewyywujo') || lower.includes('upload7dq6dgt7cx');
      const mayCallback = parsed.key >= 501 && parsed.key <= 505 &&
        /cicada|cicados|key\\.asc|cgi-bin|upload|message\\.txt\\.asc|hidden service/.test(lower);
      if (targetOwner || targetHost || mayCallback) {
        focused.push({ line: i + 1, timestamp: parsed.timestamp, nick: parsed.nick, message: parsed.message });
      }
    }
    const candidateNicks = new Set(['cheetahburn', 'mlehmk', 'NiceLurk', 'dynomite27', 'amone', 'jonsmif']);
    const candidateFollowups = [];
    for (let i = 0; i < lines.length; i++) {
      const parsed = parse(lines[i]);
      if (!parsed || !inWindow(parsed.key)) continue;
      const inFeb4toFeb12 = parsed.key >= 204 && parsed.key <= 212;
      const inMayCallback = parsed.key >= 501 && parsed.key <= 505;
      if ((candidateNicks.has(parsed.nick) && (inFeb4toFeb12 || inMayCallback)) ||
          (inMayCallback && /kholyg7cewyywujo|upload7dq6dgt7cx|cgi-bin|key\\.asc|message\\.txt\\.asc|Cicada|CicaDOS|upload/i.test(lines[i]))) {
        candidateFollowups.push({ line: i + 1, timestamp: parsed.timestamp, nick: parsed.nick, message: parsed.message });
      }
    }
    console.log('--- candidate owner follow-ups (Feb 4–12 and May 1–5) ---');
    for (const row of candidateFollowups) {
      console.log('L' + row.line + ' ' + row.timestamp + ' <' + row.nick + '> ' + row.message.slice(0, 700));
    }
    console.log('--- focused owner/host/callback trace ---');
    for (const row of focused.slice(0, 180)) {
      console.log('L' + row.line + ' ' + row.timestamp + ' <' + row.nick + '> ' + row.message.slice(0, 700));
    }
    if (focused.length > 180) console.log('TRUNCATED ' + (focused.length - 180) + ' further focused lines');
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
