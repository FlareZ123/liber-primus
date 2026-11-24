"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const {enc,train,score,gate,exactFit} = require("./lp2_continuous_base29_unitcarry_fhold_sft.cjs");

const M = 3301, CTX = 900, CAP = 4*M;
const inv = new Int16Array(29);
for (let a=1;a<29;a++) for (let x=1;x<29;x++) if (a*x%29===1) inv[a]=x;

/** A 30x30 previous-plaintext context, with rune29 as initial sentinel. */
function preparedLM(lm) {
    const table = new Float64Array(CTX*29);
    const advance = new Uint16Array(CTX*29);
    for(let ctx=0;ctx<CTX;ctx++) {
        const x=(ctx/30)|0, y=ctx%30;
        for(let p=0;p<29;p++) {
            const i=ctx*29+p;
            table[i]=y===29?lm.u[p]:x===29?lm.b[y*29+p]:lm.t[(x*29+y)*29+p];
            advance[i]=y*30+p;
        }
    }
    return {table,advance};
}

function buffer() {
    return {
        carry:new Int16Array(CAP), ctx:new Uint16Array(CAP),
        score:new Float64Array(CAP), origin:new Int16Array(CAP),
        parent:new Int32Array(CAP), rune:new Uint8Array(CAP),
    };
}

/**
 * Exact Viterbi over latent-F holds and compact BASE29 carries.
 * For a fixed end carry, each of the last two printed runes has at most
 * two reverse predecessors (consuming / literal F). Hence <=4 contexts per carry.
 * Max-score merge is exact: future transitions and trigram increments depend
 * only on carry and the two most recent plaintext runes.
 */
function engine(lm) {
    const {table,advance}=preparedLM(lm);
    const byKey=new Int32Array(M*CTX);
    let cur=buffer(), next=buffer();
    let work=0;
    function run(c,a,sign,fitN=c.length,start=null,record=false) {
        assert.ok(a>0&&a<=M&&a%29!==0);
        const iv=inv[a%29];
        let n=start?1:a;
        for(let j=0;j<n;j++){
            cur.carry[j]=start?start.carry:j;
            cur.ctx[j]=start?start.ctx:899;
            cur.score[j]=0;cur.origin[j]=cur.carry[j];
        }
        const parents=[], runes=[];
        let fit=null,peak=n;
        function bestOf(v,n) {
            if(n===0)return null;
            let j=0;for(let k=1;k<n;k++)if(v.score[k]>v.score[j])j=k;
            return {a,s:v.origin[j],end:v.carry[j],ctx:v.ctx[j],val:v.score[j],index:j};
        }
        for(let i=0;i<c.length;i++) {
            const z=c[i], y=sign===1?z:28-z;
            let m=0;
            function add(j,p,s) {
                const q=cur.ctx[j]*29+p;
                const k=advance[q], id=s*CTX+k;
                const v=cur.score[j]+table[q];
                let h=byKey[id]-1;
                if(h>=0&&next.score[h]>=v)return;
                if(h<0){h=m++;byKey[id]=h+1;}
                if(m>CAP)throw Error("context bound violated");
                next.carry[h]=s;next.ctx[h]=k;next.score[h]=v;next.origin[h]=cur.origin[j];
                if(record){next.parent[h]=j;next.rune[h]=p;}
            }
            for(let j=0;j<n;j++){
                const s=cur.carry[j];
                const p=((y-s%29+29)*iv)%29;
                if(p!==0)add(j,p,(a*p+s-y)/29);
                if(z===0)add(j,0,s);
            }
            work+=n;
            for(let j=0;j<m;j++)byKey[next.carry[j]*CTX+next.ctx[j]]=0;
            if(record){parents.push(next.parent.slice(0,m));runes.push(next.rune.slice(0,m));}
            const swap=cur;cur=next;next=swap;n=m;peak=Math.max(peak,n);
            if(i+1===fitN)fit=bestOf(cur,n);
            if(!n)break;
        }
        const full=bestOf(cur,n);
        if(record&&full){
            let j=full.index;const p=new Array(c.length);
            for(let i=c.length-1;i>=0;i--){p[i]=runes[i][j];j=parents[i][j];}
            full.p=p;
        }
        return {fit,full,peak};
    }
    return {run,work:()=>work};
}

