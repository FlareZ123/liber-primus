'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),g=JSON.parse(read('resources/liber-primus/lp2-grid-256.json')),s=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const lex=c.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length),tokens=g.pages.flatMap(p=>p.tokens),a60=g.alphabet,a59=a60.replace('f',''),decode=(t,a)=>a.indexOf(t[0])*a.length+a.indexOf(t[1]),runeIndex=new Map(c.runes.map((r,i)=>[r,i]));
function runeRows(name){const section=s.sections.find(x=>x.name===name);assert.ok(section);const out=[];let cur=[];for(const ch of [...section.source_text]){const v=runeIndex.get(ch);if(v!==undefined)cur.push(v);else if(cur.length&&'•⁘⁜⁚ \n'.includes(ch)){out.push(cur);cur=[];}}if(cur.length)out.push(cur);return out.map((w,i)=>({position:i+1,word:w.map(v=>c.translit[v]).join(''),gp0:w.reduce((a,b)=>a+b,0)}));}
function englishRow(word){const normalized=word.toUpperCase().replace(/V/g,'U').replace(/K/g,'C'),indices=[];for(let i=0;i<normalized.length;){const t=lex.find(x=>normalized.startsWith(x.token,i));assert.ok(t,'unmapped '+normalized.slice(i));indices.push(t.index);i+=t.token.length;}return {word,indices,gp0:indices.reduce((a,b)=>a+b,0),gp1:indices.reduce((a,b)=>a+b+1,0),prime:indices.reduce((a,b)=>a+c.prime[b],0)};}
const p56=runeRows('p56_an_end'),p57=runeRows('p57_parable'),get=(rows,w)=>rows.find(x=>x.word===w);
assert.deepEqual([get(p56,'PILGRIM').gp0,get(p57,'DIUINITY').gp0,get(p57,'EMERGE').gp0],[82,105,83]);
assert.deepEqual([get(p57,'SHED').gp0,get(p56,'DEEP').gp0],[64,72]);
const body=signed.split('-----BEGIN PGP SIGNED MESSAGE-----')[1].split('-----BEGIN PGP SIGNATURE-----')[0].replace(/^\s*Hash:\s*[A-Z0-9]+\s*\n\s*/,'').replace(/\b[0-9A-F]{8}\b/g,'');
const rows=(body.match(/[A-Za-z]+/g)||[]).map(x=>x.toUpperCase()).map(englishRow);assert.equal(rows.length,43);
const word=w=>rows.find(x=>x.word===w),its=word('ITS'),meaning=word('MEANING'),numbers=word('NUMBERS'),direction=word('DIRECTION'),epiphany=word('EPIPHANY'),devoted=word('DEVOTED');
assert.deepEqual([its.gp0,tokens[its.gp0],decode(tokens[its.gp0],a59)],[41,'1O',83]);
assert.deepEqual([meaning.gp0,tokens[meaning.gp0],decode(tokens[meaning.gp0],a59)],[87,'15',64]);
assert.deepEqual([numbers.gp0,tokens[numbers.gp0],decode(tokens[numbers.gp0],a60)],[83,'3D',193]);
assert.deepEqual([direction.gp0,tokens[direction.gp0],decode(tokens[direction.gp0],a60)],[98,'1C',72]);
assert.deepEqual([epiphany.gp0,devoted.gp0],[121,102]);
assert.deepEqual([numbers.gp0,get(p57,'EMERGE').gp0],[83,83]);
assert.deepEqual([decode(tokens[meaning.gp0],a59),get(p57,'SHED').gp0],[64,64]);
assert.deepEqual([decode(tokens[direction.gp0],a60),get(p56,'DEEP').gp0],[72,72]);
const target=new Set([...p56,...p57].map(x=>x.gp0)),hits=rows.filter(x=>target.has(x.gp0)||target.has(decode(tokens[x.gp0],a59))||target.has(decode(tokens[x.gp0],a60)));assert.equal(hits.length,22);
const core=tokens.slice(84,127),sums=rows.map(x=>x.gp0),v59=core.map(x=>decode(x,a59)),v60=core.map(x=>decode(x,a60)),seq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),multi=(a,b)=>[...a].sort((x,y)=>x-y).join(',')===[...b].sort((x,y)=>x-y).join(','),overlap=(a,b)=>a.filter(x=>b.includes(x)).length;
assert.equal(core.length,43);assert.equal(seq(sums,v59)||seq(sums,v60),false);assert.equal(multi(sums,v59)||multi(sums,v60),false);assert.deepEqual([overlap(sums,v59),overlap(sums,v60)],[15,19]);
console.log(JSON.stringify({status:'PASS',signedMessageWords:43,keyTerms:{ITS:its,MEANING:meaning,NUMBERS:numbers,DIRECTION:direction,EPIPHANY:epiphany,DEVOTED:devoted},messageHits:22,coreCells:43,sequenceEqual:[seq(sums,v59),seq(sums,v60)],multisetEqual:[multi(sums,v59),multi(sums,v60)],overlaps:[overlap(sums,v59),overlap(sums,v60)]},null,2));
