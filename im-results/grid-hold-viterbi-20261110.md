# Hidden hold-key repair applied to LP2's base-60 table

**Status (2026-11-10): no plaintext recovered.** This is an intermediate attack, not an established LP2 encryption mechanism. The tested grid-key family is incompatible with a direct, straightforward English-like decrypt at the scanned pages under the specified 29-symbol model; other grid derivations remain open.

## Cryptanalytic motivation and distinct mechanism

The 256-byte base-60 table spans scans 66–68 and can be read in physical order, reverse order, or either transposed direction. Earlier shared-repository tests modeled additive ciphers and collision **key-skips**. External controlled work by pnotisdev on an "M04" repair identified a meaningful blind spot in a conventional forward-moving decoder: a repeated candidate output can instead be *replaced*, while the key index is **held** for that emitted rune. A held step permanently changes subsequent key alignment.

I implemented a decoder that handles this hidden alignment exactly within a specified bound. At plaintext position t with key index j:

- Propose x = (P_t + sign * K_j) mod 29.
- If x differs from previous emitted C, emit x and spend one key.
- If x repeats previous C, emit x and spend one key with probability 0.19, or emit a **uniformly selected different** rune with probability 0.81 while keeping j unchanged.

In decryption, the normal event deterministically implies P_t = (C_t - sign*K_j) mod 29. A repaired event instead implies P_t = (C_(t-1) - sign*K_j) mod 29, with observation likelihood 0.81/28. Each repair adds one to the hold count h, so j = t - h.

The dynamic program uses state (h, last two plaintext runes), a GP-rune trigram model trained once on a Shakespeare control, and an exact log-sum-exp forward recurrence over all admissible hidden repair paths (bounded h). A parallel Viterbi recurrence provides one highest-probability path and a concrete recovered plaintext on known-positive data. This removes the maximum-path multiplicity bias from the key ranking. The procedure is an **English-register** screen.

## Reproducible scan

[Code](../sims/grid_hold_viterbi.cjs), [manual-only runner](../.github/workflows/grid-hold-manual.yml), and [successful run 42746278014](https://github.com/FlareZ123/liber-primus/actions/runs/42746278014). Input: canonical LP2 indices, original base-60 byte table, historical prime and rune order. The grid is mapped to 29 symbols by byte modulo 29. Test eight variants (four directions times two signs), all 256 offsets, with the same early-screen/late-screen protocol in real, null and positive data. For each variant, the top 12 offsets on the first 72 runes survive to a full-page forward-likelihood rerank. The capped number of holds is ceil(0.07*N)+6. A cap is part of the specified cipher family and can miss more frequently held streams.

The observed maximum is calibrated against **20 independent shuffled-byte-table nulls per page**, which preserve the source table's byte histogram and apply the complete 2,048-setting scan. The page set was chosen before scoring: p0 (first section), p20 (interior), p49 and p51 (flanking the table-only p50), and p55 (near the last encrypted page).

| LP2 page | Runes | Best forward log-likelihood | Shuffled-table mean ± SD | Upper-tail p |
| --- | ---: | ---: | ---: | ---: |
| 0 | 262 | -1002.091 | -999.004 ± 5.115 | 0.667 |
| 20 | 269 | -1027.152 | -1028.094 ± 5.105 | 0.429 |
| 49 | 66 | -235.973 | -240.299 ± 2.876 | 0.095 |
| 51 | 92 | -344.372 | -341.770 ± 3.647 | 0.714 |
| 55 | 76 | -269.319 | -279.211 ± 3.002 | 0.0476 |

The 0.0476 value is **one finite-null tail in 21** with only 20 null replicates. It is a five-page, post-screen maximum; even a simple Bonferroni correction gives 0.238, not significant. There is no independently recovered natural-language run, and the page-55 score remains far below the planted English-register likelihood. Its 76-runic length gives little independent evidence beyond the 72-rune selection prefix. No key offset or table orientation has been established for the manuscript.

## Positive control

Encrypt 262 independently sourced solved-text GP runes with the actual table (physical row direction, sign +1, offset 37) under the repair rule above. With deterministic planting seed 571508818, there are four hidden holds. The identical unrestricted orientation/sign/offset candidate-selection search recovers **row direction, +1, offset 37** as the global maximum, with forward score -630.744. Decoding at the true settings gets **257/262 original plaintext runes correct (98.09%)** and recovers four held steps. The planted control demonstrates sensitivity to the model when a grid-derived key really generated the text; it does not confer evidential value on a random high-scoring short real page.

## What remains untested

This experiment targets only the byte-modulo-29 mapping, the declared per-page key start, a fixed 0.81 collision-repair probability, and a natural-English GP plaintext register. It does not cover an unknown nonlinear grid transform, an AES/ChaCha-derived keystream under a different seed interpretation, changing alphabet permutations, section-specific plaintext dialects, or hidden-word insertions. The model fits **no authenticated decryption** and should not be promoted to results/README.md.

The next useful lane would require a *clue-supported* key derivation or a cipher mechanism whose output produces text with enough distinct structure for verification. Expanding arbitrary parameter grids without a key source would risk a look-elsewhere false positive.
