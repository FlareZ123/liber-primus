'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),mod=x=>((x%29)+29)%29,half=15;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const frozen=JSON.parse(fs.readFileSync(path.join(root,'im-results/lp2-p6-outerh-sparse-corridor-pretarget.json'),'utf8'));
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8').replace(/\r/g,'');
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(word){const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const out=[];for(let i=0;i<s.length;){if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>s.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;}return out;}
for(const r of frozen.rows){const n=r.arity,key=Array(n).fill(0);key[0]=mod((r.keySum+r.delta)*half);key[n-1]=mod((r.keySum-r.delta)*half);assert.deepEqual(key,r.key);assert.equal(key.reduce((a,b)=>mod(a+b),0),r.keySum);assert.equal(mod(key[0]-key[n-1]),r.delta);}
const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0],words=clear.slice(clear.indexOf('Hello.')).split(/[^A-Za-z0-9]+/u).filter(w=>/^[A-Za-z]+$/u.test(w));
const grades=frozen.rows.map(r=>{const target=gp(words[r.page]),hits=r.decodedIndices.filter((x,j)=>x===target[j]).length;return {page:r.page,word:words[r.page].toUpperCase(),hits,arity:r.arity,exact:hits===r.arity};});
const totalHits=grades.reduce((a,b)=>a+b.hits,0),total=grades.reduce((a,b)=>a+b.arity,0);assert.equal(total,57);assert.equal(totalHits,1);assert.equal(grades.filter(x=>x.exact).length,0);
console.log(JSON.stringify({status:'PASS',pretargetCommit:'402bd6382e2684b81164b1a4bc03e8d06c763cbc',grades,totalHits,total,exactWords:[]},null,2));
