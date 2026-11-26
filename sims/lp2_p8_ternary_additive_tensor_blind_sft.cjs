'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/beowulf_oe_gp_profile_corrected.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,which="all",width=128){const [ct,nat,oeRaw,...modTexts]=raw,c=JSON.parse(ct),native=JSON.parse(nat),oe=JSON.parse(oeRaw);
 const Q=29,N=3,NN=243,Q2=Q*Q,Q3=Q2*Q,mod=x=>((x%Q)+Q)%Q,inv=Array.from({length:Q},(_,i)=>{for(let j=1;j<Q;j++)if(i*j%Q===1)return j;return 0});
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
 let seed=783301;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed%Q}
 const cases=[];const step=[1,3,9,27,81];
 const keyAt=(K,i)=>mod(K[10]+step.reduce((s,v,a)=>s+((Math.floor(i/v)%3)?K[2*a+Math.floor(i/v)%3-1]:0),0));
 for(let m=0;m<2;m++)for(let j=0;j<3;j++){const at=m?46000+j*243:j*243,P=(m?oeTape:loss).slice(at,at+243);if(P.length!==243)throw Error("control length");const K=Array.from({length:11},rand),C=P.map((p,i)=>mod(p+keyAt(K,i)));cases.push({name:names[m]+j,model:m,P,K,C})}
 const body=c.pages[8].indices.slice(12);if(body.length!==243)throw Error("p8 body length");
 const EXP=Float64Array.from({length:16385},(_,i)=>Math.exp(-i/1024)),NEG=-1e9;
 const plus=Array.from({length:Q},(_,a)=>Uint8Array.from({length:Q},(_,s)=>(a+s)%Q));
 function attack(z){
  const M=models[z.model],C=z.C,score=M.l,base=Uint8Array.from(C),buf=new Int32Array(81*Q);
  let beam=[{K:[],state:new Int32Array(243*Q),score:0}],history=[];
  for(let axis=0;axis<5;axis++){
   const L=step[axis],G=243/(3*L),next=[];
   for(let id=0;id<beam.length;id++){
    const p=beam[id],fixed=Uint8Array.from(C,(c,i)=>mod(c-p.K.reduce((s,k,j)=>s+(Math.floor(i/step[j>>1])%3===1+(j&1)?k:0),0)));
    // Precompute exact cross-boundary terms for each relative shift and common shift.
    const one=new Int32Array(G*Q*Q),two=new Int32Array(G*Q*Q);
    if(axis>0)for(let g=0;g<G;g++)for(let d=0;d<Q;d++)for(let s=0;s<Q;s++){
     const t=plus[d][s],i=g*3*L+L,j=i+L;
     const seam=(i,s,t)=>{const a=mod(fixed[i-2]-s),b=mod(fixed[i-1]-s),c=mod(fixed[i]-t),d=mod(fixed[i+1]-t);return score[(a*Q+b)*Q+c]+score[(b*Q+c)*Q+d]};
     one[(g*Q+d)*Q+s]=seam(i,s,t);two[(g*Q+d)*Q+s]=seam(j,s,t);
    }
    function calc(a,b,write){
     let total=0;const ab=mod(b-a),aa=plus[a],bb=plus[b];
     for(let g=0;g<G;g++){
      let max=NEG;
      const off=g*Q,old=3*off,o1=(g*Q+a)*Q,o2=(g*Q+ab)*Q,i=g*3;
      for(let s=0;s<Q;s++){
       let v;if(axis===0){const x=mod(fixed[i]-s),y=mod(fixed[i+1]-aa[s]),z=mod(fixed[i+2]-bb[s]);v=score[(x*Q+y)*Q+z]}
       else v=p.state[old+s]+p.state[old+Q+aa[s]]+p.state[old+2*Q+bb[s]]+one[o1+s]+two[o2+aa[s]];
       buf[off+s]=v;if(v>max)max=v;
      }
      let mass=0;for(let s=0;s<Q;s++){const d=max-buf[off+s];if(d<EXP.length)mass+=EXP[d]}total+=max+1024*Math.log(mass);
     }
     return total;
    }
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)next.push({id,a,b,score:calc(a,b,false)});
    // Reconstruct only retained candidates later, with a direct score implementation.
   }
   next.sort((a,b)=>b.score-a.score);
   beam=next.slice(0,width).map(x=>{
    const K=[...beam[x.id].K,x.a,x.b],fixed=Uint8Array.from(C,(c,i)=>mod(c-K.reduce((s,k,j)=>s+(Math.floor(i/step[j>>1])%3===1+(j&1)?k:0),0))),state=new Int32Array(G*Q);
    for(let g=0;g<G;g++)for(let s=0;s<Q;s++){let sum=0;for(let i=g*3*L+2;i<(g+1)*3*L;i++){const a=mod(fixed[i-2]-s),b=mod(fixed[i-1]-s),c=mod(fixed[i]-s);sum+=score[(a*Q+b)*Q+c]}state[g*Q+s]=sum}
    return {K,state,score:x.score};
   });
   const trueRank=z.K?beam.findIndex(x=>x.K.every((k,i)=>k===z.K[i]))+1:null;history.push({axis,retained:beam.length,trueRank,score:beam[0].score});
  }
  let best=null;for(const b of beam){const s=b.state.indexOf(Math.max(...b.state)),K=[...b.K,s],P=C.map((c,i)=>mod(c-keyAt(K,i))),actual=P.slice(2).reduce((a,p,i)=>a+score[(P[i]*Q+P[i+1])*Q+p],0);if(actual!==b.state[s])throw Error("score mismatch");if(!best||actual>best.score)best={K,P,score:actual}}
  if(best.P.some((p,i)=>mod(p+keyAt(best.K,i))!==C[i]))throw Error("replay");
  return {name:z.name,model:z.model,history,meanScore:best.score/1024/241,K:best.K,correct:z.P?best.P.filter((p,i)=>p===z.P[i]).length:null,keyCorrect:z.K?best.K.every((k,i)=>k===z.K[i]):null,translit:best.P.map(x=>c.translit[x]).join(""),P:best.P};
 }
 const out=[];for(const z of cases)if(which==="all"||which==="controls"||which===z.name){const r=attack(z);out.push(r);console.log("RESULT_JSON "+JSON.stringify(r))}
 const gate=out.filter(x=>x.keyCorrect&&x.correct===243).length>=5;
 if(which==="all"&&gate||which==="original"){for(let m=0;m<2;m++){const r=attack({name:"original-"+names[m],model:m,C:body});out.push(r);console.log("RESULT_JSON "+JSON.stringify(r))}}
 return{gate,results:out,width};
}
if(require.main===module){const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));const r=experiment(raw,process.argv[2]||"all",Number(process.argv[3]||128));console.log("SUMMARY_JSON "+JSON.stringify({gate:r.gate,width:r.width}));}
module.exports={experiment};
