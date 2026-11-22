# 2013 onion-cookie hashes as AES-256 material for the LP2 256-byte grid

**Agent45, 15 November 2026. Bounded negative.** No LP2 plaintext, authenticated key, cipher instruction, or destination recovered. This tests a previously unindexed cross-round key candidate; it does not authenticate the cookie values as Cicada instructions.

## Source hypothesis

The community-compiled file HINTS-NEVER-USED.md records two cookies allegedly saved from the 2013 onion service p7amjopgric7dfdi.onion:

- Cookie 167: 6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6
- Cookie 761: 7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5

Each is a 64-hex-character SHA-256-sized value, i.e. 32 bytes. The labels 167 and 761 also match the 167-second duration and 761 filename of the 2013 Cicada audio. This makes a cross-round relationship plausible, but the cookie claim is community-reported: the available hint is not a Cicada-signed instruction, raw server response, or original browser cookie database.

An independent external research package, [Dukotah/cicada3301 `armada20`](https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/armada20), also records both cookie strings as key candidates: [cookie 167 result](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/armada20/test7_cookie167.json), [cookie 761 result](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/armada20/test7_cookie761.json). Those result files report zero hits above their stated threshold. This report does **not** claim first use of the cookie values as keys; it tests the distinct hypothesis that their 32-byte digests directly key AES-256 decryption of the LP2 256-byte table.

The LP2 pp49–51 grid contains 256 two-character numeral tokens. Under the established conditional base60 reading it is exactly 256 bytes; the published alternative radix59 reading omits lowercase f and produces a different 256-byte stream. A 32-byte value is a natural AES-256 key, and a 256-byte table is a natural candidate ciphertext. This gives a finite, testable hypothesis: one of the 2013 cookie digests is an AES-256 key for the LP2 grid.

## Frozen tests

The reproducer reads the canonical original-derived grid tokens and verifies both byte serializations by SHA-256:

- Base60 bytes: 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290
- Base59 without lowercase f: 511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79

It tests only the raw 32-byte cookie digests, with no KDF, password guess, offset, or key search:

1. Each cookie independently as AES-256 key, under ECB, CBC with a zero 16-byte IV, and CTR with a zero 16-byte counter.
2. Each cookie as key and the other cookie as IV/nonce, using only the other cookie's literal first or last 16 bytes, under CBC and CTR.

Both table codecs are tested. This is **28 complete decryptions**. The script includes the FIPS-197 AES-256 ECB known-answer test and exact encrypt-after-decrypt reconstruction for every original-table candidate.

## Results

No output begins with a recognized common file signature (PNG, PDF, ZIP, GZIP, ELF, GIF, RIFF, SQLite, HTML, XML or JPEG), and none is coherent plaintext.

| Measure | Result |
|---|---:|
| Number of candidate decryptions | **28** |
| Printable ASCII in the 28 outputs | **80–107 / 256 bytes** |
| Mean printable ASCII | **92.7 / 256 bytes** |
| Uniform-byte expectation for printable ASCII | **95 / 256 bytes** |
| Highest printable output | **107 / 256 (41.8%)** |
| Highest output's distance above uniform expectation | **1.55 standard deviations** |
| Recognized file signatures | **0** |
| Exact forward reconstruction checks | **28 / 28 passed** |
| FIPS-197 AES-256 known-answer test | **passed** |

The most printable candidate is base59, cookie 167 as the AES key, cookie 761's last 16 bytes as CBC IV; its first 16 output bytes are 595e2c427178cb7e7d8328dad1689350. This is binary-looking data, not a recognizable header or readable message. A 41.8% printable fraction is not significant against the 37.1% expectation for uniform bytes in a 256-byte sample; the best result is only 1.55 standard deviations above that expectation.

Exact reencryption verifies implementation reversibility only. It does not validate the key, mode, or historical relationship. The original source does not specify AES, CBC/CTR/ECB, or a key/IV assignment.

## Decision

Retire only the direct raw-cookie AES-256 consumers tested here: each cookie alone with standard zero-IV modes, and one cookie as key with the other cookie's first/last 16 bytes as IV/nonce, against both established LP2 table byte interpretations. Do not continue scanning IV offsets or invent KDFs without an independently recovered source instruction.

The two cookie values remain a community-reported historical lead, not an authenticated Cicada key. A primary source confirming the cookie contents or an explicit instruction connecting them to LP2 would justify a different test. This negative does not exclude other ciphers, key derivations, or unrelated uses of the cookies.

## Reproduction

Run from the repository root:

~~~bash
node sims/lp2_p50_2013_cookie_aes256_key_gate_sft.cjs
~~~

The test is self-contained apart from the repository's canonical grid JSON and Node.js built-in crypto. It does not alter the authoritative results synthesis.
