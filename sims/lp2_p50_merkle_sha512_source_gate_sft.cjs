"use strict";
/**
 * Original-source, zero-parameter SHA-512 Merkle root gate for the LP2 p49–51
 * 256-cell base60 grid and solved p56's 128-hex deep-web hash. No plaintext
 * scoring, adjustable key, output-dependent orientation or cipher search.
 * Windows 11 / Node 22: node sims/lp2_p50_merkle_sha512_source_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const grid = source.bytes.flat(Infinity);
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
/** @param {Buffer} message @returns {Buffer} */
const sha512 = message => crypto.createHash("sha512").update(message).digest();
/**
 * @param {number[]} values
 * @param {"bare"|"hashed"|"rfc6962"} leafMode
 * @param {"bare"|"tagged"} nodeMode
 * @returns {string}
 */
function merkle(values, leafMode, nodeMode) {
  assert.ok(values.length > 0 && (values.length & (values.length - 1)) === 0);
  let layer = values.map(value => {
    const payload = Buffer.from([value]);
    if (leafMode === "bare") return payload;
    if (leafMode === "hashed") return sha512(payload);
    return sha512(Buffer.concat([Buffer.from([0]),payload]));
  });
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      next.push(sha512(Buffer.concat(nodeMode === "tagged"
        ? [Buffer.from([1]),layer[i],layer[i+1]]
        : [layer[i],layer[i+1]])));
    }
    layer = next;
  }
  return layer[0].toString("hex");
}
function run() {
  assert.equal(grid.length,256);
  assert.ok(grid.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
  assert.equal(crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  // Independently calculated standard four-leaf SHA-512 test vectors.
  assert.equal(merkle([1,2,3,4],"bare","bare"),
    "9624b3f707101d6474623ddb234e4dcc96bafae74537b4ccd6aab52f0df1e91d1c13b041ff92be460296fced7453e94479bbc5a10cf2f0e0fb02e075c897bd8e");
  assert.equal(merkle([1,2,3,4],"rfc6962","tagged"),
    "ecfa5332e2cf4f23cd5d00c7e69e281c91ae7339293390b6228b974f77a49df3b7bbe737fc9bfcee6be07cf4e1771718d19119d53c5a94ee13d352addfd500e5");
  const outcomes = [];
  for (const leafMode of ["bare","hashed","rfc6962"]) {
    for (const nodeMode of ["bare","tagged"]) {
      const digest = merkle(grid,leafMode,nodeMode);
      outcomes.push({leafMode,nodeMode,digest,equalsP56Target:digest===target});
    }
  }
  const directSHA512 = sha512(Buffer.from(grid)).toString("hex");
  assert.equal(directSHA512,
    "bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20");
  assert.ok(outcomes.every(x => !x.equalsP56Target));
  assert.notEqual(directSHA512,target);
  const result = {gridLength:grid.length,gridSHA256:
    crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
    p56Target:target,directSHA512,checkedMerkleRoots:outcomes,
    decision:"The literal base60 grid is not the direct SHA512 preimage or one of six frozen SHA512 binary Merkle-tree roots of the solved p56 target."};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main === module) run();
module.exports = {run,merkle};
