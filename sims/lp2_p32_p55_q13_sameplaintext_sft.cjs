"use strict";
// Exact #2615 repeated-passage gate using independent phase rotations and synchronized F holds.
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,gold){
  const q=13, all=(1<<29)-1, mod=x=>(x%29+29)%29;
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  /** Exact local solver from the relative-key constraints in #2545. */
  function scan(A,B){
    let calls=0, maxActive=0,maxPhysical=0,best=null;const hits=[];
    for(let offset=0;offset+B.length<=A.length;offset++){
      const delta=Array(q).fill(-1), forbidden=Array(q).fill(0);
      function dfs(i,j,holds){
        calls++;
        if(i>maxPhysical){maxPhysical=i;best={offset,physical:i,active:j,holds,delta:[...delta]}}
        if(j>maxActive)maxActive=j;
        if(i===B.length){hits.push({offset,active:j,holds,delta:[...delta],forbidden:[...forbidden]});return}
        const x=A[offset+i],y=B[i],p=j%q,d=mod(x-y),old=delta[p],mask=forbidden[p],next=mask|(1<<x);
        if((old===-1||old===d)&&next!==all){
          delta[p]=d;forbidden[p]=next;
          dfs(i+1,j+1,holds);
          delta[p]=old;forbidden[p]=mask;
        }
        if(x===0&&y===0)dfs(i+1,j,holds+1);
      }
      dfs(0,0,0);
    }
    return {placements:A.length-B.length+1,calls,maxActive,maxPhysical,best,hits};
  }
  let seed=0x2615a005;
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
  const native=s=>[...s.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
  const welcome=native(gold.sections.find(s=>s.name==="0_welcome"));
  let bestRep={n:0};
  for(const s of gold.sections.filter(s=>s.name.toLowerCase().includes("koan"))){
    const P=native(s);
    for(let a=0;a<P.length;a++)for(let b=a+1;b<P.length;b++){
      let n=0;while(b+n<P.length&&n<b-a&&P[a+n]===P[b+n])n++;
      if(n>bestRep.n)bestRep={a,b,n,P,name:s.name}
    }
  }
  function enc(P,K,start){
    let j=start;return P.map(p=>p===0?0:mod(p+K[(j++)%q]));
  }
  const plants=[];
  for(let i=0;i<6;i++){
    const P=welcome.slice(30+i,106+i),offset=5+7*i;
    const source=welcome.slice(125,125+offset).concat(P,welcome.slice(250,250+45-offset));
    const K=Array.from({length:q},()=>random()%29),J=Array.from({length:q},()=>random()%29),u=random()%q,v=random()%q;
    const phase=(u+source.slice(0,offset).filter(x=>x!==0).length)%q;
    // Force one ordinary double zero while preserving the actual transparent Fs.
    const first=P.find(x=>x!==0);K[phase]=J[v]=mod(-first);
    const A=enc(source,K,u),B=enc(P,J,v);
    const D=Array.from({length:q},(_,j)=>mod(K[(phase+j)%q]-J[(v+j)%q]));
    const z=scan(A,B),expected=z.hits.find(h=>h.offset===offset&&h.delta.every((x,j)=>x===D[j])&&h.active===P.filter(x=>x!==0).length);
    check(expected&&z.hits.every(h=>h.offset===offset),"native 76 relative key/placement");
    plants.push({offset,hits:z.hits.length,active:expected.active,holds:expected.holds,deltaRecovered:true,generatedDoubleZero:A.slice(offset,offset+76).some((x,j)=>P[j]!==0&&x===0&&B[j]===0)});
  }
  const {P,a,b,n,name}=bestRep;
  const K=Array.from({length:q},()=>random()%29),J=Array.from({length:q},()=>random()%29);
  const C=enc(P,K,4),D=enc(P,J,9);
  const z=scan(C.slice(a-10,a+n+10),D.slice(b,b+n));
  check(z.hits.some(h=>h.offset===10),"actual native repeat recovery");
  const A=corpus.pages.find(x=>x.page===32).indices,B=corpus.pages.find(x=>x.page===55).indices;
  check(A.length===121&&B.length===76,"page sizes");
  const original=scan(A,B);
  return {q,original,plants,nativeActualRepeat:{name,a,b,n,fullHit:z.hits.some(h=>h.offset===10)}};
}
if(require.main===module){const root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={run};
