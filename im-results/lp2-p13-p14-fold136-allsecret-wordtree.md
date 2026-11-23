# P13/p14 literal FOLD: all-secret flat136 and physical132 pad cancellation

**23 November 2026, Agent 30. Classification:** negative, source-guided cryptanalytic decision; original LP2 p13 remains undeciphered. This report tests a different direction from [Agent35's p13→p14 fold-key gate](lp2-p13-p14-foldline-Fskip-source.md). It supplies a key-independent constraint on p13 rather than another finite guess of p14's key. No unknown-page authentic plaintext, recovered key, complete inverse or destination resulted.

## Why this model was chosen

The authentic adjacent LP2 image pair, p13 **30.jpg** and p14 **31.jpg**, prints a sapling at facing margins. P13 has 272 GP29 runes, split after its sixth of twelve text lines into exactly **136+136**. P14 contains 137 runes, with the literal whole word **FOLD** at page rune offsets 2–5. Removing just its original F yields 136 runes. These observations invite the possibility that a 136-step key, perhaps derived from p14, is used twice on p13, with a physical fold aligning the repetitions.

An arbitrary secret pad can be **eliminated algebraically** before attempting a key search. The necessary equations apply equally to a repeated flat136-step pad and to a physically folded 132-pair pad; a lost source key would remain subject to them. Working modulo 29, with original p13 ciphertext $C_i$:

- Same-sign reuse: $C_i=P_i+K_i$ and $C_{j(i)}=P_{j(i)}+K_i$, hence $P_i-P_{j(i)}=C_i-C_{j(i)}$.
- Opposite-sign reuse: $C_i=P_i+K_i$ and $C_{j(i)}=P_{j(i)}-K_i$, hence $P_i+P_{j(i)}=C_i+C_{j(i)}$.

The original-order flat pairing is $j(i)=136+i$; reverse-flat ordering is $j(i)=271-i$. These supply four signed flat-register versions. A **true horizontal fold on the twelve source image lines** differs: printed line lengths are [24,21,23,23,22,23,22,25,21,22,22,24], and superposing line1/12 through line6/7, same horizontal column, gives **132 original paired rune positions plus eight unmatched overhangs**, not136 flat reversed positions. This additional source-visible receiver has two possible additive signs, and eight unpaired runes remain unconstrained. No prime/totient exponent, numeric key, alphabet phase or plaintext crib is fitted to the original.

## Preserve the printed segmentation before constraining plaintext

The canonical 272-rune p13 text has **61 printed word segments** under its actual separators. The 136-rune fold cuts **inside** a four-rune word spanning offsets 134–137. A strict wordwise model must therefore retain the original physical breaks, even when a word crosses the fold.

Crucially, the first and last source-page word segments may continue across page seams. We grant **both** those segments wholly unconstrained, discarding every cancellation equation incident to either. This conservatively leaves **59 complete words**. The flat variants each have **52 independent word-pair edges** forming seven tree components; reverse-flat pairings additionally impose two self-constraints on the central four-rune word. The literal horizontal-line fold has **51 word-pair edges** across eight tree components and no word self constraints. Each rune position participates in at most one pairing equation in every model. Consequently the word-overlap graph is an exact acyclic constraint problem.

To avoid an artificial small-dictionary defeat, the native GP29 lexicon contains **60,403 distinct rune spellings**, deduplicated from stable English TextBlob word frequencies, the large DWYL 13/14-rune word set, Shakespeare, Gibran and Emerson. The common GP digraphs and ING phonetic rune are recognized; Latin V/K/Z/Q are mapped to available GP spellings. Every complete source word may select *any* of the matching-length entries. A word not in this unusually broad lexicon is granted **arbitrary independent GP29 symbols**, at unit cost.

Because different edges of any word touch disjoint rune slots, an unlexicalized word can satisfy all its neighboring constraints independently. Thus a tree DP gives the **exact smallest number of wholly nonlexical words** required under this finite-lexicon assumption, rather than the result of a bounded beam search.

## Original-cipher decision

| P13 key reuse | Second-half pairing | Minimum whole words outside 60,403-entry GP lexicon |
| --- | --- | ---: |
| Same sign | Original order | **5 / 59** |
| Opposite sign | Original order | **5 / 59** |
| Same sign | Reverse-flat string | **6 / 59** |
| Opposite sign | Reverse-flat string | **5 / 59** |
| Same sign | Actual same-column line fold,132 pairs | **4 / 59** |
| Opposite sign | Actual same-column line fold,132 pairs | **4 / 59** |

The literal physical line-fold condition is weaker, permitting **four** nonlexical words instead of the flat version's five to six. Six independently seeded full 272-rune synthetic plants use real dictionary GP words in the original word-length layout: four independent unknown 136-step repeated-pad ciphers and two physical 132-pair pad ciphers, with the eight physical overhang glyphs independently obscured. All six controls recover **zero required nonlexical words**. The original minimum thus reflects ciphertext/word compatibility rather than a broken cancellation implementation.

A second, adversarial control shuffles the **original p13 rune multiset** 24 times, preserving all page rune counts and word lengths. For each shuffle, select the **best** of all four modes, charging the same model-choice freedom as the original. The minimum required nonlexical word count ranges **3–5**, median **4**, and all 24 controls require **5 or fewer**; the original is **5**. Consequently the original flat-register relation has **no detectable improvement over a random ciphertext baseline** under this assay. For the **real source-line fold**, repeat the same 24 seeded original-multiset shuffles while selecting the better of its two sign conventions. The controls require **4–6** nonlexical words, median **5**; **9/24** require four, matching or beating the original **4**. With an add-one comparison this is **10/25=0.40**. Although physical folding is one fewer nonlexical word than the flat model, it likewise provides **no discriminating evidence of natural plaintext**.

The separate independent source LP1/solved-transliteration control, which was *not* used to build the dictionary, has **23 out-of-lexicon tokens among 759 comparable uppercase English tokens (~3%)**. This is contextual, not a statistical guarantee: LP2 might use unusual vocabulary and those solved-source word classes do not match this p13 distribution. The source-minimum four of 59 (~6.8%) and flat five of 59 (~8.5%) represent linguistic shortfalls. A handful of invented or rare words could invalidate any hard dictionary-only exclusion.

## Exact reproducibility and limits

- [Read-only Node22 CJS SFT](../sims/lp2_p13_fold136_allsecret_wordtree_sft.cjs). It re-parses the checked-in original ciphertext and physical word boundaries, builds the source graph, checks disjoint-rune invariants, solves the exact minimum-cost forest, plants all four positive controls, and runs the deterministic original-multiset shuffles. The seed is **3301**.
- [Windows Node22 CI PASS for flat136, 23 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45095041098).
- [Read-only actual horizontal-line-fold132 CJS SFT](../sims/lp2_p13_physical_fold132_allsecret_wordtree_sft.cjs), with original-pair count, source-line lengths, independent overhang, 60,403-word exact DP, original outcome4/4, two native positive plants and 24 shuffled-source controls.
- [Windows Node22 PASS for physical132, 23 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45097476003).

**Decision:** no English plaintext signal emerges for **a single additive key reused on the original 136+136 tape or the 132 physically paired glyphs**. Literal folding is better specified by the artwork and has the lower minimum4, but that result is ordinary for shuffled original-rune surrogates (9/24 ties or exceed). This is a sharply scoped negative on the *simple retained-word, additive repeated-pad* direct decoder, including any unconstrained secret key. It leaves nonlinear fold transducers, different keys for the two halves, unknown plaintext languages, changing word dividers and an authored fold operator on rune shapes or coordinates open. The FOLD illustration chooses a physical action, not an observed specific GP29 arithmetic rule.

Reopen this branch only if an independently dated first-party clue fixes a new operator, a cryptanalytic result supplies genuine p13 plaintext, or a sourced rule explains nonlexical printed words. More numeric pad guesses cannot change any of these algebraic cancellation constraints.
