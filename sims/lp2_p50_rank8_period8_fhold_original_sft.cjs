'use strict';
// Exact zero-free anchor relaxation and fixed-key block Viterbi.
function experiment(inputs){
 const [gp,grid,native]=inputs.slice(0,3).map(JSON.parse),[trans,lex,...literary]=inputs.slice(3);
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,chars=a=>String.fromCharCode(...a.map(v=>65+v));
 const runes=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>runes.get(x)));
 const all=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(String(all.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"canonical");
 const solved=native.sections.map(s=>parse(s.source_text.replace(/['’]/g,"")));
 const rows=Array.from({length:32},(_,r)=>Array.from({length:8},(_,i)=>i).sort((a,b)=>grid.bytes[8*r+a]-grid.bytes[8*r+b]));
 const alphabet59=grid.alphabet.replace("f",""),v59=grid.pages.flatMap(p=>p.tokens).map(t=>59*alphabet59.indexOf(t[0])+alphabet59.indexOf(t[1]));
 assert(rows.every((r,j)=>String(r)===String(Array.from({length:8},(_,i)=>i).sort((a,b)=>v59[j*8+a]-v59[j*8+b]))),"rank agreement");
 const mapping=(n,inv)=>Array.from({length:n},(_,j)=>{const r=rows[Math.floor(j/8)%32];return (j&~7)+(inv?r[j%8]:r.indexOf(j%8))});
 function layout(words,n,offset=0){let off=0;const out=[];for(const w of words){if(off>=offset&&off+w.length<=offset+n)out.push({start:off-offset,len:w.length});off+=w.length}return out}
 const start=gp.pages.slice(0,51).reduce((a,p)=>a+p.indices.length,0),C=gp.pages.slice(51,54).flatMap(p=>p.indices).slice(0,512);
 const wordLayout=layout(all,512,start);assert(start===12114&&C.length===512,"target");
 function dictionary(excluded){
  const d=Array.from({length:32},()=>new Map()),add=w=>{if(w.length&&w.length<32)d[w.length].set(chars(w),w)};
  function variant(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");function walk(i,p){if(i===s.length){add(p);return}for(const n of [1,2,3]){const x=s.slice(i,i+n);if(x.length!==n)continue;const v=n===3?(x==="ING"?alpha.get("NG"):undefined):x==="IO"?alpha.get("IA"):alpha.get(x);if(v!==undefined)walk(i+n,p.concat(v))}}walk(0,[])}
  for(const l of lex.split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variant(m[1])}
  for(const w of ["A","I","O"])variant(w);
  solved.forEach((s,i)=>{if(i!==excluded)s.forEach(add)});
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  for(const source of literary)for(let w of source.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]){const p=[];w=w.replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)break;p.push(t.i);w=w.slice(t.s.length)}if(!w)add(p)}
  for(let n=5;n<d.length;n++)for(const w of [...d[n].values()])for(let i=1;i<n-2;i++){if(!w[i]||!w[i+1]||w[i]===w[i+1])continue;const p=w.slice();[p[i],p[i+1]]=[p[i+1],p[i]];add(p)}
  return d;
 }
 function lm(excluded){const count=Array.from({length:29},()=>Array(29).fill(.5)),uni=Array(29).fill(.5);solved.forEach((s,j)=>{if(j===excluded)return;const p=s.flat();p.forEach((x,i)=>{uni[x]++;if(i)count[p[i-1]][x]++})});return [count.map(r=>{const n=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/n))}),uni.map(x=>Math.log(x/uni.reduce((a,b)=>a+b,0)))];}
 function forward(P,key,map,inner){let phase=0;const perm=a=>{const b=Array(a.length);a.forEach((v,i)=>b[map[i]]=v);return b},enc=a=>a.map(p=>p===0?0:mod(p+key[phase++%8]));return inner?enc(perm(P)):perm(enc(P))}
 function restore(C,map,inner){return inner?C:map.map(i=>C[i])}
 function anchors(C,map,inner,layout,d){
  const physical=restore(C,map,inner);
  return layout.filter(w=>w.start+w.len<=256).map(w=>{
    const pos=Array.from({length:w.len},(_,j)=>inner?map[w.start+j]:w.start+j),lo=Math.min(...pos),hi=Math.max(...pos);
    return {...w,pos,lo,hi,zero:physical.slice(lo,hi+1).filter(x=>x===0).length,coverage:new Set(pos.map(i=>i%8)).size};
  }).filter(a=>a.zero===0&&a.len>=5).sort((a,b)=>b.len-a.len||b.coverage-a.coverage||a.start-b.start).slice(0,6).map(a=>{
   const by=new Map();for(const p of d[a.len].values()){if(p.includes(0))continue;for(let phase=0;phase<8;phase++){const key=Array(8).fill(-1);let ok=true;for(let j=0;j<p.length;j++){const i=a.pos[j],slot=(i+phase)%8,v=mod(physical[i]-p[j]);if(key[slot]>=0&&key[slot]!==v){ok=false;break}key[slot]=v}if(!ok)continue;let mask=0;key.forEach((v,i)=>{if(v>=0)mask|=1<<i});if(!by.has(mask))by.set(mask,new Map());by.get(mask).set(chars(key),key)}}
   return {...a,relations:[...by].map(([mask,m])=>({mask,keys:[...m.values()]}))};
  });
 }
 function join(aa){
  const full=new Set(),edges=[],pairs=[];let partialPairs=0,fullCap=false;
  for(let i=0;i<aa.length;i++)for(let j=i+1;j<aa.length;j++){
   let matches=0,partial=0,complete=0;
   for(const A of aa[i].relations)for(const B of aa[j].relations){const both=A.mask&B.mask,union=A.mask|B.mask,positions=Array.from({length:8},(_,k)=>k).filter(k=>both&(1<<k)),hash=new Map();
    for(const a of A.keys){const k=chars(positions.map(i=>a[i]));if(!hash.has(k))hash.set(k,[]);hash.get(k).push(a)}
    for(const b of B.keys){const group=hash.get(chars(positions.map(i=>b[i])));if(!group)continue;matches+=group.length;if(union!==255){partial+=group.length;continue}complete+=group.length;for(const a of group){if(full.size>=150000){fullCap=true;break}full.add(chars(a.map((v,k)=>v<0?b[k]:v)))}}
   }
   if(!matches)edges.push([i,j]);if(partial)partialPairs++;
   pairs.push({i,j,matches,partial,complete});
  }
  let clique=0;for(let s=0;s<(1<<aa.length);s++){if(edges.some(([i,j])=>(s&(1<<i))&&(s&(1<<j))))continue;clique=Math.max(clique,s.toString(2).replace(/0/g,"").length)}
  return {full,edges,pairs,partialPairs,fullCap,minimumOOV:aa.length-clique};
 }
 function feasible(c,k,start=0){let s=1<<start;for(const x of c){let n=0;for(let p=0;p<8;p++)if(s&(1<<p)){if(x===0)n|=1<<p;if(x!==k[p])n|=1<<((p+1)%8)}s=n;if(!s)return false}return !!s}
 function decode(c,k,map,inner,model,start=0,prev=-1,offset=0){
  const [bg,uni]=model;let states=new Map([[start*30+prev+1,{phase:start,last:prev,score:0,chain:null}]]);
  const physical=inner?c:map.slice(offset,offset+c.length).map(i=>c[i-offset]);
  for(let i=0;i<c.length;i+=8){const next=new Map();
   for(const st of states.values()){const p=[];function walk(j,phase){if(j===8){const r=inner?Array.from({length:8},(_,v)=>p[map[offset+i+v]-offset-i]):p.slice();let score=st.score,last=st.last;for(const x of r){score+=last<0?uni[x]:bg[last][x];last=x}const id=phase*30+last+1,old=next.get(id);if(!old||score>old.score)next.set(id,{phase,last,score,chain:{block:r,prev:st.chain}});return}const x=physical[i+j];if(x===0){p.push(0);walk(j+1,phase);p.pop()}const v=mod(x-k[phase]);if(v){p.push(v);walk(j+1,(phase+1)%8);p.pop()}}walk(0,st.phase)}
   states=next;if(!states.size)return null;
  }
  const best=[...states.values()].reduce((a,b)=>a.score>=b.score?a:b),p=[];for(let ch=best.chain;ch;ch=ch.prev)p.unshift(...ch.block);return {...best,p,chain:undefined}
 }
 function run(label,C,layout,d,model,inner,inv,truth=null,key=null){
  const map=mapping(512,inv),aa=anchors(C,map,inner,layout,d),j=join(aa),physical=restore(C,map,inner).slice(0,256);
  const out={label,inner,inv,anchors:aa.map(a=>({start:a.start,len:a.len,coverage:a.coverage,relations:a.relations.reduce((n,r)=>n+r.keys.length,0),masks:a.relations.map(r=>r.mask)})),pairs:j.pairs,minimumOOV:j.minimumOOV,fullKeyCount:j.full.size,partialPairs:j.partialPairs,fullCap:j.fullCap,expectedInFull:key?j.full.has(chars(key)):null};
  if(key)out.expectedInAll=aa.every(a=>a.relations.some(r=>r.keys.some(k=>k.every((v,i)=>v<0||v===key[i]))));
  let best=null,runner=-Infinity,legal=0;
  if(!j.fullCap)for(const id of j.full){const k=Array.from(id,x=>x.charCodeAt(0)-65);if(!feasible(physical,k))continue;legal++;const p=decode(C.slice(0,256),k,map,inner,model);assert(p,"reachability");if(!best||p.score>best.score){if(best)runner=Math.max(runner,best.score);best={...p,key:k}}else runner=Math.max(runner,p.score)}
  out.legalFullKeys=legal;
  if(best){const h=decode(C.slice(256),best.key,map,inner,model,best.phase,best.last,256);const display=p=>p.map(v=>gp.translit[v]).join("");const fullP=h?best.p.concat(h.p):null;out.selected={key:best.key,score:best.score/256,runner:Number.isFinite(runner)?runner/256:null,preview:display(best.p),correctKey:key?String(best.key)===String(key):null,correctPrefix:truth?best.p.filter((v,i)=>v===truth[i]).length:null,holdout:h?{score:h.score/256,preview:display(h.p),correct:truth?h.p.filter((v,i)=>v===truth[256+i]).length:null,replay:String(forward(fullP,best.key,map,inner))===String(C)}:null};if(h)assert(out.selected.holdout.replay,"replay")}
  return out;
 }
 const origD=dictionary(-1),origM=lm(-1),controls=[];
 for(const [idx,key] of [[1,[23,10,1,10,9,10,16,26]],[4,[3,17,9,22,6,1,14,10]]]){
  const p=solved[idx].flat().slice(0,512),lay=layout(solved[idx],512),d=dictionary(idx),m=lm(idx);
  for(const inner of [false,true]){const inv=idx===4,map=mapping(512,inv),c=forward(p,key,map,inner);controls.push(run(native.sections[idx].name,c,lay,d,m,inner,inv,p,key))}
 }
 const target=[];for(const inner of [false,true])for(const inv of [false,true])target.push(run("p51-53",C,wordLayout,origD,origM,inner,inv));
 return {dictionarySize:origD.reduce((n,m)=>n+m.size,0),target,controls};
}
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
