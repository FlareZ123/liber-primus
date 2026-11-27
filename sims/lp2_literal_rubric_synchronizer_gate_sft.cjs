"use strict";
// Agent9 #3164. Exact source-bounded rubric and visible-F state gate.
function run(C,A,T,L,R){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const g=new Set(C.runes),idx=x=>C.runes.indexOf(x),strip=s=>[...s].filter(x=>g.has(x)).join("");
 const tape=C.pages.flatMap(p=>p.indices).map(i=>C.runes[i]).join("");
 assert(strip(T)===tape,"corrected tape mismatch");
 const groups=[];let off=0,start=0,w="";
 for(const ch of T){if(g.has(ch)){if(!w)start=off;w+=ch;off++}else if("-.$&§".includes(ch)&&w){groups.push({start,end:off,w});w=""}}
 if(w)groups.push({start,end:off,w});
 const starts=new Map(groups.map(x=>[x.start,x])),ends=new Map(groups.map(x=>[x.end,x]));
 const base=[];let n=0;for(const p of C.pages){base[p.page]=n;n+=p.runic_count}
 assert(n===13136&&groups.length===2941,"full corpus size");
 assert(groups.filter(q=>q.end<=12956).length===2896,"unknown groups");
 const spans=A.pages.flatMap(p=>(p.red_spans??[]).map(s=>{
  const st=base[p.page]+s.start,en=st+s.length,marks=p.large_punctuation??[];
  const left=marks.filter(m=>m[0]===s.start).map(m=>m[1]+":"+m[2]);
  const right=marks.filter(m=>m[0]===s.start+s.length).map(m=>m[1]+":"+m[2]);
  assert(tape.slice(st,en)===s.runes,"ink mismatch");
  const contained=groups.filter(q=>q.start>=st&&q.end<=en);
  assert(contained.reduce((z,q)=>z+q.w.length,0)===s.length,"incomplete red span");
  return {page:p.page,start:s.start,len:s.length,runes:s.runes,left,right,complete:contained.map(q=>q.w)};
 }));
 function dup(x,key){const m=new Map();for(const v of x){const k=key(v);if(k==null)continue;if(!m.has(k))m.set(k,[]);m.get(k).push(v)}return [...m.entries()].filter(([k,v])=>v.length>1).map(([key,rows])=>({key,rows}))}
 const redGroups=spans.flatMap(s=>s.complete.map((w,i)=>({page:s.page,span:s.start,slot:i,w})));
 const events=A.pages.flatMap(p=>(p.large_punctuation??[]).map(m=>{
  const n=base[p.page]+m[0];return {page:p.page,offset:m[0],global:n,dots:m[1],color:m[2],before:ends.get(n)?.w??null,after:starts.get(n)?.w??null}
 }));
 const eDup=dup(events,e=>e.before&&e.after?JSON.stringify([e.dots,e.color,e.before,e.after]):null);
 const singleDup=dup(events.flatMap(e=>["before","after"].map(side=>({...e,side,w:e[side]}))),e=>e.w?JSON.stringify([e.dots,e.color,e.side,e.w]):null);
 const independent=eDup.filter(x=>new Set(x.rows.map(r=>r.global)).size>1);
 const independentSingle=singleDup.filter(x=>new Set(x.rows.map(r=>r.global)).size>1);
 const lp1=strip(L.split("%").slice(1,3).join("%")).split("").map(idx);
 const english=R.split("### 3")[1].split("### 4")[0].replaceAll("ILLUSIONS","ILLUSIANS").replaceAll("WISDOM","WIDSOM").replaceAll("INSTRUCTION","INSTRUCTIAN");
 const tok=C.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 const encode=s=>s.replace(/[^A-Z]+/g," ").trim().split(/\s+/).flatMap(w=>{
  w=w.replaceAll("V","U").replaceAll("K","C").replaceAll("ING","NG");const out=[];
  while(w){const z=tok.find(x=>w.startsWith(x[0]));assert(z,"GP "+w);out.push(z[1]);w=w.slice(z[0].length)}return out
 });
 const p1=encode(english),key=[23,10,1,10,9,10,16,26];let k=0;const f1=[];
 assert(lp1.length===515&&p1.length===515,"LP1 control length");
 for(let i=0;i<lp1.length;i++){
  const old=k,hold=lp1[i]===0&&p1[i]===0;
  if(!hold){assert((lp1[i]-key[k]+29)%29===p1[i],"LP1 replay "+i);k=(k+1)%8}
  if(lp1[i]===0)f1.push({offset:i,hold,in:old,out:k});
 }
 const p56=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
 const primes=[];for(let x=2;primes.length<86;x++)if(primes.every(p=>x%p!==0))primes.push(x);
 let j=0;const f56=[];assert(p56.length===85,"p56 control length");
 for(let i=0;i<85;i++){
  const c=C.pages[56].indices[i],old=j,hold=i===56;
  if(hold)assert(c===0&&p56[i]===0,"literal F");else assert((c-(primes[j++]-1)%29+29)%29===p56[i],"p56 replay "+i);
  if(c===0)f56.push({offset:i,hold,in:old,out:j,nextShift:(primes[j]-1)%29});
 }
 assert(j===84,"p56 consume count");
 const spanDuplicates=dup(spans,s=>s.runes),redGroupDuplicates=dup(redGroups,s=>s.w);
 const brackets=spans.filter(s=>s.left.includes("13:red")&&s.right.includes("13:red"));
 assert(spans.length===18&&redGroups.length===53&&events.length===36&&brackets.length===7,"source inventory");
 assert(spanDuplicates.length===0&&redGroupDuplicates.length===0&&independent.length===0&&independentSingle.length===0,"rubric recurrence");
 // Exact output-label recurrence is necessary only for a *shared literal word* selector.
 // Test output-state diversity rather than merely observing multiple F glyphs.
 const phases=[...new Set(f1.map(x=>x.out))].sort((a,b)=>a-b);
 const holdPhases=[...new Set(f1.filter(x=>x.hold).map(x=>x.out))].sort((a,b)=>a-b);
 assert(phases.length>1&&holdPhases.length>1&&new Set(f56.map(x=>x.out)).size===5,"F is not a reset");
 return {totalGroups:groups.length,spans,redGroupCount:redGroups.length,spanDuplicates,redGroupDuplicates,bracketed:brackets,events,duplicatePairs:eDup,duplicateSingles:singleDup,independent,independentSingle,controls:{lp1:{runes:515,key,visibleF:f1,phases,holdPhases},p56:{runes:85,visibleF:f56,consuming:j}}};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");const root=path.resolve(__dirname,"..");const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/transcriptions/lp2-image-corrected.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/liber-primus/lp1-plaintext-reference.txt"];const a=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(JSON.parse(a[0]),JSON.parse(a[1]),...a.slice(2)),null,2));}
module.exports={run};
