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
}
main().catch(e=>{console.error(e);process.exitCode=1;});
