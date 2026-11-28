"use strict";
/**
 * Source-only p6 integer-address transfer, with familywise charge.
 *
 * node sims/lp2_p6_qblock_integer_address_transport_sft.cjs
 *
 * The only data consulted are the original LP2 rune corpus and printed
 * segmentation. In particular, no 2016 target words or fitted keys enter.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p), "utf8").replace(/\r/g, "");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts=read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const indices=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod = x => ((x%29)+29)%29;
const h4 = z => [mod(z[0]-z[3]),mod(z[1]-z[2]),mod(z[1]+z[2]),mod(z[0]+z[3])];
const inv4 = z => [mod(15*(z[0]+z[3])),mod(15*(z[1]+z[2])),mod(15*(z[2]-z[1])),mod(15*(z[3]-z[0]))];
const balanced29 = x => {const r=mod(x);return r>14?r-29:r;};

/** Page 50 is the rune-free panel. Index >=51 crosses one text-section gap. */
function pageWords(page) {
  if(page===50)return [];
  const part=parts[page>50?page-1:page],words=[];
  assert.equal(typeof part, "string");
  let vals=[],start=0,offset=0;
  function flush(after) {
    if(vals.length){
      words.push({start,len:vals.length,values:vals.slice(),after});
      vals=[];
    }
  }
  for(const c of part) {
    const v=indices.get(c);
    if(v!==undefined) {
      if(!vals.length)start=offset;
      vals.push(v); offset++;
    } else if(!/[\s/]/u.test(c))flush(c);
  }
  flush("");
  assert.equal(offset,corpus.pages[page].indices.length);
  return words;
}
const pages=Array.from({length:56},(_,i)=>pageWords(i));
function candidates(page,length,residue=null) {
  const words=pages[page]||[],out=[];
  for(let i=0;i<words.length;i++){
    let total=0,values=[];
    for(let j=i;j<words.length;j++){
      total+=words[j].len;
      values.push(...words[j].values);
      if(total>=length){
        if(total===length && (residue===null || mod(words[i].start)===residue))
          out.push({start:words[i].start,after:words[j].after,
                    end:words[j].start+words[j].len-1,
                    nwords:j-i+1,gp0:mod(values.reduce((s,x)=>s+x,0))});
        break;
      }
    }
  }
  return out;
}
function permutations(a) {
  if(a.length===0)return [[]];
  const out=[];
  for(let i=0;i<a.length;i++)
    for(const tail of permutations(a.filter((_,j)=>j!==i)))
      out.push([a[i],...tail]);
  return out;
}
const title=[71,75,76,80].map(start=>pages[6].find(x=>x.start===start));
assert.ok(title.every(Boolean));
const lengths=title.map(x=>x.len),transformed=h4(lengths);
assert.deepEqual(lengths,[4,1,4,2]);
assert.deepEqual(transformed,[2,26,5,6]);
assert.deepEqual(title.map(x=>x.values),[
  [24,16,14,17],[19],[6,27,15,17],[14,12]
]);
const F=0,K=transformed[0],e=mod(-transformed[1]),g=transformed[2],
      a=transformed[3],q=4;
const S1=[g,mod(a*K),mod(q*g),mod(-e)];
const R1=inv4(S1);
assert.deepEqual(R1,[1,16,4,25]);
const L1=[e,q,K,g],L3=[q,a,g,q];
assert.deepEqual(L1,[3,4,2,5]);
assert.deepEqual(L3,[4,6,5,4]);

// Absolute-address transfer decomposes into 29-quotient and remainder
// packets. The integer quotient opcode substitutes the balanced H4 second
// output for the printed singleton length. The rune offset opcode uses the
// standalone large Fehu and terminal printed p6 title rune, with its sign
// reversing on the final lane.
const Q=[lengths[0],balanced29(transformed[1]),lengths[2],lengths[3]];
const u=title[3].values[1];
const R=[F,u,u,-u];
const Delta=Q.map((x,i)=>29*x+R[i]);
assert.deepEqual(Q,[4,-3,4,2]);
assert.deepEqual(R,[0,12,12,-12]);
assert.deepEqual(Delta,[116,-75,128,46]);

