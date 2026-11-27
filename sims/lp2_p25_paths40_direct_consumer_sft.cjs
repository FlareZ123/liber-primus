'use strict';
const fs=require('node:fs');
const path=require('node:path');

function experiment(corpus,transcription,signedSource){
  const mod=x=>(x%29+29)%29,sum=a=>a.reduce((x,y)=>x+y,0),sig=a=>[...a].sort((a,b)=>a-b).join(","),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const check=(x,m)=>{if(!x)throw Error(m)};
  const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
  function gp(word){
    const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
    const values=[];
    for(let i=0;i<normalized.length;){
      if(normalized.startsWith("ING",i)){values.push(21);i+=3;continue}
      if(normalized.startsWith("IO",i)){values.push(27);i+=2;continue}
      const token=gpTokens.find(x=>normalized.startsWith(x.symbol,i));
      check(token,"Unmapped GP spelling "+word);
      values.push(token.value);i+=token.symbol.length;
    }
    return values;
  }
  const clear=signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
  const signed=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/).filter(x=>/^[A-Za-z]+$/.test(x)).map(x=>({label:x.toUpperCase(),gp:gp(x)}));
  check(signed.length===43,"signed source count");
  const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
  const parts=transcription.replace(/\r/g,"").split(/^\s*%\s*$/m).slice(0,55);
  let words=[],w=[],sp=-1,ep=-1,st=0;
  function flush(){if(w.length)words.push({page:sp,endPage:ep,start:st,values:w});w=[]}
  for(let s=0;s<parts.length;s++){
    const p=s>=50?s+1:s;let o=0;
    for(const ch of parts[s]){
      if(ri.has(ch)){if(!w.length){sp=p;st=o}ep=p;w.push(ri.get(ch));o++}
      else if(!/[\s/]/u.test(ch))flush();
    }
    check(o===corpus.pages[p].indices.length,"page offset mismatch");
  }
  flush();const canon=words.filter(w=>w.page===w.endPage);
  check(words.length===2896&&canon.length===2864,"canonical word counts");
  const obj=corpus.pages[25].indices.slice(144,150);
  check(eq(obj,[18,3,20,10,11,16]),"p25 object");
  check(eq([mod(obj[0]-obj[5]),mod(obj[0]+obj[5])],[2,5]),"outer H state");
  const transformed=obj.map((x,i)=>Number(BigInt(x)**BigInt(i?27:3)%29n));
  check(eq(transformed,[3,10,16,3,8,20]),"cube/reciprocal");
  const cuts=Array.from({length:5},(_,i)=>[sum(transformed.slice(0,i+1)),sum(transformed.slice(i+1))]);
  check(JSON.stringify(cuts)===JSON.stringify([[3,57],[13,47],[29,31],[32,28],[40,20]]),"cut sums");
  const indices=[...new Set(cuts.flat().filter(x=>x<signed.length))].sort((a,b)=>a-b);
  const rows=indices.map(index=>{
    const {label,gp}=signed[index];
    return {index,label,gp,len:gp.length,sum:sum(gp),matches:canon.filter(w=>w.page===index&&w.values.length===gp.length&&sum(w.values)===sum(gp))};
  });
  const hits=rows.filter(x=>x.matches.length);
  check(hits.length===1&&hits[0].index===40&&hits[0].matches.length===1,"only PATHS state receiver");
  const gInv=Number(5n**21n%23n);
  check(gInv===14&&gInv*5-3*23===1,"DH reciprocal");
  const shell=[gInv,8,3,mod(-3)];
  const key=[mod(15*(shell[0]+shell[3])),mod(15*(shell[1]+shell[2])),mod(15*(shell[2]-shell[1])),mod(15*(shell[3]-shell[0]))];
  check(eq(key,[20,20,12,6]),"H4 inverse");
  check(eq([mod(key[0]-key[3]),mod(key[1]-key[2]),mod(key[1]+key[2]),mod(key[0]+key[3])],shell),"H4 replay");
  const c=hits[0].matches[0];const plain=c.values.map((x,i)=>mod(x-key[i]));
  check(c.start===71&&eq(plain,signed[40].gp)&&eq(plain,[13,24,2,15]),"PATHS inverse");
  check(eq(plain.map((x,i)=>mod(x+key[i])),c.values),"PATHS forward");
  const meaning=signed[20].gp;
  check(eq(meaning,[19,28,9,21]),"canonical MEANING");
  const windows=[];
  for(let p=0;p<56;p++){const a=corpus.pages[p].indices;for(let i=0;i+4<=a.length;i++)windows.push({page:p,start:i,values:a.slice(i,i+4)})}
  const meaningTests=[1,-1].map(sign=>{
    const k=key.map(x=>mod(x*sign));
    const predicted=meaning.map((x,i)=>mod(x+k[i]));
    const exact=windows.filter(w=>eq(w.values,predicted));
    const permuted=windows.filter(w=>sig(w.values.map((x,i)=>mod(x-meaning[i])))===sig(k)).map(w=>({...w,delta:w.values.map((x,i)=>mod(x-meaning[i])),completeWord:canon.some(c=>c.page===w.page&&c.start===w.start&&c.values.length===4)}));
    check(!exact.length,"unexpected exact MEANING");
    return {sign,predicted,exact,permuted};
  });
  return {groupCount:words.length,canonicalCount:canon.length,object:obj,transformed,cuts,rows,shell,key,paths:{cipher:c,plain},meaning:{gp:meaning,windows:windows.length,tests:meaningTests}};
}

const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/historical/cicada2016-4gq25-outguess.asc')),null,2));
