'use strict';
// Exact stock-root component-tree pruning; no fitted rune or cipher inputs.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
function study(stockBytes,gcBytes){
 const W=160,H=210,Y=162;
 function raster(bytes,h,w){let a=new Uint8Array(h*w),k=0,len=0,shift=0,bit=0;for(const x of bytes){len|=(x&127)<<shift;if(x&128){shift+=7;continue}if(bit)a.fill(1,k,k+len);k+=len;len=shift=0;bit^=1}if(k!==a.length)throw Error("RLE size");for(let i=w;i<a.length;i++)a[i]^=a[i-w];return a}
 const original=raster(stockBytes,H,W),g=raster(gcBytes,192,199),stock=Uint8Array.from(original,(_,i)=>original[Math.floor(i/W)*W+W-1-i%W]);
 function sample(x,y){let i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;if(i<0||i>=198||j<0||j>=191)return 0;return (1-v)*((1-u)*g[j*199+i]+u*g[j*199+i+1])+v*((1-u)*g[(j+1)*199+i]+u*g[(j+1)*199+i+1])}
 let labels=new Int32Array(stock.length).fill(-1),nodes=[],roots=[];
 for(let y=H-1;y>=Y;y--){let lab=new Int32Array(stock.length).fill(-1),next=[];for(let i=y*W;i<stock.length;i++){if(!stock[i]||lab[i]>=0)continue;let q=[i];lab[i]=i;for(let t=0;t<q.length;t++){let p=q[t],x=p%W,yy=Math.floor(p/W);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;let j=(yy+dy)*W+x+dx;if(x+dx<0||x+dx>=W||yy+dy<y||yy+dy>=H||!stock[j]||lab[j]>=0)continue;lab[j]=i;q.push(j)}}let own=q.filter(p=>Math.floor(p/W)===y),kids=[...new Set(q.map(p=>labels[p]).filter(id=>id>=0))];let id;if(!own.length){if(kids.length!==1)throw Error("unchanged component");id=kids[0]}else{id=nodes.length;nodes.push({y,own,kids,all:q})}for(let p of q)lab[p]=id;next.push(id)}labels=lab;roots=next}
 function cross(lists){let a=[[]];for(const l of lists)a=a.flatMap(x=>l.map(y=>x.concat(y)));return a}
 const choices=[];for(let i=0;i<nodes.length;i++)choices.push([[i],...cross(nodes[i].kids.map(k=>choices[k]))]);
 const models=cross(roots.map(k=>choices[k])).map(cuts=>({cuts,removed:cuts.flatMap(k=>nodes[k].all).sort((a,b)=>a-b)}));
 const distinct=new Set(models.map(m=>m.removed.join(",")));if(distinct.size!==models.length)throw Error("duplicate raster");
 const signature=id=>{let n=nodes[id];return [n.y,Math.min(...n.own.map(p=>p%W)),Math.max(...n.own.map(p=>p%W)),n.all.length]};
 function score(target){let base=0,adds=0;for(let i=Y*W;i<stock.length;i++){base+=stock[i]!==target[i];adds+=!stock[i]&&!!target[i]}let ranking=models.map((m,i)=>({i,error:base+m.removed.reduce((s,p)=>s+2*target[p]-1,0)})).sort((a,b)=>a.error-b.error);const best=ranking[0].error,winners=ranking.filter(x=>x.error===best);let gap=ranking.find(x=>x.error>best)?.error-best;return {base,adds,best,gap,winners:winners.map(x=>x.i)}}
 const controls=[];for(const id of [-1,...nodes.flatMap((n,i)=>n.kids.length>1?n.kids:[])]){let target=stock.slice();let removed=id<0?[]:nodes[id].all;removed.forEach(p=>target[p]=0);let r=score(target);if(r.best||r.winners.length!==1||models[r.winners[0]].removed.join(",")!==removed.slice().sort((a,b)=>a-b).join(","))throw Error("plant failure");controls.push({removed:removed.length,cut:id<0?null:signature(id),exact:true})}
 const fits=[[.84549,.84596,-6.390,45.343],[.84484,.84308,-6.461,45.558],[.8434580498835607,.8444254856468015,-6.269179940310348,45.459292324694964]],trials=[];
 for(const [fit,[sx,sy,tx,ty]] of fits.entries())for(const dx of [-.5,0,.5])for(const dy of [-.5,0,.5])for(const threshold of [.3,.4,.5,.6,.7]){
  const target=Uint8Array.from(stock,(s,i)=>i<Y*W?s:+(sample((i%W-tx-dx)/sx,(Math.floor(i/W)-ty-dy)/sy)>=threshold));let r=score(target);
  const winners=r.winners.map(i=>{const m=models[i],cut=Math.min(...m.removed.map(p=>Math.floor(p/W)));let horizontal=Number.isFinite(cut)&&m.removed.length===stock.slice(cut*W).reduce((a,b)=>a+b,0);return {cuts:m.cuts.map(signature),removed:m.removed.length,horizontal:horizontal?cut:null}});
  trials.push({fit,dx,dy,threshold,base:r.base,unavoidableAdds:r.adds,best:r.best,secondGap:r.gap,winners});
 }
 const histogram={};let nonHorizontal=0,ties=0;for(const t of trials){if(t.winners.length>1)ties++;for(const q of t.winners){if(q.horizontal===null)nonHorizontal++;let key=String(q.horizontal);histogram[key]=(histogram[key]||0)+1}}
 return {nodes:nodes.length,roots:roots.length,models:models.length,forks:nodes.filter(n=>n.kids.length>1).map(n=>({row:n.y,children:n.kids.map(signature)})),controls,summary:{trials:trials.length,histogram,ties,nonHorizontal,minGap:Math.min(...trials.map(t=>t.secondGap)),maxGap:Math.max(...trials.map(t=>t.secondGap))},nominal:trials.filter(t=>!t.dx&&!t.dy&&t.threshold===.5),trials}
}
const root=path.resolve(__dirname,'..');
const files=['lp2-tree-common-stock-mask.b64','lp2-p55-contour-inverse-mask.b64'];
const bytes=files.map(f=>Buffer.from(fs.readFileSync(path.join(root,'im-results',f),'utf8'),'base64'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(bytes[0]),'41d234747acf055667b789c6bdd8c72aaccf7e4414468d1c5e2ae2e6fd1d126d');
console.log(JSON.stringify(study(...bytes),null,2));
