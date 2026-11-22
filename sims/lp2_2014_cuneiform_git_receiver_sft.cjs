'use strict';

/**
 * Director #1499: census original 2014 IRC logs for a creator-era Git receiver
 * tied to the 1033/3301/cuneiform route.
 *
 * Node.js 22 CommonJS. Network is used only to fetch three pinned public log
 * blobs. Their byte counts and Git blob SHA-1 values are asserted before use.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const origins = [
  {name:'#cicadasolvers.freenode.log', bytes:18487233, sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log', bytes:27234234, sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#33012014.freenode.log', bytes:8629610, sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];

const dated2014 = /^2014 [A-Z][a-z]{2} \d\d \d\d:\d\d /;
const directEndpoint = /(?:\bgit:\/\/\S+|https?:\/\/\S*(?:\.git(?:[/?#\s]|$)|\/info\/refs\b|\/objects\/[0-9a-f]{2}\/[0-9a-f]+|\/refs\/(?:heads|tags)\/))/i;
const command = /\bgit\s+(?:clone|fetch|pull|ls-remote|checkout|log|show|cat-file|rev-parse|remote)\b/i;
const hosting = /https?:\/\/(?:www\.)?(?:github\.com|gitlab\.com|bitbucket\.org|gist\.github\.com)\/\S+/i;
const genericGit = /\b(?:git|github|gitlab|bitbucket|gist|repository|repo)\b/i;
const object40 = /(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])/i;
const route = /\b(?:1033|3301|cuneiform|babylon(?:ian)?|sexagesimal|base\s*60|magic\s*square|openpuff|liber\s+primus)\b|(?:q4utgdi2n4m4uim5|ut3qtzbrvs7dtvzp|avowyfgl5lkzfj3n|auowyfgl5lkzfj3n|fv7lyucmeozzd5j4)\.onion/i;

/** @param {Buffer} bytes @returns {string} */
function blobHash(bytes) {
  return crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0', 'ascii')
    .update(bytes).digest('hex');
}

/**
 * @param {string[]} lines
 * @param {number} center
 * @param {number} radius
 * @returns {object[]}
 */
function context(lines, center, radius) {
  const out = [];
  for (let i = Math.max(0, center - radius); i <= Math.min(lines.length - 1, center + radius); i++) {
    if (!dated2014.test(lines[i])) continue;
    out.push({line:i + 1, text:lines[i].slice(0, 650)});
  }
  return out;
}

/** @param {string[]} lines @param {number} center @param {number} radius @returns {boolean} */
function routeNear(lines, center, radius) {
  for (let i = Math.max(0, center - radius); i <= Math.min(lines.length - 1, center + radius); i++) {
    if (dated2014.test(lines[i]) && route.test(lines[i])) return true;
  }
  return false;
}

function selftest() {
  assert(directEndpoint.test('see http://x.onion/foo.git'));
  assert(directEndpoint.test('GET https://x/info/refs?service=git-upload-pack'));
  assert(command.test('git clone http://x/y'));
  assert(hosting.test('https://github.com/example/repo'));
  assert(route.test('Babylonian base60 gives 1033 and 3301'));
  assert(!directEndpoint.test('github is a website'));
  console.log('SELFTEST PASS');
}

async function main() {
  selftest();
  const total = {
    dated2014:0, directEndpoints:0, commands:0, hostingUrls:0,
    genericGitLines:0, routeLines:0, routeNearDirect:0, routeNearCommand:0,
    routeNearHosting:0, routeNearGeneric:0, object40Lines:0, routeNearObject40:0
  };
  const selected = [];

  for (const origin of origins) {
    const url = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'
      + encodeURIComponent(origin.name);
    const response = await fetch(url);
    assert.equal(response.status, 200, 'HTTP ' + origin.name);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, origin.bytes, 'byte count ' + origin.name);
    assert.equal(blobHash(bytes), origin.sha, 'Git blob SHA ' + origin.name);

    const lines = bytes.toString('latin1').split(/\r?\n/);
    const counts = {dated2014:0,directEndpoints:0,commands:0,hostingUrls:0,genericGitLines:0,routeLines:0,object40Lines:0};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!dated2014.test(line)) continue;
      counts.dated2014++;
      total.dated2014++;
      if (route.test(line)) {counts.routeLines++; total.routeLines++;}

      const flags = {
        direct:directEndpoint.test(line),
        command:command.test(line),
        hosting:hosting.test(line),
        generic:genericGit.test(line)
      };
      if (flags.direct) {counts.directEndpoints++; total.directEndpoints++;}
      if (flags.command) {counts.commands++; total.commands++;}
      if (flags.hosting) {counts.hostingUrls++; total.hostingUrls++;}
      const hasObject40 = object40.test(line);
      if (flags.generic) {counts.genericGitLines++; total.genericGitLines++;}
      if (hasObject40) {counts.object40Lines++; total.object40Lines++;}

      if (!(flags.direct || flags.command || flags.hosting || flags.generic || hasObject40)) continue;
      const near = routeNear(lines, i, 120);
      if (near && flags.direct) total.routeNearDirect++;
      if (near && flags.command) total.routeNearCommand++;
      if (near && flags.hosting) total.routeNearHosting++;
      if (near && flags.generic) total.routeNearGeneric++;
      if (near && hasObject40) total.routeNearObject40++;

      if (flags.direct || flags.command || hasObject40) {
        selected.push({
          source:origin.name, line:i + 1, nearRoute:near, flags, hasObject40,
          text:line.slice(0, 900),
          context: near ? context(lines, i, 3) : undefined
        });
      }
    }
    console.log('SOURCE ' + JSON.stringify({name:origin.name,sha:origin.sha,...counts}));
  }

  console.log('TOTAL ' + JSON.stringify(total));
  console.log('FOCUSED_HIT_COUNT ' + selected.length);
  for (const item of selected) console.log('FOCUSED ' + JSON.stringify(item));
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
