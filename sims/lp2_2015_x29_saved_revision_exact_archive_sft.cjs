'use strict';

/**
 * Source-bounded 2015 original Etherpad saved-revision recovery gate.
 * Exact X29BZhdBBe historical saved revisions are attested in the
 * April/July 2016 Wayback HTML clientVars initialRevisionList. These
 * are NOT guessed participant secret IDs.
 *
 * This probe requests only the three source-attested saved-revision
 * paths from Wayback and Arquivo historical indexes, plus one dated
 * 2015 memento for Revision 2. No broad host enumeration, brute force,
 * mutation, authentication, or dynamic HTML execution.
 *
 * Node.js 22, read-only. Report status and short previews for custody
 * without claiming no archive beyond the queried exact hosts/routes.
 */
const crypto = require('node:crypto');
const pad = 'X29BZhdBBe';
const revisions = [
  {saved:1,id:'N6t59CKTj7',at:'2015-01-22T16:13:06Z'},
  {saved:2,id:'lMfDxJwCBo',at:'2015-01-22T16:16:40Z'},
  {saved:3,id:'wzRESlRFeI',at:'2015-01-22T17:36:41Z'}
];

/** @param {string} url @returns {Promise<object>} */
async function inspect(url) {
  try {
    const response = await fetch(url,{signal:AbortSignal.timeout(17000),
      headers:{'User-Agent':'LiberPrimus-Source-Research/1.0'}});
    const body = await response.text();
    return {url,final:response.url,status:response.status,bytes:body.length,
      sha256:crypto.createHash('sha256').update(body).digest('hex'),
      preview:body.slice(0,240)};
  } catch(error) {
    return {url,error:String(error)};
  }
}
async function main() {
  for (const rev of revisions) {
    const endpoint = 'titanpad.com/ep/pad/view/'+pad+'/'+rev.id;
    const archive = ['https://web.archive.org/cdx/search/cdx?url=',
      encodeURIComponent(endpoint),'&output=json&filter=statuscode:200'].join('');
    const arquivo = ['https://arquivo.pt/wayback/cdx?url=',
      encodeURIComponent(endpoint),'&output=json&filter=statuscode:200'].join('');
    console.log('REV '+JSON.stringify({rev,wayback:await inspect(archive),
      arquivo:await inspect(arquivo)}));
  }
  const rev2='http://titanpad.com/ep/pad/view/'+pad+'/lMfDxJwCBo';
  const capture='https://web.archive.org/web/20150123120000id_/'+rev2;
  console.log('DIRECT_ORIGINAL_REV2 '+JSON.stringify(await inspect(capture)));
  // Existing April 2016 archive contains entire client bootstrap data;
  // recover only any embedded chat/history metadata without executing HTML.
  const original2016='https://web.archive.org/web/20160412061055/https://titanpad.com/X29BZhdBBe';
  try {
    const response=await fetch(original2016,{signal:AbortSignal.timeout(18000)});
    const html=await response.text();
    const keys=['initialChatMessages','chatHead','chatHistory','chatMessage','initialRevisionList','rune','frequen'];
    const chatTag=html.indexOf('"chatHistory":');
    if(chatTag>=0){
      const beginning=html.indexOf('{',chatTag);
      let depth=0,quoted=false,escaped=false,ending=-1;
      for(let k=beginning;k<html.length;k++){
        const char=html[k];
        if(quoted){if(escaped) escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;}
        else {if(char==='"')quoted=true;else if(char==='{')depth++;else if(char==='}'&&--depth===0){ending=k+1;break;}}
      }
      try {
        const chunk=html.slice(beginning,ending)
          .replace(/\\x([0-9a-fA-F]{2})/g,'\\u00$1')
          .replace(/\\'/g,"'");
        const data=JSON.parse(chunk);
        console.log('CHAT_HISTORY_ISOLATED '+JSON.stringify({
          keys:Object.keys(data),start:data.start,
          messageCount:data.messages?.length??data.chatMessages?.length??null,
          messages:data.messages??data.chatMessages??null,
          historicalAuthors:data.historicalAuthorData??null,
          chatStart:data.start,chatEnd:data.end,
          chatLines:data.lines??null
        }).slice(0,24000));
      } catch(error) {
        console.log('CHAT_HISTORY_ISOLATED '+JSON.stringify({
          error:String(error),length:ending-beginning,rawStart:html.slice(beginning,beginning+100)
        }));
      }
    }
    const segments=keys.map(key=>({
      key,at:html.indexOf(key),count:html.split(key).length-1,
      context:html.indexOf(key)<0?null:html.slice(
        Math.max(0,html.indexOf(key)-100),html.indexOf(key)+500)
    }));
    // The public archived client bootstrap additionally embeds chatHistory.
    // Parse the literal JSON value by balancing object delimiters; never eval
    // or execute archived script code.
    const at=html.indexOf('var clientVars = ');
    if(at>=0) {
      let j=html.indexOf('{',at),start=j,depth=0,quoted=false,escape=false,end=-1;
      for(;j<html.length;j++){
        const ch=html[j];
        if(quoted) {
          if(escape) escape=false;
          else if(ch==='\\') escape=true;
          else if(ch==='"') quoted=false;
        } else {
          if(ch==='"') quoted=true;
          else if(ch==='{') depth++;
          else if(ch==='}' && --depth===0) {end=j+1;break;}
        }
      }
      if(end>start) {
        try {
          const data=JSON.parse(html.slice(start,end));
          const chat=data.chatHistory;
          console.log('CHAT_HISTORY_STRUCTURED '+JSON.stringify({
            topKeys:Object.keys(data),
            chatKeys:chat?Object.keys(chat):null,
            chatMessages:chat?.messages||chat?.chatMessages||null,
            chatAuthors:chat?.historicalAuthorData||null
          }).slice(0,16000));
        } catch(error) {
          console.log('CHAT_HISTORY_STRUCTURED '+JSON.stringify({
            error:String(error),rawStart:html.slice(start,start+100)
          }));
        }
      }
    }
    console.log('ORIGINAL_2016_CHAT_BOOTSTRAP '+JSON.stringify({
      http:response.status,htmlChars:html.length,
      sha256:crypto.createHash('sha256').update(html).digest('hex'),
      segments
    }));
  }catch(error){console.log('ORIGINAL_2016_CHAT_BOOTSTRAP '+JSON.stringify({error:String(error)}));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
