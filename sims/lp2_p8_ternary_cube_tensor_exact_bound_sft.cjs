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

 // All 29^4 lower-axis keys, with independent arbitrary shifts on 27 consecutive 9-rune blocks.
 // This is an exact relaxation of the full 11-parameter tensor mask.
 function attack(z,mode){
  const M=models[z.model],cube=x=>x*x*x%Q,root=Array.from({length:Q},(_,i)=>Array.from({length:Q},(_,j)=>j).find(j=>cube(j)===i));
  if(root.some(x=>x===undefined))throw Error('nonpermutation');
  let C=z.C,truth=z.P;let score=M.l;
  if(mode==='cubeOutside'){C=z.P?z.P.map((p,i)=>cube(mod(p+keyAt(z.K,i)))):z.C;C=C.map(x=>root[x]);}
  else if(mode==='cubeInside'){C=z.P?z.P.map((p,i)=>mod(cube(p)+keyAt(z.K,i))):z.C;truth=z.P?.map(cube);score=Int16Array.from(M.l,(_,i)=>M.l[(root[Math.floor(i/(Q*Q))]*Q+root[Math.floor(i/Q)%Q])*Q+root[i%Q]])}
  else throw Error('mode');
  const G=27,Q2=Q*Q;
  let best=NEG,bestK=null,bestShifts=null;const trueBlockScore=truth?truth.reduce((s,p,i)=>i%9>=2?s+score[(truth[i-2]*Q+truth[i-1])*Q+p]:s,0):null;
  // Per 9-block, the three 3-rune trigrams and four seam trigrams together are the exact seven.
  let tested=0;const buf=new Int32Array(G*Q),one=new Int32Array(G*Q2),two=new Int32Array(G*Q2),shifts=new Uint8Array(G);
  for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){
   const fixed=Uint8Array.from(C,(c,i)=>mod(c-(i%3===1?x:i%3===2?y:0)));
   const sub=new Int32Array(81*Q);
   for(let i=0;i<81;i++)for(let s=0;s<Q;s++){const a=mod(fixed[3*i]-s),b=mod(fixed[3*i+1]-s),c=mod(fixed[3*i+2]-s);sub[i*Q+s]=score[(a*Q+b)*Q+c]}
   for(let g=0;g<G;g++)for(let d=0;d<Q;d++)for(let s=0;s<Q;s++){
    const t=plus[d][s],i=g*9+3,j=i+3;
    const seam=(i,s,t)=>{const a=mod(fixed[i-2]-s),b=mod(fixed[i-1]-s),c=mod(fixed[i]-t),d=mod(fixed[i+1]-t);return score[(a*Q+b)*Q+c]+score[(b*Q+c)*Q+d]};
    one[(g*Q+d)*Q+s]=seam(i,s,t);two[(g*Q+d)*Q+s]=seam(j,s,t);
   }
   for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){
    let total=0;const aa=plus[a],bb=plus[b],ab=mod(b-a);
    for(let g=0;g<G;g++){
     let max=NEG,arg=0;const off=g*Q,old=3*off,o1=(g*Q+a)*Q,o2=(g*Q+ab)*Q;
     for(let s=0;s<Q;s++){const v=sub[old+s]+sub[old+Q+aa[s]]+sub[old+2*Q+bb[s]]+one[o1+s]+two[o2+aa[s]];if(v>max){max=v;arg=s}}
     shifts[g]=arg;total+=max;
    }
    tested++;
    if(total>best){best=total;bestK=[x,y,a,b];bestShifts=Array.from(shifts)}
   }
  }
  if(tested!==Q**4)throw Error("enumeration");
  const P=C.map((c,i)=>mod(c-bestShifts[Math.floor(i/9)]-(i%3===1?bestK[0]:i%3===2?bestK[1]:0)-(Math.floor(i/3)%3===1?bestK[2]:Math.floor(i/3)%3===2?bestK[3]:0)));
  const recomputed=P.reduce((s,p,i)=>i%9>=2?s+score[(P[i-2]*Q+P[i-1])*Q+p]:s,0);if(recomputed!==best)throw Error("bound replay");
  if(trueBlockScore!==null&&best<trueBlockScore)throw Error("upper bound violates plant");
  const plain=mode==='cubeInside'?P.map(x=>root[x]):P;return {name:z.name,mode,model:z.model,tested,best,bestK,bestShifts,blockMean:best/1024/189,wholeMeanUpper:best/1024/241,trueBlockMean:trueBlockScore===null?null:trueBlockScore/1024/189,correct:z.P?plain.filter((p,i)=>p===z.P[i]).length:null,partialKeyCorrect:z.K?bestK.every((k,i)=>k===z.K[i]):null,translit:plain.map(x=>c.translit[x]).join(""),P:plain};
 }
 // Each source-selected layer order has independent fixed controls before original scoring.
 const out=[];for(const mode of ["cubeOutside","cubeInside"]){const controls=[];for(const z of cases){const r=attack(z,mode);controls.push(r);out.push(r);console.log("RESULT_JSON "+JSON.stringify(r))}
 if(controls.some(x=>!x.partialKeyCorrect)){console.log("GATE_FAILED "+mode);continue}
 for(let m=0;m<2;m++){const r=attack({name:"original-"+names[m],model:m,C:body},mode);out.push(r);console.log("RESULT_JSON "+JSON.stringify(r))}
 }
 return out;
}
if(require.main===module){const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));experiment(raw);}
module.exports={experiment};