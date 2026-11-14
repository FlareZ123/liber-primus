'use strict';
/**
 * Exact original 2015-16 IRC linked artifact inventory for LP2 unknown pages.
 * Node 22 CommonJS; run in the manual-only late-original-IRC workflow.
 * Discovery only: no untrusted artifacts are executed or selected as true keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const SOURCE_BYTES = 27234234;
const SOURCE_SHA = '72634a9d071d32af767edbffc0493d810e88cd0d';
/** @param {Buffer} data @returns {string} */
function blobSha(data) {
  return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
}
/** @param {string} line @param {number} no */
function parse(line, no) {
  const m = /^(201[56]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{2}) (\d{2}:\d{2}) <([^>]+)> (.*)$/.exec(line);
  return m ? {line:no, date:m[1]+' '+m[2]+' '+m[3], time:m[4], nick:m[5], body:m[6]} : null;
}
/** @param {string} s @returns {string[]} */
function urls(s) {
  const found = [];
  for (const m of s.matchAll(/(?:https?:\/\/|www\.)[^\s<>'")\]\[{}]+/ig)) {
    const u = m[0].replace(/[!?.,;:]+$/, '');
    if (!found.includes(u)) found.push(u);
  }
  return found;
}
const page=/\b(?:page|pages|pg|pic|p)\s*#?\s*(?:0?\d|[1-4]\d|5[0-5])\b/i;
const context=/\b(?:liber(?:\s+primus)?|LP2|rune|book|gematria|cipher|decrypt|crack|decode|encoded)\b/i;
const method=/\b(?:key|decrypt|decode|solve|script|source|python|ruby|javascript|algorithm|formula|program|output|plaintext|paste|github|spreadsheet|excel|code|tool)\b/i;
const fileHost=/\b(?:pastebin|gist|dropbox|docs\.google|drive\.google|github\.com|bitbucket|mediafire|mega\.nz|sendspace|filedropper|hastebin|0bin|rghost|textuploader|jsfiddle)\b/i;
const codeFile=/\.(?:txt|zip|rar|7z|py|js|json|csv|xls|xlsx|md|pdf|pl|rb|php|ipynb|html|log)(?:$|[?#])/i;
function selftest() {
  assert.equal(blobSha(Buffer.from('test')), '30d74d258442c7c65512eafab474568dd706c430');
  assert.deepEqual(urls('Here: https://pastebin.com/aB13?raw=1, and http://abc.xyz/m.js.'), ['https://pastebin.com/aB13?raw=1','http://abc.xyz/m.js']);
  assert.equal(parse('2015 Feb 04 12:34 <user> page 22 source', 1).date, '2015 Feb 04');
  console.log('SELFTEST PASS URI parser, historical date fields, Git blob identity');
}
function main() {
  selftest();
  const file = process.argv[2];
  assert(file && fs.existsSync(file),'Expected pinned 2015-16 IRC file argument');
  const raw = fs.readFileSync(file);
  assert.equal(raw.length, SOURCE_BYTES);
  assert.equal(blobSha(raw), SOURCE_SHA);
  const all = raw.toString('latin1').split(/\r?\n/);
  const rows = all.map((x,i)=>parse(x,i+1));
  const original = [];
  for(let i=0;i<rows.length;i++) {
    const r=rows[i]; if(!r) continue;
    for(const u of urls(r.body)){
      const surrounding=rows.slice(Math.max(0,i-12), Math.min(rows.length,i+13))
        .filter(v=>v&&v.date===r.date);
      const near=surrounding.map(v=>v.body).join(' ');
      const local=surrounding.slice(Math.max(0,surrounding.findIndex(v=>v.line===r.line)-5),surrounding.findIndex(v=>v.line===r.line)+6)
        .map(v=>v.body).join(' ');
      if(!context.test(near))continue;
      const score=(page.test(r.body)?20:page.test(local)?13:page.test(near)?7:0)
        +(method.test(r.body)?11:method.test(local)?7:method.test(near)?2:0)
        +(fileHost.test(u)?8:0)+(codeFile.test(u)?5:0)
        +(context.test(r.body)?6:0);
      if(score<14) continue;
      original.push({u,score,date:r.date+' '+r.time,line:r.line,nick:r.nick,body:r.body.slice(0,400),
        neighbors:surrounding.filter(v=>Math.abs(v.line-r.line)<=8)
          .filter(v=>page.test(v.body)||method.test(v.body)||v.line===r.line)
          .slice(0,9).map(v=>({line:v.line,nick:v.nick,body:v.body.slice(0,260)}))});
    }
  }
  original.sort((a,b)=>b.score-a.score||a.line-b.line);
  const selected=[];const unique=new Set();
  for(const x of original) {
    const core=x.u.toLowerCase().replace(/^https?:\/\/(www\.)?/,'').replace(/[?#].*/,'');
    if(unique.has(core))continue;
    unique.add(core);selected.push(x);
  }
  console.log('ORIGINAL EXACT BLOB '+SOURCE_SHA+' bytes='+raw.length+
    ' URLcandidateOccurrences='+original.length+' uniqueCandidateURLs='+selected.length);
  for(let i=0;i<Math.min(80,selected.length);i++){
    console.log('ORIGINAL_LINK '+(i+1)+' '+JSON.stringify(selected[i]));
  }
}
main();