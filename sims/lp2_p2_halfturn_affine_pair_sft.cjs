'use strict';
// Agent29: exhaustive affine half-turn pair receiver.
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function run(texts){
 const corpus=JSON.parse(texts[0]), M=29, mod=x=>(x%M+M)%M, eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]), must=(x,msg)=>{if(!x)throw Error(msg)};
 const map=new Map(corpus.translit.map((x,i)=>[x,i]));
 function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');for(let i=0;i<w.length;){let hit=false;for(let n of [3,2,1]){let v=map.get(w.slice(i,i+n));if(v!==undefined&&i+n<=w.length){out.push(v);i+=n;hit=true;break}}if(!hit)i++}}return out}
 const src=texts.slice(1).map(encode),train=src.map(x=>x.slice(0,Math.floor(.7*x.length))),held=src.map(x=>x.slice(Math.floor(.7*x.length)));
 let u=new Float64Array(M),b=new Float64Array(M*M),t=new Float64Array(M*M*M),bc=new Float64Array(M),tc=new Float64Array(M*M);
 for(let arr of train)for(let i=0;i<arr.length;i++){let x=arr[i];u[x]++;if(i){let j=arr[i-1];b[j*M+x]++;bc[j]++}if(i>1){let j=arr[i-2]*M+arr[i-1];t[j*M+x]++;tc[j]++}}
 let su=u.reduce((a,b)=>a+b,0),pu=Array.from(u,x=>(x+.2)/(su+.2*M)),pb=Array.from(b,(x,i)=>(x+5*pu[i%M])/(bc[Math.floor(i/M)]+5)),lu=pu.map(Math.log),lb=pb.map(Math.log),lt=Array.from(t,(x,i)=>Math.log((x+7*pb[i%(M*M)])/(tc[Math.floor(i/M)]+7)));
 function score(s){let v=lu[s[0]]+lb[s[0]*M+s[1]];for(let i=2;i<s.length;i++)v+=lt[(s[i-2]*M+s[i-1])*M+s[i]];return v}
 function determinant(r,s){return mod(r[0]*s[1]-r[1]*s[0])}
 function inverse(r,s){let d=determinant(r,s),iv=0;for(let i=1;i<M;i++)if(mod(i*d)===1)iv=i;must(iv,'singular');return [[mod(s[1]*iv),mod(-r[1]*iv)],[mod(-s[0]*iv),mod(r[0]*iv)]]}
 function decode(C,r,s){let P=C.slice(),h=C.length>>1;for(let i=0;i<h;i++){let j=C.length-1-i;P[i]=mod(r[0]*C[i]+r[1]*C[j]+r[2]);P[j]=mod(s[0]*C[i]+s[1]*C[j]+s[2])}return P}
 function encrypt(P,r,s){let C=P.slice(),h=P.length>>1,[[a,b],[c,d]]=inverse(r,s);for(let i=0;i<h;i++){let j=P.length-1-i,x=mod(P[i]-r[2]),y=mod(P[j]-s[2]);C[i]=mod(a*x+b*y);C[j]=mod(c*x+d*y)}return C}
 function search(C,crib=null){const h=C.length>>1,A=[],B=[],matches=[],v=new Int16Array(h);for(let a=0;a<M;a++)for(let b=0;b<M;b++){if(!(a||b))continue;for(let i=0;i<h;i++)v[i]=mod(a*C[i]+b*C[C.length-1-i]);for(let k=0;k<M;k++){let p=Array.from(v,x=>(x+k)%M),r=[a,b,k];let f=score(p);if(crib&&crib.values.every((x,i)=>p[crib.start+i]===x))matches.push(r);p.reverse();let g=score(p);A.push({r,v:f});B.push({r,v:g})}}
 A.sort((x,y)=>y.v-x.v);B.sort((x,y)=>y.v-x.v);let best=null;for(let a of A){if(best&&a.v+B[0].v<best.split)break;let b=B.find(x=>determinant(a.r,x.r));let val=a.v+b.v;if(!best||val>best.split)best={r:a.r,s:b.r,split:val}}
 const P=decode(C,best.r,best.s);must(eq(encrypt(P,best.r,best.s),C),'roundtrip');return {...best,splitPerRune:best.split/(2*h),fullPerRune:score(P)/P.length,plaintext:P,cribMatches:matches,rowCount:A.length}
 }
 const keys=[[[3,7,11],[4,8,19]],[[12,16,6],[7,3,20]],[[5,2,27],[11,8,13]],[[2,9,14],[6,4,5]],[[1,17,4],[13,10,22]],[[24,1,9],[6,7,25]]];
 let controls=[];for(let i=0;i<keys.length;i++){let P=held[i%3].slice(511+311*(i>=3),712+311*(i>=3)),[r,s]=keys[i];must(P.length===201,'control length');let C=encrypt(P,r,s),R=search(C);controls.push({source:i%3,offset:511+311*(i>=3),trueKey:[r,s],recoveredKey:[R.r,R.s],exact: eq(P,R.plaintext),splitPerRune:R.splitPerRune,fullPerRune:R.fullPerRune})}
 const C=corpus.pages[2].indices;must(C.length===201,'p2 length');const original=search(C,{start:36,values:[6,3,3,23]});const rot=[];for(let k of [17,59,113]){let R=search(C.slice(k).concat(C.slice(0,k)));rot.push({offset:k,splitPerRune:R.splitPerRune,fullPerRune:R.fullPerRune})}
 return {training:train.map(x=>x.length),held:held.map(x=>x.length),controls,original:{...original,translit:original.plaintext.map(i=>corpus.translit[i]).join('')},rot,model:"stationary affine GF29 two-rune mixer on reversed page-index pairs; middle passthrough; independently maximized split trigram score subject to nonzero determinant"};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
