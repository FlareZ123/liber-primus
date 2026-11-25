'use strict';
// Original-cipher all-key positional BASE29 lag-five/six carry inverse.
// Run from repository with Node.js 22. No dependencies.
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpus, trainingText, plantTexts) {
  const M=29, mod=n=>((n%M)+M)%M, assert=(b,m)=>{if(!b)throw Error(m)};
  const map=new Map(corpus.translit.map((v,i)=>[v,i]));
  /** @param {string} text */
  function native(text){
    const out=[];
    for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");
      for(let t of w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[])out.push(map.get(t==="ING"?"NG":t));
    }
    assert(out.every(Number.isInteger),"native map");
    return out;
  }
  const train=native(trainingText), counts=new Float64Array(841).fill(.5), totals=new Float64Array(29).fill(14.5);
  for(let i=1;i<train.length;i++){counts[29*train[i-1]+train[i]]++;totals[train[i-1]]++}
  const logp=Array.from(counts,(v,i)=>Math.log(v/totals[Math.floor(i/29)]));
  /** @param {number[]} input @param {number[]} key @param {boolean} reverse @param {boolean} enc */
  function transform(input,key,reverse,enc){
    const x=reverse?Array.from(input).reverse():input, n=x.length, y=new Uint8Array(n);
    let carry=0; const [a,b,k]=key;
    for(let i=0;i<n;i++){
      const c=enc?y:x, s=k+carry+a*(i>=5?c[i-5]:0)+b*(i>=6?c[i-6]:0);
      if(enc){const u=x[i]+s;y[i]=u%29;carry=Math.floor(u/29)}
      else{const p=mod(x[i]-s);y[i]=p;carry=(p+s-x[i])/29;}
      assert(Number.isInteger(carry),"integral carry");
    }
    return reverse?Array.from(y).reverse():Array.from(y);
  }
  function score(p){let s=0;for(let i=1;i<p.length;i++)s+=logp[29*p[i-1]+p[i]];return s/(p.length-1)}
  function ioc(p){let h=new Uint32Array(29);for(const x of p)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1))}
  function ascii(p){return p.map(x=>corpus.translit[x]).join("")}
  function equal(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
  function solve(c,reverse){
    let best={score:-Infinity},maxIoC=0;
    const x=reverse?Array.from(c).reverse():c, n=x.length, p=new Uint8Array(n);
    // Inputs in arithmetic order. Natural-order bigram score is reversed only
    // for the right-to-left digit convention.
    for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let k=0;k<29;k++){
      let carry=0,sco=0,h=new Uint16Array(29);
      for(let i=0;i<n;i++){
        const s=k+carry+a*(i>=5?x[i-5]:0)+b*(i>=6?x[i-6]:0);
        const v=mod(x[i]-s);p[i]=v;carry=(v+s-x[i])/29;h[v]++;
        if(i)sco+=reverse?logp[29*v+p[i-1]]:logp[29*p[i-1]+v];
      }
      const ic=h.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));if(ic>maxIoC)maxIoC=ic;
      if(sco/(n-1)>best.score)best={key:[a,b,k],score:sco/(n-1),ioc:ic};
    }
    return {...best,maxIoC};
  }
  const slices=[[0,2],[54,55]], original=slices.map(([a,b])=>corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
  assert(original[0].length===729&&original[1].length===308,"original geometry");
  function integer(p,reverse){const digits=reverse?p:Array.from(p).reverse();let v=0n;for(const d of digits)v=v*29n+BigInt(d);return v}
  function checkInteger(p,c,key,reverse){
    const n=p.length, pow=29n**BigInt(n), [a,b,k]=key.map(BigInt);
    const x=integer(c,reverse), y=integer(p,reverse);
    // (1 - a*29^5 - b*29^6) C = P + k*(29^N-1)/28.
    const lhs=(1n-a*29n**5n-b*29n**6n)*x-y-k*(pow-1n)/28n;
    assert(lhs%pow===0n,"integer congruence");
  }
  const controls=[];
  for(let j=0;j<plantTexts.length;j++){
    const p=native(plantTexts[j]);assert(p.length>=1037,"plant length");
    const dev=p.slice(0,729),hold=p.slice(729,1037),key=j===0?[7,19,11]:[23,4,17],reverse=j===1;
    const ct=transform(dev,key,reverse,true),ch=transform(hold,key,reverse,true),fit=solve(ct,reverse);
    const pred=transform(ct,fit.key,reverse,false),ph=transform(ch,fit.key,reverse,false);
    checkInteger(dev,ct,key,reverse);checkInteger(hold,ch,key,reverse);
    controls.push({key,reverse,fit,devCorrect:pred.filter((v,i)=>v===dev[i]).length,holdCorrect:ph.filter((v,i)=>v===hold[i]).length,holdScore:score(ph),holdIoC:ioc(ph),replay:equal(transform(pred,fit.key,reverse,true),ct)&&equal(transform(ph,fit.key,reverse,true),ch)});
  }
  assert(controls.every(x=>equal(x.key,x.fit.key)&&x.devCorrect===729&&x.holdCorrect===308&&x.replay),"positive-control key recovery failed");
  const originals=[];
  for(const reverse of [false,true]){
    const fit=solve(original[0],reverse), p=transform(original[0],fit.key,reverse,false),h=transform(original[1],fit.key,reverse,false);
    checkInteger(p,original[0],fit.key,reverse);checkInteger(h,original[1],fit.key,reverse);
    assert(equal(transform(p,fit.key,reverse,true),original[0])&&equal(transform(h,fit.key,reverse,true),original[1]),"replay");
    assert(Math.abs(score(p)-fit.score)<1e-10,"score agreement");
    originals.push({reverse,fit,holdScore:score(h),holdIoC:ioc(h),rawDevScore:score(original[0]),rawHoldScore:score(original[1]),devPlain:p,holdPlain:h,devText:ascii(p),holdText:ascii(h),replay:true});
  }
  return {trainingRunes:train.length,controls,originals,inputs:slices,keysPerDirection:29**3};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const c=JSON.parse(read(paths[0]));
const training=read(paths[1]);
const shakespeare=read(paths[2]).split(/\r?\n/).slice(0,300).join('\n');
const result=experiment(c,training,[shakespeare,read(paths[3])]);
console.log(JSON.stringify(result,null,2));
