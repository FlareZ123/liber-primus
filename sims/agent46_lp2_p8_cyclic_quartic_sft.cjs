"use strict";
const fs=require("node:fs");
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const ref=fs.readFileSync("resources/liber-primus/lp1-plaintext-reference.txt","utf8");
const N=243,Q=29,K=Q**4,mod=x=>((x%Q)+Q)%Q;
const inv=Array.from({length:29},(_,i)=>i?Array.from({length:29},(_,j)=>j).find(j=>i*j%Q===1):0);
const C=corpus.pages[8].indices.slice(12);
if(C.length!==N)throw Error("p8 black body");
function gp(s){
 const out=[],alphabet=corpus.translit;
 for(const word of s.toUpperCase().match(/[A-Z]+/g)??[])for(let i=0;i<word.length;){
  if(word.slice(i,i+3)==="ING"){out.push(21);i+=3;continue}
  if(word.slice(i,i+2)==="IO"){out.push(27);i+=2;continue}
  const t=alphabet.indexOf(word.slice(i,i+2));
  if(t>=0&&alphabet[t].length===2){out.push(t);i+=2;continue}
  const u=alphabet.indexOf(({K:"C",Q:"C",V:"U"})[word[i]]??word[i]);
  if(u<0)throw Error(word);out.push(u);i++;
 }return out;
}
const p1=gp(ref.slice(ref.indexOf("WELCOME, PILGRIM"),ref.indexOf("WISDOM\n"))).slice(0,N);
const p2=gp(ref.slice(ref.indexOf("A MAN DECIDED"),ref.indexOf("### 7"))).slice(0,N);
const plants=[{p:p1,r:[9,26,17,5],a:7,b:11},{p:p2,r:[3,8,4,12],a:13,b:21}];
const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const pair=p=>{let n=new Int32Array(29),s=0;for(const x of p)s+=n[x]++;return s};
const key=k=>[k%29,Math.floor(k/29)%29,Math.floor(k/841)%29,Math.floor(k/24389)%29];
const id=r=>r[0]+29*(r[1]+29*(r[2]+29*r[3]));
function tx(a,r){return [a[3]*r[0]%29,(a[0]+a[3]*r[1])%29,(a[1]+a[3]*r[2])%29,(a[2]+a[3]*r[3])%29]}
function sq(a,r){
 const p=[a[0]*a[0],2*a[0]*a[1],2*a[0]*a[2]+a[1]*a[1],2*a[0]*a[3]+2*a[1]*a[2],2*a[1]*a[3]+a[2]*a[2],2*a[2]*a[3],a[3]*a[3]];
 for(let i=6;i>=4;i--){const z=p[i]%29;for(let j=0;j<4;j++)p[i-4+j]+=z*r[j]}
 return [p[0]%29,p[1]%29,p[2]%29,p[3]%29];
}
function close(r){
 let a=[1,0,0,0];for(let bit=7;bit>=0;bit--){a=sq(a,r);if((N>>bit)&1)a=tx(a,r)}
 const m=new Int32Array(32);
 for(let i=0;i<4;i++){for(let j=0;j<4;j++)m[i*8+j]=mod(Number(i===j)-a[j]);m[i*8+4+i]=1;a=tx(a,r)}
 for(let j=0;j<4;j++){
  let k=j;while(k<4&&!m[k*8+j])k++;if(k===4)return null;
  if(k!==j)for(let h=j;h<8;h++){const t=m[k*8+h];m[k*8+h]=m[j*8+h];m[j*8+h]=t}
  const z=inv[m[j*8+j]];for(let h=j;h<8;h++)m[j*8+h]=m[j*8+h]*z%29;
  for(let i=0;i<4;i++)if(i!==j){const w=m[i*8+j];if(w)for(let h=j;h<8;h++)m[i*8+h]=mod(m[i*8+h]-w*m[j*8+h])}
 }
 return [m[4],m[5],m[6],m[7],m[12],m[13],m[14],m[15],m[20],m[21],m[22],m[23],m[28],m[29],m[30],m[31]];
}
function enc(p,r){return p.map((x,i)=>mod(x-r[0]*p[(i+N-4)%N]-r[1]*p[(i+N-3)%N]-r[2]*p[(i+N-2)%N]-r[3]*p[(i+N-1)%N]))}
const counts=new Int32Array(29);
function dec(c,r,m,full=false){
 let u=0,v=0,w=0,x=0,z;const [r0,r1,r2,r3]=r;
 for(let i=0;i<N;i++){z=(c[i]+r0*u+r1*v+r2*w+r3*x)%29;u=v;v=w;w=x;x=z}
 const s0=(m[0]*u+m[1]*v+m[2]*w+m[3]*x)%29,s1=(m[4]*u+m[5]*v+m[6]*w+m[7]*x)%29,s2=(m[8]*u+m[9]*v+m[10]*w+m[11]*x)%29,s3=(m[12]*u+m[13]*v+m[14]*w+m[15]*x)%29;
 u=s0;v=s1;w=s2;x=s3;let sum=0;const p=full?[]:null;counts.fill(0);
 for(let i=0;i<N;i++){z=(c[i]+r0*u+r1*v+r2*w+r3*x)%29;sum+=counts[z]++;if(full)p.push(z);u=v;v=w;w=x;x=z}
 if(u!==s0||v!==s1||w!==s2||x!==s3)throw Error("cyclic closure");return full?p:sum;
}
for(const q of plants){if(q.p.length!==N)throw Error("short control");q.x=q.p.map(v=>mod((v-q.b)*inv[q.a]));q.c=enc(q.x,q.r);const m=close(q.r);if(!m||!eq(dec(q.c,q.r,m,true),q.x))throw Error("plant replay");q.target=pair(q.p)}
const tapes=[C,...plants.map(q=>q.c)],tops=tapes.map(()=>[]),rank=[0,0],ties=[0,0];
let valid=0;
const add=(t,s,k)=>{if(t.length===32&&s<t[t.length-1].s)return;t.push({s,k});t.sort((a,b)=>b.s-a.s||a.k-b.k);if(t.length>32)t.pop()};
for(let k=0;k<K;k++){
 const r=key(k),m=close(r);if(!m)continue;valid++;
 for(let j=0;j<tapes.length;j++){const s=dec(tapes[j],r,m);add(tops[j],s,k);if(j){rank[j-1]+=Number(s>plants[j-1].target);ties[j-1]+=Number(s===plants[j-1].target)}}
}
const tr=gp(ref.slice(ref.indexOf("A WARNING"),ref.indexOf("### 3"))+" "+ref.slice(ref.indexOf("THE LOSS OF DIVINITY"),ref.indexOf("### 14"))).concat(corpus.pages[57].indices);
const bi=new Float64Array(29*29).fill(0.1),total=new Float64Array(29).fill(2.9);
for(let i=1;i<tr.length;i++){bi[tr[i-1]*29+tr[i]]++;total[tr[i-1]]++}
const lm=Array.from(bi,(x,i)=>Math.log(x/total[Math.floor(i/29)]));
function best(t,top){let win=null;for(const h of top){const r=key(h.k),x=dec(t,r,close(r),true);if(!eq(enc(x,r),t))throw Error("replay");for(let a=1;a<29;a++)for(let b=0;b<29;b++){let score=0,prev=(a*x[0]+b)%29;for(let i=1;i<N;i++){const z=(a*x[i]+b)%29;score+=lm[prev*29+z];prev=z}if(!win||score>win.score)win={score,r,a,b,p:x.map(v=>(a*v+b)%29),s:h.s}}}return win}
const winners=tapes.map((t,i)=>best(t,tops[i]));
console.log(JSON.stringify({valid,singular:K-valid,originalPairs:pair(C),top:tops.map(t=>t.map(h=>({r:key(h.k),pairs:h.s}))),rank,ties,plants:plants.map((q,i)=>({r:q.r,a:q.a,b:q.b,plainPairs:q.target,trueKeyId:id(q.r),winnerExact:winners[i+1].p.filter((v,j)=>v===q.p[j]).length})),winners:winners.map(w=>({...w,preview:w.p.map(i=>corpus.translit[i]).join(" ")}))},null,2));
