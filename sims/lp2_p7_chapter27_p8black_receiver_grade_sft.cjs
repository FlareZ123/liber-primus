'use strict';
/**
 * Grades three receiver operations that were each frozen before inspection:
 * additive: commit 97b9865df40d06831d35343316f89a5db97668eb
 * recursive right-circulant: 0863fd5196787052efb04e83cc096ad6bec8efaa
 * multiplicative: ba612dcd1aecad2a18a6144763b4ba76441026aa
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29;
const mod=x=>((x%Q)+Q)%Q;
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw new Error('inverse');};
function inverseGF29(matrix){
  const n=matrix.length,rows=matrix.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
  let determinant=1;
  for(let c=0;c<n;c++){
    let p=-1;for(let r=c;r<n;r++)if(rows[r][c]){p=r;break;}
    if(p<0)return null;
    if(p!==c){[rows[p],rows[c]]=[rows[c],rows[p]];determinant=mod(-determinant);}
    const lead=rows[c][c];determinant=mod(determinant*lead);
    const scale=inv(lead);rows[c]=rows[c].map(x=>mod(x*scale));
    for(let r=0;r<n;r++)if(r!==c&&rows[r][c]){
      const f=rows[r][c];rows[r]=rows[r].map((x,j)=>mod(x-f*rows[c][j]));
    }
  }
  return {inverse:rows.map(r=>r.slice(n)),determinant};
}
function transformBlocks(matrix,body){
  const n=matrix.length,out=[];assert.equal(body.length%n,0);
  for(let o=0;o<body.length;o+=n)
    for(const row of matrix)out.push(mod(row.reduce((s,v,j)=>s+v*body[o+j],0)));
  return out;
}
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const nativeSource=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));

const key=[27,9,16,9,8,6,1,27,8,1,12,22,9,8,6,1,27,8,1,27,23,13,21,1,7,24,19];
assert.equal(key.length,27);
assert.ok(key.every(x=>x!==0));

const p8=corpus.pages.find(x=>x.page===8),ann=ink.pages.find(x=>x.page===8);
const red=Array(p8.indices.length).fill(false);
for(const sp of ann.red_spans)for(let i=sp.start;i<sp.start+sp.length;i++)red[i]=true;
const black=p8.indices.filter((_,i)=>!red[i]);
assert.equal(black.length,243);
assert.equal(black.length/key.length,9);

// Native GP29 scorer family used elsewhere in the repository.
const runeIndex=new Map(corpus.runes.map((s,i)=>[s,i]));
const sections=nativeSource.sections.map(s=>[...s.source_text].filter(c=>runeIndex.has(c)).map(c=>runeIndex.get(c)));
const counts=Array(Q).fill(.5),counts2=Array.from({length:Q},()=>Array(Q).fill(0));
for(const s of sections)for(let i=0;i<s.length;i++){counts[s[i]]++;if(i)counts2[s[i-1]][s[i]]++;}
const total=a=>a.reduce((x,y)=>x+y,0),probs=counts.map(x=>x/total(counts));
const L=probs.map(x=>Math.log(Q*x));
const L2=counts2.map(a=>a.map((x,j)=>Math.log(Q*(x+12*probs[j])/(total(a)+12))));
function score(xs){let z=0;for(let i=0;i<xs.length;i++)z+=i?L2[xs[i-1]][xs[i]]:L[xs[i]];return z/xs.length;}
function ioc(xs){const c=Array(Q).fill(0);for(const x of xs)c[x]++;return c.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1));}
function xorshift(seed0){let seed=seed0>>>0;return()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};}
function rank(sorted,value){return sorted.filter(x=>x<=value).length+1;}

// Gate 1: phase-zero cyclic additive inverse.
const additive=black.map((x,i)=>mod(x-key[i%27]));
assert.deepEqual(additive.map((x,i)=>mod(x+key[i%27])),black);
const ra=xorshift(0x27110827),addNull=[];
for(let t=0;t<2000;t++){
  const k=Array.from({length:27},()=>ra()%29);
  addNull.push(score(black.map((x,i)=>mod(x-k[i%27]))));
}
addNull.sort((a,b)=>a-b);

// Gate 2: recursive printed-convention right-circulant.
const matrix=Array.from({length:27},(_,i)=>Array.from({length:27},(_,k)=>key[(k-i+27)%27]));
const matrixAnalysis=inverseGF29(matrix);
assert.ok(matrixAnalysis);
assert.equal(matrixAnalysis.determinant,23);
const circulant=transformBlocks(matrixAnalysis.inverse,black);
assert.deepEqual(transformBlocks(matrix,circulant),black);
const rc=xorshift(0x27112727),circNull=[];
let attempts=0;
while(circNull.length<1000&&attempts<5000){
  attempts++;
  const row=Array.from({length:27},()=>rc()%29);
  const trial=Array.from({length:27},(_,i)=>Array.from({length:27},(_,k)=>row[(k-i+27)%27]));
  const analysis=inverseGF29(trial);if(!analysis)continue;
  circNull.push(score(transformBlocks(analysis.inverse,black)));
}
assert.equal(circNull.length,1000);
circNull.sort((a,b)=>a-b);

// Gate 3: periodic multiplicative inverse.
const multiplicative=black.map((x,i)=>mod(x*inv(key[i%27])));
assert.deepEqual(multiplicative.map((x,i)=>mod(x*key[i%27])),black);
const rm=xorshift(0x2711272f),multNull=[];
for(let t=0;t<2000;t++){
  const k=Array.from({length:27},()=>1+(rm()%28));
  multNull.push(score(black.map((x,i)=>mod(x*inv(k[i%27]))));
}
multNull.sort((a,b)=>a-b);

const result={
  classification:'three prospectively frozen p7->chapter27->p8-black receiver negatives',
  source:{key,keyLength:key.length,receiverRunes:black.length,cycles:black.length/key.length},
  original:{score:score(black),ioc:ioc(black)},
  additive:{score:score(additive),ioc:ioc(additive),randomN:addNull.length,randomMedian:addNull[1000],rank:rank(addNull,score(additive))},
  recursiveRightCirculant:{determinant:matrixAnalysis.determinant,score:score(circulant),ioc:ioc(circulant),randomInvertibleN:circNull.length,randomAttempts:attempts,randomMedian:circNull[500],rank:rank(circNull,score(circulant))},
  multiplicative:{score:score(multiplicative),ioc:ioc(multiplicative),randomN:multNull.length,randomMedian:multNull[1000],rank:rank(multNull,score(multiplicative))}
};
assert(Math.abs(result.additive.score-(-1.7380065446249788))<1e-12);
assert.equal(result.additive.rank,175);
assert(Math.abs(result.recursiveRightCirculant.score-(-1.7135551043192125))<1e-12);
assert.equal(result.recursiveRightCirculant.rank,116);
assert(Math.abs(result.multiplicative.score-(-1.6601316748442876))<1e-12);
assert.equal(result.multiplicative.rank,465);
console.log(JSON.stringify(result,null,2));
