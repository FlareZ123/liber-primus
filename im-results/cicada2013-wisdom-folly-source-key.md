# 2013 Cicada OS wisdom/folly bytes: original LP2 source-key gate

**Classification:** reproduced external historical source, finite original-cipher negative. No unknown plaintext, cryptographic key, mechanism or destination recovered. Agent 6, 10 November 2026.

## Historically distinct source material

The public [Cicada OS archival mirror](https://github.com/krisyotam/cicada3301/tree/main/puzzles/2013/cicada-os/tmp) contains same-byte files `wisdom` and `folly`, each **3,368 bytes**, with identical Git blob SHA-1 `62b1b949a1e4e4a346e75b1c34101000d3c53220`. The recovered binary has SHA-256 `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`. Both byte names occur among Cicada/LP1 themes, and earlier Cicada stages used external random binary as XOR operands, motivating a direct source-key hypothesis. The files are **not established LP2 keys**. Their equality in the same mirror is a single archival witness, not an independent Cicada signature. A byte-for-byte offline base64 copy and context live in [resources/historical](../resources/historical/cicada2013-wisdom-folly.md).

The exact original bytes have all 256 byte values and empirical byte Shannon entropy **7.9376664435 bits/byte**, consistent with high-entropy data. The original LP2 unsolved material contains **12,956 GP ciphertext runes** over **55 rune-bearing pages** (physical pp0–55 excluding runeless p50). This input source is therefore shorter than the rune stream. The tested one-layer models cycle the 3,368 bytes and expose all wraparounds; no unsupported pad-length assumption is made.

## Finite original-input inverses and key recovery controls

The [offline no-dependencies SFT](../sims/cicada2013_wisdom_folly_source_gate.cjs) pins the source's original **Git object SHA1**, byte length, SHA-256, and exact LP2 corpus counts. It tests **24 complete-book source-key inverses**, differing only in the following finite, declared parameters:

- Direct GP29 additive rune pad using either `byte mod 29` or `floor(byte×29/256)`, both signs, either a continuous 12,956-rune key clock or a page-reset key clock: **8 cases**.
- Transparent-repeat GP28 predecessor-difference decoder: identical ciphertext pair emits EA and the first glyph is an IV; every other difference uses either nonzero delta rank `delta−1` or `log₁₅(delta)`, with byte reductions mod28 or scaled28, both signs and book/page key clocks: **16 cases**.

All **24** original-input inversions re-encode precisely back to the original 12,956-runic ciphertext. Independently, all **24** models also encrypt and recover the authentic solved page-56 GP plaintext, with explicit EA controls for the GP28 family. The full model records and controls passed [manual GitHub Actions 42919816345](https://github.com/FlareZ123/liber-primus/actions/runs/42919816345).

**Page-specific recovery check.** Because individual LP2 sections may use independent keys, the same SFT also scores every eligible original physical page separately, requiring at least **140 runes** to avoid tiny-page variance. Across **1,176** model/page combinations, the highest local IoC is **0.0409999204** on p15 (159 runes), from the sorted GP28 register with page-reset, byte%28 and negative sign. Among the source-salient first three pages (729 runes, 27×27), the strongest local IoC is only **0.0379104478** on p2 (201 runes), from the log15 GP28 register with page-reset and scaled bytes. No isolated page reaches the GP-language-type concentration expected from a successful direct pad. The expanded page-local gate passed [manual CI 42920517491](https://github.com/FlareZ123/liber-primus/actions/runs/42920517491); the 24 native-GP plants and all exact original reencryption checks remain successful. These local scores are descriptive maxima after a 1,176-comparison screen, so they are not independent anomaly p-values.

The raw original ciphertext GP29 index-of-coincidence is **0.0344783978645** (uniform baseline `1/29≈0.03448276`). The **largest** decoded original IoC of all 24 cases is only **0.0352952349245**, from the transparent-repeat GP28 base-15-log register with scaled byte reduction, negative sign and page-reset clock. The best ranked outputs are still incoherent as ordinary GP-English ciphertext recovery, and no valid source key or plaintext is authenticated. This is a **bounded exclusion of a direct cyclic byte-to-rune pad**, not a claim that arbitrary higher-level key derivation from the archived file fails.


## Exact 58-page / 29-symbol matrix interpretations of the 2013 binary (Agent 41, 11 November 2026)

The source is exactly **3,368 bytes**, admitting two tempting factorizations:

- (3,368 = 4 + 58^2): a four-byte prefix followed by a 58×58 byte matrix (or a 58×58 matrix followed by four bytes). The manuscript release has 58 physical pages.
- (3,368 = 4 + 4(29^2)): a four-byte prefix followed by four 29×29 byte matrices. The alphabet has 29 symbols.

These are exact length identities, not independent evidence that the binary was designed as a page key or Hill key. The most direct consequences were tested against original LP2 using the natural byte-to-GP29 reductions (b\bmod29) and (lfloor29b/256\rfloor).

### 58×58 page-key reading

For each physical page number (p), take row (p) or column (p) of the 58×58 matrix as that page's 58-byte key, repeat it within the page, and apply direct additive/subtractive GP29. Both natural framings (first four bytes as prefix vs final four bytes as trailer), both matrix orientations, both byte reductions, and both signs give **16** variants. Physical p50 has no runes and is skipped; all other 55 unsolved pages are tested in original page order.

- Original full-book IoC: **0.0344783979**.
- Best of the 16 page-key inverses: **0.0345271691**.
- Best local page IoC among pages with at least 140 runes and all 16 variants: **0.0383144836**.
- Every candidate exactly reverses under its opposite additive sign; no decoded output approaches native GP-English concentration.

### 58×58 Hill reading

Treat the same 58×58 matrix as a GP29 Hill key on consecutive 58-rune blocks of the concatenated original unknown stream. Test both byte reductions, both orientations, both natural four-byte framings, and both direct/inverse directions. Singular matrices are rejected rather than repaired. Of the 16 declared configurations, **12** are invertible.

The 12,934 complete-block symbols (the original stream has a 22-rune remainder modulo 58) remain ciphertext-like. The best decoded IoC is **0.0345058582**. Every invertible configuration passes an exact inverse round-trip on its complete blocks.

### Four 29×29 Hill rounds

Treat the first four bytes as a prefix and the remaining 3,364 bytes as four consecutive 29×29 matrices. Compose the four matrices in source order or reverse order, testing row/column layouts, both byte reductions, and direct/inverse readout: **16** variants. All are invertible under the tested reductions.

The best IoC over 12,934 complete 29-rune blocks is **0.0345183407**; the 22-rune remainder is not scored. Exact forward/inverse round-trips pass.

**Decision:** the exact 58² and 4×29² size relationships are worth recording, but their most direct page-key and linear-matrix readings do not decrypt original LP2. Retire these precise additive and Hill interpretations. Do not infer that the historical binary has no role in LP2; any further use requires a new source-visible operation that selects a different transformation or key schedule.

**Reproducer:** [`sims/cicada2013_wisdom_folly_matrix_gate.cjs`](../sims/cicada2013_wisdom_folly_matrix_gate.cjs). This is a bounded original-input study, not an established plaintext or key.

## Decision and reusable next step

The historical binary provides a recoverable, physically distinct source input to the shared LP2 investigation, but its known-content direct-pad inverse is negative. Do **not** expand this into unchecked hash/KDF/cipher menus without a manuscript clue or authentic historical instruction selecting the operation. Potential roles of the file as a seed to a specific independently sourced algorithm, a steganographic carrier, or a message unrelated to LP2 remain unknown. The same-byte source can be reused by future agents without reacquiring its archival bytes.
