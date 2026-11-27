"use strict";
/**
 * Original p15 spiral direct rank shifts, arbitrary predecessor escape law.
 * Exact Viterbi over a superset of every legal f; source-native held prose controls.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,sources,shas){
 const M=29,mod=(x,n)=>(x%n+n)%n,assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(raw){let s=raw.toUpperCase();let j=s.search(/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG/);if(j>=0)s=s.slice(s.indexOf("\n",j)+1);j=s.search(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG/);if(j>=0)s=s.slice(0,j);
 s=s.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(const w of s.match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tokens.find(t=>w.startsWith(t.s,i));assert(t,"native mapping");a.push(t.i);i+=t.s.length}return Uint8Array.from(a)}
 const donors=sources.map(native),split=donors.map(x=>Math.floor(x.length*.7));
 const grid=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516],key=grid.map(x=>x%28);
 const ps=gp.pages.filter(p=>p.page>=15&&p.page<=22).map(p=>p.page===15?p.indices.slice(20):p.indices),n=ps.reduce((s,p)=>s+p.length,0);assert(n===1883,"p15 black-body geometry");
 const all=Array.from({length:29},(_,i)=>i),logUniform=Math.log(29);
 // Train interpolated native GP trigram model using disjoint first 70% of each donor.
 const uni=new Float64Array(M),bi=new Float64Array(M*M),tri=new Float64Array(M*M*M),bctx=new Float64Array(M),tctx=new Float64Array(M*M);
 let nt=0;for(let k=0;k<donors.length;k++){let a=donors[k];for(let i=0;i<split[k];i++){let x=a[i];uni[x]++;nt++;if(i){let b=a[i-1];bi[b*M+x]++;bctx[b]++}if(i>1){let t=a[i-2]*M+a[i-1];tri[t*M+x]++;tctx[t]++}}}
 const L1=Array.from(uni,v=>Math.log((v+.5)/(nt+14.5))),L2=new Float64Array(M*M),L3=new Float64Array(M*M*M);
 for(let b=0;b<M;b++)for(let x=0;x<M;x++)L2[b*M+x]=Math.log((bi[b*M+x]+20*Math.exp(L1[x]))/(bctx[b]+20));
 for(let ab=0;ab<M*M;ab++)for(let x=0;x<M;x++)L3[ab*M+x]=Math.log((tri[ab*M+x]+30*Math.exp(L2[(ab%M)*M+x]))/(tctx[ab]+30));
 function allowed(pages,sign,clock,rankMode){let t=0,a=[],ct=[],ranks=[],seams=[];for(let pg of pages){if(!pg.length)continue;seams.push(a.length);a.push(all);ct.push(pg[0]);ranks.push(-2);
  for(let j=1;j<pg.length;j++){let p=pg[j-1],c=pg[j];ct.push(c);if(p===c){a.push(all);ranks.push(-1);if(clock==="all")t++;continue}
   const y=rankMode==="circular"?mod(c-p,M)-1:c-(c>p?1:0),z=mod(y-sign*key[t%16],28);
   a.push([z,z+1]);ranks.push(z);t++;
  }}return {a,ct,ranks,seams}}
 /** Exact relaxation: every rank independently admits its two adjacent canonical GP labels. */
 function viterbi(a){let states=[];for(const x of a[0])for(const y of a[1])states.push({ab:x*M+y,s:L1[x]+L2[x*M+y]});
  const back=Array.from({length:a.length},()=>new Int16Array(M*M).fill(-1));
  for(let i=2;i<a.length;i++){const next=new Float64Array(M*M).fill(-Infinity);for(const {ab,s} of states)for(const x of a[i]){let ix=(ab%M)*M+x,z=s+L3[ab*M+x];if(z>next[ix]){next[ix]=z;back[i][ix]=ab}}
   states=[];for(let ab=0;ab<M*M;ab++)if(Number.isFinite(next[ab]))states.push({ab,s:next[ab]});
  }
  states.sort((a,b)=>b.s-a.s);let {ab,s}=states[0],out=new Uint8Array(a.length);for(let i=a.length-1;i>=2;i--){out[i]=ab%M;ab=back[i][ab]}out[0]=Math.floor(ab/M);out[1]=ab%M;
  return {gain:s/a.length+logUniform,plain:Array.from(out)}
 }
 function score(p){let s=L1[p[0]]+L2[p[0]*M+p[1]];for(let i=2;i<p.length;i++)s+=L3[(p[i-2]*M+p[i-1])*M+p[i]];return s/p.length+logUniform}
 /** The global escape law gives exact threshold domains for a complete aligned path. */
 function consistency(p,info){let d=new Uint32Array(M).fill((1<<29)-1);for(let i=1;i<p.length;i++){let z=info.ranks[i],b=p[i];if(z===-2)continue;
  let mask=z===-1?1<<b:b===z?~((1<<(b+1))-1):b===z+1?(1<<b)-1:0;d[p[i-1]]&=mask;
 }return {emptyRows:Array.from(d).filter(x=>!x).length,domains:Array.from(d)}}
 let seed=0x3299ef14;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 function plant(p,sign,clock,rankMode){let f=Array.from({length:M},()=>[11,12,21,22,27,28][rng(6)]),t=0,off=0,ctp=[];
 for(const pg of ps){let a=[];for(let j=0;j<pg.length;j++){let i=off+j,x=p[i];if(j===0){a.push(x);continue}let prev=a[j-1],e=f[p[i-1]];if(x===e){a.push(prev);if(clock==="all")t++;continue}let z=x-(x>e?1:0),y=mod(z+sign*key[t%16],28);a.push(rankMode==="circular"?mod(prev+1+y,M):y+(y>=prev?1:0));t++}ctp.push(a);off+=pg.length}
 const info=allowed(ctp,sign,clock,rankMode);assert(p.every((x,i)=>info.a[i].includes(x)),"true path not allowed");let d=consistency(p,info);assert(f.every((x,i)=>d.domains[i]&(1<<x)),"true escape map rejected");
 const dec=[];for(let i=0;i<p.length;i++){let z=info.ranks[i];if(z===-2){dec.push(info.ct[i]);continue}let e=f[dec[i-1]];dec.push(z===-1?e:z+(z>=e?1:0))}assert(dec.every((x,i)=>x===p[i]),"plant inverse");
 let best=viterbi(info.a);assert(best.gain+1e-10>=score(p),"relaxed path score below true");return {replay:dec.length,repeat:info.ranks.filter(x=>x===-1).length,trueGain:score(p),relaxedGain:best.gain,relaxedMatch:best.plain.filter((x,i)=>x===p[i]).length};
 }
 const result=[];for(const sign of [1,-1])for(const clock of ["all","nonrepeat"])for(const rankMode of ["circular","linear"]){const info=allowed(ps,sign,clock,rankMode),best=viterbi(info.a),d=consistency(best.plain,info),ctrl=[];
 for(let k=0;k<donors.length;k++){let start=split[k]+1000+400*k,p=Array.from(donors[k].slice(start,start+n));assert(p.length===n,"short held donor");ctrl.push(plant(p,sign,clock,rankMode))}
 result.push({sign,clock,rankMode,original:{gain:best.gain,emptyRows:d.emptyRows,domains:d.domains,runes:best.plain.map(x=>gp.runes[x]).join("")},controls:ctrl});
 }
 return {shas,n,grid,key,trainLengths:split,results:result};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),shas),null,2));
