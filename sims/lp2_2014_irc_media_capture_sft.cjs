'use strict';

/**
 * Original 2014 #cicadasolvers image/video source-locator census for Director #908.
 * Node.js 22 CommonJS; only May-August 2014 messages are counted.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const SOURCE_BYTES = 18487233;
const SOURCE_GIT_BLOB = 'bdd277c14f94c34b5ae714cd00c238065beeed4e';
const MEDIA_HOST = /(?:^|\.)(?:imgur\.com|gyazo\.com|prntscr\.com|prnt\.sc|puu\.sh|tinypic\.com|imageshack\.(?:com|us)|photobucket\.com|flickr\.com|flic\.kr|youtube\.com|youtu\.be|vimeo\.com|twitpic\.com|dropbox\.com|minus\.com|minus\.io|instagram\.com|screenr\.com|screencast\.com|lightshot\.com|pasteboard\.co|postimg\.(?:org|cc)|postimage\.org|yfrog\.com|i\.ibb\.co|streamable\.com)$/i;
const DIRECT_MEDIA = /\.(?:jpe?g|png|gif|webp|bmp|tiff?|mp4|webm|mov|avi|wmv|mkv)(?:$|[?#])/i;
const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const PERIOD = /^2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d /;

/** @param {Buffer} b */
function originalBlobHash(b) {
  return crypto.createHash('sha1').update('blob ' + b.length + '\0', 'utf8').update(b).digest('hex');
}

/** @param {string} input */
function cleanUrl(input) {
  return input.replace(/[.,;!?)\]}]+$/g, '');
}

/** @param {string} input */
function qualifiesMediaUrl(input) {
  try {
    const u = new URL(input);
    return MEDIA_HOST.test(u.hostname.toLowerCase()) || DIRECT_MEDIA.test(u.pathname);
  } catch {
    return false;
  }
}

/** @param {string} l */
function urlsFromLine(l) {
  return [...l.matchAll(URL_PATTERN)].map(m => cleanUrl(m[0])).filter(qualifiesMediaUrl);
}

/** @param {string[]} lines */
function extract(lines) {
  const findings = [];
  const domains = new Map();
  let periodLines = 0;
  for (let i=0; i<lines.length; i++) {
    if (!PERIOD.test(lines[i])) continue;
    periodLines++;
    const urls = urlsFromLine(lines[i]);
    if (!urls.length) continue;
    const adjacent = lines.slice(Math.max(0, i-5), Math.min(lines.length,i+7));
    const context = adjacent.join('\n');
    const contextLP = /(liber.?primus|\blp2\b|\bpage\s*(?:[0-5]?\d)\b|\brunes?\b|\bdecode\b|\bdecrypt|\bcicada\b|\bbook\b)/i.test(context);
    const contextKey = /(key|plaintext|cleartext|decoded|decrypt|script|solve|screenshot|screen.?shot|recording|screencast|capture|picture|showing)/i.test(context);
    for (const url of urls) {
      const domain = new URL(url).hostname.toLowerCase();
      domains.set(domain, (domains.get(domain)||0)+1);
      findings.push({
        line:i+1, source:lines[i].slice(0,450), url, domain,
        contextLP, contextKey,
        score: Number(contextLP)*4 + Number(contextKey)*3
          + Number(/(?:page|rune|liber|primus|decrypt|solv|key|screen|image|proof)/i.test(lines[i]))*3
          - Number(/(?:\bp56\b|page\s*56\b|an end)/i.test(context))*2,
        neighbors:adjacent.map((text,k)=>({line:Math.max(0,i-5)+k+1,text:text.slice(0,290)}))
      });
    }
  }
  findings.sort((a,b)=>b.score-a.score||a.line-b.line);
  return {periodLines,mediaMatches:findings.length,domains:[...domains].sort((a,b)=>b[1]-a[1]),findings};
}

function selftest() {
  const lines = [
    '2014 May 19 01:58 <x> random http://example.com/pasteme',
    '2014 May 20 03:00 <x> i solved the page 4 rune decoder',
    '2014 May 20 03:01 <x> screenshot http://i.imgur.com/example.png',
    '2014 May 20 03:02 <y> I see the key',
    '2014 Sep 20 03:03 <z> old photo http://i.imgur.com/later.jpg',
    '2014 Jun 20 00:03 <x> http://gyazo.com/abcd',
    '2014 Jun 20 00:04 <x> http://example.com/report.txt'
  ];
  const v=extract(lines);
  assert.equal(v.periodLines,6);
  assert.equal(v.mediaMatches,2);
  assert(v.findings.find(x=>x.line===3)?.contextLP);
  assert(v.findings.find(x=>x.line===6));
  assert.deepEqual(urlsFromLine('http://example.com/foo.png);'), ['http://example.com/foo.png']);
  console.log('SELFTEST PASS: period filter, URL extraction and contextual media selector');
}

if (process.argv[2] === '--selftest') {
  selftest();
} else {
  assert.equal(process.argv.length,3,'Supply exact original #cicadasolvers log path');
  const buffer=fs.readFileSync(process.argv[2]);
  assert.equal(buffer.length,SOURCE_BYTES,'Original 2014 log byte length mismatch');
  assert.equal(originalBlobHash(buffer),SOURCE_GIT_BLOB,'Original 2014 Git blob SHA1 mismatch');
  const result=extract(buffer.toString('latin1').split(/\r?\n/));
  console.log('ORIGINAL',JSON.stringify({gitBlob:SOURCE_GIT_BLOB,periodLines:result.periodLines,mediaMatches:result.mediaMatches,domains:result.domains}));
  for (const f of result.findings.slice(0,100))console.log('HISTORICAL_MEDIA',JSON.stringify(f));
  console.log('Printed',Math.min(100,result.mediaMatches),'of',result.mediaMatches,'original-date URL occurrences; rank uses original context, not plaintext scoring');
}
