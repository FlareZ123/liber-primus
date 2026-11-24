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
