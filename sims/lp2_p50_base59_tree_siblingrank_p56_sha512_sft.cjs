'use strict';
/**
 * Original p50 numeral tree -> packed 2-bit ordinal tape -> p56 digest gate.
 *
 * Source: p49-51 32x8=256 original two-character cells, lowercase f absent,
 * hence one ordered candidate radix59 yielding one in-tree rooted at189.
 * A 4-ary tree admits a 2-bit child ordinal at each printed address: all
 * 256 positions fill exactly 512 bits. Fixed reading is printed row-major,
 * ascending siblings at each parent, root's unused ordinal zero, big-endian
 * packing four original cells to each output byte. The solved p56 carries
 * an independently printed 128-hex hash; compare both literal 64-byte
 * packed tape and SHA-512(tape) to those exact source bytes.
 *
 * No secret, tunable offset, ciphertext fitting, or corpus-dependent score.
 * Read-only, Windows Node.js 22 CommonJS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..');
const raw=JSON.parse(fs.readFileSync(path.join(repo,
 'resources/liber-primus/base60-grid.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(repo,
 'resources/liber-primus/lp2-corpus.json'),'utf8'));
const tokens=raw.rows.flat();
const digits='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
assert.equal(tokens.length,256);
assert.equal(digits.length,59);
const parent=tokens.map(t=>{
 assert.equal(t.length,2);
 const hi=digits.indexOf(t[0]),lo=digits.indexOf(t[1]);
 assert(hi>=0 && lo>=0);
 const v=hi*59+lo;
 assert(v>=0&&v<256);
 return v;
});
const children=Array.from({length:256},()=>[]);
const root=189;
assert.deepEqual(parent.flatMap((p,i)=>p===i?[i]:[]),[root]);
for(let i=0;i<256;i++){
 let j=i,n=0;
 while(j!==root && n++<256) j=parent[j];
 assert.equal(j,root);
 if(i!==root) children[parent[i]].push(i);
}
for(const x of children)assert(x.length<=4);
const rank=parent.map((p,i)=>i===root?0:children[p].indexOf(i));
assert(rank.every(r=>Number.isInteger(r)&&r>=0&&r<4));
const bits=Buffer.alloc(64);
for(let i=0;i<256;i++)
 bits[i>>>2]|=rank[i]<<(2*(3-(i%4)));
for(let i=0;i<256;i++)assert.equal((bits[i>>>2] >>> (2*(3-(i%4))))&3,rank[i]);
const sha=x=>crypto.createHash('sha512').update(x).digest('hex');
const target=[
 '36367763ab73783c7af284446c',
 '59466b4cd653239a311cb7116',
 'd4618dee09a8425893dc7500b',
 '464fdaf1672d7bef5e891c6e227',
 '4568926a49fb4f45132c2a8b4'
].join('');
assert.equal(target.length,128);
const originalP56=corpus.pages.find(p=>p.page===56);
assert.equal(originalP56.indices.length,85);
const recorded=sha(bits);
assert.equal(recorded.length,128);
const rawEquals=bits.toString('hex')===target;
const shaEquals=recorded===target;
// The independent printed destination is not derived from this source graph.
// These two assertions turn a sudden positive into an obvious code change.
assert.equal(rawEquals,false);
assert.equal(shaEquals,false);
assert.equal(sha(Buffer.alloc(0)),
 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce' +
 '47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e');
const plantedTarget=sha(bits);
assert.equal(plantedTarget,sha(bits));
const altered=Buffer.from(bits);altered[0]^=1;
assert.notEqual(sha(altered),plantedTarget);
console.log(JSON.stringify({
 source:'Original 256 printed p50 tokens, source-absent-f radix59',
 root,childHistogram:children.reduce((a,c)=>(a[c.length]++,a),[0,0,0,0,0]),
 packedBytes:bits.length,nonrootAddresses:255,
 packedHex:bits.toString('hex'),packedSha512:recorded,
 targetP56Hex:target,rawEquals,shaEquals,
 controls:'Source-table topology, all 256 2-bit roundtrips and SHA-512 known-answer and mutated-plant control passed',
 outcome:'No recovered deep-web hash preimage or LP2 plaintext under this exact canonical two-bit tree encoding'
},null,2));
