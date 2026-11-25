'use strict';
// Issue #2690. Run from repository root: node sims/lp2_p23_26_two_lane_knownkeys_sft.cjs
const fs=require('node:fs');
function experiment(co,src){
 const A=29,K=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]], names=["DIUINITY","FIRFUMFERENFE"],eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),check=(v,s)=>{if(!v)throw Error(s)},mod=x=>(x+29)%29;
 const C=co.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices),L=[C.filter((_,i)=>i%2===0),C.filter((_,i)=>i%2===1)],ix=new Map(src.runes.map((r,i)=>[r,i])),native=src.sections.map(s=>({name:s.name,p:[...s.source_text].filter(r=>ix.has(r)).map(r=>ix.get(r))}));check(eq(co.runes,src.runes)&&C.length===1021,"source");
 function enc(p,k,start=0){let j=start,generated=0,held=0;const c=p.map(x=>{if(x===0){held++;return 0}const y=(x+k[j])%A;j=(j+1)%k.length;if(y===0)generated++;return y});return {c,end:j,generated,held}}
 function opts(c,k,j){const a=[];if(c===0)a.push([0,j]);const p=mod(c-k[j]);if(p!==0)a.push([p,(j+1)%k.length]);return a}
 function reach(c,k,start=0){let st=new Map([[start,1n]]),peak=1;for(let i=0;i<c.length;i++){const nx=new Map;for(const [j,n] of st)for(const [,q] of opts(c[i],k,j))nx.set(q,(nx.get(q)||0n)+n);if(!nx.size)return {dead:i,c:c[i],phases:[...st.keys()].sort((a,b)=>a-b),keyValues:[...st.keys()].sort((a,b)=>a-b).map(j=>k[j]),peak};st=nx;peak=Math.max(peak,st.size)}return {dead:null,phases:[...st.keys()],paths:[...st.values()].reduce((a,b)=>a+b,0n).toString(),peak}}
 const donorNames=["0_koan_1","0_loss_of_divinity"],P=donorNames.map((s,i)=>native.find(t=>t.name===s).p.slice(0,L[i].length));
 check(P.every((p,i)=>p.length===L[i].length),"donor");
 const u=new Float64Array(A).fill(.5),b=new Float64Array(A*A),bt=new Float64Array(A),t=new Float64Array(A**3),tt=new Float64Array(A*A);
 for(const {name,p} of native){if(donorNames.includes(name))continue;p.forEach((x,i)=>{u[x]++;if(i){const y=p[i-1];b[y*A+x]++;bt[y]++;if(i>1){const z=p[i-2]*A+y;t[z*A+x]++;tt[z]++}}})}
 const n=u.reduce((a,b)=>a+b,0);function lp(x,y,z){const p1=u[z]/n;if(y===A)return Math.log(p1);const p2=(b[y*A+z]+4*p1)/(bt[y]+4);if(x===A)return Math.log(p2);return Math.log((t[(x*A+y)*A+z]+8*p2)/(tt[x*A+y]+8))}
 function decode(c,k,start={j:0,x:A,y:A}){let st=new Map([[`${start.j},${start.x},${start.y}`,{...start,s:0,prev:null,p:null}]]);for(const z of c){let nx=new Map;for(const v of st.values())for(const [p,j] of opts(z,k,v.j)){const id=`${j},${v.y},${p}`,s=v.s+lp(v.x,v.y,p);if(!nx.has(id)||s>nx.get(id).s)nx.set(id,{j,x:v.y,y:p,s,prev:v,p})}if(!nx.size)return null;st=nx}const end=[...st.values()].sort((a,b)=>b.s-a.s)[0],p=[];for(let v=end;v.prev;v=v.prev)p.push(v.p);return {p:p.reverse(),end:{j:end.j,x:end.x,y:end.y},score:end.s/c.length}}
 function predictive(c,k,truth){const cut=Math.floor(.75*c.length),pre=decode(c.slice(0,cut),k);if(!pre)return {cut,legal:false};const post=decode(c.slice(cut),k,pre.end);if(!post)return {cut,legal:false,prefixLegal:true};const p=pre.p.concat(post.p);check(eq(enc(p,k).c,c),"replay");return {cut,legal:true,exact:truth?p.filter((v,i)=>v===truth[i]).length:null,heldoutExact:truth?post.p.filter((v,i)=>v===truth[cut+i]).length:null,heldoutN:post.p.length,prefixScore:pre.score,suffixScore:post.score}}
 let seed=0x2690a024;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const plants=[];for(let a=0;a<2;a++){const E=P.map((p,i)=>enc(p,K[i^a]));const lanes=E.map((e,i)=>({donor:donorNames[i],key:names[i^a],generated:e.generated,held:e.held,reach:reach(e.c,K[i^a]),prediction:predictive(e.c,K[i^a],P[i]),wrongKey:reach(e.c,K[(i^a)^1])}));check(lanes.every(x=>x.reach.dead===null&&x.generated>0&&x.held>0),"native control");const interleaved=Array.from({length:C.length},(_,i)=>E[i%2].c[i>>1]);check(eq(interleaved.filter((_,i)=>i%2===0),E[0].c)&&eq(interleaved.filter((_,i)=>i%2===1),E[1].c),"interleave");plants.push({assignment:a,lanes})}
 const pads=Array.from({length:16},(_,i)=>L.map((l,j)=>reach(l.map(()=>rnd()%A),K[j^(i%2)]).dead));
 const p56=native.find(x=>x.name==="p56_an_end").p,primes=[];for(let x=2;primes.length<p56.length;x++)if(primes.every(p=>x%p!==0))primes.push(x);let cursor=0;const p56c=p56.map(x=>x===0?0:(x+primes[cursor++]-1)%A);check(eq(p56c,co.pages.find(p=>p.page===56).indices),"p56 control");
 const original=L.flatMap((l,i)=>K.map((k,j)=>{const g=reach(l,k);const global=g.dead===null?null:2*g.dead+i;return {lane:i,key:names[j],n:l.length,...g,chapterOffset:global,physicalPage:global===null?null:23+([213,483,756].filter(x=>global>=x).length)}}));
 check(original.every(x=>x.dead!==null),"original unexpectedly survives");
 return {pageCounts:co.pages.filter(p=>p.page>=23&&p.page<=26).map(p=>p.indices.length),N:C.length,keys:K,names,p56Control:{n:p56.length,exact:true,held:p56.length-cursor},donorNames,plants,pads,original,classification:"exact exclusion of the two frozen assignments; no original language scoring"};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(...paths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')))),null,2));
