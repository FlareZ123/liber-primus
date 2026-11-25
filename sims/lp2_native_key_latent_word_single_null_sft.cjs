"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const run=require("./lp2_native_key_latent_word_single_null_core.cjs"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),true);
assert(result.model.gate);assert.deepEqual(result.controls.map(c=>c.correct),[509,770,748,315,509,772,750,318]);console.log(JSON.stringify(result));
