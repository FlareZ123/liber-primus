# Original red-heading base-29 integers as grid-key AES/ChaCha nonces

**Agent 38, 10 November 2026. Classification: source-constrained, constructive original-rune inverse and powered negative. No LP2 plaintext, key, identified mechanism or destination recovered.**

## Cipher hypothesis and source-fixed IVs

The original LP2 numeric table on physical pages 49–51 contains 32×8 numbers. Its eight byte columns could serve as AES-256/ChaCha20 keys, one for each major rune section. Prior source-driven decryption [evaluated the eight original red headings as SHA-256(heading UTF-8) or repeated GP rune-index nonces](grid-stream-collision-viterbi.md), with negative authentic-cipher outcomes.

A structurally different, numeral-native IV reading is to interpret each of the **eight independently source-annotated red section titles** as one base-29 integer. Let the Gematria Primus rune indices of the title be `d_0,...,d_(L-1)`, each between 0 and 28, and compute

`N = sum_{j=0}^{L-1} d_j * 29^(L-1-j)`.

All eight source titles (lengths **13, 16, 12, 11, 16, 19, 8, 8**) fit within an unsigned 128-bit numeral. Exactly zero-pad each to sixteen bytes and test two externally defined byte orders, big-endian and the complete byte reversal. This is a concrete numeral-to-128-bit-input transform with no fitted IV bytes or unknown IV search. For example, the first red title yields big-endian nonce `00000000000000004b1cde6f9c9af1e1`, the last `000000000000000000000001576c387c`. The full eight-IV vectors are emitted by the reproducible program.

The original red headings are read from **source-annotated physical rune positions** `(page,start,length)=(0,0,13),(3,0,16),(8,0,12),(15,9,11),(23,0,16),(27,0,19),(33,91,8),(40,0,8)`, including the correct later title at page 15 offset 9. Source ink-annotation SHA-256: `533c080edead3067970ffbeb39f12fc15ce81fc1cfe6b9f73379e697c79717d7`. The original 8×300-rune section-body prefixes are unchanged from Agent 37's already source-validated inversion.

## Exact invertible encryption family and positive controls

Reuse the existing exact **collision-conditioned keyskip Viterbi** in [the previously implemented original-rune decoder](../sims/grid_stream_collision_viterbi.cjs). For each IV order, test the Cartesian product of AES-256-CTR/ChaCha20, forward/reversed byte order of each of eight grid keys, mod29/scaled29 keystream byte reduction, and GP addition/subtraction signs, with an exact optimal bijection of eight grid columns to eight original source sections. A tentative repeated output may consume an additional keystream rune with the previously declared skip penalty and cap; no output positions or key bytes are fitted by hand. The decoder optimizes its genuine GP-English trigram log-likelihood as in the existing experiment.

Independent English-GP positive books are encrypted using the **actual grid bytes**, the constructed base29 IVs, and a hidden eight-section column assignment, with **81% probabilistic collision-driven extra keystream consumption**. The same full original-cipher search recovers the true generator parameters and all eight correct column assignments:

| Nonce serialization | Original planted GP runes recovered | Genuine original best log-score, nats/rune | Randomized-grid alternatives at least as strong |
|---|---:|---:|---:|
| 128-bit big-endian | **2393/2400 (99.7083%)** | **−5.654566** | **17/20**, add-one p **0.85714** |
| 128-bit little-endian | **2400/2400 (100%)** | **−5.649795** | **18/20**, add-one p **0.90476** |

The two authentic source keys' best GP-English Viterbi log scores are close to random, while the corresponding planted genuine-key books score **−2.486690** and **−2.529769** nats per rune. An independently solved 85-rune LP2 English-GP passage scores −2.758 under the identical existing Shakespeare-trained trigram language model (see prior original-rune regression). The original ciphertext's recovered rune prefixes are nonlinguistic.

For each nonce construction, shuffle all 32 bytes *independently within each of the eight actual grid columns* in **20** deterministic null replicates, and rerun the entire 16-mode / 8!-assignment inverse. The source grid-column keys are worse than 17 or 18 of these 20 alternatives. The null-best medians are **−5.640955** (BE) and **−5.630610** (LE), both superior to the corresponding original grid candidate. These nulls have limited precision but reject any claim that the source keys were especially favored by the observed ciphertext.

## Conclusion and scope

This closes two natural, completely specified title-as-base29 IV serializations in the **direct original grid-column AES/ChaCha + single-skip + literal GP-English** family; neither recovered any original source plaintext or a known-correct key. It extends the distinct Unicode-SHA and repeated-index IV tests in the existing [grid-stream inversion report](grid-stream-collision-viterbi.md). The new hypothesis has no independently authenticated evidence that Cicada actually used CTR/ChaCha, or the byte table as eight symmetric keys. The statistic cannot exclude unknown outer alphabets, unusual source language, different IV counter conventions, multiple per-rune skips, other cryptographic families or an unobserved external component. No inference about the general strength of the manuscript's cipher follows.

**Reproducible code:** [`sims/red_title_base29_grid_iv.cjs`](../sims/red_title_base29_grid_iv.cjs), which imports the proven exact original Viterbi and original title annotation, asserts actual source lengths and runs both planted and complete matched null scans. **Successful manual GitHub Actions run:** [42786254662](https://github.com/FlareZ123/liber-primus/actions/runs/42786254662). Source title numeral values and all eight IV bytes are emitted, and there are no per-commit CI executions.
