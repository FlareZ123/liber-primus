'use strict';

/**
 * Bounded source-native discovery of 2015–16 IRC-linked media relevant to unknown LP2.
 * It fetches only the two immutable original IRC blobs, verifies Git blob SHA-1,
 * and emits contextual candidate URLs for human freezing. It does not crawl links.
 * Reproduction: Windows/Node.js 22, built-in fetch only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const SOURCES = [
  { name: '#cicadasolvers.freenode.log', bytes: 18487233, sha: 'bdd277c14f94c34b5ae714cd00c238065beeed4e' },
  { name: '#cicadasolvers.freenode.2.log', bytes: 27234234, sha: '72634a9d071d32af767edbffc0493d810e88cd0d' }
];
const LINE = /^(201[56]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d\d) (\d\d):(\d\d) <([^>]+)> (.*)$/;
const URL = /(?:https?|ftp):\/\/[^\s<>"']+/gi;
const MEDIA_EXT = /\.(?:jpe?g|png|gif|bmp|tiff?|webp|svg|mp4|mov|avi|mkv|wmv|mp3|wav|pdf|zip|7z|rar|gz|tar|bin|dat|txt|py|js|c|cpp|java|exe|docx?|xlsx?|csv|json)(?:[?#].*)?$/i;
const MEDIA_HOST = /(?:imgur\.com|imageshack\.com|tinypic\.com|photobucket\.com|flickr\.com|picasaweb\.google|gyazo\.com|prnt\.sc|snipboard\.io|youtube\.com|youtu\.be|vimeo\.com|mediafire\.com|dropbox\.com|drive\.google\.com|pastebin\.com|paste\.ee|gist\.github\.com)/i;
const DISCUSSION_HOST = /(?:reddit\.com|wikia\.com|fandom\.com|stackexchange\.com|forum|boards\.)/i;
const MEDIA_WORDS = /\b(?:screenshot|screen\s?cap|screen(?:shot)?|image|picture|photo|video|attachment|uploaded?|download|file|diagram|scan|output|program|script|decoder|cipher|key|decrypt(?:ed|ion|ing)?|plaintext|cleartext|runes?|liber\s+primus|LP2)\b/i;
const UNKNOWN_WORDS = /\b(?:page|pg|p)\s*[#:\-. ]?\s*(?:0?\d|[1-4]\d|5[0-5])\b|\b(?:unknown|unsolved|encrypted|ciphertext|decrypt|decipher|plaintext|cleartext|LP2|Liber Primus)\b/i;
const EXCLUDE = /(?:titanpad|pastebin\.com\/.*(?:known|p56|p57)|liber-primus-complete|\/(?:0?[0-9]|[1-4][0-9]|5[0-5])\.jpg)/i;

function gitBlobSha(data) {
  return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
}
function trimUrl(value) {
  let s = value.replace(/[.,;:!?]+$/g, '');
  while (s.endsWith(')') && (s.match(/\(/g) || []).length < (s.match(/\)/g) || []).length) s = s.slice(0, -1);
  return s;
}
function parse(line, n, source) {
  const m = line.match(LINE);
  if (!m) return null;
  return {
    year: Number(m[1]), date: m[1] + ' ' + m[2] + ' ' + m[3],
    time: m[4] + ':' + m[5], nick: m[6], body: m[7], line: n, source
  };
}
function urls(body) {
  return [...body.matchAll(URL)].map(m => trimUrl(m[0]));
}
function scoreCandidate(url, context) {
  const ext = MEDIA_EXT.test(url);
  const host = MEDIA_HOST.test(url);
  const discussion = DISCUSSION_HOST.test(url);
  const mediaWords = MEDIA_WORDS.test(context);
  const unknown = UNKNOWN_WORDS.test(context);
  const excluded = EXCLUDE.test(url) || /titanpad/i.test(context);
  let score = (ext ? 8 : 0) + (host ? 6 : 0) + (discussion ? 1 : 0) +
    (mediaWords ? 5 : 0) + (unknown ? 6 : 0);
  if (/\b(?:page\s*56|p56|page\s*57|p57)\b/i.test(context) &&
      !/\b(?:page|pg|p)\s*[#:\-. ]?\s*(?:0?\d|[1-4]\d|5[0-5])\b/i.test(context)) score -= 10;
  if (/\b(?:already\s+solved|known\s+plaintext|LP1|solved\s+page)\b/i.test(context)) score -= 5;
  if (/github\.com\/[^/]+\/[^/]+(?:\/(?:tree|blob|commit)\/|$)/i.test(url) && !ext) score -= 8;
  if (excluded) score = -100;
  return { score, ext, host, discussion, mediaWords, unknown, excluded };
}
function selftest() {
  assert.equal(gitBlobSha(Buffer.from('test')), '30d74d258442c7c65512eafab474568dd706c430');
  assert.deepEqual(urls('see https://i.imgur.com/a.png and http://example.org/x.txt.'), [
    'https://i.imgur.com/a.png', 'http://example.org/x.txt'
  ]);
  const ctx = 'page 35 encrypted runes, here is a screenshot https://i.imgur.com/a.png';
  const s = scoreCandidate('https://i.imgur.com/a.png', ctx);
  assert(s.score >= 20 && s.ext && s.host && s.unknown);
  assert.equal(scoreCandidate('https://titanpad.com/abc', ctx).score, -100);
  console.log('SELFTEST PASS: exact Git blob identity, URL extraction, media scoring, Titanpad exclusion');
}
async function loadSource(source) {
  const url = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/' + encodeURIComponent(source.name);
  const response = await fetch(url);
  assert.equal(response.status, 200, 'source HTTP status: ' + source.name);
  const data = Buffer.from(await response.arrayBuffer());
  assert.equal(data.length, source.bytes, 'source byte length: ' + source.name);
  assert.equal(gitBlobSha(data), source.sha, 'source Git blob SHA-1: ' + source.name);
  return data.toString('latin1').split(/\r?\n/u)
    .map((line, i) => parse(line, i + 1, source.name)).filter(Boolean);
}
async function main() {
  selftest();
  const all = [];
  for (const source of SOURCES) {
    const rows = await loadSource(source);
    const byUrl = new Map();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const found = urls(row.body);
      if (!found.length) continue;
      const lo = Math.max(0, i - 14), hi = Math.min(rows.length, i + 15);
      const near = rows.slice(lo, hi).filter(x => x.date === row.date);
      const context = near.map(x => x.nick + ': ' + x.body).join('\n');
      for (const url of found) {
        const meta = scoreCandidate(url, context);
        if (meta.score < 10) continue;
        const item = {
          url, source: row.source, date: row.date, time: row.time, nick: row.nick,
          line: row.line, score: meta.score, flags: {
            directMediaExtension: meta.ext, mediaHost: meta.host,
            discussionHost: meta.discussion, mediaContext: meta.mediaWords,
            unknownLP2Context: meta.unknown
          },
          context: near.map(x => 'L' + x.line + ' ' + x.time + ' <' + x.nick + '> ' + x.body.slice(0, 360))
        };
        const prior = byUrl.get(url);
        if (!prior || item.score > prior.score) byUrl.set(url, item);
      }
    }
    const candidates = [...byUrl.values()].sort((a, b) => b.score - a.score || a.line - b.line);
    console.log('SOURCE ' + source.name + ' sha=' + source.sha +
      ' timestampedLines=' + rows.length + ' uniqueRelevantURLs=' + candidates.length);
    all.push(...candidates);
  }
  all.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date) || a.line - b.line);
  const global = new Map();
  for (const item of all) {
    const prior = global.get(item.url);
    if (!prior || item.score > prior.score) global.set(item.url, item);
  }
  const ranked = [...global.values()].sort((a, b) => b.score - a.score || a.date.localeCompare(b.date) || a.line - b.line);
  console.log('TOTAL UNIQUE CONTEXT-RELEVANT URLS ' + ranked.length);
  console.log('CANDIDATES_BEGIN');
  for (let i = 0; i < Math.min(120, ranked.length); i++) {
    const x = ranked[i];
    console.log('CANDIDATE ' + (i + 1) + ' ' + JSON.stringify({
      url: x.url, source: x.source, date: x.date, time: x.time, nick: x.nick,
      line: x.line, score: x.score, flags: x.flags
    }));
    for (const line of x.context) console.log('  ' + line);
  }
  console.log('CANDIDATES_END');
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
