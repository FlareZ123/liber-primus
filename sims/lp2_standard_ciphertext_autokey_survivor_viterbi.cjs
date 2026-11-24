'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native){
 const mod=n=>((n%29)+29)%29;
 const sections=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text,c=>native.runes.indexOf(c)).filter(x=>x>=0)}));
 function lm(train){const counts=new Map(), totals=new Map();for(const {p} of train){let h=[];for(const v of p){for(let k=0;k<=h.length;k++){const key=h.slice(h.length-k).join(",");const t=key+"|"+v;counts.set(t,(counts.get(t)||0)+1);totals.set(key,(totals.get(key)||0)+1);}h=[...h,v].slice(-2);}}
 return (h,v)=>{let prob=1/29;for(let k=0;k<=h.length;k++){const key=h.slice(h.length-k).join(",");prob=((counts.get(key+"|"+v)||0)+5*prob)/((totals.get(key)||0)+5);}return Math.log(prob);};}
 function fit(c,q,score){
  let cut=0,n=0;while(n<q){if(c[cut++]!==0)n++;if(cut>c.length)throw Error("short page");}
  let states=new Map([["|",{s:[],h:[],p:[],primer:[],score:0}]]),peak=1;
  for(let i=0;i<c.length;i++){const v=c[i],next=new Map();for(const z of states.values()){
   function extend(hold){const unknown=z.s.length<q;const p=hold?0:unknown?1:mod(v-z.s[0]);if(!hold&&!p)return;
    const s=hold?z.s:unknown?[...z.s,v]:[...z.s.slice(1),v];const primer=!hold&&unknown?[...z.primer,mod(v-p)]:z.primer;
    const h=i<cut?[]:[...z.h,p].slice(-2);const val=z.score+(i<cut?0:score(z.h,p));const key=s.join(",")+"|"+h.join(",");
    if(!next.has(key)||next.get(key).score<val)next.set(key,{s,h,p:[...z.p,p],primer,score:val});
   }
   if(v===0)extend(true);extend(false);
  }states=next;peak=Math.max(peak,states.size);if(!states.size)return {ok:false,dead:i};}
  const best=[...states.values()].sort((a,b)=>b.score-a.score)[0];
  const replay=encode(best.p,best.primer);if(replay.some((v,i)=>v!==c[i]))throw Error("forward replay failed");
  return {ok:true,cut,score:best.score/(c.length-cut),suffix:best.p.slice(cut),primer:best.primer,peak,fullReplay:true};
 }
 function encode(p,primer){let k=primer.slice();return p.map(v=>{if(!v)return 0;const c=mod(v+k.shift());k.push(c);return c})}
 const scoreText=(p,score)=>{let h=[],s=0;for(const v of p){s+=score(h,v);h=[...h,v].slice(-2);}return s/p.length;};
 const result={controls:[],original:[]};
 for(const q of [8,13])for(const name of ["0_welcome","0_koan_1","0_loss_of_divinity"]){
  const p=sections.find(s=>s.name===name).p;
  const score=lm(sections.filter(s=>s.name!==name));
  const c=encode(p,Array.from({length:q},(_,i)=>mod(3+7*i)));const z=fit(c,q,score);
  if(!z.ok)throw Error("control failure");
  const matches=z.suffix.reduce((n,v,i)=>n+(v===p[z.cut+i]),0);
  result.controls.push({q,name,n:p.length,cut:z.cut,matched:matches,suffixLength:z.suffix.length,score:z.score,nativeScore:scoreText(p.slice(z.cut),score),peak:z.peak,replay:z.fullReplay});
 }
 for(const [page,q] of [[14,8],[49,8],[33,13]]){
  const c=corpus.pages.find(p=>p.page===page).indices,score=lm(sections);
  const z=fit(c,q,score);if(!z.ok)throw Error("expected survivor");
  result.original.push({page,q,n:c.length,cut:z.cut,score:z.score,peak:z.peak,fullReplay:z.fullReplay,primer:z.primer,diagnosticSuffix:z.suffix.map(v=>corpus.translit[v]).join(""),suffixIndices:z.suffix});
 }
 return result;
}
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(load('resources/liber-primus/lp2-corpus.json'),load('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
