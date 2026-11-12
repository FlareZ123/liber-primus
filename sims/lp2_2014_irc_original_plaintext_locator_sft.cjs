'use strict';

/**
 * Scan pinned original May 2014+ IRC for an unknown LP2 page's claimed
 * plaintext, key, decoder or source. Networked Node 22 SFT, no writes.
 *
 * node sims/lp2_2014_irc_original_plaintext_locator_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const https = require('node:https');
const readline = require('node:readline');

const OWNER = 'cicada-solvers';
const REPO = 'neuroretransmit-cicada';
const COMMIT = 'b13600373d3400d75ec4208198019f3d92a304dd';
const FILES = [
  { name: '#33012014.freenode.log', size: 8629610,
    gitSha: 'a2880b1db31ce523599ef30ca2e55291bf295900' },
  { name: '#cicadasolvers.freenode.log', size: 18487233,
    gitSha: 'bdd277c14f94c34b5ae714cd00c238065beeed4e' },
  { name: '#cicadasolvers.freenode.2.log', size: 27234234,
    gitSha: '72634a9d071d32af767edbffc0493d810e88cd0d' },
  { name: '#cicada3301.freenode.log', size: 291299,
    gitSha: '7eb6a3dacc841aee3930696f3b0441d091a1a457' },
];

/** @param {string} line @returns {boolean} */
function isPostRelease(line) {
  const m = /^(201[4-7])\s+([A-Za-z]{3})\s+(\d{1,2})\s/.exec(line);
  if (!m) return false;
  const month = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').indexOf(m[2]);
  return month >= 0 && (Number(m[1]) > 2014 || month > 4 || (month === 4 && Number(m[3]) >= 11));
}

/** @param {string} line @returns {number} */
function priority(line) {
  const m = /liber[\s_-]*primus|\bLP2\b|\bLP\b|unsolved[\s_-]*pages?|(?:page|pg)\s*\#?\s*\d{1,2}\b|\b(?:0?[0-9]|[1-5][0-9])\.jpg\b/i.test(line);
  const a = /decrypt|decode|decipher|solv|key|plaintext|pass(?:word|phrase)|cipher|vigen[eè]re|totient|source|hint|hidden|outguess|encrypted|reveal|method|analy[sz]e/i.test(line);
  if (!m || !a) return 0;
  let score = 1;
  if (/liber[\s_-]*primus|\bLP2\b|unsolved[\s_-]*pages?/i.test(line)) score += 7;
  if (/decrypt|decod|decipher|plaintext|pass(?:word|phrase)/i.test(line)) score += 7;
  if (/\bkey\b|cipher|totient|outguess|source/i.test(line)) score += 4;
  if (/\b(found|solved|got|worked|revealed|figured|cracked|recovered|decoded)\b/i.test(line)) score += 5;
  if (/https?:\/\/|pastebin|\.onion/i.test(line)) score += 2;
  if (/\b(?:page|pg)\s*\#?\s*(?:56|57)\b|\b(?:56|57)\.jpg\b/i.test(line) &&
    !/unsolved|primus|other|0\.jpg|1\.jpg/i.test(line)) score -= 10;
  if (/\s\*\s(?:Join|Quit|Part|Nick|Topic|Set|Mode|Kicked)/i.test(line)) score -= 5;
  return score;
}

/**
 * @param {URL} url
 * @returns {Promise<import('node:http').IncomingMessage>}
 */
function response(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'lp2-source-archive-sft' } }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('GET ' + url + ' HTTP ' + res.statusCode));
      } else resolve(res);
    }).on('error', reject);
  });
}

/** @param {{name:string,size:number,gitSha:string}} file */
async function scan(file) {
  const url = new URL('https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' +
    COMMIT + '/irc-logs/' + encodeURIComponent(file.name));
  const stream = await response(url);
  const digest = crypto.createHash('sha1').update(Buffer.from('blob ' + file.size + '\0'));
  let bytes = 0, lines = 0, postRelease = 0, candidates = 0;
  const top = [];
  stream.on('data', chunk => { bytes += chunk.length; digest.update(chunk); });
  const input = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of input) {
    lines++;
    if (!isPostRelease(line)) continue;
    postRelease++;
    const score = priority(line);
    if (!score) continue;
    candidates++;
    top.push({ file: file.name, line: lines, score, text: line.trim().slice(0, 400) });
    top.sort((a, b) => b.score - a.score || a.line - b.line);
    if (top.length > 65) top.pop();
  }
  assert.equal(bytes, file.size, file.name + ' size');
  assert.equal(digest.digest('hex'), file.gitSha, file.name + ' Git blob SHA-1');
  return { file: file.name, bytes, lines, postRelease, candidates, top };
}

async function main() {
  const results = [];
  for (const file of FILES) {
    const r = await scan(file);
    results.push(r);
    console.log('SOURCE', r.file, 'gitsha', file.gitSha, 'bytes', r.bytes,
      'lines', r.lines, 'post-release', r.postRelease, 'candidate lines', r.candidates);
  }
  console.log('ARCHIVE', OWNER + '/' + REPO, 'pinned commit', COMMIT);
  for (const r of results) {
    console.log('=== CANDIDATES: ' + r.file + ' ===');
    for (const c of r.top) console.log('[' + c.score + ' / line ' + c.line + '] ' + c.text);
  }
  console.log('COMPLETE: participant claims require independent original-cipher recovery before promotion.');
}

main().catch(e => { console.error(e); process.exitCode = 1; });
