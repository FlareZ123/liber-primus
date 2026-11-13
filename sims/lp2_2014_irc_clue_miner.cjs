'use strict';

/**
 * Source-locked, read-only mining of preserved 2014 Cicada IRC logs.
 *
 * The input Git blob SHA-1 is verified over the original bytes before any
 * decoding. Lines are treated as historical claims, not creator-authenticated
 * messages or commands to execute.
 *
 * node sims/lp2_2014_irc_clue_miner.cjs --selftest
 * node sims/lp2_2014_irc_clue_miner.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const commit = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const files = [
  {name:'#33012014.freenode.log', sha:'a2880b1db31ce523599ef30ca2e55291bf295900', bytes:8629610},
  {name:'#cicadasolvers.freenode.log', sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e', bytes:18487233},
  {name:'#cicadasolvers.freenode.2.log', sha:'72634a9d071d32af767edbffc0493d810e88cd0d', bytes:27234234},
];
const high = /\bliber[ _-]*primus\b|\blp2\b|\bonion[ -]?7\b|\bprimus\b|\bdecrypt(?:ed|ion|ing)?\b|\bplaintext\b|\bkey(?:phrase|word|stream)?\b|\b(?:runes|runic)\b|\b(?:58|59)\.(?:txt|jpg|html)\b/i;
const networkEvidence = /\b(?:UDP|ICMP|TCP|PCAP|NETCAT|SOCKS|WIRESHARK|TCPDUMP|PACKET|PING|SKY|PORT[ :=#]*[0-9]{2,5}|106[.]187[.]103[.]122|128[.]118[.]244[.]163|59[.](?:txt|bin|jpg)|PKLMX|SERVER RESPONSE)\b/i;
const medium = /\b(?:cipher|encrypted|encryption|message|book|puzzle|outguess|prime|hash|vigenere|atbash|breakthrough|riddle)\b/i;
const dateRegex = /^(?:\d{4}[ -](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\[?\d{4}[-/](?:0[1-9]|1[0-2])[-/]\d{2})/i;
const targetYear = /\b2014\b/;
const spring = /\b(?:2014 (?:Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|2014[-/](?:0[4-9]|1[0-2]))\b/i;
const deepContextLines = [
  163741,163775,163785,164118,165223,165696,170858,174444,
  177389,178970,181396,198135,205920,216040,225858,
  164043,164765,167837,172126,176714,177789,178880,
  168999,176233,181351,183362,
];

/** @param {Buffer} data */
function gitBlobSha(data) {
  return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
}

/** @param {string} name @param {Buffer} data */
function mine(name, data) {
  const lines = data.toString('latin1').split(/\r?\n/);
  const report = {file:name, lineCount:lines.length, dateLines:0, aprilPlusDateLines:0, strong:0, medium:0, excerpts:[], networkHits:[]};
  for (let i=0; i<lines.length; i++) {
    const line = lines[i];
    if (!dateRegex.test(line) || !targetYear.test(line)) continue;
    report.dateLines++;
    if (!spring.test(line)) continue;
    report.aprilPlusDateLines++;
    if (/ <[^>]+> /.test(line) && networkEvidence.test(line)) report.networkHits.push({
      line:i+1, text:line.slice(0,1100),
      context:lines.slice(Math.max(0,i-2), Math.min(lines.length,i+3))
        .map((text,j)=>({line:Math.max(1,i-1)+j,text:text.slice(0,1100)})),
    });
    const score = high.test(line) ? 2 : medium.test(line) ? 1 : 0;
    if (!score) continue;
    if (score === 2) report.strong++;
    else report.medium++;
    // The original line number permits independent pinpointed recovery.
    if (report.excerpts.length < 20000) {
      report.excerpts.push({line:i+1,score,text:line.slice(0,700)});
    }
  }
  if (name === '#cicadasolvers.freenode.log') {
    report.contexts = deepContextLines.map(center => ({
      center, lines:lines.slice(Math.max(0,center-17),Math.min(lines.length,center+16))
        .map((text,i)=>({line:Math.max(1,center-16)+i,text:text.slice(0,950)})),
    }));
  }
  // High-signal records take precedence; preserve chronology within score.
  report.excerpts.sort((a,b)=>b.score-a.score||a.line-b.line);
  // Keep all finite 2014 query hits so later semantic review is not first-day biased.
  return report;
}

/** @param {string} destination @param {string} body */
function writeAtomicLocked(destination,body) {
  const lock = destination + '.lock';
  const descriptor = fs.openSync(lock,'wx');
  try {
    const temp = destination + '.' + process.pid + '.tmp';
    fs.writeFileSync(temp,body,{flag:'wx'});
    fs.renameSync(temp,destination);
  } finally {
    fs.closeSync(descriptor);
    fs.unlinkSync(lock);
  }
}

