"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(c,sh,g,e,dict,which='all',width=32768){
const n=29,m=n**4,tokens=c.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
const encode=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let o=[];while(w.length){const q=tokens.find(([t])=>w.startsWith(t));if(!q)return [];o.push(q[1]);w=w.slice(q[0].length)}return o};
const enc=s=>(s.match(/[a-z]+/gi)||[]).flatMap(encode),a=enc(g),b=enc(e),s=enc(sh);
const train=[s,a.slice(12000),b.slice(18000)],counts=Array.from({length:5},(_,i)=>new Uint32Array(n**(i+1))),totals=Array.from({length:5},(_,i)=>new Uint32Array(n**i));
for(const stream of train)for(let i=0;i<stream.length;i++){let x=stream[i],k=0,p=1;for(let j=0;j<5&&j<=i;j++){counts[j][k*n+x]++;totals[j][k]++;if(i-j>0){k+=p*stream[i-j-1];p*=n;}}}
const probs=Array.from({length:5},(_,i)=>new Float32Array(n**(i+1)));let sum=totals[0][0];for(let x=0;x<n;x++)probs[0][x]=(counts[0][x]+.5)/(sum+n*.5);
for(let j=1;j<5;j++){let den=n**(j-1);for(let k=0;k<n**j;k++){const t=totals[j][k],prior=probs[j-1],prev=(k%den)*n;for(let x=0;x<n;x++)probs[j][k*n+x]=(counts[j][k*n+x]+8*prior[prev+x])/(t+8)}}
const p0=probs[0].slice(),p1=probs[1].slice(),p2=probs[2].slice();
for(const p of probs)for(let i=0;i<p.length;i++)p[i]=Math.log(p[i]);
const weights=new Map(),add=(w,f)=>{const x=encode(w);if(!x.length)return;const k=String.fromCharCode(...x);weights.set(k,(weights.get(k)||0)+f)};
for(const row of dict.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(row);if(z)add(z[1],Number(z[2]));}
for(const w of sh.match(/[a-z]+/gi)||[])add(w,1);
const nodes=[],node=()=>{nodes.push({children:new Map(),total:0,end:0});return nodes.length-1},root=node(),suffix=node();
function insert(start,w,weight){let k=start;nodes[k].total+=weight;for(let i=0;i<w.length;i++){let x=w.charCodeAt(i),v=nodes[k].children.get(x);if(v===undefined){v=node();nodes[k].children.set(x,v)}k=v;nodes[k].total+=weight;}nodes[k].end+=weight;}
for(const [w,f] of weights){insert(root,w,f);for(let i=0;i<w.length;i++)insert(suffix,w.slice(i),f)}
const tr=nodes.map(v=>{let o=Array.from({length:n},()=>[]);for(const [x,k] of v.children)o[x].push([k,Math.log(nodes[k].total/v.total),false]);if(v.end>0){let p=Math.log(v.end/v.total);for(const [x,k] of nodes[root].children)o[x].push([k,p+Math.log(nodes[k].total/nodes[root].total),true]);}return o;});

