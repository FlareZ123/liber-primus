"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function spacingFree(corpus,training,donorA,donorB){
 const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109], idx=new Map(code.map((p,i)=>[p,i]));
 const N=29,S=N*N, tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 const encode=text=>{const out=[];for(const word of text.match(/[a-z]+/gi)||[]){let w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const q=tokens.find(([t])=>w.startsWith(t,i));if(!q)throw Error("unencoded");out.push(q[1]);i+=q[0].length;}}return out};
 const stream=encode(training), u=new Float64Array(N).fill(.25), b=new Float64Array(S).fill(.25), t=new Float64Array(S*N).fill(.25);
 for(let i=0;i<stream.length;i++){const x=stream[i];u[x]++;if(i)b[stream[i-1]*N+x]++;if(i>1)t[(stream[i-2]*N+stream[i-1])*N+x]++;}
 const norm=(arr,n)=>{for(let k=0;k<arr.length;k+=n){let z=0;for(let x=0;x<n;x++)z+=arr[k+x];for(let x=0;x<n;x++)arr[k+x]/=z;}};
 norm(u,N);norm(b,N);norm(t,N);
 const lu=u.map(Math.log),lb=b.map(Math.log),lt=t.map(Math.log);
 const partner=Array.from({length:128},(_,d)=>code.map(x=>idx.get(x^d)??-1));
 const valid=partner.map(a=>a.flatMap((x,i)=>x>=0?[i]:[]));
 function decode(ds,cut=48,wantViterbi=false){
  let cur=new Float64Array(S),next=new Float64Array(S),v=new Float64Array(S).fill(-Infinity),vn=new Float64Array(S), back=wantViterbi?[]:null, logZ=0, pre=0;
  const a=ds[0],d=ds[1];let z=0;
  for(const x of valid[a])for(const y of valid[d]){const k=x*N+y, kb=partner[a][x]*N+partner[d][y];cur[k]=u[x]*u[partner[a][x]]*b[k]*b[kb];z+=cur[k];if(wantViterbi)v[k]=lu[x]+lu[partner[a][x]]+lb[k]+lb[kb];}
  logZ=Math.log(z);for(let i=0;i<S;i++)cur[i]/=z;
  for(let i=2;i<ds.length;i++){const d0=ds[i-2],d1=ds[i-1],d2=ds[i];next.fill(0);if(wantViterbi)vn.fill(-Infinity);const bp=wantViterbi?new Int16Array(S).fill(-1):null;
   for(const x of valid[d0])for(const y of valid[d1]){const k=x*N+y,kb=partner[d0][x]*N+partner[d1][y],p=cur[k];for(const w of valid[d2]){const j=y*N+w,h=k*N+w,hb=kb*N+partner[d2][w];next[j]+=p*t[h]*t[hb];if(wantViterbi){const q=v[k]+lt[h]+lt[hb];if(q>vn[j]){vn[j]=q;bp[j]=x;}}}}
   z=0;for(let k=0;k<S;k++)z+=next[k];logZ+=Math.log(z);for(let k=0;k<S;k++)next[k]/=z;[cur,next]=[next,cur];if(wantViterbi){[v,vn]=[vn,v];back[i]=bp;}if(i+1===cut)pre=logZ;
  }
  if(!wantViterbi)return {logZ,pre};
  let k=0;for(let i=1;i<S;i++)if(v[i]>v[k])k=i;
  const p=new Array(ds.length);p[p.length-2]=Math.floor(k/N);p[p.length-1]=k%N;
  for(let i=p.length-1;i>=2;i--)p[i-2]=back[i][p[i-1]*N+p[i]];
  return {logZ,pre,viterbi:v[k],p,q:p.map((x,i)=>partner[ds[i]][x])};
 }
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 const penalty=D=>D.reduce((s,d)=>s+Math.log(valid[d].length),0);
 const rank=(A,B,trueOffset=null)=>{const cut=48,choices=[];for(let off=0;off<=A.length-B.length;off++){const D=B.map((x,i)=>code[x]^code[A[i+off]]);const r=decode(D.slice(0,cut),cut);choices.push({off,train:r.logZ-penalty(D.slice(0,cut))});}choices.sort((a,b)=>b.train-a.train);const off=choices[0].off,D=B.map((x,i)=>code[x]^code[A[i+off]]);const r=decode(D,cut,true);const result={off,train:(r.pre-penalty(D.slice(0,cut)))/cut,heldout:(r.logZ-r.pre-penalty(D.slice(cut)))/(B.length-cut),bestScore:r.viterbi/(2*B.length),rankTrue:trueOffset===null?null:choices.findIndex(x=>x.off===trueOffset)+1,margin:choices[0].train-choices[1].train,A:render(r.p),B:render(r.q),p:r.p,q:r.q};
  if(trueOffset!==null){const trueD=B.map((x,i)=>code[x]^code[A[i+trueOffset]]);const q=decode(trueD,cut,true);result.trueTrain=(q.pre-penalty(trueD.slice(0,cut)))/cut;result.trueHeldout=(q.logZ-q.pre-penalty(trueD.slice(cut)))/(B.length-cut);}
  return result;};

