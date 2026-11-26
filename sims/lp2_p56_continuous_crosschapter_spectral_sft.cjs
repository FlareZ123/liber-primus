'use strict';
const fs=require('node:fs'),path=require('node:path');
const {study,paths}=require('./lp2_p56_primeclock_spectral_pool_sft.cjs');
const output=study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),48,42,true);
const out=JSON.stringify(output,null,2);
console.log(out);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),out+'\n');
