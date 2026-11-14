'use strict';
/** Source-exact punctuation-span crib gate, Node.js 22 CommonJS, read-only. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const parts=load('resources/liber-primus/lp2-transcription.txt').split(/\r?\n%\r?\n/);
assert.equal(parts.length,57);const rune=new Set(corpus.runes);
/** @param {string} s */function runes(s){let v=[],n=0;for(const c of s){if(rune.has(c))n++;else if(c==='.'&&n){v.push(n);n=0;}}assert.equal(n,0);return v;}
const groups=['ING','IO','TH','NG','EO','OE','AE','IA','EA'];
/** @param {string} s */function gp(s){const t=s.toUpperCase().replace(/[^A-Z]/g,'').replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');let n=0;for(let i=0;i<t.length;n++){const g=groups.find(x=>t.startsWith(x,i));i+=g?g.length:1;}return n;}
/** @param {string} s @param {'latin'|'gp'} mode */
function sentences(s,mode){return s.split(/[.!?]/).map(x=>mode==='gp'?gp(x):(x.match(/[A-Za-z]/g)||[]).length).filter(Boolean);}
/** @param {number[]} a @param {number[]} b */
function longest(a,b){const map=new Map();for(let j=0;j+2<b.length;j++){const k=b.slice(j,j+3).join(',');if(!map.has(k))map.set(k,[]);map.get(k).push(j);}let max=0, hits=[];for(let i=0;i+2<a.length;i++){const key=a.slice(i,i+3).join(',');for(const j of map.get(key)||[]){let n=3;while(i+n<a.length&&j+n<b.length&&a[i+n]===b[j+n])n++;if(n>max){max=n;hits=[];}if(n===max)hits.push({i,j,values:a.slice(i,i+n)});}}return{max:max||2,hits:hits.slice(0,3)};}
const orig=runes(parts.slice(0,-2).join('\n'));assert.equal(orig.length,175);
assert.equal(orig.reduce((a,b)=>a+b,0),12956);
assert.deepEqual(orig.slice(0,5),[13,141,121,22,53]);
const solved=runes(parts.at(-1));assert.deepEqual(solved,[7,30,30,28]);
const plant=orig.slice();plant.splice(75,4,...solved);
assert.ok(longest(plant,solved).hits.some(x=>x.i===75&&x.j===0&&x.values.length===4));
const sources=[
'resources/control/shakespeare_first300k.txt',
'resources/control/emerson_essays_2944.txt',
'resources/control/gibran_prophet_58585.txt',
'resources/external/blake-marriage-1906-gutenberg45315.txt',
'resources/external/2013-book-of-law-I.txt',
'resources/external/2013-book-of-law-II.txt',
'resources/external/2013-book-of-law-III.txt',
'resources/external/2013-liber-al-bookcode-I.txt',
'resources/external/2013-liber-al-bookcode-II.txt',
'resources/external/2013-liber-al-bookcode-III.txt'];
const result=[];for(const source of sources){const t=load(source);for(const mode of ['latin','gp']){const ref=sentences(t,mode);const match=longest(orig,ref);assert.ok(match.max<=3);result.push({source,mode,sourceStops:ref.length,...match});}}
const trip=result.filter(x=>x.max===3);assert.equal(trip.length,1);
assert.equal(trip[0].source,'resources/control/shakespeare_first300k.txt');
assert.equal(trip[0].mode,'gp');assert.deepEqual(trip[0].hits[0],{i:104,j:3142,values:[61,41,71]});
const lp1=longest(orig,runes(load('resources/transcriptions/lp1_wulfic_canonical.txt')));assert.equal(lp1.max,2);
console.log(JSON.stringify({unknownStops:175,unknownRunes:12956,solvedP57:solved,plant:'four-span authentic positive recovered',sources:result,solvedLP1:lp1,verdict:'no four-span literal quotation'},null,2));
