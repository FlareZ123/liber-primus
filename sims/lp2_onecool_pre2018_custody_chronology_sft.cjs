"use strict";

const {execFileSync}=require("node:child_process");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const OLD="https://gitlab.com/onecool/3301-public.git";
const LP="https://gitlab.com/onecool/liber_primus.git";

/** @param {string} cwd @param {string[]} args */
function git(cwd,args){
  return execFileSync("git",["-C",cwd,...args],{encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024});
}
/** @param {string} s */
function lines(s){return s.split(/\r?\n/).filter(Boolean);}
/** @param {string} dir */
function commits(dir){
  return lines(git(dir,["log","--all","--reverse","--format=%H%x09%P%x09%aI%x09%an%x09%ae%x09%s"])).map(line=>{
    const [sha,parents,authored_at,author_name,author_email,...rest]=line.split("\t");
    return {sha,parents:parents?parents.split(" "):[],authored_at,author_name,author_email,subject:rest.join("\t")};
  });
}
/** @param {string} dir @param {string} rev */
function tree(dir,rev){
  const out=new Map();
  for(const line of lines(git(dir,["ls-tree","-r",rev]))){
    const m=line.match(/^\d+\s+\w+\s+([0-9a-f]{40})\t(.+)$/);
    if(m) out.set(m[2],m[1]);
  }
  return out;
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-custody-"));
  const old=path.join(tmp,"old.git"), lp=path.join(tmp,"lp.git");
  execFileSync("git",["clone","--mirror",OLD,old],{encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024});
  execFileSync("git",["clone","--mirror",LP,lp],{encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024});

  const lpTip=git(lp,["rev-parse","refs/heads/master"]).trim();
  const lpTree=tree(lp,lpTip);
  const targets=[];
  for(let i=0;i<=57;i++){
    const p=`liber_primus_full/${i}.jpg`;
    const oid=lpTree.get(p);
    if(!oid) throw new Error("missing LP target "+p);
    targets.push({name:`${i}.jpg`,lp_path:p,oid});
  }
  const gem=lpTree.get("liber_primus_full/gematria.jpg");
  if(!gem) throw new Error("missing gematria target");
  targets.push({name:"gematria.jpg",lp_path:"liber_primus_full/gematria.jpg",oid:gem});

  const history=commits(old);
  const firstSeen=new Map();
  const timeline=[];
  for(const c of history){
    const t=tree(old,c.sha);
    const byOid=new Map();
    for(const [p,oid] of t){
      if(!byOid.has(oid)) byOid.set(oid,[]);
      byOid.get(oid).push(p);
    }
    const matches=[];
    for(const target of targets){
      const paths=byOid.get(target.oid)||[];
      if(paths.length){
        matches.push({name:target.name,oid:target.oid,paths});
        if(!firstSeen.has(target.name)) firstSeen.set(target.name,{...c,paths,oid:target.oid});
      }
    }
    timeline.push({
      ...c,
      target_match_count:matches.length,
      matched_names:matches.map(x=>x.name),
      lp_named_paths:[...t.keys()].filter(p=>/(liber|primus|rune|gematria|decrypt)/i.test(p))
    });
  }

  const groupedFirstSeen={};
  for(const target of targets){
    const f=firstSeen.get(target.name);
    const key=f?f.sha:"MISSING";
    if(!groupedFirstSeen[key]) groupedFirstSeen[key]={commit:f?{
      sha:f.sha,parents:f.parents,authored_at:f.authored_at,author_name:f.author_name,
      author_email:f.author_email,subject:f.subject
    }:null,names:[]};
    groupedFirstSeen[key].names.push(target.name);
  }

  const allPresent=timeline.find(x=>x.target_match_count===targets.length)||null;
  const out={
    generated_at:new Date().toISOString(),
    old_repo:OLD,
    lp_repo:LP,
    lp_tip:lpTip,
    target_count:targets.length,
    old_commit_count:history.length,
    old_history:history,
    custody_timeline:timeline,
    first_seen_groups:Object.values(groupedFirstSeen),
    first_commit_with_all_targets:allPresent,
  };
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"custody-chronology-output.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify({
    target_count:out.target_count,
    old_commit_count:out.old_commit_count,
    old_history:out.old_history,
    first_seen_groups:out.first_seen_groups,
    first_commit_with_all_targets:out.first_commit_with_all_targets && {
      sha:out.first_commit_with_all_targets.sha,
      authored_at:out.first_commit_with_all_targets.authored_at,
      author_name:out.first_commit_with_all_targets.author_name,
      author_email:out.first_commit_with_all_targets.author_email,
      subject:out.first_commit_with_all_targets.subject,
      target_match_count:out.first_commit_with_all_targets.target_match_count
    },
    timeline:out.custody_timeline.map(x=>({
      sha:x.sha,authored_at:x.authored_at,subject:x.subject,target_match_count:x.target_match_count,
      lp_named_path_count:x.lp_named_paths.length
    }))
  },null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
