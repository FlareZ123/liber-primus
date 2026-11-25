'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(grid){
 const check=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>a.join()===b.join(),hex=a=>a.map(v=>v.toString(16).padStart(2,"0")).join("");
 const choose=(n,k)=>{if(n<k||k<0)return 0n;let r=1n;for(let j=1;j<=k;j++)r=r*BigInt(n-j+1)/BigInt(j);return r},fact=n=>{let f=1;for(let i=2;i<=n;i++)f*=i;return f};
 const limit=choose(256,8),target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
 const rankSet=s=>s.reduce((n,v,i)=>n+choose(v,i+1),0n);
 function unrankSet(r,n=256,k=8){check(r>=0n&&r<choose(n,k),"set rank");const s=Array(k);let top=n-1;for(let i=k;i>=1;i--){while(choose(top,i)>r)top--;s[i-1]=top;r-=choose(top,i);top--}check(r===0n,"residual");return s}
 function rankOrder(row){const pool=row.slice().sort((a,b)=>a-b);let r=0;for(const v of row){const j=pool.indexOf(v);check(j>=0,"permutation");r=r*pool.length+j;pool.splice(j,1)}return r}
 function unrankOrder(r,set){const pool=set.slice(),row=[];check(r>=0&&r<fact(pool.length),"order rank");while(pool.length){const n=fact(pool.length-1),j=Math.floor(r/n);r%=n;row.push(pool.splice(j,1)[0])}return row}
 function be(x,width){let a=Array(width);for(let i=width-1;i>=0;i--){a[i]=Number(x&255n);x>>=8n}check(x===0n,"width");return a}
 function fromBE(a){return a.reduce((v,x)=>(v<<8n)|BigInt(x),0n)}
 function factor(rows){const S=[],O=[];for(const row of rows){check(row.length===8&&new Set(row).size===8&&row.every(v=>v>=0&&v<=255),"row");const s=rankSet(row.slice().sort((a,b)=>a-b)),o=rankOrder(row);S.push(...be(s,7));O.push(...be(BigInt(o),2))}for(let i=0;i<rows.length;i++)check(eq(unrankOrder(Number(fromBE(O.slice(2*i,2*i+2))),unrankSet(fromBE(S.slice(7*i,7*i+7)))),rows[i]),"row inverse");return {S,O}}
 function utf8(a){for(let i=0;i<a.length;){const x=a[i++];if(x<128)continue;let n=0,lo=128,hi=191;if(x>=194&&x<=223)n=1;else if(x>=224&&x<=239){n=2;if(x===224)lo=160;if(x===237)hi=159}else if(x>=240&&x<=244){n=3;if(x===240)lo=144;if(x===244)hi=143}else return false;if(i+n>a.length||a[i]<lo||a[i]>hi)return false;i++;for(let k=1;k<n;k++)if(a[i]<128||a[i++]>191)return false}return true}
 function describe(a){const ascii=a.filter(x=>x>=32&&x<=126).length;return {bytes:a.length,hex:hex(a),printableASCII:ascii,completeASCII:ascii===a.length,strictUTF8:utf8(a),openPGPHeader:(a[0]&128)!==0,directP56:hex(a)===target,firstByte:a[0]}}
 function rng(seed){let x=seed>>>0;return(n)=>{let v,lim=4294967296-4294967296%n;do{x^=x<<13;x^=x>>>17;x^=x<<5;v=x>>>0}while(v>=lim);return v%n}}
 const R=rng(0x270418),randomRow=()=>{const a=Array.from({length:256},(_,i)=>i);for(let j=0;j<8;j++){const k=j+R(256-j);[a[j],a[k]]=[a[k],a[j]]}return a.slice(0,8)};
 // Independent colex oracle: ascending bitmask order equals colex order.
 let oracle=0;
 for(let n=1;n<=12;n++)for(let k=1;k<=Math.min(n,8);k++){let j=0n;for(let mask=0;mask<1<<n;mask++){let s=[];for(let i=0;i<n;i++)if(mask>>i&1)s.push(i);if(s.length!==k)continue;check(rankSet(s)===j&&eq(unrankSet(j,n,k),s),"colex oracle");j++;oracle++}check(j===choose(n,k),"oracle coverage")}
 const max=limit-1n;check(eq(unrankSet(0n),[0,1,2,3,4,5,6,7])&&eq(unrankSet(max),[248,249,250,251,252,253,254,255]),"extrema");check((max>>48n)===1n,"top byte");
 // Source-shaped plaintext transport in order lane, independent legal subset ranks.
 const text="THIS IS A FIXED LENGTH TEST MESSAGE FOR THE ORDER CHANNEL OF LP2".padEnd(64," ");
 check(text.length===64,"text plant");const textBytes=Array.from(text,c=>c.charCodeAt(0));
 const textRows=Array.from({length:32},(_,i)=>unrankOrder(Number(fromBE(textBytes.slice(i*2,i*2+2))),randomRow().sort((a,b)=>a-b)));
 const textPlant=factor(textRows);check(eq(textPlant.O,textBytes)&&describe(textPlant.O).completeASCII,"text plant");
 // Independent fixed-width subset-channel rank plant including min/max.
 const setRanks=[0n,max,...Array.from({length:30},()=>rankSet(randomRow().sort((a,b)=>a-b)))],setRows=setRanks.map(r=>unrankOrder(R(40320),unrankSet(r)));
 const setPlant=factor(setRows);check(setRanks.every((r,i)=>fromBE(setPlant.S.slice(7*i,7*i+7))===r),"rank plant");
 const nulls={trials:256,subsetASCII:0,subsetUTF8:0,subsetPGPHeader:0,orderASCII:0,orderUTF8:0,orderPGPHeader:0,orderDirectP56:0};
 for(let i=0;i<nulls.trials;i++){const a=factor(Array.from({length:32},randomRow)),s=describe(a.S),o=describe(a.O);nulls.subsetASCII+=+s.completeASCII;nulls.subsetUTF8+=+s.strictUTF8;nulls.subsetPGPHeader+=+s.openPGPHeader;nulls.orderASCII+=+o.completeASCII;nulls.orderUTF8+=+o.strictUTF8;nulls.orderPGPHeader+=+o.openPGPHeader;nulls.orderDirectP56+=+o.directP56}
 const tokens=grid.pages.flatMap(p=>p.tokens);check(eq(grid.pages.map(p=>p.tokens.length),[80,104,72]),"physical page boundaries");const radices={};
 for(const base of [60,59]){const alphabet=base===60?grid.alphabet:grid.alphabet.replace("f","");check(alphabet.length===base,"radix");const values=tokens.map(t=>alphabet.indexOf(t[0])*base+alphabet.indexOf(t[1]));const rows=Array.from({length:32},(_,i)=>values.slice(i*8,i*8+8)),a=factor(rows);radices[base]={roundtripCells:256,subset:describe(a.S),ordering:describe(a.O),subsetHighBytes:a.S.filter((_,i)=>i%7===0),pageRowBreaks:[10,13,9]}}
 check(radices[59].ordering.hex===radices[60].ordering.hex,"order invariant");
 return {subsetSpace:String(limit),subsetWidthBytes:7,orderSpace:40320,orderWidthBytes:2,colexOracleCases:oracle,controls:{textPlant:describe(textPlant.O),subsetRankPlant:32,nulls},radices,invalidTargetWords:Array.from({length:32},(_,i)=>i).filter(i=>parseInt(target.slice(4*i,4*i+4),16)>=40320)};
}
module.exports=attack;
if(require.main===module)console.log(JSON.stringify(attack(JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources/liber-primus/lp2-grid-256.json'),'utf8'))),null,2));
