'use strict';
function experiment(corpus,solved,texts){
 const N=16,T=117,F=80,W=64,M=29,Q=29n**16n, mod=x=>(x%Q+Q)%Q;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const encmap=new Map(corpus.translit.map((x,i)=>[x,i]));
 function native(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");for(const t of w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[])out.push(encmap.get(t==="ING"?"NG":t))}assert(out.every(Number.isInteger),"native encoding");return out}
 const glyphMap=new Map(solved.runes.map((x,i)=>[x,i]));
 const src=solved.sections.flatMap(s=>[...s.source_text].filter(x=>glyphMap.has(x)).map(x=>glyphMap.get(x)));
 const text=[...texts.map(native),src], train=text[0].slice().reverse();
 const u=new Float64Array(M).fill(.5),bi=new Float64Array(M*M).fill(.1),tri=new Float64Array(M**3).fill(.025);
 for(let i=0;i<train.length;i++){u[train[i]]++;if(i)bi[29*train[i-1]+train[i]]++;if(i>1)tri[841*train[i-2]+29*train[i-1]+train[i]]++}
 const ut=u.reduce((s,x)=>s+x),bt=Array.from({length:29},(_,i)=>bi.slice(i*29,(i+1)*29).reduce((s,x)=>s+x,0)),tt=Array.from({length:841},(_,i)=>tri.slice(i*29,(i+1)*29).reduce((s,x)=>s+x,0));
 const L0=Float64Array.from(u,x=>Math.log(x/ut)),L1=Float64Array.from(bi,(x,i)=>Math.log(.85*x/bt[Math.floor(i/29)]+.15*u[i%29]/ut)),L2=Float64Array.from(tri,(x,i)=>Math.log(.60*x/tt[Math.floor(i/29)]+.30*bi[i%841]/bt[Math.floor(i/29)%29]+.10*u[i%29]/ut));
 function scoreBlock(p){let s=L0[p[0]]+L1[p[0]*29+p[1]];for(let i=2;i<p.length;i++)s+=L2[841*p[i-2]+29*p[i-1]+p[i]];return s}
 function split(seq){return Array.from({length:Math.floor(seq.length/N)},(_,i)=>seq.slice(i*N,(i+1)*N).reverse())}
 function integer(d){let v=0n;for(let i=d.length-1;i>=0;i--)v=v*29n+BigInt(d[i]);return v}
 function digits(x){x=mod(x);const d=[];for(let i=0;i<N;i++){d.push(Number(x%29n));x/=29n}return d}
 function inv(a){let r=Q,s=mod(a),t=0n,v=1n;while(s){let q=r/s;[r,s]=[s,r-q*s];[t,v]=[v,t-q*v]}assert(r===1n,"nonunit");return mod(t)}
 function recover(c,p){let pair=null;for(let i=1;i<c.length;i++)if(c[i][0]!==c[0][0]){pair=i;break}if(pair===null)return null;const x0=integer(c[0]),x1=integer(c[pair]),y0=integer(p[0]),y1=integer(p[pair]);const A=mod((y1-y0)*inv(x1-x0)),B=mod(y0-A*x0);return {A,B,pair,unit:A%29n!==0n}}
 function decode(cs,A,B){return cs.map(c=>digits(A*integer(c)+B))}
 function encode(ps,A,B){const ai=inv(A);return ps.map(p=>digits(ai*(integer(p)-B)))}
 function solve(cs){
   let beam=[{a:[],b:[],carry:new Int32Array(cs.length),last:new Uint8Array(cs.length),prev:new Uint8Array(cs.length),s:0}],trace=[];
   for(let d=0;d<N;d++){
    const heap=[];function push(v){if(heap.length===W&&v.s<=heap[0].s)return;if(heap.length<W){let i=heap.length;heap.push(v);while(i){let p=(i-1)>>1;if(heap[p].s<=v.s)break;heap[i]=heap[p];i=p}heap[i]=v}else{let i=0;while(true){let l=2*i+1;if(l>=heap.length)break;let k=l+1<heap.length&&heap[l+1].s<heap[l].s?l+1:l;if(heap[k].s>=v.s)break;heap[i]=heap[k];i=k}heap[i]=v}}
    const L=d===0?L0:d===1?L1:L2;
    for(let pi=0;pi<beam.length;pi++){
     const st=beam[pi],base=new Int32Array(cs.length),off=new Int32Array(cs.length);
     for(let j=0;j<cs.length;j++){let v=st.carry[j];for(let k=0;k<d;k++)v+=st.a[k]*cs[j][d-k];base[j]=v;off[j]=d===0?0:d===1?29*st.last[j]:841*st.prev[j]+29*st.last[j]}
     for(let a=d===0?1:0;a<29;a++){const shift=Int32Array.from(base,(v,j)=>v+a*cs[j][0]);for(let b=0;b<29;b++){let s=st.s;for(let j=0;j<cs.length;j++)s+=L[off[j]+(shift[j]+b)%29];if(heap.length<W||s>heap[0].s)push({s,pi,a,b})}}
    }
    beam=heap.sort((x,y)=>y.s-x.s||x.pi-y.pi||x.a-y.a||x.b-y.b).map(({s,pi,a,b})=>{const st=beam[pi],carry=new Int32Array(cs.length),last=new Uint8Array(cs.length);for(let j=0;j<cs.length;j++){let v=st.carry[j]+b+a*cs[j][0];for(let k=0;k<d;k++)v+=st.a[k]*cs[j][d-k];last[j]=v%29;carry[j]=Math.floor(v/29)}return {a:[...st.a,a],b:[...st.b,b],carry,last,prev:st.last,s}});
    trace.push({d:d+1,top:beam[0].s/(cs.length*(d+1)),gap:beam[0].s-beam[1].s});
   }
   const best=beam[0],A=integer(best.a),B=integer(best.b);const decoded=decode(cs,A,B);assert(Math.abs(decoded.reduce((s,p)=>s+scoreBlock(p),0)-best.s)<1e-7,"convolution score");
   return {A,B,trace};
 }
 function summarize(cs,fit,truth=null){const p=decode(cs,fit.A,fit.B);assert(encode(p,fit.A,fit.B).every((x,i)=>eq(x,cs[i])),"replay");const flat=p.flatMap(x=>x.slice().reverse());let score=(a,b)=>p.slice(a,b).reduce((s,v)=>s+scoreBlock(v),0)/((b-a)*N);return {A:String(fit.A),B:String(fit.B),trainScore:score(0,F),heldScore:score(F,T),correct:truth?p.map((x,i)=>x.filter((v,j)=>v===truth[i][j]).length).reduce((s,x,i)=>{s[i<F?0:1]+=x;return s},[0,0]):null,plaintext:flat,preview:flat.slice(0,160).map(x=>corpus.translit[x]).join(""),trace:fit.trace}}
 // Authentic p56 correspondence: no assumption its historical operation is this block map.
 const p56=solved.sections.find(s=>s.name==="p56_an_end"),p56p=[...p56.source_text].filter(x=>glyphMap.has(x)).map(x=>glyphMap.get(x));
 const p56c=corpus.pages.find(p=>p.page===56).indices,pc=split(p56c),pp=split(p56p),k56=recover(pc,pp);
 const authentic={p56Blocks:pc.length,pair:k56?.pair,unit:k56?.unit,matchedBlocks:k56?.unit?decode(pc,k56.A,k56.B).map((x,i)=>eq(x,pp[i])):[],A:k56?String(k56.A):null,B:k56?String(k56.B):null};
 const plants=[];for(let z=0;z<2;z++){
   let state=(0x33010247+z*0x2717)>>>0;function next(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
   let a=Array.from({length:N},(_,i)=>i?next()%29:1+next()%28),b=Array.from({length:N},()=>next()%29),A=integer(a),B=integer(b);
   const donor=z===0?src:text[2],p=split(donor.slice(z===0?0:5000,(z===0?0:5000)+T*N));assert(p.length===T,"plant dims");
   const c=encode(p,A,B),known=recover(c,p);assert(known.unit&&known.A===A&&known.B===B&&decode(c,known.A,known.B).every((x,i)=>eq(x,p[i])),"known-pair");
   const blind=solve(c.slice(0,F)),res=summarize(c,blind,p);const wrong=decode(c,A,mod(B+1n));
   plants.push({name:z===0?"exact solved GP native plaintext":"Emerson",trueA:String(A),trueB:String(B),knownPair:known.pair,wrongKeyExactBlocks:wrong.filter((x,i)=>eq(x,p[i])).length,pass:blind.A===A&&blind.B===B,res});
 }
 const orig=corpus.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20);assert(orig.length===1883,"original dimensions");const cs=split(orig);assert(cs.length===T,"complete blocks");
 // Exact finite donor gate: from the first two unit-difference ciphertext blocks,
 // each contiguous donor window determines a0,b0. Test all 80 fit LSDs before
 // lifting to the unique full-width key. No offset search on original.
 const p0=cs[0][0],pair=cs.findIndex(c=>c[0]!==p0);assert(pair>0,"unit difference");
 let inv0=0;for(let a=1;a<29;a++)if(((cs[pair][0]-p0+29)*a)%29===1)inv0=a;
 const donorGate=[];
 for(let z=0;z<text.length;z++){
   const donor=text[z];let windows=0,lowSurvivors=0,fullSurvivors=0,holdMatches=0,bestLow=0;
   for(let start=0;start+T*N<=donor.length;start++){
    windows++;const y0=donor[start+N-1],y1=donor[start+(pair+1)*N-1],a=((y1-y0+29)*inv0)%29;if(!a)continue;const b=(y0-a*p0%29+29)%29;
    let m=0;for(let j=0;j<F;j++)if((a*cs[j][0]+b)%29===donor[start+(j+1)*N-1])m++;bestLow=Math.max(bestLow,m);if(m!==F)continue;lowSurvivors++;
    const p=split(donor.slice(start,start+T*N)),key=recover(cs,p);if(!key.unit)continue;const pred=decode(cs,key.A,key.B);if(!pred.slice(0,F).every((x,i)=>eq(x,p[i])))continue;fullSurvivors++;if(pred.slice(F).every((x,i)=>eq(x,p[F+i])))holdMatches++;
   }
   donorGate.push({name:["Gibran","Shakespeare","Emerson","solved GP"][z],windows,lowSurvivors,fullSurvivors,holdMatches,bestLow});
 }
 const pass=plants.every(p=>p.pass);
 const original=pass?summarize(cs,solve(cs.slice(0,F))):null;
 return {N,T,F,W,authentic,plants,donorGate,original,tail:orig.slice(T*N),nativeRunes:text.map(x=>x.length),pass};
}
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];const input=paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'));console.log(JSON.stringify(experiment(JSON.parse(input[0]),JSON.parse(input[1]),input.slice(2)),null,2));
