/**
 * Reuse the published 3301-hash-alarm implementations against historical
 * OnionScan corpora. This is a bounded exact-match search for the p56 target.
 *
 * Usage:
 *   node agent21_hash_alarm_corpus_sft.js <hash-alarm-repo> <2016-json-dir>
 *        <2017-json-dir> <2017-url-list> <output-json>
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const TARGET =
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84' +
  '25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';

/**
 * @param {string} root
 * @returns {string[]}
 */
function listJsonFiles(root) {
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      result.push(...listJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      result.push(fullPath);
    }
  }
  return result;
}

/**
 * @param {string} value
 * @returns {Set<string>}
 */
function onionUrlCandidates(value) {
  const candidate = value.trim();
  const result = new Set();
  if (!candidate.toLowerCase().includes('.onion')) {
    return result;
  }

  result.add(candidate);
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    if (candidate.toLowerCase().endsWith('.onion')) {
      result.add(candidate + '/');
    }
    return result;
  }

  result.add('http://' + candidate);
  if (candidate.toLowerCase().endsWith('.onion')) {
    result.add('http://' + candidate + '/');
  }
  return result;
}

/**
 * @param {unknown} value
 * @param {Set<string>} output
 */
function collectOnionStrings(value, output) {
  if (typeof value === 'string') {
    for (const candidate of onionUrlCandidates(value)) {
      output.add(candidate);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectOnionStrings(item, output);
    }
    return;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      collectOnionStrings(key, output);
    }
  }
}

/**
 * @param {string} jsonDir
 * @param {Set<string>} urls
 * @param {Array<{source:string, text:string, storedSha1:string[]}>} snapshots
 */
function collectReports(jsonDir, urls, snapshots) {
  for (const file of listJsonFiles(jsonDir)) {
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw.trim()) {
      continue;
    }
    const report = JSON.parse(raw);
    for (const field of [
      'hiddenService',
      'internalPages',
      'linkedSites',
      'relatedOnionServices',
      'relatedOnionDomains',
      'pageReferencedDirectories',
      'interestingFiles',
      'openDirectories',
      'crawls'
    ]) {
      collectOnionStrings(report[field], urls);
    }

    if (typeof report.snapshot === 'string' && report.snapshot.length > 0) {
      snapshots.push({
        source: file,
        text: report.snapshot,
        storedSha1: Array.isArray(report.hashes)
          ? report.hashes.filter(value => typeof value === 'string' && value.length === 40)
          : []
      });
    }
  }
}

/**
 * @param {string} hashDir
 * @returns {Promise<vm.Context>}
 */
async function loadHashAlarmContext(hashDir) {
  const compatibilityDir = path.join(hashDir, 'hashes');
  fs.mkdirSync(compatibilityDir, { recursive: true });
  for (const name of fs.readdirSync(hashDir)) {
    if (name.endsWith('.wasm')) {
      fs.copyFileSync(path.join(hashDir, name), path.join(compatibilityDir, name));
    }
  }

  const context = vm.createContext({
    console,
    process,
    require,
    Buffer,
    TextEncoder,
    TextDecoder,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  });
  context.global = context;

  const scripts = [
    'blake2b.js',
    'blake-wrapped.js',
    'fnv512-wrapped.js',
    'md6-wrapped.js',
    'sha3-wrapped.js',
    'sha512.js',
    'streebog-wrapped.js',
    'grostl-wasm.js',
    'jh-wasm.js',
    'lsh-wasm.js',
    'skein-wasm.js',
    'cubehash-wasm.js',
    'whirlpool-wasm.js'
  ];

  for (const name of scripts) {
    const fullPath = path.join(hashDir, name);
    context.__filename = fullPath;
    context.__dirname = hashDir;
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, context, { filename: fullPath });
  }

  const readyExpression = [
    'blake',
    'fnv512',
    'md6',
    'sha3',
    'streebog',
    'grostl',
    'jh',
    'lsh',
    'skein',
    'cubehash',
    'whirlpool'
  ].map(name => `${name}.internal && ${name}.internal.module`).join(' && ');

  for (;;) {
    if (vm.runInContext(`Boolean(${readyExpression})`, context)) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }

  vm.runInContext(`
    globalThis.agent21DigestHex = function(data) {
      const toHex = bytes =>
        bytes.reduce((text, byte) => text + byte.toString(16).padStart(2, '0'), '');

      return {
        'blake-512': toHex(blake.digest(data, 512)),
        'md6-512': toHex(md6.digest(data, 512)),
        'fnv512-0': toHex(fnv512.digest(data, 512, fnv512.variants.FNV_VARIANT_0)),
        'fnv512-1': toHex(fnv512.digest(data, 512, fnv512.variants.FNV_VARIANT_1)),
        'fnv512-1a': toHex(fnv512.digest(data, 512, fnv512.variants.FNV_VARIANT_1A)),
        'streebog512': toHex(streebog.digest(data, 512)),
        'blake2b': toHex(blake2b(data)),
        'keccak3-512': toHex(sha3.digest(data, 512, sha3.variants.SHA3_VARIANT_KECCAK3)),
        'sha3-512': toHex(sha3.digest(data, 512, sha3.variants.SHA3_VARIANT_STANDARD)),
        'sha512': sha512(data),
        'grostl-512': toHex(grostl.digest(data, 512)),
        'jh-512': toHex(jh.digest(data, 512)),
        'lsh-512': toHex(lsh.digest(data, 512)),
        'skein-512': toHex(skein.digest(data, 512)),
        'cubehash16+16/32+32-512': toHex(cubehash.digest(data, 16, 16, 32, 32, 512)),
        'whirlpool-0': toHex(whirlpool.digest(data, whirlpool.WHIRLPOOL_0)),
        'whirlpool-T': toHex(whirlpool.digest(data, whirlpool.WHIRLPOOL_T)),
        'whirlpool': toHex(whirlpool.digest(data, whirlpool.WHIRLPOOL))
      };
    };
  `, context);

  return context;
}

