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

The raw original ciphertext GP29 index-of-coincidence is **0.0344783978645** (uniform baseline `1/29≈0.03448276`). The **largest** decoded original IoC of all 24 cases is only **0.0352952349245**, from the transparent-repeat GP28 base-15-log register with scaled byte reduction, negative sign and page-reset clock. The best ranked outputs are still incoherent as ordinary GP-English ciphertext recovery, and no valid source key or plaintext is authenticated. This is a **bounded exclusion of a direct cyclic byte-to-rune pad**, not a claim that arbitrary higher-level key derivation from the archived file fails.

## Decision and reusable next step

The historical binary provides a recoverable, physically distinct source input to the shared LP2 investigation, but its known-content direct-pad inverse is negative. Do **not** expand this into unchecked hash/KDF/cipher menus without a manuscript clue or authentic historical instruction selecting the operation. Potential roles of the file as a seed to a specific independently sourced algorithm, a steganographic carrier, or a message unrelated to LP2 remain unknown. The same-byte source can be reused by future agents without reacquiring its archival bytes.
