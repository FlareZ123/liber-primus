'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,original=false){
 const A=41,N=160,S=80,q=29,mod=x=>((x%29)+29)%29,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a[0]===b[0]&&a[1]===b[1],sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])],det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")};
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++){if(c[i].replace(/ /g,"").length>=A&&c[i+1].replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}}
 check(pairs.length===1161,"frozen pair count");



 // C = a*P + H(previous consuming P) + J(second previous consuming P).
 // X_0..28=H; X_29..57=-J. Edge difference is affine in unknown nonzero a.
 const Q=29,sz=58;
 class State {
  constructor(copy){this.p=copy?copy.p.slice():Array.from({length:sz},(_,i)=>i);this.s=copy?copy.s.slice():Array(sz).fill(1);this.d0=copy?copy.d0.slice():Array(sz).fill(0);this.d1=copy?copy.d1.slice():Array(sz).fill(0);this.a=copy?copy.a:null;this.log=[]}
  find(i){let x=0,y=0;while(this.p[i]!==i){x+=this.d0[i];y+=this.d1[i];i=this.p[i]}return [i,mod(x),mod(y)]}
  push(u,v,c,p){const [ru,x,y]=this.find(u),[rv,z,w]=this.find(v+29);const b=mod(c-x+z),m=mod(-p-y+w);
   if(ru===rv){if(!m)return b===0;const a=mod(-b*inv(m));if(a===0||this.a!==null&&a!==this.a)return false;if(this.a===null){this.log.push(["a",null]);this.a=a}return true}
   let i=ru,j=rv,d=b,e=m;if(this.s[i]>this.s[j]){[i,j]=[j,i];d=mod(-d);e=mod(-e)}
   this.log.push(["u",i,j,this.s[j]]);this.p[i]=j;this.d0[i]=d;this.d1[i]=e;this.s[j]+=this.s[i];return true
  }
  undo(n){while(this.log.length>n){const [t,i,j,s]=this.log.pop();if(t==="a")this.a=i;else{this.p[i]=i;this.d0[i]=this.d1[i]=0;this.s[j]=s}}}
  predict(u,v,p){const [ru,x,y]=this.find(u),[rv,z,w]=this.find(v+29);if(ru!==rv)return null;const m=mod(y-w+p);return m&&this.a===null?null:mod(x-z+m*(this.a??1))}
  accepts(a,H,J){if(this.a!==null&&this.a!==a)return false;const X=H.concat(J.map(v=>mod(-v)));return this.p.every((par,i)=>mod(X[i]-X[par]-this.d0[i]-this.d1[i]*a)===0)}
  witness(){const a=this.a??1;const X=this.p.map((_,i)=>{const [r,x,y]=this.find(i);return mod(x+y*a)});return {a,H:X.slice(0,29),J:X.slice(29).map(x=>mod(-x))}}
  rank(){return this.p.filter((p,i)=>p!==i).length+(this.a===null?0:1)}
 }
 function enc(P,k,hold){let u=k.entry?.[0]??0,v=k.entry?.[1]??0;return P.map(p=>{if(hold&&p===0)return 0;const c=mod(k.a*p+k.H[u]+k.J[v]);v=u;u=p;return c})}
 function dec(C,k,hold,mask){let u=k.entry?.[0]??0,v=k.entry?.[1]??0;return C.map((c,i)=>{if(hold&&mask[i]){check(c===0,"hold");return 0}const p=mod(inv(k.a)*(c-k.H[u]-k.J[v]));check(!hold||p!==0,"consuming F");v=u;u=p;return p})}
 function scan(C,hold){const out=[];let leftPass=0,nodes=0,rankMax=0;const P=Array(S),st=new State();
  for(const pair of pairs){
   function forward(i,pos,u,v){nodes++;if(pair.right.rem[pos]<N-i)return;if(i===S){out.push({pair,pos,st:new State(st),plain:P.slice(),u,v});return}
    for(const [p,np] of pair.right.f[pos]){P[i]=p;if(hold&&p===0){if(C[i]===0)forward(i+1,np,u,v);continue}const n=st.log.length;if(st.push(u,v,C[i],p))forward(i+1,np,p,u);st.undo(n)}
   }
   function reverse(i,pos,future){nodes++;
    if(i<0){const n=st.log.length;let ok=true; // Arbitrary entry history: relax first two consuming equations.
      if(ok){leftPass++;rankMax=Math.max(rankMax,st.rank());let u=0,v=0;for(let j=0;j<A;j++)if(!hold||P[j]!==0){v=u;u=P[j]}forward(A,0,u,v)}st.undo(n);return}
    for(const [p,np] of pair.left.b[pos]){P[i]=p;if(hold&&p===0){if(C[i]===0)reverse(i-1,np,future);continue}
      const n=st.log.length;if(future.length<2||st.push(P[future[0]],p,C[future[1]],P[future[1]]))reverse(i-1,np,[i,...future].slice(0,2));st.undo(n)}
   }
   reverse(A-1,pair.left.L,[]);
  }return {out,leftPass,nodes,rankMax};
 }
 function run(C,hold,truth=null){const {out,leftPass,nodes,rankMax}=scan(C.slice(0,S),hold),full=[];
  const good=truth?out.filter(o=>o.pair.source===truth.source&&o.pair.stop===truth.stop&&o.plain.join()===truth.plain.slice(0,S).join()&&o.st.accepts(truth.k.a,truth.k.H,truth.k.J)):[];
  let forced=null,allowed=null;if(good.length){forced=0;allowed=0;const o=good[0],st=o.st;let u=o.u,v=o.v;for(let i=S;i<N;i++){const p=truth.plain[i];if(hold&&p===0){forced++;allowed+=+(C[i]===0);continue}const c=st.predict(u,v,p);forced+=+(c!==null);allowed+=+(c===null||c===C[i]);v=u;u=p}}
  let suffixNodes=0;
  for(const o of out){const st=o.st,P=o.plain.slice();function forward(i,pos,u,v){suffixNodes++;if(o.pair.right.rem[pos]<N-i)return;if(i===N){const k=st.witness(),plain=P.slice();const R=enc(plain,k,hold);let consumed=0;for(let j=0;j<N;j++){if(hold&&plain[j]===0){check(C[j]===0,"hold replay");continue}if(consumed++>=2)check(R[j]===C[j],"internal replay");}full.push({source:o.pair.source,stop:o.pair.stop,plain,k,rank:st.rank(),trueKey:truth?st.accepts(truth.k.a,truth.k.H,truth.k.J):null});return}
    for(const [p,np] of o.pair.right.f[pos]){P[i]=p;if(hold&&p===0){if(C[i]===0)forward(i+1,np,u,v);continue}const n=st.log.length;if(st.push(u,v,C[i],p))forward(i+1,np,p,u);st.undo(n)}
   }forward(S,o.pos,o.u,o.v)}
  const correct=truth?full.some(f=>f.source===truth.source&&f.stop===truth.stop&&f.plain.join()===truth.plain.join()&&f.trueKey):null;
  return {leftPass,nodes,rankMax,prefixPaths:out.length,prefixSources:new Set(out.map(o=>o.pair.source+":"+o.pair.stop)).size,prefixRanks:out.map(o=>o.st.rank()),prefixSlopes:out.map(o=>o.st.a),fullPaths:full.length,suffixNodes,forced,allowed,correct,full};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){let t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 // Oracle for symbolic slope and rollback.
 const st=new State(),k0={a:7,H:Array.from({length:29},(_,i)=>mod(i*i+3)),J:Array.from({length:29},(_,i)=>mod(11*i+5))};
 const e=(u,v,p)=>mod(k0.a*p+k0.H[u]+k0.J[v]);check(st.push(4,3,e(4,3,9),9),"edge");check(st.push(4,3,e(4,3,17),17)&&st.a===7,"slope");check(st.accepts(k0.a,k0.H,k0.J)&&st.predict(4,3,8)===e(4,3,8),"predict");check(!st.push(4,3,e(4,3,8)+1,8),"contradiction");st.undo(0);check(st.rank()===0&&st.a===null,"rollback");
 const controls=[],nulls=[];
 for(const hold of [false,true])for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const r=rng((0x29d0b3^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
  let pair,L,R;do{pair=subpool[Math.floor(r()*subpool.length)];L=spelling(pair.left,r);R=spelling(pair.right,r)}while(L.length<A||R.length<N-A);
  const plain=L.slice(-A).concat(R.slice(0,N-A)),k={a:1+Math.floor(r()*28),H:Array.from({length:29},()=>Math.floor(r()*29)),J:Array.from({length:29},()=>Math.floor(r()*29)),entry:[Math.floor(r()*29),Math.floor(r()*29)]},truth={source:pair.source,stop:pair.stop,plain,k},C=enc(plain,k,hold);
  check(dec(C,k,hold,plain.map(p=>p===0)).join()===plain.join(),"native inverse");controls.push({hold,truth,...run(C,hold,truth)});nulls.push({hold,...run(Array.from({length:N},()=>Math.floor(r()*29)),hold)});
 }
 const gate=controls.every(c=>c.correct&&c.allowed===80&&c.prefixSources===1&&c.full.every(f=>f.source===c.truth.source&&f.stop===c.truth.stop)&&c.forced>=40)&&nulls.every(c=>c.fullPaths===0);
 let result=null;if(original&&gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"corpus");result=[false,true].map(hold=>({hold,...run(U.slice(10279,10439),hold)}))}
 return {pairs:pairs.length,gate,controls,nulls,original:result};
}
module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));}
