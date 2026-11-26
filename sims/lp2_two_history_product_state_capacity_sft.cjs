"use strict";
// Agent12: exact stationary translated-product two-history GP29 gate.
// Run from repository checkout: node sims/lp2_two_history_product_state_capacity_sft.cjs
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
function native(gp,s){const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}}return a}

function top2(h){let a=0,b=0;for(const x of h){if(x>=a){b=a;a=x}else if(x>b)b=x}return a+b}

function mod(x){return ((x%29)+29)%29}

function triples(pages){return pages.flatMap(t=>t.slice(2).map((c,i)=>[t[i+1],t[i],c]))}

function capacity(pages,h,k,a,b){const H=new Uint16Array(841);for(const [x,y,c] of triples(pages))H[29*mod((x-h)*(y-k))+mod(c+a*x+b*y)]++;let total=2*pages.length;for(let s=0;s<29;s++)total+=top2(H.subarray(s*29,(s+1)*29));return total}

function exhaust(pages){const records=triples(pages),n=records.length,residuals=new Uint8Array(841*n),states=new Uint16Array(841*n);for(let a=0;a<29;a++)for(let b=0;b<29;b++){const p=(a*29+b)*n;for(let i=0;i<n;i++){const [x,y,c]=records[i];residuals[p+i]=(c+a*x+b*y)%29;states[p+i]=29*mod((x-a)*(y-b))}}const H=new Uint16Array(841),centers=[];let best={value:0};for(let hk=0;hk<841;hk++){let value=0,br=0;const st=hk*n;for(let ab=0;ab<841;ab++){H.fill(0);const z=ab*n;for(let i=0;i<n;i++)H[states[st+i]+residuals[z+i]]++;let total=2*pages.length;for(let s=0;s<29;s++){let m1=0,m2=0;const base=s*29;for(let j=0;j<29;j++){const q=H[base+j];if(q>=m1){m2=m1;m1=q}else if(q>m2)m2=q}total+=m1+m2}if(total>value){value=total;br=ab}}const center=[Math.floor(hk/29),hk%29],residual=[Math.floor(br/29),br%29];centers.push(value);if(value>best.value)best={value,center,residual}}return {classes:841*841,best,minimum:Math.min(...centers),counts:Object.fromEntries([...new Set(centers)].sort((a,b)=>a-b).map(x=>[x,centers.filter(y=>y===x).length])),source24:centers[24*29+24],source22_21:centers[22*29+21],source21_22:centers[21*29+22]}}

function plant(tape,lengths,h,k,a,b,seed){let v=seed>>>0;const rand=()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0};const rows=Array.from({length:29},()=>{const p=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const i=rand()%(j+1);[p[i],p[j]]=[p[j],p[i]]}return p});const inverse=rows.map(p=>p.map((_,i)=>p.indexOf(i)));let offset=0;const plain=lengths.map(n=>{const p=tape.slice(offset,offset+n);offset+=n;return p});const cipher=plain.map(p=>{const c=p.slice(0,2);for(let i=2;i<p.length;i++){const x=c[i-1],y=c[i-2],s=mod((x-h)*(y-k));c.push(mod(inverse[s][p[i]]-a*x-b*y))}return c});const decoded=cipher.map(c=>c.map((z,i)=>i<2?z:rows[mod((c[i-1]-h)*(c[i-2]-k))][mod(z+a*c[i-1]+b*c[i-2])]));const p=plain.flat(),q=decoded.flat(),hist=new Uint16Array(29);p.forEach(x=>hist[x]++);const recovered=p.filter((x,i)=>x===q[i]).length,actual=top2(hist),bound=capacity(cipher,h,k,a,b);if(recovered!==p.length||actual>bound)throw Error("Plant failed");return {h,k,a,b,seed,n:p.length,recovered,actual,bound}}

function donor(tape,N,bound){const H=new Uint16Array(29);for(let i=0;i<N;i++)H[tape[i]]++;let minimum=Infinity,minAt=-1,passes=0;for(let i=0;i+N<=tape.length;i++){const t=top2(H);if(t<minimum){minimum=t;minAt=i}if(t<=bound)passes++;if(i+N<tape.length){H[tape[i]]--;H[tape[i+N]]++}}return {tapeLength:tape.length,windows:tape.length-N+1,minimum,minAt,passes}}

const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sources=["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const pages=gp.pages.filter(p=>p.page>=40&&p.page<=53&&p.indices.length).map(p=>p.indices),lengths=pages.map(p=>p.length),N=lengths.reduce((a,b)=>a+b,0);
assert.equal(N,3008);assert.equal(pages.length,13);
const tapes=sources.map(s=>native(gp,read(s)));
const original=exhaust(pages);assert.equal(original.best.value,498);assert.equal(original.source24,479);assert.equal(original.source22_21,486);assert.equal(original.source21_22,475);
assert.equal(capacity(pages,...original.best.center,...original.best.residual),498);
const plants=[plant(tapes[0].slice(10000,10000+N),lengths,24,24,16,6,3301),plant(tapes[1].slice(23000,23000+N),lengths,19,4,20,0,2014),plant(tapes[1].slice(65000,65000+N),lengths,22,21,11,17,2013)];
const donors=tapes.map((t,i)=>({name:sources[i],...donor(t,N,original.best.value)}));assert(donors.every(x=>x.passes===0));
console.log(JSON.stringify({original,plants,donors,N,pages:pages.length},null,2));
