'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const ref='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const files=[['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']];
async function main(){
for(const [name,bytes,sha] of files){
 const raw=Buffer.from(await (await fetch('https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name))).arrayBuffer());
 assert.equal(raw.length,bytes);assert.equal(crypto.createHash('sha1').update('blob '+bytes+'\0').update(raw).digest('hex'),sha);
 const lines=raw.toString('latin1').split(/\r?\n/),eligible=[],hits=[];
 for(let i=0;i<lines.length;i++){
   const s=lines[i];if(!/^2014 (Jan|Feb|Mar|Apr) /.test(s))continue;
   if(!/\t|<|\]/.test(s))continue;
   if(!/\b(?:next|future|later|upcoming|eventual(?:ly)?|remaining|another|more|rest of|other half|will|going to|gonna|expect|predict|bet|probably)\b/i.test(s))continue;
   if(!/\b(?:pages?|book|manuscript|runes?|gematria|liber primus|cipher|encipher|decode|decrypt|keyword|key|keyspace|puzzle|clue|instruction|step|level|phase|release)\b/i.test(s))continue;
   eligible.push(i);
   const high=/\b(?:page|book|manuscript|rune|gematria|liber primus)\w*\b/i.test(s)&&/\b(?:next|future|later|upcoming|remaining|more|rest of|other half|will|going to|gonna|expect|predict|bet|probably)\b/i.test(s);
   const operation=/\b(?:cipher|key|encrypt|decrypt|decode|index|offset|rotate|reverse|mirror|transpos|vigenere|prime|totient|number|matrix|hash|pad|book code|coordinate|stegan|shamir|base\d+|xor|format|alphabet|image|outguess|word|letter|read|combine|sequence|order|derive|hidden|hidden message|direction)\w*\b/i.test(s);
   if(high&&operation)hits.push(i);
 }
 console.log('SOURCE '+name+' eligible='+eligible.length+' specific='+hits.length);
 const selected=name.startsWith('#cicada')?[23453,34027,36718,88601]:[66169,64690];
 for(const n of selected){console.log('PREDICTION CONTEXT '+n);for(let j=n-14;j<=n+14;j++)console.log('L'+j+' '+lines[j-1].slice(0,500));}
 if(process.env.ONLY_CONTEXT==='1')continue;
 const groups={Jan:[],Feb:[],Mar:[],Apr:[]};for(const i of hits)groups[lines[i].slice(5,8)].push(i);
 for(const [month,ids] of Object.entries(groups)){
   console.log('MONTH '+month+' hits '+ids.length);
   // Prioritize genuinely forward-looking exact predictions with named operation, not solved-result reports.
   const ranked=ids.map(i=>[i,(/(?:next|remaining|more|rest of|future|upcoming)\s+(?:\w+\s+){0,2}(?:pages?|book|runes?|chapter|section)/i.test(lines[i])?5:0)+(/(?:will|expect|predict|bet|probably|going to|gonna)\b/i.test(lines[i])?2:0)+(/(?:prime|totient|vigenere|matrix|shamir|book code|base\d+|xor|outguess|transpos|rotate|reverse|hash|pad)/i.test(lines[i])?2:0)+(/(?:because|since|hint|clue|said|says|means|suggest|refers|saw|seen)/i.test(lines[i])?2:0)]).sort((a,b)=>b[1]-a[1]||a[0]-b[0]);
   for(const [i,score] of ranked.slice(0,24))console.log('L'+(i+1)+' score='+score+' '+lines[i].slice(0,360));
 }
}
}
main().catch(e=>{console.error(e);process.exitCode=1});
