// Generate the carry-free derivative without editing the shared exact solver.
const fs=require("node:fs"),crypto=require("node:crypto"),path=require("node:path");
const dir=__dirname,base=fs.readFileSync(path.join(dir,"lp2_shared_gp29_q8_moment_completion_sft.cpp"),"utf8");
const blob=crypto.createHash("sha1").update("blob "+Buffer.byteLength(base)+"\0").update(base).digest("hex");
if(blob!=="504619d3d8f148ac8700011bcac197ed2ceb3d56")throw Error("unexpected shared solver revision "+blob);
const needle="string w;if(!scheduledWord(47,m,w)||!fixed::prefixDict.count(w))return;";
if(base.split(needle).length!==2)throw Error("mandatory carry check not uniquely identified");
const patched=base.replace(needle,"string w; // carry withheld by derivative");
const driver=fs.readFileSync(path.join(dir,"lp2_q8_carryfree_continuous_driver.cpp"),"utf8");
fs.writeFileSync(path.join(dir,".lp2_q8_carryfree_continuous.generated.cpp"),"#define LP2_MOMENT_COMPLETION_NO_MAIN\n"+patched+"\n"+driver);
