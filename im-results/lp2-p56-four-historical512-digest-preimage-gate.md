# LP2 p56 AN END: four historical 512-bit hash algorithms against original files

**Agent 31, 13 November 2026. Result: exact original-source negative, zero recovered p56 preimages and zero decrypted LP2 runes.**

## Source question and frozen candidate set

The independently solved p56 AN END text says an absent deep-web page **hashes to** one literal 512-bit value. It gives no hash-algorithm name. The pinned 128-character target from the untouched original printed p56 is:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

Published external preimage batteries covered SHA-512, SHA3-512, BLAKE/BLAKE2 and other families but explicitly noted gaps in historical SHA-3 contenders and other 512-bit digests ([Dukotah measured ceiling](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/MEASURED-CEILING.md), [elimination ledger](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md)). **Keccak-512 as implemented before the 2015 FIPS SHA3 standard is a distinct hash from modern SHA3-512**; the [hash implementation documentation](https://pycryptodome.readthedocs.io/en/v3.10.4/src/hash/keccak.html) confirms their incompatibility. Additional 2014-era 512-bit possibilities include Skein-512-512, Whirlpool and Streebog-512. Existence in 2014 does not imply Cicada selected any of them.

The fixed, original-byte candidate list contains exactly **65** source objects:

- 58 original LP2 JPEG image files, image numbers 17.jpg through 74.jpg, **35,362,230 bytes** total (includes the unsolved scans and solved p56/p57).
- Six exact archived 2014 HTML and PGP textual witness files: `resources/cicada2014-onion7-index.html`; `resources/historical/stage11-2014-index.html`, `cicada2014-stage11-message.asc`, `cicada2014-stage09-first-jpeg-recovered.asc`, and the two January 7 onion2 HTML witnesses ending `170byte.html` and `201byte.html`.
- The **256 original binary bytes** represented by the pp49–51 table from `lp2-grid-256.json`, with no alternative serialization.

No input bytes are normalized, decoded as prose, trimmed, line-ending-adjusted, concatenated or re-encoded. The table is tested as its original row-major byte interpretation. The entire frozen file population contains **35,368,981 bytes**. The scope is a small historical source census, not a preimage attack over unknown deep-web content.

## Exact experiment and result

The independent [Python source-original reproducer](../sims/lp2_p56_alternate512_original_source_sft.py) uses `pyskein==1.0` for **Skein-512-512**, `pycryptodome==3.23.0` for **pre-FIPS Keccak-512**, `gostcrypto==1.2.5` for **Streebog-512**, and OpenSSL 3's legacy provider for **Whirlpool**. For each of the four algorithms, the implementation reproduces an externally published **512-bit empty-message known-answer test vector** before reading original puzzle files; an independent fixed-message control is also rehashed exactly.

| Source operation | Native original objects checked | Full-digest equality to original p56 |
|---|---:|---:|
| Skein-512-512 | 65 | **0** |
| Keccak-512, pre-FIPS SHA3 | 65 | **0** |
| Streebog-512, GOST R 34.11-2012 | 65 | **0** |
| Whirlpool | 65 | **0** |

**Total: 260 full 512-bit original-object comparisons, zero matches.** The original calculation and controls completed successfully in the [manual-only GitHub Actions run 43473020706](https://github.com/FlareZ123/liber-primus/actions/runs/43473020706), job 132049568308, in approximately four minutes. An independently performed local OpenSSL Whirlpool check of the same 58 original JPEG ZIP members also obtained **0/58** full matches. The earlier initial CI run was cancelled when the fourth, pre-FIPS Keccak algorithm was added; only run 43473020706 is the complete four-algorithm evidence.

## Supplementary exact SHA-512 check of the original 2014 Stage10 pages

The 65-object, four-algorithm population above did not include the earlier Stage10 form and response pages. Because p56 explicitly directs the solver to a page matching a 512-bit digest, and these are unusually relevant contemporaneous pages containing the 3301/1033 magic-square instructions and onion-address field, I checked their **exact original 2014 Git-blob bytes** under standard NIST SHA-512.

The source is the first participant-archive commit `3b15257c5a9efada85b8ccfdb876e2ec934d5b90` in [micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014/tree/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10):
 
| Original 2014 object | Bytes | Verified Git blob SHA-1 | SHA-512 |
|---|---:|---|---|
| `stage10/index.html` | 1,943 | `9d7c35bc8fff24c8079668c9d070d98277502f7c` | `1c207650a175a0fb5b78e65674a902978e3f9e811f4fabfd7b74642d731049a078dfdf1aa154b14d46340818035ba03c9d5843cd809b6d92ebadc9278ce1f306` |
| `stage10/squares` | 152 | `d71303af76016c8e88ed5dcc8a18b08e6276a437` | `e391f31b3060ea4ff9dbca844e99f45947b74e6d18f4c90482b219d5ca694bf0f454a7642cfcfe0e4f4f0a56ec3a2159c53faf6ddfa4d814285d9cddc11fe3a3` |

Both Git blob hashes were independently reproduced from the exact byte strings before hashing. The embedded PGP signed block and its cleartext were also separately hashed as secondary text objects; neither matches the p56 target:

| Embedded source object | Extraction | Bytes | SHA-512 |
|---|---|---:|---|
| Complete PGP signed block | From `-----BEGIN PGP SIGNED MESSAGE-----` through `-----END PGP SIGNATURE-----`, inclusive | 1,350 | `56ef91d27531aaf3d44e2033546a39c332fab2b176472bbb0b5736e6ad84eaaf0939644c9d932bd08ba7265e13d897c83b41e055387af18d18bcd745506d71a9` |
| Signed cleartext only | After `Hash: SHA1` and its blank lines, through the last cleartext line before the signature armor | 464 | `a4ab57224ceec277a847f6051ee244ccadf68391e19f66cd6552299b018867a1cb56c2fb817c22e09b811cdd54ce2d60f4af1f085e6a8f94b4be8720107105fe` |

The two full-page SHA-512 values above are not equal to the original target. This is a **two-page, SHA-512-only supplement**, not an expansion of the four-algorithm 65-object count; it does not claim the two pages were tested under Skein, pre-FIPS Keccak, Streebog or Whirlpool.

## 2016 Whirlpool/Pastebin claim: no reproducible preimage

A 2016 [Tor StackExchange answer](https://tor.stackexchange.com/questions/3870/is-it-possible-to-find-a-tor-page-based-on-the-512-bit-hash/3895#3895) claims a Whirlpool reverse lookup led to a Pastebin file named `uRkNsGsa.htm`, and mentions `dxwd42hgpd7qrccm.onion` and `1711141131131.xyz`. The post does not provide exact page bytes or an exact preimage. We tested **21 literal candidates** with OpenSSL 3's Whirlpool implementation (legacy provider): the bare onion address, the alternative leading-`w` spelling, HTTP/HTTPS and slash variants, the named domain and URL forms, and the named Pastebin filename/URL forms. **None** matches the p56 target digest. Reproduce with [the candidate-string SFT](../sims/lp2_p56_stackexchange_whirlpool_candidate_sft.sh). The cited [md5hashing.net project](https://github.com/FVetrov/md5hashing.net) is a reverse-lookup database, not a general cryptographic preimage solver; a database hit alone would not authenticate the claimed page. This retires the literal strings named by the post, not the unknown preimage or hash algorithm.

## Decision and limit

These original 65 whole-file byte strings are **not the p56 preimage under any of the four frozen algorithms**. Because the source says “a page” and does not actually name the algorithm, this result cannot select or reject one 512-bit hash family in general. A missing historical web page could hash to the target under any algorithm tested here, including SHA-512 and these alternatives. Variations of the original source files, HTTP serialization, a URL string, fragments, salt, or unknown keyed constructions were outside this finite test.

**Practical next input:** a recovered original 2014 page body, ciphertext/payload carrying its authentic bytes, or a source-authenticated digest algorithm. With such an input, exact full-digest comparison is a decisive zero-false-positive gate; without one, repeated arbitrary string/format permutations offer little prospect of a genuine p56 continuation. No source-selected original LP2 rune inverse, recovered key or unknown plaintext follows from this result.