/**
 * @param {vm.Context} context
 * @param {string} text
 * @returns {Record<string, string>}
 */
function hashString(context, text) {
  context.__candidate = text;
  return vm.runInContext('agent21DigestHex(__candidate)', context);
}

/**
 * @param {vm.Context} context
 * @param {string} text
 * @returns {Record<string, string>}
 */
function hashUtf8Bytes(context, text) {
  context.__candidateBase64 = Buffer.from(text, 'utf8').toString('base64');
  return vm.runInContext(
    "agent21DigestHex(new Uint8Array(Buffer.from(__candidateBase64, 'base64')))",
    context
  );
}

/**
 * @param {string} outputPath
 * @param {object} payload
 */
function writeJsonLockedAtomic(outputPath, payload) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const lockPath = outputPath + '.lock';
  const tempPath = outputPath + `.${process.pid}.tmp`;
  const lockFd = fs.openSync(lockPath, 'wx');
  try {
    fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    fs.renameSync(tempPath, outputPath);
  } finally {
    fs.closeSync(lockFd);
    fs.rmSync(lockPath, { force: true });
    fs.rmSync(tempPath, { force: true });
  }
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const [
    hashAlarmRepo,
    corpus2016,
    corpus2017,
    urlList2017,
    outputPath,
    ...extraUrlLists
  ] = process.argv.slice(2);

  const hashDir = path.join(hashAlarmRepo, 'src', 'hashes');
  const urls = new Set();
  const snapshots = [];

  collectReports(corpus2016, urls, snapshots);
  collectReports(corpus2017, urls, snapshots);
  for (const line of fs.readFileSync(urlList2017, 'utf8').split(/\r?\n/)) {
    if (line.trim()) {
      for (const candidate of onionUrlCandidates(line)) {
        urls.add(candidate);
      }
    }
  }

  const context = await loadHashAlarmContext(hashDir);
  const algorithms = Object.keys(hashString(context, 'agent21-positive-control'));
  const matches = [];

  let urlIndex = 0;
  for (const url of urls) {
    urlIndex += 1;
    const digests = hashString(context, url);
    for (const [algorithm, digest] of Object.entries(digests)) {
      if (digest === TARGET) {
        matches.push({ inputKind: 'url', url, algorithm, digest });
      }
    }
    if (urlIndex % 5000 === 0) {
      console.log(`URL_PROGRESS ${urlIndex}/${urls.size}`);
    }
  }

  let snapshotIndex = 0;
  for (const snapshot of snapshots) {
    snapshotIndex += 1;
    const digests = hashUtf8Bytes(context, snapshot.text);
    for (const [algorithm, digest] of Object.entries(digests)) {
      if (digest === TARGET) {
        matches.push({
          inputKind: 'snapshot_utf8_bytes',
          source: snapshot.source,
          algorithm,
          digest,
          storedSha1: snapshot.storedSha1
        });
      }
    }
    if (snapshotIndex % 100 === 0) {
      console.log(`SNAPSHOT_PROGRESS ${snapshotIndex}/${snapshots.length}`);
    }
  }

  const payload = {
    target: TARGET,
    algorithmSource: 'tweqx/3301-hash-alarm src/hashes',
    algorithms,
    counts: {
      uniqueUrlInputs: urls.size,
      nonemptySnapshotInputs: snapshots.length,
      urlDigestComparisons: urls.size * algorithms.length,
      snapshotDigestComparisons: snapshots.length * algorithms.length
    },
    exactMatches: matches,
    scope: [
      'kal1gh0st/OSINT OnionScan JSON snapshots and report-derived URLs',
      'mylamour/onion.scan.result crawl URLs and hidden-service fields',
      'mylamour/onion.scan.result onion_url_list.txt bounded URL forms',
      ...extraUrlLists.map(value => `extra URL list: ${value}`)
    ]
  };

  writeJsonLockedAtomic(outputPath, payload);
  console.log(JSON.stringify(payload, null, 2));
  console.log(matches.length ? 'EXACT_P56_MATCH_FOUND' : 'NO_EXACT_P56_MATCH');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
