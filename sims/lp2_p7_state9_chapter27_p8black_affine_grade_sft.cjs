'use strict';
/** Grade the prospectively frozen 9x27 affine receiver and exact p7 ring-order control. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29,mod=x=>((x%Q)+Q)%Q;
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw new Error('inv');};
const source=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const reference=fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const state=[23,3,5,6,15,8,19,2,4];
const wordByIn=new Map([
 [23,[27,9,16]],[2,[9,8,6,1,27,8,1]],[5,[12,22]],[19,[27,23,13,21,1,7,24,19]]
]);
const products=[11,26,8,15,2];

function matinv(A){
 const n=A.length,rows=A.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
 for(let c=0;c<n;c++){
  let p=-1;for(let r=c;r<n;r++)if(rows[r][c]){p=r;break;}assert(p>=0);
  if(p!==c)[rows[p],rows[c]]=[rows[c],rows[p]];
  const sc=inv(rows[c][c]);rows[c]=rows[c].map(x=>mod(x*sc));
  for(let r=0;r<n;r++)if(r!==c&&rows[r][c]){const f=rows[r][c];rows[r]=rows[r].map((x,j)=>mod(x-f*rows[c][j]));}
 }
 return rows.map(r=>r.slice(n));
}
const circ=row=>Array.from({length:5},(_,i)=>Array.from({length:5},(_,k)=>row[(k-i+5)%5]));
const originalInverseRow=matinv(circ(products))[0];
assert.deepEqual(originalInverseRow,[23,2,5,2,19]);
const originalKey=originalInverseRow.flatMap(x=>wordByIn.get(x));
assert.equal(originalKey.length,27);

const p8=source.pages.find(p=>p.page===8),ann=ink.pages.find(p=>p.page===8),red=Array(p8.indices.length).fill(false);
for(const sp of ann.red_spans)for(let i=sp.start;i<sp.start+sp.length;i++)red[i]=true;
const black=p8.indices.filter((_,i)=>!red[i]);assert.equal(black.length,243);

const alphabet=source.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpWord(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
 const out=[];for(let i=0;i<s.length;){const m=alphabet.find(e=>s.startsWith(e.s,i));if(!m)return null;out.push(m.i);i+=m.s.length;}return out;
}
const paragraphs=reference.split(/\n\s*\n/).map(p=>p.split('\n').filter(line=>!line.trim().startsWith('#')&&!line.trim().startsWith('[')).join(' ')).filter(Boolean);
const training=[];
for(const p of paragraphs){const seq=[];for(const w of p.match(/[A-Za-z]+/g)||[]){const e=gpWord(w);assert.ok(e);seq.push(...e);}if(seq.length>=3)training.push(seq);}
const triCounts=new Map();let triTotal=0;
for(const seq of training)for(let i=2;i<seq.length;i++){const k=seq.slice(i-2,i+1).join(',');triCounts.set(k,(triCounts.get(k)||0)+1);triTotal++;}
assert.equal(triTotal,3178);
const denominator=triTotal+.1*29**3;
function trigram(xs){let s=0;for(let i=2;i<xs.length;i++){const k=xs.slice(i-2,i+1).join(',');s+=Math.log(((triCounts.get(k)||0)+.1)/denominator);}return s/(xs.length-2);}
const native=[];for(const seq of training)for(let i=0;i+76<=seq.length;i++)native.push(trigram(seq.slice(i,i+76)));
assert.equal(native.length,1752);
const nativeMinimum=Math.min(...native);assert(Math.abs(nativeMinimum+8.061343953919978)<1e-9);

const decode=(key,role,st=state)=>black.map((c,i)=>{
 const r=Math.floor(i/27),j=i%27,a=role==='state_multiplier'?st[r]:key[j],b=role==='state_multiplier'?key[j]:st[r];
 return mod(inv(a)*(c-b));
});
const originalChapter=decode(originalKey,'chapter_multiplier'),originalState=decode(originalKey,'state_multiplier');
assert(Math.abs(trigram(originalChapter)-(-10.692987164813898))<1e-12);

// Charge the exact p7 cyclic/reversal presentation family with state order fixed.
const orientations=[];
for(const reversed of [false,true]){
 const base=reversed?products.slice().reverse():products.slice();
 for(let rotation=0;rotation<5;rotation++){
  const row=base.slice(rotation).concat(base.slice(0,rotation));
  const inverseRow=matinv(circ(row))[0];
  assert.ok(inverseRow.every(x=>wordByIn.has(x)));
  const key=inverseRow.flatMap(x=>wordByIn.get(x));assert.equal(key.length,27);
  orientations.push({reversed,rotation,inverseRow,trigram:trigram(decode(key,'chapter_multiplier'))});
 }
}
orientations.sort((a,b)=>b.trigram-a.trigram);
assert.equal(orientations.findIndex(x=>!x.reversed&&x.rotation===0)+1,4);
assert(Math.abs(orientations[0].trigram-(-10.647472851714971))<1e-12);
assert.ok(orientations.every(x=>x.trigram<nativeMinimum));

// Random matched 9-nonzero by 27-nonzero affine operands; same seed as exploratory grade.
let seed=0x92727aff;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const nulls=[[],[]];
for(let t=0;t<2000;t++){
 const st=Array.from({length:9},()=>1+rnd()%28),key=Array.from({length:27},()=>1+rnd()%28);
 nulls[0].push(trigram(decode(key,'state_multiplier',st)));
 nulls[1].push(trigram(decode(key,'chapter_multiplier',st)));
}
for(const x of nulls)x.sort((a,b)=>a-b);
const chapterScore=trigram(originalChapter),stateScore=trigram(originalState);
const result={
 classification:'bounded negative: state9 x chapter27 affine p8-black receiver',
 native76Minimum:nativeMinimum,
 originalPrinted:{
  stateMultiplier:{trigram:stateScore,rank:nulls[0].filter(x=>x<=stateScore).length+1},
  chapterMultiplier:{trigram:chapterScore,rank:nulls[1].filter(x=>x<=chapterScore).length+1}
 },
 randomN:2000,
 ringOrientationControl:{count:orientations.length,originalRank:4,best:orientations[0],orientations},
 decision:'mild affine score uplift is not specific to original p7 order and remains far below native solved-GP prose'
};
console.log(JSON.stringify(result,null,2));
