# Original LP2 word-internal equality multiplicity: an all-secret word-local bijection obstruction

**Agent13, 22 November 2026.** Exact original-cipher input; Windows Node22 reproducibility **PASS**: [workflow run 44998952734](https://github.com/FlareZ123/liber-primus/actions/runs/44998952734). [Single-file reproducer](../sims/lp2_wordinner_equality_multiplicity_allsecret_gate_sft.cjs). This is a **conditional source-language exclusion**, with no recovered LP2 plaintext, key or authentic opcode.

## Invariant and causal scope

For any printed source word `w` of length `n`, define the total number of unordered positions bearing identical runes:

```
E(w) = sum_over_glyph_g count_w(g) * (count_w(g) - 1) / 2
```

`E(w)` remains *exactly unchanged* by (i) **any arbitrary permutation of the n positions within a word** and (ii) **any bijection of the glyph alphabet within that word**. Stronger, **any single-valued deterministic GP29 letter map, including a many-to-one secret map, can only increase or preserve `E`**, because two equal plaintext runes must receive the same output and different plaintext runes may merge. This is an exact monotonicity theorem for every word, without any secret-key search. All maps may differ independently across the 2,896 words and need not be known, fixed across pages, GP29-linear, or efficiently computable. The SFT explicitly exercises a complete GP29 permutation with reversal and a non-injective 29→28 map with reversal on every original word. A homophonic map emitting several different glyphs for the same plaintext rune, or an evolving per-position alphabet, is **outside** this theorem.

Consequently, if LP2 were ordinary GP-native English or Latin plaintext with its **original printed spaces preserved**, transformed *solely* by a potentially secret per-word deterministic monoalphabetic substitution (including many-to-one) and arbitrary word-internal anagram, the corresponding source plaintext would necessarily have **at most 811 equal-position pairs** across its **same 2,896 word lengths**. All sampled native sources have much larger expected counts. This gives an all-secret, architecture-level falsification rather than a failure of fitted keys. Rival families include evolving per-rune alphabets, homophonic/one-to-many encoding, inserted/deleted letters, fake delimiters, changed word order accompanied by changed lengths, and genuinely non-native/plaintext languages.

## Original source and positive controls

The canonical original source at [`resources/lp2-transcription.txt`](../resources/lp2-transcription.txt) yields **12,956** runes in **2,896** complete words across 55 rune-bearing physical LP2 pages. A slash and physical page break may continue the same word, and every printed punctuated termination is kept. Entire physical p50 is numeric and excluded. The actual original has:

| Invariant | Original |
| --- | ---: |
| Total within-word equal unordered rune pairs, across **all lags** | **811** |
| Words with at least one repeated rune | 621 |
| Words containing at least three occurrences of the same rune | 29 |
| Complete printed source words | 2,896 |

The original word-length inventory is **83×1, 448×2, 720×3, 513×4, 317×5, 256×6, 216×7, 156×8, 78×9, 52×10, 32×11, 18×12, 4×13, 3×14**. Its total and per-word `E` are checked in the reproducer.

The independently solved source p57 `PARABLE` has **95 original rune indices and 20 authentic printed words**. GP-native transcription of its known plaintext yields the **same 20/20 `E` signatures** and the same total **16** on the original and transcript. We independently validate equality invariance over **all 2,896** original words under a genuine 29-symbol GP permutation and reversal, then verify monotonicity under a second intentionally non-injective 29→28 map and reversal. The latter is an exclusion of **all** fixed single-valued maps, extending beyond reversible substitution. These checks establish the intended treatment of `ING` as a single NG rune and the other native GP compound spellings on the solved material. The broader solved-Cicada reference is editor-normalized and is therefore a corpus control, not evidence that every source word was printed in exactly that Latin spelling.

## Native word-length-matched evidence

For each control source, enumerate its words with the native GP29 compound-letter convention `ING, TH, NG, EO, OE, AE, IA, EA`. On each source, draw words **independently with replacement** in the **exact sequence of original LP2 word-length slots**, counting their `E` values. Compare to the actual original sum. Four thousand deterministic seeded random placements per corpus give the finite empirical null and its range; the reported z-score is the exact conditional mean difference divided by the sum of per-slot conditional variances' square root. The experiment uses no optimized word-level alphabet, key, clock or source sampling window.

| Native source | Available words | Original E under matched lengths | Native expected E | Conditional z | Minimum in 4,000 native draws |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gibran | 15,733 | 811 | 1,266.649 | −13.271 | 1,148 |
| Emerson | 77,932 | 811 | 1,284.446 | −13.868 | 1,153 |
| Shakespeare | 55,407 | 811 | 1,291.156 | −14.127 | 1,165 |
| Latin Vulgate | 39,835 | 811 | 1,435.549 | −17.540 | 1,309 |
| Solved Cicada selection | 713 | 811 | 1,342.478 | −15.173 | 1,192 |
| Old English Beowulf, corrected original GP | 10,885 | **803 over 2,893 words** | 1,062.265 | −8.262 | 940 |

Old English's pinned corpus has no fourteen-rune source word: **three** original length-14 words are omitted from **both** observed and expected counts, leaving 803/2,893. All other rows use all 2,896 original words. The Old English GP sequence is pre-normalized from original Beowulf in [the corrected source fixture](../resources/control/beowulf_oe_gp_profile_corrected.json); the other corpora use the convention already frozen by the [native word-length grammar gate](lp2-wordlength-trigram-solved-cicada-and-latin-source-gate.md).

All **24,000** original-conditional trials across six distinct source corpora produced *higher* equal-pair counts than the actual LP2. Each corpus has zero native Monte Carlo draws at or below observed, giving the conventional finite-resampling one-sided Monte Carlo p-value **(1+0)/(4,000+1) = 0.00024994** for each individual control. This is a resolution-limited empirical test rather than a confidence bound on the source population. The printed z-values are descriptive standardized contrasts, **not** exact independent tail probabilities; the distinct control sources and overlapping lexical content also prevent multiplying the reported p-values. These tests condition on word lengths, not on source topic, genre or word-frequency mixture, so their exclusions are source-language-conditional.

## Research decision

The source-native English, Latin, Old English and known Cicada controls make **any within-word single-valued deterministic rune relabelling, including non-injective maps, combined with any unknown within-word rune permutation** an implausible sole encryption explanation for the entire unknown LP2 corpus under preserved source word lengths. This materially strengthens the earlier **between-word repeated-token invariant** in [`lp2-word-collision-injective-source-gate.md`](lp2-word-collision-injective-source-gate.md) and is distinct from the **one selected five-column word-internal inverse** tested in [`lp2-fivedot-wordlocal-fivecolumn-original-gate.md`](lp2-fivedot-wordlocal-fivecolumn-original-gate.md).

The next useful original-solution question is which **authored** source-visible operation could change an equal-symbol relation *inside* a word, change the actual segmentation, or select a non-language plaintext register. An unseen external key or evolving per-rune alphabet could explain the deficit, but one cannot identify it merely by choosing a secret relabelling. **No unknown-page plaintext, authentic key, reversible historical cipher or final destination was recovered.** Arbitrary further word permutations and secret per-word bijections within this excluded architecture cannot change `E`; lossy many-to-one maps can only raise it.

Reproduce on Windows 11/Node22: run the linked CommonJS file. All source files, random seed, word/token parsing, assertions, the exact original `E` counts and corpus-specific sample maxima/minima are fixed in the committed SFT. [Verified Windows Actions log](https://github.com/FlareZ123/liber-primus/actions/runs/44998952734).
