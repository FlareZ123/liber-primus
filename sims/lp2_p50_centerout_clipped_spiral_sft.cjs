'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function experiment(grid,corpus,solved){
 const mod=x=>(x%29+29)%29;
 /** Clip the original square-lattice spiral to a centered even rectangle. */
 function spiral(h,w){
  let r=h/2-1,j=w/2-1;
  const out=[r*w+j],dirs=[[0,1],[1,0],[0,-1],[-1,0]];
  for(let d=0;out.length<h*w;d++)for(let i=0;i<1+(d>>1);i++){
   r+=dirs[d%4][0];j+=dirs[d%4][1];
   if(r>=0&&r<h&&j>=0&&j<w)out.push(r*w+j);
  }
  if(new Set(out).size!==h*w)throw Error("spiral duplicates");
  return out;
 }
 const tile=spiral(4,4),expected=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
 if(tile.join()!==expected.join())throw Error("p15 original geometry mismatch");
 const order=spiral(28,4).map(x=>(2+Math.floor(x/4))*8+2+x%4),tokens=grid.pages.flatMap(p=>p.tokens),alpha=grid.alphabet.replace("f","");
 if(tokens.length!==256||alpha.length!==59)throw Error("table shape/radix mismatch");
 const vals=order.map(i=>alpha.indexOf(tokens[i][0])*59+alpha.indexOf(tokens[i][1])),key=vals.map(mod);
 const seq=x=>[...x.source_text].map(r=>corpus.runes.indexOf(r)).filter(v=>v>=0);
 const words=solved.sections.find(x=>x.name==="p57_parable").source_text.match(/[\u16a0-\u16ff]+/gu).map(w=>{const a=[...w].map(r=>corpus.runes.indexOf(r));return {word:a.map(i=>corpus.translit[i]).join(""),addr:a.reduce((x,y)=>x+y,0)}});
 function orbit(a){const seen=new Map(),path=[];while(a<vals.length&&!seen.has(a)){seen.set(a,path.length);path.push(a);a=vals[a]}return {path,end:a,cycle:a<vals.length?path.slice(seen.get(a)):[]}}
 const edges=[];for(let i=0;i<words.length;i++)for(let j=0;j<words.length;j++)if(i!==j&&vals[words[i].addr]===words[j].addr)edges.push({from:words[i].word,to:words[j].word,fromPos:i,toPos:j,cell:order[words[i].addr],token:tokens[order[words[i].addr]]});
 const orbits=Array.from({length:112},(_,a)=>orbit(a));
 function model(exclude){
  const counts=Array(29).fill(.5),big=Array.from({length:29},()=>Array(29).fill(.5));for(const n of solved.sections.filter(x=>x.name!==exclude&&x.name!=="p57_parable").map(seq))for(let i=0;i<n.length;i++){counts[n[i]]++;if(i)big[n[i-1]][n[i]]++}
  const sum=a=>a.reduce((x,y)=>x+y,0);
  return {u:counts.map(v=>Math.log(v/sum(counts))),b:big.map(row=>row.map(v=>Math.log(v/sum(row))))};
 }
 function reach(cipher,starts){
  let states=new Set(starts);
  for(let i=0;i<cipher.length;i++){
   const next=new Set();for(const j of states){if(cipher[i]===0)next.add(j);if(mod(cipher[i]-key[j])!==0)next.add((j+1)%112)}
   if(!next.size)return {prefix:i,terminal:0};states=next;
  }
  return {prefix:cipher.length,terminal:states.size};
 }
 function enc(p,start){let j=start;return p.map(v=>v===0?0:mod(v+key[j++%112]))}
 function decode(cipher,starts,{u,b}){
  let best=null;for(const start of starts){let states=new Map([[start*30+29,{j:start,last:29,score:0,p:[]}]]);
   for(const v of cipher){const next=new Map();for(const st of states.values()){
    const put=(p,j)=>{const k=j*30+p,score=st.score+(st.last===29?u[p]:b[st.last][p]);if(!next.has(k)||score>next.get(k).score)next.set(k,{j,last:p,score,p:[...st.p,p]})};
    if(v===0)put(0,st.j);const p=mod(v-key[st.j]);if(p!==0)put(p,(st.j+1)%112);
   }states=next;if(!states.size)break}
   for(const st of states.values())if(!best||st.score>best.score)best={start,...st};
  }
  return best&&{...best,score:best.score/cipher.length};
 }
 function ioc(p){const h=Array(29).fill(0);p.forEach(v=>h[v]++);return h.reduce((n,v)=>n+v*(v-1),0)/(p.length*(p.length-1))}
 const all=Array.from({length:112},(_,i)=>i),whole=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),starts=[0,3,8,15,23,27,33,40,54],{u,b}=model(null);
 const ranges=starts.map((p,i)=>{const cc=corpus.pages.filter(x=>x.page>=p&&x.page<(starts[i+1]??56)).flatMap(x=>x.indices),ordinary=cc.map((v,j)=>mod(v-key[j%112]));return {p,n:cc.length,reach:reach(cc,all),fixed:reach(cc,[0]),ordinaryIoc:ioc(ordinary),ordinaryScore:ordinary.reduce((s,p,i)=>s+(i?b[ordinary[i-1]][p]:u[p]),0)/ordinary.length}});
 const controls=[["0_welcome",0],["0_koan_1",37],["0_loss_of_divinity",91]].map(([name,phase])=>{const p=seq(solved.sections.find(x=>x.name===name)).slice(0,308),cc=enc(p,phase),d=decode(cc,all,model(name));if(!d||!enc(d.p,d.start).every((v,i)=>v===cc[i]))throw Error("control replay");return {name,phase,recoveredPhase:d.start,correct:d.p.filter((v,i)=>v===p[i]).length,n:p.length,score:d.score,replay:true}});
 return {tile,order,edges,wordOrbits:words.map(w=>({...w,...orbit(w.addr)})),allCoreExits:orbits.filter(x=>!x.cycle.length).length,whole:reach(whole,all),wholeFixed:reach(whole,[0]),ranges,controls};
}
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-grid-256.json"),read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
