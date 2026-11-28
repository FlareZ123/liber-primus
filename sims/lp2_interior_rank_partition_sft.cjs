'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const alphabet = '0123456789abcdefghijklmnopqrs';
const encode = p => p.map(x => alphabet[x]).join('');
const c = gp.pages.slice(0,3).flatMap(p=>p.indices);
const lp = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const clear = lp.filter((_,i)=>[3,8,9,10,11,14].includes(i)).flatMap(x=>Array.from(x).filter(c=>gp.runes.includes(c)).map(c=>gp.runes.indexOf(c)));
function fnv(s){let h=0xcbf29ce484222325n;for(const c of s)h=((h^BigInt(c.charCodeAt(0)))*0x100000001b3n)&((1n<<64n)-1n);return h.toString(16);}
assert.equal(c.length,729);assert.equal(clear.length,1001);
assert.equal(fnv(encode(c)),'f838cb4cf83591ed');
assert.equal(fnv(encode(clear)),'660c75947b14b9');
if(process.argv.includes('--input')){console.log(encode(c));console.log(encode(clear));process.exit(0);}
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p;}
const caps=[71,120,157,195,227];
function stats(p,n=729){let h=Array(29).fill(0),count=0,pass=0,passEach=Array(5).fill(0),mins=Array(5).fill(Infinity);for(let i=0;i<p.length;i++){h[p[i]]++;if(i>=n)h[p[i-n]]--;if(i<n-1)continue;count++;let s=0,ok=true;const a=h.slice().sort((x,y)=>y-x);for(let j=0;j<5;j++){s+=a[j];mins[j]=Math.min(mins[j],s);if(s<=caps[j])passEach[j]++;else ok=false}if(ok)pass++;}return{runes:p.length,windows:count,passEach,passAll:pass,mins};}
for(const p of ['resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt'])console.log(p,stats(native(read(p))));
console.log('original clear LP1',stats(clear));
console.log('clear LP1 + LP2 p57',stats(clear.concat(gp.pages[57].indices)));
const start=[4,20,16,23,13,1,10,24,7,15,3,6,27,0,5,11,25,9,2,8,12,14,17,18,19,21,22,26,28];
const deck=start.slice(),k=17,decoded=[];
for(const x of c){const r=deck.indexOf(x);assert(r>=0);decoded.push(r);deck.splice(r,1);deck.splice(k,0,x);}
const hist=Array.from({length:29},(_,i)=>decoded.filter(x=>x===i).length);
assert.equal(hist[9],71);assert.equal(Math.max(...hist),71);
console.log('exact modal witness',{start,k,hist,decoded:encode(decoded)});
