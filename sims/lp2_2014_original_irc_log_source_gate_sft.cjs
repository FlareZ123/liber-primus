'use strict';

/**
 * Inspect archived 2014 Cicada Freenode logs from the original public
 * neuroretransmit/cicada tree, without inventing absent IRC history.
 * Node.js 22 CommonJS. The executable gate expects three local source files.
 * Positive source identity uses Git blob hashes for all three.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const sources = [
  {name:'#cicadasolvers.freenode.log', hash:'bdd277c14f94c34b5ae714cd00c238065beeed4e', size:18487233},
  {name:'#cicadasolvers.freenode.2.log', hash:'72634a9d071d32af767edbffc0493d810e88cd0d', size:27234234},
  {name:'#33012014.freenode.log', hash:'a2880b1db31ce523599ef30ca2e55291bf295900', size:8629610}
];

/** @param {Buffer} buf @returns {string} */
function blobHash(buf) {
  return crypto.createHash('sha1')
    .update('blob ' + buf.length + '\0', 'ascii')
    .update(buf).digest('hex');
}

/** @param {string} path @param {number} max */
function inspect(path, max) {
  const meta = sources.find(s => path.endsWith(s.name));
  assert(meta, 'Unsupported source path: ' + path);
  const buf = fs.readFileSync(path);
  assert.equal(buf.length, meta.size, 'Original source byte count changed');
  assert.equal(blobHash(buf), meta.hash, 'Original Git blob changed');
  // Historic mIRC exports have cp1252 codepoints, with ISO-8859-1
  // preserving ASCII date stamps and filenames exactly.
  const lines = buf.toString('latin1').split(/\r?\n/);
  const yearCounts = new Map();
  const months2014 = new Map();
  const matches = [], first2014 = [], last2014 = [];
  const search = /\b(cluosh|liber primus|page 56|page56|deep.web|36367763|totient|hashes to|titanpad|ky2khlqdf7qdznac|vFCy7T5p0O)\b/i;
  for (let i=0; i<lines.length; i++) {
    const line=lines[i];
    const d = line.match(/^(20\d\d) ([A-Z][a-z]{2}) \d\d /);
    if (!d) continue;
    yearCounts.set(d[1], (yearCounts.get(d[1]) || 0)+1);
    if (d[1] !== '2014') continue;
    months2014.set(d[2], (months2014.get(d[2]) || 0)+1);
    if (first2014.length<4) first2014.push({i:i+1,text:line.slice(0,240)});
    if (last2014.length===4)last2014.shift();
    last2014.push({i:i+1,text:line.slice(0,240)});
    if (search.test(line)) matches.push({i:i+1,text:line.slice(0,390)});
  }
  const sample = matches.length<=max?matches:matches.slice(0,max/2).concat(matches.slice(-max/2));
  const high = matches.filter(v => /^2014 (May|Jun|Jul|Aug) /.test(v.text) &&
    /(page.?56|p56\b|an end|36367763|hashes to|deep.web|totient|sha.?512|<cluosh>.*(solv|key|page|rune|cipher|prime|hash|decrypt))/i.test(v.text));
  const highSamples = high.length <= 200 ? high : high.slice(0,100).concat(high.slice(-100));

  const result = {source:meta.name,sourceGitBlob:meta.hash,totalLines:lines.length,
    years:Object.fromEntries(yearCounts),months2014:Object.fromEntries(months2014),
    first2014,last2014,focusMatchesTotal:matches.length,focusSamples:sample,
    highSignalMayAugTotal:high.length,highSignalMayAugSamples:highSamples};
  if (meta.name === '#cicadasolvers.freenode.log') {
    const sites = [163814,168094,178827,205898,206244];
    result.sourceContext = sites.map(site => ({
      site, lines:lines.slice(site - 5, site + 4)
        .map((line,j) => ({n:site - 4 + j,text:line.slice(0,500)}))
    }));
  }
  console.log(JSON.stringify(result,null,2));
}
assert.equal(process.argv.length, 5,'Pass three original local log paths');
for (const path of process.argv.slice(2)) inspect(path, 70);
