'use strict';
/**
 * Source-visible floral page/physical-row/rune-column shared-pad inverse.
 * Frozen before testing this specific original clock. Node 22, CommonJS.
 * The key is arbitrary at each (row,column), shared across p40–48.
 * Fit p40–45 only; score p46–48 using exact posterior predictive likelihood.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const Q=29, QQ=Q*Q, LQ=Math.log(Q);
const mod=(x)=>(x+Q)%Q;
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const allLines=transcript.split(/\r?\n/u).map(l=>[...l].filter(r=>runeMap.has(r)).map(r=>runeMap.get(r))).filter(l=>l.length);
let cursor=0;
const original=[];
for(const p of corpus.pages.filter(p=>p.page<56&&p.indices.length)){
  let n=0,lines=[];
  while(n<p.indices.length){const l=allLines[cursor++]; assert.ok(l); lines.push(l); n+=l.length;}
  assert.equal(n,p.indices.length);
  assert.deepEqual(lines.flat(),p.indices);
  if(p.page>=40&&p.page<=48)original.push(lines);
}
assert.equal(cursor,594);
assert.equal(original.length,9);
assert.equal(original[0].flat().length,231);
const shape=original.map(p=>p.map(l=>l.length));
const widths=Array.from({length:Math.max(...shape.map(p=>p.length))},(_,r)=>Math.max(...shape.map(p=>p[r]||0)));
const count=(p)=>p.flat(2).length;
const trainN=count(original.slice(0,6)), holdN=count(original.slice(6));
const dict=new Map(corpus.translit.map((s,i)=>[s,i]));
const tokens=[...dict.keys()].sort((a,b)=>b.length-a.length);

/** @param {string} text @returns {number[]} */
function gp(text){
  let out=[];
  for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replaceAll('QU','CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S').replaceAll('ING','NG').replaceAll('IO','IA');
    for(let i=0;i<w.length;){let t=tokens.find(t=>w.startsWith(t,i));assert.ok(t);out.push(dict.get(t));i+=t.length;}
  }
  return out;
}
const sh=gp(read('resources/control/shakespeare_first300k.txt'));
const gi=gp(read('resources/control/gibran_prophet_58585.txt'));
const em=gp(read('resources/control/emerson_essays_2944.txt'));
const ref=sh.slice(0,120000);
assert.equal(ref.length,120000);
const u=new Float64Array(Q).fill(0.5);
const b=new Float64Array(QQ).fill(0.5);
const t=new Float64Array(QQQ());
function QQQ(){return Q*QQ;}
for(let i=0;i<ref.length;i++){u[ref[i]]++;if(i)b[ref[i-1]*Q+ref[i]]++;if(i>1)t[(ref[i-2]*Q+ref[i-1])*Q+ref[i]]++;}
const su=u.reduce((x,y)=>x+y,0);
const U=Float64Array.from(u,x=>Math.log(x/su));
const B=new Float64Array(QQ);
for(let a=0;a<Q;a++){let s=0;for(let c=0;c<Q;c++)s+=b[a*Q+c];for(let c=0;c<Q;c++)B[a*Q+c]=Math.log(b[a*Q+c]/s);}
const T=new Float64Array(QQQ());
for(let ab=0;ab<QQ;ab++){let s=0;for(let c=0;c<Q;c++)s+=t[ab*Q+c];for(let c=0;c<Q;c++)T[ab*Q+c]=Math.log((t[ab*Q+c]+20*Math.exp(B[(ab%Q)*Q+c]))/(s+20));}
const dec=Array.from({length:Q},(_,c)=>Int8Array.from({length:Q},(_,k)=>mod(c-k)));
/** @param {Float64Array} a */
function normalize(a){const s=a.reduce((x,y)=>x+y,0);assert.ok(s>0&&Number.isFinite(s));for(let i=0;i<a.length;i++)a[i]/=s;return Math.log(s);}

/** Sum-product over all Q^width keys and Viterbi MAP, using shared row keys.
 * @param {number[][]} lines @param {number} width
 */
