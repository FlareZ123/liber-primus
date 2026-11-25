'use strict';
// Exhaustive spacing-free score of the exact p32 separable three-tap family.
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/beowulf_oe_gp_profile_corrected.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,which="original",from=0,to=757) {
 const [ct,nat,oeRaw,...modTexts]=raw,c=JSON.parse(ct),native=JSON.parse(nat),oe=JSON.parse(oeRaw);
 const Q=29,N=11,NN=N*N,Q2=Q*Q,Q3=Q2*Q,mod=x=>((x%Q)+Q)%Q,inv=Array.from({length:Q},(_,i)=>{for(let j=1;j<Q;j++)if(i*j%Q===1)return j;return 0});
 const read=s=>(s.match(/[\u16A0-\u16FF]/gu)||[]).map(x=>c.runes.indexOf(x)),tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a}
 const modern=modTexts.map(s=>(s.match(/[a-z]+/gi)||[]).flatMap(gp));for(const s of native.sections.filter(s=>s.name!=="0_loss_of_divinity"))modern.push(read(s.source_text));
 const oeTape=[...oe.sourceGpBase29].map(x=>oe.positiveControlAlphabet.indexOf(x));if(oeTape.some(x=>x<0||x>=Q))throw Error("OE alphabet");
 function train(tapes){
  const n1=new Uint32Array(Q),n2=new Uint32Array(Q2),n3=new Uint32Array(Q3),ctx2=new Uint32Array(Q),ctx3=new Uint32Array(Q2);let tot=0;
  for(const P of tapes){for(let i=0;i<P.length;i++){const z=P[i];n1[z]++;tot++;if(i){const y=P[i-1];n2[y*Q+z]++;ctx2[y]++}if(i>1){const yz=P[i-2]*Q+P[i-1];n3[yz*Q+z]++;ctx3[yz]++}}}
  const l=new Int16Array(Q3),scales=new Int16Array(Q3*28);for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let d=0;d<Q;d++){const p1=(n1[d]+1)/(tot+Q),p2=(n2[b*Q+d]+16*p1)/(ctx2[b]+16),p3=(n3[(a*Q+b)*Q+d]+12*p2)/(ctx3[a*Q+b]+12);l[(a*Q+b)*Q+d]=Math.round(1024*Math.log(p3))}
  for(let s=1;s<Q;s++)for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let d=0;d<Q;d++)scales[(s-1)*Q3+(a*Q+b)*Q+d]=l[((s*a%Q)*Q+s*b%Q)*Q+s*d%Q];
  return{scales,l,tot};
 }
 const models=[train(modern),train([oeTape.slice(0,oe.trainingPrefixGpRunes)])],names=["modern","oldEnglish"];
 function det(k){let d0=1,d1=k[1];for(let i=2;i<=N;i++){const d=mod(k[1]*d1-k[0]*k[2]*d0);d0=d1;d1=d}return d1}
 function tri(k){return Array.from({length:N},(_,r)=>Array.from({length:N},(_,j)=>j===r-1?k[0]:j===r?k[1]:j===r+1?k[2]:0))}
 function invert(M){const n=M.length,A=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>+(i===j))]);for(let j=0;j<n;j++){let p=j;while(p<n&&!A[p][j])p++;if(p===n)return null;[A[p],A[j]]=[A[j],A[p]];const u=inv[A[j][j]];for(let z=j;z<2*n;z++)A[j][z]=A[j][z]*u%Q;for(let i=0;i<n;i++)if(i!==j&&A[i][j]){const v=A[i][j];for(let z=j;z<2*n;z++)A[i][z]=mod(A[i][z]-v*A[j][z])}}return Uint8Array.from(A.flatMap(r=>r.slice(n)))}
 function left(M,X){const Y=new Uint8Array(NN);for(let i=0;i<N;i++)for(let j=0;j<N;j++){let s=0;for(let k=0;k<N;k++)s+=M[i*N+k]*X[k*N+j];Y[i*N+j]=s%Q}return Y}
 function row(M,X,Y=new Uint8Array(NN)){for(let i=0;i<NN;i+=N)for(let j=0;j<NN;j+=N){let s=0;for(let k=0;k<N;k++)s+=M[j+k]*X[i+k];Y[i+j/N]=s%Q}return Y}
 function enc(P,A,B){return row(Uint8Array.from(tri(B).flat()),left(Uint8Array.from(tri(A).flat()),P))}
 const keys=[];for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let d=0;d<Q;d++){const k=[a,b,d];if(k.find(x=>x!==0)!==1||!det(k))continue;const M=invert(tri(k));if(!M)throw Error("det mismatch");keys.push({k,M})}
 if(keys.length!==757||from<0||to>keys.length||to<=from)throw Error("range");
 let C,truth=null;
 if(which==="original"){C=Uint8Array.from(c.pages[32].indices);if(C.length!==NN)throw Error("p32 length")}
 else if(which==="modern"){const P=read(native.sections.find(s=>s.name==="0_loss_of_divinity").source_text).slice(251,372),A=[1,4,7],B=[5,9,12];truth={P,A,B};C=enc(P,A,B)}
 else if(which==="oldEnglish"){const P=oeTape.slice(47318,47439),A=[1,7,9],B=[2,4,6];truth={P,A,B};C=enc(P,A,B)}
 else throw Error("case");
 const CUT=66,preN=CUT-2,tailN=NN-CUT;
 const result=models.map(m=>({prefix:null,full:null,truth:truth?{prefix:0,full:0}:null,trainGreater:0,fullGreater:0,trainEqual:0,fullEqual:0,scoreHist:[]}));
 if(truth)for(let m=0;m<models.length;m++){let pre=0,full=0;const P=truth.P,l=models[m].l;for(let i=2;i<NN;i++){const v=l[(P[i-2]*Q+P[i-1])*Q+P[i]];full+=v;if(i<CUT)pre+=v}result[m].truth={prefix:pre,full}}
 const P0=new Uint8Array(NN),code=new Uint16Array(NN-2),sc0=models[0].scales,sc1=models[1].scales;
 function update(m,p,h,A,B,s){const r=result[m],f=p+h;if(r.truth){if(p>r.truth.prefix)r.trainGreater++;if(p===r.truth.prefix)r.trainEqual++;if(f>r.truth.full)r.fullGreater++;if(f===r.truth.full)r.fullEqual++}if((r.prefix&&p<=r.prefix.prefix)&& (r.full&&f<=r.full.full))return;const z={prefix:p,holdout:h,full:f,A:A.slice(),B:B.map(x=>x*inv[s]%Q),P:Array.from(P0,x=>x*s%Q)};if(!r.prefix||p>r.prefix.prefix)r.prefix=z;if(!r.full||f>r.full.full)r.full=z}
 for(let a=from;a<to;a++){const A=keys[a],D=left(A.M,C);for(const B of keys){row(B.M,D,P0);for(let i=2;i<NN;i++)code[i-2]=(P0[i-2]*Q+P0[i-1])*Q+P0[i];for(let s=1,off=0;s<Q;s++,off+=Q3){let p0=0,p1=0,h0=0,h1=0;for(let i=0;i<preN;i++){const z=off+code[i];p0+=sc0[z];p1+=sc1[z]}for(let i=preN;i<NN-2;i++){const z=off+code[i];h0+=sc0[z];h1+=sc1[z]}update(0,p0,h0,A.k,B.k,s);update(1,p1,h1,A.k,B.k,s)}}}
 function complete(z){if(enc(z.P,z.A,z.B).some((x,i)=>x!==C[i]))throw Error("winner replay");return{...z,meanPrefix:z.prefix/1024/preN,meanHoldout:z.holdout/1024/tailN,meanFull:z.full/1024/(NN-2),plaintext:z.P.map(x=>c.translit[x]).join(" "),correct:truth?z.P.filter((x,i)=>x===truth.P[i]).length:null,keyCorrect:truth?z.A.join(",")===truth.A.join(",")&&z.B.join(",")===truth.B.join(","):null}}
 return{which,from,to,maps:(to-from)*keys.length*28,CUT,trainingRunes:models.map(m=>m.tot),truth,models:Object.fromEntries(result.map((r,i)=>[names[i],{...r,prefix:complete(r.prefix),full:complete(r.full)}]))};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),process.argv[2]||'original',Number(process.argv[3]||0),Number(process.argv[4]||757)),null,2));
module.exports={experiment};
