"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const run=require("./lp2_q8_latent_word_key_recovery_core.cjs"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),true);
assert.equal(result.model.gate,false);assert.deepEqual(result.controls.map(c=>c.twoDisjoint),[6,463,1794,557]);console.log(JSON.stringify(result));