function solveRow(lines,width){
  lines=lines.filter(l=>l.length);
  let f=new Float64Array(Q),m=new Float64Array(Q),z=0;
  for(let k=0;k<Q;k++){let ll=0;for(const l of lines)ll+=U[dec[l[0]][k]];f[k]=Math.exp(ll)/Q;m[k]=ll;}
  z+=normalize(f);
  if(width===1)return {z,key:[m.indexOf(Math.max(...m))]};
  let F=new Float64Array(QQ),M=new Float64Array(QQ);
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){
    let ll=0;for(const l of lines)if(l.length>1)ll+=B[dec[l[0]][a]*Q+dec[l[1]][b]];
    const ab=a*Q+b;F[ab]=f[a]*Math.exp(ll)/Q;M[ab]=m[a]+ll;
  }
  z+=normalize(F);
  const back=[];
  for(let j=2;j<width;j++){
    const active=lines.filter(l=>l.length>j).map(l=>[dec[l[j-2]],dec[l[j-1]],dec[l[j]]]);
    const nF=new Float64Array(QQ),nM=new Float64Array(QQ),bp=new Int8Array(QQ);
    for(let b=0;b<Q;b++)for(let c=0;c<Q;c++){
      let sum=0,best=-Infinity,ba=0;
      for(let a=0;a<Q;a++){
        let ll=0;
        for(const p of active)ll+=T[(p[0][a]*Q+p[1][b])*Q+p[2][c]];
        const ab=a*Q+b;sum+=F[ab]*Math.exp(ll);
        const v=M[ab]+ll;if(v>best){best=v;ba=a;}
      }
      const bc=b*Q+c;nF[bc]=sum/Q;nM[bc]=best;bp[bc]=ba;
    }
    z+=normalize(nF);F=nF;M=nM;back.push(bp);
  }
  let best=0;for(let i=1;i<QQ;i++)if(M[i]>M[best])best=i;
  const key=new Array(width);
  key[width-2]=Math.floor(best/Q);key[width-1]=best%Q;
  for(let j=width-1;j>=2;j--)key[j-2]=back[j-2][key[j-1]*Q+key[j]];
  return {z,key};
}
/** @param {number[][][]} pages */
function fit(pages){
  let z=0;const key=[];
  for(let r=0;r<widths.length;r++){
    const a=solveRow(pages.map(p=>p[r]||[]),widths[r]);z+=a.z;key.push(a.key);
  }
  return {z,key};
}
/** @param {number[][][]} pages */
function pairs(pages){
  let n=0,e=0;
  for(let a=0;a<pages.length;a++)for(let b=a+1;b<pages.length;b++)
    for(let r=0;r<Math.min(pages[a].length,pages[b].length);r++)
      for(let c=0;c<Math.min(pages[a][r].length,pages[b][r].length);c++){
        n++;if(pages[a][r][c]===pages[b][r][c])e++;
      }
  return {n,e};
}
function decode(pages,key){return pages.map(p=>p.map((l,r)=>l.map((x,c)=>mod(x-key[r][c]))));}
function encode(pages,key){return pages.map(p=>p.map((l,r)=>l.map((x,c)=>mod(x+key[r][c]))));}
function score(pages){
  let ll=0,n=0;for(const p of pages)for(const l of p)for(let j=0;j<l.length;j++){
    n++;ll+=j===0?U[l[j]]:j===1?B[l[j-1]*Q+l[j]]:T[(l[j-2]*Q+l[j-1])*Q+l[j]];
  }return ll/n;
}
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%Q;};}
function shapeText(seq,start){let pos=start;return shape.map(p=>p.map(n=>{let l=seq.slice(pos,pos+n);pos+=n;assert.equal(l.length,n);return l;}));}
function match(a,b){const x=a.flat(2),y=b.flat(2);assert.equal(x.length,y.length);return x.reduce((s,v,i)=>s+(v===y[i]),0);}

/** Predict all held-out ciphertext without using it to select a hard key.
 * The uniform-key model's log evidence is exact up to floating-point arithmetic.
 * @param {string} label @param {number[][][]} data @param {number[][][]=} plain @param {number[][]=} trueKey
 */
function experiment(label,data,plain,trueKey){
  const tr=fit(data.slice(0,6)),all=fit(data);
  const recovered=decode(data,tr.key);
  assert.deepEqual(encode(recovered,tr.key),data);
  const held=recovered.slice(6);
  const result={label,trainN,holdN,allPairs:pairs(data),logZTrain:tr.z,logZAll:all.z,
    predictiveGain:(all.z-tr.z+holdN*LQ)/holdN,
    mapHeldoutNats:score(held),example:held[0].flat().slice(0,100).map(x=>corpus.translit[x]).join(' ')};
  if(plain){assert.deepEqual(decode(data,trueKey),plain);assert.deepEqual(pairs(data),pairs(plain));result.plantRecovered=match(held,plain.slice(6));result.trueHeldoutNats=score(plain.slice(6));}
  console.log(JSON.stringify(result));
}
console.log(JSON.stringify({shape,widths,trainN,holdN,ref:ref.length,donors:[sh.length,gi.length,em.length]}));
for(const [label,seq,offset,seed] of [['Shakespeare withheld',sh,125000,3301],['Gibran',gi,4000,2014],['Emerson',em,5000,2016]]){
  const plain=shapeText(seq,offset),random=rng(seed);
  const key=widths.map(w=>Array.from({length:w},random));
  experiment(label,encode(plain,key),plain,key);
}
const random=rng(133331);
const nullData=shape.map(p=>p.map(w=>Array.from({length:w},random)));
experiment('Independent uniform pad null',nullData);
experiment('Original p40–48',original);
