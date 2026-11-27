'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const gp=read('resources/liber-primus/lp2-corpus.json'),solved=read('resources/external/relikd-solved-gp29-native-v1.json');
const mod=x=>(x%29+29)%29,range=n=>Array.from({length:n},(_,i)=>i);
let rng=3183;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const move=(a,i,k)=>a.splice(k,0,a.splice(i,1)[0]);
function forward(p,S,R,A,role){let a=A.slice(),out=[],states=[];for(const x of p){states.push(a.slice());let i=S[x],c=a[i];out.push(c);move(a,i,R[role==="P"?x:c])}states.push(a.slice());return {out,states}}
function partial(p,c,S,R,role){let a=range(29),bind=Array(29).fill(-1),rev=Array(29).fill(-1);for(let j=0;j<p.length;j++){let i=S[p[j]],slot=a[i],x=c[j];if((bind[slot]>=0&&bind[slot]!==x)||(rev[x]>=0&&rev[x]!==slot))return null;bind[slot]=x;rev[x]=slot;move(a,i,R[role==="P"?p[j]:x])}return {slots:a,bind,rev,d:bind.filter(x=>x>=0).length}}
const fact=n=>{let a=1n;for(let i=2n;i<=n;i++)a*=i;return a};
function complete(st,order){let j=0;return st.bind.map(x=>x>=0?x:order[j++])}
function dec(c,S,R,A,role){let a=A.slice(),is=range(29).map(x=>S.indexOf(x)),p=[];for(const x of c){let i=a.indexOf(x),v=is[i];p.push(v);move(a,i,R[role==="P"?v:x])}return p}
let out=[];
for(const name of ["p56_an_end","p57_parable"]){const p=Array.from(solved.sections.find(x=>x.name===name).source_text).filter(x=>gp.runes.includes(x)).map(x=>gp.runes.indexOf(x));for(const role of ["P","C"]){let S=shuffle(range(29)),R=range(29).map(()=>rand(29)),A=shuffle(range(29));let {out:c,states}=forward(p,S,R,A,role);let profile=[8,5,4,3],starts=[0,20,40,60],frags=[],usedP=new Set(),usedX=new Set(),jointState=1n;
for(let j=0;j<4;j++){let k=starts[j],n=profile[j],pp=p.slice(k,k+n),cc=c.slice(k,k+n),hc=c.slice(k+n,k+n+12),hp=p.slice(k+n,k+n+12);
pp.forEach(x=>usedP.add(x));(role==="P"?pp:cc).forEach(x=>usedX.add(x));const st=partial(pp,cc,S,R,role);if(!st)throw Error("true chart rejected");
const reconstructed=complete(st,states[k].filter(x=>st.rev[x]<0));if(reconstructed.some((x,i)=>x!==states[k][i]))throw Error("reconstruction mismatch");
const unknown=range(29).filter(x=>st.rev[x]<0),first=hc.findIndex(x=>st.rev[x]<0),t=fact(BigInt(29-st.d));jointState*=t;
let branches=new Set(),knownPrefix=first<0?hc.length:first;
for(let i=0;i<unknown.length;i++){const order=unknown.slice(i).concat(unknown.slice(0,i)),initial=complete(st,order),state=forward(pp,S,R,initial,role);if(state.out.join(",")!==cc.join(","))throw Error("bad completion");const held=dec(hc,S,R,state.states.at(-1),role);if(held.slice(0,knownPrefix).join(",")!==hp.slice(0,knownPrefix).join(","))throw Error("known prefix");if(first>=0)branches.add(held[first]);const rer=forward(held,S,R,state.states.at(-1),role);if(rer.out.join(",")!==hc.join(","))throw Error("replay")}
if(first>=0&&branches.size!==unknown.length)throw Error("branch count");
let wrong=0,pass=0;for(let z=0;z+n<=p.length;z++){if(z===k)continue;wrong++;if(partial(p.slice(z,z+n),cc,S,R,role))pass++}
frags.push({start:k,length:n,distinct:st.d,states:String(t),knownPrefix,firstUnseenBranches:branches.size,wrongAlignments:wrong,wrongPass:pass});
}
const unseenP=range(29).filter(x=>!usedP.has(x)),unseenX=range(29).filter(x=>!usedX.has(x));let Sa=S.slice(),Ra=R.slice();if(unseenP.length>1)[Sa[unseenP[0]],Sa[unseenP[1]]]=[Sa[unseenP[1]],Sa[unseenP[0]]];if(unseenX.length)Ra[unseenX[0]]=mod(Ra[unseenX[0]]+1);
for(let j=0;j<4;j++){let k=starts[j],n=profile[j];if(!partial(p.slice(k,k+n),c.slice(k,k+n),Sa,Ra,role))throw Error("alternative chart rejected")}
let charts=fact(BigInt(unseenP.length))*29n**BigInt(unseenX.length);
out.push({name,role,length:p.length,usedP:usedP.size,usedX:usedX.size,lowerBoundChartCompletions:String(charts),jointStateCompletions:String(jointState),frags});
}}
console.log(JSON.stringify(out,null,2));
module.exports={partial,complete};
