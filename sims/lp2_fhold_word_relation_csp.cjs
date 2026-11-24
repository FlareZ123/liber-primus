"use strict";
/**
 * Exact GP29 additive periodic-key CSP with the historical plaintext-F hold.
 * Each printed word is a relation between two phase boundaries and shared
 * key domains. Wildcard words optionally allow every legal plaintext rune.
 * No statistical scoring or beam pruning.
 */
const VALUE_ALL=(1<<29)-1,bit=i=>1<<i,mod29=x=>(x%29+29)%29;
const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
function* bits(x){while(x){const b=x&-x;yield 31-Math.clz32(b);x^=b}}
/** @param {number[][]} words @param {number[]} key */
function encode(words,key,a=1){let phase=0;return words.map(w=>w.map(p=>p===0?0:mod29(a*p+key[phase++%key.length])))}
/**
 * @param {number} period 1..29
 * @param {Map<string,number[]>[]} dict GP spellings grouped by rune length
 */
function createSolver(period,dict,a=1){
 if(!Number.isInteger(a)||a<1||a>28)throw Error("nonzero GP29 slope required");
 const ai=Array.from({length:28},(_,i)=>i+1).find(v=>mod29(v*a)===1);
 if(!Number.isInteger(period)||period<1||period>29)throw Error("period out of range");
 const PHASE_ALL=(1<<period)-1,modPhase=x=>(x%period+period)%period;
 const rot=(x,k)=>{k=modPhase(k);return k?((x<<k)|(x>>>(period-k)))&PHASE_ALL:x};
 function compress(req){const out=Array(Math.min(period,req.length)).fill(VALUE_ALL);for(let i=0;i<req.length;i++){out[i%period]&=req[i];if(!out[i%period])return null}return out}
 function build(ws,wildcard){let offset=0,zeros=0;const domains=[1],rows=[];
  for(let wi=0;wi<ws.length;wi++){const c=ws[wi],candidates=[];let starts=0;
   for(let h=0;h<=Math.min(zeros,period-1);h++)starts|=bit(modPhase(offset-h));
   function add(req,p,holds){const d=compress(req);if(d)candidates.push({p,holds,d,advance:req.length,starts})}
   if(wildcard.has(wi)){
    const positions=c.flatMap((v,i)=>v===0?[i]:[]);if(positions.length>20)throw Error("too many zero branches in word");
    for(let mask=0;mask<(1<<positions.length);mask++){const holds=new Set(positions.filter((_,i)=>(mask>>i)&1));add(c.flatMap((v,i)=>holds.has(i)?[]:[VALUE_ALL^bit(v)]),null,holds)}
   }else for(const p of (dict[c.length]||new Map()).values()){const req=[];let legal=true;for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){legal=false;break}}else req.push(bit(mod29(c[i]-a*p[i])))}if(legal)add(req,p,null)}
   rows.push(candidates);offset+=c.length;zeros+=c.filter(x=>x===0).length;let mask=0;
   for(let h=0;h<=Math.min(zeros,period-1);h++)mask|=bit(modPhase(offset-h));domains.push(mask)
  }return {rows,domains}}
 /**
  * @param {number[][]} ws
  * @param {{limit?:number,fixed?:number[]|null,wildcard?:Set<number>}} options
  */
 function solve(ws,{limit=3000,fixed=null,wildcard=new Set()}={}){
  const {rows,domains}=build(ws,wildcard),initialRows=rows.reduce((n,w)=>n+w.length,0);
  let nodes=0,passes=0,rowVisits=0,exhausted=false,failure=null;const keysFound=new Map();
  const fresh=()=>({keys:fixed?fixed.map(bit):Array(period).fill(VALUE_ALL),ph:domains.slice(),masks:rows.map(w=>Uint32Array.from(w,r=>r.starts))});
  const clone=s=>({keys:s.keys.slice(),ph:s.ph.slice(),masks:s.masks.map(x=>x.slice())});
  function propagate(s){let changed=true;while(changed){changed=false;passes++;
   for(let dir=0;dir<2;dir++)for(let wi=0;wi<rows.length;wi++){
    const w=dir?rows.length-1-wi:wi,candidates=rows[w],masks=s.masks[w],support=Array(29).fill(0),startByReq=new Map();
    function startFor(req){let mask=startByReq.get(req);if(mask===undefined){mask=0;for(let ph=0;ph<period;ph++)if(s.keys[ph]&req)mask|=bit(ph);startByReq.set(req,mask)}return mask}
    let ins=0,outs=0,free=0;
    for(let j=0;j<candidates.length;j++){if(!masks[j])continue;rowVisits++;const {d,advance}=candidates[j],m=d.length;let mask=masks[j]&s.ph[w]&rot(s.ph[w+1],-advance);
     for(let i=0;mask&&i<m;i++)mask&=rot(startFor(d[i]),-i);
     if(mask!==masks[j]){masks[j]=mask;changed=true}if(!mask)continue;ins|=mask;outs|=rot(mask,advance);
     if(free!==PHASE_ALL){let always=PHASE_ALL;const run=m===period?PHASE_ALL:(1<<m)-1;for(const start of bits(mask)){always&=rot(run,start);if(!always)break}free|=PHASE_ALL^always;
      if(free!==PHASE_ALL)for(let i=0;i<m;i++){const phases=rot(mask,i);for(const v of bits(d[i]))support[v]|=phases}}
    }
    if(!ins){failure={word:w,kind:"no relation",pass:passes};return false}
    if(ins!==s.ph[w]){s.ph[w]=ins;changed=true}if(outs!==s.ph[w+1]){s.ph[w+1]=outs;changed=true}
    if(free!==PHASE_ALL)for(let ph=0;ph<period;ph++){if(free&bit(ph))continue;let mask=0;for(const v of bits(s.keys[ph]))if(support[v]&bit(ph))mask|=bit(v);
     if(!mask){failure={word:w,phase:ph,kind:"key domain empty",pass:passes};return false}if(mask!==s.keys[ph]){s.keys[ph]=mask;changed=true}}
   }
  }return true}
  function witness(s){const key=s.keys.map(v=>31-Math.clz32(v));let states=new Map([[0,{prev:null,p:null,n:1}]]);
   for(let w=0;w<rows.length;w++){const next=new Map();for(let j=0;j<rows[w].length;j++){const row=rows[w][j];for(const ph of bits(s.masks[w][j])){const prev=states.get(ph);if(!prev)continue;let phase=ph;const p=row.p||ws[w].map((c,i)=>row.holds.has(i)?0:mod29(ai*(c-key[phase++%period])));const end=modPhase(ph+row.advance),old=next.get(end);if(old)old.n=Math.min(2,old.n+prev.n);else next.set(end,{prev,p,n:prev.n})}}states=next}
   if(!states.size)return;let h=states.values().next().value;const p=[];while(h.p){p.unshift(h.p);h=h.prev}const id=key.join(",");if(String(encode(p,key,a).flat())!==String(ws.flat()))throw Error("replay mismatch");
   const paths=Math.min(2,[...states.values()].reduce((a,b)=>a+b.n,0)),endPhases=[...states.keys()],old=keysFound.get(id);
   if(old){old.paths=Math.min(2,old.paths+paths);old.endPhases=[...new Set([...old.endPhases,...endPhases])]}else keysFound.set(id,{key,p,paths,endPhases})
  }
  function dfs(s){if(keysFound.size>=2||exhausted)return;if(++nodes>limit){exhausted=true;return}if(!propagate(s))return;let best={size:30,type:null,index:-1};
   for(let i=0;i<period;i++){const size=pop(s.keys[i]);if(size>1&&size<best.size)best={size,type:"keys",index:i}}if(!best.type){witness(s);return}
   for(let i=1;i<s.ph.length;i++){const size=pop(s.ph[i]);if(size>1&&size<best.size)best={size,type:"ph",index:i}}
   for(const v of bits(s[best.type][best.index])){const t=clone(s);t[best.type][best.index]=bit(v);dfs(t);if(keysFound.size>=2||exhausted)return}
  }
  dfs(fresh());return {keys:[...keysFound.values()],exhausted,nodes,passes,rowVisits,initialRows,exact:!exhausted&&keysFound.size<2,failure};
 }
 return {solve};
}
/**
 * Exact fixed-key continuation, maximizing dictionary-supported rune count.
 * Unknown words allowed; ties reported, not silently resolved as unique.
 * @param {number[][]} ws @param {number[]} key @param {Map<string,number[]>[]} dict @param {number} initialPhase
 */
