'use strict';
// Agent18: exact moving-escape rare adjacent output-pair bound, source-native controls.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,solved,controls){
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)},mod=x=>(x+29)%29;
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
 const original=pages.flatMap(p=>p.indices);
 assert(pages.length===55&&original.length===12956,"canonical size");
 const words=[];let w=[];for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 assert(words.length===2896&&words.flat().every((x,i)=>x===original[i])&&words.flat().length===original.length,"transcription parity");
 const sectionEnds=[0,729,1874,3612,5506,6527,7960,9640,12956];
 const J=corpus.translit.indexOf("J"),EO=corpus.translit.indexOf("EO");
 assert(J===11&&EO===12,"GP29 canonical neighboring outputs");
 const rare=x=>x===J||x===EO;
 function rank(a,b,mode){assert(a!==b,"ordinary transition");return mode===0?mod(b-a-1):b-Number(b>a);}
 function next(a,r,mode){return mode===0?mod(a+r+1):r+Number(r>=a);}
 function segments(extra){let offset=0,out=[];for(const p of pages){const cuts=[0,...(extra?sectionEnds.filter(x=>x>offset&&x<offset+p.indices.length).map(x=>x-offset):[]),p.indices.length];for(let k=1;k<cuts.length;k++)out.push({page:p.page,offset:offset+cuts[k-1],runes:p.indices.slice(cuts[k-1],cuts[k])});offset+=p.indices.length;}return out;}
 function bound(segs){const bySegment=segs.map(s=>{const h=[Array(28).fill(0),Array(28).fill(0)];for(let i=1;i<s.runes.length;i++){const a=s.runes[i-1],b=s.runes[i];if(a!==b)for(let m=0;m<2;m++)h[m][rank(a,b,m)]++;}const mins=h.map(x=>Math.min(...x));return {page:s.page,offset:s.offset,length:s.runes.length,mins,mixed:Math.min(...mins)};});return {segments:segs.length,cyclic:bySegment.reduce((n,s)=>n+s.mins[0],0),sorted:bySegment.reduce((n,s)=>n+s.mins[1],0),mixed:bySegment.reduce((n,s)=>n+s.mixed,0),bySegment};}
 const physical=bound(segments(false)),generous=bound(segments(true));
 assert(physical.cyclic===177&&physical.sorted===178&&physical.mixed===151,"physical gate");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(raw,cal){const out=[];for(const word of raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){if(cal&&word.startsWith("ING",i)){out.push(21);i+=3;continue;}if(cal&&word.startsWith("IO",i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>word.startsWith(x.s,i));assert(t,"GP token");out.push(t.i);i+=t.s.length;}}return out;}
 assert(gp("FUNCTION",true).map(i=>corpus.runes[i]).join("")==="ᚠᚢᚾᚳᛏᛡᚾ","LP1 FUNCTION");
 assert(JSON.stringify(gp("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE",true))===JSON.stringify(corpus.pages[57].indices),"p57 control");
 const literary=[],N=original.length;
 for(const [name,raw,legacyLength,correctLength] of controls)for(const cal of [false,true]){const a=gp(raw,cal);assert(a.length===(cal?correctLength:legacyLength),"native source length "+name);let count=a.slice(0,N).filter(rare).length,lo=count,hi=count,maxAt=0,compatible=Number(count>=generous.mixed);for(let i=N;i<a.length;i++){count+=Number(rare(a[i]))-Number(rare(a[i-N]));lo=Math.min(lo,count);if(count>hi){hi=count;maxAt=i-N+1;}compatible+=Number(count>=generous.mixed);}literary.push({name,calibrated:cal,runes:a.length,windows:a.length-N+1,min:lo,max:hi,maxAt,compatible});}
 const native=solved.sections.flatMap(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
 assert(native.length===2979,"native solved length");
 let rng=0x18f3301;function rnd(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
 const plants=[];
 for(let j=0;j<3;j++){
   const p=gp(controls[j][1],true).slice(0,N);assert(p.length===N,"plant length");
   const planted=[];let decoded=[],expectedRankCount=0;
   for(const seg of segments(true)){
     const mode=rnd()%2,perm=Array.from({length:28},(_,i)=>i);
     for(let k=27;k>0;k--){const h=rnd()%(k+1);[perm[k],perm[h]]=[perm[h],perm[k]];}
     const inv=Array(28);perm.forEach((x,i)=>inv[x]=i);
     const escape=Array.from({length:29},()=>rnd()%29);
     const clear=p.slice(seg.offset,seg.offset+seg.runes.length),ct=[clear[0]],recovered=[clear[0]];
     for(let i=1;i<clear.length;i++){const e=escape[clear[i-1]],x=clear[i];const c=x===e?ct[i-1]:next(ct[i-1],inv[x-Number(x>e)],mode);ct.push(c);}
     for(let i=1;i<ct.length;i++){const e=escape[recovered[i-1]],a=ct[i-1],b=ct[i];let x;if(a===b)x=e;else{const r=perm[rank(a,b,mode)];if(r===J)expectedRankCount++;x=r+Number(r>=e);}recovered.push(x);}
     decoded.push(...recovered);planted.push({...seg,runes:ct});
   }
   const nRare=p.filter(rare).length,lower=bound(planted).mixed;
   assert(decoded.length===N&&decoded.every((v,i)=>v===p[i]),"full native exact inverse");
   assert(nRare>=expectedRankCount&&expectedRankCount>=lower,"plant forced rare count");
   plants.push({name:controls[j][0],runes:N,exact:decoded.length,rare:nRare,forcedActual:expectedRankCount,minimumAllKeys:lower});
 }
 assert(literary.reduce((n,x)=>n+x.windows,0)===1129739,"all windows");
 assert(literary.every(x=>x.compatible===0),"no native register survives");
 return {physical,generous,literary,solved:{length:native.length,rare:native.filter(rare).length},plants};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),read(paths[1]),JSON.parse(read(paths[2])),[['Gibran',read(paths[3]),63114,62492],['Shakespeare',read(paths[4]),218800,217106],['Emerson',read(paths[5]),324630,321327]]),null,2));
