'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function evaluate(c,h,form,signed){
 const title=+h.match(/<title>(\d+)<\/title>/)[1],id=+h.match(/id="(\d+)"/)[1],files=[...h.matchAll(/src="(\d+)\.jpg"/g)].map(m=>+m[1]);
 const squareFields=[...form.matchAll(/Order (\d+) Square, (\d+)[\s\S]*?name="(\d+)"/g)].map(m=>({order:+m[1],sum:+m[2],name:+m[3]}));
 const author=+signed.match(/^\s*(3301)\s*$/m)[1],core=[title,id,17*60+13,55*60+1],controls=[...squareFields.flatMap(x=>[x.order,x.sum,x.name]),author],rows=[];
 for(const radix of [60,100,10])for(const pageOrigin of [0,1])for(const runeOrigin of [0,1])for(const reverse of [false,true]){
  const extract=n=>{const p=Math.floor(n/radix)-pageOrigin,k=n%radix-runeOrigin,a=c.pages[p]?.indices;return a&&k>=0&&k<a.length?c.translit[a[reverse?a.length-1-k:k]]:null};
  rows.push({radix,pageOrigin,runeOrigin,reverse,core:core.map(extract),files:files.map(extract),controls:controls.map(extract)});
 }
 return {core,files,squareFields,author,controls,rows};
}
const out=evaluate(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/historical/stage11-2014-index.html'),read('resources/historical/cicada2014-stage10-original-form.html'),read('resources/historical/cicada2014-stage11-message.asc'));
assert.deepEqual(out.rows[0].core,['R','F','C','AE']);
assert.equal(out.rows.length,24);
assert.deepEqual(out.files,Array.from({length:58},(_,i)=>i));
assert.equal(out.squareFields.length,3);
console.log(JSON.stringify(out,null,2));
