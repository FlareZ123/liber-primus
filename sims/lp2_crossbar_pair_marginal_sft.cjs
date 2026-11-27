"use strict";
/** Exact donor-free pair marginal experiment. Node.js 22; no dependencies. */
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(contents,mode="controls"){
  const corpus=JSON.parse(contents[0]), solved=JSON.parse(contents[4]), R=29,R2=841,R3=24389;
  const idx=new Map(corpus.translit.map((x,i)=>[x,i])), rune=new Map(corpus.runes.map((x,i)=>[x,i]));
  const mod=x=>(x+29)%29;
  function encode(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];for(let i=0;i<s.length;i++){const p=s.slice(i,i+2);if(!/[A-Z]/.test(s[i]))continue;if(idx.has(p)){a.push(idx.get(p));i++;}else if(idx.has(s[i]))a.push(idx.get(s[i]));}return a;}
  const counts=[new Float64Array(R),new Float64Array(R2),new Float64Array(R3),new Float64Array(R3*R)];
  const train=[encode(contents[1]),encode(contents[2])];
  for(const a of train)for(let i=0;i<a.length;i++){let v=a[i];counts[0][v]++;if(i>=1){v+=R*a[i-1];counts[1][v]++;}if(i>=2){v+=R2*a[i-2];counts[2][v]++;}if(i>=3){v+=R3*a[i-3];counts[3][v]++;}}
  const q=counts.map((c,k)=>new Float64Array(c.length)), alphas=[.145,.7,2.5,3];
  for(let k=0;k<4;k++)for(let s=0;s<counts[k].length/R;s++){
    let total=0;for(let x=0;x<R;x++)total+=counts[k][s*R+x];
    for(let x=0;x<R;x++)q[k][s*R+x]=(counts[k][s*R+x]+alphas[k]*(k===0?1/R:q[k-1][(s%(q[k-1].length/R))*R+x]))/(total+alphas[k]);
  }
  const sa=new Uint8Array(R3),sb=new Uint8Array(R3),sc=new Uint8Array(R3);
  for(let s=0;s<R3;s++){sa[s]=Math.floor(s/R2);sb[s]=Math.floor(s/R)%R;sc[s]=s%R;}
  function infer(X,Y,truth=null){
    let n=X.length,D=X.map((v,i)=>mod(v-Y[i]));
    if(n<3||Y.length!==n)throw Error("bad pair length");
    const F=[],scale=new Float64Array(n), shifts=[], maps=[];
    for(let t=0;t<n;t++)shifts[t]=Array.from({length:R},(_,v)=>mod(v-D[t]));
    for(let t=3;t<n;t++){let a=new Uint16Array(R3);for(let s=0;s<R3;s++)a[s]=shifts[t-3][sa[s]]*R2+shifts[t-2][sb[s]]*R+shifts[t-1][sc[s]];maps[t]=a;}
    F[2]=new Float64Array(R3);
    for(let s=0;s<R3;s++){const a=sa[s],b=sb[s],c=sc[s],u=shifts[0][a],v=shifts[1][b],w=shifts[2][c];F[2][s]=q[0][a]*q[1][a*R+b]*q[2][s]*q[0][u]*q[1][u*R+v]*q[2][u*R2+v*R+w];}
    function normalize(a){let z=0;for(const v of a)z+=v;for(let i=0;i<a.length;i++)a[i]/=z;return z;}
    scale[2]=normalize(F[2]);let ll=Math.log(scale[2]);const prob=q[3];
    for(let t=3;t<n;t++){const a=F[t-1],b=F[t]=new Float64Array(R3),map=maps[t],sh=shifts[t];for(let s=0;s<R3;s++){let x=a[s],i=s*R,j=map[s]*R,k=(s%R2)*R;for(let d=0;d<R;d++)b[k+d]+=x*prob[i+d]*prob[j+sh[d]];}scale[t]=normalize(b);ll+=Math.log(scale[t]);}
    let beta=new Float64Array(R3).fill(1), post=Array.from({length:n},()=>new Float64Array(R));
    for(let t=n-1;t>=2;t--){
      for(let s=0;s<R3;s++){const m=F[t][s]*beta[s];post[t][sc[s]]+=m;if(t===2){post[0][sa[s]]+=m;post[1][sb[s]]+=m;}}
      if(t===2)break;
      const prev=new Float64Array(R3),map=maps[t],sh=shifts[t];
      for(let s=0;s<R3;s++){let z=0,i=s*R,j=map[s]*R,k=(s%R2)*R;for(let d=0;d<R;d++)z+=prob[i+d]*prob[j+sh[d]]*beta[k+d];prev[s]=z/scale[t];}beta=prev;
    }
    const plain=post.map(a=>{normalize(a);let k=0;for(let j=1;j<R;j++)if(a[j]>a[k])k=j;return k;});
    const key=plain.map((v,i)=>mod(X[i]-v)), second=plain.map((v,i)=>mod(v-D[i]));
    const conf=post.map((a,i)=>a[plain[i]]);
    const entropy=post.reduce((s,a)=>s-a.reduce((h,v)=>h+(v>0?v*Math.log2(v):0),0),0)/n;
    const result={logBF:ll+n*Math.log(R),key,first:plain.map(v=>corpus.translit[v]).join(""),second:second.map(v=>corpus.translit[v]).join(""),meanConfidence:conf.reduce((s,v)=>s+v,0)/n,entropyBits:entropy,confidence90:conf.filter(v=>v>=.9).length};
    if(truth){result.correct=key.filter((v,i)=>v===truth[i]).length;result.correct90=key.filter((v,i)=>v===truth[i]&&conf[i]>=.9).length;}
    if(!plain.every((v,i)=>mod(v+key[i])===X[i]&&mod(second[i]+key[i])===Y[i]))throw Error("reencryption");
    return result;
  }
  const g=encode(contents[3]);let seed=0x32370005;
  function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29;}
  const cases=[];
  for(const [j,name] of ["0_warning","0_welcome","0_wisdom","0_koan_1","0_loss_of_divinity","p57_parable"].entries()){
    const s=solved.sections.find(x=>x.name===name);const a=Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x)).slice(0,45), b=g.slice(2000+1500*j,2045+1500*j);
    if(a.length!==45||b.length!==45)throw Error("short "+name);
    const k=Array.from({length:45},rand),k2=Array.from({length:45},rand);
    const X=a.map((v,i)=>mod(v+k[i])),Y=b.map((v,i)=>mod(v+k[i])),Z=b.map((v,i)=>mod(v+k2[i]));
    const t=X.slice(0,44);
    cases.push({name,shared:infer(t,Y.slice(0,44),k.slice(0,44)),independent:infer(t,Z.slice(0,44)),misregistered:infer(t,Y.slice(1,45))});
  }
  const compact=cases.map(({name,...c})=>({name,...Object.fromEntries(Object.entries(c).map(([k,v])=>[k,Object.fromEntries(Object.entries(v).filter(([z])=>!["key","first","second"].includes(z)))]))}));
  const result={training:train.map(a=>a.length),heldGibran:g.length,controls:compact};
  if(mode==="original"){const X=corpus.pages.find(p=>p.page===0).indices.slice(216,260),Y=corpus.pages.find(p=>p.page===1).indices.slice(222,266);if(X.length!==44||Y.length!==44)throw Error("offset mismatch");result.original=infer(X,Y);}
  return result;
}
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv.includes("--original")?"original":"controls"),null,2));