/** @param {string} f */
async function download(f) {
  const url = 'https://raw.githubusercontent.com/neuroretransmit/cicada/' +
    commit + '/irc-logs/' + encodeURIComponent(f);
  const response = await fetch(url);
  assert.equal(response.status,200,'source GET ' + f);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const plant = [
    '2014 May 31 01:12 <a> Liber Primus key from runes',
    '2014 Jan 05 01:12 <b> Key to old puzzle',
    '2014 Jun 03 02:13 <c> interesting cipher hypothesis',
    '2015 Mar 12 01:12 <d> libEr pRimUs',
  ].join('\n');
  const planted = mine('planted',Buffer.from(plant));
  assert.equal(planted.strong,1);
  assert.equal(planted.medium,1);
  assert.equal(planted.aprilPlusDateLines,2);
  assert(networkEvidence.test('2014 May 12 14:51 <a> UDP port 281 packet 106.187.103.122'));
  assert(!networkEvidence.test('2014 May 12 14:51 <a> ordinary cicada discussion'));
  assert(!(/ <[^>]+> /.test('2014 May 12 14:51 * Quits: a (Ping timeout: 240)')));
  console.log('SFT date, keyword, original-order and frozen network-selector controls: PASS');
  if (process.argv.includes('--selftest')) return;
  const reports = [];
  for (const file of files) {
    const b = await download(file.name);
    assert.equal(b.length,file.bytes,file.name + ' byte count');
    assert.equal(gitBlobSha(b),file.sha,file.name + ' immutable Git blob');
    const r=mine(file.name,b);
    reports.push(r);
    console.log('FILE ' + file.name + ' bytes=' + b.length +
      ' lines=' + r.lineCount + ' year2014=' + r.dateLines +
      ' afterApril=' + r.aprilPlusDateLines +
      ' strong=' + r.strong + ' medium=' + r.medium);
    console.log('BEST ' + JSON.stringify(r.excerpts.slice(0,12)));
    if (process.argv.includes('--network')) {
      console.log('NETWORK-MATCHES ' + file.name + ' total=' + r.networkHits.length);
      for (const x of r.networkHits.slice(0,130))
        console.log('NETWORK ' + file.name + ':L' + x.line + ' ' + x.text);
    }
  }
  const out = path.join(process.cwd(),'irc-2014-source-results');
  fs.mkdirSync(out,{recursive:true});
  writeAtomicLocked(path.join(out,'matches.json'),JSON.stringify({sourceRepo:'neuroretransmit/cicada',commit,files,reports},null,2)+'\n');
  let md='# 2014 original IRC keyword witnesses\n\n';
  md+='Archived human conversation, not independently signed 3301 instructions. ';
  md+='Each entry includes its immutable upstream blob, channel, exact source line number, and unedited line text.\n\n';
  for(const r of reports) {
    md+='## '+r.file+'\n\n';
    md+='Original lines: '+r.lineCount+'; May–December 2014 source lines (Apr included): '+r.aprilPlusDateLines+
      '; high-signal hits: '+r.strong+'; medium-signal hits: '+r.medium+'.\n\n';
    for(const x of r.excerpts) md+='- L'+x.line+' [tier '+x.score+'] '+x.text.replace(/\u0000/g,'')+'\n';
    for (const w of r.contexts || []) {
      md+='\n### Original context at L'+w.center+'\n\n';
      for (const e of w.lines) md+='- L'+e.line+' '+e.text.replace(/\u0000/g,'')+'\n';
    }

    md+='\n';
  }
  writeAtomicLocked(path.join(out,'matches.md'),md);
  let networkMd='# 2014 source IRC network and packet leads\n\n';
  networkMd+='These are archived participant statements, not authenticated Cicada instructions. '
    +'The finite filter includes UDP, ICMP, TCP, packet, port, sky, and exact host/file names. '
    +'It is an exploratory historical lead finder, never a decoder.\n\n';
  for(const r of reports) {
    networkMd+='## '+r.file+'\n\nMatches: '+r.networkHits.length+'\n\n';
    for(const x of r.networkHits) {
      networkMd+='### Original L'+x.line+'\n\n';
      for(const q of x.context)
        networkMd+='- L'+q.line+' '+q.text.replace(/\\u0000/g,'')+'\n';
      networkMd+='\n';
    }
  }
  writeAtomicLocked(path.join(out,'network.md'),networkMd);
  console.log('OUTPUT '+out+' source summaries and bounded excerpts written');
}

main().catch(error=>{console.error(error);process.exitCode=1;});
