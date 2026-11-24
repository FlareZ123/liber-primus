'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),gp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).slice(1408,7408);
assert.equal(tape.length,6000);let hash=2166136261;for(const x of tape)hash=Math.imul(hash^x,16777619)>>>0;assert.equal(hash,3382196842);
const q=Number(process.argv[2]||8),lo=Number(process.argv[3]||0),hi=Number(process.argv[4]||29);assert([7,8].includes(q)&&lo>=0&&hi<=29&&lo<hi);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lp-box-'));try{
 const exe=path.join(dir,process.platform==='win32'?'gate.exe':'gate'),input=path.join(dir,'tape.txt');
 fs.writeFileSync(input,tape.map(x=>x.toString(29).toUpperCase()).join(''));
 cp.execFileSync('g++',['-O3','-std=c++17',path.join(__dirname,'lp2_mixed_affine_lag7_8_box_gate.cpp'),'-o',exe],{stdio:'inherit'});
 const out=cp.execFileSync(exe,[String(q),'30000',String(lo),String(hi),input],{encoding:'utf8',maxBuffer:16*1024*1024});
 process.stdout.write(out);
 const rows=out.trim().split(/\r?\n/).filter(x=>x.startsWith('A ')).map(x=>x.split(/\s+/).slice(1,8).map(Number));
 const expected=JSON.parse(fs.readFileSync(path.join(root,'im-results/lp2-mixed-affine-lag7-8-box-gate-output.json'),'utf8')).lags.find(x=>x.q===q).shards.slice(lo,hi);
 assert.deepEqual(rows,expected);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
