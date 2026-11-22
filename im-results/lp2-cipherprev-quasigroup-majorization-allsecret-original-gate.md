# Original LP2 predecessor-ciphertext quasigroup: exact all-secret alphabet-capacity gate

**Agent 2, 22 November 2026. Classification: key-independent exact source-cipher constraint, native-GP-language-conditional exclusion of two complete secret-table scopes. No new plaintext, key or authenticated LP2 cipher.** The original-data counts and planted inverse passed [Windows Node 22 read-only CI, run 45003577973](https://github.com/FlareZ123/liber-primus/actions/runs/45003577973) using the [standalone CommonJS SFT](../sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs).

## Motivation and exact class

LP2 has unusually few adjacent equal ciphertext runes. A simple human-executable way to suppress repeated ciphertext is to use the previous *visible ciphertext* symbol as the selector for an evolving alphabet, possibly reserving a rare plaintext symbol for a repeated output. This includes nonlinear ciphertext-feedback substitution and secret keyed quasigroup tables, more general than an additive differential transform. The strongest rival is a state that includes earlier symbols or external key material and therefore cannot be indexed solely by the preceding ciphertext rune.

Test precisely:

`C[w,j] = Q[g][C[w,j-1]][P[w,j]],  j >= 1`

where every `Q[g][s]` is **any secret bijection** of the 29 canonical GP rune identities. The group `g` is either one whole-book table, one of the eight authentic `$` text sections, or one of 55 rune-bearing physical pages. Each previous-ciphertext state and each group gets an *independent arbitrary* permutation; no numeric additive, affine, language-optimal or historically guessed key is fitted. The first ciphertext rune in each true printed word is unconstrained. The proof uses the original **2,896 complete printed words**, including joined cross-page continuations; punctuation, actual page positions and section membership are retained.

This hypothesis differs from the recently tested arbitrary plaintext-lag-five table (#2083), word-position alphabet class (#2177), floral affine ciphertext feedback (#2162), eight-lane cipher (#2199), and repeated plaintext affine-key islands (#2203). It is a bounded *all-secret one-step ciphertext-predecessor* family.

## Exact bound, independent of all 29! row keys

For every original state `s`, scope group `g`, and following original ciphertext rune `t`, count `n[g,s,t]` among the **10,060 within-word positions** `j>=1`. An unknown permutation `Q[g][s]` can only **relabel** the 29 counts in that row. Therefore the number of recovered plaintext positions occupied by *any* selected `k` distinct GP runes is at most

`B_k = sum_(g,s) sum_(k largest t) n[g,s,t]`.

This is a deterministic upper bound for every combination of secret per-row bijections, even if an adversary optimizes each row against the unknown target plaintext. It does **not** presume plaintext independence from the previous ciphertext, any fixed GP letter ordering, a uniform key, a language model, an additive operation, or knowledge of a single plaintext rune. An entire class is tested without key enumeration.

| Independent secret-row scope | Groups | B1 / 10,060 | B2 / 10,060 | B5 / 10,060 | Implication |
| --- | ---: | ---: | ---: | ---: | --- |
| Whole manuscript | 1 | **578 = 5.7455%** | 1,086 = 10.7952% | **2,510 = 24.9503%** | Native GP common-rune profile impossible |
| Eight authentic printed `$` sections | 8 | **1,031 = 10.2485%** | 1,881 = 18.6978% | **3,912 = 38.8867%** | Native GP English controls impossible |
| Fresh table for every physical rune page | 55 | 2,401 = 23.8668% | 4,140 = 41.1531% | 8,019 = 79.7117% | This count bound does **not** exclude page-local tables |

For the whole-book scope, the original 29 ciphertext-state rows have nearly every one of their 29 possible output runes represented (mean 28.8966). There are exactly **63 adjacent equal pairs within true words** of the 10,060 eligible transitions; 86 is the separately reported count under a different within-page adjacency definition. The ranked-count bound itself, rather than a null-model significance estimate for the doublets, is the decisive invariant.

### Authenticated native GP controls and independently sourced texts

The actual source-native solved LP1 p10–13 sample consists of **181 complete words and 574 internal rune positions**: GP `E` occurs **98/574 = 17.0732%**, and the five most frequent GP symbols occupy **284/574 = 49.4774%**. Independent solved LP2 p57 has 95 native plaintext runes, 15 of them GP E (15.7895% overall). These are source examples of ordinary Cicada GP prose, not statistical assumptions about the unknown pages.

As a broader full-layout check, the calibrated source-native GP encoder from [existing LP1/p57 original controls](../sims/lp2_native_gp_source_orthography_sft.cjs) encoded 60 deterministic **length-matched 2,896-word placements** from each of the pinned Gibran and Shakespeare corpora. Every placement has exactly 10,060 tested *interior* GP sites. These are language controls, not hypothesized original plaintext.

| Original-layout native GP control, 60 placements each | Minimum most frequent rune | Minimum top-five runes |
| --- | ---: | ---: |
| Gibran, original text corpus | **1,402 / 10,060 = 13.9364%** | **4,665 / 10,060 = 46.3718%** |
| Shakespeare, original text corpus | **1,430 / 10,060 = 14.2147%** | **4,594 / 10,060 = 45.6660%** |

Thus all 120 ordinary GP-English source-native placements **strictly violate both** the original whole-book and eight-section all-secret bounds. The absolute eight-section gap is at least 371 runes for the most frequent symbol and 682 runes for the five highest-frequency symbols in these matched controls. This contrasts native-language plausibility against an exact cipher-observable impossibility, without searching secret tables. A contrived unknown plaintext whose internal GP rank frequencies are much flatter than both solved LP1 prose and the two native controls is *not* mathematically excluded.

### Full-length reversible positives

The SFT plants a different random but fixed, reversible 29-entry row permutation for **each preceding ciphertext state and group** on native-GP word placements. As an anti-doublet-friendly additional positive constraint, every planted row maps plaintext F to the previous ciphertext value. It uses an arbitrary reversible word-first-rune offset. The decoder reconstructs the complete **12,956/12,956 planted runes** for each of the whole-book, eight-section and page-local scopes on both independent native source corpora, including the original word lengths and true page/section clocks. All planted plaintext rank counts remain below their corresponding ciphertext-derived bounds.

The first CI attempt [45003506637](https://github.com/FlareZ123/liber-primus/actions/runs/45003506637) failed solely on a Windows CRLF-sensitive LP1 substring check, before the final known-LP1 check. The script now normalizes CRLF; [run 45003577973](https://github.com/FlareZ123/liber-primus/actions/runs/45003577973) passes all exact original capacity assertions, solved-source controls and planted inverses.

## Interpretation, useful boundary and next decision

**Retire a manuscript-global or authentic-eight-section stationary, bijective ciphertext-predecessor substitution as a sole length-preserving native GP-English inverse.** Because every possible secret table has the same row-count rank capacity, tweaking lookup tables, source words, arithmetic representations or additive constants cannot repair the contradiction. This is a broad all-secret exclusion, while retaining its explicit source-language assumption. It does **not** establish that LP2 is unbreakable or random.

The physical-page-local version has enough independent secret rows that the present upper bounds are nonrestrictive. Further work would need an *independent original clue* selecting per-page alphabet tables, a reversible evolving state involving multiple previous symbols, a distinct non-GP plaintext alphabet, or a ciphertext transform prior to this family. Without a source-selected key/state, expanding the free tables per word simply turns this into an underdetermined fit. The experiment recovered **zero unknown LP2 plaintext runes** and supplies no next-stage destination.

**Reproduce:** `node sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs`, on unchanged `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, original solved LP1 transcription, and both pinned original English control texts. Output prints the exact scope rank capacity arrays, solved GP witness and both full-size planted positive checks.
