'use strict';
// Spacing-free collision and state bounds for plaintext-driven cumulative GP29 emitters.
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function main(raw,mode="state"){
const g=JSON.parse(raw[0]), ds=g.pages.filter(x=>x.page<=55&&x.indices.length).map(x=>x.indices.slice(1).map((v,i)=>(v-x.indices[i]+29)%29)),N=ds.reduce((s,p)=>s+p.length,0);
const toks=[...g.translit.map((s,i)=>[s,i]),["ING",21],["IO",27]].sort((a,b)=>b[0].length-a[0].length);
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(let w of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=toks.find(([s])=>w.startsWith(s,j));if(!v)throw Error(w);p.push(v[1]);j+=v[0].length}}return p}
function grams(p,k,excludeF){const ids=[];for(let i=0;i+k<=p.length;i++){let s="",ok=true;for(let j=i;j<i+k;j++){if(excludeF&&!p[j]){ok=false;break}s+=String.fromCharCode(65+p[j])}ids.push(ok?s:null)}return ids}
function collisions(a){const c=new Map();let n=0,max=0;for(const x of a){if(x===null)continue;const m=c.get(x)||0;n+=m;c.set(x,m+1);max=Math.max(max,m+1)}return{pairs:n,max}}
function bound(m,S){const q=Math.floor(m/S);return S*q*(q-1)/2+(m%S)*q}
function frameScan(p,k,outLen,states,keep=false){
 const a=grams(p,k,true),dict=new Map(),A=Int32Array.from(a.map(x=>{if(x===null)return -1;if(!dict.has(x))dict.set(x,dict.size);return dict.get(x)}));
 const ranges=[];let off=0;for(const f of ds){if(f.length>=k)ranges.push([off,off+f.length-k]);off+=f.length}
 const counts=new Int32Array(dict.size),pairs=states.map(()=>0),cost=states.map(S=>Array.from({length:N+1},(_,m)=>bound(m,S)));
 function upd(x,d){if(x<0)return;const v=counts[x],u=v+d;counts[x]=u;for(let j=0;j<states.length;j++)pairs[j]+=cost[j][u]-cost[j][v]}
 for(const [l,h] of ranges)for(let i=l;i<=h;i++)upd(A[i],1);
 const min=states.map(()=>Infinity),survive=states.map(()=>0),arg=states.map(()=>-1),survivors=[];const cipher=collisions(ds.flatMap(f=>grams(f,outLen,false)));
 for(let s=0;s+N<=p.length;s++){for(let j=0;j<states.length;j++){let v=pairs[j];if(v<min[j]){min[j]=v;arg[j]=s}if(v<=cipher.pairs){survive[j]++;if(keep&&j===0)survivors.push(s)}}if(s+N<p.length)for(const [l,h] of ranges){upd(A[s+l],-1);upd(A[s+h+1],1)}}
 return {cipher,N,k,outLen,windows:p.length-N+1,states,min,survive,arg,survivors:keep?survivors:undefined}
}
function exactHistory(p,start,m){let s=start,seen=new Map(),used=0;for(const d of ds){let h=[];for(let i=0;i<d.length;i++){const x=p[s++];if(!x)continue;if(h.length===m){const key=h.join(",")+","+x;if(seen.has(key)&&seen.get(key)!==d[i])return{legal:false,used};seen.set(key,d[i]);used++}h.push(x);if(h.length>m)h.shift()}}return{legal:true,used}}
const p=raw.slice(1).map(native);
if(mode==="state")return [5,6,7].map(k=>p.map(a=>frameScan(a,k,k,[1,2,3,4,5,6,7,8,9,10,12,16,20,24,29,32])));
if(mode==="memory")return [1,2,3,4,5,6,7,8].map(m=>p.map(a=>{const b=frameScan(a,m+6,6,[1],true);let legal=0,minConflict=Infinity;for(const s of b.survivors){const x=exactHistory(a,s,m);if(x.legal)legal++;else minConflict=Math.min(minConflict,x.used)}delete b.survivors;return{m,...b,legal,minConflict:Number.isFinite(minConflict)?minConflict:null}}));
if(mode==="controls"){
 let seed=170427;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
 const res=[];for(const S of [1,2,4,8,13]){const a=p[0].slice(0,N),tab=Array.from({length:S},()=>Array.from({length:29},()=>rnd(29))),next=Array.from({length:S},()=>Array.from({length:29},()=>rnd(S)));let pos=0;const cs=[],ps=[],ss=[];for(const f of ds){let st=rnd(S),c=rnd(29),d=[],pp=[],q=[];for(let i=0;i<f.length;i++){const x=a[pos++];pp.push(x);q.push(st);if(!x){d.push((29-c)%29);c=0;continue}const v=tab[st][x];d.push(v);c=(c+v)%29;st=next[st][x]}cs.push(d);ps.push(pp);ss.push(q)}
 for(const k of [5,6,7]){const c=collisions(cs.flatMap(f=>grams(f,k,false))).pairs,counts=new Map(),joint=new Map();for(let i=0;i<ps.length;i++){const aa=grams(ps[i],k,true),bb=grams(cs[i],k,false);for(let j=0;j<aa.length;j++){const x=aa[j];if(x===null)continue;counts.set(x,(counts.get(x)||0)+1);const id=x+":"+ss[i][j];if(joint.has(id)&&joint.get(id).out!==bb[j])throw Error("determinism");const h=joint.get(id)||{out:bb[j],n:0};h.n++;joint.set(id,h)}}const lo=[...counts.values()].reduce((s,m)=>s+bound(m,S),0),actual=[...joint.values()].reduce((s,h)=>s+h.n*(h.n-1)/2,0);if(!(lo<=actual&&actual<=c))throw Error("bound");res.push({S,k,lo,actual,c})}}
 return res;
}
throw Error(mode)
}
if(require.main===module){const fs=require('node:fs');console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'state'),null,2))}
module.exports={main,paths};
