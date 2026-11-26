"use strict";
/** Exact left-composed affine translation/dilation gate, all initial alphabets. Node CommonJS. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,trans,sources){
  const m=x=>((x%29)+29)%29, inv=Array(29).fill(0);
  for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(m(a*b)===1)inv[a]=b;
  const cl=Uint8Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1);
  const tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(s){const out=[];s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const w of s.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}}return out}
  const ids=new Map(g.runes.map((x,i)=>[x,i]));
  const words=trans.replace(/\r\n/g,"\n").split("%").slice(0,55).join("%").replace(/\/\n/g,"").replace(/[\r\n%]/g,"").match(new RegExp("["+g.runes.join("")+"]+","gu")).map(w=>Array.from(w,x=>ids.get(x)));
  const flat=words.flat(),original=g.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  if(flat.length!==12956||words.length!==2896||flat.some((x,i)=>x!==original[i]))throw Error("source mismatch");
  const seam=new Uint8Array(flat.length);let off=0;for(const w of words){if(off)seam[off]=1;off+=w.length}
  function counts(t){let internal=0,boundary=0;for(let i=1;i<t.length;i++)if(t[i]===t[i-1]){if(seam[i])boundary++;else internal++}return [internal,boundary]}
  const observed=counts(flat);
  // G_{i+1}=T_class(P_i) o G_i; G_0(x)=A*x+B.
  // T_0(x)=x+b; T_1(x)=a*x. State decomposition G_i=U_i*G_0+V_i.
  // Keep u=U_i^-1 and R=V_i/U_i. A translation gives A=b*u/(p-q).
  // A dilation gives B=((a*q-p)/(1-a))*A-R.
  function gate(p){
    let minAll=Infinity,minInside=Infinity,minSeam=Infinity,near=0,exact=0,best=null,checked=0;
    let validations=0;
    for(let b=1;b<29;b++)for(let a=2;a<29;a++){
      const vertical=[new Uint16Array(29),new Uint16Array(29)], lines=[new Uint16Array(841),new Uint16Array(841)];
      let u=1,R=0;
      const ai=inv[a],den=inv[m(1-a)];
      for(let i=0;i+1<p.length;i++){
        const x=p[i],y=p[i+1],s=seam[i+1];
        if(cl[x]===0){const d=m(x-y);if(d)vertical[s][m(b*u*inv[d])]++;R=m(R+b*u)}
        else{const slope=m((a*y-x)*den),intercept=m(-R);lines[s][slope*29+intercept]++;u=m(u*ai)}
      }
      for(let A=1;A<29;A++){
        const h0=new Uint16Array(29),h1=new Uint16Array(29);h0.fill(vertical[0][A]);h1.fill(vertical[1][A]);
        for(let s=0;s<29;s++){
          const shift=(s*A)%29,row=s*29;
          for(let k=0;k<29;k++){const B=(k+shift)%29;h0[B]+=lines[0][row+k];h1[B]+=lines[1][row+k]}
        }
        for(let B=0;B<29;B++){
          const I=h0[B],S=h1[B],loss=Math.abs(I-observed[0])+Math.abs(S-observed[1]);checked++;
          if(I+S<minAll)minAll=I+S;if(I<minInside)minInside=I;if(S<minSeam)minSeam=S;
          if(!best||loss<best.loss)best={a,b,A,B,internal:I,seam:S,loss};
          if(Math.abs(I-observed[0])<=2*Math.sqrt(observed[0])&&Math.abs(S-observed[1])<=2*Math.sqrt(observed[1]))near++;
          if(loss===0)exact++;
          if(A===(a+b)%28+1&&B===(a*b)%29){
            const direct=counts(transform(p,a,b,A,B,true));if(direct[0]!==I||direct[1]!==S)throw Error("line-count disagreement "+JSON.stringify({a,b,A,B,direct,I,S}));validations++;
          }
        }
      }
    }
    return {checked,minAll,minInside,minSeam,near,exact,best,validations};
  }
  function transform(t,a,b,A,B,encrypt){const out=[];for(const x of t){const p=encrypt?x:m(inv[A]*(x-B));out.push(encrypt?m(A*p+B):p);if(cl[p]===0)B=m(B+b);else{A=m(a*A);B=m(a*B)}}return out}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
  const controls=[],texts=[];
  for(const [name,source,seed] of sources){
    const pool=new Map();for(const w of source.match(/[A-Za-z]+/g)||[]){const p=encode(w);if(!pool.has(p.length))pool.set(p.length,[]);pool.get(p.length).push(p)}
    const random=rng(seed);const p=words.flatMap(w=>{const q=pool.get(w.length);if(!q?.length)throw Error(name+" missing "+w.length);return q[Math.floor(random()*q.length)]});
    controls.push({name,kind:"length-matched",...gate(p)});texts.push(encode(source));
  }
  const cipher=g.pages[54].indices.slice(9).concat(g.pages[55].indices),train=213;if(cipher.length!==299)throw Error("terminal framing");
  // Same fixed independent Gibran trigram model as the right-action control.
  const ref=texts[1],uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);
  for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
  const score=new Float64Array(24389);for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const pu=(uni[z]+1)/(ref.length+29),pb=(bi[y*29+z]+20*pu)/(uni[y]+20);score[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+20*pb)/(bi[x*29+y]+20))}
  const logp=t=>{let sum=0;for(let i=2;i<t.length;i++)sum+=score[(t[i-2]*29+t[i-1])*29+t[i]];return sum/(t.length-2)};
  function rank(c){
    let best=-Infinity,second=-Infinity,key=null;
    for(let a=2;a<29;a++)for(let b=1;b<29;b++){
      for(let A0=1;A0<29;A0++)for(let B0=0;B0<29;B0++){
        let A=A0,B=B0,x=0,y=0,sum=0;
        for(let i=0;i<train;i++){const z=m(inv[A]*(c[i]-B));if(i>=2)sum+=score[(x*29+y)*29+z];x=y;y=z;if(cl[z]===0)B=m(B+b);else{A=m(a*A);B=m(a*B)}}
        if(sum>best){second=best;best=sum;key=[a,b,A0,B0]}else if(sum>second)second=sum;
      }
    }
    const p=transform(c,...key,false);if(transform(p,...key,true).some((x,i)=>x!==c[i]))throw Error("replay");
    return {key,trainScore:best/(train-2),margin:(best-second)/(train-2),heldScore:logp(p.slice(train)),p};
  }
  const plants=[];
  for(const [n,off,k] of [[0,10000,[7,5,13,8]],[2,20000,[11,3,23,14]]]){
    const p=texts[n].slice(off,off+299),c=transform(p,...k,true);const q=rank(c);
    plants.push({name:sources[n][0],offset:off,actual:k,selected:q.key,trainRecovered:q.p.slice(0,train).filter((x,i)=>x===p[i]).length,heldRecovered:q.p.slice(train).filter((x,i)=>x===p[i+train]).length,trainScore:q.trainScore,heldScore:q.heldScore,margin:q.margin})
  }
  let originalFit=null;
  if(controls.some(c=>c.near>0)&&plants.every(p=>p.trainRecovered===train&&p.heldRecovered===299-train)){
    const z=rank(cipher);originalFit={key:z.key,trainScore:z.trainScore,heldScore:z.heldScore,margin:z.margin,decoded:z.p.map(x=>g.translit[x]).join(" "),untouchedTrain:logp(cipher.slice(0,train)),untouchedHold:logp(cipher.slice(train))};
  }
  return {observed:{length:flat.length,groups:words.length,internal:observed[0],seam:observed[1]},model:{generatorPairs:756,initialStates:812,keys:613872,partition:[...cl],state:"left composition; ordinary consuming; continuous"},controls,plants,originalFit};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),trans=read("resources/liber-primus/lp2-transcription.txt");
const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt",0x33015637],["Gibran","resources/control/gibran_prophet_58585.txt",0x33015638],["Emerson","resources/control/emerson_essays_2944.txt",0x33015639]].map(([n,f,s])=>[n,read(f),s]);
console.log(JSON.stringify(study(g,trans,sources),null,2));
