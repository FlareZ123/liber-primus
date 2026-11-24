'use strict';
/** Builds inputs from canonical repository data; runs the companion C++17 solver.
 * Compile the companion with optimization, then provide its executable path as argv[2].
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),runes=c.runes;
const parse=t=>t.split(new RegExp('[^'+runes.join('')+']+','u')).filter(Boolean).map(w=>[...w].map(x=>runes.indexOf(x)));
const words=parse(read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('').replace(/[/\n\r]/g,''));
const orig=words.flat();
assert.equal(orig.length,12956);assert.equal(words.length,2896);
assert.deepEqual(orig,c.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
const tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gp(w){w=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');let a=[];for(let i=0;i<w.length;){const t=w.startsWith('ING',i)?{s:'ING',i:21}:w.startsWith('IO',i)?{s:'IO',i:27}:tok.find(t=>w.startsWith(t.s,i));assert(t,w);a.push(t.i);i+=t.s.length}return a}
const dict=[...new Set(read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/).map(x=>x.match(/^([a-z]+)\s+[1-9]\d*$/i)?.[1]).filter(Boolean).map(gp).filter(w=>w.length===2).map(w=>29*w[0]+w[1]))].sort((a,b)=>a-b);
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const donor=parse(native.sections.find(s=>s.name==='0_koan_1').source_text.replace(/['’]/g,''));
let n=0,plant=[];for(const w of donor){if(n+w.length>450)break;plant.push(w);n+=w.length}
function starts(ws,cut,len){let p=0,out=[];for(const w of ws){let s=p;p+=w.length;if(p<=cut&&w.length===len)out.push(s)}return out}
const singleNative=[...new Set(native.sections.flatMap(s=>parse(s.source_text.replace(/['’]/g,'')).filter(w=>w.length===1).flat()))].sort((a,b)=>a-b);
assert.deepEqual(singleNative,[10,24]);assert.equal(n,448);
const vectors=[orig,starts(words,729,2),starts(words,orig.length,1),dict,plant.flat(),starts(plant,n,2)];
const input=vectors.map(v=>v.length+' '+v.join(' ')).join('\n')+'\n';
if(!process.argv[2])process.stdout.write(input);else{const p=cp.spawnSync(process.argv[2],[],{input,encoding:'utf8',maxBuffer:16*1024*1024});process.stdout.write(p.stdout??'');process.stderr.write(p.stderr??'');assert.equal(p.status,0);}
