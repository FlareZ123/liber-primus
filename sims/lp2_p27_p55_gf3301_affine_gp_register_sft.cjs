"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus) {
  const Q=3301,m=x=>((x%Q)+Q)%Q;
  function inv(a){let b=Q,x=1,y=0;a=m(a);while(b){const t=Math.floor(a/b);[a,b]=[b,a-t*b];[x,y]=[y,x-t*y]}if(a!==1)throw Error("noninvertible");return m(x)}
  const p27=corpus.pages[27].indices,p55=corpus.pages[55].indices,p57=corpus.pages[57].indices;
  if(p27.length!==234||p55.length!==76||p27.slice(28,34).join()!==p55.slice(70).join())throw Error("source seam");
  const strip=p27.slice(34).concat(p27.slice(0,28)),I=Array.from({length:76},(_,i)=>i);
  const layouts=[
    ["marker-contiguous",I.map(i=>[strip[i],strip[i+76],strip[i+152]])],
    ["marker-interleaved",I.map(i=>strip.slice(3*i,3*i+3))],
    ["row-outer-trim",I.map(i=>[p27[i+1],p27[i+79],p27[i+157]])],
    ["triple-outer-trim",I.map(i=>p27.slice(3*(i+1),3*(i+2)))],
  ],maps=[["index",Array.from({length:29},(_,i)=>i)],["prime",corpus.prime]];
  function getAnchor(rows,n){
    const mat=rows.slice(0,n).map((r,i)=>[...r,i]);let rank=0;
    const ids=[];
    for(let col=0;col<4;col++){
      let k=rank;while(k<n&&!mat[k][col])k++;
      if(k===n)throw Error("rank deficient");
      [mat[rank],mat[k]]=[mat[k],mat[rank]];ids.push(mat[rank][4]);const s=inv(mat[rank][col]);
      for(let j=0;j<4;j++)mat[rank][j]=m(mat[rank][j]*s);
      for(let i=rank+1;i<n;i++){const t=mat[i][col];for(let j=0;j<4;j++)mat[i][j]=m(mat[i][j]-t*mat[rank][j])}
      rank++;
    }
    const a=ids.map((id,i)=>[...rows[id],...Array.from({length:4},(_,j)=>+(i===j))]);
    for(let col=0;col<4;col++){
      let k=col;while(k<4&&!a[k][col])k++;
      if(k===4)throw Error("anchor rank");
      [a[col],a[k]]=[a[k],a[col]];const s=inv(a[col][col]);for(let j=0;j<8;j++)a[col][j]=m(a[col][j]*s);
      for(let i=0;i<4;i++)if(i!==col){let t=a[i][col];for(let j=0;j<8;j++)a[i][j]=m(a[i][j]-t*a[col][j])}
    }
    return {ids,inv:a.map(r=>r.slice(4))};
  }
  function enc(P,T,E,coef,hold){
    const D=new Map(E.map((x,i)=>[x,i]));let j=0;
    return P.map(p=>{if(hold&&p===0)return 0;const t=T[j++].map(x=>E[x]);const k=m(coef[0]*t[0]+coef[1]*t[1]+coef[2]*t[2]+coef[3]);return D.get(m(E[p]+k))??-1});
  }
  function attack(C,T,E,hold){
    const D=new Int16Array(Q).fill(-1);E.forEach((x,i)=>D[x]=i);
    const zeros=I.filter(i=>C[i]===0),rows=T.map(t=>[...t.map(x=>E[x]),1]);
    if(zeros.length>12&&hold)throw Error("excess mask count");
    const outputs=[];
    for(let mask=0;mask<(hold?2**zeros.length:1);mask++){
      const skip=new Set(hold?zeros.filter((_,j)=>(mask>>j)&1):[]);
      const pos=I.filter(i=>!skip.has(i)),A=getAnchor(rows,pos.length),n=pos.length;
      const alphabet=hold?E.slice(1):E;
      const active=A.ids.map((i,k)=>alphabet.map(p=>A.inv.map(r=>m(r[k]*(E[C[pos[i]]]-p)))));
      const checkOrder=Array.from({length:n},(_,i)=>i).filter(i=>!A.ids.includes(i));
      const fails=new Int32Array(n);let count=0;
      const coef=[0,0,0,0];
      const solutions=[];
      for(const a of active[0])for(const b of active[1])for(const c of active[2])for(const d of active[3]){
        count++;
        for(let k=0;k<4;k++)coef[k]=(a[k]+b[k]+c[k]+d[k])%Q;
        let ok=true;
        for(const j of checkOrder){
          const row=rows[j],p=D[m(E[C[pos[j]]]-coef[0]*row[0]-coef[1]*row[1]-coef[2]*row[2]-coef[3])];
          if(p<0||(hold&&p===0)){fails[j]++;ok=false;break}
        }
        if(!ok)continue;
        const P=Array(76).fill(0);
        for(let j=0;j<n;j++){const row=rows[j];P[pos[j]]=D[m(E[C[pos[j]]]-coef[0]*row[0]-coef[1]*row[1]-coef[2]*row[2]-coef[3])]}
        const key=coef.slice();
        if(enc(P,T,E,key,hold).join()!==C.join())throw Error("replay");
        solutions.push({coef:key,shareDependent:key.slice(0,3).some(Boolean),P});
      }
      outputs.push({mask,anchorRows:A.ids,count,fails:Array.from(fails),solutions});
    }
    return outputs;
  }
  const original=[];
  for(const [layout,T] of layouts)for(const [encoding,E] of maps)for(const hold of [false,true]){
    const rows=attack(p55,T,E,hold);
    original.push({layout,encoding,hold,rows});
  }
  let s=0x3301aabb;const rand=n=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s%n};
  const plants=[];
  for(const [encoding,E] of maps)for(const hold of [false,true]){
    const coef=hold?[5,Q-7,3,11]:[3,Q-3,1,5],pool=new Map();
    for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){
      const k=m(coef[0]*E[x]+coef[1]*E[y]+coef[2]*E[z]+coef[3]);if(!pool.has(k))pool.set(k,[]);pool.get(k).push([x,y,z]);
    }
    const P=p57.slice(0,76),T=[],C=[];
    for(const p of P){
      if(hold&&p===0){C.push(0);continue}
      const options=[];for(let cipher=0;cipher<29;cipher++){const k=m(E[cipher]-E[p]);if(pool.has(k))options.push([cipher,k])}
      const [cipher,k]=options[rand(options.length)];const triples=pool.get(k);T.push(triples[rand(triples.length)]);C.push(cipher);
    }
    while(T.length<76)T.push([rand(29),rand(29),rand(29)]);
    if(enc(P,T,E,coef,hold).join()!==C.join())throw Error("plant encryption");
    const rows=attack(C,T,E,hold),solutions=rows.flatMap(x=>x.solutions),found=solutions.filter(x=>x.coef.join()===coef.join()&&x.P.join()===P.join());
    if(!found.length)throw Error("plant failed");
    plants.push({encoding,hold,coef,T,C,zeroCount:C.filter(x=>!x).length,candidates:solutions.length,exact:found.length,plaintextRecovered:76});
  }
  return {Q,original,plants};
}
module.exports={experiment};
if(require.main===module){const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));console.log(JSON.stringify(experiment(corpus),null,2))}
