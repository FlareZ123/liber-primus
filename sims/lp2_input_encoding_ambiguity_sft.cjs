'use strict';
const assert=require('node:assert/strict');
function run(gp){
 const canonical=gp.runes, alternative=canonical.map((r,i)=>i===11?'ᛂ':r);
 assert.equal(canonical[0],'ᚠ');assert.equal(canonical[11],'ᛄ');
 const tapes=[gp.pages.slice(0,56).flatMap(p=>p.indices),gp.pages.slice(56).flatMap(p=>p.indices)];
 function normalize(a){return a.map(x=>x==='ᛂ'?'ᛄ':x);}
 const original=canonical.map(r=>r.codePointAt(0)), alias=alternative.map(r=>r.codePointAt(0));
 const rank=a=>a.map(x=>a.slice().sort((a,b)=>a-b).indexOf(x));
 function residues(a){const groups={};a.forEach((v,i)=>(groups[v%29]??=[]).push(gp.translit[i]));return {distinct:Object.keys(groups).length,collisions:Object.values(groups).filter(x=>x.length>1)}}
 assert.deepEqual(rank(original),rank(alias));
 const parts=tapes.map(t=>{const left=t.map(i=>canonical[i]),right=t.map(i=>alternative[i]);assert.deepEqual(normalize(right),left);const changed=left.filter((v,i)=>v!==right[i]).length;return {length:t.length,changed,codepointSumDifference:changed*2};});
 return {parts,rank:rank(original),originalResidues:residues(original),aliasResidues:residues(alias),F:rank(original)[0],composites:Object.fromEntries(gp.translit.map((t,i)=>[t,rank(original)[i]]).filter(([t])=>t.length>1))};
}
module.exports=run;
if(require.main===module)console.log(JSON.stringify(run(require('../resources/liber-primus/lp2-corpus.json')),null,2));
