"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-ink-annotations.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt"
];
const shas=[
  "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
  "0614aca67969a14ae006e0c1ae6aee6dcd8136e6",
  "1b064ef6d85819b7d96adaff31a82d1ec551598f",
  "a92be8ba5b3511a003a22ba31523c14397aaa83a",
  "df260a07d56bf5998d40a6360b6132c35c252d10",
  "94c677ad9dd50771c6670e0c4e4dad9052b46d85"
];
const inputs=paths.map((p,i)=>{const b=fs.readFileSync(p);const sha=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");assert.equal(sha,shas[i],p);return b.toString("utf8")});
function research(inputs){
 const Q=29,M=Q*Q,mod=x=>(x+58)%Q;
 const corpus=JSON.parse(inputs[0]), ink=JSON.parse(inputs[1]), ref=JSON.parse(inputs[2]);
 const ids=new Map(corpus.runes.map((r,i)=>[r,i]));
 const letters=corpus.translit;const literal=s=>[...s].filter(x=>ids.has(x)).map(x=>ids.get(x));
 const native=ref.sections.map(s=>({name:s.name,seq:literal(s.source_text)}));
 for(const o of [279,142]){const k=native[3].seq;if(k[o]!==24||k[o+1]!==16)throw Error("KOAN correction mismatch "+o+" "+k.slice(o,o+2));k.splice(o,2,3)}
 const mapping=new Map(letters.map((x,i)=>[x,i]));mapping.set("K",5);mapping.set("Q",5);mapping.set("V",1);mapping.set("Z",15);mapping.set("ING",21);mapping.set("IO",27);
 function gp(s){let out=[];for(const w of s.toUpperCase().match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){let k=w.slice(i,i+3);if(k==="ING"){out.push(21);i+=3;continue}k=w.slice(i,i+2);if(k.length===2&&mapping.has(k)){out.push(mapping.get(k));i+=2;continue}out.push(mapping.get(w[i]));i++}}if(out.some(x=>x===undefined))throw Error("unmapped");return out}
 const em=gp(inputs[3].split("I. HISTORY.").slice(1).join("I. HISTORY.").split("*** END OF")[0]);
 const gib=gp(inputs[4].split("THE PROPHET").slice(2).join("THE PROPHET").split("*** END OF")[0]);
 const shk=gp(inputs[5]);
 const train=native.filter((_,i)=>i!==3&&i!==4).map(s=>s.seq);
 const uni=new Float64Array(Q),bi=new Float64Array(M),tri=new Float64Array(Q*M);
 function add(s,w){for(let i=0;i<s.length;i++){uni[s[i]]+=w;if(i)bi[s[i-1]*Q+s[i]]+=w;if(i>1)tri[(s[i-2]*Q+s[i-1])*Q+s[i]]+=w}}
 add(em,1);for(const s of train)add(s,32);
 const pu=Float64Array.from(uni,x=>(x+0.5)/(uni.reduce((a,b)=>a+b,0)+Q*.5));
 const pb=new Float64Array(M),pt=new Float64Array(M*Q);
 for(let a=0;a<Q;a++){let z=0;for(let b=0;b<Q;b++)z+=bi[a*Q+b];for(let b=0;b<Q;b++)pb[a*Q+b]=(bi[a*Q+b]+12*pu[b])/(z+12)}
 for(let ab=0;ab<M;ab++){let z=0;for(let c=0;c<Q;c++)z+=tri[ab*Q+c];for(let c=0;c<Q;c++)pt[ab*Q+c]=(tri[ab*Q+c]+20*pb[(ab%Q)*Q+c])/(z+20)}
 const lu=Float64Array.from(pu,Math.log),lb=Float64Array.from(pb,Math.log),lt=Float64Array.from(pt,Math.log);
 function score(s){let z=lu[s[0]]+lb[s[0]*Q+s[1]];for(let i=2;i<s.length;i++)z+=lt[(s[i-2]*Q+s[i-1])*Q+s[i]];return z}
 function solve(d){
  const n=d.length,back=new Uint8Array(n*M);let v=new Float64Array(M),f=new Float64Array(M),v2=new Float64Array(M),f2=new Float64Array(M);
  let logz=0;
  const Y=d.map(x=>Array.from({length:Q},(_,a)=>mod(a-x)));
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){let A=Y[0][a],B=Y[1][b],i=a*Q+b;v[i]=lu[a]+lu[A]+lb[i]+lb[A*Q+B];f[i]=Math.exp(v[i])}
  function norm(){let z=f.reduce((a,b)=>a+b,0);for(let i=0;i<M;i++)f[i]/=z;logz+=Math.log(z)}
  norm();
  for(let i=2;i<n;i++){
   v2.fill(-Infinity);f2.fill(0);const A=Y[i-2],B=Y[i-1],C=Y[i];
   for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const ab=a*Q+b,base=ab*Q,base2=(A[a]*Q+B[b])*Q,off=b*Q,va=v[ab],fa=f[ab];for(let c=0;c<Q;c++){const bc=off+c,t=base+c,t2=base2+C[c],w=lt[t]+lt[t2],cand=va+w;f2[bc]+=fa*pt[t]*pt[t2];if(cand>v2[bc]){v2[bc]=cand;back[i*M+bc]=a}}}
   [v,v2]=[v2,v];[f,f2]=[f2,f];norm()
  }
  let j=0;for(let i=1;i<M;i++)if(v[i]>v[j])j=i;
  const best=v[j],x=new Array(n);x[n-2]=Math.floor(j/Q);x[n-1]=j%Q;
  for(let i=n-1;i>=2;i--)x[i-2]=back[i*M+x[i-1]*Q+x[i]];
  const y=x.map((a,i)=>Y[i][a]);if(Math.abs(score(x)+score(y)-best)>1e-7)throw Error("backtrack");
  return {x,y,bestPerRune:best/n,logBF:(logz+n*Math.log(Q))/n,negativeLogPosterior:logz-best,posteriorBits:(logz-best)/Math.LN2}
 }
 const text=s=>s.map(x=>letters[x]).join("");
 const eq=(a,b)=>a.reduce((z,x,i)=>z+(x===b[i]),0);
 let state=0x32822207;const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};const pad=n=>Array.from({length:n},()=>{let x;do{x=rng()}while(x>=Math.floor(2**32/Q)*Q);return x%Q});
 const encrypt=(p,k)=>p.map((v,i)=>mod(v+k[i]));
 const a=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13),b=corpus.pages.slice(23,27).flatMap(p=>p.indices).slice(16);
 if(ink.pages.find(p=>p.page===0).red_spans[0].length!==13||ink.pages.find(p=>p.page===23).red_spans[0].length!==16||!ink.pages.find(p=>p.page===2).large_punctuation.some(x=>x[0]===201&&x[1]===13)||!ink.pages.find(p=>p.page===26).large_punctuation.some(x=>x[0]===265&&x[1]===13))throw Error("frame changed");
 const n=a.length;if(n!==716||b.length!==1005)throw Error("length");
 let results=[];
 function test(name,p,q,kind){const k=pad(n),k2=kind==="independent"?pad(n):k;let c=encrypt(p,k),e=encrypt(q,k2);if(kind==="misaligned")e=e.slice(1).concat(e[0]);const d=c.map((x,i)=>mod(x-e[i]));const z=solve(d);const key=c.map((x,i)=>mod(x-z.x[i]));if(eq(encrypt(z.y,key),e)!==n)throw Error("reencryption");results.push({name,kind,correct:eq(z.x,p),correct2:eq(z.y,q),keyCorrect:eq(key,k),trueScore:(score(p)+score(q))/n,logBF:z.logBF,bestPerRune:z.bestPerRune,posteriorBits:z.posteriorBits,first1:text(z.x.slice(0,80)),first2:text(z.y.slice(0,80))})}
 const p=native[3].seq.slice(0,n),q=native[4].seq.slice(0,n);
 test("native-koan/divinity",p,q,"shared");test("native-koan/divinity",p,q,"independent");test("native-koan/divinity",p,q,"misaligned");
 for(let i=0;i<4;i++){const p=gib.slice(4000+i*n,4000+(i+1)*n),q=shk.slice(8000+i*n,8000+(i+1)*n);if(p.length!==n||q.length!==n)throw Error("donor too short");test("literary-"+i,p,q,"shared");test("literary-"+i,p,q,"independent")}
 const shared=results.filter(x=>x.kind==="shared"),rivals=results.filter(x=>x.kind!=="shared");const useful=shared.every(x=>Math.min(x.correct,x.correct2)>=n*.70)&&Math.min(...shared.map(x=>x.logBF))>Math.max(...rivals.map(x=>x.logBF));
 // Original scoring is diagnostic only if the blind recovery gate fails; never assert prose.
 const orig=solve(a.map((x,i)=>mod(x-b[i])));const key=a.map((x,i)=>mod(x-orig.x[i]));
 if(eq(encrypt(orig.y,key),b.slice(0,n))!==n||eq(encrypt(orig.x,key),a)!==n)throw Error("original replay");
 return {lengths:{a:a.length,b:b.length,trainingEmerson:em.length,trainingNative:train.reduce((z,s)=>z+s.length,0)},results,useful,original:{x:orig.x,y:orig.y,key,tail:b.slice(n),logBF:orig.logBF,bestPerRune:orig.bestPerRune,posteriorBits:orig.posteriorBits,render1:text(orig.x),render2:text(orig.y),replayed:n*2}};
}
console.log(JSON.stringify(research(inputs),null,2));
