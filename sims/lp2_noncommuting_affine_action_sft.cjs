"use strict";
/** Exact GP29 right-composed noncommuting affine action gate. Node 22 CommonJS, no packages. See issue #2912. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,trans,sources,terminal){
 const mod=x=>((x%29)+29)%29, vowels=new Set([1,3,10,12,18,22,24,25,26,27,28]),cls=x=>vowels.has(x)?0:1;
 const tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){const out=[];s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const w of s.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}}return out}
 const ids=new Map(g.runes.map((x,i)=>[x,i]));
 const words=trans.replace(/\r\n/g,"\n").split("%").slice(0,55).join("%").replace(/\/\n/g,"").replace(/[\r\n%]/g,"").match(new RegExp("["+g.runes.join("")+"]+","gu")).map(w=>Array.from(w,x=>ids.get(x)));
 const flat=words.flat(),original=g.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 if(flat.length!==12956||words.length!==2896||flat.some((x,i)=>x!==original[i]))throw Error("source mismatch");
 const seam=new Set();let at=0;for(const w of words){at+=w.length;seam.add(at)}
 const hits=(p,internal=false)=>p.reduce((s,x,i)=>s+Number(i>0&&x===p[i-1]&&(!internal||!seam.has(i))),0);
 const A=[],B=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++){A.push(a);B.push(b)}
 const M=A.length, ind=(a,b)=>(a-1)*29+b, identity=ind(1,0);
 const pairs=[];for(let u=0;u<M;u++)for(let v=0;v<M;v++)if(mod(A[u]*B[v]+B[u])!==mod(A[v]*B[u]+B[v]))pairs.push([u,v]);
 const translations=Array.from({length:28},(_,i)=>ind(1,i+1)),dilations=Array.from({length:27},(_,i)=>ind(i+2,0));
 function costs(p,hold){const h=Array.from({length:4},()=>new Uint32Array(841));let ff=[0,0];for(let i=1;i<p.length;i++){const s=Number(seam.has(i)),x=p[i-1],y=p[i];if(hold&&(x===0||y===0)){ff[s]+=Number(x===0&&y===0);continue}h[2*cls(x)+s][x*29+y]++}const cost=h.map(row=>A.map((a,j)=>{let n=0;for(let y=0;y<29;y++)n+=row[mod(a*y+B[j])*29+y];return n}));return {cost,ff}}
 function evaluate(p){const {cost,ff}=costs(p,false),h=costs(p,true);
 function calc(c,u,v){return [c.ff[0]+c.cost[0][u]+c.cost[2][v],c.ff[1]+c.cost[1][u]+c.cost[3][v]]}
 function minfor(pairs,c){let total=Infinity,inside=Infinity,best=null,near=0,exact=0;for(const [u,v] of pairs){const [i,s]=calc(c,u,v),loss=Math.abs(i-63)+Math.abs(s-23);total=Math.min(total,i+s);inside=Math.min(inside,i);if(!best||loss<best.loss)best={u,v,i,s,loss};if(Math.abs(i-63)<=2*Math.sqrt(63)&&Math.abs(s-23)<=2*Math.sqrt(23))near++;if(loss===0)exact++}return {total,inside,best,near,exact}}
 const narrow=translations.flatMap(u=>dilations.map(v=>[u,v]));
 return {narrow:minfor(narrow,{cost,ff}),broad:minfor(pairs,{cost,ff}),narrowF:minfor(narrow,h),broadF:minfor(pairs,h)}}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 const controls=[],texts=[];for(const [name,source,seed] of sources){const pool=new Map();for(const w of source.match(/[A-Za-z]+/g)||[]){const p=encode(w);if(!pool.has(p.length))pool.set(p.length,[]);pool.get(p.length).push(p)}const random=rng(seed);for(let j=0;j<3;j++){const p=words.flatMap(w=>{const q=pool.get(w.length);if(!q?.length)throw Error(name+" missing "+w.length);return q[Math.floor(random()*q.length)]});controls.push({name,j,...evaluate(p)})}texts.push(encode(source))}
 const compact="0123456789abcdefghijklmnopqrs";const p54=terminal.p54.body_groups.map(w=>Array.from(w,x=>compact.indexOf(x))),p55=terminal.p55.groups.map(w=>Array.from(w,x=>compact.indexOf(x)));const cipher=p54.flat().concat(p55.flat()),train=p54.slice(0,-1).flat().length;
 if(cipher.length!==299||train!==213||cipher.some((x,i)=>x!==g.pages[54].indices.slice(9).concat(g.pages[55].indices)[i]))throw Error("terminal source mismatch");
 const inv=A.map(a=>{for(let i=1;i<29;i++)if(mod(i*a)===1)return i});
 const dec=new Uint8Array(M*29),enc=new Uint8Array(M*29),next=new Uint16Array(M*M);
 for(let s=0;s<M;s++){for(let x=0;x<29;x++){dec[s*29+x]=mod(inv[s]*(x-B[s]));enc[s*29+x]=mod(A[s]*x+B[s])}for(let k=0;k<M;k++)next[s*M+k]=ind(mod(A[s]*A[k]),mod(A[s]*B[k]+B[s]))}
 function transform(t,u,v,encrypt){let s=identity;const out=[];for(const x of t){const p=encrypt?x:dec[s*29+x],c=encrypt?enc[s*29+x]:x;out.push(encrypt?c:p);s=next[s*M+(cls(p)?v:u)]}return out}
 // Smoothed GP29 trigram, trained on Gibran only. All scoring ignores boundaries.
 const uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);const ref=texts[1];for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
 const score=new Float64Array(24389);for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const pu=(uni[z]+1)/(ref.length+29),pb=(bi[y*29+z]+20*pu)/(uni[y]+20);score[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+20*pb)/(bi[x*29+y]+20))}
 function logp(t){let sum=0;for(let i=2;i<t.length;i++)sum+=score[(t[i-2]*29+t[i-1])*29+t[i]];return sum/(t.length-2)}
 const cl=Uint8Array.from({length:29},(_,i)=>cls(i));
 function rank(c){let best=-Infinity,second=-Infinity,key=null;for(const [u,v] of pairs){let state=identity,x=0,y=0,sum=0;for(let i=0;i<train;i++){const z=dec[state*29+c[i]];if(i>=2)sum+=score[(x*29+y)*29+z];x=y;y=z;state=next[state*M+(cl[z]?v:u)]}if(sum>best){second=best;best=sum;key=[u,v]}else if(sum>second)second=sum}const p=transform(c,...key,false);if(transform(p,...key,true).some((x,i)=>x!==c[i]))throw Error("replay");return {key,coeff:key.map(i=>[A[i],B[i]]),score:best/(train-2),margin:(best-second)/(train-2),heldScore:logp(p.slice(train)),p}}
 const plants=[];for(const [n,offset,u,v] of [[0,10000,ind(3,5),ind(7,11)],[2,20000,ind(2,8),ind(11,3)]]){if(!pairs.some(([a,b])=>a===u&&b===v))throw Error("commuting plant");const p=texts[n].slice(offset,offset+299),c=transform(p,u,v,true),r=rank(c);plants.push({source:sources[n][0],offset,actual:[u,v],actualCoeff:[u,v].map(i=>[A[i],B[i]]),selected:r.key,trainRecovered:r.p.slice(0,train).filter((x,i)=>x===p[i]).length,holdRecovered:r.p.slice(train).filter((x,i)=>x===p[i+train]).length,score:r.score,heldScore:r.heldScore,margin:r.margin,plainScore:logp(p.slice(0,train))})}
 const gate=controls.some(c=>c.broad.near>0)&&plants.every(p=>p.trainRecovered===train&&p.holdRecovered===299-train);
 let originalFit=null;if(gate){const r=rank(cipher);originalFit={...r,decodedCompact:r.p.map(x=>compact[x]).join(""),translit:r.p.map(x=>g.translit[x]).join(" "),unmodifiedTrain:logp(cipher.slice(0,train)),unmodifiedHold:logp(cipher.slice(train))};delete originalFit.p}
 return {original:{n:flat.length,words:words.length,allHits:hits(flat),internalHits:hits(flat,true),seamHits:hits(flat)-hits(flat,true)},vowels:[...vowels],noncommutingPairs:pairs.length,narrowPairs:translations.length*dilations.length,train,held:299-train,controls,plants,gate,originalFit};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),trans=read("resources/liber-primus/lp2-transcription.txt"),terminal=JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json"));
const sources=[["Shakespeare","shakespeare_first300k.txt",0x33015637],["Gibran","gibran_prophet_58585.txt",0x33015638],["Emerson","emerson_essays_2944.txt",0x33015639]].map(([n,f,s])=>[n,read("resources/control/"+f),s]);
console.log(JSON.stringify(study(g,trans,sources,terminal),null,2));
