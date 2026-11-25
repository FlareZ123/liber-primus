"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(gp, native) {
  const Q=29, mod=x=>(x%Q+Q)%Q;
  const inv=Array.from({length:Q},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(b=>a*b%Q===1):0);
  const H=k=>[mod(k[0]-k[3]),mod(k[1]-k[2]),mod(k[1]+k[2]),mod(k[0]+k[3])];
  const Hinv=s=>[mod(15*(s[3]+s[0])),mod(15*(s[2]+s[1])),mod(15*(s[2]-s[1])),mod(15*(s[3]-s[0]))];
  function perms(a){if(!a.length)return [[]];return a.flatMap((v,i)=>perms(a.filter((_,j)=>j!==i)).map(x=>[v,...x]));}
  const permutations=perms([0,1,2,3]);
  const rune=new Map(gp.runes.map((x,i)=>[x,i]));
  const texts=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>rune.has(x)).map(x=>rune.get(x))}));
  function model(excluded){
    const counts=new Float64Array(29**3), context=new Float64Array(29**2),bi=new Float64Array(29**2),bc=new Float64Array(29);
    for(const t of texts)if(t.name!==excluded)for(let i=1;i<t.p.length;i++){const p=t.p;bi[p[i-1]*29+p[i]]++;bc[p[i-1]]++;if(i>=2){const j=p[i-2]*29+p[i-1];counts[j*29+p[i]]++;context[j]++;}}
    return Float64Array.from(counts,(v,i)=>{const j=Math.floor(i/29),b=j%29,c=i%29;return Math.log((v+10*(bi[b*29+c]+.3)/(bc[b]+8.7))/(context[j]+10))});
  }
  function keyTape(seed,a,b,perm,n){
    const out=new Int16Array((2*n+1)*4);
    const put=(t,s)=>out.set(Hinv(s),4*(t+n));
    let s=seed;put(0,s);
    for(let t=1;t<=n;t++){s=perm.map(j=>mod(a*s[j]+b));put(t,s);}
    s=seed;
    for(let t=-1;t>=-n;t--){const p=new Array(4);for(let j=0;j<4;j++)p[perm[j]]=mod(inv[a]*(s[j]-b));s=p;put(t,s);}
    return out;
  }
  function bestSide(C,tape,n,start,dir,ctx,lm,hold){
    let best=-Infinity,bestPath=null,legal=0;
    const P=new Int16Array(C.length);
    function walk(i,k,x,y,score){
      while(i<C.length){
        const c=C[i],s=tape[4*n+k];
        if(s===undefined)throw Error("tape bounds");
        if(hold&&c===0){
          P[i]=0;const z=dir===1?lm[(x*29+y)*29]:lm[y*29+x];
          walk(i+1,k,y,0,score+z);
        }
        const p=mod(c-s);if(hold&&p===0)return;
        P[i]=p;score+=dir===1?lm[(x*29+y)*29+p]:lm[(p*29+y)*29+x];x=y;y=p;k+=dir;i++;
      }
      legal++;if(score>best){best=score;bestPath=Array.from(P);}
    }
    walk(0,start,ctx[0],ctx[1],0);
    return {score:best,path:bestPath,legal};
  }
  function solve(C,crib,offset,hold,lm){
    const left=C.slice(0,offset).reverse(),right=C.slice(offset+4),seed=H(C.slice(offset,offset+4).map((c,i)=>mod(c-crib[i]))),n=Math.ceil(C.length/4)+1;
    let top=null,legalModels=0,legalPaths=0,models=0,ties=0;
    for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(const perm of permutations){
      models++;const tape=keyTape(seed,a,b,perm,n);
      const fit=bestSide(right,tape,n,4,1,crib.slice(2),lm,hold);
      legalPaths+=fit.legal;if(!fit.legal)continue;legalModels++;
      if(!top||fit.score>top.fit.score+1e-10){top={a,b,perm,fit};ties=1;}
      else if(Math.abs(fit.score-top.fit.score)<=1e-10)ties++;
    }
    if(!top)return {models,legalModels,legalPaths};
    const tape=keyTape(seed,top.a,top.b,top.perm,n);
    const pred=bestSide(left,tape,n,-1,-1,[crib[1],crib[0]],lm,hold);
    const decoded=pred.path?pred.path.slice().reverse().concat(crib,top.fit.path):null;
    if(decoded&&encrypt(decoded,offset,seed,top,hold).some((c,i)=>c!==C[i]))throw Error("forward replay");
    return {seed,models,legalModels,legalPaths,ties,selected:{a:top.a,b:top.b,perm:top.perm},fitScore:top.fit.score/right.length,holdoutScore:pred.legal?pred.score/left.length:null,holdoutPaths:pred.legal,decoded,fit:top.fit.path,held:pred.path?.slice().reverse()??null};
  }
  function encrypt(P,offset,seed,truth,hold){
    const n=Math.ceil(P.length/4)+1,tape=keyTape(seed,truth.a,truth.b,truth.perm,n),C=new Array(P.length);
    let k=0;for(let i=offset;i<P.length;i++){if(hold&&P[i]===0)C[i]=0;else C[i]=mod(P[i]+tape[4*n+k++]);}
    k=-1;for(let i=offset-1;i>=0;i--){if(hold&&P[i]===0)C[i]=0;else C[i]=mod(P[i]+tape[4*n+k--]);}
    return C;
  }
  const controls=[];
  for(const [j,t] of texts.filter(t=>t.p.length>=160).slice(0,3).entries()){
    let start=17+j*11;while(t.p.slice(start+55,start+59).includes(0))start++;
    const P=t.p.slice(start,start+98);if(P.length!==98)throw Error("donor length");
    const seed=[13+j,3+j,17-j,9+j],truth=[{a:7,b:13,perm:[2,0,3,1]},{a:19,b:3,perm:[1,3,0,2]},{a:11,b:17,perm:[3,1,0,2]}][j];
    const lm=model(t.name);
    for(const hold of [false,true]){
      const C=encrypt(P,55,seed,truth,hold),s=solve(C,P.slice(55,59),55,hold,lm);
      controls.push({donor:t.name,start,hold,truth,seed,...s,fitCorrect:s.fit?.filter((x,i)=>x===P[i+59]).length,heldCorrect:s.held?.filter((x,i)=>x===P[i]).length});
    }
  }
  const C=gp.pages.find(p=>p.page===37).indices.slice(91,189),crib=[20,1,5,5];
  if(C.length!==98||C.slice(55,59).join()!=="3,2,6,27")throw Error("source anchor");
  const original=[false,true].map(hold=>({hold,...solve(C,crib,55,hold,model(null))}));
  const compact=x=>({...x,decoded:x.decoded?.map(i=>gp.translit[i]).join("")??null,fit:x.fit?.map(i=>gp.translit[i]).join("")??null,held:x.held?.map(i=>gp.translit[i]).join("")??null});
  return {method:"H4 shell S_(t+1)[j] = a*S_t[perm[j]]+b mod29; all 28*29*24 transitions, exact forward paths and frozen backward holdout",controls:controls.map(compact),original:original.map(compact)};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
