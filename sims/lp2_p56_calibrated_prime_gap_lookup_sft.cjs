'use strict';
const fs=require('node:fs');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const c=load('resources/liber-primus/lp2-corpus.json'),s=load('resources/external/relikd-solved-gp29-native-v1.json');
const mod=x=>((x%29)+29)%29,pr=[];for(let n=2;pr.length<17000;n++){let ok=true;for(const p of pr){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)pr.push(n);}
const gaps=pr.slice(1).map((p,i)=>p-pr[i]),gv=[...new Set(gaps)].sort((a,b)=>a-b),gi=new Map(gv.map((x,i)=>[x,i])),G=gaps.map(g=>gi.get(g)),known=new Set(G.slice(0,84)),V=gv.length,ALL=(1<<29)-1,K=pr.map(p=>(p-1)%29);
const native=n=>Array.from(s.sections.find(z=>z.name===n).source_text).map(x=>s.runes.indexOf(x)).filter(x=>x>=0);
const range=(a,b)=>c.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
const P56=native('p56_an_end'),C56=range(56,56),knownResidues=new Map();let j=0;for(let i=0;i<85;i++){if(!P56[i]){if(C56[i]!==0)throw Error('F');continue;}if(mod(C56[i]-P56[i])!==K[j])throw Error('p56');const g=G[j];if(!knownResidues.has(g))knownResidues.set(g,new Set());knownResidues.get(g).add(K[j]);j++;}if(j!==84)throw Error('cursor');
const tok=c.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
function encode(text){const out=[];for(const w of text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){const x=w.startsWith('ING',i)?['ING',21]:w.startsWith('IO',i)?['IO',27]:tok.find(([x])=>w.startsWith(x,i));if(!x)throw Error(w);out.push(x[1]);i+=x[0].length;}return out;}
const controls=['emerson_essays_2944.txt','gibran_prophet_58585.txt','shakespeare_first300k.txt'].map(x=>encode(fs.readFileSync('resources/control/'+x,'utf8'))),tr=controls[0];
const ranges=[[0,55],[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
function reach(model){const allowed=Array(29).fill(0n);for(let j=0;j<16500;j++){const v=knownResidues.get(G[j]),p=K[j],fixed=model==='add'?!!v:model==='affine'?v?.size>=2||v?.has(p):v?.has(p);for(let x=0;x<29;x++)if(!fixed||x!==p)allowed[x]|=1n<<BigInt(j);}
 return ranges.map(([a,b])=>{const C=range(a,b);let S=(1n<<3302n)-1n,max=0;for(const x of C){S=((S&allowed[x])<<1n)|(x===0?S:0n);if(!S)break;max++;}return {range:[a,b],n:C.length,max,ends:S.toString(2).replace(/0/g,'').length};});}
function ordinaryCap(){const C=range(0,55),hist=new Uint16Array(V*29);let best=0,besto=0;for(let o=0;o<=3301;o++){hist.fill(0);for(let i=0;i<C.length;i++)hist[G[o+i]*29+C[i]]++;let n=0;for(let g=0;g<V;g++){let a=0;for(let k=0;k<29;k++)a=Math.max(a,hist[g*29+k]);n+=a;}if(n>best){best=n;besto=o;}}return {best,besto,reference:controls.map(P=>{let n=C.length,e=P.slice(0,n).filter(x=>x===18).length,min=e;for(let i=n;i<P.length;i++){e+=(P[i]===18)-(P[i-n]===18);min=Math.min(min,e);}return {windows:P.length-n+1,min};})};}
const ct=new Float64Array(29**3),dn=new Float64Array(29**2),big=new Float64Array(29**2),bd=new Float64Array(29),uni=new Float64Array(29);for(let i=0;i<tr.length;i++){uni[tr[i]]++;if(i){big[tr[i-1]*29+tr[i]]++;bd[tr[i-1]]++;}if(i>=2){ct[(tr[i-2]*29+tr[i-1])*29+tr[i]]++;dn[tr[i-2]*29+tr[i-1]]++;}}
const U=Array.from(uni,x=>Math.log((x+0.3)/(tr.length+8.7))),LM=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let x=0;x<29;x++){const pb=(big[b*29+x]+.3)/(bd[b]+8.7);LM[(a*29+b)*29+x]=Math.log((ct[(a*29+b)*29+x]+10*pb)/(dn[a*29+b]+10));}
const R=Array.from({length:29},(_,x)=>Array.from({length:29},(_,k)=>U[mod(x-k)]));
function score(P){let z=0;for(let i=2;i<P.length;i++)z+=LM[(P[i-2]*29+P[i-1])*29+P[i]];return z;}
function fit(C,limit=300000,keep=256){const n=C.length,M=3302+n+1,back=Array.from({length:n+1},()=>new Uint8Array(M));back[n].fill(1);for(let i=n-1;i>=0;i--)for(let j=0;j<M-1;j++)back[i][j]=((!known.has(G[j])||C[i]!==K[j])&&back[i+1][j+1])||(!C[i]&&back[i+1][j])?1:0;
 const dom=new Int32Array(V).fill(ALL),hist=new Float64Array(V*29),used=new Int32Array(V),base=new Uint8Array(n),vars=new Int16Array(n),top=[];let leaves=0,cap=false,min=-Infinity,origin=0;
 function leaf(j,fix){if(++leaves>limit){cap=true;return;}let a=fix;const key=new Uint8Array(V);for(let v=0;v<V;v++)if(used[v]){let best=-Infinity,bk=0;for(let k=0;k<29;k++)if((dom[v]>>k)&1){let z=hist[v*29+k];if(z>best){best=z;bk=k;}}a+=best;key[v]=bk;}if(a<=min)return;top.push({a,key,base:base.slice(),vars:vars.slice(),dom:dom.slice(),used:used.slice(),origin,end:j});if(top.length>=keep*2){top.sort((a,b)=>b.a-a.a);top.length=keep;min=top[keep-1].a;}}
 function dfs(i,j,fix){if(cap)return;if(i===n){leaf(j,fix);return;}const x=C[i];if(!x&&back[i+1][j]){base[i]=0;vars[i]=-1;dfs(i+1,j,fix+U[0]);}if(cap||!back[i+1][j+1])return;const y=mod(x-K[j]),v=G[j];base[i]=y;
 if(known.has(v)){if(y){vars[i]=-1;dfs(i+1,j+1,fix+U[y]);}}else{const old=dom[v],next=old&~(1<<y);if(next){vars[i]=v;dom[v]=next;used[v]++;for(let k=0;k<29;k++)hist[v*29+k]+=R[y][k];dfs(i+1,j+1,fix);for(let k=0;k<29;k++)hist[v*29+k]-=R[y][k];used[v]--;dom[v]=old;}}}
 for(origin=0;origin<=3301&&!cap;origin++)if(back[0][origin])dfs(0,origin,0);
 top.sort((a,b)=>b.a-a.a);top.length=Math.min(keep,top.length);
 let winner=null,rng=0x43c1;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
 for(const x of top){const vlist=Array.from({length:V},(_,i)=>i).filter(v=>x.used[v]),aff=Array.from({length:V},()=>[]);for(let i=2;i<n;i++)for(const v of new Set([x.vars[i-2],x.vars[i-1],x.vars[i]]))if(v>=0)aff[v].push(i);
 const ds=vlist.map(v=>Array.from({length:29},(_,k)=>k).filter(k=>(x.dom[v]>>k)&1));
 for(let rep=0;rep<3;rep++){const key=x.key.slice();if(rep)for(let a=0;a<vlist.length;a++)key[vlist[a]]=ds[a][rand()%ds[a].length];
 const P=Uint8Array.from(x.base,(y,i)=>x.vars[i]<0?y:mod(y-key[x.vars[i]]));
 const pv=Array.from({length:V},()=>[]);for(let i=0;i<n;i++)if(x.vars[i]>=0)pv[x.vars[i]].push(i);
 for(let it=0;it<12;it++){let change=0;for(let a=0;a<vlist.length;a++){const v=vlist[a],old=key[v];let best=-Infinity,bk=old;for(const k of ds[a]){for(const i of pv[v])P[i]=mod(x.base[i]-k);let z=0;for(const i of aff[v])z+=LM[(P[i-2]*29+P[i-1])*29+P[i]];if(z>best+1e-9){best=z;bk=k;}}key[v]=bk;for(const i of pv[v])P[i]=mod(x.base[i]-bk);change+=bk!==old;}if(!change)break;}
 const z=score(P);if(!winner||z>winner.z)winner={z,key:[...key],used:[...x.used],origin:x.origin,end:x.end,P:[...P],unigram:x.a};}}
 return {leaves,cap,shortlist:top.length,winner};
}
function hold(C,w){let states=new Map([[w.end*841+w.P.at(-2)*29+w.P.at(-1),{z:0,P:[],unseen:0}]]);for(const x of C){const next=new Map();for(const [id,t] of states){const j=Math.floor(id/841),a=Math.floor(id%841/29),b=id%29;function put(p,k,unseen){const z=t.z+LM[(a*29+b)*29+p],h=k*841+b*29+p;if(!next.has(h)||z>next.get(h).z)next.set(h,{z,P:t.P.concat(p),unseen:t.unseen+unseen});}
 if(!x)put(0,j,0);const v=G[j],p=mod(x-K[j]-w.key[v]);if(p)put(p,j+1,known.has(v)||w.used[v]?0:1);
 }states=next;if(!states.size)return {legal:false};}let b=null;for(const t of states.values())if(!b||t.z>b.z)b=t;return {legal:true,...b};}
function run(C,n,truth=null){const a=fit(C.slice(0,n));if(!a.winner)return a;const w=a.winner,h=hold(C.slice(n),w);return {leaves:a.leaves,cap:a.cap,shortlist:a.shortlist,origin:w.origin,end:w.end,fitScore:w.z/(n-2),holdScore:h.legal?h.z/(C.length-n):null,holdLegal:h.legal,unseen:h.unseen,fitCorrect:truth?w.P.filter((p,i)=>p===truth.P[i]).length:null,holdCorrect:truth&&h.legal?h.P.filter((p,i)=>p===truth.P[n+i]).length:null,knownKeyCorrect:truth?w.key.reduce((n,k,i)=>n+(w.used[i]&&k===truth.key[i]?1:0),0):null,seenUnknown:w.used.filter(x=>x>0).length,fitText:w.P.slice(0,80).map(x=>c.translit[x]).join(' '),holdText:h.P?.slice(0,80).map(x=>c.translit[x]).join(' '),key:w.key};}
function plant(name,n,fitn,o){const P=native(name).slice(0,n),key=gv.map((g,i)=>known.has(i)?0:mod(g*7+13)),C=[];let j=o;for(const p of P){if(!p)C.push(0);else C.push(mod(p+K[j]+key[G[j++]]));}return {name,n,fitn,trueOrigin:o,...run(C,fitn,{P,key})};}
const out={knownGaps:[...known].map(i=>[gv[i],knownResidues.get(i).size]),ordinaryCap:ordinaryCap(),add:reach('add'),affine:reach('affine'),permutationRelaxation:reach('permutation'),original:[{range:'p54-55',...run(range(54,55),232)},{range:'p0-2',...run(range(0,2),528)}],controls:[plant('0_koan_1',308,232,167),plant('0_loss_of_divinity',729,528,987)]};
console.log(JSON.stringify(out,null,2));
if(out.ordinaryCap.best!==685||out.add[0].max!==1008||out.original.some(x=>x.holdLegal||x.cap)||out.controls.some(x=>x.origin!==x.trueOrigin||!x.holdLegal))process.exitCode=1;
