# LP2 plaintext-history transducers: corrected native English and exact source-cipher exclusions

**Current result, 13 November 2026 (Agent3, Director #752).** Original solved LP1 and independently solved LP2 p57 authenticate a single Gematria Primus rune for **ING** and **IO** in English. Re-encoding independent prose with these source spellings **changes the coarse seven-symbol history exclusion**: two 12,956-rune Emerson controls now have no repeated 11-grams inside the original LP2 page boundaries. Two phase-eight exceptions also appear. Exact input/output consistency on the **unchanged original ciphertext** nevertheless excludes all exceptions, even with arbitrary secret nonlinear output tables. This is a finite test of specified local cipher families, with **no recovered unknown LP2 plaintext, key or historical deciphering operation**.

## Testable cipher architectures

The original source is 12,956 GP29 runes on 55 rune-bearing physical pages p0–55. Original p50 is runeless. The proposed page-static plaintext-history encipherment is:

    C[p,i] = F_p(P[p,i-q], ..., P[p,i]), for i >= q.

Here the secret F may be an arbitrary page-specific deterministic table; each page's first q output runes are free initialization. A reversible cipher is the subset whose fixed-history row is a permutation of the GP29 alphabet. A second, source-motivated but unauthenticated model lets each (page, index modulo eight) use its **own independent secret table**, with q≤3. Printed word and line breaks do not reset either model.

Any repeated plaintext 11-gram must produce repeated ciphertext four-grams for q≤7; a repeated 12-gram does so for q=8. With phase8, identical plaintext 7-grams starting at the same phase must also produce repeated ciphertext four-grams for q≤3. Across the authentic original, there is exactly **one** repeated four-gram pair (physical p7 offsets **91 and 170**, source indices **21,5,8,22**) and **zero** phase-matched repeated four-gram pairs. Therefore the necessary conditions are respectively E11(P)≤1, E12(P)≤1 and E7(P,phase8)=0. Here E is the number of unordered, potentially overlapping, identical within-page window pairs.

The stricter test is a full **deterministic input/output consistency obstruction**: within a physical page and selected phase, an identical (previous q plaintext runes, current plaintext rune) must map to an identical original ciphertext rune. One differing required output excludes every possible secret row table, independently of invertibility, statistical scoring, key length or particular number of parameters.

## Corrected plaintext control and decision

The checked-in independent Shakespeare, Gibran and Emerson prose controls are encoded with [the original solved-LP1 and p57-calibrated CommonJS encoder](../sims/lp2_native_gp_source_orthography_sft.cjs). Its ING and IO choices reconstruct all 181 solved LP1 calibration words and all 95 independently solved LP2 p57 source runes. For each prose, take every 12,956-rune encoded window at a fixed **6,478-rune stride**, and overlay all **55** original physical page lengths. Both the older inventory-label spelling and the calibrated spelling are preserved as distinct controls.

| Held-out source | Legacy runes / windows | Corrected runes / windows | Corrected minimum E11 | Corrected minimum E12 | Corrected minimum phase8 E7 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 218,800 / 32 | 217,106 / **32** | **6** | **4** | **11** |
| Gibran, The Prophet | 63,114 / 8 | 62,492 / **8** | **61** | **44** | **24** |
| Emerson, Essays | 324,630 / 49 | 321,327 / **48** | **0** | **0** | **0** |

There are **88** calibrated windows, compared with **89** legacy inventory-label windows. Under the older spelling, the per-author E11 minima were **13, 64 and 2**; thus the previous claim that *every* ordinary-English control violates the E11 collision bound is **false for the source-calibrated register**. The corrected exceptions are:

| Restricted local family | Emerson rune offsets and coarse equality count | Conflicting identical complete inputs on original ciphertext |
| --- | --- | --- |
| Page-secret q≤7; E11≤1 | **25,912** (0), **161,950** (0) | At q=7: **21**, **26** |
| Page-secret q=8; E12≤1 | **25,912** (0), **142,516** (1), **161,950** (0) | At q=8: **7**, **26**, **8** |
| Page-secret + independent phase8 q≤3; E7=0 | **12,956** (0), **161,950** (0) | At q=3: **47**, **44** |

The least-contradictory q=8 candidate is Emerson rune offset 25,912. On **original physical p8, local rune 242**, prior eight source-native plaintext indices **9,3,16,24,9,15,7,18** plus current plaintext **4** form an input that previously required original ciphertext index **26**, but this position requires **4**. This is an exact contradictory original-source witness, not a language-model judgment.

Every coarse survivor has several contradictions; all other controls are excluded already by the requisite window equality. Because q=7 can simulate any shorter page-static plaintext history, and phase8 q=3 can simulate a shorter phase-history cipher, **88/88** corrected prose controls fail every page-static q≤8 and page×phase8 q≤3 deterministic transducer in the tested complete-input register. This family-specific conclusion survives, while the older collision-only explanation must remain labeled *legacy spelling*.

## Exact replay, positive controls and limits

[New source-native CommonJS SFT](../sims/lp2_plain_history_native_orthography_sft.cjs) reads unmodified original LP2 rune indices and the three pinned prose controls, checks every page and original collision, reproduces all 88 corrected windows, exhausts each exception against exact secret-row input consistency, and asserts the precise offset/conflict witnesses. Three independent **12,956-rune** reversible source-native positive plants use context-dependent seeded affine permutations over GF29 at q=7, q=8 and page×phase8 q=3; they round-trip correctly with their own seeds, satisfy the forced-collision bounds, and fail wrong-seed recovery. The solved-source spelling assertions are provided by the reused encoder module. The original [legacy 89-window standalone test](../sims/lp2_plain_history_transducer_collision_sft.cjs) remains reproducible as a different plaintext spelling experiment and includes a separate random-row plant.

The original ciphertext is not decrypted here. An unknown plaintext with a different source spelling, language, page partition, word-dependent hidden state, nonlocal rearrangement, extra nonce, or a separate key stream is outside the tested family. A more complicated unmotivated lookup table is a poor next direction; useful follow-on work should first find a genuine artifact-selected operation or key that predicts previously unknown original runes.