const mod=x=>(x+n)%n,lnQ=Math.log(n);
function decode(A,B,width){
 // Global beam over all feasible starts, variable consumption, and both
 // fifth-order lexical contexts. A visible F may either be literal or encrypted.
 const remaining=new Int16Array(B.length+1);for(let j=B.length-1;j>=0;j--)remaining[j]=remaining[j+1]+(B[j]!==0?1:0);
 let beam=[];for(let i=0;i<=A.length-remaining[0];i++)beam.push({start:i,i,a:suffix,b:suffix,k:0,l:0,ca:0,cb:0,s:0,prev:null});
 let peak=beam.length;const history=[];
 for(let j=0;j<B.length;j++){
  const next=new Map();
  function push(q,i,a,b,k,l,ca,cb,s,x,y,sa,sb){
   if(A.length-i<remaining[j+1])return;
   const key=i+","+a+","+b+","+k+","+l+","+Math.min(ca,4);
   // B length is j+1 for every state, so cb need not enter key.
   const old=next.get(key);if(!old||s>old.s)next.set(key,{start:q.start,i,a,b,k,l,ca,cb,s,prev:q,x,y,sa,sb});
  }
  function advance(q){
   const i=q.i,ta=tr[q.a],tb=tr[q.b],off=q.k*n,off2=q.l*n,pa=probs[Math.min(q.ca,4)],pb=probs[Math.min(q.cb,4)];
   if(B[j]===0)for(const v of tb[0])push(q,i,q.a,v[0],q.k,(q.l*n)%m,q.ca,q.cb+1,q.s+.5*(pb[off2]+v[1])+lnQ,null,0,false,v[2]);
   if(i>=A.length)return;
   const d=mod(A[i]-B[j]);
   for(let x=1;x<n;x++){const y=mod(x-d);if(y===0||!ta[x].length||!tb[y].length)continue;
    const k=(q.k*n+x)%m,l=(q.l*n+y)%m,ng=.5*(pa[off+x]+pb[off2+y]);
    for(const u of ta[x])for(const v of tb[y])push(q,i+1,u[0],v[0],k,l,q.ca+1,q.cb+1,q.s+ng+.5*(u[1]+v[1])+lnQ,x,y,u[2],v[2]);
   }
   // A literal F consumes its physical position but no pad or B position.
   // Enumerate the at-most-consecutive-zero chain before the next B event.
   if(A[i]===0)for(const u of ta[0]){
    const r={start:q.start,i:i+1,a:u[0],b:q.b,k:(q.k*n)%m,l:q.l,ca:q.ca+1,cb:q.cb,s:q.s+.5*(pa[off]+u[1])+lnQ,prev:q,x:0,y:null,sa:u[2],sb:false};
    advance(r);
   }
  }
  for(const q of beam)advance(q);
  beam=Array.from(next.values()).sort((a,b)=>b.s-a.s).slice(0,width);
  if(!beam.length)return {dead:j};
  peak=Math.max(peak,next.size);history.push({j,retained:beam.length,starts:new Set(beam.map(q=>q.start)).size,score:beam[0].s});
 }
 let best=beam[0],events=[];for(let q=best;q.prev;q=q.prev)events.push({x:q.x,y:q.y,sa:q.sa,sb:q.sb});events.reverse();
 const x=events.filter(q=>q.x!==null).map(q=>q.x),y=events.filter(q=>q.y!==null).map(q=>q.y),pad=[];
 let i=best.start,j=0;for(const e of events){if(e.x!==null&&e.y!==null){const k=mod(A[i]-e.x);if(mod(e.y+k)!==B[j]||e.x===0||e.y===0)throw Error("pair replay");pad.push(k)}
 else if(e.x!==null){if(e.x!==0||A[i]!==0)throw Error("A hold replay")}
 else if(e.y!==0||B[j]!==0)throw Error("B hold replay");
 if(e.x!==null)i++;if(e.y!==null)j++;}
 if(i!==best.i||j!==B.length)throw Error("length replay");
 const render=(which,sep)=>events.filter(q=>q[which]!==null).map(q=>(q[sep]?" ":"")+c.translit[q[which]]).join("");
 return {start:best.start,end:best.i,score:best.s,meanGain:best.s/B.length,x,y,pad,events,A:render("x","sa"),B:render("y","sb"),peak,history};
}
let seed=0x70616972;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29;}
const count=P=>P.filter(x=>x!==0).length;
const encrypt=(P,K,start)=>{let j=start;return P.map(p=>p===0?0:mod(p+K[j++]))};
const controls=[];
for(let i=0;i<4;i++){
 const off=[7,19,31,40][i],x=a.slice(2000+i*1000-off,2121+i*1000-off),y=b.slice(4000+i*1500,4076+i*1500),k0=count(x.slice(0,off)),K=Array.from({length:Math.max(count(x),k0+count(y))},rand);
 if(k0+count(y)>count(x))throw Error("control overlap insufficient");
 const A=encrypt(x,K,0),B=encrypt(y,K,k0);
 if(which==='all'||which==='controls'||which===String(i)){
  const q=decode(A,B,width);if(q.dead!==undefined)throw Error("dead control");
  const recoveredStart=count(x.slice(0,q.start)),align=recoveredStart===k0,match=q.y.filter((v,j)=>v===y[j]).length,matchA=q.x.filter((v,j)=>v===x[q.start+j]).length,padMatch=q.pad.filter((v,j)=>align&&v===K[k0+j]).length;
  const result={control:i,expectedStart:off,expectedPadStart:k0,recoveredPadStart:recoveredStart,align,match,matchA,padMatch,trueA:x.slice(q.start,q.end),trueB:y,plainF:[x.filter(v=>v===0).length,y.filter(v=>v===0).length],cipherF:[A.filter(v=>v===0).length,B.filter(v=>v===0).length],...q};
  controls.push(result);console.log("RESULT_JSON "+JSON.stringify(result));
 }
}
const pass=controls.filter(q=>q.align&&q.match>=38).length>=3;
let original=null;if((which==='all'&&pass)||which==='original'){const A=c.pages[32].indices,B=c.pages[55].indices;original=decode(A,B,width);console.log("ORIGINAL_JSON "+JSON.stringify(original));}
return {words:weights.size,nodes:nodes.length,trainingRunes:train.map(x=>x.length),width,controls,gatePassed:pass,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
if(require.main===module){const d=paths.map(read);const r=study(JSON.parse(d[0]),...d.slice(1),process.argv[2]||'all',Number(process.argv[3]||32768));console.log('SUMMARY_JSON '+JSON.stringify({words:r.words,nodes:r.nodes,trainingRunes:r.trainingRunes,width:r.width,gatePassed:r.gatePassed}));}
module.exports={study};
