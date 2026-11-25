"use strict";
/** Exact increment-state row permutation and separable GP29 Fourier capacity. Read-only. */
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
function main(files){
  const gp=JSON.parse(files[0]), pages=gp.pages.slice(0,56), C=pages.flatMap(p=>p.indices), N=29, n=C.length;
  if(n!==12956||pages.length!==56||pages[50].indices.length!==0)throw Error("source length");
  const ends=[2,7,14,22,26,32,39,53,55],ch=ends.map((e,i)=>pages.filter(p=>p.page>(i?ends[i-1]:-1)&&p.page<=e).flatMap(p=>p.indices));
  const scopes={continuous:[C],chapter:ch,page:pages.map(p=>p.indices).filter(a=>a.length)};
  const mod=x=>(x%N+N)%N;
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function enc(w){let t=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),a=[];for(let i=0;i<t.length;){if(t.startsWith("ING",i)){a.push(21);i+=3}else if(t.startsWith("IO",i)){a.push(27);i+=2}else{let q=tokens.find(x=>t.startsWith(x.s,i));if(!q)throw Error(t);a.push(q.i);i+=q.s.length}}return a}
  for(const [w,z] of [["FOLLOWING","ᚠᚩᛚᛚᚩᚹᛝ"],["THINGS","ᚦᛝᛋ"],["FUNCTION","ᚠᚢᚾᚳᛏᛡᚾ"],["QUESTION","ᚳᚹᛖᛋᛏᛡᚾ"]])if(enc(w).map(i=>gp.runes[i]).join("")!==z)throw Error("native encoding");
  const donors=files.slice(1).map(x=>x.toUpperCase().match(/[A-Z]+/g).flatMap(enc));
  function hist(a,q,hold=false,priv=false){
    if(hold&&q!==1)throw Error("unknown consuming phase is not covered");
    const rows=q*N*(priv?a.length:1),H=new Float64Array(rows*N);let free=0,used=0;
    for(const [s,v] of a.entries())for(let i=0;i<v.length;i++){
      if(i<2||(hold&&(v[i]===0||v[i-1]===0||v[i-2]===0))){free++;continue}
      const x=mod(v[i-1]-v[i-2]),d=mod(v[i]-v[i-1]);
      H[(((priv?s*q*N:0)+(i%q)*N+x)*N)+d]++;used++;
    }
    return {H,free,used,rows};
  }
  function rowBound(h){
    const {H,rows,free}=h,u=new Int32Array(N);
    for(let i=0;i<rows;i++){const v=Array.from(H.slice(i*N,(i+1)*N)).sort((a,b)=>b-a);for(let j=0;j<N;j++)u[j]+=v[j]}
    let a=free;return Array.from(u,x=>a+=x);
  }
  /** Integer kth root, rounded down. */
  function root(x,k){if(x<0n)throw Error("negative root");let a=0n,b=1n,p=BigInt(k);while(b**p<=x)b*=2n;while(a+1n<b){let z=(a+b)>>1n;if(z**p<=x)a=z;else b=z}return a}
  /**
   * H[r,s,d] -> G=H*H^* in Z[z]/(z^29-1);
   * T=G^2. Parseval gives exact sum_{t=1}^{28} trace(G_t^4).
   * Holder bounds sum_t ||H_t||_2^2. Integer root rounds conservatively.
   */
  function fourier(h,q){
    const {H,free,used,rows}=h;if(rows!==q*N)throw Error("shared rows required");
    const G=new Float64Array(q*q*N),T=new Float64Array(q*q*N);
    for(let r=0;r<q;r++)for(let s=0;s<q;s++)for(let j=0;j<N;j++){
      let ri=(r*N+j)*N,si=(s*N+j)*N,gi=(r*q+s)*N;
      for(let d=0;d<N;d++){let a=H[ri+d];if(!a)continue;for(let e=0;e<N;e++){let z=H[si+e];if(z)G[gi+mod(d-e)]+=a*z}}
    }
    if(!G.every(Number.isSafeInteger))throw Error("unsafe G");
    for(let r=0;r<q;r++)for(let s=0;s<q;s++)for(let j=0;j<q;j++){
      let ri=(r*q+j)*N,si=(j*q+s)*N,ti=(r*q+s)*N;
      for(let d=0;d<N;d++){let a=G[ri+d];if(!a)continue;for(let e=0;e<N;e++){let z=G[si+e];if(z)T[ti+(d+e)%N]+=a*z}}
    }
    let eAll=0n,e0=0n,maxT=0;for(let i=0;i<q*q;i++){let sum=0n;for(let j=0;j<N;j++){const v=T[i*N+j];if(!Number.isSafeInteger(v))throw Error("unsafe T");maxT=Math.max(maxT,v);let z=BigInt(v);sum+=z;eAll+=z*z}e0+=sum*sum}
    const Z=29n*eAll-e0,W=28n**3n*Z,fl=root(W,4),S=fl**4n===W?fl:fl+1n;
    const bounds=Array.from({length:N},(_,i)=>{let k=BigInt(i+1);return Math.min(used+free,free+Number((k*BigInt(used)+root(k*(29n-k)*BigInt(q*N)*S,2))/29n))});
    return {Z:String(Z),S:String(S),maxT,bounds};
  }
  const models=[];
  for(const [scope,a] of Object.entries(scopes))for(const q of [1,8,13,29]){
    for(const priv of scope==="continuous"?[false]:[false,true]){
      const h=hist(a,q,false,priv);models.push({scope,q,priv,hold:false,kind:"rows",free:h.free,bounds:rowBound(h)});
      if(q===1){const z=hist(a,q,true,priv);models.push({scope,q,priv,hold:true,kind:"rows",free:z.free,bounds:rowBound(z)})}
    }
    if(q!==1){const h=hist(a,q);models.push({scope,q,priv:false,hold:false,kind:"separable",free:h.free,...fourier(h,q)})}
  }
  for(const m of models){m.pass=[];m.minDeficit=[];m.maxDeficit=[]}
  const donorStats=[];
  for(const d of donors){
    const cnt=new Int32Array(N),pass=new Int32Array(models.length),min=new Int32Array(models.length).fill(n),max=new Int32Array(models.length),floor=new Int32Array(N).fill(n);
    for(let i=0;i<d.length;i++){cnt[d[i]]++;if(i>=n)cnt[d[i-n]]--;if(i<n-1)continue;let a=0,s=Array.from(cnt).sort((a,b)=>b-a).map(x=>a+=x);
      for(let k=0;k<N;k++)floor[k]=Math.min(floor[k],s[k]);
      for(let j=0;j<models.length;j++){let df=0;for(let k=0;k<N;k++)df=Math.max(df,s[k]-models[j].bounds[k]);if(df===0)pass[j]++;min[j]=Math.min(min[j],df);max[j]=Math.max(max[j],df)}
    }
    for(const [j,m] of models.entries()){m.pass.push(pass[j]);m.minDeficit.push(min[j]);m.maxDeficit.push(max[j])}
    donorStats.push({length:d.length,windows:d.length-n+1,floor:Array.from(floor)});
  }
  let seed=33014225;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
  function perm(){let v=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>0;i--){let j=rng()%(i+1);[v[i],v[j]]=[v[j],v[i]]}return v}
  function plainMass(p){let h=new Int32Array(N);for(const x of p)h[x]++;let a=0;return Array.from(h).sort((a,b)=>b-a).map(x=>a+=x)}
  const controls=[];
  for(const [id,scope,q,hold,priv,kind] of [
    [0,"continuous",1,false,false,"rows"],[1,"chapter",13,false,false,"rows"],[2,"page",29,false,false,"rows"],
    [3,"chapter",1,true,true,"rows"],[4,"continuous",29,false,false,"separable"],[5,"chapter",29,false,false,"separable"],
    [6,"page",29,false,false,"separable"],[7,"chapter",13,false,false,"separable"]
  ]){
    const P=donors[id%3].slice(1000+id*1771,1000+id*1771+n),mass=plainMass(P),S=perm(),A=Array.from({length:q},()=>rng()%N),B=Array.from({length:N},()=>rng()%N),tables=new Map;
    const map=(s,r,d)=>{if(kind==="separable")return S.map(x=>mod(x+A[r]+B[d]));const k=(priv?s*q*N:0)+r*N+d;if(!tables.has(k))tables.set(k,perm());return tables.get(k)};
    let offset=0,recovered=0,holds=0,consumingZero=0;const plant=[];
    for(const [s,a] of scopes[scope].entries()){
      const p=P.slice(offset,offset+a.length);offset+=a.length;const c=[],mask=[];let last=rng()%N,prev=rng()%N,j=0,iv=[last,prev];
      for(const x of p){if(hold&&x===0){c.push(0);mask.push(true);holds++;continue}const d=map(s,j%q,prev)[x],y=mod(last+d);c.push(y);mask.push(false);if(y===0)consumingZero++;last=y;prev=d;j++}
      [last,prev]=iv;j=0;
      for(let i=0;i<c.length;i++){let x;if(mask[i])x=0;else{const d=mod(c[i]-last);x=map(s,j%q,prev).indexOf(d);last=c[i];prev=d;j++}if(x!==p[i])throw Error("known-key inverse");recovered++}
      plant.push(c);
    }
    if(offset!==n||recovered!==n)throw Error("plant length");
    const h=hist(plant,q,hold,priv),b=kind==="rows"?rowBound(h):fourier(h,q).bounds;
    if(mass.some((v,k)=>v>b[k]))throw Error("true model failed bound");
    controls.push({id,scope,q,hold,priv,kind,recovered,holds,consumingZero,passes:true});
  }
  return {n,chapterLengths:ch.map(a=>a.length),donorStats,models,controls};
}
console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.join(ROOT,p),"utf8"))),null,2));
