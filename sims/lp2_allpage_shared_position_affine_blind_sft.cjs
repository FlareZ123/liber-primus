"use strict";
/** Blind shared-position AGL(1,29) pad inversion, 49 original page starts.
 * 36 fixed fit pages, 13 untouched pages, 150 columns. All 812 states
 * exactly marginalized per column; finite shortlist exact bigram Viterbi.
 * Distinct from page-specific fixed affine alphabets + shared additive pad.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),gold=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const Q=29,K=812,N=150,M=49,TOP=16;
const maps=Array.from({length:K},(_,k)=>Uint8Array.from({length:Q},(_,x)=>((1+Math.floor(k/Q))*x+k%Q)%Q));
const inv=maps.map(m=>{const v=new Uint8Array(Q);m.forEach((x,i)=>v[x]=i);return v;});
const rows=gp.pages.filter(p=>p.page<56&&p.indices.length>=N);
assert.equal(rows.length,M);
const fit=rows.map((p,i)=>i).filter(i=>i%4!==0),hold=rows.map((p,i)=>i).filter(i=>i%4===0);
assert.deepEqual([fit.length,hold.length],[36,13]);
const source=rows.map(p=>p.indices.slice(0,N));
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(text){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);const w=text.slice(a?a.index+a[0].length:0,b?b.index:text.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let p=[];for(const s of w.match(/[A-Z]+/g)||[])for(let j=0;j<s.length;){const v=s.startsWith("ING",j)?{t:"ING",i:21}:s.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>s.startsWith(x.t,j));assert(v);p.push(v.i);j+=v.t.length;}return p;}
const nativeSections=gold.sections.map(s=>[...s.source_text].map(c=>gp.runes.indexOf(c)).filter(x=>x>=0));
assert.equal(nativeSections.flat().length,2979);
function train(ss){const u=new Float64Array(Q).fill(.5),B=new Float64Array(Q*Q),tot=new Float64Array(Q);for(const s of ss)for(let i=0;i<s.length;i++){u[s[i]]++;if(i){B[s[i-1]*Q+s[i]]++;tot[s[i-1]]++;}}const z=u.reduce((a,b)=>a+b,0);for(let x=0;x<Q;x++)u[x]/=z;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)B[x*Q+y]=Math.log((B[x*Q+y]+8*u[y])/(tot[x]+8));return {u:Array.from(u,Math.log),B};}
const model=train(nativeSections);
function lse(a){const m=Math.max(...a);return m+Math.log(a.reduce((s,x)=>s+Math.exp(x-m),0));}
function inverse(C,truth=null,plain=null){
 const choices=[],posterior=[];let mfit=0,mheld=0,mapUniHits=0,topHits=0;
 for(let t=0;t<N;t++){
  const f=new Float64Array(K),h=new Float64Array(K);
  for(let k=0;k<K;k++){
   const map=maps[k];let a=0,b=0;
   for(const j of fit)a+=model.u[map[C[j][t]]];
   for(const j of hold)b+=model.u[map[C[j][t]]];
   f[k]=a;h[k]=a+b;
  }
  const z=lse(f);mfit+=z-Math.log(K)+fit.length*Math.log(Q);mheld+=lse(h)-z+hold.length*Math.log(Q);
  const ranked=Array.from({length:K},(_,i)=>i).sort((a,b)=>f[b]-f[a]||a-b);
  choices.push(ranked.slice(0,TOP));posterior.push(Math.exp(f[ranked[0]]-z));
  if(truth){mapUniHits+=Number(ranked[0]===truth[t]);topHits+=Number(choices[t].includes(truth[t]));}
 }
 let score=choices[0].map(k=>fit.reduce((s,j)=>s+model.u[maps[k][C[j][0]]],0)),back=[];
 for(let t=1;t<N;t++){
  const next=Array(TOP).fill(-Infinity),prev=new Int32Array(TOP);
  for(let a=0;a<TOP;a++){const A=maps[choices[t-1][a]];
   for(let b=0;b<TOP;b++){const B=maps[choices[t][b]];let v=score[a];for(const j of fit)v+=model.B[Q*A[C[j][t-1]]+B[C[j][t]]];
    if(v>next[b]){next[b]=v;prev[b]=a;}}}
  back.push(prev);score=next;
 }
 let x=score.indexOf(Math.max(...score)),keys=Array(N);keys[N-1]=choices[N-1][x];
 for(let t=N-1;t>0;t--){x=back[t-1][x];keys[t-1]=choices[t-1][x];}
 const P=C.map(p=>p.map((c,t)=>maps[keys[t]][c]));
 for(let j=0;j<M;j++)for(let t=0;t<N;t++)assert.equal(inv[keys[t]][P[j][t]],C[j][t]);
 const scoreRows=js=>js.reduce((s,j)=>s+model.u[P[j][0]]+P[j].slice(1).reduce((z,p,t)=>z+model.B[Q*P[j][t]+p],0),0)/(js.length*N)+Math.log(Q);
 const result={fitMarginalUnigramLLR:mfit/(fit.length*N),heldConditionalUnigramLLR:mheld/(hold.length*N),fitMAPBigramLLR:scoreRows(fit),heldMAPBigramLLR:scoreRows(hold),meanTopPosterior:posterior.reduce((a,b)=>a+b,0)/N};
 if(truth){result.unigramKeyHits=mapUniHits;result.top16Truth=topHits;result.bigramKeyHits=keys.filter((k,t)=>k===truth[t]).length;result.heldRuneHits=hold.reduce((s,j)=>s+P[j].filter((v,t)=>v===plain[j][t]).length,0);}
 else{result.keys=keys;result.heldPreview=P[hold[0]].map(x=>gp.translit[x]).join(" ");}
 return result;
}
function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n;};}
const donors=["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"];
function plant(d){const P=native(read("resources/control/"+donors[d]));const rand=rng(461250+d),first=rand(P.length-M*N);const plain=Array.from({length:M},(_,j)=>P.slice(first+j*N,first+(j+1)*N));assert(plain.every(p=>p.length===N));const keys=Array.from({length:N},()=>rand(K));const C=plain.map(p=>p.map((x,t)=>inv[keys[t]][x]));return {donor:donors[d],first,...inverse(C,keys,plain)};}
function permuteColumns(C,seed){const R=rng(seed),perm=Array.from({length:N},()=>{const a=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=R(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;});return C.map(p=>p.map((x,t)=>perm[t][x]));}
const mode=process.argv[2]||"original";
if(mode.startsWith("plant"))console.log(JSON.stringify(plant(Number(mode.slice(-1)))));
else if(mode==="original"){console.log(JSON.stringify({fitPages:fit.map(i=>rows[i].page),heldPages:hold.map(i=>rows[i].page),...inverse(source)}));}
else if(mode==="nulls"){const r=[];for(let i=0;i<12;i++){let x=inverse(permuteColumns(source,461260+i));delete x.keys;delete x.heldPreview;r.push(x);}console.log(JSON.stringify(r));}
else throw Error("unknown mode");
