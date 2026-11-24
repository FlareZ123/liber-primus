'use strict';
// Five independent lane plaintext-autokeys, ordinary and transparent F.
// Run from repository root: node sims/lp2_p7_fivedot_lane_autokey_exact_sft.cjs
const fs=require('node:fs');
function experiment(data,g,donors){
 const A=29,Q=[2,4,0,3,1],K=[11,26,8,15,2],m=x=>(x+29)%29,N=1729,B=1124,V=1414;
 const C=data.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);if(C.length!==N)throw Error("size");
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function split(x){let z=x.slice();z.splice(692,0,-1);return Array.from({length:5},(_,i)=>z.slice(346*i,346*(i+1)).filter(v=>v>=0))}
 function unweave(p){const x=Array.from({length:5},()=>[]);for(let i=0;i<N;i++)x[Q[(i+1)%5]].push(p[i]);return x}
 function weave(lanes){const j=Array(5).fill(0);return Array.from({length:N},(_,i)=>{const k=Q[(i+1)%5];return lanes[k][j[k]++]})}
 function enc(p,k,hold=false){return p.map(x=>{if(hold&&x===0)return 0;const c=m(x+k);k=x;return c})}
 function dec(c,k){return c.map(x=>{const p=m(x-k);k=p;return p})}
 function reach(c,k){let s=new Set([k]),peak=1;for(let i=0;i<c.length;i++){const t=new Set();for(const p of s){if(c[i]===0)t.add(p);const x=m(c[i]-p);if(x!==0)t.add(x)}if(!t.size)return {dead:i,peak};s=t;peak=Math.max(peak,s.size)}return {dead:null,peak}}
 const ix=new Map(g.runes.map((x,i)=>[x,i])),S=g.sections.map(s=>Array.from(s.source_text).filter(x=>ix.has(x)).map(x=>ix.get(x)));
 const u=new Float64Array(A).fill(.5),b=new Float64Array(A*A),bt=new Float64Array(A),t=new Float64Array(A**3),tt=new Float64Array(A*A);
 for(let h=0;h<S.length;h++){if(h===1||h===5)continue;S[h].forEach((x,j,p)=>{u[x]++;if(j){let y=p[j-1];b[y*A+x]++;bt[y]++;if(j>1){let a=p[j-2]*A+y;t[a*A+x]++;tt[a]++}}})}
 const n=u.reduce((a,b)=>a+b,0),log=new Float64Array(A**3);for(let x=0;x<A;x++)for(let y=0;y<A;y++)for(let z=0;z<A;z++){const a=x*A+y,p1=u[z]/n,p2=(b[y*A+z]+4*p1)/(bt[y]+4);log[a*A+z]=Math.log((t[a*A+z]+8*p2)/(tt[a]+8))}
 function score(p){let ll=0;const h=new Uint32Array(A);p.forEach((x,i)=>{h[x]++;if(i>=2)ll+=log[(p[i-2]*A+p[i-1])*A+x]});return {tri:ll/(p.length-2),ioc:h.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1))}}
 const tokens=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){let p=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const a=tokens.find(a=>w.startsWith(a.s));if(!a)throw Error(w);p.push(a.i);w=w.slice(a.s.length)}}return p}
 function fit(L){
  const by=Q.map(k=>Array.from({length:A},(_,s)=>dec(L[k],s)));
  const idx=Array.from({length:N},(_,i)=>{const j=(i+1)%5,r=Math.floor((i+1)/5);return r-(j===0?1:0)});
  const T=Array.from({length:5},()=>new Float64Array(A**3));
  for(let i=0;i<B-2;i++){
   const j=(i+1)%5, j1=(j+1)%5,j2=(j+2)%5,v=T[j],p=idx[i],q=idx[i+1],r=idx[i+2];
   for(let a=0;a<A;a++){const va=by[j][a][p];for(let b=0;b<A;b++){const vb=by[j1][b][q],off=(a*A+b)*A,base=(va*A+vb)*A;for(let c=0;c<A;c++)v[off+c]+=log[base+by[j2][c][r]]}}
  }
  let best=-Infinity,second=-Infinity,key=null;
  for(let a=0;a<A;a++)for(let b=0;b<A;b++)for(let c=0;c<A;c++)for(let d=0;d<A;d++){
    const z=T[0][(a*A+b)*A+c]+T[1][(b*A+c)*A+d],cd=(c*A+d)*A;
    for(let e=0;e<A;e++){const f=z+T[2][cd+e]+T[3][(d*A+e)*A+a]+T[4][(e*A+a)*A+b];if(f>best){second=best;best=f;key=[a,b,c,d,e]}else if(f>second)second=f}
  }
  const phys=Array(5);key.forEach((x,j)=>phys[Q[j]]=x);const P=weave(L.map((l,i)=>dec(l,phys[i])));if(!eq(unweave(P).map((l,i)=>enc(l,phys[i])),L))throw Error("replay");
  const train=score(P.slice(0,B));if(Math.abs(train.tri*(B-2)-best)>1e-7)throw Error("factorization");
  return {key:phys,margin:best-second,train,validation:score(P.slice(B,V)),holdout:score(P.slice(V)),P};
 }
 let seed=0x5ac139af;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function test(name,L,p=null,k=null){const f=fit(L),P=f.P;delete f.P;return {name,...f,expected:k,keyExact:k?eq(k,f.key):null,heldoutExact:p?P.slice(V).filter((x,i)=>x===p[i+V]).length:null,preview:name==="original"?P.slice(0,100).map(x=>g.runes[x]).join(""):null,plaintext:name==="original"?P.map(x=>g.runes[x]).join(""):null}}
 const tests=[],holdControls=[];
 for(let i=0;i<2;i++){const p=native(donors[i]).slice(10000+2000*i,10000+2000*i+N);if(p.length!==N)throw Error("donor");const k=Array.from({length:5},()=>rand()%A),L=unweave(p);tests.push(test("plant"+i,L.map((l,j)=>enc(l,k[j])),p,k));holdControls.push(L.map((l,j)=>reach(enc(l,k[j],true),k[j])));tests.push(test("pad"+i,L.map(l=>l.map(x=>m(x+rand()%A)))))}
 if(!tests.filter(x=>x.name.startsWith("plant")).every(x=>x.keyExact&&x.heldoutExact===N-V)||holdControls.some(l=>l.some(x=>x.dead!==null)))throw Error("control failure");
 const L=split(C);if(!eq(unweave(weave(L)),L))throw Error("geometry");const originalHold=L.map((l,i)=>{const all=Array.from({length:A},(_,k)=>reach(l,k));return {lane:i,n:l.length,sourceSeed:K[i],sourceDead:all[K[i]].dead,allSeedSurvivors:all.filter(x=>x.dead===null).length,lastDead:Math.max(...all.filter(x=>x.dead!==null).map(x=>x.dead)),all}});
 const known=weave(L.map((l,i)=>dec(l,K[i])));tests.push(test("original",L));
 return {N,split:[B,V-B,N-V],sourceKey:K,known:score(known),originalHold,holdControls,tests,search:A**5,trainingFactors:5*A**3};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
const inputs=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(inputs[0]),JSON.parse(inputs[1]),inputs.slice(2)),null,2));
