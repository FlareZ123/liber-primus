# Signed-2016 base58 word map: whole-book plaintext-decode decision

**13 November 2026, Agent13. Classification: a frozen source-map hypothesis fails as a general plaintext decoder.** Original ciphertext, printed word segmentation, the provisional address formula, and the independently solved p56/p57 words are unchanged. No unknown LP2 plaintext, key or cipher operation was recovered.

## The decision and the source's actual scope

The authenticated 2016 Cicada sentence says: *"Its words are the map. Their meaning is the road, and their numbers are the direction."* The existing **hypothetical** interpretation maps a printed GP rune word of prime-weight sum `n` to physical page `n mod 58` and zero-based page-local printed segment `floor(n/58)`. Reapply that map until the route hits a solved word on physical p56/p57, a runeless table entry on p50, or a cycle.

This is the same exact rule previously used to recover three already known solved-page labels from p55: `END`, `DEEP`, and `THE` in printed order; their reverse is `THE DEEP END`. The **new question** is whether this existing map can function as a **general literal plaintext decoder** for the unknown printed words, by assigning each source word the independently known English label of its final solved destination. It is a necessary consistency check for that one decoding interpretation, rather than a random key search.

## Full original-source result

The source transcription contains **2,928 page-local word segments** on 55 rune-bearing unknown pages. This intentionally counts **32 cross-page carry segments separately**, unlike the 2,896 complete printed words used for full-book rune grammar. Physical p50 is retained in the 58-page coordinate system, with its 104 numerical entries, but contributes no rune segments to the totals.

Applying the identical, untuned map to **every original segment** yields:

| Terminal fate | Segments |
| --- | ---: |
| Independently solved p56/p57 word | **311** |
| Numerical table p50 | **658** |
| Cycle among unknown-page rune words | **1,959** |
| Out-of-range address | **0** |
| Total | **2,928** |

The 311 putative decoded tokens are highly concentrated. **154** resolve to `END`, **67** to `THE` and **29** to `DEEP`; these three words account for **250/311** solved-ending routes. Sixteen distinct English target words occur. Among the **27** adjacent pairs of original-page segments that *both* terminate in solved English words, **14** have **identical adjacent decoded words**. Examples include `END END`, `DEEP DEEP`, `THE THE`, and at p53 **`END END END`** across three consecutive printed positions. The independently known solved p56/p57 plaintext itself has **zero** identical adjacent English words among its within-page pairs.

This strong concentration is a concrete reason to reject treating all solved-ending routes as direct plaintext word replacements in the original printed order. It also explains why a short selectively read p55 phrase composed entirely of already-solved target words is insufficient to claim any unknown plaintext.

The global result does **not** disprove the source's possible intended *selective navigation* role. A secret selection rule might designate particular origins, path lengths, directions or landing words. There is currently no authenticated rule selecting those elements or converting the remaining 2,617 unknown/table/cyclic routes into prose, and a navigational readout is not by itself a reversible LP2 cipher.

## Reproducibility and next causal decision

[Original-source CommonJS single-file test](../sims/lp2_wordmap_global_plaintext_decision_sft.cjs) reads the canonical 58-page GP corpus, complete printed transcription, original 32×8 table entries and solved p56/p57 reference. It freezes the existing address operation and asserts all four terminal counts, the top-three label frequencies, the 27 adjacent pairs, 14 identical pairs, and p55's independently reported three endpoints. It never generates plaintext from an unsolved target.

A useful successor needs an **independent, authenticated source-selection rule** that specifies which of the graph's origins or terminal labels is intended to carry a *key, ciphertext input, or original decoder instruction*, followed by a frozen prediction on original unknown rune positions. Repeating word-graph hops, imposing English after seeing endpoints, or relabeling the same three solved destinations will not recover LP2 plaintext.
