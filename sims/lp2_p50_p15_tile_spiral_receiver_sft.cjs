'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function experiment(grid,corpus,solved){
 const tokens=grid.pages.flatMap(p=>p.tokens), alpha=grid.alphabet.replace('f',''), val=t=>alpha.indexOf(t[0])*59+alpha.indexOf(t[1]), vals=tokens.map(val);
 const tile=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
 const core=Array.from({length:28},(_,i)=>Array.from({length:4},(_,j)=>(i+2)*8+j+2));
 const tiled=Array.from({length:7},(_,b)=>tile.map(k=>core[4*b+(k>>2)][k%4])).flat();
 function spiral(a){let t=0,b=a.length-1,l=0,r=a[0].length-1,o=[];while(t<=b&&l<=r){for(let j=l;j<=r;j++)o.push(a[t][j]);t++;for(let i=t;i<=b;i++)o.push(a[i][r]);r--;if(t<=b){for(let j=r;j>=l;j--)o.push(a[b][j]);b--}if(l<=r){for(let i=b;i>=t;i--)o.push(a[i][l]);l++}}return o}
 // bottom-left, first right, counterclockwise: exact reverse of p15 outer shell.
 const reversedShell=spiral(core.slice().reverse());
 // top-right, first down, clockwise (Agent39).
 const selected=spiral(core[0].map((_,j)=>core.map(row=>row[core[0].length-1-j])));
 const p57=solved.sections.find(x=>x.name==="p57_parable");
 const words=(p57.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>{let x=[...w].map(r=>corpus.runes.indexOf(r));return {word:x.map(i=>corpus.translit[i]).join(''),addr:x.reduce((a,b)=>a+b,0)}});
 const mod=x=>(x%29+29)%29;
 function orbit(order,x){let out=[],seen=new Map();while(x>=0&&x<order.length&&!seen.has(x)){seen.set(x,out.length);out.push(x);x=vals[order[x]]}return {path:out,end:x,cycle:x<order.length?out.slice(seen.get(x)):[],exit:x>=order.length}}
 function legal(c,k,phases){let states=new Set(phases),consumed=0;for(let i=0;i<c.length;i++){const next=new Set();for(const j of states){if(c[i]===0)next.add(j);if(mod(c[i]-k[j])!==0)next.add((j+1)%k.length)}if(!next.size)return {prefix:i,terminal:0};states=next;consumed=i+1}return {prefix:consumed,terminal:states.size}}
 function ioc(x){const h=Array(29).fill(0);x.forEach(v=>h[v]++);return h.reduce((a,v)=>a+v*(v-1),0)/(x.length*(x.length-1))}
 const whole=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const native=[...p57.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
 const controls=native.concat(native,native,native);
 const details=[];
 for(const [name,order] of Object.entries({tiled,reversedShell,selected})){
  if(new Set(order).size!==112)throw Error("bad permutation");
  const pointer=x=>x<112?vals[order[x]]:null;
  const edges=words.slice(0,-1).flatMap((w,i)=>pointer(w.addr)===words[i+1].addr?[`${w.word}->${words[i+1].word}`]:[]);
  const paths=words.map(w=>({word:w.word,addr:w.addr,...orbit(order,w.addr)}));
  const allOrbits=Array.from({length:112},(_,i)=>orbit(order,i));
  const key=order.map(i=>vals[i]%29);
  let j=0;const plant=controls.map(p=>p===0?0:mod(p+key[j++%112]));
  const positive=legal(plant,key,[0]);if(positive.prefix!==controls.length)throw Error('control failed');
  const raw=whole.map((v,i)=>mod(v-key[i%112]));
  const chapterStarts=[0,3,8,15,23,27,33,40,54];
  const chapters=chapterStarts.map((p,i)=>{const cc=corpus.pages.filter(x=>x.page>=p&&x.page<(chapterStarts[i+1]??56)).flatMap(x=>x.indices);return {start:p,n:cc.length,allphase:legal(cc,key,Array.from({length:112},(_,i)=>i))}});
  details.push({name,first16:order.slice(0,16),edges,WE:paths.find(x=>x.word==='WE'),MUST:paths.find(x=>x.word==='MUST'),paths,exitCount:allOrbits.filter(x=>x.exit).length,cycles:[...new Set(allOrbits.filter(x=>!x.exit).map(x=>x.cycle.slice().sort((a,b)=>a-b).join(',')))],key,positive,wholeFixed:legal(whole,key,[0]),wholeAllPhase:legal(whole,key,Array.from({length:112},(_,i)=>i)),ordinaryIoc:ioc(raw),ordinaryPrefix:raw.slice(0,50).map(x=>corpus.translit[x]).join(' '),chapters})
 }
 return {words,details}
}
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
