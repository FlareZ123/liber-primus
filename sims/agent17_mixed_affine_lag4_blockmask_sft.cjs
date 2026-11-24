'use strict';
const fs=require('node:fs');
function attack(corpus,native,options={}) {
  const q=options.q??4, lo=options.lo??0, hi=options.hi??29, cap=options.cap??2500;
  const mod=x=>(x%29+29)%29, inv=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,j)=>j+1).find(b=>a*b%29===1):0), ALL=(1<<29)-2;
  if(q<1||q>6)throw Error('q must be 1..6 for 32-bit packed queue');
  const lut=new Uint32Array(29*29*1024);
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let k=0;k<4;k++){
    const offset=(a*29+b)*1024+k*256;
    for(let v=1;v<256;v++){const bit=v&-v, x=k*8+31-Math.clz32(bit), y=x<29?mod(a*x+b):0;lut[offset+v]=lut[offset+(v^bit)]|(y?1<<y:0);}
  }
  function transform(m,a,b){const i=(a*29+b)*1024;return lut[i+(m&255)]|lut[i+256+((m>>>8)&255)]|lut[i+512+((m>>>16)&255)]|lut[i+768+((m>>>24)&255)];}
  function runs(t){const r=[];for(let i=0;i<t.length;){if(!t[i]){i++;continue}const start=i;while(i<t.length&&t[i])i++;r.push({start,length:i-start})}return r;}
  function lanes(t){return runs(t).flatMap(({start,length})=>Array.from({length:q},(_,j)=>{const a=[];for(let k=j;k<length;k+=q)a.push(t[start+k]);return a}).filter(x=>x.length>1)).sort((a,b)=>b.length-a.length);}
  function laneMask(run,a,b,d){let A=1,B=0,m=ALL;for(let i=1;i<run.length;i++){A=mod(-a*A);B=mod(run[i]-b*run[i-1]-d-a*B);if(!A){if(!B)return 0;}else{m&=~(1<<mod(-B*inv[A]));if(!m)return 0;}}return m;}
  function encode(cs){let v=0;for(let i=0;i<q;i++)v|=cs[i]<<(5*i);return v;}
  function push(code,c){return (code>>>5)|(c<<(5*(q-1)));}
  function add(m,code,box){let a=m.get(code);if(!a){m.set(code,[box]);return}outer:for(let j=0;j<a.length;j++){const w=a[j];let wb=true,bw=true;for(let i=0;i<q;i++){const x=w[i]&box[i];if(x!==box[i])wb=false;if(x!==w[i])bw=false;if(!wb&&!bw)continue outer;}if(wb)return;if(bw){a[j]=a[a.length-1];a.pop();j--;}}a.push(box);}
  function count(m){let n=0;for(const a of m.values())n+=a.length;return n;}
  function path(t,start,a,b,d,excludeStatic=false,stop=t.length){
    const cs=t.slice(start,start+q);if(cs.length!==q||cs.some(c=>!c))throw Error('anchor');
    let curr=new Map([[encode(cs),excludeStatic?Array.from({length:q},(_,j)=>cs.map((c,k)=>k<j?1<<c:k===j?ALL&~(1<<c):ALL)):[Array(q).fill(ALL)]]]),peak=count(curr);
    for(let i=start+q;i<stop;){
      const next=new Map();
      if(!t[i]){
        for(const [code,boxes] of curr)for(const box of boxes){
          add(next,code,box);
          const m=transform(box[0],mod(-a),mod(-b*(code&31)-d));
          if(m)add(next,push(code,0),[...box.slice(1),m]);
        }
        i++;
      }else{
        let end=i+1;while(end<stop&&t[end])end++;
        const L=end-i, rot=L%q;
        for(const [initialCode,boxes] of curr){
          let code=initialCode,ok=true;
          const A=Array(q).fill(1),B=Array(q).fill(0),M=Array(q).fill(ALL);
          for(let k=i;k<end;k++){
            const j=(k-i)%q,c=t[k];
            A[j]=mod(-a*A[j]);B[j]=mod(c-b*(code&31)-d-a*B[j]);code=push(code,c);
            if(A[j])M[j]&=~(1<<mod(-B[j]*inv[A[j]]));else if(!B[j]){ok=false;break;}
            if(!M[j]){ok=false;break;}
          }
          if(!ok)continue;
          for(const box of boxes){
            const out=Array(q);let legal=true;
            for(let k=0;k<q;k++){const j=(k+rot)%q,m=box[j]&M[j];if(!m){legal=false;break;}out[k]=transform(m,A[j],B[j]);if(!out[k])throw Error('lost legal root');}
            if(legal)add(next,code,out);
          }
        }
        i=end;
      }
      if(!next.size)return {ok:false,end:i-start,peak};
      curr=next;peak=Math.max(peak,count(curr));
      if(peak>cap)return {ok:null,end:i-start,peak};
    }
    return {ok:true,end:stop-start,peak};
  }
  function reverseKey(a,b,d){return a&&b?[inv[a],inv[b],mod(-d*inv[b])]:null;}
  function plant(key,ids){const [u,a,b,d]=key,sections=native.sections.map(s=>[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)),p=ids.flatMap(i=>sections[i]),xs=Array.from({length:q},(_,i)=>i+5),cs=Array.from({length:q},(_,i)=>i+17),t=p.map(v=>{if(!v)return 0;const x=mod(v*u),c=mod(x+a*xs.shift()+b*cs.shift()+d);xs.push(x);cs.push(c);return c});
    const start=runs(t).sort((a,b)=>b.length-a.length)[0].start, r=t.slice().reverse(),rs=runs(r).sort((a,b)=>b.length-a.length)[0].start,rev=reverseKey(a,b,d);
    const result={n:t.length,key,forward:path(t,start,a,b,d),reverse:rev?path(r,rs,...rev):null,necessary:lanes(t).every(l=>laneMask(l,a,b,d))};
    if(!result.necessary||result.forward.ok===false||result.reverse?.ok===false)throw Error('true path rejected');
    return result;
  }
  const t=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),r=t.slice().reverse(),l=lanes(t);
  if(t.length!==12956)throw Error('original input length');
  const starts=runs(t).filter(x=>x.length>=q).sort((a,b)=>b.length-a.length), rstarts=runs(r).filter(x=>x.length>=q).sort((a,b)=>b.length-a.length);
  const anchor=options.anchor??starts[0].start, reverseAnchor=options.reverseAnchor??rstarts.filter(x=>r.length-x.start>=6000)[0]?.start??rstarts[0].start;
  let candidates=0,rejected=0,staticOnly=0,reverseRejected=0,maxPeak=0,maxEnd=0;const pending=[];
  for(let a=lo;a<hi;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){
    if(!l.every(x=>laneMask(x,a,b,d)))continue;candidates++;
    const cancel=mod(a+b)===0&&d===0;
    if(cancel&&!a){staticOnly++;continue;}
    const z=path(t,anchor,a,b,d,cancel);
    maxPeak=Math.max(maxPeak,z.peak);maxEnd=Math.max(maxEnd,z.end);
    if(z.ok===false){rejected++;if(cancel)staticOnly++;continue;}
    const key=reverseKey(a,b,d);
    if(key){const w=path(r,reverseAnchor,...key,cancel);maxPeak=Math.max(maxPeak,w.peak);maxEnd=Math.max(maxEnd,w.end);if(w.ok===false){rejected++;reverseRejected++;if(cancel)staticOnly++;continue;}pending.push({key:[a,b,d],forward:z,reverse:w,cancel});}
    else pending.push({key:[a,b,d],forward:z,cancel});
  }
  return {q,lo,hi,cap,originalLength:t.length,anchor,reverseAnchor,candidates,rejected,staticOnly,reverseRejected,maxPeak,maxEnd,pending,plants:options.plants?[plant([7,9,13,4],[1,3]),plant([11,17,3,18],[4,5,6])]:[]};
}
const [q='4',lo='0',hi='29',cap='2500',anchor]=process.argv.slice(2);
console.log(JSON.stringify(attack(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')),{q:+q,lo:+lo,hi:+hi,cap:+cap,anchor:anchor===undefined?undefined:+anchor,plants:true}),null,2));
