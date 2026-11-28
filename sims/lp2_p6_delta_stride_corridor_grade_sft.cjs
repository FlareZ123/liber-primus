'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),mod=x=>((x%29)+29)%29;
const inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error('inverse');};
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const frozen=JSON.parse(fs.readFileSync(path.join(root,'im-results/lp2-p6-delta-stride-corridor-pretarget.json'),'utf8'));
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8').replace(/\r/g,'');
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(word){const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const out=[];for(let i=0;i<s.length;){if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>s.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;}return out;}
const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0],words=clear.slice(clear.indexOf('Hello.')).split(/[^A-Za-z0-9]+/u).filter(w=>/^[A-Za-z]+$/u.test(w));
const rows=frozen.inputs.receiverSpecs.map((s,i)=>{const p=corpus.pages.find(x=>x.page===s.page);let C=p.indices.slice(s.start,s.start+s.length);if(s.remove!==undefined)C=C.filter((_,j)=>j!==s.remove);const n=C.length,D=frozen.inputs.deltas[i],sigma=frozen.inputs.keySums[i],tri=n*(n-1)/2,base=mod((sigma-D*tri)*inv(n)),key=Array.from({length:n},(_,j)=>mod(base+D*j)),decoded=C.map((x,j)=>mod(x-key[j]));assert.equal(key.reduce((a,b)=>mod(a+b),0),sigma);return {page:s.page,receiver:C,arity:n,delta:D,keySum:sigma,base,key,decodedIndices:decoded,decodedTranslit:decoded.map(x=>corpus.translit[x]).join('')};});
assert.deepEqual(rows,frozen.rows);
const grades=rows.map(r=>{const target=gp(words[r.page]),hits=r.decodedIndices.filter((x,j)=>x===target[j]).length;return {page:r.page,word:words[r.page].toUpperCase(),hits,arity:r.arity,exact:hits===r.arity};});
const totalHits=grades.reduce((a,b)=>a+b.hits,0),total=grades.reduce((a,b)=>a+b.arity,0);
assert.equal(total,57);assert.equal(totalHits,3);assert.equal(grades.filter(x=>x.exact).length,0);assert.equal(grades.find(x=>x.page===30).hits,0);assert.equal(grades.find(x=>x.page===31).hits,0);
console.log(JSON.stringify({status:'PASS',pretargetCommit:'d32486bbac718ae8a5f872eeb2d52495867302f0',grades,totalHits,total,exactWords:[]},null,2));
