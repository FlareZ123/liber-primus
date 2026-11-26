"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(gp,transcription,lex,donor,opts={}){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){s=s.toUpperCase().replace(/[KVZQ]/g,x=>({K:"C",V:"U",Z:"S",Q:"C"}[x]));let out=[];for(let i=0;i<s.length;){const a=spell.find(x=>s.startsWith(x.s,i));if(a){out.push(a.i);i+=a.s.length}else i++}return out}
 const all=[],cls=[];let buf=[];
 function end(){for(let j=0;j<buf.length;j++){all.push(buf[j]);cls.push(buf.length===1?3:j===0?0:j===buf.length-1?2:1)}buf=[]}
 for(const ch of transcription){if(ix.has(ch))buf.push(ix.get(ch));else if(ch==="-"||ch===".")end()}end();
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(tape.length===12956&&tape.every((x,i)=>x===all[i]),"tape mismatch");
 const pages=[];let cursor=0;for(const p of gp.pages.filter(p=>p.page<56)){pages[p.page]={runes:p.indices,cls:cls.slice(cursor,cursor+p.indices.length)};cursor+=p.indices.length}
 const forms=new Set(),byLen=new Map();
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const w=encode(m[1]),k=w.join(",");if(w.length&&!forms.has(k)){forms.add(k);if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w)}}}
 assert(forms.size===29061,"lexicon "+forms.size);
 if(opts.restrict){forms.clear();byLen.clear();for(const w of opts.restrict){forms.add(w.join(","));if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w)}}
 const orient=(p,rev)=>rev?{runes:p.runes.slice().reverse(),cls:p.cls.slice().reverse().map(x=>x===0?2:x===2?0:x)}:p;
 function intervals(c){const out=[];for(let j=0;j<c.length;j++){if(c[j]!==0&&c[j]!==3)continue;let e=j;while(e<c.length&&c[e]!==2&&c[e]!==3)e++;if(e===c.length)break;out.push([j,e+1]);j=e}return out}
 const nodes=[null],intern=new Map(),roots=[new Map(),new Map()];
 function addNode(children){const sig=children.join(",");if(intern.has(sig))return intern.get(sig);const id=nodes.length;nodes.push(Int32Array.from(children));intern.set(sig,id);return id}
 for(let rev=0;rev<2;rev++)for(const [len,ws] of byLen){const trie=[new Int32Array(29).fill(-1)];for(const w0 of ws){const w=rev?w0.slice().reverse():w0;let p=0;for(const x of w){if(trie[p][x]<0){trie[p][x]=trie.length;trie.push(new Int32Array(29).fill(-1))}p=trie[p][x]}}
 const ids=new Int32Array(trie.length);for(let k=trie.length-1;k>=0;k--)ids[k]=addNode(Array.from(trie[k],z=>z<0?-1:ids[z]));roots[rev].set(len,ids[0])}
 function stream(p,rev){const a=orient(p,rev),c=a.runes,n=c.length,root=new Int32Array(n).fill(-1),last=new Uint8Array(n),free=new Uint8Array(n).fill(1),ranges=intervals(a.cls);
 for(const [lo,hi] of ranges){for(let i=lo;i<hi;i++){root[i]=roots[+rev].get(hi-lo)??-1;free[i]=0}last[hi-1]=1}
 for(let i=0;i<n;i++)if(free[i]&&(i===n-1||!free[i+1]))last[i]=1;
 return {c,root,last,free,ranges,rev}}
 // The encoded step is 2*nextState + newly incurred OOV (0 or 1).
 // -1 state is an already charged or free wildcard; state 0 enters a new word.
 function step(t,i,u,p){if(t.free[i]||u===-1)return t.last[i]?0:-2;
 const a=u===0?t.root[i]:u,k=a<0?-1:nodes[a][p];
 return k<0?(t.last[i]?1:-1):(t.last[i]?0:2*k)}
 function solve(P,Q,ra,rb,limit=4,cap=600000,ms=9000){
 const A=stream(P,ra),B=stream(Q,rb),na=A.c.length,nb=B.c.length;
 const tails=[new Map(),new Map()],memo=new Map(),trace=[];let states=0,edges=0,hit=false,max=[0,0],answer=null,start=Date.now();
 function tail(t,i,u,id){if(i===t.c.length)return 0;const key=i*(nodes.length+1)+(u+1),m=tails[id];if(m.has(key))return m.get(key);let best=1e9;for(let p=t.c[i]===0?0:1;p<29;p++){const z=step(t,i,u,p),cost=(z&1)+tail(t,i+1,Math.floor(z/2),id);if(cost<best)best=cost;if(!best)break}m.set(key,best);return best}
 function complete(t,i,u,id){const out=[];while(i<t.c.length){const target=tail(t,i,u,id);let ok=false;for(let p=t.c[i]===0?0:1;p<29;p++){const z=step(t,i,u,p),v=Math.floor(z/2);if((z&1)+tail(t,i+1,v,id)===target){out.push(p);u=v;i++;ok=true;break}}assert(ok,"tail traceback")}return out}
 function dfs(i,j,u,v,budget){
 if(hit)return false;if(tail(A,i,u,0)+tail(B,j,v,1)>budget)return false;
 if(i===na||j===nb){answer={steps:trace.slice(),ta:complete(A,i,u,0),tb:complete(B,j,v,1)};return true}
 const stride=nodes.length+1,k=((i*(nb+1)+j)*stride+(u+1))*stride+(v+1);if((memo.get(k)??-1)>=budget)return false;memo.set(k,budget);
 states++;if(states>cap||((states&2047)===0&&Date.now()-start>ms)){hit=true;return false}max[0]=Math.max(max[0],i);max[1]=Math.max(max[1],j);
 // Explore zero-increment-cost edges first, then one, then two.
 const choices=[];
 if(A.c[i]===0){const z=step(A,i,u,0);choices.push([z&1,i+1,j,Math.floor(z/2),v,0,-1,-1])}
 if(B.c[j]===0){const z=step(B,j,v,0);choices.push([z&1,i,j+1,u,Math.floor(z/2),-1,0,-1])}
 for(let p=1;p<29;p++){const q=mod(p+B.c[j]-A.c[i]);if(!q)continue;const a=step(A,i,u,p),b=step(B,j,v,q);choices.push([(a&1)+(b&1),i+1,j+1,Math.floor(a/2),Math.floor(b/2),p,q,mod(A.c[i]-p)])}
 for(let cost=0;cost<=Math.min(2,budget);cost++)for(const e of choices){if(e[0]!==cost)continue;edges++;trace.push(e.slice(5));if(dfs(e[1],e[2],e[3],e[4],budget-cost))return true;trace.pop();if(hit)return false}return false}
 const independentLower=tail(A,0,0,0)+tail(B,0,0,1);let best=null,excluded=-1;for(let b=0;b<=limit;b++){if(dfs(0,0,0,0,b)){best=b;break}if(hit)break;excluded=b}
 let witness=null;if(answer){const pa=answer.steps.filter(z=>z[0]>=0).map(z=>z[0]).concat(answer.ta),pb=answer.steps.filter(z=>z[1]>=0).map(z=>z[1]).concat(answer.tb),key=answer.steps.filter(z=>z[2]>=0).map(z=>z[2]);
 function replay(t,p){assert(p.length===t.c.length,"plain length");let k=0,cost=0;for(let i=0;i<p.length;i++){if(!p[i])assert(t.c[i]===0,"hold");else {if(k<key.length)assert(mod(p[i]+key[k])===t.c[i],"replay");k++}}assert(k>=key.length,"key coverage");for(const [lo,hi] of t.ranges){let w=p.slice(lo,hi);if(t.rev)w.reverse();cost+=+!forms.has(w.join(","))}return cost}
 assert(replay(A,pa)+replay(B,pb)===best,"OOV recount");witness={pa,pb,key}}
 return {best,excludedThrough:excluded,capped:hit,states,edges,max,independentLower,words:[A.ranges.length,B.ranges.length],zeros:[A.c.filter(x=>!x).length,B.c.filter(x=>!x).length],...(witness?{witness}:{})}}
 let seed=opts.seed??0x42261126;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const donorByLen=new Map();for(const w of donor.match(/[A-Za-z]+/g).map(encode).filter(w=>w.length)){if(!donorByLen.has(w.length))donorByLen.set(w.length,[]);donorByLen.get(w.length).push(w)}
 function plant(p){const out=p.runes.map(()=>rand(29));for(const [lo,hi] of intervals(p.cls)){let a=donorByLen.get(hi-lo)||byLen.get(hi-lo);if(opts.inLex)a=a.filter(w=>forms.has(w.join(",")));if(!a.length)a=byLen.get(hi-lo);assert(a&&a.length,"missing length");const w=a[rand(a.length)];for(let j=lo;j<hi;j++)out[j]=w[j-lo]}return {runes:out,cls:p.cls}}
 function enc(p,rev,k){let x=orient(p,rev),t=0,v=x.runes.map(s=>s===0?0:mod(s+k[t++]));return {runes:rev?v.reverse():v,cls:p.cls}}
 function oov(p){return intervals(p.cls).reduce((s,[lo,hi])=>s+!forms.has(p.runes.slice(lo,hi).join(",")),0)}
 // Independent small oracle: every 29^2 pad; independently enumerate the hold/consume ambiguity.
 function brute(P,Q,ra,rb){const A=stream(P,ra),B=stream(Q,rb);let best=99;for(let k0=0;k0<29;k0++)for(let k1=0;k1<29;k1++){
 const k=[k0,k1];function allPaths(t){const out=[];function f(i,j,p){if(i===t.c.length){let n=0;for(const [lo,hi] of t.ranges){const w=p.slice(lo,hi);if(t.rev)w.reverse();n+=+!forms.has(w.join(","))}out.push(n);return}if(t.c[i]===0)f(i+1,j,[...p,0]);const z=mod(t.c[i]-k[j]);if(z)f(i+1,j+1,[...p,z])}f(0,0,[]);return Math.min(...out)}
 best=Math.min(best,allPaths(A)+allPaths(B))}return best}
 const toys=[];for(const [a,b] of [[[0,4],[5,0]],[[0,0],[0,0]],[[13,18],[2,4]],[[0,0],[1,1]],[[1,1],[1,2]],[[0,2],[2,0]],[[5,5],[0,0]],[[28,27],[4,9]]]){const P={runes:a,cls:[0,2]},Q={runes:b,cls:[3,3]},x=solve(P,Q,false,true,3,200000,3000),y=brute(P,Q,false,true);assert(x.best===y,"toy "+JSON.stringify({a,b,x,y}));toys.push(y)}
 const results=[];for(const [i,j,ra,rb] of opts.cases||[[0,2,false,true]]){const orig=solve(pages[i],pages[j],ra,rb,4,opts.cap||600000,opts.ms||9000),controls=[];
 for(let z=0;z<(opts.controls??2);z++){const p=plant(pages[i]),q=plant(pages[j]);if(opts.plantOov){for(const t of [p,q]){const [lo,hi]=intervals(t.cls).find(([lo,hi])=>hi-lo>=4);let w;do{w=Array.from({length:hi-lo},()=>rand(29))}while(forms.has(w.join(",")));t.runes.splice(lo,hi-lo,...w)}}const k=Array.from({length:Math.max(p.runes.length,q.runes.length)},()=>rand(29)),l=k.map(()=>rand(29)),a=enc(p,ra,k),b=enc(q,rb,k),truth=oov(p)+oov(q);let same=solve(a,b,ra,rb,Math.max(4,truth),opts.cap||600000,opts.ms||9000);if(same.best!==null)assert(same.best<=truth,"control optimum");let recovery=null;if(same.witness){const w=same.witness,expected=[orient(p,ra).runes,orient(q,rb).runes];recovery={sharedKey:[w.key.filter((x,i)=>x===k[i]).length,w.key.length],allPlain:[w.pa.filter((x,i)=>x===expected[0][i]).length,w.pb.filter((x,i)=>x===expected[1][i]).length]};}controls.push({truth,holds:[p.runes.filter(x=>!x).length,q.runes.filter(x=>!x).length],same:{...same,witness:undefined},recovery});if(opts.negative){let neg=solve(a,enc(q,rb,l),ra,rb,4,opts.cap||600000,opts.ms||9000);controls[controls.length-1].independent={...neg,witness:undefined}}}
 results.push({pair:[i,j],direction:(ra?"R":"F")+(rb?"R":"F"),original:orig,controls})}
 return {dictionary:forms.size,dagNodes:nodes.length-1,toys,results}
};
const data=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const i=Number(process.argv[2]||0);const cases=[[0,1,false,true],[0,1,true,false],[0,2,false,true],[0,2,true,false],[1,2,false,true],[1,2,true,false]];const opts=process.argv.includes("--oracle")?{cases:[],restrict:[[1],[2],[0],[1,1],[2,2],[0,1]]}:{cases:[cases[i]],cap:2000000,ms:14000,controls:2,inLex:true,plantOov:true,seed:(0x42261126^((i-2)*0x9e3779b9))>>>0,negative:process.argv.includes("--negative")};console.log(JSON.stringify(experiment(JSON.parse(data[0]),...data.slice(1),opts),null,2));
