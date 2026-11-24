'use strict';
// Read-only SFT: node sims/lp2_gf841_reciprocal_feedback_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const g = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lpmap = new Map(g.runes.map((x,i)=>[x,i]));
const lp = read('resources/transcriptions/lp1_wulfic_canonical.txt').split(/^\s*%\s*$/m).map(p=>[...p].filter(x=>lpmap.has(x)).map(x=>lpmap.get(x)));
for (const [i,n] of [[3,157],[8,187],[9,207],[10,192],[11,169],[14,89]]) assert.equal(lp[i].length,n);
const m=x=>((x%29)+29)%29, A=x=>x%29, B=x=>Math.floor(x/29), pack=(a,b)=>m(a)+29*m(b);
const mul=(x,y)=>pack(A(x)*A(y)+18*B(x)*B(y),A(x)*B(y)+B(x)*A(y)+11*B(x)*B(y));
const plus=(x,y)=>pack(A(x)+A(y),B(x)+B(y)), minus=(x,y)=>pack(A(x)-A(y),B(x)-B(y));
const pow=[1];
for(let i=1;i<840;i++) pow.push(mul(pow.at(-1),29));
assert.equal(new Set(pow).size,840);
assert.equal(mul(pow.at(-1),29),1);
const inv=new Uint16Array(841);
for(let i=0;i<840;i++) inv[pow[i]]=pow[(840-i)%840];
for(let i=1;i<841;i++) assert.equal(mul(i,inv[i]),1);
/** @param {number[]} r @returns {number[]} */
const pairs=r=>{assert.equal(r.length%2,0);return Array.from({length:r.length/2},(_,i)=>pack(r[2*i],r[2*i+1]));};
const source=(a,b)=>pairs(g.pages.slice(a,b+1).flatMap(p=>p.indices));
/** @param {number[]} c @param {number} a @param {number} b @param {number} d */
const dec=(c,a,b,d)=>[c[0],...c.slice(1).map((x,i)=>minus(minus(inv[minus(minus(x,c[i]),b)],mul(a,c[i])),d))];
/** @param {number[]} p @param {number} a @param {number} b @param {number} d */
const enc=(p,a,b,d)=>{const c=[p[0]];for(const x of p.slice(1)){const s=c.at(-1);c.push(plus(plus(s,b),inv[plus(plus(x,d),mul(a,s))]));}return c;};
/** Exhaust all 841^2 pairs on N payload packets, excluding the literal IV.
 * @param {number[]} c @param {number} N */
function scan(c,N){
  assert.ok(N>1&&N<c.length);
  const size=841*N;
  const pa=new Uint8Array(size),pb=new Uint8Array(size),qa=new Uint8Array(size),qb=new Uint8Array(size);
  for(let k=0;k<841;k++) for(let i=0;i<N;i++){
    const p=mul(k,c[i]),q=inv[minus(minus(c[i+1],c[i]),k)],j=k*N+i;
    pa[j]=A(p);pb[j]=B(p);qa[j]=A(q);qb[j]=B(q);
  }
  const h=new Uint16Array(58);let best=-1,ka=-1,kb=-1,ties=0,second=-1;
  for(let a=0;a<841;a++){const x=a*N;
    for(let b=0;b<841;b++){const y=b*N;h.fill(0);let count=0;
      for(let i=0;i<N;i++){
        const p=qa[y+i]-pa[x+i],q=qb[y+i]-pb[x+i];
        count+=h[p<0?p+29:p]++;count+=h[(q<0?q+29:q)+29]++;
      }
      if(count>best){second=best;best=count;ka=a;kb=b;ties=1;}
      else if(count===best)ties++;
      else if(count>second)second=count;
    }
  }
  return {a:ka,b:kb,score:best/(N*(N-1)),runnerUp:second/(N*(N-1)),ties,N};
}
/** Coordinate-wise collision rate, invariant under any constant field translation. */
function lane(p){const h=new Uint16Array(58);let s=0;for(const x of p){s+=h[A(x)]++;s+=h[29+B(x)]++;}return s/(p.length*(p.length-1));}
const train=[9,10,11,14].flatMap(i=>lp[i]),uni=new Uint32Array(29),bi=Array.from({length:29},()=>new Uint32Array(29));
for(const v of [9,10,11,14].map(i=>lp[i])) for(let i=0;i<v.length;i++){uni[v[i]]++;if(i)bi[v[i-1]][v[i]]++;}
const lu=Array.from(uni,x=>Math.log((x+1)/(train.length+29)));
const lb=bi.map(h=>{const t=h.reduce((a,b)=>a+b,0);return Array.from(h,x=>Math.log((x+.8)/(t+23.2)));});
const lang=p=>{const v=p.flatMap(x=>[A(x),B(x)]);let s=0;for(let i=0;i<v.length;i++)s+=.25*lu[v[i]]+(i?.75*lb[v[i-1]][v[i]]:.75*lu[v[i]]);return s/v.length;};
function shift(c,a,b,N){const v=dec(c.slice(0,N+1),a,b,0);let best=-Infinity,key=-1;
  for(let d=0;d<841;d++){const s=lang(v.slice(1).map(x=>minus(x,d)));if(s>best){best=s;key=d;}}
  return {d:key,lang:best};
}
const p=pairs([3,8].flatMap(i=>lp[i]).concat(g.pages[57].indices).slice(0,-1));
const keys=[326,511,703],cc=enc(p,...keys),pr=scan(cc,150),ps=shift(cc,pr.a,pr.b,150),pback=dec(cc,pr.a,pr.b,ps.d);
assert.equal(p.length,219);assert.deepEqual([pr.a,pr.b,ps.d],keys);assert.deepEqual(pback,p);assert.equal(pr.ties,1);
console.log('native positive',JSON.stringify({keys,rank:pr,shift:ps,exact:true,holdoutLane:lane(pback.slice(151)),holdoutLang:lang(pback.slice(151))}));
const a=source(33,39),b=source(40,53);assert.equal(a.length,840);assert.equal(b.length,1504);
const rr=scan(a,400),s=shift(a,rr.a,rr.b,400),d=dec(a,rr.a,rr.b,s.d),d2=dec(b,rr.a,rr.b,s.d);
assert.deepEqual([rr.a,rr.b,s.d],[161,188,254]);assert.equal(rr.ties,1);assert.deepEqual(enc(d,rr.a,rr.b,s.d),a);assert.deepEqual(enc(d2,rr.a,rr.b,s.d),b);
console.log('original',JSON.stringify({rank:rr,shift:s,holdoutLane:lane(d.slice(401)),holdoutLang:lang(d.slice(401)),transferLane:lane(d2.slice(1)),transferLang:lang(d2.slice(1)),exact:true,prefix:d.slice(1,21).flatMap(x=>[g.translit[A(x)],g.translit[B(x)]]).join(' ')}));

