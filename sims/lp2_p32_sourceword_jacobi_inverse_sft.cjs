"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {object} corpus @param {string} source */
function run(corpus, source) {
  const index = new Map(corpus.runes.map((r,i)=>[r,i]));
  const words = source.split(/\s*%\s*/).map(x=>(x.replace(/\s/g,"").replaceAll("/","").match(/\p{Script=Runic}+/gu)||[]).map(w=>[...w].map(r=>index.get(r))));
  const w=words[0][5], h=words[1][32];
  const page=n=>corpus.pages.find(p=>p.page===n).indices;
  const p32=page(32), p33=page(33).slice(10,91), native=page(57);
  const mod=x=>(x%29+29)%29;
  const sum=a=>a.reduce((s,x)=>s+corpus.prime[x],0);
  assert.deepEqual([w.length,h.length,p32.length,p33.length],[11,10,121,81]);
  assert.deepEqual([sum(w),sum(h),sum(p32.slice(0,11)),sum(p32.filter((_,i)=>i%11===0))],[563,569,563,569]);
  assert.deepEqual(w,[9,18,7,17,24,15,22,12,10,21,1]);
  assert.deepEqual(h,[11,0,10,9,27,5,26,28,10,27]);
  /** @param {number[]} a */
  const mat=a=>Array.from({length:11},(_,i)=>a.slice(i*11,i*11+11));
  /** @param {number[][]} a */
  const tr=a=>a[0].map((_,i)=>a.map(r=>r[i]));
  /** @param {number[][]} a @param {number[][]} b */
  const mul=(a,b)=>a.map(r=>tr(b).map(col=>mod(r.reduce((s,v,i)=>s+v*col[i],0))));
  /** @param {number[][]} a */
  const inv=a=>{
    let m=a.map((r,i)=>[...r,...Array.from({length:11},(_,j)=>+(i===j))]);
    let det=1;
    for(let i=0;i<11;i++){
      let k=m.findIndex((r,j)=>j>=i&&r[i]!==0);
      if(k<0)return {det:0};
      if(k!==i){[m[k],m[i]]=[m[i],m[k]];det=mod(-det)}
      let v=m[i][i];det=mod(det*v);
      let u=Array.from({length:29},(_,j)=>j).find(j=>mod(j*v)===1);
      m[i]=m[i].map(x=>mod(x*u));
      for(let j=0;j<11;j++)if(j!==i){let q=m[j][i];m[j]=m[j].map((x,l)=>mod(x-q*m[i][l]))}
    }
    return {det,inverse:m.map(r=>r.slice(11))};
  };
  /** @param {number[]} a */
  const ioc=a=>{let f=Array(29).fill(0);a.forEach(v=>f[v]++);return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))};
  const translit=a=>a.map(x=>corpus.translit[x]).join(" ");
  const plain=Array.from({length:121},(_,i)=>native[i%native.length]);
  const outputs=[];
  for(const [label,f] of [["index",x=>x],["primeResidue",x=>mod(corpus.prime[x])]]){
    const T=Array.from({length:11},(_,i)=>Array.from({length:11},(_,j)=>i===j?f(w[i]):Math.abs(i-j)===1?f(h[Math.min(i,j)]):0));
    const {det,inverse:I}=inv(T);
    if(!I){outputs.push({label,det});continue}
    const enc=a=>mul(mul(T,mat(a)),tr(T)).flat();
    const dec=a=>mul(mul(I,mat(a)),tr(I)).flat();
    const P=dec(p32);
    assert.deepEqual(enc(P),p32);
    assert.deepEqual(dec(enc(plain)),plain);
    const key=P.filter((_,i)=>i%11>0&&i%11<10&&Math.floor(i/11)>0&&Math.floor(i/11)<10);
    const continuation=[-1,1].map(sign=>{
      const a=p33.map((v,i)=>mod(v+sign*key[i]));
      assert.deepEqual(a.map((v,i)=>mod(v-sign*key[i])),p33);
      assert.deepEqual(native.slice(0,81).map((v,i)=>mod(mod(v-sign*key[i])+sign*key[i])),native.slice(0,81));
      return {sign,ioc:ioc(a),output:translit(a),indices:a};
    });
    outputs.push({label,det,ioc:ioc(P),output:translit(P),indices:P,continuation});
  }
  assert.deepEqual(outputs.map(x=>x.det),[17,24]);
  return {nativeIoC:ioc(plain),p33NativeIoC:ioc(native.slice(0,81)),p32IoC:ioc(p32),p33IoC:ioc(p33),outputs};
}
module.exports={run};
if(require.main===module){
  const dir=path.join(__dirname,"../resources/liber-primus");
  console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(dir,"lp2-corpus.json"),"utf8")),fs.readFileSync(path.join(dir,"lp2-transcription.txt"),"utf8")),null,2));
}
