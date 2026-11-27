"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(corpus,src,native) {
 const q=29,Q=q*q,S=2*Q,mod=x=>(x%q+q)%q,lookup=new Map(corpus.runes.map((r,i)=>[r,i])),all=(1<<29)-1;
 function parse(text,marks,original=false){let C=[],cuts=[0],words=[],w=[];for(const x of text){if(lookup.has(x)){w.push(C.length);C.push(lookup.get(x))}else{if(original&&x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){words.push(w);w=[]}if(marks.includes(x)&&cuts.at(-1)!==C.length)cuts.push(C.length)}}if(w.length)words.push(w);if(cuts.at(-1)!==C.length)cuts.push(C.length);return {C,cuts,anchors:words.filter(w=>w.length===1).map(w=>w[0])}}
 const orig=parse(src.split("%").slice(0,55).join("%"),".&$",true);
 if(orig.C.join()!==corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices).join()||orig.anchors.length!==83)throw Error("source mismatch");
 const records=native.sections.map(s=>({name:s.name,...parse(s.source_text,"⁘⁜")}));
 function lm(exclude){let a=Array(q).fill(.5),b=Array.from({length:q},()=>Array(q).fill(.5));for(const s of records)if(s.name!==exclude){for(let i=0;i<s.C.length;i++){a[s.C[i]]++;if(i)b[s.C[i-1]][s.C[i]]++}}const sum=x=>x.reduce((a,b)=>a+b,0);return {u:a.map(x=>Math.log(x/sum(a))),b:b.map(r=>r.map(x=>Math.log(x/sum(r))))}}
 function fit(C,cuts,F,L,anchors=[],trace=true){
  const A=new Int32Array(C.length).fill(all);for(const i of anchors)A[i]=(1<<24)|(1<<10)|(1<<3);
  let prevEnd=new Float64Array(q),history=[];
  for(let j=0;j<cuts.length-1;j++){
   const l=cuts[j],h=cuts[j+1],len=h-l,back=trace?new Int16Array(len*S):null;
   let D=new Float64Array(S).fill(-Infinity),E=new Float64Array(S);
   for(let k=0;k<q;k++)for(let d=0;d<q;d++)D[2*(k*q+d)]=prevEnd[k];
   for(let i=l;i<h;i++){
    E.fill(-Infinity);const c=C[i],a=A[i],first=i===l;
    for(let s=0;s<S;s++){
     const score=D[s];if(!Number.isFinite(score))continue;
     const v=s>>1,k=Math.floor(v/q),d=v%q,held=s&1;
     const pprev=held?0:mod((first?0:C[i-1])-mod(k-d));
     const p=mod(c-k);
     if((a&(1<<p))&&(!F||p!==0)){
       const z=2*(mod(k+d)*q+d),v=score+(first?L.u[p]:L.b[pprev][p]);
       if(v>E[z]){E[z]=v;if(back)back[(i-l)*S+z]=s}
     }
     if(F&&c===0&&(a&1)){
       const z=2*(k*q+d)+1,v=score+(first?L.u[0]:L.b[pprev][0]);
       if(v>E[z]){E[z]=v;if(back)back[(i-l)*S+z]=s}
     }
    }
    [D,E]=[E,D];
   }
   let end=new Float64Array(q).fill(-Infinity),arg=new Int16Array(q).fill(-1);
   for(let s=0;s<S;s++){const k=Math.floor((s>>1)/q);if(D[s]>end[k]){end[k]=D[s];arg[k]=s}}
   if(!end.some(Number.isFinite))return {legal:false,failedSegment:j,failedAt:l};
   prevEnd=end;if(trace)history.push({back,arg,l,h});
  }
  let k=prevEnd.indexOf(Math.max(...prevEnd)),score=prevEnd[k];if(!trace)return {legal:true,score:score/C.length};
  const P=new Array(C.length),slopes=[],hold=new Uint8Array(C.length);
  for(let j=history.length-1;j>=0;j--){const {back,arg,l,h}=history[j];let s=arg[k];for(let i=h-1;i>=l;i--){const z=back[(i-l)*S+s];hold[i]=s&1;P[i]=hold[i]?0:mod(C[i]-Math.floor((z>>1)/q));s=z}slopes.unshift((s>>1)%q);k=Math.floor((s>>1)/q)}
  let kk=k;for(let j=0;j<slopes.length;j++)for(let i=cuts[j];i<cuts[j+1];i++){const p=P[i];if(!(A[i]&(1<<p)))throw Error("anchor");if(F&&p===0){if(!hold[i]||C[i]!==0)throw Error("hold");continue}if(hold[i]||mod(p+kk)!==C[i])throw Error("replay");kk=mod(kk+slopes[j])}
  return {legal:true,score:score/C.length,P,slopes,k,holds:hold.reduce((a,b)=>a+b,0)};
 }
 function plant(P,cuts,F,seed,wrong=false){let k=seed%29,C=[],slopes=[],d=0;for(let j=0;j<cuts.length-1;j++){d=mod(seed*7+j*11+j*j*3);slopes.push(d);for(let i=cuts[j];i<cuts[j+1];i++){let p=P[i];if(F&&p===0){C.push(0);continue}C.push(mod(p+k));if(wrong)d=mod(d+3);k=mod(k+d)}}return {C,slopes}}
 const controls=[];
 for(const r of records.filter(r=>r.C.length>=150))for(const F of [false,true]){
  const L=lm(r.name),seed=r.C.length,pl=plant(r.C,r.cuts,F,seed),wrong=plant(r.C,r.cuts,F,seed,true),got=fit(pl.C,r.cuts,F,L),bad=fit(wrong.C,r.cuts,F,L);
  controls.push({name:r.name,F,n:r.C.length,segments:r.cuts.length-1,score:got.score,matched:got.P.filter((p,i)=>p===r.C[i]).length,slopesMatched:got.slopes.filter((d,i)=>d===pl.slopes[i]).length,initialCorrect:got.k===seed%29,wrongScore:bad.score,wrongMatched:bad.P.filter((p,i)=>p===r.C[i]).length});
 }
 const results=[];
 for(const F of [false,true])for(const useAnchors of [false,true]){
  const got=fit(orig.C,orig.cuts,F,lm(null),useAnchors?orig.anchors:[]);const {P,...summary}=got;
  results.push({F,useAnchors,...summary,...(P?{preview:P.slice(0,262).map(x=>corpus.translit[x]).join(" "),runes:P.map(x=>corpus.runes[x]).join("")}: {})});
 }
 return {n:orig.C.length,cuts:orig.cuts,controls,results};
}
if(require.main===module){const root=path.join(__dirname,"../resources");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("liber-primus/lp2-corpus.json")),read("liber-primus/lp2-transcription.txt"),JSON.parse(read("external/relikd-solved-gp29-native-v1.json"))),null,2));}
module.exports=run;
