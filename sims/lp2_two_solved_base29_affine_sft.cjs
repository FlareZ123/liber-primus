'use strict';
// Exact two-solved-page positional BASE29 affine key inference.
const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpus,trainText){
  const N=85,M=29n,Q=M**BigInt(N),mod=(x,m)=>((x%m)+m)%m,assert=(b,m)=>{if(!b)throw Error(m)};
  const glyph=new Map(corpus.translit.map((x,i)=>[x,i]));
  function native(text){const out=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");for(const t of w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[])out.push(glyph.get(t==="ING"?"NG":t))}assert(out.every(Number.isInteger),"native map");return out}
  const train=native(trainText),counts=new Float64Array(841).fill(.5),totals=new Float64Array(29).fill(14.5);
  for(let i=1;i<train.length;i++){counts[29*train[i-1]+train[i]]++;totals[train[i-1]]++}
  const logp=Array.from(counts,(v,i)=>Math.log(v/totals[Math.floor(i/29)]));
  function score(p){let s=0;for(let i=1;i<p.length;i++)s+=logp[29*p[i-1]+p[i]];return s/(p.length-1)}
  function ioc(p){let h=new Uint32Array(29);for(const x of p)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1))}
  function toInt(d){let x=0n;for(let i=d.length-1;i>=0;i--)x=x*M+BigInt(d[i]);return x}
  function digits(x){x=mod(x,Q);const out=[];for(let i=0;i<N;i++){out.push(Number(x%M));x/=M}return out}
  function inverse(a){let r=Q,s=mod(a,Q),t=0n,u=1n;while(s){const q=r/s;[r,s]=[s,r-q*s];[t,u]=[u,t-q*u]}assert(r===1n,"nonunit difference");return mod(t,Q)}
  function fit(c0,p0,c1,p1){
    const d=mod(c0-c1,Q),e=mod(p0-p1,Q);
    assert(d%M!==0n,"source endpoint difference must be unit");
    const A=mod(e*inverse(d),Q),B=mod(p0-A*c0,Q);
    assert(mod(A*c0+B,Q)===p0&&mod(A*c1+B,Q)===p1,"two anchors");
    return {A,B,unit:A%M!==0n,deltaC:Number(d%M),deltaP:Number(e%M)};
  }
  const c56=corpus.pages.find(p=>p.page===56).indices,c57=corpus.pages.find(p=>p.page===57).indices;
  assert(c56.length===85&&c57.length===95,"source geometry");
  const primes=[];for(let x=2;primes.length<84;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)primes.push(x)}
  let q=0;const p56=c56.map((v,i)=>i===56?0:((v-(primes[q++]-1))%29+29)%29);
  assert(q===84&&primes.at(-1)===433&&c56[56]===0,"literal F control");
  const replay=p56.map((v,i)=>i===56?0:null);q=0;for(let i=0;i<N;i++)if(i!==56)replay[i]=(p56[i]+primes[q++]-1)%29;
  assert(replay.every((x,i)=>x===c56[i]),"authentic prime replay");
  const ascii=p=>p.map(x=>corpus.translit[x]).join("");
  // Fixed independent source-native affine plant, with two known pairs and
  // a third unseen target. C endpoints made distinct using exact natural
  // native words where necessary; no original key inputs used.
  const pt=[train.slice(0,N),train.slice(N,2*N),train.slice(2*N,3*N)];
  let shift=0;while(pt[0][0]===pt[1][0]){shift++;pt[1]=train.slice(N+shift,2*N+shift)}
  const Ap=toInt(Array.from({length:N},(_,i)=>(i*17+13)%29)),Bp=toInt(Array.from({length:N},(_,i)=>(i*i+3*i+7)%29));
  const cs=pt.map(p=>mod((toInt(p)-Bp)*inverse(Ap),Q));
  const recovered=fit(cs[0],toInt(pt[0]),cs[1],toInt(pt[1]));
  assert(recovered.A===Ap&&recovered.B===Bp&&digits(recovered.A*cs[2]+recovered.B).every((v,i)=>v===pt[2][i]),"affine plant");
  const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],out=[];
  for(const reverse of [false,true]){
    const low=x=>reverse?x.slice(-N).reverse():x.slice(0,N);
    const a=fit(toInt(low(c56)),toInt(low(p56)),toInt(low(c57)),toInt(low(c57)));
    let original=null;
    if(a.unit){const invA=inverse(a.A);original=ranges.map(([lo,hi])=>{
      const c=low(corpus.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices)),p=digits(a.A*toInt(c)+a.B),replay=digits((toInt(p)-a.B)*invA);
      assert(c.every((v,i)=>v===replay[i]),"original forward replay");
      const natural=reverse?p.slice().reverse():p,raw=reverse?c.slice().reverse():c;
      return {range:[lo,hi],plain:natural,text:ascii(natural),score:score(natural),rawScore:score(raw),ioc:ioc(natural)};
    })}
    out.push({reverse,A:a.A.toString(),B:a.B.toString(),A_digits:digits(a.A),B_digits:digits(a.B),unit:a.unit,deltaC:a.deltaC,deltaP:a.deltaP,anchors:[{c:low(c56)[0],p:low(p56)[0]},{c:low(c57)[0],p:low(c57)[0]}],original});
  }
  return {sourcePlain56:p56,sourceText56:ascii(p56),sourceText57:ascii(c57),plant:{recovered:true,anchorShift:shift,predicted:85,score:score(pt[2])},directions:out};
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt")),null,2));
