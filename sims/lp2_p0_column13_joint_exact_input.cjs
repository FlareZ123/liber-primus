const fs = require('node:fs');
const assert = require('node:assert/strict');
const gp = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const j = JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const ix = new Map(j.runes.map((x,i)=>[x,i]));
const chars = '0123456789ABCDEFGHIJKLMNOPQRS';
/** @param {string} s */
const conv = s=>Array.from(s).filter(x=>ix.has(x)).map(x=>chars[ix.get(x)]).join('');
const orig = gp.pages.filter(x=>x.page<=2).flatMap(x=>x.indices).slice(13).map(x=>chars[x]).join('');
const input = 'ORIGINAL '+orig+'\n'+j.sections.map(sec=>sec.name+' '+conv(sec.source_text)).join('\n')+'\n';
let h=2166136261;
for(let i=0;i<input.length;i++) h=Math.imul(h^input.charCodeAt(i),16777619)>>>0;
assert.equal(input.length,3812);
assert.equal(h,0x3e61f706);
if(process.argv[2]) fs.writeFileSync(process.argv[2],input,'utf8'); else process.stdout.write(input);
