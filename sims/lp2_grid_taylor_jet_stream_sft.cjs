"use strict";
const assert=require("node:assert/strict"),crypto=require("node:crypto"),fs=require("node:fs"),path=require("node:path");
const {nativeGP,profile}=require("./ink256_grid256_lfsr_inversion.cjs");
const root=path.resolve(__dirname,".."),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const grid=read("resources/liber-primus/base60-grid.json"),corpus=read("resources/liber-primus/lp2-corpus.json"),ink=read("resources/liber-primus/lp2-ink-annotations.json");
const m=n=>((n%29)+29)%29,m28=n=>((n%28)+28)%28,inv=a=>{for(let x=1;x<29;x++)if(m(a*x)===1)return x;throw Error("no inverse");};
const bytes=grid.byte_rows.flat();assert.equal(bytes.length,256);
const gridSha256=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
assert.equal(gridSha256,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const P=bytes.map(m),asc=P.slice().reverse();
function jets(x){const j=[0,0,0,0];for(const c of P){for(let k=3;k>=1;k--)j[k]=m(j[k]*x+j[k-1]);j[0]=m(j[0]*x+c);}return j;}
function shift(c,a){const out=Array(c.length).fill(0),pw=Array(c.length).fill(1);for(let i=1;i<c.length;i++)pw[i]=m(pw[i-1]*a);let row=[1];for(let i=0;i<c.length;i++){if(i){const n=Array(i+1).fill(1);for(let j=1;j<i;j++)n[j]=m(row[j-1]+row[j]);row=n;}for(let j=0;j<=i;j++)out[j]=m(out[j]+c[i]*row[j]*pw[i-j]);}return out;}
const triads=ink.pages.flatMap(p=>(p.red_spans||[]).filter(s=>s.length===3).map(s=>({page:p.page,start:s.start,indices:[...s.runes].map(r=>corpus.runes.indexOf(r))})));
assert.deepEqual(triads,[{page:3,start:119,indices:[13,23,2]},{page:39,start:119,indices:[27,5,15]}]);
const ac=ink.pages.find(p=>p.page===54).red_spans[0].runes[0];assert.equal(corpus.runes.indexOf(ac),24);
const parableWords=19,parableFirst=7;assert.equal(m(parableWords**2),13);assert.equal(parableWords*parableFirst,133);
assert.deepEqual(jets(13),[8,0,4,13]);assert.deepEqual(jets(15).slice(0,2),[27,5]);assert.deepEqual(jets(23).slice(0,3),[24,19,2]);assert.deepEqual(jets(24),[0,0,26,6]);
assert.deepEqual(Array.from({length:29},(_,x)=>x).filter(x=>jets(x).slice(0,3).join(",")==="24,19,2"),[23]);
function newton(x){const [p,d]=jets(x);return d===0?null:m(x-p*inv(d));}
const orbit=[23];while(orbit.length<10){const y=newton(orbit.at(-1));if(y===null)break;orbit.push(y);}assert.deepEqual(orbit,[23,8,7,16,9,13]);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices),cipher=pages.flat(),native=nativeGP();
assert.equal(cipher.length,12956);assert.equal(native.length,cipher.length);
const pow15=[],log15=Array(29).fill(-1);for(let i=0,v=1;i<28;i++,v=v*15%29){assert.equal(log15[v],-1);pow15.push(v);log15[v]=i;}
const rawProfile=profile(cipher),nativeProfile=profile(native);
function direct(seq,key,phase,pageReset,sign){let out=[],at=0;for(const p of pages){for(let i=0;i<p.length;i++){const t=pageReset?i:at+i;out.push(m(seq[at+i]+sign*key[(t+phase)%key.length]));}at+=p.length;}return out;}
function encSeg(p,taps,sign){const y=Array(p.length).fill(0);for(let i=0;i<p.length;i++){let s=0;for(let j=0;j<taps.length&&j<=i;j++)s+=taps[j]*p[i-j];y[i]=m(s);}let prev=0;return y.map(v=>{prev=m(prev+(v===28?0:pow15[m28(sign*v)]));return prev;});}
function decSeg(c,taps,sign){let prev=0;const y=c.map(v=>{const d=m(v-prev);prev=v;return d===0?28:m28(sign*log15[d]);}),p=Array(y.length).fill(0),iv=inv(taps[0]);for(let i=0;i<y.length;i++){let v=y[i];for(let j=1;j<taps.length&&j<=i;j++)v-=taps[j]*p[i-j];p[i]=m(v*iv);}return p;}
function filter(seq,taps,reset,sign,decode=false){if(!reset)return (decode?decSeg:encSeg)(seq,taps,sign);let out=[],at=0;for(const p of pages){out.push(...(decode?decSeg:encSeg)(seq.slice(at,at+p.length),taps,sign));at+=p.length;}return out;}
const shifts=[15,23].map(a=>({a,taps:shift(asc,a)}));for(const x of shifts){assert.deepEqual(x.taps.slice(0,3),jets(x.a).slice(0,3));}
const directTests=[];for(const {a,taps} of shifts)for(const phase of [0,119,120])for(const reset of [false,true])for(const sign of [-1,1]){const decoded=direct(cipher,taps,phase,reset,sign),planted=direct(native,taps,phase,reset,-sign);assert.deepEqual(direct(planted,taps,phase,reset,sign),native);directTests.push({a,phase,reset,sign,...profile(decoded)});}
const filterTests=[];for(const {a,taps} of shifts)for(const reset of [false,true])for(const sign of [-1,1]){assert.notEqual(taps[0],0);const recovered=filter(cipher,taps,reset,sign,true);assert.deepEqual(filter(recovered,taps,reset,sign,false),cipher);const planted=filter(native,taps,reset,sign,false);assert.deepEqual(filter(planted,taps,reset,sign,true),native);filterTests.push({a,reset,sign,...profile(recovered)});}
const range=a=>({minIoC:Math.min(...a.map(x=>x.ioc)),maxIoC:Math.max(...a.map(x=>x.ioc)),best:a.reduce((x,y)=>x.ioc>y.ioc?x:y),worst:a.reduce((x,y)=>x.ioc<y.ioc?x:y)});
console.log(JSON.stringify({gridSha256,triads,ac:24,parableWords,parableFirst,jets:{13:jets(13),15:jets(15),23:jets(23),24:jets(24)},newtonOrbit:orbit,primitiveRoot15Order:pow15.length,firstTaylorCoefficients:shifts.map(x=>({a:x.a,coefficients:x.taps.slice(0,6)})),original:{length:cipher.length,profile:rawProfile},native: nativeProfile,directAdditive:{count:directTests.length,...range(directTests)},taylorConvolution:{count:filterTests.length,...range(filterTests),allOriginalRoundtrips:true,allNativePlants:true},classification:"source-anchored Taylor-jet hypothesis; bounded negatives, no plaintext"},null,2));
