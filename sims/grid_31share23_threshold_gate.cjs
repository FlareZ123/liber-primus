"use strict";
const assert=require("node:assert/strict"),crypto=require("node:crypto"),fs=require("node:fs"),path=require("node:path");
const grid=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/base60-grid.json"),"utf8"));
const rows=grid.byte_rows,raw=Buffer.from(rows.flat()),sha=crypto.createHash("sha256").update(raw).digest("hex");
assert.equal(rows.length,32);assert.ok(rows.every(r=>r.length===8));assert.equal(sha,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const DB=[31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15];
const layouts=[
{name:"x0-first",xs:Array.from({length:32},(_,i)=>i),secret:0,train:Array.from({length:23},(_,i)=>i+1),held:Array.from({length:8},(_,i)=>i+24)},
{name:"x0-last",xs:Array.from({length:32},(_,i)=>i===31?0:i+1),secret:31,train:Array.from({length:23},(_,i)=>i),held:Array.from({length:8},(_,i)=>i+23)},
{name:"debruijn",xs:DB,secret:14,train:[...Array.from({length:14},(_,i)=>i),...Array.from({length:9},(_,i)=>i+15)],held:Array.from({length:8},(_,i)=>i+24)}
];
for(const l of layouts){assert.equal(l.xs[l.secret],0);assert.equal(new Set(l.xs).size,32);assert.equal(l.train.length,23);assert.equal(l.held.length,8);}
function m8(a,b,f){if(f===257)return a*b%257;let z=0;for(let i=0;i<8;i++){if(b&1)z^=a;b>>>=1;a<<=1;if(a&256)a^=f;}return z;}
function p8(a,n,f){let z=1;while(n){if(n&1)z=m8(z,a,f);a=m8(a,a,f);n=Math.floor(n/2);}return z;}
function i8(a,f){return p8(a,f===257?255:254,f);}
function s8(a,b,f){return f===257?(a-b+257)%257:a^b;}
function e8(c,x,f){let z=0;for(let k=c.length-1;k>=0;k--)z=f===257?(m8(z,x,f)+c[k])%257:m8(z,x,f)^c[k];return z;}
function l8(xs,ys,x,f){let z=0;for(let i=0;i<23;i++){let b=1;for(let j=0;j<23;j++)if(i!==j)b=m8(b,m8(s8(x,xs[j],f),i8(s8(xs[i],xs[j],f),f),f),f);const t=m8(ys[i],b,f);z=f===257?(z+t)%257:z^t;}return z;}
const fields=[["GF256-0x11b",0x11b],["GF256-0x11d",0x11d],["GF257",257]],lane=[];
for(const l of layouts)for(const [name,f] of fields){let hits=0,planted=0,total=0,cols=[];for(let c=0;c<8;c++){const y=rows.map(r=>r[c]),tx=l.train.map(i=>l.xs[i]),ty=l.train.map(i=>y[i]),targets=[...l.held,l.secret];let ch=0;for(const i of targets){if(l8(tx,ty,l.xs[i],f)===y[i]){hits++;ch++;}total++;}const co=Array.from({length:23},(_,k)=>(7+19*k+37*c)%(f===257?257:256)),py=l.xs.map(x=>e8(co,x,f)),pty=l.train.map(i=>py[i]);for(const i of targets)if(l8(tx,pty,l.xs[i],f)===py[i])planted++;cols.push(ch);}lane.push({layout:l.name,field:name,matches:hits,predictions:total,planted,perColumn:cols});}
const expected={"x0-first|GF256-0x11b":0,"x0-first|GF256-0x11d":1,"x0-first|GF257":0,"x0-last|GF256-0x11b":1,"x0-last|GF256-0x11d":0,"x0-last|GF257":0,"debruijn|GF256-0x11b":0,"debruijn|GF256-0x11d":2,"debruijn|GF257":0};
assert.equal(lane.reduce((n,r)=>n+r.matches,0),4);assert.equal(lane.reduce((n,r)=>n+r.planted,0),648);
for(const r of lane){assert.equal(r.predictions,72);assert.equal(r.planted,72);assert.equal(r.matches,expected[r.layout+"|"+r.field]);}
const MASK=(1n<<64n)-1n,RED=0x1bn,MOD=(1n<<64n)|RED;
function m64(a,b){let z=0n;for(let i=0;i<64;i++){if(b&1n)z^=a;b>>=1n;const h=(a>>63n)&1n;a=(a<<1n)&MASK;if(h)a^=RED;}return z&MASK;}
function p64(a,n){let z=1n;while(n){if(n&1n)z=m64(z,a);a=m64(a,a);n>>=1n;}return z;}
function i64(a){return p64(a,(1n<<64n)-2n);}
function deg(a){return a===0n?-1:a.toString(2).length-1;}
function pm(a,b){while(a&&deg(a)>=deg(b))a^=b<<BigInt(deg(a)-deg(b));return a;}
function pg(a,b){while(b)[a,b]=[b,pm(a,b)];return a;}
let q=2n;for(let i=0;i<32;i++)q=m64(q,q);assert.equal(pg(q^2n,MOD),1n);for(let i=0;i<32;i++)q=m64(q,q);assert.equal(q,2n);
const rowY=rows.map(r=>r.reduce((v,b)=>(v<<8n)|BigInt(b),0n));
function fit64(values,l,monic){const a=l.train.map(i=>{const x=BigInt(l.xs[i]),pw=[1n];for(let k=1;k<=22;k++)pw.push(m64(pw[k-1],x));return [...pw,monic?values[i]^p64(x,23n):values[i]];});for(let c=0;c<23;c++){let p=c;while(p<23&&!a[p][c])p++;assert.ok(p<23);[a[c],a[p]]=[a[p],a[c]];const sc=i64(a[c][c]);for(let j=c;j<24;j++)a[c][j]=m64(a[c][j],sc);for(let r=0;r<23;r++){if(r===c)continue;const f=a[r][c];for(let j=c;j<24;j++)a[r][j]^=m64(f,a[c][j]);}}return a.map(r=>r[23]);}
function e64(c,x,monic){x=BigInt(x);let z=monic?1n:0n;for(let k=22;k>=0;k--)z=m64(z,x)^c[k];return z;}
const packed=[];
for(const l of layouts)for(const monic of [false,true]){const c=fit64(rowY,l,monic),targets=[...l.held,l.secret],hits=targets.filter(i=>e64(c,l.xs[i],monic)===rowY[i]).length,co=Array.from({length:23},(_,i)=>((BigInt(i+1)*0x9e3779b97f4a7c15n)^(BigInt(i+3)<<37n))&MASK),py=l.xs.map(x=>e64(co,x,monic)),pc=fit64(py,l,monic),positive=targets.filter(i=>e64(pc,l.xs[i],monic)===py[i]).length;packed.push({layout:l.name,model:monic?"monic-degree23":"standard-degree22",original:hits+"/9",positive:positive+"/9"});}
assert.ok(packed.every(r=>r.original==="0/9"&&r.positive==="9/9"));
process.stdout.write(JSON.stringify({source:{file:"resources/liber-primus/base60-grid.json",pages:"pp49-51",rows:32,columns:8,sha256:sha},hypothesis:"p57 23 dots -> 23-of-31, one x=0 secret row",byteLanes:lane,totalOriginal:"4/648",chanceExpectation:"about 2.53",packedRows:packed,controls:"byte lanes 648/648; packed rows 54/54"},null,2)+"\n");
