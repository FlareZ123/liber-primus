'use strict';
const fs=require('node:fs'),path=require('node:path');
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-grid-256.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
const SEEDS=[[4,15,28,12,23,18,6],[19,9,8,6,12,24,10],[20,8,26,12,9,25,14],[15,12,2,18,4,27,20],[4,28,9,1,13,6,14],[2,25,22,6,18,3,15],[25,5,17,9,28,26,20],[21,27,16,12,1,24,14],[18,1,28,9,4,6,23],[7,22,23,2,11,1,18],[15,11,16,8,25,7,17],[11,26,18,24,28,8,6],[2,9,23,21,22,16,24],[28,1,8,24,12,23,3],[5,6,11,25,24,12,22],[12,9,7,23,1,15,6],[4,19,24,6,25,5,7],[27,3,16,2,4,12,9],[2,25,12,22,11,21,16],[15,10,3,25,28,22,20],[8,10,23,17,14,11,22],[2,12,15,14,1,23,11],[28,10,1,18,22,2,13],[8,20,21,6,2,10,25],[16,1,18,20,12,10,3],[16,17,26,20,15,5,7],[24,26,2,16,3,17,13],[7,15,13,23,17,20,24],[13,9,16,26,1,22,8]];
function experiment(raw,seeds){
 const C=JSON.parse(raw[0]),G=JSON.parse(raw[1]),T=raw[2],gold=JSON.parse(raw[3]),mod=x=>(x%29+29)%29,id=x=>x.join(",");
 const assert=(x,m)=>{if(!x)throw Error(m)}, inv=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error("noninvertible")};
 const ix=new Map(C.runes.map((x,i)=>[x,i])),tokens=C.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return(t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const vocab=new Map();for(const d of raw.slice(4,7).map(native))for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.set(id(w),w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))if(w.length<=24)vocab.set(id(w),w);
 assert(vocab.size===10842,"base vocab "+vocab.size);
 for(const line of raw[7].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of[false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.set(id(w),w)}}
 for(let x=0;x<29;x++)vocab.set(id([x]),[x]);assert(vocab.size===35944,"broad vocab "+vocab.size);
 const groups=runeWords(T,/[-.&]/u),u=C.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(id(groups.flat().slice(0,u.length))===id(u),"source mismatch");
 const n=u.length-76;let pos=0,spans=[];for(const [i,w] of groups.entries()){let a=Math.max(pos,n),b=Math.min(pos+w.length,n+76);if(a<b)spans.push({i,start:a-n,end:b-n,carry:a>pos||b<pos+w.length,full:w.length});pos+=w.length}
 assert(spans.length===17&&spans[0].carry&&spans.slice(1).every(s=>!s.carry),"p55 boundaries");
 const orig=C.pages.slice(55,58).flatMap(p=>p.indices),p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u).flat(),known=[...p56,...C.pages[57].indices];assert(known.length===180,"known length");
 const primes=[];for(let p=2;primes.length<84;p++)if(!primes.some(q=>q*q<=p&&p%q===0))primes.push(p);let clock=0;assert(id(p56.map(x=>x===0?0:mod(x+primes[clock++]-1)))===id(orig.slice(76,161))&&clock===84,"p56 native replay");
 const tok=G.pages.flatMap(x=>x.tokens),labels=[...new Set(tok)],all=Array.from({length:256},(_,i)=>i),inner=all.filter(i=>i>=8&&i<248&&i%8>0&&i%8<7),outer=all.filter(i=>!inner.includes(i)),order=[...outer,...inner],cols=labels.length+40;
 assert(labels.length===161&&outer.length===76&&inner.length===180,"geometry");
 const rows=order.map(cell=>{let a=new Int32Array(cols);a[labels.indexOf(tok[cell])]=1;a[labels.length+Math.floor(cell/8)]=1;a[labels.length+32+cell%8]=1;return a});
 const basis=new Map(),deps=[],knowDeps=[];
 for(const i of [...all.slice(76),...all.slice(0,76)]){let a=rows[i].slice(),v=new Int32Array(256);v[i]=1;for(let j=0;j<cols;j++)if(a[j]){let b=basis.get(j);if(!b){let f=inv(a[j]);for(let k=j;k<cols;k++)a[k]=mod(a[k]*f);for(let k=0;k<256;k++)v[k]=mod(v[k]*f);basis.set(j,{a,v});break}let f=a[j];for(let k=j;k<cols;k++)a[k]=mod(a[k]-f*b.a[k]);for(let k=0;k<256;k++)v[k]=mod(v[k]-f*b.v[k])}if(a.every(x=>x===0))(i<76?deps:knowDeps).push(v)}
 assert(deps.length===38&&knowDeps.length===19,"dependency dimensions");
 // Eliminate pads from known 180 positions; constrain H(0)=0 and sum H=0.
 const eq=knowDeps.map(v=>{let a=new Int32Array(30);for(let i=76;i<256;i++){a[orig[i]]=mod(a[orig[i]]+v[i]);a[29]=mod(a[29]+v[i]*known[i-76])}return a});
 const gauge=new Int32Array(30);gauge[0]=1;eq.push(gauge);const sum=new Int32Array(30);sum.fill(1,0,29);eq.push(sum);
 function rref(A,columns){let m=A.map(a=>a.slice()),rank=0,piv=[];for(const j of columns){let t=rank;while(t<m.length&&!m[t][j])t++;if(t===m.length)continue;[m[t],m[rank]]=[m[rank],m[t]];let f=inv(m[rank][j]);for(let k=0;k<m[rank].length;k++)m[rank][k]=mod(m[rank][k]*f);for(let t=0;t<m.length;t++)if(t!==rank&&m[t][j]){let f=m[t][j];for(let k=0;k<m[t].length;k++)m[t][k]=mod(m[t][k]-f*m[rank][k])}piv.push(j);rank++}return{m,rank,piv}}
 const rr=rref(eq,Array.from({length:29},(_,i)=>i));assert(rr.rank===21&&id(rr.piv)===id(Array.from({length:21},(_,i)=>i)),"H pivots");
 const coeff=rr.m.slice(1,21).map((a,i)=>[i+1,a[29],...Array.from(a.slice(21,29),x=>mod(-x))]);
 const Hs=[];for(const seed of seeds){const h=Array(29).fill(0);for(let j=0,k=0;j<8;j++)if(j!==1)h[21+j]=seed[k++];for(const row of coeff)if(row[0]!==12){assert(row[3]===0,"H22 dependence");h[row[0]]=mod(row[1]+row.slice(2).reduce((s,x,j)=>s+x*h[21+j],0))}
 const set=new Set(h.filter((_,i)=>i!==12&&i!==22));assert(set.size===27,"seed not distinct");const missing=Array.from({length:29},(_,i)=>i).filter(x=>!set.has(x));for(const x of missing){const v=h.slice();v[22]=x;const row=coeff[11];v[12]=mod(row[1]+row.slice(2).reduce((s,x,j)=>s+x*v[21+j],0));assert(new Set(v).size===29&&eq.every(a=>mod(a.slice(0,29).reduce((s,x,i)=>s+x*v[i],0))===a[29]),"invalid H");Hs.push(v)}}
 assert(Hs.length===58&&new Set(Hs.map(id)).size===58,"bijection count");
 const L=deps.map(v=>{const a=new Int32Array(76+Hs.length);a.set(v.slice(0,76));for(const [h,H] of Hs.entries()){let s=0;for(let i=0;i<256;i++)s+=v[i]*H[orig[i]];for(let i=76;i<256;i++)s-=v[i]*known[i-76];a[76+h]=mod(s)}return a});
 function checks(indices){let keep=new Set(indices),res=rref(L,Array.from({length:76},(_,i)=>i).filter(i=>!keep.has(i)));return res.m.slice(res.rank)}
 const inds=s=>Array.from({length:s.end-s.start},(_,i)=>s.start+i);
 const groupRows=spans.map(s=>checks(inds(s))),byLen=new Map();for(const w of vocab.values()){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w)}
 const wordSig=(rows,w,start)=>rows.map(a=>mod(w.reduce((s,x,i)=>s+x*a[start+i],0)));
 function need(rows,h){return rows.map(a=>a[76+h])}
 function groupDomain(g,h){const s=spans[g],rr=groupRows[g],want=id(need(rr,h));return(byLen.get(s.end-s.start)||[]).filter(w=>id(wordSig(rr,w,s.start))===want)}
 const domains=Hs.map((_,h)=>spans.map((s,g)=>s.carry?null:groupDomain(g,h)));
 const cross=[];for(let i=1;i<spans.length;i++)for(let j=i+1;j<spans.length;j++){const rows=checks([...inds(spans[i]),...inds(spans[j])]);if(rows.length>groupRows[i].length+groupRows[j].length)cross.push({i,j,rows})}
 function pairPossible(pair,h){const {i,j,rows}=pair,di=domains[h][i],dj=domains[h][j],target=need(rows,h),map=new Set(di.map(w=>id(wordSig(rows,w,spans[i].start))));return dj.some(w=>{const sig=wordSig(rows,w,spans[j].start);return map.has(id(target.map((v,k)=>mod(v-sig[k]))))})}
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 function minimumCover(edges){let best=17;function visit(mask){const k=pop(mask);if(k>=best)return;const e=edges.find(([i,j])=>!(mask&(1<<i))&&!(mask&(1<<j)));if(!e){best=k;return}visit(mask|(1<<e[0]));visit(mask|(1<<e[1]))}visit(0);return best}
 const results=Hs.map((H,h)=>{const counts=domains[h].map(x=>x===null?null:x.length),bad=counts.flatMap((n,i)=>n===0?[i]:[]),edges=cross.filter(p=>counts[p.i]&&counts[p.j]&&!pairPossible(p,h)).map(p=>[p.i,p.j]);const vc=minimumCover(edges);return{H,counts,bad,edges,vertexCover:vc,minimumOOV:bad.length+vc,uniqueLocal:counts.flatMap((n,i)=>n===1?[{group:i,word:domains[h][i][0],latin:domains[h][i][0].map(x=>C.translit[x]).join("")}]:[])}});
 // Same-geometry lexical plants, preserving the 180 authentic positions.
 const knownBasis=[...basis.entries()].filter(([j,b])=>b.v.slice(0,76).every(x=>x===0)).sort((a,b)=>b[0]-a[0]);
 assert(knownBasis.length===161,"known basis rank");
 function getPad(H){const p=new Int32Array(cols);for(const [j,b] of knownBasis){let y=0;for(let i=76;i<256;i++)y+=b.v[i]*(known[i-76]-H[orig[i]]);for(let k=j+1;k<cols;k++)y-=b.a[k]*p[k];p[j]=mod(y)}
 const pad=rows.map(a=>mod(a.reduce((s,x,k)=>s+x*p[k],0)));assert(pad.slice(76).every((x,i)=>mod(x+H[orig[76+i]])===known[i]),"known pad replay");return pad}
 function plantMatrix(H,C55){const aC=[...C55,...orig.slice(76)];return deps.map(v=>{const a=new Int32Array(77);a.set(v.slice(0,76));let b=0;for(let i=0;i<256;i++)b+=v[i]*H[aC[i]];for(let i=76;i<256;i++)b-=v[i]*known[i-76];a[76]=mod(b);return a})}
 const controls=[];
 for(let d=0;d<3;d++){
   const H=Hs[d*17],pad=getPad(H),donor=native(raw[4+d]),held=donor.slice(Math.floor(donor.length*.8));let fallback=0;
   const truth=spans.map((s,g)=>{if(s.carry)return[held[0][0]];let cand=held.filter(w=>w.length===s.end-s.start&&vocab.has(id(w)));if(!cand.length){cand=byLen.get(s.end-s.start);fallback++}return cand[(d*1033+g*31)%cand.length]});
   const P=truth.flat(),C55=P.map((v,i)=>H.indexOf(mod(v-pad[i]))),M=plantMatrix(H,C55);assert(P.length===76&&C55.every(x=>x>=0),"plant length");
   function pc(indices){const keep=new Set(indices),q=rref(M,Array.from({length:76},(_,i)=>i).filter(i=>!keep.has(i)));return q.m.slice(q.rank)}
   function compatible(rr,i,j=null){return rr.every(a=>mod(truth[i].reduce((s,x,k)=>s+x*a[spans[i].start+k],0)+(j===null?0:truth[j].reduce((s,x,k)=>s+x*a[spans[j].start+k],0)))===a[76])}
   let sc=0,pcnt=0;for(let g=1;g<spans.length;g++){assert(compatible(pc(inds(spans[g])),g),"lost true single word");sc++}
   for(const {i,j} of cross){assert(compatible(pc([...inds(spans[i]),...inds(spans[j])]),i,j),"lost true word pair");pcnt++}
   assert(M.every(a=>mod(P.reduce((s,x,k)=>s+x*a[k],0))===a[76]),"complete plant syndrome");
   controls.push({donor:d,fallbackGroups:fallback,knownReplay:180,plaintextRunes:P.length,completeGroups:sc,crossPairs:pcnt,plaintext:P,ciphertext:C55,H});
 }
 const cosets=new Set(Hs.map((_,h)=>id(L.map(a=>a[76+h])))).size;
 const profile=Array.from({length:77},(_,cut)=>{const left=Array.from({length:cut},(_,i)=>i),right=Array.from({length:76-cut},(_,i)=>cut+i);return rref(L,left).rank+rref(L,right).rank-38});
 const forcedLR=rref(L,Array.from({length:76},(_,i)=>75-i)).piv.slice().sort((a,b)=>a-b);
 const forcedRL=rref(L,Array.from({length:76},(_,i)=>i)).piv;
 const hist=(vals)=>vals.reduce((o,v)=>(o[v]=(o[v]||0)+1,o),{});
 return{coeff,controls,trellis:{cosets,profile,maxActive:Math.max(...profile),forcedLR,forcedRL},source:{vocab:vocab.size,groups:spans.map((s,i)=>({...s,checks:groupRows[i].length,vocab:s.carry?null:byLen.get(s.end-s.start).length})),crossPairs:cross.length,knownDependencies:knowDeps.length,targetDependencies:deps.length},summary:{permutations:Hs.length,singleOOV:hist(results.map(x=>x.bad.length)),combinedOOV:hist(results.map(x=>x.minimumOOV)),minOOV:Math.min(...results.map(x=>x.minimumOOV)),longAnchorSurvivors:results.filter(x=>x.counts[7]>0).length,best:results.filter(x=>x.minimumOOV===Math.min(...results.map(y=>y.minimumOOV))).map(x=>({H:x.H,counts:x.counts,bad:x.bad,edges:x.edges,uniqueLocal:x.uniqueLocal}))},results};
}
const raw=INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(raw,SEEDS),null,2));
