'use strict';
// Shared long affine BASE29 low-order key recovery. Run with Node.js 22.
const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpus, trainingText, plantTexts) {
  const M=29,N=64,W=256,assert=(b,m)=>{if(!b)throw Error(m)},mod=x=>((x%M)+M)%M;
  const glyph=new Map(corpus.translit.map((x,i)=>[x,i]));
  function native(text){
    const out=[];
    for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");
      for(const t of w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[])out.push(glyph.get(t==="ING"?"NG":t));
    }assert(out.every(Number.isInteger),"native map");return out;
  }
  const train=native(trainingText).reverse(),u=new Float64Array(29).fill(.5),bi=new Float64Array(29**2).fill(.1),tri=new Float64Array(29**3).fill(.025);
  for(let i=0;i<train.length;i++){u[train[i]]++;if(i)bi[29*train[i-1]+train[i]]++;if(i>1)tri[841*train[i-2]+29*train[i-1]+train[i]]++}
  const ut=u.reduce((s,x)=>s+x,0),bt=Array.from({length:29},(_,i)=>bi.slice(i*29,(i+1)*29).reduce((s,x)=>s+x,0)),tt=Array.from({length:841},(_,i)=>tri.slice(i*29,(i+1)*29).reduce((s,x)=>s+x,0));
  const L0=Float64Array.from(u,x=>Math.log(x/ut)),L1=Float64Array.from(bi,(x,i)=>Math.log(.85*x/bt[Math.floor(i/29)]+.15*u[i%29]/ut)),L2=Float64Array.from(tri,(x,i)=>Math.log(.60*x/tt[Math.floor(i/29)]+.30*bi[i%841]/bt[Math.floor(i/29)%29]+.10*u[i%29]/ut));
  function score(p){let s=L0[p[0]]+L1[29*p[0]+p[1]];for(let i=2;i<p.length;i++)s+=L2[841*p[i-2]+29*p[i-1]+p[i]];return s/p.length}
  function toInt(d){let v=0n;for(let i=d.length-1;i>=0;i--)v=v*29n+BigInt(d[i]);return v}
  const modulus=29n**BigInt(N);
  function digits(x){x=(x%modulus+modulus)%modulus;let out=[];for(let i=0;i<N;i++){out.push(Number(x%29n));x/=29n}return out}
  function inverse(a){let r=modulus,s=a,t=0n,u=1n;while(s){const q=r/s;[r,s]=[s,r-q*s];[t,u]=[u,t-q*u]}assert(r===1n,"unit");return (t%modulus+modulus)%modulus}
  const eq=(x,y)=>x.length===y.length&&x.every((v,i)=>v===y[i]);
  function decode(c,A,B){return digits(toInt(A)*toInt(c)+toInt(B))}
  function encode(p,A,B){return digits((toInt(p)-toInt(B))*inverse(toInt(A)))}
  function ascii(p){return Array.from(p).reverse().map(i=>corpus.translit[i]).join("")}
  // All current candidates at a depth evaluated, only W best cumulative
  // prefix hypotheses retained; no assertion of all-key optimality.
  function solve(cs){
    const T=cs.length;
    let beam=[{A:[],B:[],carry:new Int32Array(T),last:new Uint8Array(T),prev:new Uint8Array(T),s:0}];
    const margins=[];
    for(let d=0;d<N;d++){
      const heap=[];
      function push(v){
        if(heap.length===W&&v.s<=heap[0].s)return;
        if(heap.length<W){let i=heap.length;heap.push(v);while(i){let p=(i-1)>>1;if(heap[p].s<=v.s)break;heap[i]=heap[p];i=p;}heap[i]=v;}
        else{let i=0;while(true){let l=2*i+1;if(l>=heap.length)break;let k=l+1<heap.length&&heap[l+1].s<heap[l].s?l+1:l;if(heap[k].s>=v.s)break;heap[i]=heap[k];i=k;}heap[i]=v;}
      }
      for(let pi=0;pi<beam.length;pi++){
        const state=beam[pi],base=new Int32Array(T),off=new Int32Array(T);
        for(let j=0;j<T;j++){
          let v=state.carry[j];for(let t=0;t<d;t++)v+=state.A[t]*cs[j][d-t];base[j]=v;
          off[j]=d===0?0:d===1?29*state.last[j]:841*state.prev[j]+29*state.last[j];
        }
        const L=d===0?L0:d===1?L1:L2;
        for(let a=d===0?1:0;a<29;a++){
          const shifted=Int32Array.from(base,(v,j)=>v+a*cs[j][0]);
          for(let b=0;b<29;b++){
            let v=state.s;for(let j=0;j<T;j++)v+=L[off[j]+(shifted[j]+b)%29];
            if(heap.length<W||v>heap[0].s)push({s:v,pi,a,b});
          }
        }
      }
      beam=heap.sort((x,y)=>y.s-x.s||x.pi-y.pi||x.a-y.a||x.b-y.b).map(({s,pi,a,b})=>{
        const state=beam[pi],carry=new Int32Array(T),last=new Uint8Array(T);
        for(let j=0;j<T;j++){let v=state.carry[j]+b+a*cs[j][0];for(let t=0;t<d;t++)v+=state.A[t]*cs[j][d-t];last[j]=v%29;carry[j]=Math.floor(v/29)}
        return {A:[...state.A,a],B:[...state.B,b],s,carry,last,prev:state.last};
      });
      if((d+1)%8===0)margins.push({depth:d+1,best:beam[0].s/(T*(d+1)),cutoff:beam.at(-1).s/(T*(d+1))});
    }
    const top=beam[0],p=cs.map(c=>decode(c,top.A,top.B)),check=p.reduce((s,v)=>s+score(v),0)/T;
    assert(Math.abs(check-top.s/(T*N))<1e-10,"beam / full integer score mismatch");
    return {A:top.A,B:top.B,trainScore:check,margins,trainPlain:p,beamGap:top.s-beam[1].s};
  }
  const dev=[1,2,3,4,5,6,7],held=[0,8],ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  function evaluate(cs,fit){
    const p=held.map(j=>decode(cs[j],fit.A,fit.B));
    assert(cs.every((c,j)=>eq(encode(decode(c,fit.A,fit.B),fit.A,fit.B),c)),"integer replay");
    return {holdScores:p.map(score),holdPlain:p,holdText:p.map(ascii),replay:true};
  }
  const controls=[];
  for(let z=0;z<plantTexts.length;z++){
    let state=(0x33010001+z*0x2717)>>>0;function next(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
    const A=Array.from({length:N},(_,i)=>i?next()%29:1+next()%28),B=Array.from({length:N},()=>next()%29);
    const donor=native(plantTexts[z]);assert(donor.length>=N*9,"plant source");
    const p=Array.from({length:9},(_,j)=>donor.slice(j*N,(j+1)*N).reverse()),cs=p.map(x=>encode(x,A,B));
    const fit=solve(dev.map(j=>cs[j])),pred=evaluate(cs,fit),correct=cs.map((c,j)=>decode(c,fit.A,fit.B).filter((v,i)=>v===p[j][i]).length);
    controls.push({trueA:A,trueB:B,fit,correct,keyDigitsCorrect:fit.A.filter((v,i)=>v===A[i]).length+fit.B.filter((v,i)=>v===B[i]).length,hold:pred,pass:eq(A,fit.A)&&eq(B,fit.B)&&correct.every(v=>v===N)});
  }
  const gate=controls.every(c=>c.pass);
  let original=null;
  if(gate){
    const cs=ranges.map(([a,b])=>corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).slice(-N).reverse());
    assert(cs.every(c=>c.length===N),"original dimensions");
    const fit=solve(dev.map(j=>cs[j])),hold=evaluate(cs,fit);
    original={fit,hold,devText:fit.trainPlain.map(ascii),rawHoldScores:held.map(j=>score(cs[j])),rawDevScore:dev.reduce((s,j)=>s+score(cs[j]),0)/dev.length,endpointDigits:cs.map(c=>c[0]),ranges};
  }
  return {width:W,digits:N,dev,held,ranges,trainingRunes:train.length,controls,gate,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const c=JSON.parse(read(paths[0]));const training=read(paths[1]);const shakespeare=read(paths[2]).split(/\r?\n/).slice(0,300).join('\n');
console.log(JSON.stringify(experiment(c,training,[shakespeare,read(paths[3])]),null,2));
