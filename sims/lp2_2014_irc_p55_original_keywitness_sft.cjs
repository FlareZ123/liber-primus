'use strict';

/**
 * A single bounded 2014 eyewitness/operational-key screen for the original
 * final unknown Liber Primus page (archive 72.jpg, physical LP2 p55).
 * Search source-period IRC for page identifiers plus explicit proposed
 * transformations, keys and successful native plaintext. This is a historical
 * cue discovery experiment and cannot authenticate a community claim.
 *
 * Node.js22 CommonJS: node sims/lp2_2014_irc_p55_original_keywitness_sft.cjs
 * No dependencies, no local file writes.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const files = [
  ['#cicadasolvers.freenode.log', 18487233,
    'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
  ['#33012014.freenode.log', 8629610,
    'a2880b1db31ce523599ef30ca2e55291bf295900'],
  ['#cicadasolvers.freenode.2.log', 27234234,
    '72634a9d071d32af767edbffc0493d810e88cd0d']
];
const commit = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const period = /^2014 (May|Jun|Jul|Aug) \d\d \d\d:\d\d /;
const exactPage = /\b(?:72[.]jpg|page\s*(?:72|55)\b|p(?:age)?\s*55\b|last\s+(?:page|leaf|rune\s+page)|final\s+(?:page|leaf))\b/i;
const illustration = /\b(?:moth|butterfly|insect|cicada|flower|tree|branches)\b/i;
const method = /\b(?:totient|phi|prime|vigen(?:ere|ere)|atbash|cipher|shift|key|decode|decipher|decrypt|solve|solved|plaintext|steganograph|outguess|hidden|page|book\s*cipher|pass(?:phrase|word)|onion|hash)\b/i;
const success = /\b(?:deciphered|decrypted|solved|cracked|solution|plaintext|decoded|key\s*(?:is|was)|found\s*(?:the|a)\s*(?:key|message)|got\s*it)\b/i;
const intervention = /\b(?:page\s*55|72[.]jpg|p55|moth)\b/i;
const authenticKey = /\b(?:circumference|divinity|firfumferenfe|prime|totient|openpuff|outguess|pgp|signature)\b/i;

/** @param {Buffer} b @returns {string} */
function gitHash(b) {
  return createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
}

/** @param {string} s @returns {string} */
function compact(s) {
  return s.replace(/[\u0000-\u001f]+/g, ' ').slice(0, 600);
}

/** @param {string[]} lines @param {number[]} matches @param {number} max */
function sample(lines, matches, max) {
  return matches.slice(0, max).map((i) => ({
    line: i + 1, text: compact(lines[i]), before: compact(lines[Math.max(0, i-1)])
  }));
}

assert(exactPage.test('2014 May 20 15:30 <x> 72.jpg'));
assert(!exactPage.test('2014 May 20 15:30 <x> 70.jpg'));
assert(illustration.test('the moth on the last page'));
assert(success.test('we decrypted it'));
assert(method.test('apply the prime cipher'));
assert.equal(gitHash(Buffer.from('hi')), '32f95c0d1244a78b2be1bab8de17906fabb2c4a8');

(async () => {
  const reports = [];
  for (const [name, length, hash] of files) {
    const url = 'https://raw.githubusercontent.com/neuroretransmit/cicada/'
      + commit + '/irc-logs/' + encodeURIComponent(name);
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const source = Buffer.from(await response.arrayBuffer());
    assert.equal(source.length, length, name + ' bytes');
    assert.equal(gitHash(source), hash, name + ' Git SHA');
    const lines = source.toString('latin1').split(/\r?\n/);
    const direct = [];
    const directMethod = [];
    const directSolved = [];
    const artworkMethod = [];
    const selectedKey = [];
    let periodLines = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!period.test(line)) continue;
      periodLines++;
      const page = exactPage.test(line);
      if (page) {
        direct.push(i);
        if (method.test(line)) directMethod.push(i);
        if (success.test(line)) directSolved.push(i);
      }
      if (illustration.test(line) && method.test(line)
        && /\b(?:liber|primus|book|page|rune|moth|cicada)\b/i.test(line)) {
        artworkMethod.push(i);
      }
      if (intervention.test(line) && authenticKey.test(line)) selectedKey.push(i);
    }
    reports.push({
      name, sourceBytes: length, authenticatedSourceBlob: hash,
      dateBoundPeriodLines: periodLines,
      counts: { exactP55References: direct.length, exactP55MethodLines: directMethod.length,
        explicitP55SuccessClaims: directSolved.length, artworkWithMethodLines: artworkMethod.length,
        fixedHistoricalKeyCrossMentions: selectedKey.length },
      selected: {
        p55AndMethod: sample(lines, directMethod, 35),
        p55Success: sample(lines, directSolved, 30),
        sourceKeyCross: sample(lines, selectedKey, 35),
        artworkWithMethod: sample(lines, artworkMethod, 18),
        directPageMention: sample(lines, direct, 20)
      }
    });
  }
  console.log(JSON.stringify({
    classification: 'Original 2014 eyewitness cue inventory, no assumed authentication or plaintext',
    positiveControls: 'PASS', sources: reports,
    constraint: 'Missing first-party PGP-authenticated instruction remains a decisive prerequisite.'
  }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
