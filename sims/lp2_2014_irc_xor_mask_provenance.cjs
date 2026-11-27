'use strict';

const crypto = require('node:crypto');

const MASK_HEX = '8c12a10087bd6a798609216c13c8fdcf6773ea0d';
const MASK = Buffer.from(MASK_HEX, 'hex');

const SOURCES = [
  {
    name: '#cicadasolvers.freenode.log',
    sha: 'bdd277c14f94c34b5ae714cd00c238065beeed4e',
  },
  {
    name: '#cicadasolvers.freenode.2.log',
    sha: '72634a9d071d32af767edbffc0493d810e88cd0d',
  },
  {
    name: '#33012014.freenode.log',
    sha: 'a2880b1db31ce523599ef30ca2e55291bf295900',
  },
];

const encodings = new Map([
  ['hex-lower', MASK_HEX],
  ['hex-upper', MASK_HEX.toUpperCase()],
  ['base64', MASK.toString('base64')],
  ['base64url', MASK.toString('base64url')],
  ['spaced-hex', [...MASK].map((b) => b.toString(16).padStart(2, '0')).join(' ')],
  ['colon-hex', [...MASK].map((b) => b.toString(16).padStart(2, '0')).join(':')],
  ['decimal-csv', [...MASK].join(',')],
  ['decimal-spaces', [...MASK].join(' ')],
]);

function gitBlobSha1(buf) {
  return crypto
    .createHash('sha1')
    .update(Buffer.from(`blob ${buf.length}\0`))
    .update(buf)
    .digest('hex');
}

function context(lines, index, radius = 12) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length, index + radius + 1);
  return lines.slice(start, end).map((line, i) => ({
    line: start + i + 1,
    text: line,
  }));
}

function nicknameOf(line) {
  const m = line.match(/<([^>]+)>/);
  return m ? m[1] : null;
}

function isDated2014(line) {
  return /^2014 [A-Z][a-z]{2} \d{2} \d{2}:\d{2}/.test(line);
}

function printJson(label, value) {
  console.log(label + ' ' + JSON.stringify(value));
}

async function main() {
  const result = {
    mask_hex: MASK_HEX,
    encodings: Object.fromEntries(encodings),
    sources: [],
    exact_hits: [],
    phrase_hits: [],
    prefix_suffix_hits: [],
    guy1_all_2014: [],
    guy1_interesting: [],
    guy1_nov_window: [],
    neighboring_nicks: {},
  };

  for (const source of SOURCES) {
    const url =
      'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/' +
      encodeURIComponent(source.name);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);

    const buf = Buffer.from(await response.arrayBuffer());
    const actualSha = gitBlobSha1(buf);
    if (actualSha !== source.sha) {
      throw new Error(`${source.name}: Git blob changed: ${actualSha}`);
    }

    const lines = buf.toString('latin1').split(/\r?\n/);
    result.sources.push({
      name: source.name,
      bytes: buf.length,
      sha: actualSha,
      lines: lines.length,
    });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      for (const [kind, needle] of encodings) {
        if (line.includes(needle)) {
          result.exact_hits.push({
            source: source.name,
            line: i + 1,
            kind,
            text: line,
            context: context(lines, i),
          });
        }
      }

      if (lower.includes('the end is near')) {
        result.phrase_hits.push({
          source: source.name,
          line: i + 1,
          text: line,
          context: context(lines, i, 6),
        });
      }

      if (lower.includes(MASK_HEX.slice(0, 8)) || lower.includes(MASK_HEX.slice(-8))) {
        result.prefix_suffix_hits.push({
          source: source.name,
          line: i + 1,
          text: line,
        });
      }

      if (isDated2014(line) && /<guy1__>/i.test(line)) {
        const item = { source: source.name, line: i + 1, text: line };
        result.guy1_all_2014.push(item);

        if (/\b(?:pgp|gpg|sign|signature|hash|sha|xor|key|cipher|derive|source|paste|http|onion|3301|mask|hex|end is near|good luck)\b/i.test(line)) {
          result.guy1_interesting.push(item);
        }

        if (/^2014 Nov 0[1-5] /.test(line)) {
          result.guy1_nov_window.push(item);
        }
      }
    }
  }

  // De-duplicate exact hits when lower/upper encodings coincide in a source line.
  const uniqueExact = [];
  const seen = new Set();
  for (const hit of result.exact_hits) {
    const key = `${hit.source}:${hit.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hit.kinds = result.exact_hits
      .filter((x) => x.source === hit.source && x.line === hit.line)
      .map((x) => x.kind);
    delete hit.kind;
    uniqueExact.push(hit);
  }
  result.exact_hits = uniqueExact;

  // Nick population in the exact-hit context helps distinguish an isolated drive-by
  // message from an ongoing discussion without pretending nicknames authenticate identity.
  for (const hit of uniqueExact) {
    for (const row of hit.context) {
      const nick = nicknameOf(row.text);
      if (nick) result.neighboring_nicks[nick] = (result.neighboring_nicks[nick] || 0) + 1;
    }
  }

  printJson('SUMMARY', {
    sources: result.sources,
    exact_hit_count: result.exact_hits.length,
    phrase_hit_count: result.phrase_hits.length,
    prefix_suffix_hit_count: result.prefix_suffix_hits.length,
    guy1_2014_count: result.guy1_all_2014.length,
    guy1_interesting_count: result.guy1_interesting.length,
    guy1_nov1_5_count: result.guy1_nov_window.length,
    neighboring_nicks: result.neighboring_nicks,
  });

  for (const hit of result.exact_hits) printJson('EXACT', hit);
  for (const hit of result.phrase_hits) printJson('PHRASE', hit);
  for (const hit of result.prefix_suffix_hits) printJson('PREFIX_SUFFIX', hit);
  for (const hit of result.guy1_interesting) printJson('GUY1_INTERESTING', hit);
  for (const hit of result.guy1_nov_window) printJson('GUY1_NOV1_5', hit);

  console.log('RESULT_JSON ' + JSON.stringify(result));
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
