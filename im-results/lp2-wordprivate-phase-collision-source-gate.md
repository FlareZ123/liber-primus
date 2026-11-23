# GP29 word-private phase alphabets: exact all-secret collision constraints and the five-phase exception

**23 November 2026, Agent3. Supporting original-cipher cryptanalysis; no unknown plaintext or author-selected key.** [Passing Windows Node22 SFT](https://github.com/FlareZ123/liber-primus/actions/runs/45098865569) · [reproducible script](../sims/lp2_wordprivate_phases_allkey_collision_sft.cjs). This extends the [whole-word all-key equality-pair theorem](lp2-wordprivate-pair-collision-keyless-gate.md) to distinct secret substitution alphabets *inside each word*, choosing an independent private alphabet for every word and every coordinate phase, without searching any keys.

## Original invariant

For word \(w\), fix an integer period \(m\). Each word has up to \(m\) unrelated private 29-symbol bijections \(\pi_{w,r}\), so \(C_{w,j}=\pi_{w,j\bmod m}(P_{w,j})\). Even if the creator chooses new permutations for every word, permutes the phase names or independently shuffles the rune positions *within each phase class*, the number

\[
Q_m(w)=\sum_{0\le i<j<|w|,\ i\equiv j\;(\mathrm{mod}\;m)}
\mathbf 1[w_i=w_j]
\]

is **exactly conserved**. Unknown starting phase offsets do not affect this sum because they merely relabel the residue classes. The summed \(Q_m=\sum_w Q_m(w)\) is an all-key invariant. It tests a more permissive family than five-phase *additive* Vigenere: each of the 2,896 words may have entirely new, arbitrary 29! bijections at each of the m positions. The model **does** require a fixed periodic phase-clock *within* each word and does not allow arbitrary cross-phase position mixing, changing phase per symbol or changes to the printed word segmentation.

**One-sided strengthening beyond invertible alphabets:** for any arbitrary secret deterministic lookup \(f_{w,r}:\mathrm{GP29}\to\mathrm{GP29}\) in each word/phase, including every non-injective 29-to-19 (or other) mapping, an equal pair at two positions sharing a phase can never be split. Thus **\(Q_m(C)\ge Q_m(P)\)** even when \(f_{w,r}\) is *not* a permutation. A second 12,956-rune native-positive case in the SFT assigns random non-injective maps separately to every word's five position phases, checking all 2,896 individual inequalities. Any phase-preserving shuffle also retains the one-sided guarantee. This extends the negative native-word gates from secret cyclic Vigenere and arbitrary bijections to **arbitrary deterministic symbol lookups**, unless the hidden state genuinely advances *within one period class*, words are resegmented or an additional channel carries an inverse.

The complete source-verified 12,956-rune unknown LP2 corpus gives:

| Secret position-phase period \(m\) | Original \(Q_m\) | Lowest count in 1,280 length-matched native samples | Samples at or below original (of 1,280) |
|---|---:|---:|---:|
| 1 | 811 | 1,207 | 0 |
| 2 | 427 | 459 | 0 |
| 3 | 218 | 282 | 0 |
| 4 | 141 | 141 | 1 |
| 5 | 106 | 90 | 14 |
| 6 | 32 | 51 | 0 |
| 7 | 30 | 30 | 3 |
| 8 | 10 | 12 | 0 |

Five independent source controls each supply 256 seeded manuscripts sampled to match **every original word length**: Shakespeare, Gibran, Emerson, word-preserving GP Latin Vulgate, and editor-normalized solved LP1 English. Every sample contains 2,896 whole words and 12,956 GP symbols. Those rare low-tail matches are conditional on each reference corpus, not a probability of a Cicada-authored phase scheme.

The m=5 low-tail matches are **11/256 Gibran, 3/256 Shakespeare, none** from Emerson/Latin/solved LP1. The m=4 sole tie is Gibran and m=7's three ties are one Shakespeare and two solved LP1. A synthetic full-length test encrypts and *exactly decrypts 12,956/12,956 native GP29 symbols* with an independently randomized alphabet for every individual word **and each of its five phase classes**, verifying all 2,896 separate \(Q_5\) invariants.

## What changes about the solve-path choice

With ordinary source-shaped English/Latin and a word-private periodic alphabet, m=1–3 and m=6 remain strong negative routes: none of 1,280 matching-length native samples attains the original's invariants despite arbitrary independent alphabet keys. The period-four original is only an extreme 1/1,280 tie. **A five-phase word-private alphabet remains statistically possible under some English references**, without being established, and a historical order-five magic-square family is an independently observable source artifact.

This is **insufficient to claim m=5 was intended**. The tested period family is nonnested (m=6 can be less compatible than m=5); the source does not instruct a word-private alphabet permutation or specify how a word index would select one. Period-five fixed-additive word keys had already failed a narrower exact native-dictionary gate. The actionable follow-up is to identify a **first-party deterministic 29-way phase substitution and word-reset rule** from the original magic-square/Fibonacci material, then run it on all original ciphertext with held-out plaintext predictions. Unconstrained phase-alphabet permutations can always be fitted and would not constitute decryption.

Inputs: original corpus and transcription in resources/liber-primus/, five historical/native control texts in resources/control/ and the original solved-LP1 plaintext reference. All original rune totals, original rune sequence and source samples are asserted in the SFT.