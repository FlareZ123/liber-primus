"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,".."),MOD=29,N=119,BEFORE=4353,AFTER=2006;
const CONTROLS=["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"];
const mod=x=>((x%MOD)+MOD)%MOD,sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const inv29=x=>{for(let i=1;i<MOD;i++)if(mod(i*x)===1)return i;throw Error("nonunit")};
const trim=a=>{while(a.length>1&&a.at(-1)===0)a.pop();return a};
const corpusBytes=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"));
const gridBytes=fs.readFileSync(path.join(ROOT,"resources/liber-primus/base60-grid.json"));
const corpus=JSON.parse(corpusBytes.toString("utf8")),grid=JSON.parse(gridBytes.toString("utf8"));
const bytes=grid.byte_rows.flat();assert.equal(bytes.length,256);
const gridHash=sha(Buffer.from(bytes));assert.equal(gridHash,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
function div29(p,d){const r=p.slice(),q=Array(p.length-d.length+1).fill(0),iv=inv29(d.at(-1));for(let i=q.length-1;i>=0;i--){const v=mod(r[i+d.length-1]*iv);q[i]=v;for(let j=0;j<d.length;j++)r[i+j]=mod(r[i+j]-v*d[j]);}assert.ok(r.slice(0,d.length-1).every(x=>x===0));return trim(q)}
let q=trim(bytes.slice().reverse().map(b=>mod(28*b)));
for(const d of [[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]])q=div29(q,d);
assert.equal(q.length,239);assert.equal(q[238],1);
const addK=(x,y)=>mod(x%29+y%29)+29*mod(Math.floor(x/29)+Math.floor(y/29));
const subK=(x,y)=>mod(x%29-y%29)+29*mod(Math.floor(x/29)-Math.floor(y/29));
const mulK=(x,y)=>{const a=x%29,b=Math.floor(x/29),c=y%29,d=Math.floor(y/29);return mod(a*c+8*b*d)+29*mod(a*d+b*c+3*b*d)};
const invK=x=>{const a=x%29,b=Math.floor(x/29),iv=inv29(mod(a*a+3*a*b-8*b*b));return mod((a+3*b)*iv)+29*mod(-b*iv)};
const negK=x=>subK(0,x);
const monicK=p=>{const iv=invK(p.at(-1));return trim(p.map(v=>mulK(v,iv)))};
function remK(p,d){const r=p.slice(),n=d.length-1,iv=invK(d[n]);for(let i=r.length-1;i>=n;i--){const a=mulK(r[i],iv);if(a)for(let j=0;j<=n;j++){const v=mulK(a,d[j]),k=i-n+j;r[k]=mod(r[k]%29-v%29)+29*mod(Math.floor(r[k]/29)-Math.floor(v/29));}}return trim(r)}
function gcdK(a,b){while(b.length>1||b[0]!==0){const t=remK(a,b);a=b;b=t;}return monicK(a)}
function mulModQ(a,b){const n=a.length+b.length-1,lo=Array(n).fill(0),hi=Array(n).fill(0);for(let i=0;i<a.length;i++){const x=a[i]%29,y=Math.floor(a[i]/29);for(let j=0;j<b.length;j++){const v=b[j]%29,w=Math.floor(b[j]/29),k=i+j;lo[k]+=x*v+8*y*w;hi[k]+=x*w+y*v+3*y*w;}}for(let i=n-1;i>=238;i--){const x=mod(lo[i]),y=mod(hi[i]);if(x||y)for(let j=0;j<238;j++){lo[i-238+j]-=x*q[j];hi[i-238+j]-=y*q[j];}}const out=Array(Math.min(n,238));for(let i=0;i<out.length;i++)out[i]=mod(lo[i])+29*mod(hi[i]);return trim(out)}
function powModQ(a,e){let v=[1];while(e>0n){if(e&1n)v=mulModQ(v,a);e>>=1n;if(e>0n)a=mulModQ(a,a)}return v}
function mulFullK(a,b){const c=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)c[i+j]=addK(c[i+j],mulK(a[i],b[j]));return trim(c)}
const ch=powModQ([31,1],(841n**119n-1n)/2n),chm1=ch.slice();chm1[0]=subK(chm1[0],1);
const F=monicK(gcdK(q,chm1)),Fc=F.map(v=>mod(v%29+3*Math.floor(v/29))+29*mod(-Math.floor(v/29)));
assert.equal(F.length,120);assert.equal(Fc.length,120);assert.notDeepEqual(F,Fc);assert.deepEqual(mulFullK(F,Fc),q);assert.notEqual(F[0],0);assert.notEqual(Fc[0],0);
const pages=corpus.pages.filter(p=>p.page<=55&&p.status==="unsolved"&&p.indices.length).sort((a,b)=>a.page-b.page);
const p36=pages.find(p=>p.page===36),before=pages.filter(p=>p.page<36).flatMap(p=>p.indices),after=pages.filter(p=>p.page>36).flatMap(p=>p.indices),original=[...before,...after];
assert.equal(p36.indices.length,238);assert.equal(before.length,8706);assert.equal(after.length,4012);assert.equal(original.length,12718);
const pairify=a=>{assert.equal(a.length%2,0);const o=[];for(let i=0;i<a.length;i+=2)o.push(a[i]+29*a[i+1]);return o};
const seed=pairify(p36.indices),cipher=[...pairify(before),...pairify(after)];
assert.equal(seed.length,119);assert.equal(cipher.length,BEFORE+AFTER);
function next(st,f){let s=0;for(let j=0;j<N;j++)s=addK(s,mulK(f[j],st[j]));const v=negK(s);st.shift();st.push(v);return v}
function prev(st,f){let s=st[N-1];for(let j=1;j<N;j++)s=addK(s,mulK(f[j],st[j-1]));const v=negK(mulK(invK(f[0]),s));st.pop();st.unshift(v);return v}
function traceBuilder(f,coeffs){
  const t=Array(N).fill(0);t[0]=N%MOD;
  for(let k=1;k<N;k++){let s=0;for(let i=1;i<k;i++)s=addK(s,mulK(f[N-i],t[k-i]));s=addK(s,mulK(k%MOD,f[N-k]));t[k]=negK(s)}
  const powers=new Map();for(let i=0;i<N;i++)powers.set(i,t[i]);
  let st=t.slice();const max=N-1+N+AFTER-1;for(let n=N;n<=max;n++)powers.set(n,next(st,f));
  st=t.slice();for(let n=-1;n>=-BEFORE;n--)powers.set(n,prev(st,f));
  return n=>{let s=0;for(let j=0;j<N;j++){const v=powers.get(j+n);assert.notEqual(v,undefined);s=addK(s,mulK(coeffs[j],v))}return s};
}
const ioc=a=>{const c=Array(MOD).fill(0);for(const x of a)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))};
const nativeGP=raw=>{const tok=corpus.translit.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length),words=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").match(/[A-Z]+/g)||[],out=[];for(const w of words){const enc=[];for(let i=0;i<w.length;){const t=tok.find(x=>w.startsWith(x.text,i));if(!t){enc.length=0;break}enc.push(t.index);i+=t.text.length}out.push(...enc)}return out};
function train(a){const c=new Map();let n=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];c.set(k,(c.get(k)||0)+1);n++}return {c,n}}
function score(a,m){const d=m.n+0.1*29**3;let s=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];s+=Math.log(((m.c.get(k)||0)+0.1)/d)}return s/(a.length-2)}
const controls=CONTROLS.map(n=>nativeGP(fs.readFileSync(path.join(ROOT,"resources/control",n),"utf8"))),model=train(controls[0]);
function windows(a){const max=a.length-original.length,v=[];for(let i=0;i<300;i++){const start=Math.floor(i*max/299),w=a.slice(start,start+original.length);v.push({ioc:ioc(w),trigram:score(w,model)})}const ii=v.map(x=>x.ioc).sort((a,b)=>a-b),tt=v.map(x=>x.trigram).sort((a,b)=>a-b);return {length:a.length,windows:300,iocMin:ii[0],iocMedian:ii[149],iocMax:ii.at(-1),trigramMin:tt[0],trigramMedian:tt[149],trigramMax:tt.at(-1)}}
const referenceWindows=controls.map((a,i)=>({source:CONTROLS[i],...windows(a)})),rawMetrics={ioc:ioc(original),trigram:score(original,model)},results=[];
for(const [name,f] of [["F119",F],["F119-conjugate",Fc]])for(const reverse of [false,true]){
  const trace=traceBuilder(f,reverse?seed.slice().reverse():seed.slice());
  const keys=[...Array.from({length:BEFORE},(_,i)=>trace(i-BEFORE)),...Array.from({length:AFTER},(_,i)=>trace(N+i))];
  assert.equal(keys.length,cipher.length);
  for(const sign of [-1,1]){
    const decodedPairs=cipher.map((c,i)=>sign===-1?subK(c,keys[i]):addK(c,keys[i]));
    const reciphered=decodedPairs.map((p,i)=>sign===-1?addK(p,keys[i]):subK(p,keys[i]));
    assert.deepEqual(reciphered,cipher);
    const decoded=decodedPairs.flatMap(x=>[x%29,Math.floor(x/29)]);
    const plant=controls[0].slice(0,original.length),plantPairs=pairify(plant);
    const enc=plantPairs.map((p,i)=>sign===-1?addK(p,keys[i]):subK(p,keys[i]));
    const rec=enc.map((c,i)=>sign===-1?subK(c,keys[i]):addK(c,keys[i])).flatMap(x=>[x%29,Math.floor(x/29)]);
    assert.deepEqual(rec,plant);
    results.push({factor:name,seedOrder:reverse?"reversed":"forward",sign,ioc:ioc(decoded),trigram:score(decoded,model),prefix:decoded.slice(0,120).map(x=>corpus.translit[x]).join(""),suffix:decoded.slice(-120).map(x=>corpus.translit[x]).join(""),originalRoundtrip:true,nativeGPPlantExact:true});
  }
}
const byTri=results.slice().sort((a,b)=>b.trigram-a.trigram);
const summary={
  sourceHashes:{gridBytesSHA256:gridHash,corpusJSONSHA256:sha(corpusBytes),p36RuneIndicesSHA256:sha(Buffer.from(p36.indices)),outsideP36SHA256:sha(Buffer.from(original))},
  sourceDimensions:{q238Degree:q.length-1,f119Degree:F.length-1,p36Runes:p36.indices.length,p36SeedElements:seed.length,beforeRunes:before.length,afterRunes:after.length,unknownOutsideSeed:original.length,pairCount:cipher.length},
  field:{p3RedTriad:[13,23,2],relation:"u^2 = 3u + 8 mod 29",f119First12AscendingAPlus29B:F.slice(0,12),f119Constant:F[0],conjugateConstant:Fc[0],relativeTraceOfOne:N%MOD},
  model:{equation:"K_n = Tr_GF(841^119)/GF841(S0 * alpha^n)",pairEncoding:"a+29b",seed:"p36's 119 rune pairs as coefficients of S0",clock:"p36 positions n=0..118 excluded; before n=-4353..-1; after n=119..2124",factors:["F119","F119-conjugate"],seedOrders:["forward","reversed"],signs:[-1,1],variants:results.length},
  raw:rawMetrics,referenceWindows,results,bestTrigram:byTri[0],
  candidateRanges:{ioc:[Math.min(...results.map(x=>x.ioc)),Math.max(...results.map(x=>x.ioc))],trigram:[Math.min(...results.map(x=>x.trigram)),Math.max(...results.map(x=>x.trigram))]},
  interpretation:"All eight source-fixed relative-trace additive variants re-encrypt the original and recover an independently planted native-GP control, but all original outputs remain far below native-GP language controls. This retires only this p36-seeded GF841^119 relative-trace additive construction."
};
assert.equal(results.length,8);
console.log(JSON.stringify(summary,null,2));
