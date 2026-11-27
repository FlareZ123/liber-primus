'use strict';
const fs=require('node:fs');
function experiment(profile,native){
  const alphabet="0123456789abcdefghijklmnopqrs", toIndices=s=>Array.from(s,x=>alphabet.indexOf(x)), compact=v=>v.map(x=>alphabet[x]).join(""), mod=x=>(x%29+29)%29;
  const runeMap=new Map(native.runes.map((r,i)=>[r,i]));
  const records=native.sections.map(s=>({name:s.name,v:Array.from(s.source_text).filter(x=>runeMap.has(x)).map(x=>runeMap.get(x))}));
  const K=toIndices(profile.p54.heading_groups[1]), train=toIndices(profile.p54.body_groups.join("")), held=toIndices(profile.p55.groups.join(""));
  if(K.length!==8||train.length!==223||held.length!==76)throw Error("input geometry");
  const scoreTable=excluded=>{
    const u=new Float64Array(29),b=new Float64Array(841),bt=new Float64Array(29),t=new Float64Array(24389),tt=new Float64Array(841);
    let total=0;
    for(const r of records.filter(r=>r.name!==excluded&&!r.name.startsWith("p5"))){
      for(let i=0;i<r.v.length;i++){const c=r.v[i];u[c]++;total++;if(i){let a=r.v[i-1];b[29*a+c]++;bt[a]++;}if(i>=2){let x=r.v[i-2]*29+r.v[i-1];t[29*x+c]++;tt[x]++;}}
    }
    const out=new Float64Array(24389);
    for(let a=0;a<29;a++)for(let b0=0;b0<29;b0++)for(let c=0;c<29;c++){
      let p=(u[c]+.5)/(total+14.5),q=(b[b0*29+c]+8*p)/(bt[b0]+8),j=a*29+b0;
      out[29*j+c]=Math.log((t[29*j+c]+8*q)/(tt[j]+8));
    }return out;
  };
  const inv=(c,j,a,r)=>mod((a<2?1:-1)*(c-(a%2?-K[j]:K[j])-(a>=2?r:0)));
  const forward=(p,j,a,r)=>mod((a<2?1:-1)*p+(a%2?-K[j]:K[j])+(a>=2?r:0));
  function enc(v,a,start,r){let j=start,mask=[],c=[];for(let i=0;i<v.length;i++){const p=v[i];if(p===0){mask.push(i);c.push(0);}else{c.push(forward(p,j,a[j],r));j=(j+1)%8;}}return {c,end:j,mask};}
  function enumerate(c,visit,starts=[0,1,2,3,4,5,6,7]){
    const z=c.map((x,i)=>x===0?i:-1).filter(x=>x>=0);
    if(z.length>20)throw Error("too many zero positions for exact mask enumeration");
    for(let bits=0;bits<2**z.length;bits++){const h=new Set(z.filter((_,i)=>bits&(1<<i)));for(const start of starts){let j=start;const ph=c.map((_,i)=>{if(h.has(i))return -1;let k=j;j=(j+1)%8;return k;});visit(ph,start,j,[...h]);}}
  }
  function fit(c,S,r){
    let best=null,ties=0,legalHist=0,keys=0,hist=0;const options=Array.from({length:8},(_,j)=>Array.from({length:4},(_,a)=>Array.from({length:29},(_,x)=>inv(x,j,a,r))));
    enumerate(c,(ph,start,end,mask)=>{
      hist++;const allow=Array.from({length:8},()=>[0,1,2,3]);for(let i=0;i<c.length;i++)if(ph[i]>=0){const j=ph[i];allow[j]=allow[j].filter(a=>options[j][a][c[i]]!==0);if(!allow[j].length)return;}
      legalHist++;
      const tr=Array.from({length:8},()=>[]);let constant=0;
      for(let i=2;i<c.length;i++){let first=-1;for(let k=i-2;k<=i;k++)if(ph[k]>=0){first=ph[k];break;}if(first<0){constant+=S[0];continue;}tr[first].push(i);}
      const f=Array.from({length:8},()=>new Float64Array(64));
      for(let j=0;j<8;j++)for(const a of allow[j])for(const b of allow[(j+1)%8])for(const d of allow[(j+2)%8]){
        const sel=[a,b,d];let val=0;for(const i of tr[j]){let index=0;for(let k=i-2;k<=i;k++){const q=ph[k];let p=0;if(q>=0){const off=(q-j+8)%8;if(off>2)throw Error("nonlocal factor");p=options[q][sel[off]][c[k]];}index=index*29+p;}val+=S[index];}f[j][a*16+b*4+d]=val;
      }
      const a=Array(8).fill(0);
      function search(j){if(j<8){for(const x of allow[j]){a[j]=x;search(j+1);}return;}keys++;let value=constant;for(let k=0;k<8;k++)value+=f[k][a[k]*16+a[(k+1)%8]*4+a[(k+2)%8]];
        if(!best||value>best.value+1e-9){best={value,a:a.slice(),start,end,mask};ties=1;}else if(Math.abs(value-best.value)<=1e-9)ties++;
      }search(0);
    });
    if(best){let h=new Set(best.mask),j=best.start;best.p=c.map((x,i)=>{if(h.has(i))return 0;const p=inv(x,j,best.a[j],r);j=(j+1)%8;return p;});const chk=enc(best.p,best.a,best.start,r);if(JSON.stringify(chk.c)!==JSON.stringify(c)||chk.end!==best.end)throw Error("train replay");}
    return {best,ties,legalHist,keys,hist};
  }
  function continuation(c,S,r,fit){
    if(!fit.best)return null;const a=fit.best.a;let best=null,paths=0,ties=0;enumerate(c,(ph,start,end,mask)=>{let p=c.map((x,i)=>ph[i]<0?0:inv(x,ph[i],a[ph[i]],r));if(p.some((x,i)=>x===0&&ph[i]>=0))return;paths++;const q=fit.best.p.slice(-2).concat(p);let value=0;for(let i=2;i<q.length;i++)value+=S[q[i-2]*841+q[i-1]*29+q[i]];if(!best||value>best.value+1e-9){best={p,value,mask,end};ties=1;}else if(Math.abs(value-best.value)<=1e-9)ties++;},[fit.best.end]);if(best&&JSON.stringify(enc(best.p,a,fit.best.end,r).c)!==JSON.stringify(c))throw Error("held replay");return {best,paths,ties};
  }
  function run(c,h,S,r){const f=fit(c,S,r),z=continuation(h,S,r,f);return {r,zeroTrain:c.filter(x=>!x).length,zeroHeld:h.filter(x=>!x).length,hist:f.hist,legalHist:f.legalHist,keys:f.keys,fitTies:f.ties,fit:f.best&&{a:f.best.a,start:f.best.start,end:f.best.end,mask:f.best.mask,mean:f.best.value/(c.length-2),p:compact(f.best.p)},held:z&&{paths:z.paths,ties:z.ties,best:z.best&&{mean:z.best.value/h.length,p:compact(z.best.p),mask:z.best.mask}}};}
  const plants=[{name:"0_koan_1",r:28,a:[0,3,1,2,2,0,3,1],start:3},{name:"0_loss_of_divinity",r:0,a:[1,0,2,3,0,2,1,3],start:5},{name:"jpg107-167",r:28,a:[3,1,0,2,1,3,2,0],start:1}];
  const controls=plants.map(s=>{let p=records.find(x=>x.name===s.name).v.slice(0,299),e=enc(p,s.a,s.start,s.r),S=scoreTable(s.name),out=run(e.c.slice(0,223),e.c.slice(223),S,s.r);return {...s,...out,trainCorrect:out.fit?toIndices(out.fit.p).filter((x,i)=>x===p[i]).length:0,heldCorrect:out.held?.best?toIndices(out.held.best.p).filter((x,i)=>x===p[223+i]).length:0,actionCorrect:out.fit&&JSON.stringify(out.fit.a)===JSON.stringify(s.a)&&out.fit.start===s.start};});
  const passed=controls.every(x=>x.actionCorrect&&x.trainCorrect===223&&x.heldCorrect===76);
  const original=passed?[0,28].map(r=>run(train,held,scoreTable(null),r)):[];
  return {K,controls,passed,original};
}
const profile=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-page-groups-54-55-derived.json','utf8'));
const native=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
console.log(JSON.stringify(experiment(profile,native),null,2));
