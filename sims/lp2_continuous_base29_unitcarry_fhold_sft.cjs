"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
function mod(x,m){return ((x%m)+m)%m;}

function gate(c,sign,lo=1,hi=3302){
 const inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let x=1;x<29;x++)if(a*x%29===1)inv[a]=x;
 let valid=0,states0=0,maxEnd=0;const survivors=[];
 for(let a=lo;a<hi;a++){
  if(a%29===0)continue;const iv=inv[a%29];let cur=new Int32Array(a),next=new Int32Array(a),seen=new Int32Array(a);for(let s=0;s<a;s++)cur[s]=s;
  let n=a,pos=0;states0+=a;
  for(;pos<c.length&&n;pos++){
   const z=c[pos],y=sign===1?z:28-z;let m=0;
   if(z!==0){for(let j=0;j<n;j++){const s=cur[j],p=((y-s%29+29)*iv)%29;if(p!==0)next[m++]=(a*p+s-y)/29;}}
   else{const epoch=pos+1;for(let j=0;j<n;j++){const s=cur[j];if(seen[s]!==epoch){seen[s]=epoch;next[m++]=s;}const p=((y-s%29+29)*iv)%29;if(p!==0){const v=(a*p+s-y)/29;if(seen[v]!==epoch){seen[v]=epoch;next[m++]=v;}}}}
   const t=cur;cur=next;next=t;n=m;
  }
  valid++;if(n)survivors.push({a,terminal:Array.from(cur.subarray(0,n))});else maxEnd=Math.max(maxEnd,pos);
 }
 return {valid,states0,maxEnd,survivors};
}

function enc(p,a,s,sign){const c=[];for(const x of p){if(!x){c.push(0);continue;}const v=a*x+s;s=Math.floor(v/29);const y=v%29;c.push(sign===1?y:28-y);}return {c,s}}

function train(sections){
 const un=new Float64Array(29),bi=new Float64Array(841),tri=new Float64Array(24389),bn=new Float64Array(29),tn=new Float64Array(841);let total=0;
 for(const p of sections){for(let i=0;i<p.length;i++){const x=p[i];un[x]++;total++;if(i>0){const j=p[i-1];bi[j*29+x]++;bn[j]++;}if(i>1){const j=p[i-2]*29+p[i-1];tri[j*29+x]++;tn[j]++;}}}
 const u=Array.from(un,x=>(x+.5)/(total+14.5)),b=new Float64Array(841),t=new Float64Array(24389);
 for(let j=0;j<29;j++)for(let x=0;x<29;x++)b[j*29+x]=(bi[j*29+x]+8*u[x])/(bn[j]+8);
 for(let j=0;j<841;j++)for(let x=0;x<29;x++)t[j*29+x]=Math.log((tri[j*29+x]+4*b[(j%29)*29+x])/(tn[j]+4));
 return {u:u.map(Math.log),b:Float64Array.from(b,Math.log),t};
}

function score(p,lm){let v=lm.u[p[0]];if(p.length>1)v+=lm.b[p[0]*29+p[1]];for(let i=2;i<p.length;i++)v+=lm.t[(p[i-2]*29+p[i-1])*29+p[i]];return v;}

function exactFit(c,sign,lm,g){
 const path=new Int8Array(c.length);let complete=0,nodes=0;let best=null,runner=null;
 function visit(i,s,a,end,v){
  nodes++;if(i<0){complete++;const val=v+lm.u[path[0]]+lm.b[path[0]*29+path[1]];
   if(best===null||val>best.val){runner=best;best={a,s,end,val,p:Array.from(path)};}else if(runner===null||val>runner.val){runner={a,s,end,val};}return;}
  const z=c[i],y=sign===1?z:28-z;const prior=(29*s+y)%a,p=(29*s+y-prior)/a;
  function push(x,next){path[i]=x;const d=i+2<c.length?lm.t[(x*29+path[i+1])*29+path[i+2]]:0;visit(i-1,next,a,end,v+d);}
  if(p>0&&p<29)push(p,prior);if(z===0)push(0,s);
 }
 for(const x of g.survivors)for(const s of x.terminal)visit(c.length-1,s,x.a,s,0);
 if(best&&Math.abs(score(best.p,lm)-best.val)>1e-8)throw Error("score mismatch");return {complete,nodes,best,runner};
}

