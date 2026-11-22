#!/usr/bin/env node
'use strict';

// Bounded scan of the three byte-preserved 2014 participant IRC exports.
// These are contemporaneous community captures, not Cicada-authored instructions.
// Verify each exact Git blob before interpreting any text.
const https = require('node:https');
const crypto = require('node:crypto');
const { StringDecoder } = require('node:string_decoder');

const SOURCES = [
  {
    name: '#cicadasolvers.freenode.log',
    url: 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log',
    bytes: 18487233,
    gitBlobSha1: 'bdd277c14f94c34b5ae714cd00c238065beeed4e',
  },
  {
    name: '#cicadasolvers.freenode.2.log',
    url: 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log',
    bytes: 27234234,
    gitBlobSha1: '72634a9d071d32af767edbffc0493d810e88cd0d',
  },
  {
    name: '#33012014.freenode.log',
    url: 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%2333012014.freenode.log',
    bytes: 8629610,
    gitBlobSha1: 'a2880b1db31ce523599ef30ca2e55291bf295900',
  },
];

const PERIOD_RE = /^(201[234]) [A-Z][a-z]{2} \d{1,2} \d{2}:\d{2}/;

const TERMS = [
  ['caesar', /\bcaesar(?:'s)?\b/i],
  ['pompey-pompei', /\bpompe(?:y|i|ius|ii)\b/i],
  ['hispania', /\bhispania\b/i],
  ['bellum-civile', /\bbellum\s+civile\b/i],
  ['de-bello', /\bde\s+bello\b/i],
  ['sequendi', /\bsequendi\b/i],
  ['rationem', /\brationem\b/i],
];

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    const req = https.get(url, { headers: { 'User-Agent': 'liber-primus-source-audit/1.0' } }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        return resolve(get(next, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      }
      resolve(res);
    });
    req.on('error', reject);
    req.setTimeout(120000, () => req.destroy(new Error('request timeout: ' + url)));
  });
}

async function scan(source) {
  const res = await get(source.url);
  const gitHash = crypto.createHash('sha1');
  gitHash.update(Buffer.from('blob ' + source.bytes + '\0', 'utf8'));
  const decoder = new StringDecoder('utf8');
  const counts = Object.fromEntries(TERMS.map(([name]) => [name, 0]));
  const examples = Object.fromEntries(TERMS.map(([name]) => [name, []]));
  let bytes = 0;
  let lineNumber = 0;
  let pending = '';
  const allLines = [];

  function inspect(line) {
    lineNumber++;
    allLines.push(line);
    if (!PERIOD_RE.test(line)) return;
    for (const [name, re] of TERMS) {
      if (re.test(line)) {
        counts[name]++;
        if (examples[name].length < 12) {
          examples[name].push({
            line: lineNumber,
            timestamp: (line.match(/^(201[234] [A-Z][a-z]{2} \d{1,2} \d{2}:\d{2})/) || [])[1] || null,
            text: line.slice(0, 500),
          });
        }
      }
    }
  }

  for await (const chunk of res) {
    bytes += chunk.length;
    gitHash.update(chunk);
    pending += decoder.write(chunk);
    let at;
    while ((at = pending.indexOf('\n')) !== -1) {
      let line = pending.slice(0, at);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      inspect(line);
      pending = pending.slice(at + 1);
    }
  }
  pending += decoder.end();
  if (pending.length) inspect(pending);

  const actualSha = gitHash.digest('hex');
  const verified = bytes === source.bytes && actualSha === source.gitBlobSha1;
  const contextPattern = /\b(?:Liber Primus|thelatinlibrary|De Bello|Bellum Civile|Pompey|Pompei|Hispania|sequendi|rationem)\b/i;
  const contextMatches = [];
  for (let i = 0; i < allLines.length; i++) {
    if (PERIOD_RE.test(allLines[i]) && contextPattern.test(allLines[i]) && contextMatches.length < 80) {
      contextMatches.push({line:i+1, context:allLines.slice(Math.max(0,i-2),Math.min(allLines.length,i+3))});
    }
  }
  return {
    source: source.name,
    bytes,
    lines: lineNumber,
    expectedBytes: source.bytes,
    gitBlobSha1: actualSha,
    expectedGitBlobSha1: source.gitBlobSha1,
    sourceVerified: verified,
    scanPeriod: '2012-2014 only',
    termCounts: counts,
    examples,
    contextMatches,
  };
}

(async () => {
  const results = [];
  for (const source of SOURCES) {
    const result = await scan(source);
    results.push(result);
    process.stdout.write(JSON.stringify(result) + '\n');
    if (!result.sourceVerified) throw new Error('source identity mismatch: ' + source.name);
  }
  const total = Object.fromEntries(TERMS.map(([name]) => [name, results.reduce((n, r) => n + r.termCounts[name], 0)]));
  process.stdout.write('TOTAL ' + JSON.stringify(total) + '\n');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
