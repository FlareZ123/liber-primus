'use strict';
const assert = require('node:assert/strict');
const { LegacyPhpMt } = require('./php_legacy_mt.cjs');

// PHP 8.4.24 MT_RAND_PHP compatibility mode, matching PHP 5.2.1–7.0.
// Obtained from mt_srand(seed, MT_RAND_PHP), mt_rand(), mt_rand(0, 28).
const cases = [
  { seed: 0, raw: [963932192,1273124119,1535857466,324735766,1294424481,1842424189,1170127713,1819459251,909791748,1339092841,770137596,1316527631], scaled: [13,17,20,4,17,24,15,24,12,18,10,17] },
  { seed: 1, raw: [1244335972,15217923,1546885062,2002651684,2135443977,1865258162,1509498899,2145423170,1837306065,1634983062,1956263230,1300815158], scaled: [16,0,20,27,28,25,20,28,24,22,26,17] },
  { seed: 2, raw: [1216699170,1761292401,2082109824,2000468772,1180391179,2035235989,1223905695,1095219027,902732980,688346755,1426299943,331628760], scaled: [16,23,28,27,15,27,16,14,12,9,19,4] },
  { seed: 3301, raw: [1405942902,1597094570,984984073,940074847,1460650220,1544539323,1037946300,1178146517,1755252058,1247128299,881740015,2146658823], scaled: [18,21,13,12,19,20,14,15,23,16,11,28] },
  { seed: 1356998400, raw: [1944345792,1597443343,1627386164,47957214,668663861,420878668,814895448,1208981608,1717229960,253652124,988599255,757986552], scaled: [26,21,21,0,9,5,11,16,23,3,13,10] },
  { seed: 4294967295, raw: [209663185,1896011239,1959327238,927834965,464842412,1008044630,1675044971,1654882557,38525164,608944016,55783497,1083160893], scaled: [2,25,26,12,6,13,22,22,0,8,0,14] }
];
for (const { seed, raw, scaled } of cases) {
  let rng = new LegacyPhpMt(seed);
  assert.deepEqual(raw.map(() => rng.next31()), raw, `PHP raw seed=${seed}`);
  rng = new LegacyPhpMt(seed);
  assert.deepEqual(scaled.map(() => rng.bounded(0,28)), scaled, `PHP bounded seed=${seed}`);
}
const rng = new LegacyPhpMt(123);
const crossing = new Map([[0,644748169],[622,1419383181],[623,2138573369],[624,1691957874],[625,877803431],[998,537164361],[999,1211924732]]);
for (let i = 0; i < 1000; i++) {
  const value = rng.next31();
  if (crossing.has(i)) assert.equal(value, crossing.get(i), `PHP rollover index=${i}`);
}
console.log(`Historical PHP MT: ${cases.length} seed vectors and rollover PASS`);
