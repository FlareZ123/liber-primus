'use strict';
// Agent31: six fixed prime-shift / GP29 power compositions, exact F-hold paths.
function attack(gp,shak,gib,em,stage="all"){
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){const q=w.startsWith("ING",i)?{t:"ING",i:21}:w.startsWith("IO",i)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,i));check(q,"unmapped "+w);out.push(q.i);i+=q.t.length}}return out}
 const train=native(shak),orig=gp.pages.filter(p=>p.page>=27&&p.page<=32).flatMap(p=>p.indices),FIT=gp.pages[27].indices.length,MAX=3301;
 check(orig.length===1433&&FIT===234,"original coordinates");
 const prime=[];for(let n=2;prime.length<=MAX+orig.length;n++){let yes=true;for(let d=2;d*d<=n;d++)if(n%d===0){yes=false;break}if(yes)prime.push((n-1)%29)}
 const pow=(x,e)=>{let v=1;while(e-- >0)v=v*x%29;return v};
 const forms=[];for(const e of [3,27])for(const type of ["shift-power","power-shift","conjugate"]){
  const dec=[],enc=[];for(let k=0;k<29;k++){const d=Array.from({length:29},(_,c)=>type==="shift-power"?pow(mod(c-k),e):type==="power-shift"?mod(pow(c,e)-k):mod(pow(mod(c+k),e)-k));check(new Set(d).size===29,"nonbijective");const inv=Array(29);d.forEach((p,c)=>inv[p]=c);dec.push(d);enc.push(inv)}
  forms.push({e,type,dec,enc});
 }
 const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3),row=new Float64Array(29),pair=new Float64Array(29**2);
 for(let i=0;i<train.length;i++){const c=train[i];uni[c]++;if(i){bi[train[i-1]*29+c]++;row[train[i-1]]++}if(i>1){let k=train[i-2]*29+train[i-1];tri[k*29+c]++;pair[k]++}}
 const u=Array.from(uni,x=>Math.log((x+.5)/(train.length+14.5))),b=new Float64Array(29**2),t=new Float64Array(29**3);
 for(let j=0;j<29;j++)for(let k=0;k<29;k++){const p0=Math.exp(u[k]),p1=(bi[j*29+k]+8*p0)/(row[j]+8);b[j*29+k]=Math.log(p1);for(let i=0;i<29;i++){const ix=i*29+j;t[ix*29+k]=Math.log((tri[ix*29+k]+8*p1)/(pair[ix]+8))}}
 function enc(P,form,start){let j=start;return P.map(p=>p===0?0:form.enc[prime[j++]][p])}
 function reach(C,form,start,forced){const z=C.filter(x=>x===0).length;let a=new Uint8Array(z+1),b=new Uint8Array(z+1),hmax=0;a[0]=1;for(let i=0;i<C.length;i++){const c=C[i],want=forced?.get(i),nextmax=hmax+(c===0?1:0);b.fill(0,0,nextmax+1);let any=false;for(let h=0;h<=hmax;h++)if(a[h]){if(c===0&&(want===undefined||want===0)){b[h+1]=1;any=true}const p=form.dec[prime[start+i-h]][c];if(p!==0&&(want===undefined||p===want)){b[h]=1;any=true}}if(!any)return i;[a,b]=[b,a];hmax=nextmax}return C.length}
 function decode(C,form,start,init){let states=new Map([[0,{j:start,a:29,b:29,s:0,node:null}]]);if(init)states=new Map([[0,{...init,s:0,node:null}]]);let i=0;for(const c of C){const next=new Map();for(const st of states.values()){const add=(p,j)=>{const s=st.s+(st.b===29?u[p]:st.a===29?b[st.b*29+p]:t[(st.a*29+st.b)*29+p]);const key=j*900+st.b*30+p;const old=next.get(key);if(!old||s>old.s)next.set(key,{j,a:st.b,b:p,s,node:{p,prev:st.node}})};if(c===0)add(0,st.j);const p=form.dec[prime[st.j]][c];if(p!==0)add(p,st.j+1)}if(!next.size)return {i,best:null};states=next;i++}
 let best=null;for(const st of states.values())if(!best||st.s>best.s)best=st;return {i,best}}
 function path(st){let p=[];for(let x=st.node;x;x=x.prev)p.push(x.p);return p.reverse()}
 function solve(C,full=false){const fit=C.slice(0,FIT),held=C.slice(FIT),rank=[],coverage=[];for(let fi=0;fi<forms.length;fi++){const f=forms[fi];let legal=0,longest=0;for(let origin=0;origin<=MAX;origin++){const n=reach(fit,f,origin);longest=Math.max(longest,n);if(n!==FIT)continue;legal++;const d=decode(fit,f,origin);check(d.best,"reach disagreement");rank.push({fi,origin,score:d.best.s,state:d.best})}coverage.push({e:f.e,type:f.type,legal,longest})}rank.sort((a,b)=>b.score-a.score||a.fi-b.fi||a.origin-b.origin);
 let exhaustion=null;if(full){const crib=[4,28,23,3,1,16],at=FIT+134;check(equal(C.slice(at,at+6),[9,28,24,10,1,20]),"p28 exact crib coordinate");const forced=new Map(crib.map((p,i)=>[at+i,p]));const counts=Array.from({length:6},()=>({fullLegal:0,longest:0,cribLegal:0})),survivors=[];for(const item of rank){const {fi,origin}=item,f=forms[fi],n=reach(C,f,origin),st=counts[fi];st.longest=Math.max(st.longest,n);if(n!==C.length)continue;st.fullLegal++;const cribLegal=reach(C,f,origin,forced)===C.length;if(cribLegal)st.cribLegal++;const d=decode(C,f,origin);check(d.best,"full reach mismatch");const p=path(d.best);check(equal(enc(p,f,origin),C),"full diagnostic replay");survivors.push({fi,origin,score:d.best.s/C.length,cribLegal,P:p})}survivors.sort((a,b)=>b.score-a.score);exhaustion={allSixForms:counts,fullLegal:survivors.length,cribLegal:survivors.filter(s=>s.cribLegal).length,survivors}}
 const best=rank[0];if(!best)return {coverage,legal:0,fitLength:FIT,exhaustion};const f=forms[best.fi],p=path(best.state),h=decode(held,f,best.state.j,best.state),q=h.best?path(h.best):null;check(equal(enc(p,f,best.origin),fit),"fit replay");if(q)check(equal(enc(p.concat(q),f,best.origin),C),"full replay");return {coverage,legal:rank.length,top:rank.slice(0,5).map(x=>({fi:x.fi,origin:x.origin,score:x.score/FIT})),fi:best.fi,e:f.e,type:f.type,origin:best.origin,fitScore:best.score/FIT,clockAtSplit:best.state.j,fit:p,heldReached:h.i,heldLength:held.length,heldScore:h.best?h.best.s/held.length:null,held:q,exhaustion}}
 const controls=[],src=[native(gib),native(em)];
 for(let fi=0;fi<6;fi++){const origin=[17,123,411,917,1701,3201][fi],offset=1000+Math.floor(fi/2)*3000,P=src[fi%2].slice(offset,offset+orig.length);check(P.length===orig.length,"control length");const C=enc(P,forms[fi],origin),sol=solve(C),exactFit=sol.fit?sol.fit.filter((x,i)=>x===P[i]).length:0,exactHeld=sol.held?sol.held.filter((x,i)=>x===P[FIT+i]).length:0;controls.push({fi,origin,offset,source:fi%2?"Emerson":"Gibran",exactFit,exactHeld,sol});}
 const gate=controls.every(c=>c.sol.fi===c.fi&&c.sol.origin===c.origin&&c.exactHeld>=Math.floor(.99*(orig.length-FIT)));
 return {gate,controls,formOrder:forms.map(({e,type})=>({e,type})),trainLength:train.length,FIT,MAX,original:gate&&stage==="all"?solve(orig,true):null};
}
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
console.log(JSON.stringify(attack(gp,read('resources/control/shakespeare_first300k.txt'),read('resources/control/gibran_prophet_58585.txt'),read('resources/control/emerson_essays_2944.txt'),process.argv[2]||'all'),null,2));