// All-key original singleton gate, independent of the collision/language optimizer.
const words=[];let word=[],off=0;
const flush=()=>{if(word.length)words.push(word);word=[];};
const pages=read('resources/liber-primus/lp2-transcription.txt').split(/^\s*%\s*$/m);
assert.equal(pages.length,57);
for(let i=0;i<pages.length;i++){
  const id=i<=49?i:i+1;let p=0;
  for(const ch of pages[i]){
    if(lpmap.has(ch)){word.push({id,off:off+p});p++;}
    else if('-.$&§'.includes(ch))flush();
  }
  assert.equal(p,g.pages[id].indices.length);off+=p;
}
flush();assert.equal(words.filter(w=>w.some(x=>x.id<56)).length,2896);
const allowed=[3,10,24],masks=Array.from({length:29},(_,x)=>allowed.reduce((s,p)=>s|(1<<m(x-p)),0)),all=(1<<29)-1;
const pop=x=>{let n=0;for(;x;x&=x-1)n++;return n;};
const bits=x=>Array.from({length:29},(_,i)=>i).filter(i=>x&(1<<i));
function singletonPositions(lo,hi){
  const off=g.pages.slice(0,lo).reduce((s,p)=>s+p.indices.length,0);
  return words.filter(w=>w.length===1&&w[0].id>=lo&&w[0].id<=hi).map(w=>w[0].off-off);
}
/** Every remaining (a,b) has an exactly factored Cartesian set of permissible d coordinates.
 * @param {number[]} c @param {number[]} sites */
function preSingleton(c,sites){
  assert.ok(sites.every(i=>i>=2)); // No tested singleton lies in the literal first pair.
  return sites.map(i=>{
    const j=i>>1,coord=i%2===0?A:B,prev=c[j-1],delta=minus(c[j],prev);
    return {i,p:Uint8Array.from({length:841},(_,k)=>coord(mul(k,prev))),q:Uint8Array.from({length:841},(_,k)=>coord(inv[minus(delta,k)]))};
  });
}
function scanSingleton(arr){
  let pairs=0,keys=0;const sample=[];
  for(let a=0;a<841;a++)for(let b=0;b<841;b++){
    let u=all,v=all;
    for(const x of arr){
      const s=x.q[b]-x.p[a],mask=masks[s<0?s+29:s];
      if(x.i%2===0)u&=mask;else v&=mask;
      if(!u||!v)break;
    }
    if(u&&v){pairs++;keys+=pop(u)*pop(v);if(sample.length<10)sample.push({a,b,du:bits(u),dv:bits(v)});}
  }
  return {pairs,keys,sample,sites:arr.length};
}
const sa=singletonPositions(33,39),sb=singletonPositions(40,53);
assert.deepEqual(sa,[138,318,367,599,718,1112,1286,1442,1595]);
assert.deepEqual(sb,[136,306,1211,1332,1355,1446,1886,2007,2162,2311,2525,2593,2614]);
const spa=preSingleton(a,sa),spb=preSingleton(b,sb);
for(const ar of [spa,spb,spa.concat(spb)]){const q=scanSingleton(ar);assert.equal(q.keys,0);console.log('original singleton gate',JSON.stringify(q));}
// Synthetic mask over actual native clear p57: mark every actual A/I/O occurrence (not only printed words).
const native94=g.pages[57].indices.slice(0,94),nativeSites=native94.flatMap((x,i)=>i>=2&&allowed.includes(x)?[i]:[]);
const nativeCipher=enc(pairs(native94),326,511,703),nativeResult=scanSingleton(preSingleton(nativeCipher,nativeSites));
assert.equal(nativeResult.keys,1);assert.deepEqual(nativeResult.sample,[{a:326,b:511,du:[7],dv:[24]}]);
console.log('native synthetic-mask singleton positive',JSON.stringify(nativeResult));
