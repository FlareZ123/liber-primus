'use strict';
// eSTREAM Salsa20/20 standard-source table equality fingerprint (Agent20).
// No original-LP2 plaintext decryption or unconstrained source fitting.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const source = grid.pages.flatMap(p => p.bytes);
const vectors = [128,256].map(bits=>JSON.parse(fs.readFileSync(path.join(root,'resources/external/salsa20-estream-vectors-'+bits+'.json'),'utf8')));
assert.equal(source.length,256);
function signature(a) { const m=new Map();return a.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)}) }
function pairs(a) { const m=new Map(),s=new Set();a.forEach((x,i)=>{let v=m.get(x);if(!v){v=[];m.set(x,v)}for(let j of v)s.add(j*256+i);v.push(i)});return s }
function equal(a,b) {return a.length===b.length&&a.every((x,i)=>x===b[i])}
const inputSig=signature(source), inputPairs=pairs(source);
assert.equal(new Set(source).size,161);assert.equal(inputPairs.size,127);assert.equal(source[7],source[14]);
const reflected=Array.from({length:32},(_,i)=>source.slice(8*i,8*i+8).reverse()).flat();
const origins=[{label:'row-major',input:source},{label:'horizontal reflection',input:reflected}];
const read32=(buf,i)=>buf.readUInt32LE(i),rot=(a,n)=>((a<<n)|(a>>>(32-n)))>>>0;
function initial(key,iv){
 const c=Buffer.from(key.length===32?'expand 32-byte k':'expand 16-byte k');
 const t=key.length===32?16:0;
 assert.ok(key.length===16||key.length===32);assert.equal(iv.length,8);
 return [read32(c,0),read32(key,0),read32(key,4),read32(key,8),read32(key,12),read32(c,4),read32(iv,0),read32(iv,4),0,0,read32(c,8),read32(key,t),read32(key,t+4),read32(key,t+8),read32(key,t+12),read32(c,12)]
}
function block(initialState,counter) {
 const s=initialState.slice();s[8]=counter>>>0;s[9]=Math.floor(counter/2**32)>>>0;
 const x=s.slice();
 for(let j=0;j<10;j++){
 x[4]^=rot((x[0]+x[12])>>>0,7);x[8]^=rot((x[4]+x[0])>>>0,9);x[12]^=rot((x[8]+x[4])>>>0,13);x[0]^=rot((x[12]+x[8])>>>0,18);
 x[9]^=rot((x[5]+x[1])>>>0,7);x[13]^=rot((x[9]+x[5])>>>0,9);x[1]^=rot((x[13]+x[9])>>>0,13);x[5]^=rot((x[1]+x[13])>>>0,18);
 x[14]^=rot((x[10]+x[6])>>>0,7);x[2]^=rot((x[14]+x[10])>>>0,9);x[6]^=rot((x[2]+x[14])>>>0,13);x[10]^=rot((x[6]+x[2])>>>0,18);
 x[3]^=rot((x[15]+x[11])>>>0,7);x[7]^=rot((x[3]+x[15])>>>0,9);x[11]^=rot((x[7]+x[3])>>>0,13);x[15]^=rot((x[11]+x[7])>>>0,18);
 x[1]^=rot((x[0]+x[3])>>>0,7);x[2]^=rot((x[1]+x[0])>>>0,9);x[3]^=rot((x[2]+x[1])>>>0,13);x[0]^=rot((x[3]+x[2])>>>0,18);
 x[6]^=rot((x[5]+x[4])>>>0,7);x[7]^=rot((x[6]+x[5])>>>0,9);x[4]^=rot((x[7]+x[6])>>>0,13);x[5]^=rot((x[4]+x[7])>>>0,18);
 x[11]^=rot((x[10]+x[9])>>>0,7);x[8]^=rot((x[11]+x[10])>>>0,9);x[9]^=rot((x[8]+x[11])>>>0,13);x[10]^=rot((x[9]+x[8])>>>0,18);
 x[12]^=rot((x[15]+x[14])>>>0,7);x[13]^=rot((x[12]+x[15])>>>0,9);x[14]^=rot((x[13]+x[12])>>>0,13);x[15]^=rot((x[14]+x[13])>>>0,18);
 }
 const out=Buffer.alloc(64);for(let i=0;i<16;i++)out.writeUInt32LE((x[i]+s[i])>>>0,i*4);
 return out;
}
function intersect(a,b){let c=0;for(const x of a)if(b.has(x))c++;return c}
const results=[];let testedBlocks=0,plants=0;
for(let q=0;q<2;q++){
 assert.equal(vectors[q].length,q?103:89);
 for(let ent of vectors[q])for(let [name,v] of Object.entries(ent)){
   const key=Buffer.from(v.key1+(v.key2||''),'hex'),iv=Buffer.from(v.iv,'hex'),state=initial(key,iv);
   for(let k=1;k<=4;k++){
     const idx=v['stream'+k+'index'];assert.equal(idx%64,0);
     assert.equal(block(state,idx/64).toString('hex').toUpperCase(),v['stream'+k+'expected']);
     testedBlocks++;
   }
   const candidate=Buffer.concat([0,1,2,3].map(i=>block(state,i))),candSig=signature([...candidate]),candPair=pairs([...candidate]);
   // A bijective relabeling of every byte must preserve the entire 256-position fingerprint.
   const mapped=[...candidate].map(x=>(73*x+41)&255);
   assert.ok(equal(candSig,signature(mapped)));plants++;
   for(let o of origins)results.push({bits:q?256:128,name,order:o.label,
     exact:equal(candSig,signature(o.input)),
     pairOverlap:intersect(candPair,pairs(o.input)),
     candidatePairs:candPair.size});
 }
}
assert.equal(testedBlocks,768);assert.equal(plants,192);assert.equal(results.length,384);
assert.equal(results.filter(x=>x.exact).length,0);
const output=origins.map(o=>{const a=results.filter(x=>x.order===o.label),m=Math.max(...a.map(x=>x.pairOverlap));return {order:o.label,candidates:a.length,exact:a.filter(x=>x.exact).length,maxPairOverlap:m,best:a.filter(x=>x.pairOverlap===m).map(x=>x.bits+' '+x.name).slice(0,8)}});
console.log(JSON.stringify({originalDistinct:161,originalEqualPairs:127,publishedVectors:192,officialBlocksVerified:testedBlocks,byteBijectionPositiveControls:plants,comparisons:384,summary:output},null,2));