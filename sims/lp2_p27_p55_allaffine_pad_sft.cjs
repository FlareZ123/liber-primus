"use strict";
// All-affine GF29 key generator from three frozen p27 tapes.
// C[i] = P[i] + a*T1[j]+b*T2[j]+c*T3[j]+d mod29.
// Both ordinary and mandatory transparent plaintext-F clocks.
// All printed separators ignored. Full family exact tetragram maximum.
const {tokenize,train,score,layouts}=require("./lp2_p27_p55_four_tape_shared_pad_sft.cjs");
const R=29,N=76,mod=x=>(x%R+R)%R;
const sub=Array.from({length:R},(_,d)=>Uint8Array.from({length:R},(_,v)=>mod(v-d)));
function attack(model,ls,ct){
 const zeros=ct.flatMap((v,i)=>v===0?[i]:[]);
 if(zeros.length>12)throw Error("mask bound");
 const masks=Array.from({length:2**zeros.length},(_,m)=>{
  const holds=new Uint8Array(N);zeros.forEach((i,j)=>{if(m>>j&1)holds[i]=1});return holds;
 });
 const result=[];
 for(const [layout,[A,B,C]] of ls){
  const pa=Array.from({length:R},(_,a)=>Uint8Array.from(A,v=>a*v%R));
  const pb=Array.from({length:R},(_,b)=>Uint8Array.from(B,v=>b*v%R));
  const pc=Array.from({length:R},(_,c)=>Uint8Array.from(C,v=>c*v%R));
  const key=new Uint8Array(N),res=new Uint8Array(N),p=new Uint8Array(N),ab=new Uint8Array(N);
  let ordinary=0,holdPaths=0,holdKeys=0;let top={ordinary:[],hold:[]};
  function submit(a,b,c,d,mode,mask,s,used){
   const arr=top[mode];if(arr.length===3&&s<=arr[2].score)return;
   const row={layout,coeff:[a,b,c,d],mode,mask,used,score:s,mean:s/N,p:[...p],key:Array.from(key,v=>(v+d)%R)};
   arr.push(row);arr.sort((x,y)=>y.score-x.score);if(arr.length>3)arr.pop();
  }
  function likelihood(d,holds){
   const map=sub[d];let ctx=0,s=0;
   for(let i=0;i<N;i++){const v=holds&&holds[i]?0:map[res[i]];p[i]=v;s+=model[Math.min(i,3)][ctx*R+v];ctx=(ctx*R+v)%24389;}
   return s;
  }
  for(let a=0;a<R;a++)for(let b=0;b<R;b++){
   for(let i=0;i<N;i++)ab[i]=(pa[a][i]+pb[b][i])%R;
   for(let c=0;c<R;c++){
    for(let i=0;i<N;i++){key[i]=(ab[i]+pc[c][i])%R;res[i]=mod(ct[i]-key[i]);}
    for(let d=0;d<R;d++){ordinary++;submit(a,b,c,d,"ordinary",null,likelihood(d,null),N);}
    let seen=0;
    for(let m=0;m<masks.length;m++){
     const holds=masks[m];let used=0,invalid=0;
     for(let i=0;i<N;i++)if(!holds[i]){const x=mod(ct[i]-key[used++]);res[i]=x;invalid|=1<<x;}
     let allowed=((1<<R)-1)&~invalid;seen|=allowed;
     while(allowed){const bit=allowed&-allowed,d=31-Math.clz32(bit);allowed^=bit;holdPaths++;submit(a,b,c,d,"hold",m,likelihood(d,holds),used);}
    }
    for(;seen;seen&=seen-1)holdKeys++;
   }
  }
  if(ordinary!==R**4)throw Error("ordinary count");
  for(const arr of Object.values(top))for(const r of arr){
   const k=r.key,p=r.p;let j=0;const replay=p.map(v=>r.mode==="hold"&&v===0?0:mod(v+k[j++]));
   if(String(replay)!==String(ct)||j!==r.used||Math.abs(score(model,p,4)-r.score)>1e-8)throw Error("replay");
  }
  result.push({layout,ordinary,holdPaths,holdKeys,top});
 }
 return result;
}
function experiment(corpus,raw,which="original"){
 const donors=raw.map(t=>tokenize(corpus,t)),cuts=donors.map(t=>Math.floor(t.length*.67)),model=train(donors.map((t,i)=>t.slice(0,cuts[i]))),ls=layouts(corpus);
 const fmt=r=>({...r,plaintext:r.p.map(v=>corpus.translit[v]).join("")});
 const coeffs=[[6,7,8,17],[11,4,2,9],[0,5,13,24],[9,10,10,3]];
 let p=null,ct,truth=null;
 if(which==="original")ct=ls[0][1][3];
 else{
  const j=Number(which),[a,b,c,d]=coeffs[j],hold=j%2===1,[layout,[A,B,C]]=ls[j];
  const donor=donors[j%3],off=cuts[j%3]+12000+j*1700;p=donor.slice(off,off+N);
  if(hold&&!p.includes(0)){for(let i=1;i<500;i++){p=donor.slice(off+i,off+i+N);if(p.includes(0))break;}}
  if(p.length!==N||hold&&!p.includes(0))throw Error("plant");
  const key=A.map((v,i)=>mod(a*v+b*B[i]+c*C[i]+d));let k=0;ct=p.map(v=>hold&&v===0?0:mod(v+key[k++]));
  truth={layout,coeff:[a,b,c,d],mode:hold?"hold":"ordinary",key,used:k,p,score:score(model,p,4)};
 }
 const result=attack(model,ls,ct);
 const best=result.flatMap(r=>Object.values(r.top).flat()).sort((a,b)=>b.score-a.score)[0];
 return {which,zeros:ct.filter(v=>v===0).length,truth,exact:p?best.p.filter((v,i)=>v===p[i]).length:null,best:fmt(best),all:result.map(r=>({...r,top:{ordinary:r.top.ordinary.map(fmt),hold:r.top.hold.map(fmt)}}))};
}
module.exports={experiment};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(x=>read("resources/control/"+x)),process.argv[2]||"original"),null,2));}
