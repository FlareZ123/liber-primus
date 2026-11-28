#!/usr/bin/env node
'use strict';
/* Exact original-source 2016-p57 "shed circumferences" p50 outer76/inner180
 * decoder trial against genuinely known p56 + p57 plaintext.
 * All secret 256-entry byte -> GP29 codebooks, and byte codebook plus
 * arbitrary two-dimensional GF29 cell-coordinate shift a*r+b*c.
 * Eight explicit rectilinear spirals (4 corners x 2 directions), both known-page
 * orders. Fails if any original source is corrupted, no unknown plaintext fitted.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const gp=corpus.translit;
const pages=n=>corpus.pages.find(p=>p.page===n).indices;
const p55=pages(55),cipher56=pages(56),clear57=pages(57);
assert.deepEqual([p55.length,cipher56.length,clear57.length],[76,85,95]);
const literal='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tokens=gp.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
function spell(s){
 const result=[];
 for(const word of s.split(' ')){
  for(let i=0;i<word.length;){
   const z=tokens.find(t=>word.startsWith(t.token,i));
   assert(z,'missing GP spelling '+word.slice(i));
   result.push(z.index);i+=z.token.length;
  }
 }
 return result;
}
const clear56=spell(literal);
assert.equal(clear56.length,85);
let primes=[];
for(let c=2;primes.length<85;c++){
 let yes=true;
 for(let d=2;d*d<=c;d++)if(c%d===0){yes=false;break;}
 if(yes)primes.push(c);
}
const mod=x=>(x%29+29)%29;
let pos=0;
for(let i=0;i<85;i++){
 if(i===56)assert.equal(clear56[i],0); // known, unique F-transparent
 else assert.equal(mod(clear56[i]+primes[pos++]-1),cipher56[i]);
}
assert.equal(pos,84);
const native=[...clear56,...clear57];
assert.equal(native.length,180);
const table=grid.pages.flatMap(p=>p.tokens);
assert.equal(table.length,256);
assert.equal(new Set(table).size,161);
function ring(t,l,b,r){
 const a=[];
 for(let c=l;c<=r;c++)a.push([t,c]);
 for(let row=t+1;row<=b;row++)a.push([row,r]);
 for(let c=r-1;c>=l;c--)a.push([b,c]);
 for(let row=b-1;row>t;row--)a.push([row,l]);
 return a;
}
function spiral(corner,clockwise){
 const a=[];
 for(let k=0;k<4;k++){
  let r=ring(k,k,31-k,7-k);
  if(!clockwise)r=[r[0],...r.slice(1).reverse()];
  const start={TL:[k,k],TR:[k,7-k],BR:[31-k,7-k],BL:[31-k,k]}[corner];
  const i=r.findIndex(p=>p[0]===start[0]&&p[1]===start[1]);
  assert(i>=0);
  a.push(...r.slice(i),...r.slice(0,i));
 }
 assert.equal(a.length,256);
 const uniq=new Set(a.map(p=>p[0]*8+p[1]));
 assert.equal(uniq.size,256);
 return {outer:a.slice(0,76),inner:a.slice(76)};
}
function maxLookup(coordinates,truth,a,b){
 // Entire arbitrary 256-byte codebook is optimized exactly: each original
 // identical printed token can be assigned one, and only one, GP29 output.
 const counts=new Map();
 for(let i=0;i<truth.length;i++){
  const [r,c]=coordinates[i],val=table[r*8+c],v=mod(truth[i]-a*r-b*c);
  if(!counts.has(val))counts.set(val,new Uint16Array(29));
  counts.get(val)[v]++;
 }
 let match=0;
 for(const cnt of counts.values())match+=Math.max(...cnt);
 return {match,distinct:counts.size};
}
const records=[];
for(const corner of ['TL','TR','BR','BL'])
 for(const clockwise of [true,false]){
  const spiralPath=spiral(corner,clockwise);
  assert.equal(spiralPath.outer.length,76);
  assert.equal(spiralPath.inner.length,180);
  for(const order of ['p56_then_p57','p57_then_p56']){
   const truth=order==='p56_then_p57'?native:[...clear57,...clear56];
   let best={match:0,a:0,b:0};
   let origin=maxLookup(spiralPath.inner,truth,0,0);
   for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const v=maxLookup(spiralPath.inner,truth,a,b);
    if(v.match>best.match)best={match:v.match,a,b};
   }
   records.push({corner,clockwise,order,
    unique_inner_table_tokens:origin.distinct,
    arbitrary_lookup_best:origin.match,
    arbitrary_lookup_plus_any_coordinate_affine_best:best.match,
    best_slope_example:[best.a,best.b],
    unavoidable_plaintext_disagreements_with_any_affine:180-best.match,
    outer_tokens_appearing_in_known_inner:new Set(spiralPath.outer
      .map(([r,c])=>table[8*r+c]).filter(x=>spiralPath.inner
       .some(([r,c])=>table[8*r+c]===x))).size,
    outer_positions_with_known_inner_token:spiralPath.outer
      .filter(([r,c])=>spiralPath.inner.some(([r2,c2])=>
       table[8*r2+c2]===table[8*r+c])).length
   });
  }
 }
assert.equal(records.length,16);
assert(records.every(x=>x.unique_inner_table_tokens===127&&
 x.outer_positions_with_known_inner_token===37));
assert.equal(Math.max(...records.map(r=>r.arbitrary_lookup_best)),134);
assert.equal(Math.max(...records.map(r=>r.arbitrary_lookup_plus_any_coordinate_affine_best)),137);
// Synthetic positive control on the *same source token layout*: a genuine
// arbitrary byte-to-rune lookup plus arbitrary affine drift must fit all 180.
const path0=spiral('TL',true);
const codebook=new Map(table.map((id,i)=>[id,((id.charCodeAt(0)*7+id.charCodeAt(1)*13)%29)]));
const planted=path0.inner.map(([r,c])=>mod(codebook.get(table[8*r+c])+7*r+11*c));
assert.equal(maxLookup(path0.inner,planted,7,11).match,180);
assert.equal(maxLookup(path0.outer,path0.outer.map(([r,c])=>
 mod(codebook.get(table[8*r+c])+7*r+11*c)),7,11).match,76);
console.log(JSON.stringify({
 description:'p50 original rectangular spiral known180 -> outer76; all lookup/affine-secret inverse',
 conclusion:'all 16 source-natural spiral+page-order cases falsify exact stationary byte codebook even after arbitrary cell-coordinate GF29 linear drift',
 authentic_p56_regression:'85/85 with real prime2 F-transparent clock',
 source_geometry:{p50:[32,8],outer:76,inner:180,known:[85,95]},
 positive_plant:{inner:180,outer:76,slope:[7,11]},
 records
},null,2));
