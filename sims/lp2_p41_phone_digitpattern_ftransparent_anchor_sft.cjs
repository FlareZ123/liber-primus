'use strict';
/** Source-selected digit-pattern key recovery, exact plaintext-F clock; Node.js CommonJS. */
const fs=require('node:fs'),path=require('node:path');

function run(corpus,transcript,lextext) {
 const src=JSON.parse(corpus), Q=29, mod=x=>((x%Q)+Q)%Q;
 const check=(v,m)=>{if(!v)throw Error(m)};
 const digits=[2,1,4,3,9,0,9,6,0,8], labels=[...new Set(digits)], pattern=digits.map(d=>labels.indexOf(d));
 const mp=new Map(src.runes.map((r,i)=>[r,i])); 
 const all=[],words=[];let lo=0;
 for(const c of transcript){
   if(all.length===12956)break;
   if(mp.has(c))all.push(mp.get(c));
   else if(c!=="/"&&c!=="%"&&!/\s/.test(c)&&all.length>lo){words.push([lo,all.length]);lo=all.length;}
 }
 if(lo<all.length)words.push([lo,all.length]);
 check(all.length===12956&&words.length===2896,"original counts");
 check(all.join(",")===src.pages.slice(0,56).flatMap(p=>p.indices).join(","),"original corpus mismatch");
 const pages=new Map();let offset=0;
 for(const p of src.pages.slice(0,56)){
   const spans=words.filter(([a,b])=>a>=offset&&b<=offset+p.indices.length).map(([a,b])=>[a-offset,b-offset]);
   pages.set(p.page,{c:p.indices,spans});
   offset+=p.indices.length;
 }
 const lex=new Set(), byLen=Array.from({length:20},()=>[]);
 const tokens=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){
   s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
   let a=[];
   while(s.length){let t=tokens.find(t=>s.startsWith(t.s));if(!t)return null;a.push(t.i);s=s.slice(t.s.length);}
   return a;
 }
 for(const line of lextext.split(/\r?\n/)){
   const m=line.match(/^([a-z]+)\s+\d+$/);if(!m)continue;
   const a=gp(m[1]);if(!a||a.length>=20)continue;
   const k=a.join(",");if(!lex.has(k)){lex.add(k);byLen[a.length].push(a);}
 }
 const show=a=>a.map(v=>src.translit[v]).join("");
 const enc=(p,key,phase=0)=>p.map(x=>{if(x===0)return 0;let c=mod(x+key[pattern[phase]]);phase=(phase+1)%10;return c;});
 const phi=[];for(let n=2;phi.length<85;n++){let ok=true;for(let j=2;j*j<=n;j++)if(n%j===0){ok=false;break;}if(ok)phi.push((n-1)%29);}
 const known=("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE").split(" ").flatMap(gp);
 let used=0;check(known.length===85&&known.map(x=>x===0?0:mod(x+phi[used++])).join(",")===src.pages[56].indices.join(","),"authentic p56 positive");
 // The anchor contains ten nonzero ciphertext symbols, so all ten clock
 // phases must advance; all eight digit labels are observed regardless of phase.
 function anchorCandidates(c,start){
   const a=c.slice(start,start+10);check(a.length===10&&a.every(Boolean),"anchor must be nonzero");
   const out=[];
   for(const p of byLen[10]) {
     if(p.includes(0))continue;
     for(let phase=0;phase<10;phase++){
       const key=Array(8).fill(-1);let ok=true;
       for(let j=0;j<10;j++){
         const l=pattern[(phase+j)%10],v=mod(a[j]-p[j]);
         if(key[l]>=0&&key[l]!==v){ok=false;break;}
         key[l]=v;
       }
       if(ok){check(key.every(v=>v>=0),"all labels assigned");out.push({key,phase,p});}
     }
   }
   return out;
 }
 function options(c,key,phase){
   const out=c===0?[[0,phase]]:[];
   const p=mod(c-key[pattern[phase]]);
   if(p!==0)out.push([p,(phase+1)%10]);return out;
 }
 // Exact reachability under all phase choices, with the trained anchor's phase fixed.
 function reach(c,key,anchor=-1,phase=-1){
   let states=1023;
   for(let i=0;i<c.length;i++){
     if(i===anchor)states&=1<<phase;
     let next=0;
     for(let s=0;s<10;s++)if(states&(1<<s))for(const [,ns] of options(c[i],key,s))next|=1<<ns;
     if(!next)return {full:false,reach:i};
     states=next;
   }
   return {full:true,reach:c.length};
 }
 // Exact word-dictionary hit maximization, excluding the selected anchor.
 // Word segmentation is unchanged; boundary fragments are unscored.
 function best(page,key,anchor=-1,phase=-1){
   const {c,spans}=page, chunks=[];let at=0;
   for(const [a,b] of spans){if(a>at)chunks.push([at,a,false]);chunks.push([a,b,a!==anchor]);at=b;}
   if(at<c.length)chunks.push([at,c.length,false]);
   let states=new Map(Array.from({length:10},(_,s)=>[s,{score:0,p:[],start:s}]));
   for(const [a,b,scored] of chunks){
     const next=new Map();
     for(const [s,old] of states){
       if(a===anchor&&s!==phase)continue;
       function rec(i,q,p){
         if(i===b){
           const score=old.score+(scored&&lex.has(p.join(","))?1:0), cur=next.get(q);
           if(!cur||score>cur.score)next.set(q,{score,p:old.p.concat(p),start:old.start});
           return;
         }
         for(const [v,r] of options(c[i],key,q))rec(i+1,r,p.concat(v));
       }
       rec(a,s,[]);
     }
     states=next;
     if(!states.size)return null;
   }
   const result=[...states.values()].sort((a,b)=>b.score-a.score)[0];
   check(enc(result.p,key,result.start).join(",")===c.join(","),"forward replay");
   result.ioc=ioc(result.p);result.opening=show(result.p.slice(0,60));
   return result;
 }
 function ioc(a){let h=Array(29).fill(0);for(let x of a)h[x]++;return h.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));}
 const p41=pages.get(41),p17=pages.get(17), anchor=84;
 check(p41.c.length===273&&p17.c.length===273&&p41.spans.length===60&&p17.spans.length===68,"receiver counts");
 check(p41.spans.some(([a,b])=>a===84&&b===94)&&Math.max(...p41.spans.map(([a,b])=>b-a))===10,"source-selected longest word");
 const candidates=anchorCandidates(p41.c,anchor);
 let local=[],joint=[];
 for(const cand of candidates){
   if(!reach(p41.c,cand.key,anchor,cand.phase).full)continue;
   local.push(cand);
   if(reach(p17.c,cand.key).full)joint.push(cand);
 }
 const scored=local.map(x=>{let v=best(p41,x.key,anchor,x.phase);return {anchor:show(x.p),key:x.key,phase:x.phase,score:v.score,ioc:v.ioc,opening:v.opening,p17:reach(p17.c,x.key).full};}).sort((a,b)=>b.score-a.score);
 const literal=labels.map(d=>d);
 const direct=[1,-1].map(sign=>{
   const k=literal.map(v=>mod(sign*v));
   const rows=[p41,p17].map(page=>{
     const r=reach(page.c,k),v=r.full?best(page,k):null;
     return {...r,score:v?.score??null,ioc:v?.ioc??null,opening:v?.opening??null,start:v?.start??null};
   });
   return {sign,p41:rows[0],p17:rows[1]};
 });
 // A genuinely distinct planted complete plaintext uses clear original p57
 // and source p56, a hidden digit table, and the same source-selected anchor position.
 const base=Array.from({length:273},(_,i)=>src.pages[57].indices[i%95]);
 const target=gp("UNDERSTAND");check(target.length===10&&lex.has(target.join(",")),"independent anchor in lexicon");
 base.splice(anchor,10,...target);
 const key=labels.map((d,i)=>mod(3+5*i)), init=4;
 let anchorPhase=(init+base.slice(0,anchor).filter(Boolean).length)%10;
 // Make the predetermined key nonzero-ciphertext at anchor by selecting the
 // first allowed shift for each digit label; no original ciphertext is used.
 for(let l=0;l<8;l++){while(target.some((v,j)=>pattern[(anchorPhase+j)%10]===l&&mod(v+key[l])===0))key[l]=mod(key[l]+1);}
 const planted=enc(base,key,init), hold=enc(Array.from({length:273},(_,i)=>known[i%85]),key,7);
 const plantCandidates=anchorCandidates(planted,anchor);
 const plant=plantCandidates.find(v=>v.phase===anchorPhase&&v.key.join(",")===key.join(",")&&v.p.join(",")===target.join(","));
 check(plant&&reach(planted,key,anchor,anchorPhase).full&&reach(hold,key).full,"planted key recovery and holdout");
 return {lexSize:lex.size,tenRuneWords:byLen[10].length,labels,anchor,anchorCipher:p41.c.slice(84,94),originalCandidates:candidates.length,originalUniqueKeys:new Set(candidates.map(x=>x.key.join(","))).size,local:local.length,joint:joint.length,top:scored.slice(0,5),literal,exactLiteralPhaseFree:direct,plant:{key,anchorPhase,candidates:plantCandidates.length,found:true,holdout:true}};
}

const root=path.resolve(__dirname,'..'); const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/liber-primus/lp2-transcription.txt'),read('resources/control/english_wordfreq_textblob.txt')),null,2));
