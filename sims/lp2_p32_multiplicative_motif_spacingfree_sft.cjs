'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/beowulf_oe_gp_profile_corrected.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,width=1024){
 const [ct,nat,oeRaw,...texts]=raw,c=JSON.parse(ct),native=JSON.parse(nat),oe=JSON.parse(oeRaw),Q=29,N=11,K=28,Q2=Q*Q,Q3=Q2*Q,mod=x=>(x%K+K)%K,assert=(b,m)=>{if(!b)throw Error(m)};
 const exp=Array.from({length:K},(_,i)=>Number(2n**BigInt(i)%29n)),dec=new Uint8Array(Q*K);assert(new Set(exp).size===K,"generator");
 for(let x=0;x<Q;x++)for(let k=0;k<K;k++)dec[x*K+k]=x*exp[mod(-k)]%Q;
 const read=s=>(s.match(/[\u16A0-\u16FF]/gu)||[]).map(x=>c.runes.indexOf(x)),tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a}
 const modern=texts.map(s=>(s.match(/[a-z]+/gi)||[]).flatMap(gp));for(const s of native.sections.filter(s=>!["0_loss_of_divinity","0_koan_1"].includes(s.name)))modern.push(read(s.source_text));
 const oeTape=[...oe.sourceGpBase29].map(x=>oe.positiveControlAlphabet.indexOf(x));assert(oeTape.every(x=>x>=0&&x<Q),"OE alphabet");
 function train(tapes){
  const n1=new Uint32Array(Q),n2=new Uint32Array(Q2),n3=new Uint32Array(Q3),ctx2=new Uint32Array(Q),ctx3=new Uint32Array(Q2);let tot=0;
  for(const P of tapes)for(let i=0;i<P.length;i++){const z=P[i];n1[z]++;tot++;if(i){const y=P[i-1];n2[y*Q+z]++;ctx2[y]++}if(i>1){const yz=P[i-2]*Q+P[i-1];n3[yz*Q+z]++;ctx3[yz]++}}
  const U=new Int16Array(Q),B=new Int16Array(Q2),T=new Int16Array(Q3);
  for(let d=0;d<Q;d++){const p1=(n1[d]+1)/(tot+Q);U[d]=Math.round(1024*Math.log(p1));for(let b=0;b<Q;b++){const p2=(n2[b*Q+d]+16*p1)/(ctx2[b]+16);B[b*Q+d]=Math.round(1024*Math.log(p2));for(let a=0;a<Q;a++){const p3=(n3[(a*Q+b)*Q+d]+12*p2)/(ctx3[a*Q+b]+12);T[(a*Q+b)*Q+d]=Math.round(1024*Math.log(p3))}}}
  return{U,B,T,tot};
 }
 const models=[train(modern),train([oeTape.slice(0,oe.trainingPrefixGpRunes)])];
 let seed=3301;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed%K}
 const loss=read(native.sections.find(s=>s.name==="0_loss_of_divinity").source_text),koan=read(native.sections.find(s=>s.name==="0_koan_1").source_text);
 const cases=[];
 // Disjoint, unsegmented control windows selected before attack. All enforce motif identity-mask geometry.
 for(const [name,tape,start,model] of [["loss0",loss,0,0],["loss1",loss,242,0],["koan0",koan,0,0],["koan1",koan,242,0],["oe0",oeTape,46000,1],["oe1",oeTape,46121,1]]){
  const P=tape.slice(start,start+121),u=Array.from({length:N},rand),v=Array.from({length:N},rand);assert(P.length===121,"control length");
  v[0]=v[1]=v[2]=v[3]=0;v[9]=v[10]=v[6];u[2]=mod(-v[6]);u[3]=0;
  const C=P.map((x,j)=>x*exp[mod(u[Math.floor(j/N)]+v[j%N])]%Q);
  cases.push({name,P,C,u,v,model,start});
 }
 const NEG=-1e9, E=Float64Array.from({length:20001},(_,i)=>Math.exp(-i/1024));
 function lse(x,off){let max=NEG;for(let i=off;i<off+K;i++)max=Math.max(max,x[i]);let sum=0;for(let i=off;i<off+K;i++){const d=max-x[i];if(d<E.length)sum+=E[d]}return max+1024*Math.log(sum)}
 function attack(z){
  const C=z.C,M=models[z.model],Pdec=Array.from({length:121},(_,i)=>Array.from({length:K},(_,v)=>Uint8Array.from({length:K},(_,u)=>dec[C[i]*K+((u+v)%K)])));
  const init=new Int32Array(N*K);for(let r=0;r<N;r++)for(let u=0;u<K;u++)init[r*K+u]=M.U[Pdec[r*N][0][u]];
  let beam=[{v:[0],state:init,score:0}],history=[];
  const buf=new Int32Array(N*K),tmp=new Int32Array(N*K);
  function calc(state,v,k,j,out){
   let score=0;const fixed2=j>=6?mod(-(j===6?k:v[6])):-1;
   for(let r=0;r<N;r++){
    const i=r*N+j,off=r*K,x=Pdec[i][k],y=Pdec[i-1][v[j-1]],a=j>1?Pdec[i-2][v[j-2]]:null;
    for(let u=0;u<K;u++)out[off+u]=state[off+u]+(j===1?M.B[y[u]*Q+x[u]]:M.T[(a[u]*Q+y[u])*Q+x[u]]);
    score+=r===3?out[off]:r===2&&fixed2>=0?out[off+fixed2]:lse(out,off);
   }
   return score;
  }
  // At the final free column, score both forced trailing columns before pruning.
  function step(parent,k,j,out){
   const s=calc(parent.state,parent.v,k,j,buf);
   if(j!==8){if(out)out.set(buf);return s}
   const v=[...parent.v,k],a=v[6];calc(buf,v,a,9,tmp);v.push(a);const score=calc(tmp,v,a,10,buf);if(out)out.set(buf);return score;
  }
  for(let j=1;j<=8;j++){
   const next=[],forced=j<=3;
   for(let i=0;i<beam.length;i++)for(let k=0;k<(forced?1:K);k++)next.push({i,k,score:step(beam[i],k,j)});
   next.sort((a,b)=>b.score-a.score||a.i-b.i||a.k-b.k);
   beam=next.slice(0,width).map(x=>{const p=beam[x.i],state=new Int32Array(N*K);step(p,x.k,j,state);const v=[...p.v,x.k];if(j===8)v.push(v[6],v[6]);return{v,state,score:x.score}});
   history.push({j,n:beam.length,best:beam[0].score,trueRank:z.v?beam.findIndex(x=>x.v.every((v,i)=>v===z.v[i]))+1:null});
  }
  // For each retained complete column key, exact row-chain trigram maximum,
  // including both crossing triples at each row seam and the identity restrictions.
  let best=null;
  for(const x of beam){
   const allowed=Array.from({length:N},(_,r)=>r===2?[mod(-x.v[6])]:r===3?[0]:Array.from({length:K},(_,i)=>i));
   const p=Array.from({length:N},(_,r)=>Array.from({length:K},(_,u)=>Uint8Array.from({length:N},(_,j)=>Pdec[r*N+j][x.v[j]][u])));
   const local=p.map((row,r)=>Int32Array.from(row,(a,u)=>{if(!allowed[r].includes(u))return NEG;let s=0;for(let j=2;j<N;j++)s+=M.T[(a[j-2]*Q+a[j-1])*Q+a[j]];return s}));
   let prev=local[0].slice();const back=[];
   for(let r=1;r<N;r++){const now=new Int32Array(K).fill(NEG),bk=new Uint8Array(K);for(const b of allowed[r]){let max=NEG,arg=0;const b0=p[r][b][0],b1=p[r][b][1];for(const a of allowed[r-1]){const a0=p[r-1][a][N-2],a1=p[r-1][a][N-1],s=prev[a]+M.T[(a0*Q+a1)*Q+b0]+M.T[(a1*Q+b0)*Q+b1];if(s>max){max=s;arg=a}}now[b]=max+local[r][b];bk[b]=arg}prev=now;back.push(bk)}
   const score=Math.max(...prev);if(!best||score>best.score){const u=[prev.indexOf(score)];for(let r=N-2;r>=0;r--)u.unshift(back[r][u[0]]);const P=u.flatMap((u,r)=>Array.from(p[r][u]));best={score,u,v:x.v,P}}
  }
  const {P,u,v}=best;assert(P.every((p,j)=>p*exp[mod(u[Math.floor(j/N)]+v[j%N])]%Q===C[j]),"replay");
  assert([28,29,30,31,32,33,34,35,36].every(i=>P[i]===C[i]),"motif identity");
  const truthScore=z.P?z.P.slice(2).reduce((s,p,j)=>s+M.T[(z.P[j]*Q+z.P[j+1])*Q+p],0):null;
  return {name:z.name,width,history,truthScore,meanScore:best.score/1024/119,...best,correct:z.P?P.filter((p,j)=>p===z.P[j]).length:null,keyCorrect:z.v?u.every((p,j)=>p===z.u[j])&&v.every((p,j)=>p===z.v[j]):null,truth:z.P?{P:z.P,u:z.u,v:z.v,start:z.start}:null,translit:P.map(x=>c.translit[x]).join(" ")};
 }
 const controls=cases.map(attack);
 const gate=controls.every(x=>x.correct===121&&x.keyCorrect);
 const original=gate?[0,1].map(model=>attack({name:model?"original-OE":"original-modern",C:c.pages[32].indices,model})):[];
 return {schema:1,model:"multiplicative row/column mask, identity motif conditional",width,trainingRunes:models.map(m=>m.tot),controls,gate,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),Number(process.argv[2]||1024)),null,2));
module.exports={experiment};
