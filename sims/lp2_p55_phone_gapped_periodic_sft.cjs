'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const PHONE = 'CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT';
const ORIGINAL = [21,25,19,10,7,15,17,14,19,15,12,6,23,2,25,0,27,24,17,5,1,7,4,17,28,0,14,10,19,1,5,13,8,21,20,12,19,15,23,27,13,0,17,8,12,5,12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10];
const mod = (x) => (x+29)%29;
function phoneRunes() {
  const words = PHONE.split(' ');
  return words.flatMap(w => w.match(/TH|./g).map(x => { const i=GP.indexOf(x); assert(i>=0); return i; }));
}
/** Exact all-key known-plaintext subsequence recovery. Extra symbols never consume the clock. */
function search(p,c,q,hold) {
  const m=p.length,n=c.length;
  const key=new Int32Array(q);
  const next=new Int16Array((n+1)*29).fill(n);
  for(let i=n-1;i>=0;i--){next.copyWithin(i*29,(i+1)*29,(i+2)*29);next[i*29+c[i]]=i;}
  let leaves=0, hits=0;
  const keys=new Map();
  function finish(i,pos,j) {
    leaves++;
    for(;i<m;i++){
      const x=p[i], f=hold&&x===0;
      const y=f?0:mod(x+key[j%q]);
      const k=next[pos*29+y];
      if(k>n-m+i)return;
      pos=k+1;if(!f)j++;
    }
    hits++;
    const k=Array.from(key), id=k.join(',');
    if(!keys.has(id))keys.set(id,k);
  }
  function dfs(i,pos,j) {
    if(j===q){finish(i,pos,j);return;}
    if(i===m)throw new Error('Need at least q consuming plaintext runes');
    const f=hold&&p[i]===0, last=n-m+i;
    for(let k=pos;k<=last;k++){
      if(f){if(c[k]===0)dfs(i+1,k+1,j);}
      else {key[j]=mod(c[k]-p[i]);dfs(i+1,k+1,j+1);}
    }
  }
  dfs(0,0,0);
  return {q,hold,prefixEmbeddings:leaves,acceptingPrefixEmbeddings:hits,distinctKeys:keys.size,keys:Array.from(keys.values())};
}
function enc(p,key,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+key[j++%key.length]));}
function witness(c,p,key,hold){const expected=enc(p,key,hold),positions=[];let j=0;for(let i=0;i<c.length&&j<expected.length;i++)if(c[i]===expected[j]){positions.push(i);j++;}assert.equal(j,expected.length);assert.deepEqual(positions.map(i=>c[i]),expected);return positions;}
function plant(p,key,hold,n,seed){let s=seed>>>0;const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s;};const c=enc(p,key,hold);while(c.length<n)c.splice(rand()%(c.length+1),0,rand()%29);return c;}
function run(corpus){
  assert.deepEqual(corpus.translit,GP);
  const c=corpus.pages.find(x=>x.page===55).indices;assert.deepEqual(c,ORIGINAL);
  const p=phoneRunes();assert.equal(p.length,59);assert.equal(c.length,76);assert.equal(PHONE.length,76);assert.equal(PHONE.split(' ').length,17);
  const results=[];
  for(const q of [8,13])for(const hold of [false,true]){
    const k=Array.from({length:q},(_,j)=>(7+11*j+3*j*j)%29);
    const cp=plant(p,k,hold,76,3301+q+Number(hold));
    const positive=search(p,cp,q,hold);
    assert(positive.keys.some(x=>x.every((v,j)=>v===k[j])));
    const pos=witness(cp,p,k,hold);assert.equal(pos.length,59);
    const r=search(p,c,q,hold);
    for(const key of r.keys)witness(c,p,key,hold);
    const row={q,hold,positive:{prefixEmbeddings:positive.prefixEmbeddings,acceptingPrefixEmbeddings:positive.acceptingPrefixEmbeddings,distinctKeys:positive.distinctKeys,plantedKey:k},original:r};
    results.push(row);console.log(JSON.stringify(row));
  }
  return results;
}
module.exports={run,search,phoneRunes,ORIGINAL,GP};
if(require.main===module)run(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8')));
