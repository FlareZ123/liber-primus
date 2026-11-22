# LP2 printed-word order fails native English and Latin short-range length grammar

**Agent26, 22 November 2026.** Original-source structural exclusion; no newly recovered unknown-page plaintext or cipher key. [Single-file Windows Node22 reproducer](../sims/lp2_wordlength_trigram_solved_cicada_gate_sft.cjs), independently executed end-to-end in [successful Windows Actions run 44988196383](https://github.com/FlareZ123/liber-primus/actions/runs/44988196383). An earlier [first-order source gate](../sims/lp2_wordlength_transition_english_gate_sft.cjs) already reported weak English pair ordering; this experiment adds **actual held-out Latin**, **trigram context**, and critically a **positive on separately solved genuine Cicada prose**. Its decision pertains to how a decoder should treat source manuscript spaces.

## Original input and cipher-independent hypothesis

The 55 rune-bearing unknown LP2 physical pages p0–p55 contain exactly **12,956** rune symbols grouped into **2,896** printed rune words. The physical-page flow and true single-word continuations across page breaks are taken directly from `resources/lp2-transcription.txt`. Native rune word length is the number of printed GP runes, never Latin-letter count. All 55 page-local word multisets and per-page word totals remain unchanged under each control shuffle.

If the encryption changes rune identities without rearranging the *order of original English words*, the manuscript's visible successive word lengths should retain some short-range grammar. Real prose has, for example, a distribution of word lengths conditioned on the lengths of the preceding words. This signal survives a characterwise additive, substitution, running-key, or polyalphabetic cipher **provided the original word delimiters still correspond to the same plaintext words and the cipher does not insert/delete runes**. It need not survive a transposition of words, made-up spaces, a source in a different language, a cipher that changes word lengths, or a multilayer scheme.

We evaluate **one-step and two-step conditional word-length predictive information** with predeclared smoothed 18-bin models:

```
log Pr(length[t] | length[t−1], [length[t−2]])
   − log Pr(length[t])
```

Train each model on two of three independent literary texts: Shakespeare, Emerson, Gibran. Evaluate the third, held-out text placed into the exact page-word-count slots of unknown LP2. For Latin, train on the first half of 39,835 whole words in the separately published Latin Vulgate and hold out the second half. Use the frozen length normalization (GP compound TH/NG/EO/OE/AE/IA/EA/IO and ING) for both unknown manuscript and controls. A companion positive test holds out **713 actual words from the known solved Cicada LP1 and final LP2 pages**, removing editorial headings, duplicated continuation notes, and the p56 hash. The solved original is an editor-normalized prose reference, so it is a corroborative control and cannot stand in for perfect unchanged rune plaintext.

For each section of 55 manuscript pages, the null performs **700 independent within-page shuffles**, retaining every page's exact word count and multiset of lengths. For solved Cicada and each held-out literary text, the null shuffles each corresponding passage's word lengths using the same reproducible RNG. The metric is a z-score of the original source's log-predictive advantage over its own matched shuffles, with a right-tail Monte Carlo rank. A genuine language positive should have a strong positive z-score; shuffled text clusters near 0.

## Full original and holdout outcomes

The following **exact successful CI outputs** are standardized against their own matched 700-draw shuffles.

| Independently trained language model | Original LP2 bigram z | Original LP2 trigram z | Genuine withheld source bigram z | Genuine withheld source trigram z |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare+Emerson → Gibran | −0.808 | +0.227 | +10.641 | +9.312 |
| Shakespeare+Gibran → Emerson | −0.876 | +0.187 | +8.025 | +6.566 |
| Gibran+Emerson → Shakespeare | −1.031 | −0.413 | +6.423 | +6.515 |
| Latin Vulgate first half → withheld second half | +0.878 | +1.901 | +9.595 | +6.961 |
| All three English controls → **actual solved Cicada text** | n/a | n/a | **+4.439** | **+3.120** |

The **original LP2** English-model right-tail probabilities are **0.799–0.866 (bigrams)** and **0.431–0.659 (trigrams)**, fully consistent with a page-local shuffle of its *own* printed word lengths. Latin's original p-values are **0.204 (bigrams)** and **0.0285 (trigrams)**; the latter is a weak predeclared deviation and does **not** support claiming normal Latin order, especially with the original's z=1.90 versus the genuine held-out Latin z=6.96. For each of the four native language positives, both condition lengths score at least **6.4 standard deviations above** their respective shuffled baselines, and separately solved Cicada language retains the same ordering structure (z=4.44/3.12, permutation p≤0.00285). The experiment therefore has power to detect short-range word-length syntax when an authentic text preserves it.

## Implication for plaintext recovery

**Do not demand natural English (or Latin) length ordering as an early-pass condition on ciphertext word boundaries in unsolved LP2.** A decoder that simply subtracts a pad rune-by-rune and accepts printed separators as final plaintext word delimiters has a structural obstacle: on the observed original manuscript spaces, the word-length succession looks unlike separately sampled English prose or authentic solved Cicada prose. Candidate mechanisms that **reorder whole words**, reconstruct spaces, or treat apparent word delimiters as part of the cipher deserve consideration **only when an original clue supplies a specific reversible rearrangement and a distinct holdout prediction**.

This result cannot, by itself, distinguish deliberate pseudo-spacing from authorial phrase lists, severe style differences, Old English, Latin variants, encrypted word-length changes, or transposition. It does not recover any unknown LP2 rune. Earlier candidate 2014 14-column and simple 8-column word permutations already had negative original-input controls; do not reopen them because of this finding. The useful next research decision is an **author-visible instruction for a *particular* word-order inverse** that recovers native word-length grammar on both training and withheld original pages and eventually supports actual plaintext restoration. General permutation fitting against this grammar alone is susceptible to overfitting.

This is a **candidate architectural constraint**, preserved as supporting evidence in `im-results/`, not a verified key or complete result in `results/`.
