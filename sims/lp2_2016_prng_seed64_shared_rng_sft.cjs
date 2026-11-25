"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {mtFloats,reachInterval,pairedInterval,plant}=require("./lp2_shared_rng_rejection_marginal_sft.cjs");
const load=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function run(corpus,signed,transcript){
 const words=signed.slice(signed.indexOf("Hello."),signed.indexOf("-----BEGIN PGP SIGNATURE-----")).match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g);
 const phrase=words.slice(words.indexOf("Its"),words.indexOf("Its")+16);
 assert.deepEqual(phrase,["Its","words","are","the","map","their","meaning","is","the","road","and","their","numbers","are","the","direction"]);
 const alpha=corpus.translit.map((t,i)=>[t.toLowerCase(),i]).sort((a,b)=>b[0].length-a[0].length);
 const lines=transcript.split("%").flatMap(p=>p.split("/")).map(l=>Array.from(l.matchAll(/[ᚠ-᛿]/gu),x=>x[0])).filter(x=>x.length);
 const toks=phrase.map(w=>{w=w.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");let sum=0;while(w){const e=alpha.find(([t])=>w.startsWith(t));assert.ok(e,w);sum+=corpus.prime[e[1]];w=w.slice(e[0].length)}return corpus.runes.indexOf(lines[sum%29][Math.floor(sum/29)])});
 assert.deepEqual(toks.map(i=>corpus.translit[i]),["L","C","B","P","P","R","NG","NG","P","A","R","R","TH","B","P","C"]);
 const seed=toks.filter((_,i)=>i<4||i>6).reduce((n,d)=>n*29n+BigInt(d),0n);
 assert.equal(seed,7144649572585460758n);
 const checks=[{seed,expect:[0.4317248505109804,0.29526049247487274,0.9380667861929423,0.2740332047341614]},{seed:1849819173n,expect:[0.7694718902281051,0.8522628620010828,0.10488370940766134,0.5468385887233294]},{seed:79228162514264337593544243637n,expect:[0.5062111155171158,0.7032864498471779,0.17647766734680026,0.3617250379544711]}];
 for(const x of checks)assert.deepEqual(Array.from(mtFloats(x.seed,4)),x.expect);
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 assert.equal(C.length,12956);
 const P=Array.from(mtFloats(0x3301,C.length),x=>Math.floor(x*29)),E=plant(P,mtFloats(seed,C.length+1602),.81288),control=reachInterval(E.C,seed);
 assert.ok(control.complete&&control.intervals.some(([l,h])=>l<.81288&&.81288<=h));
 return {seed:seed.toString(),tokens:toks.map(i=>corpus.translit[i]),CPythonVectorChecks:checks.length,control,original:[{schedule:"conditional",...reachInterval(C,seed)},{schedule:"paired key first",...pairedInterval(C,seed,false)},{schedule:"paired coin first",...pairedInterval(C,seed,true)}]};
}
module.exports={run};
if(require.main===module)console.log(JSON.stringify(run(JSON.parse(load("resources/liber-primus/lp2-corpus.json")),load("resources/historical/cicada2016-4gq25-outguess.asc"),load("resources/lp2-transcription.txt")),null,2));
