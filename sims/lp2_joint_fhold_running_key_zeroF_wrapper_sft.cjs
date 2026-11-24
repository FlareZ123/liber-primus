'use strict';
const fs=require('node:fs'),path=require('node:path');
const {experiment,files}=require('./lp2_joint_fhold_running_key_stationary_bayes_sft.cjs');
const raw=[...files,'resources/liber-primus/lp2-grid-256.json'].map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
const result=experiment(raw);
console.log(JSON.stringify(process.argv.includes('--full')?result:result.summary,null,2));
