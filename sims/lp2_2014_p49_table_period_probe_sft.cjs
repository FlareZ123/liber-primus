'use strict';

/**
 * Period-source witness search specifically for original LP2 pp49-51.
 * Reads the original 2014 #cicadasolvers IRC blob, checks exact Git hash,
 * and outputs historical references rather than inferred plaintext.
 * Node 22, CommonJS. Invoke manually in CI.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

/** @param {Buffer} b */
function gitHash(b) {
  return crypto.createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
}
const source = {
  name: '#cicadasolvers.freenode.log',
  bytes: 18487233,
  sha: 'bdd277c14f94c34b5ae714cd00c238065beeed4e'
};
const direct = /\b(?:p(?:age)?\s*[-#:.]?\s*(?:49|50|51|66|67|68)\b|(?:66|67|68)\s*\.jpg|3N\s+3p|base[- ]?60|base[- ]?62|number(?:s|ed)?[- ]?(?:table|grid)|numerical[- ]?(?:table|grid)|256.{0,24}(?:byte|number|char)|(?:byte|number|char).{0,24}256)/i;
const meaning = /\b(?:decipher|decrypt|cipher|plaintext|decoded|solved|meaning|key|vigenere|caesar|translate|rune|base29|base60|bytes|hex|values?|transpos|xor|numerical|ciphertext|numbers)\b/i;

function score(line) {
  let n = 0;
  if (direct.test(line)) n += 5;
  if (meaning.test(line)) n += 3;
  if (/\b(?:key is|it says|we found|i got|these numbers|the table|the grid|the digits)\b/i.test(line)) n += 3;
  return n;
}
async function main() {
  const url = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'
    + encodeURIComponent(source.name);
  const reply = await fetch(url);
  assert.equal(reply.status,200,'source HTTP status');
  const bytes = Buffer.from(await reply.arrayBuffer());
  assert.equal(bytes.length,source.bytes);
  assert.equal(gitHash(bytes),source.sha);
  const lines = bytes.toString('latin1').split(/\r?\n/);
  const hit = [];
  for (let i=0; i<lines.length; i++) {
    const s=lines[i];
    if (!/^2014 (?:May|Jun|Jul|Aug) /.test(s)) continue;
    if(direct.test(s)) hit.push({index:i,score:score(s)});
  }
  hit.sort((a,b)=>b.score-a.score||a.index-b.index);
  console.log('SOURCE',source.name,source.sha,'MATCHES',hit.length);
  for (const v of hit.slice(0,140)) {
    console.log('MATCH',v.index+1,'SCORE',v.score);
    for(let j=Math.max(0,v.index-2);j<=Math.min(v.index+2,lines.length-1);j++) {
      if (/^2014 (?:May|Jun|Jul|Aug) /.test(lines[j]))
        console.log('  L'+(j+1)+' '+lines[j].slice(0,450));
    }
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
