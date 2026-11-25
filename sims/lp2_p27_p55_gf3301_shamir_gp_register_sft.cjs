"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus) {
  const q=3301,mod=x=>((x%q)+q)%q;
  function inv(a){let b=q,x=1,y=0;a=mod(a);while(b){const t=Math.floor(a/b);[a,b]=[b,a-t*b];[x,y]=[y,x-t*y]}if(a!==1)throw Error("noninvertible");return mod(x)}
  const p27=corpus.pages[27].indices,p55=corpus.pages[55].indices,p57=corpus.pages[57].indices;
  if(p27.length!==234||p55.length!==76||p27.slice(28,34).join()!==p55.slice(70).join())throw Error("source seam");
  const strip=p27.slice(34).concat(p27.slice(0,28)),I=Array.from({length:76},(_,i)=>i);
  const layouts=[
    ["marker-contiguous",I.map(i=>[strip[i],strip[i+76],strip[i+152]])],
    ["marker-interleaved",I.map(i=>strip.slice(3*i,3*i+3))],
    ["row-outer-trim",I.map(i=>[p27[i+1],p27[i+79],p27[i+157]])],
    ["triple-outer-trim",I.map(i=>p27.slice(3*(i+1),3*(i+2)))],
  ];
  const maps=[["index",Array.from({length:29},(_,i)=>i)],["prime",corpus.prime]];
  if(maps[1][1].length!==29||maps[1][1][0]!==2||maps[1][1][28]!==109)throw Error("prime register");
  function encrypt(P,T,E,a,b,sign,hold){
    const D=new Map(E.map((x,i)=>[x,i]));let j=0;
    return P.map(p=>{if(hold&&p===0)return 0;const t=T[j++].map(x=>E[x]);const k=mod(a*t[0]+b*t[1]+mod(1-a-b)*t[2]);return D.get(mod(E[p]+sign*k))??-1});
  }
  function attack(C,T,E,sign,hold){
    const decode=new Map(E.map((x,i)=>[x,i]));
    const zeros=I.filter(i=>C[i]===0),rows=T.map(t=>t.map(x=>E[x])).map(t=>[mod(t[0]-t[2]),mod(t[1]-t[2]),t[2]]);
    const nMasks=hold?2**zeros.length:1;
    const candidates=[],diagnostics=[];
    for(let mask=0;mask<nMasks;mask++){
      const skip=new Set(hold?zeros.filter((_,j)=>(mask>>j)&1):[]);
      const pos=I.filter(i=>!skip.has(i));
      let u=-1,w=-1,det=0;
      outer:for(let i=0;i<pos.length;i++)for(let j=i+1;j<pos.length;j++){
        let d=mod(rows[i][0]*rows[j][1]-rows[i][1]*rows[j][0]);
        if(d){u=i;w=j;det=d;break outer}
      }
      if(!det)throw Error("rank deficient: exact fallback required");
      const iv=inv(det),A=rows[u],B=rows[w];
      let anchor=0,firstFail=Array(pos.length).fill(0),complete=0;
      for(let x=hold?1:0;x<29;x++)for(let y=hold?1:0;y<29;y++){
        const s=mod(sign*(E[C[pos[u]]]-E[x])-A[2]),t=mod(sign*(E[C[pos[w]]]-E[y])-B[2]);
        const a=mod((s*B[1]-A[1]*t)*iv),b=mod((A[0]*t-s*B[0])*iv),c=mod(1-a-b);
        if(!a||!b||!c)continue;
        anchor++;
        const P=Array(76).fill(0);let valid=true;
        for(let j=0;j<pos.length;j++){
          const row=rows[j],k=mod(a*row[0]+b*row[1]+row[2]),p=decode.get(mod(E[C[pos[j]]]-sign*k));
          if(p===undefined||(hold&&p===0)){firstFail[j]++;valid=false;break}
          P[pos[j]]=p;
        }
        if(valid){complete++;if(encrypt(P,T,E,a,b,sign,hold).join()!==C.join())throw Error("replay");candidates.push({a,b,c,mask,P});}
      }
      diagnostics.push({mask,anchor,anchorRows:[u,w],firstFail,complete});
    }
    return {candidates,diagnostics};
  }
  const original=[];
  for(const [layout,T] of layouts)for(const [encoding,E] of maps)for(const sign of [1,-1])for(const hold of [false,true]){
    const a=attack(p55,T,E,sign,hold);original.push({layout,encoding,sign,hold,...a});
  }
  let state=0x33713301;
  const random=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n};
  const plants=[];
  for(const [encoding,E] of maps)for(const hold of [false,true]){
    const sign=hold?-1:1,a=hold?5:3,b=hold?q-7:q-3,c=mod(1-a-b);
    const pool=new Map();
    for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){
      const k=mod(a*E[x]+b*E[y]+c*E[z]);if(!pool.has(k))pool.set(k,[]);pool.get(k).push([x,y,z]);
    }
    const P=p57.slice(0,76),T=[],C=[];
    for(const p of P){
      if(hold&&p===0){C.push(0);continue}
      const choices=[];for(let cipher=0;cipher<29;cipher++){const k=mod(sign*(E[cipher]-E[p]));if(pool.has(k))choices.push([cipher,k])}
      const [cipher,k]=choices[random(choices.length)];const triples=pool.get(k);T.push(triples[random(triples.length)]);C.push(cipher);
    }
    while(T.length<76)T.push([random(29),random(29),random(29)]);
    if(encrypt(P,T,E,a,b,sign,hold).join()!==C.join())throw Error("plant encryption");
    const res=attack(C,T,E,sign,hold),found=res.candidates.filter(x=>x.a===a&&x.b===b&&x.P.join()===P.join());
    if(!found.length)throw Error("missed plant");
    plants.push({encoding,sign,hold,a,b,c,zeroCount:C.filter(x=>!x).length,candidates:res.candidates.length,exact:found.length,plaintextRecovered:76,T,C});
  }
  return {q,original,plants};
}
module.exports={experiment};
if(require.main===module){const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));console.log(JSON.stringify(experiment(corpus),null,2))}
