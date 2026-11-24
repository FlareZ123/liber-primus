'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(raw,scan){
 const C=JSON.parse(raw[0]),N=JSON.parse(raw[1]),A="0123456789ABCDEFGHIJKLMNOPQRS",d=5,mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0)),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("singular")};
 function inverse(M){const a=M.map((r,i)=>[...r,...Array.from({length:d},(_,j)=>+(i===j))]);for(let j=0;j<d;j++){let k=a.findIndex((r,i)=>i>=j&&r[j]);if(k<0)return null;[a[k],a[j]]=[a[j],a[k]];a[j]=a[j].map(x=>mod(x*inv(a[j][j])));for(let i=0;i<d;i++)if(i!==j){let v=a[i][j];a[i]=a[i].map((x,l)=>mod(x-v*a[j][l]))}}return a.map(r=>r.slice(d))}
 const block=a=>{assert(a.length%d===0,"fringe");return Array.from({length:a.length/d},(_,i)=>a.slice(i*d,i*d+d))};
 const get=(a,b)=>C.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices),gp=N.sections.flatMap(s=>[...s.source_text].map(x=>C.runes.indexOf(x)).filter(x=>x>=0));
 const tok=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),g=[];
 for(const w of(raw[2].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[])){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){g.push(21);i+=3}else if(w.startsWith("IO",i)){g.push(27);i+=2}else{let q=tok.find(v=>w.startsWith(v.s,i));assert(q,"unmapped");g.push(q.i);i+=q.s.length}}}
 const t=g.slice(0,Math.floor(g.length/2)),one=Array(29).fill(.5),two=Array.from({length:29},()=>Array(29).fill(.5));for(let i=0;i<t.length;i++){one[t[i]]++;if(i)two[t[i-1]][t[i]]++}
 const lo=one.map(v=>Math.log(v/(t.length+14.5))),lt=two.map(row=>{let s=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/s))});
 const hist=a=>{let h=Array(29).fill(0);for(let x of a)h[x]++;return h},coll=a=>hist(a).reduce((s,x)=>s+x*(x-1)/2,0),ioc=a=>2*coll(a)/(a.length*(a.length-1));
 const iocMean=a=>({n:a.length,ioc:ioc(a),mean:a.reduce((s,x,i)=>s+(i?lt[a[i-1]][x]:lo[x]),0)/a.length});
 const M=[[0,11,12,24,0],[17,20,0,17,0],[5,20,2,13,21],[21,4,22,19,4],[26,23,26,3,6]],b=[16,15,20,2,17],ivs=[[25,26,13,28,6],[26,7,1,25,14]];
 function encrypt(P,M,b,iv){let I=inverse(M),prev=iv;assert(I,"singular");return P.map(p=>{prev=I.map(a=>dot(a,p.map((x,j)=>mod(x-b[j]+prev[j]))));return prev})}
 function decode(B,M,b){return B.slice(1).map((c,i)=>M.map((a,j)=>mod(dot(a,c)+b[j]-B[i][j])))}
 function fit(B,H,name){
  const n=B.length-1,table=scan(B,name);assert(table.length===5&&table.every(x=>x[1].length===160),"rows");
  const rows=table.map(([max,s],j)=>Array.from({length:32},(_,i)=>{let a=[...s.slice(5*i,5*i+5)].map(x=>A.indexOf(x)),v=B.slice(1).map((c,k)=>mod(dot(a,c)-B[k][j])),ss=coll(v);return {a,v,ss}}));
  rows.forEach((r,j)=>{assert(r[0].ss===table[j][0],"scan max mismatch");assert(r.every((x,i)=>!i||x.ss<=r[i-1].ss),"sort")});
  const labels=rows.map(r=>r.flatMap(({a,v})=>{let h=hist(v);return Array.from({length:29},(_,b)=>({a,b,score:h.reduce((s,x,k)=>s+x*lo[(k+b)%29],0),p:v.map(x=>(x+b)%29)})).sort((x,y)=>y.score-x.score).slice(0,4)}).sort((a,b)=>b.score-a.score).slice(0,16));
  const W=Array.from({length:5},(_,j)=>labels[j].map(x=>labels[(j+1)%5].map(y=>x.p.reduce((s,v,i)=>s+(j===4?(i+1<n?lt[v][y.p[i+1]]:0):lt[v][y.p[i]]),0))));
  let best=null;
  for(let first=0;first<16;first++){
   let states=Array.from({length:16},(_,i)=>({s:i===first?lo[labels[0][i].p[0]]:-Infinity,ids:[i]}));
   for(let j=0;j<4;j++)states=Array.from({length:16},(_,k)=>states.reduce((best,x,i)=>{let s=x.s+W[j][i][k];return s>best.s?{s,ids:[...x.ids,k]}:best},{s:-Infinity,ids:[]}));
   for(let k=0;k<16;k++){let s=states[k].s+W[4][k][first];if(!best||s>best.s)best={s,ids:states[k].ids}}
  }
  const key=best.ids.map((i,j)=>labels[j][i]),M=key.map(x=>x.a),b=key.map(x=>x.b),P=decode(B,M,b),Q=decode(H,M,b),I=inverse(M);
  if(I){assert(encrypt(P,M,b,B[0]).flat().join(",")===B.slice(1).flat().join(","),"train replay");assert(encrypt(Q,M,b,H[0]).flat().join(",")===H.slice(1).flat().join(","),"holdout replay")}
  const pooledUpper=(2*d*rows.reduce((s,x)=>s+x[0].ss,0)+d*(d-1)*n)/(d*n*(d*n-1));assert(ioc(P.flat())<=pooledUpper,"bound");
  return {rowsPerLane:29**5-1,topRows:rows.map(x=>({a:x[0].a,pairs:x[0].ss})),pooledUpper,key:{M,b},invertible:!!I,train:iocMean(P.flat()),holdout:iocMean(Q.flat()),preview:Q.flat().slice(0,90).map(x=>C.translit[x]).join(" "),P:P.flat(),Q:Q.flat()}
 }
 const original=fit(block(get(33,39)),block(get(3,7)),"original");
 const P=block(gp.slice(0,1680)),Q=block(gp.slice(1680,2825)),plant=fit(encrypt(P,M,b,ivs[0]),encrypt(Q,M,b,ivs[1]),"plant");
 const result={original,plant:{...plant,trueKey:{M,b,ivs},trainExact:plant.P.filter((x,i)=>x===P.slice(1).flat()[i]).length,holdoutExact:plant.Q.filter((x,i)=>x===Q.slice(1).flat()[i]).length}};
 for(const x of Object.values(result)){delete x.P;delete x.Q}return result;
};
const A='0123456789ABCDEFGHIJKLMNOPQRS';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-cbc5-'));
try {
const bin=path.join(dir,process.platform==='win32'?'scan.exe':'scan');
execFileSync(process.env.CXX||'g++',['-std=c++17','-O3','-fopenmp',path.join(__dirname,'lp2_dense_affine5_cbc_scan.cpp'),'-o',bin]);
const scan=(B)=>{const s=execFileSync(bin,[],{input:B.flat().map(x=>A[x]).join('')+'\n',encoding:'utf8',env:{...process.env,OMP_NUM_THREADS:process.env.OMP_NUM_THREADS||'4'}}).trim().split('\n').map(x=>x.trim().split(/\s+/).map(Number));const out=[];for(let i=0;i<s.length;i+=33){const [j,n,count]=s[i];if(n!==B.length-1||count!==29**5-1)throw Error('scan incomplete');const a=s.slice(i+1,i+33);out[j]=[a[0][0],a.map(x=>x.slice(1).map(v=>A[v]).join('')).join('')]}return out};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),scan),null,2));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
