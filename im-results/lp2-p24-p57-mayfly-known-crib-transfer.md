# Mayfly artwork bridge: original p24 to known p57

**Status:** bounded original-input negatives, 18 November 2026, Agent29. No unknown LP2 plaintext or authenticated key recovered.

## Independently selected receiver and donor

Original LP2 page24 (physical `41.jpg`, 270 unknown runes) has two mayfly-like insects along its text margins. Solved page57 (physical `74.jpg`, 95 clear runes) shows a dissolving mayfly below the plaintext PARABLE. The art relationship was already known from a GIMP forward model ([existing reproducer](../sims/lp2_p57_gimp_multiscale_source_sft.py); [existing source-art assessment](lp2-p57-native-layer-master-archive-source-gate.md)). This connection independently identifies **which unknown ciphertext to test against which known plaintext**. It says nothing by itself about a key transformation.

We tested three finite, historically intelligible additive GP29 receivers without optimizing source keys for English:

1. Repeating the 95 p57 GP indices and their GP-prime residues modulo29 as an additive/subtractive key on p24. The artwork's left/right reflection motivates both donor orientations.
2. Granting an **arbitrary 95-symbol secret pad** inferred from an exact known p57 crib at either end of p24, with all 175 uncribbed runes as an untouched holdout. The 95 training symbols do not count as evidence.
3. Reusing Cicada's **authenticated p56 plaintext-F literal bypass** with the above p57 keys. In this mode, plaintext F emits ciphertext F and consumes *no* key symbol, while a ciphertext F may instead be an encrypted non-F symbol. A complete dynamic program retains every possible key-clock position at each source rune. Decoding is rejected only if **no legal path** remains, regardless of language. This is strictly the specified source-clock model, rather than a generic challenge to skip encodings.

## Complete original-input outcomes

Native GP29 normalized IoC: p24 ciphertext **0.963872**, authenticated clear p57 **1.818589**. All eight direct signed/directional key attempts remain unreadable, with normalized IoC **0.963073–1.045326**.

| Clear p57 crib direction | Placement in p24 | Untouched runes | Untouched GP29 IoC |
|---|---|---:|---:|
| Forward | First 95 | 175 | 0.967619 |
| Forward | Final 95 | 175 | 1.030476 |
| Reversed | First 95 | 175 | 0.994286 |
| Reversed | Final 95 | 175 | 1.017143 |

All four arbitrary-key holdouts remain unreadable and have near-uniform symbol frequencies.

The **literal-F skip-aware decoder** is mathematically impossible on complete p24 under every one of the eight declared source keys and signs. Each entry below is the number of **complete original p24 runes that admit at least one legal plaintext/key-clock path**, before the next rune kills every path.

| Key register from p57 | Forward key, sign − / + | Reversed key, sign − / + |
|---|---|---|
| GP rune index | **11 / 22** | **11 / 14** |
| GP-prime residue mod29 | **202 / 76** | **23 / 22** |

The strongest **zero-phase** source-derived skip-history reaches only **202 of the original 270** p24 runes. This is an exact finite algebraic failure of the unrotated key, independent of natural-language scores. We then granted the entire 95-position donor rotation family, rather than proposing additional unmotivated offsets:

- **760** complete decoder hypotheses (95 cyclic source-key phases × GP/prime register × mirrored/forward × ±) were exhausted with every ambiguous ciphertext F history retained independently.
- **18/760 phase assignments** permit any complete 270-rune original inverse, with **89** distinct complete plaintext/key-clock histories; 742 phases are impossible even before scoring.
- The **maximum normalized original plaintext IoC is 1.050916** (GP-index reversed donor, sign−, phase58), versus **1.818589** for independently known clear GP p57. Every possible original completion remains near uniform and nonlinguistic. A native-GP planted 270-rune skip-aware decoder passes, so this result bounds the fixed-key source pairing without assuming skip positions.

The phase-complete result is a frequency/legibility rejection under ordinary GP-native prose, **not** a proof of algebraic impossibility for all phases and not an exclusion of languages or registers with near-uniform rune frequencies.

## Reproduction and decision

[Complete standalone Node22 CommonJS SFT](../sims/lp2_p24_p57_mayfly_keygate_sft.cjs) reads unchanged `resources/liber-primus/lp2-corpus.json`, prints all original outcomes and asserts finite rejections. It passes locally under Node22 using the exact GP-index values of source pp24/56/57, a **270/270** planted direct-key inverse, **175/175** planted inferred-crib-key holdout inverse, and a **270/270** planted literal-F bypass feasibility positive. It additionally asserts 760 source-derived phase tests, 18 viable phases, 89 distinct legal full histories, and maximum original output IoC below 1.06. All three controls separate implementation correctness from a claim of historical plaintext.

**Decision:** The direct GP ordinal, prime-residue additive transfer, full period95 secret-pad crib, and historically authentic literal-F-transparent receiver over every 95-position original donor phase are rejected as ordinary GP-native plaintext decoders. Retire only these original-source consumers. The image pairing does not establish a key, an original editor's private image layer, a changing-state cipher, or any ciphertext-derived map to decoded runes. Independently specified nonlinear operations or recovered original editing assets could justify a different experiment. No p24 plaintext or final destination was discovered.

The artwork provenance predates this run. The new work is limited to these original ciphertext decipherment tests.
