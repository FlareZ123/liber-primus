'use strict';
/**
 * Historically source-constrained 2014 triple-XOR key vs original p55 outer ring.
 * Three source 256-byte hex streams were preserved in May-2014 solver files;
 * the accompanying historical solver test.pm XORs those three streams bytewise.
 * LP2 pp49–51 print a different 256-byte, 32x8 numerical table whose 76-cell
 * perimeter matches the original p55 rune count. This is a possible
 * cross-artifact key transport, not an author-signed decoder instruction.
 *
 * Freeze exactly two 256-byte key inputs: the stage05 XOR triple alone, and
 * that XOR triple XOR the original 2014 LP2 grid. Test original perimeter
 * corners (4), winding (2) and arithmetic signs (2), without fitted phases.
 * Run on Windows 11 or Actions: node sims/lp2_2014_onion_xor3_p55_ring_sft.cjs
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('resources/external/2014-stage05-three-onion-hex-blocks.txt');
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const groups=[...src.matchAll(/(?:^|\n)([0-9a-f]{512})(?:\n|$)/gm)].map(m=>m[1]);
assert.equal(groups.length,3);
assert.equal(grid.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const prior=groups.map(hex=>Array.from({length:256},(_,i)=>parseInt(hex.slice(2*i,2*i+2),16)));
const xor3=grid.map((_,i)=>prior[0][i]^prior[1][i]^prior[2][i]);
assert.equal(xor3.filter((v,i)=>v===grid[i]).length,1);
const keys=[
 {name:'2014-XOR3',bytes:xor3},
 {name:'2014-XOR3-XOR-LP2table',bytes:xor3.map((v,i)=>v^grid[i])}
];
const p55=corpus.pages[55].indices;
assert.equal(p55.length,76);
const gp=corpus.translit;
assert.equal(gp.length,29);
const mod29=value=>(value%29+29)%29;
/** @param {number[]} data */
function ioc(data){
 const freq=Array(29).fill(0);
 for(const x of data)freq[x]++;
 return freq.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
const perimeter=[];
for(let x=0;x<=7;x++)perimeter.push(x);
for(let y=1;y<=31;y++)perimeter.push(8*y+7);
for(let x=6;x>=0;x--)perimeter.push(8*31+x);
for(let y=30;y>=1;y--)perimeter.push(8*y);
assert.equal(perimeter.length,76);
assert.equal(new Set(perimeter).size,76);
const corners=[0,7,255,248];
const orientations=[];
for(let corner=0;corner<4;corner++)
 for(const direction of [-1,1]){
  const start=perimeter.indexOf(corners[corner]);
  const positions=perimeter.map((_,i)=>perimeter[(start+direction*i+152)%76]);
  assert.equal(new Set(positions).size,76);
  orientations.push({corner,direction,positions});
 }
const results=[];
const solved=corpus.pages[57].indices.slice(0,76);
assert.equal(solved.length,76);
for(const key of keys)for(const o of orientations)for(const sign of [-1,1]){
 const shifts=o.positions.map(cell=>key.bytes[cell]%29);
 const decipher=cipher=>cipher.map((v,i)=>mod29(v+sign*shifts[i]));
 const encipher=plaintext=>plaintext.map((v,i)=>mod29(v-sign*shifts[i]));
 assert.deepEqual(encipher(decipher(p55)),p55);
 assert.deepEqual(decipher(encipher(solved)),solved);
 const out=decipher(p55);
 results.push({key:key.name,corner:o.corner,direction:o.direction,sign,
  ioc:ioc(out),runes:out.map(i=>gp[i]).join('')});
}
assert.equal(results.length,32);
const summary=keys.map(key=>{
 const group=results.filter(x=>x.key===key.name).sort((a,b)=>b.ioc-a.ioc);
 return {key:key.name,transformations:group.length,bestIoC:group[0].ioc,
  bestOrientation:[group[0].corner,group[0].direction,group[0].sign],
  bestPlaintextCandidate:group[0].runes,
  maxNativeGP26ScoreNotEstablished:true};
});
assert(Math.abs(summary[0].bestIoC-0.04421052631578947)<1e-12);
assert(summary[1].bestIoC<0.05);
assert(summary.every(x=>x.bestIoC<ioc(solved)));
console.log(JSON.stringify({
  originalHistoricalSources:'May 2014 stage05 source participant allstrings/test.pm (Git blob 3a72ae0552acbfe3225269d7b10a0fed4fef068d)',
  sourceObjects:{prior256Streams:3,originalGridCells:256,originalP55Runes:76},
  rawP55IoC:ioc(p55),solvedP57First76IoC:ioc(solved),
  all32PositivePlantRecovered:true,summary,
  decision:'Neither historically 2014 triple XOR nor its LP2 256-byte XOR combination creates native-looking original p55 text under the sixteen natural perimeter additive inverses. No author-selected transport or plaintext.'
},null,2));