return rank(corpus.pages[32].indices,corpus.pages[55].indices);
}
function solve(corpus,dict,training,donorA,donorB,selector){
 const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109],index=new Map(code.map((p,i)=>[p,i])),partner=Array.from({length:128},(_,d)=>code.map(x=>index.get(x^d)??-1));
 const tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 const enc=word=>{let w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),out=[];for(let i=0;i<w.length;){const q=tokens.find(([t])=>w.startsWith(t,i));if(!q)return null;out.push(q[1]);i+=q[0].length;}return out};
 const weights=new Map();
 const add=(w,n)=>{const v=enc(w);if(!v||!v.length)return;const k=String.fromCharCode(...v);weights.set(k,(weights.get(k)||0)+n)};
 for(const row of dict.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(row);if(m)add(m[1],Number(m[2]));}
 for(const w of training.match(/[a-z]+/gi)||[])add(w,1);
 const nodes=[];const node=()=>{nodes.push({children:new Map(),total:0,end:0});return nodes.length-1};const root=node(),suffix=node();
 function insert(start,w,weight){let n=start;nodes[n].total+=weight;for(let i=0;i<w.length;i++){const x=w.charCodeAt(i);let c=nodes[n].children.get(x);if(c===undefined){c=node();nodes[n].children.set(x,c);}n=c;nodes[n].total+=weight;}nodes[n].end+=weight;}
 for(const [w,f] of weights){insert(root,w,f);for(let i=0;i<w.length;i++)insert(suffix,w.slice(i),f);}
 const N=nodes.length;
 const transitions=nodes.map(n=>{const out=Array.from({length:29},()=>[]);for(const [x,dst] of n.children)out[x].push([dst,Math.log(nodes[dst].total/n.total),false]);if(n.end>0){const p=Math.log(n.end/n.total);for(const [x,dst] of nodes[root].children)out[x].push([dst,p+Math.log(nodes[dst].total/nodes[root].total),true]);}return out;});
 function decode(D,beamWidth=4096){
  let beam=[{a:suffix,b:suffix,score:0,prev:null}],sizes=[];
  for(const d of D){const next=new Map(),valid=partner[d];for(const s of beam){const ta=transitions[s.a],tb=transitions[s.b];for(let x=0;x<29;x++){const y=valid[x];if(y<0||!ta[x].length||!tb[y].length)continue;for(const u of ta[x])for(const v of tb[y]){const a=u[0],b=v[0],k=a*N+b,score=s.score+u[1]+v[1];const old=next.get(k);if(!old||score>old.score)next.set(k,{a,b,score,prev:s,x,y,splitA:u[2],splitB:v[2]});}}}
   beam=Array.from(next.values()).sort((a,b)=>b.score-a.score).slice(0,beamWidth);sizes.push(beam.length);if(!beam.length)return {deadAt:sizes.length,sizes};
  }
  const best=beam[0],as=[],bs=[],pa=[],pb=[];for(let s=best;s.prev;s=s.prev){as.push((s.splitA?" ":"")+corpus.translit[s.x]);bs.push((s.splitB?" ":"")+corpus.translit[s.y]);pa.push(s.x);pb.push(s.y);}return {score:best.score,A:as.reverse().join(""),B:bs.reverse().join(""),p:pa.reverse(),q:pb.reverse(),sizes};
 }
 const encode=t=>(t.match(/[a-z]+/gi)||[]).flatMap(w=>enc(w)||[]);
 const aa=encode(donorA),bb=encode(donorB),controls=[];
 let seed=0x6c696265;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
 for(let i=0;i<4;i++){
  const P=aa.slice(2000+i*1000,2121+i*1000),Q=bb.slice(4000+i*1500,4076+i*1500),off=[7,19,31,43][i],A=[],B=[];
  for(let k=0;k<P.length;k++){const j=k-off,keys=Array.from({length:128},(_,h)=>h).filter(h=>index.has(h^code[P[k]])&&(j<0||j>=Q.length||index.has(h^code[Q[j]])));const h=keys[rand(keys.length)];A[k]=index.get(code[P[k]]^h);if(j>=0&&j<Q.length)B[j]=index.get(code[Q[j]]^h);}
  const D=B.map((b,j)=>code[b]^code[A[j+off]]),r=decode(D);
  if(r.p){if(r.p.some((x,j)=>(code[x]^code[r.q[j]])!==D[j]))throw Error("replay");r.matchedA=r.p.filter((x,j)=>x===P[j+off]).length;r.matchedB=r.q.filter((x,j)=>x===Q[j]).length;delete r.p;delete r.q;}
  controls.push({off,...r});
 }
 const pass=controls.filter(c=>c.matchedA>=38&&c.matchedB>=38).length>=3;
 let original=null;
 if(pass){const chosen=selector(corpus,training,donorA,donorB),off=chosen.off,A=corpus.pages[32].indices,B=corpus.pages[55].indices,D=B.map((x,i)=>code[x]^code[A[i+off]]),r=decode(D);
  const differenceCorrection=D.reduce((s,d)=>s+Math.log(partner[d].filter(x=>x>=0).length),0);
  if(r.p){const pad=r.p.map((x,i)=>code[x]^code[A[i+off]]);if(r.q.some((y,i)=>(code[y]^pad[i])!==code[B[i]]))throw Error("original replay");original={off,selector:{train:chosen.train,heldout:chosen.heldout,margin:chosen.margin},differenceCorrection,...r,pad};}
  else original={off,selector:{train:chosen.train,heldout:chosen.heldout,margin:chosen.margin},...r};
 }
 return {words:weights.size,nodes:N,beamWidth:4096,gate:"at least 3/4 known-alignment plants recover >=38/76 paired runes",gatePassed:pass,controls,original};
}
console.log(JSON.stringify(solve(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt"),spacingFree),null,2));
