# P50 32×8 byte table as fixed 2014 SHA digest lanes

**13 November 2026, Agent35. Classification: bounded source-exact negative.** The 2014 physical p49–51 table contains exactly **256 decoded bytes printed in 32 rows × 8 columns**. The same 2014 release's solved physical p56 displays an explicit **128-hex-character, 512-bit content-hash target**. Both were accessible to a contemporary puzzle solver. The original layout suggests checking whether the table stores independent 32-byte SHA-256 digests, or four 64-byte SHA-512 digests matching the later target or other published source objects. This is a newly tested literal-encoding hypothesis, not evidence that the puzzle author used a digest table.

## Source-fixed interpretations and decisive consumers

The [self-contained CommonJS SFT](../sims/lp2_p50_digestlane_original_sft.cjs) reads the repository's canonical [table source](../resources/liber-primus/base60-grid.json), checks its 32×8 shape, and pins the SHA-256 digest of the complete unmodified 256-byte row-major table as `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The two natural 32-byte and two natural 64-byte ways to respect the printed axes are frozen before any source-file comparisons:

| Digest interpretation | Printed-axis grouping | Candidate blocks |
| --- | --- | ---: |
| SHA-256 | Eight complete **columns** of 32 original bytes | 8 |
| SHA-256 | Eight consecutive **four-row** strips, each 4×8=32 bytes | 8 |
| SHA-512 | Four successive **two-column** strips, each 32×2=64 bytes | 4 |
| SHA-512 | Four consecutive **eight-row** strips, each 8×8=64 bytes | 4 |

Total: **24 original-byte candidate blocks**. Neither shifting, byte swapping, reversed orientations, secret salts, hash algorithms chosen after the fact, nor fitted ciphertext keys are tested.

A separate source-native check compares the eight frozen 64-byte table blocks against the **exact original p56 printed 512-bit target**, transcribed in [the master original-page text](../resources/transcriptions/liber_primus_master.txt), beginning `36367763ab73783c7af284446c` and ending `4568926a49fb4f45132c2a8b4`. No block equals the p56 target.

Next, the SFT hashes **98 explicitly selected repository artifacts**: the **75 original 2014 Liber Primus JPEGs, 00.jpg–74.jpg**, and **23 pre-existing 2014-related source/derived files** in `resources/`, `resources/external/`, `resources/external/derived/2014-stage04/`, and `resources/historical/`. Each raw file is hashed with exactly SHA-256 and SHA-512. The 196 file digests are compared against the 16 or 8 correspondingly sized candidate blocks, a total of **2,352 equality comparisons**, with **zero matches**. In both source-native layouts, checking whether a block hashes directly to its next block under the matching digest gives **zero adjacent hash-chain links**. The SFT constructs two synthetic raw-file digest plants and verifies both match exactly while a one-byte altered plant fails.

## Execution and inference

The **[successful original-repository Windows/Node22 run 43385333196](https://github.com/FlareZ123/liber-primus/actions/runs/43385333196)** printed:

```text
P56_SHA512_TARGET_LANES []
DIGEST_LANES original_bytes=256 sha256_lanes=16 sha512_lanes=8
SOURCE_ARTIFACTS 98 EXACT_DIGESTS 196
MATCHES []
DIRECT_SHA256_CHAIN_EDGES []
DIRECT_SHA512_CHAIN_EDGES []
SELFTEST_PASS exact source, 75 original JPGs, fixed layout, digest plants
```

The source p56 hash gives the SHA-512 branch a contemporary clue-to-operation rationale. SHA-256 is a historically available alternative suggested by the 32-byte column geometry. These two simple SHA families and the printed groupings **do not identify the table as direct hashes of the preserved 98 source files**, the p56 target itself, or a direct successive hash chain. Additional unknown input assets, a keyed digest, another derivation, or another cipher could evade this test, but no original clue specifies them. In particular, this does **not** reject the independent p50 finite-field factor relationship, recover unknown-page plaintext or supply an authentic continuation.

**Decision:** retire the direct digest/chain interpretation for the tested source set and table framing. Reopen only on independent evidence of a specific hash preimage or authored alternate digest consumer. Avoid expanding to arbitrary output rotations and encodings.
