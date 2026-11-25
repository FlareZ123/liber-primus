module.exports=function holdRecover(C,hits,train,fitN){
 const mod=x=>((x%29)+29)%29;const big=Array.from({length:30},()=>Array(29).fill(1));for(let i=1;i<train.length;i++)big[train[i-1]][train[i]]++;const ll=big.map(a=>{const n=a.reduce((s,v)=>s+v,0);return a.map(v=>Math.log(v/n))});
 function perms(a){return a.length?a.flatMap((v,i)=>perms(a.filter((_,j)=>j!==i)).map(b=>[v,...b])):[[]]}
 function edges(T){const N=T.length,out=Array.from({length:N},()=>[]);for(let i=0;i<N;i++){if(T[i]===0)out[i].push({end:i+1,hold:true});function rec(p,idx,v){if(v.length===4){out[i].push({end:p,idx,v});return}if(p===N)return;if(T[p]===0&&v.length)rec(p+1,idx,v);rec(p+1,[...idx,p], [...v,T[p]])}rec(i,[],[])}return out}
 function solve(T,order,backtrack=false){
 const N=T.length,ed=edges(T),D=Array.from({length:N+1},()=>new Float64Array(30).fill(-Infinity)),B=Array.from({length:N+1},()=>Array(30)),suffix=Array(N+1).fill(0);for(let i=N-1;i>=0;i--)suffix[i]=suffix[i+1]+(T[i]!==0);D[0][29]=0;let best={score:-Infinity};
 function add(i,prev,emit,end,terminal){let sc=D[i][prev],last=prev;for(const x of emit){sc+=ll[last][x];last=x}if(terminal){if(sc>best.score)best={score:sc,i,prev,tail:emit}}else if(sc>D[end][last]){D[end][last]=sc;if(backtrack)B[end][last]={i,prev,emit}}}
 for(let i=0;i<=N;i++){for(let prev=0;prev<30;prev++){if(!Number.isFinite(D[i][prev]))continue;if(suffix[i]<=3)add(i,prev,T.slice(i),N,true);if(i===N)continue;for(const e of ed[i]){if(e.hold){add(i,prev,[0],e.end,false);continue}const pp=order.map(({r,a,b})=>mod(a*r.reduce((s,x,j)=>s+x*e.v[j],0)+b));if(pp.includes(0))continue;const emit=Array(e.end-i).fill(0);e.idx.forEach((p,j)=>emit[p-i]=pp[j]);add(i,prev,emit,e.end,false)}}}
 if(!backtrack||!Number.isFinite(best.score))return best;
 let {i,prev}=best;const parts=[best.tail];while(i>0){const b=B[i][prev];if(!b)throw Error("backtrace");parts.push(b.emit);i=b.i;prev=b.prev}return{...best,plain:parts.reverse().flat()}
 }
 // Fit lane order on the first 1000 physical runes; tail convention copy, even if truncated inside a block.
 let fits=perms(hits).map(order=>({order,fit:solve(C.slice(0,fitN),order).score})).sort((a,b)=>b.fit-a.fit);if(!Number.isFinite(fits[0].fit))throw Error("no fit");const final=solve(C,fits[0].order,true);return{order:fits[0].order,fitScore:fits[0].fit,score:final.score,plain:final.plain}
};
