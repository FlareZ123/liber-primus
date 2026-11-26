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


 const loss=read(native.sections.find(s=>s.name==="0_loss_of_divinity").source_text);
 let seed=330104;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed%Q}
 const cases=[];
 for(let m=0;m<2;m++)for(let j=0;j<6;j++){const at=m?46000+j*121:j*121,P=(m?oeTape:loss).slice(at,at+121);if(P.length!==NN)throw Error("control length");const u=Array.from({length:N},rand),v=Array.from({length:N},rand),g=v[0];for(let i=0;i<N;i++){u[i]=mod(u[i]+g);v[i]=mod(v[i]-g)}const C=P.map((p,i)=>p===0?0:mod(p+u[Math.floor(i/N)]+v[i%N]));cases.push({name:names[m]+j,model:m,P,u,v,C})}
 const NEG=-1000000000,EXP=Float64Array.from({length:16385},(_,i)=>Math.exp(-i/1024));
 function lse(x,start,n){let max=NEG;for(let i=start;i<start+n;i++)max=Math.max(max,x[i]);if(max===NEG)return NEG;let s=0;for(let i=start;i<start+n;i++){const d=max-x[i];if(d<EXP.length)s+=EXP[d]}return max+1024*Math.log(s)}
 function attack(z){
  const M=models[z.model],C=z.C,U=Array.from(M.n1,x=>Math.round(1024*Math.log((x+1)/(M.tot+Q)))),B=new Int16Array(Q2);
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)B[a*Q+b]=Math.round(1024*Math.log((M.n2[a*Q+b]+16*(M.n1[b]+1)/(M.tot+Q))/(M.ctx2[a]+16)));
  // Option 0 is the regular affine result, which cannot be plaintext F.
  // Option 1 exists only for a ciphertext F and is a literal plaintext F.
  const options=Array.from({length:Q},(_,c)=>Array.from({length:Q},(_,k)=>{const p=mod(c-k);return[p===0?-1:p,c===0?0:-1]}));
  const add=Array.from({length:Q},(_,x)=>Uint8Array.from({length:Q},(_,y)=>mod(x+y)));
  const init=new Int32Array(N*Q*4).fill(NEG);
  for(let r=0;r<N;r++)for(let u=0;u<Q;u++){const a=options[C[r*N]][u];for(let b=0;b<2;b++)if(a[b]>=0)init[(r*Q+u)*4+b]=U[a[b]]}
  let beam=[{v:[0],state:init,score:0}],history=[];const buf=new Int32Array(init.length),sums=new Int32Array(Q*4);
  function step(parent,k,j){
   const v=parent.v;let total=0;
   for(let r=0;r<N;r++){
    const i=r*N+j,off=r*Q*4;
    for(let u=0;u<Q;u++){
     const f=off+4*u,a=options[C[i-1]][add[u][v[j-1]]],b=options[C[i]][add[u][k]],prev=j>1?options[C[i-2]][add[u][v[j-2]]]:null;
     // Four states encode the two most recent binary F interpretations.
     for(let x=0;x<2;x++)for(let y=0;y<2;y++){
      let best=NEG;
      if(a[x]>=0&&b[y]>=0){
       if(j===1){const q=parent.state[f+x];if(q>NEG)best=q+B[a[x]*Q+b[y]]}
       else for(let t=0;t<2;t++)if(prev[t]>=0){const q=parent.state[f+2*t+x];if(q>NEG)best=Math.max(best,q+M.l[(prev[t]*Q+a[x])*Q+b[y]])}
      }
      buf[f+2*x+y]=best;sums[u*4+2*x+y]=best;
     }
    }
    const q=lse(sums,0,Q*4);if(q===NEG)return NEG;total+=q;
   }
   return total;
  }
  for(let j=1;j<N;j++){
   const next=[];for(let i=0;i<beam.length;i++)for(let k=0;k<Q;k++){const score=step(beam[i],k,j);if(score>NEG)next.push({i,k,score})}
   next.sort((a,b)=>b.score-a.score);beam=next.slice(0,width).map(x=>{const parent=beam[x.i];step(parent,x.k,j);return{v:[...parent.v,x.k],state:buf.slice(),score:x.score}});
   if(!beam.length)throw Error("dead beam");history.push({j,best:beam[0].score,trueColumnRank:z.v?beam.findIndex(x=>x.v.every((v,i)=>v===z.v[i]))+1:null});
  }
  // All legal per-row shift and literal-F assignments, then exact cross-row Viterbi.
  let best=null;
  for(const x of beam){
   const rows=Array.from({length:N},(_,r)=>{
    const out=[];for(let u=0;u<Q;u++){
     const P=[];function visit(j,sc){if(j===N){out.push({u,P:P.slice(),sc});return}for(const p of options[C[r*N+j]][add[u][x.v[j]]])if(p>=0){const addScore=j>=2?M.l[(P[j-2]*Q+P[j-1])*Q+p]:0;P.push(p);visit(j+1,sc+addScore);P.pop()}}
     visit(0,0);
    }return out;
   });
   if(rows.some(r=>!r.length))continue;
   let prev=rows[0].map(a=>a.sc),back=[];
   for(let r=1;r<N;r++){
    const now=new Int32Array(rows[r].length),bk=new Int32Array(rows[r].length);
    for(let b=0;b<rows[r].length;b++){const p=rows[r][b].P;let max=NEG,arg=0;for(let a=0;a<rows[r-1].length;a++){const q=rows[r-1][a].P,v=prev[a]+M.l[(q[N-2]*Q+q[N-1])*Q+p[0]]+M.l[(q[N-1]*Q+p[0])*Q+p[1]];if(v>max){max=v;arg=a}}now[b]=max+rows[r][b].sc;bk[b]=arg}
    prev=now;back.push(bk)
   }
   const score=Math.max(...prev);if(!best||score>best.score){const ids=[prev.indexOf(score)];for(let r=N-2;r>=0;r--)ids.unshift(back[r][ids[0]]);const u=ids.map((j,r)=>rows[r][j].u),P=ids.flatMap((j,r)=>rows[r][j].P);best={score,u,v:x.v,P}}
  }
  if(!best)throw Error("no complete path");const {P,u,v}=best;if(P.some((p,i)=>(p===0?0:mod(p+u[Math.floor(i/N)]+v[i%N]))!==C[i]))throw Error("replay");
  return {name:z.name,model:z.model,width,history,meanScore:best.score/1024/(NN-2),...best,correct:z.P?P.filter((p,i)=>p===z.P[i]).length:null,keyCorrect:z.v?u.every((p,j)=>p===z.u[j])&&v.every((p,j)=>p===z.v[j]):null,trueF:z.P?z.P.filter(x=>x===0).length:null,cipherF:C.filter(x=>x===0).length,selectedF:P.filter(x=>x===0).length,translit:P.map(x=>c.translit[x]).join("")};
 }
 const out=[];for(const z of cases)if(which==="all"||which==="controls"||which===z.name){const r=attack(z);out.push(r);console.log("RESULT_JSON "+JSON.stringify(r))}
 const gate=out.filter(x=>x.correct===NN&&x.keyCorrect).length>=10;
 if(which==="all"&&gate||which==="original")for(let m=0;m<2;m++){const r=attack({name:"original-"+names[m],model:m,C:c.pages[32].indices});out.push(r);console.log("RESULT_JSON "+JSON.stringify(r))}
 return {gate,results:out};
}
if(require.main===module){const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));const r=experiment(raw,process.argv[2]||"all",Number(process.argv[3]||1000));console.log("SUMMARY_JSON "+JSON.stringify({gate:r.gate}));}
module.exports={experiment};
