'use strict';

/**
 * Search the original January/February 2014 participant IRC witness for an
 * actual OutGuess 0.4 non-default embedding seed or a typed LP1-04 payload.
 * Search is intentionally narrow: the exact new seed bound needs an
 * original -i/-s instruction, file header or actual 04.jpg consumer.
 * Run: node sims/lp1_04_outguess_2014_override_witness_sft.cjs
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const source = {
  path: '#cicadasolvers.freenode.log',
  url: 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log',
  size: 18487233,
  gitBlob: 'bdd277c14f94c34b5ae714cd00c238065beeed4e',
};

/** @param {Buffer} b */
function sha1blob(b) {
  return createHash('sha1').update('blob ' + b.length + '\0', 'ascii').update(b).digest('hex');
}

(async function main() {
  const response = await fetch(source.url, {headers:{'User-Agent':'LP1-04-OutGuess-IRC-Override-Gate'}});
  assert.equal(response.status, 200);
  const b = Buffer.from(await response.arrayBuffer());
  assert.equal(b.length, source.size);
  assert.equal(sha1blob(b), source.gitBlob);
  const lines = b.toString('latin1').split(/\r?\n/);
  const focus = [], allOutguess = [], originalP04 = [], atypical = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^2014 (Jan|Feb) \d\d /.test(line)) continue;
    if (/outguess/i.test(line)) allOutguess.push({line:i+1,text:line.slice(0,450)});
    if (/(?:outguess.{0,70}(?:-i\s*\d+|-s\s*\d+|seed|38370|04\.jpg|7524)|(?:-i\s*\d+|-s\s*\d+|seed|38370|7524|04\.jpg).{0,70}outguess)/i.test(line)) {
      focus.push({line:i+1,text:line.slice(0,550)});
    }
    if (/(?:38.?370|7.?524|04\.jpg\.bin|04\.jpg.*(?:decrypt|decode|payload|secret|outguess))/i.test(line))
      originalP04.push({line:i+1,text:line.slice(0,420)});
    if (/(?:outguess\s+(?:-[a-zA-Z]+\s+){0,6}-[isIS]|steg.{0,20}seed| -i \d{3,5}\b)/i.test(line))
      atypical.push({line:i+1,text:line.slice(0,500)});
  }
  const limited = a => a.length <= 70 ? a : a.slice(0,35).concat(a.slice(-35));
  process.stdout.write(JSON.stringify({
    sourceGitBlob:source.gitBlob,
    period:'2014 Jan-Feb',
    originalLines:lines.length,
    totalOutguessMentions:allOutguess.length,
    outguessSamples:limited(allOutguess),
    original04LikelyMentions:originalP04,
    actualSeedOverrideRelevant:focus,
    unusualEmbeddingCommandMatches:atypical,
    sourceContexts:[21433,32904,45633,55111,57161,59749,85873,85895,92620].map(site => ({
      site,
      lines:lines.slice(site-7,site+8).map((t,j)=>({line:site-6+j,text:t.slice(0,550)})),
    })),
    conclusionRule:'Only original positive command or typed content is evidence of non-default embedding. Absence in participant IRC cannot prove an author did not use -i.',
  },null,2)+'\n');
})().catch(err=>{process.stderr.write(err.stack+'\n');process.exitCode=1;});