function decodeFixed(ws,key,dict,initialPhase=0,a=1){
 if(!Number.isInteger(a)||a<1||a>28)throw Error("nonzero GP29 slope required");
 const ai=Array.from({length:28},(_,i)=>i+1).find(v=>mod29(v*a)===1);
 const period=key.length;let states=new Map([[initialPhase,{score:0,n:1,prev:null,p:null}]]);
 for(const c of ws){const next=new Map();
  for(const [phase,head] of states){const p=[];function walk(i,ph){if(i===c.length){const known=!!dict[p.length]?.has(String(p)),score=head.score+(known?p.length:0),old=next.get(ph);if(!old||score>old.score)next.set(ph,{score,n:head.n,prev:head,p:p.slice()});else if(score===old.score)old.n=Math.min(2,old.n+head.n);return}
    if(c[i]===0){p.push(0);walk(i+1,ph);p.pop()}
    const v=mod29(ai*(c[i]-key[ph]));if(v!==0){p.push(v);walk(i+1,(ph+1)%period);p.pop()}
   }walk(0,phase)}
  if(!next.size)return null;states=next;
 }
 const score=Math.max(...[...states.values()].map(v=>v.score)),best=[...states].filter(([,v])=>v.score===score);let h=best[0][1];const p=[];while(h.p){p.unshift(h.p);h=h.prev}
 const paths=Math.min(2,best.reduce((a,[,v])=>a+v.n,0));return {p,score,paths,endPhases:best.map(([ph])=>ph)};
}
module.exports={createSolver,encode,decodeFixed};
