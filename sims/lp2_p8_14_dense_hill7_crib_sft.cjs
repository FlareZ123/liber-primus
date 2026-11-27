'use strict';
/** Dense affine Hill7 exact partial-quotation inversion; no printed word assumptions.
 * Run from repository root: node sims/lp2_p8_14_dense_hill7_crib_sft.cjs
 */
const fs=require('node:fs');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/external/blake-marriage-1906-gutenberg45315.txt",
  "resources/external/2013-liber-al-bookcode-I.txt",
  "resources/external/2013-liber-al-bookcode-II.txt",
  "resources/external/2013-liber-al-bookcode-III.txt",
  "resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt"
];
function study(input,paths){
 const A=JSON.parse(input[0]),native=JSON.parse(input[1]),N=247,D=7,FIT=10,HOLD=4,W=FIT+HOLD;
 const mod=x=>(x%29+29)%29, inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,i)=>i).find(i=>x*i%29===1));
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 const seq=n=>Array.from({length:n},(_,i)=>i);
 const runes=A.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);
 check(runes.length===N*D,"original geometry");
 const alpha=new Map(A.runes.map((x,i)=>[x,i])),tokens=new Map(A.translit.map((x,i)=>[x,i]));
 const encode=t=>(t.normalize("NFKD").replace(/\p{M}/gu,"").toUpperCase().match(/[A-Z]+/g)||[]).flatMap(w=>{
   w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
   const v=[];for(let i=0;i<w.length;){const d=w.slice(i,i+2),k=d.length===2&&tokens.has(d)?2:1,x=tokens.get(w.slice(i,i+k));check(x!==undefined,"encoding "+w);v.push(x);i+=k;}return v;
 });
 const sources=[...native.sections.map(s=>({name:s.name,a:[...s.source_text].filter(x=>alpha.has(x)).map(x=>alpha.get(x))})),...input.slice(2).map((t,i)=>({name:paths[i+2],a:encode(t)}))];
 check(eq(sources.slice(-5).map(x=>x.a.length),[18355,6958,7059,7484,41181]),"historical source lengths");
 // Augmented transpose: row-space invariant under every invertible affine map.
 function rref(a,cols){
   a=a.map(x=>x.slice());let rank=0;const pivots=[];
   for(let c=0;c<cols&&rank<a.length;c++){
     let p=rank;while(p<a.length&&a[p][c]===0)p++;if(p===a.length)continue;
     [a[p],a[rank]]=[a[rank],a[p]];const s=inv[a[rank][c]];
     for(let j=c;j<a[rank].length;j++)a[rank][j]=mod(a[rank][j]*s);
     for(let i=0;i<a.length;i++)if(i!==rank&&a[i][c]){const k=a[i][c];for(let j=c;j<a[i].length;j++)a[i][j]=mod(a[i][j]-k*a[rank][j]);}
     pivots.push(c);rank++;
   }
   return {a,rank,pivots};
 }
 const row=(a,start,layout,r)=>seq(D).map(c=>a[start+(layout==="row"?D*r+c:N*c+r)]);
 const rows=(a,start,layout,n)=>seq(n).map(r=>row(a,start,layout,r));
 const chapterRows=(a,layout)=>rows(a,0,layout,N);
 const flatten=(r,layout)=>layout==="row"?r.flat():seq(D).flatMap(c=>r.map(v=>v[c]));
 const signature=r=>{const x=rref([...seq(D).map(c=>r.map(v=>v[c])),Array(r.length).fill(1)],r.length);return {key:x.a.slice(0,x.rank).map(a=>a.map(v=>String.fromCharCode(65+v)).join("")).join("/"),rank:x.rank,pivots:x.pivots}};
 const mul=(a,b)=>a.map(row=>seq(b[0].length).map(c=>mod(row.reduce((s,x,i)=>s+x*b[i][c],0))));
 function inverse(m){const n=m.length;const z=rref(m.map((r,i)=>r.concat(seq(n).map(j=>+(i===j)))),n);return z.rank===n?z.a.map(r=>r.slice(n)):null;}
 const decode=(r,key)=>mul(r.map(v=>v.concat(1)),key);
 function recover(c,p,basis){const q=basis.map(i=>c[i].concat(1)),qi=inverse(q);check(qi!==null,"basis");const key=mul(qi,basis.map(i=>p[i]));check(inverse(key.slice(0,D))!==null,"bijective recovery");return key;}
 function encodeRows(p,key){const invK=inverse(key.slice(0,D));check(invK!==null,"inverse key");return mul(p.map(v=>v.map((x,i)=>mod(x-key[D][i]))),invK);}
 function index(c){const m=new Map(),ranks={};for(let i=0;i+W<=c.length;i++){
   const s=signature(c.slice(i,i+FIT));ranks[s.rank]=(ranks[s.rank]||0)+1;
   if(!m.has(s.key))m.set(s.key,[]);m.get(s.key).push({i,rank:s.rank,basis:s.pivots});
 }return {m,ranks};}
 function scan(c,layout,ds){
   const {m,ranks}=index(c),out=[];
   for(const s of ds){
     const span=layout==="row"?D*W:N*(D-1)+W,windows=Math.max(0,s.a.length-span+1);
     let fitMatches=0,rankDeficient=0,heldMatches=0;const hits=[];
     for(let o=0;o<windows;o++){
       const p=rows(s.a,o,layout,FIT),sig=signature(p),match=m.get(sig.key);if(!match)continue;
       for(const hit of match){fitMatches++;if(hit.rank!==D+1){rankDeficient++;continue;}
         const ci=c.slice(hit.i,hit.i+W),fullP=rows(s.a,o,layout,W),key=recover(ci,p,hit.basis);
         check(eq(decode(ci.slice(0,FIT),key),p),"fit fingerprint");
         if(!eq(decode(ci.slice(FIT),key),fullP.slice(FIT)))continue;
         heldMatches++;const decoded=decode(c,key);check(eq(encodeRows(decoded,key),c),"exact replay");
         hits.push({cipherRow:hit.i,donorOffset:o,key,plaintext:flatten(decoded,layout),alignedHoldoutRunes:HOLD*D});
       }
     }
     out.push({source:s.name,sourceRunes:s.a.length,windows,alignments:windows*(N-W+1),fitMatches,rankDeficient,heldMatches,hits});
   }
   return {layout,originalRankHistogram:ranks,sources:out};
 }
 // deterministic independent keys and partial-quotation controls
 let state=0x33011729;const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
 const controls=[];
 for(const layout of ["row","column"]){
   for(let trial=0;trial<2;trial++){
     const donor=sources[9+trial],other=sources[13],offset=137+trial*113;
     const phrase=chapterRows(donor.a.slice(offset,offset+N*D),layout);
     const p=chapterRows(other.a.slice(601+trial*103,601+trial*103+N*D),layout);
     const r0=37+trial*89,donorRow=19+trial*23;
     for(let i=0;i<W+4;i++)p[r0+i]=phrase[donorRow+i].slice();
     let key;do{key=seq(D+1).map(()=>seq(D).map(()=>rng()%29));}while(!inverse(key.slice(0,D))||key.slice(0,D).some(r=>r.filter(Boolean).length<5));
     const c=encodeRows(p,key);
     // Include donor and wrong-source excerpts. A planted fragment need not be a full-chapter quotation.
     const span=layout==="row"?D*(W+4):N*(D-1)+W+4;
     const start=offset+(layout==="row"?D*donorRow:donorRow);
     const ds=[{name:"planted",a:donor.a.slice(start-8,start+span+8)},{name:"wrong",a:other.a.slice(20000,20000+span+16)}];
     const result=scan(c,layout,ds);
     const hits=result.sources[0].hits,truth=hits.find(h=>h.cipherRow===r0&&h.donorOffset===8);
     check(!!truth,"true crib not found");
     check(eq(truth.key,key),"hidden key recovery");check(eq(truth.plaintext,flatten(p,layout)),"full native recovery");
     check(result.sources[1].heldMatches===0,"wrong source holdout false positive");
     controls.push({layout,trial,rankHistogram:result.originalRankHistogram,fitMatches:result.sources[0].fitMatches,heldMatches:result.sources[0].heldMatches,wrongMatches:result.sources[1].heldMatches,truthCipherRow:r0,truthDonorOffset:start,matchedRunes:1729,key});
   }
 }
 const originals=["row","column"].map(l=>scan(chapterRows(runes,l),l,sources));
 return {schema:1,receiver:"arbitrary fixed invertible affine GF29 Hill7, both natural 247x7 layouts",fitRows:FIT,heldRows:HOLD,controls,originals};
}
if(require.main===module) console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(p,'utf8')),paths),null,2));
module.exports={study};