function optimize(c,sign,lm,fitN=262,lo=1,hi=M+1) {
    const v=engine(lm);let bestFit=null,bestFull=null,fitKeys=0,fullKeys=0,peak=0;
    for(let a=lo;a<hi;a++) {
        if(a%29===0)continue;
        const z=v.run(c,a,sign,fitN);
        if(z.fit){fitKeys++;if(!bestFit||z.fit.val>bestFit.val)bestFit=z.fit;}
        if(z.full){fullKeys++;if(!bestFull||z.full.val>bestFull.val)bestFull=z.full;}
        peak=Math.max(peak,z.peak);
    }
    const prefix=c.slice(0,fitN),tail=c.slice(fitN);
    function recover(source,key){
        if(!key)return null;
        const b=v.run(source,key.a,sign,source.length,null,true).full;
        assert.ok(Math.abs(b.val-key.val)<1e-8);assert.equal(b.s,key.s);assert.equal(b.end,key.end);assert.equal(b.ctx,key.ctx);
        const x=enc(b.p,b.a,b.s,sign);assert.deepEqual(x.c,source);assert.equal(x.s,b.end);
        assert.ok(Math.abs(score(b.p,lm)-b.val)<1e-8);
        return b;
    }
    const fit=recover(prefix,bestFit),full=recover(c,bestFull);
    let hold=null;
    if(fit){
        hold=v.run(tail,fit.a,sign,tail.length,{carry:fit.end,ctx:fit.ctx},true).full;
        if(hold){
            const x=enc(hold.p,fit.a,fit.end,sign);assert.deepEqual(x.c,tail);assert.equal(x.s,hold.end);
            assert.ok(Math.abs(score(fit.p.concat(hold.p),lm)-fit.val-hold.val)<1e-8);
        }
    }
    return {fit,hold,full,fitKeys,fullKeys,peak,work:v.work()};
}

function main(){
    const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
    const nat=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));
    const source=nat.sections.map(x=>({name:x.name,p:[...x.source_text].map(r=>nat.runes.indexOf(r)).filter(n=>n>=0)}));
    const orient=(p,dir)=>dir===1?p:p.slice().reverse();
    const text=(p,dir)=>p?orient(p,dir).slice(0,120).map(x=>corpus.translit[x]).join(""):null;
    const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices);assert.equal(opening.length,729);
    const tiny=corpus.pages.slice(54,56).flatMap(p=>p.indices).slice(0,232);
    const lm0=train(source.map(x=>x.p));
    for(const sign of [1,-1]){
        const a=1033,g=gate(tiny,sign,a,a+1),old=exactFit(tiny,sign,lm0,g);
        const newResult=engine(lm0).run(tiny,a,sign,tiny.length,null,true).full;
        assert.equal(Boolean(old.best),Boolean(newResult));
        if(old.best)assert.ok(Math.abs(old.best.val-newResult.val)<1e-8);
    }
    console.log("Exact history-vs-Viterbi calibration passed");
    for(const dir of [1,-1])for(const sign of [1,-1]){
        const c=orient(opening,dir),lm=train(source.map(x=>orient(x.p,dir))),start=Date.now();
        const z=optimize(c,sign,lm);
        const strip=b=>b?{...b,p:undefined}:null;
        console.log(JSON.stringify({case:"original",dir,sign,fitN:262,holdN:467,fitZeros:c.slice(0,262).filter(x=>x===0).length,fit:strip(z.fit),hold:strip(z.hold),full:strip(z.full),fullOpening:text(z.full?.p,dir),fitKeys:z.fitKeys,fullKeys:z.fullKeys,peak:z.peak,work:z.work,seconds:(Date.now()-start)/1000}));
    }
    for(const [name,dir,sign,a,s] of [["0_koan_1",1,1,1033,761],["0_loss_of_divinity",-1,-1,3299,1764]]){
        const p=orient(source.find(x=>x.name===name).p,dir).slice(0,729);assert.equal(p.length,729);
        const c=enc(p,a,s,sign).c,lm=train(source.filter(x=>x.name!==name).map(x=>orient(x.p,dir))),start=Date.now();
        const z=optimize(c,sign,lm),strip=b=>b?{...b,p:undefined}:null;
        console.log(JSON.stringify({case:"plant",name,dir,sign,trueA:a,trueS:s,fitN:262,holdN:467,fit:strip(z.fit),hold:strip(z.hold),full:strip(z.full),fitCorrect:z.fit?.p.filter((x,i)=>x===p[i]).length??0,holdCorrect:z.hold?.p.filter((x,i)=>x===p[262+i]).length??0,fullCorrect:z.full?.p.filter((x,i)=>x===p[i]).length??0,fitKeys:z.fitKeys,fullKeys:z.fullKeys,peak:z.peak,work:z.work,seconds:(Date.now()-start)/1000}));
    }
}
if(require.main===module)main();
module.exports={engine,optimize,preparedLM};
