// Agent3: fixed cuneiform integer Euclidean matrix pair receiver
// Run from repository root: node sims/lp2_cuneiform_integer_euclid_pair_sft.cjs
const fs=require('node:fs');
function run(corpus,ref){
 const mod=x=>(x%29+29)%29, mul=(A,B)=>A.map((row,i)=>B[0].map((_,j)=>row.reduce((s,x,k)=>s+x*B[k][j],0)));
 let a=1033,b=3301,U=[[1,0],[0,1]],trace=[];while(b){let q=Math.floor(a/b),rem=a%b;trace.push([a,b,q,rem]);U=mul([[0,1],[1,-q]],U);[a,b]=[b,rem]}
 const det=U[0][0]*U[1][1]-U[0][1]*U[1][0];const V=[[U[1][1]/det,-U[0][1]/det],[-U[1][0]/det,U[0][0]/det]];if(JSON.stringify(mul(U,[[1033],[3301]]))!=="[[1],[0]]"||Math.abs(det)!==1)throw Error("euclid");
 const pair=(s,M)=>{let o=[];for(let i=0;i+1<s.length;i+=2){o.push(mod(M[0][0]*s[i]+M[0][1]*s[i+1]),mod(M[1][0]*s[i]+M[1][1]*s[i+1]))}if(s.length%2)o.push(s.at(-1));return o};
 const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);for(let i=0;i<29;i++)for(let j=0;j<29;j++)if(!eq(pair(pair([i,j],U),V),[i,j]))throw Error("inverse");
 const code=corpus.translit.map((x,i)=>[x,i]).concat([["ING",21],["IO",27]]).sort((a,b)=>b[0].length-a[0].length);
 const enc=t=>{let o=[];for(let w of t.toUpperCase().replace(/V/g,"U").replace(/K/g,"C").match(/[A-Z]+/g)||[]){while(w){let x=code.find(x=>w.startsWith(x[0]));if(!x)throw Error(w);o.push(x[1]);w=w.slice(x[0].length)}}return o};
 const sections=ref.split(/^### /m).slice(1).map(x=>{let [head,...lines]=x.split("\n");return [Number(head),enc(lines.filter(l=>!/^\[|^\s*\d|^#/.test(l)).join(" "))]});
 let train=sections.filter(x=>[1,3,6,10,11,12,13,14,15].includes(x[0])).map(x=>x[1]);let bi=Array(841).fill(0),tri=Array(24389).fill(0);for(let s of train)for(let i=2;i<s.length;i++){let j=s[i-2]*29+s[i-1];bi[j]++;tri[j*29+s[i]]++}
 const score=s=>s.slice(2).reduce((v,x,i)=>{let j=s[i]*29+s[i+1];return v+Math.log((tri[j*29+x]+.5)/(bi[j]+14.5))},0)/(s.length-2);
 const ioc=s=>{let f=Array(29).fill(0);s.forEach(x=>f[x]++);return f.reduce((a,x)=>a+x*(x-1),0)/(s.length*(s.length-1))};
 const render=s=>s.slice(0,60).map(x=>corpus.translit[x]).join(" ");
 const first=corpus.pages[33].indices.slice(91),orig=first.concat(...corpus.pages.slice(34,40).map(p=>p.indices));if(orig.length!==1589)throw Error("source length");const split=first.length+corpus.pages[34].indices.length+corpus.pages[35].indices.length+corpus.pages[36].indices.length;
 const out=[];for(let [label,M,N] of [["Euclidean reduction",U,V],["reciprocal",V,U]]){let p=pair(orig,M);if(!eq(pair(p,N),orig))throw Error("original replay");let controls=[];for(let s of [corpus.pages[57].indices,...train.filter(s=>s.length>=80)]){let plant=pair(s,N);if(!eq(pair(plant,M),s))throw Error("control");controls.push({n:s.length,score:score(s),cipherScore:score(plant),ioc:ioc(s)})}out.push({label,fit:score(p.slice(0,split)),continuation:score(p.slice(split)),full:score(p),ioc:ioc(p),preview:render(p),repeats:p.slice(1).filter((x,i)=>x===p[i]).length,controls})}
 return {trace,U,V,det,Umod:U.map(r=>r.map(mod)),Vmod:V.map(r=>r.map(mod)),n:orig.length,split,original:{score:score(orig),ioc:ioc(orig),repeats:orig.slice(1).filter((x,i)=>x===orig[i]).length},trainLengths:train.map(s=>s.length),results:out}
}
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const ref=fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt','utf8');
console.log(JSON.stringify(run(corpus,ref),null,2));
