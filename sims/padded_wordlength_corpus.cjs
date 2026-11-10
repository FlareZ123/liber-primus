"use strict";
/**
 * Search a fixed Gutendex topic/page selection for long plaintext-source
 * word-length fingerprints in LP2, permitting zero or one extra rune per
 * ciphertext word. Every selected source is public-domain English text.
 *
 * Only independently recovered plaintext / keys should be promoted to
 * established research. This is an exploratory quote discovery instrument.
 *
 * Node.js >=22, opt-in CI only. No filesystem writes or dependencies.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {runeWords,parseMaster,runeLength,englishWords}=require("./wordlength_crib_scan.js");
const ROOT=path.resolve(__dirname,"..");
const MASTER=fs.readFileSync(path.join(ROOT,"resources/transcriptions/liber_primus_master.txt"),"utf8");
const TARGET=parseMaster(MASTER).cipherLengths;
const K=6,BASE=32;
const REPOS=[
  "The-KybalionA-Study-of-The-Hermetic-Philosophy-of-Ancient-Egypt-and-Greece_14209",
  "An-Outline-of-Occult-Science_30718",
  "Clairvoyance-and-Occult-Powers_12480",
  "Occultism-and-Common-Sense_36730",
  "Occult-ChemistryClairvoyant-Observations-on-the-Chemical-Elements_16058",
  "Hidden-Symbolism-of-Alchemy-and-the-Occult-Arts_27755",
  "Studies-in-Occultism--A-Series-of-Reprints-from-the-Writings-of-H.-P.-BlavatskyArts-The-Bless__17009",
  "Some-Turns-of-Thought-in-Modern-PhilosophyFive-Essays_16712",
  "Initiation-into-Philosophy_9304",
  "The-Consolation-of-Philosophy_14328",
  "The-Problems-of-Philosophy_5827",
  "The-Philosophy-of-Spinoza_31205",
  "The-Essence-of-Buddhism_18223",
  "Outlines-of-Mahayana-Buddhism_75283",
  "Zen-Buddhismand-Its-Relation-to-Art_43273",
  "Essays-in-Zen-Buddhism-b-First-series_71157",
  "Buddhism-in-the-Modern-World_44607",
  "The-Metaphysic-of-Christianity-and-Buddhism-A-symphony_48028",
  "A-Series-of-Lessons-in-Gnani-Yoga--The-Yoga-of-Wisdom_13407",
  "An-Introduction-to-Yoga_4278",
  "A-Series-of-Lessons-in-Raja-Yoga_13656",
  "The-Yoga-Sutras-of-Patanjali--The-Book-of-the-Spiritual-Man_2526",
  "Jnana-Yoga-Part-II-Seven-Lectures_72368",
  "Thus-Spake-Zarathustra--A-Book-for-All-and-None_1998",
  "Beyond-Good-and-Evil_4363",
  "The-Joyful-Wisdom-La-Gaya-Scienza_52881",
  "The-Dawn-of-Day_39955",
  "Plato-and-Platonism_4095",
  "The-Republic-of-Plato_55201",
  "Parmenides_1687",
  "Gorgias_57145",
  "Theaetetus_1726",
  "Cratylus_1616",
  "Laws_1750",
  "The-Upanishads_3283",
  "The-Gnostic-Crucifixion_35735",
  "Christian-Mysticism_14596",
  "Mysticism-in-English-Literature_11935",
  "Nature-Mysticism_18539",
  "The-essentials-of-mysticism-and-other-essays_74203",
  "Mysticism-and-Logic-and-Other-Essays_25447",
  "Practical-Mysticism--13-A-Little-Book-for-Normal-People_21774",
  "Alchemy--Ancient-and-ModernTheir-Relations-to-Mysticism-on-the-One-Hand-and-..._43240",
  "Gleaning-of-a-Mystic-A-Series-of-Essays-on-Practical-Mysticism_54407",
  "Mysticism-and-its-ResultsBeing-an-Inquiry-into-the-Uses-and-Abuses-of-Secrecy_22314",
  "Sacred-Books-of-the-East_12894",
  "The-Sacred-Wood-Essays-on-Poetry-and-Criticism_57795",
  "The-Sacred-Tree-or-the-tree-in-religion-and-myth_47215",
  "Sacred-Mysteries-Among-the-Mayas-and-the-Quiches-11-500-Years-Ago_57458",
  "The-Vedanta-Sutras-with-the-Commentary-by-Ramanuja-Sacred-Books-of-the-East-Volume-48_7297",
  "Elementary-Theosophy_30134",
  "A-Textbook-of-Theosophy_12902",
  "Five-Years-of-Theosophy_14378",
  "The-Ocean-of-Theosophy_54268",
  "The-Beautiful-Necessity--13-Seven-Essays-on-Theosophy-and-Architecture_12648",
  "Theosophy-and-Life-s-Deeper-Problems-Being-the-Four-Convention-Lectures-Delivered-in-Bombay-a__55940",
  "The-Key-to-Theosophy-Being-A-Clear-Exposition-In-The-Form-Of-Question-And-Answer-Of-The-Ethic__55618",
  "Echoes-From-The-Orient-A-Broad-Outline-of-Theosophical-Doctrines_57292",
  "The-Tao-Teh-King-or-the-Tao-and-its-Characteristics_216",
  "The-Gist-of-Swedenborg_15768",
  "Spiritual-Life-and-the-Word-of-God_14026",
  "Angelic-Wisdom-about-Divine-Providence_18507",
  "Angelic-Wisdom-Concerning-the-Divine-Love-and-the-Divine-Wisdom_16627",
  "Heaven-and-its-Wonders-and-Hell_17368",
  "The-Delights-of-Wisdom-Pertaining-to-Conjugial-Love--13-To-Which-is-Added-The-Pleasures-of-In__11248",
  "Meditations_2680",
  "Prayers-and-Meditations_16984",
  "The-Ruins--Or-Meditation-on-the-Revolutions-of-Empires-and-the-Law-of-Nature_1397",
  "A-New-Light-of-Alchymie-Taken-out-of-the-Fountaine-of-Nature-and-Manuall-Experience-Etc_61112",
  "The-Mesnevi_61724",
  "The-Festival-of-Spring-from-the-Divan-of-Jelaleddin_57068",
  "Jal-lu-d-d-n-R-m-The-Persian-Mystics_45159",
  "The-Kabbalah-its-doctrines-development-and-literature_69243",
  "The-Song-Celestial--Or-Bhagavad-G-t---from-the-Mah-bh-rata---13-Being-a-discourse-between-Arju__2388",
  "The-Buddha-s-Path-of-VirtueA-Translation-of-the-Dhammapada_35185",
  "Dhammapada-a-Collection-of-Verses--Being-One-of-the-Canonical-Books-of-the-Buddhists_2017",
  "The-King-James-Bible_10900",
  "The-Bible-Of-Bibles-Or-Twenty-Seven--Divine--Revelations-_43550",
  "The-suppressed-Gospels-and-Epistles-of-the-original-New-Testament-of-Jesus-the-Christ-Complete_6516",
  "All-Four-Gospels-for-Readers_6531",
  "The-Rosicrucian-Mysteries--13-An-Elementary-Exposition-of-Their-Secret-Teachings_29855",
  "Mysteries-of-the-Rosie-CrossOr-the-History-of-that-Curious-Sect-of-the-Middle-Ages-Known-as-t__35350",
  "The-Secret-Doctrine-Vol-1-of-4_54824",
  "The-Secret-Doctrine-Vol-2-of-4_54488",
  "The-Secret-Doctrine-Third-Edition-Vol-3-of-4_56880",
  "The-Secret-Doctrine-Vol-4-of-4-The-Synthesis-of-Science-Religion-and-Philosophy_61626",
  "Lives-of-alchemystical-philosophers_68687",
  "The-Mystery-and-Romance-of-Alchemy-and-Pharmacy_47004",
  "The-Story-of-Alchemy-and-the-Beginnings-of-Chemistry_14218",
  "The-Theosophical-Path-Illustrated-Monthly-Volume-1-July-December-1911_64121",
  "Household-Gods--13-A-Comedy_14040",
  "Tannhauser-b-A-Story-of-all-time_70261"
];
const MAX_BOOKS=Number(process.env.MAX_BOOKS||REPOS.length);
const MAX_BYTES=3000000;
const MAX_WORDS=600000;

/** @param {number[]} target @returns {Map<number,number[]>} */
function targetIndex(target){
 const out=new Map();
 for(let i=0;i<=target.length-K;i++)for(let mask=0;mask<1<<K;mask++){
   let n=0,valid=true;
   for(let t=0;t<K;t++){
     const v=target[i+t]-((mask>>t)&1);
     if(v<1||v>=BASE){valid=false;break;}
     n=n*BASE+v;
   }
   if(!valid)continue;
   if(!out.has(n))out.set(n,[]);
   out.get(n).push(i);
 }
 return out;
}
const INDEX=targetIndex(TARGET);

