'use strict';
/** Bidirectional homogeneous GF(29) recurrence recovery with authentic F-transparent clock and original long anchors. */
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

 const inv=Array(29).fill(0);for(let i=1;i<29;i++)for(let j=1;j<29;j++)if(i*j%29===1)inv[i]=j;
 function taps(k,r,visit){
   const m=[];for(let i=r;i<k.length;i++)m.push([...Array.from({length:r},(_,j)=>k[i-1-j]),k[i]]);
   const piv=[];let rank=0;
   for(let j=0;j<r;j++){
     let p=m.findIndex((row,i)=>i>=rank&&row[j]);if(p<0)continue;
     [m[p],m[rank]]=[m[rank],m[p]];
     let z=inv[m[rank][j]];m[rank]=m[rank].map(v=>mod(v*z));
     for(let i=0;i<m.length;i++)if(i!==rank&&m[i][j]){let s=m[i][j];m[i]=m[i].map((v,h)=>mod(v-s*m[rank][h]));}
     piv.push(j);rank++;
   }
   if(m.some(row=>row.slice(0,r).every(v=>v===0)&&row[r]))return 0;
   const free=Array.from({length:r},(_,j)=>j).filter(j=>!piv.includes(j));
   if(free.length>2)return -1;
   const a=Array(r).fill(0);
   function rec(z){
     if(z<free.length){for(let v=0;v<29;v++){a[free[z]]=v;rec(z+1);}return;}
     for(let i=rank-1;i>=0;i--)a[piv[i]]=mod(m[i][r]-free.reduce((s,j)=>s+m[i][j]*a[j],0));
     if(a[r-1]!==0)visit(a.slice());
   }
   rec(0);return 1;
 }
 function make(k,t){
   const r=t.length, f=k.slice(),b=[];
   return function at(i){
     if(i>=0){while(f.length<=i){let v=0;for(let j=0;j<r;j++)v+=t[j]*f[f.length-1-j];f.push(mod(v));}return f[i];}
     while(b.length< -i){let h=-b.length-1,z=h+r, v=z>=0?f[z]:b[-z-1];for(let j=0;j<r-1;j++){let x=z-1-j;v-=t[j]*(x>=0?f[x]:b[-x-1]);}b.push(mod(v*inv[t[r-1]]));}return b[-i-1];
   }
 }
 function scan(c,a,b,phase,at,dir){
   let ss=[phase],steps=0;
   for(let i=dir>0?a:b-1;dir>0?i<b:i>=a;i+=dir){
     const v=c[i],out=new Set();
     for(const s of ss){if(v===0)out.add(s);if(mod(v-at(dir>0?s:s-1))!==0)out.add(s+dir);}
     steps++;if(!out.size)return {ok:false,steps};ss=[...out];
   }return {ok:true,steps,states:ss};
 }
 function score(at,start,end,a,b,p,consumed,initial){
   const spans=words.filter(([x,y])=>x>=start&&y<=end),chunks=[];let x=start;
   for(const [u,v] of spans){if(u>x)chunks.push([x,u,false]);chunks.push([u,v,u!==a]);x=v;}if(x<end)chunks.push([x,end,false]);
   let states=new Map(initial.map(s=>[s,{score:0,pt:[],init:s}]));
   for(const [u,v,scored] of chunks){
     const next=new Map();
     for(const [s,old] of states){
       if(u===a&&s!==0)continue;
       function walk(i,q,pt){
         if(i===v){if(u===a&&pt.join(",")!==p.join(","))return;
           const z=old.score+(scored&&native.has(pt.join(","))?1:0),cur=next.get(q);
           if(!cur||z>cur.score)next.set(q,{score:z,pt:old.pt.concat(pt),init:old.init});return;}
         if(all[i]===0)walk(i+1,q,pt.concat(0));const val=mod(all[i]-at(q));if(val!==0)walk(i+1,q+1,pt.concat(val));
       }walk(u,s,[]);
     }states=next;if(!states.size)return null;
   }
   const out=[...states.values()].sort((a,b)=>b.score-a.score)[0];let phase=out.init;
   check(out.pt.map(v=>v===0?0:mod(v+at(phase++))).join(",")===all.slice(start,end).join(","),"exact replay");
   const h=Array(29).fill(0);for(let v of out.pt)h[v]++;let n=out.pt.length;
   return {score:out.score,eligible:spans.length-1,ioc:h.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1)),opening:show(out.pt.slice(0,60))};
 }
 const rows=[];
 for(const [i,[a,b]] of words.entries()){
   const n=b-a;if(n<13)continue;
   const start=marks.findLast(v=>v<=a),end=marks.find(v=>v>=b),cipher=all.slice(a,b);
   const page=starts.findLastIndex(v=>v<=a),orders=[];
   for(let r=1;r<=6;r++){
     let fitted=0,skipped=0,prefixPass=0,survivors=0,best=null,maxPrefix=0,maxSuffix=0;
     const seen=new Set();
     for(const p of anchorLex.get(n).values()){
       const k=[];let ok=true;
       for(let j=0;j<n;j++){if(p[j]===0){if(cipher[j]!==0){ok=false;break;}}else k.push(mod(cipher[j]-p[j]));}
       if(!ok)continue;
       const ret=taps(k,r,t=>{
         const id=k.slice(0,r).join(",")+"|"+t.join(",")+"|"+k.length;if(seen.has(id))return;seen.add(id);fitted++;
         const at=make(k,t);
         const pre=scan(all,start,a,0,at,-1);maxPrefix=Math.max(maxPrefix,pre.steps);if(!pre.ok)return;prefixPass++;
         const post=scan(all,b,end,k.length,at,1);maxSuffix=Math.max(maxSuffix,post.steps);if(!post.ok)return;survivors++;
         const s=score(at,start,end,a,b,p,k.length,pre.states);check(s!==null,"anchor fit");
         if(!best||s.score>best.score)best={...s,anchor:show(p),taps:t,seed:k.slice(0,r),continuousBackward:scan(all,0,a,0,at,-1).steps};
       });if(ret===-1)skipped++;
     }
     orders.push({r,fitted,skipped,prefixPass,survivors,maxPrefix,maxSuffix,best});
   }rows.push({page,word:i,n,interval:[start,end],orders});
 }
 const t=[5,7,3,11,9,2],key=[1,3,7,8,11,17],at=make(key,t),p=gp("CIRCUMFERENCE"),plant=Array.from({length:300},(_,i)=>src.pages[57].indices[i%95]);plant.splice(120,p.length,...p);
 let q=0,ct=plant.map(v=>v===0?0:mod(v+at(q++))),phase=plant.slice(0,120).filter(Boolean).length,stream=[];
 for(let j=0;j<p.length;j++)if(p[j]!==0)stream.push(mod(ct[120+j]-p[j]));
 let found=false;
 taps(stream,6,a=>{if(a.join(",")!==t.join(","))return;const at2=make(stream,a);check(scan(ct,0,120,0,at2,-1).ok&&scan(ct,120+p.length,ct.length,stream.length,at2,1).ok,"plant inverse");found=true;});
 check(found,"true planted recurrence");
 return {rows,plant:{found,anchor:show(p),taps:t}};
}
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'); console.log(JSON.stringify(run(...['resources/liber-primus/lp2-corpus.json','resources/liber-primus/lp2-transcription.txt','resources/liber-primus/lp2-ink-annotations.json','resources/control/english_wordfreq_textblob.txt','resources/control/dwyl-english-alpha-gp13-14-only.txt'].map(read)),null,2));
