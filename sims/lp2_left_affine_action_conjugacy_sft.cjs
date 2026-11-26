"use strict";
/** All noncommuting left-composed GP29 affine pairs and all IVs, exact conjugacy quotient. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,trans,sources){
  const mod=x=>((x%29)+29)%29, inv=Array(29).fill(0);
  for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(mod(a*b)===1)inv[a]=b;
  const cls=Uint8Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1);
  const tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(s){const out=[];s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const w of s.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}}return out}
  const ids=new Map(g.runes.map((x,i)=>[x,i]));
  const words=trans.replace(/\r\n/g,"\n").split("%").slice(0,55).join("%").replace(/\/\n/g,"").replace(/[\r\n%]/g,"").match(new RegExp("["+g.runes.join("")+"]+","gu")).map(w=>Array.from(w,x=>ids.get(x)));
  const flat=words.flat(),original=g.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  if(flat.length!==12956||words.length!==2896||flat.some((x,i)=>x!==original[i]))throw Error("source mismatch");
  const seam=new Uint8Array(flat.length);let off=0;for(const w of words){if(off)seam[off]=1;off+=w.length}
  function counts(t){let I=0,S=0;for(let i=1;i<t.length;i++)if(t[i]===t[i-1]){if(seam[i])S++;else I++}return [I,S]}
  const observed=counts(flat);
  // Conjugation H(y)=s*y+t, G0 -> H o G0, Tj -> H o Tj o H^-1.
  // Noncommuting pairs: exactly one translation, or two distinct finite fixed points.
  // Normalize translation to +1 and the other fixed point to 0; or normalize fixed points to 0,1.
  const reps=[];
  for(let a=2;a<29;a++){reps.push({family:"vowel-translation",a:[1,a],b:[1,0]});reps.push({family:"nonvowel-translation",a:[a,1],b:[0,1]})}
  for(let a=2;a<29;a++)for(let c=2;c<29;c++)reps.push({family:"two-dilations",a:[a,c],b:[0,mod(1-c)]});
  // Independently enumerate all affine conjugates; verify orbit coverage and disjointness.
  const seen=new Uint8Array(812*812),ix=(a,b)=>(a-1)*29+b;
  for(const rep of reps)for(let s=1;s<29;s++)for(let t=0;t<29;t++){
    const b0=mod(s*rep.b[0]+(1-rep.a[0])*t),b1=mod(s*rep.b[1]+(1-rep.a[1])*t);
    const k=ix(rep.a[0],b0)*812+ix(rep.a[1],b1);
    if(seen[k])throw Error("duplicate conjugate");seen[k]=1;
  }
  let allNoncommuting=0;
  for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let c=1;c<29;c++)for(let d=0;d<29;d++){
    const nc=mod(a*d+b)!==mod(c*b+d);
    if(nc!==Boolean(seen[ix(a,b)*812+ix(c,d)]))throw Error("missing orbit");
    if(nc)allNoncommuting++;
  }
  function encrypt(p,rep,A,B){const out=[];for(const x of p){out.push(mod(A*x+B));const j=cls[x];A=mod(rep.a[j]*A);B=mod(rep.a[j]*B+rep.b[j])}return out}
  // Repeat equation at adjacent plaintext p,q:
  // G_i=U_i*G0+V_i, u=1/U_i,R=V_i/U_i.
  // (p-q)A=b*u for a=1; B=((a*q-p)/(1-a))*A-R+b*u/(1-a) otherwise.
  function gate(p){
    const families={};
    for(const f of ["vowel-translation","nonvowel-translation","two-dilations"])families[f]={representatives:0,checked:0,minAll:Infinity,minInside:Infinity,minSeam:Infinity,near:0,exact:0,best:null,directChecks:0};
    for(let ri=0;ri<reps.length;ri++){
      const rep=reps[ri],res=families[rep.family];res.representatives++;
      const vertical=[new Uint16Array(29),new Uint16Array(29)], lines=[new Uint16Array(841),new Uint16Array(841)];
      let u=1,R=0;const ai=rep.a.map(a=>inv[a]),den=rep.a.map(a=>inv[mod(1-a)]);
      for(let i=0;i+1<p.length;i++){
        const x=p[i],y=p[i+1],j=cls[x],a=rep.a[j],b=rep.b[j],s=seam[i+1];
        if(a===1){const d=mod(x-y);if(d)vertical[s][mod(b*u*inv[d])]++}
        else{const slope=mod((a*y-x)*den[j]),intercept=mod(-R+b*u*den[j]);lines[s][slope*29+intercept]++}
        u=mod(u*ai[j]);R=mod(R+b*u);
      }
      const testA=ri%28+1,testB=(ri*13+7)%29;
      for(let A=1;A<29;A++){
        const h0=new Uint16Array(29),h1=new Uint16Array(29);h0.fill(vertical[0][A]);h1.fill(vertical[1][A]);
        for(let m=0;m<29;m++){const shift=(m*A)%29,row=m*29;for(let k=0;k<29;k++){const B=(k+shift)%29;h0[B]+=lines[0][row+k];h1[B]+=lines[1][row+k]}}
        for(let B=0;B<29;B++){
          const I=h0[B],S=h1[B],loss=Math.abs(I-observed[0])+Math.abs(S-observed[1]);res.checked++;
          res.minAll=Math.min(res.minAll,I+S);res.minInside=Math.min(res.minInside,I);res.minSeam=Math.min(res.minSeam,S);
          if(!res.best||loss<res.best.loss)res.best={a:rep.a,b:rep.b,A,B,internal:I,seam:S,loss};
          if(Math.abs(I-observed[0])<=2*Math.sqrt(observed[0])&&Math.abs(S-observed[1])<=2*Math.sqrt(observed[1]))res.near++;
          if(loss===0)res.exact++;
          if(A===testA&&B===testB){const direct=counts(encrypt(p,rep,A,B));if(direct[0]!==I||direct[1]!==S)throw Error("direct validation failed "+JSON.stringify({rep,A,B,I,S,direct}));res.directChecks++}
        }
      }
    }
    return families;
  }
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
  const controls=[];
  for(const [name,source,seed] of sources){
    const pool=new Map();for(const w of source.match(/[A-Za-z]+/g)||[]){const p=encode(w);if(!pool.has(p.length))pool.set(p.length,[]);pool.get(p.length).push(p)}
    const random=rng(seed);const p=words.flatMap(w=>{const q=pool.get(w.length);if(!q?.length)throw Error(name+" missing "+w.length);return q[Math.floor(random()*q.length)]});
    controls.push({name,kind:"length-matched",families:gate(p)});
    const t=encode(source),offset=1000,continuous=t.slice(offset,offset+flat.length);if(continuous.length!==flat.length)throw Error("short control");
    controls.push({name,kind:"continuous",offset,families:gate(continuous)});
  }
  return {observed:{runes:flat.length,groups:words.length,internal:observed[0],seam:observed[1]},representatives:reps.length,allNoncommuting,iv:812,totalOriginalParameterTuples:allNoncommuting*812,representativeTuples:reps.length*812,controls};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),trans=read("resources/liber-primus/lp2-transcription.txt");
const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt",0x33015637],["Gibran","resources/control/gibran_prophet_58585.txt",0x33015638],["Emerson","resources/control/emerson_essays_2944.txt",0x33015639]].map(([n,f,s])=>[n,read(f),s]);
console.log(JSON.stringify(study(g,trans,sources),null,2));
