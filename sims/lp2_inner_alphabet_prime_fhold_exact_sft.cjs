"use strict";
const fs=require("node:fs");
function experiment(c,n){
 const O=3302,mod=x=>(x%29+29)%29,pr=[];for(let x=2;pr.length<O+12957;x++){let ok=true;for(const p of pr){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)pr.push(x)}
 const shifts=pr.map(x=>mod(x-1)),bits=shifts.map((_,i)=>1n<<BigInt(i)),M=Array(29).fill(0n);for(let j=0;j<shifts.length;j++)M[shifts[j]]|=bits[j];
 const initial=(1n<<BigInt(O))-1n,all=(1n<<BigInt(shifts.length))-1n;
 function indices(x){const s=x.toString(2),a=[];for(let i=s.length-1;i>=0;i--)if(s[i]==="1")a.push(s.length-1-i);return a}
 function back(C,b,m,sign){const B=Array(C.length+1);B[C.length]=all;for(let i=C.length-1;i>=0;i--){const a=C[i],s=B[i+1];B[i]=((s>>1n)&~M[mod(sign*(a-m))])|(a===b?s:0n)}return B}
 function gate(C,b,m,sign){let q=initial;for(let i=0;i<C.length;i++){const a=C[i];q=((q&~M[mod(sign*(a-m))])<<1n)|(a===b?q:0n);if(q===0n)return {length:i,origins:0,paths:"0"}}const B=back(C,b,m,sign),starts=indices(B[0]&initial);let states=new Map(starts.map(j=>[j,1n]));for(let i=0;i<C.length;i++){const a=C[i],next=new Map;for(const [j,v] of states){if(a===b&&(B[i+1]&bits[j]))next.set(j,(next.get(j)||0n)+v);if(mod(a-sign*shifts[j])!==m&&(B[i+1]&bits[j+1]))next.set(j+1,(next.get(j+1)||0n)+v)}states=next}return {length:C.length,origins:starts.length,ends:indices(q).length,paths:[...states.values()].reduce((a,b)=>a+b,0n).toString()}}
 function enc(P,S,b,sign,j){return P.map(x=>x===b?b:mod(S[x]+sign*shifts[j++]));}
 const source=n.sections.map(s=>({name:s.name,P:[...s.source_text].map(x=>n.runes.indexOf(x)).filter(x=>x>=0)})),id=Array.from({length:29},(_,i)=>i),eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 if(!eq(enc(source.find(x=>x.name==="p56_an_end").P,id,0,1,0),c.pages[56].indices))throw Error("authentic p56 replay");
 const controls=[];for(const [name,b,sign,start,a,d] of [["0_welcome",0,1,137,7,6],["0_koan_1",0,-1,911,11,4],["0_loss_of_divinity",2,1,3301,13,5]]){const P=source.find(x=>x.name===name).P,S=id.map(x=>mod(x*a+d)),C=enc(P,S,b,sign,start),B=back(C,b,S[b],sign);if(!(B[0]&bits[start]))throw Error("lost true control origin");let j=start;const Z=P.map(p=>{if(p===b)return S[b];return S[p]});const decoded=Z.map(z=>S.indexOf(z));if(!eq(decoded,P)||!eq(enc(decoded,S,b,sign,j),C))throw Error("plant replay");controls.push({name,length:P.length,b,m:S[b],sign,start,g:gate(C,b,S[b],sign),trueOriginPreserved:true,replay:P.length});}
 const rows=[];for(const [f,l,red] of [[0,2,13],[3,7,16],[8,14,12],[15,22,9],[23,26,16],[27,32,19],[33,39,10],[40,53,8],[54,55,9],[0,55,13]])for(const skip of [0,red])for(const b of f===0&&l===2?[0,2]:[0]){const C=c.pages.slice(f,l+1).flatMap(p=>p.indices).slice(skip),res=[];for(const sign of [1,-1])for(let m=0;m<29;m++)res.push({m,sign,...gate(C,b,m,sign)});const s=res.filter(x=>x.origins>0);rows.push({f,l,skip,b,N:C.length,markerCount:C.filter(x=>x===b).length,legalModels:s.length,legalOriginModels:s.reduce((a,x)=>a+x.origins,0),legalOriginPaths:s.reduce((a,x)=>a+BigInt(x.paths),0n).toString(),maxPrefix:Math.max(...res.map(x=>x.length)),survivors:s})}
 return {method:"inner arbitrary alphabet before authentic consecutive prime-minus-one, literal marker bypass, exact all-clock-origin reachability and path counts",originCount:O,authenticReplay:85,controls,rows}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const f=paths.map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
console.log(JSON.stringify(experiment(...f),null,2));
