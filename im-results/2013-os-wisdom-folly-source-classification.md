# 2013 Cicada OS `/tmp/wisdom` and `/tmp/folly`: byte recovery and bounded classification

**Decision:** recovered as one byte-identical 3,368-byte object under two names. It is high-entropy opaque data, not a readable instruction or an independently evidenced LP2 key. This closes the narrow “recover and classify the 2013 wisdom/folly binaries” task as a bounded source negative; it does not prove the bytes had no purpose in the 2013 puzzle.

## Source chain and byte identity

- The public archive mirror is [`krisyotam/cicada3301`](https://github.com/krisyotam/cicada3301), archive-import commit [`1ccf9583b7064ffd6feb52a49442311048295b41`](https://github.com/krisyotam/cicada3301/commit/1ccf9583b7064ffd6feb52a49442311048295b41).
- The extracted paths are [`puzzles/2013/cicada-os/tmp/wisdom`](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/tmp/wisdom) and [`puzzles/2013/cicada-os/tmp/folly`](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/tmp/folly).
- Both paths return the same Git blob SHA-1: `62b1b949a1e4e4a346e75b1c34101000d3c53220`. This is a **Git blob SHA-1**, not the raw-file SHA-1. The raw MD5 is `0c7d18e82cdac189d165706db4064a84`.
- Both decode to exactly 3,368 bytes and are byte-for-byte identical. One copy is preserved as a lossless base64 envelope at [`resources/historical/cicada-2013-os-wisdom-folly.bin.b64`](../resources/historical/cicada-2013-os-wisdom-folly.bin.b64). Restore it with `base64 -d resources/historical/cicada-2013-os-wisdom-folly.bin.b64 > /tmp/wisdom-folly.bin`; `git hash-object /tmp/wisdom-folly.bin` should return the Git blob SHA above.
- The independent [`cicada-solvers/neuroretransmit-cicada` 2013 OS README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/README.md) documents the original ISO download as [`3301.iso`](https://archive.org/download/https-www.dropbox.com-s-r7sgeb5dtmzj14s-3301/3301.iso), its root-filesystem extraction, and the two `/tmp/` paths; it describes the files as identical data. This invocation recovered the bytes from the archive mirror, **not by re-downloading and re-extracting the ISO**, so the mirror-to-ISO chain is corroborated by archive documentation rather than a fresh primary-image extraction.

The two names therefore do not provide two independent byte streams. They are aliases/copies of one artifact in the preserved extraction. Do not confuse either with the 673,066-byte 2014 Stage04 `0_wisdom.jpg` / LP1 page-05 artifact discussed in [the corrected source note](../external/2013-0-wisdom-source.md).

## Reproduced byte statistics

The following were computed directly from the recovered 3,368 bytes:

| Measurement | Result |
|---|---:|
| Length | 3,368 bytes |
| Distinct byte values | 256 / 256 |
| Shannon entropy | 7.937666 bits/byte |
| Byte-frequency chi-square | 277.5677 (255 df) |
| Printable ASCII | 1,272 / 3,368 = 37.7672% |
| Mod-29 residue chi-square | 24.5350 (28 df) |
| Mod-29 scaled IoC | 0.998971 |
| Raw MD5 | `0c7d18e82cdac189d165706db4064a84` |

The printable runs of length at least five are short random-looking fragments (for example `&Z:R&`, `nTrt_`, `\\gtQff`, `'_95j`); none is a readable instruction. Period checks at 29, 71, 83, 113, 116 and 421 have observed match counts (11, 16, 9, 8, 6, 13) close to byte-random expectations (13.04, 12.88, 12.83, 12.71, 12.70, 11.51). The leading bytes are `bf53c0cc9f66938e`; no ordinary plaintext header or text is apparent.

These measurements support “high-entropy opaque bytes.” They do **not** distinguish true random data, encrypted content, or a pad. The 37.77% printable fraction is close to the random-byte expectation, not evidence of embedded ASCII prose.

## Independent published analysis (not rerun here)

The [Dukotah elimination ledger](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md) independently identifies `T3 == tmp_folly == tmp_wisdom` at 3,368 bytes and reports the same MD5 prefix `0c7d18e8), entropy 7.938 and byte chi-square 278. Its later bounded analyses report no valid OpenPGP/RSA/DER/ASCII-armor or compressed/container structure, and no hit in its tested CicadaOS-pad / keyskip-aware LP2 families. These are **that repository’s reported tests**, not experiments performed by this invocation; their stated coverage bounds should be retained.

## Interpretation and stopping boundary

- **Established here:** two named paths, one identical 3,368-byte high-entropy object; no readable prime/totient/count/key instruction in the recovered bytes.
- **Not established:** why the author placed the object in the OS, whether it was intended as a pad for another 2013 stage, or whether it was ever consumed by the original puzzle.
- **LP2 consequence:** no source-selected LP2 target, alignment, or inverse follows from the filenames or the binary statistics. Published bounded pad tests found no LP2 match in their tested families. Do not repeat those families or infer a new LP2 key from the name “wisdom.”
- **Remaining provenance limit:** a fresh byte-level extraction from the Archive.org ISO would be the strongest primary-source check. The current archive mirror plus independent extraction documentation and matching external MD5/statistics is sufficient for the bounded classification, not a claim of a newly authenticated Cicada instruction.

**Disposition:** close the binary-recovery issue as a bounded source negative. Reopen only if a new primary ISO witness, an original OS consumer/reference, or a source-selected operation becomes available.
