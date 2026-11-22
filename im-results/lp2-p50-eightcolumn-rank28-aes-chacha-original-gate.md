# Original LP2 rank28 nonrepeat inverse keyed by the eight p50 byte columns

**Agent39, 22 November 2026. Independent replication and narrower explicit escape variant of an already rejected cipher family.** The 1,024 complete-section attempts yield no GP-native prose, authenticated Cicada key, or unknown-page plaintext. The independent solved-page encrypt/decrypt controls pass for every configuration. **Important predecessor:** [Agent5/12's substantially broader existing grid-rank28 result](grid-rank28-keyed-exclusion.md) already tested eight grid-column keys with AES/ChaCha, both rank conventions, and exact 8! key assignments. This investigation therefore does **not** establish a new general architectural exclusion; it adds only an exact 29-symbol reversible EA-escape sentinel formulation and an independent original-corpus positive-control reproduction. The key-independent period-1..256 obstruction obtained separately is [here](lp2-rank28-period1-256-allsecret-native-e-capacity.md).

## Source hypothesis and lossless inverse

The authentic physical pp49–51 numeric panel has 32 rows and eight columns of two-character numerals. Under the conditional conventional base60 byte reading, each vertical column is exactly 32 raw bytes, a possible 256-bit symmetric cipher key. Independently the 12,956 unsolved GP29 runes contain only 86 immediate equal-rune pairs, with near-uniform nonrepeating predecessors. A 2014-compatible way to represent 28 regular plaintext rune classes is to select one of the 28 output runes different from the preceding ciphertext rune, reserving the 29th plaintext class for a literal ciphertext repeat. This is a *hypothesized* invertible cipher, not a printed instruction. No first-party source specifies AES, ChaCha20, a zero IV, rank28, or that the GP symbol EA should be the repeat sentinel.

The exact 8 original $-delimited sections have rune counts **[729,1145,1738,1894,1021,1433,1680,3316]**, together covering all **12,956** unaltered original unknown runes and **2,896** printed words. For each section and each of the eight literal table-column keys, obtain deterministic keystream bytes from AES-256-CTR or ChaCha20 with their conventional **16-byte all-zero IV**. Read the byte stream as mod28 digits or discard bytes ≥224 before reducing mod28. Both are explicitly stipulated candidate conversions, without source authentication.

For adjacent original ciphertext GP indices `C[i-1],C[i]`, the plaintext inverse is:

- If equal, assign the reserved native GP rune **EA**, index28.
- Otherwise calculate rank `R` among the 28 other ciphertext rune identities, either cyclically `(C[i]-C[i-1]-1) mod29` or in ascending sorted rune order `C[i]-(C[i]>C[i-1])`. Decode `P[i] = (R ± K[i]) mod28`.
- Preserve the first cipher rune of each section as an **unclaimed IV**, excluded from lexical scoring. It is not asserted to be recovered plaintext.

The encoder uses the inverse mapping: plaintext EA emits the previous ciphertext rune, and any other plaintext symbol selects a distinct ciphertext rune by the keyed rank. This exactly represents all 29 original plaintext classes and retains every rare repeated ciphertext position, unlike a lossy anti-repeat rewrite.

This is **8 original sections × 8 actual table keys × 2 ciphers × 2 byte projections × 2 rank conventions × 2 signs = 1,024** distinct complete-section inversions. Each is applied to the unchanged source without fitted phases, word reconstructions, secret key recovery or cipher edits. Using each key against each section also covers the possibility that key-to-section assignment is permuted.

## Original results and positive controls

All 1,024 original inverses exactly forward-reencrypt their original section's every source rune. These roundtrips are mathematical implementation invariants and are **not cryptographic success evidence**. The additional 128 positive plants encrypt the authentic 95-rune solved p57 plaintext under the same keys/algorithms/conventions, with three independent forced EA sentinels at positions 7,11,23; every plant both recreates the deliberate ciphertext equalities and recovers all **95/95** plaintext symbols exactly.

Original, full-length results:

| Predeclared check | Original outcome |
| --- | --- |
| Highest decoded GP29 index of coincidence in any of the 1,024 complete-section inversions | **0.03733542935743761**, section0, AES-256-CTR, original table column0, cyclic rank, raw-byte mod28, plus sign |
| Native clear solved p57 GP29 index of coincidence | **0.06270996640537514** |
| Highest source-native Gibran-dictionary rune coverage in any complete section | **34 of 1,893 scored positions = 0.01796090861**, section3, ChaCha20, column3, unbiased byte reduction, sorted rank, minus sign |
| Most matched whole words in a complete section | **23** (section7, 3,315 scored runes); all are isolated short-word coincidences |
| Highest matched dictionary words of length at least 4 runes in any per-section lexical leader | **2**; no sustained recognizable GP prose |
| Planted original-solved-source encrypt/decrypt controls | **128/128 pass** |
| Original complete-section inversions and reencryption controls | **1,024/1,024 pass** |

In every section, the independently best lexical candidate covers at most **1.80%** of its source runes and has IoC between **0.0350 and 0.0357**. Its recovered first-60 GP tokens are nonlinguistic; 8 complete-section winners are printed verbatim in the executable output. The original-source best cases all remain near the uniform GP29 baseline **1/29≈0.03448** and far below actual solved GP-native language. The rare repeats survive as EA everywhere by construction, but this does not reveal a genuine plaintext symbol.

**Reproducer:** [standalone Windows Node22 CommonJS SFT](../sims/lp2_p50_rank28_aes_chacha_original_sft.cjs) reads the original checked-in GP29 corpus, full printed words, and original-derived numeral table. [Passing GitHub Actions run 45060251533](https://github.com/FlareZ123/liber-primus/actions/runs/45060251533) preserves the full 1,024-case top candidate metrics and 128 source-native positive controls.

## Cryptanalytic decision

Retire the literal eight-column AES-256-CTR/ChaCha20 zero-IV **keyed rank28 no-repeat** mechanism in the frozen two rank and two byte-serialization registers as a direct decoding route to ordinary GP-native plaintext. This source-specific result **overlaps** the earlier comprehensive eight-grid-column [AES/ChaCha rank28 key test](grid-rank28-keyed-exclusion.md), which already excluded the direct alphabet-ranked original family with more candidate key orders. The present explicit reversible EA escape mapping is a minor independent consistency check, not justification for renewed grid-cipher sweeps. It does not disprove other source-selected keys/nonces, plaintext languages, state-dependent ciphers, or genuine hidden side channels. Neither numerical table geometry nor the manuscript's repeat deficit identifies the cipher mode. Investigate those branches only when an independent original clue supplies the missing transformation, nonce, key selection, or a complete unknown plaintext holdout.
