"use strict";
const fs=require("node:fs");const path=require("node:path");
function experiment(book,native,em,gib,sha){
 const Q=29,key=[15,8,18,3,6,19,27,0,15,26,18,21,5],q=key.length,sizes=[249,266,201],mod=x=>((x%Q)+Q)%Q,det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]);
 const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw Error("singular");};
 const map=new Map(book.translit.map((x,i)=>[x,i]));
 function latin(text){const out=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){const z=w.slice(i,i+2);if(z.length===2&&map.has(z)){out.push(map.get(z));i+=2;}else{const v=map.get(w[i++]);if(v!==undefined)out.push(v);}}}return out;}
 const texts=native.sections.map(s=>Array.from(s.source_text).map(x=>native.runes.indexOf(x)).filter(x=>x>=0));texts.push(latin(em).slice(1000));
 const counts=new Float64Array(Q).fill(.5),pairs=new Float64Array(Q*Q),tot=new Float64Array(Q);
 for(const p of texts)for(let i=0;i<p.length;i++){counts[p[i]]++;if(i){pairs[p[i-1]*Q+p[i]]++;tot[p[i-1]]++;}}
 const sum=counts.reduce((a,b)=>a+b,0),uni=Array.from(counts,x=>Math.log(x/sum)),big=new Float64Array(Q*Q);
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)big[a*Q+b]=Math.log((pairs[a*Q+b]+12*counts[b]/sum)/(tot[a]+12));
 function emit(p){let phase=0;return p.map(x=>{if(x===0)return 0;const z=mod(x+key[phase]);phase=(phase+1)%q;return z;});}
 function encrypt(pages,rows){
  const d=inv(det(rows[0],rows[1])),[a,b]=rows[0],[c,e]=rows[1];
  return pages.map(p=>{const n=p.length>>1,out=p.slice(),l=emit(p.slice(0,n)),r=emit(p.slice(p.length-n).reverse());for(let i=0;i<n;i++){out[i]=mod(d*(e*l[i]-b*r[i]));out[p.length-1-i]=mod(d*(-c*l[i]+a*r[i]));}return out;});
 }
 function project(p,row){const n=p.length>>1;return Array.from({length:n},(_,i)=>mod(row[0]*p[i]+row[1]*p[p.length-1-i]));}
 function decodeRail(z,reverse,wantPath=false){
  // State is (next key phase, previous plaintext); prior for right rail is added at final state.
  let dp=new Map([[-1,0]]),trace=wantPath?[]:null;
  for(let i=0;i<z.length;i++){
   const next=new Map(),prevs=wantPath?new Map():null;
   const step=(sid,sc,p,np)=>{const old=sid<0?-1:sid%Q;const ns=np*Q+p,add=old<0?(reverse?0:uni[p]):(reverse?big[p*Q+old]:big[old*Q+p]);const s=sc+add;if(!next.has(ns)||s>next.get(ns)){next.set(ns,s);if(wantPath)prevs.set(ns,sid);}};
   for(const [sid,sc] of dp){const phase=sid<0?0:Math.floor(sid/Q);if(z[i]===0)step(sid,sc,0,phase);const p=mod(z[i]-key[phase]);if(p!==0)step(sid,sc,p,(phase+1)%q);}
   if(!next.size)return {valid:false,dead:i};dp=next;if(wantPath)trace.push(prevs);
  }
  let best=-Infinity,id=-1;for(const [sid,sc] of dp){const s=sc+(reverse?uni[sid%Q]:0);if(s>best){best=s;id=sid;}}
  const p=[];if(wantPath)for(let i=z.length-1;i>=0;i--){p.push(id%Q);id=trace[i].get(id);}p.reverse();
  return {valid:true,score:best,plain:p};
 }
 function rank(pages,reverse){const rows=[],dead=[0,0];let survivors=0;for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)if(a||b){let s=0,ok=true;for(let i=0;i<pages.length;i++){const x=decodeRail(project(pages[i],[a,b]),reverse);if(!x.valid){dead[i]++;ok=false;break;}s+=x.score;}if(ok){survivors++;rows.push({row:[a,b],score:s});}}return {rows:rows.sort((a,b)=>b.score-a.score),survivors,dead};}
 function fit(pages){const l=rank(pages,false),r=rank(pages,true);let best=null,independent=0;for(const a of l.rows)for(const b of r.rows)if(det(a.row,b.row)){independent++;const s=a.score+b.score;if(!best||s>best.score)best={rows:[a.row,b.row],score:s};}return {best,leftSurvivors:l.survivors,rightSurvivors:r.survivors,leftDead:l.dead,rightDead:r.dead,independent};}
 function decrypt(pages,rows){let bad=null;const plain=pages.map((p,i)=>{const l=decodeRail(project(p,rows[0]),false,true),r=decodeRail(project(p,rows[1]),true,true);if(!l.valid||!r.valid){bad={page:i,left:l.valid?null:l.dead,right:r.valid?null:r.dead};return null;}return [...l.plain,...(p.length%2?[p[p.length>>1]]:[]),...r.plain.slice().reverse()];});return {plain,bad};}
 function score(pages){let n=0,s=0;for(const p of pages){const m=p.length>>1;for(const rail of [p.slice(0,m),p.slice(p.length-m)]){s+=uni[rail[0]];n++;for(let i=1;i<rail.length;i++){s+=big[rail[i-1]*Q+rail[i]];n++;}}}return s/n+Math.log(Q);}
 let st=0xc6a7032d;function rand(){st^=st<<13;st=st>>>17^st;st^=st<<5;return st>>>0;}
 const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function split(p,o){return sizes.map(n=>{const r=p.slice(o,o+n);o+=n;if(r.length!==n)throw Error("short");return r;});}
 const controls=[];
 for(const [name,donor,o] of [["Gibran-A",latin(gib),800],["Gibran-B",latin(gib),2300],["Shakespeare",latin(sha),1300]]){
   const p=split(donor,o);let rows;do{rows=Array.from({length:2},()=>[rand()%Q,rand()%Q]);}while(!det(rows[0],rows[1]));
   const c=encrypt(p,rows),f=fit(c.slice(0,2)),d=f.best?decrypt(c,f.best.rows):null,full=d&&!d.bad;
   controls.push({name,rows,fit:f,rowMatch:!!f.best&&exact(f.best.rows,rows),heldoutMatch:full?d.plain[2].filter((v,i)=>v===p[2][i]).length:0,heldout:201,holdoutGain:full?score(d.plain.slice(2)):null,replay:!!full&&exact(encrypt(d.plain,f.best.rows),c),bad:d?.bad});
 }
 if(!controls.every(x=>x.rowMatch&&x.heldoutMatch>=191&&x.replay))return {key,sizes,controls,original:null};
 if(!exact(book.pages[0].indices.slice(0,13),key))throw Error("source title changed");
 const c=[book.pages[0].indices.slice(13),book.pages[1].indices,book.pages[2].indices];if(!exact(c.map(x=>x.length),sizes))throw Error("source lengths changed");
 const f=fit(c.slice(0,2)),d=f.best?decrypt(c,f.best.rows):null,full=d&&!d.bad;
 const original={fit:f,bad:d?.bad,full:!!full,holdoutGain:full?score(d.plain.slice(2)):null,replay:!!full&&exact(encrypt(d.plain,f.best.rows),c),decoded:full?d.plain.map(p=>p.map(x=>book.translit[x]).join(" ")):null};
 return {key,sizes,controls,original};
}
const load=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");const lines=p=>load(p).split(/\r?\n/).slice(0,400).join("\n");
console.log(JSON.stringify(experiment(JSON.parse(load("resources/liber-primus/lp2-corpus.json")),JSON.parse(load("resources/external/relikd-solved-gp29-native-v1.json")),lines("resources/control/emerson_essays_2944.txt"),lines("resources/control/gibran_prophet_58585.txt"),lines("resources/control/shakespeare_first300k.txt")),null,2));
