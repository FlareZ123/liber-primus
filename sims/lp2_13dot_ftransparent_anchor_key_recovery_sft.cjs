'use strict';
/** Exact 13-step F-transparent key recovery from original long anchors, with arbitrary independent marker-interval keys. */
const fs=require('node:fs'),path=require('node:path');

function run(corpus,transcript,annotations,lextext,widelex) {
 const src=JSON.parse(corpus),ink=JSON.parse(annotations),Q=29,L=13,ALL=(1<<L)-1;
 const mod=x=>((x%Q)+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)};
 const map=new Map(src.runes.map((x,i)=>[x,i])), all=[],words=[];let lo=0;
 for(const c of transcript){if(all.length===12956)break;if(map.has(c))all.push(map.get(c));else if(c!=="/"&&c!=="%"&&!/\s/.test(c)&&all.length>lo){words.push([lo,all.length]);lo=all.length;}}
 if(lo<all.length)words.push([lo,all.length]);
 check(all.length===12956&&words.length===2896&&all.join(",")===src.pages.slice(0,56).flatMap(p=>p.indices).join(","),"original counts");
 let off=0,marks=[0],starts=[],markCount=0;
 for(const p of src.pages.slice(0,56)){
   starts.push(off);const a=ink.pages.find(x=>x.page===p.page);
   for(const [j,n] of a?.large_punctuation||[])if(n===13){marks.push(off+j);markCount++;}
   off+=p.indices.length;
 }
 marks.push(off);marks=[...new Set(marks)].sort((a,b)=>a-b);
 check(markCount===28&&off===12956,"original marker count");
 const tokens=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];while(s.length){const t=tokens.find(t=>s.startsWith(t.s));if(!t)return null;a.push(t.i);s=s.slice(t.s.length);}return a;}
 const native=new Set(), anchorLex=new Map([[13,new Map()],[14,new Map()]]);
 function add(w,short){const p=gp(w);if(!p)return;const k=p.join(",");if(short)native.add(k);if(anchorLex.has(p.length))anchorLex.get(p.length).set(k,p);}
 for(const line of lextext.split(/\r?\n/)){let m=line.match(/^([a-z]+)\s+\d+$/);if(m)add(m[1],true);}
 for(const w of widelex.split(/\r?\n/))if(/^[a-z]+$/.test(w))add(w,false);
 const show=a=>a.map(x=>src.translit[x]).join("");
 // Rotate the unknown key so the phase at the anchor's first rune is zero.
 // A plaintext F is legal only at a printed ciphertext F and consumes nothing.
 // For every non-F the key entry is forced. Enumerate every residual unknown.
 function candidates(c,p,visit){
   let k=Array(L).fill(-1),s=0;
   for(let i=0;i<c.length;i++){
     if(p[i]===0){if(c[i]!==0)return;continue;}
     const v=mod(c[i]-p[i]),j=s%L;
     if(k[j]>=0&&k[j]!==v)return;k[j]=v;s++;
   }
   function fill(j){
     if(j===L){visit(k,s%L);return;}
     if(k[j]>=0){fill(j+1);return;}
     for(let v=0;v<Q;v++){k[j]=v;fill(j+1);}k[j]=-1;
   }
   fill(0);
 }
 function masks(k){let f=new Int32Array(Q);for(let j=0;j<L;j++)f[k[j]]|=1<<j;return f;}
 const left=s=>((s<<1)&ALL)|(s>>(L-1)),right=s=>(s>>1)|((s&1)<<(L-1));
 function prefix(c,a,z,f){let state=1;for(let i=z-1;i>=a;i--){state=(right(state)&~f[c[i]])|(c[i]===0?state:0);if(!state)return {ok:false,steps:z-i};}return {ok:true,steps:z-a};}
 function suffix(c,z,b,s,f){let state=1<<s;for(let i=z;i<b;i++){state=left(state&~f[c[i]])|(c[i]===0?state:0);if(!state)return {ok:false,steps:i-z+1};}return {ok:true,steps:b-z};}
 function reachable(c,a,b,k){const f=masks(k);let s=ALL;for(let i=a;i<b;i++){s=left(s&~f[c[i]])|(c[i]===0?s:0);if(!s)return false;}return true;}
 function options(c,k,s){let a=c===0?[[0,s]]:[];let p=mod(c-k[s]);if(p!==0)a.push([p,(s+1)%L]);return a;}
 function enc(p,k,s){return p.map(v=>{if(v===0)return 0;let c=mod(v+k[s]);s=(s+1)%L;return c;});}
 function ioc(a){let h=Array(Q).fill(0);for(let x of a)h[x]++;return h.reduce((n,v)=>n+v*(v-1),0)/(a.length*(a.length-1));}
 function best(c,a,b,k,anchorA,anchorB,anchorP){
   const spans=words.filter(([x,y])=>x>=a&&y<=b), chunks=[];let at=a;
   for(const [x,y] of spans){if(x>at)chunks.push([at,x,false]);chunks.push([x,y,x!==anchorA]);at=y;}if(at<b)chunks.push([at,b,false]);
   let states=new Map(Array.from({length:L},(_,s)=>[s,{score:0,p:[],init:s}]));
   for(const [x,y,scored] of chunks){
     const next=new Map();
     for(const [s,old] of states){
       if(x===anchorA&&s!==0)continue;
       function rec(i,q,p){if(i===y){
         if(x===anchorA&&p.join(",")!==anchorP.join(","))return;
         let score=old.score+(scored&&native.has(p.join(","))?1:0),cur=next.get(q);
         if(!cur||score>cur.score)next.set(q,{score,p:old.p.concat(p),init:old.init});return;
       }for(const [v,r] of options(c[i],k,q))rec(i+1,r,p.concat(v));}
       rec(x,s,[]);
     }
     states=next;if(!states.size)return null;
   }
   const out=[...states.values()].sort((a,b)=>b.score-a.score)[0];
   check(enc(out.p,k,out.init).join(",")===c.slice(a,b).join(","),"exact original replay");
   return {score:out.score,eligible:spans.length-1,ioc:ioc(out.p),opening:show(out.p.slice(0,80)),init:out.init};
 }
 const rows=[];
 for(const [i,[a,b]] of words.entries()){
   const n=b-a;if(n<13)continue;check(n<=14,"unexpected anchor length");
   const start=marks.findLast(v=>v<=a),end=marks.find(v=>v>=b);
   check(!marks.some(v=>v>a&&v<b),"cross-marker anchor");
   const cipher=all.slice(a,b),page=starts.findLastIndex(x=>x<=a),keys=new Set();
   let candidatesTotal=0,partial=0,prefixPass=0,suffixPass=0,survivors=0;
   let top=[],bestPrefix=0,bestSuffix=0;
   const seen=new Set();
   for(const p of anchorLex.get(n).values())candidates(cipher,p,(k,s)=>{
     candidatesTotal++;let f=masks(k),id=k.join(",")+"|"+s;
     if(seen.has(id))return;seen.add(id);
     const pre=prefix(all,start,a,f);bestPrefix=Math.max(bestPrefix,pre.steps);
     if(!pre.ok)return;prefixPass++;
     const post=suffix(all,b,end,s,f);bestSuffix=Math.max(bestSuffix,post.steps);
     if(!post.ok)return;suffixPass++;
     survivors++;
     const key=k.slice(),sc=best(all,start,end,key,a,b,p);
     check(sc!==null,"inferred anchor must be recoverable");
     // Independent interval: all other long intervals with own unknown phases.
     const independent=marks.slice(0,-1).map((x,j)=>[x,marks[j+1]]).filter(([x,y])=>x!==start&&y-x>=500);
     const hold=independent.filter(([x,y])=>reachable(all,x,y,key)).length;
     top.push({anchor:show(p),key,score:sc.score,eligible:sc.eligible,ioc:sc.ioc,opening:sc.opening,hold,holdoutCount:independent.length});
   });
   top.sort((a,b)=>b.score-a.score);
   rows.push({word:i,page,offset:a,anchorLength:n,cipherF:cipher.filter(x=>x===0).length,interval:[start,end],candidatesTotal,unique:seen.size,prefixPass,suffixPass,survivors,bestPrefix,bestSuffix,maxHold:top.length?Math.max(...top.map(x=>x.hold)):null,maxIoC:top.length?Math.max(...top.map(x=>x.ioc)):null,maxLex:top.length?top[0].score:null,top:top.slice(0,3)});
 }
 // Native solved p56 genuine source regression.
 const primes=[];for(let n=2;primes.length<85;n++){let ok=true;for(let j=2;j*j<=n;j++)if(n%j===0){ok=false;break;}if(ok)primes.push((n-1)%29);}
 const known=("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE").split(" ").flatMap(gp);
 let kx=0;check(known.length===85&&known.map(p=>p===0?0:mod(p+primes[kx++])).join(",")===src.pages[56].indices.join(","),"p56 original positive");
 // Full planted positive with one literal F in a 13-rune anchor and hence
 // one genuinely unspecified phase. Check exact key inclusion and both sides.
 const plantWord=[...anchorLex.get(13).values()].find(p=>p.filter(x=>x===0).length===1);
 check(plantWord,"one-F anchor");
 const plant=Array.from({length:729},(_,i)=>src.pages[57].indices[i%95]),a=260,b=a+13;
 plant.splice(a,13,...plantWord);
 const key=Array.from({length:L},(_,i)=>mod(3+7*i)),init=8;
 const phase=(init+plant.slice(0,a).filter(Boolean).length)%L;
 const rot=Array.from({length:L},(_,j)=>key[(phase+j)%L]);
 const ct=enc(plant,key,init);
 let found=false,plantCount=0;
 candidates(ct.slice(a,b),plantWord,(k,s)=>{plantCount++;if(k.join(",")===rot.join(",")){check(prefix(ct,0,a,masks(k)).ok&&suffix(ct,b,ct.length,s,masks(k)).ok,"plant full inverse");found=true;}});
 check(found,"complete planted key inclusion");
 return {marks:markCount,uniqueIntervals:marks.length-1,lex13:anchorLex.get(13).size,lex14:anchorLex.get(14).size,rows,plant:{anchor:show(plantWord),candidatesForTrueWord:plantCount,found}};
}

const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'); console.log(JSON.stringify(run(...['resources/liber-primus/lp2-corpus.json','resources/liber-primus/lp2-transcription.txt','resources/liber-primus/lp2-ink-annotations.json','resources/control/english_wordfreq_textblob.txt','resources/control/dwyl-english-alpha-gp13-14-only.txt'].map(read)),null,2));
