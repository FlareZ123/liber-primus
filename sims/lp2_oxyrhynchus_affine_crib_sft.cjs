// Exact phase-affine crib inversion; run from repository root.
const fs=require("node:fs");
const definitions=[
  [
    "P.Oxy.654 White restoration excerpt",
    "the kingdom of heaven is within you and whosoever knoweth himself shall find it and having found it ye shall know yourselves"
  ],
  [
    "P.Oxy.654 Lagrange restoration excerpt",
    "the kingdom of heaven is within you and whosoever knoweth God shall find it for if ye know him ye shall know yourselves"
  ],
  [
    "P.Oxy.654 saying I",
    "Let not him that seeketh cease seeking till he find and when he findeth he shall marvel and having marvelled he shall reign and having reigned he shall rest"
  ],
  [
    "P.Oxy.1 saying 5",
    "Wheresoever there are two they are not without God and where there is one alone I say I am with him Lift up the stone and there shalt thou find me cleave the wood and I am there"
  ]
];
function attack(source,definitions) {
 const alphabet=Array.from("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"),names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],mod=x=>(x%29+29)%29;
 const decode=s=>Array.from(s).map(c=>alphabet.indexOf(c)).filter(x=>x>=0),pages=source.trim().split(/\r?\n%\r?\n/).map(decode),target=pages.slice(0,-2).flat();
 if(target.length!==12956)throw Error("source geometry");
 const inv=Array.from({length:29},(_,i)=>i?Array.from({length:28},(_,j)=>j+1).find(j=>i*j%29===1):0);
 function wordVariants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const out=[];function go(i,p){if(i===s.length){out.push(p);return;}for(let n=1;n<=2;n++){const x=names.indexOf(s.slice(i,i+n));if(x>=0&&i+n<=s.length)go(i+n,p.concat(x));}}go(0,[]);return out;}
 function variants(str){let a=[[]];for(const w of str.split(" "))a=a.flatMap(p=>wordVariants(w).map(x=>p.concat(x)));return a;}
 function infer(c,p,o,q,hold,x0,y0,a,b){x0.fill(-1);a.fill(0);let j=0;for(let i=0;i<p.length;i++){const x=p[i],y=c[o+i];if(hold&&x===0){if(y!==0)return null;continue;}const k=j++%q;if(x0[k]===-1){x0[k]=x;y0[k]=y;continue;}if(a[k]){if(mod(a[k]*x+b[k])!==y)return null;continue;}if(x===x0[k]){if(y!==y0[k])return null;continue;}const m=mod((y-y0[k])*inv[mod(x-x0[k])]);if(!m)return null;a[k]=m;b[k]=mod(y-m*x);}return {a:Array.from(a),b:Array.from(b),active:j,free:Array.from(a).filter(x=>!x).length};}
 function encode(p,q,hold,a,b){let j=0;return p.map(x=>{if(hold&&x===0)return 0;const k=j++%q;return mod(a[k]*x+b[k]);});}
 const rows=[],hits=[],controls=[];let windows=0;
 for(const [label,plain] of definitions){const vv=variants(plain);if(!vv.length)throw Error(label);for(const q of [8,13])for(const hold of [false,true]){let eligible=0,n=0;const x0=new Int8Array(q),y0=new Int8Array(q),a=new Int8Array(q),b=new Int8Array(q);for(let vi=0;vi<vv.length;vi++){const p=vv[vi];if(p.filter(x=>!hold||x!==0).length<3*q+10)continue;eligible++;windows+=target.length-p.length+1;for(let o=0;o+p.length<=target.length;o++){const k=infer(target,p,o,q,hold,x0,y0,a,b);if(k){n++;hits.push({label,vi,q,hold,o,k,p});}}}rows.push({label,q,hold,spellings:vv.length,eligible,hits:n});if(eligible){const p=vv.find(x=>x.filter(y=>!hold||y!==0).length>=3*q+10),aa=Array.from({length:q},(_,i)=>1+(i*11+7)%28),bb=Array.from({length:q},(_,i)=>(i*13+2)%29),c=encode(p,q,hold,aa,bb),got=infer(c,p,0,q,hold,x0,y0,a,b);if(!got||got.a.some((x,i)=>x&&x!==aa[i])||got.a.some((x,i)=>x&&got.b[i]!==bb[i]))throw Error("positive mismatch");controls.push({label,q,hold,free:got.free,exact:!got.free});}}}
 return {rows,hits,controls,windows};
}
console.log(JSON.stringify(attack(fs.readFileSync("resources/transcriptions/lp2-image-corrected.txt","utf8"),definitions),null,2));
