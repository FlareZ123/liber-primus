"use strict";
/** Agent9: mixed numeral source gate and fixed p10 three-prime receivers. Node22/CommonJS; read only. */
const fs=require("node:fs");
const path=require("node:path");
function experiment(input) {
  const [cj,t,l,nj]=input, c=JSON.parse(cj), native=JSON.parse(nj);
  const idx=new Map(c.runes.map((x,i)=>[x,i])), prime=new Map(c.runes.map((x,i)=>[x,c.prime[i]]));
  const check=(x,m)=>{if(!x)throw Error(m);};
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const sum=w=>/^\d+$/.test(w)?+w:[...w].reduce((v,x)=>v+prime.get(x),0);
  const pages=t.split("%");
  check(pages.length===57,"57 physical rune-page records");
  const words=[];let g=0,page=0,line=1,w="",start=0,sp=0,sl=0,ep=0,el=0,sep="";
  const physical=()=>page>=50?page+1:page;
  function flush(){if(w){words.push({w,page:sp,endPage:ep,line:sl,endLine:el,start,end:g,sum:sum(w),before:sep});w="";sep="";}}
  for(const ch of pages.slice(0,55).join("%")){
    if(idx.has(ch)||/[0-9]/.test(ch)){
      if(!w){start=g;sp=physical();sl=line;}
      ep=physical();el=line;w+=ch;if(idx.has(ch))g++;
    }else if("-.$&§".includes(ch)){flush();sep+=ch;}
    else if(ch==="%")page++;else if(ch==="\n")line++;
  }flush();
  const runes=words.filter(x=>!/^\d+$/.test(x.w)), dig=words.filter(x=>/^\d+$/.test(x.w));
  check(runes.length===2896&&g===12956&&words.length===2902,"canonical source dimensions");
  check(eq(runes.flatMap(x=>[...x.w].map(y=>idx.get(y))),c.pages.filter(x=>x.page<=55).flatMap(x=>x.indices)),"all original rune identities");
  const events=dig.map(x=>{const i=words.indexOf(x);return {x,a:words[i-1],b:words[i+1]};});
  const target=events.find(x=>x.x.w==="7");
  check(target.x.page===10&&target.x.start===2566&&target.a.w==="ᚩᚦᛏ"&&target.b.w==="ᚷ","physical p10 triple");
  check(target.x.before==="-"&&target.b.before==="-"&&target.a.endLine===target.b.line,"original inline separators");
  check(events.filter(x=>x.x.before==="-"&&x.b.before==="-").length===1,"only inline digit in transcribed prose");
  check(events.filter(x=>x.x.before==="."&&x.b.before==="-").length===5,"numbered clause starts");
  const reversed=n=>[...String(n)].reverse().join("");
  const pairs=[];
  for(let i=1;i<runes.length;i++){
    const a=runes[i-1],b=runes[i], ai=words.indexOf(a),bi=words.indexOf(b);
    if(a.endPage!==b.page)continue;
    const inter=words.slice(ai+1,bi);
    const ordinary=inter.length===0&&b.before==="-";
    const inline=inter.length===1&&inter[0]===target.x&&target.x.before==="-"&&b.before==="-";
    if(ordinary||inline)pairs.push({a,b});
  }
  const mirror=({a,b})=>String(a.sum)===reversed(b.sum)&&a.sum!==b.sum;
  const chartMirror=x=>mirror(x)&&c.prime.includes(x.a.sum)&&c.prime.includes(x.b.sum);
  const typed=({a,b})=>a.w.length===3&&b.w.length===1;
  const stats=ps=>({opportunities:ps.length,mirrors:ps.filter(mirror).map(({a,b})=>({page:a.page,start:a.start,words:[a.w,b.w],sums:[a.sum,b.sum]})),chartMirrors:ps.filter(chartMirror).length,exact71_17:ps.filter(x=>x.a.sum===71&&x.b.sum===17).length});
  const chapter=pairs.filter(({a,b})=>a.page>=8&&b.endPage<=14);
  const gapStats={whole:stats(pairs),chapter:stats(chapter),typedWhole:stats(pairs.filter(typed)),typedChapter:stats(chapter.filter(typed)),sameLineWhole:stats(pairs.filter(({a,b})=>a.endLine===b.line)),sameLineChapter:stats(chapter.filter(({a,b})=>a.endLine===b.line))};
  // Reconstruct the actual original LP1 mixed numeric/rune square: literal decimal cells or GP prime sum.
  const rows=l.split("\n").filter(x=>/^\d.*ᛋᚻᚪᛞᚩᚹᛋ|ᚫᚦᛖᚱᛠᛚ-ᛒᚢᚠᚠᛖᚱᛋ|^226-ᚩᛒᛋᚳᚢᚱᚪ|^18-ᚪᚾᚪᛚᚩᚷ|^151-131-ᚳᚪᛒᚪᛚ/.test(x)).map(x=>x.match(/[\u16a0-\u16ff]+|\d+/g).map(sum));
  const rowSums=rows.map(row=>row.reduce((a,b)=>a+b,0));
  const colSums=rows[0].map((_,i)=>rows.reduce((a,row)=>a+row[i],0));
  const diagonals=[rows.reduce((a,row,i)=>a+row[i],0),rows.reduce((a,row,i)=>a+row[4-i],0)];
  check(rows.length===5&&rows.every(x=>x.length===5)&&[...rowSums,...colSums,...diagonals].every(x=>x===1033),"all 12 LP1 magic lines");
  check(eq(rows.flat(),rows.flat().reverse()),"LP1 numeric central reflection");
  const histCipher="lxxt>33m2mqkyv2gsq3q=w]O2ntk";
  const histPlain=[...histCipher].map(x=>String.fromCharCode(x.charCodeAt(0)-4)).join("");
  check(histPlain==="http://i.imgur.com/m9sYK.jpg","2012 ASCII shift known answer");
  const base29=n=>{let s="";do{s="0123456789ABCDEFGHIJKLMNOPQRS"[n%29]+s;n=Math.floor(n/29);}while(n);return s;};
  check(base29(3301)==="3QO"&&base29(1033)==="16I"&&base29(30)==="11","historic BASE29 known answers");
  const values=[target.a.sum,+target.x.w,target.b.sum];
  const chartKey=values.map(x=>c.prime.indexOf(x));
  const totientKey=values.map(x=>(x-1)%29);
  check(eq(values,[71,7,17])&&eq(chartKey,[19,3,6])&&eq(totientKey,[12,6,16]),"p10 fixed candidates");
  const dec=+values.join("");
  check(dec===71717&&dec%29===0,"retrospective concatenation");
  // Historical source geometry from existing p7 report, no fitted column order.
  const mixed=pages.slice(8,15).join("").split("").filter(x=>idx.has(x)||x==="7");
  const order=[2,4,0,3,1], unwrapped=[];
  for(let i=0;i<346;i++)for(const q of order)unwrapped.push(mixed[q*346+i]);
  check(mixed.length===1730&&mixed[692]==="7"&&unwrapped[0]==="7","source marker geometry");
  const back=Array(1730);for(let i=0;i<346;i++)for(let k=0;k<5;k++)back[order[k]*346+i]=unwrapped[i*5+k];
  check(eq(mixed,back),"exact transposition replay");
  const layouts={physical:mixed.filter(x=>x!=="7").map(x=>idx.get(x)),fiveDot:unwrapped.slice(1).map(x=>idx.get(x))};
  const two=new Map(),three=new Map();
  const train=native.sections.filter(s=>!s.name.startsWith("p")).map(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
  for(const a of train)for(let i=2;i<a.length;i++){
    const b=29*a[i-2]+a[i-1],q=29*b+a[i];
    two.set(b,(two.get(b)||0)+1);three.set(q,(three.get(q)||0)+1);
  }
  const ll=(a,b,x)=>{if(a===29||b===29)return 0;const q=29*a+b;return Math.log(((three.get(29*q+x)||0)+1)/((two.get(q)||0)+29));};
  const score=a=>a.slice(2).reduce((s,x,i)=>s+ll(a[i],a[i+1],x),0)/(a.length-2);
  const mod=x=>(x%29+29)%29;
  const spell=a=>a.map(x=>c.translit[x]).join("");
  const p57=c.pages.find(x=>x.page===57).indices;
  function enc(p,k,sign,hold){
    let j=0;return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+sign*k[j]);j=(j+1)%k.length;return y;});
  }
  /** Exact known-key dynamic programming, retaining phase and two GP runes. */
  function inverse(ct,k,sign,hold){
    if(!hold){const p=ct.map((x,i)=>mod(x-sign*k[i%k.length]));check(eq(enc(p,k,sign,false),ct),"ordinary exact replay");return {dead:null,paths:"1",score:score(p),prefix:spell(p.slice(0,64)),plain:p};}
    let states=new Map([[29*30+29,{phase:0,a:29,b:29,v:0,paths:1n,trace:null}]]);
    for(let i=0;i<ct.length;i++){
      const next=new Map();
      for(const s of states.values()){
        const p=mod(ct[i]-sign*k[s.phase]);const transitions=[];
        if(p!==0)transitions.push([p,(s.phase+1)%k.length]);
        if(ct[i]===0)transitions.push([0,s.phase]);
        for(const [x,phase] of transitions){
          const id=(phase*30+s.b)*30+x,v=s.v+ll(s.a,s.b,x),old=next.get(id);
          if(!old)next.set(id,{phase,a:s.b,b:x,v,paths:s.paths,trace:{x,prev:s.trace}});
          else {old.paths+=s.paths;if(v>old.v){old.v=v;old.trace={x,prev:s.trace};}}
        }
      }
      if(!next.size)return {dead:i,paths:"0",score:null,prefix:null};
      states=next;
    }
    const best=[...states.values()].sort((a,b)=>b.v-a.v)[0],p=[];
    for(let s=best.trace;s;s=s.prev)p.push(s.x);p.reverse();
    check(eq(enc(p,k,sign,true),ct),"exact F-hold replay");
    return {dead:null,paths:[...states.values()].reduce((n,s)=>n+s.paths,0n).toString(),score:score(p),prefix:spell(p.slice(0,64)),plain:p};
  }
  const keyList=[["chart-MOG",chartKey],["chart-GOM",[...chartKey].reverse()],["totient",totientKey],["totient-reverse",[...totientKey].reverse()]];
  const trials=[],controls=[];
  for(const [name,k] of keyList)for(const sign of [1,-1])for(const hold of [false,true]){
    const ct=enc(p57,k,sign,hold),ctl=inverse(ct,k,sign,hold);
    check(ctl.dead===null,"native control true path retained");
    controls.push({name,k,sign,hold,paths:ctl.paths,correct:ctl.plain.reduce((s,x,i)=>s+(x===p57[i]),0),score:ctl.score});
    for(const [layout,ct] of Object.entries(layouts)){
      const {plain,...v}=inverse(ct,k,sign,hold);trials.push({name,k,sign,hold,layout,...v});
    }
  }
  const refScore=score(p57);
  return {source:{runes:g,groups:runes.length,numberGroups:dig.length,events,lp1:{rows,rowSums,colSums,diagonals},historical:{ascii:{cipher:histCipher,plain:histPlain},base29:{3301:base29(3301),1033:base29(1033),30:base29(30)}}},gapStats,triplet:{values,decimalConcat:dec,quotient:dec/29,base29:base29(dec),chartKey,totientKey},language:{trainingRunes:train.reduce((s,x)=>s+x.length,0),p57Score:refScore,original:score(layouts.physical),fiveDot:score(layouts.fiveDot)},controls,trials};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const input=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(input),null,2));
