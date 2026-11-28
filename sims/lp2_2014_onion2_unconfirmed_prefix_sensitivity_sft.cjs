'use strict';
// Issue #3269: source-matched perturbation of the nine explicitly unconfirmed
// early 2014 onion2 observation intervals; no hidden seed, shift or rune score.
const assert=require('assert'), fs=require('fs'), path=require('path');
const R=path.resolve(__dirname,'..');
const ledger=JSON.parse(fs.readFileSync(path.join(R,'resources/cicada2014-onion2-timing.json'),'utf8'));
const cells=ledger.interval_cells;
const first=cells.filter(x=>x.pos>=143&&x.pos<=151);
assert.deepStrictEqual(first.map(x=>x.pos),Array.from({length:9},(_,i)=>i+143));
assert(first.every(x=>x.confidence==='single-witness-unconfirmed'));
assert.strictEqual(cells.find(x=>x.pos===152).confidence,'multi-witness');
const k=first.map(x=>x.k_5min);
assert.deepStrictEqual(k,[2,6,2,3,1,1,2,3,1]);
function eventBits(values){return values.map(v=>'0'.repeat(v-1)+'1').join('');}
function asBytes(s){const out=[];for(let i=0;i+8<=s.length;i+=8)out.push(parseInt(s.slice(i,i+8),2));return out;}
const base=eventBits(k), prefix=asBytes(base.slice(0,16));
assert.deepStrictEqual(prefix,[0x41,0x4e]);
let changes=[];
for(let src=0;src<7;src++)for(let dst=0;dst<7;dst++){
 if(src===dst||k[dst]<=1)continue;
 const next=k.slice();next[src]++;next[dst]--;
 assert.strictEqual(next.reduce((a,b)=>a+b,0),k.reduce((a,b)=>a+b,0));
 const b=asBytes(eventBits(next).slice(0,16));
 changes.push({plus_position:143+src,minus_position:143+dst,byte_prefix_hex:b.map(v=>v.toString(16).padStart(2,'0')).join('')});
}
assert.strictEqual(changes.length,30);
assert(changes.every(v=>v.byte_prefix_hex!=='414e'));
const all9=[];
for(let src=0;src<9;src++)for(let dst=0;dst<9;dst++){
 if(src===dst||k[dst]<=1)continue;
 const next=k.slice();next[src]++;next[dst]--;
 all9.push({plus_position:143+src,minus_position:143+dst,
    byte_prefix_hex:asBytes(eventBits(next).slice(0,16)).map(v=>v.toString(16).padStart(2,'0')).join('')});
}
assert.strictEqual(all9.length,48);
const result={
 schema:'onion2-unconfirmed-143-151-invariant-slot-sensitivity-v1',
 evidence:'resources/cicada2014-onion2-timing.json',
 source_frozen_k_first9:k,source_frozen_observed_prefix_hex:'414e',
 source_confidence:first.map(v=>({pos:v.pos,confidence:v.confidence})),
 positive_control:'The published source intervals reproduce ASCII AN exactly under 0^(k-1)1, chronological event-at-end and byte offset 0',
 null:'Transfer one 5-minute k-unit between two different explicitly unconfirmed intervals, preserving all k>=1, total slots, all later observed positions, fixed framing and final 240-bit length; no cue selects any such transfer',
 sensitivity_first7:{n:changes.length,retain_AN:changes.filter(x=>x.byte_prefix_hex==='414e').length,examples:changes.slice(0,12)},
 sensitivity_all9:{n:all9.length,retain_AN:all9.filter(x=>x.byte_prefix_hex==='414e').length,retaining_pairs:all9.filter(x=>x.byte_prefix_hex==='414e')},
 independent_first_multi_witness:152,
 interpretation:'The apparent ASCII AN is not stable under any one-unit two-cell timing perturbation among only the seven unconfirmed intervals that determine the 16-bit prefix. This does not establish which historical interval is correct and does not reject a real other timing payload.'
};
console.log('ONION2_143_151_PREFIX='+JSON.stringify(result));
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(result,null,2));