const p1=[32,33,34,35],p3=[37,38,39,40];
const pools1=p1.map((page,i)=>candidates(page,L1[i],R1[i]));
const pools3=p3.map((page,i)=>candidates(page,L3[i]));
assert.deepEqual(pools1.map(v=>v.map(x=>x.start)),[[1,30],[132],[4],[25]]);
const matches=[];
for(const x0 of pools1[0])for(const x1 of pools1[1])
for(const x2 of pools1[2])for(const x3 of pools1[3]){
  const X=[x0.start,x1.start,x2.start,x3.start];
  const Y=X.map((x,i)=>x+Delta[i]);
  if(Y.every((y,i)=>pools3[i].some(c=>c.start===y)))matches.push({X,Y});
}
assert.deepEqual(matches,[{X:[30,132,4,25],Y:[146,57,132,71]}]);
const selected=matches[0];
assert.deepEqual(selected.X.map(x=>Math.floor(x/29)),[1,4,0,0]);
assert.deepEqual(selected.Y.map(x=>Math.floor(x/29)),[5,1,4,2]);
assert.deepEqual(selected.X.map(x=>x%29),[1,16,4,25]);
assert.deepEqual(selected.Y.map(x=>x%29),[1,28,16,13]);

// Postdiscovery visual family: permute the p6 printed title lengths and
// replace exactly one position with either sign of any of the balanced
// H4 length outputs. For the rune residual, choose any of eleven printed
// red rune positions as u, both orientations, every permutation of
// [large Fehu, u, u, -u]. Count numeric duplicates just once.
const qVariants=new Map();
const H=transformed.map(balanced29);
for(const arrangement of permutations(lengths))
for(let coordinate=0;coordinate<4;coordinate++)
for(const v of H)
for(const sign of [1,-1]){
  const z=arrangement.slice();z[coordinate]=sign*v;
  qVariants.set(z.join(","),z);
}
const rVariants=new Map();
for(const rune of title.flatMap(x=>x.values))
for(const sign of [1,-1])
for(const sequence of permutations([F,sign*rune,sign*rune,-sign*rune]))
  rVariants.set(sequence.join(","),sequence);
assert.equal(qVariants.size,366);
assert.equal(rVariants.size,216);

// Charge every first-block ambiguous start too. No target source words or
// target GP sums are used to filter the second-block candidates.
const q3Support=pools3.map(v=>new Set(v.map(x=>x.start)));
const charged=[];
for(const x0 of pools1[0]){
  const X=[x0.start,...pools1.slice(1).map(v=>v[0].start)];
  for(const V of qVariants.values())
  for(const Z of rVariants.values()) {
    const Y=X.map((x,i)=>x+29*V[i]+Z[i]);
    if(Y.every((y,i)=>q3Support[i].has(y)))
      charged.push({X,Q:V,R:Z,Y});
  }
}
assert.equal(pools1[0].length*qVariants.size*rVariants.size,158112);
assert.deepEqual(charged,[{
  X:[30,132,4,25],Q:[4,-3,4,2],R:[0,12,12,-12],Y:[146,57,132,71]
}]);

// Shift the whole typed 4+gap+4 arrangement through all 48 admissible
// physical starts. Require every first-block residue/arity and every
// exact predicted second-block printed packet. Original p50 is empty.
const shifted=[];
for(let origin=0;origin<=47;origin++){
  const sourcePools=L1.map((len,i)=>candidates(origin+i,len,R1[i]));
  if(sourcePools.some(v=>v.length===0))continue;
  const destinationPools=L3.map((len,i)=>new Set(
    candidates(origin+5+i,len).map(x=>x.start)
  ));
  for(const x0 of sourcePools[0])for(const x1 of sourcePools[1])
  for(const x2 of sourcePools[2])for(const x3 of sourcePools[3]){
    const X=[x0.start,x1.start,x2.start,x3.start];
    const Y=X.map((x,i)=>x+Delta[i]);
    if(Y.every((y,i)=>destinationPools[i].has(y))) shifted.push({origin,X,Y});
  }
}
assert.deepEqual(shifted,[{
  origin:32,X:[30,132,4,25],Y:[146,57,132,71]
}]);
console.log(JSON.stringify({
  status:"PASS",p6:{lengths,transformed,F,lastTitleRune:u,
    Q,R,Delta,block1Residues:R1,block1Arities:L1,block3Arities:L3},
  sourceOnlyCandidates:{block1:pools1.map(v=>v.map(x=>x.start)),
    block3:pools3.map(v=>v.map(x=>x.start)),selected:matches},
  visualFamily:{quotientPackets:qVariants.size,runePackets:rVariants.size,
    charged:158112,solutions:charged},
  physicalShiftControl:{admissibleStarts:48,hits:shifted},
  inference:"Post-discovery structural compression, not authenticated key or plaintext"
},null,2));
