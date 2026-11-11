# Two empty 13-dot fragments as a fixed AES-128 source key: original-input gate

**Agent 31, 11 November 2026. Classification: source-selected exploratory mechanism with a complete original-cipher negative. No unknown LP2 plaintext, authentic key, or decipherment recovered.**

## Upstream source constraint and concrete idea

The **31 separately printed thirteen-dot marks** delimit the 58 physical pages' rune sequence into **32 chronological intervals**, exactly two of which are empty: indices **8** (coincident red/black punctuation after p7:194) and **11** (p14 terminal event immediately followed by p15 initial event). The printed p49–51 table contains **32 distinct rows of eight numeric tokens**. These source facts were established earlier in the [closed Issue #3 discussion](https://github.com/FlareZ123/liber-primus/issues/3) and original image/annotation sources; the fact that the empty rows' bytes differ exactly forbids any stationary unkeyed fragment→row function without a changing index, salt or state.

A different possibility arises without fitting unknown ciphertext: use the *two distinct empty-interval row positions* as a selector for a **16-byte AES-128 key**, concatenating table rows 8 and 11, and interpret the **other 30 rows as 240 bytes = 15 complete AES blocks**. In the conventional source base-60 codec:

- row 8 = `7aff19c0c749a96c` (8 bytes)
- row 11 = `d3dcc631ec543823` (8 bytes)
- 8||11 is a fully specified 16-byte candidate key; 11||8 is its only tested order competitor.

This **is an invented potential use of source-selected bytes**, without a historical instruction to encrypt or discard the empty rows, a known IV, authenticated AES selection or a source-verified message layout. Original page indices and the competing radix-59 codec are explicitly frozen. As a puzzle route it is less contrived than unrestricted key hunting, but still must recover original text to earn credibility.

## Frozen test and exact original data

[CommonJS/Node22 SFT](../sims/lp2_empty_fragment_aes128_source_gate.cjs) reads the unmodified 32×8 original token table and 12,956 original GP29 indices from `resources/liber-primus/`. It performs:

1. Both documented **base-60** and **f-omitting base-59** source decoders; both exact source token round trips.
2. Two concatenations 8||11 and 11||8; removing row positions 8 and 11 in their original chronology gives exactly 240 bytes.
3. AES-128-ECB, AES-128-CBC (all-zero IV), AES-128-CTR (all-zero IV/counter) and a repeating 16-byte XOR *table-payload test*, exactly 2×2×4=16 readouts.
4. Independently, AES-128-CTR source key bytes as a **complete 12,956-rune direct-GP29 stream** with two key orders, two byte-to-rune reducers (`byte%29` and `floor(byte*29/256)`), signs ±, for **16 original full-ciphertext candidates**. This latter test does not assert the table's remaining bytes are a message.
5. An independently specified source-native GP-English plant is encrypted with actual selected AES-CTR keys and recovered exactly, with **4/4 positive controls**. This confirms correct modular inversion but is *not* evidence of key authenticity.

Node 22 executed all tests on the original complete source using the manual-only workflow probe `empty-fragment-aes128`. [Successful GitHub Actions run 42969679673](https://github.com/FlareZ123/liber-primus/actions/runs/42969679673) contains exact readouts, byte hashes, previews and per-variant IoCs. The script does not generate pseudo-original samples or rewrite the sources.

## Outcome

- All **16** table-body decodings remain nontextual. Across tested ECB/CBC/CTR/XOR modes, printable fractions range **0.3458–0.4417** and the share of byte values 0–28 ranges **0.0792–0.1833**. No readable message or recognizable structure appears in the first 32 decoded bytes; all AES plaintext SHA-256 hashes are retained in the CI log.
- All **16** original 12,956-rune GP candidates remain nonlinguistic. Their full-length IoC lies **0.03445666–0.03452632**, surrounding the uniform GP29 benchmark **1/29≈0.03448276**. The largest is **0.03452632303927112**, obtained with base59, key order 8||11, `byte%29`, GP arithmetic sign +. Its first 64 GP transliteration is `AEULAYSAEEONGAEHWEFEFWOTHEOEAEJAMGOPTNRPFOIABTDNNGLTYENBDONRLOPXPNGOEEAMIANGNGWTH`, containing incidental short letter groups without coherent language. A local p0 selection had best IoC **0.03702729** but collapses to **0.03449441** over the full original book, demonstrating why source-complete text matters.
- Positive-control inversions recover the known planted GP indices exactly **4/4** and there are no run failures. Exact inverse on synthetic text is an implementation regression, and every bijective inverse would likewise re-encode original ciphertext.

## Decision and exclusions

**Reject this frozen AES-128 row8+row11 direct table decoder and zero-counter direct-GP29 inverse as a source-authenticated solve route.** The finite negative applies only to these specific modes, IV, raw key ordering and stream reducers. It does not exclude a separately historically prescribed AES usage with an authentic nonce/key derivation, a non-GP plaintext transport, or key material encoded in other source structures. However none of those missing selections currently has evidence, so avoid expanding this branch by tuning cipher families, IVs, row skips, salt or 256-byte mappings to improve chance fit.

The two genuinely empty 13-dot intervals remain an exact source constraint. Progress on this path needs an independent instruction specifying what the empty intervals mean, or a frozen reversible original-cipher decoder that recovers real text beyond control-level patterns.
