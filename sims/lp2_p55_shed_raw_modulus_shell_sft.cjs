'use strict';
const fs = require('node:fs');
const path = require('node:path');
function run(groups,corpus){
  const ok=(b,m)=>{if(!b)throw Error(m)};
  const abc="0123456789abcdefghijklmnopqrs";
  const vals=s=>Array.from(s,x=>abc.indexOf(x));
  const B=s=>vals(s).reduce((n,i)=>29n*n+BigInt(i),0n);
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const peel=ws=>({inside:ws.map(w=>w.slice(1,-1)).join(""),shell:ws.map(w=>w[0]+w.at(-1)).join("")});
  const mod=(n,m)=>(n%m+m)%m;
  function pow(b,e,m){let a=1n;b=mod(b,m);for(;e;e>>=1n,b=b*b%m)if(e&1n)a=a*b%m;return a}
  function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s]=[s,r-q*s];[t,u]=[u,t-q*u]}ok(r===1n,"not invertible");return mod(t,m)}
  function gp(x){let s="";do{s=abc[Number(x%29n)]+s;x/=29n}while(x);return s}
  const bytes=x=>x.toString(16).padStart(54,"0");
  const printable=h=>h.match(/../g).map(x=>parseInt(x,16)).map(x=>x>=32&&x<=126?String.fromCharCode(x):".").join("");
  const P=63755441409934721069036418908763882578170591536653256311514221n;
  const ws=groups.p55.groups;
  const carry=groups.p54.body_groups.at(-1)+ws[0];
  ok(carry==="63g2eis46ql","source carry");
  ok(same(vals(ws.join("")),corpus.pages[55].indices),"p55 source");
  ok(same(vals(groups.p54.all_visual_groups.join("")),corpus.pages[54].indices),"p54 source");
  const {inside,shell}=peel(ws.slice(1));
  const {inside:wholeInterior,shell:wholeShell}=peel([carry,...ws.slice(1)]);
  const N=B(inside), E=B(shell);
  ok(inside.length===43&&shell.length===32&&wholeInterior.length===52&&wholeShell.length===34,"lengths");
  ok(N===8n*P&&E%43n===0n,"source modulus");
  const lambda=P-1n;
  function roots(C,e){ok(C<N,"cipher range");const d=inv(e,lambda),r=pow(C,d,P);const out=[];for(let k=0n;k<8n;k++){const x=r+k*P;if(pow(x,e,8n)===C%8n){ok(pow(x,e,N)===C,"full replay");out.push(x)}}return out}
  const frames=[["local",shell],["physical",ws[0]+shell],["whole-word",wholeShell]];
  const results=[];
  for(const e of [43n,65537n]){
    for(const [frame,ss] of frames){
      const C=B(ss),rr=roots(C,e);
      ok(rr.length===(C%2n?1:C%8n===0n?4:0),"root count");
      results.push({e:String(e),frame,digits:ss.length,cipher:String(C),mod8:Number(C%8n),roots:rr.map(x=>({value:String(x),gp:gp(x),gpLength:gp(x).length,translit:Array.from(gp(x),a=>corpus.translit[abc.indexOf(a)]).join(" "),hex:bytes(x),ascii:printable(bytes(x)),fitsOriginalWidth:x<29n**BigInt(ss.length)}))});
    }
    let p=corpus.pages[57].indices.slice(0,25).reduce((n,i)=>n*29n+BigInt(i),0n);
    if(p%2n===0n)p=p*29n+1n; // source-native U suffix only if needed to guarantee odd residue
    ok(p<N&&p%2n===1n,"plant odd");
    let ct=pow(p,e,N);ok(same(roots(ct,e).map(String),[String(p)]),"native plant");
    const even=2n*p;
    ok(roots(pow(even,e,N),e).includes(even),"even plant retention");
    ok(roots(pow(even,e,N),e).length===4,"even collision plant");
  }
  return {N:String(N),P:String(P),lambda:String(lambda),carry,inside,shell,wholeInterior,wholeShell,results,oaepBytes:27,oaepSha1Overhead:42};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const result=run(read('resources/liber-primus/lp2-page-groups-54-55-derived.json'),read('resources/liber-primus/lp2-corpus.json'));
console.log(JSON.stringify(result,null,2));
