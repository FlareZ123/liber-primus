'use strict';

/**
 * Focused, hash-pinned extraction of 2014 #cicadasolvers discussions that
 * might bear on the original LP2 pp49-51 numeric table. Emits a small JSON
 * artifact rather than a large workflow log.
 *
 * Run: node sims/lp2_2014_p49_irc_witness_extract_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const source = {
  name: '#cicadasolvers.freenode.log',
  bytes: 18487233,
  sha: 'bdd277c14f94c34b5ae714cd00c238065beeed4e'
};
const direct = /\b(?:p(?:age)?\s*[-#:.]?\s*(?:49|50|51|66|67|68)\b|(?:66|67|68)\s*\.jpg|3N\s+3p|base[- ]?60|base[- ]?62|number(?:s|ed)?[- ]?(?:table|grid)|numerical[- ]?(?:table|grid)|256.{0,24}(?:byte|number|char)|(?:byte|number|char).{0,24}256|sexagesimal)\b/i;
const meaning = /\b(?:decipher|decrypt|cipher|plaintext|decoded|solved|meaning|key|vigenere|caesar|translate|rune|base29|base60|bytes|hex|values?|transpos|xor|numerical|ciphertext|numbers)\b/i;
const action = /\b(?:key is|it says|we found|i got|these numbers|the table|the grid|the digits)\b/i;

function gitHash(bytes) {
  return crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes)
    .digest('hex');
}
function score(line) {
  return 5 + (meaning.test(line) ? 3 : 0) + (action.test(line) ? 3 : 0);
}

async function main() {
  const url = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'
    + encodeURIComponent(source.name);
  const response = await fetch(url);
  assert.equal(response.status, 200, 'historical IRC HTTP status');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, source.bytes, 'historical IRC byte length');
  assert.equal(gitHash(bytes), source.sha, 'historical IRC Git blob SHA');

  const lines = bytes.toString('latin1').split(/\r?\n/u);
  const raw = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^2014 (?:May|Jun|Jul|Aug) /u.test(line) || !direct.test(line)) continue;
    raw.push({ line: i + 1, score: score(line), text: line.slice(0, 700) });
  }
  raw.sort((a, b) => b.score - a.score || a.line - b.line);

  // Keep the strongest non-overlapping contexts so repeated log lines do not
  // crowd out distinct conversations. The score/line ordering is frozen.
  const selected = [];
  for (const hit of raw) {
    if (selected.some((prior) => Math.abs(prior.line - hit.line) <= 4)) continue;
    const start = Math.max(0, hit.line - 3);
    const end = Math.min(lines.length, hit.line + 2);
    selected.push({
      line: hit.line,
      score: hit.score,
      contextStartLine: start + 1,
      context: lines.slice(start, end).map((text, j) => ({
        line: start + j + 1,
        text: text.slice(0, 700)
      }))
    });
    if (selected.length === 40) break;
  }

  const output = {
    source: {
      repository: 'cicada-solvers/neuroretransmit-cicada',
      file: source.name,
      bytes: bytes.length,
      gitBlobSha1: gitHash(bytes),
      dateFilter: '2014 May-August'
    },
    search: {
      directPattern: direct.source,
      meaningPattern: meaning.source,
      actionPattern: action.source,
      totalDirectMatches: raw.length,
      returnedDistinctContexts: selected.length,
      sort: 'score descending, then source line ascending',
      context: 'two lines before through one line after each hit'
    },
    hits: selected
  };
  fs.writeFileSync('p49-irc-witnesses.json', JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({
    source: output.source,
    directMatches: raw.length,
    returnedContexts: selected.length,
    topLineNumbers: selected.slice(0, 12).map(x => x.line),
    outputFile: 'p49-irc-witnesses.json'
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
