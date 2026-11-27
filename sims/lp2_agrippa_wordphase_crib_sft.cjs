'use strict';
/** Exact Agrippa quote recovery: pass pinned trizen book-code.py as argv[2].
 * node sims/lp2_agrippa_wordphase_crib_sft.cjs <book-code.py>
 * Does not store the copyrighted donor text.
 */
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const L=require('./lp2_multiword_phase_affine_crib.cjs');
const B=require('./lp2_q8_historical_wordphase_crib_sft.cjs');
const C=require('./lp2_multiword_phase_historical_crib_sft.cjs');
const source=fs.readFileSync(process.argv[2]);
assert.equal(crypto.createHash('sha1').update('blob '+source.length+'\0').update(source).digest('hex'),'a4e13bdcbfa64be9c087e092b51f028126f51cb3');
const A=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const raw=source.toString('utf8').split('book = """')[1].split('"""')[0];
const words=B.normalize(raw,A);
assert.equal(words.length,1682);assert.equal(words.join('').length,7083);
let offset=0;
const scopes=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>{
 const c=A.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).map(x=>L.S[x]).join('');
 const s=B.scopeIndex('p'+a+'-'+b,c,offset);offset+=c.length;return s;
});
assert.equal(offset,12956);
const results=[];
for(const q of [8,13]){
 const n=q===8?96:128,ss=C.candidates(words,n,q,false);
 const eligible=ss.filter(s=>s.to+16<=words.length),s=eligible[3301%eligible.length];
 const control=L.trial(s.p,q,3301+q,words.slice(s.to,s.to+16));
 assert.ok(control.complete&&control.truthRetained&&control.actions.length===1&&control.heldTruth===16);
 const out=scopes.map(scope=>C.scan(scope,ss,q));
 results.push({q,n,spans:ss.length,control:{complete:control.complete,truthRetained:control.truthRetained,heldTruth:control.heldTruth,heldTotal:control.heldTotal,actions:control.actions.length},out});
}
console.log(JSON.stringify({words:words.length,runes:words.join('').length,results},null,2));
