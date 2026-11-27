'use strict';
const fs=require('node:fs');
const experiment=function(corpus,gibran){
const n=29,all=(1<<n)-1,nonzero=all^1;
let lit=gibran.toUpperCase(),a=lit.indexOf("ALMUSTAFA, THE CHOSEN");if(a>=0)lit=lit.slice(a);a=lit.indexOf("END OF THE PROJECT GUTENBERG");if(a>=0)lit=lit.slice(0,a);
let map=new Map(corpus.translit.map((v,i)=>[v,i])),D=[];for(let w of lit.match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let q=w.slice(i,i+2);if(map.has(q)){D.push(map.get(q));i+=2}else D.push(map.get(w[i++]));}}
const C=corpus.pages.slice(0,56).flatMap(p=>p.indices),start40=corpus.pages.slice(0,40).reduce((a,p)=>a+p.indices.length,0),end53=corpus.pages.slice(0,54).reduce((a,p)=>a+p.indices.length,0);
if(D.length!==48084||C.length!==12956||end53-start40!==3008)throw Error("source");
let seed=127341;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};const perm=()=>{let x=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=Math.floor(rand()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x};
const eq=(a,b)=>a.every((x,i)=>x===b[i]),epochs=(C,hold)=>{let target=hold?nonzero:all,mask=0,out=[];for(let i=0;i<C.length;i++){mask|=1<<C[i];if((mask&target)===target){out.push(i+1);mask=0;}}return out};
const top2=P=>{let h=Array(n).fill(0);for(let p of P)h[p]++;h.sort((a,b)=>b-a);return h[0]+h[1]};
function donorFloor(len){if(len===0)return null;let h=Array(n).fill(0);for(let i=0;i<len;i++)h[D[i]]++;let floor=Infinity;for(let s=0;s<=D.length-len;s++){let b=0,a=0;for(let q of h){if(q>b){a=b;b=q}else if(q>a)a=q;}floor=Math.min(floor,a+b);if(s<D.length-len){h[D[s]]--;h[D[s+len]]++;}}return floor;}
function gate(C,hold,offset=0,end=C.length){let ep=epochs(C,hold),need=hold?28:14,sync=ep[need-1]??null;if(sync===null)return {hold,epochs:ep.length,need,sync};let begin=Math.max(sync,offset),len=Math.max(0,end-begin);return {hold,epochs:ep.length,need,sync,begin,end,len,cap:top2(C.slice(begin,end)),floor:donorFloor(len),firstEpochs:ep.slice(0,need)}}
function encode(P,S,R,A,hold){let a=A.slice(),C=[],moves=[];for(let p of P){if(hold&&p===0){C.push(0);moves.push(false);continue;}let j=S[p],c=a[j];C.push(c);moves.push(true);a.splice(j,1);a.splice(R[c],0,c)}return {C,moves};}
function verify(C,R,A,moves,hold){let a=A.slice(),target=Array(n);R.forEach((r,c)=>target[r]=c);let ep=epochs(C,hold),need=hold?28:14,deadline=ep[need-1]??null,first=eq(a,target)?0:null,previousFixed=0;
for(let i=0;i<C.length;i++){let c=C[i];if(moves[i]){a.splice(a.indexOf(c),1);a.splice(R[c],0,c);}if(eq(a,target)&&first===null)first=i+1;
 if(first!==null&&!eq(a,target))throw Error("lost absorption");
 if(ep.includes(i+1)){let l=0,r=0;while(l<n&&R[a[l]]===l)l++;while(r<n-l&&R[a[n-1-r]]===n-1-r)r++;let f=l+r;if(f<Math.min(n,previousFixed+(hold?1:2)))throw Error("epoch bound");previousFixed=f;}
}
if(deadline!==null&&(first===null||first>deadline))throw Error("deadline");return {deadline,first};}
const controls=[];
for(let hold of [false,true])for(let t=0;t<12;t++){let P=D.slice(2001+t*233,2001+t*233+C.length),R=perm(),S=perm(),A=perm(),x=encode(P,S,R,A,hold);let v=verify(x.C,R,A,x.moves,hold),inv=Array(n);S.forEach((s,p)=>inv[s]=p);let errors=0,known=0;
if(v.first!==null)for(let i=v.first;i<P.length;i++){if(hold&&x.C[i]===0)continue;known++;if(inv[R[x.C[i]]]!==P[i])errors++;}
if(errors)throw Error("suffix mismatch");controls.push({hold,trial:t,...v,known,errors});}
const originalChecks=[];
for(let hold of [false,true])for(let t=0;t<16;t++){let R=perm(),A=perm(),moves=C.map(c=>!hold||c!==0||rand()<0.5);originalChecks.push({hold,trial:t,...verify(C,R,A,moves,hold)});}
const original=[];for(let hold of [false,true]){original.push({scope:"whole",...gate(C,hold)},{scope:"carried40-53",...gate(C,hold,start40,end53)},{scope:"reset40-53",...gate(C.slice(start40,end53),hold)});}
function anchorDomains(P,C,role,hold){let d=Array(n).fill(all),previous=-1;for(let i=0;i<P.length;i++){if(hold&&P[i]===0){if(C[i]!==0)return {status:"holdConflict",i};continue;}if(previous>=0){let x=role==="plain"?P[previous]:C[previous],m=1<<P[i];d[x]&=C[i]===C[previous]?m:~m;if(!d[x])return {status:"anchorConflict",i};}previous=i;}return {status:"ok",d};}
const arbitraryControls=[];
for(let role of ["plain","cipher"])for(let hold of [false,true])for(let t=0;t<4;t++){let P=D.slice(2001+t*5000,2001+t*5000+C.length),R=Array.from({length:n},()=>Math.floor(rand()*n)),S=perm(),A=perm(),a=A.slice(),ct=[];for(let p of P){if(hold&&p===0){ct.push(0);continue;}let j=S[p],c=a[j];ct.push(c);a.splice(j,1);a.splice(R[role==="plain"?p:c],0,c);}let x=anchorDomains(P,ct,role,hold);if(x.status!=="ok")throw Error("anchor containment");let inv=Array(n);S.forEach((s,p)=>inv[s]=p);if(x.d.some((d,k)=>!(d&(1<<inv[R[k]]))))throw Error("true map lost");arbitraryControls.push({role,hold,t,forced:x.d.filter(d=>(d&(d-1))===0).length});}
const arbitraryOriginal=[];for(let scope of ["whole","reset40-53"]){let ct=scope==="whole"?C:C.slice(start40,end53);for(let role of ["plain","cipher"])for(let hold of [false,true]){let failHold=0,failAnchor=0,pass=0;for(let i=0;i<=D.length-ct.length;i++){let x=anchorDomains(D.slice(i,i+ct.length),ct,role,hold);if(x.status==="holdConflict")failHold++;else if(x.status==="anchorConflict")failAnchor++;else pass++;}arbitraryOriginal.push({scope,role,hold,windows:D.length-ct.length+1,failHold,failAnchor,pass});}}
return {original,controls,originalChecks,arbitraryControls,arbitraryOriginal};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),fs.readFileSync(paths[1],'utf8')),null,2));