/**
 * @param {Map<number,number[]>} index
 * @param {number[]} target
 * @param {number[]} source
 * @param {string[]} words
 * @param {number} minLength
 * @returns {object}
 */
function scan(index,target,source,words,minLength=18){
 let best=null,seedHits=0,qualifying=0;
 for(let j=0;j<=source.length-K;j++){
   let key=0,valid=true;
   for(let u=0;u<K;u++){
     if(source[j+u]<=0||source[j+u]>=BASE){valid=false;break;}
     key=key*BASE+source[j+u];
   }
   if(!valid)continue;
   const starts=index.get(key);
   if(!starts)continue;
   for(const i of starts){
     seedHits++;
     let left=0,right=K;
     while(i-left>0&&j-left>0&&(target[i-left-1]===source[j-left-1]||
       target[i-left-1]===source[j-left-1]+1))left++;
     while(i+right<target.length&&j+right<source.length&&(
       target[i+right]===source[j+right]||target[i+right]===source[j+right]+1))right++;
     const length=left+right;
     if(length>=minLength)qualifying++;
     if(!best||length>best.length){
       const ti=i-left,sj=j-left;
       best={length,targetStart:ti,sourceStart:sj,
         extraRunes:target.slice(ti,ti+length).reduce((s,v,x)=>
           s+Number(v===source[sj+x]+1),0),
         phrase:words.slice(sj,sj+Math.min(30,length)).join(" ")};
     }
   }
 }
 return {sourceWords:source.length,seedHits,qualifying,best};
}