function continuation(c,sign,lm,b){
 if(!b)return null;const path=new Int8Array(c.length);let best=null,complete=0;const a=b.a,iv=Array.from({length:28},(_,j)=>j+1).find(x=>(a*x)%29===1);
 function visit(i,s,p1,p2,val){
  if(i===c.length){complete++;if(best===null||val>best.val)best={s,val,p:Array.from(path)};return;}
  const z=c[i],y=sign===1?z:28-z,p=mod((y-s%29)*iv,29);
  function push(x,next){path[i]=x;visit(i+1,next,p2,x,val+lm.t[(p1*29+p2)*29+x]);}
  if(p)push(p,(a*p+s-y)/29);if(!z)push(0,s);
 }
 visit(0,b.end,b.p.at(-2),b.p.at(-1),0);return {complete,best};
}

function attack(c,sign,lm,n=232){
 const prefix=c.slice(0,n),tail=c.slice(n),g=gate(prefix,sign),fit=exactFit(prefix,sign,lm,g),hold=continuation(tail,sign,lm,fit.best),b=fit.best;
 if(b){const x=enc(b.p,b.a,b.s,sign);if(x.s!==b.end||x.c.some((z,i)=>z!==prefix[i]))throw Error("fit replay");}
 if(hold?.best){const x=enc(hold.best.p,b.a,b.end,sign);if(x.s!==hold.best.s||x.c.some((z,i)=>z!==tail[i]))throw Error("holdout replay");}
 return {fitN:prefix.length,holdN:tail.length,fitZeros:prefix.filter(x=>x===0).length,multipliers:g.survivors.length,terminalStates:g.survivors.reduce((v,x)=>v+x.terminal.length,0),fit,hold,rawHold:score(tail,lm)/tail.length};
}

function main(){const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));const native=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));const sections=native.sections.map(x=>({name:x.name,p:[...x.source_text].map(r=>native.runes.indexOf(r)).filter(n=>n>=0)}));const all=corpus.pages.slice(0,56).flatMap(x=>x.indices);assert.equal(all.length,12956);const mode=process.argv[2]??"global";const dir=Number(process.argv[3]??1),sign=Number(process.argv[4]??1);assert.ok([1,-1].includes(dir)&&[1,-1].includes(sign));const order=x=>dir===1?x:x.slice().reverse();if(mode==="global"){const offset=dir===1?1408:0;const g=gate(order(all).slice(offset),sign);assert.equal(g.states0,5263162);assert.equal(g.valid,3188);assert.deepEqual(g.survivors,sign===1?[{a:1,terminal:[0]}]:[]);console.log(JSON.stringify({mode,dir,sign,offset,...g}));}else if(mode==="terminal"){const c=order(corpus.pages.slice(54,56).flatMap(x=>x.indices));assert.equal(c.length,308);const lm=train(sections.map(x=>order(x.p)));console.log(JSON.stringify({mode,dir,sign,...attack(c,sign,lm)}));}else if(mode==="plant"){const name=process.argv[5],a=Number(process.argv[6]),s=Number(process.argv[7]);assert.ok(a>0&&a<=3301&&a%29!==0&&s>=0&&s<a);const target=sections.find(x=>x.name===name);assert.ok(target);const p=order(target.p).slice(0,308);assert.equal(p.length,308);const e=enc(p,a,s,sign),lm=train(sections.filter(x=>x.name!==name).map(x=>order(x.p)));const result=attack(e.c,sign,lm);console.log(JSON.stringify({mode,dir,sign,name,a,s,truth:p,...result,fitCorrect:result.fit.best?.p.filter((x,i)=>x===p[i]).length??0,holdCorrect:result.hold?.best?.p.filter((x,i)=>x===p[232+i]).length??0}));}else throw Error("unknown mode");}
if(require.main===module)main();
module.exports={mod,gate,enc,train,score,exactFit,continuation,attack};
