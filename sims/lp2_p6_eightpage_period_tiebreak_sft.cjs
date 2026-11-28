"use strict";
/**
 * Original-corpus, target-rune-blind eight-page p6 receiver gate.
 * Reads only manuscript transcription / rune indices, not signed-source
 * target rune values or fitted key vectors.
 *
 * node sims/lp2_p6_eightpage_period_tiebreak_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root,file), "utf8").replace(/\r/g,"");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const segments = read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const symbolToIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const mod = x => ((x%29)+29)%29;
const h4 = a => [mod(a[0]-a[3]),mod(a[1]-a[2]),mod(a[1]+a[2]),mod(a[0]+a[3])];
const inv4 = a => [mod(15*(a[0]+a[3])),mod(15*(a[1]+a[2])),mod(15*(a[2]-a[1])),mod(15*(a[3]-a[0]))];
const physical = page => page===50 ? null : segments[page>=51?page-1:page];
function words(page) {
  const input = physical(page);
  if(input==null)return [];
  const output=[];
  let values=[],offset=0,start=0;
  function flush(punctuation) {
    if(values.length){
      output.push({start,ordinal:output.length,values:values.slice(),
                   len:values.length,after:punctuation});
      values=[];
    }
  }
  for(const char of input){
    const rune = symbolToIndex.get(char);
    if(rune!==undefined) {
      if(!values.length)start=offset;
      values.push(rune);offset++;
    } else if(!/[\s/]/u.test(char)) {
      flush(char);
    }
  }
  flush("");
  assert.equal(offset, corpus.pages[page].indices.length);
  return output;
}
const wordMap = new Map(Array.from({length:56},(_,i)=>[i,words(i)]));
function candidatePool(page,length,residue) {
  const ww=wordMap.get(page)||[],result=[];
  for(let i=0;i<ww.length;i++){
    let sum=0,values=[];
    for(let j=i;j<ww.length;j++) {
      sum+=ww[j].len;
      values.push(...ww[j].values);
      if(sum>=length) {
        if(sum===length && mod(ww[i].start)===residue) {
          result.push({start:ww[i].start,end:ww[j].start+ww[j].len-1,
                       nwords:j-i+1,firstOrdinal:ww[i].ordinal,
                       after:ww[j].after,len:values.length,
                       gp0:mod(values.reduce((a,b)=>a+b,0))});
        }
        break;
      }
    }
  }
  return result;
}
// A full stop is a tie-break only, not a mandatory condition.
function choose(pool) {
  if(pool.length===1)return pool[0];
  if(pool.length<2)return null;
  const periods=pool.filter(x=>x.after==".");
  return periods.length===1 ? periods[0] : null;
}
const p6Words=wordMap.get(6);
const W=[71,75,76,80].map(s=>p6Words.find(w=>w.start===s));
assert.ok(W.every(Boolean));
assert.deepEqual(W.map(w=>w.len),[4,1,4,2]);
const [K,negE,g,a]=h4(W.map(w=>w.len));
const e=mod(-negE),q=4,b=mod(-W[0].values[2]),F=0;
assert.deepEqual({K,e,g,a,q,b,F},{K:2,e:3,g:5,a:6,q:4,b:15,F:0});
const shell1=[g,mod(a*K),mod(q*g),mod(-e)];
const edge=[W[3].values[1],F,W[0].values[0],W[0].values[3]];
const shell3=shell1.map((x,i)=>mod(x+edge[i]));
const residues=[...inv4(shell1),...inv4(shell3)];
const arities=[e,q,K,g,q,a,g,q];
assert.deepEqual(shell1,[5,12,20,26]);
assert.deepEqual(edge,[12,0,24,17]);
assert.deepEqual(shell3,[17,12,15,14]);
assert.deepEqual(residues,[1,16,4,25,1,28,16,13]);
assert.deepEqual(arities,[3,4,2,5,4,6,5,4]);
const positions=[0,1,2,3,5,6,7,8], pages=positions.map(d=>d+32);
const pools=pages.map((page,i)=>candidatePool(page,arities[i],residues[i]));
const chosen=pools.map(choose);
assert.ok(chosen.every(Boolean));
assert.deepEqual(chosen.map(x=>x.start),[30,132,4,25,146,57,132,71]);
assert.deepEqual(pools.map(x=>x.map(y=>[y.start,y.after])),[
  [[1,"-"],[30,"."]],[[132,"-"]],[[4,"-"]],[[25,"-"]],
  [[146,"-"]],[[57,"-"]],[[132,"-"]],
  [[13,"-"],[71,"."],[216,"-"]]
]);
// Leave the source-derived residues/lengths immutable, but try every
// shifted physical eight-page window of the same shape (including p50 gap).
const shiftResults=[];
for(let origin=0;origin<=47;origin++){
  const selected=positions.map((d,i)=>choose(candidatePool(origin+d,arities[i],residues[i])));
  shiftResults.push({origin,decided:selected.filter(Boolean).length,
                     starts:selected.map(c=>c?c.start:null)});
}
assert.deepEqual(shiftResults.filter(x=>x.decided===8),[
  {origin:32,decided:8,starts:[30,132,4,25,146,57,132,71]}
]);
const shiftHistogram=Array.from({length:9},(_,i)=>shiftResults.filter(x=>x.decided===i).length);
assert.deepEqual(shiftHistogram,[6,11,13,10,6,0,1,0,1]);
// A separate freedom charge: the edge-vector is a *retrospective* choice.
// Count all 192 distinct title-edge sign/order variants supporting
// deterministic q-block receiver selection under the same period rule.
function permutations(a){
  if(a.length===1)return[a];
  const out=[];
  for(let i=0;i<a.length;i++)for(const tail of permutations(a.filter((_,j)=>j!==i)))
    out.push([a[i],...tail]);
  return out;
}
const transitions=new Map();
for(const qw of [W[0].values,W[2].values])
for(const direction of [0,1])
for(const end of W[3].values)
for(const order of permutations([0,1,2,3]))
for(const sign of [1,-1]) {
  const endpoints=direction?[qw.at(-1),qw[0]]:[qw[0],qw.at(-1)];
  const base=[end,F,...endpoints],packet=order.map(i=>mod(sign*base[i]));
  transitions.set(packet.join(","),packet);
}
assert.equal(transitions.size,192);
const viable=[];
for(const packet of transitions.values()){
  const residue3=inv4(shell1.map((x,i)=>mod(x+packet[i])));
  const candidateLists=pages.slice(4).map((p,i)=>candidatePool(p,arities[i+4],residue3[i]));
  const picks=candidateLists.map(choose);
  if(picks.every(Boolean))
    viable.push({packet,residue3,starts:picks.map(x=>x.start),
      wordCounts:picks.map(x=>x.nwords)});
}
assert.equal(viable.length,5);
assert.ok(viable.some(v=>v.packet.join(",")===edge.join(",") &&
                           v.starts.join(",")==="146,57,132,71"));
console.log(JSON.stringify({
  status:"PASS",titleLengths:W.map(x=>x.len),shell1,edge,shell3,
  arities,residues,pages,
  candidates:pools.map((v,i)=>({page:pages[i],pool:v.map(x=>({
    start:x.start,end:x.end,nwords:x.nwords,after:x.after,gp0:x.gp0
  })),selected:chosen[i].start})),
  shiftControls:{n:shiftResults.length,histogram:shiftHistogram,
                 perfectOrigins:shiftResults.filter(x=>x.decided===8)},
  transitionFamily:{distinct:transitions.size,fullyDeterminate:viable},
  caveat:"No key or unknown plaintext recovered. Both shells and period policy were recognized after corridor targets were public."
},null,2));