/** @param {string} str */
function cleanGutenberg(str){
 const upper=str.toUpperCase(), begin=upper.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/);
 const end=upper.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/);
 const start=begin>=0?str.indexOf("\n",begin)+1:0;
 return str.slice(start,end>=start?end:undefined);
}

/** @param {string} url @param {number} limit */
async function getText(url,limit=MAX_BYTES){
 const response=await fetch(url,{signal:AbortSignal.timeout(18000),headers:{"User-Agent":"LiberPrimusAcademicResearch/1.0"}});
 if(!response.ok)throw Error("HTTP "+response.status);
 const len=Number(response.headers.get("content-length")||0);
 if(len>limit)throw Error("oversized response");
 const text=await response.text();
 if(text.length>limit)throw Error("oversized text");
 return text;
}

/** @returns {Promise<object[]>} */
async function selectBooks(){
  return REPOS.slice(0,MAX_BOOKS).map((repo,index)=>{
    const id=Number(repo.match(/_(\d+)$/)[1]);
    return {id,title:repo.slice(0,repo.lastIndexOf("_")),repo,
      topic:"preselected-philosophical-mystical-source",
      url:"https://raw.githubusercontent.com/GITenberg/"+repo+"/master/"+id+".txt"};
  });
}

/** @param {object} book */
async function fetchEdition(book){
  try{return await getText(book.url);}
  catch(first){
    const fallback=book.url.replace(/(\d+)\.txt$/,"$1-0.txt");
    try{return await getText(fallback);}
    catch(second){throw Error("two raw paths failed: "+String(first)+"; "+String(second));}
  }
}

async function main(){
 const books=await selectBooks();
 console.log("CATALOGUE",JSON.stringify({selection:"frozen GITenberg public-domain English candidate repos",maxBooks:MAX_BOOKS,selected:books.length,ids:books.map(b=>b.id)}));
 const results=[];
 for(let i=0;i<books.length;i++){
   const book=books[i];
   try{
     const text=cleanGutenberg(await fetchEdition(book));
     const words=englishWords(text);
     if(words.length<300||words.length>MAX_WORDS)continue;
     const lengths=words.map(runeLength);
     const match=scan(INDEX,TARGET,lengths,words);
     const hash=crypto.createHash("sha256").update(text).digest("hex");
     results.push({id:book.id,title:book.title,topic:book.topic,sha256:hash,...match});
     if(match.best.length>=20)console.log("CANDIDATE",JSON.stringify({id:book.id,title:book.title,...match.best}));
   }catch(e){
     console.log("BOOK_ERROR",JSON.stringify({id:book.id,error:String(e)}));
   }
   if(i%25===24)console.log("PROGRESS",JSON.stringify({booksSeen:i+1,scanned:results.length,highScore:Math.max(0,...results.map(r=>r.best?.length||0))}));
 }
 results.sort((a,b)=>(b.best?.length||0)-(a.best?.length||0));
 console.log("SUMMARY",JSON.stringify({scanned:results.length,failed:books.length-results.length,
   selectedTopicRules:"frozen git repo slugs",
   top:results.slice(0,30).map(r=>({id:r.id,title:r.title,topic:r.topic,sha256:r.sha256,sourceWords:r.sourceWords,seedHits:r.seedHits,qualifying:r.qualifying,best:r.best})),
   all:{idAndMax:results.map(r=>[r.id,r.best?.length||0])}
 }));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={targetIndex,scan,cleanGutenberg,selectBooks};
