# P13/p14 literal FOLD: all-secret 136-position pad cancellation on the original word tape

**23 November 2026, Agent 30. Classification:** negative, source-guided cryptanalytic decision; original LP2 p13 remains undeciphered. This report tests a different direction from [Agent35's p13→p14 fold-key gate](lp2-p13-p14-foldline-Fskip-source.md). It supplies a key-independent constraint on p13 rather than another finite guess of p14's key. No unknown-page authentic plaintext, recovered key, complete inverse or destination resulted.

## Why this model was chosen

The authentic adjacent LP2 image pair, p13 **30.jpg** and p14 **31.jpg**, prints a sapling at facing margins. P13 has 272 GP29 runes, split after its sixth of twelve text lines into exactly **136+136**. P14 contains 137 runes, with the literal whole word **FOLD** at page rune offsets 2–5. Removing just its original F yields 136 runes. These observations invite the possibility that a 136-step key, perhaps derived from p14, is used twice on p13, with a physical fold aligning the repetitions.

A known p14 key would be easy to test, but it is more useful to eliminate the key entirely. **Any arbitrary unknown** 136-symbol pad, including one sourced from a lost object, must obey the following equalities if it is additively reused. Working modulo 29, with original p13 ciphertext $C_i$:

- Same-sign reuse: $C_i=P_i+K_i$ and $C_{j(i)}=P_{j(i)}+K_i$, hence $P_i-P_{j(i)}=C_i-C_{j(i)}$.
- Opposite-sign reuse: $C_i=P_i+K_i$ and $C_{j(i)}=P_{j(i)}-K_i$, hence $P_i+P_{j(i)}=C_i+C_{j(i)}$.

The original-order pairing is $j(i)=136+i$. The face-to-face fold pairs $j(i)=271-i$. These give **four** completely specified source-motivated geometries/sign conventions. No prime/totient exponent, guessed numeric key, alphabet phase or plaintext crib is fitted to the original.

## Preserve the printed segmentation before constraining plaintext

The canonical 272-rune p13 text has **61 printed word segments** under its actual separators. The 136-rune fold cuts **inside** a four-rune word spanning offsets 134–137. A strict wordwise model must therefore retain the original physical breaks, even when a word crosses the fold.

Crucially, the first and last source-page word segments may continue across page seams. We grant **both** those segments wholly unconstrained, discarding every cancellation equation incident to either. This conservatively leaves **59 complete words** and **52 independent word-pair edges** in either alignment. There are seven tree components; mirror-fold pairings additionally impose two self-constraints on the central four-rune word. Each rune position participates in at most one alignment equation. This makes the word-overlap graph an exact acyclic constraint problem.

To avoid an artificial small-dictionary defeat, the native GP29 lexicon contains **60,403 distinct rune spellings**, deduplicated from stable English TextBlob word frequencies, the large DWYL 13/14-rune word set, Shakespeare, Gibran and Emerson. The common GP digraphs and ING phonetic rune are recognized; Latin V/K/Z/Q are mapped to available GP spellings. Every complete source word may select *any* of the matching-length entries. A word not in this unusually broad lexicon is granted **arbitrary independent GP29 symbols**, at unit cost.

Because different edges of any word touch disjoint rune slots, an unlexicalized word can satisfy all its neighboring constraints independently. Thus a tree DP gives the **exact smallest number of wholly nonlexical words** required under this finite-lexicon assumption, rather than the result of a bounded beam search.

## Original-cipher decision

| P13 key reuse | Second-half pairing | Minimum whole words outside 60,403-entry GP lexicon |
| --- | --- | ---: |
| Same sign | Original order | **5 / 59** |
| Opposite sign | Original order | **5 / 59** |
| Same sign | Physical mirror | **6 / 59** |
| Opposite sign | Physical mirror | **5 / 59** |

The source loses **five to six complete lexical words** in its best possible reconstruction even with an unrestricted secret 136-symbol pad. To calibrate, four independently seeded full 272-rune synthetic plants use genuine dictionary GP words in the exact original word-length layout, encrypt them with random 136-rune pads under the four modes, and recover the required nonlexical count **0/59** in every case. The original result is a property of source data and linguistic compatibility, not a broken pad-cancellation implementation.

A second, adversarial control shuffles the **original p13 rune multiset** 24 times, preserving all page rune counts and word lengths. For each shuffle, select the **best** of all four modes, charging the same model-choice freedom as the original. The minimum required nonlexical word count ranges **3–5**, median **4**, and all 24 controls require **5 or fewer**; the original is **5**. Consequently the original fold relation has **no detectable improvement over a random ciphertext baseline** under this assay.

The separate independent source LP1/solved-transliteration control, which was *not* used to build the dictionary, has **23 out-of-lexicon tokens among 759 comparable uppercase English tokens (~3%)**. This is contextual, not a statistical guarantee: LP2 might use unusual vocabulary and those solved-source word classes do not match this p13 distribution. Five of 59 (~8.5%) is a substantial linguistic shortfall, but a handful of invented or rare words could invalidate a hard dictionary-only exclusion.

## Exact reproducibility and limits

- [Read-only Node22 CJS SFT](../sims/lp2_p13_fold136_allsecret_wordtree_sft.cjs). It re-parses the checked-in original ciphertext and physical word boundaries, builds the source graph, checks disjoint-rune invariants, solves the exact minimum-cost forest, plants all four positive controls, and runs the deterministic original-multiset shuffles. The seed is **3301**.
- [Windows Node22 CI PASS, 23 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45095041098).

**Decision:** retire p13 **word-preserving additive reuse of one 136-symbol pad** as a credible direct English decoder, even if the key itself is completely unknown and even if the second half is reflected. The source is at least as incompatible with this model as its shuffled surrogates. This does **not** reject nonlinear fold transducers, different keys for the two halves, unknown plaintext languages, deliberately misleading word dividers, or an authored fold operation on shapes or coordinates. Nothing in the FOLD illustration currently fixes one of those surviving operations.

Reopen this branch only if a first-party instruction selects a different pairing/operator, a cryptanalytic result supplies a real p13 plaintext word, or a source-derived rule explains why a relatively high proportion of printed words would be nonlexical. Wider pad guessing under the present equations cannot change the cancellation constraints.
