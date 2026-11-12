# 2013 Cicada OS `/tmp/wisdom` and `/tmp/folly`: byte recovery and bounded classification

**Decision:** the preserved original 2013 `3301.iso` has been re-extracted, confirming one byte-identical 3,368-byte high-entropy object under two names. The complete extracted root filesystem contains no literal `wisdom`/`folly` consumer reference outside the two objects. The original readable startup and its full 464-line prime-printer child have now also been parsed as a fixed shell-call graph: **they contain no computed path or dynamic data-read operation**. Neither object is an independently evidenced LP2 key. This closes the original-ISO provenance and bounded consumer-search questions; it does not prove the objects had no possible purpose in the 2013 puzzle.

## Source chain and byte identity

- The public archive mirror is [`krisyotam/cicada3301`](https://github.com/krisyotam/cicada3301), archive-import commit [`1ccf9583b7064ffd6feb52a49442311048295b41`](https://github.com/krisyotam/cicada3301/commit/1ccf9583b7064ffd6feb52a49442311048295b41).
- The extracted paths are [`puzzles/2013/cicada-os/tmp/wisdom`](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/tmp/wisdom) and [`puzzles/2013/cicada-os/tmp/folly`](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/tmp/folly).
- Both paths return the same Git blob SHA-1: `62b1b949a1e4e4a346e75b1c34101000d3c53220`. This is a **Git blob SHA-1**, not the raw-file SHA-1. The raw MD5 is `0c7d18e82cdac189d165706db4064a84`.
- Both decode to exactly 3,368 bytes and are byte-for-byte identical. One copy is preserved as a lossless base64 envelope at [`resources/historical/cicada-2013-os-wisdom-folly.bin.b64`](../resources/historical/cicada-2013-os-wisdom-folly.bin.b64). Restore it with `base64 -d resources/historical/cicada-2013-os-wisdom-folly.bin.b64 > /tmp/wisdom-folly.bin`; `git hash-object /tmp/wisdom-folly.bin` should return the Git blob SHA above.
- The independent [`cicada-solvers/neuroretransmit-cicada` 2013 OS README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/README.md) identifies the archived [`3301.iso`](https://archive.org/download/https-www.dropbox.com-s-r7sgeb5dtmzj14s-3301/3301.iso). An original-ISO download and read-only filesystem extraction subsequently reproduced both byte objects exactly in [GitHub Actions run 43134159903](https://github.com/FlareZ123/liber-primus/actions/runs/43134159903). The fetched 136,398,848-byte ISO has SHA-256 `784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f`, ISO 9660 boot structure, `BOOT/3301.IMG` gzip-compressed root filesystem, and original image gzip timestamp 2013-01-04 04:18:33 UTC.

The two names therefore do not provide two independent byte streams. They are aliases/copies of one artifact in the preserved extraction. Do not confuse either with the 673,066-byte 2014 Stage04 `0_wisdom.jpg` / LP1 page-05 artifact discussed in [the corrected source note](../external/2013-0-wisdom-source.md).

## Recovered original filesystem and program-consumer test

The original ISO's `BOOT/3301.IMG` was decompressed as an ASCII `newc` CPIO archive and extracted without launching any contained program. The read-only census script [`sims/cicada2013_os_rootfs_consumer_sft.py`](../sims/cicada2013_os_rootfs_consumer_sft.py) enumerated **612 regular files**, **281 symbolic links**, and **8,143,049 bytes** of regular-file contents. Both `tmp/wisdom` and `tmp/folly` were 3,368 bytes with identical raw SHA-256 `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`, raw MD5 and Git blob SHA-1 matching the mirror above.

The complete regular-file scan found **zero** other files containing a literal `/tmp/wisdom`, `/tmp/folly`, or word-boundary `wisdom`/`folly` match, including no matches in binaries; a separate symlink-target/name check also returned zero. The original `usr/local/bin/cicada` startup script invokes only `usr/local/bin/prime_echo`, prints `usr/local/bin/message.txt`, sleeps ten seconds, then reboots. The isolated `prime_echo` and message files are included in the scanned rootfs. The `cicada` and `prime_echo` objects are **ordinary ash shell scripts**, so their direct command and pathname dataflow can be audited syntactically without launching the OS or guessing binary semantics. A second, strict original-source study pinned all three 2013 script/message witnesses by exact original-mirror Git blob SHA-1 and programmatically parsed *every* command with no omitted or unknown line. The startup `cicada` script consists exactly of `clear; /usr/local/bin/prime_echo; clear; cat /usr/local/bin/message.txt; sleep 10; /sbin/reboot` (including its original line breaks). Its only explicit file-read target is **`/usr/local/bin/message.txt`**, a 65-byte fixed source message. The `prime_echo` child contains exactly **464 literal `echo` commands**, each paired with `sleep`, enumerating **every prime from 2 through 3301 in ascending order**; the only two longer **2-second** sleeps immediately follow **1033** and **3301**. Neither script contains variable/path expansion, shell substitution, an input read, a conditional call, or any other computed file operand. A control planted with `cat /tmp/wisdom` is rejected by the strict decoder. This newly bounds the **direct source-script execution graph** and its nominal child output, not merely a literal string search. The byte-pinned source copies are [`cicada`](../resources/historical/cicada2013-os-original-cicada.sh), [`prime_echo`](../resources/historical/cicada2013-os-original-prime-echo.sh), and [`message.txt`](../resources/historical/cicada2013-os-original-message.txt); [reproduce the complete callgraph audit](../sims/cicada2013_os_source_callgraph_sft.cjs). The original 2013 archive mirror files have Git blob SHA-1 `d4798f10c44efc34cdf651d5054d2a7663c8e8a4`, `65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649` and `93484d6a3612eb8032d4c38bf7ff3da0d358e9ac`, respectively.

**Scope:** the direct authored `cicada` → `prime_echo` → `message.txt` execution cannot itself open or consume the 3,368-byte `wisdom`/`folly` object, under ordinary ash and utility semantics. This does **not** prove a whole-OS dynamic syscall negative: unexamined init/service paths, implementation quirks in underlying BusyBox utilities, or externally supplied invocation could access the object. The full rootfs's separate zero-reference scan remains a bounded negative for explicit names, and no independently authenticated alternative consumer has been recovered.

The exact original-ISO extraction pipeline is in [`.github/workflows/cicada2013-os-iso-consumer-manual.yml`](../.github/workflows/cicada2013-os-iso-consumer-manual.yml), with successful [source-input job 130905318329](https://github.com/FlareZ123/liber-primus/actions/runs/43134159903/job/130905318329). The independently preserved `DATA/560.*` ISO assets and audio are separate from the `BOOT` rootfs and were not included in this pathname-consumer census.

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

- **Established here:** original archived ISO and boot-rootfs re-extraction, two named paths holding the identical 3,368-byte high-entropy object, no literal path/name consumer anywhere else in the extracted regular files or symlinks, and no file-reading/constructed-path consumer in the complete authored direct startup plus 464-step prime-printer scripts. No readable prime/totient/count/key instruction was found in the recovered bytes.
- **Not established:** why the author placed the object in the OS, whether it was intended as a pad for another 2013 stage, or whether it was ever consumed by the original puzzle.
- **LP2 consequence:** no source-selected LP2 target, alignment, or inverse follows from the filenames or the binary statistics. Published bounded pad tests found no LP2 match in their tested families. Do not repeat those families or infer a new LP2 key from the name “wisdom.”
- **Remaining interpretation limit:** the original ISO has now been recovered and re-extracted byte-for-byte. The tested absence of literal consumer names does not rule out path construction at runtime or externally supplied instructions; none is presently source-established. The ISO download is an archival copy and is not independently shown byte-identical to a 2013 live CD distributed directly by Cicada.

**Disposition:** close the original-ISO and literal-consumer issue as a bounded source negative. Reopen only if an independently selected reader/operation or a new original witness establishes an executable use of these bytes.
