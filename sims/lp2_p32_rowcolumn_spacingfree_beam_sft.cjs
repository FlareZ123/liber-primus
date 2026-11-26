'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/beowulf_oe_gp_profile_corrected.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,which="all",width=1000){const [ct,nat,oeRaw,...modTexts]=raw,c=JSON.parse(ct),native=JSON.parse(nat),oe=JSON.parse(oeRaw);
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
  return{scales,l,tot,n1,n2,ctx2};
 }
 const models=[train(modern),train([oeTape.slice(0,oe.trainingPrefixGpRunes)])],names=["modern","oldEnglish"];

 const modelNames=["modern","oldEnglish"];
 const loss=read(native.sections.find(s=>s.name==="0_loss_of_divinity").source_text);
 let seed=3301;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed%Q}
 const cases=[];
 for(let i=0;i<12;i++){const model=i<6?0:1,at=model?46000+(i-6)*121:i*121,P=(model?oeTape:loss).slice(at,at+121);if(P.length!==NN)throw Error("control length");const u=Array.from({length:N},rand),v=Array.from({length:N},rand),g=v[0];for(let j=0;j<N;j++){u[j]=mod(u[j]+g);v[j]=mod(v[j]-g)}const C=P.map((x,j)=>mod(x+u[Math.floor(j/N)]+v[j%N]));cases.push({name:modelNames[model]+i,C,P,u,v,model})}
 if(which==="original")for(let model=0;model<2;model++)cases.push({name:"original-"+modelNames[model],C:c.pages[32].indices,model});
 const EXP=Float64Array.from({length:16385},(_,i)=>Math.exp(-i/1024)),NEG=-1e9;
 function lse(x,start){let max=NEG;for(let i=start;i<start+Q;i++)max=Math.max(max,x[i]);let s=0;for(let i=start;i<start+Q;i++){const d=max-x[i];if(d<EXP.length)s+=EXP[d]}return max+1024*Math.log(s)}
 function attack(z,width){
  const M=models[z.model],C=z.C,U=Array.from(M.n1,x=>Math.round(1024*Math.log((x+1)/(M.tot+Q)))),B=new Int16Array(Q2);for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)B[a*Q+b]=Math.round(1024*Math.log((M.n2[a*Q+b]+16*(M.n1[b]+1)/(M.tot+Q))/(M.ctx2[a]+16)));
  const init=new Int32Array(N*Q);for(let r=0;r<N;r++)for(let u=0;u<Q;u++)init[r*Q+u]=U[mod(C[r*N]-u)];
  let beam=[{v:[0],state:init,score:0}],history=[];
  const buf=new Int32Array(N*Q),rowSum=new Float64Array(N);
  // Candidate lists retain only lightweight parent/key references. Materialize states for survivors.
  function step(parent,k,j,write){let sum=0;const v=parent.v;for(let r=0;r<N;r++){const i=r*N+j,off=r*Q,x=mod(C[i]-k),y=mod(C[i-1]-v[j-1]),a=j>1?mod(C[i-2]-v[j-2]):0;for(let u=0;u<Q;u++){const p=mod(x-u),q=mod(y-u),t=mod(a-u);buf[off+u]=parent.state[off+u]+(j===1?B[q*Q+p]:M.l[(t*Q+q)*Q+p])}sum+=lse(buf,off)}return sum}
  for(let j=1;j<N;j++){const next=[];for(let i=0;i<beam.length;i++)for(let k=0;k<Q;k++){const score=step(beam[i],k,j);next.push({i,k,score})}next.sort((a,b)=>b.score-a.score);beam=next.slice(0,width).map(x=>{const parent=beam[x.i];step(parent,x.k,j);return{v:[...parent.v,x.k],state:buf.slice(),score:x.score}});history.push({j,n:beam.length,best:beam[0].score,trueColumnRank:z.v?beam.findIndex(x=>x.v.every((v,i)=>v===z.v[i]))+1:null})}
  // Rank final beam by exact full-rune trigram maximum over row shifts, including both cross-row triples.
  let best=null;
  for(const x of beam){const p=Array.from({length:N},(_,r)=>Array.from({length:Q},(_,u)=>Array.from({length:N},(_,j)=>mod(C[r*N+j]-x.v[j]-u))));const local=p.map(row=>row.map(a=>{let s=0;for(let j=2;j<N;j++)s+=M.l[(a[j-2]*Q+a[j-1])*Q+a[j]];return s}));let prev=local[0].slice();const back=[];
   for(let r=1;r<N;r++){const now=new Int32Array(Q),bk=new Uint8Array(Q);for(let b=0;b<Q;b++){let max=NEG,arg=0;const b0=p[r][b][0],b1=p[r][b][1];for(let a=0;a<Q;a++){const a0=p[r-1][a][N-2],a1=p[r-1][a][N-1],s=prev[a]+M.l[(a0*Q+a1)*Q+b0]+M.l[(a1*Q+b0)*Q+b1];if(s>max){max=s;arg=a}}now[b]=max+local[r][b];bk[b]=arg}prev=now;back.push(bk)}
   const score=Math.max(...prev);if(!best||score>best.score){const u=[prev.indexOf(score)];for(let r=N-2;r>=0;r--)u.unshift(back[r][u[0]]);const P=u.flatMap((u,r)=>p[r][u]);best={score,u,v:x.v,P}}
  }
  const {P,u,v}=best;if(P.some((p,j)=>mod(p+u[Math.floor(j/N)]+v[j%N])!==C[j]))throw Error("replay");const truthScore=z.P?z.P.slice(2).reduce((s,p,j)=>s+M.l[(z.P[j]*Q+z.P[j+1])*Q+p],0):null;
  return {name:z.name,width,history,truthScore,meanScore:best.score/1024/(NN-2),...best,correct:z.P?P.filter((p,j)=>p===z.P[j]).length:null,keyCorrect:z.v?u.every((p,j)=>p===z.u[j])&&v.every((p,j)=>p===z.v[j]):null,translit:P.map(x=>c.translit[x]).join(" ")};
 }
 const select=which==="original"?cases.slice(-2):which==="all"?cases:cases.filter(z=>z.name===which);
 return select.map(z=>attack(z,width));
}
if(require.main===module){const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));const which=process.argv[2]||'all',width=Number(process.argv[3]||1000);for(const r of experiment(raw,which,width))console.log('RESULT_JSON '+JSON.stringify(r));}
module.exports={experiment};
