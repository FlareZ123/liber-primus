'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","sims/lp2_crosspage_three_tap_allsecret_sft.cjs","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/blake-marriage-1906-gutenberg45315.txt"];
function main(inputs){
 const mod=x=>(x%29+29)%29,assert=(a,s)=>{if(!a)throw Error(s)},gp=JSON.parse(inputs[0]),C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),S=gp.pages.filter(p=>p.page>=40&&p.page<=55).flatMap(p=>p.indices);
 assert(C.length===3008&&S.length===3316&&C.every((x,i)=>x===S[i]),"exact prefix");
 assert(inputs[1].includes("[28, 0, 0.03539266046723274]")&&inputs[1].includes("section.length"),"prior pinned maximum");
 const E=Math.round(0.03539266046723274*3314*3313),M=Math.floor((1+Math.sqrt(1+4*E))/2),bound=E+4*M+2;
 assert(E===388586&&M*(M-1)<=E&&(M+1)*M>E,"integer bound");
 const A=new Map(gp.translit.map((w,i)=>[w,i]));
 function native(text){const start=text.search(/\*\*\* START OF/i);if(start>=0)text=text.slice(text.indexOf("\n",start)+1);const end=text.search(/\*\*\* END OF/i);if(end>=0)text=text.slice(0,end);return (text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).flatMap(w=>[...w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>A.get(m[0]==="ING"?"NG":m[0])));}
 const donors=inputs.slice(2).map(native),names=["Shakespeare","Gibran","Emerson","Blake"];
 function scan(P,N){const c=new Int32Array(29);let e=0,min=Infinity,max=0,windows=0;for(let i=0;i<P.length;i++){let x=P[i];assert(x>=0&&x<29,"symbol");if(i>=N){let y=P[i-N];c[y]--;e-=2*c[y];}e+=2*c[x];c[x]++;if(i>=N-1){windows++;min=Math.min(min,e);max=Math.max(max,e);}}return{windows,minPairs:min,maxPairs:max,minIoC:min/(N*(N-1)),maxIoC:max/(N*(N-1))};}
 const results=donors.map((P,i)=>({name:names[i],...scan(P,C.length)}));
 function enc(P,a,b){let U=[],X=Array(P.length);for(let i=0;i<P.length;i++)U[i]=mod(P[i]+a*(U[i-1]??0));for(let i=P.length-1;i>=0;i--)X[i]=mod(U[i]+b*(X[i+1]??0));return X;}
 function dec(X,a,b){return X.map((x,i)=>i?mod((1+a*b)*x-a*X[i-1]-b*(X[i+1]??0)):mod(x-b*(X[1]??0)));}
 const pairs=[[1,1],[1,28],[28,28],[3,7],[14,17],[2,14],[5,23],[19,8]],plants=[];
 for(let i=0;i<pairs.length;i++){let [a,b]=pairs[i],P=donors[i%4].slice(1000+i*71,1000+i*71+C.length),X=enc(P,a,b),Y=dec(X,a,b);assert(Y.every((x,j)=>x===P[j]),"two-pass inverse");
 let scale=0;for(let t=1;t<29;t++)if(mod(-b*t)===1)scale=t;
 const B=mod((1+a*b)*scale),D=mod(-a*scale);
 assert(P.slice(1,-1).every((p,j)=>p===mod(-b*mod(X[j+2]+B*X[j+1]+D*X[j]))),"contained interior");
 plants.push({a,b,recovered:P.length});}
 assert(results.every(x=>x.minPairs>bound),"all native windows above transferred bound");
 return{source:{target:C.length,priorSection:S.length,priorInterior:3314,priorMaxOrderedPairs:E,subsetInterior:C.length-2,maxSingleFrequency:M,fullUpperOrderedPairs:bound,fullUpperIoC:bound/(C.length*(C.length-1))},results,plants,decision:"Exact algebraic containment in existing #1089 three-tap bound, with finite subset and two-edge correction; no repeated 784-pair original search."};
}
console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
