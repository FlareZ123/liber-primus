'use strict';
/** Exact phase-unlabelled GP29 common-cycle known-plaintext inverse, including original p57 quotation test. */
function study(raw,goldText,lp1Text,lp2Text){
 const S="0123456789abcdefghijklmnopqrs",Q=29,N=28,mod=x=>(x%Q+Q)%Q,seq=n=>Array.from({length:n},(_,i)=>i);
 const inv=seq(Q).map(x=>seq(Q).find(y=>x*y%Q===1)),gold=JSON.parse(goldText),corpus=JSON.parse(lp2Text);
 const lines=raw.trim().split(/\r?\n/), fixtures=[];
 for(let i=0;i<lines.length;){const seed=+lines[i++],tries=+lines[i++],pi=lines[i++].split(" ").map(Number),k=lines[i++].split(" ").map(Number),words=lines.slice(i,i+64).map(l=>{const [p,c,j]=l.split(" ");return {p,c,j:+j}});i+=64;fixtures.push({seed,tries,pi,k,words});}
 function rot(a,j){return a.slice(j).concat(a.slice(0,j))}
 function canonical(pi,k){const v=inv[pi[1]];return pi.map(x=>mod(x*v)).join(",")+":"+seq(8).map(i=>rot(k,i).map(x=>mod(x*v)).join(",")).sort()[0]}
 function encrypt(w,pi,k,start){let t=start,out="";const I=[];pi.forEach((v,i)=>I[v]=i);for(const z of w){const p=S.indexOf(z);if(!p){out+="0";continue}out+=S[I[mod(pi[p]+k[t])]];t=(t+1)%8}return out}
 function matches(w,pi,k){return seq(8).some(s=>encrypt(w.p,pi,k,s)===w.c)}
 function align(w){const a=[];if(w.p.length!==w.c.length)throw Error("length");for(let i=0;i<w.p.length;i++){const x=S.indexOf(w.p[i]),y=S.indexOf(w.c[i]);if(x<0||y<0)throw Error("symbol");if(!x){if(y)return null;continue}a.push([x,y]);}return a}
 function row(a,b){const v=new Int8Array(N+1);for(const [e,sign] of [[a,1],[b,-1]]){if(e[1])v[e[1]-1]+=sign;if(e[0])v[e[0]-1]-=sign}for(let i=0;i<N;i++)v[i]=mod(v[i]);return v}
 function add(B,r){r=r.slice();for(let i=0;i<N;i++)if(r[i]&&B[i]){const a=r[i],b=B[i];for(let j=i;j<=N;j++)r[j]=mod(r[j]-a*b[j])}
  let i=0;while(i<N&&!r[i])i++;if(i===N)return r[N]===0;
  const a=inv[r[i]];for(let j=i;j<=N;j++)r[j]=mod(r[j]*a);
  for(let l=0;l<N;l++)if(B[l]?.[i]){const b=B[l].slice(),v=b[i];for(let j=i;j<=N;j++)b[j]=mod(b[j]-v*r[j]);B[l]=b}
  B[i]=r;return true;
 }
 function collision(B){const f=seq(N).filter(i=>!B[i]);const seen=new Set(["0,"+f.map(()=>0).join(",")]);for(let i=0;i<N;i++){let s;if(B[i])s=B[i][N]+","+f.map(j=>mod(-B[i][j])).join(",");else s="0,"+f.map(j=>+(i===j)).join(",");if(seen.has(s))return true;seen.add(s)}return false}
 function recover(words,ids,cap=2000000,nodeCap=500000){
  const aa=ids.map(i=>({i,e:align(words[i])}));if(aa.some(a=>a.e===null))return {complete:true,candidates:0,reason:"literal-F mismatch",actions:[]};
  aa.sort((a,b)=>b.e.length-a.e.length||a.i-b.i);
  if(aa[0].e.length<8)return {complete:false,reason:"no full anchor",actions:[]};
  const anchor=aa.shift(), A=anchor.e.slice(0,8), B=Array(N).fill(null),g=new Int8Array(N+1);g[0]=g[N]=1;add(B,g);
  for(let i=8;i<anchor.e.length;i++)if(!add(B,row(anchor.e[i],A[i%8])))return {complete:true,candidates:0,reason:"anchor contradiction",actions:[]};
  const groups=aa.map(a=>({i:a.i,opts:seq(8).flatMap(s=>{const rows=[];for(let i=0;i<a.e.length;i++){const x=a.e[i],y=A[(i+s)%8];if((x[0]===x[1])!==(y[0]===y[1]))return [];rows.push(row(x,y));}return [{s,rows}]})}));
  if(groups.some(g=>!g.opts.length))return {complete:true,candidates:0,reason:"zero-shift pattern",actions:[]};
  const counts={nodes:0,joins:0,collisions:0,contradictions:0,freeLeaves:0,enumerations:0,cappedLeaves:0,fullRank:0};
  const actions=new Map();let complete=true,stop=false;
  function test(pi){counts.enumerations++;if(new Set(pi).size!==Q)return;const k=A.map(([x,y])=>mod(pi[y]-pi[x]));if([1,2,4].some(d=>k.every((x,i)=>x===k[i%d])))return;for(const i of ids)if(!matches(words[i],pi,k))return;actions.set(canonical(pi,k),{pi,k})}
  function finish(B){const f=seq(N).filter(i=>!B[i]);if(f.length>3||counts.enumerations+Q**f.length>cap){complete=false;counts.cappedLeaves++;return}counts.freeLeaves++;if(!f.length)counts.fullRank++;
   const x=Array(N).fill(0);
   function visit(i){if(i<f.length){for(let v=0;v<Q;v++){x[f[i]]=v;visit(i+1)}return}
    for(let j=0;j<N;j++)if(B[j])x[j]=mod(B[j][N]-f.reduce((s,k)=>s+B[j][k]*x[k],0));
    test([0,...x]);
   }visit(0)
  }
  function walk(B,p){if(stop)return;if(++counts.nodes>nodeCap){complete=false;stop=true;return}if(collision(B)){counts.collisions++;return}if(B.every(Boolean)||p===groups.length){finish(B);return}
   for(const o of groups[p].opts){counts.joins++;const C=B.slice();if(o.rows.every(r=>add(C,r)))walk(C,p+1);else counts.contradictions++}
  }walk(B,0);
  return {ids,anchor:anchor.i,runes:ids.reduce((n,i)=>n+words[i].p.length,0),consuming:ids.reduce((n,i)=>n+align(words[i]).length,0),complete,candidates:actions.size,actions:[...actions.values()],...counts};
 }
 function greedy(words,n){const a=seq(n),seen=new Set(),out=[];let first=a.sort((i,j)=>words[j].c.length-words[i].c.length||i-j).shift();out.push(first);for(const x of words[first].c)seen.add(x);while(a.length){a.sort((i,j)=>{const g=k=>new Set([...words[k].c].filter(x=>!seen.has(x))).size;return g(j)-g(i)||words[j].c.length-words[i].c.length||i-j});const i=a.shift();out.push(i);for(const x of words[i].c)seen.add(x)}return out;}
 function controls(z,n,budgets,held){if(!z.words.every(w=>encrypt(w.p,z.pi,z.k,w.j)===w.c))throw Error("control replay");const out=[],truth=canonical(z.pi,z.k),longest=seq(n).sort((a,b)=>z.words[b].c.length-z.words[a].c.length||a-b),orders=[["longest",longest],["prefix",seq(n)],["cipher-diversity",greedy(z.words,n)]];
  for(const [geometry,order] of orders){const runs=[];for(const m of budgets){const r=recover(z.words,order.slice(0,m));const truthRetained=r.actions.some(a=>canonical(a.pi,a.k)===truth),exact=r.complete&&r.candidates===1&&truthRetained,only=exact?r.actions[0]:null;delete r.actions;runs.push({m,...r,truthRetained,exact,held:only?{truthWords:held.filter(w=>matches(w,only.pi,only.k)).length,total:held.length}:null});if(exact)break;}out.push({geometry,runs});}
  return out;
 }
 const plants=fixtures.map(z=>({seed:z.seed,tries:z.tries,geometries:controls(z,47,[4,5,6,7,8,9,10,12,16,20,24],z.words.slice(47))}));
 const compact=s=>[...s].map(x=>S[gold.runes.indexOf(x)]).join("");
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(compact);
 const wp=parse(gold.sections.find(x=>x.name==="0_welcome").source_text),wc=compact([...lp1Text.split("$")[1]].filter(x=>gold.runes.includes(x)).join(""));
 const wk=[23,10,1,10,9,10,16,26],wpi=seq(29);let wi=0,wj=0;
 const ww=wp.map(p=>{const c=wc.slice(wi,wi+p.length),j=wj;wi+=p.length;wj=(wj+[...p].filter(x=>x!=="0").length)%8;return {p,c,j}});
 if(wi!==515||wc.length!==515)throw Error("WELCOME geometry");
 const welcome=controls({pi:wpi,k:wk,words:ww},100,[4,5,6,7,8,10,12,16,20,24,32],ww.slice(100));
 const sentences=gold.sections.find(x=>x.name==="p57_parable").source_text.split("\n").slice(1).map(parse);
 const cribs=[{name:"all-three",p:sentences.flat()},{name:"first-two",p:sentences.slice(0,2).flat()},{name:"last-two",p:sentences.slice(1).flat()}];
 if(cribs.map(x=>x.p.join("").length).join()!=="88,60,58")throw Error("PARABLE geometry");
 function scan(scopes,patternList=cribs){const res=[];for(const scope of scopes)for(const crib of patternList){const n=crib.p.join("").length,f=[...crib.p.join("")].flatMap((x,i)=>x==="0"?[i]:[]),out={scope:scope.name,crib:crib.name,n,alignments:Math.max(0,scope.c.length-n+1),fCompatible:0,completeRejected:0,unresolved:0,hits:[],tested:[]};
  for(let start=0;start+n<=scope.c.length;start++){if(!f.every(i=>scope.c[start+i]==="0"))continue;out.fCompatible++;let pos=start;const words=crib.p.map(p=>{const c=scope.c.slice(pos,pos+p.length);pos+=p.length;return {p,c}});const r=recover(words,seq(words.length));const hit={start,globalStart:(scope.offset??0)+start,...r};if(!r.complete)out.unresolved++;else if(r.candidates===0)out.completeRejected++;if(r.actions.length)out.hits.push({...hit,actions:r.actions});delete hit.actions;out.tested.push(hit);}
  res.push(out);
 }return res}
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 let offset=0;const scopes=ranges.map(([a,b])=>{const c=corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).map(x=>S[x]).join("");const r={name:`p${a}-${b}`,c,offset};offset+=c.length;return r});if(offset!==12956)throw Error("LP2 corpus length");
 const z=fixtures[0],p=cribs[0].p,pre=z.words.slice(0,6).map(x=>x.c).join(""),plant={name:"embedded-parable",c:pre+p.map((w,i)=>encrypt(w,z.pi,z.k,(3*i+2)%8)).join("")+z.words.slice(6,16).map(x=>x.c).join("")};
 const historicalCribs=[];
 for(const rec of gold.sections){if(/^p(56|57)/.test(rec.name))continue;
  const segments=rec.source_text.split(/[⁘⁜]/u).map(t=>({words:parse(t),numeric:/[0-9]/.test(t)})).filter(t=>t.words.length);
  for(let i=0;i<segments.length;i++){let p=[];for(let j=i;j<segments.length;j++){if(segments[j].numeric)break;p=p.concat(segments[j].words);const flat=p.join("");if(flat.length>160)break;if(flat.length<58||[...flat].filter(x=>x==="0").length<2||!p.some(w=>[...w].filter(x=>x!=="0").length>=8))continue;historicalCribs.push({name:rec.name+":"+i+"-"+j,source:rec.name,from:i,to:j,p:p.slice()});}}
 }
 if(historicalCribs.length!==88)throw Error("historical span geometry "+historicalCribs.length);
 const plantScan=scan([plant]);const original=scan(scopes);
 if(!plantScan.every((r,i)=>r.hits.some(h=>h.start===pre.length+(i===2?sentences[0].join("").length:0)&&h.actions.some(a=>canonical(a.pi,a.k)===canonical(z.pi,z.k)))))throw Error("positive truth lost");
 const historical=scan(scopes,historicalCribs);
 return {schema:3,plants,welcome,historicalCribs:historicalCribs.map(({p,...r})=>({...r,words:p})),historical,cribs:cribs.map(x=>({name:x.name,words:x.p})),positive:{offset:pre.length,truth:canonical(z.pi,z.k),scan:plantScan},original};
}
if(require.main===module){const fs=require('node:fs');const paths={"fixture":"im-results/lp2-q8-independent-small-clue-fixtures.txt","gold":"resources/external/relikd-solved-gp29-native-v1.json","lp1":"resources/transcriptions/lp1_wulfic_canonical.txt","lp2":"resources/liber-primus/lp2-corpus.json"};const a=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(p,'utf8')]));console.log(JSON.stringify(study(a.fixture,a.gold,a.lp1,a.lp2),null,2));}
module.exports={study};
