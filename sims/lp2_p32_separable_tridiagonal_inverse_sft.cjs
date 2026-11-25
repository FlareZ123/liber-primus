'use strict';
// Source-motivated p32 separable GF29 zero-boundary filter; exact all-key lexical anchor inverse.
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/beowulf_oe_gp_profile_corrected.json"];
function experiment(raw, mode="all") {
 const [ct,tx,lex,nat,oeRaw]=raw, c=JSON.parse(ct),native=JSON.parse(nat),oe=JSON.parse(oeRaw);
 const Q=29,N=11,mod=x=>((x%Q)+Q)%Q,inv=Array.from({length:Q},(_,i)=>{for(let j=1;j<Q;j++)if(i*j%Q===1)return j;return 0});
 const key=a=>String.fromCharCode(...a),read=s=>(s.replace(/[/\r\n]/g,"").match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>c.runes.indexOf(x)));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a}
 const dict=Array.from({length:30},()=>new Map()),add=a=>{if(a.length<30)dict[a.length].set(key(a),a)};
 for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+[1-9]\d*$/i);if(m)add(gp(m[1]))}
 for(const s of native.sections)for(const w of read(s.source_text))add(w);
 const oeWords=[];let oi=0;for(const n of oe.allSourceGpWordLengths){const a=[...oe.sourceGpBase29.slice(oi,oi+n)].map(x=>oe.positiveControlAlphabet.indexOf(x));if(a.length!==n||a.some(x=>x<0||x>=Q))throw Error("OE fixture");oi+=n;oeWords.push(a);add(a)}if(oi!==oe.sourceGpBase29.length)throw Error("OE length");
 const spans=words=>{let t=0;return words.map(w=>{let a=t;t+=w.length;return[a,t]})};
 const src=read(tx.split("%")[32]),C=src.flat(),S=spans(src);if(C.length!==121||C.some((x,i)=>x!==c.pages[32].indices[i]))throw Error("p32 mismatch");
 const anchors=S.map(([a,b],i)=>b-a>=8?i:-1).filter(i=>i>=0);
 if(anchors.join(",")!=="3,7,9,11,13,15,19")throw Error("p32 anchor set");
 const counts=new Float64Array(Q*Q).fill(.3),rowCounts=new Float64Array(Q).fill(8.7);
 function train(a){for(let i=1;i<a.length;i++){counts[a[i-1]*Q+a[i]]++;rowCounts[a[i-1]]++}}
 for(const s of native.sections.filter(s=>s.name!=="0_loss_of_divinity"))train(read(s.source_text).flat());
 train(oeWords.flat().slice(0,oe.trainingPrefixGpRunes));
 const log=Array.from(counts,(x,i)=>Math.log(x/rowCounts[Math.floor(i/Q)]));
 const pack=k=>k[0]*Q*Q+k[1]*Q+k[2],unpack=z=>[Math.floor(z/(Q*Q)),Math.floor(z/Q)%Q,z%Q];
 function det(k){let d0=1,d1=k[1];for(let i=2;i<=N;i++){const d=mod(k[1]*d1-k[0]*k[2]*d0);d0=d1;d1=d}return d1}
 function tri(k){return Array.from({length:N},(_,r)=>Array.from({length:N},(_,j)=>j===r-1?k[0]:j===r?k[1]:j===r+1?k[2]:0))}
 function invert(M){const n=M.length,A=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>+(i===j))]);for(let j=0;j<n;j++){let p=j;while(p<n&&!A[p][j])p++;if(p===n)return null;[A[p],A[j]]=[A[j],A[p]];const u=inv[A[j][j]];for(let z=j;z<2*n;z++)A[j][z]=A[j][z]*u%Q;for(let i=0;i<n;i++)if(i!==j&&A[i][j]){const v=A[i][j];for(let z=j;z<2*n;z++)A[i][z]=mod(A[i][z]-v*A[j][z])}}return A.map(r=>r.slice(n))}
 function left(M,X){const Y=new Uint8Array(N*N);for(let i=0;i<N;i++)for(let j=0;j<N;j++){let s=0;for(let k=0;k<N;k++)s+=M[i][k]*X[k*N+j];Y[i*N+j]=s%Q}return Y}
 function row(M,X){const Y=new Uint8Array(N*N);for(let i=0;i<N;i++)for(let j=0;j<N;j++){let s=0;for(let k=0;k<N;k++)s+=M[j][k]*X[i*N+k];Y[i*N+j]=s%Q}return Y}
 function enc(P,A,B){return Array.from(row(tri(B),left(tri(A),P)))}
 const Akeys=[];for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let d=0;d<Q;d++){const k=[a,b,d],first=k.find(x=>x!==0);if(first!==1||!det(k))continue;const M=invert(tri(k));if(!M)throw Error("det mismatch");Akeys.push({k,M})}
 const Bvalid=new Uint8Array(Q**3),Binv=new Map();for(let z=0;z<Q**3;z++)Bvalid[z]=+(det(unpack(z))!==0);
 function getBinv(z){if(!Binv.has(z)){const M=invert(tri(unpack(z)));if(!M)throw Error("B determinant mismatch");Binv.set(z,M)}return Binv.get(z)}
 function inverse3(a,b,d){const [x,y,z]=a,[u,v,w]=b,[g,h,j]=d, t=mod(x*(v*j-w*h)-y*(u*j-w*g)+z*(u*h-v*g));if(!t)return null;const f=inv[t];return [v*j-w*h,z*h-y*j,y*w-z*v,w*g-u*j,x*j-z*g,z*u-x*w,u*h-v*g,y*g-x*h,x*v-y*u].map(s=>mod(f*s))}
 function prepare([start,end]){
  const positions=[];for(let i=start;i<end;i++){const l=i%N===0?-1:i-1,r=i%N===N-1?-1:i+1;if((l<0||l>=start)&&(r<0||r<end))positions.push([i,l,r])}
  const at=positions.map(p=>p[0]),full=[],def=[];
  for(const w of dict[end-start].values()){
   const R=positions.map(([i,l,r])=>[l<0?0:w[l-start],w[i-start],r<0?0:w[r-start]]);
   let piv=null,M=null;
   search:for(let a=0;a<R.length;a++)for(let b=a+1;b<R.length;b++)for(let d=b+1;d<R.length;d++){const m=inverse3(R[a],R[b],R[d]);if(m){piv=[a,b,d];M=m;break search}}
   if(M){const other=[];for(let i=0;i<R.length;i++)if(!piv.includes(i))other.push(at[i],...R[i]);full.push({idx:piv.map(i=>at[i]),M,other})}
   else def.push(R);
  }
  return{at,full,def};
 }
 function enumerateDef(R,at,D,out){
  const M=R.map((r,i)=>[...r,D[at[i]]]),piv=[];let j=0;
  for(let col=0;col<3;col++){let p=j;while(p<M.length&&!M[p][col])p++;if(p===M.length)continue;[M[p],M[j]]=[M[j],M[p]];const u=inv[M[j][col]];for(let i=col;i<4;i++)M[j][i]=M[j][i]*u%Q;for(let i=0;i<M.length;i++)if(i!==j&&M[i][col]){const v=M[i][col];for(let k=col;k<4;k++)M[i][k]=mod(M[i][k]-v*M[j][k])}piv.push(col);j++}
  for(let i=j;i<M.length;i++)if(M[i][3])return;
  const free=[0,1,2].filter(x=>!piv.includes(x)),v=[0,0,0];
  function loop(i){if(i===free.length){for(let t=0;t<piv.length;t++){let x=M[t][3];for(const f of free)x-=M[t][f]*v[f];v[piv[t]]=mod(x)}const z=pack(v);if(Bvalid[z])out.add(z);return}for(let k=0;k<Q;k++){v[free[i]]=k;loop(i+1)}}
  loop(0);
 }
 function solve(C,S,anchors){
  const prep=anchors.map(i=>prepare(S[i])),hist=Array(S.length+1).fill(0);let best=Infinity,score=-Infinity,winner=null,keys=0,zero=0;const byAnchor=anchors.map(()=>0);
  for(const {k:A,M} of Akeys){
   const D=left(M,C),out=new Set();
   for(let h=0;h<prep.length;h++){
    const {at,full,def}=prep[h];const before=out.size;
    for(const {idx,M,other} of full){const a=D[idx[0]],b=D[idx[1]],d=D[idx[2]],x=(M[0]*a+M[1]*b+M[2]*d)%Q,y=(M[3]*a+M[4]*b+M[5]*d)%Q,z=(M[6]*a+M[7]*b+M[8]*d)%Q,id=x*Q*Q+y*Q+z;if(!Bvalid[id]||out.has(id))continue;let i=0;for(;i<other.length;i+=4)if((other[i+1]*x+other[i+2]*y+other[i+3]*z)%Q!==D[other[i]])break;if(i===other.length)out.add(id)}
    for(const R of def)enumerateDef(R,at,D,out);
    byAnchor[h]+=out.size-before;
   }
   for(const z of out){
    const P=row(getBinv(z),D),miss=S.map(([a,b],i)=>dict[b-a].has(key(P.slice(a,b)))?-1:i).filter(i=>i>=0);
    keys++;hist[miss.length]++;if(miss.length===0)zero++;if(miss.length>best)continue;let sc=0;for(let i=1;i<P.length;i++)sc+=log[P[i-1]*Q+P[i]];
    if(miss.length<best||sc>score){best=miss.length;score=sc;winner={A,B:unpack(z),P:Array.from(P),missWords:miss,words:S.map(([a,b])=>Array.from(P.slice(a,b),x=>c.translit[x]).join(" "))}}
   }
  }
  if(!winner||enc(winner.P,winner.A,winner.B).some((x,i)=>x!==C[i]))throw Error("winner replay");
  return{keys,zero,best,hist,score:score/120,winner,anchorStats:prep.map((p,i)=>({word:anchors[i],equations:p.at.length,fullRank:p.full.length,deficient:p.def.length,newKeys:byAnchor[i]}))};
 }
 const dictSize=dict.reduce((n,d)=>n+d.size,0),summary={dictSize,anchors,Akeys:Akeys.length,Bkeys:Bvalid.reduce((a,b)=>a+b,0)};
 if(mode==="all"||mode==="original")summary.original=solve(C,S,anchors);
 if(mode==="all"||mode==="controls"){
  const nativeWords=read(native.sections.find(s=>s.name==="0_loss_of_divinity").source_text),controls=[];
  for(const spec of [{words:nativeWords,start:251,anchor:284,A:[1,4,7],B:[5,9,12],source:"LOSS OF DIVINITY"},{words:oeWords,start:47318,anchor:47388,A:[1,7,9],B:[2,4,6],source:"Beowulf"}]){
   const {words,start,anchor,A,B,source}=spec,P=words.flat().slice(start,start+121),S=spans(words).filter(([a,b])=>a>=start&&b<=start+121).map(([a,b])=>[a-start,b-start]),i=S.findIndex(([a,b])=>a===anchor-start&&b-a===11);
   if(i<0||!det(A)||!det(B))throw Error("control fixture singular/anchor");const r=solve(enc(P,A,B),S,[i]);controls.push({source,start,anchor,truth:{A,B},correct:r.winner.P.filter((x,i)=>x===P[i]).length,keyCorrect:r.winner.A.join(",")===A.join(",")&&r.winner.B.join(",")===B.join(","),...r});
  }
  summary.controls=controls;
 }
 if(mode==="all"||mode==="stress"){
  const used=new Set(),pl=src.map((w,i)=>{const a=[...dict[w.length].values()];let j=(i*1259+77)%a.length;while(used.has(key(a[j])))j=(j+1)%a.length;used.add(key(a[j]));return a[j]});
  const removed=anchors.slice(0,6);for(const i of removed)dict[pl[i].length].delete(key(pl[i]));
  const P=pl.flat(),A=[1,8,5],B=[9,7,3];if(!det(A)||!det(B))throw Error("stress singular");
  const r=solve(enc(P,A,B),S,anchors);summary.stress={removed,truth:{A,B},correct:r.winner.P.filter((x,i)=>x===P[i]).length,keyCorrect:r.winner.A.join(",")===A.join(",")&&r.winner.B.join(",")===B.join(","),...r};
 }
 return summary;
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),process.argv[2]||'all'),null,2));
module.exports={experiment};
