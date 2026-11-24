"use strict";
// One-rune right shift of printed word boundaries (GEB intervallic augmentation), exact historical periodic-key long-anchor inverse.
function run(c,raw,ink,lex,wide){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const map=new Map(c.runes.map((x,i)=>[x,i])),all=[],words=[];let lo=0;
 for(const ch of raw){if(all.length===12956)break;if(map.has(ch))all.push(map.get(ch));else if(ch!=="/"&&ch!=="%"&&!/\s/.test(ch)&&all.length>lo){words.push([lo,all.length]);lo=all.length;}}
 if(lo<all.length)words.push([lo,all.length]);assert(words.length===2896&&all.join(",")===c.pages.slice(0,56).flatMap(p=>p.indices).join(","),"source");
 let off=0,marks=[0],starts=[];for(const p of c.pages.slice(0,56)){starts.push(off);for(const [j,n] of ink.pages.find(x=>x.page===p.page)?.large_punctuation||[])if(n===13)marks.push(off+j);off+=p.indices.length;}marks.push(off);marks=[...new Set(marks)].sort((a,b)=>a-b);
 const tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];while(s.length){const t=tok.find(t=>s.startsWith(t.s));if(!t)return null;a.push(t.i);s=s.slice(t.s.length);}return a;}
 const dict=new Map([[13,new Map()],[14,new Map()]]),native=new Set();
 function add(w,scored){const p=gp(w);if(!p)return;if(scored)native.add(p.join(","));if(dict.has(p.length))dict.get(p.length).set(p.join(","),{p,w});}
 for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(m)add(m[1],true);}for(const w of wide.split(/\r?\n/))if(/^[a-z]+$/.test(w))add(w,false);
 function enc(p,k){let phase=0;return p.map(v=>v===0?0:mod(v+k[phase++%k.length]));}
 function scan(seq,k,phase,dir){const q=k.length,mask=(1<<q)-1,forbid=Array(29).fill(0);for(let i=0;i<q;i++)forbid[k[i]]|=1<<i;
  let states=1<<phase,i=0;
  for(const C of seq){let next;if(dir===1){let m=states&~forbid[C];next=((m<<1)|(m>>(q-1)))&mask;}else{let m=((states>>1)|(states<<(q-1)))&mask;next=m&~forbid[C];}if(C===0)next|=states;states=next;if(!states)return {covered:i,states:0};i++;}
  return {covered:i,states};
 }
 function inverse(tape,a,b,start,end,q){
  const C=tape.slice(a,b),left=tape.slice(start,a).reverse(),right=tape.slice(b,end);
  let cribFits=0,fullKeys=0,leftPass=0,rightPass=0,survivors=[],maxLeft=0,maxRight=0;
  const tested=new Set();
  for(const {p,w} of dict.get(b-a).values()){
   const k=Array(q).fill(-1);let m=0,ok=true;
   for(let i=0;i<p.length;i++){if(p[i]===0){if(C[i]!==0){ok=false;break;}continue;}const j=m++%q,v=mod(C[i]-p[i]);if(k[j]!==-1&&k[j]!==v){ok=false;break;}k[j]=v;}
   if(!ok)continue;cribFits++;const missing=k.flatMap((v,i)=>v<0?[i]:[]);
   function fill(i){if(i<missing.length){for(let v=0;v<29;v++){k[missing[i]]=v;fill(i+1);}return;}
    const id=k.join(",")+"|"+m;if(tested.has(id))return;tested.add(id);fullKeys++;
    const L=scan(left,k,0,-1);maxLeft=Math.max(maxLeft,L.covered);if(!L.states)return;leftPass++;
    const R=scan(right,k,m%q,1);maxRight=Math.max(maxRight,R.covered);if(!R.states)return;rightPass++;
    survivors.push({key:k.slice(),m,w,p,L:L.states,R:R.states});
   }fill(0);
  }
  return {q,cribFits,fullKeys,leftPass,rightPass,maxLeft,maxRight,survivors};
 }
 const controls=[];
 for(const key of [[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]]){
  const p=gp("circumference");assert(dict.get(p.length).has(p.join(",")),"control word absent");
  const nativeP=c.pages[57].indices,plain=nativeP.slice(0,48).concat(p,nativeP.slice(48)),ct=enc(plain,key);
  const phase=nativeP.slice(0,48).filter(Boolean).length%key.length,k=key.slice(phase).concat(key.slice(0,phase));
  const res=inverse(ct,48,48+p.length,0,ct.length,key.length);
  assert(res.survivors.some(z=>z.key.join(",")===k.join(",")&&z.p.join(",")===p.join(",")),"true shifted-anchor control not recovered");
  controls.push({q:key.length,cribFits:res.cribFits,fullKeys:res.fullKeys,survivors:res.survivors.length,trueRecovered:true});
 }
 const results=[];
 for(const [s,e] of words){if(e-s<13)continue;const a=s+1,b=e+1,start=marks.findLast(v=>v<=a),end=marks.find(v=>v>=b),page=starts.findLastIndex(v=>v<=a);
  for(const q of [8,13]){const res=inverse(all,a,b,start,end,q);results.push({page,printed:[s,e],shifted:[a,b],interval:[start,end],...res});}
 }
 return {dictionary:[...dict].map(([n,d])=>[n,d.size]),controls,results};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"); const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"); const [a,b,c,d,e]=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp2-ink-annotations.json","resources/control/english_wordfreq_textblob.txt","resources/control/dwyl-english-alpha-gp13-14-only.txt"].map(read);console.log(JSON.stringify(run(JSON.parse(a),b,JSON.parse(c),d,e),null,2));}
module.exports=run;
