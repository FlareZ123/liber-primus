"use strict";
/**
 * GP29 plaintext-predecessor-selected repeat escape: exact finite donor gate.
 * C_i=C_(i-1) iff P_i=f(P_(i-1)), one arbitrary shared escape f per
 * tested scope. Every other plaintext symbol maps bijectively onto the
 * 28 nonrepeat outputs; any evolving rank stream is allowed.
 * Physical page IVs unconstrained. No word-boundary assumptions.
 * Run: node sims/agent14_lp2_plainprev_escape_mask_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp, sources, shas) {
 const M=29, K=M*M, ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 function native(raw) {
  let s=raw.toUpperCase();let i=s.search(/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG/);
  if(i>=0)s=s.slice(s.indexOf("\n",i)+1);
  i=s.search(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG/);if(i>=0)s=s.slice(0,i);
  s=s.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];for(const w of s.match(/[A-Z]+/g)||[])for(let j=0;j<w.length;){
   if(w.startsWith("ING",j)){out.push(21);j+=3;continue}
   if(w.startsWith("IO",j)){out.push(27);j+=2;continue}
   const t=tokens.find(t=>w.startsWith(t.s,j));assert(t,`native ${w}`);out.push(t.i);j+=t.s.length;
  }return Uint8Array.from(out);
 }
 /** Ciphertext repeat events, excluding unknown physical-page IVs. */
 function frame(pages) {
  const a=[],pos=[],omit=[];let n=0;for(const p of pages){if(!p.length)continue;if(n)omit.push(n);
   for(let j=0;j<p.length;j++){a.push(p[j]);if(j&&p[j]===p[j-1])pos.push(n+j)}n+=p.length;
  }return {n,pos,omit,a};
 }
 /** Exact per-row domains for one aligned proposed plaintext. */
 function domains(p, fr) {
  const d=new Uint32Array(M).fill(0x1fffffff),pos=new Set(fr.pos),omit=new Set(fr.omit);
  for(let i=1;i<fr.n;i++)if(!omit.has(i)){
   const a=p[i-1],b=p[i],bit=1<<b;
   d[a]&=pos.has(i)?bit:~bit;
  }return d;
 }
 /** Score every contiguous donor window; all functions allowed.
  * Relaxed one-per-row lower bound permits a row to have no escape.
  * Predicate bound permits an arbitrary set of repeat pairs.
  * Exact admissibility additionally requires one remaining label in every row.
  */
 function scan(p, fr) {
  const {n,pos,omit}=fr;if(p.length<n)return null;
  const all=new Int32Array(K),hits=new Int16Array(K),rowBest=new Int16Array(M),touched=[];
  const pair=new Uint16Array(p.length);for(let i=1;i<p.length;i++)pair[i]=p[i-1]*M+p[i];
  for(let i=1;i<n;i++)all[pair[i]]++;
  let bestF=Infinity,bestP=Infinity,firstBestF=-1,firstBestP=-1,lowerZero=0,exact=0,predicateZero=0,exactFirst=[];
  for(let off=0;off+n<=p.length;off++){
   if(off){all[pair[off]]--;all[pair[off+n-1]]++}
   for(const j of pos){const z=pair[off+j];if(!hits[z])touched.push(z);hits[z]++}
   for(const j of omit)all[pair[off+j]]--;
   let pred=0;rowBest.fill(0);
   for(const z of touched){const h=hits[z],t=all[z];assert(t>=h,"repeat counts exceed eligible occurrences");
    pred+=Math.min(h,t-h);const a=Math.floor(z/M),gain=2*h-t;if(gain>rowBest[a])rowBest[a]=gain;
   }
   let f=pos.length;for(const v of rowBest)f-=v;
   if(pred<bestP){bestP=pred;firstBestP=off}
   if(f<bestF){bestF=f;firstBestF=off}
   if(pred===0)predicateZero++;
   if(f===0){lowerZero++;let valid=true;for(let a=0;a<M;a++)if(!rowBest[a]){
      let absent=false;for(let b=0;b<M;b++)if(all[a*M+b]===0){absent=true;break}
      if(!absent){valid=false;break}
    }
    if(valid){exact++;if(exactFirst.length<3){const d=domains(p.slice(off,off+n),fr);assert(d.every(x=>x!==0),"optimized exact gate disagrees");exactFirst.push({offset:off,forcedRows:Array.from(d).filter(x=>(x&(x-1))===0).length})}}
   }
   for(const j of omit)all[pair[off+j]]++;
   for(const z of touched)hits[z]=0;touched.length=0;
  }
  return {windows:p.length-n+1,predicateMinErrors:bestP,predicateBestOffset:firstBestP,predicateZero,onePerRowLowerMinErrors:bestF,onePerRowBestOffset:firstBestF,onePerRowLowerZero:lowerZero,exact,exactFirst};
 }
 const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
 const book=frame(pages.map(p=>p.indices));assert(book.n===12956&&book.pos.length===86&&book.omit.length===54,"original profile");
 const frames=[{name:"book",...book},...ranges.map(([lo,hi])=>({name:`p${lo}-${hi}`,...frame(pages.filter(p=>p.page>=lo&&p.page<=hi).map(p=>p.indices))}))];
 const donors=sources.map(native), results=[];
 for(let k=0;k<donors.length;k++){const p=donors[k];for(const fr of frames)results.push({source:k,frame:fr.name,...scan(p,fr)})}
 // Independent matched-length reversible controls; randomly choose rare escape labels.
 let seed=0xcadab014;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const controls=[];for(let k=0;k<donors.length;k++){
  const start=4000+777*k,p=donors[k].slice(start,start+book.n),f=Array.from({length:M},()=>[11,12,21,22,27,28][rng(6)]),ct=[],keys=[],omit=new Set(book.omit);
  let prev=0;for(let i=0;i<p.length;i++){
   const x=p[i];if(i===0||omit.has(i)){ct.push(x);prev=x;keys.push(-1);continue}
   const e=f[p[i-1]],key=rng(28);keys.push(key);
   const rank=x<e?x:x-1,c=x===e?prev:(prev+1+(rank+key)%28)%M;
   ct.push(c);prev=c;
  }
  const dec=[];for(let i=0;i<ct.length;i++){
   if(keys[i]<0){dec.push(ct[i]);continue}
   const e=f[dec[i-1]],rank=((ct[i]-ct[i-1]+M)%M-1+28-keys[i])%28;
   dec.push(ct[i]===ct[i-1]?e:rank<e?rank:rank+1);
  }
  assert(dec.every((x,i)=>x===p[i]),"exact reversible plant");
  const lens=pages.map(pg=>pg.indices.length),cp=[];let offset=0;for(const len of lens){cp.push(ct.slice(offset,offset+len));offset+=len}
  const cfr=frame(cp),d=domains(p,cfr);assert(f.every((x,i)=>d[i]&(1<<x)),"true function lost");
  const cutoff=9640,train={n:cutoff,pos:cfr.pos.filter(x=>x<cutoff),omit:cfr.omit.filter(x=>x<cutoff)};
  const td=domains(p,train),posSet=new Set(cfr.pos);let forced=0,correct=0,held=0;
  for(let i=cutoff;i<p.length;i++)if(!omit.has(i)){held++;const v=td[p[i-1]],b=1<<p[i];if(!(v&b)||v===b){forced++;if((v===b)===posSet.has(i))correct++}}
  assert(forced===correct,"incorrect forced prediction");
  // Exhaustive scan on a local decoy neighborhood including the hidden true source start.
  const left=start-200,right=start+book.n+200,sc=scan(donors[k].slice(left,right),cfr);
  assert(sc.exact>0&&sc.onePerRowLowerMinErrors===0,"plant not admitted");
  controls.push({source:k,start,repeats:cfr.pos.length,exactReplay:dec.length,forcedRows:Array.from(d).filter(x=>(x&(x-1))===0).length,trainForcedRows:Array.from(td).filter(x=>(x&(x-1))===0).length,held,forced,correct,scan:sc});
 }
 return {shas,sourceLengths:donors.map(x=>x.length),frames:frames.map(({name,n,pos,omit})=>({name,n,repeats:pos.length,pageSeams:omit.length})),controls,results};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),shas),null,2));
