"use strict";
/** Direct source-local beta^j pair-clock gate on LP2 p8-p14. */
const fs=require("node:fs"),corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),A=29;
const mod=x=>((x%A)+A)%A,mul=([a,b],[c,d])=>[mod(a*c+8*b*d),mod(a*d+b*c)];
function pow(x,n){n=((n%840)+840)%840;let y=[1,0],b=x;while(n){if(n&1)y=mul(y,b);b=mul(b,b);n>>=1}return y}
function ioc(a){const h=Array(A).fill(0);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))}
const ps=corpus.pages.filter(p=>p.page>=8&&p.page<=14),unknown=corpus.pages.filter(p=>p.page<=55&&p.indices&&p.indices.length).flatMap(p=>p.indices),regs=[["p8-14-full",ps.flatMap(p=>p.indices)],["p8-14-black",ps.flatMap(p=>p.page===8?p.indices.slice(12):p.indices)],["p0-55-all",unknown]],out=[];
for(const [reg,tape] of regs)for(const pair of [[3,4],[4,3]])for(const sign of [1,-1])for(const dir of [1,-1])for(const phase of [0,1])for(const swap of [false,true])for(const off of [0,1]){
 const beta=[pair[0],mod(sign*pair[1])],dec=tape.slice(),n=Math.floor((tape.length-off)/2);
 for(let j=0;j<n;j++){const i=off+2*j,k=pow(beta,dir*(j+phase)),x=swap?[tape[i+1],tape[i]]:[tape[i],tape[i+1]],y=mul(x,k);if(swap){dec[i]=y[1];dec[i+1]=y[0]}else{dec[i]=y[0];dec[i+1]=y[1]}}
 for(const j of [0,Math.floor(n/2),n-1]){const i=off+2*j,x=swap?[tape[i+1],tape[i]]:[tape[i],tape[i+1]],z=mul(mul(x,pow(beta,dir*(j+phase))),pow(beta,-dir*(j+phase)));if(z[0]!==x[0]||z[1]!==x[1])throw Error("inverse");}
 out.push({reg,pair,sign,dir,phase,swap,off,ioc:ioc(dec)});
}
out.sort((a,b)=>b.ioc-a.ioc);
if(out.length!==192||out[0].ioc>=0.05)throw Error("frozen gate");
console.log(JSON.stringify({variants:out.length,best:out[0],minimum:out[out.length-1].ioc,maximum:out[0].ioc,countAtOrAbove005:out.filter(x=>x.ioc>=.05).length,decision:"reject direct beta^j adjacent-pair clock on p8-p14 and whole unknown p0-p55 under declared registrations"},null,2));
