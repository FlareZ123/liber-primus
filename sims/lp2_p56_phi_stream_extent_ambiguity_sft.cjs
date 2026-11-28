'use strict';
// Director #3281: auth p56 prime-minus-one cipher is a message-scaled key
// but ciphertext alone does NOT determine the number of consumed key terms.
// All exact inverse paths are enumerated, not heuristically decoded.
const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const lp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const orig=lp.pages.find(x=>x.page===56).indices;
const text=solved.sections.find(x=>x.name==='p56_an_end').source_text;
const index=new Map(solved.runes.map((r,i)=>[r,i]));
const gold=[...text].filter(x=>index.has(x)).map(x=>index.get(x));
assert(orig&&gold&&orig.length===85&&gold.length===85);
const P=[];for(let n=2;P.length<90;n++)if(!P.some(p=>p*p<=n&&n%p===0))P.push(n);
const mod=v=>(v%29+29)%29;
function encrypt(p){
 let j=0,output=[];
 for(const x of p){if(x===0){output.push(0);continue;}const k=mod(P[j++]-1);output.push(mod(x+k));}
 return {output,consumed:j};
}
const actual=encrypt(gold);
assert.deepStrictEqual(actual.output,orig);
assert.strictEqual(actual.consumed,84);
const obsF=orig.map((x,i)=>x===0?i:-1).filter(i=>i>=0),plainF=gold.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
assert.deepStrictEqual(obsF,[35,47,51,56,74]);
assert.deepStrictEqual(plainF,[56]);
let active=[{j:0,plain:[],holds:[]}];
for(let i=0;i<orig.length;i++){
 const next=[];
 for(const state of active){
  const shifted=mod(orig[i]-(P[state.j]-1));
  if(orig[i]===0)next.push({j:state.j,plain:state.plain.concat(0),holds:state.holds.concat(i)});
  if(shifted!==0)next.push({j:state.j+1,plain:state.plain.concat(shifted),holds:state.holds});
 }
 active=next;
 assert(active.length<=32,'cipher F branching exceeded fixed bound');
}
assert.strictEqual(active.length,22);
const summary={};
for(const state of active){
 assert.deepStrictEqual(encrypt(state.plain).output,orig);
 summary[state.j]=(summary[state.j]||0)+1;
}
assert.deepStrictEqual(summary,{'81':4,'82':8,'83':6,'84':3,'85':1});
const truePath=active.find(x=>x.plain.every((v,i)=>v===gold[i]));
assert(truePath&&truePath.j===84&&JSON.stringify(truePath.holds)==='[56]');
const altSameKeyTerms=active.find(x=>x.j===84&&JSON.stringify(x.holds)!=='[56]');
assert(altSameKeyTerms);
const altNotSame=altSameKeyTerms.plain.map((x,i)=>x===gold[i]?null:i).filter(x=>x!==null);
const result={schema:'p56-exact-message-scaled-prime-clock-ambiguity-v1',
 source:'resources/liber-primus/lp2-corpus.json, resources/external/relikd-solved-gp29-native-v1.json',
 premise:'known additive GP29 phi(p_n)=p_n-1 stream; plaintext F is a bypass and does not advance, encrypted non-F can equal cipher F',
 original_length:orig.length,original_cipher_F_positions:obsF,
 exact_known_plaintext_F_positions:plainF,exact_known_key_terms:actual.consumed,
 exact_reversible_inverses:active.length,possible_consumed_key_terms:summary,
 same_consumption_multiple_plaintexts:summary[84],known_true_hold:truePath.holds,
 alternative_same_count:{holds:altSameKeyTerms.holds,differing_rune_positions:altNotSame.slice(0,15),differing_count:altNotSame.length},
 invariant:'Each of 22 distinct GP strings reencrypts exactly to the same original 85-symbol p56 ciphertext under the identical public prime schedule and F rule. The message-dependent key extent is not fixed by visible ciphertext alone.',
 constraint:'If the source provides independent plaintext-F positions, extent becomes exactly 84; otherwise no source-visible discriminator among 81..85 is known. This is not a negative for language-selected decipherment and not an LP2 unknown-page decryption.'
};
console.log('P56_PHI_KEY_EXTENT='+JSON.stringify(result));
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(result,null,2));
